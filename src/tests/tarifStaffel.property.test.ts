// ─── Property-Tests für die Tarif-Staffel-Engine (fast-check) ───────────────
//
// Werkzeug-Audit Nulltarif-Paket §Audit-1 (ADOPT fast-check). Ergänzt die
// beispielbasierten Tests (tarifStaffel.test.ts) und das Grid-Gate
// (tarifInvarianten.test.ts) um zufallsgetriebene Eigenschaften über die
// GELADENEN echten Tarife (Beurkundung + Grundbuch). fast-check schrumpft
// Gegenbeispiele auf den kleinsten Fall — besonders wertvoll an Bandgrenzen,
// wo der reale Off-by-one-Bug (bisChf ±0.01 im falschen Band) sass.
//
// §2 Determinismus: fester Seed (configureGlobal) → jeder Lauf reproduziert
// exakt dieselben Fälle. KEINE Engine-Änderung; die Eigenschaften prüfen die
// bestehende Semantik. Wird eine Property real rot, ist das ein Rechen-Befund
// (§1), NICHT ein Grund, die Property abzuschwächen.
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { auswertenTarif, type TarifRegel, type TarifErgebnis } from '../lib/tarif/staffel';
import { tarifFuer, berechneBeurkundung } from '../lib/beurkundung';
import { GESCHAEFTSART_IDS } from '../data/tarif/beurkundung-typen';
import { tarifFuerGb, berechneGrundbuchgebuehr } from '../lib/grundbuchgebuehren';
import { GB_EINTRAGSART_IDS } from '../data/tarif/grundbuch-typen';
import { KANTONE, type KantonCode } from '../data/tarif/typen';
import { SONDERTARIFE, GRUNDSTUECKKAUF_BEURKUNDUNG } from '../data/tarif/beurkundung';
import { GRUNDBUCH_EIGENTUM_KAUF, GRUNDBUCH_EINTRAG } from '../data/tarif/grundbuch';

// Fester Seed → deterministische, reproduzierbare Fälle (§2). numRuns bewusst
// erhöht: der Wertebereich (0 … 100 Mio) ist gross, Bandgrenzen selten.
fc.configureGlobal({ seed: 20260703, numRuns: 300 });

const MAX_WERT = 100_000_000;

// ─── Korpus: alle real geladenen Tarifregeln (Beurkundung + Grundbuch) ────────
function alleRegeln(): { label: string; regel: TarifRegel }[] {
  const out: { label: string; regel: TarifRegel }[] = [];
  const add = (label: string, t: { regel: TarifRegel }) => out.push({ label, regel: t.regel });
  for (const [art, perKt] of Object.entries(SONDERTARIFE))
    for (const [kt, t] of Object.entries(perKt as Record<string, { regel: TarifRegel }>)) add(`B ${art}/${kt}`, t);
  for (const [kt, t] of Object.entries(GRUNDSTUECKKAUF_BEURKUNDUNG as Record<string, { regel: TarifRegel }>)) add(`Kauf-Beurk/${kt}`, t);
  for (const [kt, t] of Object.entries(GRUNDBUCH_EIGENTUM_KAUF as Record<string, { regel: TarifRegel }>)) add(`Kauf-GB/${kt}`, t);
  for (const [art, perKt] of Object.entries(GRUNDBUCH_EINTRAG))
    for (const [kt, t] of Object.entries(perKt as Record<string, { regel: TarifRegel }>)) add(`G ${art}/${kt}`, t);
  return out;
}
const REGELN = alleRegeln();

/** Numerischer Fingerabdruck eines Ergebnisses (ignoriert die schritte/hinweis-
 *  Prosa, die den Bandgrenz-Wert im Klartext trägt — verglichen wird nur der
 *  BERECHNETE Betrag bzw. die Spanne). */
type Fp = { det: true; betrag: number } | { det: false; von: number | undefined; bis: number | undefined };
function fp(e: TarifErgebnis): Fp {
  return e.deterministisch ? { det: true, betrag: e.betragChf } : { det: false, von: e.vonChf, bis: e.bisChf };
}

// ─── Property 1: Determinismus (§2) ──────────────────────────────────────────
describe('Staffel-Engine — Determinismus (f(x) == f(x))', () => {
  it('gleiche Eingabe liefert byte-gleiches Ergebnis (inkl. schritte)', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: REGELN.length - 1 }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        (i, x) => {
          const r = REGELN[i].regel;
          expect(auswertenTarif(r, x)).toEqual(auswertenTarif(r, x));
        },
      ),
    );
  });
});

// ─── Property 2: Monotonie (mehr Wert → nie kleinerer Tarif) ──────────────────
// Gilt für die DETERMINISTISCHEN Ergebnisse der echten Tarife (die Norm gibt
// eine mit dem Wert nicht sinkende Gebühr vor — das Grid-Gate belegt es an
// Stützpunkten; hier zufällig, dichter an den Bandgrenzen). Nicht-deterministische
// Rahmen (Ermessen) werden übersprungen (kein Punktwert zu vergleichen).
describe('Staffel-Engine — Monotonie der deterministischen Tarife', () => {
  it('kein deterministischer Betrag sinkt bei steigendem Bemessungswert', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: REGELN.length - 1 }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        (i, a, b) => {
          const { label, regel } = REGELN[i];
          const lo = Math.min(a, b), hi = Math.max(a, b);
          const eLo = auswertenTarif(regel, lo);
          const eHi = auswertenTarif(regel, hi);
          if (!eLo.deterministisch || !eHi.deterministisch) return; // Rahmen → überspringen
          // Toleranz 0.5 (Rundungsrappen), wie im Grid-Gate.
          expect(eHi.betragChf, `${label}: f(${hi})=${eHi.betragChf} < f(${lo})=${eLo.betragChf}`).toBeGreaterThanOrEqual(eLo.betragChf - 0.5);
        },
      ),
    );
  });
});

// ─── Property 2b: Monotonie über die KONKRETE Nutzung (Engine end-to-end) ─────
describe('Konkrete Nutzung — Beurkundung/Grundbuch monoton (deterministisch)', () => {
  it('Beurkundung: kein deterministischer Betrag sinkt bei steigendem Geschäftswert', () => {
    const arten = GESCHAEFTSART_IDS.filter((a) => a !== 'grundstueckkauf');
    fc.assert(
      fc.property(
        fc.constantFrom(...arten),
        fc.constantFrom(...(KANTONE as readonly KantonCode[])),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        (art, kanton, a, b) => {
          if (!tarifFuer(art, kanton)) return;
          const lo = Math.min(a, b), hi = Math.max(a, b);
          const eLo = berechneBeurkundung({ geschaeftsart: art, kanton, geschaeftswertCHF: lo }).posten!.ergebnis;
          const eHi = berechneBeurkundung({ geschaeftsart: art, kanton, geschaeftswertCHF: hi }).posten!.ergebnis;
          if (!eLo.deterministisch || !eHi.deterministisch) return;
          expect(eHi.betragChf, `B ${art}/${kanton}: f(${hi})=${eHi.betragChf} < f(${lo})=${eLo.betragChf}`).toBeGreaterThanOrEqual(eLo.betragChf - 0.5);
        },
      ),
    );
  });

  it('Grundbuch: kein deterministischer Betrag sinkt bei steigendem Wert', () => {
    const arten = GB_EINTRAGSART_IDS.filter((a) => a !== 'eigentum_kauf');
    fc.assert(
      fc.property(
        fc.constantFrom(...arten),
        fc.constantFrom(...(KANTONE as readonly KantonCode[])),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        (art, kanton, a, b) => {
          if (!tarifFuerGb(art, kanton)) return;
          const lo = Math.min(a, b), hi = Math.max(a, b);
          const eLo = berechneGrundbuchgebuehr({ eintragsart: art, kanton, wertCHF: lo }).posten!.ergebnis;
          const eHi = berechneGrundbuchgebuehr({ eintragsart: art, kanton, wertCHF: hi }).posten!.ergebnis;
          if (!eLo.deterministisch || !eHi.deterministisch) return;
          expect(eHi.betragChf, `G ${art}/${kanton}: f(${hi})=${eHi.betragChf} < f(${lo})=${eLo.betragChf}`).toBeGreaterThanOrEqual(eLo.betragChf - 0.5);
        },
      ),
    );
  });
});

// ─── Property 3: Bandgrenzen (Off-by-one-Fänger) ─────────────────────────────
// Für jede Staffel-Regel mit expliziten Bändern: an JEDER endlichen Bandgrenze
// muss die Engine das per Norm-Semantik korrekte Band wählen. Als unabhängiges
// Orakel dient die Engine selbst über eine EINBANDIGE Regel (das Band bis
// Infinity ausgedehnt) — so wird die Band-AUSWAHL isoliert (die Formel im Band
// bleibt identisch, verglichen wird nur der Betrag/Spanne, nicht die Prosa).
//   · inklusiv (staffel_inklusiv/-sockel_prozent/-voll_prozent/-rahmen, «<=»):
//     an der Grenze B gilt Band i; knapp darüber (B+ε) Band i+1.
//   · exklusiv (staffel_exklusiv, «<»): an der Grenze B gilt Band i+1; knapp
//     darunter (B−ε) Band i.
const EPS = 0.01;
type Staffelig = Extract<TarifRegel, { baender: unknown[] }>;
const grenzeVon = (b: unknown): number => (b as { bisChf?: number; grenzeChf?: number }).bisChf ?? (b as { grenzeChf: number }).grenzeChf;

/** Baut aus einer mehrbandigen Regel eine EINBANDIGE (Grenze → Infinity),
 *  regel-weite Felder (Aufschlag) bleiben erhalten. */
function einBand(regel: Staffelig, band: unknown): TarifRegel {
  const feld = regel.typ === 'staffel_rahmen' ? 'grenzeChf' : 'bisChf';
  const nur = { ...(band as object), [feld]: Infinity };
  return { ...regel, baender: [nur] } as unknown as TarifRegel;
}

describe('Staffel-Engine — Bandgrenzen wählen das korrekte Band (Off-by-one)', () => {
  it('an jeder endlichen bisChf/grenzeChf landet f(bis) und f(bis±0.01) im richtigen Band', () => {
    const fehler: string[] = [];
    for (const { label, regel } of REGELN) {
      if (!('baender' in regel) || !Array.isArray(regel.baender)) continue;
      const r = regel as Staffelig;
      const baender = r.baender;
      const exklusiv = r.typ === 'staffel_exklusiv';
      for (let i = 0; i < baender.length; i++) {
        const B = grenzeVon(baender[i]);
        if (!Number.isFinite(B)) continue;          // oberstes Band: keine obere Grenze
        if (i + 1 >= baender.length) continue;      // keine Nachbarband-Referenz
        const naechste = grenzeVon(baender[i + 1]);
        // ε darf die nächste Grenze nicht überspringen (reale Tarife: Grenzen weit
        // auseinander → immer erfüllt; Guard nur zur Sicherheit).
        if (Number.isFinite(naechste) && naechste - B <= EPS) continue;
        if (exklusiv) {
          // an B → Band i+1; knapp darunter → Band i
          erwarte(fehler, `${label} exkl @${B}`, regel, B, einBand(r, baender[i + 1]));
          if (B - EPS > (i > 0 ? grenzeVon(baender[i - 1]) : -Infinity))
            erwarte(fehler, `${label} exkl @${B}-ε`, regel, B - EPS, einBand(r, baender[i]));
        } else {
          // an B → Band i; knapp darüber → Band i+1
          erwarte(fehler, `${label} inkl @${B}`, regel, B, einBand(r, baender[i]));
          erwarte(fehler, `${label} inkl @${B}+ε`, regel, B + EPS, einBand(r, baender[i + 1]));
        }
      }
    }
    expect(fehler, `\n${fehler.join('\n')}`).toEqual([]);
  });
});

function erwarte(fehler: string[], wo: string, voll: TarifRegel, x: number, orakel: TarifRegel): void {
  const a = fp(auswertenTarif(voll, x));
  const b = fp(auswertenTarif(orakel, x));
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    fehler.push(`${wo}: f(${x}) = ${JSON.stringify(a)} ≠ erwartetes Band ${JSON.stringify(b)}`);
  }
}

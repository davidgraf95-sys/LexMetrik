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

// ─── Property 4: Stetigkeit / Sprung-Dokumentation an der abChf-Kante (§8) ─────
// Geschützte Rechtsregel: An der Schwelle `abChf` (ab der der Prozentsatz auf den
// Überschuss greift) darf die Grundgebühr KEINEN stillen Sprung machen. Die
// Norm sieht entweder eine STETIGE Grundgebühr vor (unterhalb wie an der Schwelle
// derselbe Sockel — der Marginalanteil ist 0) ODER — wo der Tarif unterhalb der
// Schwelle eine behördliche Ermessens-Spanne kennt (§8, `unterAbRahmen`/regel-
// weiter Aufschlag) — einen EHRLICH AUSGEWIESENEN Rahmen. Ein deterministischer
// Abwärts-/Aufwärtssprung ohne ausgewiesenen Rahmen wäre ein erfundener Wert.
// Diese Property prüft die Hinweis-SPRACHE mit (nicht nur die Zahl): unterhalb
// der Kante muss der Hinweis den Rahmen/die Schwelle benennen — genau die
// Lektion, dass die Dokumentation Teil der Invariante ist.
// Generator-Raum: erschöpfend über JEDE reale abChf-Kante aller geladenen
// sockel_prozent- und staffel_sockel_prozent-Tarife (Band isoliert auf [0,∞)).
function pruefeKante(fehler: string[], wo: string, regel: TarifRegel, ab: number): void {
  if (ab - EPS < 0) return;
  const unten = auswertenTarif(regel, ab - EPS);
  const an = auswertenTarif(regel, ab);
  if (unten.deterministisch && an.deterministisch) {
    if (Math.abs(unten.betragChf - an.betragChf) > 0.5)
      fehler.push(`${wo}: stiller Sprung f(${ab}−ε)=${unten.betragChf} → f(${ab})=${an.betragChf} (|Δ|>0.5) ohne ausgewiesenen Rahmen`);
  } else if (!unten.deterministisch) {
    const h = unten.hinweis ?? '';
    if (!/Rahmen|unter|Ermessen/i.test(h))
      fehler.push(`${wo}: unterhalb der Kante nicht-deterministisch, aber der Hinweis benennt weder Rahmen noch Schwelle: «${h}»`);
  }
}

describe('Staffel-Engine — Stetigkeit an der abChf-Kante (kein stiller Sprung, §8)', () => {
  it('an jeder abChf ist die Grundgebühr stetig ODER unterhalb ein dokumentierter Rahmen', () => {
    const fehler: string[] = [];
    for (const { label, regel } of REGELN) {
      if (regel.typ === 'sockel_prozent' && (regel.abChf ?? 0) > 0) {
        pruefeKante(fehler, `${label} @${regel.abChf}`, regel, regel.abChf!);
      } else if (regel.typ === 'staffel_sockel_prozent') {
        for (const band of regel.baender) {
          const ab = (band as { abChf: number }).abChf;
          if (!(ab > 0) || !Number.isFinite(ab)) continue;
          // Band auf [0,∞) isolieren, damit die Kante NICHT von einer
          // Nachbarband-Grenze überlagert wird (Aufschlag-Felder bleiben).
          pruefeKante(fehler, `${label} Band@${ab}`, einBand(regel as Staffelig, band), ab);
        }
      }
    }
    expect(fehler, `\n${fehler.join('\n')}`).toEqual([]);
  });
});

// ─── Property 5: Ermessens-Spanne nie invertiert (Rahmen-Invarianten) ─────────
// Geschützte Rechtsregel: Eine ehrliche Gebühren-SPANNE [von, bis] hat immer
// von ≤ bis — eine invertierte Spanne (Untergrenze über Obergrenze) wäre in der
// UI sinnlos/irreführend. Konkret schützt das die §8-Konstruktionen
// `unterAbRahmen` (Rahmen [minChf, sockelChf] → minChf ≤ sockelChf) und den
// regel-weiten Aufschlag (aufschlagVon ≤ aufschlagBis), sowie jede aus
// staffel_rahmen/rahmen erzeugte Spanne.
// Generator-Raum: (a) generativ über alle Regeln × Zufallswert 0…100 Mio für die
// AUSGEGEBENE Spanne; (b) erschöpfend strukturell über die Rohdaten.
describe('Staffel-Engine — Ermessens-Spanne nie invertiert (vonChf ≤ bisChf)', () => {
  it('kein nicht-deterministisches Ergebnis liefert vonChf > bisChf', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: REGELN.length - 1 }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        (i, x) => {
          const { label, regel } = REGELN[i];
          const e = auswertenTarif(regel, x);
          if (e.deterministisch) return;
          if (typeof e.vonChf === 'number' && typeof e.bisChf === 'number')
            expect(e.vonChf, `${label}: von ${e.vonChf} > bis ${e.bisChf} @${x}`).toBeLessThanOrEqual(e.bisChf);
        },
      ),
    );
  });

  it('strukturell: unterAbRahmen-Band hat minChf ≤ sockelChf; Aufschlag von ≤ bis', () => {
    const fehler: string[] = [];
    for (const { label, regel } of REGELN) {
      if (regel.typ !== 'staffel_sockel_prozent') continue;
      if (regel.aufschlagBisChf != null && (regel.aufschlagVonChf ?? 0) > regel.aufschlagBisChf)
        fehler.push(`${label}: aufschlagVon ${regel.aufschlagVonChf} > aufschlagBis ${regel.aufschlagBisChf}`);
      for (const b of regel.baender) {
        const bb = b as { unterAbRahmen?: boolean; minChf?: number; sockelChf: number; abChf: number };
        if (bb.unterAbRahmen && bb.minChf != null && bb.minChf > bb.sockelChf)
          fehler.push(`${label} Band@${bb.abChf}: unterAbRahmen minChf ${bb.minChf} > sockelChf ${bb.sockelChf} — Rahmen invertiert`);
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});

// ─── Property 6: Rundungs-Invarianz (Rappen-genau, reproduzierbar) ────────────
// Geschützte Rechtsregel/§2: Jeder ausgewiesene CHF-Betrag ist bereits auf den
// Rappen gerundet (round2-idempotent) und endlich ≥ 0. Ein sub-Rappen-Rest würde
// die Anzeige/Reproduzierbarkeit determinismus-brechend machen (verschiedene
// Rundung bei Anzeige vs. Weiterrechnung). Fängt insbesondere rohe, ungerundete
// Werte aus Daten-Klammern (minChf/maxChf) oder Formelpfaden.
// Generator-Raum: generativ über alle Regeln × Zufallswert 0…100 Mio.
describe('Staffel-Engine — Rundungs-Invarianz (rappengenau)', () => {
  const rappengenau = (x: number): boolean => Math.round(x * 100) / 100 === x;
  it('jeder CHF-Betrag/jede Spannen-Grenze ist rappengenau und endlich ≥ 0', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: REGELN.length - 1 }),
        fc.double({ min: 0, max: MAX_WERT, noNaN: true, noDefaultInfinity: true }),
        (i, x) => {
          const { label, regel } = REGELN[i];
          const e = auswertenTarif(regel, x);
          if (e.deterministisch) {
            expect(Number.isFinite(e.betragChf) && e.betragChf >= 0, `${label}: Betrag ${e.betragChf} nicht endlich/≥0 @${x}`).toBe(true);
            expect(rappengenau(e.betragChf), `${label}: Betrag ${e.betragChf} nicht rappengenau @${x}`).toBe(true);
          } else {
            for (const g of [e.vonChf, e.bisChf])
              if (typeof g === 'number')
                expect(rappengenau(g), `${label}: Spannen-Grenze ${g} nicht rappengenau @${x}`).toBe(true);
          }
        },
      ),
    );
  });
});

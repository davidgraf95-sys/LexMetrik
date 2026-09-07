// ─── IA-7 · Erlass-Zahl-Badges an den 26 Sidebar-Kantonslinks (W2·5d §11.5) ──
//
// Verriegelt die SSoT-Kette (§5, KEINE zweite Zähl-Wahrheit):
//   register.json → gen:zaehler (kantonErlassZahlen, Drift-Tor check:zaehler)
//   → navigation.ts (zahl + ariaLabel je Kantonslink)
//   → erfassungsgrad.ts (Zustands-Wort, IA-2-SSoT — hier nur KONSUMIERT).
// Die Badge-Zahl wird nirgends zweitgezählt; das Zustands-Wort kommt aus
// STUFE_WORT (IA-2-Entscheid), der 0-Fall trägt «keine Erlasse» (O4/IA-3-
// Wortlaut, AzRegister/SchweizKarte). Bestehende navigation.test.ts bleibt
// unangetastet (§6.3) — diese Datei ist der NEUE, fachliche IA-7-Beweis.
import { describe, expect, it } from 'vitest';
import { NAVIGATION, type NavGruppe, type NavLink } from '../lib/navigation';
import { KANTONE, KANTON_NAMEN } from '../data/tarif/typen';
import { STARTSEITE_ZAEHLER } from '../data/startseiteZaehler.generated';
import { erfassungsgrad, STUFE_WORT } from '../lib/normtext/erfassungsgrad';

// D26 (deklariert, §6.3): Positionsindex durch Label-Suche ersetzt — vor den
// Gruppen stehen jetzt die Kernerlasse, und ein Index wäre eine stille Kopplung
// an deren Zahl. Was der Test prüft, ist unverändert.
const kantonGruppe = () =>
  NAVIGATION.find((a) => a.titel === 'Gesetze')!.kinder
    .find((k) => k.art === 'gruppe' && k.label === 'Kantone') as NavGruppe;

describe('IA-7 · Sidebar-Kantonsliste-Badges', () => {
  it('der Zähler-SSoT trägt eine Erlass-Zahl je Kanton (Record, deterministisch)', () => {
    const zahlen = STARTSEITE_ZAEHLER.kantonErlassZahlen;
    expect(zahlen).toBeTruthy();
    // Jeder Schlüssel ist ein echtes Kantonskürzel; jede Zahl ist ≥ 1 (ein
    // Manifest-Eintrag existiert ja) und ganzzahlig.
    for (const [kt, n] of Object.entries(zahlen)) {
      expect((KANTONE as readonly string[]).includes(kt), `unbekannter Kanton ${kt}`).toBe(true);
      expect(Number.isInteger(n) && n >= 1, `${kt}: ${n}`).toBe(true);
    }
    // Unabhängige Quer-Referenz (§6.7): die Summe je Kanton muss den EINEN
    // Gesamt-Kantonszähler derselben Generator-Quelle treffen — Register-Stand
    // heute: alle kantonalen Manifest-Einträge sind status 'snapshot', darum
    // ist die Summe == gesetzeKantonVolltext. Läuft das auseinander (künftige
    // Nicht-Snapshot-Kantonseinträge), muss dieser Test BEWUSST angepasst und
    // die Zählregel neu deklariert werden — kein stilles Drift.
    const summe = Object.values(zahlen).reduce((a, b) => a + b, 0);
    expect(summe).toBe(STARTSEITE_ZAEHLER.gesetzeKantonVolltext);
  });

  it('alle 26 Kantonslinks tragen zahl aus dem Zähler-SSoT (keine zweite Zähl-Wahrheit)', () => {
    const kinder = kantonGruppe().kinder as NavLink[];
    expect(kinder).toHaveLength(KANTONE.length);
    for (const l of kinder) {
      const kt = new URLSearchParams(l.ziel.split('?')[1]).get('kt')!;
      const erwartet = STARTSEITE_ZAEHLER.kantonErlassZahlen[kt] ?? 0;
      expect(l.zahl, `${l.label} (${kt})`).toBe(erwartet);
    }
  });

  it('ariaLabel = Name + Zahl + Zustands-Wort aus erfassungsgrad.ts (O4-Muster, nie nur Farbe)', () => {
    const kinder = kantonGruppe().kinder as NavLink[];
    for (const l of kinder) {
      const kt = new URLSearchParams(l.ziel.split('?')[1]).get('kt')!;
      const n = STARTSEITE_ZAEHLER.kantonErlassZahlen[kt] ?? 0;
      const wort = STUFE_WORT[erfassungsgrad(kt, n).stufe];
      const mengen = n === 0 ? 'keine Erlasse' : `${n} ${n === 1 ? 'Erlass' : 'Erlasse'}`;
      // Identitäts-Treffer (voller Wortlaut), keine Substring-Präsenz (§7).
      const name = KANTON_NAMEN[kt as keyof typeof KANTON_NAMEN];
      expect(l.ariaLabel, `${l.label} (${kt})`).toBe(`${name} — ${mengen}, ${wort}`);
    }
  });

  it('0-Fall: Ableitung liefert Badge «0» + «keine Erlasse, dünn» (IA-2-/O4-Entscheid, §8)', () => {
    // Kein Kanton hat heute 0 — der 0-Pfad wird über die pure Ableitung selbst
    // bewiesen (erfassungsgrad ist rein, §2): n=0 → Stufe «dünn».
    const g = erfassungsgrad('XX', 0);
    expect(g.stufe).toBe('duenn');
    expect(STUFE_WORT[g.stufe]).toBe('dünn');
  });

  // D26 (deklariert, §6.3): der Geltungsbereich ist jetzt AUSDRÜCKLICH der
  // Abschnitt «Gesetze». Rechtsprechung und Materialien tragen seit D26 selbst
  // Zahlen (Entscheide je Sachgebiet, Materialien je Behörde) — ein Test, der
  // «nur die Kantone haben Badges» app-weit behauptete, wäre damit falsch
  // geworden. Innerhalb der Gesetze gilt die Aussage unverändert: die
  // Kernerlasse und die International-Rubriken bleiben zahllos, weil für sie
  // keine gezählte Menge existiert, die man ehrlich nennen könnte (§8).
  it('im Abschnitt Gesetze trägt NUR die Kantonsliste Badges', () => {
    const gesetze = NAVIGATION.find((a) => a.titel === 'Gesetze')!.kinder;
    for (const k of gesetze) {
      if (k.art === 'link') { expect(k.zahl, `Gesetze › ${k.label}`).toBeUndefined(); continue; }
      if (k.label === 'Kantone') continue;
      for (const kk of k.kinder) {
        if (kk.art === 'link') expect(kk.zahl, `${k.label} › ${kk.label}`).toBeUndefined();
      }
    }
  });
});

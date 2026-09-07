// ─── Leser-eigene Schriftskala (David-Anmerkung 16.8.2026, Punkt 4) ──────────
//
// BEFUND: «Schriftgrössen-Regler wirkt auf die ganze Seite.» Der Regler im
// V3-Optionsmenü bediente den GLOBALEN App-Steller (`components/layout/
// useSchriftskala.ts`), der `font-size` am `<html>` setzt. Weil sämtliche
// Typo-Tokens rem-basiert sind (§13), wuchs damit alles mit: Topbar, Kopfzeile
// des Lesers, Seitenleiste, Gliederung. Gemessen am 16.8.2026 im Leser der StPO:
// drei Klicks «A+» hoben `<html>` von 16 px auf 20.8 px und die Kopfzeile
// gleich mit (16 px → 20.8 px).
//
// DEKLARIERTE UMKEHR der H1-Abweichung «A-1 Schriftgrössen-Regler»: dort war der
// Anschluss an den globalen Store bewusst gewählt, weil ein Leser-eigener Regler
// eine eigene Normtext-Grösse voraussetzt und H1 den Normtext byte-gleich halten
// musste. Beides gilt weiterhin — nur wird die Normtext-Grösse jetzt hier
// eingeführt, und zwar so, dass die VORGABESTUFE gar keine CSS-Regel emittiert
// (R6): `data-leserschrift="normal"` ist ein No-op, der Normtext bleibt in der
// Vorgabestufe exakt `text-body-l` = 1.125 rem. Die Treue-Grenze «die
// Vorgabestufe verändert die gerenderte Normtext-Grösse nicht» ist damit nicht
// nur eingehalten, sondern konstruktiv unverletzbar.
//
// ARBEITSTEILUNG:
//   · `leserOptionen.ts` — Persistenz (Feld `schrift` im geteilten Store
//     `lm.leser.optionen`, §5: EIN Speicher für V1 und V3), Whitelist-Prüfung,
//     `data-leserschrift` am <html>.
//   · `index.css`        — die EINE Regel, die das Attribut auswertet; gescopt
//     auf `.lc-leser .nt-art-cv`, also auf den Normtext der Lesespalte. Kopfzeile
//     und Seitenleiste liegen zwar ebenfalls innerhalb `.lc-leser`, aber
//     ausserhalb `.nt-art-cv` — sie werden nicht erfasst.
//   · diese Datei        — der Regler: Stufe rauf/runter, Anschläge, Anzeigewert.
//
// Der GLOBALE Steller bleibt unverändert bestehen und weiterhin über die Topbar
// bedienbar. Er beantwortet eine andere Frage («die ganze Anwendung ist mir zu
// klein», Barrierefreiheit/WCAG 1.4.4) als der Regler im Lesewerkzeug («der
// Gesetzestext ist mir zu klein»). Zwei Fragen, zwei Steller — keine zweite
// Wahrheit für dieselbe Frage (§5).

import { SCHRIFT_STUFEN, setzeLeserSchrift, useLeserSchriftStufe, type LeserSchrift } from './leserOptionen';

/**
 * Normtext-Grösse je Stufe in rem. **Gespiegelt in `src/index.css`** (Block
 * «LESER-SCHRIFTSKALA») — dort stehen dieselben Werte als
 * `--lm-leser-schrift`. Zwei Stellen, weil die Zahlen hier nur den
 * ANZEIGEWERT «xxx %» speisen und dort die eigentliche Darstellung; die
 * Vitest-Datei `src/tests/leser-schriftskala.test.ts` prüft die Spiegelung
 * gegen die CSS-Datei, damit die beiden nicht auseinanderlaufen können (§5).
 *
 * `normal` = 1.125 rem ist KEIN frei gewählter Wert, sondern exakt die
 * Fliesstext-Stufe `leser-text` aus tailwind.config.js — die Grösse, die der
 * Leser ohne Regler zeigt.
 *
 * W2·24-R6c: die Basis stand von S2 (F3 = V2, David 17.8.2026) bis R6b auf
 * 1.0625 rem (17 px); D20 (c) hebt sie auf 1.125 rem (18 px). Die FAKTOREN
 * bleiben unangetastet — nur ihre Basis wandert, damit der Regler nicht
 * kollabiert (die alte Stufe «mittel» wäre über der neuen Basis auf 102 %
 * gefallen; Herleitung: `abnahme/design-identitaet/R6-NACHZUG.md` §4).
 *
 * S2 · A-1-NACHZUG: die drei Oberstufen sind die FAKTOREN der Design-Grundlage
 * Kap. 2.3 auf dieser Basis — `[1.0, 1.08, 1.18, 1.3]`, Entscheid D-A, Vorbild
 * `EntscheidLeser.tsx:204`. Bis S2 lief die Skala auf `[1.0, 1.111, 1.222,
 * 1.333]`; die Grundlagen-Faktoren waren nicht anwendbar, weil die Vorgabestufe
 * am SITE-weiten `body-l` hing und H1/H2 den Normtext byte-gleich halten
 * mussten. Mit `leser-text` hat der Leser eine eigene Basis — der Regler läuft
 * damit auf EINER Quelle, ohne zweiten Speicher; V1 bleibt unberührt, weil die
 * Regel in `index.css` auf das V3-Root gescopt ist (FL-4).
 */
export const SCHRIFT_REM: Readonly<Record<LeserSchrift, number>> = {
  normal: 1.125,
  mittel: 1.215,
  gross: 1.3275,
  'sehr-gross': 1.4625,
};

/** Anzeigewert in Prozent, bezogen auf die Vorgabestufe: 100 · 108 · 118 · 130. */
export function schriftProzent(s: LeserSchrift): number {
  return Math.round((SCHRIFT_REM[s] / SCHRIFT_REM.normal) * 100);
}

/**
 * Formgleich zum globalen `Schriftskala` (components/layout/useSchriftskala.ts),
 * damit der Regler im V3-Optionsmenü mit dem Austausch EINER Import-Zeile
 * umgehängt werden kann — die Knopf-Markup bleibt unangetastet.
 */
export interface LeserSchriftskala {
  /** Aktuelle Stufe (Store-Wert). */
  stufe: LeserSchrift;
  /** Anzeigewert in Prozent, z. B. 111. */
  prozent: number;
  /** Eine Stufe grösser (no-op am oberen Anschlag). */
  groesser: () => void;
  /** Eine Stufe kleiner (no-op am unteren Anschlag). */
  kleiner: () => void;
  kannGroesser: boolean;
  kannKleiner: boolean;
}

/** Nachbarstufe in Richtung `richtung`; am Anschlag bleibt es bei `s`. */
export function nachbarStufe(s: LeserSchrift, richtung: 1 | -1): LeserSchrift {
  const i = SCHRIFT_STUFEN.indexOf(s);
  // Eine unbekannte Stufe kann typseitig nicht auftreten; käme sie doch (z. B.
  // aus einem manipulierten Speicher, den `lade()` abgefangen hätte), ist -1
  // der sichere Ausgang: der Regler bewegt sich nicht, statt auf 'sehr-gross'
  // zu springen (`indexOf(-1) + 1 === 0` wäre 'normal', -1 wäre out of range).
  if (i < 0) return s;
  const j = Math.min(SCHRIFT_STUFEN.length - 1, Math.max(0, i + richtung));
  return SCHRIFT_STUFEN[j];
}

/**
 * Der Leser-Schriftregler. Bewusst ohne `useCallback`-Memoisierung: die drei
 * Abonnenten sind zwei Knöpfe und ein Prozent-Label im Optionsmenü, und der
 * Hook re-rendert ohnehin nur bei echter Stufen-Änderung (Primitiv-Selektor,
 * §15) — ein Memo spart hier nichts und verdeckt nur, dass `stufe` in der
 * Abhängigkeit stünde.
 */
export function useLeserSchriftskala(): LeserSchriftskala {
  const stufe = useLeserSchriftStufe();
  const i = SCHRIFT_STUFEN.indexOf(stufe);
  return {
    stufe,
    prozent: schriftProzent(stufe),
    groesser: () => setzeLeserSchrift(nachbarStufe(stufe, 1)),
    kleiner: () => setzeLeserSchrift(nachbarStufe(stufe, -1)),
    kannGroesser: i >= 0 && i < SCHRIFT_STUFEN.length - 1,
    kannKleiner: i > 0,
  };
}

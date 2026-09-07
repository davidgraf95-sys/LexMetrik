import type { CSSProperties } from 'react';
import { kopfHoehe, type KopfStufe } from './kopfStufen';
import { SUCH_H_AKTIV, SUCH_H_RUHE } from './SuchZone';
import { LESEMASS_MAX } from './rahmenSpalten';

// ═══ Die EINE Stelle, an der die Geometrie des Lesers V3 gerechnet wird ══════
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H3-Nachzug C5a, §6.6): der Rahmen soll
// sagen, WO etwas steht — nicht auch noch, welche CSS-Variable aus welcher
// anderen folgt. Der Block war 16 Zeilen JSX-Attribut mit sechs voneinander
// abhängigen Werten und liess sich nur im Browser prüfen; als reine Funktion ist
// er an jeder Kombination von Stufe, Fläche und Such-Zustand nachrechenbar
// (§2/§6.7) — genau das Argument, mit dem `kopfStufen` entstanden ist.
//
// ── RISIKO R1 / LEHRE LM-003, WÖRTLICH MITGENOMMEN ──────────────────────────
// `--leser-kopf-h` behält seine Ist-BEDEUTUNG (Topbar + Pane-Titelleiste). Sie
// umzudeuten hätte das geteilte `GliederungSheet` still verstellt, das daraus
// seine Höhe rechnet (§5: eine Variable, eine Bedeutung). Wer hier eine Zeile
// ändert, verschiebt jeden Artikel-Sprung; die Werte der Such-Zone kommen darum
// aus der Zone selbst (`./SuchZone`, B9) und nicht als Literal von hier.
//
// ── A-2 (David 17.8.2026) · DAS CHROME ÜBER DEM KOPF IST GESCHRUMPFT ────────
// Bis 17.8. stand über der klebenden V3-Kopfzeile die App-Krumen-Leiste (37 px)
// und sagte dasselbe noch einmal; `--leser-v3-kopf-top` und `--nt-stick`
// rechneten sie darum mit. Seit der Leisten-Verschmelzung trägt die Seite ihre
// Kopfzeile selbst (`KopfDaten.kopfzeileSelbst`) und die Leiste entfällt:
//  · EINZELANSICHT — über dem Kopf steht nur noch die Topbar (`APP_TOPBAR_H`).
//  · IM PANE — unverändert: die Pane-Titelleiste bleibt (sie trägt die
//    Fenster-Steuerung, die keine Inhaltsseite tragen kann) und liegt AUSSERHALB
//    des Pane-Scrollers, `--leser-v3-kopf-top` ist dort weiterhin 0.
// `--nt-stick` folgt daraus automatisch — der Sprung-Offset ist genau um die
// weggefallene Leiste kleiner, und das ist der ganze Punkt (Risiko R1: eine
// Quelle für «wie hoch klebt es»). Gemessen 17.8.2026 @1440 StPO: Kopf-Unterkante
// 159 → 122 px, `#art-429` landet auf 120 statt 156.
//
// ── KEIN `imPane` (Fundament-Sonde) ─────────────────────────────────────────
// Das Argument heisst `vollflaechig` und beschreibt eine EIGENSCHAFT DER
// LESEFLÄCHE, nicht ihre Umgebung. Die eine Übersetzung (`!umgebung.imPane`)
// steht im Rahmen — dieselbe Regel und derselbe Grund wie bei `panelForm`
// (Zurückweisung durch die Sonde am 17.8.2026).

/**
 * Höhe der klebenden App-Krone über dem Leser.
 *
 * ── W2·24-R4 · VOM LITERAL ZUM GETEILTEN TOKEN ──────────────────────────────
 * Hier stand bis zum 6.9.2026 `'4rem'` — die Höhe der Titelblatt-Zeile allein.
 * Solange sie das einzige klebende Stück war, war das richtig; mit der
 * Arbeitsleiste aus R2 (`components/layout/Reiterleiste.tsx`, §5a) ist es das
 * nicht mehr. R2 hat die Leiste deshalb im Fluss mitlaufen lassen und den
 * Nachzug ausdrücklich hierher gelegt (R2-Protokoll §2: «aus `APP_TOPBAR_H` ein
 * geteiltes Token machen, dann kann sie kleben»).
 *
 * Die Zahl lebt jetzt in `src/index.css` als `--app-kopf-h` (= `--app-krone-h`
 * + `--app-reiter-h`) und wird von BEIDEN Seiten gelesen: die Leiste klebt auf
 * `--app-krone-h` und ist `--app-reiter-h` hoch, der Leser setzt seinen
 * Kopf-Anschlag und `--nt-stick` aus der Summe. Ein zweites Literal auf einer
 * der beiden Seiten wäre genau die Zahl, die still auseinanderläuft — und der
 * Preis dafür ist nicht theoretisch: sie verschiebt jeden `#art-…`-Sprung.
 *
 * Bewusst KEIN `calc()` hier: der Wert wird ausschliesslich in CSS-Ausdrücke
 * eingesetzt, die die Variable selbst auflösen. Der Fallback deckt den einen
 * Fall ab, in dem die Regel nicht geladen ist (Vitest ohne Stylesheet).
 */
const APP_TOPBAR_H = 'var(--app-kopf-h, 4rem)';
/** Höhe der Pane-Titelleiste (`components/layout/PaneKopf.tsx`, `h-9`). */
const PANE_LEISTE_H = '2.25rem';
/**
 * A-2 · Das reservierte BAND der App-Krumen-Leiste (`h-9`).
 *
 * BUG-CHECK 17.8.2026 (Nachzug): hier stand `calc(2.25rem + 1px)` = 37 px, «h-9
 * plus 1 px Kante». Gemessen sind es **36**: der stille Träger in
 * `components/layout/InhaltsKopf.tsx` trägt `h-9 border-b border-transparent`,
 * und mit `box-sizing: border-box` (Tailwind-Grundlage) liegt die Kante INNEN —
 * die 1 px sind in den 2.25rem enthalten, nicht darüber. Die 37 px gelten nur
 * für die LAUTE Leiste, wo die Kante am äusseren Träger sitzt und die `h-9` an
 * einem Kind. Ein Pixel zu viel verschluckt heisst: der Kopf legt sich einen
 * Pixel höher, als das Band reicht.
 *
 * Die Leiste zeigt unter `kopfzeileSelbst` nichts mehr, BEHÄLT aber ihre Höhe —
 * sonst wandert der ganze Inhalt beim Eintreffen der Meldung 37 px hoch (die
 * Route ist `lazy`, die Shell rät bis dahin; Messung und Tor-Beleg in
 * `components/layout/InhaltsKopf.tsx`). Der Kopf verschluckt das Band statt
 * dessen: sichtbar gewonnen sind die 37 px, gesprungen ist nichts.
 * NUR in der Einzelansicht — im Pane trägt die Titelleiste weiter die
 * Fenster-Steuerung und ist damit kein leeres Band.
 */
const APP_BAND_H = '2.25rem';

export interface LeserGeometrieLage {
  /** Zuschnitt der Kopfzeile (gemessene Breite → `kopfStufe`). */
  stufe: KopfStufe;
  /** Hat der Leser die ganze Seite für sich (Einzelansicht)? */
  vollflaechig: boolean;
  /** Trägt der klebende Kopf-BLOCK die Such-Zone? (Ä19: nur ohne Spalte.) */
  suchZoneKlebt: boolean;
  /** Läuft eine Suche? Die Zone ist dann höher (zweite Zeile mit den Zahlen). */
  sucheAktiv: boolean;
}

/**
 * Die CSS-Variablen am Wurzel-Element des Lesers.
 *
 * Reihenfolge und Werte sind gegenüber dem Zwischenstand UNVERÄNDERT — dies ist
 * eine Auslagerung, keine Änderung (§6: Verhaltensneutralität ist zu beweisen;
 * `leser-v3-kopf-buendig` und `leser-v3-suchfeld-ueberall` messen beide Enden).
 */
export function leserCssVariablen(lage: LeserGeometrieLage): CSSProperties {
  const { stufe, vollflaechig, suchZoneKlebt, sucheAktiv } = lage;
  return {
    '--leser-v3-kopf-h': kopfHoehe(stufe),
    // A-2: in der Einzelansicht klebt der Kopf direkt unter der Topbar — die
    // App-Krumen-Leiste dazwischen gibt es nicht mehr.
    '--leser-v3-kopf-top': vollflaechig ? APP_TOPBAR_H : '0rem',
    '--leser-kopf-h': `calc(${APP_TOPBAR_H} + ${PANE_LEISTE_H})`,
    // Ä19: Höhe der Such-Zone — 0, wo die Leiste als Spalte das Feld trägt.
    // Zwei feste Werte, damit `--nt-stick` unten aus derselben Quelle rechnet.
    // B9: die zwei Werte gehören der Zone (`./SuchZone`), nicht dieser Datei.
    '--leser-v3-such-h': suchZoneKlebt ? (sucheAktiv ? SUCH_H_AKTIV : SUCH_H_RUHE) : '0rem',
    // Ä1: Wrapper-Polsterung, die der Kopf verschluckt. Vorgabe in index.css
    // (Shell `py-8 sm:py-12`); im Pane sind es `py-6` (Pane.tsx).
    ...(vollflaechig ? {} : { '--leser-v3-kopf-luecke': '1.5rem' }),
    // A-2: das zweite, GETRENNT geführte Stück, das der Kopf verschluckt — das
    // reservierte Band der App-Leiste. Getrennt von der Wrapper-Polsterung, weil
    // die beiden verschiedenen Eigentümern gehören und sich verschieden ändern:
    // die Polsterung folgt dem Route-Wrapper und braucht dessen Breakpoint (darum
    // steht sie in `index.css`), das Band folgt der App-Leiste und hängt nur an
    // der Fläche (darum steht es hier). In eine Variable gerechnet wären sie beim
    // nächsten Umbau nicht mehr auseinanderzuhalten (§5).
    '--leser-v3-app-band': vollflaechig ? APP_BAND_H : '0rem',
    '--leser-sub-h': vollflaechig ? '0rem' : 'var(--leser-v3-kopf-h)',
    // Auftrag David 21.8.2026 (`./rahmenSpalten`, LESEMASS_MAX): der Deckel des
    // Lesemasses, EINMAL benannt, von `index.css` gelesen (`#lc-lesespalte`
    // und `.max-w-normtext` im V3-Wurzelbaum). Zustandsunabhängig — anders als
    // die übrigen Variablen hier gilt derselbe Wert in jeder Lage.
    '--leser-lesemass-max': `${LESEMASS_MAX}rem`,
    '--nt-stick': vollflaechig
      ? `calc(${APP_TOPBAR_H} + var(--leser-v3-kopf-h) + var(--leser-v3-such-h))`
      : 'calc(var(--leser-sub-h) + var(--leser-v3-such-h))',
  } as CSSProperties;
}

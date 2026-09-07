import { type ReactNode } from 'react';
import { GruppenKopf } from '../ui/GruppenKopf';

// ─── KontextGruppe · die EINE Gruppen-Hülle des Kontext-Panels ──────────────
//
// Eigene Datei seit dem §6.6-Split vom 9.8.2026: `KontextPanel.tsx` lief mit
// den S7-Ergänzungen über die 800-Zeilen-Schwelle von `check:schlankheit`.
// Der Import-Pfad bleibt über einen Re-Export in `KontextPanel.tsx` erhalten.
//
// Exportiert (V1.3): der EntscheidLeser rendert seine beiden Richtungs-Gruppen
// («Zitierte Normen» / «Zitierte Entscheide») mit DERSELBEN Hülle im Panel —
// eine Anatomie, keine zweite Gruppen-Optik (§5).
export function KontextGruppe({ titel, richtung, anzahl, children, hinweis, punkt, id, rolle = 'liste' }: {
  titel: string;
  /** Beziehungstyp als Text (juris/EUR-Lex-Muster): «Wendet an» u. a.; nie Farbe. */
  richtung?: string;
  /** Zähler hinter dem Titel — für `rolle="liste"` PFLICHT (§1.4). Optional ist
   *  er allein deshalb, weil `rolle="wegweiser"` keine zählbare Menge hat; eine
   *  `liste`-Gruppe ohne Zähler meldet e2e/verzahnung MM1 weiterhin rot. */
  anzahl?: number;
  children: ReactNode;
  hinweis?: ReactNode;
  /** Farb-Wörterbuch V2·C-3 (§4b-B): Familien-Punkt vor dem Gruppentitel —
   *  'norm' = brass (Erlasse/Verweise), 'entscheid' = slate (Rechtsprechung),
   *  'material' = sage (Botschaften/Vernehmlassungen/Soft-Law, kein Gesetzesrang).
   *  Redundant zum Gruppentitel (`aria-hidden`, Farbe trägt NIE allein, §13/F2);
   *  sitzt auf `--paper`. Ohne Prop kein Punkt (Werkzeuge/Revisionen neutral). */
  punkt?: 'norm' | 'entscheid' | 'material';
  /** Sprungziel-Id der Gruppe (S7: der Artikel-Kontext zeigt auf die Werkzeuge). */
  id?: string;
  /**
   * W2·19-GLIEDERUNG/S7 — welche ART von Gruppe ist das?
   *
   * `'liste'` (Default, alle Bestands-Gruppen): löst eine MENGE von Kanten auf
   * und trägt darum die drei Pflicht-Props aus FAHRPLAN-VERZAHNUNG-UI §1.4 —
   * Richtungs-Label, **Zähler** und §8-Hinweis. Der Zähler ist dort die
   * Prüfstand-Angabe («n erfasste Entscheide»): er sagt, wie viel wir gefunden
   * haben, und macht eine Kürzung sichtbar.
   *
   * `'wegweiser'`: zeigt KEINE Menge, sondern feste, benannte Rollen-Zeilen
   * (heute genau eine solche Gruppe: der Artikel-Kontext «Zu Art. X»). Sie hat
   * folgerichtig weder Richtung noch Hinweis — und ein Zähler wäre dort keine
   * Prüfstand-Angabe, sondern entweder konstant (immer vier Zeilen) oder eine
   * Zählung UNSERER EIGENEN Zeilen statt erfasster Einträge. Genau das wäre die
   * unehrliche Zahl, gegen die §8 sich richtet. Die §8-Pflicht wird stattdessen
   * FEINER erfüllt: jede Rolle nennt ihre eigene Zahl oder sagt ausdrücklich,
   * dass nichts erfasst ist.
   *
   * Der Wert steht als `data-kontext-rolle` im DOM, damit e2e/verzahnung MM1
   * die Zähler-Pflicht genau dort prüfen kann, wo sie gilt. Der Default ist
   * bewusst `'liste'`: wer eine neue Listen-Gruppe baut und `anzahl` vergisst,
   * wird weiterhin rot — die Ausnahme muss AUSDRÜCKLICH erklärt werden.
   */
  rolle?: 'liste' | 'wegweiser';
}) {
  const punktKlasse = punkt === 'entscheid' ? 'lc-punkt lc-punkt-entscheid'
    : punkt === 'material' ? 'lc-punkt lc-punkt-material'
    : punkt === 'norm' ? 'lc-punkt' : null;
  return (
    <div id={id} data-kontext-rolle={rolle} className="space-y-2">
      {/* B6 (Bug-Check 9.8.2026): der Höhen-Riegel des Artikel-Kontexts deckelt
          nur den BODY — der Gruppentitel selbst war frei. «Zu {label}» trägt
          aber das amtliche Artikel-Label, und das ist im Anhang-Bestand bis 243
          Zeichen lang (HAUE): der h3 wuchs auf ~8 Zeilen und verschob beim
          Artikelwechsel genau das, was diese Slice ausschliessen wollte
          (§15.2). Der e2e-Pfad kreuzte es nie, weil OR nur Kurzlabels hat —
          eine Pfad-, keine Optik-Lücke.
          `truncate` NUR am Wegweiser: bei einer Listen-Gruppe stünde der Zähler
          am Zeilenende und könnte weggeschnitten werden — MM1 verlangt ihn
          SICHTBAR, und ein unsichtbarer Zähler wäre §8-widrig. Der volle
          Wortlaut bleibt im `title` (kein stiller Verlust). */}
      {/* B3-2 (R3-β, 31.8.2026): der Kopf lief über `ui/GruppenKopf` in seiner
          DICHTEN Gestalt — dieselbe Anatomie wie die sechs Panel-Köpfe des
          Lesers V3, die hier bis dahin je einzeln nachgezeichnet war. Der
          Familien-Punkt ist die `marke` des Bausteins, das Richtungs-Label
          gehört in den Titel (es ist Teil dessen, was die Gruppe SAGT, und muss
          mit ihm zusammen gekappt werden). `text-ink-600` entfällt als
          Utility: es ist die Grundfarbe von `.lc-overline` (index.css:1008),
          wertidentisch. */}
      <GruppenKopf
        dicht
        titel={<>{richtung && <span className="text-brass-700">{richtung} · </span>}{titel}</>}
        zahl={anzahl}
        marke={punktKlasse ? <span className={punktKlasse} aria-hidden /> : undefined}
        title={rolle === 'wegweiser' ? titel : undefined}
        className={rolle === 'wegweiser' ? 'truncate' : undefined}
      />
      {children}
      {/* T2 (Design-Qualitäts-Pass 29.8.2026): der Hinweis-Slot trägt keine
          Halbzeile, sondern zwei bis drei ganze Sätze (Prüfstand-Angabe,
          Methoden-Offenlegung §8) — auf der 11-px-Stufe ungedeckelt gemessen
          92.5 ch/Zeile @1440 (`/gesetze/bund/EMRK`, «Zitierte Entscheide»),
          über der WCAG-Decke SC 1.4.8 (80 ch). `max-w-kleintext` (Herleitung am
          Token in `tailwind.config.js`) + eine Stufe hoch auf `text-xs`
          (Zeilenhöhe 1.2 → 1.4). EIN Slot, alle KontextGruppen (§5). */}
      {hinweis && <p className="max-w-kleintext text-xs text-ink-500">{hinweis}</p>}
    </div>
  );
}

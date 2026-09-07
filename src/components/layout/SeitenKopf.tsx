import type { ReactNode } from 'react';
import { SeitenTitel } from '../ui/SeitenTitel';

// Gemeinsamer Kopf der statischen/Sekundärseiten (Redesign E10): Overline +
// Ablesekante (scale-rule = Marken-Signet) + responsive H1, optional Intro und
// eine Zusatzzeile (z. B. Status-Badge). Löst die zuvor 4× von Hand nachgebauten
// Köpfe ab — die stille Drift (Kontakt hatte die scale-rule verloren, drei
// Schreibweisen fürs Label, ErrorBoundary fiel ganz heraus) verschwindet damit
// an EINER Stelle. Reine Darstellung (§3).
export function SeitenKopf({ overline, ausgabe, titel, intro, children }: {
  /** Etikett ÜBER dem Titel (statische Seiten). Entfällt auf den Übersichten. */
  overline?: string;
  /** D22/R12A: Ausgabe-Zeile UNTER dem Titel (Zähler aus dem Register). */
  ausgabe?: ReactNode;
  titel: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      {/* ── D22 (David 6.9.2026, Bild /gesetze) · DER TITEL STEHT ZUERST ───────
          Die fünf Übersichten trugen ihre Ausgabe-Zeile im `overline`-Feld —
          also ÜBER der H1 und mit der halben Haarlinie (`scale-rule`)
          dazwischen. Gelesen wurde damit zuerst eine Zahlenreihe und erst
          danach der Name des Bereichs; die Haarlinie trennte beide zusätzlich
          in zwei Blöcke («komische Lücken»). Neu: H1 zuerst, Ausgabe-Zeile
          direkt darunter (`ausgabe`), keine Overline, keine Haarlinie.
          Die statischen Seiten (Über, Kontakt, Methodik, Datenschutz,
          Einstellungen, Suche, Abdeckung, Fehlseiten) behalten ihr Etikett
          ÜBER dem Titel — dort benennt es die Rubrik, nicht den Bestand;
          `overline` ist darum optional geworden, nicht abgeschafft. */}
      {overline && <p className="lc-overline">{overline}</p>}
      {overline && <div className="scale-rule max-w-[280px]" aria-hidden />}
      {/* A-1: die H1 kommt aus dem EINEN Titel-Baustein (`ui/SeitenTitel`) —
          ausserhalb eines Panes zeichengleich zum Vorzustand, im Pane
          container-basiert skaliert. */}
      <SeitenTitel>{titel}</SeitenTitel>
      {/* Ausgabe-Zeile: Archivo 13 px, ink-500 (`.ub-ausgabe`, index.css) —
          eine Zeile aus dem Register, kein Erklärsatz (D11/D22 Ziff. 6). */}
      {ausgabe && <p className="ub-ausgabe">{ausgabe}</p>}
      {/* T1/L5 (Design-Qualitäts-Pass 29.8.2026, W2·11-DESIGN): der Lead lief bis
          hierher OHNE Lesespalte über die volle Inhaltsbreite. Gemessen @1440
          (Methode `e2e/leser-lesemass.e2e.ts`: Textlänge / Zeilenkästen):
          `/gesetze` 1072 px = 89.3 ch/Zeile · `/rechtsprechung` 89 ch ·
          `/suche` 105 ch — alle über der WCAG-2.2-Decke SC 1.4.8 (≤ 80 ch) und
          gegen DESIGN-REGLEMENT B2 («volle Fensterbreite für Fliesstext ist
          verboten»). Der NEBENtext unter dem Lead trug `max-w-reading` längst;
          der Lead selbst war die Lücke. EINE Stelle, ~29 Intro-Fundstellen. */}
      {intro && <p className="max-w-reading text-body-l text-ink-600 leading-relaxed">{intro}</p>}
      {children}
    </div>
  );
}

import { formatiereDatum } from '../helpers';

// W2·5d U-PDF / A12 — EINE Download-Aktion für das AMTLICHE PDF der gepinnten
// Fassung (David 5.7.2026: «das herunterladen soll amtliches pdf herunterladen»).
// Ehrliche Beschriftung «Amtliches PDF (Fassung vom …)» (§8). Ohne amtliches PDF
// wird die Aktion vom Aufrufer weggelassen (nie Schein-Amtlichkeit, nie
// render-eigenes PDF — FAHRPLAN-GESETZES-UX §10.5). Zwei Quellen, EINE Anatomie:
//   · Bund/Kanton-Snapshot → externe amtliche URL (Fedlex-Filestore / LexWork),
//     `extern` öffnet in neuem Tab (cross-origin `download` ist nur ein Hinweis).
//   · Staatsvertrag/pdf-embed → same-origin gehostetes PDF (`extern=false`),
//     `download` erzwingt den Speicherdialog.
// A9-DoD: `<a>` ist tastaturfokussierbar, `lc-chip` trägt das 24px-Tap-Ziel
// (WCAG 2.2 §2.5.8); aria-label nennt Zweck + Fassungsdatum vollständig.
export function AmtlichesPdf({ href, stand, extern, dateiname }: {
  href: string;
  /** Versionsdatum (ISO) des PDF — ehrliche «Fassung vom …»-Angabe. */
  stand: string;
  /** true = amtliche Fremd-URL (neuer Tab); false = gehostetes same-origin-PDF. */
  extern: boolean;
  /** Nur same-origin: Dateiname für den Speicherdialog. */
  dateiname?: string;
}) {
  const fassung = stand ? ` (Fassung vom ${formatiereDatum(stand)})` : '';
  return (
    <a
      href={href}
      {...(extern
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : { download: dateiname ?? true })}
      className="lc-chip no-underline hover:text-brass-700"
      aria-label={`Amtliches PDF${fassung} herunterladen${extern ? ' (öffnet in neuem Tab)' : ''}`}
      title="Amtliches PDF der geltenden Fassung — massgeblich ist die amtliche Quelle"
    >
      ⬇ Amtliches PDF{fassung}
    </a>
  );
}

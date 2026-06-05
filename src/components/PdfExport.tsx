import type { PdfDocConfig } from '../lib/pdf/pdfModel';

// Schlanker Export-Button. Jeder Rechner liefert seine PdfDocConfig (Titel,
// Domäne, Eingaben, Ergebnisse, einschlägige Normen, Disclaimer); gerendert
// wird zentral in src/lib/pdf/. Der Renderer (inkl. jsPDF) wird erst beim
// Klick dynamisch geladen – hält das Haupt-Bundle klein.

export function PdfExportButton({ config }: { config: PdfDocConfig }) {
  if (config.sections.length === 0) return null;
  const onClick = async () => {
    const { exportPdf } = await import('../lib/pdf/pdfRender');
    exportPdf(config);
  };
  return (
    <button onClick={onClick} className="lc-btn-primary gap-2">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
      PDF-Rechenbericht
    </button>
  );
}

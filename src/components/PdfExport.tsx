import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import type { Berechnungsergebnis } from '../types/legal';

type Abschnitt = {
  titel: string;
  ergebnis: Berechnungsergebnis;
};

export function exportPdf(abschnitte: Abschnitt[], eingaben: Record<string, string>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 20;
  const usable = pw - 2 * margin;
  let y = margin;

  const ln = (text: string, size = 10, bold = false, color: [number, number, number] = [30, 41, 59]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, usable) as string[];
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += size * 0.45;
    });
    y += 2;
  };

  const hr = () => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pw - margin, y);
    y += 5;
  };

  // Title
  ln('Arbeitsrechtliche Orientierungsberechnung', 16, true, [30, 64, 175]);
  ln(`Erstellt: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 9, false, [100, 116, 139]);
  hr();

  // Eingaben
  ln('Eingaben', 12, true);
  Object.entries(eingaben).forEach(([k, v]) => {
    if (v) ln(`${k}: ${v}`, 9);
  });
  hr();

  // Berechnungen
  abschnitte.forEach(({ titel, ergebnis }) => {
    ln(titel, 13, true, [30, 64, 175]);
    ln(`Status: ${ergebnis.status.toUpperCase()}`, 10, true);
    ln(ergebnis.ergebnis, 10);
    y += 3;

    if (ergebnis.warnungen.length > 0) {
      ln('Hinweise / Vorbehalte', 10, true, [146, 64, 14]);
      ergebnis.warnungen.forEach((w) => ln(`⚠ ${w}`, 9, false, [146, 64, 14]));
      y += 2;
    }

    ln('Rechenweg', 10, true);
    ergebnis.rechenweg.forEach((schritt, i) => {
      ln(`${i + 1}. ${schritt.beschreibung}`, 9, true);
      ln(schritt.zwischenergebnis, 9);
      const normen = schritt.normen.map((n) => n.artikel).join(', ');
      ln(`Normen: ${normen}`, 8, false, [71, 85, 105]);
      if (schritt.rechtsprechung?.length) {
        const rsp = schritt.rechtsprechung.map((r) => `${r.aktenzeichen}${!r.verifiziert ? ' [zu verifizieren]' : ''}`).join(', ');
        ln(`Rechtsprechung: ${rsp}`, 8, false, [146, 64, 14]);
      }
      y += 1;
    });

    if (ergebnis.annahmen.length > 0) {
      ln('Annahmen', 10, true);
      ergebnis.annahmen.forEach((a) => ln(`• ${a}`, 9));
    }
    hr();
  });

  // Disclaimer
  ln('Disclaimer', 10, true, [100, 116, 139]);
  ln(
    'Automatisierte Orientierungsberechnung, keine Rechtsberatung. ' +
    'Abweichende GAV-/Vertrags-/Versicherungslösungen, der genaue Sachverhalt sowie alle ' +
    'Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen. ' +
    'Die Lohnfortzahlungsskalen sind Gerichtspraxis und vor Produktiveinsatz gegen die ' +
    'aktuelle kantonale Praxis abzugleichen.',
    8, false, [100, 116, 139],
  );

  doc.save(`Orientierungsberechnung_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
}

type Props = {
  abschnitte: Abschnitt[];
  eingaben: Record<string, string>;
};

export function PdfExportButton({ abschnitte, eingaben }: Props) {
  if (abschnitte.length === 0) return null;
  return (
    <button
      onClick={() => exportPdf(abschnitte, eingaben)}
      className="lc-btn-brass gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
      </svg>
      PDF-Rechenbericht
    </button>
  );
}

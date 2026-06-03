import { addDays, isBefore, isAfter } from 'date-fns';
import { ostersonntag } from './zpoFeiertage';
import type { Periode } from '../lib/fristenEngine';

// ─── Betreibungsferien (Art. 56 Abs. 1 Ziff. 2 SchKG) ─────────────────────
//
// ACHTUNG – NICHT identisch mit den ZPO-Gerichtsferien (Art. 145 Abs. 1 ZPO):
//   • Sommer endet am 31. Juli (ZPO: 15. August)
//   • Weihnachten endet am 1. Januar (ZPO: 2. Januar)
//   • Ostern: sieben Tage vor bis sieben Tage nach Ostern (wie ZPO)
//
// VERIFY: Exakte gesetzliche Tagesgrenzen vor Produktivschaltung gegen den
// geltenden Wortlaut von Art. 56 Abs. 1 Ziff. 2 SchKG (Fedlex SR 281.1)
// endkontrollieren. Werte aus dem redaktionellen Konzept übernommen
// (BGE 143 III 149; Wuffli, Jusletter 24.4.2017).
//
// Anders als der ZPO-Stillstand HEMMEN die Betreibungsferien den Fristenlauf
// nicht (Art. 63 SchKG). Dieser Kalender liefert nur die geschlossenen
// Perioden; die Rechtsfolge (Verlängerung auf den 3. Werktag, falls das
// Fristende hineinfällt) setzt die Engine über die Endregel 'verlaengerung_3wt'.

export function betreibungsferien(jahr: number): Periode[] {
  const o = ostersonntag(jahr);
  return [
    // Ziff. 2: sieben Tage vor und sieben Tage nach Ostern → 15 Tage
    { key: `bf-ostern-${jahr}`, von: addDays(o, -7), bis: addDays(o, 7) },
    // Ziff. 2: vom 15. bis und mit 31. Juli → 17 Tage
    { key: `bf-sommer-${jahr}`, von: new Date(jahr, 6, 15), bis: new Date(jahr, 6, 31) },
    // Ziff. 2: sieben Tage vor (18.12.) bis sieben Tage nach (1.1.) Weihnachten
    { key: `bf-weihnachten-${jahr}`, von: new Date(jahr, 11, 18), bis: new Date(jahr + 1, 0, 1) },
  ];
}

const geq = (a: Date, b: Date) => !isBefore(a, b);
const leq = (a: Date, b: Date) => !isAfter(a, b);

/** Betreibungsferien-Periode, in die `date` fällt – oder null. */
export function betreibungsperiodeFuer(date: Date): Periode | null {
  const y = date.getFullYear();
  for (const jy of [y - 1, y, y + 1]) {
    for (const p of betreibungsferien(jy)) {
      if (geq(date, p.von) && leq(date, p.bis)) return p;
    }
  }
  return null;
}

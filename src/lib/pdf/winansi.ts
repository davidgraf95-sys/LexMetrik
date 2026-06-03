// ─── WinAnsi-(CP1252-)Sicherung für jsPDF-Standardschriften ───────────────
//
// Die 14 PDF-Standardschriften (Helvetica etc.) können ausschliesslich
// WinAnsi/CP1252 darstellen. Zeichen ausserhalb (→, ≤, ⚠, …) erscheinen sonst
// als falsche Glyphen («&»-Artefakte) oder zerstören den Zeichenabstand.
// Diese Schicht ersetzt alle Nicht-CP1252-Zeichen durch sichere Äquivalente.
// Deutsche Typografie (–, —, „ ", « », •, ·, geschütztes Leerzeichen) liegt
// vollständig IN CP1252 und bleibt unangetastet.

// CP1252-Zusatzzeichen oberhalb von Latin-1 (0x80–0x9F-Fenster).
const CP1252_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030,
  0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022,
  0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

function istCp1252(ch: string): boolean {
  const c = ch.codePointAt(0)!;
  if (c <= 0x7f) return true;
  if (c >= 0xa0 && c <= 0xff) return true;
  return CP1252_EXTRA.has(c);
}

// Gezielte Ersetzungen für im Projekt vorkommende Nicht-CP1252-Zeichen.
const ERSATZ: Record<string, string> = {
  '→': '->',   // →
  '←': '<-',   // ←
  '⇒': '=>',   // ⇒
  '≤': '<=',   // ≤
  '≥': '>=',   // ≥
  '≈': '~',    // ≈ (ungefähr)
  '⚠': '!',    // ⚠ (Hinweise erhalten eigene Auszeichnung im Renderer)
  '✓': '+',    // ✓
  '✗': 'x',    // ✗
  '−': '-',    // − (mathematisches Minus)
  '‑': '-',    // non-breaking hyphen
  ' ': ' ', // schmales geschütztes Leerzeichen → NBSP
  '′': "'",
  '″': '"',
};

/** Macht einen Text vollständig CP1252-sicher (für jsPDF-Standardschriften). */
export function winAnsiSicher(text: string): string {
  const norm = text.normalize('NFC');
  let out = '';
  for (const ch of norm) {
    if (istCp1252(ch)) { out += ch; continue; }
    out += ERSATZ[ch] ?? '?';
  }
  return out;
}

/** Prüft, ob ein Text bereits CP1252-sicher ist (für Tests). */
export function istWinAnsiSicher(text: string): boolean {
  for (const ch of text.normalize('NFC')) {
    if (!istCp1252(ch)) return false;
  }
  return true;
}

// ─── Deutsche Typografie ──────────────────────────────────────────────────

/** Geschützte Leerzeichen in Norm-/SR-Verweisen: «Art. 142», «Abs. 3», «SR 272». */
export function typografie(text: string): string {
  return text
    .replace(/\b(Art|Abs|Ziff|lit|Bst)\.\s+(?=\d|[a-z]\b)/g, '$1. ')
    .replace(/\bSR\s+(?=\d)/g, 'SR ');
}

/** ISO-Daten (yyyy-MM-dd) plattformweit auf DD.MM.YYYY normalisieren. */
export function datumNormalisieren(text: string): string {
  return text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3.$2.$1');
}

/** Komplette Textaufbereitung für die PDF-Ausgabe. */
export function pdfText(text: string): string {
  return winAnsiSicher(typografie(datumNormalisieren(text)));
}

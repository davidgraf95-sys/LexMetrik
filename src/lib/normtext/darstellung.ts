// Reine Darstellungs-Normalisierungen (§3 — Wortlaut wird NICHT verändert,
// nur Extraktions-Artefakte für die Anzeige getrennt). Hier ausgelagert, damit
// sowohl die Render-Komponente (ArtikelBody) als auch die Lesesicht
// (GesetzLeser, Download-Text) dieselbe Wahrheit teilen — und damit der
// react-refresh-Lint (nur Komponenten-Exporte je Datei) grün bleibt.

// Änderungs-/Quellenhistorie, die der Fedlex-Snapshot für aufgehobene/eingefügte
// und Bereichs-Artikel (z. B. OR 40g, 274–274g, ArG 21) FÄLSCHLICH in den
// Wortlaut-Block mischt. Signatur: die hochgestellte Fussnoten-Nummer steht im
// Text VERDOPPELT («… 25 25 Eingefügt durch …», «53 53 Fassung gemäss …»),
// gefolgt von einem Historie-Schlüsselwort. Davor steht entweder echter Wortlaut
// (in-Kraft-Artikel mit angehängter Fussnote) ODER nur ein geleakter Label-Rest
// («g», «– 274 g», «und 34» — kein echtes Wort). Eng getriggert (verdoppelte
// IDENTISCHE Nummer + Stichwort), damit echter Normtext nie zerschnitten wird.
// Die abgetrennte Historie selbst gehört an den Artikelfuss (dort ohnehin als
// amtliche Sidecar-Fussnote vorhanden); fehlt die Sidecar-Fussnote, dient sie
// als Rückfall.
const HISTORIE_STICHWORT =
  'Aufgehoben|Eingefügt|Fassung gemäss|Ursprünglich|Tritt|Siehe auch|In Kraft|Berichtigt|Bereinigt';
const HISTORIE_RE = new RegExp(`(\\d{1,3})\\s+\\1\\s+(?=(?:${HISTORIE_STICHWORT})\\b)`);

export function trenneAenderungshistorie(text: string): { wortlaut: string; historie: string | null } {
  const m = text.match(HISTORIE_RE);
  if (!m || m.index == null) return { wortlaut: text, historie: null };
  const davor = text.slice(0, m.index).trim();
  const historie = text.slice(m.index + m[0].length).trim() || null;
  // Echter Wortlaut trägt mindestens ein Wort (≥4 Buchstaben); ein geleakter
  // Label-Rest («g», «und 34», «– 274 g») nicht → verwerfen (Ganzkörper-Fall).
  const istWortlaut = /[A-Za-zÀ-ÿ]{4,}/.test(davor);
  return { wortlaut: istWortlaut ? davor : '', historie };
}

// Randtitel/Marginalien («A. Abschluss des Vertrages», «I. Übereinstimmende
// Willensäusserung», «1. Im Allgemeinen») für die Lesesicht aufbereiten: den
// strukturellen Aufzähler (A./I./1.) strippen, die übergeordneten Stufen als
// Oberzeilen (Versalien-Anzeige übernimmt das CSS), die unterste Stufe als
// eigentlichen Sachtitel. Rein Darstellung (§3).
export function randtitelTeile(marginalie: string[]): { ober: string[]; titel: string | null } {
  const strip = (s: string) => s.replace(/^([A-Za-z]{1,4}|\d{1,3})\.\s+/, '').trim();
  const clean = marginalie.map(strip).filter(Boolean);
  if (clean.length === 0) return { ober: [], titel: null };
  return { ober: clean.slice(0, -1), titel: clean[clean.length - 1] };
}

// Wie randtitelTeile, aber jede Stufe einzeln mit ihrem Aufzähler erhalten —
// für die schmale (Fedlex-artige) Ansicht, die die Randtitel als gestufte
// Überschriften MIT Aufzähler («A. Anwendung des Rechts») über dem Artikel zeigt.
export function randtitelEintraege(marginalie: string[]): { mark: string; titel: string }[] {
  return marginalie
    .map((s) => {
      const m = s.match(/^([A-Za-z]{1,4}|\d{1,3})\.\s+(.+)$/);
      return m ? { mark: `${m[1]}.`, titel: m[2].trim() } : { mark: '', titel: s.trim() };
    })
    .filter((e) => e.titel);
}

// Bereichs-Artikel («Art. 226a226d», «Art. 6770») trägt im Snapshot zwei
// zusammengeklebte Artikelnummern ohne Halbgeviert. Aus der Artikel-id
// (z. B. «226_a_226_d», «67_70») das Halbgeviert rekonstruieren. IDs mit nur
// EINER Nummer (Buchstaben-Suffix «40_g», Einzelartikel «335_c») bleiben unberührt.
export function labelMitBereich(label: string, id: string): string {
  if (/[–-]/.test(label)) return label;
  const toks = id.split('_');
  const numPos = toks.map((t, i) => (/^\d+$/.test(t) ? i : -1)).filter((i) => i >= 0);
  if (numPos.length < 2) return label;
  const p2 = numPos[1];
  const g1 = toks.slice(0, p2).join('');
  const g2 = toks.slice(p2).join('');
  const prefix = label.match(/^(Art\.|§)/)?.[1] ?? 'Art.';
  return `${prefix} ${g1}–${g2}`;
}

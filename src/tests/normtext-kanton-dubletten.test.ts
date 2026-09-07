import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// ─── Tor: ein Erlass, ein Schlüssel (§5) ─────────────────────────────────────
//
// Anlass: Gegenprüfung zu PR #684 (5.9.2026). `public/normtext/register.json`
// führte die Glarner «Verordnung über die Gebühren im Zivilrecht» zweimal —
// `GL-III%20B_7_1` und `GL-III%20B%2F7%2F1`, gleicher Titel, je 14 Artikel,
// dieselbe amtliche Fassung (GS III B/7/1, pdfUrl …/versions/2628/pdf_file).
// Ursache war eine zweite Schreibweise derselben quelleUrl in den Tarif-Daten
// (`…/III%20B/7/1` statt `…/III%20B%2F7%2F1`), aus der der Generator eine
// zweite Identität baute. Folge: derselbe Erlass zweimal in Register, Sitemap
// und Kantonsliste — §5-Doppelwahrheit plus SEO-Duplikat.
//
// Dieses Tor prüft das Ergebnis (das Register), nicht den Weg dorthin: es fällt
// auch dann rot, wenn eine Dublette über einen anderen Generator-Zweig
// entsteht (Discovery vs. Tarif-Inventar erzeugen lawIds in verschiedenen
// Schreibweisen — die Wurzel-Härtung sitzt in
// `scripts/normtext/inventar-kanton.ts`, dieses Netz hängt darunter).
//
// Rot-Beweis (§6.7), gemessen 5.9.2026 auf dem Stand VOR der Generator-Kanonik:
//   D1 → 1 Treffer  GL-III%20B_7_1 <> GL-III%20B%2F7%2F1
//   D2 → 1 Treffer  dieselben beiden Schlüssel
//   D3 → 10 statt 9 Titel-Gruppen (GL-Paar zusätzlich)

interface RegisterEintrag {
  key: string;
  ebene: string;
  kanton: string | null;
  titel: string;
  sr: string | null;
  artikelAnzahl: number;
  quelleUrl: string | null;
  pdfUrl: string | null;
}

const REGISTER: RegisterEintrag[] = JSON.parse(
  readFileSync('public/normtext/register.json', 'utf8'),
).erlasse;

const KANTONAL = REGISTER.filter((e) => e.ebene !== 'bund');

/** Gruppiert die Einträge nach einem Schlüssel; `null` = Eintrag zählt nicht mit. */
function gruppen(
  eintraege: RegisterEintrag[],
  schluessel: (e: RegisterEintrag) => string | null,
): Array<{ schluessel: string; keys: string[] }> {
  const m = new Map<string, string[]>();
  for (const e of eintraege) {
    const k = schluessel(e);
    if (k === null) continue;
    const liste = m.get(k);
    if (liste) liste.push(e.key);
    else m.set(k, [e.key]);
  }
  return [...m.entries()]
    .filter(([, keys]) => keys.length > 1)
    .map(([schluessel, keys]) => ({ schluessel, keys: [...keys].sort() }))
    .sort((a, b) => a.schluessel.localeCompare(b.schluessel));
}

function dekodiere(u: string): string {
  try {
    return decodeURIComponent(u);
  } catch {
    return u;
  }
}

describe('Normtext-Register: ein Erlass, ein Schlüssel', () => {
  // ── D1: zwei Schlüssel, eine Quell-Adresse ────────────────────────────────
  // Nach Dekodierung ist die quelleUrl die Adresse EINES Erlasses bei der
  // amtlichen Stelle. Zwei Register-Einträge auf derselben Adresse sind
  // derselbe Erlass — unabhängig davon, welcher Generator-Zweig sie erzeugt hat.
  it('D1: keine zwei Einträge auf derselben (dekodierten) quelleUrl', () => {
    const treffer = gruppen(REGISTER, (e) => (e.quelleUrl ? dekodiere(e.quelleUrl) : null));
    expect(
      treffer.map((t) => `${t.keys.join(' <> ')}  →  ${t.schluessel}`),
      'Schreibweisen-Dublette: dieselbe amtliche Adresse unter zwei Schlüsseln. ' +
        'Fix an der Wurzel (quelleUrl in src/data/tarif/*.ts bzw. kanonischeLawId ' +
        'in scripts/normtext/inventar-kanton.ts), dann Generator neu laufen lassen.',
    ).toEqual([]);
  });

  // ── D2: zwei Schlüssel, eine amtliche Fassung ─────────────────────────────
  // Schärfer als «gleicher Titel»: gleiche Systematiknummer UND gleicher Titel
  // UND gleiche Artikelzahl UND dasselbe amtliche PDF (= dieselbe Fassung).
  // Trennt echte Dubletten von Erlassen, die mehrere Sammlungen desselben
  // Kantons je eigenständig führen (BS: Kanton / Bettingen / Riehen — gleicher
  // Text, aber je eigene amtliche Nummer und eigenes PDF).
  it('D2: keine zwei Einträge auf derselben amtlichen Fassung', () => {
    const treffer = gruppen(KANTONAL, (e) =>
      e.pdfUrl ? [e.kanton, e.sr, e.titel.trim(), e.artikelAnzahl, e.pdfUrl].join('|') : null,
    );
    expect(
      treffer.map((t) => t.keys.join(' <> ')),
      'Fassungs-Dublette: zwei Schlüssel zeigen auf dieselbe amtliche Fassung (§5).',
    ).toEqual([]);
  });

  // ── D3: Titel-Dubletten je Kanton sind abschliessend dokumentiert ─────────
  // Gleicher Titel + gleiche Artikelzahl im selben Kanton ist nicht per se
  // falsch (BS führt zwischenstaatliche Verträge in Kantons- UND Gemeinde-
  // sammlung; FR/JU führen denselben Erlass zusätzlich über den PDF-Weg). Aber
  // jede solche Gruppe braucht einen Grund. Neue, undokumentierte Gruppen
  // fallen hier rot — und eine Gruppe, die verschwindet, ebenso: dann ist der
  // Eintrag hier verfallen und gehört gelöscht.
  //
  // Stand 5.9.2026. Nicht «nachführen», sondern begründen (§7).
  const BEKANNTE_TITEL_GRUPPEN: Array<{ keys: string[]; grund: string }> = [
    // BS: derselbe Vertrag/dieselbe Ordnung erscheint in der kantonalen
    // Sammlung und/oder den Gemeindesammlungen Bettingen (BeE), Riehen (RiE),
    // Bettingen-Basel (BaB) — je eigene amtliche Nummer, je eigenes PDF
    // (verschiedene versions-IDs). Zwei Einträge, zwei amtliche Erlasse.
    { keys: ['BS-172.400', 'BS-BaB 172.400'], grund: 'BS: Kantons- + Gemeindesammlung, je eigene amtliche Nummer' },
    { keys: ['BS-412.100', 'BS-BeE 412.100', 'BS-RiE 412.100'], grund: 'BS: Kantons- + zwei Gemeindesammlungen' },
    { keys: ['BS-890.800', 'BS-BeE 890.800', 'BS-RiE 890.800'], grund: 'BS: Kantons- + zwei Gemeindesammlungen' },
    { keys: ['BS-BeE 117.220', 'BS-RiE 117.220'], grund: 'BS: zwei Gemeindesammlungen' },
    { keys: ['BS-BeE 328.600', 'BS-RiE 328.600'], grund: 'BS: zwei Gemeindesammlungen' },
    { keys: ['BS-BeE 411.500', 'BS-RiE 411.500'], grund: 'BS: zwei Gemeindesammlungen' },
    { keys: ['BS-BeE 890.500', 'BS-RiE 890.500'], grund: 'BS: zwei Gemeindesammlungen' },
    // FR/JU: derselbe Erlass zusätzlich über den PDF-Weg erschlossen (andere
    // Quell-Adresse, anderer Extraktionspfad). Offener Mangel, nicht Absicht —
    // Zusammenführung verlangt eine Entscheidung über den führenden
    // Extraktionsweg und ist darum ein eigener Schritt (ROADMAP QS-KORPUS).
    { keys: ['FR-261.16', 'FR-8428'], grund: 'FR: LexWork- neben PDF-Erschliessung desselben Erlasses (offen)' },
    { keys: ['JU-ju-20021-34172', 'JU-ju-20021-34172-dl'], grund: 'JU: Ansicht- neben Download-URL desselben Erlasses (offen)' },
  ];

  it('D3: Titel-Dubletten je Kanton stehen genau so in der Bekannt-Liste', () => {
    const ist = gruppen(KANTONAL, (e) =>
      [e.kanton, e.titel.trim(), e.artikelAnzahl].join('|'),
    ).map((t) => t.keys.join(' <> '));
    const soll = BEKANNTE_TITEL_GRUPPEN.map((g) => [...g.keys].sort().join(' <> ')).sort((a, b) =>
      a.localeCompare(b),
    );
    expect(
      [...ist].sort((a, b) => a.localeCompare(b)),
      'Neue Titel-Gruppe = mutmassliche Dublette (Grund eintragen oder entdoppeln); ' +
        'verschwundene Gruppe = verfallener Bekannt-Eintrag (löschen).',
    ).toEqual(soll);
  });
});

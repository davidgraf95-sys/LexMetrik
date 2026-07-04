import type { ErlassRegistereintrag, Rechtsgebiet } from './register';

// ─── pdf-embed: amtliches PDF als In-App-Darstellung (Auftrag David 25.6.2026) ──
//
// Für Erlasse, die KEINEN sauber extrahierbaren Volltext-HTML haben (Fedlex
// liefert nur eine SPA-Shell ohne <article>), aber ein amtliches PDF/A — z.B.
// EMRK (0.101), New Yorker Schiedsspruch-Übk. (0.277.12). Statt eines nackten
// Live-Links wird das amtliche PDF in-app eingebettet (status 'pdf-embed').
//
// WARTUNGSARM: EINE deklarative Liste (key/eli/kons) treibt alles —
//   · register.ts merged daraus die Erlass-Einträge (Ableitung, kein zweiter Satz);
//   · scripts/normtext/pdf-fetch.ts leitet die pdf-a-URL aus eli/kons ab, lädt sie
//     nach public/normtext/pdf/<KEY>.pdf und schreibt sha/Bytes/Stand → pdf-index.json;
//   · check:pdf (offline) + check:pdf-netz (Drift + geltende Konsolidierung) prüfen.
// §7/§8: Das PDF IST die amtliche Fassung (kein Transkriptionsrisiko); sichtbarer
// Live-Link + Drift-Erkennung bleiben Pflicht.

export interface PdfEmbedQuelle {
  key: string;
  kuerzel: string;
  titel: string;
  sr: string;
  rechtsgebiet: Rechtsgebiet;
  rang: number;
  /** Fedlex-ELI ohne Präfix, z.B. 'cc/1974/2151_2151_2151'. */
  eli: string;
  /** Geltende Konsolidierung YYYYMMDD (via check:pdf-netz/SPARQL als geltend bestätigt). */
  kons: string;
  /**
   * Revisions-Suffix der REGISTRIERTEN pdf-a-Datei (jolux:isExemplifiedBy), z.B.
   * '-2'. FALLE: die suffixlose Filestore-URL liefert bei Re-Issues HTTP 200 mit
   * einem ÄLTEREN Re-Issue (EMRK 20220916: suffixlos = 540 kB/PDF-1.4, kanonisch
   * -2 = 445 kB/PDF-1.7). Leer/weggelassen = suffixlose URL ist kanonisch (NYÜ).
   */
  pdfSuffix?: string;
}

export const PDF_EMBED_QUELLEN: PdfEmbedQuelle[] = [
  {
    key: 'EMRK', kuerzel: 'EMRK',
    titel: 'Konvention vom 4. November 1950 zum Schutze der Menschenrechte und Grundfreiheiten (EMRK)',
    sr: '0.101', rechtsgebiet: 'international', rang: 89,
    // Re-Pin 20050323→20220916 (QS-CURRENCY P1-a, 5.7.2026): geltende Konsolidierung
    // per SPARQL (dateApplicability 2022-09-16, letzte ≤ heute). Kanonische pdf-a per
    // isExemplifiedBy trägt Suffix '-2' (suffixlos = älterer Re-Issue, s. pdfSuffix).
    eli: 'cc/1974/2151_2151_2151', kons: '20220916', pdfSuffix: '-2',
  },
  {
    key: 'NYUE', kuerzel: 'NYÜ',
    titel: 'Übereinkommen vom 10. Juni 1958 über die Anerkennung und Vollstreckung ausländischer Schiedssprüche (New Yorker Übereinkommen)',
    sr: '0.277.12', rechtsgebiet: 'international', rang: 109,
    // Re-Pin 20200207→20260506 (QS-CURRENCY P1-a, 5.7.2026): geltende Konsolidierung
    // per SPARQL (dateApplicability 2026-05-06). Suffixlose pdf-a ist kanonisch (isExemplifiedBy).
    eli: 'cc/1965/795_799_793', kons: '20260506',
  },
];

/** Konsolidierung YYYYMMDD → ISO 'YYYY-MM-DD'. */
function konsIso(k: string): string {
  return `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`;
}

/**
 * Fedlex-Filestore-URL des amtlichen PDF/A (aus eli/kons abgeleitet). `suffix`
 * trägt den Revisions-Suffix der registrierten Datei (isExemplifiedBy), z.B.
 * '-2' — leer = suffixlose kanonische URL. Ohne den korrekten Suffix lädt ein
 * Re-Issue-Erlass die ÄLTERE Datei (HTTP 200, kein 404 — s. PdfEmbedQuelle.pdfSuffix).
 */
export function pdfaUrl(eli: string, kons: string, suffix = ''): string {
  const pfad = eli.replace(/\//g, '-');
  return `https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/${eli}/${kons}/de/pdf-a/fedlex-data-admin-ch-eli-${pfad}-${kons}-de-pdf-a${suffix}.pdf`;
}

/** Register-Einträge (status 'pdf-embed') — abgeleitet aus PDF_EMBED_QUELLEN. */
export const PDF_EMBED: ErlassRegistereintrag[] = PDF_EMBED_QUELLEN.map((q) => ({
  key: q.key,
  ebene: 'bund',
  kuerzel: q.kuerzel,
  titel: q.titel,
  sr: q.sr,
  rechtsgebiet: q.rechtsgebiet,
  sprache: 'de',
  rang: q.rang,
  status: 'pdf-embed',
  quelleUrl: `https://www.fedlex.admin.ch/eli/${q.eli}/de`,
  stand: konsIso(q.kons),
  pdfPfad: `pdf/${q.key}.pdf`,
}));

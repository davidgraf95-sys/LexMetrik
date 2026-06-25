// Geteilte lawIdSafe-Helfer für die kantonalen PDF-Quellen (§5, C1-1).
// EINE Quelle für den dateisicheren Snapshot-Schlüssel je quelleUrl — sowohl der
// Generator (normtext-snapshot.ts) als auch der Drift-Check (check-drift.ts)
// benutzen exakt diese Funktion. Eine Handkopie in check-drift kannte die
// olexAt/olexPar-Profile (AR/FR/GR/LU/SG/VS) nicht → deren Snapshots wurden im
// Drift-Tor still übersprungen (§7-d unerfüllt). Direktes Importieren aus
// normtext-snapshot.ts ist nicht möglich, weil dieses Modul beim Import main()
// startet; darum dieses seiteneffektfreie Helfer-Modul.

import type { PdfProfilName } from './adapter-pdf.ts';

// lawIdSafe für die generischen PDF-Quellen: ein stabiler, dateisicherer
// Schlüssel je quelleUrl.
//   SZ  …/assets/<n>/173_111.pdf          → «173.111»
//   TI  …/pdfatto/atto/137                → «ti-137»
//   VD  …/tolv/105539/fr                  → «vd-105539»
//   JU  …viewdocument.html?idn=20021&id=34172… → «ju-20021-34172»
//   olexAt/olexPar  …/versions/<N>/pdf_file → «<N>» (Kanton-Präfix vom Aufrufer)
export function pdfLawIdSafe(profil: PdfProfilName, url: string): string {
  if (profil === 'sz') {
    const m = url.match(/\/(\d+_\d+)\.pdf$/i);
    if (m) return m[1].replace(/_/g, '.');
    const t = url.match(/\/tolv\/(\d+)\//i); // SZ-lexfind (82040/de)
    if (t) return t[1];
  }
  if (profil === 'ti') {
    const a = url.match(/\/pdfatto\/atto\/(\d+)/i);
    if (a) return `ti-${a[1]}`;
    const t = url.match(/\/tolv\/(\d+)\//i); // TI-lexfind (125101/it)
    if (t) return `ti-${t[1]}`;
  }
  if (profil === 'vd') {
    const m = url.match(/\/tolv\/(\d+)\//i);
    if (m) return `vd-${m[1]}`;
  }
  // Generische OrdoLex-Familie: /api/<lang>/versions/<N>/pdf_file → «<N>»
  // (kanton-präfix wird vom Aufrufer angehängt → eindeutig je Kanton);
  // lexfind /tolv/<id>/<lang> → «<id>».
  if (profil === 'olexAt' || profil === 'olexPar') {
    const v = url.match(/\/versions\/(\d+)\/pdf_file/i);
    if (v) return v[1];
    const t = url.match(/\/tolv\/(\d+)\//i);
    if (t) return t[1];
  }
  if (profil === 'ju') {
    const idn = url.match(/[?&]idn=(\d+)/i);
    const id = url.match(/[?&]id=(\d+)/i);
    const dl = /[?&]download=1/i.test(url) ? '-dl' : '';
    if (idn && id) return `ju-${idn[1]}-${id[1]}${dl}`;
  }
  return url.replace(/[^a-z0-9.]+/gi, '_');
}

#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Empirische Grundarten-Klassifikation des LexMetrik-Normtext-Korpus.
// Read-only-Scan über public/normtext/** + register.json. Schreibt NUR nach
// docs/ux-audit-2026-07/. Datengetrieben: Signale je Erlass → Grundart (Priorität).
//
// Signal-Quellen:
//   register.json          → Identität, ebene, status, rechtsgebiet, artikelAnzahl
//   struktur/**/<key>.json → Randtitel/marginalie-Deckung, Hierarchie-Tiefe
//                            (gliederung.ebene), Fussnoten-Dichte
//   bund|kanton/<key>.json → Anhänge (annex_*-ids), Schlusstitel/Übergang
//                            (disp_*-ids), Tabellen (Block-Feld `mehrspaltig`),
//                            Bilder/Formeln (`bild`/`bildKacheln`), Paragraf-
//                            vs Artikel-Zählung (artikelLabel §/Art.)
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
const NT = path.join(ROOT, 'public', 'normtext');
const OUT = path.join(ROOT, 'docs', 'ux-audit-2026-07', 'erlass-klassifikation.json');

const register = JSON.parse(fs.readFileSync(path.join(NT, 'register.json'), 'utf8'));

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

// ── Signal-Extraktion je Erlass ──────────────────────────────────────────────
function signale(e) {
  const s = {
    ebene: e.ebene,
    status: e.status,
    rechtsgebiet: e.rechtsgebiet,
    artikelAnzahl: e.artikelAnzahl ?? 0,
    // Struktur-Signale (aus struktur/**):
    marginalieDeckung: null,   // Anteil Artikel mit Randtitel (0..1)
    hierarchieTiefe: 0,        // max gliederung.ebene
    fussnotenDichte: null,     // Fussnoten pro Artikel
    // Normtext-Signale (aus bund|kanton/**):
    hatAnhang: false,          // annex_*-Einträge
    hatSchlusstitel: false,    // disp_*-Einträge (Schluss-/Übergangsbestimmungen)
    hatTabelle: false,         // Block-Feld `mehrspaltig`
    hatBild: false,            // `bild` / `bildKacheln`
    paragrafZaehlung: false,   // artikelLabel beginnt mit § statt Art.
  };

  if (!e.datei) return s; // nur-live-link / pdf-embed ohne Snapshot

  // Normtext
  const nt = readJson(path.join(NT, e.datei));
  if (nt && Array.isArray(nt.eintraege)) {
    let paragrafHits = 0, labelHits = 0;
    for (const x of nt.eintraege) {
      const id = x.id || '';
      if (/annex/i.test(id)) s.hatAnhang = true;
      if (/disp/i.test(id)) s.hatSchlusstitel = true;
      for (const b of x.bloecke || []) {
        if (b.mehrspaltig) s.hatTabelle = true;
        if (b.bild || b.bildKacheln) s.hatBild = true;
      }
      const lab = (x.artikelLabel || '').trim();
      if (lab) { labelHits++; if (lab.startsWith('§')) paragrafHits++; }
    }
    if (labelHits > 0) s.paragrafZaehlung = paragrafHits / labelHits >= 0.5;
  }

  // Struktur (marginalie / hierarchie / fussnoten)
  const stPfad = path.join(NT, 'struktur', e.datei);
  const st = readJson(stPfad);
  if (st && st.artikel) {
    let n = 0, marg = 0, fn = 0;
    for (const k in st.artikel) {
      const o = st.artikel[k]; n++;
      if (o.marginalie && o.marginalie.length) marg++;
      for (const g of o.gliederung || []) s.hierarchieTiefe = Math.max(s.hierarchieTiefe, g.ebene || 0);
      fn += (o.fussnoten || []).length;
    }
    if (n > 0) { s.marginalieDeckung = +(marg / n).toFixed(3); s.fussnotenDichte = +(fn / n).toFixed(2); }
  }
  return s;
}

// ── Grundart-Zuordnung (Priorität: Trägerformat → Systematik → Bund-Struktur) ─
// Reihenfolge ist bewusst: harte Trägerformate (kein/embedded Snapshot) und
// Systematik-Zonen (International, Kanton) dominieren; erst innerhalb der
// Bund-Volltext-Snapshots greift die Struktur-Feinklassifikation.
const istKodifikation = (s) => s.hierarchieTiefe >= 4 || s.artikelAnzahl >= 400;

function grundart(s) {
  if (s.status === 'pdf-embed') return 'PDF_EMBED';
  if (s.status === 'nur-live-link') return 'LIVE_VERWEIS';
  if (s.rechtsgebiet === 'international') return 'STAATSVERTRAG';
  if (s.ebene === 'kanton') return 'KANTON';
  // ab hier: Bund-Volltext-Snapshot (nationales Recht)
  if (istKodifikation(s)) return 'KODIFIKATION';
  if (s.hatAnhang) return 'ERLASS_MIT_ANHANG';
  if (s.hierarchieTiefe <= 1) return 'FLACHER_KURZERLASS';
  return 'STANDARD_ERLASS';
}

const GRUNDART_META = {
  KODIFIKATION: {
    name: 'Grosse Kodifikation (tiefe Hierarchie)',
    merkmale: 'Mehrstufige Gliederung (Teil › Titel › Kapitel › Abschnitt, hierarchieTiefe ≥ 4 oder ≥ 400 Artikel), durchgehende Randtitel, hohe Fussnoten-Dichte, oft Schlusstitel (disp_*). Braucht Navigator/Breadcrumb-UI.',
    referenz: 'ZGB',
  },
  ERLASS_MIT_ANHANG: {
    name: 'Erlass mit Anhängen',
    merkmale: 'Volltext plus ein oder mehrere amtliche Anhänge (annex_*), meist mit Tabellen (mehrspaltig) und teils Bildern/Formeln. Anhang-Rendering + Tabellen-Layout sind das UX-Kernthema.',
    referenz: 'VZV',
  },
  STANDARD_ERLASS: {
    name: 'Strukturierter Erlass ohne Anhang',
    merkmale: 'Klassisches Gesetz/Verordnung mit Randtiteln und moderater Gliederung (Tiefe 2–3), ohne Anhang. Der «Normalfall» des Bundes-Volltexts.',
    referenz: 'BV',
  },
  FLACHER_KURZERLASS: {
    name: 'Flacher Kurzerlass',
    merkmale: 'Wenige Artikel, keine oder einstufige Gliederung (Tiefe ≤ 1), kein Anhang. Rendert als schlichte Artikelliste.',
    referenz: 'VMWG',
  },
  STAATSVERTRAG: {
    name: 'Staatsvertrag (International, SR 0.*)',
    merkmale: 'Völkerrechtlicher Vertrag: Präambel-getrieben, teils Protokolle/Zusatzabkommen und Anhänge; Rechtsgebiet «international». Eigene Kopf-/Präambel-Darstellung.',
    referenz: 'LugÜ',
  },
  KANTON: {
    name: 'Kantonaler Erlass',
    merkmale: 'Kantonale Systematiknummer (z. B. SAR 291.150), Paragrafen- ODER Artikel-Zählung (§/Art., Kanton-abhängig), meist flache gliederung, Randtitel je Bestimmung. Untervariante über Signal `paragrafZaehlung`.',
    referenz: 'AG-291.150',
  },
  STAATSVERTRAG_ALT: {},
  PDF_EMBED: {
    name: 'PDF-Embed (kein Volltext-HTML)',
    merkmale: 'Kein extrahierbarer Volltext — amtliches PDF wird in-app eingebettet (pdfPfad). Reine Viewer-Darstellung.',
    referenz: 'EMRK',
  },
  LIVE_VERWEIS: {
    name: 'Nur-Live-Verweis (kein Snapshot)',
    merkmale: 'Kein gehosteter Snapshot; Erlass wird per Verweiskarte auf die amtliche Quelle (quelleUrl) verlinkt. Kein Norm-Rendering.',
    referenz: 'DSGVO',
  },
};

// ── Durchlauf ────────────────────────────────────────────────────────────────
const zuordnung = [];
for (const e of register.erlasse) {
  const s = signale(e);
  const ga = grundart(s);
  zuordnung.push({
    key: e.key,
    kuerzel: e.kuerzel,
    titel: e.titel,
    ebene: e.ebene,
    kanton: e.kanton ?? null,
    sr: e.sr ?? null,
    rechtsgebiet: e.rechtsgebiet,
    status: e.status,
    grundart: ga,
    signale: s,
  });
}

// Zählung + Referenz je Grundart
const counts = {};
for (const z of zuordnung) counts[z.grundart] = (counts[z.grundart] || 0) + 1;

const grundarten = Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .map(([id, anzahl]) => ({
    id,
    name: GRUNDART_META[id].name,
    merkmale: GRUNDART_META[id].merkmale,
    referenzErlass: GRUNDART_META[id].referenz,
    anzahl,
  }));

// ── Grenzfälle (ehrlich): Erlasse an den Zuordnungs-Kanten ───────────────────
const grenzfaelle = [];
// 1) Kodifikation via Grösse statt Tiefe (art>=400, Tiefe<4) — z.B. STPO
for (const z of zuordnung.filter(z => z.grundart === 'KODIFIKATION' && z.signale.hierarchieTiefe < 4)) {
  grenzfaelle.push(`${z.kuerzel}: als KODIFIKATION geführt nur wegen Umfang (${z.signale.artikelAnzahl} Art.), Hierarchie-Tiefe nur ${z.signale.hierarchieTiefe} — Grenze Kodifikation/Standard.`);
}
// 2) Kodifikationen die ZUSÄTZLICH Anhänge tragen (Anhang-Signal von Kodifikation verdeckt)
for (const z of zuordnung.filter(z => z.grundart === 'KODIFIKATION' && z.signale.hatAnhang)) {
  grenzfaelle.push(`${z.kuerzel}: KODIFIKATION MIT Anhang — trägt annex_*, wird aber nach Priorität als Kodifikation geführt (Anhang-Rendering trotzdem nötig).`);
}
// 3) Bund-Snapshots mit auffällig tiefer Randtitel-Deckung (<0.5) — Struktur-Ausreisser
for (const z of zuordnung.filter(z => z.ebene === 'bund' && z.status === 'snapshot' && z.rechtsgebiet !== 'international' && z.signale.marginalieDeckung !== null && z.signale.marginalieDeckung < 0.5)) {
  grenzfaelle.push(`${z.kuerzel}: nur ${Math.round(z.signale.marginalieDeckung * 100)}% Artikel mit Randtitel — untypisch für Bundes-Volltext, in ${z.grundart} eingeordnet.`);
}
// 4) Flache Kurzerlasse die dennoch Tabellen führen (Tabelle ohne Anhang)
for (const z of zuordnung.filter(z => z.grundart === 'FLACHER_KURZERLASS' && z.signale.hatTabelle)) {
  grenzfaelle.push(`${z.kuerzel}: FLACHER_KURZERLASS mit Tabelle im Fliesstext (mehrspaltig ohne Anhang) — Tabellen-Layout trotz «flach».`);
}
// 5) Staatsverträge mit Anhang/Protokoll-Struktur (Präambel + annex)
for (const z of zuordnung.filter(z => z.grundart === 'STAATSVERTRAG' && z.signale.hatAnhang)) {
  grenzfaelle.push(`${z.kuerzel}: STAATSVERTRAG mit Anhang (annex_*) — kombiniert Präambel- und Anhang-Rendering.`);
}
// 6) Kanton § vs Art. — Zähl-Untervariante
const kParagraf = zuordnung.filter(z => z.grundart === 'KANTON' && z.signale.paragrafZaehlung).length;
const kArtikel = zuordnung.filter(z => z.grundart === 'KANTON' && !z.signale.paragrafZaehlung).length;
grenzfaelle.push(`KANTON-Untervariante: ${kParagraf} Erlasse mit §-Zählung vs ${kArtikel} mit Art.-Zählung — gleiche Grundart, aber unterschiedliche Bestimmungs-Etikette (Signal paragrafZaehlung).`);

// ── Schreiben ────────────────────────────────────────────────────────────────
const ausgabe = {
  erzeugt: new Date().toISOString().slice(0, 10),
  quelle: 'public/normtext/register.json + struktur/** + bund|kanton/**',
  methode: 'Datengetriebene Signal-Extraktion je Erlass, Grundart-Zuordnung per Prioritäts-Kaskade (Trägerformat → Systematik → Bund-Struktur).',
  gesamtErlasse: zuordnung.length,
  grundarten,
  grenzfaelle,
  zuordnung,
};
fs.writeFileSync(OUT, JSON.stringify(ausgabe, null, 2));

// ── Konsolen-Report ──────────────────────────────────────────────────────────
console.log('Gesamt-Erlasse:', zuordnung.length);
console.log('\nGrundarten:');
for (const g of grundarten) console.log(`  ${g.id.padEnd(20)} ${String(g.anzahl).padStart(5)}  Ref: ${g.referenzErlass}  — ${g.name}`);
console.log('\nGrenzfälle:', grenzfaelle.length);
console.log('\nGeschrieben:', OUT);

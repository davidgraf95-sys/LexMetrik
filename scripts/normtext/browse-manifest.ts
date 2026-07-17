/**
 * Browse-Manifest-Generator (Rubrik V «Gesetze»): scannt
 * public/normtext/{bund,kanton}/*.json, joint sie mit dem ERLASS_REGISTER und
 * schreibt das deterministisch sortierte public/normtext/register.json.
 *
 * §5 SSoT: Identität/Taxonomie kommt aus dem Register; ableitbare Felder
 * (Artikelzahl, Stand, quelleUrl, fassungsToken) aus den Snapshots — NIE doppelt
 * gepflegt. §2: kein Date.now() in der Logik (erzeugt-Datum kommt via Argument).
 * §6: schreibt NUR register.json, nie in bund/ oder kanton/ (Golden unberührt).
 *
 * Bund: jeder Snapshot MUSS einen Register-Eintrag haben (sonst Fehler → Tor).
 * Kanton: Kürzel/Titel/SR/Sprache werden aus Snapshot + Dateiname abgeleitet,
 * das Rechtsgebiet aus dem Register (kantonGebiet, Default öffentlich).
 *
 * Aufruf: npx vite-node scripts/normtext/browse-manifest.ts -- --datum=YYYY-MM-DD
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import type { BrowseErlass, BrowseManifest } from '../../src/lib/normtext/browse-typen.ts';
import {
  ERLASS_REGISTER, GEBIET_RANG, kantonGebiet,
  type ErlassRegistereintrag, type Sprache,
} from '../../src/lib/normtext/register.ts';

const NORMTEXT_DIR = 'public/normtext';

/** U-PDF/A12: amtliche PDF-URLs je Snapshot-Key (aus pdf-quellen.json, §5-Projektion). */
type PdfQuelle = { url: string; stand: string; quelle: string };
function ladePdfQuellen(basis: string): Record<string, PdfQuelle> {
  try {
    return JSON.parse(readFileSync(join(basis, 'pdf-quellen.json'), 'utf8')) as Record<string, PdfQuelle>;
  } catch {
    return {};
  }
}

/** V2/K-1: Ur-Inkrafttreten je Snapshot-Key (aus inkrafttreten.json, §5-Projektion). */
type InkraftQuelle = { datum: string; quelle: string };
function ladeInkrafttreten(basis: string): Record<string, InkraftQuelle> {
  try {
    return JSON.parse(readFileSync(join(basis, 'inkrafttreten.json'), 'utf8')) as Record<string, InkraftQuelle>;
  } catch {
    return {};
  }
}

function jsonDateien(verzeichnis: string): string[] {
  return readdirSync(verzeichnis)
    .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'register.json')
    .sort();
}

function ladeDatei(pfad: string): NormSnapshotDatei | null {
  try {
    const d = JSON.parse(readFileSync(pfad, 'utf8')) as NormSnapshotDatei;
    return Array.isArray(d.eintraege) ? d : null;
  } catch {
    return null;
  }
}

/** Spätestes Stand-Datum der Einträge (ISO-Strings lexikographisch vergleichbar). */
function spaetesterStand(datei: NormSnapshotDatei): string {
  return datei.eintraege.reduce((max, e) => (e.stand > max ? e.stand : max), datei.eintraege[0]?.stand ?? '');
}

/** Sprache aus dem Datei-Stamm-Suffix ('-de'|'-fr'|'-it'), Default 'de'. */
export function spracheAusStamm(stamm: string): Sprache {
  if (stamm.endsWith('-fr')) return 'fr';
  if (stamm.endsWith('-it')) return 'it';
  return 'de';
}

// T2/S2 (BS-Audit 23.6.2026) — Erlassform-Endungen, die einen Mehrwort-/lowercase-
// Tail als ECHTES Kürzel ausweisen («ad personam-Verordnung», «Registratur- und
// Archivierungsverordnung», «Abfallvereinbarung BS - BL»). Endet ein Tail-Wort auf
// eine dieser Formen, ist es kein Satzfragment, sondern ein Kurztitel.
const KUERZEL_FORM_RE =
  /(gesetz|verordnung|reglement|ordnung|vertrag|vereinbarung|übereinkommen|uebereinkommen|konkordat|abkommen|statut|verfassung|beschluss|dekret|weisung|richtlinie|tarif|programm|prämie|preis|fonds|verbund|gelübde|gesetzessammlung)$/i;

/**
 * T2/S2 — Ist der Teil NACH dem letzten Komma ein Satzfragment statt eines
 * Kürzels/Kurztitels? Der naive Last-Comma-Split machte aus «Vertrag …, b) den
 * Betrieb der Hafenbahn …» einen mid-sentence-Fragment-Titel (H1/Breadcrumb/Tab
 * kaputt). Konservativ: nur klar fragmentartige Tails ablehnen; die ~318 echten
 * Komma-Kürzel (StG, EnG, AVO Inland, EG StPO, Abfallvereinbarung BS - BL, …)
 * bleiben unberührt (kein Regress des Vorzustands).
 *
 * Fragment, wenn:
 *  (a) Aufzählungs-Buchstabe «x) …» (BS-954.420 «b) den Betrieb …»);
 *  (b) klein-beginnend OHNE Erlassform-Wort («betreffend …», «über die …»,
 *      «nachstehend …», «abgeschlossen …», «handelnd …») — «ad personam-
 *      Verordnung» wird durch die Form-Ausnahme gerettet;
 *  (c) GROSSGESCHRIEBENES Mehrwort-Fragment: ≥3 Wörter, keine Erlassform-Endung,
 *      und (≥4 Wörter ODER kein Akronym) — deckt BS-955.700/952.820/428.100
 *      («Basel-Landschaft und Aargau …», «… über die Fachhochschule … (FHNW)»)
 *      sowie kurze Listen-Fragmente «Basel-Landschaft und Aargau» ab, ohne kurze
 *      akronym-dominierte Kürzel («VO EG BGS», «NAV Haushalt BS») zu treffen.
 */
export function istKuerzelFragment(tail: string): boolean {
  const t = tail.trim();
  if (!t) return false;
  const hatForm = t.split(/\s+/).some((w) => KUERZEL_FORM_RE.test(w));
  if (/^[A-Za-zÄÖÜäöü]\)\s/.test(t)) return true;
  if (/^[a-zäöü]/.test(t) && !hatForm) return true;
  const woerter = t.split(/\s+/);
  if (woerter.length >= 3 && !hatForm) {
    const hatAkronym = woerter.some((w) => /[A-ZÄÖÜ]{2,}/.test(w));
    if (woerter.length >= 4 || !hatAkronym) return true;
  }
  return false;
}

/** Kürzel + Titel + SR aus dem Snapshot-erlass-Feld (z.B. 'Verfahrenskostendekret, VKD (BSG 161.12)'). */
export function identitaetAusErlass(erlass: string): { kuerzel: string; titel: string; sr: string | null } {
  const klammer = erlass.match(/\(([^)]*)\)\s*$/);
  const sr = klammer ? klammer[1].trim() : null;
  const vor = erlass.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (vor.includes(',')) {
    const idx = vor.lastIndexOf(',');
    const kuerzel = vor.slice(idx + 1).trim();
    const titel = vor.slice(0, idx).trim();
    // T2/S2: Last-Comma-Split nur akzeptieren, wenn der Tail kürzel-typisch ist.
    // Ist er ein Satzfragment, ist der ganze (klammerlose) String Kürzel UND Titel —
    // der Reader-Kopf zeigt dann den vollen Erlassnamen statt eines Fragmentsatzes.
    if (kuerzel && titel && !istKuerzelFragment(kuerzel)) {
      return { kuerzel, titel, sr };
    }
    return { kuerzel: vor, titel: vor, sr };
  }
  // Kein Komma: das Kürzel steht allein vor der Klammer; voller String als Titel
  // (sonst wäre Titel == Kürzel und nichtssagend).
  return { kuerzel: vor, titel: erlass.trim(), sr };
}

function ohneAnker(url: string): string {
  return url.split('#')[0];
}

/** U-PDF/A12: amtliches-PDF-Felder aus dem Sidecar (§8: nur wenn vorhanden). */
function pdfFelder(pq: PdfQuelle | undefined): { pdfUrl?: string; pdfStand?: string } {
  return pq ? { pdfUrl: pq.url, pdfStand: pq.stand } : {};
}

/** V2/K-1: «in Kraft seit»-Feld aus dem Sidecar (§8: nur wenn vorhanden = Bund). */
function inkraftFelder(iq: InkraftQuelle | undefined): { inkraftSeit?: string } {
  return iq ? { inkraftSeit: iq.datum } : {};
}

/** §8-Ehrlichkeit: Aufhebungs-Vermerk aus dem Register durchreichen (nur wenn
 *  deklariert; SSoT aufhebungen.ts → register.ts:mitAufhebung). */
function aufhebungFelder(reg: ErlassRegistereintrag): { aufgehoben?: ErlassRegistereintrag['aufgehoben'] } {
  return reg.aufgehoben ? { aufgehoben: reg.aufgehoben } : {};
}

function bundEintrag(reg: ErlassRegistereintrag, datei: NormSnapshotDatei, pq?: PdfQuelle, iq?: InkraftQuelle): BrowseErlass {
  return {
    key: reg.key, ebene: 'bund', kanton: null,
    kuerzel: reg.kuerzel, titel: reg.titel, sr: reg.sr ?? null,
    rechtsgebiet: reg.rechtsgebiet, sprache: reg.sprache, rang: reg.rang, status: 'snapshot',
    datei: `bund/${reg.key}.json`,
    artikelAnzahl: datei.eintraege.length,
    stand: spaetesterStand(datei),
    quelleUrl: ohneAnker(datei.eintraege[0]?.quelleUrl ?? ''),
    fassungsToken: datei.eintraege[0]?.fassungsToken ?? '',
    pdfPfad: null,
    ...pdfFelder(pq),
    ...inkraftFelder(iq),
    ...aufhebungFelder(reg),
  };
}

function kantonEintrag(stamm: string, datei: NormSnapshotDatei, pq?: PdfQuelle): BrowseErlass {
  const kanton = stamm.split('-')[0];
  const erstes = datei.eintraege[0];
  const { kuerzel, titel, sr } = identitaetAusErlass(erstes?.erlass ?? stamm);
  return {
    key: stamm, ebene: 'kanton', kanton,
    kuerzel, titel, sr,
    rechtsgebiet: kantonGebiet(stamm), sprache: spracheAusStamm(stamm), rang: 0, status: 'snapshot',
    datei: `kanton/${stamm}.json`,
    artikelAnzahl: datei.eintraege.length,
    stand: spaetesterStand(datei),
    quelleUrl: ohneAnker(erstes?.quelleUrl ?? ''),
    fassungsToken: erstes?.fassungsToken ?? '',
    pdfPfad: null,
    ...pdfFelder(pq),
  };
}

function liveLinkEintrag(reg: ErlassRegistereintrag): BrowseErlass {
  return {
    key: reg.key, ebene: reg.ebene, kanton: reg.kanton ?? null,
    kuerzel: reg.kuerzel, titel: reg.titel, sr: reg.sr ?? null,
    rechtsgebiet: reg.rechtsgebiet, sprache: reg.sprache, rang: reg.rang, status: 'nur-live-link',
    datei: null, artikelAnzahl: 0,
    stand: reg.stand ?? '', quelleUrl: reg.quelleUrl ?? '', fassungsToken: '',
    pdfPfad: null,
  };
}

// pdf-embed: amtliches PDF in-app (kein Snapshot-JSON). datei=null; pdfPfad trägt
// den gehosteten PDF-Pfad. Stand/quelleUrl aus dem Register (pdf-embed.ts).
function pdfEmbedEintrag(reg: ErlassRegistereintrag): BrowseErlass {
  return {
    key: reg.key, ebene: reg.ebene, kanton: reg.kanton ?? null,
    kuerzel: reg.kuerzel, titel: reg.titel, sr: reg.sr ?? null,
    rechtsgebiet: reg.rechtsgebiet, sprache: reg.sprache, rang: reg.rang, status: 'pdf-embed',
    datei: null, artikelAnzahl: 0,
    stand: reg.stand ?? '', quelleUrl: reg.quelleUrl ?? '', fassungsToken: '',
    pdfPfad: reg.pdfPfad ?? null,
  };
}

/** Deterministische Sortierung: Bund vor Kanton; Bund nach Gebiet→Rang→Key;
 *  Kanton nach Kanton→Gebiet→Kürzel→Key. */
function vergleiche(a: BrowseErlass, b: BrowseErlass): number {
  if (a.ebene !== b.ebene) return a.ebene === 'bund' ? -1 : 1;
  if (a.ebene === 'bund') {
    return GEBIET_RANG[a.rechtsgebiet] - GEBIET_RANG[b.rechtsgebiet]
      || a.rang - b.rang || a.key.localeCompare(b.key);
  }
  return (a.kanton ?? '').localeCompare(b.kanton ?? '')
    || GEBIET_RANG[a.rechtsgebiet] - GEBIET_RANG[b.rechtsgebiet]
    || a.kuerzel.localeCompare(b.kuerzel) || a.key.localeCompare(b.key);
}

/** Baut das Browse-Manifest aus Register + Snapshot-Dateien (rein, testbar). */
export function baueBrowseManifest(erzeugt: string, basis = NORMTEXT_DIR): BrowseManifest {
  const bundReg = new Map(ERLASS_REGISTER.filter((r) => r.ebene === 'bund').map((r) => [r.key, r]));
  const pdfQuellen = ladePdfQuellen(basis);
  const inkrafttreten = ladeInkrafttreten(basis);
  const erlasse: BrowseErlass[] = [];

  // Bund: jeder Snapshot MUSS einen Register-Eintrag haben (Orphan-Tor).
  for (const f of jsonDateien(join(basis, 'bund'))) {
    const stamm = f.replace(/\.json$/, '');
    const datei = ladeDatei(join(basis, 'bund', f));
    if (!datei) continue;
    const reg = bundReg.get(stamm);
    if (!reg) throw new Error(`browse-manifest: Bund-Snapshot ${stamm}.json ohne Register-Eintrag (ERLASS_REGISTER ergänzen).`);
    erlasse.push(bundEintrag(reg, datei, pdfQuellen[stamm], inkrafttreten[stamm]));
  }

  // Kanton: Identität aus Snapshot/Dateiname abgeleitet, Gebiet aus Register.
  for (const f of jsonDateien(join(basis, 'kanton'))) {
    const stamm = f.replace(/\.json$/, '');
    const datei = ladeDatei(join(basis, 'kanton', f));
    if (!datei) continue;
    erlasse.push(kantonEintrag(stamm, datei, pdfQuellen[stamm]));
  }

  // Register-Einträge ohne Snapshot ergänzen: 'nur-live-link' (externer Link) und
  // 'pdf-embed' (amtliches PDF in-app).
  for (const reg of ERLASS_REGISTER) {
    if (reg.status === 'nur-live-link') erlasse.push(liveLinkEintrag(reg));
    else if (reg.status === 'pdf-embed') erlasse.push(pdfEmbedEintrag(reg));
  }

  erlasse.sort(vergleiche);
  return { erzeugt, erlasse };
}

/** Schreibpfad des Browse-Manifests (relativ zur Repo-Wurzel). */
export const REGISTER_PFAD = join(NORMTEXT_DIR, 'register.json');

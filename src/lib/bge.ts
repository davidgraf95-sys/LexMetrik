// ─── Rechtsprechungs-Links: deterministische URLs für BGE und BGer-Urteile ──
//
// EINE Ableitungsregel statt 60+ gepflegter URLs (§5); Quelle der
// Aktenzeichen bleibt das Verifikations-Register (data/verifikation.ts).
//
// URL-Schemata empirisch verifiziert am 6.6.2026 (§7, WebFetch-Stichproben):
// · BGE (amtliche Sammlung): ATF-Permalink der BGer-Webdatenbank, zeigt den
//   Entscheid direkt — geprüft an BGE 139 III 78 (Regeste «Art. 145 Abs. 2
//   lit. b und Art. 314 Abs. 1 ZPO …»).
//     https://www.bger.ch/ext/eurospider/live/de/php/clir/http/index.php
//       ?highlight_docid=atf://139-III-78:de&lang=de&type=show_document
// · BGer-Urteile (z. B. 5A_691/2023): Der direkte AZA-Permalink enthält das
//   ENTSCHEIDDATUM, das aus dem Aktenzeichen nicht ableitbar ist — ehrlicher
//   Fallback ist der Suchlink der amtlichen Urteilsdatenbank (geprüft an
//   5A_691/2023: Urteil = erster Treffer). `direkt: false` kennzeichnet das.
//
// Dossier: bibliothek/rechtsprechung/bge-register.md

export interface RechtsprechungsLink {
  url: string;
  /** true = Permalink auf den Entscheid; false = amtliche Suche (Urteile). */
  direkt: boolean;
}

// BGE-Zitat: Band (1–3-stellig) · Teil (I, Ia, Ib, II, III, IV, V) · Seite.
// Teil-Liste abschliessend = real existierende Sammlungsteile; a/b-Suffixe
// gibt es nur bei Teil I (Ia/Ib, historisch). Die frühere Alternation
// akzeptierte auch IIa/IIIb/Va/VI und hätte dafür geratene ATF-Links
// erzeugt (Code-Review-Befund #3, 7.6.2026) — jetzt: lieber kein Link.
// Erwägungs-Zusätze («E. 3.2», «S. 81») gehören nicht in die Docid.
const BGE_MUSTER = /^BGE\s+(\d{1,3})\s+(III|II|I(?:a|b)?|IV|V)\s+(\d+)/;
// BGer-Urteilsnummer: Abteilungscode (z. B. 4A, 5A, 1C, 9C) _ Nummer / Jahr;
// alte Nummerierung vor 2007 mit Punkt (z. B. 4C.375/2000 — AZA-Suche
// findet sie als 1. Treffer, WebFetch-verifiziert 6.6.2026).
const URTEIL_MUSTER = /(\d[A-Z][._]\d+\/\d{4})/;

/**
 * Amtlicher Link zu einem zitierten Entscheid — oder null, wenn das
 * Aktenzeichen keinem der beiden verifizierten Schemata entspricht
 * (dann lieber kein Link als ein geratener, §7).
 */
export function rechtsprechungUrl(aktenzeichen: string): RechtsprechungsLink | null {
  const bge = BGE_MUSTER.exec(aktenzeichen.trim());
  if (bge) {
    const docid = `atf://${bge[1]}-${bge[2]}-${bge[3]}:de`;
    return {
      url: `https://www.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=${encodeURIComponent(docid)}&lang=de&type=show_document`,
      direkt: true,
    };
  }
  const urteil = URTEIL_MUSTER.exec(aktenzeichen.trim());
  if (urteil) {
    return {
      url: `https://www.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?lang=de&type=simple_query&query_words=${encodeURIComponent(urteil[1])}`,
      direkt: false,
    };
  }
  return null;
}

/**
 * Alle Rechtsprechungs-Zitate in einem Anzeigetext finden (für die
 * Verlinkung in der Web-Anzeige; der Text selbst bleibt unverändert).
 * Liefert [Vorher-Text, Zitat, Vorher-Text, Zitat, …, Rest].
 */
export const RECHTSPRECHUNG_IM_TEXT =
  /BGE\s+\d{1,3}\s+(?:III|II|I(?:a|b)?|IV|V)\s+\d+|(?:BGer\s+)?\d[A-Z][._]\d+\/\d{4}/g;

// ── Interne Verlinkungs-Brücke (Fahrplan 8.5): synchron + pure ──────────────
// Wenn ein im Text genanntes BGer-Aktenzeichen als Entscheid-Snapshot erfasst
// ist, zeigt der Link in den internen Reader statt extern auf bger.ch. ERFASST
// ist ein build-time generiertes Set (kein fetch, kein Flackern, golden-neutral
// für nicht erfasste Zitate).
import { ERFASST } from './rechtsprechung/erfasste-keys.generated';

/**
 * Interner Reader-Pfad ('/rechtsprechung/<key>') für ein BGer-Aktenzeichen, wenn
 * der Entscheid erfasst ist; sonst null (→ bestehender externer Link greift).
 */
export function internerRechtsprechungLink(aktenzeichen: string): string | null {
  const m = /(\d[A-Z])[._](\d+)\/(\d{4})/.exec(aktenzeichen.trim());
  if (!m) return null;
  const key = `bger_${m[1]}_${m[2]}_${m[3]}`;
  return ERFASST.has(key) ? `/rechtsprechung/${key}` : null;
}

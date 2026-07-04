// ─── Norm ↔ Werkzeug-Brücke (D1, Differenzierung) ───────────────────────────
//
// Aus einem Gesetz direkt zum passenden LexMetrik-Rechner/zur Vorlage — die
// Verknüpfung, die kein reiner Rechtstext-Anbieter (Fedlex/lexfind) hat, weil
// keiner Rechner UND Normtext führt.
//
// Deklarierte Zuordnung Erlass-Key (Bund) → Katalog-Karten-IDs. Die Karte liefert
// Titel + href ZUR LAUFZEIT (Single Source = startseiteConfig, §5); nicht
// verfügbare (geplante) Karten werden ausgeblendet → nie ein toter Link (§8).

import { ALLE_KARTEN, istVerfuegbar } from '../startseiteConfig';
import { ERLASS_REGISTER } from './register';
import { MATERIAL_REGISTER, behoerdeVon, DOKTYP_LABEL } from '../materialien/register';
import type { Herkunft } from '../verzahnung/typen';

// Exportiert für das Konsistenz-Tor (werkzeuge.test.ts): jede Karten-ID muss auf
// eine existierende Katalog-Karte zeigen — sonst verschluckt `werkzeugeFuerNorm`
// einen Tippfehler still (§8: kein toter Link, aber auch kein heimlich fehlendes
// Werkzeug).
export const ERLASS_WERKZEUGE: Readonly<Record<string, string[]>> = {
  OR: ['kuendigung-sperrfristen', 'lohnfortzahlung', 'ferienanspruch', 'dreizehnter-monatslohn', 'ueberstunden-zuschlag', 'verjaehrung', 'verzugszins', 'schadenszins', 'gewaehrleistung', 'mietrecht', 'mietzinsanpassung', 'arbeitsvertrag', 'mietvertrag-wohnen', 'auftrag', 'werkvertrag', 'mahnung'],
  ZGB: ['erbrecht-fristen', 'erbteilung', 'erb-ausgleichung', 'gueterrecht-vorschlag', 'vorsorgeausgleich', 'eigenhaendiges-testament', 'oeffentliches-testament', 'vorsorgeauftrag', 'patientenverfuegung'],
  ZPO: ['prozesskosten', 'zustaendigkeit', 'zpo-fristen', 'streitwert', 'kostenvorschuss', 'parteientschaedigung-sicherheit', 'schlichtungsgesuch', 'klage-vereinfacht', 'klage-ordentlich'],
  SCHKG: ['schkg-fristen', 'betreibungskosten', 'schkg-zustaendigkeit', 'rechtsoeffnungsbegehren', 'rechtsvorschlag', 'nichtbekanntgabe-betreibung'],
  GEBV_SCHKG: ['betreibungskosten'],
  STGB: ['straf-verjaehrung', 'straf-zustaendigkeit', 'strafanzeige', 'strafantrag-vorlage'],
  STPO: ['straf-zustaendigkeit', 'einsprache'],
  BGG: ['bgg-fristen', 'bundesgerichtsgebuehren', 'rechtsmittelpruefung'],
  VVG: ['klage-vvg-leistungen'],
  HREGV: ['gmbh-gruendung', 'ag-gruendung', 'statuten', 'gv-vr-beschluss'],
  ARG: ['ferienanspruch', 'ueberstunden-zuschlag', 'dreizehnter-monatslohn', 'lohnfortzahlung'],
  VMWG: ['mietrecht', 'mietzinsanpassung'],
  // Stubs mit passenden Werkzeugen:
  DBG: ['steuer-verjaehrung'],
  STG: ['steuer-verjaehrung'],
  AHVG: ['ahv-beitraege'],
  AIG: ['auslaenderrecht-fristen'],
  DSG: ['datenschutz-fristen'],
};

export interface Werkzeug { id: string; titel: string; href: string; modus: 'rechner' | 'vorlage' }

/**
 * Norm↔Werkzeug-Index (ROADMAP Schritt 2): verfügbare Werkzeuge (Rechner/
 * Vorlagen) zu einem Erlass-Key, in deklarierter Reihenfolge. Erlass-granular
 * und ehrlich — nicht verfügbare/geplante Karten werden ausgeblendet (§8).
 */
export function werkzeugeFuerNorm(key: string): Werkzeug[] {
  const ids = ERLASS_WERKZEUGE[key];
  if (!ids) return [];
  const out: Werkzeug[] = [];
  for (const id of ids) {
    const k = ALLE_KARTEN.find((c) => c.id === id);
    if (k && istVerfuegbar(k) && k.href) out.push({ id, titel: k.title, href: k.href, modus: k.modus });
  }
  return out;
}

/**
 * Werkzeuge zu den ANGEWANDTEN Normen eines Entscheids (transitiv über die
 * Norm↔Werkzeug-Brücke). Grob (Erlass-Granularität) → «auch relevant»-Klasse,
 * Status 'maschinell'; keine kuratierte Empfehlung (§8). Dedupliziert.
 */
export function werkzeugeFuerEntscheid(normKeys: string[]): Werkzeug[] {
  const seen = new Set<string>();
  const out: Werkzeug[] = [];
  for (const k of normKeys) {
    for (const w of werkzeugeFuerNorm(k)) {
      if (!seen.has(w.id)) { seen.add(w.id); out.push(w); }
    }
  }
  return out;
}

export interface MassgebenderErlass { key: string; kuerzel: string; titel: string; pfad: string }

/**
 * Inverse Norm↔Werkzeug-Brücke (W2.1): Erlasse mit Volltext-Detailseite
 * (status 'snapshot' → kein toter Link, §8), die mindestens ein verfügbares
 * Werkzeug des gegebenen Modus tragen — für den «Massgebende Gesetze»-Block der
 * Rubrik-Übersichten (interne Verlinkung Werkzeug → Norm-Detailseite). Reihenfolge
 * = ERLASS_REGISTER (rang/Gebiet). Pfad-Keys sind Bund (sauber, keine Kodierung).
 */
export function massgebendeErlasse(modus: 'rechner' | 'vorlage'): MassgebenderErlass[] {
  const out: MassgebenderErlass[] = [];
  for (const e of ERLASS_REGISTER) {
    if (e.status !== 'snapshot') continue;
    if (!werkzeugeFuerNorm(e.key).some((w) => w.modus === modus)) continue;
    out.push({ key: e.key, kuerzel: e.kuerzel, titel: e.titel, pfad: `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}` });
  }
  return out;
}

// ─── Norm ↔ Material-Brücke (Auftrag 5, additiv) ────────────────────────────
//
// Inverse zu MaterialRegistereintrag.normKeys: zu einem Erlass-Key die amtlichen
// Materialien (Kreisschreiben/Wegleitungen/Leitfäden …), die ihn auslegen — für
// einen «Materialien zu diesem Erlass»-Block im Gesetze-Reader (Burggraben:
// Norm + Behördenpraxis an einer Stelle). Reine Daten-Projektion aus dem
// MATERIAL_REGISTER (§3); Reihenfolge = Behörde-rang → eigener rang.

export interface MaterialBezug {
  key: string; titel: string; behoerdeKuerzel: string; doktypLabel: string;
  nummer: string | null; pfad: string;
  /** §8-Herkunft. In-Bundle-kuratierte Materialien sind 'kuratiert'; die asynchron
   *  geladenen Soft-Law-Kanten (kontextSoftLaw) tragen die Adapter-quelle. */
  herkunft: Herkunft;
  /** Stand der Dokument-Fassung (ISO) — Chip-Anzeige + Staleness-Klassifikation (§2.4). */
  stand: string;
  /** Repräsentativer Korpus-Artikel-Token für DIESEN Erlass (Staleness §2.4). */
  artikel?: string;
  /** Fundstellen-Sublabel («via Art. 24») oder undefined (Erlass-Ebene). */
  sublabel?: string;
}

export function materialienFuerNorm(normKey: string): MaterialBezug[] {
  const out: MaterialBezug[] = [];
  for (const m of MATERIAL_REGISTER) {
    if (!(m.normKeys ?? []).includes(normKey)) continue;
    // Kuratierter artikelscharfer Bezug für DIESEN Erlass (E6a·M5, §2.4/§7).
    const bezug = m.artikelBezuege?.find((b) => b.erlass === normKey);
    out.push({
      key: m.key,
      titel: m.titel,
      behoerdeKuerzel: behoerdeVon(m.behoerde).kuerzel,
      doktypLabel: DOKTYP_LABEL[m.doktyp],
      nummer: m.nummer ?? null,
      pfad: `/materialien/${encodeURIComponent(m.key)}`,
      herkunft: 'kuratiert',
      stand: m.stand,
      artikel: bezug?.artikel,
      sublabel: bezug ? `via Art. ${bezug.artikel.replace(/_/g, '')}` : undefined,
    });
  }
  return out.sort((a, b) => a.behoerdeKuerzel.localeCompare(b.behoerdeKuerzel) || a.key.localeCompare(b.key));
}

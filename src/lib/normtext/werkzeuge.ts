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

const ERLASS_WERKZEUGE: Readonly<Record<string, string[]>> = {
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

/** Verfügbare Werkzeuge (Rechner/Vorlagen) zu einem Erlass-Key, in Reihenfolge. */
export function werkzeugeFuer(key: string): Werkzeug[] {
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
    for (const w of werkzeugeFuer(k)) {
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
    if (!werkzeugeFuer(e.key).some((w) => w.modus === modus)) continue;
    out.push({ key: e.key, kuerzel: e.kuerzel, titel: e.titel, pfad: `/gesetze/${e.ebene}/${e.key}` });
  }
  return out;
}

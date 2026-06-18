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

// ─── Startseiten-Konfiguration: schlankes Barrel (§6 Datei-Schlankheit) ────
//
// Typen + Sektionen → ./startseiteConfigTypen
// Rechner-Karten    → ./startseiteKarten (KARTEN)
// Vorlagen-Karten   → ./startseiteVorlagen (VORLAGEN)
// Diese Modul-Familie bleibt die Single source of truth für den Katalog (§5).
export * from './startseiteConfigTypen';
import type { CalculatorCard, CatalogItem, Status } from './startseiteConfigTypen';
import { KARTEN } from './startseiteKarten';
import { VORLAGEN } from './startseiteVorlagen';

export function karte(id: string): CalculatorCard {
  return KARTEN[id] ?? VORLAGEN[id];
}

/** Flacher Katalog (beide Modi); Anzeige je Sektion: geprüfte zuerst, danach «In Vorbereitung». */
// «Verfügbar» als abgeleitetes Konzept (Pro-Katalog-Auftrag 5.6.2026,
// Phase 1): entwurf ODER geprüft = gebaut/nutzbar. EINZIGES Wahrheits-
// kriterium für Tabs, Zähler, Sektionsfilter und Schnellzugriff – wird ein
// Eintrag später auf «geprüft» gehoben, bleibt er automatisch verfügbar.
export function istVerfuegbar(item: { status: Status }): boolean {
  return item.status !== 'geplant';
}

export const ALLE_KARTEN: CatalogItem[] = [...Object.values(KARTEN), ...Object.values(VORLAGEN)];

/** Karten mit eigenem Katalog-/Such-Eintrag (Konsolidierung 7.6.2026):
 *  imKatalog:false-Karten bleiben SSoT ihrer Seiten und über die Themen-
 *  Einstiege + Seiten-Links erreichbar, erscheinen aber nicht im Register. */
export const KATALOG_KARTEN: CatalogItem[] = ALLE_KARTEN.filter((k) => k.imKatalog !== false);

// ─── Zentrale Rechner-Registry ────────────────────────────────────────────
//
// Einzige Quelle für Navigation UND Startseiten-Raster. Neue Rechner werden
// ausschliesslich hier registriert (+ eigene Seite unter src/pages).
//
// Normentreue: Die `normen`-Einträge erscheinen 1:1 als Chips. Keine
// Artikelnummern erfinden; fehlt eine gesicherte Angabe, bleibt das Feld allgemein.

export type CalcStatus = 'entwurf' | 'geprüft' | 'in Vorbereitung' | 'geplant';

export interface Calculator {
  slug: string;            // URL: /rechner/<slug>
  /** Detailseiten-Titel = Katalog-Kartentitel (Vereinheitlichung 7.6.2026, §5 — bei Karten-Umbenennung hier nachziehen; Test katalogTitel deckt die Paare). */
  titel: string;
  kategorie: string;       // Overline, z. B. "Arbeitsrecht"
  kurzbeschrieb: string;
  normen: string[];        // Chips – exakter Gesetzeswortlaut
  status: CalcStatus;
  icon: string;            // Schlüssel auf eine Icon-Komponente
}

export const CALCULATORS: Calculator[] = [
  { slug: 'kuendigung', titel: 'Kündigung & Fristen im Arbeitsverhältnis', kategorie: 'Arbeitsrecht',
    kurzbeschrieb: 'Kündigungs- und Sperrfristen sowie Lohnfortzahlung nach kantonaler Skala.',
    normen: ['Art. 324a OR', 'Art. 335c OR', 'Art. 336c OR'], status: 'entwurf', icon: 'document' },
  // Abweichung von der Bau-Anweisung: ZPO-Rechner ist in diesem Repo bereits
  // implementiert und getestet → Status 'geprüft' statt 'in Vorbereitung'.
  { slug: 'zpo-fristen', titel: 'Verfahrens- & Rechtsmittelfristen', kategorie: 'Zivilprozess',
    kurzbeschrieb: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    normen: ['Art. 142–147 ZPO'], status: 'entwurf', icon: 'clock' },
  { slug: 'verzugszins', titel: 'Verzugszins', kategorie: 'Obligationenrecht',
    kurzbeschrieb: 'Verzugszins bei Schuldnerverzug – Zeitraum, Satz und Betrag.',
    normen: ['Art. 104 OR'], status: 'entwurf', icon: 'percent' },
  { slug: 'erbteilung', titel: 'Pflichtteil & verfügbare Quote', kategorie: 'Erbrecht',
    kurzbeschrieb: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote – mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
    normen: ['Art. 457 ff. ZGB', 'Art. 470 f. ZGB'], status: 'entwurf', icon: 'scale' },
  { slug: 'erb-fristen', titel: 'Erbrecht – Fristen', kategorie: 'Erbrecht',
    kurzbeschrieb: 'Ausschlagung, öffentliches Inventar sowie Ungültigkeits-, Herabsetzungs- und Erbschaftsklage – 15 Tatbestände mit exaktem Fristbeginn.',
    normen: ['Art. 567 ff. ZGB', 'Art. 521 ZGB', 'Art. 533 ZGB'], status: 'entwurf', icon: 'clock' },
  { slug: 'mietrecht', titel: 'Kündigung & Fristen im Mietverhältnis', kategorie: 'Mietrecht',
    kurzbeschrieb: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume – mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
    normen: ['Art. 266a–o OR', 'Art. 257d OR', 'Art. 257f OR'], status: 'entwurf', icon: 'house' },
  { slug: 'schkg-fristen', titel: 'Betreibungs- & Konkursfristen', kategorie: 'SchKG',
    kurzbeschrieb: 'Fristen im Betreibungs- und Konkursverfahren mit Betreibungsferien (Art. 63 SchKG) und ZPO-Stillstand für gerichtliche Klagen.',
    normen: ['Art. 56 SchKG', 'Art. 63 SchKG', 'Art. 145 ZPO'], status: 'entwurf', icon: 'clipboard' },
  { slug: 'verjaehrung', titel: 'Verjährung', kategorie: 'Obligationenrecht',
    kurzbeschrieb: 'Verjährung vertraglicher, deliktischer und bereicherungsrechtlicher Forderungen – mit Stillstand, Unterbrechung und Einredeverzicht.',
    normen: ['Art. 60 OR', 'Art. 67 OR', 'Art. 127 OR', 'Art. 128 OR', 'Art. 132 OR'], status: 'entwurf', icon: 'clock' },
  { slug: 'gewaehrleistung', titel: 'Gewährleistung & Mängelrüge', kategorie: 'Obligationenrecht',
    kurzbeschrieb: 'Rüge- und Verjährungsfristen bei Kauf, Werkvertrag und Grundstückkauf – mit Zwei-Regime-Weiche zur Baumängel-Revision 2026.',
    normen: ['Art. 201 OR', 'Art. 210 OR', 'Art. 219a OR', 'Art. 367 OR', 'Art. 371 OR'], status: 'entwurf', icon: 'house' },
  { slug: 'teuerung', titel: 'Teuerungsrechner (LIK-Indexierung)', kategorie: 'Übergreifend',
    kurzbeschrieb: 'Indexierung von Beträgen nach dem Landesindex der Konsumentenpreise – Indexmiete (100 %-Weitergabe), Unterhaltsbeiträge und generische Wertsicherung, mit amtlicher BFS-Reihe und automatischer Basis-Wahl.',
    normen: ['Art. 269b OR', 'Art. 17 VMWG', 'Art. 286 ZGB', 'Art. 128 ZGB'], status: 'entwurf', icon: 'percent' },
  // S-3 Struktur-Umbau 10.6.2026: Registry-Titel = Zivil-Default; die
  // SchKG-/Straf-Sichten überschreiben Titel/Kategorie/Normen im Kopf
  // (HERO_JE_RECHTSWEG, reine Anzeige §3).
  { slug: 'zustaendigkeit', titel: 'Zuständigkeit Zivilprozess', kategorie: 'Zivilprozess',
    kurzbeschrieb: 'Verfahrensart, Schlichtungspflicht und -behörde sowie örtlicher Gerichtsstand nach ZPO (Fassung 1.1.2025) – mit Handelsgerichts- und Direktklage-Weichen; konkrete Stelle mit Adresse für erfasste Kantone (BS).',
    normen: ['Art. 197 ZPO', 'Art. 199 ZPO', 'Art. 200 ZPO', 'Art. 210 ZPO', 'Art. 243 ZPO'], status: 'entwurf', icon: 'scale' },
  { slug: 'tagerechner', titel: 'Fristenrechner (Tage · ZPO · SchKG)', kategorie: 'Übergreifend',
    kurzbeschrieb: 'Ein Fristenrechner für die meisten Verfahren: Allgemein nach Art. 77/78 OR (Ereignistag zählt nicht, Monatsende-Klemmung, Werktag-Verschiebung), Zivilprozess mit Stillstand (Art. 145 ZPO) und Betreibung mit Betreibungsferien/Rechtsstillstand (Art. 56 ff. SchKG) – drei getrennte Engines, ein Einstieg.',
    normen: ['Art. 77 OR', 'Art. 78 OR', 'Art. 145 ZPO', 'Art. 56 SchKG'], status: 'entwurf', icon: 'clock' },
  { slug: 'streitwert', titel: 'Streitwert (ZPO)', kategorie: 'Zivilprozess',
    kurzbeschrieb: 'Streitwert aus den Rechtsbegehren nach Art. 91–94a ZPO – Kapitalisierung wiederkehrender Leistungen (× 20), Klagenhäufung, Widerklage mit getrennter Kosten-Bemessungsgrundlage und Teilklage-Sonderregel der Revision 2025.',
    normen: ['Art. 91 ZPO', 'Art. 92 ZPO', 'Art. 93 ZPO', 'Art. 94 ZPO'], status: 'entwurf', icon: 'percent' },
  { slug: 'betreibungskosten', titel: 'Betreibungskosten (GebV SchKG)', kategorie: 'SchKG',
    kurzbeschrieb: 'Amtliche Gebühren je Betreibungsschritt nach der GebV SchKG (Stand 1.1.2026): Zahlungsbefehl, Pfändung, Verwertung, Einzahlung als Punktwerte; Entscheidgebühren (z. B. Rechtsöffnung) ehrlich als Rahmen; Auslagen und Überwälzung (Art. 68 SchKG) als Hinweis.',
    normen: ['Art. 16 GebV SchKG', 'Art. 20 GebV SchKG', 'Art. 30 GebV SchKG', 'Art. 48 GebV SchKG', 'Art. 68 SchKG'], status: 'entwurf', icon: 'percent' },
  { slug: 'prozesskosten', titel: 'Prozesskosten (Gerichts- & Parteikosten)', kategorie: 'Zivilprozess',
    kurzbeschrieb: 'Gerichtskosten (Entscheidgebühr) und Parteientschädigung im erstinstanzlichen Zivilprozess nach Streitwert – amtlich verifizierte Tarife aller 26 Kantone, mit interkantonaler Vergleichstabelle. Kostenlose Verfahren (Art. 113/114 ZPO) und Schlichtung/Entscheid berücksichtigt; Ermessenstarife als Spanne.',
    normen: ['Art. 95 ZPO', 'Art. 96 ZPO', 'Art. 98 ZPO', 'Art. 113 ZPO', 'Art. 114 ZPO'], status: 'entwurf', icon: 'percent' },
  { slug: 'notariat-grundbuch', titel: 'Notariats- & Grundbuchkosten (Grundstückkauf)', kategorie: 'Immobilien',
    kurzbeschrieb: 'Erwerbs-Nebenkosten beim Grundstückkauf aller 26 Kantone: Beurkundungsgebühr (Notariat) + Grundbucheintrag, optional Grundpfand (Schuldbrief) und Handänderungssteuer – kantonale Tarife mit amtlicher Quelle, interkantonaler Vergleich. Aufwand-/Verhandlungstarife (freies Notariat) ehrlich als Spanne; Handänderungssteuer als getrennter Steuerblock.',
    normen: ['Art. 657 ZGB', 'Art. 216 OR'], status: 'entwurf', icon: 'percent' },
  { slug: 'bgg-fristen', titel: 'Beschwerde ans Bundesgericht (BGG)', kategorie: 'Übergreifend',
    kurzbeschrieb: 'Weiterzug ans Bundesgericht für alle vier Beschwerdewege: Zulässigkeit (Streitwertgrenzen Art. 74 BGG mit Ausnahmen), Beschwerdefrist 30/10/5/3 Tage mit Stillstand (Art. 100/46 BGG) und konkretem Fristende, zuständige Abteilung nach BGerR – inkl. subsidiärer Verfassungsbeschwerde.',
    normen: ['Art. 74 BGG', 'Art. 100 BGG', 'Art. 46 BGG', 'Art. 113 BGG', 'Art. 33 BGerR'], status: 'entwurf', icon: 'scale' },
  // S-5c 10.6.2026: Fristenspiegel aufgelöst (Ereignis-Blöcke in den Fach-
  // Rechnern; /rechner/fristenspiegel = Redirect mit Query-Weiterreichung).
];

export function getCalculator(slug: string): Calculator | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

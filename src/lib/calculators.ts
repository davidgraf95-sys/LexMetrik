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
  titel: string;
  kategorie: string;       // Overline, z. B. "Arbeitsrecht"
  kurzbeschrieb: string;
  normen: string[];        // Chips – exakter Gesetzeswortlaut
  status: CalcStatus;
  icon: string;            // Schlüssel auf eine Icon-Komponente
}

export const CALCULATORS: Calculator[] = [
  { slug: 'kuendigung', titel: 'Kündigung & Lohnfortzahlung', kategorie: 'Arbeitsrecht',
    kurzbeschrieb: 'Kündigungs- und Sperrfristen sowie Lohnfortzahlung nach kantonaler Skala.',
    normen: ['Art. 324a OR', 'Art. 335c OR', 'Art. 336c OR'], status: 'geprüft', icon: 'document' },
  // Abweichung von der Bau-Anweisung: ZPO-Rechner ist in diesem Repo bereits
  // implementiert und getestet → Status 'geprüft' statt 'in Vorbereitung'.
  { slug: 'zpo-fristen', titel: 'ZPO-Fristen', kategorie: 'Zivilprozess',
    kurzbeschrieb: 'Verfahrens- und Rechtsmittelfristen mit Gerichtsferien und Stillstand.',
    normen: ['Art. 142–147 ZPO'], status: 'geprüft', icon: 'clock' },
  { slug: 'verzugszins', titel: 'Verzugszins', kategorie: 'Obligationenrecht',
    kurzbeschrieb: 'Verzugszins bei Schuldnerverzug — Zeitraum, Satz und Betrag.',
    normen: ['Art. 104 OR'], status: 'geprüft', icon: 'percent' },
  { slug: 'erbteilung', titel: 'Erbteilung & Pflichtteil', kategorie: 'Erbrecht',
    kurzbeschrieb: 'Gesetzliche Erbteile, Pflichtteile und verfügbare Quote — mit Todesdatum-Weiche für die Revision 2023 und güterrechtlicher Vorstufe.',
    normen: ['Art. 457 ff. ZGB', 'Art. 470 f. ZGB'], status: 'geprüft', icon: 'scale' },
  { slug: 'mietrecht', titel: 'Mietrecht — Fristen', kategorie: 'Mietrecht',
    kurzbeschrieb: 'Kündigungstermine und -fristen für Wohn- und Geschäftsräume — mit Termin-Hierarchie, Formprüfung und ausserordentlichen Kündigungen.',
    normen: ['Art. 266a–o OR', 'Art. 257d OR', 'Art. 257f OR'], status: 'geprüft', icon: 'house' },
  { slug: 'schkg-fristen', titel: 'Betreibungsfristen', kategorie: 'SchKG',
    kurzbeschrieb: 'Fristen im Betreibungs- und Konkursverfahren mit Betreibungsferien (Art. 63 SchKG) und ZPO-Stillstand für gerichtliche Klagen.',
    normen: ['Art. 56 SchKG', 'Art. 63 SchKG', 'Art. 145 ZPO'], status: 'geprüft', icon: 'clipboard' },
  { slug: 'verjaehrung', titel: 'Verjährung', kategorie: 'Obligationenrecht',
    kurzbeschrieb: 'Verjährung vertraglicher, deliktischer und bereicherungsrechtlicher Forderungen — mit Stillstand, Unterbrechung und Einredeverzicht.',
    normen: ['Art. 60 OR', 'Art. 67 OR', 'Art. 127 OR', 'Art. 128 OR', 'Art. 132 OR'], status: 'geprüft', icon: 'clock' },
  { slug: 'gewaehrleistung', titel: 'Gewährleistung & Mängelrüge', kategorie: 'Obligationenrecht',
    kurzbeschrieb: 'Rüge- und Verjährungsfristen bei Kauf, Werkvertrag und Grundstückkauf — mit Zwei-Regime-Weiche zur Baumängel-Revision 2026.',
    normen: ['Art. 201 OR', 'Art. 210 OR', 'Art. 219a OR', 'Art. 367 OR', 'Art. 371 OR'], status: 'geprüft', icon: 'house' },
];

export function getCalculator(slug: string): Calculator | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

export const calcPath = (slug: string) => `/rechner/${slug}`;

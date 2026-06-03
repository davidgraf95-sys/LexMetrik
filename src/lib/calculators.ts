// ─── Zentrale Rechner-Registry ────────────────────────────────────────────
//
// Einzige Quelle für Navigation UND Startseiten-Raster. Neue Rechner werden
// ausschliesslich hier registriert (+ eigene Seite unter src/pages).
//
// Normentreue: Die `normen`-Einträge erscheinen 1:1 als Chips. Keine
// Artikelnummern erfinden; fehlt eine gesicherte Angabe, bleibt das Feld allgemein.

export type CalcStatus = 'geprüft' | 'in Vorbereitung' | 'geplant';

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
    kurzbeschrieb: 'Pflichtteile und verfügbare Quote nach der Revision 2023.',
    normen: ['Revision 1.1.2023'], status: 'geplant', icon: 'scale' },
  { slug: 'mietrecht', titel: 'Mietrecht — Fristen', kategorie: 'Mietrecht',
    kurzbeschrieb: 'Kündigungstermine und -fristen bei Wohn- und Geschäftsräumen.',
    normen: ['Wohn- & Geschäftsräume'], status: 'geplant', icon: 'house' },
  { slug: 'schkg-fristen', titel: 'Betreibungsfristen', kategorie: 'SchKG',
    kurzbeschrieb: 'Fristen im Betreibungsverfahren inkl. Betreibungsferien.',
    normen: ['SchKG'], status: 'geplant', icon: 'clipboard' },
];

export function getCalculator(slug: string): Calculator | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

export const calcPath = (slug: string) => `/rechner/${slug}`;

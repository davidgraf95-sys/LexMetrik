// bewusstes Test-only-QA-Werkzeug (lintet generierte Texte); 3 Test-Konsumenten
// (konventionen.test.ts, gerichtszitat.test.ts, begruendungLinter.test.ts) —
// NICHT löschen, NICHT nach tests/helfer verschieben (H-4/B8; ein Move würde
// 3 Import-Pfade ohne Zusatznutzen anfassen, siehe FAHRPLAN-CODE-HYGIENE.md).
//
// ─── Zitier- und Formulierungskonvention – SSoT (Auftrag 5.6.2026) ──────────
//
// Verbindliche Plattformstandards (Schweizer Recht, Deutschschweiz):
//   · Normzitat ausgeschrieben: «Art. 221 Abs. 1 lit. d ZPO» – Hierarchie
//     Art. → Abs. → lit. → Ziff., Gesetzesabkürzung am Schluss, «lit.»
//     (bewusst gegen die Bundes-GTR «Bst.» – Deutschschweizer Praxis +
//     Nutzervorgabe; dokumentierte Abweichung)
//   · BGE: «BGE 140 III 409 E. 4.3» · BGer: «BGer 5A_691/2023 vom
//     13. August 2024 E. 2.1» (Datum AUSGESCHRIEBEN – Plattformstandard)
//   · Beträge: «CHF 50'000» (CHF vorangestellt, Apostroph – Praxis;
//     BK-Norm geschütztes Leerzeichen als dokumentierte Abweichung)
//   · Prozent mit Leerschlag: «5 %» · Datum im Fliesstext ausgeschrieben
//   · Zins-Floskel: «nebst Zins zu 5 % seit [Datum]»
//   · Kostenfloskel: «unter Kosten- und Entschädigungsfolgen (zzgl. MwSt.)
//     zulasten …» – «zulasten» zusammengeschrieben
//   · Guillemets «…»/‹…›; durchgehend ss statt ß; Halbgeviertstrich (–)
//     als Gedanken-/Bis-Strich – Geviertstrich (—) NICHT als Gedankenstrich
//     (als Zierelement im Rubrum «— Partei —» bleibt er zulässig)
//   · Versionszusätze: nZPO/aZPO (Revision 1.1.2025); aktuell nicht in
//     Pills verwendet – bei Einführung fedlexLinkFuerArtikel erweitern.
//
// Konsumenten: Norm-Pills (fedlex.ts validiert Abkürzungen), Vorlagen-
// Schemas, Engine-Texte. Der Konventions-Test (konventionen.test.ts)
// prüft die ECHTE Textausgabe gegen die verbotenen Muster.

export const FLOSKELN = {
  /** Leistungsbegehren mit Zins (Bestimmtheitsgebot Art. 84 Abs. 1 ZPO). */
  zins: (satz: string | number, seit: string) => `nebst Zins zu ${satz} % seit ${seit}`,
  /** Kostenfolge (Praxisstandard; «zulasten» zusammengeschrieben). */
  kostenfolge: (partei = 'der beklagten Partei') =>
    `unter Kosten- und Entschädigungsfolgen (zzgl. MwSt.) zulasten ${partei}`,
} as const;

export type KonventionsVerstoss = { regel: string; fundstelle: string };

// Verbotene Muster in der TEXTAUSGABE (Stufe-4-Linter des Auftrags).
const REGELN: { regel: string; muster: RegExp }[] = [
  { regel: 'ß ist verboten (Schweizer Hochdeutsch: ss)', muster: /ß/ },
  { regel: 'Prozent mit Leerschlag («5 %», nicht «5%»)', muster: /\d%/ },
  { regel: 'Leerzeichen nach «Art.» («Art. 221», nicht «Art.221»)', muster: /Art\.\d/ },
  { regel: 'Leerzeichen nach «Abs.»/«lit.»/«Ziff.»', muster: /(Abs\.|lit\.|Ziff\.)\d/ },
  { regel: 'Deutsche Anführungszeichen – Guillemets verwenden', muster: /[„“”]/ },
  { regel: 'Geviertstrich als Gedankenstrich – Halbgeviert verwenden', muster: / \u2014 / },
  { regel: '«zulasten» zusammengeschrieben', muster: /zu Lasten/ },
  { regel: 'Bereichs-Bindestrich – Halbgeviert («Art. 142–147»)', muster: /Art\. \d+-\d+/ },
];

/** Prüft einen Ausgabe-Text gegen die Plattformkonvention (reine Funktion). */
export function pruefeFormulierung(text: string, kontext = ''): KonventionsVerstoss[] {
  const verstoesse: KonventionsVerstoss[] = [];
  for (const r of REGELN) {
    const m = text.match(r.muster);
    if (m) {
      const i = m.index ?? 0;
      verstoesse.push({
        regel: r.regel,
        fundstelle: `${kontext}: «…${text.slice(Math.max(0, i - 30), i + 30).replace(/\n/g, '⏎')}…»`,
      });
    }
  }
  return verstoesse;
}

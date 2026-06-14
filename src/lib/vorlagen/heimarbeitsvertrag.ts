// Dossier: bibliothek/recherche/arbeitsvertrag-untertypen.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtCHF, zahl } from './datum';
import { type Detailgrad, DETAILGRAD_DEFAULT, AB_STANDARD, NUR_EXPERTE } from './detailgrad';

// ─── Heimarbeitsvertrag (Art. 351–354 OR) — Sonderregime ────────────────────
//
// FAHRPLAN-VERTRAGS-VARIANTEN P1e: eigenes Schema (§4 regime-treu). Wortlaute
// am Filestore-Cache verifiziert (14.6.2026, OR 20260101;
// bibliothek/recherche/arbeitsvertrag-untertypen.md §4):
// - Art. 351 (Begriff: Arbeiten im Lohn in der eigenen Wohnung / einem selbst
//   bestimmten Arbeitsraum, allein oder mit Familienangehörigen).
// - Art. 351a (Bekanntgabe vor jeder Ausgabe; schriftlich Material-
//   Entschädigung und Lohn; sonst übliche Bedingungen).
// - Art. 352 (rechtzeitig beginnen/fertigstellen/abliefern; unentgeltliche
//   Verbesserung bei verschuldeten Mängeln).
// - Art. 352a (Material/Geräte sorgfältig behandeln, Rechenschaft, Rückgabe;
//   Mängelmeldung; Haftung bei schuldhaftem Verderben höchstens Selbstkosten).
// - Art. 353 (Prüfung nach Ablieferung; Mängel innert einer Woche, sonst
//   abgenommen).
// - Art. 353a (Lohnzahlung: ununterbrochener Dienst halbmonatlich oder mit
//   Zustimmung Monatsende, sonst bei Ablieferung; schriftliche Abrechnung).
// - Art. 353b (ununterbrochener Dienst → Lohn nach 324/324a bei Annahmeverzug
//   oder unverschuldeter Verhinderung; sonst nicht).
// - Art. 354 (Probearbeit → bestimmte Zeit zur Probe; ununterbrochener Dienst
//   → unbefristet vermutet, sonst befristet).
// Begleitend öffentlich-rechtlich: Heimarbeitsgesetz (HArG, SR 822.31) – Hinweis.

export type HaAntworten = {
  detailgrad: Detailgrad;
  // Parteien
  arbeitgeberName: string;
  arbeitgeberAdresse: string;
  heimarbeiterVorname: string;
  heimarbeiterName: string;
  heimarbeiterAdresse: string;
  // Arbeit
  arbeitsbeschrieb: string;          // welche Arbeiten
  arbeitsraum: string;               // Wohnung / anderer Arbeitsraum
  ununterbrochen: boolean;           // ununterbrochen im Dienst (353a/353b/354)
  // Lohn
  lohnAngabe: string;                // z. B. «CHF 4.50 pro Stück» oder Monatslohn
  lohnEinheit: string;               // z. B. «pro Stück», «pro Stunde», «pro Monat»
  // Material
  materialVomArbeitgeber: boolean;   // Material/Geräte gestellt (352a)
  materialBeschafftHeimarbeiter: boolean; // Heimarbeiter beschafft Material (351a Entschädigung)
  materialEntschaedigung: string;    // schriftliche Entschädigung dafür
  // Probe
  probearbeit: boolean;              // 354
  // Abschluss
  ort: string;
  datum: string;                     // ISO
};

export const HA_DEFAULTS: HaAntworten = {
  detailgrad: DETAILGRAD_DEFAULT,
  arbeitgeberName: '', arbeitgeberAdresse: '',
  heimarbeiterVorname: '', heimarbeiterName: '', heimarbeiterAdresse: '',
  arbeitsbeschrieb: '', arbeitsraum: 'in der Wohnung des Heimarbeitnehmers',
  ununterbrochen: true,
  lohnAngabe: '', lohnEinheit: 'pro Stück',
  materialVomArbeitgeber: true, materialBeschafftHeimarbeiter: false, materialEntschaedigung: '',
  probearbeit: false,
  ort: '', datum: '',
};

// ── Gates (deterministisch, normverifiziert) ────────────────────────────────

export type HaGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeHaGates(a: HaAntworten): HaGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // G1 — Bekanntgabe vor Ausgabe: Lohn und Material-Entschädigung schriftlich
  // (Art. 351a OR). Fehlt die schriftliche Angabe, gelten die üblichen
  // Bedingungen – kein Blocker, aber offengelegt.
  hinweise.push('Vor jeder Ausgabe von Arbeit sind die erheblichen Bedingungen bekanntzugeben; der Lohn und – soweit der Heimarbeitnehmer das Material beschafft – dessen Entschädigung sind schriftlich anzugeben. Fehlt die schriftliche Angabe, gelten die üblichen Arbeitsbedingungen (Art. 351a OR).');

  // G2 — Heimarbeiter beschafft Material → Entschädigung empfohlen.
  if (a.materialBeschafftHeimarbeiter && !a.materialEntschaedigung.trim()) {
    warnungen.push('Der Heimarbeitnehmer beschafft das Material: Die dafür geschuldete Entschädigung ist schriftlich anzugeben; sonst gelten die üblichen Bedingungen (Art. 351a Abs. 2 OR).');
  }

  // G3 — Prüfung/Abnahme (Art. 353 OR).
  hinweise.push('Der Arbeitgeber prüft das abgelieferte Arbeitserzeugnis und gibt Mängel spätestens innert einer Woche bekannt; unterlässt er dies, gilt die Arbeit als abgenommen (Art. 353 OR).');

  // G4 — Lohn bei Verhinderung/Annahmeverzug (Art. 353b OR).
  if (a.ununterbrochen) {
    hinweise.push('Da der Heimarbeitnehmer ununterbrochen im Dienst steht, ist der Lohn bei Annahmeverzug des Arbeitgebers und bei unverschuldeter Verhinderung nach Art. 324 und 324a OR geschuldet; das Arbeitsverhältnis gilt als auf unbestimmte Zeit eingegangen (Art. 353b, 354 Abs. 2 OR).');
  } else {
    hinweise.push('Da kein ununterbrochenes Dienstverhältnis vorliegt, besteht keine Lohnpflicht nach Art. 324/324a OR bei Verhinderung, und das Verhältnis gilt – vorbehältlich anderer Abrede – als auf bestimmte Zeit eingegangen (Art. 353b Abs. 2, 354 Abs. 2 OR).');
  }

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const HA_SCHEMA: VorlageSchema = {
  id: 'heimarbeitsvertrag',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Art. 351–354 OR verifiziert 20260101; FAHRPLAN-VERTRAGS-VARIANTEN P1e)',
  titel: 'Heimarbeitsvertrag',
  disclaimer:
    'Entwurf – erstellt mit LexMetrik. Keine Rechtsberatung. Beim Heimarbeitsvertrag sind Lohn und '
    + 'Material-Entschädigung vor der Arbeitsausgabe schriftlich anzugeben (Art. 351a OR); zwingend '
    + 'sind ferner die Prüf-/Rügefrist von einer Woche (Art. 353 OR) und die Haftungsschranke auf '
    + 'die Selbstkosten (Art. 352a OR). Subsidiär gelten die Art. 319 ff. OR sowie das '
    + 'Heimarbeitsgesetz (SR 822.31).',
  bausteine: [
    { id: 'HA01_parteien', rolle: 'parteien',
      text: 'zwischen\n\n{{arbeitgeberBlock}}\n(nachfolgend «Arbeitgeber»)\n\nund\n\n{{heimarbeiterBlock}}\n(nachfolgend «Heimarbeitnehmer/in»)',
      begruendung: 'Bezeichnung der Vertragsparteien – immer enthalten.',
      norm: 'Art. 351 OR' },
    { id: 'HA02_gegenstand', ueberschrift: 'Gegenstand',
      text: 'Der/Die Heimarbeitnehmer/in führt {{arbeitsraum}} – allein oder mit Familienangehörigen – im Lohn die folgenden Arbeiten für den Arbeitgeber aus: {{arbeitsbeschrieb}} (Art. 351 OR).',
      nummeriert: true,
      begruendung: 'Gegenstand der Heimarbeit und Arbeitsraum (Art. 351 OR) – immer enthalten.',
      norm: 'Art. 351 OR' },
    { id: 'HA03_bekanntgabe', ueberschrift: 'Arbeitsausgabe und Bedingungen',
      text: 'Vor jeder Ausgabe von Arbeit gibt der Arbeitgeber die für die Ausführung erheblichen Bedingungen bekannt, namentlich die Einzelheiten der Arbeit.{{materialEntschaedigungSatz}} Lohn und Material-Entschädigung werden schriftlich angegeben (Art. 351a OR).',
      nummeriert: true,
      begruendung: 'Bekanntgabepflicht vor Arbeitsausgabe, schriftliche Lohn-/Materialangabe (Art. 351a OR).',
      norm: 'Art. 351a OR' },
    { id: 'HA04_lohn', ueberschrift: 'Lohn',
      text: 'Der Lohn beträgt {{lohnText}}. {{lohnzahlungSatz}} Bei jeder Lohnzahlung erhält der/die Heimarbeitnehmer/in eine schriftliche Abrechnung, in der für Lohnabzüge der Grund anzugeben ist (Art. 353a Abs. 2 OR).',
      nummeriert: true,
      begruendung: 'Lohnhöhe und Zahlungsweise (halbmonatlich/Monatsende bzw. bei Ablieferung), schriftliche Abrechnung (Art. 353a OR).',
      norm: 'Art. 353a OR' },
    { id: 'HA05_material', ueberschrift: 'Material und Geräte',
      text: 'Vom Arbeitgeber übergebenes Material und übergebene Geräte behandelt der/die Heimarbeitnehmer/in mit aller Sorgfalt, legt über deren Verwendung Rechenschaft ab und gibt den nicht verwendeten Rest sowie die Geräte zurück. Mängel am Material oder an den Geräten sind sofort zu melden und die Weisungen des Arbeitgebers abzuwarten. Für schuldhaft verdorbenes Material oder Gerät haftet er/sie höchstens für den Ersatz der Selbstkosten (Art. 352a OR).',
      includeIf: { feld: 'materialVomArbeitgeber', eq: true }, nummeriert: true,
      begruendung: 'Sorgfalts-/Rückgabepflicht und Haftungsschranke auf die Selbstkosten (Art. 352a OR) – nur bei vom Arbeitgeber gestelltem Material.',
      norm: 'Art. 352a OR' },
    { id: 'HA06_ausfuehrung', ueberschrift: 'Ausführung',
      text: 'Der/Die Heimarbeitnehmer/in beginnt mit der übernommenen Arbeit rechtzeitig, stellt sie bis zum verabredeten Termin fertig und übergibt das Arbeitserzeugnis dem Arbeitgeber. Wird die Arbeit aus seinem/ihrem Verschulden mangelhaft ausgeführt, ist er/sie zur unentgeltlichen Verbesserung verpflichtet, soweit die Mängel dadurch behoben werden können (Art. 352 OR).',
      includeIf: AB_STANDARD, nummeriert: true,
      begruendung: 'Ausführungs- und Nachbesserungspflicht (Art. 352 OR) – ab «standard».',
      norm: 'Art. 352 OR' },
    { id: 'HA07_pruefung', ueberschrift: 'Prüfung und Abnahme',
      text: 'Der Arbeitgeber prüft das abgelieferte Arbeitserzeugnis und gibt allfällige Mängel spätestens innert einer Woche bekannt. Unterlässt er die rechtzeitige Bekanntgabe, gilt die Arbeit als abgenommen (Art. 353 OR).',
      nummeriert: true,
      begruendung: 'Prüf- und Rügeobliegenheit mit Wochenfrist (Art. 353 OR) – immer enthalten.',
      norm: 'Art. 353 OR' },
    { id: 'HA08_verhinderung', ueberschrift: 'Lohn bei Annahmeverzug und Verhinderung',
      text: 'Da der/die Heimarbeitnehmer/in ununterbrochen im Dienst des Arbeitgebers steht, ist der Lohn nach Massgabe von Art. 324 und 324a OR auch dann geschuldet, wenn der Arbeitgeber mit der Annahme der Arbeitsleistung in Verzug kommt oder der/die Heimarbeitnehmer/in ohne eigenes Verschulden an der Arbeitsleistung verhindert ist (Art. 353b Abs. 1 OR).',
      includeIf: { feld: 'ununterbrochen', eq: true }, nummeriert: true,
      begruendung: 'Lohn bei Annahmeverzug/Verhinderung im ununterbrochenen Dienst (Art. 353b Abs. 1 OR).',
      norm: 'Art. 353b OR' },
    { id: 'HA09_dauer', ueberschrift: 'Dauer des Arbeitsverhältnisses',
      text: '{{dauerText}}',
      nummeriert: true,
      begruendung: 'Vermutung über die Dauer (Probe/ununterbrochen unbefristet) nach Art. 354 OR.',
      norm: 'Art. 354 OR' },
    { id: 'HA10_harg', ueberschrift: 'Heimarbeitsgesetz',
      text: 'Vorbehalten bleiben die zwingenden Vorschriften des Bundesgesetzes über die Heimarbeit (Heimarbeitsgesetz, SR 822.31), insbesondere über die Bekanntgabe der Arbeitsbedingungen und den Gesundheitsschutz.',
      includeIf: NUR_EXPERTE, nummeriert: true,
      begruendung: 'Hinweis auf das öffentlich-rechtliche Heimarbeitsgesetz (HArG) – Detailgrad «experte».',
      norm: 'Art. 351 OR' },
    { id: 'HA11_schluss', ueberschrift: 'Schlussbestimmungen',
      text: 'Änderungen und Ergänzungen bedürfen der Schriftform. Soweit dieser Vertrag nichts regelt, gelten die Art. 351 ff. OR und subsidiär die allgemeinen Bestimmungen über den Einzelarbeitsvertrag (Art. 319 ff. OR). Dieser Vertrag wird in zwei Exemplaren ausgefertigt; jede Partei erhält ein unterzeichnetes Exemplar.',
      nummeriert: true,
      begruendung: 'Schriftformvorbehalt, Gesetzesverweis und Ausfertigung – immer enthalten.',
      norm: 'Art. 351 OR' },
    { id: 'HA12_unterschriften', rolle: 'unterschrift',
      text: '{{ort}}, {{datumFmt}}\n\n\nDer Arbeitgeber:\n\n___________________________\n{{arbeitgeberName}}\n\n\nDer/Die Heimarbeitnehmer/in:\n\n___________________________\n{{heimarbeiterKurz}}',
      begruendung: 'Ort, Datum und beidseitige Unterschriften.',
      norm: 'Art. 351 OR' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

function fmtIso(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '________';
}

export function haZusammenstellen(a: HaAntworten) {
  const lohnBetrag = zahl(a.lohnAngabe) !== null ? `CHF ${fmtCHF(a.lohnAngabe)}` : (a.lohnAngabe.trim() || '________');
  const lohnText = `${lohnBetrag} ${a.lohnEinheit.trim() || 'pro Stück'}`;

  const lohnzahlungSatz = a.ununterbrochen
    ? 'Der Lohn wird halbmonatlich oder mit Zustimmung des Heimarbeitnehmers/der Heimarbeitnehmerin am Ende jedes Monats ausgerichtet (Art. 353a Abs. 1 OR).'
    : 'Der Lohn wird jeweils bei Ablieferung des Arbeitserzeugnisses ausgerichtet (Art. 353a Abs. 1 OR).';

  const dauerText = a.probearbeit
    ? 'Mit der übergebenen Probearbeit gilt das Arbeitsverhältnis auf bestimmte Zeit zur Probe eingegangen (Art. 354 Abs. 1 OR).'
    : a.ununterbrochen
      ? 'Da der/die Heimarbeitnehmer/in ununterbrochen im Dienst des Arbeitgebers steht, gilt das Arbeitsverhältnis als auf unbestimmte Zeit eingegangen (Art. 354 Abs. 2 OR).'
      : 'Das Arbeitsverhältnis gilt als auf bestimmte Zeit eingegangen, sofern nichts anderes vereinbart ist (Art. 354 Abs. 2 OR).';

  const antworten: Antworten = {
    ...a,
    arbeitgeberBlock: [a.arbeitgeberName, a.arbeitgeberAdresse].filter((s) => s.trim()).join('\n'),
    heimarbeiterBlock: [`${a.heimarbeiterVorname} ${a.heimarbeiterName}`.trim(), a.heimarbeiterAdresse].filter((s) => s.trim()).join('\n'),
    heimarbeiterKurz: `${a.heimarbeiterVorname} ${a.heimarbeiterName}`.trim() || '________',
    arbeitsraum: a.arbeitsraum.trim() || 'in der Wohnung des Heimarbeitnehmers',
    arbeitsbeschrieb: a.arbeitsbeschrieb.trim() || '________',
    materialEntschaedigungSatz: a.materialBeschafftHeimarbeiter
      ? ` Beschafft der/die Heimarbeitnehmer/in Material selbst, wird dafür eine Entschädigung von ${a.materialEntschaedigung.trim() || '________'} geschuldet.`
      : '',
    lohnText,
    lohnzahlungSatz,
    dauerText,
    datumFmt: fmtIso(a.datum),
  };

  return { ergebnis: assemble(HA_SCHEMA, antworten) };
}

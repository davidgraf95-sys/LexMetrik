import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { istGueltigesISO } from '../datumsUtils';

// ─── Rubrum eines Gerichtsentscheids (Art. 112 BGG / Art. 238 ZPO) ──────────
//
// Gerichts-Baustein-Set (ROADMAP W2·7): reiner Nutzer-Eingabe-Builder für den
// KOPF (Rubrum) eines Entscheids — Gericht/Besetzung, Geschäftsnummer, Parteien
// und ihre Vertretung, Streitgegenstand, Ort/Datum. Keine Rechtslogik, keine
// Berechnung (§2): das Rubrum wird ausschliesslich aus den Angaben der nutzenden
// Person zusammengesetzt. ausgabeArt 'entwurf' (§8): Gerüst, das die zuständige
// Person vervollständigt — kein druckfertiger Entscheid.
//
// Norm-Anker LIVE gegen Fedlex verifiziert (Stand 2026-07-05):
//  · Art. 238 ZPO (SR 272, Konsolidierung eli/cc/2010/262/20260701, Stand
//    1.7.2026, https://www.fedlex.admin.ch/eli/cc/2010/262/de) — «Inhalt»,
//    EIN unnummerierter Absatz mit lit. a–h; es gibt KEINEN «Abs.», darum wird
//    nur «lit.» zitiert. Für das Rubrum einschlägig: lit. a (Bezeichnung und
//    Zusammensetzung des Gerichts), lit. b (Ort und Datum), lit. c (Bezeichnung
//    der Parteien und ihrer Vertretung).
//  · Art. 112 BGG (SR 173.110, Konsolidierung eli/cc/2006/218/20260401, Stand
//    1.4.2026, https://www.fedlex.admin.ch/eli/cc/2006/218/de) — «Eröffnung
//    der Entscheide», Abs. 1 lit. a–d (Inhalt der beschwerdefähigen Entscheide).
// Beide Fassungen tragen bereits die Revision «Verbesserung der Praxistauglich-
// keit und der Rechtsdurchsetzung» (in Kraft seit 1.1.2025). Keine der beiden
// hat eine künftige, noch nicht in Kraft stehende Konsolidierung; keine ist
// aufgehoben.

export type RubrumInstanz = 'zivil' | 'bger';

export type RubrumAntworten = {
  instanz: RubrumInstanz;       // ZPO-Entscheid (Art. 238) ↔ BGer-Urteil (Art. 112)
  gericht: string;              // Bezeichnung des Gerichts
  besetzung: string;            // mitwirkende Gerichtspersonen (optional)
  verfahrenNr: string;          // Geschäftsnummer (optional)
  klaeger: string;              // klagende/gesuchstellende/beschwerdeführende Partei
  klaegerVertretung: string;    // Vertretung (optional)
  beklagte: string;             // beklagte/gesuchsgegnerische Partei
  beklagteVertretung: string;   // Vertretung (optional)
  streitgegenstand: string;     // «betreffend …» (optional)
  ort: string;
  datum: string;                // ISO
};

export const RUBRUM_DEFAULTS: RubrumAntworten = {
  instanz: 'zivil',
  gericht: '', besetzung: '', verfahrenNr: '',
  klaeger: '', klaegerVertretung: '', beklagte: '', beklagteVertretung: '',
  streitgegenstand: '', ort: '', datum: '',
};

// ── Gates / Hinweise (deterministisch, normverifiziert; keine Blocker) ───────

export type RubrumGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeRubrumGates(a: RubrumAntworten): RubrumGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  const zpoHinweis =
    'Das Rubrum bildet nur den KOPF des Entscheids ab. Ein vollständiger Zivilentscheid enthält '
    + 'nach Art. 238 ZPO zusätzlich: das Dispositiv (lit. d), die Angabe der Personen und '
    + 'Behörden, denen der Entscheid mitzuteilen ist (lit. e), eine Rechtsmittelbelehrung, sofern '
    + 'nicht darauf verzichtet wurde (lit. f), gegebenenfalls die wesentlichen Entscheidgründe '
    + '(lit. g) und die Unterschrift des Gerichts (lit. h).';
  const bggHinweis =
    'Beim Weiterzug ans Bundesgericht muss der angefochtene kantonale Entscheid nach '
    + 'Art. 112 Abs. 1 BGG enthalten: die Begehren, Begründung, Beweisvorbringen und '
    + 'Prozesserklärungen der Parteien (lit. a), die massgebenden Gründe tatsächlicher und '
    + 'rechtlicher Art mit Angabe der angewendeten Gesetzesbestimmungen (lit. b), das Dispositiv '
    + '(lit. c) und eine Rechtsmittelbelehrung mit Angabe des Streitwerts, soweit das Gesetz eine '
    + 'Streitwertgrenze vorsieht (lit. d). Ein Entscheid, der diesen Anforderungen nicht genügt, '
    + 'kann zur Verbesserung zurückgewiesen werden (Art. 112 Abs. 3 BGG).';
  // Die massgebende Inhaltsnorm zuerst nennen (BGer-Urteil → Art. 112 BGG,
  // sonst Art. 238 ZPO); die jeweils andere folgt als Verzahnungs-Hinweis.
  if (a.instanz === 'bger') hinweise.push(bggHinweis, zpoHinweis);
  else hinweise.push(zpoHinweis, bggHinweis);
  hinweise.push(
    'LexMetrik füllt nur die eingegebenen Angaben ein und prüft sie nicht auf inhaltliche '
    + 'Richtigkeit. Massgebend sind die Verfahrensordnung und die Angaben des Gerichts; das '
    + 'Dokument ist ein Entwurf und von der zuständigen Person zu vervollständigen.',
  );
  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const RUBRUM_SCHEMA: VorlageSchema = {
  id: 'rubrum',
  format: 'verfuegung',
  ausgabeArt: 'entwurf', // Gerüst zum Vervollständigen — MUSS card.formGate spiegeln
  version: '1.0.0 (Art. 238 ZPO / Art. 112 BGG live verifiziert 2026-07-05)',
  titel: 'Rubrum (Entscheidkopf)',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Das Rubrum ist ein Gerüst für den Kopf eines '
    + 'Gerichtsentscheids (Art. 238 ZPO; beim Weiterzug Art. 112 BGG); massgebend sind die '
    + 'Verfahrensordnung und die Angaben des Gerichts. Der Entscheid ist von der zuständigen '
    + 'Person zu vervollständigen.',
  bausteine: [
    { id: 'RU_gericht', rolle: 'rubrum',
      text: '{{gericht}}{{besetzungZeile}}{{verfahrenZeile}}',
      norm: 'Art. 238 ZPO',
      begruendung: 'Bezeichnung und Zusammensetzung des entscheidenden Gerichts (Art. 238 lit. a ZPO; für die beschwerdefähige Ausfertigung Art. 112 Abs. 1 BGG).' },
    { id: 'RU_parteien', rolle: 'parteien',
      text: '{{klaeger}}{{klaegerVertretungSatz}}\n\ngegen\n\n{{beklagte}}{{beklagteVertretungSatz}}',
      norm: 'Art. 238 ZPO',
      begruendung: 'Bezeichnung der Parteien und ihrer Vertretung (Art. 238 lit. c ZPO).' },
    { id: 'RU_gegenstand',
      text: 'betreffend {{streitgegenstand}}',
      begruendung: 'Streitgegenstand als Betreff des Rubrums (Bezugspunkt des Dispositivs).' },
    { id: 'RU_ortdatum', rolle: 'datumzeile',
      text: '{{ort}}, {{datumFmt}}',
      norm: 'Art. 238 ZPO',
      begruendung: 'Ort und Datum des Entscheids (Art. 238 lit. b ZPO).' },
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David): leere Pflicht-Platzhalter füllt die
// ENGINE als «________»; optionale Fragmente enden auf «…Satz»/«…Zeile» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function rubrumZusammenstellen(a: RubrumAntworten) {
  const besetzung = a.besetzung.trim();
  const verfahrenNr = a.verfahrenNr.trim();
  const antworten: Antworten = {
    ...a,
    besetzungZeile: besetzung ? `\n${besetzung}` : '',
    verfahrenZeile: verfahrenNr ? `\nGeschäfts-Nr. ${verfahrenNr}` : '',
    klaegerVertretungSatz: a.klaegerVertretung.trim() ? `\nvertreten durch ${a.klaegerVertretung.trim()}` : '',
    beklagteVertretungSatz: a.beklagteVertretung.trim() ? `\nvertreten durch ${a.beklagteVertretung.trim()}` : '',
    datumFmt: istGueltigesISO(a.datum) ? a.datum.split('-').reverse().join('.') : '________',
  };
  const erg = assemble(RUBRUM_SCHEMA, antworten);
  erg.dokument.titel = a.instanz === 'bger' ? 'Rubrum (Urteil des Bundesgerichts)' : 'Rubrum (Entscheidkopf)';
  return { ergebnis: erg };
}

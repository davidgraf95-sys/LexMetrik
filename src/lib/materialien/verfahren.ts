// ─── Verfahrenskette einer Vorlage (Fedlex-Gesetzgebungs-Projektgraph) ───────
//
// E1 von «Entstehung am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.7).
// Die `?event`-Knoten am Projekt-Knoten (`jolux:draftHasLegislativeTask`) tragen
// `jolux:legislativeTaskType` aus dem amtlichen Vokabular `type-projet` — das ist
// die Zeitachse einer Vorlage: Vernehmlassung → Botschaft → Beschluss des
// Parlaments → Referendumsfrist → Abstimmung → Inkrafttreten.
//
// §2 Determinismus: die Code→Etikett-Zuordnung ist eine FESTE, amtlich belegte
// Tabelle (unten), keine Heuristik. Ein Code ausserhalb der Tabelle ist ein
// Vokabular-Zuwachs und macht den Generator rot (nie stillschweigend «sonstiges»).
// §3 Schichtentrennung: reine Daten/Typen + eine Nachschlage-Funktion, keine UI.
//
// Quelle der Tabelle: SPARQL gegen <https://fedlex.data.admin.ch/vocabulary/type-projet>
// (`skos:inScheme` + `skos:prefLabel`@de), abgerufen 2026-09-11 — 26 Einträge,
// vollständig (kein OFFSET-Rest: COUNT = 26). Die deutschen Etiketten sind amtlich
// zitiert, nicht umformuliert (§1).

/** Stabiler, sprach-unabhängiger Schlüssel eines Verfahrensschritts. */
export type VerfahrensTyp =
  | 'vernehmlassung'
  | 'erlassentwurf'
  | 'vernehmlassung-geplant'
  | 'vernehmlassung-eroeffnung'
  | 'stellungnahmen-publiziert'
  | 'ergebnisbericht'
  | 'vernehmlassung-eroeffnung-bbl-vern'
  | 'vernehmlassung-eroeffnung-bbl'
  | 'volksabstimmung-ergebnis'
  | 'botschaft'
  | 'stellungnahme-br'
  | 'beschluss-parlament'
  | 'bericht-kommission'
  | 'referendumsfrist'
  | 'referendum-eingereicht'
  | 'referendum-zustandegekommen'
  | 'referendum-nicht-zustandegekommen'
  | 'abstimmungsgegenstaende-br'
  | 'abgestimmt'
  | 'inkrafttreten'
  | 'teilinkraftsetzung'
  | 'geaendert-in-anderem-erlass'
  | 'berichtigung'
  | 'mitteilung'
  | 'aufgehoben-in-anderem-erlass'
  | 'anderweitig-erledigt';

/**
 * Ein Schritt der Verfahrenskette.
 *
 * GESPEICHERT wird NUR der amtliche `type-projet`-Code (plus Datum und Publikation) —
 * Schlüssel (`VerfahrensTyp`) und Etikett sind daraus über die feste Tabelle ableitbar
 * und werden deshalb NICHT mitgespeichert (§5: keine zweite Wahrheit; ausserdem spart
 * es die Hälfte der Nutzlast — gemessen 126.9 → 63.5 KB über 1 609 Ereignisse).
 */
export interface VerfahrensEreignis {
  /** Amtlicher `type-projet`-Code — die Roh-Angabe für das Audit (§7). */
  code: number;
  /** `jolux:decisionDate` ISO (fehlt bei undatierten Schritten, z. B. Typ 1). */
  datum?: string;
  /** ELI-Kurzform der Publikation dieses Schritts («fga/2017/2057»), ohne Host. */
  res?: string;
}

/** FESTE amtliche Tabelle `type-projet` → {Schlüssel, deutsches Etikett}. */
export const TYPE_PROJET: Readonly<Record<number, { typ: VerfahrensTyp; label: string }>> = {
  1: { typ: 'vernehmlassung', label: 'Vernehmlassung' },
  2: { typ: 'erlassentwurf', label: 'Erlassentwurf' },
  3: { typ: 'vernehmlassung-geplant', label: 'Geplante Vernehmlassungen' },
  4: { typ: 'vernehmlassung-eroeffnung', label: 'Eröffnung der Vernehmlassung' },
  5: { typ: 'stellungnahmen-publiziert', label: 'Veröffentlichung der Stellungnahmen' },
  6: { typ: 'ergebnisbericht', label: 'Veröffentlichung des Ergebnisberichts' },
  7: { typ: 'vernehmlassung-eroeffnung-bbl-vern', label: 'Publikation der Eröffnung der Vernehmlassung' },
  8: { typ: 'vernehmlassung-eroeffnung-bbl', label: 'Publikation der Eröffnung im BBl' },
  9: { typ: 'volksabstimmung-ergebnis', label: 'Ergebnis der Volksabstimmung' },
  200: { typ: 'botschaft', label: 'Botschaft des Bundesrats' },
  201: { typ: 'stellungnahme-br', label: 'Stellungnahme des Bundesrates' },
  300: { typ: 'beschluss-parlament', label: 'Beschluss des Parlaments' },
  301: { typ: 'bericht-kommission', label: 'Bericht Kommission' },
  400: { typ: 'referendumsfrist', label: 'Ablauf der Referendumsfrist am' },
  450: { typ: 'referendum-eingereicht', label: 'Referendum eingereicht am' },
  480: { typ: 'referendum-zustandegekommen', label: 'Ref. Zustandegekommen' },
  490: { typ: 'referendum-nicht-zustandegekommen', label: 'Ref. nicht zustandegekommen' },
  630: { typ: 'abstimmungsgegenstaende-br', label: 'Festlegung Abstimmungsgegenstände BR' },
  650: { typ: 'abgestimmt', label: 'Abgestimmt am' },
  700: { typ: 'inkrafttreten', label: 'Inkrafttreten am' },
  701: { typ: 'teilinkraftsetzung', label: 'Teilinkraftsetzung' },
  710: { typ: 'geaendert-in-anderem-erlass', label: 'Geändert in anderem Erlass' },
  715: { typ: 'berichtigung', label: 'Berichtigung' },
  716: { typ: 'mitteilung', label: 'Mitteilung' },
  720: { typ: 'aufgehoben-in-anderem-erlass', label: 'Aufgehoben in anderem Erlass' },
  900: { typ: 'anderweitig-erledigt', label: 'Anderweitig erledigt' },
};

/** Amtlicher Code → Schlüssel. Unbekannter Code ⇒ Fehler (§2: nie raten). */
export function verfahrensTypVonCode(code: number): VerfahrensTyp {
  const t = TYPE_PROJET[code];
  if (!t) {
    throw new Error(
      `verfahren: unbekannter type-projet-Code ${code} — Vokabular-Zuwachs. `
      + 'Tabelle in src/lib/materialien/verfahren.ts gegen den amtlichen Vokabular-Graphen nachführen (nie raten, §2).',
    );
  }
  return t.typ;
}

/** Stabiler Schlüssel eines gespeicherten Ereignisses (abgeleitet, nie gespeichert). */
export function verfahrensTyp(e: VerfahrensEreignis): VerfahrensTyp {
  return verfahrensTypVonCode(e.code);
}

/** Amtliches deutsches Etikett eines Schritts (Zitat, nie umformuliert §1). */
export function verfahrensLabel(e: VerfahrensEreignis): string {
  return TYPE_PROJET[e.code]?.label ?? verfahrensTypVonCode(e.code);
}

/** Fedlex-Live-Link zur Publikation eines Schritts (§7c), null ohne `res`. */
export function verfahrensQuelleUrl(e: VerfahrensEreignis): string | null {
  return e.res ? `https://www.fedlex.admin.ch/eli/${e.res}/de` : null;
}

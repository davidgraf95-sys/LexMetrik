// Dossier: bibliothek/recherche/gruendungsdokumente-wortlaute.md
import type { VorlageSchema, Antworten, AssembleErgebnis } from './engine';
import { assemble, nummeriereUeberschriftenAlsArtikel } from './engine';
import { fmtCHF, fmtDatum, ganzePositive, zahl } from './datum';
import {
  gmbhGruendungsunterlagen,
  type GmbhGruendungEingaben,
  type GmbhStatutKlausel,
} from '../gruendungsunterlagen';
// §6-Split (19.6.2026): statische Dokument-Schemas in Geschwister-Datei.
import {
  STATUTEN_SCHEMA,
  ERRICHTUNGSAKT_SCHEMA,
  WAHLANNAHME_SCHEMA,
  DOMIZILANNAHME_SCHEMA,
  VORSITZ_SCHEMA,
  ERNENNUNG_SCHEMA,
  ANMELDUNG_SCHEMA,
} from './gruendungGmbhSchemas';

// ─── GmbH-Gründungs-VOLLDOKUMENTE (Plan 9b Ausbaustufe, Auftrag David 7.6.2026)
//
// Bauspezifikation + Wortlaut-Belege:
//   bibliothek/recherche/gruendungsdokumente-wortlaute.md (7.6.2026) —
//   Statuten-Bausteine S1–S20 (Teil 1), Zeichnung IM Errichtungsakt (Teil 3),
//   Erklärungs-Wortlaute verbatim ZH/SG (Teil 4), Urkunden-Gliederung (Teil 5),
//   Formvorschriften-Matrix → Export-Gates (Teil 6).
//
// RECHTSSTAND (Anweisung David 7.6.2026: «neustes Recht»): Alle Klauseln sind
// am OR-Cache Stand 1.1.2026 verifiziert (Revision Aktien-/GmbH-Recht 2023;
// Opting-out-Verfahrensregeln 727a Abs. 2 Satz 2/Abs. 2bis in Kraft 1.1.2025).
// Die amtlichen Muster (ZH 26.7.2024, SG/GL «…2023») dienen nur als
// Formulierungs-Referenz; Abweichungen sind je Baustein offengelegt.
//
// §8-Form-Gates (Teil 6 des Dossiers):
//   Statuten + Errichtungsakt → ausgabeArt 'entwurf' (Beurkundung Art. 777 OR
//   bzw. Beglaubigung Art. 22 Abs. 4 HRegV; Wasserzeichen ENTWURF).
//   Erklärungen/Beschlüsse/Anmeldung → 'fertig' (einfache Schriftform).
//
// ERSTAUSBAU bewusst begrenzt (Dossier Teil 9): nur BARGRÜNDUNG in CHF.
// Qualifizierte Gründung (Sacheinlage/Verrechnung/besondere Vorteile) und
// Fremdwährungs-Kapital sperren die Volldokumente mit ehrlichem Hinweis —
// die Checklisten-Maske deckt diese Fälle weiterhin ab (§8).
//
// §5 SSoT: WELCHE Dokumente in die Mappe gehören und welche Beilagen die
// HR-Anmeldung nennt, leitet sich aus gmbhGruendungsunterlagen() ab — die
// Weichen-Logik lebt ausschliesslich dort.

// ── Eingaben ────────────────────────────────────────────────────────────────

export type GmbhGruenderZeile = {
  name: string;          // «Anna Muster» bzw. Firma der Gründerin
  angaben: string;       // Usanz Urkunde: «von [Heimatort], in [Wohnort]» bzw. Sitz
  anzahl: string;        // gezeichnete Stammanteile (Stück)
};

export type GmbhZeichnungsArt = 'einzelunterschrift' | 'kollektivzuzweien';

export type GmbhGfZeile = {
  name: string;
  herkunft: string;      // Heimatort bzw. Staatsangehörigkeit (Praxis ZH-Protokolle)
  wohnort: string;
  adresse: string;       // für die Wahlannahmeerklärung (Briefkopf)
  vorsitz: boolean;
  zeichnungsArt: GmbhZeichnungsArt;
};

export type GmbhVertretungsZeile = {
  name: string;
  funktion: string;      // z. B. «Direktorin», «Prokurist»
  zeichnungsArt: GmbhZeichnungsArt;
};

/** Antworten der Volldokumente: Checklisten-Weichen (SSoT) + Identität. */
export type GmbhDokAntworten = GmbhGruendungEingaben & {
  firma: string;             // inkl. Rechtsformzusatz «… GmbH» (Art. 950 OR)
  sitz: string;              // politische Gemeinde
  kanton: string;            // Kürzel für die HR-Anmeldung (Adressat)
  zweck: string;
  zweckErweiterung: boolean; // Standard-Erweiterungsklausel (ZH-Muster)
  stammkapitalChf: string;
  anzahlAnteile: string;
  nennwertChf: string;
  gruender: GmbhGruenderZeile[];
  geschaeftsfuehrer: GmbhGfZeile[];
  weitereVertretungen: GmbhVertretungsZeile[];   // nur bei lit.-f-Weiche
  bankName: string;          // nur bei bankInUrkundeGenannt
  bankOrt: string;
  rechtsdomizilAdresse: string;                  // eigene Adresse am Sitz
  domizilhalterName: string;                     // nur bei c/o (lit. h)
  domizilhalterAdresse: string;
  revisionsstelleName: string;                   // nur ohne Opting-out
  revisionsstelleSitz: string;
  // Parameter der statutarischen Gestaltungen (Klausel-Wahl: statutKlauseln)
  nachschussBetragChf: string;                   // ≤ 2 × Nennwert (795 II)
  nebenleistungText: string;                     // Gegenstand+Umfang (796 III)
  konkurrenzBefreiung: 'alleGesellschafter' | 'gv';   // 803 III
  vetoBeschluesse: string;                       // 807 I: Statuten umschreiben
  virtuelleGv: boolean;                          // 805 V Ziff. 2bis / 701d
  ort: string;
  datum: string;             // ISO; leer = von Hand zu datieren
};

export const GMBH_DOK_DEFAULTS: Omit<GmbhDokAntworten, keyof GmbhGruendungEingaben> = {
  firma: '', sitz: '', kanton: '', zweck: '', zweckErweiterung: true,
  stammkapitalChf: "20'000", anzahlAnteile: '20', nennwertChf: "1'000",
  gruender: [], geschaeftsfuehrer: [], weitereVertretungen: [],
  bankName: '', bankOrt: '', rechtsdomizilAdresse: '',
  domizilhalterName: '', domizilhalterAdresse: '',
  revisionsstelleName: '', revisionsstelleSitz: '',
  nachschussBetragChf: '', nebenleistungText: '',
  konkurrenzBefreiung: 'alleGesellschafter', vetoBeschluesse: '',
  virtuelleGv: false, ort: '', datum: '',
};

/** Geteilte Basis-Labels (AG erweitert sie per Spread — /simplify Reuse#2). */
export const ZEICHNUNGS_LABEL: Record<GmbhZeichnungsArt, string> = {
  einzelunterschrift: 'Einzelunterschrift',
  kollektivzuzweien: 'Kollektivunterschrift zu zweien',
};

// ── Gates (deterministisch; Dossier Teil 7) ─────────────────────────────────

export type GmbhDokGates = { blocker: string[]; warnungen: string[] };

export function pruefeGmbhDokGates(a: GmbhDokAntworten): GmbhDokGates {
  const blocker: string[] = [];
  const warnungen: string[] = [];

  // Erstausbau-Grenze (Dossier Teil 9): nur Bargründung in CHF.
  if (a.einlageArt !== 'bar' || a.besondereVorteile) {
    blocker.push(
      'Volldokumente sind zurzeit nur für die reine BARGRÜNDUNG verfügbar. Qualifizierte Gründungen ' +
      '(Sacheinlage, Verrechnung, besondere Vorteile) verlangen zusätzliche Statuten-Angaben (Art. 634 ' +
      'Abs. 4 / Art. 634a Abs. 3 OR i. V. m. Art. 777c Abs. 2 OR) und eigene Urkunden-Bausteine – ' +
      'bitte die Checkliste verwenden; die Dokumente entstehen beim Notariat.',
    );
  }
  if (a.fremdwaehrung) {
    blocker.push(
      'Volldokumente sind zurzeit nur für Stammkapital in CHF verfügbar (Fremdwährung verlangt ' +
      'Umrechnungskurs-Angaben in der Urkunde, Art. 72 lit. j HRegV) – bitte die Checkliste verwenden.',
    );
  }

  const kapital = zahl(a.stammkapitalChf);
  const anteile = zahl(a.anzahlAnteile);
  const nennwert = zahl(a.nennwertChf);
  if (kapital === null || anteile === null || nennwert === null) {
    blocker.push('Stammkapital, Anzahl und Nennwert der Stammanteile beziffern (Art. 776 Ziff. 3 OR).');
  } else {
    if (nennwert <= 0) blocker.push('Der Nennwert muss grösser als null sein (Art. 774 Abs. 1 OR).');
    if (kapital < 20_000) blocker.push('Das Stammkapital beträgt mindestens CHF 20\'000 (Art. 773 Abs. 1 OR).');
    if (ganzePositive(a.anzahlAnteile) === null) blocker.push('Anzahl Stammanteile als positive ganze Zahl angeben.');
    if (nennwert > 0 && anteile > 0 && Math.abs(anteile * nennwert - kapital) > 0.005) {
      blocker.push(
        `Rechnerische Unstimmigkeit: ${a.anzahlAnteile} Stammanteile × CHF ${fmtCHF(a.nennwertChf)} ergeben nicht das Stammkapital von CHF ${fmtCHF(a.stammkapitalChf)}.`,
      );
    }
    const gezeichnet = a.gruender.reduce((s, g) => s + (zahl(g.anzahl) ?? 0), 0);
    if (a.gruender.length > 0 && anteile > 0 && gezeichnet !== anteile) {
      blocker.push(
        `Die Zeichnungen der Gründer (${gezeichnet} Stammanteile) müssen sämtliche ${a.anzahlAnteile} Stammanteile abdecken (Art. 777 Abs. 2 Ziff. 1 OR).`,
      );
    }
  }

  if (a.gruender.filter((g) => g.name.trim()).length === 0) {
    blocker.push('Mindestens eine Gründerin / einen Gründer erfassen (Einpersonengründung zulässig – Art. 775 OR aufgehoben).');
  }
  if (a.geschaeftsfuehrer.filter((g) => g.name.trim()).length === 0) {
    blocker.push('Mindestens eine Geschäftsführerin / einen Geschäftsführer erfassen (Organbestellung im Errichtungsakt, Art. 777 Abs. 1 OR).');
  }
  if (a.geschaeftsfuehrer.length > 1 && a.geschaeftsfuehrer.filter((g) => g.vorsitz).length !== 1) {
    blocker.push('Bei mehreren Geschäftsführern genau EINE Person als Vorsitzende/n bezeichnen (Art. 809 Abs. 3 OR).');
  }

  // Parameter der gewählten Statutenklauseln
  if (a.statutKlauseln.includes('nachschuss')) {
    const b = zahl(a.nachschussBetragChf);
    if (b === null || b <= 0) {
      blocker.push('Nachschusspflicht: Betrag je Stammanteil beziffern (Art. 795 Abs. 2 OR).');
    } else if (nennwert !== null && b > 2 * nennwert) {
      blocker.push(
        `Nachschusspflicht: höchstens das Doppelte des Nennwerts, also CHF ${fmtCHF(String(2 * nennwert))} (Art. 795 Abs. 2 OR).`,
      );
    }
  }
  if (a.statutKlauseln.includes('nebenleistung') && !a.nebenleistungText.trim()) {
    blocker.push('Nebenleistungspflicht: Gegenstand und Umfang in den Statuten bestimmen (Art. 796 Abs. 3 OR).');
  }
  if (a.statutKlauseln.includes('vetorecht') && !a.vetoBeschluesse.trim()) {
    blocker.push('Vetorecht: Die Statuten müssen die Beschlüsse umschreiben, für die das Veto gilt (Art. 807 Abs. 1 OR).');
  }
  if (a.bankInUrkundeGenannt && a.einlageArt === 'bar' && (!a.bankName.trim() || !a.bankOrt.trim())) {
    blocker.push('Bank in der Urkunde nennen: Name und Ort des Instituts angeben (sonst separate Bankbescheinigung, Art. 71 Abs. 1 lit. g HRegV).');
  }
  if (!a.eigeneBueros && (!a.domizilhalterName.trim() || !a.domizilhalterAdresse.trim())) {
    blocker.push('c/o-Domizil: Domizilhalter/in mit Adresse angeben (Art. 117 Abs. 3 HRegV).');
  }
  if (!a.optingOut && !a.revisionsstelleName.trim()) {
    blocker.push('Revisionsstelle benennen oder Opting-out wählen (Art. 727a Abs. 2 OR).');
  }
  if (a.weitereVertretungsberechtigte && a.weitereVertretungen.filter((v) => v.name.trim()).length === 0) {
    blocker.push('Weitere Vertretungsberechtigte namentlich erfassen (Art. 71 Abs. 1 lit. f HRegV).');
  }

  if (!a.firma.trim()) blocker.push('Firma angeben – mit Rechtsformzusatz «GmbH» (Art. 950 OR).');
  else if (!/gmbh/i.test(a.firma)) {
    warnungen.push('Die Firma muss die Rechtsform angeben (Art. 950 Abs. 1 OR) – Zusatz «GmbH» ergänzen.');
  }
  if (!a.sitz.trim()) blocker.push('Sitz (politische Gemeinde) angeben (Art. 776 Ziff. 1 OR).');
  if (!a.zweck.trim()) blocker.push('Zweck angeben (Art. 776 Ziff. 2 OR).');

  return { blocker, warnungen };
}

// ── Gemeinsame Antworten-Aufbereitung ───────────────────────────────────────

const KLAUSEL_HINWEIS_777A: Record<GmbhStatutKlausel, string | null> = {
  // Hinweispflicht in der Zeichnungs-Urkunde (Art. 777a Abs. 2 Ziff. 1–5 OR);
  // Stimmrecht/Vetorecht stehen NICHT im Katalog von Abs. 2.
  nachschuss: 'Nachschusspflichten',
  nebenleistung: 'Nebenleistungspflichten',
  konkurrenzverbot: 'Konkurrenzverbote für die Gesellschafter',
  vorkaufsrecht: 'Vorhand-, Vorkaufs- und Kaufsrechte',
  stimmrechtNachAnteilen: null,
  vetorecht: null,
};

function basisAntworten(a: GmbhDokAntworten): Antworten {
  const datum = a.datum ? fmtDatum(a.datum) : '________';
  return {
    ...a,
    stammkapitalFmt: fmtCHF(a.stammkapitalChf),
    nennwertFmt: fmtCHF(a.nennwertChf),
    nachschussFmt: fmtCHF(a.nachschussBetragChf),
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}den ${datum}`,
    gruenderListe: a.gruender.filter((g) => g.name.trim()).map((g) => ({
      name: g.name.trim(),
      angabenZeile: g.angaben.trim() ? `, ${g.angaben.trim()}` : '',
      anzahl: g.anzahl,
    })),
    gfListe: a.geschaeftsfuehrer.filter((g) => g.name.trim()).map((g) => ({
      name: g.name.trim(),
      herkunft: g.herkunft.trim() || '________',
      wohnort: g.wohnort.trim() || '________',
      vorsitzZeile: a.geschaeftsfuehrer.length > 1 && g.vorsitz ? ', Vorsitzende/r der Geschäftsführung' : '',
      zeichnung: ZEICHNUNGS_LABEL[g.zeichnungsArt],
    })),
    vertretungsListe: a.weitereVertretungen.filter((v) => v.name.trim()).map((v) => ({
      name: v.name.trim(),
      funktion: v.funktion.trim() || '________',
      zeichnung: ZEICHNUNGS_LABEL[v.zeichnungsArt],
    })),
    klauselHinweisListe: a.statutKlauseln
      .map((k) => KLAUSEL_HINWEIS_777A[k])
      .filter((x): x is string => x !== null)
      .map((label) => ({ label })),
    hatNachschussOderNebenleistung:
      a.statutKlauseln.includes('nachschuss') || a.statutKlauseln.includes('nebenleistung'),
    klausel_nachschuss: a.statutKlauseln.includes('nachschuss'),
    klausel_nebenleistung: a.statutKlauseln.includes('nebenleistung'),
    klausel_konkurrenzverbot: a.statutKlauseln.includes('konkurrenzverbot'),
    klausel_vorkaufsrecht: a.statutKlauseln.includes('vorkaufsrecht'),
    klausel_stimmrecht: a.statutKlauseln.includes('stimmrechtNachAnteilen'),
    klausel_vetorecht: a.statutKlauseln.includes('vetorecht'),
    konkurrenzBefreiungSatz:
      a.konkurrenzBefreiung === 'gv'
        ? 'die Gesellschafterversammlung zustimmt'
        : 'alle übrigen Gesellschafter schriftlich zustimmen',
    mehrereGf: a.geschaeftsfuehrer.filter((g) => g.name.trim()).length > 1,
    vorsitzName: a.geschaeftsfuehrer.find((g) => g.vorsitz)?.name.trim() ?? '________',
  };
}

// ── Dokument-Schemas: ausgelagert nach ./gruendungGmbhSchemas (§6-Split) ─────
// STATUTEN_SCHEMA · ERRICHTUNGSAKT_SCHEMA · WAHLANNAHME_SCHEMA ·
// DOMIZILANNAHME_SCHEMA · VORSITZ_SCHEMA · ERNENNUNG_SCHEMA · ANMELDUNG_SCHEMA

// ── Schema-Registry (nur für das Abnahme-Dossier, §7/§5) ────────────────────
// Reihenfolge wie in gmbhDokumentmappe(). Reine Lese-Ableitung — wird von
// assemble()/der Mappe NICHT konsumiert (additiv, verhaltensneutral).
export const GMBH_ALLE_SCHEMAS: VorlageSchema[] = [
  STATUTEN_SCHEMA, ERRICHTUNGSAKT_SCHEMA, WAHLANNAHME_SCHEMA,
  DOMIZILANNAHME_SCHEMA, VORSITZ_SCHEMA, ERNENNUNG_SCHEMA, ANMELDUNG_SCHEMA,
];

// ── Dokumentmappe ───────────────────────────────────────────────────────────

export type GmbhDokument = {
  id: string;
  titel: string;
  /** Dateiname-Stamm für die Exporte. */
  dateiName: string;
  /** Auslöser-Etikett für die UI (analog Unterlagen-Zeile). */
  ausgeloestDurch?: string;
  ergebnis: AssembleErgebnis;
};

export function gmbhDokumentmappe(a: GmbhDokAntworten): { dokumente: GmbhDokument[]; gates: GmbhDokGates } {
  const gates = pruefeGmbhDokGates(a);
  if (gates.blocker.length > 0) return { dokumente: [], gates };

  // §5: Dokument-Auslöser aus der Checklisten-Engine ableiten (eine Quelle).
  // «Mehrere GF» folgt dabei aus der erfassten Liste, nicht aus dem Flag —
  // sonst könnten Checklisten-Schalter und Dokumentmappe auseinanderlaufen.
  const unterlagen = gmbhGruendungsunterlagen({
    ...a,
    mehrereGeschaeftsfuehrer: a.geschaeftsfuehrer.filter((g) => g.name.trim()).length > 1,
  }).unterlagen;
  const hat = (id: string) => unterlagen.some((u) => u.id === id);

  const basis = basisAntworten(a);

  // Urkunden-Belegliste (Art. 777b Abs. 2 OR, Bargründung)
  const belegeListe: { titel: string }[] = [{ titel: 'die Statuten' }];
  if (hat('bankbescheinigung')) {
    belegeListe.push({ titel: 'die Bestätigung über die Hinterlegung der Einlagen in Geld' });
  }

  // Anmeldungs-Beilagen: alle HRegV-Belege der Checkliste ausser den reinen
  // Vorbereitungs-Schritten und Nach-Eintrag-Pflichten. Belege mit
  // `entbehrlichWennInUrkunde` entfallen zusätzlich, weil der ERZEUGTE
  // Errichtungsakt ihren Inhalt stets aufnimmt (Vorsitz: EA09b) — Art. 71
  // Abs. 2 HRegV; Attribut an der Beleg-Definition statt id-Sonderliste
  // hier (/simplify-Altitude-Befund 7.6.2026, §5: eine Quelle).
  const KEINE_BEILAGE = new Set(['statutenentwurf', 'kapitaleinlagekonto', 'hr-anmeldung', 'freigabe-einlagen', 'anteilbuch', 'wb-verzeichnis']);
  const belegeAnmeldung = unterlagen
    .filter((u) => !KEINE_BEILAGE.has(u.id) && !u.entbehrlichWennInUrkunde)
    .map((u) => ({ titel: u.titel, norm: u.norm }));

  const dokumente: GmbhDokument[] = [];

  dokumente.push({
    id: 'statuten',
    titel: 'Statuten (Entwurf)',
    dateiName: 'gmbh-statuten-entwurf',
    ergebnis: nummeriereUeberschriftenAlsArtikel(assemble(STATUTEN_SCHEMA, basis)),
  });

  dokumente.push({
    id: 'errichtungsakt',
    titel: 'Errichtungsakt (Entwurf für die Urkundsperson)',
    dateiName: 'gmbh-errichtungsakt-entwurf',
    ergebnis: assemble(ERRICHTUNGSAKT_SCHEMA, { ...basis, belegeListe }),
  });

  if (hat('wahlannahme-gf')) {
    // Review-Befund M-1 (7.6.2026): ID über den Listenindex statt den Namen —
    // bei Namensgleichheit (z. B. Vater/Sohn) blieben sonst Dokumente
    // unanwählbar (UI-find auf der ID).
    a.geschaeftsfuehrer.filter((g) => g.name.trim()).forEach((gf, i) => {
      dokumente.push({
        id: `wahlannahme-${i}`,
        titel: `Wahlannahmeerklärung – ${gf.name.trim()}`,
        dateiName: 'gmbh-wahlannahme',
        ausgeloestDurch: 'Geschäftsführung beruht auf Wahl',
        ergebnis: assemble(WAHLANNAHME_SCHEMA, {
          ...basis,
          personName: gf.name.trim(),
          personAdresse: gf.adresse.trim() || '________',
        }),
      });
    });
  }

  if (hat('domizilannahme')) {
    dokumente.push({
      id: 'domizilannahme',
      titel: 'Domizilannahmeerklärung',
      dateiName: 'gmbh-domizilannahme',
      ausgeloestDurch: 'c/o-Adresse (kein eigenes Büro)',
      ergebnis: assemble(DOMIZILANNAHME_SCHEMA, basis),
    });
  }

  if (hat('vorsitz-beschluss')) {
    dokumente.push({
      id: 'vorsitz-beschluss',
      titel: 'Vorsitz-Beschluss (optional)',
      dateiName: 'gmbh-vorsitz-beschluss',
      // Art. 71 Abs. 2 HRegV: entbehrlich, weil der erzeugte Errichtungsakt
      // den Vorsitz bereits festhält — nur für Ämter, die ihn separat wollen.
      ausgeloestDurch: 'Mehrere GF — als Beleg entbehrlich (Vorsitz steht im Errichtungsakt, Art. 71 Abs. 2 HRegV)',
      ergebnis: assemble(VORSITZ_SCHEMA, basis),
    });
  }

  if (hat('vertretungs-beschluss')) {
    dokumente.push({
      id: 'ernennungs-beschluss',
      titel: 'Beschluss über weitere Vertretungsberechtigte',
      dateiName: 'gmbh-ernennungs-beschluss',
      ausgeloestDurch: 'Weitere Vertretungsberechtigte',
      ergebnis: assemble(ERNENNUNG_SCHEMA, basis),
    });
  }

  dokumente.push({
    id: 'hr-anmeldung',
    titel: 'Handelsregister-Anmeldung',
    dateiName: 'gmbh-hr-anmeldung',
    ergebnis: assemble(ANMELDUNG_SCHEMA, {
      ...basis,
      belegeAnmeldung,
      anmeldeAdresseZeile: a.eigeneBueros
        ? (a.rechtsdomizilAdresse.trim() || '________')
        : `c/o ${a.domizilhalterName.trim() || '________'}, ${a.domizilhalterAdresse.trim() || '________'}`,
    }),
  });

  return { dokumente, gates };
}

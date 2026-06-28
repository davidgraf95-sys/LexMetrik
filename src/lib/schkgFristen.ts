// Dossier: bibliothek/normen/schkg-zustaendigkeit-regelwerk.md
import { parseISO, addDays, differenceInCalendarDays, isAfter, isBefore } from 'date-fns';
import type { Normverweis, Rechenschritt } from '../types/legal';
import { formatDatum, formatISO } from './datumsUtils';
import type { SchkgInput, SchkgErgebnis, SchkgModus, SchkgFristnatur } from '../types/schkg';
import { stillstandsperioden, stillstandsperiodeFuer } from '../data/zpoFeiertage';
import { betreibungsferien, betreibungsperiodeFuer } from '../data/schkgFeiertage';
import { rechtsprechung } from '../data/verifikation';
import {
  fristendeTage,
  fristendeKalender,
  normalisiereEnde,
  OHNE_STILLSTAND,
  type Periode,
  type Stillstand,
} from './fristenEngine';

// ─── Feste Normverweise ───────────────────────────────────────────────────

const N_31:     Normverweis = { artikel: 'Art. 31 SchKG', bemerkung: 'Fristberechnung subsidiär nach der ZPO' };
const N_142_1:  Normverweis = { artikel: 'Art. 142 Abs. 1 ZPO', bemerkung: 'Tagesfrist: Beginn am Folgetag (Zustelltag zählt nicht)' };
const N_142_2:  Normverweis = { artikel: 'Art. 142 Abs. 2 ZPO', bemerkung: 'Monatsfrist: gleichbezeichneter Tag (Jahresfristen analog, st. Praxis)' };
const N_142_3:  Normverweis = { artikel: 'Art. 142 Abs. 3 ZPO', bemerkung: 'Ende am Sa/So/Feiertag → nächster Werktag' };
const N_56_1:   Normverweis = { artikel: 'Art. 56 Abs. 1 SchKG', bemerkung: 'Betreibungsferien und Rechtsstillstand' };
const N_56_2:   Normverweis = { artikel: 'Art. 56 Abs. 2 SchKG', bemerkung: 'Gerichtliche SchKG-Klagen: ZPO-Stillstand (Revision 1.1.2025, AS 2023 491)' };
const N_63:     Normverweis = { artikel: 'Art. 63 SchKG', bemerkung: 'Kein Ruhen; Verlängerung um 3 Werktage, wenn das Fristende in die geschlossene Zeit fällt' };
const N_145_1:  Normverweis = { artikel: 'Art. 145 Abs. 1 ZPO', bemerkung: 'Fristenstillstand (Ruhen)' };
const N_145_4:  Normverweis = { artikel: 'Art. 145 Abs. 4 ZPO', bemerkung: 'Stillstand für gerichtliche SchKG-Klagen; nicht für die Aufsichtsbeschwerde' };
const N_33_4:   Normverweis = { artikel: 'Art. 33 Abs. 4 SchKG', bemerkung: 'Wiederherstellung bei unverschuldetem Hindernis' };
const N_88_2:   Normverweis = { artikel: 'Art. 88 Abs. 2 SchKG', bemerkung: 'Stillstand der Verwirkungsfrist während rechtsvorschlagsbedingtem Verfahren' };
const N_166_2:  Normverweis = { artikel: 'Art. 166 Abs. 2 SchKG', bemerkung: 'Stillstand der Verwirkungsfrist während rechtsvorschlagsbedingtem Verfahren' };

const fmt = formatDatum;
const iso = formatISO;

// ─── Stillstand-Strategie je Modus ────────────────────────────────────────

function baueStrategie(modus: SchkgModus, rsVon?: string, rsBis?: string): Stillstand {
  if (modus === 'zpo_stillstand') {
    // Gerichtliche SchKG-Klage – ZPO-Ruhen (Art. 56 Abs. 2 SchKG / Art. 145 Abs. 4 ZPO).
    return {
      periodeFuer: stillstandsperiodeFuer,
      perioden: stillstandsperioden,
      ruhenZaehlung: true,
      endregel: 'ruhen_weiter',
    };
  }
  if (modus === 'kein') return OHNE_STILLSTAND;

  // schkg_betreibungsferien – Betreibungsferien (+ optional schuldnerbezogener
  // Rechtsstillstand). Kein Ruhen, nur 3-Werktage-Verlängerung am Ende (Art. 63).
  const rs: Periode | null =
    rsVon && rsBis ? { key: 'rechtsstillstand', von: parseISO(rsVon), bis: parseISO(rsBis) } : null;
  const inRs = (d: Date) => rs !== null && !isBefore(d, rs.von) && !isAfter(d, rs.bis);
  const basisPeriode = (d: Date): Periode | null => betreibungsperiodeFuer(d) ?? (inRs(d) ? rs : null);
  return {
    // Überlappen Betreibungsferien und Rechtsstillstand, bilden sie EINE
    // geschlossene Zeit: die Hülle wird vorwärts gemerged, damit Art. 63 am
    // Ende der gesamten geschlossenen Zeit ankert (nicht an der ersten Teilperiode).
    periodeFuer: (d) => {
      const p = basisPeriode(d);
      if (!p) return null;
      let bis = p.bis;
      for (let guard = 0; guard < 12; guard++) {
        const next = basisPeriode(addDays(bis, 1));
        if (!next) break;
        bis = next.bis;
      }
      return bis === p.bis ? p : { key: `${p.key}+verbund`, von: p.von, bis };
    },
    perioden: betreibungsferien,
    ruhenZaehlung: false,
    endregel: 'verlaengerung_3wt',
  };
}

const MODUS_LABEL: Record<SchkgModus, string> = {
  schkg_betreibungsferien: 'SchKG-Betreibungsferien (Art. 56/63 SchKG – kein Ruhen, 3-Werktage-Verlängerung)',
  zpo_stillstand: 'ZPO-Stillstand (gerichtliche Klage – Art. 56 Abs. 2 SchKG / Art. 145 Abs. 4 ZPO)',
  kein: 'Kein Stillstand (nur Werktagsverschiebung am Ende)',
};

const NATUR_WARNUNG: Partial<Record<SchkgFristnatur, string>> = {
  verwirkung:
    'Verwirkungsfrist – nicht erstreckbar und nicht wiederherstellbar (Ausnahme: unverschuldetes Hindernis, Art. 33 Abs. 4 SchKG). Das angezeigte Datum ist der letzte zulässige Tag.',
  wartefrist:
    'Wartefrist – das angezeigte Datum ist das FRÜHESTE zulässige Datum. Eine Handlung vor dessen Ablauf ist unzulässig und kann nichtig sein.',
};

// ─── Hauptfunktion ────────────────────────────────────────────────────────

export function berechneSchkgFrist(input: SchkgInput): SchkgErgebnis {
  if (!Number.isInteger(input.laenge) || input.laenge <= 0) {
    throw new Error('Fristlänge muss eine ganze Zahl > 0 sein.');
  }

  const rechenweg: Rechenschritt[] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];

  const modus = input.modusOverride ?? input.modus;
  const st = baueStrategie(modus, input.rechtsstillstandVon, input.rechtsstillstandBis);
  const ereignis = parseISO(input.ereignis);

  if (input.modusOverride && input.modusOverride !== input.modus) {
    rechenweg.push({
      beschreibung: 'Manueller Override des Stillstand-Regimes',
      zwischenergebnis: `Das Stillstand-Regime wurde manuell auf «${MODUS_LABEL[modus]}» gesetzt (umstrittene Konstellation, z. B. Summarsache nach Art. 251 ZPO).`,
      normen: [N_56_1, N_56_2],
    });
  }

  // Schritt 1 – auslösendes Ereignis
  rechenweg.push({
    beschreibung: 'Schritt 1 – Auslösendes Ereignis',
    zwischenergebnis:
      `${input.ausloeser ? input.ausloeser + ': ' : ''}${fmt(ereignis)}. ` +
      'Der Tag der Zustellung/Mitteilung wird nicht mitgezählt (Art. 31 SchKG i.V.m. Art. 142 Abs. 1 ZPO).',
    normen: [N_31, N_142_1],
  });

  // Schritt 2 – Fristende provisorisch
  let diesAQuo: Date;
  let endeProvisorisch: Date;

  if (input.einheit === 'tage') {
    const r = fristendeTage(ereignis, input.laenge, st);
    diesAQuo = r.diesAQuo;
    endeProvisorisch = r.ende;
    rechenweg.push({
      beschreibung: 'Schritt 2 – Tagesfrist (Beginn am Folgetag)',
      zwischenergebnis:
        `Tagesfrist von ${input.laenge} Tagen, Beginn (dies a quo): ${fmt(diesAQuo)}. ` +
        (modus === 'zpo_stillstand'
          ? 'Stillstandstage werden nicht mitgezählt (ZPO-Ruhen). '
          : 'Die Frist läuft ohne Unterbruch (Betreibungsferien hemmen den Lauf nicht, Art. 63 SchKG). ') +
        `Rechnerisches Ende (vor Endnormalisierung): ${fmt(endeProvisorisch)}.`,
      normen: modus === 'zpo_stillstand' ? [N_142_1, N_145_1] : [N_142_1, N_63],
      rechtsprechung: modus === 'schkg_betreibungsferien' ? [rechtsprechung('BGE_143_III_149')] : undefined,
    });
  } else {
    const r = fristendeKalender(ereignis, input.einheit, input.laenge, st, false);
    diesAQuo = r.diesAQuo;
    endeProvisorisch = r.ende;
    const einheitLabel = input.einheit === 'monate' ? 'Monats' : 'Jahres';
    rechenweg.push({
      beschreibung: `Schritt 2 – ${einheitLabel}frist (gleichbezeichneter Tag, Art. 142 Abs. 2 ZPO)`,
      zwischenergebnis:
        `dies a quo: ${fmt(diesAQuo)}. Naives Ende: ${fmt(endeProvisorisch)}.` +
        (r.verlaengerungTage > 0 ? ` Stillstandsverlängerung: +${r.verlaengerungTage} Tage (ZPO-Ruhen).` : ''),
      normen: modus === 'zpo_stillstand' ? [N_142_2, N_145_1] : [N_142_2],
    });
  }

  // Schritt 2b – Hemmung der Verwirkungsfrist (Art. 88 Abs. 2 / Art. 166 Abs. 2)
  // Echtes Ruhen: Beginnt das hemmende Verfahren während des Fristenlaufs,
  // pausiert die Frist für das GANZE Fenster – auch über das rechnerische Ende
  // hinaus (das Verfahren dauert typischerweise länger als der Fristrest).
  if (input.hemmungVon && input.hemmungBis) {
    const hv = parseISO(input.hemmungVon);
    const hb = parseISO(input.hemmungBis);
    const von = isBefore(hv, diesAQuo) ? diesAQuo : hv;
    const beginntImLauf = !isAfter(von, endeProvisorisch) && !isBefore(hb, von);
    if (beginntImLauf) {
      const tage = differenceInCalendarDays(hb, von) + 1;
      endeProvisorisch = addDays(endeProvisorisch, tage);
      rechenweg.push({
        beschreibung: 'Schritt 2b – Stillstand der Verwirkungsfrist (Hemmung)',
        zwischenergebnis:
          `Während des rechtsvorschlagsbedingten Verfahrens (${fmt(hv)}–${fmt(hb)}) steht die Verwirkungsfrist still: ` +
          `${tage} Tage (ab ${fmt(von)}); die Frist läuft nach Verfahrensende weiter → neues rechnerisches Ende: ${fmt(endeProvisorisch)}.`,
        normen: [N_88_2, N_166_2],
        rechtsprechung: [rechtsprechung('BGer_5A_190_2023')],
      });
      warnungen.push(
        'Die Hemmung der Verwirkungsfrist (Art. 88 Abs. 2 / Art. 166 Abs. 2 SchKG) ist als ganztägiger Stillstand im angegebenen Fenster modelliert; der genaue Beginn/Ablauf des hemmenden Verfahrens ist im Einzelfall zu prüfen.',
      );
    }
  }

  // Schritt 3 – Endnormalisierung
  const { tag: diesAdQuem, verschoben } = normalisiereEnde(endeProvisorisch, input.kanton, st);
  rechenweg.push({
    beschreibung:
      modus === 'schkg_betreibungsferien'
        ? 'Schritt 3 – Endnormalisierung (Art. 63 SchKG / Art. 31 i.V.m. Art. 142 Abs. 3 ZPO)'
        : 'Schritt 3 – Endnormalisierung (Art. 142 Abs. 3 / Art. 145 Abs. 1 ZPO)',
    zwischenergebnis: verschoben
      ? modus === 'schkg_betreibungsferien'
        ? `Das rechnerische Ende ${fmt(endeProvisorisch)} fiel in eine geschlossene Zeit oder auf einen arbeitsfreien Tag → verschoben auf ${fmt(diesAdQuem)} (bei Ende in den Betreibungsferien: 3. Werktag danach, Art. 63 SchKG).`
        : `Das rechnerische Ende ${fmt(endeProvisorisch)} fiel auf einen arbeitsfreien Tag bzw. in einen Stillstand → verschoben auf ${fmt(diesAdQuem)}.`
      : `Ende ${fmt(diesAdQuem)} ist bereits ein Werktag – keine Verschiebung.`,
    normen: modus === 'schkg_betreibungsferien' ? [N_63, N_142_3] : [N_142_3, N_145_1],
    rechtsprechung: modus === 'schkg_betreibungsferien' && verschoben ? [rechtsprechung('BGE_108_III_49')] : undefined,
  });

  // ─── Hinweise / Vorbehalte ──────────────────────────────────────────────

  const naturWarnung = NATUR_WARNUNG[input.fristnatur];
  if (naturWarnung) warnungen.push(naturWarnung);

  if (modus === 'schkg_betreibungsferien') {
    warnungen.push(
      'Achtung Betreibungsferien (Art. 56 SchKG) – NICHT identisch mit den Gerichtsferien: Sommer nur bis 31.7. (nicht 15.8.), Weihnachten nur bis 1.1. (nicht 2.1.). Sie hemmen den Fristenlauf nicht (Art. 63 SchKG).',
    );
  }
  if (modus === 'zpo_stillstand') {
    warnungen.push(
      'Gerichtliche SchKG-Klage: Seit 1.1.2025 gilt der ZPO-Fristenstillstand (Art. 56 Abs. 2 SchKG / Art. 145 Abs. 4 ZPO), nicht die Betreibungsferien.',
    );
  }
  warnungen.push(
    'Kantonal unterschiedliche Feiertage beeinflussen das Fristende (Art. 31 SchKG i.V.m. Art. 142 Abs. 3 ZPO) und sind eigenständig zu prüfen.',
  );
  if ((input.rechtsstillstandVon || input.rechtsstillstandBis) && modus !== 'schkg_betreibungsferien') {
    warnungen.push(
      'Der eingegebene Rechtsstillstand (Art. 57–62 SchKG) wirkt nur im Regime der Betreibungsferien (Art. 63 SchKG) und bleibt im gewählten Stillstand-Regime unberücksichtigt.',
    );
  }

  annahmen.push(
    `Stillstand-Regime: ${MODUS_LABEL[modus]}.`,
    `Rechtsnatur: ${input.fristnatur}.`,
    `Kanton (staatlich anerkannte Feiertage): ${input.kanton}.`,
    'Reine prozessuale Fristberechnung; der konkrete Sachverhalt ist im Einzelfall zu prüfen.',
  );

  // Fristbeginn-Norm explizit benannt (B1-1): Art. 31 SchKG verweist auf die
  // ZPO-Fristberechnung — nicht über normverweise[1] erschlossen.
  const fristbeginnZpoNorm = input.einheit === 'tage' ? N_142_1 : N_142_2;
  const fristbeginnNorm = `Art. 31 SchKG i.V.m. ${fristbeginnZpoNorm.artikel}`;
  const normverweise: Normverweis[] = [
    N_31,
    fristbeginnZpoNorm,
    N_142_3,
  ];
  if (modus === 'schkg_betreibungsferien') normverweise.push(N_56_1, N_63);
  if (modus === 'zpo_stillstand') normverweise.push(N_56_2, N_145_4, N_145_1);
  if (input.fristnatur === 'verwirkung') normverweise.push(N_33_4);

  // Bug-Check 10.6.2026 (MITTEL, deklarierte fachliche Änderung): Die Warte-
  // frist läuft am rechnerischen Ende um 24.00 Uhr ab — frühestes ZULÄSSIGES
  // Datum ist erst der FOLGETAG (Art. 88 Abs. 1 SchKG: «frühestens 20 Tage
  // NACH der Zustellung»). Vorher wurde der letzte Tag DER LAUFENDEN Frist
  // als zulässig ausgewiesen (verfrühtes Begehren → Rückweisung).
  const massgeblich = input.fristnatur === 'wartefrist' ? addDays(diesAdQuem, 1) : diesAdQuem;
  if (input.fristnatur === 'wartefrist') {
    rechenweg.push({
      beschreibung: 'Schritt 4 – Frühestes zulässiges Datum (Wartefrist)',
      zwischenergebnis:
        `Die Wartefrist läuft am ${fmt(diesAdQuem)} um 24.00 Uhr ab – die Handlung ist frühestens am Folgetag, ${fmt(massgeblich)}, zulässig.`,
      normen: [N_31],
    });
  }
  const datumLabel =
    input.fristnatur === 'wartefrist'
      ? `Frühestes zulässiges Datum: ${fmt(massgeblich)}`
      : input.fristnatur === 'verwirkung'
        ? `Letzter zulässiger Tag (Verwirkung): ${fmt(diesAdQuem)}, 24.00 Uhr`
        : `Fristende: ${fmt(diesAdQuem)}, 24.00 Uhr`;

  return {
    ergebnis: datumLabel + '.',
    fristbeginnNorm,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise,
    massgeblicherEreignistag: fmt(ereignis),
    diesAQuo: fmt(diesAQuo),
    diesAdQuem: fmt(massgeblich),
    ereignisISO: iso(ereignis),
    diesAQuoISO: iso(diesAQuo),
    diesAdQuemISO: iso(massgeblich),
    modusAktiv: modus,
    ruhenAnzeige: modus === 'zpo_stillstand',
  };
}

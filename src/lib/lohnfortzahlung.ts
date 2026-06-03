import { parseISO, addMonths } from 'date-fns';
import type { LohnfortzahlungInput, Berechnungsergebnis, Normverweis } from '../types/legal';
import {
  berechneDienstjahr,
  formatDatum,
  formatSkalaDauer,
  letzterTagLohnfortzahlung,
  skaliereSkalaDauer,
  dauerUeberDreiMonate,
} from './datumsUtils';
import { skaleFuerKanton, dauerAusSkala } from '../data/lohnfortzahlungSkalen';

// ─── Feste Normverweise (Art. 324a OR) ────────────────────────────────────

const N_324a_1: Normverweis = { artikel: 'Art. 324a Abs. 1 OR', bemerkung: 'Anspruchsvoraussetzung' };
const N_324a_2: Normverweis = { artikel: 'Art. 324a Abs. 2 OR', bemerkung: 'Dauer «angemessen länger»' };
const N_324a_4: Normverweis = { artikel: 'Art. 324a Abs. 4 OR', bemerkung: 'Abweichende (gleichwertige) Regelung' };
const N_324b:   Normverweis = { artikel: 'Art. 324b OR', bemerkung: 'Krankentaggeldversicherung' };
const N_362:    Normverweis = { artikel: 'Art. 362 OR', bemerkung: 'Relativ zwingendes Recht' };

export function berechneLohnfortzahlung(input: LohnfortzahlungInput): Berechnungsergebnis {
  const {
    vertragsbeginn,
    verhinderungBeginn,
    arbeitsunfaehigkeitProzent,
    kanton,
    ktgGleichwertigVorhanden,
    monatslohnBrutto,
  } = input;

  const vb  = parseISO(vertragsbeginn);
  const vhb = parseISO(verhinderungBeginn);

  const rechenweg: Berechnungsergebnis['rechenweg'] = [];
  const annahmen: string[] = [
    'Unverschuldete Verhinderung (Krankheit, Unfall, Schwangerschaft o.ä.).',
    'Stichtag für Dienstjahr-Bestimmung: Beginn der Arbeitsverhinderung.',
    'Kein GAV mit abweichender Regelung unterstellt.',
  ];
  const warnungen: string[] = [
    'Die Lohnfortzahlungsskalen sind Gerichtspraxis zur Konkretisierung von Art. 324a Abs. 2 OR – keine Gesetzesnormen. Vor Produktiveinsatz gegen aktuelle kantonale Praxis abzugleichen.',
  ];

  // ─── Schritt 0: KTG-Gleichwertigkeit ─────────────────────────────────

  if (ktgGleichwertigVorhanden) {
    rechenweg.push({
      beschreibung: 'Schritt 0 – KTG-Gleichwertigkeitsprüfung (Art. 324a Abs. 4 / Art. 324b OR)',
      zwischenergebnis:
        'Eine mindestens gleichwertige Krankentaggeldversicherung ist vorhanden. ' +
        'Das KTG-Regime tritt an die Stelle der gesetzlichen Skala. ' +
        'Faustregel der Rechtsprechung: Taggeld ≥ 80 % des Lohnes während max. 720 Tagen innert 900 Tagen bei hälftiger Prämienteilung, wenige Karenztage.',
      normen: [N_324a_4, N_324b, N_362],
      rechtsprechung: [
        {
          aktenzeichen: 'BGE 135 III 640',
          aussage: 'Gleichwertigkeitsmassstab bei Krankentaggeldversicherung',
          verifiziert: false,
        },
      ],
    });
    return {
      ergebnis: 'KTG-Regime: Mindestens gleichwertige Krankentaggeldversicherung vorhanden. Die gesetzliche Skala (Art. 324a OR) findet keine Anwendung. Der konkrete Leistungsanspruch ergibt sich aus der Versicherungspolice.',
      status: 'ktg_regime',
      rechenweg,
      annahmen,
      warnungen: [
        ...warnungen,
        'Bitte die Gleichwertigkeit der Versicherungslösung im Einzelfall prüfen (Leistungsdauer, Leistungshöhe, Karenztage, Prämienteilung).',
      ],
      normverweise: [N_324a_4, N_324b, N_362],
    };
  }

  // ─── Schritt 1: Anspruchsvoraussetzung ───────────────────────────────

  const dreiMonate = addMonths(vb, 3);
  const hatAnspruch = dauerUeberDreiMonate(vb, vhb);

  rechenweg.push({
    beschreibung: 'Schritt 1 – Anspruchsvoraussetzung (Art. 324a Abs. 1 OR)',
    zwischenergebnis: hatAnspruch
      ? `Arbeitsverhältnis dauert seit ${formatDatum(vb)} (Vertragsbeginn) bis ${formatDatum(vhb)} (Verhinderung), also mehr als 3 Monate. Anspruch besteht.`
      : `Arbeitsverhältnis dauert seit ${formatDatum(vb)} bis ${formatDatum(vhb)} – noch keine 3 Monate. Kein Anspruch nach Art. 324a OR. Grenzwert: ${formatDatum(dreiMonate)}.`,
    normen: [N_324a_1],
  });

  if (!hatAnspruch) {
    return {
      ergebnis: 'Kein Anspruch auf Lohnfortzahlung: Das Arbeitsverhältnis hat noch keine 3 Monate gedauert (Art. 324a Abs. 1 OR).',
      status: 'kein_anspruch',
      rechenweg,
      annahmen,
      warnungen: [
        ...warnungen,
        'Prüfen, ob der Vertrag für mehr als 3 Monate eingegangen wurde (feste Dauer > 3 Monate genügt für den Anspruch auch ohne Ablauf dieser Zeit).',
      ],
      normverweise: [N_324a_1],
    };
  }

  // ─── Schritt 2: Skala bestimmen ──────────────────────────────────────

  const { skala, warnung: skalaWarnung } = skaleFuerKanton(kanton);
  if (skalaWarnung) warnungen.push(skalaWarnung);

  rechenweg.push({
    beschreibung: 'Schritt 2 – Skala bestimmen',
    zwischenergebnis: `Kanton ${kanton} → ${skala.name}. ${skala.quellenhinweis}`,
    normen: [N_324a_2],
  });

  // ─── Schritt 3: Dienstjahr ermitteln ─────────────────────────────────

  const dienstjahr = berechneDienstjahr(vb, vhb);

  rechenweg.push({
    beschreibung: 'Schritt 3 – Dienstjahr (Stichtag = Beginn der Verhinderung)',
    zwischenergebnis:
      `Vertragsbeginn ${formatDatum(vb)}, Stichtag ${formatDatum(vhb)}: ` +
      `${dienstjahr - 1} vollendete Jahre + 1 = ${dienstjahr}. Dienstjahr.`,
    normen: [N_324a_2],
  });

  // ─── Schritt 4: Skala ablesen ────────────────────────────────────────

  const skalaEintrag = dauerAusSkala(skala, dienstjahr);
  if (!skalaEintrag) {
    return {
      ergebnis: `Kein Skalaeintrag für ${dienstjahr}. Dienstjahr gefunden. Bitte Skala manuell prüfen.`,
      status: 'kein_anspruch',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_324a_2],
    };
  }

  let basisdauer = skalaEintrag.dauer;

  rechenweg.push({
    beschreibung: `Schritt 4 – Skala-Dauer ablesen (${skala.name}, ${dienstjahr}. DJ)`,
    zwischenergebnis: `Anspruch laut Gerichtspraxis: ${formatSkalaDauer(basisdauer)} (GERICHTSPRAXIS – vor Produktiveinsatz zu verifizieren).`,
    normen: [N_324a_2],
  });

  // ─── Schritt 5: Teilarbeitsunfähigkeit ──────────────────────────────

  let effektiveDauer = basisdauer;
  if (arbeitsunfaehigkeitProzent < 100) {
    effektiveDauer = skaliereSkalaDauer(basisdauer, arbeitsunfaehigkeitProzent);
    rechenweg.push({
      beschreibung: `Schritt 5 – Teilarbeitsunfähigkeit ${arbeitsunfaehigkeitProzent} % (Budget-Modell)`,
      zwischenergebnis:
        `Skala-Dauer ${formatSkalaDauer(basisdauer)} ÷ ${arbeitsunfaehigkeitProzent / 100} = ${formatSkalaDauer(effektiveDauer)}. ` +
        `Das Budget in Höhe von ${formatSkalaDauer(basisdauer)} vollem Lohn wird über die gestreckte Periode aufgebraucht.`,
      normen: [N_324a_2],
    });
    warnungen.push(
      `Budget-Modell bei Teil-AUF: Die kalendarische Streckung der Lohnfortzahlungsdauer bei Teilarbeitsunfähigkeit (${arbeitsunfaehigkeitProzent} %) ist eine vertretbare Praxis-Auslegung und im Einzelfall zu prüfen.`,
    );
  }

  // ─── Schritt 6: Enddatum berechnen ──────────────────────────────────

  const letzterTag = letzterTagLohnfortzahlung(vhb, effektiveDauer);

  rechenweg.push({
    beschreibung: 'Schritt 6 – Letzter bezahlter Tag (Starttag inklusiv, kalendarisch)',
    zwischenergebnis:
      `Beginn der Verhinderung ${formatDatum(vhb)} + ${formatSkalaDauer(effektiveDauer)} − 1 Tag = ${formatDatum(letzterTag)}.`,
    normen: [N_324a_2],
  });

  // ─── Schritt 7 (optional): Lohnbasis ─────────────────────────────────

  if (monatslohnBrutto != null) {
    const tagesansatz = monatslohnBrutto / 30;
    rechenweg.push({
      beschreibung: 'Schritt 7 – Lohnbasis (orientierend)',
      zwischenergebnis:
        `Monatslohn brutto CHF ${monatslohnBrutto.toFixed(2)} → Tagesansatz ~CHF ${tagesansatz.toFixed(2)} (Monat = 30 Tage). ` +
        `Massgebend ist der vertragliche Bruttolohn inkl. 13. Monatslohn (anteilig) und regelmässiger Zulagen. ` +
        `Bei schwankendem Lohn gilt der 12-Monats-Durchschnitt.`,
      normen: [N_324a_1],
    });
    annahmen.push('Lohnbasis: 100 % des vertraglichen Bruttolohns inkl. 13. Monatslohn (anteilig) und regelmässiger Zulagen.');
  }

  annahmen.push(
    'Mehrere Absenzen im gleichen Dienstjahr werden kumuliert; das Skala-Kontingent gilt pro Dienstjahr.',
    'Keine Karenztage: Lohnfortzahlung beginnt ab dem ersten Tag der Verhinderung.',
  );

  return {
    ergebnis: `Lohnfortzahlung bis und mit ${formatDatum(letzterTag)} (${formatSkalaDauer(effektiveDauer)}${arbeitsunfaehigkeitProzent < 100 ? `, bei ${arbeitsunfaehigkeitProzent} % AUF nach Budget-Modell` : ''}).`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise: [N_324a_1, N_324a_2, N_324a_4, N_362],
  };
}

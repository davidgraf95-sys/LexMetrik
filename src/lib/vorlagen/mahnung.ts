// Dossier: bibliothek/recherche/or-vertragsvorlagen.md
import type { VorlageSchema, Antworten, Baustein } from './engine';
import { assemble } from './engine';
import { fmtDatum, fmtCHF, zahl } from './datum';
import { parseISO, addDays } from 'date-fns';
import { formatDatum, istGueltigesISO } from '../datumsUtils';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgDatumzeile, kdgSchluss,
} from './kuendigungGemeinsam';

// ─── Mahnung & Inverzugsetzung (Art. 102/104/107 OR) ────────────────────────
//
// Bauspezifikation: bibliothek/recherche/or-vertragsvorlagen.md §§3–4
// (5.6.2026). Katalog-Entscheid 7.6.2026: «Inverzugsetzung» ist KEINE eigene
// Karte, sondern Variante desselben Schreibens — darum EINE Maske mit der
// Weiche Zahlungs-Mahnung (Art. 102 Abs. 1) ↔ Nachfristansetzung (Art. 107).
//
// Wortlaute am Filestore-Cache verifiziert (11.6.2026, OR-Konsolidierung
// 20260101): Art. 102 Abs. 1 (fällige Verbindlichkeit + Mahnung → Verzug),
// Abs. 2 (Verfalltag: Verzug mit Ablauf dieses Tages, ohne Mahnung);
// Art. 104 Abs. 1 (Verzugszins 5 % pro Jahr), Abs. 2 (vertraglich höhere
// Zinsen gelten auch im Verzug); Art. 107 Abs. 1 (angemessene Nachfrist bei
// zweiseitigen Verträgen), Abs. 2 (Wahlrechte; Verzicht/Rücktritt nur bei
// UNVERZÜGLICHER Erklärung); Art. 108 (Nachfrist entbehrlich: zwecklos /
// Leistung nutzlos geworden / Fixgeschäft).
//
// Fachliche Festlegung (§5-Konsistenz mit lib/verzugszins.ts, beginnTyp
// 'mahnung' = «Zins läuft ab Erhalt der Mahnung»): Der Brief erklärt den
// Verzugseintritt AB ZUGANG ausdrücklich und macht damit klar, dass die
// gesetzte Zahlungsfrist KEIN Zuwarten mit den Verzugsfolgen bedeutet —
// ohne diese Klarstellung wird die Fristgewährung teilweise als Aufschub
// der Verzugsfolgen gelesen (in der UI offengelegt).

export type MaVariante = 'zahlung' | 'nachfrist';

export type MaAntworten = KdgBasisAntworten & {
  variante: MaVariante;
  // Variante 'zahlung' (Art. 102 Abs. 1 / 104 OR)
  betrag: string;                  // CHF (Nutzer-String, keine Arithmetik)
  rechtsgrund: string;             // z. B. «Rechnung Nr. 4711 vom 12. Mai 2026»
  faelligSeit: string;             // ISO, optional
  verfalltagVereinbart: boolean;   // Art. 102 Abs. 2 (Verzug ohne Mahnung)
  verfalltag: string;              // ISO, nur wenn vereinbart
  zahlungsfristTage: number;       // gesetzte Zahlungsfrist (Praxis-Wahl)
  zahlungsverbindung: string;      // IBAN/Konto, optional
  zinsVertraglich: boolean;        // höherer Verzugszins vereinbart (104 II)
  zinssatzProzent: string;         // nur wenn zinsVertraglich (> 5)
  mahngebuehrErfassen: boolean;
  mahngebuehr: string;             // CHF, nur mit vertraglicher Grundlage
  mahngebuehrVertraglich: boolean;
  betreibungAndrohen: boolean;
  // Variante 'nachfrist' (Art. 107 OR)
  vertragBezeichnung: string;      // z. B. «Werkvertrag vom 1. Februar 2026»
  leistungBeschrieb: string;       // geschuldete Nicht-Geld-Leistung
  nachfristTage: number;
};

export const MA_DEFAULTS: MaAntworten = {
  ...KDG_BASIS_DEFAULTS,
  variante: 'zahlung',
  betrag: '', rechtsgrund: '', faelligSeit: '',
  verfalltagVereinbart: false, verfalltag: '',
  zahlungsfristTage: 10, zahlungsverbindung: '',
  zinsVertraglich: false, zinssatzProzent: '',
  mahngebuehrErfassen: false, mahngebuehr: '', mahngebuehrVertraglich: false,
  betreibungAndrohen: true,
  vertragBezeichnung: '', leistungBeschrieb: '', nachfristTage: 10,
};

/** Verfalltag (Art. 102 Abs. 2 OR): Zins läuft ab dem FOLGETAG — reine
 *  Datums-Addition wie in lib/verzugszins.ts (ersterZinstag), keine Engine. */
export function maZinsAbFolgetag(verfalltagISO: string): string | null {
  // istGueltigesISO statt Format-Regex: '2026-02-30' aus alten Speicherständen
  // crashte sonst formatDatum beim Rendern (Bug-Check NIEDRIG-1, 11.6.2026).
  if (!istGueltigesISO(verfalltagISO)) return null;
  return formatDatum(addDays(parseISO(verfalltagISO), 1));
}

// ── Gates/Hinweise (alle deterministisch, normverifiziert) ──────────────────

export type MaGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeMaGates(a: MaAntworten): MaGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  if (a.variante === 'zahlung') {
    hinweise.push(
      'Die Mahnung setzt die FÄLLIGKEIT der Forderung voraus (Art. 102 Abs. 1 OR) – '
      + 'eine Mahnung vor Fälligkeit löst keinen Verzug aus.',
    );
    if (a.verfalltagVereinbart) {
      hinweise.push(
        'Bei vereinbartem Verfalltag trat der Verzug bereits mit dessen Ablauf ein '
        + '(Art. 102 Abs. 2 OR) – rechtlich braucht es diese Mahnung nicht; sie dient dem '
        + 'Nachweis und der letzten Zahlungsgelegenheit. Die Betreibung wäre auch direkt möglich.',
      );
    }
    if (a.mahngebuehrErfassen && !a.mahngebuehrVertraglich) {
      warnungen.push(
        'Mahngebühren sind OHNE vertragliche Grundlage nicht geschuldet – von Gesetzes wegen '
        + 'bestehen nur Verzugszins (Art. 104 OR) und allfälliger NACHGEWIESENER Verspätungs- '
        + 'bzw. Mehrschaden (Art. 103/106 OR); eine pauschale Gebühr deckt das nicht. Der Brief '
        + 'nimmt die Gebühr deshalb nicht auf; bestätigen Sie die vertragliche Grundlage, wenn eine besteht.',
      );
    }
    if (a.zinsVertraglich) {
      const satz = Number(String(a.zinssatzProzent).replace(/['\s]/g, '').replace(',', '.'));
      if (!Number.isFinite(satz) || satz <= 5) {
        // BLOCKER statt Warnung (Bug-Check 11.6.2026, Defense-in-depth §3):
        // das Dokument trüge sonst die falsche Rechtsaussage «… (Art. 104
        // Abs. 2 OR)» für einen Satz ≤ 5 % — Abs. 2 erfasst nur HÖHERE
        // Zinsen (s. lib/verzugszins.ts); die Sperre hing allein am
        // UI-Schrittfehler.
        blocker.push(
          'Der vertragliche Verzugszins-Baustein setzt einen Satz ÜBER 5 % voraus (Art. 104 Abs. 2 OR '
          + 'erfasst nur HÖHERE vertragliche Zinsen) – bei 5 % oder weniger das Feld deaktivieren; '
          + 'es gilt der gesetzliche Satz (Abs. 1).',
        );
      }
    }
    hinweise.push(
      'Der Brief erklärt den Verzugseintritt ab ZUGANG ausdrücklich. Ohne diese Klarstellung '
      + 'wird eine Zahlungsfrist in der Mahnung teilweise so gelesen, dass die Verzugsfolgen erst '
      + 'nach Fristablauf geltend gemacht werden.',
    );
  }

  if (a.variante === 'nachfrist') {
    hinweise.push(
      'Die Nachfristansetzung nach Art. 107 OR gilt für ZWEISEITIGE Verträge (Leistung gegen '
      + 'Gegenleistung). Für reine Geldforderungen ist die Zahlungs-Mahnung die richtige Variante.',
    );
    hinweise.push(
      'Ob die gewählte Nachfrist ANGEMESSEN ist (Art. 107 Abs. 1 OR), ist eine Wertungsfrage – '
      + 'LexMetrik berechnet hier bewusst nichts. Eine zu kurz angesetzte Frist setzt nach der '
      + 'Praxis immerhin eine angemessene Frist in Gang.',
    );
    hinweise.push(
      'Verzicht auf die Leistung oder Rücktritt müssen nach Ablauf der Nachfrist UNVERZÜGLICH '
      + 'erklärt werden (Art. 107 Abs. 2 OR) – der Vorbehalt in diesem Schreiben ersetzt diese '
      + 'spätere Erklärung nicht.',
    );
    hinweise.push(
      'In drei Fällen ist die Nachfrist entbehrlich (Art. 108 OR): wenn aus dem Verhalten des '
      + 'Schuldners hervorgeht, dass sie sich als unnütz erweisen würde; wenn die Leistung durch '
      + 'den Verzug für Sie nutzlos geworden ist; oder beim Fixgeschäft.',
    );
  }

  return { blocker, warnungen, hinweise };
}

// ── Brief-Anatomie (eigene Begründungen; die kdg*-Fabriken sprechen von der
//    «Kündigung» und passen darum im Bausteinprotokoll nicht, §1) ───────────

const maAbsender: Baustein = {
  id: 'MA_absender', rolle: 'absender', text: '{{absenderBlock}}',
  begruendung: 'Absenderin/Absender des Schreibens – immer enthalten.',
};
const maAdressat: Baustein = {
  id: 'MA_adressat', rolle: 'adressat', text: '{{adressatBlock}}',
  begruendung: 'Schuldnerin/Schuldner als Empfänger – immer enthalten.',
};
const maAnrede: Baustein = {
  id: 'MA_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
  begruendung: 'Anrede – immer enthalten.',
};
const maUnterschrift: Baustein = {
  id: 'MA_unterschrift', rolle: 'unterschrift',
  text: '___________________________\n{{absenderName}}',
  begruendung: 'Unterschrift der Gläubigerin/des Gläubigers.',
};

// ── Schema ──────────────────────────────────────────────────────────────────

export const MA_SCHEMA: VorlageSchema = {
  id: 'mahnung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Bauspezifikation or-vertragsvorlagen.md; OR-Wortlaute verifiziert 20260101)',
  titel: 'Mahnung',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Massgebend sind Vertrag und Gesetz; '
    + 'der Zugang beim Empfänger entscheidet. Mahnung ist keine Betreibung – für die '
    + 'Zwangsvollstreckung ist das Betreibungsbegehren der nächste Schritt.',
  bausteine: [
    maAbsender,
    maAdressat,
    kdgDatumzeile('MA_datumzeile'),
    { id: 'MA_betreff_zahlung', rolle: 'betreff',
      text: 'Mahnung – {{rechtsgrund}}',
      includeIf: { feld: 'variante', eq: 'zahlung' },
      begruendung: 'Betreff der Zahlungs-Mahnung mit dem Rechtsgrund der Forderung.' },
    { id: 'MA_betreff_nachfrist', rolle: 'betreff',
      text: 'Inverzugsetzung mit Nachfristansetzung – {{vertragBezeichnung}}',
      includeIf: { feld: 'variante', eq: 'nachfrist' },
      begruendung: 'Betreff der Nachfristansetzung mit der Vertragsbezeichnung.' },
    maAnrede,

    // ── Variante Zahlung (Art. 102 Abs. 1 / 104 OR) ─────────────────────────
    { id: 'MA_forderung',
      text: 'Trotz Fälligkeit ist die folgende Forderung offen: CHF {{betragFmt}} aus {{rechtsgrund}}{{faelligSeitSatz}}.',
      includeIf: { feld: 'variante', eq: 'zahlung' },
      begruendung: 'Bestimmte Bezeichnung der Forderung (Betrag und Rechtsgrund) – Kern der Mahnung.' },
    { id: 'MA_verzug_mahnung',
      text: 'Ich mahne Sie hiermit. Mit dem Zugang dieser Mahnung befinden Sie sich in Verzug (Art. 102 Abs. 1 OR).',
      includeIf: { and: [{ feld: 'variante', eq: 'zahlung' }, { not: { feld: 'verfalltagVereinbart', eq: true } }] },
      norm: 'Art. 102 Abs. 1 OR',
      begruendung: 'Verzugseintritt durch Mahnung bei fälliger Verbindlichkeit; der ausdrückliche Satz stellt klar, dass die Zahlungsfrist kein Zuwarten mit den Verzugsfolgen bedeutet (Konsistenz mit dem Verzugszins-Rechner: Zins ab Erhalt der Mahnung).' },
    { id: 'MA_verzug_verfalltag',
      text: 'Die Zahlung war auf den {{verfalltagFmt}} vereinbart. Sie befinden sich daher seit Ablauf dieses Tages in Verzug (Art. 102 Abs. 2 OR), ohne dass es einer Mahnung bedurft hätte.',
      includeIf: { and: [{ feld: 'variante', eq: 'zahlung' }, { feld: 'verfalltagVereinbart', eq: true }] },
      norm: 'Art. 102 Abs. 2 OR',
      begruendung: 'Bei verabredetem Verfalltag tritt der Verzug mit dessen Ablauf ein – das Schreiben hält den bereits eingetretenen Verzug fest.' },
    { id: 'MA_zins_gesetzlich',
      text: 'Ab Verzugseintritt{{zinsSeitSatz}} schulden Sie Verzugszins von 5 % pro Jahr (Art. 104 Abs. 1 OR).',
      includeIf: { and: [{ feld: 'variante', eq: 'zahlung' }, { not: { feld: 'zinsVertraglich', eq: true } }] },
      norm: 'Art. 104 Abs. 1 OR',
      begruendung: 'Gesetzlicher Verzugszins von 5 % pro Jahr bei Geldschulden.' },
    { id: 'MA_zins_vertraglich',
      text: 'Ab Verzugseintritt{{zinsSeitSatz}} schulden Sie den vertraglich vereinbarten Verzugszins von {{zinssatzProzent}} % pro Jahr (Art. 104 Abs. 2 OR).',
      includeIf: { and: [{ feld: 'variante', eq: 'zahlung' }, { feld: 'zinsVertraglich', eq: true }] },
      norm: 'Art. 104 Abs. 2 OR',
      begruendung: 'Vertraglich höhere Zinsen können auch während des Verzugs gefordert werden.' },
    { id: 'MA_zahlungsaufforderung',
      text: 'Ich fordere Sie auf, den offenen Betrag {{zahlungsfristSatz}} seit Erhalt dieses Schreibens zu bezahlen{{zahlungsverbindungSatz}}.',
      includeIf: { feld: 'variante', eq: 'zahlung' },
      begruendung: 'Zahlungsaufforderung mit gesetzter Frist – die Frist ist eine Praxis-Wahl, keine gesetzliche Vorgabe.' },
    { id: 'MA_mahngebuehr',
      text: 'Zusätzlich verrechne ich Ihnen die vertraglich vereinbarte Mahngebühr von CHF {{mahngebuehrFmt}}.',
      includeIf: { and: [
        { feld: 'variante', eq: 'zahlung' },
        { feld: 'mahngebuehrErfassen', eq: true },
        { feld: 'mahngebuehrVertraglich', eq: true },
        { feld: 'mahngebuehr', nichtLeer: true },
      ] },
      begruendung: 'Mahngebühr NUR bei bestätigter vertraglicher Grundlage – von Gesetzes wegen besteht kein Anspruch (nur Verzugszins, Art. 104 OR).' },
    { id: 'MA_betreibung',
      text: 'Nach unbenutztem Ablauf der Frist behalte ich mir vor, ohne weitere Mitteilung die Betreibung einzuleiten.',
      includeIf: { and: [{ feld: 'variante', eq: 'zahlung' }, { feld: 'betreibungAndrohen', eq: true }] },
      begruendung: 'Ankündigung des nächsten Vollstreckungsschritts (optional) – die Mahnung selbst ist keine Betreibung.' },

    // ── Variante Nachfrist (Art. 107 OR) ────────────────────────────────────
    { id: 'MA_nf_leistung',
      text: 'Aus {{vertragBezeichnung}} schulden Sie mir die folgende Leistung: {{leistungBeschrieb}}. Diese Leistung ist fällig{{nfSeitSatz}} und bis heute nicht erbracht.',
      includeIf: { feld: 'variante', eq: 'nachfrist' },
      begruendung: 'Bestimmte Bezeichnung der geschuldeten Leistung aus dem zweiseitigen Vertrag.' },
    { id: 'MA_nf_nachfrist',
      text: 'Ich mahne Sie hiermit (Art. 102 Abs. 1 OR) und setze Ihnen für die nachträgliche Erfüllung eine Nachfrist {{nachfristSatz}} seit Erhalt dieses Schreibens an (Art. 107 Abs. 1 OR).',
      includeIf: { feld: 'variante', eq: 'nachfrist' },
      norm: 'Art. 107 Abs. 1 OR',
      begruendung: 'Mahnung und Nachfristansetzung verbunden – Art. 107 setzt Verzug voraus; die Verbindung beider Erklärungen in einem Schreiben ist zulässig und praxisüblich.' },
    { id: 'MA_nf_wahlrechte',
      text: 'Nach unbenutztem Ablauf dieser Frist behalte ich mir vor, auf die nachträgliche Leistung zu verzichten und Ersatz des aus der Nichterfüllung entstandenen Schadens zu verlangen oder vom Vertrag zurückzutreten (Art. 107 Abs. 2 OR).',
      includeIf: { feld: 'variante', eq: 'nachfrist' },
      norm: 'Art. 107 Abs. 2 OR',
      begruendung: 'Ankündigung der Wahlrechte – Verzicht/Rücktritt verlangen nach Fristablauf eine unverzügliche Erklärung (in der UI offengelegt).' },

    kdgSchluss('MA_schluss'),
    maUnterschrift,
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────

const fristSatz = (tage: number): string =>
  tage === 1 ? 'innert 1 Tag' : `innert ${tage} Tagen`;

export function maZusammenstellen(a: MaAntworten) {
  const zinsAb = a.verfalltagVereinbart ? maZinsAbFolgetag(a.verfalltag) : null;
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    betragFmt: zahl(a.betrag) !== null ? fmtCHF(a.betrag) : a.betrag,
    mahngebuehrFmt: zahl(a.mahngebuehr) !== null ? fmtCHF(a.mahngebuehr) : a.mahngebuehr,
    faelligSeitSatz: istGueltigesISO(a.faelligSeit) ? `, fällig seit dem ${fmtDatum(a.faelligSeit)}` : '',
    // Nachfrist-Baustein sagt schon «ist fällig» – eigenes Fragment gegen die
    // Wort-Doppelung «fällig, fällig seit» (Bug-Check NIEDRIG-2, 11.6.2026).
    nfSeitSatz: istGueltigesISO(a.faelligSeit) ? ` (seit dem ${fmtDatum(a.faelligSeit)})` : '',
    verfalltagFmt: istGueltigesISO(a.verfalltag) ? fmtDatum(a.verfalltag) : '________',
    // Verfalltag: Zins seit dem Folgetag (Art. 102 Abs. 2 OR; gleiche Regel
    // wie lib/verzugszins.ts ersterZinstag) – sonst ohne Datumszusatz.
    zinsSeitSatz: zinsAb ? `, somit seit dem ${zinsAb}` : '',
    zahlungsfristSatz: fristSatz(a.zahlungsfristTage),
    nachfristSatz: `von ${fristSatz(a.nachfristTage).replace('innert ', '')}`,
    zahlungsverbindungSatz: a.zahlungsverbindung.trim() ? ` (${a.zahlungsverbindung.trim()})` : '',
  };
  return { ergebnis: assemble(MA_SCHEMA, antworten), zinsAb };
}

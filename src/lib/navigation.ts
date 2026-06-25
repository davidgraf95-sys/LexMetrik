// ─── Navigations-SSoT der App-Shell (Build-Plan App-Shell, Phase 2) ─────────
//
// EINE Quelle für die linke Seitenleiste (Sidebar.tsx) und das mobile
// Schubladen-Menü. REINES, typisiertes Datenmodul: kein JSX, KEINE Rechtslogik
// (CLAUDE.md §3) — nur die Navigations-Topologie.
//
// SSoT / «ableiten statt duplizieren» (Build-Plan Leitplanke 4): die Rechner-,
// Vorlagen- und Gesetze-Einträge werden NICHT hier hartcodiert, sondern aus der
// bestehenden Fachkonfiguration abgeleitet —
//   · Rechner  ← OBERKATEGORIEN (oberkategorien.ts) ohne «vorlagen»
//   · Vorlagen ← VORLAGE_SEKTIONEN (startseiteConfig.ts)
//   · Gesetze  ← GEBIETE (normtext/register.ts) für die Bund-Rechtsgebiete
// — sodass eine neue Kategorie/Sektion/ein neues Rechtsgebiet automatisch in
// der Seitenleiste erscheint und nichts an zwei Stellen gepflegt wird (§5).
//
// Nur die echten App-Texte (Start, Recherche) und die Meta-Ziele sind aus
// keiner Fachkonfiguration ableitbar und stehen darum literal.

import { OBERKATEGORIEN } from './oberkategorien';
import { KATALOG_KARTEN, VORLAGE_SEKTIONEN, istVerfuegbar } from './startseiteConfig';
import { kategorieFuer } from './oberkategorien';
import { istVorlage } from './vorlagenKategorie';
import { SYSTEMATIK } from './normtext/systematik';
import { GEBIETE } from './normtext/register';
import { KANTONE } from '../data/tarif/typen';

/** Blatt: ein Navigationsziel (Route, ggf. mit Query/Hash für eine Teilsicht). */
export interface NavLink {
  art: 'link';
  label: string;
  /** Voller Pfad inkl. ?query/#hash — wird unverändert an react-router <Link to> gegeben. */
  ziel: string;
}

/** Knoten mit Kindern: entweder ein Abschnitt mit Überschrift oder eine
 *  aufklappbare Untergruppe (<details>). */
export interface NavGruppe {
  art: 'gruppe';
  label: string;
  /** Optional: macht die Gruppen-Überschrift klickbar → Übersicht (z.B. Bund/
   *  Kantone → /gesetze?ebene=…); der Chevron klappt die Kinder weiterhin auf. */
  ziel?: string;
  /** true → als natives <details> rendern (aufklappbar, tastaturzugänglich). */
  aufklappbar?: boolean;
  /** Bei aufklappbar: Anfangszustand. Bund startet eingeklappt (Build-Plan). */
  standardOffen?: boolean;
  kinder: NavKnoten[];
}

export type NavKnoten = NavLink | NavGruppe;

/** Ein Abschnitt der Hauptnavigation; titel === null bei den kopflosen
 *  Top-Einträgen (Start/Recherche) über den ersten Gruppentitel. */
interface NavAbschnitt {
  titel: string | null;
  /** Optional: macht die Abschnitts-Überschrift selbst klickbar → Gesamtübersicht
   *  (Auftrag David 20.6.2026: Klick auf Rechner/Vorlagen/Gesetze öffnet die
   *  jeweilige Übersicht). */
  ziel?: string;
  kinder: NavKnoten[];
}

const link = (label: string, ziel: string): NavLink => ({ art: 'link', label, ziel });

// ─── Abgeleitete Einträge (SSoT) ────────────────────────────────────────────
//
// Die echten Werkzeuge (Engines/Vorlagen) hängen DIREKT unter ihrer Kategorie
// (Auftrag David 19.6.2026): jede Rechner-Oberkategorie und jede Vorlagen-Gruppe
// ist eine aufklappbare Untergruppe, deren Kinder die SOFORT verfügbaren Karten
// (mit eigener Seite) als Direktlinks sind — abgeleitet aus dem Katalog (§5),
// nicht zweitgepflegt. Klicktiefe 1 von der Seitenleiste ins Werkzeug.

const katVon = (k: typeof KATALOG_KARTEN[number]) => kategorieFuer(k) ?? 'vorlagen';

// Verfügbare Karten EINER Kategorie als Werkzeug-Direktlinks (Katalog-Reihenfolge).
const werkzeugeFuer = (pruefen: (k: typeof KATALOG_KARTEN[number]) => boolean): NavLink[] =>
  KATALOG_KARTEN.filter((k) => istVerfuegbar(k) && !!k.href && pruefen(k)).map((k) => link(k.title, k.href!));

const werkzeugGruppe = (label: string, kinder: NavLink[]): NavGruppe =>
  ({ art: 'gruppe', label, aufklappbar: true, standardOffen: false, kinder });

// Rechner: die drei Aufgaben-Oberkategorien ausser «Vorlagen» — je als
// aufklappbare Gruppe mit ihren Rechnern.
const RECHNER_KINDER: NavKnoten[] = OBERKATEGORIEN
  .filter((k) => k.id !== 'vorlagen')
  .map((kat) => werkzeugGruppe(kat.titel, werkzeugeFuer((k) => !istVorlage(k) && katVon(k) === kat.id)));

// Vorlagen: die fünf Dokument-Gruppen — je als aufklappbare Gruppe mit ihren
// Vorlagen (nach Dokument-Typ `art`).
const VORLAGEN_KINDER: NavKnoten[] = VORLAGE_SEKTIONEN
  .map((s) => werkzeugGruppe(s.title, werkzeugeFuer((k) => istVorlage(k) && k.art === s.art)));

// Gesetze: «Bund» nach der funktionalen Systematik (systematik.ts) UND «Kantone»
// nach Kanton — beide als gleichartige aufklappbare Untergruppen (Auftrag David
// 20.6.2026: Kantone gleich wie Bund, aufklappbar in die Kantone). Ziel = /gesetze
// mit ?ebene= (Tab-Vorwahl) und Kategorie-Anker «sys-<id>» bzw. ?kt=<KT> (Vorwahl).
const GESETZE_KINDER: NavKnoten[] = [
  {
    art: 'gruppe',
    label: 'Bund',
    ziel: '/gesetze?ebene=bund',
    aufklappbar: true,
    standardOffen: false,
    kinder: SYSTEMATIK.map((k) => link(k.titel, `/gesetze?ebene=bund#sys-${k.id}`)),
  },
  {
    art: 'gruppe',
    label: 'Kantone',
    ziel: '/gesetze?ebene=kanton',
    aufklappbar: true,
    standardOffen: false,
    kinder: KANTONE.map((kt) => link(kt, `/gesetze?ebene=kanton&kt=${kt}`)),
  },
  // International unter «Gesetze» subsumiert (Auftrag David 25.6.2026) — eigene
  // einklappbare Gruppe wie Bund/Kantone; Ziel = die /international-Übersichtsseite,
  // die Kinder springen zu deren Sach-Ankern.
  {
    art: 'gruppe',
    label: 'International',
    ziel: '/international',
    aufklappbar: true,
    standardOffen: false,
    kinder: [
      link('Menschenrechte', '/international#menschenrechte'),
      link('Int. Privat- & Zivilrecht', '/international#privat-zivil'),
      link('Rechtshilfe (Haager)', '/international#rechtshilfe'),
      link('Schweiz–EU & Datenschutz', '/international#eu-datenschutz'),
    ],
  },
];

// Rechtsprechung: gleichrangig zu «Gesetze». Die Sachgebiete (GEBIETE, dieselbe
// Sach-Achse wie die Gesetze → Verzahnung) liegen in EINER einklappbaren Gruppe
// «Nach Sachgebiet» — damit der Eintrag ein Dropdown ist wie Bund/Kantone unter
// Gesetze (Auftrag David 24.6.2026), standardmässig zu. Ziel je Sachgebiet:
// /rechtsprechung?rg=<gebiet> (Vorwahl, teilbar).
const RECHTSPRECHUNG_KINDER: NavKnoten[] = [
  {
    art: 'gruppe',
    label: 'Nach Sachgebiet',
    aufklappbar: true,
    standardOffen: false,
    // 'international' ist die Sach-Achse der Rubrik «International» (Staatsverträge),
    // nicht der Rechtsprechung — kein Entscheid trägt es. Aus der Rechtsprechungs-
    // Navigation ausgeblendet (sonst leerer Sachgebiets-Link, §8).
    kinder: GEBIETE.filter((g) => g.id !== 'international').map((g) => link(g.label, `/rechtsprechung?rg=${g.id}`)),
  },
];

// ─── Hauptnavigation ─────────────────────────────────────────────────────────

export const NAVIGATION: NavAbschnitt[] = [
  // «Recherche» bewusst entfernt (Auftrag David 19.6.2026): das Browsen läuft
  // über die Kategorie-Drilldowns (Fristen · Gebühren & Beträge · Vorlagen).
  { titel: null, kinder: [link('Start', '/')] },
  { titel: 'Rechner', ziel: '/rechner', kinder: RECHNER_KINDER },
  { titel: 'Vorlagen', ziel: '/vorlagen', kinder: VORLAGEN_KINDER },
  { titel: 'Gesetze', ziel: '/gesetze', kinder: GESETZE_KINDER },
  { titel: 'Rechtsprechung', ziel: '/rechtsprechung', kinder: RECHTSPRECHUNG_KINDER },
];

// Utility/Meta unten in der Seitenleiste — echte, indexierbare Routen.
export const NAVIGATION_META: NavLink[] = [
  link('Methodik', '/methodik'),
  link('Über', '/ueber'),
  link('Kontakt', '/kontakt'),
  link('Datenschutz', '/datenschutz'),
];

/** Alle Blatt-Ziele (flach) — für Tests/Abgleich (keine toten Links). */
export function alleNavLinks(knoten: NavKnoten[] = [
  ...NAVIGATION.flatMap((a) => a.kinder),
  ...NAVIGATION_META,
]): NavLink[] {
  return knoten.flatMap((k) => (k.art === 'link' ? [k] : alleNavLinks(k.kinder)));
}

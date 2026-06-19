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
import { GEBIETE } from './normtext/register';

/** Blatt: ein Navigationsziel (Route, ggf. mit Query/Hash für eine Teilsicht). */
export interface NavLink {
  art: 'link';
  label: string;
  /** Voller Pfad inkl. ?query/#hash — wird unverändert an react-router <Link to> gegeben. */
  ziel: string;
  /** Optional: Anzahl SOFORT verfügbarer Werkzeuge hinter dem Eintrag (aus dem
   *  Katalog abgeleitet, §5) — als dezenter Zähler in der Seitenleiste. */
  anzahl?: number;
}

/** Knoten mit Kindern: entweder ein Abschnitt mit Überschrift oder eine
 *  aufklappbare Untergruppe (<details>). */
export interface NavGruppe {
  art: 'gruppe';
  label: string;
  /** true → als natives <details> rendern (aufklappbar, tastaturzugänglich). */
  aufklappbar?: boolean;
  /** Bei aufklappbar: Anfangszustand. Bund startet eingeklappt (Build-Plan). */
  standardOffen?: boolean;
  /** Optional: Anzahl verfügbarer Werkzeuge hinter der Gruppe (dezenter Zähler). */
  anzahl?: number;
  kinder: NavKnoten[];
}

export type NavKnoten = NavLink | NavGruppe;

/** Ein Abschnitt der Hauptnavigation; titel === null bei den kopflosen
 *  Top-Einträgen (Start/Recherche) über den ersten Gruppentitel. */
export interface NavAbschnitt {
  titel: string | null;
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
  ({ art: 'gruppe', label, aufklappbar: true, standardOffen: false, anzahl: kinder.length, kinder });

// Rechner: die drei Aufgaben-Oberkategorien ausser «Vorlagen» — je als
// aufklappbare Gruppe mit ihren Rechnern.
const RECHNER_KINDER: NavKnoten[] = OBERKATEGORIEN
  .filter((k) => k.id !== 'vorlagen')
  .map((kat) => werkzeugGruppe(kat.titel, werkzeugeFuer((k) => !istVorlage(k) && katVon(k) === kat.id)));

// Vorlagen: die fünf Dokument-Gruppen — je als aufklappbare Gruppe mit ihren
// Vorlagen (nach Dokument-Typ `art`).
const VORLAGEN_KINDER: NavKnoten[] = VORLAGE_SEKTIONEN
  .map((s) => werkzeugGruppe(s.title, werkzeugeFuer((k) => istVorlage(k) && k.art === s.art)));

// Gesetze: «Bund» als aufklappbare Untergruppe nach Rechtsgebiet (eingeklappt),
// darunter «Kantone». Ziel = /gesetze mit ?ebene= (Tab-Vorwahl) und Gebiets-
// Anker «g-<id>» — beides initialisiert die Gesetze-Seite in Phase 3.
const GESETZE_KINDER: NavKnoten[] = [
  {
    art: 'gruppe',
    label: 'Bund',
    aufklappbar: true,
    standardOffen: false,
    kinder: GEBIETE.map((g) => link(g.label, `/gesetze?ebene=bund#g-${g.id}`)),
  },
  link('Kantone', '/gesetze?ebene=kanton'),
];

// ─── Hauptnavigation ─────────────────────────────────────────────────────────

export const NAVIGATION: NavAbschnitt[] = [
  // «Recherche» bewusst entfernt (Auftrag David 19.6.2026): das Browsen läuft
  // über die Kategorie-Drilldowns (Fristen · Gebühren & Beträge · Vorlagen).
  { titel: null, kinder: [link('Start', '/')] },
  { titel: 'Rechner', kinder: RECHNER_KINDER },
  { titel: 'Vorlagen', kinder: VORLAGEN_KINDER },
  { titel: 'Gesetze', kinder: GESETZE_KINDER },
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

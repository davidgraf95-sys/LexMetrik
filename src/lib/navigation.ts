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
import { VORLAGE_SEKTIONEN } from './startseiteConfig';
import { GEBIETE } from './normtext/register';

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
  /** true → als natives <details> rendern (aufklappbar, tastaturzugänglich). */
  aufklappbar?: boolean;
  /** Bei aufklappbar: Anfangszustand. Bund startet eingeklappt (Build-Plan). */
  standardOffen?: boolean;
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

// Rechner: die drei Aufgaben-Oberkategorien ausser «Vorlagen» (das ist eine
// eigene Sidebar-Gruppe). Ziel = der bestehende teilbare Katalog-Zustand
// «/?kategorie=<id>» (Katalog.tsx liest ?kategorie=).
const RECHNER_KINDER: NavKnoten[] = OBERKATEGORIEN
  .filter((k) => k.id !== 'vorlagen')
  .map((k) => link(k.titel, `/?kategorie=${k.id}`));

// Vorlagen: die fünf Dokument-Gruppen. Ziel = Vorlagen-Kategorie mit Anker auf
// die jeweilige Gruppe (Katalog rendert die Gruppen unter ?kategorie=vorlagen;
// die Anker «vorlage-<id>» setzt das Vorlagen-Register in Phase 3).
const VORLAGEN_KINDER: NavKnoten[] = VORLAGE_SEKTIONEN
  .map((s) => link(s.title, `/?kategorie=vorlagen#vorlage-${s.id}`));

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
  { titel: null, kinder: [link('Start', '/'), link('Recherche', '/recherche')] },
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

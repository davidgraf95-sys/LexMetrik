import type { ReactNode } from 'react';

// ─── TrefferZeile: EINE Treffer-/Werkzeug-Zeile (C-4, 31.8.2026) ─────────────
//
// W2·19-DESIGN-KONSISTENZ · Runde 2, Paket C. Befund C-4 der Finder-Welle: die
// Anwendung zeigte dieselbe Inhaltsklasse — «anklickbare Zeile mit Titel,
// zweiter Zeile, Marke und Pfeil» — in zwei Bauformen:
//   · `components/Katalog.tsx::ListenZeile`      (Rechner-/Vorlagen-Register)
//   · `components/suche/SuchResultate.tsx::ZeileInhalt` (Such-Panel + /suche)
// Beide sind auf DIESEN Baustein gezogen; die Kopien sind gelöscht, nicht
// angeglichen (§5/§10). Der BEHÄLTER bleibt je Fläche (Karte vs. Streifen,
// `<Link>`/`<li>`/`<div>`) — er trägt nur die gemeinsame Flex-Geometrie
// `TREFFER_ZEILE_RAHMEN`, damit der Gruppen-Hover an EINEM Namen hängt.
//
// Aufgelöste Divergenzen (Kanon-Wahl je Fall, FAHRPLAN §1: Reglement, sonst die
// verbreitetere Form):
//   Untertitel  `text-xs` (Katalog) vs. `text-body-s` (Suche) → **body-s**. Die
//               zweite Zeile trägt an beiden Orten Lesbares (Fristen-WARUM-Satz,
//               Such-Snippet); 12 px ist die Etiketten-, nicht die Satzgrösse
//               (Typo-Skala, `tailwind.config.js`).
//   Kappung     `truncate` (Katalog-Sub) vs. `line-clamp-2` (Suche) →
//               **line-clamp-2**: ein abgeschnittenes Sub-Label verliert
//               Information, zwei Zeilen nicht (§8). Der Katalog-Schalter
//               `subWrap` ist damit ersatzlos entfallen (Rückbau).
//   Pfeil       statisch `text-brass-700` (Katalog, auch FristenHauptKarte und
//               die «Öffnen →»-Zeilen) vs. `ink-300 → brass-500` mit
//               `translate-x-0.5` (Suche) → **brass-700 statisch**. Dieselbe
//               Entscheidung wie C-3 an der Karte: der Hover läuft über die
//               Fläche/Farbstufe, nicht über eine zweite Motion-Grammatik (F8).
//   Titel-Hover nur Suche hatte einen → **behalten** und auf beide gezogen
//               (`group-hover/treffer:text-brass-800`).
//
// Bewusst NICHT vereinheitlicht (declared, mit Grund): die Titel-Kappung. Im
// Such-Panel ist die Zeile ein STREIFEN fester Höhe — die Kappung ab `sm` hält
// die Panel-Höhe stabil (§15.2/CLS, Herleitung in `SuchResultate.tsx`); in den
// Katalog-Karten darf der Titel umbrechen, weil eine gekappte Werkzeug-
// Bezeichnung Information verlöre (§8). Dafür trägt der Baustein `streifen`.
//
// Reine Darstellung (§3): keine Logik, keine Datenkenntnis.

/** Flex-Geometrie + Gruppen-Name der Zeile. Der Behälter je Fläche komponiert
 *  seine eigene Optik (Karte/Streifen) DARÜBER — der Gruppen-Name muss der
 *  gleiche sein, sonst greift der Titel-Hover nicht. */
export const TREFFER_ZEILE_RAHMEN = 'group/treffer flex items-center gap-3 min-w-0';

export function TrefferZeile({ titel, untertitel, meta, marke, pfeil = '→', streifen }: {
  titel: ReactNode;
  /** Zweite Zeile (Sub-Label, Rechtsgebiet, Snippet) — höchstens zwei Zeilen. */
  untertitel?: ReactNode;
  /** A3-3 (R3-β, 31.8.2026) · dritte Zeile: die HERKUNFT des Treffers (Gericht/
   *  Kanton · Datum · Aktenzeichen). Additiv aufgenommen für die Live-Suche
   *  (entscheidsuche.ch), deren Zeile diese Angaben führt — ein Entscheid ohne
   *  seine Fundstelle ist keine Fundstelle (§8). Der Slot bringt seine Anatomie
   *  mit (Micro-Grad, umbrechende Reihe), damit sie nicht wieder je Fläche
   *  entsteht; der Aufrufer gibt nur die Glieder. */
  meta?: ReactNode;
  /** Badges/Status-Marken vor dem Pfeil (0…n). */
  marke?: ReactNode;
  /** `↵` = «Enter springt» (Norm-Sprung der Suche); `↗` = führt aus der App
   *  hinaus (amtliche Fremdquelle, dieselbe Glyphe wie an den Quell-Links);
   *  `null` = nicht anklickbar. */
  /*  D9 (David 6.9.2026, «kein →»): `false` = die Zeile IST anklickbar, trägt
   *  aber kein Pfeil-Zeichen. Im Such-Panel war der Pfeil an jeder einzelnen
   *  Zeile das «Pfeil-Muster», das David gerügt hat — die Klickbarkeit sagt
   *  dort die Hover-Fläche und die Listbox-Semantik. `null` bleibt, was es war:
   *  gar nicht anklickbar (dann fällt auch das Hover-Signal weg). */
  pfeil?: '→' | '↵' | '↗' | null | false;
  /** Zeile in einem Streifen fester Höhe (Such-Panel): Titel ab `sm` gekappt. */
  streifen?: boolean;
}) {
  // Kein Hover-Signal an einer Zeile, die gar nicht klickbar ist (`pfeil={null}`,
  // z. B. eine geplante Katalog-Karte): dort lässt auch die zentrale
  // `.lc-card`-Regel den Rahmen in Ruhe, weil das Element kein `<a>`/`<button>`
  // ist. Ein tintender Titel wäre dann ein Versprechen ohne Ziel.
  const klickbar = pfeil !== null;
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className={`block text-body-s font-medium leading-snug text-ink-900${
          klickbar ? ' transition-colors group-hover/treffer:text-brass-800' : ''}${
          streifen ? ' max-sm:line-clamp-2 sm:truncate' : ''}`}>{titel}</span>
        {untertitel !== undefined && untertitel !== null && untertitel !== '' && (
          <span className="block line-clamp-2 text-body-s leading-snug text-ink-500">{untertitel}</span>
        )}
        {meta && (
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-micro text-ink-500">{meta}</span>
        )}
      </span>
      {marke && <span className="flex items-center gap-2 shrink-0">{marke}</span>}
      {pfeil && <span aria-hidden className="shrink-0 leading-none text-brass-700">{pfeil}</span>}
    </>
  );
}

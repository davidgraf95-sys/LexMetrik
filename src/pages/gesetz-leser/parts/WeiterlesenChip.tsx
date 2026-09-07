import { SchwebeMeldung } from '../../../components/ui/SchwebeMeldung';

// ─── W2·10-UI-NAV/R4 · «Weiterlesen bei Art. X» ───────────────────────────────
//
// Fahrplan R4: «beim erneuten Öffnen KEIN Auto-Sprung, sondern ein unaufdringlicher
// Chip». Der Verzicht auf den Auto-Sprung ist die eigentliche Regel und keine
// Bequemlichkeit: wer eine Gesetzes-URL öffnet, erwartet den Anfang des Erlasses
// (oder den angesteuerten Anker) — würde die App ungefragt in die Mitte springen,
// wäre die Adresse nicht mehr das, was sie anzeigt (§8-Erwartbarkeit). Angeboten
// wird, gesprungen wird erst auf Klick.
//
// LM-202: die Adresse ändert sich NIE durchs Scrollen. Dieser Chip scrollt auch
// nicht — er ruft auf Klick denselben `springeZuArtikel` wie Quickjump und
// Trefferliste (§5, EIN Sprung-Mechanismus). Dass DER einen `#art-`-Permalink per
// `replaceState` setzt, ist der bestehende, für AUSDRÜCKLICHE Sprünge geltende
// Entscheid — der Chip führt keine zweite Regel ein.
//
// Reiner Renderer (§3): kennt weder Speicher noch Spy, bekommt Label + zwei
// Rückrufe. Rendert im Ruhezustand gar nicht (der Aufrufer rendert ihn nur mit
// Ziel) ⇒ prerendertes Markup unberührt, golden byte-gleich.
//
// §15/CLS 0: `position: fixed` — der Chip liegt AUSSERHALB des Layoutflusses und
// kann nichts verschieben. Das ist hier nicht Vorsicht, sondern Notwendigkeit:
// der Inhalt kommt aus localStorage und existiert im Prerender nicht, ein Chip im
// Fluss würde also auf jeder prerenderten Erlass-Seite nach der Hydration in den
// Kopf einwachsen und alles darunter schieben (dieselbe Fehlerklasse wie die in
// `inhalt.tsx` gepinnten Currency-Chips).
//
// PLATZWAHL oben statt unten: der R5-Rücksprung-Chip (#431) belegt `bottom-4`
// mittig. Beide sind `fixed` — stünden sie am selben Rand, überlagerten sie sich,
// sobald jemand gleich nach dem Wiedereinstieg im Gliederungsbaum springt. Oben
// ist zugleich die richtige Stelle: das Angebot gehört an den Erlass-Kopf, wo der
// Wiedereinstieg stattfindet. Der Abstand von oben kommt aus `--nt-stick` — der
// EINEN Quelle der realen Sticky-Höhe (N0c, gesetzt in `inhalt.tsx`, im Pane
// kleiner) — statt aus einer Magic-Number (§13/D2).
//
// F2-5 (31.8.2026): Streifen, Offset, Pillen-Optik und die aria-live-Zusage
// kommen aus `components/ui/SchwebeMeldung` — dieselbe Geometrie trugen der
// R5-Chip und der Reiter-Toast des V3-Rahmens, letzterer mit geratenem Offset
// (`top-20` statt `--nt-stick`) und darum @390 über den Kopf-Griffen. Was hier
// bleibt, ist der Inhalt: zwei Knöpfe, zwei Wirkungen.

export function WeiterlesenChip({ label, onWeiterlesen, onVerwerfen }: {
  /** Anzeige-Label des gemerkten Artikels, wörtlich wie im Reader («Art. 335c»). */
  label: string;
  /** Klick auf das Angebot: zum Artikel springen. */
  onWeiterlesen: () => void;
  /** Klick auf ✕: Angebot verwerfen UND vergessen (nicht wieder anbieten). */
  onVerwerfen: () => void;
}) {
  return (
    // Ohne `rolle`: der Chip ist ein ANGEBOT, keine Vollzugsmeldung — er meldet
    // `aria-live="polite"` (sonst erführe ein Screenreader nie von ihm) und
    // trägt bewusst weder `role="alert"` noch `role="status"`.
    <SchwebeMeldung kante="oben" ausrichtung="rechts" daten="data-weiterlesen" inhaltKlassen="gap-1">
      <>
        <button type="button" onClick={onWeiterlesen}
          // min-h-11 = 44 px Tap-Ziel (WCAG 2.5.8 / R6-Mass) — auch auf dem Daumen
          // treffbar. `truncate` + `min-w-0` halten auch ein langes Bereichs-Label
          // («Art. 31–32») einzeilig; eine arbitrary max-w wäre ein Nicht-Token
          // (R2-Linien-/Typo-Kanon, §13/D2).
          className="lc-btn-outline lc-btn-sm inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-l-full rounded-r-none border-r-0 px-4">
          <span aria-hidden>↩</span>
          <span className="truncate">Weiterlesen bei {label}</span>
        </button>
        <button type="button" onClick={onVerwerfen}
          // Eigener Knopf statt eines ✕ IM Angebot: sonst läge ein Klickziel in
          // einem anderen, und ein Fehlgriff löste den ungewollten Sprung aus.
          // Das aria-label sagt die Wirkung, nicht das Zeichen.
          aria-label="Weiterlesen-Angebot verwerfen"
          className="lc-btn-outline lc-btn-sm inline-flex min-h-11 min-w-11 items-center justify-center rounded-l-none rounded-r-full border-l-0 px-2">
          <span aria-hidden>✕</span>
        </button>
      </>
    </SchwebeMeldung>
  );
}

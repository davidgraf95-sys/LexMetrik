import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { RichterZaehler } from '../../lib/rechtsprechung/browse';
import { SICHTBAR_MAX, trefferFuer, naechsterSlug, vorigerSlug } from './richterAuswahl';

// ─── Richter-/Spruchkörper-Facette der Übersicht /rechtsprechung ─────────────
//
// WARUM Autocomplete statt Chip-Leiste (wie Gemeinwesen/Instanz/Sprache): die
// anderen Achsen haben eine Handvoll Werte, diese hat ~180 Richter:innen im
// Korpus (Tendenz steigend mit jedem Kanton). Eine Chip-Leiste wäre weder
// scanbar noch DOM-verträglich (§15) — hier führt Eintippen zum Ziel.
//
// Reine Darstellung (§3): Filtern/Zählen liegt in lib/rechtsprechung/browse.ts
// (filterEntscheide/richterHaeufigkeit); diese Datei hält nur Eingabe, Auswahl-
// Navigation und ARIA.

export function RichterFilter({ aktiv, aktivName, registerGeladen, optionen, onWaehle }: {
  /** Gewählter Slug (?richter=) oder null. */
  aktiv: string | null;
  /** Anzeigename des gewählten Slugs — null, solange das Register noch lädt. */
  aktivName: string | null;
  /**
   * Ist das Richter-Register da? Trennt «lädt noch» von «Slug gibt es nicht».
   *
   * Ohne diese Unterscheidung wurde ein unbekannter Slug aus einem veralteten oder
   * vertippten Link (`?richter=gibts-nicht-xyz`) als regulärer Aktiv-Chip mit
   * «0 Entscheide» gerendert — der Nutzer las das als Aussage ÜBER DIE PERSON
   * statt als kaputten Link (Befund Gegenprüfung 20.7.2026). Da die Achse
   * ausdrücklich als teilbar gebaut ist, ist das kein Randfall.
   */
  registerGeladen: boolean;
  /** Cross-gefilterte Optionen (count > 0), absteigend nach Trefferzahl (R15). */
  optionen: RichterZaehler[];
  onWaehle: (slug: string | null) => void;
}) {
  const [q, setQ] = useState('');
  const [offen, setOffen] = useState(false);
  const [aktivKey, setAktivKey] = useState<string | null>(null);
  const feld = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const treffer = useMemo(() => trefferFuer(optionen, q), [optionen, q]);
  const sichtbar = treffer.slice(0, SICHTBAR_MAX);
  const weitere = treffer.length - sichtbar.length;
  // Nur öffnen, wenn es etwas zu zeigen gibt ODER die Eingabe ins Leere lief —
  // der Leerzustand ist eine ehrliche Meldung, kein Fehler (§13/C2, F4).
  const zeigtListe = offen && (sichtbar.length > 0 || q.trim() !== '');
  // ARIA folgt der LISTBOX, nicht dem Kasten: im Leerzustand steht zwar eine
  // Meldung im Panel, aber es gibt kein <ul id={listboxId}>. `aria-expanded=true`
  // + `aria-controls` auf eine nicht existierende Id ist ein CRITICAL-Verstoss
  // (axe `aria-valid-attr-value`, empirisch 20.7.2026) — der Screenreader sucht
  // eine Liste, die es nicht gibt. Die Meldung wird stattdessen als role="status"
  // angesagt, was ihr auch inhaltlich entspricht.
  const hatListbox = zeigtListe && sichtbar.length > 0;
  const optId = (slug: string) => `${listboxId}-${slug}`;
  const aktivId = aktivKey && sichtbar.some((o) => o.slug === aktivKey) ? optId(aktivKey) : undefined;

  // Bei kurzen Viewports (gemessen 390×640: Unterkante 785 bei 640 sichtbar, also
  // 145 px abgeschnitten = 3 Optionen + der Kappungs-Hinweis unsichtbar) lag die
  // aufgeklappte Liste unter dem Fold, ohne dass irgendetwas nachführte. Statt
  // eines Scroll-Containers (der ohne Tastatur-Fokus ein axe-`scrollable-region-
  // focusable`-Verstoss wäre und zusätzlich eine scrollIntoView-Kopplung an die
  // Pfeil-Auswahl bräuchte) holt der Browser das Panel in den sichtbaren Bereich.
  // `block: 'nearest'` scrollt nur, wenn es nötig ist — auf normalen Viewports
  // passiert dadurch nichts.
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (zeigtListe) panel.current?.scrollIntoView({ block: 'nearest' });
  }, [zeigtListe, sichtbar.length]);

  const waehle = (slug: string) => {
    onWaehle(slug);
    setQ('');
    setOffen(false);
    setAktivKey(null);
  };

  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && sichtbar.length > 0) {
      e.preventDefault();
      setOffen(true);
      setAktivKey((k) => naechsterSlug(sichtbar, k));
    } else if (e.key === 'ArrowUp' && sichtbar.length > 0) {
      e.preventDefault();
      setOffen(true);
      setAktivKey((k) => vorigerSlug(sichtbar, k));
    } else if (e.key === 'Enter') {
      // Ohne Pfeil-Auswahl den obersten Treffer nehmen (häufigste Person zuerst).
      const ziel = sichtbar.find((o) => o.slug === aktivKey) ?? sichtbar[0];
      if (ziel) { e.preventDefault(); waehle(ziel.slug); }
    } else if (e.key === 'Escape') {
      setOffen(false);
      setAktivKey(null);
    }
  };

  return (
    <div role="group" aria-label="Spruchkörper" className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span aria-hidden className="lc-overline shrink-0">Richter:in</span>

      <div className="relative min-w-[11rem] flex-1 sm:max-w-[18rem]">
        <input
          ref={feld}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOffen(true); setAktivKey(null); }}
          onFocus={() => setOffen(true)}
          onBlur={() => setOffen(false)}
          onKeyDown={aufTaste}
          placeholder="Name eingeben …"
          aria-label="Nach Richter:in filtern"
          autoComplete="off"
          role="combobox"
          aria-expanded={hatListbox}
          aria-controls={hatListbox ? listboxId : undefined}
          aria-activedescendant={aktivId}
          aria-autocomplete="list"
          className="lc-input lc-input-sm w-full"
        />
        {zeigtListe && (
          <div ref={panel} className="lc-panel absolute left-0 right-0 top-full z-30 mt-1 shadow-md">
            {sichtbar.length === 0 ? (
              // Leerzustand (F4): ehrliche Auskunft, keine Fehler-Optik — der
              // Name kommt schlicht im aktuellen Filterausschnitt nicht vor.
              // §8: der Zusatz ist keine Floskel, sondern die Erklärung des
              // häufigsten Fehlschlags — die Bundesgerichts-Rubra nennen keine
              // Vornamen, gut die Hälfte der Einträge ist reiner Nachname.
              <p role="status" className="px-3 py-2 text-body-s text-ink-600">
                Kein Treffer im aktuellen Ausschnitt. Der Spruchkörper ist teilweise
                nur mit Nachnamen erfasst — dann den Nachnamen allein eingeben.
              </p>
            ) : (
              <>
                <ul role="listbox" id={listboxId} aria-label="Richter:innen">
                  {sichtbar.map((o) => (
                    <li
                      key={o.slug}
                      id={optId(o.slug)}
                      role="option"
                      aria-selected={o.slug === aktivKey}
                      // mousedown statt click: der Blur des Feldes würde die Liste
                      // sonst schliessen, bevor der Klick ankommt.
                      onMouseDown={(e) => { e.preventDefault(); waehle(o.slug); }}
                      className={`flex cursor-pointer items-baseline justify-between gap-3 px-3 py-1.5 text-body-s ${
                        o.slug === aktivKey ? 'bg-brass-100 text-brass-800' : 'text-ink-700'}`}
                    >
                      <span className="truncate">{o.name}</span>
                      <span className="num shrink-0 text-xs text-ink-600">{o.count}</span>
                    </li>
                  ))}
                </ul>
                {weitere > 0 && (
                  // §8: die gekappte Liste sagt, wie viel sie verschweigt.
                  <p className="border-t border-line px-3 py-1.5 text-xs text-ink-600">
                    <span className="num">{weitere}</span> weitere — Namen eintippen zum Eingrenzen.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {aktiv && (
        <>
          <button
            type="button"
            onClick={() => { onWaehle(null); feld.current?.focus(); }}
            className="lc-chip inline-flex items-center gap-1 border-brass-400 text-brass-700"
            // §8: solange das Register lädt, steht der Slug da — nie ein geratener Name.
            aria-label={`Richter-Filter «${aktivName ?? aktiv}» entfernen`}
            title="Filter entfernen"
          >
            {aktivName ?? aktiv}<span aria-hidden>×</span>
          </button>
          {registerGeladen && !aktivName && (
            // §8: unbekannter Slug ist ein kaputter Link, keine Aussage über eine
            // Person. «0 Entscheide» allein wäre irreführend.
            <span role="status" className="text-body-s text-ink-600">
              Diese Kennung ist im Register nicht bekannt — der Link ist vermutlich
              veraltet oder vertippt.
            </span>
          )}
        </>
      )}
    </div>
  );
}

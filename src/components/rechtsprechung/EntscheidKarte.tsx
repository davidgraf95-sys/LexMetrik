import { Link } from 'react-router-dom';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { themaText, istSynth, istBetreff, istBge, hauptIdentitaet } from '../../lib/rechtsprechung/browse';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { NormChip } from './NormChip';
import { datumAnzeige, DATUM_UNBEKANNT_TITEL, spracheBadgeTitel } from './format';
import { StatusBadge } from '../verzahnung/StatusBadge';

// Karte eines Entscheids (Dichte 'karten'). Hierarchie-Umkehr ggü. der alten
// Karte: das THEMA führt (Scent), das Aktenzeichen wandert in die gedämpfte
// Metazeile — 0/75 haben eine BGE-Referenz, die Nummer trägt also keinen Scent.
// Fehlt die amtliche Regeste, zeigt die Karte die deterministische Synth-Zeile
// (font-sans + Marker, NICHT Serifen-Regeste-Optik → §8 ehrlich). Reine
// Darstellung (§3); Norm-Chips sind span[role=button] (NormChip) — WEDER <a>
// NOCH <button>, weil beides als «interactive content» im Karten-<a> ungültiges
// Inhaltsmodell wäre (Begründung dort). Die Chip-Grammatik macht die Aktions-
// Form darum an der ROLLE fest, nicht am Tag (LM-044/N1, index.css).

export function EntscheidKarte({ e, onNorm }: {
  e: BrowseEntscheid;
  onNorm: (k: string) => void;
}) {
  const leit = e.leitcharakter === 'leitentscheid';
  const synth = istSynth(e);
  // Amtlicher Betreff (BS-Portal-Titel) ≠ Regeste: eigene, ehrliche Optik + Marker
  // (§8, Block-B-Kontrakt) — nie die Serifen-Regeste-Optik vortäuschen.
  const betreff = istBetreff(e);
  // Verweis-Eintrag: das vollständige Urteil zu einem BGE → Deep-Link in die Voll-Ansicht.
  const verweis = e.verweis ?? null;
  const ziel = verweis
    ? `/rechtsprechung/${encodeURIComponent(verweis.zielKey)}?ansicht=voll`
    : `/rechtsprechung/${encodeURIComponent(e.key)}`;
  // `data-aktiv`: die Hover-Grammatik der Karten liegt seit C-3 (31.8.2026) als
  // EINE Regel in `index.css` und greift am ELEMENT (`a`/`button`). Diese Karte
  // ist klickbar, aber ein <div> — der Stretched-Link liegt innen, damit die
  // Norm-Chips seine Geschwister bleiben. Das Attribut ist die eine erklärte
  // Ausnahme, kein zweiter Hover-Weg.
  return (
    <div data-aktiv className="lc-card group flex h-full flex-col p-4">
      {/* Lese-Bereich (klickbar). flex-1 schiebt den Fuss auf gleiche Höhe.
          Stretched-Link: der Link deckt die ganze Lesefläche per ::after ab, die
          Norm-Chips liegen als GESCHWISTER darüber (relative) — so ist der
          interaktive Chip kein fokussierbarer Nachkomme des <a> (valides Markup),
          die ganze Fläche bleibt aber klickbar. */}
      <div className="relative flex flex-1 flex-col">
      <Link to={ziel} className="block no-underline after:absolute after:inset-0 after:content-['']">
        {/* Statuszeile: Gebiet + Leit-Marker links, Status rechts. */}
        <div className="flex items-center justify-between gap-2 text-micro">
          <span className="flex items-center gap-2">
            {verweis
              ? <span className="lc-badge lc-badge-soft">Vollständiges Urteil</span>
              : leit && <span className="lc-badge lc-badge-ok">Leitentscheid</span>}
            <span className="lc-overline text-brass-700" title={e.kuratierung === 'maschinell' ? 'Sachgebiet maschinell zugeordnet' : undefined}>{GEBIET_LABEL[e.sachgebiet]}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {synth && <span className="text-ink-500 italic">ohne amtl. Regeste</span>}
            {betreff && (
              <span className="text-ink-500 italic"
                title="Betreff/Titel aus dem amtlichen Portal — keine Regeste">amtl. Betreff</span>
            )}
            {e.kuratierung === 'maschinell' && <StatusBadge praedikat="maschinell" />}
          </span>
        </div>

        {/* LM-036 (B11-Karten, 4.9.2026) · `min-h-[2lh]` am Thema-Absatz.
            Der Titel ist auf zwei Zeilen begrenzt (`line-clamp-2`), FÜLLT sie
            aber nicht immer — die Normchip-Zeile darunter sass in Nachbarkarten
            verschieden hoch, während der Kartenfuss fluchtete («unten
            ausgerichtet, in der Mitte nicht»). Gemessen auf Prod (1440 px,
            Dichte «Karten», 339 Karten / 118 Reihen): 37 Reihen mit versetzter
            Chip-Zeile, bis 25 px. Der Absatz reserviert jetzt seine zwei Zeilen
            (`2lh` = zwei eigene Zeilenhöhen, gilt für alle vier Thema-Varianten
            ohne Zahlenwert, §13/B2), womit die Chip-Zeile bei gleicher Variante
            IMMER auf derselben Höhe steht: nachgemessen 1 Reihe / 11 px, und
            diese eine mischt Serifen-Regeste (body-l) mit Sans-Synth (body-s)
            — verschiedene Zeilenhöhen, kein Ausrichtungsfehler.
            Verworfen wurde die naheliegende Alternative «Chip-Zeile per
            `mt-auto` an den Fuss des Lesebereichs»: gemessen nur 37 → 28
            Reihen, weil sie den Versatz bloss von der Titel- auf die
            Fusszeilen-Höhe verlagert (28 Reihen mit ungleich hohem Fuss).
            Preis der gewählten Lösung: die Liste wächst 34'059 → 35'594 px
            (+4,5 %) — Reihen aus lauter Einzeilern reservieren die zweite
            Zeile mit. Die Kartenhöhe je Reihe bleibt vom Raster bestimmt
            (A3-Abnahme, FAHRPLAN-ARCHIV-RESTPUNKTE §20, nicht gekippt). */}
        {/* THEMA — Leitelement. Verweis: klarer Bezug zum BGE; sonst echte Regeste in
            Serif (Lesebild), Synth in Sans. */}
        {verweis
          ? <p className="mt-2 text-body-s text-ink-700 leading-snug line-clamp-2 min-h-[2lh]">Vollständiges Urteil zu <span className="num">BGE {verweis.bgeReferenz}</span></p>
          : synth
            ? <p className="mt-2 text-body-s text-ink-700 leading-snug line-clamp-2 min-h-[2lh]">{themaText(e)}</p>
            : betreff
              /* Amtlicher Betreff: verbindlicher Text (font-medium, ink-900), aber
                 Sans statt der Serifen-Regeste-Optik — ehrlich unterscheidbar (§8). */
              ? <p className="mt-2 text-body-s font-medium text-ink-900 leading-snug line-clamp-2 min-h-[2lh]">{themaText(e)}</p>
              : <p className="mt-2 font-serif text-body-l text-ink-900 leading-snug line-clamp-2 min-h-[2lh]">{themaText(e)}</p>}

      </Link>

      {/* Norm-Zeile — führend (nicht am Fuss): zweite Navigationsachse.
          Geschwister des Links (nicht Nachfahre), relativ über dem Stretch-::after.
          lc-chip-zeile (LM-044/N1): die Norm-Chips sind span[role=button] — die
          Grammatik macht die Aktions-Form an der ROLLE fest, damit sie gleich
          aussehen wie die Facetten-<button> der Filterleiste (§23). */}
      {e.normKeys.length > 0 && (
        <div className="lc-chip-zeile lc-normzeile relative mt-3 flex flex-wrap items-center gap-1.5">
          {e.normKeys.slice(0, 4).map((k) => <NormChip key={k} normKey={k} onWaehle={onNorm} />)}
          {/* LM-049: der Überlaufhinweis ist ein ZÄHLER, kein Bedienelement — die
              nackte «+2» war neben den gerahmten Chips nicht als Text erkennbar.
              «+2 weitere» benennt sich selbst (Muster wie RichterFilter) und
              bekommt bewusst KEINEN Rahmen, kein role/tabindex: was nicht
              klickbar ist, sieht auch nicht klickbar aus (§8). */}
          {e.normKeys.length > 4 && (
            <span className="text-micro text-ink-500">
              <span className="num">+{e.normKeys.length - 4}</span> weitere
            </span>
          )}
        </div>
      )}
      </div>

      <div className="scale-rule-sm mt-3" aria-hidden />

      {/* Metazeile (gedämpft) + amtliche Fassung. */}
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-500">
          {/* Identität führend: amtliche BGE-Zitierung (erkannt/zitierbar) hervorgehoben,
              sonst das Aktenzeichen gedämpft. */}
          <span className={`num ${istBge(e) ? 'font-medium text-brass-700' : 'text-ink-500'}`}>{hauptIdentitaet(e)}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span>{e.gerichtName}</span>
          <span className="text-ink-300" aria-hidden>·</span>
          <span className="num" title={e.datumUnbekannt ? DATUM_UNBEKANNT_TITEL : undefined}>
            {datumAnzeige(e.datum, e.datumUnbekannt)}
          </span>
          {/* LM-105: EIN Zitat je Karte. Bei BGE-Einträgen IST `nummer` die
              BGE-Referenz — die «Aktenzeichen»-Klammer wiederholte damit nur
              die Zeile links davon. Sie erscheint jetzt genau dann, wenn sie
              etwas Neues sagt: ein vom BGE abweichendes Aktenzeichen (heute
              0/1259, aber die Daten dürfen es tragen). */}
          {istBge(e) && e.nummer !== e.bgeReferenz && (
            <span className="num text-ink-500" title="Aktenzeichen">({e.nummer})</span>
          )}
          {e.sprache !== 'de' && <span className="lc-badge lc-badge-soft" title={spracheBadgeTitel(e.sprache)}>{e.sprache}</span>}
        </div>
        <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer"
          className="shrink-0 text-xs text-ink-500 no-underline hover:text-brass-700"
          title="Amtliche Fassung beim Gericht öffnen">
          ↗ amtlich
        </a>
      </div>
    </div>
  );
}

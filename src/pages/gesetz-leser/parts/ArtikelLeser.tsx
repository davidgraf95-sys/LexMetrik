import { useState, memo } from 'react';
import { ArtikelBody, FnRef } from '../../../components/normtext/ArtikelBody';
import { WJ } from '../../../components/normtext/wortverbinder';
import { type InternRefs } from '../../../components/NormText';
import { trenneAenderungshistorie, labelMitBereich, artikelGanzAufgehoben } from '../../../lib/normtext/darstellung';
import type { Fussnote } from '../../../lib/normtext/browse';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../../../lib/fedlex';
import { NormChip } from '../../../components/vorlagen/NormChip';
import { KantenChip } from '../../../components/verzahnung/KantenChip';
import { MehrKante } from '../../../components/verzahnung/MehrKante';
import { usePaneSteuerung } from '../../../components/layout/usePaneLayout';
import type { LeitfallRef } from '../../../lib/rechtsprechung/norm-index';
import {
  klassifiziereFassungsBezug, entscheidDatum, type ArtikelRevision,
} from '../../../lib/verzahnung/artikel-revisionen';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../../lib/normtext/typen';
import type { ArtikelHistorie } from '../../../lib/normtext/historie-laden';
import { ArtikelHistorieZeile } from './ArtikelHistorie';
import { margStufeStil, fnTextMitLinks, baueZitat, margLabel } from '../helpers';
import { zitatMitAusweis, heuteIso } from '../../../lib/format';
import { schaetzeArtikelHoehe } from '../berechnungen';
import { setzeZeitraum, useLeitfallZeitraum } from '../leserOptionen';
import { filtereLeitfaelleNachZeitraum, zeitraumLabel } from '../leitfallFilter';

// Schaufenster-Chips: nur die zentralen Leitfälle direkt zeigen (Reihenfolge =
// `gewicht` aus dem Shard), Rest hinter «+n weitere». V2·B-2 (David 10.7.2026,
// «auch mehr als fünf»): Kappung von 5 auf 10 angehoben; below-fold, kein
// Normtext-Re-Render (§15). Bewusst klein, kein Panel.
const LEITFAELLE_SICHTBAR = 10;

// «Leitfälle zu diesem Artikel» (FAHRPLAN-DATENHALTUNG §11.2, Weiche B): Chip-Zeile
// analog «Verweise». V1a-Endzustand (CI-Befund W2·7-VZUI, 3 Iterationen): die Zeile
// ist ein REINER Renderer — die Daten kommen als Prop vom Reader, der den erlass-
// lokalen Shard GENAU EINMAL idle lädt (inhalt.tsx). Vorher fetchte jede der ~1000
// Zeilen grosser Erlasse selbst (idle-Herde: >13 s Long-Tasks im 20×-Throttle,
// ★ nach ~15 s; ein Sichtbarkeits-Ansatz je Zeile scheiterte am Hydrations-Drift).
// Ein Fetch + ein setState auf Reader-Ebene: kein Herden-Jam, kein Race — memo
// re-rendert nur Artikel, deren `leitfaelle`-Prop wirklich wechselt (§15.4).
//
// Chips = geteilter KantenChip (Dichte-Regel: ★-Glyph als EIN Zusatz, aria-label
// aus dem StatusBadge-Vokabular), «+n weitere» = MehrKante. `normZitat`
// («Art. 957 OR») wandert als ?norm= an den Entscheid-Link — der EntscheidLeser
// springt zur ERSTEN Erwägung, die den Artikel zitiert (Auftrag David 3.7.2026;
// keine Fundstelle ableitbar → ehrlicher Seitenanfang, §8).
const LeitfallZeile = memo(function LeitfallZeile({ refs, normZitat, revision }: {
  /** Leitfälle dieses Artikels aus dem erlass-lokalen Shard (Reader lädt einmal). */
  refs?: LeitfallRef[];
  /** Voll zitierfähige Norm («Art. 957 OR») für den Fundstellen-Sprung im Ziel. */
  normZitat: string;
  /** Revision r(a) dieses Artikels (§V1c): undefined = unbekannt (⇒ still),
   *  null = Urfassung (⇒ still), Objekt = letzte Textänderung. Ein Leitfall,
   *  dessen Entscheiddatum VOR r(a) liegt, legt eine ältere Fassung aus → ↻-Glyph. */
  revision?: ArtikelRevision | null;
}) {
  const [alleAuf, setAlleAuf] = useState(false);
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  // V2·B-2: der Zeitraum-Filter als PRIMITIV-Selektor — diese Zeile re-rendert nur
  // bei echter Zeitraum-Änderung, nicht bei jedem anderen Ansicht-Toggle (§15).
  const zeitraum = useLeitfallZeitraum();

  // Wie die «Verweise»-Zeile: ohne Treffer GAR KEINE Zeile (kein reservierter
  // Leerraum, §15.2 — die grosse Mehrheit der Artikel hat keine Leitfälle; eine
  // Reservierung zöge in fast jeden Artikel Weissraum ein). Die Zeilen wachsen
  // mit dem EINEN Shard-Resolve am Artikel-Fuss ein (below-fold); der
  // prerenderte Normtext (LCP/Ctrl+F) bleibt unberührt (§15.1/3).
  if (!refs || refs.length === 0) return null;

  // V2·B-2: nach Zeitraum filtern (jahr-genau, Q1-sicher). `new Date` ist hier
  // unbedenklich — die Zeile ist client-only (nicht prerendert), kein Hydra-Drift.
  const gefiltert = filtereLeitfaelleNachZeitraum(refs, zeitraum, new Date().getFullYear());
  const zeitLabel = zeitraumLabel(zeitraum);
  const ueberschrift = (
    <span className="lc-overline mr-1" title="Maschinell aus den zitierten Normen zugeordnet — keine redaktionelle Präjudizienauswahl. Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung."><span className="lc-punkt lc-punkt-entscheid" aria-hidden />Leitfälle</span>
  );

  // §8-Härtung (B-2): sind durch den Zeitraum ALLE weggefiltert, verschwindet die
  // Zeile NICHT kommentarlos — sie zeigt «n ältere ausgeblendet» (klickbar → alle).
  // Marker `data-leitfall-zeile` bleibt gesetzt, damit der Entscheide-Toggle (B-1)
  // auch diese Hinweis-Zeile mit ausblendet.
  if (gefiltert.length === 0) {
    const n = refs.length;
    return (
      <div data-leitfall-zeile className="mt-4 flex flex-wrap items-center gap-2">
        {ueberschrift}
        <button
          type="button"
          onClick={() => setzeZeitraum('alle')}
          className="lc-chip hover:text-brass-700"
          title="Zeitraum-Filter (Rubrik Ansicht) aufheben und alle Leitfälle zeigen"
        >
          {n} {n === 1 ? 'älterer ausgeblendet' : 'ältere ausgeblendet'} · alle zeigen
        </button>
      </div>
    );
  }

  const sichtbar = alleAuf ? gefiltert : gefiltert.slice(0, LEITFAELLE_SICHTBAR);
  const rest = gefiltert.length - sichtbar.length;
  return (
    <div data-leitfall-zeile className="mt-4 flex flex-wrap items-center gap-2">
      {ueberschrift}
      {zeitLabel && (
        <span className="text-micro text-ink-400" title="Aktiver Zeitraum-Filter (Rubrik Ansicht)">{zeitLabel}</span>
      )}
      {sichtbar.map((r) => {
        // ?norm= trägt die Fundstellen-Absicht: das Ziel springt zur ersten
        // Erwägung, die diese Norm zitiert (Auflösung im EntscheidLeser, §5).
        const ziel = `/rechtsprechung/${encodeURIComponent(r.key)}?norm=${encodeURIComponent(normZitat)}`;
        // §V1c: hat sich die Norm SEIT diesem Entscheid revidiert? Q1-sicher über
        // die Entscheid-Präzision (BGE-Bandjahr-Platzhalter ⇒ strikter Jahresvergleich).
        const revidiert = klassifiziereFassungsBezug(entscheidDatum(r.datum, r.gericht), revision) === 'revidiert'
          ? (revision ?? null) : null;
        return (
          <span key={r.key} className="inline-flex items-center">
            <KantenChip to={ziel} label={r.zitierung} kategorie="entscheid"
              leitentscheid={r.leitcharakter === 'leitentscheid'}
              revidiert={revidiert}
              titel={r.regesteKurz ?? r.zitierung} />
            {kannOeffnen && !istOffen(ziel) && (
              <button type="button" onClick={() => oeffneDaneben(ziel)}
                title={`${r.zitierung} nebeneinander öffnen`} aria-label={`${r.zitierung} nebeneinander öffnen`}
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
                <span aria-hidden className="text-base leading-none">⧉</span>
              </button>
            )}
          </span>
        );
      })}
      <MehrKante rest={rest} offen={alleAuf} onOeffne={() => setAlleAuf(true)} />
      {/* Weiche-B-Erweiterungspunkt (§10(6)): der Massen-Anteil «+n weitere (online)»
          aus der Edge-Query kommt HIER dazu, sobald E2 live ist — heute nur der
          geshardete Schaufenster-Anteil, kein Edge-Fetch. NICHT bauen. */}
    </div>
  );
});

// Ein Artikel im Lesefluss (Richtung A): zweispaltig wie die amtliche Druckfassung —
// links «Art. N» als ruhiger Anker mit den Randtiteln darunter (rechtsbündig, nur die
// gegenüber dem Vorartikel GEÄNDERTEN Stufen, `marg`), rechts der Serif-
// Bestimmungstext. Ersetzt den früheren fliegenden Standort-Tracker. Reine Darstellung.
export const ArtikelLeser = memo(function ArtikelLeser({ e, erlass, basisPfad, fussnoten, intern, marg, margBasis, imTreffer, onSpringe, leitfaelle, revision, historie, istAnhang = false }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; fussnoten?: Fussnote[]; intern?: InternRefs;
  marg?: string[];
  /** G-HIST-UI: Fassungshistorie dieses Artikels aus dem erlass-lokalen Shard
   *  (Reader lädt ihn einmal idle). undefined = kein Eintrag ⇒ kein Badge (§8). */
  historie?: ArtikelHistorie;
  /** W2·5d G3b (③/⑤): der Eintrag ist ein Anhang (`annex_*`) bzw. Staatsvertrags-
   *  Protokoll (`lvl_*`) — als eigenständig erkennbarer, klar abgesetzter Block
   *  rendern (Struktur-Trenner statt Artikel-Trenner, «Anhang N»/«Protokoll N» als
   *  Struktur-Überschrift statt Artikelnummer). Reine Darstellung (§3); Prosa
   *  byte-gleich, nur Markup/Klassen. Delimitation über Typo + Struktur-Trenner
   *  (Linien-Kanon «Ruhe durch Reduktion» — keine Farb-/Box-Sprache). */
  istAnhang?: boolean;
  /** Leitfälle dieses Artikels (Reader lädt den erlass-lokalen Shard einmal). */
  leitfaelle?: LeitfallRef[];
  /** Revision r(a) dieses Artikels (§V1c) — an die LeitfallZeile durchgereicht. */
  revision?: ArtikelRevision | null;
  // Absolute Tiefe der ERSTEN gezeigten Randtitel-Stufe (Delta-Offset). Damit
  // wird die Stufe einheitlich je absoluter Tiefe formatiert, auch wenn nur
  // die geänderten Stufen gezeigt werden. 0 (Default) = volle Kette (Suchsicht).
  margBasis?: number;
  // Treffer-Modus (Auftrag David): Klick auf die Artikelnummer springt in den
  // VOLLTEXT zu diesem Artikel und löscht die Suche, statt nur innerhalb der
  // Trefferliste zu ankern.
  imTreffer?: boolean; onSpringe?: (token: string) => void;
}) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  const label = labelMitBereich(e.artikelLabel, e.artikel);
  // KURZ-Zitat («Art. 957 OR») — Fundstellen-Signal für den Entscheid-Sprung
  // (LeitfallZeile `normZitat` → ?norm=). MUSS knapp bleiben, sonst matcht der
  // EntscheidLeser die zitierende Erwägung nicht mehr.
  const zitat = `${label} ${erlass.kuerzel}`;
  // VOLL-Zitat (W2·5d G2b) für die Kopier-Aktion: Fundstelle + SR + Stand (§7 a–d).
  const zitatVoll = baueZitat(erlass, label);
  // Vollständig aufgehobener Artikel → dezent + standardmässig eingeklappt
  // (Auftrag David: «nicht so präsent», aufklappbar über den ▾/▸-Toggle).
  const ganzAufgehoben = artikelGanzAufgehoben(e.bloecke);
  // Fussnoten am Fuss: amtliche Sidecar-Fussnoten bevorzugen; fehlen sie, die
  // aus dem Wortlaut-Block abgetrennte Änderungshistorie (Extraktions-Artefakt)
  // hier zeigen — einheitlich EINE Quelle, keine Doppelung.
  const fussAnzeigeRoh: Fussnote[] = fussnoten && fussnoten.length > 0
    ? fussnoten
    : e.bloecke
        .map((b) => trenneAenderungshistorie(b.text).historie)
        .filter((h): h is string => !!h)
        .map((text): Fussnote => ({ nr: '', text, links: [] }));
  // A43 (David 16.7.): Fussnoten in Fedlex-ANZEIGE-Reihenfolge = laufende Nummer
  // (Fedlex nummeriert global nach Dokumentposition). Das Sidecar liefert bewusst
  // [artikel-eigene, …Section-heading] (load-bearing für den Revisions-Extrakt,
  // §3) — die Section-heading-Fussnote (z. B. SchKG 56 fn 95 am Randtitel «III.
  // Geschlossene Zeiten …», steht ÜBER dem Artikel) hat aber eine KLEINERE Nummer
  // und gehört im Apparat VOR die artikel-eigenen. Darum hier für die DARSTELLUNG
  // stabil nach numerischer Nr (+ Buchstaben-Suffix «95a») sortieren; leere/nicht-
  // parsbare Nr behalten stabil ihre Lage. Reine Darstellung — Sidecar/Daten unberührt.
  const fnNrKey = (nr: string): [number, string] => {
    const m = /^(\d+)([a-z]*)$/i.exec((nr ?? '').trim());
    return m ? [parseInt(m[1], 10), m[2].toLowerCase()] : [Number.POSITIVE_INFINITY, nr ?? ''];
  };
  const fussAnzeige: Fussnote[] = [...fussAnzeigeRoh].sort((a, b) => {
    const ka = fnNrKey(a.nr), kb = fnNrKey(b.nr);
    return ka[0] - kb[0] || ka[1].localeCompare(kb[1]);
  });
  const [artOffen, setArtOffen] = useState(!ganzAufgehoben); // einzelner Artikel ein-/ausklappbar; aufgehoben → zu
  // Fussnoten dem Absatz zuordnen, den sie betreffen: trägt der Absatz einen
  // Normverweis auf denselben Erlass (eli/cc-Basis), auf den die Fussnote
  // verlinkt (z. B. «SR 311.0» = StGB), gehört die Fussnote zu diesem Absatz →
  // Marker am Absatzende. Sonst (z. B. «Fassung gemäss …») an der Artikelnummer.
  // Fussnote → Block: die Absatznummer kommt direkt aus der Extraktion
  // (fn.absatz = Absatz, in dem der Marker im Fedlex-HTML steht). Marker auf dem
  // Artikelkopf/der Marginalie tragen absatz=null → Artikelebene. Schlüssel =
  // Block-Index (mehrere absatzlose Blöcke kollidieren nicht).
  const fnProAbsatz: Record<number, string[]> = {};
  const fnProItem: Record<string, string[]> = {}; // Schlüssel «<blockIndex>|<marke>»
  const fnArtikelEbene: string[] = [];
  // G11: Marker für section-heading-Fussnoten je Überschrift-Label — landen NICHT
  // mehr anonym auf Artikelebene, sondern an der passenden Randtitel-/Sektions-Zeile.
  const fnProSektion: Record<string, string[]> = {};
  for (const f of fussAnzeige) {
    if (!f.nr) continue;
    if (f.sektion) { (fnProSektion[f.sektion] ??= []).push(f.nr); continue; }
    let idx = f.absatz != null ? e.bloecke.findIndex((b) => b.absatz === f.absatz) : -1;
    // A31a: Marker in einem absatzlosen Fliesstext-Absatz (fn 667 in ZGB 798a) → am
    // Ende SEINES Blocks (0-basierter Index vom Extraktor) statt auf der Artikelebene.
    // Defensiv: Index im Bereich UND Zielblock wirklich absatzlos (gegen Sidecar-Drift).
    if (idx < 0 && f.absatzIndex != null && f.absatzIndex >= 0 && f.absatzIndex < e.bloecke.length
        && e.bloecke[f.absatzIndex].absatz == null) idx = f.absatzIndex;
    if (f.item && idx < 0) idx = e.bloecke.findIndex((b) => (b.items ?? []).some((it) => it.marke === f.item));
    if (idx >= 0 && f.item && (e.bloecke[idx].items ?? []).some((it) => it.marke === f.item)) {
      (fnProItem[`${idx}|${f.item}`] ??= []).push(f.nr); // Fussnote am lit/Ziff-Item
    } else if (idx >= 0) {
      (fnProAbsatz[idx] ??= []).push(f.nr); // am Absatz
    } else fnArtikelEbene.push(f.nr); // am Artikel
  }
  // Marker nur, wenn der Artikel offen ist (Ziel <p id=fn-…> lebt im artOffen-Block):
  // sonst öffnete der sichtbare Marker am eingeklappten Artikel ein leeres Popover
  // (toter Bedienpfad — typisch bei aufgehobenen Artikeln, Default eingeklappt).
  // W2·5d G2b (Fussnoten-Unifizierung): der Marker rendert jetzt IMMER (nur an
  // `artOffen` gebunden, nicht mehr am alten `fussnotenAuf`-React-Schalter) —
  // amtliche Substanz bleibt im DOM (R9/§8, Ctrl+F/Print/Screenreader). Die
  // Prominenz steuert allein der data-fussnoten-CSS-Toggle (index.css): «AUS»
  // DÄMPFT, versteckt nie. So gibt es EINE Fussnoten-Bedienung statt zweier.
  // A31 (David 16.7.2026): der Fussnoten-Marker klebt auf Fedlex DIREKT an der
  // Artikelnummer (kein Abstand). Darum KEIN `ml-0.5` mehr und der Marker sitzt im
  // selben Inline-Kontext wie das «Art. N»-Label (unten in whitespace-nowrap
  // gewickelt), nicht als eigenes flex-Kind mit gap-x-2.
  const fnMarker = artOffen && fnArtikelEbene.length > 0
    ? <span data-fn-marker>{fnArtikelEbene.map((nr, i) => (
        <span key={nr}>{i > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
      ))}</span>
    : null;
  // VERWEISE: im Artikel genannte, auflösbare (Bund-)Normverweise als Chips am
  // Fuss sammeln (Davids Referenz). Dedupliziert; nur was fedlexLinkFuerArtikel
  // wirklich auflöst (nie ein toter Link, §8). Inline-Links bleiben (17.6).
  const verweise: string[] = (() => {
    const seen = new Set<string>(); const out: string[] = [];
    for (const b of e.bloecke) {
      for (const t of [b.text, ...(b.items?.map((it) => it.text) ?? [])]) {
        for (const m of t.matchAll(NORM_IM_TEXT)) {
          const roh = m[0].trim();
          if (fedlexLinkFuerArtikel(roh) == null) continue;
          const key = roh.replace(/\s+/g, ' ');
          if (!seen.has(key)) { seen.add(key); out.push(roh); }
        }
      }
    }
    return out;
  })();
  const kopiere = (was: 'zitat' | 'link') => {
    const permalink = `${typeof window !== 'undefined' ? window.location.origin : ''}${basisPfad}#art-${e.artikel}`;
    // B-6 (QS-BASIS): die Zitat-Kopie trägt jetzt den Stand-Ausweis (§7 a–d) —
    // `zitatVoll` (baueZitat) liefert bereits «… (Stand …)» = die Fassung, der
    // Baustein ergänzt Abrufdatum + Permalink (kein doppeltes Standdatum, §5).
    const text = was === 'zitat'
      ? zitatMitAusweis(zitatVoll, { abruf: heuteIso(new Date()), permalink })
      : permalink;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was); window.setTimeout(() => setKopiert(''), 1500);
    });
  };
  // Aufhebungsnotiz (G16/#3): die amtliche «Aufgehoben durch … (AS …)»-Notiz eines
  // voll aufgehobenen Artikels liegt als artikel-Ebene-Fussnote im Snapshot
  // (absatz/item = null). M2 (David 29.6.2026) / G2b: sie ist eine Fussnote und liegt
  // wie jede Fussnote IMMER im DOM (data-fn-apparat, per data-fussnoten-CSS dämpfbar,
  // R9); die Statuszeile «· aufgehoben» (Artikelzustand) bleibt davon unberührt
  // immer sichtbar. Wortlaut nie erfunden (§1).
  const aufhebungNotiz: Fussnote[] = ganzAufgehoben
    ? fussAnzeige.filter((f) => f.absatz == null && f.item == null)
    : [];
  // W2·5d G3b (③/⑤): Anhang/Protokoll tragen einen kräftigeren Struktur-Trenner
  // (rule-struktur statt rule-artikel) + mehr Weissraum — so hebt sich jeder
  // Anhang-Block klar vom Normtext und vom Vor-Anhang ab (Linien-Kanon-Rolle
  // «Struktur-Trenner», wie oberste Sektionen/Ingress). Reine Darstellung (§3).
  return (
    <article id={`art-${e.artikel}`} data-normtext-linie data-anhang={istAnhang ? '' : undefined}
      // W2·5d U-POSITION/A2: inhalts-proportionale content-visibility-Platzhalter-
      // höhe (überschreibt den flachen 320px-Default der .nt-art-cv-Klasse) → der
      // Scrollbalken wird proportional. `content-visibility:auto` (Klasse) bleibt;
      // reiner Platzhalter-Schätzwert, kein DOM-/Inhalts-Eingriff (§15/1).
      style={{ containIntrinsicSize: `auto ${schaetzeArtikelHoehe(e)}px` }}
      className={`nt-art-cv group relative z-0 nt-anker border-t ${istAnhang ? 'border-rule-struktur pt-9 mt-9' : 'border-rule-artikel pt-7 mt-7'} first:border-t-0 first:mt-0 first:pt-0 transition duration-200 group-has-[[data-lese]:hover]/lese:opacity-80 has-[[data-lese]:hover]:!opacity-100 has-[[data-lese]:hover]:z-[5]`}>
      {/* Fedlex-Stil (Auftrag David): «Art. N» + Randtitel/Sachüberschrift stehen
          IMMER OBERHALB des Absatztextes (keine seitliche Randspalte mehr), damit
          der Normtext die volle Lesespaltenbreite bekommt. Reine Darstellung (§3). */}
      <div>
        {/* Kopfzeile des Artikels: «Art. N» als Anker, darunter die Randtitel
            (linksbündig, Sachüberschrift zuunterst) — über dem Fliesstext. */}
        <div className="mb-1.5">
          {/* Fedlex-Reihenfolge (Auftrag David 26.6.2026): Gliederungs-/Randtitel
              stehen ÜBER der Artikelnummer (nicht darunter) — und bleiben auch bei
              eingeklapptem/aufgehobenem Artikel sichtbar (Fedlex-treu). Die unterste
              Stufe (Sachüberschrift) zuunterst, font-medium. Reine Darstellung (§3).
              N1 (BS-Audit 23.6.2026): amtlicher Randtitel (article_title) nur, wenn
              KEINE feinere struktur-Marginalie (marg) vorliegt. */}
          {marg && marg.length > 0 ? (
            <div className="mb-1 space-y-0.5 font-serif leading-snug">
              {marg.map((m, i) => (
                <div key={i} className={margStufeStil((margBasis ?? 0) + i, i === marg.length - 1)}>
                  {/* A30: bis/ter-Suffix des Enumerators hochgestellt (margLabel). */}
                  {margLabel(m)}
                  {/* G11: section-heading-Fussnoten-Marker an der passenden Randtitel-
                      Zeile (blatt im Volltext, ganze Kette in der Suchsicht). G2b:
                      immer (an artOffen gebunden), Prominenz via data-fussnoten-CSS.
                      A31: Wort-Verbinder (U+2060) klebt den Marker DIREKT an die
                      Marginalie (kein Abstand, kein Umbruch auf eine eigene Zeile). */}
                  {artOffen && fnProSektion[m]?.map((nr, j) => (
                    <span key={nr} data-fn-marker>{WJ}{j > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
                  ))}
                </div>
              ))}
            </div>
          ) : e.titel ? (
            <div className="mb-1 font-serif leading-snug text-base font-semibold text-ink-800">
              {e.titel}
            </div>
          ) : null}
          {/* Artikelnummer-Zeile: «Art. N» als Anker; Zitat/Link rechtsbündig INLINE
              (ml-auto) statt als eigene Zeile darunter — schliesst den Abstand zum
              ersten Absatz (Auftrag David 26.6.2026, P8). */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {/* M9: aufgehobener Artikel trägt kein Klapp-Chevron (nichts zu entfalten —
                der Wortlaut ist «…»), aber EINEN gleich breiten w-4-Platzhalter wie der
                Chevron-Knopf der aktiven Artikel → die «Art. N» fluchten bündig auf
                EINER Ebene (Art. 349–358 ZGB bündig zu Art. 348). Beide inline-flex
                w-4 justify-center, damit die Glyphe nicht die Spaltenbreite verschiebt. */}
            {ganzAufgehoben
              ? <span className="inline-flex w-4 shrink-0" aria-hidden />
              : <button type="button" onClick={() => setArtOffen((v) => !v)} aria-expanded={artOffen}
                  aria-label={artOffen ? 'Artikel einklappen' : 'Artikel ausklappen'}
                  className="inline-flex w-4 shrink-0 justify-center text-micro text-ink-300 hover:text-brass-700">{artOffen ? '▾' : '▸'}</button>}
            {/* Anhang/Protokoll (③/⑤): «Anhang N»/«Protokoll N …» als Struktur-
                Überschrift (font-display, Titel-Grösse) statt als Artikelnummer
                (num/bold) — es ist ein Block-Titel, keine zitierbare Bestimmung. */}
            {/* A31: «Art. N» + Fussnoten-Marker als EIN Inline-/flex-Kind (whitespace-
                nowrap) — der Marker klebt direkt an der Nummer (kein gap-x-2, kein
                Umbruch auf eine eigene Zeile), genau wie auf Fedlex. */}
            <span className="whitespace-nowrap">
            {imTreffer && onSpringe ? (
              <button type="button" onClick={() => onSpringe(e.artikel)}
                title="Im Volltext zu diesem Artikel springen"
                className={istAnhang
                  ? 'font-display text-h3 font-semibold text-ink-900 hover:text-brass-700 text-left'
                  : `num text-base font-bold tracking-wide hover:text-brass-700 text-left ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</button>
            ) : (
              <a href={`#art-${e.artikel}`} className={istAnhang
                ? 'font-display text-h3 font-semibold text-ink-900 hover:text-brass-700 no-underline'
                : `num text-base font-bold tracking-wide hover:text-brass-700 no-underline ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</a>
            )}{fnMarker}
            </span>
            {/* aufgehoben gedämpft, aber ink-500 (WCAG 4.5:1 hell+dunkel) statt
                ink-400 (3.2–3.6:1) — essentieller Link-Text, kein incidental. */}
            {ganzAufgehoben && <span className="text-xs italic text-ink-500">· aufgehoben</span>}
            {artOffen && (
              <span className="ml-auto flex shrink-0 gap-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-500 hover:text-brass-700" aria-label={`Zitat kopieren: ${zitatVoll}`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
                <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-500 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
              </span>
            )}
            {/* Amtliche Aufhebungsnotiz (eigene Zeile, dezent eingerückt) — M2: erst
                auf Klick (hinter dem Fussnoten-Schalter), wie jede andere Fussnote.
                Die Statuszeile «· aufgehoben» oben bleibt unabhängig immer sichtbar. */}
            {ganzAufgehoben && aufhebungNotiz.length > 0 && (
              <span data-fn-apparat className="basis-full pl-6 text-xs leading-snug text-ink-500">
                {aufhebungNotiz.map((fn, i) => (
                  <span key={i}>{i > 0 && '; '}{fnTextMitLinks(fn)}</span>
                ))}
              </span>
            )}
          </div>
          {/* G23 (M8): Delegationsnorm-Grundlage «(Art. N ArG)» — Fedlex zeigt sie
              dezent unter der Überschrift; amtlicher Inhalt (§2), bisher verworfen.
              Immer sichtbar (auch eingeklappt), wie der Randtitel. */}
          {e.grundlage && (
            <div className="mt-0.5 text-xs italic leading-snug text-ink-500">{e.grundlage}</div>
          )}
        </div>
        {/* Rechte Lesespalte: grosse Serifenschrift, hängende Messing-Absatznummern.
            overflow-x-clip + min-w-0: bei geteiltem/schmalem Bildschirm darf der
            Artikel-Block (hängender Absatz-Einzug pl-9/-indent-9) NICHT über die
            Spalte hinausragen → sonst wurde Text rechts abgeschnitten (Befund David
            25.6.2026). Der Wortumbruch im Absatz (overflow-wrap:anywhere) bleibt. */}
        {artOffen && (
        <div className="max-w-normtext min-w-0 overflow-x-clip">
          <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
            zitierKontext={{ artikelLabel: label, kuerzel: erlass.kuerzel, fassung: erlass.stand, permalinkBasis: `${basisPfad}#art-${e.artikel}` }}
            fnProAbsatz={fnProAbsatz} fnProItem={fnProItem}
            intern={intern}
            className="space-y-3.5 font-serif text-body-l leading-[1.65] text-ink-800" />
          {/* VERWEISE: auflösbare Normverweise des Artikels als Chips (Referenz David). */}
          {verweise.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Verweise</span>
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </div>
          )}
          {/* LEITFÄLLE (§11.2): Bundesgerichtsentscheide zu genau diesem Artikel, lazy
              aus dem erlass-lokalen Shard. Verdrahtet das bisher tote proNormArtikel-
              Modell (norm-index.ts) sichtbar — vom Artikel direkt zur Rechtsprechung. */}
          <LeitfallZeile refs={leitfaelle} normZitat={zitat} revision={revision} />
          {/* G-HIST-UI: «Gilt seit»-Badge + aufklappbare Fassungs-Timeline dieses
              Artikels (aus dem erlass-lokalen Historie-Shard, idle geladen). Am
              Artikel-Fuss wie Verweise/Leitfälle. §15.2: der Slot steht ab dem
              ERSTEN Render und reserviert die eine Chip-Zeile (`min-h-hist-zeile`,
              Token — gemessen exakt 24 px, deterministisch über alle Artikel), damit
              der idle-Shard-Resolve reservierten Platz FÜLLT statt sichtbare Artikel
              zu schieben (Messung 20.7.: sonst CLS 0.0227 statt 0.0002 unter 6×). Der
              Aussenabstand sitzt hier am Slot, nicht in der Zeile — sonst fallen
              reservierte und gefüllte Höhe auseinander. */}
          <div className="mt-4 min-h-hist-zeile">
            <ArtikelHistorieZeile historie={historie} artikel={e.artikel} />
          </div>
          {/* Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar). W2·5d G2b:
              der Apparat liegt IMMER im DOM (Ctrl+F/Print/Screenreader, R9/§8);
              der data-fussnoten-CSS-Toggle dämpft ihn bei «AUS» (data-fn-apparat),
              versteckt ihn nie. Marker + Apparat = EINE Bedienung (Options-Leiste). */}
          {fussAnzeige.length > 0 && (
            <div data-fn-apparat className="mt-3 border-t border-rule-artikel pt-2 space-y-1">
              {fussAnzeige.map((fn, i) => (
                <p key={i} id={fn.nr ? `fn-${e.artikel}-${fn.nr}` : undefined} className="nt-anker text-xs leading-normal text-ink-500 target:bg-brass-100">
                  {/* WCAG-AA (§13): Fussnoten-Nummer ist semantischer Text (kein aria-hidden),
                      darum ink-500 statt ink-300 — ink-300 ist ein Deko-Token (~2.3:1, axe serious).
                      ink-500 ≥4.8:1 hell / ≥5.2:1 dunkel auf allen Reader-Flächen, deckt den
                      Farbwert der Zeile (die Zeile ist bereits ink-500). Latenter 17.6.-Defekt,
                      sichtbar durch #255, Fix 18.7. */}
                  {fn.nr && <span className="num mr-1 text-ink-500">{fn.nr}</span>}
                  {fnTextMitLinks(fn)}
                </p>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </article>
  );
});

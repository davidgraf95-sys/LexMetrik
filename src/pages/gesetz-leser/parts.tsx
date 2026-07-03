import { useState, useEffect, useRef, memo, type ReactNode } from 'react';
import { ArtikelBody, FnRef } from '../../components/normtext/ArtikelBody';
import type { InternRefs } from '../../components/NormText';
import { trenneAenderungshistorie, labelMitBereich, artikelGanzAufgehoben } from '../../lib/normtext/darstellung';
import type { Sektion, Fussnote, ErlassKopf } from '../../lib/normtext/browse';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { NormChip } from '../../components/vorlagen/ui';
import { KantenChip } from '../../components/verzahnung/KantenChip';
import { MehrKante } from '../../components/verzahnung/MehrKante';
import { usePaneSteuerung } from '../../components/layout/usePaneLayout';
import { leitfaelleFuerArtikel, type LeitfallRef } from '../../lib/rechtsprechung/norm-index';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { margStufeStil, fnTextMitLinks, romanFrei } from './helpers';

// Schaufenster-Chips: nur die wenigen zentralen Leitfälle direkt zeigen (Reihenfolge
// = `gewicht` aus dem Shard), Rest hinter «+n weitere». Bewusst klein, kein Panel.
const LEITFAELLE_SICHTBAR = 5;

// requestIdleCallback mit garantiert feuerndem Fallback (§15.3) — hält den
// Shard-Fetch vom Erstpaint fern. «Garantiert» heisst BEIDE Zweige (CI-Befund
// W2·7-VZUI): ein vorhandenes rIC kann auf ausgelasteten Geräten beliebig lange
// ausgehungert werden (der Main-Thread wird nie idle) — die rIC-`timeout`-Option
// erzwingt den Lauf spätestens nach 1200 ms, identisch zum setTimeout-Zweig
// ohne rIC. Erstpaint/LCP unberührt (feuert weiterhin bevorzugt im Leerlauf).
function beiLeerlauf(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const w = window as typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: 1200 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
}

// «Leitfälle zu diesem Artikel» (FAHRPLAN-DATENHALTUNG §11.2, Weiche B): Chip-Zeile
// analog «Verweise», gespeist LAZY aus dem erlass-lokalen Shard (nie das 536-KB-
// Gesamt-JSON eager). Jeder Chip → Entscheid + «⧉ daneben öffnen» (Split-View-Muster
// aus dem KontextPanel). Maschinelle Zuordnung, §8 offengelegt. Eigene memo-Komponente,
// damit der Fetch/State jedes Artikels isoliert bleibt (§15.4).
//
// V1.2 (W2·7-VZUI): Chips = geteilter KantenChip (Dichte-Regel: ★-Glyph als EIN
// Zusatz, aria-label aus dem StatusBadge-Vokabular), «+n weitere» = MehrKante.
// `normZitat` («Art. 957 OR») wandert als ?norm= an den Entscheid-Link — der
// EntscheidLeser springt damit zur ERSTEN Erwägung, die den Artikel zitiert
// (Auftrag David 3.7.2026: Gesetz→Entscheid landet an der Fundstelle; keine
// Fundstelle ableitbar → ehrlicher Seitenanfang, §8).
const LeitfallZeile = memo(function LeitfallZeile({ registerKey, artikel, normZitat }: {
  registerKey: string; artikel: string;
  /** Voll zitierfähige Norm («Art. 957 OR») für den Fundstellen-Sprung im Ziel. */
  normZitat: string;
}) {
  // Ladezustand aus dem Ergebnis-Key ABGELEITET (kein synchrones setState im Effekt-
  // Body — react-hooks-Regel, gleiches Muster wie KontextPanel §6.4). Der Schlüssel
  // bindet das Resultat an den (Erlass,Artikel)-Fetch, der es erzeugt hat.
  const artKey = `${registerKey}/${artikel}`;
  const [geladen, setGeladen] = useState<{ key: string; refs: LeitfallRef[] } | null>(null);
  const [alleAuf, setAlleAuf] = useState(false);
  // SICHTBARKEITS-Laden statt Idle-Herde (§15-CI-Befund W2·7-VZUI): grosse Erlasse
  // (ZGB ~1000 Artikel) mounten ~1000 LeitfallZeilen — liefen ALLE zugleich über
  // requestIdleCallback, jammten Fetch-Resolves + setState-Bursts den Main-Thread
  // (gemessen 20×-Throttle: >13 s Long-Tasks, ★ erst nach ~15 s). Jetzt lädt eine
  // Zeile erst, wenn ihr Artikel in Viewport-Nähe kommt (Sentinel + rootMargin
  // 600 px) — nur die tatsächlich gelesenen Artikel arbeiten; der Shard-Fetch
  // bleibt über den Promise-Cache geteilt. Ohne IO (alte Browser): von Anfang an
  // «nah» (Lazy-Initializer, kein setState im Effekt-Body — react-hooks-Regel).
  const [nah, setNah] = useState(() => typeof IntersectionObserver === 'undefined');
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || nah) return;
    // Beobachtet wird der TRAGENDE Artikel (nicht der 0×0-Sentinel): der Artikel
    // hat auch bei übersprungener content-visibility eine Platzhalter-Box, und
    // Layout-Drift während der Hydration (Artikel wandern beim Einrendern) kann
    // einen punktförmigen Sentinel zwischen zwei Observer-Ticks aus dem Fenster
    // schieben (empirisch: art-41 top 240→−64 in <1 s). Der Sentinel dient nur
    // als React-Anker, um das Artikel-Element zu finden.
    const ziel = el.closest('article') ?? el;
    const io = new IntersectionObserver((eintraege) => {
      if (eintraege.some((e) => e.isIntersecting)) { setNah(true); io.disconnect(); }
    }, { rootMargin: '600px 0px' });
    io.observe(ziel);
    return () => io.disconnect();
  }, [nah]);

  useEffect(() => {
    if (!nah) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      leitfaelleFuerArtikel(registerKey, artikel).then((r) => { if (lebt) setGeladen({ key: artKey, refs: r }); });
    });
    return () => { lebt = false; abbrechen(); };
  }, [nah, registerKey, artikel, artKey]);

  // Nur das zum AKTUELLEN Artikel gehörende Resultat zeigen; ein veralteter Treffer = «lädt».
  const leitfaelle: LeitfallRef[] | null = geladen && geladen.key === artKey ? geladen.refs : null;

  // Wie die «Verweise»-Zeile: bei nichts vorhanden GAR KEINE Zeile rendern (kein
  // reservierter Leerraum) — nur der unsichtbare 0×0-Sentinel bleibt als Beobachtungs-
  // Anker stehen, bis geladen ist. Bewusst KEINE Mindesthöhe je Artikel — die grosse
  // Mehrheit der Artikel hat keine Leitfälle; eine Reservierung würde in fast jeden
  // Artikel Weissraum einziehen (Anti-Ziel §15.2 „Reservierung darf keinen Inhalt
  // verstecken", schadete der Lesedichte). Die Chips wachsen in Viewport-Nähe am
  // Artikel-FUSS ein (unterhalb von Body + Verweisen, meist below-fold); der
  // prerenderte Normtext (LCP/Ctrl+F) bleibt unberührt (§15.1/3).
  if (!leitfaelle) return <span ref={sentinelRef} aria-hidden />;
  if (leitfaelle.length === 0) return null;

  const sichtbar = alleAuf ? leitfaelle : leitfaelle.slice(0, LEITFAELLE_SICHTBAR);
  const rest = leitfaelle.length - sichtbar.length;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="lc-overline mr-1" title="Maschinell aus den zitierten Normen zugeordnet — keine redaktionelle Präjudizienauswahl. Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung.">Leitfälle</span>
      {sichtbar.map((r) => {
        // ?norm= trägt die Fundstellen-Absicht: das Ziel springt zur ersten
        // Erwägung, die diese Norm zitiert (Auflösung im EntscheidLeser, §5).
        const ziel = `/rechtsprechung/${encodeURIComponent(r.key)}?norm=${encodeURIComponent(normZitat)}`;
        return (
          <span key={r.key} className="inline-flex items-center">
            <KantenChip to={ziel} label={r.zitierung}
              leitentscheid={r.leitcharakter === 'leitentscheid'}
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
export const ArtikelLeser = memo(function ArtikelLeser({ e, erlass, basisPfad, fussnoten, fussnotenAuf, intern, marg, margBasis, imTreffer, onSpringe }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; fussnoten?: Fussnote[]; fussnotenAuf: boolean; intern?: InternRefs;
  marg?: string[];
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
  const zitat = `${label} ${erlass.kuerzel}`;
  // Vollständig aufgehobener Artikel → dezent + standardmässig eingeklappt
  // (Auftrag David: «nicht so präsent», aufklappbar über den ▾/▸-Toggle).
  const ganzAufgehoben = artikelGanzAufgehoben(e.bloecke);
  // Fussnoten am Fuss: amtliche Sidecar-Fussnoten bevorzugen; fehlen sie, die
  // aus dem Wortlaut-Block abgetrennte Änderungshistorie (Extraktions-Artefakt)
  // hier zeigen — einheitlich EINE Quelle, keine Doppelung.
  const fussAnzeige: Fussnote[] = fussnoten && fussnoten.length > 0
    ? fussnoten
    : e.bloecke
        .map((b) => trenneAenderungshistorie(b.text).historie)
        .filter((h): h is string => !!h)
        .map((text): Fussnote => ({ nr: '', text, links: [] }));
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
  const fnMarker = artOffen && fussnotenAuf && fnArtikelEbene.length > 0
    ? <span className="ml-0.5">{fnArtikelEbene.map((nr, i) => (
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
    const text = was === 'zitat' ? zitat
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${basisPfad}#art-${e.artikel}`;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was); window.setTimeout(() => setKopiert(''), 1500);
    });
  };
  // Aufhebungsnotiz (G16/#3): die amtliche «Aufgehoben durch … (AS …)»-Notiz eines
  // voll aufgehobenen Artikels liegt als artikel-Ebene-Fussnote im Snapshot
  // (absatz/item = null). M2 (David 29.6.2026): sie wird wie JEDE Fussnote erst auf
  // Klick gezeigt — einheitlich hinter dem Fussnoten-Schalter (`fussnotenAuf`); die
  // Statuszeile «· aufgehoben» (Artikelzustand) bleibt davon unberührt immer sichtbar.
  // Wortlaut nie erfunden (§1).
  const aufhebungNotiz: Fussnote[] = ganzAufgehoben
    ? fussAnzeige.filter((f) => f.absatz == null && f.item == null)
    : [];
  return (
    <article id={`art-${e.artikel}`}
      className="nt-art-cv group relative z-0 nt-anker border-t border-line/70 pt-7 mt-7 first:border-t-0 first:mt-0 first:pt-0 transition duration-200 group-has-[[data-lese]:hover]/lese:opacity-80 has-[[data-lese]:hover]:!opacity-100 has-[[data-lese]:hover]:z-[5]">
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
                  {m}
                  {/* G11: section-heading-Fussnoten-Marker an der passenden Randtitel-
                      Zeile (blatt im Volltext, ganze Kette in der Suchsicht). */}
                  {artOffen && fussnotenAuf && fnProSektion[m]?.map((nr, j) => (
                    <span key={nr}>{j > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
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
            {imTreffer && onSpringe ? (
              <button type="button" onClick={() => onSpringe(e.artikel)}
                title="Im Volltext zu diesem Artikel springen"
                className={`num text-base font-bold tracking-wide hover:text-brass-700 text-left ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</button>
            ) : (
              <a href={`#art-${e.artikel}`} className={`num text-base font-bold tracking-wide hover:text-brass-700 no-underline ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</a>
            )}{fnMarker}
            {/* aufgehoben gedämpft, aber ink-500 (WCAG 4.5:1 hell+dunkel) statt
                ink-400 (3.2–3.6:1) — essentieller Link-Text, kein incidental. */}
            {ganzAufgehoben && <span className="text-xs italic text-ink-500">· aufgehoben</span>}
            {artOffen && (
              <span className="ml-auto flex shrink-0 gap-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-500 hover:text-brass-700" aria-label={`${zitat} kopieren`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
                <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-500 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
              </span>
            )}
            {/* Amtliche Aufhebungsnotiz (eigene Zeile, dezent eingerückt) — M2: erst
                auf Klick (hinter dem Fussnoten-Schalter), wie jede andere Fussnote.
                Die Statuszeile «· aufgehoben» oben bleibt unabhängig immer sichtbar. */}
            {ganzAufgehoben && fussnotenAuf && aufhebungNotiz.length > 0 && (
              <span className="basis-full pl-6 text-xs leading-snug text-ink-500">
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
        <div className="max-w-[52rem] min-w-0 overflow-x-clip">
          <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
            zitierKontext={{ artikelLabel: label, kuerzel: erlass.kuerzel }}
            fnProAbsatz={fussnotenAuf ? fnProAbsatz : undefined} fnProItem={fussnotenAuf ? fnProItem : undefined}
            intern={intern}
            className="space-y-3.5 font-serif text-body-l leading-[1.65] text-ink-800" />
          {/* VERWEISE: auflösbare Normverweise des Artikels als Chips (Referenz David). */}
          {verweise.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="lc-overline mr-1">Verweise</span>
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </div>
          )}
          {/* LEITFÄLLE (§11.2): Bundesgerichtsentscheide zu genau diesem Artikel, lazy
              aus dem erlass-lokalen Shard. Verdrahtet das bisher tote proNormArtikel-
              Modell (norm-index.ts) sichtbar — vom Artikel direkt zur Rechtsprechung. */}
          <LeitfallZeile registerKey={erlass.key} artikel={e.artikel} normZitat={zitat} />
          {/* Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar): nur auf Wunsch
              (globaler Schalter in der Suchleiste). */}
          {fussnotenAuf && fussAnzeige.length > 0 && (
            <div className="mt-3 border-t border-line/50 pt-2 space-y-1">
              {fussAnzeige.map((fn, i) => (
                <p key={i} id={fn.nr ? `fn-${e.artikel}-${fn.nr}` : undefined} className="nt-anker text-xs leading-normal text-ink-500 target:bg-brass-100">
                  {fn.nr && <span className="num mr-1 text-ink-300">{fn.nr}</span>}
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

// M5 (§2 Fundiertheits-Floor): Erlass-Kopf = Ingress/Erlassformel bzw. materielle
// Präambel + Erlassdatum + Kopf-Fussnoten. Fedlex zeigt das unter dem Titel; bei
// uns war es zu 100 % verworfen (Extraktor startete erst beim ersten <article>).
// Reine Darstellung aus dem Sidecar (§3) — Wortlaut unangetastet (§1). Die Kopf-
// Fussnoten (Provenienz) liegen wie der Änderungs-Apparat hinter dem Schalter (§4).
export function ErlassKopfBlock({ kopf, fussnotenAuf }: { kopf: ErlassKopf; fussnotenAuf: boolean }) {
  const hatPraeambel = !!kopf.praeambel?.length;
  if (!kopf.erlassdatum && !hatPraeambel) return null;
  const zeilenStil = (rolle: string): string => {
    if (rolle === 'verb') return 'font-serif text-body-l text-ink-800';
    if (rolle === 'autor') return 'font-serif text-body-l text-ink-800';
    // ingress (Rechtsgrundlage) + praeambel (materiell, BV) ruhig im Lesefluss
    return 'font-serif text-body-l leading-[1.65] text-ink-700';
  };
  return (
    <section aria-label="Ingress" className="max-w-reading space-y-3 border-b border-line pb-5">
      {kopf.erlassdatum && (
        <p className="font-serif text-body-s text-ink-500">{kopf.erlassdatum}</p>
      )}
      {kopf.praeambelTitel && (
        <p className="lc-overline">{kopf.praeambelTitel}</p>
      )}
      {hatPraeambel && (
        <div className="space-y-2">
          {kopf.praeambel!.map((z, i) => (
            <p key={i} className={zeilenStil(z.rolle)}>{z.text}</p>
          ))}
        </div>
      )}
      {fussnotenAuf && kopf.fussnoten && kopf.fussnoten.length > 0 && (
        <div className="mt-3 border-t border-line/50 pt-2 space-y-1">
          {kopf.fussnoten.map((fn, i) => (
            <p key={i} className="text-xs leading-normal text-ink-500">
              {fn.nr && <span className="num mr-1 text-ink-300">{fn.nr}</span>}
              {fnTextMitLinks(fn)}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

// Gliederungs-Überschrift im Fliesstext: klappbar (Fedlex-analog), volle
// Bezeichnung, nach Ebene abgestuft.
export function SektionKopf({ s, refCb, offen, onToggle, bereich, bereichEinzel, fussnotenAuf }: {
  s: Sektion; refCb: (el: HTMLElement | null) => void; offen: boolean; onToggle: () => void; bereich?: string;
  /** Die Sektion umfasst genau EINEN Artikel (Bereich = «Art. N», keine Spanne). */
  bereichEinzel?: boolean;
  fussnotenAuf?: boolean;
}) {
  const { pre, rest } = romanFrei(s.label);
  // Vollwertige Abschnitts-Überschrift im Fliesstext: feine Overline mit dem
  // Aufzähler («Erster Abschnitt»), darunter der Sachtitel + Artikel-Bereich. Trägt
  // wieder die Standort-Info im Text (der frühere fliegende Running-Header entfällt).
  // Randtitel-promotete Knoten (6b: «A. …», «II. …») sind feine Marginalien-
  // Gruppierungen, KEINE amtlichen Teil/Titel/Abschnitt — darum durchgehend ruhig
  // (Serif-Stimme der Randtitel, kein Trenn-Strich, keine grossen Stufengrössen),
  // unabhängig von der Roh-Ebene. Die Verschachtelung trägt der Einzug-Strich
  // (renderSektion). Reine Darstellung (§3/§13, nur vorhandene Tokens).
  const mt = s.randtitel ? 'mt-4' : s.ebene <= 1 ? 'mt-8 first:mt-0' : s.ebene === 2 ? 'mt-6' : s.ebene === 3 ? 'mt-5' : 'mt-4';
  const regel = s.randtitel ? '' : s.ebene <= 1 ? 'border-t border-line pt-4' : s.ebene === 2 ? 'border-t border-line/50 pt-3' : '';
  // Titelgrösse nach Tiefe (E, Auftrag David 26.6.2026): Fedlex-artig abgestuft —
  // oberste Stufe prominent (h2), dann h3, body-l, sonst base. font-semibold liegt
  // am Titel-Span (unten). Nur existierende Tokens (§13).
  const titelStil = s.randtitel ? 'text-base' : s.ebene === 0 ? 'text-h2' : s.ebene === 1 ? 'text-h3' : s.ebene === 2 ? 'text-body-l' : 'text-base';
  const titelFont = s.randtitel ? 'font-serif font-semibold text-ink-800' : 'font-display font-semibold text-ink-900';
  // G11: section-heading-Fussnoten-Marker. FnRef ist selbst ein <button> und darf
  // NICHT im Toggle-<button> liegen (verschachtelte Buttons) → der Marker sitzt als
  // Geschwister NEBEN dem Toggle in derselben Titelzeile. Nur zeigen, wenn der
  // Fussnoten-Schalter AN ist UND die Sektion OFFEN ist: das Popover-Ziel
  // (#fn-<artikel>-<nr>) lebt im {auf && …}-Block des Trägerartikels und ist bei
  // eingeklappter Sektion ungemountet → sonst toter Bedienpfad (§13 F4, analog zum
  // artOffen-Gate der Artikel-Marker).
  const sekFn = offen && fussnotenAuf && s.fussnoten && s.fussnoten.length > 0 ? s.fussnoten : null;
  return (
    <div ref={refCb} data-sek={s.id} className={`nt-anker ${mt} ${regel}`}>
      {pre && (
        <button type="button" onClick={onToggle} aria-expanded={offen} className="group/sek block text-left">
          <span className="lc-overline group-hover/sek:text-brass-700">{pre}</span>
        </button>
      )}
      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {/* Einklapp-Marke deutlich (analog Fedlex, Auftrag David): jede Stufe
            inkl. Untergruppe ist klappbar — vorher war das Chevron zu blass/winzig,
            darum wirkte es, als ginge es nicht. Messing-Akzent macht es als
            Steuerelement erkennbar. */}
        <button type="button" onClick={onToggle} aria-expanded={offen} className="group/sek flex min-w-0 items-baseline gap-x-2 text-left">
          <span className={`shrink-0 w-4 text-body-s transition-colors ${offen ? 'text-brass-600' : 'text-ink-500'} group-hover/sek:text-brass-700`}>{offen ? '▾' : '▸'}</span>
          <span className={`${titelFont} ${titelStil} group-hover/sek:text-brass-700`}>{rest || s.label}</span>
        </button>
        {sekFn && (
          <span className="shrink-0">
            {sekFn.map((f, i) => (
              <span key={`${f.artikel}-${f.nr}`}>{i > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel={f.artikel} nr={f.nr} /></span>
            ))}
          </span>
        )}
        {/* Artikel-Bereich-Badge. Bei einer EINZELartikel-Sektion ist das «Art. N»
            redundant, sobald die Sektion OFFEN ist (der Artikel steht direkt
            darunter mit voller Kopfzeile, Auftrag David) → nur im eingeklappten
            Zustand zeigen. Echte Spannen («Art. 1–10») bleiben immer sichtbar. */}
        {bereich && !(bereichEinzel && offen) && (
          <span className="num shrink-0 text-xs font-normal text-ink-500">{bereich}</span>
        )}
      </span>
    </div>
  );
}

// TOC-Gliederungsbaum: jede Stufe einklappbar (geteilter Zustand mit dem
// Fliesstext); Dreieck klappt, Label springt.
// Rank 4 (QS-PERF, §15/4): React.memo (Default-Komparator) — der Baum re-rendert
// sonst bei JEDER Scroll-Spy-Aktualisierung des Parents (setAktArtikel etc.) mit,
// obwohl nur aktivPfad/offen ihn betreffen. Props sind referenzstabil: sektionen
// (useMemo), offen=tocBaum (State), onToggle/onSprung (useCallback) → memo bricht
// nur bei echtem aktivPfad-/offen-Wechsel ab. Reine Laufzeit, kein Output (§6.4).
export const SektionBaumTOC = memo(function SektionBaumTOC({ sektionen, aktivPfad, offen, onToggle, onSprung }: {
  sektionen: Sektion[]; aktivPfad: string[]; offen: Record<string, boolean>; // aktivPfad = Sektions-IDs
  onToggle: (id: string) => void; onSprung: (id: string) => void;
}) {
  // Akkordeon: Standard zu. Aufgeklappt wird durch Klick (Chevron/Sprung) ODER
  // automatisch durch den Scroll-Spy (K): der aktive Zweig klappt beim Scrollen
  // auf und beim Verlassen wieder zu. Manuell (Klick) geöffnete Zweige bleiben
  // offen (autoOffenRef im Reader steuert das). Markierung über `aktivPfad`.
  const zeile = (s: Sektion, tiefe: number): ReactNode => {
    const auf = offen[s.id] ?? false;
    const { pre, rest } = romanFrei(s.label);
    const aktiv = aktivPfad.includes(s.id);
    const hatKinder = s.kinder.length > 0;
    return (
      <li key={s.id}>
        <div className="flex items-start" style={{ paddingLeft: `${tiefe * 0.6}rem` }}>
          {hatKinder
            ? <button type="button" onClick={() => onToggle(s.id)} aria-label={auf ? 'Einklappen' : 'Aufklappen'} className="shrink-0 text-ink-300 hover:text-ink-600 px-1 mt-0.5 text-micro w-4">{auf ? '▾' : '▸'}</button>
            : <span className="shrink-0 w-4" aria-hidden />}
          <button type="button" onClick={() => onSprung(s.id)} data-toc-aktiv={aktiv ? '1' : undefined} aria-current={aktiv ? 'true' : undefined}
            className={`flex-1 text-left rounded px-1.5 py-0.5 leading-snug transition-colors ${tiefe === 0 ? 'text-body-s' : 'text-xs'} ${aktiv ? 'text-ink-900 font-medium bg-brass-100/40' : 'text-ink-600 hover:text-ink-900 hover:bg-paper-sunken/60'}`}>
            {pre ? <><span className="font-medium text-ink-700">{pre}:</span> {rest}</> : s.label}
          </button>
        </div>
        {/* Sanftes Auf-/Zuklappen via grid-rows (0fr↔1fr) — Kinder bleiben gemountet. */}
        {hatKinder && (
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${auf ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden min-h-0">
              <ul className="space-y-0.5 mt-0.5">{s.kinder.map((k) => zeile(k, tiefe + 1))}</ul>
            </div>
          </div>
        )}
      </li>
    );
  };
  return <ul className="space-y-0.5">{sektionen.map((s) => zeile(s, 0))}</ul>;
});

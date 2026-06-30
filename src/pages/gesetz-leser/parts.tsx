import { useState, type ReactNode } from 'react';
import { ArtikelBody, FnRef } from '../../components/normtext/ArtikelBody';
import type { InternRefs } from '../../components/NormText';
import { trenneAenderungshistorie, labelMitBereich, artikelGanzAufgehoben } from '../../lib/normtext/darstellung';
import type { Sektion, Fussnote, ErlassKopf } from '../../lib/normtext/browse';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { NormChip } from '../../components/vorlagen/ui';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { margStufeStil, fnTextMitLinks, romanFrei } from './helpers';

// Ein Artikel im Lesefluss (Richtung A): zweispaltig wie die amtliche Druckfassung —
// links «Art. N» als ruhiger Anker mit den Randtiteln darunter (rechtsbündig, nur die
// gegenüber dem Vorartikel GEÄNDERTEN Stufen, `marg`), rechts der Serif-
// Bestimmungstext. Ersetzt den früheren fliegenden Standort-Tracker. Reine Darstellung.
export function ArtikelLeser({ e, erlass, basisPfad, fussnoten, fussnotenAuf, intern, marg, margBasis, imTreffer, onSpringe }: {
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
}

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
export function SektionBaumTOC({ sektionen, aktivPfad, offen, onToggle, onSprung }: {
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
}

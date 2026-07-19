import { useState, type MouseEvent } from 'react';
import type { EntscheidAbschnitt, EntscheidBlock } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker, segmente, gruppiereErwaegungen } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';
import { zitatMitAusweis, heuteIso } from '../../lib/format';

// EntscheidBody: amtliches BGer-Lesebild (Art. 112 BGG: Sachverhalt → Erwägungen →
// Dispositiv, feste Reihenfolge als Invariante).
//  · Erwägungen nach Top-Ziffer GRUPPIERT: jede „N." mit einheitlicher Kopfzeile +
//    Trennlinie (auch bei ausgelassener Zwischenebene); Unter-Erwägungen nach Tiefe
//    eingerückt. Im Text nur die nackte Ziffer; „E." nur in Zitat/Anker (bger.ch-Regeln).
//  · Klick auf eine Ziffer kopiert die VOLLE Fundstelle (z.B. „BGer … vom …, E. 2.1").
//  · Markenlose Erwägungen (unplausible/kantonale Daten) als Fliesstext — kein „E. 0".
//  · Dispositiv als nummerierte Liste; Schlussformel gedämpft.
//  · `rsp-prose` hält Norm-Links dezent (R11); Lesegrösse via --rsp-fs (R17).

// break-words (overflow-wrap): amtliche Urteilstexte tragen unumbrechbare
// Über-Token (BS SB.2018.46: 169-Zeichen-Fedlex-URL im Fliesstext) — ohne
// Umbruch-Erlaubnis reisst der Absatz die Mobil-Spalte auf (R21-Querscroll,
// e2e-Befund Block B). Rein visuelle Zeilenbruch-Erlaubnis, Inhalt/NBSP-
// Fidelity unberührt (§15: kein Logikverlust).
const ABSATZ = 'font-serif text-[length:var(--rsp-fs,1.08rem)] leading-[1.7] text-ink-800 whitespace-pre-line break-words';
const SEKTIONS_ORDNUNG: Record<string, number> = { sachverhalt: 0, erwaegung: 1, dispositiv: 2 };

// ── A1: Inline-Kolumnentitel der amtlichen Sammlung dezent herauslösen ────────
// Quell-Artefakt: der laufende Kolumnentitel «BGE 152 I 105 S. 114» der amtlichen
// Wiedergabe steht MITTEN IM SATZ der Erwägungen (B1-Sweep 27.6.: 273 Entscheide,
// in `abschnitte` UND `auszugAbschnitte` — beide laufen durch diesen Body). Der
// bestehende Strip greift nur im Sachverhalt (sachverhalt.ts:entrausche). A1 löst
// den Marker DISPLAY-FIRST (§3, kein Daten-Regen) aus dem Satzfluss und ERHÄLT die
// Seitenzahl als dezenten, hochgestellten Marker (Default F2: zitierfähig, nicht
// gelöscht). Idempotent: ohne Marker zeichenidentisch zu <NormText> — das
// B2-Golden-Tor (VOLL-Body ohne Inline-Seitenmarker) bleibt grün, die 272 DE-BGE
// driften nicht. Regex identisch zur Strip-Regel (sachverhalt.ts:27), Gruppe 1 =
// die zu erhaltende Seitenangabe «S. 114».
const KOLUMNENTITEL = /\bBGE\s+\d+\s+[IVXLCDM]+\s+\d+\s+(S\.\s*\d+)/g;
// Endet der Text DIREKT VOR dem Kolumnentitel auf eine Entscheid-Zitierung
// (BGE-Band oder BGer-Aktenzeichen)? Dann hat die Quelle den laufenden Titel
// MITTEN in eine fremde Zitierung geschoben (Sweep 27.6.: 8 Auszüge, z.B.
// 150_II_379: «(BGE 139 II 134 ‹BGE 150 II 379 S. 384› E. 5.2 …»). Den
// Seiten-Marker dort hochgestellt zu ERHALTEN, hinge ihn als falsche Fundstelle
// an die fremde Zitierung (§1). Erkennungsmuster = RECHTSPRECHUNG_IM_TEXT, am
// Ende verankert.
const ZITAT_AM_ENDE = /(?:BGE\s+\d+\s+(?:III|II|I(?:a|b)?|IV|V)\s+\d+|(?:BGer\s+)?\d[A-Z][._]\d+\/\d{4})\s*$/;

function BodyText({ text }: { text: string }) {
  // matchAll statt stateful exec/lastIndex (react-hooks/immutability: kein Mutieren
  // des Modul-Regex in der Komponente; deterministisch, §2).
  const treffer = [...text.matchAll(KOLUMNENTITEL)];
  if (treffer.length === 0) return <NormText text={text} />;
  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const m of treffer) {
    const vor = text.slice(zuletzt, m.index);
    if (m.index > zuletzt) teile.push(<NormText key={`t${zuletzt}`} text={vor} />);
    // Default F2 (David): Seitenzahl dezent ERHALTEN. Ausnahme (§1 > F2): steht der
    // Marker direkt hinter einer Zitierung, würde er als falsche Fundstelle gelesen —
    // dann den reinen Paginierungs-Marker STILL entfernen (wie im Sachverhalt,
    // sachverhalt.ts:entrausche). Die Seitenzahl bleibt über die amtliche Quelle
    // (massgebliche Fassung) erreichbar, die UI verliert nur das irreführende Artefakt.
    if (!ZITAT_AM_ENDE.test(vor)) {
      // ink-600 (nicht heller): eine hochgestellte, kleine Seitenangabe ist Text →
      // WCAG ≥ 4.5:1 (ink-500 unterschreitet das laut Regeste-Box-Befund); `align-super`
      // + native <sup>-Grösse machen sie optisch dezent, ohne die Lesbarkeit zu opfern.
      teile.push(
        <sup key={`s${m.index}`} className="num mx-0.5 align-super font-normal text-ink-600"
          title="Seitenzahl der amtlichen Sammlung (BGE)">{m[1]}</sup>,
      );
    }
    zuletzt = m.index + m[0].length;
  }
  if (zuletzt < text.length) teile.push(<NormText key={`t${zuletzt}`} text={text.slice(zuletzt)} />);
  return <>{teile}</>;
}

// segmente/ankerFuer/gruppiereErwaegungen kommen aus abschnitte.ts — EINE
// Wahrheit der Erwägungs-Ankerbildung, geteilt mit der Norm-Chip-Fundstellensuche.

export function EntscheidBody({ abschnitte, zitierung, bgeReferenz }: {
  abschnitte: EntscheidAbschnitt[];
  zitierung: string;
  bgeReferenz: string | null;
}) {
  // Kopier-Bestätigung für Screenreader (aria-live): zählt mit hoch, damit auch das
  // wiederholte Kopieren derselben Fundstelle erneut angekündigt wird.
  const [kopiert, setKopiert] = useState<{ text: string; n: number }>({ text: '', n: 0 });
  // Volle Fundstelle einer Erwägung (Pin-Cite): amtlich BGE bzw. übriges Urteil + „E. x.y".
  function pinCite(marke: string): string {
    const e = segmente(marke).join('.');
    const basis = bgeReferenz ? `BGE ${bgeReferenz}` : zitierung;
    return e ? `${basis}, E. ${e}` : basis;
  }
  function kopiere(ev: MouseEvent, zitat: string, anker: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof location !== 'undefined') {
      ev.preventDefault();
      // B-6 (QS-BASIS): Fundstellen-Kopie trägt den Stand-Ausweis (§7 a–d) —
      // Abrufdatum + Permalink. Ein Gerichtsentscheid hat keine Konsolidierung →
      // KEINE «Fassung» (§8, nichts erfunden), nur Abruf + Permalink.
      navigator.clipboard.writeText(zitatMitAusweis(zitat, {
        abruf: heuteIso(new Date()), permalink: `${location.origin}${location.pathname}#${anker}`,
      }))
        .then(() => setKopiert((k) => ({ text: `Fundstelle ${zitat} kopiert`, n: k.n + 1 })))
        .catch(() => {});
      if (typeof history !== 'undefined') history.replaceState(null, '', `#${anker}`);
    }
  }
  function Ziffer({ label, marke, anker, stark }: { label: string; marke: string; anker: string; stark: boolean }) {
    return (
      <a href={`#${anker}`} onClick={(e) => kopiere(e, pinCite(marke), anker)} title={`${pinCite(marke)} — Fundstelle kopieren`}
        className={`mb-1 inline-flex items-baseline no-underline num tabular-nums font-semibold ${stark ? 'text-ink-900 text-base' : 'text-ink-700 text-body-s'}`}>
        {label}
        <span aria-hidden className="ml-1.5 text-brass-600 opacity-0 group-hover:opacity-80 group-focus-within:opacity-80 transition-opacity">§</span>
      </a>
    );
  }

  function Erwaegungen({ bloecke }: { bloecke: EntscheidBlock[] }) {
    const gruppen = gruppiereErwaegungen(bloecke);
    return (
      <div>
        {gruppen.map((g, gi) => {
          // top===0 ⇒ markenlose Erwägungen (unplausibel/kantonal): reiner Fliesstext, kein „E. 0".
          if (g.top === 0) {
            return (
              <div key={`roh-${gi}`} className="space-y-4">
                {g.subs.map((s, i) => <p key={i} className={ABSATZ}><BodyText text={s.block.text} /></p>)}
              </div>
            );
          }
          return (
            <section key={g.top} className="mt-7 pt-5 border-t border-line first:mt-2 first:pt-0 first:border-0">
              <div id={g.kopfAnker} className="group scroll-mt-[7rem]">
                <Ziffer label={`${g.top}.`} marke={`E. ${g.top}`} anker={g.kopfAnker} stark />
                {g.kopf && <p className={`${ABSATZ} mt-1`}><BodyText text={g.kopf.text} /></p>}
              </div>
              {g.subs.map((s, i) => {
                const b = s.block;
                const ein = Math.max(0, (b.tiefe ?? segmente(b.marke).length) - 1); // Tiefe 1 = bündig
                return (
                  <div key={i} id={s.anker} className="group scroll-mt-[7rem] mt-4 border-l border-line/70 pl-4"
                    style={ein > 1 ? { marginLeft: `${(ein - 1)}rem` } : undefined}>
                    {b.marke && <Ziffer label={b.marke.replace(/^E\.\s*/, '')} marke={b.marke} anker={s.anker} stark={false} />}
                    <p className={ABSATZ}><BodyText text={b.text} /></p>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    );
  }

  function Dispositiv({ bloecke }: { bloecke: EntscheidBlock[] }) {
    const nummeriert = bloecke.filter((b) => b.marke);
    const schluss = bloecke.filter((b) => !b.marke);
    if (!nummeriert.length) return <>{bloecke.map((b, i) => <p key={i} className={ABSATZ}><BodyText text={b.text} /></p>)}</>;
    return (
      <>
        <ol className="space-y-3">
          {nummeriert.map((b, i) => (
            <li key={i} className="grid grid-cols-[1.7rem_minmax(0,1fr)] gap-x-2">
              <span className="num tabular-nums font-semibold text-ink-700">{b.marke}</span>
              <p className="font-serif text-[length:var(--rsp-fs,1.08rem)] leading-[1.65] text-ink-800 whitespace-pre-line break-words"><BodyText text={b.text} /></p>
            </li>
          ))}
        </ol>
        {schluss.map((b, i) => (
          <p key={i} className="mt-4 pt-3 border-t border-line/60 text-body-s text-ink-500 whitespace-pre-line break-words">{b.text}</p>
        ))}
      </>
    );
  }

  // Sachverhalt: Buchstaben-Gliederung (A.a/A.b/B.a …) als Label je Absatz. Leere
  // Top-Köpfe (tiefe 1, z.B. „B.") werden ausgeblendet — der Top-Buchstabe steckt
  // schon im Sub-Label (Anzeige-Politur). KEIN Text-Trim mehr: der Block-Text wird
  // unverändert gezeigt (nachlaufende Marker sind bereits im Split abgetrennt, §1).
  function Sachverhalt({ bloecke }: { bloecke: EntscheidBlock[] }) {
    return (
      <div className="space-y-4">
        {bloecke.map((b, i) => {
          // Leere Marker-Blöcke (z.B. «A.»/«B.» im BGE-Sammlungstext, deren Inhalt in
          // den Sub-Punkten A.a/A.b steckt) NIE als hängende Marke rendern — egal welche
          // Tiefe; sonst wirkt der Sachverhalt unsauber unterteilt (Befund David 26.6.).
          if (!b.text.trim()) return null;
          if (!b.marke) {
            if (/^[A-ZÄÖÜ]\.$/.test(b.text.trim())) return null;
            return <p key={i} className={ABSATZ}><BodyText text={b.text} /></p>;
          }
          return (
            <p key={i} className={ABSATZ}>
              <span className="num mr-1.5 font-semibold text-ink-900">{b.marke}</span>
              <BodyText text={b.text} />
            </p>
          );
        })}
      </div>
    );
  }

  function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
    return (
      <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-3">
        <h2 className="lc-overline text-brass-700">{ABSCHNITT_TITEL[a.typ]}</h2>
        {a.typ === 'sachverhalt' && a.vollstaendig === false && (
          <p className="text-micro text-ink-500 -mt-1">Auszug — der vollständige Sachverhalt steht in der amtlichen Fassung (Link unten).</p>
        )}
        {a.typ === 'erwaegung'
          ? <Erwaegungen bloecke={a.bloecke} />
          : a.typ === 'dispositiv'
            ? <Dispositiv bloecke={a.bloecke} />
            : a.typ === 'sachverhalt'
              ? <Sachverhalt bloecke={a.bloecke} />
              : <div className="space-y-4">{a.bloecke.map((b, i) => <p key={i} className={ABSATZ}><BodyText text={b.text} /></p>)}</div>}
      </section>
    );
  }

  if (abschnitte.length === 0) {
    return (
      <div className="lc-notice lc-notice-warn">
        Für diesen Entscheid liegt kein erfasster Text vor — massgeblich ist die amtliche Fassung (Link unten).
      </div>
    );
  }

  const sortiert = [...abschnitte].sort((a, b) => (SEKTIONS_ORDNUNG[a.typ] ?? 9) - (SEKTIONS_ORDNUNG[b.typ] ?? 9));
  const alleBloecke = abschnitte.flatMap((a) => a.bloecke);
  const ohneStruktur = abschnitte.length <= 1 && alleBloecke.length === 1 && !alleBloecke.some((b) => b.marke);
  const hatErw = abschnitte.some((a) => a.typ === 'erwaegung');
  const hatDisp = abschnitte.some((a) => a.typ === 'dispositiv');

  return (
    <div className="rsp-prose space-y-9">
      {/* Kopier-Bestätigung für Screenreader (visuell versteckt) — sonst still (a11y). */}
      <p aria-live="polite" className="sr-only">{kopiert.text}</p>
      {ohneStruktur && (
        <p className="lc-notice text-body-s">
          Strukturierte Gliederung (Sachverhalt / Erwägungen / Dispositiv) nicht verfügbar — der Text wird unverändert wiedergegeben.
        </p>
      )}
      {sortiert.map((a) => <Abschnitt key={a.typ} a={a} />)}
      {hatErw && !hatDisp && (
        <p className="text-micro text-ink-500">Das Urteilsdispositiv ist in dieser Erfassung nicht zuverlässig abgegrenzt — massgeblich ist die amtliche Fassung.</p>
      )}
    </div>
  );
}

import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EntscheidBody } from '../components/rechtsprechung/EntscheidBody';
import { ABSCHNITT_TITEL, abschnittAnker } from '../lib/rechtsprechung/abschnitte';
import { NormText } from '../components/NormText';
import { ladeEntscheidEintrag, ladeEntscheid } from '../lib/rechtsprechung/browse';
import { normalisiereRegeste } from '../lib/rechtsprechung/register';
import { GEBIET_LABEL } from '../lib/normtext/register';
import type { EntscheidSnapshot, EntscheidSprache, Abschnittstyp } from '../lib/rechtsprechung/typen';

// Reader EINES Entscheids (/rechtsprechung/:key). Lädt Manifest-Eintrag → Datei
// → Snapshot; Kopf, sticky Sprung-Navigation, hervorgehobene Regeste,
// EntscheidBody (mit Norm-Verlinkung) und eine Fuss-Provenienz. Reine
// Darstellung (§3) — keine Rechtslogik.

function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

const SPRACH_LABEL: Record<EntscheidSprache, string> = {
  de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch',
};

// Reihenfolge der Sprung-Ziele (amtliche Gliederung); Regeste vorangestellt.
const NAV_TYPEN: Abschnittstyp[] = ['regeste', 'sachverhalt', 'erwaegung', 'dispositiv'];

// Lese-Schriftgrössen (R17, A−/A+); Index 1 = Default (1.08rem).
const FS_STUFEN = [1.0, 1.08, 1.18, 1.3];
function ladeFsIdx(): number {
  try {
    const v = Number(localStorage.getItem('rsp-fs-idx'));
    if (Number.isInteger(v) && v >= 0 && v < FS_STUFEN.length) return v;
  } catch { /* localStorage nicht verfügbar */ }
  return 1;
}

function SprungNavigation({ ziele }: { ziele: { anker: string; label: string }[] }) {
  if (ziele.length === 0) return null;
  return (
    <nav aria-label="Abschnitte" className="sticky top-16 z-[15] -mx-5 sm:-mx-6 px-5 sm:px-6 py-2 bg-paper border-b border-line">
      {/* Mobil: horizontaler Chip-Streifen (scrollbar); Desktop: normale Reihe. */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mb-0.5 pr-5 sm:pr-0 sm:flex-wrap sm:overflow-visible [scrollbar-width:thin]">
        {ziele.map((z) => (
          <a key={z.anker} href={`#${z.anker}`}
            className="lc-chip shrink-0 whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400">
            {z.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function EntscheidLeserInhalt({ schluessel }: { schluessel: string }) {
  const [snap, setSnap] = useState<EntscheidSnapshot | null>(null);
  const [zustand, setZustand] = useState<'laden' | 'fehlt' | 'da'>('laden');
  const [kopiert, setKopiert] = useState(false);
  const [fsIdx, setFsIdx] = useState<number>(ladeFsIdx);
  const setFs = (i: number) => {
    const x = Math.max(0, Math.min(FS_STUFEN.length - 1, i));
    setFsIdx(x);
    try { localStorage.setItem('rsp-fs-idx', String(x)); } catch { /* egal */ }
  };

  useEffect(() => {
    // Zustand startet auf 'laden' (Default); der Wrapper remountet via key={schluessel},
    // daher KEIN synchrones setState hier nötig (react-hooks/set-state-in-effect).
    let lebt = true;
    void ladeEntscheidEintrag(schluessel).then(async (eintrag) => {
      if (!lebt) return;
      if (!eintrag || !eintrag.datei) { setZustand('fehlt'); return; }
      const s = await ladeEntscheid(eintrag.datei);
      if (!lebt) return;
      if (!s) { setZustand('fehlt'); return; }
      setSnap(s);
      setZustand('da');
    });
    return () => { lebt = false; };
  }, [schluessel]);

  // Browser-Tab: Zitierung des Entscheids.
  useEffect(() => {
    if (!snap || typeof document === 'undefined') return;
    document.title = `${snap.zitierung} — LexMetrik`;
  }, [snap]);

  if (zustand === 'fehlt') {
    return (
      <div className="space-y-4">
        <Link to="/rechtsprechung" className="text-body-s text-brass-700">‹ Zur Rechtsprechung</Link>
        <div className="lc-notice lc-notice-warn">
          Dieser Entscheid ist nicht verfügbar. Möglicherweise wurde er noch nicht erfasst.
        </div>
      </div>
    );
  }
  if (zustand === 'laden' || !snap) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
        <p className="text-body-s text-ink-500">Der Entscheid wird abgerufen …</p>
      </div>
    );
  }

  const regesteText = snap.regeste ? normalisiereRegeste(snap.regeste.text) : null;
  // Sprung-Ziele: nur die tatsächlich vorhandenen Abschnitte (+ Regeste, wenn da).
  const vorhandene = new Set<Abschnittstyp>(snap.abschnitte.map((a) => a.typ));
  if (regesteText) vorhandene.add('regeste');
  const navZiele = NAV_TYPEN
    .filter((t) => vorhandene.has(t))
    .map((t) => ({
      anker: t === 'regeste' ? 'abschnitt-regeste' : abschnittAnker(t),
      label: t === 'regeste' && !snap.regesteAmtlich ? 'Zusammenfassung' : ABSCHNITT_TITEL[t],
    }));

  // R12 «Kopieren mit Fundstelle»: Zitierung + Permalink in die Zwischenablage.
  const kopiereZitat = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const url = typeof location !== 'undefined' ? `${location.origin}${location.pathname}` : '';
    navigator.clipboard.writeText(url ? `${snap.zitierung}\n${url}` : snap.zitierung)
      .then(() => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); })
      .catch(() => { /* Clipboard nicht verfügbar */ });
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb (scrollt weg; die Sprung-Navigation ist die sticky Kopfzeile) */}
      <div className="-mx-5 sm:-mx-6 px-5 sm:px-6 py-2 border-b border-line text-xs text-ink-500">
        <Link to="/rechtsprechung" className="hover:text-brass-700">Rechtsprechung</Link>
        <span className="mx-1.5 text-ink-300">›</span>
        {snap.kanton === 'CH' ? 'Bund' : `Kanton ${snap.kanton}`}
        <span className="mx-1.5 text-ink-300">›</span>
        <span className="text-ink-700 font-medium num">{snap.bgeReferenz ?? snap.nummer}</span>
      </div>

      <header className="space-y-2.5 border-b border-line pb-5">
        <p className="lc-overline">
          {snap.gerichtName}
          {snap.abteilung && <span className="text-ink-400"> · {snap.abteilung}</span>}
          <span className="text-brass-700"> · {GEBIET_LABEL[snap.sachgebiet]}</span>
        </p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900 num">{snap.zitierung}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
          <span>Urteil vom <span className="num">{formatiereDatum(snap.datum)}</span></span>
          {snap.bgeReferenz && (
            <>
              <span className="text-ink-300" aria-hidden>·</span>
              <span className="num">{snap.bgeReferenz}</span>
            </>
          )}
          {snap.leitcharakter === 'leitentscheid' && <span className="lc-badge lc-badge-ok">Leitentscheid</span>}
          <span className="lc-badge lc-badge-soft uppercase" title={SPRACH_LABEL[snap.sprache]}>{snap.sprache}</span>
          {snap.kuratierung === 'maschinell' && (
            <span className="lc-badge lc-badge-soft" title="Automatisch erfasst, fachlich noch nicht geprüft">maschinell erfasst</span>
          )}
          <span className="ml-auto inline-flex items-center gap-2">
            {/* R17: Lese-Schriftgrösse */}
            <span className="inline-flex items-stretch rounded border border-line overflow-hidden" role="group" aria-label="Schriftgrösse">
              <button type="button" onClick={() => setFs(fsIdx - 1)} disabled={fsIdx === 0}
                className="px-2 py-0.5 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift kleiner">A−</button>
              <button type="button" onClick={() => setFs(fsIdx + 1)} disabled={fsIdx === FS_STUFEN.length - 1}
                className="px-2 py-0.5 text-ink-600 hover:bg-paper-sunken disabled:opacity-40 border-l border-line" title="Schrift grösser">A+</button>
            </span>
            <button type="button" onClick={kopiereZitat}
              className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"
              title="Zitierung + Link in die Zwischenablage kopieren">
              {kopiert ? '✓ kopiert' : '⧉ Zitat kopieren'}
            </button>
          </span>
        </div>
      </header>

      {/* Rubrum (Art. 112 BGG): Gegenstand / Parteien / Vorinstanz / Besetzung. */}
      {snap.rubrum && (snap.rubrum.gegenstand || snap.rubrum.parteien || snap.rubrum.vorinstanz || snap.rubrum.besetzung) && (
        <section aria-label="Rubrum" className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3">
          <dl className="grid grid-cols-1 sm:grid-cols-[8rem_minmax(0,1fr)] gap-x-4 gap-y-2 text-body-s">
            {snap.rubrum.gegenstand && (<><dt className="lc-overline pt-0.5">Gegenstand</dt><dd className="text-ink-800">{snap.rubrum.gegenstand}</dd></>)}
            {snap.rubrum.parteien && (<><dt className="lc-overline pt-0.5">Parteien</dt><dd className="text-ink-700">{snap.rubrum.parteien}</dd></>)}
            {snap.rubrum.vorinstanz && (<><dt className="lc-overline pt-0.5">Vorinstanz</dt><dd className="text-ink-700">{snap.rubrum.vorinstanz}</dd></>)}
            {snap.rubrum.besetzung && (<><dt className="lc-overline pt-0.5">Besetzung</dt><dd className="text-ink-700">{snap.rubrum.besetzung}</dd></>)}
          </dl>
        </section>
      )}

      <SprungNavigation ziele={navZiele} />

      {/* Regeste nur beim amtlich publizierten BGE; sonst maschinelle Zusammenfassung —
          ehrlich gekennzeichnet (Abnahme-Kritik: kein Etikettenschwindel). */}
      {regesteText && snap.regeste && (
        <section id="abschnitt-regeste" className="scroll-mt-[7rem] lc-highlight space-y-2">
          <p className="lc-overline text-brass-700">{snap.regesteAmtlich ? 'Regeste' : 'Zusammenfassung'}</p>
          <p className="font-serif text-[1.1rem] leading-[1.7] text-ink-900 whitespace-pre-line">{regesteText}</p>
          <p className="text-micro text-ink-500">
            {snap.regesteAmtlich
              ? 'Amtliche Regeste der Sammlung · Quelle: OpenCaseLaw'
              : 'Automatisch erstellte Zusammenfassung — keine amtliche Regeste · Quelle: OpenCaseLaw'}
          </p>
        </section>
      )}

      {/* Lesespalte 60–75 Zeichen (Reglement R1) — schmaler als die amtlichen Anzeigen. */}
      <article className="mx-auto w-full max-w-reading" style={{ '--rsp-fs': `${FS_STUFEN[fsIdx]}rem` } as CSSProperties}>
        <EntscheidBody abschnitte={snap.abschnitte} zitierung={snap.zitierung} bgeReferenz={snap.bgeReferenz} />
      </article>

      {/* Provenienz / Rechtslage (§7/§8) */}
      <footer className="mt-12 border-t border-line pt-5 space-y-3 text-body-s text-ink-500">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <a href={snap.quelleUrl} target="_blank" rel="noopener noreferrer"
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">
            ↗ massgebliche Fassung
          </a>
          <span className="text-ink-400">Daten: OpenCaseLaw</span>
        </div>
        <p className="text-micro text-ink-400 max-w-reading leading-relaxed">
          Der Urteilstext ist als amtliches Werk gemeinfrei (Art. 5 URG). Eine allfällige
          Regeste ist redaktionell. Diese Wiedergabe ersetzt die amtliche Fassung nicht und
          stellt keine Rechtsberatung dar — massgeblich ist stets die amtliche Quelle.
        </p>
        <NormTextHinweis />
      </footer>

      <nav className="border-t border-line pt-5 text-body-s" aria-label="Weitere Entscheide">
        <Link to="/rechtsprechung" className="text-ink-500 hover:text-brass-700">‹ Zur Übersicht</Link>
      </nav>
    </div>
  );
}

// Kleiner Hinweis, dass genannte Bundesnormen im Text verlinkt sind (NormText
// im Body) — über NormText, damit der Verweis selbst auch ein lebender Link ist.
function NormTextHinweis() {
  return (
    <p className="text-micro text-ink-400">
      Im Text genannte Bundesnormen (z. B. <NormText text="Art. 8 ZGB" />) sind direkt mit der Gesetzessammlung verlinkt.
    </p>
  );
}

export function EntscheidLeser() {
  const { key: keyRoh } = useParams<{ key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  return <EntscheidLeserInhalt key={schluessel} schluessel={schluessel} />;
}

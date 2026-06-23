import { useEffect, useState } from 'react';
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

function SprungNavigation({ ziele }: { ziele: { anker: string; label: string }[] }) {
  if (ziele.length === 0) return null;
  return (
    <nav aria-label="Abschnitte" className="sticky top-16 z-[15] -mx-5 sm:-mx-6 px-5 sm:px-6 py-2 bg-paper border-b border-line">
      {/* Mobil: horizontaler Chip-Streifen (scrollbar); Desktop: normale Reihe. */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mb-0.5 sm:flex-wrap sm:overflow-visible [scrollbar-width:thin]">
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
    .map((t) => ({ anker: t === 'regeste' ? 'abschnitt-regeste' : abschnittAnker(t), label: ABSCHNITT_TITEL[t] }));

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
        </div>
      </header>

      <SprungNavigation ziele={navZiele} />

      {/* Regeste (redaktioneller Leitsatz) — hervorgehoben, mit Quellennennung. */}
      {regesteText && snap.regeste && (
        <section id="abschnitt-regeste" className="scroll-mt-[7rem] lc-highlight space-y-2">
          <p className="lc-overline text-brass-700">Regeste</p>
          <p className="font-serif text-[1.1rem] leading-[1.7] text-ink-900 whitespace-pre-line">{regesteText}</p>
          <p className="text-micro text-ink-500">
            Quelle der Regeste: {snap.regeste.quelle === 'opencaselaw' ? 'OpenCaseLaw' : 'entscheidsuche.ch'}
          </p>
        </section>
      )}

      <article className="mx-auto w-full max-w-[56rem]">
        <EntscheidBody abschnitte={snap.abschnitte} />
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

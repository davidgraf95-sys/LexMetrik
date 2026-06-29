import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EntscheidBody } from '../components/rechtsprechung/EntscheidBody';
import { Tabs } from '../components/ui/Tabs';
import { ABSCHNITT_TITEL, abschnittAnker } from '../lib/rechtsprechung/abschnitte';
import { NormText } from '../components/NormText';
import { KontextPanel } from '../components/kontext/KontextPanel';
import { ladeEntscheidEintrag, ladeEntscheid } from '../lib/rechtsprechung/browse';
import { kopfModell, type KopfLabelKey } from '../lib/rechtsprechung/kopf';
import { normalisiereRegeste } from '../lib/rechtsprechung/register';
import { GEBIET_LABEL } from '../lib/normtext/register';
import { usePaneKontext } from '../components/layout/PaneKontext';
import { useMeldeInhaltsKopf } from '../components/layout/InhaltsKopfKontext';
import type { EntscheidSnapshot, EntscheidSprache, Abschnittstyp } from '../lib/rechtsprechung/typen';

// Reader EINES Entscheids (/rechtsprechung/:key). Lädt Manifest-Eintrag → Datei
// → Snapshot; Kopf, sticky Sprung-Navigation, hervorgehobene Regeste,
// EntscheidBody (mit Norm-Verlinkung) und eine Fuss-Provenienz. Reine
// Darstellung (§3) — keine Rechtslogik.

function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

// Manche BGE tragen nur das Bandjahr-Platzhalterdatum (YYYY-01-01) statt eines echten
// Urteilsdatums (ein echtes Urteil datiert nie auf den 1.1. — Feiertag). Diese ehrlich
// als «BGE-Jahrgang» zeigen statt eines fingierten «1.1.» (§8). Sentinel = das
// Platzhalterdatum selbst, NICHT azaUrteil (Bug-Check 26.6.: Auszug-BGE können ein
// echtes Datum tragen trotz fehlendem azaUrteil — die zeigen korrekt «Urteil vom …»).
function istBandjahr(snap: EntscheidSnapshot): boolean {
  return snap.gericht === 'bge' && /-01-01$/.test(snap.datum);
}
// Angezeigter Jahrgang folgt der BGE-Band-Nummer (Band N → Jahr 1874+N), deterministisch
// (§2) — robuster als das Platzhalter-Jahr, das bei OCL gelegentlich um 1 abweicht.
function bgeJahrgang(snap: EntscheidSnapshot): string {
  const band = parseInt(snap.bgeReferenz ?? '', 10);
  return band ? String(band + 1874) : snap.datum.slice(0, 4);
}

const SPRACH_LABEL: Record<EntscheidSprache, string> = {
  de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch',
};

// Rubrum-Beschriftungen je Sprache (zukunftsfest; heute trägt der Korpus nur de,
// fr/it greifen automatisch, sobald solche Entscheide importiert werden). rm → de.
const KOPF_LABEL: Record<EntscheidSprache, Record<KopfLabelKey, string>> = {
  de: { gegenstand: 'Gegenstand', parteien: 'Parteien', vorinstanz: 'Vorinstanz', besetzung: 'Besetzung' },
  fr: { gegenstand: 'Objet', parteien: 'Parties', vorinstanz: 'Autorité précédente', besetzung: 'Composition' },
  it: { gegenstand: 'Oggetto', parteien: 'Parti', vorinstanz: 'Autorità inferiore', besetzung: 'Composizione' },
  rm: { gegenstand: 'Gegenstand', parteien: 'Parteien', vorinstanz: 'Vorinstanz', besetzung: 'Besetzung' },
};

// Ehrlicher Marker, wenn die Thema-Leitzeile abgeleitet ist (keine amtliche Regeste, §8).
const SYNTH_MARKER: Record<EntscheidSprache, string> = {
  de: 'Sachgebiet aus der Aktenstruktur abgeleitet — keine amtliche Regeste vorhanden.',
  fr: 'Domaine déduit de la structure du dossier — aucun regeste officiel disponible.',
  it: 'Ambito dedotto dalla struttura degli atti — nessuna massima ufficiale disponibile.',
  rm: 'Sachgebiet aus der Aktenstruktur abgeleitet — keine amtliche Regeste vorhanden.',
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

// Reine Chip-Reihe (Sprung-Ziele). Der sticky-Rahmen liegt im gemeinsamen
// Kopf-Block (zusammen mit den BGE-Tabs), damit sich nicht zwei sticky-Leisten
// überlagern (Bug-Fix: Sprung-Leiste verdeckte die Tab-Leiste beim Scrollen).
function SprungNavigation({ ziele }: { ziele: { anker: string; label: string }[] }) {
  if (ziele.length === 0) return null;
  return (
    <nav aria-label="Abschnitte">
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

function EntscheidLeserInhalt({ schluessel, ansichtParam }: { schluessel: string; ansichtParam: string | null }) {
  const navigate = useNavigate();
  const { imPane } = usePaneKontext();
  const meldeInhaltsKopf = useMeldeInhaltsKopf();
  const [snap, setSnap] = useState<EntscheidSnapshot | null>(null);
  const [zustand, setZustand] = useState<'laden' | 'fehlt' | 'da'>('laden');
  const [kopiert, setKopiert] = useState(false);
  const [lese, setLese] = useState(false);
  // BGE-Umschalter: 'voll' = vollständiges Urteil (Default), 'auszug' = amtl. BGE-Sammlungstext.
  const [bodyTab, setBodyTab] = useState<'voll' | 'auszug'>('voll');
  const closeLese = useCallback(() => setLese(false), []);
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
      if (!eintrag) { setZustand('fehlt'); return; }
      // Direktaufruf eines Verweis-Keys (vollständiges Urteil zu einem BGE; kein eigener
      // Snapshot, datei=null): auf das Ziel-BGE mit voraktivierter Ansicht weiterleiten
      // statt «nicht verfügbar» zu zeigen — das Ziel ist im Manifest bekannt (§8).
      if (eintrag.verweis && !eintrag.datei) {
        navigate(`/rechtsprechung/${encodeURIComponent(eintrag.verweis.zielKey)}?ansicht=${eintrag.verweis.ansicht}`, { replace: true });
        return;
      }
      if (!eintrag.datei) { setZustand('fehlt'); return; }
      const s = await ladeEntscheid(eintrag.datei);
      if (!lebt) return;
      if (!s) { setZustand('fehlt'); return; }
      setSnap(s);
      setZustand('da');
      // Start-Ansicht GENAU EINMAL festlegen (Lade-Effekt, nicht pro Render →
      // kein Flash, Davids manueller Tab-Wechsel wird nie überschrieben):
      // ?ansicht= aus der Übersicht hat Vorrang, sonst öffnen Leitentscheide mit
      // amtlichem Auszug zuerst den BGE-Auszug, alles andere das volle Urteil.
      const init: 'voll' | 'auszug' =
          ansichtParam === 'voll'   ? 'voll'
        : ansichtParam === 'auszug' ? 'auszug'
        : (s.leitcharakter === 'leitentscheid' && (s.auszugAbschnitte?.length ?? 0) > 0) ? 'auszug'
        : 'voll';
      setBodyTab(init);
    });
    return () => { lebt = false; };
  }, [schluessel, ansichtParam, navigate]);

  // Parität zum Gesetz-Leser: Kopfdaten (Breadcrumb Rechtsprechung › Ebene › Nr)
  // melden — der nächste Provider fängt sie (Einzelansicht → Inhalts-Kopf, Pane →
  // PaneKopf). Ebene nicht klickbar (Übersicht filtert nicht nach Bund/Kanton).
  useEffect(() => {
    if (!snap) return;
    meldeInhaltsKopf({
      breadcrumb: [
        { label: 'Rechtsprechung', to: '/rechtsprechung' },
        { label: snap.kanton === 'CH' ? 'Bund' : `Kanton ${snap.kanton}` },
        { label: snap.bgeReferenz ?? snap.nummer },
      ],
    });
  }, [snap, meldeInhaltsKopf]);
  useEffect(() => () => meldeInhaltsKopf(null), [meldeInhaltsKopf]);

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
  // Einheitlicher Kopf: Modell aus der reinen Regel-Lib (§3) — Komponente rendert nur.
  const kopf = kopfModell(snap);
  const kopfLabel = KOPF_LABEL[snap.sprache];
  // BGE-Umschalter: nur wenn ein separater amtlicher Sammlungs-Auszug vorliegt.
  const hatAuszug = !!snap.auszugAbschnitte && snap.auszugAbschnitte.length > 0;

  // ── EINE Ansicht-Weiche (SSoT) — alles Sichtbare hängt an `ansicht` ────────
  // Der Tab-Umschalter erscheint nur beim BGE mit Volltext; sonst steht die
  // Ansicht fest (BGE ohne Volltext = amtlicher Auszug, alles übrige = Urteil).
  const switcherSichtbar = snap.gericht === 'bge' && hatAuszug;
  const ansicht: 'voll' | 'auszug' = switcherSichtbar ? bodyTab : (snap.gericht === 'bge' ? 'auszug' : 'voll');
  // Rubrum (Art. 112 BGG) gehört zum vollständigen Urteil, nicht zum kuratierten
  // Sammlungs-Auszug. Regeste umgekehrt: prominent im Leitentscheid-Auszug, nicht
  // über dem vollständigen Urteil (David: «bei vollständiges urteil nicht regeste oben»).
  const zeigeRubrum = ansicht === 'voll' && kopf.rubrumZeilen.length > 0;
  const zeigeRegeste = !!regesteText && (ansicht === 'auszug' || snap.gericht !== 'bge');
  // Massgebliche Fassung folgt der Ansicht: Voll → unterliegendes Urteil (aza),
  // Auszug → BGE-Sammlung. Fehlt die Urteils-Quelle, ehrlich markieren statt den
  // BGE als Urteil auszugeben (§8) und auf die BGE-Quelle zurückfallen.
  const massgeblicheUrl = ansicht === 'voll' ? (snap.azaUrteil?.quelleUrl ?? snap.quelleUrl) : snap.quelleUrl;
  // NUR beim BGE-Volltext ohne aufgelöstes aza-Urteil ist die Urteils-Quelle der Fallback
  // (BGE-Sammlung). Kantonale/Nicht-BGE-Entscheide haben quelleUrl = ihr eigenes Urteil →
  // kein «n.v.»-Marker, kein erfundener «BGE-Sammlungs»-Bezug (Bug-Check 26.6., §8).
  const massgeblichFehlt = snap.gericht === 'bge' && ansicht === 'voll' && !snap.azaUrteil?.quelleUrl;
  const massgeblichTitel = massgeblichFehlt
    ? 'Urteils-Quelle nicht verfügbar — dieser Link führt zur amtlichen BGE-Sammlungsquelle'
    : 'Die amtliche, massgebliche Fassung bei der Quelle öffnen';

  // Body folgt der Ansicht (nicht nur dem rohen Tab): im Auszug der amtliche
  // Sammlungstext, sonst das vollständige Urteil.
  const aktiveAbschnitte = ansicht === 'auszug' && hatAuszug ? snap.auszugAbschnitte! : snap.abschnitte;
  // sticky-Höhe als CSS-Variable: zweizeilig (Tabs + Sprung-Chips) bzw. einzeilig
  // (nur Sprung-Chips). Anker-Sektionen verrechnen das als scroll-margin-top.
  // In der Einzelansicht klebt die Leiste UNTER dem Inhalts-Kopf (Topbar 4rem +
  // Kopf 2.25rem); im Pane liegen Topbar/PaneKopf AUSSERHALB des Scroll-Containers
  // → Offset ~0. scroll-margin (--rsp-stick) entsprechend.
  const stickHoehe = imPane
    ? (switcherSichtbar ? '7rem' : '3.5rem')
    : (switcherSichtbar ? '12.75rem' : '9.25rem');
  // Sprung-Ziele: nach dem aktiven Body (+ Regeste, wenn sie gezeigt wird) — passt zur sichtbaren Ansicht.
  const vorhandene = new Set<Abschnittstyp>(aktiveAbschnitte.map((a) => a.typ));
  if (zeigeRegeste) vorhandene.add('regeste');
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
    <div className="space-y-5" style={{ '--rsp-stick': stickHoehe } as CSSProperties}>
      {/* Anker-Sektionen des EntscheidBody tragen ein festes scroll-mt-[7rem]; hier
          auf die tatsächliche sticky-Höhe (--rsp-stick) heben, damit ein angesprungener
          Abschnitt nicht hinter dem gemeinsamen Kopf-Block verschwindet. Greift nur im
          Haupt-Body (.rsp-anker), nicht im Lesemodus-Overlay (eigene schlanke Leiste). */}
      <style>{`.rsp-anker [id]{scroll-margin-top:var(--rsp-stick,7rem)}`}</style>
      {/* Breadcrumb trägt der Kopf (Inhalts-Kopf in der Einzelansicht, PaneKopf im
          Split-View) — kein Inline-Dup mehr (Parität zum Gesetz-Leser). */}
      <header className="space-y-2.5 border-b border-line pb-5">
        {/* 1 Identität (stets): Gericht · Abteilung · Sachgebiet */}
        <p className="lc-overline">
          {snap.gerichtName}
          {snap.abteilung && <span className="text-ink-500"> · {snap.abteilung}</span>}
          <span className="text-brass-700"> · {GEBIET_LABEL[snap.sachgebiet]}</span>
        </p>
        {/* 2 Zitierung = Identitäts-Anker (stets, prominent) */}
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900 num">{snap.zitierung}</h1>

        {/* 3 Abgeleitete Sachgebiets-Leitzeile — nur wenn weder ein Rubrum-Gegenstand
            noch die Regeste-Box das Thema trägt (kopf.ts entscheidet, §3/§5). Nüchtern +
            ehrlicher Marker, dass sie aus der Struktur abgeleitet ist (§8). */}
        {kopf.leitzeile && (
          <div className="space-y-0.5">
            <p className="text-body-s leading-snug text-ink-700">{kopf.leitzeile}</p>
            <p className="text-micro italic text-ink-500">{SYNTH_MARKER[snap.sprache]}</p>
          </div>
        )}

        {/* 4 Rubrum-Zeilen IM Kopf (Art. 112 BGG): nur befüllte Felder, feste Reihenfolge
            Gegenstand→Parteien→Vorinstanz→Besetzung, per Haarlinie abgesetzt (kein Kasten).
            Nur in der Voll-Ansicht — der amtliche BGE-Auszug trägt kein Rubrum. */}
        {zeigeRubrum && (
          <dl className="mt-1 grid grid-cols-1 sm:grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-line/60 pt-3 text-body-s">
            {kopf.rubrumZeilen.map((z) => (
              <div key={z.label} className="contents">
                <dt className="lc-overline pt-0.5">{kopfLabel[z.label]}</dt>
                <dd className={z.label === 'gegenstand' ? 'text-ink-800' : 'text-ink-700'}>{z.wert}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* 5 Meta + Badges + Lese-Steuerung — gedämpfte Schlusszeile */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
          {istBandjahr(snap)
            ? <span>BGE-Jahrgang <span className="num">{bgeJahrgang(snap)}</span></span>
            : <span>Urteil vom <span className="num">{formatiereDatum(snap.datum)}</span></span>}
          {snap.bgeReferenz && (
            <>
              <span className="text-ink-300" aria-hidden>·</span>
              <span className="num">{snap.bgeReferenz}</span>
            </>
          )}
          {snap.leitcharakter === 'leitentscheid' && <span className="lc-badge lc-badge-ok">Leitentscheid (BGE)</span>}
          <span className="lc-badge lc-badge-soft uppercase" title={SPRACH_LABEL[snap.sprache]}>{snap.sprache}</span>
          {snap.kuratierung === 'maschinell' && (
            <span className="lc-badge lc-badge-soft" title="Automatisch erfasst, fachlich noch nicht geprüft">maschinell erfasst</span>
          )}
          <span className="ml-auto inline-flex items-center gap-2">
            {/* Amtliche Quelle direkt oben erreichbar (massgebliche Fassung, §8) —
                folgt der Ansicht (Voll → Urteil/aza, Auszug → BGE-Sammlung). */}
            <a href={massgeblicheUrl} target="_blank" rel="noopener noreferrer"
              className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"
              title={massgeblichTitel}>
              ↗ massgebliche Fassung{massgeblichFehlt && <span className="text-ink-500"> (Urteil n. v.)</span>}
            </a>
            {/* R17: Lese-Schriftgrösse */}
            <span className="inline-flex items-stretch rounded border border-line overflow-hidden" role="group" aria-label="Schriftgrösse">
              <button type="button" onClick={() => setFs(fsIdx - 1)} disabled={fsIdx === 0}
                className="min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift kleiner">A−</button>
              <button type="button" onClick={() => setFs(fsIdx + 1)} disabled={fsIdx === FS_STUFEN.length - 1}
                className="min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40 border-l border-line" title="Schrift grösser">A+</button>
            </span>
            <button type="button" onClick={kopiereZitat}
              className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"
              title="Zitierung + Link in die Zwischenablage kopieren">
              {kopiert ? '✓ kopiert' : '⧉ Zitat kopieren'}
            </button>
            <button type="button" onClick={() => setLese(true)}
              className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"
              title="Ablenkungsfreier Lesemodus">
              ▭ Lesemodus
            </button>
          </span>
        </div>
      </header>

      {/* Gemeinsamer sticky Kopf-Block (§13-Bug-Fix: EIN sticky-Element statt zweier
          sich überlagernder). Oben — beim BGE mit Volltext — der Fassungs-Umschalter
          (§8: «Amtlicher BGE-Auszug» ⟷ «Vollständiges Urteil»), darunter die Sprung-Chips.
          Die App-Topbar liegt mit z-20 darüber, dieser Block mit z-[15] darunter. */}
      {(switcherSichtbar || navZiele.length > 0) && (
        <div style={{ top: imPane ? '0.5rem' : 'calc(4rem + 2.25rem)' }}
          className="sticky z-[15] -mx-5 sm:-mx-6 px-5 sm:px-6 py-2 bg-paper border-b border-line space-y-2">
          {switcherSichtbar && (
            <Tabs
              items={[
                { code: 'auszug', label: 'Amtlicher BGE-Auszug' },
                { code: 'voll', label: <>Vollständiges Urteil{snap.azaUrteil && <span className="num"> · {snap.azaUrteil.aktenzeichen}</span>}</> },
              ]}
              value={bodyTab}
              onChange={setBodyTab}
              mode="tab"
              ariaLabel="Textfassung des Entscheids"
            />
          )}
          <SprungNavigation ziele={navZiele} />
        </div>
      )}

      {/* Einordnung der gewählten Fassung (nicht sticky), gekoppelt an die Ansicht. */}
      {switcherSichtbar && (
        <p className="text-micro text-ink-500 max-w-reading">
          {ansicht === 'voll'
            ? <>Das vollständige unterliegende Urteil <span className="num">{snap.azaUrteil?.aktenzeichen}</span> — Grundlage der amtlichen Sammlung BGE <span className="num">{snap.bgeReferenz}</span>.</>
            : <>Der amtlich publizierte Auszug der Sammlung BGE <span className="num">{snap.bgeReferenz}</span> — vom Gericht kuratiert.</>}
        </p>
      )}

      {/* BGE ohne aufgelösten Volltext: nur der Sammlungs-Auszug + Live-Link (§8). */}
      {snap.gericht === 'bge' && !hatAuszug && (
        <p className="text-micro text-ink-500 max-w-reading">
          Auszug aus der amtlichen Sammlung (BGE <span className="num">{snap.bgeReferenz}</span>). Das vollständige Urteil ist bei der Quelle verfügbar (↗ massgebliche Fassung oben).
        </p>
      )}

      {/* Regeste prominent im Leitentscheid-Auszug (zeigeRegeste). Beim amtlich
          publizierten BGE «Regeste», sonst maschinelle «Zusammenfassung» — ehrlich
          gekennzeichnet (Abnahme-Kritik: kein Etikettenschwindel). */}
      {zeigeRegeste && snap.regeste && (
        <section id="abschnitt-regeste" className="scroll-mt-[var(--rsp-stick,7rem)] lc-highlight space-y-2">
          <p className="lc-overline text-brass-700">{snap.regesteAmtlich ? 'Regeste' : 'Zusammenfassung'}</p>
          <p className="font-serif text-body-l leading-[1.7] text-ink-900 whitespace-pre-line">{regesteText}</p>
          {/* ink-600 (nicht ink-500): die Regeste-Box (lc-highlight) hat brass-100-
              Grund — ink-500 = 4.23:1 bei 11px (axe serious), ink-600 ≥ 6:1. */}
          <p className="text-micro text-ink-600">
            {snap.regesteAmtlich
              ? 'Amtliche Regeste der Sammlung · Quelle: OpenCaseLaw'
              : 'Quelle: OpenCaseLaw — automatisch übernommen; Herkunft (amtliche Regeste oder maschinelle Zusammenfassung) nicht abschliessend geprüft'}
          </p>
        </section>
      )}

      {/* Lesespalte 60–75 Zeichen (Reglement R1). Bei offenem Lesemodus NICHT rendern —
          der Overlay zeigt denselben EntscheidBody; doppelte Abschnitts-`id` wären
          ungültiges HTML + bräche Anker-Sprünge. */}
      {!lese && (
        <article className="rsp-anker mx-auto w-full max-w-reading" style={{ '--rsp-fs': `${FS_STUFEN[fsIdx]}rem` } as CSSProperties}>
          <EntscheidBody abschnitte={aktiveAbschnitte} zitierung={snap.zitierung} bgeReferenz={snap.bgeReferenz} />
        </article>
      )}

      {/* Provenienz / Rechtslage (§7/§8) */}
      <footer className="mt-12 border-t border-line pt-5 space-y-3 text-body-s text-ink-500">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <a href={massgeblicheUrl} target="_blank" rel="noopener noreferrer"
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400"
            title={massgeblichTitel}>
            ↗ massgebliche Fassung{massgeblichFehlt && <span className="text-ink-500"> (Urteil n. v.)</span>}
          </a>
          <span className="text-ink-500">Daten: OpenCaseLaw</span>
        </div>
        <p className="text-micro text-ink-500 max-w-reading leading-relaxed">
          Der Urteilstext ist als amtliches Werk gemeinfrei (Art. 5 URG). Eine allfällige
          Regeste ist redaktionell. Diese Wiedergabe ersetzt die amtliche Fassung nicht und
          stellt keine Rechtsberatung dar — massgeblich ist stets die amtliche Quelle.
        </p>
        <NormTextHinweis />
      </footer>

      {/* Einheitliches Kontext-Panel (B3): vom Entscheid zu den angewandten
          Normen, der Behördenpraxis (Materialien) und den passenden Werkzeugen —
          über die angewandten normKeys des Entscheids. */}
      <KontextPanel typ="entscheid" normKeys={snap.normKeys} />

      <nav className="border-t border-line pt-5 text-body-s" aria-label="Weitere Entscheide">
        <Link to="/rechtsprechung" className="text-ink-500 hover:text-brass-700">‹ Zur Übersicht</Link>
      </nav>

      {lese && (
        <LesemodusOverlay snap={snap} abschnitte={aktiveAbschnitte}
          regesteText={zeigeRegeste ? regesteText : null}
          massgeblicheUrl={massgeblicheUrl} massgeblichTitel={massgeblichTitel} massgeblichFehlt={massgeblichFehlt}
          fsIdx={fsIdx} setFs={setFs} onClose={closeLese} />
      )}
    </div>
  );
}

// ── Lesemodus: ablenkungsfreies Vollbild-Overlay ────────────────────────────
// Zeigt NUR den Entscheid in einer ruhigen Lesespalte (grosse Serif, viel
// Weissraum), blendet die App-Shell aus. Wiederverwendung des EntscheidBody +
// der Regeste (keine Duplizierung der Rechtsdarstellung, §3/§5). Provenienz/
// massgebliche Fassung bleibt sichtbar (§8). ESC schliesst, Body-Scroll gesperrt.
function LesemodusOverlay({ snap, abschnitte, regesteText, massgeblicheUrl, massgeblichTitel, massgeblichFehlt, fsIdx, setFs, onClose }: {
  snap: EntscheidSnapshot;
  abschnitte: EntscheidSnapshot['abschnitte'];
  // Bereits an der Ansicht ausgerichtet (null = im vollständigen Urteil keine Regeste oben);
  // kein Fassungs-Desync zwischen Hauptspalte und Lesemodus.
  regesteText: string | null;
  massgeblicheUrl: string;
  massgeblichTitel: string;
  massgeblichFehlt: boolean;
  fsIdx: number;
  setFs: (i: number) => void;
  onClose: () => void;
}) {
  const schliessRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const vorigerFokus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      // Fokus-Falle: Tab bleibt im Dialog (a11y, aria-modal).
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (f.length === 0) return;
        const erst = f[0], letzt = f[f.length - 1];
        if (e.shiftKey && document.activeElement === erst) { e.preventDefault(); letzt.focus(); }
        else if (!e.shiftKey && document.activeElement === letzt) { e.preventDefault(); erst.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    schliessRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = vorher;
      vorigerFokus?.focus?.();   // Fokus zum Auslöser zurück
    };
  }, [onClose]);

  // Per Portal an <body>: sonst fängt ein `@container/pane`-Vorfahr (Split-View)
  // das `position:fixed`-Overlay ein und der Lesemodus wäre nicht mehr vollflächig
  // (B-1-Bugcheck #7). Default geschlossen → kein SSR/Prerender-Pfad.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Lesemodus — ${snap.zitierung}`}
      className="fixed inset-0 z-50 overflow-y-auto bg-paper">
      {/* schlanke, sticky Kopfleiste: Identität + Schriftgrösse + Schliessen */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-paper/95 px-5 py-2.5 backdrop-blur-sm">
        <span className="num text-body-s font-medium text-ink-700">{snap.bgeReferenz ?? snap.zitierung}</span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="inline-flex items-stretch overflow-hidden rounded border border-line" role="group" aria-label="Schriftgrösse">
            <button type="button" onClick={() => setFs(fsIdx - 1)} disabled={fsIdx === 0}
              className="min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift kleiner">A−</button>
            <button type="button" onClick={() => setFs(fsIdx + 1)} disabled={fsIdx === FS_STUFEN.length - 1}
              className="border-l border-line min-h-6 px-2 py-1 text-ink-600 hover:bg-paper-sunken disabled:opacity-40" title="Schrift grösser">A+</button>
          </span>
          <button ref={schliessRef} type="button" onClick={onClose}
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400" title="Lesemodus schliessen (Esc)">
            ✕ schliessen
          </button>
        </span>
      </div>

      <article className="mx-auto w-full max-w-reading px-5 py-10 sm:py-14"
        style={{ '--rsp-fs': `${FS_STUFEN[fsIdx]}rem` } as CSSProperties}>
        <p className="lc-overline">
          {snap.gerichtName}
          {snap.abteilung && <span className="text-ink-500"> · {snap.abteilung}</span>}
          <span className="text-brass-700"> · {GEBIET_LABEL[snap.sachgebiet]}</span>
        </p>
        <h1 className="mt-2 text-h2 sm:text-h1 font-display font-semibold text-ink-900 num">{snap.zitierung}</h1>
        <p className="mt-1 text-xs text-ink-500">
          {istBandjahr(snap)
            ? <>BGE-Jahrgang <span className="num">{bgeJahrgang(snap)}</span></>
            : <>Urteil vom <span className="num">{formatiereDatum(snap.datum)}</span></>}
          {snap.bgeReferenz && <> · <span className="num">{snap.bgeReferenz}</span></>}
        </p>

        {regesteText && snap.regeste && (
          <section className="lc-highlight mt-7 space-y-2">
            <p className="lc-overline text-brass-700">{snap.regesteAmtlich ? 'Regeste' : 'Zusammenfassung'}</p>
            <p className="font-serif text-body-l leading-[1.7] text-ink-900 whitespace-pre-line">{regesteText}</p>
          </section>
        )}

        <div className="mt-9">
          <EntscheidBody abschnitte={abschnitte} zitierung={snap.zitierung} bgeReferenz={snap.bgeReferenz} />
        </div>

        <footer className="mt-12 border-t border-line pt-5 text-body-s text-ink-500">
          <a href={massgeblicheUrl} target="_blank" rel="noopener noreferrer" title={massgeblichTitel}
            className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">↗ massgebliche Fassung{massgeblichFehlt && <span className="text-ink-500"> (Urteil n. v.)</span>}</a>
          <p className="mt-3 text-micro text-ink-500 leading-relaxed">
            Der Urteilstext ist als amtliches Werk gemeinfrei (Art. 5 URG); massgeblich ist stets die amtliche Quelle. Keine Rechtsberatung.
          </p>
        </footer>
      </article>
    </div>,
    document.body,
  );
}

// Kleiner Hinweis, dass genannte Bundesnormen im Text verlinkt sind (NormText
// im Body) — über NormText, damit der Verweis selbst auch ein lebender Link ist.
function NormTextHinweis() {
  return (
    <p className="text-micro text-ink-500">
      Im Text genannte Bundesnormen (z. B. <NormText text="Art. 8 ZGB" />) sind direkt mit der Gesetzessammlung verlinkt.
    </p>
  );
}

export function EntscheidLeser() {
  const { key: keyRoh } = useParams<{ key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  // Übersicht→Detail-Brücke: ?ansicht=voll|auszug wählt die Start-Fassung.
  const [sp] = useSearchParams();
  const ansichtParam = sp.get('ansicht');
  return <EntscheidLeserInhalt key={schluessel} schluessel={schluessel} ansichtParam={ansichtParam} />;
}

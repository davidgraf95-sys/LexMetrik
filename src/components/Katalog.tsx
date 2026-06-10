import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RECHTSGEBIETE, istVerfuegbar, istAktiv, type CalculatorCard } from '../lib/startseiteConfig';
import { OBERKATEGORIEN, kategorieFuer, type Oberkategorie, type OberkategorieId } from '../lib/oberkategorien';
import { praxisRang, kachelDirektlinks } from '../lib/praxisRang';
import { FRISTEN_HAUPTEINSTIEGE, FRISTEN_FACH_DIREKTEINSTIEGE, FRISTEN_EIGENE_REGIMES, fristenEinstiegArt } from '../lib/fristenKategorie';
import { kartePasst, sucheRang } from '../lib/katalogSuche';
import { sansAmp } from './typografie';

// Katalog der Hauptseite «/» — NEU STRUKTURIERT (Auftrag David 10.6.2026):
// Vier OBERKATEGORIEN als Primärachse (Zuständigkeiten · Fristen ·
// Gebühren & Beträge · Vorlagen), römisch nummerierte Registerteile wie die
// Hauptabschnitte eines Kanzlei-Handbuchs. Praxistauglichkeits-Leitsätze:
//  1. AUFGABENDENKEN: Die Kanzlei kommt mit einer Aufgabe («wer ist
//     zuständig?», «wann läuft die Frist ab?», «was kostet es?», «ich
//     brauche ein Schreiben») — die Startseite zeigt NUR die vier
//     Kategorien als Deckblatt (Präzisierung David 10.6.2026); die
//     Unterthemen erscheinen erst beim Klick als eigene Ansicht
//     (?kategorie=, teilbar, Zurück-Taste funktioniert).
//  2. KLICKTIEFE 1: Verfügbare Werkzeuge stehen DIREKT als Link-Zeilen in
//     ihrer Kategorie (vorher Gebiets-Kachel → Panel → Karte).
//  3. PRAXIS-RANG STATT GEBIETS-GRUPPEN (Versimplung, Auftrag David
//     10.6.2026 «teile das UI weiter nach dem Praxis-Gebrauch auf»):
//     je Kategorie EINE flache Liste, Alltags-Werkzeuge zuoberst
//     (lib/praxisRang.ts, kuratiert aus der Abdeckungskarte); das
//     Rechtsgebiet steht als dezentes Sub-Label IN der Zeile.
//  4. EHRLICH OHNE BALLAST (§8): Geplante Karten je Kategorie hinter einer
//     kompakten «In Vorbereitung (N)»-Aufklappzeile; Entwurf-Badges an
//     jeder Zeile.
//  5. SUBTRAKTION: Die separate «Häufig gebraucht»-Rubrik ist aufgegangen
//     in den Top-DIREKTLINKS der vier Einstiegskacheln (gleiche Funktion,
//     ein Apparat weniger); Header-Suche (?q=) unverändert.
// Die Suche-Mechanik (lib/katalogSuche.ts, Goldliste) ist unverändert (§5).

const KATEGORIE_VON = new Map<string, OberkategorieId>();
const kategorieVon = (k: CalculatorCard): OberkategorieId => {
  if (!KATEGORIE_VON.has(k.id)) KATEGORIE_VON.set(k.id, kategorieFuer(k) ?? 'vorlagen');
  return KATEGORIE_VON.get(k.id)!;
};
const KATEGORIE_TITEL = new Map(OBERKATEGORIEN.map((k) => [k.id, k.titel]));

// ─── Einstiegskachel: eine der vier Aufgaben-Fragen, springt zur Sektion ────

function KategorieEinstieg({ kat, karten, onOeffnen }: {
  kat: Oberkategorie; karten: CalculatorCard[]; onOeffnen: () => void;
}) {
  const verf = karten.filter(istVerfuegbar).length;
  const geplant = karten.length - verf;
  const links = kachelDirektlinks(kat.id, karten);
  return (
    <div className="relative group lc-card p-5 sm:p-6 flex flex-col gap-2 min-w-0 bg-surface transition-all motion-reduce:transition-none motion-reduce:transform-none hover:shadow-lg hover:-translate-y-0.5">
      {/* Gestreckter Klickbereich: die GANZE Kachel öffnet die Kategorie
          (Auftrag David 10.6.2026 — vorher war nur die Titelzeile ein
          Button); Muster RechnerKarte. Die Direktlinks darunter liegen als
          positionierte Elemente später im DOM und bleiben klickbar. */}
      <button type="button" onClick={onOeffnen} aria-label={`${kat.titel} öffnen`}
        className="absolute inset-0 rounded-lg cursor-pointer" />
      <span className="flex items-baseline gap-3 text-left">
        <span aria-hidden className="font-display text-h2 leading-none text-brass-700">{kat.numeral}</span>
        <span className="font-sans font-semibold text-ink-900 text-h3 leading-snug group-hover:text-brass-700 transition-colors">{kat.titel}</span>
        <span aria-hidden className="ml-auto text-ink-400 group-hover:text-brass-700 transition-colors">▸</span>
      </span>
      <span className="lc-overline text-ink-500">
        <span className="num text-brass-700">{verf}</span> verfügbar
        {geplant > 0 && <> · <span className="num">{geplant}</span> in Vorbereitung</>}
      </span>
      <span className="text-body-s text-ink-500 leading-relaxed">{kat.lede}</span>
      {/* Top-Direktlinks: der «Häufig gebraucht»-Schnellzugriff — ein Klick
          ins Alltags-Werkzeug, ohne die Kategorie zu öffnen. */}
      {links.length > 0 && (
        <span className="relative flex flex-col gap-1 pt-2 border-t border-line mt-1">
          {links.map((k) => (
            <Link key={k.id} to={k.href!}
              className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline truncate self-start max-w-full">
              {sansAmp(k.title)} <span aria-hidden>→</span>
            </Link>
          ))}
        </span>
      )}
    </div>
  );
}

// ─── Werkzeug-Zeile: Direktlink (Klicktiefe 1); Status ehrlich als Badge ────

function WerkzeugZeile({ k, subLabel }: { k: CalculatorCard; subLabel?: string }) {
  const aktiv = istAktiv(k.status) && !!k.href;
  const inhalt = (
    <>
      <span className="min-w-0">
        <span className="block font-sans font-medium text-ink-900 text-body-s leading-snug">{sansAmp(k.title)}</span>
        {subLabel && <span className="block text-xs text-ink-500 truncate">{sansAmp(subLabel)}</span>}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {k.status === 'entwurf' && (
          <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>
        )}
        <span aria-hidden className="text-brass-700 leading-none">→</span>
      </span>
    </>
  );
  const klasse = 'lc-card text-left px-4 py-3 flex items-center justify-between gap-3 min-w-0 bg-surface no-underline transition-all motion-reduce:transition-none motion-reduce:transform-none';
  return aktiv ? (
    <Link to={k.href!} className={`${klasse} hover:shadow-lg hover:-translate-y-0.5`}>{inhalt}</Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

// ─── Fristen-Register (FE-1, FAHRPLAN-FRISTEN-EINHEIT) ──────────────────────
//
// EIN «Fristen berechnen»-Einstieg: zwei grosse Haupteinstiege (Tagerechner
// mit Regime-Untertiteln + Fristenspiegel), darunter die Spezialrechner als
// «Eigenes Regime»-Zeilen mit Ein-Satz-WARUM; zpo-/schkg-fristen als
// gekennzeichnete Fach-Direkteinstiege (Doppelpfad gewollt). Daten/Texte:
// lib/fristenKategorie.ts (fachliche Aussagen, Abnahme David offen).

function FristenHauptKarte({ k, untertitel }: { k: CalculatorCard; untertitel: string }) {
  return (
    <Link to={k.href!}
      className="lc-card p-5 sm:p-6 flex flex-col gap-2 min-w-0 bg-surface no-underline transition-all motion-reduce:transition-none motion-reduce:transform-none hover:shadow-lg hover:-translate-y-0.5 group">
      <span className="flex items-baseline gap-3">
        <span className="font-sans font-semibold text-ink-900 text-h3 leading-snug group-hover:text-brass-700 transition-colors">{sansAmp(k.title)}</span>
        <span aria-hidden className="ml-auto text-brass-700 leading-none">→</span>
      </span>
      <span className="text-body-s text-ink-600 leading-relaxed">{untertitel}</span>
      {k.status === 'entwurf' && (
        <span><span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span></span>
      )}
    </Link>
  );
}

function FristenRegimeZeile({ k, warum }: { k: CalculatorCard; warum?: string }) {
  const aktiv = istAktiv(k.status) && !!k.href;
  const inhalt = (
    <>
      <span className="min-w-0">
        <span className="block font-sans font-medium text-ink-900 text-body-s leading-snug">{sansAmp(k.title)}</span>
        {/* WARUM-eigen-Satz darf umbrechen (kein truncate — der Satz IST die Information) */}
        <span className="block text-xs text-ink-500 leading-snug">{warum ?? k.rechtsgebiet}</span>
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {k.status === 'entwurf' && (
          <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>
        )}
        <span aria-hidden className="text-brass-700 leading-none">→</span>
      </span>
    </>
  );
  const klasse = 'lc-card text-left px-4 py-3 flex items-center justify-between gap-3 min-w-0 bg-surface no-underline transition-all motion-reduce:transition-none motion-reduce:transform-none';
  return aktiv ? (
    <Link to={k.href!} className={`${klasse} hover:shadow-lg hover:-translate-y-0.5`}>{inhalt}</Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

function FristenRegister({ karten }: { karten: CalculatorCard[] }) {
  const byId = new Map(karten.map((k) => [k.id, k]));
  const haupt = FRISTEN_HAUPTEINSTIEGE
    .map((h) => ({ ...h, k: byId.get(h.id) }))
    .filter((h): h is typeof h & { k: CalculatorCard } => !!h.k && istVerfuegbar(h.k) && !!h.k.href);
  const fach = FRISTEN_FACH_DIREKTEINSTIEGE
    .map((id) => byId.get(id))
    .filter((k): k is CalculatorCard => !!k && istVerfuegbar(k) && !!k.href);
  const regimes = FRISTEN_EIGENE_REGIMES
    .map((r) => ({ ...r, k: byId.get(r.id) }))
    .filter((r): r is typeof r & { k: CalculatorCard } => !!r.k && istVerfuegbar(r.k));
  // Ehrlicher Fallback: verfügbare Fristen-Karten ohne FE-1-Zuordnung
  // erscheinen als Regime-Zeile ohne WARUM-Satz (der Test bricht zusätzlich).
  const unzugeordnet = karten.filter((k) => istVerfuegbar(k) && fristenEinstiegArt(k.id) === null);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="lc-overline text-brass-700">Fristen berechnen</h3>
          <span aria-hidden className="flex-1 h-px bg-line" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {haupt.map((h) => <FristenHauptKarte key={h.id} k={h.k} untertitel={h.untertitel} />)}
        </div>
        {fach.length > 0 && (
          <p className="text-body-s text-ink-500">
            Fach-Direkteinstieg (derselbe Rechner, direkt im Regime geöffnet):{' '}
            {fach.map((k, i) => (
              <span key={k.id} className="whitespace-nowrap">
                {i > 0 && <span aria-hidden> · </span>}
                <Link to={k.href!} className="font-medium text-brass-700 hover:text-brass-600 no-underline">
                  {sansAmp(k.title)} <span aria-hidden>→</span>
                </Link>
              </span>
            ))}
          </p>
        )}
      </div>

      {(regimes.length > 0 || unzugeordnet.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="lc-overline text-ink-500">Eigenes Regime – Spezialrechner</h3>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>
          <p className="text-body-s text-ink-500 max-w-reading">
            Diese Fristen folgen eigenen Regeln und haben darum einen eigenen Rechner –
            der Grund steht an jeder Zeile.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
            {regimes.map((r) => <FristenRegimeZeile key={r.id} k={r.k} warum={r.warum} />)}
            {unzugeordnet.map((k) => <FristenRegimeZeile key={k.id} k={k} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Registerteil: eine Oberkategorie mit Gebiets-Gruppen + Geplant-Zeile ───

function KategorieSektion({ kat, karten, onZurueck }: { kat: Oberkategorie; karten: CalculatorCard[]; onZurueck: () => void }) {
  // Übersichtlichkeits-Politur (Auftrag David 10.6.2026): ZWEI ruhige
  // Gebrauchs-Ebenen statt einer Mischliste — «Alltag» (Praxis-Rang 1)
  // zuoberst, «Weitere Werkzeuge» darunter; innerhalb der Ebene die feste
  // Gebiets-Reihenfolge, Rechtsgebiet als Sub-Label in der Zeile.
  const gebietsRang = (g: string) => { const i = RECHTSGEBIETE.indexOf(g); return i === -1 ? RECHTSGEBIETE.length : i; };
  const sortiert = (xs: CalculatorCard[]) => [...xs].sort((a, b) =>
    gebietsRang(a.rechtsgebiet) - gebietsRang(b.rechtsgebiet) ||
    a.title.localeCompare(b.title, 'de'));
  const verfuegbarAlle = karten.filter(istVerfuegbar);
  const alltag = sortiert(verfuegbarAlle.filter((k) => praxisRang(k.id) === 1));
  const weitere = sortiert(verfuegbarAlle.filter((k) => praxisRang(k.id) !== 1));
  const verfuegbar = [...alltag, ...weitere];
  const geplant = karten.filter((k) => !istVerfuegbar(k));

  return (
    <section id={`register-${kat.id}`} aria-labelledby={`register-titel-${kat.id}`} className="space-y-4 scroll-mt-28">
      <div className="space-y-1.5 pt-2">
        <button type="button" onClick={onZurueck}
          className="text-body-s font-medium text-ink-500 hover:text-brass-700 transition-colors">
          ← Alle Kategorien
        </button>
        <div className="flex items-baseline gap-4">
          <h2 id={`register-titel-${kat.id}`} className="flex items-baseline gap-2.5 whitespace-nowrap">
            <span aria-hidden className="font-display text-h3 leading-none text-brass-700">{kat.numeral}</span>
            <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{kat.titel}</span>
          </h2>
          <span aria-hidden className="flex-1 h-px bg-line" />
          <span className="lc-overline num text-ink-500 whitespace-nowrap">
            <span className="text-brass-700">{verfuegbar.length}</span> verfügbar
          </span>
        </div>
        <p className="text-body-s text-ink-500 max-w-reading">{kat.lede}</p>
      </div>

      {kat.id === 'fristen' ? (
        /* FE-1 (FAHRPLAN-FRISTEN-EINHEIT): EIN Einstieg + Regime-Abzweigungen
           statt der Alltag/Weitere-Mischliste. */
        <FristenRegister karten={karten} />
      ) : (
        <>
          {alltag.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="lc-overline text-brass-700">Alltag</h3>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
                {alltag.map((k) => <WerkzeugZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
              </div>
            </div>
          )}
          {weitere.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="lc-overline text-ink-500">{alltag.length > 0 ? 'Weitere Werkzeuge' : 'Werkzeuge'} <span className="num">({weitere.length})</span></h3>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
                {weitere.map((k) => <WerkzeugZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
              </div>
            </div>
          )}
        </>
      )}

      {geplant.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-body-s text-ink-500 hover:text-brass-700 transition-colors select-none">
            <span aria-hidden className="inline-block mr-1.5 transition-transform group-open:rotate-90">▸</span>
            In Vorbereitung <span className="num">({geplant.length})</span>
          </summary>
          <p className="text-body-s text-ink-500 leading-relaxed pt-2 pl-4">
            {geplant.map((k, i) => (
              <span key={k.id}>
                {i > 0 && <span aria-hidden> · </span>}
                {sansAmp(k.title)}
              </span>
            ))}
          </p>
        </details>
      )}
    </section>
  );
}

// ─── Treffer-Zeile der flachen Suchergebnis-Liste (mit Kategorie-Label) ─────

function TrefferZeile({ k }: { k: CalculatorCard }) {
  const aktiv = istAktiv(k.status) && !!k.href;
  const inhalt = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-sans font-medium text-ink-900 text-body-l leading-snug">{sansAmp(k.title)}</span>
        {/* EIN Template-Literal: SSR setzt sonst Kommentar-Marker zwischen
            die Segmente (Lektion 7.6.2026) */}
        <span className="block text-body-s text-ink-500 truncate">
          {`${KATEGORIE_TITEL.get(kategorieVon(k))} · ${k.rechtsgebiet}`}
        </span>
      </span>
      <span className="flex items-center gap-3 shrink-0">
        {k.status === 'entwurf' && <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>}
        {k.status === 'geplant' && <span className="lc-badge lc-badge-soft">In Vorbereitung</span>}
        {aktiv && <span className="text-body-s font-medium text-brass-700 whitespace-nowrap">{k.modus === 'vorlage' ? 'Erstellen →' : 'Öffnen →'}</span>}
      </span>
    </>
  );
  const klasse = 'flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-line bg-surface no-underline';
  return aktiv ? (
    <Link to={k.href!}
      className={`${klasse} hover:border-brass-400 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none`}>
      {inhalt}
    </Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

// ─── Katalog: vier Registerteile + Trefferliste bei ?q= ─────────────────────

export function Katalog({ karten }: { karten: CalculatorCard[] }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Suche kommt aus der URL (?q=, geschrieben von der Header-Suche).
  const suche = searchParams.get('q') ?? '';
  const sucheZuruecksetzen = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('q');
    setSearchParams(p, { replace: true });
  };

  // Ansichts-Weiche (Präzisierung David 10.6.2026): ?kategorie=<id> öffnet
  // die Unterthemen-Ansicht; ohne Parameter zeigt die Seite NUR das
  // Vier-Kategorien-Deckblatt. Teilbar, Zurück-Taste funktioniert.
  const offenId = searchParams.get('kategorie');
  const offen = OBERKATEGORIEN.find((k) => k.id === offenId) ?? null;
  const oeffnen = (id: OberkategorieId | null) => {
    const p = new URLSearchParams(searchParams);
    if (id === null) p.delete('kategorie'); else p.set('kategorie', id);
    setSearchParams(p);
  };

  // Link-Erbe: Alte ?gebiet=-Links (Kachel/Panel-Register bis 10.6.2026)
  // öffnen die erste Kategorie, die Karten dieses Gebiets führt.
  const altGebiet = searchParams.get('gebiet');
  useEffect(() => {
    if (!altGebiet || offenId) return;
    const treffer = karten.find((k) => k.rechtsgebiet.toLowerCase().includes(altGebiet) || altGebiet === k.rechtsgebiet);
    if (treffer) oeffnen(kategorieVon(treffer));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Mount (Link-Erbe)
  }, []);

  const q = suche.trim();
  const passt = (k: CalculatorCard) =>
    kartePasst(k, { gebiete: new Set<string>(), bereiche: new Set<string>(), arten: new Set<string>(), nurVerfuegbar: false, suche });
  const treffer = karten.filter(passt);
  const trefferSortiert = q === '' ? treffer : treffer
    .map((k) => [k, sucheRang(k, suche) ?? 9] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k);

  const proKategorie = OBERKATEGORIEN
    .map((kat) => ({ kat, karten: karten.filter((k) => kategorieVon(k) === kat.id) }))
    .filter((x) => x.karten.length > 0);

  return (
    <div className="space-y-8">
      {q !== '' ? (
        trefferSortiert.length === 0 ? (
          /* Leerer Zustand: kein stilles Verschwinden */
          <section className="bg-surface rounded-2xl border border-line p-10 sm:p-14 text-center space-y-3">
            <p className="lc-overline">Keine Treffer</p>
            <h2 className="font-display font-semibold text-ink-900 text-h2">
              Nichts gefunden für «{q}».
            </h2>
            <p className="text-body-s text-ink-500 max-w-reading mx-auto">
              Versuchen Sie einen anderen Begriff (z. B. einen Gesetzesartikel wie «Art. 336c»)
              oder setzen Sie die Suche zurück.
            </p>
            <button type="button" onClick={sucheZuruecksetzen} className="lc-btn-outline mt-2">
              Suche zurücksetzen
            </button>
          </section>
        ) : (
          /* Flache, gerankte Trefferliste — Suchen-und-Öffnen ohne Umweg */
          <section aria-label="Suchtreffer" className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="lc-overline text-ink-500"><span className="num">{trefferSortiert.length}</span> Treffer</p>
              <button type="button" onClick={sucheZuruecksetzen}
                className="text-body-s text-ink-500 hover:text-brass-700 transition-colors">
                Zurücksetzen
              </button>
            </div>
            <div className="space-y-2">
              {trefferSortiert.map((k) => <TrefferZeile key={k.id} k={k} />)}
            </div>
          </section>
        )
      ) : (
        offen ? (
          /* Unterthemen-Ansicht EINER Kategorie (erst nach Klick) */
          <KategorieSektion kat={offen}
            karten={proKategorie.find((x) => x.kat.id === offen.id)?.karten ?? []}
            onZurueck={() => oeffnen(null)} />
        ) : (
          /* Deckblatt: NUR die vier Oberkategorien (Präzisierung David) */
          <nav aria-label="Oberkategorien" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {proKategorie.map((x) => (
              <KategorieEinstieg key={x.kat.id} kat={x.kat} karten={x.karten}
                onOeffnen={() => oeffnen(x.kat.id)} />
            ))}
          </nav>
        )
      )}
    </div>
  );
}

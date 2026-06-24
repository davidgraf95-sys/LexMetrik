import { Link, useSearchParams } from 'react-router-dom';
import { RECHTSGEBIETE, VORLAGE_SEKTIONEN, istVerfuegbar, istAktiv, type CalculatorCard, type VorlageCard } from '../lib/startseiteConfig';
import { EINGABE_RUBRIKEN, VERTRAG_RUBRIKEN, istVorlage } from '../lib/vorlagenKategorie';
import { GEBUEHREN_RUBRIKEN, gebuehrenRubrik, type GebuehrenRubrik } from '../lib/gebuehrenKategorie';
import { type Oberkategorie } from '../lib/oberkategorien';
import { praxisRang } from '../lib/praxisRang';
import { FRISTEN_HAUPTEINSTIEGE, FRISTEN_PROZESSUAL, FRISTEN_MATERIELL, fristenEinstiegArt, type FristenRegimeZeile as FristenRegimeZeileDef } from '../lib/fristenKategorie';
import { ZUSTAENDIGKEIT_FELDER, ZUSTAENDIGKEIT_FELD_IDS } from '../lib/zustaendigkeitKategorie';
import { kartePasst, LEERER_FILTER } from '../lib/katalogSuche';
import { sansAmp } from './typografie';

// Register-Bausteine der Rubrik-Übersichten (Auftrag David 10.6.2026, Struktur;
// UI-Welle: neuer Ort /rechner + /vorlagen). Eine Oberkategorie wird als
// vollständige Sektion gerendert (KategorieSektion, unten exportiert); die
// Übersichtsseiten reihen die für sie passenden Kategorien aneinander.
// Praxistauglichkeits-Leitsätze:
//  1. KLICKTIEFE 1: Verfügbare Werkzeuge stehen DIREKT als Link-Zeilen in
//     ihrer Kategorie (vorher Gebiets-Kachel → Panel → Karte).
//  2. PRAXIS-RANG STATT GEBIETS-GRUPPEN (Auftrag David 10.6.2026 «teile das
//     UI weiter nach dem Praxis-Gebrauch auf»): je Kategorie eine geordnete
//     Liste, Alltags-Werkzeuge zuoberst (lib/praxisRang.ts); das Rechtsgebiet
//     als dezentes Sub-Label IN der Zeile.
//  3. EHRLICH OHNE BALLAST (§8): Geplante Karten je Kategorie hinter einer
//     kompakten «In Vorbereitung (N)»-Aufklappzeile; Entwurf-Badges an jeder
//     Zeile. Die Suche liegt seit der UI-Welle im Header-Dropdown.
// Die Kategorie-Zuordnung liegt in lib/katalogKategorie.ts (§3/§5).

// ─── Werkzeug-Zeile: Direktlink (Klicktiefe 1); Status ehrlich als Badge ────

// Geteilte Listen-Zeile (Redesign #1): EIN Karten-Zeilen-Muster für Werkzeuge
// und Fristen-Regime (vorher WerkzeugZeile + FristenRegimeZeile, fast wortgleich).
//  subWrap  – Sub-Label umbrechen statt abschneiden (Fristen-WARUM-Satz)
//  zeigeGeplant – «In Vorbereitung»-Badge mitzeigen (sonst nur Entwurf)
function ListenZeile({ k, subLabel, subWrap = false, zeigeGeplant }: { k: CalculatorCard; subLabel?: string; subWrap?: boolean; zeigeGeplant?: boolean }) {
  const aktiv = istAktiv(k.status) && !!k.href;
  const inhalt = (
    <>
      <span className="min-w-0">
        <span className="block font-sans font-medium text-ink-900 text-body-s leading-snug">{sansAmp(k.title)}</span>
        {subLabel && <span className={`block text-xs text-ink-500 leading-snug${subWrap ? '' : ' truncate'}`}>{sansAmp(subLabel)}</span>}
      </span>
      <span className="flex items-center gap-2 shrink-0">
        {k.status === 'entwurf' && (
          <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>
        )}
        {zeigeGeplant && k.status === 'geplant' && (
          <span className="lc-badge lc-badge-soft">In Vorbereitung</span>
        )}
        {aktiv && <span aria-hidden className="text-brass-700 leading-none">→</span>}
      </span>
    </>
  );
  const klasse = 'lc-card text-left px-4 py-3 flex items-center justify-between gap-3 min-w-0 bg-surface no-underline transition-[transform,box-shadow,color] motion-reduce:transition-none motion-reduce:transform-none';
  return aktiv ? (
    <Link to={k.href!} className={`${klasse} hover:shadow-lg hover:-translate-y-0.5`}>{inhalt}</Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

// ─── Fristen-Register (S-5b FAHRPLAN-STRUKTUR-UMBAU) ────────────────────────
//
// Haupteinstieg Tagerechner (simpler Fristenrechner zuoberst, S-5a),
// darunter ZWEI Rubriken nach Davids Wortlaut (10.6.2026 abends):
// «Prozessuale Fristen» (eigenes Stillstands-Regime: ZPO · SchKG) und
// «Materielle Fristen» (Verjährung, 336c, Kündigungstermine, Rüge,
// Erbrecht), je mit Ein-Satz-WARUM. Daten/Texte: lib/fristenKategorie.ts
// (fachliche Aussagen, Abnahme David offen).

function FristenHauptKarte({ k, untertitel }: { k: CalculatorCard; untertitel: string }) {
  return (
    <Link to={k.href!}
      className="lc-card p-5 sm:p-6 flex flex-col gap-2 min-w-0 bg-surface no-underline transition-[transform,box-shadow,color] motion-reduce:transition-none motion-reduce:transform-none hover:shadow-lg hover:-translate-y-0.5 group">
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


function FristenRegister({ karten }: { karten: CalculatorCard[] }) {
  const byId = new Map(karten.map((k) => [k.id, k]));
  const haupt = FRISTEN_HAUPTEINSTIEGE
    .map((h) => ({ ...h, k: byId.get(h.id) }))
    .filter((h): h is typeof h & { k: CalculatorCard } => !!h.k && istVerfuegbar(h.k) && !!h.k.href);
  const zeilenFuer = (defs: FristenRegimeZeileDef[]) => defs
    .map((r) => ({ ...r, k: byId.get(r.id) }))
    .filter((r): r is typeof r & { k: CalculatorCard } => !!r.k && istVerfuegbar(r.k));
  const prozessual = zeilenFuer(FRISTEN_PROZESSUAL);
  const materiell = zeilenFuer(FRISTEN_MATERIELL);
  // Ehrlicher Fallback: verfügbare Fristen-Karten ohne Zuordnung erscheinen
  // als Zeile ohne WARUM-Satz unter «Materiell» (der Test bricht zusätzlich).
  const unzugeordnet = karten.filter((k) => istVerfuegbar(k) && fristenEinstiegArt(k.id) === null);

  const rubrik = (titel: string, lede: string, zeilen: ReturnType<typeof zeilenFuer>, extra: CalculatorCard[] = []) => (
    (zeilen.length > 0 || extra.length > 0) && (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="lc-overline text-brass-700">{titel}</h3>
          <span aria-hidden className="flex-1 h-px bg-line" />
        </div>
        <p className="text-body-s text-ink-500 max-w-reading">{lede}</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
          {zeilen.map((r) => <ListenZeile key={r.id} k={r.k} subLabel={r.warum ?? r.k.rechtsgebiet} subWrap />)}
          {extra.map((k) => <ListenZeile key={k.id} k={k} subLabel={k.rechtsgebiet} subWrap />)}
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="lc-overline text-brass-700">Fristen berechnen</h3>
          <span aria-hidden className="flex-1 h-px bg-line" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {haupt.map((h) => <FristenHauptKarte key={h.id} k={h.k} untertitel={h.untertitel} />)}
        </div>
      </div>
      {rubrik('Prozessuale Fristen',
        'Fristen im Verfahren mit eigenem Stillstands-Regime – Gerichtsferien (ZPO) bzw. Betreibungsferien (SchKG).',
        prozessual)}
      {rubrik('Materielle Fristen',
        'Fristen des materiellen Rechts – eigene Regimes ohne Gerichtsferien; der Grund steht an jeder Zeile.',
        materiell, unzugeordnet)}
    </div>
  );
}

// ─── Zuständigkeits-Register (S-3 FAHRPLAN-STRUKTUR-UMBAU) ──────────────────
//
// Vier feste Rechtsweg-Felder (Zivilprozess · Vollstreckung · Strafverfahren
// · Verwaltungsverfahren, Auftrag David 10.6.2026 abends) zuoberst — auch
// das geplante Verwaltungs-Feld ist SICHTBAR (ehrlich «In Vorbereitung»,
// §8) statt in der Aufklappzeile versteckt. Weitere zuordnung-Karten
// erscheinen darunter wie gehabt.

function ZustaendigkeitRegister({ karten }: { karten: CalculatorCard[] }) {
  const byId = new Map(karten.map((k) => [k.id, k]));
  const felder = ZUSTAENDIGKEIT_FELDER
    .map((f) => ({ ...f, k: byId.get(f.id) }))
    .filter((f): f is typeof f & { k: CalculatorCard } => !!f.k);
  const weitere = karten.filter((k) => istVerfuegbar(k) && !ZUSTAENDIGKEIT_FELD_IDS.has(k.id));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="lc-overline text-brass-700">Rechtswege</h3>
          <span aria-hidden className="flex-1 h-px bg-line" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
          {felder.map((f) => <ListenZeile key={f.id} k={f.k} subLabel={f.untertitel} zeigeGeplant />)}
        </div>
      </div>
      {weitere.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="lc-overline text-ink-500">Weitere Werkzeuge <span className="num">({weitere.length})</span></h3>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
            {weitere.map((k) => <ListenZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gebühren-Register (S-6 FAHRPLAN-STRUKTUR-UMBAU) ────────────────────────
//
// Zwei Rubriken (prozessual/materiell, Auftrag David 10.6.2026 abends) +
// Hilfsrechner; innerhalb der Rubrik Alltag (Praxis-Rang 1) zuerst, dann
// feste Gebiets-Reihenfolge.

function GebuehrenRegister({ karten, sortiert }: {
  karten: CalculatorCard[]; sortiert: (xs: CalculatorCard[]) => CalculatorCard[];
}) {
  const verfuegbarAlle = karten.filter(istVerfuegbar);
  const inRubrik = (r: GebuehrenRubrik) => {
    const xs = verfuegbarAlle.filter((k) => gebuehrenRubrik(k.id) === r);
    return [...sortiert(xs.filter((k) => praxisRang(k.id) === 1)),
      ...sortiert(xs.filter((k) => praxisRang(k.id) !== 1))];
  };
  return (
    <div className="space-y-6">
      {GEBUEHREN_RUBRIKEN.map((r) => {
        const xs = inRubrik(r.id);
        if (xs.length === 0) return null;
        return (
          <div key={r.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="lc-overline text-brass-700">{r.titel} <span className="num text-ink-500">({xs.length})</span></h3>
              <span aria-hidden className="flex-1 h-px bg-line" />
            </div>
            <p className="text-body-s text-ink-500 max-w-reading">{r.lede}</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
              {xs.map((k) => <ListenZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Vorlagen-Register (S-2 FAHRPLAN-STRUKTUR-UMBAU) ────────────────────────
//
// Fünf Dokument-Gruppen nach Davids Wortlaut (10.6.2026 abends):
// Behördeneingaben (dreigliedrig: Klagen allgemein · Klagen besondere
// Verfahren [nach Klage-Gebiet] · Gesuche & sonstige Eingaben) · Verträge ·
// Einseitige Willenserklärungen · Gesellschaftsrecht · Vorsorge & Nachlass.
// Geplante Vorlagen stehen je Gruppe als gedämpfte Ein-Zeilen-Liste (ehrliche
// Struktur-Sicht §8, ohne die Ansicht zu fluten).

// Vorlagen-Register (Redesign 24.6.2026, Auftrag David «Übersicht entschlacken»):
// Nur EINSATZBEREITE Vorlagen im Hauptbereich; alle geplanten wandern in den
// gemeinsamen «In Vorbereitung»-Block unten (KategorieSektion). Flache
// Unterrubriken (ohne Einrück-Borte), keine Form-Gate-Sub-Labels mehr (die
// Form-Grenzen stehen auf der Vorlage selbst, §8) — ruhigere, scanbarere Wand.
function VorlagenRegister({ karten }: { karten: CalculatorCard[] }) {
  const vorlagen = karten.filter(istVorlage).filter(istVerfuegbar);
  const proGruppe = VORLAGE_SEKTIONEN
    .map((s) => ({ s, verf: vorlagen.filter((v) => v.art === s.art) }))
    .filter((g) => g.verf.length > 0);

  const zeilen = (xs: VorlageCard[], subLabel?: (v: VorlageCard) => string | undefined) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
      {xs.map((v) => <ListenZeile key={v.id} k={v} subLabel={subLabel?.(v) ?? v.rechtsgebiet} />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {proGruppe.map(({ s, verf }) => (
        /* id-Anker «vorlage-<id>»: Sprungziel der Seitenleisten-Vorlagen-
           Untergruppen (navigation.ts → ScrollZuHash). */
        <div key={s.id} id={`vorlage-${s.id}`} className="space-y-2 scroll-mt-24">
          <div className="flex items-center gap-3">
            <h3 className="lc-overline text-brass-700">{s.title}
              <span className="num text-ink-500"> ({verf.length})</span></h3>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>
          <p className="text-body-s text-ink-500 max-w-reading">{s.lede}</p>
          {s.art === 'eingabe' ? (
            /* Behördeneingaben: drei Unterrubriken, flach (ohne Einrück-Borte). */
            <div className="space-y-3">
              {EINGABE_RUBRIKEN.map((r) => {
                const rVerf = verf.filter((v) => v.eingabeRubrik === r.id);
                if (rVerf.length === 0) return null;
                return (
                  <div key={r.id} className="space-y-2">
                    <h4 className="lc-overline text-ink-500">{r.titel}</h4>
                    {zeilen(rVerf, (v) => v.klageGebiet ?? v.rechtsgebiet)}
                  </div>
                );
              })}
            </div>
          ) : s.art === 'vertrag' ? (
            /* Verträge-Rubriken, flach; ab >6 Karten klappt die Rubrik ein. */
            <div className="space-y-3">
              {VERTRAG_RUBRIKEN.map((r) => {
                const rVerf = verf.filter((v) => v.vertragRubrik === r.id);
                if (rVerf.length === 0) return null;
                return (
                  <div key={r.id} className="space-y-2">
                    {rVerf.length > 6 ? (
                      <details className="group space-y-2">
                        <summary className="cursor-pointer list-none select-none">
                          <h4 className="lc-overline text-ink-500 inline">
                            <span aria-hidden className="inline-block mr-1.5 transition-transform group-open:rotate-90">▸</span>
                            {r.titel} <span className="num text-ink-500">({rVerf.length})</span>
                          </h4>
                        </summary>
                        {zeilen(rVerf)}
                      </details>
                    ) : (
                      <>
                        <h4 className="lc-overline text-ink-500">{r.titel}</h4>
                        {zeilen(rVerf)}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            zeilen(verf)
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Registerteil: eine Oberkategorie mit Gebiets-Gruppen + Geplant-Zeile ───

export function KategorieSektion({ kat, karten, onZurueck, ohneKopf }: { kat: Oberkategorie; karten: CalculatorCard[]; onZurueck?: () => void; ohneKopf?: boolean }) {
  const [params, setParams] = useSearchParams();
  // Übersichtlichkeits-Politur (Auftrag David 10.6.2026): ZWEI ruhige
  // Gebrauchs-Ebenen statt einer Mischliste — «Alltag» (Praxis-Rang 1)
  // zuoberst, «Weitere Werkzeuge» darunter; innerhalb der Ebene die feste
  // Gebiets-Reihenfolge, Rechtsgebiet als Sub-Label in der Zeile.
  const gebietsRang = (g: string) => { const i = RECHTSGEBIETE.indexOf(g); return i === -1 ? RECHTSGEBIETE.length : i; };
  const sortiert = (xs: CalculatorCard[]) => [...xs].sort((a, b) =>
    gebietsRang(a.rechtsgebiet) - gebietsRang(b.rechtsgebiet) ||
    a.title.localeCompare(b.title, 'de'));

  // Rechtsgebiet-Filter + Status-Schnitt (Redesign E4) — verdrahtet die bereits
  // vorhandene, getestete kartePasst-Logik (vorher mit leeren Sets aufgerufen,
  // also faktisch tot). NUR in der Vorlagen-Kategorie, der einzigen «Wand»;
  // teilbar über die URL (?rg=, ?status=). Reines Filtern, keine Logik berührt.
  const filterAktiv = kat.id === 'vorlagen';
  const rgRoh = params.get('rg') ?? '';
  const aktiveGebiete = new Set(rgRoh ? rgRoh.split(',').filter(Boolean) : []);
  const nurVerfuegbar = params.get('status') === 'verfuegbar';
  const gefiltert = filterAktiv
    ? karten.filter((k) => kartePasst(k, { ...LEERER_FILTER, gebiete: aktiveGebiete, nurVerfuegbar }))
    : karten;
  const vorhandeneGebiete = filterAktiv
    ? [...new Set(karten.filter(istVorlage).map((k) => k.rechtsgebiet))]
        .sort((a, b) => gebietsRang(a) - gebietsRang(b) || a.localeCompare(b, 'de'))
    : [];
  const setzeFilter = (rg: Set<string>, nv: boolean) => {
    const p = new URLSearchParams(params);
    if (rg.size > 0) p.set('rg', [...rg].join(',')); else p.delete('rg');
    if (nv) p.set('status', 'verfuegbar'); else p.delete('status');
    setParams(p, { replace: true });
  };
  const verfuegbarAlle = gefiltert.filter(istVerfuegbar);
  const alltag = sortiert(verfuegbarAlle.filter((k) => praxisRang(k.id) === 1));
  const weitere = sortiert(verfuegbarAlle.filter((k) => praxisRang(k.id) !== 1));
  const verfuegbar = [...alltag, ...weitere];
  // Geplante Karten, die bereits im Register sichtbar sind (S-3:
  // Verwaltungs-Zuständigkeit; S-2: Vorlagen je Gruppe), erscheinen nicht
  // zusätzlich in der «In Vorbereitung»-Aufklappzeile. Bug-Check §9
  // 10.6.2026 (Code-Lupe, MITTEL): in der Vorlagen-Kategorie nur ECHTE
  // Vorlagen ausnehmen — geplante Werkzeug-Karten (checklisten,
  // mandatsaufnahme) zeigt das VorlagenRegister nicht, sie müssen hier
  // sichtbar bleiben (Kachel-Zähler = Ansicht, §8).
  // Redesign 24.6.2026: in der Vorlagen-Kategorie wandern ALLE geplanten Vorlagen
  // (nicht mehr je Gruppe gestreut) in DIESEN gemeinsamen «In Vorbereitung»-Block.
  const geplant = gefiltert.filter((k) => !istVerfuegbar(k)
    && !(kat.id === 'zustaendigkeiten' && ZUSTAENDIGKEIT_FELD_IDS.has(k.id)));

  return (
    <section id={`register-${kat.id}`}
      aria-label={ohneKopf ? kat.titel : undefined}
      aria-labelledby={ohneKopf ? undefined : `register-titel-${kat.id}`}
      className="space-y-4 scroll-mt-28">
      {/* Eigener Kopf nur, wenn die Seite nicht schon einen trägt (ohneKopf=true
          auf /vorlagen: der SeitenKopf führt bereits Titel + Intro → kein Doppelkopf). */}
      {!ohneKopf && (
        <div className="space-y-1.5 pt-2">
          {onZurueck && (
            <button type="button" onClick={onZurueck}
              className="text-body-s font-medium text-ink-500 hover:text-brass-700 transition-colors">
              ← Alle Kategorien
            </button>
          )}
          <div className="flex items-baseline gap-4">
            <h2 id={`register-titel-${kat.id}`} className="whitespace-nowrap">
              <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{kat.titel}</span>
            </h2>
            <span aria-hidden className="flex-1 h-px bg-line" />
            <span className="lc-overline num text-ink-500 whitespace-nowrap">
              <span className="text-brass-700">{verfuegbar.length}</span> verfügbar
            </span>
          </div>
          <p className="text-body-s text-ink-500 max-w-reading">{kat.lede}</p>
        </div>
      )}

      {/* Rechtsgebiet-Filter (Redesign 24.6.2026): EIN Dropdown statt ~14 Pillen —
          macht die Vorlagen-«Wand» scanbar; die Auswahl engt alle Gruppen live ein.
          Die «Nur verfügbare»-Pille entfällt: der Hauptbereich zeigt ohnehin nur
          Einsatzbereite, Geplantes liegt im Sammelblock unten. */}
      {filterAktiv && vorhandeneGebiete.length > 1 && (
        <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Vorlagen nach Rechtsgebiet filtern">
          <label className="flex items-center gap-2 text-body-s text-ink-600">
            <span>Rechtsgebiet</span>
            <select value={[...aktiveGebiete][0] ?? ''}
              onChange={(e) => setzeFilter(e.target.value ? new Set([e.target.value]) : new Set(), false)}
              className="lc-select lc-input-sm w-auto min-w-[12rem]">
              <option value="">Alle</option>
              {vorhandeneGebiete.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <span className="lc-overline num text-ink-500">
            <span className="text-brass-700">{verfuegbar.length}</span> verfügbar
          </span>
        </div>
      )}

      {filterAktiv && gefiltert.filter(istVorlage).length === 0 && geplant.length === 0 ? (
        <p className="text-body-s text-ink-500 py-6">
          Keine Vorlage in dieser Auswahl.{' '}
          <button type="button" onClick={() => setzeFilter(new Set(), false)}
            className="font-medium text-brass-700 hover:text-brass-600">Filter zurücksetzen</button>
        </p>
      ) : kat.id === 'fristen' ? (
        /* FE-1 (FAHRPLAN-FRISTEN-EINHEIT): EIN Einstieg + Regime-Abzweigungen
           statt der Alltag/Weitere-Mischliste. */
        <FristenRegister karten={karten} />
      ) : kat.id === 'zustaendigkeiten' ? (
        /* S-3 (FAHRPLAN-STRUKTUR-UMBAU): vier feste Rechtsweg-Felder. */
        <ZustaendigkeitRegister karten={karten} />
      ) : kat.id === 'vorlagen' ? (
        /* S-2 (FAHRPLAN-STRUKTUR-UMBAU): fünf Dokument-Gruppen. */
        <VorlagenRegister karten={gefiltert} />
      ) : kat.id === 'gebuehren' ? (
        /* S-6 (FAHRPLAN-STRUKTUR-UMBAU): prozessual/materiell + Hilfsrechner. */
        <GebuehrenRegister karten={karten} sortiert={sortiert} />
      ) : (
        <>
          {alltag.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="lc-overline text-brass-700">Alltag</h3>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
                {alltag.map((k) => <ListenZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
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
                {weitere.map((k) => <ListenZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
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


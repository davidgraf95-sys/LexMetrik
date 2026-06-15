import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RECHTSGEBIETE, VORLAGE_SEKTIONEN, istVerfuegbar, istAktiv, type CalculatorCard, type VorlageCard } from '../lib/startseiteConfig';
import { EINGABE_RUBRIKEN, VERTRAG_RUBRIKEN, formGateText, istVorlage } from '../lib/vorlagenKategorie';
import { GEBUEHREN_RUBRIKEN, gebuehrenRubrik, type GebuehrenRubrik } from '../lib/gebuehrenKategorie';
import { OBERKATEGORIEN, kategorieFuer, type Oberkategorie, type OberkategorieId } from '../lib/oberkategorien';
import { praxisRang, kachelDirektlinks } from '../lib/praxisRang';
import { FRISTEN_HAUPTEINSTIEGE, FRISTEN_PROZESSUAL, FRISTEN_MATERIELL, fristenEinstiegArt, type FristenRegimeZeile as FristenRegimeZeileDef } from '../lib/fristenKategorie';
import { ZUSTAENDIGKEIT_FELDER, ZUSTAENDIGKEIT_FELD_IDS } from '../lib/zustaendigkeitKategorie';
import { kartePasst, sucheRang, LEERER_FILTER } from '../lib/katalogSuche';
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
          ins Alltags-Werkzeug, ohne die Kategorie zu öffnen. Bug-Check §9
          10.6.2026 (Code-Lupe, NIEDRIG): pointer-events-none auf dem
          Container — die Lücken NEBEN den Links gehören dem gestreckten
          Kachel-Button, nur die Links selbst fangen Klicks. */}
      {links.length > 0 && (
        <span className="relative pointer-events-none flex flex-col gap-1 pt-2 border-t border-line mt-1">
          {links.map((k) => (
            <Link key={k.id} to={k.href!}
              className="pointer-events-auto text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline truncate self-start max-w-full">
              {sansAmp(k.title)} <span aria-hidden>→</span>
            </Link>
          ))}
        </span>
      )}
    </div>
  );
}

// ─── Werkzeug-Zeile: Direktlink (Klicktiefe 1); Status ehrlich als Badge ────

function WerkzeugZeile({ k, subLabel, zeigeGeplant }: { k: CalculatorCard; subLabel?: string; zeigeGeplant?: boolean }) {
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
        {zeigeGeplant && k.status === 'geplant' && (
          <span className="lc-badge lc-badge-soft">In Vorbereitung</span>
        )}
        {aktiv && <span aria-hidden className="text-brass-700 leading-none">→</span>}
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
          {zeilen.map((r) => <FristenRegimeZeile key={r.id} k={r.k} warum={r.warum} />)}
          {extra.map((k) => <FristenRegimeZeile key={k.id} k={k} />)}
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
          {felder.map((f) => <WerkzeugZeile key={f.id} k={f.k} subLabel={f.untertitel} zeigeGeplant />)}
        </div>
      </div>
      {weitere.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="lc-overline text-ink-500">Weitere Werkzeuge <span className="num">({weitere.length})</span></h3>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
            {weitere.map((k) => <WerkzeugZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
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
              {xs.map((k) => <WerkzeugZeile key={k.id} k={k} subLabel={k.rechtsgebiet} />)}
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

function GeplantZeile({ karten }: { karten: CalculatorCard[] }) {
  if (karten.length === 0) return null;
  return (
    <p className="text-body-s text-ink-500 leading-relaxed">
      <span className="lc-badge lc-badge-soft mr-2">In Vorbereitung</span>
      {karten.map((k, i) => (
        <span key={k.id}>
          {i > 0 && <span aria-hidden> · </span>}
          {sansAmp(k.title)}
        </span>
      ))}
    </p>
  );
}

function VorlagenRegister({ karten }: { karten: CalculatorCard[] }) {
  const vorlagen = karten.filter(istVorlage);
  const proGruppe = VORLAGE_SEKTIONEN
    .map((s) => ({ s, alle: vorlagen.filter((v) => v.art === s.art) }))
    .filter((g) => g.alle.length > 0);

  // V1 (FAHRPLAN-VORLAGEN-AUSBAU): Form-Gate als zweites Sub-Label-Element —
  // EIN Template-Literal (SSR-Regel), Gate vor dem Gebiets-/Gruppen-Label.
  const subMitGate = (v: VorlageCard, basis?: string) => {
    const gate = formGateText(v);
    const label = basis ?? v.rechtsgebiet;
    return gate ? `${gate} · ${label}` : label;
  };

  const zeilen = (xs: VorlageCard[], subLabel?: (v: VorlageCard) => string | undefined) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(380px,100%),1fr))] gap-3">
      {xs.map((v) => <WerkzeugZeile key={v.id} k={v} subLabel={subMitGate(v, subLabel?.(v))} />)}
    </div>
  );

  return (
    <div className="space-y-6">
      {proGruppe.map(({ s, alle }) => {
        const verf = alle.filter(istVerfuegbar);
        const geplant = alle.filter((v) => !istVerfuegbar(v));
        return (
          <div key={s.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="lc-overline text-brass-700">{s.title}
                {verf.length > 0 && <span className="num text-ink-500"> ({verf.length})</span>}</h3>
              <span aria-hidden className="flex-1 h-px bg-line" />
            </div>
            <p className="text-body-s text-ink-500 max-w-reading">{s.lede}</p>
            {s.art === 'eingabe' ? (
              /* Behördeneingaben: drei Unterrubriken (Davids «Kachel für
                 Gesuche und sonstige Eingaben» = dritte Rubrik). */
              <div className="space-y-4">
                {EINGABE_RUBRIKEN.map((r) => {
                  const inRubrik = alle.filter((v) => v.eingabeRubrik === r.id);
                  if (inRubrik.length === 0) return null;
                  const rVerf = inRubrik.filter(istVerfuegbar);
                  const rGeplant = inRubrik.filter((v) => !istVerfuegbar(v));
                  return (
                    <div key={r.id} className="space-y-2 pl-3 border-l-2 border-line">
                      <h4 className="lc-overline text-ink-600">{r.titel}</h4>
                      {rVerf.length > 0 && zeilen(rVerf, (v) => v.klageGebiet ?? v.rechtsgebiet)}
                      <GeplantZeile karten={rGeplant} />
                    </div>
                  );
                })}
              </div>
            ) : s.art === 'vertrag' ? (
              /* V1 (FAHRPLAN-VORLAGEN-AUSBAU): sieben Verträge-Rubriken nach
                 dem Eingabe-Muster; EIN Eintrag pro Vertragstyp, Varianten im
                 Wizard. Ab >6 verfügbaren Karten klappt die Rubrik ein
                 (<details>, Zähler) — heutiger Bestand bleibt offen. */
              <div className="space-y-4">
                {VERTRAG_RUBRIKEN.map((r) => {
                  const inRubrik = alle.filter((v) => v.vertragRubrik === r.id);
                  if (inRubrik.length === 0) return null;
                  const rVerf = inRubrik.filter(istVerfuegbar);
                  const rGeplant = inRubrik.filter((v) => !istVerfuegbar(v));
                  const inhalt = (
                    <>
                      {rVerf.length > 0 && zeilen(rVerf)}
                      <GeplantZeile karten={rGeplant} />
                    </>
                  );
                  return (
                    <div key={r.id} className="space-y-2 pl-3 border-l-2 border-line">
                      {rVerf.length > 6 ? (
                        <details className="group space-y-2">
                          <summary className="cursor-pointer list-none select-none">
                            <h4 className="lc-overline text-ink-600 inline">
                              <span aria-hidden className="inline-block mr-1.5 transition-transform group-open:rotate-90">▸</span>
                              {r.titel} <span className="num text-ink-500">({rVerf.length})</span>
                            </h4>
                          </summary>
                          {inhalt}
                        </details>
                      ) : (
                        <>
                          <h4 className="lc-overline text-ink-600">{r.titel}</h4>
                          {inhalt}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {verf.length > 0 && zeilen(verf)}
                <GeplantZeile karten={geplant} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Registerteil: eine Oberkategorie mit Gebiets-Gruppen + Geplant-Zeile ───

// Filter-Pille (Rechtsgebiet-Schnitt im Vorlagen-Register) — Pillen-Höhe
// (--pill-h) aus dem Designsystem; aktiver Zustand im Messing-Akzent.
const pillKlasse = (aktiv: boolean) =>
  `h-9 px-3 rounded-full text-body-s font-medium transition-colors whitespace-nowrap motion-reduce:transition-none ${
    aktiv
      ? 'bg-brass-100 text-brass-700 border border-brass-500'
      : 'bg-surface text-ink-600 border border-line hover:border-brass-400 hover:text-brass-700'}`;

function KategorieSektion({ kat, karten, onZurueck }: { kat: Oberkategorie; karten: CalculatorCard[]; onZurueck: () => void }) {
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
  const toggleGebiet = (g: string) => {
    const s = new Set(aktiveGebiete);
    if (s.has(g)) s.delete(g); else s.add(g);
    setzeFilter(s, nurVerfuegbar);
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
  const geplant = gefiltert.filter((k) => !istVerfuegbar(k)
    && !(kat.id === 'zustaendigkeiten' && ZUSTAENDIGKEIT_FELD_IDS.has(k.id))
    && !(kat.id === 'vorlagen' && istVorlage(k)));

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

      {/* Rechtsgebiet-Filter + Status-Schnitt — macht die Vorlagen-«Wand»
          scanbar; die Treffer engen alle Gruppen darunter live ein. */}
      {filterAktiv && vorhandeneGebiete.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Vorlagen nach Rechtsgebiet filtern">
          <button type="button" onClick={() => setzeFilter(new Set(), false)}
            className={pillKlasse(aktiveGebiete.size === 0 && !nurVerfuegbar)}>Alle</button>
          {vorhandeneGebiete.map((g) => (
            <button key={g} type="button" aria-pressed={aktiveGebiete.has(g)} onClick={() => toggleGebiet(g)}
              className={pillKlasse(aktiveGebiete.has(g))}>{g}</button>
          ))}
          <span aria-hidden className="mx-1 h-5 w-px bg-line-strong" />
          <button type="button" aria-pressed={nurVerfuegbar} onClick={() => setzeFilter(aktiveGebiete, !nurVerfuegbar)}
            className={pillKlasse(nurVerfuegbar)}>Nur verfügbare</button>
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

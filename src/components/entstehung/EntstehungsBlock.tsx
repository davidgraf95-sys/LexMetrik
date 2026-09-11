import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArtikelHistorieZeile } from '../../pages/gesetz-leser/parts/ArtikelHistorie';
import { datumCh } from '../../lib/normtext/erlassKopfText';
import { AMTLICHE_FASSUNG_NOMEN } from '../../lib/benennung';
import { verfahrensLabel, verfahrensQuelleUrl } from '../../lib/materialien/verfahren';
import {
  ladeEntstehungProjektion, aenderungFuer,
  type EntstehungProjektion, type EntstehungAenderung, type EntstehungBotschaft,
} from '../../lib/entstehung/projektion';
import { ladeAnkerSidecar, ankerFuerToken, ankerUrl, type AnkerSidecar } from '../../lib/entstehung/anker';
import { ladeKantenShard } from '../../lib/materialien/kanten-shard';
import type { ArtikelHistorie, HistorieEreignis } from '../../lib/normtext/historie-laden';

// ═══ DIE ENTSTEHUNG AM ARTIKEL (W2·6c · E3) ═════════════════════════════════
//
// AUFTRAG David 6.9.2026, wörtlich: «Materialien und Wegleitungen maximal
// sinnvoll verzahnen … dass jemand noch besser versteht, wie ein Gesetz
// zustande gekommen ist» — mit zwei Auflagen: **das Gesetz nicht überladen, nur
// auf Wunsch sichtbar**, und **zuerst Bundesebene**. Go zum Bau 11.9.2026.
//
// ── WO DIESE KARTE STEHT UND WARUM DORT ───────────────────────────────────────
// Im AUFKLAPP-BLOCK der Rubrik «Fassung» der Funktionszeile am Artikelende
// (`pages/gesetz-leser/parts/Funktionszeile.tsx`, `.lr7-bez-inhalt`) — also genau
// dort, wo seit D40 die Zeitleiste steht. KEIN zweiter Slot in der Textspalte:
// die ältere Spec (§11 Fassung 3, C5/C6) plante einen, weil die Fassung damals
// in einer 150-px-Marginalie hing; seit D40 (#761, 7.9.2026) ist sie eine Rubrik
// mit eigenem Block, und der Block ist der Ort (Sichtung 11.9.2026, Fassung 5).
//
// ── DIE ZEITLEISTE IST DIE FASSUNGSLEISTE (§5) ────────────────────────────────
// §11.5 (1) verlangt «ein Punkt je datiertem Ereignis». Genau das ist die
// bestehende Zeitleiste (`parts/ArtikelHistorie.tsx`) — eine zweite Liste
// derselben Ereignisse daneben wäre die zweite Wahrheit, die §5 verbietet und
// die der Leser sofort als Dopplung läse. Diese Karte hängt sich deshalb IN die
// vorhandenen Punkte (Prop `zusatz`), statt neben sie.
//
// ── NICHTS LÄDT VOR DEM KLICK (Auflage David 6.9.2026) ────────────────────────
// Die Komponente EXISTIERT erst, wenn die Rubrik offen ist (die Funktionszeile
// rendert einen zugeklappten Block gar nicht, D35-F1). Ihr erster Effekt holt
// dann GENAU EINE Datei: die Entstehungs-Projektion dieses Erlasses
// (`/materialien/entstehung/<KEY>.json`, ø 3,7 KB; OR 15 KB roh / 2,5 KB gzip).
// Das Materialien-Register (2,1 MB) wird dafür NIE angefasst — es ist der Kanal
// der Materialien-Übersicht, nicht der einer Artikel-Karte (§15; Herleitung in
// `lib/entstehung/projektion.ts`). Sonde: `e2e/entstehung-karte-e3`.
//
// ── WAS SIE NICHT BEHAUPTET (§8) ──────────────────────────────────────────────
// Drei Zustände, die alle SICHTBAR sind, weil sie Auskunft sind:
//   · «Botschaft»       — das Revisions-Sidecar bindet diese Änderung an eine
//                         erfasste Botschaft ⇒ Titel, Nummer, Live-Link,
//                         Verfahrenskette, wo vorhanden der Anker-Sprung.
//   · «Bundesblatt»     — die Fussnote nennt eine BBl-Fundstelle, aber es gibt
//                         keine erfasste Botschaft ⇒ nur der amtliche Live-Link,
//                         mit Chip «Botschaft nicht erfasst» (gemessen: nur rund
//                         ein Drittel der Ereignisse trifft eine erfasste
//                         Botschaft, Kritik A3/C8).
//   · «keine Fundstelle» — die Fussnote nennt keine ⇒ die Karte sagt genau das.
// Und über allem der Vorbehalt: massgeblich bleibt die amtliche Fassung (§7).

/** Wie viele Punkte dieses Artikels eine erfasste Begründung tragen (§8). */
function zaehleDeckung(ereignisse: readonly HistorieEreignis[], p: EntstehungProjektion | null) {
  let mitAenderung = 0;
  let mitBotschaft = 0;
  for (const e of ereignisse) {
    const t = aenderungFuer(p, e.quellen);
    if (!t) continue;
    mitAenderung += 1;
    if (t.a.botschaft) mitBotschaft += 1;
  }
  return { gesamt: ereignisse.length, mitAenderung, mitBotschaft };
}

/** Die BBl-Fundstelle eines Ereignisses (Live-Link, immer amtlich §7c). */
function bblQuelle(e: HistorieEreignis): { label: string; url?: string } | null {
  return e.quellen.find((q) => /^BBl\b/.test(q.label)) ?? null;
}

/** Betroffener Teil des Artikels («Abs. 2, lit./Ziff. c»), sofern die Fussnote ihn trägt. */
function betrifft(e: HistorieEreignis): string {
  const teile: string[] = [];
  if (e.absatz) teile.push(`Abs. ${e.absatz}`);
  if (e.item) teile.push(`lit./Ziff. ${e.item}`);
  return teile.length > 0 ? teile.join(', ') : 'den ganzen Artikel';
}

/** Die Verfahrenskette einer Vorlage — amtliche Etiketten, nie umformuliert (§1). */
function Verfahrenskette({ b }: { b: EntstehungBotschaft }) {
  const schritte = (b.ereignisse ?? []).filter((e) => e.datum);
  if (schritte.length === 0) return null;
  // Chronologisch, nicht in Graph-Reihenfolge: die Kette ist eine ZEITACHSE, und
  // der Graph liefert sie unsortiert (gemessen an `fga/2025/3067`: Eröffnung der
  // Vernehmlassung nach der Botschaft). Sortiert wird NUR die Anzeige (§3).
  const sortiert = [...schritte].sort((x, y) => (x.datum! < y.datum! ? -1 : x.datum! > y.datum! ? 1 : 0));
  return (
    <ol className="lr8-entst-kette" data-entstehung-kette>
      {sortiert.map((s, i) => {
        const url = verfahrensQuelleUrl(s);
        return (
          <li key={`${s.code}-${s.datum}-${i}`}>
            <span className="text-ink-700">{verfahrensLabel(s)}</span>
            <span> · <span className="num text-ink-600">{datumCh(s.datum!)}</span></span>
            {url && <span> · <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-brass-700">Fundstelle&nbsp;↗</a></span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Die Änderungskarte zu EINEM Punkt der Fassungsleiste (§11.5 (2)). */
function Aenderungskarte({ e, a, projektion, anker, artikel, abgerufen }: {
  e: HistorieEreignis;
  a: EntstehungAenderung;
  projektion: EntstehungProjektion;
  /** Anker-Sidecar der Botschaft, sofern geladen und vorhanden. */
  anker: AnkerSidecar | null | undefined;
  /** Roher Artikel-Token dieses Artikels («16_c») — Schlüssel des Anker-Sprungs. */
  artikel: string;
  abgerufen: string;
}) {
  const b = a.botschaft ? projektion.botschaften[a.botschaft] : undefined;
  const bbl = bblQuelle(e);
  const ankerTreffer = anker ? ankerFuerToken(anker, artikel) : null;
  return (
    <div className="lr8-entst-karte" data-entstehung-karte>
      <div className="lr8-entst-zeile">
        <span className="lr8-entst-feld">Betrifft</span>
        <span>{betrifft(e)}</span>
      </div>
      <div className="lr8-entst-zeile">
        <span className="lr8-entst-feld">Geändert durch</span>
        <span>
          <a href={a.url} target="_blank" rel="noopener noreferrer" className="hover:text-brass-700">
            {a.titel ?? a.as ?? 'Änderungserlass'}&nbsp;↗
          </a>
          {a.titel && a.as && <span className="text-ink-400"> · <span className="num">{a.as}</span></span>}
          {a.inkraft && <span className="text-ink-400"> · in Kraft seit <span className="num">{datumCh(a.inkraft)}</span></span>}
        </span>
      </div>
      <div className="lr8-entst-zeile">
        <span className="lr8-entst-feld">Begründung</span>
        <span>
          {b ? (
            <>
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="hover:text-brass-700">
                {b.nummer ? `Botschaft ${b.nummer}` : 'Botschaft'}: {b.titel}&nbsp;↗
              </a>
              <span className="text-ink-400"> · vom <span className="num">{datumCh(b.stand)}</span></span>
              {ankerTreffer && (
                <>
                  {' '}
                  <a href={ankerUrl(anker!, ankerTreffer)} target="_blank" rel="noopener noreferrer"
                    className="lc-chip lr8-entst-sprung" data-entstehung-sprung
                    title={ankerTreffer.ueberschrift}>Sprung zur Erläuterung&nbsp;↗</a>
                </>
              )}
              <Verfahrenskette b={b} />
              {a.botschaft && (
                <Link to={`/materialien/${encodeURIComponent(a.botschaft)}`} className="lr8-entst-mehr">
                  Vorlage im Überblick<span aria-hidden>&nbsp;›</span>
                </Link>
              )}
            </>
          ) : bbl ? (
            <>
              {bbl.url
                ? <a href={bbl.url} target="_blank" rel="noopener noreferrer" className="hover:text-brass-700"><span className="num">{bbl.label}</span>&nbsp;↗</a>
                : <span className="num">{bbl.label}</span>}
              {' '}
              <span className="lc-chip lr8-entst-luecke">Botschaft nicht erfasst</span>
            </>
          ) : (
            <span className="text-ink-500">Die amtliche Fussnote nennt keine Bundesblatt-Fundstelle.</span>
          )}
        </span>
      </div>
      <p className="lr8-entst-fuss">
        <span className="lc-chip">amtlich · aus der Fedlex-Fussnote</span>
        {' '}
        <span className="text-ink-400">
          Fedlex, Bundeskanzlei · Abruf <span className="num">{abgerufen ? datumCh(abgerufen) : 'unbekannt'}</span> ·
          massgeblich bleibt {AMTLICHE_FASSUNG_NOMEN}.
        </span>
      </p>
    </div>
  );
}

/**
 * Der Inhalt der Rubrik «Fassung»: Zeitleiste (bestehend) + Entstehung (E3).
 *
 * @param historie   Fassungshistorie dieses Artikels (erlass-lokaler Shard).
 * @param erlassKey  Kanonischer Erlass-Key — Adresse der Projektion.
 * @param artikel    Roher Artikel-Token («16_c») für Anker-Sprung und Praxis-Zähler.
 */
export function EntstehungsBlock({ historie, erlassKey, artikel }: {
  historie?: ArtikelHistorie;
  erlassKey?: string;
  artikel: string;
}) {
  // `undefined` = noch unterwegs · `null` = keine Projektion für diesen Erlass.
  // OHNE Erlass-Key gibt es nichts zu holen — das ist ABGELEITET, kein Zustand:
  // ein `setProjektion(null)` im Effekt wäre ein synchroner Zustandswechsel im
  // Effektkörper und damit eine Kaskaden-Render-Runde (`react-hooks/
  // set-state-in-effect`). Zustand trägt nur, was wirklich EINTRIFFT.
  const [geladen, setGeladen] = useState<EntstehungProjektion | null | undefined>(undefined);
  const projektion = erlassKey ? geladen : null;
  const [offen, setOffen] = useState<number | null>(null);
  /** Anker-Sidecars, die schon eingetroffen sind (je Botschafts-Key). */
  const [ankerCache, setAnkerCache] = useState<Record<string, AnkerSidecar | null>>({});
  /** Wie viele Wegleitungen diesen Artikel nennen — `undefined` = noch unterwegs. */
  const [praxis, setPraxis] = useState<number | undefined>(undefined);
  const kartenId = useId();

  // ── Der EINE Abruf dieser Karte, ausgelöst durch den Klick, der sie mountet ──
  useEffect(() => {
    if (!erlassKey) return;
    let lebt = true;
    void ladeEntstehungProjektion(erlassKey).then((p) => { if (lebt) setGeladen(p); });
    return () => { lebt = false; };
  }, [erlassKey]);

  // ── Praxis: der KANTEN-SHARD lädt erst jetzt (§11.5 (4); Entscheid 28.7.2026,
  //    «Facetten aus = null Byte» im Lesefluss).
  //
  //    GEMESSEN 11.9.2026, und darum genau dieser Weg: der bestehende
  //    Aufklapp-Ladepfad der Rubriken «Entscheide»/«Materialien» (`weckeDaten`)
  //    zieht `/materialien/register.json` mit — 2,1 MB, weil er die TITEL der
  //    Dokumente braucht. Die Sonde `entstehung-karte-e3` (a) hat das rot
  //    gezeigt, als diese Zeile noch `onPraxis?.()` rief. Für eine ZAHL braucht
  //    es keine Titel: der erlass-lokale Kanten-Shard (ZPO: keiner ⇒ 404;
  //    MWSTG 10 KB) trägt sie, und wer die Titel will, klickt die Rubrik
  //    «Materialien» — die lädt sie wie bisher.
  useEffect(() => {
    if (!erlassKey) return;
    let lebt = true;
    void ladeKantenShard(erlassKey).then((shard) => {
      if (!lebt) return;
      // Ein Eintrag je DOKUMENT (nicht je Fundstelle) — dieselbe Entdopplung,
      // die auch die Rubrik «Materialien» zeigt (§5, `projiziereMaterialien`).
      const dok = new Set((shard?.kanten ?? []).filter((k) => k.artikel === artikel).map((k) => k.dok));
      setPraxis(dok.size);
    });
    return () => { lebt = false; };
  }, [erlassKey, artikel]);

  const ereignisse = historie?.ereignisse ?? [];
  const gewaehlt = offen !== null ? ereignisse[offen] : undefined;
  const gewaehlteAenderung = gewaehlt ? aenderungFuer(projektion, gewaehlt.quellen) : null;
  const gewaehlteBotschaft = gewaehlteAenderung?.a.botschaft;

  // Der Anker-Sidecar hängt an der GEWÄHLTEN Botschaft und wird erst geholt, wenn
  // die Projektion sagt, dass es einen gibt (`anker: true`) — ein Abruf ins Leere
  // wäre Leitung ohne Gegenwert (§15), und ein fehlender Sidecar ist ohnehin ein
  // gültiger Zustand (keine Anker, `lib/entstehung/anker.ts`).
  useEffect(() => {
    if (!gewaehlteBotschaft || !projektion?.botschaften[gewaehlteBotschaft]?.anker) return;
    let lebt = true;
    void ladeAnkerSidecar(gewaehlteBotschaft).then((s) => {
      if (lebt) setAnkerCache((alt) => ({ ...alt, [gewaehlteBotschaft]: s }));
    });
    return () => { lebt = false; };
  }, [gewaehlteBotschaft, projektion]);
  // `undefined` = unterwegs · `null` = diese Botschaft trägt keine Anker (§8).
  const anker = gewaehlteBotschaft
    ? (projektion?.botschaften[gewaehlteBotschaft]?.anker ? ankerCache[gewaehlteBotschaft] : null)
    : null;

  const deckung = zaehleDeckung(ereignisse, projektion ?? null);

  const zusatz = (e: HistorieEreignis, i: number): ReactNode => {
    const treffer = aenderungFuer(projektion, e.quellen);
    if (!treffer) return null;
    const auf = offen === i;
    return (
      <>
        {' '}
        <button type="button" className="lc-btn-mini lr8-entst-griff text-micro"
          aria-expanded={auf} aria-controls={auf ? `${kartenId}-${i}` : undefined}
          data-entstehung-griff
          onClick={() => setOffen(auf ? null : i)}>
          Warum?<span aria-hidden className="lr7-bez-pfeil">&nbsp;›</span>
        </button>
        {auf && projektion && (
          <div id={`${kartenId}-${i}`}>
            <Aenderungskarte e={e} a={treffer.a} projektion={projektion} anker={anker}
              artikel={artikel} abgerufen={projektion.abgerufen} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="lr8-entst" data-entstehung>
      <ArtikelHistorieZeile historie={historie} zeitleiste zusatz={zusatz} />
      <p className="lr8-entst-stand" data-entstehung-stand>
        {projektion === undefined ? (
          <span className="text-ink-500">Entstehung: lädt …</span>
        ) : projektion === null || deckung.mitAenderung === 0 ? (
          // §8: «nicht erfasst» ist die Auskunft — nicht «gibt es nicht».
          <span className="text-ink-500">Zu den Änderungen dieses Artikels ist keine Entstehung erfasst.</span>
        ) : (
          <span className="text-ink-500">
            Entstehung: <span className="num">{deckung.mitAenderung}</span> von{' '}
            <span className="num">{deckung.gesamt}</span> Änderungen mit erfasstem Änderungserlass,
            davon <span className="num">{deckung.mitBotschaft}</span> mit erfasster Botschaft.
          </span>
        )}
      </p>
      <p className="lr8-entst-praxis" data-entstehung-praxis>
        <span className="text-ink-500">
          {praxis === undefined
            ? 'Praxis: lädt …'
            : praxis === 0
              // §8: «erfasst» ist der Kern des Satzes — er sagt etwas über
              // unseren Bestand, nie über die Rechtswirklichkeit.
              ? 'Keine Wegleitung erfasst, die diesen Artikel nennt.'
              : praxis === 1
                ? '1 Wegleitung nennt diesen Artikel — siehe Rubrik «Materialien».'
                : `${praxis} Wegleitungen nennen diesen Artikel — siehe Rubrik «Materialien».`}
        </span>
      </p>
    </div>
  );
}

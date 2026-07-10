import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  kontextSync, kontextEntscheide, kontextSoftLaw, mischeMaterialien, normenFuer,
  type KontextTyp, type EntscheidRef, type MaterialBezug,
} from '../../lib/kontext';
import { ladeLeitfallShard, artikelProEntscheid } from '../../lib/rechtsprechung/norm-index';
import { usePaneSteuerung } from '../layout/usePaneLayout';
import { KantenChip } from '../verzahnung/KantenChip';
import { StatusBadge } from '../verzahnung/StatusBadge';
import {
  ladeRevisionShard, revisionFuerToken, klassifiziereFassungsBezug, entscheidDatum,
  revisionDetailText, type RevisionShard,
} from '../../lib/verzahnung/artikel-revisionen';

// ─── Einheitliches «Kontext»-Panel (B3) ─────────────────────────────────────
//
// EIN wiederverwendbares Panel für alle drei Korpus-Reader (Gesetz, Entscheid,
// Material). Es zeigt die fremden Korpora, die über die `normKeys` der Quelle
// verknüpft sind: Norm → Entscheide/Materialien/Werkzeuge; Entscheid →
// Normen/Materialien/Werkzeuge; Material → Normen/Entscheide/Werkzeuge. Reine
// Darstellung (§3) — Auflösung liegt in lib/kontext.ts. Verknüpfungen sind
// maschinell über zitierte Normen — §8 ehrlich gekennzeichnet, keine
// redaktionelle Auswahl. Voller Zustands-Bogen inkl. ruhigem Leerzustand (§13/F4).
//
// V1.2 (W2·7-VZUI, FAHRPLAN-VERZAHNUNG-UI §1.4): die bestehende `Gruppe`-Hülle
// trägt drei Pflicht-Props — Richtungs-Label als lc-overline (Beziehungstyp als
// TEXT, nie Farbe: «Wendet an» / «Wird zitiert von» / «Legt aus»), Zähler und
// kontexttyp-spezifischen Hinweis (Zähler-Formel «n erfasste …», Grammatik-Regel
// 6). BEWUSST kein Registry-Refactor (§0-3a): die vier JSX-Blöcke bleiben; die
// Registry kommt in V2 mit dem fünften (asynchronen) Gruppentyp.
// Erweiterungspunkt V2: Gruppe «Wird zitiert von» am Entscheid (Edge-Query auf
// zitat_kanten) dockt hier als weiterer JSX-Block an.

const MAX_ENTSCHEIDE = 8;
const MAX_MATERIALIEN = 8;

/** Korpus-Artikel-Token → Anzeige ('20_a' → '20a'). */
function anzeigeArtikel(token: string): string {
  return token.replace(/_/g, '');
}

/** ISO → DD.MM.YYYY (rein, kein new Date). */
function kurzDatum(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

// Exportiert (V1.3): der EntscheidLeser rendert seine beiden Richtungs-Gruppen
// («Zitierte Normen» / «Zitierte Entscheide») mit DERSELBEN Hülle im Panel —
// eine Anatomie, keine zweite Gruppen-Optik (§5).
export function KontextGruppe({ titel, richtung, anzahl, children, hinweis }: {
  titel: string;
  /** Beziehungstyp als Text (juris/EUR-Lex-Muster): «Wendet an» u. a.; nie Farbe. */
  richtung?: string;
  anzahl: number;
  children: ReactNode;
  hinweis?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="lc-overline text-ink-600">
        {richtung && <span className="text-brass-700">{richtung} · </span>}
        {titel} <span className="num text-ink-500">{anzahl}</span>
      </h3>
      {children}
      {hinweis && <p className="text-micro text-ink-500">{hinweis}</p>}
    </div>
  );
}

// Geteilter «⧉ daneben öffnen»-Knopf (Split-View B-2) — EINE Anatomie für alle
// Panel-Zeilen; Sichtbarkeit steuert der Aufrufer über das bestehende Gating
// `kannOeffnen && !istOffen` (≥lg + freie Kapazität, pane-sicher).
function DanebenKnopf({ ziel, label, oeffneDaneben, className = 'ml-1' }: {
  ziel: string; label: string; oeffneDaneben: (pfad: string) => void; className?: string;
}) {
  return (
    <button type="button" onClick={() => oeffneDaneben(ziel)}
      title={`${label} nebeneinander öffnen`} aria-label={`${label} nebeneinander öffnen`}
      className={`${className} inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors`}>
      <span aria-hidden className="text-base leading-none">⧉</span>
    </button>
  );
}

export function KontextPanel({ typ, normKeys, zusatzGruppen, ohneNormen = false }: {
  typ: KontextTyp;
  normKeys: readonly string[];
  /** Reader-eigene Gruppen (KontextGruppe), VOR den Standard-Gruppen gerendert —
   *  V1.3: «Zitierte Normen»/«Zitierte Entscheide» des EntscheidLesers. */
  zusatzGruppen?: ReactNode;
  /** true: die Erlass-Gruppe entfällt (der Reader ersetzt sie artikelscharf —
   *  keine Doppel-Darstellung, FAHRPLAN-VERZAHNUNG-UI §2.2). */
  ohneNormen?: boolean;
}) {
  // Synchron (in-Bundle) — billig + deterministisch, daher pro Render berechnet
  // statt memoisiert (kleine Register, kein O(n²); §6.4).
  const { normen, materialien, werkzeuge } = kontextSync(typ, normKeys);
  // B-2 Verzahnung: Rechner direkt NEBEN dem Normtext öffnen (Split-View).
  // Nur ab lg + freier Pane-Kapazität sichtbar (Werkzeuge sind pane-sicher).
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();

  // Entscheide lazy aus dem Norm→Entscheid-Index. Stabiler Dep-Key über die
  // join-Signatur (Array-/Objekt-Identität wechselt sonst je Render). Das
  // Ergebnis trägt seinen eigenen Key → der Ladezustand wird daraus ABGELEITET
  // (kein synchrones setState im Effekt-Body, react-hooks-Regel; §6.4).
  const normKeysKey = normKeys.join(',');
  const [geladen, setGeladen] = useState<{ key: string; refs: EntscheidRef[] } | null>(null);
  useEffect(() => {
    if (typ === 'entscheid') return;   // Entscheid-Reader: keine Entscheid-Gruppe
    const keys = normKeysKey ? normKeysKey.split(',') : [];
    let lebt = true;
    kontextEntscheide(typ, keys).then((r) => { if (lebt) setGeladen({ key: normKeysKey, refs: r }); });
    return () => { lebt = false; };
  }, [typ, normKeysKey]);

  // Amtliche Materialien lazy aus den Kanten-Shards (E6a·M5): die kuratierten
  // In-Bundle-Materialien (kontextSync) decken nur die Alt-Einträge; die per
  // Adapter erfassten Behördenpublikationen (300+ Dokumente, artikelscharf) liegen
  // als erlass-lokale Shards und werden hier nachgeladen. Ergebnis trägt seinen
  // eigenen Key → Ladezustand abgeleitet (kein synchrones setState im Effekt-Body).
  const [softLawGeladen, setSoftLawGeladen] = useState<{ key: string; refs: MaterialBezug[] } | null>(null);
  useEffect(() => {
    if (typ === 'material') return; // Material-Reader IST das Material
    const keys = normKeysKey ? normKeysKey.split(',') : [];
    let lebt = true;
    kontextSoftLaw(typ, keys).then((r) => { if (lebt) setSoftLawGeladen({ key: normKeysKey, refs: r }); });
    return () => { lebt = false; };
  }, [typ, normKeysKey]);
  const softLaw: MaterialBezug[] =
    softLawGeladen && softLawGeladen.key === normKeysKey ? softLawGeladen.refs : [];

  // «via Art. N»-Sublabels (V1.2, Magic Moment 5): nur im Gesetz-Reader (genau
  // EIN normKey) aus dem erlass-lokalen Shard invertiert — kein neuer Datenpfad,
  // derselbe Promise-Cache wie die LeitfallZeile (§5/§15.3). Kein Shard = keine
  // Sublabels (stiller, ehrlicher Ausfall).
  const einzelErlass = typ === 'norm' && normKeys.length === 1;
  const [artikelMap, setArtikelMap] = useState<{ key: string; map: Map<string, string> } | null>(null);
  useEffect(() => {
    if (!einzelErlass) return;
    let lebt = true;
    ladeLeitfallShard(normKeysKey).then((shard) => {
      if (lebt && shard) setArtikelMap({ key: normKeysKey, map: artikelProEntscheid(shard) });
    });
    return () => { lebt = false; };
  }, [einzelErlass, normKeysKey]);
  const viaArtikel: Map<string, string> | null =
    einzelErlass && artikelMap?.key === normKeysKey ? artikelMap.map : null;
  // §V1c: Revisions-Shard des EINEN Erlasses (Normrevisions-Ehrlichkeit) — lazy,
  // derselbe idle-Slot wie der Leitfall-Shard. Klassifiziert je Entscheid-Chip über
  // das «via Art. N»-Sublabel + das Entscheiddatum, ob die Norm SEIT dem Entscheid
  // revidiert wurde. Kein Sublabel = keine Klassifikation (still).
  const [revShard, setRevShard] = useState<{ key: string; shard: RevisionShard | null } | null>(null);
  useEffect(() => {
    if (!einzelErlass) return;
    let lebt = true;
    ladeRevisionShard(normKeysKey).then((shard) => { if (lebt) setRevShard({ key: normKeysKey, shard }); });
    return () => { lebt = false; };
  }, [einzelErlass, normKeysKey]);
  const revShardAktuell: RevisionShard | null =
    einzelErlass && revShard?.key === normKeysKey ? revShard.shard : null;
  // Kürzel des EINEN Erlasses — für den ?norm=-Fundstellen-Sprung im Ziel-Entscheid
  // (Auftrag David 3.7.2026: eingehende Entscheid-Links landen an der Erwägung).
  const eigenKuerzel = einzelErlass ? normenFuer(normKeys)[0]?.kuerzel ?? null : null;

  // Entscheid-Reader: leer (Selbst-Korpus). Sonst nur das zum AKTUELLEN Key
  // gehörende Resultat zeigen; ein veralteter/fehlender Treffer = «lädt».
  const entscheide: EntscheidRef[] | null =
    typ === 'entscheid' ? [] : (geladen && geladen.key === normKeysKey ? geladen.refs : null);

  const entscheideLaden = entscheide === null;
  const sichtbareEntscheide = entscheide ? entscheide.slice(0, MAX_ENTSCHEIDE) : [];
  const restEntscheide = entscheide ? Math.max(0, entscheide.length - MAX_ENTSCHEIDE) : 0;
  // Ziel für «alle Entscheide»: bei genau einer Norm vorgefiltert, sonst Übersicht.
  const alleEntscheideZiel = normKeys.length === 1
    ? `/rechtsprechung?norm=${encodeURIComponent(normKeys[0])}`
    : '/rechtsprechung';

  // Sync-kuratierte + async-Soft-Law-Materialien zu EINER Gruppe gemerged, dedupe
  // per key (bestehender kuratierter Eintrag gewinnt, §2.6). Max. 8 sichtbar.
  const alleMaterialien = mischeMaterialien(materialien, softLaw);
  // Solange die async-Materialien für den aktuellen Key noch laden, gilt das Panel
  // NICHT als leer (kein vorzeitiges Leerbild → kein Flash/CLS).
  const softLawLaden = typ !== 'material' && (!softLawGeladen || softLawGeladen.key !== normKeysKey);

  const hatSync = normen.length > 0 || alleMaterialien.length > 0 || werkzeuge.length > 0;
  const istLeer = !zusatzGruppen && !hatSync && !entscheideLaden && !softLawLaden && (entscheide?.length ?? 0) === 0;

  return (
    <section aria-labelledby="kontext-titel" className="mt-12 border-t border-line pt-6 space-y-5 max-w-reading">
      <div className="flex items-baseline gap-3">
        <h2 id="kontext-titel" className="lc-overline text-brass-700">Kontext</h2>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>

      {istLeer ? (
        <p className="text-body-s text-ink-500">
          Noch keine Querverweise zu Entscheiden, Materialien oder Werkzeugen erfasst.
        </p>
      ) : (
        <div className="space-y-5">
          {/* Reader-eigene Gruppen zuerst (V1.3: Entscheid-Richtungen am Fuss). */}
          {zusatzGruppen}

          {/* Normen (für Entscheid- und Material-Reader). */}
          {!ohneNormen && normen.length > 0 && (
            <KontextGruppe titel="Erlasse" richtung="Wendet an" anzahl={normen.length}
              hinweis={<><span className="num">{normen.length}</span> erfasste Erlasse — aus den zitierten Normen der Quelle abgeleitet.</>}>
              <ul className="flex flex-wrap gap-2">
                {normen.map((n) => (
                  <li key={n.key} className="inline-flex items-center">
                    <KantenChip to={n.pfad} label={n.kuerzel} titel={n.titel} />
                    {kannOeffnen && !istOffen(n.pfad) && (
                      <DanebenKnopf ziel={n.pfad} label={n.kuerzel} oeffneDaneben={oeffneDaneben} />
                    )}
                  </li>
                ))}
              </ul>
            </KontextGruppe>
          )}

          {/* Entscheide (für Norm- und Material-Reader). */}
          {(entscheideLaden || (entscheide && entscheide.length > 0)) && (
            <KontextGruppe titel="Bundesgerichtsentscheide" richtung="Wird zitiert von"
              anzahl={entscheide?.length ?? 0}
              hinweis={entscheideLaden ? undefined : typ === 'material'
                ? <><span className="num">{entscheide?.length ?? 0}</span> erfasste Entscheide — über die gemeinsam zitierten Erlasse zugeordnet: zwei Schritte entfernt, entsprechend unschärfer. Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung.</>
                : <><span className="num">{entscheide?.length ?? 0}</span> erfasste Entscheide — maschinell aus den zitierten Normen zugeordnet, keine redaktionelle Präjudizienauswahl. Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung.</>}>
              {entscheideLaden ? (
                <p className="text-body-s text-ink-500">Entscheide werden geladen …</p>
              ) : (
                <>
                  <ul className="flex flex-col gap-1.5">
                    {sichtbareEntscheide.map((r) => {
                      // Artikel-Sublabel + Fundstellen-Sprung (nur Gesetz-Reader,
                      // Shard vorhanden): «via Art. N» als EIN Zusatz am Eintrag,
                      // ?norm= lässt das Ziel zur Erwägungs-Fundstelle springen.
                      const artikel = viaArtikel?.get(r.key) ?? null;
                      const normZitat = artikel && eigenKuerzel ? `Art. ${artikel} ${eigenKuerzel}` : null;
                      const ziel = `/rechtsprechung/${encodeURIComponent(r.key)}${normZitat ? `?norm=${encodeURIComponent(normZitat)}` : ''}`;
                      // §V1c: revidiert nur, wenn ein «via Art. N» vorliegt (sonst
                      // kein Artikelbezug zum Klassifizieren) und der Entscheid VOR
                      // der letzten Textänderung dieses Artikels liegt.
                      const rev = artikel ? revisionFuerToken(revShardAktuell, artikel) : undefined;
                      const revidiert = artikel
                        && klassifiziereFassungsBezug(entscheidDatum(r.datum, r.gericht), rev) === 'revidiert'
                        ? (rev ?? null) : null;
                      return (
                        <li key={r.key} className="text-body-s">
                          <Link to={ziel} className="no-underline hover:text-brass-700">
                            <span className="font-medium">{r.zitierung}</span>
                            {r.leitcharakter === 'leitentscheid' && (
                              <StatusBadge praedikat="leitentscheid" variant="glyph" className="ml-1.5" />
                            )}
                            {revidiert && (
                              <StatusBadge praedikat="revidiert" variant="glyph" detail={revisionDetailText(revidiert)} className="ml-1.5" />
                            )}
                            {artikel && (
                              <span className="num text-micro text-ink-500"> · via Art. {artikel}</span>
                            )}
                            {r.regesteKurz && <span className="text-ink-500"> — {r.regesteKurz}</span>}
                          </Link>
                          {kannOeffnen && !istOffen(ziel) && (
                            <DanebenKnopf ziel={ziel} label={r.zitierung} oeffneDaneben={oeffneDaneben} className="ml-1 align-middle" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {restEntscheide > 0 && (
                    <Link to={alleEntscheideZiel} className="text-body-s text-brass-700 hover:underline">
                      Alle <span className="num">{entscheide?.length}</span> erfassten Entscheide ansehen →
                    </Link>
                  )}
                </>
              )}
            </KontextGruppe>
          )}

          {/* Amtliche Materialien (Norm- + Entscheid-Reader): kuratierte In-Bundle-
              Einträge + async Soft-Law-Kanten (E6a·M5), EINE Gruppe, dedupe per key.
              W2·5d U-VERWEIS/A13 (David 5.7.2026, «klarere verweise zu den
              materialien sofern relevant»): ARTIKELSCHARFE Kanten prominent zuerst
              (Fundstellen-Sublabel «via Art. 21», Behörden-Kürzel, Dokument-Stand);
              reine ERLASS-EBENE-Kanten dezenter HINTER dem Zähler (<details>,
              tastatur-/CLS-fest wie RegesteBlock) — keine Chip-Wüste, Dichte-Regel
              bleibt. Staleness-Hinweis §2.4, «maschinell»-Badge nur bei Heuristik. */}
          {alleMaterialien.length > 0 && (() => {
            const artikelScharf = alleMaterialien.filter((m) => m.artikel || m.sublabel);
            const erlassEbene = alleMaterialien.filter((m) => !m.artikel && !m.sublabel);
            const sichtbarScharf = artikelScharf.slice(0, MAX_MATERIALIEN);
            const restScharf = artikelScharf.length - sichtbarScharf.length;
            const zeile = (m: MaterialBezug) => {
              // Staleness (§2.4): nur im Einzel-Erlass-Reader (Revisions-Shard geladen)
              // und nur bei artikelscharfem Bezug — Dokument-Stand vor der letzten
              // Textänderung des Artikels ⇒ Hinweis, nie ein «aktuell»-Siegel (R16).
              const rev = m.artikel ? revisionFuerToken(revShardAktuell, m.artikel) : undefined;
              const veraltet = !!m.artikel
                && klassifiziereFassungsBezug({ iso: m.stand, praezision: 'tag' }, rev) === 'revidiert';
              return (
                <li key={m.key} className="text-body-s">
                  <Link to={m.pfad} className="no-underline hover:text-brass-700">
                    <span className="text-ink-500">{m.behoerdeKuerzel} · {m.doktypLabel}{m.nummer ? ` ${m.nummer}` : ''}</span>
                    {' — '}<span className="font-medium">{m.titel}</span>
                    {m.sublabel && <span className="num text-micro font-normal text-ink-500"> · {m.sublabel}</span>}
                    <span className="num text-micro text-ink-500"> · Stand {kurzDatum(m.stand)}</span>
                    {m.herkunft === 'maschinell' && (
                      <StatusBadge praedikat="maschinell" className="ml-1.5 align-middle" />
                    )}
                  </Link>
                  {kannOeffnen && !istOffen(m.pfad) && (
                    <DanebenKnopf ziel={m.pfad} label={`${m.behoerdeKuerzel} ${m.doktypLabel}`} oeffneDaneben={oeffneDaneben} className="ml-1 align-middle" />
                  )}
                  {veraltet && m.artikel && (
                    <span className="block text-micro text-warn-700">
                      Dokument-Stand vor der letzten Änderung von Art. {anzeigeArtikel(m.artikel)}.
                    </span>
                  )}
                </li>
              );
            };
            return (
              <KontextGruppe titel="Amtliche Materialien" richtung="Legt aus" anzahl={alleMaterialien.length}
                hinweis={<><span className="num">{alleMaterialien.length}</span> erfasste Behördenpublikationen (Kreisschreiben, Wegleitungen, Leitfäden u. a.) — kein Gesetzesrang.</>}>
                {artikelScharf.length > 0 && (
                  <ul className="flex flex-col gap-1.5">{sichtbarScharf.map(zeile)}</ul>
                )}
                {restScharf > 0 && (
                  <Link to="/materialien" className="text-body-s text-brass-700 hover:underline">
                    Noch <span className="num">{restScharf}</span> weitere mit Artikel-Bezug · alle Materialien ansehen →
                  </Link>
                )}
                {erlassEbene.length > 0 && (
                  <details className="group">
                    <summary className="cursor-pointer list-none text-body-s text-ink-500 hover:text-brass-700 [&::-webkit-details-marker]:hidden">
                      <span aria-hidden className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
                      <span className="num">{erlassEbene.length}</span>
                      {erlassEbene.length === 1 ? ' Dokument' : ' Dokumente'} auf Erlass-Ebene (ohne Artikel-Bezug)
                    </summary>
                    <ul className="mt-1.5 flex flex-col gap-1.5 border-l border-line pl-3">
                      {erlassEbene.map(zeile)}
                    </ul>
                  </details>
                )}
              </KontextGruppe>
            );
          })()}

          {/* Werkzeuge (für alle drei Reader) — kein Zitat-Beziehungstyp, darum
              bewusst ohne Richtungs-Label. */}
          {werkzeuge.length > 0 && (
            <KontextGruppe titel="Passende Werkzeuge" anzahl={werkzeuge.length}
              hinweis="Aus den verknüpften Normen abgeleitet (grobe Zuordnung, keine kuratierte Empfehlung).">
              {/* Mobil eine scrollbare Chip-Reihe, ab sm normaler Umbruch. */}
              <ul className="flex gap-2 overflow-x-auto pb-1 -mb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mb-0 [scrollbar-width:thin]">
                {werkzeuge.map((w) => (
                  <li key={w.id} className="shrink-0 inline-flex items-center">
                    <Link to={w.href}
                      className="lc-chip whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400">
                      <span className="text-ink-500 mr-1" aria-hidden>{w.modus === 'rechner' ? '⊞' : '▤'}</span>{w.titel}
                    </Link>
                    {/* «daneben öffnen»: Norm bleibt links, Werkzeug erscheint
                        rechts im Split-View (B-2). Nur ab lg + freier Kapazität. */}
                    {kannOeffnen && !istOffen(w.href) && (
                      <DanebenKnopf ziel={w.href} label={w.titel} oeffneDaneben={oeffneDaneben} />
                    )}
                  </li>
                ))}
              </ul>
            </KontextGruppe>
          )}
        </div>
      )}
    </section>
  );
}

import { Link } from 'react-router-dom';
import { NormChip } from '../../../components/vorlagen/NormChip';
import { SUCH_META } from '../suchHighlight';
import { BezuegeKopf, type BezugsMarke } from './BezuegeKopf';
import { BezuegeZeile } from './BezuegeZeile';
import { LeitfallZeile } from './ArtikelLeser.leitfaelle';
import type { ArtikelBezuege } from '../bezuegeLaden';
import type { LeitfallRef } from '../../../lib/rechtsprechung/norm-index';
import type { MaterialBezug, Werkzeug } from '../../../lib/normtext/werkzeuge';
import type { ArtikelRevision } from '../../../lib/verzahnung/artikel-revisionen';

// ═══ Die BEZÜGE-ZEILE der Breitform (R6b) ═══════════════════════════════════
//
// §6.6-Split aus `./ArtikelLeser.tsx` (W2·24-F, 7.9.2026 — 866 Zeilen gegen
// die Schwelle 800). Herausgelöst ist der Block, den die BREITFORM unter dem
// Artikelkopf zeigt und den die Zeilenform gar nicht kennt: die vier Rubriken
// (Entscheide · Materialien · Verweise · Rechnen) samt der Zahlen-Zeile, aus
// der sie aufklappen. Er hat einen eigenen Aufhänger (`kopfForm`), eine eigene
// Datenquelle (`bezuegeImKopf`) und eine eigene Zusage
// (`e2e/leser-bezuege-inhalt-d30.e2e.ts`) — deshalb ist er ein Bauteil und
// nicht bloss ein Abschnitt.
//
// WAS HIER NICHT STEHT: die Rechtsprechungs-Zeile der ZEILENFORM am
// Artikelfuss. Sie bleibt im Beiwerk der Hauptdatei — NIE beide Orte zugleich
// (§5: zwei Wahrheiten am selben Artikel).
//
// VERHALTENSNEUTRAL (§6): Markup, Reihenfolge, Klassen und die Rechnung der
// Marken sind wörtlich übernommen; verändert sind nur die Namen der von aussen
// kommenden Werte (`onBezuegeOeffnen` → `onOeffnen`, `bezuegeLaedt && !bezuege`
// → `laedt`). Golden-Beweis über `npm run golden:vergleich` und
// `check:golden-normtext`.

export function ArtikelBezuegeZone({
  bezuege, bezuegeImKopf, leitfaelle, materialien, verweise, werkzeuge, zaehler,
  zitat, revision, onOeffnen, laedt,
}: {
  bezuege?: ArtikelBezuege;
  bezuegeImKopf?: ArtikelBezuege;
  leitfaelle?: LeitfallRef[];
  materialien?: MaterialBezug[];
  /** Die im Artikel genannten, auflösbaren Normverweise (`sammleVerweise`). */
  verweise: string[];
  /** Rechner/Vorlagen an genau diesem Artikel (`randNotizWerkzeuge`). */
  werkzeuge: readonly Werkzeug[];
  zaehler?: { entscheide: number; materialien: number };
  /** KURZ-Zitat («Art. 957 OR») — Fundstellen-Signal für den Entscheid-Sprung. */
  zitat: string;
  revision?: ArtikelRevision | null;
  onOeffnen?: () => void;
  laedt?: boolean;
}) {
  /** Die Zahlen der Bezüge-Zeile — ausschliesslich aus Daten, die der Artikel
   *  ohnehin führt (§8: keine Rubrik ohne echte Zahl, keine neue Ladelogik). */
  // W2·24-R6c: die Zähl-Datei schlägt beide bisherigen Quellen — sie ist
  // GEZÄHLT, nicht gefiltert, und deshalb dieselbe Zahl vor und nach dem Laden
  // des Shards (die Zeile springt nicht mehr um, sobald der Apparat eintrifft).
  // Ohne Datei bleibt die frühere Reihenfolge unverändert bestehen: gefilterte
  // Kanten, sonst Leitfälle.
  // ── D30 (David 6.9.2026) · «ZÄHLER = LISTENLÄNGE NACH DEM LADEN» ──────────
  // Die Reihenfolge unten bleibt die von R6c (Zähl-Datei zuerst) — sie ist der
  // Grund, aus dem die Zahl beim Eintreffen des Shards nicht umspringt.
  //
  // DAVIDS REGEL IST DAMIT NICHT UMGANGEN, SONDERN AN DER WURZEL ERFÜLLT: die
  // Zähl-Datei zählt `gesamtProArtikel` des Shards, also OHNE UI-Filter
  // (`scripts/gen-bezuege-zaehler.ts`), und die Liste bezieht ihre Kanten seit
  // D30 aus `alleFuer` — ebenfalls ohne UI-Filter. Beide Wege zählen dasselbe;
  // die Zahl kann also gar nicht mehr springen, egal welcher zuerst da ist.
  // (Bis D30 tat sie es: gemessen OR 336c «11 Entscheide» im Kopf gegen 3
  // gezeigte, weil `bezuegeFuer` die Panel-Facetten anwandte — Herleitung in
  // `../bezuegeLaden`.) Dass die beiden Wege übereinstimmen, ist eine ZUSAGE
  // und keine Hoffnung: `e2e/leser-bezuege-inhalt-d30.e2e.ts` (b) misst
  // Kopfzahl gegen die Zahl der gerenderten Zeilen.
  //
  // Der Fallback nimmt `bezuegeImKopf` VOR `bezuege`: in der Kopf-Form ist das
  // die Quelle, die auch die Liste darunter zeigt — die Zahl beschriebe sonst
  // eine andere Menge als das, was daneben steht.
  const bezugsMarken: BezugsMarke[] = [
    {
      reg: 'r',
      anzahl: zaehler ? zaehler.entscheide : ((bezuegeImKopf ?? bezuege) ? (bezuegeImKopf ?? bezuege)!.kanten.length : (leitfaelle?.length ?? 0)),
      wort: ['Entscheid', 'Entscheide'],
    },
    // Die Rubrik erscheint NUR mit echter Zahl (`anzahl > 0` filtert sie sonst
    // in `BezuegeKopf` heraus) — ohne Zähl-Datei steht sie also gar nicht da,
    // statt eine Null zu behaupten (§8). Dieselbe Deckungsgleichheit wie oben:
    // die Zähl-Datei entdoppelt die Material-Kanten nach Dokument, und genau so
    // baut `projiziereMaterialien` die Liste (ein Eintrag je Dokument).
    { reg: 'm', anzahl: zaehler?.materialien ?? (materialien?.length ?? 0), wort: ['Materialie', 'Materialien'] },
    { reg: 'g', anzahl: verweise.length, wort: ['Verweis', 'Verweise'] },
    { reg: 'w', anzahl: werkzeuge.length, wort: ['Rechner', 'Rechner'] },
  ];
  return (
    <div {...{ [SUCH_META]: '' }}>
      <BezuegeKopf marken={bezugsMarken} zitat={zitat}
        onOeffnen={onOeffnen} laedt={laedt}>
        {/* ── D30 · DIE ENTSCHEIDE, DIE DER ZÄHLER VERSPRICHT ─────────
            `form="rand"`: senkrecht gestapelte Zeilen mit Zitierung und
            Regeste, Leitentscheide zuerst (die Gruppen laufen nach
            `STATUS_RANG`, BGE vor allem anderen). Das ist DIESELBE
            Komponente und dieselbe Portionierung wie überall sonst — nur
            die Gestalt, die R4 für die schmale Randspalte gebaut hat und
            die hier aus demselben Grund richtig ist: in einer aufgeklappten
            Liste unter dem Artikelkopf sucht niemand eine waagrechte
            Scrollachse. Der Klick öffnet daneben (Split-Regel M3) — das
            bringt `KanteMitVorschau` mit, nicht diese Stelle. */}
        {((bezuegeImKopf ?? bezuege) || (leitfaelle && leitfaelle.length > 0)) && (
          <div className="lr7-bez-block" data-reg="r">
            {(() => {
              const b = bezuegeImKopf ?? bezuege;
              return b
                ? <BezuegeZeile kanten={b.kanten} gesamt={b.gesamt}
                    zeitAktiv={b.zeitAktiv} kantonAktiv={b.kantonAktiv}
                    normZitat={zitat} revision={revision} form="rand" />
                : <LeitfallZeile refs={leitfaelle} normZitat={zitat} revision={revision} />;
            })()}
          </div>
        )}
        {/* ── D30 · MATERIALIEN, dieselbe Anatomie wie «Rechnen» ───────
            Ein Titel je Dokument, daneben die Art (Behörde + Doktyp) —
            dieselbe Zeilenform wie der Rechnen-Block unten (§5), damit die
            drei Rubriken der aufgeklappten Zeile EINE Liste sind und nicht
            drei Gestalten. `sublabel` ist die amtliche Fundstelle-Ziffer
            im Dokument; sie steht nur, wenn der Kanten-Shard sie führt. */}
        {materialien && materialien.length > 0 && (
          <div className="lr7-bez-block" data-reg="m">
            <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Materialien</span>
            <ul className="lr6-notiz-liste">
              {materialien.map((mat) => (
                <li key={mat.key} data-bez-material>
                  <Link to={mat.pfad}>{mat.titel}</Link>
                  <span className="lr6-notiz-art">
                    {mat.behoerdeKuerzel} {mat.doktypLabel}{mat.sublabel ? ` · ${mat.sublabel}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {verweise.length > 0 && (
          <div className="lr7-bez-block" data-reg="g">
            <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Verweise</span>
            <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </span>
          </div>
        )}
        {werkzeuge.length > 0 && (
          <div className="lr7-bez-block" data-reg="w">
            <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Rechnen</span>
            <ul className="lr6-notiz-liste">
              {werkzeuge.map((w) => (
                <li key={w.id}>
                  <Link to={w.href}>{w.titel}</Link>
                  {/* Art des Werkzeugs: ein Rechner rechnet, eine Vorlage
                      füllt ein Dokument — für die Auswahl der Unterschied. */}
                  <span className="lr6-notiz-art">{w.modus === 'vorlage' ? 'Vorlage' : 'Rechner'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </BezuegeKopf>
    </div>
  );
}

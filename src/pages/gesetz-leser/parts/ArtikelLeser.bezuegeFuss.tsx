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

// ═══ Der BEZÜGE-FUSS des Artikels — EIN Baustein für BEIDE Formen ═══════════
//
// §6.6-Split aus `./ArtikelLeser.tsx` (W2·24-F, 7.9.2026 — 866 Zeilen gegen
// die Schwelle 800). Herausgelöst sind die vier Rubriken (Entscheide ·
// Materialien · Verweise · Rechnen) samt der Zahlen-Zeile, aus der sie
// aufklappen.
//
// ── W2·24-D34 (David 7.9.2026) · DIE ZEILE STEHT AM ARTIKELENDE ────────────
// Wörtlich: «das mit den bezügen soll unten an den artikel und nicht direkt
// nach der artikel nummer». Bis D33 sass die Zeile direkt unter der
// Artikelnummer (Breitform, `kopfForm`) — dort trennte sie die Überschrift von
// ihrem eigenen Wortlaut. Sie steht jetzt UNTER dem letzten Absatz und dem
// Fussnoten-Apparat, vor dem nächsten Artikel, mit einer feinen Trennlinie
// darüber (Linien statt Flächen, F0.6). Im Druck bleibt sie ausgeblendet.
//
// DAMIT FÄLLT DIE ZWEITE STELLE. Bis D33 hatte die ZEILENFORM (@390, Pane,
// Trefferliste) einen EIGENEN Artikelfuss im Beiwerk der Hauptdatei: eine
// offene Verweis-Chip-Reihe und daneben `BezuegeZeile`/`LeitfallZeile` als
// zweiter Konsument derselben Bezugsdaten. Zwei Orte, zwei Gestalten, ein
// Fachinhalt — genau die zweite Wahrheit, die §5 verbietet. Beide Orte sind
// jetzt DIESER Baustein; die Form entscheidet nichts mehr (kein `kopfForm`-
// Aufhänger). Der alte Zweig ist ersatzlos gelöscht, nicht bewacht
// (§17-Gegengewicht).
//
// NEBENWIRKUNG, die ausdrücklich erwünscht ist: die Verweis-Chips und die
// Entscheid-Liste stehen in beiden Formen nur noch INNERHALB des `<details>`.
// Ein geschlossenes `<details>` legt seinen Inhalt nicht ins Layout — die
// unbedingte Fuss-Zeile der Zeilenform, die beim Eintreffen des Shards in den
// Lesekörper hineinwuchs (Pos. 12, `e2e/leser-v3-kontext-cls` (b)), kann es
// darum baulich nicht mehr geben.
//
// VERHALTENSNEUTRAL (§6) gegenüber D33 im INHALT: Markup, Reihenfolge, Klassen
// und die Rechnung der Marken sind unverändert; verändert sind der ORT und die
// Namen der von aussen kommenden Werte (`onBezuegeOeffnen` → `onOeffnen`,
// `bezuegeLaedt && !bezuege` → `laedt`). Golden-Beweis über
// `npm run golden:vergleich` und `check:golden-normtext`.

export function ArtikelBezuegeFuss({
  bezuege, bezuegeImFuss, leitfaelle, materialien, verweise, werkzeuge, zaehler,
  zitat, revision, onOeffnen, laedt,
}: {
  bezuege?: ArtikelBezuege;
  bezuegeImFuss?: ArtikelBezuege;
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
  // Der Fallback nimmt `bezuegeImFuss` VOR `bezuege`: das ist die Quelle, die
  // auch die Liste darunter zeigt — die Zahl beschriebe sonst eine andere
  // Menge als das, was daneben steht. (Bis D34 hiess die Prop
  // `bezuegeImKopf`; der Ort hat gewechselt, die Rangfolge nicht.)
  const bezugsMarken: BezugsMarke[] = [
    {
      reg: 'r',
      anzahl: zaehler ? zaehler.entscheide : ((bezuegeImFuss ?? bezuege) ? (bezuegeImFuss ?? bezuege)!.kanten.length : (leitfaelle?.length ?? 0)),
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
        {((bezuegeImFuss ?? bezuege) || (leitfaelle && leitfaelle.length > 0)) && (
          <div className="lr7-bez-block" data-reg="r">
            {(() => {
              const b = bezuegeImFuss ?? bezuege;
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

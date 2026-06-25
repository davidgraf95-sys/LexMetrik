import { useEffect, useState } from 'react';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ErlassKarte } from '../components/normtext/ErlassKarte';
import { ladeBrowseManifest } from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// ─── Rubrik «International» (Auftrag David 24.6.2026) ────────────────────────
//
// Eigenständige Übersicht der für die Schweiz massgeblichen Staatsverträge &
// des internationalen Rechts. ALLE Einträge sind «nur-live-link»: die Karte
// verlinkt auf den amtlichen Text (Fedlex SR 0.* bzw. EUR-Lex), KEIN Volltext-
// Snapshot, kein Extraktions-Risiko (§7/§8). Massgeblich bleibt stets die
// amtliche Quelle. Reine Darstellung (§3): nur Wiederverwendung der Gesetze-
// Karten (ErlassKarte) + Gruppierung in der Anzeigeschicht, KEINE Rechtslogik.
//
// Die Erlasse stammen aus demselben Browse-Manifest wie /gesetze (rechtsgebiet
// 'international'); dort sind sie ausgeblendet, hier zeigen wir genau sie.

// Sachliche Gruppierung (reine Anzeige-Ordnung): nach Register-Key gebündelt.
// Die Reihenfolge der Gruppen bestimmt die Lesefolge; ein nicht zugeordneter
// international-Erlass fällt in «Weitere» (nie ein Verlust).
const GRUPPEN: { id: string; titel: string; lede: string; keys: string[] }[] = [
  {
    id: 'menschenrechte',
    titel: 'Menschenrechte',
    lede: 'Die für die Schweiz verbindlichen Menschenrechtsgarantien — wirken über Querverweise in alle nationalen Rechtsgebiete hinein.',
    keys: ['EMRK', 'UNO_PAKT_II'],
  },
  {
    id: 'privat-zivil',
    titel: 'Internationales Privat- & Zivilrecht',
    lede: 'Vertrags-, Zuständigkeits- und Vollstreckungsrecht über die Grenze — vom Wiener Kaufrecht bis zum Lugano-Übereinkommen.',
    keys: ['CISG', 'LUGUE', 'VRK'],
  },
  {
    id: 'rechtshilfe',
    titel: 'Rechtshilfe (Haager Übereinkommen)',
    lede: 'Internationale Zusammenarbeit in Zivil- und Handelssachen — Zustellung, Beweisaufnahme und Kindesentführung.',
    keys: ['HZUE', 'HBEWUE', 'HKUE'],
  },
  {
    id: 'schweiz-eu',
    titel: 'Schweiz–EU',
    lede: 'Das bilaterale Verhältnis Schweiz–EU — das Freizügigkeitsabkommen als zentraler Pfeiler.',
    keys: ['FZA'],
  },
  {
    id: 'eu-verordnungen',
    titel: 'EU-Verordnungen mit Praxisrelevanz',
    lede: 'Spezifische EU-Verordnungen ohne Fedlex-Volltext, aber mit mittelbarer Wirkung auf Schweizer Sachverhalte (extraterritoriale Reichweite, grenzüberschreitendes Privatrecht) — je nur mit Link zur amtlichen EUR-Lex-Fassung.',
    keys: ['DSGVO', 'DSA', 'DMA', 'KI_VO', 'MICA', 'ROM_I', 'ROM_II', 'BRUESSEL_IA'],
  },
];

function Gitter({ erlasse }: { erlasse: BrowseErlass[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {erlasse.map((e) => <ErlassKarte key={e.key} e={e} />)}
    </div>
  );
}

export function International() {
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);
  const [fehler, setFehler] = useState(false);

  useEffect(() => {
    let lebt = true;
    ladeBrowseManifest().then((m) => {
      if (!lebt) return;
      if (!m) { setFehler(true); return; }
      setErlasse(m.erlasse.filter((e) => e.rechtsgebiet === 'international'));
    });
    return () => { lebt = false; };
  }, []);

  // Gruppen aus den geladenen Erlassen (Anzeige-Reihenfolge GRUPPEN); leere weg.
  const proKey = new Map((erlasse ?? []).map((e) => [e.key, e]));
  const zugeordnet = new Set<string>();
  const gruppen = GRUPPEN.map((g) => {
    const items = g.keys.map((k) => proKey.get(k)).filter((e): e is BrowseErlass => !!e);
    items.forEach((e) => zugeordnet.add(e.key));
    return { ...g, items };
  }).filter((g) => g.items.length > 0);
  const weitere = (erlasse ?? []).filter((e) => !zugeordnet.has(e.key));

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="International"
        titel="International"
        intro="Für die Schweiz massgebliche Staatsverträge und internationales Recht — je mit Live-Link zur amtlichen Fassung. Diese Rubrik führt keine eigenen Volltexte: massgeblich ist stets die amtliche Quelle (Fedlex bzw. EUR-Lex), keine Snapshots."
      />

      {fehler && (
        <div className="lc-notice lc-notice-warn">
          Die Übersicht konnte nicht geladen werden. Bitte die Seite neu laden.
        </div>
      )}

      {!erlasse && !fehler && (
        <div className="py-12 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          <p className="text-body-s text-ink-500">Die Übersicht wird abgerufen …</p>
        </div>
      )}

      {erlasse && (
        <div className="space-y-10">
          {gruppen.map((g) => (
            <section key={g.id} id={g.id} className="space-y-3 scroll-mt-24">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{g.titel}</h2>
                  <span aria-hidden className="flex-1 h-px bg-line" />
                  <span className="num text-body-s text-ink-500">{g.items.length}</span>
                </div>
                <p className="text-body-s text-ink-500 max-w-reading">{g.lede}</p>
              </div>
              <Gitter erlasse={g.items} />
            </section>
          ))}
          {weitere.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="font-sans font-medium text-ink-700 text-body-l">Weitere</h2>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <Gitter erlasse={weitere} />
            </section>
          )}
          {gruppen.length === 0 && weitere.length === 0 && (
            <p className="text-body-s text-ink-500">Kein Eintrag gefunden.</p>
          )}
        </div>
      )}
    </div>
  );
}

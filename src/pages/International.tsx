import { useEffect, useState } from 'react';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { InternationalRubriken } from '../components/normtext/InternationalRubriken';
import { ladeBrowseManifest } from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

// ─── Rubrik «International» (Auftrag David 24.6.2026) ────────────────────────
//
// Eigenständige Übersicht der für die Schweiz massgeblichen Staatsverträge &
// des internationalen Rechts. ALLE Einträge sind «nur-live-link»: die Karte
// verlinkt auf den amtlichen Text (Fedlex SR 0.* bzw. EUR-Lex), KEIN Volltext-
// Snapshot, kein Extraktions-Risiko (§7/§8). Massgeblich bleibt stets die
// amtliche Quelle. Reine Darstellung (§3).
//
// Die Gruppierung/Darstellung lebt in der geteilten Komponente
// `InternationalRubriken` (§5) — dieselbe wird im International-Tab der
// Gesetzes-Übersicht (/gesetze) wiederverwendet.

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

      {erlasse && <InternationalRubriken erlasse={erlasse} />}
    </div>
  );
}

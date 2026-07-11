import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ladeBrowseManifest } from '../lib/normtext/browse';
import { ladeEntscheidManifest } from '../lib/rechtsprechung/browse';
import { ladeMaterialManifest } from '../lib/materialien/browse';

// ─── Seite «Was ist drin» — Korpus-Abdeckung (UI-NAV S3/E1) ─────────────────
//
// §8-Offenlegung, was die LexMetrik-Suche wirklich durchsucht — aus den ohnehin
// vorhandenen Registern abgeleitet (kein Zweit-Index, K10; reine Ableitung §3,
// keine Rechtslogik). Deckt gezielt den in der Praxis-Linse benannten Kantons-/
// Rechtsprechungs-Blindflug: kantonale Erlasse liegen im Reader im Volltext,
// sind aber (Suchindex Bund-only, §11.5) nur nach Titel durchsuchbar; die
// Fusszeile der Suche verlinkt hierher.

interface Zahlen {
  bundVolltext: number;
  kantonTitel: number;
  bge: number;
  entscheideGesamt: number;
  materialien: number;
}

export function Abdeckung() {
  const [z, setZ] = useState<Zahlen | null>(null);

  useEffect(() => {
    let abgebrochen = false;
    Promise.all([ladeBrowseManifest(), ladeEntscheidManifest(), ladeMaterialManifest()]).then(([g, e, m]) => {
      if (abgebrochen) return;
      const erlasse = g?.erlasse ?? [];
      const entscheide = e?.entscheide ?? [];
      setZ({
        bundVolltext: erlasse.filter((x) => x.ebene === 'bund' && x.status === 'snapshot').length,
        kantonTitel: erlasse.filter((x) => x.ebene === 'kanton').length,
        bge: entscheide.filter((x) => x.bgeReferenz).length,
        entscheideGesamt: entscheide.length,
        materialien: m?.materialien?.length ?? 0,
      });
    });
    return () => { abgebrochen = true; };
  }, []);

  return (
    <div className="space-y-10">
      <SeitenKopf overline="Suche" titel="Was ist durchsuchbar" />

      <p className="max-w-reading text-body-s leading-relaxed text-ink-600">
        Die Suche oben durchsucht den unten aufgeführten Bestand. Massgeblich bleibt immer die
        amtliche Fassung — jeder Erlass und jeder Entscheid trägt Stand und Live-Link zur Quelle.
        Was noch fehlt, wird hier ehrlich benannt statt weggeglättet.
      </p>

      <div className="space-y-8">
        <section className="space-y-2 border-t border-line pt-6">
          <h2 className="text-h3 font-display font-semibold text-ink-900">Gesetze</h2>
          <p className="max-w-reading text-body-s leading-relaxed text-ink-600">
            <strong className="text-ink-900">{z ? z.bundVolltext : '…'} Bundeserlasse</strong> sind im
            Volltext durchsuchbar — die Suche findet einzelne Artikel nach Wortlaut. Die{' '}
            <strong className="text-ink-900">{z ? z.kantonTitel : '…'} kantonalen Erlasse</strong> liegen im
            Reader ebenfalls im Volltext vor, sind in der Suche aber nur <em>nach Titel</em> auffindbar
            (der Artikel-Volltextindex ist derzeit Bund-only). Über{' '}
            <Link to="/gesetze" className="text-brass-700 no-underline hover:text-brass-600">Gesetze</Link>{' '}
            sind alle browse- und lesbar.
          </p>
        </section>

        <section className="space-y-2 border-t border-line pt-6">
          <h2 className="text-h3 font-display font-semibold text-ink-900">Rechtsprechung</h2>
          <p className="max-w-reading text-body-s leading-relaxed text-ink-600">
            Im Bestand sind <strong className="text-ink-900">{z ? z.entscheideGesamt : '…'} Entscheide</strong>,
            davon <strong className="text-ink-900">{z ? z.bge : '…'} amtliche Leitentscheide (BGE)</strong> mit
            Regeste. Ein BGE-Zitat («BGE 152 I 65») springt aus der Suche direkt in den Entscheid; ist es
            nicht im Bestand, verweist die Suche ehrlich auf die amtliche Fassung beim Bundesgericht.
            Daten: OpenCaseLaw — massgeblich bleibt die amtliche Fassung. Keine Rechtsberatung.
          </p>
          <p className="max-w-reading text-body-s text-ink-500">
            <Link to="/rechtsprechung" className="text-brass-700 no-underline hover:text-brass-600">Zur Rechtsprechung →</Link>
          </p>
        </section>

        <section className="space-y-2 border-t border-line pt-6">
          <h2 className="text-h3 font-display font-semibold text-ink-900">Materialien</h2>
          <p className="max-w-reading text-body-s leading-relaxed text-ink-600">
            <strong className="text-ink-900">{z ? z.materialien : '…'} amtliche Ressourcen</strong>{' '}
            (Kreisschreiben, Leitfäden, Wegleitungen, Rundschreiben) — faktisches Soft-Law ohne
            Gesetzesrang, je mit Live-Link zur amtlichen Fassung.
          </p>
        </section>

        <section className="lc-notice">
          <p className="lc-overline mb-1">Grenzen der Suche</p>
          <p className="max-w-reading text-body-s text-ink-600">
            Der Volltext-Artikelindex deckt heute die Bundeserlasse ab; kantonale Erlasse und
            nicht-amtliche Entscheide sind über Titel bzw. Metadaten auffindbar, nicht über jeden
            Wortlaut. Diese Abdeckung wächst — bis dahin wird die Grenze offengelegt, nicht kaschiert.
          </p>
        </section>
      </div>
    </div>
  );
}

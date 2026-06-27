import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ladeMaterial } from '../lib/materialien/browse';
import { KontextPanel } from '../components/kontext/KontextPanel';
import { GEBIET_LABEL } from '../lib/normtext/register';
import type { BrowseMaterial } from '../lib/materialien/typen';

// ─── Reader EINES Materials (/materialien/:key) ─────────────────────────────
//
// Amtliche Ressource (Soft-Law). Zeigt NUR bibliografische Metadaten + einen
// prominenten Live-Link zur amtlichen Fassung — KEIN gespeicherter Dokument-
// inhalt (§7/§8: kein Normtext, kein Extraktionsrisiko, massgeblich bleibt die
// amtliche Quelle). Dazu die Verzahnung zu Gesetzen + Werkzeugen über normKeys
// (Burggraben-Keim, später B3-Kontext-Panel). Reine Darstellung (§3); maschinell
// kuratiert, fachlich noch nicht durch David geprüft (Abnahme-Zeitsperre, §8).

const SPRACH_LABEL: Record<string, string> = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch' };

function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function MaterialLeser() {
  const { key = '' } = useParams();
  // Ein Zustand pro geladenem key — `laden` wird abgeleitet (kein synchrones
  // setState im Effect; vermeidet kaskadierende Renders, react-hooks-Regel).
  const [data, setData] = useState<{ key: string; material: BrowseMaterial | null } | null>(null);

  useEffect(() => {
    let lebt = true;
    ladeMaterial(decodeURIComponent(key)).then((m) => {
      if (!lebt) return;
      setData({ key, material: m });
      if (m) document.title = `${m.titel} — LexMetrik`;
    });
    return () => { lebt = false; };
  }, [key]);

  const laden = !data || data.key !== key;
  const material = laden ? null : data.material;

  if (laden) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
        <p className="text-body-s text-ink-500">Das Material wird abgerufen …</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="space-y-6">
        <SeitenKopf overline="Amtliche Ressourcen" titel="Material nicht gefunden"
          intro="Dieser Eintrag existiert nicht (mehr). Zurück zur Übersicht der Materialien." />
        <Link to="/materialien" className="lc-btn lc-btn-outline lc-btn-sm">← Alle Materialien</Link>
      </div>
    );
  }

  const m = material;
  const overline = m.nummer ? `${m.behoerdeKuerzel} · ${m.doktypLabel} ${m.nummer}` : `${m.behoerdeKuerzel} · ${m.doktypLabel}`;

  return (
    <article className="space-y-8">
      <SeitenKopf overline={overline} titel={m.titel}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-body-s text-ink-500">
          <span>{m.behoerdeName}</span>
          <span aria-hidden>·</span>
          <span>Stand <span className="num">{formatiereDatum(m.stand)}</span></span>
          <span aria-hidden>·</span>
          <span>{SPRACH_LABEL[m.sprache] ?? m.sprache}</span>
          <span aria-hidden>·</span>
          <span>{GEBIET_LABEL[m.rechtsgebiet] ?? m.rechtsgebiet}</span>
        </div>
      </SeitenKopf>

      {/* §8: ehrlicher Status — Soft-Law, kein Gesetzesrang, fachlich ungeprüft. */}
      <div className="lc-notice max-w-reading">
        <p>
          <strong>Behördenpublikation, kein Gesetzesrang.</strong> Verwaltungsverordnungen
          (Kreisschreiben, Wegleitungen, Leitfäden u.&nbsp;a.) binden die Verwaltung intern und
          sind faktisch praxisleitend, aber für Gerichte und Private nicht direkt verbindlich.
          Massgeblich ist stets die amtliche Quelle. Maschinell erfasst, fachlich noch nicht
          geprüft.
        </p>
        {m.hinweis && <p className="mt-2 text-ink-500">{m.hinweis}</p>}
      </div>

      {/* Prominenter Live-Link zur amtlichen Fassung (§7c). */}
      <div>
        <a
          href={m.quelleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lc-btn lc-btn-primary"
        >
          Zur amtlichen Fassung ↗
        </a>
        <p className="mt-2 text-xs text-ink-500 break-all max-w-reading">{m.quelleUrl}</p>
      </div>

      {/* Einheitliches Kontext-Panel (B3): Norm ↔ Entscheid ↔ Werkzeug über die
          normKeys des Materials (Burggraben — Behördenpraxis an die Norm/den
          Entscheid gebunden). */}
      <KontextPanel typ="material" normKeys={m.normKeys} />

      <div className="border-t border-line pt-6">
        <Link to="/materialien" className="lc-btn lc-btn-outline lc-btn-sm">← Alle Materialien</Link>
      </div>
    </article>
  );
}

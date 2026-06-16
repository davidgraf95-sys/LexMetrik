import { useRef, useState } from 'react';
import { parsePassus } from '../lib/normtext/passus';
import { ladeKantonSnapshotViaUrl } from '../lib/normtext/laden';
import type { NormSnapshot } from '../lib/normtext/typen';
import { NormPopover } from './NormPopover';
import { NormPopoverOverlay, NormPopoverHuelle } from './vorlagen/ui';

// Kantonaler «amtliche Quelle ↗»-Link mit Volltext-Vorschau (§7-Zitat-Ausnahme,
// Entscheid David 16.6.2026). Schwester von NormChip (Bund), aber für die
// kantonalen Tarif-Quellen, die quelleUrl + Artikel als Datenfelder mitbringen.
//
// Progressive Enhancement, NULL Regression (§6): Der erste (serverseitige)
// Render ist byte-identisch zum heutigen <a target=_blank> — kein Popover,
// kein window-Zugriff (offen=false initial, Laden erst im onClick im Browser).
// Die Einbaustellen geben ihre HEUTIGE className unverändert weiter, damit der
// SSR/Prerender-Output (und damit Golden/PDF-Pfad) unangetastet bleibt.
//
// onClick-Variante (kein Doppel-Öffnen, SSR-neutral):
//  - parsePassus liefert KEIN Token → kein preventDefault → der Link öffnet
//    wie heute (Fallback; Quelle ohne erkennbaren Artikel).
//  - Token da → preventDefault + Popover-Shell SOFORT öffnen (snapshot='laedt'),
//    dann async via ladeKantonSnapshotViaUrl laden. Async-preventDefault wäre
//    zu spät; darum synchron entscheiden. Liefert das Laden null, zeigt das
//    Popover «Volltext nicht verfügbar» + den Live-Link — nie doppelt
//    geöffnet/navigiert.

const DEFAULT_CLASS = 'underline hover:text-ink-800';

export function KantonQuelleLink({ quelle, className }: {
  quelle: { quelleUrl: string; artikel: string; erlassName?: string; erlassNr?: string };
  className?: string;
}) {
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [offen, setOffen] = useState(false);
  // 'laedt' | NormSnapshot (geladen) | null (Snapshot nicht verfügbar)
  const [snapshot, setSnapshot] = useState<NormSnapshot | 'laedt' | null>('laedt');

  const p = parsePassus(quelle.artikel);
  const anzeigeLabel = `${quelle.erlassName ?? ''} ${quelle.artikel}`.trim();

  const beimKlick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!p) return; // kein erkennbarer Artikel → normaler Link öffnet wie heute
    e.preventDefault();
    setSnapshot('laedt');
    setOffen(true);
    ladeKantonSnapshotViaUrl(quelle.quelleUrl, p.artikelToken).then((s) => setSnapshot(s));
  };

  const schliessen = () => {
    setOffen(false);
    triggerRef.current?.focus(); // Fokus zurück auf den Link (A11y)
  };

  return (
    <>
      <a
        ref={triggerRef}
        href={quelle.quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className ?? DEFAULT_CLASS}
        onClick={beimKlick}
      >
        amtliche Quelle ↗
      </a>
      {offen && (
        <NormPopoverOverlay onClose={schliessen}>
          {snapshot && snapshot !== 'laedt'
            ? <NormPopover snapshot={snapshot} passus={{ absatz: p?.absatz ?? null }} onClose={schliessen} />
            : <NormPopoverHuelle zustand={snapshot === 'laedt' ? 'laedt' : 'fehlt'} url={quelle.quelleUrl} artikel={anzeigeLabel} onClose={schliessen} />}
        </NormPopoverOverlay>
      )}
    </>
  );
}

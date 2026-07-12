import { useRef, useState } from 'react';
import { parsePassus } from '../lib/normtext/passus';
import { ladeKantonSnapshotViaUrl } from '../lib/normtext/laden';
import type { NormSnapshot } from '../lib/normtext/typen';
import { NormPopover } from './NormPopover';
import { NormPopoverOverlay, NormPopoverHuelle } from './vorlagen/NormChip';
import { NormText } from './NormText';

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

export function KantonQuelleLink({ quelle, className, children }: {
  quelle: { quelleUrl: string; artikel: string; erlassName?: string; erlassNr?: string };
  className?: string;
  // Optionaler Trigger-Inhalt. Ohne children bleibt der Default «amtliche
  // Quelle ↗» (byte-identischer Erst-Render wie bisher). Mit children wird die
  // konkrete Artikel-Angabe selbst zum Popover-Trigger (David 16.6.2026).
  children?: React.ReactNode;
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
        {children ?? 'amtliche Quelle ↗'}
      </a>
      {offen && (
        <NormPopoverOverlay onClose={schliessen} triggerRef={triggerRef}>
          {snapshot && snapshot !== 'laedt'
            ? <NormPopover snapshot={snapshot} passus={{ absatz: p?.absatz ?? null, lit: p?.lit, ziff: p?.ziff }} onClose={schliessen} />
            : <NormPopoverHuelle zustand={snapshot === 'laedt' ? 'laedt' : 'fehlt'} url={quelle.quelleUrl} artikel={anzeigeLabel} onClose={schliessen} />}
        </NormPopoverOverlay>
      )}
    </>
  );
}

// Dezenter Stil für die als Popover-Trigger klickbare Artikel-Angabe.
const ARTIKEL_TRIGGER_CLASS = 'underline decoration-dotted hover:text-ink-800 cursor-pointer';

// Macht die KONKRETE Artikel-Angabe (z. B. «§ 4 Abs. 1») selbst zum Popover-
// Trigger (David 16.6.2026). Lässt sich parsePassus(quelle.artikel) NICHT
// auflösen, bleibt der Artikel-Text unverlinkt (kein toter Trigger) — und auch
// ohne quelleUrl. So entscheidet diese eine Stelle (§5/§10), wann der Artikel
// klickbar ist; die Einbaustellen rendern nur noch <KantonArtikelTrigger>.
export function KantonArtikelTrigger({ quelle }: {
  quelle: { quelleUrl?: string; artikel: string; erlassName?: string; erlassNr?: string };
}) {
  // Föderaler Posten (fedlex-Quelle, z. B. BGer «Art. 65 BGG»): über den BUND-
  // Linker rendern (NormText findet «Art. N GESETZ» und öffnet das Bund-Snapshot-
  // Popover) statt über den Kanton-Loader, der eine fedlex-URL nicht auflöst und
  // nur einen Fallback-Popover zeigte (Befund 17.6.2026).
  if (quelle.quelleUrl?.includes('fedlex.admin.ch')) {
    return <NormText text={quelle.artikel} />;
  }
  // Klickbar, sobald eine amtliche Quelle-URL existiert (David 17.6.2026: «das
  // ist immer noch nicht direkt verlinkt»). KantonQuelleLink macht daraus
  // progressive enhancement: ist der Artikel ein parsbarer Passus (Art./§ N),
  // öffnet ein Klick das Volltext-Popover; sonst (z. B. «Anhang Ziff. 1.1.1»)
  // öffnet der Link direkt die amtliche Quelle. So ist die Angabe IMMER verlinkt.
  if (!quelle.quelleUrl) return <>{quelle.artikel}</>;
  return (
    <KantonQuelleLink
      quelle={quelle as { quelleUrl: string; artikel: string; erlassName?: string; erlassNr?: string }}
      className={ARTIKEL_TRIGGER_CLASS}
    >
      {quelle.artikel}
    </KantonQuelleLink>
  );
}

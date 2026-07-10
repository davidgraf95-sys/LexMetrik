import { useState } from 'react';

// W2·5d G2b / K12a+K12b — Sticky Section-Kontextkopf: zeigt beim Scrollen die
// aktuelle Verortung IM Erlass («Titel › Abschnitt › Art. N») aus der vorhandenen
// Scroll-Spy-Infra (aktivIds/aktArtikel — KEIN neuer IntersectionObserver, keine
// Scroll-Listener-Kaskade, §15). Trägt «Zitat kopieren» (deterministisch, §7 a–d,
// aria-live-Bestätigung). Opak (bg-paper — kein Durchscheinen des Normtexts),
// CLS-neutral (feste Zeilenhöhe; der Inhalt wechselt beim Scrollen, die Box nicht).
export function SektionKontextKopf({ glieder, onSpringe, artikelLabel, zitat, top }: {
  /** Aktive Gliederungs-Glieder Wurzel→Blatt (id + Label, aus aktivIds); leer =
   *  Erlass-Wurzel. W2·5d U-KOPF/A3: jedes Glied ist ein klickbares Breadcrumb. */
  glieder: { id: string; label: string }[];
  /** Sprung zum Anfang der Gliederungsebene (klickt ein Breadcrumb-Glied). */
  onSpringe: (id: string) => void;
  /** Aktueller Artikel inkl. Kürzel («Art. 7 OR») oder null (noch keiner sichtbar). */
  artikelLabel: string | null;
  /** Voll-Zitat des aktuellen Artikels für die Kopier-Aktion (§7 a–d). */
  zitat: string;
  /** Sticky-Offset (Einzelansicht unter dem Inhalts-Kopf; Pane knapp unter Kante). */
  top: string;
}) {
  const [kopiert, setKopiert] = useState(false);
  const kopiere = () => {
    void navigator.clipboard?.writeText(zitat).then(() => {
      setKopiert(true);
      window.setTimeout(() => setKopiert(false), 1800);
    });
  };
  // W2·5d U-KOPF/A3 (David 5.7.2026): die Positions-Zeile ist zu ECHTEN,
  // klickbaren Breadcrumbs aufgelöst — jedes Glied springt zum Anfang seiner
  // Gliederungsebene (onSpringe = springeZuSektion, konsistent mit dem TOC-Klick).
  // Semantik: nav[aria-label] › ol/li; das letzte Glied (Artikel bzw. tiefste
  // Sektion) trägt aria-current="location". Mobil-Kürzung rein per CSS (kein
  // Observer, §15): erstes Glied + «…» + Artikel; die mittleren Sektionen sind
  // `hidden sm:inline-flex`. Datenquelle bleibt die vorhandene Scroll-Spy-State.
  const hatMitte = glieder.length > 1; // mittlere Sektionen werden mobil kollabiert
  return (
    <div data-kontext-kopf
      className="sticky z-[15] mb-3 flex items-center gap-2 rounded-md border border-line bg-paper px-3 py-1.5 shadow-sm"
      style={{ top }}>
      <nav aria-label="Standort im Erlass" className="min-w-0 flex-1 overflow-hidden">
        <ol className="flex min-w-0 items-center gap-1 text-xs text-ink-500">
          {glieder.map((g, i) => {
            const letztesGlied = i === glieder.length - 1;
            const istAktuell = letztesGlied && !artikelLabel;
            return (
              <li key={g.id}
                className={`inline-flex min-w-0 items-center gap-1 ${i > 0 ? 'hidden sm:inline-flex' : ''}`}
                aria-current={istAktuell ? 'location' : undefined}>
                {i > 0 && <span aria-hidden className="text-ink-300">›</span>}
                <button type="button" onClick={() => onSpringe(g.id)}
                  className="min-w-0 truncate rounded text-left hover:text-brass-700 hover:underline"
                  title={`Zu «${g.label}» springen`}>{g.label}</button>
              </li>
            );
          })}
          {/* Mobil-Kürzung: «…» steht für die kollabierten mittleren Glieder (nur
              wenn es welche gibt) — auf ≥ sm ausgeblendet, dort steht der volle Pfad. */}
          {hatMitte && (
            <li aria-hidden className="inline-flex items-center gap-1 sm:hidden">
              <span className="text-ink-300">›</span>
              <span>…</span>
            </li>
          )}
          {artikelLabel && (
            <li className="inline-flex shrink-0 items-center gap-1" aria-current="location">
              {glieder.length > 0 && <span aria-hidden className="text-ink-300">›</span>}
              <span className="num font-medium text-ink-700">{artikelLabel}</span>
            </li>
          )}
        </ol>
      </nav>
      <button type="button" onClick={kopiere}
        className="shrink-0 lc-chip hover:text-brass-700"
        aria-label={`Zitat kopieren: ${zitat}`} title="Deterministisches Zitat dieses Artikels kopieren">
        {kopiert ? '✓ kopiert' : '⧉ Zitat'}
      </button>
      <span aria-live="polite" className="sr-only">{kopiert ? `${zitat} kopiert` : ''}</span>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

// ─── Zeiterfassung / Stoppuhr (Startseite V2) ───────────────────────────────
//
// Einfache Arbeitszeit-Stoppuhr je Aufgabe — Werkzeug, KEINE Rechtslogik (§2
// betrifft Engines; eine Stoppuhr darf Date.now() nutzen). Vollständig lokal:
// die Tages-Einträge liegen in localStorage (kein Server, Berufsgeheimnis).
// SSR-sicher: Lazy-Initializer fällt serverseitig auf [] zurück; die einzige
// client-divergente Stelle (Einträge-Liste) trägt suppressHydrationWarning.

interface Eintrag { label: string; ms: number }

const KEY = 'lexmetrik-zeit';

function heuteSchluessel(): string {
  const d = new Date();
  return `${KEY}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ladeEintraege(): Eintrag[] {
  try {
    const roh = localStorage.getItem(heuteSchluessel());
    const arr = roh ? JSON.parse(roh) : [];
    return Array.isArray(arr) ? arr.filter((e) => typeof e?.label === 'string' && typeof e?.ms === 'number') : [];
  } catch {
    return [];
  }
}

function speichereEintraege(es: Eintrag[]): void {
  try { localStorage.setItem(heuteSchluessel(), JSON.stringify(es)); } catch { /* privater Modus */ }
}

const zwei = (n: number) => String(n).padStart(2, '0');
function uhr(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${zwei(Math.floor(s / 3600))}:${zwei(Math.floor((s % 3600) / 60))}:${zwei(s % 60)}`;
}
function dauer(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  return `${h > 0 ? h + 'h ' : ''}${zwei(Math.floor((s % 3600) / 60))}m ${zwei(s % 60)}s`;
}

export function Zeiterfassung() {
  const [eintraege, setEintraege] = useState<Eintrag[]>(ladeEintraege);
  const [aufgabe, setAufgabe] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [verstrichen, setVerstrichen] = useState(0); // ms, nur Anzeige
  const startRef = useRef(0);   // Date.now() beim Start
  const accRef = useRef(0);     // bereits gelaufene ms der aktuellen Aufgabe
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stoppeUhr = () => {
    if (ivRef.current !== null) { clearInterval(ivRef.current); ivRef.current = null; }
  };

  useEffect(() => stoppeUhr, []);

  const starten = () => {
    stoppeUhr(); // doppelten Interval ausschliessen
    setLaeuft(true);
    startRef.current = Date.now();
    ivRef.current = setInterval(() => setVerstrichen(accRef.current + (Date.now() - startRef.current)), 250);
  };
  const stoppenUndBuchen = () => {
    stoppeUhr();
    setLaeuft(false);
    const total = accRef.current + (Date.now() - startRef.current);
    accRef.current = 0;
    setVerstrichen(0);
    if (total > 0) {
      const label = aufgabe.trim() || 'Ohne Bezeichnung';
      const naechste = [{ label, ms: total }, ...eintraege];
      setEintraege(naechste);
      speichereEintraege(naechste);
      setAufgabe('');
    }
  };
  const zuruecksetzen = () => {
    stoppeUhr();
    setLaeuft(false);
    accRef.current = 0;
    setVerstrichen(0);
    setAufgabe('');
  };
  const loeschen = () => {
    setEintraege([]);
    speichereEintraege([]);
  };

  const summe = eintraege.reduce((a, e) => a + e.ms, 0);

  return (
    <div className="lc-card p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="num font-medium text-ink-900 tabular-nums" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', letterSpacing: '-0.02em' }}>
          {uhr(verstrichen)}
        </span>
        <input
          value={aufgabe}
          onChange={(e) => setAufgabe(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && laeuft) stoppenUndBuchen(); }}
          placeholder="Woran arbeitest du? (z. B. Schlichtungsgesuch redigieren)"
          aria-label="Aufgabe"
          className="lc-input flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-[12rem]"
        />
        <div className="flex gap-2">
          <button type="button" onClick={laeuft ? stoppenUndBuchen : starten}
            className={`lc-btn ${laeuft ? 'lc-btn-primary' : 'lc-btn-primary'}`}
            style={laeuft ? { background: 'var(--danger-700)' } : undefined}>
            {laeuft ? 'Stopp & buchen' : 'Start'}
          </button>
          <button type="button" onClick={zuruecksetzen} className="lc-btn lc-btn-ghost">Zurücksetzen</button>
        </div>
      </div>

      <div className="border-t border-line pt-2" suppressHydrationWarning>
        {eintraege.length === 0 ? (
          <p className="text-body-s text-ink-500 py-1.5">
            Noch nichts erfasst — Start drücken, um die Zeit für eine Aufgabe zu tracken.
          </p>
        ) : (
          <>
            {eintraege.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 py-2 border-b border-line last:border-0">
                <span className="text-body-s text-ink-900 min-w-0 truncate">{e.label}</span>
                <span className="num text-body-s text-ink-600 shrink-0">{dauer(e.ms)}</span>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 pt-2.5">
              <button type="button" onClick={loeschen} className="text-body-s text-ink-500 hover:text-brass-700 transition-colors">
                Heute zurücksetzen
              </button>
              <span className="text-body-s text-ink-600">Heute erfasst <b className="num text-ink-900 font-medium">{dauer(summe)}</b></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

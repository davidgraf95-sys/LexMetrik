import type { VerzugszinsErgebnis } from '../lib/verzugszins';
import { formatCHF } from '../lib/verzugszins';

// Grafische Antwort für den Verzugszins: Perioden-Zeitstrahl + Kapital/Zins-Balken.

const TINTS = ['var(--brass-100)', 'var(--brass-200)'];

export function VerzugszinsTimeline({ e }: { e: VerzugszinsErgebnis }) {
  const segmente = e.segmente;
  if (segmente.length === 0) return null;
  const totalTage = segmente.reduce((s, x) => s + x.tage, 0) || 1;

  // Grenz-Ereignisse (Teilzahlung = Kapitalrückgang; Satzwechsel) zwischen Perioden
  type Marker = { pos: number; typ: 'zahlung' | 'satz'; text: string };
  const marker: Marker[] = [];
  let kum = 0;
  segmente.forEach((s, i) => {
    kum += s.tage;
    const next = segmente[i + 1];
    if (next) {
      const pos = kum / totalTage;
      if (next.kapital < s.kapital) marker.push({ pos, typ: 'zahlung', text: `Teilzahlung am ${next.von}` });
      if (next.satz !== s.satz) marker.push({ pos, typ: 'satz', text: `Satz ${next.satz}% ab ${next.von}` });
    }
  });

  const total = e.totalOffen || 1;
  const kapAnteil = Math.max(0, Math.min(100, (e.kapitalOffen / total) * 100));

  return (
    <div className="lc-card p-5 lc-reveal space-y-4">
      <p className="lc-overline">Zeitstrahl</p>

      {/* Perioden-Leiste */}
      <div>
        <div className="relative">
          <div className="flex h-11 rounded-md overflow-hidden border border-line">
            {segmente.map((s, i) => (
              <div key={i} title={`${s.von} – ${s.bis}: ${s.tage} Tage, ${s.satz}%, CHF ${formatCHF(s.zins)}`}
                className="flex items-center justify-center num text-body-s text-ink-700 min-w-0"
                style={{ flexGrow: s.tage, flexBasis: 0, background: TINTS[i % 2] }}>
                <span className="truncate px-1">{s.satz}%</span>
              </div>
            ))}
          </div>
          {marker.map((m, i) => (
            <div key={i} className="absolute -top-1 -translate-x-1/2" style={{ left: `${m.pos * 100}%` }} title={m.text}>
              <span className="block w-0.5 h-[3.25rem] bg-ink-900" />
              <span className="block w-2 h-2 rounded-full bg-ink-900 -mt-[3.4rem] mx-auto" />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 num text-body-s text-ink-500">
          <span>{e.ersterZinstag}</span>
          <span>{e.tageTotal} Tage</span>
          <span>{e.stichtag}</span>
        </div>
        {marker.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-body-s text-ink-600">
            {marker.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink-900 inline-block" />{m.text}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Kapital / Zins-Zusammensetzung */}
      <div>
        <p className="lc-overline mb-1.5">Total offen: CHF {e.totalOffenCHF}</p>
        <div className="flex h-7 rounded-md overflow-hidden border border-line">
          <div className="flex items-center justify-center text-paper num text-body-s" style={{ width: `${kapAnteil}%`, background: 'var(--ink-900)' }} title={`Kapital CHF ${e.kapitalOffenCHF}`}>
            {kapAnteil > 18 ? `Kapital` : ''}
          </div>
          <div className="flex items-center justify-center num text-body-s text-ink-900" style={{ width: `${100 - kapAnteil}%`, background: 'var(--brass-400)' }} title={`Verzugszins CHF ${e.zinsOffenCHF}`}>
            {100 - kapAnteil > 18 ? 'Zins' : ''}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-body-s text-ink-600">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-ink-900 inline-block" />Offenes Kapital: CHF {e.kapitalOffenCHF}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: 'var(--brass-400)' }} />Offener Verzugszins: CHF {e.zinsOffenCHF}</span>
        </div>
      </div>
    </div>
  );
}

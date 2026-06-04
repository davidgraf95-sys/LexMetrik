import type { VerzugszinsErgebnis } from '../lib/verzugszins';
import { formatCHF } from '../lib/verzugszins';

// Grafische Antwort für den Verzugszins: Perioden-Zeitstrahl + Kapital/Zins-Balken.
// Mini-Perioden erhalten eine Mindestbreite; Markerpositionen werden aus denselben
// Gewichten berechnet und bleiben dadurch exakt auf den Periodengrenzen.
// Ereignisse an derselben Grenze werden zu einem nummerierten Marker zusammengefasst.

const TINTS = ['var(--brass-100)', 'var(--brass-200)'];

export function VerzugszinsTimeline({ e }: { e: VerzugszinsErgebnis }) {
  const segmente = e.segmente;
  if (segmente.length === 0) return null;
  const totalTage = segmente.reduce((s, x) => s + x.tage, 0) || 1;

  // Mindestbreite 3.5 % je Periode, sonst proportional zu den Tagen
  const gewichte = segmente.map((s) => Math.max(s.tage, totalTage * 0.035));
  const gewTotal = gewichte.reduce((a, b) => a + b, 0);

  // Grenz-Ereignisse (Teilzahlung = Kapitalrückgang; Satzwechsel), je Grenze gebündelt
  type Marker = { pos: number; texte: string[] };
  const marker: Marker[] = [];
  let kum = 0;
  segmente.forEach((s, i) => {
    kum += gewichte[i];
    const next = segmente[i + 1];
    if (!next) return;
    const texte: string[] = [];
    if (next.kapital < s.kapital) texte.push(`Teilzahlung am ${next.von}`);
    if (next.satz !== s.satz) texte.push(`Zinssatz ${next.satz} % ab ${next.von}`);
    if (texte.length) marker.push({ pos: (kum / gewTotal) * 100, texte });
  });

  // Rechte Achse: letztes Periodenende (bei vorzeitiger Tilgung ≠ Stichtag)
  const letzteBis = segmente[segmente.length - 1].bis;
  const vorzeitigGetilgt = letzteBis !== e.stichtag;

  const total = e.totalOffen || 1;
  const kapAnteil = Math.max(0, Math.min(100, (e.kapitalOffen / total) * 100));

  return (
    <div className="lc-card p-5 lc-reveal space-y-4">
      <p className="lc-overline">Zeitstrahl</p>

      {/* Perioden-Leiste */}
      <div>
        <div className={`relative ${marker.length > 0 ? 'mt-3' : ''}`}>
          <div className="flex h-11 rounded-md overflow-hidden border border-line">
            {segmente.map((s, i) => (
              <div key={i} title={`${s.von} – ${s.bis}: ${s.tage} Tage, ${s.satz} %, CHF ${formatCHF(s.zins)}`}
                className="flex items-center justify-center num text-body-s text-ink-700 min-w-0"
                style={{ flexGrow: gewichte[i], flexBasis: 0, background: TINTS[i % 2] }}>
                <span className="truncate px-1">{s.satz}%</span>
              </div>
            ))}
          </div>
          {marker.map((m, i) => (
            <div key={i} title={m.texte.join(' · ')}>
              <span aria-hidden className="absolute inset-y-0 w-px bg-ink-900 -translate-x-1/2" style={{ left: `${m.pos}%` }} />
              <span className="absolute -top-2.5 -translate-x-1/2 w-5 h-5 rounded-full bg-ink-900 text-paper num flex items-center justify-center"
                style={{ left: `${m.pos}%`, fontSize: '0.6rem', boxShadow: '0 0 0 2px var(--surface)' }}>
                {i + 1}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 num text-body-s text-ink-500">
          <span>{e.ersterZinstag}</span>
          <span>{e.tageTotal} Tage</span>
          <span>{letzteBis}{vorzeitigGetilgt ? ' (getilgt)' : ''}</span>
        </div>
        {marker.length > 0 && (
          <div className="flex flex-col gap-1 mt-2 text-body-s text-ink-600">
            {marker.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-ink-900 text-paper num inline-flex items-center justify-center shrink-0" style={{ fontSize: '0.55rem' }}>{i + 1}</span>
                {m.texte.join(' · ')}
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

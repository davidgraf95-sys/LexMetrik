import type { SperrfristenErgebnis } from '../lib/sperrfristen';

// Grafische Antwort für Kündigung + Sperrfristen: Zeitstrahl mit Zugang, Sperrfrist-Block(en)
// und Beendigung bzw. – bei Nichtigkeit – «frühestens neu kündbar».

const TYP_LABEL: Record<string, string> = {
  krankheit_unfall: 'Krankheit/Unfall', schwangerschaft: 'Schwangerschaft',
  militaer_zivil: 'Militär/Zivil', hilfsaktion: 'Hilfsaktion', betreuungsurlaub: 'Betreuungsurlaub',
};

const fmt = (iso?: string) => (iso ? iso.split('-').reverse().join('.') : '–');
const ms = (iso?: string) => (iso ? new Date(iso).getTime() : NaN);

export function KuendigungTimeline({ e }: { e: SperrfristenErgebnis }) {
  const nichtig = e.status === 'nichtig';
  const punkte: number[] = [];
  [e.zugangISO, e.beendigungISO, e.fruehesteNeueKuendigungISO].forEach((d) => { const x = ms(d); if (!isNaN(x)) punkte.push(x); });
  (e.sperrIntervalle ?? []).forEach((iv) => { [iv.von, iv.bis].forEach((d) => { const x = ms(d); if (!isNaN(x)) punkte.push(x); }); });
  if (punkte.length < 2) return null;

  let t0 = Math.min(...punkte), t1 = Math.max(...punkte);
  const span = (t1 - t0) || 1; t0 -= span * 0.05; t1 += span * 0.05;
  const pos = (iso?: string) => { const x = ms(iso); return isNaN(x) ? 0 : Math.max(0, Math.min(100, ((x - t0) / (t1 - t0)) * 100)); };

  return (
    <div className="lc-card p-5 lc-reveal space-y-3">
      <p className="lc-overline">Zeitstrahl</p>
      <div className="relative" style={{ height: '5rem' }}>
        {/* Basislinie */}
        <div className="absolute left-0 right-0 h-1 bg-line rounded" style={{ top: '2.4rem' }} />
        {/* Sperrfrist-Blöcke */}
        {(e.sperrIntervalle ?? []).map((iv, i) => {
          const l = pos(iv.von), r = pos(iv.bis);
          return (
            <div key={i} className="absolute rounded bg-warn-bg" style={{ left: `${l}%`, width: `${Math.max(0.6, r - l)}%`, top: '2rem', height: '1.4rem', boxShadow: 'inset 0 0 0 1px var(--warn-500)' }}
              title={`Sperrfrist ${TYP_LABEL[iv.typ] ?? iv.typ}: ${fmt(iv.von)} – ${fmt(iv.bis)}`} />
          );
        })}
        <Marker left={pos(e.zugangISO)} iso={e.zugangISO} color="var(--ink-900)" label="Zugang" />
        {nichtig
          ? <Marker left={pos(e.fruehesteNeueKuendigungISO)} iso={e.fruehesteNeueKuendigungISO} color="var(--brass-500)" label="neu kündbar" />
          : <Marker left={pos(e.beendigungISO)} iso={e.beendigungISO} color="var(--sage-500)" label="Beendigung" />}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-body-s text-ink-600 pt-3 border-t border-line">
        <Leg swatch="bg-ink-900" label="Zugang der Kündigung" />
        {(e.sperrIntervalle ?? []).length > 0 && <Leg swatch="bg-warn-bg" label="Sperrfrist" />}
        {nichtig
          ? <Leg style={{ background: 'var(--brass-500)' }} label="frühestens neu kündbar" />
          : <Leg swatch="bg-sage-500" label="Beendigung" />}
        {e.gehemmtTage ? <span className="num text-ink-500">· Hemmung: {e.gehemmtTage} Tage</span> : null}
      </div>
    </div>
  );
}

// Modul-Ebene (nicht im Render erzeugt): Position wird als Prop übergeben.
function Marker({ left, iso, color, label }: { left: number; iso?: string; color: string; label: string }) {
  if (!iso) return null;
  return (
    <div className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ left: `${left}%` }}>
      <span className="num text-ink-700 whitespace-nowrap" style={{ fontSize: '0.6rem' }}>{fmt(iso)}</span>
      <span className="w-px flex-1" style={{ background: color }} />
      <span className="w-2.5 h-2.5 rounded-full -mb-1" style={{ background: color }} />
      <span className="whitespace-nowrap" style={{ fontSize: '0.6rem', color }}>{label}</span>
    </div>
  );
}

function Leg({ swatch, style, label }: { swatch?: string; style?: React.CSSProperties; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3.5 h-3.5 rounded ${swatch ?? ''}`} style={style} />
      {label}
    </span>
  );
}

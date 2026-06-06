import { useMemo } from 'react';
import type { VerzugszinsErgebnis } from '../lib/verzugszins';
import { formatCHF } from '../lib/verzugszins';

// Grafische Antwort für den Verzugszins. Single Source of Truth: BEIDE Balken
// rendern ausschliesslich aus e.segmente und den Engine-Summen – keine eigene
// Rechenlogik in der Komponente.
//
// (A) Rate-Zeitstrahl: ein Abschnitt pro Segment, Breite strikt proportional
//     zu tage/Gesamttage, Farbe eindeutig und konsistent PRO SATZ (nicht pro
//     Index), Marker an den Ereignisgrenzen. Bei vorzeitiger Volltilgung füllt
//     ein neutraler «getilgt»-Abschnitt die Achse bis zum Stichtag.
// (B) Zusammensetzung: Streifenbreiten proportional zu Offenem Kapital bzw.
//     Offenem Verzugszins; Werte identisch mit den Kennzahlen-Karten.

// Farbpalette pro Satz (in Reihenfolge des Auftretens); ink-700 bleibt lesbar.
const SATZ_FARBEN = ['var(--brass-100)', 'var(--brass-300)', 'var(--sage-bg)', 'var(--slate-bg)', 'var(--warn-bg)', 'var(--brass-200)'];
const GETILGT_FARBE = 'var(--paper-sunken)';

type Abschnitt = { tage: number; label: string; farbe: string; title: string };
type Marker = { pos: number; texte: string[] };

export function VerzugszinsTimeline({ e }: { e: VerzugszinsErgebnis }) {
  const { abschnitte, marker, gesamtTage, legende } = useMemo(() => {
    const segmente = e.segmente;
    // Eindeutige, konsistente Farbe pro Satz (Reihenfolge des Auftretens)
    const saetze = Array.from(new Set(segmente.map((s) => s.satz)));
    const farbe = (satz: number) => SATZ_FARBEN[saetze.indexOf(satz) % SATZ_FARBEN.length];

    const legende = saetze.map((satz) => ({ label: `${satz} %`, farbe: farbe(satz) }));
    const abschnitte: Abschnitt[] = segmente.map((s) => ({
      tage: s.tage,
      label: `${s.satz}%`,
      farbe: farbe(s.satz),
      title: `${s.von} – ${s.bis} · ${s.tage} Tage · Kapitalbasis CHF ${formatCHF(s.kapital)} · ${s.satz}% · Zins CHF ${formatCHF(s.zins)}`,
    }));

    // Vorzeitige Kapitaltilgung: neutraler Füll-Abschnitt bis zum Stichtag,
    // damit die Achse (Verzugsbeginn → Stichtag) wahr bleibt. Nur wenn das
    // Kapital tatsächlich getilgt ist (nicht bei 30E/360-Rundungsdifferenzen);
    // danach läuft kein Zins mehr (kein Zinseszins, Art. 105 Abs. 3 OR).
    // B8-Folgefix 6.6.2026: tageTotal ist seit dem B8-Fix die SEGMENT-Summe —
    // die volle Achsenspanne rechnet die Timeline deshalb selbst aus den
    // formatieren Engine-Daten (dd.MM.yyyy), reine Anzeige-Geometrie (§3).
    const tagISO = (s: string) => s.split('.').reverse().join('-');
    const spanneTage = e.ersterZinstag && e.stichtag
      ? Math.round((Date.parse(tagISO(e.stichtag)) - Date.parse(tagISO(e.ersterZinstag))) / 86_400_000)
      : 0;
    const segmentTage = segmente.reduce((sum, s) => sum + s.tage, 0);
    const fillerTage = e.kapitalOffen <= 0 ? Math.max(0, spanneTage - segmentTage) : 0;
    if (fillerTage > 0 && segmente.length > 0) {
      abschnitte.push({
        tage: fillerTage,
        label: 'getilgt',
        farbe: GETILGT_FARBE,
        title: `${segmente[segmente.length - 1].bis} – ${e.stichtag}: Kapital getilgt – kein weiterer Zinslauf`,
      });
    }
    const gesamtTage = abschnitte.reduce((sum, a) => sum + a.tage, 0) || 1;

    // Marker an den Ereignisgrenzen (Teilzahlung = Kapitalrückgang; Satzwechsel),
    // je Grenze gebündelt; Position strikt proportional zu den Segmenttagen.
    const marker: Marker[] = [];
    let kum = 0;
    segmente.forEach((s, i) => {
      kum += s.tage;
      const next = segmente[i + 1];
      const texte: string[] = [];
      if (next) {
        if (next.kapital < s.kapital) texte.push(`Teilzahlung am ${next.von}`);
        if (next.satz !== s.satz) texte.push(`Zinssatz ${next.satz} % ab ${next.von}`);
      } else if (fillerTage > 0) {
        texte.push(`Kapital vollständig getilgt am ${s.bis}`);
      }
      if (texte.length) marker.push({ pos: (kum / gesamtTage) * 100, texte });
    });

    return { abschnitte, marker, gesamtTage, legende };
  }, [e]);

  if (e.segmente.length === 0) return null;

  const total = e.totalOffen || 1;
  const kapAnteil = Math.max(0, Math.min(100, (e.kapitalOffen / total) * 100));

  return (
    <div className="lc-card p-5 lc-reveal space-y-4">
      <p className="lc-overline">Zeitstrahl</p>

      {/* (A) Rate-Zeitstrahl */}
      <div>
        <div role="img" aria-label={`Zinsverlauf ${e.ersterZinstag} bis ${e.stichtag}, ${gesamtTage} Tage in ${abschnitte.length} Abschnitten`} className={`relative ${marker.length > 0 ? 'mt-3' : ''}`}>
          <div className="flex h-11 rounded-md overflow-hidden border border-line">
            {abschnitte.map((a, i) => (
              <div key={i} title={a.title}
                className="flex items-center justify-center num text-body-s text-ink-700 min-w-0"
                /* Mindestbreite 1.2 % (Konsistenz-Check 5.6.2026, analog
                   KuendigungTimeline): auch ein 1-Tage-Segment in einer
                   Mehrjahres-Spanne bleibt sichtbar */
                style={{ flexGrow: a.tage, flexBasis: 0, background: a.farbe, minWidth: '1.2%' }}>
                <span className="truncate px-1">{a.label}</span>
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
        {/* Achse: Verzugsbeginn → Stichtag, Gesamttage in der Mitte */}
        <div className="flex justify-between mt-1.5 num text-body-s text-ink-500">
          <span>{e.ersterZinstag}</span>
          <span>{gesamtTage} Tage</span>
          <span>{e.stichtag}</span>
        </div>
        {/* Legende (Konsistenz-Check 5.6.2026): Farbe ↔ Zinssatz, deckungs-
            gleich mit den gerenderten Segmenten – wichtig bei Mini-Segmenten,
            deren Inline-Label nicht mehr lesbar ist */}
        {legende.length > 1 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-body-s text-ink-600">
            {legende.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1.5">
                <span aria-hidden className="w-3 h-3 rounded-sm border border-line inline-block" style={{ background: l.farbe }} />
                {l.label}
              </span>
            ))}
          </div>
        )}
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

      {/* (B) Zusammensetzung: Offenes Kapital + Offener Verzugszins = Total offen */}
      <div>
        <p className="lc-overline mb-1.5">Total offen: CHF {e.totalOffenCHF}</p>
        <div className="flex h-7 rounded-md overflow-hidden border border-line">
          <div className="flex items-center justify-center text-paper num text-body-s" style={{ width: `${kapAnteil}%`, background: 'var(--ink-900)' }} title={`Offenes Kapital CHF ${e.kapitalOffenCHF}`}>
            {kapAnteil > 18 ? 'Kapital' : ''}
          </div>
          <div className="flex items-center justify-center num text-body-s text-ink-900" style={{ width: `${100 - kapAnteil}%`, background: 'var(--brass-400)' }} title={`Offener Verzugszins CHF ${e.zinsOffenCHF}`}>
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

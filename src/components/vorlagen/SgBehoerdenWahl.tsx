import { useEffect, useState } from 'react';
import { Field, inputCls } from './ui';
import type { Kanton } from '../../types/legal';
import { schlichtungAufloesung } from '../../data/schlichtungsstellen';
import { plzAufloesen } from '../../data/plz/plzAufloesung';
import { amtFuer, AMT_KANTONE } from '../../data/schlichtung/amtAufloesung';
import { zuerichKreisAemter, type ZhKreisAmt } from '../../data/schlichtung/zhAmt';

// ─── Schlichtungsgesuch: Behörden-Auflösung für alle Kantone ────────────────
// Kantonsübergreifender Ausbau (Anordnung David 5.6.2026). Reine Darstellung:
// löst die ORDENTLICHE Schlichtungsbehörde des gewählten Kantons über die
// zweifach geprüften Datenschichten auf (zentral → automatisch · liste →
// Auswahl · verzeichnis → PLZ/Gemeinde→Amt für ZH/AG/SG/TG/FR/ZG/AI bzw.
// amtlicher Verzeichnis-Link) und meldet die Adresszeilen ans Schema
// (answers.behoerdeAufgeloest). BS läuft weiter über die abgenommene
// Registry (Vorrang in der Assemble-Kette).

export function SgBehoerdenWahl({ kanton, onAufgeloest }: {
  kanton: Kanton;
  onAufgeloest: (zeilen: string[] | null) => void;
}) {
  const [plz, setPlz] = useState('');
  const [gemeinde, setGemeinde] = useState('');
  const [wahlIdx, setWahlIdx] = useState(0);
  const [zhKreise, setZhKreise] = useState<ZhKreisAmt[] | null>(null);
  const [kreisIdx, setKreisIdx] = useState(0);
  const [amtZeilen, setAmtZeilen] = useState<string[] | null>(null);

  const recherche = schlichtungAufloesung(kanton, 'ordentlich');
  const modus = recherche?.aufloesung.modus ?? null;

  // PLZ → Gemeinde (amtliches Register); Amt → Adresse (7 Kantone)
  useEffect(() => {
    let aktiv = true;
    const lade = async (): Promise<{ amt: string[] | null; kreise: ZhKreisAmt[] | null }> => {
      let g = gemeinde.trim();
      if (/^\d{4}$/.test(plz)) {
        const treffer = await plzAufloesen(plz);
        const imKanton = treffer?.filter((t) => t.kanton === kanton) ?? [];
        if (g === '' && imKanton.length === 1) g = imKanton[0].gemeinde;
      }
      if (!AMT_KANTONE.includes(kanton) || g === '') return { amt: null, kreise: null };
      if (kanton === 'ZH' && g.toLowerCase() === 'zürich') {
        return { amt: null, kreise: await zuerichKreisAemter() };
      }
      const a = await amtFuer(kanton, g);
      return { amt: a ? [a.name, a.strasse, a.plzOrt] : null, kreise: null };
    };
    lade()
      .then((r) => { if (aktiv) { setAmtZeilen(r.amt); setZhKreise(r.kreise); } })
      .catch(() => { if (aktiv) { setAmtZeilen(null); setZhKreise(null); } });
    return () => { aktiv = false; };
  }, [kanton, plz, gemeinde]);

  // Aufgelöste Zeilen ans Schema melden
  useEffect(() => {
    if (!recherche) { onAufgeloest(null); return; }
    const a = recherche.aufloesung;
    if (a.modus === 'zentral') {
      onAufgeloest([a.stelle.name, a.stelle.strasse, a.stelle.plzOrt]);
    } else if (a.modus === 'liste') {
      const s = a.stellen[Math.min(wahlIdx, a.stellen.length - 1)];
      onAufgeloest(s ? [s.name, s.strasse, s.plzOrt] : null);
    } else if (zhKreise && zhKreise.length > 0) {
      const k = zhKreise[Math.min(kreisIdx, zhKreise.length - 1)];
      onAufgeloest([k.name, k.strasse, k.plzOrt]);
    } else {
      onAufgeloest(amtZeilen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanton, modus, wahlIdx, amtZeilen, zhKreise, kreisIdx]);

  if (!recherche) return null;
  const a = recherche.aufloesung;

  return (
    <div className="space-y-3">
      {a.modus === 'zentral' && (
        <div className="lc-notice text-body-s">
          <span className="font-medium text-ink-900">{a.stelle.name}</span><br />
          {a.stelle.strasse}, {a.stelle.plzOrt} — wird als Adressat eingesetzt.
        </div>
      )}
      {a.modus === 'liste' && (
        <Field label="Zuständige Stelle wählen" hint={`${a.stellen.length} Stellen im Kanton ${kanton} — massgeblich ist das Gebiet der beklagten Partei bzw. der Sache`}>
          <select className={inputCls} value={wahlIdx} onChange={(e) => setWahlIdx(Number(e.target.value))}>
            {a.stellen.map((s, i) => <option key={s.name} value={i}>{s.name} — {s.plzOrt}</option>)}
          </select>
        </Field>
      )}
      {a.modus === 'verzeichnis' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="PLZ (beklagte Partei / Sache)" hint="amtliches Ortschaftenverzeichnis">
              <input className={inputCls + ' num w-28'} inputMode="numeric" maxLength={4} value={plz}
                onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            </Field>
            <Field label="Gemeinde" hint="falls die PLZ mehrere Gemeinden umfasst">
              <input className={inputCls} value={gemeinde} onChange={(e) => setGemeinde(e.target.value)} />
            </Field>
          </div>
          {zhKreise && (
            <Field label="Stadt Zürich: Kreis-Amt wählen" hint="massgeblich ist der Stadtkreis der beklagten Partei">
              <select className={inputCls} value={kreisIdx} onChange={(e) => setKreisIdx(Number(e.target.value))}>
                {zhKreise.map((k, i) => <option key={k.kreise} value={i}>{k.name} — {k.kreise}</option>)}
              </select>
            </Field>
          )}
          {amtZeilen && (
            <div className="lc-notice text-body-s">
              <span className="font-medium text-ink-900">{amtZeilen[0]}</span><br />
              {amtZeilen[1]}, {amtZeilen[2]} — wird als Adressat eingesetzt.
            </div>
          )}
          {!amtZeilen && !zhKreise && (
            <p className="text-body-s text-ink-600">
              {a.beschreibung}.{' '}
              <a href={a.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">Amtliches Verzeichnis öffnen ↗</a>
              {AMT_KANTONE.includes(kanton)
                ? ' — oder oben PLZ/Gemeinde eingeben für die automatische Zuordnung.'
                : ' — Adresse dort entnehmen und unten von Hand erfassen.'}
            </p>
          )}
        </>
      )}
      <p className="text-xs text-ink-500">
        Quelle: {recherche.quelle} (Stand {recherche.stand}) — zweifach geprüft, fachliche Abnahme ausstehend;
        Adresse vor Einreichung kurz gegenprüfen.
      </p>
    </div>
  );
}

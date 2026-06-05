import { useState } from 'react';
import { Field, inputCls } from '../vorlagen/ui';
import { SelectionGrid } from '../ui/SelectionGrid';
import { BetragsFeld } from '../BetragsFeld';
import {
  berechneTeuerung, monatLabel, basisAuto,
  TEUERUNG_ERSTER_MONAT, LIK_LETZTER_MONAT, LIK_QUELLE, LIK_STAND,
  type TeuerungModus, type TeuerungRundung, type TeuerungErgebnis,
} from '../../lib/teuerung';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';

// ─── LIK-Teuerungsrechner – UI ──────────────────────────────────────────────
// Reine Darstellung; Formel, Basis-AUTO-Wahl und alle Rechtsregeln liegen in
// lib/teuerung.ts (Daten: amtliche BFS-Reihe, data/likReihe.ts). Der Nutzer
// wählt MONAT/JAHR – den Indexstand schlägt der Rechner selbst nach
// (Kern-UX-Entscheid des Konzept-Berichts 5.6.2026).

const DISCLAIMER =
  'Automatisierte Orientierungsberechnung – keine Rechtsberatung. Gerechnet wird mit den ' +
  'publizierten, gerundeten BFS-Indexreihen; massgeblich sind Vertrag bzw. Urteil ' +
  '(Indexklausel, Basis, Rundung) und die amtlichen BFS-Werte.';

const MODI: { code: TeuerungModus; label: string; sub: string }[] = [
  { code: 'generisch', label: 'Wertsicherung (generisch)', sub: 'Renten, Pacht, Lizenzen – BFS-Dreisatz' },
  { code: 'indexmiete', label: 'Indexmiete', sub: '100 %-Weitergabe (Art. 269b OR / Art. 17 VMWG)' },
  { code: 'unterhalt', label: 'Unterhaltsbeitrag', sub: 'Art. 286 / 128 ZGB – Index gemäss Urteil' },
];

const JAHRE: number[] = [];
for (let j = Number(LIK_LETZTER_MONAT.slice(0, 4)); j >= Number(TEUERUNG_ERSTER_MONAT.slice(0, 4)); j--) JAHRE.push(j);
const MONATE = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

function MonatJahr({ wert, onChange, label, hint }: { wert: string; onChange: (v: string) => void; label: string; hint?: string }) {
  const [j, m] = wert.split('-');
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <select className={inputCls} value={m} onChange={(e) => onChange(`${j}-${e.target.value}`)} aria-label={`${label} – Monat`}>
          {MONATE.map((mm) => <option key={mm} value={mm}>{monatLabel(`2000-${mm}`).split(' ')[0]}</option>)}
        </select>
        <select className={inputCls + ' w-28'} value={j} onChange={(e) => onChange(`${e.target.value}-${m}`)} aria-label={`${label} – Jahr`}>
          {JAHRE.map((jj) => <option key={jj} value={jj}>{jj}</option>)}
        </select>
      </div>
    </Field>
  );
}

export function TeuerungForm() {
  const [modus, setModus] = useState<TeuerungModus>('generisch');
  const [betrag, setBetrag] = useState('1000');
  const [von, setVon] = useState('2022-12');
  const [bis, setBis] = useState(LIK_LETZTER_MONAT); // Default: letzter publizierter Monat
  const [rundung, setRundung] = useState<TeuerungRundung | ''>('');

  let ergebnis: TeuerungErgebnis | null = null;
  let fehler: string | null = null;
  try {
    ergebnis = berechneTeuerung({
      modus, betrag: Number(betrag.replace(/['\s]/g, '').replace(',', '.')),
      vonMonat: von, bisMonat: bis,
      ...(rundung ? { rundung } : {}),
    });
  } catch (e) {
    fehler = e instanceof Error ? e.message : String(e);
  }

  const pdfConfig: PdfDocConfig = {
    title: 'LIK-Teuerung',
    rechtsgrundlage: modus === 'indexmiete' ? 'Art. 269b OR · Art. 17 VMWG' : modus === 'unterhalt' ? 'Art. 286 / Art. 128 ZGB' : 'BFS-Indexierung (LIK)',
    domain: 'teuerung',
    fileBase: 'Teuerungsrechner',
    inputs: {
      'Anwendungsfall': MODI.find((x) => x.code === modus)?.label ?? modus,
      'Betrag alt': `CHF ${betrag}`,
      'Indexstand alt': monatLabel(von),
      'Indexstand neu': monatLabel(bis),
      ...(ergebnis ? { 'Indexbasis (AUTO)': `${monatLabel(ergebnis.basis)} = 100` } : {}),
    },
    hero: ergebnis ? {
      hauptlabel: 'Betrag neu',
      hauptwert: `CHF ${ergebnis.betragNeu.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`,
      nebenwerte: [
        { label: 'Veränderung', wert: `${ergebnis.prozent > 0 ? '+' : ''}${ergebnis.prozent.toFixed(1)} %` },
        { label: 'Index', wert: `${ergebnis.indexAlt.toFixed(1)} → ${ergebnis.indexNeu.toFixed(1)}` },
      ],
      kontext: `${monatLabel(von)} → ${monatLabel(bis)} · Basis ${monatLabel(ergebnis.basis)} = 100`,
    } : undefined,
    sections: ergebnis ? [{ titel: 'LIK-Indexierung', ergebnis }] : [],
    disclaimer: DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text={DISCLAIMER} />

      {/* Anwendungsfall (Progressive Disclosure) */}
      <SelectionGrid
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        items={MODI.map((m) => ({ code: m.code, label: m.label, sub: m.sub }))}
        value={modus}
        onSelect={setModus}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={modus === 'indexmiete' ? 'Nettomietzins alt (CHF/Monat)' : modus === 'unterhalt' ? 'Unterhaltsbeitrag gemäss Urteil (CHF)' : 'Betrag alt (CHF)'}>
          <BetragsFeld className={inputCls + ' num w-44'} value={betrag}
            aria-invalid={!!fehler && /Betrag/.test(fehler)}
            onChange={setBetrag} />
        </Field>
        <Field label="Rundung" hint="vertrags-/urteilsabhängig">
          <select className={inputCls} value={rundung} onChange={(e) => setRundung(e.target.value as TeuerungRundung | '')}>
            <option value="">{modus === 'generisch' ? 'auf den Rappen (Standard)' : 'auf 5 Rappen (Standard)'}</option>
            <option value="0.01">auf den Rappen</option>
            <option value="0.05">auf 5 Rappen</option>
            <option value="1">auf ganze Franken</option>
          </select>
        </Field>
        <MonatJahr label={modus === 'unterhalt' ? 'Indexstand bei Urteil/Vereinbarung' : modus === 'indexmiete' ? 'Indexstand bei Vertrag/letzter Anpassung' : 'Ausgangsmonat (Index alt)'}
          wert={von} onChange={setVon} />
        <MonatJahr label="Zielmonat (Index neu)" wert={bis} onChange={setBis}
          hint={`letzter publizierter Monat: ${monatLabel(LIK_LETZTER_MONAT)} – der LIK erscheint erst im Folgemonat${modus === 'unterhalt' ? '; Praxis: November des Vorjahres' : ''}`} />
      </div>

      {fehler && (
        <p className="lc-notice-danger text-body-s" role="alert">{fehler}</p>
      )}

      {ergebnis && (
        <div className="lc-reveal space-y-4" aria-live="polite">
          <ErgebnisAnzeige titel={`LIK-Indexierung (Basis ${monatLabel(ergebnis.basis)} = 100)`} ergebnis={ergebnis} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <p className="text-micro text-ink-500">
              Quelle: {LIK_QUELLE} · {LIK_STAND} · freie Nutzung, Quellenangabe Pflicht (OPEN-BY)
              {basisAuto(von, bis) && ` · Basis automatisch gewählt`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

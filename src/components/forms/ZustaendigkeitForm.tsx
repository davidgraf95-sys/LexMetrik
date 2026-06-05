import { useState } from 'react';
import { Field, inputCls } from '../vorlagen/ui';
import { SelectionGrid } from '../ui/SelectionGrid';
import { BetragsFeld } from '../BetragsFeld';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import {
  zustaendigkeitErgebnis, ZPO_SCHWELLEN,
  type ZustaendigkeitInput, type Streitsache, type MieteUnterfall,
} from '../../lib/zustaendigkeit';
import { stelleFuer, kantonErfasst, kantonZustaendigkeit } from '../../data/zustaendigkeitKantone';
import { behoerdeAlsBlock } from '../../lib/vorlagen/behoerden';

// ─── Zuständigkeitsrechner (ZPO) – UI (Phase 3) ─────────────────────────────
// Reine Darstellung (§3): Bundesrecht in lib/zustaendigkeit.ts, Kantonsdaten
// in data/zustaendigkeitKantone.ts. Weichen/Warnungen werden offen angezeigt;
// nicht erfasste Kantone sagen das ehrlich (§8/§13).

const DISCLAIMER =
  'Automatisierte Orientierung zur Zuständigkeit nach ZPO (Fassung seit 1.1.2025) – keine Rechtsberatung. ' +
  'Binnenverhältnis Schweiz; internationale Sachverhalte (IPRG/LugÜ), Schiedsklauseln und die ' +
  'Streitwertberechnung selbst sind nicht abgebildet. Ermessensfragen (z. B. Handelsgericht) werden ' +
  'als offene Weichen ausgewiesen; der konkrete Fall ist fachlich zu prüfen.';

const STREITSACHEN: { code: Streitsache; label: string; sub: string }[] = [
  { code: 'geldforderung', label: 'Geldforderung / vermögensrechtlich', sub: 'Vertrag, Rechnung, Darlehen u. a.' },
  { code: 'miete_wohn_geschaeft', label: 'Miete & Pacht (Wohn-/Geschäftsräume)', sub: 'inkl. Kündigungsschutz, Erstreckung, Mietzins' },
  { code: 'arbeit', label: 'Arbeitsrecht', sub: 'Forderungen aus dem Arbeitsverhältnis' },
];

const MIETE_UNTERFAELLE: { code: MieteUnterfall; label: string }[] = [
  { code: 'kuendigungsschutz', label: 'Kündigungsschutz (Anfechtung der Kündigung)' },
  { code: 'erstreckung', label: 'Erstreckung des Mietverhältnisses' },
  { code: 'mietzins_anfechtung', label: 'Schutz vor missbräuchlichem Mietzins' },
  { code: 'hinterlegung', label: 'Hinterlegung des Mietzinses' },
  { code: 'sonstige', label: 'Übrige Miet-/Pachtstreitigkeit (z. B. Forderung)' },
];

type State = {
  streitsache: Streitsache;
  vermoegensrechtlich: boolean;
  streitwertRoh: string;          // BetragsFeld-Rohwert
  mieteUnterfall: MieteUnterfall;
  glgBetroffen: boolean;
  konsumentenvertrag: boolean;
  klaegeristGeschuetzt: boolean;
  geschaeftlicheTaetigkeit: boolean;
  beklagteImHR: boolean;
  klaegerImHR: boolean;
  beklagteAuslandOderUnbekannt: boolean;
  widerklageOderGerichtlicheFrist: boolean;
  kanton: Kanton | '';
};

const DEFAULTS: State = {
  streitsache: 'geldforderung',
  vermoegensrechtlich: true,
  streitwertRoh: '',
  mieteUnterfall: 'sonstige',
  glgBetroffen: false,
  konsumentenvertrag: false,
  klaegeristGeschuetzt: true,
  geschaeftlicheTaetigkeit: false,
  beklagteImHR: false,
  klaegerImHR: false,
  beklagteAuslandOderUnbekannt: false,
  widerklageOderGerichtlicheFrist: false,
  kanton: '',
};

export function ZustaendigkeitForm() {
  const [f, setF] = useState<State>(DEFAULTS);
  const set = <K extends keyof State>(k: K, v: State[K]) => setF((alt) => ({ ...alt, [k]: v }));

  const istMiete = f.streitsache === 'miete_wohn_geschaeft';
  const istArbeit = f.streitsache === 'arbeit';
  const istGeld = f.streitsache === 'geldforderung';

  const streitwert = f.streitwertRoh.trim() === '' ? null : Number(f.streitwertRoh);
  const fehler: string[] = [];
  if (f.vermoegensrechtlich && streitwert === null) fehler.push('Streitwert angeben (oder «nicht vermögensrechtlich» wählen).');
  if (streitwert !== null && (!Number.isFinite(streitwert) || streitwert < 0)) fehler.push('Streitwert muss eine Zahl ≥ 0 sein.');

  const input: ZustaendigkeitInput | null = fehler.length > 0 ? null : {
    streitsache: f.streitsache,
    vermoegensrechtlich: f.vermoegensrechtlich,
    streitwertCHF: f.vermoegensrechtlich ? streitwert : null,
    mieteUnterfall: istMiete ? f.mieteUnterfall : undefined,
    glgBetroffen: istArbeit ? f.glgBetroffen : undefined,
    konsumentenvertrag: istGeld ? f.konsumentenvertrag : undefined,
    klaegeristGeschuetzt: f.klaegeristGeschuetzt,
    geschaeftlicheTaetigkeit: istGeld ? f.geschaeftlicheTaetigkeit : undefined,
    beklagteImHR: istGeld ? f.beklagteImHR : undefined,
    klaegerImHR: istGeld ? f.klaegerImHR : undefined,
    beklagteAuslandOderUnbekannt: f.beklagteAuslandOderUnbekannt,
    widerklageOderGerichtlicheFrist: f.widerklageOderGerichtlicheFrist,
  };

  const ergebnis = (() => {
    if (!input) return null;
    try { return zustaendigkeitErgebnis(input); } catch { return null; }
  })();
  const r = ergebnis?.resultat ?? null;

  // Stellen-Auflösung (Kantonsschicht): nur wenn Kanton gewählt UND erfasst.
  const stelle = r && f.kanton && r.schlichtung.obligatorisch
    ? stelleFuer(f.kanton, r.schlichtung.behoerdeTyp)
    : null;
  const kantonOffen = f.kanton !== '' && !kantonErfasst(f.kanton);
  const kantonDaten = f.kanton ? kantonZustaendigkeit(f.kanton) : null;

  const pdfConfig: PdfDocConfig = {
    title: 'Zuständigkeit (ZPO)',
    rechtsgrundlage: 'Bestimmung nach Art. 4 ff., 197 ff., 243 ZPO (Fassung 1.1.2025)',
    domain: 'zustaendigkeit',
    fileBase: 'Zustaendigkeit',
    inputs: {
      'Streitsache': STREITSACHEN.find((s) => s.code === f.streitsache)?.label ?? f.streitsache,
      'Streitwert': f.vermoegensrechtlich && streitwert !== null ? `CHF ${streitwert.toLocaleString('de-CH')}` : 'nicht vermögensrechtlich',
      ...(istMiete ? { 'Miet-Unterfall': MIETE_UNTERFAELLE.find((m) => m.code === f.mieteUnterfall)?.label ?? '' } : {}),
      ...(f.kanton ? { 'Kanton (Forum)': f.kanton } : {}),
    },
    hero: r ? {
      hauptlabel: 'Verfahrensart',
      hauptwert: r.verfahrensart === 'vereinfacht' ? 'Vereinfachtes Verfahren' : 'Ordentliches Verfahren',
      nebenwerte: [
        { label: 'Schlichtung', wert: r.schlichtung.obligatorisch ? 'obligatorisch' : 'entfällt' },
        ...(stelle ? [{ label: 'Zuständige Stelle', wert: stelle.name }] : []),
      ],
      kontext: r.oertlich.gerichtsstand,
    } : undefined,
    sections: ergebnis ? [{ titel: 'Zuständigkeit nach ZPO', ergebnis }] : [],
    disclaimer: DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text={DISCLAIMER} />

      <div className="space-y-2">
        <p className="lc-overline">Streitsache</p>
        <SelectionGrid
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          items={STREITSACHEN.map((s) => ({ code: s.code, label: s.label, sub: s.sub }))}
          value={f.streitsache}
          onSelect={(code) => set('streitsache', code)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Streitwert (CHF)" hint="massgeblich ist das Rechtsbegehren; die Engine berechnet den Streitwert nicht">
          <div className="space-y-1.5">
            <BetragsFeld value={f.streitwertRoh} onChange={(v) => set('streitwertRoh', v)} className={inputCls}
              placeholder="z. B. 12'000" aria-label="Streitwert in Franken" />
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" checked={!f.vermoegensrechtlich}
                onChange={(e) => set('vermoegensrechtlich', !e.target.checked)} />
              nicht vermögensrechtliche Streitigkeit
            </label>
          </div>
        </Field>
        <Field label="Kanton (Forum)" optional hint="für die konkrete Stelle mit Adresse; erfasst ist derzeit BS">
          <select className={inputCls + ' sm:max-w-[9rem]'} value={f.kanton} onChange={(e) => set('kanton', e.target.value as Kanton | '')}>
            <option value="">– wählen –</option>
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
      </div>

      {istMiete && (
        <Field label="Miet-Unterfall" hint="Schutzmaterien (Kündigungsschutz, Erstreckung, Mietzins-Schutz, Hinterlegung) sind streitwertunabhängig vereinfacht (Art. 243 Abs. 2 lit. c ZPO)">
          <select className={inputCls} value={f.mieteUnterfall} onChange={(e) => set('mieteUnterfall', e.target.value as MieteUnterfall)}>
            {MIETE_UNTERFAELLE.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
          </select>
        </Field>
      )}

      <div className="space-y-2">
        <p className="lc-overline">Konstellation</p>
        {istGeld && (
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.konsumentenvertrag} onChange={(e) => set('konsumentenvertrag', e.target.checked)} />
            <span>Konsumentenvertrag <span className="text-ink-500">(Leistung des üblichen Verbrauchs für persönliche/familiäre Bedürfnisse, Art. 32 ZPO)</span></span>
          </label>
        )}
        {istGeld && f.konsumentenvertrag && (
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700 pl-6">
            <input type="checkbox" className="mt-0.5" checked={f.klaegeristGeschuetzt} onChange={(e) => set('klaegeristGeschuetzt', e.target.checked)} />
            Die Konsumentin / der Konsument klagt
          </label>
        )}
        {istArbeit && (
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.glgBetroffen} onChange={(e) => set('glgBetroffen', e.target.checked)} />
            <span>Streit nach Gleichstellungsgesetz <span className="text-ink-500">(paritätische Behörde, vereinfacht streitwertunabhängig)</span></span>
          </label>
        )}
        <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" className="mt-0.5" checked={f.beklagteAuslandOderUnbekannt} onChange={(e) => set('beklagteAuslandOderUnbekannt', e.target.checked)} />
          <span>Beklagte Partei mit Sitz/Wohnsitz im Ausland oder Aufenthalt unbekannt <span className="text-ink-500">(einseitiger Schlichtungsverzicht, Art. 199 Abs. 2 ZPO)</span></span>
        </label>
        <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" className="mt-0.5" checked={f.widerklageOderGerichtlicheFrist} onChange={(e) => set('widerklageOderGerichtlicheFrist', e.target.checked)} />
          <span>Widerklage/Hauptintervention oder gerichtlich angesetzte Klagefrist <span className="text-ink-500">(Schlichtung entfällt, Art. 198 lit. g/h ZPO)</span></span>
        </label>
        {istGeld && (
          <details className="lc-card p-4">
            <summary className="cursor-pointer text-body-s font-medium text-ink-700">
              Handelsgerichts-Konstellation <span className="text-ink-500 font-normal">(nur Kantone mit Handelsgericht: ZH/BE/AG/SG; Art. 6 ZPO)</span>
            </summary>
            <div className="mt-3 space-y-2">
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={f.geschaeftlicheTaetigkeit} onChange={(e) => set('geschaeftlicheTaetigkeit', e.target.checked)} />
                Geschäftliche Tätigkeit mindestens einer Partei betroffen
              </label>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={f.beklagteImHR} onChange={(e) => set('beklagteImHR', e.target.checked)} />
                Beklagte Partei im Handelsregister eingetragen
              </label>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={f.klaegerImHR} onChange={(e) => set('klaegerImHR', e.target.checked)} />
                Klagende Partei im Handelsregister eingetragen
              </label>
            </div>
          </details>
        )}
      </div>

      {fehler.length > 0 && (
        <div role="alert" className="lc-notice-warn text-body-s space-y-0.5">
          {fehler.map((x, i) => <p key={i}>{x}</p>)}
        </div>
      )}

      {ergebnis && r && (
        <div className="lc-reveal space-y-4" aria-live="polite">
          <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Live-Berechnung – aktualisiert sich automatisch</p>

          {/* Eckdaten */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Verfahrensart', val: r.verfahrensart === 'vereinfacht' ? 'Vereinfacht' : 'Ordentlich' },
              { label: 'Schlichtung', val: r.schlichtung.obligatorisch
                  ? (r.schlichtung.behoerdeTyp === 'ordentlich' ? 'obligatorisch (ordentliche Behörde)' : 'obligatorisch (paritätische Behörde)')
                  : 'entfällt' },
              { label: 'Örtlich (Grundsatz)', val: r.oertlich.gerichtsstand },
            ].map((c) => (
              <div key={c.label} className="lc-tile">
                <p className="text-xs text-ink-500 mb-1">{c.label}</p>
                <p className="text-body-l font-semibold text-ink-900">{c.val}</p>
              </div>
            ))}
          </div>

          {/* Konkrete Stelle (Kantonsschicht) */}
          {stelle && (
            <div className="lc-card p-4">
              <p className="lc-overline mb-2">Zuständige Schlichtungsstelle ({f.kanton})</p>
              <p className="text-body-s text-ink-900 whitespace-pre-line">{behoerdeAlsBlock(stelle)}</p>
              <p className="text-xs text-ink-500 mt-2">Quelle: {stelle.quelle} (Stand {stelle.stand}).</p>
            </div>
          )}
          {kantonOffen && (
            <p className="lc-notice text-body-s">
              Kanton {f.kanton}: Die konkreten Stellen sind noch nicht hinterlegt — die bundesrechtliche
              Einordnung oben gilt; Behörde und Adresse bitte über das kantonale Justizportal ermitteln.
            </p>
          )}
          {kantonDaten && r.schlichtung.obligatorisch && !stelle && !kantonOffen && (
            <p className="lc-notice text-body-s">
              Für diese Behörden-Art ist im Kanton {f.kanton} noch keine Adresse hinterlegt.
            </p>
          )}

          {/* Weichen: offene Wahl-/Ermessensfragen */}
          {r.weichen.length > 0 && (
            <div className="space-y-1.5">
              {r.weichen.map((w, i) => <p key={i} className="lc-notice text-body-s">{w}</p>)}
            </div>
          )}

          <ErgebnisAnzeige titel="Zuständigkeit nach ZPO" ergebnis={ergebnis} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <p className="text-body-s text-ink-500">
              Schwellen: vereinfacht ≤ CHF {ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')} ·
              Entscheidvorschlag ≤ {ZPO_SCHWELLEN.ENTSCHEIDVORSCHLAG.toLocaleString('de-CH')} ·
              Entscheid ≤ {ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG.toLocaleString('de-CH')} (ZPO-Fassung 1.1.2025).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

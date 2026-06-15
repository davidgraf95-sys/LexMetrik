import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MV_DEFAULTS, MV_FORMULARPFLICHT, MV_OFFENE_VERIFIKATIONEN, MV_PARAMETER,
  MV_NEBENKOSTEN_WOHNEN, MV_NEBENKOSTEN_GESCHAEFT,
  mvZusammenstellen, pruefeMvGates, mvGesetzlicheFrist,
  type MvAntworten, type MvStaffel,
} from '../lib/vorlagen/mietvertrag';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, GruppenTitel, inputCls, NormLink } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VariantenKopf } from '../components/vorlagen/VariantenKopf';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { KANTONE } from '../lib/kantone';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Mietvertrag Wohn-/Geschäftsräume (Art. 253 ff. OR) ────
// Zentrale Weiche: objektTyp (Wohnraum | Geschäftsraum) + Kanton – gemäss
// Gutachten 5.6.2026. Gates: Kautionsmaximum, Mindestfristen, Index-/Staffel-
// Voraussetzungen, Nebenkosten-Einzelausweis, MWST nur Geschäftsraum; die
// kantonale Formularpflicht für den Anfangsmietzins wird als Warnung
// offengelegt. Eingaben bleiben im Browser (localStorage).

const SPEICHER_KEY = 'lexmetrik.vorlage.mietvertrag.v1';

const SCHRITTE = [
  { id: 'objekt', label: 'Mietobjekt' },
  { id: 'parteien', label: 'Parteien' },
  { id: 'dauer', label: 'Dauer & Kündigung' },
  { id: 'mietzins', label: 'Mietzins & Nebenkosten' },
  { id: 'klauseln', label: 'Kaution & Klauseln' },
  { id: 'pruefen', label: 'Prüfen & Unterzeichnen' },
] as const;

const BANNER_MV: PdfBanner = {
  titel: 'VERTRAGSENTWURF – VON BEIDEN PARTEIEN ZU UNTERZEICHNEN',
  text: 'Der Mietvertrag ist formfrei gültig; Index- und Staffelmiete bedürfen der Schriftform – die beidseitige Unterzeichnung erfüllt sie. Kantonale Formularpflichten für den Anfangsmietzins bleiben vorbehalten (Art. 270 Abs. 2 OR).',
};

const FORMULARPFLICHT_KANTONE = new Set(MV_FORMULARPFLICHT.map((k) => k.kanton));

export function VorlageMietvertrag() {
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<MvAntworten>({
      defaults: MV_DEFAULTS,
      speicherKey: SPEICHER_KEY,
      normalisieren: (g) => ({
        ...g,
        nkPositionen: Array.isArray(g.nkPositionen) ? g.nkPositionen : [],
        staffeln: Array.isArray(g.staffeln) ? g.staffeln : undefined,
      }),
    });

  // Hash-Vorauswahl der Katalog-Karte «untermietvertrag» (#untermiete) —
  // Muster RechnerKuendigung (adjusting state, kein Effect). Setzt die Weiche
  // samt denselben Untermiete-Defaults wie der UI-Schalter; überschreibt auch
  // einen gespeicherten Hauptmiete-Stand (bewusst: der Link sagt Untermiete).
  const { hash } = useLocation();
  const [hashStand, setHashStand] = useState<string | null>(null);
  if (hashStand !== hash) {
    setHashStand(hash);
    if (hash === '#untermiete' && a.mietverhaeltnis !== 'untermiete') {
      set('mietverhaeltnis', 'untermiete');
      set('zustimmungStatus', 'nicht_angefragt');
      set('untermieteUmfang', 'ganz');
    }
  }

  const ergebnis = useMemo(() => mvZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeMvGates(a), [a]);
  const wohnung = a.objektTyp === 'wohnung';
  const fristMin = mvGesetzlicheFrist(a.objektTyp);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.objektBeschrieb.trim()) f.push('Mietobjekt umschreiben (z. B. «3.5-Zimmer-Wohnung im 2. OG»).');
      if (!a.objektAdresse.trim()) f.push('Adresse des Mietobjekts angeben.');
      if (!wohnung && !a.mietzweck?.trim()) f.push('Mietzweck angeben (Geschäftsraum).');
    }
    if (i === 1) {
      if (!a.vermieterName.trim() || !a.vermieterAdresse.trim()) f.push('Vermieter mit Adresse angeben.');
      if (!a.mieterName.trim() || !a.mieterAdresse.trim()) f.push('Mieter mit Adresse angeben.');
    }
    if (i === 2) {
      if (!a.beginn) f.push('Mietbeginn angeben.');
      if (a.befristet && !a.befristetBis) f.push('Enddatum der Befristung angeben.');
    }
    if (i === 3 && !a.mietzinsNettoCHF.trim()) f.push('Nettomietzins angeben.');
    if (i === 5 && !a.datum) f.push('Vertragsdatum angeben.');
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const card = karte('mietvertrag-wohnen');
  const nkKatalog = wohnung ? MV_NEBENKOSTEN_WOHNEN : MV_NEBENKOSTEN_GESCHAEFT;

  const toggleNk = (p: string) =>
    set('nkPositionen', a.nkPositionen.includes(p) ? a.nkPositionen.filter((x) => x !== p) : [...a.nkPositionen, p]);

  const setStaffel = (i: number, patch: Partial<MvStaffel>) =>
    set('staffeln', (a.staffeln ?? []).map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'objekt': return (
        <div className="space-y-4">
          {/* Untermiete-Weiche (Ausbau 6.6.2026, Art. 262 OR geltende Fassung) */}
          <SelectionGrid
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            items={([
              ['hauptmiete', 'Mietvertrag (Hauptmiete)', 'Vermieter:in vermietet die eigene Sache'],
              ['untermiete', 'Untermietvertrag', 'Hauptmieter:in vermietet ganz oder teilweise weiter (Art. 262 OR)'],
            ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
            value={a.mietverhaeltnis ?? 'hauptmiete'}
            onSelect={(code) => {
              set('mietverhaeltnis', code);
              // abhängige Felder neutralisieren (kein Stale-State)
              if (code === 'hauptmiete') {
                set('hmVermieterName', undefined); set('hmDatum', undefined); set('hmMietzinsCHF', undefined);
                set('zustimmungStatus', undefined); set('zustimmungDatum', undefined);
                set('untermieteUmfang', undefined); set('untermieteZimmerBeschrieb', undefined);
                set('mehrleistungBegruendung', undefined); set('moebliert', undefined);
              } else {
                set('zustimmungStatus', 'nicht_angefragt'); set('untermieteUmfang', 'ganz');
              }
            }}
          />
          {a.mietverhaeltnis === 'untermiete' && (
            <div className="lc-card p-4 space-y-3">
              <GruppenTitel>Hauptmietvertrag & Zustimmung (Art. 262 OR)</GruppenTitel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Hauptvermieter:in (Name)">
                  <input className={inputCls} value={a.hmVermieterName ?? ''} onChange={(e) => set('hmVermieterName', e.target.value || undefined)} placeholder="z. B. Immo AG" />
                </Field>
                <Field label="Hauptmietvertrag vom" optional>
                  <DatumsFeld value={a.hmDatum ?? ''} onChange={(v) => set('hmDatum', v || undefined)} className={inputCls} />
                </Field>
                <Field label="Hauptmietzins netto (CHF/Monat)" hint="Vergleichsgrösse für den Missbrauchs-Check (Art. 262 Abs. 2 lit. b)">
                  <input className={inputCls + ' num'} inputMode="decimal" value={a.hmMietzinsCHF ?? ''} onChange={(e) => set('hmMietzinsCHF', e.target.value || undefined)} placeholder="z. B. 1500" />
                </Field>
                <Field label="Zustimmung des Hauptvermieters" hint="formfrei gültig — beweishalber schriftlich festhalten">
                  <select className={inputCls} value={a.zustimmungStatus ?? 'nicht_angefragt'} onChange={(e) => set('zustimmungStatus', e.target.value as MvAntworten['zustimmungStatus'])}>
                    <option value="schriftlich">liegt schriftlich vor</option>
                    <option value="muendlich">mündlich erteilt</option>
                    <option value="angefragt">angefragt — Antwort ausstehend</option>
                    <option value="nicht_angefragt">noch nicht angefragt</option>
                  </select>
                </Field>
                {(a.zustimmungStatus === 'schriftlich' || a.zustimmungStatus === 'muendlich') && (
                  <Field label="Zustimmung erteilt am" optional>
                    <DatumsFeld value={a.zustimmungDatum ?? ''} onChange={(v) => set('zustimmungDatum', v || undefined)} className={inputCls} />
                  </Field>
                )}
                <Field label="Umfang der Untermiete">
                  <select className={inputCls} value={a.untermieteUmfang ?? 'ganz'} onChange={(e) => set('untermieteUmfang', e.target.value as 'ganz' | 'teilweise')}>
                    <option value="ganz">ganze Mietsache</option>
                    <option value="teilweise">teilweise (einzelne Zimmer)</option>
                  </select>
                </Field>
              </div>
              {a.untermieteUmfang === 'teilweise' && (
                <Field label="Überlassene Räume & Mitbenutzung" hint="z. B. «Zimmer Süd; Mitbenutzung von Küche und Bad»">
                  <input className={inputCls} value={a.untermieteZimmerBeschrieb ?? ''} onChange={(e) => set('untermieteZimmerBeschrieb', e.target.value || undefined)} />
                </Field>
              )}
              <Field label="Mehrleistungen (rechtfertigen einen Aufschlag)" optional hint="Möblierung, Reinigung, Nebenleistungen — ohne Begründung ist ein Untermietzins über dem Hauptmietzins missbräuchlich (Art. 262 Abs. 2 lit. b)">
                <input className={inputCls} value={a.mehrleistungBegruendung ?? ''} onChange={(e) => set('mehrleistungBegruendung', e.target.value || undefined)} placeholder="z. B. vollständige Möblierung, Bettwäsche, Endreinigung" />
              </Field>
              <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" checked={!!a.moebliert} onChange={(e) => set('moebliert', e.target.checked || undefined)} />
                Möbliertes Zimmer (verkürzte Kündigungsfrist, Art. 266e OR)
              </label>
            </div>
          )}
          <SelectionGrid
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            items={([
              ['wohnung', 'Wohnraum', 'Wohnung, Einfamilienhaus – voller Mieterschutz'],
              ['geschaeftsraum', 'Geschäftsraum', 'Büro, Laden, Gewerbe – freiere Gestaltung'],
            ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
            value={a.objektTyp}
            onSelect={(code) => {
              set('objektTyp', code);
              // abhängige Felder neutralisieren (kein Stale-State)
              if (code === 'wohnung') { set('mwstOption', undefined); set('konkurrenzschutz', undefined); set('konkurrenzschutzText', undefined); set('konkurrenzschutzStrafeCHF', undefined); set('mietzweck', undefined); }
              if (code === 'geschaeftsraum') set('familienwohnung', undefined);
              set('nkPositionen', []);
              set('kuendigungsfristMonate', undefined);
            }}
          />
          <Field label="Mietobjekt (Beschrieb)">
            <input className={inputCls} value={a.objektBeschrieb} onChange={(e) => set('objektBeschrieb', e.target.value)}
              placeholder={wohnung ? 'z. B. 3.5-Zimmer-Wohnung im 2. OG links' : 'z. B. Büroräumlichkeiten im 1. OG, ca. 120 m²'} />
          </Field>
          <Field label="Adresse des Mietobjekts">
            <input className={inputCls} value={a.objektAdresse} onChange={(e) => set('objektAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-3">
            <Field label="Mitvermietete Nebenräume" optional>
              <input className={inputCls} value={a.nebenraeume ?? ''} onChange={(e) => set('nebenraeume', e.target.value || undefined)} placeholder="z. B. Kellerabteil Nr. 7, Estrich" />
            </Field>
            <Field label="Kanton" optional hint="für die Formularpflicht-Prüfung">
              <select className={inputCls} value={a.kanton ?? ''} onChange={(e) => set('kanton', e.target.value || undefined)}>
                <option value="">– wählen –</option>
                {KANTONE.map((k) => <option key={k} value={k}>{k}{FORMULARPFLICHT_KANTONE.has(k) ? ' (Formularpflicht)' : ''}</option>)}
              </select>
            </Field>
          </div>
          {!wohnung && (
            <Field label="Mietzweck" hint="genau umschreiben – massgeblich für Gebrauchsumfang und MWST-Option">
              <input className={inputCls} value={a.mietzweck ?? ''} onChange={(e) => set('mietzweck', e.target.value || undefined)} placeholder="z. B. Betrieb eines Architekturbüros" />
            </Field>
          )}
          {wohnung && (
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.familienwohnung ?? false} onChange={(e) => set('familienwohnung', e.target.checked || undefined)} />
              <span>Das Objekt dient als <strong>Familienwohnung</strong> <span className="text-ink-500">(besonderer Kündigungsschutz, Art. 266m/266n OR)</span></span>
            </label>
          )}
        </div>
      );

      case 'parteien': return (
        <div className="space-y-5">
          <div className="space-y-3">
            <GruppenTitel>Vermieter</GruppenTitel>
            <Field label="Name / Firma"><input className={inputCls} value={a.vermieterName} onChange={(e) => set('vermieterName', e.target.value)} /></Field>
            <Field label="Adresse"><input className={inputCls} value={a.vermieterAdresse} onChange={(e) => set('vermieterAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
          <div className="space-y-3">
            <GruppenTitel>Mieter</GruppenTitel>
            <Field label="Name"><input className={inputCls} value={a.mieterName} onChange={(e) => set('mieterName', e.target.value)} placeholder="Vorname Nachname (bzw. Firma)" /></Field>
            <Field label="Adresse"><input className={inputCls} value={a.mieterAdresse} onChange={(e) => set('mieterAdresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
            <Field label="Zweite Mieterin / zweiter Mieter" optional hint="bei zwei Mietern wird die Solidarhaftung ausdrücklich festgehalten">
              <input className={inputCls} value={a.zweiterMieterName ?? ''} onChange={(e) => set('zweiterMieterName', e.target.value || undefined)} placeholder="Vorname Nachname" />
            </Field>
          </div>
        </div>
      );

      case 'dauer': return (
        <div className="space-y-4">
          <Field label="Mietbeginn">
            <DatumsFeld value={a.beginn} onChange={(v) => set('beginn', v)} className={inputCls} />
          </Field>
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.befristet} onChange={(e) => set('befristet', e.target.checked)} />
            <span>Befristetes Mietverhältnis <span className="text-ink-500">(endet ohne Kündigung; stillschweigende Fortsetzung → unbefristet)</span></span>
          </label>
          {a.befristet ? (
            <Field label="Befristet bis">
              <DatumsFeld value={a.befristetBis ?? ''} onChange={(v) => set('befristetBis', v || undefined)} className={inputCls} />
            </Field>
          ) : (
            <>
              <Field label="Feste Erstlaufzeit (Jahre)" optional hint="nötig für Index- (≥ 5) bzw. Staffelmiete (≥ 3); sonst leer lassen">
                <input type="number" min={0} max={20} className={inputCls + ' w-28 num'} value={a.mindestdauerJahre ?? ''}
                  onChange={(e) => set('mindestdauerJahre', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
              <Field label="Kündigungsfrist (Monate)" hint={`gesetzliches Minimum: ${fristMin} Monate (${wohnung ? 'Art. 266c' : 'Art. 266d'} OR) – auf ortsübliche Termine`}>
                <input type="number" min={fristMin} max={12} className={inputCls + ' w-28 num'} value={a.kuendigungsfristMonate ?? fristMin}
                  onChange={(e) => set('kuendigungsfristMonate', Number(e.target.value))} />
              </Field>
            </>
          )}
        </div>
      );

      case 'mietzins': return (
        <div className="space-y-5">
          <Field label="Nettomietzins (CHF pro Monat)">
            <BetragsFeld className={inputCls + ' num w-44'} value={a.mietzinsNettoCHF} onChange={(v) => set('mietzinsNettoCHF', v)} placeholder="z. B. 2'150" />
          </Field>
          <div className="space-y-2">
            <GruppenTitel>Mietzins-Modell</GruppenTitel>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={([
                ['standard', 'Standard', `Referenzzins-Basis ${MV_PARAMETER.referenzzinssatz.wert.toFixed(2)} %`],
                ['index', 'Indexmiete', 'LIK-gebunden – Vertrag ≥ 5 Jahre'],
                ['staffel', 'Staffelmiete', 'feste Erhöhungen – Vertrag ≥ 3 Jahre'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.mietzinsModell}
              onSelect={(code) => {
                set('mietzinsModell', code);
                if (code !== 'staffel') set('staffeln', undefined);
                if (code !== 'index') { set('indexBasisMonat', undefined); set('indexBasisPunkte', undefined); }
                if (code === 'staffel' && !(a.staffeln?.length)) set('staffeln', [{ ab: '', erhoehungCHF: '' }]);
              }}
            />
            {a.mietzinsModell === 'index' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="LIK-Basisstand (Monat/Jahr)" hint="z. B. «Mai 2026» – definiert die Anpassungsbasis (Art. 17 VMWG)">
                  <input className={inputCls} value={a.indexBasisMonat ?? ''} onChange={(e) => set('indexBasisMonat', e.target.value || undefined)} placeholder="z. B. Mai 2026" />
                </Field>
                <Field label="Punktestand" optional>
                  <BetragsFeld className={inputCls + ' num'} value={a.indexBasisPunkte ?? ''} onChange={(v) => set('indexBasisPunkte', v || undefined)} placeholder="z. B. 107.1" />
                </Field>
              </div>
            )}
            {a.mietzinsModell === 'staffel' && (
              <div className="space-y-2">
                {(a.staffeln ?? []).map((s, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_auto] gap-2 items-end">
                    <Field label={i === 0 ? 'Erhöhung ab' : ''}>
                      <DatumsFeld value={s.ab} onChange={(v) => setStaffel(i, { ab: v })} className={inputCls} />
                    </Field>
                    <Field label={i === 0 ? 'Betrag (CHF/Monat)' : ''}>
                      <BetragsFeld className={inputCls + ' num'} value={s.erhoehungCHF} onChange={(v) => setStaffel(i, { erhoehungCHF: v } )} placeholder="z. B. 50" />
                    </Field>
                    <button type="button" onClick={() => set('staffeln', (a.staffeln ?? []).filter((_, j) => j !== i))}
                      className="text-body-s text-danger-700 hover:underline pb-2.5">entfernen</button>
                  </div>
                ))}
                {(a.staffeln?.length ?? 0) < 5 && (
                  <button type="button" onClick={() => set('staffeln', [...(a.staffeln ?? []), { ab: '', erhoehungCHF: '' }])}
                    className="lc-btn-outline lc-btn-sm">+ Staffel</button>
                )}
                <p className="text-xs text-ink-500">Höchstens eine Erhöhung pro Jahr; Beträge in Franken (<NormLink artikel="Art. 269c OR" />).</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <GruppenTitel>Nebenkosten (Art. 257a OR)</GruppenTitel>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={([
                ['akonto', 'Akonto', 'mit jährlicher Abrechnung'],
                ['pauschale', 'Pauschale', 'Durchschnitt dreier Jahre'],
                ['keine', 'Im Mietzins inbegriffen', 'keine separaten Nebenkosten'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.nebenkosten}
              onSelect={(code) => set('nebenkosten', code)}
            />
            {a.nebenkosten !== 'keine' && (
              <>
                <Field label={a.nebenkosten === 'akonto' ? 'Akonto (CHF pro Monat)' : 'Pauschale (CHF pro Monat)'}>
                  <BetragsFeld className={inputCls + ' num w-40'} value={a.nebenkostenCHF ?? ''} onChange={(v) => set('nebenkostenCHF', v || undefined)} placeholder="z. B. 250" />
                </Field>
                <p className="text-xs text-ink-500">Positionen einzeln wählen – eine Sammelklausel genügt nicht:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {nkKatalog.map((p) => (
                    <label key={p} className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                      <input type="checkbox" className="mt-0.5" checked={a.nkPositionen.includes(p)} onChange={() => toggleNk(p)} />
                      {p}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      );

      case 'klauseln': return (
        <div className="space-y-5">
          <Field label="Kaution (CHF)" optional
            hint={wohnung ? 'höchstens drei Monatszinse (Art. 257e Abs. 2 OR); Hinterlegung auf Sperrkonto auf den Namen des Mieters' : 'keine gesetzliche Obergrenze – angemessenes Verhältnis zum Risiko'}>
            <BetragsFeld className={inputCls + ' num w-44'} value={a.kautionCHF ?? ''} onChange={(v) => set('kautionCHF', v || undefined)} placeholder="z. B. 4'300" />
          </Field>
          <div className="space-y-2">
            <GruppenTitel>Tierhaltung</GruppenTitel>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={([
                ['kleintiere', 'Kleintiere frei', 'übrige mit Zustimmung'],
                ['zustimmung', 'Nur mit Zustimmung', 'jede Tierhaltung'],
                ['erlaubt', 'Erlaubt', 'ohne Einschränkung'],
              ] as const).map(([code, label, sub]) => ({ code, label, sub }))}
              value={a.tierhaltung}
              onSelect={(code) => set('tierhaltung', code)}
            />
          </div>
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.versicherungspflicht} onChange={(e) => set('versicherungspflicht', e.target.checked)} />
            <span>{wohnung ? 'Privathaftpflichtversicherung' : 'Betriebshaftpflichtversicherung'} des Mieters als Pflicht festhalten</span>
          </label>
          <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.hausordnung} onChange={(e) => set('hausordnung', e.target.checked)} />
            <span>Hausordnung als Vertragsbestandteil</span>
          </label>
          {!wohnung && (
            <div className="space-y-3 pt-1">
              <GruppenTitel>Geschäftsraum-Klauseln</GruppenTitel>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.mwstOption ?? false} onChange={(e) => set('mwstOption', e.target.checked || undefined)} />
                <span><strong>MWST-Option</strong> des Vermieters <span className="text-ink-500">(Mietzins zzgl. {MV_PARAMETER.mwstSatz.wert.toFixed(1)} % MWST, Art. 22 MWSTG)</span></span>
              </label>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.konkurrenzschutz ?? false} onChange={(e) => set('konkurrenzschutz', e.target.checked || undefined)} />
                <span><strong>Konkurrenzschutz</strong> vereinbaren <span className="text-ink-500">(nicht vertragsimmanent – muss ausdrücklich umschrieben werden)</span></span>
              </label>
              {a.konkurrenzschutz && (
                <>
                  <Field label="Geschützter Bereich (Branche/Nutzung)">
                    <input className={inputCls} value={a.konkurrenzschutzText ?? ''} onChange={(e) => set('konkurrenzschutzText', e.target.value || undefined)}
                      placeholder="z. B. Betrieb einer Apotheke" />
                  </Field>
                  <Field label="Konventionalstrafe (CHF)" optional hint="empfohlen – ein blosses Verbot erzwingt keine Auflösung des Konkurrenz-Mietvertrags">
                    <BetragsFeld className={inputCls + ' num w-44'} value={a.konkurrenzschutzStrafeCHF ?? ''} onChange={(v) => set('konkurrenzschutzStrafeCHF', v || undefined)} placeholder="z. B. 10'000" />
                  </Field>
                </>
              )}
            </div>
          )}
          {a.detailgrad === 'experte' && (
            <div className="space-y-3 pt-1">
              <GruppenTitel>Mietzinsvorbehalt (Art. 18 VMWG)</GruppenTitel>
              <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.mietzinsvorbehalt ?? false} onChange={(e) => set('mietzinsvorbehalt', e.target.checked || undefined)} />
                <span><strong>Mietzinsvorbehalt</strong> aufnehmen <span className="text-ink-500">(nicht ausgeschöpfte Mietzinsanpassung, in Prozenten zu beziffern)</span></span>
              </label>
              {a.mietzinsvorbehalt && (
                <>
                  <Field label="Vorbehalt (% des Nettomietzinses)" hint="ohne Bezifferung in Franken oder Prozenten geht der Vorbehalt verloren (Art. 18 VMWG)">
                    <input type="number" min={0} step={0.1} className={inputCls + ' num w-40'} value={a.vorbehaltProzent ?? ''} onChange={(e) => set('vorbehaltProzent', e.target.value || undefined)} />
                  </Field>
                  <Field label="Grund" optional>
                    <input className={inputCls} value={a.vorbehaltGrund ?? ''} onChange={(e) => set('vorbehaltGrund', e.target.value || undefined)} placeholder="z. B. nicht ausgeschöpfte Kostenmiete" />
                  </Field>
                </>
              )}
            </div>
          )}
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.length > 0 && (
            <div className="lc-notice-danger space-y-1">
              <p className="lc-overline text-danger-700 mb-1">Vor der Ausgabe zu beheben</p>
              {gates.blocker.map((b, i) => <p key={i} className="text-body-s text-danger-700">• {b}</p>)}
            </div>
          )}
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn text-body-s">{w}</div>
          ))}
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          <Field label="Ort und Datum des Vertragsschlusses">
            <div className="grid grid-cols-[1fr_11rem] gap-3">
              <input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" />
              <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
            </div>
          </Field>

          {/* Form-Gate */}
          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Form-Gate – damit der Vertrag trägt</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Beidseitig unterzeichnen</strong> – erfüllt die Schriftform von Index-/Staffelmiete.</li>
              <li><strong>Elektronisch nur mit QES:</strong> Die Schriftform erfüllt elektronisch nur die qualifizierte elektronische Signatur mit qualifiziertem Zeitstempel (Art. 14 Abs. 2bis OR) – einfache E-Signatur oder eingescannte Unterschrift genügen nicht.</li>
              {wohnung && <li><strong>Formularpflicht prüfen:</strong> In BS, BE, FR, GE, LU, NE*, VD*, ZG und ZH ist der Anfangsmietzins mit dem amtlichen Formular mitzuteilen – sonst ist die Mietzinsabrede nichtig (Art. 270 Abs. 2 OR; Stand 4.2.2026, dynamisch).</li>}
              <li><strong>Übergabeprotokoll</strong> bei Einzug gemeinsam erstellen (Beweissicherung).</li>
              <li><strong>Kaution</strong> auf ein Sperrkonto auf den Namen des Mieters einzahlen (Art. 257e OR).</li>
              {!wohnung && <li><strong>MWST-Option:</strong> Rechnungsanforderungen (Art. 26 MWSTG) für den Vorsteuerabzug beachten.</li>}
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dies ist ein Entwurf nach festen Bausteinen – kantonale Formularpflichten, Referenzzins-Stand und der Einzelfall sind gesondert zu prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Vertrag als PDF', banner: BANNER_MV, dateiName: 'Mietvertrag-Entwurf.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Vertrag als Word (DOCX)', banner: BANNER_MV, dateiName: 'Mietvertrag-Entwurf.docx' }
              : undefined} />

          <details className="lc-card p-4">
            <summary className="cursor-pointer text-body-s font-medium text-ink-700">Offene Verifikationen ({MV_OFFENE_VERIFIKATIONEN.length})</summary>
            <ul className="mt-2 space-y-1.5">
              {MV_OFFENE_VERIFIKATIONEN.map((v, i) => <li key={i} className="text-xs text-ink-500">– {v}</li>)}
            </ul>
          </details>
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Miete'} · Vorlage`}
      titel="Mietvertrag"
      intro="Stellt einen Mietvertrag für Wohn- oder Geschäftsräume aus festen, juristisch vorformulierten Bausteinen zusammen – mit harten Schranken für zwingendes Recht (Kautionsmaximum, Mindestfristen, Index-/Staffel-Voraussetzungen) und offengelegten kantonalen Form-Gates. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
      norms={card?.norms ?? []}
      badge="Beidseitig zu unterzeichnen"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      kopfSchalter={<VariantenKopf detailgrad={a.detailgrad} onDetailgrad={(v) => set('detailgrad', v)} />}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_MV, dateiName: 'Mietvertrag-Entwurf.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_MV, dateiName: 'Mietvertrag-Entwurf.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}

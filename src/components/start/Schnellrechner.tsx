import { useState } from 'react';
import { Link } from 'react-router-dom';
import { berechneAllgemeineFrist } from '../../lib/allgemeineFrist';
import { berechneProzesskosten, postenText, type Materie } from '../../lib/prozesskosten';
import { bestimmeZustaendigkeit, type Streitsache } from '../../lib/zustaendigkeit';
import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';
import type { Einheit } from '../../lib/fristenEngine';
import { DatumsFeld } from '../DatumsFeld';
import { BetragsFeld } from '../BetragsFeld';
import { ErgebnisBlock } from '../ErgebnisBlock';

// ─── Schnellrechner der Startseite (Startseite V2, «Rechner-zuerst») ─────────
//
// Kompakter Drei-Tab-Einstieg, der die ECHTEN, deterministischen Engines aufruft
// (§1/§2 — keine Illustrations-Mathematik wie im Prototyp); Rechtslogik bleibt
// in src/lib/ (§3). Für den vollen Rechenweg/Tarif verlinkt jeder Tab in den
// jeweiligen Voll-Rechner (§8 ehrlich: hier nur das Kopfergebnis).

type Tab = 'fristen' | 'gebuehren' | 'zustaendigkeit';

const TABS: { id: Tab; label: string }[] = [
  { id: 'fristen', label: 'Fristen' },
  { id: 'gebuehren', label: 'Gebühren' },
  { id: 'zustaendigkeit', label: 'Zuständigkeit' },
];

const MATERIEN: { id: Materie; label: string }[] = [
  { id: 'allgemein', label: 'Allgemein' },
  { id: 'arbeit', label: 'Arbeit' },
  { id: 'miete_pacht', label: 'Miete & Pacht' },
];

const STREITSACHEN: { id: Streitsache; label: string }[] = [
  { id: 'geldforderung', label: 'Geldforderung' },
  { id: 'miete_wohn_geschaeft', label: 'Miete (Wohn-/Geschäft)' },
  { id: 'arbeit', label: 'Arbeit' },
];

const VERFAHRENSART_LABEL: Record<string, string> = {
  vereinfacht: 'Vereinfachtes Verfahren',
  ordentlich: 'Ordentliches Verfahren',
  scheidungsverfahren: 'Scheidungsverfahren',
};

// Kleines Eingabe-Etikett (kompakt, Token-treu) — eigene Mini-Variante, weil
// der Vorlagen-Field-Wrapper für Wizards gedacht ist.
function Feld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 flex-1 min-w-[8.5rem]">
      <span className="text-body-s text-ink-600">{label}</span>
      {children}
    </label>
  );
}

function ResultKopf({ label, wert, sub, badge, rows }: {
  label: string; wert: string; sub?: string; badge?: string; rows?: { k: string; v: string }[];
}) {
  return (
    <div className="rounded-xl border border-brass-500 bg-surface-raised p-5">
      <p className="lc-overline text-ink-500 mb-1">{label}</p>
      <p className="num font-medium text-ink-900 leading-tight" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>{wert}</p>
      {sub && <p className="text-body-s text-ink-600 mt-1.5">{sub}</p>}
      {badge && <div><span className="lc-chip mt-3">{badge}</span></div>}
      {rows && rows.length > 0 && (
        <dl className="mt-4 pt-3 border-t border-line space-y-0">
          {rows.map((r, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 py-1.5 border-b border-line last:border-0">
              <dt className="text-body-s text-ink-600">{r.k}</dt>
              <dd className="num text-body-s text-ink-900 text-right">{r.v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

const chf = (n: number) => `CHF ${Math.round(n).toLocaleString('de-CH')}`;
function isoZuTag(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}.${m}.${y}` : iso;
}
const EINHEIT_LABEL: Record<string, string> = { tage: 'Tage', wochen: 'Wochen', monate: 'Monate', jahre: 'Jahre' };

// ── Tab: Fristen (Allgemeine Tagesfrist OR/ZGB; ZPO/SchKG im Voll-Rechner) ──
function FristenTab() {
  const [ereignis, setEreignis] = useState('');
  const [laenge, setLaenge] = useState('30');
  const [einheit, setEinheit] = useState<Einheit>('tage');
  const [kanton, setKanton] = useState<Kanton>('ZH');

  const n = parseInt(laenge, 10);
  let ergebnis: ReturnType<typeof berechneAllgemeineFrist> | null = null;
  let fehler = false;
  if (ereignis && Number.isFinite(n) && n > 0) {
    try {
      ergebnis = berechneAllgemeineFrist({
        start: ereignis, laenge: n, einheit,
        wochenendeVerschieben: true, feiertageVerschieben: true, kanton,
      });
    } catch { fehler = true; }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3.5">
        <Feld label="Auslösendes Ereignis">
          <DatumsFeld value={ereignis} onChange={setEreignis} aria-label="Auslösendes Ereignis" />
        </Feld>
        <Feld label="Fristdauer">
          <input type="number" inputMode="numeric" min={1} value={laenge}
            onChange={(e) => setLaenge(e.target.value)} className="lc-input num" aria-label="Fristdauer" />
        </Feld>
        <Feld label="Einheit">
          <select className="lc-input" value={einheit} onChange={(e) => setEinheit(e.target.value as Einheit)} aria-label="Einheit">
            <option value="tage">Tage</option>
            <option value="wochen">Wochen</option>
            <option value="monate">Monate</option>
            <option value="jahre">Jahre</option>
          </select>
        </Feld>
        <Feld label="Kanton (Feiertage)">
          <select className="lc-input" value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} aria-label="Kanton">
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Feld>
      </div>

      {ergebnis && (
        <ErgebnisBlock id="lc-schnell-fristen" sprung={false} live={false}>
          <ResultKopf
            label="Massgebliches Fristende"
            wert={`${ergebnis.endWochentag}, ${ergebnis.endDatum}`}
            badge="Allgemeine Frist (OR/ZGB)"
            rows={[
              { k: 'Auslösendes Ereignis', v: isoZuTag(ereignis) },
              { k: 'Fristdauer', v: `+ ${n} ${EINHEIT_LABEL[einheit]}` },
              ...(ergebnis.verschoben
                ? [{ k: 'Verschoben', v: `${ergebnis.rohEndDatum} → Werktag` }]
                : []),
              { k: 'Fristende', v: ergebnis.endDatum },
            ]}
          />
        </ErgebnisBlock>
      )}
      {fehler && <p className="text-body-s text-danger-700">Eingabe konnte nicht berechnet werden.</p>}

      <p className="text-body-s text-ink-500">
        Gerichtsferien (ZPO) und Betreibungsferien (SchKG) berücksichtigt der{' '}
        <Link to="/rechner/tagerechner" className="font-medium text-brass-700 hover:text-brass-600">volle Fristenrechner</Link>.
      </p>
    </div>
  );
}

// ── Tab: Gebühren (Gerichtskosten nach kantonalem Tarif) ──
function GebuehrenTab() {
  const [streitwert, setStreitwert] = useState('30000');
  const [kanton, setKanton] = useState<Kanton>('ZH');
  const [materie, setMaterie] = useState<Materie>('allgemein');

  const sw = Number(streitwert);
  let ergebnis: ReturnType<typeof berechneProzesskosten> | null = null;
  let fehler = false;
  if (streitwert !== '' && Number.isFinite(sw) && sw >= 0) {
    try {
      ergebnis = berechneProzesskosten({ kanton, streitwertCHF: sw, phase: 'entscheid', materie, instanz: 'erstinstanz' });
    } catch { fehler = true; }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3.5">
        <Feld label="Streitwert (CHF)">
          <BetragsFeld value={streitwert} onChange={setStreitwert} className="lc-input num" aria-label="Streitwert in Franken" />
        </Feld>
        <Feld label="Materie">
          <select className="lc-input" value={materie} onChange={(e) => setMaterie(e.target.value as Materie)} aria-label="Materie">
            {MATERIEN.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Feld>
        <Feld label="Kanton">
          <select className="lc-input" value={kanton} onChange={(e) => setKanton(e.target.value as Kanton)} aria-label="Kanton">
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Feld>
      </div>

      {ergebnis && (
        <ErgebnisBlock id="lc-schnell-gebuehren" sprung={false} live={false}>
          <ResultKopf
            label="Gerichtskosten (Entscheidgebühr)"
            wert={postenText(ergebnis.gerichtskosten)}
            sub={`${kanton} · Annahme: erste Instanz, ordentliches Verfahren`}
            badge="Kantonaler Tarif"
            rows={[
              { k: 'Streitwert', v: chf(sw) },
              { k: 'Gerichtskosten', v: postenText(ergebnis.gerichtskosten) },
              { k: 'Parteientschädigung', v: postenText(ergebnis.parteientschaedigung) },
            ]}
          />
        </ErgebnisBlock>
      )}
      {fehler && <p className="text-body-s text-danger-700">Eingabe konnte nicht berechnet werden.</p>}

      <p className="text-body-s text-ink-500">
        Parteientschädigung, Vorschuss und Kostenrisiko zeigt der{' '}
        <Link to="/rechner/prozesskosten" className="font-medium text-brass-700 hover:text-brass-600">volle Prozesskostenrechner</Link>.
      </p>
    </div>
  );
}

// ── Tab: Zuständigkeit (Verfahrensart + Schlichtung, Bundesrecht ZPO) ──
function ZustaendigkeitTab() {
  const [streitwert, setStreitwert] = useState('12000');
  const [streitsache, setStreitsache] = useState<Streitsache>('geldforderung');

  const sw = Number(streitwert);
  let ergebnis: ReturnType<typeof bestimmeZustaendigkeit> | null = null;
  let fehler = false;
  if (streitwert !== '' && Number.isFinite(sw) && sw >= 0) {
    try {
      ergebnis = bestimmeZustaendigkeit({ streitsache, vermoegensrechtlich: true, streitwertCHF: sw });
    } catch { fehler = true; }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3.5">
        <Feld label="Streitwert (CHF)">
          <BetragsFeld value={streitwert} onChange={setStreitwert} className="lc-input num" aria-label="Streitwert in Franken" />
        </Feld>
        <Feld label="Streitsache">
          <select className="lc-input" value={streitsache} onChange={(e) => setStreitsache(e.target.value as Streitsache)} aria-label="Streitsache">
            {STREITSACHEN.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Feld>
      </div>

      {ergebnis && (
        <ErgebnisBlock id="lc-schnell-zust" sprung={false} live={false}>
          <ResultKopf
            label="Verfahrensart"
            wert={VERFAHRENSART_LABEL[ergebnis.verfahrensart] ?? ergebnis.verfahrensart}
            badge="ZPO (Bundesrecht)"
            rows={[
              { k: 'Streitwert', v: chf(sw) },
              { k: 'Verfahrensart', v: VERFAHRENSART_LABEL[ergebnis.verfahrensart] ?? ergebnis.verfahrensart },
              {
                k: 'Schlichtung',
                v: ergebnis.schlichtung.obligatorisch
                  ? `obligatorisch${ergebnis.schlichtung.kostenlos ? ' · kostenlos' : ''}`
                  : `entfällt${ergebnis.schlichtung.entfaelltGrund ? ` (${ergebnis.schlichtung.entfaelltGrund})` : ''}`,
              },
            ]}
          />
        </ErgebnisBlock>
      )}
      {fehler && <p className="text-body-s text-danger-700">Eingabe konnte nicht berechnet werden.</p>}

      <p className="text-body-s text-ink-500">
        Örtliche Zuständigkeit, Weichen und Rechenweg zeigt der{' '}
        <Link to="/rechner/zustaendigkeit" className="font-medium text-brass-700 hover:text-brass-600">volle Zuständigkeitsrechner</Link>.
      </p>
    </div>
  );
}

export function Schnellrechner() {
  const [tab, setTab] = useState<Tab>('fristen');
  return (
    <div className="lc-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line">
        <span className="lc-overline text-ink-500">Schnell rechnen</span>
        <span className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>live hergeleitet</span>
      </div>
      <div role="tablist" aria-label="Schnellrechner" className="flex gap-1 px-3 pt-3">
        {TABS.map((t) => {
          const aktiv = t.id === tab;
          return (
            <button key={t.id} type="button" role="tab" aria-selected={aktiv}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2.5 text-body-s font-medium rounded-t-md border-b-2 transition-colors ${
                aktiv ? 'text-ink-900 border-brass-500 bg-surface-raised' : 'text-ink-600 border-transparent hover:text-ink-900'
              }`}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="p-5">
        {tab === 'fristen' && <FristenTab />}
        {tab === 'gebuehren' && <GebuehrenTab />}
        {tab === 'zustaendigkeit' && <ZustaendigkeitTab />}
      </div>
    </div>
  );
}

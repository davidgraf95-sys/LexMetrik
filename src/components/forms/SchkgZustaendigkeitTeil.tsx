import { useState } from 'react';
import { EckdatenKachel, ErgebnisSprung, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { SelectionGrid } from '../ui/SelectionGrid';
import { BetragsFeld } from '../BetragsFeld';
import {
  bestimmeSchkgZustaendigkeit, BETREIBUNGSAEMTER_VERZEICHNIS,
  type SchkgAnliegen, type SchkgInput, type SchkgPfand, type SchkgSchuldnerTyp,
  type WiderspruchKonstellation,
} from '../../lib/schkgZustaendigkeit';
import { GEBV_SCHKG_URL } from '../../data/erlassLinks';

// ─── Rechtsweg «Betreibung (SchKG)» — UI-Teil des Zuständigkeitsrechners ────
// Anordnung David 5.6.2026 («schkg analog zivilrecht»). Reine Darstellung
// (§3): alle Regeln in lib/schkgZustaendigkeit.ts. Gleiche Bausteine wie der
// Zivil-Teil (LiveHeader/EckdatenKachel/lc-card/lc-chip) — einheitliches
// Design auf allen Seiten (Anordnung David).

const ANLIEGEN: { code: SchkgAnliegen; label: string; sub: string }[] = [
  { code: 'betreibung_einleiten', label: 'Betreibung einleiten', sub: 'Betreibungsbegehren → Zahlungsbefehl (Art. 67 SchKG)' },
  { code: 'rechtsoeffnung', label: 'Rechtsöffnung', sub: 'Nach Rechtsvorschlag — mit Urteil oder Schuldanerkennung (Art. 80/82)' },
  { code: 'aberkennungsklage', label: 'Aberkennungsklage', sub: 'Schuldnerseite nach provisorischer Rechtsöffnung (Art. 83 Abs. 2)' },
  { code: 'anerkennungsklage', label: 'Anerkennungsklage', sub: 'Forderungsprozess nach Rechtsvorschlag (Art. 79)' },
  { code: 'feststellung', label: 'Tilgung/Nichtbestand geltend machen', sub: 'Art. 85 (Urkunden) / Art. 85a' },
  { code: 'rueckforderung', label: 'Rückforderung (Nichtschuld bezahlt)', sub: 'Art. 86 — 1 Jahr' },
  { code: 'widerspruch', label: 'Drittansprache (Widerspruch)', sub: 'Eigentum Dritter an gepfändeten Sachen (Art. 106–109)' },
  { code: 'kollokation', label: 'Kollokation anfechten', sub: 'Pfändung (Art. 148) / Konkurs (Art. 250)' },
  { code: 'arrest', label: 'Arrest', sub: 'Sicherung vor/neben der Betreibung (Art. 271 ff.)' },
  { code: 'konkursbegehren', label: 'Konkursbegehren', sub: 'Nach Konkursandrohung (Art. 166)' },
  { code: 'beschwerde_amt', label: 'Beschwerde gegen das Amt', sub: 'Verfügungen des Betreibungs-/Konkursamts (Art. 17)' },
];

const SCHULDNER: { code: SchkgSchuldnerTyp; label: string }[] = [
  { code: 'natuerlich_wohnsitz', label: 'Natürliche Person mit Wohnsitz in der Schweiz' },
  { code: 'jur_person_hr', label: 'Juristische Person/Gesellschaft im Handelsregister' },
  { code: 'jur_person_nicht_hr', label: 'Juristische Person ohne HR-Eintrag' },
  { code: 'natuerlich_ohne_wohnsitz', label: 'Ohne festen Wohnsitz (Aufenthaltsort)' },
  { code: 'erbschaft', label: 'Unverteilte Erbschaft' },
  { code: 'stockwerkeigentuemer', label: 'Stockwerkeigentümergemeinschaft (Ort der Sache, Art. 46 Abs. 4)' },
  { code: 'ausland_niederlassung', label: 'Auslandschuldner mit CH-Geschäftsniederlassung' },
];

const WIDERSPRUCH: { code: WiderspruchKonstellation; label: string }[] = [
  { code: 'gewahrsam_schuldner', label: 'Sache im Gewahrsam der Schuldnerin/des Schuldners' },
  { code: 'gewahrsam_dritter_ch', label: 'Gewahrsam beim Dritten — Beklagte:r mit Wohnsitz in der Schweiz' },
  { code: 'gewahrsam_dritter_ausland', label: 'Gewahrsam beim Dritten — Beklagte:r im Ausland' },
  { code: 'grundstueck', label: 'Anspruch betrifft ein Grundstück' },
];

export function SchkgZustaendigkeitTeil() {
  const [anliegen, setAnliegen] = useState<SchkgAnliegen>('betreibung_einleiten');
  const [schuldnerTyp, setSchuldnerTyp] = useState<SchkgSchuldnerTyp>('natuerlich_wohnsitz');
  const [pfand, setPfand] = useState<SchkgPfand>('kein');
  const [arrestGelegt, setArrestGelegt] = useState(false);
  const [forderungRoh, setForderungRoh] = useState('');
  const [widerspruchK, setWiderspruchK] = useState<WiderspruchKonstellation>('gewahrsam_schuldner');
  const [kollokationIn, setKollokationIn] = useState<'pfaendung' | 'konkurs'>('pfaendung');
  const [roArt, setRoArt] = useState<'provisorisch' | 'definitiv'>('provisorisch');

  const forderung = forderungRoh.trim() === '' ? null : Number(forderungRoh.replace(/['\s]/g, '').replace(',', '.'));
  const forderungUngueltig = forderung !== null && (!Number.isFinite(forderung) || forderung < 0);

  const input: SchkgInput = {
    anliegen, schuldnerTyp, pfand, arrestGelegt,
    forderungCHF: forderungUngueltig ? null : forderung,
    widerspruchKonstellation: widerspruchK, kollokationIn, rechtsoeffnungArt: roArt,
  };
  let r: ReturnType<typeof bestimmeSchkgZustaendigkeit> | null;
  try { r = bestimmeSchkgZustaendigkeit(input); } catch { r = null; }

  return (
    <div className="space-y-6">
      {/* 2 · Anliegen */}
      <div className="space-y-2">
        <p className="lc-overline">2 · Worum geht es?</p>
        <SelectionGrid
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
          items={ANLIEGEN.map((a) => ({ code: a.code, label: a.label, sub: a.sub }))}
          value={anliegen}
          onSelect={setAnliegen}
        />
      </div>

      {/* 3 · Schuldner + Konstellation */}
      <div className="space-y-2">
        <p className="lc-overline">3 · Schuldnerin/Schuldner und Konstellation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Schuldner-Typ" hint="bestimmt den Betreibungsort (Art. 46–50 SchKG)">
            <select value={schuldnerTyp} onChange={(e) => setSchuldnerTyp(e.target.value as SchkgSchuldnerTyp)} className={inputCls}>
              {SCHULDNER.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Pfandsicherung" hint="Grundpfand erzwingt den Ort des Grundstücks (Art. 51 Abs. 2)">
            <select value={pfand} onChange={(e) => setPfand(e.target.value as SchkgPfand)} className={inputCls}>
              <option value="kein">keine</option>
              <option value="faustpfand">Faustpfand</option>
              <option value="grundpfand">Grundpfand</option>
            </select>
          </Field>
          <Field label="Forderung (CHF)" hint="für die Gebühr des Zahlungsbefehls (Art. 16 GebV SchKG)">
            <BetragsFeld className={inputCls + ' num w-44'} value={forderungRoh} onChange={setForderungRoh} aria-invalid={forderungUngueltig} />
          </Field>
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700 sm:mt-7">
            <input type="checkbox" checked={arrestGelegt} onChange={(e) => setArrestGelegt(e.target.checked)} />
            Für die Forderung ist bereits Arrest gelegt (Art. 52 SchKG)
          </label>
        </div>
        {anliegen === 'widerspruch' && (
          <Field label="Widerspruchs-Konstellation" hint="bestimmt Forum UND Parteirollen (Art. 107–109)">
            <select value={widerspruchK} onChange={(e) => setWiderspruchK(e.target.value as WiderspruchKonstellation)} className={inputCls}>
              {WIDERSPRUCH.map((w) => <option key={w.code} value={w.code}>{w.label}</option>)}
            </select>
          </Field>
        )}
        {anliegen === 'kollokation' && (
          <Field label="Verfahren">
            <select value={kollokationIn} onChange={(e) => setKollokationIn(e.target.value as 'pfaendung' | 'konkurs')} className={inputCls}>
              <option value="pfaendung">in der Pfändung (Art. 148)</option>
              <option value="konkurs">im Konkurs (Art. 250)</option>
            </select>
          </Field>
        )}
        {anliegen === 'rechtsoeffnung' && (
          <Field label="Titel">
            <select value={roArt} onChange={(e) => setRoArt(e.target.value as 'provisorisch' | 'definitiv')} className={inputCls}>
              <option value="provisorisch">Schuldanerkennung → provisorische Rechtsöffnung (Art. 82)</option>
              <option value="definitiv">Vollstreckbares Urteil → definitive Rechtsöffnung (Art. 80)</option>
            </select>
          </Field>
        )}
        {forderungUngueltig && (
          <p role="alert" className="lc-notice-warn text-body-s">Forderung: bitte einen Betrag ≥ 0 eingeben.</p>
        )}
      </div>

      {/* 4 · Ergebnis */}
      {r && (
        <div id="lc-ergebnis" className="lc-reveal space-y-4" aria-live="polite">
          <ErgebnisSprung zielId="lc-ergebnis" />
          <LiveHeader />

          {/* Betreibungsort + Forum */}
          <div className="lc-card p-5 space-y-3">
            <p className="lc-overline">Betreibungsort (Wurzelgrösse)</p>
            <p className="text-body-s text-ink-900">{r.betreibungsort.text}.</p>
            <div className="border-t border-line pt-3">
              <p className="lc-overline mb-1.5">Forum für dieses Anliegen</p>
              <p className="text-body-s text-ink-900 font-medium">{r.forum.stelle}</p>
              <p className="text-body-s text-ink-700 mt-1">{r.forum.text}</p>
              <p className="text-body-s text-ink-700 mt-1">{r.eingabe.verfahren}.</p>
              <a href={BETREIBUNGSAEMTER_VERZEICHNIS} target="_blank" rel="noreferrer" className="text-brass-700 underline text-body-s mt-1.5 inline-block">
                Amtliches Verzeichnis der Betreibungs- und Konkursämter (BJ, PLZ-Suche) ↗
              </a>
            </div>
          </div>

          {/* Fristen */}
          {r.fristen.length > 0 && (
            <div className="lc-card p-5 space-y-2.5">
              <p className="lc-overline">Fristen</p>
              {r.fristen.map((f) => (
                <p key={f.label + f.norm} className="text-body-s text-ink-800">
                  {f.kritisch && <span className="lc-badge lc-badge-danger mr-1.5">Verwirkung</span>}
                  <span className="font-medium text-ink-900">{f.label}:</span> {f.frist} <span className="text-ink-500">({f.norm})</span>
                </p>
              ))}
            </div>
          )}

          {/* Fahrplan (analog Zivil) */}
          {r.fahrplan.length > 0 && (
            <div className="lc-card p-5 space-y-3">
              <p className="lc-overline">Ihr Fahrplan</p>
              <ol className="space-y-2.5">
                {r.fahrplan.map((s, i) => (
                  <li key={s.titel} className="flex gap-3">
                    <span aria-hidden className="shrink-0 w-6 h-6 rounded-full bg-brass-100 text-brass-700 inline-flex items-center justify-center text-xs font-semibold num">{i + 1}</span>
                    <span>
                      <span className="block text-body-s font-medium text-ink-900">{s.titel}</span>
                      <span className="block text-body-s text-ink-600">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Kosten */}
          {r.kostenZahlungsbefehl && (
            <div className="lc-card p-5 space-y-2">
              <p className="lc-overline">Voraussichtliche Kosten</p>
              <p className="text-body-s text-ink-800">
                <span className="font-medium text-ink-900">Gebühr Zahlungsbefehl: CHF {r.kostenZahlungsbefehl.gebuehrCHF.toFixed(2).replace('.00', '.–')}</span>{' '}
                (Forderung {r.kostenZahlungsbefehl.band} Franken; <a href={GEBV_SCHKG_URL} target="_blank" rel="noreferrer" className="underline hover:text-brass-700">Art. 16 Abs. 1 GebV SchKG ↗</a>).
              </p>
              <p className="text-xs text-ink-500">
                Stand der Staffel: 1.1.2022; eine Änderung der GebV per 1.1.2026 (AS 2025 630) ist nur als signiertes PDF
                publiziert — Betrag vor Einreichung kurz gegenprüfen. Hinzu kommen Zustellkosten (CHF 7.– je Versuch, Abs. 3);
                die Kosten sind von der Gläubigerseite vorzuschiessen und der Forderung zuschlagbar (Art. 68 SchKG).
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <EckdatenKachel label="Zuständige Stelle" wert={r.forum.stelle.split(' (')[0].split(' ODER')[0]} sub={r.forum.stelle.includes('ODER') ? 'Wahlgerichtsstand — Details unten' : undefined} />
            <EckdatenKachel label="Eingabe" wert={r.eingabe.art.split(' (')[0]} />
            <EckdatenKachel label="Kritische Fristen" wert={String(r.fristen.filter((f) => f.kritisch).length)} sub={r.fristen.find((f) => f.kritisch)?.frist} />
          </div>

          {r.weichen.map((w) => <div key={w} className="lc-notice text-body-s">{w}</div>)}
          {r.warnungen.map((w) => <div key={w} className="lc-notice-warn text-body-s">{w}</div>)}

          <div className="flex flex-wrap gap-1.5">
            {r.normverweise.map((n, i) => <span key={i} className="lc-chip">{n.artikel}{n.bemerkung ? ` · ${n.bemerkung}` : ''}</span>)}
          </div>

          <p className="text-xs text-ink-500 pt-2 border-t border-line">
            Regelwerk verbatim am SchKG-Wortlaut verifiziert (Stand 1.1.2025) — fachliche Abnahme ausstehend.
          </p>
        </div>
      )}
    </div>
  );
}

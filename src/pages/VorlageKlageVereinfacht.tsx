import { useMemo } from 'react';
import { NormText } from '../components/NormText';
import {
  KV_DEFAULTS, KV_MATERIEN, kvZusammenstellen, kvMaengel, kvHinweise, kvRouting, kvStreitwert, kvKlagefrist,
  type KvAnswers, type KvMaterie, type KvAusnahme,
  KV_GERICHTE_BS,
} from '../lib/vorlagen/klageVereinfacht';
import type { SgPartei } from '../lib/vorlagen/schlichtungsgesuchBs';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Checkbox, Field, GruppenTitel, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { KvGerichtWahl } from '../components/vorlagen/KvGerichtWahl';
import { SgAdressatKachel } from '../components/vorlagen/SgBehoerdenWahl';
import { KANTONE } from '../lib/kantone';
import type { Kanton } from '../types/legal';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { ZefixSuche } from '../components/vorlagen/ZefixSuche';
import { uidGueltig, uidNormalisieren } from '../lib/uid';
import { kvPrefillLesen } from '../lib/vorlagen/klageVereinfacht';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';
import { gerichtsErlass } from '../data/gerichtsorganisationErlasse';

// ─── Vorlagen-Wizard: Klage im vereinfachten Verfahren (BS-Pilot) ───────────
// Zweite Eingabe-Vorlage (nach Schlichtungsgesuch BS). Wie dort BEWUSST ohne
// localStorage (Parteidaten). Logik in lib/vorlagen/klageVereinfacht.ts (§3).

const SCHRITTE = [
  { id: 'materie', label: 'Materie & Streitwert' },
  { id: 'parteien', label: 'Parteien' },
  { id: 'begehren', label: 'Rechtsbegehren' },
  { id: 'begruendung', label: 'Begründung (freiwillig)' },
  { id: 'beilagen', label: 'Klagebewilligung & Beilagen' },
  { id: 'pruefen', label: 'Prüfen & Ausgabe' },
] as const;

const BANNER_KV: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK DATIEREN, UNTERSCHREIBEN UND IM DOPPEL EINREICHEN',
  text:
    'Klage im vereinfachten Verfahren (Art. 243 ff. ZPO): unterschrieben einreichen, ein Exemplar ' +
    'für das Gericht und je eines pro Gegenpartei (Art. 131 ZPO); Klagebewilligung bzw. ' +
    'Ausnahme-Nachweis beilegen. Klagefrist nach Art. 209 Abs. 3/4 ZPO eigenverantwortlich wahren.',
};

// Kompakter Partei-Editor (natürlich/juristisch) — Darstellung, keine Logik.
export function ParteiEditor({ p, onChange }: { p: SgPartei; onChange: (p: SgPartei) => void }) {
  return (
    <div className="space-y-3">
      <SelectionGrid
        className="grid grid-cols-2 gap-2"
        items={[
          { code: 'natuerlich' as const, label: 'Natürliche Person' },
          { code: 'juristisch' as const, label: 'Juristische Person' },
        ]}
        value={p.typ}
        onSelect={(code) => onChange(code === 'natuerlich'
          ? { typ: 'natuerlich', vorname: '', name: '', strasse: '', plz: '', ort: '' }
          : { typ: 'juristisch', firma: '', sitzStrasse: '', sitzPlz: '', sitzOrt: '' })}
      />
      {p.typ === 'natuerlich' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Vorname"><input className={inputCls} value={p.vorname} onChange={(e) => onChange({ ...p, vorname: e.target.value })} /></Field>
          <Field label="Nachname"><input className={inputCls} value={p.name} onChange={(e) => onChange({ ...p, name: e.target.value })} /></Field>
          <Field label="Strasse Nr."><input className={inputCls} value={p.strasse} onChange={(e) => onChange({ ...p, strasse: e.target.value })} /></Field>
          <div className="grid grid-cols-[6rem_1fr] gap-3">
            <Field label="PLZ"><input className={inputCls + ' num'} value={p.plz} onChange={(e) => onChange({ ...p, plz: e.target.value })} /></Field>
            <Field label="Ort"><input className={inputCls} value={p.ort} onChange={(e) => onChange({ ...p, ort: e.target.value })} /></Field>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Firma (gemäss Handelsregister)"><input className={inputCls} value={p.firma} onChange={(e) => onChange({ ...p, firma: e.target.value })} /></Field>
          <Field label="UID" optional hint={p.uid?.trim() && !uidGueltig(p.uid) ? 'Prüfziffer stimmt nicht — Format CHE-xxx.xxx.xxx' : undefined}>
            <input className={inputCls} placeholder="CHE-xxx.xxx.xxx" value={p.uid ?? ''}
              onChange={(e) => onChange({ ...p, uid: e.target.value })}
              onBlur={() => { const n = p.uid ? uidNormalisieren(p.uid) : null; if (n && n !== p.uid) onChange({ ...p, uid: n }); }} />
          </Field>
          <Field label="Strasse Nr."><input className={inputCls} value={p.sitzStrasse} onChange={(e) => onChange({ ...p, sitzStrasse: e.target.value })} /></Field>
          <div className="grid grid-cols-[6rem_1fr] gap-3">
            <Field label="PLZ"><input className={inputCls + ' num'} value={p.sitzPlz} onChange={(e) => onChange({ ...p, sitzPlz: e.target.value })} /></Field>
            <Field label="Ort"><input className={inputCls} value={p.sitzOrt} onChange={(e) => onChange({ ...p, sitzOrt: e.target.value })} /></Field>
          </div>
          <div className="sm:col-span-2">
            <ZefixSuche firma={p.firma} uid={p.uid} onUebernehmen={(t) =>
              onChange({
                ...p, firma: t.firma, uid: t.uid,
                sitzStrasse: t.strasse || p.sitzStrasse,
                sitzPlz: t.plz || p.sitzPlz,
                sitzOrt: t.ort || p.sitzOrt,
              })} />
          </div>
        </div>
      )}
    </div>
  );
}

export function VorlageKlageVereinfacht() {
  // KEIN speicherKey (Parteidaten — wie Schlichtungsgesuch BS).
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<KvAnswers>({
      defaults: {
        ...KV_DEFAULTS,
        // Prefill-Brücke 2.1b (Zuständigkeits-Wizard): Materie + Streitwert
        // vorbefüllt, voll editierbar; SSR-sicher via try/catch.
        ...((() => { try { return kvPrefillLesen(window.location.search) ?? {}; } catch { return {}; } })()),
      },
    });

  const ergebnis = useMemo(() => kvZusammenstellen(a), [a]);
  const maengel = useMemo(() => kvMaengel(a), [a]);
  const hinweise = useMemo(() => kvHinweise(a), [a]);
  const sw = kvStreitwert(a);
  const routing = a.materie ? kvRouting(a.materie, sw, a.gerichtsKanton) : null;
  const stopp = routing !== null && !routing.anwendbar;
  const frist = a.klagebewilligungVorhanden && a.klagebewilligungDatum && a.materie
    ? kvKlagefrist(a.klagebewilligungDatum, a.materie, a.gerichtsKanton) : null;

  const fehler = maengel.filter((m) => m.schritt === schritt).map((m) => m.text);
  const card = karte('klage-vereinfacht');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'materie': return (
        <div className="space-y-4">
          {/* Kantonsausbau 10.6.2026 (Auftrag David): Gericht je Kanton.
              BS = abgenommenes GOG-Routing; übrige Kantone über die zweifach
              geprüfte Recherche-Schicht (KvGerichtWahl) bzw. Handeingabe. */}
          <div className="space-y-3">
            <GruppenTitel>Zuständiges Gericht</GruppenTitel>
            <div className="grid grid-cols-[8rem_1fr] gap-3 items-start">
              <Field label="Kanton">
                <select className={inputCls} value={a.gerichtsKanton}
                  onChange={(e) => set('gerichtsKanton', e.target.value as Kanton)}>
                  {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              {!a.gerichtManuellAktiv && (() => {
                if (a.gerichtsKanton === 'BS') {
                  const g = routing?.anwendbar && routing.gericht !== 'kantonal'
                    ? KV_GERICHTE_BS[routing.gericht] : KV_GERICHTE_BS.zivilgericht;
                  return <SgAdressatKachel zeilen={[g.name, g.strasse, g.plzOrt]} url={g.url} />;
                }
                if (a.gerichtAufgeloest) return <SgAdressatKachel zeilen={a.gerichtAufgeloest.zeilen} url={a.gerichtAufgeloest.url} />;
                return (
                  <div className="lc-notice text-body-s">
                    Gericht wird unten über die kantonale Gerichtsschicht bestimmt — oder von Hand erfassen.
                  </div>
                );
              })()}
            </div>
            {(() => {
              const e = gerichtsErlass(a.gerichtsKanton);
              return (
                <p className="text-xs text-ink-500">
                  Rechtsgrundlage Gerichtsorganisation: {e.url
                    ? <a href={e.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">{e.abk} {a.gerichtsKanton} ({e.nummer}) ↗</a>
                    : <>{e.abk} {a.gerichtsKanton} ({e.nummer})</>}
                </p>
              );
            })()}
            {a.gerichtsKanton !== 'BS' && !a.gerichtManuellAktiv && (
              <KvGerichtWahl kanton={a.gerichtsKanton} materie={a.materie}
                onAufgeloest={(z) => set('gerichtAufgeloest', z ?? undefined)} />
            )}
            <Checkbox
              checked={a.gerichtManuellAktiv ?? false}
              onChange={(v) => set('gerichtManuellAktiv', v || undefined)}
              label={<><span>Adresse des Gerichts von Hand erfassen <span className="text-ink-500">(übersteuert die hinterlegte Anschrift)</span></span></>} />
            {a.gerichtManuellAktiv && (
              // Layout 11.6.2026 (Auftrag David, einheitlich mit dem
              // Schlichtungsgesuch): Name volle Breite, Strasse + PLZ zweispaltig.
              (<div className="space-y-3 pl-6">
                <Field label="Gericht">
                  <input className={inputCls} value={a.gerichtManuell?.name ?? ''}
                    onChange={(e) => set('gerichtManuell', { name: e.target.value, strasse: a.gerichtManuell?.strasse ?? '', plzOrt: a.gerichtManuell?.plzOrt ?? '' })}
                    placeholder="z. B. Bezirksgericht X" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Strasse und Hausnummer">
                    <input className={inputCls} value={a.gerichtManuell?.strasse ?? ''}
                      onChange={(e) => set('gerichtManuell', { name: a.gerichtManuell?.name ?? '', strasse: e.target.value, plzOrt: a.gerichtManuell?.plzOrt ?? '' })}
                      placeholder="z. B. Gerichtsgasse 1" />
                  </Field>
                  <Field label="PLZ und Ort">
                    <input className={inputCls} value={a.gerichtManuell?.plzOrt ?? ''}
                      onChange={(e) => set('gerichtManuell', { name: a.gerichtManuell?.name ?? '', strasse: a.gerichtManuell?.strasse ?? '', plzOrt: e.target.value })}
                      placeholder="z. B. 8001 Zürich" />
                  </Field>
                </div>
              </div>)
            )}
          </div>
          <SelectionGrid
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            items={KV_MATERIEN.map((m) => ({ code: m.id, label: m.label, sub: m.hint }))}
            value={a.materie}
            onSelect={(code) => set('materie', code as KvMaterie)}
          />
          <Field label="Streitwert (CHF)" hint="nach Art. 91 ZPO – ohne Zinsen und Kosten; bei unbezifferter Klage der Mindestwert (Schritt Rechtsbegehren)">
            <BetragsFeld value={a.streitwert} onChange={(v) => set('streitwert', v)} className={inputCls}
              placeholder="z. B. 12'000" aria-label="Streitwert in Franken" />
          </Field>
          {routing?.anwendbar && (
            <p className="lc-notice text-body-s">
              Zuständig: <strong>{routing.spruchkoerper}</strong> ({routing.spruchkoerperNorm}) ·
              vereinfachtes Verfahren{routing.abs2Lit ? ` (Art. 243 Abs. 2 lit. ${routing.abs2Lit} ZPO)` : ' (Art. 243 Abs. 1 ZPO)'}
              {routing.kostenlos && routing.kostenlosNorm ? <> · <strong>gerichtskostenfrei</strong> ({routing.kostenlosNorm})</> : null}.
            </p>
          )}
        </div>
      );

      case 'parteien': return (
        <div className="space-y-5">
          <div className="space-y-2">
            <GruppenTitel>Klagende Partei</GruppenTitel>
            <ParteiEditor p={a.klaeger} onChange={(p) => set('klaeger', p)} />
            <Field label="Vertretung" optional hint="Name/Kanzlei; Vollmacht als Beilage (Schritt Beilagen)">
              <input className={inputCls} value={a.vertretung ?? ''} onChange={(e) => set('vertretung', e.target.value)} />
            </Field>
          </div>
          <div className="space-y-2">
            <GruppenTitel>Beklagte Partei</GruppenTitel>
            <ParteiEditor p={a.beklagte} onChange={(p) => set('beklagte', p)} />
          </div>
          <p className="text-xs text-ink-500">
            Parteien müssen mit Schlichtungsgesuch/Klagebewilligung übereinstimmen (Art. 209 Abs. 2 lit. a ZPO).
          </p>
        </div>
      );

      case 'begehren': return (
        <div className="space-y-4">
          <SelectionGrid
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            items={[
              { code: 'beziffert' as const, label: 'Beziffertes Begehren', sub: 'Bestimmter Betrag (Art. 84 Abs. 2 ZPO)' },
              { code: 'unbeziffert' as const, label: 'Unbezifferte Forderungsklage', sub: 'Mit Mindestwert (Art. 85 ZPO)' },
            ]}
            value={a.begehrenTyp}
            onSelect={(code) => set('begehrenTyp', code)}
          />
          {a.begehrenTyp === 'beziffert' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Betrag (CHF)"><BetragsFeld value={a.streitwert} onChange={(v) => set('streitwert', v)} className={inputCls} aria-label="Forderungsbetrag" /></Field>
              <Field label="Zins % " optional><input className={inputCls + ' num'} value={a.zins?.satz ?? ''} onChange={(e) => set('zins', { satz: e.target.value, abDatum: a.zins?.abDatum ?? '' })} placeholder="5" /></Field>
              <Field label="Zins seit" optional><DatumsFeld value={a.zins?.abDatum ?? ''} onChange={(v) => set('zins', { satz: a.zins?.satz ?? '', abDatum: v })} className={inputCls} /></Field>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Mindestwert (CHF)" hint="Art. 85 Abs. 1 ZPO – vorläufiger Streitwert">
                <BetragsFeld value={a.unbeziffertMindest ?? ''} onChange={(v) => set('unbeziffertMindest', v)} className={inputCls} aria-label="Mindestwert" />
              </Field>
              <Field label="Grund der Unbezifferbarkeit" optional>
                <input className={inputCls} value={a.unbeziffertGrund ?? ''} onChange={(e) => set('unbeziffertGrund', e.target.value)} placeholder="z. B. Bezifferung erst nach Beweisverfahren möglich" />
              </Field>
            </div>
          )}
          <Checkbox
            checked={a.rechtsoeffnung}
            onChange={(v) => set('rechtsoeffnung', v)}
            label={<><span>Beseitigung des Rechtsvorschlags beantragen <span className="text-ink-500">(laufende Betreibung)</span></span></>} />
          {a.rechtsoeffnung && (
            <Field label="Betreibungs-Nr." optional>
              <input className={inputCls + ' sm:max-w-[14rem]'} value={a.betreibungNr ?? ''} onChange={(e) => set('betreibungNr', e.target.value)} />
            </Field>
          )}
          <Field label="Streitgegenstand" hint="in wenigen Sätzen oder Stichworten (Art. 244 Abs. 1 lit. c ZPO); identisch mit der Klagebewilligung">
            <textarea className={inputCls} rows={2} value={a.streitgegenstand} onChange={(e) => set('streitgegenstand', e.target.value)} />
          </Field>
          <div className="space-y-2">
            <GruppenTitel>Weitere Rechtsbegehren <span className="normal-case text-ink-500">(optional)</span></GruppenTitel>
            {a.weitereRechtsbegehren.map((w, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} value={w}
                  onChange={(e) => set('weitereRechtsbegehren', a.weitereRechtsbegehren.map((x, j) => j === i ? e.target.value : x))} />
                <button type="button" className="text-body-s text-danger-700 hover:underline shrink-0"
                  onClick={() => set('weitereRechtsbegehren', a.weitereRechtsbegehren.filter((_, j) => j !== i))}>entfernen</button>
              </div>
            ))}
            <button type="button" className="lc-btn-outline lc-btn-sm"
              onClick={() => set('weitereRechtsbegehren', [...a.weitereRechtsbegehren, ''])}>+ Begehren</button>
          </div>
        </div>
      );

      case 'begruendung': return (
        <div className="space-y-4">
          <Checkbox
            checked={a.begruendungAktiv}
            onChange={(v) => set('begruendungAktiv', v)}
            label={<><span>Schriftliche Begründung beifügen <span className="text-ink-500"><NormText text={`(freiwillig, Art. 244 Abs. 2 ZPO — ohne Begründung lädt das Gericht direkt zur Verhandlung vor, Art. 245 Abs. 1)`} /></span></span></>} />
          {a.begruendungAktiv && (
            <>
              {/* Auftrag David 11.6.2026: wahlweise Platzhalter im Dokument. */}
              <Checkbox
                checked={a.begruendungPlatzhalter ?? false}
                onChange={(v) => set('begruendungPlatzhalter', v || undefined)}
                label={<><span>Begründung später ausfüllen <span className="text-ink-500">(die Klage erhält Leer-Ziffern für Tatsachendarstellung und Beweismittel)</span></span></>}
                className='pl-6' />
              {a.begruendungPlatzhalter && (
                <p className="lc-notice-warn text-body-s">
                  Das Dokument enthält Platzhalter («________») unter «Begründung» und «Beweismittel» —
                  vor der Einreichung ausfüllen oder hier in der Maske erfassen.
                </p>
              )}
              {!a.begruendungPlatzhalter && (<>
              <div className="space-y-2">
                <GruppenTitel>Sachverhalt — Tatsachenbehauptungen</GruppenTitel>
                {a.sachverhalt.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea className={inputCls} rows={2} value={s.text}
                      onChange={(e) => set('sachverhalt', a.sachverhalt.map((x, j) => j === i ? { text: e.target.value } : x))} />
                    <button type="button" className="text-body-s text-danger-700 hover:underline shrink-0 self-start pt-2"
                      onClick={() => set('sachverhalt', a.sachverhalt.filter((_, j) => j !== i))}>entfernen</button>
                  </div>
                ))}
                <button type="button" className="lc-btn-outline lc-btn-sm"
                  onClick={() => set('sachverhalt', [...a.sachverhalt, { text: '' }])}>+ Behauptung</button>
              </div>
              <div className="space-y-2">
                <GruppenTitel>Beweismittel</GruppenTitel>
                {a.beweismittel.map((b, i) => (
                  <div key={i} className="flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[12rem]">
                      <Field label="Bezeichnung"><input className={inputCls} value={b.bezeichnung}
                        onChange={(e) => set('beweismittel', a.beweismittel.map((x, j) => j === i ? { ...x, bezeichnung: e.target.value } : x))} /></Field>
                    </div>
                    <div className="flex-1 min-w-[12rem]">
                      <Field label="zum Beweis von" optional><input className={inputCls} value={b.fuer ?? ''}
                        onChange={(e) => set('beweismittel', a.beweismittel.map((x, j) => j === i ? { ...x, fuer: e.target.value } : x))} /></Field>
                    </div>
                    <button type="button" className="text-body-s text-danger-700 hover:underline pb-2.5"
                      onClick={() => set('beweismittel', a.beweismittel.filter((_, j) => j !== i))}>entfernen</button>
                  </div>
                ))}
                <button type="button" className="lc-btn-outline lc-btn-sm"
                  onClick={() => set('beweismittel', [...a.beweismittel, { bezeichnung: '' }])}>+ Beweismittel</button>
                <p className="text-xs text-ink-500"><NormText text={`Verfügbare Urkunden sind beizulegen (Art. 244 Abs. 3 ZPO) — sie erscheinen automatisch im Beilagenverzeichnis.`} /></p>
              </div>
              </>)}
            </>
          )}
        </div>
      );

      case 'beilagen': return (
        <div className="space-y-4">
          <Checkbox
            checked={a.klagebewilligungVorhanden}
            onChange={(v) => set('klagebewilligungVorhanden', v)}
            label={<><span>Klagebewilligung der Schlichtungsbehörde liegt vor <span className="text-ink-500"><NormText text={`(Prozessvoraussetzung, Art. 209 ZPO)`} /></span></span></>} />
          {a.klagebewilligungVorhanden ? (
            <div className="space-y-2">
              <Field label="Datum der Klagebewilligung (Eröffnung/Zustellung)" hint="massgeblich für die Klagefrist (BGE 140 III 227)">
                <DatumsFeld value={a.klagebewilligungDatum} onChange={(v) => set('klagebewilligungDatum', v)} className={inputCls} />
              </Field>
              {frist && (
                <p className="lc-notice-warn text-body-s">
                  Klagefrist {frist.fristLabel}: Ablauf am <strong>{frist.ablauf}</strong>
                  {frist.stillstandAktiv ? ' (Gerichtsferien berücksichtigt, Art. 145 Abs. 1 ZPO)' : ''} — danach erlischt die Klagebewilligung.
                </p>
              )}
            </div>
          ) : (
            <Field label="Ausnahme/Verzicht (Art. 198/199 ZPO)">
              <div className="space-y-2">
                <select className={inputCls} value={a.ausnahme} onChange={(e) => set('ausnahme', e.target.value as KvAusnahme)}>
                  <option value="">– wählen –</option>
                  <option value="verzicht_gemeinsam">Gemeinsamer Verzicht (Streitwert ≥ CHF 100'000, Art. 199 Abs. 1)</option>
                  <option value="verzicht_einseitig">Einseitiger Verzicht (Gegenpartei im Ausland/unbekannt; GlG — Art. 199 Abs. 2)</option>
                  <option value="art198">Ausnahme nach Art. 198 ZPO</option>
                </select>
                {a.ausnahme === 'art198' && (
                  <input className={inputCls} value={a.ausnahmeText ?? ''} onChange={(e) => set('ausnahmeText', e.target.value)}
                    placeholder="Tatbestand, z. B. Widerklage (lit. g) oder gerichtliche Klagefrist (lit. h)" />
                )}
              </div>
            </Field>
          )}
          <Checkbox
            checked={a.vollmachtBeilage}
            onChange={(v) => set('vollmachtBeilage', v)}
            label={<>Vollmacht als Beilage (bei Vertretung)
                        </>} />
          <div className="space-y-2">
            <GruppenTitel>Weitere Beilagen</GruppenTitel>
            {a.weitereBeilagen.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputCls} value={b.bezeichnung}
                  onChange={(e) => set('weitereBeilagen', a.weitereBeilagen.map((x, j) => j === i ? { bezeichnung: e.target.value } : x))} />
                <button type="button" className="text-body-s text-danger-700 hover:underline shrink-0"
                  onClick={() => set('weitereBeilagen', a.weitereBeilagen.filter((_, j) => j !== i))}>entfernen</button>
              </div>
            ))}
            <button type="button" className="lc-btn-outline lc-btn-sm"
              onClick={() => set('weitereBeilagen', [...a.weitereBeilagen, { bezeichnung: '' }])}>+ Beilage</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ort"><input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} /></Field>
            <Field label="Datum"><DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} /></Field>
          </div>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {maengel.map((m, i) => (
            <div key={i} className="lc-notice-danger">
              <p className="text-body-s text-danger-700">{m.text}</p>
            </div>
          ))}
          {hinweise.map((h, i) => <div key={i} className="lc-notice text-body-s">{h}</div>)}

          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Form & Einreichung</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Unterschreiben und im Doppel einreichen:</strong><NormText text={` ein Exemplar für das Gericht, je eines pro Gegenpartei (Art. 131 ZPO); Papierform oder elektronisch mit qualifizierter Signatur (Art. 130 ZPO).`} /></li>
              <li><strong>Klagebewilligung beilegen</strong><NormText text={` (bzw. Ausnahme-Nachweis) — fehlt sie, setzt das Gericht Nachfrist (Art. 132 ZPO); die Klagefrist (Art. 209 Abs. 3/4 ZPO) läuft unabhängig davon.`} /></li>
              <li><strong>Identität wahren:</strong> Parteien, Rechtsbegehren und Streitgegenstand müssen der Klagebewilligung entsprechen; Änderungen nur nach Art. 227/230 ZPO.</li>
            </ul>
            <label className="flex items-start gap-2.5 py-1.5 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dieses Werkzeug erstellt eine Eingabe-Vorlage aus festen Bausteinen — Fristen und Vollständigkeit sind eigenverantwortlich zu prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || maengel.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Klage als PDF', banner: BANNER_KV, dateiName: 'Klage-vereinfachtes-Verfahren.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Klage als Word (DOCX)', banner: BANNER_KV, dateiName: 'Klage-vereinfachtes-Verfahren.docx' }
              : undefined} />

          <p className="text-xs text-ink-500">
            {a.gerichtsKanton === 'BS'
              ? 'Basel-Stadt: Spruchkörper-Routing amtlich abgenommen (GOG BS).'
              : `Kanton ${a.gerichtsKanton}: Gerichtsadresse aus zweifach geprüfter Recherche (fachliche Abnahme ausstehend); Spruchkörper und kantonale Besonderheiten richten sich nach kantonalem Recht — Angaben vor Einreichung prüfen.`}
          </p>
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      zurueckHref="/"
      overline={`${card?.rechtsgebiet ?? 'Zivilprozess (ZPO)'} · Vorlage · ${a.gerichtsKanton === 'BS' ? 'Basel-Stadt' : `Kanton ${a.gerichtsKanton}`}`}
      titel="Klage im vereinfachten Verfahren"
      intro="Erstellt die Klage nach Art. 244 ZPO aus festen Bausteinen: Rechtsbegehren, Streitgegenstand, freiwillige strukturierte Begründung, Beilagen mit Klagebewilligung — inkl. Gerichts-Adressat für alle Kantone (BS: abgenommenes Zivil-/Arbeitsgericht-Routing), Kostenfreiheits-Prüfung und Klagefrist-Berechnung mit Gerichtsferien. Ohne Sprachmodell."
      norms={card?.norms ?? []}
      badge="Papierform · unterschreiben · im Doppel"
      fussnote="Eingaben werden nicht gespeichert – sie bestehen nur, solange diese Seite geöffnet ist."
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      weiterDeaktiviert={stopp && schritt === 0}
      inhalt={inhalt()}
      vorschau={stopp
        ? <div className="lc-card p-5 text-body-s text-ink-600">Kein Dokument — siehe Hinweis: Für diese Konstellation ist das vereinfachte Verfahren nicht anwendbar (Streitwert/Materie prüfen).</div>
        : <VorschauPanel ergebnis={ergebnis} kompakt direktExport={{
          pdf: { label: 'PDF', banner: BANNER_KV, dateiName: 'Klage-vereinfachtes-Verfahren.pdf' },
          docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_KV, dateiName: 'Klage-vereinfachtes-Verfahren.docx' } : undefined,
          /* Vollständigkeits-Mängel sperren den Blanko-Export nicht; der fachliche Stopp ersetzt die Vorschau ganz. */
        }} />}
    />
  );
}

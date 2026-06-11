import { useMemo } from 'react';
import {
  KO_DEFAULTS, koZusammenstellen, koMaengel, koHinweise, koStreitwert, koPrefillLesen,
  type KoAnswers,
} from '../lib/vorlagen/klageOrdentlich';
import { KV_GERICHTE_BS, kvKlagefrist, type KvAusnahme } from '../lib/vorlagen/klageVereinfacht';
import { SgAdressatKachel } from '../components/vorlagen/SgBehoerdenWahl';
import { ParteiEditor } from './VorlageKlageVereinfacht';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { KvGerichtWahl } from '../components/vorlagen/KvGerichtWahl';
import { KANTONE } from '../lib/kantone';
import type { Kanton } from '../types/legal';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';
import { gerichtsErlass } from '../data/gerichtsorganisationErlasse';

// ─── Vorlagen-Wizard: Klage im ordentlichen Verfahren (alle Kantone) ─────────
// Auftrag David 10.6.2026. Dritte Klage-Vorlage; Gerüst und Bausteine wie
// die vereinfachte Klage (§10), aber: Begründung (Tatsachen + Beweismittel
// je Tatsache) ist PFLICHT (Art. 221 Abs. 1 lit. d/e ZPO), Streitwert ist
// Pflichtangabe (lit. c), Beweismittelverzeichnis automatisch (Abs. 2 lit. d).
// Wie die Schwester-Vorlagen BEWUSST ohne localStorage (Parteidaten).
// Logik in lib/vorlagen/klageOrdentlich.ts (§3).

const SCHRITTE = [
  { id: 'verfahren', label: 'Gericht & Streitwert' },
  { id: 'parteien', label: 'Parteien' },
  { id: 'begehren', label: 'Rechtsbegehren' },
  { id: 'begruendung', label: 'Begründung (Pflicht)' },
  { id: 'beilagen', label: 'Klagebewilligung & Beilagen' },
  { id: 'pruefen', label: 'Prüfen & Ausgabe' },
] as const;

const BANNER_KO: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK EIGENHÄNDIG UNTERZEICHNEN',
  text: 'Einreichung in Papierform mit Unterschrift (Art. 130 ZPO); elektronisch nur mit anerkannter qualifizierter Signatur. Je ein Exemplar für das Gericht und jede Gegenpartei (Art. 131 ZPO).',
};

export function VorlageKlageOrdentlich() {
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<KoAnswers>({
      defaults: {
        ...KO_DEFAULTS,
        ...((() => { try { return koPrefillLesen(window.location.search) ?? {}; } catch { return {}; } })()),
      },
    });

  const ergebnis = useMemo(() => koZusammenstellen(a), [a]);
  const maengel = useMemo(() => koMaengel(a), [a]);
  const hinweise = useMemo(() => koHinweise(a), [a]);
  const sw = koStreitwert(a);
  const frist = a.klagebewilligungVorhanden && a.klagebewilligungDatum
    ? kvKlagefrist(a.klagebewilligungDatum, a.mietePacht ? 'miete_kernbereich' : 'vermoegensrechtlich', a.gerichtsKanton) : null;

  const fehler = maengel.filter((m) => m.schritt === schritt).map((m) => m.text);
  const card = karte('klage-ordentlich');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'verfahren': return (
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="lc-overline">Zuständiges Gericht</p>
            <div className="grid grid-cols-[8rem_1fr] gap-3 items-start">
              <Field label="Kanton">
                <select className={inputCls} value={a.gerichtsKanton}
                  onChange={(e) => set('gerichtsKanton', e.target.value as Kanton)}>
                  {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              {!a.gerichtManuellAktiv && (a.gerichtsKanton === 'BS' ? (
                <SgAdressatKachel
                  zeilen={[KV_GERICHTE_BS.zivilgericht.name, KV_GERICHTE_BS.zivilgericht.strasse, KV_GERICHTE_BS.zivilgericht.plzOrt]}
                  url={KV_GERICHTE_BS.zivilgericht.url} />
              ) : a.gerichtAufgeloest ? (
                <SgAdressatKachel zeilen={a.gerichtAufgeloest.zeilen} url={a.gerichtAufgeloest.url} />
              ) : (
                <div className="lc-notice text-body-s">
                  Gericht wird unten über die kantonale Gerichtsschicht bestimmt — oder von Hand erfassen.
                </div>
              ))}
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
              <KvGerichtWahl kanton={a.gerichtsKanton} materie=""
                onAufgeloest={(z) => set('gerichtAufgeloest', z ?? undefined)} />
            )}
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.gerichtManuellAktiv ?? false}
                onChange={(e) => set('gerichtManuellAktiv', e.target.checked || undefined)} />
              <span>Adresse des Gerichts von Hand erfassen <span className="text-ink-500">(übersteuert die hinterlegte Anschrift)</span></span>
            </label>
            {a.gerichtManuellAktiv && (
              // Layout 11.6.2026 (Auftrag David, einheitlich mit dem
              // Schlichtungsgesuch): Name volle Breite, Strasse + PLZ zweispaltig.
              <div className="space-y-3 pl-6">
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
              </div>
            )}
          </div>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.vermoegensrechtlich}
              onChange={(e) => set('vermoegensrechtlich', e.target.checked)} />
            <span>Vermögensrechtliche Streitigkeit <span className="text-ink-500">(Streitwertangabe ist Pflichtinhalt, Art. 221 Abs. 1 lit. c ZPO)</span></span>
          </label>
          {a.vermoegensrechtlich && (
            <Field label="Streitwert (CHF)" hint="nach Art. 91 ZPO – ohne Zinsen und Kosten; über CHF 30'000 (sonst gilt das vereinfachte Verfahren)">
              <BetragsFeld value={a.streitwert} onChange={(v) => set('streitwert', v)} className={inputCls}
                placeholder="z. B. 80'000" aria-label="Streitwert in Franken" />
            </Field>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.mietePacht}
              onChange={(e) => set('mietePacht', e.target.checked)} />
            <span>Streitigkeit aus Miete/Pacht von Wohn-/Geschäftsräumen oder landwirtschaftlicher Pacht <span className="text-ink-500">(Klagefrist 30 Tage, Art. 209 Abs. 4 ZPO)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.einzigeInstanz}
              onChange={(e) => set('einzigeInstanz', e.target.checked)} />
            <span>Einzige kantonale Instanz <span className="text-ink-500">(Art. 5/6/8 ZPO — ordentliches Verfahren auch bis CHF 30'000, Art. 243 Abs. 3)</span></span>
          </label>
          {a.vermoegensrechtlich && sw !== null && sw > 30000 && (
            <p className="lc-notice text-body-s">
              Ordentliches Verfahren (Art. 219 ff. ZPO) — Streitwert über der Grenze des vereinfachten Verfahrens (Art. 243 Abs. 1 ZPO).
            </p>
          )}
        </div>
      );

      case 'parteien': return (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="lc-overline">Klagende Partei</p>
            <ParteiEditor p={a.klaeger} onChange={(p) => set('klaeger', p)} />
            <Field label="Vertretung" optional hint="Name/Kanzlei; Vollmacht als Beilage (Art. 221 Abs. 2 lit. a ZPO)">
              <input className={inputCls} value={a.vertretung ?? ''} onChange={(e) => set('vertretung', e.target.value)} />
            </Field>
          </div>
          <div className="space-y-2">
            <p className="lc-overline">Beklagte Partei</p>
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
            items={[
              { code: 'beziffert' as const, label: 'Beziffertes Begehren', sub: 'Bestimmter Betrag (Art. 84 Abs. 2 ZPO)' },
              { code: 'unbeziffert' as const, label: 'Unbezifferte Forderungsklage', sub: 'Mit Mindestwert (Art. 85 ZPO)' },
              { code: 'frei' as const, label: 'Frei formuliert', sub: 'z. B. Feststellung, Gestaltung, Realleistung' },
            ]}
            value={a.begehrenTyp}
            onSelect={(code) => set('begehrenTyp', code)}
          />
          {a.begehrenTyp === 'beziffert' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Betrag (CHF)"><BetragsFeld value={a.streitwert} onChange={(v) => set('streitwert', v)} className={inputCls} aria-label="Forderungsbetrag" /></Field>
              <Field label="Zins %" optional><input className={inputCls + ' num'} value={a.zins?.satz ?? ''} onChange={(e) => set('zins', { satz: e.target.value, abDatum: a.zins?.abDatum ?? '' })} placeholder="5" /></Field>
              <Field label="Zins seit" optional><DatumsFeld value={a.zins?.abDatum ?? ''} onChange={(v) => set('zins', { satz: a.zins?.satz ?? '', abDatum: v })} className={inputCls} /></Field>
            </div>
          )}
          {a.begehrenTyp === 'unbeziffert' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Mindestwert (CHF)" hint="Art. 85 Abs. 1 ZPO – vorläufiger Streitwert">
                <BetragsFeld value={a.unbeziffertMindest ?? ''} onChange={(v) => set('unbeziffertMindest', v)} className={inputCls} aria-label="Mindestwert" />
              </Field>
              <Field label="Grund der Unbezifferbarkeit" optional>
                <input className={inputCls} value={a.unbeziffertGrund ?? ''} onChange={(e) => set('unbeziffertGrund', e.target.value)} placeholder="z. B. Bezifferung erst nach Beweisverfahren möglich" />
              </Field>
            </div>
          )}
          {a.begehrenTyp === 'frei' && (
            <div className="space-y-2">
              <p className="lc-overline">Rechtsbegehren</p>
              {a.freieRechtsbegehren.map((w, i) => (
                <div key={i} className="flex gap-2">
                  <textarea className={inputCls} rows={2} value={w}
                    onChange={(e) => set('freieRechtsbegehren', a.freieRechtsbegehren.map((x, j) => j === i ? e.target.value : x))} />
                  <button type="button" className="text-body-s text-danger-700 hover:underline shrink-0 self-start pt-2"
                    onClick={() => set('freieRechtsbegehren', a.freieRechtsbegehren.filter((_, j) => j !== i))}>entfernen</button>
                </div>
              ))}
              <button type="button" className="lc-btn-outline lc-btn-sm"
                onClick={() => set('freieRechtsbegehren', [...a.freieRechtsbegehren, ''])}>+ Begehren</button>
            </div>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.rechtsoeffnung} onChange={(e) => set('rechtsoeffnung', e.target.checked)} />
            <span>Beseitigung des Rechtsvorschlags beantragen <span className="text-ink-500">(laufende Betreibung)</span></span>
          </label>
          {a.rechtsoeffnung && (
            <Field label="Betreibungs-Nr." optional>
              <input className={inputCls + ' sm:max-w-[14rem]'} value={a.betreibungNr ?? ''} onChange={(e) => set('betreibungNr', e.target.value)} />
            </Field>
          )}
          <Field label="Streitgegenstand" hint="Kurzbezeichnung für das Rubrum; identisch mit der Klagebewilligung">
            <textarea className={inputCls} rows={2} value={a.streitgegenstand} onChange={(e) => set('streitgegenstand', e.target.value)} />
          </Field>
          <div className="space-y-2">
            <p className="lc-overline">Weitere Rechtsbegehren <span className="normal-case text-ink-500">(optional)</span></p>
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
          <p className="lc-notice text-body-s">
            Im ordentlichen Verfahren sind die Tatsachenbehauptungen und die Beweismittel zu den
            einzelnen Tatsachen <strong>Pflichtinhalt</strong> der Klage (Art. 221 Abs. 1 lit. d/e ZPO).
          </p>
          {/* Auftrag David 11.6.2026: Begründung wahlweise hier erfassen oder
              als Platzhalter im Dokument später ausfüllen. */}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.begruendungModus === 'platzhalter'}
              onChange={(e) => set('begruendungModus', e.target.checked ? 'platzhalter' : 'maske')} />
            <span>Begründung später ausfüllen <span className="text-ink-500">(die Klage erhält nummerierte Platzhalter für Tatsachen, Beweise und Rechtliches; die Pflichtinhalte sind vor der Einreichung zu ergänzen)</span></span>
          </label>
          {a.begruendungModus === 'platzhalter' && (
            <p className="lc-notice-warn text-body-s">
              Das Dokument enthält Leer-Ziffern («________») unter «I. Tatsächliches», «II. Rechtliches»
              und im Beweismittelverzeichnis — vor der Einreichung vollständig ausfüllen (Art. 221 Abs. 1 lit. d/e ZPO).
            </p>
          )}
          {a.begruendungModus !== 'platzhalter' && (<>
          <div className="space-y-3">
            <p className="lc-overline">Tatsachenbehauptungen mit Beweisofferte</p>
            {a.tatsachen.map((t, i) => (
              <div key={i} className="lc-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="lc-overline">Ziffer {i + 1}</p>
                  {a.tatsachen.length > 1 && (
                    <button type="button" className="text-body-s text-danger-700 hover:underline"
                      onClick={() => set('tatsachen', a.tatsachen.filter((_, j) => j !== i))}>entfernen</button>
                  )}
                </div>
                <textarea className={inputCls} rows={3} value={t.text} placeholder="Behauptete Tatsache, je Ziffer ein Lebenssachverhalt"
                  onChange={(e) => set('tatsachen', a.tatsachen.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
                <div className="space-y-2 pl-2 border-l-2 border-line">
                  <p className="text-xs text-ink-600">Beweismittel zu dieser Tatsache (Art. 221 Abs. 1 lit. e ZPO):</p>
                  {t.beweise.map((b, bi) => (
                    <div key={bi} className="flex gap-2">
                      <input className={inputCls} value={b.bezeichnung} placeholder="z. B. Werkvertrag vom 1.2.2026 (Urkunde); Zeuge X; Parteibefragung"
                        onChange={(e) => set('tatsachen', a.tatsachen.map((x, j) => j === i
                          ? { ...x, beweise: x.beweise.map((y, k) => k === bi ? { bezeichnung: e.target.value } : y) } : x))} />
                      <button type="button" className="text-body-s text-danger-700 hover:underline shrink-0"
                        onClick={() => set('tatsachen', a.tatsachen.map((x, j) => j === i
                          ? { ...x, beweise: x.beweise.filter((_, k) => k !== bi) } : x))}>entfernen</button>
                    </div>
                  ))}
                  <button type="button" className="lc-btn-outline lc-btn-sm"
                    onClick={() => set('tatsachen', a.tatsachen.map((x, j) => j === i
                      ? { ...x, beweise: [...x.beweise, { bezeichnung: '' }] } : x))}>+ Beweismittel</button>
                </div>
              </div>
            ))}
            <button type="button" className="lc-btn-outline lc-btn-sm"
              onClick={() => set('tatsachen', [...a.tatsachen, { text: '', beweise: [] }])}>+ Tatsachenbehauptung</button>
          </div>
          <div className="space-y-2">
            <p className="lc-overline">Rechtliche Begründung <span className="normal-case text-ink-500">(fakultativ, Art. 221 Abs. 3 ZPO)</span></p>
            {a.rechtlicheBegruendung.map((r, i) => (
              <div key={i} className="flex gap-2">
                <textarea className={inputCls} rows={2} value={r.text}
                  onChange={(e) => set('rechtlicheBegruendung', a.rechtlicheBegruendung.map((x, j) => j === i ? { text: e.target.value } : x))} />
                <button type="button" className="text-body-s text-danger-700 hover:underline shrink-0 self-start pt-2"
                  onClick={() => set('rechtlicheBegruendung', a.rechtlicheBegruendung.filter((_, j) => j !== i))}>entfernen</button>
              </div>
            ))}
            <button type="button" className="lc-btn-outline lc-btn-sm"
              onClick={() => set('rechtlicheBegruendung', [...a.rechtlicheBegruendung, { text: '' }])}>+ Erwägung</button>
          </div>
          <p className="text-xs text-ink-500">
            Das Beweismittelverzeichnis (Art. 221 Abs. 2 lit. d ZPO) und das Beilagenverzeichnis
            werden aus den bezeichneten Beweismitteln automatisch erstellt.
          </p>
          </>)}
        </div>
      );

      case 'beilagen': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.klagebewilligungVorhanden} onChange={(e) => set('klagebewilligungVorhanden', e.target.checked)} />
            <span>Klagebewilligung der Schlichtungsbehörde liegt vor <span className="text-ink-500">(Art. 221 Abs. 2 lit. b ZPO)</span></span>
          </label>
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
            <Field label="Verzicht/Ausnahme (Art. 198/199 ZPO)">
              <div className="space-y-2">
                <select className={inputCls} value={a.ausnahme} onChange={(e) => set('ausnahme', e.target.value as KvAusnahme)}>
                  <option value="">– wählen –</option>
                  <option value="verzicht_gemeinsam">Gemeinsamer Verzicht (Streitwert ≥ CHF 100'000, Art. 199 Abs. 1)</option>
                  <option value="verzicht_einseitig">Einseitiger Verzicht (Gegenpartei im Ausland/unbekannt — Art. 199 Abs. 2)</option>
                  <option value="art198">Ausnahme nach Art. 198 ZPO</option>
                </select>
                {a.ausnahme === 'art198' && (
                  <input className={inputCls} value={a.ausnahmeText ?? ''} onChange={(e) => set('ausnahmeText', e.target.value)}
                    placeholder="Tatbestand, z. B. einzige kantonale Instanz (lit. f) oder Widerklage (lit. g)" />
                )}
              </div>
            </Field>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.vollmachtBeilage} onChange={(e) => set('vollmachtBeilage', e.target.checked)} />
            Vollmacht als Beilage (bei Vertretung, Art. 221 Abs. 2 lit. a ZPO)
          </label>
          <div className="space-y-2">
            <p className="lc-overline">Weitere Beilagen</p>
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
              <li><strong>Unterschreiben und im Doppel einreichen:</strong> ein Exemplar für das Gericht, je eines pro Gegenpartei (Art. 131 ZPO); Papierform oder elektronisch mit qualifizierter Signatur (Art. 130 ZPO).</li>
              <li><strong>Klagebewilligung beilegen</strong> (bzw. Verzichts-/Ausnahme-Nachweis) und die verfügbaren Beweisurkunden (Art. 221 Abs. 2 ZPO).</li>
              <li><strong>Identität wahren:</strong> Parteien, Rechtsbegehren und Streitgegenstand müssen der Klagebewilligung entsprechen; Änderungen nur nach Art. 227/230 ZPO.</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Dieses Werkzeug erstellt eine Eingabe-Vorlage aus festen Bausteinen — Fristen und Vollständigkeit sind eigenverantwortlich zu prüfen.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || maengel.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Klage als PDF', banner: BANNER_KO, dateiName: 'Klage-ordentliches-Verfahren.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Klage als Word (DOCX)', banner: BANNER_KO, dateiName: 'Klage-ordentliches-Verfahren.docx' }
              : undefined} />

          <p className="text-xs text-ink-500">
            Gerichtsadresse aus zweifach geprüfter Recherche (fachliche Abnahme ausstehend);
            Spruchkörper und kantonale Besonderheiten richten sich nach kantonalem Recht —
            Angaben vor Einreichung prüfen.
          </p>
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      zurueckHref="/"
      overline={`${card?.rechtsgebiet ?? 'Zivilprozess (ZPO)'} · Vorlage · ${a.gerichtsKanton === 'BS' ? 'Basel-Stadt' : `Kanton ${a.gerichtsKanton}`}`}
      titel="Klage im ordentlichen Verfahren"
      intro="Erstellt die Klageschrift nach Art. 221 ZPO aus festen Bausteinen: Rechtsbegehren, Streitwertangabe, Tatsachenbehauptungen mit Beweisofferte je Ziffer (Pflicht), fakultative rechtliche Begründung, Beweismittel- und Beilagenverzeichnis — Gerichts-Adressat für alle Kantone, Klagefrist-Berechnung mit Gerichtsferien. Ohne Sprachmodell."
      norms={card?.norms ?? []}
      badge="Papierform · unterschreiben · im Doppel"
      fussnote="Eingaben werden nicht gespeichert – sie bestehen nur, solange diese Seite geöffnet ist."
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} kompakt />}
    />
  );
}

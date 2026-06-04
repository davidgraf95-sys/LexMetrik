import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  VA_DEFAULTS, VA_BEREICHE, VA_MODULE, vaZusammenstellen, pruefeVaGates, beurkundungsHinweis,
  type VaAntworten, type VaBereich, type VaBeauftragte, type VaFormMode,
} from '../lib/vorlagen/vorsorgeauftrag';
import { vorlagenPdfErzeugen, type PdfBanner } from '../lib/vorlagen/vorlagenPdf';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, NormLink, Stepper, inputCls } from '../components/vorlagen/ui';
import { useLocale, fedlexLokalisiert } from '../components/locale';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Vorsorgeauftrag (Art. 360–369 ZGB) ────────────────────
// Zentrale Weiche: formMode — eigenhändig (Abschreib-Mustertext) oder
// öffentlich beurkundet (Entwurf für die Urkundsperson). Eligibility-Gate
// (Handlungsfähigkeit) blockiert hart. Eingaben bleiben im Browser.

const SPEICHER_KEY = 'lexmetrik.vorlage.vorsorgeauftrag.v1';

const SCHRITTE = [
  { id: 'voraussetzungen', label: 'Voraussetzungen & Form' },
  { id: 'person', label: 'Person' },
  { id: 'beauftragte', label: 'Beauftragte & Ersatz' },
  { id: 'aufgaben', label: 'Aufgaben' },
  { id: 'regelungen', label: 'Vollmachten & Entschädigung' },
  { id: 'abschluss', label: 'Abschluss' },
  { id: 'pruefen', label: 'Prüfen & Ausgabe' },
] as const;

const KANTONE = ['', 'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

const BANNER_VA_ABSCHREIBEN: PdfBanner = {
  titel: 'MUSTERTEXT — VOLLSTÄNDIG VON HAND ABZUSCHREIBEN',
  text: 'Dieses Blatt ist nicht der Vorsorgeauftrag. Gültig ist nur die von Anfang bis Ende eigenhändig geschriebene, datierte und unterschriebene Fassung — oder die öffentliche Beurkundung (Art. 361 ZGB).',
};
const BANNER_VA_BEURKUNDUNG: PdfBanner = {
  titel: 'ENTWURF FÜR DIE ÖFFENTLICHE BEURKUNDUNG',
  text: 'Vorlage zur Besprechung mit der Urkundsperson. Rechtsgültig wird der Vorsorgeauftrag erst mit der öffentlichen Beurkundung nach kantonalem Recht (Art. 361 Abs. 1 ZGB; BGE 151 III 81).',
};

export function VorlageVorsorgeauftrag() {
  const { locale } = useLocale();
  const [a, setA] = useState<VaAntworten>(() => {
    try {
      const roh = localStorage.getItem(SPEICHER_KEY);
      if (roh) {
        const geladen = { ...VA_DEFAULTS, ...JSON.parse(roh) } as VaAntworten;
        geladen.beauftragte = Array.isArray(geladen.beauftragte) ? geladen.beauftragte : [];
        geladen.ersatzpersonen = Array.isArray(geladen.ersatzpersonen) ? geladen.ersatzpersonen : [];
        geladen.module = {
          personensorge: Array.isArray(geladen.module?.personensorge) ? geladen.module.personensorge : [],
          vermoegenssorge: Array.isArray(geladen.module?.vermoegenssorge) ? geladen.module.vermoegenssorge : [],
          rechtsverkehr: Array.isArray(geladen.module?.rechtsverkehr) ? geladen.module.rechtsverkehr : [],
        };
        return geladen;
      }
    } catch { /* defekter Speicher → Defaults */ }
    return VA_DEFAULTS;
  });
  const [schritt, setSchritt] = useState(0);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(SPEICHER_KEY, JSON.stringify(a)); } catch { /* voll/blockiert */ }
  }, [a]);

  const set = <K extends keyof VaAntworten>(k: K, v: VaAntworten[K]) => setA((alt) => ({ ...alt, [k]: v }));
  const zuruecksetzen = () => {
    setA(VA_DEFAULTS); setSchritt(0); setBestaetigt(false);
    try { localStorage.removeItem(SPEICHER_KEY); } catch { /* ignorieren */ }
  };

  const ergebnis = useMemo(() => vaZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeVaGates(a), [a]);

  const eigenhaendig = a.formMode === 'eigenhaendig';
  const aktiveBereiche = new Set(a.beauftragte.flatMap((b) => (b.name.trim() ? b.bereiche : [])));

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0 && (!a.volljaehrig || !a.urteilsfaehigBestaetigt || !a.keineUmfassendeBeistandschaft)) {
      f.push('Alle drei Errichtungsvoraussetzungen bestätigen (Handlungsfähigkeit, Art. 13 ZGB) — sonst ist ein Vorsorgeauftrag nicht gültig errichtbar.');
    }
    if (i === 1) {
      if (!a.vorname.trim() || !a.nachname.trim()) f.push('Vor- und Nachname angeben.');
      if (!a.geburtsdatum) f.push('Geburtsdatum angeben.');
      if (!a.heimatort.trim()) f.push('Heimatort angeben.');
      if (!a.adresse.trim()) f.push('Adresse angeben.');
    }
    if (i === 5 && eigenhaendig && !a.datum) {
      f.push('Datum angeben — es wird beim eigenhändigen Vorsorgeauftrag mit abgeschrieben (Art. 361 Abs. 2 ZGB).');
    }
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const setBeauftragte = (i: number, patch: Partial<VaBeauftragte>) =>
    set('beauftragte', a.beauftragte.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const toggleBereich = (i: number, ber: VaBereich) => {
    const b = a.beauftragte[i];
    setBeauftragte(i, { bereiche: b.bereiche.includes(ber) ? b.bereiche.filter((x) => x !== ber) : [...b.bereiche, ber] });
  };
  const toggleModul = (ber: VaBereich, id: string) =>
    set('module', { ...a.module, [ber]: a.module[ber].includes(id) ? a.module[ber].filter((x) => x !== id) : [...a.module[ber], id] });

  const dokumentAlsText = () =>
    [ergebnis.dokument.titel.toUpperCase(), '', ...ergebnis.dokument.absaetze.flatMap((x) => [
      ...(x.ueberschrift ? [x.ueberschrift] : []), x.text, '',
    ]), '---', ergebnis.dokument.disclaimer].join('\n');

  const kopieren = () => {
    navigator.clipboard?.writeText(dokumentAlsText()).then(
      () => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); },
      () => {},
    );
  };

  const card = karte('vorsorgeauftrag');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'voraussetzungen': return (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="lc-overline">Errichtungsvoraussetzungen (Art. 13 ZGB)</p>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.volljaehrig} onChange={(e) => set('volljaehrig', e.target.checked)} />
              Ich bin volljährig (Art. 14 ZGB)
            </label>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.urteilsfaehigBestaetigt} onChange={(e) => set('urteilsfaehigBestaetigt', e.target.checked)} />
              Ich bin urteilsfähig (Art. 16 ZGB) — bei hohem Alter wird ein ärztliches Zeugnis zur Urteilsfähigkeit empfohlen
            </label>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.keineUmfassendeBeistandschaft} onChange={(e) => set('keineUmfassendeBeistandschaft', e.target.checked)} />
              Ich stehe nicht unter umfassender Beistandschaft (Art. 398 ZGB)
            </label>
          </div>

          <div className="space-y-2">
            <p className="lc-overline">Form (Art. 361 ZGB)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ['eigenhaendig', 'Eigenhändig', 'Vollständig von Hand schreiben, datieren, unterschreiben — Ausgabe als Abschreib-Mustertext'],
                ['oeffentlich_beurkundet', 'Öffentlich beurkundet', 'Entwurf für die Urkundsperson (Notariat) — Verfahren nach kantonalem Recht'],
              ] as [VaFormMode, string, string][]).map(([code, label, sub]) => (
                <button key={code} type="button" onClick={() => set('formMode', code)} aria-pressed={a.formMode === code}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    a.formMode === code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                  }`}>
                  <span className="block text-sm font-semibold text-ink-900">{label}</span>
                  <span className="block text-xs text-ink-500">{sub}</span>
                </button>
              ))}
            </div>
            {!eigenhaendig && (
              <div className="space-y-1 pt-1">
                <Field label="Kanton (für Beurkundungs-Hinweise)" optional>
                  <select className={inputCls + ' sm:max-w-[10rem]'} value={a.kanton ?? ''} onChange={(e) => set('kanton', e.target.value || undefined)}>
                    {KANTONE.map((k) => <option key={k} value={k}>{k === '' ? '– wählen –' : k}</option>)}
                  </select>
                </Field>
                <p className="text-xs text-ink-500">{beurkundungsHinweis(a.kanton)} Gebührenangaben sind Richtwerte und stellenabhängig.</p>
              </div>
            )}
          </div>
        </div>
      );

      case 'person': return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vorname"><input className={inputCls} value={a.vorname} onChange={(e) => set('vorname', e.target.value)} /></Field>
          <Field label="Nachname"><input className={inputCls} value={a.nachname} onChange={(e) => set('nachname', e.target.value)} /></Field>
          <Field label="Geburtsdatum"><DatumsFeld value={a.geburtsdatum} onChange={(v) => set('geburtsdatum', v)} className={inputCls} /></Field>
          <Field label="Heimatort"><input className={inputCls} value={a.heimatort} onChange={(e) => set('heimatort', e.target.value)} placeholder="z. B. Basel BS" /></Field>
          <div className="sm:col-span-2">
            <Field label="Adresse"><input className={inputCls} value={a.adresse} onChange={(e) => set('adresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" /></Field>
          </div>
        </div>
      );

      case 'beauftragte': return (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="lc-overline">Beauftragte Person(en)</p>
            <p className="text-xs text-ink-500">Pro Aufgabenbereich kann dieselbe oder eine andere Person bestimmt werden. Medizinische Vertretung nur durch natürliche Personen.</p>
            {a.beauftragte.map((b, i) => (
              <div key={i} className="lc-card p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-3">
                  <Field label="Name (Person oder Organisation)">
                    <input className={inputCls} value={b.name} onChange={(e) => setBeauftragte(i, { name: e.target.value })} />
                  </Field>
                  <Field label="Typ">
                    <select className={inputCls} value={b.typ} onChange={(e) => setBeauftragte(i, { typ: e.target.value as VaBeauftragte['typ'] })}>
                      <option value="natuerlich">natürliche Person</option>
                      <option value="juristisch">juristische Person</option>
                    </select>
                  </Field>
                </div>
                <Field label={b.typ === 'juristisch' ? 'Sitz / Adresse' : 'Geburtsdatum / Adresse'} hint="genaue Bezeichnung erleichtert der KESB die Eignungsprüfung">
                  <input className={inputCls} value={b.angaben} onChange={(e) => setBeauftragte(i, { angaben: e.target.value })} />
                </Field>
                <div className="flex flex-wrap items-center gap-3">
                  {VA_BEREICHE.map((ber) => (
                    <label key={ber.id} className="flex items-center gap-1.5 text-sm cursor-pointer text-ink-700">
                      <input type="checkbox" checked={b.bereiche.includes(ber.id)} onChange={() => toggleBereich(i, ber.id)} />
                      {ber.label}
                    </label>
                  ))}
                  <button type="button" onClick={() => set('beauftragte', a.beauftragte.filter((_, j) => j !== i))}
                    className="ml-auto text-body-s text-danger-700 hover:underline">entfernen</button>
                </div>
              </div>
            ))}
            <button type="button"
              onClick={() => set('beauftragte', [...a.beauftragte, { name: '', typ: 'natuerlich', angaben: '', bereiche: ['personensorge', 'vermoegenssorge', 'rechtsverkehr'] }])}
              className="lc-btn-outline">+ Beauftragte Person hinzufügen</button>
          </div>

          <div className="space-y-2">
            <p className="lc-overline">Ersatzpersonen (Art. 360 Abs. 3 ZGB)</p>
            {a.ersatzpersonen.map((e, i) => (
              <div key={i} className="flex flex-wrap items-end gap-2">
                <span className="num text-body-s text-ink-500 pb-2.5">{i + 1}.</span>
                <div className="flex-1 min-w-[10rem]">
                  <Field label="Name"><input className={inputCls} value={e.name}
                    onChange={(ev) => set('ersatzpersonen', a.ersatzpersonen.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} /></Field>
                </div>
                <div className="flex-1 min-w-[12rem]">
                  <Field label="Geburtsdatum / Adresse" optional><input className={inputCls} value={e.angaben}
                    onChange={(ev) => set('ersatzpersonen', a.ersatzpersonen.map((x, j) => j === i ? { ...x, angaben: ev.target.value } : x))} /></Field>
                </div>
                <button type="button" onClick={() => set('ersatzpersonen', a.ersatzpersonen.filter((_, j) => j !== i))}
                  className="text-body-s text-danger-700 hover:underline pb-2.5">entfernen</button>
              </div>
            ))}
            <button type="button" onClick={() => set('ersatzpersonen', [...a.ersatzpersonen, { name: '', angaben: '' }])}
              className="lc-btn-outline">+ Ersatzperson hinzufügen</button>
            <p className="text-xs text-ink-500">Empfehlung: Ersatzperson ausserhalb der Familie für Interessenkonfliktfälle.</p>
          </div>
        </div>
      );

      case 'aufgaben': return (
        <div className="space-y-5">
          {aktiveBereiche.size === 0 && (
            <p className="text-body-s text-ink-500">Zuerst im Schritt «Beauftragte & Ersatz» mindestens eine Person mit Aufgabenbereichen erfassen.</p>
          )}
          {VA_BEREICHE.filter((ber) => aktiveBereiche.has(ber.id)).map((ber) => (
            <div key={ber.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="lc-overline">{ber.label}</p>
                <button type="button" className="text-xs text-brass-700 hover:text-brass-600"
                  onClick={() => set('module', { ...a.module, [ber.id]: VA_MODULE[ber.id].map((m) => m.id) })}>
                  alle wählen
                </button>
              </div>
              {VA_MODULE[ber.id].map((m) => (
                <label key={m.id} className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={a.module[ber.id].includes(m.id)} onChange={() => toggleModul(ber.id, m.id)} />
                  {m.label}
                </label>
              ))}
            </div>
          ))}
          {a.module.vermoegenssorge.includes('liegenschaften') && (
            <p className="lc-notice rounded-md p-3 text-body-s text-ink-600">
              Liegenschaften gewählt: Die ausdrückliche Grundstück-Sondervollmacht wird automatisch
              aufgenommen (Art. 396 Abs. 3 OR — analoge Anwendung umstritten, Praxis empfiehlt sie).
            </p>
          )}
        </div>
      );

      case 'regelungen': return (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="lc-overline">Sondervollmachten</p>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.schenkungenErlaubt} onChange={(e) => set('schenkungenErlaubt', e.target.checked)} />
              <span>Übliche Gelegenheitsgeschenke erlauben <span className="text-ink-500">(Schranke: Art. 240 Abs. 2 OR)</span></span>
            </label>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.besondereGeschaefte} onChange={(e) => set('besondereGeschaefte', e.target.checked)} />
              <span>Besondere Geschäfte ausdrücklich ermächtigen: Vergleich, Schiedsvereinbarung, Wechsel <span className="text-ink-500">(Art. 396 Abs. 3 OR)</span></span>
            </label>
          </div>

          <Field label="Weisungen für die Erfüllung der Aufgaben" optional hint="Art. 360 Abs. 2 ZGB — z. B. Anlagegrundsätze, Wohnwünsche">
            <textarea className={inputCls} rows={3} value={a.weisungen ?? ''} onChange={(e) => set('weisungen', e.target.value)} />
          </Field>

          <div className="space-y-2">
            <p className="lc-overline">Entschädigung (Art. 366 ZGB)</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Entschädigung">
              {([
                ['keine_angabe', 'keine Regelung (KESB legt fest)'],
                ['unentgeltlich', 'unentgeltlich (Spesen ersetzt)'],
                ['pauschale', 'Pauschale pro Jahr'],
                ['nach_aufwand', 'nach Aufwand (CHF/Std.)'],
              ] as const).map(([code, label]) => (
                <button key={code} type="button" aria-pressed={a.entschaedigung === code}
                  onClick={() => set('entschaedigung', code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    a.entschaedigung === code ? 'bg-ink-900 border-ink-900 text-paper' : 'bg-surface border-line text-ink-600 hover:border-brass-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {(a.entschaedigung === 'pauschale' || a.entschaedigung === 'nach_aufwand') && (
              <Field label={a.entschaedigung === 'pauschale' ? 'Betrag (CHF pro Jahr)' : 'Ansatz (CHF pro Stunde)'}>
                <input type="number" min={0} className={inputCls + ' w-40'} value={a.entschaedigungBetrag ?? ''}
                  onChange={(e) => set('entschaedigungBetrag', e.target.value === '' ? undefined : Number(e.target.value))} />
              </Field>
            )}
          </div>
        </div>
      );

      case 'abschluss': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.pvVorhanden} onChange={(e) => set('pvVorhanden', e.target.checked)} />
            <span>Auf meine separate Patientenverfügung verweisen <span className="text-ink-500">(geht bei medizinischen Massnahmen vor)</span></span>
          </label>
          {a.pvVorhanden && (
            <Field label="Hinterlegungsort der Patientenverfügung" optional>
              <input className={inputCls} value={a.pvHinterlegung ?? ''} onChange={(e) => set('pvHinterlegung', e.target.value)} placeholder="z. B. Hausarztpraxis Dr. X" />
            </Field>
          )}
          <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.ersetztFruehere} onChange={(e) => set('ersetztFruehere', e.target.checked)} />
            <span>Frühere Vorsorgeaufträge ersetzen <span className="text-ink-500">(Art. 362 Abs. 3 ZGB)</span></span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ort" optional><input className={inputCls} value={a.ort ?? ''} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" /></Field>
            {eigenhaendig ? (
              <Field label="Datum" hint="wird beim eigenhändigen Vorsorgeauftrag mit abgeschrieben (Art. 361 Abs. 2 ZGB)">
                <DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} />
              </Field>
            ) : (
              <p className="text-body-s text-ink-500 self-end pb-2">Ort/Datum/Unterschriften erfolgen anlässlich der Beurkundung.</p>
            )}
          </div>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.map((b, i) => (
            <div key={i} className="rounded-lg border bg-danger-bg p-4" style={{ borderColor: 'var(--danger-500)' }}>
              <p className="text-body-s text-danger-700">{b}</p>
            </div>
          ))}
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn rounded-md p-3 text-body-s text-warn-700">{w}</div>
          ))}
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice rounded-md p-3 text-body-s text-ink-600">{h}</div>
          ))}

          {/* Form-Gate: nicht überspringbar, variantenabhängig */}
          <section className="rounded-xl border-2 p-5 space-y-3" style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}>
            <p className="lc-overline text-brass-700">Form-Gate — damit Ihr Vorsorgeauftrag gültig wird</p>
            {eigenhaendig ? (
              <ul className="space-y-2 text-body-s text-ink-700">
                <li><strong>Vollständig von Hand abschreiben:</strong> Der ganze Text — einschliesslich Ort, Datum und Unterschrift — muss eigenhändig geschrieben sein (Art. 361 Abs. 2 ZGB). Ein am Computer erstellter und nur unterschriebener Text ist UNGÜLTIG; auch eine bloss beglaubigte Unterschrift genügt nicht.</li>
                <li><strong>Alternative:</strong> öffentliche Beurkundung bei der Urkundsperson (Art. 361 Abs. 1 ZGB).</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-body-s text-ink-700">
                <li><strong>Beurkundung:</strong> Diesen Entwurf mit der Urkundsperson besprechen; das Verfahren richtet sich nach kantonalem Recht (BGE 151 III 81 — keine Zeugen erforderlich). {beurkundungsHinweis(a.kanton)}</li>
              </ul>
            )}
            <ul className="space-y-2 text-body-s text-ink-700">
              <li><strong>Wirksamkeit:</strong> Der Vorsorgeauftrag wird erst wirksam, wenn die KESB ihn bei eingetretener Urteilsunfähigkeit validiert (Art. 363 ZGB).</li>
              <li><strong>Auffindbarkeit:</strong> Errichtung und Hinterlegungsort beim Zivilstandsamt eintragen lassen (Art. 361 Abs. 3 ZGB; Gebühr CHF 75, Bestätigung +CHF 30 — Richtwerte). Die KESB anerkennt nur das Original; beauftragte Person informieren und Aufbewahrungsort mitteilen (nicht ins alleinige Bankschliessfach).</li>
              <li><strong>Widerruf:</strong> jederzeit in einer Errichtungsform oder durch Vernichtung der Urkunde (Art. 362 ZGB).</li>
            </ul>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              {eigenhaendig
                ? 'Ich habe verstanden: Nur die vollständig handschriftliche (oder beurkundete) Fassung ist gültig — dieses Werkzeug liefert einen Mustertext zum Abschreiben.'
                : 'Ich habe verstanden: Dieses Werkzeug liefert einen Entwurf — rechtsgültig wird der Vorsorgeauftrag erst mit der öffentlichen Beurkundung.'}
            </label>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!bestaetigt || gates.blocker.length > 0}
              onClick={() => vorlagenPdfErzeugen(ergebnis, {
                banner: eigenhaendig ? BANNER_VA_ABSCHREIBEN : BANNER_VA_BEURKUNDUNG,
                dateiName: eigenhaendig ? 'Vorsorgeauftrag-Mustertext.pdf' : 'Vorsorgeauftrag-Entwurf-Beurkundung.pdf',
              })}
              className="lc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {eigenhaendig ? 'Mustertext als PDF' : 'Entwurf als PDF'}
            </button>
            <button type="button" disabled={!bestaetigt || gates.blocker.length > 0} onClick={kopieren}
              className="lc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed">
              {kopiert ? 'Kopiert ✓' : 'Text kopieren'}
            </button>
          </div>

          <p className="text-xs text-ink-500">
            Bei komplexen Vermögensverhältnissen, Unternehmen oder Auslandsbezug: Notariat bzw.
            anwaltliche Beratung beiziehen. Ein ärztliches Zeugnis zur Urteilsfähigkeit ist bei
            hohem Alter empfehlenswert.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="space-y-3">
        <Link to="/?modus=vorlagen" className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
          <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line bg-surface">←</span>
          Zurück zu den Vorlagen
        </Link>
        <p className="lc-overline">{card?.rechtsgebiet ?? 'Familie'} · Vorlage</p>
        <h1 className="text-h1 font-display font-semibold text-ink-900">Vorsorgeauftrag</h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Bestimmen Sie, wer im Fall Ihrer Urteilsunfähigkeit Personensorge, Vermögenssorge und
          Vertretung im Rechtsverkehr übernimmt — aus festen, juristisch geprüften Bausteinen,
          ohne Sprachmodell. Mit der Form-Weiche eigenhändig ↔ öffentlich beurkundet.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(card?.norms ?? []).map((n) => (
            <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">Eigenhändig ODER beurkundet (Art. 361 ZGB)</span>
        </div>
        <p className="text-xs text-ink-500">
          Ihre Eingaben verlassen den Browser nicht (lokale Zwischenspeicherung).{' '}
          <button type="button" onClick={zuruecksetzen} className="text-brass-700 hover:text-brass-600 underline-offset-2 hover:underline">Eingaben löschen</button>
        </p>
      </div>

      <Stepper schritte={SCHRITTE} aktiv={schritt} onWechsel={setSchritt} />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
        <div className="bg-surface-raised rounded-2xl border border-line p-5 sm:p-6 space-y-5">
          <h2 className="text-h3 font-display font-semibold text-ink-900">{SCHRITTE[schritt].label}</h2>
          {inhalt()}

          {fehler.length > 0 && (
            <div className="rounded-md bg-danger-bg p-3 space-y-0.5">
              {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-line">
            <button type="button" onClick={() => setSchritt((s) => Math.max(0, s - 1))}
              disabled={schritt === 0} className="lc-btn-ghost disabled:opacity-40">← Zurück</button>
            {schritt < SCHRITTE.length - 1 && (
              <button type="button" onClick={() => setSchritt((s) => s + 1)}
                disabled={fehler.length > 0} className="lc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                Weiter →
              </button>
            )}
          </div>
        </div>

        <details className="lg:hidden bg-surface border border-line rounded-xl" open={schritt === SCHRITTE.length - 1}>
          <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-3 flex items-center justify-between text-body-s font-medium text-ink-700">
            <span>Vorschau & Bausteinprotokoll</span>
            <span aria-hidden className="text-ink-500">▾</span>
          </summary>
          <div className="px-4 pb-4">{vorschauSpalte()}</div>
        </details>
        <div className="hidden lg:block lg:sticky lg:top-28">
          {vorschauSpalte()}
        </div>
      </div>
    </div>
  );

  function vorschauSpalte() {
    return (
      <div className="space-y-4">
        <section aria-label="Vorschau" className="bg-paper-raised border border-line rounded-lg shadow-md p-5 sm:p-9">
          <p className="lc-overline mb-4">Vorschau · aktualisiert sich live</p>
          <div className="font-display text-ink-900 space-y-3" style={{ fontSize: '0.95rem', lineHeight: 1.75 }}>
            <p className="text-center font-semibold text-[1.15rem]">{ergebnis.dokument.titel}</p>
            {ergebnis.dokument.absaetze.map((abs) => (
              <div key={abs.bausteinId + abs.text.slice(0, 12)}>
                {abs.ueberschrift && <p className="font-semibold mt-2">{abs.ueberschrift}</p>}
                <p className="whitespace-pre-line">{abs.text}</p>
              </div>
            ))}
          </div>
          <p className="text-[0.65rem] text-ink-500 mt-6 pt-3 border-t border-line">{ergebnis.dokument.disclaimer}</p>
        </section>

        <details className="lc-card p-4">
          <summary className="cursor-pointer text-body-s font-medium text-ink-700">
            Bausteinprotokoll ({ergebnis.protokoll.length} Bausteine)
          </summary>
          <ul className="mt-3 space-y-2.5">
            {ergebnis.protokoll.map((p) => (
              <li key={p.bausteinId} className="text-body-s text-ink-600 space-y-1">
                <p><span className="num text-ink-500">{p.bausteinId}</span> — {p.begruendung}</p>
                {p.hinweis && <p className="text-xs text-warn-700">⚠ {p.hinweis}</p>}
                {p.norm && <p><NormLink artikel={p.norm} /></p>}
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  }
}

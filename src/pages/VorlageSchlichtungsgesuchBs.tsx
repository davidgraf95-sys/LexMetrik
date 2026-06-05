import { useMemo } from 'react';
import {
  SG_DEFAULTS, SG_PERSON_NATUERLICH, SG_SCHWELLEN, SG_OFFENE_VERIFIKATIONEN, SG_KANTONALE_ERLASSE,
  sgZusammenstellen, sgMaengel, sgHinweise, sgRouting, sgStreitwert, fmtCHF,
  type SgAnswers, type SgPartei, type SgTyp,
} from '../lib/vorlagen/schlichtungsgesuchBs';
import type { PdfBanner } from '../lib/vorlagen/banner';
import { BetragsFeld } from '../components/BetragsFeld';
import { behoerdeFuer, behoerdeAlsBlock } from '../lib/vorlagen/behoerden';
import { KANTONE } from '../lib/kantone';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, NormLink, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Schlichtungsgesuch (Art. 202 ZPO) · Basel-Stadt ───────
// Routing mit Stopp-Karten (Miete/GlG → eigene Stellen, Art. 200 ZPO;
// Art.-198-Ausnahmen → direkt ans Gericht), Mängelliste mit Sprung zum
// Schritt, Form-Gate (Papierform, Exemplare, Erscheinen, Kosten, Fristen).
// Gemäss Anweisung: KEINE Browser-Storage-APIs – State nur im Speicher.

const SCHRITTE = [
  { id: 'vorpruefung', label: 'Streitgegenstand & Vorprüfung' },
  { id: 'klaeger', label: 'Klagende Partei' },
  { id: 'beklagte', label: 'Beklagte Partei' },
  { id: 'rechtsbegehren', label: 'Rechtsbegehren' },
  { id: 'streitgegenstand', label: 'Streitgegenstand' },
  { id: 'abschluss', label: 'Anträge & Beilagen' },
  { id: 'pruefen', label: 'Prüfen & Download' },
] as const;

const TYPEN: { code: SgTyp; label: string; sub: string }[] = [
  { code: 'geldforderung', label: 'Geldforderung', sub: 'bezifferte Forderung (Art. 84 ZPO)' },
  { code: 'arbeitsrecht', label: 'Arbeitsrecht', sub: 'Forderung aus Arbeitsverhältnis – bis CHF 30\'000 kostenlos' },
  { code: 'uebrige_zivilsache', label: 'Übrige Zivilsache', sub: 'frei formulierte Rechtsbegehren' },
  { code: 'miete_pacht', label: 'Miete / Pacht', sub: 'Wohn-/Geschäftsräume – eigene Stelle' },
  { code: 'gleichstellung_glg', label: 'Gleichstellung (GlG)', sub: 'eigene Stelle, kostenlos' },
];

const BANNER_SG: PdfBanner = {
  titel: 'NACH DEM AUSDRUCK EIGENHÄNDIG UNTERZEICHNEN',
  text: 'Einreichung in Papierform mit Unterschrift (Art. 130 ZPO); elektronisch nur mit anerkannter qualifizierter Signatur. Je ein Exemplar für die Behörde und jede Gegenpartei (Art. 131 ZPO).',
};

export function VorlageSchlichtungsgesuchBs() {
  // KEIN speicherKey: Anweisung «keine Browser-Storage-APIs» – Zustand nur im Speicher.
  const { a, set, schritt, setSchritt, kopiert, kopieren } =
    useWizardState<SgAnswers>({ defaults: SG_DEFAULTS });

  const routing = useMemo(() => sgRouting(a), [a]);
  const ergebnis = useMemo(() => sgZusammenstellen(a), [a]);
  const maengel = useMemo(() => sgMaengel(a), [a]);
  const hinweise = useMemo(() => sgHinweise(a), [a]);
  const sw = sgStreitwert(a);
  const verm = a.streitgegenstandTyp === 'geldforderung' || a.streitgegenstandTyp === 'arbeitsrecht';
  const stopp = routing !== null && !routing.dokument;

  const card = karte('schlichtungsgesuch');
  const dateiBasis = `Schlichtungsgesuch_${(ergebnis.dokument ? a.klaeger[0] : null)?.typ === 'juristisch' ? (a.klaeger[0] as { firma: string }).firma : `${(a.klaeger[0] as { name?: string })?.name ?? 'Partei'}`}_${a.datum || 'Entwurf'}`.replace(/[^\w.-]+/g, '_');

  // ── Partei-Editor (klagend/beklagt identisch) ──
  const parteiEditor = (liste: SgPartei[], setListe: (p: SgPartei[]) => void, rolle: string) => (
    <div className="space-y-3">
      {liste.map((p, i) => (
        <div key={i} className="lc-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="lc-overline">{rolle} {liste.length > 1 ? i + 1 : ''}</p>
            <div className="flex items-center gap-2">
              <select className={inputCls + ' !w-auto text-body-s'} value={p.typ}
                onChange={(e) => {
                  const typ = e.target.value as SgPartei['typ'];
                  setListe(liste.map((x, j) => j === i ? (typ === 'natuerlich'
                    ? { ...SG_PERSON_NATUERLICH }
                    : { typ: 'juristisch', firma: '', sitzStrasse: '', sitzPlz: '', sitzOrt: '' }) : x));
                }}>
                <option value="natuerlich">natürliche Person</option>
                <option value="juristisch">juristische Person</option>
              </select>
              {liste.length > 1 && (
                <button type="button" onClick={() => setListe(liste.filter((_, j) => j !== i))}
                  className="text-body-s text-danger-700 hover:underline">entfernen</button>
              )}
            </div>
          </div>
          {p.typ === 'natuerlich' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Vorname"><input className={inputCls} value={p.vorname} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, vorname: e.target.value } : x))} /></Field>
              <Field label="Name"><input className={inputCls} value={p.name} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, name: e.target.value } : x))} /></Field>
              <Field label="Strasse / Nr."><input className={inputCls} value={p.strasse} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, strasse: e.target.value } : x))} /></Field>
              <div className="grid grid-cols-[6rem_1fr] gap-3">
                <Field label="PLZ"><input className={inputCls} inputMode="numeric" maxLength={4} placeholder="4051" value={p.plz} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, plz: e.target.value } : x))} /></Field>
                <Field label="Ort"><input className={inputCls} value={p.ort} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, ort: e.target.value } : x))} /></Field>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Firma"><input className={inputCls} value={p.firma} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, firma: e.target.value } : x))} /></Field>
              <Field label="Rechtsform" optional><input className={inputCls} placeholder="z. B. AG, GmbH" value={p.rechtsform ?? ''} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, rechtsform: e.target.value } : x))} /></Field>
              <Field label="Sitz: Strasse / Nr."><input className={inputCls} value={p.sitzStrasse} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, sitzStrasse: e.target.value } : x))} /></Field>
              <div className="grid grid-cols-[6rem_1fr] gap-3">
                <Field label="PLZ"><input className={inputCls} inputMode="numeric" maxLength={4} value={p.sitzPlz} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, sitzPlz: e.target.value } : x))} /></Field>
                <Field label="Ort"><input className={inputCls} value={p.sitzOrt} onChange={(e) => setListe(liste.map((x, j) => j === i ? { ...p, sitzOrt: e.target.value } : x))} /></Field>
              </div>
              <Field label="Zeichnungsberechtigte Person" optional hint="unterzeichnet bei unvertretener juristischer Person">
                <input className={inputCls} placeholder="Name, Funktion" value={p.zeichnungsberechtigt ? `${p.zeichnungsberechtigt.name}, ${p.zeichnungsberechtigt.funktion}` : ''}
                  onChange={(e) => {
                    const [name = '', funktion = ''] = e.target.value.split(',').map((x) => x.trim());
                    setListe(liste.map((x, j) => j === i ? { ...p, zeichnungsberechtigt: name ? { name, funktion } : undefined } : x));
                  }} />
              </Field>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => setListe([...liste, { ...SG_PERSON_NATUERLICH }])} className="lc-btn-outline">
        + Weitere Partei (Streitgenossenschaft)
      </button>
    </div>
  );

  // ── Stopp-Karte (hilfreich statt sackgassig) ──
  const stoppKarte = () => {
    if (!routing || routing.dokument) return null;
    if (routing.stopp === 'art198') return (
      <div className="lc-notice-warn rounded-xl p-5 space-y-2">
        <p className="lc-overline text-warn-700">Kein Schlichtungsverfahren</p>
        <p className="text-body-s text-ink-700">
          In diesem Fall findet kein Schlichtungsverfahren statt; die Klage ist direkt beim
          zuständigen Gericht einzureichen (Art. 198 ZPO).
        </p>
        <p><NormLink artikel="Art. 198 ZPO" /></p>
      </div>
    );
    const b = routing.behoerde!;
    return (
      <div className="lc-notice-warn rounded-xl p-5 space-y-2">
        <p className="lc-overline text-warn-700">Eigene Schlichtungsstelle zuständig</p>
        <p className="text-body-s text-ink-700">
          Für {routing.stopp === 'miete' ? 'Miete und Pacht von Wohn- und Geschäftsräumen' : 'Streitigkeiten nach Gleichstellungsgesetz'} besteht
          eine paritätische Stelle (Art. 200 ZPO) – dieses Gesuch ist dort einzureichen:
        </p>
        <p className="text-body-s text-ink-900 whitespace-pre-line font-medium">
          {b.name}{'\n'}{b.postadresse.join('\n')}{'\n'}Tel. {b.tel}{'email' in b && b.email ? `\n${b.email}` : ''}
        </p>
        {routing.stopp === 'miete' && (
          <p className="text-xs text-ink-600">
            Hinweis: Bei Miete/Pacht von Wohn- und Geschäftsräumen gilt die Klagebewilligung nur
            {' '}{SG_SCHWELLEN.KLAGEBEWILLIGUNG_MIETE_TAGE} Tage (Art. 209 Abs. 4 ZPO).
          </p>
        )}
        <p><NormLink artikel="Art. 200 ZPO" /></p>
      </div>
    );
  };

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'vorpruefung': return (
        <div className="space-y-5">
          {/* Behörden-Grundgerüst (5.6.2026): Kanton zuerst – Registry löst
              die VOLLSTÄNDIGE Adresse auf (Pilot BS); Handeingabe als Override */}
          <div className="space-y-3">
            <p className="lc-overline">Zuständige Schlichtungsbehörde</p>
            <div className="grid grid-cols-[8rem_1fr] gap-3 items-start">
              <Field label="Kanton">
                <select className={inputCls} value={a.gerichtsKanton}
                  onChange={(e) => set('gerichtsKanton', e.target.value as SgAnswers['gerichtsKanton'])}>
                  {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              {(() => {
                const manuell = a.behoerdeManuellAktiv;
                const reg = behoerdeFuer('schlichtungsbehoerde_zivil', a.gerichtsKanton);
                if (manuell) return null;
                if (reg) return (
                  <div className="lc-tile">
                    <p className="text-body-s text-ink-900 whitespace-pre-line font-medium">{behoerdeAlsBlock(reg)}</p>
                    <p className="text-micro text-ink-500 mt-1.5">Amtliche Anschrift · {reg.quelle} · Stand {reg.stand}</p>
                  </div>
                );
                return (
                  <div className="lc-notice-danger text-body-s" role="alert">
                    Für den Kanton {a.gerichtsKanton} sind die Behördenadressen noch nicht hinterlegt —
                    Basel-Stadt wählen oder die Adresse der zuständigen Schlichtungsbehörde unten von Hand erfassen.
                  </div>
                );
              })()}
            </div>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.behoerdeManuellAktiv ?? false}
                onChange={(e) => set('behoerdeManuellAktiv', e.target.checked || undefined)} />
              <span>Adresse der Behörde/des Gerichts von Hand erfassen <span className="text-ink-500">(übersteuert die hinterlegte Anschrift)</span></span>
            </label>
            {a.behoerdeManuellAktiv && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-6">
                <Field label="Behörde/Gericht">
                  <input className={inputCls} value={a.behoerdeManuell?.name ?? ''}
                    onChange={(e) => set('behoerdeManuell', { name: e.target.value, strasse: a.behoerdeManuell?.strasse ?? '', plzOrt: a.behoerdeManuell?.plzOrt ?? '' })}
                    placeholder="z. B. Friedensrichteramt X" />
                </Field>
                <Field label="Strasse und Hausnummer">
                  <input className={inputCls} value={a.behoerdeManuell?.strasse ?? ''}
                    onChange={(e) => set('behoerdeManuell', { name: a.behoerdeManuell?.name ?? '', strasse: e.target.value, plzOrt: a.behoerdeManuell?.plzOrt ?? '' })}
                    placeholder="z. B. Gerichtsgasse 1" />
                </Field>
                <Field label="PLZ und Ort">
                  <input className={inputCls} value={a.behoerdeManuell?.plzOrt ?? ''}
                    onChange={(e) => set('behoerdeManuell', { name: a.behoerdeManuell?.name ?? '', strasse: a.behoerdeManuell?.strasse ?? '', plzOrt: e.target.value })}
                    placeholder="z. B. 4001 Basel" />
                </Field>
              </div>
            )}
            {a.gerichtsKanton !== 'BS' && a.behoerdeManuellAktiv && (
              <p className="lc-notice-warn text-body-s">
                Hinweis: Das sachliche Routing dieses Wizards (Spezialbehörden, Schwellen) ist auf
                Basel-Stadt zugeschnitten – die Zuständigkeit im Kanton {a.gerichtsKanton} ist
                selbständig zu prüfen.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="lc-overline">Art des Streitgegenstands</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TYPEN.map((t) => (
                <button key={t.code} type="button" onClick={() => set('streitgegenstandTyp', t.code)}
                  aria-pressed={a.streitgegenstandTyp === t.code}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    a.streitgegenstandTyp === t.code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                  }`}>
                  <span className="block text-body-s font-semibold text-ink-900">{t.label}</span>
                  <span className="block text-xs text-ink-500">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {stopp ? stoppKarte() : (
            <>
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.ausnahmeArt198} onChange={(e) => set('ausnahmeArt198', e.target.checked)} />
                <span>Es liegt eine Ausnahme nach Art. 198 ZPO vor <span className="text-ink-500">(z. B. summarisches Verfahren, Scheidung, bestimmte SchKG-Klagen, Widerklage, einzige kantonale Instanz)</span></span>
              </label>
              <p className="text-xs text-ink-500">
                Dieses Werkzeug stellt das Gesuch zusammen; die örtliche und sachliche Zuständigkeit
                prüfen Sie selbst (massgebliche Gerichtsstände u. a. Art. 10, 31, 33, 34, 35 ZPO;
                BGE 146 III 265 – zu verifizieren).
              </p>
              {a.streitgegenstandTyp === 'uebrige_zivilsache' && (
                <Field label="Streitwert (CHF)" optional hint="für die Schwellen-Logik (Art. 210/212 ZPO); bei Geldforderungen automatisch">
                  <BetragsFeld className={inputCls + ' w-40'} value={a.streitwert ?? ''} onChange={(v) => set('streitwert', v)} />
                </Field>
              )}
            </>
          )}
        </div>
      );

      case 'klaeger': return (
        <div className="space-y-5">
          {parteiEditor(a.klaeger, (p) => set('klaeger', p), 'Klagende Partei')}
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={!!a.vertretung}
                onChange={(e) => set('vertretung', e.target.checked ? { bezeichnung: '', strasse: '', plz: '', ort: '' } : undefined)} />
              Die klagende Partei ist vertreten (Anwältin/Anwalt, Rechtsdienst)
            </label>
            {a.vertretung && (
              <div className="lc-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Bezeichnung der Vertretung"><input className={inputCls} placeholder="z. B. Adv. Dr. iur. X" value={a.vertretung.bezeichnung} onChange={(e) => set('vertretung', { ...a.vertretung!, bezeichnung: e.target.value })} /></Field>
                <Field label="Kanzlei / Zusatz" optional><input className={inputCls} value={a.vertretung.zusatz ?? ''} onChange={(e) => set('vertretung', { ...a.vertretung!, zusatz: e.target.value })} /></Field>
                <Field label="Strasse / Nr."><input className={inputCls} value={a.vertretung.strasse} onChange={(e) => set('vertretung', { ...a.vertretung!, strasse: e.target.value })} /></Field>
                <div className="grid grid-cols-[6rem_1fr] gap-3">
                  <Field label="PLZ"><input className={inputCls} maxLength={4} value={a.vertretung.plz} onChange={(e) => set('vertretung', { ...a.vertretung!, plz: e.target.value })} /></Field>
                  <Field label="Ort"><input className={inputCls} value={a.vertretung.ort} onChange={(e) => set('vertretung', { ...a.vertretung!, ort: e.target.value })} /></Field>
                </div>
                <Field label="Vollmacht vom" optional hint="wird automatisch ins Beilagenverzeichnis aufgenommen">
                  <DatumsFeld value={a.vertretung.vollmachtDatum ?? ''} onChange={(v) => set('vertretung', { ...a.vertretung!, vollmachtDatum: v })} className={inputCls} />
                </Field>
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700 self-end pb-2">
                  <input type="checkbox" checked={a.vertretung.mwstPflichtig ?? false} onChange={(e) => set('vertretung', { ...a.vertretung!, mwstPflichtig: e.target.checked })} />
                  mehrwertsteuerpflichtig (Kostenfolge «zzgl. MwSt.»)
                </label>
              </div>
            )}
          </div>
        </div>
      );

      case 'beklagte': return (
        <div className="space-y-5">
          {parteiEditor(a.beklagte, (p) => set('beklagte', p), 'Beklagte Partei')}
          {verm && (
            <div className="space-y-3">
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={!!a.betreibung}
                  onChange={(e) => set('betreibung', e.target.checked ? { nummer: '', betreibungsamt: 'Basel-Stadt', rechtsvorschlagErhoben: false } : undefined)} />
                Es läuft bereits eine Betreibung
              </label>
              {a.betreibung && (
                <div className="lc-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Betreibungs-Nr."><input className={inputCls} value={a.betreibung.nummer} onChange={(e) => set('betreibung', { ...a.betreibung!, nummer: e.target.value })} /></Field>
                  <Field label="Betreibungsamt"><input className={inputCls} value={a.betreibung.betreibungsamt} onChange={(e) => set('betreibung', { ...a.betreibung!, betreibungsamt: e.target.value })} /></Field>
                  <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700 sm:col-span-2">
                    <input type="checkbox" checked={a.betreibung.rechtsvorschlagErhoben} onChange={(e) => set('betreibung', { ...a.betreibung!, rechtsvorschlagErhoben: e.target.checked })} />
                    Die beklagte Partei hat Rechtsvorschlag erhoben
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      );

      case 'rechtsbegehren': return (
        <div className="space-y-5">
          {verm ? (
            <>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pfad">
                {([['beziffert', 'Bezifferte Forderung'], ['unbeziffert', 'Unbeziffert (Art. 85 ZPO)']] as const).map(([code, label]) => (
                  <button key={code} type="button" aria-pressed={(code === 'unbeziffert') === !!a.unbeziffert}
                    onClick={() => {
                      if (code === 'unbeziffert') { set('unbeziffert', a.unbeziffert ?? { mindestbetrag: '', grund: '' }); set('geld', undefined); }
                      else { set('unbeziffert', undefined); set('geld', a.geld ?? { betrag: '' }); }
                    }}
                    className={`px-3 py-1.5 rounded-full text-body-s font-medium border transition-colors ${
                      ((code === 'unbeziffert') === !!a.unbeziffert) ? 'bg-ink-900 border-ink-900 text-paper' : 'bg-surface border-line text-ink-600 hover:border-brass-400'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {!a.unbeziffert ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Forderungsbetrag (CHF)" hint="zu beziffern (Art. 84 Abs. 2 ZPO) – z. B. 3000">
                    <input className={inputCls} inputMode="decimal" placeholder="z. B. 3'000.00" value={a.geld?.betrag ?? ''} onChange={(e) => set('geld', { ...(a.geld ?? { betrag: '' }), betrag: e.target.value })} />
                  </Field>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                      <input type="checkbox" checked={!!a.geld?.zins}
                        onChange={(e) => set('geld', { ...(a.geld ?? { betrag: '' }), zins: e.target.checked ? { satz: '5', abDatum: '' } : undefined })} />
                      <span>nebst Zins <span className="text-ink-500">(Verzugszins 5 %, Art. 104 OR)</span></span>
                    </label>
                    {a.geld?.zins && (
                      <div className="grid grid-cols-[6rem_1fr] gap-3">
                        <Field label="Satz (%)"><input className={inputCls} inputMode="decimal" value={a.geld.zins.satz} onChange={(e) => set('geld', { ...a.geld!, zins: { ...a.geld!.zins!, satz: e.target.value } })} /></Field>
                        <Field label="seit"><DatumsFeld value={a.geld.zins.abDatum} onChange={(v) => set('geld', { ...a.geld!, zins: { ...a.geld!.zins!, abDatum: v } })} className={inputCls} /></Field>
                      </div>
                    )}
                  </div>
                  <label className={`flex items-start gap-2 text-body-s sm:col-span-2 ${a.betreibung?.rechtsvorschlagErhoben ? 'cursor-pointer text-ink-700' : 'text-ink-400 cursor-not-allowed'}`}>
                    <input type="checkbox" disabled={!a.betreibung?.rechtsvorschlagErhoben} checked={!!a.geld?.rechtsoeffnung}
                      onChange={(e) => set('geld', { ...(a.geld ?? { betrag: '' }), rechtsoeffnung: e.target.checked })} />
                    <span>Beseitigung des Rechtsvorschlags beantragen {!a.betreibung?.rechtsvorschlagErhoben && <span>(setzt erhobenen Rechtsvorschlag voraus – Schritt «Beklagte Partei»)</span>}</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Mindestbetrag (CHF)" hint="gilt als vorläufiger Streitwert (Art. 85 ZPO)">
                    <BetragsFeld className={inputCls} value={a.unbeziffert.mindestbetrag} onChange={(v) => set('unbeziffert', { ...a.unbeziffert!, mindestbetrag: v } )} />
                  </Field>
                  <Field label="Warum ist die Bezifferung nicht möglich/zumutbar?">
                    <input className={inputCls} placeholder="z. B. Höhe vom Beweisverfahren abhängig" value={a.unbeziffert.grund} onChange={(e) => set('unbeziffert', { ...a.unbeziffert!, grund: e.target.value })} />
                  </Field>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-body-s text-ink-600">
                Rechtsbegehren präzise und vollstreckbar formulieren (bestimmtes Tun, Unterlassen
                oder Dulden; Geld beziffern). Die Einträge werden 1:1 übernommen.
              </p>
              {a.freieRechtsbegehren.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="num text-body-s text-ink-500 pt-3">{i + 1}.</span>
                  <textarea className={inputCls} rows={2} value={r}
                    onChange={(e) => set('freieRechtsbegehren', a.freieRechtsbegehren.map((x, j) => j === i ? e.target.value : x))} />
                  <button type="button" onClick={() => set('freieRechtsbegehren', a.freieRechtsbegehren.filter((_, j) => j !== i))}
                    className="text-body-s text-danger-700 hover:underline pt-3">entfernen</button>
                </div>
              ))}
              <button type="button" onClick={() => set('freieRechtsbegehren', [...a.freieRechtsbegehren, ''])} className="lc-btn-outline">
                + Rechtsbegehren
              </button>
            </div>
          )}

          <div className="space-y-2">
            <p className="lc-overline">Weitere Rechtsbegehren <span className="normal-case text-ink-500">· optional</span></p>
            {a.weitereRechtsbegehren.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <textarea className={inputCls} rows={2} value={r}
                  onChange={(e) => set('weitereRechtsbegehren', a.weitereRechtsbegehren.map((x, j) => j === i ? e.target.value : x))} />
                <button type="button" onClick={() => set('weitereRechtsbegehren', a.weitereRechtsbegehren.filter((_, j) => j !== i))}
                  className="text-body-s text-danger-700 hover:underline pt-3">entfernen</button>
              </div>
            ))}
            <button type="button" onClick={() => set('weitereRechtsbegehren', [...a.weitereRechtsbegehren, ''])} className="lc-btn-outline">+ Zusatzbegehren</button>
            <p className="text-xs text-ink-500">Die Kostenfolge wird automatisch als letztes Begehren ergänzt.</p>
          </div>
        </div>
      );

      case 'streitgegenstand': return (
        <div className="space-y-4">
          <Field label="Streitgegenstand" hint="kurze Umschreibung in wenigen Sätzen oder Stichworten (Pflicht, Art. 202 Abs. 2 ZPO)">
            <textarea className={inputCls} rows={3} value={a.streitgegenstand}
              placeholder="z. B. Forderung aus Werkvertrag vom 01.02.2025 (Rechnung Nr. 1234)"
              onChange={(e) => set('streitgegenstand', e.target.value)} />
          </Field>
          <Field label="Begründung" optional hint="nicht erforderlich – eine kurze Begründung ist möglich">
            <textarea className={inputCls} rows={4} value={a.begruendung ?? ''} onChange={(e) => set('begruendung', e.target.value)} />
          </Field>
        </div>
      );

      case 'abschluss': return (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className={`flex items-start gap-2 text-body-s ${verm && sw !== null && sw <= SG_SCHWELLEN.ENTSCHEID_AUF_ANTRAG ? 'cursor-pointer text-ink-700' : 'text-ink-400 cursor-not-allowed'}`}>
              <input type="checkbox" className="mt-0.5"
                disabled={!(verm && sw !== null && sw <= SG_SCHWELLEN.ENTSCHEID_AUF_ANTRAG)}
                checked={a.antragEntscheid} onChange={(e) => set('antragEntscheid', e.target.checked)} />
              <span>Antrag auf Entscheid der Schlichtungsbehörde (Art. 212 ZPO)
                {!(verm && sw !== null && sw <= SG_SCHWELLEN.ENTSCHEID_AUF_ANTRAG) &&
                  <span> – nur bei vermögensrechtlichen Streitigkeiten bis CHF {fmtCHF(String(SG_SCHWELLEN.ENTSCHEID_AUF_ANTRAG))}</span>}
              </span>
            </label>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={a.antragMediation} onChange={(e) => set('antragMediation', e.target.checked)} />
              <span>Antrag auf Mediation (Art. 213 ZPO) <span className="text-ink-500">— setzt Zustimmung der Gegenpartei voraus; kann auch erst an der Verhandlung gestellt werden</span></span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="lc-overline">Beilagen</p>
            {a.vertretung?.bezeichnung && <p className="text-xs text-ink-500">«Vollmacht» wird automatisch aufgenommen.</p>}
            {a.beilagen.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} value={b.bezeichnung} placeholder="z. B. Vertrag vom 01.02.2025"
                  onChange={(e) => set('beilagen', a.beilagen.map((x, j) => j === i ? { bezeichnung: e.target.value } : x))} />
                <button type="button" onClick={() => set('beilagen', a.beilagen.filter((_, j) => j !== i))}
                  className="text-body-s text-danger-700 hover:underline">entfernen</button>
              </div>
            ))}
            <button type="button" onClick={() => set('beilagen', [...a.beilagen, { bezeichnung: '' }])} className="lc-btn-outline">+ Beilage</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ort"><input className={inputCls} value={a.ort} onChange={(e) => set('ort', e.target.value)} /></Field>
            <Field label="Datum"><DatumsFeld value={a.datum} onChange={(v) => set('datum', v)} className={inputCls} /></Field>
          </div>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {stopp && stoppKarte()}

          {!stopp && maengel.length > 0 && (
            <div className="rounded-lg border bg-danger-bg p-4 space-y-1.5" role="alert" aria-live="polite">
              <p className="lc-overline text-danger-700">Mängelliste – vor dem Download zu beheben</p>
              {maengel.map((m, i) => (
                <p key={i} className="text-body-s text-danger-700">
                  • {m.text}{' '}
                  <button type="button" onClick={() => setSchritt(m.schritt)} className="underline underline-offset-2 hover:opacity-80">
                    zum Schritt →
                  </button>
                </p>
              ))}
            </div>
          )}

          {!stopp && hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          {/* Form-Gate (Art. 130/131/204/206/209 ZPO; Kosten GGR BS) */}
          {!stopp && (
            <section className="rounded-xl border-2 p-5 space-y-3" style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}>
              <p className="lc-overline text-brass-700">Form-Gate – Einreichung & Verfahren</p>
              <ul className="space-y-2 text-body-s text-ink-700">
                <li><strong>Form:</strong> schriftlich in Papierform, eigenhändig unterzeichnet (Art. 130 ZPO) – von der klagenden Partei, der Vertretung bzw. der zeichnungsberechtigten Person. Elektronisch nur mit anerkannter qualifizierter Signatur; gewöhnliche E-Mail genügt nicht.</li>
                <li><strong>Exemplare:</strong> Gesuch, Beilagenverzeichnis und Beilagen in je einem Exemplar für die Behörde und jede Gegenpartei (Art. 131 ZPO) – hier: <span className="num font-semibold">{ergebnis.exemplare}</span> Exemplare.</li>
                {a.vertretung?.bezeichnung && <li><strong>Vollmacht</strong> beilegen.</li>}
                <li><strong>Persönliches Erscheinen</strong> an der Verhandlung (Art. 204 ZPO); Dispens u. a. bei ausserkantonalem/ausländischem Wohnsitz oder Streitwert bis CHF {fmtCHF(String(SG_SCHWELLEN.ARBEITSRECHT_KOSTENLOS))} (Abs. 3). Säumnis der klagenden Partei: Gesuch gilt als zurückgezogen; Ordnungsbusse bis CHF {fmtCHF(String(SG_SCHWELLEN.ORDNUNGSBUSSE_MAX))} möglich (Art. 206 Abs. 4 ZPO).</li>
                <li><strong>Klagebewilligung:</strong> bei Nichteinigung {SG_SCHWELLEN.KLAGEBEWILLIGUNG_MONATE} Monate gültig (Art. 209 Abs. 3 ZPO).</li>
                <li><strong>Kosten:</strong> Gebühr ab CHF 100 bis max. 30 % der Gerichtsgebühr (GGR BS, SG 154.810 – §-Nummer zu verifizieren); grundsätzlich keine Parteientschädigung.{a.streitgegenstandTyp === 'arbeitsrecht' && sw !== null && sw <= SG_SCHWELLEN.ARBEITSRECHT_KOSTENLOS && <> <strong>Hier: kostenlos</strong> (arbeitsrechtlich bis CHF 30'000, Art. 113 f. ZPO).</>}</li>
                <li><strong>Fristen:</strong> Im Schlichtungsverfahren gelten keine Gerichtsferien (Art. 145 Abs. 2 lit. a ZPO); die anschliessende Klagefrist gehört zum Entscheidverfahren – dort gelten sie (BGE 138 III 615 – zu verifizieren).</li>
              </ul>
            </section>
          )}

          {!stopp && (
            <ExportLeiste ergebnis={ergebnis} deaktiviert={maengel.length > 0}
              kopiert={kopiert} onKopieren={kopieren}
              pdf={{ label: 'Gesuch als PDF', banner: BANNER_SG, dateiName: `${dateiBasis}.pdf` }}
              docx={card?.modus === 'vorlage' && card.output?.includes('docx')
                ? { label: 'Gesuch als Word (DOCX)', banner: BANNER_SG, dateiName: `${dateiBasis}.docx` }
                : undefined} />
          )}

          {/* Offene Verifikationen (transparent, dezent) */}
          <details className="lc-card p-4">
            <summary className="cursor-pointer text-body-s font-medium text-ink-700">Offene Verifikationen ({SG_OFFENE_VERIFIKATIONEN.length})</summary>
            <ul className="mt-2 space-y-1.5">
              {SG_OFFENE_VERIFIKATIONEN.map((v, i) => <li key={i} className="text-xs text-ink-600">– {v}</li>)}
            </ul>
            <p className="text-xs text-ink-500 mt-2">
              Kantonale Erlasse (nur Erlass-Seiten, keine §-Anker):{' '}
              {SG_KANTONALE_ERLASSE.map((e, i) => (
                <span key={e.label}>{i > 0 && ' · '}<a className="text-brass-700 hover:underline" href={e.url} target="_blank" rel="noopener noreferrer">{e.label}</a></span>
              ))}
            </p>
          </details>
        </div>
      );
    }
  };

  return (
    <VorlagenWizardRahmen
      zurueckHref="/pro"
      overline={`${card?.rechtsgebiet ?? 'Zivilprozess (ZPO)'} · Vorlage · Basel-Stadt`}
      titel="Schlichtungsgesuch (Basel-Stadt)"
      intro="Stellt ein Schlichtungsgesuch nach Art. 202 ZPO für die Basler Schlichtungsbehörde zusammen – Parteien, Rechtsbegehren, Streitgegenstand, Anträge und Beilagen, aus festen Bausteinen ohne Sprachmodell."
      norms={card?.norms ?? []}
      badge="Papierform · eigenhändig unterzeichnen"
      fussnote="Eingaben werden nicht gespeichert – sie bestehen nur, solange diese Seite geöffnet ist."
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      weiterDeaktiviert={stopp}
      inhalt={inhalt()}
      vorschau={stopp
        ? <div className="lc-card p-5 text-body-s text-ink-600">Kein Dokument – siehe Stopp-Hinweis: Dieses Gesuch gehört an eine andere Stelle bzw. direkt ans Gericht.</div>
        : <VorschauPanel ergebnis={ergebnis} kompakt nichtAufgenommen={ergebnis.nichtAufgenommen} />}
    />
  );
}

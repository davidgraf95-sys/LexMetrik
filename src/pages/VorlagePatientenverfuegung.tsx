import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PV_DEFAULTS, PV_DEFAULT_MASSNAHMEN, PV_MASSNAHMEN, PV_SITUATIONEN,
  pvZusammenstellen, pruefePvGates, zielDefaults,
  type PvAntworten, type PvEntscheid, type PvZiel, type PvSituationId,
} from '../lib/vorlagen/patientenverfuegung';
import { vorlagenPdfErzeugen, BANNER_UNTERSCHREIBEN } from '../lib/vorlagen/vorlagenPdf';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, NormLink, Stepper, inputCls } from '../components/vorlagen/ui';
import { useLocale, fedlexLokalisiert } from '../components/locale';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Patientenverfügung (Art. 370–373 ZGB) ─────────────────
// Form: schriftlich, datiert, eigenhändig unterschrieben (Art. 371 Abs. 1) —
// PC-Erstellung zulässig, Datum/Unterschrift HANDSCHRIFTLICH nach dem Druck.
// Kein Mindestalter (Urteilsfähigkeit genügt). Konsistenz-Engine R1/R2,
// Sterbehilfe-Block R6. Eingaben bleiben im Browser (localStorage).

const SPEICHER_KEY = 'lexmetrik.vorlage.patientenverfuegung.v1';

const SCHRITTE = [
  { id: 'person', label: 'Person' },
  { id: 'werte', label: 'Werte' },
  { id: 'situationen', label: 'Situationen & Ziel' },
  { id: 'massnahmen', label: 'Massnahmen' },
  { id: 'vertretung', label: 'Vertretung' },
  { id: 'wuensche', label: 'Weitere Wünsche' },
  { id: 'pruefen', label: 'Prüfen & Unterschreiben' },
] as const;

const ENTSCHEIDE: { code: PvEntscheid; label: string }[] = [
  { code: 'keine_angabe', label: 'keine Angabe' },
  { code: 'zustimmen', label: 'zustimmen' },
  { code: 'ablehnen', label: 'ablehnen' },
  { code: 'nur_befristet', label: 'nur befristet' },
];

const ZIELE: { code: Exclude<PvZiel, 'keine_angabe'>; label: string; sub: string }[] = [
  { code: 'maximal', label: 'Maximale Lebenserhaltung', sub: 'alle indizierten Massnahmen' },
  { code: 'befristet_reevaluation', label: 'Befristet mit Reevaluation', sub: 'beginnen, Nutzen regelmässig prüfen' },
  { code: 'palliativ', label: 'Leidenslinderung (Palliation)', sub: 'Verzicht auf Lebensverlängerung' },
];

export function VorlagePatientenverfuegung() {
  const { locale } = useLocale();
  const [a, setA] = useState<PvAntworten>(() => {
    try {
      const roh = localStorage.getItem(SPEICHER_KEY);
      if (roh) {
        const geladen = { ...PV_DEFAULTS, ...JSON.parse(roh) } as PvAntworten;
        geladen.situationen = Array.isArray(geladen.situationen) ? geladen.situationen : [];
        geladen.massnahmen = { ...PV_DEFAULT_MASSNAHMEN, ...(geladen.massnahmen ?? {}) };
        return geladen;
      }
    } catch { /* defekter Speicher → Defaults */ }
    return PV_DEFAULTS;
  });
  const [schritt, setSchritt] = useState(0);
  const [bestaetigt, setBestaetigt] = useState(false); // GATE_1: Urteilsfähigkeit + Form verstanden
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(SPEICHER_KEY, JSON.stringify(a)); } catch { /* voll/blockiert */ }
  }, [a]);

  const set = <K extends keyof PvAntworten>(k: K, v: PvAntworten[K]) => setA((alt) => ({ ...alt, [k]: v }));

  const zuruecksetzen = () => {
    setA(PV_DEFAULTS); setSchritt(0); setBestaetigt(false);
    try { localStorage.removeItem(SPEICHER_KEY); } catch { /* ignorieren */ }
  };

  const ergebnis = useMemo(() => pvZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefePvGates(a), [a]);

  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.vorname.trim() || !a.name.trim()) f.push('Vor- und Nachname angeben.');
      if (!a.geburtsdatum) f.push('Geburtsdatum angeben.');
      if (!a.wohnort.trim()) f.push('Wohnort angeben.');
    }
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const toggleSituation = (id: PvSituationId) =>
    set('situationen', a.situationen.includes(id) ? a.situationen.filter((s) => s !== id) : [...a.situationen, id]);

  // RULE R1: Zielwahl setzt Defaults nur für noch offene Massnahmen
  const waehleZiel = (z: Exclude<PvZiel, 'keine_angabe'>) =>
    setA((alt) => ({ ...alt, ziel: z, massnahmen: zielDefaults(z, alt.massnahmen) }));

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

  const card = karte('patientenverfuegung');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'person': return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vorname"><input className={inputCls} value={a.vorname} onChange={(e) => set('vorname', e.target.value)} /></Field>
          <Field label="Nachname"><input className={inputCls} value={a.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Geburtsdatum" hint="Kein Mindestalter — massgebend ist die Urteilsfähigkeit (Art. 16 ZGB)">
            <DatumsFeld value={a.geburtsdatum} onChange={(v) => set('geburtsdatum', v)} className={inputCls} />
          </Field>
          <Field label="Wohnort">
            <input className={inputCls} value={a.wohnort} onChange={(e) => set('wohnort', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
          </Field>
          <Field label="AHV-/Versichertennummer" optional hint="erleichtert die Zuordnung (Versichertenkarte, Art. 371 Abs. 2 ZGB)">
            <input className={inputCls} value={a.versichertenNr ?? ''} onChange={(e) => set('versichertenNr', e.target.value)} placeholder="756.____.____.__" />
          </Field>
        </div>
      );

      case 'werte': return (
        <div className="space-y-4">
          <p className="text-body-s text-ink-600">
            Eine kurze Werteerklärung hilft Ärzteschaft und Vertretungsperson, Ihre Verfügung in
            nicht geregelten Situationen auszulegen. Alle Felder sind optional.
          </p>
          <Field label="Meine Einstellung zu Leben und Sterben" optional>
            <textarea className={inputCls} rows={3} value={a.einstellungLeben ?? ''}
              onChange={(e) => set('einstellungLeben', e.target.value)}
              placeholder="z. B. Was Lebensqualität für mich bedeutet …" />
          </Field>
          <Field label="Was ich besonders fürchte" optional>
            <textarea className={inputCls} rows={2} value={a.aengste ?? ''}
              onChange={(e) => set('aengste', e.target.value)}
              placeholder="z. B. langes Leiden, Abhängigkeit von Maschinen …" />
          </Field>
          <Field label="Religiöse / spirituelle Haltung" optional>
            <textarea className={inputCls} rows={2} value={a.religioesSpirituell ?? ''}
              onChange={(e) => set('religioesSpirituell', e.target.value)} />
          </Field>
        </div>
      );

      case 'situationen': return (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="lc-overline">Anwendungssituationen</p>
            {PV_SITUATIONEN.map((s) => (
              <label key={s.id} className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.situationen.includes(s.id)} onChange={() => toggleSituation(s.id)} />
                {s.label}
              </label>
            ))}
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700 pt-1">
              <input type="checkbox" className="mt-0.5" checked={a.psychischeStoerungKontext ?? false}
                onChange={(e) => set('psychischeStoerungKontext', e.target.checked)} />
              <span>Behandlung einer psychischen Störung in einer Klinik ist für mich relevant
                <span className="text-ink-500"> (Hinweis zur abgeschwächten Verbindlichkeit, Art. 380/433 ZGB)</span></span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="lc-overline">Behandlungsziel</p>
            <p className="text-xs text-ink-500">Die Zielwahl setzt sinnvolle Vorgaben für noch offene Massnahmen (überschreibbar) — Widersprüche werden geprüft, nie still aufgelöst.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ZIELE.map((z) => (
                <button key={z.code} type="button" onClick={() => waehleZiel(z.code)}
                  aria-pressed={a.ziel === z.code}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    a.ziel === z.code ? 'border-brass-500 bg-brass-100/60' : 'border-line bg-surface hover:border-brass-400'
                  }`}>
                  <span className="block text-sm font-semibold text-ink-900">{z.label}</span>
                  <span className="block text-xs text-ink-500">{z.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      case 'massnahmen': return (
        <div className="space-y-3">
          <p className="text-body-s text-ink-600">
            Entscheiden Sie je Massnahme — «keine Angabe» überlässt den Entscheid Vertretungsperson
            und Ärzteschaft (mutmasslicher Wille, Art. 378 Abs. 3 ZGB). Schmerz- und Symptomlinderung
            ist immer eingeschlossen.
          </p>
          {PV_MASSNAHMEN.map((m) => (
            <div key={m.id} className="lc-card p-3.5 space-y-2">
              <p className="text-body-s font-medium text-ink-900">{m.label}</p>
              <div className="flex flex-wrap gap-1" role="group" aria-label={m.label}>
                {ENTSCHEIDE.map((e) => (
                  <button key={e.code} type="button" aria-pressed={a.massnahmen[m.id] === e.code}
                    onClick={() => set('massnahmen', { ...a.massnahmen, [m.id]: e.code })}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      a.massnahmen[m.id] === e.code
                        ? e.code === 'ablehnen' ? 'bg-danger-bg border-danger-500 text-danger-700'
                          : e.code === 'zustimmen' ? 'bg-sage-bg border-sage-500 text-sage-700'
                          : e.code === 'nur_befristet' ? 'bg-warn-bg border-warn-500 text-warn-700'
                          : 'bg-ink-900 border-ink-900 text-paper'
                        : 'bg-surface border-line text-ink-600 hover:border-brass-400'
                    }`}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

      case 'vertretung': return (
        <div className="space-y-4">
          <p className="text-body-s text-ink-600">
            Die Vertretungsperson bespricht die Behandlung mit der Ärzteschaft und entscheidet in
            Ihrem Namen, wo die Verfügung keine Antwort gibt (Art. 370 Abs. 2 ZGB). Ohne Bezeichnung
            gilt die gesetzliche Kaskade (Art. 378 ZGB).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vertretungsperson" optional>
              <input className={inputCls} value={a.vertretungName ?? ''} onChange={(e) => set('vertretungName', e.target.value)} placeholder="Vorname Nachname" />
            </Field>
            <Field label="Kontakt (Telefon/Adresse)" optional>
              <input className={inputCls} value={a.vertretungKontakt ?? ''} onChange={(e) => set('vertretungKontakt', e.target.value)} />
            </Field>
          </div>
          {a.vertretungName?.trim() && (
            <>
              <Field label="Weisungen an die Vertretungsperson" optional>
                <textarea className={inputCls} rows={2} value={a.vertretungWeisungen ?? ''}
                  onChange={(e) => set('vertretungWeisungen', e.target.value)} />
              </Field>
              <Field label="Ersatzperson" optional hint="falls die Vertretungsperson ungeeignet ist, ablehnt oder kündigt (Art. 370 Abs. 3 ZGB)">
                <input className={inputCls} value={a.ersatzName ?? ''} onChange={(e) => set('ersatzName', e.target.value)} />
              </Field>
              <p className="text-xs text-ink-500">Die Entbindung von der Schweigepflicht gegenüber der Vertretungsperson wird automatisch aufgenommen.</p>
            </>
          )}
        </div>
      );

      case 'wuensche': return (
        <div className="space-y-4">
          <Field label="Sterbeort, Begleitung, Seelsorge" optional>
            <textarea className={inputCls} rows={2} value={a.sterbeortBegleitung ?? ''}
              onChange={(e) => set('sterbeortBegleitung', e.target.value)}
              placeholder="z. B. Wenn möglich möchte ich zu Hause sterben …" />
          </Field>
          <div className="space-y-2">
            <p className="lc-overline">Organspende</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Organspende">
              {([['keine_angabe', 'keine Angabe'], ['ja', 'Ich stimme zu'], ['nein', 'Ich lehne ab']] as const).map(([code, label]) => (
                <button key={code} type="button" aria-pressed={a.organspende === code}
                  onClick={() => set('organspende', code)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    a.organspende === code ? 'bg-ink-900 border-ink-900 text-paper' : 'bg-surface border-line text-ink-600 hover:border-brass-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {a.organspende === 'ja' && (
              <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.organspendeVorbereitend ?? false}
                  onChange={(e) => set('organspendeVorbereitend', e.target.checked)} />
                Einschliesslich vorbereitender medizinischer Massnahmen (z. B. Aufrechterhaltung der Organdurchblutung)
              </label>
            )}
          </div>
          <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.ersetztFruehere} onChange={(e) => set('ersetztFruehere', e.target.checked)} />
            <span>Frühere Patientenverfügungen ersetzen <span className="text-ink-500">(empfohlen, Art. 371 Abs. 3 ZGB)</span></span>
          </label>
          <Field label="Ort (für die Schlusszeile)" optional>
            <input className={inputCls + ' sm:max-w-xs'} value={a.ort ?? ''} onChange={(e) => set('ort', e.target.value)} placeholder="z. B. Basel" />
          </Field>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.map((b, i) => (
            <div key={i} className="rounded-lg border bg-danger-bg p-4" style={{ borderColor: 'var(--danger-500)' }}>
              <p className="lc-overline text-danger-700 mb-1">Nicht zulässig — vor der Ausgabe zu beheben</p>
              <p className="text-body-s text-danger-700">{b}</p>
            </div>
          ))}
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn rounded-md p-3 text-body-s text-warn-700">{w}</div>
          ))}
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice rounded-md p-3 text-body-s text-ink-600">{h}</div>
          ))}

          {/* Form-Gate: nicht überspringbar */}
          <section className="rounded-xl border-2 p-5 space-y-3" style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}>
            <p className="lc-overline text-brass-700">Form-Gate — damit Ihre Patientenverfügung gültig wird</p>
            <ul className="space-y-2 text-body-s text-ink-700">
              <li><strong>Ausdrucken genügt:</strong> Die Erstellung am Computer ist zulässig — anders als beim Testament ist keine Eigenhändigkeit des Textes nötig (Art. 371 Abs. 1 ZGB). Keine Beglaubigung erforderlich.</li>
              <li><strong>Handschriftlich datieren und unterschreiben:</strong> Erst mit von Hand eingesetztem Datum und eigenhändiger Unterschrift ist das Dokument errichtet.</li>
              <li><strong>Auffindbarkeit:</strong> Kopien an Vertretungsperson und Hausarztpraxis; Hinterlegungsort auf der Versichertenkarte eintragen lassen (Art. 371 Abs. 2 ZGB; in der Praxis noch nicht überall zuverlässig); Hinweiskarte im Portemonnaie.</li>
              <li><strong>Aktualisierung:</strong> rechtlich unbefristet gültig; Erneuerung der Unterschrift etwa alle zwei Jahre wird empfohlen.</li>
              <li><strong>Widerruf:</strong> jederzeit — durch Vernichtung, neue Verfügung oder schriftlichen Widerruf (Art. 371 Abs. 3 ZGB).</li>
            </ul>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich errichte diese Verfügung im Vollbesitz meiner Urteilsfähigkeit und nach reiflicher
              Überlegung (Art. 16 ZGB) — und habe verstanden, dass Datum und Unterschrift von Hand zu
              leisten sind.
            </label>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!bestaetigt || gates.blocker.length > 0}
              onClick={() => vorlagenPdfErzeugen(ergebnis, { banner: BANNER_UNTERSCHREIBEN, dateiName: 'Patientenverfuegung-Entwurf.pdf' })}
              className="lc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              Entwurf als PDF
            </button>
            <button type="button" disabled={!bestaetigt || gates.blocker.length > 0} onClick={kopieren}
              className="lc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed">
              {kopiert ? 'Kopiert ✓' : 'Text kopieren'}
            </button>
          </div>

          <p className="text-xs text-ink-500">
            Bei Zweifeln an der Urteilsfähigkeit (z. B. beginnende Demenz): ärztliche Bestätigung der
            Urteilsfähigkeit beilegen (Empfehlung der SAMW). Diese Vorlage ist eine Kurzversion in
            Anlehnung an FMH/SAMW; für differenzierte Festlegungen je Situation empfiehlt sich das
            Gespräch mit Ihrer Ärztin/Ihrem Arzt.
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
        <h1 className="text-h1 font-display font-semibold text-ink-900">Patientenverfügung</h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Legen Sie fest, welchen medizinischen Massnahmen Sie im Fall Ihrer Urteilsunfähigkeit
          zustimmen — aus festen, juristisch geprüften Bausteinen, ohne Sprachmodell. Widersprüche
          zwischen Therapieziel und Massnahmen werden geprüft, nie still aufgelöst.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(card?.norms ?? []).map((n) => (
            <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">Handschriftlich datieren & unterschreiben</span>
        </div>
        <p className="text-xs text-ink-500">
          Ihre Eingaben verlassen den Browser nicht (lokale Zwischenspeicherung).{' '}
          <button type="button" onClick={zuruecksetzen} className="text-brass-700 hover:text-brass-600 underline-offset-2 hover:underline">Eingaben löschen</button>
        </p>
      </div>

      <Stepper schritte={SCHRITTE} aktiv={schritt} onWechsel={setSchritt} />

      {/* Zweispaltig: Formular links, Vorschau rechts (mobil einklappbar) */}
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

  // Vorschau-Spalte (Papier + Protokoll) — als Funktionsaufruf (kein Remount)
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

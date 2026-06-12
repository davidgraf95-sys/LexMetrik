import { useMemo } from 'react';
import {
  PV_DEFAULTS, PV_DEFAULT_MASSNAHMEN, PV_MASSNAHMEN, PV_SITUATIONEN,
  pvZusammenstellen, pruefePvGates, zielDefaults,
  type PvAntworten, type PvEntscheid, type PvZiel, type PvSituationId,
} from '../lib/vorlagen/patientenverfuegung';
import { BANNER_UNTERSCHREIBEN } from '../lib/vorlagen/banner';
import { DatumsFeld } from '../components/DatumsFeld';
import { Field, inputCls } from '../components/vorlagen/ui';
import { SelectionGrid } from '../components/ui/SelectionGrid';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
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
  // bestaetigt = GATE_1: Urteilsfähigkeit + Form verstanden
  const { a, setA, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<PvAntworten>({
      defaults: PV_DEFAULTS,
      speicherKey: SPEICHER_KEY,
      normalisieren: (g) => ({
        ...g,
        situationen: Array.isArray(g.situationen) ? g.situationen : [],
        massnahmen: { ...PV_DEFAULT_MASSNAHMEN, ...(g.massnahmen ?? {}) },
      }),
    });

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

  const card = karte('patientenverfuegung');

  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'person': return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vorname"><input className={inputCls} value={a.vorname} onChange={(e) => set('vorname', e.target.value)} /></Field>
          <Field label="Nachname"><input className={inputCls} value={a.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Geburtsdatum" hint="Kein Mindestalter – massgebend ist die Urteilsfähigkeit (Art. 16 ZGB)">
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
              <label key={s.id} className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.situationen.includes(s.id)} onChange={() => toggleSituation(s.id)} />
                {s.label}
              </label>
            ))}
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700 pt-1">
              <input type="checkbox" className="mt-0.5" checked={a.psychischeStoerungKontext ?? false}
                onChange={(e) => set('psychischeStoerungKontext', e.target.checked)} />
              <span>Behandlung einer psychischen Störung in einer Klinik ist für mich relevant
                <span className="text-ink-500"> (Hinweis zur abgeschwächten Verbindlichkeit, Art. 380/433 ZGB)</span></span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="lc-overline">Behandlungsziel</p>
            <p className="text-xs text-ink-500">Die Zielwahl setzt sinnvolle Vorgaben für noch offene Massnahmen (überschreibbar) – Widersprüche werden geprüft, nie still aufgelöst.</p>
            <SelectionGrid
              className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              items={ZIELE.map((z) => ({ code: z.code, label: z.label, sub: z.sub }))}
              value={a.ziel}
              onSelect={waehleZiel}
            />
          </div>
        </div>
      );

      case 'massnahmen': return (
        <div className="space-y-3">
          <p className="text-body-s text-ink-600">
            Entscheiden Sie je Massnahme – «keine Angabe» überlässt den Entscheid Vertretungsperson
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
                  className={`px-3 py-1.5 rounded-full text-body-s font-medium border transition-colors ${
                    a.organspende === code ? 'bg-ink-900 border-ink-900 text-paper' : 'bg-surface border-line text-ink-600 hover:border-brass-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {a.organspende === 'ja' && (
              <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" className="mt-0.5" checked={a.organspendeVorbereitend ?? false}
                  onChange={(e) => set('organspendeVorbereitend', e.target.checked)} />
                Einschliesslich vorbereitender medizinischer Massnahmen (z. B. Aufrechterhaltung der Organdurchblutung)
              </label>
            )}
          </div>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
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
            <div key={i} className="lc-notice-danger">
              <p className="lc-overline text-danger-700 mb-1">Nicht zulässig – vor der Ausgabe zu beheben</p>
              <p className="text-body-s text-danger-700">{b}</p>
            </div>
          ))}
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn text-body-s">{w}</div>
          ))}
          {gates.hinweise.map((h, i) => (
            <div key={i} className="lc-notice text-body-s">{h}</div>
          ))}

          {/* Form-Gate: nicht überspringbar */}
          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Form-Gate – damit Ihre Patientenverfügung gültig wird</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Ausdrucken genügt:</strong> Die Erstellung am Computer ist zulässig – anders als beim Testament ist keine Eigenhändigkeit des Textes nötig (Art. 371 Abs. 1 ZGB). Keine Beglaubigung erforderlich.</li>
              <li><strong>Handschriftlich datieren und unterschreiben:</strong> Erst mit von Hand eingesetztem Datum und eigenhändiger Unterschrift ist das Dokument errichtet.</li>
              <li><strong>Auffindbarkeit:</strong> Kopien an Vertretungsperson und Hausarztpraxis; Hinterlegungsort auf der Versichertenkarte eintragen lassen (Art. 371 Abs. 2 ZGB; in der Praxis noch nicht überall zuverlässig); Hinweiskarte im Portemonnaie.</li>
              <li><strong>Aktualisierung:</strong> rechtlich unbefristet gültig; Erneuerung der Unterschrift etwa alle zwei Jahre wird empfohlen.</li>
              <li><strong>Widerruf:</strong> jederzeit – durch Vernichtung, neue Verfügung oder schriftlichen Widerruf (Art. 371 Abs. 3 ZGB).</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich errichte diese Verfügung im Vollbesitz meiner Urteilsfähigkeit und nach reiflicher
              Überlegung (Art. 16 ZGB) – und habe verstanden, dass Datum und Unterschrift von Hand zu
              leisten sind.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Entwurf als PDF', banner: BANNER_UNTERSCHREIBEN, dateiName: 'Patientenverfuegung-Entwurf.pdf' }}
            docx={card?.modus === 'vorlage' && card.output?.includes('docx')
              ? { label: 'Entwurf als Word (DOCX)', banner: BANNER_UNTERSCHREIBEN, dateiName: 'Patientenverfuegung-Entwurf.docx' }
              : undefined} />

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
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Familie'} · Vorlage`}
      titel="Patientenverfügung"
      intro="Legen Sie fest, welchen medizinischen Massnahmen Sie im Fall Ihrer Urteilsunfähigkeit zustimmen – aus festen, strukturierten Bausteinen, ohne Sprachmodell. Widersprüche zwischen Therapieziel und Massnahmen werden geprüft, nie still aufgelöst."
      norms={card?.norms ?? []}
      badge="Handschriftlich datieren & unterschreiben"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_UNTERSCHREIBEN, dateiName: 'Patientenverfuegung-Entwurf.pdf' },
        docx: card?.modus === 'vorlage' && card.output?.includes('docx') ? { label: 'DOCX', banner: BANNER_UNTERSCHREIBEN, dateiName: 'Patientenverfuegung-Entwurf.docx' } : undefined,
        blocker: gates.blocker,
      }} />}
    />
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TESTAMENT_DEFAULTS, testamentZusammenstellen, pruefeGates,
  type TestamentAntworten, type TestamentErbe, type TestamentVermaechtnis,
} from '../lib/vorlagen/testament';
import { BANNER_ABSCHREIBEN } from '../lib/vorlagen/banner';
import { berechneErbteilung } from '../lib/erbteilung';
import { fmtB, zahl, istNull } from '../lib/bruch';
import { Field, inputCls } from '../components/vorlagen/ui';
import { useWizardState } from '../components/vorlagen/useWizardState';
import { VorlagenWizardRahmen, VorschauPanel, ExportLeiste } from '../components/vorlagen/wizard';
import { DatumsFeld } from '../components/DatumsFeld';
import { karte } from '../lib/startseiteConfig';

// ─── Vorlagen-Wizard: Eigenhändiges Testament (Pilot) ───────────────────────
// Benutzerführung: Stepper mit klaren Schritten, klebende Live-Vorschau als
// «Papier», Pflichtteils-Panel (bestehende Erbteilungs-Engine), Baustein-
// protokoll und nicht überspringbares Form-Gate vor der Ausgabe.
// Eingaben bleiben im Browser (localStorage), kein Server.

const SPEICHER_KEY = 'lexmetrik.vorlage.testament.v1';

const SCHRITTE = [
  { id: 'person', label: 'Person' },
  { id: 'familie', label: 'Familie' },
  { id: 'erben', label: 'Erbeinsetzung' },
  { id: 'vermaechtnisse', label: 'Vermächtnisse' },
  { id: 'vollstrecker', label: 'Willensvollstreckung' },
  { id: 'abschluss', label: 'Ort & Datum' },
  { id: 'pruefen', label: 'Prüfen & Abschreiben' },
] as const;

export function VorlageTestament() {
  const { a, set, schritt, setSchritt, bestaetigt, setBestaetigt, kopiert, kopieren, zuruecksetzen } =
    useWizardState<TestamentAntworten>({
      defaults: TESTAMENT_DEFAULTS,
      speicherKey: SPEICHER_KEY,
      // Hydration absichern: Array-Felder aus älteren Speicherständen normalisieren
      normalisieren: (g) => ({
        ...g,
        erben: Array.isArray(g.erben) ? g.erben : [],
        vermaechtnisse: Array.isArray(g.vermaechtnisse) ? g.vermaechtnisse : [],
      }),
    });

  // Zusammenstellung (rein, deterministisch) + Gates
  const ergebnis = useMemo(() => testamentZusammenstellen(a), [a]);
  const gates = useMemo(() => pruefeGates(a), [a]);

  const verheiratet = a.zivilstand === 'verheiratet' || a.zivilstand === 'eingetragene_partnerschaft';

  // Pflichtteils-Panel über die bestehende Erbteilungs-Engine (Art. 471 ZGB)
  const pflichtteile = useMemo(() => {
    try {
      return berechneErbteilung({
        todesdatum: a.datumErrichtung || '2026-01-01', // Rechtsstand-Weiche; Revision gilt seit 1.1.2023
        zivilstand: verheiratet ? (a.zivilstand as 'verheiratet' | 'eingetragene_partnerschaft') : 'ledig',
        scheidungHaengig: verheiratet ? a.scheidungHaengig : undefined,
        scheidung472Erfuellt: verheiratet && a.scheidungHaengig
          ? a.scheidungTyp === 'gemeinsames_begehren' || a.scheidungTyp === 'getrennt_min_2_jahre'
          : undefined,
        kinderLebend: a.hatNachkommen ? Math.max(1, a.anzahlNachkommen ?? 1) : 0,
      });
    } catch { return null; }
  }, [a, verheiratet]);

  // Schritt-Validierung (Weiter erst, wenn das Nötigste da ist)
  const fehlerImSchritt = (i: number): string[] => {
    const f: string[] = [];
    if (i === 0) {
      if (!a.vorname.trim() || !a.nachname.trim()) f.push('Vor- und Nachname angeben.');
      if (!a.geburtsdatum) f.push('Geburtsdatum angeben (Volljährigkeitsprüfung, Art. 467 ZGB).');
      if (!a.heimatort.trim()) f.push('Heimatort angeben.');
      if (!a.adresse.trim()) f.push('Adresse angeben.');
    }
    if (i === 5 && !a.datumErrichtung) f.push('Errichtungsdatum mit Jahr, Monat und Tag angeben (Art. 505 ZGB).');
    return f;
  };
  const fehler = fehlerImSchritt(schritt);

  const erbenSumme = a.erben.reduce((s, e) => s + (Number.isFinite(e.quoteProzent) ? e.quoteProzent : 0), 0);

  const card = karte('eigenhaendiges-testament');

  // ── Schritt-Inhalte ──
  const inhalt = () => {
    switch (SCHRITTE[schritt].id) {
      case 'person': return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vorname"><input className={inputCls} value={a.vorname} onChange={(e) => set('vorname', e.target.value)} /></Field>
          <Field label="Nachname"><input className={inputCls} value={a.nachname} onChange={(e) => set('nachname', e.target.value)} /></Field>
          <Field label="Geburtsdatum" hint="Testierfähigkeit: vollendetes 18. Altersjahr (Art. 467 ZGB)">
            <DatumsFeld value={a.geburtsdatum} onChange={(v) => set('geburtsdatum', v)} className={inputCls} />
          </Field>
          <Field label="Heimatort" hint="Schweizer Terminologie (statt Staatsangehörigkeit)">
            <input className={inputCls} value={a.heimatort} onChange={(e) => set('heimatort', e.target.value)} placeholder="z. B. Basel BS" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Adresse">
              <input className={inputCls} value={a.adresse} onChange={(e) => set('adresse', e.target.value)} placeholder="Strasse Nr., PLZ Ort" />
            </Field>
          </div>
        </div>
      );

      case 'familie': return (
        <div className="space-y-4">
          <Field label="Zivilstand" hint="steuert die Pflichtteils-Berechnung (Art. 471 ZGB)">
            <select className={inputCls} value={a.zivilstand} onChange={(e) => set('zivilstand', e.target.value as TestamentAntworten['zivilstand'])}>
              <option value="ledig">ledig</option>
              <option value="verheiratet">verheiratet</option>
              <option value="eingetragene_partnerschaft">eingetragene Partnerschaft</option>
              <option value="geschieden">geschieden</option>
              <option value="verwitwet">verwitwet</option>
            </select>
          </Field>
          {verheiratet && (
            <>
              <Field label="Name der Ehegattin / des Ehegatten bzw. Partner/in" optional>
                <input className={inputCls} value={a.ehegatteName ?? ''} onChange={(e) => set('ehegatteName', e.target.value)} />
              </Field>
              <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                <input type="checkbox" checked={a.scheidungHaengig ?? false} onChange={(e) => set('scheidungHaengig', e.target.checked)} />
                Scheidungs-/Auflösungsverfahren ist hängig
              </label>
              {a.scheidungHaengig && (
                <Field label="Art des Verfahrens" hint="bei gemeinsamem Begehren oder ≥ 2 Jahren Trennung entfällt der Pflichtteilsschutz (Art. 472 ZGB)">
                  <select className={inputCls} value={a.scheidungTyp ?? 'keine'} onChange={(e) => set('scheidungTyp', e.target.value as TestamentAntworten['scheidungTyp'])}>
                    <option value="keine">– bitte wählen –</option>
                    <option value="gemeinsames_begehren">gemeinsames Begehren</option>
                    <option value="getrennt_min_2_jahre">mindestens 2 Jahre getrennt</option>
                  </select>
                </Field>
              )}
            </>
          )}
          <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" checked={a.hatNachkommen} onChange={(e) => set('hatNachkommen', e.target.checked)} />
            Ich habe Nachkommen (Kinder bzw. Kindeskinder)
          </label>
          {a.hatNachkommen && (
            <Field label="Anzahl Kinder (bzw. Stämme)">
              <input type="number" min={1} step={1} className={inputCls + ' w-28'}
                value={a.anzahlNachkommen ?? 1}
                onChange={(e) => set('anzahlNachkommen', Math.max(1, Number(e.target.value) || 1))} />
            </Field>
          )}
        </div>
      );

      case 'erben': return (
        <div className="space-y-4">
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.widerruf} onChange={(e) => set('widerruf', e.target.checked)} />
            <span>Frühere letztwillige Verfügungen widerrufen <span className="text-ink-500">(empfohlen – schafft klare Verhältnisse, Art. 509/511 ZGB)</span></span>
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="lc-overline">Erbinnen und Erben</p>
              {a.erben.length > 0 && (
                <span className={`num text-xs rounded-full px-2 py-0.5 ${Math.abs(erbenSumme - 100) < 0.01 ? 'bg-sage-bg text-sage-700' : 'bg-warn-bg text-warn-700'}`}>
                  Summe {erbenSumme} %
                </span>
              )}
            </div>
            {a.erben.map((e, i) => (
              <div key={i} className="lc-card p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_7rem] gap-3">
                  <Field label="Name"><input className={inputCls} value={e.name}
                    onChange={(ev) => set('erben', a.erben.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))}
                    placeholder="Vorname Nachname" /></Field>
                  <Field label="Geburtsdatum / Adresse" hint="genaue Personalien – keine Kosenamen">
                    <input className={inputCls} value={e.angaben}
                      onChange={(ev) => set('erben', a.erben.map((x, j) => j === i ? { ...x, angaben: ev.target.value } : x))}
                      placeholder="geb. 01.01.1990, Musterweg 1, 4051 Basel" /></Field>
                  <Field label="Quote %"><input type="number" min={0} max={100} className={inputCls} value={e.quoteProzent}
                    onChange={(ev) => set('erben', a.erben.map((x, j) => j === i ? { ...x, quoteProzent: Number(ev.target.value) } : x))} /></Field>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[14rem]">
                    <Field label="Ersatzperson" optional hint="falls die Person vorverstirbt oder ausschlägt (Art. 487 ZGB)">
                      <input className={inputCls} value={e.ersatz ?? ''}
                        onChange={(ev) => set('erben', a.erben.map((x, j) => j === i ? { ...x, ersatz: ev.target.value } : x))} />
                    </Field>
                  </div>
                  <button type="button" onClick={() => set('erben', a.erben.filter((_, j) => j !== i))}
                    className="text-body-s text-danger-700 hover:underline pb-2.5">entfernen</button>
                </div>
              </div>
            ))}
            <button type="button"
              onClick={() => set('erben', [...a.erben, { name: '', angaben: '', quoteProzent: a.erben.length === 0 ? 100 : 0 } as TestamentErbe])}
              className="lc-btn-outline">+ Erbin/Erben hinzufügen</button>
            <p className="text-xs text-ink-500">Tipp: Decken Sie den ganzen Nachlass ab (100 %) – der nicht verfügte Teil fällt an die gesetzlichen Erben (Art. 481 ZGB).</p>
          </div>
        </div>
      );

      case 'vermaechtnisse': return (
        <div className="space-y-3">
          <p className="text-body-s text-ink-600">
            Mit einem Vermächtnis erhält eine Person einen bestimmten Gegenstand oder Betrag,
            ohne Erbin/Erbe zu werden (Art. 484 ZGB). Dieser Schritt ist optional.
          </p>
          {a.vermaechtnisse.map((v, i) => (
            <div key={i} className="lc-card p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Empfänger/in"><input className={inputCls} value={v.empfaenger}
                  onChange={(ev) => set('vermaechtnisse', a.vermaechtnisse.map((x, j) => j === i ? { ...x, empfaenger: ev.target.value } : x))} /></Field>
                <Field label="Gegenstand oder Betrag"><input className={inputCls} value={v.gegenstand}
                  onChange={(ev) => set('vermaechtnisse', a.vermaechtnisse.map((x, j) => j === i ? { ...x, gegenstand: ev.target.value } : x))}
                  placeholder="z. B. CHF 10’000 / meine Uhrensammlung" /></Field>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[14rem]">
                  <Field label="Ersatzperson" optional>
                    <input className={inputCls} value={v.ersatz ?? ''}
                      onChange={(ev) => set('vermaechtnisse', a.vermaechtnisse.map((x, j) => j === i ? { ...x, ersatz: ev.target.value } : x))} />
                  </Field>
                </div>
                <button type="button" onClick={() => set('vermaechtnisse', a.vermaechtnisse.filter((_, j) => j !== i))}
                  className="text-body-s text-danger-700 hover:underline pb-2.5">entfernen</button>
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => set('vermaechtnisse', [...a.vermaechtnisse, { empfaenger: '', gegenstand: '' } as TestamentVermaechtnis])}
            className="lc-btn-outline">+ Vermächtnis hinzufügen</button>
        </div>
      );

      case 'vollstrecker': return (
        <div className="space-y-4">
          <p className="text-body-s text-ink-600">
            Eine Willensvollstreckerin / ein Willensvollstrecker setzt Ihren Willen um, verwaltet
            den Nachlass und führt die Teilung durch (Art. 517 f. ZGB). Optional, aber bei
            mehreren Erben oft hilfreich.
          </p>
          <Field label="Willensvollstrecker/in" optional>
            <input className={inputCls} value={a.willensvollstrecker ?? ''}
              onChange={(e) => set('willensvollstrecker', e.target.value)} placeholder="Vorname Nachname (oder Institution)" />
          </Field>
          {a.willensvollstrecker?.trim() && (
            <Field label="Ersatz-Willensvollstrecker/in" optional>
              <input className={inputCls} value={a.willensvollstreckerErsatz ?? ''}
                onChange={(e) => set('willensvollstreckerErsatz', e.target.value)} />
            </Field>
          )}
        </div>
      );

      case 'abschluss': return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ort der Errichtung" optional hint="seit 1996 kein Gültigkeitserfordernis mehr – aber empfohlen">
            <input className={inputCls} value={a.ortErrichtung ?? ''} onChange={(e) => set('ortErrichtung', e.target.value)} placeholder="z. B. Basel" />
          </Field>
          <Field label="Datum der Errichtung" hint="Jahr, Monat und Tag – zwingend (Art. 505 Abs. 1 ZGB)">
            <DatumsFeld value={a.datumErrichtung} onChange={(v) => set('datumErrichtung', v)} className={inputCls} />
          </Field>
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
          {a.erben.length === 0 && a.vermaechtnisse.length === 0 && (
            <div className="lc-notice text-body-s">
              Es ist weder eine Erbeinsetzung noch ein Vermächtnis erfasst – das Dokument wirkt dann
              nur als Widerruf früherer Verfügungen; die gesetzliche Erbfolge gilt.
            </div>
          )}

          {/* Form-Gate: nicht überspringbar */}
          <section className="lc-highlight space-y-3">
            <p className="lc-overline text-brass-700">Form-Gate – damit Ihr Testament gültig wird</p>
            <ul className="lc-list space-y-2 text-body-s text-ink-700">
              <li><strong>Vollständig von Hand abschreiben.</strong> Der ganze Text – einschliesslich Datum – muss eigenhändig geschrieben sein (Art. 505 Abs. 1 ZGB). Ein Ausdruck, auch unterschrieben, ist anfechtbar/ungültig.</li>
              <li><strong>Mit Jahr, Monat und Tag datieren.</strong></li>
              <li><strong>Am Schluss eigenhändig unterschreiben</strong> (BGE 135 III 206).</li>
              <li><strong>Allein verfassen.</strong> Gemeinschaftliche Testamente von Ehegatten in einem Dokument sind unzulässig – jede Person errichtet ihr eigenes Testament; für gegenseitige Bindung dient der Erbvertrag (Art. 512 ff. ZGB).</li>
              <li><strong>Spätere Änderungen</strong> erneut datieren und unterschreiben; Streichungen sind heikel – im Zweifel ein neues Testament errichten und das alte vernichten (Art. 510 ZGB).</li>
              <li><strong>Aufbewahrung:</strong> Die handschriftliche Fassung kann freiwillig bei der kantonalen Amtsstelle hinterlegt werden (Art. 505 Abs. 2 ZGB; Gebühr je nach Kanton).</li>
            </ul>
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Nur die vollständig handschriftliche, datierte und unterschriebene Fassung ist gültig – dieses Werkzeug liefert einen Mustertext zum Abschreiben.
            </label>
          </section>

          <ExportLeiste ergebnis={ergebnis} deaktiviert={!bestaetigt || gates.blocker.length > 0}
            kopiert={kopiert} onKopieren={kopieren}
            pdf={{ label: 'Mustertext als PDF', banner: BANNER_ABSCHREIBEN, dateiName: 'Testament-Mustertext.pdf' }} />

          <p className="text-xs text-ink-500">
            Bei komplexen Verhältnissen, Zweifeln an der Urteilsfähigkeit oder Wünschen wie Nacherbschaft,
            Nutzniessung oder Enterbung: öffentliches Testament bei einer Urkundsperson errichten
            (Art. 499 ff. ZGB) bzw. anwaltliche Beratung beiziehen.
          </p>
        </div>
      );
    }
  };

  // Pflichtteils-Panel (Live, aus der Erbteilungs-Engine) – vorlagenspezifisch
  const pflichtteilePanel = pflichtteile && (a.hatNachkommen || verheiratet) ? (
    <section className="lc-card p-4 space-y-2">
      <p className="lc-overline">Pflichtteile (Art. 471 ZGB) – zur Kontrolle</p>
      <ul className="text-body-s text-ink-700 space-y-0.5">
        {pflichtteile.erben.filter((e) => !istNull(e.pflichtteil)).map((e) => (
          <li key={e.bezeichnung} className="flex justify-between gap-3">
            <span>{e.bezeichnung}{e.anzahl ? ` (je, ${e.anzahl} Personen)` : ''}</span>
            <span className="num">{fmtB(e.pflichtteil)} ({Math.round(zahl(e.pflichtteil) * 1000) / 10} %)</span>
          </li>
        ))}
        <li className="flex justify-between gap-3 font-semibold text-brass-700 pt-1 border-t border-line">
          <span>Frei verfügbar</span>
          <span className="num">{fmtB(pflichtteile.verfuegbareQuote)} ({Math.round(zahl(pflichtteile.verfuegbareQuote) * 1000) / 10} %)</span>
        </li>
      </ul>
      <p className="text-xs text-ink-500">
        Quoten unter dem Pflichtteil sind nicht nichtig, aber herabsetzbar (Art. 522 ff. ZGB).{' '}
        <Link to="/rechner/erbteilung" className="text-brass-700 no-underline hover:text-brass-600">Details im Pflichtteils-Rechner →</Link>
      </p>
    </section>
  ) : null;

  return (
    <VorlagenWizardRahmen
      overline={`${card?.rechtsgebiet ?? 'Erbrecht'} · Vorlage`}
      titel="Eigenhändiges Testament"
      intro="Beantworten Sie die Schritte – LexMetrik stellt den Mustertext aus festen, juristisch vorformulierten Bausteinen zusammen. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument."
      norms={card?.norms ?? []}
      badge="Eigenhändig abzuschreiben"
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE} schritt={schritt} setSchritt={setSchritt}
      fehler={fehler}
      inhalt={inhalt()}
      vorschau={<VorschauPanel ergebnis={ergebnis} extra={pflichtteilePanel} direktExport={{
        pdf: { label: 'PDF', banner: BANNER_ABSCHREIBEN, dateiName: 'Testament-Mustertext.pdf' },
        blocker: gates.blocker,
      }} />}
    />
  );
}

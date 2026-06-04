import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TESTAMENT_DEFAULTS, testamentZusammenstellen, pruefeGates,
  type TestamentAntworten, type TestamentErbe, type TestamentVermaechtnis,
} from '../lib/vorlagen/testament';
import { vorlagenPdfErzeugen, BANNER_ABSCHREIBEN } from '../lib/vorlagen/vorlagenPdf';
import { berechneErbteilung } from '../lib/erbteilung';
import { fmtB, zahl, istNull } from '../lib/bruch';
import { fedlexLinkFuerArtikel } from '../lib/fedlex';
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

const inputCls = 'lc-input';

function Field({ label, children, hint, optional }: { label: string; children: React.ReactNode; hint?: string; optional?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="block text-body-s font-medium text-ink-700">
        {label}{optional && <span className="text-ink-500 font-normal"> · optional</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

function NormLink({ artikel }: { artikel: string }) {
  const url = fedlexLinkFuerArtikel(artikel);
  return url
    ? <a href={url} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{artikel}</a>
    : <span className="lc-chip">{artikel}</span>;
}

export function VorlageTestament() {
  const [a, setA] = useState<TestamentAntworten>(() => {
    try {
      const roh = localStorage.getItem(SPEICHER_KEY);
      if (roh) {
        const geladen = { ...TESTAMENT_DEFAULTS, ...JSON.parse(roh) } as TestamentAntworten;
        // Hydration absichern: Array-Felder aus älteren Speicherständen normalisieren
        geladen.erben = Array.isArray(geladen.erben) ? geladen.erben : [];
        geladen.vermaechtnisse = Array.isArray(geladen.vermaechtnisse) ? geladen.vermaechtnisse : [];
        return geladen;
      }
    } catch { /* defekter Speicher → Defaults */ }
    return TESTAMENT_DEFAULTS;
  });
  const [schritt, setSchritt] = useState(0);
  const [bestaetigt, setBestaetigt] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  // Eingaben lokal sichern (verlassen den Browser nicht)
  useEffect(() => {
    try { localStorage.setItem(SPEICHER_KEY, JSON.stringify(a)); } catch { /* Speicher voll/blockiert */ }
  }, [a]);

  const set = <K extends keyof TestamentAntworten>(k: K, v: TestamentAntworten[K]) =>
    setA((alt) => ({ ...alt, [k]: v }));

  const zuruecksetzen = () => {
    setA(TESTAMENT_DEFAULTS); setSchritt(0); setBestaetigt(false);
    try { localStorage.removeItem(SPEICHER_KEY); } catch { /* ignorieren */ }
  };

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
              <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
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
          <label className="flex items-center gap-2 text-sm cursor-pointer text-ink-700">
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
          <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={a.widerruf} onChange={(e) => set('widerruf', e.target.checked)} />
            <span>Frühere letztwillige Verfügungen widerrufen <span className="text-ink-500">(empfohlen — schafft klare Verhältnisse, Art. 509/511 ZGB)</span></span>
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
                  <Field label="Geburtsdatum / Adresse" hint="genaue Personalien — keine Kosenamen">
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
            <p className="text-xs text-ink-500">Tipp: Decken Sie den ganzen Nachlass ab (100 %) — der nicht verfügte Teil fällt an die gesetzlichen Erben (Art. 481 ZGB).</p>
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
          <Field label="Ort der Errichtung" optional hint="seit 1996 kein Gültigkeitserfordernis mehr — aber empfohlen">
            <input className={inputCls} value={a.ortErrichtung ?? ''} onChange={(e) => set('ortErrichtung', e.target.value)} placeholder="z. B. Basel" />
          </Field>
          <Field label="Datum der Errichtung" hint="Jahr, Monat und Tag — zwingend (Art. 505 Abs. 1 ZGB)">
            <DatumsFeld value={a.datumErrichtung} onChange={(v) => set('datumErrichtung', v)} className={inputCls} />
          </Field>
        </div>
      );

      case 'pruefen': return (
        <div className="space-y-5">
          {gates.blocker.length > 0 && (
            <div className="rounded-lg border bg-danger-bg p-4 space-y-1" style={{ borderColor: 'var(--danger-500)' }}>
              <p className="lc-overline text-danger-700 mb-1">Vor der Ausgabe zu beheben</p>
              {gates.blocker.map((b, i) => <p key={i} className="text-body-s text-danger-700">• {b}</p>)}
            </div>
          )}
          {gates.warnungen.map((w, i) => (
            <div key={i} className="lc-notice-warn rounded-md p-3 text-body-s text-warn-700">{w}</div>
          ))}
          {a.erben.length === 0 && a.vermaechtnisse.length === 0 && (
            <div className="lc-notice rounded-md p-3 text-body-s text-ink-600">
              Es ist weder eine Erbeinsetzung noch ein Vermächtnis erfasst — das Dokument wirkt dann
              nur als Widerruf früherer Verfügungen; die gesetzliche Erbfolge gilt.
            </div>
          )}

          {/* Form-Gate: nicht überspringbar */}
          <section className="rounded-xl border-2 p-5 space-y-3" style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}>
            <p className="lc-overline text-brass-700">Form-Gate — damit Ihr Testament gültig wird</p>
            <ul className="space-y-2 text-body-s text-ink-700">
              <li><strong>Vollständig von Hand abschreiben.</strong> Der ganze Text — einschliesslich Datum — muss eigenhändig geschrieben sein (Art. 505 Abs. 1 ZGB). Ein Ausdruck, auch unterschrieben, ist anfechtbar/ungültig.</li>
              <li><strong>Mit Jahr, Monat und Tag datieren.</strong></li>
              <li><strong>Am Schluss eigenhändig unterschreiben</strong> (BGE 135 III 206).</li>
              <li><strong>Allein verfassen.</strong> Gemeinschaftliche Testamente von Ehegatten in einem Dokument sind unzulässig — jede Person errichtet ihr eigenes Testament; für gegenseitige Bindung dient der Erbvertrag (Art. 512 ff. ZGB).</li>
              <li><strong>Spätere Änderungen</strong> erneut datieren und unterschreiben; Streichungen sind heikel — im Zweifel ein neues Testament errichten und das alte vernichten (Art. 510 ZGB).</li>
              <li><strong>Aufbewahrung:</strong> Die handschriftliche Fassung kann freiwillig bei der kantonalen Amtsstelle hinterlegt werden (Art. 505 Abs. 2 ZGB; Gebühr je nach Kanton).</li>
            </ul>
            <label className="flex items-start gap-2 text-sm cursor-pointer text-ink-900 font-medium pt-1">
              <input type="checkbox" className="mt-0.5" checked={bestaetigt} onChange={(e) => setBestaetigt(e.target.checked)} />
              Ich habe verstanden: Nur die vollständig handschriftliche, datierte und unterschriebene Fassung ist gültig — dieses Werkzeug liefert einen Mustertext zum Abschreiben.
            </label>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={!bestaetigt || gates.blocker.length > 0}
              onClick={() => vorlagenPdfErzeugen(ergebnis, { banner: BANNER_ABSCHREIBEN, dateiName: 'Testament-Mustertext.pdf' })}
              className="lc-btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              Mustertext als PDF
            </button>
            <button type="button" disabled={!bestaetigt || gates.blocker.length > 0} onClick={kopieren}
              className="lc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed">
              {kopiert ? 'Kopiert ✓' : 'Text kopieren'}
            </button>
          </div>

          <p className="text-xs text-ink-500">
            Bei komplexen Verhältnissen, Zweifeln an der Urteilsfähigkeit oder Wünschen wie Nacherbschaft,
            Nutzniessung oder Enterbung: öffentliches Testament bei einer Urkundsperson errichten
            (Art. 499 ff. ZGB) bzw. anwaltliche Beratung beiziehen.
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
        <p className="lc-overline">{card?.rechtsgebiet ?? 'Erbrecht'} · Vorlage</p>
        <h1 className="text-h1 font-display font-semibold text-ink-900">Eigenhändiges Testament</h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Beantworten Sie die Schritte — Lexmetrik stellt den Mustertext aus festen, juristisch
          vorformulierten Bausteinen zusammen. Ohne Sprachmodell: gleiche Eingaben, gleiches Dokument.
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {(card?.norms ?? []).map((n) => (
            <a key={n.label} href={n.url} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">{n.label}</a>
          ))}
          <span className="lc-badge lc-badge-warn">Eigenhändig abzuschreiben</span>
        </div>
        <p className="text-xs text-ink-500">
          Ihre Eingaben verlassen den Browser nicht (lokale Zwischenspeicherung).{' '}
          <button type="button" onClick={zuruecksetzen} className="text-brass-700 hover:text-brass-600 underline-offset-2 hover:underline">Eingaben löschen</button>
        </p>
      </div>

      {/* Stepper */}
      <nav aria-label="Schritte" className="flex flex-wrap gap-x-1 gap-y-2">
        {SCHRITTE.map((s, i) => {
          const erledigt = i < schritt;
          const aktiv = i === schritt;
          return (
            <button key={s.id} type="button" onClick={() => i <= schritt && setSchritt(i)}
              aria-current={aktiv ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aktiv ? 'bg-surface-raised border border-line text-brass-700 shadow-sm'
                : erledigt ? 'text-ink-700 hover:bg-brass-100/50'
                : 'text-ink-500 cursor-default'
              }`}>
              <span className={`num inline-flex items-center justify-center w-5 h-5 rounded-full text-[0.65rem] ${
                erledigt ? 'bg-brass-500 text-ink-900' : aktiv ? 'border border-brass-500 text-brass-700' : 'border border-line text-ink-500'
              }`}>{erledigt ? '✓' : i + 1}</span>
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* Zweispaltig: Formular links, klebende Vorschau rechts;
          mobil einspaltig mit einklappbarer Vorschau */}
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

        {/* Vorschau + Pflichtteile + Protokoll — mobil einklappbar */}
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

  // Vorschau-Spalte (Papier, Pflichtteile, Protokoll) — als Funktionsaufruf
  // (mobil einklappbar / Desktop klebend), identischer Inhalt.
  function vorschauSpalte() {
    return (
        <div className="space-y-4">
          {/* Live-Vorschau als «Papier» */}
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

          {/* Pflichtteile (Live, aus der Erbteilungs-Engine) */}
          {pflichtteile && (a.hatNachkommen || verheiratet) && (
            <section className="lc-card p-4 space-y-2">
              <p className="lc-overline">Pflichtteile (Art. 471 ZGB) — zur Kontrolle</p>
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
          )}

          {/* Bausteinprotokoll */}
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, inputCls } from '../components/vorlagen/ui';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { KONTAKT_EMPFAENGER, kontaktMailto, type KontaktEingaben } from '../lib/kontakt';

// Seite «Kontakt»: schlichtes Formular im Stil der Wizards. Kein Backend –
// der Versandweg ist zentral in lib/kontakt.ts konfiguriert (derzeit offen →
// ehrlicher Hinweis + deaktivierter Versand statt stillem Ins-Leere-Senden).
// Die Einwilligung verweist auf die Datenschutzerklärung (/datenschutz).

const DEFAULTS: KontaktEingaben = { name: '', email: '', betreff: '', nachricht: '' };

export function Kontakt() {
  const [e, setE] = useState<KontaktEingaben>(DEFAULTS);
  const [einwilligung, setEinwilligung] = useState(false);
  const [kopiert, setKopiert] = useState(false);
  const set = <K extends keyof KontaktEingaben>(k: K, v: string) => setE((alt) => ({ ...alt, [k]: v }));

  const emailOk = e.email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email.trim());
  const fehler: string[] = [];
  if (!e.nachricht.trim()) fehler.push('Nachricht eingeben.');
  if (!emailOk) fehler.push('E-Mail-Adresse prüfen (für die Antwort).');
  if (!einwilligung) fehler.push('Einwilligung zur Datenbearbeitung bestätigen.');

  const bereit = fehler.length === 0;
  const versandKonfiguriert = KONTAKT_EMPFAENGER !== null;

  const kopieren = () => {
    const text = `Betreff: ${e.betreff || '–'}\n\n${e.nachricht}\n\nName: ${e.name || '–'}\nAntwort an: ${e.email || '–'}`;
    navigator.clipboard?.writeText(text).then(
      () => { setKopiert(true); setTimeout(() => setKopiert(false), 2000); },
      () => {},
    );
  };

  return (
    <div className="space-y-8 max-w-reading">
      <SeitenKopf overline="Kontakt" titel="Kontakt aufnehmen"
        intro="Fragen, Korrekturen zu einer Berechnung oder einem Baustein, Vorschläge für neue Rechner und Vorlagen – Hinweise auf Fehler sind besonders willkommen." />

      <div className="bg-surface-raised rounded-2xl border border-line p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" optional>
            <input className={inputCls} value={e.name} onChange={(ev) => set('name', ev.target.value)} autoComplete="name" />
          </Field>
          <Field label="E-Mail (für die Antwort)">
            <input type="email" className={inputCls} value={e.email} onChange={(ev) => set('email', ev.target.value)} autoComplete="email" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Betreff" optional>
              <input className={inputCls} value={e.betreff} onChange={(ev) => set('betreff', ev.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Nachricht">
              <textarea className={inputCls} rows={6} value={e.nachricht} onChange={(ev) => set('nachricht', ev.target.value)} />
            </Field>
          </div>
        </div>

        <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
          <input type="checkbox" className="mt-0.5" checked={einwilligung} onChange={(ev) => setEinwilligung(ev.target.checked)} />
          <span>
            Ich willige ein, dass meine Angaben zur Bearbeitung der Anfrage verwendet werden.
            Details in der <Link to="/datenschutz" className="text-brass-700 hover:text-brass-600">Datenschutzerklärung</Link>.
          </span>
        </label>

        {fehler.length > 0 && (
          <div className="rounded-md bg-danger-bg p-3 space-y-0.5">
            {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
          </div>
        )}

        {!versandKonfiguriert && (
          <p className="lc-notice-warn text-body-s">
            Der Versandweg dieses Formulars wird derzeit eingerichtet. Bis dahin können Sie Ihre
            Nachricht kopieren und auf anderem Weg übermitteln.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-line">
          {versandKonfiguriert ? (
            <a
              href={bereit ? kontaktMailto(KONTAKT_EMPFAENGER!, e) : undefined}
              aria-disabled={!bereit}
              className={`lc-btn-primary no-underline ${bereit ? '' : 'pointer-events-none opacity-50'}`}>
              Nachricht senden
            </a>
          ) : (
            <button type="button" disabled className="lc-btn-primary" title="Versandweg noch nicht eingerichtet">
              Nachricht senden
            </button>
          )}
          <button type="button" disabled={!e.nachricht.trim()} onClick={kopieren} className="lc-btn-outline">
            {kopiert ? 'Kopiert ✓' : 'Nachricht kopieren'}
          </button>
        </div>

        <p className="text-xs text-ink-500">
          Es gibt kein Konto und keine serverseitige Speicherung der Formulareingaben durch
          LexMetrik; der Versand erfolgt über Ihr E-Mail-Programm.
        </p>
      </div>
    </div>
  );
}

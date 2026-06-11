// ─── ZefixSuche: UID-Lookup im Handelsregister (Zefix-Etappe Z1) ───────────
//
// Dossier: bibliothek/recherche/zefix-api.md
//
// Erster externer Request des Produkts (Entscheid David 11.6.2026):
// zefix.ch wird NUR auf expliziten Klick kontaktiert — nie beim Tippen,
// nie automatisch (Datenschutz-Versprechen; CSP connect-src um
// https://www.zefix.ch erweitert; /datenschutz-Wortlaut TODO David).
// Reine Darstellungsschicht (§3): übernimmt amtliche Registerdaten
// (Firma, UID, Sitz) in die Maske; keinerlei Rechtslogik.
import { useState } from 'react';

const ZEFIX_SUCHE_URL = 'https://www.zefix.ch/ZefixREST/api/v1/firm/search.json';

type Treffer = { name: string; uidFormatted: string; legalSeat: string; status: string };

export function ZefixSuche({ firma, onUebernehmen }: {
  firma: string;
  /** Übernahme eines Treffers in die Maske (Firma wörtlich aus dem
   *  Register, UID formatiert CHE-…, Sitzgemeinde). */
  onUebernehmen: (t: { firma: string; uid: string; sitzOrt: string }) => void;
}) {
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [treffer, setTreffer] = useState<Treffer[] | null>(null);

  const suchen = async () => {
    setLaedt(true); setFehler(null); setTreffer(null);
    try {
      const antwort = await fetch(ZEFIX_SUCHE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: firma.trim(), activeOnly: true }),
      });
      if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
      const json = (await antwort.json()) as { list?: Treffer[] };
      setTreffer((json.list ?? []).slice(0, 6));
    } catch {
      setFehler('Zefix-Abfrage fehlgeschlagen — UID bitte von Hand eintragen (zefix.ch).');
    } finally {
      setLaedt(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="lc-btn-outline text-body-s"
        disabled={laedt || !firma.trim()}
        onClick={() => { void suchen(); }}
        title="Sucht den Firmennamen im zentralen Firmenindex des Bundes (zefix.ch) und übernimmt Firma, UID und Sitz"
      >
        {laedt ? 'Sucht …' : 'UID in Zefix nachschlagen'}
      </button>
      {fehler && <p className="text-body-s text-ink-600">{fehler}</p>}
      {treffer && treffer.length === 0 && (
        <p className="text-body-s text-ink-600">Kein aktiver Eintrag gefunden — Schreibweise prüfen oder UID von Hand eintragen.</p>
      )}
      {treffer && treffer.length > 0 && (
        <ul className="space-y-1">
          {treffer.map((t) => (
            <li key={t.uidFormatted}>
              <button
                type="button"
                className="w-full text-left text-body-s border border-line rounded px-3 py-2 bg-surface hover:border-brass-500"
                onClick={() => { setTreffer(null); onUebernehmen({ firma: t.name, uid: t.uidFormatted, sitzOrt: t.legalSeat }); }}
              >
                <span className="font-medium text-ink-900">{t.name}</span>
                <span className="text-ink-600"> · {t.uidFormatted} · {t.legalSeat}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {treffer && (
        <p className="text-body-s text-ink-500">
          Quelle: Zentraler Firmenindex des Bundes —{' '}
          <a className="underline" href="https://www.zefix.ch" target="_blank" rel="noreferrer">zefix.ch ↗</a>
        </p>
      )}
    </div>
  );
}

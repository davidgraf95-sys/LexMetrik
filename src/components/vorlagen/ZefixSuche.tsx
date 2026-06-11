// ─── ZefixSuche: UID-Lookup im Handelsregister (Zefix-Etappe Z1/Z1b) ───────
//
// Dossier: bibliothek/recherche/zefix-api.md
//
// Erster externer Request des Produkts (Entscheid David 11.6.2026):
// zefix.ch wird NUR auf expliziten Klick kontaktiert — nie beim Tippen,
// nie automatisch (Datenschutz-Versprechen; CSP connect-src um
// https://www.zefix.ch erweitert; /datenschutz-Wortlaut TODO David).
// Reine Darstellungsschicht (§3): übernimmt amtliche Registerdaten in die
// Maske; keinerlei Rechtslogik.
//
// Z1b (Wunsch David «verknüpfe wenn uid eingegeben wird auch gleich sitz»):
// Suchbegriff ist Firma ODER UID (search.json akzeptiert die UID direkt);
// die Übernahme holt zusätzlich das Firmen-Detail (firm/{ehraid}.json,
// CORS offen) und füllt die volle Domiziladresse (Strasse, PLZ, Ort).
import { useState } from 'react';

const ZEFIX_SUCHE_URL = 'https://www.zefix.ch/ZefixREST/api/v1/firm/search.json';
const ZEFIX_DETAIL_URL = (ehraid: number) => `https://www.zefix.ch/ZefixREST/api/v1/firm/${ehraid}.json`;

type Treffer = { name: string; ehraid: number; uidFormatted: string; legalSeat: string; status: string };
type DetailAdresse = { street?: string; houseNumber?: string; swissZipCode?: string; town?: string };

export type ZefixUebernahme = { firma: string; uid: string; strasse: string; plz: string; ort: string };

export function ZefixSuche({ firma, uid, onUebernehmen }: {
  firma: string;
  /** UID-Feldwert — erlaubt die Suche direkt über die Nummer. */
  uid?: string;
  /** Übernahme eines Treffers: Firma wörtlich aus dem Register, UID
   *  formatiert, Domiziladresse aus dem Detail (leer, wenn nicht lieferbar). */
  onUebernehmen: (t: ZefixUebernahme) => void;
}) {
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [treffer, setTreffer] = useState<Treffer[] | null>(null);

  const suchbegriff = firma.trim() || (uid ?? '').trim();

  const suchen = async () => {
    setLaedt(true); setFehler(null); setTreffer(null);
    try {
      const antwort = await fetch(ZEFIX_SUCHE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: suchbegriff, activeOnly: true }),
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

  const uebernehmen = async (t: Treffer) => {
    setTreffer(null); setLaedt(true);
    let adresse: DetailAdresse = {};
    try {
      const antwort = await fetch(ZEFIX_DETAIL_URL(t.ehraid));
      if (antwort.ok) {
        const json = (await antwort.json()) as { address?: DetailAdresse }[] | { address?: DetailAdresse };
        adresse = (Array.isArray(json) ? json[0]?.address : json.address) ?? {};
      }
    } catch { /* Adresse bleibt leer — Firma/UID werden trotzdem übernommen */ }
    setLaedt(false);
    onUebernehmen({
      firma: t.name,
      uid: t.uidFormatted,
      strasse: [adresse.street, adresse.houseNumber].filter(Boolean).join(' '),
      plz: adresse.swissZipCode ?? '',
      ort: adresse.town ?? t.legalSeat,
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="lc-btn-outline text-body-s"
        disabled={laedt || !suchbegriff}
        onClick={() => { void suchen(); }}
        title="Sucht Firmennamen oder UID im zentralen Firmenindex des Bundes (zefix.ch) und übernimmt Firma, UID und Sitzadresse"
      >
        {laedt ? 'Sucht …' : 'In Zefix nachschlagen (Firma oder UID)'}
      </button>
      {fehler && <p className="text-body-s text-ink-600">{fehler}</p>}
      {treffer && treffer.length === 0 && (
        <p className="text-body-s text-ink-600">Kein aktiver Eintrag gefunden — Schreibweise/UID prüfen oder von Hand eintragen.</p>
      )}
      {treffer && treffer.length > 0 && (
        <ul className="space-y-1">
          {treffer.map((t) => (
            <li key={t.uidFormatted}>
              <button
                type="button"
                className="w-full text-left text-body-s border border-line rounded px-3 py-2 bg-surface hover:border-brass-500"
                onClick={() => { void uebernehmen(t); }}
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

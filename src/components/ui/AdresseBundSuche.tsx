import { useState } from 'react';
import type { Kanton } from '../../types/legal';

// ─── AdresseBundSuche: Adresse → Gemeinde über die Bundes-Geodaten-API ──────
//
// Adress-Ausbau Stufe 3 (Entscheid David 12.6.2026): «grundsätzlich immer
// auch Adresse der beklagten Partei eingeben können» — Volltext-Adresssuche
// im amtlichen Gebäudeadressverzeichnis über die Geodaten-API des Bundes
// (api3.geo.admin.ch, SearchServer + GWR-Detail; Dossier
// bibliothek/recherche/gebaeudeadressverzeichnis-adressaufloesung.md).
//
// Zweiter externer Request des Produkts nach Zefix (Z1, 11.6.2026) und nach
// demselben Muster: der Bund wird NUR auf expliziten Klick kontaktiert —
// nie beim Tippen, nie automatisch; der Hinweis auf die Übermittlung steht
// PERMANENT neben dem Knopf (Anweisung David 12.6.2026). Die Offline-
// Auflösung (PLZ/Gemeinde + Strassen-Index, Stufen 1/2) bleibt die
// request-freie Alternative. Reine Darstellungsschicht (§3): übernimmt
// amtliche Registerdaten in die Maske, keinerlei Rechtslogik.

const SUCHE_URL = (q: string) =>
  `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${encodeURIComponent(q)}&type=locations&origins=address&limit=6`;
const DETAIL_URL = (featureId: string) =>
  `https://api3.geo.admin.ch/rest/services/ech/MapServer/ch.bfs.gebaeude_wohnungs_register/${encodeURIComponent(featureId)}`;

type Treffer = { label: string; featureId: string };

export type AdresseUebernahme = { gemeinde: string; kanton: Kanton; plz: string };

export function AdresseBundSuche({ onUebernehmen, kantonErwartet = '', beschriftung = 'Adresse (beklagte Partei / Sache)' }: {
  /** Übernahme: amtliche Gemeinde, Kanton und PLZ aus dem GWR-Detail. */
  onUebernehmen: (a: AdresseUebernahme) => void;
  /** Fester Kanton der Maske (z. B. Schlichtungsgesuch): liegt die gefundene
   *  Adresse anderswo, wird NICHT übernommen, sondern offengelegt. */
  kantonErwartet?: Kanton | '';
  beschriftung?: string;
}) {
  const [adresse, setAdresse] = useState('');
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [treffer, setTreffer] = useState<Treffer[] | null>(null);

  const suchen = async () => {
    setLaedt(true); setFehler(null); setTreffer(null);
    try {
      const antwort = await fetch(SUCHE_URL(adresse.trim()));
      if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
      const json = (await antwort.json()) as { results?: { attrs?: { label?: string; featureId?: string } }[] };
      setTreffer((json.results ?? [])
        .map((r) => ({ label: (r.attrs?.label ?? '').replace(/<[^>]+>/g, ''), featureId: r.attrs?.featureId ?? '' }))
        .filter((t) => t.label !== '' && t.featureId !== ''));
    } catch {
      setFehler('Bundes-Abfrage fehlgeschlagen — PLZ/Gemeinde bitte von Hand eingeben (offline).');
    } finally {
      setLaedt(false);
    }
  };

  const uebernehmen = async (t: Treffer) => {
    setTreffer(null); setLaedt(true); setFehler(null);
    try {
      const antwort = await fetch(DETAIL_URL(t.featureId));
      // Bug-Check 12.6.2026 (NIEDRIG): FL-Adressen (Vaduz …) erscheinen in
      // der Bundes-SUCHE, das GWR-Detail liefert aber 404 — die generische
      // Fehlermeldung lud sonst ein, die ausländische Gemeinde von Hand
      // einzutragen. Übernahme bleibt deterministisch verhindert.
      if (antwort.status === 404) {
        setFehler('Die gewählte Adresse liegt nicht im Schweizer Gebäude- und Wohnungsregister (z. B. Fürstentum Liechtenstein) — für LexMetrik ist nur eine Schweizer Gemeinde massgeblich.');
        return;
      }
      if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
      const json = (await antwort.json()) as { feature?: { attributes?: Record<string, unknown> }; attributes?: Record<string, unknown> };
      const a = json.feature?.attributes ?? json.attributes ?? {};
      const gemeinde = typeof a.ggdename === 'string' ? a.ggdename : '';
      const kanton = typeof a.gdekt === 'string' ? a.gdekt as Kanton : '' as const;
      const plz = a.dplz4 != null ? String(a.dplz4) : '';
      if (gemeinde === '' || kanton === '') throw new Error('Detail unvollständig');
      if (kantonErwartet !== '' && kanton !== kantonErwartet) {
        setFehler(`Die gefundene Adresse liegt in ${gemeinde} (${kanton}) — diese Maske ist auf den Kanton ${kantonErwartet} eingestellt. Kanton zuerst umstellen oder Adresse prüfen.`);
        return;
      }
      onUebernehmen({ gemeinde, kanton, plz });
    } catch {
      setFehler('Bundes-Abfrage fehlgeschlagen — PLZ/Gemeinde bitte von Hand eingeben (offline).');
    } finally {
      setLaedt(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end">
        <label className="block flex-1">
          <span className="text-xs text-ink-600">{beschriftung}</span>
          <input className="lc-input w-full" value={adresse} onChange={(e) => setAdresse(e.target.value)}
            placeholder="z. B. Limmatstrasse 152 Zürich" aria-label="Adresse für die Bundes-Suche" />
        </label>
        <button type="button" className="lc-btn-outline text-body-s whitespace-nowrap"
          disabled={laedt || adresse.trim() === ''}
          onClick={() => { void suchen(); }}
          title="Sucht die Adresse im amtlichen Gebäudeadressverzeichnis des Bundes (geo.admin.ch) und übernimmt Gemeinde, Kanton und PLZ">
          {laedt ? 'Sucht …' : 'Beim Bund nachschlagen'}
        </button>
      </div>
      <p className="text-xs text-ink-500">
        Hinweis: Die Suche übermittelt die eingegebene Adresse an die Geodaten-API des Bundes
        (geo.admin.ch) — nur auf Klick, nie automatisch. Alternativ funktioniert die Auflösung
        offline über PLZ/Gemeinde (und Strasse), ohne dass Daten Ihr Gerät verlassen.
      </p>
      {fehler && <p className="text-body-s text-warn-700">{fehler}</p>}
      {treffer && treffer.length === 0 && (
        <p className="text-body-s text-ink-600">Keine amtliche Adresse gefunden — Schreibweise prüfen oder PLZ/Gemeinde von Hand eingeben.</p>
      )}
      {treffer && treffer.length > 0 && (
        <ul className="space-y-1">
          {treffer.map((t) => (
            <li key={t.featureId}>
              <button type="button"
                className="w-full text-left text-body-s border border-line rounded px-3 py-2 bg-surface hover:border-brass-500"
                onClick={() => { void uebernehmen(t); }}>
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {treffer && (
        <p className="text-body-s text-ink-500">
          Quelle: Amtliches Gebäudeadressverzeichnis des Bundes —{' '}
          <a className="underline" href="https://www.geo.admin.ch" target="_blank" rel="noreferrer">geo.admin.ch ↗</a>
        </p>
      )}
    </div>
  );
}

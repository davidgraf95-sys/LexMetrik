import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useUniversalSuche } from '../components/suche/useUniversalSuche';
import { SuchResultate } from '../components/suche/SuchResultate';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import type { GruppenId } from '../lib/universalSuche';

// ─── /suche — Volltext-Ergebnisseite (UI-NAV S5) ────────────────────────────
//
// Macht die im Header-Dropdown UNERREICHBAREN Treffer zugänglich: das Dropdown
// ist Schnellzugriff (auf wenige je Gruppe gekappt), diese Seite zeigt ALLE
// Gruppen ungekappt (bes. die Gesetzestext-Gruppe, deren 34/40 Treffer bislang
// strukturell nicht erreichbar waren — §8). Additive Zielseite zum fixierten
// A5/A6-Dropdown-Modell (kein Palette-Revival): dieselbe Trefferlogik (Hook
// useUniversalSuche, §5), nur ohne Kappung und mit einem Inhaltstyp-Filter.
//
// Prerender: die SHELL (H1 + Intro + Feld) wird statisch ausgeliefert (seo.ts);
// die query-abhängigen Treffer füllt der Client (useUniversalSuche lädt lazy).
// Deep-Link `?q=` ist stabil und teilbar. CLS: der Kopf/das Feld stehen fest,
// die Treffer wachsen nur darunter (§15.2).

// Anzeige: alle Gruppen ungekappt zeigen, Artikel-Volltext grosszügig suchen.
const KAPPUNG_SEITE = 500;
const ARTIKEL_LIMIT = 200;

export function Suche() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [wert, setWert] = useState(initialQ);
  const [q, setQ] = useState(initialQ.trim());
  const [typ, setTyp] = useState<GruppenId | 'alle'>('alle');

  // Externe ?q=-Änderungen (Zurück-Taste, geteilter Link) ins Feld spiegeln —
  // Render-Phasen-Abgleich (kein setState-im-Effekt), Muster aus der Hero-Suche.
  const qParam = params.get('q') ?? '';
  const [letztesParam, setLetztesParam] = useState(qParam);
  if (qParam !== letztesParam) {
    setLetztesParam(qParam);
    if (qParam !== wert.trim()) setWert(qParam);
  }

  // Eingabe: Feldwert setzen UND ?q= sofort schreiben (teilbar; replace, damit
  // Tippen keine History füllt).
  const setze = (v: string) => {
    setWert(v);
    const t = v.trim();
    const p = new URLSearchParams(params);
    if (t) p.set('q', t); else p.delete('q');
    setParams(p, { replace: true });
  };

  // Debounce: Eingabe → Such-Query (~150 ms) für die Trefferberechnung.
  useEffect(() => {
    const id = setTimeout(() => setQ(wert.trim()), 150);
    return () => clearTimeout(id);
  }, [wert]);

  const { gruppen, allesGeladen, vorschlag, abdeckung } = useUniversalSuche(q, {
    artikelLimit: ARTIKEL_LIMIT,
    kappung: KAPPUNG_SEITE,
  });

  // Inhaltstyp-Facette (Etappe 2, ehrlich + lokal): Chips je vorhandener Gruppe
  // mit echtem Zähler (gesamt). Der Norm-/Entscheid-Sprung (A5/S2) bleibt IMMER
  // sichtbar (die direkte Antwort), unabhängig vom Filter. Masse-Counts über den
  // kantonalen Volltext / die 195k-Entscheide folgen erst mit dem E3-Serving (§8).
  const facetten = useMemo(
    () => gruppen.filter((g) => g.id !== 'sprung' && !g.laedt && g.gesamt > 0)
      .map((g) => ({ id: g.id, titel: g.titel, n: g.gesamt })),
    [gruppen],
  );
  // Wird der aktive Filter leer (neue Query), auf «alle» zurückfallen.
  const typVorhanden = typ === 'alle' || facetten.some((f) => f.id === typ);
  const aktiverTyp = typVorhanden ? typ : 'alle';
  const sichtbar = aktiverTyp === 'alle'
    ? gruppen
    : gruppen.filter((g) => g.id === 'sprung' || g.id === aktiverTyp);

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Suche"
        titel="Suche"
        intro="Alle Treffer auf einer Seite — Gesetzestext, Gesetze, Rechtsprechung, Materialien sowie Rechner und Vorlagen, ungekappt und teilbar. Die Suchleiste oben bleibt der Schnellzugriff; hier steht das ganze Ergebnis."
      />

      <div role="search" className="space-y-4">
        <div className="relative max-w-reading">
          <input
            type="search"
            value={wert}
            onChange={(e) => setze(e.target.value)}
            placeholder="Suchen oder Norm springen (z. B. «OR 257d», «Miete», «BGE 152 I 65») …"
            aria-label="LexMetrik durchsuchen"
            className="lc-input h-12 w-full pr-11 text-body-l"
            enterKeyHint="search"
            autoComplete="off"
          />
          {wert && (
            <button type="button" onClick={() => setze('')} aria-label="Suche leeren"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:text-brass-700">
              <span aria-hidden className="text-base leading-none">✕</span>
            </button>
          )}
        </div>

        {/* Inhaltstyp-Facette — nur wenn es etwas zu filtern gibt. */}
        {q !== '' && facetten.length > 1 && (
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Nach Inhaltstyp filtern">
            <FacetChip aktiv={aktiverTyp === 'alle'} onClick={() => setTyp('alle')}
              label="Alle" n={facetten.reduce((s, f) => s + f.n, 0)} />
            {facetten.map((f) => (
              <FacetChip key={f.id} aktiv={aktiverTyp === f.id} onClick={() => setTyp(f.id)} label={f.titel} n={f.n} />
            ))}
          </div>
        )}
      </div>

      {q === ''
        ? (
          <div className="lc-notice max-w-reading">
            <p className="lc-overline mb-1">Tipp</p>
            <p className="text-body-s leading-relaxed text-ink-600">
              Geben Sie einen Begriff, ein Stichwort oder eine Norm ein. Ein Norm-Kürzel
              («OR 257d») oder ein BGE-Zitat («BGE 152 I 65») springt direkt zur Fundstelle;
              ein Alltagsbegriff («Miete», «Verjährung») findet die einschlägigen Artikel.{' '}
              <Link to="/abdeckung" className="text-brass-700 no-underline hover:text-brass-600">Was ist durchsuchbar? →</Link>
            </p>
          </div>
        )
        : (
          <SuchResultate
            gruppen={sichtbar}
            allesGeladen={allesGeladen}
            q={q}
            vorschlag={vorschlag}
            abdeckung={abdeckung}
            onVorschlag={(b) => setze(b)}
            onNavigate={(href) => navigate(href)}
            sektionsRollen
          />
        )}
    </div>
  );
}

function FacetChip({ label, n, aktiv, onClick }: { label: string; n: number; aktiv: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-body-s transition-colors ${
        aktiv
          ? 'border-brass-500 bg-brass-100/60 text-brass-800'
          : 'border-line text-ink-600 hover:border-brass-300 hover:text-brass-700'
      }`}
    >
      {label}
      <span className="num text-xs text-ink-500">{n}</span>
    </button>
  );
}

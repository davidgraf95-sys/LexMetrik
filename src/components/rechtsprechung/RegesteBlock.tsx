// ─── RegesteBlock — amtliche BGE-Regeste, strukturiert + nach Sprachen sortiert ──
//
// W2·6-B B2 + A18: die amtlich publizierte BGE-Regeste wie in der amtlichen Sammlung
// darstellen — Regestenkopf (massgebliche Artikel + Regestentitel) FETT, darunter die
// Textabsätze; und die drei amtlichen Sprachfassungen sortiert DE → FR → IT (David:
// «nach sprachen sortieren»). DE steht prominent, FR/IT dezent einklappbar
// (`<details>` — nativ tastatur-/screenreader-bedienbar, kein JS, CLS 0).
//
// Fällt auf den flachen `regeste.text` zurück, wenn keine strukturierte Fassung
// vorliegt (Nicht-BGE, oder BGE ohne clir-Struktur — §1: nie geraten).

import type { EntscheidRegeste, RegesteSprachfassung, EntscheidSprache } from '../../lib/rechtsprechung/typen';
import { normalisiereRegeste } from '../../lib/rechtsprechung/register';

const SPRACH_LABEL: Record<EntscheidSprache, string> = {
  de: 'Deutsch', fr: 'Français', it: 'Italiano', rm: 'Rumantsch',
};

/** Ein Regeste-Teil: optionales Teil-Label («Regeste a») + Kopf (fett) + Absätze. */
function Teil({ label, kopf, absaetze }: { label?: string | null; kopf: string; absaetze: string[] }) {
  return (
    <div className="space-y-2">
      {label && <p className="lc-overline text-ink-600">Regeste {label}</p>}
      {/* Regestenkopf = massgebliche Artikel + Regestentitel; in der amtlichen
          Sammlung FETT (David: «massgebliche Artikel fett»). */}
      <p className="font-serif text-body-l font-semibold leading-[1.7] text-ink-900">{kopf}</p>
      {absaetze.map((a, i) => (
        <p key={i} className="font-serif text-body-l leading-[1.7] text-ink-900">{a}</p>
      ))}
    </div>
  );
}

/**
 * Eine Sprachfassung. Mehrteilige amtliche Regeste («Regeste a / b / c», Bug-Fix
 * A29) → alle Teile mit Label; sonst der eine Kopf+Absätze (byte-treu zum Altstand).
 */
function Fassung({ f }: { f: RegesteSprachfassung }) {
  if (f.weitereRegesten?.length) {
    return (
      <div className="space-y-4">
        {f.weitereRegesten.map((t, i) => (
          <Teil key={i} label={t.label} kopf={t.kopf} absaetze={t.absaetze} />
        ))}
      </div>
    );
  }
  return <Teil kopf={f.kopf} absaetze={f.absaetze} />;
}

interface Props {
  regeste: EntscheidRegeste;
  amtlich: boolean;
  /** true ⇒ die Sektion trägt die Sprung-Anker-`id` (nur EINE Instanz je Seite). */
  mitAnker?: boolean;
}

export default function RegesteBlock({ regeste, amtlich, mitAnker = true }: Props) {
  const fassungen = (regeste.sprachfassungen ?? []).filter((f) => f.kopf.trim());
  const de = fassungen.find((f) => f.sprache === 'de');
  // Strukturiert nur, wenn eine deutsche (bzw. wenigstens EINE) Fassung vorliegt.
  const strukturiert = fassungen.length > 0;
  const anker = mitAnker ? { id: 'abschnitt-regeste' } : {};

  if (!strukturiert) {
    // Fallback: flacher Text (bisheriges Verhalten, §1: keine erfundene Struktur).
    const text = normalisiereRegeste(regeste.text);
    return (
      <section {...anker} className="scroll-mt-[var(--rsp-stick,7rem)] lc-highlight space-y-2">
        <p className="lc-overline text-brass-700">{amtlich ? 'Regeste' : 'Zusammenfassung'}</p>
        {/* break-words: gleiche Bug-Klasse wie im EntscheidBody (unumbrechbare
            Über-Token, z. B. lange URLs) — Mobil-Querscroll-Schutz (R21). */}
        <p className="font-serif text-body-l leading-[1.7] text-ink-900 whitespace-pre-line break-words">{text}</p>
        <p className="text-micro text-ink-600">
          {amtlich
            ? 'Amtliche Regeste der Sammlung · Quelle: OpenCaseLaw'
            : 'Quelle: OpenCaseLaw — automatisch übernommen; Herkunft (amtliche Regeste oder maschinelle Zusammenfassung) nicht abschliessend geprüft'}
        </p>
      </section>
    );
  }

  // Weitere Fassungen (FR/IT) in Quell-Reihenfolge (bereits DE→FR→IT sortiert).
  const weitere = fassungen.filter((f) => f.sprache !== 'de');
  const primaer = de ?? fassungen[0];
  const quelleUrl = primaer.quelleUrl;

  return (
    <section {...anker} className="scroll-mt-[var(--rsp-stick,7rem)] lc-highlight space-y-3">
      <p className="lc-overline text-brass-700">{amtlich ? 'Regeste' : 'Zusammenfassung'}</p>

      {/* Deutsch prominent. */}
      <Fassung f={primaer} />

      {/* Français / Italiano dezent einklappbar (A18: gruppiert mit Sprach-Label). */}
      {weitere.length > 0 && (
        <details className="group border-t border-line/60 pt-2">
          <summary className="lc-overline flex cursor-pointer select-none list-none items-center gap-1.5 text-ink-600 marker:hidden hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600">
            <span aria-hidden className="inline-block transition-transform group-open:rotate-90">▸</span>
            Weitere Sprachfassungen · {weitere.map((f) => SPRACH_LABEL[f.sprache]).join(' · ')}
          </summary>
          <div className="mt-3 space-y-5">
            {weitere.map((f) => (
              <div key={f.sprache} className="space-y-2" lang={f.sprache}>
                <p className="lc-overline text-ink-600">{SPRACH_LABEL[f.sprache]}</p>
                <Fassung f={f} />
              </div>
            ))}
          </div>
        </details>
      )}

      <p className="text-micro text-ink-600">
        {amtlich
          ? 'Amtliche Regeste der amtlichen Sammlung (DE · FR · IT) · Quelle: '
          : 'Automatisch übernommene Zusammenfassung · Quelle: '}
        <a href={quelleUrl} target="_blank" rel="noopener noreferrer"
          className="underline decoration-line hover:text-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600">
          bger.ch ↗
        </a>
      </p>
    </section>
  );
}

// ─── Die Zähl-Datei je Erlass: Zahlen für die Bezüge-Zeile OHNE den Shard ────
//
// W2·24-R6c, Prüfer-Befund R6 «ZÄHL-DATEI». Die Bezüge-Zeile am Artikelkopf
// (D20 (b)) sagt «11 Entscheide · 1 Materialie · Rechner ›». Bis hierher
// stammten die Entscheide aus dem vollen Bezugs-Shard (OR 2.2 MB roh) und
// erschienen erst, wenn der ihn geladen hatte; die Rubrik MATERIALIEN fehlte
// ganz, weil ihr Shard im Leser gar nicht vorkommt — eine Rubrik ohne Zahl wäre
// eine Zusage ohne Deckung gewesen (§8, s. `parts/BezuegeKopf.tsx`).
//
// Beides löst eine buildseitige Zähl-Datei je Erlass
// (`scripts/gen-bezuege-zaehler.ts` → `public/verzahnung/bezuege-zaehler/
// <KEY>.json`, ø 289 B, grösste 5.8 KB beim OR). Sie trägt NUR Zahlen, keine
// Kanten: das ÖFFNEN der Zeile lädt weiterhin lazy den vollen Apparat.
//
// ── ABGRENZUNG ZU `bezuegeLaden.ts` (§5) ───────────────────────────────────
// Das ist ein ZWEITER, viel kleinerer Lesepfad neben dem Shard-Pfad, kein
// Ersatz und kein Eingriff in dessen Logik. Die beiden können nicht
// auseinanderlaufen, weil die Zähl-Datei aus DEMSELBEN Shard erzeugt wird und
// das Drift-Tor `check:bezuege-zaehler` sie gegeneinander hält.
//
// ── EIN FETCH JE ERLASS, IM LEERLAUF (§15) ─────────────────────────────────
// Dasselbe Muster wie beim Bezugs-/Historie-/Revisions-Shard: ein Fetch auf
// Reader-Ebene, `beiLeerlauf`, Ergebnis als Prop an reine Renderer. 289 Byte im
// Mittel liegen weit unter dem, was ein einzelner Artikel-Fetch je Zeile
// gekostet hätte (der belegte Idle-Herden-Befund aus W2·7-VZUI).

import { useEffect, useState } from 'react';
import { beiLeerlauf } from '../../lib/leerlauf';
import { normArtikelToken } from '../../lib/rechtsprechung/norm-index';

/** Zahlen EINES Artikels. */
export interface ArtikelZaehler {
  /** Entscheide an diesem Artikel, ohne UI-Filter (die Bezugsgrösse, §8). */
  entscheide: number;
  /** Verschiedene Materialien-Dokumente an diesem Artikel. */
  materialien: number;
}

/** Rohform der Datei — Paare sparen ein Drittel der Bytes (s. Generator). */
interface ZaehlDatei {
  erzeugt: string;
  erlass: string;
  a: Record<string, [entscheide: number, materialien: number]>;
}

/** Nachschlage-Funktion je Erlass. `null` = (noch) nichts geladen. */
export type ZaehlerNachschlag = (artikel: string) => ArtikelZaehler | undefined;

const cache = new Map<string, ZaehlDatei | null>();

async function lade(key: string): Promise<ZaehlDatei | null> {
  if (cache.has(key)) return cache.get(key) ?? null;
  try {
    const res = await fetch(`/verzahnung/bezuege-zaehler/${encodeURIComponent(key)}.json`);
    // 404 ist der NORMALFALL für einen Erlass ohne Bezüge — die Datei wird dann
    // gar nicht erst erzeugt (§8: keine Datei mit lauter Nullen). Kein Fehler,
    // kein Log, kein zweiter Versuch.
    const d = res.ok ? ((await res.json()) as ZaehlDatei) : null;
    cache.set(key, d);
    return d;
  } catch {
    cache.set(key, null); // Netz weg ⇒ die Zeile zeigt dann eben keine Zahl
    return null;
  }
}

/**
 * Lädt die Zähl-Datei des Erlasses im Leerlauf und gibt die Nachschlage-
 * Funktion zurück. Vor dem Eintreffen liefert sie `undefined` — die Bezüge-Zeile
 * fällt dann auf das zurück, was der Artikel ohnehin führt.
 */
export function useBezuegeZaehler(erlassKey: string | undefined): ZaehlerNachschlag {
  // Der Zustand trägt den SCHLÜSSEL mit, zu dem er gehört. Ohne ihn müsste der
  // Effekt beim Erlass-Wechsel erst `null` setzen (ein synchroner setState im
  // Effekt-Rumpf — Kaskaden-Render-Regel, `react-hooks/set-state-in-effect`) und
  // die Zeile zeigte dazwischen die Zahlen des VORIGEN Erlasses. Mit dem Paar
  // entscheidet der Vergleich beim Nachschlagen, und der Effekt schreibt nur
  // noch aus dem Callback.
  const [stand, setStand] = useState<{ key: string; datei: ZaehlDatei | null } | null>(
    () => (erlassKey && cache.has(erlassKey) ? { key: erlassKey, datei: cache.get(erlassKey) ?? null } : null),
  );
  useEffect(() => {
    if (!erlassKey) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      void lade(erlassKey).then((d) => { if (lebt) setStand({ key: erlassKey, datei: d }); });
    });
    return () => { lebt = false; abbrechen?.(); };
  }, [erlassKey]);

  const datei = stand && stand.key === erlassKey ? stand.datei : null;
  return (artikel: string) => {
    const paar = datei?.a[normArtikelToken(artikel)];
    return paar ? { entscheide: paar[0], materialien: paar[1] } : undefined;
  };
}

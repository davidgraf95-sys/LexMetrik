/**
 * Netz-Wiederholung — dünne, deterministisch testbare Hülle um fetch mit
 * Timeout + begrenzten Wiederholungen + exponentiellem Backoff.
 *
 * Hintergrund (23.6.2026): Der kantonsweite GR-Discovery-Lauf brach an einem
 * einzelnen LexFind-`ETIMEDOUT` ab und schrieb nichts — enumeriereKanton wirft
 * bei jedem fetch-Fehler. Eine transiente Netzschwäche darf einen Lauf über
 * Hunderte Erlasse nicht killen.
 *
 * §2: Die Wiederhol-Logik (wann erneut versucht wird, wie lange gewartet wird)
 * ist rein und über `fetchImpl`/`warte` injizierbar → ohne echtes Netz und ohne
 * echte Zeit testbar. Kein `Math.random` (kein Jitter): der Backoff ist
 * deterministisch (basisMs · 2^(versuch-1)).
 */

export interface WiederholOptionen {
  /** Gesamtzahl Versuche inkl. Erstversuch (Default 4). */
  versuche?: number;
  /** Timeout je Versuch in ms (Default 25000, Projekt-Idiom). */
  timeoutMs?: number;
  /** Basis-Wartezeit; Versuch n wartet basisMs · 2^(n-1) (Default 500). */
  basisMs?: number;
  /** Injizierbar für Tests: ersetzt globales fetch. */
  fetchImpl?: typeof fetch;
  /** Injizierbar für Tests: ersetzt das echte Warten (Backoff). */
  warte?: (ms: number) => Promise<void>;
  /** Diagnose-Haken (z. B. Log pro Wiederholung). */
  beiWiederholung?: (versuch: number, grund: string, warteMs: number) => void;
}

const echteWarte = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Transient = wiederholbar: Netz-Wurf (Timeout/ETIMEDOUT/ECONNRESET) oder 5xx/429. */
export function istWiederholbarerStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * fetch mit Timeout + Wiederholung. Wiederholt bei geworfenen Netz-Fehlern und
 * bei wiederholbaren HTTP-Status (429/5xx); 4xx wird unverändert zurückgegeben
 * (löst sich nicht von selbst). Nach erschöpften Versuchen wirft sie mit dem
 * letzten Fehler/Status — der Aufrufer behält die §8-ehrliche Fehlersicht.
 */
export async function fetchMitWiederholung(
  url: string,
  init: RequestInit | undefined,
  opt: WiederholOptionen = {},
): Promise<Response> {
  const versuche = Math.max(1, opt.versuche ?? 4);
  const timeoutMs = opt.timeoutMs ?? 25000;
  const basisMs = opt.basisMs ?? 500;
  const fetchImpl = opt.fetchImpl ?? fetch;
  const warte = opt.warte ?? echteWarte;

  let letzterFehler: unknown;
  for (let versuch = 1; versuch <= versuche; versuch++) {
    const warteMs = basisMs * 2 ** (versuch - 1);
    try {
      const res = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (istWiederholbarerStatus(res.status) && versuch < versuche) {
        opt.beiWiederholung?.(versuch, `HTTP ${res.status}`, warteMs);
        await warte(warteMs);
        continue;
      }
      return res;
    } catch (e) {
      letzterFehler = e;
      if (versuch >= versuche) break;
      opt.beiWiederholung?.(versuch, (e as Error)?.message ?? 'Netz-Fehler', warteMs);
      await warte(warteMs);
    }
  }
  const grund = (letzterFehler as Error)?.message ?? String(letzterFehler);
  throw new Error(`fetchMitWiederholung: ${versuche} Versuche erschöpft für ${url} — ${grund}`);
}

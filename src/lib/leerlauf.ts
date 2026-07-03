// requestIdleCallback mit garantiert feuerndem Fallback (§15.3) — hält Arbeit
// vom Erstpaint fern. «Garantiert» heisst BEIDE Zweige (CI-Befund W2·7-VZUI):
// ein vorhandenes rIC kann auf ausgelasteten Geräten beliebig lange ausgehungert
// werden (der Main-Thread wird nie idle) — die rIC-`timeout`-Option erzwingt den
// Lauf spätestens nach 1200 ms, identisch zum setTimeout-Zweig ohne rIC.
// Erstpaint/LCP unberührt (feuert weiterhin bevorzugt im Leerlauf). Geteilt von
// gesetz-leser (Leitfall-Shard) — reine Ablaufsteuerung, keine Rechtslogik (§3).
export function beiLeerlauf(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const w = window as typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout: 1200 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
}

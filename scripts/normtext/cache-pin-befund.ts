// scripts/normtext/cache-pin-befund.ts
//
// Cache-Pin-Identitäts-Sonde (Gegenprüfung #806, 12.9.2026). Ausgelagert aus
// scripts/normtext-snapshot.ts (§6.6 Datei-Schlankheit — der Zuwachs hätte die
// dortige Baseline gerissen; `scripts/normtext/**` ist der vorgesehene Ort für
// Cache-Helfer, s. Whitelist des Auftrags).
//
// Fundort des Defekts: `cacheBefund` (scripts/normtext-snapshot.ts) urteilt
// rein nach INHALT (Grösse, Shell-Marker, Anker) — das genügt nicht. Ein
// Cache kann alle drei Inhalts-Sonden bestehen und trotzdem aus der FALSCHEN
// Fedlex-Manifestation stammen: wird zwischen einem früheren Abruf und der
// nächsten Verwendung re-gepinnt (`fedlex:repin-kanonik --write` ändert
// html-N in scripts/fedlex-cache.sh), bleibt die alte, inhaltlich unauffällige
// /tmp-Datei liegen — nichts an ihr unterscheidet sie von einem echten,
// aktuellen Dump. Bei ERV blieb das am 12.9.2026 folgenlos, weil html-6 und
// html-7 byte-identisch sind (Republish derselben Konsolidierung); sobald ein
// Republish inhaltlich abweicht, baute ein solcher Alt-Cache den Snapshot
// still aus der überholten Fassung (§7).
//
// Der Marker `/tmp/<name>.html.pin` trägt die Identität, mit der der Cache
// zuletzt bestätigt geschrieben wurde (`eli|konsolidierung|html-N`). Fehlt er
// oder weicht er vom aktuell gepinnten Eintrag ab, gilt der Cache als
// unbrauchbar — unabhängig davon, wie plausibel sein Inhalt aussieht. Diese
// Sonde ersetzt `cacheBefund` nicht, sie ergänzt sie: beide zusammen bilden
// den vollen Befund, den `sicherstelleCaches` verlangt (dort `cacheUndPinOk`).
import { existsSync, readFileSync } from 'node:fs';

export type CacheBefund = { ok: boolean; grund?: string };

/** Deterministisches Marker-Format: `eli|konsolidierung|html-N`. */
export function pinIdentitaet(eli: string, konsolidierung: string, htmlN: number): string {
  return `${eli}|${konsolidierung}|${htmlN}`;
}

/** Urteilt, ob der Marker eines /tmp-HTML-Caches der aktuell gepinnten Manifestation entspricht. */
export function pinBefund(name: string, eli: string, konsolidierung: string, htmlN: number): CacheBefund {
  const pinPfad = `/tmp/${name}.html.pin`;
  const erwartet = pinIdentitaet(eli, konsolidierung, htmlN);
  if (!existsSync(pinPfad)) return { ok: false, grund: `Pin-Marker fehlt (erwartet ${erwartet}) — Neuabruf nötig` };
  let tatsaechlich: string;
  try {
    tatsaechlich = readFileSync(pinPfad, 'utf8').trim();
  } catch (e) {
    return { ok: false, grund: `Pin-Marker unlesbar (${(e as Error).message})` };
  }
  if (tatsaechlich !== erwartet)
    return {
      ok: false,
      grund: `Pin-Marker weicht ab: Cache=${tatsaechlich} ≠ gepinnt=${erwartet} — Neuabruf nötig`,
    };
  return { ok: true };
}

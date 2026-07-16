// api/fehler.ts — O-1.9 Minimal-Fehlerkanal (QS-OPT). Edge-Function analog api/suche.ts.
//
// ZWECK (FAHRPLAN-OPTIMIERUNG O-1 #9): Prod war bisher strukturell blind — der
// wochenlang tote CSP-Fehler der LiveSuche blieb unbemerkt, weil der einzige
// Rückkanal ein freiwilliges mailto war. Dieser Kanal nimmt vom ErrorBoundary /
// window.onerror NUR die technische Fehlermeldung + Route + Build-Kennung
// (gesampelt) und schreibt sie in die Vercel-Runtime-Logs, wo sie sichtbar wird.
//
// DATENSCHUTZ (§8, in der Datenschutzerklärung offengelegt — Abschnitt 4):
//   • KEINE Nutzereingaben, keine Formularinhalte, kein localStorage.
//   • Kein Fingerprinting: es wird NICHTS aus Headern/IP/User-Agent ausgelesen
//     oder geloggt (die technisch bedingten Server-Zugriffslogs des Hosters
//     existieren ohnehin und sind separat offengelegt — hier kommt nichts hinzu).
//   • Nur drei Felder, hart längenbegrenzt: meldung, route, build.
//   • Best-Effort-Ratenbegrenzung pro Edge-Isolate gegen Log-Fluten; die eigentliche
//     Sparsamkeit macht der Client (Sampling, src/components/fehlermeldung.ts).
//
// Read-/dependency-frei: KEIN Import aus src/ (Client unberührt), 'self'-kompatibel
// (die Prod-CSP erlaubt connect-src 'self' → kein vercel.json-Eingriff nötig).
export const config = { runtime: 'edge' };

const MAX_MELDUNG = 300; // Zeichen — eine Fehlermeldung, kein Stacktrace-Dump
const MAX_ROUTE = 200;
const MAX_BUILD = 40;

// Best-Effort-Fixed-Window-Zähler pro Isolate: Edge-Isolates sind ephemer und
// pro Region — das ist KEINE globale Quote, sondern nur ein Schutz gegen eine
// einzelne fehlerhafte Session, die im selben Isolate flutet. Bewusst simpel.
const FENSTER_MS = 60_000;
const MAX_PRO_FENSTER = 60;
let fensterStart = 0;
let imFenster = 0;

function rateOk(jetzt: number): boolean {
  if (jetzt - fensterStart >= FENSTER_MS) {
    fensterStart = jetzt;
    imFenster = 0;
  }
  if (imFenster >= MAX_PRO_FENSTER) return false;
  imFenster += 1;
  return true;
}

/** Kürzt auf Maxlänge, entfernt Steuerzeichen/Zeilenumbrüche (Log-Injection-Schutz). */
function saeubere(wert: unknown, max: number): string {
  if (typeof wert !== 'string') return '';
  return wert
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]+/g, ' ') // Steuerzeichen/Zeilenumbrueche -> Space
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export default async function handler(req: Request): Promise<Response> {
  // Nur POST; alles andere ist kein gültiger Meldeweg. Kein CORS (same-origin, 'self').
  if (req.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  if (!rateOk(Date.now())) {
    // Ehrlich, aber ohne Retry-After-Details — der Client feuert ohnehin fire-and-forget.
    return new Response(null, { status: 429 });
  }

  let roh: unknown;
  try {
    roh = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const body = (roh ?? {}) as Record<string, unknown>;
  const meldung = saeubere(body.meldung, MAX_MELDUNG);
  const route = saeubere(body.route, MAX_ROUTE);
  const build = saeubere(body.build, MAX_BUILD);
  if (!meldung) return new Response(null, { status: 400 }); // ohne Meldung kein Signal

  // Strukturiert in die Vercel-Runtime-Logs (kein Fremd-Dienst). Nur die drei Felder.
  console.error(
    `[client-fehler] build=${build || 'unbekannt'} route=${route || 'unbekannt'} meldung=${meldung}`,
  );

  // 204: bestätigt Empfang, gibt nichts preis.
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}

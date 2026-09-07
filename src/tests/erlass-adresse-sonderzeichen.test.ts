import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import registerManifest from '../../public/normtext/register.json';
import { erlassPfad, zerlegeErlassPfad } from '../lib/normtext/erlassAdresse';
import { ladeErlass, ladeErlassDatei, ladeStruktur } from '../lib/normtext/browse';

// ─── W2·13-KANTONE · Schlüssel mit Sonderzeichen: EINE Adress-Regel (§5) ─────
//
// NACHZUG ZU F25/K-1b (31.8.2026). Jener Fix hat die halbe Strecke geheilt: der
// SEITEN-Pfad `/gesetze/<ebene>/<key>` überlebt Sonderzeichen seither
// (`zerlegeErlassPfad` statt `useParams()`), und die Tests dazu waren und sind
// grün — die Feststellung von damals steht unverändert. Die Probe am LOKALEN
// Preview (5.9.2026, 682 Checks über 26 Kantone, `vite preview`) blieb trotzdem
// rot: die drei Glarner Erlasse zeigen dort nach der Hydration «Erlass nicht
// gefunden», obwohl das prerenderte HTML unter der kanonischen Adresse korrekt
// ausgeliefert wird.
// §2b-KORREKTUR (Gegenprüfung 5.9.2026): Das war KEIN Live-Defekt. Vercel
// liefert die rohe UND die kodierte Daten-URL mit 200 (curl 5.9.2026,
// `…/GL-III%20B%2F7%2F1.json` und `…/GL-III%2520B%252F7%252F1.json`, gleicher
// Body); auf Produktion rendern die drei Erlasse korrekt. Der Defekt trifft nur
// Server, die die URL genau einmal dekodieren (lokaler Preview, jeder
// strikte statische Server) — der Fix macht die Daten-Adresse serverunabhängig.
//
// GEMESSEN am lokalen Preview (Netzwerk-Mitschnitt, 5.9.2026, origin/main
// a50888232):
//   200 /gesetze/kanton/GL-III%2520B%252F7%252F1            ← Seite, richtig
//   200 /normtext/struktur/kanton/GL-III%20B%2F7%2F1.json   ← Daten, FALSCH
//   200 /normtext/kanton/GL-III%20B%2F7%2F1.json            ← Daten, FALSCH
// Die beiden Daten-URLs entstanden per Template-Literal aus dem ROHEN
// Schlüssel. Der Schlüssel dieser drei Erlasse trägt das Prozentzeichen IN DER
// KANONIK (`GL-III%20B%2F7%2F1` IST der Schlüssel, nicht seine Kodierung) —
// roh in eine URL geschrieben, liest ein decode-once-Server sie als Escape zurück und sucht
// `kanton/GL-III B/7/1.json`. Die Datei heisst aber wörtlich
// `kanton/GL-III%20B%2F7%2F1.json`; der Treffer bleibt aus, der Leser bekommt
// keinen Erlass und zeigt die Fehlseite. Für die 162 Schlüssel mit Leerzeichen
// blieb derselbe Fehler folgenlos — ein Leerzeichen kodiert der Browser selbst
// zu `%20`, und `%20` dekodiert wieder zum Leerzeichen.
//
// DIESER TEST PRÜFT DIE GANZE KETTE, nicht die Formel: Adresse → Register →
// Daten-URL → Datei auf der Platte, mit der strikten Semantik eines
// decode-once-Servers (URL einmal dekodieren, dann im Dateisystem nachsehen);
// Vercel ist nachsichtiger (s. o.), der Test prüft die strengere Variante.
// Bewusst ohne Bezug auf den Namen der Fix-Funktion: geprüft wird, WELCHE URL
// der Lader anfordert, nicht wie sie zustande kommt.

const PUBLIC = resolve(__dirname, '../../public');

type RegisterErlass = { key: string; ebene: string; datei: string; status: string };
const ALLE: RegisterErlass[] = (registerManifest as { erlasse: RegisterErlass[] }).erlasse;

/** Die Schlüssel, deren Adresse nicht mit ihnen selbst zusammenfällt. */
const SONDER = ALLE.filter((e) => e.key !== encodeURIComponent(e.key));
// Nachtrag 5.9.2026 (deklarierte Teständerung): `GL-III%20B_7_1` ist aus dem
// Korpus zurückgezogen. Er war die zweite Schreibweise desselben Erlasses
// (GS III B/7/1) und stand als Dublette neben `GL-III%20B%2F7%2F1` — Befund der
// Gegenprüfung zu diesem PR. Die Messgrundlage schrumpft dadurch um genau
// diesen einen Schlüssel (165 → 164 Sonderzeichen-Keys, 3 → 2 «%»-Keys); die
// 162 BS-Leerzeichen-Keys bleiben unberührt. Die Prüfsubstanz bleibt: beide
// verbliebenen «%»-Keys durchlaufen unverändert die ganze Kette.
const PROZENT_KEYS = ['GL-III%20B%2F7%2F1', 'GL-III%20B%2F3%2F2'];

const angefordert: string[] = [];

/**
 * Statischer Server, wie ihn ein einmal dekodierender Server (lokaler
 * `vite preview`) ausliefert: die URL wird EINMAL dekodiert, das Ergebnis ist
 * der Dateipfad. Vercel selbst ist gegenüber `%20`/`%2F` in Dateinamen
 * nachsichtiger (curl-Beleg 5.9.2026: beide Kodierformen der drei Glarner
 * Schlüssel liefern 200 auf dieselbe Datei) — dieser Prüfstand bildet
 * bewusst den STRENGEREN Fall nach, gegen den die Kodier-Regel trotzdem
 * halten muss. Fehlt die Datei, antwortet die echte Auslieferung mit dem
 * SPA-Fallback (200 + HTML); für den Beweis ist 404 gleichwertig — beides
 * endet im Lader als `null`, und 404 benennt die
 * Ursache, statt sie hinter einem JSON-Parse-Fehler zu verstecken.
 */
function statischerServer(eingabe: string): Promise<Response> {
  angefordert.push(eingabe);
  const pfad = decodeURIComponent(new URL(eingabe, 'http://pruefstand.invalid').pathname);
  const datei = join(PUBLIC, pfad);
  if (!datei.startsWith(PUBLIC) || !existsSync(datei) || statSync(datei).isDirectory()) {
    return Promise.resolve(new Response('nicht gefunden', { status: 404 }));
  }
  return Promise.resolve(
    new Response(readFileSync(datei, 'utf8'), { status: 200, headers: { 'content-type': 'application/json' } }),
  );
}

beforeAll(() => vi.stubGlobal('fetch', (u: string) => statischerServer(String(u))));
afterAll(() => vi.unstubAllGlobals());

/** Dateipfad, auf den eine angeforderte URL beim statischen Server auflöst. */
function aufgeloesterPfad(url: string): string {
  return decodeURIComponent(new URL(url, 'http://pruefstand.invalid').pathname);
}

describe('Erlass-Adresse mit Sonderzeichen (§5: eine Adress-Regel)', () => {
  it('Messgrundlage: 164 Schlüssel mit Sonderzeichen — 162 mit Leerzeichen (BS), 2 mit «%» (GL)', () => {
    expect(SONDER.length).toBe(164);
    expect(SONDER.filter((e) => e.key.includes(' ')).length).toBe(162);
    expect(SONDER.filter((e) => e.key.includes('%')).map((e) => e.key).sort()).toEqual([...PROZENT_KEYS].sort());
  });

  // Voraussetzung jeder segmentweisen Kodierung: ein Schlüssel mit echtem `/`
  // fiele beim Zerlegen eines relativen Dateipfads in zwei Segmente. Solche
  // Schlüssel gibt es nicht (und `KEY_UNSICHER` hielte sie aus dem Prerender);
  // käme je einer, wird diese Zeile rot statt der Auslieferung.
  it('kein Register-Schlüssel trägt ein pfad-brechendes Zeichen', () => {
    expect(ALLE.filter((e) => /[\\/#?]/.test(e.key)).map((e) => e.key)).toEqual([]);
  });

  it('Seiten-Pfad überlebt die Sonderzeichen (F25/K-1b, unverändert grün)', () => {
    const kaputt = SONDER.filter((e) => zerlegeErlassPfad(erlassPfad(e as never))?.key !== e.key);
    expect(kaputt.map((e) => e.key)).toEqual([]);
  });

  it('Register findet jeden Sonderzeichen-Schlüssel exakt', async () => {
    const fehlend: string[] = [];
    for (const e of SONDER) if (!(await ladeErlass(e.key))) fehlend.push(e.key);
    expect(fehlend).toEqual([]);
  });

  // ── Der Rot-Beweis ────────────────────────────────────────────────────────
  //
  // Ein Lauf je Schlüssel, Cache kalt (jede `datei` wird genau einmal geladen):
  // gefragt ist beides — dass der Lader die Datei bekommt UND dass die dafür
  // angeforderte URL beim Server auf genau diese Datei auflöst. Die zweite
  // Hälfte hält den Beweis auch dann ehrlich, wenn eine Auslieferung fehlende
  // Dateien mit einem 200-Fallback beantwortet statt mit 404.
  it('Volltext-Datei jedes Sonderzeichen-Schlüssels ist über ihre URL erreichbar', async () => {
    const fehlend: string[] = [];
    const falscheUrl: string[] = [];
    for (const e of SONDER.filter((x) => x.status === 'snapshot')) {
      angefordert.length = 0;
      if (!(await ladeErlassDatei(e.datei))) fehlend.push(`${e.key} → ${angefordert.at(-1) ?? '(keine URL)'}`);
      const url = angefordert.at(-1);
      if (!url || aufgeloesterPfad(url) !== `/normtext/${e.datei}`) falscheUrl.push(`${e.key} → ${url}`);
    }
    expect(fehlend).toEqual([]);
    expect(falscheUrl).toEqual([]);
  });

  it.each(PROZENT_KEYS)('«%s»: Struktur-Sidecar ist über seine URL erreichbar', async (key) => {
    const e = ALLE.find((x) => x.key === key)!;
    expect(existsSync(join(PUBLIC, 'normtext', 'struktur', e.ebene, `${key}.json`))).toBe(true);
    angefordert.length = 0;
    await expect(ladeStruktur(e.ebene, key)).resolves.not.toBeNull();
    expect(aufgeloesterPfad(angefordert.at(-1) ?? '')).toBe(`/normtext/struktur/${e.ebene}/${key}.json`);
  });
});

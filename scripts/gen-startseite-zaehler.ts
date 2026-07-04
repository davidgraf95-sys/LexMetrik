// ─── Generator: Register/Manifeste → Startseiten-Zähler ─────────────────────
//
// Berechnet die substanziellen Bestandszahlen der Rubrik-Kacheln (Startseite V3,
// FAHRPLAN §3 #4) EINMAL zur Buildzeit und schreibt sie nach
// src/data/startseiteZaehler.generated.ts. Die Startseite importiert NUR diese
// Mini-Datei (Zahlen + Stand) — kein Register/Manifest landet im Startseiten-
// Chunk, kein Client-Fetch. Niemals von Hand editieren.
//
//   npm run gen:zaehler       erzeugt/aktualisiert die Datei
//   npm run check:zaehler     prüft Drift (Datei ≠ Register) → exit 1
//
// Vorbild: gen:verfall / check:verfall-ui (verfall-generieren.ts). Quellen (SSoT
// §5): public/normtext/register.json (Gesetze-Volltext), public/rechtsprechung/
// register.json (Entscheide-Volltext) und der Katalog startseiteConfig.ts
// (verfügbare Rechner/Vorlagen). Gezählt wird NUR echter Volltext (status
// 'snapshot' bzw. Nicht-Verweis-Entscheide) — dünne Bestände bleiben ohne Zahl.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KATALOG_KARTEN, istVerfuegbar } from '../src/lib/startseiteConfig.ts';
import { istVorlage } from '../src/lib/vorlagenKategorie.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GESETZE_REGISTER = resolve(wurzel, 'public/normtext/register.json');
const RSPR_REGISTER = resolve(wurzel, 'public/rechtsprechung/register.json');
const MATERIALIEN_REGISTER = resolve(wurzel, 'public/materialien/register.json');
const ZIEL = resolve(wurzel, 'src/data/startseiteZaehler.generated.ts');

interface ErlassEintrag { ebene: 'bund' | 'kanton'; status: string }
interface EntscheidEintrag { verweis?: unknown }
interface MaterialEintrag { key: string }

function zaehle() {
  // Gesetze: nur echter Volltext (status 'snapshot'); nach Ebene getrennt, damit
  // die Anzeige die Scope-Wahl behält (nur-live-link/pdf-embed zählen NICHT).
  const g = JSON.parse(readFileSync(GESETZE_REGISTER, 'utf8')) as { erzeugt: string; erlasse: ErlassEintrag[] };
  const bund = g.erlasse.filter((e) => e.ebene === 'bund' && e.status === 'snapshot').length;
  const kanton = g.erlasse.filter((e) => e.ebene === 'kanton' && e.status === 'snapshot').length;

  // Rechtsprechung: Nicht-Verweis-Entscheide = echte Volltext-Snapshots (Verweise
  // sind Redirect-Stubs auf ein anderes Urteil, s. NewsHeader/Rechtsprechung.tsx).
  const r = JSON.parse(readFileSync(RSPR_REGISTER, 'utf8')) as { erzeugt: string; entscheide: EntscheidEintrag[] };
  const entscheide = r.entscheide.filter((e) => !e.verweis).length;

  // Rechner/Vorlagen: verfügbare Katalog-Karten MIT eigener Seite (aus dem Katalog
  // abgeleitet, §5 — nicht zweitgepflegt).
  const rechner = KATALOG_KARTEN.filter((k) => istVerfuegbar(k) && !!k.href && !istVorlage(k)).length;
  const vorlagen = KATALOG_KARTEN.filter((k) => istVerfuegbar(k) && !!k.href && istVorlage(k)).length;

  // Materialien (E6a·M5, §0/B10a): erfasste amtliche Behördenpublikationen aus dem
  // Browse-Manifest (kuratiert + gelistete DB-Dokumente). Alle sind bibliografische
  // Verweise (nur-live-link) — der Zähler nennt ehrlich «erfasste», nie Volltext.
  const m = JSON.parse(readFileSync(MATERIALIEN_REGISTER, 'utf8')) as { erzeugt: string; materialien: MaterialEintrag[] };
  const materialien = m.materialien.length;

  return {
    gesetzeBundVolltext: bund,
    gesetzeKantonVolltext: kanton,
    gesetzeVolltext: bund + kanton,
    rechtsprechungVolltext: entscheide,
    materialien,
    rechner,
    vorlagen,
    standGesetze: g.erzeugt,
    standRechtsprechung: r.erzeugt,
    standMaterialien: m.erzeugt,
  };
}

function baue(): string {
  const z = zaehle();
  return (
    '// ─── GENERIERT via `npm run gen:zaehler` ────────────────────────────────\n' +
    '// NICHT von Hand editieren. Quellen (SSoT §5): public/normtext/register.json,\n' +
    '// public/rechtsprechung/register.json und der Katalog (startseiteConfig.ts).\n' +
    '// Drift-Tor: `npm run check:zaehler`. Nur echter Volltext ist gezählt\n' +
    '// (Gesetze/Entscheide: status snapshot bzw. Nicht-Verweise).\n\n' +
    'export interface StartseiteZaehler {\n' +
    '  /** Bundeserlasse im Volltext (status snapshot). */\n' +
    '  gesetzeBundVolltext: number;\n' +
    '  /** Kantonserlasse im Volltext (status snapshot). */\n' +
    '  gesetzeKantonVolltext: number;\n' +
    '  /** Bund + Kanton im Volltext. */\n' +
    '  gesetzeVolltext: number;\n' +
    '  /** Gerichtsentscheide im Volltext (Nicht-Verweise). */\n' +
    '  rechtsprechungVolltext: number;\n' +
    '  /** Erfasste amtliche Materialien (Behördenpublikationen, nur-live-link). */\n' +
    '  materialien: number;\n' +
    '  /** Verfügbare Rechner (eigene Seite). */\n' +
    '  rechner: number;\n' +
    '  /** Verfügbare Vorlagen (eigene Seite). */\n' +
    '  vorlagen: number;\n' +
    '  /** Stand der Gesetzes-Register-Erzeugung (ISO). */\n' +
    '  standGesetze: string;\n' +
    '  /** Stand der Rechtsprechungs-Register-Erzeugung (ISO). */\n' +
    '  standRechtsprechung: string;\n' +
    '  /** Stand der Materialien-Register-Erzeugung (ISO). */\n' +
    '  standMaterialien: string;\n' +
    '}\n\n' +
    'export const STARTSEITE_ZAEHLER: StartseiteZaehler = ' + JSON.stringify(z, null, 2) + ';\n'
  );
}

const istCheck = process.argv.includes('--check');
const neu = baue();

if (istCheck) {
  let alt = '';
  try {
    alt = readFileSync(ZIEL, 'utf8');
  } catch {
    console.error('check:zaehler: ' + ZIEL + ' fehlt — `npm run gen:zaehler` ausführen.');
    process.exit(1);
  }
  if (alt !== neu) {
    console.error('check:zaehler: src/data/startseiteZaehler.generated.ts ist VERALTET gegenüber den Registern (§5) — `npm run gen:zaehler` ausführen und committen.');
    process.exit(1);
  }
  console.log('check:zaehler: Startseiten-Zähler synchron mit den Registern.');
} else {
  writeFileSync(ZIEL, neu, 'utf8');
  const z = zaehle();
  console.log(`gen:zaehler: Gesetze ${z.gesetzeVolltext} (Bund ${z.gesetzeBundVolltext}/Kanton ${z.gesetzeKantonVolltext}) · Entscheide ${z.rechtsprechungVolltext} · Materialien ${z.materialien} · Rechner ${z.rechner} · Vorlagen ${z.vorlagen} → src/data/startseiteZaehler.generated.ts`);
}

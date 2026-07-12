// ─── Import-Zyklen-Gate (H-8/B23, W2·12-HYGIENE) ────────────────────────────
//
// Zirkuläre Imports sind ein Laufzeit-Risiko (init-Reihenfolge, tote/undefined
// Exporte bei ESM-Zyklen) und ein Wartbarkeits-Signal (Module, die sich nicht
// sauber schneiden lassen). Fährt `madge --circular` über src (deckt via
// relativer Imports auch die angebundenen scripts/normtext/*-Adapter ab) und
// vergleicht die Zyklenzahl gegen eine kalibrierte Schranke.
//
// KALIBRIERUNG (12.7.2026, nach H-8/B21+B22): Repo-Start bei 7 Zyklen. B21
// (NormChip aus vorlagen/ui.tsx gezogen) + B22 (register-typen.ts +
// adapter-typen.ts für die reinen Typ-Zyklen) senkten das auf 1. Der letzte
// verbleibende Zyklus
//
//   NormText.tsx → vorlagen/NormChip.tsx → NormPopover.tsx →
//   normtext/ArtikelBody.tsx → (zurück zu) NormText.tsx
//
// ist KEIN Bug, sondern eine echte, beabsichtigte rekursive UI-Struktur:
// NormText rendert NormChip für Inline-Norm-Verweise; ein Norm-Chip-Popover
// zeigt ArtikelBody-Inhalt; ArtikelBody rendert seinerseits NormText für
// Inline-Verweise IM Artikeltext (verschachtelte Norm-Popups können weitere
// Norm-Links enthalten). Alle vier Kanten sind echte Wert-Importe (JSX-
// Komponenten-Verwendung) — keine davon liesse sich ohne echten Verhaltens-
// Eingriff (Dependency-Injection oder React.lazy/Suspense-Codesplit an einer
// der vier Kanten) auflösen; das widerspräche §6 (verhaltensneutral) und dem
// Aufwand «S/Sonnet» von B21. Schranke bewusst auf 1 kalibriert statt auf 0 —
// ein Anstieg über 1 bedeutet einen NEUEN, ungeprüften Zyklus und bricht das
// Tor. Sinkt die Zahl (z. B. durch eine künftige DI-Refactor), MUSS die
// Schranke synchron gesenkt werden (kein Nachziehen auf Vorrat).
//
// Lauf: npm run check:zyklen (Teil von check:seriell → gate voll).
import { execSync } from 'node:child_process';

const SCHRANKE = 1;

let stdout: string;
try {
  stdout = execSync('npx madge --circular --extensions ts,tsx --json src', {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
} catch (e) {
  // madge beendet sich mit exit-code 1, WENN Zyklen gefunden werden — das ist
  // hier der Normalfall (SCHRANKE > 0), kein Skript-Fehler. stdout trägt
  // trotzdem das JSON.
  const err = e as { stdout?: Buffer | string; status?: number };
  if (err.stdout == null) {
    console.error('check:zyklen — madge lieferte kein stdout (unerwarteter Fehler):', e);
    process.exit(1);
  }
  stdout = err.stdout.toString();
}

let zyklen: string[][];
try {
  zyklen = JSON.parse(stdout);
} catch {
  console.error('check:zyklen — madge-Ausgabe war kein valides JSON:\n' + stdout);
  process.exit(1);
}

if (zyklen.length > SCHRANKE) {
  console.error(`check:zyklen ROT — ${zyklen.length} Zyklen gefunden, Schranke ist ${SCHRANKE}:`);
  for (const z of zyklen) console.error('  ' + z.join(' > '));
  console.error('\nNeuer/zusätzlicher Zyklus seit der H-8-Kalibrierung (12.7.2026) — auflösen, nicht die Schranke hochsetzen.');
  process.exit(1);
}
if (zyklen.length < SCHRANKE) {
  console.error(`check:zyklen ROT — nur noch ${zyklen.length} Zyklen (Schranke ${SCHRANKE}). Schranke in scripts/check-zyklen.ts synchron senken (kein Nachziehen auf Vorrat).`);
  process.exit(1);
}

console.log(`check:zyklen ok — ${zyklen.length}/${SCHRANKE} Zyklen (kalibriert, s. Kopfkommentar).`);

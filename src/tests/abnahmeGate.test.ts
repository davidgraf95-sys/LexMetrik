// ─── Abnahme-Gate (abnahme/SCHEMA.md): «geprüft»/verified nur mit Protokoll ──
//
// Build-Gate aus STRATEGIE-PLATTFORM.md F4.2: Es ist technisch unmöglich,
// einen Katalog-Eintrag auf `status: 'geprüft'` zu heben oder eine Norm auf
// `verified: true` zu setzen, ohne dass ein Abnahme-Protokoll
// `abnahme/<karten-id>.md` mit den Pflichtteilen existiert (§7/§8: «geprüft»
// setzt die dokumentierte fachliche Abnahme voraus — nie nur eine Flag-Änderung).
//
// Heute trägt nichts diesen Status — das Gate ist trivial grün und wirkt ab
// der ersten Abnahme-Welle.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALLE_KARTEN } from '../lib/startseiteConfig';

const ABNAHME_ORDNER = resolve(dirname(fileURLToPath(import.meta.url)), '../../abnahme');
const NICHT_PROTOKOLLE = new Set(['SCHEMA.md', 'VORLAGE.md']);

/** Pflichtteile nach abnahme/SCHEMA.md — Marker, nicht Layout (tolerant). */
const PFLICHTTEILE: { name: string; muster: RegExp }[] = [
  { name: 'Prüfer:in + Datum', muster: /\*\*Prüfer:in:\*\*/ },
  { name: 'Abnahme-Art', muster: /\*\*Abnahme-Art:\*\*/ },
  { name: 'Geprüfte Normgrundlage', muster: /Geprüfte Normgrundlage/ },
  { name: 'Golden-Referenzfälle', muster: /Golden-Referenzfälle/ },
  { name: 'Known Limitations', muster: /Known Limitations/ },
  { name: 'Ergebnis «abgenommen»', muster: /\babgenommen\b/i },
];

function protokollPfad(id: string): string {
  return resolve(ABNAHME_ORDNER, `${id}.md`);
}

function brauchtProtokoll(k: (typeof ALLE_KARTEN)[number]): string[] {
  const gruende: string[] = [];
  if (k.status === 'geprüft') gruende.push("status 'geprüft'");
  const verifizierte = k.norms.filter((n) => n.verified);
  if (verifizierte.length > 0) gruende.push(`verified:true bei ${verifizierte.map((n) => n.label).join(', ')}`);
  return gruende;
}

describe('Abnahme-Gate (abnahme/SCHEMA.md)', () => {
  it("«geprüft»/verified:true nur mit Abnahme-Protokoll samt Pflichtteilen", () => {
    const verstoesse: string[] = [];
    for (const k of ALLE_KARTEN) {
      const gruende = brauchtProtokoll(k);
      if (gruende.length === 0) continue;
      const pfad = protokollPfad(k.id);
      if (!existsSync(pfad)) {
        verstoesse.push(`${k.id} (${gruende.join(' + ')}): abnahme/${k.id}.md fehlt`);
        continue;
      }
      const inhalt = readFileSync(pfad, 'utf8');
      for (const teil of PFLICHTTEILE) {
        if (!teil.muster.test(inhalt)) {
          verstoesse.push(`${k.id}: Protokoll ohne Pflichtteil «${teil.name}»`);
        }
      }
    }
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('jedes Protokoll gehört zu einer existierenden Karte', () => {
    const ids = new Set(ALLE_KARTEN.map((k) => k.id));
    const waisen = readdirSync(ABNAHME_ORDNER)
      .filter((f) => f.endsWith('.md') && !NICHT_PROTOKOLLE.has(f))
      .filter((f) => !ids.has(f.replace(/\.md$/, '')));
    expect(waisen, `Protokolle ohne Katalog-Karte: ${waisen.join(', ')}`).toEqual([]);
  });

  it('Schema und Vorlage liegen im Ordner (Selbstkontrolle des Gates)', () => {
    expect(existsSync(resolve(ABNAHME_ORDNER, 'SCHEMA.md'))).toBe(true);
    expect(existsSync(resolve(ABNAHME_ORDNER, 'VORLAGE.md'))).toBe(true);
  });
});

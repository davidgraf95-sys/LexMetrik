import { describe, it, expect, vi, afterEach } from 'vitest';

// ─── Auflage der Gegenprüfung #802 (§8): der Rückfall auf den deutschen Titel ──
//
// Seit der Aufteilung des Materialien-Registers (12.9.2026) kommen die FR/IT-Titel
// aus einer zweiten Datei. Scheitert deren Abruf, zeigt die Fläche die deutschen
// Titel — das ist richtig (§8: nie eine leere Zeile statt des amtlichen Titels),
// darf aber nicht STILL geschehen. Geprüft wird deshalb nicht der Titel, sondern
// der mitgelieferte GRUND, an dem die Fläche die Kennzeichnung aufhängt:
//   'nicht-geladen'  — register-i18n.json war nicht erreichbar   → sichtbarer Hinweis
//   'nicht-erfasst'  — für diesen Eintrag gibt es keine Übersetzung → nur lang="de"
//   undefined        — deutsche Oberfläche oder Übersetzung vorhanden
//
// Die beiden Fälle auseinanderzuhalten ist der Kern: ein gemeinsames «keine
// Übersetzung» würde einen Netzfehler als Datenlücke ausgeben.

const BOT = {
  key: 'BOTSCHAFT-2025-1', behoerde: 'BR', behoerdeName: 'Bundesrat (Botschaften)',
  behoerdeKuerzel: 'BR', doktyp: 'botschaft', doktypLabel: 'Botschaft',
  titel: 'Botschaft zur Änderung des DSG', nummer: '25.001', rechtsgebiet: 'oeffentlich',
  sprache: 'de', status: 'nur-live-link', quelleUrl: 'https://www.fedlex.admin.ch/eli/fga/2025/1/de',
  stand: '2025-01-01', rang: 1, normKeys: ['DSG'], hinweis: null,
};
const VERN = {
  ...BOT, key: 'VERN-2025-1', behoerde: 'BUND', doktyp: 'vernehmlassung',
  doktypLabel: 'Vernehmlassung', titel: 'Vernehmlassung zum DSG',
  vernehmlassung: { status: 'laufend', fristEnde: '2027-01-01', projEli: 'https://x' },
};
const REGISTER = { erzeugt: '2026-09-12', materialien: [BOT, VERN] };
const I18N = { erzeugt: '2026-09-12', titel: { 'BOTSCHAFT-2025-1': { fr: 'Message LPD', it: 'Messaggio LPD' } } };

/** Stubbt fetch und zählt die Abrufe je Pfad; `i18nOk: false` = 404 auf die Titel-Datei. */
function stubFetch(i18nOk: boolean) {
  const abrufe: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    abrufe.push(url);
    if (url === '/materialien/register.json') {
      return { ok: true, status: 200, json: async () => REGISTER } as Response;
    }
    if (url === '/materialien/register-i18n.json' && i18nOk) {
      return { ok: true, status: 200, json: async () => I18N } as Response;
    }
    return { ok: false, status: 404, json: async () => ({}) } as Response;
  }));
  return abrufe;
}

/** Frische Modul-Instanz: browse.ts merkt sich beide Abrufe als laufende Promise. */
async function frisch() {
  vi.resetModules();
  return {
    botschaften: (await import('../lib/materialien/botschaften')).botschaftenFuer,
    vernehmlassungen: (await import('../lib/materialien/vernehmlassungen')).vernehmlassungenFuer,
  };
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('Titel-Rückfall — der Grund wird mitgeliefert (Auflage #802)', () => {
  it('deutsche Oberfläche: kein Abruf der Übersetzungen, kein Rückfall-Grund', async () => {
    const abrufe = stubFetch(true);
    const { botschaften } = await frisch();
    const out = await botschaften(['DSG']);
    expect(out).toHaveLength(1);
    expect(out![0].titel).toBe('Botschaft zur Änderung des DSG');
    expect(out![0].titelRueckfall).toBeUndefined();
    expect(abrufe.filter((u) => u.includes('register-i18n'))).toEqual([]);
  });

  it('fr + Übersetzung vorhanden: Titel gesetzt, kein Rückfall-Grund', async () => {
    stubFetch(true);
    const { botschaften } = await frisch();
    const out = await botschaften(['DSG'], 'fr');
    expect(out![0].titelFr).toBe('Message LPD');
    expect(out![0].titelIt).toBe('Messaggio LPD');
    expect(out![0].titelRueckfall).toBeUndefined();
  });

  it('fr + Abruf gescheitert: Grund «nicht-geladen» (nicht still, nicht als Datenlücke)', async () => {
    stubFetch(false);
    const { botschaften } = await frisch();
    const out = await botschaften(['DSG'], 'fr');
    expect(out![0].titelFr).toBeUndefined();
    expect(out![0].titel, 'der amtliche deutsche Titel bleibt stehen (§8)').toBe('Botschaft zur Änderung des DSG');
    expect(out![0].titelRueckfall).toBe('nicht-geladen');
  });

  it('fr + Datei geladen, aber ohne Eintrag: Grund «nicht-erfasst»', async () => {
    stubFetch(true);
    const { vernehmlassungen } = await frisch();
    // VERN-2025-1 steht nicht in I18N.titel.
    const out = await vernehmlassungen(['DSG'], 'fr');
    expect(out![0].titelRueckfall).toBe('nicht-erfasst');
  });

  it('Vernehmlassungen tragen denselben Grund bei gescheitertem Abruf', async () => {
    stubFetch(false);
    const { vernehmlassungen } = await frisch();
    const out = await vernehmlassungen(['DSG'], 'it');
    expect(out![0].titelRueckfall).toBe('nicht-geladen');
  });
});

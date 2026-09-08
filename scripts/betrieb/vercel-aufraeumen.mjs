#!/usr/bin/env node
// @ts-check
/**
 * QS-AUTOMATIK — alte Vercel-Deployments löschen (Deployment Storage).
 *
 * ANLASS (belegt 8.9.2026, Vercel-Nutzungsseite Team `david-legal-projects`):
 * Deployment Storage 261.91 GB bei einer Hobby-Grenze von 10 GB, davon 100 %
 * Projekt `lexmetrik`. Ein einzelner Stand (`dist`) wiegt 738 MB bei 18 321
 * Dateien; bei 10–20 Landungen pro Tag wächst der Speicher schneller, als
 * irgendeine Aufbewahrungsfrist ihn abbaut. Vercel-Mail 8.9.2026 02:35:
 * «100 % of Deployment Storage (10 GB) … Upgrade now to avoid service
 * disruption».
 *
 * WARUM DIE RETENTION POLICY NICHT REICHT: David hat am 8.9.2026 alle vier
 * Aufbewahrungs-Arten des Projekts auf «1 day» gestellt. Vercel behält davon
 * unabhängig IMMER die letzten 20 Produktions-Deployments und die letzten 10
 * Deployments überhaupt — bei 738 MB je Stand sind das ~15 GB, also weiterhin
 * über der 10-GB-Grenze. Wurzel-Fix (§17): dieser Lauf behält nur die 3
 * neuesten Produktions-Stände und löscht den Rest.
 *
 * WIEDERHERSTELLUNG: gelöschte Deployments bleiben 30 Tage über
 * Vercel → Settings → Security → Recently Deleted zurückholbar.
 *
 * Reines Node 22 ohne Abhängigkeiten (globales `fetch`): der Deploy-Job fährt
 * absichtlich kein `npm ci` — er baut über die Vercel-CLI.
 *
 * §18: VERCEL_TOKEN steht ausschliesslich im Authorization-Header und wird
 * nie ausgegeben.
 */

import { pathToFileURL } from 'node:url';

/** Zustände, in denen ein Deployment noch arbeitet — nie anfassen. */
const NICHT_FINAL = new Set(['BUILDING', 'QUEUED', 'INITIALIZING']);

/** Vercel liefert URLs ohne Protokoll, der Deploy-Schritt mit. Beides tolerieren. */
function normUrl(wert) {
  if (typeof wert !== 'string') return '';
  return wert
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

/** v6 nennt das Feld `uid`, v13 `id` — beide Schreibweisen akzeptieren. */
function idVon(d) {
  return String(d?.uid ?? d?.id ?? '');
}

/**
 * REINE Auswahl: welche Deployments dürfen gelöscht werden?
 *
 * Deterministisch — kein `Date.now()`, kein Netz, keine Seiteneffekte. Der
 * Bezugszeitpunkt kommt als `jetzt` herein, damit der Test die Altersgrenze
 * festnageln kann.
 *
 * BEHALTEN wird immer:
 *  (a) das eben ausgelieferte Deployment (Id ODER Url passt),
 *  (b) das Deployment, das laut Projekt aktuell den Produktions-Alias trägt,
 *  (c) die `behalteProd` neuesten Produktions-Deployments (target 'production',
 *      state 'READY') nach `created` absteigend,
 *  (d) alles, was jünger als `mindestAlterMs` ist (ein laufender Alias-Wechsel
 *      oder ein paralleler Merge darf nie unter den Füssen weggelöscht werden),
 *  (e) alles in nicht-finalem Zustand (BUILDING/QUEUED/INITIALIZING).
 *
 * GELÖSCHT wird alles Übrige: ältere READY-Produktion, sämtliche Previews
 * (target null/'preview'), ERROR und CANCELED.
 *
 * @param {Array<Record<string, any>>} deployments
 * @param {{ jetzt: number, aktuellId?: string, aktuellUrl?: string,
 *           produktionsAliasId?: string, behalteProd?: number,
 *           mindestAlterMs?: number }} optionen
 * @returns {Array<Record<string, any>>} zu löschende Deployments (jüngste zuerst)
 */
export function waehleZuLoeschen(deployments, optionen) {
  const {
    jetzt,
    aktuellId = '',
    aktuellUrl = '',
    produktionsAliasId = '',
    behalteProd = 3,
    mindestAlterMs = 3_600_000,
  } = optionen ?? {};

  const liste = Array.isArray(deployments) ? deployments.filter(Boolean) : [];
  const aktuellUrlNorm = normUrl(aktuellUrl);
  const aktuellIdNorm = String(aktuellId ?? '');
  const aliasIdNorm = String(produktionsAliasId ?? '');

  // Sortierung ist Teil der Semantik («die 3 neuesten»): `created` absteigend,
  // bei Gleichstand die Id als stabiler Zweitschlüssel — sonst hinge das
  // Ergebnis an der Reihenfolge der API-Antwort.
  const sortiert = [...liste].sort((a, b) => {
    const dc = Number(b?.created ?? 0) - Number(a?.created ?? 0);
    return dc !== 0 ? dc : idVon(a).localeCompare(idVon(b));
  });

  const geschuetzteProd = new Set(
    sortiert
      .filter((d) => d?.target === 'production' && d?.state === 'READY')
      .slice(0, Math.max(0, behalteProd))
      .map(idVon),
  );

  return sortiert.filter((d) => {
    const id = idVon(d);
    if (!id) return false; // ohne Id nicht löschbar — im Zweifel behalten
    if (aktuellIdNorm && id === aktuellIdNorm) return false; // (a)
    if (aktuellUrlNorm && normUrl(d?.url) === aktuellUrlNorm) return false; // (a)
    if (aliasIdNorm && id === aliasIdNorm) return false; // (b)
    if (geschuetzteProd.has(id)) return false; // (c)
    if (Number(jetzt) - Number(d?.created ?? 0) < mindestAlterMs) return false; // (d)
    if (NICHT_FINAL.has(String(d?.state ?? ''))) return false; // (e)
    return true;
  });
}

// ─────────────────────────── Hauptlauf (nur direkt gestartet) ────────────────

const API = 'https://api.vercel.com';

function warnUndRaus(text) {
  console.log(`::warning::Vercel-Aufräumen: ${text}`);
  process.exit(1);
}

async function hole(pfad, token) {
  const antwort = await fetch(`${API}${pfad}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!antwort.ok) {
    throw new Error(`GET ${pfad.split('?')[0]} → HTTP ${antwort.status}`);
  }
  return antwort.json();
}

async function hauptlauf() {
  const token = process.env.VERCEL_TOKEN ?? '';
  const projectId = process.env.VERCEL_PROJECT_ID ?? '';
  const teamId = process.env.VERCEL_ORG_ID ?? '';
  const aktuellUrl = process.env.AKTUELL_URL ?? '';
  const trocken = process.env.AUFRAEUMEN_TROCKEN === '1';
  const maxLoeschungen = Number(process.env.AUFRAEUMEN_MAX ?? '150');

  const fehlend = [
    !token && 'VERCEL_TOKEN',
    !projectId && 'VERCEL_PROJECT_ID',
    !teamId && 'VERCEL_ORG_ID',
  ].filter(Boolean);
  if (fehlend.length > 0) {
    warnUndRaus(`fehlende Umgebung: ${fehlend.join(', ')} — nichts aufgeräumt.`);
  }

  const team = `teamId=${encodeURIComponent(teamId)}`;

  let produktionsAliasId = '';
  let deployments = [];
  try {
    const projekt = await hole(
      `/v9/projects/${encodeURIComponent(projectId)}?${team}`,
      token,
    );
    produktionsAliasId = String(projekt?.targets?.production?.id ?? '');

    // Pagination: v6 liefert `pagination.next` als Zeitstempel für `until`.
    let until = '';
    for (let seite = 0; seite < 100; seite += 1) {
      const query =
        `/v6/deployments?projectId=${encodeURIComponent(projectId)}&${team}&limit=100` +
        (until ? `&until=${until}` : '');
      const antwort = await hole(query, token);
      const teil = Array.isArray(antwort?.deployments) ? antwort.deployments : [];
      deployments.push(...teil);
      const next = antwort?.pagination?.next;
      if (!next || teil.length === 0) break;
      until = String(next);
    }
  } catch (fehler) {
    warnUndRaus(`${fehler instanceof Error ? fehler.message : String(fehler)} — nichts gelöscht.`);
  }

  const jetzt = Date.now();
  const zuLoeschen = waehleZuLoeschen(deployments, {
    jetzt,
    aktuellUrl,
    produktionsAliasId,
    behalteProd: 3,
  });
  const zuLoeschenIds = new Set(zuLoeschen.map(idVon));
  const stapel = zuLoeschen.slice(0, Math.max(0, maxLoeschungen));
  const stapelIds = new Set(stapel.map(idVon));

  function zeile(d, vermerk) {
    const alterH = ((jetzt - Number(d?.created ?? 0)) / 3_600_000).toFixed(1);
    const kurz = String(d?.url ?? '').replace(/\.vercel\.app$/, '');
    return `  ${idVon(d).padEnd(28)} ${kurz.padEnd(36)} ${String(d?.target ?? '—').padEnd(11)} ${String(d?.state ?? '—').padEnd(13)} ${alterH.padStart(8)} h  ${vermerk}`;
  }

  let geloescht = 0;
  let fehler = 0;
  let behalten = 0;

  for (const d of deployments) {
    if (!zuLoeschenIds.has(idVon(d))) {
      behalten += 1;
      console.log(zeile(d, 'behalten'));
    }
  }

  for (const d of stapel) {
    const id = idVon(d);
    if (trocken) {
      console.log(zeile(d, 'trocken'));
      continue;
    }
    let erfolg = false;
    for (let versuch = 1; versuch <= 2; versuch += 1) {
      const antwort = await fetch(
        `${API}/v13/deployments/${encodeURIComponent(id)}?${team}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
      );
      if (antwort.ok) {
        erfolg = true;
        break;
      }
      // 429 = Rate Limit: einmal 5 s warten und wiederholen. Jeder andere
      // Fehler wird gezählt, nicht wiederholt — der Lauf bricht nie ab, der
      // nächste Deploy räumt den Rest.
      if (antwort.status !== 429 || versuch === 2) {
        console.log(zeile(d, `FEHLER HTTP ${antwort.status}`));
        break;
      }
      await new Promise((r) => setTimeout(r, 5_000));
    }
    if (erfolg) {
      geloescht += 1;
      console.log(zeile(d, 'gelöscht'));
    } else {
      fehler += 1;
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  const uebrig = zuLoeschen.filter((d) => !stapelIds.has(idVon(d))).length;
  console.log(
    `Vercel-Aufräumen: ${geloescht} gelöscht · ${behalten} behalten · ${uebrig} übrig (nächster Lauf)` +
      (trocken ? ` · TROCKENLAUF (${stapel.length} wären gelöscht worden)` : '') +
      (fehler > 0 ? ` · ${fehler} Fehler` : ''),
  );

  if (fehler > 0) {
    console.log(`::warning::Vercel-Aufräumen: ${fehler} Löschungen fehlgeschlagen.`);
    process.exit(1);
  }
}

// Nur ausführen, wenn die Datei direkt gestartet wurde — der Test importiert
// `waehleZuLoeschen` und darf dabei kein Netz anfassen.
const direktGestartet =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (direktGestartet) {
  await hauptlauf();
}

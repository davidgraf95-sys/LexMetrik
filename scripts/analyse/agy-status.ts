// scripts/analyse/agy-status.ts — geteilte Kontingent-Erkennung für agy-Aufrufe
// (Auftrag QS-FREMDAGENTEN «Kontingent-Alarm», 4.9.2026; genutzt von
// gemini-diskrepanz.ts UND fremdagenten-messung.ts --kontingent).
//
// Ein `agy`-Lauf, der nicht mit `status: SUCCESS` zurückkommt (oder gar
// nichts auf stdout liefert), kann Verschiedenes bedeuten: (a) Kontingent
// gesperrt — der Betriebsfall, den Fahrplan §4/§5 als «Kontingent-Ereignis»
// protokolliert haben will, (b) ein anderer Fehler (Netz, Prompt, falscher
// Modell-Slug), (c) ein Timeout. Diese Datei klassiert NUR TEXT — sie ruft
// `agy` selbst nicht auf und weiss nichts von Prozessen.
//
// Musterherkunft: Fahrplan-Auftrag 4.9.2026 — agy/Google-Fehlermeldungen zu
// Kontingent-Erschöpfung sind nie beobachtet, nur aus Zweitquellen erwartet
// (429/RESOURCE_EXHAUSTED sind die HTTP-/gRPC-Standardformen für Google-APIs,
// "quota"/"rate limit"/"too many"/"exceeded"/"limit" die üblichen Klartext-
// Varianten). Das erste TATSÄCHLICH beobachtete Ereignis gehört in Fahrplan §5
// eingetragen — dort auch die Weisung, die Liste ggf. zu korrigieren.

const KONTINGENT_MUSTER = /quota|rate.?limit|429|resource.?exhausted|too many|exceeded|limit/i;

export type AgyKlassierung =
  | { art: 'kontingent'; text: string }
  | { art: 'fehler'; text: string };

/**
 * Klassiert einen agy-Fehlertext: `envelope.status` bei `!== 'SUCCESS'`
 * (zusammen mit `envelope.response`), ODER ein stderr-Hinweis bei leerem
 * stdout. Leerer Text zählt als «fehler», nie als «kontingent» (ein Muster
 * kann nur in vorhandenem Text gefunden werden).
 */
export function klassiereAgyFehler(text: string): AgyKlassierung {
  const getrimmt = text.trim();
  if (getrimmt && KONTINGENT_MUSTER.test(getrimmt)) {
    return { art: 'kontingent', text: getrimmt };
  }
  return { art: 'fehler', text: getrimmt || '(kein Text)' };
}

/** Die Meldung, die überall gleich lauten muss (Fahrplan-Vorgabe, wörtlich). */
export const KONTINGENT_MELDUNG =
  'KONTINGENT gesperrt — Fallback: Claude, Sperre im Fahrplan §5 protokollieren';

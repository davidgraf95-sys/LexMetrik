import { katalogKurzform } from '../../lib/verlaufLabel';
import { artVonRoute } from './suchArt';
import type { GruppenId, SuchTreffer } from '../../lib/universalSuche';

// ═══ F1–F4 (Prüfer D23, 6.9.2026) · EINE ANATOMIE FÜR BEIDE ZUSTÄNDE ════════
//
// D23 hatte die Kopf-Suche im LEERZUSTAND auf eine ruhige Zeilen-Anatomie
// gebracht — Registerstrich · Kurzform · Art rechts als Text. Der TREFFER-
// Zustand blieb daneben stehen und war GEMESSEN am Stand `c91541617` etwas
// anderes: Volltitel («OR · Bundesgesetz betreffend die Ergänzung des
// Schweizerischen Zivilgesetzbuches …»), darunter ein bis zu mehrzeiliges
// Snippet, rechts ein gerahmtes Etikett (`.lc-badge-soft`) und ein ★-Glyph für
// den Leitentscheid. Zeilenhöhen 37–266 px in derselben Liste.
//
// Diese Datei hält die zwei Ableitungen, die die Treffer-Zeile dafür braucht,
// an EINER Stelle (§5) — beide rein und deterministisch (§2), beide ohne
// eigene Datenkenntnis über das hinaus, was der Aggregator liefert (§3).

/** ── DIE KURZFORM EINER TREFFER-ZEILE ───────────────────────────────────────
 *
 *  Die meisten Gruppen liefern IHRE Kurzform bereits als `label`: der
 *  Norm-Sprung «OR · Art. 257», der Artikel «Art. 257 OR», der Entscheid seine
 *  Zitierung «BGE 148 III 57», die Fristen-Vorlage ihren Namen. Zwei Gruppen
 *  komponieren dagegen «Kurzform · Volltitel» in EIN Feld
 *  (`lib/universalSuche.ts`: `gesetzGruppe` → `${kuerzel} · ${titel}`,
 *  `materialGruppe` → `${behoerdeKuerzel} ${nummer} · ${titel}`), und genau
 *  diese beiden waren der gemessene Volltitel-Befund F1. Für sie — und NUR für
 *  sie — steht die Kurzform vor dem ersten « · ».
 *
 *  Rechner und Vorlagen (`katalog`) gehen den kanonischen Weg: ihre Kurzform
 *  führt der Katalog selbst (`karte.kurz`, gelesen über `katalogKurzform` —
 *  dieselbe Quelle wie die Arbeitsleiste, §5). Fehlt das Feld, bleibt der
 *  Titel stehen; geraten wird nichts (§7).
 *
 *  NICHTS GEHT VERLOREN (§8): den vollen Titel trägt die Zeile weiter im
 *  `title` (s. `trefferTitel`), zusammen mit dem Untertitel/Snippet.
 */
export function trefferKurzform(t: SuchTreffer, gruppe: GruppenId): string {
  if (gruppe === 'katalog') return katalogKurzform(t.href) ?? t.label;
  if (gruppe !== 'gesetz' && gruppe !== 'material') return t.label;
  const i = t.label.indexOf(' · ');
  return i > 0 ? t.label.slice(0, i) : t.label;
}

/** Vollständige Auskunft der Zeile für den `title` (Zeiger + Vorlesehilfe):
 *  Volltitel, und dahinter das, was vorher als zweite Zeile im Panel stand. */
export function trefferTitel(t: SuchTreffer): string {
  return t.untertitel ? `${t.label} — ${t.untertitel}` : t.label;
}

/** ── DIE ART RECHTS, ALS TEXT ───────────────────────────────────────────────
 *
 *  Grundlage ist `artVonRoute` (D23, EINE Zuordnung Route → Art). Dazu kommt
 *  der QUALIFIKATOR, den der Aggregator als `marke` mitgibt, sofern er wirklich
 *  einer ist:
 *   · `redundant` sind die Typ-Chips («Rechner», «Vorlage», «Material») — sie
 *     sagen genau das, was die Art schon sagt, und fallen weg.
 *   · `ton: 'ok'` sind AKTIONS-Hinweise («Sprung», «Direkt öffnen») — die Zeile
 *     sagt das mit ihrem «↵», und die Gruppe heisst ohnehin «Norm-Sprung».
 *   · Alles Übrige ist eine echte Zusatzauskunft und bleibt: der Kanton eines
 *     kantonalen Erlasses («Gesetz · ZH»), das Regime einer Fristen-Vorlage
 *     («Rechner · ZPO») — und der LEITENTSCHEID, der damit als WORT dasteht
 *     statt als ★ (F4). Das Vokabular ist unverändert das des `StatusBadge`
 *     («Leitentscheid»), nur ohne Kasten und ohne Glyphe.
 *  Rückgabe null = der Platz bleibt leer, statt eine Art zu erfinden (§8).
 */
export function trefferArt(t: SuchTreffer): string | null {
  const art = artVonRoute(t.href);
  const zusatz = t.marke && !t.marke.redundant && t.marke.ton !== 'ok' ? t.marke.text : null;
  const teile = [art, zusatz].filter(Boolean) as string[];
  return teile.length ? teile.join(' · ') : null;
}

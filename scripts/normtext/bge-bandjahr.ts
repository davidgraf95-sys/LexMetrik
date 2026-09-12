// ─── BGE-Bandjahr: gemeinsame, pure Regeln (§2) ──────────────────────────────
//
// Ein BGE-Band deckt genau einen Jahrgang (Band+1874 = Publikationsjahr, seit
// 1875) — die kanonische, deterministische Jahresquelle für alle Plausibilitäts-
// und Platzhalter-Entscheide rund um Entscheid-Daten. Netzfrei, unit-testbar.

/** Band aus einer Fundstelle («151 II 475», «BGE 151 II 475») → Publikationsjahr, oder null. */
export function bandJahrVon(bgeReferenz: string | null | undefined): number | null {
  const band = parseInt(String(bgeReferenz ?? '').replace(/^(?:BGE|ATF|DTF)\s+/i, '').trim(), 10);
  return Number.isFinite(band) && band > 0 ? band + 1874 : null;
}

/**
 * Bandjahr-Platzhalterdatum (§8-Konvention, Auszug-only ohne amtliches
 * Kopf-Datum): `<Band+1874>-01-01`. NIE bei einem aufgelösten Vollurteil
 * (azaUrteil), das trägt immer ein echtes Urteilsdatum.
 */
export function istBandjahrPlatzhalter(
  s: { datum: string; azaUrteil?: unknown; bgeReferenz: string | null | undefined },
): boolean {
  if (s.azaUrteil) return false;
  const bandJahr = bandJahrVon(s.bgeReferenz);
  return bandJahr != null && s.datum === `${bandJahr}-01-01`;
}

/**
 * B1-Refresh-Entscheid (Gegenprüfungs-Auflage A1, 12.9.2026, PR #816): ein
 * frisch geholtes Ergebnis wird NIE übernommen, wenn es ein bereits EXAKTES UND
 * PLAUSIBLES Bestandsdatum durch den groben Bandjahr-Platzhalter ERSETZEN würde
 * — typischer Auslöser: eine Netzstörung beim clir-Kopf-Fetch degradiert
 * kopf.datumFallback zu null, und der Auszug-only-Fallback in
 * `holeBgeLeitentscheid` greift auf `<Bandjahr>-01-01` zurück, obwohl der
 * Bestand bereits ein präziseres Datum trägt. Ein Bestandsdatum, das SELBST
 * bereits die Bandjahr-Plausibilität verletzt (der ursprüngliche Fund, z.B.
 * 1999-06-21 statt 2025), gilt nicht als «exakt» — der Wechsel auf den
 * Platzhalter ist dort eine Verbesserung, keine Verschlechterung, und wird
 * übernommen. In jedem anderen Fall (Vollurteil aufgelöst, oder das Ergebnis
 * ist mindestens so präzise wie der Bestand) wird das frische Ergebnis
 * übernommen.
 *
 * RESTLÜCKE (dokumentiert, Gegenprüfung A3, 12.9.2026): das Fenster erkennt nur
 * IMPLAUSIBLE Bestandsdaten (>5 Jahre vor dem Bandjahr) als «nicht exakt». Ein
 * Bestandsdatum, das FALSCH, aber zufällig PLAUSIBEL aussieht (z.B. durch eine
 * fremde OCL-Record-Konflation geerbt — Anlassfall `bge_152_V_2`: 2025-06-23 war
 * das Datum von `152 V 20`, lag aber innerhalb des ±5-Jahr-Fensters von Band 152),
 * wird von dieser Regel als «exakt» behandelt und darum KONSERVIERT, nicht
 * korrigiert — ein automatischer B1-Lauf hätte diesen Fall nie repariert. Die
 * Korrektur brauchte darum unabhängige, ausserhalb dieser Regel liegende
 * amtliche Evidenz (bger.ch clir + der unkonfliert korrekte OCL-aza-Kandidat)
 * und einen gezielten, manuell verifizierten Eingriff (§8, nichts geraten) —
 * kein Automatismus schliesst diese Lücke pauschal.
 */
export function verschlechtertDatum<T extends { datum: string; azaUrteil?: unknown; bgeReferenz: string | null | undefined }>(
  alt: T,
  neu: T,
): boolean {
  if (!istBandjahrPlatzhalter(neu) || istBandjahrPlatzhalter(alt)) return false;
  return bandjahrDiffPlausibel(alt.bgeReferenz, alt.datum).ok;
}

/**
 * Tor-Regel `check:entscheide` (Register-Sweep, Fund 12.9.2026, W2·18-FEHLERBUCH):
 * ein Urteil datiert nie nach dem Bandjahr und praktisch nie mehr als `fenster`
 * Jahre davor (dasselbe Fenster wie der aza-Resolver, §8). `diff` ist
 * Bandjahr − Jahr(datum); `ok` ist false, wenn `diff` das Fenster überschreitet
 * ODER kein Jahr/Band ermittelbar sind, ist die Prüfung nicht anwendbar
 * (`diff: null`, `ok: true` — kein Befund ohne Datengrundlage).
 */
export function bandjahrDiffPlausibel(
  bgeReferenz: string | null | undefined,
  datum: string | null | undefined,
  fenster = 5,
): { ok: boolean; diff: number | null; bandJahr: number | null } {
  const bandJahr = bandJahrVon(bgeReferenz);
  const jahr = parseInt(String(datum ?? '').slice(0, 4), 10);
  if (bandJahr == null || !Number.isFinite(jahr)) return { ok: true, diff: null, bandJahr };
  const diff = bandJahr - jahr;
  return { ok: diff <= fenster, diff, bandJahr };
}

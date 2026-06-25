# Fahrplan: International — Fedlex-Volltext + /gesetze-Redesign

Auftrag David (25.6.2026, ultracode): internationale Gesetze/Verträge «viel mehr»
einarbeiten — **fang an mit denen auf admin/Fedlex (SR 0.*) als Volltext**, dann
eigene EU-Rubrik nur mit amtlichem EU-Link; und die `/gesetze`-Übersicht neu
designen, sodass International gleichwertig abgedeckt ist.

## Stand (was bereits live ist)

- **EU-Rubrik FERTIG + deployt** (Commit `ca59859`): 8 EU-Verordnungen als reine
  nur-live-link-Einträge auf `/international` (DSGVO, DSA, DMA, KI-VO/AI-Act, MiCA,
  Rom I, Rom II, Brüssel Ia), eigene Gruppe «EU-Verordnungen mit Praxisrelevanz».
  CELEX-URLs gegen EUR-Lex geprüft. `src/lib/normtext/international-extern.ts`.
- Die 9 SR-0.*-Verträge stehen als **nur-live-link-Stubs** auf `/international`
  (EMRK, CISG, LugÜ, HZÜ, HBewÜ, HKÜ, FZA, VRK, UNO-Pakt II) — Quelle
  `scripts/normtext/bund-stubs-generieren.ts` LISTE.

## ERLEDIGT P1 — SR-0.* als Volltext (25.6.2026, LIVE + Prod-verifiziert)

8 von 9 promoviert nur-live-link → Volltext (CISG/LugÜ/HZÜ/HBewÜ/HKÜ/FZA/VRK/
UNO-Pakt II) via Fedlex-Pipeline (Pins+FEDLEX+register bund()+stub-LISTE bereinigt+
Manifest). `check:fedlex-versionen` = alle neueste Konsolidierung; adversarial
Snapshot-Artikel == Live-Fedlex-Anker; Gate grün; golden re-baselined.
**EMRK (0.101) NICHT promoviert (§8 Live-Link):** Fedlex liefert für die geltende
Konsolidierung (cc/1974/2151_2151_2151/20050323) nur eine ~9-kB-Shell OHNE
`<article>`-Anker → kein extrahierbarer Volltext. Für EMRK-Volltext braucht es die
korrekte (jüngere) Konsolidierung MIT Filestore-HTML — der SPARQL-Resolver gab nur
die leere Altfassung (Lektion [[lexmetrik-bund-volltext-ausbau]]).
**P3 (/gesetze-Redesign) ebenfalls erledigt** (International als 3. Säule, deployt).

## OFFEN P1-Rest — Referenz (ELIs, falls Re-Pin/EMRK-Fix nötig)

Geltende Fedlex-ELIs am 25.6.2026 via `npm run fedlex:eli` aufgelöst (Start-Pins;
**vor dem Pinnen je via `scripts/fedlex-cache.sh` + `check:fedlex-versionen`
gegenverifizieren** — die Lektion [[lexmetrik-bund-volltext-ausbau]] gilt: der
Resolver kann eine veraltete Fassung liefern, dann die date-geordnete
Taxonomie-Abfrage nehmen):

```
EMRK        0.101          cc/1974/2151_2151_2151|20050323
CISG        0.221.211.1    cc/1991/307_307_307|20260522
LugÜ        0.275.12       cc/2010/801|20160408
HZÜ         0.274.131      cc/1994/2809_2809_2809|20230612
HBewÜ       0.274.132      cc/1994/2824_2824_2824|20260101
HKÜ         0.211.230.02   cc/1983/1694_1694_1694|20240613
FZA         0.142.112.681  cc/2002/243|20201215
VRK         0.111          cc/1990/1112_1112_1112|20200508
UNO-Pakt II 0.103.2        cc/1993/750_750_750|20220509
```

**Verdrahtung (analog Bund-Batches, 5 Touch-Points) — Achtung Key-Normalisierung:**
Die Register-/Anzeige-Keys sind ASCII (`International.tsx` nutzt `LUGUE`, `HZUE`,
`HBEWUE`, `HKUE`, `UNO_PAKT_II`), NICHT die Sonderzeichen-Form aus der Stub-LISTE.
Volltext-Wiring MUSS die ASCII-Keys konsistent verwenden (FEDLEX-Key, ERLASS_MAP,
Snapshot-Dateiname, register-Eintrag):
1. `scripts/fedlex-cache.sh` — 9 Pins (Format `key|eli|kons|html-N|anker|SR`, SR = `0.*`).
2. `src/lib/fedlex.ts` — 9 FEDLEX-URL-Einträge (ASCII-Key).
3. `src/lib/normtext/register.ts` — 9 `bund(...)`-Einträge mit `rechtsgebiet:'international'` + `fedlexKey`.
4. `scripts/normtext-snapshot.ts` — `ERLASS_MAP` (cache-name → Snapshot-Key).
5. `scripts/normtext/bund-stubs-generieren.ts` — die 9 aus der LISTE entfernen.
Dann `npm run normtext -- --nur=bund --datum=$(date +%F)`; verifizieren:
`check:normtext`, `check:fedlex-versionen`, adversarial (Snapshot-art-IDs == Fedlex
`<article id="art_`); §8-Fallback (live-link) für jeden, den das Cache-Tor ablehnt.

## OFFEN P2 — «viel mehr» weitere SR 0.* kuratieren
Kandidaten: weitere Haager Übk. (0.211.221.*, 0.211.231.*), Rechtshilfe Strafsachen
(0.351.*), Doppelbesteuerung-Muster, NYÜ Schiedssprüche (0.277.12), UNO-Pakt I
(0.103.1), Kinderrechtskonvention (0.107), CEDAW (0.108), Anti-Folter (0.105),
weitere Bilaterale CH–EU. Pro Vertrag derselbe Pfad wie P1.

## OFFEN P3 — `/gesetze`-Übersicht neu designen (inkl. International)
`src/pages/Gesetze.tsx` so umbauen, dass Bund / Kantone / **International**
gleichwertige, scanbare Einstiege sind (heute ist International eine separate
Rubrik). Reine Darstellung (§3).

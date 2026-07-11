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

## ERLEDIGT P2 — 10 weitere SR 0.* als Volltext (25.6.2026, LIVE)

UNO-Pakt I (0.103.1), KRK (0.107), CEDAW (0.108), UN-Antifolter (0.105), Haager
Erwachsenenschutz HEsÜ (0.211.232.1), Haager Adoption HAdoptÜ (0.211.221.311),
PVÜ (0.232.04), ICAO (0.748.0), GFK (0.142.30), Staatenlose (0.142.40). Je ELI/
Kons + Filestore-HTML-Gehalt verifiziert; check:fedlex-versionen «alle Pins aktuell»
(3 Resolver-Altfassungen [Antifolter/PVÜ/Staatenlose] auf geltende Konsolidierung
nachgepinnt). Neue Rubriken «Asyl & Migration», «Weitere Spezialgebiete». International-
Volltext gesamt **18**, Bund 228. Gate grün, Prod verifiziert (KRK 54 Art.).

**STRUKTURELL NICHT MÖGLICH (Fedlex liefert nur ~9-kB-Shell ohne `<article>`):**
EMRK (0.101) — alle 10 Konsolidierungen 1982–2005 leer; NYÜ Schiedssprüche
(0.277.12) — leer. Beide bleiben §8-Live-Link (kein Volltext-HTML existiert).

## ERLEDIGT P4 — Fedlex-Portfolio Paket 4: 9 kuratierte Staatsverträge (10.7.2026, Roadmap W2·6)
Detailquelle/§11-Beleg: `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`.
Königsweg = bestehende konsolidierte `eli/cc`-Pipeline (kein `eli/treaty`-Extraktor,
kein neues Format/Skript). **9 neu als Volltext (rang 110–118):** HKsÜ 96 (0.211.231.011),
HUVÜ 1973 (0.211.213.02 — amtlich das Übk. vom 2.10.1973, nicht 2007), EAUe (0.353.1),
CMR (0.741.611), Montreal (0.748.411), RBÜ (0.231.15), UNO-BRK (0.109), Istanbul-Konv.
(0.311.35), Apostille (0.172.030.4). **POC-Befund:** SPARQL-Graph exponiert **keine**
strukturierte Vertragsparteien-/Ratifikations-Kante → «Geltungsbereich am …»-Anhang
verbatim als `annex_*` (deterministisch, nichts geraten); **html-0 bei 5/9 stale** →
kanonische html-N via `isExemplifiedBy` gepinnt (HUVÜ=3, EAUe=5, CMR=3, RBÜ=2, Istanbul=1,
Apostille=4); **Apostille geltend 2024-09-04** (Arbiter `check:fedlex-versionen`), nicht
die 2016er-Shell-Fassung. Testimonium «Zu Urkund dessen» (`schlussint`) bewusst als
nicht-normative Boilerplate in `check:p-klassen` dokumentiert. International-Volltext
gesamt **27**, Bund 227. Alle Tore grün; adversariale Gegenprüfung (Opus) bestanden.

**Bewusst NICHT gebaut (Scope-Disziplin):** ESÜ (0.211.230.01, durch HKsÜ überholt),
WÜD/WÜK (0.191.01/.02, Immunitäts-Nische), DBA-DE (0.672.913.62, Struktur-/Scope-Creep-
Risiko → eigenes DBA-Paket), EPÜ 2000 (0.232.142.2, kein HTML UND kein PDF/A → nur Live-Link).

## OFFEN — Extraktor-Ausbau Geltungsbereich/Vorbehalte (korpusweit, aus P4-Gegenprüfung 10.7.2026)
**Befund:** Der Fedlex-Extraktor erfasst den `<div id="annex">`-Anhang (`annex_*`), aber **nicht**
die separate `<div id="scope">`-Sektion — **`scope_u1` «Geltungsbereich am …»** (Vertragsstaaten/
Ratifikation/Inkrafttreten je Partei) und **`decl_u2`/`decl_u3` «Vorbehalte und Erklärungen (Schweiz)»**
(für die CH normativ). Betrifft **alle 27** Staatsverträge **korpusweit gleich** (die 18 deployten
droppen sie byte-identisch, verifiziert an KRK) — kein P4-Regress, sondern eine bestehende
Extraktor-Grenze. Bis dahin: vollständige Fassung inkl. Geltungsbereich/Vorbehalten über den
amtlichen Live-Link (§7c, nicht stumm — L0/§8). **Fix (eigene Bau-Einheit):** neuer
`<div id="scope">`-Scanner in `scripts/normtext/extrahiere-fedlex.ts` analog `alleAnhangAnker`
(dieselbe `extrahiereAnhang`-Block-Maschine), dann Re-Extraktion **aller** Staatsverträge (je
eigener Golden-Diff + Gegenprüfung; §6/§14.2). Risiko-Pfad, Opus.
**Priorität (Gegenprüfer-Hinweis 10.7.):** `decl_*` «Vorbehalte und Erklärungen Schweiz»
ZUERST — sie sind für die CH **materiell verbindliches Recht** (stabil); die `scope_*`-
Geltungsbereichs-/Parteien-Tabelle ist nachrangig (zeitveränderliche Verwaltungsdaten,
Fedlex führt dafür eine eigene Live-Fassung).

## OFFEN P2-Rest — noch mehr SR 0.* (optional, gleiche Mechanik + Gehalt-Test)
Kandidaten: weitere Rechtshilfe Strafsachen (0.351.*), Doppelbesteuerung-Paket (DBA,
kohärent statt einzeln), weitere Bilaterale CH–EU, WÜD/WÜK. Pro Vertrag derselbe Pfad.

## ERLEDIGT P3 — `/gesetze`-Übersicht neu designt (inkl. International) — Commit `0f9a9043`
`src/pages/Gesetze.tsx` umgebaut: Bund / Kantone / **International** sind
gleichwertige, scanbare Tab-Einstiege (`Ebene = 'bund' | 'kanton' | 'international'`,
International-Erlasse `rechtsgebiet === 'international'` im eigenen Tab — Auftrag
David 25.6.2026). Reine Darstellung (§3). *(Dieser Abschnitt war stale: oben Z.~29
bereits als erledigt vermerkt; STAND nachgeführt 28.6.2026.)*

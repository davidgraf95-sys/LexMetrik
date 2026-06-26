# Neue eidg. Gerichte — Recherche-Dossier (BVGer · BStGer · BPatGer)

**Erstellt:** 27.6.2026 (Nacht-Session, Auftrag 9 / Lane R Batch 3, ultracode-Fan-out, doppelt verifiziert).
**Stand der Quellen:** 27.6.2026.
**Status:** Erstrecherche, **READ-ONLY** — KEIN Produktiv-Code, kein Pipeline-Eingriff. Steuert den späteren Bau (nach A2 mehrsprachig). Alle Fakten `verifiziert:false`, Abnahme David offen.

Voraussetzung für den Bau: **A2 (mehrsprachige Extraktion)** ist gelandet — diese Gerichte publizieren stark FR/IT. Typ-Andockpunkt vorhanden: `gerichtstyp` kennt `bundesverwaltungsgericht`/`bundesstrafgericht`/`bundespatentgericht` bereits (`rechtsprechung/typen.ts`). Pipeline-Muster: `scripts/normtext-entscheide.ts` (neuer Quell-/Adapter-Zweig je Gericht analog `bgeKorpus`/`bundKorpus`).

**Gemeinsamer Nenner (alle drei):** URG Art. 5 → Gerichtsentscheide gemeinfrei (frei verwertbar; nur amtliche/anonymisierte Portal-Fassung übernehmen, kein Verlags-Layout). entscheidsuche.ch als Open-Data-Bulk-Kanal; das jeweilige Weblaw-/Gerichts-Portal als Currency-Arbiter (analog Fedlex↔Filestore). «Leitentscheid»-Flag strikt = amtliche Sammlung/Regeste (spiegelt den BGE-Fix «nur amtliche BGE»).

---

## A. Bundesverwaltungsgericht (BVGer / TAF), St. Gallen

**1. Quelle + Stand.** Amtliche Sammlung **BVGE** (= BGE-Pendant), Jahresband, 7 Sachgebiets-Rubriken. Dreistufig (Informationsreglement SR 173.320.4): **BVGE-Leitentscheide** (Art. 7: praxisändernd/präjudiziell + Abteilungskonsens, mit **amtlicher Regeste**) · **Referenzurteile** (kuratiert, nicht-amtlich, v. a. Asyl) · **übrige Urteile** (Art. 6, Masse). Portal: **`bvger.weblaw.ch`** (2023 erneuert; `jurispub.admin.ch` = Legacy/Fallback). Bulk: **entscheidsuche `CH_BVGer`**, PDF/A-1 + JSON-Metadaten.

**2. Regel deterministisch.**
```
Leitentscheid: entscheidsuche-Dateiname matcht ^CH_BVGE_001_  → leitentscheid=true (=BVGE)
  sonst gelistet unter bvger.ch/reference-judgments → kategorie='referenzurteil'
  sonst kategorie='urteil' (maschinell)
Geschäftsnummer: ^([A-F])-(\d{1,5})/((?:19|20)\d{2})$  (Dateiname '-'→'/' normalisieren)
  Abteilung A→I … F→VI (Buchstabe = röm. Abteilung):
    A/I Infrastruktur·Abgaben·Personal · B/II Wirtschaft·Wettbewerb·Bildung·IGR·FINMA
    C/III Gesundheit·Sozialvers. · D/IV Asyl · E/V Asyl · F/VI Ausländer-/Bürgerrecht
  letztinstanzlich = Abteilung ∈ {D,E} (Asyl, kein Weiterzug ans BGer)
Regeste-Block NUR bei BVGE rendern; Referenz-/übrige: kein Regeste-Kasten (nicht erfinden).
```

**3. Geltungsbereich / Sprachen.** DE ≈ 69 % · FR ≈ 23 % · IT ≈ 7 % (Personalsprache GB24 als Proxy; Asyl-Abteilungen D/E/F überproportional FR/IT) → **Mehrsprachigkeit zwingend**.

**4. Pflegebedarf / unbestätigt.** `CH_BVGE_001_`-Präfix-Semantik stichprobenartig gegen amtliche BVGE-Bandzitierung verifizieren (Quarantäne wie OCL-Quirks); echte Urteils-Sprachquote am `CH_BVGer`-Dump auszählen; `entscheidsuche-mcp` (Beta `mcp.entscheidsuche.ch`) als möglicher Kanal.

**5. Kandidaten (neueste BVGE, nur zur Bestückung):** E-1270/2026 (21.4.2026, Asyl) · A-259/2025 (13.4.2026, I) · **F-2801/2025** (30.3.2026, VI, PDF gefetcht) · C-437/2026 (12.3.2026, III) · D-390/2026 (29.1.2026, Asyl). Sprache je Fall am PDF bestätigen.

---

## B. Bundesstrafgericht (BStGer / TPF), Bellinzona

**1. Quelle + Stand.** Amtliche Sammlung **TPF** (seit 2004; Auswahl bedeutendster Entscheide, mit Regeste; Zitat «TPF [Jahr] [Seite]»). StBOG SR 173.71 + Informationsreglement SR 173.711.33. **Alle Entscheide anonymisiert** (Art. 63 II StBOG). Drei Kammern: **Strafkammer · Beschwerdekammer · Berufungskammer** (letztere seit 2019). Portal **`bstger.weblaw.ch`** (2021 modernisiert; deterministische PDF-URL `pdf/{YYYYMMDD}_{KAMMER}_{YYYY}_{NN}.pdf`; interne `api/getDocumentContent/{uuid}` undokumentiert). Bulk: entscheidsuche **`CH_BSTG`** + JSON-Sidecar.

**2. Regel deterministisch.**
```
Leitentscheid: amtliche Regeste/Kopfzeile vorhanden ODER in Sammlung TPF → true
Geschäftsnummer (amtl. Merkblatt, 17 Präfixe): PREFIX.YYYY.NN
  Regex (beide Notationen, Punkt + Bindestrich, Jahr 2-/4-stellig, Reihenfolge tolerant):
    ^(SK|SN|BB|BE|BG|BH|BP|BV|RR|RH|RP|CA|CN|CR)[.\-](\d{2,4})[.\-](\d{1,4})$
  Kammer-Routing: Strafkammer SK|SN · Beschwerdekammer BB|BE|BG|BH|BP|BV|RR|RH|RP
                  Berufungskammer CA|CN|CR · Verwaltung GG|GL|GS → VERWERFEN (keine Rsp.)
  Nicht-Match → Quarantäne (kein erfundenes Mapping; Adversarial-Check pflicht: Kollision/Inversion).
```

**3. Sprachen.** DE/FR/IT (Verfahrenssprache nach Parteien/Bundesanwaltschaft, NICHT Sitzkanton); DE dominiert, FR mittel, IT Minderheit (Punktquote unbestätigt → am `CH_BSTG`-Dump auszählen). IT-Rendering testen.

**4. Pflegebedarf / unbestätigt.** Leitentscheid-Flag je Fall gegen TPF-Sammlung/Regeste bestätigen (Portal ist JS → **Playwright via Bash**, nicht WebFetch); Endpoint-Stabilität/robots prüfen, primär entscheidsuche-Bulk; `bstger2.weblaw.ch`-Rolle offen.

**5. Kandidaten (zur Bestückung):** CA.2024.39 (16.4.2025, Berufungsk., PDF verifiziert) · CA.2025.22 (19.9.2025, Beschluss, PDF verifiziert) · CA.2023.32 (4.4.2024, prominent, Vorinstanz SK.2023.33). TPF-Leitentscheid-Status je Fall noch zu bestätigen.

---

## C. Bundespatentgericht (BPatGer / TFB), St. Gallen

**1. Quelle + Stand.** **Vollpublikation, grundsätzlich NICHT anonymisiert** (Art. 25 PatGG + IR-PatGer — Umkehr des CH-Defaults; Anonymisierung 1:1 übernehmen, keine eigene De-Anon.). **Keine amtliche Sammlung** (Zitat nach Geschäftsnummer). Kuratierte Rubrik **«Leitentscheide»** (`/rechtsprechung/leitentscheide`, ~22 gelistet) → sauberes Boolean-Flag. Statt Regeste: redaktionelle Metadaten (Stichwort/Gegenstand/Technisches Gebiet=IPC). **Kleiner Korpus** (~14 Urteile/Jahr × 14 J. = niedrige Hunderte) → **Voll-Ingest ohne Sampling**. Primärquelle = Gerichtswebsite `bundespatentgericht.ch` (kanonische PDFs `fileadmin/entscheide/<name>.pdf`, Detail `entscheidanzeige/<ID>/`); entscheidsuche `bpatger` ist neu JS-SPA (Roh-Dateilinks → `/altsystem`-Redirect) → nur Cross-Check/MCP.

**⚠ Verwechslungsgefahr:** schweizerisches Gericht (`.ch`, Geschäftsnr. `O…/S…`) ≠ deutsches Bundespatentgericht (`.de`, München) — `.de`-Treffer irrelevant.

**2. Regel deterministisch.**
```
Geschäftsnummer: ^[OS]20\d{2}_\d{3}(?:-\d{3})?$   (entscheidsuche-Suffix '-<id>' vorher strippen)
  O → ordentlich · S → summarisch (nur O/S in 2012–2026 belegt; Parser defensiv [A-Z]-Fallback)
  koordinierte Verfahren: Bereichs-/Mehrfachnr. als Array, ein Primär-Key
Leitentscheid = Geschäftsnr. steht in Liste /rechtsprechung/leitentscheide (sonst false)
Sprache: AUS PDF-INHALT detektieren, NICHT aus Dateiname  (Lehre: O2024_007-"Decision" ist faktisch FR)
Entscheiddatum: Feld «Entscheiddatum» (DD.MM.YYYY), NICHT das Rechtskraft-/BGer-Datum
PDF-URL nicht raten → fileadmin-Link von der Detailseite extrahieren
```

**3. Sprachen.** DE ~77 % · FR ~16 % · IT ~7 % (GB25; IT selten bis fehlend). Englisch nie Urteilssprache (nur Partei-/Verhandlungssprache) → Modell `de|fr|it`, optionales Attribut `verhandlungssprache_en`.

**4. Pflegebedarf / unbestätigt / Burggraben.** Mehrsprachige Regeste je Leitentscheid unbestätigt (am PDF prüfen); Jahres-Splitpfade 2025/26 teils 404 → über `aktuelle-entscheide` crawlen. **Feld `bger_verweis`** (BGer-Az. auf der Detailseite) als Live-Link in die bestehende BGer-Rubrik = Instanzenzug BPatGer→BGer (Norm-Verzahnung PatG/PatGG/EPÜ).

**5. Kandidaten (neueste, PDF 200 verifiziert):** **O2024_007** (23.4.2026, ordentlich, **FR** am PDF bestätigt) · O2025_005 (15.1.2026, Verfügung) · S2023_011 (4.12.2025, summ. Urteil) · O2024_002 (12.8.2025, Nichtigkeit) · S2024_005-007 (8.7.2025, 3 koordinierte Verfahren).

---

## Bau-Reihenfolge (Empfehlung)

1. **A2 mehrsprachig** muss stehen (FR/IT). 2. BStGer + BVGer teilen das entscheidsuche-Bulk-Muster (`CH_BSTG`/`CH_BVGer`, JSON-Sidecar) → ein gemeinsamer OCL-/entscheidsuche-Adapterzweig, je Gericht ein Geschäftsnummer-Parser + Leitentscheid-Klassifikator. 3. BPatGer separat (eigene Gerichtswebsite-Quelle, kleiner Voll-Ingest, IPC-Feld, `bger_verweis`-Verzahnung). 4. B2-Golden je neuer (Gericht×Sprache)-Zelle erweitern; A3 Sitemap/Prerender/Suche mitziehen. Adversarial: Geschäftsnummer-Parser gegen beide Notationen, Leitentscheid-Flag stichprobenartig gegen amtliche Sammlung.

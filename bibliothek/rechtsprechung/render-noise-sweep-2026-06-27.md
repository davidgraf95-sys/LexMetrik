# Render-Noise-Sweep über den Entscheid-Korpus (B1)

> **Auftrag:** JETZT-MACHEN §4.2 (Lane R · Batch 1 · B1). Adversarialer,
> **read-only** Sweep über den GANZEN Entscheid-Korpus nach der Bug-Klasse
> «Render-Noise». Diese Liste **steuert A1/A2** in der Folge-Session — sie
> enthält **keinen** Code-Fix (die Fixes sind A1/A2/A3).
>
> **Status (Abnahme):** Erstrecherche + adversarialer Gegendurchgang (zweifach,
> Mengenangaben empirisch belegt). Fachliche Einzelabnahme: **David, offen**
> (`verifiziert:false`). Abnahme-Zeitsperre bis 1.12.2026 beachtet.

## 1. Quelle + Stand

- **Korpus:** `public/rechtsprechung/**/*.json` — **327 Entscheid-Snapshots**
  (272 BGE + 25 BGer + 30 kantonal) am **27.6.2026** (Worktree
  `worktree-agent-a5ba606cae15e98b8`, abgebrancht von `main` @ `d76b6b82`).
- **Methode:** deterministischer node-Sweep über jeden Snapshot (Felder
  `abschnitte` = VOLL-Urteil und `auszugAbschnitte` = amtlicher BGE-Sammlungs-
  Auszug), Befunde je Bug-Klasse quantifiziert + stichprobenartig im Kontext
  verifiziert. Marker-Regex identisch zur Strip-Regel `sachverhalt.ts:27`
  (`/\bBGE\s+\d+\s+[IVXLCDM]+\s+\d+\s+S\.\s*\d+/`).
- **Gegenprüfung (§ doppelt-verifizieren):** jede Mengenangabe zweimal
  abgeleitet; die «Fussnoten-Leak»-Heuristik wurde dabei als **Falsch-Positiv**
  entlarvt (s. Klasse D).

## 2. Befunde je Bug-Klasse (deterministisch, mit Mengen + IDs)

### Klasse A — Inline-Seitenmarker `BGE … S. ###` (→ A1)
**Befund:** Kolumnentitel der amtlichen Wiedergabe stehen **mitten im Satz** im
Fliesstext, ausschliesslich in **Erwägungs-Blöcken** (nicht im Sachverhalt — dort
greift `entrauscheSachverhalt`).

| Geltungsbereich | betroffene Entscheide | Belegbeispiel |
|---|---|---|
| `auszugAbschnitte` (BGE-Auszug) | **261** | praktisch jeder BGE mit Auszug |
| `abschnitte` (VOLL-Urteil) | **16** | `151_I_41` (17×), `151_V_30` (28×), `151_V_100` (24×), `151_I_73` (17×), `150_II_334` (8×), `150_I_183` (5×), `151_III_336` (4×), `151_IV_316` (5×), `152_V_2` (17×), `152_V_20` (17×), `151_II_710` (13×), `150_III_219`, `151_II_154`, `151_II_657`, `152_III_103`, `bger/5A_543_2017` |
| **Union (mind. eine Stelle)** | **273** (272 BGE + 1 BGer) | — |
| davon in **beiden** Feldern | 4 | — |
| im **Sachverhalt** (abschnitte) | **0** | (Strip greift dort bereits) |

**Kontext-Beleg (`151_I_41`, erwaegung):**
`«…gemäss Art. 82 lit. c BGG das BGE 151 I 41 S. 45 Beschwerderecht…»`

**Steuerung für A1 (Korrektur am Plan):** JETZT-MACHEN §4.3 nennt nur den
Auszug-Pfad und «0 in abschnitte» (verifiziert nur an `152_I_105`). **Der Sweep
korrigiert das:** A1 muss die Marker **in BEIDEN** Feldern aus dem Satzfluss
lösen (Default F2: dezent erhalten, randständig/hochgestellt). Render-Andock:
`EntscheidBody.tsx` Erwägungs-Rendering (`Erwaegungen`, Z. 60–105), wirkt auf
`abschnitte` UND `auszugAbschnitte` (beide laufen durch `EntscheidBody`,
`EntscheidLeser.tsx:198/376`). Display-first, kein Daten-Regen nötig.

### Klasse B — Falsche Sprach-Labels FR/IT als `'de'` (→ A2)
**Befund:** **4** Entscheide tragen `sprache:'de'`, ihr Body ist aber durchgehend
**französisch** (Token-Verhältnis FR≫DE, manuell gegengeprüft). **Korrigiert die
Plan-Prämisse** «genau EIN FR-Body (`152_I_105`)» (JETZT-MACHEN-Kopf/§4.4) — es
sind **vier** (§7: Abweichung offengelegt).

| ID | sprache (Ist) | Body | FR/DE-Token | erste Zeile |
|---|---|---|---|---|
| `bund/bge/151_IV_357` | `de` | **fr** | 317 / 1 | «Par jugement du 5 février 2024, le Tribunal correctionnel…» |
| `bund/bge/152_II_75` | `de` | **fr** | 436 / 0 | «A. A.a. Le 11 août 2020, le Service israélien…» |
| `bund/bge/152_II_98` | `de` | **fr** | 805 / 11 | «A. A.a. B.A.________ et A.A.________, alors mariés…» |
| `bund/bge/152_I_105` | `de` | **fr** | 693 / 11 | «A. À la suite de deux dénonciations de l'Office fédéral…» |

**IT-Bodies:** **0** im Korpus (geprüft, keine `it`-Mislabels).

**Steuerung für A2:** `sprache` aus dem **Body** bestimmen (nicht aus dem OCL-
Record kopieren), Start-Marker + Rubrum-Labels mehrsprachig (FR: Faits/En fait,
Composition, Parties, Objet, recours … contre), dann **diese 4** regenerieren.
B2-Golden fängt die DE-Regression; die fr-Zelle in B2 (`152_I_105`) ist bewusst
auf den **Vor-A2-Zustand** eingefroren und wird mit A2 deklariert gehoben.

### Klasse C — Abgeschnittene / fehlende Sachverhalte (`vollstaendig:false`) (→ A2)
**Befund:** **7** Entscheide. Aufteilung:
- **5** überschneiden Klasse B bzw. FR-Extraktion: die 4 FR-Bodies oben +
  `152_I_61` (deutsch, Quelle gibt **keinen** Sachverhalt: «Es wird kein
  Sachverhalt wiedergegeben.» — ehrlich, **kein Bug**).
- **2** echte deutsche/ kantonale Kappungen:
  - `bund/bger/2C_128_2007` — deutscher Sachverhalt vorhanden, aber als
    OCL-Auszug markiert (mild; A2/A3 prüfen).
  - `kanton/AG/ag_gerichte/HOR_2024_19` — **mis-gestarteter** Sachverhalt
    (beginnt mitten im Satz: «gleichzusetzen.27 2.4. Bezeichnung von
    Beweismitteln…») → s. Klasse D.

### Klasse D — Fussnoten-Leak
**Befund (zweistufig, §-doppelt-verifiziert):**
- **Heuristik-Falsch-Positiv:** ein erster `\bFn\.\s*\d`-Scan flaggte 41
  Entscheide — **alle** sind legitime **Doktrin-Zitate** im Urteilstext
  («…, 6. Aufl. 2019, Rz. 181 Fn. 431…»), **kein** Render-Leak. Diese 41 sind
  **kein** Befund.
- **1 echter Leak:** `kanton/AG/ag_gerichte/HOR_2024_19` — eine
  **hochgestellte Fussnoten-Zahl** klebt am Wort («gleichzusetzen.**27**»), ein
  PDF-Extraktions-Artefakt (kantonale PDF-Quelle). Isoliert; **A1-Folge:**
  kantonale Bodies gezielt auf «Wort.Ziffer»-Superscript-Glue scannen, nicht den
  Bund.

### Klasse E — Regeste-Leak / verirrte Marker / Roh-Marken
**Befund:** **0**. Kein Body-Block beginnt mit «Regeste/Regesto» (0); keine
`marke` ausserhalb des Musters `E. x.y` / `A.` / `A.a` / `N.` (0 verirrte
Marken). Die `marke`-Disziplin ist sauber.

## 3. Geltungsbereich und Ausnahmen

- Gilt für den Korpus-Stand 27.6.2026 (327 Snapshots). Neue Gerichte (A9,
  Batch 3) und neue Quellen sind **erneut** zu sweepen (Sweep ist read-only,
  reproduzierbar).
- Bund-Snapshots stammen aus OpenCaseLaw (`bge`/`bger`); kantonale aus
  PDF/LexWork — die Bug-Profile unterscheiden sich (Bund: Seitenmarker;
  Kanton: PDF-Superscript-Glue).

## 4. Pflegebedarf

- **Re-Sweep** nach jedem Korpus-Regen (A2-Regeneration der 4 FR-Bodies; A9
  neue Gerichte). Die Mengen oben sind datiert (27.6.2026) → bei Regen neu
  zählen.
- Nach A1: die Union-Zahl 273 muss auf **0** fallen (Marker im Render gelöst);
  nach A2: Klasse B muss auf **0** fallen (4 FR korrekt `fr`).

## 5. Abnahme-Status

**Erstrecherche + adversariale Gegenprüfung (zweifach).** Mengen empirisch
belegt (Sweep-Ausgaben im Commit-Kontext). **Kein** Eintrag ist juristisch
«geprüft»; alles `verifiziert:false`. **Fachliche Einzelabnahme: David, offen
(`TODO(David)`).**

## 6. Priorisierte Fix-Liste (steuert A1/A2/A3)

| Prio | Fix | Klasse | betroffen | Andockpunkt |
|---|---|---|---|---|
| **1** | Seitenmarker aus dem Satzfluss lösen (dezent erhalten) **in `abschnitte` UND `auszugAbschnitte`** | A | **273** | `EntscheidBody.tsx` `Erwaegungen` (Z. 60–105) |
| **2** | `sprache` aus Body + mehrsprachige Extraktion, 4 FR-Bodies regenerieren | B/C | **4** | `scripts/normtext/adapter-entscheide.ts` (Start-Marker Z. 87, Rubrum-Labels Z. 137–141, `sprache` Z. 242/389) |
| **3** | kantonale PDF-Superscript-Fussnote («Wort.27») + mis-gestarteter SV | C/D | **1** (`AG/HOR_2024_19`) | kantonaler PDF-Adapter (A1-Folge, Kanton-only) |
| — | Regeste-Leak / verirrte Marken | E | **0** | (kein Handlungsbedarf) |

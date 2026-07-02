# Spec: Verlässliche Normtext-Umwandlung Bund (HTML/AKN-XML → NormSnapshot)

**Datum:** 2026-07-02
**Status:** final (Council 30.6.2026 + Chairman-Synthese 2.7.2026 + 7 Bug-Klassen-Gegenprüfungen + 3 Design-Gegenprüfungs-Linsen)
**Heimat des Architektur-Entscheids:** `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Quell-Architektur (~Zeile 185–254)
**Ziel-Schema:** `src/lib/normtext/typen.ts` (NormSnapshot), Sidecars `scripts/normtext/fussnoten-extrahiere.ts:19-25` (Fussnote), `src/lib/normtext/browse.ts:136-142`

---

## 0. Nordstern & Akzeptanzkriterien (Ziel David 2.7.2026)

**Ziel ist nicht bloss Fehlerfreiheit, sondern das _einwandfreie_ Gesetz — messbar BESSER als Fedlex, lexfind.ch, admin.ch und kommerzielle Reader.** Die ganze Spec wird an zwei sichtbaren Muss-Kriterien gemessen; jedes ist mit dem amtlichen Normtext identisch (§1: keine Inhaltsänderung), aber in Struktur/Darstellung überlegen:

- **AK-1 — Tabellen einwandfrei formatiert.** Spalten/Header/Steuertarife exakt und lesbar (auch mobil), mehrspaltige & verschachtelte Tabellen strukturtreu, nie Text-Wirrwarr. _Geliefert durch:_ R8 (§3) + `check:tabellen`/`check:akn-containment`-Tabellen-Rechteck (§4).
  _Besser als die Quelle konkret:_ (a) selbstschliessende `<td/>`/`<th/>` als Leerzelle statt Spaltenversatz (128× SSV.xml, im Fedlex-Rendering versetzt); (b) NBSP/U+202F→U+0020- und Bruch-Schutz gegen die «1/3»→«/3»- und `[tab]`-Korruption, die **die Quelle selbst** trägt (23× `[tab]` heute in 11 Prod-Goldens, symmetrisch in HTML+XML — §4 Stufe 2 Artefakt-Register); (c) Kopf-Variante B strukturerhaltend rekonstruiert, wo das XML sie verliert.
- **AK-2 — Links zielgenau verlinkt.** Interne `#art`-Sprünge UND Fremdgesetz-Verweise via ELI, alles klickbar auf den richtigen Erlass, nichts totes/falsches (kein falscher Self-Link N2). _Geliefert durch:_ R11 (§3) + eId↔`<num>`-Arbiter (§4) + Verweis-Chips (M12-Erweiterung, §6 Risiko 1/2).
  _Besser als die Quelle konkret:_ Fedlex lässt Body-Zitate **bare** (empirisch 0 interne `<ref>` in allen 7 Samples, ELI nur im Fussnoten-Apparat) — LexMetrik macht sie navigierbar; zusätzlich **Weblink-Passthrough** für Nicht-Fedlex-`<a>` (SSV annex_1: vss.ch/astra.admin.ch), die der heutige Extraktor irreversibel strippt.

**Leitplanke:** «besser als die Quelle» heisst bessere Struktur/Darstellung/Navigation, nie Inhaltsänderung (§1); jede Abweichung vom Golden ist ein einzeln belegter, gewhitelisteter Fidelity-Gewinn (§5).

> **Provenienz dieses Abschnitts:** redaktionell aus dem verifizierten Spec-Körper (Läufe 1–2, 30 Fable-Agenten) synthetisiert, nachdem der Nordstern-Resume ins Session-Limit lief (reset 15:00). Die eigenständige 4. Gegenprüfungs-Linse «Tabellen+Links besser-als-Fedlex» ist als Resume verfügbar; ihr Prüfgegenstand (AK-1/AK-2) ist in R8/R11/§4 bereits belegt.

---

## 1. Executive Summary / Verdikt

**Verdikt: Hybrid — präzisiert als «XML-Träger, HTML-Arbiter» mit harter Demarkationslinie.**

- **Nicht HTML-härten:** Die schwerste offene §1-Klasse (Silent-Drop der alternierenden Block-Regex, `scripts/normtext/extrahiere-fedlex.ts:168-179`) ist im HTML prinzipiell nicht dicht zu bekommen. Prod-Beleg: `public/normtext/bund/OR.json`, `bund/OR/art_361` endet nach «…abgewichen werden:» — die komplette ~20-zeilige Aufzählung der zwingenden Vorschriften fehlt, weil die `<p class="man-template-tab-krpr">` keine der 6 Regex-Alternativen treffen; identisch `art_362`, Attributionsverlust in `art_77` (Fortsetzungs-`<p>` als `absatz:null`-Block). Im HTML sind Absätze keine Container — Vollständigkeit ist dort unprüfbar. Nur im XML lebt jedes `<p>` in genau einem `<paragraph eId>/<content>`-Container.
- **Nicht XML-primär (als Label):** 5/7 Bug-Klassen-Gegenprüfungen widerlegten naive XML-Vertrauensannahmen: `StGB.xml art_36/para_3_5` mit `<num>3–5</num>` → mechanische eId-Regel liefert die Zahlfälschung «35»; KKG generiert **eId-lose** `<paragraph>`/`<item>` (105/70 Stück) und leakt Fussnoten-Körper in den `<num>`-Slot («SR 241», 46 statt 48 Noten); `OR.xml art_624/para_2_3` trägt den Sprach-Leak «2 e 3»; die ZGB-XML-Rendition n=0 war STALE (fehlte AS 2026 94). Reines XML ohne HTML-Arbiter erzeugt eigene §1-Fälschungen.
- **Demarkationslinie:** Pro Erlass trägt genau **EINE** Quelle den Normtext (`source=akn|html` je Cache-Zeile in `scripts/fedlex-cache.sh`, nie Vermischung innerhalb eines Erlasses). Für akn-Erlasse ist HTML **nie** Normtext, sondern nur (i) Verifikations-Gegenanker und (ii) Spender für exakt drei enumerierte Nur-HTML-Signale:
  1. sichtbare Fussnoten-Nummern (`<authorialNote>` ist in allen 7 Samples attributlos — keine Nummer, kein eId),
  2. Tabellen-Kopf Variante B (`man-template-tab-kpf` — im XML strukturell unerkennbar, sonst exakte G20-Regression, Beleg GEBV_SCHKG art_30: XML hat kein `<th>`, keine Klasse),
  3. `class="bild"`-Standalone-Marker (XML kennt keinen expliziten Bild-Absatz-Marker).
  Dazu die Arbiter-Rolle bei Generatordefekten (KKG-Klasse → Erlass dauerhaft auf HTML-Adapter, geflaggt).
- **Wichtigste Korrektur aus den Design-Gegenprüfungen:** Das Tor zertifiziert Treue zur **Manifestation**, nicht automatisch zum amtlichen Normtext. Generator-Artefakte, die beide Formate teilen (97× `<placeholder …>[tab]</placeholder>` in SSV.xml ≡ `<span data-message="E40S10-TAB">[tab]</span>` im HTML; heute schon 23× `"marke":"[tab]"` in 11 Prod-Goldens, u.a. KLV Art. 5), passieren symmetrisches Containment grün. Deshalb: Artefakt-Negativ-Lexikon + Wortgrenzen-Check + Generator-Generations-Fingerprint als Pflichtbestandteile der Verifikations-Architektur (§4).

Migrationsmodus: inkrementell pro Erlass, nie Big-Bang, golden byte-gleich als Tor (§5). Erster Bau-Schritt ist rein HTML-seitig und fixt 6+ Prod-Blöcke sofort (§7).

---

## 2. Quell-Vergleich pro Bug-Klasse

| Bug-Klasse | HTML | XML | Verlässlichere Quelle | Regel (nach Gegenprüfung) |
|---|---|---|---|---|
| **artikel-nummer-suffix** («329g», «1bis»; Abgrenzung m², 72³, 133¹⁄₃) | Suffix nur in Anker-id + Positions-Heuristik; LIVE-BUG: `<sup>1</sup><sup>bis</sup>`-Split → 6 defekte Blöcke in 5 Prod-Snapshots (GEBV_SCHKG art_9, HMG art_9/67, KLV art_7, CO2 art_16, VRV art_67) | eId trägt Suffix strukturell (`art_329_g_bis`, `para_1_bis`) + dediziertes `<num>` — ABER Bereichs-eIds gleicher Grammatik (`para_3_5` = «3–5») → Zahlfälschung «35» bei naiver Konkatenation | **xml, mit `<num>`-Arbiter** | Verkleben NUR bei Suffix-Whitelist (bis/ter/quater/quinquies/…/[a-z]); alles andere wörtlich aus tag-gestripptem `<num>` (nach authorialNote-Exzision); Divergenz eId↔`<num>` ausserhalb Whitelist = harter check-Fehler |
| **fussnoten** (Leak, Zuordnung, Klick-Popover) | Marker/Körper-Split mit explizitem ID-Paar `fnbck-X`↔`fn-X` + sichtbarer Nummer; Zuordnung braucht balancierten dl-Walk (`fussnoten-extrahiere.ts:90-139`) | atomar inline (`<authorialNote>` am Wort), aber ATTRIBUTLOS (keine Nummer); KKG-Generatordefekt: Fussnote im `<paragraph><num>`-Slot, 46 vs. 48 | **hybrid** | Struktur/Position aus XML, nr+Text-Verifikation gegen HTML; Textvergleich **whitespace-FREI** (alle `\s` strippen — 0/3156 Mismatches empirisch; whitespace-*normalisiert* reicht NICHT: OR fn 912, DBG fn 318 haben im XML fehlende Leerzeichen); Zähl-Mismatch = Generatordefekt → Quarantäne, Text-Mismatch = Whitespace-Klasse → punktuell HTML-Text |
| **tabellen** (Spalten, Header, verschachtelt, Tarif-Zahlen) | Gitter zellgenau identisch; Kopf Variante B NUR hier (`man-template-tab-kpf`); Tausendertrenner als `&nbsp;` | Gitter identisch; `fedlex:function="layout"` explizit am `<table>`; Kopf Variante B strukturell unerkennbar; rohes U+00A0; selbstschliessende `<td/>` (128× SSV.xml) | **hybrid** | Gitter+Zahlen aus XML mit U+00A0/U+202F→U+0020-Normierung; Variante-B-Kopf NUR aus HTML-kpf-Signal (gekeyt Artikel+Tabellen-Index); `<td/>`/`<th/>` = Leerzelle (sonst Spaltenversatz SSV annex_1); authorialNote-Exzision in Zellen; sup/sub-Bruch-Schutz («1/3» nie →«/3») |
| **bild-formel** (img-Drop, Piktogramm vs. Datentabelle, Formel-Flag) | expliziter `class="bild"`-Marker; Kachel via dt/dd-Regex; Attribut-Benennung konsistent | `<p>` mit einzigem `<img>`-Kind; Kachel via `<item><num>` sauberer; ABER page-/text-width HTML↔XML VERTAUSCHT; Anhänge in `<component><doc>` | **hybrid** | Inventar quellenäquivalent (Bytes identisch, sha256-verifiziert); explizite `fedlex:original-*`-Regexe, nie kreuzdiffen; Inline-`<img>`-Offsets mitführen (LRV-annex_3-Formel-Korruption «G_M = G_1 × + G_2 ×…» ist QUELL-AGNOSTISCH offen → M14, nicht «durch XML gelöst») |
| **verweise-eli** (interne vs. Fremd-Verweise, N2) | Body-Zitate bare; ELI nur im Fussnoten-Apparat; ABER dritter Kanal: echte Body-`<a>` (SSV annex_1: www.vss.ch, www.astra.admin.ch) | identische Zweiteilung; `<ref href=eli>` nur in authorialNote; 0 interne `<ref>` in allen 7 Samples (OR: 2315 = 79 cc + 1260 oc + 976 fga, 0 Self) | **hybrid** | eli/cc→intern (SR_INTERN), eli/oc\|fga→extern; **dritte Klasse Nicht-Fedlex-http(s) → Weblink-Passthrough, href ERHALTEN** (heute strippt INLINE_STRIP_TAGS das `<a>` → irreversibler Verlust); N2-Suppression render-seitig unverändert — XML liefert kein Freilos |
| **aufgehoben-eid** (Stubs, Bereichs-eIds, Status) | «aufgehoben» nur indirekt (Absenz nach Heuristik-Strip); `absatzkurs` matcht `\babsatz\b` nicht → Typ B nur via Fallback | drei strukturelle Typen; ABER disp-Artikel verschachteln `article>content>paragraph` (83 OR, 178 ZGB) und Typ C (leeres `<content/>`, OR disp_u16/art_4) fehlt in naiver Typologie; kein `status="`-Attribut (grep = 0) | **xml, mit disp-Zweigen** | Typ A: kein descendant-`<paragraph>` → '…'; Typ B: Ganz-Block `<p>Aufgehoben</p>` (nie Substring — SSV art_22 «…aufgehoben» in lebendem Text!); Typ C: leeres `<content/>` in disp-Paragraph → '…'; DESCENDANT-Suche pflicht; eId-Slash→Underscore (`disp_u16/art_4`→`disp_u16_art_4`) |
| **vollstaendigkeit** (Absätze lückenlos, Items komplett) | alternierende Regex mit Silent-Drop-Klasse (OR art_361/362 Prod-Bug); KKG-Absätze klassenlos | Container-Struktur macht Drop unmöglich; ABER KKG komplett eId-los; DBG art_92 `bull_u*` ohne lbl + je 2 `<p>`; Bereichs-nums «3–5»; SSV art_14 para_3 fehlt als Slot (in para_2 inline) | **xml, mit Positions-Fallback** | Text = ALLE direkten `<p>`-Kinder von `<content>`; marke/absatz aus `<num>` (nach authorialNote-Exzision), eId nur Schlüssel mit Positions-Fallback; tiefe = blockList-Verschachtelungstiefe (nicht lbl-Zählung); item-text = ALLE `<p>`; Lückenlosigkeits-Check nur WARNUNG mit Bereichs-/Kollaps-Toleranz |
| **whitespace/N1** (`<br>`, `<inline>`, zerrissene Wörter) — *neu aus Design-Gegenprüfung L1* | `<br>` 563× OR; Extraktor hat expliziten Fix (Block-Tags→' ', Inline-Tags→'', `extrahiere-fedlex.ts:623`) | 13× «Wort`<br/>`Wort» ohne Leerzeichen (OR-Randtitel); OR art_592/para_2: Wörter über 4 adjazente `<inline>` zerrissen («Ge\|schäft») | **keine — Konkatenations-Regel** | `<br>`→' ', `<inline>`-Verkettung fugentreu, `<placeholder>`→''; whitespace-freie Prüfungen sind für diese Klasse per Konstruktion blind → Wortgrenzen-/Token-Multiset-Check nötig (§4 Stufe 3b) |
| **placeholder/[tab]** — *neu aus Design-Gegenprüfung L2/L3* | `<span data-message="E40S10-TAB">[tab]</span>`, dieselbe Korruption; 23× `"marke":"[tab]"` in 11 Prod-Goldens (KLV/AHVV/VTS 9×/ZPO…) | 97× `<placeholder fedlex:message="E40S10-TAB">[tab]</placeholder>` in `<num>`-Slots (SSV.xml) | **keine — symmetrische Korruption** | Placeholder-Exzisions-Regel + `[tab]`/`data-message`-Negativ-Lexikon als quell-symmetrie-unabhängige Tor-Invariante; Containment allein sieht diese Klasse NICHT |
| **generator-generation** — *neu aus Design-Gegenprüfung L2/L3* | fn-ID-Schemata divergieren (`fn-d7e13` vs. `fn-d282453e15`); html-99 = HTTP 200 mit 9148-B-Fehlerseite | koexistierende Generationen desselben Kons-Stands: SSV xml 497254 B vs. -2 532428 B (66 item/num/p-Delta); `fedlex:generator="2024-q4-rel-1.6.5"` nur im XML | **keine — Pin-Problem** | «gleicher n-Index» ist kein inhaltsstabiler Pin; Quell-Sonde um Generator-Generations-Fingerprint erweitern; alle empirischen Anker (0/3156, 28–58 %) gelten nur je Generation |

---

## 3. Das Umwandlungs-Regelwerk (AKN → NormSnapshot)

Kanonisches Prinzip: **eId = Schlüssel (mit Positions-Fallback), `<num>` = Anzeige-Wahrheit, nie eId-Segmente zu Nummern konkatenieren. authorialNote-Exzision VOR jeder num-/text-/Zell-Ableitung. `<placeholder>`-Exzision überall.**

### R1 — Manifestation & Quell-Sonde
Gleicher {eli}/{kons}-Pin + **gleicher n-Index wie das verifizierte HTML**, Pfad `/de/xml/…-xml[-N]`. Sonde: `<akomaNtoso>`-Root-Signatur + `FRBRnumber == SR` + Grössenschwelle + Inhalts-Sonde (ZGB-Lektion: n=0 war stale trotz 200 + plausibler Grösse; n=2 = SPA-Shell) + **Generator-Fingerprint** (`fedlex:generator`-Attribut protokollieren; HTML↔XML-Generations-Parität ist beobachtet, nicht kontrahiert — bei Refresh beide Manifestationen gemeinsam ziehen). `check:fedlex-versionen` bleibt der EINE format-agnostische Currency-Arbiter.

### R2 — Artikel
`article/@eId` → Token (Präfix `art_` strippen; heute `ankerZuToken`, `extrahiere-fedlex.ts:848-850`). **Byte-gleich zum HTML-`@id` in allen 7 Samples verifiziert** (StGB 477=477). disp-Slash-Normalisierung: `disp_u16/art_4` → `disp_u16_art_4` (golden-Token-Konvention, PR #56 Namespace `disp_uN_art_*`). Anhänge via `<component><doc>`-Traversierung — sonst fehlen genau die Anhang-Bilder (KKG annex_1, SSV-Piktogramm-Kataloge).

### R3 — Label
`artikelLabel` = entferneTags(`<num>` nach authorialNote-Exzision) — amtlich «Art. 50 und 51» statt algebraisch «Art. 50–51» (`normtext-snapshot.ts:247-254` rät die Konjunktion falsch). **Phase 1 bleibt golden-treu** bei der bestehenden `artikelLabel()`-Algebra; num-Label ist additive Verbesserung mit eigener Re-Baseline (Konsumenten-Audit vorher: tokenMap/Chips/Anker).

### R4 — Absatz
- **DESCENDANT**-`<paragraph>`-Suche, nicht direkte Kinder (disp-Wrapper: `article>content>paragraph` — 83 OR-, 178 ZGB-Schlusstitel-Artikel).
- `absatz` = tag-gestrippter `<num>`-Text. Verkleben NUR bei Suffix-Whitelist `(bis|ter|quater|quinquies|…|[a-z])`; Bereichs-/Sonder-nums («3–5», «2 und 3», «2 e 3») **wörtlich aus `<num>`, NIE aus eId** (sonst «35»-Fälschung, StGB art_36/para_3_5).
- eId-los (KKG: 105 `<paragraph>` ohne eId) → Positions-Keying.
- Kein `<num>` + eId `…/para` (227× OR) → `absatz = null` (Einabsatz-Artikel).
- Inline-`<sup>1</sup>/<sup>2</sup>`-Split in EINEM verschachtelten Paragraph (ZGB disp_u1/art_41, golden: 2 Blöcke) → eigener Split-Zweig.
- `<paragraph>` ohne eId, dessen `<num>` ausserhalb der Absatz-Grammatik liegt («SR 241», «BRB vom 6. Nov. 2002» — KKG-Generatordefekt: Fussnote im num-Slot) → Generatordefekt-Flag, HTML gewinnt, Erlass-Quarantäne.
- `para_u1` (unnummerierter Einleitungsabsatz, StGB art_323/324) → `absatz = null`, nie «u1».

### R5 — Text
Konkatenation **ALLER** direkten `<p>`-Kinder von `<content>` ausserhalb blockList/table — fixt art_361/362 (Aufzählungs-`<p>`) und art_77 (Fortsetzungs-`<p>` nach `</blockList>`) strukturell. Konkatenations-Fugen: `<br>`→' ' (13× «Wort`<br/>`Wort» in OR.xml-Randtiteln), `<inline>`-Grenzen fugentreu (OR art_592/para_2: «Ge|schäft» über adjazente inlines), `<placeholder>`→''. authorialNote → Sidecar (R10). Nicht-Fedlex-`<ref href>` im Body = dritter Verweiskanal → **als Link ERHALTEN** (SSV annex_1: www.vss.ch, www.astra.admin.ch — heute irreversibel gestrippt). Inline-`<img>`: Offset/Platzhalter mitführen (LRV-Formel-Klasse, Risiko §6).

### R6 — Items
- `marke` = tag-gestripptes `<num>` ohne «. » — **NIE lbl-eId** (inkonsistent: StGB `lbl_a_bis` vs. SSV `lbl_fbis`; Anzeige immer «abis.»/«fbis.»).
- `text` = **ALLE** `<p>`-Kinder (DBG art_92: 2 `<p>` pro Item, sonst Verlust des Steuersatzes «0,8 Prozent;»).
- `tiefe` = blockList-Verschachtelungstiefe, **nicht** lbl-Segment-Zählung (ZGB art_89_a/para_8/lbl_4/bull_u1 → sonst 0 statt 1; DBG bull_u* → sonst −1).
- Verschachtelte `<listIntroduction>` gehört zum **Eltern-Item** (StGB art_48/para/lbl_a: «der Täter gehandelt hat:»), nicht in den Absatz-Text.
- `bull_u*`-Items ohne `<num>` → `marke = null`.

### R7 — Aufgehoben (drei Typen)
- **Typ A:** kein descendant-`<paragraph>` (nur `<num>`+`<authorialNote>`; OR 72, ZGB 31, StGB 40, DBG 14, SSV 5) → `bloecke=[{absatz:null,text:'…'}]`; Aufhebungsgrund → Fussnoten-Sidecar.
- **Typ B:** genau ein paragraph mit Ganz-Block `<p>Aufgehoben</p>` (case-sensitiv, NIE Substring — SSV art_22 hat 15× «aufgehoben» in lebendem Text) → `text:'Aufgehoben'` (ZGB art_50_51/150_158/866_874, DBG art_43_48, OR art_732_a).
- **Typ C:** leeres `<content/>` in disp-Paragraph (OR disp_u16/art_4/art_6/art_14; ZGB disp_u1/art_31_32 u.a.) → `'…'` — golden-verifiziert in OR.json/ZGB.json.
- Maschinenlesbares Status-Feld: erst später additiv (typen.ts hat heute kein Status-Feld, grep = 0), mit golden-Re-Baseline.

### R8 — Tabellen
`<table>` ohne `fedlex:function="layout"` → `mehrspaltig`; colspan-Expansion (`tabelle-normalisieren.ts:55-63`); **selbstschliessende `<td/>`/`<th/>` = Leerzelle** (128× SSV.xml — ein Paired-Tag-Parser droppt still → Spaltenversatz, empirisch reproduziert); U+00A0/U+202F→U+0020 (XML trägt rohes NBSP, Byte c2a0; `html-entities.ts:13,26` ist der Normierungs-Anker); authorialNote-Exzision in Zellen (DBG art_36 «mehr.», SSV annex_1); sup/sub-Bruch-Schutz («1/3» nie →«/3» — Fussnoten-Stripper braucht Anker-Check). Kopf Variante A = `<th>` aus XML; **Variante B NUR aus HTML-kpf-Signal** (gekeyt Artikel+Tabellen-Index, Invariante bei Gitter-Divergenz; GEBV art_19/30/45/48). Layout-Tabellen → `bildKacheln`; balancierter Tiefen-Zähler bleibt (`findeTableEnde`, `extrahiere-fedlex.ts:914-928`; max. Tiefe 2 in SSV annex_2). Spaltentyp weiterhin content-basiert via `inferiereTyp` (`tabelle-normalisieren.ts:120-133`), nie aus Ausrichtungsklassen.

### R9 — Bilder
`<p>` mit einzigem Kind `<img>` → bild-Block; **explizite `fedlex:original-*`-Regexe** (page-width/text-width HTML↔XML VERTAUSCHT — nie kreuzdiffen; nur width/height wertgleich); Kachel: `item/num`→`nummer` + ALLE `<p>`→`name` **UND** die `<p class=bild><b>N</b>`-Variante (SSV 4.77.1 nutzt sie statt dt/dd), mit Fussnoten-sup-Strip (SSV-4.77.1-Leak «…379» — `parseBildKacheln`-Fallback `:714-716` ruft heute `entferneTags` OHNE `entferneFussnotenSups`); Download relativ zur XML-Manifestation (Bytes unter /de/html/ und /de/xml/ byte-identisch, sha256 bf98d7c9… verifiziert) + Content-Type-Tor (`normtext-snapshot.ts:307-311`). Formel-Flag bleibt quell-agnostische Heuristik (0 MathML in allen Samples).

### R10 — Fussnoten-Sidecar
`<authorialNote>` → `Fussnote{text (b/i behalten), links[] aus <ref href>, absatz, item, sektion}` (`fussnoten-extrahiere.ts:19-25`). `nr` = Dokumentreihenfolge, **VERIFIZIERT gegen HTML** `fnbck`/`fn`-IDs (Zähl-Parität je Artikel; empirisch 1:1 in OR 944/SSV 380/StGB 612/DBG 339/ZGB 845/GEBV 36). Textvergleich **whitespace-FREI** (alle `\s` strippen — 0/3156 Mismatches; normalisiert reicht NICHT: OR fn 912 «Bst. b;AS» ohne Leerzeichen im XML). Zwei Defektklassen getrennt: **Zähl-Mismatch** = Generatordefekt (KKG 46 vs. 48) → Erlass-Quarantäne/HTML gewinnt; **Text-Mismatch** = Whitespace-Klasse → punktuell HTML-Text, keine Quarantäne. authorialNote-Trägerorte: inline im Satz, in `<num>` (110× StGB), in `<heading>` (10× StGB), im `<preamble>` (KKG).

### R11 — Verweise
`eli/cc`→intern (SR_INTERN, `helpers.tsx:11-15, 85-101`), `eli/oc|fga`→extern AS/BBl, **Nicht-Fedlex-http(s)→Weblink-Passthrough** (dritte Klasse, href erhalten — Body wie authorialNote). Body-«Art. N»-Zitate bleiben render-seitig (N2-Suppression `NormText.tsx:56, 81-93` + `fedlex.ts:435-453` unverändert — 0 interne `<ref>` in allen 7 Samples, kein XML-Freilos). ELI ist stets nur erlass-genau (kein `#art` im href) — Artikel-Präzision nie aus dem ELI ableiten. `<ref>`-Attribut-Rauschen variiert pro Generator-Build → nur auf `href` matchen.

---

## 4. Verifikations-Architektur

Bestehende Tore bleiben: `check:invarianten`, `check:vollstaendigkeit`, `check:tabellen`, `check:struktur-konsistenz` (neu B2/M13), `check:bilder`, `check:fedlex-versionen` (Currency-Arbiter), `check:gegenpruefung`.

**Neues Tor `check:akn-containment`** (Familie check:struktur-konsistenz), sechs Stufen — Stufe 3b und die Artefakt-Invariante sind die Antwort auf die drei Design-Gegenprüfungs-Linsen:

1. **Quell-Sonde** (R1): Root-Signatur + FRBRnumber==SR + Grössenschwelle + Inhalts-Sonde + **Generator-Fingerprint-Protokoll** (`fedlex:generator`); HTML- und XML-Manifestation werden als Paar gepinnt und gemeinsam refreshed — nie einseitig auf neuestes N.
2. **Quell-Containment im Adapter** (§2-hart): jeder Textknoten unter `<content>` landet in genau einem Snapshot-Feld; Rest≠'' ⇒ harter Build-Abbruch. Strukturelle Umkehrung der Drop-Klasse. **Ergänzt um ein quittiertes Artefakt-Register:** enumerierte Generator-Artefakte (`<placeholder>`→'', `[tab]`, `data-message`-Spans) werden exzidiert UND als Negativ-Lexikon geprüft — kein `[tab]`/Placeholder-Literal darf je in einem Snapshot-Feld landen (quell-symmetrie-unabhängig; fängt die Klasse, für die Containment per Konstruktion blind ist, weil beide Formate denselben Müll tragen).
3. **Asymmetrisches Containment XML↔HTML** (statt naiver Parität — die war 28–58 % Rauschen):
   - **Richtung 1 (blockierend):** whitespace-frei normalisierter golden-/HTML-Text jedes Artikels ⊆ AKN-Output.
   - **Richtung 2 (nicht blockierend):** AKN-Mehrertrag → **Expected-Diff-Ledger**, jeder Eintrag einzeln mit Fedlex-Quelle quittiert, nie pauschal (§7).
   - **3b (neu, für golden-lose Erlasse blockierend): Wortgrenzen-Check** — Token-Multiset des HTML-Texts == Token-Multiset des AKN-Outputs je Artikel. Fängt Wort-Verklebung («Wirkungeneines…») und Wort-Zerreissung («Ge schäft»), gegen die whitespace-freie Prüfungen blind sind; tolerant gegen reines Spacing. Ohne 3b könnte ein NEUES Gesetz (Council-Default: direkt akn, kein golden) mit verklebten Randtiteln durch alle Stufen grün gehen.
   - Dazu: eId-Mengen-Gleichheit nach Slash-Normalisierung; Fussnoten-Zähl-/Text-/Link-Parität mit Klassen-Triage (R10); Tabellen-Rechteck; img-src-Multiset; Negativ-Parität (OR/ZGB/StGB/KKG: 0 Tabellen beidseitig).
4. **eId↔`<num>`-Arbiter**: Divergenz ausserhalb der Suffix-Whitelist = harter Fehler (fängt para_3_5→«35», «2 e 3»); Absatz-Folgen-Lückencheck nur **WARNUNG** mit Bereichs-/Kollaps-Toleranz (SSV art_14: para_3 fehlt amtlich korrekt als Slot — darf nicht falsch alarmieren).
5. **Golden-Tor pro Erlass-Cutover**: byte-diff gegen Prod-Snapshot; Abweichung nur als dokumentierter, gewhitelisteter Fidelity-Gewinn mit Re-Baseline. **Voraussetzung: die sha256Bloecke-Blindstelle schliessen** — `mehrspaltig.spalten` fehlt im sha (`normtext-snapshot.ts:322-344` liest nur kopf/zeilen) — sonst prüft das Tor weniger, als es verspricht.
6. **Bestands-Sanierung [tab]-Klasse**: die 23 bestehenden `"marke":"[tab]"`-Stellen in 11 Prod-Goldens (KLV Art. 5 mit in den Text geleakter echter Marke «10.», AHVV, VTS 9×, ZPO, VZV, AVO, CHEMV, VVV, RPV, BPV, AHVG) sind ein HTML-seitiger Bestandsbug — Fix + kontrollierte Re-Baseline unabhängig vom XML-Pfad (Kandidat für Schritt 0-Folgebatch, §7).

**Grundsatz:** Das Tor beweist Treue zur Manifestation; Treue zum amtlichen Normtext braucht zusätzlich das Artefakt-Register (Stufe 2), den Wortgrenzen-Check (3b) und Davids spätere fachliche Abnahme (§6).

---

## 5. Inkrementeller Migrationspfad (NIE Big-Bang)

- **Schritt 0 — HTML-Härtung + Tor-Fundament (sofort, unabhängig vom XML):** siehe §7. Fixt 6 Prod-Blöcke, schliesst die sha-Blindstelle, macht die Drop-Klasse laut.
- **Schritt 1 — Shadow:** `scripts/normtext/adapter-akn.ts` (Konvention neben adapter-htm/-pdf/-lexwork) baut Scratch-Snapshots für die 7 Sample-Erlasse **OR / ZGB / StGB / DBG / SSV / KKG / GEBV_SCHKG** (deckt alle Bug-Klassen; KKG als eId-losen Stresstest). `scripts/fedlex-cache.sh` um XML-Fetch je gepinnter Zeile + `source`-Spalte (`akn|html`) erweitern. Iterieren, bis Richtung 1 = 100 % und der Expected-Diff-Ledger vollständig quittiert ist. Goldens byte-stabil, **null Prod-Wirkung**.
- **Schritt 2 — per-Erlass-Cutover, risiko-first:** **StGB → ZGB** (Prosa, ohne Tabellen) **→ OR** (erntet den art_361/362-Backlog-Fix) **→ Tabellen-Erlasse DBG, GEBV_SCHKG** (HTML-Signal-Spender Variante B aktiv). Begründung gegen «Bug-Erlasse zuerst»: Risiko dominiert ROI — der Adapter wird an Prosa scharf geschaltet, bevor der grösste Erlass folgt; der art_361/362-Gewinn ist ab Schritt 1 im Shadow-Ledger dokumentiert und geht nicht verloren. KKG-Klasse bleibt explizit auf HTML mit Flag. Neue/driftende Erlasse per Council-Default direkt akn — **aber erst, nachdem `check:akn-containment` an den 7 Samples grün ist**; ein neues Gesetz darf nie der erste Realtest des Adapters sein. Jeder Cutover = eigener Batch mit Tor-Lauf + adversarialem Bug-Check + gegenpruefung-Skill + §9. **Rollback = `source`-Flag zurück auf html.**
- **Schritt 3 — additive Verbesserungen, strikt getrennt vom Cutover** (sonst unentwirrbare golden-Diffs): amtliches num-Label (R3), Status-Feld in typen.ts (R7), Inline-Offsets für Bilder/Fussnoten (**M14** — fixt die LRV-Formel-Korruption, die quell-agnostisch offen bleibt und NICHT als «durch XML gelöst» verbucht werden darf).
- **Schritt 4 — Sidecars/Ausbau:** Fussnoten-Sidecar zuerst auf AKN (grösster struktureller Gewinn: kein dl-Walk mehr); `annex_*`-Ausbau (99 Gesetze, nächster Schritt laut Vollständigkeits-Audit) XML-first durchs selbe Tor — **Achtung: die SSV-Anhänge sind exakt die 97×-[tab]-Quelle, Artefakt-Register ist dort Eintrittsbedingung.** HTML-Fetch + HTML-Adapter bleiben **unbefristet** (Arbiter + 3 Signale) — **Schutzvermerk gegen «toter Code»-Aufräumen** (Daueranweisung Regelmässig-aufräumen gilt hier NICHT; Rückbau nur nach separatem Council). Kanton-Pfad (lexwork/pdf) wird nie berührt.

**Rückwärtskompatibilität:** goldens byte-gleich als Standard; jede Abweichung einzeln als Fidelity-Gewinn dokumentiert + gewhitelistet + Re-Baseline. `source`-Spalte macht jeden Erlass einzeln rückrollbar.

---

## 6. Risiken & offene Verifikationen

| # | Risiko / offene Verifikation | Stand / Massnahme |
|---|---|---|
| 1 | **Tote/aufgehobene ELI-Kanten**: eId-Stabilität 99,7 % über 2,5 J. — die 0,3 % konzentrieren sich in aufgehobenen Bereichen; DE/FR/IT nur ~95–99 % ausgerichtet | Verweis-Chips (M12-Erweiterung) nur erlass-genau; eId-Kanten je Ziel-Erlass beim Cutover gegen den aktuellen Stand prüfen; nie blind historische eIds verlinken |
| 2 | **N2-Fehlerrate**: erlass-genaue Fremd-Chips (Phase-1-Folge) brauchen eine gemessene Fehlerrate, bevor die Suppression gelockert wird («lieber kein Link als ein falscher», David 28.6.) | Messlauf über Korpus (727 «Artikel N … KÜRZEL»-Fälle-Klasse) vor jeder Lockerung; VO→Trägergesetz-Routing bleibt bewusst offen |
| 3 | **Currency-Gate / Generator-Generationen**: koexistierende, textverschiedene Manifestationen desselben Kons-Stands (SSV: 97 vs. 31 [tab]; html-99 = 200-Fehlerseite); ZGB-n=0-Staleness | Generator-Fingerprint in Quell-Sonde (§4.1); HTML/XML nur paarweise refreshen; alle empirischen Anker (0/3156 Fussnoten, «0 interne ref», 28–58 %-Rauschen) gelten NUR für die gemessene Generation — bei Generationswechsel Re-Messung pflicht |
| 4 | **[tab]-Bestandskorruption in Prod**: 23 Stellen / 11 Goldens, inkl. sha-eingebackener Fälschung (KLV Art. 5) | HTML-seitiger Fix + kontrollierte Re-Baseline (Folgebatch zu Schritt 0); Negativ-Lexikon verhindert Wiedereintritt über beide Adapter |
| 5 | **LRV-Formel-Klasse (Inline-img-Fragmente)**: «G_M = G_1 × + G_2 ×…» mathematisch korrupt in Prod (LRV.json annex_3 Blöcke 99–103); quell-agnostisch — XML löst es NICHT | M14 (Inline-Offsets, Schritt 3); bis dahin bekannter, dokumentierter Defekt — nicht als XML-Gewinn verbuchen |
| 6 | **Duplikat-Anker aufgehobener Bereichs-Artikel** (BetmG/VwVG/PAVO «15a–15c», KKV art_126_z): ob die XML-eIds dort ebenfalls doppelt sind, ist UNVERIFIZIERT (Samples ohne Duplikate) | vor jedem Cutover je Erlass prüfen (`__2`-Suffix-Mechanik, `extrahiere-fedlex.ts:105-123`) |
| 7 | **Nicht prüfbar an den 7 Samples**: FR/IT-Ausrichtung, annex_*-Vollbreite (99 Gesetze), LugÜ-Protokolle, künftige Suffixe (sexies+) | annex_* XML-first durchs Tor (Schritt 4); Suffix-Whitelist erweiterbar halten; Sprachfassungen erst mit Zitations-Graph/M15 |
| 8 | **Was David fachlich abnehmen muss** (Zeitsperre bis 1.12.2026 — nur vorbereiten, nicht drängen): (a) Aufgehoben-Darstellung Typ A/B/C einheitlich «aufgehoben»; (b) amtliches num-Label vs. algebraisches Label («Art. 50 und 51» vs. «Art. 50–51»); (c) Expected-Diff-Ledger-Einträge = echte Fidelity-Gewinne; (d) Weblink-Passthrough-Darstellung; (e) Fremd-Chip-Lockerung (Nr. 2) | Abnahme-Pakete nach `abnahme`-Skill vorbereiten; Fristen-Warteschlange Strang C (FAHRPLAN-LERNPHASE-2026.md) |

---

## 7. Konkreter erster Bau-Schritt (kleinste Einheit, golden-gegated, §6/§7)

**Ein Batch «Phase-1-Fundament», rein HTML-seitig, kein XML-Code** — er schafft drei Cutover-Voraussetzungen UND fixt 6 Prod-Blöcke sofort. Jeder Punkt = eigener §6-Schnitt mit einzeln freigegebenem Golden-Diff; jede Snapshot-Änderung einzeln mit Fedlex-Quelle belegt (§7); adversarialer Schlussdurchgang + gegenpruefung-Skill; §9 vor Push.

1. **sha-Blindstelle schliessen:** `sha256Bloecke` (`scripts/normtext-snapshot.ts:322-344`) um `mehrspaltig.spalten` erweitern. Kontrollierte sha-Re-Baseline; Inhalte byte-ident belegt (nur sha-Feld ändert).
2. **Split-sup-Merge im HTML-Extraktor** (`scripts/normtext/extrahiere-fedlex.ts:220-228`): Folge-sups verkleben, wenn sup₁ = Ziffern ∧ sup₂ ∈ Whitelist {bis,ter,quater,quinquies}∪[a-z] → `absatz` = Konkatenation. Fixt **GEBV_SCHKG art_9 Abs. 1bis** (heute: zwei Blöcke `absatz:'1'`, «bis Erfordert…»-Leak), **HMG art_9/art_67, KLV art_7, CO2_GESETZ art_16, VRV art_67** — 6 Blöcke / 5 Snapshots. Exponenten-Schutz (`:662-665`) unangetastet: rein numerische sup₂ («72³», «133¹⁄₃») werden NIE verklebt.
3. **Drop-Klasse laut machen:** ungematchtes `<p>` in einem Artikel mit Treffern = check-Fehler statt Silent-Drop (heute rettet der Fallback `:288-298` nur bei `bloecke.length===0`). Macht **OR art_361/362** als dokumentierten **Expected-Fail** sichtbar; der inhaltliche Fix folgt via OR-Cutover (Schritt 2, §5), nicht hier — §6-Split.
4. **Kachel-Pfad-Fussnoten-Leak fixen:** `parseBildKacheln`-Fallback (`extrahiere-fedlex.ts:714-716`) ruft `entferneFussnotenSups` vor `entferneTags` (wie der Absatz-Pfad `:232`). Fixt SSV 4.77.1 «…(Art. 59)379» inkl. sha-Korrektur.
5. **[tab]-Negativ-Lexikon als Tor-Invariante** (aus Design-Gegenprüfung L2/L3): `check:invarianten` um die Prüfung «kein Snapshot-Feld enthält `[tab]` / Placeholder-Literale» erweitern — zunächst als **Expected-Fail-Liste** der 23 bekannten Prod-Stellen (11 Goldens), damit die Klasse sichtbar und der spätere Fix-Batch gegated ist; kein stiller Bestands-Fix in diesem Batch (§6-Split, eigene Re-Baseline).

**Definition of Done:** alle Tore grün (Punkt 3 + 5 mit quittierten Expected-Fails), Golden-Diffs je Punkt einzeln freigegeben und mit Fedlex-Quelle belegt, `npm run gegenpruefung:ok` quittiert, adversarialer Schlussdurchgang ohne Blocker. Danach Schritt 1 (Shadow-Adapter `adapter-akn.ts`) als eigener Batch.

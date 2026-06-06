# Recherche-Dossiers — geplante Engines & Vorlagen (Stand 6.6.2026 abends)

**19 Dossiers:** zwölf Cluster zu allen `geplant`-Einträgen des Katalogs (92 Karten/
Szenarien, gruppiert nach Rechtsgebiet) plus sieben Einzel-/Vertiefungsdossiers
(StPO-Rechtsmittel · Strafbefehlsverfahren · Gebühren nicht-vermögensrechtlich ·
Kündigungs-Masken · Untermietvertrag · Eheschutz/GlG-Zuständigkeit · BGG-Beschwerde
[seit 6.6.2026 in `bestimmeRechtsmittel` teilverdrahtet]). Jedes Dossier liefert pro Item: Nutzerfrage · Normbasis (Stand 2026,
Wortlaut am Fedlex-Cache wo verfügbar) · Regelwerk-Skizze · **§2-Beurteilung**
(deterministisch / parametrisiert / Gerüst / Backlog) · Datenbedarf inkl. Verfallsregister ·
Fallstricke · Aufwand S/M/L · Wiederverwendung bestehender Engines.

**Status aller Dossiers: Recherche-Entwurf.** Web-Quellen einfach belegt, Cache-Zitate
verbatim; fachliche Abnahme durch David (§7) und die je im Dossier-Kopf gelisteten
Verifikations-TODOs stehen aus. Nichts davon ist umgesetzt.

| Dossier | Inhalt (Rechner · Vorlagen) | Top-Empfehlung |
|---|---|---|
| [zpo-kosten-streitwert](zpo-kosten-streitwert.md) | Streitwert · Kostenvorschuss (½-Regel 2025) · Sicherheit · BGer-Gebühren · BGer-Fristen · Fristwiederherstellung · kantonale Prozesskosten | Streitwert zuerst; kantonale Kosten erst nach Teil-B-Doppelcheck |
| [schkg-existenzminimum-vorlagen](schkg-existenzminimum-vorlagen.md) | Existenzminimum (Art. 93) · GebV-Kostenrechner · Rechtsvorschlag · Rechtsöffnung · Arrest/Aberkennung/Beschwerde [Gerüst] | GebV-Kostenrechner (Staffeln liegen vor); **AS-2025-630-Vorbehalt aufgelöst: keine Betragsänderung** |
| [arbeitsrecht-rechner](arbeitsrecht-rechner.md) | Ferienanspruch/-kürzung · 13. ML · Mehrarbeit · Entschädigungen (als Min/Max-Rahmen) · 336b-Fristen · Massenentlassung | 336b-Fristen (S) → Ferien |
| [arbeitsrecht-vorlagen](arbeitsrecht-vorlagen.md) | Kündigung AN/AG · Aufhebungsvereinbarung · Verwarnung/Freistellung [Gerüst] · Zeugnis (nur Arbeitsbestätigung) | Kündigung AN (free, S); AG-Variante bindet Live-Sperrfristen-Rechner als Blocker ein |
| [mietrecht-ausbau](mietrecht-ausbau.md) | Mietzinsanpassung (Referenzzins/40%-Teuerung/Kosten) · Anfechtung & Erstreckung | Referenzzins-Historie ab 2008 als Datenschicht; **Erhöhungssätze 3/2,5/2 % ≠ Senkungssätze 2,91/2,44/1,96 %** |
| [erbrecht-ausbau](erbrecht-ausbau.md) | Ausgleichung (626 ff.) · Erb-Fristen (567/533/521) · öff. Testament/Erbvertrag/Erbverzicht [Beurkundung] · Erbteilungsvereinbarung | Erb-Fristen-Rechner = Quick-Win (Preset-Bauform) |
| [familienrecht](familienrecht.md) | Güterrecht-Vorschlag · Vorsorgeausgleich (122 ff. + FZG 22a) · Familienfristen · Vereinbarungen [Gerüst] | Vorsorgeausgleich-Grundfall deterministisch; Rentenfälle 124a = Weiche |
| [gesellschaftsrecht](gesellschaftsrecht.md) | Quoten/Schwellen · Liberierung · **Kapitalverlust 725a / Überschuldung 725b** · Kapitalerhöhung · 706a-Fristen · Verantwortlichkeit | Kapitalverlust/Überschuldung (Bilanzmaske + exakte Formel) |
| [strafrecht-cluster](strafrecht-cluster.md) | StGB-Verjährung (Strafrahmen-Wahl statt Deliktskatalog!) · StPO-Fristen (keine Gerichtsferien, Art. 89 II) · Haftfristen · Vorlagen Anzeige/Antrag/Einsprache | StPO-Fristen + Einsprache Strafbefehl (10 Tage) zuerst |
| [verwaltung-steuer-sozial](verwaltung-steuer-sozial.md) | VwVG-/ATSG-Fristen · Vergabe (BöB 56: 20 T. OHNE Stillstand) · Steuer-Verjährung · VSt · AHV · DSG · Ausländerrecht | VwVG/ATSG als Preset-Kataloge (Stillstand 22a = ZPO-Gerichtsferien → Reuse) |
| [querschnitt-spezialrechner](querschnitt-spezialrechner.md) | Bauhandwerkerpfandrecht (4 Mt.) · Markenwiderspruch (3 Mt.) · Schadenszins · Widerruf/KKG · Ferien-Checker | **Klagebewilligung Art. 209 ist bereits in zpoPresets implementiert — nur UI fehlt**; Ferien-Checker = reine UI |
| [or-vertragsvorlagen](or-vertragsvorlagen.md) | Darlehen (KKG-Gate!) · Kaufvertrag · Mahnung (free) · Inverzugsetzung · Schuldanerkennung (82-SchKG-tauglich) · Vergleich [Gerüst] | Mahnung → Schuldanerkennung; VKKG-Höchstzins ab 1.1.2026: 10 %/12 % |
| [eheschutz-glg-zustaendigkeit](eheschutz-glg-zustaendigkeit.md) | Zuständigkeits-Engine-Ausbau: Eheschutz (summarisch 271 · Schlichtung entfällt 198a · 23 zwingend · Berufung 30 T. 314 II) · GlG (200 II · 243 II a · 113/114 a · 199 II c · Privat/Öffentlich-Weiche 13 GlG) | Eheschutz braucht 4. Verfahrensart `summarisch`; GlG-Flag schon korrekt — Lücke ist die Verwaltungsweg-Abgrenzung (Art. 13 GlG) |
| [bgg-beschwerde-engine](bgg-beschwerde-engine.md) | Beschwerde ans BGer (Ausbau `bestimmeRechtsmittel`): Zivilsachen 72–77 (SchKG-Entscheide 72 II a · Streitwert 15/30k + Ausnahmen 74 II · Streitwertberechnung 51–53) · subsidiäre Verfassungsbeschwerde 113–119 · Strafsachen 78–81 (Privatkläger-Legitimation 81 I b Ziff. 5) · Vorinstanzen 75/80 · Fristen 100 + Stillstand 46 · End-/Zwischenentscheid 90–93 · Kognition 95–99 (Eheschutz = Art. 98!) | Decision-Tree A–F regelbasiert; Eheschutz/A-Post-Plus nur als Weiche (Sekundärquelle, V-1/V-2 offen); Art. 74 II lit. c/d am Wortlaut bestätigt |

## Cluster-übergreifende Bau-Empfehlung (Quick-Wins zuerst)

1. **Nur-UI/Preset-Erweiterungen:** Klagebewilligung sichtbar machen · Ferien-/Stillstand-Checker · VwVG-/ATSG-/StPO-Fristen-Presets (Bauform `zpoPresets`/`schkgPresets`)
2. **S-Rechner auf bestehender Infrastruktur:** Erb-Fristen · 336b-Fristen · Strafantragsfrist · Streitwert · GebV-Kostenrechner · Bauhandwerkerpfandrecht
3. **S-Vorlagen:** Mahnung (free) · Kündigung AN (free) · Schuldanerkennung · Rechtsvorschlag
4. **M-Flaggschiffe:** Mietzinsanpassung (Referenzzins) · Kapitalverlust/Überschuldung · BGer-Gebühren · Ferienanspruch/-kürzung · Kündigung AG · StGB-Verjährung
5. **L-Projekte (eigene Regelwerke nötig):** Existenzminimum · Ausgleichung · Güterrecht · Vorsorgeausgleich · Massenentlassung · kantonale Prozesskosten

## Neue Verfallsregister-Kandidaten (aus den Dossiers)

| Parameter | Rhythmus | Quelle |
|---|---|---|
| Hypothekarischer Referenzzinssatz (akt. 1,25 %) | quartalsweise (nächste Bekanntgabe 1.9.2026) | BWO |
| Verzugs-/Vergütungszins Bund (VSt/dBSt/MWST, akt. 4,0 %) | jährlich | EFD-VO SR 631.014 |
| AHV/IV/EO-Sätze & Mindestbeitrag | jährlich | BSV |
| BVV-2-Mindestzins (Vorsorgeausgleich-Aufzinsung) | jährlich | BSV |
| VKKG-Höchstzins (10 %/12 % ab 1.1.2026) | jährlich (SARON-Mechanismus) | EJPD |
| Vergabe-Schwellenwerte BöB/IVöB | zweijährlich (2026/27 erfasst) | SECO/BPUK |
| Existenzminimum-Grundbeträge (1200/1350/1700) | bei Richtlinien-Revision | Konferenz BetrK-Beamte |

## Von den Agents korrigierte Auftrags-Prämissen (Transparenz, §7)

Recherche-Aufträge enthielten Fehler, die die Agents am Wortlaut widerlegt haben — bei
der Umsetzung NICHT die Auftrags-, sondern die Dossier-Fassung verwenden: Art. 94a ZPO =
Verbandsklage (nicht Stufenklage) · VMWG-Erhöhungssätze 3/2,5/2 % (nicht 2,91/2,44) ·
Vorsorgeausgleich: Aufzinsung nach FZG 22a (kein additiver Zins-Term) · Art. 627 OR
aufgehoben · 20-Tage-Einberufung = Art. 700 (nicht 699 III) · VStG-Zins variabel (nicht
5 %) · KKG-Widerruf 14 Tage · Eigentumsvorbehalt Art. 715 ZGB (nicht OR) · 30-Tage-Sperre
Massenentlassung = 335g Abs. 4 · Sperrfrist-Tatbestand cter ≠ Vaterschaftsurlaub.

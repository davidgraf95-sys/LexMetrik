# GmbH-Gründung — Delta-Liste G0 (Korrektheits-Abgleich am ZH-Original)

**Erstellt:** 7.6.2026 abends (Analyse-Agent GmbH-Programm G0; S1-Datumszeile
nachgetragen 10.6.2026, Bibliotheks-Tor).
**Quelle + Stand:** Abgleich `src/lib/vorlagen/gruendungGmbhDokumente.ts` (987 Z.,
Erstausbau 9b) gegen die amtlichen Originale in `.scratch/gmbh-knowledge/`
(ZH-Notariats-/HRegA-Vorlagen, session-fest gesichert aus den Muster-Sweeps);
OR-Cache 1.1.2026 (`/tmp/or.html`). Analyse-Agent 7.6.2026 abends.
**Status: Erstrecherche — BAU AUSDRÜCKLICH PAUSIERT (David 7.6.2026: «warte
noch mit dem bau der gmbh. mach nur recherche»).** Referenz-Implementierungen:
AG-Engine (`gruendungAgDokumente.ts`, Deltas D1–D24 im AG-Vorlagen-Dossier).

## Deltas (Bau-Backlog, priorisiert)

**GD1 · HOCH — Singular-Urkunde fehlt vollständig.** Errichtungsakt hat KEINE
Numerus-Weiche; alle Bausteine hart Plural («Die Gründerinnen und Gründer
stellen fest», EA01/EA03/EA08/EA11/EA13/EA14). Original
`zh-gmbh-gruendung-1person-bar.txt` ist durchgängig Singular/1. Person («ist
heute erschienen» Z. 6 · «gründe ich» Z. 23 · «Ich stelle fest» Z. 38 ·
«erkläre ich die Gesellschaft … als gegründet» Z. 60). Einpersonengründung =
Regelfall (Art. 775 OR aufgehoben). **Fix-Muster:** `einGruender`-Flag +
`includeIf`-Varianten exakt wie AG (`AE01_ingress_singular` ff.,
gruendungAgDokumente.ts:1620 ff.; Haus-Konvention: 3. Person «Die erschienene
Person erklärt»). Betroffen: EA01, EA03, EA08 (beide), EA09 (wird/werden),
EA11, EA13, EA14, EA15, EA16.

**GD2 · HOCH — Wahlannahmeerklärung Revisionsstelle fehlt als Dokument.**
Checkliste listet Beleg `wahlannahme-rs` (gruendungsunterlagen.ts:325, Art. 71
Abs. 1 lit. d HRegV), Mappe erzeugt aber nur `wahlannahme-gf` — kein
`WAHLANNAHME_RS_SCHEMA`, kein Mappen-Zweig. ZH-Anmeldung listet den Beleg
(div-zh-anmeldung-neueintragung-gmbh.txt Z. 17). **Fix-Muster:** AG-Schema
gruendungAgDokumente.ts:2222–2247 + Mappen-Zweig :3001 + KEINE_BEILAGE/
entbehrlichWennInUrkunde-Behandlung.

**GD3 · MITTEL — Zeichnungsarten unvollständig.** `GmbhZeichnungsArt` kennt
nur einzeln/kollektiv-zu-zweien (Z. 46); «ohne Zeichnungsberechtigung» (GF)
und «Kollektivprokura zu zweien» (Vertretungsberechtigte) fehlen (AG-D14;
Art. 814 / 804 Abs. 3 OR). **Fix-Muster:** Label-Spreads
VR_/VERTRETUNGS_ZEICHNUNGS_LABEL (AG :281–289) + Gate «mind. eine Person
zeichnet» (AG :774) + «ist … ohne Zeichnungsberechtigung»-Formulierung.

**GD4 · HOCH/MITTEL — Statuten-kurz ohne Geschäftsjahr- und
Beschlussfassungsarten-Artikel.** Beide amtlichen Kurzfassungen (ZH Z. 18–24,
SG Z. 40–43) führen beide Artikel; Engine hat keinen davon (ST19 deckt nur
virtuelle GV). Schriftliche Beschlussfassung läuft über «Art. 805 Abs. 5
i.V.m. Art. 701 Abs. 3 OR» (ZH verbatim). **Fix:** zwei Pflicht-Bausteine;
GJ-Felder nach AG-Muster (gjBeginn/gjEnde, Defaults 1.1./31.12., AG :261/:1554).

**GD5 · MITTEL — Statuten-kurz: Organisations-Grundartikel fehlen.**
«Gesellschafterversammlung» (oberstes Organ, wählt GF) und «Geschäftsführung»
(ein/mehrere; Vorsitz-Regelung; Zeichnungsart) nach ZH-Kurz Z. 11–17; SG-Kurz
zusätzlich Revisions-Verzichtsartikel (Art. 6) als optionalen Baustein erwägen.

**GD6 · MITTEL — Anmeldungs-Disclaimer ohne Deutsch-/24a-Hinweis.** Kein
Hinweis Deutsch-Pflicht + Ausweiskopien je einzutragender Person als LOSE
Beilage (Art. 24a HRegV; ZH-Anmeldung Z. 70 f.). **Fix:** AG-Wortlaut
gruendungAgDokumente.ts:2366 f. übernehmen.

**GD7 · NIEDRIG — Nachtragsvollmacht:** Engine pauschal + immer enthalten;
GmbH-Mehrpersonen-Muster (Z. 70) ist selbst pauschal → weitgehend gedeckt.
Nur Optionalität (AG: hatNachtragsvollmacht-Flag) angleichen bzw. «immer an»
als Haus-Abweichung offenlegen.

**GD8 · NIEDRIG — Vorsitz-/Ernennungs-Beschluss ohne Sitzungs-Formalia:**
KEIN Fix nötig — es sind Gründer-ZIRKULARBESCHLÜSSE (Art. 23 Abs. 2 HRegV
korrekt zitiert), die AG-D13-Formalia (Beginn/Ende/Anwesend) gelten nur für
Sitzungsprotokolle. Nur falls künftig ein GF-Sitzungsprotokoll gebaut wird:
D13-Kopf übernehmen.

## Bereits originalgetreu (NICHT anfassen)

Wahlannahme GF (Kernsatz verbatim = zh-gmbh-wahlannahme-gf.txt Z. 9) ·
Domizilannahme (verbatim Z. 10) · Feststellungen EA08 beide Varianten ·
Opting-out dreigliedrig (bewusste Haus-Abweichung analog AG-D12) ·
Einlagen-Bausteine EA07 · 777a-II-Hinweiskatalog (Stimm-/Vetorecht korrekt
NICHT im Katalog) · Beleglisten/`entbehrlichWennInUrkunde` ·
Gates (773 I/774 I/777 II/795 II/809 III) · Statuten ST10–ST16
(Fristen 30/60/10/60 deckungsgleich).

## 805-V-Cache-Befund (verbatim, OR 1.1.2026)

Art. 805 Abs. 5: «Im Übrigen sind die Vorschriften des Aktienrechts über die
Generalversammlung entsprechend anwendbar für: 1. die Einberufung; 2. das
Einberufungs-, das Traktandierungs- und das Antragsrecht der Gesellschafter;
2bis. den Tagungsort und die Verwendung elektronischer Mittel; 3. die
Verhandlungsgegenstände; 4. die Anträge; 5. die Universalversammlung und die
Zustimmung zu einem Antrag; 6. die vorbereitenden Massnahmen; 7. das
Protokoll; 8. die Vertretung der Gesellschafter; 9. die unbefugte Teilnahme.»

→ Ziff. 2bis = Verweis auf Art. 701a–701e (virtuelle GV: 701d) — Engine-
Begründung ST19 KORREKT. Schriftliche/Zirkular-Beschlussfassung läuft über
Ziff. 5 → ZH-Formel «805 V i.V.m. 701 III OR» → fehlender GD4-Baustein.

## Pflegebedarf / Abnahme-Status

Kein datierter Parameter. Erstrecherche; fachliche Abnahme David offen.
Bau erst auf Davids Go (G1–G7 im FAHRPLAN-GMBH-GRUENDUNG.md).

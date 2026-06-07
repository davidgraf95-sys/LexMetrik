# Fahrplan: GmbH-Gründungsmaske analog AG (Auftrag David 7.6.2026, «mache das gleiche für gmbh gründung analog ag»)

**Vorbild:** FAHRPLAN-AG-GRUENDUNG.md (alle Etappen gebaut, 7.6.2026) —
gleiches Programm auf `lib/vorlagen/gruendungGmbhDokumente.ts` und
`pages/VorlageGmbhGruendung.tsx`. **Wortlaut-Quellen:** ZH-/SG-/GL-GmbH-
Originale, session-fest gesichert in `.scratch/gmbh-knowledge/` (Urkunden
1-Person/mehrere bar, HRegA-Urkunde, Statuten kurz/lang ZH+SG+GL,
Wahlannahme GF, Domizilannahme, Anmeldung, SG-Errichtungsakt; aus den
Muster-Sweeps von gruendungsdokumente-wortlaute.md). Statuten-Klausel-
Katalog S1–S20 liegt dort bereits engine-fertig vor.

**GmbH-SPEZIFIKA (am Cache verifiziert 7.6.2026):**
- **Art. 777c Abs. 1 OR: VOLLE Liberierung jedes Stammanteils zwingend**
  → KEINE Teilliberierung, KEINE individuellen Liberierungsgrade
  (AG-Etappe 3.3 entfällt ersatzlos; Agio bleibt möglich — «dem
  Ausgabebetrag entsprechende Einlage»).
- **Art. 777c Abs. 2 OR:** Aktienrecht sinngemäss für Statuten-Angaben zu
  Sacheinlagen/Verrechnungen/besonderen Vorteilen (Ziff. 1) und für
  Leistung und Prüfung der Einlagen (Ziff. 3) → qualifizierte Gründung
  exakt analog AG (634/634a/635/635a OR; Belege 71 HRegV statt 43).
- Mindestkapital CHF 20'000 (773 I); Fremdwährung 773 II (Gegenwert
  20'000; gleiche Währungsliste Anhang 3 HRegV).
- Organ: Geschäftsführung (809), Vorsitz-Beschluss nur «gegebenenfalls»
  Beleg (71 I lit. e/f — anders als AG-Pflichtbeleg lit. e!).
- 777a Abs. 2: Hinweispflichten im Errichtungsakt bei statutarischen
  Pflichten (bereits gebaut, 9b).

## Etappen (je mit Tests + Bug-Check §9, Tore wie AG-Fahrplan)

- [ ] G0 Korrektheits-Abgleich am Original: Singular-Urkunde
  (zh-gmbh-gruendung-1person-bar.txt VERBATIM-Referenz!) ·
  Vorsitz-/Ernennungs-Beschluss-Formalia (Beginn/Ende/Abwesend, D13
  analog) · Zeichnungsarten ohne/Kollektivprokura · Statuten-kurz:
  Geschäftsjahr-/Beschlussfassungsarten-Artikel (805 V Ziff. 2bis /
  701-III-Analog: Cache prüfen!) · Wahlannahme Revisionsstelle ·
  Anmeldungs-Hinweise (24a HRegV, Deutsch) · Nachtragsvollmacht benannt.
- [ ] G1 Statuten kurz/lang (zh-gmbh-statuten-lang.txt; Binnenverweise
  nummerierungsfest; bestehende statutKlauseln [Nachschuss etc.] bleiben
  Weichen).
- [ ] G2 Qualifizierte Gründung via 777c II: Sacheinlage-Zeilen
  (Sachgesamtheit/Geschäft, Grundstück→Vertrag ENTWURF 634 II/657 ZGB) ·
  Verrechnung (777c II Ziff. 1; BE-Merkblatt: 777c II Ziff. 1 für GmbH) ·
  besondere Vorteile · Statuten-Pflichtklauseln + 10-Jahres-Hinweis
  (sinngemäss 634 IV/634a III Satz 2 — am Cache verifizieren!) ·
  Sacheinlagevertrag + Gründungsbericht als Dokumente (ZH-AG-Vorlagen
  als Wortlaut-Basis, GmbH-Anpassung offenlegen; Prüfung 635a sinngemäss).
- [ ] G3 Fremdwährung (773 II, Gegenwert 20'000) + Agio (Ausgabebetrag,
  unter pari 777c I sinngemäss/624) — KEINE Teilliberierung (777c I).
- [ ] G4 Optionen: Wahlannahme GF in der Urkunde · Vorsitz/Zeichnungs-
  regelung in der Urkunde (Gate GF ⊆ Gründer wie AG-Befund 1!) · Domizil
  nur Anmeldung · Lex-Koller-Dokument (identisches ZH-Formular) ·
  Gründungs-Nachtrag (ZH 3.4 sinngemäss — GmbH-Vorlage existiert nicht,
  Haus-Fassung offenlegen).
- [ ] G5 Info-Schicht: GF-Pflichten (Art. 820 OR verweist auf 725 ff.;
  Merkblatt D20 nennt 820 ausdrücklich) · private Register · FINMA-
  Wortprüfung · Übersetzungen.
- [ ] G6 Wizard-Umbau VorlageGmbhGruendung (6 Schritte analog AG) +
  Sammel-Download aller notwendigen Dokumente.
- [ ] G7 Sammel-Bug-Check §9 (2 Agents: Kombinatorik-Sweep + Wortlaut
  gegen die GmbH-Originale); AG-Sammelcheck-Befunde als Checkliste
  (Satz|Zeile-Fragmente! Agio-Gegenwert! VR/GF⊆Gründer-Gate!).

**Übertragene Lektionen aus dem AG-Bau (alle dort per Bug-Check
gefunden):** Fragment-Felder MÜSSEN auf Satz/Zeile enden · Gegenwert-
Rechnungen auf GELEISTETEN Einlagen (Agio!) · Organ-Erklärungen in der
Gründerurkunde nur durch Gründer · Beilagen-Listen ehrlich filtern, wenn
Urkunden-Optionen Belege entbehrlich machen · Konventions-Test-Fälle je
Numerus/Variante maximal bestücken.

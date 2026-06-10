# Sichtung Wissens-Ablagen David → Engine-Zuordnung (10.6.2026)

Auftrag David (10.6.2026 abends): die Ablagen `~/Desktop/Legal Calc
Knowledge` und Google Drive `_Anwaltsprüfung` auf Verwertbares für gebaute
und geplante Engines durchsuchen; Relevantes in den LegalCalc-Ordner
kopieren und verwerten.

**Ablage:** alle übernommenen Dateien liegen lokal in `bibliothek/quellen/`
(gitignored — Kommentar- und Skript-PDFs/DOCX sind urheberrechtlich
geschützt und gehen nie ins Git/Deploy; nur diese Sichtungsliste ist
committet). Verwertung = eigene Regel-Formulierungen mit Fundstellen-Verweis
in `bibliothek/`-Dossiers nach §11.

**Status:** Erstrecherche (Sichtung); je Verwertung eigener Dossier-Eintrag
mit eigenem Status. Sekundärquellen (Kommentare, RAP-Zusammenfassungen)
sind HINWEISGEBER — Beleg für Engines bleibt der amtliche Wortlaut (§7).

## Übernommen: `legal-calc-knowledge/` (Desktop, vollständig, 92 Dateien)

| Quelle (Ordner/Datei) | Art | Engine / Status | Verwertung |
|---|---|---|---|
| `Fristenrechner ZPO/` — Berner Kommentar Art. 142–147 ZPO (7 PDFs) | Kommentar | `zpoFristen.ts` · `fristenEngine.ts` (gebaut) | Regel-Abgleich Fristbeginn/-ende, Feiertage, Stillstand Art. 145 → Befundliste |
| `Lohnfortzahlung Kündigung/` — SHK Art. 324a/b, 335c, 336c OR (4 PDFs) | Kommentar | `lohnfortzahlung.ts` · `kuendigungsfrist.ts` · `sperrfristen.ts` (gebaut) | Regel-Abgleich Skalen, Sperrfristen-Tatbestände, Kündigungstermine → Befundliste |
| `Gründung AG/` — amtliche HReg-Vorlagen, Merkblätter, Checklisten (~40) | amtliche Muster | `gruendungsunterlagen.ts` · `vorlagen/gruendungAgDokumente.ts` (gebaut, z. T. abgenommen) | Abgleich eigene Bausteine ↔ amtliche Muster; Änderungen nur nach Abnahme David |
| `Musterklagen Vertrags- und Haftplfichtrecht/` — Bd. I §§ 1–25 (kommentierte Musterklagen) | Muster + Kommentar | **ordentliche Klage (geplant, nächster Neubau)** · `klageVereinfacht.ts` (gebaut) | Struktur-Extrakt Aufbau/Rechtsbegehren/Stolpersteine → Dossier |
| `Musterklagen im Familienrecht/` — §§ 72–89 (Eheschutz, Scheidung, Kindesschutz) | Muster + Kommentar | Eheschutz/Familienrecht (Backlog) | bereits verwertet durch Parallel-Session 10.6.2026: [recherche/familienrecht-klagen-vorlagen.md](../recherche/familienrecht-klagen-vorlagen.md) |
| `Präjudizienbuch OR, Art. 104.pdf` | Rechtsprechungs-Übersicht | `verzugszins.ts` (gebaut) | Abgleich Zinssatz/Beginn/Konkurrenzfragen → Befundliste |
| `SchKG-Fristen_2026-06-05.pdf` | Übersicht | `schkgFristen.ts` (gebaut) | Quervergleich Fristentabelle |
| `Schuldbetreibung und Konkurs … F. Lorandi.pdf` | Skript | `schkgFristen.ts` · `schkgZustaendigkeit.ts` (gebaut) | Nachschlagewerk (Duplikat lag schon im Repo-Root, untracked) |
| `Anwaltsvollmacht.docx` | Muster | `vorlagen/vollmacht.ts` (gebaut) | Abgleich Klauselbestand |
| `Schlichtungsgesuch_AbS_2026-06-05.docx` | Muster | `vorlagen/schlichtungsgesuchBs.ts` (gebaut) | Abgleich gegen heutigen Umbau |

## Übernommen: `anwaltspruefung/` (Google Drive, selektiv)

| Quelle | Art | Engine / Status | Verwertung |
|---|---|---|---|
| `rechtsbegehren/` — Sammlungen 339 S. + 342 S., Homburger-PDF, ZGB-Tabelle, Skript, «Grundsätze», «Stolpersteine» + fachspezifisch Erbrecht/Haftpflicht/Sachenrecht/Vollstreckung/Aktienrecht | Formulierungs-Sammlungen | **klageVereinfacht (gebaut) + ordentliche Klage (geplant)** | wertvollster Fund: Rechtsbegehren-Bausteine je Klagetyp → Dossier |
| `rechtsschriften-privatr/` — Klage/Gesuch/Beschwerde-Vorlagen (AP 2025), Bauhandwerkerpfandrecht, Grundbuchberichtigung | Vorlagen | ordentliche Klage (geplant) | Aufbau-Referenz Rechtsschrift → Dossier |
| `vertraege/Erbteilungsvertrag.docx` | Muster | `erbteilung.ts` (gebaut, Rechner ohne Vorlage) | verzeichnet; Vorlage-Kandidat (Backlog) |
| `vertraege/Vergleich.docx` · `Scheidungskonvention Fankhauser.pdf` | Muster | kein Pendant (Backlog) | verzeichnet |
| `Vollmacht.docx` · `klientenbrief/` | Muster | `vorlagen/vollmacht.ts` · Korrespondenz-Gruppe (gebaut) | Abgleich Klauseln/Tonalität |
| `zusammenfassungen/` — RAP-Zusammenfassungen SchKG, ZPO, OR AT, StPO (Robert) | Sekundärquelle | `schkgFristen` · `zpoFristen` · `verjaehrung` · `strafRechtsmittel` (gebaut) | NUR Hinweisgeber für Lücken-Hypothesen; nie als Beleg |

## Gesichtet und bewusst NICHT übernommen

- `_Anwaltsprüfung/1_Admin`, `3_Übungen und Prüfungen`, `4_Hausarbeit`,
  `6_Mündlich`, `2_Lernstoff` (übrige) — Prüfungsvorbereitung ohne
  deterministische Engine-Regeln bzw. ohne Bezug zum Katalog.
- `5_Vorlagen/VORLAGEN STRAFRECHT`, `Rechtsschriften/Strafrecht`,
  `Gutachten`, `Memo`, `Plädoyer`, `öffR` — Backlog-Gebiete ohne gebaute
  Engine; bei Bau-Entscheid erneut sichten (Fundort bekannt).
- `~/Desktop/Repetitorium_Audio` — TTS-Lernprojekt ZGB (Einleitungsartikel,
  Personenrecht): keine Engine-Relevanz.

## Pflegebedarf

- Quell-Stände sind Privatkopien (Abruf vor bzw. am 10.6.2026); bei Verwertung
  je Dossier den Stand der amtlichen Quelle (Fedlex/HReg) massgeblich machen.
- `Gründung AG`-Merkblätter sind datiert (z. T. 2024) → bei Abgleich gegen
  [register/parameter-verfall.md](../register/parameter-verfall.md) prüfen.

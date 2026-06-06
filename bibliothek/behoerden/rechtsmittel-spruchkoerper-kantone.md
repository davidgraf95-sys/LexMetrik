# Rechtsmittel-Spruchkörper Zivil (Berufung Art. 308 ZPO · Beschwerde Art. 319 ZPO) — 26 Kantone + BGerR

**Erstellt:** 6.6.2026 · **Abrufdatum aller Quellen: 6.6.2026** · **Status:
Erstrecherche, Abnahme durch David ausstehend** (§11 Ziff. 5).

**Zweck (Auftrag David 6.6.2026):** Der Zivil-Rechtsmittel-Fahrplan
(`src/lib/zustaendigkeit.ts` `bestimmeRechtsmittel` + `src/data/obereInstanzen.ts`)
nennt heute nur «obere kantonale Instanz» mit Gericht + Adresse. Diese Liste
ergänzt — soweit deterministisch und amtlich belegbar — den konkreten
**Spruchkörper** (Kammer/Abteilung/Einzelgericht), der im jeweiligen Kanton die
zivilrechtliche **Berufung** bzw. **Beschwerde** behandelt.

**Methodengrundlage:** Die Behörde→GOG-Artikel-Zuordnung und die
Abteilungs-/Kammergliederung sind bereits zweifach geprüft im Dossier
[gog-gerichtsorganisation-kantone.md](gog-gerichtsorganisation-kantone.md)
erfasst (Stand 5.6.2026); diese Liste leitet die Spruchkörper-Spalten daraus ab
und ergänzt sie um amtliche Gerichts-Websites / Geschäftsverteilungs-Reglemente
für die Berufungs-/Beschwerde-Zuordnung. Adressen → bestehender
`OBERE_INSTANZEN`-Eintrag (`obereInstanzen.ts`); abweichende Spruchkörper-Adressen
sind selten und unten vermerkt.

---

## §1 Der entscheidende Befund: Determinismus-Lage (§2/§8 — keine Erfindungen)

Die Frage «welcher Spruchkörper behandelt die Berufung vs. die Beschwerde?» ist
in den meisten Kantonen **nicht nach Rechtsmittel-Typ** deterministisch, sondern
entweder

- **(A) identisch** — derselbe Spruchkörper behandelt Berufung *und* Beschwerde
  (kleine/mittlere Kantone mit einer Zivilkammer/-abteilung), oder
- **(B) nach Sachgebiet/Geschäftsverteilung** aufgeteilt (mehrere Zivilkammern,
  z. B. ZH I./II. Zivilkammer, BE 1./2. Zivilkammer, TI Camere civili I–III) —
  die Zuteilung folgt dem **Rechtsgebiet/der Geschäftsnummer**, nicht der
  Unterscheidung Berufung/Beschwerde; ohne den konkreten Streitgegenstand und
  die jährliche Geschäftsverteilung **nicht deterministisch** bestimmbar, oder
- **(C) nach Rechtsmittel-Typ** deterministisch getrennt — **das gibt es
  amtlich nur in VD** (Cour d'appel civile = Berufung · Chambre des recours
  civile = Beschwerde) und teilweise in NE/JU/GE/TI (eigene Kammern für
  SchKG/Familien-/Mietsachen, aber innerhalb der Zivilkammer Berufung *und*
  Beschwerde gemischt).

→ Deterministisch nach Rechtsmittel-Typ verdrahtbar (Feld `kammerBerufung` ≠
`kammerBeschwerde`) ist damit **nur VD**. Für alle übrigen Kantone bleibt die
korrekte, ehrliche Angabe entweder ein einziger Spruchkörper (Berufung =
Beschwerde) oder der ausdrückliche Hinweis «Zuteilung nach
Sachgebiet/Geschäftsverteilung — nicht generisch bestimmbar».

---

## §2 Kantonstabelle

Legende Konfidenz: **amtlich** = Erlass-Wortlaut (konsolidierte Fassung) ·
**Gericht** = offizielle Gerichts-Website / Geschäftsverteilungsreglement ·
**offen** = noch nicht am amtlichen Volltext bestätigt.
GOG-Verweise = die im Dossier gog-gerichtsorganisation-kantone.md (Stand
5.6.2026) bereits verifizierten Artikel; Spruchkörper-Detail per Gerichts-Website
6.6.2026.

### Deutschschweiz

| Kt | Berufungs-Spruchkörper | Beschwerde-Spruchkörper | Rechtsgrundlage (konsolidiert) | Konfidenz |
|---|---|---|---|---|
| **ZH** | I. **oder** II. Zivilkammer des Obergerichts | I. **oder** II. Zivilkammer des Obergerichts | GOG LS 211.1 § 48 (Berufung) / § 49 (Beschwerde), Stand 1.7.2020; Verteilung: V. Organisation Obergericht **LS 212.51** + jährliche Geschäftsverteilung | Gericht — **(B) sachgebiets-/geschäftsverteilungsabhängig**: beide Kammern behandeln Berufung *und* Beschwerde, Zuteilung nach Sachgebiet/Geschäftsnummer (gerichte-zh.ch, Aufgaben I./II. Zivilkammer). Nicht nach Rechtsmittel deterministisch. |
| **BE** | 1. **oder** 2. Zivilkammer des Obergerichts (Zivilabteilung) | 1. **oder** 2. Zivilkammer des Obergerichts (Zivilabteilung) | GSOG BSG 161.1 Art. 35 (Obergericht/Zivilabteilung), Stand 1.5.2026; Spruchkörper Dreierbesetzung | Gericht — **(B)**: zwei Zivilkammern, beide Berufung *und* Beschwerde; Zuteilung nach Geschäftsverteilung (zsg.justice.be.ch, Zivilabteilung). Direktklagen ≥ 100 000 + Schiedssachen ebenfalls Zivilabteilung. |
| **LU** | Kantonsgericht, 1. Abteilung (Zivil) | Kantonsgericht, 1. Abteilung (Zivil) | JusG SRL 260 § 14a (Gliederung 4–6 Abt.) / § 15 (Zuständigkeit Zivil), Stand 1.4.2017 | Gericht — **(A) identisch**: die Zivil-Abteilung behandelt Berufung *und* Beschwerde. (Genaue Abteilungsnummer per Geschäftsverteilung; vor Übernahme bestätigen.) |
| **UR** | Obergericht (Zivilrechtliche Abteilung) | Obergericht (Zivilrechtliche Abteilung) | GOG RB 2.3221 Art. 33 (Organisation) / Art. 37a (Zivil), Stand 1.6.2023 | **amtlich (GOG)** — **(A) identisch**: eine zivilrechtliche Abteilung; Berufung = Beschwerde. |
| **SZ** | Kantonsgericht (Zivilkammer) | Kantonsgericht (Zivilkammer) | JG SRSZ 231.110 § 12 (Zuständigkeit: Berufungen/Beschwerden), Stand 1.2.2023 | **amtlich (GOG)** — **(A) identisch**: § 12 nennt «Berufungen und Beschwerden» derselben Zuständigkeit. |
| **OW** | Obergericht | Obergericht | GOG GDB 134.1 Art. 37 (Zuständigkeit Zivil obere Instanz), Stand 1.4.2022 | **amtlich (GOG)** — **(A) identisch**: ein Obergericht, keine Zivilkammer-Aufteilung. |
| **NW** | Obergericht | Obergericht | GerG NG 261.1 Art. 27 (Berufung/Beschwerde Zivil), Stand 1.2.2026 | **amtlich (GOG)** — **(A) identisch**: Art. 27 fasst Berufung *und* Beschwerde Zivil zusammen. |
| **GL** | Obergericht (Kollegialgericht, Art. 17; Einzelgericht Art. 18) | Obergericht (Kollegialgericht, Art. 17; Einzelgericht Art. 18) | GOG GS III A/2 Art. 17 (Kollegialgericht Rechtsmittelinstanz) / Art. 18 (Einzelgericht), Stand 1.7.2022 | **amtlich (GOG)** — **(A) identisch**: Rechtsmittelinstanz ist das Obergericht; Kollegial-/Einzelgericht je nach Verfahren, nicht je nach Berufung/Beschwerde. |
| **ZG** | Obergericht, **Zivilabteilung** (§ 19) | Obergericht, **Beschwerdeabteilung** (§ 21) | GOG BGS 161.1 § 17 (Abteilungen) / § 19 (Zivilabteilung: Berufung Art. 308 ff.) / § 21 (Beschwerdeabteilung), Stand 17.10.2025 | **amtlich (GOG)** — **TEIL-(C)**: Die Zivilabteilung führt die **Berufung** (§ 19 nennt Art. 308 ff. ausdrücklich); die **Beschwerdeabteilung** (§ 21) führt u. a. Beschwerden inkl. SchKG-Aufsicht. ⚠ Genauer Beschwerde-Schnitt (Art. 319 ZPO vs. nur prozessuale Beschwerden) am § 21-Wortlaut + Geschäftsverteilung vor Übernahme bestätigen. |
| **FR** | Kantonsgericht / Tribunal cantonal (Beschwerde-/Berufungshof, Art. 52) | Kantonsgericht / Tribunal cantonal (Beschwerde-/Berufungshof, Art. 52) | JG/LJ SGF 130.1 Art. 52 (Weiterziehungsinstanz Beschwerde/Berufung), Stand 1.1.2024 | **amtlich (GOG)** — **(A) identisch**: Art. 52 nennt das Kantonsgericht als Instanz für Beschwerde *und* Berufung. (Konkreter Hof/cour aus dem Reglement; vor Übernahme bestätigen.) |
| **SO** | Obergericht, **Zivilkammer** (§ 24) | Obergericht, **Zivilkammer** bzw. **Beschwerdekammer** (§ 24) | GO BGS 125.12 § 24 (Kammern: Zivil-, Straf-, SchK-, Beschwerdekammer), Stand 1.11.2021 | Gericht — **(A)/Teil-(C)**: zivilrechtliche Rechtsmittel grundsätzlich Zivilkammer; eine eigene Beschwerdekammer besteht (§ 24), deren Zivil-Zuständigkeit am Reglement zu klären. Vor Übernahme bestätigen. |
| **BS** | Appellationsgericht: **Kammer** (§ 91) / **Dreiergericht** (§ 92) / **Einzelgericht** (§ 93) — je nach Streitwert/Verfahren | wie Berufung (§§ 91–93) | GOG SG 154.100 § 88 (Zuständigkeit) / § 91–93 (Spruchkörper), Stand 15.6.2025 | **amtlich (GOG)** — **(B) streitwert-/verfahrensabhängig, nicht rechtsmittelabhängig**: Kammer (5er) / Dreiergericht / Einzelgericht richten sich nach Streitwert und Verfahren, **nicht** nach Berufung ↔ Beschwerde. Beide Rechtsmittel können in jeder der drei Besetzungen laufen. |
| **BL** | Kantonsgericht, **Abteilung Zivilrecht** (§ 9) | Kantonsgericht, **Abteilung Zivilrecht** (§ 9) | GOG SGS 170 § 8–9 (Abteilungen/Kammern), Stand 1.4.2018; sachl. Zuständigkeit EG ZPO SGS 221 | Gericht — **(A) identisch**: eine Abteilung Zivilrecht; Berufung = Beschwerde. |
| **SH** | Obergericht (Rechtsmittelinstanz Zivil, Art. 41) | Obergericht (Rechtsmittelinstanz Zivil, Art. 41) | JG SHR 173.200 Art. 41 (Rechtsmittelinstanz Zivil), Stand 1.5.2026 | **amtlich (GOG)** — **(A) identisch**: Art. 41 = «Rechtsmittelinstanz» Zivil; keine Berufung/Beschwerde-Trennung der Spruchkörper. |
| **AR** | Obergericht (Art. 24: Berufungs-/Beschwerdeinstanz) | Obergericht (Art. 24) | JG bGS 145.31 Art. 24 (Zivil: Berufungs-/Beschwerdeinstanz), Stand 1.6.2019 | **amtlich (GOG)** — **(A) identisch**: Art. 24 fasst Berufungs- *und* Beschwerdeinstanz zusammen. |
| **AI** | Kantonsgericht, Abteilung **Zivil- und Strafgericht** (Art. 11) | Kantonsgericht, Abteilung **Zivil- und Strafgericht** (Art. 11) | GOG GS 173.000 Art. 11 (Abteilungen) — Instanzrolle aus EG-ZPO, Stand 1.1.2024 | **amtlich (GOG)** — **(A) identisch**: eine zivil-/strafrechtliche Abteilung; Berufung = Beschwerde. |
| **SG** | Kantonsgericht, **Kammer** (Dreierbesetzung, Art. 12) | Kantonsgericht, **Kammer** (Art. 12) | GerG sGS 941.1 Art. 11–12 (Rechtsprechung durch Kammern von 3; Berufung/Beschwerde gegen Kreisgerichte), Stand 1.7.2018 | **amtlich (GOG)** — **(B)**: das Kantonsgericht spricht in Kammern von drei; Art. 12 nennt Berufung *und* Beschwerde gegen Kreisgerichte. Welche Kammer → Geschäftsverteilung. Berufung/Beschwerde nicht spruchkörper-trennend. |
| **GR** | Obergericht, **Abteilung** (Art. 37; Besetzung 3/5/Einzelrichter Art. 38; Berufung Art. 11 VGZ) | Obergericht, **Abteilung** (Art. 37/38; Beschwerde Art. 12 VGZ) | GOG BR 173.000 Art. 37 (Abteilungen) / Art. 38 (Besetzung), Stand 1.5.2026; VGZ BR 320.210 Art. 11 (Berufung) / Art. 12 (Beschwerde) bestätigen beide Rollen | **amtlich (GOG)** — **(B)**: post-Reform-Obergericht in Abteilungen; Berufung und Beschwerde beide am Obergericht, Spruchkörper-Zuteilung nach Geschäftsverteilung (Besetzung 3/5/Einzelrichter je Verfahren). |
| **AG** | Obergericht, **Zivilgericht** (§ 66; Rechtsmittel § 10 GebührD) | Obergericht, **Zivilgericht** (§ 66) | GOG SAR 155.200 § 65 (Gliederung) / § 66 (Zivil/Straf/Versicherung), Stand 1.4.2020 | **amtlich (GOG)** — **(A) identisch**: das Zivilgericht des Obergerichts behandelt Berufung *und* Beschwerde (Handelsgericht § 68 = einzige Instanz, kein Rechtsmittel). |
| **TG** | Obergericht (Berufungs-/Beschwerdeinstanz, § 26) | Obergericht (§ 26) | ZSRG RB 271.1 § 26 (Berufungs-/Beschwerdeinstanz nach ZPO/StPO), Stand 1.10.2025 | **amtlich (GOG)** — **(A) identisch**: § 26 fasst Berufungs- *und* Beschwerdeinstanz zusammen. |

### Romandie / Tessin

| Kt | Berufungs-Spruchkörper | Beschwerde-Spruchkörper | Rechtsgrundlage (konsolidiert) | Konfidenz |
|---|---|---|---|---|
| **TI** | **I./II./III. Camera civile** des Tribunale d'appello (appello) | **I./II./III. Camera civile** (reclamo); SchKG → **Camera di esecuzione e fallimenti** | LOG RL 177.100 Art. 42 (Sezioni) / Art. 48 lit. a–f (Zuständigkeit Zivilkammern), Stand 12.12.2025 | **amtlich (GOG)** — **(B)**: drei Zivilkammern + Camera esecuzione/fallimenti + Camera di protezione (KESB); appello *und* reclamo laufen in derselben Kammer, Zuteilung **nach Sachgebiet** (Art. 48 lit. a–f), nicht nach Rechtsmittel. SchKG-Sachen → eigene Camera esecuzione e fallimenti. |
| **VD** | **Cour d'appel civile** (Art. 84 LOJV) | **Chambre des recours civile** (Art. 73 LOJV) | LOJV RSV 173.01 **Art. 84** (Cour d'appel civile = appel Art. 308 CPC) / **Art. 73** (Chambre des recours civile = recours Art. 319 CPC), État dès 1.7.2017 | **amtlich (GOG) + Gericht** — **(C) DETERMINISTISCH nach Rechtsmittel**: appel → Cour d'appel civile; recours → Chambre des recours civile (vd.ch/ojv, beide Kammern bestätigt 6.6.2026). **Einziger Kanton mit sauberer Berufung/Beschwerde-Spruchkörper-Trennung.** Sonderkammern: Chambre des curatelles (KESB, Art. 76), Cour des poursuites et faillites (SchKG, Art. 75). |
| **VS** | Tribunal cantonal, **cour civile** (Art. 19 LOJ i.V.m. ROT) | Tribunal cantonal, **cour civile** (Art. 19 LOJ i.V.m. ROT) | LOJ RS 173.1 Art. 14/19 (Gliederung in cours), État 1.1.2024; Kammern namentlich erst im **ROT RS 173.100** | **amtlich (GOG, Rahmen) / Reglement offen** — **(A) identisch (vermutet)**: LOJ benennt die einzelnen cours nicht je Artikel; appel und recours der cour civile, konkrete Kammer/Besetzung aus ROT. ⚠ Vor Übernahme ROT RS 173.100 prüfen. |
| **NE** | Tribunal cantonal, **Cour civile** (Art. 40–42 OJN) | Tribunal cantonal, **Cour civile** (Art. 40–42 OJN) | OJN RSN 161.1 Art. 40–42 (Cour civile: appel/recours, einzige Instanz, SchKG-Aufsicht), État 1.1.2017 | **amtlich (GOG)** — **(A) identisch**: eine Cour civile für appel *und* recours; KESB-Rechtsmittel → Cour des mesures de protection (Art. 43). ⚠ NE-Umzug Sommer 2026 (Adress-Pflegepunkt, siehe Verfallsregister). |
| **GE** | Cour de justice, **Chambre civile** (Art. 119–120 LOJ) | Cour de justice, **Chambre civile** (Art. 119–120 LOJ) | LOJ rsGE E 2 05 Art. 119–120 (Chambre civile: Berufungsinstanz Zivil CPC), dernière modif. 1.6.2026 | **amtlich (GOG)** — **(A) identisch (Kernzivil)**: Chambre civile für appel *und* recours in Zivilsachen. Sondermaterien eigene Kammern: Chambre des baux et loyers (Miete, Art. 121), Chambre des prud'hommes (Arbeit, Art. 123), Chambre de surveillance (SchKG/KESB, Art. 125). → Spruchkörper hängt am **Sachgebiet**, nicht am Rechtsmittel. |
| **JU** | Tribunal cantonal, **Cour civile** (Art. 20 lit. b LOJ) | Tribunal cantonal, **Cour civile** (Art. 20 lit. b LOJ) | LOJ RSJU 181.1 Art. 20 lit. b (Cour civile), État 1.12.2025; SchKG → Cour des poursuites et faillites (Art. 20 lit. g) | **amtlich (GOG)** — **(A) identisch (Kernzivil)**: Cour civile für appel *und* recours; SchKG-Sachen → Cour des poursuites et faillites. |

---

## §3 Bundesgericht — Zuteilung Beschwerde in Zivilsachen (deterministisch nach Rechtsgebiet)

**Wichtige Korrektur ggü. Auftrag (§7):** Die zivilrechtlichen Abteilungen sind
im geltenden **Reglement für das Bundesgericht (BGerR, SR 173.110.131)** in
**Art. 33 (Erste zivilrechtliche Abteilung)** und **Art. 34 (Zweite
zivilrechtliche Abteilung)** geregelt — **nicht** in Art. 31/32 (so noch ältere
Reglements-Fassungen / die im Auftrag genannte Nummerierung). Die Sachgebiete
unten stammen aus der amtlichen Geschäftsverteilung des Bundesgerichts
(bger.ch, Abteilungs-Seiten, Abruf 6.6.2026); die formelle Grundlage ist Art.
33/34 BGerR.

⚠ Reglements-Wortlaut (Art. 33/34) noch nicht am Fedlex-Filestore-HTML
zeichengenau verifiziert (fedlex SR 173.110.131 / ELI cc/2006/871 lieferte am
6.6.2026 nur die JS-Shell; Sachgebiete daher von bger.ch übernommen) → vor
Produktivnahme am konsolidierten Volltext gegenlesen.

| Rechtsgebiet (Streitsache) | Zuständige Abteilung BGer | Grundlage |
|---|---|---|
| Obligationenrecht / Vertragsrecht | **I. zivilrechtliche** | Art. 33 BGerR |
| Ausservertragliches Haftpflichtrecht (inkl. Spezialgesetze) | **I. zivilrechtliche** | Art. 33 |
| Medizinische Staatshaftung | **I. zivilrechtliche** | Art. 33 |
| Versicherungsvertrag (VVG) | **I. zivilrechtliche** | Art. 33 |
| Privates Wettbewerbsrecht (UWG) | **I. zivilrechtliche** | Art. 33 |
| Immaterialgüterrecht (Marken/Patente/Urheberrecht) | **I. zivilrechtliche** | Art. 33 |
| Nationale + internationale Schiedsgerichtsbarkeit | **I. zivilrechtliche** | Art. 33 |
| **Provisorische + definitive Rechtsöffnung** (Art. 80–84 SchKG) | **I. zivilrechtliche** | Art. 33 — ⚠ **Ausnahme** zur SchKG→II.-Regel! |
| Personenrecht (ZGB) | **II. zivilrechtliche** | Art. 34 |
| Familienrecht (ZGB; Ehe/Scheidung/Kindes-/Erwachsenenschutz) | **II. zivilrechtliche** | Art. 34 |
| Erbrecht (ZGB) | **II. zivilrechtliche** | Art. 34 |
| Sachenrecht / Grundbuch (ZGB) | **II. zivilrechtliche** | Art. 34 |
| Bäuerliches Bodenrecht (BGBB) | **II. zivilrechtliche** | Art. 34 |
| Schuldbetreibung + Konkurs (SchKG) — **ohne Rechtsöffnung** | **II. zivilrechtliche** | Art. 34 |

**Deterministische Regel (decision-tree-fähig, Eingabe = Streitsache → Ausgabe
= Abteilung):**

```
wenn Streitsache ∈ {OR/Vertrag, Haftpflicht, med. Staatshaftung, VVG, UWG,
                    Immaterialgüter, Schiedsgericht, Rechtsöffnung 80–84 SchKG}
   → I. zivilrechtliche Abteilung (Art. 33 BGerR)
wenn Streitsache ∈ {Personenrecht, Familienrecht, Erbrecht, Sachenrecht/Grundbuch,
                    bäuerl. Bodenrecht, übriges SchKG}
   → II. zivilrechtliche Abteilung (Art. 34 BGerR)
```

**Achtung Fallstrick:** Die Rechtsöffnung (Art. 80–84 SchKG) ist trotz SchKG der
**I.** Abteilung zugewiesen — die einzige nicht-intuitive Zuteilung. Übriges
SchKG (Arrest, Kollokation, Aufsicht, Konkurs) → II. Abteilung.

---

## §4 Geltungsbereich, Ausnahmen, Pflegebedarf (§11 Ziff. 3/4)

- **Sondermaterien überschreiben die Kern-Zivilkammer** (mehrere Kantone): Miet-,
  Arbeits-, KESB- und SchKG-Rechtsmittel laufen vielfach in **eigenen Kammern**
  (z. B. GE Chambre des baux/prud'hommes/surveillance; VD Chambre des curatelles
  / Cour des poursuites et faillites; TI Camera di protezione / esecuzione e
  fallimenti; NE Cour des mesures de protection; JU Cour des poursuites et
  faillites). Eine generische «obere Instanz»-Angabe ohne Sachgebiets-Weiche ist
  dort fachlich unvollständig — aber für die heutige Fahrplan-Tiefe (Gericht +
  Adresse) genügt der Hauptspruchkörper.
- **Geschäftsverteilung ist jahresweise** (ZH/BE/TI/SG/GR): Welche von zwei/drei
  Zivilkammern einen konkreten Fall führt, ergibt sich aus der jährlich neu
  beschlossenen Geschäftsverteilung — **datierter Parameter**, kein stabiler
  Code-Wert. Daher bewusst **nicht** als deterministische Kammer verdrahten.
- **Pflege-Datum NE:** Umzug Tribunal cantonal Sommer 2026 (Adresse) — siehe
  [register/parameter-verfall.md](../register/parameter-verfall.md).
- **VS:** Kammergliederung des Tribunal cantonal steht im **ROT RS 173.100**
  (nicht im LOJ) — vor jeder Übernahme separat am ROT verifizieren.
- **ZG/SO:** Eigene Beschwerde-/Beschwerdeabteilung (ZG § 21, SO § 24) — der
  genaue Zivil-Beschwerde-Schnitt (Art. 319 ZPO) ist am §-Wortlaut + Reglement
  noch zu schärfen.

---

## §5 Verdrahtungs-Empfehlung für `src/data/obereInstanzen.ts`

**Grundsatz (§1/§2/§8):** Nur deterministisch + amtlich belegte Zuteilungen in
den Code; den Rest **bewusst offen** lassen (kein erfundener Spruchkörper).

Vorschlag — `ObereInstanz` um **optionale** Felder erweitern, gefüllt nur dort,
wo es trägt:

```ts
export interface ObereInstanz {
  name: string;
  strasse: string;
  plzOrt: string;
  hinweis?: string;
  /** Spruchkörper für die Berufung (Art. 308 ZPO) — nur wenn deterministisch belegt. */
  kammerBerufung?: string;
  /** Spruchkörper für die Beschwerde (Art. 319 ZPO) — nur wenn er sich VOM
   *  Berufungs-Spruchkörper unterscheidet (sonst weglassen). */
  kammerBeschwerde?: string;
  /** Quelle (Erlass + Art./§, konsolidierte Fassung) der Spruchkörper-Angabe. */
  quelleSpruchkoerper?: string;
}
```

**Befüllung — nur die belegten, deterministischen Fälle:**

| Kt | kammerBerufung | kammerBeschwerde | quelleSpruchkoerper |
|---|---|---|---|
| **VD** | `Cour d'appel civile` | `Chambre des recours civile` | `LOJV RSV 173.01 Art. 84 / Art. 73 (État 1.7.2017)` |
| **ZG** | `Zivilabteilung des Obergerichts` | `Beschwerdeabteilung des Obergerichts` | `GOG BGS 161.1 § 19 / § 21 (Stand 17.10.2025)` — ⚠ Beschwerde-Schnitt vor Übernahme bestätigen |
| **GE** | `Chambre civile de la Cour de justice` | *(weglassen — identisch)* | `LOJ rsGE E 2 05 Art. 119–120` |
| **TI** | `Camere civili del Tribunale d'appello` | *(weglassen — identisch, sachgebietsabhängig)* | `LOG RL 177.100 Art. 48` |
| **NE** | `Cour civile du Tribunal cantonal` | *(weglassen — identisch)* | `OJN RSN 161.1 Art. 40–42` |
| **JU** | `Cour civile du Tribunal cantonal` | *(weglassen — identisch)* | `LOJ RSJU 181.1 Art. 20 lit. b` |

**Bewusst NICHT verdrahten** (nur generischer `name`, kein Kammer-Feld):
ZH, BE, SG, GR (Geschäftsverteilung jahresweise — nicht deterministisch);
BS (streitwert-/verfahrensabhängige Besetzung, nicht rechtsmittelabhängig);
LU, FR, VS, SO (Abteilung/cour benannt, aber konkrete Kammer aus Reglement noch
nicht belegt); UR, OW, NW, GL, SZ, BL, SH, AR, AI, AG, TG (eine Zivilinstanz —
`kammerBerufung` = `kammerBeschwerde` = «Obergericht/Kantonsgericht», redundant
zum `name`, daher kein Mehrwert).

**BGer-Abteilung** gehört in die **Logikschicht** (`bestimmeRechtsmittel`,
§3-Schichtentrennung), nicht in `obereInstanzen.ts`: eine reine Funktion
`bgerZivilabteilung(streitsache) → 'I.' | 'II.'` nach der Regel-Tabelle §3,
Quelle Art. 33/34 BGerR. Erst nach Wortlaut-Verifikation am Fedlex-Volltext und
fachlicher Abnahme.

---

## §6 Quellen (Abruf 6.6.2026)

- GOG-Artikel + Abteilungsgliederung 26 Kantone: zweifach geprüftes Dossier
  [gog-gerichtsorganisation-kantone.md](gog-gerichtsorganisation-kantone.md)
  (Stand 5.6.2026; amtliche kantonale Erlasssammlungen).
- VD: vd.ch/ojv — Cour d'appel civile & Chambre des recours civile
  (Zuständigkeit appel Art. 308 / recours Art. 319 CPC), LOJV RSV 173.01.
- ZH: gerichte-zh.ch — Aufgaben I. + II. Zivilkammer; Org-Verordnung LS 212.51.
- BE: zsg.justice.be.ch — Zivilabteilung Obergericht (zwei Zivilkammern).
- TI: entscheidsuche.ch / LOG Art. 48 — Camere civili I–III + Camera esecuzione/
  fallimenti + Camera di protezione.
- BGer Abteilungen: bger.ch — Erste & Zweite zivilrechtliche Abteilung
  (Sachgebiets-Kataloge), formelle Grundlage Art. 33/34 BGerR (SR 173.110.131).

**Status:** Erstrecherche. Spruchkörper-Zuordnungen mit Konfidenz «amtlich (GOG)»
stützen sich auf das zweifach geprüfte GOG-Dossier; die Berufung/Beschwerde-
Zuteilung je Spruchkörper ist über Gerichts-Websites belegt, aber als
Gesamtbild noch **nicht** adversarial gegengeprüft. BGerR Art. 33/34 Wortlaut +
ZG/SO/VS-Reglemente vor Code-Übernahme verifizieren. Abnahme durch David
ausstehend.

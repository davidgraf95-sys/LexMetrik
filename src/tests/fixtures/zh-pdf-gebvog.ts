/**
 * Echter, gekürzter Ausschnitt der extrahierten PDF-Textbasis der ZH-Quelle
 * (Gebührenverordnung des Obergerichts, GebV OG, LS 211.11), erzeugt vom
 * ZH-PDF-Adapter (pdfjs-Extraktion + serialisiereZhZeilen).
 *
 * Quelle: zh.ch/.../zhlex-ls/erlass-211_11-… → notes.zh.ch …/$File/211.11_8.9.10_87.pdf
 *
 * NEU ERZEUGT am 31.8.2026 (Fix-Runde ZH-Extraktion). Die vorige Fassung stammte
 * vom 16.6.2026, als die Zeilenmontage ein Leerzeichen erst ab 18 pt
 * Fragmentlücke setzte; sie zeigte darum durchgehend zusammengelaufenen Text
 * («§4.Die …», «a.Gebühren …», «bis1000», «StreitwertGrundgebühr»). Seit die
 * Wort-Lücke geometrisch ausgewertet wird (WORT_LUECKE_PT = 0.8 pt, am
 * Druckbild verifiziert), gibt die Extraktion den Satz der Zürcher Sammlung
 * wieder — inklusive des Tausender-Zwischenraums («1 000», «16 750») und des
 * gesetzten Abstands vor dem Buchstaben-Suffix («§ 4 a.»).
 *
 * Enthält § 1–5 unverändert aus der echten Extraktion. Eigenheiten, die der
 * reine Parser (extrahiereZhParagraphen) tragen muss (§7):
 *   - «§ N.» als Artikelgrenze, NUR am Zeilenanfang.
 *   - Absatz-Marker «¶N» (hochgestellte Ziffer) auf EIGENER Zeile.
 *   - lit.-Punkte «a.»/«b.»/«c.».
 *   - Silbentrennung am Zeilenende («Gebüh-\nren» → «Gebühren»; «Zeitaufwan-\ndes»).
 *   - Gliederungs-Zeilen («B. Schlichtungsverfahren», «C. Zivilprozess»)
 *     zwischen den Artikeln, die NICHT zum Normtext gehören.
 *   - Umlaute ä/ö/ü/é (Dekodierung korrekt).
 *   - Gebühren-Tabellen als Flachtext (im Snapshot durch die spaltenbewusste
 *     Staffel-Extraktion ersetzt, s. extrahiereZhStreitwertStaffel).
 */
export const ZH_GEBVOG_TEXT = `§ 1. Diese Verordnung regelt folgende Kosten eines Zivil- oder
Strafverfahrens:
a. Gebühren für das Schlichtungsverfahren (Art. 95 Abs. 2 lit. a ZPO),
b. Entscheidgebühren der Zivilgerichte (Art. 95 Abs. 2 lit. b ZPO),
c. Entscheidgebühren der Strafgerichte (Art. 422 Abs. 1 StPO).
¶1 
§ 2. Grundlage für die Festsetzung der Gebühren bilden:
a. im Zivilprozess: Streitwert bzw. tatsächliches Streitinteresse,
b. im Strafprozess: Bedeutung des Falls,
c. Zeitaufwand des Gerichts,
d. Schwierigkeit des Falls.
¶2 
Die Kosten für Vorladungen, die Telekommunikation sowie die
Ausfertigung und die Zustellung von Entscheiden sind in den Gebüh-
ren enthalten.
B. Schlichtungsverfahren
¶1 
§ 3. Bei vermögensrechtlichen Streitigkeiten beträgt die Gebühr
für das Schlichtungsverfahren:
Streitwert Gebühr
(in Franken) (in Franken)
bis 1 000 65– 250
über 1 000 bis 10 000 250– 420
über 10 000 bis 100 000 420– 615
über 100 000 615–1240
¶2 
Bei nicht vermögensrechtlichen Streitigkeiten beträgt die Gebühr
Fr. 100 bis Fr. 850.
¶3 
Entscheidet die Schlichtungsbehörde die Streitigkeit oder unter-
breitet sie den Parteien einen Urteilsvorschlag, kann sie die Gebühr bis
um die Hälfte erhöhen.
C. Zivilprozess
¶1 
§ 4. Die Gebühren betragen:
Streitwert Grundgebühr
(in Franken) (in Franken)
bis 1 000 25% des Streitwertes, mind. Fr. 150
über 1 000 bis 5 000 250 zuzügl. 20% des Fr. 1 000 übersteigenden Streitwertes
über 5 000 bis 20 000 1 050 zuzügl. 14% des Fr. 5 000 übersteigenden Streitwertes
über 20 000 bis 80 000 3 150 zuzügl. 8% des Fr. 20 000 übersteigenden Streitwertes
über 80 000 bis 300 000 7 950 zuzügl. 4% des Fr. 80 000 übersteigenden Streitwertes
über 300 000 bis 1 Mio. 16 750 zuzügl. 2% des Fr. 300 000 übersteigenden Streitwertes
über 1 Mio. bis 10 Mio. 30 750 zuzügl. 1% des Fr. 1 Mio. übersteigenden Streitwertes
über 10 Mio. 120 750 zuzügl. 0,5% des Fr. 10 Mio. übersteigenden Streitwertes
¶2 
Die Grundgebühr kann unter Berücksichtigung des Zeitaufwan-
des des Gerichts und der Schwierigkeit des Falls ermässigt oder um bis
zu einem Drittel, in Ausnahmefällen bis auf das Doppelte, erhöht wer-
den.
¶3 
Bei Streitigkeiten über wiederkehrende Nutzungen oder Leistun-
gen gemäss Art. 92 ZPO wird die Grundgebühr in der Regel ermässigt.
¶1 
§ 5. Bei nicht vermögensrechtlichen Streitigkeiten wird die Ge-
bühr nach dem tatsächlichen Streitinteresse, dem Zeitaufwand des
Gerichts und der Schwierigkeit des Falles bemessen. Sie beträgt in der
Regel Fr. 300 bis Fr. 13 000.
¶2 
Ist im Rahmen von nicht vermögensrechtlichen Streitigkeiten auch
über vermögensrechtliche Rechtsbegehren zu entscheiden, die das Ver-
fahren aufwendig gestalten, kann die Gebühr bis zum Betrag erhöht
werden, der für den Entscheid über die vermögensrechtlichen Rechts-
begehren allein zu erheben wäre.`;

/** Roh-Text aus dem PDF-Kopf-/Fussband (für leseZhStand): «1. 1. 15 - 87». */
export const ZH_GEBVOG_RANDTEXT =
  '1 Gebührenverordnung des Obergerichts (GebV OG) 211.11 1. 1. 15 - 87';

/**
 * Echter, gekürzter Ausschnitt der extrahierten PDF-Textbasis der ZH-Quelle
 * (Gebührenverordnung des Obergerichts, GebV OG, LS 211.11), erzeugt vom
 * ZH-PDF-Adapter (pdfjs-Extraktion + serialisiereZhZeilen) am 16.6.2026.
 *
 * Quelle: zh.ch/.../zhlex-ls/erlass-211_11-… → notes.zh.ch …/$File/211.11_8.9.10_87.pdf
 *
 * Enthält § 1–5 unverändert aus der echten Extraktion. Eigenheiten, die der
 * reine Parser (extrahiereZhParagraphen) tragen muss (§7):
 *   - «§ N.» als Artikelgrenze (kein Leerzeichen vor dem Text: «§4.Die …»).
 *   - Absatz-Marker «¶N» (hochgestellte Ziffer am Zeilenanfang) auf EIGENER Zeile.
 *   - lit.-Punkte «a.»/«b.»/«c.» (kein Leerzeichen: «a.Gebühren …»).
 *   - Silbentrennung am Zeilenende («Gebüh-\nren» → «Gebühren»; «Zeitaufwan-\ndes»).
 *   - Gliederungs-/Müll-Zeilen («B. Schlichtungsverfahren», «C. Zivilprozess»)
 *     zwischen den Artikeln, die NICHT zum Normtext gehören (best-effort: sie
 *     hängen am Ende des vorangehenden Absatzes, da sie keinen §/¶-Marker tragen).
 *   - Umlaute ä/ö/ü/é (Dekodierung korrekt).
 *   - Gebühren-Tabellen mit zusammengelaufenen Zahlen (bekannte Lese-Einbusse).
 */
export const ZH_GEBVOG_TEXT = `§1.Diese Verordnung regelt folgende Kosten eines Zivil- oder
Strafverfahrens:
a.Gebühren für das Schlichtungsverfahren (Art. 95 Abs. 2 lit. a ZPO),
b.Entscheidgebühren der Zivilgerichte (Art. 95 Abs. 2 lit. b ZPO),
c.Entscheidgebühren der Strafgerichte (Art. 422 Abs. 1 StPO).
¶1
§2.Grundlage für die Festsetzung der Gebühren bilden:
a.im Zivilprozess: Streitwert bzw. tatsächliches Streitinteresse,
b.im Strafprozess: Bedeutung des Falls,
c.Zeitaufwand des Gerichts,
d.Schwierigkeit des Falls.
¶2
Die Kosten für Vorladungen, die Telekommunikation sowie die
Ausfertigung und die Zustellung von Entscheiden sind in den Gebüh-
ren enthalten.
B. Schlichtungsverfahren
¶1
§3.Bei vermögensrechtlichen Streitigkeiten beträgt die Gebühr
für das Schlichtungsverfahren:
StreitwertGebühr
(in Franken)(in Franken)
bis100065–250
über1000bis10000250–420
über10000bis100000420–615
über100000615–1240
¶2
Bei nicht vermögensrechtlichen Streitigkeiten beträgt die Gebühr
Fr. 100 bis Fr. 850.
¶3
Entscheidet die Schlichtungsbehörde die Streitigkeit oder unter-
breitet sie den Parteien einen Urteilsvorschlag, kann sie die Gebühr bis
um die Hälfte erhöhen.
C. Zivilprozess
¶1
§4.Die Gebühren betragen:
StreitwertGrundgebühr
(in Franken)(in Franken)
bis1000 25% des Streitwertes, mind. Fr. 150
über1000 bis5000250 zuzügl.20%des Fr.1000übersteigenden Streitwertes
über5000 bis200001050 zuzügl.14%des Fr.5000übersteigenden Streitwertes
über20000 bis800003150 zuzügl.8%des Fr.20000übersteigenden Streitwertes
über80000 bis3000007950 zuzügl.4%des Fr.80000übersteigenden Streitwertes
über300000 bis1 Mio.16750 zuzügl.2%des Fr. 300000übersteigenden Streitwertes
über1 Mio. bis10 Mio.30750 zuzügl.1%des Fr.1 Mio. übersteigenden Streitwertes
über10 Mio.120750 zuzügl.0,5%des Fr.10 Mio. übersteigenden Streitwertes
¶2
Die Grundgebühr kann unter Berücksichtigung des Zeitaufwan-
des des Gerichts und der Schwierigkeit des Falls ermässigt oder um bis
zu einem Drittel, in Ausnahmefällen bis auf das Doppelte, erhöht wer-
den.
¶3
Bei Streitigkeiten über wiederkehrende Nutzungen oder Leistun-
gen gemäss Art. 92 ZPO wird die Grundgebühr in der Regel ermässigt.
¶1
§5.Bei nicht vermögensrechtlichen Streitigkeiten wird die Ge-
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

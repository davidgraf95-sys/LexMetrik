/**
 * Echte, gekürzte Ausschnitte der extrahierten PDF-Textbasis der vier
 * Einzelspalten-PDF-Quellen (SZ/TI/VD/JU), erzeugt vom generischen PDF-Adapter
 * (pdfjs-Extraktion + serialisierePdfZeilen) am 16.6.2026. Dienen als Fixtures
 * für den reinen Parser extrahiereAllePdfArtikel (ohne pdfjs/Netz, §7).
 *
 * Jede Fixture trägt die Eigenheiten ihres Profils:
 *   - SZ: «§ N» auf eigener Zeile, «¶N» (Absatznummer) auf eigener Folgezeile,
 *     Silbentrennung am Zeilenende («Be-\nzirke» → «Bezirke»). Deutsch, Umlaute.
 *   - TI: «Art. N La presente …» (Resttext im selben Kopf-Stück), «¶N» VOR der
 *     Kopfzeile (hängende Absatznummer), lit. «a)»/«b)». Italienisch, é/à/è/ù.
 *   - VD: «Art. N Objet» (Sachtitel im Kopf-Stück), «¶N» auf eigener Zeile,
 *     Fussnoten-Verweise «(art. 95 al. 2 CPC )» (Verweis-Lücke). Französisch.
 *   - JU: «Article premier …» (Art. 1) bzw. «Art. N …», stark fragmentierter
 *     Body (Wort-Trennung über x-Lücken), «ci-après», Anführungszeichen.
 *     Französisch, à/é/è.
 */

// ── SZ (GebO, SRSZ 173.111) — § 1–2 ──────────────────────────────────────────
export const SZ_GEBO_TEXT = `§ 1
¶1
Diese Verordnung regelt die Gebühren für die Verwaltung des Kantons, der Be-
zirke und der Gemeinden und für die Rechtspflege, soweit nicht durch Bundes-
recht, Staatsverträge oder besondere Erlasse des Kantons und, im Rahmen ihrer
Autonomie, der Bezirke und der Gemeinden eine abweichende Regelung gilt.
¶2
Der Regierungsrat erlässt einen Gebühren-Tarif.
§ 2
¶1
Benützungs-, Verwaltungs- und Gerichtsgebühren dürfen nur erhoben werden,
soweit sie in dieser Verordnung oder in einem andern gesetzlichen Erlass oder im
Gebühren-Tarif vorgesehen sind.
¶2
Für Amtshandlungen, für welche in den nachstehenden Bestimmungen und in
andern Erlassen keine besonderen Gebühren bezeichnet sind, kann eine Gebühr
von Fr.30.-- bis Fr.5000.-- erhoben werden.`;

/** SZ-Rand (Fussband «SRSZ D.M.YYYY», Stand-Quelle). */
export const SZ_GEBO_RANDTEXT =
  'SRSZ 1.2.2026 1 173.111 Gebührenordnung für die Verwaltung und die Rechtspflege im Kanton Schwyz';

// ── TI (LTG, RL 178.200) — Art. 1–2 ──────────────────────────────────────────
export const TI_LTG_TEXT = `Art. 1 La presente legge stabilisce la tariffa delle spese processuali per l’amministrazione
della giustizia civile e penale.
Sono riservate le leggi speciali.
Tassa di giustizia
Art. 2 La tassa di giustizia è fissata in considerazione del valore, della natura e della
complessità dell’atto o della causa.
Nel caso di manifesta sproporzione tra il valore, la natura e la complessità della causa e la tariffa della
presente legge, l’autorità competente può derogare ai limiti imposti dalla tariffa.
Competenza dell’incasso`;

/** TI-Präambel (Erlassdatum «(del 30 novembre 2010)», Stand-Quelle). */
export const TI_LTG_PRAEAMBEL =
  '(del 30 novembre 2010) IL GRAN CONSIGLIO DELLA REPUBBLICA E CANTONE TICINO';

// ── VD (TFJC, BLV 270.11.5) — Art. 1–2 ───────────────────────────────────────
export const VD_TFJC_TEXT = `Art. 1 Objet
¶1
Le présent tarif fixe les frais judiciaires dus pour l'administration de la justice civile et les émoluments
de chancellerie.
¶2
Sont réservées les dispositions de droit fédéral et cantonal en matière de poursuite pour dettes et
faillite, de registre du commerce et de registre foncier.
Art. 2 Définitions
¶1
Les frais judiciaires comprennent les émoluments forfaitaires de conciliation et de décision, les frais
d'administration des preuves, les frais de traduction et les frais de représentation de l'enfant
(art. 95 al. 2 CPC ).
¶2
Les émoluments de chancellerie sont ceux perçus par les autorités judiciaires pour des opérations
non comprises dans les frais judiciaires, qui sont requises à l'occasion ou en dehors d'une procédure.`;

/** VD-Rand (lexfind-Metazeile «Entrée en vigueur dès le …», Stand-Quelle). */
export const VD_TFJC_RANDTEXT =
  '1 Entrée en vigueur dès le 01.09.2019 (Actuelle) Document généré le : 01.09.2019';

// ── JU (Décret RSJU 176.511) — Article premier–Art. 3 ────────────────────────
export const JU_DECRET_TEXT = `Article premier Le présent décret fixe les émoluments perçus et
certaines indemnités versées par les autorités judiciaires ou arbitrales en
matière civile, pénale et administrative, ainsi que par la Commission
cantonale des recours en matière d'impôts (dénommées ci-après : "les
autorités judiciaires").
¶2
Les dispositions du droit fédéral et intercantonal, ainsi que les
dispositions de procédure relatives aux frais, sont réservées.
Art. 2 Les termes utilisés dans le présent décret pour désigner des
personnes s'appliquent indifféremment aux femmes et aux hommes.
Art. 3 Les autorités judiciaires perçoivent les émoluments fixés par le
présent décret.
¶2
Elles perçoivent, en plus, leurs débours qui doivent figurer dans leurs
actes et états de frais.`;

/** JU-Präambel (Erlassdatum «du 24 mars 2010», Stand-Quelle). */
export const JU_DECRET_PRAEAMBEL =
  'Décret fixant les émoluments judiciaires du 24 mars 2010 Le Parlement de la République et Canton du Jura';

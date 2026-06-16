/**
 * Echter, gekürzter HTML-Ausschnitt der NE-Quelle rsn.ne.ch (windows-1252,
 * Word-Export), bereits nach UTF-8 dekodiert.
 *
 * Quelle: https://rsn.ne.ch/DATA/program/books/RSN2024/20245/htm/164.1.htm —
 * Loi fixant le tarif des frais (LTFrais, RSN 164.1), abgerufen 16.6.2026.
 *
 * Enthält Kopf (Titel + «État au 1er avril 2023»), Art. 1 («Article premier»,
 * mit Fussnoten-Anker [9]), Art. 5 (mehrere Absätze + lit. a)/b) als xRetrait1a)
 * und Art. 11 (Fussnote + sup-Absatznummern, inkl. <sup>1bis</sup>, mit einer
 * eingebetteten Word-Tabelle). Eigenheiten, die der Parser tragen muss (§7):
 *   - Artikel-Kopf <p class=xNormal><a name="LVMPART_N"><b>Art. N</b></a>…Text…</p>
 *     mit dem Absatztext im SELBEN <p>.
 *   - Marginalie <p class=xMarginale> VOR dem Artikel (kein Normtext).
 *   - Fussnoten-Anker <a href="#_ftn…"><span class=MsoFootnoteReference>[9]</span></a>.
 *   - Folge-Absätze als <p class=xNormal> mit führendem <sup>N</sup>/<sup>1bis</sup>.
 *   - frz. Sonderzeichen é/à/ç, typografische Apostrophe.
 */
export const NE_LTFRAIS_HTM = `<table class=MsoNormalTable>
 <tr><td><p class=xTitre><a name="LVMPTIT_0">Loi fixant le tarif des frais (LTFrais)</a></p></td></tr>
 <tr><td><p class=xEdition>État au<br>
  1<sup>er</sup> avril 2023</p></td></tr>
</table>

<p class=MsoNormal style='margin-bottom:6.0pt'><i>Le Grand Conseil de la
République et Canton de Neuchâtel,</i> </p>

<p class=xMarginale style='page-break-after:auto'><a name="LVMPMRG_1">Champ
d'application </a></p>

<p class=xNormal><a name="LVMPART_1"><b>Article premier</b></a><a href="#_ftn10"
name="_ftnref10" title=""><span class=MsoFootnoteReference><b><span
style='font-size:7.0pt'><span class=MsoFootnoteReference><b><span
style='font-size:7.0pt;font-family:"Arial",sans-serif'>[9]</span></b></span></span></b></span></a><b>
</b><span lang=FR>Les frais, les émoluments de chancellerie et les dépens en
matière civile, pénale ainsi qu'en matière administrative de recours et
d’action de droit administratif, sont fixés conformément à la présente loi.</span><span
lang=FR> </span> </p>

<p class=xLigneBlanche> </p>

<p class=xMarginale style='page-break-after:auto'><a name="LVMPMRG_5">Perception
</a></p>

<p class=xNormal><a name="LVMPART_5"><b>Art. 5</b></a><b>   </b><sup>1</sup>En
matière civile, les frais et les émoluments de chancellerie sont perçus par le
greffe. </p>

<p class=xNormal><sup>2</sup>En matière pénale, ils sont perçus par le service
de la justice.  </p>

<p class=xNormal><sup>3</sup>En matière administrative, ils sont perçus : </p>

<p class=xRetrait1a><i>a)</i>  pour les décisions rendues par la Cour de droit
public, par le greffe ;  </p>

<p class=xRetrait1a><i>b)</i>  pour les décisions rendues par d'autres
autorités cantonales, par le service désigné par le Conseil d'État. </p>

<p class=xLigneBlanche> </p>

<p class=xNomChapitre style='page-break-after:auto'><a name="LVMPCHN_3">Émolument
forfaitaire de conciliation </a></p>

<p class=xNormal><a name="LVMPART_11"><b>Art. 11</b></a><a href="#_ftn11"
name="_ftnref11" title=""><span class=MsoFootnoteReference><b><span
style='font-size:7.0pt'><span class=MsoFootnoteReference><b><span
style='font-size:7.0pt;font-family:"Arial",sans-serif'>[10]</span></b></span></span></b></span></a><b>
</b><sup>1</sup>L'émolument forfaitaire de conciliation est fixé selon le tarif
suivant : </p>

<p class=xRetrait1a>-    si la valeur litigieuse est :</p>

<table class=MsoTableGrid border=1 cellspacing=0 cellpadding=0>
 <tr>
  <td><p class=MsoNormal>jusqu'à 2'000.-</p></td>
  <td><p class=MsoNormal align=right>300.-</p></td>
 </tr>
 <tr>
  <td><p class=MsoNormal>de 2'001.- à 5'000.-</p></td>
  <td><p class=MsoNormal align=right>400.-</p></td>
 </tr>
</table>

<p class=xNormal><sup>1bis</sup>Si l’affaire est de nature non patrimoniale,
l’émolument forfaitaire de décision est fixé entre 300 et 2'500 francs. </p>

<p class=xNormal><sup>2</sup>Si l’affaire a nécessité peu de travail, les frais
peuvent être réduits jusqu’à 300 francs. </p>

<p class=xLigneBlanche> </p>`;

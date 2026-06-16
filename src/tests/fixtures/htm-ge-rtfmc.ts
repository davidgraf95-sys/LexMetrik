/**
 * Echter, gekürzter HTML-Ausschnitt der GE-Quelle silgeneve.ch (windows-1252,
 * Word-Export), bereits nach UTF-8 dekodiert.
 *
 * Quelle: https://silgeneve.ch/legis/data/rsg_e1_05p10.htm — Règlement fixant
 * le tarif des frais en matière civile (RTFMC, E 1 05.10), abgerufen 16.6.2026.
 *
 * Enthält Kopf (Titel + «Dernières modifications au 1er juillet 2025»),
 * Tvigueur-Daten, Partie-Gliederung sowie Art. 1–4 unverändert aus der Quelle.
 * Eigenheiten, die der Parser tragen muss (§7):
 *   - <p class=article>Art. N&nbsp;… Sachtitel</p> (Nummer + Sachtitel im selben <p>).
 *   - Mehrere Absätze je Artikel als <p class=TexteTL> mit führendem <sup>N</sup>.
 *   - Revisionsmarke <sup>(6)</sup> im Artikel-Kopf (Art. 3) und am Absatzende.
 *   - frz. Sonderzeichen é/à/ç.
 */
export const GE_RTFMC_HTM = `<p class=TexteTL align=center style='text-align:center'><b><span lang=FR
style='font-size:12.0pt;font-family:"Arial",sans-serif'>Dernières modifications
au 1<sup>er</sup> juillet 2025</span></b></p>

<table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0>
 <tr>
  <td><p class=TitreLoi>Règlement fixant le tarif des frais en matière civile<br>
  (RTFMC)</p></td>
  <td><p class=NoLoi><a name=Reference>E 1 05.10</a></p></td>
 </tr>
 <tr>
  <td><p class=Tadopt><span lang=FR>22.12.2010</span></p></td>
  <td><p class=Tvigueur><span lang=FR>01.01.2011</span></p></td>
 </tr>
 <tr>
  <td><p class=Tadopt><span lang=FR>23.05.2012</span></p></td>
  <td><p class=Tvigueur style='margin-top:2.0pt'><span lang=FR>07.06.2012</span></p></td>
 </tr>
 <tr>
  <td><p class=Tadopt><span lang=FR>14.05.2025</span></p></td>
  <td><p class=Tvigueur><span lang=FR>01.07.2025</span></p></td>
 </tr>
</table>

<p class=partie>Partie
I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
Dispositions générales</p>

<p class=retour1>&nbsp;</p>

<p class=article>Art. 1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Objet</p>

<p class=TexteTL><span lang=FR style='font-family:"Arial",sans-serif'>Le
présent règlement fixe le tarif des frais, soit des frais judiciaires et des
dépens, applicable aux affaires civiles contentieuses et gracieuses, à moins
que le droit cantonal, le droit fédéral ou des conventions intercantonales ou
internationales n'en disposent autrement.</span></p>

<p class=retour2>&nbsp;</p>

<p class=article>Art. 2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Avance de
frais</p>

<p class=TexteTL><sup><span style='font-family:"Arial",sans-serif'>1</span></sup><span
style='font-family:"Arial",sans-serif'>&nbsp;La juridiction peut exiger du
demandeur une avance de frais, conformément à l'article 19 de la loi
d'application du code civil.</span><sup><span style='font-size:7.0pt;
font-family:"Arial",sans-serif'>(6)</span></sup></p>

<p class=TexteTL><sup><span style='font-family:"Arial",sans-serif'>2</span></sup><span
style='font-family:"Arial",sans-serif'>&nbsp;En cours de procédure, la
juridiction peut exiger un complément d'avance de frais lorsque celle-ci paraît
insuffisante.</span><sup><span style='font-size:7.0pt;font-family:"Arial",sans-serif'>(6)</span></sup></p>

<p class=TexteTL><sup><span style='font-family:"Arial",sans-serif'>4</span></sup><span
lang=FR style='font-family:"Arial",sans-serif'>&nbsp;En cas d'irrecevabilité de
la cause pour défaut de paiement de l'avance, un émolument de décision de
100&nbsp;francs à 200&nbsp;francs peut être perçu.</span></p>

<p class=retour2>&nbsp;</p>

<p class=article>Art. 3<sup><span style='font-size:7.0pt;font-weight:normal'>(6)</span></sup>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
Obligation d'indiquer la valeur litigieuse</p>

<p class=TexteTL><span lang=FR style='font-family:"Arial",sans-serif'>Les
parties doivent indiquer la valeur litigieuse en première et deuxième
instances.</span></p>

<p class=retour2>&nbsp;</p>

<p class=article>Art. 4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Obligation
d'informer sur les frais</p>

<p class=TexteTL><span lang=FR style='font-family:"Arial",sans-serif'>Le
tribunal informe la partie qui n'est pas assistée d'un avocat sur le montant
probable des frais (frais judiciaires et dépens) et sur l'institution de
l'assistance juridique.</span></p>

<p class=retour2>&nbsp;</p>`;

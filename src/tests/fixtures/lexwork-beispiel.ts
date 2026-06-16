/**
 * Echter, gekürzter xhtml_tol-Ausschnitt der LexWork-API.
 *
 * Quelle: GET https://bgs.zg.ch/api/de/texts_of_law/161.7 (ZG, Kostenverordnung
 * Obergericht / KoV OG), Feld text_of_law.selected_version.xhtml_tol, abgerufen
 * 16.6.2026. version_uid 0129f9eb690727ba4eed9e8d474e19d2.
 *
 * Enthält die §§ 1–3 unverändert aus der API (nur am Anfang/Ende beschnitten):
 *   - § 1  ein Absatz
 *   - § 2  zwei Absätze
 *   - § 3  zwei Absätze, Abs. 1 mit Buchstaben-Aufzählung (enumeration_item a–c)
 *
 * Eigenheiten der REALEN Struktur (Spike 16.6.2026), die der Parser tragen muss:
 *   - article-Symbol ist hier «&sect;» (§); BE 161.12 nutzt «Art.» — irrelevant,
 *     weil der Token aus dem .number-Span gelesen wird, nicht aus dem Symbol.
 *   - article / paragraph / enumeration_item sind GESCHWISTER (nicht verschachtelt).
 *   - Aufzählungs-Nummer steht als «a)» (nicht «a.») im td.number.
 *   - Aufzählungs-Text liegt direkt im td.left_col, NICHT in einem text_content-Span.
 *   - Änderungs-Marker «<strong>*</strong>» und &nbsp; kommen im Text vor und
 *     werden bereinigt.
 */
export const LEXWORK_XHTML_BEISPIEL = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>1</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Geltungsbereich</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Diese Verordnung regelt die amtlichen Kosten in Zivil- und Strafverfahren sowie die ausserprozessualen Geb&uuml;hren.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>2</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Zusammensetzung der Kosten</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die Kosten setzen sich zusammen aus der Geb&uuml;hr und allf&auml;lligen Auslagen.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>Geb&uuml;hren sind die Pauschalen zur Deckung des Verfahrensaufwands und f&uuml;r den Entscheid.&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>3</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Bemessung der Geb&uuml;hr</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Grundlage f&uuml;r die Festsetzung der Geb&uuml;hr bilden:&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>
        a)&nbsp;<strong>*</strong>
      </td>
      <td class='left_col last' colspan='3'>
        der Streitwert bzw. das tats&auml;chliche Streitinteresse in Zivilverfahren;
      </td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>
        b)&nbsp;<strong>*</strong>
      </td>
      <td class='left_col last' colspan='3'>
        die Bedeutung des Falls;
      </td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>
        c)
      </td>
      <td class='left_col last' colspan='3'>
        der Zeitaufwand und die Schwierigkeit des Falls.
      </td>
    </tr>
  </table>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>Der Streitwert gem&auml;ss Abs. 1 Bst. a wird nach Art. 91 &ndash; 94 ZPO bestimmt.&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <div class='paragraph_post'></div>`;

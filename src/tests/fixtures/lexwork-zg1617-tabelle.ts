/**
 * Echter, gekürzter xhtml_tol-Ausschnitt der LexWork-API mit Gebühren-TABELLE.
 *
 * Quelle: GET https://bgs.zg.ch/api/de/texts_of_law/161.7 (ZG, Kostenverordnung
 * Obergericht / KoV OG), Feld text_of_law.selected_version.xhtml_tol, abgerufen
 * 16.6.2026. Enthält § 11 (Ordentliches und vereinfachtes Verfahren): ein
 * Einleitungs-Absatz «Die Entscheidgebühr beträgt:» gefolgt von einer
 * <table class='enumeration_tabular'> mit Header-Zeile (<th>) und Staffel-Zeilen
 * (<td>): Streitwert · Gebühr · höchstens %.
 *
 * Eigenheit (verifiziert 16.6.2026): Die Gebührentabelle ist <table
 * class='enumeration_tabular'> (NICHT 'enumeration_item' — das ist die
 * Buchstaben-Aufzählung) und steht als GESCHWISTER nach dem Einleitungs-Absatz.
 * Nur die ersten drei Staffel-Zeilen sind hier behalten (Rest beschnitten).
 */
export const LEXWORK_ZG1617_TABELLE_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>11</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Ordentliches und vereinfachtes Verfahren</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Im ordentlichen und im vereinfachten Verfahren betr&auml;gt die Entscheidgeb&uuml;hr:&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th>
        Streitwert in Franken
      </th>
      <th>
        Geb&uuml;hr in Franken
      </th>
      <th>
        jedoch h&ouml;chstens % des Streitwerts
      </th>
    </tr>
    <tr>
      <td>
        bis 1000&nbsp;<strong>*</strong>
      </td>
      <td>
        von 100 bis 200&nbsp;<strong>*</strong>
      </td>
      <td></td>
    </tr>
    <tr>
      <td>
        &uuml;ber 1000 bis 3000&nbsp;<strong>*</strong>
      </td>
      <td>
        von 220 bis 540&nbsp;<strong>*</strong>
      </td>
      <td>
        22
      </td>
    </tr>
    <tr>
      <td>
        &uuml;ber 3000 bis 5000&nbsp;<strong>*</strong>
      </td>
      <td>
        von 540 bis 800&nbsp;<strong>*</strong>
      </td>
      <td>
        18
      </td>
    </tr>
  </table>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>12</span>
    </div>
  </div>`;

/**
 * Echter Fussnoten-Anker-Ausschnitt (GL III B/7/1, «…Fusionsgesetz[8]:»),
 * abgerufen 16.6.2026 von gesetze.gl.ch. Der <a class='footnote'>[8]</a> darf
 * NICHT als «[8]»/«8» im Normtext stehen bleiben (§7 Treue).
 */
export const LEXWORK_GL_FUSSNOTE_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>5</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Verm&ouml;gens&uuml;bertragung nach Fusionsgesetz<a class="footnote" name="enumeration_itemtext_content_fn_467305_2_8" href="#enumeration_itemtext_content_fn_467305_2_8_c" id="enumeration_itemtext_content_fn_467305_2_8">[8]</a>:</span>
    </p>
  </div>`;

/**
 * Mini-Fixture für Token-Normalisierung: Artikelnummer «1a» (mit &nbsp; und
 * Änderungs-Marker, wie BE 169.81 liefert). Inventar-Token aus parsePassus
 * ('Art. 1a') ist '1_a' (Unterstrich) — der Matching-Vergleich muss beide
 * normalisieren.
 */
export const LEXWORK_BE_ART1A_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>1a&nbsp;<strong>*</strong></span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Diese Verordnung gilt sinngem&auml;ss auch f&uuml;r das Schlichtungsverfahren.</span>
    </p>
  </div>`;

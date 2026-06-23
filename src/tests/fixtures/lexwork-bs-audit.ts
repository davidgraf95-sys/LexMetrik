/**
 * Echte, gekürzte xhtml_tol-Ausschnitte der LexWork-API (BS,
 * gesetzessammlung.bs.ch) für die fünf Daten-Treue-Fixes des
 * BS-Vorbildkanton-Audits (23.6.2026). Jeder Ausschnitt ist 1:1 aus
 * GET https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/{nr}
 * (Feld text_of_law.selected_version.xhtml_tol) übernommen, abgerufen 23.6.2026.
 *
 * Quellen je Konstante in der jeweiligen Doku.
 */

/**
 * S1 — aufgehobene, aber UMNUMMERIERTE Artikel: Header (Nummer + «…»-Titel),
 * aber KEIN paragraph/enumeration-Body. § 6 ist aufgehoben (Platzhalter «&hellip;»),
 * § 7 trägt einen Body — beide müssen erscheinen, die Nummerierung darf nicht reissen.
 *
 * Quelle: 410.100 (Schulgesetz), §§ 6–7. Nachgebildet im selben Markup wie live.
 */
export const LEXWORK_BS_410100_AUFGEHOBEN_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>6&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>7&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Schulpflicht</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die Schulpflicht dauert elf Jahre.</span>
    </p>
  </div>`;

/**
 * S1 (zweiter Regressionsfall) — § 53 hat NUR einen Randtitel («Änderung anderer
 * Gesetze») mit Fussnoten-Anker und KEINEN Body. Darf nicht verschluckt werden;
 * der Randtitel (N1) muss fussnoten-bereinigt extrahiert werden.
 *
 * Quelle: 153.100, § 53.
 */
export const LEXWORK_BS_153100_S53_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>53</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&Auml;nderung anderer Gesetze<a class="footnote" name="articletitle_text_fn_729094_2_4" href="#articletitle_text_fn_729094_2_4_c" id="articletitle_text_fn_729094_2_4">[4]</a></span>
    </div>
  </div>`;

/**
 * S2 + S4 + N1 — 834.410 (Verordnung über die Krankenversicherung) § 8a:
 *   - N1: Randtitel «Kantonale Beiträge an die Spital- und Pflegeheimtaxen».
 *   - S4: Abs. 1/2/3 sind je ein paragraph-Block, dessen ERSTER Span ein kurzer
 *     markierter Sachtitel ist («a) Spital», «b) Pflegeheim», «c) Beitragshöhe») —
 *     KEINE lit.-Aufzählung, sondern eine Zwischenüberschrift.
 *   - S2: nach der enumeration_tabular folgt ein paragraph_post mit
 *     text_content_post (Ziff. 2–6: Vermögensgrenze Fr. 1'000'000, 360 Pflegetage,
 *     ausserkantonal-Klausel) — substantieller Normtext, der nicht verloren gehen darf.
 *   - Die LEEREN paragraph_post zwischen den Absätzen («<div class='paragraph_post'></div>»)
 *     dürfen die folgenden Absätze nicht verschlucken.
 *
 * Quelle: 834.410, § 8a (1:1 live, gekürzte Tarif-Tabelle).
 */
export const LEXWORK_BS_834410_S8A_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>8a&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Kantonale Beitr&auml;ge an die Spital- und Pflegeheimtaxen</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>a) Spital<a class="footnote" name="paragraphtext_content_fn_3197856_2_5" href="#paragraphtext_content_fn_3197856_2_5_c" id="paragraphtext_content_fn_3197856_2_5">[5]</a></span>
    </p>
    <p>
      <span class='text_content'>Reduziert ein Krankenversicherer seine Leistungen pro Spitaltag in Anwendung von Art. 49 Abs. 4 KVG und bezieht die versicherte Person weder eine Rente der AHV oder IV noch ein Taggeld der IV oder Sozialhilfe, richtet der Kanton bis zum 360. Pflegetag an den Aufenthalt der versicherten Person in den Spit&auml;lern, welche auf der Spitalliste des Kantons aufgef&uuml;hrt sind, auf Gesuch hin Beitr&auml;ge aus.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>b) Pflegeheim</span>
    </p>
    <p>
      <span class='text_content'>Bei Aufenthalt der versicherten Person, welche weder eine Rente der AHV oder IV noch ein Taggeld der IV noch Sozialhilfe bezieht, in einem Pflegeheim oder in einer Pflegeabteilung eines Spitals, welche auf der Pflegeheimliste des Kantons aufgef&uuml;hrt ist, richtet der Kanton bis zum 360. Pflegetag auf Gesuch hin Beitr&auml;ge aus.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>3</span>
    <p>
      <span class='text_content'>c) Beitragsh&ouml;he</span>
    </p>
    <p>
      <span class='text_content'>1. Die H&ouml;he der Beitr&auml;ge richtet sich nach den f&uuml;r die individuelle Pr&auml;mienverbilligung (IPV) geltenden Einkommensgruppen.&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_tabular'>
    <tr>
      <th>IPV-Einkommensgruppe</th>
      <th>Max. Eigenleistungen Patient/-in Fr. pro Tag&nbsp;<strong>*</strong></th>
    </tr>
    <tr>
      <td>1</td>
      <td>10</td>
    </tr>
    <tr>
      <td>keine IPV-Anspruch</td>
      <td>50</td>
    </tr>
  </table>
  <div class='paragraph_post'>
    <p>
      <span class='text_content_post'>2. Die Beitr&auml;ge sind zu Leistungen Dritter subsidi&auml;r.</span>
    </p>
    <p>
      <span class='text_content_post'>3. Die Beitr&auml;ge werden nur an Personen mit Wohnsitz im Kanton ausgerichtet.</span>
    </p>
    <p>
      <span class='text_content_post'>4. Keinen Anspruch auf Beitr&auml;ge gem&auml;ss &sect; 8 lit. a und b haben Personen mit einem steuerbaren Verm&ouml;gen von mehr als Fr. 1'000'000.<a class="footnote" name="paragraphtext_content_post_fn_3197858_2_6" href="#paragraphtext_content_post_fn_3197858_2_6_c" id="paragraphtext_content_post_fn_3197858_2_6">[6]</a></span>
    </p>
    <p>
      <span class='text_content_post'>5. Das Gesundheitsdepartement kann die Beitragsgew&auml;hrung &uuml;ber die genannten 360 Pflegetage hinaus verl&auml;ngern.</span>
    </p>
    <p>
      <span class='text_content_post'>6. Der Kanton kann die Beitr&auml;ge auch bei Aufenthalten der versicherten Person in ausserkantonalen Spit&auml;lern und Pflegeheimen ausrichten.</span>
    </p>
  </div>`;

/**
 * S3 — aufgehobener lit.-Buchstabe mit Marke, aber leerem Body (Zelle «&nbsp;»):
 * 640.100 (Steuergesetz) § 35 Abs. 1, lit. g (zwischen f und h). Die lit.-Reihe
 * muss a,b,c,d,e,f,g,h lauten (kein fehlendes g). KEIN fabrizierter Text.
 *
 * Quelle: 640.100, § 35 (gekürzt auf f/g/h).
 */
export const LEXWORK_BS_640100_S35_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>35</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Vom Einkommen werden abgezogen:&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>f)</td>
      <td class='left_col last' colspan='3'>3'300 Franken f&uuml;r allein stehende Rentner und Rentnerinnen zus&auml;tzlich zum Abzug nach lit. c;</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>g)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>&nbsp;</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>h)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>18'500 Franken h&ouml;chstens f&uuml;r die Unterst&uuml;tzung der Partnerin oder des Partners einer Lebensgemeinschaft.</td>
    </tr>
  </table>`;

/**
 * S3 (zweiter Regressionsfall) — 832.710 § 14 Abs. 2: lit. b ist aufgehoben
 * (Marke «b)», leere Zelle). Die Reihe muss a,b,c lauten.
 *
 * Quelle: 832.710, § 14 (gekürzt auf Abs. 2 mit lit. a/b/c).
 */
export const LEXWORK_BS_832710_S14_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>14</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>H&auml;rtef&auml;lle k&ouml;nnen insbesondere sein:</span>
    </p>
  </div>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>a)</td>
      <td class='left_col last' colspan='3'>Der Eintritt in ein Pflegeheim oder in ein Wohnheim f&uuml;r Behinderte.</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>b)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>&nbsp;</td>
    </tr>
  </table>
  <table class='enumeration_item'>
    <tr>
      <td class='number'>c)&nbsp;<strong>*</strong></td>
      <td class='left_col last' colspan='3'>Der Eintritt des Todes einer im gemeinsamen Haushalt lebenden Ehegattin.</td>
    </tr>
  </table>`;

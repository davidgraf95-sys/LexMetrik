import type { Kanton } from '../types/legal';

// ─── Notariats-Anlaufstellen je Kanton (Gründungs-Beurkundung GmbH/AG) ───────
//
// Stammdaten-Quelle: bibliothek/behoerden/notariate-kantone.md (Erstrecherche
// 7.6.2026, Auftrag David; URLs am Abrufdatum geprüft). Bundesrahmen: Art. 55
// SchlT ZGB — die Kantone bestimmen die Urkundspersonen. Für GRÜNDUNGEN gilt
// keine örtliche Ausschliesslichkeit (anders als bei Grundstücken): Die
// Beurkundung ist auch ausserkantonal zulässig — die UI zeigt das immer an.
//
// `verifiziert: false` = Anlaufstelle nur eingeschränkt belegt (UR: kein
// Online-Verzeichnis · AI: keine Personenliste · BL: Abruf Bot-blockiert) —
// UI-Zusatz «Angabe ohne Gewähr». §8: Unsicherheit offenlegen.

export type NotariatsSystem = 'amtsnotariat' | 'frei' | 'gemischt' | 'hregamt';

export interface NotariatsEintrag {
  system: NotariatsSystem;
  /** Anzeigename der Anlaufstelle (amtliches Verzeichnis bzw. Amtsstelle). */
  stelle: string;
  url: string;
  /** Besonderheit für die Hinweiszeile (z. B. SH: HRegA beurkundet selbst). */
  hinweis?: string;
  verifiziert: boolean;
}

export const NOTARIAT_SYSTEM_LABEL: Record<NotariatsSystem, string> = {
  amtsnotariat: 'Amtsnotariat (staatliche Notariate)',
  frei: 'freies Notariat (selbständige Notarinnen und Notare)',
  gemischt: 'gemischtes System',
  hregamt: 'Beurkundung durch das Handelsregisteramt',
};

export const NOTARIATE: Record<Kanton, NotariatsEintrag> = {
  ZH: { system: 'amtsnotariat', stelle: 'Notariate Kanton Zürich', url: 'https://www.notariate-zh.ch/de/notariat/gesellschaftsrecht/gmbh/gruendung-einer-gmbh', verifiziert: true },
  BE: { system: 'frei', stelle: 'Notariatsregister Kanton Bern', url: 'https://www.gba.dij.be.ch/de/start/notariat/notariatsregister.html', verifiziert: true },
  LU: { system: 'frei', stelle: 'Notarenregister Kanton Luzern', url: 'https://gerichte.lu.ch/anwaelte_notare_sachwalter/notare/notarenregister_kanton_luzern', verifiziert: true },
  UR: { system: 'frei', stelle: 'Justizdirektion Uri', url: 'https://www.ur.ch/dienstleistungen/3039', hinweis: 'Kein öffentliches Online-Verzeichnis — Anlaufstelle kontaktieren.', verifiziert: false },
  SZ: { system: 'gemischt', stelle: 'Urkundspersonen-Liste des Kantonsgerichts Schwyz', url: 'https://www.sz.ch/public/upload/assets/69540/Urkundspersonen_des_Kantons_Schwyz.pdf', verifiziert: true },
  OW: { system: 'gemischt', stelle: 'Urkundspersonen-Liste Obwalden', url: 'https://www.ow.ch/publikationen/15380', verifiziert: true },
  NW: { system: 'amtsnotariat', stelle: 'Abteilung Notariat Nidwalden', url: 'https://www.nw.ch/notariat/2497', verifiziert: true },
  GL: { system: 'gemischt', stelle: 'Urkundspersonen Kanton Glarus (Beurkundungsgeschäfte)', url: 'https://www.gl.ch/rechtspflege/oeffentliche-beurkundung/alle-beurkundungsgeschaefte.html/288', verifiziert: true },
  ZG: { system: 'gemischt', stelle: 'Urkundspersonen-Register (UPReg)', url: 'https://www.upreg.ch/', verifiziert: true },
  FR: { system: 'frei', stelle: 'Registre du notariat (Service de la justice)', url: 'https://www.fr.ch/etat-et-droit/gouvernement-et-administration/registre-du-notariat', verifiziert: true },
  SO: { system: 'gemischt', stelle: 'Notarenliste der Staatskanzlei Solothurn', url: 'https://so.ch/staatskanzlei/legistik-und-justiz/notare/', verifiziert: true },
  BS: { system: 'frei', stelle: 'Notariatskammer Basel-Stadt', url: 'https://www.notariatskammerbasel.ch/', verifiziert: true },
  BL: { system: 'frei', stelle: 'Basellandschaftliches Notariat', url: 'https://www.baselland.ch/politik-und-behorden/direktionen/sicherheitsdirektion/zivilrechtsverwaltung/basellandschaftliches-notariat', hinweis: 'Automatischer Abruf blockiert — Link im Browser prüfen.', verifiziert: false },
  SH: { system: 'hregamt', stelle: 'Handelsregisteramt Kanton Schaffhausen', url: 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Verwaltung/Volkswirtschaftsdepartement/Handelsregisteramt-3872-DE.html', hinweis: 'Sonderregel SH: Das Handelsregisteramt beurkundet Gründungen selbst.', verifiziert: true },
  AR: { system: 'gemischt', stelle: 'Verzeichnis öffentliche Urkundspersonen (Obergericht AR)', url: 'https://ar.ch/gerichte/obergericht/anwaltsregister-oeffentliche-urkundspersonen/', verifiziert: true },
  AI: { system: 'gemischt', stelle: 'Grundbuch/Notariat Appenzell Innerrhoden', url: 'https://ai.ch/themen/planen-und-bauen/grundbuch-notariat', hinweis: 'Keine öffentliche Personenliste — Amtsstelle kontaktieren.', verifiziert: false },
  SG: { system: 'gemischt', stelle: 'Amtsnotariate St. Gallen (Beurkundungen)', url: 'https://www.sg.ch/recht/handelsregister-notariate/amtsnotariate/beurkundungen/', verifiziert: true },
  GR: { system: 'frei', stelle: 'Notariats-Register Justiz Graubünden', url: 'https://www.justiz-gr.ch/advokatur-und-notariat/register/', verifiziert: true },
  AG: { system: 'frei', stelle: 'Register der Urkundspersonen (Notariatskommission AG)', url: 'https://www.ag.ch/de/themen/planen-bauen/grundbuch-vermessung/notariat/notariatskommission/register', verifiziert: true },
  TG: { system: 'amtsnotariat', stelle: 'Grundbuchämter und Notariate Thurgau (Standorte)', url: 'https://gni.tg.ch/standorte.html/1776', verifiziert: true },
  TI: { system: 'frei', stelle: 'Ordine dei Notai del Cantone Ticino', url: 'https://www.odnti.ch/', verifiziert: true },
  VD: { system: 'frei', stelle: 'Annuaire — Association des Notaires Vaudois', url: 'https://notaires-vaudois.ch/annuaire/', verifiziert: true },
  VS: { system: 'frei', stelle: 'Registre des notaires (Service de la justice VS)', url: 'https://www.vs.ch/web/sjsj/registe-notaires', verifiziert: true },
  NE: { system: 'frei', stelle: 'Liste officielle des notaires (NE)', url: 'https://www.ne.ch/themes/etat-droit-et-finances/droits-et-justice/notaires', verifiziert: true },
  GE: { system: 'frei', stelle: 'Liste des notaires du canton de Genève', url: 'https://www.ge.ch/document/liste-notaires-du-canton-geneve', verifiziert: true },
  JU: { system: 'frei', stelle: 'Notaires — République et Canton du Jura', url: 'https://www.jura.ch/JUST/Notaires/Notaires.html', verifiziert: true },
};

/** Immer gültiger Zusatz (keine örtliche Ausschliesslichkeit bei Gründungen). */
export const NOTARIAT_FREIZUEGIGKEIT =
  'Die Gründungs-Beurkundung ist auch bei einer Urkundsperson eines anderen Kantons zulässig ' +
  '(keine örtliche Ausschliesslichkeit wie bei Grundstücksgeschäften).';

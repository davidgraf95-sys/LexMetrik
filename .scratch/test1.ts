import { testamentZusammenstellen, TESTAMENT_DEFAULTS } from '../src/lib/vorlagen/testament';
// erben without ersatz, plus a vermächtnis -> C05_ersatz_erben skipped (empty erbenMitErsatz) AFTER incrementing
const a:any = { ...TESTAMENT_DEFAULTS,
  vorname:'Anna', nachname:'Muster', geburtsdatum:'1970-01-01', heimatort:'ZH', adresse:'Weg 1',
  datumErrichtung:'2026-01-01', widerruf:true,
  erben:[{name:'Bea', angaben:'x', quoteProzent:100}],  // no ersatz
  vermaechtnisse:[{empfaenger:'Carl', gegenstand:'Uhr'}],  // no ersatz
};
const r = testamentZusammenstellen(a);
r.dokument.absaetze.forEach(p=>console.log(p.bausteinId, '=>', p.text.split('\n')[0]));

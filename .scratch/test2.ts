import { testamentZusammenstellen, TESTAMENT_DEFAULTS } from '../src/lib/vorlagen/testament';
const a:any = { ...TESTAMENT_DEFAULTS,
  vorname:'Anna', nachname:'Muster', geburtsdatum:'1970-01-01', heimatort:'ZH', adresse:'Weg 1',
  datumErrichtung:'2026-01-01', widerruf:false,
  erben:[{name:'Bea', angaben:'x', quoteProzent:50, ersatz:'Don'},{name:'Eve', angaben:'y', quoteProzent:50}],
  vermaechtnisse:[{empfaenger:'Carl', gegenstand:'Uhr', ersatz:'Fay'}],
  willensvollstrecker:'Greta',
};
const r = testamentZusammenstellen(a);
r.dokument.absaetze.forEach(p=>console.log(p.bausteinId, '=>', p.text.split('\n')[0]));

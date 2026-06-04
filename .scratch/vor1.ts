import { assemble } from '../src/lib/vorlagen/engine';
const schema:any = { id:'t', version:'1', titel:'T', disclaimer:'d', bausteine:[
  { id:'a', text:'A', nummeriert:true, begruendung:'' },
  { id:'b', text:'{{item.x}}', nummeriert:true, wiederholeUeber:'liste', begruendung:'' }, // empty list -> skipped
  { id:'c', text:'C', nummeriert:true, begruendung:'' },
]};
const r = assemble(schema, { liste: [] });
console.log(r.dokument.absaetze.map(a=>a.text));  // expect 1. A, 2. C  but maybe 1. A, 3. C

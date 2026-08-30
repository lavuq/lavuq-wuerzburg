import { evaluateFourPersonGroup } from "./gruppenfinder.js";

function assert(condition, message) { if (!condition) throw new Error(message); }
function key(a,b){ return [a,b].sort().join("|"); }
function score(a,b){ const ai=Number(a.slice(1)), bi=Number(b.slice(1)); return 60+((ai*17+bi*23+ai*bi*3)%40); }
function groupEval(g,p){ const s=[]; for(let i=0;i<3;i++) for(let j=i+1;j<4;j++) s.push(p[key(g[i],g[j])]); return {group:g,...evaluateFourPersonGroup(s)}; }
function better(x,y){ return !y || x.average>y.average || (x.average===y.average && x.weakestPair>y.weakestPair); }

const applicants=Array.from({length:100},(_,i)=>`P${String(i+1).padStart(3,"0")}`);
const pairs={};
for(let i=0;i<99;i++) for(let j=i+1;j<100;j++) pairs[key(applicants[i],applicants[j])]=score(applicants[i],applicants[j]);

// Referenz: vollständige Suche.
let fullBest=null, fullCount=0;
for(let a=0;a<97;a++) for(let b=a+1;b<98;b++) for(let c=b+1;c<99;c++) for(let d=c+1;d<100;d++) {
  const r=groupEval([applicants[a],applicants[b],applicants[c],applicants[d]],pairs); fullCount++; if(r.suitable && better(r,fullBest)) fullBest=r;
}

// Sicheres Pre-Filtering: Eine geeignete Gruppe darf niemals ein Paar <65 enthalten.
// Deshalb werden nur 4er-Cliquen im Graphen der Paar-Scores >=65 erzeugt.
const neighbors=new Map(applicants.map(x=>[x,new Set()]));
for(let i=0;i<99;i++) for(let j=i+1;j<100;j++) { const a=applicants[i],b=applicants[j]; if(pairs[key(a,b)]>=65){neighbors.get(a).add(b);neighbors.get(b).add(a);} }
let filteredBest=null, filteredCount=0;
for(let a=0;a<97;a++) for(let b=a+1;b<98;b++) {
  const A=applicants[a],B=applicants[b]; if(!neighbors.get(A).has(B)) continue;
  for(let c=b+1;c<99;c++) {
    const C=applicants[c]; if(!neighbors.get(A).has(C)||!neighbors.get(B).has(C)) continue;
    for(let d=c+1;d<100;d++) {
      const D=applicants[d]; if(!neighbors.get(A).has(D)||!neighbors.get(B).has(D)||!neighbors.get(C).has(D)) continue;
      const r=groupEval([A,B,C,D],pairs); filteredCount++; if(r.suitable && better(r,filteredBest)) filteredBest=r;
    }
  }
}

assert(fullCount===3921225,"Vollsuche muss 3.921.225 Kombinationen prüfen.");
assert(fullBest && filteredBest,"Beide Verfahren müssen eine beste Gruppe finden.");
assert(fullBest.average===filteredBest.average && fullBest.weakestPair===filteredBest.weakestPair && fullBest.group.join("/")===filteredBest.group.join("/"),"Sicheres Pre-Filtering darf die Siegergruppe nicht verändern.");
assert(filteredCount<fullCount,"Pre-Filtering muss weniger vollständige Gruppenbewertungen benötigen.");
const reduction=(100-(filteredCount/fullCount*100)).toFixed(1);
console.log("Gruppenfinder sicherer Pre-Filter-Test erfolgreich ✅");
console.log(`1. Bewerber: ${applicants.length}`);
console.log(`2. Vollsuche 4er-Kombinationen: ${fullCount}`);
console.log(`3. Nach sicherem Paar-Grenzwert-Pre-Filter bewertet: ${filteredCount}`);
console.log(`4. Reduktion vollständiger Gruppenbewertungen: ${reduction}%`);
console.log(`5. Sieger Vollsuche: ${fullBest.group.join("/")} | Durchschnitt: ${fullBest.average} | Schwächster Paar-Score: ${fullBest.weakestPair}`);
console.log(`6. Sieger Pre-Filter: ${filteredBest.group.join("/")} | Durchschnitt: ${filteredBest.average} | Schwächster Paar-Score: ${filteredBest.weakestPair}`);
console.log("7. Ergebnis identisch: JA");
console.log("8. Qualitätsverlust durch Pre-Filter: NEIN (für die bestehende Mindestregel schwächstes Paar >=65)");
console.log("9. Automatische Einladung: NEIN");
console.log("10. Kontaktdaten geteilt: NEIN");
console.log("11. Airtable geändert: NEIN");
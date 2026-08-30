// LAVUQ Gruppenfinder – Hard-Filter Regressionstest
// Prüft Gruppenzusammensetzung und gegenseitigen Maximalradius.
// Rein read-only: keine Airtable-Schreibzugriffe, keine Einladungen, keine Kontaktdaten.

import { hardFilterGroupComposition } from "./gruppenfinder-profile-scoring.js";
import { passesMutualRadius } from "./gruppenfinder-distance.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const maleOnly = { geschlecht: "Männlich", gruppenwunsch: "Nur Männer" };
const maleNeutral = { geschlecht: "Männlich", gruppenwunsch: "Keine Präferenz" };
const femaleNeutral = { geschlecht: "Weiblich", gruppenwunsch: "Keine Präferenz" };
const femaleOnly = { geschlecht: "Weiblich", gruppenwunsch: "Nur Frauen" };

// Gruppenzusammensetzung
assert(hardFilterGroupComposition(maleOnly, maleNeutral) === true,
  "Nur Männer + männlicher Gegenpart muss erlaubt sein.");
assert(hardFilterGroupComposition(maleOnly, femaleNeutral) === false,
  "Nur Männer + weiblicher Gegenpart muss ausgeschlossen werden.");
assert(hardFilterGroupComposition(femaleOnly, femaleNeutral) === true,
  "Nur Frauen + weiblicher Gegenpart muss erlaubt sein.");
assert(hardFilterGroupComposition(femaleOnly, maleNeutral) === false,
  "Nur Frauen + männlicher Gegenpart muss ausgeschlossen werden.");
assert(hardFilterGroupComposition(maleNeutral, femaleNeutral) === true,
  "Keine Präferenz auf beiden Seiten muss erlaubt sein.");

// Gegenseitiger Maximalradius
assert(passesMutualRadius(10, 10, 10) === true,
  "Entfernung exakt auf beiden Radiusgrenzen muss erlaubt sein.");
assert(passesMutualRadius(10.1, 10, 20) === false,
  "Radius A überschritten: Paar muss ausgeschlossen werden.");
assert(passesMutualRadius(10.1, 20, 10) === false,
  "Radius B überschritten: Paar muss ausgeschlossen werden.");
assert(passesMutualRadius(10, 15, 20) === true,
  "Entfernung innerhalb beider Radien muss erlaubt sein.");
assert(passesMutualRadius(0, 0, 0) === true,
  "Identischer Ort mit 0-km-Radius muss erlaubt sein.");
assert(passesMutualRadius(5, null, 10) === false,
  "Fehlender Radius muss sicherheitshalber ausgeschlossen werden.");

console.log("Gruppenfinder Hard-Filtertest erfolgreich ✅");
console.log("Gruppenzusammensetzung: Nur Männer/Frauen und Keine Präferenz korrekt geprüft.");
console.log("Maximalradius: beidseitige Grenze korrekt geprüft.");
console.log("Grenzfall Radius exakt erreicht: erlaubt.");
console.log("Grenzfall Radius überschritten: ausgeschlossen.");

(() => {
  const form = document.querySelector('#applyForm');
  if (!form) return;

  const steps = [...form.querySelectorAll('.form-step')];
  if (steps.length !== 4) return;

  const [basisStep, situationStep, aboutStep, finishStep] = steps;

  const moveBeforeActions = (fieldName, targetStep) => {
    const el = form.querySelector(`[name="${fieldName}"]`);
    if (!el) return;
    const block = el.closest('fieldset') || el.closest('.field') || el.closest('.option');
    const actions = targetStep.querySelector('.form-actions');
    if (block && actions && block.parentElement !== targetStep) {
      targetStep.insertBefore(block, actions);
    }
  };

  // Schritt 1: nur Basisdaten/Kontakt
  ['Vorname','Email','Mobilnummer','Alter','PLZ'].forEach(name => moveBeforeActions(name, basisStep));

  // Schritt 2: Situation & Gruppe
  ['Geschlecht','Aktuelle_Lebenssituation','Maximaler_Umkreis','Gewuenschte_Gruppe'].forEach(name => moveBeforeActions(name, situationStep));

  // Schritt 3: Fragen 1–5
  ['Freizeit_Interessen','Persoenlichkeit','Planung_von_Unternehmungen','Gewuenschte_Kontaktfrequenz','Wichtige_Freundschaftswerte'].forEach(name => moveBeforeActions(name, aboutStep));

  // Schritt 4: Fragen 6–9 + Abschluss
  ['Gemeinsame_Zeit','Aehnliche_Lebenssituation','Kennenlernen_in_Gruppe','Freundschaftsziel','Besonderer_Hinweis','Kein_Partnersuche_Regel_bestaetigt','Regeln_und_Sicherheit_bestaetigt','Datenschutz_bestaetigt'].forEach(name => moveBeforeActions(name, finishStep));

  const headings = [
    ['Basisdaten','Deine Kontaktdaten – kurz und unkompliziert.'],
    ['Deine Situation & Gruppe','Damit wir die passende Gruppe für deinen Alltag finden.'],
    ['Über dich & Freundschaft','Jetzt geht es darum, was menschlich und im Alltag zu dir passt.'],
    ['Deine Wünsche & Abschluss','Zum Schluss noch deine Wünsche und die notwendigen Bestätigungen.']
  ];

  steps.forEach((step, index) => {
    const h2 = step.querySelector('h2');
    if (h2) h2.textContent = headings[index][0];
    let intro = step.querySelector('.step-intro');
    if (!intro) {
      intro = document.createElement('p');
      intro.className = 'step-intro';
      h2?.insertAdjacentElement('afterend', intro);
    }
    intro.textContent = headings[index][1];
  });
})();
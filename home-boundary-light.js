(function(){
  const sections=[...document.querySelectorAll('section')];
  const section=sections.find(el=>el.querySelector('.eyebrow')?.textContent?.trim()==='Klare Abgrenzung');
  if(!section) return;

  if(!document.querySelector('link[href*="clear-boundary-light.css"]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='clear-boundary-light.css?v=20260909-light-1';
    document.head.appendChild(link);
  }

  section.className='boundary-light';
  section.innerHTML=`
    <div class="container boundary-light__inner">
      <div class="boundary-light__hero">
        <div class="boundary-light__copy">
          <p class="boundary-light__eyebrow">Klare Abgrenzung</p>
          <h2 class="boundary-light__title">Freundschaft. Wirklich nur <span>Freundschaft.</span></h2>
          <p class="boundary-light__lead">LAVUQ ist bewusst auf Freundschaften und gemeinsame Unternehmungen ausgerichtet. Der Fokus liegt auf gemeinsamer Zeit in einer kleinen Gruppe.</p>
          <div class="boundary-light__script">Echte Begegnungen.<br>Keine falschen Erwartungen.</div>
        </div>
        <div class="boundary-light__visual" aria-label="Würzburg verbindet">
          <div class="boundary-light__photo"><img src="wuerzburg-real.jpg" alt="Blick auf Würzburg mit Alter Mainbrücke und Festung Marienberg"></div>
          <div class="boundary-light__badge">Menschen<br>statt<br>Matches</div>
          <div class="boundary-light__note">Würzburg verbindet. ♡</div>
        </div>
      </div>

      <div class="boundary-light__cards">
        <article class="boundary-light__card">
          <div class="boundary-light__icon" aria-hidden="true">👥</div>
          <div><h3>Keine oberflächliche Profilauswahl</h3><p>Aussehen entscheidet nicht darüber, wer eine Chance auf Freundschaft bekommt.</p></div>
          <span class="boundary-light__arrow" aria-hidden="true">→</span>
        </article>
        <article class="boundary-light__card">
          <div class="boundary-light__icon" aria-hidden="true">♡̸</div>
          <div><h3>Kein Dating</h3><p>LAVUQ ist keine Dating-Plattform. Es geht um echte Freundschaften und gemeinsame Erlebnisse.</p></div>
          <span class="boundary-light__arrow" aria-hidden="true">→</span>
        </article>
        <article class="boundary-light__card">
          <div class="boundary-light__icon" aria-hidden="true">4</div>
          <div><h3>Keine privaten 1:1-Zuordnungen</h3><p>Du wirst Teil einer Vierergruppe – nicht zu einem Einzelkontakt vermittelt.</p></div>
          <span class="boundary-light__arrow" aria-hidden="true">→</span>
        </article>
        <article class="boundary-light__card">
          <div class="boundary-light__icon" aria-hidden="true">✓</div>
          <div><h3>Sicherheit an erster Stelle</h3><p>Das erste Treffen ist öffentlich. Auf Wunsch darfst du eine vertraute Begleitperson mitbringen.</p></div>
          <span class="boundary-light__arrow" aria-hidden="true">→</span>
        </article>
      </div>

      <div class="boundary-light__goal">
        <div class="boundary-light__goal-icon" aria-hidden="true">♥</div>
        <div><small>Unser Ziel</small><strong>Mehr echte Verbindungen in Würzburg – ohne Dating, aber mit echten Begegnungen.</strong></div>
        <div class="boundary-light__skyline" aria-hidden="true"></div>
      </div>
      <a class="boundary-light__link" href="kein-dating.html">Mehr über Freundschaft im Fokus erfahren <span>→</span></a>
    </div>`;
})();

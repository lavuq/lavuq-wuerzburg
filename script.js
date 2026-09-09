// LAVUQ public runtime — behaviour and homepage presentation.
(function(){
  const meinQHome=document.createElement('script');
  meinQHome.src='home-meinq-middle.js?v=20260909-middle-1';
  meinQHome.defer=true;
  document.head.appendChild(meinQHome);

  const preferenceVisual=document.createElement('script');
  preferenceVisual.src='home-preference-visual.js?v=20260909-visual-1';
  preferenceVisual.defer=true;
  document.head.appendChild(preferenceVisual);

  const visualLink=document.querySelector('link[rel="stylesheet"][href*="lavuq-visual-"]');
  if(visualLink) visualLink.href='lavuq-visual-v3.css?v=20260909-v3-8';

  const headerStyle=document.querySelector('link[rel="stylesheet"][href*="header-v4.css"]');
  if(headerStyle){
    headerStyle.href='header-v4.css?v=20260909-light-hero-header-1';
    headerStyle.dataset.lavuqHeaderV4='1';
  }

  const startupStyle=document.querySelector('link[rel="stylesheet"][href*="homepage-startup-v5.css"]');
  if(startupStyle){
    startupStyle.href='homepage-startup-v5.css?v=20260909-hero-gemeinsam-1';
    startupStyle.dataset.lavuqHomeStartupV5='1';
  }

  const hero=document.querySelector('.hero-startup');
  if(hero){
    const eyebrow=hero.querySelector('.hero-startup__eyebrow');
    const titleMain=hero.querySelector('.hero-startup__title-main');
    const titleAccent=hero.querySelector('.hero-startup__title-accent');
    const text=hero.querySelector('.hero-startup__text');
    const primary=hero.querySelector('.hero-btn--primary');
    const secondary=hero.querySelector('.hero-btn--link');
    const facts=hero.querySelectorAll('.hero-fact');
    if(eyebrow) eyebrow.textContent='Freunde finden. Aktiv sein. Würzburg erleben.';
    if(titleMain) titleMain.textContent='Gemeinsam';
    if(titleAccent) titleAccent.textContent='statt allein.';
    if(text) text.textContent='LAVUQ verbindet Menschen aus Würzburg und Umgebung in kleinen Gruppen für echte Aktivitäten und echte Begegnungen. Kein Dating. Einfach gemeinsam mehr erleben.';
    if(primary){ primary.textContent='Kostenlos bewerben  →'; primary.href='bewerben.html'; }
    if(secondary){ secondary.innerHTML='So funktioniert’s <span aria-hidden="true">→</span>'; secondary.href='#so-gehts'; }
    if(facts[0]) facts[0].innerHTML='<strong>Verifizierte Mitglieder</strong><span>Sicherer Rahmen</span>';
    if(facts[1]) facts[1].innerHTML='<strong>Kein Dating</strong><span>Freundschaft im Fokus</span>';
    if(facts[2]) facts[2].innerHTML='<strong>Würzburg &amp; Umgebung</strong><span>Menschen aus deiner Region</span>';
  }

  const meaningGrid=document.querySelector('.brand-meaning-grid');
  if(meaningGrid){
    const copy={
      L:'Leichtigkeit, gute Gespräche und Momente, an die man gerne zurückdenkt.',
      A:'Offene Gespräche, neue Perspektiven und ehrlicher Kontakt auf Augenhöhe.',
      V:'Ein sicherer Rahmen, in dem Freundschaften natürlich wachsen können.',
      U:'Gemeinsam etwas erleben – von Café bis Spaziergang, ganz ohne Dating-Fokus.',
      Q:'Die Quelle für neue Freundschaften in Würzburg und Umgebung.'
    };
    meaningGrid.querySelectorAll('.brand-meaning-item').forEach(item=>{
      const letter=item.querySelector('.brand-meaning-letter')?.textContent?.trim();
      const word=item.querySelector('.brand-meaning-word');
      if(!letter || !word || !copy[letter]) return;
      let description=item.querySelector('.brand-meaning-description');
      if(!description){
        description=document.createElement('p');
        description.className='brand-meaning-description';
        word.insertAdjacentElement('afterend',description);
      }
      description.textContent=copy[letter];
    });
    if(!document.getElementById('lavuq-meaning-stack-style')){
      const style=document.createElement('style');
      style.id='lavuq-meaning-stack-style';
      style.textContent=`
        .brand-meaning-grid{grid-template-columns:1fr!important;gap:14px!important;max-width:820px}
        .brand-meaning-item{display:grid!important;grid-template-columns:54px minmax(0,1fr)!important;grid-template-rows:auto auto!important;column-gap:18px!important;row-gap:4px!important;align-items:center!important;min-height:118px!important;padding:20px 22px!important}
        .brand-meaning-letter{grid-column:1!important;grid-row:1/3!important;margin:0!important;width:50px!important;height:50px!important}
        .brand-meaning-word{grid-column:2!important;grid-row:1!important;display:block!important;font-size:1.12rem!important;font-weight:850!important;color:#102039!important}
        .brand-meaning-description{grid-column:2!important;grid-row:2!important;margin:0!important;color:#667085!important;font-size:.92rem!important;line-height:1.45!important;font-weight:520!important;max-width:620px}
        .brand-meaning-item.q-item .brand-meaning-word{color:#102039!important}
        @media(max-width:520px){
          .brand-meaning-grid{grid-template-columns:1fr!important;gap:12px!important}
          .brand-meaning-item{grid-template-columns:48px minmax(0,1fr)!important;min-height:112px!important;padding:18px 16px!important;column-gap:14px!important;border-radius:18px!important}
          .brand-meaning-letter{width:46px!important;height:46px!important}
          .brand-meaning-word{font-size:1.08rem!important}
          .brand-meaning-description{font-size:.88rem!important;line-height:1.42!important}
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Klare Abgrenzung: helle Version direkt im Haupt-Runtime-Code.
  const sections=[...document.querySelectorAll('section')];
  const boundary=sections.find(el=>el.querySelector('.eyebrow')?.textContent?.trim()==='Klare Abgrenzung');
  if(boundary){
    if(!document.querySelector('link[href*="clear-boundary-light.css"]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href='clear-boundary-light.css?v=20260909-light-2';
      document.head.appendChild(link);
    }
    boundary.className='boundary-light';
    boundary.innerHTML=`
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
          <article class="boundary-light__card"><div class="boundary-light__icon" aria-hidden="true">👥</div><div><h3>Keine oberflächliche Profilauswahl</h3><p>Aussehen entscheidet nicht darüber, wer eine Chance auf Freundschaft bekommt.</p></div><span class="boundary-light__arrow" aria-hidden="true">→</span></article>
          <article class="boundary-light__card"><div class="boundary-light__icon" aria-hidden="true">♡</div><div><h3>Kein Dating</h3><p>LAVUQ ist keine Dating-Plattform. Es geht um echte Freundschaften und gemeinsame Erlebnisse.</p></div><span class="boundary-light__arrow" aria-hidden="true">→</span></article>
          <article class="boundary-light__card"><div class="boundary-light__icon" aria-hidden="true">4</div><div><h3>Keine privaten 1:1-Zuordnungen</h3><p>Du wirst Teil einer Vierergruppe – nicht zu einem Einzelkontakt vermittelt.</p></div><span class="boundary-light__arrow" aria-hidden="true">→</span></article>
          <article class="boundary-light__card"><div class="boundary-light__icon" aria-hidden="true">✓</div><div><h3>Sicherheit an erster Stelle</h3><p>Das erste Treffen ist öffentlich. Auf Wunsch darfst du eine vertraute Begleitperson mitbringen.</p></div><span class="boundary-light__arrow" aria-hidden="true">→</span></article>
        </div>
        <div class="boundary-light__goal"><div class="boundary-light__goal-icon" aria-hidden="true">♥</div><div><small>Unser Ziel</small><strong>Mehr echte Verbindungen in Würzburg – ohne Dating, aber mit echten Begegnungen.</strong></div><div class="boundary-light__skyline" aria-hidden="true"></div></div>
        <a class="boundary-light__link" href="kein-dating.html">Mehr über Freundschaft im Fokus erfahren <span>→</span></a>
      </div>`;
  }

  // Sicherheit bei LAVUQ: auffällige Version 1 direkt im Hauptskript.
  const safety=document.querySelector('.safety-feature');
  if(safety){
    safety.className='safety-spotlight';
    safety.innerHTML=`
      <div class="container safety-spotlight__inner">
        <div class="safety-spotlight__hero">
          <div class="safety-spotlight__copy">
            <p class="safety-spotlight__eyebrow">Sicherheit bei LAVUQ</p>
            <h2>Du sollst dich beim ersten Treffen wohlfühlen.</h2>
            <p>Neue Menschen kennenlernen soll Freude machen. Deshalb setzen wir auf klare Regeln, transparente Abläufe und einen sicheren Rahmen.</p>
            <div class="safety-spotlight__script">Echte Begegnungen.<br>In einem sicheren Rahmen.</div>
          </div>
          <div class="safety-spotlight__visual">
            <img src="group-companions.jpg" alt="Freundliches Treffen in Würzburg an einem öffentlichen Ort">
            <div class="safety-spotlight__shield"><span>♡</span><strong>Sicher<br>gemeinsam<br>unterwegs</strong></div>
            <div class="safety-spotlight__place">⌖ <span>Öffentliche Orte.<br>Echte Begegnungen.</span></div>
          </div>
        </div>

        <div class="safety-spotlight__cards">
          <article><div class="safety-spotlight__icon">◎</div><div><h3>Erstes Treffen immer öffentlich</h3><p>Wir treffen uns an gut besuchten, öffentlichen Orten.</p></div></article>
          <article><div class="safety-spotlight__icon">＋</div><div><h3>Begleitperson bei jedem Treffen erlaubt</h3><p>Du darfst bei jedem Treffen eine vertraute Person mitbringen.</p></div></article>
          <article><div class="safety-spotlight__icon">4</div><div><h3>Vierergruppe statt 1:1-Treffen</h3><p>Kennenlernen findet in einer kleinen Gruppe statt – nicht als privates 1:1-Treffen.</p></div></article>
          <article><div class="safety-spotlight__icon">✓</div><div><h3>Klare Regeln und direkter Meldeweg</h3><p>Bei Unsicherheiten oder Problemen kannst du dich jederzeit direkt melden.</p></div></article>
        </div>

        <div class="safety-spotlight__actions">
          <a class="safety-spotlight__primary" href="sicherheit.html">Sicherheitskonzept ansehen <span>→</span></a>
          <a class="safety-spotlight__secondary" href="sicherheitsmeldung.html">Sicherheitsproblem melden <span>→</span></a>
        </div>
        <div class="safety-spotlight__tagline">♥ &nbsp; Menschen verbinden. Sicher. Vor Ort.</div>
      </div>`;

    if(!document.getElementById('lavuq-safety-spotlight-style')){
      const style=document.createElement('style');
      style.id='lavuq-safety-spotlight-style';
      style.textContent=`
        .safety-spotlight{background:linear-gradient(180deg,#fffdfa 0%,#fbf7ef 100%);padding:72px 0;color:#0a1d3b}
        .safety-spotlight__inner{width:min(calc(100% - 40px),1180px);margin:0 auto}
        .safety-spotlight__hero{display:grid;grid-template-columns:.92fr 1.08fr;min-height:470px;border:1px solid rgba(190,145,55,.22);border-radius:34px;overflow:hidden;background:#fff;box-shadow:0 24px 60px rgba(28,35,50,.08)}
        .safety-spotlight__copy{padding:52px 48px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg,#fff 0%,#fffaf0 100%)}
        .safety-spotlight__eyebrow{margin:0 0 14px;color:#b18432;font-size:.78rem;font-weight:900;letter-spacing:.23em;text-transform:uppercase}
        .safety-spotlight__copy h2{margin:0;color:#0a1d3b;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:clamp(3.2rem,5.5vw,5.6rem);line-height:.93;letter-spacing:-.04em}
        .safety-spotlight__copy>p:not(.safety-spotlight__eyebrow){margin:24px 0 0;color:#657087;font-size:1.06rem;line-height:1.58;max-width:540px}
        .safety-spotlight__script{margin-top:32px;color:#b18432;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2rem;line-height:1.05;transform:rotate(-2deg)}
        .safety-spotlight__visual{position:relative;min-height:470px;background:#eee}
        .safety-spotlight__visual img{width:100%;height:100%;object-fit:cover;display:block}
        .safety-spotlight__visual:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,0) 30%)}
        .safety-spotlight__shield{position:absolute;z-index:2;right:8%;top:8%;width:154px;aspect-ratio:.82;background:linear-gradient(145deg,#ddb85f,#b78020);clip-path:polygon(50% 0,92% 18%,92% 67%,50% 100%,8% 67%,8% 18%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;filter:drop-shadow(0 12px 20px rgba(91,61,9,.22));border:3px solid rgba(255,255,255,.8)}
        .safety-spotlight__shield span{font-size:2rem;line-height:1}.safety-spotlight__shield strong{margin-top:8px;font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;line-height:1.35}
        .safety-spotlight__place{position:absolute;z-index:2;right:5%;bottom:5%;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.88);backdrop-filter:blur(10px);padding:13px 18px;border-radius:16px;color:#0a1d3b;font-size:.86rem;font-weight:750;box-shadow:0 10px 28px rgba(0,0,0,.12)}
        .safety-spotlight__place:first-letter{color:#b18432}
        .safety-spotlight__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:24px}
        .safety-spotlight__cards article{display:grid;grid-template-columns:72px minmax(0,1fr);gap:18px;align-items:center;background:#fff;border:1px solid rgba(190,145,55,.22);border-radius:24px;padding:24px;box-shadow:0 12px 30px rgba(30,38,55,.045)}
        .safety-spotlight__icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#fff6d9,#f4e5b7);color:#b18432;font-weight:900;font-size:1.55rem}
        .safety-spotlight__cards h3{margin:0;color:#0a1d3b;font-size:1.18rem;line-height:1.2}.safety-spotlight__cards p{margin:6px 0 0;color:#68738a;font-size:.94rem;line-height:1.45}
        .safety-spotlight__actions{display:grid;gap:12px;margin-top:28px}.safety-spotlight__actions a{min-height:62px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:14px;text-decoration:none;font-weight:850;font-size:1.05rem}
        .safety-spotlight__primary{background:#071b39;color:#fff;box-shadow:0 14px 28px rgba(7,27,57,.16)}.safety-spotlight__secondary{background:#fff;color:#071b39;border:1.5px solid #c69a47}
        .safety-spotlight__tagline{text-align:center;margin-top:22px;color:#b18432;font-size:.78rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
        @media(max-width:820px){
          .safety-spotlight{padding:48px 0}.safety-spotlight__inner{width:min(calc(100% - 28px),1180px)}
          .safety-spotlight__hero{grid-template-columns:1fr;border-radius:26px}.safety-spotlight__copy{padding:32px 24px 28px}.safety-spotlight__copy h2{font-size:clamp(2.7rem,13vw,4.5rem)}
          .safety-spotlight__copy>p:not(.safety-spotlight__eyebrow){font-size:.96rem;margin-top:18px}.safety-spotlight__script{font-size:1.65rem;margin-top:22px}
          .safety-spotlight__visual{min-height:330px}.safety-spotlight__shield{width:120px;right:5%;top:6%}.safety-spotlight__place{left:5%;right:auto;bottom:5%;font-size:.78rem}
          .safety-spotlight__cards{grid-template-columns:1fr;gap:12px;margin-top:16px}.safety-spotlight__cards article{grid-template-columns:58px minmax(0,1fr);padding:18px 16px;border-radius:20px;gap:14px}.safety-spotlight__icon{width:54px;height:54px;font-size:1.3rem}
          .safety-spotlight__cards h3{font-size:1.02rem}.safety-spotlight__cards p{font-size:.88rem}.safety-spotlight__actions a{min-height:56px;font-size:.98rem}.safety-spotlight__tagline{font-size:.68rem;letter-spacing:.12em}
        }
      `;
      document.head.appendChild(style);
    }
  }

  const publicNav=document.querySelector('.nav');
  const toggle=document.querySelector('.nav-toggle');
  if(publicNav && !publicNav.querySelector('a[href="lavu-q.html"]')){
    const lavuQ=document.createElement('a');
    lavuQ.href='lavu-q.html';
    lavuQ.textContent='LAVU-Q';
    const meinQ=publicNav.querySelector('a[href="mein-q.html"]');
    const firstLink=publicNav.querySelector('a');
    if(meinQ) meinQ.insertAdjacentElement('beforebegin',lavuQ);
    else if(firstLink) firstLink.insertAdjacentElement('afterend',lavuQ);
    else publicNav.prepend(lavuQ);
  }

  if(toggle && publicNav){
    const closeMenu=()=>{
      publicNav.classList.remove('open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded','false');
    };
    toggle.addEventListener('click',()=>{
      const open=publicNav.classList.toggle('open');
      document.body.classList.toggle('menu-open',open);
      toggle.setAttribute('aria-expanded',String(open));
    });
    publicNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  }

  const needsLegacy=!!document.querySelector('#applyForm,.faq-q');
  if(needsLegacy){
    const legacy=document.createElement('script');
    legacy.src='script-legacy.js?v=20260909-functional-only-8';
    legacy.async=false;
    document.head.appendChild(legacy);
  }
})();

// LAVUQ public runtime — behaviour only. Visuals come from the new V3/V4/V5 stylesheets.
(function(){
  const visualLink=document.querySelector('link[rel="stylesheet"][href*="lavuq-visual-"]');
  if(visualLink) visualLink.href='lavuq-visual-v3.css?v=20260909-v3-7';

  // Reuse the stylesheet already present in the document instead of appending a stale duplicate.
  let headerStyle=document.querySelector('link[rel="stylesheet"][href*="header-v4.css"]');
  if(headerStyle){
    headerStyle.href='header-v4.css?v=20260909-v5-6';
    headerStyle.dataset.lavuqHeaderV4='1';
  } else if(document.querySelector('.site-header')) {
    headerStyle=document.createElement('link');
    headerStyle.rel='stylesheet';
    headerStyle.href='header-v4.css?v=20260909-v5-6';
    headerStyle.dataset.lavuqHeaderV4='1';
    document.head.appendChild(headerStyle);
  }

  let startupStyle=document.querySelector('link[rel="stylesheet"][href*="homepage-startup-v5.css"]');
  if(startupStyle){
    startupStyle.href='homepage-startup-v5.css?v=20260909-v5-6';
    startupStyle.dataset.lavuqHomeStartupV5='1';
  }

  // Only transform legacy hero markup. The current homepage already contains the startup hero directly.
  const legacyHero=document.querySelector('body main .hero');
  if(legacyHero){
    if(!startupStyle){
      startupStyle=document.createElement('link');
      startupStyle.rel='stylesheet';
      startupStyle.href='homepage-startup-v5.css?v=20260909-v5-6';
      startupStyle.dataset.lavuqHomeStartupV5='1';
      document.head.appendChild(startupStyle);
    }

    const startupHero=document.createElement('section');
    startupHero.className='hero-startup';
    startupHero.innerHTML=`
      <div class="hero-startup__inner">
        <div class="hero-startup__content">
          <p class="hero-startup__eyebrow">Freundschaften in Würzburg & Umgebung</p>
          <h1 class="hero-startup__title">
            <span class="hero-startup__title-main">Neue Freundschaften.</span>
            <span class="hero-startup__title-accent">Kein Dating.</span>
          </h1>
          <p class="hero-startup__text">Lerne Menschen aus deiner Region kennen – für ehrliche Freundschaften, gemeinsame Unternehmungen und eine kleine Gruppe, in der man sich wirklich wohlfühlen kann.</p>
          <div class="hero-startup__actions">
            <a href="bewerben.html" class="hero-btn hero-btn--primary">Für eine Freundesgruppe bewerben</a>
            <a href="#so-gehts" class="hero-btn hero-btn--link">So funktioniert’s <span aria-hidden="true">→</span></a>
          </div>
          <div class="hero-startup__safety">
            <span class="hero-startup__safety-label">Sicher dabei</span>
            <span class="hero-startup__safety-text">Begleitperson bei jedem Treffen erlaubt · Erstes Treffen immer öffentlich</span>
          </div>
          <div class="hero-startup__facts">
            <div class="hero-fact"><strong>4</strong><span>Menschen</span></div>
            <div class="hero-fact"><strong>6</strong><span>Wochen</span></div>
            <div class="hero-fact"><strong>3+</strong><span>echte Treffen</span></div>
            <div class="hero-fact"><strong>+1</strong><span>Begleitperson möglich</span></div>
          </div>
        </div>
        <div class="hero-startup__preview" aria-label="Vorschau auf Mein Q">
          <div class="hero-preview-card">
            <div class="hero-preview-card__top">
              <div class="hero-preview-card__brand"><img src="CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png" alt=""><span class="hero-preview-card__label">Mein Q</span></div>
              <span class="hero-preview-card__status">live</span>
            </div>
            <div class="hero-preview-card__image"><img src="wuerzburg-real.jpg" alt="Würzburg"></div>
            <div class="hero-preview-card__grid">
              <div class="hero-preview-box">Meine Gruppe</div>
              <div class="hero-preview-box">Chat</div>
              <div class="hero-preview-box">Treffen</div>
              <div class="hero-preview-box">Sicherheit</div>
            </div>
          </div>
        </div>
      </div>`;
    legacyHero.replaceWith(startupHero);
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
    legacy.src='script-legacy.js?v=20260909-functional-only-6';
    legacy.async=false;
    document.head.appendChild(legacy);
  }
})();

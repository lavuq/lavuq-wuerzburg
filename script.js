// LAVUQ public runtime — behaviour only. Visuals are loaded directly by the page.
(function(){
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

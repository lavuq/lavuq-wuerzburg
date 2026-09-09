// LAVUQ public runtime — behaviour only. Visuals are loaded directly by the page.
(function(){
  const meinQHome=document.createElement('script');
  meinQHome.src='home-meinq-middle.js?v=20260909-middle-1';
  meinQHome.defer=true;
  document.head.appendChild(meinQHome);

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

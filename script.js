// LAVUQ public runtime — behaviour only. Visuals come from the new V3/V4/V5 stylesheets.
(function(){
  const visualLink=document.querySelector('link[rel="stylesheet"][href*="lavuq-visual-"]');
  if(visualLink) visualLink.href='lavuq-visual-v3.css?v=20260909-v3-4';

  if(document.querySelector('.site-header') && !document.querySelector('link[data-lavuq-header-v4]')){
    const headerStyle=document.createElement('link');
    headerStyle.rel='stylesheet';
    headerStyle.href='header-v4.css?v=20260909-v5-2';
    headerStyle.dataset.lavuqHeaderV4='1';
    document.head.appendChild(headerStyle);
  }

  if(document.querySelector('body main .hero')){
    const oldHero=document.querySelector('link[data-lavuq-home-hero]');
    if(oldHero) oldHero.remove();
    if(!document.querySelector('link[data-lavuq-home-startup-v5]')){
      const heroStyle=document.createElement('link');
      heroStyle.rel='stylesheet';
      heroStyle.href='homepage-startup-v5.css?v=20260909-v5-2';
      heroStyle.dataset.lavuqHomeStartupV5='1';
      document.head.appendChild(heroStyle);
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
    legacy.src='script-legacy.js?v=20260909-functional-only-4';
    legacy.async=false;
    document.head.appendChild(legacy);
  }
})();

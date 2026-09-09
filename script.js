// LAVUQ public runtime — behaviour only. Visuals are loaded directly by the page.
(function(){
  const visualLink=document.querySelector('link[rel="stylesheet"][href*="lavuq-visual-"]');
  if(visualLink) visualLink.href='lavuq-visual-v3.css?v=20260909-v3-8';

  const headerStyle=document.querySelector('link[rel="stylesheet"][href*="header-v4.css"]');
  if(headerStyle){
    headerStyle.href='header-v4.css?v=20260909-v5-8';
    headerStyle.dataset.lavuqHeaderV4='1';
  }

  const startupStyle=document.querySelector('link[rel="stylesheet"][href*="homepage-startup-v5.css"]');
  if(startupStyle){
    startupStyle.href='homepage-startup-v5.css?v=20260909-v5-8';
    startupStyle.dataset.lavuqHomeStartupV5='1';
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

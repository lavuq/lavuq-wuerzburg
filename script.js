// Global public navigation extension for LAVU-Q + global premium visual system.
(function(){
  if(!document.querySelector('link[data-lavuq-editorial]')){
    const design=document.createElement('link');
    design.rel='stylesheet';
    design.href='lavuq-premium-2026.css?v=20260907-1512';
    design.dataset.lavuqEditorial='1';
    document.head.appendChild(design);
  }

  const publicNav=document.querySelector('.nav');
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

  const legacy=document.createElement('script');
  legacy.src='script-legacy.js?v=20260907-lavuq-nav';
  legacy.async=false;
  document.head.appendChild(legacy);
})();
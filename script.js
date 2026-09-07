// LAVUQ public runtime: visual V2 isolation + existing behaviour.
(function(){
  const isPublic=!!document.querySelector('.site-header');

  if(isPublic){
    // Remove every legacy author stylesheet. V2 is the only visual stylesheet afterwards.
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>link.remove());
    document.querySelectorAll('style').forEach(style=>style.remove());

    const design=document.createElement('link');
    design.rel='stylesheet';
    design.href='lavuq-visual-v2.css?v=20260907-clean-1';
    design.dataset.lavuqVisualV2='1';
    document.head.appendChild(design);
    document.documentElement.classList.add('lavuq-visual-v2');
    document.body.classList.add('lavuq-public-v2');
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

  // Existing functional behaviour stays untouched.
  const legacy=document.createElement('script');
  legacy.src='script-legacy.js?v=20260907-lavuq-nav';
  legacy.async=false;
  document.head.appendChild(legacy);
})();
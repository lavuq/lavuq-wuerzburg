(function(){
  const SOURCE='preference-women-final.jpg?v=20260911-1905';

  function findCard(){
    return document.querySelector('.preference-card--women') || [...document.querySelectorAll('.preference-card')].find(el=>/Nur\s+Frauen/i.test(el.textContent||''));
  }

  function paint(){
    const card=findCard();
    if(!card) return;
    card.style.setProperty('background-image',`url('${SOURCE}')`,'important');
    card.style.setProperty('background-size','cover','important');
    card.style.setProperty('background-position','center 52%','important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }

  paint();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('load',paint,{once:true});
  [50,150,300,600,1000,1800,3000,5000].forEach(ms=>setTimeout(paint,ms));
  new MutationObserver(paint).observe(document.documentElement,{subtree:true,childList:true});
})();
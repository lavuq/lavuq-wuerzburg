(function(){
  const SOURCE='preference-men-wuerzburg.jpg?v=20260912-open-crop-1';

  function findCard(){
    return document.querySelector('.preference-card--open') || [...document.querySelectorAll('.preference-card')].find(el=>/Keine\s+Präferenz/i.test(el.textContent||''));
  }

  function paint(){
    const card=findCard();
    if(!card) return;
    card.style.setProperty('background-image',`url('${SOURCE}')`,'important');
    card.style.setProperty('background-size','auto 205%','important');
    card.style.setProperty('background-position','center top','important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }

  paint();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('load',paint,{once:true});
  [50,150,300,600,1000,1800,3000,5000].forEach(ms=>setTimeout(paint,ms));
  new MutationObserver(paint).observe(document.documentElement,{subtree:true,childList:true});
})();
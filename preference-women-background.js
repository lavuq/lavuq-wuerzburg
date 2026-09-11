(function(){
  const WOMEN_BG="preference-women-wuerzburg-v2.jpg?v=20260911-1436";
  function applyWomenBackground(){
    let card=document.querySelector('.preference-card--women');
    if(!card){
      card=[...document.querySelectorAll('.preference-card')].find(el=>/Nur\s+Frauen/i.test(el.textContent||''));
    }
    if(!card) return;
    card.style.setProperty('background-image',`url('${WOMEN_BG}')`,'important');
    card.style.setProperty('background-size','cover','important');
    card.style.setProperty('background-position','center 58%','important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }
  applyWomenBackground();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyWomenBackground,{once:true});
  window.addEventListener('load',applyWomenBackground,{once:true});
  [50,150,300,600,1000,1800,3000].forEach(ms=>setTimeout(applyWomenBackground,ms));
  const observer=new MutationObserver(applyWomenBackground);
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
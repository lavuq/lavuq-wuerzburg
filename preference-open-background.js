(function(){
  const SOURCE='wuerzburg-real.jpg?v=20260912-open-city-mask-1';

  function findCard(){
    return document.querySelector('.preference-card--open') || [...document.querySelectorAll('.preference-card')].find(el=>/Keine\s+Präferenz/i.test(el.textContent||''));
  }

  function paint(){
    const card=findCard();
    if(!card) return;
    card.style.setProperty('background-image',`url('${SOURCE}')`,'important');
    card.style.setProperty('background-size','cover','important');
    card.style.setProperty('background-position','center 28%','important');
    card.style.setProperty('background-repeat','no-repeat','important');

    const shade=card.querySelector('.preference-card__shade');
    if(shade){
      shade.style.setProperty('background','linear-gradient(180deg,rgba(5,21,41,.02) 0%,rgba(5,21,41,.08) 42%,rgba(5,21,41,.96) 60%,rgba(5,21,41,1) 100%)','important');
    }
  }

  paint();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',paint,{once:true});
  window.addEventListener('load',paint,{once:true});
  [50,150,300,600,1000,1800,3000,5000].forEach(ms=>setTimeout(paint,ms));
  new MutationObserver(paint).observe(document.documentElement,{subtree:true,childList:true});
})();
(function(){
  const IMG="women-card.jpg?v=20260911-1016";
  function apply(){
    let card=document.querySelector('.preference-card--women');
    if(!card){
      card=[...document.querySelectorAll('.preference-card')].find(el=>/Nur\s+Frauen/i.test(el.textContent||''));
    }
    if(!card)return;
    card.style.setProperty('background-image',`url('${IMG}')`,'important');
    card.style.setProperty('background-size','cover','important');
    card.style.setProperty('background-position','center 58%','important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  window.addEventListener('load',apply,{once:true});
  [50,150,300,600,900,1500,2500,4000].forEach(t=>setTimeout(apply,t));
  new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
})();
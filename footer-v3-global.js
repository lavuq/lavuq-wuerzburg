(function(){
  function applyOpenPreferenceIcon(){
    let card=document.querySelector('.preference-card--open');
    if(!card){
      card=[...document.querySelectorAll('.preference-card')].find(el=>/Keine\s+Präferenz/i.test(el.textContent||''));
    }
    if(!card) return;
    const icon=card.querySelector('.preference-card__icon');
    if(!icon) return;
    const expected='icon-keine-praferenz-gold-96.png?v=20260911-0021';
    let img=icon.querySelector('img[data-open-preference-icon="1"]');
    if(!img){
      icon.innerHTML='<img data-open-preference-icon="1" alt="" aria-hidden="true">';
      img=icon.querySelector('img');
    }
    if(!img) return;
    if(!img.src.includes('icon-keine-praferenz-gold-96.png')) img.src=expected;
    img.style.setProperty('width','34px','important');
    img.style.setProperty('height','34px','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('display','block','important');
    img.style.setProperty('opacity','1','important');
    img.style.setProperty('visibility','visible','important');
    icon.style.setProperty('color','transparent','important');
    icon.style.setProperty('font-size','0','important');
    icon.style.setProperty('background-image','none','important');
    icon.style.setProperty('display','flex','important');
    icon.style.setProperty('align-items','center','important');
    icon.style.setProperty('justify-content','center','important');
  }

  function applyMenPreferenceBackground(){
    let card=document.querySelector('.preference-card--men');
    if(!card){
      card=[...document.querySelectorAll('.preference-card')].find(el=>/Nur\s+Männer/i.test(el.textContent||''));
    }
    if(!card) return;
    card.style.setProperty('background-image',"url('preference-men-wuerzburg.jpg?v=20260911-1')",'important');
    card.style.setProperty('background-size','cover','important');
    card.style.setProperty('background-position','center 58%','important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }

  const applyPreferenceFixes=()=>{
    applyOpenPreferenceIcon();
    applyMenPreferenceBackground();
  };

  const womenScript=document.createElement('script');
  womenScript.src='preference-women-background.js?v=20260911-0845';
  womenScript.defer=true;
  document.head.appendChild(womenScript);

  const original=document.createElement('script');
  original.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@a6a40ed206e428307f9fce1e7160960e6718c367/footer-v3-global.js';
  original.defer=true;
  original.onload=()=>{
    applyPreferenceFixes();
    [50,150,300,600,900,1500,2500,4000].forEach(ms=>setTimeout(applyPreferenceFixes,ms));
  };
  document.head.appendChild(original);

  applyPreferenceFixes();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyPreferenceFixes,{once:true});
  window.addEventListener('load',applyPreferenceFixes,{once:true});
  const observer=new MutationObserver(applyPreferenceFixes);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  let runs=0;
  const timer=setInterval(()=>{
    applyPreferenceFixes();
    if(++runs>20) clearInterval(timer);
  },500);
})();
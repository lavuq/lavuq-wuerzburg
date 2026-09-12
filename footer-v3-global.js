(function(){
  function findCard(cls,text){
    return document.querySelector(cls)||[...document.querySelectorAll('.preference-card')].find(el=>new RegExp(text,'i').test(el.textContent||''));
  }

  function applyOpenPreferenceIcon(){
    const card=findCard('.preference-card--open','Keine\\s+Präferenz');
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
    img.src=expected;
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

  function applyBackground(card,url,pos,size){
    if(!card) return;
    card.style.setProperty('background-image',`url('${url}')`,'important');
    card.style.setProperty('background-size',size||'cover','important');
    card.style.setProperty('background-position',pos,'important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }

  function applyPreferenceFixes(){
    applyOpenPreferenceIcon();
    applyBackground(findCard('.preference-card--men','Nur\\s+Männer'),'preference-men-wuerzburg.jpg?v=20260911-1','center 58%','cover');
  }

  function loadWomenFix(){
    if(document.querySelector('script[data-women-fix="20260911-1725"]')) return;
    const s=document.createElement('script');
    s.src='preference-women-background.js?v=20260911-1725';
    s.defer=true;
    s.dataset.womenFix='20260911-1725';
    document.head.appendChild(s);
  }

  const original=document.createElement('script');
  original.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@a6a40ed206e428307f9fce1e7160960e6718c367/footer-v3-global.js';
  original.defer=true;
  original.onload=()=>{
    applyPreferenceFixes();
    loadWomenFix();
    [50,150,300,600,900,1500,2500,4000].forEach(ms=>setTimeout(()=>{applyPreferenceFixes();loadWomenFix();},ms));
  };
  document.head.appendChild(original);

  applyPreferenceFixes();
  loadWomenFix();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{applyPreferenceFixes();loadWomenFix();},{once:true});
  window.addEventListener('load',()=>{applyPreferenceFixes();loadWomenFix();},{once:true});
  new MutationObserver(applyPreferenceFixes).observe(document.documentElement,{subtree:true,childList:true});
  let runs=0;
  const timer=setInterval(()=>{
    applyPreferenceFixes();
    loadWomenFix();
    if(++runs>30) clearInterval(timer);
  },500);
})();
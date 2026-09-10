(function(){
  function applyOpenPreferenceIcon(){
    const icon=document.querySelector('.preference-card--open .preference-card__icon');
    if(!icon) return;
    const expected='icon-keine-praferenz-gold-96.png?v=20260911-0014';
    const img=icon.querySelector('img');
    if(!img || !img.src.includes('icon-keine-praferenz-gold-96.png')){
      icon.innerHTML=`<img src="${expected}" alt="" aria-hidden="true">`;
    }
    const current=icon.querySelector('img');
    if(current){
      current.style.setProperty('width','34px','important');
      current.style.setProperty('height','34px','important');
      current.style.setProperty('object-fit','contain','important');
      current.style.setProperty('display','block','important');
      current.style.setProperty('opacity','1','important');
      current.style.setProperty('visibility','visible','important');
    }
    icon.style.setProperty('color','transparent','important');
    icon.style.setProperty('background-image','none','important');
    icon.style.setProperty('display','flex','important');
    icon.style.setProperty('align-items','center','important');
    icon.style.setProperty('justify-content','center','important');
  }

  const original=document.createElement('script');
  original.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@a6a40ed206e428307f9fce1e7160960e6718c367/footer-v3-global.js';
  original.defer=true;
  original.onload=()=>{
    applyOpenPreferenceIcon();
    setTimeout(applyOpenPreferenceIcon,50);
    setTimeout(applyOpenPreferenceIcon,300);
    setTimeout(applyOpenPreferenceIcon,900);
    const observer=new MutationObserver(applyOpenPreferenceIcon);
    observer.observe(document.documentElement,{subtree:true,childList:true});
  };
  document.head.appendChild(original);

  applyOpenPreferenceIcon();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyOpenPreferenceIcon,{once:true});
  window.addEventListener('load',applyOpenPreferenceIcon,{once:true});
})();
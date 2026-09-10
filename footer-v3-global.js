(function(){
  function applyOpenPreferenceIcon(){
    const icon=document.querySelector('.preference-card--open .preference-card__icon');
    if(!icon) return;
    icon.innerHTML='<span class="preference-open-symbol" aria-hidden="true"></span>';
    icon.style.setProperty('color','transparent','important');
    icon.style.setProperty('background-image','none','important');
    icon.style.setProperty('display','flex','important');
    icon.style.setProperty('align-items','center','important');
    icon.style.setProperty('justify-content','center','important');

    const symbol=icon.querySelector('.preference-open-symbol');
    if(symbol){
      symbol.style.setProperty('width','28px','important');
      symbol.style.setProperty('height','28px','important');
      symbol.style.setProperty('border','3px solid #c9993f','important');
      symbol.style.setProperty('border-radius','50%','important');
      symbol.style.setProperty('box-sizing','border-box','important');
      symbol.style.setProperty('position','relative','important');
      symbol.style.setProperty('display','block','important');
      symbol.style.setProperty('filter','drop-shadow(0 2px 3px rgba(120,82,18,.18))','important');
      symbol.innerHTML='<span style="position:absolute;left:5px;right:5px;top:50%;height:3px;transform:translateY(-50%);border-radius:3px;background:linear-gradient(90deg,#b47a1c,#e0ba62,#b47a1c);display:block"></span>';
    }
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
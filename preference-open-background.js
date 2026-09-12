(function(){
  const SOURCE='preference-open-wuerzburg-hq.b64.txt?v=20260912-open-hq-1';
  let dataUrl='';
  let loading=null;

  function findCard(){
    return document.querySelector('.preference-card--open') || [...document.querySelectorAll('.preference-card')].find(el=>/Keine\s+Präferenz/i.test(el.textContent||''));
  }

  function paint(){
    if(!dataUrl) return;
    const card=findCard();
    if(!card) return;
    card.style.setProperty('background-image',`url("${dataUrl}")`,'important');
    card.style.setProperty('background-size','cover','important');
    card.style.setProperty('background-position','center 50%','important');
    card.style.setProperty('background-repeat','no-repeat','important');
  }

  function load(){
    if(loading) return loading;
    loading=fetch(SOURCE,{cache:'no-store'})
      .then(r=>{if(!r.ok) throw new Error('open image source '+r.status); return r.text();})
      .then(text=>{
        const b64=text.replace(/\s+/g,'').trim();
        if(!b64.startsWith('/9j/')) throw new Error('open image source is not jpeg base64');
        dataUrl='data:image/jpeg;base64,'+b64;
        paint();
      })
      .catch(err=>console.error('LAVUQ open background:',err));
    return loading;
  }

  load();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{load();paint();},{once:true});
  window.addEventListener('load',()=>{load();paint();},{once:true});
  [50,150,300,600,1000,1800,3000,5000].forEach(ms=>setTimeout(()=>{load();paint();},ms));
  new MutationObserver(paint).observe(document.documentElement,{subtree:true,childList:true});
})();
(function(){
  const expected={L:'Lachen',A:'Austausch',V:'Vertrauen',U:'Unternehmungen'};

  function normalizeBrandTiles(){
    document.querySelectorAll('.brand-meaning-item').forEach(item=>{
      const letter=(item.querySelector('.brand-meaning-letter')?.textContent||'').trim();
      const word=expected[letter];
      if(!word) return;
      const words=item.querySelectorAll(':scope > .brand-meaning-word');
      const normalized=(item.textContent||'').replace(/\s+/g,'').trim();
      if(words.length!==1 || words[0].textContent.trim()!==word || item.children.length!==2 || normalized!==(letter+word)){
        item.innerHTML=`<span class="brand-meaning-letter">${letter}</span><span class="brand-meaning-word">${word}</span>`;
      }
    });
  }

  function ensureTimelinePulseStyle(){
    if(document.getElementById('lavuq-timeline-pulse-force')) return;
    const style=document.createElement('style');
    style.id='lavuq-timeline-pulse-force';
    style.textContent=`
      @keyframes lavuqTimelinePulseForce{
        0%,100%{transform:scale(1);box-shadow:0 9px 22px rgba(187,132,40,.25),0 0 0 0 rgba(220,183,95,0)}
        45%{transform:scale(1.18);box-shadow:0 12px 30px rgba(187,132,40,.38),0 0 0 13px rgba(220,183,95,.22)}
        60%{transform:scale(1.08);box-shadow:0 10px 25px rgba(187,132,40,.30),0 0 0 7px rgba(220,183,95,.10)}
      }
      #so-gehts .lavuq-timeline-dot{
        opacity:1!important;
        transform:scale(1);
        animation:lavuqTimelinePulseForce 2.2s cubic-bezier(.4,0,.2,1) infinite!important;
        will-change:transform,box-shadow;
      }
    `;
    document.head.appendChild(style);
  }

  function applyTimelinePulse(){
    ensureTimelinePulseStyle();
    const dots=[...document.querySelectorAll('#so-gehts .lavuq-timeline-dot')];
    if(!dots.length) return;
    dots.forEach((dot,index)=>{
      dot.style.setProperty('animation-delay',`${index*0.42}s`,'important');
      dot.style.setProperty('opacity','1','important');
    });
  }

  normalizeBrandTiles();
  applyTimelinePulse();
  window.addEventListener('load',()=>{normalizeBrandTiles();applyTimelinePulse();});
  setTimeout(()=>{normalizeBrandTiles();applyTimelinePulse();},100);
  setTimeout(()=>{normalizeBrandTiles();applyTimelinePulse();},500);
  setTimeout(()=>{normalizeBrandTiles();applyTimelinePulse();},1200);
  setTimeout(applyTimelinePulse,2500);

  const observer=new MutationObserver(()=>{
    normalizeBrandTiles();
    applyTimelinePulse();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});

  const original=document.createElement('script');
  original.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@1f2b774b1dd69a16326703c27cf9b3ba88a32625/home-final-cta-v2.js';
  original.defer=true;
  document.head.appendChild(original);
})();

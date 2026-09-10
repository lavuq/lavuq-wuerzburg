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

  function enableTimelineMotion(){
    const dots=[...document.querySelectorAll('#so-gehts .lavuq-timeline-dot')];
    if(!dots.length || dots.some(dot=>dot.dataset.motionReady==='1')) return;

    dots.forEach(dot=>{
      dot.dataset.motionReady='1';
      dot.style.opacity='0';
      dot.style.transform='translateY(18px) scale(.68)';
    });

    const reveal=(dot,index)=>{
      if(dot.dataset.motionDone==='1') return;
      dot.dataset.motionDone='1';
      setTimeout(()=>{
        dot.animate([
          {opacity:0,transform:'translateY(18px) scale(.68)',boxShadow:'0 9px 22px rgba(187,132,40,.18)'},
          {opacity:1,transform:'translateY(-2px) scale(1.12)',boxShadow:'0 12px 28px rgba(187,132,40,.32),0 0 0 16px rgba(220,183,95,.18)'},
          {opacity:1,transform:'translateY(0) scale(1)',boxShadow:'0 9px 22px rgba(187,132,40,.25),0 0 0 0 rgba(220,183,95,0)'}
        ],{duration:900,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
      },index*130);
    };

    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting) return;
          const dot=entry.target;
          reveal(dot,dots.indexOf(dot));
          io.unobserve(dot);
        });
      },{threshold:.35,rootMargin:'0px 0px -10% 0px'});
      dots.forEach(dot=>io.observe(dot));
    }else{
      dots.forEach(reveal);
    }
  }

  normalizeBrandTiles();
  enableTimelineMotion();
  window.addEventListener('load',()=>{normalizeBrandTiles();enableTimelineMotion();});
  setTimeout(()=>{normalizeBrandTiles();enableTimelineMotion();},100);
  setTimeout(()=>{normalizeBrandTiles();enableTimelineMotion();},500);
  setTimeout(()=>{normalizeBrandTiles();enableTimelineMotion();},1200);

  const observer=new MutationObserver(()=>{normalizeBrandTiles();enableTimelineMotion();});
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});

  const original=document.createElement('script');
  original.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@1f2b774b1dd69a16326703c27cf9b3ba88a32625/home-final-cta-v2.js';
  original.defer=true;
  document.head.appendChild(original);
})();

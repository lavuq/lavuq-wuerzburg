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

  normalizeBrandTiles();
  window.addEventListener('load',normalizeBrandTiles);
  setTimeout(normalizeBrandTiles,100);
  setTimeout(normalizeBrandTiles,500);
  setTimeout(normalizeBrandTiles,1200);

  const observer=new MutationObserver(()=>normalizeBrandTiles());
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});

  const original=document.createElement('script');
  original.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@1f2b774b1dd69a16326703c27cf9b3ba88a32625/home-final-cta-v2.js';
  original.defer=true;
  document.head.appendChild(original);
})();

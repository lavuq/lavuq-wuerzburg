(()=>{
  const OVERPASS='https://overpass-api.de/api/interpreter';
  const CACHE_KEY='lavuq_wue_tipps_v1';
  const CACHE_TTL=24*60*60*1000;
  const FALLBACK=[
    'Lusamgärtchen',
    'Ringpark',
    'Bromberg-Rosengarten',
    'Frankenwarte',
    'terroir f am Würzburger Stein',
    'Lügensteinmuseum',
    'Mainufer',
    'Hofgarten der Residenz'
  ];
  let tips=null;

  function cleanName(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function uniqueSorted(items){return [...new Set(items.map(cleanName).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));}
  function readCache(){try{const x=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');if(x&&Array.isArray(x.items)&&Date.now()-Number(x.savedAt||0)<CACHE_TTL)return x.items;}catch{}return null;}
  function writeCache(items){try{localStorage.setItem(CACHE_KEY,JSON.stringify({savedAt:Date.now(),items}));}catch{}}

  async function loadTips(){
    if(tips)return tips;
    const cached=readCache();
    if(cached?.length){tips=cached;return tips;}
    const query=`[out:json][timeout:20];area["name"="Würzburg"]["boundary"="administrative"]->.a;(nwr(area.a)["name"]["tourism"~"attraction|viewpoint|museum|gallery"];nwr(area.a)["name"]["historic"];nwr(area.a)["name"]["leisure"~"park|garden|nature_reserve|miniature_golf"];nwr(area.a)["name"]["amenity"~"cafe|biergarten|bar|pub|restaurant|cinema|theatre"];nwr(area.a)["name"]["natural"~"wood|peak|spring"];);out tags center;`;
    try{
      const r=await fetch(OVERPASS,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
      if(!r.ok)throw new Error('OVERPASS_'+r.status);
      const data=await r.json();
      const live=(data.elements||[]).map(e=>e?.tags?.name).filter(Boolean);
      tips=uniqueSorted([...FALLBACK,...live]);
      writeCache(tips);
      return tips;
    }catch(_){tips=uniqueSorted(FALLBACK);return tips;}
  }

  function enhance(select){
    if(!select||select.dataset.wueTips==='1')return;
    select.dataset.wueTips='1';
    const place=document.getElementById(select.id.replace('suggestion-','place-'));
    select.innerHTML='<option value="">Geheimtipp / besonderen Ort auswählen …</option><option value="__loading" disabled>Aktuelle Würzburg-Tipps werden geladen …</option>';
    loadTips().then(items=>{
      const current=select.value;
      select.innerHTML='<option value="">Geheimtipp / besonderen Ort auswählen …</option>'+items.map(name=>`<option value="${name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}">${name.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join('')+'<option value="__own">Eigene Idee / eigener Treffpunkt …</option>';
      if(current&&current!=='__loading')select.value=current;
      select.addEventListener('change',()=>{
        if(!place)return;
        if(select.value==='__own'){place.value='';place.focus();return;}
        if(select.value)place.value=select.value;
      });
    });
    const label=document.querySelector(`label[for="${select.id}"]`);
    if(label)label.innerHTML='Würzburg entdecken <span class="muted" style="font-weight:400">(optional · aktuell geladen)</span>';
    if(place){
      const meta=place.parentElement?.querySelector('.schedule-meta');
      if(meta)meta.textContent='Die Würzburg-Tipps sind nur Inspiration. Du kannst jederzeit komplett frei einen eigenen Treffpunkt oder eine eigene Aktivität eintragen.';
    }
  }

  function scan(){document.querySelectorAll('select[id^="suggestion-"]').forEach(enhance);}
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  scan();
})();

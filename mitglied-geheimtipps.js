(()=>{
  const accessParams=new URLSearchParams(location.search);
  const accessMember=accessParams.get('member');
  const accessToken=accessParams.get('token');
  if(accessMember&&accessToken){
    try{localStorage.setItem('lavuq_member_access',JSON.stringify({member:accessMember,token:accessToken,savedAt:Date.now()}));}catch{}
  }

  const OVERPASS='https://overpass-api.de/api/interpreter';
  const CACHE_TTL=24*60*60*1000;
  const CATEGORIES={
    cafes:{label:'☕ Beste Cafés in Würzburg',query:'["amenity"="cafe"]'},
    restaurants:{label:'🍽️ Beste Restaurants in Würzburg',query:'["amenity"="restaurant"]'},
    bars:{label:'🍸 Beste Bars in Würzburg',query:'["amenity"~"bar|pub"]'},
    museen:{label:'🏛️ Museen in Würzburg',query:'["tourism"~"museum|gallery"]'},
    freizeit:{label:'🎯 Freizeitaktivitäten in Würzburg',query:'["leisure"~"bowling_alley|miniature_golf|park|garden|sports_centre"];nwr(area.a)["amenity"~"cinema|theatre"];nwr(area.a)["tourism"~"attraction|viewpoint"]'}
  };
  const FALLBACK={
    cafes:['Café Fred','Café Schönborn','Wunschlos Glücklich'],
    restaurants:['Backöfele','Bürgerspital Weinstuben','Alte Mainmühle'],
    bars:['Standard','Wohnzimmer Bar','Tscharlies Musikkneipe'],
    museen:['Museum im Kulturspeicher','Museum am Dom','Martin von Wagner Museum'],
    freizeit:['Festung Marienberg','Hofgarten der Residenz','Alte Mainbrücke','Ringpark','Minigolf','Kino']
  };

  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim();}
  function uniq(items){return [...new Set(items.map(clean).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'de'));}
  function key(cat){return `lavuq_wue_${cat}_v2`;}
  function readCache(cat){try{const x=JSON.parse(localStorage.getItem(key(cat))||'null');if(x&&Array.isArray(x.items)&&Date.now()-Number(x.savedAt||0)<CACHE_TTL)return x.items;}catch{}return null;}
  function writeCache(cat,items){try{localStorage.setItem(key(cat),JSON.stringify({savedAt:Date.now(),items}));}catch{}}

  async function loadCategory(cat){
    const cached=readCache(cat);if(cached?.length)return cached;
    const cfg=CATEGORIES[cat];if(!cfg)return [];
    const part=cat==='freizeit'?
      `(nwr(area.a)["name"]${cfg.query};);`:
      `(nwr(area.a)["name"]${cfg.query};);`;
    const query=`[out:json][timeout:20];area["name"="Würzburg"]["boundary"="administrative"]->.a;${part}out tags center;`;
    try{
      const r=await fetch(OVERPASS,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
      if(!r.ok)throw new Error('OVERPASS_'+r.status);
      const data=await r.json();
      const live=(data.elements||[]).map(e=>e?.tags?.name).filter(Boolean);
      const items=uniq([...(FALLBACK[cat]||[]),...live]);writeCache(cat,items);return items;
    }catch(_){return uniq(FALLBACK[cat]||[]);}
  }

  function enhance(select){
    if(!select||select.dataset.wueCategoryMenu==='1')return;
    select.dataset.wueCategoryMenu='1';
    const attempt=(select.id.match(/(\d+)$/)||[])[1]||'1';
    const place=document.getElementById(`place-${attempt}`);
    select.innerHTML='<option value="">Kategorie auswählen …</option>'+Object.entries(CATEGORIES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')+'<option value="__own">✏️ Eigene Idee / eigener Treffpunkt</option>';

    const venue=document.createElement('select');
    venue.id=`venue-${attempt}`;
    venue.style.marginTop='10px';
    venue.innerHTML='<option value="">Erst Kategorie auswählen …</option>';
    select.insertAdjacentElement('afterend',venue);

    select.addEventListener('change',async()=>{
      const cat=select.value;
      if(cat==='__own'){
        venue.innerHTML='<option value="">Keine Vorgabe – eigene Idee eintragen</option>';
        if(place){place.value='';place.focus();}
        return;
      }
      if(!cat){venue.innerHTML='<option value="">Erst Kategorie auswählen …</option>';return;}
      venue.innerHTML='<option value="">Aktuelle Würzburg-Tipps werden geladen …</option>';
      const items=await loadCategory(cat);
      venue.innerHTML='<option value="">Ort auswählen …</option>'+items.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('');
    });

    venue.addEventListener('change',()=>{if(place&&venue.value)place.value=venue.value;});

    const label=document.querySelector(`label[for="${select.id}"]`);
    if(label)label.innerHTML='Würzburg-Empfehlungen <span class="muted" style="font-weight:400">(optional)</span>';
    if(place){const meta=place.parentElement?.querySelector('.schedule-meta');if(meta)meta.textContent='Die Empfehlungen sind nur Inspiration. Du kannst jederzeit komplett frei einen eigenen Treffpunkt oder eine eigene Aktivität eintragen.';}
  }

  function lockFutureMeetings(){
    document.querySelectorAll('.meeting').forEach(card=>{
      const info=card.querySelector('.meeting-head .muted');
      if(!info||!info.textContent.includes('Wird nach dem vorherigen Feedback freigeschaltet.'))return;
      if(card.classList.contains('meeting-locked'))return;
      card.classList.add('meeting-locked');
      const actions=card.querySelector('.meeting-actions');
      if(actions&&!actions.querySelector('.meeting-lock-note')){
        actions.innerHTML='<div class="meeting-lock-note" aria-label="Treffen gesperrt">🔒 Noch gesperrt</div>';
      }
      const schedule=card.querySelector('.schedule-panel');
      if(schedule)schedule.classList.add('hidden');
    });
    if(!document.getElementById('meeting-lock-style')){
      const style=document.createElement('style');
      style.id='meeting-lock-style';
      style.textContent='.meeting-locked{opacity:.78}.meeting-lock-note{width:100%;min-height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:#eef2f6;color:#687386;font-weight:800;border:1px solid #dde3ea}.meeting-locked .meeting-number{filter:saturate(.65)}';
      document.head.appendChild(style);
    }
  }

  function scan(){
    document.querySelectorAll('select[id^="suggestion-"]').forEach(enhance);
    lockFutureMeetings();
  }
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  scan();
})();

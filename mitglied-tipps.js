(()=>{
  const CATEGORIES=[
    ['cafes','☕ Beste Cafés in Würzburg'],
    ['restaurants','🍽️ Beste Restaurants in Würzburg'],
    ['bars','🍸 Beste Bars in Würzburg'],
    ['museen','🏛️ Museen in Würzburg'],
    ['freizeit','🎯 Freizeitaktivitäten in Würzburg'],
    ['eigen','✏️ Eigene Idee / eigener Treffpunkt']
  ];
  const TIPS={
    cafes:['Café Wunschlos Glücklich','Café Fred','Köhlers Vollkornbäckerei & Café','Café Schönborn','Café Mozart'],
    restaurants:['Backöfele','Bürgerspital Weinstuben','Alte Mainmühle','REISERS am Stein','KUNO 1408'],
    bars:['Standard','Wohnzimmer Bar','Tscharlies Musikkneipe','Loma','Club Katze'],
    museen:['Museum im Kulturspeicher','Museum am Dom','Martin von Wagner Museum','Siebold-Museum','Shalom Europa'],
    freizeit:['Festung Marienberg','Alte Mainbrücke','Hofgarten der Residenz','Ringpark','Botanischer Garten','Minigolf','Bowling','Escape Room','Kino','Spaziergang am Main']
  };
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function enhance(select){
    if(!select||select.dataset.lavuqCategories==='1')return;
    select.dataset.lavuqCategories='1';
    const attempt=(select.id.match(/(\d+)$/)||[])[1]||'1';
    const place=document.getElementById(`place-${attempt}`);
    select.innerHTML='<option value="">Kategorie auswählen …</option>'+CATEGORIES.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
    let tip=document.getElementById(`tip-${attempt}`);
    if(!tip){
      tip=document.createElement('select');tip.id=`tip-${attempt}`;tip.style.marginTop='10px';tip.innerHTML='<option value="">Erst Kategorie auswählen …</option>';select.insertAdjacentElement('afterend',tip);
    }
    select.addEventListener('change',()=>{
      const cat=select.value;
      if(cat==='eigen'){
        tip.innerHTML='<option value="">Keine Vorgabe – eigene Idee eintragen</option>';
        if(place){place.value='';place.focus();}
        return;
      }
      const list=TIPS[cat]||[];
      tip.innerHTML='<option value="">Ort auswählen …</option>'+list.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    });
    tip.addEventListener('change',()=>{if(place&&tip.value)place.value=tip.value;});
    const label=document.querySelector(`label[for="suggestion-${attempt}"]`);if(label)label.innerHTML='Würzburg-Tipps <span class="muted" style="font-weight:400">(optional)</span>';
  }
  function scan(){document.querySelectorAll('select[id^="suggestion-"]').forEach(enhance);}
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  scan();
})();
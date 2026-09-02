(() => {
  const API='https://lavuq-bewerbung.lavuq.workers.dev';
  const q=new URLSearchParams(location.search), member=q.get('member'), token=q.get('token');
  const attempt=document.getElementById('attempt'),roundInfo=document.getElementById('roundInfo'),message=document.getElementById('message'),current=document.getElementById('current'),voteBox=document.getElementById('voteBox'),proposal=document.getElementById('proposal'),proposeBox=document.getElementById('proposeBox'),dateTime=document.getElementById('dateTime'),place=document.getElementById('place'),publicPlace=document.getElementById('publicPlace'),proposeBtn=document.getElementById('proposeBtn'),yesBtn=document.getElementById('yesBtn'),noBtn=document.getElementById('noBtn'),placeCategory=document.getElementById('placeCategory'),placeSuggestion=document.getElementById('placeSuggestion'),locationStatus=document.getElementById('locationStatus');
  let venues=[];
  function fmt(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?v:new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Berlin'}).format(d);}
  function msg(t,kind=''){message.textContent=t;message.className=`state ${kind}`;}
  function hideMsg(){message.className='state hidden';}
  function venueCategory(tags={}){
    const amenity=tags.amenity||'',tourism=tags.tourism||'',leisure=tags.leisure||'';
    if(['cafe','ice_cream'].includes(amenity))return'cafe';
    if(['restaurant','fast_food','food_court','bar','pub'].includes(amenity))return'restaurant';
    if(tourism==='museum'||['theatre','arts_centre','cinema'].includes(amenity))return'museum';
    if(leisure||tourism==='attraction'||['bowling_alley'].includes(amenity))return'leisure';
    return'leisure';
  }
  function venueLabel(tags={}){
    const name=tags.name||tags['brand']||'';
    if(!name)return'';
    const street=[tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(' ');
    return street?`${name} – ${street}`:name;
  }
  function renderVenues(){
    const cat=placeCategory.value;
    const filtered=venues.filter(v=>cat==='all'||v.category===cat);
    placeSuggestion.innerHTML='<option value="">Ort auswählen …</option>' + filtered.map(v=>`<option value="${String(v.label).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}">${String(v.label).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</option>`).join('');
    locationStatus.textContent=filtered.length?`${filtered.length} passende Orte verfügbar. Du kannst auch jederzeit selbst einen Treffpunkt eintragen.`:'Für diese Kategorie wurden aktuell keine Orte geladen. Du kannst deinen Treffpunkt trotzdem selbst eintragen.';
  }
  async function loadVenues(){
    const cacheKey='lavuq-wuerzburg-venues-v1';
    try{
      const cached=sessionStorage.getItem(cacheKey);
      if(cached){venues=JSON.parse(cached);renderVenues();return;}
    }catch(_){}
    const query='[out:json][timeout:20];area["name"="Würzburg"]["boundary"="administrative"]->.a;(nwr["amenity"~"^(cafe|ice_cream|restaurant|fast_food|food_court|bar|pub|cinema|theatre|arts_centre|bowling_alley)$"](area.a);nwr["tourism"~"^(museum|attraction)$"](area.a);nwr["leisure"](area.a););out tags center;';
    try{
      const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
      if(!r.ok)throw new Error('VENUE_SOURCE_FAILED');
      const d=await r.json();
      const seen=new Set();
      venues=(d.elements||[]).map(el=>({label:venueLabel(el.tags||{}),category:venueCategory(el.tags||{})})).filter(v=>v.label&&v.label.length<140).filter(v=>{const k=v.label.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.label.localeCompare(b.label,'de'));
      try{sessionStorage.setItem(cacheKey,JSON.stringify(venues));}catch(_){}
      renderVenues();
    }catch(_){
      venues=[];placeSuggestion.innerHTML='<option value="">Liste momentan nicht verfügbar</option>';locationStatus.textContent='Die automatische Ortsliste konnte gerade nicht geladen werden. Du kannst deinen Treffpunkt direkt darunter selbst eintragen.';
    }
  }
  async function load(){hideMsg();if(!member||!token){msg('Der persönliche Zugangslink ist unvollständig.','error');return;}const u=new URL(API+'/meeting-scheduling-status');u.searchParams.set('member',member);u.searchParams.set('token',token);u.searchParams.set('attempt',attempt.value);try{const r=await fetch(u,{cache:'no-store'}),d=await r.json();if(!r.ok||!d.ok){msg('Die Terminabstimmung ist für dich aktuell nicht verfügbar.','error');return;}roundInfo.textContent=`Vorschläge genutzt: ${d.round} von ${d.maxRounds}`;current.classList.toggle('hidden',!d.meeting);if(d.meeting)current.innerHTML=`<strong>Aktuell gespeichert:</strong><br>${fmt(d.meeting.dateTime)}<br>${d.meeting.place}`;if(d.exhausted){voteBox.classList.add('hidden');proposeBox.classList.add('hidden');msg('Alle 5 Vorschlagsrunden wurden genutzt. LAVUQ übernimmt diesen Ausnahmefall.','error');return;}const open=d.status==='voting'&&d.proposal;voteBox.classList.toggle('hidden',!open);if(open){proposal.innerHTML=`<strong>${fmt(d.proposal.dateTime)}</strong><br>${d.proposal.place}<br><span class="small">Zustimmungen: ${d.proposal.yesCount} · Ablehnungen: ${d.proposal.noCount}${d.proposal.myVote?` · Deine Stimme: ${d.proposal.myVote==='yes'?'Ja':'Nein'}`:''}</span>`;}proposeBox.classList.toggle('hidden',open);}catch(e){msg('Die Terminabstimmung konnte momentan nicht geladen werden.','error');}}
  async function post(path,body){const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.code||'REQUEST_FAILED');return d;}
  proposeBtn.addEventListener('click',async()=>{if(!dateTime.value||!place.value.trim()||!publicPlace.checked){msg('Bitte Datum, Uhrzeit und öffentlichen Treffpunkt vollständig angeben.','error');return;}proposeBtn.disabled=true;try{await post('/meeting-scheduling-propose',{memberId:member,token,attempt:Number(attempt.value),dateTime:new Date(dateTime.value).toISOString(),place:place.value.trim(),publicPlaceConfirmed:true});msg('Dein Vorschlag wurde gespeichert. Die anderen Teilnehmer können jetzt abstimmen.','success');dateTime.value='';place.value='';placeSuggestion.value='';publicPlace.checked=false;await load();}catch(e){const map={OPEN_PROPOSAL_EXISTS:'Es gibt bereits einen offenen Vorschlag.',FIVE_PROPOSALS_EXHAUSTED:'Die 5 Vorschlagsrunden sind bereits aufgebraucht.',FIRST_MEETING_GROUP_NOT_READY:'Treffen 1 kann erst abgestimmt werden, wenn die Gruppe vollständig freigegeben ist.',PARTICIPANT_SET_NOT_READY:'Die Teilnehmer für dieses Treffen stehen noch nicht vollständig fest.'};msg(map[e.message]||'Der Vorschlag konnte nicht gespeichert werden.','error');}finally{proposeBtn.disabled=false;}});
  async function vote(decision){yesBtn.disabled=noBtn.disabled=true;try{const d=await post('/meeting-scheduling-vote',{memberId:member,token,attempt:Number(attempt.value),decision});msg(d.meetingChanged?'Alle haben zugestimmt. Termin und Ort sind jetzt verbindlich gespeichert.':'Deine Stimme wurde gespeichert.',d.meetingChanged?'success':'');await load();}catch(e){msg('Deine Stimme konnte nicht gespeichert werden.','error');}finally{yesBtn.disabled=noBtn.disabled=false;}}
  yesBtn.addEventListener('click',()=>vote('yes'));noBtn.addEventListener('click',()=>vote('no'));attempt.addEventListener('change',load);placeCategory.addEventListener('change',renderVenues);placeSuggestion.addEventListener('change',()=>{if(placeSuggestion.value)place.value=placeSuggestion.value;});loadVenues();load();
})();
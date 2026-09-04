(()=>{
  const accessParams=new URLSearchParams(location.search);
  const accessMember=accessParams.get('member');
  const accessToken=accessParams.get('token');
  const isDemo=accessParams.get('demo')==='1';
  const demoUser=(accessParams.get('demoUser')||'leon').toLowerCase();
  const DEMO_NAMES={leon:'Leon',anna:'Anna',sophie:'Sophie',daniel:'Daniel'};
  const demoName=DEMO_NAMES[demoUser]||'Leon';
  const DEMO_VOTES_KEY='lavuq_demo_meeting1_votes_v2';
  const DEMO_PROPOSAL_KEY='lavuq_demo_meeting1_proposal_v2';
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
  function readDemoVotes(){
    try{return JSON.parse(localStorage.getItem(DEMO_VOTES_KEY)||'null')||{leon:true,anna:false,sophie:false,daniel:false};}
    catch{return{leon:true,anna:false,sophie:false,daniel:false};}
  }
  function writeDemoVotes(v){try{localStorage.setItem(DEMO_VOTES_KEY,JSON.stringify(v));}catch{}}
  function readDemoProposal(){
    try{return JSON.parse(localStorage.getItem(DEMO_PROPOSAL_KEY)||'null')||{date:'21.09.2026, 15:00',place:'blackout',confirmed:false};}
    catch{return{date:'21.09.2026, 15:00',place:'blackout',confirmed:false};}
  }
  function writeDemoProposal(v){try{localStorage.setItem(DEMO_PROPOSAL_KEY,JSON.stringify(v));}catch{}}

  async function loadCategory(cat){
    const cached=readCache(cat);if(cached?.length)return cached;
    const cfg=CATEGORIES[cat];if(!cfg)return [];
    const part=cat==='freizeit'?`(nwr(area.a)["name"]${cfg.query};);`:`(nwr(area.a)["name"]${cfg.query};);`;
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
    venue.id=`venue-${attempt}`;venue.style.marginTop='10px';venue.innerHTML='<option value="">Erst Kategorie auswählen …</option>';
    select.insertAdjacentElement('afterend',venue);
    select.addEventListener('change',async()=>{
      const cat=select.value;
      if(cat==='__own'){venue.innerHTML='<option value="">Keine Vorgabe – eigene Idee eintragen</option>';if(place){place.value='';place.focus();}return;}
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

  function applyDemoIdentity(){
    if(!isDemo)return;
    const hello=document.getElementById('hello');
    if(hello&&hello.textContent!==`Hallo ${demoName} 👋`)hello.textContent=`Hallo ${demoName} 👋`;
    document.querySelectorAll('#members .member').forEach(card=>{
      const strong=card.querySelector('strong');if(!strong)return;
      const isMe=strong.textContent.trim().toLowerCase()===demoName.toLowerCase();
      card.classList.toggle('me',isMe);
      card.querySelectorAll('.muted').forEach(x=>{if(x.textContent.trim()==='Du')x.remove();});
      if(isMe){const d=document.createElement('div');d.className='muted';d.textContent='Du';strong.parentElement.appendChild(d);}
    });
  }

  function lockFutureMeetings(){
    document.querySelectorAll('.meeting').forEach(card=>{
      const info=card.querySelector('.meeting-head .muted');
      if(!info||!info.textContent.includes('Wird nach dem vorherigen Feedback freigeschaltet.'))return;
      card.classList.add('meeting-locked');
      const actions=card.querySelector('.meeting-actions');
      if(actions&&!actions.querySelector('.meeting-lock-note'))actions.innerHTML='<div class="meeting-lock-note" aria-label="Treffen gesperrt">🔒 Noch gesperrt</div>';
      card.querySelector('.schedule-panel')?.classList.add('hidden');
    });
    if(!document.getElementById('meeting-lock-style')){
      const style=document.createElement('style');style.id='meeting-lock-style';
      style.textContent='.meeting-locked{opacity:.78}.meeting-lock-note{width:100%;min-height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:#eef2f6;color:#687386;font-weight:800;border:1px solid #dde3ea}.meeting-locked .meeting-number{filter:saturate(.65)}';
      document.head.appendChild(style);
    }
  }

  function captureDemoProposal(){
    if(!isDemo)return;
    const card=document.querySelector('#schedule-1 .vote-card');if(!card)return;
    const details=card.querySelector('div[style*="margin-top"]');if(!details)return;
    const lines=details.innerText.split('\n').map(x=>x.trim()).filter(Boolean);
    if(lines.length>=2){const current=readDemoProposal();current.date=lines[0];current.place=lines.slice(1).join(' ');writeDemoProposal(current);}
  }

  function markOwnVote(){
    document.querySelectorAll('.vote-card').forEach(card=>{
      const meta=card.querySelector('.schedule-meta');if(!meta||!meta.textContent.includes('Deine Stimme: Ja'))return;
      if(isDemo&&demoUser==='leon'){const votes=readDemoVotes();votes.leon=true;writeDemoVotes(votes);captureDemoProposal();}
      const actions=card.querySelector('.vote-actions');if(!actions||actions.dataset.ownVoteMarked==='1')return;
      actions.dataset.ownVoteMarked='1';actions.innerHTML='<div class="status ok compact" style="width:100%;text-align:center">Deine Zustimmung ist bereits gespeichert ✓</div>';
    });
  }

  function patchMeetingOneSummary(){
    if(!isDemo)return;
    const card=document.getElementById('meeting-1');if(!card)return;
    const proposal=readDemoProposal();const votes=readDemoVotes();const count=Object.values(votes).filter(Boolean).length;
    if(!proposal.date||!proposal.place)return;
    const head=card.querySelector('.meeting-head');
    if(proposal.confirmed||count===4){proposal.confirmed=true;writeDemoProposal(proposal);if(head)head.innerHTML=`<span class="meeting-number">1</span><div><strong>Treffen 1</strong><div>${esc(proposal.date)} · ${esc(proposal.place)}</div><div class="muted">Bestätigt · verbindlich bestätigt</div></div>`;}
    else if(head){head.innerHTML=`<span class="meeting-number">1</span><div><strong>Treffen 1</strong><div class="muted">Terminvorschlag läuft · ${count} von 4 Zustimmungen</div></div>`;}
  }

  function renderSharedDemoVote(){
    if(!isDemo||demoUser==='leon')return;
    const box=document.getElementById('schedule-1');
    if(!box||box.classList.contains('hidden')||box.dataset.sharedDemo==='1')return;
    if(box.querySelector('.vote-card'))return;
    const form=box.querySelector('.schedule-form');if(!form)return;
    box.dataset.sharedDemo='1';
    const votes=readDemoVotes();const proposal=readDemoProposal();const yesCount=Object.values(votes).filter(Boolean).length;const already=!!votes[demoUser];
    if(proposal.confirmed||yesCount===4){
      proposal.confirmed=true;writeDemoProposal(proposal);
      box.innerHTML=`<h3>Terminabstimmung · Treffen 1</h3><div class="status ok"><strong>Termin verbindlich bestätigt ✓</strong><br>${esc(proposal.date)} · ${esc(proposal.place)}<br>Alle 4 Teilnehmer haben zugestimmt.</div>`;return;
    }
    box.innerHTML=`<h3>Terminabstimmung · Treffen 1</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="vote-card"><strong>Aktueller Vorschlag</strong><div style="margin-top:6px">${esc(proposal.date)}<br>${esc(proposal.place)}</div><div class="schedule-meta">Zustimmungen: ${yesCount} · Ablehnungen: 0${already?' · Deine Stimme: Ja':''}</div><div class="vote-actions">${already?'<div class="status ok compact" style="width:100%;text-align:center">Deine Zustimmung ist bereits gespeichert ✓</div>':`<button class="btn btn-primary" data-demo-vote="yes">Zustimmen</button><button class="btn btn-light" data-demo-vote="no">Ablehnen</button>`}</div></div>`;
    box.querySelector('[data-demo-vote="yes"]')?.addEventListener('click',()=>{
      const v=readDemoVotes();v[demoUser]=true;writeDemoVotes(v);const count=Object.values(v).filter(Boolean).length;
      if(count===4){const p=readDemoProposal();p.confirmed=true;writeDemoProposal(p);}
      box.dataset.sharedDemo='';renderSharedDemoVote();patchMeetingOneSummary();
      const state=document.getElementById('state');if(state){state.textContent=count===4?'Alle haben zugestimmt. Der Termin ist jetzt verbindlich gespeichert.':`Demo: ${demoName} hat zugestimmt. ${count} von 4 Zustimmungen.`;state.className='status ok';}
    });
    box.querySelector('[data-demo-vote="no"]')?.addEventListener('click',()=>{const state=document.getElementById('state');if(state){state.textContent=`Demo: ${demoName} hat den Vorschlag abgelehnt. Eine neue Vorschlagsrunde wäre nötig.`;state.className='status err';}});
  }

  function scan(){applyDemoIdentity();document.querySelectorAll('select[id^="suggestion-"]').forEach(enhance);lockFutureMeetings();captureDemoProposal();markOwnVote();patchMeetingOneSummary();renderSharedDemoVote();}
  new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
  scan();
})();

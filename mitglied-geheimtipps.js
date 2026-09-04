(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoUser=(params.get('demoUser')||'leon').toLowerCase();
  const DEMO_NAMES={leon:'Leon',anna:'Anna',sophie:'Sophie',daniel:'Daniel'};
  const demoName=DEMO_NAMES[demoUser]||'Leon';
  const VOTES_KEY='lavuq_demo_meeting1_votes_stable_v1';
  const PROPOSAL={date:'21.09.2026, 15:00',place:'blackout'};

  function readVotes(){
    try{return JSON.parse(localStorage.getItem(VOTES_KEY)||'null')||{leon:true,anna:false,sophie:false,daniel:false};}
    catch{return{leon:true,anna:false,sophie:false,daniel:false};}
  }
  function writeVotes(v){try{localStorage.setItem(VOTES_KEY,JSON.stringify(v));}catch{}}

  function applyIdentity(){
    if(!isDemo)return;
    const hello=document.getElementById('hello');
    if(hello)hello.textContent=`Hallo ${demoName} 👋`;
    document.querySelectorAll('#members .member').forEach(card=>{
      const strong=card.querySelector('strong');if(!strong)return;
      const mine=strong.textContent.trim().toLowerCase()===demoName.toLowerCase();
      card.classList.toggle('me',mine);
      card.querySelectorAll('.muted').forEach(x=>{if(x.textContent.trim()==='Du')x.remove();});
      if(mine){const d=document.createElement('div');d.className='muted';d.textContent='Du';strong.parentElement.appendChild(d);}
    });
  }

  function lockFutureMeetings(){
    document.querySelectorAll('.meeting').forEach(card=>{
      const info=card.querySelector('.meeting-head .muted');
      if(!info||!info.textContent.includes('Wird nach dem vorherigen Feedback freigeschaltet.'))return;
      card.classList.add('meeting-locked');
      const actions=card.querySelector('.meeting-actions');
      if(actions&&!actions.querySelector('.meeting-lock-note'))actions.innerHTML='<div class="meeting-lock-note">🔒 Noch gesperrt</div>';
    });
    if(!document.getElementById('meeting-lock-style')){
      const style=document.createElement('style');
      style.id='meeting-lock-style';
      style.textContent='.meeting-locked{opacity:.78}.meeting-lock-note{width:100%;min-height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:#eef2f6;color:#687386;font-weight:800;border:1px solid #dde3ea}';
      document.head.appendChild(style);
    }
  }

  function markLeonVote(){
    if(!isDemo||demoUser!=='leon')return;
    document.querySelectorAll('.vote-card').forEach(card=>{
      const meta=card.querySelector('.schedule-meta');
      if(!meta||!meta.textContent.includes('Deine Stimme: Ja'))return;
      const actions=card.querySelector('.vote-actions');
      if(actions&&!actions.dataset.done){
        actions.dataset.done='1';
        actions.innerHTML='<div class="status ok compact" style="width:100%;text-align:center">Deine Zustimmung ist bereits gespeichert ✓</div>';
      }
    });
  }

  function renderOtherDemoVote(){
    if(!isDemo||demoUser==='leon')return;
    const box=document.getElementById('schedule-1');
    if(!box||box.classList.contains('hidden'))return;
    if(box.dataset.demoRendered==='1')return;
    if(!box.querySelector('.schedule-form')&&!box.querySelector('.vote-card'))return;

    const votes=readVotes();
    const yesCount=Object.values(votes).filter(Boolean).length;
    const already=!!votes[demoUser];
    box.dataset.demoRendered='1';

    if(yesCount===4){
      box.innerHTML=`<h3>Terminabstimmung · Treffen 1</h3><div class="status ok"><strong>Termin verbindlich bestätigt ✓</strong><br>${PROPOSAL.date} · ${PROPOSAL.place}<br>Alle 4 Teilnehmer haben zugestimmt.</div>`;
      return;
    }

    box.innerHTML=`<h3>Terminabstimmung · Treffen 1</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="vote-card"><strong>Aktueller Vorschlag</strong><div style="margin-top:6px">${PROPOSAL.date}<br>${PROPOSAL.place}</div><div class="schedule-meta">Zustimmungen: ${yesCount} · Ablehnungen: 0${already?' · Deine Stimme: Ja':''}</div><div class="vote-actions">${already?'<div class="status ok compact" style="width:100%;text-align:center">Deine Zustimmung ist bereits gespeichert ✓</div>':'<button class="btn btn-primary" data-demo-yes>Zustimmen</button><button class="btn btn-light" data-demo-no>Ablehnen</button>'}</div></div>`;

    box.querySelector('[data-demo-yes]')?.addEventListener('click',()=>{
      const v=readVotes();v[demoUser]=true;writeVotes(v);
      box.dataset.demoRendered='';
      const state=document.getElementById('state');
      const count=Object.values(v).filter(Boolean).length;
      if(state){state.textContent=count===4?'Alle haben zugestimmt. Der Termin ist jetzt verbindlich gespeichert.':`Demo: ${demoName} hat zugestimmt. ${count} von 4 Zustimmungen.`;state.className='status ok';}
      renderOtherDemoVote();
    });
    box.querySelector('[data-demo-no]')?.addEventListener('click',()=>{
      const state=document.getElementById('state');
      if(state){state.textContent=`Demo: ${demoName} hat den Vorschlag abgelehnt. Eine neue Vorschlagsrunde wäre nötig.`;state.className='status err';}
    });
  }

  function scan(){
    applyIdentity();
    lockFutureMeetings();
    markLeonVote();
    renderOtherDemoVote();
  }

  window.addEventListener('load',()=>{
    scan();
    setInterval(scan,800);
  });
})();

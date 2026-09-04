(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoUser=(params.get('demoUser')||'leon').toLowerCase();
  const demoStage=(params.get('demoStage')||'').toLowerCase();
  const DEMO_NAMES={leon:'Leon',anna:'Anna',sophie:'Sophie',daniel:'Daniel'};
  const demoName=DEMO_NAMES[demoUser]||'Leon';
  const VOTES_KEY='lavuq_demo_meeting1_votes_stable_v1';
  const FEEDBACK_KEY='lavuq_demo_meeting1_feedback_v1';
  const PROPOSAL={date:'21.09.2026, 15:00',place:'blackout'};

  function readVotes(){
    try{return JSON.parse(localStorage.getItem(VOTES_KEY)||'null')||{leon:true,anna:false,sophie:false,daniel:false};}
    catch{return{leon:true,anna:false,sophie:false,daniel:false};}
  }
  function writeVotes(v){try{localStorage.setItem(VOTES_KEY,JSON.stringify(v));}catch{}}
  function readFeedback(){try{return JSON.parse(localStorage.getItem(FEEDBACK_KEY)||'{}')||{};}catch{return{};}}

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

  function addLockStyle(){
    if(document.getElementById('meeting-lock-style'))return;
    const style=document.createElement('style');
    style.id='meeting-lock-style';
    style.textContent='.meeting-locked{opacity:.78}.meeting-lock-note{width:100%;min-height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:#eef2f6;color:#687386;font-weight:800;border:1px solid #dde3ea}.demo-feedback-box{margin-top:12px;padding:16px;border-radius:14px;background:#f8f3e7;border:1px solid #dfc27f}.demo-feedback-box strong{display:block;margin-bottom:6px}.demo-feedback-count{margin-top:8px;color:#687386;font-weight:700}';
    document.head.appendChild(style);
  }

  function lockFutureMeetings(){
    addLockStyle();
    document.querySelectorAll('.meeting').forEach(card=>{
      const info=card.querySelector('.meeting-head .muted');
      if(!info||!info.textContent.includes('Wird nach dem vorherigen Feedback freigeschaltet.'))return;
      card.classList.add('meeting-locked');
      const actions=card.querySelector('.meeting-actions');
      if(actions&&!actions.querySelector('.meeting-lock-note'))actions.innerHTML='<div class="meeting-lock-note">🔒 Noch gesperrt</div>';
    });
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
    if(!isDemo||demoUser==='leon'||demoStage==='feedback')return;
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

  function renderFeedbackStage(){
    if(!isDemo||demoStage!=='feedback')return;
    addLockStyle();
    const feedback=readFeedback();
    const count=Object.keys(feedback).filter(k=>['leon','anna','sophie','daniel'].includes(k)).length;
    const mine=!!feedback[demoUser];
    const card1=document.getElementById('meeting-1');
    if(card1&&!card1.dataset.feedbackStage){
      card1.dataset.feedbackStage='1';
      const head=card1.querySelector('.meeting-head');
      if(head)head.innerHTML=`<span class="meeting-number">1</span><div><strong>Treffen 1</strong><div>${PROPOSAL.date} · ${PROPOSAL.place}</div><div class="muted">Treffen abgeschlossen · Feedbackphase</div></div>`;
      const actions=card1.querySelector('.meeting-actions');
      if(actions){
        actions.innerHTML=mine
          ?'<div class="status ok compact">Feedback abgegeben ✓</div>'
          :`<a class="btn btn-primary" href="feedback/?demo=1&demoUser=${encodeURIComponent(demoUser)}">Feedback zu Treffen 1 abgeben</a>`;
        actions.insertAdjacentHTML('beforeend',`<div class="demo-feedback-count">${count} von 4 Feedbacks eingegangen</div>`);
      }
      const schedule=card1.querySelector('.schedule-panel');
      if(schedule){schedule.classList.add('hidden');schedule.innerHTML='';}
    }

    const card2=document.getElementById('meeting-2');
    if(card2){
      const actions=card2.querySelector('.meeting-actions');
      const info=card2.querySelector('.meeting-head .muted');
      if(count<4){
        card2.classList.add('meeting-locked');
        if(info)info.textContent='Wird freigeschaltet, sobald alle Feedbacks zu Treffen 1 vorliegen.';
        if(actions)actions.innerHTML='<div class="meeting-lock-note">🔒 Noch gesperrt</div>';
      }else{
        card2.classList.remove('meeting-locked');
        if(info)info.textContent='Feedback zu Treffen 1 abgeschlossen. Treffen 2 ist freigeschaltet.';
        if(actions&&!actions.querySelector('[data-schedule-open="2"]'))actions.innerHTML='<button class="btn btn-dark" data-schedule-open="2">Termin festlegen</button>';
      }
    }

    const card3=document.getElementById('meeting-3');
    if(card3){
      card3.classList.add('meeting-locked');
      const info=card3.querySelector('.meeting-head .muted');
      const actions=card3.querySelector('.meeting-actions');
      if(info)info.textContent='Wird nach dem Feedback zu Treffen 2 freigeschaltet.';
      if(actions)actions.innerHTML='<div class="meeting-lock-note">🔒 Noch gesperrt</div>';
    }
  }

  function scan(){
    applyIdentity();
    if(demoStage==='feedback')renderFeedbackStage();
    else{
      lockFutureMeetings();
      markLeonVote();
      renderOtherDemoVote();
    }
  }

  window.addEventListener('load',()=>{
    scan();
    setInterval(scan,800);
  });
})();

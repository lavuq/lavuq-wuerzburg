(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoStage=(params.get('demoStage')||'').toLowerCase();
  const FEEDBACK3_KEY='lavuq_demo_meeting3_feedback_v1';
  const CHOICE_KEY='lavuq_demo_after_round_choice_v1';

  const ideasScript=document.createElement('script');
  ideasScript.src='mitglied-ideen-global.js?v=20260904-global-ideas-2';
  document.head.appendChild(ideasScript);

  if(isDemo){
    const windowScript=document.createElement('script');
    windowScript.src='mitglied-zeitfenster.js?v=20260904-sixweeks-1';
    document.head.appendChild(windowScript);
  }

  const recommendationScript=document.createElement('script');
  recommendationScript.src='mitglied-empfehlungen.js?v=20260904-all-meetings-1';
  document.head.appendChild(recommendationScript);

  if(isDemo&&demoStage==='round2'){
    const s=document.createElement('script');
    s.src='mitglied-runde2.js?v=20260904-r2-compact-2111';
    document.head.appendChild(s);
    return;
  }

  function feedback3Count(){
    try{
      const data=JSON.parse(localStorage.getItem(FEEDBACK3_KEY)||'{}')||{};
      return ['leon','anna','sophie','daniel'].filter(name=>!!data[name]).length;
    }catch{return 0;}
  }

  function addStyles(){
    if(document.getElementById('lavuq-completion-style'))return;
    const style=document.createElement('style');
    style.id='lavuq-completion-style';
    style.textContent=`
      .lavuq-completion-wrap{padding:0 14px 14px;background:#f7f3ea}
      .lavuq-completion{width:100%;padding:18px;border:1px solid #dcc27f;border-radius:18px;background:#fffaf0;box-shadow:0 8px 22px rgba(4,21,41,.06)}
      .lavuq-completion-badge{display:inline-block;margin-bottom:8px;color:#8b6826;font-size:.76rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      .lavuq-completion h3{margin:0 0 8px;color:#132033;font-family:Georgia,"Times New Roman",serif;font-size:1.45rem;font-weight:500;line-height:1.15}
      .lavuq-completion p{margin:0;color:#667085;line-height:1.5}
      .lavuq-completion-note{margin-top:12px;padding:12px 13px;border-radius:13px;background:#edf8f1;color:#20543b;font-weight:750;line-height:1.4}
      .lavuq-completion-actions{display:grid;gap:9px;margin-top:15px}
      .lavuq-completion-actions .btn{width:100%;min-height:48px}
      .lavuq-completion-leave{background:#eef2f6;color:#132033}
      .lavuq-completion-result{margin-top:12px}
    `;
    document.head.appendChild(style);
  }

  function showResult(root,text){
    const box=root.querySelector('.lavuq-completion-result');
    if(!box)return;
    box.className='lavuq-completion-result status ok';
    box.textContent=text;
  }

  function activateChoiceHandlers(root){
    root.querySelector('[data-completion-continue]')?.addEventListener('click',()=>{
      try{localStorage.setItem(CHOICE_KEY,'continue');}catch{}
      const chatTab=document.querySelector('.app-tab[data-tab="chat"]');
      if(chatTab){chatTab.click();location.hash='chat';}
      const state=document.getElementById('state');
      if(state){state.textContent='Eure Gruppe bleibt aktiv. Der Gruppenchat steht euch weiterhin zur Verfügung.';state.className='status ok';state.classList.remove('hidden');}
    });

    root.querySelector('[data-completion-new-round]')?.addEventListener('click',()=>{
      try{localStorage.setItem(CHOICE_KEY,'new-round');}catch{}
      const p=new URLSearchParams(location.search);
      p.set('demoStage','round2');
      p.set('v',String(Date.now()));
      location.href=`${location.pathname}?${p.toString()}#treffen`;
    });

    root.querySelector('[data-completion-leave]')?.addEventListener('click',()=>{
      const confirmed=window.confirm('Möchtest du die LAVUQ-Gruppe wirklich verlassen?');
      if(!confirmed)return;
      try{localStorage.setItem(CHOICE_KEY,'leave');}catch{}
      showResult(root,'Demo: „Gruppe verlassen“ wurde ausgewählt. In der echten App folgt hier die sichere Austrittsbestätigung.');
    });
  }

  function renderCompletion(){
    if(!isDemo||demoStage!=='feedback3'||feedback3Count()<4)return;
    addStyles();
    const card=document.getElementById('meeting-3');
    if(!card)return;
    let wrap=document.getElementById('lavuq-completion-wrap');
    if(wrap)return;
    wrap=document.createElement('div');
    wrap.id='lavuq-completion-wrap';
    wrap.className='lavuq-completion-wrap';
    wrap.innerHTML=`
      <div class="lavuq-completion">
        <span class="lavuq-completion-badge">Eure erste Runde ist geschafft</span>
        <h3>Eure erste LAVUQ-Runde ist abgeschlossen 🎉</h3>
        <p>Ihr habt alle 3 Treffen gemeinsam abgeschlossen. Wie möchtest du weitermachen?</p>
        <div class="lavuq-completion-note">Euer Gruppenchat bleibt weiterhin verfügbar.</div>
        <div class="lavuq-completion-actions">
          <button class="btn btn-primary" type="button" data-completion-continue>Gemeinsam weitermachen</button>
          <button class="btn btn-dark" type="button" data-completion-new-round>Neue LAVUQ-Runde starten</button>
          <button class="btn lavuq-completion-leave" type="button" data-completion-leave>Gruppe verlassen</button>
        </div>
        <div class="lavuq-completion-result hidden"></div>
      </div>`;
    card.insertAdjacentElement('afterend',wrap);
    activateChoiceHandlers(wrap);
  }

  function start(){
    renderCompletion();
    const target=document.getElementById('meetingList')||document.body;
    const observer=new MutationObserver(()=>queueMicrotask(renderCompletion));
    observer.observe(target,{childList:true,subtree:true});
    setInterval(renderCompletion,250);
  }

  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',start);
  else start();
})();
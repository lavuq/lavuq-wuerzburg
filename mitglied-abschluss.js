(()=>{
  // Visual isolation: after the member scripts have initialized, remove all legacy CSS/style blocks
  // and keep only the independent V2 app stylesheet. Functional JS remains untouched.
  function isolateMemberVisuals(){
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>link.remove());
    document.querySelectorAll('style').forEach(style=>style.remove());
    if(!document.querySelector('link[data-lavuq-app-v2]')){
      const v2=document.createElement('link');
      v2.rel='stylesheet';
      v2.href='/lavuq-app-v2.css?v=20260907-clean-1';
      v2.dataset.lavuqAppV2='1';
      document.head.appendChild(v2);
    }
    document.documentElement.classList.add('lavuq-app-v2');
    document.body.classList.add('lavuq-app-v2');
  }
  setTimeout(isolateMemberVisuals,120);
  setTimeout(isolateMemberVisuals,1200);

  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoStage=(params.get('demoStage')||'').toLowerCase();
  const FEEDBACK3_KEY='lavuq_demo_meeting3_feedback_v1';
  const CHOICE_KEY='lavuq_demo_after_round_choice_v1';
  const fresh=Date.now();

  const ideasScript=document.createElement('script');
  ideasScript.src=`mitglied-ideen-global.js?v=20260904-global-ideas-3&fresh=${fresh}`;
  document.head.appendChild(ideasScript);

  if(isDemo&&demoStage==='round2'){
    const rejectScript=document.createElement('script');
    rejectScript.src=`mitglied-runde2-ablehnen.js?v=20260904-r2-reject-3&fresh=${fresh}`;
    document.head.appendChild(rejectScript);

    const feedbackScript=document.createElement('script');
    feedbackScript.src=`mitglied-runde2-feedback.js?v=20260904-r2-feedback-3&fresh=${fresh}`;
    document.head.appendChild(feedbackScript);
  }

  if(isDemo){
    const windowScript=document.createElement('script');
    windowScript.src=`mitglied-zeitfenster.js?v=20260904-sixweeks-2&fresh=${fresh}`;
    document.head.appendChild(windowScript);
  }

  const recommendationScript=document.createElement('script');
  recommendationScript.src=`mitglied-empfehlungen.js?v=20260904-all-meetings-2&fresh=${fresh}`;
  document.head.appendChild(recommendationScript);

  if(isDemo&&demoStage==='round2'){
    const s=document.createElement('script');
    s.src=`mitglied-runde2.js?v=20260904-r2-final-3&fresh=${fresh}`;
    document.head.appendChild(s);

    const fixScript=document.createElement('script');
    fixScript.src=`mitglied-runde2-fix.js?v=20260904-r2-fix-2&fresh=${fresh}`;
    document.head.appendChild(fixScript);
    return;
  }

  function feedback3Count(){
    try{
      const data=JSON.parse(localStorage.getItem(FEEDBACK3_KEY)||'{}')||{};
      return ['leon','anna','sophie','daniel'].filter(name=>!!data[name]).length;
    }catch{return 0;}
  }

  function addStyles(){/* Visual styling now lives exclusively in lavuq-app-v2.css. */}

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
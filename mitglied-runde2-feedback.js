(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const stage=(params.get('demoStage')||'').toLowerCase();
  const user=(params.get('demoUser')||'leon').toLowerCase();
  if(!isDemo||stage!=='round2')return;

  const MEETING4_KEY='lavuq_demo_meeting4_state_v2';
  const FEEDBACK4_KEY='lavuq_demo_meeting4_feedback_v1';
  const NAMES={leon:'Leon',anna:'Anna',sophie:'Sophie',daniel:'Daniel'};

  function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return {};}}
  function write(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}
  function confirmed(){const s=read(MEETING4_KEY);return !!s.proposal&&Object.values(s.votes||{}).filter(Boolean).length===4;}
  function feedback(){return read(FEEDBACK4_KEY);}
  function count(){const f=feedback();return ['leon','anna','sophie','daniel'].filter(x=>!!f[x]).length;}

  function addStyle(){if(document.getElementById('lavuq-r2-feedback-style'))return;const s=document.createElement('style');s.id='lavuq-r2-feedback-style';s.textContent=`
    .lqf-wrap{margin-top:13px;padding:14px;border:1px solid #ded5c5;border-radius:15px;background:#fff}
    .lqf-wrap h4{margin:0 0 7px;color:#132033;font-size:1rem}
    .lqf-wrap p{margin:0;color:#697386;font-size:.84rem;line-height:1.45}
    .lqf-progress{margin-top:10px;padding:10px 12px;border-radius:12px;background:#f3f6f8;color:#536173;font-size:.82rem;font-weight:800}
    .lqf-actions{display:grid;gap:8px;margin-top:12px}
    .lqf-actions .btn{width:100%;min-height:44px}
    .lqf-form{display:grid;gap:11px;margin-top:12px}
    .lqf-form label{font-size:.83rem;font-weight:850;color:#344054}
    .lqf-form select,.lqf-form textarea{width:100%;margin-top:6px;border:1px solid #d9d1c4;border-radius:13px;padding:12px;background:#fff;font:inherit;color:#132033}
    .lqf-form textarea{min-height:90px;resize:vertical}
    .lqf-ok{margin-top:10px;padding:11px 12px;border-radius:12px;background:#edf8f1;color:#20543b;font-size:.84rem;font-weight:800;line-height:1.4}
  `;document.head.appendChild(s);}

  function render(){
    if(!confirmed())return;
    const card=document.getElementById('meeting-4');
    if(!card)return;
    addStyle();
    let box=card.querySelector('[data-feedback4]');
    if(!box){box=document.createElement('div');box.className='lqf-wrap';box.setAttribute('data-feedback4','');const ideas=card.querySelector('[data-ideas="4"]');if(ideas)ideas.insertAdjacentElement('beforebegin',box);else card.appendChild(box);}

    const f=feedback(); const n=count(); const mine=!!f[user];
    if(n===4){
      box.innerHTML=`<h4>Feedback zu Treffen 4 ✓</h4><p>Alle 4 Rückmeldungen sind eingegangen.</p><div class="lqf-ok">Treffen 5 ist jetzt freigeschaltet.</div>`;
      unlockMeeting5();
      return;
    }
    if(mine){
      box.innerHTML=`<h4>Feedback zu Treffen 4</h4><p>Deine Rückmeldung wurde gespeichert.</p><div class="lqf-progress">${n} von 4 Feedbacks eingegangen</div><div class="lqf-ok">Danke, ${NAMES[user]||'dein'} Feedback ist gespeichert ✓</div>`;
      return;
    }
    box.innerHTML=`<h4>Feedback zu Treffen 4</h4><p>Kurze Rückmeldung nach eurem Treffen. Erst wenn alle 4 geantwortet haben, wird Treffen 5 freigeschaltet.</p><div class="lqf-progress">${n} von 4 Feedbacks eingegangen</div><div class="lqf-actions"><button type="button" class="btn btn-primary" data-open-feedback4>Feedback abgeben</button></div>`;
    box.querySelector('[data-open-feedback4]')?.addEventListener('click',()=>showForm(box));
  }

  function showForm(box){
    box.innerHTML=`<h4>Dein Feedback zu Treffen 4</h4><div class="lqf-form">
      <label>Wie war das Treffen?<select data-f4-rating><option value="">Bitte auswählen</option><option>Sehr gut</option><option>Gut</option><option>Okay</option><option>Nicht so gut</option></select></label>
      <label>Möchtest du mit der Gruppe weitermachen?<select data-f4-continue><option value="">Bitte auswählen</option><option>Ja</option><option>Unsicher</option><option>Nein</option></select></label>
      <label>Optionaler Kommentar<textarea data-f4-note maxlength="800" placeholder="Was möchtest du LAVUQ noch mitteilen?"></textarea></label>
      <button type="button" class="btn btn-primary" data-save-feedback4>Feedback speichern</button>
    </div>`;
    box.querySelector('[data-save-feedback4]')?.addEventListener('click',()=>{
      const rating=box.querySelector('[data-f4-rating]')?.value||'';
      const cont=box.querySelector('[data-f4-continue]')?.value||'';
      const note=(box.querySelector('[data-f4-note]')?.value||'').trim();
      if(!rating||!cont){const state=document.getElementById('state');if(state){state.textContent='Bitte beantworte die beiden Pflichtfragen zum Feedback.';state.className='status err';state.classList.remove('hidden');}return;}
      const all=feedback();all[user]={rating,continue:cont,note,submittedAt:new Date().toISOString()};write(FEEDBACK4_KEY,all);render();
    });
  }

  function unlockMeeting5(){
    const card=document.getElementById('meeting-5');if(!card)return;
    card.classList.remove('meeting-locked');card.style.opacity='1';
    const muted=card.querySelector('.meeting-head .muted');if(muted)muted.textContent='Freigeschaltet · jetzt Termin planen';
    const actions=card.querySelector('.meeting-actions');if(actions)actions.innerHTML='<button class="btn btn-dark" type="button" data-m5-ready>Termin festlegen</button>';
  }

  function start(){render();const root=document.getElementById('meetingList')||document.body;new MutationObserver(()=>queueMicrotask(render)).observe(root,{childList:true,subtree:true});setInterval(render,350);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
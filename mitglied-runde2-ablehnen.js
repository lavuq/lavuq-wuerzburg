(()=>{
  const params=new URLSearchParams(location.search);
  if(params.get('demo')!=='1'||(params.get('demoStage')||'').toLowerCase()!=='round2')return;
  const user=(params.get('demoUser')||'leon').toLowerCase();
  const KEY='lavuq_demo_meeting4_state_v2';
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{return{}}};
  const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
  function enhance(){
    const panel=document.getElementById('schedule-4');
    if(!panel||panel.classList.contains('hidden'))return;
    const s=read();
    if(!s.proposal)return;
    const yes=Object.values(s.votes||{}).filter(Boolean).length;
    const mine=!!(s.votes||{})[user];
    if(yes>=4||mine)return;
    const card=panel.querySelector('.vote-card');
    if(!card)return;
    let actions=card.querySelector('.vote-actions');
    if(!actions){actions=document.createElement('div');actions.className='vote-actions';card.appendChild(actions);}
    if(!actions.querySelector('[data-r2-no]')){
      const no=document.createElement('button');
      no.type='button';
      no.className='btn btn-light';
      no.setAttribute('data-r2-no','');
      no.textContent='Ablehnen';
      no.addEventListener('click',()=>{
        const x=read();
        x.round=Math.min(5,(Number(x.round)||1)+1);
        x.proposal=null;
        x.votes={leon:false,anna:false,sophie:false,daniel:false};
        save(x);
        const state=document.getElementById('state');
        if(state){state.textContent='Der Terminvorschlag wurde abgelehnt. Ihr könnt jetzt einen neuen Vorschlag erstellen.';state.className='status err';}
        location.reload();
      });
      actions.appendChild(no);
    }
  }
  function fixRoundLabel(){
    const s=read();
    if(s.proposal)return;
    const panel=document.getElementById('schedule-4');
    if(!panel||panel.classList.contains('hidden'))return;
    const meta=[...panel.querySelectorAll('.schedule-meta')].find(x=>x.textContent.includes('Vorschlagsrunden:'));
    if(meta)meta.textContent=`Vorschlagsrunden: ${Math.min(5,Number(s.round)||1)} von 5`;
  }
  const run=()=>{enhance();fixRoundLabel()};
  const obs=new MutationObserver(run);
  obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(run,250);
  run();
})();
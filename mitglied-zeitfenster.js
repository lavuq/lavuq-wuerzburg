(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  if(!isDemo)return;

  const stage=(params.get('demoStage')||'').toLowerCase();
  const ROUND_DAYS=42;
  const startKey=stage==='round2'?'lavuq_demo_round2_started_at_v1':'lavuq_demo_round1_started_at_v1';

  function localDateISO(d){
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function parseLocalDate(iso){
    const [y,m,d]=iso.split('-').map(Number);
    return new Date(y,m-1,d,12,0,0,0);
  }
  function getRoundStart(){
    let iso='';
    try{iso=localStorage.getItem(startKey)||'';}catch{}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)){
      iso=localDateISO(new Date());
      try{localStorage.setItem(startKey,iso);}catch{}
    }
    return parseLocalDate(iso);
  }
  function roundEnd(start){
    const d=new Date(start);
    d.setDate(d.getDate()+ROUND_DAYS-1);
    return d;
  }
  function labelDate(d){
    return new Intl.DateTimeFormat('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  }
  function shortDate(d){
    return new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  }
  function addStyles(){
    if(document.getElementById('lavuq-six-week-style'))return;
    const s=document.createElement('style');
    s.id='lavuq-six-week-style';
    s.textContent=`
      .lavuq-six-week-picker{display:grid;grid-template-columns:1fr 130px;gap:10px}
      .lavuq-six-week-picker select,.lavuq-six-week-picker input{width:100%;min-height:48px;border:1px solid #d9d1c4;border-radius:13px;padding:12px 13px;font:inherit;background:#fff;color:#132033}
      .lavuq-six-week-note{grid-column:1/-1;padding:10px 12px;border-radius:12px;background:#eef5ee;color:#315f46;font-size:.82rem;font-weight:750;line-height:1.4}
      @media(max-width:520px){.lavuq-six-week-picker{grid-template-columns:1fr}.lavuq-six-week-note{grid-column:auto}}
    `;
    document.head.appendChild(s);
  }
  function sync(original,dateSelect,timeInput){
    if(dateSelect.value&&timeInput.value){
      original.value=`${dateSelect.value}T${timeInput.value}`;
      original.dispatchEvent(new Event('input',{bubbles:true}));
      original.dispatchEvent(new Event('change',{bubbles:true}));
    }else original.value='';
  }
  function transform(input){
    if(input.dataset.sixWeekReady==='1')return;
    input.dataset.sixWeekReady='1';
    addStyles();

    const start=getRoundStart();
    const end=roundEnd(start);
    const existing=input.value||'';
    const existingDate=existing.slice(0,10);
    const existingTime=existing.slice(11,16);

    const wrap=document.createElement('div');
    wrap.className='lavuq-six-week-picker';
    const dateSelect=document.createElement('select');
    dateSelect.setAttribute('aria-label','Datum innerhalb der 6-Wochen-Runde');
    dateSelect.innerHTML='<option value="">Datum auswählen</option>';
    for(let i=0;i<ROUND_DAYS;i++){
      const d=new Date(start);
      d.setDate(start.getDate()+i);
      const iso=localDateISO(d);
      const opt=document.createElement('option');
      opt.value=iso;
      opt.textContent=labelDate(d);
      if(iso===existingDate)opt.selected=true;
      dateSelect.appendChild(opt);
    }
    const time=document.createElement('input');
    time.type='time';
    time.step='300';
    time.setAttribute('aria-label','Uhrzeit');
    if(existingTime)time.value=existingTime;

    const note=document.createElement('div');
    note.className='lavuq-six-week-note';
    note.textContent=`Diese LAVUQ-Runde läuft 6 Wochen: ${shortDate(start)} – ${shortDate(end)}. Termine außerhalb dieses Zeitraums können nicht ausgewählt werden.`;

    wrap.append(dateSelect,time,note);
    input.style.display='none';
    input.insertAdjacentElement('afterend',wrap);
    dateSelect.addEventListener('change',()=>sync(input,dateSelect,time));
    time.addEventListener('change',()=>sync(input,dateSelect,time));
    sync(input,dateSelect,time);
  }
  function scan(){document.querySelectorAll('input[type="datetime-local"]').forEach(transform);}

  scan();
  const observer=new MutationObserver(scan);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
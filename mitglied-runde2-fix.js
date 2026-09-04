(()=>{
  const p=new URLSearchParams(location.search);
  if(p.get('demo')!=='1'||(p.get('demoStage')||'').toLowerCase()!=='round2')return;

  let repairing=false;
  let lastRepair=0;

  function inject(src){
    const s=document.createElement('script');
    s.src=src+(src.includes('?')?'&':'?')+'force='+Date.now();
    document.head.appendChild(s);
  }

  function needsRepair(){
    const list=document.getElementById('meetingList');
    if(!list)return false;
    return !!list.querySelector('#meeting-1') && !list.querySelector('#meeting-4');
  }

  function repair(){
    if(repairing||!needsRepair())return;
    const now=Date.now();
    if(now-lastRepair<700)return;
    repairing=true;
    lastRepair=now;
    inject('mitglied-runde2.js?v=20260904-r2-stable-1');
    setTimeout(()=>inject('mitglied-runde2-ablehnen.js?v=20260904-r2-stable-1'),180);
    setTimeout(()=>inject('mitglied-runde2-feedback.js?v=20260904-r2-stable-1'),360);
    setTimeout(()=>{repairing=false;},650);
  }

  const start=()=>{
    repair();
    const list=document.getElementById('meetingList');
    if(list){
      new MutationObserver(()=>queueMicrotask(repair)).observe(list,{childList:true,subtree:true});
    }
    setInterval(repair,500);
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
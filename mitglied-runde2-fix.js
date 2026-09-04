(()=>{
  const p=new URLSearchParams(location.search);
  if(p.get('demo')!=='1'||(p.get('demoStage')||'').toLowerCase()!=='round2')return;

  let loading=false;
  let lastLoad=0;

  function loadRound2(){
    const now=Date.now();
    if(loading||now-lastLoad<350)return;
    loading=true;
    lastLoad=now;
    const s=document.createElement('script');
    s.src='mitglied-runde2.js?v=20260904-r2-stable&force='+now;
    s.onload=()=>{
      loading=false;
      loadHelper('mitglied-runde2-ablehnen.js?v=20260904-r2-stable');
      loadHelper('mitglied-runde2-feedback.js?v=20260904-r2-stable');
    };
    s.onerror=()=>{loading=false};
    document.head.appendChild(s);
  }

  function loadHelper(src){
    const s=document.createElement('script');
    s.src=src+'&force='+Date.now();
    document.head.appendChild(s);
  }

  function needsRepair(){
    const list=document.getElementById('meetingList');
    if(!list)return false;
    return !document.getElementById('meeting-4');
  }

  function repair(){
    if(needsRepair())loadRound2();
  }

  function start(){
    loadRound2();
    const list=document.getElementById('meetingList');
    if(list){
      const observer=new MutationObserver(()=>setTimeout(repair,0));
      observer.observe(list,{childList:true,subtree:true});
    }
    setInterval(repair,500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
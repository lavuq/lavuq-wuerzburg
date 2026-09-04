(()=>{
  const p=new URLSearchParams(location.search);
  if(p.get('demo')!=='1'||(p.get('demoStage')||'').toLowerCase()!=='round2')return;
  const load=(src,delay)=>setTimeout(()=>{
    const s=document.createElement('script');
    s.src=src+(src.includes('?')?'&':'?')+'force='+Date.now();
    document.head.appendChild(s);
  },delay);
  load('mitglied-runde2.js?v=20260904-r2-final',1800);
  load('mitglied-runde2-ablehnen.js?v=20260904-r2-final',2200);
  load('mitglied-runde2-feedback.js?v=20260904-r2-final',2400);
})();
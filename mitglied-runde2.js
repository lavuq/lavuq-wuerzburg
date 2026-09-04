(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoStage=(params.get('demoStage')||'').toLowerCase();
  const demoUser=(params.get('demoUser')||'leon').toLowerCase();
  if(!isDemo||demoStage!=='round2')return;

  const M4_KEY='lavuq_demo_meeting4_state_v1';
  const RECS={
    'Café & Kaffee':['Café Wunschlos Glücklich','Café Fred','Café Schönborn'],
    'Essen & Trinken':['Bürgerspital Weinstuben','Backöfele','Sternbäck'],
    'Spaziergang & draußen':['Alte Mainbrücke','Hofgarten der Residenz','Mainufer'],
    'Aktivität & Freizeit':['Minigolf am Main','Bowling Würzburg','Festung Marienberg']
  };

  function readM4(){
    try{
      const s=JSON.parse(localStorage.getItem(M4_KEY)||'{}')||{};
      s.proposal=s.proposal||null;
      s.votes=s.votes||{leon:false,anna:false,sophie:false,daniel:false};
      return s;
    }catch{return {proposal:null,votes:{leon:false,anna:false,sophie:false,daniel:false}};}
  }
  function writeM4(s){try{localStorage.setItem(M4_KEY,JSON.stringify(s));}catch{}}
  function fmt(v){try{return new Date(v).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'});}catch{return v;}}

  function card(n,title,sub,body='',locked=false){
    return `<div class="meeting${locked?' meeting-locked':''}" id="meeting-${n}"><div class="meeting-head"><div class="meeting-number">${n}</div><div><strong>${title}</strong><div class="muted">${sub}</div></div></div>${body}</div>`;
  }

  function renderBase(){
    const list=document.getElementById('meetingList');
    if(!list)return false;
    list.innerHTML=
      card(1,'Treffen 1','Abgeschlossen · Feedback vollständig','<div class="meeting-actions"><div class="status ok compact" style="width:100%">Runde 1 · abgeschlossen ✓</div></div>')+
      card(2,'Treffen 2','Abgeschlossen · Feedback vollständig','<div class="meeting-actions"><div class="status ok compact" style="width:100%">Runde 1 · abgeschlossen ✓</div></div>')+
      card(3,'Treffen 3','Abgeschlossen · Feedback vollständig','<div class="meeting-actions"><div class="status ok compact" style="width:100%">Runde 1 · abgeschlossen ✓</div></div>')+
      `<div style="padding:6px 4px 0;color:#8b6826;font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem">Runde 2 · Treffen 4–6</div>`+
      card(4,'Treffen 4','Neue Runde gestartet · jetzt Termin planen','<div class="meeting-actions"><button class="btn btn-dark" type="button" data-open-m4>Termin festlegen</button></div><div class="schedule-panel hidden" id="schedule-4"></div>')+
      card(5,'Treffen 5','Wird nach dem Feedback zu Treffen 4 freigeschaltet.','<div class="meeting-actions"><div class="meeting-lock-note">🔒 Noch gesperrt</div></div>',true)+
      card(6,'Treffen 6','Wird nach dem Feedback zu Treffen 5 freigeschaltet.','<div class="meeting-actions"><div class="meeting-lock-note">🔒 Noch gesperrt</div></div>',true);

    const state=document.getElementById('state');
    if(state){state.textContent='Runde 2 ist gestartet ✓ Treffen 4 ist jetzt freigeschaltet.';state.className='status ok';state.classList.remove('hidden');}
    document.querySelector('[data-open-m4]')?.addEventListener('click',openM4);
    renderM4IfOpen();
    return true;
  }

  function openM4(){
    const p=document.getElementById('schedule-4');
    if(!p)return;
    p.classList.toggle('hidden');
    if(!p.classList.contains('hidden'))renderM4(p);
  }
  function renderM4IfOpen(){const p=document.getElementById('schedule-4');if(p&&!p.classList.contains('hidden'))renderM4(p);}

  function renderM4(panel){
    const s=readM4();
    if(s.proposal){
      const yes=Object.values(s.votes).filter(Boolean).length;
      const mine=!!s.votes[demoUser];
      if(yes===4){
        panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="status ok"><strong>Termin verbindlich bestätigt ✓</strong><br>${s.proposal.dateLabel}<br>${s.proposal.place}<br>Alle 4 Teilnehmer haben zugestimmt.</div>`;
        return;
      }
      panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="vote-card"><strong>Aktueller Vorschlag</strong><div style="margin-top:6px">${s.proposal.dateLabel}<br>${s.proposal.place}</div><div class="schedule-meta">Zustimmungen: ${yes} · Ablehnungen: 0${mine?' · Deine Stimme: Ja':''}</div><div class="vote-actions">${mine?'<div class="status ok compact" style="width:100%;text-align:center">Deine Zustimmung ist bereits gespeichert ✓</div>':'<button class="btn btn-primary" type="button" data-m4-yes>Zustimmen</button><button class="btn btn-light" type="button" data-m4-no>Ablehnen</button>'}</div></div>`;
      panel.querySelector('[data-m4-yes]')?.addEventListener('click',()=>{const x=readM4();x.votes[demoUser]=true;writeM4(x);renderM4(panel);});
      panel.querySelector('[data-m4-no]')?.addEventListener('click',()=>{const state=document.getElementById('state');if(state){state.textContent='Demo: Vorschlag für Treffen 4 abgelehnt. Eine neue Vorschlagsrunde wäre nötig.';state.className='status err';}});
      return;
    }

    panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="schedule-form"><div class="full"><label>Datum & Uhrzeit</label><input type="datetime-local" data-m4-date></div><div class="full"><label>Würzburg-Empfehlungen <span class="muted">(optional)</span></label><select data-m4-cat><option value="">Kategorie auswählen</option>${Object.keys(RECS).map(x=>`<option>${x}</option>`).join('')}</select></div><div class="full"><select data-m4-rec disabled><option value="">Erst Kategorie auswählen</option></select></div><div class="full"><label>Eigener Treffpunkt / genaue Idee</label><input type="text" data-m4-place placeholder="Du kannst frei entscheiden"></div><div class="full"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:800"><input type="checkbox" data-m4-public style="width:auto;margin-top:3px"> Ich bestätige, dass der Treffpunkt öffentlich ist.</label></div><div class="full"><button class="btn btn-primary" type="button" data-m4-send>Vorschlag an die Gruppe senden</button></div></div>`;
    const cat=panel.querySelector('[data-m4-cat]'),rec=panel.querySelector('[data-m4-rec]');
    cat?.addEventListener('change',()=>{const opts=RECS[cat.value]||[];rec.innerHTML=opts.length?'<option value="">Empfehlung auswählen</option>'+opts.map(x=>`<option>${x}</option>`).join(''):'<option value="">Erst Kategorie auswählen</option>';rec.disabled=!opts.length;});
    panel.querySelector('[data-m4-send]')?.addEventListener('click',()=>{
      const date=panel.querySelector('[data-m4-date]')?.value;
      const place=(panel.querySelector('[data-m4-place]')?.value||panel.querySelector('[data-m4-rec]')?.value||'').trim();
      const pub=panel.querySelector('[data-m4-public]')?.checked;
      if(!date||!place||!pub){const state=document.getElementById('state');if(state){state.textContent='Bitte Datum, Treffpunkt und die Bestätigung „öffentlicher Treffpunkt“ ausfüllen.';state.className='status err';}return;}
      const x={proposal:{date,dateLabel:fmt(date),place},votes:{leon:false,anna:false,sophie:false,daniel:false}};x.votes[demoUser]=true;writeM4(x);renderM4(panel);
    });
  }

  function start(){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(renderBase()||tries>40)clearInterval(timer);},150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoStage=(params.get('demoStage')||'').toLowerCase();
  const demoUser=(params.get('demoUser')||'leon').toLowerCase();
  if(!isDemo||demoStage!=='round2')return;

  const M4_KEY='lavuq_demo_meeting4_state_v1';
  const RECS={
    '☕ Ruhig kennenlernen':[
      {name:'Café am Dom',address:'Kürschnerhof 2, 97070 Würzburg'},
      {name:'Marktcafé Brandstetter',address:'Marktgasse 3, 97070 Würzburg'},
      {name:'Caféhaus Brückenbäck',address:'Zeller Straße 2, 97082 Würzburg'},
      {name:'Café Fred',address:'Herzogenstraße 4, 97070 Würzburg'},
      {name:'Café Kiess',address:'Kaiserstraße 6, 97070 Würzburg'},
      {name:'Café Lenz',address:'Spiegelstraße 21, 97070 Würzburg'},
      {name:'Café Mozart',address:'Theaterstraße 21, 97070 Würzburg'},
      {name:'Central im Bürgerbräu',address:'Frankfurter Straße 87, 97082 Würzburg'}
    ],
    '🍽️ Gemeinsam essen':[
      {name:'Bürgerspital Weinstuben',address:'Theaterstraße 19, 97070 Würzburg'},
      {name:'Backöfele',address:'Ursulinergasse 2, 97070 Würzburg'},
      {name:'Wirtshaus am Dom',address:'Paradeplatz 4, 97070 Würzburg'},
      {name:'Schützenhof',address:'Mainleitenweg 48, 97082 Würzburg'},
      {name:'Weinstube Maulaffenbäck',address:'Maulhardgasse 9, 97070 Würzburg'},
      {name:'Sophienbäck',address:'Sophienstraße 6, 97072 Würzburg'},
      {name:'Restaurant KUNO 1408',address:'Neubaustraße 7, 97070 Würzburg'},
      {name:'Vier Jahreszeiten',address:'Haugerpfarrgasse 3, 97070 Würzburg'},
      {name:'Sandwich Club Würzburg',address:'Johanniterplatz 3, 97070 Würzburg'}
    ],
    '🎳 Gemeinsam etwas machen':[
      {name:'Bowling Würzburg',address:'Huberstraße 9, 97084 Würzburg'},
      {name:'Schwarzlichtfabrik Würzburg',address:'Bahnhofplatz 2A, 97070 Würzburg'},
      {name:'EscapeGames Würzburg',address:'Bahnhofplatz 2, 97070 Würzburg'},
      {name:'Gamer Würzburg – Die Gameshow',address:'Bahnhofplatz 2A, 97070 Würzburg'},
      {name:'DAV Kletterzentrum Würzburg',address:'Weißenburgstraße 55, 97082 Würzburg'},
      {name:'CinemaxX Würzburg',address:'Veitshöchheimer Straße 5A, 97080 Würzburg'},
      {name:'Museum im Kulturspeicher',address:'Oskar-Laredo-Platz 1, 97080 Würzburg'},
      {name:'Martin von Wagner Museum',address:'Residenzplatz 2, Tor A, 97070 Würzburg'}
    ],
    '🌳 Draußen & spazieren':[
      {name:'Residenz & Hofgarten',address:'Residenzplatz 2, 97070 Würzburg'},
      {name:'Botanischer Garten der Universität Würzburg',address:'Julius-von-Sachs-Platz 4, 97082 Würzburg'},
      {name:'Alte Mainbrücke',address:'Alte Mainbrücke, 97070 Würzburg'},
      {name:'Mainufer / Mainkai',address:'Mainkai, 97070 Würzburg'},
      {name:'Alter Kranen',address:'Kranenkai, 97070 Würzburg'},
      {name:'Ringpark',address:'Sanderring, 97070 Würzburg'},
      {name:'Festung Marienberg',address:'Festung Marienberg, 97082 Würzburg'}
    ],
    '🏛️ Würzburg entdecken':[
      {name:'Würzburger Residenz',address:'Residenzplatz 2, 97070 Würzburg'},
      {name:'Martin von Wagner Museum',address:'Residenzplatz 2, Tor A, 97070 Würzburg'},
      {name:'Museum im Kulturspeicher',address:'Oskar-Laredo-Platz 1, 97080 Würzburg'},
      {name:'Festung Marienberg',address:'Festung Marienberg, 97082 Würzburg'},
      {name:'Mainfranken Theater Würzburg',address:'Theaterstraße 21, 97070 Würzburg'},
      {name:'Alte Mainbrücke',address:'Alte Mainbrücke, 97070 Würzburg'},
      {name:'Botanischer Garten der Universität Würzburg',address:'Julius-von-Sachs-Platz 4, 97082 Würzburg'},
      {name:'Central im Bürgerbräu',address:'Frankfurter Straße 87, 97082 Würzburg'}
    ],
    '🌧️ Schlechtwetter':[
      {name:'Museum im Kulturspeicher',address:'Oskar-Laredo-Platz 1, 97080 Würzburg'},
      {name:'Martin von Wagner Museum',address:'Residenzplatz 2, Tor A, 97070 Würzburg'},
      {name:'Bowling Würzburg',address:'Huberstraße 9, 97084 Würzburg'},
      {name:'Schwarzlichtfabrik Würzburg',address:'Bahnhofplatz 2A, 97070 Würzburg'},
      {name:'EscapeGames Würzburg',address:'Bahnhofplatz 2, 97070 Würzburg'},
      {name:'Gamer Würzburg – Die Gameshow',address:'Bahnhofplatz 2A, 97070 Würzburg'},
      {name:'DAV Kletterzentrum Würzburg',address:'Weißenburgstraße 55, 97082 Würzburg'},
      {name:'CinemaxX Würzburg',address:'Veitshöchheimer Straße 5A, 97080 Würzburg'},
      {name:'Mainfranken Theater Würzburg',address:'Theaterstraße 21, 97070 Würzburg'}
    ]
  };

  function esc(v){return String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function addStyles(){
    if(document.getElementById('lavuq-r2-dropdown-style'))return;
    const s=document.createElement('style');
    s.id='lavuq-r2-dropdown-style';
    s.textContent=`.lavuq-r2-select{width:100%;min-height:48px;border:1px solid #d9d1c4;border-radius:13px;padding:12px 13px;background:#fff;font:inherit;color:#132033;margin-top:8px}.lavuq-r2-select:disabled{background:#f3f5f7;color:#98a2b3}.lavuq-r2-address{margin-top:9px;padding:11px 12px;border-radius:12px;background:#edf8f1;color:#20543b;font-size:.82rem;font-weight:800;line-height:1.4}.lavuq-r2-help{margin-top:8px;color:#697386;font-size:.78rem;line-height:1.4}`;
    document.head.appendChild(s);
  }
  function readM4(){try{const s=JSON.parse(localStorage.getItem(M4_KEY)||'{}')||{};s.proposal=s.proposal||null;s.votes=s.votes||{leon:false,anna:false,sophie:false,daniel:false};return s;}catch{return {proposal:null,votes:{leon:false,anna:false,sophie:false,daniel:false}};}}
  function writeM4(s){try{localStorage.setItem(M4_KEY,JSON.stringify(s));}catch{}}
  function fmt(v){try{return new Date(v).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'});}catch{return v;}}
  function card(n,title,sub,body='',locked=false){return `<div class="meeting${locked?' meeting-locked':''}" id="meeting-${n}"><div class="meeting-head"><div class="meeting-number">${n}</div><div><strong>${title}</strong><div class="muted">${sub}</div></div></div>${body}</div>`;}

  function renderBase(){
    const list=document.getElementById('meetingList'); if(!list)return false;
    list.innerHTML=card(1,'Treffen 1','Abgeschlossen · Feedback vollständig','<div class="meeting-actions"><div class="status ok compact" style="width:100%">Runde 1 · abgeschlossen ✓</div></div>')+
      card(2,'Treffen 2','Abgeschlossen · Feedback vollständig','<div class="meeting-actions"><div class="status ok compact" style="width:100%">Runde 1 · abgeschlossen ✓</div></div>')+
      card(3,'Treffen 3','Abgeschlossen · Feedback vollständig','<div class="meeting-actions"><div class="status ok compact" style="width:100%">Runde 1 · abgeschlossen ✓</div></div>')+
      `<div style="padding:6px 4px 0;color:#8b6826;font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:.78rem">Runde 2 · Treffen 4–6</div>`+
      card(4,'Treffen 4','Neue Runde gestartet · jetzt Termin planen','<div class="meeting-actions"><button class="btn btn-dark" type="button" data-open-m4>Termin festlegen</button></div><div class="schedule-panel hidden" id="schedule-4"></div>')+
      card(5,'Treffen 5','Wird nach dem Feedback zu Treffen 4 freigeschaltet.','<div class="meeting-actions"><div class="meeting-lock-note">🔒 Noch gesperrt</div></div>',true)+
      card(6,'Treffen 6','Wird nach dem Feedback zu Treffen 5 freigeschaltet.','<div class="meeting-actions"><div class="meeting-lock-note">🔒 Noch gesperrt</div></div>',true);
    document.querySelector('[data-open-m4]')?.addEventListener('click',openM4); return true;
  }
  function openM4(){const p=document.getElementById('schedule-4');if(!p)return;p.classList.toggle('hidden');if(!p.classList.contains('hidden'))renderM4(p);}

  function bindRec(panel){
    const cat=panel.querySelector('[data-m4-cat]');
    const rec=panel.querySelector('[data-m4-rec]');
    const hidden=panel.querySelector('[data-m4-rec-value]');
    const addr=panel.querySelector('[data-m4-address]');
    cat?.addEventListener('change',()=>{
      const items=RECS[cat.value]||[];
      rec.innerHTML='<option value="">2. Treffpunkt auswählen</option>'+items.map((x,i)=>`<option value="${i}">${esc(x.name)} — ${esc(x.address)}</option>`).join('');
      rec.disabled=!items.length; hidden.value=''; addr.textContent=''; addr.classList.add('hidden');
    });
    rec?.addEventListener('change',()=>{
      const item=(RECS[cat.value]||[])[Number(rec.value)];
      if(!item){hidden.value='';addr.textContent='';addr.classList.add('hidden');return;}
      hidden.value=`${item.name} · ${item.address}`;
      addr.textContent=`📍 ${item.address}`; addr.classList.remove('hidden');
    });
  }

  function renderM4(panel){
    addStyles(); const s=readM4();
    if(s.proposal){
      const yes=Object.values(s.votes).filter(Boolean).length; const mine=!!s.votes[demoUser];
      if(yes===4){panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="status ok"><strong>Termin verbindlich bestätigt ✓</strong><br>${s.proposal.dateLabel}<br>${s.proposal.place}<br>Alle 4 Teilnehmer haben zugestimmt.</div>`;return;}
      panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="vote-card"><strong>Aktueller Vorschlag</strong><div style="margin-top:6px">${s.proposal.dateLabel}<br>${s.proposal.place}</div><div class="schedule-meta">Zustimmungen: ${yes} · Ablehnungen: 0${mine?' · Deine Stimme: Ja':''}</div><div class="vote-actions">${mine?'<div class="status ok compact" style="width:100%;text-align:center">Deine Zustimmung ist bereits gespeichert ✓</div>':'<button class="btn btn-primary" type="button" data-m4-yes>Zustimmen</button><button class="btn btn-light" type="button" data-m4-no>Ablehnen</button>'}</div></div>`;
      panel.querySelector('[data-m4-yes]')?.addEventListener('click',()=>{const x=readM4();x.votes[demoUser]=true;writeM4(x);renderM4(panel);});
      return;
    }
    panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="schedule-form"><div class="full"><label>Datum & Uhrzeit</label><input type="datetime-local" data-m4-date></div><div class="full"><label>Würzburg-Empfehlungen <span class="muted">(optional)</span></label><select class="lavuq-r2-select" data-m4-cat><option value="">1. Kategorie auswählen</option>${Object.keys(RECS).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select><select class="lavuq-r2-select" data-m4-rec disabled><option value="">2. Erst Kategorie auswählen</option></select><div class="lavuq-r2-address hidden" data-m4-address></div><div class="lavuq-r2-help">Im zweiten Dropdown siehst du direkt den Treffpunkt inklusive Adresse.</div><input type="hidden" data-m4-rec-value></div><div class="full"><label>Eigener Treffpunkt / genaue Idee</label><input type="text" data-m4-place placeholder="Oder eigenen Treffpunkt eintragen"></div><div class="full"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:800"><input type="checkbox" data-m4-public style="width:auto;margin-top:3px"> Ich bestätige, dass der Treffpunkt öffentlich ist.</label></div><div class="full"><button class="btn btn-primary" type="button" data-m4-send>Vorschlag an die Gruppe senden</button></div></div>`;
    bindRec(panel);
    panel.querySelector('[data-m4-send]')?.addEventListener('click',()=>{
      const date=panel.querySelector('[data-m4-date]')?.value;
      const place=(panel.querySelector('[data-m4-place]')?.value||panel.querySelector('[data-m4-rec-value]')?.value||'').trim();
      const pub=panel.querySelector('[data-m4-public]')?.checked;
      if(!date||!place||!pub){const state=document.getElementById('state');if(state){state.textContent='Bitte Datum, Treffpunkt und die Bestätigung „öffentlicher Treffpunkt“ ausfüllen.';state.className='status err';}return;}
      const x={proposal:{date,dateLabel:fmt(date),place},votes:{leon:false,anna:false,sophie:false,daniel:false}};x.votes[demoUser]=true;writeM4(x);renderM4(panel);
    });
  }
  function start(){let tries=0;const timer=setInterval(()=>{tries++;if(renderBase()||tries>40)clearInterval(timer);},150);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
(()=>{
  const params=new URLSearchParams(location.search);
  const isDemo=params.get('demo')==='1';
  const demoStage=(params.get('demoStage')||'').toLowerCase();
  const demoUser=(params.get('demoUser')||'leon').toLowerCase();
  if(!isDemo||demoStage!=='round2')return;

  const M4_KEY='lavuq_demo_meeting4_state_v1';
  const RECS={
    '☕ Ruhig kennenlernen':[
      {name:'Café Wunschlos Glücklich',meta:'Café · ruhig · gut zum Kennenlernen'},
      {name:'Café Schönborn',meta:'Café · zentral · unkompliziert'},
      {name:'Café Fred',meta:'Café · entspannt · Gesprächsatmosphäre'},
      {name:'Lusamgärtchen',meta:'Ruhiger Treffpunkt · draußen · kostenlos'}
    ],
    '🍽️ Gemeinsam essen':[
      {name:'Bürgerspital Weinstuben',meta:'Fränkisch · zentral · gemeinsames Essen'},
      {name:'Backöfele',meta:'Fränkisch · gemütlich · Innenstadt'},
      {name:'Sternbäck',meta:'Unkompliziert · zentral · Essen & Trinken'},
      {name:'Marktplatz Würzburg',meta:'Mehrere Möglichkeiten · flexibel · zentral'}
    ],
    '🎳 Gemeinsam etwas machen':[
      {name:'Minigolf am Main',meta:'Aktivität · locker · gut für Gruppen'},
      {name:'Bowling Würzburg',meta:'Indoor · aktiv · wetterunabhängig'},
      {name:'Festung-Rundgang',meta:'Bewegen · entdecken · Gespräche nebenbei'},
      {name:'Mainufer mit gemeinsamer Aktivität',meta:'Flexibel · draußen · kostenlos'}
    ],
    '🌳 Draußen & spazieren':[
      {name:'Mainufer',meta:'Spaziergang · kostenlos · viel Platz'},
      {name:'Alte Mainbrücke',meta:'Zentral · Würzburg-Klassiker · Spaziergang'},
      {name:'Hofgarten der Residenz',meta:'Ruhig · gepflegt · öffentlich'},
      {name:'Ringpark',meta:'Grün · entspannt · kostenlos'}
    ],
    '🏛️ Würzburg entdecken':[
      {name:'Festung Marienberg',meta:'Sehenswürdigkeit · Aussicht · gemeinsam entdecken'},
      {name:'Residenz & Hofgarten',meta:'Kultur · zentral · flexibel kombinierbar'},
      {name:'Museum im Kulturspeicher',meta:'Kultur · Indoor · wetterunabhängig'},
      {name:'Alter Kranen',meta:'Main · Altstadt · guter Startpunkt'}
    ],
    '🌧️ Schlechtwetter':[
      {name:'Museum im Kulturspeicher',meta:'Indoor · Kultur · wetterunabhängig'},
      {name:'Museum am Dom',meta:'Indoor · zentral · Kultur'},
      {name:'Bowling Würzburg',meta:'Indoor · aktiv · Gruppenerlebnis'},
      {name:'Café Schönborn',meta:'Indoor · zentral · entspannt'}
    ]
  };

  function addRecStyles(){
    if(document.getElementById('lavuq-rec-style'))return;
    const style=document.createElement('style');
    style.id='lavuq-rec-style';
    style.textContent=`
      .lavuq-rec-cats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
      .lavuq-rec-cat{border:1px solid #ddd5c8;background:#fff;color:#132033;border-radius:13px;padding:11px 10px;font:inherit;font-weight:800;text-align:left;cursor:pointer;line-height:1.25}
      .lavuq-rec-cat.active{background:#041529;color:#fff;border-color:#041529}
      .lavuq-rec-list{display:grid;gap:8px;margin-top:10px}
      .lavuq-rec-card{width:100%;border:1px solid #e3dccf;background:#fff;border-radius:14px;padding:12px 13px;text-align:left;cursor:pointer;color:#132033}
      .lavuq-rec-card strong{display:block;font-size:.95rem;margin-bottom:3px}
      .lavuq-rec-card span{display:block;color:#667085;font-size:.8rem;line-height:1.35}
      .lavuq-rec-card.selected{border-color:#d8b46a;background:#fff8e7;box-shadow:0 0 0 2px rgba(216,180,106,.16)}
      .lavuq-rec-card.selected:after{content:'✓ Ausgewählt';display:block;margin-top:7px;color:#20543b;font-size:.78rem;font-weight:900}
      .lavuq-rec-hint{margin-top:8px;color:#667085;font-size:.78rem;line-height:1.4}
      @media(max-width:520px){.lavuq-rec-cats{grid-template-columns:1fr}.lavuq-rec-cat{min-height:48px}}
    `;
    document.head.appendChild(style);
  }

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

  function bindRecommendations(panel){
    const hidden=panel.querySelector('[data-m4-rec-value]');
    const list=panel.querySelector('[data-m4-rec-list]');
    panel.querySelectorAll('[data-m4-cat-card]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        panel.querySelectorAll('[data-m4-cat-card]').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        const category=btn.dataset.m4CatCard;
        const options=RECS[category]||[];
        hidden.value='';
        list.innerHTML=options.map(item=>`<button class="lavuq-rec-card" type="button" data-m4-rec-card="${item.name.replace(/"/g,'&quot;')}"><strong>${item.name}</strong><span>${item.meta}</span></button>`).join('');
        list.querySelectorAll('[data-m4-rec-card]').forEach(rec=>{
          rec.addEventListener('click',()=>{
            list.querySelectorAll('[data-m4-rec-card]').forEach(x=>x.classList.remove('selected'));
            rec.classList.add('selected');
            hidden.value=rec.dataset.m4RecCard;
          });
        });
      });
    });
  }

  function renderM4(panel){
    addRecStyles();
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

    panel.innerHTML=`<h3>Terminabstimmung · Treffen 4</h3><div class="schedule-meta">Vorschlagsrunden: 1 von 5</div><div class="schedule-form"><div class="full"><label>Datum & Uhrzeit</label><input type="datetime-local" data-m4-date></div><div class="full"><label>Würzburg-Empfehlungen <span class="muted">(optional)</span></label><div class="lavuq-rec-hint">Wählt zuerst aus, welche Art von Treffen zu euch passt.</div><div class="lavuq-rec-cats">${Object.keys(RECS).map(x=>`<button class="lavuq-rec-cat" type="button" data-m4-cat-card="${x}">${x}</button>`).join('')}</div><div class="lavuq-rec-list" data-m4-rec-list></div><input type="hidden" data-m4-rec-value></div><div class="full"><label>Eigener Treffpunkt / genaue Idee</label><input type="text" data-m4-place placeholder="Oder eigenen Treffpunkt eintragen"></div><div class="full"><label style="display:flex;gap:10px;align-items:flex-start;font-weight:800"><input type="checkbox" data-m4-public style="width:auto;margin-top:3px"> Ich bestätige, dass der Treffpunkt öffentlich ist.</label></div><div class="full"><button class="btn btn-primary" type="button" data-m4-send>Vorschlag an die Gruppe senden</button></div></div>`;
    bindRecommendations(panel);
    panel.querySelector('[data-m4-send]')?.addEventListener('click',()=>{
      const date=panel.querySelector('[data-m4-date]')?.value;
      const place=(panel.querySelector('[data-m4-place]')?.value||panel.querySelector('[data-m4-rec-value]')?.value||'').trim();
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
(()=>{
  const CATEGORIES={
    '☕ Ruhig kennenlernen':[
      {name:'Café am Dom',address:'Kürschnerhof 2, 97070 Würzburg'},
      {name:'Marktcafé Brandstetter',address:'Marktgasse 3, 97070 Würzburg'},
      {name:'Caféhaus Brückenbäck',address:'Zeller Straße 2, 97082 Würzburg'},
      {name:'Café Fred',address:'Herzogenstraße 4, 97070 Würzburg'},
      {name:'Café Kiess',address:'Kaiserstraße 6, 97070 Würzburg'},
      {name:'Café Lenz',address:'Spiegelstraße 21, 97070 Würzburg'},
      {name:'Café Mozart',address:'Theaterstraße 21, 97070 Würzburg'},
      {name:'Mainfranken Theater – Foyer/Treffpunkt',address:'Theaterstraße 21, 97070 Würzburg'},
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
      {name:'Sandwich Club Würzburg',address:'Johanniterplatz 3, 97070 Würzburg'},
      {name:'Weinstube Halbleib',address:'Kolpingstraße 9, 97070 Würzburg'}
    ],
    '🎳 Gemeinsam etwas machen':[
      {name:'Bowling Würzburg',address:'Huberstraße 9, 97084 Würzburg'},
      {name:'Schwarzlichtfabrik Würzburg',address:'Bahnhofplatz 2A, 97070 Würzburg'},
      {name:'EscapeGames Würzburg',address:'Bahnhofplatz 2, 97070 Würzburg'},
      {name:'Gamer Würzburg – Die Gameshow',address:'Bahnhofplatz 2A, 97070 Würzburg'},
      {name:'DAV Kletterzentrum Würzburg',address:'Weißenburgstraße 55, 97082 Würzburg'},
      {name:'Central im Bürgerbräu',address:'Frankfurter Straße 87, 97082 Würzburg'},
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
      {name:'Festung Marienberg',address:'Festung Marienberg, 97082 Würzburg'},
      {name:'Hofgarten der Residenz',address:'Residenzplatz 2, 97070 Würzburg'}
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
      {name:'Central im Bürgerbräu',address:'Frankfurter Straße 87, 97082 Würzburg'},
      {name:'CinemaxX Würzburg',address:'Veitshöchheimer Straße 5A, 97080 Würzburg'},
      {name:'Mainfranken Theater Würzburg',address:'Theaterstraße 21, 97070 Würzburg'}
    ]
  };

  function addStyles(){
    if(document.getElementById('lavuq-recommendation-style'))return;
    const s=document.createElement('style');
    s.id='lavuq-recommendation-style';
    s.textContent=`
      .lavuq-rec-block{margin-top:2px}
      .lavuq-rec-block label{display:block;font-weight:800;font-size:.9rem;margin-bottom:7px;color:#344054}
      .lavuq-rec-select{width:100%;min-height:48px;border:1px solid #d9d1c4;border-radius:13px;padding:12px 13px;background:#fff;font:inherit;color:#132033;margin-bottom:10px}
      .lavuq-rec-select:focus{outline:3px solid rgba(216,180,106,.18);border-color:#bea05d}
      .lavuq-rec-select:disabled{background:#f3f5f7;color:#98a2b3}
      .lavuq-rec-address{margin-top:1px;padding:11px 12px;border-radius:12px;background:#edf8f1;color:#20543b;font-size:.82rem;line-height:1.4;font-weight:700}
      .lavuq-rec-help{margin-top:8px;color:#697386;font-size:.78rem;line-height:1.4}
      .lavuq-old-rec-hidden{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function esc(value){
    return String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function placeInputFor(form,attempt,kind){
    if(kind==='base')return form.querySelector(`#place-${attempt}`);
    return form.querySelector(`[data-m${attempt}-place]`) || form.querySelector('[data-m2-place],[data-m3-place],[data-m4-place],[data-m5-place],[data-m6-place]');
  }

  function buildBlock(form,attempt,kind,anchor){
    if(form.querySelector(`.lavuq-rec-block[data-for="${attempt}"]`))return;
    const place=placeInputFor(form,attempt,kind);
    if(!place)return;

    const block=document.createElement('div');
    block.className='full lavuq-rec-block';
    block.dataset.for=attempt;
    block.innerHTML=`
      <label>Würzburg-Empfehlungen <span class="muted" style="font-weight:400">(optional)</span></label>
      <select class="lavuq-rec-select lavuq-rec-category" aria-label="Kategorie für Würzburg-Empfehlungen">
        <option value="">1. Kategorie auswählen</option>
        ${Object.keys(CATEGORIES).map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}
      </select>
      <select class="lavuq-rec-select lavuq-rec-place" aria-label="Treffpunkt auswählen" disabled>
        <option value="">2. Erst Kategorie auswählen</option>
      </select>
      <div class="lavuq-rec-address hidden"></div>
      <div class="lavuq-rec-help">Erstes Dropdown: Art des Treffens. Zweites Dropdown: konkreter Treffpunkt inklusive Adresse. Eine eigene Idee kannst du darunter weiterhin frei eintragen.</div>`;

    anchor.insertAdjacentElement('beforebegin',block);
    const category=block.querySelector('.lavuq-rec-category');
    const rec=block.querySelector('.lavuq-rec-place');
    const address=block.querySelector('.lavuq-rec-address');

    category.addEventListener('change',()=>{
      const items=CATEGORIES[category.value]||[];
      rec.innerHTML='<option value="">Treffpunkt auswählen</option>'+items.map((item,i)=>`<option value="${i}">${esc(item.name)} — ${esc(item.address)}</option>`).join('');
      rec.disabled=!items.length;
      address.textContent='';
      address.classList.add('hidden');
      if(!items.length){place.value='';place.dispatchEvent(new Event('input',{bubbles:true}));}
    });

    rec.addEventListener('change',()=>{
      const items=CATEGORIES[category.value]||[];
      const item=items[Number(rec.value)];
      if(!item){
        place.value='';
        address.textContent='';
        address.classList.add('hidden');
      }else{
        place.value=`${item.name} · ${item.address}`;
        address.textContent=`📍 ${item.address}`;
        address.classList.remove('hidden');
      }
      place.dispatchEvent(new Event('input',{bubbles:true}));
      place.dispatchEvent(new Event('change',{bubbles:true}));
    });
  }

  function upgradeBase(form){
    const old=form.querySelector('select[id^="suggestion-"]');
    if(!old)return;
    const m=(old.id.match(/suggestion-(\d+)/)||[])[1];
    if(!m)return;
    const holder=old.closest('div');
    if(!holder||holder.dataset.lavuqRecDone==='1')return;
    holder.dataset.lavuqRecDone='1';
    holder.classList.add('lavuq-old-rec-hidden');
    const place=form.querySelector(`#place-${m}`)?.closest('.full') || form.querySelector(`#place-${m}`)?.parentElement;
    if(place)buildBlock(form,m,'base',place);
  }

  function upgradeDemo(form){
    const cat=form.querySelector('[data-m2-cat],[data-m3-cat],[data-m4-cat],[data-m5-cat],[data-m6-cat]');
    if(!cat)return;
    const attr=[...cat.attributes].find(a=>/^data-m\d+-cat$/.test(a.name));
    if(!attr)return;
    const m=(attr.name.match(/data-m(\d+)-cat/)||[])[1];
    if(!m)return;
    const holder=cat.closest('.full')||cat.parentElement;
    if(holder&&holder.dataset.lavuqRecDone!=='1'){
      holder.dataset.lavuqRecDone='1';
      holder.classList.add('lavuq-old-rec-hidden');
    }
    const oldRec=form.querySelector(`[data-m${m}-rec]`);
    if(oldRec){const h=oldRec.closest('.full')||oldRec.parentElement;h?.classList.add('lavuq-old-rec-hidden');}
    const place=form.querySelector(`[data-m${m}-place]`)?.closest('.full') || form.querySelector(`[data-m${m}-place]`)?.parentElement;
    if(place)buildBlock(form,m,m,place);
  }

  function scan(root=document){
    addStyles();
    root.querySelectorAll?.('.schedule-form').forEach(form=>{
      if(form.querySelector('.lavuq-rec-block'))return;
      upgradeBase(form);
      upgradeDemo(form);
    });
  }

  function start(){
    scan();
    const observer=new MutationObserver(muts=>{
      for(const m of muts){for(const n of m.addedNodes){if(n.nodeType===1)scan(n);}}
      scan();
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
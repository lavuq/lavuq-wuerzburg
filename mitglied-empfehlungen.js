(()=>{
  const CATEGORIES={
    '☕ Ruhig kennenlernen':[
      {name:'Café Wunschlos Glücklich',meta:'Café · ruhig · gut zum Kennenlernen'},
      {name:'Café Schönborn',meta:'Café · zentral · öffentlicher Treffpunkt'},
      {name:'Mainfranken Theater / Theater-Café Umfeld',meta:'zentral · entspannt · gut erreichbar'}
    ],
    '🍽️ Gemeinsam essen':[
      {name:'Bürgerspital Weinstuben',meta:'fränkisch · zentral · gemeinsames Essen'},
      {name:'Backöfele',meta:'fränkisch · Innenstadt · gemütlich'},
      {name:'Sternbäck',meta:'zentral · unkompliziert · Essen & Trinken'}
    ],
    '🎳 Gemeinsam etwas machen':[
      {name:'Minigolf am Main',meta:'Aktivität · locker · Gespräch nebenbei'},
      {name:'Bowling Würzburg',meta:'Indoor · aktiv · gruppengeeignet'},
      {name:'Escape Room Würzburg',meta:'Indoor · gemeinsames Erlebnis · Teamaktivität'}
    ],
    '🌳 Draußen & spazieren':[
      {name:'Mainufer',meta:'Spaziergang · kostenlos · viel Platz'},
      {name:'Hofgarten der Residenz',meta:'Park · ruhig · zentral'},
      {name:'Alter Kranen',meta:'Main · zentral · guter Startpunkt'}
    ],
    '🏛️ Würzburg entdecken':[
      {name:'Residenz & Hofgarten',meta:'Sehenswürdigkeit · zentral · Kultur'},
      {name:'Festung Marienberg',meta:'Würzburg-Blick · Spaziergang · Kultur'},
      {name:'Museum im Kulturspeicher',meta:'Museum · öffentlich · wetterunabhängig'}
    ],
    '🌧️ Schlechtwetter':[
      {name:'Museum im Kulturspeicher',meta:'Indoor · Kultur · ruhig'},
      {name:'Bowling Würzburg',meta:'Indoor · aktiv · gruppengeeignet'},
      {name:'Café Schönborn',meta:'Indoor · zentral · entspannt'}
    ]
  };

  function addStyles(){
    if(document.getElementById('lavuq-recommendation-style'))return;
    const s=document.createElement('style');
    s.id='lavuq-recommendation-style';
    s.textContent=`
      .lavuq-rec-block{margin-top:2px}
      .lavuq-rec-block label{display:block;font-weight:800;font-size:.9rem;margin-bottom:7px;color:#344054}
      .lavuq-rec-category{width:100%;min-height:48px;border:1px solid #d9d1c4;border-radius:13px;padding:12px 13px;background:#fff;font:inherit;color:#132033}
      .lavuq-rec-category:focus{outline:3px solid rgba(216,180,106,.18);border-color:#bea05d}
      .lavuq-rec-cards{display:grid;gap:9px;margin-top:10px}
      .lavuq-rec-card{appearance:none;width:100%;border:1px solid #ddd5c8;border-radius:14px;background:#fff;padding:12px 13px;text-align:left;color:#132033;cursor:pointer;box-shadow:0 3px 10px rgba(4,21,41,.035)}
      .lavuq-rec-card strong{display:block;font-size:.92rem;margin-bottom:3px}
      .lavuq-rec-card span{display:block;color:#697386;font-size:.78rem;line-height:1.35}
      .lavuq-rec-card.selected{border-color:#d8b46a;background:#fff8e7;box-shadow:0 0 0 2px rgba(216,180,106,.14)}
      .lavuq-rec-card.selected strong:after{content:'  ✓ Ausgewählt';color:#2b6248;font-size:.72rem}
      .lavuq-rec-help{margin-top:8px;color:#697386;font-size:.78rem;line-height:1.4}
      .lavuq-old-rec-hidden{display:none!important}
    `;
    document.head.appendChild(s);
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
      <select class="lavuq-rec-category" aria-label="Kategorie für Würzburg-Empfehlungen">
        <option value="">Kategorie auswählen</option>
        ${Object.keys(CATEGORIES).map(c=>`<option value="${c}">${c}</option>`).join('')}
      </select>
      <div class="lavuq-rec-cards hidden"></div>
      <div class="lavuq-rec-help">Wähle eine Kategorie und danach einen passenden öffentlichen Treffpunkt. Du kannst darunter weiterhin eine komplett eigene Idee eintragen.</div>`;

    anchor.insertAdjacentElement('beforebegin',block);
    const category=block.querySelector('.lavuq-rec-category');
    const cards=block.querySelector('.lavuq-rec-cards');
    category.addEventListener('change',()=>{
      const items=CATEGORIES[category.value]||[];
      if(!items.length){cards.innerHTML='';cards.classList.add('hidden');return;}
      cards.innerHTML=items.map(item=>`<button type="button" class="lavuq-rec-card" data-place="${item.name.replace(/"/g,'&quot;')}"><strong>${item.name}</strong><span>${item.meta}</span></button>`).join('');
      cards.classList.remove('hidden');
      cards.querySelectorAll('.lavuq-rec-card').forEach(btn=>btn.addEventListener('click',()=>{
        cards.querySelectorAll('.lavuq-rec-card').forEach(x=>x.classList.remove('selected'));
        btn.classList.add('selected');
        place.value=btn.dataset.place||'';
        place.dispatchEvent(new Event('input',{bubbles:true}));
        place.dispatchEvent(new Event('change',{bubbles:true}));
      }));
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
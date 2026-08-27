document.querySelectorAll('.brand-mark').forEach(img=>{
  img.src='lavuq-q-square.png?v=full-logo-20260826-2';
  img.style.setProperty('display','block','important');
  img.style.setProperty('visibility','visible','important');
  img.style.setProperty('opacity','1','important');
  img.style.setProperty('width','48px','important');
  img.style.setProperty('height','48px','important');
  img.style.setProperty('object-fit','cover','important');
});

const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){
  let backdrop=document.querySelector('.menu-backdrop');
  if(!backdrop){
    backdrop=document.createElement('div');
    backdrop.className='menu-backdrop';
    document.body.appendChild(backdrop);
  }
  const closeMenu=()=>{nav.classList.remove('open');backdrop.classList.remove('open');document.body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';};
  const openMenu=()=>{nav.classList.add('open');backdrop.classList.add('open');document.body.classList.add('menu-open');toggle.setAttribute('aria-expanded','true');toggle.textContent='✕';};
  toggle.addEventListener('click',()=>nav.classList.contains('open')?closeMenu():openMenu());
  backdrop.addEventListener('click',closeMenu);
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
}

document.querySelectorAll('.faq-q').forEach(btn=>btn.addEventListener('click',()=>btn.parentElement.classList.toggle('open')));

const form=document.querySelector('#applyForm');
if(form){
  form.noValidate=true;

  const firstStep=form.querySelector('.form-step');
  const nameField=firstStep?.querySelector('#name')?.closest('.field');
  if(firstStep && nameField && !form.querySelector('[name="Email"]')){
    const contact=document.createElement('div');
    contact.innerHTML=`<div class="grid-2"><div class="field"><label for="email">E-Mail-Adresse *</label><input id="email" name="Email" type="email" required autocomplete="email" placeholder="name@beispiel.de"></div><div class="field"><label for="mobile">Mobilnummer / WhatsApp <span class="muted">(freiwillig)</span></label><input id="mobile" name="Mobilnummer" type="tel" autocomplete="tel" placeholder="z. B. 0171 1234567"></div></div>`;
    nameField.insertAdjacentElement('afterend',contact.firstElementChild);
  }

  const oldPrivacy=form.querySelector('[name="Datenschutzhinweise_gelesen"]');
  if(oldPrivacy) oldPrivacy.closest('label')?.remove();

  const privacy=form.querySelector('[name="Datenschutz_bestaetigt"]');
  const submitBtn=form.querySelector('button[type="submit"]');
  const finalActions=submitBtn?.closest('.form-actions');
  if(privacy && finalActions){
    const privacyLabel=privacy.closest('label');
    if(privacyLabel){
      privacyLabel.style.margin='18px 0';
      finalActions.parentElement?.insertBefore(privacyLabel,finalActions);
    }
  }

  let step=0;
  const steps=[...form.querySelectorAll('.form-step')];
  const bar=document.querySelector('.progress-bar');
  const label=document.querySelector('#progressLabel');

  function show(){
    steps.forEach((s,i)=>s.classList.toggle('active',i===step));
    if(bar) bar.style.width=((step+1)/steps.length*100)+'%';
    if(label) label.textContent=`Schritt ${step+1} von ${steps.length}`;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function showInvalid(invalid){
    if(!invalid) return false;
    const invalidStep=invalid.closest('.form-step');
    const index=steps.indexOf(invalidStep);
    if(index>=0 && index!==step){
      step=index;
      show();
    }
    setTimeout(()=>{
      invalid.reportValidity?.();
      invalid.scrollIntoView?.({behavior:'smooth',block:'center'});
    },80);
    return true;
  }

  document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{
    const invalid=steps[step]?.querySelector(':invalid');
    if(showInvalid(invalid)) return;
    step=Math.min(step+1,steps.length-1);
    show();
  }));

  document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>{
    step=Math.max(0,step-1);
    show();
  }));

  form.addEventListener('submit',async(e)=>{
    e.preventDefault();

    const invalid=form.querySelector(':invalid');
    if(showInvalid(invalid)) return;

    const btn=form.querySelector('button[type="submit"]');
    const original=btn?.textContent || 'Bewerbung absenden';
    if(btn){btn.disabled=true;btn.textContent='Wird gesendet …';}
    const success=document.querySelector('#formSuccess');
    const error=document.querySelector('#formError');
    if(success)success.hidden=true;
    if(error)error.hidden=true;

    try{
      const data=new FormData(form);
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),15000);
      const res=await fetch('https://lavuq-bewerbung.lavuq.workers.dev/',{
        method:'POST',
        mode:'cors',
        credentials:'omit',
        cache:'no-store',
        headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
        body:new URLSearchParams(data).toString(),
        signal:controller.signal
      });
      clearTimeout(timer);
      const raw=await res.text();
      let result={};
      try{result=raw?JSON.parse(raw):{};}catch(_){result={error:raw || 'Ungültige Serverantwort'};}
      if(!res.ok || result.ok!==true) throw new Error(result.error || `HTTP ${res.status}`);

      form.hidden=true;
      form.style.display='none';
      const progressHead=document.querySelector('.progress-head');
      const progress=document.querySelector('.progress');
      const intro=document.querySelector('.application-intro');
      const photo=document.querySelector('.apply-photo');
      [progressHead,progress,intro,photo].forEach(el=>{if(el){el.hidden=true;el.style.display='none';}});
      if(success){
        const p=success.querySelector('p');
        if(p && result.bewerberId) p.textContent=`Deine Bewerbung wurde erfolgreich an LAVUQ übermittelt. Deine Bewerber-ID lautet ${result.bewerberId}. Wir prüfen nun, welche 4er-Gruppe möglichst gut zu deinen Angaben passt, und melden uns, sobald der nächste Schritt ansteht. Bitte hab Verständnis dafür, dass die Zusammenstellung deiner Freundesgruppe etwas Zeit in Anspruch nehmen kann. Wir stellen die Gruppen bewusst nicht nach dem Zufallsprinzip zusammen, sondern achten darauf, dass die Personen möglichst gut zu deinen Angaben und Vorstellungen passen. Je nach aktueller Bewerberlage kann es deshalb etwas dauern, bis wir eine passende Gruppe für dich gefunden haben.`;
        success.hidden=false;
        success.style.setProperty('display','block','important');
        success.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }catch(err){
      console.error('LAVUQ Bewerbungsfehler:',err);
      if(error){
        const p=error.querySelector('p');
        if(p){
          const detail=err?.name==='AbortError' ? 'Der Server hat nicht rechtzeitig geantwortet.' : (err?.message || 'Unbekannter Fehler');
          p.textContent=`Die Bewerbung konnte nicht übermittelt werden. Technischer Hinweis: ${detail}`;
        }
        error.hidden=false;
        error.style.setProperty('display','block','important');
        error.scrollIntoView({behavior:'smooth',block:'start'});
      }
      if(btn){btn.disabled=false;btn.textContent=original;}
    }
  });
  show();
}

if(location.pathname.includes('unsere-regeln')){
  document.querySelectorAll('.card .safety-list .safety-item').forEach(item=>{
    item.style.setProperty('color','#24324a','important');
    item.style.setProperty('opacity','1','important');
  });
}

// Mobile Startseite: LAVU/Würzburg links, Marken-Q unabhängig exakt mittig, Menü rechts.
if((location.pathname==='/' || location.pathname.endsWith('/index.html')) && window.matchMedia('(max-width: 520px)').matches){
  const mobileHeader=document.querySelector('.site-header');
  const mobileWrap=mobileHeader?.querySelector('.nav-wrap');
  const mobileBrand=mobileHeader?.querySelector('.brand');
  const mobileToggle=mobileHeader?.querySelector('.nav-toggle');

  if(mobileHeader && mobileWrap && mobileBrand && mobileToggle){
    mobileBrand.innerHTML=`<span class="mobile-brand-copy"><span class="mobile-brand-name">LAVU</span><span class="mobile-brand-city">Würzburg</span></span>`;

    mobileWrap.querySelector('.mobile-brand-q')?.remove();
    const mobileQ=document.createElement('img');
    mobileQ.className='mobile-brand-q';
    mobileQ.src='lavuq-q-square.png?v=mobile-centered-q-20260828-2';
    mobileQ.alt='LAVUQ Q Logo';
    mobileWrap.appendChild(mobileQ);

    document.querySelector('#lavuq-mobile-header-fix')?.remove();
    const mobileHeaderStyle=document.createElement('style');
    mobileHeaderStyle.id='lavuq-mobile-header-fix';
    mobileHeaderStyle.textContent=`
      @media (max-width:520px){
        .site-header .nav-wrap{
          position:relative!important;
          width:100%!important;
          height:150px!important;
          padding:0 8px!important;
          margin:0!important;
          display:flex!important;
          align-items:center!important;
          justify-content:space-between!important;
        }
        .site-header .brand{
          position:absolute!important;
          left:8px!important;
          top:50%!important;
          transform:translateY(-50%)!important;
          margin:0!important;
          padding:0!important;
          display:block!important;
          width:auto!important;
          color:#fff!important;
        }
        .site-header .brand>span:before,
        .site-header .brand>span:after,
        .site-header .mobile-brand-copy:before,
        .site-header .mobile-brand-copy:after{
          content:none!important;
          display:none!important;
        }
        .site-header .mobile-brand-copy{
          display:flex!important;
          flex-direction:column!important;
          align-items:flex-start!important;
          justify-content:center!important;
          transform:none!important;
          position:static!important;
          line-height:1!important;
          font-size:initial!important;
        }
        .site-header .mobile-brand-name{
          display:block!important;
          color:#fff!important;
          font-family:Georgia,'Times New Roman',serif!important;
          font-size:2.05rem!important;
          font-weight:500!important;
          letter-spacing:.18em!important;
          line-height:1!important;
        }
        .site-header .mobile-brand-city{
          display:block!important;
          color:#d8b46a!important;
          font-family:Georgia,'Times New Roman',serif!important;
          font-size:1.05rem!important;
          font-weight:500!important;
          letter-spacing:.01em!important;
          line-height:1!important;
          margin-top:8px!important;
        }
        .site-header .mobile-brand-q{
          position:absolute!important;
          left:50%!important;
          top:50%!important;
          transform:translate(-50%,-50%)!important;
          width:58px!important;
          height:58px!important;
          object-fit:contain!important;
          object-position:center!important;
          border-radius:0!important;
          box-shadow:none!important;
          margin:0!important;
          z-index:42!important;
        }
        .site-header .nav-toggle{
          position:absolute!important;
          right:18px!important;
          top:50%!important;
          transform:translateY(-50%)!important;
          margin:0!important;
          width:44px!important;
          height:44px!important;
          background:transparent!important;
          color:#d8b46a!important;
          box-shadow:none!important;
          border-radius:0!important;
          font-size:1.65rem!important;
          z-index:43!important;
        }
      }
    `;
    document.head.appendChild(mobileHeaderStyle);
  }
}
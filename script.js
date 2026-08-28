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

  // Klare 4-Schritt-Struktur: Basisdaten → Situation & Gruppe → Über dich & Freundschaft → Wünsche & Abschluss.
  const originalSteps=[...form.querySelectorAll('.form-step')];
  if(originalSteps.length===4){
    const [basisStep,situationStep,aboutStep,finishStep]=originalSteps;
    const situationOriginalQuestions=[...situationStep.querySelectorAll('fieldset')];
    const aboutOriginalQuestions=[...aboutStep.querySelectorAll('fieldset')];

    const genderField=basisStep.querySelector('[name="Geschlecht"]')?.closest('fieldset');
    const lifeField=basisStep.querySelector('[name="Aktuelle_Lebenssituation"]')?.closest('.field');
    const radiusField=basisStep.querySelector('[name="Maximaler_Umkreis"]')?.closest('.field');
    const groupField=basisStep.querySelector('[name="Gewuenschte_Gruppe"]')?.closest('fieldset');
    const situationActions=situationStep.querySelector('.form-actions');

    situationStep.querySelector('h2').textContent='Deine Situation & Gruppe';
    [genderField,lifeField,radiusField,groupField].forEach(el=>{
      if(el && situationActions) situationStep.insertBefore(el,situationActions);
    });

    const aboutHeading=aboutStep.querySelector('h2');
    if(aboutHeading) aboutHeading.textContent='Über dich & Freundschaft';
    const aboutReference=aboutOriginalQuestions[0] || aboutStep.querySelector('.form-actions');
    situationOriginalQuestions.forEach(el=>{
      if(el && aboutReference) aboutStep.insertBefore(el,aboutReference);
    });

    const finishHeading=finishStep.querySelector('h2');
    if(finishHeading) finishHeading.textContent='Deine Wünsche & Abschluss';
    const finishReference=finishStep.querySelector('fieldset') || finishStep.querySelector('.field');
    const q6=aboutOriginalQuestions[2];
    if(q6 && finishReference) finishStep.insertBefore(q6,finishReference);

    [
      [basisStep,'Deine Kontaktdaten – kurz und unkompliziert.'],
      [situationStep,'Damit wir die passende Gruppe für deinen Alltag finden.'],
      [aboutStep,'Jetzt geht es darum, was menschlich und im Alltag zu dir passt.'],
      [finishStep,'Zum Schluss noch deine Wünsche und die notwendigen Bestätigungen.']
    ].forEach(([section,text])=>{
      if(section && !section.querySelector('.step-intro')){
        const intro=document.createElement('p');
        intro.className='step-intro';
        intro.textContent=text;
        section.querySelector('h2')?.insertAdjacentElement('afterend',intro);
      }
    });
  }

  // Moderne Schritt-Navigation und hochwertiger Formular-Look.
  const progressHead=document.querySelector('.progress-head');
  if(progressHead && !document.querySelector('.application-step-nav')){
    const stepNav=document.createElement('div');
    stepNav.className='application-step-nav';
    stepNav.innerHTML=`<span>1 <b>Basis</b></span><span>2 <b>Gruppe</b></span><span>3 <b>Über dich</b></span><span>4 <b>Abschluss</b></span>`;
    progressHead.parentElement?.insertBefore(stepNav,progressHead);
  }

  if(!document.querySelector('#lavuq-application-premium-style')){
    const premium=document.createElement('style');
    premium.id='lavuq-application-premium-style';
    premium.textContent=`
      .application-step-nav{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:30px 0 16px}
      .application-step-nav span{display:flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:8px 10px;border:1px solid #ddd5c8;border-radius:999px;background:#fff;color:#667085;font-size:.82rem;font-weight:800;transition:.2s ease}
      .application-step-nav span.active{background:#07182f;color:#fff;border-color:#07182f;box-shadow:0 8px 22px rgba(7,24,47,.13)}
      .application-step-nav span.active b{color:#e2c178}
      #applyForm .form-step{display:none!important;background:rgba(255,255,255,.96);border:1px solid rgba(7,24,47,.08);border-radius:26px;padding:28px;box-shadow:0 18px 50px rgba(7,24,47,.07)}
      #applyForm .form-step.active{display:block!important;animation:lavuqStepIn .22s ease}
      @keyframes lavuqStepIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      #applyForm .form-step h2{font-size:clamp(1.75rem,4vw,2.35rem);letter-spacing:-.035em;margin-bottom:7px}
      #applyForm .step-intro{margin:0 0 24px;color:#667085;font-size:.96rem}
      #applyForm .field,#applyForm fieldset.field{margin-bottom:20px}
      #applyForm .field label,#applyForm .legend{font-size:.94rem;font-weight:850;letter-spacing:-.01em;margin-bottom:8px;color:#132033}
      #applyForm .field input,#applyForm .field select,#applyForm .field textarea{min-height:52px;border:1px solid #d9dfe7;border-radius:14px;background:#fbfcfd;padding:13px 14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.8);transition:.18s ease}
      #applyForm .field input:focus,#applyForm .field select:focus,#applyForm .field textarea:focus{background:#fff;border-color:#c6a65c;outline:3px solid rgba(216,180,106,.18)}
      #applyForm .options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      #applyForm .option{position:relative;min-height:54px;align-items:center;border:1px solid #dfe3e9;background:#fff;border-radius:14px;padding:13px 14px;font-weight:750;transition:.18s ease}
      #applyForm .option:hover{border-color:#c7aa68}
      #applyForm .option:has(input:checked){border-color:#c29c4c;background:#fff9eb;box-shadow:0 0 0 2px rgba(216,180,106,.12)}
      #applyForm .option input[type="radio"],#applyForm .option input[type="checkbox"]{appearance:none;-webkit-appearance:none;width:20px!important;height:20px!important;min-height:20px!important;flex:0 0 20px!important;margin:0!important;border:1.5px solid #9aa6b5;background:#fff;display:grid;place-content:center}
      #applyForm .option input[type="radio"]{border-radius:50%}
      #applyForm .option input[type="checkbox"]{border-radius:6px}
      #applyForm .option input:checked{border-color:#b48c39;background:#d8b46a}
      #applyForm .option input[type="radio"]:checked:after{content:"";width:8px;height:8px;border-radius:50%;background:#07182f}
      #applyForm .option input[type="checkbox"]:checked:after{content:"✓";font-size:13px;line-height:1;color:#07182f;font-weight:950}
      #applyForm .form-actions{padding-top:8px}
      #applyForm .form-actions .btn{min-height:50px;padding-left:26px;padding-right:26px}
      #applyForm .btn-primary{background:linear-gradient(135deg,#cda656,#e4c77f);box-shadow:0 10px 24px rgba(205,166,86,.22)}
      @media(max-width:640px){
        .application-step-nav{gap:5px;margin-top:24px}
        .application-step-nav span{min-height:38px;padding:7px 5px;font-size:.75rem}
        .application-step-nav span b{display:none}
        #applyForm .form-step{border-radius:20px;padding:20px 16px}
        #applyForm .form-step h2{font-size:1.7rem}
        #applyForm .step-intro{font-size:.9rem;margin-bottom:20px}
        #applyForm .options{grid-template-columns:1fr;gap:8px}
        #applyForm .option{min-height:50px;padding:11px 12px;font-size:.94rem}
        #applyForm .field input,#applyForm .field select,#applyForm .field textarea{min-height:50px;background:#fff}
        #applyForm .form-actions{gap:9px}
      }
    `;
    document.head.appendChild(premium);
  }

  let step=0;
  const steps=[...form.querySelectorAll('.form-step')];
  const bar=document.querySelector('.progress-bar');
  const label=document.querySelector('#progressLabel');
  const stepNavItems=[...document.querySelectorAll('.application-step-nav span')];

  function show(){
    steps.forEach((s,i)=>s.classList.toggle('active',i===step));
    stepNavItems.forEach((item,i)=>item.classList.toggle('active',i===step));
    if(bar) bar.style.width=((step+1)/steps.length*100)+'%';
    if(label) label.textContent=`Schritt ${step+1} von ${steps.length}`;
    const target=document.querySelector('.application-step-nav') || form;
    const y=target.getBoundingClientRect().top+window.scrollY-18;
    window.scrollTo({top:y,behavior:'smooth'});
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
      const stepNav=document.querySelector('.application-step-nav');
      [progressHead,progress,intro,photo,stepNav].forEach(el=>{if(el){el.hidden=true;el.style.display='none';}});
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

// Globaler mobiler Header: LAVU/Würzburg links, Marken-Q exakt mittig, Menü rechts.
if(window.matchMedia('(max-width: 520px)').matches){
  const mobileHeader=document.querySelector('.site-header');
  const mobileWrap=mobileHeader?.querySelector('.nav-wrap');
  const mobileBrand=mobileHeader?.querySelector('.brand');
  const mobileToggle=mobileHeader?.querySelector('.nav-toggle');

  if(mobileHeader && mobileWrap && mobileBrand && mobileToggle){
    mobileBrand.innerHTML=`<span class="mobile-brand-copy"><span class="mobile-brand-name">LAVU</span><span class="mobile-brand-city">Würzburg</span></span>`;

    mobileWrap.querySelector('.mobile-brand-q')?.remove();
    const mobileQ=document.createElement('img');
    mobileQ.className='mobile-brand-q';
    mobileQ.src='lavuq-q-square.png?v=mobile-centered-q-global-20260828';
    mobileQ.alt='LAVUQ Q Logo';
    mobileWrap.appendChild(mobileQ);

    document.querySelector('#lavuq-mobile-header-fix')?.remove();
    const mobileHeaderStyle=document.createElement('style');
    mobileHeaderStyle.id='lavuq-mobile-header-fix';
    mobileHeaderStyle.textContent=`
      @media (max-width:520px){
        .site-header{
          background:#041529!important;
          border-bottom:1px solid rgba(216,180,106,.9)!important;
          backdrop-filter:none!important;
        }
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
          margin-top:20px!important;
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
        .site-header .nav{
          top:156px!important;
          background:#041529!important;
          border:1px solid rgba(216,180,106,.42)!important;
          box-shadow:0 22px 55px rgba(0,0,0,.34)!important;
          color:#fff!important;
        }
        .site-header .nav a{
          color:#fff!important;
          border-bottom:1px solid rgba(216,180,106,.22)!important;
        }
        .site-header .nav a:hover,
        .site-header .nav a:focus{
          color:#d8b46a!important;
          background:rgba(216,180,106,.07)!important;
        }
        .site-header .nav .btn-primary{
          background:#d8b46a!important;
          color:#07182f!important;
          border-color:#d8b46a!important;
        }
      }
    `;
    document.head.appendChild(mobileHeaderStyle);
  }
}

// Startseite mobil: Hero kompakter und Sicherheitsbox etwas weiter unten.
if(window.matchMedia('(max-width: 520px)').matches && (location.pathname==='/' || location.pathname.endsWith('/index.html'))){
  const heroCompactStyle=document.createElement('style');
  heroCompactStyle.id='lavuq-hero-compact-20260828';
  heroCompactStyle.textContent=`
    @media(max-width:520px){
      .hero:has(.mobile-hero-photo){padding-top:42px!important}
      .hero:has(.mobile-hero-photo) .eyebrow{margin-bottom:18px!important}
      .hero:has(.mobile-hero-photo) h1{margin-bottom:16px!important}
      .hero:has(.mobile-hero-photo) h1:before,
      .hero:has(.mobile-hero-photo) h1:after{font-size:clamp(3.05rem,13.4vw,4.2rem)!important}
      .hero:has(.mobile-hero-photo) .companion-note{transform:translateY(18px)!important}
      .hero:has(.mobile-hero-photo) .mobile-hero-photo img{height:440px!important}
    }
  `;
  document.head.appendChild(heroCompactStyle);
}

// Startseite: "Mehr über Sicherheit" als weißer Sekundär-Button.
if(location.pathname==='/' || location.pathname.endsWith('/index.html')){
  const safetyButton=document.querySelector('#so-gehts a[href="sicherheit.html"]');
  if(safetyButton){
    safetyButton.style.setProperty('background','#ffffff','important');
    safetyButton.style.setProperty('color','#07182f','important');
    safetyButton.style.setProperty('border-color','#ffffff','important');
  }
}

// Startseite mobil: Goldene 4-Personen-Silhouette in der Box "ECHTE MENSCHEN".
if(window.matchMedia('(max-width: 520px)').matches && (location.pathname==='/' || location.pathname.endsWith('/index.html'))){
  const peopleLabel=document.querySelector('.mobile-photo-label');
  if(peopleLabel){
    const peopleIcon='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 42"%3E%3Cg fill="%23d8b46a"%3E%3Ccircle cx="7" cy="9" r="4"/%3E%3Crect x="3" y="15" width="8" height="18" rx="4"/%3E%3Ccircle cx="19" cy="7" r="4"/%3E%3Crect x="15" y="13" width="8" height="21" rx="4"/%3E%3Ccircle cx="33" cy="7" r="4"/%3E%3Crect x="29" y="13" width="8" height="21" rx="4"/%3E%3Ccircle cx="45" cy="9" r="4"/%3E%3Crect x="41" y="15" width="8" height="18" rx="4"/%3E%3C/g%3E%3C/svg%3E';
    peopleLabel.style.setProperty('background-image',`url("${peopleIcon}"), radial-gradient(circle at 38px 50%,rgba(216,180,106,.18) 0 22px,transparent 23px)`,'important');
    peopleLabel.style.setProperty('background-position','12px 50%, 0 0','important');
    peopleLabel.style.setProperty('background-size','52px 31px, auto','important');
    peopleLabel.style.setProperty('background-repeat','no-repeat, no-repeat','important');
  }
}

// Startseite: Terminversuche-Karte sprachlich präzisieren.
if(location.pathname==='/' || location.pathname.endsWith('/index.html')){
  document.querySelectorAll('.compact-card').forEach(card=>{
    const heading=card.querySelector('h3');
    if(heading?.textContent.trim()==='Maximal 5 Terminversuche'){
      heading.textContent='Maximal 5 Versuche pro Treffen';
      const text=card.querySelector('p');
      if(text) text.textContent='Kommt nach fünf verbindlichen Versuchen kein Treffen zustande, wird die Runde beendet.';
    }
  });
}
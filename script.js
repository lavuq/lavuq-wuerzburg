// LAVUQ public runtime loader.
(function(){
  const lightCtaStyle=document.createElement('style');
  lightCtaStyle.id='final-cta-light-override';
  lightCtaStyle.textContent=`
    .final-cta-v2,
    .final-cta-v2__scene{background:#fff!important;}
    .final-cta-v2__photo:after{background:linear-gradient(180deg,rgba(255,255,255,0) 58%,#fff 100%)!important;}
  `;
  document.head.appendChild(lightCtaStyle);

  // Capture the exact image already inserted by home-preference-visual.js before legacy runtime rewrites the section.
  const preferredMenIconSrc=document.querySelector('.preference-card--men .preference-card__icon img')?.src || '';

  const lockMeinQPhone=()=>{
    const phone=document.querySelector('.home-meinq-premium .home-meinq-phone');
    if(!phone || window.innerWidth>820) return;
    const narrow=window.innerWidth<=520;
    phone.style.setProperty('width', narrow ? 'min(80vw, 320px)' : 'min(82vw, 330px)', 'important');
    phone.style.setProperty('max-width', narrow ? '80vw' : '82vw', 'important');
    phone.style.setProperty('transform','rotate(2deg)','important');
    phone.style.setProperty('transform-origin','center center','important');
    phone.style.setProperty('margin', narrow ? '14px auto 30px' : '16px auto 34px','important');
    phone.style.setProperty('left','auto','important');
    phone.style.setProperty('right','auto','important');
    phone.style.setProperty('justify-self','center','important');
  };

  const ensureMobileHeroPhoto=()=>{
    const hero=document.querySelector('.hero-startup');
    if(!hero) return;
    let photo=hero.querySelector(':scope > .hero-mobile-group-photo') || hero.querySelector('.hero-mobile-group-photo');
    if(!photo){
      photo=document.createElement('div');
      photo.className='hero-mobile-group-photo';
      photo.setAttribute('role','img');
      photo.setAttribute('aria-label','Vier Menschen mit Blick auf Würzburg in warmem Abendlicht');
    }
    if(hero.firstElementChild!==photo) hero.insertBefore(photo,hero.firstElementChild);
  };

  const enforceHeroReference=()=>{
    const startupStyle=document.querySelector('link[rel="stylesheet"][href*="homepage-startup-v5.css"]');
    if(startupStyle && !startupStyle.href.includes('hero-reference-final-3')){
      startupStyle.href='homepage-startup-v5.css?v=20260910-hero-reference-final-3';
    }
    ensureMobileHeroPhoto();
    let style=document.getElementById('hero-reference-final-lock');
    if(!style){
      style=document.createElement('style');
      style.id='hero-reference-final-lock';
      style.textContent=`
      @media(max-width:980px){
        .topbar{display:none!important}
        .hero-startup{padding:0!important;margin:0!important;background:#fff!important;background-image:none!important;border:0!important;overflow:hidden!important}
        .hero-startup::before,.hero-startup::after,.hero-startup__inner::before,.hero-startup__inner::after,.hero-startup__content::before,.hero-startup__content::after{display:none!important;content:none!important;background:none!important}
        .hero-startup__inner{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;min-height:0!important;background:#fff!important}
        .hero-startup__content{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0 0 34px!important;background:#fff!important;background-image:none!important}
        .hero-startup>.hero-mobile-group-photo{display:block!important;position:relative!important;width:100vw!important;max-width:none!important;height:clamp(360px,61vw,470px)!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:hidden!important;background:linear-gradient(to bottom,rgba(255,255,255,0) 66%,rgba(255,255,255,.48) 83%,#fff 100%),url('group-companions.jpg') center 37%/cover no-repeat!important}
        .hero-startup>.hero-mobile-group-photo::before{display:none!important;content:none!important}
        .hero-startup>.hero-mobile-group-photo::after{content:'Würzburg\\A gemeinsam\\A erleben.'!important;white-space:pre!important;position:absolute!important;right:6%!important;top:9%!important;color:#09233f!important;font-family:'Brush Script MT','Segoe Script',cursive!important;font-size:clamp(1.7rem,4.8vw,2.25rem)!important;font-weight:500!important;line-height:.94!important;text-align:right!important;transform:rotate(-5deg)!important;text-shadow:0 2px 8px rgba(255,255,255,.72)!important}
        .hero-startup__eyebrow,.hero-startup__title,.hero-startup__text,.hero-startup__actions{width:min(calc(100% - 68px),760px)!important;margin-left:auto!important;margin-right:auto!important}
        .hero-startup__eyebrow{position:relative!important;z-index:2!important;margin-top:0!important;margin-bottom:16px!important;font-size:0!important;line-height:1.45!important;letter-spacing:0!important;color:#0a2949!important}
        .hero-startup__eyebrow::after{content:'FREUNDE FINDEN. AKTIV SEIN. WÜRZBURG ERLEBEN.'!important;font-size:.75rem!important;font-weight:900!important;letter-spacing:.17em!important;line-height:1.45!important}
        .hero-startup__title{position:relative!important;z-index:2!important;margin-top:0!important;margin-bottom:22px!important;line-height:.89!important;letter-spacing:-.045em!important}
        .hero-startup__title-main,.hero-startup__title-accent{font-size:0!important;line-height:inherit!important}
        .hero-startup__title-main::after{content:'Gemeinsam'!important;font-size:clamp(3.55rem,11.6vw,5.8rem)!important;font-family:Georgia,'Times New Roman',serif!important;font-weight:500!important;color:#09233f!important}
        .hero-startup__title-accent::after{content:'statt allein.'!important;font-size:clamp(3.4rem,11.1vw,5.5rem)!important;font-family:Georgia,'Times New Roman',serif!important;font-weight:500!important;color:#c09032!important}
        .hero-startup__text{font-size:0!important;line-height:1.55!important;margin-top:0!important;margin-bottom:0!important;color:#193a5d!important}
        .hero-startup__text::after{content:'LAVUQ verbindet Menschen aus Würzburg und Umgebung in kleinen Gruppen für echte Aktivitäten und echte Begegnungen. Kein Dating. Einfach gemeinsam mehr erleben.'!important;font-size:1.06rem!important;line-height:1.55!important;font-weight:600!important}
        .hero-startup__actions{display:block!important;margin-top:26px!important}
        .hero-btn--primary{display:flex!important;width:100%!important;min-height:62px!important;padding:0 22px!important;font-size:0!important;border-radius:999px!important;background:linear-gradient(135deg,#d8b565 0%,#b8862f 100%)!important;color:#fff!important;box-shadow:0 12px 26px rgba(158,113,31,.18)!important}
        .hero-btn--primary::after{content:'Kostenlos bewerben  →'!important;font-size:1.08rem!important;font-weight:850!important}
        .hero-btn--link,.hero-startup__safety,.hero-startup__preview{display:none!important}
      }
      @media(max-width:640px){
        .hero-startup>.hero-mobile-group-photo{height:58vw!important;min-height:300px!important;max-height:390px!important;background-position:center 35%!important}
        .hero-startup__eyebrow,.hero-startup__title,.hero-startup__text,.hero-startup__actions{width:calc(100% - 40px)!important}
        .hero-startup__eyebrow::after{font-size:.66rem!important;letter-spacing:.145em!important}
        .hero-startup__title-main::after{font-size:clamp(3.1rem,14vw,4.25rem)!important}
        .hero-startup__title-accent::after{font-size:clamp(3rem,13.5vw,4.1rem)!important}
        .hero-startup__text::after{font-size:1rem!important;line-height:1.52!important}
        .hero-btn--primary{min-height:58px!important}
        .hero-btn--primary::after{font-size:1rem!important}
      }`;
      document.head.appendChild(style);
    }
  };

  const enforcePreferenceMenIcon=()=>{
    const icon=document.querySelector('.preference-card--men .preference-card__icon');
    if(!icon || !preferredMenIconSrc) return;
    const img=icon.querySelector('img');
    if(!img || img.src!==preferredMenIconSrc){
      icon.innerHTML=`<img src="${preferredMenIconSrc}" alt="" aria-hidden="true">`;
    }
    const current=icon.querySelector('img');
    if(current){
      current.style.setProperty('width','34px','important');
      current.style.setProperty('height','34px','important');
      current.style.setProperty('object-fit','contain','important');
      current.style.setProperty('display','block','important');
    }
    icon.style.setProperty('color','transparent','important');
  };

  enforceHeroReference();
  enforcePreferenceMenIcon();
  window.addEventListener('load',()=>{lockMeinQPhone();enforceHeroReference();enforcePreferenceMenIcon();});
  window.addEventListener('resize',()=>{lockMeinQPhone();enforceHeroReference();enforcePreferenceMenIcon();},{passive:true});

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@62295bf5f1a33e7933693ce477cf403fa24ac2b8/script.js';
  core.defer=true;
  core.onload=()=>{
    // Legacy runtime rewrites the hero and preference sections; restore the current versions afterwards.
    enforceHeroReference();
    enforcePreferenceMenIcon();
    setTimeout(enforceHeroReference,50);
    setTimeout(enforceHeroReference,300);
    setTimeout(enforcePreferenceMenIcon,50);
    setTimeout(enforcePreferenceMenIcon,300);
    setTimeout(enforcePreferenceMenIcon,900);
    const footer=document.createElement('script');
    footer.src='footer-v3-global.js?v=20260910-footer-v3-2';
    footer.defer=true;
    document.head.appendChild(footer);
  };
  core.onerror=()=>{enforceHeroReference();enforcePreferenceMenIcon();};
  document.head.appendChild(core);

  const prefObserver=new MutationObserver(()=>enforcePreferenceMenIcon());
  prefObserver.observe(document.documentElement,{subtree:true,childList:true});
})();

// Exact uploaded gold female icon for the "Nur Frauen" card.
(function(){
  const womenIcon='data:image/png;base64,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';
  const apply=()=>{
    const icon=document.querySelector('.preference-card--women .preference-card__icon');
    if(!icon) return;
    const img=icon.querySelector('img');
    if(!img || img.src!==womenIcon){
      icon.innerHTML=`<img src="${womenIcon}" alt="" aria-hidden="true">`;
    }
    const current=icon.querySelector('img');
    if(current){
      current.style.setProperty('width','34px','important');
      current.style.setProperty('height','34px','important');
      current.style.setProperty('object-fit','contain','important');
      current.style.setProperty('display','block','important');
    }
    icon.style.setProperty('color','transparent','important');
  };
  apply();
  window.addEventListener('load',apply);
  setTimeout(apply,50);
  setTimeout(apply,300);
  setTimeout(apply,900);
  new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
})();
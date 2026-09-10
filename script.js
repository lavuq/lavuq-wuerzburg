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

  enforceHeroReference();
  window.addEventListener('load',()=>{lockMeinQPhone();enforceHeroReference();});
  window.addEventListener('resize',()=>{lockMeinQPhone();enforceHeroReference();},{passive:true});

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@62295bf5f1a33e7933693ce477cf403fa24ac2b8/script.js';
  core.defer=true;
  core.onload=()=>{
    // Legacy runtime rewrites the hero stylesheet; restore the current reference layout afterwards.
    enforceHeroReference();
    setTimeout(enforceHeroReference,50);
    setTimeout(enforceHeroReference,300);
    const footer=document.createElement('script');
    footer.src='footer-v3-global.js?v=20260910-footer-v3-2';
    footer.defer=true;
    document.head.appendChild(footer);
  };
  core.onerror=enforceHeroReference;
  document.head.appendChild(core);
})();
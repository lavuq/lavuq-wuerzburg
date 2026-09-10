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

  const meinQScaleStyle=document.createElement('style');
  meinQScaleStyle.id='home-meinq-global-scale-fix';
  meinQScaleStyle.textContent=`
    @media(max-width:820px){
      .home-meinq-premium{overflow:visible!important;}
      .home-meinq-premium__wrap{overflow:visible!important;}
      .home-meinq-premium .home-meinq-phone{
        width:min(82vw,330px)!important;
        max-width:82vw!important;
        transform:rotate(2deg)!important;
        transform-origin:center center!important;
        margin:16px auto 34px!important;
        left:auto!important;
        right:auto!important;
        justify-self:center!important;
      }
      .hero-startup__preview{display:none!important;}
      .hero-mobile-group-photo{display:block!important;position:relative;width:100%;min-height:310px;margin:28px 0 24px;border-radius:24px;overflow:hidden;background:url('group-companions.jpg') center 40%/cover no-repeat;box-shadow:0 16px 34px rgba(9,35,63,.10)}
      .hero-mobile-group-photo::after{content:'Würzburg\A verbindet uns.';white-space:pre;position:absolute;right:6%;bottom:8%;color:#f0cb73;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2rem;line-height:.9;text-align:right;text-shadow:0 2px 10px rgba(0,0,0,.3);transform:rotate(-2deg)}
    }
    @media(max-width:520px){
      .home-meinq-premium .home-meinq-phone{
        width:min(80vw,320px)!important;
        max-width:80vw!important;
        transform:rotate(2deg)!important;
        margin:14px auto 30px!important;
      }
      .hero-mobile-group-photo{min-height:300px;margin:24px 0 22px}
    }
    @media(min-width:821px){.hero-mobile-group-photo{display:none!important;}}
  `;
  document.head.appendChild(meinQScaleStyle);

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
    const section=phone.closest('.home-meinq-premium');
    if(section) section.style.setProperty('overflow','visible','important');
  };

  // Mobile hero order, made independent of the legacy preview layout:
  // text -> buttons -> image -> trust facts.
  const ensureMobileHeroPhoto=()=>{
    const hero=document.querySelector('.hero-startup');
    const content=hero?.querySelector('.hero-startup__content');
    const actions=hero?.querySelector('.hero-startup__actions');
    if(!hero || !content || !actions) return;
    let photo=content.querySelector('.hero-mobile-group-photo');
    if(!photo){
      photo=document.createElement('div');
      photo.className='hero-mobile-group-photo';
      photo.setAttribute('role','img');
      photo.setAttribute('aria-label','Freundliche Gruppe bei einem Treffen in Würzburg');
    }
    if(actions.nextElementSibling!==photo){
      actions.insertAdjacentElement('afterend',photo);
    }
  };

  const observer=new MutationObserver(()=>{
    lockMeinQPhone();
    ensureMobileHeroPhoto();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',()=>{
    lockMeinQPhone();
    ensureMobileHeroPhoto();
  },{passive:true});
  window.addEventListener('load',()=>{
    lockMeinQPhone();
    ensureMobileHeroPhoto();
  });

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@62295bf5f1a33e7933693ce477cf403fa24ac2b8/script.js';
  core.defer=true;
  core.onload=()=>{
    lockMeinQPhone();
    ensureMobileHeroPhoto();
    const footer=document.createElement('script');
    footer.src='footer-v3-global.js?v=20260910-footer-v3-2';
    footer.defer=true;
    document.head.appendChild(footer);
  };
  core.onerror=()=>{
    const footer=document.createElement('script');
    footer.src='footer-v3-global.js?v=20260910-footer-v3-2';
    document.head.appendChild(footer);
  };
  document.head.appendChild(core);
})();

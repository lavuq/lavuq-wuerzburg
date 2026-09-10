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
    .hero-startup__preview::before{background:linear-gradient(90deg,rgba(255,255,255,.2),rgba(255,255,255,0) 18%),url('hero-variant3.jpg?v=20260910-v5') center 48%/cover no-repeat!important;}
    .hero-startup__preview::after{display:none!important;content:none!important;}
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
    }
    @media(max-width:520px){
      .home-meinq-premium .home-meinq-phone{
        width:min(80vw,320px)!important;
        max-width:80vw!important;
        transform:rotate(2deg)!important;
        margin:14px auto 30px!important;
      }
    }
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

  // Mobile hero image sits directly below the header and spans the viewport.
  const ensureMobileHeroPhoto=()=>{
    const hero=document.querySelector('.hero-startup');
    if(!hero) return;
    let photo=hero.querySelector(':scope > .hero-mobile-group-photo');
    if(!photo) photo=hero.querySelector('.hero-mobile-group-photo');
    if(!photo){
      photo=document.createElement('div');
      photo.className='hero-mobile-group-photo';
      photo.setAttribute('role','img');
      photo.setAttribute('aria-label','Vier Menschen mit Blick auf Würzburg in warmem Abendlicht');
    }
    if(hero.firstElementChild!==photo) hero.insertBefore(photo,hero.firstElementChild);

    // Remove legacy inline/card overrides so homepage-startup-v5.css controls the reference layout.
    ['width','max-width','min-height','height','aspect-ratio','margin','border-radius','box-shadow','overflow','background-image','background-position','background-size','background-repeat'].forEach(prop=>photo.style.removeProperty(prop));
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
  ensureMobileHeroPhoto();

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
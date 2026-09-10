// LAVUQ public runtime loader.
(function(){
  // Force the final CTA surround to the new light website style, even if an older
  // cached version of the CTA component is still loaded by the runtime bundle.
  const lightCtaStyle=document.createElement('style');
  lightCtaStyle.id='final-cta-light-override';
  lightCtaStyle.textContent=`
    .final-cta-v2,
    .final-cta-v2__scene{background:#fff!important;}
    .final-cta-v2__photo:after{background:linear-gradient(180deg,rgba(255,255,255,0) 58%,#fff 100%)!important;}
  `;
  document.head.appendChild(lightCtaStyle);

  // Approved mobile framing: the complete Mein-Q device must remain visible on
  // every side, with the same centered, lightly tilted presentation as the mockup.
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

  // Re-apply the approved geometry after the Mein-Q component is injected by
  // the legacy runtime. Inline important values prevent later component CSS from
  // pushing the device outside the viewport again.
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

  const observer=new MutationObserver(()=>lockMeinQPhone());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',lockMeinQPhone,{passive:true});
  window.addEventListener('load',lockMeinQPhone);

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@62295bf5f1a33e7933693ce477cf403fa24ac2b8/script.js';
  core.defer=true;
  core.onload=()=>{
    lockMeinQPhone();
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

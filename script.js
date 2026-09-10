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

  // Mobile framing for the complete Mein-Q phone mockup. Keep every outer
  // corner visible while preserving the slight premium tilt from the visual.
  const meinQScaleStyle=document.createElement('style');
  meinQScaleStyle.id='home-meinq-global-scale-fix';
  meinQScaleStyle.textContent=`
    @media(max-width:820px){
      .home-meinq-premium .home-meinq-phone{
        width:min(90vw,396px)!important;
        transform:rotate(2deg) scale(.80)!important;
        transform-origin:top center!important;
        margin:0 auto -92px!important;
      }
    }
    @media(max-width:520px){
      .home-meinq-premium .home-meinq-phone{
        width:min(92vw,360px)!important;
        transform:rotate(2deg) scale(.80)!important;
        transform-origin:top center!important;
        margin:0 auto -104px!important;
      }
    }
  `;
  document.head.appendChild(meinQScaleStyle);

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/lavuq/lavuq-wuerzburg@62295bf5f1a33e7933693ce477cf403fa24ac2b8/script.js';
  core.defer=true;
  core.onload=()=>{
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

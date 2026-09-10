(function(){
  function renderFooter(){
    const footer=document.querySelector('footer');
    if(!footer || footer.dataset.lavuqFooterV3==='1') return;
    footer.dataset.lavuqFooterV3='1';
    footer.className='lavuq-footer-v3';
    footer.innerHTML=`
      <div class="lavuq-footer-v3__inner">
        <div class="lavuq-footer-v3__brandrow">
          <div class="lavuq-footer-v3__brand">
            <img src="lavuq-q-square.png?v=correct-logo" alt="LAVUQ Würzburg Logo">
            <div><strong>LAVUQ</strong><span>WÜRZBURG</span></div>
          </div>
          <div class="lavuq-footer-v3__script">Würzburg verbindet. ♡</div>
        </div>
        <p class="lavuq-footer-v3__lead">Wir bringen Menschen in Würzburg zusammen – für gemeinsame Erlebnisse, neue Perspektiven und echte Begegnungen.</p>
        <div class="lavuq-footer-v3__columns">
          <div><h3>LAVUQ</h3><a href="fuer-wen-ist-lavuq.html">Über uns</a><a href="index.html#so-gehts">So funktioniert’s</a><a href="mein-q.html">Mein Q</a><a href="sicherheit.html">Sicherheit</a><a href="kein-dating.html">Freundschaft im Fokus</a></div>
          <div><h3>SUPPORT</h3><a href="faq.html">FAQ</a><a href="sicherheitsmeldung.html">Kontakt</a><a href="unsere-regeln.html">Unsere Regeln</a><a href="warum-wir-in-wuerzburg-starten.html">Warum Würzburg?</a></div>
        </div>
        <a class="lavuq-footer-v3__cta" href="bewerben.html">Jetzt kostenlos bewerben <span>→</span></a>
        <div class="lavuq-footer-v3__subline">KOSTENLOS. UNVERBINDLICH. EIN TEIL VON ETWAS GRÖSSEREM.</div>
        <div class="lavuq-footer-v3__skyline" aria-hidden="true">⌁ Würzburg ⌁</div>
        <div class="lavuq-footer-v3__bottom"><div><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></div><span>© 2026 LAVUQ Würzburg</span></div>
      </div>`;

    if(document.getElementById('lavuq-footer-v3-style')) return;
    const style=document.createElement('style');
    style.id='lavuq-footer-v3-style';
    style.textContent=`
      footer.lavuq-footer-v3{position:relative!important;overflow:hidden!important;background:linear-gradient(180deg,#fffdfa 0%,#f9f4e9 100%)!important;color:#0a1d3b!important;padding:48px 0 26px!important;border-top:1px solid rgba(183,138,54,.18)!important}
      .lavuq-footer-v3__inner{width:min(calc(100% - 36px),1000px);margin:0 auto;padding:34px 34px 24px;border:1px solid rgba(183,138,54,.18);border-radius:28px;background:rgba(255,255,255,.84);box-shadow:0 18px 50px rgba(6,26,48,.055)}
      .lavuq-footer-v3__brandrow{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
      .lavuq-footer-v3__brand{display:flex;align-items:center;gap:14px}.lavuq-footer-v3__brand img{width:72px;height:72px;object-fit:contain}.lavuq-footer-v3__brand div{display:flex;flex-direction:column}.lavuq-footer-v3__brand strong{font:500 2.2rem Georgia,'Times New Roman',serif;letter-spacing:.08em;color:#0a1d3b}.lavuq-footer-v3__brand span{color:#b18432;font-size:.72rem;font-weight:850;letter-spacing:.22em}
      .lavuq-footer-v3__script{color:#b18432;font-family:'Segoe Script','Bradley Hand',cursive;font-size:2rem;line-height:1.05;transform:rotate(-3deg);padding-top:12px}
      .lavuq-footer-v3__lead{max-width:620px;margin:24px 0 28px!important;color:#667085!important;font-family:Georgia,'Times New Roman',serif;font-size:1.15rem!important;line-height:1.55!important}
      .lavuq-footer-v3__columns{display:grid;grid-template-columns:1fr 1fr;gap:34px;margin-bottom:26px}.lavuq-footer-v3__columns h3{margin:0 0 12px!important;color:#0a1d3b!important;font-size:.72rem!important;letter-spacing:.22em!important}.lavuq-footer-v3__columns a{display:block!important;width:max-content!important;max-width:100%;margin:0 0 9px!important;color:#0a1d3b!important;text-decoration:none!important;font-size:.98rem!important;font-weight:560!important}
      .lavuq-footer-v3__cta{display:flex!important;align-items:center!important;justify-content:center!important;gap:18px!important;min-height:66px!important;border-radius:999px!important;background:linear-gradient(135deg,#d9b15a 0%,#b78020 100%)!important;color:white!important;text-decoration:none!important;font-weight:780!important;font-size:1.08rem!important;box-shadow:0 14px 28px rgba(183,128,32,.18)!important}.lavuq-footer-v3__cta span{font-size:1.35rem}
      .lavuq-footer-v3__subline{text-align:center;margin-top:12px;color:#697386;font-size:.58rem;font-weight:800;letter-spacing:.18em}.lavuq-footer-v3__skyline{text-align:center;margin:30px 0 22px;color:#b18432;font-family:Georgia,'Times New Roman',serif;font-size:1.2rem;letter-spacing:.2em;border-bottom:1px solid rgba(183,138,54,.25);padding-bottom:22px}
      .lavuq-footer-v3__bottom{display:flex;align-items:center;justify-content:space-between;gap:18px;color:#737b89;font-size:.78rem}.lavuq-footer-v3__bottom div{display:flex;gap:18px}.lavuq-footer-v3__bottom a{color:#737b89!important;text-decoration:none!important}
      @media(max-width:620px){footer.lavuq-footer-v3{padding:34px 0 20px!important}.lavuq-footer-v3__inner{width:min(calc(100% - 24px),1000px);padding:26px 20px 20px;border-radius:24px}.lavuq-footer-v3__brandrow{display:block}.lavuq-footer-v3__brand img{width:60px;height:60px}.lavuq-footer-v3__brand strong{font-size:1.9rem}.lavuq-footer-v3__script{font-size:1.65rem;margin-top:18px}.lavuq-footer-v3__lead{font-size:1rem!important;margin:20px 0 24px!important}.lavuq-footer-v3__columns{gap:20px}.lavuq-footer-v3__columns a{font-size:.9rem!important}.lavuq-footer-v3__cta{min-height:60px!important;font-size:1rem!important}.lavuq-footer-v3__subline{font-size:.5rem;line-height:1.5}.lavuq-footer-v3__bottom{flex-direction:column;align-items:flex-start;font-size:.72rem}.lavuq-footer-v3__skyline{margin-top:24px}}
    `;
    document.head.appendChild(style);
  }
  renderFooter();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',renderFooter,{once:true});
  setTimeout(renderFooter,150);
})();

// Exact uploaded gold mixed-gender icon for the "Gemischte Gruppe" card.
(function(){
  const mixedIcon='data:image/png;base64,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';
  const apply=()=>{
    const icon=document.querySelector('.preference-card--mixed .preference-card__icon');
    if(!icon) return;
    let img=icon.querySelector('img');
    if(!img || img.src!==mixedIcon){
      icon.innerHTML=`<img src="${mixedIcon}" alt="" aria-hidden="true">`;
      img=icon.querySelector('img');
    }
    if(img){
      img.style.setProperty('width','34px','important');
      img.style.setProperty('height','34px','important');
      img.style.setProperty('object-fit','contain','important');
      img.style.setProperty('display','block','important');
    }
    icon.style.setProperty('color','transparent','important');
  };
  apply();
  window.addEventListener('load',apply,{once:true});
  setTimeout(apply,50);setTimeout(apply,300);setTimeout(apply,900);
  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
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
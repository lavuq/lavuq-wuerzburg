(function(){
  const cta=document.querySelector('.final-cta');
  if(!cta) return;

  cta.className='final-cta-v2';
  cta.innerHTML=`
    <div class="final-cta-v2__scene">
      <div class="final-cta-v2__photo" aria-hidden="true"></div>
      <div class="final-cta-v2__hand">Würzburg<br>verbindet. ♡</div>
      <div class="container final-cta-v2__inner">
        <div class="final-cta-v2__card">
          <p class="final-cta-v2__eyebrow">Vielleicht beginnt es hier.</p>
          <h2>Vier Menschen. Eine Stadt.<br>Eine echte Chance auf Freundschaft.</h2>
          <p class="final-cta-v2__lead">Die aktuelle Startphase ist kostenlos und unverbindlich.</p>

          <div class="final-cta-v2__facts" aria-label="Vorteile">
            <div><span class="final-cta-v2__icon">✦</span><strong>Startphase<br>kostenlos</strong></div>
            <div><span class="final-cta-v2__icon">＋1</span><strong>Begleitperson<br>erlaubt</strong></div>
            <div><span class="final-cta-v2__icon">♡</span><strong>Freundschaft<br>im Fokus</strong></div>
          </div>

          <a class="final-cta-v2__primary" href="bewerben.html">Jetzt kostenlos bewerben <span aria-hidden="true">→</span></a>
          <a class="final-cta-v2__secondary" href="#so-gehts">Mehr erfahren</a>
          <div class="final-cta-v2__skyline" aria-hidden="true"></div>
          <div class="final-cta-v2__tagline">Echte Menschen. Eine Stadt. Mehr möglich.</div>
        </div>
      </div>
    </div>`;

  if(document.getElementById('final-cta-v2-style')) return;
  const style=document.createElement('style');
  style.id='final-cta-v2-style';
  style.textContent=`
    .final-cta-v2{position:relative;background:#071b39;padding:0!important;overflow:hidden;color:#0a1d3b}
    .final-cta-v2__scene{position:relative;min-height:900px;background:#071b39;overflow:hidden}
    .final-cta-v2__photo{position:absolute;inset:0 0 38% 0;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(7,27,57,.22)),url('group-companions.jpg') center 44%/cover no-repeat}
    .final-cta-v2__photo:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,27,57,0) 58%,#071b39 100%)}
    .final-cta-v2__hand{position:absolute;z-index:2;left:max(5vw,28px);top:46px;color:#c69538;font-family:'Brush Script MT','Segoe Script',cursive;font-size:clamp(2.2rem,4vw,4rem);line-height:.9;transform:rotate(-5deg);text-shadow:0 2px 12px rgba(255,255,255,.45)}
    .final-cta-v2__inner{position:relative;z-index:3;width:min(calc(100% - 40px),1080px);margin:0 auto;padding-top:360px;padding-bottom:80px}
    .final-cta-v2__card{max-width:880px;margin:0 auto;background:linear-gradient(180deg,#fffdfa,#fbf7ef);border:1px solid rgba(201,160,82,.26);border-radius:34px;padding:50px 58px 38px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,.24)}
    .final-cta-v2__eyebrow{margin:0 0 14px;color:#b18432;font-size:.82rem;font-weight:900;letter-spacing:.24em;text-transform:uppercase}
    .final-cta-v2 h2{margin:0;color:#0a1d3b;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,5.7vw,5.4rem);line-height:.94;font-weight:500;letter-spacing:-.045em}
    .final-cta-v2__lead{margin:22px auto 30px;max-width:640px;color:#667187;font-size:1.08rem;line-height:1.5;font-weight:560}
    .final-cta-v2__facts{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:12px 0 30px}
    .final-cta-v2__facts>div{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:116px;padding:8px 18px;color:#0a1d3b;font-size:.9rem;line-height:1.25}
    .final-cta-v2__facts>div+div{border-left:1px solid rgba(190,145,55,.2)}
    .final-cta-v2__icon{width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:10px;background:linear-gradient(145deg,#fff6dc,#f1dfaa);color:#ad7d28;font-size:1.4rem;font-weight:900;box-shadow:0 8px 18px rgba(174,127,39,.12)}
    .final-cta-v2__primary{display:flex;align-items:center;justify-content:center;gap:18px;width:100%;min-height:72px;border-radius:18px;background:linear-gradient(135deg,#f3ce78 0%,#d99f31 100%);color:#071b39;text-decoration:none;font-size:1.22rem;font-weight:900;box-shadow:0 16px 34px rgba(187,132,32,.24);transition:transform .2s ease,box-shadow .2s ease}
    .final-cta-v2__primary:hover{transform:translateY(-2px);box-shadow:0 20px 40px rgba(187,132,32,.30)}
    .final-cta-v2__secondary{display:inline-block;margin-top:20px;color:#0a1d3b;text-decoration:none;font-weight:850;border-bottom:2px solid #c7953e;padding-bottom:4px}
    .final-cta-v2__skyline{height:74px;margin:28px auto 6px;max-width:620px;opacity:.62;background:url('wuerzburg-real.jpg') center 47%/cover no-repeat;filter:sepia(1) saturate(.7) contrast(.7);mask-image:linear-gradient(180deg,transparent 0,#000 45%,#000 100%);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 45%,#000 100%)}
    .final-cta-v2__tagline{color:#b18432;font-size:.72rem;font-weight:850;letter-spacing:.22em;text-transform:uppercase}
    @media(max-width:760px){
      .final-cta-v2__scene{min-height:820px}.final-cta-v2__photo{inset:0 0 46% 0;background-position:center 42%}.final-cta-v2__hand{left:22px;top:26px;font-size:2rem}
      .final-cta-v2__inner{width:min(calc(100% - 24px),1080px);padding-top:330px;padding-bottom:44px}
      .final-cta-v2__card{padding:32px 18px 26px;border-radius:28px}
      .final-cta-v2__eyebrow{font-size:.68rem;letter-spacing:.18em}.final-cta-v2 h2{font-size:clamp(2.45rem,11vw,4rem);line-height:.96}.final-cta-v2__lead{font-size:.94rem;margin:18px auto 22px}
      .final-cta-v2__facts{margin:4px 0 22px}.final-cta-v2__facts>div{min-height:98px;padding:6px 7px;font-size:.73rem}.final-cta-v2__icon{width:48px;height:48px;font-size:1.15rem}
      .final-cta-v2__primary{min-height:62px;font-size:1.02rem;border-radius:16px;gap:10px}.final-cta-v2__secondary{margin-top:16px;font-size:.92rem}.final-cta-v2__skyline{height:55px;margin-top:22px}.final-cta-v2__tagline{font-size:.59rem;letter-spacing:.14em}
    }
    @media(max-width:420px){
      .final-cta-v2__photo{inset:0 0 49% 0}.final-cta-v2__inner{padding-top:300px}.final-cta-v2__card{padding-left:14px;padding-right:14px}.final-cta-v2 h2{font-size:2.55rem}.final-cta-v2__facts>div{font-size:.68rem}.final-cta-v2__primary{font-size:.98rem}
    }
  `;
  document.head.appendChild(style);
})();

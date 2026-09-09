(function(){
  function renderWhy(){
    const sections=[...document.querySelectorAll('section')];
    const why=sections.find(el=>el.querySelector('.eyebrow')?.textContent?.trim()==='Warum LAVUQ?');
    if(!why || why.classList.contains('why-lavuq-v3')) return;

    why.className='why-lavuq-v3';
    why.innerHTML=`
      <div class="container why-lavuq-v3__wrap">
        <div class="why-lavuq-v3__topbar">
          <div class="why-lavuq-v3__topitem"><span>◎</span><strong>Echte Menschen</strong></div>
          <div class="why-lavuq-v3__divider"></div>
          <div class="why-lavuq-v3__topitem"><span>♡</span><strong>In Würzburg</strong></div>
          <div class="why-lavuq-v3__divider"></div>
          <div class="why-lavuq-v3__topitem"><span>⌁</span><strong>Für mehr Verbundenheit</strong></div>
        </div>

        <div class="why-lavuq-v3__intro">
          <div class="eyebrow">Warum LAVUQ?</div>
          <h2>Gemeinsamkeiten statt Zufall.</h2>
          <p>Du bewirbst dich für eine kleine Freundesgruppe. Wir betrachten deine Angaben im Gesamtbild und stellen eine passende Gruppe zusammen.</p>
          <div class="why-lavuq-v3__note">Mehr Menschen.<br>Mehr erleben. ♡</div>
        </div>

        <div class="why-lavuq-v3__timeline">
          <div class="why-lavuq-v3__line"></div>
          <article class="why-card left"><div class="why-card__icon">◎</div><div class="why-card__content"><h3>Kleine Gruppen</h3><p>Vier Menschen lernen sich gemeinsam kennen.</p></div><div class="why-card__number">1</div></article>
          <article class="why-card right"><div class="why-card__number">2</div><div class="why-card__icon">⌁</div><div class="why-card__content"><h3>Ähnliche Interessen</h3><p>Gemeinsame Interessen schaffen von Anfang an Nähe.</p></div></article>
          <article class="why-card left"><div class="why-card__icon">⌂</div><div class="why-card__content"><h3>Weniger Druck</h3><p>Kein Smalltalk-Marathon – dafür echte Gespräche in entspannter Atmosphäre.</p></div><div class="why-card__number">3</div></article>
          <article class="why-card right"><div class="why-card__number">4</div><div class="why-card__icon">◌</div><div class="why-card__content"><h3>Echter Austausch</h3><p>Du triffst Menschen, die offen, neugierig und auf einer ähnlichen Wellenlänge sind.</p></div></article>
          <article class="why-card left"><div class="why-card__icon">♡</div><div class="why-card__content"><h3>Kein Dating</h3><p>LAVUQ ist keine Dating-Plattform, sondern für echte Freundschaften.</p></div><div class="why-card__number">5</div></article>
          <article class="why-card right"><div class="why-card__number">6</div><div class="why-card__icon">✓</div><div class="why-card__content"><h3>Sicherer Rahmen</h3><p>Verifizierte Teilnehmende, klare Regeln und ein respektvoller Umgang.</p></div></article>
        </div>

        <div class="why-lavuq-v3__footer-note">Freundschaften beginnen hier. ♡</div>
      </div>`;
  }

  function ensureStyle(){
    if(document.getElementById('why-lavuq-v3-style')) return;
    const style=document.createElement('style');
    style.id='why-lavuq-v3-style';
    style.textContent=`
      .why-lavuq-v3{background:linear-gradient(180deg,#fffdf8 0%,#faf6ee 100%);padding:72px 0;position:relative;overflow:hidden;color:#0a1d3b}
      .why-lavuq-v3__wrap{position:relative}
      .why-lavuq-v3__topbar{display:flex;align-items:center;gap:20px;padding:18px 24px;border:1px solid rgba(201,160,82,.22);border-radius:22px;background:rgba(255,255,255,.78);margin-bottom:44px;flex-wrap:wrap}
      .why-lavuq-v3__topitem{display:flex;align-items:center;gap:10px;color:#607087;font-size:1rem;font-weight:700}.why-lavuq-v3__topitem span{color:#b88a33;font-size:1.35rem}.why-lavuq-v3__divider{width:1px;height:30px;background:#e6dcc8}
      .why-lavuq-v3__intro{position:relative;max-width:820px;margin-bottom:42px}.why-lavuq-v3 .eyebrow{color:#b88a33;font-size:.82rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase;margin-bottom:14px}
      .why-lavuq-v3 h2{margin:0 0 18px;color:#09233f;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:clamp(2.8rem,5.5vw,5.4rem);line-height:.95;letter-spacing:-.04em}.why-lavuq-v3__intro p{margin:0;max-width:760px;color:#6a7488;font-size:1.08rem;line-height:1.65;font-weight:560}
      .why-lavuq-v3__note{position:absolute;right:-210px;top:28px;color:#b88a33;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2.3rem;line-height:.95;transform:rotate(-5deg)}
      .why-lavuq-v3__timeline{position:relative;display:grid;gap:26px;margin-top:22px}.why-lavuq-v3__line{position:absolute;left:50%;top:0;bottom:0;width:2px;transform:translateX(-50%);background:linear-gradient(180deg,#d3b06a,#c19642)}
      .why-card{position:relative;width:calc(50% - 30px);background:#fff;border:1px solid rgba(201,160,82,.2);border-radius:24px;padding:28px 24px;box-shadow:0 12px 34px rgba(9,35,63,.06);display:grid;grid-template-columns:72px 1fr;gap:18px;min-height:190px}.why-card.left{justify-self:start}.why-card.right{justify-self:end}
      .why-card__icon{width:64px;height:64px;border-radius:18px;background:#f8efd9;color:#b1842f;display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:900}.why-card__content h3{margin:0 0 8px;color:#09233f;font-size:1.2rem;line-height:1.2;font-weight:850}.why-card__content p{margin:0;color:#6a7488;font-size:.98rem;line-height:1.5;font-weight:540}
      .why-card__number{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:#f2e7c8;color:#9e7427;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;box-shadow:0 8px 18px rgba(177,132,47,.15)}.why-card.left .why-card__number{right:-54px}.why-card.right .why-card__number{left:-54px}
      .why-lavuq-v3__footer-note{margin-top:38px;text-align:center;color:#b88a33;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2.4rem;line-height:1}
      @media(max-width:900px){.why-lavuq-v3__note{position:static;margin-top:20px;transform:rotate(-3deg)}.why-lavuq-v3__line{left:22px;transform:none}.why-card{width:100%;justify-self:stretch!important;grid-template-columns:58px 1fr;min-height:auto;padding:22px 18px}.why-card__icon{width:52px;height:52px;font-size:1.35rem}.why-card__number{left:-2px!important;right:auto!important;top:-10px;transform:none;width:38px;height:38px;font-size:.95rem}.why-lavuq-v3__timeline{padding-left:38px}.why-card__content h3{font-size:1.08rem}.why-card__content p{font-size:.9rem}.why-lavuq-v3__topbar{gap:12px;padding:16px}.why-lavuq-v3__divider{display:none}.why-lavuq-v3__topitem{width:100%}}
      @media(max-width:520px){.why-lavuq-v3{padding:54px 0 60px}.why-lavuq-v3__wrap{width:min(calc(100% - 28px),1200px)!important}.why-lavuq-v3 h2{font-size:clamp(2.8rem,13vw,4.2rem)}.why-lavuq-v3__intro p{font-size:.96rem}.why-lavuq-v3__topbar{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:13px 10px;margin-bottom:30px}.why-lavuq-v3__topitem{width:auto;display:flex;flex-direction:column;text-align:center;gap:4px;font-size:.68rem}.why-lavuq-v3__topitem span{font-size:1.1rem}.why-lavuq-v3__timeline{gap:14px;padding-left:30px}.why-card{grid-template-columns:48px 1fr;gap:12px;padding:18px 14px;border-radius:20px}.why-card__icon{width:44px;height:44px;font-size:1.1rem}.why-card__content h3{font-size:1rem}.why-card__content p{font-size:.82rem;line-height:1.42}.why-card__number{width:32px;height:32px;font-size:.82rem;left:-4px!important}.why-lavuq-v3__footer-note{font-size:1.8rem;margin-top:28px}}
    `;
    document.head.appendChild(style);
  }

  ensureStyle();
  renderWhy();
  setTimeout(renderWhy,150);
  setTimeout(renderWhy,500);
  setTimeout(renderWhy,1200);
  const observer=new MutationObserver(()=>renderWhy());
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
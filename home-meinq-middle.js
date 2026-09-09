(function(){
  const section=[...document.querySelectorAll('section.section-white.compact-section')].find(s=>s.querySelector('h2')?.textContent?.includes('Nach deiner Gruppenzusage'));
  if(!section) return;
  section.classList.add('home-meinq-premium');
  section.innerHTML=`<div class="container home-meinq-premium__wrap">
    <div class="home-meinq-premium__intro">
      <div class="eyebrow">Dein persönlicher Bereich</div>
      <h2>Nach deiner Gruppenzusage beginnt „Mein Q“.</h2>
      <p>Mein Q ist dein geschützter Bereich innerhalb von LAVUQ. Sobald deine Gruppe feststeht und du zugesagt hast, findest du dort alles, was ihr braucht – für eine unvergessliche Zeit in Würzburg.</p>
      <div class="home-meinq-premium__script">Gemeinsam<br>mehr erleben.</div>
    </div>
    <div class="home-meinq-phone" aria-label="Vorschau auf Mein Q">
      <div class="home-meinq-phone__notch"></div>
      <div class="home-meinq-phone__screen">
        <div class="home-meinq-phone__top"><span class="home-meinq-phone__q">Q</span><span>◌ &nbsp; ◉</span></div>
        <div class="home-meinq-phone__title">Mein Q</div>
        <div class="home-meinq-phone__subtitle">EURE GRUPPE. EURE ZEIT.<br>IN WÜRZBURG.</div>
        <div class="home-meinq-phone__city"><img src="wuerzburg-real.jpg" alt="Würzburg"><span>Würzburg erleben</span><small>Gemeinsam. Individuell. Besonders.</small></div>
        <div class="home-meinq-phone__row"><span>●</span><div><strong>Gruppenchat</strong><small>Neue Nachrichten</small></div><b>›</b></div>
        <div class="home-meinq-phone__row"><span>□</span><div><strong>Unsere Termine</strong><small>Gemeinsam planen</small></div><b>›</b></div>
        <div class="home-meinq-phone__row"><span>⌖</span><div><strong>Würzburg-Ideen</strong><small>Vorschläge entdecken</small></div><b>›</b></div>
        <div class="home-meinq-phone__row"><span>◇</span><div><strong>Sicherheitsbereich</strong><small>Alles im Blick</small></div><b>›</b></div>
        <div class="home-meinq-phone__footer">Schön, dass ihr da seid!</div>
      </div>
    </div>
    <div class="home-meinq-premium__features">
      <div class="home-meinq-feature"><span class="home-meinq-feature__icon">●</span><div><strong>Privater Gruppenchat</strong><p>Austauschen, planen, live dabei sein.</p></div></div>
      <div class="home-meinq-feature"><span class="home-meinq-feature__icon">□</span><div><strong>Termine gemeinsam abstimmen</strong><p>Alle Vorschläge an einem Ort.</p></div></div>
      <div class="home-meinq-feature"><span class="home-meinq-feature__icon">⌖</span><div><strong>Würzburg-Ideen für eure Gruppe</strong><p>Cafés, Restaurants, Bars, Museen und Freizeit.</p></div></div>
      <div class="home-meinq-feature"><span class="home-meinq-feature__icon">◇</span><div><strong>Feedback &amp; Sicherheit</strong><p>Vertrauliche Meldungen und ein geschützter Raum.</p></div></div>
    </div>
    <a class="home-meinq-premium__cta" href="mein-q.html">Mehr über Mein Q erfahren <span>→</span></a>
    <div class="home-meinq-premium__skyline">WÜRZBURG VERBINDET</div>
  </div>`;
  const style=document.createElement('style');
  style.textContent=`
    .home-meinq-premium{position:relative;overflow:hidden;background:linear-gradient(180deg,#fffdf8,#fbf7ef)!important;padding:72px 0 54px!important}
    .home-meinq-premium__wrap{position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.95fr);gap:44px 56px;align-items:center}
    .home-meinq-premium__intro h2{max-width:650px;margin-bottom:24px;color:#061a30;font-size:clamp(2.6rem,5vw,4.5rem);line-height:.94}
    .home-meinq-premium__intro>p{max-width:610px;margin:0;color:#6b7487;font-size:1.06rem;line-height:1.58;font-weight:560}
    .home-meinq-premium__script{margin-top:30px;color:#b3812d;font-family:"Segoe Script","Bradley Hand",cursive;font-size:clamp(2.1rem,4.2vw,3.5rem);line-height:.92;transform:rotate(-4deg);width:max-content}
    .home-meinq-phone{justify-self:end;position:relative;width:min(100%,390px);padding:11px;border-radius:48px;background:linear-gradient(145deg,#121212,#353535 45%,#0b0b0b);box-shadow:0 30px 55px rgba(6,26,48,.22);transform:rotate(5deg)}
    .home-meinq-phone__notch{position:absolute;z-index:3;top:11px;left:50%;transform:translateX(-50%);width:126px;height:26px;border-radius:0 0 18px 18px;background:#090909}
    .home-meinq-phone__screen{overflow:hidden;min-height:650px;padding:34px 18px 20px;border-radius:38px;background:linear-gradient(180deg,#fffdf8,#f7f1e6);color:#07182f}
    .home-meinq-phone__top{display:flex;justify-content:space-between;align-items:center;font-size:.74rem}.home-meinq-phone__q{display:grid;place-items:center;width:31px;height:31px;border:1.5px solid #c79b45;border-radius:50%;color:#b48127;font:700 1.2rem Georgia,serif}
    .home-meinq-phone__title{margin-top:22px;text-align:center;font:500 2rem Georgia,serif}.home-meinq-phone__subtitle{text-align:center;color:#7d756c;font-size:.52rem;font-weight:850;letter-spacing:.18em}
    .home-meinq-phone__city{position:relative;overflow:hidden;height:145px;margin:20px 0 14px;border-radius:17px}.home-meinq-phone__city img{width:100%;height:100%;object-fit:cover}.home-meinq-phone__city:after{content:"";position:absolute;inset:30% 0 0;background:linear-gradient(transparent,rgba(4,21,41,.78))}.home-meinq-phone__city span,.home-meinq-phone__city small{position:absolute;z-index:2;left:16px;color:#fff}.home-meinq-phone__city span{bottom:30px;font:500 1.38rem Georgia,serif}.home-meinq-phone__city small{bottom:13px;font-size:.62rem}
    .home-meinq-phone__row{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:10px;margin-top:7px;border-radius:12px;background:rgba(255,255,255,.82);box-shadow:0 5px 14px rgba(6,26,48,.06)}.home-meinq-phone__row>span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f5e8c8;color:#a57522}.home-meinq-phone__row strong{display:block;font-size:.72rem}.home-meinq-phone__row small{display:block;color:#888;font-size:.55rem}.home-meinq-phone__row b{color:#a57522;font-size:1.25rem}.home-meinq-phone__footer{margin-top:20px;text-align:center;color:#b68129;font-family:"Segoe Script",cursive}
    .home-meinq-premium__features{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:14px 16px}.home-meinq-feature{display:grid;grid-template-columns:68px 1fr;gap:16px;align-items:center;min-height:132px;padding:18px 20px;border:1px solid rgba(215,174,91,.23);border-radius:22px;background:rgba(255,255,255,.84);box-shadow:0 12px 28px rgba(6,26,48,.06)}.home-meinq-feature__icon{display:grid;place-items:center;width:62px;height:62px;border-radius:50%;background:#f7edd7;color:#a87723;font-size:1.45rem}.home-meinq-feature strong{display:block;color:#07182f;font-size:1.04rem}.home-meinq-feature p{margin:7px 0 0;color:#697386;font-size:.9rem}
    .home-meinq-premium__cta{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:20px;min-height:78px;padding:18px 26px;border-radius:18px;background:#061a30;color:#fff;font-weight:850;font-size:1.18rem}.home-meinq-premium__cta span{color:#e4bd69;font-size:1.55rem}.home-meinq-premium__skyline{grid-column:1/-1;text-align:center;color:#af8435;font-size:.68rem;font-weight:850;letter-spacing:.42em}
    @media(max-width:820px){.home-meinq-premium{padding:54px 0 44px!important}.home-meinq-premium__wrap{display:block}.home-meinq-premium__intro h2{font-size:clamp(2.6rem,11vw,4rem)}.home-meinq-premium__intro>p{font-size:.98rem}.home-meinq-premium__script{font-size:2.5rem;margin:26px 0 30px}.home-meinq-phone{width:min(82vw,360px);margin:0 auto 36px;transform:rotate(3deg)}.home-meinq-premium__features{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}.home-meinq-feature{grid-template-columns:52px 1fr;min-height:120px;padding:14px}.home-meinq-feature__icon{width:48px;height:48px}.home-meinq-feature strong{font-size:.94rem}.home-meinq-feature p{font-size:.78rem}.home-meinq-premium__cta{min-height:68px;font-size:1rem}.home-meinq-premium__skyline{margin-top:22px;font-size:.58rem;letter-spacing:.3em}}
    @media(max-width:520px){.home-meinq-phone{width:min(88vw,340px)}.home-meinq-feature{grid-template-columns:1fr;align-content:start;gap:9px;min-height:168px}.home-meinq-feature p{font-size:.76rem}}
  `;
  document.head.appendChild(style);
})();
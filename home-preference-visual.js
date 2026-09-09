(function(){
  const section=document.querySelector('.preference-section');
  if(!section) return;

  section.classList.add('preference-visual');
  section.innerHTML=`
    <div class="container preference-visual__wrap">
      <div class="preference-visual__intro">
        <div class="eyebrow">Deine Präferenz</div>
        <h2>Du entscheidest, womit du dich wohlfühlst.</h2>
        <p>Bei der Bewerbung kannst du angeben, welche Gruppenzusammensetzung du bevorzugst.</p>
      </div>

      <div class="preference-visual__grid" aria-label="Mögliche Gruppenzusammensetzungen">
        <article class="preference-card preference-card--men">
          <div class="preference-card__shade"></div>
          <div class="preference-card__icon" aria-hidden="true">♂</div>
          <div class="preference-card__content"><h3>Nur Männer</h3><p>Neue Kontakte auf Augenhöhe.</p></div>
        </article>
        <article class="preference-card preference-card--women">
          <div class="preference-card__shade"></div>
          <div class="preference-card__icon" aria-hidden="true">♀</div>
          <div class="preference-card__content"><h3>Nur Frauen</h3><p>Gemeinsam Neues erleben.</p></div>
        </article>
        <article class="preference-card preference-card--mixed">
          <div class="preference-card__shade"></div>
          <div class="preference-card__icon" aria-hidden="true">●●●</div>
          <div class="preference-card__content"><h3>Gemischte Gruppe</h3><p>Vielfalt bringt spannende Gespräche.</p></div>
        </article>
        <article class="preference-card preference-card--open">
          <div class="preference-card__shade"></div>
          <div class="preference-card__icon" aria-hidden="true">⌖</div>
          <div class="preference-card__content"><h3>Keine Präferenz</h3><p>Wir finden die passende Gruppe für dich.</p></div>
        </article>
      </div>
    </div>`;

  if(document.getElementById('preference-visual-style')) return;
  const style=document.createElement('style');
  style.id='preference-visual-style';
  style.textContent=`
    .preference-visual{position:relative;overflow:hidden;background:linear-gradient(180deg,#fffdf8 0%,#faf6ee 100%)!important;padding:72px 0!important}
    .preference-visual:before{content:"";position:absolute;inset:-160px auto auto 58%;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,rgba(215,174,91,.12),transparent 68%);pointer-events:none}
    .preference-visual__wrap{position:relative}
    .preference-visual__intro{max-width:790px;margin-bottom:34px}
    .preference-visual__intro h2{margin:8px 0 18px;color:#061a30;font-size:clamp(2.6rem,5.4vw,4.8rem);line-height:.96}
    .preference-visual__intro p{max-width:700px;margin:0;color:#6a7488;font-size:1.05rem;line-height:1.6;font-weight:560}
    .preference-visual__grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .preference-card{position:relative;isolation:isolate;overflow:hidden;min-height:320px;border-radius:26px;border:1px solid rgba(215,174,91,.28);box-shadow:0 18px 38px rgba(6,26,48,.11);background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:24px;transition:transform .25s ease,box-shadow .25s ease}
    .preference-card:hover{transform:translateY(-4px);box-shadow:0 24px 46px rgba(6,26,48,.15)}
    .preference-card--men{background-image:url('group-companions.jpg')}
    .preference-card--women{background-image:url('group-companions.jpg');background-position:72% center}
    .preference-card--mixed{background-image:url('group-companions.jpg');background-position:center 42%}
    .preference-card--open{background-image:url('wuerzburg-real.jpg');background-position:center 45%}
    .preference-card__shade{position:absolute;z-index:-1;inset:0;background:linear-gradient(180deg,rgba(5,21,41,.05) 22%,rgba(5,21,41,.38) 58%,rgba(5,21,41,.9) 100%)}
    .preference-card__icon{position:absolute;top:22px;left:22px;display:grid;place-items:center;min-width:58px;height:58px;padding:0 14px;border-radius:50%;background:rgba(6,26,48,.84);border:2px solid #d7ae5b;color:#efd38d;font-size:1.28rem;font-weight:900;box-shadow:0 8px 20px rgba(0,0,0,.18);backdrop-filter:blur(6px)}
    .preference-card__content{color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.34)}
    .preference-card__content h3{margin:0 0 7px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:1.38rem;font-weight:900;letter-spacing:-.02em}
    .preference-card__content p{margin:0;max-width:310px;color:rgba(255,255,255,.94);font-size:.96rem;line-height:1.42;font-weight:560}
    @media(max-width:760px){
      .preference-visual{padding:56px 0!important}
      .preference-visual__intro{margin-bottom:26px}
      .preference-visual__intro h2{font-size:clamp(2.6rem,10vw,4rem)}
      .preference-visual__intro p{font-size:.98rem}
      .preference-visual__grid{grid-template-columns:1fr 1fr;gap:10px}
      .preference-card{min-height:245px;padding:17px;border-radius:20px}
      .preference-card__icon{top:14px;left:14px;min-width:48px;height:48px;padding:0 11px;font-size:1.02rem}
      .preference-card__content h3{font-size:1.08rem}
      .preference-card__content p{font-size:.8rem}
    }
    @media(max-width:480px){
      .preference-visual__grid{grid-template-columns:1fr 1fr;gap:9px}
      .preference-card{min-height:220px;padding:15px}
      .preference-card__content h3{font-size:1rem}
      .preference-card__content p{font-size:.75rem;line-height:1.35}
    }
  `;
  document.head.appendChild(style);
})();

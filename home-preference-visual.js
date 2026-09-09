(function(){
  const section=document.querySelector('.preference-section');
  if(section){
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
  }

  if(!document.getElementById('preference-visual-style')){
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
  }

  const sections=[...document.querySelectorAll('section')];
  const glance=sections.find(el=>el.querySelector('.eyebrow')?.textContent?.trim()==='Auf einen Blick');
  if(!glance) return;

  glance.className='glance-v3';
  glance.innerHTML=`
    <div class="container glance-v3__inner">
      <div class="glance-v3__intro">
        <div class="eyebrow">Auf einen Blick</div>
        <h2>So ist eine LAVUQ-Runde aufgebaut.</h2>
        <p>Klare Abläufe, kleine Gruppen und ein sicherer Rahmen – damit das Kennenlernen entspannt und nachvollziehbar bleibt.</p>
      </div>

      <div class="glance-v3__summary">
        <div class="glance-v3__script">Kurz<br>gesagt:</div>
        <div class="glance-v3__metric"><span class="glance-v3__metric-icon">◉◉◉◉</span><strong>4</strong><small>Teilnehmer</small></div>
        <div class="glance-v3__metric"><span class="glance-v3__metric-icon">♡</span><strong>3–5</strong><small>Treffen</small></div>
        <div class="glance-v3__metric"><span class="glance-v3__metric-icon">🤝</span><strong>Freundschaft</strong><small>im Fokus</small></div>
        <div class="glance-v3__skyline" aria-hidden="true">⌂⌂⌂⌂⌂</div>
      </div>

      <div class="glance-v3__grid">
        <article><div class="glance-v3__icon">◉◉◉◉</div><div><h3>Vier Teilnehmer</h3><p>Die eigentliche LAVUQ-Gruppe besteht aus vier Personen.</p></div></article>
        <article><div class="glance-v3__icon">＋</div><div><h3>Begleitperson erlaubt</h3><p>Auf Wunsch kann eine vertraute Begleitperson zusätzlich mitkommen.</p></div></article>
        <article><div class="glance-v3__icon">⌖</div><div><h3>Erstes Treffen öffentlich</h3><p>Das erste Treffen findet an einem öffentlichen Ort in Würzburg statt.</p></div></article>
        <article><div class="glance-v3__icon">▦</div><div><h3>Mindestens 3 Treffen</h3><p>Eine Runde umfasst mindestens drei gemeinsame Treffen in kleiner Gruppe.</p></div></article>
        <article><div class="glance-v3__icon">◌◌</div><div><h3>Maximal 5 Versuche pro Treffen</h3><p>Für die Terminfindung sind maximal fünf verbindliche Versuche vorgesehen.</p></div></article>
        <article><div class="glance-v3__icon">♡</div><div><h3>Freundschaft im Fokus</h3><p>LAVUQ steht für ehrliche Begegnungen und neue Freundschaften – nicht für Dating.</p></div></article>
      </div>
    </div>`;

  if(!document.getElementById('glance-v3-style')){
    const style=document.createElement('style');
    style.id='glance-v3-style';
    style.textContent=`
      .glance-v3{position:relative;overflow:hidden;background:linear-gradient(180deg,#fffdf9 0%,#fbf8f1 100%);padding:72px 0 82px;color:#0a1d3b}
      .glance-v3:before{content:'';position:absolute;right:-120px;top:120px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(216,181,101,.10),transparent 68%);pointer-events:none}
      .glance-v3__inner{position:relative;z-index:1}
      .glance-v3__intro{max-width:880px;margin:0 auto 36px;text-align:center}
      .glance-v3__intro .eyebrow{color:#b18432;font-weight:900;letter-spacing:.22em;text-transform:uppercase;font-size:.78rem}
      .glance-v3__intro h2{margin:10px 0 16px;color:#0a1d3b;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:clamp(3rem,5.8vw,5.4rem);line-height:.94;letter-spacing:-.045em}
      .glance-v3__intro p{margin:0 auto;max-width:760px;color:#667187;font-size:1.05rem;line-height:1.55}
      .glance-v3__summary{position:relative;display:grid;grid-template-columns:1.1fr repeat(3,1fr);gap:0;align-items:center;margin:0 0 28px;padding:28px 34px;border:1px solid rgba(190,145,55,.22);border-radius:28px;background:linear-gradient(135deg,#fffaf0 0%,#fff 58%,#fff9eb 100%);box-shadow:0 16px 36px rgba(12,28,51,.055);overflow:hidden}
      .glance-v3__script{color:#b18432;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2.25rem;line-height:.9;transform:rotate(-4deg);padding-left:12px}
      .glance-v3__metric{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:110px;border-left:1px solid rgba(190,145,55,.18);text-align:center}
      .glance-v3__metric-icon{color:#b18432;font-size:1.6rem;letter-spacing:-.15em;margin-bottom:7px}
      .glance-v3__metric strong{color:#0a1d3b;font-family:Georgia,'Times New Roman',serif;font-size:1.6rem;line-height:1}.glance-v3__metric small{margin-top:6px;color:#56647a;text-transform:uppercase;letter-spacing:.08em;font-weight:800;font-size:.68rem}
      .glance-v3__skyline{position:absolute;right:18px;bottom:4px;color:rgba(184,138,51,.32);font-size:2rem;letter-spacing:.04em;pointer-events:none}
      .glance-v3__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
      .glance-v3__grid article{display:grid;grid-template-columns:72px minmax(0,1fr);gap:20px;align-items:start;min-height:190px;padding:28px 26px;border:1px solid rgba(190,145,55,.22);border-radius:24px;background:#fff;box-shadow:0 12px 30px rgba(20,31,50,.045)}
      .glance-v3__icon{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#fff6dc,#f2e2b3);color:#a87924;font-size:1.35rem;font-weight:900;letter-spacing:-.12em}
      .glance-v3__grid h3{margin:4px 0 8px;color:#0a1d3b;font-family:Georgia,'Times New Roman',serif;font-size:1.55rem;line-height:1.12;font-weight:600}
      .glance-v3__grid p{margin:0;color:#667187;font-size:.98rem;line-height:1.52}
      @media(max-width:760px){
        .glance-v3{padding:54px 0 60px}.glance-v3__inner{width:min(calc(100% - 28px),1200px)}
        .glance-v3__intro{text-align:left;margin-bottom:24px}.glance-v3__intro h2{font-size:clamp(2.8rem,13vw,4.4rem)}.glance-v3__intro p{font-size:.96rem}
        .glance-v3__summary{grid-template-columns:.9fr repeat(3,1fr);padding:18px 12px;border-radius:22px;margin-bottom:16px}.glance-v3__script{font-size:1.55rem;padding-left:4px}.glance-v3__metric{min-height:90px}.glance-v3__metric-icon{font-size:1.2rem}.glance-v3__metric strong{font-size:1.15rem}.glance-v3__metric small{font-size:.56rem;letter-spacing:.05em}.glance-v3__skyline{display:none}
        .glance-v3__grid{grid-template-columns:1fr 1fr;gap:10px}.glance-v3__grid article{grid-template-columns:1fr;gap:10px;min-height:230px;padding:18px 15px;border-radius:20px}.glance-v3__icon{width:54px;height:54px;font-size:1.15rem}.glance-v3__grid h3{font-size:1.12rem;margin:0 0 6px}.glance-v3__grid p{font-size:.82rem;line-height:1.42}
      }
      @media(max-width:430px){
        .glance-v3__summary{grid-template-columns:.72fr repeat(3,1fr)}.glance-v3__script{font-size:1.35rem}.glance-v3__metric strong{font-size:1.02rem}.glance-v3__grid article{min-height:240px;padding:16px 13px}.glance-v3__grid h3{font-size:1.05rem}.glance-v3__grid p{font-size:.78rem}
      }
    `;
    document.head.appendChild(style);
  }
})();
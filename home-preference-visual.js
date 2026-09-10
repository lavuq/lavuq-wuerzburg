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
            <div class="preference-card__icon" aria-hidden="true"><img src="data:image/png;base64,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" alt=""></div>
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
      .preference-card__icon img{width:30px;height:30px;object-fit:contain;display:block}
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
        .preference-card__icon img{width:26px;height:26px}
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
  if(glance){
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
  }

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
      @media(max-width:760px){.glance-v3{padding:54px 0 60px}.glance-v3__inner{width:min(calc(100% - 28px),1200px)}.glance-v3__intro{text-align:left;margin-bottom:24px}.glance-v3__intro h2{font-size:clamp(2.8rem,13vw,4.4rem)}.glance-v3__intro p{font-size:.96rem}.glance-v3__summary{grid-template-columns:.9fr repeat(3,1fr);padding:18px 12px;border-radius:22px;margin-bottom:16px}.glance-v3__script{font-size:1.55rem;padding-left:4px}.glance-v3__metric{min-height:90px}.glance-v3__metric-icon{font-size:1.2rem}.glance-v3__metric strong{font-size:1.15rem}.glance-v3__metric small{font-size:.56rem;letter-spacing:.05em}.glance-v3__skyline{display:none}.glance-v3__grid{grid-template-columns:1fr 1fr;gap:10px}.glance-v3__grid article{grid-template-columns:1fr;gap:10px;min-height:230px;padding:18px 15px;border-radius:20px}.glance-v3__icon{width:54px;height:54px;font-size:1.15rem}.glance-v3__grid h3{font-size:1.12rem;margin:0 0 6px}.glance-v3__grid p{font-size:.82rem;line-height:1.42}}
      @media(max-width:430px){.glance-v3__summary{grid-template-columns:.72fr repeat(3,1fr)}.glance-v3__script{font-size:1.35rem}.glance-v3__metric strong{font-size:1.02rem}.glance-v3__grid article{min-height:240px;padding:16px 13px}.glance-v3__grid h3{font-size:1.05rem}.glance-v3__grid p{font-size:.78rem}}
    `;
    document.head.appendChild(style);
  }

  const why=sections.find(el=>el.querySelector('.eyebrow')?.textContent?.trim()==='Warum LAVUQ?');
  if(why){
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
          <div class="why-lavuq-v3__note">Mehr Menschen.<br>Mehr erleben.</div>
        </div>
        <div class="why-lavuq-v3__timeline">
          <div class="why-lavuq-v3__line"></div>
          <article class="why-card left"><div class="why-card__icon">◎</div><div class="why-card__content"><h3>Kleine Gruppen</h3><p>Vier Menschen lernen sich gemeinsam kennen.</p></div><div class="why-card__number">1</div></article>
          <article class="why-card right"><div class="why-card__number">2</div><div class="why-card__icon">⌁</div><div class="why-card__content"><h3>Ähnliche Interessen</h3><p>Gemeinsame Interessen schaffen von Anfang an Nähe.</p></div></article>
          <article class="why-card left"><div class="why-card__icon">◡</div><div class="why-card__content"><h3>Weniger Druck</h3><p>Kein Smalltalk-Marathon – dafür echte Gespräche in entspannter Atmosphäre.</p></div><div class="why-card__number">3</div></article>
          <article class="why-card right"><div class="why-card__number">4</div><div class="why-card__icon">◌</div><div class="why-card__content"><h3>Echter Austausch</h3><p>Du triffst Menschen, die offen, neugierig und auf einer ähnlichen Wellenlänge sind.</p></div></article>
          <article class="why-card left"><div class="why-card__icon">♡</div><div class="why-card__content"><h3>Kein Dating</h3><p>LAVUQ ist keine Dating-Plattform, sondern für echte Freundschaften.</p></div><div class="why-card__number">5</div></article>
          <article class="why-card right"><div class="why-card__number">6</div><div class="why-card__icon">✓</div><div class="why-card__content"><h3>Sicherer Rahmen</h3><p>Verifizierte Teilnehmende, klare Regeln und ein respektvoller Umgang.</p></div></article>
        </div>
        <div class="why-lavuq-v3__footer-note">Freundschaften beginnen hier. ♡</div>
      </div>`;
  }

  if(!document.getElementById('why-lavuq-v3-style')){
    const style=document.createElement('style');
    style.id='why-lavuq-v3-style';
    style.textContent=`
      .why-lavuq-v3{background:linear-gradient(180deg,#fffdf8 0%,#faf6ee 100%);padding:72px 0;position:relative;overflow:hidden}
      .why-lavuq-v3__wrap{position:relative}.why-lavuq-v3__topbar{display:flex;align-items:center;gap:20px;padding:18px 24px;border:1px solid rgba(201,160,82,.22);border-radius:22px;background:rgba(255,255,255,.74);margin-bottom:44px;flex-wrap:wrap}.why-lavuq-v3__topitem{display:flex;align-items:center;gap:10px;color:#607087;font-size:1rem;font-weight:700}.why-lavuq-v3__topitem span{color:#b88a33;font-size:1.35rem}.why-lavuq-v3__divider{width:1px;height:30px;background:#e6dcc8}
      .why-lavuq-v3__intro{position:relative;max-width:820px;margin-bottom:42px}.why-lavuq-v3 .eyebrow{color:#b88a33;font-size:.82rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase;margin-bottom:14px}.why-lavuq-v3 h2{margin:0 0 18px;color:#09233f;font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:clamp(2.8rem,5.5vw,5.4rem);line-height:.95;letter-spacing:-.04em}.why-lavuq-v3__intro p{margin:0;max-width:760px;color:#6a7488;font-size:1.08rem;line-height:1.65;font-weight:560}.why-lavuq-v3__note{position:absolute;right:-40px;top:24px;color:#b88a33;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2.3rem;line-height:.95;transform:rotate(-6deg)}
      .why-lavuq-v3__timeline{position:relative;display:grid;gap:26px;margin-top:22px}.why-lavuq-v3__line{position:absolute;left:50%;top:0;bottom:0;width:2px;transform:translateX(-50%);background:linear-gradient(180deg,#d3b06a,#c19642)}.why-card{position:relative;width:calc(50% - 30px);background:#fff;border:1px solid rgba(201,160,82,.2);border-radius:24px;padding:28px 24px 24px;box-shadow:0 12px 34px rgba(9,35,63,.06);display:grid;grid-template-columns:72px 1fr;gap:18px;min-height:190px}.why-card.left{justify-self:start}.why-card.right{justify-self:end}.why-card__icon{width:64px;height:64px;border-radius:18px;background:#f8efd9;color:#b1842f;display:flex;align-items:center;justify-content:center;font-size:1.7rem;font-weight:900}.why-card__content h3{margin:0 0 8px;color:#09233f;font-size:1.2rem;line-height:1.2;font-weight:850}.why-card__content p{margin:0;color:#6a7488;font-size:.98rem;line-height:1.5;font-weight:540}.why-card__number{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:#f2e7c8;color:#9e7427;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;box-shadow:0 8px 18px rgba(177,132,47,.15)}.why-card.left .why-card__number{right:-54px}.why-card.right .why-card__number{left:-54px}.why-lavuq-v3__footer-note{margin-top:34px;text-align:center;color:#b88a33;font-family:'Brush Script MT','Segoe Script',cursive;font-size:2.4rem;line-height:1}
      @media(max-width:900px){.why-lavuq-v3__note{position:static;margin-top:18px;transform:rotate(-4deg)}.why-lavuq-v3__line{left:22px;transform:none}.why-card{width:100%;justify-self:stretch!important;grid-template-columns:58px 1fr;min-height:auto;padding:22px 18px 20px}.why-card__icon{width:52px;height:52px;font-size:1.35rem}.why-card__number{left:-2px!important;right:auto!important;top:-10px;transform:none;width:38px;height:38px;font-size:.95rem}.why-lavuq-v3__timeline{padding-left:38px}.why-card__content h3{font-size:1.08rem}.why-card__content p{font-size:.9rem}.why-lavuq-v3__topbar{gap:12px;padding:16px}.why-lavuq-v3__divider{display:none}.why-lavuq-v3__topitem{width:100%}}
    `;
    document.head.appendChild(style);
  }
})();
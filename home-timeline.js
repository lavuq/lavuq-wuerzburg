(function(){
  const section=document.querySelector('#so-gehts');
  if(!section) return;

  section.className='lavuq-timeline-section';
  section.innerHTML=`
    <div class="lavuq-timeline-wrap">
      <div class="lavuq-timeline-header">
        <p class="lavuq-timeline-eyebrow">So funktioniert’s</p>
        <h2>Von der Bewerbung bis zur echten Begegnung.</h2>
        <p class="lavuq-timeline-subtext">In vier einfachen Schritten zu neuen Menschen, echten Treffen und gemeinsamen Erlebnissen in Würzburg.</p>
      </div>
      <div class="lavuq-timeline">
        <div class="lavuq-timeline-line" aria-hidden="true"></div>
        <div class="lavuq-timeline-row left"><article class="lavuq-timeline-card"><div class="lavuq-timeline-icon" aria-hidden="true">✎</div><div><h3>1. Kurz bewerben</h3><p>Beantworte ein paar kurze Fragen zu dir, deinem Alltag und deinen Interessen.</p></div></article><div class="lavuq-timeline-dot">1</div><div class="lavuq-timeline-spacer"></div></div>
        <div class="lavuq-timeline-row right"><div class="lavuq-timeline-spacer"></div><div class="lavuq-timeline-dot">2</div><article class="lavuq-timeline-card"><div class="lavuq-timeline-icon" aria-hidden="true">◎</div><div><h3>2. Gruppe finden</h3><p>Wir stellen eine passende kleine Gruppe aus Würzburg &amp; Umgebung zusammen.</p></div></article></div>
        <div class="lavuq-timeline-row left"><article class="lavuq-timeline-card"><div class="lavuq-timeline-icon" aria-hidden="true">▣</div><div><h3>3. Mein Q</h3><p>Nach deiner Zusage findest du Chat, Termine, Ideen und wichtige Infos an einem Ort.</p></div></article><div class="lavuq-timeline-dot">3</div><div class="lavuq-timeline-spacer"></div></div>
        <div class="lavuq-timeline-row right"><div class="lavuq-timeline-spacer"></div><div class="lavuq-timeline-dot">4</div><article class="lavuq-timeline-card"><div class="lavuq-timeline-icon" aria-hidden="true">⌖</div><div><h3>4. Erstes Treffen</h3><p>Das erste Kennenlernen findet öffentlich, sicher und entspannt statt.</p></div></article></div>
      </div>
      <div class="lavuq-timeline-badges" aria-label="LAVUQ auf einen Blick"><span>4 Teilnehmer</span><span>6 Wochen</span><span>mind. 3 Treffen</span><span>Begleitperson erlaubt</span><span>Kein Dating</span></div>
      <div class="lavuq-timeline-cta"><a href="bewerben.html">Jetzt kostenlos bewerben <span aria-hidden="true">→</span></a></div>
      <div class="lavuq-timeline-footer-text">ECHTE MENSCHEN. ECHTE ORTE. DEIN Q.</div>
    </div>`;

  const style=document.createElement('style');
  style.id='lavuq-home-timeline-style';
  style.textContent=`
    .lavuq-timeline-section{background:linear-gradient(180deg,#fffdf8 0%,#f8f4ec 100%);padding:78px 20px;overflow:hidden}
    .lavuq-timeline-wrap{max-width:1100px;margin:0 auto}
    .lavuq-timeline-header{text-align:center;max-width:780px;margin:0 auto 50px}
    .lavuq-timeline-eyebrow{margin:0 0 13px;color:#b18433;font-size:.78rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase}
    .lavuq-timeline-header h2{margin:0 0 17px;color:#071a34;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.45rem,5vw,4.35rem);font-weight:500;line-height:1.02;letter-spacing:-.045em}
    .lavuq-timeline-subtext{max-width:700px;margin:0 auto;color:#667085;font-size:1.08rem;line-height:1.62}
    .lavuq-timeline{position:relative;max-width:980px;margin:0 auto 40px}
    .lavuq-timeline-line{position:absolute;top:15px;bottom:15px;left:50%;width:2px;transform:translateX(-50%);background:linear-gradient(180deg,#e0c176,#b9842b)}
    .lavuq-timeline-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 72px minmax(0,1fr);align-items:center;gap:18px;margin-bottom:28px}
    .lavuq-timeline-card{display:flex;align-items:flex-start;gap:17px;padding:23px 22px;border:1px solid rgba(184,137,48,.18);border-radius:24px;background:rgba(255,255,255,.96);box-shadow:0 13px 34px rgba(7,26,52,.07)}
    .lavuq-timeline-card h3{margin:0 0 7px;color:#071a34;font-family:Georgia,'Times New Roman',serif;font-size:1.55rem;line-height:1.15;font-weight:600}
    .lavuq-timeline-card p{margin:0;color:#667085;font-size:.98rem;line-height:1.5}
    .lavuq-timeline-icon{display:grid;place-items:center;flex:0 0 58px;width:58px;height:58px;border-radius:50%;background:#faf4e7;color:#a67828;font-size:1.75rem;font-weight:700}
    .lavuq-timeline-dot{position:relative;z-index:2;display:grid;place-items:center;width:54px;height:54px;margin:0 auto;border-radius:50%;background:linear-gradient(180deg,#dcb75f,#bb8428);color:#fff;font-size:1.15rem;font-weight:900;box-shadow:0 9px 22px rgba(187,132,40,.25);animation:lavuqDotLive 2.2s ease-in-out infinite}
    .lavuq-timeline-row:nth-child(3) .lavuq-timeline-dot{animation-delay:.25s}
    .lavuq-timeline-row:nth-child(4) .lavuq-timeline-dot{animation-delay:.5s}
    .lavuq-timeline-row:nth-child(5) .lavuq-timeline-dot{animation-delay:.75s}
    @keyframes lavuqDotLive{0%,100%{transform:scale(1);box-shadow:0 9px 22px rgba(187,132,40,.25),0 0 0 0 rgba(220,183,95,.34)}50%{transform:scale(1.13);box-shadow:0 13px 30px rgba(187,132,40,.38),0 0 0 13px rgba(220,183,95,0)}}
    .lavuq-timeline-spacer{min-height:1px}
    .lavuq-timeline-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin:12px 0 32px}
    .lavuq-timeline-badges span{display:inline-flex;align-items:center;min-height:42px;padding:9px 17px;border:1px solid rgba(184,137,48,.32);border-radius:999px;background:#fff;color:#10243f;font-size:.9rem;font-weight:800;box-shadow:0 6px 18px rgba(7,26,52,.035)}
    .lavuq-timeline-cta{text-align:center}.lavuq-timeline-cta a{display:inline-flex;align-items:center;justify-content:center;gap:13px;min-height:62px;padding:0 34px;border-radius:16px;background:linear-gradient(135deg,#061a30,#0b2b50);color:#fff;text-decoration:none;font-size:1.07rem;font-weight:850;box-shadow:0 14px 34px rgba(6,26,48,.18)}
    .lavuq-timeline-cta a span{color:#e0bb66;font-size:1.25em}.lavuq-timeline-footer-text{margin-top:27px;text-align:center;color:#ad7f2d;font-size:.77rem;font-weight:850;letter-spacing:.24em}
    @media(max-width:820px){.lavuq-timeline-section{padding:60px 16px}.lavuq-timeline-header{text-align:left;margin-bottom:36px}.lavuq-timeline-header h2{font-size:clamp(2.15rem,9vw,3.2rem)}.lavuq-timeline-subtext{font-size:.98rem;margin:0}.lavuq-timeline-line{left:24px;transform:none;top:5px;bottom:5px}.lavuq-timeline-row,.lavuq-timeline-row.left,.lavuq-timeline-row.right{display:grid;grid-template-columns:50px minmax(0,1fr);gap:14px;margin-bottom:18px}.lavuq-timeline-row .lavuq-timeline-dot{grid-column:1;grid-row:1;width:46px;height:46px;font-size:1rem}.lavuq-timeline-row .lavuq-timeline-card{grid-column:2;grid-row:1;padding:19px 17px;border-radius:19px}.lavuq-timeline-row .lavuq-timeline-spacer{display:none}.lavuq-timeline-card h3{font-size:1.28rem}.lavuq-timeline-card p{font-size:.91rem}.lavuq-timeline-icon{width:48px;height:48px;flex-basis:48px;font-size:1.35rem}.lavuq-timeline-badges{justify-content:flex-start;gap:8px;margin:14px 0 27px}.lavuq-timeline-badges span{font-size:.78rem;min-height:36px;padding:7px 12px}.lavuq-timeline-cta a{width:100%;min-height:58px}.lavuq-timeline-footer-text{font-size:.66rem;line-height:1.6;letter-spacing:.18em}}
    @media(max-width:430px){.lavuq-timeline-card{gap:12px!important}.lavuq-timeline-icon{width:42px;height:42px;flex-basis:42px;font-size:1.2rem}.lavuq-timeline-card h3{font-size:1.18rem}.lavuq-timeline-card p{font-size:.86rem}}
  `;
  document.head.appendChild(style);
})();
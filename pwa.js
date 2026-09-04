(()=>{
  const head=document.head;
  if(!head.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement('link');
    manifest.rel='manifest';
    manifest.href='/manifest.webmanifest';
    head.appendChild(manifest);
  }
  if(!head.querySelector('meta[name="theme-color"]')){
    const theme=document.createElement('meta');
    theme.name='theme-color';
    theme.content='#041529';
    head.appendChild(theme);
  }
  if(!head.querySelector('meta[name="apple-mobile-web-app-capable"]')){
    const capable=document.createElement('meta');
    capable.name='apple-mobile-web-app-capable';
    capable.content='yes';
    head.appendChild(capable);
  }
  if(!head.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')){
    const status=document.createElement('meta');
    status.name='apple-mobile-web-app-status-bar-style';
    status.content='black-translucent';
    head.appendChild(status);
  }
  if(!head.querySelector('meta[name="apple-mobile-web-app-title"]')){
    const title=document.createElement('meta');
    title.name='apple-mobile-web-app-title';
    title.content='LAVUQ Würzburg';
    head.appendChild(title);
  }
  if(!head.querySelector('link[rel="apple-touch-icon"]')){
    const icon=document.createElement('link');
    icon.rel='apple-touch-icon';
    icon.href='/lavuq-q-square.png';
    head.appendChild(icon);
  }

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(err=>console.warn('LAVUQ PWA:',err)));
  }

  const standalone=window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;

  if(standalone && location.pathname.includes('mitglied')){
    document.documentElement.classList.add('lavuq-standalone');
    const style=document.createElement('style');
    style.id='lavuq-standalone-member-style';
    style.textContent=`
      html.lavuq-standalone body{padding-bottom:calc(78px + env(safe-area-inset-bottom));background:#f7f3ea}
      html.lavuq-standalone header{padding-top:calc(16px + env(safe-area-inset-top));position:sticky;top:0;z-index:90}
      html.lavuq-standalone .wrap{margin-top:16px;margin-bottom:22px}
      html.lavuq-standalone .intro{margin-bottom:14px}
      html.lavuq-standalone .intro .eyebrow{font-size:.7rem;letter-spacing:.16em}
      html.lavuq-standalone .intro h1{font-size:2rem;margin:5px 0 5px}
      html.lavuq-standalone .intro p{font-size:.9rem;line-height:1.45;margin:0}
      html.lavuq-standalone .app-shell{border-radius:22px;border-color:rgba(216,180,106,.28);box-shadow:0 14px 36px rgba(4,21,41,.07)}
      html.lavuq-standalone .app-tabs:not(.lavuq-app-bottom-nav){display:none!important}
      .lavuq-app-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:9995;display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding:7px 8px calc(7px + env(safe-area-inset-bottom));background:rgba(4,21,41,.97);border-top:1px solid rgba(216,180,106,.58);box-shadow:0 -12px 32px rgba(4,21,41,.18);backdrop-filter:blur(16px)}
      .lavuq-app-bottom-nav .app-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:54px;padding:6px 4px;border-radius:13px;color:#cdd5df;font-size:.72rem;font-weight:800}
      .lavuq-app-bottom-nav .app-tab .nav-icon{font-size:1.2rem;line-height:1}
      .lavuq-app-bottom-nav .app-tab.active{background:rgba(216,180,106,.16);color:#e5c577}
      .lavuq-app-splash{position:fixed;inset:0;z-index:20000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#041529;color:#fff;padding:28px;padding-top:calc(28px + env(safe-area-inset-top));padding-bottom:calc(28px + env(safe-area-inset-bottom));transition:opacity .38s ease,visibility .38s ease}
      .lavuq-app-splash.hide{opacity:0;visibility:hidden}
      .lavuq-app-splash img{width:112px;height:112px;object-fit:contain;filter:drop-shadow(0 12px 32px rgba(0,0,0,.24));animation:lavuqSplashIn .55s ease both}
      .lavuq-app-splash .city{color:#d8b46a;font-family:Georgia,'Times New Roman',serif;font-size:1rem;margin-top:10px}
      .lavuq-app-splash .tagline{font-size:.82rem;letter-spacing:.08em;color:#cbd3dd;margin-top:28px;text-align:center}
      @keyframes lavuqSplashIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
      .lavuq-app-hero{display:none}
      html.lavuq-standalone .lavuq-app-hero{display:block;background:linear-gradient(145deg,#041529,#102b49);color:#fff;border:1px solid rgba(216,180,106,.52);border-radius:20px;padding:19px;margin-bottom:12px;box-shadow:0 14px 34px rgba(4,21,41,.13);position:relative;overflow:hidden}
      html.lavuq-standalone .lavuq-app-hero:after{content:"Q";position:absolute;right:-14px;bottom:-40px;font-family:Georgia,'Times New Roman',serif;font-size:9rem;line-height:1;color:rgba(216,180,106,.07)}
      html.lavuq-standalone .lavuq-app-hero-top{display:flex;align-items:center;gap:12px;position:relative;z-index:1}
      html.lavuq-standalone .lavuq-app-hero-logo{width:46px;height:46px;object-fit:contain;flex:0 0 auto}
      html.lavuq-standalone .lavuq-app-hero-kicker{color:#d8b46a;font-size:.68rem;font-weight:850;letter-spacing:.15em;text-transform:uppercase}
      html.lavuq-standalone .lavuq-app-hero h2{font-family:Georgia,'Times New Roman',serif;font-size:1.62rem;margin:2px 0 0;color:#fff;font-weight:500}
      html.lavuq-standalone .lavuq-app-hero p{position:relative;z-index:1;color:#dce3eb;line-height:1.45;margin:12px 0 0;font-size:.88rem;max-width:570px}
      html.lavuq-standalone .lavuq-dashboard-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:0 0 12px}
      html.lavuq-standalone .lavuq-dashboard-action{appearance:none;border:1px solid #e3d7c1;background:#fff;border-radius:16px;padding:13px 10px;text-align:center;box-shadow:0 6px 18px rgba(4,21,41,.045);cursor:pointer;color:#132033;min-height:92px;display:flex;flex-direction:column;align-items:center;justify-content:center}
      html.lavuq-standalone .lavuq-dashboard-action:active{transform:scale(.98)}
      html.lavuq-standalone .lavuq-dashboard-action .ico{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#041529;color:#d8b46a;font-size:1rem;margin-bottom:7px}
      html.lavuq-standalone .lavuq-dashboard-action strong{display:block;font-size:.84rem;margin:0}
      html.lavuq-standalone .lavuq-dashboard-action small{display:none}
      html.lavuq-standalone #uebersicht>.panel-grid{grid-template-columns:1fr;gap:10px}
      html.lavuq-standalone #uebersicht>.panel-grid>.card{padding:17px;border-radius:17px;box-shadow:0 7px 20px rgba(4,21,41,.045)}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:first-child{border-color:rgba(216,180,106,.55);box-shadow:0 9px 24px rgba(4,21,41,.06)}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:first-child h2{font-size:1.12rem;margin-bottom:7px}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:first-child h2:before{content:"●";color:#61a77b;font-size:.62rem;vertical-align:middle;margin-right:8px}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:nth-child(2) h2{font-size:1.05rem;margin-bottom:7px}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:nth-child(2) p{font-size:.86rem;line-height:1.45;margin:0}
      html.lavuq-standalone #uebersicht .privacy-note{margin-top:10px;padding:11px 12px;border-radius:12px;font-size:.82rem;line-height:1.4}
      html.lavuq-standalone #groupMeta{font-size:.84rem;line-height:1.4}
      html.lavuq-standalone .members{gap:8px;margin-top:11px}
      html.lavuq-standalone .member{background:#fff;border-color:#e8e1d5;padding:10px 11px;border-radius:12px;min-height:52px}
      html.lavuq-standalone .member.me{background:#fff8e8;border-color:#d8b46a}
      html.lavuq-standalone .avatar{width:31px;height:31px;font-size:.82rem}
      html.lavuq-standalone #uebersicht>.quick-grid{display:none!important}
      html.lavuq-standalone #chat>.card{padding:0!important;overflow:hidden;border-color:#ddd4c4;box-shadow:0 12px 30px rgba(4,21,41,.08)}
      html.lavuq-standalone .lavuq-chat-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#041529;color:#fff;border-bottom:1px solid rgba(216,180,106,.42)}
      html.lavuq-standalone .lavuq-chat-head img{width:42px;height:42px;object-fit:contain;flex:0 0 auto}
      html.lavuq-standalone .lavuq-chat-head strong{display:block;font-size:1rem}
      html.lavuq-standalone .lavuq-chat-head span{display:block;color:#bfc9d5;font-size:.78rem;margin-top:2px}
      html.lavuq-standalone #chat>.card>h2,html.lavuq-standalone #chat>.card>p{display:none}
      html.lavuq-standalone .chat-log{height:min(58vh,560px);border:0;border-radius:0;background:linear-gradient(rgba(247,243,234,.94),rgba(247,243,234,.94)),radial-gradient(circle at 20% 20%,rgba(216,180,106,.18) 0 1px,transparent 1.5px);background-size:auto,24px 24px;padding:16px 12px 18px}
      html.lavuq-standalone .bubble{position:relative;max-width:82%;border:0;border-radius:17px 17px 17px 5px;background:#fff;box-shadow:0 3px 10px rgba(4,21,41,.07);padding:10px 12px;margin-bottom:10px;font-size:.94rem;line-height:1.4}
      html.lavuq-standalone .bubble.me{margin-left:auto;border-radius:17px 17px 5px 17px;background:#fff2cb;color:#172333}
      html.lavuq-standalone .bubble.system{max-width:92%;margin:10px auto;border-radius:12px;background:rgba(4,21,41,.08);box-shadow:none;color:#526071;font-size:.82rem;padding:8px 11px}
      html.lavuq-standalone .bubble>strong{display:block;color:#8c6b2b;font-size:.75rem;margin-bottom:3px}
      html.lavuq-standalone .bubble.me>strong{color:#69501f}
      html.lavuq-standalone .bubble.system>strong{display:none}
      html.lavuq-standalone .bubble small{font-size:.67rem;text-align:right;color:#8a929d;margin-top:4px}
      html.lavuq-standalone .composer{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;margin:0;padding:10px 10px calc(10px + env(safe-area-inset-bottom)*.15);background:#fff;border-top:1px solid #e5ded2}
      html.lavuq-standalone .composer textarea{min-height:46px;max-height:112px;border-radius:22px;border:1px solid #ddd7cd;padding:12px 14px;background:#f8f7f4;resize:none;line-height:1.35}
      html.lavuq-standalone .composer textarea:focus{outline:2px solid rgba(216,180,106,.28);border-color:#c8aa67;background:#fff}
      html.lavuq-standalone .composer .btn{width:46px!important;height:46px;min-width:46px;padding:0;border-radius:50%;font-size:0;background:#d8b46a;position:relative}
      html.lavuq-standalone .composer .btn:after{content:"➤";font-size:1rem;color:#041529;transform:translateX(1px)}
      html.lavuq-standalone #sicherheit>.card{padding:0!important;overflow:hidden;border-color:#ddd4c4;box-shadow:0 12px 30px rgba(4,21,41,.08)}
      html.lavuq-standalone .lavuq-safety-head{display:flex;align-items:center;gap:12px;padding:15px 16px;background:#041529;color:#fff;border-bottom:1px solid rgba(216,180,106,.42)}
      html.lavuq-standalone .lavuq-safety-head .shield{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:rgba(216,180,106,.15);border:1px solid rgba(216,180,106,.45);font-size:1.2rem;color:#e7c97d}
      html.lavuq-standalone .lavuq-safety-head strong{display:block;font-size:1rem}
      html.lavuq-standalone .lavuq-safety-head span{display:block;color:#c4ced9;font-size:.78rem;margin-top:2px}
      html.lavuq-standalone #sicherheit>.card>h2,html.lavuq-standalone #sicherheit>.card>p.muted{display:none}
      html.lavuq-standalone #sicherheit .danger-note{margin:14px 14px 4px;border:0;border-left:4px solid #d85b48;border-radius:14px;background:#fff0ec;color:#5d2a23;padding:13px 14px;box-shadow:0 4px 14px rgba(90,31,23,.05)}
      html.lavuq-standalone #sicherheit .danger-note strong{color:#9f3425}
      html.lavuq-standalone #sicherheit .safety-box>label{margin:16px 14px 7px;color:#344054;font-size:.84rem}
      html.lavuq-standalone #sicherheit select,html.lavuq-standalone #sicherheit textarea{width:calc(100% - 28px);margin:0 14px;border-radius:14px;border:1px solid #d9d1c4;background:#fbfaf7;min-height:50px;padding:13px 14px}
      html.lavuq-standalone #sicherheit textarea{min-height:150px;resize:vertical;line-height:1.45}
      html.lavuq-standalone #sicherheit select:focus,html.lavuq-standalone #sicherheit textarea:focus{outline:3px solid rgba(216,180,106,.18);border-color:#bea05d;background:#fff}
      html.lavuq-standalone #sicherheit #safetyBtn{width:calc(100% - 28px)!important;margin:16px 14px 14px!important;min-height:50px;border-radius:15px;background:#d8b46a;color:#041529;font-size:.92rem;box-shadow:0 8px 20px rgba(190,157,84,.18)}
      html.lavuq-standalone #sicherheit #safetyResult{margin:0 14px 14px}
      html.lavuq-standalone .lavuq-safety-private{margin:0 14px 14px;padding:12px 13px;border-radius:13px;background:#eef3f7;color:#4f5d6d;font-size:.8rem;line-height:1.45;display:flex;gap:9px;align-items:flex-start}
      @media(max-width:760px){html.lavuq-standalone .app-content{padding:10px}html.lavuq-standalone .card{border-radius:18px;padding:17px}html.lavuq-standalone .lavuq-app-hero{padding:17px;border-radius:18px}html.lavuq-standalone .lavuq-dashboard-strip{gap:7px}html.lavuq-standalone .lavuq-dashboard-action{padding:11px 7px;border-radius:14px;min-height:82px}html.lavuq-standalone .lavuq-dashboard-action .ico{width:31px;height:31px;margin-bottom:6px}html.lavuq-standalone .lavuq-dashboard-action strong{font-size:.78rem}html.lavuq-standalone #chat>.card,html.lavuq-standalone #sicherheit>.card{border-radius:18px!important}html.lavuq-standalone .chat-log{height:calc(100vh - 345px);min-height:340px}html.lavuq-standalone .composer{grid-template-columns:1fr auto!important}html.lavuq-standalone .composer .btn{width:46px!important}}
    `;
    head.appendChild(style);

    if(!sessionStorage.getItem('lavuqSplashShown')){
      const splash=document.createElement('div');
      splash.className='lavuq-app-splash';
      splash.setAttribute('aria-hidden','true');
      splash.innerHTML=`<img src="CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png" alt=""><div class="city">Würzburg</div><div class="tagline">NEUE KONTAKTE · ECHTE FREUNDSCHAFTEN</div>`;
      document.body.appendChild(splash);
      sessionStorage.setItem('lavuqSplashShown','1');
      window.setTimeout(()=>splash.classList.add('hide'),1050);
      window.setTimeout(()=>splash.remove(),1550);
    }

    const overview=document.querySelector('#uebersicht');
    if(overview && !overview.querySelector('.lavuq-app-hero')){
      const hero=document.createElement('div');
      hero.className='lavuq-app-hero';
      hero.innerHTML=`<div class="lavuq-app-hero-top"><img class="lavuq-app-hero-logo" src="CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png" alt="LAVUQ Q"><div><div class="lavuq-app-hero-kicker">Dein persönlicher Bereich</div><h2>Mein Q</h2></div></div><p>Deine Gruppe, euer Chat, eure Treffen und Sicherheit – alles direkt an einem Ort.</p>`;
      overview.prepend(hero);

      const strip=document.createElement('div');
      strip.className='lavuq-dashboard-strip';
      strip.innerHTML=`
        <button class="lavuq-dashboard-action" type="button" data-go-tab="chat"><span class="ico">💬</span><strong>Chat</strong></button>
        <button class="lavuq-dashboard-action" type="button" data-go-tab="treffen"><span class="ico">◷</span><strong>Treffen</strong></button>
        <button class="lavuq-dashboard-action" type="button" data-go-tab="sicherheit"><span class="ico">🛡</span><strong>Sicherheit</strong></button>`;
      hero.insertAdjacentElement('afterend',strip);
      strip.querySelectorAll('[data-go-tab]').forEach(btn=>btn.addEventListener('click',()=>{
        const original=document.querySelector(`.app-tabs:not(.lavuq-app-bottom-nav) .app-tab[data-tab="${btn.dataset.goTab}"]`);
        if(original) original.click();
      }));
    }

    const chatCard=document.querySelector('#chat>.card');
    if(chatCard && !chatCard.querySelector('.lavuq-chat-head')){
      const chatHead=document.createElement('div');
      chatHead.className='lavuq-chat-head';
      chatHead.innerHTML=`<img src="CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png" alt="LAVUQ Q"><div><strong>Deine LAVUQ-Gruppe</strong><span>Privater Gruppenchat · nur für eure Gruppe</span></div>`;
      chatCard.prepend(chatHead);
    }

    const safetyCard=document.querySelector('#sicherheit>.card');
    if(safetyCard && !safetyCard.querySelector('.lavuq-safety-head')){
      const safetyHead=document.createElement('div');
      safetyHead.className='lavuq-safety-head';
      safetyHead.innerHTML=`<div class="shield">🛡</div><div><strong>Sicherheit & Hilfe</strong><span>Vertraulich direkt an LAVUQ</span></div>`;
      safetyCard.prepend(safetyHead);
      const privateNote=document.createElement('div');
      privateNote.className='lavuq-safety-private';
      privateNote.innerHTML='<span>🔒</span><span>Deine Meldung ist für die anderen Gruppenmitglieder nicht sichtbar und wird direkt an LAVUQ übermittelt.</span>';
      safetyCard.querySelector('.danger-note')?.insertAdjacentElement('afterend',privateNote);
    }

    const bottom=document.createElement('nav');
    bottom.className='lavuq-app-bottom-nav';
    bottom.setAttribute('aria-label','LAVUQ App Navigation');
    bottom.innerHTML=`
      <button class="app-tab active" data-tab="uebersicht" aria-selected="true"><span class="nav-icon">⌂</span><span>Mein Q</span></button>
      <button class="app-tab" data-tab="chat" aria-selected="false"><span class="nav-icon">💬</span><span>Chat</span></button>
      <button class="app-tab" data-tab="treffen" aria-selected="false"><span class="nav-icon">◷</span><span>Treffen</span></button>
      <button class="app-tab" data-tab="sicherheit" aria-selected="false"><span class="nav-icon">🛡</span><span>Sicherheit</span></button>`;
    bottom.querySelectorAll('.app-tab').forEach(btn=>btn.addEventListener('click',()=>{
      const original=document.querySelector(`.app-tabs:not(.lavuq-app-bottom-nav) .app-tab[data-tab="${btn.dataset.tab}"]`);
      if(original) original.click();
    }));
    document.body.appendChild(bottom);
  }

  if(standalone) return;
  if(location.pathname.includes('mitglied')) return;

  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isMobile=/android|iphone|ipad|ipod/i.test(navigator.userAgent);
  if(!isMobile) return;

  const style=document.createElement('style');
  style.textContent=`
    .lavuq-pwa-install{position:fixed;right:16px;bottom:18px;z-index:9998;border:1px solid rgba(216,180,106,.78);background:#041529;color:#fff;border-radius:999px;padding:12px 17px;font:800 .86rem/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 12px 35px rgba(0,0,0,.28);display:none;align-items:center;gap:8px;cursor:pointer}
    .lavuq-pwa-install span{color:#d8b46a;font-size:1.05rem}
    .lavuq-pwa-sheet{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.52);display:grid;place-items:end center;padding:16px}
    .lavuq-pwa-card{width:min(100%,460px);background:#fff;color:#142033;border-radius:24px;padding:22px;box-shadow:0 25px 70px rgba(0,0,0,.35)}
    .lavuq-pwa-card h3{margin:0 0 8px;font-size:1.35rem;color:#041529}
    .lavuq-pwa-card p{margin:0 0 16px;line-height:1.5;color:#536070}
    .lavuq-pwa-card ol{margin:0 0 18px;padding-left:21px;line-height:1.55;color:#273548}
    .lavuq-pwa-card button{width:100%;border:0;border-radius:14px;padding:13px 16px;background:#041529;color:#fff;font-weight:800}
  `;
  head.appendChild(style);

  const button=document.createElement('button');
  button.type='button';
  button.className='lavuq-pwa-install';
  button.innerHTML='<span>Q</span> LAVUQ App installieren';
  document.body.appendChild(button);

  let deferredPrompt=null;
  const show=()=>button.style.display='flex';

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredPrompt=event;
    show();
  });

  const showIOSHelp=()=>{
    const sheet=document.createElement('div');
    sheet.className='lavuq-pwa-sheet';
    sheet.innerHTML=`<div class="lavuq-pwa-card"><h3>LAVUQ als App installieren</h3><p>Auf dem iPhone wird LAVUQ direkt über Safari zum Home-Bildschirm hinzugefügt.</p><ol><li>Unten auf <strong>Teilen</strong> tippen.</li><li><strong>Zum Home-Bildschirm</strong> auswählen.</li><li>Oben rechts <strong>Hinzufügen</strong> tippen.</li></ol><button type="button">Verstanden</button></div>`;
    sheet.addEventListener('click',e=>{if(e.target===sheet || e.target.tagName==='BUTTON') sheet.remove();});
    document.body.appendChild(sheet);
  };

  button.addEventListener('click',async()=>{
    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(()=>{});
      deferredPrompt=null;
      button.style.display='none';
      return;
    }
    if(isIOS) showIOSHelp();
  });

  if(isIOS) show();
  window.addEventListener('appinstalled',()=>button.remove());
})();
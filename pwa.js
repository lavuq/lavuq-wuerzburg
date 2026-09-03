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
    title.content='LAVUQ';
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
      html.lavuq-standalone .wrap{margin-top:18px;margin-bottom:22px}
      html.lavuq-standalone .app-shell{border-radius:22px}
      html.lavuq-standalone .app-tabs:not(.lavuq-app-bottom-nav){display:none!important}
      .lavuq-app-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:9995;display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding:7px 8px calc(7px + env(safe-area-inset-bottom));background:rgba(4,21,41,.97);border-top:1px solid rgba(216,180,106,.58);box-shadow:0 -12px 32px rgba(4,21,41,.18);backdrop-filter:blur(16px)}
      .lavuq-app-bottom-nav .app-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:54px;padding:6px 4px;border-radius:13px;color:#cdd5df;font-size:.72rem;font-weight:800}
      .lavuq-app-bottom-nav .app-tab .nav-icon{font-size:1.2rem;line-height:1}
      .lavuq-app-bottom-nav .app-tab.active{background:rgba(216,180,106,.16);color:#e5c577}
      .lavuq-app-splash{position:fixed;inset:0;z-index:20000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#041529;color:#fff;padding:28px;padding-top:calc(28px + env(safe-area-inset-top));padding-bottom:calc(28px + env(safe-area-inset-bottom));transition:opacity .38s ease,visibility .38s ease}
      .lavuq-app-splash.hide{opacity:0;visibility:hidden}
      .lavuq-app-splash img{width:112px;height:112px;object-fit:contain;filter:drop-shadow(0 12px 32px rgba(0,0,0,.24));animation:lavuqSplashIn .55s ease both}
      .lavuq-app-splash .word{font-family:Georgia,'Times New Roman',serif;font-size:2.35rem;letter-spacing:.18em;margin-top:18px}
      .lavuq-app-splash .city{color:#d8b46a;font-family:Georgia,'Times New Roman',serif;font-size:1rem;margin-top:7px}
      .lavuq-app-splash .tagline{font-size:.82rem;letter-spacing:.08em;color:#cbd3dd;margin-top:28px;text-align:center}
      @keyframes lavuqSplashIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
      .lavuq-app-hero{display:none}
      html.lavuq-standalone .lavuq-app-hero{display:block;background:linear-gradient(145deg,#041529,#102b49);color:#fff;border:1px solid rgba(216,180,106,.52);border-radius:22px;padding:22px;margin-bottom:14px;box-shadow:0 16px 38px rgba(4,21,41,.14);position:relative;overflow:hidden}
      html.lavuq-standalone .lavuq-app-hero:after{content:"Q";position:absolute;right:-12px;bottom:-36px;font-family:Georgia,'Times New Roman',serif;font-size:9rem;line-height:1;color:rgba(216,180,106,.08)}
      html.lavuq-standalone .lavuq-app-hero-top{display:flex;align-items:center;gap:13px;position:relative;z-index:1}
      html.lavuq-standalone .lavuq-app-hero-logo{width:52px;height:52px;object-fit:contain;flex:0 0 auto}
      html.lavuq-standalone .lavuq-app-hero-kicker{color:#d8b46a;font-size:.72rem;font-weight:850;letter-spacing:.15em;text-transform:uppercase}
      html.lavuq-standalone .lavuq-app-hero h2{font-family:Georgia,'Times New Roman',serif;font-size:1.75rem;margin:2px 0 0;color:#fff;font-weight:500}
      html.lavuq-standalone .lavuq-app-hero p{position:relative;z-index:1;color:#dce3eb;line-height:1.5;margin:15px 0 0;font-size:.94rem;max-width:570px}
      html.lavuq-standalone .lavuq-dashboard-strip{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}
      html.lavuq-standalone .lavuq-dashboard-action{appearance:none;border:1px solid #e3d7c1;background:#fff;border-radius:18px;padding:16px 12px;text-align:left;box-shadow:0 8px 22px rgba(4,21,41,.05);cursor:pointer;color:#132033}
      html.lavuq-standalone .lavuq-dashboard-action .ico{display:grid;place-items:center;width:36px;height:36px;border-radius:12px;background:#041529;color:#d8b46a;font-size:1.05rem;margin-bottom:10px}
      html.lavuq-standalone .lavuq-dashboard-action strong{display:block;font-size:.94rem;margin-bottom:4px}
      html.lavuq-standalone .lavuq-dashboard-action small{display:block;color:#6d7684;line-height:1.35}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:first-child{border-color:rgba(216,180,106,.55);box-shadow:0 12px 30px rgba(4,21,41,.07)}
      html.lavuq-standalone #uebersicht>.panel-grid>.card:first-child h2:before{content:"●";color:#61a77b;font-size:.65rem;vertical-align:middle;margin-right:8px}
      html.lavuq-standalone #groupMeta{font-size:.88rem;line-height:1.45}
      html.lavuq-standalone .member{background:#fff;border-color:#e8e1d5}
      html.lavuq-standalone .member.me{background:#fff8e8;border-color:#d8b46a}
      html.lavuq-standalone .quick-grid{gap:10px}
      html.lavuq-standalone .quick{background:#fff;border-color:#e5dccb;box-shadow:0 9px 24px rgba(4,21,41,.05)}
      @media(max-width:760px){html.lavuq-standalone .app-content{padding:12px}html.lavuq-standalone .card{border-radius:18px;padding:18px}html.lavuq-standalone .intro{margin-bottom:14px}html.lavuq-standalone .intro p{margin-bottom:0}html.lavuq-standalone .lavuq-app-hero{padding:18px;border-radius:19px}html.lavuq-standalone .lavuq-app-hero h2{font-size:1.55rem}html.lavuq-standalone .lavuq-dashboard-strip{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}html.lavuq-standalone .lavuq-dashboard-action{padding:13px 9px;border-radius:16px}html.lavuq-standalone .lavuq-dashboard-action .ico{width:33px;height:33px;margin-bottom:8px}html.lavuq-standalone .lavuq-dashboard-action strong{font-size:.82rem}html.lavuq-standalone .lavuq-dashboard-action small{display:none}}
    `;
    head.appendChild(style);

    if(!sessionStorage.getItem('lavuqSplashShown')){
      const splash=document.createElement('div');
      splash.className='lavuq-app-splash';
      splash.setAttribute('aria-hidden','true');
      splash.innerHTML=`<img src="CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png" alt=""><div class="word">LAVUQ</div><div class="city">Würzburg</div><div class="tagline">NEUE KONTAKTE · ECHTE FREUNDSCHAFTEN</div>`;
      document.body.appendChild(splash);
      sessionStorage.setItem('lavuqSplashShown','1');
      window.setTimeout(()=>splash.classList.add('hide'),1050);
      window.setTimeout(()=>splash.remove(),1550);
    }

    const overview=document.querySelector('#uebersicht');
    if(overview && !overview.querySelector('.lavuq-app-hero')){
      const hero=document.createElement('div');
      hero.className='lavuq-app-hero';
      hero.innerHTML=`<div class="lavuq-app-hero-top"><img class="lavuq-app-hero-logo" src="CDB0DD01-2405-4ADE-952F-BBB1CE0EBEBD.png" alt="LAVUQ Q"><div><div class="lavuq-app-hero-kicker">Dein persönlicher Bereich</div><h2>Mein Q</h2></div></div><p>Hier findest du deine Freundesgruppe, euren privaten Chat, die Planung eurer Treffen und den direkten Sicherheitsbereich.</p>`;
      overview.prepend(hero);

      const strip=document.createElement('div');
      strip.className='lavuq-dashboard-strip';
      strip.innerHTML=`
        <button class="lavuq-dashboard-action" type="button" data-go-tab="chat"><span class="ico">💬</span><strong>Chat</strong><small>Mit deiner Gruppe schreiben</small></button>
        <button class="lavuq-dashboard-action" type="button" data-go-tab="treffen"><span class="ico">◷</span><strong>Treffen</strong><small>Termin planen und abstimmen</small></button>
        <button class="lavuq-dashboard-action" type="button" data-go-tab="sicherheit"><span class="ico">🛡</span><strong>Sicherheit</strong><small>Vertraulich LAVUQ erreichen</small></button>`;
      hero.insertAdjacentElement('afterend',strip);
      strip.querySelectorAll('[data-go-tab]').forEach(btn=>btn.addEventListener('click',()=>{
        const original=document.querySelector(`.app-tabs:not(.lavuq-app-bottom-nav) .app-tab[data-tab="${btn.dataset.goTab}"]`);
        if(original) original.click();
      }));
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
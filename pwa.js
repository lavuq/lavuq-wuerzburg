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
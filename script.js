document.querySelectorAll('.brand-mark').forEach(img=>{
  img.src='lavuq-q-square.png?v=full-logo-20260826-2';
  img.style.setProperty('display','block','important');
  img.style.setProperty('visibility','visible','important');
  img.style.setProperty('opacity','1','important');
  img.style.setProperty('width','48px','important');
  img.style.setProperty('height','48px','important');
  img.style.setProperty('object-fit','cover','important');
});

const toggle=document.querySelector('.nav-toggle');
const nav=document.querySelector('.nav');
if(toggle&&nav){
  let backdrop=document.querySelector('.menu-backdrop');
  if(!backdrop){
    backdrop=document.createElement('div');
    backdrop.className='menu-backdrop';
    document.body.appendChild(backdrop);
  }
  const closeMenu=()=>{nav.classList.remove('open');backdrop.classList.remove('open');document.body.classList.remove('menu-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';};
  const openMenu=()=>{nav.classList.add('open');backdrop.classList.add('open');document.body.classList.add('menu-open');toggle.setAttribute('aria-expanded','true');toggle.textContent='✕';};
  toggle.addEventListener('click',()=>nav.classList.contains('open')?closeMenu():openMenu());
  backdrop.addEventListener('click',closeMenu);
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
}
document.querySelectorAll('.faq-q').forEach(btn=>btn.addEventListener('click',()=>btn.parentElement.classList.toggle('open')));
const form=document.querySelector('#applyForm');if(form){let step=0;const steps=[...document.querySelectorAll('.form-step')];const bar=document.querySelector('.progress-bar');const label=document.querySelector('#progressLabel');function show(){steps.forEach((s,i)=>s.classList.toggle('active',i===step));bar.style.width=((step+1)/steps.length*100)+'%';label.textContent=`Schritt ${step+1} von ${steps.length}`;window.scrollTo({top:0,behavior:'smooth'})}document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>{const section=steps[step];const req=[...section.querySelectorAll('[required]')];if(req.some(x=>!x.checkValidity())){req.find(x=>!x.checkValidity())?.reportValidity();return}step=Math.min(step+1,steps.length-1);show()}));document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>{step=Math.max(0,step-1);show()}));form.addEventListener('submit',async(e)=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}const btn=form.querySelector('button[type="submit"]');const original=btn.textContent;btn.disabled=true;btn.textContent='Wird gesendet …';const success=document.querySelector('#formSuccess');const error=document.querySelector('#formError');if(success)success.hidden=true;if(error)error.hidden=true;try{const data=new FormData(form);const res=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data).toString()});if(!res.ok)throw new Error('HTTP '+res.status);form.hidden=true;document.querySelector('.progress-head')?.setAttribute('hidden','');document.querySelector('.progress')?.setAttribute('hidden','');document.querySelector('.application-intro')?.setAttribute('hidden','');if(success){success.hidden=false;success.scrollIntoView({behavior:'smooth',block:'start'})}}catch(err){console.error(err);if(error){error.hidden=false;error.scrollIntoView({behavior:'smooth',block:'start'})}btn.disabled=false;btn.textContent=original}});show()}

if(location.pathname.includes('unsere-regeln')){
  document.querySelectorAll('.card .safety-list .safety-item').forEach(item=>{
    item.style.setProperty('color','#24324a','important');
    item.style.setProperty('opacity','1','important');
  });
}

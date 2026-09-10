(function(){
  if(document.getElementById('home-meinq-size-110-style')) return;
  const style=document.createElement('style');
  style.id='home-meinq-size-110-style';
  style.textContent=`
    @media(max-width:820px){
      .home-meinq-phone{width:min(63vw,273px)!important;}
    }
    @media(max-width:520px){
      .home-meinq-phone{width:min(66vw,258px)!important;}
    }
  `;
  document.head.appendChild(style);
})();

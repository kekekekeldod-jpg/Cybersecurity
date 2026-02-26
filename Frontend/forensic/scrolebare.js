let scrolling = document.getElementById('scrolling');

  function updateScrollbar() {
  let totalHeight;
  if (window.innerWidth > 576) {
    totalHeight = document.body.scrollHeight - window.innerHeight;
  } else {
    totalHeight = document.body.scrollHeight - window.innerHeight;
  }
  
  let progressHeight = (window.pageYOffset / totalHeight) * 100;
  scrolling.style.height = progressHeight + "%";
}

window.addEventListener('resize', updateScrollbar);
window.addEventListener('scroll', updateScrollbar);

updateScrollbar();

if (window.innerWidth > 1050 && !navigator.userAgent.match(/iPad|Macintoshi/i))
{
  const sr = ScrollReveal({
    distance: '65px',
    duration: 2600,
    delay: 450, 
  });

  sr.reveal('.headerForensic', {delay:200, origin:'top'});
  sr.reveal('.forensicSecondWrapper', {delay:200, origin:'left'});
  sr.reveal('.forensicCellebriteWrapper', {delay:200, origin:'bottom'});
  sr.reveal('.forensicSecureSmartphoneWrapper', {
    rotate: {
      x: 130,
      y: 200,
      z: 18
    }
  });
  sr.reveal('.forensicStepsWrapper', {delay:200, origin:'bottom'});
  sr.reveal('.forensicBruteforceWrapper',{
    rotate: {
      x: 90,
      y: 23,
      z: 120
    }
  });
  sr.reveal('.forensicAesWrapper', {delay:200, origin:'right'});
  sr.reveal('.forensicAntiWrapper', {delay:200, origin:'left'});
  sr.reveal('.forensicAntiPixelWrapper', {delay:200, origin:'top'});
  sr.reveal('.forensicAntiSamsungWrapper', {delay:200, origin:'top'});
  sr.reveal('.forensicFazitWrapper', {
    rotate: {
      x: 10,
      y: 0,
      z: 120
    }
  });
  sr.reveal('.forensicOneWrapper', {delay:200, origin:'top'});
  sr.reveal('.forensicTwoWrapper', {
    rotate: {
      x: 120,
      y: 45,
      z: 180
    }
  });
  sr.reveal('.footer-content', {delay:200, origin:'bottom'});
  sr.reveal('.forensicAntiIphonesWrapper', {
    rotate: {
      x: 180,
      y: 0,
      z: 180
    }
  });
};
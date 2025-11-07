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

  sr.reveal('.header-img', {delay:200, origin:'top'});
  sr.reveal('.header-h2', {delay:200, origin:'bottom'});
  sr.reveal('.footer-content', { interval: 600, origin:'top'});
  sr.reveal('.eins, .zwei, .drei, .vier', {
    rotate: {
      x: 180,
      y: 0,
      z: 180
    }
  });
};

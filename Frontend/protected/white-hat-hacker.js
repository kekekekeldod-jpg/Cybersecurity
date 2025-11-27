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

  let typed = new Typed('#element', {
    strings:["JavaScript", "Python", "C / C++", "SQL"],
  typeSpeed:100,
  backSpeed:100,
  loop: true
  });

  
if (window.innerWidth > 1050 && !navigator.userAgent.match(/iPad|Macintoshi/i))
{
  const sr = ScrollReveal({
    distance: '65px',
    duration: 2600,
    delay: 450, 
  });

  sr.reveal('.header-left', {delay:200, origin:'top'});
  sr.reveal('.header-center', {delay:200, origin:'bottom'});
  sr.reveal('.header-right', {delay:200, origin:'right'});
  sr.reveal('.daten-s', {delay:200, interval: 600, origin:'bottom'});
  sr.reveal('.white-hat-hacker-text', {delay:200, origin:'bottom'});
  sr.reveal('.white-hat-hacker-img-wrapper', { delay: 200, origin:'right'});
  sr.reveal('.white-hat-hacker-img-audio', { delay: 200, origin:'right'});
  sr.reveal('.audioarea', {delay:200, origin:'bottom'});
  sr.reveal('.footer-content', { interval: 600, origin:'top'});
  sr.reveal('.physikMath-text', { interval: 600, origin:'top'});
  sr.reveal('.player-ui', {
    rotate: {
      x: 180,
      y: 0,
      z: 180
    }
  });
  sr.reveal('.caney-img-audio-wrapper', {
    rotate: {
      x: 200,
      y: 400,
      z: 300
    }
  });
  sr.reveal('.game-wrapper', {
    rotate: {
      x: 200,
      y: 300,
      z: 0
    }
  })
  sr.reveal('.physikMath-wrapper-album', {
    rotate: {
      x: 100,
      y: 200,
      z: 0
    }
  })
   sr.reveal('.game-btn-wrapper', {
    rotate: {
      x: 100,
      y: 100,
      z: 0
    }
  })
  sr.reveal('.kaliWrapper', {
    rotate: {
      x: 342,
      y: 34,
      z: 0
    }
  })
  sr.reveal('.kaliImage', {
    rotate: {
      x: 143,
      y: 234,
      z: 0
    }
  })
};

 
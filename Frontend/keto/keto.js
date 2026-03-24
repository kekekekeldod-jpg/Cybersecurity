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

// Gun Shot Header-Effect

const narutoOne = document.getElementById('narutoOne');
const narutoTwo = document.getElementById('narutoTwo');
const shotAudio = new Audio('./audios/shot.mp3');


narutoOne.addEventListener("mouseenter", () => { 
  shotAudio.play();
  shotAudio.volume = 1;
});

narutoTwo.addEventListener("mouseenter", () => { 
  shotAudio.play();
  shotAudio.volume = 1;
});

// Scroll Effect Area

if (window.innerWidth > 1050 && !navigator.userAgent.match(/iPad|Macintoshi/i))
{
  const sr = ScrollReveal({
    distance: '65px',
    duration: 2600,
    delay: 450, 
  });

  sr.reveal('.ketoOne', {delay:200, origin:'bottom'});
  sr.reveal('.ketoPlan', {delay:200, origin:'bottom'});
  sr.reveal('.ketoTraining', {delay:200, origin:'bottom'});
  sr.reveal('.footer-content', {delay:200, origin:'bottom'});
  sr.reveal('.scroli', {
    rotate: {
      x: 130,
      y: 200,
      z: 18
    }
  });
 
};
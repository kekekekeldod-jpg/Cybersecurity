const hamburgerWrapper = document.querySelector('.hamburger-effekt');
const navmenu = document.querySelector('.navmenu');   
      
hamburgerWrapper.addEventListener('click', () => { 
    hamburgerWrapper.classList.toggle('active');
    navmenu.classList.toggle('open');
});  
   
document.querySelectorAll('.navmenu a').forEach(link => {
    link.addEventListener('click', () => {
        navmenu.classList.remove('open');
        hamburgerWrapper.classList.remove('active');
    });  
});  

  let typed = new Typed('#element', {
    strings:["Merdo", "Anonym", "Hacker"],
  typeSpeed:70,
  backSpeed:65,
  loop: true
  });
  

  function sendMail() {
    
  emailjs.init("NC1PPG_x1vkOSABdg"); 

  const params = { 
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    phone: document.querySelector("#phone").value,
    date: document.querySelector("#date").value,
    age: document.querySelector("#age").value,
    richtung: document.querySelector("#richtung").value,
    textarea: document.querySelector("#textarea").value,
  };


  const email = params.email.trim();
  if (!email || !isValidEmail(email)) {
    swal({ 
      title: "Schade 🫤",
      text: "Bitte gebe eine gültige E-Mail ein.",
      icon: "error",
      button: "Ok",
    });
    return;
  }

  const serviceID = "service_n794xlw"; 
  const templateID = "template_a7cz5dp";
  
  emailjs.send(serviceID, templateID, params)
    .then(res => {
      if (res.status === 200) {
        swal({
          title: "Sehr gut 🙂",
          text: "Du hast es erfolgreich gesendet",
          icon: "info",
          button: "Ok",
        });
      } else {
        swal({ 
          title: "Schade 🫤",
          text: "Du hast es nicht erfolgreich gesendet",
          icon: "error",
          button: "Ok",
        });
      }
    }) 
    .catch(error => {
      console.error("Error sending email:", error);
    }) 
    .finally(() => {
      document.querySelector("form").reset();
    });
}

function isValidEmail(email) {
  
  return email.includes("@");
}


if (window.innerWidth > 1050 && !navigator.userAgent.match(/iPad|Macintoshi/i)) 
{
  const sr = ScrollReveal({
    distance: '65px',
    duration: 2600,
    delay: 450, 
  });

  sr.reveal('.start-text', {delay:200, origin:'top'});
  sr.reveal('.row1', {delay:200, origin:'bottom'});
  sr.reveal('.cyber', {delay:200, origin:'right'});
  sr.reveal('header .navmenu, .navmenu-right, .logo', {delay:200, interval: 600, origin:'top'});
  sr.reveal('.uber-text', {delay:200, origin:'bottom'});
  sr.reveal('.not', { delay: 200, origin:'left'});
  sr.reveal('.anmelde', {delay:200, origin:'bottom'});
  sr.reveal('form', {delay:200, origin:'bottom'});
  sr.reveal('.abo', {delay:200, origin:'bottom'});
  sr.reveal('.all-buttons', {delay:200, origin:'top'});
  sr.reveal('.heading-effekt p', {delay:200, scale: 2});
  sr.reveal('.box-ti h2', {delay:200, scale: 2});
  sr.reveal('.footer-content', { interval: 600, origin:'top'});
  sr.reveal('.anmeldung-img', {delay:200, origin: 'right'});
  sr.reveal('.box-ti', { delay:200, origin:'bottom'});
  sr.reveal('.canvas-container p, canvas', {delay:200, origin:'bottom'});
  sr.reveal('.earth', {delay:200, origin:'bottom'});
  sr.reveal('.earth-text', {delay:2000, origin:'bottom'});
  sr.reveal('.code-img', {
    rotate: {
      x: 180,
      y: 0,
      z: 180
    }
  });
  sr.reveal('.user-container', {
    rotate: {
      x: 200,
      y: 400,
      z: 300
    }
  });
  sr.reveal('.menu-content',  {
    rotate: {
        x: 2,
        y: 2,
        z: 3
    }
}); 
sr.reveal('.mobileForensicWrapper',  {
    rotate: {
        x: 123,
        y: 342,
        z: 233
    }
}); 
};

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

const buttons = document.querySelectorAll('.button2');

buttons.forEach(btn => {
  btn.addEventListener('click', function(e) {
    let x = e.clientX - e.target.getBoundingClientRect().left;
    let y = e.clientY - e.target.getBoundingClientRect().top;
    
    let ripples = document.createElement('span1');
    ripples.style.left = x + 'px';
    ripples.style.top = y + 'px';
    this.appendChild(ripples);
    
    setTimeout(() => {
      ripples.remove();
    }, 1000); 
  });
});  


let swiperCards = new Swiper(".user-content", {
  loop: true,
  spaceBetween: 32,
  grabCursor: true,

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true,
  },

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  breakpoints:{
    600: {
      slidesPerView: 2,
    },
    968: {
      slidesPerView: 3,
    },
  },
});


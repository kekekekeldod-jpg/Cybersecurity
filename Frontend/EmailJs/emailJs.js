emailjs.init("NC1PPG_x1vkOSABdg");

function sendMail() {
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

  emailjs
    .send("service_n794xlw", "template_a7cz5dp", params)
    .then((res) => {
      swal({
        title: "Sehr gut 🙂",
        text: "Du hast es erfolgreich gesendet",
        icon: "info",
        button: "Ok",
      });
    })
    .catch((error) => {
      console.error(error);
      swal({
        title: "Fehler",
        text: "Senden fehlgeschlagen",
        icon: "error",
      });
    })
    .finally(() => {
      document.querySelector("form").reset();
    });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // verhindert Reload/URL-Query
    sendMail();
  });
});
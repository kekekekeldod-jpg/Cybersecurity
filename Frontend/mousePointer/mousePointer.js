const light = document.querySelector('.cursor-light');

window.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  // der Lichtstreifen
  light.style.transform = `translate(${x - 110}px, ${y - 22}px)`;

  // 🌟 GLITZER-PARTICLE SPWAN
  const sparkle = document.createElement("div");
  sparkle.classList.add("sparkle");

  sparkle.style.left = x + "px";
  sparkle.style.top = y + "px";

  document.body.appendChild(sparkle);

  // wenn animation fertig: entfernen
  setTimeout(() => {
    sparkle.remove();
  }, 600);
});

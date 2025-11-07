document.addEventListener('DOMContentLoaded', () => {
  const player  = document.getElementById('musicPlayer');
  const btn     = document.getElementById('btnaudio');
  const icon    = document.getElementById('iconAudio');
  const label   = document.getElementById('btnLabel');
  const tracks  = Array.from(document.querySelectorAll('.tracklist .track'));

  let selected = document.querySelector('.tracklist .track.selected') || tracks[0];
  if (!selected && tracks[0]) { tracks[0].classList.add('selected'); selected = tracks[0]; }
  if (selected) player.src = selected.dataset.src;

  function setBtnState(isPlaying){
    btn.classList.toggle('playing', isPlaying);
    btn.setAttribute('aria-pressed', String(isPlaying));
    label.textContent = isPlaying ? 'Stop' : 'Play';
    if (icon){
      icon.classList.toggle('fa-Play', !isPlaying);
      icon.classList.toggle('fa-stop',  isPlaying);
    }
  }

  // Titel anklicken = auswählen (ohne sofort zu spielen)
  tracks.forEach(li => {
    li.addEventListener('click', (event) => {
        event.preventDefault();
      if (selected) selected.classList.remove('selected');
      selected = li;
      selected.classList.add('selected');

      if (!player.paused) {
        player.src = selected.dataset.src;
        player.play().catch(console.error);
        tracks.forEach(t => t.classList.remove('playing'));
        selected.classList.add('playing');
      } else {
        player.src = selected.dataset.src;
      }
    });
  });

  // Play/Stop
  btn.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      if (player.paused) {
        if (!player.src && selected) player.src = selected.dataset.src;
        await player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.error(e);
      label.textContent = 'Nochmal klicken';
    }
  });

  // Player-Events → UI sync
  player.addEventListener('playing', () => {
    setBtnState(true);
    tracks.forEach(t => t.classList.remove('playing'));
    if (selected) selected.classList.add('playing');
  });
  player.addEventListener('pause', () => {
    setBtnState(false);
    tracks.forEach(t => t.classList.remove('playing'));
  });
  player.addEventListener('ended', () => {
    setBtnState(false);
    tracks.forEach(t => t.classList.remove('playing'));
  });
});

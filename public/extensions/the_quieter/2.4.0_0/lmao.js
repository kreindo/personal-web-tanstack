const o = document.getElementById('auto-remove-toggle');
const alert = document.getElementById('kagak-boleh');

o.addEventListener('click', () => {
  console.log('poop');
  alert.classList.toggle('kagak', false);
});

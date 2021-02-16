function removeTransition(e) {
   if (e.propertyName !== 'transform') return;
   e.target.classList.remove('active');
 }

 function playSound(e) {
   console.log(e.keyCode);
   const audio = document.querySelector(`audio[data-code="Digit1"]`);
   const key = document.querySelector(`div[data-code="Digit1"]`);
   if (!audio) return;

   key.classList.add('active');
   audio.currentTime = 0;
   audio.play();
 }

 const keys = Array.from(document.querySelectorAll('.keyboard__key'));
 keys.forEach(key => key.addEventListener('transitionend', removeTransition));
 window.addEventListener('keydown', playSound);
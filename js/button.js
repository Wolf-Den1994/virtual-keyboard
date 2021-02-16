setTimeout(function(){
   const show = document.querySelector('body > main > button.button-done.button-show');
   const hide = document.querySelector('body > main > button.button-done.button-hide');
   const keyboardHide = document.querySelector("div.keyboard");
   const textAreaOutput = document.querySelector("textarea.output");

   show.addEventListener('click', () => {
      if(!keyboardHide.classList.contains('hiden')) {
         keyboardHide.classList.add('hiden');
         keyboardHide.style.dislay = 'grid';
      }
   });

   textAreaOutput.addEventListener('click', () => {
      if(!keyboardHide.classList.contains('hiden')) {
         keyboardHide.classList.add('hiden');
         keyboardHide.style.dislay = 'grid';
      }
   });

   hide.addEventListener('click', () => {
      if(keyboardHide.classList.contains('hiden')) {
         keyboardHide.classList.remove('hiden');
         keyboardHide.style.dislay = 'none';
      }
   });
},330)
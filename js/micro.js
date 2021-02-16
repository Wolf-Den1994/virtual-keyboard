setTimeout(function(){
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;  
    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    setInterval(function(){
      if (localStorage.getItem('kbLang') === '"en"') {
        recognition.lang = 'en-US';
      } else {
        recognition.lang = 'ru-RU';    
      }
    },222)
        const output = document.querySelector('.output');
        recognition.addEventListener('result', e => {
          const transcript = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
    
            if (e.results[0].isFinal) {
              output.value += `${transcript}\n`;
            }
            console.log(transcript);
        });
  const micONx = document.querySelector(`div[data-code="Mic"]`);
  micONx.addEventListener('click', () => {
        
    if(micONx.classList.contains('active')) {
      console.log('start mic');
      
          recognition.addEventListener('end', recognition.start);
          recognition.start();
    } else {
      console.log('stop mic');
        recognition.abort();
        recognition.stop();
        recognition.removeEventListener('end', recognition.start);
        recognition.removeEventListener('result', recognition.start);
    }
  });
},530)
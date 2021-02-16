/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */

import * as storage from './storage.js';
import create from './utils/create.js';
import language from './layouts/index.js'; // { en, ru }
import Key from './Key.js';

const main = create('main', '',
  [create('h1', 'title', 'Virtual Keyboard'),
    create('h3', 'subtitle', '<a href="https://virtual-keyboard-cross-check.netlify.app/" target="_blank">Проверку проводите по вот этой форме для кросс-чека (это ссылка)</a>'),
    create('p', 'hint', 'Клавиатуру можно вызвать нажав соответствующую кнопку или на поле ввода. <span class="warningx">Возможно, из-за очень тяжелого кода, клавиатура сразу не откроется, и даже понадобится перезагрузить страницу (небросайтесь тапками, пожалуйста =))</span>'),
    create('p', 'hint', 'Используйте нажатие мыши на <kbd> EN/RU </kbd> для переключения языка. Последний язык сохраняется в localStorage.'),
    create('p', 'hint', 'Используйте нажатие мыши на <kbd> Sound </kbd> для вкл/выкл звука нажатия клавиш.'),
    create('p', 'hint', 'Используйте нажатие мыши на <kbd> Mic </kbd> для голосового ввода. <span class="warning">Важно, прежде чем начать говорить, убедитесь, что выставлен верный язык. Перед сменой языка выключите микрофон, а затем включите снова.</span>'),
    create('button', 'button-done button-show', 'Показать клавиатуру'),
    create('button', 'button-done button-hide', 'Скрыть клавиатуру')]);

export default class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
    this.soundKey = true;
    this.MicKey = false;
    this.isShift = false;
  }

  init(langCode) { // ru, en
    this.keyBase = language[langCode];
    this.output = create('textarea', 'output', null, main,
      ['placeholder', 'Good luck! :)'],
      ['rows', 5],
      ['cols', 50],
      ['spellcheck', false],
      ['autocorrect', 'off']);
    this.container = create('div', 'keyboard', null, main, ['language', langCode]);
    document.body.prepend(main);
    return this;
  }

  generateLayout() {
    this.keyButtons = []; // Key()
    this.rowsOrder.forEach((row, i) => {
      const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.div);
        }
      });
    });
    // При первом пуске активная кнопка sound (2 строки)
    const soundON = document.querySelector(`div[data-code="Sound"]`)
    soundON.classList.add('active');

    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    this.container.onmousedown = this.preHandleEvent;
    this.container.onmouseup = this.preHandleEvent;
  }

  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv; // const code = keyDiv.dataset.code;
    keyDiv.addEventListener('mouseleave', this.resetButtonState);
    this.handleEvent({ code, type: e.type });
  };

  // Ф-я обработки событий

  handleEvent = (e) => {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;
    this.output.focus();
    // НАЖАТИЕ КНОПКИ
    if (type.match(/keydown|mousedown/)) {
      if (!type.match(/mouse/)) e.preventDefault();
      // if (type.match(/key/)) e.preventDefault();

      // if (code.match(/Shift/)) this.shiftKey = true;

      if (code.match(/Sound/)) this.soundKey = !this.soundKey;

      if (code.match(/Mic/)) this.MicKey = !this.MicKey;

      // if (this.shiftKey) this.switchUpperCase(true);

      if (code.match(/Control|Alt|Caps/) && e.repeat) return;

      // Switch language
      if (code.match(/Win/)) this.ctrKey = true;
      // if (code.match(/Alt/)) this.altKey = true; // del

      if (code.match(/Win/)) this.switchLanguage(); // del (&& this.altKey)
      // if (code.match(/Control/) && this.altKey) this.switchLanguage(); // del (&& this.altKey)
      // if (code.match(/Alt/) && this.ctrKey) this.switchLanguage(); // del

      keyObj.div.classList.add('active');

      // Handle Caps down
      if (code.match(/Caps/) && !this.isCaps) {
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/Caps/) && this.isCaps) {
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObj.div.classList.remove('active');
      }

      if (code.match(/Shift/) && !this.isShift) {
        this.shiftKey = true;
        this.isShift = true;
        if (this.isShift) this.switchUpperCase(true);
      } else if (code.match(/Shift/) && this.isShift) {
        this.isShift = false;
        this.shiftKey = false;
        this.switchUpperCase(false);
        keyObj.div.classList.remove('active');
      }

      // Определяем, какой символ мы пишем в консоль (спец или основной)
      if (!this.isCaps) {
        // если не зажат капс, смотрим не зажат ли шифт
        this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
      } else if (this.isCaps) {
        // если зажат капс
        if (this.shiftKey) {
          // и при этом зажат шифт - то для кнопки со спецсимволом даем верхний регистр
          this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        } else {
          // и при этом НЕ зажат шифт - то для кнопки без спецсивмола даем верхний регистр
          this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        }
      }
      this.keysPressed[keyObj.code] = keyObj;
      // release button // ОТЖАТИЕ КНОПКИ
    } else if (e.type.match(/keyup|mouseup/)) {
      this.resetPressedButtons(code); // копи
      if (code.match(/Control/)) this.ctrKey = false;
      if (code.match(/Alt/)) this.altKey = false; // del
      if (code.match(/Caps/) || code.match(/Shift/) ){
        keyObj.div;
      }
      else keyObj.div.classList.remove('active');
    }

    if (this.soundKey) {
      this.sound(e);
      if (code.match(/Sound/)) keyObj.div.classList.add('active');
    }

    if (this.MicKey) {
      // this.micro(e);
      const micON = document.querySelector(`div[data-code="Mic"]`);
      micON.classList.add('active');
    } else if (!this.MicKey) {
      const micON = document.querySelector(`div[data-code="Mic"]`);
      micON.classList.remove('active');
    }
  }

  resetButtonState = ({ target: { dataset: { code } } }) => {
    if (code.match('Shift')) {
      this.shiftKey = false;
      this.switchUpperCase(false);
      this.keysPressed[code].div.classList.remove('active');
    }
    if (code.match(/Control/)) this.ctrKey = false;
    if (code.match(/Alt/)) this.altKey = false;
    this.resetPressedButtons(code);
    this.output.focus();
  }

  resetPressedButtons = (targetCode) => {
    if (!this.keysPressed[targetCode]) return;
    if (!this.isCaps && !this.isShift)  this.keysPressed[targetCode].div
    else if (!this.isCaps || !this.soundKey || !this.MicKey || !this.isShift) this.keysPressed[targetCode].div
    else this.keysPressed[targetCode].div.classList.remove('active');

    this.keysPressed[targetCode].div.removeEventListener('mouseleave', this.resetButtonState);
    delete this.keysPressed[targetCode];
  }

  switchUpperCase(isTrue) {
    // Флаг - чтобы понимать, мы поднимаем регистр или опускаем
    if (isTrue) {
      // Мы записывали наши кнопки в keyButtons, теперь можем легко итерироваться по ним
      this.keyButtons.forEach((button) => {
        // Если у кнопки есть спецсивол - мы должны переопределить стили
        if (button.sub) {
          // Если только это не капс, тогда поднимаем у спецсимволов
          if (this.shiftKey && this.isShift) {
            button.sub.classList.add('sub-active');
            button.letter.classList.add('sub-inactive');
          }
        }

        // Не трогаем функциональные кнопки
        // И если капс, и не шифт, и именно наша кнопка без спецсимвола
        if (!button.isFnKey && this.isCaps && !this.shiftKey && !this.isShift && !button.sub.innerHTML) {
          // тогда поднимаем регистр основного символа letter
          button.letter.innerHTML = button.shift;
          // Если капс и зажат шифт
        } else if (!button.isFnKey && this.isCaps && this.isShift && this.shiftKey) {
          // тогда опускаем регистр для основного симовла letter
          button.letter.innerHTML = button.small;
          // а если это просто шифт - тогда поднимаем регистр у основного символа
          // только у кнопок, без спецсимвола --- там уже выше отработал код для них
        } else if (!button.isFnKey && !button.sub.innerHTML && this.isShift) {
          button.letter.innerHTML = button.shift;
        }
      });
    } else {
      // опускаем регистр в обратном порядке
      this.keyButtons.forEach((button) => {
        // Не трогаем функциональные кнопки
        // Если есть спецсимвол
        if (button.sub.innerHTML && !button.isFnKey) {
          // то возвращаем в исходное
          button.sub.classList.remove('sub-active');
          button.letter.classList.remove('sub-inactive');

          // если не зажат капс
          if (!this.isCaps) {
            // то просто возвращаем основным символам нижний регистр
            button.letter.innerHTML = button.small;
          } else if (!this.isCaps) {
            // если капс зажат - то возвращаем верхний регистр
            button.letter.innerHTML = button.shift;
          }
        // если это кнопка без спецсимвола (снова не трогаем функциональные)
        } else if (!button.isFnKey) {
          // то если зажат капс
          if (this.isCaps) {
            // возвращаем верхний регистр
            button.letter.innerHTML = button.shift;
          } else {
            // если отжат капс - возвращаем нижний регистр
            button.letter.innerHTML = button.small;
          }
        }
      });
    }
  }

  switchLanguage = () => {
    const langAbbr = Object.keys(language); // ['en', 'ru']
    let langIdx = langAbbr.indexOf(this.container.dataset.language); // 1
    this.keyBase = langIdx + 1 < langAbbr.length ? language[langAbbr[langIdx += 1]]
      : language[langAbbr[langIdx -= langIdx]];

    this.container.dataset.language = langAbbr[langIdx];
    storage.set('kbLang', langAbbr[langIdx]);

    this.keyButtons.forEach((button) => {
      const keyObj = this.keyBase.find((key) => key.code === button.code);
      if (!keyObj) return;
      button.shift = keyObj.shift;
      button.small = keyObj.small;
      if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
        button.sub.innerHTML = keyObj.shift;
      } else {
        button.sub.innerHTML = '';
      }
      button.letter.innerHTML = keyObj.small;
    });

    if (this.isCaps) this.switchUpperCase(true);
  }

  printToOutput(keyObj, symbol) {
    let cursorPos = this.output.selectionStart;
    const left = this.output.value.slice(0, cursorPos);
    const right = this.output.value.slice(cursorPos);

    const textHandlers = {
      Tab: () => {
        this.output.value = `${left}\t${right}`;
        cursorPos += 1;
      },
      ArrowLeft: () => {
        cursorPos = cursorPos - 1 >= 0 ? cursorPos - 1 : 0;
      },
      ArrowRight: () => {
        cursorPos += 1;
      },
      ArrowUp: () => {
        const positionFromLeft = this.output.value.slice(0, cursorPos).match(/(\n).*$(?!\1)/g) || [[1]];
        cursorPos -= positionFromLeft[0].length;
      },
      ArrowDown: () => {
        const positionFromLeft = this.output.value.slice(cursorPos).match(/^.*(\n).*(?!\1)/) || [[1]];
        cursorPos += positionFromLeft[0].length;
      },
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursorPos += 1;
      },
      Del: () => {
        this.output.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => {
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursorPos -= 1;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursorPos += 1;
      },
    };
    if (textHandlers[keyObj.code]) textHandlers[keyObj.code]();
    else if (!keyObj.isFnKey) {
      cursorPos += 1;
      this.output.value = `${left}${symbol || ''}${right}`;
    }
    this.output.setSelectionRange(cursorPos, cursorPos);
  }

  sound(e) {
    function removeTransition(e) {
      if (e.propertyName !== 'transform') return;
      // e.target.classList.remove('active');
    }
  
    function playSound(e) {
      // console.log(e);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        const audio = document.querySelector(`audio[data-key="Digit1"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else if (e.code === 'CapsLock') {
        const audio = document.querySelector(`audio[data-key="Digit2"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else if (e.code === 'Backspace') {
        const audio = document.querySelector(`audio[data-key="Digit3"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else if (e.code === 'Enter') {
        const audio = document.querySelector(`audio[data-key="Digit4"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else if (e.code === 'Space') {
        const audio = document.querySelector(`audio[data-key="Digit5"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else if (e.code === 'Sound' || e.code === 'Win') {
        const audio = document.querySelector(`audio[data-key="Digit6"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else if (e.code === 'ControlLeft' || 
        e.code === 'ControlRight' || 
        e.code === 'AltLeft' || 
        e.code === 'AltRight') {
        const audio = document.querySelector(`audio[data-key="Digit7"]`);
        const key = document.querySelector(`div[data-code="${e.code}"]`);
        if (!audio) return;
    
        // key.classList.add('active');
        audio.currentTime = 0.1;
        audio.play();
      } else {
        if (localStorage.getItem('kbLang') === '"en"') {
          const audio = document.querySelector(`audio[data-key="Digit8"]`);
          const key = document.querySelector(`div[data-code="${e.code}"]`);
          if (!audio) return;
      
          // key.classList.add('active');
          audio.currentTime = 0.1;
          audio.play();
        } else {
          const audio = document.querySelector(`audio[data-key="Digit9"]`);
          const key = document.querySelector(`div[data-code="${e.code}"]`);
          if (!audio) return;
      
          // key.classList.add('active');
          audio.currentTime = 0.2;
          audio.play();
        }  
      }
    }
  
    const keys = Array.from(document.querySelectorAll('.keyboard__key'));
    keys.forEach(key => key.addEventListener('transitionend', removeTransition));
    playSound(e);
  }

  micro() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    // recognition.lang = 'ru-RU';

    recognition.addEventListener('result', e => {
      console.log('заходи сюда нууу');
      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

        if (e.results[0].isFinal) {
          this.output.value += `${transcript}\n`;
        }
        console.log(transcript);
    });

    // if (this.MicKey) {
      recognition.addEventListener('end', recognition.start);
      recognition.start();
    // } else {
    //   recognition.removeEventListener('end', recognition.start);
    //   recognition.start();
    // }
  } 
}

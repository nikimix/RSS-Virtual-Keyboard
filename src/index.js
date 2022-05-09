import './scss/index.scss';
import keyboardData from './modules/keyboard-data';
import createPage from './modules/page';

createPage();

const keyboard = document.querySelector('.keyboard');
const output = document.querySelector('.output');
const keyElements = keyboard.querySelectorAll('.key');
const caseWatcher = new Set();
const langWatcher = new Set();
let selectionPos = 0;

function preventDefault(evt) {
  evt.preventDefault();
}

function getKeyId(evt) {
  return evt.type === 'keydown' || evt.type === 'keyup' ? evt.code : evt.target.id;
}

function isClickForButton(evt) {
  if (evt.type === 'mousedown') {
    return !!keyboardData[evt.target.id];
  }
  return true;
}

function isControlKey(evt) {
  const keyId = getKeyId(evt);
  return !!keyboardData[keyId]?.control;
}

function isKeyboardKey(evt) {
  const keyId = getKeyId(evt);
  return !!keyboardData[keyId];
}

function isKey(evt, keyName) {
  return evt.code === keyName || evt.target.id === keyName;
}

function isKeyDown(evt) {
  return evt.type === 'keydown' || evt.type === 'mousedown';
}

function isKeyUp(evt) {
  return evt.type === 'keyup' || evt.type === 'mouseup';
}

function changeButtonView(evt) {
  if (!isClickForButton(evt) || !isKeyboardKey(evt)) return;
  const keyId = getKeyId(evt);
  const currentKey = keyboard.querySelector(`#${keyId}`);

  if (keyboardData[keyId]?.toggler) {
    if ((evt.type === 'keydown' || evt.type === 'mousedown') && !evt.repeat) {
      currentKey.classList.toggle('active');
    }
  } else if (evt.type === 'keydown') {
    if (!evt.repeat) {
      currentKey.classList.toggle('active');
    }
  } else if (evt.type === 'keyup') {
    currentKey.classList.toggle('active');
  }
}

function changeKeyboardSymbols(elements, data, lang, register) {
  for (let i = 0; i < elements.length; i += 1) {
    const item = elements[i];
    if (data[item.id][lang][register]) {
      item.textContent = data[item.id][lang][register];
    }
  }
}

function setCase(evt) {
  const keyId = getKeyId(evt);

  if (isKeyDown(evt) && !evt.repeat) {
    if (isKey(evt, 'ShiftLeft') || isKey(evt, 'ShiftRight')) {
      caseWatcher.add(keyId);
    } else if (isKey(evt, 'CapsLock')) {
      if (caseWatcher.has(keyId)) {
        caseWatcher.delete(keyId);
      } else {
        caseWatcher.add(keyId);
      }
    }
    if (caseWatcher.size === 2) {
      changeKeyboardSymbols(keyElements, keyboardData, sessionStorage.getItem('lang'), 'shiftCaps');
    } else if ((caseWatcher.has('ShiftLeft') || caseWatcher.has('ShiftRight')) && !evt.repeat) {
      changeKeyboardSymbols(keyElements, keyboardData, sessionStorage.getItem('lang'), 'caseUp');
    } else if (caseWatcher.has('CapsLock') && !evt.repeat) {
      changeKeyboardSymbols(keyElements, keyboardData, sessionStorage.getItem('lang'), 'caps');
    } else {
      changeKeyboardSymbols(keyElements, keyboardData, sessionStorage.getItem('lang'), 'caseDown');
    }
  } else if (isKeyUp(evt) && (keyId === 'ShiftLeft' || keyId === 'ShiftRight')) {
    caseWatcher.delete(keyId);

    if (caseWatcher.has('CapsLock')) {
      changeKeyboardSymbols(keyElements, keyboardData, sessionStorage.getItem('lang'), 'caps');
    } else {
      changeKeyboardSymbols(keyElements, keyboardData, sessionStorage.getItem('lang'), 'caseDown');
    }
  }
}

function toggleLayout(evt) {
  const keyId = getKeyId(evt);
  langWatcher.add(keyId);

  if (isKeyDown(evt) && !evt.repeat) {
    if (langWatcher.has('ControlLeft') && langWatcher.has('AltLeft')) {
      const keyboardCase = caseWatcher.size ? 'caps' : 'caseDown';
      const lang = sessionStorage.getItem('lang') === 'en' ? 'ru' : 'en';

      changeKeyboardSymbols(keyElements, keyboardData, lang, keyboardCase);

      sessionStorage.setItem('lang', lang);
    }
  } else if (isKeyUp(evt)) {
    langWatcher.delete(keyId);
  }
}

function addSymbol(evt) {
  if (isControlKey(evt) && !(isKey(evt, 'Tab') || isKey(evt, 'Space'))) return;
  let text = null;

  if (evt.type === 'keydown' && isKeyboardKey(evt)) {
    text = keyboard.querySelector(`#${evt.code}`).textContent;

    if (isKey(evt, 'Tab') || isKey(evt, 'Space')) {
      text = evt.code === 'Tab' ? '\t' : ' ';
    }

    output.setRangeText(text, selectionPos, selectionPos, 'end');
    selectionPos += 1;
  }
  if (evt.type === 'mousedown' && isClickForButton(evt)) {
    text = evt.target.textContent;

    if (isKey(evt, 'Tab') || isKey(evt, 'Space')) {
      text = evt.target.id === 'Tab' ? '\t' : ' ';
    }

    output.setRangeText(text, selectionPos, selectionPos, 'end');
    selectionPos += 1;
  }
}

function removePreviousSymbol(evt) {
  if (!isClickForButton(evt) || !isKeyboardKey(evt)) return;
  const keyId = getKeyId(evt);
  const currentKey = keyboard.querySelector(`#${keyId}`);

  if (isKeyDown(evt) && (keyId === 'Backspace' || currentKey === 'Backspace') && selectionPos !== 0) {
    output.value = output.value.slice(0, selectionPos - 1) + output.value.slice(selectionPos);
    selectionPos -= 1;
    output.setSelectionRange(selectionPos, selectionPos);
  }
}

function removeNextSymbol(evt) {
  if (!isClickForButton(evt) || !isKeyboardKey(evt)) return;

  const keyId = getKeyId(evt);
  const currentKey = keyboard.querySelector(`#${keyId}`);

  if (isKeyDown(evt)
    && (keyId === 'Delete' || currentKey === 'Delete')
    && selectionPos !== output.value.length) {
    const fistPart = output.value.slice(0, selectionPos);
    const twoPart = output.value.slice(selectionPos + 1);

    output.value = fistPart + twoPart;
    output.setSelectionRange(selectionPos, selectionPos);
  }
}

function goToNextRow(evt) {
  if (!isClickForButton(evt) || !isKeyboardKey(evt)) return;
  if (evt.type === 'keydown' && evt.code === 'Enter') {
    output.setRangeText('\n', selectionPos, selectionPos, 'end');
    selectionPos += 1;
  }
  if (evt.type === 'mousedown' && evt.target.id === 'Enter') {
    output.setRangeText('\n', selectionPos, selectionPos, 'end');
    selectionPos += 1;
  }
}

function getCurrentRowSymbol(text) {
  let rowPos = 0;
  let itemIndex = 0;

  for (let i = 0; i < text.length; i += 1) {
    for (let j = 0; j < text[i].length; j += 1) {
      if (selectionPos === itemIndex) return [rowPos, 0];
      itemIndex += 1;
      if (selectionPos === itemIndex) return [rowPos, j + 1];
    }
    itemIndex += 1;
    rowPos += 1;
    if (selectionPos === itemIndex) return [rowPos, 0];
  }
  return undefined;
}

function moveCaret(evt) {
  if (!isClickForButton(evt) || !isKeyboardKey(evt)) return;
  const rows = output.value.split('\n');

  if (isKeyDown(evt)) {
    if (isKey(evt, 'ArrowLeft') && selectionPos !== 0) {
      selectionPos -= 1;
      output.setSelectionRange(selectionPos, selectionPos);
    }
    if (isKey(evt, 'ArrowRight') && selectionPos !== output.value.length) {
      selectionPos += 1;
      output.setSelectionRange(selectionPos, selectionPos);
    }
    if (isKey(evt, 'ArrowUp') && rows !== 0 && selectionPos !== 0) {
      const [rowPos, symbolPos] = getCurrentRowSymbol(rows);

      if (rowPos !== 0 && symbolPos <= rows[rowPos - 1].length) {
        selectionPos -= rows[rowPos - 1].length + 1;
        output.setSelectionRange(selectionPos, selectionPos);
      } else if (rowPos !== 0 && symbolPos > rows[rowPos - 1].length) {
        selectionPos -= symbolPos + 1;
        output.setSelectionRange(selectionPos, selectionPos);
      }
    }
    if (isKey(evt, 'ArrowDown')) {
      const [rowPos, symbolPos] = getCurrentRowSymbol(rows);
      if (rowPos !== rows.length - 1 && symbolPos <= rows[rowPos + 1].length) {
        selectionPos += +rows[rowPos].length + 1;
        output.setSelectionRange(selectionPos, selectionPos);
      } else if (rowPos !== rows.length - 1 && symbolPos > rows[rowPos + 1].length) {
        selectionPos += rows[rowPos].length - symbolPos + rows[rowPos + 1].length + 1;
        output.setSelectionRange(selectionPos, selectionPos);
      }
    }
  }
}

function setSelectPos(evt) {
  if (evt.target.closest('.output')) {
    selectionPos = evt.target.selectionStart;
  }
}

function onPressKey(evt) {
  preventDefault(evt);
  changeButtonView(evt);
  setCase(evt);
  addSymbol(evt);
  toggleLayout(evt);
  removePreviousSymbol(evt);
  removeNextSymbol(evt);
  goToNextRow(evt);
  moveCaret(evt);
  output.blur();
  output.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', onPressKey);
  document.addEventListener('keyup', onPressKey);
  keyboard.addEventListener('mousedown', onPressKey);
  keyboard.addEventListener('mouseup', onPressKey);
  document.addEventListener('click', setSelectPos);
});

import createElement from './util';
import keyboardData from './keyboard-data';
import keyboardTemplate from './keyboard-template';

function createKeyboard(template) {
  if (!template) return undefined;

  if (!sessionStorage.length) {
    sessionStorage.setItem('lang', 'en');
  }

  const lang = sessionStorage.getItem('lang');
  const fragment = document.createDocumentFragment();
  let rowElement = null;
  let content = null;
  let className = null;

  template.forEach((rowTemplate) => {
    rowElement = createElement('div', ['row']);

    rowTemplate.forEach((keyTemplate) => {
      content = keyboardData[keyTemplate][lang].caseDown; // Set lang from session storage
      className = keyboardData[keyTemplate]?.control ? 'key key-control' : 'key';
      rowElement.insertAdjacentHTML('beforeend', `<button class="${className}" id="${keyTemplate}" type="button">${content}</button>`);
    });

    fragment.append(rowElement);
  });

  return fragment;
}

export default function createPage() {
  const wrapper = createElement('div', ['wrapper']);
  const title = createElement('h1', ['main_title'], 'RSS Virtual keyboard');
  const output = createElement('textarea', ['output']);
  const keyboard = createElement('div', ['keyboard']);
  const noteLayout = createElement('p', ['note'], 'Change keyboard layout left: Ctrl + Alt');
  const noteSystem = createElement('p', ['note'], 'Keyboard is created for operating system windows');
  keyboard.append(createKeyboard(keyboardTemplate));
  wrapper.append(title, output, keyboard, noteLayout, noteSystem);
  document.body.append(wrapper);
}

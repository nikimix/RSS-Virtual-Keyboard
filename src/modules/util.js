export default function createElement(tagName, className, content, attribute) {
  const element = document.createElement(tagName);
  if (Array.isArray(className)) {
    element.classList.add(...className);
  }
  if (content) {
    element.textContent = content;
  }
  if (attribute) {
    element.setAttribute(...attribute);
  }
  return element;
}

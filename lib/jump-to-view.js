'use babel';

export default class JumpToView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('jump-to');

    const header = document.createElement('header');
    header.classList.add('header')

    const inputBlock = document.createElement('section');
    inputBlock.classList.add('input-block', 'jump-to-container')

    const inputBlockItem = document.createElement('div');
    inputBlockItem.classList.add('input-block-item', 'editor-container')

    const editor = document.createElement('atom-text-editor');
    editor.setAttribute('mini', true)

    this.element.appendChild(header);
    this.element.appendChild(inputBlock);

    inputBlock.appendChild(inputBlockItem)
    inputBlockItem.appendChild(editor)
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getEditor() {
    return this.element.querySelector('atom-text-editor');
  }

  setLabel(mode) {
    const header = this.element.querySelector('header.header');
    header.textContent = mode === 'jump'
      ? 'Jump to...'
      : 'Expand selection to...'
  }
}

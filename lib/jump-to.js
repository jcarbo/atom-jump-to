'use babel';

import JumpToView from './jump-to-view';
import { CompositeDisposable } from 'atom';

const MAX_COLUMN = 1000000

export default {
  inputPanel: null,
  jumpToEditor: null,
  jumpToElement: null,
  jumpToView: null,
  mode: null,
  subscriptions: null,

  activate(state) {
    this.jumpToView = new JumpToView(state.jumpToViewState);

    this.jumpToEditor = this.jumpToView.getEditor()
    this.jumpToElement = this.jumpToView.getElement()

    this.inputPanel = atom.workspace.addBottomPanel({
      item: this.jumpToView.getElement()
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.handleEditorEvents()

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'jump-to:jump': () => this.showEditor('jump'),
      'jump-to:expand': () => this.showEditor('expand')
    }));

    this.subscriptions.add(atom.commands.add(this.jumpToEditor, {
      'core:confirm': () => this.execute(),
    }));

    this.subscriptions.add(atom.commands.add(this.jumpToEditor, {
      'core:close': () => this.hideEditor(),
      'core:cancel': () => this.hideEditor()
    }));
  },

  deactivate() {
    this.inputPanel.destroy();
    this.subscriptions.dispose();
    this.jumpToView.destroy();
  },

  serialize() {
    return {
      jumpToViewState: this.jumpToView.serialize()
    };
  },

  handleChange() {
    console.log(this.jumpToEditor.getModel().getText())
  },

  handleEditorEvents() {
    this.jumpToEditor.getModel().onDidStopChanging(() => this.handleChange())
  },

  focusEditor() {
    this.jumpToEditor.focus()
    this.jumpToEditor.getModel().selectAll()
  },

  showEditor(mode) {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) return

    this.mode = mode

    this.jumpToView.setLabel(mode)
    this.inputPanel.show()
    this.focusEditor()
  },

  hideEditor() {
    this.inputPanel.hide()
    atom.views.getView(atom.workspace).focus()
  },

  getColumnsToMove(point) {
    const { row, column } = point
    const editor = atom.workspace.getActiveTextEditor()
    const jumpToText = this.jumpToEditor.getModel().getText()
    const lineText = editor.getTextInBufferRange([[row, column], [row,  MAX_COLUMN]])

    return lineText.indexOf(jumpToText)
  },

  execute() {
    this.mode === 'jump' ? this.jump() : this.expand()
    this.hideEditor()
  },

  jump() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) return

    editor.getCursors().forEach((cursor) => {
      const point = cursor.getBufferPosition()
      const columnsToMove = this.getColumnsToMove(point)

      if (columnsToMove > 0) {
        cursor.moveRight(columnsToMove)
      }
    })
  },

  expand() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) return

    editor.getSelections().forEach((selection) => {
      const { start, end } = selection.getBufferRange()
      const columnsToMove = this.getColumnsToMove(end)

      if (columnsToMove > 0) {
        selection.selectRight(columnsToMove)
      }
    })
  }
};

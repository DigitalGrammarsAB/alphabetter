'use babel'
/* global atom */

import AlphabetterView from './alphabetter-view'
import { CompositeDisposable } from 'atom'

export default {

  subscriptions: null,
  statusBarView: null,
  statusBarTile: null,

  // Config keys
  keys: {
    force: 'force-ltr.enabled',
    unjoin: 'unjoin-characters.enabled',
    highlight: 'highlight-hidden-characters.enabled'
  },

  // CSS classes
  classes: {
    force: 'force-ltr',
    unjoin: 'unjoin-characters',
    highlight: 'highlight-hidden-characters'
  },

  // Observers
  observers: {
    force: new CompositeDisposable(),
    unjoin: new CompositeDisposable(),
    highlight: new CompositeDisposable()
  },

  // Layers
  layers: {
    unjoin: [],
    highlight: []
  },

  // Invoked on Atom startup and when package is activated
  // `state` is something returned by `serialize()` below
  activate (state) {
    this.statusBarView = new AlphabetterView(state)

    // Register commands
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'alphabetter:toggle-force-ltr': () => this.toggleForceLTR(),
      'alphabetter:toggle-unjoin-characters': () => this.toggleUnjoinCharacters(),
      'alphabetter:toggle-highlight-hidden-characters': () => this.toggleHighlightHiddenCharacters()
    }))

    // Recreate observers
    if (state.force) this.enableForceLTR()
    if (state.unjoin) this.enableUnjoinCharacters()
    if (state.highlight) this.enableHighlightHiddenCharacters()
  },

  // Add tile to status bar
  consumeStatusBar (statusBar) {
    this.statusBarTile = statusBar.addLeftTile({
      item: this.statusBarView,
      priority: 100
    })
  },

  // Invoked on Atom shutdown and when package is deactivated
  deactivate () {
    this.subscriptions.dispose()
    this.statusBarView.destroy()
    if (this.statusBarTile) {
      this.statusBarTile.destroy()
    }
  },

  // Invoked on Atom shutdown and when package is deactivated
  serialize () {
    return {
      force: atom.config.get(this.keys.force, false),
      unjoin: atom.config.get(this.keys.unjoin, false),
      highlight: atom.config.get(this.keys.highlight, false)
    }
  },

  // ---------------------------------------------------------------------------
  // Force LTR

  enableForceLTR () {
    let observer = atom.workspace.observeTextEditors(editor =>
      // Invoked on all current and future text editors in the workspace.
      atom.views.getView(editor).classList.add(this.classes.force)
    )
    this.observers.force.add(observer)
    atom.config.set(this.keys.force, true)
  },

  disableForceLTR () {
    this.observers.force.dispose()
    this.observers.force.clear() // maybe unnecessary
    atom.workspace.getTextEditors().forEach(editor =>
      atom.views.getView(editor).classList.remove(this.classes.force)
    )
    atom.config.set(this.keys.force, false)
  },

  toggleForceLTR () {
    let enabled = atom.config.get(this.keys.force, false)
    if (!enabled) {
      this.enableForceLTR()
    } else {
      this.disableForceLTR()
    }
    this.statusBarView.update(this.serialize())
  },

  // ---------------------------------------------------------------------------
  // Join/unjoin Arabic characters

  enableUnjoinCharacters () {
    let observer = atom.workspace.observeTextEditors(editor => {
      // create layer once per editor
      let layer = editor.addMarkerLayer()
      this.layers.unjoin.push(layer)

      // perform unjoining now and for every character change
      let unjoin = () => {
        layer.clear()
        editor.scan(/[\u0600-\u06FF\u2000-\u200F]/g, obj => {
          layer.markBufferRange(obj.range)
        })
        editor.decorateMarkerLayer(layer, {
          type: 'text',
          class: this.classes.unjoin
        })
      }
      unjoin()
      let observer = editor.onDidStopChanging(unjoin)
      this.observers.unjoin.add(observer)
    })
    this.observers.unjoin.add(observer)
    atom.config.set(this.keys.unjoin, true)
  },

  disableUnjoinCharacters () {
    this.observers.unjoin.dispose()
    this.observers.unjoin.clear() // maybe unnecessary
    this.layers.unjoin.forEach(layer => layer.destroy())
    this.layers.unjoin = []
    atom.config.set(this.keys.unjoin, false)
  },

  toggleUnjoinCharacters () {
    let enabled = atom.config.get(this.keys.unjoin, false)
    if (!enabled) {
      this.enableUnjoinCharacters()
    } else {
      this.disableUnjoinCharacters()
    }
    this.statusBarView.update(this.serialize())
  },

  // ---------------------------------------------------------------------------
  // Highlight hidden characters

  enableHighlightHiddenCharacters () {
    let observer = atom.workspace.observeTextEditors(editor => {
      // create layer once per editor
      let layer = editor.addMarkerLayer()
      this.layers.highlight.push(layer)

      // perform highlighting now and for every character change
      let highlight = () => {
        layer.clear()
        editor.scan(/[\u2000-\u200F]/g, obj => {
          layer.markBufferRange(obj.range)
        })
        editor.decorateMarkerLayer(layer, {
          type: 'text',
          class: this.classes.highlight
        })
      }
      highlight()
      let observer = editor.onDidStopChanging(highlight)
      this.observers.highlight.add(observer)
    })
    this.observers.highlight.add(observer)
    atom.config.set(this.keys.highlight, true)
  },

  disableHighlightHiddenCharacters () {
    this.observers.highlight.dispose()
    this.observers.highlight.clear() // maybe unnecessary
    this.layers.highlight.forEach(layer => layer.destroy())
    this.layers.highlight = []
    atom.config.set(this.keys.highlight, false)
  },

  toggleHighlightHiddenCharacters () {
    let enabled = atom.config.get(this.keys.highlight, false)
    if (!enabled) {
      this.enableHighlightHiddenCharacters()
    } else {
      this.disableHighlightHiddenCharacters()
    }
    this.statusBarView.update(this.serialize())
  }

}

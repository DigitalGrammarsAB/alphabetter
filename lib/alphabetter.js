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

  // Invoked on Atom startup and when package is activated
  // `state` is something returned by `serialize()` below
  activate (state) {
    this.statusBarView = new AlphabetterView(state)

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable()

    // Register commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'alphabetter:toggle-force-ltr': () => this.toggleForceLTR(),
      'alphabetter:toggle-unjoin-characters': () => this.toggleUnjoinCharacters(),
      'alphabetter:toggle-highlight-hidden-characters': () => this.toggleHighlightHiddenCharacters()
    }))

    // Recreate observers
    if (state.force) {
      this.enableForceLTR()
    }
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
    this.statusBarView = null

    this.statusBarTile.destroy()
    this.statusBarTile = null
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

  forceLTRObservers: [],

  enableForceLTR () {
    let observer = atom.workspace.observeTextEditors(editor =>
      // Invoked on all current and future text editors in the workspace.
      atom.views.getView(editor).classList.add(this.classes.force)
    )
    this.forceLTRObservers.push(observer)
    atom.config.set(this.keys.force, true)
  },

  disableForceLTR () {
    this.forceLTRObservers.forEach(observer => observer.dispose())
    this.forceLTRObservers = []
    atom.workspace.getTextEditors().forEach(editor =>
      atom.views.getView(editor).classList.remove(this.classes.force)
    )
    atom.config.set(this.keys.force, false)
  },

  // Invoked from UI
  toggleForceLTR () {
    let enabled = atom.config.get(this.keys.force, false)

    // If no observers, override enabled value
    if (this.forceLTRObservers.length === 0) {
      enabled = false
    }

    if (!enabled) {
      this.enableForceLTR()
    } else {
      this.disableForceLTR()
    }

    // Update indicator view
    this.statusBarView.update(this.serialize())
  },

  // ---------------------------------------------------------------------------
  // Join/unjoin Arabic characters

  unjoinObservers: [],
  unjoinLayers: [],

  toggleUnjoinCharacters () {
    let enabled = atom.config.get(this.keys.unjoin, false)

    // If no observers/layers, override enabled value
    if ((this.unjoinObservers.length === 0) && (this.unjoinLayers === 0)) {
      enabled = false
    }

    if (!enabled) {
      var observer = atom.workspace.observeTextEditors((editor) => {
        // create layer once per editor
        let layer = editor.addMarkerLayer()
        this.unjoinLayers.push(layer)

        let unjoin = () => {
          layer.clear()
          editor.scan(/[\u0600-\u06FF\u2000-\u200F]/g, (obj) => {
            layer.markBufferRange(obj.range)
          })
          editor.decorateMarkerLayer(layer, {
            type: 'text',
            class: this.classes.unjoin
          })
        }

        // perform unjoining now and for every character change
        unjoin()
        // If too expensive, use: editor.onDidStopChanging
        observer = editor.onDidChange(unjoin)
        this.unjoinObservers.push(observer)
      })
      this.unjoinObservers.push(observer)
    } else {
      this.unjoinObservers.forEach(observer => observer.dispose())
      this.unjoinLayers.forEach(layer => layer.destroy())
      this.unjoinObservers = []
      this.unjoinLayers = []
    }

    atom.config.set(this.keys.unjoin, !enabled)
    this.statusBarView.update(this.serialize())
  },

  // ---------------------------------------------------------------------------
  // Highlight hidden characters

  hiddenCharObservers: [],
  hiddenCharLayers: [],

  toggleHighlightHiddenCharacters () {
    let enabled = atom.config.get(this.keys.highlight, false)

    // If no observers/layers, override enabled value
    if ((this.hiddenCharObservers.length === 0) && (this.hiddenCharLayers === 0)) {
      enabled = false
    }

    if (!enabled) {
      let observer = atom.workspace.observeTextEditors((editor) => {
        // create layer once per editor
        let layer = editor.addMarkerLayer()
        this.hiddenCharLayers.push(layer)

        let highlight = () => {
          layer.clear()
          editor.scan(/[\u2000-\u200F]/g, (obj) => {
            layer.markBufferRange(obj.range)
          })
          editor.decorateMarkerLayer(layer, {
            type: 'text',
            class: this.classes.highlight
          })
        }

        // perform highlighting now and for every character change
        highlight()
        // If too expensive, use: editor.onDidStopChanging
        let observer = editor.onDidChange(highlight)
        this.hiddenCharObservers.push(observer)
      })
      this.hiddenCharObservers.push(observer)
    } else {
      this.hiddenCharObservers.forEach(observer => observer.dispose())
      this.hiddenCharLayers.forEach(layer => layer.destroy())
      this.hiddenCharObservers = []
      this.hiddenCharLayers = []
    }

    atom.config.set(this.keys.highlight, !enabled)
    this.statusBarView.update(this.serialize())
  }

}

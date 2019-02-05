'use babel'
/* global atom */

export default class AlphabetterView {
  constructor (serializedState) {
    this.element = document.createElement('div')
    this.element.classList.add('alphabetter', 'inline-block')

    let config = [
      { name: 'force', icon: 'arrow-right' },
      { name: 'unjoin', icon: 'mirror' },
      { name: 'highlight', icon: 'eye' }
    ]

    this.buttons = {}
    for (let c of config) {
      let elem = document.createElement('span')
      elem.classList.add('icon', 'icon-' + c.icon)
      elem.addEventListener('click', () => {
        let target = atom.views.getView(atom.workspace)
        switch (c.name) {
          case 'force':
            atom.commands.dispatch(target, 'alphabetter:toggle-force-ltr')
            break
          case 'unjoin':
            atom.commands.dispatch(target, 'alphabetter:toggle-unjoin-characters')
            break
          case 'highlight':
            atom.commands.dispatch(target, 'alphabetter:toggle-highlight-hidden-characters')
            break
        }
      })
      this.element.appendChild(elem)
      this.buttons[c.name] = elem
    }

    this.update(serializedState)
  }

  // Called from parent
  update (serializedState) {
    for (let name in this.buttons) {
      let elem = this.buttons[name]
      if (serializedState[name]) {
        elem.classList.add('active')
      } else {
        elem.classList.remove('active')
      }
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize () {}

  // Tear down any state and detach
  destroy () {
    this.element.remove()
  }

  getElement () {
    return this.element
  }
}

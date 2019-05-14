'use babel'
/* global atom */

export default class AlphabetterView {
  constructor (state) {
    this.element = document.createElement('div')
    this.element.classList.add('alphabetter-view', 'inline-block')

    let config = [
      { name: 'force', icon: 'arrow-right', title: 'Toggle force LTR' },
      { name: 'unjoin', icon: 'mirror', title: 'Toggle unjoin characters' },
      { name: 'highlight', icon: 'eye', title: 'Toggle highlight hidden characters' }
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
      atom.tooltips.add(elem, {
        title: c.title
      })
    }

    this.update(state)
  }

  // Also called from parent when state changes
  update (state) {
    for (let name in this.buttons) {
      let elem = this.buttons[name]
      if (state[name]) {
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

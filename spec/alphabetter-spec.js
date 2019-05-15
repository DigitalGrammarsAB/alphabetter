'use babel'
/* eslint-disable no-undef */

import Alphabetter from '../lib/alphabetter'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Alphabetter', () => {
  let workspaceElement, activationPromise // eslint-disable-line no-unused-vars

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('alphabetter')
  })

  describe('when the alphabetter:toggle-force-ltr is triggered', () => {
    it('toggles the force-ltr class', () => {
      // open file
      let file = 'spec/test-ara.txt'
      waitsForPromise(() =>
        atom.workspace.open(file).then(editor => {
          expect(editor.getPath()).toContain(file)
        })
      )

      // check not active
      runs(() => {
        atom.workspace.getTextEditors().forEach(editor =>
          expect(atom.views.getView(editor).classList.contains(Alphabetter.classes.force)).toBe(false)
        )
      })

      // trigger toggle
      waitsForPromise(() =>
        atom.commands.dispatch(workspaceElement, 'alphabetter:toggle-force-ltr')
      )

      // check active
      runs(() => {
        atom.workspace.getTextEditors().forEach(editor =>
          expect(atom.views.getView(editor).classList.contains(Alphabetter.classes.force)).toBe(true)
        )
      })
    })
  })
})

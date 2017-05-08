import App from './App.js'
import path from 'path'

export default ({editor, store, view, packageInfo, baseClass}) => {
  store.dispatch('extmenu/addItem', {
    type: 'editorContext',
    name: 'Mark Active Line',
    func: 'videPluginMarkline:addItem'
  })
  // return execute class
  return class videPluginMarkline extends baseClass {
    constructor () {
      super()
      let self = this
      let props = {
        propsData: {
          addItem: function () {
            let item = self.getCurrentLineInfo()
            item && this.pushItem(item)
          }
        }
      }
      let stylePath = path.join(packageInfo.path, './dist/index.css')
      this.$mount({app: App, props, stylePath})
    }
    addItem () {
      this.vm.showLineMark = true
      let item = this.getCurrentLineInfo()
      item && this.vm.pushItem(item)
    }
    getCurrentLineInfo () {
      let result
      try {
        let filepath = store.state.editor.currentFile
        if (!filepath) {
          return null
        }
        let row = editor.getCursorPosition().row
        let content = editor.session.getLine(row).slice(0, 20)
        // content = htmlspecialchars(content)
        result = {
          content,
          path: filepath,
          row
        }
      } catch (e) {
        result = null
      }
      return result
    }
    $clean () {
      store.dispatch('extmenu/deleteItem', {name: 'Mark Active Line', type: 'editorContext'})
    }
  }
}

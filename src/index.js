import App from './App.js'
import path from 'path'

export default ({editor, store, view, packageInfo, baseClass, signal}) => {
  store.dispatch('extmenu/addItem', {
    type: 'editorContext',
    name: 'Mark Active Line',
    func: 'videPluginMarkline:addItem'
  })
  // remark line
  function remarkLine (item) {
    let currentContent = editor.session.getLine(item.row).slice(0, 20)
    let max = 100
    // re-mark line
    if (item.content !== currentContent) {
      let lines = editor.session.getLines(Math.max(item.row - max, 0), item.row - 1)
      let found = -1
      let len = lines.length
      while (lines.length) {
        let line = lines.pop()
        if (line.slice(0, 20) === item.content) {
          found = item.row - len + lines.length
          break
        }
      }
      if (found === -1) {
        lines = editor.session.getLines(item.row + 1, item.row + max)
        len = lines.length
        while (lines.length) {
          let line = lines.shift()
          if (line.slice(0, 20) === item.content) {
            found = item.row + len - lines.length
            break
          }
        }
      }
      if (found !== -1) {
        item._prevRow = item.row
        item.row = found
      }
    }
    return item
  }
  // return execute class
  return class videPluginMarkline extends baseClass {
    constructor () {
      super()
      let self = this
      // props of App
      let props = {
        propsData: {
          addItem: function () {
            let item = self.getCurrentLineInfo()
            item && this.pushItem(item)
          },
          gotoLine (item) {
            function callback () {
              if (item.row) {
                setTimeout(function () {
                  item = remarkLine(item)
                  editor.gotoLine(item.row + 1)
                }, 50)
              }
            }
            store.dispatch('editor/setFile', {currentFile: item.path, callback})
          }
        }
      }
      // render App
      let stylePath = path.join(packageInfo.path, './dist/index.css')
      this.$mount({app: App, props, stylePath})
    }
    addItem () {
      localStorage.markActiveLine = true
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

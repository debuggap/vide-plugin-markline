import './assets/index.scss'
export default {
  props: ['addItem', 'gotoLine'],
  name: 'linemark',
  data () {
    return {
      bgColors: {
        '#fbbc05': 0,
        '#A6E22E': 0,
        '#66D9EF': 0,
        '#AE81FF': 0,
        '#F92672': 0,
        '#e54724': 0
      },
      colorCache: {},
      items: [],
      showLineMark: localStorage.markActiveLine === 'true'
    }
  },
  methods: {
    getColor (item) {
      let colorIndex = item.path + ':' + item.row
      if (this.colorCache[colorIndex]) {
        return this.colorCache[colorIndex]
      } else {
        let keys = Object.keys(this.bgColors)
        let key = null
        keys.some((k) => {
          if (!this.bgColors[k]) {
            key = k
            return true
          }
        })
        this.colorCache[colorIndex] = key
        this.bgColors[key] = 1
        return key
      }
    },
    cleanColor (index) {
      let item = this.items[index]
      let key = this.getColor(item)
      let colorIndex = item.path + ':' + item.row
      delete this.colorCache[colorIndex]
      this.bgColors[key] = 0
    },
    activeLine () {
      this.addItem()
    },
    pushItem (obj) {
      if (this.items.length === 6) {
        return
      }
      let exists = this.items.some((item) => {
        if (item.path === obj.path && item.row === obj.row) {
          return true
        }
      })
      if (!exists) {
        this.items.push(obj)
      }
    },
    deleteItem (index) {
      this.cleanColor(index)
      this.items.splice(index, 1)
    },
    close (e) {
      let len = this.items.length
      for (let i = 0; i < len; i++) {
        this.cleanColor(i)
      }
      this.items = []
      localStorage.markActiveLine = false
      this.showLineMark = false
      e.stopPropagation()
    }
  },
  render (h) {
    let lists = this.items.map((item, index) => {
      // after modifing row, clean the color cache
      if (item._prevRow) {
        let colorIndex = item.path + ':' + item._prevRow
        let color = this.colorCache[colorIndex]
        this.bgColors[color] = 0
        delete this.colorCache[colorIndex]
        delete item._prevRow
      }
      let color = this.getColor(item)
      return <li>
        <div onClick={() => this.gotoLine(item)} style={{'background-color': color}}>{item.content}</div>
        <span class="btn-close" onClick={() => this.deleteItem(index)} style={{'background-color': color}}></span>
      </li>
    })
    return (
      <div class="linemark" style={{display: this.showLineMark ? 'block' : 'none'}}>
        <div class="linemark-button btn-UI" onClick={this.activeLine}>Mark Active Line<span onClick={this.close} class="btn-close"></span></div>
        <ul>
          {lists}
        </ul>
      </div>
    )
  }
}

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)

const convert = raw => {
  let arr = raw.split(/\n(?=\s*#)/).filter(s => s != "").map(s => s.trim())

  let html = ''
  for (let i = 0; i < arr.length; i++) {

    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        html += `
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
              </textarea>
          </section>`
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        html += `
          <section>
            <section data-markdown>
              <textarea data-template>
                ${arr[i]}
              </textarea>
            </section>`
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        html += `
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>`
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        html += `
            <section data-markdown>
              <textarea data-template>
                ${arr[i]}
              </textarea>
            </section>
          </section>`
      }
    } else {
      if (isMain(arr[i])) {
        html += `
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>`
      } else if (isSub(arr[i])) {
        html += `
            <section data-markdown>
              <textarea data-template>
                ${arr[i]}
              </textarea>
            </section>
          </section>`
      }
    }
  }

  return html
}

const $ = node => document.querySelector(node)
const $$ = node => document.querySelectorAll(node)

const Menu = {
  init() {
    this.$settingIcon = $('.control>.icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu>.icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')
    this.bind()
  },
  bind() {
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add('open') //this是menu
    }
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove('open')
    }
    this.$$tabs.forEach($tab => $tab.onclick = () => {
      this.$$tabs.forEach($node => $node.classList.remove('active'))
      $tab.classList.add('active')
      let index = [...this.$$tabs].indexOf($tab)
      this.$$contents.forEach($node => $node.classList.remove('active'))
      this.$$contents[index].classList.add('active')
    })
  }
}

const Editor = {
  init() {
    this.$editInput = $('.editor textarea')
    this.$saveButton = $('.editor .button-save')
    this.$slideContainer = $('.slides')
    this.markdown = localStorage.markdown || `# OneSlide`
    this.bind()
    this.start()
  },
  bind() {
    this.$saveButton.onclick = () => {
      localStorage.markdown = this.$editInput.value
      location.reload()
    }
  },
  start() {
    this.$editInput.value = this.markdown
    this.$slideContainer.innerHTML = convert(this.markdown)
    Reveal.initialize({
      controls: true,
      progress: true,
      center: true,
      hash: true,

      transition: 'slide',
      dependencies: [{
          src: 'plugin/markdown/marked.js',
          condition: function () {
            return !!document.querySelector('[data-markdown]');
          }
        },
        {
          src: 'plugin/markdown/markdown.js',
          condition: function () {
            return !!document.querySelector('[data-markdown]');
          }
        },
        {
          src: 'plugin/highlight/highlight.js'
        },
        {
          src: 'plugin/search/search.js',
          async: true
        },
        {
          src: 'plugin/zoom-js/zoom.js',
          async: true
        },
        {
          src: 'plugin/notes/notes.js',
          async: true
        }
      ]
    });
  }
}


const App = {
  init() {
    [...arguments].forEach(Module => Module.init())
  }
}

App.init(Menu, Editor)
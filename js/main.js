const isMain = (str) => /^#{1,2}(?!#)/.test(str);
const isSub = (str) => /^#{3}(?!#)/.test(str);
const template = `
# One Slide

基于 reveal.js 开发的极简 Markdown-PPT

## Rules
- #封面标题
- ##主页面标题
- ###子页面标题


### Get Started
在页面左上角的设置选项里开始你的创作吧


## 欢迎使用
您有改进意见，欢迎联系**1079388320@qq.com**
`
const convert = (raw) => {
  let arr = raw
    .split(/\n(?=\s*#{1,3}[^#])/)
    .filter((s) => s != "")
    .map((s) => s.trim());

  let html = "";
  for (let i = 0; i < arr.length; i++) {
    if (arr[i + 1] !== undefined) {
      if (isMain(arr[i]) && isMain(arr[i + 1])) {
        html += `
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
              </textarea>
          </section>`;
      } else if (isMain(arr[i]) && isSub(arr[i + 1])) {
        html += `
          <section>
            <section data-markdown>
              <textarea data-template>
                ${arr[i]}
              </textarea>
            </section>`;
      } else if (isSub(arr[i]) && isSub(arr[i + 1])) {
        html += `
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>`;
      } else if (isSub(arr[i]) && isMain(arr[i + 1])) {
        html += `
            <section data-markdown>
              <textarea data-template>
                ${arr[i]}
              </textarea>
            </section>
          </section>`;
      }
    } else {
      if (isMain(arr[i])) {
        html += `
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>`;
      } else if (isSub(arr[i])) {
        html += `
            <section data-markdown>
              <textarea data-template>
                ${arr[i]}
              </textarea>
            </section>
          </section>`;
      }
    }
  }

  return html;
};

const $ = (node) => document.querySelector(node);
const $$ = (node) => document.querySelectorAll(node);

const Menu = {
  init() {
    this.$settingIcon = $(".control>.icon-setting");
    this.$menu = $(".menu");
    this.$closeIcon = $(".menu>.icon-close");
    this.$$tabs = $$(".menu .tab");
    this.$$contents = $$(".menu .content");
    this.bind();
  },
  bind() {
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add("open"); //this是menu
    };
    this.$closeIcon.onclick = () => {
      this.$menu.classList.remove("open");
    };
    this.$$tabs.forEach(
      ($tab) =>
      ($tab.onclick = () => {
        this.$$tabs.forEach(($node) => $node.classList.remove("active"));
        $tab.classList.add("active");
        let index = [...this.$$tabs].indexOf($tab);
        this.$$contents.forEach(($node) => $node.classList.remove("active"));
        this.$$contents[index].classList.add("active");
      })
    );
  },
};

const Editor = {
  init() {
    this.$editInput = $(".editor textarea");
    this.$saveButton = $(".editor .button-save");
    this.$slideContainer = $(".slides");
    this.markdown = localStorage.markdown || template;
    this.bind();
    this.start();
  },
  bind() {
    this.$saveButton.onclick = () => {
      localStorage.markdown = this.$editInput.value;
      location.reload();
    };
  },
  start() {
    this.$editInput.value = this.markdown;
    this.$slideContainer.innerHTML = convert(this.markdown);
    Reveal.initialize({
      controls: true,
      progress: true,
      center: localStorage.align === "left-top" ? false : true,
      hash: true,

      transition: localStorage.transition || "slide",
      dependencies: [{
          src: "plugin/markdown/marked.js",
          condition: function () {
            return !!document.querySelector("[data-markdown]");
          },
        },
        {
          src: "plugin/markdown/markdown.js",
          condition: function () {
            return !!document.querySelector("[data-markdown]");
          },
        },
        {
          src: "plugin/highlight/highlight.js",
        },
        {
          src: "plugin/search/search.js",
          async: true,
        },
        {
          src: "plugin/zoom-js/zoom.js",
          async: true,
        },
        {
          src: "plugin/notes/notes.js",
          async: true,
        },
      ],
    });
  },
};

const Theme = {
  init() {
    this.$$figures = $$(".theme figure");
    this.$transition = $(".theme .transition");
    this.$align = $(".theme .align");
    this.$reveal = $(".reveal");
    this.bind();
    this.loadTheme();
  },
  bind() {
    this.$$figures.forEach(
      ($figure) =>
      ($figure.onclick = () => {
        this.$$figures.forEach(($item) => $item.classList.remove("selected"));
        $figure.classList.add("selected");
        this.setTheme($figure.dataset.theme);
      })
    );

    this.$transition.onchange = function () {
      localStorage.transition = this.value;
      location.reload();
    };

    this.$align.onchange = function () {
      localStorage.align = this.value;
      location.reload();
    };
  },
  setTheme(theme) {
    localStorage.theme = theme;
    location.reload();
  },
  loadTheme() {
    let theme = localStorage.theme || "blood";
    let $link = document.createElement("link");
    $link.rel = "stylesheet";
    $link.href = `css/theme/${theme}.css`;
    document.head.appendChild($link);

    [...this.$$figures]
    .find(($figure) => $figure.dataset.theme === theme)
      .classList.add("selected");

    this.$transition.value = localStorage.transition || "slide";

    this.$align.value = localStorage.align || "center";

    this.$reveal.classList.add(this.$align.value);
  },
};

const Print = {
  init() {
    this.$download = $('.download')

    this.bind()
    this.start()
  },

  bind() {
    this.$download.addEventListener('click', () => {
      let $link = document.createElement('a')
      $link.setAttribute('target', '_blank')
      $link.setAttribute('href', location.href.replace(/#\/.*/, '?print-pdf'))
      $link.click()
    })

    window.onafterprint = () => {
      console.log('close')
      window.close()
    }
  },

  start() {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    if (window.location.search.match(/print-pdf/gi)) {
      link.href = 'css/print/pdf.css'
      window.print()
    } else {
      link.href = 'css/print/paper.css'
    }
    document.head.appendChild(link)
  }
}

const ImageUpload = {
  init() {
    this.$fileInput = $('#image-upload')
    this.$textarea = $('.editor textarea')

    AV.init({
      appId: "4G4OTM50lLuoOvjiiGRenPYQ-gzGzoHsz",
      appKey: "R7wxvDkyOmVKecuWAMhVWlGm",
      serverURL: "https://4g4otm50.lc-cn-n1-shared.com"
    });

    this.bind()
  },

  bind() {
    console.log(this.$fileInput)
    let self = this
    this.$fileInput.onchange = function () {
      if (this.files.length > 0) {
        let localFile = this.files[0]
        console.log(localFile)
        if (localFile.size / 1048576 > 2) {
          alert('文件不能超过2M')
          return
        }
        self.insertText(`![上传中，进度0%]()`)
        let avFile = new AV.File(encodeURI(localFile.name), localFile)
        avFile.save({
          keepFileName: true,
          onprogress(progress) {
            self.insertText(`![上传中，进度${progress.percent}%]()`)
          }
        }).then(file => {
          console.log('文件保存完成')
          console.log(file)
          let text = `![${file.attributes.name}](${file.attributes.url}?imageView2/0/w/800/h/400)`
          self.insertText(text)
        }).catch(err => console.log(err))
      }
    }
  },
  insertText(text = '') {
    let $textarea = this.$textarea
    let start = $textarea.selectionStart
    let end = $textarea.selectionEnd
    let oldText = $textarea.value

    $textarea.value = `${oldText.substring(0, start)}${text} ${oldText.substring(end)}`
    $textarea.focus()
    $textarea.setSelectionRange(start, start + text.length)
  }
}

const App = {
  init() {
    [...arguments].forEach((Module) => Module.init());
  },
};

App.init(Menu, ImageUpload, Editor, Theme, Print);
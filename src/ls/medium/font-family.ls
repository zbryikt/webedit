medium-editor-fontfamily-extension = {}
(->

  justfont = <[afupop08 chikuming datx2 daty5 jf-jinxuan wt064 xingothic-tc]>
  googlefont = [
    'Open Sans', 'Josefin Slab', 'Arvo', 'Lato', 'Vollkorn', 'Abril Fatface'
    'PT Sans', 'PT Serif', 'Old Standard TT', 'Droid Sans'
    'Work Sans', 'Playfair Display', 'Libre Franklin', 'Space Mono', 'Rubik', 'Cormorant'
    'Fira Sans', 'Eczar', 'Alegreya Sans', 'Alegreya',
    'Raleway', 'Merriweather', 'Anonymous Pro', 'Cabin', 'Inconsolata', 'Neuton',
    'Roboto', 'Cardo', 'Inknut Antiqua', 'Bitter', 'Domine', 'Spectral', 'Proza Libre', 'Montserrat'
    'Crimson Text', 'Karla', 'Libre Baskerville', 'Archivo Narrow', 'BioRhyme', 'Poppins',
    'Roboto Slab', 'Source Serif Pro', 'Source Sans Pro', 'Lora', 'Chivo'
  ]
  defaultfont = [
    'Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Tahoma',
    'Century Gothic', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond',
    'Trebuchet MS', 'Impact', 'Heiti TC', 'MingLiU', 'DFKai-sb'
  ]
  default-plus-font = [ 'Comic Sans', 'Microsoft JhengHei' ]
  source = -> return \default #if (it in justfont) => 'justfont' else if (it in googlefont) => 'googlefont' else 'default'
  fonts = defaultfont

  config = do
    name: "font-family"
    init: ->
      @button = @document.createElement \button
      @button.classList.add \medium-editor-action, \medium-editor-font-family
      @button.innerHTML = "<i class='fa fa-font'></i>"
      @on @button, \click, (e) ~> @handleClick e

      load-font = (font) ~>
        <~ xfl.load font.path, _
        @base.importSelection(@selectionState)
        @document.execCommand \styleWithCSS, false, true
        @document.execCommand \fontName, false, font.name
        @trigger(
          \editableInput,
          {font: {name: font.name, source: source(font.name) }}
          list
        )
        list.style.display = \none
        #@modal.style.display = \none


      @list = list = document.createElement("div")
      list.classList.add 'medium-editor-font-family-list', 'medium-editor-sublist', 'centered'
      document.body.appendChild(list)

      list.innerHTML = (
        ["<div class='list'>", "<div class='item' data-font='default'>&nbsp;Default</div>"] ++
        ["<div class='item' data-font='#it'><img src='/assets/img/fonts/#it.png'></div>" for it in fonts] ++
        ["</div>"]
      ).join('')

      @subscribe \hideToolbar, ~> @list.style.display = \none
      list.style.display = \none
      list.addEventListener \click, (e) ~>
        if !(e.target and e.target.getAttribute) => return
        fontname = e.target.getAttribute('data-font') or e.target.parentNode.getAttribute('data-font')
        @base.importSelection(@selectionState)
        @document.execCommand \styleWithCSS, false, true
        @document.execCommand \fontName, false, fontname
        @trigger(
          \editableInput,
          {font: {name: fontname, source: source(fontname) }}
          e.target
        )
        list.style.display = \none
      /*
      @list-chooser = list-chooser = new choosefont do
        node: @list
        type: \list
        meta-url: "/assets/choosefont.js/meta.json",
        base: "https://plotdb.github.io/xl-fontset/alpha"
      list-chooser.init!
      list-chooser.on \choose, load-font
      return

      @modal = modal = document.createElement("div")
      modal.style
        ..display = \none
        ..position = \fixed
        ..top = 0
        ..right = 0
        ..bottom = 0
        ..left = 0
        ..zIndex = 99
        ..background = \#fff
        ..overflow = \scroll
      document.body.appendChild(modal)
      @panel-chooser = panel-chooser = new choosefont do
        node: modal
        meta-url: "/assets/choosefont.js/meta.json",
        base: "https://plotdb.github.io/xl-fontset/alpha"
      panel-chooser.init!
      panel-chooser.on \choose, load-font
      */

    getButton: -> return @button
    handleClick: (event) ->
      event.preventDefault!
      event.stopPropagation!
      @selectionState = @base.exportSelection!
      ref = @document.querySelector(".medium-editor-toolbar-active .medium-editor-font-family").parentNode
      box = ref.getBoundingClientRect!
      @list.style.top = ((box.y + box.height) + document.scrollingElement.scrollTop) + "px"
      @list.style.left = box.x + "px"
      @list.style.display = \block
      #@modal.style
      #   ..display = \block

  medium-editor-fontfamily-extension := MediumEditor.Extension.extend(config)
)!

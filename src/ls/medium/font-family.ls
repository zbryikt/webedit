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
  source = -> if (it in justfont) => 'justfont' else if (it in googlefont) => 'googlefont' else 'default'
  fonts = defaultfont

  config = do
    name: "font-family"
    init: ->
      @button = @document.createElement \button
      @button.classList.add \medium-editor-action, \medium-editor-font-family
      @button.innerHTML = "<i class='fa fa-font'></i>"
      @on @button, \click, (e) ~> @handleClick e
      @div = div = document.createElement("div")
      div.classList.add 'medium-editor-font-family-list', 'medium-editor-sublist', 'centered'
      document.body.appendChild(div)

      div.innerHTML = (
        ["<div class='list'>", "<div class='item' data-font='default'>&nbsp;Default</div>"] ++
        ["<div class='item' data-font='#it'><img src='/assets/img/fonts/#it.png'></div>" for it in fonts] ++
        ["</div>"]
      ).join('')
      @subscribe \hideToolbar, ~> @div.style.display = \none
      div.style.display = \none
      div.addEventListener \click, (e) ~>
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
        div.style.display = \none
    getButton: -> return @button
    handleClick: (event) ->
      event.preventDefault!
      event.stopPropagation!
      @selectionState = @base.exportSelection!
      ref = @document.querySelector(".medium-editor-toolbar-active .medium-editor-font-family").parentNode
      box = ref.getBoundingClientRect!
      @div.style.top = ((box.y + box.height) + document.scrollingElement.scrollTop) + "px"
      @div.style.left = box.x + "px"
      @div.style.display = \block

  medium-editor-fontfamily-extension := MediumEditor.Extension.extend(config)
)!

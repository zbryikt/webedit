(->
  config = css: {}, js: {}
  config.css <<< do
    editor: <[
      /assets/medium-editor/medium-editor.min.css
      /assets/medium-editor/beagle.min.css
      /css/page/index.css
    ]>
    base: <[
      /assets/bootstrap/4.0.0-beta/css/bootstrap.min.css
      /assets/fontawesome/4.7.0/css/font-awesome.min.css
      /css/index.css
    ]>
  config.js <<< do
    editor: <[
      /assets/sharedb/index.min.js
      /assets/medium-editor/medium-editor.min.js
      /assets/medium-editor/color.js
      /assets/medium-editor/vanilla-color-picker.min.js
      /assets/htmlcaret/index.js
      /assets/sortable/index.min.js
      /assets/showdown/1.8.6/showdown.min.js
      /js/page/blocks.js
      /js/page/collab.js
      /js/page/editor.js
    ]>
    base: <[
      /assets/angular/1.3.15/angular.min.js
      /assets/jquery/1.10.2/jquery.min.js
      /assets/clipboard/1.6.1/clipboard.min.js
      /assets/popper/1.12.5/index.js
      /assets/bootstrap/4.0.0-beta/js/bootstrap.min.js
      /js/polyfill/array.from.js
      /js/ldBase/index.js
      /js/ldBase/util.js
      /js/index.js
    ]>
  if module? => module.exports = config
)!


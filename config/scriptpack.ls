(->
  config = css: {}, js: {}
  config.css <<< do
    editor: <[
      /assets/medium-editor/medium-editor.min.css
      /assets/medium-editor/beagle.min.css
      /css/page/index.css
      /css/site/pricing.css
    ]>
    viewer: <[
      /assets/bootstrap/4.0.0/css/bootstrap.min.css
      /assets/fontawesome/4.7.0/css/font-awesome.min.css
      /assets/loading.io/loading.css
      /css/page/basic.css
    ]>
    base: <[
      /assets/bootstrap/4.0.0/css/bootstrap.min.css
      /assets/fontawesome/4.7.0/css/font-awesome.min.css
      /assets/loading.io/loading.css
      /assets/loading.io/transition.min.css
      /assets/loading.io/loading-btn.css
      /assets/ldcolorpicker/0.1.4/ldcp.css
      /assets/ion-rangeslider/2.1.7/css/ion.rangeSlider.css
      /assets/ion-rangeslider/2.1.7/css/ion.rangeSlider.skinFlat.css
      /assets/iconfont/style.css
      /css/index.css
    ]>
  config.js <<< do
    editor: <[
      /assets/sharedb/index.min.js
      /assets/medium-editor/medium-editor.min.js
      /assets/medium-editor/vanilla-color-picker.min.js
      /assets/htmlcaret/index.js
      /assets/sortable/1.7.0/index.js
      /assets/showdown/1.8.6/showdown.min.js
      /assets/dompurify/1.0.3/index.min.js
      /js/medium/align.js
      /js/medium/style.js
      /js/page/puredom.js
      /js/page/blocks.js
      /js/page/btools.js
      /js/page/collab.js
      /js/page/editor.js
    ]>
    viewer: <[
      /assets/jquery/1.10.2/jquery.min.js
      /assets/popper/1.12.5/index.js
      /assets/bootstrap/4.0.0/js/bootstrap.min.js
      /js/page/btools.js
      /js/page/viewer.js
    ]>
    base: <[
      /assets/jquery/1.10.2/jquery.min.js
      /assets/angular/1.3.15/angular.min.js
      /assets/angular/1.3.15/angular-animate.js
      /assets/clipboard/1.6.1/clipboard.min.js
      /assets/popper/1.12.5/index.js
      /assets/bootstrap/4.0.0/js/bootstrap.min.js
      /assets/ldcolorpicker/0.1.4/ldcp.min.js
      /assets/ion-rangeslider/2.1.7/js/ion.rangeSlider.min.js
      /js/polyfill/array.from.js
      /js/ldBase/index.js
      /js/ldBase/credit-card.js
      /js/ldBase/util.js
      /js/index.js
    ]>
  if module? => module.exports = config
)!


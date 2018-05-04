// Generated by LiveScript 1.3.0
module.exports = {
  editable: false,
  resize: function(){
    var this$ = this;
    return btools.qs('.container', this.block).map(function(container){
      var box, thumbs;
      box = container.getBoundingClientRect();
      btools.qsAll('.thumb', this$.block).map(function(it){
        return it.style.backgroundSize = box.width + "px auto";
      });
      btools.qs('.ctrl', this$.block).map(function(it){
        return it.style.left = box.width * 0.5 + "px";
      });
      thumbs = btools.qsAll('.thumb', this$.block);
      thumbs[0].style.width = box.width * 0.5 + "px";
      return thumbs[1].style.width = box.width * 0.5 + "px";
    });
  },
  init: function(){
    var dragging, this$ = this;
    dragging = false;
    this.block.addEventListener('mousedown', function(e){
      return dragging = true;
    });
    this.block.addEventListener('mousemove', function(e){
      var container, box, x, thumbs;
      container = this$.block.querySelector('.container');
      if (!dragging || !container) {
        return;
      }
      box = container.getBoundingClientRect();
      x = e.clientX - box.x;
      btools.qs('.ctrl', this$.block).map(function(it){
        return it.style.left = (e.clientX - box.x) + "px";
      });
      thumbs = btools.qsAll('.thumb', this$.block);
      thumbs[0].style.width = x + "px";
      return thumbs[1].style.width = (box.width - x) + "px";
    });
    this.block.addEventListener('mouseup', function(e){
      return dragging = false;
    });
    this.resizeHandler = function(){
      return this$.resize();
    };
    window.addEventListener('resize', this.resizeHandler);
    return this.resize();
  },
  destroy: function(){
    return window.removeEventListener('resize', this.resizeHandler);
  }
};
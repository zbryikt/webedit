// Generated by LiveScript 1.3.0
module.exports = {
  config: {
    editable: false
  },
  wrap: function(node){
    var ctrl, thumbs, container, dragging, box;
    ctrl = node.querySelector('.ctrl');
    thumbs = node.querySelectorAll('.thumb');
    container = node.querySelector('.container');
    dragging = false;
    node.addEventListener('mousedown', function(e){
      return dragging = true;
    });
    node.addEventListener('mousemove', function(e){
      var box, x;
      if (!dragging) {
        return;
      }
      box = container.getBoundingClientRect();
      x = e.clientX - box.x;
      ctrl.style.left = (e.clientX - box.x) + "px";
      thumbs[0].style.width = x + "px";
      return thumbs[1].style.width = (box.width - x) + "px";
    });
    node.addEventListener('mouseup', function(e){
      return dragging = false;
    });
    box = container.getBoundingClientRect();
    return Array.from(thumbs).map(function(it){
      return it.style.backgroundSize = box.width + "px";
    });
  }
};
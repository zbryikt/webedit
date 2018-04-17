// Generated by LiveScript 1.3.0
module.exports = {
  handle: {
    change: function(node){
      var nbox, timeline, tbox, cnode, i$, ref$, len$, item, results$ = [];
      nbox = node.getBoundingClientRect();
      timeline = node.querySelector('.timeline');
      if (!timeline) {
        return;
      }
      timeline.style.top = null;
      timeline.style.height = nbox.height + "px";
      timeline.classList.remove('sticky', 'no-transition');
      tbox = timeline.getBoundingClientRect();
      cnode = node.nextSibling;
      for (i$ = 0, len$ = (ref$ = btools.qsAll('.timeline .item', node)).length; i$ < len$; ++i$) {
        item = ref$[i$];
        if (cnode) {
          item.classList.remove('active');
          btools.qs('.inner', cnode).map(fn$);
          results$.push(cnode = cnode.nextSibling);
        }
      }
      return results$;
      function fn$(it){
        return it.style.marginLeft = (tbox.width + tbox.x - nbox.x + 10) + "px";
      }
    }
  },
  destroy: function(node){
    var cnode, i$, ref$, len$, item;
    cnode = node.nextSibling;
    for (i$ = 0, len$ = (ref$ = btools.qsAll('.timeline .item', node)).length; i$ < len$; ++i$) {
      item = ref$[i$];
      if (cnode) {
        btools.qs('.inner', cnode).map(fn$);
        cnode = cnode.nextSibling;
      }
    }
    if (node.scrollListener) {
      return window.removeEventListener('scroll', node.scrollListener);
    }
    function fn$(it){
      return it.style.marginLeft = null;
    }
  },
  wrap: function(node){
    if (node.inited) {
      return;
    }
    node.inited = true;
    node.scrollListener = function(){
      var timeline, row, items, tbox, rbox, scrolltop, nbox, lastNode, i$, len$, item, lbox, ref$, cnode, count, cbox, lastItem;
      timeline = node.querySelector('.timeline');
      row = node.querySelector('.row');
      items = timeline.querySelectorAll('.item');
      tbox = timeline.getBoundingClientRect();
      rbox = row.getBoundingClientRect();
      if (!timeline) {
        return;
      }
      scrolltop = document.scrollingElement.scrollTop;
      nbox = node.getBoundingClientRect();
      lastNode = node;
      for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
        item = items[i$];
        if (lastNode) {
          lastNode = lastNode.nextSibling;
        }
      }
      if (lastNode) {
        lbox = lastNode.getBoundingClientRect();
      }
      ref$ = [node, 0], cnode = ref$[0], count = ref$[1];
      for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
        item = items[i$];
        if (cnode) {
          cbox = cnode.getBoundingClientRect();
          item.classList.remove('active');
          if (cbox.top >= window.innerHeight / 2 && lastItem) {
            lastItem.classList.add('active');
            lastItem = null;
            break;
          }
          ref$ = [cnode.nextSibling, count + 1, item], cnode = ref$[0], count = ref$[1], lastItem = ref$[2];
        }
      }
      if (lastItem) {
        lastItem.classList.add('active');
      }
      if (rbox.top >= 0) {
        timeline.classList.remove('sticky');
        timeline.style.top = null;
        timeline.style.height = nbox.height + "px";
      } else if (rbox.top < 0) {
        timeline.style.height = window.innerHeight + "px";
        timeline.classList.add('sticky');
        timeline.classList.remove('ldt-fade-out');
      }
      if (lbox && lbox.top <= window.innerHeight) {
        timeline.classList.add('no-transition');
        return timeline.style.top = (cbox.top + cbox.height - tbox.height) + "px";
      } else {
        return timeline.classList.remove('no-transition');
      }
    };
    return window.addEventListener('scroll', node.scrollListener);
  }
};
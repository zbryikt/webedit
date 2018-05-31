// Generated by LiveScript 1.3.0
module.exports = {
  init: function(){
    var this$ = this;
    this.page.addEventListener('block.change', function(){
      var nbox, timeline, tbox, cnode, i$, ref$, len$, item, results$ = [];
      nbox = this$.block.getBoundingClientRect();
      timeline = this$.block.querySelector('.timeline');
      if (!timeline) {
        return;
      }
      timeline.style.top = null;
      timeline.style.height = nbox.height + "px";
      timeline.classList.remove('sticky', 'no-transition');
      tbox = timeline.getBoundingClientRect();
      cnode = this$.block;
      for (i$ = 0, len$ = (ref$ = btools.qsAll('.timeline .item', this$.block)).length; i$ < len$; ++i$) {
        item = ref$[i$];
        if (cnode) {
          item.classList.remove('active');
          if (cnode === this$.block) {
            btools.qs('.inner .container', cnode).map(fn$);
          } else {
            btools.qs('.inner', cnode).map(fn1$);
          }
          results$.push(cnode = cnode.nextSibling);
        }
      }
      return results$;
      function fn$(it){
        var offset;
        offset = it.getBoundingClientRect().x - nbox.x;
        return it.style.paddingLeft = (tbox.width + tbox.x - offset - nbox.x + 10) + "px";
      }
      function fn1$(it){
        return it.style.marginLeft = (tbox.width + tbox.x - nbox.x + 10) + "px";
      }
    });
    this.scrollListener = function(){
      var timeline, row, items, tbox, rbox, scrolltop, nbox, lastNode, i$, len$, item, lbox, ref$, cnode, count, cbox, lastItem;
      timeline = this$.block.querySelector('.timeline');
      if (!timeline || !timeline.style) {
        return;
      }
      row = this$.block.querySelector('.container');
      items = timeline.querySelectorAll('.item');
      tbox = timeline.getBoundingClientRect();
      rbox = row.getBoundingClientRect();
      if (!timeline) {
        return;
      }
      scrolltop = document.scrollingElement.scrollTop;
      nbox = this$.block.getBoundingClientRect();
      lastNode = this$.block;
      for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
        item = items[i$];
        if (lastNode) {
          lastNode = lastNode.nextSibling;
        }
      }
      if (lastNode) {
        lbox = lastNode.getBoundingClientRect();
      }
      ref$ = [this$.block, 0], cnode = ref$[0], count = ref$[1];
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
    return window.addEventListener('scroll', this.scrollListener);
  },
  destroy: function(){
    var cnode, i$, ref$, len$, item;
    cnode = this.block.nextSibling;
    for (i$ = 0, len$ = (ref$ = btools.qsAll('.timeline .item', this.block)).length; i$ < len$; ++i$) {
      item = ref$[i$];
      if (cnode) {
        btools.qs('.inner', cnode).map(fn$);
        cnode = cnode.nextSibling;
      }
    }
    if (this.scrollListener) {
      return window.removeEventListener('scroll', this.scrollListener);
    }
    function fn$(it){
      return it.style.marginLeft = null;
    }
  }
};
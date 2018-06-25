// Generated by LiveScript 1.3.0
module.exports = {
  custom: {
    attrs: ['branch-id', 'branch-target']
  },
  isBranchBlock: function(classList){
    return ['block-branch', 'block-branch-list'].filter(function(it){
      return classList.contains(it);
    }).length;
  },
  init: function(){
    var changeHandler, hint, this$ = this;
    changeHandler = function(){
      var blocks, ref$, last, idx, update, i$, to$, i;
      blocks = btools.qsAll('.block-item');
      ref$ = [-1, -1], last = ref$[0], idx = ref$[1];
      if (this$.viewMode && this$.inited) {
        return;
      }
      if (this$.viewMode) {
        this$.inited = true;
      }
      update = function(start, end, idx){
        var i$, i, results$ = [];
        for (i$ = start; i$ <= end; ++i$) {
          i = i$;
          if (!this$.viewMode) {
            blocks[i].classList.add("block-branch-no" + (1 + idx % 3), 'block-branch-no');
          }
          results$.push(blocks[i].setAttribute('branch-id', idx + 1));
        }
        return results$;
      };
      for (i$ = 0, to$ = blocks.length; i$ < to$; ++i$) {
        i = i$;
        blocks[i].classList.remove('block-branch-no1', 'block-branch-no2', 'block-branch-no3');
        if (this$.isBranchBlock(blocks[i].classList)) {
          if (last >= 0) {
            update(last, i, idx);
          }
          ref$ = [i + 1, idx + 1], last = ref$[0], idx = ref$[1];
          btools.qs('.hint', blocks[i]).map(fn$);
        }
      }
      if (last >= 0) {
        return update(last, blocks.length - 1, idx);
      }
      function fn$(hint){
        hint.classList.remove('block-branch-no1', 'block-branch-no2', 'block-branch-no3');
        hint.classList.add("block-branch-no" + (1 + idx % 3));
        return hint.innerText = idx + 1;
      }
    };
    this.page.addEventListener('block.change', function(){
      return changeHandler();
    });
    if (!this.viewMode) {
      hint = this.block.querySelector('.hint');
      if (hint) {
        return;
      }
      hint = document.createElement("div");
      hint.classList.add('hint');
      this.block.appendChild(hint);
      if (!this.branching) {
        changeHandler();
      }
      return;
    }
    return this.block.addEventListener('click', function(e){
      var target, branchId, i$, ref$, len$, item, first, last, cnode, next;
      target = btools.traceUp('[branch-target]', e.target);
      branchId = (target && target.getAttribute && target.getAttribute('branch-target')) || null;
      if (!branchId) {
        return;
      }
      for (i$ = 0, len$ = (ref$ = target.parentNode.childNodes).length; i$ < len$; ++i$) {
        item = ref$[i$];
        if (item.getAttribute && item.getAttribute('branch-target')) {
          item.classList.remove('active');
        }
      }
      target.classList.add('active');
      target = e.target;
      while (target && target.classList) {
        if (this$.isBranchBlock(target.classList)) {
          break;
        }
        target = target.parentNode;
      }
      if (!target.classList) {
        return;
      }
      ref$ = [null, target], first = ref$[0], last = ref$[1];
      cnode = this$.block.nextSibling;
      while (cnode) {
        next = cnode.nextSibling;
        if (cnode.sourceBranch) {
          cnode.parentNode.removeChild(cnode);
        }
        cnode = next;
      }
      btools.qsAll("[branch-id]").map(function(it){
        var parent, newnode;
        if (it.getAttribute('branch-id') !== branchId) {
          return;
        }
        parent = it.parentNode;
        newnode = it.cloneNode(true);
        newnode.removeAttribute('branch-id');
        newnode.sourceBranch = this$.block;
        parent.insertBefore(newnode, last.nextSibling);
        blocksManager.init(newnode, {
          branching: this$.isBranchBlock(newnode.classList)
        });
        last = newnode;
        if (!first) {
          first = newnode;
        }
        return newnode.style.display = 'block';
      });
      return setTimeout(function(){
        var box, src, des, count, delta, handler;
        box = first.getBoundingClientRect();
        src = document.scrollingElement.scrollTop;
        des = box.y + src - 20;
        count = 0;
        delta = 0.001;
        return handler = setInterval(function(){
          var value;
          value = src + (des - src) * delta * count * count;
          window.scrollTo(0, value);
          count = count + 1;
          if (value >= des) {
            return clearInterval(handler);
          }
        }, 10);
      }, 250);
    });
  },
  destroy: function(){
    if (btools.qsAll('.block-branch,.block-branch-list').length <= 1) {
      return btools.qsAll('.block-branch-no').map(function(it){
        return it.classList.remove('block-branch-no', 'block-branch-no1', 'block-branch-no2', 'block-branch-no3');
      });
    }
  }
};
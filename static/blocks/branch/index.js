// Generated by LiveScript 1.3.0
module.exports = {
  handle: {
    change: function(blocks, viewMode){
      var ref$, last, idx, update, i$, to$, i, hint;
      viewMode == null && (viewMode = false);
      blocks = Array.from(document.querySelectorAll('.block-item'));
      ref$ = [-1, -1], last = ref$[0], idx = ref$[1];
      update = function(start, end, idx){
        var i$, i, results$ = [];
        for (i$ = start; i$ <= end; ++i$) {
          i = i$;
          if (!viewMode) {
            blocks[i].classList.add("block-branch-no" + (1 + idx % 3), 'block-branch-no');
          }
          results$.push(blocks[i].setAttribute('branch-id', idx + 1));
        }
        return results$;
      };
      for (i$ = 0, to$ = blocks.length; i$ < to$; ++i$) {
        i = i$;
        blocks[i].classList.remove('block-branch-no1', 'block-branch-no2', 'block-branch-no3');
        if (blocks[i].classList.contains("block-branch")) {
          if (last >= 0) {
            update(last, i, idx);
          }
          ref$ = [i + 1, idx + 1], last = ref$[0], idx = ref$[1];
          hint = blocks[i].querySelector('.hint');
          if (hint) {
            hint.classList.remove('block-branch-no1', 'block-branch-no2', 'block-branch-no3');
            hint.classList.add("block-branch-no" + (1 + idx % 3));
            hint.innerText = idx + 1;
          }
        }
      }
      if (last >= 0) {
        return update(last, blocks.length - 1, idx);
      }
    }
  },
  destroy: function(){
    if (document.querySelectorAll('.block-branch').length <= 1) {
      return Array.from(document.querySelectorAll('.block-branch-no')).map(function(it){
        return it.classList.remove('block-branch-no', 'block-branch-no1', 'block-branch-no2', 'block-branch-no3');
      });
    }
  },
  wrap: function(node, viewMode, branching){
    var hint;
    branching == null && (branching = false);
    if (!branching) {
      this.handle.change(null, viewMode);
    }
    if (!viewMode) {
      hint = node.querySelector('.hint');
      if (!hint) {
        hint = document.createElement("div");
        hint.classList.add('hint');
        node.appendChild(hint);
      }
      return;
    }
    return node.addEventListener('click', function(e){
      var branchId, target, ref$, first, last;
      branchId = (e.target.getAttribute && e.target.getAttribute('branch-target')) || null;
      if (!branchId) {
        return;
      }
      target = e.target;
      while (target && target.classList) {
        if (target.classList.contains('block-branch')) {
          break;
        }
        target = target.parentNode;
      }
      if (!target.classList) {
        return;
      }
      ref$ = [null, target], first = ref$[0], last = ref$[1];
      Array.from(document.querySelectorAll("[branch-id]")).map(function(it){
        var parent, newnode;
        if (it.getAttribute('branch-id') !== branchId) {
          return;
        }
        parent = it.parentNode;
        newnode = it.cloneNode(true);
        newnode.removeAttribute('branch-id');
        parent.insertBefore(newnode, last.nextSibling);
        blocksManager.code.wrap(newnode, viewMode, !!newnode.classList.contains('block-branch'));
        last = newnode;
        if (!first) {
          first = newnode;
        }
        return newnode.style.display = 'block';
      });
      return setTimeout(function(){
        var box, src, des, count, delta, handler;
        if (last.classList.contains('block-branch')) {
          box = last.getBoundingClientRect();
          src = document.scrollingElement.scrollTop;
          des = box.y + box.height + src + 80;
        } else {
          box = first.getBoundingClientRect();
          src = document.scrollingElement.scrollTop;
          des = box.y + src - 80;
        }
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
      }, 500);
    });
  }
};
// Generated by LiveScript 1.3.0
blocksManager.code.add('blank', function(module){
  return module.exports = {
    init: function(){},
    update: function(){},
    destroy: function(){}
  };
});
blocksManager.code.add('hr', function(module){
  return module.exports = {
    editable: false
  };
});
blocksManager.code.add('gallery', function(module){
  return module.exports = {
    editable: false,
    change: function(blocks, source){
      var this$ = this;
      clearTimeout(this.handle);
      if (source || this.viewMode) {
        return this.handle = setTimeout(function(){
          return this$.balance();
        }, 10);
      }
    },
    balance: function(){
      var hash, key, list, max, vote, res$, k, v, height, this$ = this;
      hash = {};
      btools.qsAll('.thumb', this.block).map(function(it){
        var box, key;
        box = it.getBoundingClientRect();
        key = Math.round(box.y);
        return (hash[key] || (hash[key] = [])).push([it, box.height]);
      });
      for (key in hash) {
        list = hash[key];
        max = Math.max.apply(null, list.map(fn$));
        vote = {};
        list.map(fn1$);
        res$ = [];
        for (k in vote) {
          v = vote[k];
          res$.push([k, v]);
        }
        vote = res$;
        vote.sort(fn2$);
        height = vote[0][0];
        list.map(fn3$);
      }
      if (this.collab) {
        return this.collab.action.editBlock(this.block);
      }
      function fn$(it){
        return it[1];
      }
      function fn1$(it){
        var that;
        return vote[it[1]] = ((that = vote[it[1]]) ? that : 0) + 1;
      }
      function fn2$(a, b){
        return a[1] - b[1];
      }
      function fn3$(it){
        it[0].style.height = height + "px";
        if (this$.viewMode) {
          return it[0].style.flex = "1 1 auto";
        }
      }
    },
    init: function(){
      var root, dialog, content, inner;
      if (!this.viewMode) {
        return;
      }
      this.balance();
      this.block.addEventListener('click', function(e){
        var target, img;
        if (!e.target || !e.target.classList) {
          return;
        }
        target = e.target;
        while (target && target.classList) {
          if (target.classList.contains('thumb')) {
            break;
          }
          target = target.parentNode;
        }
        if (!target.classList.contains('thumb')) {
          return;
        }
        img = target.style.backgroundImage;
        return btools.qs(".modal-block-gallery").map(function(modal){
          var content;
          $(modal).modal('show');
          content = modal.querySelector('.modal-content > div');
          return content.style.backgroundImage = img;
        });
      });
      if (document.querySelector(".modal-block-gallery")) {
        return;
      }
      root = document.createElement("div");
      root.setAttribute('class', "modal fade modal-block-gallery");
      dialog = document.createElement("div");
      dialog.setAttribute('class', "modal-dialog modal-dialog-centered");
      content = document.createElement("div");
      content.setAttribute('class', "modal-content");
      inner = document.createElement("div");
      inner.setAttribute('class', 'inner');
      root.appendChild(dialog);
      dialog.appendChild(content);
      content.appendChild(inner);
      document.body.appendChild(root);
      return root.addEventListener('click', function(){
        return $(root).modal('hide');
      });
    }
  };
});
blocksManager.code.add('numbers', function(module){
  return module.exports = {
    init: function(){
      var this$ = this;
      if (!this.viewMode) {
        return;
      }
      btools.qsAll('.number', this.block).map(function(it){
        var ret;
        ret = /^(.*?)(\d+)(.*?)$/.exec(it.innerText);
        if (!ret) {
          return;
        }
        it.value = +ret[2];
        it.valuePrefix = ret[1] !== null ? ret[1] : '';
        it.valuePostfix = ret[3] ? ret[3] : '';
        if (isNaN(it.value)) {
          return;
        }
        it.speed = 20 + Math.random() * 40;
        it.currentValue = 0;
        return it.innerText = it.valuePrefix + "0" + it.valuePostfix;
      });
      this.scroll = function(e){
        var box;
        box = this$.block.getBoundingClientRect();
        if (box.y <= window.innerHeight && !this$.animating) {
          this$.animating = true;
          this$.animate();
          return document.removeEventListener('scroll', this$.scroll);
        }
      };
      document.addEventListener('scroll', this.scroll);
      return this.scroll();
    },
    animate: function(){
      var numbers, remains, this$ = this;
      numbers = btools.qsAll('.number', this.block);
      remains = numbers.map(function(it){
        if (!it.speed) {
          return false;
        }
        it.currentValue += it.value / it.speed;
        if (it.currentValue >= it.value && it.value > 0) {
          it.currentValue = it.value;
        } else if (it.currentValue <= it.value && it.value < 0) {
          it.currentValue = it.value;
        }
        it.innerText = it.valuePrefix + "" + Math.round(it.currentValue) + it.valuePostfix;
        return it.currentValue !== it.value;
      }).filter(function(it){
        return it;
      }).length;
      if (remains) {
        return requestAnimationFrame(function(){
          return this$.animate();
        });
      }
    },
    destroy: function(){
      if (!this.viewMode) {
        return;
      }
      return document.removeEventListener('scroll', this.scroll);
    }
  };
});
blocksManager.code.add('table', function(module){
  return module.exports = {
    init: function(){
      var this$ = this;
      return this.block.addEventListener('click', function(e){
        var box, isAdd, index;
        if (e.target.nodeName !== 'TH') {
          return;
        }
        box = e.target.getBoundingClientRect();
        if (e.offsetX > box.width - 30 && e.offsetX < box.width - 10) {
          isAdd = true;
        } else if (e.offsetX < 30 && e.offsetX > 10) {
          isAdd = false;
        } else {
          return;
        }
        index = Array.from(e.target.parentNode.childNodes).indexOf(e.target);
        btools.qsAll('tr', this$.block).map(function(tr, i){
          if (isAdd) {
            return tr.insertBefore(tr.childNodes[index].cloneNode(true), tr.childNodes[index + 1]);
          } else {
            return tr.removeChild(tr.childNodes[index]);
          }
        });
        return this$.collab.action.editBlock(this$.block);
      });
    }
  };
});
blocksManager.code.add('map', function(module){
  return module.exports = {
    editable: false,
    custom: {
      attrs: ['lat', 'lng', 'zoom']
    },
    library: {
      gmaps: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCtTg4onCcl1CJpO_ly3VEYLrUxnXQY00E&callback=initMap'
    },
    text: function(text){
      var coder, this$ = this;
      coder = new google.maps.Geocoder();
      return coder.geocode({
        address: text
      }, function(res, status){
        if (status !== google.maps.GeocoderStatus.OK || !res[0]) {
          return;
        }
        this$.block.map.setCenter(res[0].geometry.location);
        return this$.block.map.setZoom(14);
      });
    },
    init: function(){
      var container, handler, this$ = this;
      container = this.block.querySelector('.container');
      if (!container) {
        return;
      }
      if (!window.initMap) {
        window.initMap = function(){
          var i$, ref$, ref1$, len$, func;
          for (i$ = 0, len$ = (ref$ = (ref1$ = window.initMap).list || (ref1$.list = [])).length; i$ < len$; ++i$) {
            func = ref$[i$];
            func();
          }
          return window.initMap.inited = true;
        };
      }
      if (!window.initMap.list) {
        window.initMap.list = [];
      }
      handler = function(){
        var container, options, map;
        container = this$.block.querySelector('.container');
        if (!container) {
          return;
        }
        options = {
          center: {
            lat: +(container.getAttribute('lat') || -34.397),
            lng: +(container.getAttribute('lng') || 150.644)
          },
          zoom: +(container.getAttribute('zoom') || 8),
          keyboardShortcuts: false
        };
        map = container.map = new google.maps.Map(container, options);
        google.maps.event.addListener(map, 'idle', function(){
          var center;
          center = map.getCenter();
          container.setAttribute('lat', center.lat());
          container.setAttribute('lng', center.lng());
          container.setAttribute('zoom', map.getZoom());
          if (this$.collab) {
            return this$.collab.action.editBlock(this$.block);
          }
        });
        return google.maps.event.addDomListener(container, 'mouseover', function(e){
          var evt;
          if (e._generated) {
            return;
          }
          evt = document.createEvent('MouseEvents');
          evt.initMouseEvent('mouseover', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          evt._generated = 1;
          return container.dispatchEvent(evt);
        });
      };
      if (!window.initMap.inited) {
        return window.initMap.list.push(handler);
      } else {
        return handler();
      }
    }
  };
});
blocksManager.code.add('video', function(module){
  return module.exports = {
    editable: false,
    transformText: function(text){
      var ret;
      if (/youtube\./.exec(text)) {
        ret = /v=(.+)[&#]?/.exec(text);
        return ret ? "https://www.youtube.com/embed/" + ret[1] : text;
      } else if (/vimeo\./.exec(text)) {
        if (/channels/.exec(text)) {
          ret = /vimeo\.com\/channels\/staffpicks\/([^?&#]+)/.exec(text);
        } else {
          ret = /vimeo\.com\/([^?&#]+)/.exec(text);
        }
        return ret ? "https://player.vimeo.com/video/" + ret[1] : text;
      } else {
        return "about:blank";
      }
      if (!/^https?:\/\//.exec(text)) {
        return "about:blank";
      }
    }
  };
});
blocksManager.code.add('iframe', function(module){
  return module.exports = {
    editable: false,
    transformText: function(text){
      var ret;
      ret = /src="([^"]+)"/.exec(text);
      return ret ? ret[1] : text;
    }
  };
});
blocksManager.code.add('image-compare', function(module){
  return module.exports = {
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
});
blocksManager.code.add('questionnaire', function(module){
  return module.exports = {
    custom: {
      attrs: ['score']
    },
    init: function(){
      var scoring, this$ = this;
      btools.qs('.result', this.block).map(function(it){
        return it.style.display = 'none';
      });
      btools.qs('.submit', this.block).map(function(it){
        return it.addEventListener('click', function(){
          var result, setActive;
          btools.qs('.result', this$.block).map(function(it){
            return it.style.display = 'block';
          });
          result = btools.qsAll('.choice.active', this$.block).map(function(it){
            return +(it.getAttribute('score') || 0);
          }).reduce(function(a, b){
            return a + b;
          }, 0);
          setActive = function(n, value){
            n.style.opacity = value ? 1 : 0.3;
            if (value) {
              return n.classList.add('text-danger');
            } else {
              return n.classList.remove('text-danger');
            }
          };
          return btools.qsAll('.result .card *[repeat-item]', this$.block).map(function(it){
            var ret;
            ret = /(\d+)\s*~\s*(\d+)/.exec(it.innerText);
            if (ret && result >= +ret[1] && result <= +ret[2]) {
              return setActive(it, true);
            }
            ret = /<\s*(\d+)/.exec(it.innerText);
            if (ret && result < +ret[1]) {
              return setActive(it, true);
            }
            ret = />\s*(\d+)/.exec(it.innerText);
            if (ret && result > +ret[1]) {
              return setActive(it, true);
            }
            it.style.opacity = 0.3;
            return setActive(it, false);
          });
        });
      });
      scoring = function(){
        var result;
        result = btools.qsAll('.choice.active', this.block).map(function(it){
          return +(it.getAttribute('score') || 0);
        }).reduce(function(a, b){
          return a + b;
        }, 0);
        btools.qs('.score', this.block).map(function(it){
          return it.innerText = result;
        });
        return btools.qs('.result', this.block).map(function(it){
          return it.style.display = 'none';
        });
      };
      return this.block.addEventListener('click', function(e){
        var target;
        target = e.target;
        if (!target.classList.contains('choice')) {
          return;
        }
        Array.from(target.parentNode.childNodes).map(function(it){
          if (it !== target && it.classList.contains('choice')) {
            return it.classList.remove('active');
          }
        });
        target.classList.toggle('active');
        return scoring();
      });
    }
  };
});
blocksManager.code.add('scrolling-timeline', function(module){
  return module.exports = {
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
});
blocksManager.code.add('branch', function(module){
  return module.exports = {
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
        console.log('branch-id', branchId);
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
          console.log(it, it.getAttribute('branch-id'), branchId);
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
});
blocksManager.code.add('branch-list', function(module){
  return module.exports = {
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
        console.log('branch-id', branchId);
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
          console.log(it, it.getAttribute('branch-id'), branchId);
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
});
blocksManager.code.add('slides', function(module){
  return module.exports = {
    change: function(){
      var slides, ref$;
      slides = btools.qsAll('.slides .slide', this.block);
      slides.map(function(it){
        var ref$;
        return ref$ = it.style, ref$.zIndex = 0, ref$.opacity = 0, ref$.transition = 'none', ref$.transform = "translate(0,0)", ref$;
      });
      return ref$ = slides[this.blockSlides.idx || 0].style, ref$.zIndex = 9, ref$.opacity = 1, ref$;
    },
    init: function(){
      var move, this$ = this;
      this.blockSlides = {
        idx: 0
      };
      this.change();
      move = function(dir){
        var slides, len, transition, oldidx, idx, ref$;
        slides = btools.qsAll('.slides .slide', this$.block);
        len = slides.length;
        transition = "all .3s ease-in-out";
        oldidx = this$.blockSlides.idx;
        idx = len > 1 ? (oldidx + dir + len * 2) % len : 0;
        ref$ = this$.blockSlides;
        ref$.idx = idx;
        ref$.oldidx = oldidx;
        if (idx === oldidx) {
          return;
        }
        ref$ = slides[oldidx].style;
        ref$.transition = 'none';
        ref$.zIndex = 9;
        ref$.opacity = 1;
        ref$.transform = "translate(0,0)";
        ref$ = slides[idx].style;
        ref$.transition = 'none';
        ref$.zIndex = 0;
        ref$.opacity = 0;
        ref$.transform = "translate(" + 100 * -dir + "%,0)";
        return setTimeout(function(){
          var ref$;
          ref$ = slides[oldidx].style;
          ref$.transition = transition;
          ref$.zIndex = 0;
          ref$.opacity = 0;
          ref$.transform = "translate(" + 100 * dir + "%,0)";
          return ref$ = slides[idx].style, ref$.transition = transition, ref$.zIndex = 9, ref$.opacity = 1, ref$.transform = "translate(0,0)", ref$;
        }, 0);
      };
      this.block.addEventListener('click', function(e){
        var target;
        target = e.target;
        while (target && target.classList) {
          if (target.classList.contains('fa-chevron-right')) {
            return move(-1);
          } else if (target.classList.contains('fa-chevron-left')) {
            return move(1);
          }
          target = target.parentNode;
        }
      });
      document.body.addEventListener('keydown', function(e){
        if (e.target === document.body) {
          if (e.keyCode === 37) {
            return move(-1);
          } else if (e.keyCode === 39) {
            return move(1);
          }
        }
      });
      return btools.qs('.slides > .slide', this.block).map(function(it){
        var ref$;
        return ref$ = it.style, ref$.opacity = 1, ref$.zIndex = 9, ref$.transform = "translate(0,0)", ref$.transition = 'none', ref$;
      });
    }
  };
});
blocksManager.code.add('navigation', function(module){
  return module.exports = {
    scroll: function(){
      var box, y, scrolltop;
      box = this.block.getBoundingClientRect();
      y = box.y < 0 ? scrolltop = -box.y : 0;
      this.navblock.style.position = 'absolute';
      return this.navblock.style.transform = "translate(0," + y + "px)";
    },
    init: function(){
      var this$ = this;
      return btools.qs('.navblock', this.block).map(function(navblock){
        this$.navblock = navblock;
        navblock.style.transform = "";
        window.addEventListener('scroll', function(it){
          return this$.scroll(it);
        });
        return this$.scroll();
      });
    }
  };
});
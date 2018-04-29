// Generated by LiveScript 1.3.0
blocksManager.code.add('blank', function(module){
  return module.exports = {
    wrap: function(){}
  };
});
blocksManager.code.add('hr', function(module){
  return module.exports = {
    config: {
      editable: false
    }
  };
});
blocksManager.code.add('speaker', function(module){
  return module.exports = {
    wrap: function(){}
  };
});
blocksManager.code.add('gallery', function(module){
  return module.exports = {
    config: {
      editable: false
    },
    wrap: function(block){
      var root, dialog, content, inner;
      if (block.inited) {
        return;
      }
      block.inited = true;
      block.addEventListener('click', function(e){
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
blocksManager.code.add('footer', function(module){
  return module.exports = {
    wrap: function(){}
  };
});
blocksManager.code.add('map', function(module){
  return module.exports = {
    custom: {
      attrs: ['lat', 'lng', 'zoom']
    },
    handle: {
      text: function(node, text){
        var coder, this$ = this;
        coder = new google.maps.Geocoder();
        return coder.geocode({
          address: text
        }, function(res, status){
          if (status !== google.maps.GeocoderStatus.OK || !res[0]) {
            return;
          }
          node.map.setCenter(res[0].geometry.location);
          return node.map.setZoom(14);
        });
      }
    },
    config: {
      editable: false
    },
    wrap: function(node, collab, viewMode){
      var container, handler, this$ = this;
      container = node.querySelector('.container');
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
        var options, map;
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
          if (collab) {
            return collab.action.editBlock(node);
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
    },
    library: {
      gmaps: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCtTg4onCcl1CJpO_ly3VEYLrUxnXQY00E&callback=initMap'
    }
  };
});
blocksManager.code.add('video', function(module){
  return module.exports = {
    handle: {
      text: function(node, text){}
    },
    transform: {
      text: function(text){
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
    },
    config: {
      editable: false
    }
  };
});
blocksManager.code.add('iframe', function(module){
  return module.exports = {
    config: {
      editable: false
    },
    transform: {
      text: function(text){
        var ret;
        ret = /src="([^"]+)"/.exec(text);
        return ret ? ret[1] : text;
      }
    }
  };
});
blocksManager.code.add('image-compare', function(module){
  return module.exports = {
    handle: {
      resize: function(node){
        return btools.qs('.container', node).map(function(container){
          var box, thumbs;
          box = container.getBoundingClientRect();
          btools.qsAll('.thumb', node).map(function(it){
            return it.style.backgroundSize = box.width + "px auto";
          });
          btools.qs('.ctrl', node).map(function(it){
            return it.style.left = box.width * 0.5 + "px";
          });
          thumbs = btools.qsAll('.thumb', node);
          thumbs[0].style.width = box.width * 0.5 + "px";
          return thumbs[1].style.width = box.width * 0.5 + "px";
        });
      }
    },
    config: {
      editable: false
    },
    wrap: function(node){
      var container, dragging, this$ = this;
      container = node.querySelector('.container');
      if (!container) {
        return;
      }
      dragging = false;
      node.addEventListener('mousedown', function(e){
        return dragging = true;
      });
      node.addEventListener('mousemove', function(e){
        var box, x, thumbs;
        if (!dragging) {
          return;
        }
        box = container.getBoundingClientRect();
        x = e.clientX - box.x;
        btools.qs('.ctrl', node).map(function(it){
          return it.style.left = (e.clientX - box.x) + "px";
        });
        thumbs = btools.qsAll('.thumb', node);
        thumbs[0].style.width = x + "px";
        return thumbs[1].style.width = (box.width - x) + "px";
      });
      node.addEventListener('mouseup', function(e){
        return dragging = false;
      });
      window.addEventListener('resize', function(){
        return this$.handle.resize(node);
      });
      return this.handle.resize(node);
    }
  };
});
blocksManager.code.add('questionnaire', function(module){
  return module.exports = {
    custom: {
      attrs: ['score']
    },
    wrap: function(node){
      var scoring;
      btools.qs('.result', node).map(function(it){
        return it.style.display = 'none';
      });
      btools.qs('.submit', node).map(function(it){
        return it.addEventListener('click', function(){
          var result, setActive;
          btools.qs('.result', node).map(function(it){
            return it.style.display = 'block';
          });
          result = btools.qsAll('.choice.active', node).map(function(it){
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
          return btools.qsAll('.result .card *[repeat-item]', node).map(function(it){
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
        result = btools.qsAll('.choice.active', node).map(function(it){
          return +(it.getAttribute('score') || 0);
        }).reduce(function(a, b){
          return a + b;
        }, 0);
        btools.qs('.score', node).map(function(it){
          return it.innerText = result;
        });
        return btools.qs('.result', node).map(function(it){
          return it.style.display = 'none';
        });
      };
      return node.addEventListener('click', function(e){
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
        cnode = node;
        for (i$ = 0, len$ = (ref$ = btools.qsAll('.timeline .item', node)).length; i$ < len$; ++i$) {
          item = ref$[i$];
          if (cnode) {
            item.classList.remove('active');
            if (cnode === node) {
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
        row = node.querySelector('.container');
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
});
blocksManager.code.add('branch', function(module){
  return module.exports = {
    custom: {
      attrs: ['branch-id', 'branch-target']
    },
    handle: {
      change: function(node, blocks, viewMode){
        var ref$, last, idx, update, i$, to$, i;
        viewMode == null && (viewMode = false);
        blocks = btools.qsAll('.block-item');
        ref$ = [-1, -1], last = ref$[0], idx = ref$[1];
        if (viewMode && this.inited) {
          return;
        }
        if (viewMode) {
          this.inited = true;
        }
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
      }
    },
    destroy: function(){
      if (btools.qsAll('.block-branch').length <= 1) {
        return btools.qsAll('.block-branch-no').map(function(it){
          return it.classList.remove('block-branch-no', 'block-branch-no1', 'block-branch-no2', 'block-branch-no3');
        });
      }
    },
    wrap: function(node, collab, viewMode, branching){
      var hint;
      branching == null && (branching = false);
      if (!branching) {
        this.handle.change(node, null, viewMode);
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
        var branchId, target, ref$, first, last, cnode, next;
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
        cnode = node.nextSibling;
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
          newnode.sourceBranch = node;
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
    }
  };
});
blocksManager.code.add('event-quote', function(module){
  return module.exports = {
    wrap: function(){}
  };
});
function import$(e,t){var n={}.hasOwnProperty;for(var r in t)n.call(t,r)&&(e[r]=t[r]);return e}var x$;x$=angular.module("webedit"),x$.service("nodeProxy",["$rootScope"].concat(function(){var e;return e=function(t,n){var r,i,o;return null==n&&(n=!0),r=t,i="_node-proxy-"+Math.random().toString(16).substring(2),t.setAttribute(i,!0),n&&e.collab.action.editBlock(t),o=function(){return document.querySelector("["+i+"]")||function(){throw new Error("node "+i+" not found")}()},o.destroy=function(){var t;return t=o(),t.removeAttribute(i),n&&e.collab.action.editBlock(t),t},o},e.init=function(t){return e.collab=t},e})),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports,exports.custom&&exports.custom.attrs&&puredom.useAttr(exports.custom.attrs)),res(this$.cache[name])})})}}})),x$.service("webSettings",["$rootScope"].concat(function(){var e;return e={unit:{},style:{},info:{},list:["fontFamily","backgroundPositionX","backgroundPositionY","backgroundRepeat","backgroundAttachment","backgroundSize","fontWeight","boxShadow","animationName","backgroundImage","backgroundColor","color","fontSize","marginTop","marginBottom","marginLeft","marginRight","paddingTop","paddingBottom","paddingLeft","paddingRight","borderTopWidth","borderLeftWidth","borderRightWidth","borderBottomWidth","borderTopColor","borderLeftColor","borderRightColor","borderBottomColor"],option:{fontFamily:[{name:"Default",value:"default"},{name:"Arial",value:"Arial"},{name:"Helvetica Neue",value:"Helvetica Neue"},{name:"Tahoma",value:"Tahoma"},{name:"Raleway",value:"Raleway"},{name:"微軟正黑體",value:"Microsoft JhengHei"},{name:"黑體(繁)",value:"Heiti TC"},{name:"黑體(簡)",value:"Heiti SC"},{name:"蘋方體(繁)",value:"PingFangTC-Regular"},{name:"細明體",value:"MingLiU"},{name:"標楷體",value:"DFKai-sb"}],backgroundPositionX:["default","left","center","right"],backgroundPositionY:["default","top","center","bottom"],backgroundRepeat:["default","repeat","repeat-x","repeat-y","no-repeat"],backgroundAttachment:["default","scroll","fixed","local"],backgroundSize:["default","cover","contain","auto"],fontWeight:["default","200","300","400","500","600","700","800","900"],boxShadow:["default","none","light","modest","heavy"],animationName:["inherit","none","bounce","slide","fade"]},setBlock:function(e){var t=this;return this.style={},(e.getAttribute("style")||"").split(";").map(function(e){var n,r;return e=e.split(":").map(function(e){return e.trim()}),e[1]&&e[0]?(n=e[0].split("-").map(function(e,t){return t?e[0].toUpperCase()+e.substring(1):e}).join(""),r=e[1],t.style[n]=r):void 0}),import$(this.info,{id:"#"+e.getAttribute("id")}),this.block=e}},["marginLeft","marginTop","marginRight","marginBottom","paddingLeft","paddingTop","paddingRight","paddingBottom","borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth","fontSize"].map(function(t){return e.unit[t]="px"}),["animationDuration","animationDelay"].map(function(t){return e.unit[t]="s"}),e})),x$.controller("webSettings",["$scope","$timeout","webSettings","collaborate"].concat(function(e,t,n,r){return e.settings=n,e.reset=function(){return e.settings.style={}},e.setBackgroundImage=function(){var t,n;return t="1024x1024",n=uploadcare.openDialog(null,null,{imageShrink:t,crop:"free"}),n.done(function(t){var n,r;return n=((r=t.files)?r():[t])[0],e.settings.style.backgroundImage="url(/assets/img/loader/msg.svg)",n.done(function(t){return e.settings.style.backgroundImage="url("+t.cdnUrl+")"})})},e.actionHandle=null,e.$watch("settings.style",function(){var i,o,a,l,u;if(n.block){for(i=0,a=(o=e.settings.list).length;a>i;++i)l=o[i],u=e.settings.style[l],n.block.style[l]=u&&"default"!==u?u+(n.unit[l]||""):e.settings.style[l]="";return e.actionHandle&&(t.cancel(e.actionHandle),e.actionHandle=null),e.actionHandle=t(function(){return r.action.editStyle(n.block,n.block===document.querySelector("#editor > .inner"))},1e3)}},!0)})),x$.controller("editor",["$scope","$interval","$timeout","ldBase","blockLoader","collaborate","global","webSettings","nodeProxy"].concat(function(e,t,n,r,i,o,a,l,u){var c,s,d,g,h,f,m,p,b,v,y,A,x,k;return e.loading=!0,u.init(o),c={change:function(e){var t=this;return this.change.handle&&n.cancel(this.change.handle),this.change.handle=n(function(){return t.change.handle=null,Array.from(document.querySelector("#editor .inner").querySelectorAll(".block-item")).map(function(t){return i.get(t.getAttribute("base-block")).then(function(n){return n&&n.exports&&n.exports.handle&&n.exports.handle.change?n.exports.handle.change(t,e):void 0})})},1e3)},editBlockAsync:function(e){var t=this;return this.editBlockAsync.handle&&n.cancel(this.editBlockAsync.handle),this.editBlockAsync.handle=n(function(){return t.editBlockAsync.handle=null,t.change([e]),o.action.editBlock(e)},500)},editBlock:function(e){return this.change([e]),o.action.editBlock(e)},insertBlock:function(e){return this.change([e]),o.action.insertBlock(e)},deleteBlock:function(e){return this.change([e]),i.get(e.getAttribute("base-block")).then(function(t){return t&&t.exports&&t.exports.destroy&&t.exports.destroy(e),o.action.deleteBlock(e)})},moveBlock:function(e,t){return this.change([e,t]),o.action.moveBlock(e,t)},setThumbnail:function(e){return o.action.setThumbnail(e)}},s={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","indent"].map(function(e){return{name:e,contentDefault:"<i class='fa fa-"+e+"'></i>"}}).concat(["h1","h2","h3","h4"],[{name:"orderedlist",contentDefault:"<i class='fa fa-list-ol'></i>"},{name:"unorderedlist",contentDefault:"<i class='fa fa-list-ul'></i>"},{name:"foreColor",contentDefault:"<i class='fa fa-adjust'></i>"},{name:"backColor",contentDefault:"<i class='fa fa-paint-brush'></i>"},{name:"borderColor",contentDefault:"<i class='fa fa-square-o'></i>"},{name:"align-left",contentDefault:"1"},{name:"align-center",contentDefault:"2"},{name:"align-right",contentDefault:"3"},{name:"anchor",contentDefault:"<i class='fa fa-link'></i>"},{name:"removeFormat",contentDefault:"<i class='fa fa-eraser'></i>"}])},extensions:{alignLeft:mediumEditorAlignExtention.left,alignCenter:mediumEditorAlignExtention.center,alignRight:mediumEditorAlignExtention.right,backColor:new mediumEditorStyleExtension.backColor,foreColor:new mediumEditorStyleExtension.foreColor,borderColor:new mediumEditorStyleExtension.borderColor},spellcheck:!1}),this.list.push(t),t.subscribe("editableInput",function(e,t){return c.editBlock(t)}),t}},d={init:function(){return this.handle=document.querySelector("#editor-image-handle")},aspect:{lock:!1,toggle:function(e){return this.lock=null!=e?e:!this.lock}},click:function(e){var t,n,r,i,o,a,l;return e&&(this.target=e),this.target?(e=this.target,t=u(e),n=this.target.getBoundingClientRect(),r=Math.round(2*(n.width>n.height?n.width:n.height)),r>1024&&(r=1024),i=r+"x"+r,o=/url\("([^"]+)"\)/.exec(window.getComputedStyle(e).backgroundImage||""),a=o?o[1]:null,a=uploadcare.fileFrom("url",a),l=uploadcare.openDialog(a,null,{multiple:!!e.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),l.fail(function(){return t.destroy()}),l.done(function(e){return Promise.resolve().then(function(){var n,r,i;return n=(r=e.files)?r():[e],1===n.length?(t().style.backgroundImage="url(/assets/img/loader/msg.svg)",n[0].done(function(e){return t().style.backgroundImage="url("+e.cdnUrl+")",c.editBlock(t.destroy()),c.setThumbnail(e.cdnUrl+"/-/preview/1200x630/")})):(i=t().parentNode.querySelectorAll("[image]"),Array.from(i).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(n.map(function(e){return e.promise()})).then(function(e){var n,r,i,o,a,l;for(n=[t().parentNode.querySelectorAll("[image]"),0],r=n[0],i=n[1],o=0,a=r.length;a>o;++o)l=o,r[l].style.backgroundImage="url("+e[i].cdnUrl+")",i=(i+1)%e.length;return c.editBlock(t.destroy()),c.setThumbnail(e[0].cdnUrl+"/-/preview/1200x630/")}))})["catch"](function(){return alert("the image node you're editing is removed by others.")})})):void 0},resizable:function(e){var t=this;return null==e&&(e=[]),Array.isArray(e)||(e=[e].filter(function(e){return e})),e.map(function(e){return"bk"===e.getAttribute("image")||e.resizabled?void 0:(e.resizabled=!0,e.addEventListener("mousedown",function(e){var t,n,r,i;return t=[e.offsetX,e.offsetY],n=t[0],r=t[1],i=this.getBoundingClientRect(),t=[n/i.width,r/i.height],n=t[0],r=t[1],.1>n||n>.9||.1>r||r>.9?(e.preventDefault(),e.stopPropagation()):void 0}),interact(e).resizable({edges:{left:!0,right:!0,bottom:!0,top:!0}}).on("resizemove",function(r){var i,o,a,l;return i=r.target,o=i.getBoundingClientRect().width+r.deltaRect.width,a=i.getBoundingClientRect().height+r.deltaRect.height,l=+i.getAttribute("image-ratio"),(isNaN(l)||!l)&&(l=.01*Math.round(100*o/(a||1)),i.setAttribute("image-ratio",l)),t.aspect.lock&&(r.deltaRect.width?a=o/l:r.deltaRect.width&&(o=a*l)),i.style.width=o+"px",i.style.height=a+"px",i.style.flex="0 0 "+o+"px",i.style.transition="none",e.handle&&n.cancel(e.handle),e.handle=n(function(){return i.style.flex="1 1 auto",e.handle=null,i.style.transition=".5s all cubic-bezier(.3,.1,.3,.9)"},500),c.editBlockAsync(i)}))})}},d.init(),g={elem:null,coord:{x:0,y:0},init:function(){var e=this;return this.elem=document.querySelector("#editor-text-handle"),this.elem.addEventListener("mouseover",function(){return e.timeout?(n.cancel(e.timeout),e.timeout=null):void 0}),this.elem.addEventListener("keypress",function(t){return 13===t.keyCode&&e.save(),e.timeout?(n.cancel(e.timeout),e.timeout=null):void 0}),this.elem.addEventListener("click",function(t){return t.target.classList.contains("medium-editor-toolbar-save")?e.save():t.target.classList.contains("medium-editor-toolbar-close")?e.toggle(null):void 0})},save:function(){var e,t,n=this;return e=this.elem.querySelector("input").value,t=o.action.info(this.target),i.get(t[3]).then(function(t){var r;return((r=t.exports||(t.exports={})).transform||(r.transform={})).text&&(e=((r=t.exports||(t.exports={})).transform||(r.transform={})).text(e)),e&&n.target.setAttribute(n.target.getAttribute("edit-text"),e),((r=t.exports||(t.exports={})).handle||(r.handle={})).text&&((r=t.exports||(t.exports={})).handle||(r.handle={})).text(n.target,e),c.editBlock(n.target),n.toggle(null)})},toggle:function(e){var t=this;return null==e&&(e={}),this.timeout&&(n.cancel(this.timeout),this.timeout=null),e.delay?this.timeout=n(function(){return t._toggle(e)},e.delay):this._toggle(e)},_toggle:function(e){var t,n,r,i,o,a,l,u,c;return t=e.node,n=e.inside,r=e.text,i=e.placeholder,this.elem||this.init(),i&&this.elem.querySelector("input").setAttribute("placeholder",i),o="ldt-slide-bottom-in",t!==this.target&&this.elem.classList.remove(o),t?(a=[t,t.getBoundingClientRect()],this.target=a[0],l=a[1],u={x:l.x+.5*l.width-150+"px",y:l.y-39+document.scrollingElement.scrollTop+"px"},c=this.elem.style,c.left=u.x,c.top=u.y,c.display="block",this.elem.classList.add("ld",o),import$(this.coord,u),this.elem.querySelector("input").value=r):this.elem.style.display="none"}},g.init(),h={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var n,r,i,o;if(e.target)return n=e.target,r=n.parentNode,i=t.target.getAttribute("class"),/fa-clone/.exec(i)?(o=n.cloneNode(!0),o.setAttribute("edit-transition","jump-in"),f.initChild(o),o.getAttribute("image")&&d.resizable(o),r.insertBefore(o,n.nextSibling),setTimeout(function(){return o.setAttribute("edit-transition","jump-in"),c.editBlock(r)},800)):/fa-trash-o/.exec(i)?(n.setAttribute("edit-transition","jump-out"),setTimeout(function(){return r.removeChild(n),c.editBlock(r),e.toggle(null)},400)):/fa-link/.exec(i)||(/fa-camera/.exec(i)?d.click(e.target):/fa-lock/.exec(i)?(t.target.classList.add("fa-unlock-alt"),t.target.classList.remove("fa-lock"),d.aspect.toggle(!1)):/fa-unlock-alt/.exec(i)&&(t.target.classList.add("fa-lock"),t.target.classList.remove("fa-unlock-alt"),d.aspect.toggle(!0))),e.elem.style.display="none",c.editBlock(r)})},coord:{x:0,y:0},toggle:function(e){var t,n,r,i,o,a;return null==e&&(e={}),this.elem||this.init(),t="ldt-bounce-in",n=e.node,n!==this.target&&this.elem.classList.remove(t),n?(this.elem.classList[e.noRepeat?"add":"remove"]("no-repeat"),this.elem.classList[e.image?"add":"remove"]("image"),this.elem.classList[e.aspectRatio?"add":"remove"]("aspect-ratio"),r=[n,n.getBoundingClientRect()],this.target=r[0],i=r[1],o={x:i.x+i.width+5+(e.inside?-20:0)+"px",y:i.y+.5*i.height-22+document.scrollingElement.scrollTop+"px"},a=this.elem.style,a.left=o.x,a.top=o.y,a.display="block",this.elem.classList.add("ld",t),import$(this.coord,o)):this.elem.style.display="none"}},h.init(),f={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(t){var n,r;return n=(r=t.getAttribute("repeat-class"))?"."+r:t.childNodes.length?(r=t.childNodes[0]&&(t.childNodes[0].getAttribute("class")||"").split(" ")[0].trim())?"."+r:t.nodeName:"div",Sortable.create(t,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:n,dragoverBubble:!0,onEnd:function(){return c.editBlock(e)}})})},init:function(e,t){var n,r=this;return null==t&&(t=!1),this.initChild(e),n=null,t?void 0:(e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("keypress",function(e){var t,n,r,i,a;if(e.target&&(t=window.getSelection(),t&&!(t.rangeCount=0)&&(n=t.getRangeAt(0),r=n.startContainer,3===r.nodeType&&(r=r.parentNode),!r.getAttribute("eid")))){for(i=0;100>i&&(a=Math.random().toString(16).substring(2),document.querySelector("[eid='"+a+"']"));)i++;return 100>i&&r.setAttribute("eid",a),o.action.editBlock(r)}}),e.addEventListener("mousedown",function(t){var n,i;return Array.from(e.parentNode.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),n=t.target,i=r.search(n,document.createRange(),{x:t.clientX,y:t.clientY}),!n.innerHTML.replace(/(<br>\s*)*/,"").trim()||i&&i.length&&i[0]&&i[1]<i[0].length&&i[1]>=0&&i[2]<800?"true"===n.getAttribute("editable")?n.setAttribute("contenteditable",!0):e.setAttribute("contenteditable",!0):void 0}),e.addEventListener("mousemove",function(e){var t,n,i,o;if(!e.buttons){for(t=e.target,n=r.search(e.target,document.createRange(),{x:e.clientX,y:e.clientY});t&&t.getAttribute&&!t.getAttribute("repeat-item");)t=t.parentNode;t&&t.getAttribute&&(i=window.getSelection(),0===i.extentOffset&&(!n||null==n[2]||n[2]>800)?e.target.setAttribute("contenteditable",!1):e.target.setAttribute("contenteditable",!0))}for(t=e.target;t&&t.getAttribute&&!t.getAttribute("image")&&!t.getAttribute("repeat-item");)t=t.parentNode;return t&&t.getAttribute?(o=t.getAttribute("image"),h.toggle({node:t,inside:!0,noRepeat:!t.getAttribute("repeat-item"),image:!!o,aspectRatio:!(!o||"bk"===o)})):void 0}),e.addEventListener("mouseover",function(e){var t,n,r;for(t=e.target;t&&t.getAttribute&&!t.getAttribute("edit-text");)t=t.parentNode;return t&&t.getAttribute?(n=t.getAttribute(t.getAttribute("edit-text")),r=t.getAttribute("edit-text-placeholder")||"enter some text...",g.toggle({node:t,inside:!0,text:n,placeholder:r})):g.toggle({delay:500})}),e.addEventListener("click",function(t){var i,o,a,l,u,c,s,d,g,f;if(i=null,o=!1,a=window.getSelection(),a.rangeCount>0){if(l=window.getSelection().getRangeAt(0),l.startOffset<l.endOffset||!l.collapsed)return;i=[l.startContainer,l.startOffset]}for(u=t.target;u&&u.parentNode&&u.getAttribute&&!u.getAttribute("repeat-item");)u=u.parentNode;if(h.toggle(u&&u.getAttribute&&u.getAttribute("repeat-item")?{node:u}:null),t.target&&t.target.getAttribute&&t.target.getAttribute("repeat-item"))return u=t.target,u.setAttribute("contenteditable",!0),u.focus(),a=window.getSelection(),a.rangeCount?l=a.getRangeAt(0):(l=document.createRange(),a.addRange(l)),l.collapse(!1),void l.selectNodeContents(u);for(u=t.target,c=u.getAttribute("editable"),"false"===c&&(o=!0),u.removeAttribute("contenteditable");u&&"true"!==u.getAttribute("editable");){if(u.getAttribute("image")&&"bk"!==u.getAttribute("image")||"false"===u.getAttribute("editable")){o=!0;break}if(u.parentNode&&"true"===u.parentNode.getAttribute("repeat-host"))break;if(!u.parentNode)return;if(u===e)break;u=u.parentNode}return u.setAttribute("contenteditable",!o),!o&&(u.focus(),a=window.getSelection(),0!==a.rangeCount&&(l=a.getRangeAt(0),s=(d=i)?d:r.search(u,l,{x:t.clientX,y:t.clientY}),s&&0!==s.length))?(g=(d=document.caretPositionFromPoint)?d(t.clientX,t.clientY):document.caretRangeFromPoint(t.clientX,t.clientY),s[0]=g.startContainer,s[1]=g.startOffset,n&&t.shiftKey&&t.target.getAttribute("repeat-item")?(f=[[n.startContainer,n.startOffset],[s[0],s[1]]],f[0][1]>f[1][1]&&(f=[f[1],f[0]]),l.setStart(f[0][0],f[0][1]),l.setEnd(f[1][0],f[1][1])):(l.setStart(s[0],s[1]),l.collapse(!0)),n=l):void 0}))},search:function(e,t,n,r){var i,o,a,l,u,c,s,d,g,h,f,m,p,b,v;for(null==r&&(r=!0),i=[],o=0,a=e.childNodes.length;a>o;++o)if(l=o,u=e.childNodes[l],"#text"!==u.nodeName)u.getBoundingClientRect&&(p=u.getBoundingClientRect(),p.x<=n.x&&p.y<=n.y&&(i=i.concat(this.search(u,t,n,!1))));else{for(c=[-1,-1,-1],s=c[0],d=c[1],g=c[2],h=0,f=u.length+1;f>h;++h)if(m=h,t.setStart(u,m),p=t.getBoundingClientRect(),b=p.height,p.x<=n.x&&p.y<=n.y)s=m,d=(n.x-p.x-.5*b)/b*16,g=(n.y-p.y-.5*b)/b*16;else if(p.x>n.x&&p.y>n.y)break;s>=0&&i.push([u,s,d,g])}if(!r||!i.length)return i;for(i=i.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),c=[i[0][2],0],v=c[0],s=c[1],o=1,a=i.length;a>o;++o)l=o,i[l][2]<v&&(c=[i[l][2],l],v=c[0],s=c[1]);return i[s]}},m={share:{modal:{},link:window.location.origin+(window.location.pathname+"/view").replace(/\/\//g,"/"),"public":!1,setPublic:function(e){return this["public"]!==e?(this["public"]=e,o.action.setPublic(this["public"])):void 0}},prepare:function(t){var n;return n=document.querySelector("#editor > .inner"),n.setAttribute("style",t.style||""),n.style.width=e.config.size.value+"px",this.share.setPublic((t.attr||{}).isPublic)}},p={library:{root:null,loaded:{},scripts:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.loaded[e]?void 0:i.get(e)}).then(function(n){var r,i,o,a,l;if(null==n&&(n={}),t.root||(t.root=document.querySelector("#editor-library")),r=(n.exports||(n.exports={})).library){i=document.createElement("div");for(o in r)a=r[o],t.scripts[a]||(l=t.scripts[a]=document.createElement("script"),l.setAttribute("type","text/javascript"),l.setAttribute("src",a),t.root.appendChild(l));return t.loaded[e]=!0}})}},style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:i.get(e)}).then(function(e){var n;return n=document.createElement("style"),n.setAttribute("type","text/css"),n.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(n)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},remove:function(e){return c.deleteBlock(e).then(function(){return e.parentNode.removeChild(e),b.handles.hide(e)})},init:function(){var e;c.change();try{if("undefined"!=typeof _jf&&null!==_jf&&_jf.flush)return _jf.flush()}catch(t){return e=t,console.log(e)}},clone:function(e){var t;if(e.childNodes[0])return t=e.childNodes[0].innerHTML,this.prepare(t,{highlight:!0,idx:Array.from(e.parentNode.childNodes).indexOf(e)+1,name:e.getAttribute("base-block"),source:!0,style:e.getAttribute("style")})},prepareHandle:{},prepareAsync:function(e,t){var r=this;return null==t&&(t={idx:0}),new Promise(function(i,o){var a;return a=t.idx||0,r.prepareHandle[a]&&n.cancel(r.prepareHandle[a]),r.prepareHandle[a]=n(function(){return r.prepareHandle[a]=0,r.prepare(e,t).then(function(e){return i(e)})["catch"](function(e){return o(e)})},10)})},prepare:function(t,n){var r,a,l,u,g,h,m,v,y,A,x,k,w,S=this;if(null==n&&(n={source:!0}),b.cursor.save(),r=n.name,a=n.idx,l=n.redo,u=n.style,g=n.source,h=null,"string"==typeof t&&(h=t,t=document.createElement("div"),m=document.querySelector("#editor > .inner"),m.insertBefore(t,m.childNodes[a]),b.placeholder.remove()),n.content&&(v=Array.from(t.childNodes).filter(function(e){return/inner/.exec(e.getAttribute("class"))})[0],v&&(v.innerHTML=puredom.sanitize(n.content))),r=r||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){var n;return"base-block"!==(n=e.name)&&"style"!==n?t.removeAttribute(e.name):void 0}),t.setAttribute("class","initializing"),y=n.eid)A=y;else if(y=t.getAttribute("eid"))A=y;else for(x=0;100>x&&(k=x,A=Math.random().toString(16).substring(2),document.querySelector("[eid='"+A+"']"));++x);return t.setAttribute("eid",A),t.setAttribute("id","block-id-"+A),w=i.get(r).then(function(i){var a,m,v,y;if(t.setAttribute("class","block-item block-"+r),t.setAttribute("base-block",r),!l){for(a=document.createElement("div"),a.setAttribute("class","inner"),a.innerHTML=h?puredom.sanitize(h):i.html,u&&t.setAttribute("style",u);t.lastChild;)t.removeChild(t.lastChild);t.appendChild(a),m=document.createElement("div"),m.setAttribute("class","handle ld ldt-float-left-in"),m.innerHTML=["arrows","clone","cog","trash-o"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),m.addEventListener("click",function(n){var r;return r=n.target.classList,r.contains("fa-trash-o")?S.remove(t):r.contains("fa-clone")?S.clone(t):r.contains("fa-cog")?e.blockConfig.toggle(t):void 0}),t.appendChild(m),t.addEventListener("dragstart",function(){return s.pause()}),t.addEventListener("dragend",function(){return s.resume()}),t.addEventListener("drop",function(){return s.resume()}),p.style.add(r),p.library.add(r),g&&c.insertBlock(t)}return!l&&n.highlight&&t.classList.add("ld","ldt-jump-in","fast"),a=t.querySelector(".block-item > .inner"),d.resizable(Array.from(a.querySelectorAll("*[image]"))),((v=i.exports||(i.exports={})).config||(v.config={})).editable!==!1&&(y=s.prepare(a)),f.init(a,l),i.exports&&i.exports.wrap&&i.exports.wrap(t,o,!1),b.cursor.load()})}},e.css={init:function(){var t=this;return this.node=document.querySelector("#editor-css"),this.style=document.querySelector("#editor-css style"),e.$watch("css.inline.value",function(e,n){return e!==n?(o.action.css.editInline(e),t.style.innerText=e):void 0}),e.$watch("css.theme.value.name",function(t,n){return t!==n?o.action.css.editTheme(e.css.theme.value):void 0}),this.theme.value=this.theme.list[0]},prepare:function(t){var n=this;return null==t&&(t={}),e.force$apply(function(){var e;return n.inline.value=t.inline,n.theme.value=t.theme,(e=n.links).list=e.list.concat(t.links)})},theme:{value:{},list:{name:"Default"},update:function(t){var n=this;return e.force$apply(function(){return n.value=t})}},inline:{value:"",update:function(t){var n=this;return e.force$apply(function(){return n.value=t})}},links:{value:null,list:[],add:function(t,n){var r=this;return null==n&&(n=!1),e.force$apply(function(){return t&&(r.list.push(t),n)?(o.action.css.addLink(t),r.value=null):void 0})},remove:function(t,n){var r=this;return null==n&&(n=!1),e.force$apply(function(){var e;if(t&&(e=r.list.indexOf(t),~e&&(r.list.splice(e,1),n)))return o.action.css.removeLink(t),r.value=null})}}},e.css.init(),b={user:e.user,css:e.css,handles:{hide:function(){return h.toggle(null),g.toggle(null)}},online:{defaultCountdown:10,state:!0,code:null,retry:function(){return b.loading.toggle(!0),this.state=!0,n(function(){return o.init(document.querySelector("#editor .inner"),b)},100),!this.retry.countdown||this.retry.countdown<0?this.retry.countdown=this.defaultCountdown:this.retry.countdown--},toggle:function(t,n){var r=this;return null==n&&(n={}),e.force$apply(function(){return!n&&r.retry.countdown?r.retry():(r.code=n.code,b.online.state=t,b.loading.toggle(!0))})}},loading:{toggle:function(t){return e.force$apply(function(){return e.loading=null!=t?t:!e.loading})}},server:(v={},v.domain=a.domain,v.scheme=a.scheme,v),collaborator:{list:{},count:0,init:function(){var e=this;return n(function(){var t,n,r,i=[];e.count=0;for(t in n=e.list||{})r=n[t],e.list[t].cbox=b.cursor.toBox(e.list[t].cursor||{}),i.push(e.count++);return i},0)},handle:function(e){var t,n,r,i;if("init"===e.action)return this.list=e.data,this.init();if("join"===(t=e.action)||"update"===t){if(this.list[e.key]||this.count++,this.list[e.key]=import$(this.list[e.key]||{},e.data),n=this.list[e.key].cursor)return this.list[e.key].cbox=b.cursor.toBox(n)}else if("exit"===e.action&&this.list[e.key])return this.count--,i=(t=this.list)[r=e.key],delete t[r],i}},cursor:{state:null,get:function(){var e,t;return e=window.getSelection(),e.rangeCount?(t=e.getRangeAt(0),{startSelector:btools.getEidSelector(t.startContainer),startOffset:t.startOffset,endSelector:btools.getEidSelector(t.endContainer),endOffset:t.endOffset}):null},save:function(){return this.state=this.get()},toBox:function(e){var t,n,r,i;return t=this.toRange(e),n=document.querySelector("#editor > .inner").getBoundingClientRect(),t&&n?(r=t.getBoundingClientRect(),i=[r.x-n.x,r.y-n.y],r.x=i[0],r.y=i[1],i={blur:r.x<0||r.x>n.width},i.x=r.x,i.y=r.y,i.width=r.width,i.height=r.height,i):void 0},toRange:function(e){var t,n,r,i;if(t=document.createRange(),n=btools.fromEidSelector(e.startSelector),r=btools.fromEidSelector(e.endSelector),!n)return null;try{t.setStart(n,e.startOffset),r&&t.setEnd(r,e.endOffset)}catch(o){return i=o,null}return t},load:function(){var e,t;if(this.state&&(e=window.getSelection(),t=this.toRange(this.state)))return e.removeAllRanges(),e.addRange(t),this.state=null}},page:m,block:p,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,n,r,i;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),n=document.querySelector("#editor-style"),r=document.querySelector("#page-basic"),this.prune(t),i=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+n.innerHTML+'\n<style type="text/css"> '+r.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>",puredom.sanitize(i)}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,sort:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},filter:".unsortable",preventOnFilter:!1,disabled:!1,draggable:".block-item",dragoverBubble:!0,scrollSensitivity:60,scrollSpeed:30,onAdd:function(e){return p.prepare(e.item)},onEnd:function(e){return e.oldIndex!==e.newIndex?c.moveBlock(e.oldIndex,e.newIndex):void 0}}),y=document.querySelector("#editor > .inner"),y.addEventListener("dragover",function(){return b.placeholder.remove()}),e.collaborator=b.collaborator,e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=b["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return document.querySelector("#editor-preview iframe").setAttribute("src",m.share.link+"?preview=true"),this.modal.ctrl.toggle(!0)}},e.config={modal:{},size:{value:1024,name:"1024px",resizeAsync:r.async("resize",function(){var t=this;return e.force$apply(function(){var e,n,r,i,o;for(e=window.innerWidth-360,n=0,i=(r=[1440,1200,1024,800,640,480]).length;i>n&&(o=r[n],!(e>o));++n);return t.set(o+"px")})}),relayout:function(){var e,t,n;return e=document.querySelector("#blocks-picker"),t=document.querySelector("#collab-info"),n=document.querySelector(".editor-preview-modal .cover-modal-inner"),e.style.right=this.value+Math.round((window.innerWidth-this.value)/2)+"px",t.style.left=this.value+Math.round((window.innerWidth-this.value)/2)+"px",n.style.width=this.value+"px"},set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e,this.relayout()}}},e.insert={node:function(e){return new Promise(function(t,n){var r,i,o;if(b.cursor.load(),r=window.getSelection(),!r||!r.rangeCount)return n();for(i=r.getRangeAt(0),o=i.startContainer;!(!o||!o.getAttribute&&3!==o.nodeType||o.getAttribute&&o.getAttribute("base-block"));)o=o.parentNode;return 3===o.nodeType||o&&o.getAttribute&&o.getAttribute("base-block")?(i.collapse(!0),i.insertNode(e),i.setStartAfter(e),r.removeAllRanges(),r.addRange(i),t()):void 0})},image:function(){var e,t,n=this;return e="1024x1024",t=uploadcare.openDialog(null,null,{imageShrink:e,crop:"free"}),t.done(function(e){var t,r,i;return t=((r=e.files)?r():[e])[0],i=document.createElement("img"),i.style.width="32px",i.style.height="32px",i.style.backgroundImage="url(/assets/img/loader/msg.svg)",i.src="data:image/gif;base64,R0lGODlhAQABAIAAAPHx8QAAACH5BAEAAAAALAAAAAABAAEAQAICRAEAOw==",n.node(i).then(function(){return t.done(function(e){return i.setAttribute("image","image"),i.setAttribute("image-ratio",.01*Math.round(100*(e.crop.width/e.crop.height))),i.style.backgroundImage="url("+e.cdnUrl+")",i.style.width=e.crop.width+"px",i.style.height=e.crop.height+"px",i.style.backgroundSize="100% 100%",i.style.backgroundColor="#eee",i.style.backgroundPosition="center center",d.resizable(i),c.editBlock(i)})})["catch"](function(){})})},hr:function(){var e;return e=document.createElement("hr"),this.node(e).then(function(){return c.editBlock(e)})},button:function(){var e,t;return e=document.createElement("div"),e.setAttribute("repeat-host","repeat-host"),t=document.createElement("a"),t.classList.add("btn","btn-primary","mr-1","ml-1"),t.innerHTML="Get Start",t.setAttribute("href","#"),t.setAttribute("editable","true"),t.setAttribute("repeat-item","repeat-item"),e.appendChild(t),this.node(e).then(function(){return c.editBlock(e)})},icon:function(){return e.iconPicker.toggle()}},e.iconPicker={modal:{},toggle:function(){return this.modal.ctrl.toggle()},click:function(t){var n,r;if(t.target&&t.target.getAttribute&&(n=t.target.getAttribute("c")))return n="&#x"+n+";",r=document.createElement("i"),r.classList.add("fa-icon"),r.innerHTML=n,e.insert.node(r),this.modal.ctrl.toggle(!1),c.editBlock(r)}},e.pageConfig={modal:{},tab:1,toggle:function(){return l.setBlock(document.querySelector("#editor > .inner")),this.modal.ctrl.toggle()}},e.blockConfig={modal:{},toggle:function(e){return l.setBlock(e),this.modal.ctrl.toggle()}},e.share=m.share,e.$watch("config.size.value",function(){return e.config.size.relayout()}),e.$watch("user.data.key",function(e,t){return(e||t)&&e!==t?n(function(){return window.location.reload()},5e3):void 0}),e.editor=b,document.body.addEventListener("keyup",function(e){return h.toggle(null),c.editBlock(e.target)}),b.online.retry(),document.querySelector("#editor .inner").addEventListener("click",function(e){var t;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("edit-text"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("edit-text")?g.toggle(null):void 0}),A=null,t(function(){var t;
if(e.user.data&&(t=b.cursor.get(),JSON.stringify(t)!==JSON.stringify(A)))return o.action.cursor(e.user.data,t),A=t},1e3),document.body.addEventListener("mouseup",function(){var e,t,n,r,i,o,a;if(e=window.getSelection(),e.rangeCount){if(t=e.getRangeAt(0),n=[t.startContainer,t.endContainer],r=n[0],i=n[1],r!==i){for(o=r;o&&o.parentNode;)if(o=o.parentNode,i===o)return t.selectNodeContents(r);for(a=i;i&&i.parentNode&&(i=i.previousSibling||i.parentNode,0===i.childNodes.length||i===a.parentNode&&0===Array.from(i.childNodes).indexOf(a)););}return 3===r.nodeType&&(r=r.previousSibling||r.parentNode),3===i.nodeType&&(i=i.previousSibling||i.parentNode),r===i&&i!==t.endContainer&&0===t.endOffset?t.selectNodeContents(r):void 0}}),x=document.querySelector("#blocks-picker"),k=document.querySelector("#blocks-preview"),x.addEventListener("dragstart",function(){return k.style.display="none"}),x.addEventListener("mouseout",function(){return k.style.display="none"}),x.addEventListener("mousemove",function(e){var t,n,r,i,o,a,l,u,c;return t=e.target,t.classList&&t.classList.contains("thumb")?(n=t.getBoundingClientRect(),r=t.getAttribute("name"),i=t.getAttribute("ratio"),20>i&&(i=20),o=window.innerHeight+document.scrollingElement.scrollTop,a=n.y+.5*n.height-25+document.scrollingElement.scrollTop,l=2.56*i,a+l>o-5&&(a=o-l-5),u=k.style,u.left=n.x+n.width+"px",u.top=a+"px",u.display="block",k.querySelector(".name").innerText=r,c=k.querySelector(".inner").style,c.backgroundImage="url(/blocks/"+r+"/index.png)",c.height="0",c.paddingBottom=i-1+"%",c):void(t!==x&&(k.style.display="none"))}),document.addEventListener("scroll",function(){return h.toggle(null),k.style.display="none"}),["mousemove","keydown","scroll"].map(function(e){return document.addEventListener(e,function(){return b.online.retry.countdown=b.online.defaultCountdown})}),window.addEventListener("resize",function(){return e.config.size.resizeAsync()}),window.addEventListener("keydown",function(e){return(e.metaKey||e.ctrlKey)&&90===e.keyCode?(o.history.undo(),e.preventDefault(),!1):void 0})}));
function import$(e,t){var n={}.hasOwnProperty;for(var r in t)n.call(t,r)&&(e[r]=t[r]);return e}var x$;x$=angular.module("webedit"),x$.service("nodeProxy",["$rootScope"].concat(function(){var e;return e=function(t,n){var r,o,i;return null==n&&(n=!0),r=t,o="_node-proxy-"+Math.random().toString(16).substring(2),t.setAttribute(o,!0),n&&e.collab.action.editBlock(t),i=function(){return document.querySelector("["+o+"]")||function(){throw new Error("node "+o+" not found")}()},i.destroy=function(){var t;return t=i(),t.removeAttribute(o),n&&e.collab.action.editBlock(t),t},i},e.init=function(t){return e.collab=t},e})),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports,exports.custom&&exports.custom.attrs&&puredom.useAttr(exports.custom.attrs)),res(this$.cache[name])})})}}})),x$.service("webSettings",["$rootScope"].concat(function(){var e;return e={unit:{},style:{},option:{fontFamily:["Default","Arial","Helvetica Neue","Tahoma"],fontFamilyCJK:["Default","Noto Sans"],backgroundPositionX:["default","left","center","right"],backgroundPositionY:["default","top","center","bottom"],backgroundRepeat:["default","repeat","repeat-x","repeat-y","no-repeat"],backgroundAttachment:["default","scroll","fixed","local"],backgroundSize:["default","cover","contain","auto"],fontWeight:["default","200","300","400","500","600","700","800","900"],boxShadow:["default","none","light","modest","heavy"],animationName:["inherit","none","bounce","slide","fade"]},setBlock:function(e){return e.webSettings||(e.webSettings={}),this.style=e.webSettings||{},this.block=e}},["marginLeft","marginTop","marginRight","marginBottom","paddingLeft","paddingTop","paddingRight","paddingBottom","borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth","fontSize"].map(function(t){return e.unit[t]="px"}),["animationDuration","animationDelay"].map(function(t){return e.unit[t]="s"}),e})),x$.controller("webSettings",["$scope","$timeout","webSettings","collaborate"].concat(function(e,t,n,r){return e.settings=n,e.setBackgroundImage=function(){var t,n;return t="1024x1024",n=uploadcare.openDialog(null,null,{imageShrink:t,crop:"free"}),n.done(function(t){var n,r;return n=((r=t.files)?r():[t])[0],e.settings.style.backgroundImage="url(/assets/img/loader/msg.svg)",n.done(function(t){return e.settings.style.backgroundImage="url("+t.cdnUrl+"/-/preview/800x600/)"})})},e.actionHandle=null,e.$watch("settings.style",function(){var o,i,a;if(n.block){for(o in i=e.settings.style)a=i[o],n.block.style[o]=a&&"default"!==a?a+(n.unit[o]||""):"";return e.actionHandle&&(t.cancel(e.actionHandle),e.actionHandle=null),e.actionHandle=t(function(){return r.action.editStyle(n.block,n.block===document.querySelector("#editor > .inner"))},1e3)}},!0)})),x$.controller("editor",["$scope","$interval","$timeout","ldBase","blockLoader","collaborate","global","webSettings","nodeProxy"].concat(function(e,t,n,r,o,i,a,l,u){var c,s,d,g,f,m,h,p,b,v,y,x,A,k;return e.loading=!0,u.init(i),c={change:function(e){var t=this;return this.change.handle&&n.cancel(this.change.handle),this.change.handle=n(function(){return t.change.handle=null,Array.from(document.querySelector("#editor .inner").querySelectorAll(".block-item")).map(function(t){return o.get(t.getAttribute("base-block")).then(function(n){return n&&n.exports&&n.exports.handle&&n.exports.handle.change?n.exports.handle.change(t,e):void 0})})},1e3)},editBlock:function(e){return this.change([e]),i.action.editBlock(e)},insertBlock:function(e){return this.change([e]),i.action.insertBlock(e)},deleteBlock:function(e){return this.change([e]),o.get(e.getAttribute("base-block")).then(function(t){return t&&t.exports&&t.exports.destroy&&t.exports.destroy(e),i.action.deleteBlock(e)})},moveBlock:function(e,t){return this.change([e,t]),i.action.moveBlock(e,t)},setThumbnail:function(e){return i.action.setThumbnail(e)}},s={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","indent"].map(function(e){return{name:e,contentDefault:"<i class='fa fa-"+e+"'></i>"}}).concat(["h1","h2","h3","h4"],[{name:"colorPicker",contentDefault:"<i class='fa fa-adjust'></i>"},{name:"align-left",contentDefault:"1"},{name:"align-center",contentDefault:"2"},{name:"align-right",contentDefault:"3"},{name:"anchor",contentDefault:"<i class='fa fa-link'></i>"},{name:"removeFormat",contentDefault:"<i class='fa fa-eraser'></i>"}])},extensions:{colorPicker:new ColorPickerExtension,alignLeft:mediumEditorAlignExtention.left,alignCenter:mediumEditorAlignExtention.center,alignRight:mediumEditorAlignExtention.right},spellcheck:!1}),this.list.push(t),t.subscribe("editableInput",function(e,t){return c.editBlock(t)}),t}},d={elem:null,coord:{x:0,y:0},init:function(){var e=this;return this.elem=document.querySelector("#editor-text-handle"),this.elem.addEventListener("mouseover",function(){return e.timeout?(n.cancel(e.timeout),e.timeout=null):void 0}),this.elem.addEventListener("keypress",function(t){return 13===t.keyCode?e.save():void 0}),this.elem.addEventListener("click",function(t){return t.target.classList.contains("medium-editor-toolbar-save")?e.save():t.target.classList.contains("medium-editor-toolbar-close")?e.toggle(null):void 0})},save:function(){var e,t,n=this;return e=this.elem.querySelector("input").value,t=i.action.info(this.target),o.get(t[3]).then(function(t){var r;return((r=t.exports||(t.exports={})).transform||(r.transform={})).text&&(e=((r=t.exports||(t.exports={})).transform||(r.transform={})).text(e)),e&&n.target.setAttribute(n.target.getAttribute("edit-text"),e),((r=t.exports||(t.exports={})).handle||(r.handle={})).text&&((r=t.exports||(t.exports={})).handle||(r.handle={})).text(n.target,e),c.editBlock(n.target),n.toggle()})},toggle:function(e){var t=this;return null==e&&(e={}),this.timeout&&(n.cancel(this.timeout),this.timeout=null),e.delay?this.timeout=n(function(){return t._toggle(e)},e.delay):this._toggle(e)},_toggle:function(e){var t,n,r,o,i,a,l,u,c;return t=e.node,n=e.inside,r=e.text,o=e.placeholder,this.elem||this.init(),o&&this.elem.querySelector("input").setAttribute("placeholder",o),i="ldt-slide-bottom-in",t!==this.target&&this.elem.classList.remove(i),t?(a=[t,t.getBoundingClientRect()],this.target=a[0],l=a[1],u={x:l.x+.5*l.width-150+"px",y:l.y-48+document.scrollingElement.scrollTop+"px"},c=this.elem.style,c.left=u.x,c.top=u.y,c.display="block",this.elem.classList.add("ld",i),import$(this.coord,u),this.elem.querySelector("input").value=r):this.elem.style.display="none"}},d.init(),g={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var n,r,o,i;if(e.target)return n=e.target,r=n.parentNode,o=t.target.getAttribute("class"),/fa-clone/.exec(o)?(i=n.cloneNode(!0),i.classList.add("ld","ldt-jump-in","fast"),f.initChild(i),r.insertBefore(i,n.nextSibling),setTimeout(function(){return i.classList.remove("ld","ldt-jump-in","fast"),c.editBlock(r)},800)):/fa-trash-o/.exec(o)?(n.classList.add("ld","ldt-jump-out","fast"),setTimeout(function(){return r.removeChild(n),c.editBlock(r)},400)):/fa-link/.exec(o),e.elem.style.display="none",c.editBlock(r)})},coord:{x:0,y:0},toggle:function(e,t){var n,r,o,i,a;return null==t&&(t=!1),this.elem||this.init(),n="ldt-bounce-in",e!==this.target&&this.elem.classList.remove(n),e?(r=[e,e.getBoundingClientRect()],this.target=r[0],o=r[1],i={x:o.x+o.width+5+(t?-20:0)+"px",y:o.y+.5*o.height-22+document.scrollingElement.scrollTop+"px"},a=this.elem.style,a.left=i.x,a.top=i.y,a.display="block",this.elem.classList.add("ld",n),import$(this.coord,i)):this.elem.style.display="none"}},g.init(),f={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(t){var n,r;return n=(r=t.getAttribute("repeat-class"))?"."+r:t.childNodes.length?(r=t.childNodes[0]&&(t.childNodes[0].getAttribute("class")||"").split(" ")[0].trim())?"."+r:t.nodeName:"div",Sortable.create(t,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:n,dragoverBubble:!0,onEnd:function(){return c.editBlock(e)}})})},init:function(e,t){var n,r=this;return null==t&&(t=!1),this.initChild(e),n=null,t?void 0:(e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("keypress",function(e){var t,n,r,o,a;if(e.target&&(t=window.getSelection(),t&&!(t.rangeCount=0)&&(n=t.getRangeAt(0),r=n.startContainer,3===r.nodeType&&(r=r.parentNode),!r.getAttribute("eid")))){for(o=0;100>o&&(a=Math.random().toString(16).substring(2),document.querySelector("[eid='"+a+"']"));)o++;return 100>o&&r.setAttribute("eid",a),i.action.editBlock(r)}}),e.addEventListener("mousedown",function(t){var n,o;if(Array.from(e.parentNode.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),n=t.target,o=r.search(n,document.createRange(),{x:t.clientX,y:t.clientY}),!n.innerHTML.replace(/(<br>\s*)*/,"").trim())return n.setAttribute("contenteditable",!0);if(o&&o[0]&&(o[0].length<=o[1]||0===o[1])&&o[2]>800);else if(o.length&&n.parentNode)return n.setAttribute("contenteditable",!0)}),e.addEventListener("mousemove",function(e){var t,n,o;if(!e.buttons){for(t=e.target,n=r.search(e.target,document.createRange(),{x:e.clientX,y:e.clientY});t&&t.getAttribute&&!t.getAttribute("repeat-item");)t=t.parentNode;t&&t.getAttribute&&(o=window.getSelection(),0===o.extentOffset&&(!n||null==n[2]||n[2]>800)?e.target.setAttribute("contenteditable",!1):e.target.setAttribute("contenteditable",!0))}for(t=e.target;t&&t.getAttribute&&(!t.getAttribute("image")||!t.getAttribute("repeat-item"));)t=t.parentNode;return t&&t.getAttribute?g.toggle(t,!0):void 0}),e.addEventListener("mouseover",function(e){var t,n,r;for(t=e.target;t&&t.getAttribute&&!t.getAttribute("edit-text");)t=t.parentNode;return t&&t.getAttribute?(n=t.getAttribute(t.getAttribute("edit-text")),r=t.getAttribute("edit-text-placeholder")||"enter some text...",d.toggle({node:t,inside:!0,text:n,placeholder:r})):d.toggle({delay:500})}),e.addEventListener("click",function(t){var o,i,a,l,u,c,s,d,f;if(o=null,i=!1,a=window.getSelection(),a.rangeCount>0){if(l=window.getSelection().getRangeAt(0),l.startOffset<l.endOffset||!l.collapsed)return;o=[l.startContainer,l.startOffset]}for(u=t.target;u&&u.parentNode&&u.getAttribute&&!u.getAttribute("repeat-item");)u=u.parentNode;if(g.toggle(u&&u.getAttribute&&u.getAttribute("repeat-item")?u:null),t.target&&t.target.getAttribute&&t.target.getAttribute("repeat-item"))return u=t.target,u.setAttribute("contenteditable",!0),u.focus(),a=window.getSelection(),a.rangeCount?l=a.getRangeAt(0):(l=document.createRange(),a.addRange(l)),l.collapse(!1),void l.selectNodeContents(u);for(u=t.target,c=u.getAttribute("editable"),"false"===c&&(i=!0),u.removeAttribute("contenteditable");u&&"true"!==u.getAttribute("editable");){if(u.getAttribute("image")&&"bk"!==u.getAttribute("image")||"false"===u.getAttribute("editable")){i=!0;break}if(u.parentNode&&"true"===u.parentNode.getAttribute("repeat-host"))break;if(!u.parentNode)return;if(u===e)break;u=u.parentNode}return u.setAttribute("contenteditable",!i),!i&&(u.focus(),a=window.getSelection(),0!==a.rangeCount&&(l=a.getRangeAt(0),s=(d=o)?d:r.search(u,l,{x:t.clientX,y:t.clientY}),s&&0!==s.length))?(n&&t.shiftKey&&t.target.getAttribute("repeat-item")?(f=[[n.startContainer,n.startOffset],[s[0],s[1]]],f[0][1]>f[1][1]&&(f=[f[1],f[0]]),l.setStart(f[0][0],f[0][1]),l.setEnd(f[1][0],f[1][1])):(l.setStart(s[0],s[1]),l.collapse(!0)),n=l):void 0}))},search:function(e,t,n,r){var o,i,a,l,u,c,s,d,g,f,m,h,p,b;for(null==r&&(r=!0),o=[],i=0,a=e.childNodes.length;a>i;++i)if(l=i,u=e.childNodes[l],"#text"!==u.nodeName)u.getBoundingClientRect&&(p=u.getBoundingClientRect(),p.x<=n.x&&p.y<=n.y&&(o=o.concat(this.search(u,t,n,!1))));else{for(c=[-1,-1,-1],s=c[0],d=c[1],g=c[2],f=0,m=u.length+1;m>f;++f)if(h=f,t.setStart(u,h),p=t.getBoundingClientRect(),p.x<=n.x&&p.y<=n.y)c=[h,n.x-p.x,n.y-p.y],s=c[0],d=c[1],g=c[2];else if(p.x>n.x&&p.y>n.y)break;s>=0&&o.push([u,s,d,g])}if(!r||!o.length)return o;for(o=o.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),c=[o[0][2],0],b=c[0],s=c[1],i=1,a=o.length;a>i;++i)l=i,o[l][2]<b&&(c=[o[l][2],l],b=c[0],s=c[1]);return o[s]}},m={share:{modal:{},link:window.location.origin+(window.location.pathname+"/view").replace(/\/\//g,"/"),"public":!1,setPublic:function(e){return this["public"]!==e?(this["public"]=e,i.action.setPublic(this["public"])):void 0}},prepare:function(t){var n;return n=document.querySelector("#editor > .inner"),n.setAttribute("style",t.style||""),n.style.width=e.config.size.value+"px",this.share.setPublic(t.attr.isPublic)}},h={library:{root:null,loaded:{},scripts:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.loaded[e]?void 0:o.get(e)}).then(function(n){var r,o,i,a,l;if(null==n&&(n={}),t.root||(t.root=document.querySelector("#editor-library")),r=(n.exports||(n.exports={})).library){o=document.createElement("div");for(i in r)a=r[i],t.scripts[a]||(l=t.scripts[a]=document.createElement("script"),l.setAttribute("type","text/javascript"),l.setAttribute("src",a),t.root.appendChild(l));return t.loaded[e]=!0}})}},style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:o.get(e)}).then(function(e){var n;return n=document.createElement("style"),n.setAttribute("type","text/css"),n.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(n)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},remove:function(e){return c.deleteBlock(e).then(function(){return e.parentNode.removeChild(e)})},init:function(){return c.change()},clone:function(e){var t;if(e.childNodes[0])return t=e.childNodes[0].innerHTML,this.prepare(t,{highlight:!0,idx:Array.from(e.parentNode.childNodes).indexOf(e)+1,name:e.getAttribute("base-block"),source:!0,style:e.getAttribute("style")})},prepareHandle:{},prepareAsync:function(e,t){var r=this;return null==t&&(t={idx:0}),new Promise(function(o,i){var a;return a=t.idx||0,r.prepareHandle[a]&&n.cancel(r.prepareHandle[a]),r.prepareHandle[a]=n(function(){return r.prepareHandle[a]=0,r.prepare(e,t).then(function(e){return o(e)})["catch"](function(e){return i(e)})},10)})},prepare:function(t,n){var r,a,l,u,d,g,m,b,v,y=this;return null==n&&(n={source:!0}),p.cursor.save(),r=n.name,a=n.idx,l=n.redo,u=n.style,d=n.source,g=null,"string"==typeof t&&(g=t,t=document.createElement("div"),m=document.querySelector("#editor > .inner"),m.insertBefore(t,m.childNodes[a]),p.placeholder.remove()),n.content&&(b=Array.from(t.childNodes).filter(function(e){return/inner/.exec(e.getAttribute("class"))})[0],b&&(b.innerHTML=puredom.sanitize(n.content))),r=r||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){var n;return"base-block"!==(n=e.name)&&"style"!==n?t.removeAttribute(e.name):void 0}),t.setAttribute("class","initializing"),v=o.get(r).then(function(o){var a,m,b,v;if(t.setAttribute("class","block-item block-"+r),t.setAttribute("base-block",r),!l){for(a=document.createElement("div"),a.setAttribute("class","inner"),a.innerHTML=g?puredom.sanitize(g):o.html,u&&t.setAttribute("style",u);t.lastChild;)t.removeChild(t.lastChild);t.appendChild(a),m=document.createElement("div"),m.setAttribute("class","handle ld ldt-float-left-in"),m.innerHTML=["arrows","clone","cog","times"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),m.addEventListener("click",function(n){var r;return r=n.target.classList,r.contains("fa-times")?y.remove(t):r.contains("fa-clone")?y.clone(t):r.contains("fa-cog")?e.blockConfig.toggle(t):void 0}),t.appendChild(m),t.addEventListener("dragstart",function(){return s.pause()}),t.addEventListener("dragend",function(){return s.resume()}),t.addEventListener("drop",function(){return s.resume()}),h.style.add(r),h.library.add(r),d&&c.insertBlock(t)}return!l&&n.highlight&&t.classList.add("ld","ldt-jump-in","fast"),a=t.querySelector(".block-item > .inner"),((b=o.exports||(o.exports={})).config||(b.config={})).editable!==!1&&(v=s.prepare(a)),f.init(a,l),o.exports&&o.exports.wrap&&o.exports.wrap(t,i,!1),p.cursor.load()})}},p={online:{defaultCountdown:10,state:!0,code:null,retry:function(){return p.loading.toggle(!0),this.state=!0,n(function(){return i.init(document.querySelector("#editor .inner"),p,y)},100),!this.retry.countdown||this.retry.countdown<0?this.retry.countdown=this.defaultCountdown:this.retry.countdown--},toggle:function(t,n){var r=this;return null==n&&(n={}),e.force$apply(function(){return!n&&r.retry.countdown?r.retry():(r.code=n.code,p.online.state=t,p.loading.toggle(!0))})}},loading:{toggle:function(t){return e.force$apply(function(){return e.loading=null!=t?t:!e.loading})}},server:(b={},b.domain=a.domain,b.scheme=a.scheme,b),collaborator:{add:function(t,n){return e.force$apply(function(){return e.collaborator[n]=t})},update:function(t,n){return e.force$apply(function(){var r;return e.collaborator[n]=t,(r=e.collaborator[n].cursor)?e.collaborator[n].cbox=p.cursor.toBox(r):void 0})},remove:function(t){return e.force$apply(function(){var n,r;return r=(n=e.collaborator)[t],delete n[t],r})}},cursor:{state:null,get:function(){var e,t;return e=window.getSelection(),e.rangeCount?(t=e.getRangeAt(0),{startSelector:btools.getEidSelector(t.startContainer),startOffset:t.startOffset,endSelector:btools.getEidSelector(t.endContainer),endOffset:t.endOffset}):null},save:function(){return this.state=this.get()},toBox:function(e){var t,n,r,o;return t=this.toRange(e),n=document.querySelector("#editor > .inner").getBoundingClientRect(),t&&n?(r=t.getBoundingClientRect(),o=[r.x-n.x,r.y-n.y],r.x=o[0],r.y=o[1],o={blur:r.x<0||r.x>n.width},o.x=r.x,o.y=r.y,o.width=r.width,o.height=r.height,o):void 0},toRange:function(e){var t,n,r;return t=document.createRange(),n=btools.fromEidSelector(e.startSelector),r=btools.fromEidSelector(e.endSelector),n?(t.setStart(n,e.startOffset),r&&t.setEnd(r,e.endOffset),t):null},load:function(){var e,t;if(this.state&&(e=window.getSelection(),t=this.toRange(this.state)))return e.removeAllRanges(),e.addRange(t),this.state=null}},page:m,block:h,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,n,r,o;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),n=document.querySelector("#editor-style"),r=document.querySelector("#page-basic"),this.prune(t),o=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+n.innerHTML+'\n<style type="text/css"> '+r.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>",puredom.sanitize(o)}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,sort:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},filter:".unsortable",preventOnFilter:!1,disabled:!1,draggable:".block-item",dragoverBubble:!0,scrollSensitivity:60,scrollSpeed:30,onAdd:function(e){return h.prepare(e.item)},onEnd:function(e){return e.oldIndex!==e.newIndex?c.moveBlock(e.oldIndex,e.newIndex):void 0}}),v=document.querySelector("#editor > .inner"),v.addEventListener("dragover",function(){return p.placeholder.remove()}),e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=p["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return document.querySelector("#editor-preview iframe").setAttribute("src",m.share.link),this.modal.ctrl.toggle(!0)}},e.config={modal:{},size:{value:1024,name:"1024px",resizeAsync:r.async("resize",function(){var t=this;return e.force$apply(function(){var e,n,r,o,i;for(e=window.innerWidth-360,n=0,o=(r=[1440,1200,1024,800,640,480]).length;o>n&&(i=r[n],!(e>i));++n);return t.set(i+"px")})}),relayout:function(){var e,t,n;return e=document.querySelector("#blocks-picker"),t=document.querySelector("#collab-info"),n=document.querySelector(".editor-preview-modal .cover-modal-inner"),e.style.right=this.value+Math.round((window.innerWidth-this.value)/2)+"px",t.style.left=this.value+Math.round((window.innerWidth-this.value)/2)+"px",n.style.width=this.value+"px"},set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e,this.relayout()}}},e.pageConfig={modal:{},tab:1,toggle:function(){return l.setBlock(document.querySelector("#editor > .inner")),this.modal.ctrl.toggle()}},e.blockConfig={modal:{},toggle:function(e){return l.setBlock(e),this.modal.ctrl.toggle()}},e.share=m.share,e.$watch("user.data.key",function(t,n){return t!==n&&(i.action.exit(y.data?y.data.key:null),t)?i.action.join(e.user.data):void 0}),e.$watch("config.size.value",function(){return e.config.size.relayout()}),e.editor=p,e.collaborator={},document.body.addEventListener("keyup",function(e){return g.toggle(null),c.editBlock(e.target)}),y=e.user.data||{displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0},p.online.retry(),document.querySelector("#editor .inner").addEventListener("click",function(e){var t,n,r,o,i,a;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("edit-text"));)t=t.parentNode;for(t&&t.getAttribute&&t.getAttribute("edit-text")&&d.toggle(null),t=e.target;t&&(!t.getAttribute||!t.getAttribute("image"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("image")&&("bk"!==t.getAttribute("image")||e.target===t)?(n=u(t),r=t.getBoundingClientRect(),o=Math.round(2*(r.width>r.height?r.width:r.height)),o>1024&&(o=1024),i=o+"x"+o,a=uploadcare.openDialog(null,null,{multiple:!!t.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),a.fail(function(){return n.destroy()}),a.done(function(e){return Promise.resolve().then(function(){var t,r,o;return t=(r=e.files)?r():[e],1===t.length?(n().style.backgroundImage="url(/assets/img/loader/msg.svg)",t[0].done(function(e){return n().style.backgroundImage="url("+e.cdnUrl+"/-/preview/800x600/)",c.editBlock(n.destroy()),c.setThumbnail(e.cdnUrl+"/-/preview/1200x630/")})):(o=n().parentNode.querySelectorAll("[image]"),Array.from(o).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(t.map(function(e){return e.promise()})).then(function(e){var t,r,o,i,a,l;for(t=[n().parentNode.querySelectorAll("[image]"),0],r=t[0],o=t[1],i=0,a=r.length;a>i;++i)l=i,r[l].style.backgroundImage="url("+e[o].cdnUrl+"/-/preview/800x600/)",o=(o+1)%e.length;return c.editBlock(n.destroy()),c.setThumbnail(e[0].cdnUrl+"/-/preview/1200x630/")}))})["catch"](function(){return alert("the image node you're editing is removed by others.")})})):void 0}),x=null,t(function(){var e;return e=p.cursor.get(),JSON.stringify(e)!==JSON.stringify(x)?(i.action.cursor(y,e),x=e):void 0},1e3),document.body.addEventListener("mouseup",function(){var e,t,n,r,o,i,a;if(e=window.getSelection(),e.rangeCount){if(t=e.getRangeAt(0),n=[t.startContainer,t.endContainer],r=n[0],o=n[1],r!==o){for(i=r;i&&i.parentNode;)if(i=i.parentNode,o===i)return t.selectNodeContents(r);for(a=o;o&&o.parentNode&&(o=o.previousSibling||o.parentNode,0===o.childNodes.length||o===a.parentNode&&0===Array.from(o.childNodes).indexOf(a)););}return 3===r.nodeType&&(r=r.previousSibling||r.parentNode),3===o.nodeType&&(o=o.previousSibling||o.parentNode),r===o&&o!==t.endContainer&&0===t.endOffset?t.selectNodeContents(r):void 0}}),A=document.querySelector("#blocks-picker"),k=document.querySelector("#blocks-preview"),A.addEventListener("dragstart",function(){return k.style.display="none"}),A.addEventListener("mouseout",function(){return k.style.display="none"}),A.addEventListener("mousemove",function(e){var t,n,r,o,i,a,l,u,c;return t=e.target,t.classList&&t.classList.contains("thumb")?(n=t.getBoundingClientRect(),r=t.getAttribute("name"),o=t.getAttribute("ratio"),20>o&&(o=20),i=window.innerHeight+document.scrollingElement.scrollTop,a=n.y+.5*n.height-25+document.scrollingElement.scrollTop,l=2.56*o,a+l>i-5&&(a=i-l-5),u=k.style,u.left=n.x+n.width+"px",u.top=a+"px",u.display="block",k.querySelector(".name").innerText=r,c=k.querySelector(".inner").style,c.backgroundImage="url(/blocks/"+r+"/index.jpg)",c.height="0",c.paddingBottom=o-1+"%",c):void(t!==A&&(k.style.display="none"))}),document.addEventListener("scroll",function(){return g.toggle(null),k.style.display="none"}),["mousemove","keydown","scroll"].map(function(e){return document.addEventListener(e,function(){return p.online.retry.countdown=p.online.defaultCountdown})}),window.addEventListener("resize",function(){return e.config.size.resizeAsync()})}));
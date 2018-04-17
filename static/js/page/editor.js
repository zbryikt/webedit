function import$(e,t){var n={}.hasOwnProperty;for(var r in t)n.call(t,r)&&(e[r]=t[r]);return e}var x$;x$=angular.module("webedit"),x$.service("nodeProxy",["$rootScope"].concat(function(){var e;return e=function(t,n){var r,o,i;return null==n&&(n=!0),r=t,o="_node-proxy-"+Math.random().toString(16).substring(2),t.setAttribute(o,!0),n&&e.collab.action.editBlock(t),i=function(){return document.querySelector("["+o+"]")||function(){throw new Error("node "+o+" not found")}()},i.destroy=function(){var t;return t=i(),t.removeAttribute(o),n&&e.collab.action.editBlock(t),t},i},e.init=function(t){return e.collab=t},e})),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports,exports.custom&&exports.custom.attrs&&puredom.useAttr(exports.custom.attrs)),res(this$.cache[name])})})}}})),x$.service("webSettings",["$rootScope"].concat(function(){var e;return e={unit:{},style:{},option:{fontFamily:["Default","Arial","Helvetica Neue","Tahoma"],fontFamilyCJK:["Default","Noto Sans"],backgroundPositionX:["default","left","center","right"],backgroundPositionY:["default","top","center","bottom"],backgroundRepeat:["default","repeat","repeat-x","repeat-y","no-repeat"],backgroundAttachment:["default","scroll","fixed","local"],backgroundSize:["default","cover","contain","auto"],fontWeight:["default","200","300","400","500","600","700","800","900"],boxShadow:["default","none","light","modest","heavy"],animationName:["inherit","none","bounce","slide","fade"]},setBlock:function(e){return e.webSettings||(e.webSettings={}),this.style=e.webSettings||{},this.block=e}},["marginLeft","marginTop","marginRight","marginBottom","paddingLeft","paddingTop","paddingRight","paddingBottom","borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth","fontSize"].map(function(t){return e.unit[t]="px"}),["animationDuration","animationDelay"].map(function(t){return e.unit[t]="s"}),e})),x$.controller("webSettings",["$scope","$timeout","webSettings","collaborate"].concat(function(e,t,n,r){return e.settings=n,e.setBackgroundImage=function(){var t,n;return t="1024x1024",n=uploadcare.openDialog(null,null,{imageShrink:t,crop:"free"}),n.done(function(t){var n,r;return n=((r=t.files)?r():[t])[0],e.settings.style.backgroundImage="url(/assets/img/loader/msg.svg)",n.done(function(t){return e.settings.style.backgroundImage="url("+t.cdnUrl+"/-/preview/800x600/)"})})},e.actionHandle=null,e.$watch("settings.style",function(){var o,i,a;if(n.block){for(o in i=e.settings.style)a=i[o],n.block.style[o]=a&&"default"!==a?a+(n.unit[o]||""):"";return e.actionHandle&&(t.cancel(e.actionHandle),e.actionHandle=null),e.actionHandle=t(function(){return r.action.editStyle(n.block,n.block===document.querySelector("#editor > .inner"))},1e3)}},!0)})),x$.controller("editor",["$scope","$interval","$timeout","blockLoader","collaborate","global","webSettings","nodeProxy"].concat(function(e,t,n,r,o,i,a,l){var u,c,s,d,g,h,m,f,p,b,y,v,x,A;return e.loading=!0,l.init(o),u={change:function(e){var t=this;return this.change.handle&&n.cancel(this.change.handle),this.change.handle=n(function(){return t.change.handle=null,Array.from(document.querySelector("#editor .inner").querySelectorAll(".block-item")).map(function(t){return r.get(t.getAttribute("base-block")).then(function(t){return t&&t.exports&&t.exports.handle&&t.exports.handle.change?t.exports.handle.change(e):void 0})})},1e3)},editBlock:function(e){return this.change([e]),o.action.editBlock(e)},insertBlock:function(e){return this.change([e]),o.action.insertBlock(e)},deleteBlock:function(e){return this.change([e]),r.get(e.getAttribute("base-block")).then(function(t){return t&&t.exports&&t.exports.handle&&t.exports.handle.change?t.exports.destroy(e):void 0}),o.action.deleteBlock(e)},moveBlock:function(e,t){return this.change([e,t]),o.action.moveBlock(e,t)}},c={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","indent"].map(function(e){return{name:e,contentDefault:"<i class='fa fa-"+e+"'></i>"}}).concat(["h1","h2","h3","h4"],[{name:"colorPicker",contentDefault:"<i class='fa fa-adjust'></i>"},{name:"align-left",contentDefault:"1"},{name:"align-center",contentDefault:"2"},{name:"align-right",contentDefault:"3"},{name:"anchor",contentDefault:"<i class='fa fa-link'></i>"},{name:"removeFormat",contentDefault:"<i class='fa fa-eraser'></i>"}])},extensions:{colorPicker:new ColorPickerExtension,alignLeft:mediumEditorAlignExtention.left,alignCenter:mediumEditorAlignExtention.center,alignRight:mediumEditorAlignExtention.right},spellcheck:!1}),this.list.push(t),t.subscribe("editableInput",function(e,t){return u.editBlock(t)}),t}},s={elem:null,coord:{x:0,y:0},init:function(){var e=this;return this.elem=document.querySelector("#editor-text-handle"),this.elem.addEventListener("mouseover",function(){return e.timeout?(n.cancel(e.timeout),e.timeout=null):void 0}),this.elem.addEventListener("keypress",function(t){return 13===t.keyCode?e.save():void 0}),this.elem.addEventListener("click",function(t){return t.target.classList.contains("medium-editor-toolbar-save")?e.save():t.target.classList.contains("medium-editor-toolbar-close")?e.toggle(null):void 0})},save:function(){var e,t,n=this;return e=this.elem.querySelector("input").value,t=o.action.info(this.target),r.get(t[3]).then(function(t){var r;return((r=t.exports||(t.exports={})).transform||(r.transform={})).text&&(e=((r=t.exports||(t.exports={})).transform||(r.transform={})).text(e)),e&&n.target.setAttribute(n.target.getAttribute("edit-text"),e),((r=t.exports||(t.exports={})).handle||(r.handle={})).text&&((r=t.exports||(t.exports={})).handle||(r.handle={})).text(n.target,e),u.editBlock(n.target),n.toggle()})},toggle:function(e){var t=this;return null==e&&(e={}),this.timeout&&(n.cancel(this.timeout),this.timeout=null),e.delay?this.timeout=n(function(){return t._toggle(e)},e.delay):this._toggle(e)},_toggle:function(e){var t,n,r,o,i,a,l,u,c;return t=e.node,n=e.inside,r=e.text,o=e.placeholder,this.elem||this.init(),o&&this.elem.querySelector("input").setAttribute("placeholder",o),i="ldt-slide-bottom-in",t!==this.target&&this.elem.classList.remove(i),t?(a=[t,t.getBoundingClientRect()],this.target=a[0],l=a[1],u={x:l.x+.5*l.width-150+"px",y:l.y-48+document.scrollingElement.scrollTop+"px"},c=this.elem.style,c.left=u.x,c.top=u.y,c.display="block",this.elem.classList.add("ld",i),import$(this.coord,u),this.elem.querySelector("input").value=r):this.elem.style.display="none"}},s.init(),d={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var n,r,o,i;if(e.target)return n=e.target,r=n.parentNode,o=t.target.getAttribute("class"),/fa-clone/.exec(o)?(i=n.cloneNode(!0),i.classList.add("ld","ldt-jump-in","fast"),g.initChild(i),r.insertBefore(i,n.nextSibling),setTimeout(function(){return i.classList.remove("ld","ldt-jump-in","fast"),u.editBlock(r)},800)):/fa-trash-o/.exec(o)?(n.classList.add("ld","ldt-jump-out","fast"),setTimeout(function(){return r.removeChild(n),u.editBlock(r)},400)):/fa-link/.exec(o),e.elem.style.display="none",u.editBlock(r)})},coord:{x:0,y:0},toggle:function(e,t){var n,r,o,i,a;return null==t&&(t=!1),this.elem||this.init(),n="ldt-bounce-in",e!==this.target&&this.elem.classList.remove(n),e?(r=[e,e.getBoundingClientRect()],this.target=r[0],o=r[1],i={x:o.x+o.width+5+(t?-20:0)+"px",y:o.y+.5*o.height-22+document.scrollingElement.scrollTop+"px"},a=this.elem.style,a.left=i.x,a.top=i.y,a.display="block",this.elem.classList.add("ld",n),import$(this.coord,i)):this.elem.style.display="none"}},d.init(),g={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(t){var n,r;return n=(r=t.getAttribute("repeat-class"))?"."+r:t.childNodes.length?(r=t.childNodes[0]&&(t.childNodes[0].getAttribute("class")||"").split(" ")[0].trim())?"."+r:t.nodeName:"div",Sortable.create(t,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:n,dragoverBubble:!0,onEnd:function(){return u.editBlock(e)}})})},init:function(e,t){var n,r=this;return null==t&&(t=!1),this.initChild(e),n=null,t?void 0:(e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("keypress",function(e){var t,n,r,i,a;if(e.target&&(t=window.getSelection(),t&&!(t.rangeCount=0)&&(n=t.getRangeAt(0),r=n.startContainer,3===r.nodeType&&(r=r.parentNode),!r.getAttribute("eid")))){for(i=0;100>i&&(a=Math.random().toString(16).substring(2),document.querySelector("[eid='"+a+"']"));)i++;return 100>i&&r.setAttribute("eid",a),o.action.editBlock(r)}}),e.addEventListener("mousedown",function(t){var n,o;if(Array.from(e.parentNode.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),n=t.target,o=r.search(n,document.createRange(),{x:t.clientX,y:t.clientY}),!n.innerHTML.replace(/(<br>\s*)*/,"").trim())return n.setAttribute("contenteditable",!0);if(o&&o[0]&&(o[0].length<=o[1]||0===o[1])&&o[2]>800);else if(o.length&&n.parentNode)return n.setAttribute("contenteditable",!0)}),e.addEventListener("mousemove",function(e){var t,n,o;if(!e.buttons){for(t=e.target,n=r.search(e.target,document.createRange(),{x:e.clientX,y:e.clientY});t&&t.getAttribute&&!t.getAttribute("repeat-item");)t=t.parentNode;t&&t.getAttribute&&(o=window.getSelection(),0===o.extentOffset&&(!n||null==n[2]||n[2]>800)?e.target.setAttribute("contenteditable",!1):e.target.setAttribute("contenteditable",!0))}for(t=e.target;t&&t.getAttribute&&(!t.getAttribute("image")||!t.getAttribute("repeat-item"));)t=t.parentNode;return t&&t.getAttribute?d.toggle(t,!0):void 0}),e.addEventListener("mouseover",function(e){var t,n,r;for(t=e.target;t&&t.getAttribute&&!t.getAttribute("edit-text");)t=t.parentNode;return t&&t.getAttribute?(n=t.getAttribute(t.getAttribute("edit-text")),r=t.getAttribute("edit-text-placeholder")||"enter some text...",s.toggle({node:t,inside:!0,text:n,placeholder:r})):s.toggle({delay:500})}),e.addEventListener("click",function(t){var o,i,a,l,u,c,s,g,h;if(o=null,i=!1,a=window.getSelection(),a.rangeCount>0){if(l=window.getSelection().getRangeAt(0),l.startOffset<l.endOffset||!l.collapsed)return;o=[l.startContainer,l.startOffset]}for(u=t.target;u&&u.parentNode&&u.getAttribute&&!u.getAttribute("repeat-item");)u=u.parentNode;if(d.toggle(u&&u.getAttribute&&u.getAttribute("repeat-item")?u:null),t.target&&t.target.getAttribute&&t.target.getAttribute("repeat-item"))return u=t.target,u.setAttribute("contenteditable",!0),u.focus(),a=window.getSelection(),a.rangeCount?l=a.getRangeAt(0):(l=document.createRange(),a.addRange(l)),l.collapse(!1),void l.selectNodeContents(u);for(u=t.target,c=u.getAttribute("editable"),"false"===c&&(i=!0),u.removeAttribute("contenteditable");u&&"true"!==u.getAttribute("editable");){if(u.getAttribute("image")&&"bk"!==u.getAttribute("image")||"false"===u.getAttribute("editable")){i=!0;break}if(u.parentNode&&"true"===u.parentNode.getAttribute("repeat-host"))break;if(!u.parentNode)return;if(u===e)break;u=u.parentNode}return u.setAttribute("contenteditable",!i),!i&&(u.focus(),a=window.getSelection(),0!==a.rangeCount&&(l=a.getRangeAt(0),s=(g=o)?g:r.search(u,l,{x:t.clientX,y:t.clientY}),s&&0!==s.length))?(n&&t.shiftKey&&t.target.getAttribute("repeat-item")?(h=[[n.startContainer,n.startOffset],[s[0],s[1]]],h[0][1]>h[1][1]&&(h=[h[1],h[0]]),l.setStart(h[0][0],h[0][1]),l.setEnd(h[1][0],h[1][1])):(l.setStart(s[0],s[1]),l.collapse(!0)),n=l):void 0}))},search:function(e,t,n,r){var o,i,a,l,u,c,s,d,g,h,m,f,p,b;for(null==r&&(r=!0),o=[],i=0,a=e.childNodes.length;a>i;++i)if(l=i,u=e.childNodes[l],"#text"!==u.nodeName)u.getBoundingClientRect&&(p=u.getBoundingClientRect(),p.x<=n.x&&p.y<=n.y&&(o=o.concat(this.search(u,t,n,!1))));else{for(c=[-1,-1,-1],s=c[0],d=c[1],g=c[2],h=0,m=u.length+1;m>h;++h)if(f=h,t.setStart(u,f),p=t.getBoundingClientRect(),p.x<=n.x&&p.y<=n.y)c=[f,n.x-p.x,n.y-p.y],s=c[0],d=c[1],g=c[2];else if(p.x>n.x&&p.y>n.y)break;s>=0&&o.push([u,s,d,g])}if(!r||!o.length)return o;for(o=o.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),c=[o[0][2],0],b=c[0],s=c[1],i=1,a=o.length;a>i;++i)l=i,o[l][2]<b&&(c=[o[l][2],l],b=c[0],s=c[1]);return o[s]}},h={share:{modal:{},link:window.location.origin+(window.location.pathname+"/view").replace(/\/\//g,"/"),"public":!1,setPublic:function(e){return this["public"]!==e?(this["public"]=e,o.action.setPublic(this["public"])):void 0}},prepare:function(t){var n;return n=document.querySelector("#editor > .inner"),n.setAttribute("style",t.style||""),n.style.width=e.config.size.value+"px",this.share.setPublic(t.attr.isPublic)}},m={library:{root:null,loaded:{},scripts:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.loaded[e]?void 0:r.get(e)}).then(function(n){var r,o,i,a,l;if(null==n&&(n={}),t.root||(t.root=document.querySelector("#editor-library")),r=(n.exports||(n.exports={})).library){o=document.createElement("div");for(i in r)a=r[i],t.scripts[a]||(l=t.scripts[a]=document.createElement("script"),l.setAttribute("type","text/javascript"),l.setAttribute("src",a),t.root.appendChild(l));return t.loaded[e]=!0}})}},style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:r.get(e)}).then(function(e){var n;return n=document.createElement("style"),n.setAttribute("type","text/css"),n.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(n)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},remove:function(e){return u.deleteBlock(e),e.parentNode.removeChild(e)},init:function(){return u.change()},clone:function(e){var t;return t=e.cloneNode(!0),e.parentNode.insertBefore(t,e.nextSibling),this.prepare(t,{highlight:!0})},prepareAsync:function(e,t){var r=this;return null==t&&(t={}),new Promise(function(o,i){return r.prepareAsync.handle&&n.cancel(r.prepareAsync.handle),r.prepareAsync.handle=n(function(){return r.prepareAsync.handle=0,r.prepare(e,t).then(function(e){return o(e)})["catch"](function(e){return i(e)})},10)})},prepare:function(t,n){var i,a,l,s,d,h,p,b,y,v,x=this;return null==n&&(n={}),f.cursor.save(),i=n.name,a=n.idx,l=n.redo,s=n.style,d=[!0,null],h=d[0],p=d[1],"string"==typeof t&&(d=[t,!1],p=d[0],h=d[1],t=document.createElement("div"),b=document.querySelector("#editor > .inner"),b.insertBefore(t,b.childNodes[a]),f.placeholder.remove()),n.content&&(y=Array.from(t.childNodes).filter(function(e){return/inner/.exec(e.getAttribute("class"))})[0],y&&(y.innerHTML=puredom.sanitize(n.content))),i=i||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){var n;return"base-block"!==(n=e.name)&&"style"!==n?t.removeAttribute(e.name):void 0}),t.setAttribute("class","initializing"),v=r.get(i).then(function(r){var a,d,b,y;if(!l){for(a=document.createElement("div"),a.setAttribute("class","inner"),a.innerHTML=p?puredom.sanitize(p):r.html,s&&t.setAttribute("style",s);t.lastChild;)t.removeChild(t.lastChild);t.appendChild(a),d=document.createElement("div"),d.setAttribute("class","handle ld ldt-float-left-in"),d.innerHTML=["arrows","clone","cog","times"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),d.addEventListener("click",function(n){var r;return r=n.target.classList,r.contains("fa-times")?x.remove(t):r.contains("fa-clone")?x.clone(t):r.contains("fa-cog")?e.blockConfig.toggle(t):void 0}),t.appendChild(d),t.addEventListener("dragstart",function(){return c.pause()}),t.addEventListener("dragend",function(){return c.resume()}),t.addEventListener("drop",function(){return c.resume()}),m.style.add(i),m.library.add(i),h&&u.insertBlock(t)}return t.setAttribute("class","block-item block-"+i),!l&&n.highlight&&t.classList.add("ld","ldt-jump-in","fast"),t.setAttribute("base-block",i),a=t.querySelector(".block-item > .inner"),((b=r.exports||(r.exports={})).config||(b.config={})).editable!==!1&&(y=c.prepare(a)),g.init(a,l),r.exports&&r.exports.wrap&&r.exports.wrap(t,!1,o),f.cursor.load()})}},f={online:{defaultCountdown:10,state:!0,retry:function(){return f.loading.toggle(!0),this.state=!0,n(function(){return o.init(document.querySelector("#editor .inner"),f,y)},100),!this.retry.countdown||this.retry.countdown<0?this.retry.countdown=this.defaultCountdown:this.retry.countdown--},toggle:function(t){var n=this;return e.force$apply(function(){return n.retry.countdown?n.retry():(f.online.state=t,f.loading.toggle(!0))})}},loading:{toggle:function(t){return e.force$apply(function(){return e.loading=null!=t?t:!e.loading})}},server:(p={},p.domain=i.domain,p.scheme=i.scheme,p),collaborator:{add:function(t,n){return e.force$apply(function(){return e.collaborator[n]=t})},update:function(t,n){return e.force$apply(function(){return e.collaborator[n]=t})},remove:function(t){return e.force$apply(function(){var n,r;return r=(n=e.collaborator)[t],delete n[t],r})}},cursor:{state:null,save:function(){var e,t;return this.state=null,e=window.getSelection(),e.rangeCount?(t=e.getRangeAt(0),this.state={range:t,startSelector:btools.getEidSelector(t.startContainer),startOffset:t.startOffset,endSelector:btools.getEidSelector(t.endContainer),endOffset:t.endOffset}):void 0},load:function(){var e,t,n,r;if(this.state)return e=window.getSelection(),t=document.createRange(),n=btools.fromEidSelector(this.state.startSelector),r=btools.fromEidSelector(this.state.endSelector),t.setStart(n,this.state.startOffset),t.setEnd(r,this.state.endOffset),e.removeAllRanges(),e.addRange(t),this.state=null}},page:h,block:m,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,n,r,o;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),n=document.querySelector("#editor-style"),r=document.querySelector("#page-basic"),this.prune(t),o=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+n.innerHTML+'\n<style type="text/css"> '+r.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>",puredom.sanitize(o)}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,sort:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},filter:".unsortable",preventOnFilter:!1,disabled:!1,draggable:".block-item",dragoverBubble:!0,scrollSensitivity:60,scrollSpeed:30,onAdd:function(e){return m.prepare(e.item)},onEnd:function(e){return e.oldIndex!==e.newIndex?u.moveBlock(e.oldIndex,e.newIndex):void 0}}),b=document.querySelector("#editor > .inner"),b.addEventListener("dragover",function(){return f.placeholder.remove()}),e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=f["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return this.code=f["export"]({bodyOnly:!0}),document.querySelector("#editor-preview").innerHTML=this.code,this.modal.ctrl.toggle(!0)}},e.config={modal:{},size:{value:1024,name:"1024px",set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e}}},e.pageConfig={modal:{},tab:1,toggle:function(){return a.setBlock(document.querySelector("#editor > .inner")),this.modal.ctrl.toggle()}},e.blockConfig={modal:{},toggle:function(e){return a.setBlock(e),this.modal.ctrl.toggle()}},e.share=h.share,e.$watch("user.data.key",function(t,n){return t!==n&&(o.action.exit(y.data?y.data.key:null),t)?o.action.join(e.user.data):void 0}),e.$watch("config.size.value",function(){var t,n,r,o;return t=document.querySelector("#blocks-picker"),n=document.querySelector("#collab-info"),r=document.querySelector(".editor-preview-modal .cover-modal-inner"),o=e.config.size.value,t.style.right=o+Math.round((window.innerWidth-o)/2)+"px",n.style.left=o+Math.round((window.innerWidth-o)/2)+"px",r.style.width=o+"px"}),e.editor=f,e.collaborator={},document.body.addEventListener("keyup",function(e){return d.toggle(null),u.editBlock(e.target)}),y=e.user.data||{displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0},f.online.retry(),document.querySelector("#editor .inner").addEventListener("click",function(e){var t,n,r,o,i,a;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("edit-text"));)t=t.parentNode;for(t&&t.getAttribute&&t.getAttribute("edit-text")&&s.toggle(null),t=e.target;t&&(!t.getAttribute||!t.getAttribute("image"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("image")&&("bk"!==t.getAttribute("image")||e.target===t)?(n=l(t),r=t.getBoundingClientRect(),o=Math.round(2*(r.width>r.height?r.width:r.height)),o>1024&&(o=1024),i=o+"x"+o,a=uploadcare.openDialog(null,null,{multiple:!!t.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),a.fail(function(){return n.destroy()}),a.done(function(e){return Promise.resolve().then(function(){var t,r,o;return t=(r=e.files)?r():[e],1===t.length?(n().style.backgroundImage="url(/assets/img/loader/msg.svg)",t[0].done(function(e){return n().style.backgroundImage="url("+e.cdnUrl+"/-/preview/800x600/)",u.editBlock(n.destroy())})):(o=n().parentNode.querySelectorAll("[image]"),Array.from(o).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(t.map(function(e){return e.promise()})).then(function(e){var t,r,o,i,a,l;for(t=[n().parentNode.querySelectorAll("[image]"),0],r=t[0],o=t[1],i=0,a=r.length;a>i;++i)l=i,r[l].style.backgroundImage="url("+e[o].cdnUrl+"/-/preview/800x600/)",o=(o+1)%e.length;return u.editBlock(n.destroy())}))})["catch"](function(){return alert("the image node you're editing is removed by others.")})})):void 0}),v=null,t(function(){var e,t,n,r;if(e=window.getSelection(),e&&e.rangeCount&&(t=document.querySelector("#editor > .inner").getBoundingClientRect(),n=e.getRangeAt(0),r=n.getBoundingClientRect(),r.x-=t.x,r.y-=t.y,!v||v.x!==r.x||v.y!==r.y||null!=v.width&&v.width!==r.width||null!=v.height&&v.height!==r.height)){if(r.x<0||r.x>t.width){if(v&&v.blur)return;v={blur:!0}}else v={x:r.x,y:r.y,width:r.width,height:r.height};return o.action.cursor(y,v)}},1e3),document.body.addEventListener("mouseup",function(){var e,t,n,r,o,i,a;if(e=window.getSelection(),e.rangeCount){if(t=e.getRangeAt(0),n=[t.startContainer,t.endContainer],r=n[0],o=n[1],r!==o){for(i=r;i&&i.parentNode;)if(i=i.parentNode,o===i)return t.selectNodeContents(r);for(a=o;o&&o.parentNode&&(o=o.previousSibling||o.parentNode,0===o.childNodes.length||o===a.parentNode&&0===Array.from(o.childNodes).indexOf(a)););}return 3===r.nodeType&&(r=r.previousSibling||r.parentNode),3===o.nodeType&&(o=o.previousSibling||o.parentNode),r===o&&o!==t.endContainer&&0===t.endOffset?t.selectNodeContents(r):void 0}}),x=document.querySelector("#blocks-picker"),A=document.querySelector("#blocks-preview"),x.addEventListener("dragstart",function(){return A.style.display="none"}),x.addEventListener("mouseout",function(){return A.style.display="none"}),x.addEventListener("mousemove",function(e){var t,n,r,o,i,a,l,u,c;return t=e.target,t.classList&&t.classList.contains("thumb")?(n=t.getBoundingClientRect(),r=t.getAttribute("name"),o=t.getAttribute("ratio"),20>o&&(o=20),i=window.innerHeight+document.scrollingElement.scrollTop,a=n.y+.5*n.height-25+document.scrollingElement.scrollTop,l=2.56*o,a+l>i-5&&(a=i-l-5),u=A.style,u.left=n.x+n.width+"px",u.top=a+"px",u.display="block",A.querySelector(".name").innerText=r,c=A.querySelector(".inner").style,c.backgroundImage="url(/blocks/"+r+"/index.jpg)",c.height="0",c.paddingBottom=o-1+"%",c):void(t!==x&&(A.style.display="none"))}),document.addEventListener("scroll",function(){return d.toggle(null),A.style.display="none"}),["mousemove","keydown","scroll"].map(function(e){return document.addEventListener(e,function(){return f.online.retry.countdown=f.online.defaultCountdown})})}));
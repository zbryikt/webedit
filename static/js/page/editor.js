function import$(t,e){var n={}.hasOwnProperty;for(var r in e)n.call(e,r)&&(t[r]=e[r]);return t}var x$;x$=angular.module("webedit"),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports),res(this$.cache[name])})})}}})),x$.service("webSettings",["$rootScope"].concat(function(){var t;return t={unit:{},style:{},option:{fontFamily:["Default","Arial","Helvetica Neue","Tahoma"],fontFamilyCJK:["Default","Noto Sans"],backgroundPositionX:["default","left","center","right"],backgroundPositionY:["default","top","center","bottom"],backgroundRepeat:["default","repeat","repeat-x","repeat-y","no-repeat"],backgroundAttachment:["default","scroll","fixed","local"],backgroundSize:["default","cover","contain","auto"],fontWeight:["default","200","300","400","500","600","700","800","900"],boxShadow:["default","none","light","modest","heavy"],animationName:["inherit","none","bounce","slide","fade"]},setBlock:function(t){return t.webSettings||(t.webSettings={}),this.style=t.webSettings||{},this.block=t}},["marginLeft","marginTop","marginRight","marginBottom","paddingLeft","paddingTop","paddingRight","paddingBottom","borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth","fontSize"].map(function(e){return t.unit[e]="px"}),["animationDuration","animationDelay"].map(function(e){return t.unit[e]="s"}),t})),x$.controller("webSettings",["$scope","$timeout","webSettings","collaborate"].concat(function(t,e,n,r){return t.settings=n,t.setBackgroundImage=function(){var e,n;return e="1024x1024",n=uploadcare.openDialog(null,null,{imageShrink:e,crop:"free"}),n.done(function(e){var n,r;return n=((r=e.files)?r():[e])[0],t.settings.style.backgroundImage="url(/assets/img/loader/msg.svg)",n.done(function(e){return t.settings.style.backgroundImage="url("+e.cdnUrl+"/-/preview/800x600/)"})})},t.actionHandle=null,t.$watch("settings.style",function(){var o,i,l;if(n.block){for(o in i=t.settings.style)l=i[o],n.block.style[o]=l&&"default"!==l?l+(n.unit[o]||""):"";return t.actionHandle&&(e.cancel(t.actionHandle),t.actionHandle=null),t.actionHandle=e(function(){return r.action.editStyle(n.block,n.block===document.querySelector("#editor > .inner"))},1e3)}},!0)})),x$.controller("editor",["$scope","$interval","$timeout","blockLoader","collaborate","global","webSettings"].concat(function(t,e,n,r,o,i,l){var a,u,c,s,d,g,m,p,h,f,b,y,v;return t.loading=!0,a={list:[],pause:function(){return this.list.map(function(t){return t.destroy()})},resume:function(){return this.list.map(function(t){return t.setup()})},prepare:function(t){var e;return e=new MediumEditor(t,{toolbar:{buttons:["bold","italic","underline","indent"].map(function(t){return{name:t,contentDefault:"<i class='fa fa-"+t+"'></i>"}}).concat(["h1","h2","h3","h4"],[{name:"colorPicker",contentDefault:"<i class='fa fa-adjust'></i>"},{name:"align-left",contentDefault:"1"},{name:"align-center",contentDefault:"2"},{name:"align-right",contentDefault:"3"},{name:"anchor",contentDefault:"<i class='fa fa-link'></i>"},{name:"removeFormat",contentDefault:"<i class='fa fa-eraser'></i>"}])},extensions:{colorPicker:new ColorPickerExtension,alignLeft:mediumEditorAlignExtention.left,alignCenter:mediumEditorAlignExtention.center,alignRight:mediumEditorAlignExtention.right},spellcheck:!1}),this.list.push(e),e.subscribe("editableInput",function(t,e){return o.action.editBlock(e)}),e}},u={elem:null,coord:{x:0,y:0},init:function(){var t=this;return this.elem=document.querySelector("#editor-text-handle"),this.elem.addEventListener("mouseover",function(){return t.timeout?(n.cancel(t.timeout),t.timeout=null):void 0}),this.elem.addEventListener("keypress",function(e){return 13===e.keyCode?t.save():void 0}),this.elem.addEventListener("click",function(e){return e.target.classList.contains("medium-editor-toolbar-save")?t.save():e.target.classList.contains("medium-editor-toolbar-close")?t.toggle(null):void 0})},save:function(){var t,e,n=this;return t=this.elem.querySelector("input").value,e=o.action.info(this.target),r.get(e[3]).then(function(e){var r;return((r=e.exports||(e.exports={})).transform||(r.transform={})).text&&(t=((r=e.exports||(e.exports={})).transform||(r.transform={})).text(t)),t&&n.target.setAttribute(n.target.getAttribute("edit-text"),t),((r=e.exports||(e.exports={})).handle||(r.handle={})).text&&((r=e.exports||(e.exports={})).handle||(r.handle={})).text(n.target,t),o.action.editBlock(n.target),n.toggle()})},toggle:function(t){var e=this;return null==t&&(t={}),this.timeout&&(n.cancel(this.timeout),this.timeout=null),t.delay?this.timeout=n(function(){return e._toggle(t)},t.delay):this._toggle(t)},_toggle:function(t){var e,n,r,o,i,l,a,u;return e=t.node,n=t.inside,r=t.text,o=t.placeholder,this.elem||this.init(),o&&this.elem.querySelector("input").setAttribute("placeholder",o),i=(this.elem.getAttribute("class")||"").replace(/ ?ldt-\S+ ?/," ").replace(/ ?opt-\S+ ?/g," "),e?(this.target=e,l=e.getBoundingClientRect(),a={x:l.x+.5*l.width-150+"px",y:l.y-48+document.scrollingElement.scrollTop+"px"},(this.coord.x!==a.x||this.coord.y!==a.y)&&(this.elem.setAttribute("class",i+" ldt-bounce-out"),l=e.getBoundingClientRect()),u=this.elem.style,u.left=a.x,u.top=a.y,u.display="block",this.elem.setAttribute("class",i+" ldt-slide-bottom-in"),import$(this.coord,a),this.elem.querySelector("input").value=r):(this.elem.setAttribute("class",i+" ldt-bounce-out"),this.elem.style.display="none")}},u.init(),c={elem:null,init:function(){var t=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(e){var n,r,i,l;if(t.target)return n=t.target,r=n.parentNode,i=e.target.getAttribute("class"),/fa-clone/.exec(i)?(l=n.cloneNode(!0),l.setAttribute("class",l.getAttribute("class")+" ld ldt-bounce-in"),s.initChild(l),r.insertBefore(l,n.nextSibling),setTimeout(function(){return l.setAttribute("class",l.getAttribute("class").replace("ld ldt-bounce-in"," ")),o.action.editBlock(r)},800)):/fa-trash-o/.exec(i)?(n.setAttribute("class",n.getAttribute("class")+" ld ldt-bounce-out"),setTimeout(function(){return r.removeChild(n),o.action.editBlock(r)},400)):/fa-link/.exec(i),t.elem.style.display="none",o.action.editBlock(r)})},coord:{x:0,y:0},toggle:function(t,e){var n,r,o,i;return null==e&&(e=!1),this.elem||this.init(),n=(this.elem.getAttribute("class")||"").replace(/ ?ldt-\S+ ?/," ").replace(/ ?opt-\S+ ?/g," "),t?(this.target=t,r=t.getBoundingClientRect(),o={x:r.x+r.width+5+(e?-20:0)+"px",y:r.y+.5*r.height-32+document.scrollingElement.scrollTop+"px"},(this.coord.x!==o.x||this.coord.y!==o.y)&&(this.elem.setAttribute("class",n+" ldt-bounce-out"),r=t.getBoundingClientRect()),i=this.elem.style,i.left=o.x,i.top=o.y,i.display="block",this.elem.setAttribute("class",n+" ldt-bounce-in"),import$(this.coord,o)):(this.elem.setAttribute("class",n+" ldt-bounce-out"),this.elem.style.display="none")}},c.init(),s={initChild:function(t){return Array.from(t.querySelectorAll("[repeat-host]")).map(function(e){return Sortable.create(e,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:"."+e.childNodes[0].getAttribute("class").split(" ")[0].trim(),onEnd:function(){return o.action.editBlock(t)}})})},init:function(t){var e,n=this;return t.addEventListener("selectstart",function(t){return t.allowSelect=!0}),t.addEventListener("mousedown",function(e){var r,o,i,l,a=[];if(r=e.target,r.getAttribute("repeat-item"))return o=window.getSelection(),void(0===o.extentOffset&&r.setAttribute("contenteditable",!1));if(i=n.search(r,document.createRange(),{x:e.clientX,y:e.clientY}),i&&i[0]&&(i[0].length<=i[1]||0===i[1])&&i[2]>800);else if(r.parentNode&&!r.parentNode.getAttribute("repeat"))return void r.setAttribute("contenteditable",!0);for(l=window.getSelection();r&&r.parentNode&&(r.getAttribute("contenteditable")&&r.setAttribute("contenteditable",!1),r!==t);)a.push(r=r.parentNode);return a}),e=null,this.initChild(t),t.addEventListener("mousemove",function(t){var e;for(e=t.target;e&&e.getAttribute&&(!e.getAttribute("image")||!e.getAttribute("repeat-item"));)e=e.parentNode;return e&&e.getAttribute?c.toggle(e,!0):void 0}),t.addEventListener("mouseover",function(t){var e,n,r;for(e=t.target;e&&e.getAttribute&&!e.getAttribute("edit-text");)e=e.parentNode;return e&&e.getAttribute?(n=e.getAttribute(e.getAttribute("edit-text")),r=e.getAttribute("edit-text-placeholder")||"enter some text...",u.toggle({node:e,inside:!0,text:n,placeholder:r})):u.toggle({delay:500})}),t.addEventListener("click",function(r){var o,i,l,a,u,s,d,g,m;if(o=null,i=!1,l=window.getSelection(),l.rangeCount>0){if(a=window.getSelection().getRangeAt(0),a.startOffset<a.endOffset||!a.collapsed)return;o=[a.startContainer,a.startOffset]}for(u=r.target;u&&u.parentNode&&u.getAttribute&&!u.getAttribute("repeat-item");)u=u.parentNode;if(c.toggle(u&&u.getAttribute&&u.getAttribute("repeat-item")?u:null),r.target&&r.target.getAttribute&&r.target.getAttribute("repeat-item"))return u=r.target,u.setAttribute("contenteditable",!0),u.focus(),l=window.getSelection(),l.rangeCount?a=l.getRangeAt(0):(a=document.createRange(),l.addRange(a)),a.collapse(!1),void a.selectNodeContents(u);for(u=r.target,s=u.getAttribute("editable"),"false"===s&&(i=!0),u.removeAttribute("contenteditable");u&&"true"!==u.getAttribute("editable");){if(u.getAttribute("image")&&"bk"!==u.getAttribute("image")||"false"===u.getAttribute("editable")){i=!0;break}if(u.parentNode&&"true"===u.parentNode.getAttribute("repeat-host"))break;if(!u.parentNode)return;if(u===t)break;u=u.parentNode}return u.setAttribute("contenteditable",!i),!i&&(u.focus(),l=window.getSelection(),0!==l.rangeCount&&(a=l.getRangeAt(0),d=(g=o)?g:n.search(u,a,{x:r.clientX,y:r.clientY}),d&&0!==d.length))?(e&&r.shiftKey&&r.target.getAttribute("repeat-item")?(m=[[e.startContainer,e.startOffset],[d[0],d[1]]],m[0][1]>m[1][1]&&(m=[m[1],m[0]]),a.setStart(m[0][0],m[0][1]),a.setEnd(m[1][0],m[1][1])):(a.setStart(d[0],d[1]),a.collapse(!0)),e=a):void 0})},search:function(t,e,n,r){var o,i,l,a,u,c,s,d,g,m,p,h,f,b;for(null==r&&(r=!0),o=[],i=0,l=t.childNodes.length;l>i;++i)if(a=i,u=t.childNodes[a],"#text"!==u.nodeName)u.getBoundingClientRect&&(f=u.getBoundingClientRect(),f.x<=n.x&&f.y<=n.y&&(o=o.concat(this.search(u,e,n,!1))));else{for(c=[-1,-1,-1],s=c[0],d=c[1],g=c[2],m=0,p=u.length+1;p>m;++m)if(h=m,e.setStart(u,h),f=e.getBoundingClientRect(),f.x<=n.x&&f.y<=n.y)c=[h,n.x-f.x,n.y-f.y],s=c[0],d=c[1],g=c[2];else if(f.x>n.x&&f.y>n.y)break;s>=0&&o.push([u,s,d,g])}if(!r||!o.length)return o;for(o=o.map(function(t){return[t[0],t[1],Math.pow(t[2],2)+Math.pow(t[3],2)]}),c=[o[0][2],0],b=c[0],s=c[1],i=1,l=o.length;l>i;++i)a=i,o[a][2]<b&&(c=[o[a][2],a],b=c[0],s=c[1]);return o[s]}},d={prepare:function(e){var n;return n=document.querySelector("#editor > .inner"),n.setAttribute("style",e.style||""),n.style.width=t.config.size.value+"px",n}},g={library:{root:null,loaded:{},scripts:{},add:function(t){var e=this;return Promise.resolve().then(function(){return e.loaded[t]?void 0:r.get(t)}).then(function(n){var r,o,i,l,a;if(null==n&&(n={}),e.root||(e.root=document.querySelector("#editor-library")),r=(n.exports||(n.exports={})).library){o=document.createElement("div");for(i in r)l=r[i],e.scripts[l]||(a=e.scripts[l]=document.createElement("script"),a.setAttribute("type","text/javascript"),a.setAttribute("src",l),e.root.appendChild(a));return e.loaded[t]=!0}})}},style:{root:null,nodes:{},add:function(t){var e=this;return Promise.resolve().then(function(){return e.nodes[t]?void 0:r.get(t)}).then(function(t){var n;return n=document.createElement("style"),n.setAttribute("type","text/css"),n.innerHTML=t.css,e.root||(e.root=document.querySelector("#editor-style")),e.root.appendChild(n)})},remove:function(t){return this.root&&this.nodes[t]?this.root.removeChild(this.nodes[t]):void 0}},remove:function(t){return o.action.deleteBlock(t),t.parentNode.removeChild(t)},prepare:function(e,n,i,l,u){var c,d,p,h,f,b=this;return null==n&&(n=null),null==i&&(i=null),null==l&&(l=!1),null==u&&(u=""),c=[!0,null],d=c[0],p=c[1],"string"==typeof e&&(c=[e,!1],p=c[0],d=c[1],e=document.createElement("div"),h=document.querySelector("#editor > .inner"),h.insertBefore(e,h.childNodes[i]),m.placeholder.remove()),n=n||e.getAttribute("base-block"),Array.from(e.attributes).map(function(t){var n;return"base-block"!==(n=t.name)&&"style"!==n?e.removeAttribute(t.name):void 0}),e.setAttribute("class","initializing"),f=r.get(n).then(function(r){var i,c,m,h;if(!l){for(i=document.createElement("div"),i.setAttribute("class","inner"),i.innerHTML=p?p:r.html,u&&e.setAttribute("style",u);e.lastChild;)e.removeChild(e.lastChild);e.appendChild(i),c=document.createElement("div"),c.setAttribute("class","handle ld ldt-grow-rtl"),c.innerHTML=["arrows","cog","times"].map(function(t){return"<i class='fa fa-"+t+"'></i>"}).join(""),c.addEventListener("click",function(n){var r;return r=n.target.getAttribute("class"),/fa-times/.exec(r)?b.remove(e):/fa-cog/.exec(r)?t.blockConfig.toggle(e):void 0}),e.appendChild(c),e.addEventListener("dragstart",function(){return a.pause()}),e.addEventListener("dragend",function(){return a.resume()}),g.style.add(n),g.library.add(n),d&&o.action.insertBlock(e)}return e.setAttribute("class","block-item block-"+n),e.setAttribute("base-block",n),i=e.querySelector(".block-item > .inner"),((m=r.exports||(r.exports={})).config||(m.config={})).editable!==!1&&(h=a.prepare(i)),s.init(i),r.exports&&r.exports.wrap?r.exports.wrap(e,o):void 0})}},m={online:{defaultCountdown:10,state:!0,retry:function(){return m.loading.toggle(!0),this.state=!0,n(function(){return o.init(document.querySelector("#editor .inner"),m,f)},100),!this.retry.countdown||this.retry.countdown<0?this.retry.countdown=this.defaultCountdown:this.retry.countdown--},toggle:function(e){var n=this;return t.force$apply(function(){return n.retry.countdown?n.retry():(m.online.state=e,m.loading.toggle(!0))})}},loading:{toggle:function(e){return t.force$apply(function(){return t.loading=null!=e?e:!t.loading})}},server:(p={},p.domain=i.domain,p.scheme=i.scheme,p),collaborator:{add:function(e,n){return t.$apply(function(){return t.collaborator[n]=e})},update:function(e,n){return t.$apply(function(){return t.collaborator[n]=e})},remove:function(e,n){return t.$apply(function(){var e,r;return r=(e=t.collaborator)[n],delete e[n],r})}},page:d,block:g,placeholder:{remove:function(){var t;return t=document.querySelector("#editor > .inner > .placeholder"),t?t.parentNode.removeChild(t):void 0}},prune:function(t){return Array.from(t.querySelectorAll("[editable]")).map(function(t){return t.removeAttribute("editable")}),Array.from(t.querySelectorAll("[contenteditable]")).map(function(t){return t.removeAttribute("contenteditable")}),Array.from(t.querySelectorAll(".block-item > .handle")).map(function(t){return t.parentNode.removeChild(t)})},"export":function(t){var e,n,r,o;return null==t&&(t={}),e=document.querySelector("#editor > .inner").cloneNode(!0),n=document.querySelector("#editor-style"),r=document.querySelector("#page-basic"),this.prune(e),o=t.bodyOnly?e.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+n.innerHTML+'\n<style type="text/css"> '+r.innerHTML+" </style>\n</head><body>\n"+e.innerHTML+"\n</body></html>"}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},filter:".unsortable",preventOnFilter:!1,disabled:!1,draggable:".block-item",scrollSensitivity:100,scrollSpeed:40,onAdd:function(t){return g.prepare(t.item)},onEnd:function(t){return t.oldIndex!==t.newIndex?o.action.moveBlock(t.oldIndex,t.newIndex):void 0}}),h=document.querySelector("#editor > .inner"),h.addEventListener("dragover",function(){return m.placeholder.remove()}),t["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=m["export"](),this.modal.ctrl.toggle(!0)}},t.preview={modal:{},run:function(){return this.code=m["export"]({bodyOnly:!0}),document.querySelector("#editor-preview").innerHTML=this.code,this.modal.ctrl.toggle(!0)}},t.config={modal:{},size:{value:1024,name:"1024px",set:function(t){return/px/.exec(t)?this.value=parseInt(t.replace(/px/,"")):/Full/.exec(t)?this.value=window.innerWidth:/%/.exec(t)&&(this.value=window.innerWidth*Math.round(t.replace(/%/,""))*.01),this.name=t}}},t.pageConfig={modal:{},tab:1,toggle:function(){return l.setBlock(document.querySelector("#editor > .inner")),this.modal.ctrl.toggle()}},t.blockConfig={modal:{},toggle:function(t){return l.setBlock(t),this.modal.ctrl.toggle()}},t.share={modal:{},link:window.location.origin+(window.location.pathname+"/view").replace(/\/\//g,"/")},t.$watch("config.size.value",function(){var e,n,r,o;return e=document.querySelector("#blocks-picker"),n=document.querySelector("#collab-info"),r=document.querySelector(".editor-preview-modal .cover-modal-inner"),o=t.config.size.value,e.style.right=o+Math.round((window.innerWidth-o)/2)+"px",n.style.left=o+Math.round((window.innerWidth-o)/2)+"px",r.style.width=o+"px"}),t.editor=m,t.collaborator={},document.body.addEventListener("keyup",function(t){return c.toggle(null),o.action.editBlock(t.target)}),f=t.user.data||{displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0},m.online.retry(),document.querySelector("#editor .inner").addEventListener("click",function(t){var e,n,r,i,l;for(e=t.target;e&&(!e.getAttribute||!e.getAttribute("edit-text"));)e=e.parentNode;for(e&&e.getAttribute&&e.getAttribute("edit-text")&&u.toggle(null),e=t.target;e&&(!e.getAttribute||!e.getAttribute("image"));)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("image")&&("bk"!==e.getAttribute("image")||t.target===e)?(n=e.getBoundingClientRect(),r=Math.round(2*(n.width>n.height?n.width:n.height)),r>1024&&(r=1024),i=r+"x"+r,l=uploadcare.openDialog(null,null,{multiple:!!e.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),l.done(function(n){var r,i,l;return r=(i=n.files)?i():[n],1===r.length?(e.style.backgroundImage="url(/assets/img/loader/msg.svg)",r[0].done(function(n){return e.style.backgroundImage="url("+n.cdnUrl+"/-/preview/800x600/)",o.action.editBlock(t.target)})):(l=e.parentNode.querySelectorAll("[image]"),Array.from(l).map(function(t){return t.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(r.map(function(t){return t.promise()})).then(function(t){var n,r,i,a;for(n=0,r=0,i=l.length;i>r;++r)a=r,l[a].style.backgroundImage="url("+t[n].cdnUrl+"/-/preview/800x600/)",n=(n+1)%t.length;return o.action.editBlock(e.parentNode)}))})):void 0}),b=null,e(function(){var t,e,n,r;if(t=window.getSelection(),t&&t.rangeCount&&(e=document.querySelector("#editor > .inner").getBoundingClientRect(),n=t.getRangeAt(0),r=n.getBoundingClientRect(),r.x-=e.x,r.y-=e.y,!b||b.x!==r.x||b.y!==r.y||null!=b.width&&b.width!==r.width||null!=b.height&&b.height!==r.height)){if(r.x<0||r.x>e.width){if(b&&b.blur)return;b={blur:!0}}else b={x:r.x,y:r.y,width:r.width,height:r.height};return o.action.cursor(f,b)}},1e3),document.body.addEventListener("mouseup",function(){var t,e,n,r,o,i,l;if(t=window.getSelection(),t.rangeCount){if(e=t.getRangeAt(0),n=[e.startContainer,e.endContainer],r=n[0],o=n[1],r!==o){for(i=r;i&&i.parentNode;)if(i=i.parentNode,o===i)return e.selectNodeContents(r);for(l=o;o&&o.parentNode&&(o=o.previousSibling||o.parentNode,0===o.childNodes.length||o===l.parentNode&&0===Array.from(o.childNodes).indexOf(l)););}return 3===r.nodeType&&(r=r.previousSibling||r.parentNode),3===o.nodeType&&(o=o.previousSibling||o.parentNode),r===o&&o!==e.endContainer&&0===e.endOffset?e.selectNodeContents(r):void 0}}),y=document.querySelector("#blocks-picker"),v=document.querySelector("#blocks-preview"),y.addEventListener("dragstart",function(){return v.style.display="none"}),y.addEventListener("mouseout",function(){return v.style.display="none"}),y.addEventListener("mousemove",function(t){var e,n,r,o,i,l,a,u,c;return e=t.target,e.classList&&e.classList.contains("thumb")?(n=e.getBoundingClientRect(),r=e.getAttribute("name"),o=e.getAttribute("ratio"),20>o&&(o=20),i=window.innerHeight+document.scrollingElement.scrollTop,l=n.y+.5*n.height-25+document.scrollingElement.scrollTop,a=2.56*o,l+a>i-5&&(l=i-a-5),u=v.style,u.left=n.x+n.width+"px",u.top=l+"px",u.display="block",v.querySelector(".name").innerText=r,c=v.querySelector(".inner").style,c.backgroundImage="url(/blocks/"+r+"/index.jpg)",c.height="0",c.paddingBottom=o-1+"%",c):void(e!==y&&(v.style.display="none"))}),document.addEventListener("scroll",function(){return c.toggle(null),v.style.display="none"}),["mousemove","keydown","scroll"].map(function(t){return document.addEventListener(t,function(){return m.online.retry.countdown=m.online.defaultCountdown})})}));
function import$(e,t){var n={}.hasOwnProperty;for(var r in t)n.call(t,r)&&(e[r]=t[r]);return e}var x$;x$=angular.module("webedit"),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports),res(this$.cache[name])})})}}})),x$.controller("editor",["$scope","$interval","$timeout","blockLoader","collaborate","global"].concat(function(e,t,n,r,o,i){var l,a,u,c,s,d,g,m,p,h,f,b;return e.loading=!0,l={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","indent"].map(function(e){return{name:e,contentDefault:"<i class='fa fa-"+e+"'></i>"}}).concat(["h1","h2","h3","h4"],[{name:"colorPicker",contentDefault:"<i class='fa fa-adjust'></i>"},{name:"align-left",contentDefault:"1"},{name:"align-center",contentDefault:"2"},{name:"align-right",contentDefault:"3"},{name:"anchor",contentDefault:"<i class='fa fa-link'></i>"},{name:"removeFormat",contentDefault:"<i class='fa fa-eraser'></i>"}])},extensions:{colorPicker:new ColorPickerExtension,alignLeft:mediumEditorAlignExtention.left,alignCenter:mediumEditorAlignExtention.center,alignRight:mediumEditorAlignExtention.right},spellcheck:!1}),this.list.push(t),t.subscribe("editableInput",function(e,t){return o.action.editBlock(t)}),t}},a={elem:null,coord:{x:0,y:0},init:function(){var e=this;return this.elem=document.querySelector("#editor-text-handle"),this.elem.addEventListener("click",function(t){var n,i;return t.target.classList.contains("medium-editor-toolbar-save")?(n=e.elem.querySelector("input").value,i=o.action.info(e.target),r.get(i[3]).then(function(t){var r;return((r=t.exports||(t.exports={})).transform||(r.transform={})).text&&(n=((r=t.exports||(t.exports={})).transform||(r.transform={})).text(n)),n&&e.target.setAttribute(e.target.getAttribute("edit-text"),n),((r=t.exports||(t.exports={})).handle||(r.handle={})).text&&((r=t.exports||(t.exports={})).handle||(r.handle={})).text(e.target,n),o.action.editBlock(e.target)})):t.target.classList.contains("medium-editor-toolbar-close")?e.toggle(null):void 0})},toggle:function(e){var t=this;return null==e&&(e={}),this.timeout&&(n.cancel(this.timeout),this.timeout=null),e.delay?this.timeout=n(function(){return t._toggle(e)},e.delay):this._toggle(e)},_toggle:function(e){var t,n,r,o,i,l,a,u;return t=e.node,n=e.inside,r=e.text,o=e.placeholder,this.elem||this.init(),o&&this.elem.querySelector("input").setAttribute("placeholder",o),i=(this.elem.getAttribute("class")||"").replace(/ ?ldt-\S+ ?/," ").replace(/ ?opt-\S+ ?/g," "),t?(this.target=t,l=t.getBoundingClientRect(),a={x:l.x+.5*l.width-150+"px",y:l.y-48+document.scrollingElement.scrollTop+"px"},(this.coord.x!==a.x||this.coord.y!==a.y)&&(this.elem.setAttribute("class",i+" ldt-bounce-out"),l=t.getBoundingClientRect()),u=this.elem.style,u.left=a.x,u.top=a.y,u.display="block",this.elem.setAttribute("class",i+" ldt-bounce-in"),import$(this.coord,a),this.elem.querySelector("input").value=r):(this.elem.setAttribute("class",i+" ldt-bounce-out"),this.elem.style.display="none")}},a.init(),u={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var n,r,i,l;if(e.target)return n=e.target,r=n.parentNode,i=t.target.getAttribute("class"),/fa-clone/.exec(i)?(l=n.cloneNode(!0),l.setAttribute("class",l.getAttribute("class")+" ld ldt-bounce-in"),c.initChild(l),r.insertBefore(l,n.nextSibling),setTimeout(function(){return l.setAttribute("class",l.getAttribute("class").replace("ld ldt-bounce-in"," ")),o.action.editBlock(r)},800)):/fa-trash-o/.exec(i)?(n.setAttribute("class",n.getAttribute("class")+" ld ldt-bounce-out"),setTimeout(function(){return r.removeChild(n),o.action.editBlock(r)},400)):/fa-link/.exec(i),e.elem.style.display="none",o.action.editBlock(r)})},coord:{x:0,y:0},toggle:function(e,t){var n,r,o,i;return null==t&&(t=!1),this.elem||this.init(),n=(this.elem.getAttribute("class")||"").replace(/ ?ldt-\S+ ?/," ").replace(/ ?opt-\S+ ?/g," "),e?(this.target=e,r=e.getBoundingClientRect(),o={x:r.x+r.width+5+(t?-20:0)+"px",y:r.y+.5*r.height-32+document.scrollingElement.scrollTop+"px"},(this.coord.x!==o.x||this.coord.y!==o.y)&&(this.elem.setAttribute("class",n+" ldt-bounce-out"),r=e.getBoundingClientRect()),i=this.elem.style,i.left=o.x,i.top=o.y,i.display="block",this.elem.setAttribute("class",n+" ldt-bounce-in"),import$(this.coord,o)):(this.elem.setAttribute("class",n+" ldt-bounce-out"),this.elem.style.display="none")}},u.init(),c={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(t){return Sortable.create(t,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:"."+t.childNodes[0].getAttribute("class").split(" ")[0].trim(),onEnd:function(){return o.action.editBlock(e)}})})},init:function(e){var t,n=this;return e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("mousedown",function(t){var r,o,i,l,a=[];if(r=t.target,r.getAttribute("repeat-item"))return o=window.getSelection(),void(0===o.extentOffset&&r.setAttribute("contenteditable",!1));if(i=n.search(r,document.createRange(),{x:t.clientX,y:t.clientY}),i&&i[0]&&(i[0].length<=i[1]||0===i[1])&&i[2]>800);else if(r.parentNode&&!r.parentNode.getAttribute("repeat"))return void r.setAttribute("contenteditable",!0);for(l=window.getSelection();r&&r.parentNode&&(r.getAttribute("contenteditable")&&r.setAttribute("contenteditable",!1),r!==e);)a.push(r=r.parentNode);return a}),t=null,this.initChild(e),e.addEventListener("mousemove",function(e){var t;for(t=e.target;t&&t.getAttribute&&(!t.getAttribute("image")||!t.getAttribute("repeat-item"));)t=t.parentNode;return t&&t.getAttribute?u.toggle(t,!0):void 0}),e.addEventListener("mouseover",function(e){var t,n,r;for(t=e.target;t&&t.getAttribute&&!t.getAttribute("edit-text");)t=t.parentNode;return t&&t.getAttribute?(n=t.getAttribute(t.getAttribute("edit-text")),r=t.getAttribute("edit-text-placeholder")||"enter some text...",a.toggle({node:t,inside:!0,text:n,placeholder:r})):a.toggle({delay:500})}),e.addEventListener("click",function(r){var o,i,l,a,c,s,d,g,m;if(o=null,i=!1,l=window.getSelection(),l.rangeCount>0){if(a=window.getSelection().getRangeAt(0),a.startOffset<a.endOffset||!a.collapsed)return;o=[a.startContainer,a.startOffset]}for(c=r.target;c&&c.parentNode&&c.getAttribute&&!c.getAttribute("repeat-item");)c=c.parentNode;if(u.toggle(c&&c.getAttribute&&c.getAttribute("repeat-item")?c:null),r.target&&r.target.getAttribute&&r.target.getAttribute("repeat-item"))return c=r.target,c.setAttribute("contenteditable",!0),c.focus(),l=window.getSelection(),l.rangeCount?a=l.getRangeAt(0):(a=document.createRange(),l.addRange(a)),a.collapse(!1),void a.selectNodeContents(c);for(c=r.target,s=c.getAttribute("editable"),"false"===s&&(i=!0),c.removeAttribute("contenteditable");c&&"true"!==c.getAttribute("editable");){if(c.getAttribute("image")&&"bk"!==c.getAttribute("image")||"false"===c.getAttribute("editable")){i=!0;break}if(c.parentNode&&"true"===c.parentNode.getAttribute("repeat-host"))break;if(!c.parentNode)return;if(c===e)break;c=c.parentNode}return c.setAttribute("contenteditable",!i),!i&&(c.focus(),l=window.getSelection(),0!==l.rangeCount&&(a=l.getRangeAt(0),d=(g=o)?g:n.search(c,a,{x:r.clientX,y:r.clientY}),d&&0!==d.length))?(t&&r.shiftKey&&r.target.getAttribute("repeat-item")?(m=[[t.startContainer,t.startOffset],[d[0],d[1]]],m[0][1]>m[1][1]&&(m=[m[1],m[0]]),a.setStart(m[0][0],m[0][1]),a.setEnd(m[1][0],m[1][1])):(a.setStart(d[0],d[1]),a.collapse(!0)),t=a):void 0})},search:function(e,t,n,r){var o,i,l,a,u,c,s,d,g,m,p,h,f,b;for(null==r&&(r=!0),o=[],i=0,l=e.childNodes.length;l>i;++i)if(a=i,u=e.childNodes[a],"#text"!==u.nodeName)u.getBoundingClientRect&&(f=u.getBoundingClientRect(),f.x<=n.x&&f.y<=n.y&&(o=o.concat(this.search(u,t,n,!1))));else{for(c=[-1,-1,-1],s=c[0],d=c[1],g=c[2],m=0,p=u.length+1;p>m;++m)if(h=m,t.setStart(u,h),f=t.getBoundingClientRect(),f.x<=n.x&&f.y<=n.y)c=[h,n.x-f.x,n.y-f.y],s=c[0],d=c[1],g=c[2];else if(f.x>n.x&&f.y>n.y)break;s>=0&&o.push([u,s,d,g])}if(!r||!o.length)return o;for(o=o.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),c=[o[0][2],0],b=c[0],s=c[1],i=1,l=o.length;l>i;++i)a=i,o[a][2]<b&&(c=[o[a][2],a],b=c[0],s=c[1]);return o[s]}},s={library:{root:null,loaded:{},scripts:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.loaded[e]?void 0:r.get(e)}).then(function(n){var r,o,i,l,a;if(null==n&&(n={}),t.root||(t.root=document.querySelector("#editor-library")),r=(n.exports||(n.exports={})).library){o=document.createElement("div");for(i in r)l=r[i],t.scripts[l]||(a=t.scripts[l]=document.createElement("script"),a.setAttribute("type","text/javascript"),a.setAttribute("src",l),t.root.appendChild(a));return t.loaded[e]=!0}})}},style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:r.get(e)}).then(function(e){var n;return n=document.createElement("style"),n.setAttribute("type","text/css"),n.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(n)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},remove:function(e){return o.action.deleteBlock(e),e.parentNode.removeChild(e)},prepare:function(t,n,i,a){var u,g,m,p,h,f=this;return null==n&&(n=null),null==i&&(i=null),null==a&&(a=!1),u=[!0,null],g=u[0],m=u[1],"string"==typeof t&&(u=[t,!1],m=u[0],g=u[1],t=document.createElement("div"),p=document.querySelector("#editor > .inner"),p.insertBefore(t,p.childNodes[i]),d.placeholder.remove()),n=n||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){return"base-block"!==e.name?t.removeAttribute(e.name):void 0}),t.setAttribute("class","initializing"),h=r.get(n).then(function(r){var i,u,d,p;if(!a){for(i=document.createElement("div"),i.setAttribute("class","inner"),i.innerHTML=m?m:r.html;t.lastChild;)t.removeChild(t.lastChild);t.appendChild(i),u=document.createElement("div"),u.setAttribute("class","handle ld ldt-grow-rtl"),u.innerHTML=["arrows","cog","times"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),u.addEventListener("click",function(n){var r;return r=n.target.getAttribute("class"),/fa-times/.exec(r)?f.remove(t):/fa-cog/.exec(r)?e.config.modal.ctrl.toggle():void 0}),t.appendChild(u),t.addEventListener("dragstart",function(){return l.pause()}),t.addEventListener("dragend",function(){return l.resume()}),s.style.add(n),s.library.add(n),g&&o.action.insertBlock(t)}return t.setAttribute("class","block-item block-"+n),t.setAttribute("base-block",n),i=t.querySelector(".block-item > .inner"),((d=r.exports||(r.exports={})).config||(d.config={})).editable!==!1&&(p=l.prepare(i)),c.init(i),r.exports&&r.exports.wrap?r.exports.wrap(t,o):void 0})}},d={online:{state:!0,retry:function(){return d.loading.toggle(!0),this.state=!0,n(function(){return o.init(document.querySelector("#editor .inner"),d,p)},100)},toggle:function(t){return e.force$apply(function(){return d.online.state=t,d.loading.toggle(!0)})}},loading:{toggle:function(t){return e.force$apply(function(){return e.loading=null!=t?t:!e.loading})}},server:(g={},g.domain=i.domain,g.scheme=i.scheme,g),collaborator:{add:function(t,n){return e.$apply(function(){return e.collaborator[n]=t})},update:function(t,n){return e.$apply(function(){return e.collaborator[n]=t})},remove:function(t,n){return e.$apply(function(){var t,r;return r=(t=e.collaborator)[n],delete t[n],r})}},block:s,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,n,r,o;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),n=document.querySelector("#editor-style"),r=document.querySelector("#page-basic"),this.prune(t),o=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+n.innerHTML+'\n<style type="text/css"> '+r.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>"}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},filter:".unsortable",preventOnFilter:!1,disabled:!1,draggable:".block-item",onAdd:function(e){return s.prepare(e.item)},onEnd:function(e){return e.oldIndex!==e.newIndex?o.action.moveBlock(e.oldIndex,e.newIndex):void 0}}),m=document.querySelector("#editor > .inner"),m.addEventListener("dragover",function(){return d.placeholder.remove()}),e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=d["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return this.code=d["export"]({bodyOnly:!0}),document.querySelector("#editor-preview").innerHTML=this.code,this.modal.ctrl.toggle(!0)}},e.config={modal:{},pageModal:{},size:{value:1024,name:"1024px",set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e}}},e.share={modal:{},link:window.location.origin+(window.location.pathname+"/view").replace(/\/\//g,"/")},e.$watch("config.size.value",function(){var t,n,r,o;return t=document.querySelector("#blocks-picker"),n=document.querySelector("#collab-info"),r=document.querySelector(".editor-preview-modal .cover-modal-inner"),o=e.config.size.value,t.style.right=o+Math.round((window.innerWidth-o)/2)+"px",n.style.left=o+Math.round((window.innerWidth-o)/2)+"px",r.style.width=o+"px"}),e.editor=d,e.collaborator={},document.body.addEventListener("keyup",function(e){return u.toggle(null),o.action.editBlock(e.target)}),p=e.user.data||{displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0},d.online.retry(),document.querySelector("#editor .inner").addEventListener("click",function(e){var t,n,r,i,l;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("image"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("image")&&("bk"!==t.getAttribute("image")||e.target===t)?(n=t.getBoundingClientRect(),r=Math.round(2*(n.width>n.height?n.width:n.height)),r>1024&&(r=1024),i=r+"x"+r,l=uploadcare.openDialog(null,null,{multiple:!!t.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),l.done(function(n){var r,i,l;return r=(i=n.files)?i():[n],1===r.length?(t.style.backgroundImage="url(/assets/img/loader/msg.svg)",r[0].done(function(n){return t.style.backgroundImage="url("+n.cdnUrl+"/-/preview/800x600/)",o.action.editBlock(e.target)})):(l=t.parentNode.querySelectorAll("[image]"),Array.from(l).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(r.map(function(e){return e.promise()})).then(function(e){var n,r,i,a;for(n=0,r=0,i=l.length;i>r;++r)a=r,l[a].style.backgroundImage="url("+e[n].cdnUrl+"/-/preview/800x600/)",n=(n+1)%e.length;return o.action.editBlock(t.parentNode)}))})):void 0}),h=null,t(function(){var e,t,n,r;if(e=window.getSelection(),e&&e.rangeCount&&(t=document.querySelector("#editor > .inner").getBoundingClientRect(),n=e.getRangeAt(0),r=n.getBoundingClientRect(),r.x-=t.x,r.y-=t.y,!h||h.x!==r.x||h.y!==r.y||null!=h.width&&h.width!==r.width||null!=h.height&&h.height!==r.height)){if(r.x<0||r.x>t.width){if(h&&h.blur)return;h={blur:!0}}else h={x:r.x,y:r.y,width:r.width,height:r.height};return o.action.cursor(p,h)}},1e3),document.body.addEventListener("mouseup",function(){var e,t,n,r,o,i,l;if(e=window.getSelection(),e.rangeCount){if(t=e.getRangeAt(0),n=[t.startContainer,t.endContainer],r=n[0],o=n[1],r!==o){for(i=r;i&&i.parentNode;)if(i=i.parentNode,o===i)return t.selectNodeContents(r);for(l=o;o&&o.parentNode&&(o=o.previousSibling||o.parentNode,0===o.childNodes.length||o===l.parentNode&&0===Array.from(o.childNodes).indexOf(l)););}return 3===r.nodeType&&(r=r.previousSibling||r.parentNode),3===o.nodeType&&(o=o.previousSibling||o.parentNode),r===o&&o!==t.endContainer&&0===t.endOffset?t.selectNodeContents(r):void 0}}),f=document.querySelector("#blocks-picker"),b=document.querySelector("#blocks-preview"),f.addEventListener("dragstart",function(){return b.style.display="none"}),f.addEventListener("mouseout",function(){return b.style.display="none"}),f.addEventListener("mousemove",function(e){var t,n,r,o,i,l,a,u,c;return t=e.target,t.classList&&t.classList.contains("thumb")?(n=t.getBoundingClientRect(),r=t.getAttribute("name"),o=t.getAttribute("ratio"),20>o&&(o=20),i=window.innerHeight+document.scrollingElement.scrollTop,l=n.y+.5*n.height-25+document.scrollingElement.scrollTop,a=2.56*o,l+a>i-5&&(l=i-a-5),u=b.style,u.left=n.x+n.width+"px",u.top=l+"px",u.display="block",b.querySelector(".name").innerText=r,c=b.querySelector(".inner").style,c.backgroundImage="url(/blocks/"+r+"/index.jpg)",c.height="0",c.paddingBottom=o-1+"%",c):void(t!==f&&(b.style.display="none"))}),document.addEventListener("scroll",function(){return u.toggle(null),b.style.display="none"})}));
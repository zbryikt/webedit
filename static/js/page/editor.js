var x$;x$=angular.module("webedit"),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports),res(this$.cache[name])})})}}})),x$.controller("editor",["$scope","$timeout","blockLoader","collaborate","global"].concat(function(e,t,r,n,o){var i,a,l,c,u,d,s,m;return i={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","h1","h2","h3","h4","indent","colorPicker","anchor","justifyLeft","justifyCenter","justifyRight"]},extensions:{colorPicker:new ColorPickerExtension},spellcheck:!1}),this.list.push(t),t.subscribe("editableInput",function(e,t){return n.action.editBlock(t)}),t}},a={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var r,o,i,a;if(e.target)return r=e.target,o=r.parentNode,i=t.target.getAttribute("class"),/fa-clone/.exec(i)?(a=r.cloneNode(!0),l.initChild(a),o.appendChild(a)):/fa-trash-o/.exec(i)&&o.removeChild(r),e.elem.style.display="none",n.action.editBlock(o)})},toggle:function(e,t){var r,n,o;return null==t&&(t=!1),this.elem||this.init(),r=(this.elem.getAttribute("class")||"").replace(/ ?ldt-\S+ ?/," "),this.elem.setAttribute("class",r+" ldt-bounce-out"),e?(this.target=e,n=e.getBoundingClientRect(),o=this.elem.style,o.left=n.x+n.width+5+(t?-20:0)+"px",o.top=n.y+.5*n.height-32+document.scrollingElement.scrollTop+"px",o.display="block",this.elem.setAttribute("class",r+" ldt-bounce-in")):this.elem.style.display="none"}},a.init(),l={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(t){return Sortable.create(t,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:"."+t.childNodes[0].getAttribute("class").split(" ")[0].trim(),onEnd:function(){return n.action.editBlock(e)}})})},init:function(e){var t,r=this;return e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("mousedown",function(t){var n,o,i,a,l=[];if(n=t.target,n.getAttribute("repeat-item"))return o=window.getSelection(),void(0===o.extentOffset&&n.setAttribute("contenteditable",!1));if(i=r.search(n,document.createRange(),{x:t.clientX,y:t.clientY}),i&&i[0]&&(i[0].length<=i[1]||0===i[1])&&i[2]>800);else if(n.parentNode&&!n.parentNode.getAttribute("repeat"))return void n.setAttribute("contenteditable",!0);for(a=window.getSelection();n&&n.parentNode&&(n.getAttribute("contenteditable")&&n.setAttribute("contenteditable",!1),n!==e);)l.push(n=n.parentNode);return l}),t=null,this.initChild(e),e.addEventListener("mousemove",function(e){var t;for(t=e.target;t&&t.getAttribute&&(!t.getAttribute("image")||!t.getAttribute("repeat-item"));)t=t.parentNode;return t&&t.getAttribute?a.toggle(t,!0):void 0}),e.addEventListener("click",function(n){var o,i,l,c,u,d,s,m,g;if(o=null,i=!1,l=window.getSelection(),l.rangeCount>0){if(c=window.getSelection().getRangeAt(0),c.startOffset<c.endOffset||!c.collapsed)return;o=[c.startContainer,c.startOffset]}for(u=n.target;u&&u.parentNode&&u.getAttribute&&!u.getAttribute("repeat-item");)u=u.parentNode;if(a.toggle(u&&u.getAttribute&&u.getAttribute("repeat-item")?u:null),u&&u.getAttribute&&u.getAttribute("repeat-item"))return u=n.target,u.setAttribute("contenteditable",!0),u.focus(),l=window.getSelection(),l.rangeCount?c=l.getRangeAt(0):(c=document.createRange(),l.addRange(c)),c.collapse(!1),void c.selectNodeContents(u);for(u=n.target,d=u.getAttribute("editable"),"false"===d&&(i=!0),u.removeAttribute("contenteditable");u&&"true"!==u.getAttribute("editable");){if(u.getAttribute("image")||"false"===u.getAttribute("editable")){i=!0;break}if(u.parentNode&&"true"===u.parentNode.getAttribute("repeat-host"))break;if(!u.parentNode)return;if(u===e)break;u=u.parentNode}return u.setAttribute("contenteditable",!i),!i&&(u.focus(),l=window.getSelection(),0!==l.rangeCount&&(c=l.getRangeAt(0),s=(m=o)?m:r.search(u,c,{x:n.clientX,y:n.clientY}),s&&0!==s.length))?(t&&n.shiftKey?(g=[[t.startContainer,t.startOffset],[s[0],s[1]]],g[0][1]>g[1][1]&&(g=[g[1],g[0]]),c.setStart(g[0][0],g[0][1]),c.setEnd(g[1][0],g[1][1])):(c.setStart(s[0],s[1]),c.collapse(!0)),t=c):void 0})},search:function(e,t,r,n){var o,i,a,l,c,u,d,s,m,g,p,h,f,b;for(null==n&&(n=!0),o=[],i=0,a=e.childNodes.length;a>i;++i)if(l=i,c=e.childNodes[l],"#text"!==c.nodeName)c.getBoundingClientRect&&(f=c.getBoundingClientRect(),f.x<=r.x&&f.y<=r.y&&(o=o.concat(this.search(c,t,r,!1))));else{for(u=[-1,-1,-1],d=u[0],s=u[1],m=u[2],g=0,p=c.length+1;p>g;++g)if(h=g,t.setStart(c,h),f=t.getBoundingClientRect(),f.x<=r.x&&f.y<=r.y)u=[h,r.x-f.x,r.y-f.y],d=u[0],s=u[1],m=u[2];else if(f.x>r.x&&f.y>r.y)break;d>=0&&o.push([c,d,s,m])}if(!n||!o.length)return o;for(o=o.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),u=[o[0][2],0],b=u[0],d=u[1],i=1,a=o.length;a>i;++i)l=i,o[l][2]<b&&(u=[o[l][2],l],b=u[0],d=u[1]);return o[d]}},c={style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:r.get(e)}).then(function(e){var r;return r=document.createElement("style"),r.setAttribute("type","text/css"),r.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(r)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},remove:function(e){return n.action.deleteBlock(e),e.parentNode.removeChild(e)},prepare:function(t,o,a){var d,s,m,g,p=this;return null==o&&(o=null),null==a&&(a=null),d=[!0,null],s=d[0],m=d[1],"string"==typeof t&&(d=[t,!1],m=d[0],s=d[1],t=document.createElement("div"),g=document.querySelector("#editor > .inner"),g.insertBefore(t,g.childNodes[a]),u.placeholder.remove()),o=o||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){return t.removeAttribute(e.name)}),r.get(o).then(function(r){var a,u,d,g;for(a=document.createElement("div"),a.setAttribute("class","inner"),a.innerHTML=m?m:r.html;t.lastChild;)t.removeChild(t.lastChild);return t.appendChild(a),((u=r.exports||(r.exports={})).config||(u.config={})).editable!==!1&&(d=i.prepare(a)),l.init(a),r.exports&&r.exports.wrap&&r.exports.wrap(t),t.setAttribute("class","block-item block-"+o),t.setAttribute("base-block",o),g=document.createElement("div"),g.setAttribute("class","handle"),g.innerHTML=["arrows","cog","times"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),g.addEventListener("click",function(r){var n;return n=r.target.getAttribute("class"),/fa-times/.exec(n)?p.remove(t):/fa-cog/.exec(n)?e.config.modal.ctrl.toggle():void 0}),t.appendChild(g),t.addEventListener("dragstart",function(){return i.pause()}),t.addEventListener("dragend",function(){return i.resume()}),c.style.add(o),s?n.action.insertBlock(t):void 0})}},u={server:(d={},d.domain=o.domain,d.scheme=o.scheme,d),collaborator:{add:function(t,r){return e.$apply(function(){return e.collaborator[r]=t})},remove:function(t,r){return e.$apply(function(){var t,n;return n=(t=e.collaborator)[r],delete t[r],n})}},block:c,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,r,n,o;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),r=document.querySelector("#editor-style"),n=document.querySelector("#page-basic"),this.prune(t),o=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+r.innerHTML+'\n<style type="text/css"> '+n.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>"}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},disabled:!1,draggable:".block-item",onAdd:function(e){return c.prepare(e.item)},onEnd:function(e){return n.action.moveBlock(e.oldIndex,e.newIndex)}}),s=document.querySelector("#editor > .inner"),s.addEventListener("dragover",function(){return u.placeholder.remove()}),e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=u["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return this.code=u["export"]({bodyOnly:!0}),document.querySelector("#editor-preview").innerHTML=this.code,this.modal.ctrl.toggle(!0)}},e.config={modal:{},size:{value:800,name:"800px",set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e}}},e.$watch("config.size.value",function(){var t,r,n,o;return t=document.querySelector("#blocks-picker"),r=document.querySelector("#collab-info"),n=document.querySelector(".editor-preview-modal .cover-modal-inner"),o=e.config.size.value,t.style.right=o+Math.round((window.innerWidth-o)/2)+"px",r.style.left=o+Math.round((window.innerWidth-o)/2)+"px",n.style.width=o+"px"}),e.collaborator={},document.addEventListener("scroll",function(){return a.toggle(null)}),document.body.addEventListener("keyup",function(e){return a.toggle(null),n.action.editBlock(e.target)}),m=e.user.data||{displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0},n.init(document.querySelector("#editor .inner"),u,m),window.addEventListener("beforeunload",function(){return n.action.exit(m)}),document.querySelector("#editor .inner").addEventListener("click",function(e){var t,r,o,i,a;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("image"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("image")?(r=t.getBoundingClientRect(),o=Math.round(2*(r.width>r.height?r.width:r.height)),o>1024&&(o=1024),i=o+"x"+o,a=uploadcare.openDialog(null,null,{multiple:!!t.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),a.done(function(r){var o,i,a;return o=(i=r.files)?i():[r],1===o.length?(t.style.backgroundImage="url(/assets/img/loader/msg.svg)",o[0].done(function(r){return t.style.backgroundImage="url("+r.cdnUrl+"/-/preview/800x600/)",n.action.editBlock(e.target)})):(a=t.parentNode.querySelectorAll("[image]"),Array.from(a).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(o.map(function(e){return e.promise()})).then(function(e){var r,o,i,l;for(r=0,o=0,i=a.length;i>o;++o)l=o,a[l].style.backgroundImage="url("+e[r].cdnUrl+"/-/preview/800x600/)",r=(r+1)%e.length;return n.action.editBlock(t.parentNode)}))})):void 0})}));
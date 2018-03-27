var x$;x$=angular.module("webedit"),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports),res(this$.cache[name])})})}}})),x$.controller("editor",["$scope","$timeout","blockLoader","collaborate"].concat(function(e,t,r,n){var o,i,a,l,u,c,d;return o={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){}},i={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var r,o,i,l;if(e.target)return r=e.target,o=r.parentNode,i=t.target.getAttribute("class"),/fa-clone/.exec(i)?(l=r.cloneNode(!0),a.initChild(l),o.appendChild(l)):/fa-trash-o/.exec(i)&&o.removeChild(r),e.elem.style.display="none",n.action.editBlock(o)})},toggle:function(e,t){var r,n;return null==t&&(t=!1),this.elem||this.init(),e?(this.target=e,r=e.getBoundingClientRect(),n=this.elem.style,n.left=r.x+r.width+5+(t?-20:0)+"px",n.top=r.y+.5*r.height-32+document.scrollingElement.scrollTop+"px",n.display="block",n):this.elem.style.display="none"}},i.init(),a={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(e){return Array.from(e.querySelectorAll(".choice")).map(function(e){return e.addEventListener("dragstart",function(){return o.pause()})}),Sortable.create(e,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:"."+e.childNodes[0].getAttribute("class").split(" ")[0].trim()})})},init:function(e){var t,r=this;return e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("mousedown",function(t){var n,o,i,a,l=[];if(n=t.target,n.getAttribute("repeat-item"))return o=window.getSelection(),void(0===o.extentOffset&&n.setAttribute("contenteditable",!1));if(i=r.search(n,document.createRange(),{x:t.clientX,y:t.clientY}),i&&i[0]&&(i[0].length<=i[1]||0===i[1])&&i[2]>800);else if(n.parentNode&&!n.parentNode.getAttribute("repeat"))return void n.setAttribute("contenteditable",!0);for(a=window.getSelection();n&&n.parentNode&&(n.getAttribute("contenteditable")&&n.setAttribute("contenteditable",!1),n!==e);)l.push(n=n.parentNode);return l}),t=null,this.initChild(e),e.addEventListener("mousemove",function(e){var t;for(t=e.target;t&&t.getAttribute&&(!t.getAttribute("image")||!t.getAttribute("repeat-item"));)t=t.parentNode;return t&&t.getAttribute?i.toggle(t,!0):void 0}),e.addEventListener("click",function(n){var o,a,l,u,c,d,s,g,m;if(o=null,a=!1,l=window.getSelection(),l.rangeCount>0){if(u=window.getSelection().getRangeAt(0),u.startOffset<u.endOffset||!u.collapsed)return;o=[u.startContainer,u.startOffset]}for(c=n.target;c&&c.parentNode&&c.getAttribute&&!c.getAttribute("repeat-item");)c=c.parentNode;if(i.toggle(c&&c.getAttribute&&c.getAttribute("repeat-item")?c:null),c=n.target,n.target.getAttribute("repeat-item"))return c.setAttribute("contenteditable",!0),c.focus(),l=window.getSelection(),l.rangeCount?u=l.getRangeAt(0):(u=document.createRange(),l.addRange(u)),u.collapse(!1),void u.selectNodeContents(c);for(c=n.target,d=c.getAttribute("editable"),"false"===d&&(a=!0),c.removeAttribute("contenteditable");c&&"true"!==c.getAttribute("editable");){if(c.getAttribute("image")||"false"===c.getAttribute("editable")){a=!0;break}if(c.parentNode&&"true"===c.parentNode.getAttribute("repeat"))break;if(!c.parentNode)return;if(c===e)break;c=c.parentNode}return c.setAttribute("contenteditable",!a),!a&&(c.focus(),l=window.getSelection(),0!==l.rangeCount&&(u=l.getRangeAt(0),s=(g=o)?g:r.search(c,u,{x:n.clientX,y:n.clientY}),s&&0!==s.length))?(t&&n.shiftKey?(m=[[t.startContainer,t.startOffset],[s[0],s[1]]],m[0][1]>m[1][1]&&(m=[m[1],m[0]]),u.setStart(m[0][0],m[0][1]),u.setEnd(m[1][0],m[1][1])):(u.setStart(s[0],s[1]),u.collapse(!0)),t=u):void 0})},search:function(e,t,r,n){var o,i,a,l,u,c,d,s,g,m,p,h,f,b;for(null==n&&(n=!0),o=[],i=0,a=e.childNodes.length;a>i;++i)if(l=i,u=e.childNodes[l],"#text"!==u.nodeName)u.getBoundingClientRect&&(f=u.getBoundingClientRect(),f.x<=r.x&&f.y<=r.y&&(o=o.concat(this.search(u,t,r,!1))));else{for(c=[-1,-1,-1],d=c[0],s=c[1],g=c[2],m=0,p=u.length+1;p>m;++m)if(h=m,t.setStart(u,h),f=t.getBoundingClientRect(),f.x<=r.x&&f.y<=r.y)c=[h,r.x-f.x,r.y-f.y],d=c[0],s=c[1],g=c[2];else if(f.x>r.x&&f.y>r.y)break;d>=0&&o.push([u,d,s,g])}if(!n||!o.length)return o;for(o=o.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),c=[o[0][2],0],b=c[0],d=c[1],i=1,a=o.length;a>i;++i)l=i,o[l][2]<b&&(c=[o[l][2],l],b=c[0],d=c[1]);return o[d]}},l={style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:r.get(e)}).then(function(e){var r;return r=document.createElement("style"),r.setAttribute("type","text/css"),r.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(r)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},remove:function(e){return n.action.deleteBlock(e),e.parentNode.removeChild(e)},prepare:function(t,i,c){var d,s,g,m,p=this;return null==i&&(i=null),null==c&&(c=null),d=[!0,null],s=d[0],g=d[1],"string"==typeof t&&(d=[t,!1],g=d[0],s=d[1],t=document.createElement("div"),m=document.querySelector("#editor > .inner"),m.insertBefore(t,m.childNodes[c]),u.placeholder.remove()),i=i||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){return t.removeAttribute(e.name)}),r.get(i).then(function(r){var u,c,d;for(u=document.createElement("div"),u.setAttribute("class","inner"),u.innerHTML=g?g:r.html;t.lastChild;)t.removeChild(t.lastChild);return t.appendChild(u),a.init(u),r.exports&&r.exports.wrap&&r.exports.wrap(t),t.setAttribute("class","block-item block-"+i),t.setAttribute("base-block",i),((c=r.exports||(r.exports={})).config||(c.config={})).editable!==!1&&o.prepare(u),d=document.createElement("div"),d.setAttribute("class","handle"),d.innerHTML=["arrows","cog","times"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),d.addEventListener("click",function(r){var n;return n=r.target.getAttribute("class"),/fa-times/.exec(n)?p.remove(t):/fa-cog/.exec(n)?e.config.modal.ctrl.toggle():void 0}),t.appendChild(d),t.addEventListener("dragstart",function(){return o.pause()}),t.addEventListener("dragend",function(){return o.resume()}),l.style.add(i),s?n.action.insertBlock(t):void 0})}},u={collaborator:{add:function(t,r){return e.$apply(function(){return e.collaborator[r]=t})},remove:function(t,r){return e.$apply(function(){var t,n;return n=(t=e.collaborator)[r],delete t[r],n})}},block:l,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,r,n,o;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),r=document.querySelector("#editor-style"),n=document.querySelector("#page-basic"),this.prune(t),o=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+r.innerHTML+'\n<style type="text/css"> '+n.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>"}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},disabled:!1,draggable:".block-item",onAdd:function(e){return l.prepare(e.item)},onEnd:function(e){return n.action.moveBlock(e.oldIndex,e.newIndex)}}),c=document.querySelector("#editor > .inner"),c.addEventListener("dragover",function(){return u.placeholder.remove()}),e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=u["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return this.code=u["export"]({bodyOnly:!0}),document.querySelector("#editor-preview").innerHTML=this.code,this.modal.ctrl.toggle(!0)}},e.config={modal:{},size:{value:800,name:"800px",set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e}}},e.$watch("config.size.value",function(){var t,r,n,o;return t=document.querySelector("#blocks-picker"),r=document.querySelector("#collab-info"),n=document.querySelector(".editor-preview-modal .cover-modal-inner"),o=e.config.size.value,t.style.right=o+Math.round((window.innerWidth-o)/2)+"px",r.style.left=o+Math.round((window.innerWidth-o)/2)+"px",n.style.width=o+"px"}),e.collaborator={},document.addEventListener("scroll",function(){return i.toggle(null)}),document.body.addEventListener("keyup",function(e){return i.toggle(null),n.action.editBlock(e.target)}),d=e.user.data||{displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0},n.init(document.querySelector("#editor .inner"),u,d),window.addEventListener("beforeunload",function(){return n.action.exit(d)}),document.querySelector("#editor .inner").addEventListener("click",function(e){var t,r,o,i,a;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("image"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("image")?(r=t.getBoundingClientRect(),o=Math.round(2*(r.width>r.height?r.width:r.height)),o>1024&&(o=1024),i=o+"x"+o,console.log(o),a=uploadcare.openDialog(null,null,{multiple:!!t.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),a.done(function(r){var o,i,a;return o=(i=r.files)?i():[r],1===o.length?(t.style.backgroundImage="url(/assets/img/loader/msg.svg)",o[0].done(function(r){return t.style.backgroundImage="url("+r.cdnUrl+")",n.action.editBlock(e.target)})):(a=t.parentNode.querySelectorAll("[image]"),Array.from(a).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(o.map(function(e){return e.promise()})).then(function(e){var t,r,n,o,i=[];for(t=0,r=0,n=a.length;n>r;++r)o=r,a[o].style.backgroundImage="url("+e[t].cdnUrl+"/-/preview/800x600/)",i.push(t=(t+1)%e.length);return i}))})):void 0})}));
var sortEditable,x$;sortEditable={init:function(e){var t=this;return e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("mousedown",function(r){var n,o,i,a=[];if(n=r.target,o=t.search(n,document.createRange(),{x:r.clientX,y:r.clientY}),o&&o[0]&&(o[0].length<=o[1]||0===o[1])&&o[2]>800);else if(n.parentNode&&!n.parentNode.getAttribute("repeat"))return void n.setAttribute("contenteditable",!0);for(i=window.getSelection();n&&n.parentNode&&(n.getAttribute("contenteditable")&&n.setAttribute("contenteditable",!1),n!==e);)a.push(n=n.parentNode);return a}),e.addEventListener("click",function(r){var n,o,i,a,c,l;if(n=!1,o=window.getSelection(),!(o.rangeCount>0&&(i=window.getSelection().getRangeAt(0),i.startOffset<i.endOffset||!i.collapsed))){for(a=r.target,c=a.getAttribute("editable"),"false"===c&&(n=!0),a.removeAttribute("contenteditable");a&&"true"!==a.getAttribute("editable")&&(!a.parentNode||"true"!==a.parentNode.getAttribute("repeat"));){if(!a.parentNode)return;if(a===e)break;a=a.parentNode}if(a.setAttribute("contenteditable",!n),!n&&(a.focus(),o=window.getSelection(),0!==o.rangeCount&&(i=o.getRangeAt(0),l=t.search(a,i,{x:r.clientX,y:r.clientY}),l&&0!==l.length)))return i.setStart(l[0],l[1]),i.collapse(!0)}})},search:function(e,t,r,n){var o,i,a,c,l,u,d,s,p,m,f,h,b,g;for(null==n&&(n=!0),o=[],i=0,a=e.childNodes.length;a>i;++i)if(c=i,l=e.childNodes[c],"#text"!==l.nodeName)l.getBoundingClientRect&&(b=l.getBoundingClientRect(),b.x<=r.x&&b.y<=r.y&&(o=o.concat(this.search(l,t,r,!1))));else{for(u=[-1,-1,-1],d=u[0],s=u[1],p=u[2],m=0,f=l.length+1;f>m;++m)if(h=m,t.setStart(l,h),b=t.getBoundingClientRect(),b.x<=r.x&&b.y<=r.y)u=[h,r.x-b.x,r.y-b.y],d=u[0],s=u[1],p=u[2];else if(b.x>r.x&&b.y>r.y)break;d>=0&&o.push([l,d,s,p])}if(!n||!o.length)return o;for(o=o.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),u=[o[0][2],0],g=u[0],d=u[1],i=1,a=o.length;a>i;++i)c=i,o[c][2]<g&&(u=[o[c][2],c],g=u[0],d=u[1]);return o[d]}},x$=angular.module("webedit"),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports),res(this$.cache[name])})})}}})),x$.controller("editor",["$scope","$timeout","blockLoader","collaborate"].concat(function(e,t,r,n){var o,i,a;return o={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","h1","h2","h3","h4","indent","colorPicker","anchor","justifyLeft","justifyCenter","justifyRight"]},extensions:{colorPicker:new ColorPickerExtension}}),this.list.push(t),t.subscribe("editableInput",function(e,t){return n.action.editBlock(t)})}},i={style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:r.get(e)}).then(function(e){var r;return r=document.createElement("style"),r.setAttribute("type","text/css"),r.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(r)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0}},image:function(e){return Array.from(e.querySelectorAll("[image]")).map(function(e){var t,r;return t=document.createElement("input"),[["class","for-edit"],["type","hidden"],["role","uploadcare-uploader"],["data-image-shrink","1024x1024 70"],["data-crop","free"]].map(function(e){return t.setAttribute(e[0],e[1])}),e.appendChild(t),e.setAttribute("editable",!1),r=uploadcare.SingleWidget(t),Array.from(e.querySelectorAll("button")).map(function(e){return e.setAttribute("editable",!1)}),r.onChange(function(t){return t?t.done(function(t){return e.style.backgroundImage="url("+t.cdnUrl+")"}):void 0})})},remove:function(e){return n.action.deleteBlock(e),e.parentNode.removeChild(e)},prepare:function(e,t,a){var c,l,u,d,s=this;return null==t&&(t=null),null==a&&(a=null),c=[!0,null],l=c[0],u=c[1],"string"==typeof e&&(c=[e,!1],u=c[0],l=c[1],e=document.createElement("div"),d=document.querySelector("#editor > .inner"),d.insertBefore(e,d.childNodes[a])),t=t||e.getAttribute("base-block"),Array.from(e.attributes).map(function(t){return e.removeAttribute(t.name)}),r.get(t).then(function(r){var a,c,d;for(a=document.createElement("div"),a.setAttribute("class","inner"),a.innerHTML=u?u:r.html;e.lastChild;)e.removeChild(e.lastChild);return e.appendChild(a),sortEditable.init(a),r.exports&&r.exports.wrap&&r.exports.wrap(e),e.setAttribute("class","block-item block-"+t),e.setAttribute("base-block",t),((c=r.exports||(r.exports={})).config||(c.config={})).editable!==!1&&o.prepare(a),d=document.createElement("div"),d.setAttribute("class","handle"),d.innerHTML=["arrows","cog","times"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),d.addEventListener("click",function(t){return/fa-times/.exec(t.target.getAttribute("class"))?s.remove(e):void 0}),e.appendChild(d),e.addEventListener("dragstart",function(){return o.pause()}),e.addEventListener("dragend",function(){return o.resume()}),i.style.add(t),l&&n.action.insertBlock(e),s.image(e)})}},a={prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll("[image]")).map(function(e){return Array.from(e.querySelectorAll(".for-edit, .uploadcare--widget")).map(function(e){return e.parentNode.removeChild(e)})}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,r,n,o;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),r=document.querySelector("#editor-style"),n=document.querySelector("#page-basic"),this.prune(t),o=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+r.innerHTML+'\n<style type="text/css"> '+n.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>"}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},disabled:!1,draggable:".block-item",onAdd:function(e){return i.prepare(e.item)},onEnd:function(e){return n.action.moveBlock(e.oldIndex,e.newIndex)}}),e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=a["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return this.code=a["export"]({bodyOnly:!0}),document.querySelector("#editor-preview").innerHTML=this.code,this.modal.ctrl.toggle(!0)}},document.body.addEventListener("keyup",function(e){return n.action.editBlock(e.target)}),n.init(document.querySelector("#editor .inner"),i)}));
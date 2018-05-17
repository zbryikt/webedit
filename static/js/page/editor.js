function import$(e,t){var n={}.hasOwnProperty;for(var r in t)n.call(t,r)&&(e[r]=t[r]);return e}var x$;x$=angular.module("webedit"),x$.service("nodeProxy",["$rootScope"].concat(function(){var e;return e=function(t,n){var r,i,o;return null==n&&(n=!0),r=t,i="_node-proxy-"+Math.random().toString(16).substring(2),t.setAttribute(i,!0),n&&e.editProxy.editBlock(t),o=function(){return document.querySelector("["+i+"]")||function(){throw new Error("node "+i+" not found")}()},o.destroy=function(){var t;return t=o(),t.removeAttribute(i),n&&e.editProxy.editBlock(t),t},o},e.init=function(t){return e.editProxy=t},e})),x$.service("blockLoader",["$rootScope","$http"].concat(function($scope,$http){var ret;return ret={cache:{},get:function(name){var this$=this;return new Promise(function(res,rej){var that;return(that=this$.cache[name])?res(that):$http({url:"/blocks/"+name+"/index.json"}).then(function(ret){var that,exports;return this$.cache[name]=ret.data,(that=this$.cache[name].js)&&(exports=eval("var module = {exports: {}};\n(function(module) { "+that+" })(module);\nmodule.exports;"),this$.cache[name].exports=exports,(exports.custom||(exports.custom={})).attrs&&puredom.useAttr(exports.custom.attrs)),res(this$.cache[name])})})}}})),x$.service("webSettings",["$rootScope"].concat(function(){var e;return e={unit:{},style:{},info:{},list:["fontFamily","backgroundPositionX","backgroundPositionY","backgroundRepeat","backgroundAttachment","backgroundSize","fontWeight","boxShadow","animationName","backgroundImage","backgroundColor","color","fontSize","marginTop","marginBottom","marginLeft","marginRight","paddingTop","paddingBottom","paddingLeft","paddingRight","borderTopWidth","borderLeftWidth","borderRightWidth","borderBottomWidth","borderTopColor","borderLeftColor","borderRightColor","borderBottomColor"],option:{fontFamily:[{name:"Default",value:"default"},{name:"Arial",value:"Arial"},{name:"Helvetica Neue",value:"Helvetica Neue"},{name:"Tahoma",value:"Tahoma"},{name:"Raleway",value:"Raleway"},{name:"微軟正黑體",value:"Microsoft JhengHei"},{name:"黑體(繁)",value:"Heiti TC"},{name:"黑體(簡)",value:"Heiti SC"},{name:"蘋方體(繁)",value:"PingFangTC-Regular"},{name:"細明體",value:"MingLiU"},{name:"標楷體",value:"DFKai-sb"}],backgroundPositionX:["default","left","center","right"],backgroundPositionY:["default","top","center","bottom"],backgroundRepeat:["default","repeat","repeat-x","repeat-y","no-repeat"],backgroundAttachment:["default","scroll","fixed","local"],backgroundSize:["default","cover","contain","auto"],fontWeight:["default","200","300","400","500","600","700","800","900"],boxShadow:["default","none","light","modest","heavy"],animationName:["inherit","none","bounce","slide","fade"]},setBlock:function(e){var t=this;return this.style={},(e.getAttribute("style")||"").split(";").map(function(e){var n,r;return e=e.split(":").map(function(e){return e.trim()}),e[1]&&e[0]?(n=e[0].split("-").map(function(e,t){return t?e[0].toUpperCase()+e.substring(1):e}).join(""),r=e[1],t.style[n]=r):void 0}),import$(this.info,{id:"#"+e.getAttribute("id")}),this.block=e}},["marginLeft","marginTop","marginRight","marginBottom","paddingLeft","paddingTop","paddingRight","paddingBottom","borderLeftWidth","borderTopWidth","borderRightWidth","borderBottomWidth","fontSize"].map(function(t){return e.unit[t]="px"}),["animationDuration","animationDelay"].map(function(t){return e.unit[t]="s"}),e})),x$.controller("webSettings",["$scope","$timeout","webSettings","collaborate","editProxy"].concat(function(e,t,n,r,i){return e.settings=n,e.reset=function(){return e.settings.style={}},e.setBackgroundImage=function(){var t,n;return t="1024x1024",n=uploadcare.openDialog(null,null,{imageShrink:t,crop:"free"}),n.done(function(t){var n,r;return n=((r=t.files)?r():[t])[0],e.settings.style.backgroundImage="url(/assets/img/loader/msg.svg)",n.done(function(t){return e.settings.style.backgroundImage="url("+t.cdnUrl+")"})})},e.actionHandle=null,e.$watch("settings.style",function(){var r,o,a,l,u;if(n.block){for(r=0,a=(o=e.settings.list).length;a>r;++r)l=o[r],u=e.settings.style[l],n.block.style[l]=u&&"default"!==u?u+(n.unit[l]||""):e.settings.style[l]="";return e.actionHandle&&(t.cancel(e.actionHandle),e.actionHandle=null),e.actionHandle=t(function(){return i.editStyle(n.block,n.block===document.querySelector("#editor > .inner"))},200)}},!0)})),x$.service("editAux",["$rootScope"].concat(function(){var e;return e={cleanAttrs:function(e,t){var n,r,i,o,a,l=[];if(null==t&&(t=[]),e.removeAttribute){for(n=0,r=t.length;r>n;++n)i=t[n],e.removeAttribute(i);for(n=0,o=e.childNodes.length;o>n;++n)a=n,l.push(this.cleanAttrs(e.childNodes[a],t));return l}},traceNonText:function(e){for(;e&&3===e.nodeType;)e=e.parentNode;return e&&3===e.nodeType?null:e},traceBaseBlock:function(e){for(;e&&(3===e.nodeType||e.getAttribute&&!e.getAttribute("base-block"));)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("base-block")?e:null},eid:function(e){var t,n;for(t=0;100>t&&(n=Math.random().toString(16).substring(2),document.querySelector("[eid='"+n+"']"));)t++;return 100>t?e.setAttribute("eid",n):void 0}}})),x$.service("editProxy",["$rootScope","$timeout","collaborate","editAux"].concat(function(e,t,n,r){var i;return i={change:function(e){var n=this;return null==e&&(e=[]),e=e.filter(function(e){return e}),this.change.handle&&t.cancel(this.change.handle),this.change.handle=t(function(){return n.change.handle=null,pageObject.fire("block.change",{blocks:e}),e.map(function(e){var t;return t=r.traceBaseBlock(e),t&&(t.obj||(t.obj={})).change?t.obj.change([e],!0):void 0})},100)},editStyle:function(e,t){return null==t&&(t=!1),this.change([e]),n.action.editStyle(e,t)},editBlockAsync:function(e){var r=this;return this.editBlockAsync.handle&&t.cancel(this.editBlockAsync.handle),this.editBlockAsync.handle=t(function(){return r.editBlockAsync.handle=null,r.change([e]),n.action.editBlock(e)},10)},editBlock:function(e){return this.change([e]),n.action.editBlock(e)},insertBlock:function(e){return this.change([e]),n.action.insertBlock(e)},deleteBlock:function(e){var t;return this.change([e]),t=r.traceBaseBlock(e),(t.obj||(t.obj={})).destroy&&t.obj.destroy(),n.action.deleteBlock(e)},moveBlock:function(e,t){return this.change([e,t]),n.action.moveBlock(e,t)},setThumbnail:function(e){return n.action.setThumbnail(e)}}})),x$.controller("editor",["$scope","$interval","$timeout","ldBase","blockLoader","collaborate","global","webSettings","editProxy","nodeProxy","ldNotify","editAux"].concat(function(e,t,n,r,i,o,a,l,u,c,s,d){var g,f,m,h,p,b,v,y,A,k,x,w,S;return e.loading=!0,c.init(u),g={list:[],pause:function(){return this.list.map(function(e){return e.destroy()})},resume:function(){return this.list.map(function(e){return e.setup()})},prepare:function(e){var t;return t=new MediumEditor(e,{toolbar:{buttons:["bold","italic","underline","indent"].map(function(e){return{name:e,contentDefault:"<i class='fa fa-"+e+"'></i>"}}).concat(["h1","h2","h3","h4"],[{name:"orderedlist",contentDefault:"<i class='fa fa-list-ol'></i>"},{name:"unorderedlist",contentDefault:"<i class='fa fa-list-ul'></i>"},{name:"foreColor",contentDefault:"<i class='fa fa-adjust'></i>"},{name:"backColor",contentDefault:"<i class='fa fa-paint-brush'></i>"},{name:"borderColor",contentDefault:"<i class='fa fa-square-o'></i>"},{name:"align-left",contentDefault:"1"},{name:"align-center",contentDefault:"2"},{name:"align-right",contentDefault:"3"},{name:"font-size",contentDefault:"4"},{name:"font-family",contentDefault:"5"},{name:"anchor",contentDefault:"<i class='fa fa-link'></i>"},{name:"removeFormat",contentDefault:"<i class='fa fa-eraser'></i>"}])},extensions:{alignLeft:mediumEditorAlignExtention.left,alignCenter:mediumEditorAlignExtention.center,alignRight:mediumEditorAlignExtention.right,backColor:new mediumEditorStyleExtension.backColor,foreColor:new mediumEditorStyleExtension.foreColor,borderColor:new mediumEditorStyleExtension.borderColor,fontSize:new mediumEditorFontsizeExtension,fontFamily:new mediumEditorFontfamilyExtension},spellcheck:!1}),this.list.push(t),t.subscribe("editableInput",function(e,t){var n,r,i,o;return n=document.getSelection(),n.rangeCount&&(r=n.getRangeAt(0),i=d.traceNonText(r.startContainer),i&&(o=i.getAttribute("eid"),document.querySelectorAll("[eid='"+o+"']").length>1&&d.eid(i))),u.editBlock(t)}),t}},f={init:function(){return this.handle=document.querySelector("#editor-image-handle")},aspect:{lock:!1,toggle:function(e){return this.lock=null!=e?e:!this.lock}},click:function(e){var t,n,r,i,o;return e&&(this.target=e),this.target?(e=this.target,t=c(e),n=this.target.getBoundingClientRect(),r=Math.round(2*(n.width>n.height?n.width:n.height)),r>1024&&(r=1024),i=r+"x"+r,o=uploadcare.openDialog(null,null,{multiple:!!e.getAttribute("repeat-item"),imageShrink:i,crop:"free"}),o.fail(function(){return t.destroy()}),o.done(function(e){return Promise.resolve().then(function(){var n,r,i;return n=(r=e.files)?r():[e],1===n.length?(t().style.backgroundImage="url(/assets/img/loader/msg.svg)",n[0].done(function(e){return t().style.backgroundImage="url("+e.cdnUrl+")",u.editBlock(t.destroy()),u.setThumbnail(e.cdnUrl+"/-/preview/1200x630/")})):(i=t().parentNode.querySelectorAll("[image]"),Array.from(i).map(function(e){return e.style.backgroundImage="url(/assets/img/loader/msg.svg)"}),Promise.all(n.map(function(e){return e.promise()})).then(function(e){var n,r,i,o,a,l;for(n=[t().parentNode.querySelectorAll("[image]"),0],r=n[0],i=n[1],o=0,a=r.length;a>o;++o)l=o,r[l].style.backgroundImage="url("+e[i].cdnUrl+")",i=(i+1)%e.length;return u.editBlock(t.destroy()),u.setThumbnail(e[0].cdnUrl+"/-/preview/1200x630/")}))})["catch"](function(){return alert("the image node you're editing is removed by others.")})})):void 0},resizable:function(e){var t=this;return null==e&&(e=[]),Array.isArray(e)||(e=[e].filter(function(e){return e})),e.map(function(e){return"bk"===e.getAttribute("image")||e.resizabled||"false"===e.getAttribute("resizable")?void 0:(e.resizabled=!0,e.addEventListener("mousedown",function(t){var n,r,i,o;if(e.getAttribute("image"))return n=[t.offsetX,t.offsetY],r=n[0],i=n[1],o=this.getBoundingClientRect(),n=[r/o.width,i/o.height],r=n[0],i=n[1],.1>r||r>.9||.1>i||i>.9?(t.preventDefault(),t.stopPropagation()):void 0}),interact(e).resizable({edges:{left:!0,right:!0,bottom:!0,top:!0}}).on("resizemove",function(r){var i,o,a,l;return i=r.target,o=i.getBoundingClientRect().width+r.deltaRect.width,a=i.getBoundingClientRect().height+r.deltaRect.height,l=+i.getAttribute("image-ratio"),(isNaN(l)||!l)&&(l=.01*Math.round(100*o/(a||1)),i.setAttribute("image-ratio",l)),t.aspect.lock&&(r.deltaRect.width?a=o/l:r.deltaRect.width&&(o=a*l)),i.style.width=o+"px",i.getAttribute("image")&&(i.style.height=a+"px"),i.style.flex="0 0 "+o+"px",i.style.transition="none",e.handle&&n.cancel(e.handle),e.handle=n(function(){return i.style.flex="1 1 auto",e.handle=null,i.style.transition=".5s all cubic-bezier(.3,.1,.3,.9)"},500),u.editBlockAsync(i)}))})}},f.init(),m={elem:null,coord:{x:0,y:0},init:function(){var e=this;return this.elem=document.querySelector("#editor-text-handle"),this.elem.addEventListener("mouseover",function(){return e.timeout?(n.cancel(e.timeout),e.timeout=null):void 0}),this.elem.addEventListener("keypress",function(t){return 13===t.keyCode&&e.save(),e.timeout?(n.cancel(e.timeout),e.timeout=null):void 0}),this.elem.addEventListener("click",function(t){return t.target.classList.contains("medium-editor-toolbar-save")?e.save():t.target.classList.contains("medium-editor-toolbar-close")?e.toggle(null):void 0})},save:function(){var e,t,n=this;return e=this.elem.querySelector("input").value,t=o.action.info(this.target),i.get(t[3]).then(function(){var t;return t=d.traceBaseBlock(n.target),(t.obj||(t.obj={})).transformText&&(e=t.obj.transformText(e)),e&&n.target.setAttribute(n.target.getAttribute("edit-text"),e),(t.obj||(t.obj={})).text&&(e=t.obj.text(e)),u.editBlock(n.target),n.toggle(null)})},toggle:function(e){var t=this;return null==e&&(e={}),this.timeout&&(n.cancel(this.timeout),this.timeout=null),e.delay?this.timeout=n(function(){return t._toggle(e)},e.delay):this._toggle(e)},_toggle:function(e){var t,n,r,i,o,a,l,u,c;return t=e.node,n=e.inside,r=e.text,i=e.placeholder,this.elem||this.init(),i&&this.elem.querySelector("input").setAttribute("placeholder",i),o="ldt-slide-bottom-in",t!==this.target&&this.elem.classList.remove(o),t?(a=[t,t.getBoundingClientRect()],this.target=a[0],l=a[1],u={x:l.x+.5*l.width-150+"px",y:l.y-39+document.scrollingElement.scrollTop+"px"},c=this.elem.style,c.left=u.x,c.top=u.y,c.display="block",this.elem.classList.add("ld",o),import$(this.coord,u),this.elem.querySelector("input").value=r):this.elem.style.display="none"}},m.init(),h={elem:null,init:function(){var e=this;return this.elem=document.querySelector("#editor-node-handle"),this.elem.addEventListener("click",function(t){var n,r,i,o,a;if(e.target)return n=e.target,r=n.parentNode,i=t.target.getAttribute("class"),/fa-clone/.exec(i)?(o=n.cloneNode(!0),o.setAttribute("edit-transition","jump-in"),d.cleanAttrs(o,["eid"]),p.initChild(o),(o.getAttribute("image")||o.getAttribute("resizable"))&&f.resizable(o),r.insertBefore(o,n.nextSibling),setTimeout(function(){return o.setAttribute("edit-transition","jump-in"),u.editBlock(r)},800)):/fa-trash-o/.exec(i)?(n.setAttribute("edit-transition","jump-out"),setTimeout(function(){return r.removeChild(n),u.editBlock(r),e.toggle(null)},400)):/fa-align/.exec(i)?(a=n.style,a.marginLeft=/right|center/.exec(i)?"auto":0,a.marginRight=/left|center/.exec(i)?"auto":0,u.editBlock(n)):/fa-link/.exec(i)||(/fa-camera/.exec(i)?f.click(e.target):/fa-lock/.exec(i)?(t.target.classList.add("fa-unlock-alt"),t.target.classList.remove("fa-lock"),f.aspect.toggle(!1)):/fa-unlock-alt/.exec(i)&&(t.target.classList.add("fa-lock"),t.target.classList.remove("fa-unlock-alt"),f.aspect.toggle(!0))),e.elem.style.display="none",u.editBlock(r)})},coord:{x:0,y:0},toggle:function(e){var t,n,r,i,o,a,l;return null==e&&(e={}),this.elem||this.init(),t="ldt-bounce-in",n=e.node,n!==this.target&&this.elem.classList.remove(t),n?(this.elem.classList[e.noRepeat?"add":"remove"]("no-repeat"),this.elem.classList[e.image?"add":"remove"]("image"),this.elem.classList[e.noDelete&&e.noRepeat?"add":"remove"]("no-delete"),this.elem.classList[e.aspectRatio?"add":"remove"]("aspect-ratio"),this.elem.classList[e.alignment?"add":"remove"]("alignment"),r=[n,n.getBoundingClientRect(),this.elem.getBoundingClientRect()],this.target=r[0],i=r[1],o=r[2],a={x:i.x+i.width+3+(e.inside?-5:0)+"px",y:i.y+.5*i.height-.5*o.height+document.scrollingElement.scrollTop+"px"},l=this.elem.style,l.left=a.x,l.top=a.y,l.display="block",this.elem.classList.add("ld",t),import$(this.coord,a)):this.elem.style.display="none"}},h.init(),p={initChild:function(e){return Array.from(e.querySelectorAll("[repeat-host]")).map(function(t){var n,r;return n=(r=t.getAttribute("repeat-class"))?"."+r:t.childNodes.length?(r=t.childNodes[0]&&(t.childNodes[0].getAttribute("class")||"").split(" ")[0].trim())?"."+r:t.nodeName:"div",Sortable.create(t,{group:{name:"sortable-"+Math.random().toString(16).substring(2)},disabled:!1,draggable:n,dragoverBubble:!0,onEnd:function(){return u.editBlock(e)}})})},init:function(e,t){var n,r=this;return null==t&&(t=!1),this.initChild(e),n=null,t?void 0:(e.addEventListener("selectstart",function(e){return e.allowSelect=!0}),e.addEventListener("keypress",function(e){var t,n,r;if(e.target&&(t=window.getSelection(),t&&!(t.rangeCount=0)))return n=t.getRangeAt(0),r=n.startContainer,3===r.nodeType&&(r=r.parentNode),r.getAttribute("eid")?void 0:(d.eid(r),u.editBlock(r))}),e.addEventListener("mousedown",function(t){var n,i;return Array.from(e.parentNode.querySelectorAll("[contenteditable]")).map(function(e){return"false"!==e.getAttribute("editable")?e.removeAttribute("contenteditable"):void 0}),n=t.target,i=r.search(n,document.createRange(),{x:t.clientX,y:t.clientY}),!n.innerHTML.replace(/(<br>\s*)*/,"").trim()||i&&i.length&&i[0]&&i[1]<i[0].length&&i[1]>=0&&i[2]<800?"true"===n.getAttribute("editable")?n.setAttribute("contenteditable",!0):e.setAttribute("contenteditable",!0):void 0}),e.addEventListener("mousemove",function(e){var t,n,i,o;if(!e.buttons){for(t=e.target,n=r.search(e.target,document.createRange(),{x:e.clientX,y:e.clientY});t&&t.getAttribute&&!t.getAttribute("repeat-item");)t=t.parentNode;t&&t.getAttribute&&(i=window.getSelection(),0===i.extentOffset&&(!n||null==n[2]||n[2]>800)?e.target.setAttribute("contenteditable",!1):e.target.setAttribute("contenteditable",!0))}for(t=e.target;t&&t.getAttribute&&!t.getAttribute("image")&&!t.getAttribute("repeat-item");)t=t.parentNode;return t&&t.getAttribute?(o=t.getAttribute("image"),h.toggle({node:t,inside:!0,noRepeat:!t.getAttribute("repeat-item"),image:!!o,noDelete:"false"===t.getAttribute("editable"),aspectRatio:!(!o||"bk"===o),alignment:!(!o||"bk"===o||t.getAttribute("repeat-item"))})):void 0}),e.addEventListener("mouseover",function(e){var t,n,r;for(t=e.target;t&&t.getAttribute&&!t.getAttribute("edit-text");)t=t.parentNode;return t&&t.getAttribute?(n=t.getAttribute(t.getAttribute("edit-text")),r=t.getAttribute("edit-text-placeholder")||"enter some text...",m.toggle({node:t,inside:!0,text:n,placeholder:r})):m.toggle({delay:500})}),e.addEventListener("click",function(t){var i,o,a,l,u,c,s,d,g,f;if(i=null,o=!1,a=window.getSelection(),a.rangeCount>0){if(l=window.getSelection().getRangeAt(0),l.startOffset<l.endOffset||!l.collapsed)return;i=[l.startContainer,l.startOffset]}for(u=t.target;u&&u.parentNode&&u.getAttribute&&!u.getAttribute("repeat-item");)u=u.parentNode;if(h.toggle(u&&u.getAttribute&&u.getAttribute("repeat-item")?{node:u}:null),t.target&&t.target.getAttribute&&t.target.getAttribute("repeat-item"))return u=t.target,u.setAttribute("contenteditable",!0),u.focus(),a=window.getSelection(),a.rangeCount?l=a.getRangeAt(0):(l=document.createRange(),a.addRange(l)),l.collapse(!1),void l.selectNodeContents(u);for(u=t.target,c=u.getAttribute("editable"),"false"===c&&(o=!0),u.removeAttribute("contenteditable");u&&"true"!==u.getAttribute("editable");){if(u.getAttribute("image")&&"bk"!==u.getAttribute("image")||"false"===u.getAttribute("editable")){o=!0;break}if(u.parentNode&&"true"===u.parentNode.getAttribute("repeat-host"))break;if(!u.parentNode)return;if(u===e)break;u=u.parentNode}return u.setAttribute("contenteditable",!o),!o&&(l=document.createRange(),s=(d=i)?d:r.search(u,l,{x:t.clientX,y:t.clientY}),s&&0!==s.length)?(g=(d=document.caretPositionFromPoint)?d(t.clientX,t.clientY):document.caretRangeFromPoint(t.clientX,t.clientY),s[0]=g.startContainer,s[1]=g.startOffset,n&&t.shiftKey&&t.target.getAttribute("repeat-item")?(f=[[n.startContainer,n.startOffset],[s[0],s[1]]],f[0][1]>f[1][1]&&(f=[f[1],f[0]]),l.setStart(f[0][0],f[0][1]),l.setEnd(f[1][0],f[1][1])):(l.setStart(s[0],s[1]),l.collapse(!0)),a=window.getSelection(),a.removeAllRanges(),a.addRange(l),n=l):void 0}))},search:function(e,t,n,r){var i,o,a,l,u,c,s,d,g,f,m,h,p,b,v;for(null==r&&(r=!0),i=[],o=0,a=e.childNodes.length;a>o;++o)if(l=o,u=e.childNodes[l],"#text"!==u.nodeName)u.getBoundingClientRect&&(p=u.getBoundingClientRect(),p.x<=n.x&&p.y<=n.y&&(i=i.concat(this.search(u,t,n,!1))));else{for(c=[-1,-1,-1],s=c[0],d=c[1],g=c[2],f=0,m=u.length+1;m>f;++f)if(h=f,t.setStart(u,h),p=t.getBoundingClientRect(),b=p.height,p.x<=n.x&&p.y<=n.y)s=h,d=(n.x-p.x-.5*b)/b*16,g=(n.y-p.y-.5*b)/b*16;else if(p.x>n.x&&p.y>n.y)break;s>=0&&i.push([u,s,d,g])}if(!r||!i.length)return i;for(i=i.map(function(e){return[e[0],e[1],Math.pow(e[2],2)+Math.pow(e[3],2)]}),c=[i[0][2],0],v=c[0],s=c[1],o=1,a=i.length;a>o;++o)l=o,i[l][2]<v&&(c=[i[l][2],l],v=c[0],s=c[1]);return i[s]}},b={share:{modal:{},link:window.location.origin+(window.location.pathname+"/view").replace(/\/\//g,"/"),"public":!1,setPublic:function(e){return this["public"]!==e?(this["public"]=e,o.action.setPublic(this["public"])):void 0}},prepare:function(t){var n;return n=document.querySelector("#editor > .inner"),n.setAttribute("style",t.style||""),n.style.width=e.config.size.value+"px",this.share.setPublic((t.attr||{}).isPublic)}},v={defaultInterface:{init:function(){},update:function(){},change:function(){},destroy:function(){}},library:{root:null,loaded:{},scripts:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.loaded[e]?void 0:i.get(e)}).then(function(n){var r,i,o,a,l;if(null==n&&(n={}),t.root||(t.root=document.querySelector("#editor-library")),r=(n.exports||(n.exports={})).library){i=document.createElement("div");for(o in r)a=r[o],t.scripts[a]||(l=t.scripts[a]=document.createElement("script"),l.setAttribute("type","text/javascript"),l.setAttribute("src",a),t.root.appendChild(l));return t.loaded[e]=!0}})}},style:{root:null,nodes:{},add:function(e){var t=this;return Promise.resolve().then(function(){return t.nodes[e]?void 0:i.get(e)}).then(function(e){var n;return n=document.createElement("style"),n.setAttribute("type","text/css"),n.innerHTML=e.css,t.root||(t.root=document.querySelector("#editor-style")),t.root.appendChild(n)})},remove:function(e){return this.root&&this.nodes[e]?this.root.removeChild(this.nodes[e]):void 0},update:function(e,t){return e.style=t,u.change([e])}},remove:function(e){return u.deleteBlock(e),e.parentNode.removeChild(e),y.handles.hide(e)},init:function(){var e;u.change();try{if("undefined"!=typeof _jf&&null!==_jf&&_jf.flush)return _jf.flush()}catch(t){return e=t,console.log(e)}},clone:function(e){var t;if(e.childNodes[0])return t=e.childNodes[0].innerHTML,this.prepare(t,{highlight:!0,idx:Array.from(e.parentNode.childNodes).indexOf(e)+1,name:e.getAttribute("base-block"),source:!0,style:e.getAttribute("style")})},prepareHandle:{},prepareAsync:function(e,t){var r=this;return null==t&&(t={idx:0}),new Promise(function(i,o){var a;return a=t.idx||0,r.prepareHandle[a]&&n.cancel(r.prepareHandle[a]),r.prepareHandle[a]=n(function(){return r.prepareHandle[a]=0,r.prepare(e,t).then(function(e){return i(e)})["catch"](function(e){return o(e)})},10)})},indexing:function(){return btools.qsAll("#editor > .inner > [base-block]").map(function(e,t){return e.idx=t})},prepare:function(t,n){var r,a,l,c,s,m,h,b,A,k,x,w,S,C=this;if(null==n&&(n={source:!0}),y.cursor.save(),r=n.name,a=n.idx,l=n.redo,c=n.style,s=n.source,m=null,"string"==typeof t&&(m=t,t=document.createElement("div"),h=document.querySelector("#editor > .inner"),h.insertBefore(t,h.childNodes[a]),y.placeholder.remove()),n.content&&(b=Array.from(t.childNodes).filter(function(e){return/inner/.exec(e.getAttribute("class"))})[0],b&&(b.innerHTML=puredom.sanitize(n.content))),r=r||t.getAttribute("base-block"),Array.from(t.attributes).map(function(e){var n;return"base-block"!==(n=e.name)&&"style"!==n?t.removeAttribute(e.name):void 0}),t.setAttribute("class","initializing"),A=n.eid)k=A;else if(A=t.getAttribute("eid"))k=A;else for(x=0;100>x&&(w=x,k=Math.random().toString(16).substring(2),document.querySelector("[eid='"+k+"']"));++x);return t.setAttribute("eid",k),t.setAttribute("id","block-id-"+k),S=i.get(r).then(function(i){var a,h,b,A;if(t.setAttribute("class","block-item block-"+r),t.setAttribute("base-block",r),!l){for(a=document.createElement("div"),a.setAttribute("class","inner"),a.innerHTML=m?puredom.sanitize(m):i.html,m&&s&&d.cleanAttrs(a,["eid"]),c&&t.setAttribute("style",c);t.lastChild;)t.removeChild(t.lastChild);t.appendChild(a),h=document.createElement("div"),h.setAttribute("class","handle ld ldt-float-left-in"),h.innerHTML=["arrows","clone","cog","trash-o"].map(function(e){return"<i class='fa fa-"+e+"'></i>"}).join(""),h.addEventListener("click",function(n){var r;return r=n.target.classList,r.contains("fa-trash-o")?C.remove(t):r.contains("fa-clone")?C.clone(t):r.contains("fa-cog")?e.blockConfig.toggle(t):void 0}),t.appendChild(h),t.addEventListener("dragstart",function(){return g.pause()}),t.addEventListener("dragend",function(){return g.resume()}),t.addEventListener("drop",function(){return g.resume()}),v.style.add(r),v.library.add(r)}return t.obj||(t.obj=new Object,t.obj.__proto__=import$(import$(import$({},t.obj.__proto__),v.defaultInterface),i.exports||(i.exports={})),b=t.obj,b.collab=o,b.block=t,b.page=pageObject,b.viewMode=!1,t.obj.init()),!l&&s&&u.insertBlock(t),!l&&n.highlight&&t.classList.add("ld","ldt-jump-in","fast"),a=t.querySelector(".block-item > .inner"),f.resizable(Array.from(a.querySelectorAll("*[image]"))),f.resizable(Array.from(a.querySelectorAll("*[resizable]"))),t.obj.editable!==!1&&(A=g.prepare(a)),p.init(a,l),t.obj.change(null,n.source),y.cursor.load(),t})}},e.css={init:function(){var t=this;return this.node=document.querySelector("#editor-css"),this.style=document.querySelector("#editor-css style"),e.$watch("css.inline.value",function(e,n){return e!==n?(o.action.css.editInline(e),t.style.innerText=e):void 0}),e.$watch("css.theme.value.name",function(t,n){return t!==n?o.action.css.editTheme(e.css.theme.value):void 0}),this.theme.value=this.theme.list[0]},prepare:function(t){var n=this;return null==t&&(t={}),e.force$apply(function(){var e;return n.inline.value=t.inline,n.theme.value=t.theme,(e=n.links).list=e.list.concat(t.links)})},theme:{value:{},list:{name:"Default"},update:function(t){var n=this;return e.force$apply(function(){return n.value=t})}},inline:{value:"",update:function(t){var n=this;return e.force$apply(function(){return n.value=t})}},links:{value:null,list:[],add:function(t,n){var r=this;return null==n&&(n=!1),e.force$apply(function(){return t&&(r.list.push(t),n)?(o.action.css.addLink(t),r.value=null):void 0})},remove:function(t,n){var r=this;return null==n&&(n=!1),e.force$apply(function(){var e;if(t&&(e=r.list.indexOf(t),~e&&(r.list.splice(e,1),n)))return o.action.css.removeLink(t),r.value=null})}}},e.css.init(),y={user:e.user,css:e.css,handles:{hide:function(){return h.toggle(null),m.toggle(null)}},reload:function(){return window.location.reload()},online:{defaultCountdown:10,state:!0,code:null,retry:function(){return y.loading.toggle(!0),this.state=!0,n(function(){return o.init(document.querySelector("#editor .inner"),y)},100),!this.retry.countdown||this.retry.countdown<0?this.retry.countdown=this.defaultCountdown:this.retry.countdown--},toggle:function(t,n){var r=this;return null==n&&(n={}),e.force$apply(function(){return!n&&r.retry.countdown?r.retry():(r.code=n.code,y.online.state=t,y.loading.toggle(!0))})}},loading:{toggle:function(t){return e.force$apply(function(){return e.loading=null!=t?t:!e.loading})}},server:(A={},A.domain=a.domain,A.scheme=a.scheme,A),collaborator:{list:{},count:0,init:function(){var e=this;return n(function(){var t,n,r,i=[];e.count=0;for(t in n=e.list||{})r=n[t],e.list[t].cbox=y.cursor.toBox(e.list[t].cursor||{}),i.push(e.count++);return i},0)},handle:function(e){var t,n,r,i;if("init"===e.action)return this.list=e.data,this.init();if("join"===(t=e.action)||"update"===t){if(this.list[e.key]||this.count++,this.list[e.key]=import$(this.list[e.key]||{},e.data),n=this.list[e.key].cursor)return this.list[e.key].cbox=y.cursor.toBox(n)}else if("exit"===e.action&&this.list[e.key])return this.count--,i=(t=this.list)[r=e.key],delete t[r],i}},cursor:{state:null,get:function(){var e,t;return e=window.getSelection(),e.rangeCount?(t=e.getRangeAt(0),{startSelector:btools.getEidSelector(t.startContainer),startOffset:t.startOffset,endSelector:btools.getEidSelector(t.endContainer),endOffset:t.endOffset}):null},save:function(){return this.state=this.get()},toBox:function(e){var t,n,r,i;return t=this.toRange(e),n=document.querySelector("#editor > .inner").getBoundingClientRect(),t&&n?(r=t.getBoundingClientRect(),i=[r.x-n.x,r.y-n.y],r.x=i[0],r.y=i[1],i={blur:r.x<0||r.x>n.width},i.x=r.x,i.y=r.y,i.width=r.width,i.height=r.height,i):void 0},toRange:function(e){var t,n,r,i;if(t=document.createRange(),n=btools.fromEidSelector(e.startSelector),r=btools.fromEidSelector(e.endSelector),!n)return null;try{t.setStart(n,e.startOffset),r&&t.setEnd(r,e.endOffset)}catch(o){return i=o,null}return t},load:function(){var e,t;if(this.state&&(e=window.getSelection(),t=this.toRange(this.state)))return e.removeAllRanges(),e.addRange(t),this.state=null}},page:b,block:v,placeholder:{remove:function(){var e;return e=document.querySelector("#editor > .inner > .placeholder"),e?e.parentNode.removeChild(e):void 0}},prune:function(e){return Array.from(e.querySelectorAll("[editable]")).map(function(e){return e.removeAttribute("editable")}),Array.from(e.querySelectorAll("[contenteditable]")).map(function(e){return e.removeAttribute("contenteditable")}),Array.from(e.querySelectorAll(".block-item > .handle")).map(function(e){return e.parentNode.removeChild(e)})},"export":function(e){var t,n,r,i;return null==e&&(e={}),t=document.querySelector("#editor > .inner").cloneNode(!0),n=document.querySelector("#editor-style"),r=document.querySelector("#page-basic"),this.prune(t),i=e.bodyOnly?t.innerHTML:'<html><head>\n<link rel="stylesheet" type="text/css"\nhref="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>\n<script type="text/javascript"\nsrc="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>\n'+n.innerHTML+'\n<style type="text/css"> '+r.innerHTML+" </style>\n</head><body>\n"+t.innerHTML+"\n</body></html>",puredom.sanitize(i)}},Sortable.create(document.querySelector("#blocks-picker"),{group:{name:"block",put:!1,pull:"clone"},disabled:!1,sort:!1,draggable:".block-thumb"}),Sortable.create(document.querySelector("#editor .inner"),{group:{name:"block",pull:"clone"},filter:".unsortable",preventOnFilter:!1,disabled:!1,draggable:".block-item",dragoverBubble:!0,scrollSensitivity:60,scrollSpeed:30,onAdd:function(e){return v.prepare(e.item)},onStart:function(e){var t;return t=btools.qsAll("iframe",e.item),e.item._iframes=t,t.map(function(e){return e._original={parentNode:e.parentNode,nextSibling:e.nextSibling},e.parentNode.removeChild(e)})},onEnd:function(e){var t,n,r;return t=[e.oldIndex,e.newIndex],n=t[0],r=t[1],e.item._iframes&&e.item._iframes.map(function(e){return e._original.parentNode.insertBefore(e,e._original.nextSibling)}),e.clone.deleted?(this.el.removeChild(e.item),s.warning("The block you drag is deleted by others.")):(null!=e.clone.idx&&e.clone.idx!==e.oldIndex&&(n=e.clone.idx),n!==r?u.moveBlock(n,r):void 0)}}),k=document.querySelector("#editor > .inner"),k.addEventListener("dragover",function(){return y.placeholder.remove()}),e.collaborator=y.collaborator,e["export"]={modal:{config:{},ctrl:{}},run:function(){return this.code=y["export"](),this.modal.ctrl.toggle(!0)}},e.preview={modal:{},run:function(){return document.querySelector("#editor-preview iframe").setAttribute("src",b.share.link+"?preview=true"),this.modal.ctrl.toggle(!0)}},e.config={modal:{},size:{value:1024,name:"1024px",resizeAsync:r.async("resize",function(){var t=this;return e.force$apply(function(){var e,n,r,i,o;for(e=window.innerWidth-360,n=0,i=(r=[1440,1200,1024,800,640,480]).length;i>n&&(o=r[n],!(e>o));++n);return t.set(o+"px")})}),relayout:function(){var e,t,n;return e=document.querySelector("#blocks-picker"),t=document.querySelector("#collab-info"),n=document.querySelector(".editor-preview-modal .cover-modal-inner"),e.style.right=this.value+Math.round((window.innerWidth-this.value)/2)+"px",t.style.left=this.value+Math.round((window.innerWidth-this.value)/2)+"px",n.style.width=this.value+"px",setTimeout(function(){return Array.from(document.querySelectorAll("#editor > .inner *[base-block]")).map(function(e){return(e.obj||(e.obj={})).resize?(e.obj||(e.obj={})).resize():void 0})},1e3)},set:function(e){return/px/.exec(e)?this.value=parseInt(e.replace(/px/,"")):/Full/.exec(e)?this.value=window.innerWidth:/%/.exec(e)&&(this.value=window.innerWidth*Math.round(e.replace(/%/,""))*.01),this.name=e,this.relayout()}}},e.insert={node:function(e){return new Promise(function(t,n){var r,i,o;if(y.cursor.load(),r=window.getSelection(),!r||!r.rangeCount)return n();for(i=r.getRangeAt(0),o=i.startContainer;!(!o||!o.getAttribute&&3!==o.nodeType||o.getAttribute&&o.getAttribute("base-block"));)o=o.parentNode;
return 3===o.nodeType||o&&o.getAttribute&&o.getAttribute("base-block")?(i.collapse(!0),i.insertNode(e),i.setStartAfter(e),r.removeAllRanges(),r.addRange(i),t()):void 0})},image:function(){var e,t,n=this;return e="1024x1024",t=uploadcare.openDialog(null,null,{imageShrink:e,crop:"free"}),t.done(function(e){var t,r,i;return t=((r=e.files)?r():[e])[0],i=document.createElement("img"),i.style.width="3em",i.style.height="1.5em",i.style.backgroundImage="url(/assets/img/loader/msg.svg)",i.style.backgroundColor="#ccc",i.style.backgroundSize="cover",i.style.backgroundRepeat="no-repeat",i.style.backgroundPosition="center center",i.src="data:image/gif;base64,R0lGODlhAQABAIAAAPHx8QAAACH5BAEAAAAALAAAAAABAAEAQAICRAEAOw==",n.node(i).then(function(){return t.done(function(e){return i.setAttribute("image","image"),i.setAttribute("image-ratio",.01*Math.round(100*(e.crop.width/e.crop.height))),i.style.backgroundImage="url("+e.cdnUrl+")",i.style.backgroundColor="",i.style.width=e.crop.width+"px",i.style.height=e.crop.height+"px",i.style.backgroundSize="100% 100%",i.style.backgroundPosition="center center",f.resizable(i),u.editBlock(i)})})["catch"](function(){})})},hr:function(){var e;return e=document.createElement("hr"),this.node(e).then(function(){return u.editBlock(e)})},button:function(){var e,t;return e=document.createElement("div"),e.setAttribute("repeat-host","repeat-host"),t=document.createElement("a"),t.classList.add("btn","btn-primary","m-1"),t.innerHTML="Get Start",t.setAttribute("href","#"),t.setAttribute("editable","true"),t.setAttribute("repeat-item","repeat-item"),e.appendChild(t),this.node(e).then(function(){return u.editBlock(e)})},icon:function(){return e.iconPicker.toggle()},toggle:function(e,t){var n,r,i,o,a;return null==t&&(t={}),n=document.querySelector("#editor-insert-handle"),n.style.display=e?"block":"none",e?(r=document.scrollingElement.scrollTop,i=n.style,i.top="10px",i.opacity=.8,i):(o=n.style,a="-100px",o.opacity=0,o)}},["keyup","mouseup","focus","blur"].map(function(t){return document.body.addEventListener(t,function(t){var n,r;return n=window.getSelection(),n.isCollapsed&&n.rangeCount?(r=btools.traceUp("[contenteditable='true']",t.target),r?e.insert.toggle(!0,n.getRangeAt(0).getBoundingClientRect()):e.insert.toggle(!1)):e.insert.toggle(!1)})}),e.iconPicker={modal:{},toggle:function(){return this.modal.ctrl.toggle()},keyword:"",click:function(t){var n,r;if(t.target&&t.target.getAttribute&&(n=t.target.getAttribute("c")))return n="&#x"+n+";",r=document.createElement("i"),r.classList.add("fa-icon"),r.innerHTML=n,e.insert.node(r),this.modal.ctrl.toggle(!1),u.editBlock(r)},init:function(){var t=this;return e.$watch("iconPicker.keyword",function(){return btools.qsAll("#editor-icon-picker-list i.fa").map(function(e){return!t.keyword||""===t.keyword||~e.classList.value.indexOf(t.keyword)?e.classList.remove("d-none"):e.classList.add("d-none")})})}},e.iconPicker.init(),e.pageConfig={modal:{},tab:1,toggle:function(){return l.setBlock(document.querySelector("#editor > .inner")),this.modal.ctrl.toggle()}},e.blockConfig={modal:{},toggle:function(e){return l.setBlock(e),this.modal.ctrl.toggle()}},e.share=b.share,e.$watch("config.size.value",function(){return e.config.size.relayout()}),e.$watch("user.data.key",function(e,t){return(e||t)&&e!==t?n(function(){return window.location.reload()},5e3):void 0}),e.editor=y,document.body.addEventListener("keyup",function(e){return h.toggle(null),u.editBlock(e.target)}),y.online.retry(),document.querySelector("#editor .inner").addEventListener("click",function(e){var t;for(t=e.target;t&&(!t.getAttribute||!t.getAttribute("edit-text"));)t=t.parentNode;return t&&t.getAttribute&&t.getAttribute("edit-text")?m.toggle(null):void 0}),x=null,t(function(){var t;if(e.user.data&&(t=y.cursor.get(),JSON.stringify(t)!==JSON.stringify(x)))return o.action.cursor(e.user.data,t),x=t},1e3),document.body.addEventListener("mouseup",function(){var e,t,n,r,i,o,a;if(e=window.getSelection(),e.rangeCount){if(t=e.getRangeAt(0),n=[t.startContainer,t.endContainer],r=n[0],i=n[1],r!==i){for(o=r;o&&o.parentNode;)if(o=o.parentNode,i===o)return t.selectNodeContents(r);for(a=i;i&&i.parentNode&&(i=i.previousSibling||i.parentNode,0===i.childNodes.length||i===a.parentNode&&0===Array.from(i.childNodes).indexOf(a)););}return 3===r.nodeType&&(r=r.previousSibling||r.parentNode),3===i.nodeType&&(i=i.previousSibling||i.parentNode),r===i&&i!==t.endContainer&&0===t.endOffset?t.selectNodeContents(r):void 0}}),w=document.querySelector("#blocks-picker"),S=document.querySelector("#blocks-preview"),w.addEventListener("dragstart",function(){return S.style.display="none"}),w.addEventListener("mouseout",function(){return S.style.display="none"}),w.addEventListener("mousemove",function(e){var t,n,r,i,o,a,l,u,c;return t=e.target,t.classList&&t.classList.contains("thumb")?(n=t.getBoundingClientRect(),r=t.getAttribute("name"),i=t.getAttribute("ratio"),20>i&&(i=20),o=window.innerHeight+document.scrollingElement.scrollTop,a=n.y+.5*n.height-25+document.scrollingElement.scrollTop,l=2.56*i,a+l>o-5&&(a=o-l-5),u=S.style,u.left=n.x+n.width+"px",u.top=a+"px",u.display="block",S.querySelector(".name").innerText=r,c=S.querySelector(".inner").style,c.backgroundImage="url(/blocks/"+r+"/index.png)",c.height="0",c.paddingBottom=i-1+"%",c):void(t!==w&&(S.style.display="none"))}),document.addEventListener("scroll",function(){return h.toggle(null),e.insert.toggle(!1),S.style.display="none"}),["mousemove","keydown","scroll"].map(function(e){return document.addEventListener(e,function(){return y.online.retry.countdown=y.online.defaultCountdown})}),window.addEventListener("resize",function(){return e.config.size.resizeAsync()}),e.config.size.resizeAsync(),window.addEventListener("keydown",function(e){return(e.metaKey||e.ctrlKey)&&90===e.keyCode?(o.history.undo(),e.preventDefault(),!1):void 0}),document.addEventListener("selectionchange",function(){var e,t,n,r,i;if(e=window.getSelection(),e.rangeCount&&(t=e.getRangeAt(0),n=[t.endContainer,t.endOffset],r=n[0],i=n[1],r.getAttribute&&"false"===r.getAttribute("editable"))){for(;r&&!r.previousSibling;)r=r.parentNode;if(!r||!r.previousSibling)return;return r=r.previousSibling,i=r.length||r.childNodes&&r.childNodes.length||0,t.setEnd(r,i),e.removeAllRanges(),e.addRange(t)}}),window.addEventListener("error",function(){return e.force$apply(function(){return e.crashed=!0})})}));
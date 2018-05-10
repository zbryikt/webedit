function import$(t,e){var i={}.hasOwnProperty;for(var o in e)i.call(e,o)&&(t[o]=e[o]);return t}var collab,x$;collab={history:{backward:[],forward:[],redo:function(){for(var t;;){if(t=this.forward.splice(0,1)[0],!t)return;if(backward.push(t),collab.doc.submitOp(t.op,{forceApply:!1}),!t.option.nobreak)break}},undo:function(t){for(var e;;){if(e=this.backward.pop(t),!e)return;if(this.forward.splice(0,0,e),collab.doc.submitOp(sharedb.types.map.json0.invert(e.op),{source:{forceApply:!0}}),!e.option.nobreak)break}},log:function(t,e){return null==e&&(e={}),e.ignore?void 0:(this.backward.push({op:t,option:e}),this.forward.length?this.forward.splice(0):void 0)}},action:{submitOp:function(t,e){return null==e&&(e={}),collab.history.log(t,e),collab.doc.submitOp(t)},info:function(t){var e,i,o,r,n,a;if(e=[t,collab.doc],i=e[0],o=e[1],!o||!o.data)return[];for(;i&&i.parentNode&&!i.getAttribute("base-block");)i=i.parentNode;return i&&i.getAttribute&&i.getAttribute("base-block")?(r=Array.from(i.parentNode.childNodes).indexOf(i),n=i.getAttribute("base-block"),a=i.getAttribute("eid"),[i,o,r,n,a]):[]},checkPath:function(t,e,i,o){return null==i&&(i={}),null==o&&(o={ignore:!0}),t?void 0:this.submitOp([{p:e,oi:i}],o)},setPublic:function(t){var e,i;return this.checkPath(collab.doc.data.attr,["attr"]),e=collab.doc.data.attr,e&&e.isPublic!==t?this.submitOp([{p:["attr"],od:e,oi:(i=import$({},e),i.isPublic=t,i)}],{ignore:!0}):void 0},setThumbnail:function(t){var e,i;return null==t&&(t=null),t?(e=collab.doc,this.checkPath(e.data.attr,["attr"]),e.data.attr.thumbnail?this.submitOp([{p:["attr","thumbnail",0],sd:e.data.attr.thumbnail},{p:["attr","thumbnail",0],si:t}],{ignore:!0}):this.submitOp([{p:["attr"],od:e.data.attr,oi:(i=import$({},e.data.attr),i.thumbnail=t,i)}],{ignore:!0})):void 0},setTitle:function(t){var e=this;return this.setTitle.handler&&(clearTimeout(this.setTitle.handler),this.setTitle.handler=null),this.setTitle.handler=setTimeout(function(){var i,o,r,n;return i=collab.doc,o=t,o||(r=Array.from(document.querySelector("#editor .inner").querySelectorAll("h1,h2,h3")),r.sort(function(t,e){return t.nodeName===e.nodeName?0:t.nodeName>e.nodeName?1:-1}),r[0]&&(o=r[0].innerText)),o||(o="untitled"),e.checkPath(i.data.attr,["attr"]),i.data.attr&&i.data.attr.title===o?void 0:(o.length>60&&(o=o.substring(0,57)+"..."),i.data.attr&&i.data.attr.title?e.submitOp([{p:["attr","title",0],sd:i.data.attr.title},{p:["attr","title",0],si:o}],{ignore:!0}):e.submitOp([{p:["attr"],oi:(n=import$({},i.data.attr||{}),n.title=o,n)}],{ignore:!0}))},1e3)},moveBlock:function(t,e){return this.submitOp([{p:["child",t],lm:e}])},deleteBlock:function(t){var e,i,o,r,n;return e=this.info(t),i=e[0],o=e[1],r=e[2],n=e[3],i?this.submitOp([{p:["child",r],ld:o.data.child[r]}]):void 0},insertBlock:function(t){var e,i,o,r,n,a;return e=this.info(t),i=e[0],o=e[1],r=e[2],n=e[3],a=e[4],i?(this.submitOp([{p:["child",r],li:{content:this.blockContent(i),type:n,eid:a}}]),this.setTitle()):void 0},blockContent:function(t){var e;return e=Array.from(t.childNodes).filter(function(t){return/inner/.exec(t.getAttribute("class"))})[0],e.querySelector("[auto-content]")&&(e=e.cloneNode(!0),Array.from(e.querySelectorAll("[auto-content]")).map(function(t){return Array.from(t.childNodes).map(function(e){return t.removeChild(e)})})),puredom.sanitize((e||{}).innerHTML)},strDiff:function(t,e,i,o){var r,n,a,l,s,c,d,u;for(null==t&&(t=[]),null==e&&(e=""),null==i&&(i=""),null==o&&(o={}),r=[collab.doc,fastDiff(e,i),0],n=r[0],a=r[1],l=r[2],s=[],c=0,d=a.length;d>c;++c)u=a[c],0===u[0]?l+=u[1].length:1===u[0]?(s.push({p:t.concat([l]),si:u[1]}),l+=u[1].length):s.push({p:t.concat([l]),sd:u[1]});return s.length?this.submitOp(s,o):void 0},editStyle:function(t,e){var i,o,r,n,a,l,s,c;if(null==e&&(e=!1),i=collab.doc,o=t.getAttribute("style"),e){if(o=o.replace(/width:\d+px;?/,""),r=[i.data,[]],n=r[0],a=r[1],n.style&&typeof n.style==typeof{}&&this.submitOp([{p:a.concat(["style"]),od:n.style}]),!n.style)return this.submitOp([{p:a,od:n,oi:(r=import$({},n),r.style=o,r)}])}else{if(r=this.info(t),l=r[0],i=r[1],s=r[2],c=r[3],!l||!i.data.child[s])return;if(r=[i.data.child[s],["child",s]],n=r[0],a=r[1],!n.style)return this.submitOp([{p:a,ld:n,li:(r=import$({},n),r.style=o,r)}])}return this.strDiff(a.concat(["style"]),n.style,o)},editBlock:function(t,e){var i,o,r,n,a,l,s,c;return null==e&&(e={}),i=this.info(t),o=i[0],r=i[1],n=i[2],a=i[3],o?(l={last:(r.data.child[n]||{}).content||"",now:this.blockContent(o)},s=fastDiff(l.last,l.now),r.data.child[n]||this.submitOp([{p:["child",n],li:{content:"",type:a,style:""}}],e),c=0,this.strDiff(["child",n,"content"],l.last,l.now,e),this.setTitle()):void 0},cursor:function(t,e){var i;if(t&&(t.key||t.guestkey)&&collab.doc&&collab.doc.data)return i=t.key||t.guestkey,collab.connection.send({cursor:{action:"update",data:{cursor:e}}})},css:{prepare:function(){return collab.doc.data.css||collab.action.submitOp([{p:["css"],oi:{links:[],inline:"",theme:{}}}]),collab.doc.data.css},editInline:function(t){var e;return e=this.prepare(),collab.action.strDiff(["css","inline"],e.inline||"",t)},addLink:function(t){var e;return e=this.prepare(),collab.action.submitOp([{p:["css","links",e.links.length],li:t}])},removeLink:function(t){var e,i;return e=this.prepare(),i=e.links.indexOf(t),~i?collab.action.submitOp([{p:["css","links",i],ld:t}]):void 0},editTheme:function(t){var e;return e=this.prepare(),collab.action.submitOp([{p:["css","theme"],od:e.theme,oi:t}])}}},init:function(t,e){var i,o,r,n,a=this;return i=[t,e],this.root=i[0],this.editor=i[1],this.root.innerHTML="",o=window.location.pathname,this.socket=new WebSocket(("http"===e.server.scheme?"ws":"wss")+"://"+e.server.domain+"/ws"),r=function(){return e.online.toggle(!1)},this.socket.readyState>=2?r():(this.socket.addEventListener("close",function(t){return 3001!==t.code?r():void 0}),this.socket.addEventListener("error",function(){return 1===a.socket.readyState?r():void 0}),this.connection=new sharedb.Connection(this.socket),this.connection.on("receive",function(t){var i,o;if(!t.data||t.data.cursor)return i=[t.data.cursor,null],o=i[0],t.data=i[1],e.collaborator.handle(o)}),this.pageid=/^\/page\//.exec(o)?o.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=n=this.connection.get("doc",this.pageid),n.on("load",function(){var t,i,o,r,a;if(n.data){for(t=0,o=(i=n.data.child).length;o>t;++t)r=t,a=i[t],a&&e.block.prepare(a.content,{name:a.type,idx:r,redo:!1,style:a.style||"",source:!1,eid:a.eid});e.block.init(),e.page.prepare(n.data),e.css.prepare(n.data.css)||{}}return e.loading.toggle(!1),e.collaborator.init()}),n.fetch(function(t){return t?e.online.toggle(!1,{code:403}):setTimeout(function(){var t;return n.subscribe(function(t,e){return a.handle(t,e)}),n.on("op",function(t,e){return a.handle(t,e)}),n.type?void 0:t=n.create({attr:{},style:"",child:[],collaborator:{}})},500)}))},handle:function(t,e){var i,o,r,n,a,l,s,c,d=[];if(t&&(!e||e.forceApply)){for(i=0,o=t.length;o>i;++i)r=t[i],r.si||r.sd?"style"===r.p[2]?(n=this.root.childNodes[r.p[1]],d.push(this.editor.block.style.update(n,this.doc.data.child[r.p[1]].style||""))):"style"===r.p[0]?d.push(this.root.style=this.doc.data.style||""):"css"===r.p[0]&&"inline"===r.p[1]?d.push(this.editor.css.inline.update(this.doc.data.css.inline)):"attr"===r.p[0]||"child"===r.p[0]&&"content"===r.p[2]&&4===r.p.length&&(n=this.root.childNodes[r.p[1]],d.push(this.editor.block.prepareAsync(n,{name:n.getAttribute("base-block"),idx:r.p[1],redo:!0,content:this.doc.data.child[r.p[1]].content,source:!1}))):r.li||r.ld?(r.ld&&("child"===r.p[0]?(n=this.root.childNodes[r.p[1]],n.parentNode.removeChild(n),this.editor.block.indexing(),n.deleted=!0,this.editor.handles.hide(n)):"css"===r.p[0]&&"links"===r.p[1]&&this.editor.css.links.remove(r.ld)),r.li&&("child"===r.p[0]?(this.editor.block.prepare(r.li.content,{name:r.li.type,idx:r.p[1],redo:!1,style:r.li.style,source:!1,eid:r.li.eid}),d.push(this.editor.block.indexing())):"css"===r.p[0]&&"links"===r.p[1]&&d.push(this.editor.css.links.add(r.li)))):null!=r.lm?(a=[r.p[1],r.lm],l=a[0],s=a[1],l!==s&&(n=this.root.childNodes[l],c=this.root.childNodes[s+(s>l?1:0)],this.root.removeChild(n),c?this.root.insertBefore(n,c):this.root.appendChild(n),d.push(this.editor.block.indexing()))):r.oi?"attr"===r.p[0]?d.push(collab.editor.page.share.setPublic(this.doc.data.attr.isPublic)):"css"===r.p[0]&&d.push(collab.editor.css.theme.update(r.oi)):r.od;return d}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var t;return t=document.querySelector("#collab-info"),t.style.left=1024+Math.round((window.innerWidth-1024)/2)+"px",t.style.right="auto"}));
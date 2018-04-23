function import$(t,e){var i={}.hasOwnProperty;for(var o in e)i.call(e,o)&&(t[o]=e[o]);return t}var collab,x$;collab={history:{backward:[],forward:[],redo:function(){var t;return(t=this.forward.splice(0,1)[0])?(backward.push(t),collab.doc.submitOp(t,{forceApply:!1})):void 0},undo:function(t){var e;return(e=this.backward.pop(t))?(this.forward.splice(0,0,e),collab.doc.submitOp(sharedb.types.map.json0.invert(e),{source:{forceApply:!0}})):void 0},log:function(t){return this.backward.push(t),this.forward.length?this.forward.splice(0):void 0}},action:{submitOp:function(t){return collab.history.log(t),collab.doc.submitOp(t)},info:function(t){var e,i,o,r,n,l;if(e=[t,collab.doc],i=e[0],o=e[1],!o||!o.data)return[];for(;i&&i.parentNode&&!i.getAttribute("base-block");)i=i.parentNode;return i&&i.getAttribute&&i.getAttribute("base-block")?(r=Array.from(i.parentNode.childNodes).indexOf(i),n=i.getAttribute("base-block"),l=i.getAttribute("eid"),[i,o,r,n,l]):[]},setPublic:function(t){var e,i;return e=collab.doc.data.attr,e&&e.isPublic!==t?this.submitOp([{p:["attr"],od:e,oi:(i=import$({},e),i.isPublic=t,i)}]):void 0},setThumbnail:function(t){var e,i;return null==t&&(t=null),t?(e=collab.doc,e.data.attr.thumbnail?(this.submitOp([{p:["attr","thumbnail",0],sd:e.data.attr.thumbnail}]),this.submitOp([{p:["attr","thumbnail",0],si:t}])):this.submitOp([{p:["attr"],od:e.data.attr,oi:(i=import$({},e.data.attr),i.thumbnail=t,i)}])):void 0},setTitle:function(t){var e=this;return this.setTitle.handler&&(clearTimeout(this.setTitle.handler),this.setTitle.handler=null),this.setTitle.handler=setTimeout(function(){var i,o,r,n;return i=collab.doc,o=t,o||(r=Array.from(document.querySelector("#editor .inner").querySelectorAll("h1,h2,h3")),r.sort(function(t,e){return t.nodeName===e.nodeName?0:t.nodeName>e.nodeName?1:-1}),r[0]&&(o=r[0].innerText)),o||(o="untitled"),i.data.attr.title!==o?(o.length>60&&(o=o.substring(0,57)+"..."),i.data.attr.title?(e.submitOp([{p:["attr","title",0],sd:i.data.attr.title}]),e.submitOp([{p:["attr","title",0],si:o}])):e.submitOp([{p:["attr"],oi:(n=import$({},i.data.attr),n.title=o,n)}])):void 0},1e3)},moveBlock:function(t,e){return this.submitOp([{p:["child",t],lm:e}])},deleteBlock:function(t){var e,i,o,r,n;return e=this.info(t),i=e[0],o=e[1],r=e[2],n=e[3],i?this.submitOp([{p:["child",r],ld:o.data.child[r]}]):void 0},insertBlock:function(t){var e,i,o,r,n,l;return e=this.info(t),i=e[0],o=e[1],r=e[2],n=e[3],l=e[4],i?(this.submitOp([{p:["child",r],li:{content:this.blockContent(i),type:n,eid:l}}]),this.setTitle()):void 0},blockContent:function(t){var e;return e=Array.from(t.childNodes).filter(function(t){return/inner/.exec(t.getAttribute("class"))})[0],e.querySelector("[auto-content]")&&(e=e.cloneNode(!0),Array.from(e.querySelectorAll("[auto-content]")).map(function(t){return Array.from(t.childNodes).map(function(e){return t.removeChild(e)})})),puredom.sanitize((e||{}).innerHTML)},strDiff:function(t,e,i){var o,r,n,l,a,s,c,d=[];for(null==t&&(t=[]),null==e&&(e=""),null==i&&(i=""),o=[collab.doc,fastDiff(e,i),0],r=o[0],n=o[1],l=o[2],a=0,s=n.length;s>a;++a)c=n[a],0===c[0]?d.push(l+=c[1].length):1===c[0]?(this.submitOp([{p:t.concat([l]),si:c[1]}]),d.push(l+=c[1].length)):d.push(this.submitOp([{p:t.concat([l]),sd:c[1]}]));return d},editStyle:function(t,e){var i,o,r,n,l,a,s,c;if(null==e&&(e=!1),i=collab.doc,o=t.getAttribute("style"),e){if(o=o.replace(/width:\d+px;?/,""),r=[i.data,[]],n=r[0],l=r[1],n.style&&typeof n.style==typeof{}&&this.submitOp([{p:l.concat(["style"]),od:n.style}]),!n.style)return this.submitOp([{p:l,od:n,oi:(r=import$({},n),r.style=o,r)}])}else{if(r=this.info(t),a=r[0],i=r[1],s=r[2],c=r[3],!a||!i.data.child[s])return;if(r=[i.data.child[s],["child",s]],n=r[0],l=r[1],!n.style)return this.submitOp([{p:l,ld:n,li:(r=import$({},n),r.style=o,r)}])}return this.strDiff(l.concat(["style"]),n.style,o)},editBlock:function(t){var e,i,o,r,n,l,a,s;return e=this.info(t),i=e[0],o=e[1],r=e[2],n=e[3],i?(l={last:(o.data.child[r]||{}).content||"",now:this.blockContent(i)},a=fastDiff(l.last,l.now),o.data.child[r]||this.submitOp([{p:["child",r],li:{content:"",type:n,style:""}}]),s=0,this.strDiff(["child",r,"content"],l.last,l.now),this.setTitle()):void 0},cursor:function(t,e){var i;if(t&&(t.key||t.guestkey)&&collab.doc&&collab.doc.data)return i=t.key||t.guestkey,collab.connection.send({cursor:{action:"update",data:{cursor:e}}})}},init:function(t,e){var i,o,r,n,l=this;return i=[t,e],this.root=i[0],this.editor=i[1],this.root.innerHTML="",o=window.location.pathname,this.socket=new WebSocket(("http"===e.server.scheme?"ws":"wss")+"://"+e.server.domain+"/ws"),r=function(){return e.online.toggle(!1)},this.socket.readyState>=2?r():(this.socket.addEventListener("close",function(t){return 3001!==t.code?r():void 0}),this.socket.addEventListener("error",function(){return 1===l.socket.readyState?r():void 0}),this.connection=new sharedb.Connection(this.socket),this.connection.on("receive",function(t){var i,o;if(!t.data||t.data.cursor)return i=[t.data.cursor,null],o=i[0],t.data=i[1],e.collaborator.handle(o)}),this.pageid=/^\/page\//.exec(o)?o.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=n=this.connection.get("doc",this.pageid),n.on("load",function(){var t,i,o,r,l;if(n.data){for(t=0,o=(i=n.data.child).length;o>t;++t)r=t,l=i[t],l&&e.block.prepare(l.content,{name:l.type,idx:r,redo:!1,style:l.style||"",source:!1,eid:l.eid});e.block.init(),e.page.prepare(n.data)}return e.loading.toggle(!1)}),n.fetch(function(t){var i;return t?e.online.toggle(!1,{code:403}):(n.type||(i=n.create({attr:{},style:"",child:[],collaborator:{}})),n.subscribe(function(t,e){return l.handle(t,e)}),n.on("op",function(t,e){return l.handle(t,e)}))}))},handle:function(t,e){var i,o,r,n,l,a,s,c,d=[];if(t&&(!e||e.forceApply)){for(i=0,o=t.length;o>i;++i)r=t[i],r.si||r.sd?"style"===r.p[2]?(n=this.root.childNodes[r.p[1]],d.push(n.style=this.doc.data.child[r.p[1]].style||"")):"style"===r.p[0]?d.push(this.root.style=this.doc.data.style||""):"attr"===r.p[0]||"child"===r.p[0]&&"content"===r.p[2]&&4===r.p.length&&(n=this.root.childNodes[r.p[1]],d.push(this.editor.block.prepareAsync(n,{name:n.getAttribute("base-block"),idx:r.p[1],redo:!0,content:this.doc.data.child[r.p[1]].content,source:!1}))):r.li?d.push(this.editor.block.prepare(r.li.content,{name:r.li.type,idx:r.p[1],redo:!1,style:r.li.style,source:!1,eid:r.li.eid})):r.ld?(n=this.root.childNodes[r.p[1]],d.push(n.parentNode.removeChild(n))):null!=r.lm?(l=[r.p[1],r.lm],a=l[0],s=l[1],a!==s&&(n=this.root.childNodes[a],c=this.root.childNodes[s+(s>a?1:0)],this.root.removeChild(n),d.push(c?this.root.insertBefore(n,c):this.root.appendChild(n)))):r.oi?"attr"===r.p[0]&&d.push(collab.editor.page.share.setPublic(this.doc.data.attr.isPublic)):r.od;return d}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var t;return t=document.querySelector("#collab-info"),t.style.left=1024+Math.round((window.innerWidth-1024)/2)+"px",t.style.right="auto"}));
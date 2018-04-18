function import$(t,o){var e={}.hasOwnProperty;for(var r in o)e.call(o,r)&&(t[r]=o[r]);return t}var collab,x$;collab={action:{info:function(t){var o,e,r,a,l;if(o=[t,collab.doc],e=o[0],r=o[1],!r||!r.data)return[];for(;e&&e.parentNode&&!e.getAttribute("base-block");)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("base-block")?(a=Array.from(e.parentNode.childNodes).indexOf(e),l=e.getAttribute("base-block"),[e,r,a,l]):[]},setPublic:function(t){var o,e;return o=collab.doc.data.attr,o&&o.isPublic!==t?collab.doc.submitOp([{p:["attr"],od:o,oi:(e=import$({},o),e.isPublic=t,e)}]):void 0},setThumbnail:function(t){var o,e;return null==t&&(t=null),t?(o=collab.doc,o.data.attr.thumbnail?(o.submitOp([{p:["attr","thumbnail",0],sd:o.data.attr.thumbnail}]),o.submitOp([{p:["attr","thumbnail",0],si:t}])):o.submitOp([{p:["attr"],od:o.data.attr,oi:(e=import$({},o.data.attr),e.thumbnail=t,e)}])):void 0},setTitle:function(t){return this.setTitle.handler&&(clearTimeout(this.setTitle.handler),this.setTitle.handler=null),this.setTitle.handler=setTimeout(function(){var o,e,r,a;return o=collab.doc,e=t,e||(r=Array.from(document.querySelector("#editor .inner").querySelectorAll("h1,h2,h3")),r.sort(function(t,o){return t.nodeName===o.nodeName?0:t.nodeName>o.nodeName?1:-1}),r[0]&&(e=r[0].innerText)),e||(e="untitled"),o.data.attr.title!==e?(e.length>60&&(e=e.substring(0,57)+"..."),o.data.attr.title?(o.submitOp([{p:["attr","title",0],sd:o.data.attr.title}]),o.submitOp([{p:["attr","title",0],si:e}])):o.submitOp([{p:["attr"],oi:(a=import$({},o.data.attr),a.title=e,a)}])):void 0},1e3)},moveBlock:function(t,o){return collab.doc.submitOp([{p:["child",t],lm:o}])},deleteBlock:function(t){var o,e,r,a,l;return o=this.info(t),e=o[0],r=o[1],a=o[2],l=o[3],e?r.submitOp([{p:["child",a],ld:r.data.child[a]}]):void 0},insertBlock:function(t){var o,e,r,a,l;return o=this.info(t),e=o[0],r=o[1],a=o[2],l=o[3],e?(r.submitOp([{p:["child",a],li:{content:this.blockContent(e),type:l}}]),this.setTitle()):void 0},blockContent:function(t){var o;return o=Array.from(t.childNodes).filter(function(t){return/inner/.exec(t.getAttribute("class"))})[0],o.querySelector("[auto-content]")&&(o=o.cloneNode(!0),Array.from(o.querySelectorAll("[auto-content]")).map(function(t){return Array.from(t.childNodes).map(function(o){return t.removeChild(o)})})),puredom.sanitize((o||{}).innerHTML)},strDiff:function(t,o,e){var r,a,l,i,n,c,d,s=[];for(null==t&&(t=[]),null==o&&(o=""),null==e&&(e=""),r=[collab.doc,fastDiff(o,e),0],a=r[0],l=r[1],i=r[2],n=0,c=l.length;c>n;++n)d=l[n],0===d[0]?s.push(i+=d[1].length):1===d[0]?(a.submitOp([{p:t.concat([i]),si:d[1]}]),s.push(i+=d[1].length)):s.push(a.submitOp([{p:t.concat([i]),sd:d[1]}]));return s},editStyle:function(t,o){var e,r,a,l,i,n,c,d;if(null==o&&(o=!1),e=collab.doc,r=t.getAttribute("style"),o){if(r=r.replace(/width:\d+px;?/,""),a=[e.data,[]],l=a[0],i=a[1],!l.style)return e.submitOp([{p:i,od:l,oi:(a=import$({},l),a.style=r,a)}])}else{if(a=this.info(t),n=a[0],e=a[1],c=a[2],d=a[3],!n||!e.data.child[c])return;if(a=[e.data.child[c],["child",c]],l=a[0],i=a[1],!l.style)return e.submitOp([{p:i,ld:l,li:(a=import$({},l),a.style=r,a)}])}return this.strDiff(i.concat(["style"]),l.style,r)},editBlock:function(t){var o,e,r,a,l,i,n,c;return o=this.info(t),e=o[0],r=o[1],a=o[2],l=o[3],e?(i={last:(r.data.child[a]||{}).content||"",now:this.blockContent(e)},n=fastDiff(i.last,i.now),r.data.child[a]||r.submitOp([{p:["child",a],li:{content:"",type:l,style:""}}]),c=0,this.strDiff(["child",a,"content"],i.last,i.now),this.setTitle()):void 0},cursor:function(t,o){return t&&t.key&&collab.doc&&collab.doc.data&&collab.doc.data.collaborator&&collab.doc.data.collaborator[t.key]?collab.doc.submitOp([{p:["collaborator",t.key,"cursor"],od:collab.doc.data.collaborator[t.key].cursor,oi:o}]):void 0},join:function(t){var o;if(collab.doc&&collab.doc.data&&collab.doc.data.collaborator&&(t||(t={displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0}),!collab.doc.data.collaborator[t.key]))return this.join.user=t,collab.editor.collaborator.add(t,t.key),((o=collab.doc.data).collaborator||(o.collaborator={}))[t.key]?void 0:collab.doc.submitOp([{p:["collaborator",t.key],oi:(o={key:t.key,displayname:t.displayname,guest:t.guest},o.jointime=(new Date).getTime(),o)}])},exit:function(t){return!t&&this.join.user&&(t=this.join.user.key),t&&collab.doc&&collab.doc.data&&collab.doc.data.collaborator&&collab.doc.data.collaborator[t]?(collab.editor.collaborator.remove(t),collab.doc.submitOp([{p:["collaborator",t],od:collab.doc.data.collaborator[t]}])):void 0}},init:function(t,o,e){var r,a,l,i,n=this;return r=[t,o],this.root=r[0],this.editor=r[1],this.root.innerHTML="",a=window.location.pathname,this.socket=new WebSocket(("http"===o.server.scheme?"ws":"wss")+"://"+o.server.domain+"/ws"),l=function(){return o.online.toggle(!1)},this.socket.readyState>=2?l():(this.socket.addEventListener("close",function(t){return 3001!==t.code?l():void 0}),this.socket.addEventListener("error",function(){return 1===n.socket.readyState?l():void 0}),this.connection=new sharedb.Connection(this.socket),this.pageid=/^\/page\//.exec(a)?a.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=i=this.connection.get("doc",this.pageid),i.on("load",function(){var t,e,r,a,l,n;if(i.data){for(t=0,r=(e=i.data.child).length;r>t;++t)a=t,l=e[t],l&&o.block.prepare(l.content,{name:l.type,idx:a,redo:!1,style:l.style||"",source:!1});o.block.init();for(n in e=i.data.collaborator)l=e[n],o.collaborator.add(l,n);o.page.prepare(i.data)}return o.loading.toggle(!1)}),i.fetch(function(t){var r;return t?o.online.toggle(!1,{code:403}):(console.log(">>>",t),i.type||(r=i.create({attr:{},style:{},child:[],collaborator:{}})),i.subscribe(function(t,o){return n.handle(t,o)}),i.on("op",function(t,o){return n.handle(t,o)}),collab.action.join(e))}))},handle:function(t,o){var e,r,a,l,i,n,c,d,s=[];if(t&&!o){for(e=0,r=t.length;r>e;++e)a=t[e],a.si||a.sd?"style"===a.p[2]?(l=this.root.childNodes[a.p[1]],s.push(l.style=this.doc.data.child[a.p[1]].style||"")):"style"===a.p[0]?s.push(this.root.style=this.doc.data.style||""):"attr"===a.p[0]||"child"===a.p[0]&&"content"===a.p[2]&&4===a.p.length&&(l=this.root.childNodes[a.p[1]],s.push(this.editor.block.prepareAsync(l,{name:l.getAttribute("base-block"),idx:a.p[1],redo:!0,content:this.doc.data.child[a.p[1]].content,source:!1}))):a.li?s.push(this.editor.block.prepare(a.li.content,{name:a.li.type,idx:a.p[1],redo:!1,style:a.li.style,source:!1})):a.ld?(l=this.root.childNodes[a.p[1]],s.push(l.parentNode.removeChild(l))):null!=a.lm?(i=[a.p[1],a.lm],n=i[0],c=i[1],n!==c&&(l=this.root.childNodes[n],d=this.root.childNodes[c+(c>n?1:0)],this.root.removeChild(l),s.push(d?this.root.insertBefore(l,d):this.root.appendChild(l)))):a.oi?"collaborator"===a.p[0]?s.push("cursor"===a.p[2]?this.editor.collaborator.update(this.doc.data.collaborator[a.p[1]],a.p[1]):this.editor.collaborator.add(a.oi,a.p[1])):"attr"===a.p[0]&&s.push(collab.editor.page.share.setPublic(this.doc.data.attr.isPublic)):a.od&&"collaborator"===a.p[0]&&s.push(this.editor.collaborator.remove(a.od,a.p[1]));return s}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var t;return t=document.querySelector("#collab-info"),t.style.left=1024+Math.round((window.innerWidth-1024)/2)+"px",t.style.right="auto"}));
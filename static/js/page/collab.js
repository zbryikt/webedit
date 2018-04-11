function import$(t,o){var e={}.hasOwnProperty;for(var r in o)e.call(o,r)&&(t[r]=o[r]);return t}var collab,x$;collab={action:{info:function(t){var o,e,r,i,l;if(o=[t,collab.doc],e=o[0],r=o[1],!r||!r.data)return[];for(;e&&e.parentNode&&!e.getAttribute("base-block");)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("base-block")?(i=Array.from(e.parentNode.childNodes).indexOf(e),l=e.getAttribute("base-block"),[e,r,i,l]):[]},setTitle:function(t){return this.setTitle.handler&&(clearTimeout(this.setTitle.handler),this.setTitle.handler=null),this.setTitle.handler=setTimeout(function(){var o,e,r,i;return o=collab.doc,e=t,e||(r=Array.from(document.querySelector("#editor .inner").querySelectorAll("h1,h2,h3")),r.sort(function(t,o){return t.nodeName===o.nodeName?0:t.nodeName>o.nodeName?1:-1}),e=r[0].innerText),e||(e="untitled"),o.data.attr.title!==e?(e.length>60&&(e=e.substring(0,57)+"..."),o.data.attr.title?(o.submitOp([{p:["attr","title",0],sd:o.data.attr.title}]),o.submitOp([{p:["attr","title",0],si:e}])):o.submitOp([{p:["attr"],oi:(i=import$({},o.data.attr),i.title=e,i)}])):void 0},1e3)},moveBlock:function(t,o){return collab.doc.submitOp([{p:["child",t],lm:o}])},deleteBlock:function(t){var o,e,r,i,l;return o=this.info(t),e=o[0],r=o[1],i=o[2],l=o[3],e?r.submitOp([{p:["child",i],ld:r.data.child[i]}]):void 0},insertBlock:function(t){var o,e,r,i,l;return o=this.info(t),e=o[0],r=o[1],i=o[2],l=o[3],e?(r.submitOp([{p:["child",i],li:{content:this.blockContent(e),type:l}}]),this.setTitle()):void 0},blockContent:function(t){var o;return o=Array.from(t.childNodes).filter(function(t){return/inner/.exec(t.getAttribute("class"))})[0],o.querySelector("[auto-content]")&&(o=o.cloneNode(!0),Array.from(o.querySelectorAll("[auto-content]")).map(function(t){return Array.from(t.childNodes).map(function(o){return t.removeChild(o)})})),(o||{}).innerHTML},editStyle:function(t){var o,e,r,i,l,a,n,c,d,s,u,h,p=[];if(o=this.info(t),e=o[0],r=o[1],i=o[2],l=o[3],e&&r.data.child[i]){if(a=t.getAttribute("style"),!r.data.child[i].style)return o=import$({},r.data.child[i]),o.style=a,n=o,r.submitOp([{p:["child",i],ld:r.data.child[i],li:n}]);for(c=fastDiff(r.data.child[i].style||"",a),d=0,s=0,u=c.length;u>s;++s)h=c[s],0===h[0]?p.push(d+=h[1].length):1===h[0]?(r.submitOp([{p:["child",i,"style",d],si:h[1]}]),p.push(d+=h[1].length)):p.push(r.submitOp([{p:["child",i,"style",d],sd:h[1]}]));return p}},editBlock:function(t){var o,e,r,i,l,a,n,c,d,s,u;if(o=this.info(t),e=o[0],r=o[1],i=o[2],l=o[3],e){for(a={last:(r.data.child[i]||{}).content||"",now:this.blockContent(e)},n=fastDiff(a.last,a.now),r.data.child[i]||r.submitOp([{p:["child",i],li:{content:"",type:l,style:""}}]),c=0,d=0,s=n.length;s>d;++d)u=n[d],0===u[0]?c+=u[1].length:1===u[0]?(r.submitOp([{p:["child",i,"content",c],si:u[1]}]),c+=u[1].length):r.submitOp([{p:["child",i,"content",c],sd:u[1]}]);return this.setTitle()}},cursor:function(t,o){return t&&collab.doc&&collab.doc.data?collab.doc.submitOp([{p:["collaborator",t.key,"cursor"],od:collab.doc.data.collaborator[t.key].cursor,oi:o}]):void 0},join:function(t){var o;if(collab.doc&&collab.doc.data)return t||(t={displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0}),collab.editor.collaborator.add(t,t.key),((o=collab.doc).collaborator||(o.collaborator={}))[t.key]?void 0:collab.doc.submitOp([{p:["collaborator",t.key],oi:(o={key:t.key,displayname:t.displayname,guest:t.guest},o.jointime=(new Date).getTime(),o)}])},exit:function(t){var o;if(collab.doc&&collab.doc.data)return((o=collab.doc.data).collaborator||(o.collaborator={}))[t.key]?(collab.editor.collaborator.remove(t,t.key),collab.doc.submitOp([{p:["collaborator",t.key],od:collab.doc.data.collaborator[t.key]}])):void 0}},init:function(t,o,e){var r,i,l,a,n=this;return r=[t,o],this.root=r[0],this.editor=r[1],this.root.innerHTML="",i=window.location.pathname,this.socket=new WebSocket(("http"===o.server.scheme?"ws":"wss")+"://"+o.server.domain+"/ws"),l=function(){return o.online.toggle(!1)},this.socket.readyState>=2?l():(this.socket.addEventListener("close",function(t){return 3001!==t.code?l():void 0}),this.socket.addEventListener("error",function(){return 1===n.socket.readyState?l():void 0}),this.connection=new sharedb.Connection(this.socket),this.pageid=/^\/page\//.exec(i)?i.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=a=this.connection.get("doc",this.pageid),a.on("load",function(){var t,e,r,i,l,n;if(a.data){for(t=0,r=(e=a.data.child).length;r>t;++t)i=t,l=e[t],l&&(o.block.prepare(l.content,l.type,i,!1,l.style)||"");for(n in e=a.data.collaborator)l=e[n],o.collaborator.add(l,n)}return o.loading.toggle(!1)}),a.fetch(function(){var t;return a.type||(t=a.create({attr:{},child:[],collaborator:{}})),a.subscribe(function(t,o){return n.handle(t,o)}),a.on("op",function(t,o){return n.handle(t,o)}),collab.action.join(e)}))},handle:function(t,o){function e(t){return/inner/.exec(t.getAttribute("class"))}var r,i,l,a,n,c,d,s,u,h=[];if(t&&!o){for(r=0,i=t.length;i>r;++r)l=t[r],l.si||l.sd?"style"===l.p[2]?(a=this.root.childNodes[l.p[1]],h.push(a.style=this.doc.data.child[l.p[1]].style||"")):"attr"===l.p[0]||"child"===l.p[0]&&"content"===l.p[2]&&4===l.p.length&&(a=this.root.childNodes[l.p[1]],n=Array.from(a.childNodes).filter(e)[0],n.innerHTML=this.doc.data.child[l.p[1]].content,h.push(this.editor.block.prepare(a,a.getAttribute("base-block"),l.p[1],!0))):l.li?h.push(this.editor.block.prepare(l.li.content,l.li.type,l.p[1],l.li.style)):l.ld?(a=this.root.childNodes[l.p[1]],h.push(a.parentNode.removeChild(a))):null!=l.lm?(c=[l.p[1],l.lm],d=c[0],s=c[1],d!==s&&(a=this.root.childNodes[d],u=this.root.childNodes[s+(s>d?1:0)],this.root.removeChild(a),h.push(u?this.root.insertBefore(a,u):this.root.appendChild(a)))):l.oi?"collaborator"===l.p[0]&&h.push("cursor"===l.p[2]?this.editor.collaborator.update(this.doc.data.collaborator[l.p[1]],l.p[1]):this.editor.collaborator.add(l.oi,l.p[1])):l.od&&"collaborator"===l.p[0]&&h.push(this.editor.collaborator.remove(l.od,l.p[1]));return h}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var t;return t=document.querySelector("#collab-info"),t.style.left=1024+Math.round((window.innerWidth-1024)/2)+"px",t.style.right="auto"}));
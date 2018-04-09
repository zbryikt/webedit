var collab,x$;collab={action:{info:function(o){var t,e,r,n,i;if(t=[o,collab.doc],e=t[0],r=t[1],!r||!r.data)return[];for(;e&&e.parentNode&&!e.getAttribute("base-block");)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("base-block")?(n=Array.from(e.parentNode.childNodes).indexOf(e),i=e.getAttribute("base-block"),[e,r,n,i]):[]},moveBlock:function(o,t){return collab.doc.submitOp([{p:["child",o],lm:t}])},deleteBlock:function(o){var t,e,r,n,i;return t=this.info(o),e=t[0],r=t[1],n=t[2],i=t[3],e?r.submitOp([{p:["child",n],ld:r.data.child[n]}]):void 0},insertBlock:function(o){var t,e,r,n,i;return t=this.info(o),e=t[0],r=t[1],n=t[2],i=t[3],e?r.submitOp([{p:["child",n],li:{content:this.blockContent(e),type:i}}]):void 0},blockContent:function(o){var t;return t=Array.from(o.childNodes).filter(function(o){return/inner/.exec(o.getAttribute("class"))})[0],t.querySelector("[auto-content]")&&(t=t.cloneNode(!0),Array.from(t.querySelectorAll("[auto-content]")).map(function(o){return Array.from(o.childNodes).map(function(t){return o.removeChild(t)})})),(t||{}).innerHTML},editBlock:function(o){var t,e,r,n,i,l,a,c,d,s,u,h=[];if(t=this.info(o),e=t[0],r=t[1],n=t[2],i=t[3],e){for(l={last:(r.data.child[n]||{}).content||"",now:this.blockContent(e)},a=fastDiff(l.last,l.now),r.data.child[n]||r.submitOp([{p:["child",n],li:{content:"",type:i}}]),c=0,d=0,s=a.length;s>d;++d)u=a[d],0===u[0]?h.push(c+=u[1].length):1===u[0]?(r.submitOp([{p:["child",n,"content",c],si:u[1]}]),h.push(c+=u[1].length)):h.push(r.submitOp([{p:["child",n,"content",c],sd:u[1]}]));return h}},cursor:function(o,t){return o&&collab.doc&&collab.doc.data?collab.doc.submitOp([{p:["collaborator",o.key,"cursor"],od:collab.doc.data.collaborator[o.key].cursor,oi:t}]):void 0},join:function(o){var t;if(collab.doc&&collab.doc.data)return o||(o={displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0}),collab.editor.collaborator.add(o,o.key),((t=collab.doc).collaborator||(t.collaborator={}))[o.key]?void 0:collab.doc.submitOp([{p:["collaborator",o.key],oi:(t={key:o.key,displayname:o.displayname,guest:o.guest},t.jointime=(new Date).getTime(),t)}])},exit:function(o){var t;if(collab.doc&&collab.doc.data)return((t=collab.doc.data).collaborator||(t.collaborator={}))[o.key]?(collab.editor.collaborator.remove(o,o.key),collab.doc.submitOp([{p:["collaborator",o.key],od:collab.doc.data.collaborator[o.key]}])):void 0}},init:function(o,t,e){var r,n,i,l,a=this;return r=[o,t],this.root=r[0],this.editor=r[1],this.root.innerHTML="",n=window.location.pathname,this.socket=new WebSocket(("http"===t.server.scheme?"ws":"wss")+"://"+t.server.domain+"/ws"),i=function(){return t.online.toggle(!1)},this.socket.readyState>=2?i():(this.socket.addEventListener("close",function(o){return 3001!==o.code?i():void 0}),this.socket.addEventListener("error",function(){return 1===a.socket.readyState?i():void 0}),this.connection=new sharedb.Connection(this.socket),this.pageid=/^\/page\//.exec(n)?n.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=l=this.connection.get("doc",this.pageid),l.on("load",function(){var o,e,r,n,i,a;if(l.data){for(o=0,r=(e=l.data.child).length;r>o;++o)n=o,i=e[o],i&&t.block.prepare(i.content,i.type,n);for(a in e=l.data.collaborator)i=e[a],t.collaborator.add(i,a)}return t.loading.toggle(!1)}),l.fetch(function(){var o;return l.type||(o=l.create({attr:{},child:[],collaborator:{}})),l.subscribe(function(o,t){return a.handle(o,t)}),l.on("op",function(o,t){return a.handle(o,t)}),collab.action.join(e)}))},handle:function(o,t){function e(o){return/inner/.exec(o.getAttribute("class"))}var r,n,i,l,a,c,d,s,u,h=[];if(o&&!t){for(r=0,n=o.length;n>r;++r)i=o[r],i.si||i.sd?(l=this.root.childNodes[i.p[1]],a=Array.from(l.childNodes).filter(e)[0],a.innerHTML=this.doc.data.child[i.p[1]].content,h.push(this.editor.block.prepare(l,l.getAttribute("base-block"),i.p[1],!0))):i.li?h.push(this.editor.block.prepare(i.li.content,i.li.type,i.p[1])):i.ld?(l=this.root.childNodes[i.p[1]],h.push(l.parentNode.removeChild(l))):null!=i.lm?(c=[i.p[1],i.lm],d=c[0],s=c[1],d!==s&&(l=this.root.childNodes[d],u=this.root.childNodes[s+(s>d?1:0)],this.root.removeChild(l),h.push(u?this.root.insertBefore(l,u):this.root.appendChild(l)))):i.oi?"collaborator"===i.p[0]&&h.push("cursor"===i.p[2]?this.editor.collaborator.update(this.doc.data.collaborator[i.p[1]],i.p[1]):this.editor.collaborator.add(i.oi,i.p[1])):i.od&&"collaborator"===i.p[0]&&h.push(this.editor.collaborator.remove(i.od,i.p[1]));return h}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var o;return o=document.querySelector("#collab-info"),o.style.left=1024+Math.round((window.innerWidth-1024)/2)+"px",o.style.right="auto"}));
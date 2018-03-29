var collab,x$;collab={action:{_info:function(o){var t,e,r,i,a;if(t=[o,collab.doc],e=t[0],r=t[1],!r||!r.data)return[];for(;e&&e.parentNode&&!e.getAttribute("base-block");)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("base-block")?(i=Array.from(e.parentNode.childNodes).indexOf(e),a=e.getAttribute("base-block"),[e,r,i,a]):[]},moveBlock:function(o,t){return collab.doc.submitOp([{p:["child",o],lm:t}])},deleteBlock:function(o){var t,e,r,i,a;return t=this._info(o),e=t[0],r=t[1],i=t[2],a=t[3],e?r.submitOp([{p:["child",i],ld:r.data.child[i]}]):void 0},insertBlock:function(o){var t,e,r,i,a;return t=this._info(o),e=t[0],r=t[1],i=t[2],a=t[3],e?r.submitOp([{p:["child",i],li:{content:this.blockContent(e),type:a}}]):void 0},blockContent:function(o){var t;return t=Array.from(o.childNodes).filter(function(o){return/inner/.exec(o.getAttribute("class"))})[0],(t||{}).innerHTML},editBlock:function(o){var t,e,r,i,a,l,n,c,d,s,u,h=[];if(t=this._info(o),e=t[0],r=t[1],i=t[2],a=t[3],e){for(l={last:(r.data.child[i]||{}).content||"",now:this.blockContent(e)},n=fastDiff(l.last,l.now),r.data.child[i]||r.submitOp([{p:["child",i],li:{content:"",type:a}}]),c=0,d=0,s=n.length;s>d;++d)u=n[d],0===u[0]?h.push(c+=u[1].length):1===u[0]?(r.submitOp([{p:["child",i,"content",c],si:u[1]}]),h.push(c+=u[1].length)):h.push(r.submitOp([{p:["child",i,"content",c],sd:u[1]}]));return h}},cursor:function(o,t){return o&&collab.doc&&collab.doc.data?collab.doc.submitOp([{p:["collaborator",o.key,"cursor"],od:collab.doc.data.collaborator[o.key].cursor,oi:t}]):void 0},join:function(o){var t;if(collab.doc&&collab.doc.data)return o||(o={displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0}),collab.editor.collaborator.add(o,o.key),((t=collab.doc).collaborator||(t.collaborator={}))[o.key]?void 0:collab.doc.submitOp([{p:["collaborator",o.key],oi:(t={key:o.key,displayname:o.displayname,guest:o.guest},t.jointime=(new Date).getTime(),t)}])},exit:function(o){var t;if(collab.doc&&collab.doc.data)return((t=collab.doc.data).collaborator||(t.collaborator={}))[o.key]?(collab.editor.collaborator.remove(o,o.key),collab.doc.submitOp([{p:["collaborator",o.key],od:collab.doc.data.collaborator[o.key]}])):void 0}},init:function(o,t,e){var r,i,a,l,n=this;return r=[o,t],this.root=r[0],this.editor=r[1],this.root.innerHTML="",i=window.location.pathname,this.socket=new WebSocket(("http"===t.server.scheme?"ws":"wss")+"://"+t.server.domain+"/ws"),a=function(){return t.online.toggle(!1)},this.socket.readyState>=2?a():(this.socket.addEventListener("close",function(o){return 3001!==o.code?a():void 0}),this.socket.addEventListener("error",function(){return 1===n.socket.readyState?a():void 0}),this.connection=new sharedb.Connection(this.socket),this.pageid=/^\/page\//.exec(i)?i.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=l=this.connection.get("doc",this.pageid),l.on("load",function(){var o,e,r,i,a,n;if(l.data){for(o=0,r=(e=l.data.child).length;r>o;++o)i=o,a=e[o],t.block.prepare(a.content,a.type,i);for(n in e=l.data.collaborator)a=e[n],t.collaborator.add(a,n)}return t.loading.toggle(!1)}),l.fetch(function(){var o;return l.type||(o=l.create({attr:{},child:[],collaborator:{}})),l.subscribe(function(o,t){return n.handle(o,t)}),l.on("op",function(o,t){return n.handle(o,t)}),collab.action.join(e)}))},handle:function(o,t){function e(o){return/inner/.exec(o.getAttribute("class"))}var r,i,a,l,n,c,d,s,u,h=[];if(o&&!t){for(r=0,i=o.length;i>r;++r)a=o[r],a.si||a.sd?(l=this.root.childNodes[a.p[1]],n=Array.from(l.childNodes).filter(e)[0],n.innerHTML=this.doc.data.child[a.p[1]].content,h.push(this.editor.block.prepare(l,l.getAttribute("base-block"),a.p[1],!0))):a.li?h.push(this.editor.block.prepare(a.li.content,a.li.type,a.p[1])):a.ld?(l=this.root.childNodes[a.p[1]],h.push(l.parentNode.removeChild(l))):null!=a.lm?(c=[a.p[1],a.lm],d=c[0],s=c[1],d!==s&&(l=this.root.childNodes[d],u=this.root.childNodes[s+(s>d?1:0)],this.root.removeChild(l),h.push(u?this.root.insertBefore(l,u):this.root.appendChild(l)))):a.oi?"collaborator"===a.p[0]&&h.push("cursor"===a.p[2]?this.editor.collaborator.update(this.doc.data.collaborator[a.p[1]],a.p[1]):this.editor.collaborator.add(a.oi,a.p[1])):a.od&&"collaborator"===a.p[0]&&h.push(this.editor.collaborator.remove(a.od,a.p[1]));return h}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var o;return o=document.querySelector("#collab-info"),o.style.left=800+Math.round((window.innerWidth-800)/2)+"px",o.style.right="auto"}));
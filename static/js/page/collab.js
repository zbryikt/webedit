function import$(t,o){var e={}.hasOwnProperty;for(var r in o)e.call(o,r)&&(t[r]=o[r]);return t}var collab,x$;collab={action:{info:function(t){var o,e,r,l,a;if(o=[t,collab.doc],e=o[0],r=o[1],!r||!r.data)return[];for(;e&&e.parentNode&&!e.getAttribute("base-block");)e=e.parentNode;return e&&e.getAttribute&&e.getAttribute("base-block")?(l=Array.from(e.parentNode.childNodes).indexOf(e),a=e.getAttribute("base-block"),[e,r,l,a]):[]},setPublic:function(t){var o,e;return o=collab.doc.data.attr,o&&o.isPublic!==t?collab.doc.submitOp([{p:["attr"],od:o,oi:(e=import$({},o),e.isPublic=t,e)}]):void 0},setThumbnail:function(t){var o,e;return null==t&&(t=null),t?(o=collab.doc,o.data.attr.thumbnail?(o.submitOp([{p:["attr","thumbnail",0],sd:o.data.attr.thumbnail}]),o.submitOp([{p:["attr","thumbnail",0],si:t}])):o.submitOp([{p:["attr"],od:o.data.attr,oi:(e=import$({},o.data.attr),e.thumbnail=t,e)}])):void 0},setTitle:function(t){return this.setTitle.handler&&(clearTimeout(this.setTitle.handler),this.setTitle.handler=null),this.setTitle.handler=setTimeout(function(){var o,e,r,l;return o=collab.doc,e=t,e||(r=Array.from(document.querySelector("#editor .inner").querySelectorAll("h1,h2,h3")),r.sort(function(t,o){return t.nodeName===o.nodeName?0:t.nodeName>o.nodeName?1:-1}),r[0]&&(e=r[0].innerText)),e||(e="untitled"),o.data.attr.title!==e?(e.length>60&&(e=e.substring(0,57)+"..."),o.data.attr.title?(o.submitOp([{p:["attr","title",0],sd:o.data.attr.title}]),o.submitOp([{p:["attr","title",0],si:e}])):o.submitOp([{p:["attr"],oi:(l=import$({},o.data.attr),l.title=e,l)}])):void 0},1e3)},moveBlock:function(t,o){return collab.doc.submitOp([{p:["child",t],lm:o}])},deleteBlock:function(t){var o,e,r,l,a;return o=this.info(t),e=o[0],r=o[1],l=o[2],a=o[3],e?r.submitOp([{p:["child",l],ld:r.data.child[l]}]):void 0},insertBlock:function(t){var o,e,r,l,a;return o=this.info(t),e=o[0],r=o[1],l=o[2],a=o[3],e?(r.submitOp([{p:["child",l],li:{content:this.blockContent(e),type:a}}]),this.setTitle()):void 0},blockContent:function(t){var o;return o=Array.from(t.childNodes).filter(function(t){return/inner/.exec(t.getAttribute("class"))})[0],o.querySelector("[auto-content]")&&(o=o.cloneNode(!0),Array.from(o.querySelectorAll("[auto-content]")).map(function(t){return Array.from(t.childNodes).map(function(o){return t.removeChild(o)})})),puredom.sanitize((o||{}).innerHTML)},strDiff:function(t,o,e){var r,l,a,i,n,c,d,s=[];for(null==t&&(t=[]),null==o&&(o=""),null==e&&(e=""),r=[collab.doc,fastDiff(o,e),0],l=r[0],a=r[1],i=r[2],n=0,c=a.length;c>n;++n)d=a[n],0===d[0]?s.push(i+=d[1].length):1===d[0]?(l.submitOp([{p:t.concat([i]),si:d[1]}]),s.push(i+=d[1].length)):s.push(l.submitOp([{p:t.concat([i]),sd:d[1]}]));return s},editStyle:function(t,o){var e,r,l,a,i,n,c,d;if(null==o&&(o=!1),e=collab.doc,r=t.getAttribute("style"),o){if(r=r.replace(/width:\d+px;?/,""),l=[e.data,[]],a=l[0],i=l[1],!a.style)return e.submitOp([{p:i,od:a,oi:(l=import$({},a),l.style=r,l)}])}else{if(l=this.info(t),n=l[0],e=l[1],c=l[2],d=l[3],!n||!e.data.child[c])return;if(l=[e.data.child[c],["child",c]],a=l[0],i=l[1],!a.style)return e.submitOp([{p:i,ld:a,li:(l=import$({},a),l.style=r,l)}])}return this.strDiff(i.concat(["style"]),a.style,r)},editBlock:function(t){var o,e,r,l,a,i,n,c;return o=this.info(t),e=o[0],r=o[1],l=o[2],a=o[3],e?(i={last:(r.data.child[l]||{}).content||"",now:this.blockContent(e)},n=fastDiff(i.last,i.now),r.data.child[l]||r.submitOp([{p:["child",l],li:{content:"",type:a,style:""}}]),c=0,this.strDiff(["child",l,"content"],i.last,i.now),this.setTitle()):void 0},cursor:function(t,o){return t&&t.key&&collab.doc&&collab.doc.data&&collab.doc.data.collaborator&&collab.doc.data.collaborator[t.key]?collab.doc.submitOp([{p:["collaborator",t.key,"cursor"],od:collab.doc.data.collaborator[t.key].cursor,oi:o}]):void 0},join:function(t){var o;if(collab.doc&&collab.doc.data&&collab.doc.collaborator&&(t||(t={displayname:"guest",key:Math.random().toString(16).substring(2),guest:!0}),!collab.doc.collaborator[t.key]))return this.join.user=t,collab.editor.collaborator.add(t,t.key),((o=collab.doc).collaborator||(o.collaborator={}))[t.key]?void 0:collab.doc.submitOp([{p:["collaborator",t.key],oi:(o={key:t.key,displayname:t.displayname,guest:t.guest},o.jointime=(new Date).getTime(),o)}])},exit:function(t){return!t&&this.join.user&&(t=this.join.user.key),t&&collab.doc&&collab.doc.data&&collab.doc.data.collaborator&&collab.doc.data.collaborator[t]?(collab.editor.collaborator.remove(t),collab.doc.submitOp([{p:["collaborator",t],od:collab.doc.data.collaborator[t]}])):void 0}},init:function(t,o,e){var r,l,a,i,n=this;return r=[t,o],this.root=r[0],this.editor=r[1],this.root.innerHTML="",l=window.location.pathname,this.socket=new WebSocket(("http"===o.server.scheme?"ws":"wss")+"://"+o.server.domain+"/ws"),a=function(){return o.online.toggle(!1)},this.socket.readyState>=2?a():(this.socket.addEventListener("close",function(t){return 3001!==t.code?a():void 0}),this.socket.addEventListener("error",function(){return 1===n.socket.readyState?a():void 0}),this.connection=new sharedb.Connection(this.socket),this.pageid=/^\/page\//.exec(l)?l.replace(/^\/page\//,"").replace(/\/$/,""):null,this.doc=i=this.connection.get("doc",this.pageid),i.on("load",function(){var t,e,r,l,a,n;if(i.data){for(t=0,r=(e=i.data.child).length;r>t;++t)l=t,a=e[t],a&&o.block.prepare(a.content,{name:a.type,idx:l,redo:!1,style:a.style||""});o.block.init();for(n in e=i.data.collaborator)a=e[n],o.collaborator.add(a,n);o.page.prepare(i.data)}return o.loading.toggle(!1)}),i.fetch(function(){var t;return i.type||(t=i.create({attr:{},style:{},child:[],collaborator:{}})),i.subscribe(function(t,o){return n.handle(t,o)}),i.on("op",function(t,o){return n.handle(t,o)}),collab.action.join(e)}))},handle:function(t,o){var e,r,l,a,i,n,c,d,s=[];if(t&&!o){for(e=0,r=t.length;r>e;++e)l=t[e],l.si||l.sd?"style"===l.p[2]?(a=this.root.childNodes[l.p[1]],s.push(a.style=this.doc.data.child[l.p[1]].style||"")):"style"===l.p[0]?s.push(this.root.style=this.doc.data.style||""):"attr"===l.p[0]||"child"===l.p[0]&&"content"===l.p[2]&&4===l.p.length&&(a=this.root.childNodes[l.p[1]],s.push(this.editor.block.prepareAsync(a,{name:a.getAttribute("base-block"),idx:l.p[1],redo:!0,content:this.doc.data.child[l.p[1]].content}))):l.li?s.push(this.editor.block.prepare(l.li.content,{name:l.li.type,idx:l.p[1],redo:!1,style:l.li.style})):l.ld?(a=this.root.childNodes[l.p[1]],s.push(a.parentNode.removeChild(a))):null!=l.lm?(i=[l.p[1],l.lm],n=i[0],c=i[1],n!==c&&(a=this.root.childNodes[n],d=this.root.childNodes[c+(c>n?1:0)],this.root.removeChild(a),s.push(d?this.root.insertBefore(a,d):this.root.appendChild(a)))):l.oi?"collaborator"===l.p[0]?s.push("cursor"===l.p[2]?this.editor.collaborator.update(this.doc.data.collaborator[l.p[1]],l.p[1]):this.editor.collaborator.add(l.oi,l.p[1])):"attr"===l.p[0]&&s.push(collab.editor.page.share.setPublic(this.doc.data.attr.isPublic)):l.od&&"collaborator"===l.p[0]&&s.push(this.editor.collaborator.remove(l.od,l.p[1]));return s}}},x$=angular.module("webedit"),x$.service("collaborate",["$rootScope"].concat(function(){return collab})),x$.controller("collabInfo",["$scope","$http"].concat(function(){var t;return t=document.querySelector("#collab-info"),t.style.left=1024+Math.round((window.innerWidth-1024)/2)+"px",t.style.right="auto"}));
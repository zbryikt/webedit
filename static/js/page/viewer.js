function import$(t,r){var a={}.hasOwnProperty;for(var e in r)a.call(r,e)&&(t[e]=r[e]);return t}var blocksManager,slice$=[].slice;blocksManager={code:{hash:{},add:function(t,r){var a;return a={},r(a),this.hash[t]=a.exports},wrap:function(){var t,r,a,e,n,s,i=[];for(t=arguments[0],r=slice$.call(arguments,1),t.length||(t=[t]),a=0,e=t.length;e>a;++a)n=t[a],s=this.hash[n.getAttribute("base-block")],s&&s.wrap&&s.wrap.apply(s,[n].concat(r));for(a=0,e=t.length;e>a;++a)n=t[a],s=this.hash[n.getAttribute("base-block")],s&&s.handle&&s.handle.change&&i.push(s.handle.change.apply(s,[n,t,!0].concat(r)));return i},libs:{},loadLibrary:function(t){var r,a,e,n,s,i,h,c,l;for(r={},Array.isArray(t)||(t=[t]),a=0,e=t.length;e>a;++a){n=t[a];for(s in i=(this.hash[n]||{}).library||{})h=i[s],r[h]=!0}for(c in r)l=document.createElement("script"),l.setAttribute("type","text/javascript"),l.setAttribute("src",c),document.body.appendChild(l);return import$(this.libs,r)}}};
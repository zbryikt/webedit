function import$(r,t){var a={}.hasOwnProperty;for(var e in t)a.call(t,e)&&(r[e]=t[e]);return r}var blocksManager;blocksManager={code:{hash:{},add:function(r,t){var a;return a={},t(a),this.hash[r]=a.exports},wrap:function(r,t){var a,e,n,i,s=[];for(null==t&&(t=!1),r.length||(r=[r]),a=0,e=r.length;e>a;++a)n=r[a],i=this.hash[n.getAttribute("base-block")],i&&i.wrap&&s.push(i.wrap(n,t));return s},libs:{},loadLibrary:function(r){var t,a,e,n,i,s,o,h,l;for(t={},Array.isArray(r)||(r=[r]),a=0,e=r.length;e>a;++a){n=r[a];for(i in s=(this.hash[n]||{}).library||{})o=s[i],t[o]=!0}for(h in t)l=document.createElement("script"),l.setAttribute("type","text/javascript"),l.setAttribute("src",h),document.body.appendChild(l);return import$(this.libs,t)}}};
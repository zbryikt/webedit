function import$(r,t){var a={}.hasOwnProperty;for(var e in t)a.call(t,e)&&(r[e]=t[e]);return r}var blocksManager;blocksManager={code:{hash:{},add:function(r,t){var a;return a={},t(a),this.hash[r]=a.exports},wrap:function(r){var t,a,e,n,i=[];for(r.length||(r=[r]),t=0,a=r.length;a>t;++t)e=r[t],n=this.hash[e.getAttribute("base-block")],n&&n.wrap&&i.push(n.wrap(e));return i},libs:{},loadLibrary:function(r){var t,a,e,n,i,s,o,h,c;for(t={},Array.isArray(r)||(r=[r]),a=0,e=r.length;e>a;++a){n=r[a];for(i in s=(this.hash[n]||{}).library||{})o=s[i],t[o]=!0}for(h in t)c=document.createElement("script"),c.setAttribute("type","text/javascript"),c.setAttribute("src",h),document.body.appendChild(c);return import$(this.libs,t)}}};
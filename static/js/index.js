function import$(t,n){var e={}.hasOwnProperty;for(var i in n)e.call(n,i)&&(t[i]=n[i]);return t}var x$;x$=angular.module("webedit",["ldBase","backend"]),x$.factory("httpRequestInterceptor",["global"].concat(function(t){return{request:function(n){return n.headers["X-CSRF-Token"]=t.csrfToken,n}}})),x$.config(["$compileProvider","$httpProvider"].concat(function(t,n){return t.aHrefSanitizationWhitelist(/^\s*(blob:|http:\/\/localhost)|https:\/\/makeweb.io\//),n.interceptors.push("httpRequestInterceptor")})),x$.controller("site",["$scope","$http","$interval","global","ldBase","ldNotify","initWrap"].concat(function(t,n,e,i,r,o,a){return a=a(),import$(t,r),t.notifications=o.queue,t.staticMode=i["static"],t.$watch("user.data",function(n){return n&&n.key?(t.track("uv/"+n.key,(new Date).toISOString().substring(0,10)+"",window.location.pathname),ga("set","dimension1",n.key)):void 0},!0),t.user={data:i.user},t.needlogin=function(n,e){return(t.user.data?Promise.resolve():t.auth.prompt()).then(function(){return window.location.href=((e?window.location.pathname+"/":"")+n).replace(/\/\//g,"/")})["catch"](function(){})},t.auth=a({init:function(){var n=this;return t.$watch("auth.ctrl.toggled",function(){return n.error={}})},email:"",displayname:"",passwd:"",stick:!1,subscribe:!0,config:{dismissOnEnter:!1,finish:function(){return t.auth.login()}},verify:function(){return this.error={},/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.[a-z]{2,}|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.exec(this.email)?this.isSignIn||this.displayname&&!(this.displayname.length<3)?!this.passwd||this.passwd.length<4?this.error.passwd="it's too weak!":0:this.error.displayname="it's too short":this.error.email="this is not an email"},logout:function(){return console.log("logout.."),n({url:"/u/logout",method:"GET"}).success(function(){return console.log("logouted."),t.user.data=null,window.location.reload()}).error(function(){return o.send("danger","Failed to Logout. ")})},login:function(){var e,i=this;if(!this.verify())return this.loading=!0,e={newsletter:this.subscribe},n({url:this.isSignIn?"/u/login":"/u/signup",method:"POST",data:$.param(import$({email:this.email,passwd:this.passwd,displayname:this.displayname},this.isSignIn?{}:{config:e})),headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}})["finally"](function(){return i.loading=!1}).then(function(n){return t.user.data=n.data,ga("set","&uid",n.key),i.ctrl.toggle(!1),t.nexturl?window.location.href=t.nexturl:"/u/login"===window.location.pathname?window.location.href="/":void 0})["catch"](function(t){return 403===t.status?i.isSignIn?i.error.passwd="wrong password":i.error.email="this email is used before.":i.error.email="system busy, try again later."}),this.passwd=""}}),a.run(),console.log("site script initialized")}));
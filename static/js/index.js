function import$(t,n){var i={}.hasOwnProperty;for(var e in n)i.call(n,e)&&(t[e]=n[e]);return t}var x$;x$=angular.module("webedit",["ldBase","backend","ldColorPicker","ngAnimate"]),x$.config(["$animateProvider"].concat(function(t){return t.classNameFilter(/ng-animate-on/)})),x$.factory("httpRequestInterceptor",["global"].concat(function(t){return{request:function(n){return n.headers["X-CSRF-Token"]=t.csrfToken,n}}})),x$.config(["$compileProvider","$httpProvider"].concat(function(t,n){return t.aHrefSanitizationWhitelist(/^\s*(blob:|http:\/\/localhost)|https?:\/\/makeweb.(io|local)\//),n.interceptors.push("httpRequestInterceptor")})),x$.controller("authPage",["$scope"].concat(function(t){return t.user.data&&t.user.data.key?window.location.href=t.neturl||"/":void 0})),x$.controller("site",["$scope","$http","$interval","global","ldBase","ldNotify","initWrap","tappay"].concat(function(t,n,i,e,r,o,a,s){return a=a(),import$(t,r),t.notifications=o.queue,t.staticMode=e["static"],t.$watch("user.data",function(n){return n&&n.key?(t.track("uv/"+n.key,(new Date).toISOString().substring(0,10)+"",window.location.pathname),gtag("config","GA_TRACKING_ID",{user_id:n.key})):void 0},!0),t.user={data:e.user},t.user.data||n({url:"/u/login/guest",method:"POST"}).then(function(n){return t.user.data=n.data}),t.needlogin=function(n,i,e){var r;return null==e&&(e={}),r=!(t.user.data&&t.user.data.key),r&&e.authInPage?window.location.href="/u/login/?nexturl="+n:(r?t.auth.prompt():Promise.resolve()).then(function(){return window.location.href=((i?window.location.pathname+"/":"")+n).replace(/\/\//g,"/")})["catch"](function(){})},t.auth=a({init:function(){var n,i,e=this;return n=/nexturl=([^&#]+)/.exec(window.location.search),(i=n)&&(t.nexturl=i[1]),t.$watch("auth.ctrl.toggled",function(){return e.error={}})},email:"",displayname:"",passwd:"",stick:!1,subscribe:!0,config:{dismissOnEnter:!1,finish:function(){return t.auth.login()}},sync:function(){return n({url:"/d/me/sync/",method:"POST"}).then(function(n){var i;return i=n.data,import$(t.user.data,i)})},verify:function(){return this.error={},/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.[a-z]{2,}|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.exec(this.email)?this.isSignIn||this.displayname&&!(this.displayname.length<3)?!this.passwd||this.passwd.length<4?this.error.passwd="it's too weak!":0:this.error.displayname="it's too short":this.error.email="this is not an email"},logout:function(){return console.log("logout.."),n({url:"/u/logout",method:"GET"}).success(function(){return console.log("logouted."),t.user.data=null,window.location.reload()}).error(function(){return o.send("danger","Failed to Logout. ")})},login:function(){var i,e=this;if(!this.verify())return this.loading=!0,i={newsletter:this.subscribe},n({url:this.isSignIn?"/u/login":"/u/signup",method:"POST",data:$.param(import$({email:this.email,passwd:this.passwd,displayname:this.displayname},this.isSignIn?{}:{config:i})),headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"}})["finally"](function(){return e.loading=!1}).then(function(n){return t.user.data=n.data,gtag("config","GA_TRACKING_ID",{user_id:n.key}),e.ctrl.toggle(!1),t.nexturl?window.location.href=t.nexturl:"/u/login"===window.location.pathname?window.location.href="/":void 0})["catch"](function(t){return 403===t.status?e.isSignIn?e.error.passwd="wrong password":e.error.email="this email is used before.":e.error.email="system busy, try again later."}),this.passwd=""}}),t.nav=a({node:null,init:function(){var t;return t=document.querySelector("#nav-top nav"),t&&t.classList.contains("do-invert")?window.addEventListener("scroll",function(){var n;return n=window.pageYOffset,n>60?t.classList.add("invert"):t.classList.remove("invert")}):void 0}}),t.subscription={modal:{pay:{},plan:{},thanks:{},cc:{payinfo:{invoice:{donate:!0}},action:function(n){return t.subscription.loading=!0,t.subscription.tappay({payinfo:n}).then(function(){return t.subscription.loading=!1})},config:{action:"Subscribe with Credit Card"}}},cancel:function(){if(!t.subscription.loading)return t.subscription.loading=!0,n({url:"/d/subscribe",method:"DELETE"})["finally"](function(){return $timeout(function(){return t.subscription.loading=!1,window.location.reload()},1e3)}).then(function(){return o.success("subscription cancelled")})["catch"](function(){return o.danger("failed to cancel. try later?")})},tappay:function(i){var e;return e=i.payinfo,t.subscription.loading=!0,s.init(),s.getPrime(e)["finally"](function(){return t.force$apply(function(){return t.subscription.loading=!1})}).then(function(i){return t.force$apply(function(){var r;return r={url:"/d/subscribe/",method:"POST",data:{invoice:e.invoice?e.invoice:void 0,gateway:"tappay",detail:i,plan:t.subscription.getFullPlan()}},n(r)}).then(function(){return t.auth.sync()})["catch"](function(n){return t.force$apply(function(){return n&&409===n.status?(o.send("warning","you have subscribed before. try reloading..."),$timeout(function(){return window.location.reload()},1e3)):o.send("danger","can't subscribe now. try later?")})})})},getFullPlan:function(){return this.period+"-"+this.plan+"-"+(this.modifier||1)},plan:"advanced",period:"monthly",price:{monthly:{advanced:12,pro:24},yearly:{advanced:9,pro:18}},update:function(){return this.payModal.config.action="Subscribe via Credit Card"},setPlan:function(t){return this.plan=t,this.update()},setPeriod:function(t){return this.period=t,this.update()},toggle:{choose:function(){},plan:function(){return t.subscription.modal.plan.ctrl.toggle()},pay:function(n){var i,e;return t.subscription.plan=n,t.subscription.modal.plan.ctrl.toggle(!1),i=((e=t.user).data||(e.data={})).key?Promise.resolve():t.auth.prompt(),i.then(function(){var n;return((n=t.user).data||(n.data={})).key?t.subscription.modal.pay.ctrl.prompt():Promise.reject()}).then(function(){return t.subscription.modal.thanks.ctrl.toggle()})["catch"](function(){})}}},a.run(),console.log("site script initialized")}));
(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){var DIFF_DELETE=-1;var DIFF_INSERT=1;var DIFF_EQUAL=0;function diff_main(text1,text2,cursor_pos){if(text1==text2){if(text1){return[[DIFF_EQUAL,text1]]}return[]}if(cursor_pos<0||text1.length<cursor_pos){cursor_pos=null}var commonlength=diff_commonPrefix(text1,text2);var commonprefix=text1.substring(0,commonlength);text1=text1.substring(commonlength);text2=text2.substring(commonlength);commonlength=diff_commonSuffix(text1,text2);var commonsuffix=text1.substring(text1.length-commonlength);text1=text1.substring(0,text1.length-commonlength);text2=text2.substring(0,text2.length-commonlength);var diffs=diff_compute_(text1,text2);if(commonprefix){diffs.unshift([DIFF_EQUAL,commonprefix])}if(commonsuffix){diffs.push([DIFF_EQUAL,commonsuffix])}diff_cleanupMerge(diffs);if(cursor_pos!=null){diffs=fix_cursor(diffs,cursor_pos)}diffs=fix_emoji(diffs);return diffs}function diff_compute_(text1,text2){var diffs;if(!text1){return[[DIFF_INSERT,text2]]}if(!text2){return[[DIFF_DELETE,text1]]}var longtext=text1.length>text2.length?text1:text2;var shorttext=text1.length>text2.length?text2:text1;var i=longtext.indexOf(shorttext);if(i!=-1){diffs=[[DIFF_INSERT,longtext.substring(0,i)],[DIFF_EQUAL,shorttext],[DIFF_INSERT,longtext.substring(i+shorttext.length)]];if(text1.length>text2.length){diffs[0][0]=diffs[2][0]=DIFF_DELETE}return diffs}if(shorttext.length==1){return[[DIFF_DELETE,text1],[DIFF_INSERT,text2]]}var hm=diff_halfMatch_(text1,text2);if(hm){var text1_a=hm[0];var text1_b=hm[1];var text2_a=hm[2];var text2_b=hm[3];var mid_common=hm[4];var diffs_a=diff_main(text1_a,text2_a);var diffs_b=diff_main(text1_b,text2_b);return diffs_a.concat([[DIFF_EQUAL,mid_common]],diffs_b)}return diff_bisect_(text1,text2)}function diff_bisect_(text1,text2){var text1_length=text1.length;var text2_length=text2.length;var max_d=Math.ceil((text1_length+text2_length)/2);var v_offset=max_d;var v_length=2*max_d;var v1=new Array(v_length);var v2=new Array(v_length);for(var x=0;x<v_length;x++){v1[x]=-1;v2[x]=-1}v1[v_offset+1]=0;v2[v_offset+1]=0;var delta=text1_length-text2_length;var front=delta%2!=0;var k1start=0;var k1end=0;var k2start=0;var k2end=0;for(var d=0;d<max_d;d++){for(var k1=-d+k1start;k1<=d-k1end;k1+=2){var k1_offset=v_offset+k1;var x1;if(k1==-d||k1!=d&&v1[k1_offset-1]<v1[k1_offset+1]){x1=v1[k1_offset+1]}else{x1=v1[k1_offset-1]+1}var y1=x1-k1;while(x1<text1_length&&y1<text2_length&&text1.charAt(x1)==text2.charAt(y1)){x1++;y1++}v1[k1_offset]=x1;if(x1>text1_length){k1end+=2}else if(y1>text2_length){k1start+=2}else if(front){var k2_offset=v_offset+delta-k1;if(k2_offset>=0&&k2_offset<v_length&&v2[k2_offset]!=-1){var x2=text1_length-v2[k2_offset];if(x1>=x2){return diff_bisectSplit_(text1,text2,x1,y1)}}}}for(var k2=-d+k2start;k2<=d-k2end;k2+=2){var k2_offset=v_offset+k2;var x2;if(k2==-d||k2!=d&&v2[k2_offset-1]<v2[k2_offset+1]){x2=v2[k2_offset+1]}else{x2=v2[k2_offset-1]+1}var y2=x2-k2;while(x2<text1_length&&y2<text2_length&&text1.charAt(text1_length-x2-1)==text2.charAt(text2_length-y2-1)){x2++;y2++}v2[k2_offset]=x2;if(x2>text1_length){k2end+=2}else if(y2>text2_length){k2start+=2}else if(!front){var k1_offset=v_offset+delta-k2;if(k1_offset>=0&&k1_offset<v_length&&v1[k1_offset]!=-1){var x1=v1[k1_offset];var y1=v_offset+x1-k1_offset;x2=text1_length-x2;if(x1>=x2){return diff_bisectSplit_(text1,text2,x1,y1)}}}}}return[[DIFF_DELETE,text1],[DIFF_INSERT,text2]]}function diff_bisectSplit_(text1,text2,x,y){var text1a=text1.substring(0,x);var text2a=text2.substring(0,y);var text1b=text1.substring(x);var text2b=text2.substring(y);var diffs=diff_main(text1a,text2a);var diffsb=diff_main(text1b,text2b);return diffs.concat(diffsb)}function diff_commonPrefix(text1,text2){if(!text1||!text2||text1.charAt(0)!=text2.charAt(0)){return 0}var pointermin=0;var pointermax=Math.min(text1.length,text2.length);var pointermid=pointermax;var pointerstart=0;while(pointermin<pointermid){if(text1.substring(pointerstart,pointermid)==text2.substring(pointerstart,pointermid)){pointermin=pointermid;pointerstart=pointermin}else{pointermax=pointermid}pointermid=Math.floor((pointermax-pointermin)/2+pointermin)}return pointermid}function diff_commonSuffix(text1,text2){if(!text1||!text2||text1.charAt(text1.length-1)!=text2.charAt(text2.length-1)){return 0}var pointermin=0;var pointermax=Math.min(text1.length,text2.length);var pointermid=pointermax;var pointerend=0;while(pointermin<pointermid){if(text1.substring(text1.length-pointermid,text1.length-pointerend)==text2.substring(text2.length-pointermid,text2.length-pointerend)){pointermin=pointermid;pointerend=pointermin}else{pointermax=pointermid}pointermid=Math.floor((pointermax-pointermin)/2+pointermin)}return pointermid}function diff_halfMatch_(text1,text2){var longtext=text1.length>text2.length?text1:text2;var shorttext=text1.length>text2.length?text2:text1;if(longtext.length<4||shorttext.length*2<longtext.length){return null}function diff_halfMatchI_(longtext,shorttext,i){var seed=longtext.substring(i,i+Math.floor(longtext.length/4));var j=-1;var best_common="";var best_longtext_a,best_longtext_b,best_shorttext_a,best_shorttext_b;while((j=shorttext.indexOf(seed,j+1))!=-1){var prefixLength=diff_commonPrefix(longtext.substring(i),shorttext.substring(j));var suffixLength=diff_commonSuffix(longtext.substring(0,i),shorttext.substring(0,j));if(best_common.length<suffixLength+prefixLength){best_common=shorttext.substring(j-suffixLength,j)+shorttext.substring(j,j+prefixLength);best_longtext_a=longtext.substring(0,i-suffixLength);best_longtext_b=longtext.substring(i+prefixLength);best_shorttext_a=shorttext.substring(0,j-suffixLength);best_shorttext_b=shorttext.substring(j+prefixLength)}}if(best_common.length*2>=longtext.length){return[best_longtext_a,best_longtext_b,best_shorttext_a,best_shorttext_b,best_common]}else{return null}}var hm1=diff_halfMatchI_(longtext,shorttext,Math.ceil(longtext.length/4));var hm2=diff_halfMatchI_(longtext,shorttext,Math.ceil(longtext.length/2));var hm;if(!hm1&&!hm2){return null}else if(!hm2){hm=hm1}else if(!hm1){hm=hm2}else{hm=hm1[4].length>hm2[4].length?hm1:hm2}var text1_a,text1_b,text2_a,text2_b;if(text1.length>text2.length){text1_a=hm[0];text1_b=hm[1];text2_a=hm[2];text2_b=hm[3]}else{text2_a=hm[0];text2_b=hm[1];text1_a=hm[2];text1_b=hm[3]}var mid_common=hm[4];return[text1_a,text1_b,text2_a,text2_b,mid_common]}function diff_cleanupMerge(diffs){diffs.push([DIFF_EQUAL,""]);var pointer=0;var count_delete=0;var count_insert=0;var text_delete="";var text_insert="";var commonlength;while(pointer<diffs.length){switch(diffs[pointer][0]){case DIFF_INSERT:count_insert++;text_insert+=diffs[pointer][1];pointer++;break;case DIFF_DELETE:count_delete++;text_delete+=diffs[pointer][1];pointer++;break;case DIFF_EQUAL:if(count_delete+count_insert>1){if(count_delete!==0&&count_insert!==0){commonlength=diff_commonPrefix(text_insert,text_delete);if(commonlength!==0){if(pointer-count_delete-count_insert>0&&diffs[pointer-count_delete-count_insert-1][0]==DIFF_EQUAL){diffs[pointer-count_delete-count_insert-1][1]+=text_insert.substring(0,commonlength)}else{diffs.splice(0,0,[DIFF_EQUAL,text_insert.substring(0,commonlength)]);pointer++}text_insert=text_insert.substring(commonlength);text_delete=text_delete.substring(commonlength)}commonlength=diff_commonSuffix(text_insert,text_delete);if(commonlength!==0){diffs[pointer][1]=text_insert.substring(text_insert.length-commonlength)+diffs[pointer][1];text_insert=text_insert.substring(0,text_insert.length-commonlength);text_delete=text_delete.substring(0,text_delete.length-commonlength)}}if(count_delete===0){diffs.splice(pointer-count_insert,count_delete+count_insert,[DIFF_INSERT,text_insert])}else if(count_insert===0){diffs.splice(pointer-count_delete,count_delete+count_insert,[DIFF_DELETE,text_delete])}else{diffs.splice(pointer-count_delete-count_insert,count_delete+count_insert,[DIFF_DELETE,text_delete],[DIFF_INSERT,text_insert])}pointer=pointer-count_delete-count_insert+(count_delete?1:0)+(count_insert?1:0)+1}else if(pointer!==0&&diffs[pointer-1][0]==DIFF_EQUAL){diffs[pointer-1][1]+=diffs[pointer][1];diffs.splice(pointer,1)}else{pointer++}count_insert=0;count_delete=0;text_delete="";text_insert="";break}}if(diffs[diffs.length-1][1]===""){diffs.pop()}var changes=false;pointer=1;while(pointer<diffs.length-1){if(diffs[pointer-1][0]==DIFF_EQUAL&&diffs[pointer+1][0]==DIFF_EQUAL){if(diffs[pointer][1].substring(diffs[pointer][1].length-diffs[pointer-1][1].length)==diffs[pointer-1][1]){diffs[pointer][1]=diffs[pointer-1][1]+diffs[pointer][1].substring(0,diffs[pointer][1].length-diffs[pointer-1][1].length);diffs[pointer+1][1]=diffs[pointer-1][1]+diffs[pointer+1][1];diffs.splice(pointer-1,1);changes=true}else if(diffs[pointer][1].substring(0,diffs[pointer+1][1].length)==diffs[pointer+1][1]){diffs[pointer-1][1]+=diffs[pointer+1][1];diffs[pointer][1]=diffs[pointer][1].substring(diffs[pointer+1][1].length)+diffs[pointer+1][1];diffs.splice(pointer+1,1);changes=true}}pointer++}if(changes){diff_cleanupMerge(diffs)}}var diff=diff_main;diff.INSERT=DIFF_INSERT;diff.DELETE=DIFF_DELETE;diff.EQUAL=DIFF_EQUAL;module.exports=diff;function cursor_normalize_diff(diffs,cursor_pos){if(cursor_pos===0){return[DIFF_EQUAL,diffs]}for(var current_pos=0,i=0;i<diffs.length;i++){var d=diffs[i];if(d[0]===DIFF_DELETE||d[0]===DIFF_EQUAL){var next_pos=current_pos+d[1].length;if(cursor_pos===next_pos){return[i+1,diffs]}else if(cursor_pos<next_pos){diffs=diffs.slice();var split_pos=cursor_pos-current_pos;var d_left=[d[0],d[1].slice(0,split_pos)];var d_right=[d[0],d[1].slice(split_pos)];diffs.splice(i,1,d_left,d_right);return[i+1,diffs]}else{current_pos=next_pos}}}throw new Error("cursor_pos is out of bounds!")}function fix_cursor(diffs,cursor_pos){var norm=cursor_normalize_diff(diffs,cursor_pos);var ndiffs=norm[1];var cursor_pointer=norm[0];var d=ndiffs[cursor_pointer];var d_next=ndiffs[cursor_pointer+1];if(d==null){return diffs}else if(d[0]!==DIFF_EQUAL){return diffs}else{if(d_next!=null&&d[1]+d_next[1]===d_next[1]+d[1]){ndiffs.splice(cursor_pointer,2,d_next,d);return merge_tuples(ndiffs,cursor_pointer,2)}else if(d_next!=null&&d_next[1].indexOf(d[1])===0){ndiffs.splice(cursor_pointer,2,[d_next[0],d[1]],[0,d[1]]);var suffix=d_next[1].slice(d[1].length);if(suffix.length>0){ndiffs.splice(cursor_pointer+2,0,[d_next[0],suffix])}return merge_tuples(ndiffs,cursor_pointer,3)}else{return diffs}}}function fix_emoji(diffs){var compact=false;var starts_with_pair_end=function(str){return str.charCodeAt(0)>=56320&&str.charCodeAt(0)<=57343};var ends_with_pair_start=function(str){return str.charCodeAt(str.length-1)>=55296&&str.charCodeAt(str.length-1)<=56319};for(var i=2;i<diffs.length;i+=1){if(diffs[i-2][0]===DIFF_EQUAL&&ends_with_pair_start(diffs[i-2][1])&&diffs[i-1][0]===DIFF_DELETE&&starts_with_pair_end(diffs[i-1][1])&&diffs[i][0]===DIFF_INSERT&&starts_with_pair_end(diffs[i][1])){compact=true;diffs[i-1][1]=diffs[i-2][1].slice(-1)+diffs[i-1][1];diffs[i][1]=diffs[i-2][1].slice(-1)+diffs[i][1];diffs[i-2][1]=diffs[i-2][1].slice(0,-1)}}if(!compact){return diffs}var fixed_diffs=[];for(var i=0;i<diffs.length;i+=1){if(diffs[i][1].length>0){fixed_diffs.push(diffs[i])}}return fixed_diffs}function merge_tuples(diffs,start,length){for(var i=start+length-1;i>=0&&i>=start-1;i--){if(i+1<diffs.length){var left_d=diffs[i];var right_d=diffs[i+1];if(left_d[0]===right_d[1]){diffs.splice(i,2,[left_d[0],left_d[1]+right_d[1]])}}}return diffs}},{}],2:[function(require,module,exports){"use strict";var construct=typeof Reflect!=="undefined"?Reflect.construct:undefined;var defineProperty=Object.defineProperty;var captureStackTrace=Error.captureStackTrace;if(captureStackTrace===undefined){captureStackTrace=function captureStackTrace(error){var container=new Error;defineProperty(error,"stack",{configurable:true,get:function getStack(){var stack=container.stack;defineProperty(this,"stack",{configurable:true,value:stack,writable:true});return stack},set:function setStack(stack){defineProperty(error,"stack",{configurable:true,value:stack,writable:true})}})}}function BaseError(message){if(message!==undefined){defineProperty(this,"message",{configurable:true,value:message,writable:true})}var cname=this.constructor.name;if(cname!==undefined&&cname!==this.name){defineProperty(this,"name",{configurable:true,value:cname,writable:true})}captureStackTrace(this,this.constructor)}BaseError.prototype=Object.create(Error.prototype,{constructor:{configurable:true,value:BaseError,writable:true}});var setFunctionName=function(){function setFunctionName(fn,name){return defineProperty(fn,"name",{configurable:true,value:name})}try{var f=function(){};setFunctionName(f,"foo");if(f.name==="foo"){return setFunctionName}}catch(_){}}();function makeError(constructor,super_){if(super_==null||super_===Error){super_=BaseError}else if(typeof super_!=="function"){throw new TypeError("super_ should be a function")}var name;if(typeof constructor==="string"){name=constructor;constructor=construct!==undefined?function(){return construct(super_,arguments,this.constructor)}:function(){super_.apply(this,arguments)};if(setFunctionName!==undefined){setFunctionName(constructor,name);name=undefined}}else if(typeof constructor!=="function"){throw new TypeError("constructor should be either a string or a function")}constructor.super_=constructor["super"]=super_;var properties={constructor:{configurable:true,value:constructor,writable:true}};if(name!==undefined){properties.name={configurable:true,value:name,writable:true}}constructor.prototype=Object.create(super_.prototype,properties);return constructor}exports=module.exports=makeError;exports.BaseError=BaseError},{}],3:[function(require,module,exports){module.exports=bootstrapTransform;function bootstrapTransform(type,transformComponent,checkValidOp,append){var transformComponentX=function(left,right,destLeft,destRight){transformComponent(destLeft,left,right,"left");transformComponent(destRight,right,left,"right")};var transformX=type.transformX=function(leftOp,rightOp){checkValidOp(leftOp);checkValidOp(rightOp);var newRightOp=[];for(var i=0;i<rightOp.length;i++){var rightComponent=rightOp[i];var newLeftOp=[];var k=0;while(k<leftOp.length){var nextC=[];transformComponentX(leftOp[k],rightComponent,newLeftOp,nextC);k++;if(nextC.length===1){rightComponent=nextC[0]}else if(nextC.length===0){for(var j=k;j<leftOp.length;j++){append(newLeftOp,leftOp[j])}rightComponent=null;break}else{var pair=transformX(leftOp.slice(k),nextC);for(var l=0;l<pair[0].length;l++){append(newLeftOp,pair[0][l])}for(var r=0;r<pair[1].length;r++){append(newRightOp,pair[1][r])}rightComponent=null;break}}if(rightComponent!=null){append(newRightOp,rightComponent)}leftOp=newLeftOp}return[leftOp,newRightOp]};type.transform=function(op,otherOp,type){if(!(type==="left"||type==="right"))throw new Error("type must be 'left' or 'right'");if(otherOp.length===0)return op;if(op.length===1&&otherOp.length===1)return transformComponent([],op[0],otherOp[0],type);if(type==="left")return transformX(op,otherOp)[0];else return transformX(otherOp,op)[1]}}},{}],4:[function(require,module,exports){module.exports={type:require("./json0")}},{"./json0":5}],5:[function(require,module,exports){var isArray=function(obj){return Object.prototype.toString.call(obj)=="[object Array]"};var isObject=function(obj){return!!obj&&obj.constructor===Object};var clone=function(o){return JSON.parse(JSON.stringify(o))};var json={name:"json0",uri:"http://sharejs.org/types/JSONv0"};var subtypes={};json.registerSubtype=function(subtype){subtypes[subtype.name]=subtype};json.create=function(data){return data===undefined?null:clone(data)};json.invertComponent=function(c){var c_={p:c.p};if(c.t&&subtypes[c.t]){c_.t=c.t;c_.o=subtypes[c.t].invert(c.o)}if(c.si!==void 0)c_.sd=c.si;if(c.sd!==void 0)c_.si=c.sd;if(c.oi!==void 0)c_.od=c.oi;if(c.od!==void 0)c_.oi=c.od;if(c.li!==void 0)c_.ld=c.li;if(c.ld!==void 0)c_.li=c.ld;if(c.na!==void 0)c_.na=-c.na;if(c.lm!==void 0){c_.lm=c.p[c.p.length-1];c_.p=c.p.slice(0,c.p.length-1).concat([c.lm])}return c_};json.invert=function(op){var op_=op.slice().reverse();var iop=[];for(var i=0;i<op_.length;i++){iop.push(json.invertComponent(op_[i]))}return iop};json.checkValidOp=function(op){for(var i=0;i<op.length;i++){if(!isArray(op[i].p))throw new Error("Missing path")}};json.checkList=function(elem){if(!isArray(elem))throw new Error("Referenced element not a list")};json.checkObj=function(elem){if(!isObject(elem)){throw new Error("Referenced element not an object (it was "+JSON.stringify(elem)+")")}};function convertFromText(c){c.t="text0";var o={p:c.p.pop()};if(c.si!=null)o.i=c.si;if(c.sd!=null)o.d=c.sd;c.o=[o]}function convertToText(c){c.p.push(c.o[0].p);if(c.o[0].i!=null)c.si=c.o[0].i;if(c.o[0].d!=null)c.sd=c.o[0].d;delete c.t;delete c.o}json.apply=function(snapshot,op){json.checkValidOp(op);op=clone(op);var container={data:snapshot};for(var i=0;i<op.length;i++){var c=op[i];if(c.si!=null||c.sd!=null)convertFromText(c);var parent=null;var parentKey=null;var elem=container;var key="data";for(var j=0;j<c.p.length;j++){var p=c.p[j];parent=elem;parentKey=key;elem=elem[key];key=p;if(parent==null)throw new Error("Path invalid")}if(c.t&&c.o!==void 0&&subtypes[c.t]){elem[key]=subtypes[c.t].apply(elem[key],c.o)}else if(c.na!==void 0){if(typeof elem[key]!="number")throw new Error("Referenced element not a number");elem[key]+=c.na}else if(c.li!==void 0&&c.ld!==void 0){json.checkList(elem);elem[key]=c.li}else if(c.li!==void 0){json.checkList(elem);elem.splice(key,0,c.li)}else if(c.ld!==void 0){json.checkList(elem);elem.splice(key,1)}else if(c.lm!==void 0){json.checkList(elem);if(c.lm!=key){var e=elem[key];elem.splice(key,1);elem.splice(c.lm,0,e)}}else if(c.oi!==void 0){json.checkObj(elem);elem[key]=c.oi}else if(c.od!==void 0){json.checkObj(elem);delete elem[key]}else{throw new Error("invalid / missing instruction in op")}}return container.data};json.shatter=function(op){var results=[];for(var i=0;i<op.length;i++){results.push([op[i]])}return results};json.incrementalApply=function(snapshot,op,_yield){for(var i=0;i<op.length;i++){var smallOp=[op[i]];snapshot=json.apply(snapshot,smallOp);_yield(smallOp,snapshot)}return snapshot};var pathMatches=json.pathMatches=function(p1,p2,ignoreLast){if(p1.length!=p2.length)return false;for(var i=0;i<p1.length;i++){if(p1[i]!==p2[i]&&(!ignoreLast||i!==p1.length-1))return false}return true};json.append=function(dest,c){c=clone(c);if(dest.length===0){dest.push(c);return}var last=dest[dest.length-1];if((c.si!=null||c.sd!=null)&&(last.si!=null||last.sd!=null)){convertFromText(c);convertFromText(last)}if(pathMatches(c.p,last.p)){if(c.t&&last.t&&c.t===last.t&&subtypes[c.t]){last.o=subtypes[c.t].compose(last.o,c.o);if(c.si!=null||c.sd!=null){var p=c.p;for(var i=0;i<last.o.length-1;i++){c.o=[last.o.pop()];c.p=p.slice();convertToText(c);dest.push(c)}convertToText(last)}}else if(last.na!=null&&c.na!=null){dest[dest.length-1]={p:last.p,na:last.na+c.na}}else if(last.li!==undefined&&c.li===undefined&&c.ld===last.li){if(last.ld!==undefined){delete last.li}else{dest.pop()}}else if(last.od!==undefined&&last.oi===undefined&&c.oi!==undefined&&c.od===undefined){last.oi=c.oi}else if(last.oi!==undefined&&c.od!==undefined){if(c.oi!==undefined){last.oi=c.oi}else if(last.od!==undefined){delete last.oi}else{dest.pop()}}else if(c.lm!==undefined&&c.p[c.p.length-1]===c.lm){}else{dest.push(c)}}else{if((c.si!=null||c.sd!=null)&&(last.si!=null||last.sd!=null)){convertToText(c);convertToText(last)}dest.push(c)}};json.compose=function(op1,op2){json.checkValidOp(op1);json.checkValidOp(op2);var newOp=clone(op1);for(var i=0;i<op2.length;i++){json.append(newOp,op2[i])}return newOp};json.normalize=function(op){var newOp=[];op=isArray(op)?op:[op];for(var i=0;i<op.length;i++){var c=op[i];if(c.p==null)c.p=[];json.append(newOp,c)}return newOp};json.commonLengthForOps=function(a,b){var alen=a.p.length;var blen=b.p.length;if(a.na!=null||a.t)alen++;if(b.na!=null||b.t)blen++;if(alen===0)return-1;if(blen===0)return null;alen--;blen--;for(var i=0;i<alen;i++){var p=a.p[i];if(i>=blen||p!==b.p[i])return null}return alen};json.canOpAffectPath=function(op,path){return json.commonLengthForOps({p:path},op)!=null};json.transformComponent=function(dest,c,otherC,type){c=clone(c);var common=json.commonLengthForOps(otherC,c);var common2=json.commonLengthForOps(c,otherC);var cplength=c.p.length;var otherCplength=otherC.p.length;if(c.na!=null||c.t)cplength++;if(otherC.na!=null||otherC.t)otherCplength++;if(common2!=null&&otherCplength>cplength&&c.p[common2]==otherC.p[common2]){if(c.ld!==void 0){var oc=clone(otherC);oc.p=oc.p.slice(cplength);c.ld=json.apply(clone(c.ld),[oc])}else if(c.od!==void 0){var oc=clone(otherC);oc.p=oc.p.slice(cplength);c.od=json.apply(clone(c.od),[oc])}}if(common!=null){var commonOperand=cplength==otherCplength;var oc=otherC;if((c.si!=null||c.sd!=null)&&(otherC.si!=null||otherC.sd!=null)){convertFromText(c);oc=clone(otherC);convertFromText(oc)}if(oc.t&&subtypes[oc.t]){if(c.t&&c.t===oc.t){var res=subtypes[c.t].transform(c.o,oc.o,type);if(c.si!=null||c.sd!=null){var p=c.p;for(var i=0;i<res.length;i++){c.o=[res[i]];c.p=p.slice();convertToText(c);json.append(dest,c)}}else if(!isArray(res)||res.length>0){c.o=res;json.append(dest,c)}return dest}}else if(otherC.na!==void 0){}else if(otherC.li!==void 0&&otherC.ld!==void 0){if(otherC.p[common]===c.p[common]){if(!commonOperand){return dest}else if(c.ld!==void 0){if(c.li!==void 0&&type==="left"){c.ld=clone(otherC.li)}else{return dest}}}}else if(otherC.li!==void 0){if(c.li!==void 0&&c.ld===undefined&&commonOperand&&c.p[common]===otherC.p[common]){if(type==="right")c.p[common]++}else if(otherC.p[common]<=c.p[common]){c.p[common]++}if(c.lm!==void 0){if(commonOperand){if(otherC.p[common]<=c.lm)c.lm++}}}else if(otherC.ld!==void 0){if(c.lm!==void 0){if(commonOperand){if(otherC.p[common]===c.p[common]){return dest}var p=otherC.p[common];var from=c.p[common];var to=c.lm;if(p<to||p===to&&from<to)c.lm--}}if(otherC.p[common]<c.p[common]){c.p[common]--}else if(otherC.p[common]===c.p[common]){if(otherCplength<cplength){return dest}else if(c.ld!==void 0){if(c.li!==void 0){delete c.ld}else{return dest}}}}else if(otherC.lm!==void 0){if(c.lm!==void 0&&cplength===otherCplength){var from=c.p[common];var to=c.lm;var otherFrom=otherC.p[common];var otherTo=otherC.lm;if(otherFrom!==otherTo){if(from===otherFrom){if(type==="left"){c.p[common]=otherTo;if(from===to)c.lm=otherTo}else{return dest}}else{if(from>otherFrom)c.p[common]--;if(from>otherTo)c.p[common]++;else if(from===otherTo){if(otherFrom>otherTo){c.p[common]++;if(from===to)c.lm++}}if(to>otherFrom){c.lm--}else if(to===otherFrom){if(to>from)c.lm--}if(to>otherTo){c.lm++}else if(to===otherTo){if(otherTo>otherFrom&&to>from||otherTo<otherFrom&&to<from){if(type==="right")c.lm++}else{if(to>from)c.lm++;else if(to===otherFrom)c.lm--}}}}}else if(c.li!==void 0&&c.ld===undefined&&commonOperand){var from=otherC.p[common];var to=otherC.lm;p=c.p[common];if(p>from)c.p[common]--;if(p>to)c.p[common]++}else{var from=otherC.p[common];var to=otherC.lm;p=c.p[common];if(p===from){c.p[common]=to}else{if(p>from)c.p[common]--;if(p>to)c.p[common]++;else if(p===to&&from>to)c.p[common]++}}}else if(otherC.oi!==void 0&&otherC.od!==void 0){if(c.p[common]===otherC.p[common]){if(c.oi!==void 0&&commonOperand){if(type==="right"){return dest}else{c.od=otherC.oi}}else{return dest}}}else if(otherC.oi!==void 0){if(c.oi!==void 0&&c.p[common]===otherC.p[common]){if(type==="left"){json.append(dest,{p:c.p,od:otherC.oi})}else{return dest}}}else if(otherC.od!==void 0){if(c.p[common]==otherC.p[common]){if(!commonOperand)return dest;if(c.oi!==void 0){delete c.od}else{return dest}}}}json.append(dest,c);return dest};require("./bootstrapTransform")(json,json.transformComponent,json.checkValidOp,json.append);var text=require("./text0");json.registerSubtype(text);module.exports=json},{"./bootstrapTransform":3,"./text0":6}],6:[function(require,module,exports){var text=module.exports={name:"text0",uri:"http://sharejs.org/types/textv0",create:function(initial){if(initial!=null&&typeof initial!=="string"){throw new Error("Initial data must be a string")}return initial||""}};var strInject=function(s1,pos,s2){return s1.slice(0,pos)+s2+s1.slice(pos)};var checkValidComponent=function(c){if(typeof c.p!=="number")throw new Error("component missing position field");if(typeof c.i==="string"===(typeof c.d==="string"))throw new Error("component needs an i or d field");if(c.p<0)throw new Error("position cannot be negative")};var checkValidOp=function(op){for(var i=0;i<op.length;i++){checkValidComponent(op[i])}};text.apply=function(snapshot,op){var deleted;checkValidOp(op);for(var i=0;i<op.length;i++){var component=op[i];if(component.i!=null){snapshot=strInject(snapshot,component.p,component.i)}else{deleted=snapshot.slice(component.p,component.p+component.d.length);if(component.d!==deleted)throw new Error("Delete component '"+component.d+"' does not match deleted text '"+deleted+"'");snapshot=snapshot.slice(0,component.p)+snapshot.slice(component.p+component.d.length)}}return snapshot};var append=text._append=function(newOp,c){if(c.i===""||c.d==="")return;if(newOp.length===0){newOp.push(c)}else{var last=newOp[newOp.length-1];if(last.i!=null&&c.i!=null&&last.p<=c.p&&c.p<=last.p+last.i.length){newOp[newOp.length-1]={i:strInject(last.i,c.p-last.p,c.i),p:last.p}}else if(last.d!=null&&c.d!=null&&c.p<=last.p&&last.p<=c.p+c.d.length){newOp[newOp.length-1]={d:strInject(c.d,last.p-c.p,last.d),p:c.p}}else{newOp.push(c)}}};text.compose=function(op1,op2){checkValidOp(op1);checkValidOp(op2);var newOp=op1.slice();for(var i=0;i<op2.length;i++){append(newOp,op2[i])}return newOp};text.normalize=function(op){var newOp=[];if(op.i!=null||op.p!=null)op=[op];for(var i=0;i<op.length;i++){var c=op[i];if(c.p==null)c.p=0;append(newOp,c)}return newOp};var transformPosition=function(pos,c,insertAfter){if(c.i!=null){if(c.p<pos||c.p===pos&&insertAfter){return pos+c.i.length}else{return pos}}else{if(pos<=c.p){return pos}else if(pos<=c.p+c.d.length){return c.p}else{return pos-c.d.length}}};text.transformCursor=function(position,op,side){var insertAfter=side==="right";for(var i=0;i<op.length;i++){position=transformPosition(position,op[i],insertAfter)}return position};var transformComponent=text._tc=function(dest,c,otherC,side){checkValidComponent(c);checkValidComponent(otherC);if(c.i!=null){append(dest,{i:c.i,p:transformPosition(c.p,otherC,side==="right")})}else{if(otherC.i!=null){var s=c.d;if(c.p<otherC.p){append(dest,{d:s.slice(0,otherC.p-c.p),p:c.p});s=s.slice(otherC.p-c.p)}if(s!=="")append(dest,{d:s,p:c.p+otherC.i.length})}else{if(c.p>=otherC.p+otherC.d.length)append(dest,{d:c.d,p:c.p-otherC.d.length});else if(c.p+c.d.length<=otherC.p)append(dest,c);else{var newC={d:"",p:c.p};if(c.p<otherC.p)newC.d=c.d.slice(0,otherC.p-c.p);if(c.p+c.d.length>otherC.p+otherC.d.length)newC.d+=c.d.slice(otherC.p+otherC.d.length-c.p);var intersectStart=Math.max(c.p,otherC.p);var intersectEnd=Math.min(c.p+c.d.length,otherC.p+otherC.d.length);var cIntersect=c.d.slice(intersectStart-c.p,intersectEnd-c.p);var otherIntersect=otherC.d.slice(intersectStart-otherC.p,intersectEnd-otherC.p);if(cIntersect!==otherIntersect)throw new Error("Delete ops delete different text in the same region of the document");if(newC.d!==""){newC.p=transformPosition(newC.p,otherC);append(dest,newC)}}}}return dest};var invertComponent=function(c){return c.i!=null?{d:c.i,p:c.p}:{i:c.d,p:c.p}};text.invert=function(op){op=op.slice().reverse();for(var i=0;i<op.length;i++){op[i]=invertComponent(op[i])}return op};require("./bootstrapTransform")(text,transformComponent,checkValidOp,append)},{"./bootstrapTransform":3}],7:[function(require,module,exports){(function(process){var Doc=require("./doc");var Query=require("./query");var emitter=require("../emitter");var ShareDBError=require("../error");var types=require("../types");var util=require("../util");module.exports=Connection;function Connection(socket){emitter.EventEmitter.call(this);this.collections={};this.nextQueryId=1;this.queries={};this.seq=1;this.id=null;this.agent=null;this.debug=false;this.bindToSocket(socket)}emitter.mixin(Connection);Connection.prototype.bindToSocket=function(socket){if(this.socket){this.socket.close();this.socket.onmessage=null;this.socket.onopen=null;this.socket.onerror=null;this.socket.onclose=null}this.socket=socket;this.state=socket.readyState===0||socket.readyState===1?"connecting":"disconnected";this.canSend=false;var connection=this;socket.onmessage=function(event){try{var data=typeof event.data==="string"?JSON.parse(event.data):event.data}catch(err){console.warn("Failed to parse message",event);return}if(connection.debug)console.log("RECV",JSON.stringify(data));var request={data:data};connection.emit("receive",request);if(!request.data)return;try{connection.handleMessage(request.data)}catch(err){process.nextTick(function(){connection.emit("error",err)})}};socket.onopen=function(){connection._setState("connecting")};socket.onerror=function(err){connection.emit("connection error",err)};socket.onclose=function(reason){if(reason==="closed"||reason==="Closed"){connection._setState("closed",reason)}else if(reason==="stopped"||reason==="Stopped by server"){connection._setState("stopped",reason)}else{connection._setState("disconnected",reason)}}};Connection.prototype.handleMessage=function(message){var err=null;if(message.error){err=new Error(message.error.message);err.code=message.error.code;err.data=message;delete message.error}switch(message.a){case"init":if(message.protocol!==1){err=new ShareDBError(4019,"Invalid protocol version");return this.emit("error",err)}if(types.map[message.type]!==types.defaultType){err=new ShareDBError(4020,"Invalid default type");return this.emit("error",err)}if(typeof message.id!=="string"){err=new ShareDBError(4021,"Invalid client id");return this.emit("error",err)}this.id=message.id;this._setState("connected");return;case"qf":var query=this.queries[message.id];if(query)query._handleFetch(err,message.data,message.extra);return;case"qs":var query=this.queries[message.id];if(query)query._handleSubscribe(err,message.data,message.extra);return;case"qu":return;case"q":var query=this.queries[message.id];if(!query)return;if(err)return query._handleError(err);if(message.diff)query._handleDiff(message.diff);if(message.hasOwnProperty("extra"))query._handleExtra(message.extra);return;case"bf":return this._handleBulkMessage(message,"_handleFetch");case"bs":return this._handleBulkMessage(message,"_handleSubscribe");case"bu":return this._handleBulkMessage(message,"_handleUnsubscribe");case"f":var doc=this.getExisting(message.c,message.d);if(doc)doc._handleFetch(err,message.data);return;case"s":var doc=this.getExisting(message.c,message.d);if(doc)doc._handleSubscribe(err,message.data);return;case"u":var doc=this.getExisting(message.c,message.d);if(doc)doc._handleUnsubscribe(err);return;case"op":var doc=this.getExisting(message.c,message.d);if(doc)doc._handleOp(err,message);return;default:console.warn("Ignoring unrecognized message",message)}};Connection.prototype._handleBulkMessage=function(message,method){if(message.data){for(var id in message.data){var doc=this.getExisting(message.c,id);if(doc)doc[method](message.error,message.data[id])}}else if(Array.isArray(message.b)){for(var i=0;i<message.b.length;i++){var id=message.b[i];var doc=this.getExisting(message.c,id);if(doc)doc[method](message.error)}}else if(message.b){for(var id in message.b){var doc=this.getExisting(message.c,id);if(doc)doc[method](message.error)}}else{console.error("Invalid bulk message",message)}};Connection.prototype._reset=function(){this.seq=1;this.id=null;this.agent=null};Connection.prototype._setState=function(newState,reason){if(this.state===newState)return;if(newState==="connecting"&&this.state!=="disconnected"&&this.state!=="stopped"&&this.state!=="closed"||newState==="connected"&&this.state!=="connecting"){var err=new ShareDBError(5007,"Cannot transition directly from "+this.state+" to "+newState);return this.emit("error",err)}this.state=newState;this.canSend=newState==="connected";if(newState==="disconnected"||newState==="stopped"||newState==="closed")this._reset();this.startBulk();for(var id in this.queries){var query=this.queries[id];query._onConnectionStateChanged()}for(var collection in this.collections){var docs=this.collections[collection];for(var id in docs){docs[id]._onConnectionStateChanged()}}this.endBulk();this.emit(newState,reason);this.emit("state",newState,reason)};Connection.prototype.startBulk=function(){if(!this.bulk)this.bulk={}};Connection.prototype.endBulk=function(){if(this.bulk){for(var collection in this.bulk){var actions=this.bulk[collection];this._sendBulk("f",collection,actions.f);this._sendBulk("s",collection,actions.s);this._sendBulk("u",collection,actions.u)}}this.bulk=null};Connection.prototype._sendBulk=function(action,collection,values){if(!values)return;var ids=[];var versions={};var versionsCount=0;var versionId;for(var id in values){var value=values[id];if(value==null){ids.push(id)}else{versions[id]=value;versionId=id;versionsCount++}}if(ids.length===1){var id=ids[0];this.send({a:action,c:collection,d:id})}else if(ids.length){this.send({a:"b"+action,c:collection,b:ids})}if(versionsCount===1){var version=versions[versionId];this.send({a:action,c:collection,d:versionId,v:version})}else if(versionsCount){this.send({a:"b"+action,c:collection,b:versions})}};Connection.prototype._sendAction=function(action,doc,version){this._addDoc(doc);if(this.bulk){var actions=this.bulk[doc.collection]||(this.bulk[doc.collection]={});var versions=actions[action]||(actions[action]={});var isDuplicate=versions.hasOwnProperty(doc.id);versions[doc.id]=version;return isDuplicate}else{var message={a:action,c:doc.collection,d:doc.id,v:version};this.send(message)}};Connection.prototype.sendFetch=function(doc){return this._sendAction("f",doc,doc.version)};Connection.prototype.sendSubscribe=function(doc){return this._sendAction("s",doc,doc.version)};Connection.prototype.sendUnsubscribe=function(doc){return this._sendAction("u",doc)};Connection.prototype.sendOp=function(doc,op){this._addDoc(doc);var message={a:"op",c:doc.collection,d:doc.id,v:doc.version,src:op.src,seq:op.seq};if(op.op)message.op=op.op;if(op.create)message.create=op.create;if(op.del)message.del=op.del;this.send(message)};Connection.prototype.send=function(message){if(this.debug)console.log("SEND",JSON.stringify(message));this.emit("send",message);this.socket.send(JSON.stringify(message))};Connection.prototype.close=function(){this.socket.close()};Connection.prototype.getExisting=function(collection,id){if(this.collections[collection])return this.collections[collection][id]};Connection.prototype.get=function(collection,id){var docs=this.collections[collection]||(this.collections[collection]={});var doc=docs[id];if(!doc){doc=docs[id]=new Doc(this,collection,id);this.emit("doc",doc)}return doc};Connection.prototype._destroyDoc=function(doc){var docs=this.collections[doc.collection];if(!docs)return;delete docs[doc.id];if(!util.hasKeys(docs)){delete this.collections[doc.collection]}};Connection.prototype._addDoc=function(doc){var docs=this.collections[doc.collection];if(!docs){docs=this.collections[doc.collection]={}}if(docs[doc.id]!==doc){docs[doc.id]=doc}};Connection.prototype._createQuery=function(action,collection,q,options,callback){var id=this.nextQueryId++;var query=new Query(action,this,id,collection,q,options,callback);this.queries[id]=query;query.send();return query};Connection.prototype._destroyQuery=function(query){delete this.queries[query.id]};Connection.prototype.createFetchQuery=function(collection,q,options,callback){return this._createQuery("qf",collection,q,options,callback)};Connection.prototype.createSubscribeQuery=function(collection,q,options,callback){return this._createQuery("qs",collection,q,options,callback)};Connection.prototype.hasPending=function(){return!!(this._firstDoc(hasPending)||this._firstQuery(hasPending))};function hasPending(object){return object.hasPending()}Connection.prototype.hasWritePending=function(){return!!this._firstDoc(hasWritePending)};function hasWritePending(object){return object.hasWritePending()}Connection.prototype.whenNothingPending=function(callback){var doc=this._firstDoc(hasPending);if(doc){doc.once("nothing pending",this._nothingPendingRetry(callback));return}var query=this._firstQuery(hasPending);if(query){query.once("ready",this._nothingPendingRetry(callback));return}process.nextTick(callback)};Connection.prototype._nothingPendingRetry=function(callback){var connection=this;return function(){process.nextTick(function(){connection.whenNothingPending(callback)})}};Connection.prototype._firstDoc=function(fn){for(var collection in this.collections){var docs=this.collections[collection];for(var id in docs){var doc=docs[id];if(fn(doc)){return doc}}}};Connection.prototype._firstQuery=function(fn){for(var id in this.queries){var query=this.queries[id];if(fn(query)){return query}}}}).call(this,require("_process"))},{"../emitter":11,"../error":12,"../types":13,"../util":14,"./doc":8,"./query":10,_process:17}],8:[function(require,module,exports){(function(process){var emitter=require("../emitter");var ShareDBError=require("../error");var types=require("../types");module.exports=Doc;function Doc(connection,collection,id){emitter.EventEmitter.call(this);this.connection=connection;this.collection=collection;this.id=id;this.version=null;this.type=null;this.data=undefined;this.inflightFetch=[];this.inflightSubscribe=[];this.inflightUnsubscribe=[];this.pendingFetch=[];this.subscribed=false;this.wantSubscribe=false;this.inflightOp=null;this.pendingOps=[];this.type=null;this.applyStack=null;this.preventCompose=false}emitter.mixin(Doc);Doc.prototype.destroy=function(callback){var doc=this;doc.whenNothingPending(function(){doc.connection._destroyDoc(doc);if(doc.wantSubscribe){return doc.unsubscribe(callback)}if(callback)callback()})};Doc.prototype._setType=function(newType){if(typeof newType==="string"){newType=types.map[newType]}if(newType){this.type=newType}else if(newType===null){this.type=newType;this.data=undefined}else{var err=new ShareDBError(4008,"Missing type "+newType);return this.emit("error",err)}};Doc.prototype.ingestSnapshot=function(snapshot,callback){if(!snapshot)return callback&&callback();if(typeof snapshot.v!=="number"){var err=new ShareDBError(5008,"Missing version in ingested snapshot. "+this.collection+"."+this.id);if(callback)return callback(err);return this.emit("error",err)}if(this.type||this.hasWritePending()){if(this.version==null){if(this.hasWritePending()){return callback&&this.once("no write pending",callback)}var err=new ShareDBError(5009,"Cannot ingest snapshot in doc with null version. "+this.collection+"."+this.id);if(callback)return callback(err);return this.emit("error",err)}if(snapshot.v>this.version)return this.fetch(callback);return callback&&callback()}if(this.version>snapshot.v)return callback&&callback();this.version=snapshot.v;var type=snapshot.type===undefined?types.defaultType:snapshot.type;this._setType(type);this.data=this.type&&this.type.deserialize?this.type.deserialize(snapshot.data):snapshot.data;this.emit("load");callback&&callback()};Doc.prototype.whenNothingPending=function(callback){if(this.hasPending()){this.once("nothing pending",callback);return}callback()};Doc.prototype.hasPending=function(){return!!(this.inflightOp||this.pendingOps.length||this.inflightFetch.length||this.inflightSubscribe.length||this.inflightUnsubscribe.length||this.pendingFetch.length)};Doc.prototype.hasWritePending=function(){return!!(this.inflightOp||this.pendingOps.length)};Doc.prototype._emitNothingPending=function(){if(this.hasWritePending())return;this.emit("no write pending");if(this.hasPending())return;this.emit("nothing pending")};Doc.prototype._emitResponseError=function(err,callback){if(callback){callback(err);this._emitNothingPending();return}this._emitNothingPending();this.emit("error",err)};Doc.prototype._handleFetch=function(err,snapshot){var callback=this.inflightFetch.shift();if(err)return this._emitResponseError(err,callback);this.ingestSnapshot(snapshot,callback);this._emitNothingPending()};Doc.prototype._handleSubscribe=function(err,snapshot){var callback=this.inflightSubscribe.shift();if(err)return this._emitResponseError(err,callback);if(this.wantSubscribe)this.subscribed=true;this.ingestSnapshot(snapshot,callback);this._emitNothingPending()};Doc.prototype._handleUnsubscribe=function(err){var callback=this.inflightUnsubscribe.shift();if(err)return this._emitResponseError(err,callback);if(callback)callback();this._emitNothingPending()};Doc.prototype._handleOp=function(err,message){if(err){if(this.inflightOp){if(err.code===4002)err=null;return this._rollback(err)}return this.emit("error",err)}if(this.inflightOp&&message.src===this.inflightOp.src&&message.seq===this.inflightOp.seq){this._opAcknowledged(message);return}if(this.version==null||message.v>this.version){this.fetch();return}if(message.v<this.version){return}if(this.inflightOp){var transformErr=transformX(this.inflightOp,message);if(transformErr)return this._hardRollback(transformErr)}for(var i=0;i<this.pendingOps.length;i++){var transformErr=transformX(this.pendingOps[i],message);if(transformErr)return this._hardRollback(transformErr)}this.version++;this._otApply(message,false);return};Doc.prototype._onConnectionStateChanged=function(){if(this.connection.canSend){this.flush();this._resubscribe()}else{if(this.inflightOp){this.pendingOps.unshift(this.inflightOp);this.inflightOp=null}this.subscribed=false;if(this.inflightFetch.length||this.inflightSubscribe.length){this.pendingFetch=this.pendingFetch.concat(this.inflightFetch,this.inflightSubscribe);this.inflightFetch.length=0;this.inflightSubscribe.length=0}if(this.inflightUnsubscribe.length){var callbacks=this.inflightUnsubscribe;this.inflightUnsubscribe=[];callEach(callbacks)}}};Doc.prototype._resubscribe=function(){var callbacks=this.pendingFetch;this.pendingFetch=[];if(this.wantSubscribe){if(callbacks.length){this.subscribe(function(err){callEach(callbacks,err)});return}this.subscribe();return}if(callbacks.length){this.fetch(function(err){callEach(callbacks,err)})}};Doc.prototype.fetch=function(callback){if(this.connection.canSend){var isDuplicate=this.connection.sendFetch(this);pushActionCallback(this.inflightFetch,isDuplicate,callback);return}this.pendingFetch.push(callback)};Doc.prototype.subscribe=function(callback){this.wantSubscribe=true;if(this.connection.canSend){var isDuplicate=this.connection.sendSubscribe(this);pushActionCallback(this.inflightSubscribe,isDuplicate,callback);return}this.pendingFetch.push(callback)};Doc.prototype.unsubscribe=function(callback){this.wantSubscribe=false;this.subscribed=false;if(this.connection.canSend){var isDuplicate=this.connection.sendUnsubscribe(this);pushActionCallback(this.inflightUnsubscribe,isDuplicate,callback);return}if(callback)process.nextTick(callback)};function pushActionCallback(inflight,isDuplicate,callback){if(isDuplicate){var lastCallback=inflight.pop();inflight.push(function(err){lastCallback&&lastCallback(err);callback&&callback(err)})}else{inflight.push(callback)}}Doc.prototype.flush=function(){if(!this.connection.canSend||this.inflightOp)return;if(!this.paused&&this.pendingOps.length){this._sendOp()}};function setNoOp(op){delete op.op;delete op.create;delete op.del}function transformX(client,server){if(client.del)return setNoOp(server);if(server.del){return new ShareDBError(4017,"Document was deleted")}if(server.create){return new ShareDBError(4018,"Document alredy created")}if(!server.op)return;if(client.create){return new ShareDBError(4018,"Document already created")}if(client.type.transformX){var result=client.type.transformX(client.op,server.op);client.op=result[0];server.op=result[1]}else{var clientOp=client.type.transform(client.op,server.op,"left");var serverOp=client.type.transform(server.op,client.op,"right");client.op=clientOp;server.op=serverOp}}Doc.prototype._otApply=function(op,source){if(op.op){if(!this.type){var err=new ShareDBError(4015,"Cannot apply op to uncreated document. "+this.collection+"."+this.id);return this.emit("error",err)}if(!source&&this.type===types.defaultType&&op.op.length>1){if(!this.applyStack)this.applyStack=[];var stackLength=this.applyStack.length;for(var i=0;i<op.op.length;i++){var component=op.op[i];var componentOp={op:[component]};for(var j=stackLength;j<this.applyStack.length;j++){var transformErr=transformX(this.applyStack[j],componentOp);if(transformErr)return this._hardRollback(transformErr)}this.emit("before op",componentOp.op,source);this.data=this.type.apply(this.data,componentOp.op);this.emit("op",componentOp.op,source)}this._popApplyStack(stackLength);return}this.emit("before op",op.op,source);this.data=this.type.apply(this.data,op.op);this.emit("op",op.op,source);return}if(op.create){this._setType(op.create.type);this.data=this.type.deserialize?this.type.createDeserialized?this.type.createDeserialized(op.create.data):this.type.deserialize(this.type.create(op.create.data)):this.type.create(op.create.data);this.emit("create",source);return}if(op.del){var oldData=this.data;this._setType(null);this.emit("del",oldData,source);return}};Doc.prototype._sendOp=function(){var src=this.connection.id;if(!src)return;if(!this.inflightOp){this.inflightOp=this.pendingOps.shift()}var op=this.inflightOp;if(!op){var err=new ShareDBError(5010,"No op to send on call to _sendOp");return this.emit("error",err)}op.sentAt=Date.now();op.retries=op.retries==null?0:op.retries+1;if(op.seq==null)op.seq=this.connection.seq++;this.connection.sendOp(this,op);if(op.src==null)op.src=src};Doc.prototype._submit=function(op,source,callback){if(!source)source=true;if(op.op){if(!this.type){var err=new ShareDBError(4015,"Cannot submit op. Document has not been created. "+this.collection+"."+this.id);if(callback)return callback(err);return this.emit("error",err)}if(this.type.normalize)op.op=this.type.normalize(op.op)}this._pushOp(op,callback);this._otApply(op,source);var doc=this;process.nextTick(function(){doc.flush()})};Doc.prototype._pushOp=function(op,callback){if(this.applyStack){this.applyStack.push(op)}else{var composed=this._tryCompose(op);if(composed){composed.callbacks.push(callback);return}}op.type=this.type;op.callbacks=[callback];this.pendingOps.push(op)};Doc.prototype._popApplyStack=function(to){if(to>0){this.applyStack.length=to;return}var op=this.applyStack[0];this.applyStack=null;if(!op)return;var i=this.pendingOps.indexOf(op);if(i===-1)return;var ops=this.pendingOps.splice(i);for(var i=0;i<ops.length;i++){var op=ops[i];var composed=this._tryCompose(op);if(composed){composed.callbacks=composed.callbacks.concat(op.callbacks)}else{this.pendingOps.push(op)}}};Doc.prototype._tryCompose=function(op){if(this.preventCompose)return;var last=this.pendingOps[this.pendingOps.length-1];if(!last)return;if(last.create&&op.op){last.create.data=this.type.apply(last.create.data,op.op);return last}if(last.op&&op.op&&this.type.compose){last.op=this.type.compose(last.op,op.op);return last}};Doc.prototype.submitOp=function(component,options,callback){if(typeof options==="function"){callback=options;options=null}var op={op:component};var source=options&&options.source;this._submit(op,source,callback)};Doc.prototype.create=function(data,type,options,callback){if(typeof type==="function"){callback=type;options=null;type=null}else if(typeof options==="function"){callback=options;options=null}if(!type){type=types.defaultType.uri}if(this.type){var err=new ShareDBError(4016,"Document already exists");if(callback)return callback(err);return this.emit("error",err)}var op={create:{type:type,data:data}};var source=options&&options.source;this._submit(op,source,callback)};Doc.prototype.del=function(options,callback){if(typeof options==="function"){callback=options;options=null}if(!this.type){var err=new ShareDBError(4015,"Document does not exist");if(callback)return callback(err);return this.emit("error",err)}var op={del:true};var source=options&&options.source;this._submit(op,source,callback)};Doc.prototype.pause=function(){this.paused=true};Doc.prototype.resume=function(){this.paused=false;this.flush()};Doc.prototype._opAcknowledged=function(message){if(this.inflightOp.create){this.version=message.v}else if(message.v!==this.version){console.warn("Invalid version from server. Expected: "+this.version+" Received: "+message.v,message);return this.fetch()}this.version++;this._clearInflightOp()};Doc.prototype._rollback=function(err){var op=this.inflightOp;if(op.op&&op.type.invert){op.op=op.type.invert(op.op);for(var i=0;i<this.pendingOps.length;i++){var transformErr=transformX(this.pendingOps[i],op);if(transformErr)return this._hardRollback(transformErr)}this._otApply(op,false);this._clearInflightOp(err);return}this._hardRollback(err)};Doc.prototype._hardRollback=function(err){var op=this.inflightOp;var pending=this.pendingOps;this._setType(null);this.version=null;this.inflightOp=null;this.pendingOps=[];var doc=this;this.fetch(function(){var called=op&&callEach(op.callbacks,err);for(var i=0;i<pending.length;i++){callEach(pending[i].callbacks,err)}if(err&&!called)return doc.emit("error",err)})};Doc.prototype._clearInflightOp=function(err){var called=callEach(this.inflightOp.callbacks,err);this.inflightOp=null;this.flush();this._emitNothingPending();if(err&&!called)return this.emit("error",err)};function callEach(callbacks,err){var called=false;for(var i=0;i<callbacks.length;i++){var callback=callbacks[i];if(callback){callback(err);called=true}}return called}}).call(this,require("_process"))},{"../emitter":11,"../error":12,"../types":13,_process:17}],9:[function(require,module,exports){exports.Connection=require("./connection");exports.Doc=require("./doc");exports.Error=require("../error");exports.Query=require("./query");exports.types=require("../types")},{"../error":12,"../types":13,"./connection":7,"./doc":8,"./query":10}],10:[function(require,module,exports){(function(process){var emitter=require("../emitter");module.exports=Query;function Query(action,connection,id,collection,query,options,callback){emitter.EventEmitter.call(this);this.action=action;this.connection=connection;this.id=id;this.collection=collection;this.query=query;this.results=null;if(options&&options.results){this.results=options.results;delete options.results}this.extra=undefined;this.options=options;this.callback=callback;this.ready=false;this.sent=false}emitter.mixin(Query);Query.prototype.hasPending=function(){return!this.ready};Query.prototype.send=function(){if(!this.connection.canSend)return;var message={a:this.action,id:this.id,c:this.collection,q:this.query};if(this.options){message.o=this.options}if(this.results){var results=[];for(var i=0;i<this.results.length;i++){var doc=this.results[i];results.push([doc.id,doc.version])}message.r=results}this.connection.send(message);this.sent=true};Query.prototype.destroy=function(callback){if(this.connection.canSend&&this.action==="qs"){this.connection.send({a:"qu",id:this.id})}this.connection._destroyQuery(this);if(callback)process.nextTick(callback)};Query.prototype._onConnectionStateChanged=function(){if(this.connection.canSend&&!this.sent){this.send()}else{this.sent=false}};Query.prototype._handleFetch=function(err,data,extra){this.connection._destroyQuery(this);this._handleResponse(err,data,extra)};Query.prototype._handleSubscribe=function(err,data,extra){this._handleResponse(err,data,extra)};Query.prototype._handleResponse=function(err,data,extra){var callback=this.callback;this.callback=null;if(err)return this._finishResponse(err,callback);if(!data)return this._finishResponse(null,callback);var query=this;var wait=1;var finish=function(err){if(err)return query._finishResponse(err,callback);if(--wait)return;query._finishResponse(null,callback)};if(Array.isArray(data)){wait+=data.length;this.results=this._ingestSnapshots(data,finish);this.extra=extra}else{for(var id in data){wait++;var snapshot=data[id];var doc=this.connection.get(snapshot.c||this.collection,id);doc.ingestSnapshot(snapshot,finish)}}finish()};Query.prototype._ingestSnapshots=function(snapshots,finish){var results=[];for(var i=0;i<snapshots.length;i++){var snapshot=snapshots[i];var doc=this.connection.get(snapshot.c||this.collection,snapshot.d);doc.ingestSnapshot(snapshot,finish);results.push(doc)}return results};Query.prototype._finishResponse=function(err,callback){this.emit("ready");this.ready=true;if(err){this.connection._destroyQuery(this);if(callback)return callback(err);return this.emit("error",err)}if(callback)callback(null,this.results,this.extra)};Query.prototype._handleError=function(err){this.emit("error",err)};Query.prototype._handleDiff=function(diff){for(var i=0;i<diff.length;i++){var d=diff[i];if(d.type==="insert")d.values=this._ingestSnapshots(d.values)}for(var i=0;i<diff.length;i++){var d=diff[i];switch(d.type){case"insert":var newDocs=d.values;Array.prototype.splice.apply(this.results,[d.index,0].concat(newDocs));this.emit("insert",newDocs,d.index);break;case"remove":var howMany=d.howMany||1;var removed=this.results.splice(d.index,howMany);this.emit("remove",removed,d.index);break;case"move":var howMany=d.howMany||1;var docs=this.results.splice(d.from,howMany);Array.prototype.splice.apply(this.results,[d.to,0].concat(docs));this.emit("move",docs,d.from,d.to);break}}this.emit("changed",this.results)};Query.prototype._handleExtra=function(extra){this.extra=extra;this.emit("extra",extra)}}).call(this,require("_process"))},{"../emitter":11,_process:17}],11:[function(require,module,exports){var EventEmitter=require("events").EventEmitter;exports.EventEmitter=EventEmitter;exports.mixin=mixin;function mixin(Constructor){for(var key in EventEmitter.prototype){Constructor.prototype[key]=EventEmitter.prototype[key]}}},{events:16}],12:[function(require,module,exports){var makeError=require("make-error");function ShareDBError(code,message){ShareDBError.super.call(this,message);this.code=code}makeError(ShareDBError);module.exports=ShareDBError},{"make-error":2}],13:[function(require,module,exports){exports.defaultType=require("ot-json0").type;exports.map={};exports.register=function(type){if(type.name)exports.map[type.name]=type;if(type.uri)exports.map[type.uri]=type};exports.register(exports.defaultType)},{"ot-json0":4}],14:[function(require,module,exports){exports.doNothing=doNothing;function doNothing(){}exports.hasKeys=function(object){for(var key in object)return true;return false}},{}],15:[function(require,module,exports){(function(global){global.sharedb=require("sharedb/lib/client");global.fastDiff=require("fast-diff")}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"fast-diff":1,"sharedb/lib/client":9}],16:[function(require,module,exports){var objectCreate=Object.create||objectCreatePolyfill;var objectKeys=Object.keys||objectKeysPolyfill;var bind=Function.prototype.bind||functionBindPolyfill;function EventEmitter(){if(!this._events||!Object.prototype.hasOwnProperty.call(this,"_events")){this._events=objectCreate(null);this._eventsCount=0}this._maxListeners=this._maxListeners||undefined}module.exports=EventEmitter;EventEmitter.EventEmitter=EventEmitter;EventEmitter.prototype._events=undefined;EventEmitter.prototype._maxListeners=undefined;var defaultMaxListeners=10;var hasDefineProperty;try{var o={};if(Object.defineProperty)Object.defineProperty(o,"x",{value:0});hasDefineProperty=o.x===0}catch(err){hasDefineProperty=false}if(hasDefineProperty){Object.defineProperty(EventEmitter,"defaultMaxListeners",{enumerable:true,get:function(){return defaultMaxListeners},set:function(arg){if(typeof arg!=="number"||arg<0||arg!==arg)throw new TypeError('"defaultMaxListeners" must be a positive number');defaultMaxListeners=arg}})}else{EventEmitter.defaultMaxListeners=defaultMaxListeners}EventEmitter.prototype.setMaxListeners=function setMaxListeners(n){if(typeof n!=="number"||n<0||isNaN(n))throw new TypeError('"n" argument must be a positive number');this._maxListeners=n;return this};function $getMaxListeners(that){if(that._maxListeners===undefined)return EventEmitter.defaultMaxListeners;return that._maxListeners}EventEmitter.prototype.getMaxListeners=function getMaxListeners(){return $getMaxListeners(this)};function emitNone(handler,isFn,self){if(isFn)handler.call(self);else{var len=handler.length;var listeners=arrayClone(handler,len);for(var i=0;i<len;++i)listeners[i].call(self)}}function emitOne(handler,isFn,self,arg1){if(isFn)handler.call(self,arg1);else{var len=handler.length;var listeners=arrayClone(handler,len);for(var i=0;i<len;++i)listeners[i].call(self,arg1)}}function emitTwo(handler,isFn,self,arg1,arg2){if(isFn)handler.call(self,arg1,arg2);else{var len=handler.length;var listeners=arrayClone(handler,len);for(var i=0;i<len;++i)listeners[i].call(self,arg1,arg2)}}function emitThree(handler,isFn,self,arg1,arg2,arg3){if(isFn)handler.call(self,arg1,arg2,arg3);else{var len=handler.length;var listeners=arrayClone(handler,len);for(var i=0;i<len;++i)listeners[i].call(self,arg1,arg2,arg3)}}function emitMany(handler,isFn,self,args){if(isFn)handler.apply(self,args);else{var len=handler.length;var listeners=arrayClone(handler,len);for(var i=0;i<len;++i)listeners[i].apply(self,args)}}EventEmitter.prototype.emit=function emit(type){var er,handler,len,args,i,events;var doError=type==="error";events=this._events;if(events)doError=doError&&events.error==null;else if(!doError)return false;if(doError){if(arguments.length>1)er=arguments[1];if(er instanceof Error){throw er}else{var err=new Error('Unhandled "error" event. ('+er+")");err.context=er;throw err}return false}handler=events[type];if(!handler)return false;var isFn=typeof handler==="function";len=arguments.length;switch(len){case 1:emitNone(handler,isFn,this);break;case 2:emitOne(handler,isFn,this,arguments[1]);break;case 3:emitTwo(handler,isFn,this,arguments[1],arguments[2]);break;case 4:emitThree(handler,isFn,this,arguments[1],arguments[2],arguments[3]);break;default:args=new Array(len-1);for(i=1;i<len;i++)args[i-1]=arguments[i];emitMany(handler,isFn,this,args)}return true};function _addListener(target,type,listener,prepend){var m;var events;var existing;if(typeof listener!=="function")throw new TypeError('"listener" argument must be a function');events=target._events;if(!events){events=target._events=objectCreate(null);target._eventsCount=0}else{if(events.newListener){target.emit("newListener",type,listener.listener?listener.listener:listener);events=target._events}existing=events[type]}if(!existing){existing=events[type]=listener;++target._eventsCount}else{if(typeof existing==="function"){existing=events[type]=prepend?[listener,existing]:[existing,listener]}else{if(prepend){existing.unshift(listener)}else{existing.push(listener)}}if(!existing.warned){m=$getMaxListeners(target);if(m&&m>0&&existing.length>m){existing.warned=true;var w=new Error("Possible EventEmitter memory leak detected. "+existing.length+' "'+String(type)+'" listeners '+"added. Use emitter.setMaxListeners() to "+"increase limit.");w.name="MaxListenersExceededWarning";w.emitter=target;w.type=type;w.count=existing.length;if(typeof console==="object"&&console.warn){console.warn("%s: %s",w.name,w.message)}}}}return target}EventEmitter.prototype.addListener=function addListener(type,listener){return _addListener(this,type,listener,false)};EventEmitter.prototype.on=EventEmitter.prototype.addListener;EventEmitter.prototype.prependListener=function prependListener(type,listener){return _addListener(this,type,listener,true)};function onceWrapper(){if(!this.fired){this.target.removeListener(this.type,this.wrapFn);this.fired=true;switch(arguments.length){case 0:return this.listener.call(this.target);case 1:return this.listener.call(this.target,arguments[0]);case 2:return this.listener.call(this.target,arguments[0],arguments[1]);case 3:return this.listener.call(this.target,arguments[0],arguments[1],arguments[2]);default:var args=new Array(arguments.length);for(var i=0;i<args.length;++i)args[i]=arguments[i];this.listener.apply(this.target,args)}}}function _onceWrap(target,type,listener){var state={fired:false,wrapFn:undefined,target:target,type:type,listener:listener};var wrapped=bind.call(onceWrapper,state);wrapped.listener=listener;state.wrapFn=wrapped;return wrapped}EventEmitter.prototype.once=function once(type,listener){if(typeof listener!=="function")throw new TypeError('"listener" argument must be a function');this.on(type,_onceWrap(this,type,listener));return this};EventEmitter.prototype.prependOnceListener=function prependOnceListener(type,listener){if(typeof listener!=="function")throw new TypeError('"listener" argument must be a function');this.prependListener(type,_onceWrap(this,type,listener));return this};EventEmitter.prototype.removeListener=function removeListener(type,listener){var list,events,position,i,originalListener;if(typeof listener!=="function")throw new TypeError('"listener" argument must be a function');events=this._events;if(!events)return this;list=events[type];if(!list)return this;if(list===listener||list.listener===listener){if(--this._eventsCount===0)this._events=objectCreate(null);else{delete events[type];if(events.removeListener)this.emit("removeListener",type,list.listener||listener)}}else if(typeof list!=="function"){position=-1;for(i=list.length-1;i>=0;i--){if(list[i]===listener||list[i].listener===listener){originalListener=list[i].listener;position=i;break}}if(position<0)return this;if(position===0)list.shift();else spliceOne(list,position);if(list.length===1)events[type]=list[0];if(events.removeListener)this.emit("removeListener",type,originalListener||listener)}return this};EventEmitter.prototype.removeAllListeners=function removeAllListeners(type){var listeners,events,i;events=this._events;if(!events)return this;if(!events.removeListener){if(arguments.length===0){this._events=objectCreate(null);this._eventsCount=0}else if(events[type]){if(--this._eventsCount===0)this._events=objectCreate(null);else delete events[type]}return this}if(arguments.length===0){var keys=objectKeys(events);var key;for(i=0;i<keys.length;++i){key=keys[i];if(key==="removeListener")continue;this.removeAllListeners(key)}this.removeAllListeners("removeListener");this._events=objectCreate(null);this._eventsCount=0;return this}listeners=events[type];if(typeof listeners==="function"){this.removeListener(type,listeners)}else if(listeners){for(i=listeners.length-1;i>=0;i--){this.removeListener(type,listeners[i])}}return this};EventEmitter.prototype.listeners=function listeners(type){var evlistener;var ret;var events=this._events;if(!events)ret=[];else{evlistener=events[type];if(!evlistener)ret=[];else if(typeof evlistener==="function")ret=[evlistener.listener||evlistener];else ret=unwrapListeners(evlistener)}return ret};EventEmitter.listenerCount=function(emitter,type){if(typeof emitter.listenerCount==="function"){return emitter.listenerCount(type)}else{return listenerCount.call(emitter,type)}};EventEmitter.prototype.listenerCount=listenerCount;function listenerCount(type){var events=this._events;if(events){var evlistener=events[type];if(typeof evlistener==="function"){return 1}else if(evlistener){return evlistener.length}}return 0}EventEmitter.prototype.eventNames=function eventNames(){return this._eventsCount>0?Reflect.ownKeys(this._events):[]};function spliceOne(list,index){for(var i=index,k=i+1,n=list.length;k<n;i+=1,k+=1)list[i]=list[k];list.pop()}function arrayClone(arr,n){var copy=new Array(n);for(var i=0;i<n;++i)copy[i]=arr[i];return copy}function unwrapListeners(arr){var ret=new Array(arr.length);for(var i=0;i<ret.length;++i){ret[i]=arr[i].listener||arr[i]}return ret}function objectCreatePolyfill(proto){var F=function(){};F.prototype=proto;return new F}function objectKeysPolyfill(obj){var keys=[];for(var k in obj)if(Object.prototype.hasOwnProperty.call(obj,k)){keys.push(k)}return k}function functionBindPolyfill(context){var fn=this;return function(){return fn.apply(context,arguments)}}},{}],17:[function(require,module,exports){var process=module.exports={};var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){cachedSetTimeout=setTimeout}else{cachedSetTimeout=defaultSetTimout}}catch(e){cachedSetTimeout=defaultSetTimout}try{if(typeof clearTimeout==="function"){cachedClearTimeout=clearTimeout}else{cachedClearTimeout=defaultClearTimeout}}catch(e){cachedClearTimeout=defaultClearTimeout}})();function runTimeout(fun){if(cachedSetTimeout===setTimeout){return setTimeout(fun,0)}if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0)}try{return cachedSetTimeout(fun,0)}catch(e){try{return cachedSetTimeout.call(null,fun,0)}catch(e){return cachedSetTimeout.call(this,fun,0)}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){return clearTimeout(marker)}if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker)}try{return cachedClearTimeout(marker)}catch(e){try{return cachedClearTimeout.call(null,marker)}catch(e){return cachedClearTimeout.call(this,marker)}}}var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return}draining=false;if(currentQueue.length){queue=currentQueue.concat(queue)}else{queueIndex=-1}if(queue.length){drainQueue()}}function drainQueue(){if(draining){return}var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run()}}queueIndex=-1;len=queue.length}currentQueue=null;draining=false;runClearTimeout(timeout)}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i]}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue)}};function Item(fun,array){this.fun=fun;this.array=array}Item.prototype.run=function(){this.fun.apply(null,this.array)};process.title="browser";process.browser=true;process.env={};process.argv=[];process.version="";process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.prependListener=noop;process.prependOnceListener=noop;process.listeners=function(name){return[]};process.binding=function(name){throw new Error("process.binding is not supported")};process.cwd=function(){return"/"};process.chdir=function(dir){throw new Error("process.chdir is not supported")};process.umask=function(){return 0}},{}]},{},[15]);

if(!("classList"in document.createElement("_"))){(function(view){"use strict";if(!("Element"in view))return;var classListProp="classList",protoProp="prototype",elemCtrProto=view.Element[protoProp],objCtr=Object,strTrim=String[protoProp].trim||function(){return this.replace(/^\s+|\s+$/g,"")},arrIndexOf=Array[protoProp].indexOf||function(item){var i=0,len=this.length;for(;i<len;i++){if(i in this&&this[i]===item){return i}}return-1},DOMEx=function(type,message){this.name=type;this.code=DOMException[type];this.message=message},checkTokenAndGetIndex=function(classList,token){if(token===""){throw new DOMEx("SYNTAX_ERR","An invalid or illegal string was specified")}if(/\s/.test(token)){throw new DOMEx("INVALID_CHARACTER_ERR","String contains an invalid character")}return arrIndexOf.call(classList,token)},ClassList=function(elem){var trimmedClasses=strTrim.call(elem.getAttribute("class")||""),classes=trimmedClasses?trimmedClasses.split(/\s+/):[],i=0,len=classes.length;for(;i<len;i++){this.push(classes[i])}this._updateClassName=function(){elem.setAttribute("class",this.toString())}},classListProto=ClassList[protoProp]=[],classListGetter=function(){return new ClassList(this)};DOMEx[protoProp]=Error[protoProp];classListProto.item=function(i){return this[i]||null};classListProto.contains=function(token){token+="";return checkTokenAndGetIndex(this,token)!==-1};classListProto.add=function(){var tokens=arguments,i=0,l=tokens.length,token,updated=false;do{token=tokens[i]+"";if(checkTokenAndGetIndex(this,token)===-1){this.push(token);updated=true}}while(++i<l);if(updated){this._updateClassName()}};classListProto.remove=function(){var tokens=arguments,i=0,l=tokens.length,token,updated=false,index;do{token=tokens[i]+"";index=checkTokenAndGetIndex(this,token);while(index!==-1){this.splice(index,1);updated=true;index=checkTokenAndGetIndex(this,token)}}while(++i<l);if(updated){this._updateClassName()}};classListProto.toggle=function(token,force){token+="";var result=this.contains(token),method=result?force!==true&&"remove":force!==false&&"add";if(method){this[method](token)}if(force===true||force===false){return force}else{return!result}};classListProto.toString=function(){return this.join(" ")};if(objCtr.defineProperty){var classListPropDesc={get:classListGetter,enumerable:true,configurable:true};try{objCtr.defineProperty(elemCtrProto,classListProp,classListPropDesc)}catch(ex){if(ex.number===-2146823252){classListPropDesc.enumerable=false;objCtr.defineProperty(elemCtrProto,classListProp,classListPropDesc)}}}else if(objCtr[protoProp].__defineGetter__){elemCtrProto.__defineGetter__(classListProp,classListGetter)}})(self)}(function(view){"use strict";view.URL=view.URL||view.webkitURL;if(view.Blob&&view.URL){try{new Blob;return}catch(e){}}var BlobBuilder=view.BlobBuilder||view.WebKitBlobBuilder||view.MozBlobBuilder||function(view){var get_class=function(object){return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1]},FakeBlobBuilder=function BlobBuilder(){this.data=[]},FakeBlob=function Blob(data,type,encoding){this.data=data;this.size=data.length;this.type=type;this.encoding=encoding},FBB_proto=FakeBlobBuilder.prototype,FB_proto=FakeBlob.prototype,FileReaderSync=view.FileReaderSync,FileException=function(type){this.code=this[this.name=type]},file_ex_codes=("NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "+"NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR").split(" "),file_ex_code=file_ex_codes.length,real_URL=view.URL||view.webkitURL||view,real_create_object_URL=real_URL.createObjectURL,real_revoke_object_URL=real_URL.revokeObjectURL,URL=real_URL,btoa=view.btoa,atob=view.atob,ArrayBuffer=view.ArrayBuffer,Uint8Array=view.Uint8Array,origin=/^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/;FakeBlob.fake=FB_proto.fake=true;while(file_ex_code--){FileException.prototype[file_ex_codes[file_ex_code]]=file_ex_code+1}if(!real_URL.createObjectURL){URL=view.URL=function(uri){var uri_info=document.createElementNS("http://www.w3.org/1999/xhtml","a"),uri_origin;uri_info.href=uri;if(!("origin"in uri_info)){if(uri_info.protocol.toLowerCase()==="data:"){uri_info.origin=null}else{uri_origin=uri.match(origin);uri_info.origin=uri_origin&&uri_origin[1]}}return uri_info}}URL.createObjectURL=function(blob){var type=blob.type,data_URI_header;if(type===null){type="application/octet-stream"}if(blob instanceof FakeBlob){data_URI_header="data:"+type;if(blob.encoding==="base64"){return data_URI_header+";base64,"+blob.data}else if(blob.encoding==="URI"){return data_URI_header+","+decodeURIComponent(blob.data)}if(btoa){return data_URI_header+";base64,"+btoa(blob.data)}else{return data_URI_header+","+encodeURIComponent(blob.data)}}else if(real_create_object_URL){return real_create_object_URL.call(real_URL,blob)}};URL.revokeObjectURL=function(object_URL){if(object_URL.substring(0,5)!=="data:"&&real_revoke_object_URL){real_revoke_object_URL.call(real_URL,object_URL)}};FBB_proto.append=function(data){var bb=this.data;if(Uint8Array&&(data instanceof ArrayBuffer||data instanceof Uint8Array)){var str="",buf=new Uint8Array(data),i=0,buf_len=buf.length;for(;i<buf_len;i++){str+=String.fromCharCode(buf[i])}bb.push(str)}else if(get_class(data)==="Blob"||get_class(data)==="File"){if(FileReaderSync){var fr=new FileReaderSync;bb.push(fr.readAsBinaryString(data))}else{throw new FileException("NOT_READABLE_ERR")}}else if(data instanceof FakeBlob){if(data.encoding==="base64"&&atob){bb.push(atob(data.data))}else if(data.encoding==="URI"){bb.push(decodeURIComponent(data.data))}else if(data.encoding==="raw"){bb.push(data.data)}}else{if(typeof data!=="string"){data+=""}bb.push(unescape(encodeURIComponent(data)))}};FBB_proto.getBlob=function(type){if(!arguments.length){type=null}return new FakeBlob(this.data.join(""),type,"raw")};FBB_proto.toString=function(){return"[object BlobBuilder]"};FB_proto.slice=function(start,end,type){var args=arguments.length;if(args<3){type=null}return new FakeBlob(this.data.slice(start,args>1?end:this.data.length),type,this.encoding)};FB_proto.toString=function(){return"[object Blob]"};FB_proto.close=function(){this.size=0;delete this.data};return FakeBlobBuilder}(view);view.Blob=function(blobParts,options){var type=options?options.type||"":"";var builder=new BlobBuilder;if(blobParts){for(var i=0,len=blobParts.length;i<len;i++){if(Uint8Array&&blobParts[i]instanceof Uint8Array){builder.append(blobParts[i].buffer)}else{builder.append(blobParts[i])}}}var blob=builder.getBlob(type);if(!blob.slice&&blob.webkitSlice){blob.slice=blob.webkitSlice}return blob};var getPrototypeOf=Object.getPrototypeOf||function(object){return object.__proto__};view.Blob.prototype=getPrototypeOf(new view.Blob)})(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content||this);(function(root,factory){"use strict";var isElectron=typeof module==="object"&&typeof process!=="undefined"&&process&&process.versions&&process.versions.electron;if(!isElectron&&typeof module==="object"){module.exports=factory}else if(typeof define==="function"&&define.amd){define(function(){return factory})}else{root.MediumEditor=factory}})(this,function(){"use strict";function MediumEditor(elements,options){"use strict";return this.init(elements,options)}MediumEditor.extensions={};(function(window){"use strict";function copyInto(overwrite,dest){var prop,sources=Array.prototype.slice.call(arguments,2);dest=dest||{};for(var i=0;i<sources.length;i++){var source=sources[i];if(source){for(prop in source){if(source.hasOwnProperty(prop)&&typeof source[prop]!=="undefined"&&(overwrite||dest.hasOwnProperty(prop)===false)){dest[prop]=source[prop]}}}}return dest}var nodeContainsWorksWithTextNodes=false;try{var testParent=document.createElement("div"),testText=document.createTextNode(" ");testParent.appendChild(testText);nodeContainsWorksWithTextNodes=testParent.contains(testText)}catch(exc){}var Util={isIE:navigator.appName==="Microsoft Internet Explorer"||navigator.appName==="Netscape"&&new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})").exec(navigator.userAgent)!==null,isEdge:/Edge\/\d+/.exec(navigator.userAgent)!==null,isFF:navigator.userAgent.toLowerCase().indexOf("firefox")>-1,isMac:window.navigator.platform.toUpperCase().indexOf("MAC")>=0,keyCode:{BACKSPACE:8,TAB:9,ENTER:13,ESCAPE:27,SPACE:32,DELETE:46,K:75,M:77,V:86},isMetaCtrlKey:function(event){if(Util.isMac&&event.metaKey||!Util.isMac&&event.ctrlKey){return true}return false},isKey:function(event,keys){var keyCode=Util.getKeyCode(event);if(false===Array.isArray(keys)){return keyCode===keys}if(-1===keys.indexOf(keyCode)){return false}return true},getKeyCode:function(event){var keyCode=event.which;if(null===keyCode){keyCode=event.charCode!==null?event.charCode:event.keyCode}return keyCode},blockContainerElementNames:["p","h1","h2","h3","h4","h5","h6","blockquote","pre","ul","li","ol","address","article","aside","audio","canvas","dd","dl","dt","fieldset","figcaption","figure","footer","form","header","hgroup","main","nav","noscript","output","section","video","table","thead","tbody","tfoot","tr","th","td"],emptyElementNames:["br","col","colgroup","hr","img","input","source","wbr"],extend:function extend(){var args=[true].concat(Array.prototype.slice.call(arguments));return copyInto.apply(this,args)},defaults:function defaults(){var args=[false].concat(Array.prototype.slice.call(arguments));return copyInto.apply(this,args)},createLink:function(document,textNodes,href,target){var anchor=document.createElement("a");Util.moveTextRangeIntoElement(textNodes[0],textNodes[textNodes.length-1],anchor);anchor.setAttribute("href",href);if(target){if(target==="_blank"){anchor.setAttribute("rel","noopener noreferrer")}anchor.setAttribute("target",target)}return anchor},findOrCreateMatchingTextNodes:function(document,element,match){var treeWalker=document.createTreeWalker(element,NodeFilter.SHOW_ALL,null,false),matchedNodes=[],currentTextIndex=0,startReached=false,currentNode=null,newNode=null;while((currentNode=treeWalker.nextNode())!==null){if(currentNode.nodeType>3){continue}else if(currentNode.nodeType===3){if(!startReached&&match.start<currentTextIndex+currentNode.nodeValue.length){startReached=true;newNode=Util.splitStartNodeIfNeeded(currentNode,match.start,currentTextIndex)}if(startReached){Util.splitEndNodeIfNeeded(currentNode,newNode,match.end,currentTextIndex)}if(startReached&&currentTextIndex===match.end){break}else if(startReached&&currentTextIndex>match.end+1){throw new Error("PerformLinking overshot the target!")}if(startReached){matchedNodes.push(newNode||currentNode)}currentTextIndex+=currentNode.nodeValue.length;if(newNode!==null){currentTextIndex+=newNode.nodeValue.length;treeWalker.nextNode()}newNode=null}else if(currentNode.tagName.toLowerCase()==="img"){if(!startReached&&match.start<=currentTextIndex){startReached=true}if(startReached){matchedNodes.push(currentNode)}}}return matchedNodes},splitStartNodeIfNeeded:function(currentNode,matchStartIndex,currentTextIndex){if(matchStartIndex!==currentTextIndex){return currentNode.splitText(matchStartIndex-currentTextIndex)}return null},splitEndNodeIfNeeded:function(currentNode,newNode,matchEndIndex,currentTextIndex){var textIndexOfEndOfFarthestNode,endSplitPoint;textIndexOfEndOfFarthestNode=currentTextIndex+currentNode.nodeValue.length+(newNode?newNode.nodeValue.length:0)-1;endSplitPoint=matchEndIndex-currentTextIndex-(newNode?currentNode.nodeValue.length:0);if(textIndexOfEndOfFarthestNode>=matchEndIndex&&currentTextIndex!==textIndexOfEndOfFarthestNode&&endSplitPoint!==0){(newNode||currentNode).splitText(endSplitPoint)}},splitByBlockElements:function(element){if(element.nodeType!==3&&element.nodeType!==1){return[]}var toRet=[],blockElementQuery=MediumEditor.util.blockContainerElementNames.join(",");if(element.nodeType===3||element.querySelectorAll(blockElementQuery).length===0){return[element]}for(var i=0;i<element.childNodes.length;i++){var child=element.childNodes[i];if(child.nodeType===3){toRet.push(child)}else if(child.nodeType===1){var blockElements=child.querySelectorAll(blockElementQuery);if(blockElements.length===0){toRet.push(child)}else{toRet=toRet.concat(MediumEditor.util.splitByBlockElements(child))}}}return toRet},findAdjacentTextNodeWithContent:function findAdjacentTextNodeWithContent(rootNode,targetNode,ownerDocument){var pastTarget=false,nextNode,nodeIterator=ownerDocument.createNodeIterator(rootNode,NodeFilter.SHOW_TEXT,null,false);nextNode=nodeIterator.nextNode();while(nextNode){if(nextNode===targetNode){pastTarget=true}else if(pastTarget){if(nextNode.nodeType===3&&nextNode.nodeValue&&nextNode.nodeValue.trim().length>0){break}}nextNode=nodeIterator.nextNode()}return nextNode},findPreviousSibling:function(node){if(!node||Util.isMediumEditorElement(node)){return false}var previousSibling=node.previousSibling;while(!previousSibling&&!Util.isMediumEditorElement(node.parentNode)){node=node.parentNode;previousSibling=node.previousSibling}return previousSibling},isDescendant:function isDescendant(parent,child,checkEquality){if(!parent||!child){return false}if(parent===child){return!!checkEquality}if(parent.nodeType!==1){return false}if(nodeContainsWorksWithTextNodes||child.nodeType!==3){return parent.contains(child)}var node=child.parentNode;while(node!==null){if(node===parent){return true}node=node.parentNode}return false},isElement:function isElement(obj){return!!(obj&&obj.nodeType===1)},throttle:function(func,wait){var THROTTLE_INTERVAL=50,context,args,result,timeout=null,previous=0,later=function(){previous=Date.now();timeout=null;result=func.apply(context,args);if(!timeout){context=args=null}};if(!wait&&wait!==0){wait=THROTTLE_INTERVAL}return function(){var now=Date.now(),remaining=wait-(now-previous);context=this;args=arguments;if(remaining<=0||remaining>wait){if(timeout){clearTimeout(timeout);timeout=null}previous=now;result=func.apply(context,args);if(!timeout){context=args=null}}else if(!timeout){timeout=setTimeout(later,remaining)}return result}},traverseUp:function(current,testElementFunction){if(!current){return false}do{if(current.nodeType===1){if(testElementFunction(current)){return current}if(Util.isMediumEditorElement(current)){return false}}current=current.parentNode}while(current);return false},htmlEntities:function(str){return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},insertHTMLCommand:function(doc,html){var selection,range,el,fragment,node,lastNode,toReplace,res=false,ecArgs=["insertHTML",false,html];if(!MediumEditor.util.isEdge&&doc.queryCommandSupported("insertHTML")){try{return doc.execCommand.apply(doc,ecArgs)}catch(ignore){}}selection=doc.getSelection();if(selection.rangeCount){range=selection.getRangeAt(0);toReplace=range.commonAncestorContainer;if(Util.isMediumEditorElement(toReplace)&&!toReplace.firstChild){range.selectNode(toReplace.appendChild(doc.createTextNode("")))}else if(toReplace.nodeType===3&&range.startOffset===0&&range.endOffset===toReplace.nodeValue.length||toReplace.nodeType!==3&&toReplace.innerHTML===range.toString()){while(!Util.isMediumEditorElement(toReplace)&&toReplace.parentNode&&toReplace.parentNode.childNodes.length===1&&!Util.isMediumEditorElement(toReplace.parentNode)){toReplace=toReplace.parentNode}range.selectNode(toReplace)}range.deleteContents();el=doc.createElement("div");el.innerHTML=html;fragment=doc.createDocumentFragment();while(el.firstChild){node=el.firstChild;lastNode=fragment.appendChild(node)}range.insertNode(fragment);if(lastNode){range=range.cloneRange();range.setStartAfter(lastNode);range.collapse(true);MediumEditor.selection.selectRange(doc,range)}res=true}if(doc.execCommand.callListeners){doc.execCommand.callListeners(ecArgs,res)}return res},execFormatBlock:function(doc,tagName){var blockContainer=Util.getTopBlockContainer(MediumEditor.selection.getSelectionStart(doc)),childNodes;if(tagName==="blockquote"){if(blockContainer){childNodes=Array.prototype.slice.call(blockContainer.childNodes);if(childNodes.some(function(childNode){return Util.isBlockContainer(childNode)})){return doc.execCommand("outdent",false,null)}}if(Util.isIE){return doc.execCommand("indent",false,tagName)}}if(blockContainer&&tagName===blockContainer.nodeName.toLowerCase()){tagName="p"}if(Util.isIE){tagName="<"+tagName+">"}if(blockContainer&&blockContainer.nodeName.toLowerCase()==="blockquote"){if(Util.isIE&&tagName==="<p>"){return doc.execCommand("outdent",false,tagName)}if((Util.isFF||Util.isEdge)&&tagName==="p"){childNodes=Array.prototype.slice.call(blockContainer.childNodes);if(childNodes.some(function(childNode){return!Util.isBlockContainer(childNode)})){doc.execCommand("formatBlock",false,tagName)}return doc.execCommand("outdent",false,tagName)}}return doc.execCommand("formatBlock",false,tagName)},setTargetBlank:function(el,anchorUrl){var i,url=anchorUrl||false;if(el.nodeName.toLowerCase()==="a"){el.target="_blank";el.rel="noopener noreferrer"}else{el=el.getElementsByTagName("a");for(i=0;i<el.length;i+=1){if(false===url||url===el[i].attributes.href.value){el[i].target="_blank";el[i].rel="noopener noreferrer"}}}},removeTargetBlank:function(el,anchorUrl){var i;if(el.nodeName.toLowerCase()==="a"){el.removeAttribute("target");el.removeAttribute("rel")}else{el=el.getElementsByTagName("a");for(i=0;i<el.length;i+=1){if(anchorUrl===el[i].attributes.href.value){el[i].removeAttribute("target");el[i].removeAttribute("rel")}}}},addClassToAnchors:function(el,buttonClass){var classes=buttonClass.split(" "),i,j;if(el.nodeName.toLowerCase()==="a"){for(j=0;j<classes.length;j+=1){el.classList.add(classes[j])}}else{var aChildren=el.getElementsByTagName("a");if(aChildren.length===0){var parentAnchor=Util.getClosestTag(el,"a");el=parentAnchor?[parentAnchor]:[]}else{el=aChildren}for(i=0;i<el.length;i+=1){for(j=0;j<classes.length;j+=1){el[i].classList.add(classes[j])}}}},isListItem:function(node){if(!node){return false}if(node.nodeName.toLowerCase()==="li"){return true}var parentNode=node.parentNode,tagName=parentNode.nodeName.toLowerCase();while(tagName==="li"||!Util.isBlockContainer(parentNode)&&tagName!=="div"){if(tagName==="li"){return true}parentNode=parentNode.parentNode;if(parentNode){tagName=parentNode.nodeName.toLowerCase()}else{return false}}return false},cleanListDOM:function(ownerDocument,element){if(element.nodeName.toLowerCase()!=="li"){return}var list=element.parentElement;if(list.parentElement.nodeName.toLowerCase()==="p"){Util.unwrap(list.parentElement,ownerDocument);MediumEditor.selection.moveCursor(ownerDocument,element.firstChild,element.firstChild.textContent.length)}},splitOffDOMTree:function(rootNode,leafNode,splitLeft){var splitOnNode=leafNode,createdNode=null,splitRight=!splitLeft;while(splitOnNode!==rootNode){var currParent=splitOnNode.parentNode,newParent=currParent.cloneNode(false),targetNode=splitRight?splitOnNode:currParent.firstChild,appendLast;if(createdNode){if(splitRight){newParent.appendChild(createdNode)}else{appendLast=createdNode}}createdNode=newParent;while(targetNode){var sibling=targetNode.nextSibling;if(targetNode===splitOnNode){if(!targetNode.hasChildNodes()){targetNode.parentNode.removeChild(targetNode)}else{targetNode=targetNode.cloneNode(false)}if(targetNode.textContent){createdNode.appendChild(targetNode)}targetNode=splitRight?sibling:null}else{targetNode.parentNode.removeChild(targetNode);if(targetNode.hasChildNodes()||targetNode.textContent){createdNode.appendChild(targetNode)}targetNode=sibling}}if(appendLast){createdNode.appendChild(appendLast)}splitOnNode=currParent}return createdNode},moveTextRangeIntoElement:function(startNode,endNode,newElement){if(!startNode||!endNode){return false}var rootNode=Util.findCommonRoot(startNode,endNode);if(!rootNode){return false}if(endNode===startNode){var temp=startNode.parentNode,sibling=startNode.nextSibling;temp.removeChild(startNode);newElement.appendChild(startNode);if(sibling){temp.insertBefore(newElement,sibling)}else{temp.appendChild(newElement)}return newElement.hasChildNodes()}var rootChildren=[],firstChild,lastChild,nextNode;for(var i=0;i<rootNode.childNodes.length;i++){nextNode=rootNode.childNodes[i];if(!firstChild){if(Util.isDescendant(nextNode,startNode,true)){firstChild=nextNode}}else{if(Util.isDescendant(nextNode,endNode,true)){lastChild=nextNode;break}else{rootChildren.push(nextNode)}}}var afterLast=lastChild.nextSibling,fragment=rootNode.ownerDocument.createDocumentFragment();if(firstChild===startNode){firstChild.parentNode.removeChild(firstChild);fragment.appendChild(firstChild)}else{fragment.appendChild(Util.splitOffDOMTree(firstChild,startNode))}rootChildren.forEach(function(element){element.parentNode.removeChild(element);fragment.appendChild(element)});if(lastChild===endNode){lastChild.parentNode.removeChild(lastChild);fragment.appendChild(lastChild)}else{fragment.appendChild(Util.splitOffDOMTree(lastChild,endNode,true))}newElement.appendChild(fragment);if(lastChild.parentNode===rootNode){rootNode.insertBefore(newElement,lastChild)}else if(afterLast){rootNode.insertBefore(newElement,afterLast)}else{rootNode.appendChild(newElement)}return newElement.hasChildNodes()},depthOfNode:function(inNode){var theDepth=0,node=inNode;while(node.parentNode!==null){node=node.parentNode;theDepth++}return theDepth},findCommonRoot:function(inNode1,inNode2){var depth1=Util.depthOfNode(inNode1),depth2=Util.depthOfNode(inNode2),node1=inNode1,node2=inNode2;while(depth1!==depth2){if(depth1>depth2){node1=node1.parentNode;depth1-=1}else{node2=node2.parentNode;depth2-=1}}while(node1!==node2){node1=node1.parentNode;node2=node2.parentNode}return node1},isElementAtBeginningOfBlock:function(node){var textVal,sibling;while(!Util.isBlockContainer(node)&&!Util.isMediumEditorElement(node)){sibling=node;while(sibling=sibling.previousSibling){textVal=sibling.nodeType===3?sibling.nodeValue:sibling.textContent;if(textVal.length>0){return false}}node=node.parentNode}return true},isMediumEditorElement:function(element){return element&&element.getAttribute&&!!element.getAttribute("data-medium-editor-element")},getContainerEditorElement:function(element){return Util.traverseUp(element,function(node){return Util.isMediumEditorElement(node)})},isBlockContainer:function(element){return element&&element.nodeType!==3&&Util.blockContainerElementNames.indexOf(element.nodeName.toLowerCase())!==-1},getClosestBlockContainer:function(node){return Util.traverseUp(node,function(node){return Util.isBlockContainer(node)||Util.isMediumEditorElement(node)})},getTopBlockContainer:function(element){var topBlock=Util.isBlockContainer(element)?element:false;Util.traverseUp(element,function(el){if(Util.isBlockContainer(el)){topBlock=el}if(!topBlock&&Util.isMediumEditorElement(el)){topBlock=el;return true}return false});return topBlock},getFirstSelectableLeafNode:function(element){while(element&&element.firstChild){element=element.firstChild}element=Util.traverseUp(element,function(el){return Util.emptyElementNames.indexOf(el.nodeName.toLowerCase())===-1});if(element.nodeName.toLowerCase()==="table"){var firstCell=element.querySelector("th, td");if(firstCell){element=firstCell}}return element},getFirstTextNode:function(element){Util.warn("getFirstTextNode is deprecated and will be removed in version 6.0.0");return Util._getFirstTextNode(element)},_getFirstTextNode:function(element){if(element.nodeType===3){return element}for(var i=0;i<element.childNodes.length;i++){var textNode=Util._getFirstTextNode(element.childNodes[i]);if(textNode!==null){return textNode}}return null},ensureUrlHasProtocol:function(url){if(url.indexOf("://")===-1){return"http://"+url}return url},warn:function(){if(window.console!==undefined&&typeof window.console.warn==="function"){window.console.warn.apply(window.console,arguments)}},deprecated:function(oldName,newName,version){var m=oldName+" is deprecated, please use "+newName+" instead.";if(version){m+=" Will be removed in "+version}Util.warn(m)},deprecatedMethod:function(oldName,newName,args,version){Util.deprecated(oldName,newName,version);if(typeof this[newName]==="function"){this[newName].apply(this,args)}},cleanupAttrs:function(el,attrs){attrs.forEach(function(attr){el.removeAttribute(attr)})},cleanupTags:function(el,tags){if(tags.indexOf(el.nodeName.toLowerCase())!==-1){el.parentNode.removeChild(el)}},unwrapTags:function(el,tags){if(tags.indexOf(el.nodeName.toLowerCase())!==-1){MediumEditor.util.unwrap(el,document)}},getClosestTag:function(el,tag){return Util.traverseUp(el,function(element){return element.nodeName.toLowerCase()===tag.toLowerCase()})},unwrap:function(el,doc){var fragment=doc.createDocumentFragment(),nodes=Array.prototype.slice.call(el.childNodes);for(var i=0;i<nodes.length;i++){fragment.appendChild(nodes[i])}if(fragment.childNodes.length){el.parentNode.replaceChild(fragment,el)}else{el.parentNode.removeChild(el)}},guid:function(){function _s4(){return Math.floor((1+Math.random())*65536).toString(16).substring(1)}return _s4()+_s4()+"-"+_s4()+"-"+_s4()+"-"+_s4()+"-"+_s4()+_s4()+_s4()}};MediumEditor.util=Util})(window);(function(){"use strict";var Extension=function(options){MediumEditor.util.extend(this,options)};Extension.extend=function(protoProps){var parent=this,child;if(protoProps&&protoProps.hasOwnProperty("constructor")){child=protoProps.constructor}else{child=function(){return parent.apply(this,arguments)}}MediumEditor.util.extend(child,parent);var Surrogate=function(){this.constructor=child};Surrogate.prototype=parent.prototype;child.prototype=new Surrogate;if(protoProps){MediumEditor.util.extend(child.prototype,protoProps)}return child};Extension.prototype={init:function(){},base:undefined,name:undefined,checkState:undefined,destroy:undefined,queryCommandState:undefined,isActive:undefined,isAlreadyApplied:undefined,setActive:undefined,setInactive:undefined,getInteractionElements:undefined,window:undefined,document:undefined,getEditorElements:function(){return this.base.elements},getEditorId:function(){return this.base.id},getEditorOption:function(option){return this.base.options[option]}};["execAction","on","off","subscribe","trigger"].forEach(function(helper){Extension.prototype[helper]=function(){return this.base[helper].apply(this.base,arguments)}});MediumEditor.Extension=Extension})();(function(){"use strict";function filterOnlyParentElements(node){if(MediumEditor.util.isBlockContainer(node)){return NodeFilter.FILTER_ACCEPT}else{return NodeFilter.FILTER_SKIP}}var Selection={findMatchingSelectionParent:function(testElementFunction,contentWindow){var selection=contentWindow.getSelection(),range,current;if(selection.rangeCount===0){return false}range=selection.getRangeAt(0);current=range.commonAncestorContainer;return MediumEditor.util.traverseUp(current,testElementFunction)},getSelectionElement:function(contentWindow){return this.findMatchingSelectionParent(function(el){return MediumEditor.util.isMediumEditorElement(el)},contentWindow)},exportSelection:function(root,doc){if(!root){return null}var selectionState=null,selection=doc.getSelection();if(selection.rangeCount>0){var range=selection.getRangeAt(0),preSelectionRange=range.cloneRange(),start;preSelectionRange.selectNodeContents(root);preSelectionRange.setEnd(range.startContainer,range.startOffset);start=preSelectionRange.toString().length;selectionState={start:start,end:start+range.toString().length};if(this.doesRangeStartWithImages(range,doc)){selectionState.startsWithImage=true}var trailingImageCount=this.getTrailingImageCount(root,selectionState,range.endContainer,range.endOffset);if(trailingImageCount){selectionState.trailingImageCount=trailingImageCount}if(start!==0){var emptyBlocksIndex=this.getIndexRelativeToAdjacentEmptyBlocks(doc,root,range.startContainer,range.startOffset);if(emptyBlocksIndex!==-1){selectionState.emptyBlocksIndex=emptyBlocksIndex}}}return selectionState},importSelection:function(selectionState,root,doc,favorLaterSelectionAnchor){if(!selectionState||!root){return}var range=doc.createRange();range.setStart(root,0);range.collapse(true);var node=root,nodeStack=[],charIndex=0,foundStart=false,foundEnd=false,trailingImageCount=0,stop=false,nextCharIndex,allowRangeToStartAtEndOfNode=false,lastTextNode=null;if(favorLaterSelectionAnchor||selectionState.startsWithImage||typeof selectionState.emptyBlocksIndex!=="undefined"){allowRangeToStartAtEndOfNode=true}while(!stop&&node){if(node.nodeType>3){node=nodeStack.pop();continue}if(node.nodeType===3&&!foundEnd){nextCharIndex=charIndex+node.length;if(!foundStart&&selectionState.start>=charIndex&&selectionState.start<=nextCharIndex){if(allowRangeToStartAtEndOfNode||selectionState.start<nextCharIndex){range.setStart(node,selectionState.start-charIndex);foundStart=true}else{lastTextNode=node}}if(foundStart&&selectionState.end>=charIndex&&selectionState.end<=nextCharIndex){if(!selectionState.trailingImageCount){range.setEnd(node,selectionState.end-charIndex);stop=true}else{foundEnd=true}}charIndex=nextCharIndex}else{if(selectionState.trailingImageCount&&foundEnd){if(node.nodeName.toLowerCase()==="img"){trailingImageCount++}if(trailingImageCount===selectionState.trailingImageCount){var endIndex=0;while(node.parentNode.childNodes[endIndex]!==node){endIndex++}range.setEnd(node.parentNode,endIndex+1);stop=true}}if(!stop&&node.nodeType===1){var i=node.childNodes.length-1;while(i>=0){nodeStack.push(node.childNodes[i]);i-=1}}}if(!stop){node=nodeStack.pop()}}if(!foundStart&&lastTextNode){range.setStart(lastTextNode,lastTextNode.length);range.setEnd(lastTextNode,lastTextNode.length)}if(typeof selectionState.emptyBlocksIndex!=="undefined"){range=this.importSelectionMoveCursorPastBlocks(doc,root,selectionState.emptyBlocksIndex,range)}if(favorLaterSelectionAnchor){range=this.importSelectionMoveCursorPastAnchor(selectionState,range)}this.selectRange(doc,range)},importSelectionMoveCursorPastAnchor:function(selectionState,range){var nodeInsideAnchorTagFunction=function(node){return node.nodeName.toLowerCase()==="a"};if(selectionState.start===selectionState.end&&range.startContainer.nodeType===3&&range.startOffset===range.startContainer.nodeValue.length&&MediumEditor.util.traverseUp(range.startContainer,nodeInsideAnchorTagFunction)){var prevNode=range.startContainer,currentNode=range.startContainer.parentNode;while(currentNode!==null&&currentNode.nodeName.toLowerCase()!=="a"){if(currentNode.childNodes[currentNode.childNodes.length-1]!==prevNode){currentNode=null}else{prevNode=currentNode;currentNode=currentNode.parentNode}}if(currentNode!==null&&currentNode.nodeName.toLowerCase()==="a"){var currentNodeIndex=null;for(var i=0;currentNodeIndex===null&&i<currentNode.parentNode.childNodes.length;i++){if(currentNode.parentNode.childNodes[i]===currentNode){currentNodeIndex=i}}range.setStart(currentNode.parentNode,currentNodeIndex+1);range.collapse(true)}}return range},importSelectionMoveCursorPastBlocks:function(doc,root,index,range){var treeWalker=doc.createTreeWalker(root,NodeFilter.SHOW_ELEMENT,filterOnlyParentElements,false),startContainer=range.startContainer,startBlock,targetNode,currIndex=0;index=index||1;if(startContainer.nodeType===3&&MediumEditor.util.isBlockContainer(startContainer.previousSibling)){startBlock=startContainer.previousSibling}else{startBlock=MediumEditor.util.getClosestBlockContainer(startContainer)}while(treeWalker.nextNode()){if(!targetNode){if(startBlock===treeWalker.currentNode){targetNode=treeWalker.currentNode}}else{targetNode=treeWalker.currentNode;currIndex++;if(currIndex===index){break}if(targetNode.textContent.length>0){break}}}if(!targetNode){targetNode=startBlock}range.setStart(MediumEditor.util.getFirstSelectableLeafNode(targetNode),0);return range},getIndexRelativeToAdjacentEmptyBlocks:function(doc,root,cursorContainer,cursorOffset){if(cursorContainer.textContent.length>0&&cursorOffset>0){return-1}var node=cursorContainer;if(node.nodeType!==3){node=cursorContainer.childNodes[cursorOffset]}if(node){if(!MediumEditor.util.isElementAtBeginningOfBlock(node)){return-1}var previousSibling=MediumEditor.util.findPreviousSibling(node);if(!previousSibling){return-1}else if(previousSibling.nodeValue){return-1}}var closestBlock=MediumEditor.util.getClosestBlockContainer(cursorContainer),treeWalker=doc.createTreeWalker(root,NodeFilter.SHOW_ELEMENT,filterOnlyParentElements,false),emptyBlocksCount=0;while(treeWalker.nextNode()){var blockIsEmpty=treeWalker.currentNode.textContent==="";if(blockIsEmpty||emptyBlocksCount>0){emptyBlocksCount+=1}if(treeWalker.currentNode===closestBlock){return emptyBlocksCount}if(!blockIsEmpty){emptyBlocksCount=0}}return emptyBlocksCount},doesRangeStartWithImages:function(range,doc){if(range.startOffset!==0||range.startContainer.nodeType!==1){return false}if(range.startContainer.nodeName.toLowerCase()==="img"){return true}var img=range.startContainer.querySelector("img");if(!img){return false}var treeWalker=doc.createTreeWalker(range.startContainer,NodeFilter.SHOW_ALL,null,false);while(treeWalker.nextNode()){var next=treeWalker.currentNode;if(next===img){break}if(next.nodeValue){return false}}return true},getTrailingImageCount:function(root,selectionState,endContainer,endOffset){if(endOffset===0||endContainer.nodeType!==1){return 0}if(endContainer.nodeName.toLowerCase()!=="img"&&!endContainer.querySelector("img")){return 0}var lastNode=endContainer.childNodes[endOffset-1];while(lastNode.hasChildNodes()){lastNode=lastNode.lastChild}var node=root,nodeStack=[],charIndex=0,foundStart=false,foundEnd=false,stop=false,nextCharIndex,trailingImages=0;while(!stop&&node){if(node.nodeType>3){node=nodeStack.pop();continue}if(node.nodeType===3&&!foundEnd){trailingImages=0;nextCharIndex=charIndex+node.length;if(!foundStart&&selectionState.start>=charIndex&&selectionState.start<=nextCharIndex){foundStart=true}if(foundStart&&selectionState.end>=charIndex&&selectionState.end<=nextCharIndex){foundEnd=true}charIndex=nextCharIndex}else{if(node.nodeName.toLowerCase()==="img"){trailingImages++}if(node===lastNode){stop=true}else if(node.nodeType===1){var i=node.childNodes.length-1;while(i>=0){nodeStack.push(node.childNodes[i]);i-=1}}}if(!stop){node=nodeStack.pop()}}return trailingImages},selectionContainsContent:function(doc){var sel=doc.getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount){return false}if(sel.toString().trim()!==""){return true}var selectionNode=this.getSelectedParentElement(sel.getRangeAt(0));if(selectionNode){if(selectionNode.nodeName.toLowerCase()==="img"||selectionNode.nodeType===1&&selectionNode.querySelector("img")){return true}}return false},selectionInContentEditableFalse:function(contentWindow){var sawtrue,sawfalse=this.findMatchingSelectionParent(function(el){var ce=el&&el.getAttribute("contenteditable");if(ce==="true"){sawtrue=true}return el.nodeName!=="#text"&&ce==="false"},contentWindow);return!sawtrue&&sawfalse},getSelectionHtml:function getSelectionHtml(doc){var i,html="",sel=doc.getSelection(),len,container;if(sel.rangeCount){container=doc.createElement("div");for(i=0,len=sel.rangeCount;i<len;i+=1){container.appendChild(sel.getRangeAt(i).cloneContents())}html=container.innerHTML}return html},getCaretOffsets:function getCaretOffsets(element,range){var preCaretRange,postCaretRange;if(!range){range=window.getSelection().getRangeAt(0)}preCaretRange=range.cloneRange();postCaretRange=range.cloneRange();preCaretRange.selectNodeContents(element);preCaretRange.setEnd(range.endContainer,range.endOffset);postCaretRange.selectNodeContents(element);postCaretRange.setStart(range.endContainer,range.endOffset);return{left:preCaretRange.toString().length,right:postCaretRange.toString().length}},rangeSelectsSingleNode:function(range){var startNode=range.startContainer;return startNode===range.endContainer&&startNode.hasChildNodes()&&range.endOffset===range.startOffset+1},getSelectedParentElement:function(range){if(!range){return null}if(this.rangeSelectsSingleNode(range)&&range.startContainer.childNodes[range.startOffset].nodeType!==3){return range.startContainer.childNodes[range.startOffset]}if(range.startContainer.nodeType===3){return range.startContainer.parentNode}return range.startContainer},getSelectedElements:function(doc){var selection=doc.getSelection(),range,toRet,currNode;if(!selection.rangeCount||selection.isCollapsed||!selection.getRangeAt(0).commonAncestorContainer){return[]}range=selection.getRangeAt(0);if(range.commonAncestorContainer.nodeType===3){toRet=[];currNode=range.commonAncestorContainer;while(currNode.parentNode&&currNode.parentNode.childNodes.length===1){toRet.push(currNode.parentNode);currNode=currNode.parentNode}return toRet}return[].filter.call(range.commonAncestorContainer.getElementsByTagName("*"),function(el){return typeof selection.containsNode==="function"?selection.containsNode(el,true):true})},selectNode:function(node,doc){var range=doc.createRange();range.selectNodeContents(node);this.selectRange(doc,range)},select:function(doc,startNode,startOffset,endNode,endOffset){var range=doc.createRange();range.setStart(startNode,startOffset);if(endNode){range.setEnd(endNode,endOffset)}else{range.collapse(true)}this.selectRange(doc,range);return range},clearSelection:function(doc,moveCursorToStart){if(moveCursorToStart){doc.getSelection().collapseToStart()}else{doc.getSelection().collapseToEnd()}},moveCursor:function(doc,node,offset){this.select(doc,node,offset)},getSelectionRange:function(ownerDocument){var selection=ownerDocument.getSelection();if(selection.rangeCount===0){return null}return selection.getRangeAt(0)},selectRange:function(ownerDocument,range){var selection=ownerDocument.getSelection();selection.removeAllRanges();selection.addRange(range)},getSelectionStart:function(ownerDocument){var node=ownerDocument.getSelection().anchorNode,startNode=node&&node.nodeType===3?node.parentNode:node;return startNode}};MediumEditor.selection=Selection})();(function(){"use strict";function isElementDescendantOfExtension(extensions,element){if(!extensions){return false}return extensions.some(function(extension){if(typeof extension.getInteractionElements!=="function"){return false}var extensionElements=extension.getInteractionElements();if(!extensionElements){return false}if(!Array.isArray(extensionElements)){extensionElements=[extensionElements]}return extensionElements.some(function(el){return MediumEditor.util.isDescendant(el,element,true)})})}var Events=function(instance){this.base=instance;this.options=this.base.options;this.events=[];this.disabledEvents={};this.customEvents={};this.listeners={}};Events.prototype={InputEventOnContenteditableSupported:!MediumEditor.util.isIE&&!MediumEditor.util.isEdge,attachDOMEvent:function(targets,event,listener,useCapture){var win=this.base.options.contentWindow,doc=this.base.options.ownerDocument;targets=MediumEditor.util.isElement(targets)||[win,doc].indexOf(targets)>-1?[targets]:targets;Array.prototype.forEach.call(targets,function(target){target.addEventListener(event,listener,useCapture);this.events.push([target,event,listener,useCapture])}.bind(this))},detachDOMEvent:function(targets,event,listener,useCapture){var index,e,win=this.base.options.contentWindow,doc=this.base.options.ownerDocument;if(targets){targets=MediumEditor.util.isElement(targets)||[win,doc].indexOf(targets)>-1?[targets]:targets;Array.prototype.forEach.call(targets,function(target){index=this.indexOfListener(target,event,listener,useCapture);if(index!==-1){e=this.events.splice(index,1)[0];e[0].removeEventListener(e[1],e[2],e[3])}}.bind(this))}},indexOfListener:function(target,event,listener,useCapture){var i,n,item;for(i=0,n=this.events.length;i<n;i=i+1){item=this.events[i];if(item[0]===target&&item[1]===event&&item[2]===listener&&item[3]===useCapture){return i}}return-1},detachAllDOMEvents:function(){var e=this.events.pop();while(e){e[0].removeEventListener(e[1],e[2],e[3]);e=this.events.pop()}},detachAllEventsFromElement:function(element){var filtered=this.events.filter(function(e){return e&&e[0].getAttribute&&e[0].getAttribute("medium-editor-index")===element.getAttribute("medium-editor-index")});for(var i=0,len=filtered.length;i<len;i++){var e=filtered[i];this.detachDOMEvent(e[0],e[1],e[2],e[3])}},attachAllEventsToElement:function(element){if(this.listeners["editableInput"]){this.contentCache[element.getAttribute("medium-editor-index")]=element.innerHTML}if(this.eventsCache){this.eventsCache.forEach(function(e){this.attachDOMEvent(element,e["name"],e["handler"].bind(this))},this)}},enableCustomEvent:function(event){if(this.disabledEvents[event]!==undefined){delete this.disabledEvents[event]}},disableCustomEvent:function(event){this.disabledEvents[event]=true},attachCustomEvent:function(event,listener){this.setupListener(event);if(!this.customEvents[event]){this.customEvents[event]=[]}this.customEvents[event].push(listener)},detachCustomEvent:function(event,listener){var index=this.indexOfCustomListener(event,listener);if(index!==-1){this.customEvents[event].splice(index,1)}},indexOfCustomListener:function(event,listener){if(!this.customEvents[event]||!this.customEvents[event].length){return-1}return this.customEvents[event].indexOf(listener)},detachAllCustomEvents:function(){this.customEvents={}},triggerCustomEvent:function(name,data,editable){if(this.customEvents[name]&&!this.disabledEvents[name]){this.customEvents[name].forEach(function(listener){listener(data,editable)})}},destroy:function(){this.detachAllDOMEvents();this.detachAllCustomEvents();this.detachExecCommand();if(this.base.elements){this.base.elements.forEach(function(element){element.removeAttribute("data-medium-focused")})}},attachToExecCommand:function(){if(this.execCommandListener){return}this.execCommandListener=function(execInfo){this.handleDocumentExecCommand(execInfo)}.bind(this);this.wrapExecCommand();this.options.ownerDocument.execCommand.listeners.push(this.execCommandListener)},detachExecCommand:function(){var doc=this.options.ownerDocument;if(!this.execCommandListener||!doc.execCommand.listeners){return}var index=doc.execCommand.listeners.indexOf(this.execCommandListener);if(index!==-1){doc.execCommand.listeners.splice(index,1)}if(!doc.execCommand.listeners.length){this.unwrapExecCommand()}},wrapExecCommand:function(){var doc=this.options.ownerDocument;if(doc.execCommand.listeners){return}var callListeners=function(args,result){if(doc.execCommand.listeners){doc.execCommand.listeners.forEach(function(listener){listener({command:args[0],value:args[2],args:args,result:result})})}},wrapper=function(){var result=doc.execCommand.orig.apply(this,arguments);if(!doc.execCommand.listeners){return result}var args=Array.prototype.slice.call(arguments);callListeners(args,result);return result};wrapper.orig=doc.execCommand;wrapper.listeners=[];wrapper.callListeners=callListeners;doc.execCommand=wrapper},unwrapExecCommand:function(){var doc=this.options.ownerDocument;if(!doc.execCommand.orig){return}doc.execCommand=doc.execCommand.orig},setupListener:function(name){if(this.listeners[name]){return}switch(name){case"externalInteraction":this.attachDOMEvent(this.options.ownerDocument.body,"mousedown",this.handleBodyMousedown.bind(this),true);this.attachDOMEvent(this.options.ownerDocument.body,"click",this.handleBodyClick.bind(this),true);this.attachDOMEvent(this.options.ownerDocument.body,"focus",this.handleBodyFocus.bind(this),true);break;case"blur":this.setupListener("externalInteraction");break;case"focus":this.setupListener("externalInteraction");break;case"editableInput":this.contentCache={};this.base.elements.forEach(function(element){this.contentCache[element.getAttribute("medium-editor-index")]=element.innerHTML},this);if(this.InputEventOnContenteditableSupported){this.attachToEachElement("input",this.handleInput)}if(!this.InputEventOnContenteditableSupported){this.setupListener("editableKeypress");this.keypressUpdateInput=true;this.attachDOMEvent(document,"selectionchange",this.handleDocumentSelectionChange.bind(this));this.attachToExecCommand()}break;case"editableClick":this.attachToEachElement("click",this.handleClick);break;case"editableBlur":this.attachToEachElement("blur",this.handleBlur);break;case"editableKeypress":this.attachToEachElement("keypress",this.handleKeypress);break;case"editableKeyup":this.attachToEachElement("keyup",this.handleKeyup);break;case"editableKeydown":this.attachToEachElement("keydown",this.handleKeydown);break;case"editableKeydownSpace":this.setupListener("editableKeydown");break;case"editableKeydownEnter":this.setupListener("editableKeydown");break;case"editableKeydownTab":this.setupListener("editableKeydown");break;case"editableKeydownDelete":this.setupListener("editableKeydown");break;case"editableMouseover":this.attachToEachElement("mouseover",this.handleMouseover);break;case"editableDrag":this.attachToEachElement("dragover",this.handleDragging);this.attachToEachElement("dragleave",this.handleDragging);break;case"editableDrop":this.attachToEachElement("drop",this.handleDrop);break;case"editablePaste":this.attachToEachElement("paste",this.handlePaste);break}this.listeners[name]=true},attachToEachElement:function(name,handler){if(!this.eventsCache){this.eventsCache=[]}this.base.elements.forEach(function(element){this.attachDOMEvent(element,name,handler.bind(this))},this);this.eventsCache.push({name:name,handler:handler})},cleanupElement:function(element){var index=element.getAttribute("medium-editor-index");if(index){this.detachAllEventsFromElement(element);if(this.contentCache){delete this.contentCache[index]}}},focusElement:function(element){element.focus();this.updateFocus(element,{target:element,type:"focus"})},updateFocus:function(target,eventObj){var hadFocus=this.base.getFocusedElement(),toFocus;if(hadFocus&&eventObj.type==="click"&&this.lastMousedownTarget&&(MediumEditor.util.isDescendant(hadFocus,this.lastMousedownTarget,true)||isElementDescendantOfExtension(this.base.extensions,this.lastMousedownTarget))){toFocus=hadFocus}if(!toFocus){this.base.elements.some(function(element){if(!toFocus&&MediumEditor.util.isDescendant(element,target,true)){toFocus=element}return!!toFocus},this)}var externalEvent=!MediumEditor.util.isDescendant(hadFocus,target,true)&&!isElementDescendantOfExtension(this.base.extensions,target);if(toFocus!==hadFocus){if(hadFocus&&externalEvent){hadFocus.removeAttribute("data-medium-focused");this.triggerCustomEvent("blur",eventObj,hadFocus)}if(toFocus){toFocus.setAttribute("data-medium-focused",true);this.triggerCustomEvent("focus",eventObj,toFocus)}}if(externalEvent){this.triggerCustomEvent("externalInteraction",eventObj)}},updateInput:function(target,eventObj){if(!this.contentCache){return}var index=target.getAttribute("medium-editor-index"),html=target.innerHTML;if(html!==this.contentCache[index]){this.triggerCustomEvent("editableInput",eventObj,target)}this.contentCache[index]=html},handleDocumentSelectionChange:function(event){if(event.currentTarget&&event.currentTarget.activeElement){var activeElement=event.currentTarget.activeElement,currentTarget;this.base.elements.some(function(element){if(MediumEditor.util.isDescendant(element,activeElement,true)){currentTarget=element;return true}return false},this);if(currentTarget){this.updateInput(currentTarget,{target:activeElement,currentTarget:currentTarget})}}},handleDocumentExecCommand:function(){var target=this.base.getFocusedElement();if(target){this.updateInput(target,{target:target,currentTarget:target})}},handleBodyClick:function(event){this.updateFocus(event.target,event)},handleBodyFocus:function(event){this.updateFocus(event.target,event)},handleBodyMousedown:function(event){this.lastMousedownTarget=event.target},handleInput:function(event){this.updateInput(event.currentTarget,event)},handleClick:function(event){this.triggerCustomEvent("editableClick",event,event.currentTarget)},handleBlur:function(event){this.triggerCustomEvent("editableBlur",event,event.currentTarget)},handleKeypress:function(event){this.triggerCustomEvent("editableKeypress",event,event.currentTarget);if(this.keypressUpdateInput){var eventObj={target:event.target,currentTarget:event.currentTarget};setTimeout(function(){this.updateInput(eventObj.currentTarget,eventObj)}.bind(this),0)}},handleKeyup:function(event){this.triggerCustomEvent("editableKeyup",event,event.currentTarget)},handleMouseover:function(event){this.triggerCustomEvent("editableMouseover",event,event.currentTarget)},handleDragging:function(event){this.triggerCustomEvent("editableDrag",event,event.currentTarget)},handleDrop:function(event){this.triggerCustomEvent("editableDrop",event,event.currentTarget)},handlePaste:function(event){this.triggerCustomEvent("editablePaste",event,event.currentTarget)},handleKeydown:function(event){this.triggerCustomEvent("editableKeydown",event,event.currentTarget);if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.SPACE)){return this.triggerCustomEvent("editableKeydownSpace",event,event.currentTarget)}if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.ENTER)||event.ctrlKey&&MediumEditor.util.isKey(event,MediumEditor.util.keyCode.M)){return this.triggerCustomEvent("editableKeydownEnter",event,event.currentTarget)}if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.TAB)){return this.triggerCustomEvent("editableKeydownTab",event,event.currentTarget)}if(MediumEditor.util.isKey(event,[MediumEditor.util.keyCode.DELETE,MediumEditor.util.keyCode.BACKSPACE])){return this.triggerCustomEvent("editableKeydownDelete",event,event.currentTarget)}}};MediumEditor.Events=Events})();(function(){"use strict";var Button=MediumEditor.Extension.extend({action:undefined,aria:undefined,tagNames:undefined,style:undefined,useQueryState:undefined,contentDefault:undefined,contentFA:undefined,classList:undefined,attrs:undefined,constructor:function(options){if(Button.isBuiltInButton(options)){MediumEditor.Extension.call(this,this.defaults[options])}else{MediumEditor.Extension.call(this,options)}},init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.button=this.createButton();this.on(this.button,"click",this.handleClick.bind(this))},getButton:function(){return this.button},getAction:function(){return typeof this.action==="function"?this.action(this.base.options):this.action},getAria:function(){return typeof this.aria==="function"?this.aria(this.base.options):this.aria},getTagNames:function(){return typeof this.tagNames==="function"?this.tagNames(this.base.options):this.tagNames},createButton:function(){var button=this.document.createElement("button"),content=this.contentDefault,ariaLabel=this.getAria(),buttonLabels=this.getEditorOption("buttonLabels");button.classList.add("medium-editor-action");button.classList.add("medium-editor-action-"+this.name);if(this.classList){this.classList.forEach(function(className){button.classList.add(className)})}button.setAttribute("data-action",this.getAction());if(ariaLabel){button.setAttribute("title",ariaLabel);button.setAttribute("aria-label",ariaLabel)}if(this.attrs){Object.keys(this.attrs).forEach(function(attr){button.setAttribute(attr,this.attrs[attr])},this)}if(buttonLabels==="fontawesome"&&this.contentFA){content=this.contentFA}button.innerHTML=content;return button},handleClick:function(event){event.preventDefault();event.stopPropagation();var action=this.getAction();if(action){this.execAction(action)}},isActive:function(){return this.button.classList.contains(this.getEditorOption("activeButtonClass"))},setInactive:function(){this.button.classList.remove(this.getEditorOption("activeButtonClass"));delete this.knownState},setActive:function(){this.button.classList.add(this.getEditorOption("activeButtonClass"));delete this.knownState},queryCommandState:function(){var queryState=null;if(this.useQueryState){queryState=this.base.queryCommandState(this.getAction())}return queryState},isAlreadyApplied:function(node){var isMatch=false,tagNames=this.getTagNames(),styleVals,computedStyle;if(this.knownState===false||this.knownState===true){return this.knownState}if(tagNames&&tagNames.length>0){isMatch=tagNames.indexOf(node.nodeName.toLowerCase())!==-1}if(!isMatch&&this.style){styleVals=this.style.value.split("|");computedStyle=this.window.getComputedStyle(node,null).getPropertyValue(this.style.prop);styleVals.forEach(function(val){if(!this.knownState){isMatch=computedStyle.indexOf(val)!==-1;if(isMatch||this.style.prop!=="text-decoration"){this.knownState=isMatch}}},this)}return isMatch}});Button.isBuiltInButton=function(name){return typeof name==="string"&&MediumEditor.extensions.button.prototype.defaults.hasOwnProperty(name)};MediumEditor.extensions.button=Button})();(function(){"use strict";MediumEditor.extensions.button.prototype.defaults={bold:{name:"bold",action:"bold",aria:"bold",tagNames:["b","strong"],style:{prop:"font-weight",value:"700|bold"},useQueryState:true,contentDefault:"<b>B</b>",contentFA:'<i class="fa fa-bold"></i>'},italic:{name:"italic",action:"italic",aria:"italic",tagNames:["i","em"],style:{prop:"font-style",value:"italic"},useQueryState:true,contentDefault:"<b><i>I</i></b>",contentFA:'<i class="fa fa-italic"></i>'},underline:{name:"underline",action:"underline",aria:"underline",tagNames:["u"],style:{prop:"text-decoration",value:"underline"},useQueryState:true,contentDefault:"<b><u>U</u></b>",contentFA:'<i class="fa fa-underline"></i>'},strikethrough:{name:"strikethrough",action:"strikethrough",aria:"strike through",tagNames:["strike"],style:{prop:"text-decoration",value:"line-through"},useQueryState:true,contentDefault:"<s>A</s>",contentFA:'<i class="fa fa-strikethrough"></i>'},superscript:{name:"superscript",action:"superscript",aria:"superscript",tagNames:["sup"],contentDefault:"<b>x<sup>1</sup></b>",contentFA:'<i class="fa fa-superscript"></i>'},subscript:{name:"subscript",action:"subscript",aria:"subscript",tagNames:["sub"],contentDefault:"<b>x<sub>1</sub></b>",contentFA:'<i class="fa fa-subscript"></i>'},image:{name:"image",action:"image",aria:"image",tagNames:["img"],contentDefault:"<b>image</b>",contentFA:'<i class="fa fa-picture-o"></i>'},html:{name:"html",action:"html",aria:"evaluate html",tagNames:["iframe","object"],contentDefault:"<b>html</b>",contentFA:'<i class="fa fa-code"></i>'},orderedlist:{name:"orderedlist",action:"insertorderedlist",aria:"ordered list",tagNames:["ol"],useQueryState:true,contentDefault:"<b>1.</b>",contentFA:'<i class="fa fa-list-ol"></i>'},unorderedlist:{name:"unorderedlist",action:"insertunorderedlist",aria:"unordered list",tagNames:["ul"],useQueryState:true,contentDefault:"<b>&bull;</b>",contentFA:'<i class="fa fa-list-ul"></i>'},indent:{name:"indent",action:"indent",aria:"indent",tagNames:[],contentDefault:"<b>&rarr;</b>",contentFA:'<i class="fa fa-indent"></i>'},outdent:{name:"outdent",action:"outdent",aria:"outdent",tagNames:[],contentDefault:"<b>&larr;</b>",contentFA:'<i class="fa fa-outdent"></i>'},justifyCenter:{name:"justifyCenter",action:"justifyCenter",aria:"center justify",tagNames:[],style:{prop:"text-align",value:"center"},contentDefault:"<b>C</b>",contentFA:'<i class="fa fa-align-center"></i>'},justifyFull:{name:"justifyFull",action:"justifyFull",aria:"full justify",tagNames:[],style:{prop:"text-align",value:"justify"},contentDefault:"<b>J</b>",contentFA:'<i class="fa fa-align-justify"></i>'},justifyLeft:{name:"justifyLeft",action:"justifyLeft",aria:"left justify",tagNames:[],style:{prop:"text-align",value:"left"},contentDefault:"<b>L</b>",contentFA:'<i class="fa fa-align-left"></i>'},justifyRight:{name:"justifyRight",action:"justifyRight",aria:"right justify",tagNames:[],style:{prop:"text-align",value:"right"},contentDefault:"<b>R</b>",contentFA:'<i class="fa fa-align-right"></i>'},removeFormat:{name:"removeFormat",aria:"remove formatting",action:"removeFormat",contentDefault:"<b>X</b>",contentFA:'<i class="fa fa-eraser"></i>'},quote:{name:"quote",action:"append-blockquote",aria:"blockquote",tagNames:["blockquote"],contentDefault:"<b>&ldquo;</b>",contentFA:'<i class="fa fa-quote-right"></i>'},pre:{name:"pre",action:"append-pre",aria:"preformatted text",tagNames:["pre"],contentDefault:"<b>0101</b>",contentFA:'<i class="fa fa-code fa-lg"></i>'},h1:{name:"h1",action:"append-h1",aria:"header type one",tagNames:["h1"],contentDefault:"<b>H1</b>",contentFA:'<i class="fa fa-header"><sup>1</sup>'},h2:{name:"h2",action:"append-h2",aria:"header type two",tagNames:["h2"],contentDefault:"<b>H2</b>",contentFA:'<i class="fa fa-header"><sup>2</sup>'},h3:{name:"h3",action:"append-h3",aria:"header type three",tagNames:["h3"],contentDefault:"<b>H3</b>",contentFA:'<i class="fa fa-header"><sup>3</sup>'},h4:{name:"h4",action:"append-h4",aria:"header type four",tagNames:["h4"],contentDefault:"<b>H4</b>",contentFA:'<i class="fa fa-header"><sup>4</sup>'},h5:{name:"h5",action:"append-h5",aria:"header type five",tagNames:["h5"],contentDefault:"<b>H5</b>",contentFA:'<i class="fa fa-header"><sup>5</sup>'},h6:{name:"h6",action:"append-h6",aria:"header type six",tagNames:["h6"],contentDefault:"<b>H6</b>",contentFA:'<i class="fa fa-header"><sup>6</sup>'}}})();(function(){"use strict";var FormExtension=MediumEditor.extensions.button.extend({init:function(){MediumEditor.extensions.button.prototype.init.apply(this,arguments)},formSaveLabel:"&#10003;",formCloseLabel:"&times;",activeClass:"medium-editor-toolbar-form-active",hasForm:true,getForm:function(){},isDisplayed:function(){if(this.hasForm){return this.getForm().classList.contains(this.activeClass)}return false},showForm:function(){if(this.hasForm){this.getForm().classList.add(this.activeClass)}},hideForm:function(){if(this.hasForm){this.getForm().classList.remove(this.activeClass)}},showToolbarDefaultActions:function(){var toolbar=this.base.getExtensionByName("toolbar");if(toolbar){toolbar.showToolbarDefaultActions()}},hideToolbarDefaultActions:function(){var toolbar=this.base.getExtensionByName("toolbar");if(toolbar){toolbar.hideToolbarDefaultActions()}},setToolbarPosition:function(){var toolbar=this.base.getExtensionByName("toolbar");if(toolbar){toolbar.setToolbarPosition()}}});MediumEditor.extensions.form=FormExtension})();(function(){"use strict";var AnchorForm=MediumEditor.extensions.form.extend({customClassOption:null,customClassOptionText:"Button",linkValidation:false,placeholderText:"Paste or type a link",targetCheckbox:false,targetCheckboxText:"Open in new window",name:"anchor",action:"createLink",aria:"link",tagNames:["a"],contentDefault:"<b>#</b>",contentFA:'<i class="fa fa-link"></i>',init:function(){MediumEditor.extensions.form.prototype.init.apply(this,arguments);this.subscribe("editableKeydown",this.handleKeydown.bind(this))},handleClick:function(event){event.preventDefault();event.stopPropagation();var range=MediumEditor.selection.getSelectionRange(this.document);if(range.startContainer.nodeName.toLowerCase()==="a"||range.endContainer.nodeName.toLowerCase()==="a"||MediumEditor.util.getClosestTag(MediumEditor.selection.getSelectedParentElement(range),"a")){var node=MediumEditor.util.getClosestTag(MediumEditor.selection.getSelectedParentElement(range),"a");if(node.getAttribute("contenteditable")=="true"){var newnode=document.createElement("div");for(var i=0;i<node.childNodes.length;i++){newnode.appendChild(node.childNodes[i].cloneNode(true))}for(var i=0,name,value;i<node.attributes.length;i++){name=node.attributes[i].name;value=node.attributes[i].value;newnode.setAttribute(name,value)}node.parentNode.insertBefore(newnode,node);node.parentNode.removeChild(node);return true}else{return this.execAction("unlink")}}if(!this.isDisplayed()){this.showForm()}return false},handleKeydown:function(event){if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.K)&&MediumEditor.util.isMetaCtrlKey(event)&&!event.shiftKey){this.handleClick(event)}},getForm:function(){if(!this.form){this.form=this.createForm()}return this.form},getTemplate:function(){var template=['<input type="text" class="medium-editor-toolbar-input" placeholder="',this.placeholderText,'">'];template.push('<a href="#" class="medium-editor-toolbar-save">',this.getEditorOption("buttonLabels")==="fontawesome"?'<i class="fa fa-check"></i>':this.formSaveLabel,"</a>");template.push('<a href="#" class="medium-editor-toolbar-close">',this.getEditorOption("buttonLabels")==="fontawesome"?'<i class="fa fa-times"></i>':this.formCloseLabel,"</a>");if(this.targetCheckbox){template.push('<div class="medium-editor-toolbar-form-row">','<input type="checkbox" class="medium-editor-toolbar-anchor-target" id="medium-editor-toolbar-anchor-target-field-'+this.getEditorId()+'">','<label for="medium-editor-toolbar-anchor-target-field-'+this.getEditorId()+'">',this.targetCheckboxText,"</label>","</div>")}if(this.customClassOption){template.push('<div class="medium-editor-toolbar-form-row">','<input type="checkbox" class="medium-editor-toolbar-anchor-button">',"<label>",this.customClassOptionText,"</label>","</div>")}return template.join("")},isDisplayed:function(){return MediumEditor.extensions.form.prototype.isDisplayed.apply(this)},hideForm:function(){MediumEditor.extensions.form.prototype.hideForm.apply(this);this.getInput().value=""},showForm:function(opts){var input=this.getInput(),targetCheckbox=this.getAnchorTargetCheckbox(),buttonCheckbox=this.getAnchorButtonCheckbox();opts=opts||{value:""};if(typeof opts==="string"){opts={value:opts}}this.base.saveSelection();this.hideToolbarDefaultActions();MediumEditor.extensions.form.prototype.showForm.apply(this);this.setToolbarPosition();input.value=opts.value;input.focus();if(targetCheckbox){targetCheckbox.checked=opts.target==="_blank"}if(buttonCheckbox){var classList=opts.buttonClass?opts.buttonClass.split(" "):[];buttonCheckbox.checked=classList.indexOf(this.customClassOption)!==-1}},destroy:function(){if(!this.form){return false}if(this.form.parentNode){this.form.parentNode.removeChild(this.form)}delete this.form},getFormOpts:function(){var targetCheckbox=this.getAnchorTargetCheckbox(),buttonCheckbox=this.getAnchorButtonCheckbox(),opts={value:this.getInput().value.trim()};if(this.linkValidation){opts.value=this.checkLinkFormat(opts.value)}opts.target="_self";if(targetCheckbox&&targetCheckbox.checked){opts.target="_blank"}if(buttonCheckbox&&buttonCheckbox.checked){opts.buttonClass=this.customClassOption}return opts},doFormSave:function(){var opts=this.getFormOpts();this.completeFormSave(opts)},completeFormSave:function(opts){this.base.restoreSelection();this.execAction(this.action,opts);this.base.checkSelection()},ensureEncodedUri:function(str){return str===decodeURI(str)?encodeURI(str):str},ensureEncodedUriComponent:function(str){return str===decodeURIComponent(str)?encodeURIComponent(str):str},ensureEncodedParam:function(param){var split=param.split("="),key=split[0],val=split[1];return key+(val===undefined?"":"="+this.ensureEncodedUriComponent(val))},ensureEncodedQuery:function(queryString){return queryString.split("&").map(this.ensureEncodedParam.bind(this)).join("&")},checkLinkFormat:function(value){var urlSchemeRegex=/^([a-z]+:)?\/\/|^(mailto|tel|maps):|^\#/i,hasScheme=urlSchemeRegex.test(value),scheme="",telRegex=/^\+?\s?\(?(?:\d\s?\-?\)?){3,20}$/,urlParts=value.match(/^(.*?)(?:\?(.*?))?(?:#(.*))?$/),path=urlParts[1],query=urlParts[2],fragment=urlParts[3];if(telRegex.test(value)){return"tel:"+value}if(!hasScheme){var host=path.split("/")[0];if(host.match(/.+(\.|:).+/)||host==="localhost"){scheme="http://"}}return scheme+this.ensureEncodedUri(path)+(query===undefined?"":"?"+this.ensureEncodedQuery(query))+(fragment===undefined?"":"#"+fragment)},doFormCancel:function(){this.base.restoreSelection();this.base.checkSelection()},attachFormEvents:function(form){var close=form.querySelector(".medium-editor-toolbar-close"),save=form.querySelector(".medium-editor-toolbar-save"),input=form.querySelector(".medium-editor-toolbar-input");this.on(form,"click",this.handleFormClick.bind(this));this.on(input,"keyup",this.handleTextboxKeyup.bind(this));this.on(close,"click",this.handleCloseClick.bind(this));this.on(save,"click",this.handleSaveClick.bind(this),true)},createForm:function(){var doc=this.document,form=doc.createElement("div");form.className="medium-editor-toolbar-form";form.id="medium-editor-toolbar-form-anchor-"+this.getEditorId();form.innerHTML=this.getTemplate();this.attachFormEvents(form);return form},getInput:function(){return this.getForm().querySelector("input.medium-editor-toolbar-input")},getAnchorTargetCheckbox:function(){return this.getForm().querySelector(".medium-editor-toolbar-anchor-target")},getAnchorButtonCheckbox:function(){return this.getForm().querySelector(".medium-editor-toolbar-anchor-button")},handleTextboxKeyup:function(event){if(event.keyCode===MediumEditor.util.keyCode.ENTER){event.preventDefault();this.doFormSave();return}if(event.keyCode===MediumEditor.util.keyCode.ESCAPE){event.preventDefault();this.doFormCancel()}},handleFormClick:function(event){event.stopPropagation()},handleSaveClick:function(event){event.preventDefault();this.doFormSave()},handleCloseClick:function(event){event.preventDefault();this.doFormCancel()}});MediumEditor.extensions.anchor=AnchorForm})();(function(){"use strict";var AnchorPreview=MediumEditor.Extension.extend({name:"anchor-preview",hideDelay:500,previewValueSelector:"a",showWhenToolbarIsVisible:false,showOnEmptyLinks:true,init:function(){this.anchorPreview=this.createPreview();this.getEditorOption("elementsContainer").appendChild(this.anchorPreview);this.attachToEditables()},getInteractionElements:function(){return this.getPreviewElement()},getPreviewElement:function(){return this.anchorPreview},createPreview:function(){var el=this.document.createElement("div");el.id="medium-editor-anchor-preview-"+this.getEditorId();el.className="medium-editor-anchor-preview";el.innerHTML=this.getTemplate();this.on(el,"click",this.handleClick.bind(this));return el},getTemplate:function(){return'<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">'+'    <a class="medium-editor-toolbar-anchor-preview-inner"></a>'+"</div>"},destroy:function(){if(this.anchorPreview){if(this.anchorPreview.parentNode){this.anchorPreview.parentNode.removeChild(this.anchorPreview)}delete this.anchorPreview}},hidePreview:function(){if(this.anchorPreview){this.anchorPreview.classList.remove("medium-editor-anchor-preview-active")}this.activeAnchor=null},showPreview:function(anchorEl){if(this.anchorPreview.classList.contains("medium-editor-anchor-preview-active")||anchorEl.getAttribute("data-disable-preview")){return true}if(this.previewValueSelector){this.anchorPreview.querySelector(this.previewValueSelector).textContent=anchorEl.attributes.href.value;this.anchorPreview.querySelector(this.previewValueSelector).href=anchorEl.attributes.href.value}this.anchorPreview.classList.add("medium-toolbar-arrow-over");this.anchorPreview.classList.remove("medium-toolbar-arrow-under");if(!this.anchorPreview.classList.contains("medium-editor-anchor-preview-active")){this.anchorPreview.classList.add("medium-editor-anchor-preview-active")}this.activeAnchor=anchorEl;this.positionPreview();this.attachPreviewHandlers();return this},positionPreview:function(activeAnchor){activeAnchor=activeAnchor||this.activeAnchor;var containerWidth=this.window.innerWidth,buttonHeight=this.anchorPreview.offsetHeight,boundary=activeAnchor.getBoundingClientRect(),diffLeft=this.diffLeft,diffTop=this.diffTop,elementsContainer=this.getEditorOption("elementsContainer"),elementsContainerAbsolute=["absolute","fixed"].indexOf(window.getComputedStyle(elementsContainer).getPropertyValue("position"))>-1,relativeBoundary={},halfOffsetWidth,defaultLeft,middleBoundary,elementsContainerBoundary,top;halfOffsetWidth=this.anchorPreview.offsetWidth/2;var toolbarExtension=this.base.getExtensionByName("toolbar");if(toolbarExtension){diffLeft=toolbarExtension.diffLeft;diffTop=toolbarExtension.diffTop}defaultLeft=diffLeft-halfOffsetWidth;if(elementsContainerAbsolute){elementsContainerBoundary=elementsContainer.getBoundingClientRect();["top","left"].forEach(function(key){relativeBoundary[key]=boundary[key]-elementsContainerBoundary[key]});relativeBoundary.width=boundary.width;relativeBoundary.height=boundary.height;boundary=relativeBoundary;containerWidth=elementsContainerBoundary.width;top=elementsContainer.scrollTop}else{top=this.window.pageYOffset}middleBoundary=boundary.left+boundary.width/2;top+=buttonHeight+boundary.top+boundary.height-diffTop-this.anchorPreview.offsetHeight;this.anchorPreview.style.top=Math.round(top)+"px";this.anchorPreview.style.right="initial";if(middleBoundary<halfOffsetWidth){this.anchorPreview.style.left=defaultLeft+halfOffsetWidth+"px";this.anchorPreview.style.right="initial"}else if(containerWidth-middleBoundary<halfOffsetWidth){this.anchorPreview.style.left="auto";this.anchorPreview.style.right=0}else{this.anchorPreview.style.left=defaultLeft+middleBoundary+"px";this.anchorPreview.style.right="initial"}},attachToEditables:function(){this.subscribe("editableMouseover",this.handleEditableMouseover.bind(this));this.subscribe("positionedToolbar",this.handlePositionedToolbar.bind(this))},handlePositionedToolbar:function(){if(!this.showWhenToolbarIsVisible){this.hidePreview()}},handleClick:function(event){var anchorExtension=this.base.getExtensionByName("anchor"),activeAnchor=this.activeAnchor;if(anchorExtension&&activeAnchor){event.preventDefault();this.base.selectElement(this.activeAnchor);this.base.delay(function(){if(activeAnchor){var opts={value:activeAnchor.attributes.href.value,target:activeAnchor.getAttribute("target"),buttonClass:activeAnchor.getAttribute("class")};anchorExtension.showForm(opts);activeAnchor=null}}.bind(this))}this.hidePreview()},handleAnchorMouseout:function(){this.anchorToPreview=null;this.off(this.activeAnchor,"mouseout",this.instanceHandleAnchorMouseout);this.instanceHandleAnchorMouseout=null},handleEditableMouseover:function(event){var target=MediumEditor.util.getClosestTag(event.target,"a");if(false===target){return}if(!this.showOnEmptyLinks&&(!/href=["']\S+["']/.test(target.outerHTML)||/href=["']#\S+["']/.test(target.outerHTML))){return true}var toolbar=this.base.getExtensionByName("toolbar");if(!this.showWhenToolbarIsVisible&&toolbar&&toolbar.isDisplayed&&toolbar.isDisplayed()){return true}if(this.activeAnchor&&this.activeAnchor!==target){this.detachPreviewHandlers()}this.anchorToPreview=target;this.instanceHandleAnchorMouseout=this.handleAnchorMouseout.bind(this);this.on(this.anchorToPreview,"mouseout",this.instanceHandleAnchorMouseout);this.base.delay(function(){if(this.anchorToPreview){this.showPreview(this.anchorToPreview)}}.bind(this))},handlePreviewMouseover:function(){this.lastOver=(new Date).getTime();this.hovering=true},handlePreviewMouseout:function(event){if(!event.relatedTarget||!/anchor-preview/.test(event.relatedTarget.className)){this.hovering=false}},updatePreview:function(){if(this.hovering){return true}var durr=(new Date).getTime()-this.lastOver;if(durr>this.hideDelay){this.detachPreviewHandlers()}},detachPreviewHandlers:function(){clearInterval(this.intervalTimer);if(this.instanceHandlePreviewMouseover){this.off(this.anchorPreview,"mouseover",this.instanceHandlePreviewMouseover);this.off(this.anchorPreview,"mouseout",this.instanceHandlePreviewMouseout);if(this.activeAnchor){this.off(this.activeAnchor,"mouseover",this.instanceHandlePreviewMouseover);this.off(this.activeAnchor,"mouseout",this.instanceHandlePreviewMouseout)}}this.hidePreview();this.hovering=this.instanceHandlePreviewMouseover=this.instanceHandlePreviewMouseout=null},attachPreviewHandlers:function(){this.lastOver=(new Date).getTime();this.hovering=true;this.instanceHandlePreviewMouseover=this.handlePreviewMouseover.bind(this);this.instanceHandlePreviewMouseout=this.handlePreviewMouseout.bind(this);this.intervalTimer=setInterval(this.updatePreview.bind(this),200);this.on(this.anchorPreview,"mouseover",this.instanceHandlePreviewMouseover);this.on(this.anchorPreview,"mouseout",this.instanceHandlePreviewMouseout);this.on(this.activeAnchor,"mouseover",this.instanceHandlePreviewMouseover);this.on(this.activeAnchor,"mouseout",this.instanceHandlePreviewMouseout)}});MediumEditor.extensions.anchorPreview=AnchorPreview})();(function(){"use strict";var WHITESPACE_CHARS,KNOWN_TLDS_FRAGMENT,LINK_REGEXP_TEXT,KNOWN_TLDS_REGEXP,LINK_REGEXP;WHITESPACE_CHARS=[" ","\t","\n","\r"," "," "," "," "," ","\u2028","\u2029"];KNOWN_TLDS_FRAGMENT="com|net|org|edu|gov|mil|aero|asia|biz|cat|coop|info|int|jobs|mobi|museum|name|post|pro|tel|travel|"+"xxx|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|"+"bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|"+"fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|"+"is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|"+"mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|"+"pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|ja|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|"+"tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw";LINK_REGEXP_TEXT="("+"((?:(https?://|ftps?://|nntp://)|www\\d{0,3}[.]|[a-z0-9.\\-]+[.]("+KNOWN_TLDS_FRAGMENT+")\\/)\\S+(?:[^\\s`!\\[\\]{};:'\".,?«»“”‘’]))"+")|(([a-z0-9\\-]+\\.)?[a-z0-9\\-]+\\.("+KNOWN_TLDS_FRAGMENT+"))";KNOWN_TLDS_REGEXP=new RegExp("^("+KNOWN_TLDS_FRAGMENT+")$","i");LINK_REGEXP=new RegExp(LINK_REGEXP_TEXT,"gi");function nodeIsNotInsideAnchorTag(node){return!MediumEditor.util.getClosestTag(node,"a")}var AutoLink=MediumEditor.Extension.extend({init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.disableEventHandling=false;this.subscribe("editableKeypress",this.onKeypress.bind(this));this.subscribe("editableBlur",this.onBlur.bind(this));this.document.execCommand("AutoUrlDetect",false,false)},isLastInstance:function(){var activeInstances=0;for(var i=0;i<this.window._mediumEditors.length;i++){var editor=this.window._mediumEditors[i];if(editor!==null&&editor.getExtensionByName("autoLink")!==undefined){activeInstances++}}return activeInstances===1},destroy:function(){if(this.document.queryCommandSupported("AutoUrlDetect")&&this.isLastInstance()){this.document.execCommand("AutoUrlDetect",false,true)}},onBlur:function(blurEvent,editable){this.performLinking(editable)},onKeypress:function(keyPressEvent){if(this.disableEventHandling){return}if(MediumEditor.util.isKey(keyPressEvent,[MediumEditor.util.keyCode.SPACE,MediumEditor.util.keyCode.ENTER])){clearTimeout(this.performLinkingTimeout);this.performLinkingTimeout=setTimeout(function(){try{var sel=this.base.exportSelection();if(this.performLinking(keyPressEvent.target)){this.base.importSelection(sel,true)}}catch(e){if(window.console){window.console.error("Failed to perform linking",e)}this.disableEventHandling=true}}.bind(this),0)}},performLinking:function(contenteditable){var blockElements=MediumEditor.util.splitByBlockElements(contenteditable),documentModified=false;if(blockElements.length===0){blockElements=[contenteditable]}for(var i=0;i<blockElements.length;i++){documentModified=this.removeObsoleteAutoLinkSpans(blockElements[i])||documentModified;documentModified=this.performLinkingWithinElement(blockElements[i])||documentModified}this.base.events.updateInput(contenteditable,{target:contenteditable,currentTarget:contenteditable});return documentModified},removeObsoleteAutoLinkSpans:function(element){if(!element||element.nodeType===3){return false}var spans=element.querySelectorAll('span[data-auto-link="true"]'),documentModified=false;for(var i=0;i<spans.length;i++){var textContent=spans[i].textContent;if(textContent.indexOf("://")===-1){textContent=MediumEditor.util.ensureUrlHasProtocol(textContent)}if(spans[i].getAttribute("data-href")!==textContent&&nodeIsNotInsideAnchorTag(spans[i])){documentModified=true;var trimmedTextContent=textContent.replace(/\s+$/,"");if(spans[i].getAttribute("data-href")===trimmedTextContent){var charactersTrimmed=textContent.length-trimmedTextContent.length,subtree=MediumEditor.util.splitOffDOMTree(spans[i],this.splitTextBeforeEnd(spans[i],charactersTrimmed));spans[i].parentNode.insertBefore(subtree,spans[i].nextSibling)}else{MediumEditor.util.unwrap(spans[i],this.document)}}}return documentModified},splitTextBeforeEnd:function(element,characterCount){var treeWalker=this.document.createTreeWalker(element,NodeFilter.SHOW_TEXT,null,false),lastChildNotExhausted=true;while(lastChildNotExhausted){lastChildNotExhausted=treeWalker.lastChild()!==null}var currentNode,currentNodeValue,previousNode;while(characterCount>0&&previousNode!==null){currentNode=treeWalker.currentNode;currentNodeValue=currentNode.nodeValue;if(currentNodeValue.length>characterCount){previousNode=currentNode.splitText(currentNodeValue.length-characterCount);characterCount=0}else{previousNode=treeWalker.previousNode();characterCount-=currentNodeValue.length}}return previousNode},performLinkingWithinElement:function(element){var matches=this.findLinkableText(element),linkCreated=false;for(var matchIndex=0;matchIndex<matches.length;matchIndex++){var matchingTextNodes=MediumEditor.util.findOrCreateMatchingTextNodes(this.document,element,matches[matchIndex]);if(this.shouldNotLink(matchingTextNodes)){continue}this.createAutoLink(matchingTextNodes,matches[matchIndex].href)}return linkCreated},shouldNotLink:function(textNodes){var shouldNotLink=false;for(var i=0;i<textNodes.length&&shouldNotLink===false;i++){shouldNotLink=!!MediumEditor.util.traverseUp(textNodes[i],function(node){return node.nodeName.toLowerCase()==="a"||node.getAttribute&&node.getAttribute("data-auto-link")==="true"})}return shouldNotLink},findLinkableText:function(contenteditable){var textContent=contenteditable.textContent,match=null,matches=[];while((match=LINK_REGEXP.exec(textContent))!==null){var matchOk=true,matchEnd=match.index+match[0].length;matchOk=(match.index===0||WHITESPACE_CHARS.indexOf(textContent[match.index-1])!==-1)&&(matchEnd===textContent.length||WHITESPACE_CHARS.indexOf(textContent[matchEnd])!==-1);matchOk=matchOk&&(match[0].indexOf("/")!==-1||KNOWN_TLDS_REGEXP.test(match[0].split(".").pop().split("?").shift()));if(matchOk){matches.push({href:match[0],start:match.index,end:matchEnd})}}return matches},createAutoLink:function(textNodes,href){href=MediumEditor.util.ensureUrlHasProtocol(href);var anchor=MediumEditor.util.createLink(this.document,textNodes,href,this.getEditorOption("targetBlank")?"_blank":null),span=this.document.createElement("span");span.setAttribute("data-auto-link","true");span.setAttribute("data-href",href);anchor.insertBefore(span,anchor.firstChild);while(anchor.childNodes.length>1){span.appendChild(anchor.childNodes[1])}}});MediumEditor.extensions.autoLink=AutoLink})();(function(){"use strict";var CLASS_DRAG_OVER="medium-editor-dragover";function clearClassNames(element){var editable=MediumEditor.util.getContainerEditorElement(element),existing=Array.prototype.slice.call(editable.parentElement.querySelectorAll("."+CLASS_DRAG_OVER));existing.forEach(function(el){el.classList.remove(CLASS_DRAG_OVER)})}var FileDragging=MediumEditor.Extension.extend({name:"fileDragging",allowedTypes:["image"],init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.subscribe("editableDrag",this.handleDrag.bind(this));this.subscribe("editableDrop",this.handleDrop.bind(this))},handleDrag:function(event){event.preventDefault();event.dataTransfer.dropEffect="copy";var target=event.target.classList?event.target:event.target.parentElement;clearClassNames(target);if(event.type==="dragover"){target.classList.add(CLASS_DRAG_OVER)}},handleDrop:function(event){event.preventDefault();event.stopPropagation();this.base.selectElement(event.target);var selection=this.base.exportSelection();/* PATCH check for selection */if(!selection){return;}/*PATCH END*/selection.start=selection.end;this.base.importSelection(selection);if(event.dataTransfer.files){Array.prototype.slice.call(event.dataTransfer.files).forEach(function(file){if(this.isAllowedFile(file)){if(file.type.match("image")){this.insertImageFile(file)}}},this)}clearClassNames(event.target)},isAllowedFile:function(file){return this.allowedTypes.some(function(fileType){return!!file.type.match(fileType)})},insertImageFile:function(file){if(typeof FileReader!=="function"){return}var fileReader=new FileReader;fileReader.readAsDataURL(file);fileReader.addEventListener("load",function(e){var addImageElement=this.document.createElement("img");addImageElement.src=e.target.result;MediumEditor.util.insertHTMLCommand(this.document,addImageElement.outerHTML)}.bind(this))}});MediumEditor.extensions.fileDragging=FileDragging})();(function(){"use strict";var KeyboardCommands=MediumEditor.Extension.extend({name:"keyboard-commands",commands:[{command:"bold",key:"B",meta:true,shift:false,alt:false},{command:"italic",key:"I",meta:true,shift:false,alt:false},{command:"underline",key:"U",meta:true,shift:false,alt:false}],init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.subscribe("editableKeydown",this.handleKeydown.bind(this));this.keys={};this.commands.forEach(function(command){var keyCode=command.key.charCodeAt(0);if(!this.keys[keyCode]){this.keys[keyCode]=[]}this.keys[keyCode].push(command)},this)},handleKeydown:function(event){var keyCode=MediumEditor.util.getKeyCode(event);if(!this.keys[keyCode]){return}var isMeta=MediumEditor.util.isMetaCtrlKey(event),isShift=!!event.shiftKey,isAlt=!!event.altKey;this.keys[keyCode].forEach(function(data){if(data.meta===isMeta&&data.shift===isShift&&(data.alt===isAlt||undefined===data.alt)){event.preventDefault();event.stopPropagation();if(typeof data.command==="function"){data.command.apply(this)}else if(false!==data.command){this.execAction(data.command)}}},this)}});MediumEditor.extensions.keyboardCommands=KeyboardCommands})();(function(){"use strict";var FontNameForm=MediumEditor.extensions.form.extend({name:"fontname",action:"fontName",aria:"change font name",contentDefault:"&#xB1;",contentFA:'<i class="fa fa-font"></i>',fonts:["","Arial","Verdana","Times New Roman"],init:function(){MediumEditor.extensions.form.prototype.init.apply(this,arguments)},handleClick:function(event){event.preventDefault();event.stopPropagation();if(!this.isDisplayed()){var fontName=this.document.queryCommandValue("fontName")+"";this.showForm(fontName)}return false},getForm:function(){if(!this.form){this.form=this.createForm()}return this.form},isDisplayed:function(){return this.getForm().style.display==="block"},hideForm:function(){this.getForm().style.display="none";this.getSelect().value=""},showForm:function(fontName){var select=this.getSelect();this.base.saveSelection();this.hideToolbarDefaultActions();this.getForm().style.display="block";this.setToolbarPosition();select.value=fontName||"";select.focus()},destroy:function(){if(!this.form){return false}if(this.form.parentNode){this.form.parentNode.removeChild(this.form)}delete this.form},doFormSave:function(){this.base.restoreSelection();this.base.checkSelection()},doFormCancel:function(){this.base.restoreSelection();this.clearFontName();this.base.checkSelection()},createForm:function(){var doc=this.document,form=doc.createElement("div"),select=doc.createElement("select"),close=doc.createElement("a"),save=doc.createElement("a"),option;form.className="medium-editor-toolbar-form";form.id="medium-editor-toolbar-form-fontname-"+this.getEditorId();this.on(form,"click",this.handleFormClick.bind(this));for(var i=0;i<this.fonts.length;i++){option=doc.createElement("option");option.innerHTML=this.fonts[i];option.value=this.fonts[i];select.appendChild(option)}select.className="medium-editor-toolbar-select";form.appendChild(select);this.on(select,"change",this.handleFontChange.bind(this));save.setAttribute("href","#");save.className="medium-editor-toobar-save";save.innerHTML=this.getEditorOption("buttonLabels")==="fontawesome"?'<i class="fa fa-check"></i>':"&#10003;";form.appendChild(save);this.on(save,"click",this.handleSaveClick.bind(this),true);close.setAttribute("href","#");close.className="medium-editor-toobar-close";close.innerHTML=this.getEditorOption("buttonLabels")==="fontawesome"?'<i class="fa fa-times"></i>':"&times;";form.appendChild(close);this.on(close,"click",this.handleCloseClick.bind(this));return form},getSelect:function(){return this.getForm().querySelector("select.medium-editor-toolbar-select")},clearFontName:function(){MediumEditor.selection.getSelectedElements(this.document).forEach(function(el){if(el.nodeName.toLowerCase()==="font"&&el.hasAttribute("face")){el.removeAttribute("face")}})},handleFontChange:function(){var font=this.getSelect().value;if(font===""){this.clearFontName()}else{this.execAction("fontName",{value:font})}},handleFormClick:function(event){event.stopPropagation()},handleSaveClick:function(event){event.preventDefault();this.doFormSave()},handleCloseClick:function(event){event.preventDefault();this.doFormCancel()}});MediumEditor.extensions.fontName=FontNameForm})();(function(){"use strict";var FontSizeForm=MediumEditor.extensions.form.extend({name:"fontsize",action:"fontSize",aria:"increase/decrease font size",contentDefault:"&#xB1;",contentFA:'<i class="fa fa-text-height"></i>',init:function(){MediumEditor.extensions.form.prototype.init.apply(this,arguments)},handleClick:function(event){event.preventDefault();event.stopPropagation();if(!this.isDisplayed()){var fontSize=this.document.queryCommandValue("fontSize")+"";this.showForm(fontSize)}return false},getForm:function(){if(!this.form){this.form=this.createForm()}return this.form},isDisplayed:function(){return this.getForm().style.display==="block"},hideForm:function(){this.getForm().style.display="none";this.getInput().value=""},showForm:function(fontSize){var input=this.getInput();this.base.saveSelection();this.hideToolbarDefaultActions();this.getForm().style.display="block";this.setToolbarPosition();input.value=fontSize||"";input.focus()},destroy:function(){if(!this.form){return false}if(this.form.parentNode){this.form.parentNode.removeChild(this.form)}delete this.form},doFormSave:function(){this.base.restoreSelection();this.base.checkSelection()},doFormCancel:function(){this.base.restoreSelection();this.clearFontSize();this.base.checkSelection()},createForm:function(){var doc=this.document,form=doc.createElement("div"),input=doc.createElement("input"),close=doc.createElement("a"),save=doc.createElement("a");form.className="medium-editor-toolbar-form";form.id="medium-editor-toolbar-form-fontsize-"+this.getEditorId();this.on(form,"click",this.handleFormClick.bind(this));input.setAttribute("type","range");input.setAttribute("min","1");input.setAttribute("max","7");input.className="medium-editor-toolbar-input";form.appendChild(input);this.on(input,"change",this.handleSliderChange.bind(this));save.setAttribute("href","#");save.className="medium-editor-toobar-save";save.innerHTML=this.getEditorOption("buttonLabels")==="fontawesome"?'<i class="fa fa-check"></i>':"&#10003;";form.appendChild(save);this.on(save,"click",this.handleSaveClick.bind(this),true);close.setAttribute("href","#");close.className="medium-editor-toobar-close";close.innerHTML=this.getEditorOption("buttonLabels")==="fontawesome"?'<i class="fa fa-times"></i>':"&times;";form.appendChild(close);this.on(close,"click",this.handleCloseClick.bind(this));return form},getInput:function(){return this.getForm().querySelector("input.medium-editor-toolbar-input")},clearFontSize:function(){MediumEditor.selection.getSelectedElements(this.document).forEach(function(el){if(el.nodeName.toLowerCase()==="font"&&el.hasAttribute("size")){el.removeAttribute("size")}})},handleSliderChange:function(){var size=this.getInput().value;if(size==="4"){this.clearFontSize()}else{this.execAction("fontSize",{value:size})}},handleFormClick:function(event){event.stopPropagation()},handleSaveClick:function(event){event.preventDefault();this.doFormSave()},handleCloseClick:function(event){event.preventDefault();this.doFormCancel()}});MediumEditor.extensions.fontSize=FontSizeForm})();(function(){"use strict";var pasteBinDefaultContent="%ME_PASTEBIN%",lastRange=null,keyboardPasteEditable=null,stopProp=function(event){event.stopPropagation()};function createReplacements(){return[[new RegExp(/^[\s\S]*<body[^>]*>\s*|\s*<\/body[^>]*>[\s\S]*$/g),""],[new RegExp(/<!--StartFragment-->|<!--EndFragment-->/g),""],[new RegExp(/<br>$/i),""],[new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi),""],[new RegExp(/<\/b>(<br[^>]*>)?$/gi),""],[new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g)," "],[new RegExp(/<br class="Apple-interchange-newline">/g),"<br>"],[new RegExp(/<span[^>]*(font-style:italic;font-weight:(bold|700)|font-weight:(bold|700);font-style:italic)[^>]*>/gi),'<span class="replace-with italic bold">'],[new RegExp(/<span[^>]*font-style:italic[^>]*>/gi),'<span class="replace-with italic">'],[new RegExp(/<span[^>]*font-weight:(bold|700)[^>]*>/gi),'<span class="replace-with bold">'],[new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi),"<$1$2>"],[new RegExp(/&lt;a(?:(?!href).)+href=(?:&quot;|&rdquo;|&ldquo;|"|“|”)(((?!&quot;|&rdquo;|&ldquo;|"|“|”).)*)(?:&quot;|&rdquo;|&ldquo;|"|“|”)(?:(?!&gt;).)*&gt;/gi),'<a href="$1">'],[new RegExp(/<\/p>\n+/gi),"</p>"],[new RegExp(/\n+<p/gi),"<p"],[new RegExp(/<\/?o:[a-z]*>/gi),""],[new RegExp(/<!\[if !supportLists\]>(((?!<!).)*)<!\[endif]\>/gi),"$1"]]}function getClipboardContent(event,win,doc){var dataTransfer=event.clipboardData||win.clipboardData||doc.dataTransfer,data={};if(!dataTransfer){return data}if(dataTransfer.getData){var legacyText=dataTransfer.getData("Text");if(legacyText&&legacyText.length>0){data["text/plain"]=legacyText}}if(dataTransfer.types){for(var i=0;i<dataTransfer.types.length;i++){var contentType=dataTransfer.types[i];data[contentType]=dataTransfer.getData(contentType)}}return data}var PasteHandler=MediumEditor.Extension.extend({forcePlainText:true,cleanPastedHTML:false,preCleanReplacements:[],cleanReplacements:[],cleanAttrs:["class","style","dir"],cleanTags:["meta"],unwrapTags:[],init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);if(this.forcePlainText||this.cleanPastedHTML){this.subscribe("editableKeydown",this.handleKeydown.bind(this));this.getEditorElements().forEach(function(element){this.on(element,"paste",this.handlePaste.bind(this))},this);this.subscribe("addElement",this.handleAddElement.bind(this))}},handleAddElement:function(event,editable){this.on(editable,"paste",this.handlePaste.bind(this))},destroy:function(){if(this.forcePlainText||this.cleanPastedHTML){this.removePasteBin()}},handlePaste:function(event,editable){if(event.defaultPrevented){return}var clipboardContent=getClipboardContent(event,this.window,this.document),pastedHTML=clipboardContent["text/html"],pastedPlain=clipboardContent["text/plain"];if(this.window.clipboardData&&event.clipboardData===undefined&&!pastedHTML){pastedHTML=pastedPlain}if(pastedHTML||pastedPlain){event.preventDefault();this.doPaste(pastedHTML,pastedPlain,editable)}},doPaste:function(pastedHTML,pastedPlain,editable){var paragraphs,html="",p;if(this.cleanPastedHTML&&pastedHTML){return this.cleanPaste(pastedHTML)}if(!pastedPlain){return}if(!(this.getEditorOption("disableReturn")||editable&&editable.getAttribute("data-disable-return"))){paragraphs=pastedPlain.split(/[\r\n]+/g);if(paragraphs.length>1){for(p=0;p<paragraphs.length;p+=1){if(paragraphs[p]!==""){html+="<p>"+MediumEditor.util.htmlEntities(paragraphs[p])+"</p>"}}}else{html=MediumEditor.util.htmlEntities(paragraphs[0])}}else{html=MediumEditor.util.htmlEntities(pastedPlain)}MediumEditor.util.insertHTMLCommand(this.document,html)},handlePasteBinPaste:function(event){if(event.defaultPrevented){this.removePasteBin();return}var clipboardContent=getClipboardContent(event,this.window,this.document),pastedHTML=clipboardContent["text/html"],pastedPlain=clipboardContent["text/plain"],editable=keyboardPasteEditable;if(!this.cleanPastedHTML||pastedHTML){event.preventDefault();this.removePasteBin();this.doPaste(pastedHTML,pastedPlain,editable);this.trigger("editablePaste",{currentTarget:editable,target:editable},editable);return}setTimeout(function(){if(this.cleanPastedHTML){pastedHTML=this.getPasteBinHtml()}this.removePasteBin();this.doPaste(pastedHTML,pastedPlain,editable);this.trigger("editablePaste",{currentTarget:editable,target:editable},editable)}.bind(this),0)},handleKeydown:function(event,editable){if(!(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.V)&&MediumEditor.util.isMetaCtrlKey(event))){return}event.stopImmediatePropagation();this.removePasteBin();this.createPasteBin(editable)},createPasteBin:function(editable){var rects,range=MediumEditor.selection.getSelectionRange(this.document),top=this.window.pageYOffset;keyboardPasteEditable=editable;if(range){rects=range.getClientRects();if(rects.length){top+=rects[0].top}else if(range.startContainer.getBoundingClientRect!==undefined){top+=range.startContainer.getBoundingClientRect().top}else{top+=range.getBoundingClientRect().top}}lastRange=range;var pasteBinElm=this.document.createElement("div");pasteBinElm.id=this.pasteBinId="medium-editor-pastebin-"+ +Date.now();pasteBinElm.setAttribute("style","border: 1px red solid; position: absolute; top: "+top+"px; width: 10px; height: 10px; overflow: hidden; opacity: 0");pasteBinElm.setAttribute("contentEditable",true);pasteBinElm.innerHTML=pasteBinDefaultContent;this.document.body.appendChild(pasteBinElm);this.on(pasteBinElm,"focus",stopProp);this.on(pasteBinElm,"focusin",stopProp);this.on(pasteBinElm,"focusout",stopProp);pasteBinElm.focus();MediumEditor.selection.selectNode(pasteBinElm,this.document);if(!this.boundHandlePaste){this.boundHandlePaste=this.handlePasteBinPaste.bind(this)}this.on(pasteBinElm,"paste",this.boundHandlePaste)},removePasteBin:function(){if(null!==lastRange){MediumEditor.selection.selectRange(this.document,lastRange);lastRange=null}if(null!==keyboardPasteEditable){keyboardPasteEditable=null}var pasteBinElm=this.getPasteBin();if(!pasteBinElm){return}if(pasteBinElm){this.off(pasteBinElm,"focus",stopProp);this.off(pasteBinElm,"focusin",stopProp);this.off(pasteBinElm,"focusout",stopProp);this.off(pasteBinElm,"paste",this.boundHandlePaste);pasteBinElm.parentElement.removeChild(pasteBinElm)}},getPasteBin:function(){return this.document.getElementById(this.pasteBinId)},getPasteBinHtml:function(){var pasteBinElm=this.getPasteBin();if(!pasteBinElm){return false}if(pasteBinElm.firstChild&&pasteBinElm.firstChild.id==="mcepastebin"){return false}var pasteBinHtml=pasteBinElm.innerHTML;if(!pasteBinHtml||pasteBinHtml===pasteBinDefaultContent){return false}return pasteBinHtml},cleanPaste:function(text){var i,elList,tmp,workEl,multiline=/<p|<br|<div/.test(text),replacements=[].concat(this.preCleanReplacements||[],createReplacements(),this.cleanReplacements||[]);for(i=0;i<replacements.length;i+=1){text=text.replace(replacements[i][0],replacements[i][1])}if(!multiline){return this.pasteHTML(text)}tmp=this.document.createElement("div");tmp.innerHTML="<p>"+text.split("<br><br>").join("</p><p>")+"</p>";elList=tmp.querySelectorAll("a,p,div,br");for(i=0;i<elList.length;i+=1){workEl=elList[i];workEl.innerHTML=workEl.innerHTML.replace(/\n/gi," ");switch(workEl.nodeName.toLowerCase()){case"p":case"div":this.filterCommonBlocks(workEl);break;case"br":this.filterLineBreak(workEl);break}}this.pasteHTML(tmp.innerHTML)},pasteHTML:function(html,options){options=MediumEditor.util.defaults({},options,{cleanAttrs:this.cleanAttrs,cleanTags:this.cleanTags,unwrapTags:this.unwrapTags});var elList,workEl,i,fragmentBody,pasteBlock=this.document.createDocumentFragment();pasteBlock.appendChild(this.document.createElement("body"));fragmentBody=pasteBlock.querySelector("body");fragmentBody.innerHTML=html;this.cleanupSpans(fragmentBody);elList=fragmentBody.querySelectorAll("*");for(i=0;i<elList.length;i+=1){workEl=elList[i];if("a"===workEl.nodeName.toLowerCase()&&this.getEditorOption("targetBlank")){MediumEditor.util.setTargetBlank(workEl)}MediumEditor.util.cleanupAttrs(workEl,options.cleanAttrs);MediumEditor.util.cleanupTags(workEl,options.cleanTags);MediumEditor.util.unwrapTags(workEl,options.unwrapTags)}MediumEditor.util.insertHTMLCommand(this.document,fragmentBody.innerHTML.replace(/&nbsp;/g," "))},isCommonBlock:function(el){return el&&(el.nodeName.toLowerCase()==="p"||el.nodeName.toLowerCase()==="div")},filterCommonBlocks:function(el){if(/^\s*$/.test(el.textContent)&&el.parentNode){el.parentNode.removeChild(el)}},filterLineBreak:function(el){if(this.isCommonBlock(el.previousElementSibling)){this.removeWithParent(el)}else if(this.isCommonBlock(el.parentNode)&&(el.parentNode.firstChild===el||el.parentNode.lastChild===el)){this.removeWithParent(el)}else if(el.parentNode&&el.parentNode.childElementCount===1&&el.parentNode.textContent===""){this.removeWithParent(el)}},removeWithParent:function(el){if(el&&el.parentNode){if(el.parentNode.parentNode&&el.parentNode.childElementCount===1){el.parentNode.parentNode.removeChild(el.parentNode)}else{el.parentNode.removeChild(el)}}},cleanupSpans:function(containerEl){var i,el,newEl,spans=containerEl.querySelectorAll(".replace-with"),isCEF=function(el){return el&&el.nodeName!=="#text"&&el.getAttribute("contenteditable")==="false"};for(i=0;i<spans.length;i+=1){el=spans[i];newEl=this.document.createElement(el.classList.contains("bold")?"b":"i");if(el.classList.contains("bold")&&el.classList.contains("italic")){newEl.innerHTML="<i>"+el.innerHTML+"</i>"}else{newEl.innerHTML=el.innerHTML}el.parentNode.replaceChild(newEl,el)}spans=containerEl.querySelectorAll("span");for(i=0;i<spans.length;i+=1){el=spans[i];if(MediumEditor.util.traverseUp(el,isCEF)){return false}MediumEditor.util.unwrap(el,this.document)}}});MediumEditor.extensions.paste=PasteHandler})();(function(){"use strict";var Placeholder=MediumEditor.Extension.extend({name:"placeholder",text:"Type your text",hideOnClick:true,init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.initPlaceholders();this.attachEventHandlers()},initPlaceholders:function(){this.getEditorElements().forEach(this.initElement,this)},handleAddElement:function(event,editable){this.initElement(editable)},initElement:function(el){if(!el.getAttribute("data-placeholder")){el.setAttribute("data-placeholder",this.text)}this.updatePlaceholder(el)},destroy:function(){this.getEditorElements().forEach(this.cleanupElement,this)},handleRemoveElement:function(event,editable){this.cleanupElement(editable)},cleanupElement:function(el){if(el.getAttribute("data-placeholder")===this.text){el.removeAttribute("data-placeholder")}},showPlaceholder:function(el){if(el){if(MediumEditor.util.isFF&&el.childNodes.length===0){el.classList.add("medium-editor-placeholder-relative");el.classList.remove("medium-editor-placeholder")}else{el.classList.add("medium-editor-placeholder");el.classList.remove("medium-editor-placeholder-relative")}}},hidePlaceholder:function(el){if(el){el.classList.remove("medium-editor-placeholder");el.classList.remove("medium-editor-placeholder-relative")}},updatePlaceholder:function(el,dontShow){if(el.querySelector("img, blockquote, ul, ol, table")||el.textContent.replace(/^\s+|\s+$/g,"")!==""){return this.hidePlaceholder(el)}if(!dontShow){this.showPlaceholder(el)}},attachEventHandlers:function(){if(this.hideOnClick){this.subscribe("focus",this.handleFocus.bind(this))}this.subscribe("editableInput",this.handleInput.bind(this));this.subscribe("blur",this.handleBlur.bind(this));this.subscribe("addElement",this.handleAddElement.bind(this));this.subscribe("removeElement",this.handleRemoveElement.bind(this))},handleInput:function(event,element){var dontShow=this.hideOnClick&&element===this.base.getFocusedElement();this.updatePlaceholder(element,dontShow)},handleFocus:function(event,element){this.hidePlaceholder(element)},handleBlur:function(event,element){this.updatePlaceholder(element)}});MediumEditor.extensions.placeholder=Placeholder})();(function(){"use strict";var Toolbar=MediumEditor.Extension.extend({name:"toolbar",align:"center",allowMultiParagraphSelection:true,buttons:["bold","italic","underline","anchor","h2","h3","quote"],diffLeft:0,diffTop:-10,firstButtonClass:"medium-editor-button-first",lastButtonClass:"medium-editor-button-last",standardizeSelectionStart:false,static:false,sticky:false,stickyTopOffset:0,updateOnEmptySelection:false,relativeContainer:null,init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.initThrottledMethods();if(!this.relativeContainer){this.getEditorOption("elementsContainer").appendChild(this.getToolbarElement())}else{this.relativeContainer.appendChild(this.getToolbarElement())}},forEachExtension:function(iterator,context){return this.base.extensions.forEach(function(command){if(command===this){return}return iterator.apply(context||this,arguments)},this)},createToolbar:function(){var toolbar=this.document.createElement("div");toolbar.id="medium-editor-toolbar-"+this.getEditorId();toolbar.className="medium-editor-toolbar";if(this.static){toolbar.className+=" static-toolbar"}else if(this.relativeContainer){toolbar.className+=" medium-editor-relative-toolbar"}else{toolbar.className+=" medium-editor-stalker-toolbar"}toolbar.appendChild(this.createToolbarButtons());this.forEachExtension(function(extension){if(extension.hasForm){toolbar.appendChild(extension.getForm())}});this.attachEventHandlers();return toolbar},createToolbarButtons:function(){var ul=this.document.createElement("ul"),li,btn,buttons,extension,buttonName,buttonOpts;ul.id="medium-editor-toolbar-actions"+this.getEditorId();ul.className="medium-editor-toolbar-actions";ul.style.display="block";this.buttons.forEach(function(button){if(typeof button==="string"){buttonName=button;buttonOpts=null}else{buttonName=button.name;buttonOpts=button}extension=this.base.addBuiltInExtension(buttonName,buttonOpts);if(extension&&typeof extension.getButton==="function"){btn=extension.getButton(this.base);li=this.document.createElement("li");if(MediumEditor.util.isElement(btn)){li.appendChild(btn)}else{li.innerHTML=btn}ul.appendChild(li)}},this);buttons=ul.querySelectorAll("button");if(buttons.length>0){buttons[0].classList.add(this.firstButtonClass);buttons[buttons.length-1].classList.add(this.lastButtonClass)}return ul},destroy:function(){if(this.toolbar){if(this.toolbar.parentNode){this.toolbar.parentNode.removeChild(this.toolbar)}delete this.toolbar}},getInteractionElements:function(){return this.getToolbarElement()},getToolbarElement:function(){if(!this.toolbar){this.toolbar=this.createToolbar()}return this.toolbar},getToolbarActionsElement:function(){return this.getToolbarElement().querySelector(".medium-editor-toolbar-actions")},initThrottledMethods:function(){this.throttledPositionToolbar=MediumEditor.util.throttle(function(){if(this.base.isActive){this.positionToolbarIfShown()}}.bind(this))},attachEventHandlers:function(){this.subscribe("blur",this.handleBlur.bind(this));this.subscribe("focus",this.handleFocus.bind(this));this.subscribe("editableClick",this.handleEditableClick.bind(this));this.subscribe("editableKeyup",this.handleEditableKeyup.bind(this));this.on(this.document.documentElement,"mouseup",this.handleDocumentMouseup.bind(this));if(this.static&&this.sticky){this.on(this.window,"scroll",this.handleWindowScroll.bind(this),true)}this.on(this.window,"resize",this.handleWindowResize.bind(this))},handleWindowScroll:function(){this.positionToolbarIfShown()},handleWindowResize:function(){this.throttledPositionToolbar()},handleDocumentMouseup:function(event){if(event&&event.target&&MediumEditor.util.isDescendant(this.getToolbarElement(),event.target)){return false}this.checkState()},handleEditableClick:function(){setTimeout(function(){this.checkState()}.bind(this),0)},handleEditableKeyup:function(){this.checkState()},handleBlur:function(){clearTimeout(this.hideTimeout);clearTimeout(this.delayShowTimeout);this.hideTimeout=setTimeout(function(){this.hideToolbar()}.bind(this),1)},handleFocus:function(){this.checkState()},isDisplayed:function(){return this.getToolbarElement().classList.contains("medium-editor-toolbar-active")},showToolbar:function(){clearTimeout(this.hideTimeout);if(!this.isDisplayed()){this.getToolbarElement().classList.add("medium-editor-toolbar-active");this.trigger("showToolbar",{},this.base.getFocusedElement())}},hideToolbar:function(){if(this.isDisplayed()){this.getToolbarElement().classList.remove("medium-editor-toolbar-active");this.trigger("hideToolbar",{},this.base.getFocusedElement())}},isToolbarDefaultActionsDisplayed:function(){return this.getToolbarActionsElement().style.display==="block"},hideToolbarDefaultActions:function(){if(this.isToolbarDefaultActionsDisplayed()){this.getToolbarActionsElement().style.display="none"}},showToolbarDefaultActions:function(){this.hideExtensionForms();if(!this.isToolbarDefaultActionsDisplayed()){this.getToolbarActionsElement().style.display="block"}this.delayShowTimeout=this.base.delay(function(){this.showToolbar()}.bind(this))},hideExtensionForms:function(){this.forEachExtension(function(extension){if(extension.hasForm&&extension.isDisplayed()){extension.hideForm()}})},multipleBlockElementsSelected:function(){var regexEmptyHTMLTags=/<[^\/>][^>]*><\/[^>]+>/gim,regexBlockElements=new RegExp("<("+MediumEditor.util.blockContainerElementNames.join("|")+")[^>]*>","g"),selectionHTML=MediumEditor.selection.getSelectionHtml(this.document).replace(regexEmptyHTMLTags,""),hasMultiParagraphs=selectionHTML.match(regexBlockElements);return!!hasMultiParagraphs&&hasMultiParagraphs.length>1},modifySelection:function(){var selection=this.window.getSelection(),selectionRange=selection.getRangeAt(0);if(this.standardizeSelectionStart&&selectionRange.startContainer.nodeValue&&selectionRange.startOffset===selectionRange.startContainer.nodeValue.length){var adjacentNode=MediumEditor.util.findAdjacentTextNodeWithContent(MediumEditor.selection.getSelectionElement(this.window),selectionRange.startContainer,this.document);if(adjacentNode){var offset=0;while(adjacentNode.nodeValue.substr(offset,1).trim().length===0){offset=offset+1}selectionRange=MediumEditor.selection.select(this.document,adjacentNode,offset,selectionRange.endContainer,selectionRange.endOffset)}}},checkState:function(){if(this.base.preventSelectionUpdates){return}if(!this.base.getFocusedElement()||MediumEditor.selection.selectionInContentEditableFalse(this.window)){return this.hideToolbar()}var selectionElement=MediumEditor.selection.getSelectionElement(this.window);if(!selectionElement||this.getEditorElements().indexOf(selectionElement)===-1||selectionElement.getAttribute("data-disable-toolbar")){return this.hideToolbar()}if(this.updateOnEmptySelection&&this.static){return this.showAndUpdateToolbar()}if(!MediumEditor.selection.selectionContainsContent(this.document)||this.allowMultiParagraphSelection===false&&this.multipleBlockElementsSelected()){return this.hideToolbar()}this.showAndUpdateToolbar()},showAndUpdateToolbar:function(){this.modifySelection();this.setToolbarButtonStates();this.trigger("positionToolbar",{},this.base.getFocusedElement());this.showToolbarDefaultActions();this.setToolbarPosition()},setToolbarButtonStates:function(){this.forEachExtension(function(extension){if(typeof extension.isActive==="function"&&typeof extension.setInactive==="function"){extension.setInactive()}});this.checkActiveButtons()},checkActiveButtons:function(){var manualStateChecks=[],queryState=null,selectionRange=MediumEditor.selection.getSelectionRange(this.document),parentNode,updateExtensionState=function(extension){if(typeof extension.checkState==="function"){extension.checkState(parentNode)}else if(typeof extension.isActive==="function"&&typeof extension.isAlreadyApplied==="function"&&typeof extension.setActive==="function"){if(!extension.isActive()&&extension.isAlreadyApplied(parentNode)){extension.setActive()}}};if(!selectionRange){return}this.forEachExtension(function(extension){if(typeof extension.queryCommandState==="function"){queryState=extension.queryCommandState();if(queryState!==null){if(queryState&&typeof extension.setActive==="function"){extension.setActive()}return}}manualStateChecks.push(extension)});parentNode=MediumEditor.selection.getSelectedParentElement(selectionRange);if(!this.getEditorElements().some(function(element){return MediumEditor.util.isDescendant(element,parentNode,true)})){return}while(parentNode){manualStateChecks.forEach(updateExtensionState);if(MediumEditor.util.isMediumEditorElement(parentNode)){break}parentNode=parentNode.parentNode}},positionToolbarIfShown:function(){if(this.isDisplayed()){this.setToolbarPosition()}},setToolbarPosition:function(){var container=this.base.getFocusedElement(),selection=this.window.getSelection();if(!container){return this}if(this.static||!selection.isCollapsed){this.showToolbar();if(!this.relativeContainer){if(this.static){this.positionStaticToolbar(container)}else{this.positionToolbar(selection)}}this.trigger("positionedToolbar",{},this.base.getFocusedElement())}},positionStaticToolbar:function(container){this.getToolbarElement().style.left="0";var scrollTop=this.document.documentElement&&this.document.documentElement.scrollTop||this.document.body.scrollTop,windowWidth=this.window.innerWidth,toolbarElement=this.getToolbarElement(),containerRect=container.getBoundingClientRect(),containerTop=containerRect.top+scrollTop,containerCenter=containerRect.left+containerRect.width/2,toolbarHeight=toolbarElement.offsetHeight,toolbarWidth=toolbarElement.offsetWidth,halfOffsetWidth=toolbarWidth/2,targetLeft;if(this.sticky){if(scrollTop>containerTop+container.offsetHeight-toolbarHeight-this.stickyTopOffset){toolbarElement.style.top=containerTop+container.offsetHeight-toolbarHeight+"px";toolbarElement.classList.remove("medium-editor-sticky-toolbar")}else if(scrollTop>containerTop-toolbarHeight-this.stickyTopOffset){toolbarElement.classList.add("medium-editor-sticky-toolbar");toolbarElement.style.top=this.stickyTopOffset+"px"}else{toolbarElement.classList.remove("medium-editor-sticky-toolbar");toolbarElement.style.top=containerTop-toolbarHeight+"px"}}else{toolbarElement.style.top=containerTop-toolbarHeight+"px"}switch(this.align){case"left":targetLeft=containerRect.left;break;case"right":targetLeft=containerRect.right-toolbarWidth;break;case"center":targetLeft=containerCenter-halfOffsetWidth;break}if(targetLeft<0){targetLeft=0}else if(targetLeft+toolbarWidth>windowWidth){targetLeft=windowWidth-Math.ceil(toolbarWidth)-1}toolbarElement.style.left=targetLeft+"px"},positionToolbar:function(selection){this.getToolbarElement().style.left="0";this.getToolbarElement().style.right="initial";var range=selection.getRangeAt(0),boundary=range.getBoundingClientRect();if(!boundary||boundary.height===0&&boundary.width===0&&range.startContainer===range.endContainer){if(range.startContainer.nodeType===1&&range.startContainer.querySelector("img")){boundary=range.startContainer.querySelector("img").getBoundingClientRect()}else{boundary=range.startContainer.getBoundingClientRect()}}var containerWidth=this.window.innerWidth,toolbarElement=this.getToolbarElement(),toolbarHeight=toolbarElement.offsetHeight,toolbarWidth=toolbarElement.offsetWidth,halfOffsetWidth=toolbarWidth/2,buttonHeight=50,defaultLeft=this.diffLeft-halfOffsetWidth,elementsContainer=this.getEditorOption("elementsContainer"),elementsContainerAbsolute=["absolute","fixed"].indexOf(window.getComputedStyle(elementsContainer).getPropertyValue("position"))>-1,positions={},relativeBoundary={},middleBoundary,elementsContainerBoundary;if(elementsContainerAbsolute){elementsContainerBoundary=elementsContainer.getBoundingClientRect();["top","left"].forEach(function(key){relativeBoundary[key]=boundary[key]-elementsContainerBoundary[key]});relativeBoundary.width=boundary.width;relativeBoundary.height=boundary.height;boundary=relativeBoundary;containerWidth=elementsContainerBoundary.width;positions.top=elementsContainer.scrollTop}else{positions.top=this.window.pageYOffset}middleBoundary=boundary.left+boundary.width/2;positions.top+=boundary.top-toolbarHeight;if(boundary.top<buttonHeight){toolbarElement.classList.add("medium-toolbar-arrow-over");toolbarElement.classList.remove("medium-toolbar-arrow-under");positions.top+=buttonHeight+boundary.height-this.diffTop}else{toolbarElement.classList.add("medium-toolbar-arrow-under");toolbarElement.classList.remove("medium-toolbar-arrow-over");positions.top+=this.diffTop}if(middleBoundary<halfOffsetWidth){positions.left=defaultLeft+halfOffsetWidth;positions.right="initial"}else if(containerWidth-middleBoundary<halfOffsetWidth){positions.left="auto";positions.right=0}else{positions.left=defaultLeft+middleBoundary;positions.right="initial"}["top","left","right"].forEach(function(key){toolbarElement.style[key]=positions[key]+(isNaN(positions[key])?"":"px")})}});MediumEditor.extensions.toolbar=Toolbar})();(function(){"use strict";var ImageDragging=MediumEditor.Extension.extend({init:function(){MediumEditor.Extension.prototype.init.apply(this,arguments);this.subscribe("editableDrag",this.handleDrag.bind(this));this.subscribe("editableDrop",this.handleDrop.bind(this))},handleDrag:function(event){var className="medium-editor-dragover";event.preventDefault();event.dataTransfer.dropEffect="copy";if(event.type==="dragover"){event.target.classList.add(className)}else if(event.type==="dragleave"){event.target.classList.remove(className)}},handleDrop:function(event){var className="medium-editor-dragover",files;event.preventDefault();event.stopPropagation();if(event.dataTransfer.files){files=Array.prototype.slice.call(event.dataTransfer.files,0);files.some(function(file){if(file.type.match("image")){var fileReader,id;fileReader=new FileReader;fileReader.readAsDataURL(file);id="medium-img-"+ +new Date;MediumEditor.util.insertHTMLCommand(this.document,'<img class="medium-editor-image-loading" id="'+id+'" />');fileReader.onload=function(){var img=this.document.getElementById(id);if(img){img.removeAttribute("id");img.removeAttribute("class");img.src=fileReader.result}}.bind(this)}}.bind(this))}event.target.classList.remove(className)}});MediumEditor.extensions.imageDragging=ImageDragging})();(function(){"use strict";function handleDisableExtraSpaces(event){var node=MediumEditor.selection.getSelectionStart(this.options.ownerDocument),textContent=node.textContent,caretPositions=MediumEditor.selection.getCaretOffsets(node);if(textContent[caretPositions.left-1]===undefined||textContent[caretPositions.left-1].trim()===""||textContent[caretPositions.left]!==undefined&&textContent[caretPositions.left].trim()===""){event.preventDefault()}}function handleDisabledEnterKeydown(event,element){if(this.options.disableReturn||element.getAttribute("data-disable-return")){event.preventDefault()}else if(this.options.disableDoubleReturn||element.getAttribute("data-disable-double-return")){var node=MediumEditor.selection.getSelectionStart(this.options.ownerDocument);if(node&&node.textContent.trim()===""&&node.nodeName.toLowerCase()!=="li"||node.previousElementSibling&&node.previousElementSibling.nodeName.toLowerCase()!=="br"&&node.previousElementSibling.textContent.trim()===""){event.preventDefault()}}}function handleTabKeydown(event){var node=MediumEditor.selection.getSelectionStart(this.options.ownerDocument),tag=node&&node.nodeName.toLowerCase();if(tag==="pre"){event.preventDefault();MediumEditor.util.insertHTMLCommand(this.options.ownerDocument,"    ")}if(MediumEditor.util.isListItem(node)){event.preventDefault();if(event.shiftKey){this.options.ownerDocument.execCommand("outdent",false,null)}else{this.options.ownerDocument.execCommand("indent",false,null)}}}function handleBlockDeleteKeydowns(event){var p,node=MediumEditor.selection.getSelectionStart(this.options.ownerDocument),tagName=node.nodeName.toLowerCase(),isEmpty=/^(\s+|<br\/?>)?$/i,isHeader=/h\d/i;if(MediumEditor.util.isKey(event,[MediumEditor.util.keyCode.BACKSPACE,MediumEditor.util.keyCode.ENTER])&&node.previousElementSibling&&isHeader.test(tagName)&&MediumEditor.selection.getCaretOffsets(node).left===0){if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.BACKSPACE)&&isEmpty.test(node.previousElementSibling.innerHTML)){node.previousElementSibling.parentNode.removeChild(node.previousElementSibling);event.preventDefault()}else if(!this.options.disableDoubleReturn&&MediumEditor.util.isKey(event,MediumEditor.util.keyCode.ENTER)){p=this.options.ownerDocument.createElement("p");p.innerHTML="<br>";node.previousElementSibling.parentNode.insertBefore(p,node);event.preventDefault()}}else if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.DELETE)&&node.nextElementSibling&&node.previousElementSibling&&!isHeader.test(tagName)&&isEmpty.test(node.innerHTML)&&isHeader.test(node.nextElementSibling.nodeName.toLowerCase())){MediumEditor.selection.moveCursor(this.options.ownerDocument,node.nextElementSibling);node.previousElementSibling.parentNode.removeChild(node);event.preventDefault()}else if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.BACKSPACE)&&tagName==="li"&&isEmpty.test(node.innerHTML)&&!node.previousElementSibling&&!node.parentElement.previousElementSibling&&node.nextElementSibling&&node.nextElementSibling.nodeName.toLowerCase()==="li"){p=this.options.ownerDocument.createElement("p");p.innerHTML="<br>";node.parentElement.parentElement.insertBefore(p,node.parentElement);MediumEditor.selection.moveCursor(this.options.ownerDocument,p);node.parentElement.removeChild(node);event.preventDefault()}else if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.BACKSPACE)&&MediumEditor.util.getClosestTag(node,"blockquote")!==false&&MediumEditor.selection.getCaretOffsets(node).left===0){event.preventDefault();MediumEditor.util.execFormatBlock(this.options.ownerDocument,"p")}else if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.ENTER)&&MediumEditor.util.getClosestTag(node,"blockquote")!==false&&MediumEditor.selection.getCaretOffsets(node).right===0){p=this.options.ownerDocument.createElement("p");p.innerHTML="<br>";node.parentElement.insertBefore(p,node.nextSibling);MediumEditor.selection.moveCursor(this.options.ownerDocument,p);event.preventDefault()}else if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.BACKSPACE)&&MediumEditor.util.isMediumEditorElement(node.parentElement)&&!node.previousElementSibling&&node.nextElementSibling&&isEmpty.test(node.innerHTML)){event.preventDefault();MediumEditor.selection.moveCursor(this.options.ownerDocument,node.nextSibling);node.parentElement.removeChild(node)}}function handleKeyup(event){var node=MediumEditor.selection.getSelectionStart(this.options.ownerDocument),tagName;if(!node){return}if(MediumEditor.util.isMediumEditorElement(node)&&node.children.length===0&&!MediumEditor.util.isBlockContainer(node)){this.options.ownerDocument.execCommand("formatBlock",false,"p")}if(MediumEditor.util.isKey(event,MediumEditor.util.keyCode.ENTER)&&!MediumEditor.util.isListItem(node)&&!MediumEditor.util.isBlockContainer(node)){tagName=node.nodeName.toLowerCase();if(tagName==="a"){this.options.ownerDocument.execCommand("unlink",false,null)}else if(!event.shiftKey&&!event.ctrlKey){this.options.ownerDocument.execCommand("formatBlock",false,"p")}}}function handleEditableInput(event,editable){var textarea=editable.parentNode.querySelector('textarea[medium-editor-textarea-id="'+editable.getAttribute("medium-editor-textarea-id")+'"]');if(textarea){textarea.value=editable.innerHTML.trim()}}function addToEditors(win){if(!win._mediumEditors){win._mediumEditors=[null]}if(!this.id){this.id=win._mediumEditors.length}win._mediumEditors[this.id]=this}function removeFromEditors(win){if(!win._mediumEditors||!win._mediumEditors[this.id]){return}win._mediumEditors[this.id]=null}function createElementsArray(selector,doc,filterEditorElements){var elements=[];if(!selector){selector=[]}if(typeof selector==="string"){selector=doc.querySelectorAll(selector)}if(MediumEditor.util.isElement(selector)){selector=[selector]}if(filterEditorElements){for(var i=0;i<selector.length;i++){var el=selector[i];if(MediumEditor.util.isElement(el)&&!el.getAttribute("data-medium-editor-element")&&!el.getAttribute("medium-editor-textarea-id")){elements.push(el)}}}else{elements=Array.prototype.slice.apply(selector)}return elements}function cleanupTextareaElement(element){var textarea=element.parentNode.querySelector('textarea[medium-editor-textarea-id="'+element.getAttribute("medium-editor-textarea-id")+'"]');if(textarea){textarea.classList.remove("medium-editor-hidden");textarea.removeAttribute("medium-editor-textarea-id")}if(element.parentNode){element.parentNode.removeChild(element)}}function setExtensionDefaults(extension,defaults){Object.keys(defaults).forEach(function(prop){if(extension[prop]===undefined){extension[prop]=defaults[prop]}});return extension}function initExtension(extension,name,instance){var extensionDefaults={window:instance.options.contentWindow,document:instance.options.ownerDocument,base:instance};extension=setExtensionDefaults(extension,extensionDefaults);if(typeof extension.init==="function"){extension.init()}if(!extension.name){extension.name=name}return extension}function isToolbarEnabled(){if(this.elements.every(function(element){return!!element.getAttribute("data-disable-toolbar")})){return false}return this.options.toolbar!==false}function isAnchorPreviewEnabled(){if(!isToolbarEnabled.call(this)){return false}return this.options.anchorPreview!==false}function isPlaceholderEnabled(){return this.options.placeholder!==false}function isAutoLinkEnabled(){return this.options.autoLink!==false}function isImageDraggingEnabled(){return this.options.imageDragging!==false}function isKeyboardCommandsEnabled(){return this.options.keyboardCommands!==false}function shouldUseFileDraggingExtension(){return!this.options.extensions["imageDragging"]}function createContentEditable(textarea){var div=this.options.ownerDocument.createElement("div"),now=Date.now(),uniqueId="medium-editor-"+now,atts=textarea.attributes;while(this.options.ownerDocument.getElementById(uniqueId)){now++;uniqueId="medium-editor-"+now}div.className=textarea.className;div.id=uniqueId;div.innerHTML=textarea.value;textarea.setAttribute("medium-editor-textarea-id",uniqueId);for(var i=0,n=atts.length;i<n;i++){if(!div.hasAttribute(atts[i].nodeName)){div.setAttribute(atts[i].nodeName,atts[i].value)}}if(textarea.form){this.on(textarea.form,"reset",function(event){if(!event.defaultPrevented){this.resetContent(this.options.ownerDocument.getElementById(uniqueId))}}.bind(this))}textarea.classList.add("medium-editor-hidden");textarea.parentNode.insertBefore(div,textarea);return div}function initElement(element,editorId){if(!element.getAttribute("data-medium-editor-element")){if(element.nodeName.toLowerCase()==="textarea"){element=createContentEditable.call(this,element);if(!this.instanceHandleEditableInput){this.instanceHandleEditableInput=handleEditableInput.bind(this);this.subscribe("editableInput",this.instanceHandleEditableInput)}}if(!this.options.disableEditing&&!element.getAttribute("data-disable-editing")){element.setAttribute("contentEditable",true);element.setAttribute("spellcheck",this.options.spellcheck)}if(!this.instanceHandleEditableKeydownEnter){if(element.getAttribute("data-disable-return")||element.getAttribute("data-disable-double-return")){this.instanceHandleEditableKeydownEnter=handleDisabledEnterKeydown.bind(this);this.subscribe("editableKeydownEnter",this.instanceHandleEditableKeydownEnter)}}if(!this.options.disableReturn&&!element.getAttribute("data-disable-return")){this.on(element,"keyup",handleKeyup.bind(this))}var elementId=MediumEditor.util.guid();element.setAttribute("data-medium-editor-element",true);element.classList.add("medium-editor-element");element.setAttribute("role","textbox");element.setAttribute("aria-multiline",true);element.setAttribute("data-medium-editor-editor-index",editorId);element.setAttribute("medium-editor-index",elementId);initialContent[elementId]=element.innerHTML;this.events.attachAllEventsToElement(element)}return element}function attachHandlers(){this.subscribe("editableKeydownTab",handleTabKeydown.bind(this));this.subscribe("editableKeydownDelete",handleBlockDeleteKeydowns.bind(this));this.subscribe("editableKeydownEnter",handleBlockDeleteKeydowns.bind(this));if(this.options.disableExtraSpaces){this.subscribe("editableKeydownSpace",handleDisableExtraSpaces.bind(this))}if(!this.instanceHandleEditableKeydownEnter){if(this.options.disableReturn||this.options.disableDoubleReturn){this.instanceHandleEditableKeydownEnter=handleDisabledEnterKeydown.bind(this);this.subscribe("editableKeydownEnter",this.instanceHandleEditableKeydownEnter)}}}function initExtensions(){this.extensions=[];Object.keys(this.options.extensions).forEach(function(name){if(name!=="toolbar"&&this.options.extensions[name]){this.extensions.push(initExtension(this.options.extensions[name],name,this))}},this);if(shouldUseFileDraggingExtension.call(this)){var opts=this.options.fileDragging;if(!opts){opts={};if(!isImageDraggingEnabled.call(this)){opts.allowedTypes=[]}}this.addBuiltInExtension("fileDragging",opts)}var builtIns={paste:true,"anchor-preview":isAnchorPreviewEnabled.call(this),autoLink:isAutoLinkEnabled.call(this),keyboardCommands:isKeyboardCommandsEnabled.call(this),placeholder:isPlaceholderEnabled.call(this)};Object.keys(builtIns).forEach(function(name){if(builtIns[name]){this.addBuiltInExtension(name)}},this);var toolbarExtension=this.options.extensions["toolbar"];if(!toolbarExtension&&isToolbarEnabled.call(this)){var toolbarOptions=MediumEditor.util.extend({},this.options.toolbar,{allowMultiParagraphSelection:this.options.allowMultiParagraphSelection});toolbarExtension=new MediumEditor.extensions.toolbar(toolbarOptions)}if(toolbarExtension){this.extensions.push(initExtension(toolbarExtension,"toolbar",this))}}function mergeOptions(defaults,options){var deprecatedProperties=[["allowMultiParagraphSelection","toolbar.allowMultiParagraphSelection"]];if(options){deprecatedProperties.forEach(function(pair){if(options.hasOwnProperty(pair[0])&&options[pair[0]]!==undefined){MediumEditor.util.deprecated(pair[0],pair[1],"v6.0.0")}})}return MediumEditor.util.defaults({},options,defaults)}function execActionInternal(action,opts){var appendAction=/^append-(.+)$/gi,justifyAction=/justify([A-Za-z]*)$/g,match,cmdValueArgument;match=appendAction.exec(action);if(match){return MediumEditor.util.execFormatBlock(this.options.ownerDocument,match[1])}if(action==="fontSize"){if(opts.size){MediumEditor.util.deprecated(".size option for fontSize command",".value","6.0.0")}cmdValueArgument=opts.value||opts.size;return this.options.ownerDocument.execCommand("fontSize",false,cmdValueArgument)}if(action==="fontName"){if(opts.name){MediumEditor.util.deprecated(".name option for fontName command",".value","6.0.0")}cmdValueArgument=opts.value||opts.name;return this.options.ownerDocument.execCommand("fontName",false,cmdValueArgument)}if(action==="createLink"){return this.createLink(opts)}if(action==="image"){var src=this.options.contentWindow.getSelection().toString().trim();return this.options.ownerDocument.execCommand("insertImage",false,src)}if(action==="html"){var html=this.options.contentWindow.getSelection().toString().trim();return MediumEditor.util.insertHTMLCommand(this.options.ownerDocument,html)}if(justifyAction.exec(action)){var result=this.options.ownerDocument.execCommand(action,false,null),parentNode=MediumEditor.selection.getSelectedParentElement(MediumEditor.selection.getSelectionRange(this.options.ownerDocument));if(parentNode){cleanupJustifyDivFragments.call(this,MediumEditor.util.getTopBlockContainer(parentNode))}return result}cmdValueArgument=opts&&opts.value;return this.options.ownerDocument.execCommand(action,false,cmdValueArgument)}function cleanupJustifyDivFragments(blockContainer){if(!blockContainer){return}var textAlign,childDivs=Array.prototype.slice.call(blockContainer.childNodes).filter(function(element){var isDiv=element.nodeName.toLowerCase()==="div";if(isDiv&&!textAlign){textAlign=element.style.textAlign}return isDiv});if(childDivs.length){this.saveSelection();childDivs.forEach(function(div){if(div.style.textAlign===textAlign){var lastChild=div.lastChild;if(lastChild){MediumEditor.util.unwrap(div,this.options.ownerDocument);var br=this.options.ownerDocument.createElement("BR");lastChild.parentNode.insertBefore(br,lastChild.nextSibling)}}},this);blockContainer.style.textAlign=textAlign;this.restoreSelection()}}var initialContent={};MediumEditor.prototype={init:function(elements,options){this.options=mergeOptions.call(this,this.defaults,options);this.origElements=elements;if(!this.options.elementsContainer){this.options.elementsContainer=this.options.ownerDocument.body}return this.setup()},setup:function(){if(this.isActive){return}addToEditors.call(this,this.options.contentWindow);this.events=new MediumEditor.Events(this);this.elements=[];this.addElements(this.origElements);if(this.elements.length===0){return}this.isActive=true;initExtensions.call(this);attachHandlers.call(this)},destroy:function(){if(!this.isActive){return}this.isActive=false;this.extensions.forEach(function(extension){if(typeof extension.destroy==="function"){extension.destroy()}},this);this.events.destroy();this.elements.forEach(function(element){if(this.options.spellcheck){element.innerHTML=element.innerHTML}element.removeAttribute("contentEditable");element.removeAttribute("spellcheck");element.removeAttribute("data-medium-editor-element");element.classList.remove("medium-editor-element");element.removeAttribute("role");element.removeAttribute("aria-multiline");element.removeAttribute("medium-editor-index");element.removeAttribute("data-medium-editor-editor-index");if(element.getAttribute("medium-editor-textarea-id")){cleanupTextareaElement(element)}},this);this.elements=[];this.instanceHandleEditableKeydownEnter=null;this.instanceHandleEditableInput=null;removeFromEditors.call(this,this.options.contentWindow)},on:function(target,event,listener,useCapture){this.events.attachDOMEvent(target,event,listener,useCapture);return this},off:function(target,event,listener,useCapture){this.events.detachDOMEvent(target,event,listener,useCapture);return this},subscribe:function(event,listener){this.events.attachCustomEvent(event,listener);return this},unsubscribe:function(event,listener){this.events.detachCustomEvent(event,listener);return this},trigger:function(name,data,editable){this.events.triggerCustomEvent(name,data,editable);return this},delay:function(fn){var self=this;return setTimeout(function(){if(self.isActive){fn()}},this.options.delay)},serialize:function(){var i,elementid,content={},len=this.elements.length;for(i=0;i<len;i+=1){elementid=this.elements[i].id!==""?this.elements[i].id:"element-"+i;content[elementid]={value:this.elements[i].innerHTML.trim()}}return content},getExtensionByName:function(name){var extension;if(this.extensions&&this.extensions.length){this.extensions.some(function(ext){if(ext.name===name){extension=ext;return true}return false})}return extension},addBuiltInExtension:function(name,opts){var extension=this.getExtensionByName(name),merged;if(extension){return extension}switch(name){case"anchor":merged=MediumEditor.util.extend({},this.options.anchor,opts);extension=new MediumEditor.extensions.anchor(merged);break;case"anchor-preview":extension=new MediumEditor.extensions.anchorPreview(this.options.anchorPreview);break;case"autoLink":extension=new MediumEditor.extensions.autoLink;break;case"fileDragging":extension=new MediumEditor.extensions.fileDragging(opts);break;case"fontname":extension=new MediumEditor.extensions.fontName(this.options.fontName);break;case"fontsize":extension=new MediumEditor.extensions.fontSize(opts);break;case"keyboardCommands":extension=new MediumEditor.extensions.keyboardCommands(this.options.keyboardCommands);break;case"paste":extension=new MediumEditor.extensions.paste(this.options.paste);break;case"placeholder":extension=new MediumEditor.extensions.placeholder(this.options.placeholder);break;default:if(MediumEditor.extensions.button.isBuiltInButton(name)){if(opts){merged=MediumEditor.util.defaults({},opts,MediumEditor.extensions.button.prototype.defaults[name]);extension=new MediumEditor.extensions.button(merged)}else{extension=new MediumEditor.extensions.button(name)}}}if(extension){this.extensions.push(initExtension(extension,name,this))}return extension},stopSelectionUpdates:function(){this.preventSelectionUpdates=true},startSelectionUpdates:function(){this.preventSelectionUpdates=false},checkSelection:function(){var toolbar=this.getExtensionByName("toolbar");if(toolbar){toolbar.checkState()}return this},queryCommandState:function(action){var fullAction=/^full-(.+)$/gi,match,queryState=null;match=fullAction.exec(action);if(match){action=match[1]}try{queryState=this.options.ownerDocument.queryCommandState(action)}catch(exc){queryState=null}return queryState},execAction:function(action,opts){var fullAction=/^full-(.+)$/gi,match,result;match=fullAction.exec(action);if(match){this.saveSelection();this.selectAllContents();result=execActionInternal.call(this,match[1],opts);this.restoreSelection()}else{result=execActionInternal.call(this,action,opts)}if(action==="insertunorderedlist"||action==="insertorderedlist"){MediumEditor.util.cleanListDOM(this.options.ownerDocument,this.getSelectedParentElement())}this.checkSelection();return result},getSelectedParentElement:function(range){if(range===undefined){range=this.options.contentWindow.getSelection().getRangeAt(0)}return MediumEditor.selection.getSelectedParentElement(range)},selectAllContents:function(){var currNode=MediumEditor.selection.getSelectionElement(this.options.contentWindow);if(currNode){while(currNode.children.length===1){currNode=currNode.children[0]}this.selectElement(currNode)}},selectElement:function(element){element.removeAttribute("contenteditable");MediumEditor.selection.selectNode(element,this.options.ownerDocument);var selElement=MediumEditor.selection.getSelectionElement(this.options.contentWindow);if(selElement){this.events.focusElement(selElement)}},getFocusedElement:function(){var focused;this.elements.some(function(element){if(!focused&&element.getAttribute("data-medium-focused")){focused=element}return!!focused},this);return focused},exportSelection:function(){var selectionElement=MediumEditor.selection.getSelectionElement(this.options.contentWindow),editableElementIndex=this.elements.indexOf(selectionElement),selectionState=null;if(editableElementIndex>=0){selectionState=MediumEditor.selection.exportSelection(selectionElement,this.options.ownerDocument)}if(selectionState!==null&&editableElementIndex!==0){selectionState.editableElementIndex=editableElementIndex}return selectionState},saveSelection:function(){this.selectionState=this.exportSelection()},importSelection:function(selectionState,favorLaterSelectionAnchor){if(!selectionState){return}var editableElement=this.elements[selectionState.editableElementIndex||0];MediumEditor.selection.importSelection(selectionState,editableElement,this.options.ownerDocument,favorLaterSelectionAnchor)},restoreSelection:function(){this.importSelection(this.selectionState)},createLink:function(opts){var currentEditor=MediumEditor.selection.getSelectionElement(this.options.contentWindow),customEvent={},targetUrl;if(this.elements.indexOf(currentEditor)===-1){return}try{this.events.disableCustomEvent("editableInput");if(opts.url){MediumEditor.util.deprecated(".url option for createLink",".value","6.0.0")}targetUrl=opts.url||opts.value;if(targetUrl&&targetUrl.trim().length>0){var currentSelection=this.options.contentWindow.getSelection();if(currentSelection){var currRange=currentSelection.getRangeAt(0),commonAncestorContainer=currRange.commonAncestorContainer,exportedSelection,startContainerParentElement,endContainerParentElement,textNodes;if(currRange.endContainer.nodeType===3&&currRange.startContainer.nodeType!==3&&currRange.startOffset===0&&currRange.startContainer.firstChild===currRange.endContainer){commonAncestorContainer=currRange.endContainer}startContainerParentElement=MediumEditor.util.getClosestBlockContainer(currRange.startContainer);endContainerParentElement=MediumEditor.util.getClosestBlockContainer(currRange.endContainer);if(commonAncestorContainer.nodeType!==3&&commonAncestorContainer.textContent.length!==0&&startContainerParentElement===endContainerParentElement){var parentElement=startContainerParentElement||currentEditor,fragment=this.options.ownerDocument.createDocumentFragment();this.execAction("unlink");exportedSelection=this.exportSelection();fragment.appendChild(parentElement.cloneNode(true));if(currentEditor===parentElement){MediumEditor.selection.select(this.options.ownerDocument,parentElement.firstChild,0,parentElement.lastChild,parentElement.lastChild.nodeType===3?parentElement.lastChild.nodeValue.length:parentElement.lastChild.childNodes.length)}else{MediumEditor.selection.select(this.options.ownerDocument,parentElement,0,parentElement,parentElement.childNodes.length)}var modifiedExportedSelection=this.exportSelection();textNodes=MediumEditor.util.findOrCreateMatchingTextNodes(this.options.ownerDocument,fragment,{start:exportedSelection.start-modifiedExportedSelection.start,end:exportedSelection.end-modifiedExportedSelection.start,editableElementIndex:exportedSelection.editableElementIndex});if(textNodes.length===0){fragment=this.options.ownerDocument.createDocumentFragment();fragment.appendChild(commonAncestorContainer.cloneNode(true));textNodes=[fragment.firstChild.firstChild,fragment.firstChild.lastChild]}MediumEditor.util.createLink(this.options.ownerDocument,textNodes,targetUrl.trim());var leadingWhitespacesCount=(fragment.firstChild.innerHTML.match(/^\s+/)||[""])[0].length;MediumEditor.util.insertHTMLCommand(this.options.ownerDocument,fragment.firstChild.innerHTML.replace(/^\s+/,""));exportedSelection.start-=leadingWhitespacesCount;exportedSelection.end-=leadingWhitespacesCount;this.importSelection(exportedSelection)}else{var selection=window.getSelection();var range=selection.rangeCount?selection.getRangeAt(0):null;var node=range?MediumEditor.util.getClosestTag(MediumEditor.selection.getSelectedParentElement(range),"a"):null;if(node&&node.getAttribute&&(node.getAttribute("contenteditable")||node.getAttribute("editable"))){node.setAttribute("href",targetUrl)}else{this.options.ownerDocument.execCommand("createLink",false,targetUrl)}}if(this.options.targetBlank||opts.target==="_blank"){MediumEditor.util.setTargetBlank(MediumEditor.selection.getSelectionStart(this.options.ownerDocument),targetUrl)}else{MediumEditor.util.removeTargetBlank(MediumEditor.selection.getSelectionStart(this.options.ownerDocument),targetUrl)}if(opts.buttonClass){MediumEditor.util.addClassToAnchors(MediumEditor.selection.getSelectionStart(this.options.ownerDocument),opts.buttonClass)}}}if(this.options.targetBlank||opts.target==="_blank"||opts.buttonClass){customEvent=this.options.ownerDocument.createEvent("HTMLEvents");customEvent.initEvent("input",true,true,this.options.contentWindow);for(var i=0,len=this.elements.length;i<len;i+=1){this.elements[i].dispatchEvent(customEvent)}}}finally{this.events.enableCustomEvent("editableInput")}this.events.triggerCustomEvent("editableInput",customEvent,currentEditor)},cleanPaste:function(text){this.getExtensionByName("paste").cleanPaste(text)},pasteHTML:function(html,options){this.getExtensionByName("paste").pasteHTML(html,options)},setContent:function(html,index){index=index||0;if(this.elements[index]){var target=this.elements[index];target.innerHTML=html;this.checkContentChanged(target)}},getContent:function(index){index=index||0;if(this.elements[index]){return this.elements[index].innerHTML.trim()}return null},checkContentChanged:function(editable){editable=editable||MediumEditor.selection.getSelectionElement(this.options.contentWindow);this.events.updateInput(editable,{target:editable,currentTarget:editable})},resetContent:function(element){if(element){var index=this.elements.indexOf(element);if(index!==-1){this.setContent(initialContent[element.getAttribute("medium-editor-index")],index)}return}this.elements.forEach(function(el,idx){this.setContent(initialContent[el.getAttribute("medium-editor-index")],idx)},this)},addElements:function(selector){var elements=createElementsArray(selector,this.options.ownerDocument,true);if(elements.length===0){return false}elements.forEach(function(element){element=initElement.call(this,element,this.id);this.elements.push(element);this.trigger("addElement",{target:element,currentTarget:element},element)},this)},removeElements:function(selector){var elements=createElementsArray(selector,this.options.ownerDocument),toRemove=elements.map(function(el){if(el.getAttribute("medium-editor-textarea-id")&&el.parentNode){return el.parentNode.querySelector('div[medium-editor-textarea-id="'+el.getAttribute("medium-editor-textarea-id")+'"]')}else{return el}});this.elements=this.elements.filter(function(element){if(toRemove.indexOf(element)!==-1){this.events.cleanupElement(element);if(element.getAttribute("medium-editor-textarea-id")){cleanupTextareaElement(element)}this.trigger("removeElement",{target:element,currentTarget:element},element);return false}return true},this)}};MediumEditor.getEditorFromElement=function(element){var index=element.getAttribute("data-medium-editor-editor-index"),win=element&&element.ownerDocument&&(element.ownerDocument.defaultView||element.ownerDocument.parentWindow);if(win&&win._mediumEditors&&win._mediumEditors[index]){return win._mediumEditors[index]}return null}})();(function(){MediumEditor.prototype.defaults={activeButtonClass:"medium-editor-button-active",buttonLabels:false,delay:0,disableReturn:false,disableDoubleReturn:false,disableExtraSpaces:false,disableEditing:false,autoLink:false,elementsContainer:false,contentWindow:window,ownerDocument:document,targetBlank:false,extensions:{},spellcheck:true}})();MediumEditor.parseVersionString=function(release){var split=release.split("-"),version=split[0].split("."),preRelease=split.length>1?split[1]:"";return{major:parseInt(version[0],10),minor:parseInt(version[1],10),revision:parseInt(version[2],10),preRelease:preRelease,toString:function(){return[version[0],version[1],version[2]].join(".")+(preRelease?"-"+preRelease:"")}}};MediumEditor.version=MediumEditor.parseVersionString.call(this,{version:"5.23.3"}.version);return MediumEditor}());

// ============================================================
//
// Vanilla Color Picker v 0.1.8
//
// http://github.com/miroshko/vanilla-color-picker
//
// This project is licensed under the terms of the MIT license.
//
// ============================================================

(function(global) {

  // @todo: bind in as a build step, so css is readable
  var basicCSS = '.vanilla-color-picker { display: inline-block; position: absolute; z-index: 100; padding: 5px; background-color: #fff; box-shadow: 1px 1px 2px 1px rgba(0,0,0,0.3) } .vanilla-color-picker-single-color { display: inline-block; width: 20px; height: 20px; margin: 1px; border-radius: 2px; }';
  function singleColorTpl(color, index, picked) {
    var pickedClass = picked ? "vanilla-color-picker-single-color-picked" : '';
    /* PATCH: add an inner node for showing transparent color */
    return '<div class="vanilla-color-picker-single-color ' + pickedClass + '" tabindex="' + index + '" data-color="' + color + '"><div style="background-color:' + color + '"></div></div>';
    /* PATCH: END */
  }
  var DEFAULT_COLORS = ['red', 'yellow', 'green'];

  function addBasicStyling() {
    if (document.getElementById('vanilla-color-picker-style')) {
      return;
    }
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'vanilla-color-picker-style');
    style.innerHTML = basicCSS;
    var firstInHead = global.document.head.children[0];
    if (firstInHead) {
      global.document.head.insertBefore(style, firstInHead);
    } else {
      global.document.head.appendChild(style);
    }

  }

  function MessageMediator() {
    this.subscribers = {};
    this.on = function(eventName, callback) {
      this.subscribers[eventName] = this.subscribers[eventName] || [];
      this.subscribers[eventName].push(callback);
      return this;
    };

    this.emit = function(eventName) {
      var arguments_ = arguments;
      (this.subscribers[eventName] || []).forEach(function(callback) {
        callback.apply(null, Array.prototype.splice.call(arguments_, 1));
      });
    };
  }

  function SinglePicker(elem, colors, className) {
    MessageMediator.apply(this);
    this.targetElem = elem;
    this.elem = null;
    var this_ = this;

    this._initialize = function() {
      this._createPickerElement();

      this._positionPickerElement();
      this._addEventListeners();
    };

    this.destroy = function() {
      try {
        this.elem.parentNode.removeChild(this.elem);
      }
      catch (e) {
        // http://stackoverflow.com/a/22934552
      }
    };

    this._positionPickerElement = function() {
      var left = this.targetElem.offsetLeft;
      var top = this.targetElem.offsetTop;
      var height = this.targetElem.offsetHeight;
      this.elem.style.left = left + 'px';
      this.elem.style.top = (top + height) + 'px';
    };

    this._onFocusLost = function() {
      setTimeout(function() {
        if (this_.elem.contains(document.activeElement)) {
          // because blur is not propagating
          document.activeElement.addEventListener('blur', this_._onFocusLost);
        } else {
          this_.emit('lostFocus');
        }
      }, 1);
    };

    this._createPickerElement = function() {
      this.elem = document.createElement('div');
      this.elem.classList.add('vanilla-color-picker');
      if (className) {
        this.elem.classList.add(className);
      }

      var currentlyChosenColorIndex = colors.indexOf(this.targetElem.dataset.vanillaPickerColor);

      for (var i = 0; i < colors.length; i++) {
        this.elem.innerHTML += singleColorTpl(colors[i], i + 1, i == currentlyChosenColorIndex);
      }
      this.targetElem.parentNode.appendChild(this.elem);
      this.elem.setAttribute('tabindex', 1);

      var toFocus = currentlyChosenColorIndex > -1 ? currentlyChosenColorIndex : 0;

      this.elem.children[toFocus].focus();
      this.elem.children[toFocus].addEventListener('blur', this_._onFocusLost);
    };

    this._addEventListeners = function() {
      var _this = this;
      this.elem.addEventListener('click', function(e) {
        /* PATCH: check both for node and its parent */
        if (e.target.classList.contains('vanilla-color-picker-single-color') || e.target.parentNode.classList.contains('vanilla-color-picker-single-color')) {
          _this.emit('colorChosen', e.target.dataset.color || e.target.parentNode.dataset.color);
        } 
        /* PATCH: END */
      });
      this.elem.addEventListener('keydown', function(e) {
        var ENTER = 13;
        var ESC = 27;
        var keyCode = e.which || e.keyCode;
        if (keyCode == ENTER) {
          _this.emit('colorChosen', e.target.dataset.color);
        }
        if(keyCode == ESC) {
          _this.emit('lostFocus');
        }
      });
    };

    this._initialize();
  }

  function PickerHolder(elem) {
    MessageMediator.apply(this);
    // an alias for more intuitivity
    this.set = this.emit;

    this.colors = DEFAULT_COLORS;
    this.className = '';
    this.elem = elem;
    this.currentPicker = null;
    var this_ = this;

    this._initialize = function() {
      this._addEventListeners();
    };

    this._addEventListeners = function() {
      this.elem.addEventListener('click', this.openPicker);
      this.elem.addEventListener('focus', this.openPicker);
      this.on('customColors', function(colors) {
        if (!(colors instanceof Array)) {
          throw new Error('Colors must be an array');
        }
        this_.colors = colors;
      });
      this.on('defaultColor', function(color) {
        if (!this_.elem.dataset.vanillaPickerColor) {
          this_._updateElemState(color);
          this_.emit('colorChosen', color, this_.elem);
        }
      });
      this.on('className', function(className) {
        this_.className = className;
      });
    };

    this._updateElemState = function(color) {
      this.elem.dataset.vanillaPickerColor = color;
      this.elem.value = color;
    };

    this.destroyPicker = function() {
      if (!this_.currentPicker){
        return;
      }
      this_.currentPicker.destroy();
      this_.currentPicker = null;
      this_.emit('pickerClosed');
    };

    this.openPicker = function() {
      if (this_.currentPicker) {
        return;
      }
      this_.currentPicker = new SinglePicker(this_.elem, this_.colors, this_.className);
      this_.currentPicker.on('colorChosen', function(color) {
        this_._updateElemState(color);
        this_.destroyPicker();
        this_.emit('colorChosen', color, this_.elem);
      });
      this_.currentPicker.on('lostFocus', function() {
        this_.emit('lostFocus');
        this_.destroyPicker();
      });
      this_.emit('pickerCreated');
    };

    this._initialize();
  }

  function vanillaColorPicker(element, options) {
    // @todo: move from here
    addBasicStyling();
    return new PickerHolder(element, options);
  }

  if (global.define && global.define.amd) {
    define([], function() {
      return vanillaColorPicker;
    });
  } else {
    global.vanillaColorPicker = vanillaColorPicker;
  }
})(this || window);

window.Caret = {
  // getSelectionStart
  node: function() {
     var node = document.getSelection().anchorNode;
     return (!node ? null : node.nodeType == 3 ? node.parentNode : node);
  },
  // pasteHtmlAtCaret
  insert: function(html, selectPastedContent) {
      var sel, range;
      if (window.getSelection) {
          // IE9 and non-IE
          sel = window.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              range.deleteContents();

              // Range.createContextualFragment() would be useful here but is
              // only relatively recently standardized and is not supported in
              // some browsers (IE9, for one)
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
                  lastNode = frag.appendChild(node);
              }
              var firstNode = frag.firstChild;
              range.insertNode(frag);

              // Preserve the selection
              if (lastNode) {
                  range = range.cloneRange();
                  range.setStartAfter(lastNode);
                  if (selectPastedContent) {
                      range.setStartBefore(firstNode);
                  } else {
                      range.collapse(true);
                  }
                  sel.removeAllRanges();
                  sel.addRange(range);
              }
          }
      } else if ( (sel = document.selection) && sel.type != "Control") {
          // IE < 9
          var originalRange = sel.createRange();
          originalRange.collapse(true);
          sel.createRange().pasteHTML(html);
          if (selectPastedContent) {
              range = sel.createRange();
              range.setEndPoint("StartToStart", originalRange);
              range.select();
          }
      }
  }
};

/**!
 * Sortable
 * @author	RubaXa   <trash@rubaxa.org>
 * @license MIT
 */

(function sortableModule(factory) {
	"use strict";

	if (typeof define === "function" && define.amd) {
		define(factory);
	}
	else if (typeof module != "undefined" && typeof module.exports != "undefined") {
		module.exports = factory();
	}
	else {
		/* jshint sub:true */
		window["Sortable"] = factory();
	}
})(function sortableFactory() {
	"use strict";

	if (typeof window === "undefined" || !window.document) {
		return function sortableError() {
			throw new Error("Sortable.js requires a window with a document");
		};
	}

	var dragEl,
		parentEl,
		ghostEl,
		cloneEl,
		rootEl,
		nextEl,
		lastDownEl,

		scrollEl,
		scrollParentEl,
		scrollCustomFn,

		lastEl,
		lastCSS,
		lastParentCSS,

		oldIndex,
		newIndex,

		activeGroup,
		putSortable,

		autoScroll = {},

		tapEvt,
		touchEvt,

		moved,

		/** @const */
		R_SPACE = /\s+/g,
		R_FLOAT = /left|right|inline/,

		expando = 'Sortable' + (new Date).getTime(),

		win = window,
		document = win.document,
		parseInt = win.parseInt,
		setTimeout = win.setTimeout,

		$ = win.jQuery || win.Zepto,
		Polymer = win.Polymer,

		captureMode = false,
		passiveMode = false,

		supportDraggable = ('draggable' in document.createElement('div')),
		supportCssPointerEvents = (function (el) {
			// false when IE11
			if (!!navigator.userAgent.match(/(?:Trident.*rv[ :]?11\.|msie)/i)) {
				return false;
			}
			el = document.createElement('x');
			el.style.cssText = 'pointer-events:auto';
			return el.style.pointerEvents === 'auto';
		})(),

		_silent = false,

		abs = Math.abs,
		min = Math.min,

		savedInputChecked = [],
		touchDragOverListeners = [],

		_autoScroll = _throttle(function (/**Event*/evt, /**Object*/options, /**HTMLElement*/rootEl) {
			// Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
			if (rootEl && options.scroll) {
				var _this = rootEl[expando],
					el,
					rect,
					sens = options.scrollSensitivity,
					speed = options.scrollSpeed,

					x = evt.clientX,
					y = evt.clientY,

					winWidth = window.innerWidth,
					winHeight = window.innerHeight,

					vx,
					vy,

					scrollOffsetX,
					scrollOffsetY
				;

				// Delect scrollEl
				if (scrollParentEl !== rootEl) {
					scrollEl = options.scroll;
					scrollParentEl = rootEl;
					scrollCustomFn = options.scrollFn;

					if (scrollEl === true) {
						scrollEl = rootEl;

						do {
							if ((scrollEl.offsetWidth < scrollEl.scrollWidth) ||
								(scrollEl.offsetHeight < scrollEl.scrollHeight)
							) {
								break;
							}
							/* jshint boss:true */
						} while (scrollEl = scrollEl.parentNode);
					}
				}

				if (scrollEl) {
					el = scrollEl;
					rect = scrollEl.getBoundingClientRect();
					vx = (abs(rect.right - x) <= sens) - (abs(rect.left - x) <= sens);
					vy = (abs(rect.bottom - y) <= sens) - (abs(rect.top - y) <= sens);
				}


				if (!(vx || vy)) {
					vx = (winWidth - x <= sens) - (x <= sens);
					vy = (winHeight - y <= sens) - (y <= sens);

					/* jshint expr:true */
					(vx || vy) && (el = win);
				}


				if (autoScroll.vx !== vx || autoScroll.vy !== vy || autoScroll.el !== el) {
					autoScroll.el = el;
					autoScroll.vx = vx;
					autoScroll.vy = vy;

					clearInterval(autoScroll.pid);

					if (el) {
						autoScroll.pid = setInterval(function () {
							scrollOffsetY = vy ? vy * speed : 0;
							scrollOffsetX = vx ? vx * speed : 0;

							if ('function' === typeof(scrollCustomFn)) {
								return scrollCustomFn.call(_this, scrollOffsetX, scrollOffsetY, evt);
							}

							if (el === win) {
								win.scrollTo(win.pageXOffset + scrollOffsetX, win.pageYOffset + scrollOffsetY);
							} else {
								el.scrollTop += scrollOffsetY;
								el.scrollLeft += scrollOffsetX;
							}
						}, 24);
					}
				}
			}
		}, 30),

		_prepareGroup = function (options) {
			function toFn(value, pull) {
				if (value === void 0 || value === true) {
					value = group.name;
				}

				if (typeof value === 'function') {
					return value;
				} else {
					return function (to, from) {
						var fromGroup = from.options.group.name;

						return pull
							? value
							: value && (value.join
								? value.indexOf(fromGroup) > -1
								: (fromGroup == value)
							);
					};
				}
			}

			var group = {};
			var originalGroup = options.group;

			if (!originalGroup || typeof originalGroup != 'object') {
				originalGroup = {name: originalGroup};
			}

			group.name = originalGroup.name;
			group.checkPull = toFn(originalGroup.pull, true);
			group.checkPut = toFn(originalGroup.put);
			group.revertClone = originalGroup.revertClone;

			options.group = group;
		}
	;

	// Detect support a passive mode
	try {
		window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
			get: function () {
				// `false`, because everything starts to work incorrectly and instead of d'n'd,
				// begins the page has scrolled.
				passiveMode = false;
				captureMode = {
					capture: false,
					passive: passiveMode
				};
			}
		}));
	} catch (err) {}

	/**
	 * @class  Sortable
	 * @param  {HTMLElement}  el
	 * @param  {Object}       [options]
	 */
	function Sortable(el, options) {
		if (!(el && el.nodeType && el.nodeType === 1)) {
			throw 'Sortable: `el` must be HTMLElement, and not ' + {}.toString.call(el);
		}

		this.el = el; // root element
		this.options = options = _extend({}, options);


		// Export instance
		el[expando] = this;

		// Default options
		var defaults = {
			group: Math.random(),
			sort: true,
			disabled: false,
			store: null,
			handle: null,
			scroll: true,
			scrollSensitivity: 30,
			scrollSpeed: 10,
			draggable: /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
			ghostClass: 'sortable-ghost',
			chosenClass: 'sortable-chosen',
			dragClass: 'sortable-drag',
			ignore: 'a, img',
			filter: null,
			preventOnFilter: true,
			animation: 0,
			setData: function (dataTransfer, dragEl) {
				dataTransfer.setData('Text', dragEl.textContent);
			},
			dropBubble: false,
			dragoverBubble: false,
			dataIdAttr: 'data-id',
			delay: 0,
			forceFallback: false,
			fallbackClass: 'sortable-fallback',
			fallbackOnBody: false,
			fallbackTolerance: 0,
			fallbackOffset: {x: 0, y: 0},
			supportPointer: Sortable.supportPointer !== false
		};


		// Set default options
		for (var name in defaults) {
			!(name in options) && (options[name] = defaults[name]);
		}

		_prepareGroup(options);

		// Bind all private methods
		for (var fn in this) {
			if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
				this[fn] = this[fn].bind(this);
			}
		}

		// Setup drag mode
		this.nativeDraggable = options.forceFallback ? false : supportDraggable;

		// Bind events
		_on(el, 'mousedown', this._onTapStart);
		_on(el, 'touchstart', this._onTapStart);
		options.supportPointer && _on(el, 'pointerdown', this._onTapStart);

		if (this.nativeDraggable) {
			_on(el, 'dragover', this);
			_on(el, 'dragenter', this);
		}

		touchDragOverListeners.push(this._onDragOver);

		// Restore sorting
		options.store && this.sort(options.store.get(this));
	}


	Sortable.prototype = /** @lends Sortable.prototype */ {
		constructor: Sortable,

		_onTapStart: function (/** Event|TouchEvent */evt) {
			var _this = this,
				el = this.el,
				options = this.options,
				preventOnFilter = options.preventOnFilter,
				type = evt.type,
				touch = evt.touches && evt.touches[0],
				target = (touch || evt).target,
				originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0]) || target,
				filter = options.filter,
				startIndex;

			_saveInputCheckedState(el);


			// Don't trigger start event when an element is been dragged, otherwise the evt.oldindex always wrong when set option.group.
			if (dragEl) {
				return;
			}

			if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
				return; // only left button or enabled
			}

			// cancel dnd if original target is content editable
			if (originalTarget.isContentEditable) {
				return;
			}

			target = _closest(target, options.draggable, el);

			if (!target) {
				return;
			}

			if (lastDownEl === target) {
				// Ignoring duplicate `down`
				return;
			}

			// Get the index of the dragged element within its parent
			startIndex = _index(target, options.draggable);

			// Check filter
			if (typeof filter === 'function') {
				if (filter.call(this, evt, target, this)) {
					_dispatchEvent(_this, originalTarget, 'filter', target, el, el, startIndex);
					preventOnFilter && evt.preventDefault();
					return; // cancel dnd
				}
			}
			else if (filter) {
				filter = filter.split(',').some(function (criteria) {
					criteria = _closest(originalTarget, criteria.trim(), el);

					if (criteria) {
						_dispatchEvent(_this, criteria, 'filter', target, el, el, startIndex);
						return true;
					}
				});

				if (filter) {
					preventOnFilter && evt.preventDefault();
					return; // cancel dnd
				}
			}

			if (options.handle && !_closest(originalTarget, options.handle, el)) {
				return;
			}

			// Prepare `dragstart`
			this._prepareDragStart(evt, touch, target, startIndex);
		},

		_prepareDragStart: function (/** Event */evt, /** Touch */touch, /** HTMLElement */target, /** Number */startIndex) {
			var _this = this,
				el = _this.el,
				options = _this.options,
				ownerDocument = el.ownerDocument,
				dragStartFn;

			if (target && !dragEl && (target.parentNode === el)) {
				tapEvt = evt;

				rootEl = el;
				dragEl = target;
				parentEl = dragEl.parentNode;
				nextEl = dragEl.nextSibling;
				lastDownEl = target;
				activeGroup = options.group;
				oldIndex = startIndex;

				this._lastX = (touch || evt).clientX;
				this._lastY = (touch || evt).clientY;

				dragEl.style['will-change'] = 'all';

				dragStartFn = function () {
					// Delayed drag has been triggered
					// we can re-enable the events: touchmove/mousemove
					_this._disableDelayedDrag();

					// Make the element draggable
					dragEl.draggable = _this.nativeDraggable;

					// Chosen item
					_toggleClass(dragEl, options.chosenClass, true);

					// Bind the events: dragstart/dragend
					_this._triggerDragStart(evt, touch);

					// Drag start event
					_dispatchEvent(_this, rootEl, 'choose', dragEl, rootEl, rootEl, oldIndex);
				};

				// Disable "draggable"
				options.ignore.split(',').forEach(function (criteria) {
					_find(dragEl, criteria.trim(), _disableDraggable);
				});

				_on(ownerDocument, 'mouseup', _this._onDrop);
				_on(ownerDocument, 'touchend', _this._onDrop);
				_on(ownerDocument, 'touchcancel', _this._onDrop);
				_on(ownerDocument, 'selectstart', _this);
				options.supportPointer && _on(ownerDocument, 'pointercancel', _this._onDrop);

				if (options.delay) {
					// If the user moves the pointer or let go the click or touch
					// before the delay has been reached:
					// disable the delayed drag
					_on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchend', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
					_on(ownerDocument, 'mousemove', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchmove', _this._disableDelayedDrag);
					options.supportPointer && _on(ownerDocument, 'pointermove', _this._disableDelayedDrag);

					_this._dragStartTimer = setTimeout(dragStartFn, options.delay);
				} else {
					dragStartFn();
				}


			}
		},

		_disableDelayedDrag: function () {
			var ownerDocument = this.el.ownerDocument;

			clearTimeout(this._dragStartTimer);
			_off(ownerDocument, 'mouseup', this._disableDelayedDrag);
			_off(ownerDocument, 'touchend', this._disableDelayedDrag);
			_off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
			_off(ownerDocument, 'mousemove', this._disableDelayedDrag);
			_off(ownerDocument, 'touchmove', this._disableDelayedDrag);
			_off(ownerDocument, 'pointermove', this._disableDelayedDrag);
		},

		_triggerDragStart: function (/** Event */evt, /** Touch */touch) {
			touch = touch || (evt.pointerType == 'touch' ? evt : null);

			if (touch) {
				// Touch device support
				tapEvt = {
					target: dragEl,
					clientX: touch.clientX,
					clientY: touch.clientY
				};

				this._onDragStart(tapEvt, 'touch');
			}
			else if (!this.nativeDraggable) {
				this._onDragStart(tapEvt, true);
			}
			else {
				_on(dragEl, 'dragend', this);
				_on(rootEl, 'dragstart', this._onDragStart);
			}

			try {
				if (document.selection) {
					// Timeout neccessary for IE9
					_nextTick(function () {
						document.selection.empty();
					});
				} else {
					window.getSelection().removeAllRanges();
				}
			} catch (err) {
			}
		},

		_dragStarted: function () {
			if (rootEl && dragEl) {
				var options = this.options;

				// Apply effect
				_toggleClass(dragEl, options.ghostClass, true);
				_toggleClass(dragEl, options.dragClass, false);

				Sortable.active = this;

				// Drag start event
				_dispatchEvent(this, rootEl, 'start', dragEl, rootEl, rootEl, oldIndex);
			} else {
				this._nulling();
			}
		},

		_emulateDragOver: function () {
			if (touchEvt) {
				if (this._lastX === touchEvt.clientX && this._lastY === touchEvt.clientY) {
					return;
				}

				this._lastX = touchEvt.clientX;
				this._lastY = touchEvt.clientY;

				if (!supportCssPointerEvents) {
					_css(ghostEl, 'display', 'none');
				}

				var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
				var parent = target;
				var i = touchDragOverListeners.length;

				if (target && target.shadowRoot) {
					target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
					parent = target;
				}

				if (parent) {
					do {
						if (parent[expando]) {
							while (i--) {
								touchDragOverListeners[i]({
									clientX: touchEvt.clientX,
									clientY: touchEvt.clientY,
									target: target,
									rootEl: parent
								});
							}

							break;
						}

						target = parent; // store last element
					}
					/* jshint boss:true */
					while (parent = parent.parentNode);
				}

				if (!supportCssPointerEvents) {
					_css(ghostEl, 'display', '');
				}
			}
		},


		_onTouchMove: function (/**TouchEvent*/evt) {
			if (tapEvt) {
				var	options = this.options,
					fallbackTolerance = options.fallbackTolerance,
					fallbackOffset = options.fallbackOffset,
					touch = evt.touches ? evt.touches[0] : evt,
					dx = (touch.clientX - tapEvt.clientX) + fallbackOffset.x,
					dy = (touch.clientY - tapEvt.clientY) + fallbackOffset.y,
					translate3d = evt.touches ? 'translate3d(' + dx + 'px,' + dy + 'px,0)' : 'translate(' + dx + 'px,' + dy + 'px)';

				// only set the status to dragging, when we are actually dragging
				if (!Sortable.active) {
					if (fallbackTolerance &&
						min(abs(touch.clientX - this._lastX), abs(touch.clientY - this._lastY)) < fallbackTolerance
					) {
						return;
					}

					this._dragStarted();
				}

				// as well as creating the ghost element on the document body
				this._appendGhost();

				moved = true;
				touchEvt = touch;

				_css(ghostEl, 'webkitTransform', translate3d);
				_css(ghostEl, 'mozTransform', translate3d);
				_css(ghostEl, 'msTransform', translate3d);
				_css(ghostEl, 'transform', translate3d);

				evt.preventDefault();
			}
		},

		_appendGhost: function () {
			if (!ghostEl) {
				var rect = dragEl.getBoundingClientRect(),
					css = _css(dragEl),
					options = this.options,
					ghostRect;

				ghostEl = dragEl.cloneNode(true);

				_toggleClass(ghostEl, options.ghostClass, false);
				_toggleClass(ghostEl, options.fallbackClass, true);
				_toggleClass(ghostEl, options.dragClass, true);

				_css(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
				_css(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));
				_css(ghostEl, 'width', rect.width);
				_css(ghostEl, 'height', rect.height);
				_css(ghostEl, 'opacity', '0.8');
				_css(ghostEl, 'position', 'fixed');
				_css(ghostEl, 'zIndex', '100000');
				_css(ghostEl, 'pointerEvents', 'none');

				options.fallbackOnBody && document.body.appendChild(ghostEl) || rootEl.appendChild(ghostEl);

				// Fixing dimensions.
				ghostRect = ghostEl.getBoundingClientRect();
				_css(ghostEl, 'width', rect.width * 2 - ghostRect.width);
				_css(ghostEl, 'height', rect.height * 2 - ghostRect.height);
			}
		},

		_onDragStart: function (/**Event*/evt, /**boolean*/useFallback) {
			var _this = this;
			var dataTransfer = evt.dataTransfer;
			var options = _this.options;

			_this._offUpEvents();

			if (activeGroup.checkPull(_this, _this, dragEl, evt)) {
				cloneEl = _clone(dragEl);

				cloneEl.draggable = false;
				cloneEl.style['will-change'] = '';

				_css(cloneEl, 'display', 'none');
				_toggleClass(cloneEl, _this.options.chosenClass, false);

				// #1143: IFrame support workaround
				_this._cloneId = _nextTick(function () {
					rootEl.insertBefore(cloneEl, dragEl);
					_dispatchEvent(_this, rootEl, 'clone', dragEl);
				});
			}

			_toggleClass(dragEl, options.dragClass, true);

			if (useFallback) {
				if (useFallback === 'touch') {
					// Bind touch events
					_on(document, 'touchmove', _this._onTouchMove);
					_on(document, 'touchend', _this._onDrop);
					_on(document, 'touchcancel', _this._onDrop);

					if (options.supportPointer) {
						_on(document, 'pointermove', _this._onTouchMove);
						_on(document, 'pointerup', _this._onDrop);
					}
				} else {
					// Old brwoser
					_on(document, 'mousemove', _this._onTouchMove);
					_on(document, 'mouseup', _this._onDrop);
				}

				_this._loopId = setInterval(_this._emulateDragOver, 50);
			}
			else {
				if (dataTransfer) {
					dataTransfer.effectAllowed = 'move';
					options.setData && options.setData.call(_this, dataTransfer, dragEl);
				}

				_on(document, 'drop', _this);

				// #1143: Бывает элемент с IFrame внутри блокирует `drop`,
				// поэтому если вызвался `mouseover`, значит надо отменять весь d'n'd.
				// Breaking Chrome 62+
				// _on(document, 'mouseover', _this);

				_this._dragStartId = _nextTick(_this._dragStarted);
			}
		},

		_onDragOver: function (/**Event*/evt) {
			var el = this.el,
				target,
				dragRect,
				targetRect,
				revert,
				options = this.options,
				group = options.group,
				activeSortable = Sortable.active,
				isOwner = (activeGroup === group),
				isMovingBetweenSortable = false,
				canSort = options.sort;

			if (evt.preventDefault !== void 0) {
				evt.preventDefault();
				!options.dragoverBubble && evt.stopPropagation();
			}

			if (dragEl.animated) {
				return;
			}

			moved = true;

			if (activeSortable && !options.disabled &&
				(isOwner
					? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
					: (
						putSortable === this ||
						(
							(activeSortable.lastPullMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) &&
							group.checkPut(this, activeSortable, dragEl, evt)
						)
					)
				) &&
				(evt.rootEl === void 0 || evt.rootEl === this.el) // touch fallback
			) {
				// Smart auto-scrolling
				_autoScroll(evt, options, this.el);

				if (_silent) {
					return;
				}

				target = _closest(evt.target, options.draggable, el);
				dragRect = dragEl.getBoundingClientRect();

				if (putSortable !== this) {
					putSortable = this;
					isMovingBetweenSortable = true;
				}

				if (revert) {
					_cloneHide(activeSortable, true);
					parentEl = rootEl; // actualization

					if (cloneEl || nextEl) {
						rootEl.insertBefore(dragEl, cloneEl || nextEl);
					}
					else if (!canSort) {
						rootEl.appendChild(dragEl);
					}

					return;
				}


				if ((el.children.length === 0) || (el.children[0] === ghostEl) ||
					(el === evt.target) && (_ghostIsLast(el, evt))
				) {
					//assign target only if condition is true
					if (el.children.length !== 0 && el.children[0] !== ghostEl && el === evt.target) {
						target = el.lastElementChild;
					}

					if (target) {
						if (target.animated) {
							return;
						}

						targetRect = target.getBoundingClientRect();
					}

					_cloneHide(activeSortable, isOwner);

					if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt) !== false) {
						if (!dragEl.contains(el)) {
							el.appendChild(dragEl);
							parentEl = el; // actualization
						}

						this._animate(dragRect, dragEl);
						target && this._animate(targetRect, target);
					}
				}
				else if (target && !target.animated && target !== dragEl && (target.parentNode[expando] !== void 0)) {
					if (lastEl !== target) {
						lastEl = target;
						lastCSS = _css(target);
						lastParentCSS = _css(target.parentNode);
					}

					targetRect = target.getBoundingClientRect();

					var width = targetRect.right - targetRect.left,
						height = targetRect.bottom - targetRect.top,
						floating = R_FLOAT.test(lastCSS.cssFloat + lastCSS.display)
							|| (lastParentCSS.display == 'flex' && lastParentCSS['flex-direction'].indexOf('row') === 0),
						isWide = (target.offsetWidth > dragEl.offsetWidth),
						isLong = (target.offsetHeight > dragEl.offsetHeight),
						halfway = (floating ? (evt.clientX - targetRect.left) / width : (evt.clientY - targetRect.top) / height) > 0.5,
						nextSibling = target.nextElementSibling,
						after = false
					;

					if (floating) {
						var elTop = dragEl.offsetTop,
							tgTop = target.offsetTop;

						if (elTop === tgTop) {
							after = (target.previousElementSibling === dragEl) && !isWide || halfway && isWide;
						}
						else if (target.previousElementSibling === dragEl || dragEl.previousElementSibling === target) {
							after = (evt.clientY - targetRect.top) / height > 0.5;
						} else {
							after = tgTop > elTop;
						}
						} else if (!isMovingBetweenSortable) {
						after = (nextSibling !== dragEl) && !isLong || halfway && isLong;
					}

					var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);

					if (moveVector !== false) {
						if (moveVector === 1 || moveVector === -1) {
							after = (moveVector === 1);
						}

						_silent = true;
						setTimeout(_unsilent, 30);

						_cloneHide(activeSortable, isOwner);

						if (!dragEl.contains(el)) {
							if (after && !nextSibling) {
								el.appendChild(dragEl);
							} else {
								target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
							}
						}

						parentEl = dragEl.parentNode; // actualization

						this._animate(dragRect, dragEl);
						this._animate(targetRect, target);
					}
				}
			}
		},

		_animate: function (prevRect, target) {
			var ms = this.options.animation;

			if (ms) {
				var currentRect = target.getBoundingClientRect();

				if (prevRect.nodeType === 1) {
					prevRect = prevRect.getBoundingClientRect();
				}

				_css(target, 'transition', 'none');
				_css(target, 'transform', 'translate3d('
					+ (prevRect.left - currentRect.left) + 'px,'
					+ (prevRect.top - currentRect.top) + 'px,0)'
				);

				target.offsetWidth; // repaint

				_css(target, 'transition', 'all ' + ms + 'ms');
				_css(target, 'transform', 'translate3d(0,0,0)');

				clearTimeout(target.animated);
				target.animated = setTimeout(function () {
					_css(target, 'transition', '');
					_css(target, 'transform', '');
					target.animated = false;
				}, ms);
			}
		},

		_offUpEvents: function () {
			var ownerDocument = this.el.ownerDocument;

			_off(document, 'touchmove', this._onTouchMove);
			_off(document, 'pointermove', this._onTouchMove);
			_off(ownerDocument, 'mouseup', this._onDrop);
			_off(ownerDocument, 'touchend', this._onDrop);
			_off(ownerDocument, 'pointerup', this._onDrop);
			_off(ownerDocument, 'touchcancel', this._onDrop);
			_off(ownerDocument, 'pointercancel', this._onDrop);
			_off(ownerDocument, 'selectstart', this);
		},

		_onDrop: function (/**Event*/evt) {
			var el = this.el,
				options = this.options;

			clearInterval(this._loopId);
			clearInterval(autoScroll.pid);
			clearTimeout(this._dragStartTimer);

			_cancelNextTick(this._cloneId);
			_cancelNextTick(this._dragStartId);

			// Unbind events
			_off(document, 'mouseover', this);
			_off(document, 'mousemove', this._onTouchMove);

			if (this.nativeDraggable) {
				_off(document, 'drop', this);
				_off(el, 'dragstart', this._onDragStart);
			}

			this._offUpEvents();

			if (evt) {
				if (moved) {
					evt.preventDefault();
					!options.dropBubble && evt.stopPropagation();
				}

				ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);

				if (rootEl === parentEl || Sortable.active.lastPullMode !== 'clone') {
					// Remove clone
					cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
				}

				if (dragEl) {
					if (this.nativeDraggable) {
						_off(dragEl, 'dragend', this);
					}

					_disableDraggable(dragEl);
					dragEl.style['will-change'] = '';

					// Remove class's
					_toggleClass(dragEl, this.options.ghostClass, false);
					_toggleClass(dragEl, this.options.chosenClass, false);

					// Drag stop event
					_dispatchEvent(this, rootEl, 'unchoose', dragEl, parentEl, rootEl, oldIndex);

					if (rootEl !== parentEl) {
						newIndex = _index(dragEl, options.draggable);

						if (newIndex >= 0) {
							// Add event
							_dispatchEvent(null, parentEl, 'add', dragEl, parentEl, rootEl, oldIndex, newIndex);

							// Remove event
							_dispatchEvent(this, rootEl, 'remove', dragEl, parentEl, rootEl, oldIndex, newIndex);

							// drag from one list and drop into another
							_dispatchEvent(null, parentEl, 'sort', dragEl, parentEl, rootEl, oldIndex, newIndex);
							_dispatchEvent(this, rootEl, 'sort', dragEl, parentEl, rootEl, oldIndex, newIndex);
						}
					}
					else {
						if (dragEl.nextSibling !== nextEl) {
							// Get the index of the dragged element within its parent
							newIndex = _index(dragEl, options.draggable);

							if (newIndex >= 0) {
								// drag & drop within the same list
								_dispatchEvent(this, rootEl, 'update', dragEl, parentEl, rootEl, oldIndex, newIndex);
								_dispatchEvent(this, rootEl, 'sort', dragEl, parentEl, rootEl, oldIndex, newIndex);
							}
						}
					}

					if (Sortable.active) {
						/* jshint eqnull:true */
						if (newIndex == null || newIndex === -1) {
							newIndex = oldIndex;
						}

						_dispatchEvent(this, rootEl, 'end', dragEl, parentEl, rootEl, oldIndex, newIndex);

						// Save sorting
						this.save();
					}
				}

			}

			this._nulling();
		},

		_nulling: function() {
			rootEl =
			dragEl =
			parentEl =
			ghostEl =
			nextEl =
			cloneEl =
			lastDownEl =

			scrollEl =
			scrollParentEl =

			tapEvt =
			touchEvt =

			moved =
			newIndex =

			lastEl =
			lastCSS =

			putSortable =
			activeGroup =
			Sortable.active = null;

			savedInputChecked.forEach(function (el) {
				el.checked = true;
			});
			savedInputChecked.length = 0;
		},

		handleEvent: function (/**Event*/evt) {
			switch (evt.type) {
				case 'drop':
				case 'dragend':
					this._onDrop(evt);
					break;

				case 'dragover':
				case 'dragenter':
					if (dragEl) {
						this._onDragOver(evt);
						_globalDragOver(evt);
					}
					break;

				case 'mouseover':
					this._onDrop(evt);
					break;

				case 'selectstart':
					evt.preventDefault();
					break;
			}
		},


		/**
		 * Serializes the item into an array of string.
		 * @returns {String[]}
		 */
		toArray: function () {
			var order = [],
				el,
				children = this.el.children,
				i = 0,
				n = children.length,
				options = this.options;

			for (; i < n; i++) {
				el = children[i];
				if (_closest(el, options.draggable, this.el)) {
					order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
				}
			}

			return order;
		},


		/**
		 * Sorts the elements according to the array.
		 * @param  {String[]}  order  order of the items
		 */
		sort: function (order) {
			var items = {}, rootEl = this.el;

			this.toArray().forEach(function (id, i) {
				var el = rootEl.children[i];

				if (_closest(el, this.options.draggable, rootEl)) {
					items[id] = el;
				}
			}, this);

			order.forEach(function (id) {
				if (items[id]) {
					rootEl.removeChild(items[id]);
					rootEl.appendChild(items[id]);
				}
			});
		},


		/**
		 * Save the current sorting
		 */
		save: function () {
			var store = this.options.store;
			store && store.set(this);
		},


		/**
		 * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
		 * @param   {HTMLElement}  el
		 * @param   {String}       [selector]  default: `options.draggable`
		 * @returns {HTMLElement|null}
		 */
		closest: function (el, selector) {
			return _closest(el, selector || this.options.draggable, this.el);
		},


		/**
		 * Set/get option
		 * @param   {string} name
		 * @param   {*}      [value]
		 * @returns {*}
		 */
		option: function (name, value) {
			var options = this.options;

			if (value === void 0) {
				return options[name];
			} else {
				options[name] = value;

				if (name === 'group') {
					_prepareGroup(options);
				}
			}
		},


		/**
		 * Destroy
		 */
		destroy: function () {
			var el = this.el;

			el[expando] = null;

			_off(el, 'mousedown', this._onTapStart);
			_off(el, 'touchstart', this._onTapStart);
			_off(el, 'pointerdown', this._onTapStart);

			if (this.nativeDraggable) {
				_off(el, 'dragover', this);
				_off(el, 'dragenter', this);
			}

			// Remove draggable attributes
			Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
				el.removeAttribute('draggable');
			});

			touchDragOverListeners.splice(touchDragOverListeners.indexOf(this._onDragOver), 1);

			this._onDrop();

			this.el = el = null;
		}
	};


	function _cloneHide(sortable, state) {
		if (sortable.lastPullMode !== 'clone') {
			state = true;
		}

		if (cloneEl && (cloneEl.state !== state)) {
			_css(cloneEl, 'display', state ? 'none' : '');

			if (!state) {
				if (cloneEl.state) {
					if (sortable.options.group.revertClone) {
						rootEl.insertBefore(cloneEl, nextEl);
						sortable._animate(dragEl, cloneEl);
					} else {
						rootEl.insertBefore(cloneEl, dragEl);
					}
				}
			}

			cloneEl.state = state;
		}
	}


	function _closest(/**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx) {
		if (el) {
			ctx = ctx || document;

			do {
				if ((selector === '>*' && el.parentNode === ctx) || _matches(el, selector)) {
					return el;
				}
				/* jshint boss:true */
			} while (el = _getParentOrHost(el));
		}

		return null;
	}


	function _getParentOrHost(el) {
		var parent = el.host;

		return (parent && parent.nodeType) ? parent : el.parentNode;
	}


	function _globalDragOver(/**Event*/evt) {
		if (evt.dataTransfer) {
			evt.dataTransfer.dropEffect = 'move';
		}
		evt.preventDefault();
	}


	function _on(el, event, fn) {
		el.addEventListener(event, fn, captureMode);
	}


	function _off(el, event, fn) {
		el.removeEventListener(event, fn, captureMode);
	}


	function _toggleClass(el, name, state) {
		if (el) {
			if (el.classList) {
				el.classList[state ? 'add' : 'remove'](name);
			}
			else {
				var className = (' ' + el.className + ' ').replace(R_SPACE, ' ').replace(' ' + name + ' ', ' ');
				el.className = (className + (state ? ' ' + name : '')).replace(R_SPACE, ' ');
			}
		}
	}


	function _css(el, prop, val) {
		var style = el && el.style;

		if (style) {
			if (val === void 0) {
				if (document.defaultView && document.defaultView.getComputedStyle) {
					val = document.defaultView.getComputedStyle(el, '');
				}
				else if (el.currentStyle) {
					val = el.currentStyle;
				}

				return prop === void 0 ? val : val[prop];
			}
			else {
				if (!(prop in style)) {
					prop = '-webkit-' + prop;
				}

				style[prop] = val + (typeof val === 'string' ? '' : 'px');
			}
		}
	}


	function _find(ctx, tagName, iterator) {
		if (ctx) {
			var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;

			if (iterator) {
				for (; i < n; i++) {
					iterator(list[i], i);
				}
			}

			return list;
		}

		return [];
	}



	function _dispatchEvent(sortable, rootEl, name, targetEl, toEl, fromEl, startIndex, newIndex) {
		sortable = (sortable || rootEl[expando]);

		var evt = document.createEvent('Event'),
			options = sortable.options,
			onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);

		evt.initEvent(name, true, true);

		evt.to = toEl || rootEl;
		evt.from = fromEl || rootEl;
		evt.item = targetEl || rootEl;
		evt.clone = cloneEl;

		evt.oldIndex = startIndex;
		evt.newIndex = newIndex;

		rootEl.dispatchEvent(evt);

		if (options[onName]) {
			options[onName].call(sortable, evt);
		}
	}


	function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvt, willInsertAfter) {
		var evt,
			sortable = fromEl[expando],
			onMoveFn = sortable.options.onMove,
			retVal;

		evt = document.createEvent('Event');
		evt.initEvent('move', true, true);

		evt.to = toEl;
		evt.from = fromEl;
		evt.dragged = dragEl;
		evt.draggedRect = dragRect;
		evt.related = targetEl || toEl;
		evt.relatedRect = targetRect || toEl.getBoundingClientRect();
		evt.willInsertAfter = willInsertAfter;

		fromEl.dispatchEvent(evt);

		if (onMoveFn) {
			retVal = onMoveFn.call(sortable, evt, originalEvt);
		}

		return retVal;
	}


	function _disableDraggable(el) {
		el.draggable = false;
	}


	function _unsilent() {
		_silent = false;
	}


	/** @returns {HTMLElement|false} */
	function _ghostIsLast(el, evt) {
		var lastEl = el.lastElementChild,
			rect = lastEl.getBoundingClientRect();

		// 5 — min delta
		// abs — нельзя добавлять, а то глюки при наведении сверху
		return (evt.clientY - (rect.top + rect.height) > 5) ||
			(evt.clientX - (rect.left + rect.width) > 5);
	}


	/**
	 * Generate id
	 * @param   {HTMLElement} el
	 * @returns {String}
	 * @private
	 */
	function _generateId(el) {
		var str = el.tagName + el.className + el.src + el.href + el.textContent,
			i = str.length,
			sum = 0;

		while (i--) {
			sum += str.charCodeAt(i);
		}

		return sum.toString(36);
	}

	/**
	 * Returns the index of an element within its parent for a selected set of
	 * elements
	 * @param  {HTMLElement} el
	 * @param  {selector} selector
	 * @return {number}
	 */
	function _index(el, selector) {
		var index = 0;

		if (!el || !el.parentNode) {
			return -1;
		}

		while (el && (el = el.previousElementSibling)) {
			if ((el.nodeName.toUpperCase() !== 'TEMPLATE') && (selector === '>*' || _matches(el, selector))) {
				index++;
			}
		}

		return index;
	}

	function _matches(/**HTMLElement*/el, /**String*/selector) {
		if (el) {
			selector = selector.split('.');

			var tag = selector.shift().toUpperCase(),
				re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g');

			return (
				(tag === '' || el.nodeName.toUpperCase() == tag) &&
				(!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)
			);
		}

		return false;
	}

	function _throttle(callback, ms) {
		var args, _this;

		return function () {
			if (args === void 0) {
				args = arguments;
				_this = this;

				setTimeout(function () {
					if (args.length === 1) {
						callback.call(_this, args[0]);
					} else {
						callback.apply(_this, args);
					}

					args = void 0;
				}, ms);
			}
		};
	}

	function _extend(dst, src) {
		if (dst && src) {
			for (var key in src) {
				if (src.hasOwnProperty(key)) {
					dst[key] = src[key];
				}
			}
		}

		return dst;
	}

	function _clone(el) {
		if (Polymer && Polymer.dom) {
			return Polymer.dom(el).cloneNode(true);
		}
		else if ($) {
			return $(el).clone(true)[0];
		}
		else {
			return el.cloneNode(true);
		}
	}

	function _saveInputCheckedState(root) {
		var inputs = root.getElementsByTagName('input');
		var idx = inputs.length;

		while (idx--) {
			var el = inputs[idx];
			el.checked && savedInputChecked.push(el);
		}
	}

	function _nextTick(fn) {
		return setTimeout(fn, 0);
	}

	function _cancelNextTick(id) {
		return clearTimeout(id);
	}

	// Fixed #973:
	_on(document, 'touchmove', function (evt) {
		if (Sortable.active) {
			evt.preventDefault();
		}
	});

	// Export utils
	Sortable.utils = {
		on: _on,
		off: _off,
		css: _css,
		find: _find,
		is: function (el, selector) {
			return !!_closest(el, selector, el);
		},
		extend: _extend,
		throttle: _throttle,
		closest: _closest,
		toggleClass: _toggleClass,
		clone: _clone,
		index: _index,
		nextTick: _nextTick,
		cancelNextTick: _cancelNextTick
	};


	/**
	 * Create sortable instance
	 * @param {HTMLElement}  el
	 * @param {Object}      [options]
	 */
	Sortable.create = function (el, options) {
		return new Sortable(el, options);
	};


	// Export
	Sortable.version = '1.7.0';
	return Sortable;
});

/*! showdown v 1.8.6 - 22-12-2017 */
(function(){function g(g){"use strict";var A={omitExtraWLInCodeBlocks:{defaultValue:!1,describe:"Omit the default extra whiteline added to code blocks",type:"boolean"},noHeaderId:{defaultValue:!1,describe:"Turn on/off generated header id",type:"boolean"},prefixHeaderId:{defaultValue:!1,describe:"Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",type:"string"},rawPrefixHeaderId:{defaultValue:!1,describe:'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',type:"boolean"},ghCompatibleHeaderId:{defaultValue:!1,describe:"Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",type:"boolean"},rawHeaderId:{defaultValue:!1,describe:"Remove only spaces, ' and \" from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids",type:"boolean"},headerLevelStart:{defaultValue:!1,describe:"The header blocks level start",type:"integer"},parseImgDimensions:{defaultValue:!1,describe:"Turn on/off image dimension parsing",type:"boolean"},simplifiedAutoLink:{defaultValue:!1,describe:"Turn on/off GFM autolink style",type:"boolean"},excludeTrailingPunctuationFromURLs:{defaultValue:!1,describe:"Excludes trailing punctuation from links generated with autoLinking",type:"boolean"},literalMidWordUnderscores:{defaultValue:!1,describe:"Parse midword underscores as literal underscores",type:"boolean"},literalMidWordAsterisks:{defaultValue:!1,describe:"Parse midword asterisks as literal asterisks",type:"boolean"},strikethrough:{defaultValue:!1,describe:"Turn on/off strikethrough support",type:"boolean"},tables:{defaultValue:!1,describe:"Turn on/off tables support",type:"boolean"},tablesHeaderId:{defaultValue:!1,describe:"Add an id to table headers",type:"boolean"},ghCodeBlocks:{defaultValue:!0,describe:"Turn on/off GFM fenced code blocks support",type:"boolean"},tasklists:{defaultValue:!1,describe:"Turn on/off GFM tasklist support",type:"boolean"},smoothLivePreview:{defaultValue:!1,describe:"Prevents weird effects in live previews due to incomplete input",type:"boolean"},smartIndentationFix:{defaultValue:!1,description:"Tries to smartly fix indentation in es6 strings",type:"boolean"},disableForced4SpacesIndentedSublists:{defaultValue:!1,description:"Disables the requirement of indenting nested sublists by 4 spaces",type:"boolean"},simpleLineBreaks:{defaultValue:!1,description:"Parses simple line breaks as <br> (GFM Style)",type:"boolean"},requireSpaceBeforeHeadingText:{defaultValue:!1,description:"Makes adding a space between `#` and the header text mandatory (GFM Style)",type:"boolean"},ghMentions:{defaultValue:!1,description:"Enables github @mentions",type:"boolean"},ghMentionsLink:{defaultValue:"https://github.com/{u}",description:"Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",type:"string"},encodeEmails:{defaultValue:!0,description:"Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",type:"boolean"},openLinksInNewWindow:{defaultValue:!1,description:"Open all links in new windows",type:"boolean"},backslashEscapesHTMLTags:{defaultValue:!1,description:"Support for HTML Tag escaping. ex: <div>foo</div>",type:"boolean"},emoji:{defaultValue:!1,description:"Enable emoji support. Ex: `this is a :smile: emoji`",type:"boolean"},underline:{defaultValue:!1,description:"Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`",type:"boolean"},completeHTMLDocument:{defaultValue:!1,description:"Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags",type:"boolean"},metadata:{defaultValue:!1,description:"Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).",type:"boolean"},splitAdjacentBlockquotes:{defaultValue:!1,description:"Split adjacent blockquote blocks",type:"boolean"}};if(!1===g)return JSON.parse(JSON.stringify(A));var C={};for(var I in A)A.hasOwnProperty(I)&&(C[I]=A[I].defaultValue);return C}function A(g,A){"use strict";var C=A?"Error in "+A+" extension->":"Error in unnamed extension",e={valid:!0,error:""};I.helper.isArray(g)||(g=[g]);for(var r=0;r<g.length;++r){var t=C+" sub-extension "+r+": ",a=g[r];if("object"!=typeof a)return e.valid=!1,e.error=t+"must be an object, but "+typeof a+" given",e;if(!I.helper.isString(a.type))return e.valid=!1,e.error=t+'property "type" must be a string, but '+typeof a.type+" given",e;var n=a.type=a.type.toLowerCase();if("language"===n&&(n=a.type="lang"),"html"===n&&(n=a.type="output"),"lang"!==n&&"output"!==n&&"listener"!==n)return e.valid=!1,e.error=t+"type "+n+' is not recognized. Valid values: "lang/language", "output/html" or "listener"',e;if("listener"===n){if(I.helper.isUndefined(a.listeners))return e.valid=!1,e.error=t+'. Extensions of type "listener" must have a property called "listeners"',e}else if(I.helper.isUndefined(a.filter)&&I.helper.isUndefined(a.regex))return e.valid=!1,e.error=t+n+' extensions must define either a "regex" property or a "filter" method',e;if(a.listeners){if("object"!=typeof a.listeners)return e.valid=!1,e.error=t+'"listeners" property must be an object but '+typeof a.listeners+" given",e;for(var o in a.listeners)if(a.listeners.hasOwnProperty(o)&&"function"!=typeof a.listeners[o])return e.valid=!1,e.error=t+'"listeners" property must be an hash of [event name]: [callback]. listeners.'+o+" must be a function but "+typeof a.listeners[o]+" given",e}if(a.filter){if("function"!=typeof a.filter)return e.valid=!1,e.error=t+'"filter" must be a function, but '+typeof a.filter+" given",e}else if(a.regex){if(I.helper.isString(a.regex)&&(a.regex=new RegExp(a.regex,"g")),!(a.regex instanceof RegExp))return e.valid=!1,e.error=t+'"regex" property must either be a string or a RegExp object, but '+typeof a.regex+" given",e;if(I.helper.isUndefined(a.replace))return e.valid=!1,e.error=t+'"regex" extensions must implement a replace string or function',e}}return e}function C(g,A){"use strict";return"¨E"+A.charCodeAt(0)+"E"}var I={},e={},r={},t=g(!0),a="vanilla",n={github:{omitExtraWLInCodeBlocks:!0,simplifiedAutoLink:!0,excludeTrailingPunctuationFromURLs:!0,literalMidWordUnderscores:!0,strikethrough:!0,tables:!0,tablesHeaderId:!0,ghCodeBlocks:!0,tasklists:!0,disableForced4SpacesIndentedSublists:!0,simpleLineBreaks:!0,requireSpaceBeforeHeadingText:!0,ghCompatibleHeaderId:!0,ghMentions:!0,backslashEscapesHTMLTags:!0,emoji:!0,splitAdjacentBlockquotes:!0},original:{noHeaderId:!0,ghCodeBlocks:!1},ghost:{omitExtraWLInCodeBlocks:!0,parseImgDimensions:!0,simplifiedAutoLink:!0,excludeTrailingPunctuationFromURLs:!0,literalMidWordUnderscores:!0,strikethrough:!0,tables:!0,tablesHeaderId:!0,ghCodeBlocks:!0,tasklists:!0,smoothLivePreview:!0,simpleLineBreaks:!0,requireSpaceBeforeHeadingText:!0,ghMentions:!1,encodeEmails:!0},vanilla:g(!0),allOn:function(){"use strict";var A=g(!0),C={};for(var I in A)A.hasOwnProperty(I)&&(C[I]=!0);return C}()};I.helper={},I.extensions={},I.setOption=function(g,A){"use strict";return t[g]=A,this},I.getOption=function(g){"use strict";return t[g]},I.getOptions=function(){"use strict";return t},I.resetOptions=function(){"use strict";t=g(!0)},I.setFlavor=function(g){"use strict";if(!n.hasOwnProperty(g))throw Error(g+" flavor was not found");I.resetOptions();var A=n[g];a=g;for(var C in A)A.hasOwnProperty(C)&&(t[C]=A[C])},I.getFlavor=function(){"use strict";return a},I.getFlavorOptions=function(g){"use strict";if(n.hasOwnProperty(g))return n[g]},I.getDefaultOptions=function(A){"use strict";return g(A)},I.subParser=function(g,A){"use strict";if(I.helper.isString(g)){if(void 0===A){if(e.hasOwnProperty(g))return e[g];throw Error("SubParser named "+g+" not registered!")}e[g]=A}},I.extension=function(g,C){"use strict";if(!I.helper.isString(g))throw Error("Extension 'name' must be a string");if(g=I.helper.stdExtName(g),I.helper.isUndefined(C)){if(!r.hasOwnProperty(g))throw Error("Extension named "+g+" is not registered!");return r[g]}"function"==typeof C&&(C=C()),I.helper.isArray(C)||(C=[C]);var e=A(C,g);if(!e.valid)throw Error(e.error);r[g]=C},I.getAllExtensions=function(){"use strict";return r},I.removeExtension=function(g){"use strict";delete r[g]},I.resetExtensions=function(){"use strict";r={}},I.validateExtension=function(g){"use strict";var C=A(g,null);return!!C.valid||(console.warn(C.error),!1)},I.hasOwnProperty("helper")||(I.helper={}),I.helper.isString=function(g){"use strict";return"string"==typeof g||g instanceof String},I.helper.isFunction=function(g){"use strict";return g&&"[object Function]"==={}.toString.call(g)},I.helper.isArray=function(g){"use strict";return Array.isArray(g)},I.helper.isUndefined=function(g){"use strict";return void 0===g},I.helper.forEach=function(g,A){"use strict";if(I.helper.isUndefined(g))throw new Error("obj param is required");if(I.helper.isUndefined(A))throw new Error("callback param is required");if(!I.helper.isFunction(A))throw new Error("callback param must be a function/closure");if("function"==typeof g.forEach)g.forEach(A);else if(I.helper.isArray(g))for(var C=0;C<g.length;C++)A(g[C],C,g);else{if("object"!=typeof g)throw new Error("obj does not seem to be an array or an iterable object");for(var e in g)g.hasOwnProperty(e)&&A(g[e],e,g)}},I.helper.stdExtName=function(g){"use strict";return g.replace(/[_?*+\/\\.^-]/g,"").replace(/\s/g,"").toLowerCase()},I.helper.escapeCharactersCallback=C,I.helper.escapeCharacters=function(g,A,I){"use strict";var e="(["+A.replace(/([\[\]\\])/g,"\\$1")+"])";I&&(e="\\\\"+e);var r=new RegExp(e,"g");return g=g.replace(r,C)};var o=function(g,A,C,I){"use strict";var e,r,t,a,n,o=I||"",s=o.indexOf("g")>-1,i=new RegExp(A+"|"+C,"g"+o.replace(/g/g,"")),l=new RegExp(A,o.replace(/g/g,"")),c=[];do{for(e=0;t=i.exec(g);)if(l.test(t[0]))e++||(a=(r=i.lastIndex)-t[0].length);else if(e&&!--e){n=t.index+t[0].length;var u={left:{start:a,end:r},match:{start:r,end:t.index},right:{start:t.index,end:n},wholeMatch:{start:a,end:n}};if(c.push(u),!s)return c}}while(e&&(i.lastIndex=r));return c};I.helper.matchRecursiveRegExp=function(g,A,C,I){"use strict";for(var e=o(g,A,C,I),r=[],t=0;t<e.length;++t)r.push([g.slice(e[t].wholeMatch.start,e[t].wholeMatch.end),g.slice(e[t].match.start,e[t].match.end),g.slice(e[t].left.start,e[t].left.end),g.slice(e[t].right.start,e[t].right.end)]);return r},I.helper.replaceRecursiveRegExp=function(g,A,C,e,r){"use strict";if(!I.helper.isFunction(A)){var t=A;A=function(){return t}}var a=o(g,C,e,r),n=g,s=a.length;if(s>0){var i=[];0!==a[0].wholeMatch.start&&i.push(g.slice(0,a[0].wholeMatch.start));for(var l=0;l<s;++l)i.push(A(g.slice(a[l].wholeMatch.start,a[l].wholeMatch.end),g.slice(a[l].match.start,a[l].match.end),g.slice(a[l].left.start,a[l].left.end),g.slice(a[l].right.start,a[l].right.end))),l<s-1&&i.push(g.slice(a[l].wholeMatch.end,a[l+1].wholeMatch.start));a[s-1].wholeMatch.end<g.length&&i.push(g.slice(a[s-1].wholeMatch.end)),n=i.join("")}return n},I.helper.regexIndexOf=function(g,A,C){"use strict";if(!I.helper.isString(g))throw"InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";if(A instanceof RegExp==!1)throw"InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp";var e=g.substring(C||0).search(A);return e>=0?e+(C||0):e},I.helper.splitAtIndex=function(g,A){"use strict";if(!I.helper.isString(g))throw"InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";return[g.substring(0,A),g.substring(A)]},I.helper.encodeEmailAddress=function(g){"use strict";var A=[function(g){return"&#"+g.charCodeAt(0)+";"},function(g){return"&#x"+g.charCodeAt(0).toString(16)+";"},function(g){return g}];return g=g.replace(/./g,function(g){if("@"===g)g=A[Math.floor(2*Math.random())](g);else{var C=Math.random();g=C>.9?A[2](g):C>.45?A[1](g):A[0](g)}return g})},"undefined"==typeof console&&(console={warn:function(g){"use strict";alert(g)},log:function(g){"use strict";alert(g)},error:function(g){"use strict";throw g}}),I.helper.regexes={asteriskDashAndColon:/([*_:~])/g},I.helper.emojis={"+1":"👍","-1":"👎",100:"💯",1234:"🔢","1st_place_medal":"🥇","2nd_place_medal":"🥈","3rd_place_medal":"🥉","8ball":"🎱",a:"🅰️",ab:"🆎",abc:"🔤",abcd:"🔡",accept:"🉑",aerial_tramway:"🚡",airplane:"✈️",alarm_clock:"⏰",alembic:"⚗️",alien:"👽",ambulance:"🚑",amphora:"🏺",anchor:"⚓️",angel:"👼",anger:"💢",angry:"😠",anguished:"😧",ant:"🐜",apple:"🍎",aquarius:"♒️",aries:"♈️",arrow_backward:"◀️",arrow_double_down:"⏬",arrow_double_up:"⏫",arrow_down:"⬇️",arrow_down_small:"🔽",arrow_forward:"▶️",arrow_heading_down:"⤵️",arrow_heading_up:"⤴️",arrow_left:"⬅️",arrow_lower_left:"↙️",arrow_lower_right:"↘️",arrow_right:"➡️",arrow_right_hook:"↪️",arrow_up:"⬆️",arrow_up_down:"↕️",arrow_up_small:"🔼",arrow_upper_left:"↖️",arrow_upper_right:"↗️",arrows_clockwise:"🔃",arrows_counterclockwise:"🔄",art:"🎨",articulated_lorry:"🚛",artificial_satellite:"🛰",astonished:"😲",athletic_shoe:"👟",atm:"🏧",atom_symbol:"⚛️",avocado:"🥑",b:"🅱️",baby:"👶",baby_bottle:"🍼",baby_chick:"🐤",baby_symbol:"🚼",back:"🔙",bacon:"🥓",badminton:"🏸",baggage_claim:"🛄",baguette_bread:"🥖",balance_scale:"⚖️",balloon:"🎈",ballot_box:"🗳",ballot_box_with_check:"☑️",bamboo:"🎍",banana:"🍌",bangbang:"‼️",bank:"🏦",bar_chart:"📊",barber:"💈",baseball:"⚾️",basketball:"🏀",basketball_man:"⛹️",basketball_woman:"⛹️&zwj;♀️",bat:"🦇",bath:"🛀",bathtub:"🛁",battery:"🔋",beach_umbrella:"🏖",bear:"🐻",bed:"🛏",bee:"🐝",beer:"🍺",beers:"🍻",beetle:"🐞",beginner:"🔰",bell:"🔔",bellhop_bell:"🛎",bento:"🍱",biking_man:"🚴",bike:"🚲",biking_woman:"🚴&zwj;♀️",bikini:"👙",biohazard:"☣️",bird:"🐦",birthday:"🎂",black_circle:"⚫️",black_flag:"🏴",black_heart:"🖤",black_joker:"🃏",black_large_square:"⬛️",black_medium_small_square:"◾️",black_medium_square:"◼️",black_nib:"✒️",black_small_square:"▪️",black_square_button:"🔲",blonde_man:"👱",blonde_woman:"👱&zwj;♀️",blossom:"🌼",blowfish:"🐡",blue_book:"📘",blue_car:"🚙",blue_heart:"💙",blush:"😊",boar:"🐗",boat:"⛵️",bomb:"💣",book:"📖",bookmark:"🔖",bookmark_tabs:"📑",books:"📚",boom:"💥",boot:"👢",bouquet:"💐",bowing_man:"🙇",bow_and_arrow:"🏹",bowing_woman:"🙇&zwj;♀️",bowling:"🎳",boxing_glove:"🥊",boy:"👦",bread:"🍞",bride_with_veil:"👰",bridge_at_night:"🌉",briefcase:"💼",broken_heart:"💔",bug:"🐛",building_construction:"🏗",bulb:"💡",bullettrain_front:"🚅",bullettrain_side:"🚄",burrito:"🌯",bus:"🚌",business_suit_levitating:"🕴",busstop:"🚏",bust_in_silhouette:"👤",busts_in_silhouette:"👥",butterfly:"🦋",cactus:"🌵",cake:"🍰",calendar:"📆",call_me_hand:"🤙",calling:"📲",camel:"🐫",camera:"📷",camera_flash:"📸",camping:"🏕",cancer:"♋️",candle:"🕯",candy:"🍬",canoe:"🛶",capital_abcd:"🔠",capricorn:"♑️",car:"🚗",card_file_box:"🗃",card_index:"📇",card_index_dividers:"🗂",carousel_horse:"🎠",carrot:"🥕",cat:"🐱",cat2:"🐈",cd:"💿",chains:"⛓",champagne:"🍾",chart:"💹",chart_with_downwards_trend:"📉",chart_with_upwards_trend:"📈",checkered_flag:"🏁",cheese:"🧀",cherries:"🍒",cherry_blossom:"🌸",chestnut:"🌰",chicken:"🐔",children_crossing:"🚸",chipmunk:"🐿",chocolate_bar:"🍫",christmas_tree:"🎄",church:"⛪️",cinema:"🎦",circus_tent:"🎪",city_sunrise:"🌇",city_sunset:"🌆",cityscape:"🏙",cl:"🆑",clamp:"🗜",clap:"👏",clapper:"🎬",classical_building:"🏛",clinking_glasses:"🥂",clipboard:"📋",clock1:"🕐",clock10:"🕙",clock1030:"🕥",clock11:"🕚",clock1130:"🕦",clock12:"🕛",clock1230:"🕧",clock130:"🕜",clock2:"🕑",clock230:"🕝",clock3:"🕒",clock330:"🕞",clock4:"🕓",clock430:"🕟",clock5:"🕔",clock530:"🕠",clock6:"🕕",clock630:"🕡",clock7:"🕖",clock730:"🕢",clock8:"🕗",clock830:"🕣",clock9:"🕘",clock930:"🕤",closed_book:"📕",closed_lock_with_key:"🔐",closed_umbrella:"🌂",cloud:"☁️",cloud_with_lightning:"🌩",cloud_with_lightning_and_rain:"⛈",cloud_with_rain:"🌧",cloud_with_snow:"🌨",clown_face:"🤡",clubs:"♣️",cocktail:"🍸",coffee:"☕️",coffin:"⚰️",cold_sweat:"😰",comet:"☄️",computer:"💻",computer_mouse:"🖱",confetti_ball:"🎊",confounded:"😖",confused:"😕",congratulations:"㊗️",construction:"🚧",construction_worker_man:"👷",construction_worker_woman:"👷&zwj;♀️",control_knobs:"🎛",convenience_store:"🏪",cookie:"🍪",cool:"🆒",policeman:"👮",copyright:"©️",corn:"🌽",couch_and_lamp:"🛋",couple:"👫",couple_with_heart_woman_man:"💑",couple_with_heart_man_man:"👨&zwj;❤️&zwj;👨",couple_with_heart_woman_woman:"👩&zwj;❤️&zwj;👩",couplekiss_man_man:"👨&zwj;❤️&zwj;💋&zwj;👨",couplekiss_man_woman:"💏",couplekiss_woman_woman:"👩&zwj;❤️&zwj;💋&zwj;👩",cow:"🐮",cow2:"🐄",cowboy_hat_face:"🤠",crab:"🦀",crayon:"🖍",credit_card:"💳",crescent_moon:"🌙",cricket:"🏏",crocodile:"🐊",croissant:"🥐",crossed_fingers:"🤞",crossed_flags:"🎌",crossed_swords:"⚔️",crown:"👑",cry:"😢",crying_cat_face:"😿",crystal_ball:"🔮",cucumber:"🥒",cupid:"💘",curly_loop:"➰",currency_exchange:"💱",curry:"🍛",custard:"🍮",customs:"🛃",cyclone:"🌀",dagger:"🗡",dancer:"💃",dancing_women:"👯",dancing_men:"👯&zwj;♂️",dango:"🍡",dark_sunglasses:"🕶",dart:"🎯",dash:"💨",date:"📅",deciduous_tree:"🌳",deer:"🦌",department_store:"🏬",derelict_house:"🏚",desert:"🏜",desert_island:"🏝",desktop_computer:"🖥",male_detective:"🕵️",diamond_shape_with_a_dot_inside:"💠",diamonds:"♦️",disappointed:"😞",disappointed_relieved:"😥",dizzy:"💫",dizzy_face:"😵",do_not_litter:"🚯",dog:"🐶",dog2:"🐕",dollar:"💵",dolls:"🎎",dolphin:"🐬",door:"🚪",doughnut:"🍩",dove:"🕊",dragon:"🐉",dragon_face:"🐲",dress:"👗",dromedary_camel:"🐪",drooling_face:"🤤",droplet:"💧",drum:"🥁",duck:"🦆",dvd:"📀","e-mail":"📧",eagle:"🦅",ear:"👂",ear_of_rice:"🌾",earth_africa:"🌍",earth_americas:"🌎",earth_asia:"🌏",egg:"🥚",eggplant:"🍆",eight_pointed_black_star:"✴️",eight_spoked_asterisk:"✳️",electric_plug:"🔌",elephant:"🐘",email:"✉️",end:"🔚",envelope_with_arrow:"📩",euro:"💶",european_castle:"🏰",european_post_office:"🏤",evergreen_tree:"🌲",exclamation:"❗️",expressionless:"😑",eye:"👁",eye_speech_bubble:"👁&zwj;🗨",eyeglasses:"👓",eyes:"👀",face_with_head_bandage:"🤕",face_with_thermometer:"🤒",fist_oncoming:"👊",factory:"🏭",fallen_leaf:"🍂",family_man_woman_boy:"👪",family_man_boy:"👨&zwj;👦",family_man_boy_boy:"👨&zwj;👦&zwj;👦",family_man_girl:"👨&zwj;👧",family_man_girl_boy:"👨&zwj;👧&zwj;👦",family_man_girl_girl:"👨&zwj;👧&zwj;👧",family_man_man_boy:"👨&zwj;👨&zwj;👦",family_man_man_boy_boy:"👨&zwj;👨&zwj;👦&zwj;👦",family_man_man_girl:"👨&zwj;👨&zwj;👧",family_man_man_girl_boy:"👨&zwj;👨&zwj;👧&zwj;👦",family_man_man_girl_girl:"👨&zwj;👨&zwj;👧&zwj;👧",family_man_woman_boy_boy:"👨&zwj;👩&zwj;👦&zwj;👦",family_man_woman_girl:"👨&zwj;👩&zwj;👧",family_man_woman_girl_boy:"👨&zwj;👩&zwj;👧&zwj;👦",family_man_woman_girl_girl:"👨&zwj;👩&zwj;👧&zwj;👧",family_woman_boy:"👩&zwj;👦",family_woman_boy_boy:"👩&zwj;👦&zwj;👦",family_woman_girl:"👩&zwj;👧",family_woman_girl_boy:"👩&zwj;👧&zwj;👦",family_woman_girl_girl:"👩&zwj;👧&zwj;👧",family_woman_woman_boy:"👩&zwj;👩&zwj;👦",family_woman_woman_boy_boy:"👩&zwj;👩&zwj;👦&zwj;👦",family_woman_woman_girl:"👩&zwj;👩&zwj;👧",family_woman_woman_girl_boy:"👩&zwj;👩&zwj;👧&zwj;👦",family_woman_woman_girl_girl:"👩&zwj;👩&zwj;👧&zwj;👧",fast_forward:"⏩",fax:"📠",fearful:"😨",feet:"🐾",female_detective:"🕵️&zwj;♀️",ferris_wheel:"🎡",ferry:"⛴",field_hockey:"🏑",file_cabinet:"🗄",file_folder:"📁",film_projector:"📽",film_strip:"🎞",fire:"🔥",fire_engine:"🚒",fireworks:"🎆",first_quarter_moon:"🌓",first_quarter_moon_with_face:"🌛",fish:"🐟",fish_cake:"🍥",fishing_pole_and_fish:"🎣",fist_raised:"✊",fist_left:"🤛",fist_right:"🤜",flags:"🎏",flashlight:"🔦",fleur_de_lis:"⚜️",flight_arrival:"🛬",flight_departure:"🛫",floppy_disk:"💾",flower_playing_cards:"🎴",flushed:"😳",fog:"🌫",foggy:"🌁",football:"🏈",footprints:"👣",fork_and_knife:"🍴",fountain:"⛲️",fountain_pen:"🖋",four_leaf_clover:"🍀",fox_face:"🦊",framed_picture:"🖼",free:"🆓",fried_egg:"🍳",fried_shrimp:"🍤",fries:"🍟",frog:"🐸",frowning:"😦",frowning_face:"☹️",frowning_man:"🙍&zwj;♂️",frowning_woman:"🙍",middle_finger:"🖕",fuelpump:"⛽️",full_moon:"🌕",full_moon_with_face:"🌝",funeral_urn:"⚱️",game_die:"🎲",gear:"⚙️",gem:"💎",gemini:"♊️",ghost:"👻",gift:"🎁",gift_heart:"💝",girl:"👧",globe_with_meridians:"🌐",goal_net:"🥅",goat:"🐐",golf:"⛳️",golfing_man:"🏌️",golfing_woman:"🏌️&zwj;♀️",gorilla:"🦍",grapes:"🍇",green_apple:"🍏",green_book:"📗",green_heart:"💚",green_salad:"🥗",grey_exclamation:"❕",grey_question:"❔",grimacing:"😬",grin:"😁",grinning:"😀",guardsman:"💂",guardswoman:"💂&zwj;♀️",guitar:"🎸",gun:"🔫",haircut_woman:"💇",haircut_man:"💇&zwj;♂️",hamburger:"🍔",hammer:"🔨",hammer_and_pick:"⚒",hammer_and_wrench:"🛠",hamster:"🐹",hand:"✋",handbag:"👜",handshake:"🤝",hankey:"💩",hatched_chick:"🐥",hatching_chick:"🐣",headphones:"🎧",hear_no_evil:"🙉",heart:"❤️",heart_decoration:"💟",heart_eyes:"😍",heart_eyes_cat:"😻",heartbeat:"💓",heartpulse:"💗",hearts:"♥️",heavy_check_mark:"✔️",heavy_division_sign:"➗",heavy_dollar_sign:"💲",heavy_heart_exclamation:"❣️",heavy_minus_sign:"➖",heavy_multiplication_x:"✖️",heavy_plus_sign:"➕",helicopter:"🚁",herb:"🌿",hibiscus:"🌺",high_brightness:"🔆",high_heel:"👠",hocho:"🔪",hole:"🕳",honey_pot:"🍯",horse:"🐴",horse_racing:"🏇",hospital:"🏥",hot_pepper:"🌶",hotdog:"🌭",hotel:"🏨",hotsprings:"♨️",hourglass:"⌛️",hourglass_flowing_sand:"⏳",house:"🏠",house_with_garden:"🏡",houses:"🏘",hugs:"🤗",hushed:"😯",ice_cream:"🍨",ice_hockey:"🏒",ice_skate:"⛸",icecream:"🍦",id:"🆔",ideograph_advantage:"🉐",imp:"👿",inbox_tray:"📥",incoming_envelope:"📨",tipping_hand_woman:"💁",information_source:"ℹ️",innocent:"😇",interrobang:"⁉️",iphone:"📱",izakaya_lantern:"🏮",jack_o_lantern:"🎃",japan:"🗾",japanese_castle:"🏯",japanese_goblin:"👺",japanese_ogre:"👹",jeans:"👖",joy:"😂",joy_cat:"😹",joystick:"🕹",kaaba:"🕋",key:"🔑",keyboard:"⌨️",keycap_ten:"🔟",kick_scooter:"🛴",kimono:"👘",kiss:"💋",kissing:"😗",kissing_cat:"😽",kissing_closed_eyes:"😚",kissing_heart:"😘",kissing_smiling_eyes:"😙",kiwi_fruit:"🥝",koala:"🐨",koko:"🈁",label:"🏷",large_blue_circle:"🔵",large_blue_diamond:"🔷",large_orange_diamond:"🔶",last_quarter_moon:"🌗",last_quarter_moon_with_face:"🌜",latin_cross:"✝️",laughing:"😆",leaves:"🍃",ledger:"📒",left_luggage:"🛅",left_right_arrow:"↔️",leftwards_arrow_with_hook:"↩️",lemon:"🍋",leo:"♌️",leopard:"🐆",level_slider:"🎚",libra:"♎️",light_rail:"🚈",link:"🔗",lion:"🦁",lips:"👄",lipstick:"💄",lizard:"🦎",lock:"🔒",lock_with_ink_pen:"🔏",lollipop:"🍭",loop:"➿",loud_sound:"🔊",loudspeaker:"📢",love_hotel:"🏩",love_letter:"💌",low_brightness:"🔅",lying_face:"🤥",m:"Ⓜ️",mag:"🔍",mag_right:"🔎",mahjong:"🀄️",mailbox:"📫",mailbox_closed:"📪",mailbox_with_mail:"📬",mailbox_with_no_mail:"📭",man:"👨",man_artist:"👨&zwj;🎨",man_astronaut:"👨&zwj;🚀",man_cartwheeling:"🤸&zwj;♂️",man_cook:"👨&zwj;🍳",man_dancing:"🕺",man_facepalming:"🤦&zwj;♂️",man_factory_worker:"👨&zwj;🏭",man_farmer:"👨&zwj;🌾",man_firefighter:"👨&zwj;🚒",man_health_worker:"👨&zwj;⚕️",man_in_tuxedo:"🤵",man_judge:"👨&zwj;⚖️",man_juggling:"🤹&zwj;♂️",man_mechanic:"👨&zwj;🔧",man_office_worker:"👨&zwj;💼",man_pilot:"👨&zwj;✈️",man_playing_handball:"🤾&zwj;♂️",man_playing_water_polo:"🤽&zwj;♂️",man_scientist:"👨&zwj;🔬",man_shrugging:"🤷&zwj;♂️",man_singer:"👨&zwj;🎤",man_student:"👨&zwj;🎓",man_teacher:"👨&zwj;🏫",man_technologist:"👨&zwj;💻",man_with_gua_pi_mao:"👲",man_with_turban:"👳",tangerine:"🍊",mans_shoe:"👞",mantelpiece_clock:"🕰",maple_leaf:"🍁",martial_arts_uniform:"🥋",mask:"😷",massage_woman:"💆",massage_man:"💆&zwj;♂️",meat_on_bone:"🍖",medal_military:"🎖",medal_sports:"🏅",mega:"📣",melon:"🍈",memo:"📝",men_wrestling:"🤼&zwj;♂️",menorah:"🕎",mens:"🚹",metal:"🤘",metro:"🚇",microphone:"🎤",microscope:"🔬",milk_glass:"🥛",milky_way:"🌌",minibus:"🚐",minidisc:"💽",mobile_phone_off:"📴",money_mouth_face:"🤑",money_with_wings:"💸",moneybag:"💰",monkey:"🐒",monkey_face:"🐵",monorail:"🚝",moon:"🌔",mortar_board:"🎓",mosque:"🕌",motor_boat:"🛥",motor_scooter:"🛵",motorcycle:"🏍",motorway:"🛣",mount_fuji:"🗻",mountain:"⛰",mountain_biking_man:"🚵",mountain_biking_woman:"🚵&zwj;♀️",mountain_cableway:"🚠",mountain_railway:"🚞",mountain_snow:"🏔",mouse:"🐭",mouse2:"🐁",movie_camera:"🎥",moyai:"🗿",mrs_claus:"🤶",muscle:"💪",mushroom:"🍄",musical_keyboard:"🎹",musical_note:"🎵",musical_score:"🎼",mute:"🔇",nail_care:"💅",name_badge:"📛",national_park:"🏞",nauseated_face:"🤢",necktie:"👔",negative_squared_cross_mark:"❎",nerd_face:"🤓",neutral_face:"😐",new:"🆕",new_moon:"🌑",new_moon_with_face:"🌚",newspaper:"📰",newspaper_roll:"🗞",next_track_button:"⏭",ng:"🆖",no_good_man:"🙅&zwj;♂️",no_good_woman:"🙅",night_with_stars:"🌃",no_bell:"🔕",no_bicycles:"🚳",no_entry:"⛔️",no_entry_sign:"🚫",no_mobile_phones:"📵",no_mouth:"😶",no_pedestrians:"🚷",no_smoking:"🚭","non-potable_water":"🚱",nose:"👃",notebook:"📓",notebook_with_decorative_cover:"📔",notes:"🎶",nut_and_bolt:"🔩",o:"⭕️",o2:"🅾️",ocean:"🌊",octopus:"🐙",oden:"🍢",office:"🏢",oil_drum:"🛢",ok:"🆗",ok_hand:"👌",ok_man:"🙆&zwj;♂️",ok_woman:"🙆",old_key:"🗝",older_man:"👴",older_woman:"👵",om:"🕉",on:"🔛",oncoming_automobile:"🚘",oncoming_bus:"🚍",oncoming_police_car:"🚔",oncoming_taxi:"🚖",open_file_folder:"📂",open_hands:"👐",open_mouth:"😮",open_umbrella:"☂️",ophiuchus:"⛎",orange_book:"📙",orthodox_cross:"☦️",outbox_tray:"📤",owl:"🦉",ox:"🐂",package:"📦",page_facing_up:"📄",page_with_curl:"📃",pager:"📟",paintbrush:"🖌",palm_tree:"🌴",pancakes:"🥞",panda_face:"🐼",paperclip:"📎",paperclips:"🖇",parasol_on_ground:"⛱",parking:"🅿️",part_alternation_mark:"〽️",partly_sunny:"⛅️",passenger_ship:"🛳",passport_control:"🛂",pause_button:"⏸",peace_symbol:"☮️",peach:"🍑",peanuts:"🥜",pear:"🍐",pen:"🖊",pencil2:"✏️",penguin:"🐧",pensive:"😔",performing_arts:"🎭",persevere:"😣",person_fencing:"🤺",pouting_woman:"🙎",phone:"☎️",pick:"⛏",pig:"🐷",pig2:"🐖",pig_nose:"🐽",pill:"💊",pineapple:"🍍",ping_pong:"🏓",pisces:"♓️",pizza:"🍕",place_of_worship:"🛐",plate_with_cutlery:"🍽",play_or_pause_button:"⏯",point_down:"👇",point_left:"👈",point_right:"👉",point_up:"☝️",point_up_2:"👆",police_car:"🚓",policewoman:"👮&zwj;♀️",poodle:"🐩",popcorn:"🍿",post_office:"🏣",postal_horn:"📯",postbox:"📮",potable_water:"🚰",potato:"🥔",pouch:"👝",poultry_leg:"🍗",pound:"💷",rage:"😡",pouting_cat:"😾",pouting_man:"🙎&zwj;♂️",pray:"🙏",prayer_beads:"📿",pregnant_woman:"🤰",previous_track_button:"⏮",prince:"🤴",princess:"👸",printer:"🖨",purple_heart:"💜",purse:"👛",pushpin:"📌",put_litter_in_its_place:"🚮",question:"❓",rabbit:"🐰",rabbit2:"🐇",racehorse:"🐎",racing_car:"🏎",radio:"📻",radio_button:"🔘",radioactive:"☢️",railway_car:"🚃",railway_track:"🛤",rainbow:"🌈",rainbow_flag:"🏳️&zwj;🌈",raised_back_of_hand:"🤚",raised_hand_with_fingers_splayed:"🖐",raised_hands:"🙌",raising_hand_woman:"🙋",raising_hand_man:"🙋&zwj;♂️",ram:"🐏",ramen:"🍜",rat:"🐀",record_button:"⏺",recycle:"♻️",red_circle:"🔴",registered:"®️",relaxed:"☺️",relieved:"😌",reminder_ribbon:"🎗",repeat:"🔁",repeat_one:"🔂",rescue_worker_helmet:"⛑",restroom:"🚻",revolving_hearts:"💞",rewind:"⏪",rhinoceros:"🦏",ribbon:"🎀",rice:"🍚",rice_ball:"🍙",rice_cracker:"🍘",rice_scene:"🎑",right_anger_bubble:"🗯",ring:"💍",robot:"🤖",rocket:"🚀",rofl:"🤣",roll_eyes:"🙄",roller_coaster:"🎢",rooster:"🐓",rose:"🌹",rosette:"🏵",rotating_light:"🚨",round_pushpin:"📍",rowing_man:"🚣",rowing_woman:"🚣&zwj;♀️",rugby_football:"🏉",running_man:"🏃",running_shirt_with_sash:"🎽",running_woman:"🏃&zwj;♀️",sa:"🈂️",sagittarius:"♐️",sake:"🍶",sandal:"👡",santa:"🎅",satellite:"📡",saxophone:"🎷",school:"🏫",school_satchel:"🎒",scissors:"✂️",scorpion:"🦂",scorpius:"♏️",scream:"😱",scream_cat:"🙀",scroll:"📜",seat:"💺",secret:"㊙️",see_no_evil:"🙈",seedling:"🌱",selfie:"🤳",shallow_pan_of_food:"🥘",shamrock:"☘️",shark:"🦈",shaved_ice:"🍧",sheep:"🐑",shell:"🐚",shield:"🛡",shinto_shrine:"⛩",ship:"🚢",shirt:"👕",shopping:"🛍",shopping_cart:"🛒",shower:"🚿",shrimp:"🦐",signal_strength:"📶",six_pointed_star:"🔯",ski:"🎿",skier:"⛷",skull:"💀",skull_and_crossbones:"☠️",sleeping:"😴",sleeping_bed:"🛌",sleepy:"😪",slightly_frowning_face:"🙁",slightly_smiling_face:"🙂",slot_machine:"🎰",small_airplane:"🛩",small_blue_diamond:"🔹",small_orange_diamond:"🔸",small_red_triangle:"🔺",small_red_triangle_down:"🔻",smile:"😄",smile_cat:"😸",smiley:"😃",smiley_cat:"😺",smiling_imp:"😈",smirk:"😏",smirk_cat:"😼",smoking:"🚬",snail:"🐌",snake:"🐍",sneezing_face:"🤧",snowboarder:"🏂",snowflake:"❄️",snowman:"⛄️",snowman_with_snow:"☃️",sob:"😭",soccer:"⚽️",soon:"🔜",sos:"🆘",sound:"🔉",space_invader:"👾",spades:"♠️",spaghetti:"🍝",sparkle:"❇️",sparkler:"🎇",sparkles:"✨",sparkling_heart:"💖",speak_no_evil:"🙊",speaker:"🔈",speaking_head:"🗣",speech_balloon:"💬",speedboat:"🚤",spider:"🕷",spider_web:"🕸",spiral_calendar:"🗓",spiral_notepad:"🗒",spoon:"🥄",squid:"🦑",stadium:"🏟",star:"⭐️",star2:"🌟",star_and_crescent:"☪️",star_of_david:"✡️",stars:"🌠",station:"🚉",statue_of_liberty:"🗽",steam_locomotive:"🚂",stew:"🍲",stop_button:"⏹",stop_sign:"🛑",stopwatch:"⏱",straight_ruler:"📏",strawberry:"🍓",stuck_out_tongue:"😛",stuck_out_tongue_closed_eyes:"😝",stuck_out_tongue_winking_eye:"😜",studio_microphone:"🎙",stuffed_flatbread:"🥙",sun_behind_large_cloud:"🌥",sun_behind_rain_cloud:"🌦",sun_behind_small_cloud:"🌤",sun_with_face:"🌞",sunflower:"🌻",sunglasses:"😎",sunny:"☀️",sunrise:"🌅",sunrise_over_mountains:"🌄",surfing_man:"🏄",surfing_woman:"🏄&zwj;♀️",sushi:"🍣",suspension_railway:"🚟",sweat:"😓",sweat_drops:"💦",sweat_smile:"😅",sweet_potato:"🍠",swimming_man:"🏊",swimming_woman:"🏊&zwj;♀️",symbols:"🔣",synagogue:"🕍",syringe:"💉",taco:"🌮",tada:"🎉",tanabata_tree:"🎋",taurus:"♉️",taxi:"🚕",tea:"🍵",telephone_receiver:"📞",telescope:"🔭",tennis:"🎾",tent:"⛺️",thermometer:"🌡",thinking:"🤔",thought_balloon:"💭",ticket:"🎫",tickets:"🎟",tiger:"🐯",tiger2:"🐅",timer_clock:"⏲",tipping_hand_man:"💁&zwj;♂️",tired_face:"😫",tm:"™️",toilet:"🚽",tokyo_tower:"🗼",tomato:"🍅",tongue:"👅",top:"🔝",tophat:"🎩",tornado:"🌪",trackball:"🖲",tractor:"🚜",traffic_light:"🚥",train:"🚋",train2:"🚆",tram:"🚊",triangular_flag_on_post:"🚩",triangular_ruler:"📐",trident:"🔱",triumph:"😤",trolleybus:"🚎",trophy:"🏆",tropical_drink:"🍹",tropical_fish:"🐠",truck:"🚚",trumpet:"🎺",tulip:"🌷",tumbler_glass:"🥃",turkey:"🦃",turtle:"🐢",tv:"📺",twisted_rightwards_arrows:"🔀",two_hearts:"💕",two_men_holding_hands:"👬",two_women_holding_hands:"👭",u5272:"🈹",u5408:"🈴",u55b6:"🈺",u6307:"🈯️",u6708:"🈷️",u6709:"🈶",u6e80:"🈵",u7121:"🈚️",u7533:"🈸",u7981:"🈲",u7a7a:"🈳",umbrella:"☔️",unamused:"😒",underage:"🔞",unicorn:"🦄",unlock:"🔓",up:"🆙",upside_down_face:"🙃",v:"✌️",vertical_traffic_light:"🚦",vhs:"📼",vibration_mode:"📳",video_camera:"📹",video_game:"🎮",violin:"🎻",virgo:"♍️",volcano:"🌋",volleyball:"🏐",vs:"🆚",vulcan_salute:"🖖",walking_man:"🚶",walking_woman:"🚶&zwj;♀️",waning_crescent_moon:"🌘",waning_gibbous_moon:"🌖",warning:"⚠️",wastebasket:"🗑",watch:"⌚️",water_buffalo:"🐃",watermelon:"🍉",wave:"👋",wavy_dash:"〰️",waxing_crescent_moon:"🌒",wc:"🚾",weary:"😩",wedding:"💒",weight_lifting_man:"🏋️",weight_lifting_woman:"🏋️&zwj;♀️",whale:"🐳",whale2:"🐋",wheel_of_dharma:"☸️",wheelchair:"♿️",white_check_mark:"✅",white_circle:"⚪️",white_flag:"🏳️",white_flower:"💮",white_large_square:"⬜️",white_medium_small_square:"◽️",white_medium_square:"◻️",white_small_square:"▫️",white_square_button:"🔳",wilted_flower:"🥀",wind_chime:"🎐",wind_face:"🌬",wine_glass:"🍷",wink:"😉",wolf:"🐺",woman:"👩",woman_artist:"👩&zwj;🎨",woman_astronaut:"👩&zwj;🚀",woman_cartwheeling:"🤸&zwj;♀️",woman_cook:"👩&zwj;🍳",woman_facepalming:"🤦&zwj;♀️",woman_factory_worker:"👩&zwj;🏭",woman_farmer:"👩&zwj;🌾",woman_firefighter:"👩&zwj;🚒",woman_health_worker:"👩&zwj;⚕️",woman_judge:"👩&zwj;⚖️",woman_juggling:"🤹&zwj;♀️",woman_mechanic:"👩&zwj;🔧",woman_office_worker:"👩&zwj;💼",woman_pilot:"👩&zwj;✈️",woman_playing_handball:"🤾&zwj;♀️",woman_playing_water_polo:"🤽&zwj;♀️",woman_scientist:"👩&zwj;🔬",woman_shrugging:"🤷&zwj;♀️",woman_singer:"👩&zwj;🎤",woman_student:"👩&zwj;🎓",woman_teacher:"👩&zwj;🏫",woman_technologist:"👩&zwj;💻",woman_with_turban:"👳&zwj;♀️",womans_clothes:"👚",womans_hat:"👒",women_wrestling:"🤼&zwj;♀️",womens:"🚺",world_map:"🗺",worried:"😟",wrench:"🔧",writing_hand:"✍️",x:"❌",yellow_heart:"💛",yen:"💴",yin_yang:"☯️",yum:"😋",zap:"⚡️",zipper_mouth_face:"🤐",zzz:"💤",octocat:'<img width="20" height="20" align="absmiddle" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAOwUlEQVR42uVbCVyO6RbPmn0sw9gZS0aZO4y5GTEUE2ObxjZjrbHEJVy3sWS5pkaWxjLEkCVDSbSgFLdESaWSLIVUSIi4kvb9f895vi/zbbR+yZ339/tbnu99n/ec/3Oe85xznufV0CjDBaAdwZqwnzCJ0FXjHV70/i8J5oQDhCFV8cJdq1atwqxZs+Ds7Iz4+HhqwgXCLELNKlK6G2Ej4e6lS5ewZcsWzJgxA+fOnWNZFqvzxT1v3boF/qcsBg0ahP3796OwsJAFWKYuIqjfPoS9cXFxWL58Obp06SInh5aWFr//jjoJWLlu3TolAorRuXNn7Ny5k4W4Spgj81xrgj5hLmED4RDhlNRygglBhADCSakpWxFMCHoETUJTwrYHDx7A1NT0je9nPHz4kN/fXl0EeI0aNeqtAjB69+4NPz8/FsSdlXvy5An8/f1hZ2cHCwsLGBsbY/To0cJy9PT0MGDAAAwePBhGRkbClNesWYODBw8iODgYOTk53M/d9evXo27duiW++8iRI3z/ZHURENOjR48ShSjGuHHjhHJ16tQp9TOKaNWqlZKpvw1MHluQOpSvk5eXh5YtW5ZbmarAvHnzmIBd6iCgXnZ2Npo1a1atCWAfwY5SHQTUKCoqQocOHao1AebmHBJgi7p8QBDP6epMwKFDvMDAWF0ELLS1ta3WBNy9e5cJMFIXAdvt7e2rNQHDhw9nAv5D+KKylV9y8+bNCi1pVYWZM2cyCfaVTcDdsqzH7xpBQRxcwqyylLdi5/K+KM/Q0dFhAqIri4Bn1T0AUgVpdmhYUeVHnD59+r1TnjF27Fgm4HhFCThoYmLyXhLQoEGD4mRKsyIE3OrZs+d7SQCDCyZcNSqv8k1evXoFTU3NUr+wzUcfYqRBf8yb/C2WzfoBFoTF08fBdMIITDD8CsP1+kL30x7Q6dYZH7drjfZ0f4fWLdG1Q1t81qMLBvTRwejB/TBl1BDMnzQGS2dMxKo5k7Fs9iSY/jAaBvR8Pc26pZaH02quLZSXgO6xsbGlelGnli1wZKcVMqN8gKcRwItrf+K/VB95doXaLwOJIVSzOU/+2Re5kV7IuuyJrIhTyLt6mmztLBBPNZLHoUAy9fE8UvJ8ikxfj8PwJPQErJeYlkquTZs2MQFLykuANgc/Jb2kn3Z3ZMaQUrmxwO1zyAo7gfRAJ6RfOIyMEFdkXj5F8BTK5lzxQv610yi8QcFatI8gQoCIK7x+hojwRnaE5H4JTiEj9Pjr/rJDqcZyn9b4ovu45LYbdWvXeqtsXMHiSlZ5CegRExPz1hd83PYj5POo0QinXyLFg48hnZTOiQ1Dzr1IZEaeQRoJn0HKZIR7lA2kfHrQUerXHTlx4ZL+rnjjFRGRGeYB5MUj2GnbW+XbuJFrp1heXgI6JCYmvvUFN1x3Aek3SWkapRAXMeJFGS8ge2Xfuog0toaykED3Mpk8+shOk+sv68Y50V9WuKewBKt5094o39atW/mRf5WXgIYZGRlo3Lixys4nj6A6Z1YMcqRCpwU4ouDlUyHk/QA/hNttR25Wlvh/ZthJUsil9ATQ/axkYbqEzDgfL0Ts/x35+aLyTES7IY36Q6w/+Q4/tP6wuUoZ9+7dy7ebVmQZjO/atavKzn32rAdeXkd6KCkXdAxZ13yFcLFnvPD73zrDVrsdTs6eggKSuSjjORHkUGoC0i86Iyc6QPQX7eqMnTodYNuzHU4vnosiaitMSUSavwMy6d3IvEUrzViVMrq5uXEX4ytCgL++vr5Sx7Vr1cIDX0dKkQJfj37Rs3jw1sBxkwlwGD4Ax3+ciN1faCHW76xQRFgAOcjSEMBkIe0x8nLzcez7kTg8Rh/uxuOxR/cTJISFSfq7eATpZCk8CAfXLVFJwIULXHnHoIoQYLtw4UKljps2aogXQcQuef/XAiMDKY+S4DhyEFwpDnCj9f+Afl8EbbWRTANaAdihlYoAMn8aZzyNuYODX/eD29TvRH/7v+qN8H27JdOAyWQfQQ74xPafVRLAPox9WUlK6hIGEgx4f00Kg2JcvHhRqeP6FIwknXemyen/2gLIIeC/CYk49M0AuE4xgtu0sThg8AUCN62TEuBdRgJo2Y+Kxh9D/k59SQiwH9QHobt3SAk4KSGA4oWjm1YqyVi8U6Soj4yOrHM/jTAyKVby/PnzIoNi8L+L4eXlpXoFcLcTgc1rAlISkJeXDxeK2A6P1hdTwI6mQPTJE+WbAlnJyE7PhNO3Q3BkrKGYWtxfHMkkmQLO0ilwA7+vXqAkn66urtBLUZ9iHfm30NBQaPAf165dA0d9vP2UlJSEp0+f4vHjx3j06JH4e+rUqUovcNmyGkiNEkLwklXsBG+ecMUOnfbYod1emG5uboFKJ8jPFVD0l0dBUHqoPDHpQeQEb0qc4FUHe3KAbYUT9JgzDbwOFL5MfN0fXkXhJ5PxSvLt2LFD1Ah5u4z1YJ14l4qnBe8v3rhxAzz4PAVG8nLHivIP0dHRiIiIQGRkpEgmrl69ClW1QBMjQ7LDW8hmU+RRI69ckJIkhL7jfRJBm62R+TJVYq6h0jhBRslsivqenT2MF/7OyI70VmkFhWnPJaS6OyPkt43IycqR9EfWlH7JDQUUTuNhCHR7Ke9YcRp/5coVoQPrcvnyZURFRYmBZlLS0kR8MVLD29sbnp6e8PHxQUBAgCgn8YO8E3z79m3BGKeVc+bMkXuBZt06SA12F/F5Go0gR4C8HBalPZMPXKL8lQKhPAqF+f97KXFyNx6HQsoPsshJ/kmAp2TKkJLISpXvjyxNhMYcDVLOEO+lPDi8B5mamipkZx1YF9YpJCRErAy+vr5CZ9ZdWABhDGEYYTBhAOFz3g4nfMJelNCbkNCpUye5F034mvxIPi1/FM+zQCw0k5B9O0iEr5kRXkqhMJOVf9NXIHjtT7hmaymSoBzKETimkAuFpaF1dkwI9RcmIYaXv3BJXoGCuyIgk5WpefPmKCgoYK46SmX/RKoL69Sfl0WuFEl1HlmWJXE5z6WmTZvKJxxmxkIQ3AuU5APk6NICj4hRT6eITTEEzqWk55HHPjz3cxJhNF5cxeNT9kj2cRDTQjEkzpDtjyyCic5l5fEA7uSHFEefR5pPsahrb2B9QkICFHeJ51HunkdLIg0VLY0BFKdLwllVHp4dHyvst3QuEiiju21vA/+VZkiluIKt4I3RIfWXQ4QgKUxkni47LJWUP3PmjHo2RxVI+CebmKJP6EiFDVurxUgmExe5PHlnPAkn8w4QqW62NCVmYopozid5H0CI9RKE21ggJeAYEeMnfitOnRn5XCfgeJ+VTosWQU8MOc6ZE0cqnUm4fv165SrPBVHCfMI4TowUfmOfsIcdJh92kBWmUcP6GDt8EDZbzIffH5tx3/ewSFjw5LKk0MEFEkZenDBjgew7Yiog5brkt+QrknvJmhIp4Apw/A1bVpjhG/0v5d7Vrl07bNu2TelUSqUoz8uI3Z49OEtBAy+TdP1CqKtwHzvQUxxgTJs2TeX5gdq1a0ObSmCjh+jB+NuvRamL1+3ls77HCip1rTSdJP5eNnMizKndjMLoH42G4bthX+FzHS3UVVEC69evH3799VeKMXJZrlWKclUGAZ5jxoxB02ZNsNlxH74aagBHZyex986HlVTczyGmI58h4CjL2toa48ePFxsUPEotWrQoc0GT0/C2bduiY8eO4ISMcxLeoOFYhS6qm2EpoZG65jmbv+dPSyRZlt5QfVjvtX19AOFNL+aDFNI4m0eFc9Ho5ORkaGtrl5kAVp6DMOk88efEjLe++ZhclZwHTJHEHbs4YOCmLj2645fdvwnTK42zoXtaEHwNDQ3LXdZm5yad3/2r+gQmDsRnIF5KAldX6zdsgG/GG8F44Vzcu3eP2y1K6GPr2rVrK1zbnz59Or/LoaoJCPZ4kCZsjw9GECL79OmDj9q2wb+320C3/5fgPQO6Vrzh+fpcDqxXr16lbHBwgkZXm6okYJr0ECMrX5vraiJ1lArEjrEnzWuOqemiYj9spGd2ee478XkiPsJakmJ83qA05/8qXNurJFLiunXrhpo1a6LxB02wyHIFZpovgOHwYfjZ0hK2lH5u2rwZ5suWYv5ycyUlmjRpgl69eimlrFy3kwuoyOvXr19frm3RokVMwPZ3TYC57E6xVq+e6KzVDSaL/oEp82Zh8IhhWLjGAp/p9oX5ujVKBNjY2MDV1VWuzd3dXaTesm2biUQuZ8u28elSPmKr8a4vdog8GnJpcT1N1KHUuBbt0jSgWuGbzJh3mVhh2TYHBwdxjFa2jVcZnvPVlQBOLXdZWlqW2ZFxNYYVlm07fPgwAgMD5dr4OD5HeHLFFxM+O42DGtXhIkFaMQlcUjIzM0P37t1Ro0YNpZPjPJcVK7SOjo5ybU5OTqIAo0gAh97VlgAZIj4l8Pn4WFaO64ocuXG6zJtDbMqySnC7IgF8uptLVrJtq1evFuWqak+A4j4i4TNpltiJ8LPiNFFFwNGjRyWFyfedAFUny/joekkEuLi4KK0CfykCeFnkiu1flgBeFtl3/D8SsMbKykpOifv37ysRcPz4cVHKUiSA8wwNdR9/VTMBSh9Y8S4Nf2qnSICiBbDzVCRg9uzZTMC+94kAv6FDh8opwRsVHPjItnl4eEDxHNLKlStFXV+2javQ/M1SpZe+1KA4L4G7WDG57fSm/OUbXiqG0ewAFYOeYcN4fwZhvLkp2y4tftrxcltdlf/w+fPn4qNGxTCYU2m6nrRu3VqunT/EoiuZvw6TTZHpyuNNmEaNGsndP3fu3OJAq1N1JOAHDmyKheVtNP4OkE2crULRAW7fvl20EyyLy24a8p+/7WISFixYIMLt4t82bNhQYjXqXREgPq3j74mlX3AmSL8E1eOPIBXnuVT5OsVZpuLnOMeOHeN7vifwiYhYzhC5IpwlOXj1QXWdBmy/XWU/X+UqMZfKBw4cKAobHPlJlZe9h6tOu+7cuSN2dg0MDMSSyZUpmXvaSD+crq/xvl0k9BTCRa7qEPq+5T4t6ffF52WVV+f1P6zyLG30bsU4AAAAAElFTkSuQmCC">',showdown:'<img width="20" height="20" align="absmiddle" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAECtaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzA2NyA3OS4xNTc3NDcsIDIwMTUvMDMvMzAtMjM6NDA6NDIgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgICAgICAgICB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTUtMDEtMTVUMjE6MDE6MTlaPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNZXRhZGF0YURhdGU+MjAxNy0xMC0yNFQxMzozMTozMCswMTowMDwveG1wOk1ldGFkYXRhRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMTctMTAtMjRUMTM6MzE6MzArMDE6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8cGhvdG9zaG9wOklDQ1Byb2ZpbGU+c1JHQiBJRUM2MTk2Ni0yLjE8L3Bob3Rvc2hvcDpJQ0NQcm9maWxlPgogICAgICAgICA8cGhvdG9zaG9wOlRleHRMYXllcnM+CiAgICAgICAgICAgIDxyZGY6QmFnPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHBob3Rvc2hvcDpMYXllck5hbWU+UyAtPC9waG90b3Nob3A6TGF5ZXJOYW1lPgogICAgICAgICAgICAgICAgICA8cGhvdG9zaG9wOkxheWVyVGV4dD5TIC08L3Bob3Rvc2hvcDpMYXllclRleHQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpCYWc+CiAgICAgICAgIDwvcGhvdG9zaG9wOlRleHRMYXllcnM+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6N2NkMzQxNzctOWYyZi0yNDRiLWEyYjQtMzU1MzJkY2Y1MWJiPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD5hZG9iZTpkb2NpZDpwaG90b3Nob3A6M2E1YzgxYmYtYjhiNy0xMWU3LTk0NDktYTQ2MzdlZjJkNjMzPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6NjBDNUFFNjVGNjlDRTQxMTk0NUE4NTVFM0JDQTdFRUI8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6NjBDNUFFNjVGNjlDRTQxMTk0NUE4NTVFM0JDQTdFRUI8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMTUtMDEtMTVUMjE6MDE6MTlaPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6ODZjNjBkMGQtOGY0Yy01ZTRlLWEwMjQtODI4ZWQyNTIwZDc3PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE3LTEwLTI0VDEzOjMxOjMwKzAxOjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jb252ZXJ0ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+ZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZzwvc3RFdnQ6cGFyYW1ldGVycz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPmRlcml2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnBhcmFtZXRlcnM+Y29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmc8L3N0RXZ0OnBhcmFtZXRlcnM+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjdjZDM0MTc3LTlmMmYtMjQ0Yi1hMmI0LTM1NTMyZGNmNTFiYjwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxNy0xMC0yNFQxMzozMTozMCswMTowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L3htcE1NOkhpc3Rvcnk+CiAgICAgICAgIDx4bXBNTTpEZXJpdmVkRnJvbSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgIDxzdFJlZjppbnN0YW5jZUlEPnhtcC5paWQ6ODZjNjBkMGQtOGY0Yy01ZTRlLWEwMjQtODI4ZWQyNTIwZDc3PC9zdFJlZjppbnN0YW5jZUlEPgogICAgICAgICAgICA8c3RSZWY6ZG9jdW1lbnRJRD54bXAuZGlkOjYwQzVBRTY1RjY5Q0U0MTE5NDVBODU1RTNCQ0E3RUVCPC9zdFJlZjpkb2N1bWVudElEPgogICAgICAgICAgICA8c3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6NjBDNUFFNjVGNjlDRTQxMTk0NUE4NTVFM0JDQTdFRUI8L3N0UmVmOm9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NjQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NjQ8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pse7bzcAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAA1JJREFUeNrsm1+OmlAUhz+aeS9dwZggJn1AnRUMO6jpBgZXULuC2hWUWUGZBTSxKyiuoA4mfUBMnB04K5g+9DihRBHlyh/lJLwIXLgf99xzzu9etZeXFy7Z3nDh1gBoAFy4XeVtQNO0zNcapmUDfUBPnFoBfhQGq6IBaHmjwD4Ahmk5wAD4kKG5J8CNwsAFaHe6DvA9cc0wCgOv8gDka3vA9RHNPgo0D7hNnJtGYWBXxgV2dH4MfMnRRA+Y1WIO2NJ5F/ikoKm3tYsChmkNFHW+fmHQMC1dfHaXPQP3wM1yMdc2B/AOGALTWobBmI1Shu0UGCwX83XyRBQGawHntTtdG5gUNfxVu4CTNqNv6/wWGL7kCc+1AmCYVisl3I2ydD4GYZUCs7IjoLXrxHIx9w9tLAqDCfBwDrXAY457x+cAoCfuwRGjYFUnAGk+PsjR7s8Dn1VeLWCYVlpDw+VivjVHSHt+u9PVJbzGzZXQWTkAkz0V31fATUaEsjVJlQBs4FeGcteLgzgbAALBA+4y3voAeJL8nA0AHfClnM1qm1HhnYUidCSE+KzvSSJUTwAxCOMcpfETMFYpfRUKIAbCFhC3OTJJJwqDWS0BxED0JZ4Pjix1P2+E0loCSMBwyK4S/xc1ojBwag8gMU84cvTKGgmlAYhngu1O9xAXuVE5J1QCQCz3bwHuHvdQui5QKQAxEO6eEKpsFCgTRSXkvdoxSlBMCxhJJbgrrbZRtHCiShN0pRB6PeQ3ckBw2K0oKXMBVYJIP+Nvh9qulFivGoBt1lLQxowT2ykBXCfnhZIglgYACWmqXQv+baioBYCeiCQHm+QEg1O7RhF7hO4OhSAhcJKSFU7qBGADwZeqMMuXn6TUBw8qlaMrirNb4LdhWlP+SWD+cjFfxTpuS2GUpik+o3jFSEkqbJiWn0P0OMSGqlWiOu0TvD+FRHZKAE+oW+cfRmEwqlsesJJEJs8y91QqP+9UL6lqEtz2gpuNEY5sm9sIHln2DRa2aFKGJtiXkZEMiWtgVvRKUSUFkSKt2S7fAGgAXLYpmQQXf36MUChTZdUa2u8/rkvPA6Tz30r4eH3ybcBS5gJ6SaNXb+aABkA1AMxKenclBZLW/He4cYEGwEXb3wEASelexk6LIIIAAAAASUVORK5CYII=">'},I.Converter=function(g){"use strict";function C(g,C){if(C=C||null,I.helper.isString(g)){if(g=I.helper.stdExtName(g),C=g,I.extensions[g])return console.warn("DEPRECATION WARNING: "+g+" is an old extension that uses a deprecated loading method.Please inform the developer that the extension should be updated!"),void function(g,C){"function"==typeof g&&(g=g(new I.Converter));I.helper.isArray(g)||(g=[g]);var e=A(g,C);if(!e.valid)throw Error(e.error);for(var r=0;r<g.length;++r)switch(g[r].type){case"lang":s.push(g[r]);break;case"output":i.push(g[r]);break;default:throw Error("Extension loader error: Type unrecognized!!!")}}(I.extensions[g],g);if(I.helper.isUndefined(r[g]))throw Error('Extension "'+g+'" could not be loaded. It was either not found or is not a valid extension.');g=r[g]}"function"==typeof g&&(g=g()),I.helper.isArray(g)||(g=[g]);var t=A(g,C);if(!t.valid)throw Error(t.error);for(var a=0;a<g.length;++a){switch(g[a].type){case"lang":s.push(g[a]);break;case"output":i.push(g[a])}if(g[a].hasOwnProperty("listeners"))for(var n in g[a].listeners)g[a].listeners.hasOwnProperty(n)&&e(n,g[a].listeners[n])}}function e(g,A){if(!I.helper.isString(g))throw Error("Invalid argument in converter.listen() method: name must be a string, but "+typeof g+" given");if("function"!=typeof A)throw Error("Invalid argument in converter.listen() method: callback must be a function, but "+typeof A+" given");l.hasOwnProperty(g)||(l[g]=[]),l[g].push(A)}var o={},s=[],i=[],l={},c=a,u={parsed:{},raw:"",format:""};!function(){g=g||{};for(var A in t)t.hasOwnProperty(A)&&(o[A]=t[A]);if("object"!=typeof g)throw Error("Converter expects the passed parameter to be an object, but "+typeof g+" was passed instead.");for(var e in g)g.hasOwnProperty(e)&&(o[e]=g[e]);o.extensions&&I.helper.forEach(o.extensions,C)}(),this._dispatch=function(g,A,C,I){if(l.hasOwnProperty(g))for(var e=0;e<l[g].length;++e){var r=l[g][e](g,A,this,C,I);r&&void 0!==r&&(A=r)}return A},this.listen=function(g,A){return e(g,A),this},this.makeHtml=function(g){if(!g)return g;var A={gHtmlBlocks:[],gHtmlMdBlocks:[],gHtmlSpans:[],gUrls:{},gTitles:{},gDimensions:{},gListLevel:0,hashLinkCounts:{},langExtensions:s,outputModifiers:i,converter:this,ghCodeBlocks:[],metadata:{parsed:{},raw:"",format:""}};return g=g.replace(/¨/g,"¨T"),g=g.replace(/\$/g,"¨D"),g=g.replace(/\r\n/g,"\n"),g=g.replace(/\r/g,"\n"),g=g.replace(/\u00A0/g," "),o.smartIndentationFix&&(g=function(g){var A=g.match(/^\s*/)[0].length,C=new RegExp("^\\s{0,"+A+"}","gm");return g.replace(C,"")}(g)),g="\n\n"+g+"\n\n",g=I.subParser("detab")(g,o,A),g=g.replace(/^[ \t]+$/gm,""),I.helper.forEach(s,function(C){g=I.subParser("runExtension")(C,g,o,A)}),g=I.subParser("metadata")(g,o,A),g=I.subParser("hashPreCodeTags")(g,o,A),g=I.subParser("githubCodeBlocks")(g,o,A),g=I.subParser("hashHTMLBlocks")(g,o,A),g=I.subParser("hashCodeTags")(g,o,A),g=I.subParser("stripLinkDefinitions")(g,o,A),g=I.subParser("blockGamut")(g,o,A),g=I.subParser("unhashHTMLSpans")(g,o,A),g=I.subParser("unescapeSpecialChars")(g,o,A),g=g.replace(/¨D/g,"$$"),g=g.replace(/¨T/g,"¨"),g=I.subParser("completeHTMLDocument")(g,o,A),I.helper.forEach(i,function(C){g=I.subParser("runExtension")(C,g,o,A)}),u=A.metadata,g},this.setOption=function(g,A){o[g]=A},this.getOption=function(g){return o[g]},this.getOptions=function(){return o},this.addExtension=function(g,A){C(g,A=A||null)},this.useExtension=function(g){C(g)},this.setFlavor=function(g){if(!n.hasOwnProperty(g))throw Error(g+" flavor was not found");var A=n[g];c=g;for(var C in A)A.hasOwnProperty(C)&&(o[C]=A[C])},this.getFlavor=function(){return c},this.removeExtension=function(g){I.helper.isArray(g)||(g=[g]);for(var A=0;A<g.length;++A){for(var C=g[A],e=0;e<s.length;++e)s[e]===C&&s[e].splice(e,1);for(;0<i.length;++e)i[0]===C&&i[0].splice(e,1)}},this.getAllExtensions=function(){return{language:s,output:i}},this.getMetadata=function(g){return g?u.raw:u.parsed},this.getMetadataFormat=function(){return u.format},this._setMetadataPair=function(g,A){u.parsed[g]=A},this._setMetadataFormat=function(g){u.format=g},this._setMetadataRaw=function(g){u.raw=g}},I.subParser("anchors",function(g,A,C){"use strict";var e=function(g,e,r,t,a,n,o){if(I.helper.isUndefined(o)&&(o=""),r=r.toLowerCase(),g.search(/\(<?\s*>? ?(['"].*['"])?\)$/m)>-1)t="";else if(!t){if(r||(r=e.toLowerCase().replace(/ ?\n/g," ")),t="#"+r,I.helper.isUndefined(C.gUrls[r]))return g;t=C.gUrls[r],I.helper.isUndefined(C.gTitles[r])||(o=C.gTitles[r])}var s='<a href="'+(t=t.replace(I.helper.regexes.asteriskDashAndColon,I.helper.escapeCharactersCallback))+'"';return""!==o&&null!==o&&(s+=' title="'+(o=(o=o.replace(/"/g,"&quot;")).replace(I.helper.regexes.asteriskDashAndColon,I.helper.escapeCharactersCallback))+'"'),A.openLinksInNewWindow&&!/^#/.test(t)&&(s+=' target="¨E95Eblank"'),s+=">"+e+"</a>"};return g=(g=C.converter._dispatch("anchors.before",g,A,C)).replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g,e),g=g.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,e),g=g.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,e),g=g.replace(/\[([^\[\]]+)]()()()()()/g,e),A.ghMentions&&(g=g.replace(/(^|\s)(\\)?(@([a-z\d\-]+))(?=[.!?;,[\]()]|\s|$)/gim,function(g,C,e,r,t){if("\\"===e)return C+r;if(!I.helper.isString(A.ghMentionsLink))throw new Error("ghMentionsLink option must be a string");var a=A.ghMentionsLink.replace(/\{u}/g,t),n="";return A.openLinksInNewWindow&&(n=' target="¨E95Eblank"'),C+'<a href="'+a+'"'+n+">"+r+"</a>"})),g=C.converter._dispatch("anchors.after",g,A,C)});var s=/([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi,i=/([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi,l=/()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi,c=/(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gim,u=/<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,d=function(g){"use strict";return function(A,C,e,r,t,a,n){var o=e=e.replace(I.helper.regexes.asteriskDashAndColon,I.helper.escapeCharactersCallback),s="",i="",l=C||"",c=n||"";return/^www\./i.test(e)&&(e=e.replace(/^www\./i,"http://www.")),g.excludeTrailingPunctuationFromURLs&&a&&(s=a),g.openLinksInNewWindow&&(i=' target="¨E95Eblank"'),l+'<a href="'+e+'"'+i+">"+o+"</a>"+s+c}},p=function(g,A){"use strict";return function(C,e,r){var t="mailto:";return e=e||"",r=I.subParser("unescapeSpecialChars")(r,g,A),g.encodeEmails?(t=I.helper.encodeEmailAddress(t+r),r=I.helper.encodeEmailAddress(r)):t+=r,e+'<a href="'+t+'">'+r+"</a>"}};I.subParser("autoLinks",function(g,A,C){"use strict";return g=C.converter._dispatch("autoLinks.before",g,A,C),g=g.replace(l,d(A)),g=g.replace(u,p(A,C)),g=C.converter._dispatch("autoLinks.after",g,A,C)}),I.subParser("simplifiedAutoLinks",function(g,A,C){"use strict";return A.simplifiedAutoLink?(g=C.converter._dispatch("simplifiedAutoLinks.before",g,A,C),g=A.excludeTrailingPunctuationFromURLs?g.replace(i,d(A)):g.replace(s,d(A)),g=g.replace(c,p(A,C)),g=C.converter._dispatch("simplifiedAutoLinks.after",g,A,C)):g}),I.subParser("blockGamut",function(g,A,C){"use strict";return g=C.converter._dispatch("blockGamut.before",g,A,C),g=I.subParser("blockQuotes")(g,A,C),g=I.subParser("headers")(g,A,C),g=I.subParser("horizontalRule")(g,A,C),g=I.subParser("lists")(g,A,C),g=I.subParser("codeBlocks")(g,A,C),g=I.subParser("tables")(g,A,C),g=I.subParser("hashHTMLBlocks")(g,A,C),g=I.subParser("paragraphs")(g,A,C),g=C.converter._dispatch("blockGamut.after",g,A,C)}),I.subParser("blockQuotes",function(g,A,C){"use strict";g=C.converter._dispatch("blockQuotes.before",g,A,C),g+="\n\n";var e=/(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;return A.splitAdjacentBlockquotes&&(e=/^ {0,3}>[\s\S]*?(?:\n\n)/gm),g=g.replace(e,function(g){return g=g.replace(/^[ \t]*>[ \t]?/gm,""),g=g.replace(/¨0/g,""),g=g.replace(/^[ \t]+$/gm,""),g=I.subParser("githubCodeBlocks")(g,A,C),g=I.subParser("blockGamut")(g,A,C),g=g.replace(/(^|\n)/g,"$1  "),g=g.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(g,A){var C=A;return C=C.replace(/^  /gm,"¨0"),C=C.replace(/¨0/g,"")}),I.subParser("hashBlock")("<blockquote>\n"+g+"\n</blockquote>",A,C)}),g=C.converter._dispatch("blockQuotes.after",g,A,C)}),I.subParser("codeBlocks",function(g,A,C){"use strict";g=C.converter._dispatch("codeBlocks.before",g,A,C);return g=(g+="¨0").replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g,function(g,e,r){var t=e,a=r,n="\n";return t=I.subParser("outdent")(t,A,C),t=I.subParser("encodeCode")(t,A,C),t=I.subParser("detab")(t,A,C),t=t.replace(/^\n+/g,""),t=t.replace(/\n+$/g,""),A.omitExtraWLInCodeBlocks&&(n=""),t="<pre><code>"+t+n+"</code></pre>",I.subParser("hashBlock")(t,A,C)+a}),g=g.replace(/¨0/,""),g=C.converter._dispatch("codeBlocks.after",g,A,C)}),I.subParser("codeSpans",function(g,A,C){"use strict";return void 0===(g=C.converter._dispatch("codeSpans.before",g,A,C))&&(g=""),g=g.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(g,e,r,t){var a=t;return a=a.replace(/^([ \t]*)/g,""),a=a.replace(/[ \t]*$/g,""),a=I.subParser("encodeCode")(a,A,C),a=e+"<code>"+a+"</code>",a=I.subParser("hashHTMLSpans")(a,A,C)}),g=C.converter._dispatch("codeSpans.after",g,A,C)}),I.subParser("completeHTMLDocument",function(g,A,C){"use strict";if(!A.completeHTMLDocument)return g;g=C.converter._dispatch("completeHTMLDocument.before",g,A,C);var I="html",e="<!DOCTYPE HTML>\n",r="",t='<meta charset="utf-8">\n',a="",n="";void 0!==C.metadata.parsed.doctype&&(e="<!DOCTYPE "+C.metadata.parsed.doctype+">\n","html"!==(I=C.metadata.parsed.doctype.toString().toLowerCase())&&"html5"!==I||(t='<meta charset="utf-8">'));for(var o in C.metadata.parsed)if(C.metadata.parsed.hasOwnProperty(o))switch(o.toLowerCase()){case"doctype":break;case"title":r="<title>"+C.metadata.parsed.title+"</title>\n";break;case"charset":t="html"===I||"html5"===I?'<meta charset="'+C.metadata.parsed.charset+'">\n':'<meta name="charset" content="'+C.metadata.parsed.charset+'">\n';break;case"language":case"lang":a=' lang="'+C.metadata.parsed[o]+'"',n+='<meta name="'+o+'" content="'+C.metadata.parsed[o]+'">\n';break;default:n+='<meta name="'+o+'" content="'+C.metadata.parsed[o]+'">\n'}return g=e+"<html"+a+">\n<head>\n"+r+t+n+"</head>\n<body>\n"+g.trim()+"\n</body>\n</html>",g=C.converter._dispatch("completeHTMLDocument.after",g,A,C)}),I.subParser("detab",function(g,A,C){"use strict";return g=C.converter._dispatch("detab.before",g,A,C),g=g.replace(/\t(?=\t)/g,"    "),g=g.replace(/\t/g,"¨A¨B"),g=g.replace(/¨B(.+?)¨A/g,function(g,A){for(var C=A,I=4-C.length%4,e=0;e<I;e++)C+=" ";return C}),g=g.replace(/¨A/g,"    "),g=g.replace(/¨B/g,""),g=C.converter._dispatch("detab.after",g,A,C)}),I.subParser("ellipsis",function(g,A,C){"use strict";return g=C.converter._dispatch("ellipsis.before",g,A,C),g=g.replace(/\.\.\./g,"…"),g=C.converter._dispatch("ellipsis.after",g,A,C)}),I.subParser("emoji",function(g,A,C){"use strict";if(!A.emoji)return g;return g=(g=C.converter._dispatch("emoji.before",g,A,C)).replace(/:([\S]+?):/g,function(g,A){return I.helper.emojis.hasOwnProperty(A)?I.helper.emojis[A]:g}),g=C.converter._dispatch("emoji.after",g,A,C)}),I.subParser("encodeAmpsAndAngles",function(g,A,C){"use strict";return g=C.converter._dispatch("encodeAmpsAndAngles.before",g,A,C),g=g.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"),g=g.replace(/<(?![a-z\/?$!])/gi,"&lt;"),g=g.replace(/</g,"&lt;"),g=g.replace(/>/g,"&gt;"),g=C.converter._dispatch("encodeAmpsAndAngles.after",g,A,C)}),I.subParser("encodeBackslashEscapes",function(g,A,C){"use strict";return g=C.converter._dispatch("encodeBackslashEscapes.before",g,A,C),g=g.replace(/\\(\\)/g,I.helper.escapeCharactersCallback),g=g.replace(/\\([`*_{}\[\]()>#+.!~=|-])/g,I.helper.escapeCharactersCallback),g=C.converter._dispatch("encodeBackslashEscapes.after",g,A,C)}),I.subParser("encodeCode",function(g,A,C){"use strict";return g=C.converter._dispatch("encodeCode.before",g,A,C),g=g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/([*_{}\[\]\\=~-])/g,I.helper.escapeCharactersCallback),g=C.converter._dispatch("encodeCode.after",g,A,C)}),I.subParser("escapeSpecialCharsWithinTagAttributes",function(g,A,C){"use strict";return g=(g=C.converter._dispatch("escapeSpecialCharsWithinTagAttributes.before",g,A,C)).replace(/<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,function(g){return g.replace(/(.)<\/?code>(?=.)/g,"$1`").replace(/([\\`*_~=|])/g,I.helper.escapeCharactersCallback)}),g=g.replace(/<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi,function(g){return g.replace(/([\\`*_~=|])/g,I.helper.escapeCharactersCallback)}),g=C.converter._dispatch("escapeSpecialCharsWithinTagAttributes.after",g,A,C)}),I.subParser("githubCodeBlocks",function(g,A,C){"use strict";return A.ghCodeBlocks?(g=C.converter._dispatch("githubCodeBlocks.before",g,A,C),g+="¨0",g=g.replace(/(?:^|\n)(```+|~~~+)([^\s`~]*)\n([\s\S]*?)\n\1/g,function(g,e,r,t){var a=A.omitExtraWLInCodeBlocks?"":"\n";return t=I.subParser("encodeCode")(t,A,C),t=I.subParser("detab")(t,A,C),t=t.replace(/^\n+/g,""),t=t.replace(/\n+$/g,""),t="<pre><code"+(r?' class="'+r+" language-"+r+'"':"")+">"+t+a+"</code></pre>",t=I.subParser("hashBlock")(t,A,C),"\n\n¨G"+(C.ghCodeBlocks.push({text:g,codeblock:t})-1)+"G\n\n"}),g=g.replace(/¨0/,""),C.converter._dispatch("githubCodeBlocks.after",g,A,C)):g}),I.subParser("hashBlock",function(g,A,C){"use strict";return g=C.converter._dispatch("hashBlock.before",g,A,C),g=g.replace(/(^\n+|\n+$)/g,""),g="\n\n¨K"+(C.gHtmlBlocks.push(g)-1)+"K\n\n",g=C.converter._dispatch("hashBlock.after",g,A,C)}),I.subParser("hashCodeTags",function(g,A,C){"use strict";g=C.converter._dispatch("hashCodeTags.before",g,A,C);return g=I.helper.replaceRecursiveRegExp(g,function(g,e,r,t){var a=r+I.subParser("encodeCode")(e,A,C)+t;return"¨C"+(C.gHtmlSpans.push(a)-1)+"C"},"<code\\b[^>]*>","</code>","gim"),g=C.converter._dispatch("hashCodeTags.after",g,A,C)}),I.subParser("hashElement",function(g,A,C){"use strict";return function(g,A){var I=A;return I=I.replace(/\n\n/g,"\n"),I=I.replace(/^\n/,""),I=I.replace(/\n+$/g,""),I="\n\n¨K"+(C.gHtmlBlocks.push(I)-1)+"K\n\n"}}),I.subParser("hashHTMLBlocks",function(g,A,C){"use strict";g=C.converter._dispatch("hashHTMLBlocks.before",g,A,C);var e=["pre","div","h1","h2","h3","h4","h5","h6","blockquote","table","dl","ol","ul","script","noscript","form","fieldset","iframe","math","style","section","header","footer","nav","article","aside","address","audio","canvas","figure","hgroup","output","video","p"],r=function(g,A,I,e){var r=g;return-1!==I.search(/\bmarkdown\b/)&&(r=I+C.converter.makeHtml(A)+e),"\n\n¨K"+(C.gHtmlBlocks.push(r)-1)+"K\n\n"};A.backslashEscapesHTMLTags&&(g=g.replace(/\\<(\/?[^>]+?)>/g,function(g,A){return"&lt;"+A+"&gt;"}));for(var t=0;t<e.length;++t)for(var a,n=new RegExp("^ {0,3}(<"+e[t]+"\\b[^>]*>)","im"),o="<"+e[t]+"\\b[^>]*>",s="</"+e[t]+">";-1!==(a=I.helper.regexIndexOf(g,n));){var i=I.helper.splitAtIndex(g,a),l=I.helper.replaceRecursiveRegExp(i[1],r,o,s,"im");if(l===i[1])break;g=i[0].concat(l)}return g=g.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,I.subParser("hashElement")(g,A,C)),g=I.helper.replaceRecursiveRegExp(g,function(g){return"\n\n¨K"+(C.gHtmlBlocks.push(g)-1)+"K\n\n"},"^ {0,3}\x3c!--","--\x3e","gm"),g=g.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,I.subParser("hashElement")(g,A,C)),g=C.converter._dispatch("hashHTMLBlocks.after",g,A,C)}),I.subParser("hashHTMLSpans",function(g,A,C){"use strict";function I(g){return"¨C"+(C.gHtmlSpans.push(g)-1)+"C"}return g=C.converter._dispatch("hashHTMLSpans.before",g,A,C),g=g.replace(/<[^>]+?\/>/gi,function(g){return I(g)}),g=g.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g,function(g){return I(g)}),g=g.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g,function(g){return I(g)}),g=g.replace(/<[^>]+?>/gi,function(g){return I(g)}),g=C.converter._dispatch("hashHTMLSpans.after",g,A,C)}),I.subParser("unhashHTMLSpans",function(g,A,C){"use strict";g=C.converter._dispatch("unhashHTMLSpans.before",g,A,C);for(var I=0;I<C.gHtmlSpans.length;++I){for(var e=C.gHtmlSpans[I],r=0;/¨C(\d+)C/.test(e);){var t=RegExp.$1;if(e=e.replace("¨C"+t+"C",C.gHtmlSpans[t]),10===r){console.error("maximum nesting of 10 spans reached!!!");break}++r}g=g.replace("¨C"+I+"C",e)}return g=C.converter._dispatch("unhashHTMLSpans.after",g,A,C)}),I.subParser("hashPreCodeTags",function(g,A,C){"use strict";g=C.converter._dispatch("hashPreCodeTags.before",g,A,C);return g=I.helper.replaceRecursiveRegExp(g,function(g,e,r,t){var a=r+I.subParser("encodeCode")(e,A,C)+t;return"\n\n¨G"+(C.ghCodeBlocks.push({text:g,codeblock:a})-1)+"G\n\n"},"^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>","^ {0,3}</code>\\s*</pre>","gim"),g=C.converter._dispatch("hashPreCodeTags.after",g,A,C)}),I.subParser("headers",function(g,A,C){"use strict";function e(g){var e,r;if(A.customizedHeaderId){var t=g.match(/\{([^{]+?)}\s*$/);t&&t[1]&&(g=t[1])}return e=g,r=I.helper.isString(A.prefixHeaderId)?A.prefixHeaderId:!0===A.prefixHeaderId?"section-":"",A.rawPrefixHeaderId||(e=r+e),e=A.ghCompatibleHeaderId?e.replace(/ /g,"-").replace(/&amp;/g,"").replace(/¨T/g,"").replace(/¨D/g,"").replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g,"").toLowerCase():A.rawHeaderId?e.replace(/ /g,"-").replace(/&amp;/g,"&").replace(/¨T/g,"¨").replace(/¨D/g,"$").replace(/["']/g,"-").toLowerCase():e.replace(/[^\w]/g,"").toLowerCase(),A.rawPrefixHeaderId&&(e=r+e),C.hashLinkCounts[e]?e=e+"-"+C.hashLinkCounts[e]++:C.hashLinkCounts[e]=1,e}g=C.converter._dispatch("headers.before",g,A,C);var r=isNaN(parseInt(A.headerLevelStart))?1:parseInt(A.headerLevelStart),t=A.smoothLivePreview?/^(.+)[ \t]*\n={2,}[ \t]*\n+/gm:/^(.+)[ \t]*\n=+[ \t]*\n+/gm,a=A.smoothLivePreview?/^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm:/^(.+)[ \t]*\n-+[ \t]*\n+/gm;g=(g=g.replace(t,function(g,t){var a=I.subParser("spanGamut")(t,A,C),n=A.noHeaderId?"":' id="'+e(t)+'"',o="<h"+r+n+">"+a+"</h"+r+">";return I.subParser("hashBlock")(o,A,C)})).replace(a,function(g,t){var a=I.subParser("spanGamut")(t,A,C),n=A.noHeaderId?"":' id="'+e(t)+'"',o=r+1,s="<h"+o+n+">"+a+"</h"+o+">";return I.subParser("hashBlock")(s,A,C)});var n=A.requireSpaceBeforeHeadingText?/^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm:/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;return g=g.replace(n,function(g,t,a){var n=a;A.customizedHeaderId&&(n=a.replace(/\s?\{([^{]+?)}\s*$/,""));var o=I.subParser("spanGamut")(n,A,C),s=A.noHeaderId?"":' id="'+e(a)+'"',i=r-1+t.length,l="<h"+i+s+">"+o+"</h"+i+">";return I.subParser("hashBlock")(l,A,C)}),g=C.converter._dispatch("headers.after",g,A,C)}),I.subParser("horizontalRule",function(g,A,C){"use strict";g=C.converter._dispatch("horizontalRule.before",g,A,C);var e=I.subParser("hashBlock")("<hr />",A,C);return g=g.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm,e),g=g.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm,e),g=g.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm,e),g=C.converter._dispatch("horizontalRule.after",g,A,C)}),I.subParser("images",function(g,A,C){"use strict";function e(g,A,e,r,t,a,n,o){var s=C.gUrls,i=C.gTitles,l=C.gDimensions;if(e=e.toLowerCase(),o||(o=""),g.search(/\(<?\s*>? ?(['"].*['"])?\)$/m)>-1)r="";else if(""===r||null===r){if(""!==e&&null!==e||(e=A.toLowerCase().replace(/ ?\n/g," ")),r="#"+e,I.helper.isUndefined(s[e]))return g;r=s[e],I.helper.isUndefined(i[e])||(o=i[e]),I.helper.isUndefined(l[e])||(t=l[e].width,a=l[e].height)}A=A.replace(/"/g,"&quot;").replace(I.helper.regexes.asteriskDashAndColon,I.helper.escapeCharactersCallback);var c='<img src="'+(r=r.replace(I.helper.regexes.asteriskDashAndColon,I.helper.escapeCharactersCallback))+'" alt="'+A+'"';return o&&(c+=' title="'+(o=o.replace(/"/g,"&quot;").replace(I.helper.regexes.asteriskDashAndColon,I.helper.escapeCharactersCallback))+'"'),t&&a&&(c+=' width="'+(t="*"===t?"auto":t)+'"',c+=' height="'+(a="*"===a?"auto":a)+'"'),c+=" />"}return g=(g=C.converter._dispatch("images.before",g,A,C)).replace(/!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,e),g=g.replace(/!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,function(g,A,C,I,r,t,a,n){return I=I.replace(/\s/g,""),e(g,A,C,I,r,t,0,n)}),g=g.replace(/!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,e),g=g.replace(/!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,e),g=g.replace(/!\[([^\[\]]+)]()()()()()/g,e),g=C.converter._dispatch("images.after",g,A,C)}),I.subParser("italicsAndBold",function(g,A,C){"use strict";function I(g,A,C){return A+g+C}return g=C.converter._dispatch("italicsAndBold.before",g,A,C),g=A.literalMidWordUnderscores?(g=(g=g.replace(/\b___(\S[\s\S]*)___\b/g,function(g,A){return I(A,"<strong><em>","</em></strong>")})).replace(/\b__(\S[\s\S]*)__\b/g,function(g,A){return I(A,"<strong>","</strong>")})).replace(/\b_(\S[\s\S]*?)_\b/g,function(g,A){return I(A,"<em>","</em>")}):(g=(g=g.replace(/___(\S[\s\S]*?)___/g,function(g,A){return/\S$/.test(A)?I(A,"<strong><em>","</em></strong>"):g})).replace(/__(\S[\s\S]*?)__/g,function(g,A){return/\S$/.test(A)?I(A,"<strong>","</strong>"):g})).replace(/_([^\s_][\s\S]*?)_/g,function(g,A){return/\S$/.test(A)?I(A,"<em>","</em>"):g}),g=A.literalMidWordAsterisks?(g=(g=g.replace(/([^*]|^)\B\*\*\*(\S[\s\S]+?)\*\*\*\B(?!\*)/g,function(g,A,C){return I(C,A+"<strong><em>","</em></strong>")})).replace(/([^*]|^)\B\*\*(\S[\s\S]+?)\*\*\B(?!\*)/g,function(g,A,C){return I(C,A+"<strong>","</strong>")})).replace(/([^*]|^)\B\*(\S[\s\S]+?)\*\B(?!\*)/g,function(g,A,C){return I(C,A+"<em>","</em>")}):(g=(g=g.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g,function(g,A){return/\S$/.test(A)?I(A,"<strong><em>","</em></strong>"):g})).replace(/\*\*(\S[\s\S]*?)\*\*/g,function(g,A){return/\S$/.test(A)?I(A,"<strong>","</strong>"):g})).replace(/\*([^\s*][\s\S]*?)\*/g,function(g,A){return/\S$/.test(A)?I(A,"<em>","</em>"):g}),g=C.converter._dispatch("italicsAndBold.after",g,A,C)}),I.subParser("lists",function(g,A,C){"use strict";function e(g,e){C.gListLevel++,g=g.replace(/\n{2,}$/,"\n");var r=/(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,t=/\n[ \t]*\n(?!¨0)/.test(g+="¨0");return A.disableForced4SpacesIndentedSublists&&(r=/(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm),g=g.replace(r,function(g,e,r,a,n,o,s){s=s&&""!==s.trim();var i=I.subParser("outdent")(n,A,C),l="";return o&&A.tasklists&&(l=' class="task-list-item" style="list-style-type: none;"',i=i.replace(/^[ \t]*\[(x|X| )?]/m,function(){var g='<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';return s&&(g+=" checked"),g+=">"})),i=i.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g,function(g){return"¨A"+g}),e||i.search(/\n{2,}/)>-1?(i=I.subParser("githubCodeBlocks")(i,A,C),i=I.subParser("blockGamut")(i,A,C)):(i=(i=I.subParser("lists")(i,A,C)).replace(/\n$/,""),i=(i=I.subParser("hashHTMLBlocks")(i,A,C)).replace(/\n\n+/g,"\n\n"),i=t?I.subParser("paragraphs")(i,A,C):I.subParser("spanGamut")(i,A,C)),i=i.replace("¨A",""),i="<li"+l+">"+i+"</li>\n"}),g=g.replace(/¨0/g,""),C.gListLevel--,e&&(g=g.replace(/\s+$/,"")),g}function r(g,A){if("ol"===A){var C=g.match(/^ *(\d+)\./);if(C&&"1"!==C[1])return' start="'+C[1]+'"'}return""}function t(g,C,I){var t=A.disableForced4SpacesIndentedSublists?/^ ?\d+\.[ \t]/gm:/^ {0,3}\d+\.[ \t]/gm,a=A.disableForced4SpacesIndentedSublists?/^ ?[*+-][ \t]/gm:/^ {0,3}[*+-][ \t]/gm,n="ul"===C?t:a,o="";if(-1!==g.search(n))!function A(s){var i=s.search(n),l=r(g,C);-1!==i?(o+="\n\n<"+C+l+">\n"+e(s.slice(0,i),!!I)+"</"+C+">\n",n="ul"===(C="ul"===C?"ol":"ul")?t:a,A(s.slice(i))):o+="\n\n<"+C+l+">\n"+e(s,!!I)+"</"+C+">\n"}(g);else{var s=r(g,C);o="\n\n<"+C+s+">\n"+e(g,!!I)+"</"+C+">\n"}return o}return g=C.converter._dispatch("lists.before",g,A,C),g+="¨0",g=C.gListLevel?g.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,function(g,A,C){return t(A,C.search(/[*+-]/g)>-1?"ul":"ol",!0)}):g.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,function(g,A,C,I){return t(C,I.search(/[*+-]/g)>-1?"ul":"ol",!1)}),g=g.replace(/¨0/,""),g=C.converter._dispatch("lists.after",g,A,C)}),I.subParser("metadata",function(g,A,C){"use strict";function I(g){C.metadata.raw=g,(g=(g=g.replace(/&/g,"&amp;").replace(/"/g,"&quot;")).replace(/\n {4}/g," ")).replace(/^([\S ]+): +([\s\S]+?)$/gm,function(g,A,I){return C.metadata.parsed[A]=I,""})}return A.metadata?(g=C.converter._dispatch("metadata.before",g,A,C),g=g.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/,function(g,A,C){return I(C),"¨M"}),g=g.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/,function(g,A,e){return A&&(C.metadata.format=A),I(e),"¨M"}),g=g.replace(/¨M/g,""),g=C.converter._dispatch("metadata.after",g,A,C)):g}),I.subParser("outdent",function(g,A,C){"use strict";return g=C.converter._dispatch("outdent.before",g,A,C),g=g.replace(/^(\t|[ ]{1,4})/gm,"¨0"),g=g.replace(/¨0/g,""),g=C.converter._dispatch("outdent.after",g,A,C)}),I.subParser("paragraphs",function(g,A,C){"use strict";for(var e=(g=(g=(g=C.converter._dispatch("paragraphs.before",g,A,C)).replace(/^\n+/g,"")).replace(/\n+$/g,"")).split(/\n{2,}/g),r=[],t=e.length,a=0;a<t;a++){var n=e[a];n.search(/¨(K|G)(\d+)\1/g)>=0?r.push(n):n.search(/\S/)>=0&&(n=(n=I.subParser("spanGamut")(n,A,C)).replace(/^([ \t]*)/g,"<p>"),n+="</p>",r.push(n))}for(t=r.length,a=0;a<t;a++){for(var o="",s=r[a],i=!1;/¨(K|G)(\d+)\1/.test(s);){var l=RegExp.$1,c=RegExp.$2;o=(o="K"===l?C.gHtmlBlocks[c]:i?I.subParser("encodeCode")(C.ghCodeBlocks[c].text,A,C):C.ghCodeBlocks[c].codeblock).replace(/\$/g,"$$$$"),s=s.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/,o),/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(s)&&(i=!0)}r[a]=s}return g=r.join("\n"),g=g.replace(/^\n+/g,""),g=g.replace(/\n+$/g,""),C.converter._dispatch("paragraphs.after",g,A,C)}),I.subParser("runExtension",function(g,A,C,I){"use strict";if(g.filter)A=g.filter(A,I.converter,C);else if(g.regex){var e=g.regex;e instanceof RegExp||(e=new RegExp(e,"g")),A=A.replace(e,g.replace)}return A}),I.subParser("spanGamut",function(g,A,C){"use strict";return g=C.converter._dispatch("spanGamut.before",g,A,C),g=I.subParser("codeSpans")(g,A,C),g=I.subParser("escapeSpecialCharsWithinTagAttributes")(g,A,C),g=I.subParser("encodeBackslashEscapes")(g,A,C),g=I.subParser("images")(g,A,C),g=I.subParser("anchors")(g,A,C),g=I.subParser("autoLinks")(g,A,C),g=I.subParser("simplifiedAutoLinks")(g,A,C),g=I.subParser("emoji")(g,A,C),g=I.subParser("underline")(g,A,C),g=I.subParser("italicsAndBold")(g,A,C),g=I.subParser("strikethrough")(g,A,C),g=I.subParser("ellipsis")(g,A,C),g=I.subParser("hashHTMLSpans")(g,A,C),g=I.subParser("encodeAmpsAndAngles")(g,A,C),A.simpleLineBreaks?/\n\n¨K/.test(g)||(g=g.replace(/\n+/g,"<br />\n")):g=g.replace(/  +\n/g,"<br />\n"),g=C.converter._dispatch("spanGamut.after",g,A,C)}),I.subParser("strikethrough",function(g,A,C){"use strict";return A.strikethrough&&(g=(g=C.converter._dispatch("strikethrough.before",g,A,C)).replace(/(?:~){2}([\s\S]+?)(?:~){2}/g,function(g,e){return function(g){return A.simplifiedAutoLink&&(g=I.subParser("simplifiedAutoLinks")(g,A,C)),"<del>"+g+"</del>"}(e)}),g=C.converter._dispatch("strikethrough.after",g,A,C)),g}),I.subParser("stripLinkDefinitions",function(g,A,C){"use strict";var e=function(g,e,r,t,a,n,o){return e=e.toLowerCase(),r.match(/^data:.+?\/.+?;base64,/)?C.gUrls[e]=r.replace(/\s/g,""):C.gUrls[e]=I.subParser("encodeAmpsAndAngles")(r,A,C),n?n+o:(o&&(C.gTitles[e]=o.replace(/"|'/g,"&quot;")),A.parseImgDimensions&&t&&a&&(C.gDimensions[e]={width:t,height:a}),"")};return g=(g+="¨0").replace(/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm,e),g=g.replace(/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,e),g=g.replace(/¨0/,"")}),I.subParser("tables",function(g,A,C){"use strict";function e(g){return/^:[ \t]*--*$/.test(g)?' style="text-align:left;"':/^--*[ \t]*:[ \t]*$/.test(g)?' style="text-align:right;"':/^:[ \t]*--*[ \t]*:$/.test(g)?' style="text-align:center;"':""}function r(g,e){var r="";return g=g.trim(),(A.tablesHeaderId||A.tableHeaderId)&&(r=' id="'+g.replace(/ /g,"_").toLowerCase()+'"'),g=I.subParser("spanGamut")(g,A,C),"<th"+r+e+">"+g+"</th>\n"}function t(g,e){return"<td"+e+">"+I.subParser("spanGamut")(g,A,C)+"</td>\n"}function a(g){var a,n=g.split("\n");for(a=0;a<n.length;++a)/^ {0,3}\|/.test(n[a])&&(n[a]=n[a].replace(/^ {0,3}\|/,"")),/\|[ \t]*$/.test(n[a])&&(n[a]=n[a].replace(/\|[ \t]*$/,"")),n[a]=I.subParser("codeSpans")(n[a],A,C);var o=n[0].split("|").map(function(g){return g.trim()}),s=n[1].split("|").map(function(g){return g.trim()}),i=[],l=[],c=[],u=[];for(n.shift(),n.shift(),a=0;a<n.length;++a)""!==n[a].trim()&&i.push(n[a].split("|").map(function(g){return g.trim()}));if(o.length<s.length)return g;for(a=0;a<s.length;++a)c.push(e(s[a]));for(a=0;a<o.length;++a)I.helper.isUndefined(c[a])&&(c[a]=""),l.push(r(o[a],c[a]));for(a=0;a<i.length;++a){for(var d=[],p=0;p<l.length;++p)I.helper.isUndefined(i[a][p]),d.push(t(i[a][p],c[p]));u.push(d)}return function(g,A){for(var C="<table>\n<thead>\n<tr>\n",I=g.length,e=0;e<I;++e)C+=g[e];for(C+="</tr>\n</thead>\n<tbody>\n",e=0;e<A.length;++e){C+="<tr>\n";for(var r=0;r<I;++r)C+=A[e][r];C+="</tr>\n"}return C+="</tbody>\n</table>\n"}(l,u)}if(!A.tables)return g;return g=C.converter._dispatch("tables.before",g,A,C),g=g.replace(/\\(\|)/g,I.helper.escapeCharactersCallback),g=g.replace(/^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,a),g=g.replace(/^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm,a),g=C.converter._dispatch("tables.after",g,A,C)}),I.subParser("underline",function(g,A,C){"use strict";return A.underline?(g=C.converter._dispatch("underline.before",g,A,C),g=A.literalMidWordUnderscores?g.replace(/\b_?__(\S[\s\S]*)___?\b/g,function(g,A){return"<u>"+A+"</u>"}):g.replace(/_?__(\S[\s\S]*?)___?/g,function(g,A){return/\S$/.test(A)?"<u>"+A+"</u>":g}),g=g.replace(/(_)/g,I.helper.escapeCharactersCallback),g=C.converter._dispatch("underline.after",g,A,C)):g}),I.subParser("unescapeSpecialChars",function(g,A,C){"use strict";return g=C.converter._dispatch("unescapeSpecialChars.before",g,A,C),g=g.replace(/¨E(\d+)E/g,function(g,A){var C=parseInt(A);return String.fromCharCode(C)}),g=C.converter._dispatch("unescapeSpecialChars.after",g,A,C)});"function"==typeof define&&define.amd?define(function(){"use strict";return I}):"undefined"!=typeof module&&module.exports?module.exports=I:this.showdown=I}).call(this);
//# sourceMappingURL=showdown.min.js.map

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.DOMPurify=t()}(this,function(){"use strict";function e(e,t){for(var n=t.length;n--;)"string"==typeof t[n]&&(t[n]=t[n].toLowerCase()),e[t[n]]=!0;return e}function t(e){var t={},n=void 0;for(n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t}function n(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function o(){var x=arguments.length>0&&void 0!==arguments[0]?arguments[0]:A(),S=function(e){return o(e)};if(S.version="1.1.1",S.removed=[],!x||!x.document||9!==x.document.nodeType)return S.isSupported=!1,S;var k=x.document,w=!1,E=!1,O=x.document,L=x.DocumentFragment,M=x.HTMLTemplateElement,N=x.Node,_=x.NodeFilter,D=x.NamedNodeMap,R=void 0===D?x.NamedNodeMap||x.MozNamedAttrMap:D,C=x.Text,F=x.Comment,z=x.DOMParser,H=x.XMLHttpRequest,I=void 0===H?x.XMLHttpRequest:H,j=x.encodeURI,U=void 0===j?x.encodeURI:j;if("function"==typeof M){var W=O.createElement("template");W.content&&W.content.ownerDocument&&(O=W.content.ownerDocument)}var q=O,G=q.implementation,P=q.createNodeIterator,B=q.getElementsByTagName,X=q.createDocumentFragment,V=k.importNode,Y={};S.isSupported=G&&void 0!==G.createHTMLDocument&&9!==O.documentMode;var K=p,$=f,J=h,Q=g,Z=v,ee=b,te=y,ne=null,oe=e({},[].concat(n(r),n(i),n(a),n(l),n(s))),re=null,ie=e({},[].concat(n(c),n(d),n(u),n(m))),ae=null,le=null,se=!0,ce=!0,de=!1,ue=!1,me=!1,pe=!1,fe=!1,he=!1,ge=!1,ye=!1,ve=!1,be=!0,Te=!0,Ae={},xe=e({},["audio","head","math","script","style","template","svg","video"]),Se=e({},["audio","video","img","source","image"]),ke=e({},["alt","class","for","id","label","name","pattern","placeholder","summary","title","value","style","xmlns"]),we=null,Ee=O.createElement("form"),Oe=function(o){"object"!==(void 0===o?"undefined":T(o))&&(o={}),ne="ALLOWED_TAGS"in o?e({},o.ALLOWED_TAGS):oe,re="ALLOWED_ATTR"in o?e({},o.ALLOWED_ATTR):ie,ae="FORBID_TAGS"in o?e({},o.FORBID_TAGS):{},le="FORBID_ATTR"in o?e({},o.FORBID_ATTR):{},Ae="USE_PROFILES"in o&&o.USE_PROFILES,se=!1!==o.ALLOW_ARIA_ATTR,ce=!1!==o.ALLOW_DATA_ATTR,de=o.ALLOW_UNKNOWN_PROTOCOLS||!1,ue=o.SAFE_FOR_JQUERY||!1,me=o.SAFE_FOR_TEMPLATES||!1,pe=o.WHOLE_DOCUMENT||!1,ge=o.RETURN_DOM||!1,ye=o.RETURN_DOM_FRAGMENT||!1,ve=o.RETURN_DOM_IMPORT||!1,he=o.FORCE_BODY||!1,be=!1!==o.SANITIZE_DOM,Te=!1!==o.KEEP_CONTENT,te=o.ALLOWED_URI_REGEXP||te,me&&(ce=!1),ye&&(ge=!0),Ae&&(ne=e({},[].concat(n(s))),re=[],!0===Ae.html&&(e(ne,r),e(re,c)),!0===Ae.svg&&(e(ne,i),e(re,d),e(re,m)),!0===Ae.svgFilters&&(e(ne,a),e(re,d),e(re,m)),!0===Ae.mathMl&&(e(ne,l),e(re,u),e(re,m))),o.ADD_TAGS&&(ne===oe&&(ne=t(ne)),e(ne,o.ADD_TAGS)),o.ADD_ATTR&&(re===ie&&(re=t(re)),e(re,o.ADD_ATTR)),o.ADD_URI_SAFE_ATTR&&e(ke,o.ADD_URI_SAFE_ATTR),Te&&(ne["#text"]=!0),Object&&"freeze"in Object&&Object.freeze(o),we=o},Le=function(e){S.removed.push({element:e});try{e.parentNode.removeChild(e)}catch(t){e.outerHTML=""}},Me=function(e,t){S.removed.push({attribute:t.getAttributeNode(e),from:t}),t.removeAttribute(e)},Ne=function(e){var t=void 0,n=void 0;if(he&&(e="<remove></remove>"+e),E){try{e=U(e)}catch(e){}var o=new I;o.responseType="document",o.open("GET","data:text/html;charset=utf-8,"+e,!1),o.send(null),t=o.response}if(w)try{t=(new z).parseFromString(e,"text/html")}catch(e){}return t&&t.documentElement||((n=(t=G.createHTMLDocument("")).body).parentNode.removeChild(n.parentNode.firstElementChild),n.outerHTML=e),B.call(t,pe?"html":"body")[0]};S.isSupported&&function(){var e=Ne('<svg><g onload="this.parentNode.remove()"></g></svg>');e.querySelector("svg")||(E=!0);try{(e=Ne('<svg><p><style><img src="</style><img src=x onerror=alert(1)//">')).querySelector("svg img")&&(w=!0)}catch(e){}}();var _e=function(e){return P.call(e.ownerDocument||e,e,_.SHOW_ELEMENT|_.SHOW_COMMENT|_.SHOW_TEXT,function(){return _.FILTER_ACCEPT},!1)},De=function(e){return!(e instanceof C||e instanceof F)&&!("string"==typeof e.nodeName&&"string"==typeof e.textContent&&"function"==typeof e.removeChild&&e.attributes instanceof R&&"function"==typeof e.removeAttribute&&"function"==typeof e.setAttribute)},Re=function(e){return"object"===(void 0===N?"undefined":T(N))?e instanceof N:e&&"object"===(void 0===e?"undefined":T(e))&&"number"==typeof e.nodeType&&"string"==typeof e.nodeName},Ce=function(e,t,n){Y[e]&&Y[e].forEach(function(e){e.call(S,t,n,we)})},Fe=function(e){var t=void 0;if(Ce("beforeSanitizeElements",e,null),De(e))return Le(e),!0;var n=e.nodeName.toLowerCase();if(Ce("uponSanitizeElement",e,{tagName:n,allowedTags:ne}),!ne[n]||ae[n]){if(Te&&!xe[n]&&"function"==typeof e.insertAdjacentHTML)try{e.insertAdjacentHTML("AfterEnd",e.innerHTML)}catch(e){}return Le(e),!0}return!ue||e.firstElementChild||e.content&&e.content.firstElementChild||!/</g.test(e.textContent)||(S.removed.push({element:e.cloneNode()}),e.innerHTML=e.textContent.replace(/</g,"&lt;")),me&&3===e.nodeType&&(t=(t=(t=e.textContent).replace(K," ")).replace($," "),e.textContent!==t&&(S.removed.push({element:e.cloneNode()}),e.textContent=t)),Ce("afterSanitizeElements",e,null),!1},ze=function(e){var t=void 0,n=void 0,o=void 0,r=void 0,i=void 0,a=void 0,l=void 0;if(Ce("beforeSanitizeAttributes",e,null),a=e.attributes){var s={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:re};for(l=a.length;l--;){if(t=a[l],n=t.name,o=t.value.trim(),r=n.toLowerCase(),s.attrName=r,s.attrValue=o,s.keepAttr=!0,Ce("uponSanitizeAttribute",e,s),o=s.attrValue,"name"===r&&"IMG"===e.nodeName&&a.id)i=a.id,a=Array.prototype.slice.apply(a),Me("id",e),Me(n,e),a.indexOf(i)>l&&e.setAttribute("id",i.value);else{if("INPUT"===e.nodeName&&"type"===r&&"file"===o&&(re[r]||!le[r]))continue;"id"===n&&e.setAttribute(n,""),Me(n,e)}if(s.keepAttr&&(!be||"id"!==r&&"name"!==r||!(o in O||o in Ee))){if(me&&(o=(o=o.replace(K," ")).replace($," ")),ce&&J.test(r));else if(se&&Q.test(r));else{if(!re[r]||le[r])continue;if(ke[r]);else if(te.test(o.replace(ee,"")));else if("src"!==r&&"xlink:href"!==r||0!==o.indexOf("data:")||!Se[e.nodeName.toLowerCase()]){if(de&&!Z.test(o.replace(ee,"")));else if(o)continue}else;}try{e.setAttribute(n,o),S.removed.pop()}catch(e){}}}Ce("afterSanitizeAttributes",e,null)}},He=function e(t){var n=void 0,o=_e(t);for(Ce("beforeSanitizeShadowDOM",t,null);n=o.nextNode();)Ce("uponSanitizeShadowNode",n,null),Fe(n)||(n.content instanceof L&&e(n.content),ze(n));Ce("afterSanitizeShadowDOM",t,null)};return S.sanitize=function(e,t){var n=void 0,o=void 0,r=void 0,i=void 0,a=void 0;if(e||(e="\x3c!--\x3e"),"string"!=typeof e&&!Re(e)){if("function"!=typeof e.toString)throw new TypeError("toString is not a function");if("string"!=typeof(e=e.toString()))throw new TypeError("dirty is not a string, aborting")}if(!S.isSupported){if("object"===T(x.toStaticHTML)||"function"==typeof x.toStaticHTML){if("string"==typeof e)return x.toStaticHTML(e);if(Re(e))return x.toStaticHTML(e.outerHTML)}return e}if(fe||Oe(t),S.removed=[],e instanceof N)1===(o=(n=Ne("\x3c!--\x3e")).ownerDocument.importNode(e,!0)).nodeType&&"BODY"===o.nodeName?n=o:n.appendChild(o);else{if(!ge&&!pe&&-1===e.indexOf("<"))return e;if(!(n=Ne(e)))return ge?null:""}he&&Le(n.firstChild);for(var l=_e(n);r=l.nextNode();)3===r.nodeType&&r===i||Fe(r)||(r.content instanceof L&&He(r.content),ze(r),i=r);if(ge){if(ye)for(a=X.call(n.ownerDocument);n.firstChild;)a.appendChild(n.firstChild);else a=n;return ve&&(a=V.call(k,a,!0)),a}return pe?n.outerHTML:n.innerHTML},S.setConfig=function(e){Oe(e),fe=!0},S.clearConfig=function(){we=null,fe=!1},S.addHook=function(e,t){"function"==typeof t&&(Y[e]=Y[e]||[],Y[e].push(t))},S.removeHook=function(e){Y[e]&&Y[e].pop()},S.removeHooks=function(e){Y[e]&&(Y[e]=[])},S.removeAllHooks=function(){Y={}},S}var r=["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"],i=["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","audio","canvas","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","video","view","vkern"],a=["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feMerge","feMergeNode","feMorphology","feOffset","feSpecularLighting","feTile","feTurbulence"],l=["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmuliscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mpspace","msqrt","mystyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"],s=["#text"],c=["accept","action","align","alt","autocomplete","background","bgcolor","border","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","coords","crossorigin","datetime","default","dir","disabled","download","enctype","face","for","headers","height","hidden","high","href","hreflang","id","integrity","ismap","label","lang","list","loop","low","max","maxlength","media","method","min","multiple","name","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","type","usemap","valign","value","width","xmlns"],d=["accent-height","accumulate","additivive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","tabindex","targetx","targety","transform","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"],u=["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"],m=["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"],p=/\{\{[\s\S]*|[\s\S]*\}\}/gm,f=/<%[\s\S]*|[\s\S]*%>/gm,h=/^data-[\-\w.\u00B7-\uFFFF]/,g=/^aria-[\-\w]+$/,y=/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,v=/^(?:\w+script|data):/i,b=/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g,T="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},A=function(){return"undefined"==typeof window?null:window};return o()});
//# sourceMappingURL=purify.min.js.map

/* interact.js v1.3.3 | https://raw.github.com/taye/interact.js/master/LICENSE */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.interact=t()}}(function(){return function t(e,n,r){function i(s,a){if(!n[s]){if(!e[s]){var c="function"==typeof require&&require;if(!a&&c)return c(s,!0);if(o)return o(s,!0);var l=new Error("Cannot find module '"+s+"'");throw l.code="MODULE_NOT_FOUND",l}var p=n[s]={exports:{}};e[s][0].call(p.exports,function(t){var n=e[s][1][t];return i(n||t)},p,p.exports,t,e,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)i(r[s]);return i}({1:[function(t,e,n){"use strict";"undefined"==typeof window?e.exports=function(e){return t("./src/utils/window").init(e),t("./src/index")}:e.exports=t("./src/index")},{"./src/index":19,"./src/utils/window":52}],2:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var n=0;n<e.length;n++){var r;r=e[n];var i=r;if(t.immediatePropagationStopped)break;i(t)}}var o=t("./utils/extend.js"),s=function(){function t(e){r(this,t),this.options=o({},e||{})}return t.prototype.fire=function(t){var e=void 0,n="on"+t.type,r=this.global;(e=this[t.type])&&i(t,e),this[n]&&this[n](t),!t.propagationStopped&&r&&(e=r[t.type])&&i(t,e)},t.prototype.on=function(t,e){this[t]?this[t].push(e):this[t]=[e]},t.prototype.off=function(t,e){var n=this[t],r=n?n.indexOf(e):-1;-1!==r&&n.splice(r,1),(n&&0===n.length||!e)&&(this[t]=void 0)},t}();e.exports=s},{"./utils/extend.js":41}],3:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=t("./utils/extend"),o=t("./utils/getOriginXY"),s=t("./defaultOptions"),a=t("./utils/Signals").new(),c=function(){function t(e,n,c,l,p,u){var d=arguments.length>6&&void 0!==arguments[6]&&arguments[6];r(this,t);var f=e.target,v=(f&&f.options||s).deltaSource,g=o(f,p,c),h="start"===l,m="end"===l,y=h?e.startCoords:e.curCoords,x=e.prevEvent;p=p||e.element;var b=i({},y.page),w=i({},y.client);b.x-=g.x,b.y-=g.y,w.x-=g.x,w.y-=g.y,this.ctrlKey=n.ctrlKey,this.altKey=n.altKey,this.shiftKey=n.shiftKey,this.metaKey=n.metaKey,this.button=n.button,this.buttons=n.buttons,this.target=p,this.currentTarget=p,this.relatedTarget=u||null,this.preEnd=d,this.type=c+(l||""),this.interaction=e,this.interactable=f,this.t0=h?e.downTimes[e.downTimes.length-1]:x.t0;var E={interaction:e,event:n,action:c,phase:l,element:p,related:u,page:b,client:w,coords:y,starting:h,ending:m,deltaSource:v,iEvent:this};a.fire("set-xy",E),m?(this.pageX=x.pageX,this.pageY=x.pageY,this.clientX=x.clientX,this.clientY=x.clientY):(this.pageX=b.x,this.pageY=b.y,this.clientX=w.x,this.clientY=w.y),this.x0=e.startCoords.page.x-g.x,this.y0=e.startCoords.page.y-g.y,this.clientX0=e.startCoords.client.x-g.x,this.clientY0=e.startCoords.client.y-g.y,a.fire("set-delta",E),this.timeStamp=y.timeStamp,this.dt=e.pointerDelta.timeStamp,this.duration=this.timeStamp-this.t0,this.speed=e.pointerDelta[v].speed,this.velocityX=e.pointerDelta[v].vx,this.velocityY=e.pointerDelta[v].vy,this.swipe=m||"inertiastart"===l?this.getSwipe():null,a.fire("new",E)}return t.prototype.getSwipe=function(){var t=this.interaction;if(t.prevEvent.speed<600||this.timeStamp-t.prevEvent.timeStamp>150)return null;var e=180*Math.atan2(t.prevEvent.velocityY,t.prevEvent.velocityX)/Math.PI;e<0&&(e+=360);var n=112.5<=e&&e<247.5,r=202.5<=e&&e<337.5,i=!n&&(292.5<=e||e<67.5);return{up:r,down:!r&&22.5<=e&&e<157.5,left:n,right:i,angle:e,speed:t.prevEvent.speed,velocity:{x:t.prevEvent.velocityX,y:t.prevEvent.velocityY}}},t.prototype.preventDefault=function(){},t.prototype.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},t.prototype.stopPropagation=function(){this.propagationStopped=!0},t}();a.on("set-delta",function(t){var e=t.iEvent,n=t.interaction,r=t.starting,i=t.deltaSource,o=r?e:n.prevEvent;"client"===i?(e.dx=e.clientX-o.clientX,e.dy=e.clientY-o.clientY):(e.dx=e.pageX-o.pageX,e.dy=e.pageY-o.pageY)}),c.signals=a,e.exports=c},{"./defaultOptions":18,"./utils/Signals":34,"./utils/extend":41,"./utils/getOriginXY":42}],4:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=t("./utils/clone"),o=t("./utils/is"),s=t("./utils/events"),a=t("./utils/extend"),c=t("./actions/base"),l=t("./scope"),p=t("./Eventable"),u=t("./defaultOptions"),d=t("./utils/Signals").new(),f=t("./utils/domUtils"),v=f.getElementRect,g=f.nodeContains,h=f.trySelector,m=f.matchesSelector,y=t("./utils/window"),x=y.getWindow,b=t("./utils/arr"),w=b.contains,E=t("./utils/browser"),T=E.wheelEvent;l.interactables=[];var S=function(){function t(e,n){r(this,t),n=n||{},this.target=e,this.events=new p,this._context=n.context||l.document,this._win=x(h(e)?this._context:e),this._doc=this._win.document,d.fire("new",{target:e,options:n,interactable:this,win:this._win}),l.addDocument(this._doc,this._win),l.interactables.push(this),this.set(n)}return t.prototype.setOnEvents=function(t,e){var n="on"+t;return o.function(e.onstart)&&(this.events[n+"start"]=e.onstart),o.function(e.onmove)&&(this.events[n+"move"]=e.onmove),o.function(e.onend)&&(this.events[n+"end"]=e.onend),o.function(e.oninertiastart)&&(this.events[n+"inertiastart"]=e.oninertiastart),this},t.prototype.setPerAction=function(t,e){for(var n in e)n in u[t]&&(o.object(e[n])?(this.options[t][n]=i(this.options[t][n]||{}),a(this.options[t][n],e[n]),o.object(u.perAction[n])&&"enabled"in u.perAction[n]&&(this.options[t][n].enabled=!1!==e[n].enabled)):o.bool(e[n])&&o.object(u.perAction[n])?this.options[t][n].enabled=e[n]:void 0!==e[n]&&(this.options[t][n]=e[n]))},t.prototype.getRect=function(t){return t=t||this.target,o.string(this.target)&&!o.element(t)&&(t=this._context.querySelector(this.target)),v(t)},t.prototype.rectChecker=function(t){return o.function(t)?(this.getRect=t,this):null===t?(delete this.options.getRect,this):this.getRect},t.prototype._backCompatOption=function(t,e){if(h(e)||o.object(e)){this.options[t]=e;for(var n=0;n<c.names.length;n++){var r;r=c.names[n];var i=r;this.options[i][t]=e}return this}return this.options[t]},t.prototype.origin=function(t){return this._backCompatOption("origin",t)},t.prototype.deltaSource=function(t){return"page"===t||"client"===t?(this.options.deltaSource=t,this):this.options.deltaSource},t.prototype.context=function(){return this._context},t.prototype.inContext=function(t){return this._context===t.ownerDocument||g(this._context,t)},t.prototype.fire=function(t){return this.events.fire(t),this},t.prototype._onOffMultiple=function(t,e,n,r){if(o.string(e)&&-1!==e.search(" ")&&(e=e.trim().split(/ +/)),o.array(e)){for(var i=0;i<e.length;i++){var s;s=e[i];var a=s;this[t](a,n,r)}return!0}if(o.object(e)){for(var c in e)this[t](c,e[c],n);return!0}},t.prototype.on=function(e,n,r){return this._onOffMultiple("on",e,n,r)?this:("wheel"===e&&(e=T),w(t.eventTypes,e)?this.events.on(e,n):o.string(this.target)?s.addDelegate(this.target,this._context,e,n,r):s.add(this.target,e,n,r),this)},t.prototype.off=function(e,n,r){return this._onOffMultiple("off",e,n,r)?this:("wheel"===e&&(e=T),w(t.eventTypes,e)?this.events.off(e,n):o.string(this.target)?s.removeDelegate(this.target,this._context,e,n,r):s.remove(this.target,e,n,r),this)},t.prototype.set=function(e){o.object(e)||(e={}),this.options=i(u.base);var n=i(u.perAction);for(var r in c.methodDict){var s=c.methodDict[r];this.options[r]=i(u[r]),this.setPerAction(r,n),this[s](e[r])}for(var a=0;a<t.settingsMethods.length;a++){var l;l=t.settingsMethods[a];var p=l;this.options[p]=u.base[p],p in e&&this[p](e[p])}return d.fire("set",{options:e,interactable:this}),this},t.prototype.unset=function(){if(s.remove(this.target,"all"),o.string(this.target))for(var t in s.delegatedEvents){var e=s.delegatedEvents[t];e.selectors[0]===this.target&&e.contexts[0]===this._context&&(e.selectors.splice(0,1),e.contexts.splice(0,1),e.listeners.splice(0,1),e.selectors.length||(e[t]=null)),s.remove(this._context,t,s.delegateListener),s.remove(this._context,t,s.delegateUseCapture,!0)}else s.remove(this,"all");d.fire("unset",{interactable:this}),l.interactables.splice(l.interactables.indexOf(this),1);for(var n=0;n<(l.interactions||[]).length;n++){var r;r=(l.interactions||[])[n];var i=r;i.target===this&&i.interacting()&&!i._ending&&i.stop()}return l.interact},t}();l.interactables.indexOfElement=function(t,e){e=e||l.document;for(var n=0;n<this.length;n++){var r=this[n];if(r.target===t&&r._context===e)return n}return-1},l.interactables.get=function(t,e,n){var r=this[this.indexOfElement(t,e&&e.context)];return r&&(o.string(t)||n||r.inContext(t))?r:null},l.interactables.forEachMatch=function(t,e){for(var n=0;n<this.length;n++){var r;r=this[n];var i=r,s=void 0;if((o.string(i.target)?o.element(t)&&m(t,i.target):t===i.target)&&i.inContext(t)&&(s=e(i)),void 0!==s)return s}},S.eventTypes=l.eventTypes=[],S.signals=d,S.settingsMethods=["deltaSource","origin","preventDefault","rectChecker"],e.exports=S},{"./Eventable":2,"./actions/base":6,"./defaultOptions":18,"./scope":33,"./utils/Signals":34,"./utils/arr":35,"./utils/browser":36,"./utils/clone":37,"./utils/domUtils":39,"./utils/events":40,"./utils/extend":41,"./utils/is":46,"./utils/window":52}],5:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t){return function(e){var n=c.getPointerType(e),r=c.getEventTargets(e),i=r[0],o=r[1],s=[];if(p.supportsTouch&&/touch/.test(e.type)){h=(new Date).getTime();for(var l=0;l<e.changedTouches.length;l++){var u;u=e.changedTouches[l];var f=u,v=f,g=d.search(v,e.type,i);s.push([v,g||new m({pointerType:n})])}}else{var y=!1;if(!p.supportsPointerEvent&&/mouse/.test(e.type)){for(var x=0;x<a.interactions.length&&!y;x++)y="mouse"!==a.interactions[x].pointerType&&a.interactions[x].pointerIsDown;y=y||(new Date).getTime()-h<500||0===e.timeStamp}if(!y){var b=d.search(e,e.type,i);b||(b=new m({pointerType:n})),s.push([e,b])}}for(var w=0;w<s.length;w++){var E=s[w],T=E[0],S=E[1];S._updateEventTargets(i,o),S[t](T,e,i,o)}}}function o(t){for(var e=0;e<a.interactions.length;e++){var n;n=a.interactions[e];var r=n;r.end(t),f.fire("endall",{event:t,interaction:r})}}function s(t,e){var n=t.doc,r=0===e.indexOf("add")?l.add:l.remove;for(var i in a.delegatedEvents)r(n,i,l.delegateListener),r(n,i,l.delegateUseCapture,!0);for(var o in b)r(n,o,b[o])}var a=t("./scope"),c=t("./utils"),l=t("./utils/events"),p=t("./utils/browser"),u=t("./utils/domObjects"),d=t("./utils/interactionFinder"),f=t("./utils/Signals").new(),v={},g=["pointerDown","pointerMove","pointerUp","updatePointer","removePointer"],h=0;a.interactions=[];for(var m=function(){function t(e){var n=e.pointerType;r(this,t),this.target=null,this.element=null,this.prepared={name:null,axis:null,edges:null},this.pointers=[],this.pointerIds=[],this.downTargets=[],this.downTimes=[],this.prevCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0},this.curCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0},this.startCoords={page:{x:0,y:0},client:{x:0,y:0},timeStamp:0},this.pointerDelta={page:{x:0,y:0,vx:0,vy:0,speed:0},client:{x:0,y:0,vx:0,vy:0,speed:0},timeStamp:0},this.downEvent=null,this.downPointer={},this._eventTarget=null,this._curEventTarget=null,this.prevEvent=null,this.pointerIsDown=!1,this.pointerWasMoved=!1,this._interacting=!1,this._ending=!1,this.pointerType=n,f.fire("new",this),a.interactions.push(this)}return t.prototype.pointerDown=function(t,e,n){var r=this.updatePointer(t,e,!0);f.fire("down",{pointer:t,event:e,eventTarget:n,pointerIndex:r,interaction:this})},t.prototype.start=function(t,e,n){this.interacting()||!this.pointerIsDown||this.pointerIds.length<("gesture"===t.name?2:1)||(-1===a.interactions.indexOf(this)&&a.interactions.push(this),c.copyAction(this.prepared,t),this.target=e,this.element=n,f.fire("action-start",{interaction:this,event:this.downEvent}))},t.prototype.pointerMove=function(e,n,r){this.simulation||(this.updatePointer(e),c.setCoords(this.curCoords,this.pointers));var i=this.curCoords.page.x===this.prevCoords.page.x&&this.curCoords.page.y===this.prevCoords.page.y&&this.curCoords.client.x===this.prevCoords.client.x&&this.curCoords.client.y===this.prevCoords.client.y,o=void 0,s=void 0;this.pointerIsDown&&!this.pointerWasMoved&&(o=this.curCoords.client.x-this.startCoords.client.x,s=this.curCoords.client.y-this.startCoords.client.y,this.pointerWasMoved=c.hypot(o,s)>t.pointerMoveTolerance);var a={pointer:e,pointerIndex:this.getPointerIndex(e),event:n,eventTarget:r,dx:o,dy:s,duplicate:i,interaction:this,interactingBeforeMove:this.interacting()};i||c.setCoordDeltas(this.pointerDelta,this.prevCoords,this.curCoords),f.fire("move",a),i||(this.interacting()&&this.doMove(a),this.pointerWasMoved&&c.copyCoords(this.prevCoords,this.curCoords))},t.prototype.doMove=function(t){t=c.extend({pointer:this.pointers[0],event:this.prevEvent,eventTarget:this._eventTarget,interaction:this},t||{}),f.fire("before-action-move",t),this._dontFireMove||f.fire("action-move",t),this._dontFireMove=!1},t.prototype.pointerUp=function(t,e,n,r){var i=this.getPointerIndex(t);f.fire(/cancel$/i.test(e.type)?"cancel":"up",{pointer:t,pointerIndex:i,event:e,eventTarget:n,curEventTarget:r,interaction:this}),this.simulation||this.end(e),this.pointerIsDown=!1,this.removePointer(t,e)},t.prototype.end=function(t){this._ending=!0,t=t||this.prevEvent,this.interacting()&&f.fire("action-end",{event:t,interaction:this}),this.stop(),this._ending=!1},t.prototype.currentAction=function(){return this._interacting?this.prepared.name:null},t.prototype.interacting=function(){return this._interacting},t.prototype.stop=function(){f.fire("stop",{interaction:this}),this._interacting&&(f.fire("stop-active",{interaction:this}),f.fire("stop-"+this.prepared.name,{interaction:this})),this.target=this.element=null,this._interacting=!1,this.prepared.name=this.prevEvent=null},t.prototype.getPointerIndex=function(t){return"mouse"===this.pointerType||"pen"===this.pointerType?0:this.pointerIds.indexOf(c.getPointerId(t))},t.prototype.updatePointer=function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e&&/(down|start)$/i.test(e.type),r=c.getPointerId(t),i=this.getPointerIndex(t);return-1===i&&(i=this.pointerIds.length,this.pointerIds[i]=r),n&&f.fire("update-pointer-down",{pointer:t,event:e,down:n,pointerId:r,pointerIndex:i,interaction:this}),this.pointers[i]=t,i},t.prototype.removePointer=function(t,e){var n=this.getPointerIndex(t);-1!==n&&(f.fire("remove-pointer",{pointer:t,event:e,pointerIndex:n,interaction:this}),this.pointers.splice(n,1),this.pointerIds.splice(n,1),this.downTargets.splice(n,1),this.downTimes.splice(n,1))},t.prototype._updateEventTargets=function(t,e){this._eventTarget=t,this._curEventTarget=e},t}(),y=0;y<g.length;y++){var x=g[y];v[x]=i(x)}var b={},w=p.pEventTypes;u.PointerEvent?(b[w.down]=v.pointerDown,b[w.move]=v.pointerMove,b[w.up]=v.pointerUp,b[w.cancel]=v.pointerUp):(b.mousedown=v.pointerDown,b.mousemove=v.pointerMove,b.mouseup=v.pointerUp,b.touchstart=v.pointerDown,b.touchmove=v.pointerMove,b.touchend=v.pointerUp,b.touchcancel=v.pointerUp),b.blur=o,f.on("update-pointer-down",function(t){var e=t.interaction,n=t.pointer,r=t.pointerId,i=t.pointerIndex,o=t.event,s=t.eventTarget,a=t.down;e.pointerIds[i]=r,e.pointers[i]=n,a&&(e.pointerIsDown=!0),e.interacting()||(c.setCoords(e.startCoords,e.pointers),c.copyCoords(e.curCoords,e.startCoords),c.copyCoords(e.prevCoords,e.startCoords),e.downEvent=o,e.downTimes[i]=e.curCoords.timeStamp,e.downTargets[i]=s||o&&c.getEventTargets(o)[0],e.pointerWasMoved=!1,c.pointerExtend(e.downPointer,n))}),a.signals.on("add-document",s),a.signals.on("remove-document",s),m.pointerMoveTolerance=1,m.doOnInteractions=i,m.endAll=o,m.signals=f,m.docEvents=b,a.endAllInteractions=o,e.exports=m},{"./scope":33,"./utils":44,"./utils/Signals":34,"./utils/browser":36,"./utils/domObjects":38,"./utils/events":40,"./utils/interactionFinder":45}],6:[function(t,e,n){"use strict";function r(t,e,n,r){var i=t.prepared.name,s=new o(t,e,i,n,t.element,null,r);t.target.fire(s),t.prevEvent=s}var i=t("../Interaction"),o=t("../InteractEvent"),s={firePrepared:r,names:[],methodDict:{}};i.signals.on("action-start",function(t){var e=t.interaction,n=t.event;e._interacting=!0,r(e,n,"start")}),i.signals.on("action-move",function(t){var e=t.interaction;if(r(e,t.event,"move",t.preEnd),!e.interacting())return!1}),i.signals.on("action-end",function(t){r(t.interaction,t.event,"end")}),e.exports=s},{"../InteractEvent":3,"../Interaction":5}],7:[function(t,e,n){"use strict";var r=t("./base"),i=t("../utils"),o=t("../InteractEvent"),s=t("../Interactable"),a=t("../Interaction"),c=t("../defaultOptions"),l={defaults:{enabled:!1,mouseButtons:null,origin:null,snap:null,restrict:null,inertia:null,autoScroll:null,startAxis:"xy",lockAxis:"xy"},checker:function(t,e,n){var r=n.options.drag;return r.enabled?{name:"drag",axis:"start"===r.lockAxis?r.startAxis:r.lockAxis}:null},getCursor:function(){return"move"}};a.signals.on("before-action-move",function(t){var e=t.interaction;if("drag"===e.prepared.name){var n=e.prepared.axis;"x"===n?(e.curCoords.page.y=e.startCoords.page.y,e.curCoords.client.y=e.startCoords.client.y,e.pointerDelta.page.speed=Math.abs(e.pointerDelta.page.vx),e.pointerDelta.client.speed=Math.abs(e.pointerDelta.client.vx),e.pointerDelta.client.vy=0,e.pointerDelta.page.vy=0):"y"===n&&(e.curCoords.page.x=e.startCoords.page.x,e.curCoords.client.x=e.startCoords.client.x,e.pointerDelta.page.speed=Math.abs(e.pointerDelta.page.vy),e.pointerDelta.client.speed=Math.abs(e.pointerDelta.client.vy),e.pointerDelta.client.vx=0,e.pointerDelta.page.vx=0)}}),o.signals.on("new",function(t){var e=t.iEvent,n=t.interaction;if("dragmove"===e.type){var r=n.prepared.axis;"x"===r?(e.pageY=n.startCoords.page.y,e.clientY=n.startCoords.client.y,e.dy=0):"y"===r&&(e.pageX=n.startCoords.page.x,e.clientX=n.startCoords.client.x,e.dx=0)}}),s.prototype.draggable=function(t){return i.is.object(t)?(this.options.drag.enabled=!1!==t.enabled,this.setPerAction("drag",t),this.setOnEvents("drag",t),/^(xy|x|y|start)$/.test(t.lockAxis)&&(this.options.drag.lockAxis=t.lockAxis),/^(xy|x|y)$/.test(t.startAxis)&&(this.options.drag.startAxis=t.startAxis),this):i.is.bool(t)?(this.options.drag.enabled=t,t||(this.ondragstart=this.ondragstart=this.ondragend=null),this):this.options.drag},r.drag=l,r.names.push("drag"),i.merge(s.eventTypes,["dragstart","dragmove","draginertiastart","draginertiaresume","dragend"]),r.methodDict.drag="draggable",c.drag=l.defaults,e.exports=l},{"../InteractEvent":3,"../Interactable":4,"../Interaction":5,"../defaultOptions":18,"../utils":44,"./base":6}],8:[function(t,e,n){"use strict";function r(t,e){for(var n=[],r=[],i=0;i<u.interactables.length;i++){var o;o=u.interactables[i];var s=o;if(s.options.drop.enabled){var a=s.options.drop.accept;if(!(p.is.element(a)&&a!==e||p.is.string(a)&&!p.matchesSelector(e,a)))for(var c=p.is.string(s.target)?s._context.querySelectorAll(s.target):[s.target],l=0;l<c.length;l++){var d;d=c[l];var f=d;f!==e&&(n.push(s),r.push(f))}}}return{elements:r,dropzones:n}}function i(t,e){for(var n=void 0,r=0;r<t.dropzones.length;r++){var i=t.dropzones[r],o=t.elements[r];o!==n&&(e.target=o,i.fire(e)),n=o}}function o(t,e){var n=r(t,e);t.dropzones=n.dropzones,t.elements=n.elements,t.rects=[];for(var i=0;i<t.dropzones.length;i++)t.rects[i]=t.dropzones[i].getRect(t.elements[i])}function s(t,e,n){var r=t.interaction,i=[];y&&o(r.activeDrops,n);for(var s=0;s<r.activeDrops.dropzones.length;s++){var a=r.activeDrops.dropzones[s],c=r.activeDrops.elements[s],l=r.activeDrops.rects[s];i.push(a.dropCheck(t,e,r.target,n,c,l)?c:null)}var u=p.indexOfDeepestElement(i);return{dropzone:r.activeDrops.dropzones[u]||null,element:r.activeDrops.elements[u]||null}}function a(t,e,n){var r={enter:null,leave:null,activate:null,deactivate:null,move:null,drop:null},i={dragEvent:n,interaction:t,target:t.dropElement,dropzone:t.dropTarget,relatedTarget:n.target,draggable:n.interactable,timeStamp:n.timeStamp};return t.dropElement!==t.prevDropElement&&(t.prevDropTarget&&(r.leave=p.extend({type:"dragleave"},i),n.dragLeave=r.leave.target=t.prevDropElement,n.prevDropzone=r.leave.dropzone=t.prevDropTarget),t.dropTarget&&(r.enter={dragEvent:n,interaction:t,target:t.dropElement,dropzone:t.dropTarget,relatedTarget:n.target,draggable:n.interactable,timeStamp:n.timeStamp,type:"dragenter"},n.dragEnter=t.dropElement,n.dropzone=t.dropTarget)),"dragend"===n.type&&t.dropTarget&&(r.drop=p.extend({type:"drop"},i),n.dropzone=t.dropTarget,n.relatedTarget=t.dropElement),"dragstart"===n.type&&(r.activate=p.extend({type:"dropactivate"},i),r.activate.target=null,r.activate.dropzone=null),"dragend"===n.type&&(r.deactivate=p.extend({type:"dropdeactivate"},i),r.deactivate.target=null,r.deactivate.dropzone=null),"dragmove"===n.type&&t.dropTarget&&(r.move=p.extend({dragmove:n,type:"dropmove"},i),n.dropzone=t.dropTarget),r}function c(t,e){var n=t.activeDrops,r=t.prevDropTarget,o=t.dropTarget,s=t.dropElement;e.leave&&r.fire(e.leave),e.move&&o.fire(e.move),e.enter&&o.fire(e.enter),e.drop&&o.fire(e.drop),e.deactivate&&i(n,e.deactivate),t.prevDropTarget=o,t.prevDropElement=s}var l=t("./base"),p=t("../utils"),u=t("../scope"),d=t("../interact"),f=t("../InteractEvent"),v=t("../Interactable"),g=t("../Interaction"),h=t("../defaultOptions"),m={defaults:{enabled:!1,accept:null,overlap:"pointer"}},y=!1;g.signals.on("action-start",function(t){var e=t.interaction,n=t.event;if("drag"===e.prepared.name){e.activeDrops.dropzones=[],e.activeDrops.elements=[],e.activeDrops.rects=[],e.dropEvents=null,e.dynamicDrop||o(e.activeDrops,e.element);var r=e.prevEvent,s=a(e,n,r);s.activate&&i(e.activeDrops,s.activate)}}),f.signals.on("new",function(t){var e=t.interaction,n=t.iEvent,r=t.event;if("dragmove"===n.type||"dragend"===n.type){var i=e.element,o=n,c=s(o,r,i);e.dropTarget=c.dropzone,e.dropElement=c.element,e.dropEvents=a(e,r,o)}}),g.signals.on("action-move",function(t){var e=t.interaction;"drag"===e.prepared.name&&c(e,e.dropEvents)}),g.signals.on("action-end",function(t){var e=t.interaction;"drag"===e.prepared.name&&c(e,e.dropEvents)}),g.signals.on("stop-drag",function(t){var e=t.interaction;e.activeDrops={dropzones:null,elements:null,rects:null},e.dropEvents=null}),v.prototype.dropzone=function(t){return p.is.object(t)?(this.options.drop.enabled=!1!==t.enabled,p.is.function(t.ondrop)&&(this.events.ondrop=t.ondrop),p.is.function(t.ondropactivate)&&(this.events.ondropactivate=t.ondropactivate),p.is.function(t.ondropdeactivate)&&(this.events.ondropdeactivate=t.ondropdeactivate),p.is.function(t.ondragenter)&&(this.events.ondragenter=t.ondragenter),p.is.function(t.ondragleave)&&(this.events.ondragleave=t.ondragleave),p.is.function(t.ondropmove)&&(this.events.ondropmove=t.ondropmove),/^(pointer|center)$/.test(t.overlap)?this.options.drop.overlap=t.overlap:p.is.number(t.overlap)&&(this.options.drop.overlap=Math.max(Math.min(1,t.overlap),0)),"accept"in t&&(this.options.drop.accept=t.accept),"checker"in t&&(this.options.drop.checker=t.checker),this):p.is.bool(t)?(this.options.drop.enabled=t,t||(this.ondragenter=this.ondragleave=this.ondrop=this.ondropactivate=this.ondropdeactivate=null),this):this.options.drop},v.prototype.dropCheck=function(t,e,n,r,i,o){var s=!1;if(!(o=o||this.getRect(i)))return!!this.options.drop.checker&&this.options.drop.checker(t,e,s,this,i,n,r);var a=this.options.drop.overlap;if("pointer"===a){var c=p.getOriginXY(n,r,"drag"),l=p.getPageXY(t);l.x+=c.x,l.y+=c.y;var u=l.x>o.left&&l.x<o.right,d=l.y>o.top&&l.y<o.bottom;s=u&&d}var f=n.getRect(r);if(f&&"center"===a){var v=f.left+f.width/2,g=f.top+f.height/2;s=v>=o.left&&v<=o.right&&g>=o.top&&g<=o.bottom}if(f&&p.is.number(a)){s=Math.max(0,Math.min(o.right,f.right)-Math.max(o.left,f.left))*Math.max(0,Math.min(o.bottom,f.bottom)-Math.max(o.top,f.top))/(f.width*f.height)>=a}return this.options.drop.checker&&(s=this.options.drop.checker(t,e,s,this,i,n,r)),s},v.signals.on("unset",function(t){t.interactable.dropzone(!1)}),v.settingsMethods.push("dropChecker"),g.signals.on("new",function(t){t.dropTarget=null,t.dropElement=null,t.prevDropTarget=null,t.prevDropElement=null,t.dropEvents=null,t.activeDrops={dropzones:[],elements:[],rects:[]}}),g.signals.on("stop",function(t){var e=t.interaction;e.dropTarget=e.dropElement=e.prevDropTarget=e.prevDropElement=null}),d.dynamicDrop=function(t){return p.is.bool(t)?(y=t,d):y},p.merge(v.eventTypes,["dragenter","dragleave","dropactivate","dropdeactivate","dropmove","drop"]),l.methodDict.drop="dropzone",h.drop=m.defaults,e.exports=m},{"../InteractEvent":3,"../Interactable":4,"../Interaction":5,"../defaultOptions":18,"../interact":21,"../scope":33,"../utils":44,"./base":6}],9:[function(t,e,n){"use strict";var r=t("./base"),i=t("../utils"),o=t("../InteractEvent"),s=t("../Interactable"),a=t("../Interaction"),c=t("../defaultOptions"),l={defaults:{enabled:!1,origin:null,restrict:null},checker:function(t,e,n,r,i){return i.pointerIds.length>=2?{name:"gesture"}:null},getCursor:function(){return""}};o.signals.on("new",function(t){var e=t.iEvent,n=t.interaction;"gesturestart"===e.type&&(e.ds=0,n.gesture.startDistance=n.gesture.prevDistance=e.distance,n.gesture.startAngle=n.gesture.prevAngle=e.angle,n.gesture.scale=1)}),o.signals.on("new",function(t){var e=t.iEvent,n=t.interaction;"gesturemove"===e.type&&(e.ds=e.scale-n.gesture.scale,n.target.fire(e),n.gesture.prevAngle=e.angle,n.gesture.prevDistance=e.distance,e.scale===1/0||null===e.scale||void 0===e.scale||isNaN(e.scale)||(n.gesture.scale=e.scale))}),s.prototype.gesturable=function(t){return i.is.object(t)?(this.options.gesture.enabled=!1!==t.enabled,this.setPerAction("gesture",t),this.setOnEvents("gesture",t),this):i.is.bool(t)?(this.options.gesture.enabled=t,t||(this.ongesturestart=this.ongesturestart=this.ongestureend=null),this):this.options.gesture},o.signals.on("set-delta",function(t){var e=t.interaction,n=t.iEvent,r=t.action,s=t.event,a=t.starting,c=t.ending,l=t.deltaSource;if("gesture"===r){var p=e.pointers;n.touches=[p[0],p[1]],a?(n.distance=i.touchDistance(p,l),n.box=i.touchBBox(p),n.scale=1,n.ds=0,n.angle=i.touchAngle(p,void 0,l),n.da=0):c||s instanceof o?(n.distance=e.prevEvent.distance,n.box=e.prevEvent.box,n.scale=e.prevEvent.scale,n.ds=n.scale-1,n.angle=e.prevEvent.angle,n.da=n.angle-e.gesture.startAngle):(n.distance=i.touchDistance(p,l),n.box=i.touchBBox(p),n.scale=n.distance/e.gesture.startDistance,n.angle=i.touchAngle(p,e.gesture.prevAngle,l),n.ds=n.scale-e.gesture.prevScale,n.da=n.angle-e.gesture.prevAngle)}}),a.signals.on("new",function(t){t.gesture={start:{x:0,y:0},startDistance:0,prevDistance:0,distance:0,scale:1,startAngle:0,prevAngle:0}}),r.gesture=l,r.names.push("gesture"),i.merge(s.eventTypes,["gesturestart","gesturemove","gestureend"]),r.methodDict.gesture="gesturable",c.gesture=l.defaults,e.exports=l},{"../InteractEvent":3,"../Interactable":4,"../Interaction":5,"../defaultOptions":18,"../utils":44,"./base":6}],10:[function(t,e,n){"use strict";function r(t,e,n,r,i,s,a){if(!e)return!1;if(!0===e){var c=o.is.number(s.width)?s.width:s.right-s.left,l=o.is.number(s.height)?s.height:s.bottom-s.top;if(c<0&&("left"===t?t="right":"right"===t&&(t="left")),l<0&&("top"===t?t="bottom":"bottom"===t&&(t="top")),"left"===t)return n.x<(c>=0?s.left:s.right)+a;if("top"===t)return n.y<(l>=0?s.top:s.bottom)+a;if("right"===t)return n.x>(c>=0?s.right:s.left)-a;if("bottom"===t)return n.y>(l>=0?s.bottom:s.top)-a}return!!o.is.element(r)&&(o.is.element(e)?e===r:o.matchesUpTo(r,e,i))}var i=t("./base"),o=t("../utils"),s=t("../utils/browser"),a=t("../InteractEvent"),c=t("../Interactable"),l=t("../Interaction"),p=t("../defaultOptions"),u=s.supportsTouch||s.supportsPointerEvent?20:10,d={defaults:{enabled:!1,mouseButtons:null,origin:null,snap:null,restrict:null,inertia:null,autoScroll:null,square:!1,preserveAspectRatio:!1,axis:"xy",margin:NaN,edges:null,invert:"none"},checker:function(t,e,n,i,s,a){if(!a)return null;var c=o.extend({},s.curCoords.page),l=n.options;if(l.resize.enabled){var p=l.resize,d={left:!1,right:!1,top:!1,bottom:!1};if(o.is.object(p.edges)){for(var f in d)d[f]=r(f,p.edges[f],c,s._eventTarget,i,a,p.margin||u);if(d.left=d.left&&!d.right,d.top=d.top&&!d.bottom,d.left||d.right||d.top||d.bottom)return{name:"resize",edges:d}}else{var v="y"!==l.resize.axis&&c.x>a.right-u,g="x"!==l.resize.axis&&c.y>a.bottom-u;if(v||g)return{name:"resize",axes:(v?"x":"")+(g?"y":"")}}}return null},cursors:s.isIe9?{x:"e-resize",y:"s-resize",xy:"se-resize",top:"n-resize",left:"w-resize",bottom:"s-resize",right:"e-resize",topleft:"se-resize",bottomright:"se-resize",topright:"ne-resize",bottomleft:"ne-resize"}:{x:"ew-resize",y:"ns-resize",xy:"nwse-resize",top:"ns-resize",left:"ew-resize",bottom:"ns-resize",right:"ew-resize",topleft:"nwse-resize",bottomright:"nwse-resize",topright:"nesw-resize",bottomleft:"nesw-resize"},getCursor:function(t){if(t.axis)return d.cursors[t.name+t.axis];if(t.edges){for(var e="",n=["top","bottom","left","right"],r=0;r<4;r++)t.edges[n[r]]&&(e+=n[r]);return d.cursors[e]}}};a.signals.on("new",function(t){var e=t.iEvent,n=t.interaction;if("resizestart"===e.type&&n.prepared.edges){var r=n.target.getRect(n.element),i=n.target.options.resize;if(i.square||i.preserveAspectRatio){var s=o.extend({},n.prepared.edges);s.top=s.top||s.left&&!s.bottom,s.left=s.left||s.top&&!s.right,s.bottom=s.bottom||s.right&&!s.top,s.right=s.right||s.bottom&&!s.left,n.prepared._linkedEdges=s}else n.prepared._linkedEdges=null;i.preserveAspectRatio&&(n.resizeStartAspectRatio=r.width/r.height),n.resizeRects={start:r,current:o.extend({},r),inverted:o.extend({},r),previous:o.extend({},r),delta:{left:0,right:0,width:0,top:0,bottom:0,height:0}},e.rect=n.resizeRects.inverted,e.deltaRect=n.resizeRects.delta}}),a.signals.on("new",function(t){var e=t.iEvent,n=t.phase,r=t.interaction;if("move"===n&&r.prepared.edges){var i=r.target.options.resize,s=i.invert,a="reposition"===s||"negate"===s,c=r.prepared.edges,l=r.resizeRects.start,p=r.resizeRects.current,u=r.resizeRects.inverted,d=r.resizeRects.delta,f=o.extend(r.resizeRects.previous,u),v=c,g=e.dx,h=e.dy;if(i.preserveAspectRatio||i.square){var m=i.preserveAspectRatio?r.resizeStartAspectRatio:1;c=r.prepared._linkedEdges,v.left&&v.bottom||v.right&&v.top?h=-g/m:v.left||v.right?h=g/m:(v.top||v.bottom)&&(g=h*m)}if(c.top&&(p.top+=h),c.bottom&&(p.bottom+=h),c.left&&(p.left+=g),c.right&&(p.right+=g),a){if(o.extend(u,p),"reposition"===s){var y=void 0;u.top>u.bottom&&(y=u.top,u.top=u.bottom,u.bottom=y),u.left>u.right&&(y=u.left,u.left=u.right,u.right=y)}}else u.top=Math.min(p.top,l.bottom),u.bottom=Math.max(p.bottom,l.top),u.left=Math.min(p.left,l.right),u.right=Math.max(p.right,l.left);u.width=u.right-u.left,u.height=u.bottom-u.top;for(var x in u)d[x]=u[x]-f[x];e.edges=r.prepared.edges,e.rect=u,e.deltaRect=d}}),c.prototype.resizable=function(t){return o.is.object(t)?(this.options.resize.enabled=!1!==t.enabled,this.setPerAction("resize",t),this.setOnEvents("resize",t),/^x$|^y$|^xy$/.test(t.axis)?this.options.resize.axis=t.axis:null===t.axis&&(this.options.resize.axis=p.resize.axis),o.is.bool(t.preserveAspectRatio)?this.options.resize.preserveAspectRatio=t.preserveAspectRatio:o.is.bool(t.square)&&(this.options.resize.square=t.square),this):o.is.bool(t)?(this.options.resize.enabled=t,t||(this.onresizestart=this.onresizestart=this.onresizeend=null),this):this.options.resize},l.signals.on("new",function(t){t.resizeAxes="xy"}),a.signals.on("set-delta",function(t){var e=t.interaction,n=t.iEvent;"resize"===t.action&&e.resizeAxes&&(e.target.options.resize.square?("y"===e.resizeAxes?n.dx=n.dy:n.dy=n.dx,n.axes="xy"):(n.axes=e.resizeAxes,"x"===e.resizeAxes?n.dy=0:"y"===e.resizeAxes&&(n.dx=0)))}),i.resize=d,i.names.push("resize"),
o.merge(c.eventTypes,["resizestart","resizemove","resizeinertiastart","resizeinertiaresume","resizeend"]),i.methodDict.resize="resizable",p.resize=d.defaults,e.exports=d},{"../InteractEvent":3,"../Interactable":4,"../Interaction":5,"../defaultOptions":18,"../utils":44,"../utils/browser":36,"./base":6}],11:[function(t,e,n){"use strict";var r=t("./utils/raf"),i=t("./utils/window").getWindow,o=t("./utils/is"),s=t("./utils/domUtils"),a=t("./Interaction"),c=t("./defaultOptions"),l={defaults:{enabled:!1,container:null,margin:60,speed:300},interaction:null,i:null,x:0,y:0,isScrolling:!1,prevTime:0,start:function(t){l.isScrolling=!0,r.cancel(l.i),l.interaction=t,l.prevTime=(new Date).getTime(),l.i=r.request(l.scroll)},stop:function(){l.isScrolling=!1,r.cancel(l.i)},scroll:function(){var t=l.interaction.target.options[l.interaction.prepared.name].autoScroll,e=t.container||i(l.interaction.element),n=(new Date).getTime(),s=(n-l.prevTime)/1e3,a=t.speed*s;a>=1&&(o.window(e)?e.scrollBy(l.x*a,l.y*a):e&&(e.scrollLeft+=l.x*a,e.scrollTop+=l.y*a),l.prevTime=n),l.isScrolling&&(r.cancel(l.i),l.i=r.request(l.scroll))},check:function(t,e){var n=t.options;return n[e].autoScroll&&n[e].autoScroll.enabled},onInteractionMove:function(t){var e=t.interaction,n=t.pointer;if(e.interacting()&&l.check(e.target,e.prepared.name)){if(e.simulation)return void(l.x=l.y=0);var r=void 0,a=void 0,c=void 0,p=void 0,u=e.target.options[e.prepared.name].autoScroll,d=u.container||i(e.element);if(o.window(d))p=n.clientX<l.margin,r=n.clientY<l.margin,a=n.clientX>d.innerWidth-l.margin,c=n.clientY>d.innerHeight-l.margin;else{var f=s.getElementClientRect(d);p=n.clientX<f.left+l.margin,r=n.clientY<f.top+l.margin,a=n.clientX>f.right-l.margin,c=n.clientY>f.bottom-l.margin}l.x=a?1:p?-1:0,l.y=c?1:r?-1:0,l.isScrolling||(l.margin=u.margin,l.speed=u.speed,l.start(e))}}};a.signals.on("stop-active",function(){l.stop()}),a.signals.on("action-move",l.onInteractionMove),c.perAction.autoScroll=l.defaults,e.exports=l},{"./Interaction":5,"./defaultOptions":18,"./utils/domUtils":39,"./utils/is":46,"./utils/raf":50,"./utils/window":52}],12:[function(t,e,n){"use strict";var r=t("../Interactable"),i=t("../actions/base"),o=t("../utils/is"),s=t("../utils/domUtils"),a=t("../utils"),c=a.warnOnce;r.prototype.getAction=function(t,e,n,r){var i=this.defaultActionChecker(t,e,n,r);return this.options.actionChecker?this.options.actionChecker(t,e,i,this,r,n):i},r.prototype.ignoreFrom=c(function(t){return this._backCompatOption("ignoreFrom",t)},"Interactable.ignoreForm() has been deprecated. Use Interactble.draggable({ignoreFrom: newValue})."),r.prototype.allowFrom=c(function(t){return this._backCompatOption("allowFrom",t)},"Interactable.allowForm() has been deprecated. Use Interactble.draggable({allowFrom: newValue})."),r.prototype.testIgnore=function(t,e,n){return!(!t||!o.element(n))&&(o.string(t)?s.matchesUpTo(n,t,e):!!o.element(t)&&s.nodeContains(t,n))},r.prototype.testAllow=function(t,e,n){return!t||!!o.element(n)&&(o.string(t)?s.matchesUpTo(n,t,e):!!o.element(t)&&s.nodeContains(t,n))},r.prototype.testIgnoreAllow=function(t,e,n){return!this.testIgnore(t.ignoreFrom,e,n)&&this.testAllow(t.allowFrom,e,n)},r.prototype.actionChecker=function(t){return o.function(t)?(this.options.actionChecker=t,this):null===t?(delete this.options.actionChecker,this):this.options.actionChecker},r.prototype.styleCursor=function(t){return o.bool(t)?(this.options.styleCursor=t,this):null===t?(delete this.options.styleCursor,this):this.options.styleCursor},r.prototype.defaultActionChecker=function(t,e,n,r){for(var o=this.getRect(r),s=e.buttons||{0:1,1:4,3:8,4:16}[e.button],a=null,c=0;c<i.names.length;c++){var l;l=i.names[c];var p=l;if((!n.pointerIsDown||!/mouse|pointer/.test(n.pointerType)||0!=(s&this.options[p].mouseButtons))&&(a=i[p].checker(t,e,this,r,n,o)))return a}}},{"../Interactable":4,"../actions/base":6,"../utils":44,"../utils/domUtils":39,"../utils/is":46}],13:[function(t,e,n){"use strict";function r(t,e,n,r){return v.is.object(t)&&e.testIgnoreAllow(e.options[t.name],n,r)&&e.options[t.name].enabled&&a(e,n,t)?t:null}function i(t,e,n,i,o,s){for(var a=0,c=i.length;a<c;a++){var l=i[a],p=o[a],u=r(l.getAction(e,n,t,p),l,p,s);if(u)return{action:u,target:l,element:p}}return{}}function o(t,e,n,r){function o(t){s.push(t),a.push(c)}for(var s=[],a=[],c=r;v.is.element(c);){s=[],a=[],f.interactables.forEachMatch(c,o);var l=i(t,e,n,s,a,r);if(l.action&&!l.target.options[l.action.name].manualStart)return l;c=v.parentNode(c)}return{}}function s(t,e){var n=e.action,r=e.target,i=e.element;if(n=n||{},t.target&&t.target.options.styleCursor&&(t.target._doc.documentElement.style.cursor=""),t.target=r,t.element=i,v.copyAction(t.prepared,n),r&&r.options.styleCursor){var o=n?u[n.name].getCursor(n):"";t.target._doc.documentElement.style.cursor=o}g.fire("prepared",{interaction:t})}function a(t,e,n){var r=t.options,i=r[n.name].max,o=r[n.name].maxPerElement,s=0,a=0,c=0;if(i&&o&&h.maxInteractions){for(var l=0;l<f.interactions.length;l++){var p;p=f.interactions[l];var u=p,d=u.prepared.name;if(u.interacting()){if(++s>=h.maxInteractions)return!1;if(u.target===t){if((a+=d===n.name|0)>=i)return!1;if(u.element===e&&(c++,d!==n.name||c>=o))return!1}}}return h.maxInteractions>0}}var c=t("../interact"),l=t("../Interactable"),p=t("../Interaction"),u=t("../actions/base"),d=t("../defaultOptions"),f=t("../scope"),v=t("../utils"),g=t("../utils/Signals").new();t("./InteractableMethods");var h={signals:g,withinInteractionLimit:a,maxInteractions:1/0,defaults:{perAction:{manualStart:!1,max:1/0,maxPerElement:1,allowFrom:null,ignoreFrom:null,mouseButtons:1}},setActionDefaults:function(t){v.extend(t.defaults,h.defaults.perAction)},validateAction:r};p.signals.on("down",function(t){var e=t.interaction,n=t.pointer,r=t.event,i=t.eventTarget;if(!e.interacting()){s(e,o(e,n,r,i))}}),p.signals.on("move",function(t){var e=t.interaction,n=t.pointer,r=t.event,i=t.eventTarget;if("mouse"===e.pointerType&&!e.pointerIsDown&&!e.interacting()){s(e,o(e,n,r,i))}}),p.signals.on("move",function(t){var e=t.interaction,n=t.event;if(e.pointerIsDown&&!e.interacting()&&e.pointerWasMoved&&e.prepared.name){g.fire("before-start",t);var r=e.target;e.prepared.name&&r&&(r.options[e.prepared.name].manualStart||!a(r,e.element,e.prepared)?e.stop(n):e.start(e.prepared,r,e.element))}}),p.signals.on("stop",function(t){var e=t.interaction,n=e.target;n&&n.options.styleCursor&&(n._doc.documentElement.style.cursor="")}),c.maxInteractions=function(t){return v.is.number(t)?(h.maxInteractions=t,c):h.maxInteractions},l.settingsMethods.push("styleCursor"),l.settingsMethods.push("actionChecker"),l.settingsMethods.push("ignoreFrom"),l.settingsMethods.push("allowFrom"),d.base.actionChecker=null,d.base.styleCursor=!0,v.extend(d.perAction,h.defaults.perAction),e.exports=h},{"../Interactable":4,"../Interaction":5,"../actions/base":6,"../defaultOptions":18,"../interact":21,"../scope":33,"../utils":44,"../utils/Signals":34,"./InteractableMethods":12}],14:[function(t,e,n){"use strict";function r(t,e){if(!e)return!1;var n=e.options.drag.startAxis;return"xy"===t||"xy"===n||n===t}var i=t("./base"),o=t("../scope"),s=t("../utils/is"),a=t("../utils/domUtils"),c=a.parentNode;i.setActionDefaults(t("../actions/drag")),i.signals.on("before-start",function(t){var e=t.interaction,n=t.eventTarget,a=t.dx,l=t.dy;if("drag"===e.prepared.name){var p=Math.abs(a),u=Math.abs(l),d=e.target.options.drag,f=d.startAxis,v=p>u?"x":p<u?"y":"xy";if(e.prepared.axis="start"===d.lockAxis?v[0]:d.lockAxis,"xy"!==v&&"xy"!==f&&f!==v){e.prepared.name=null;for(var g=n,h=function(t){if(t!==e.target){var o=e.target.options.drag;if(!o.manualStart&&t.testIgnoreAllow(o,g,n)){var s=t.getAction(e.downPointer,e.downEvent,e,g);if(s&&"drag"===s.name&&r(v,t)&&i.validateAction(s,t,g,n))return t}}};s.element(g);){var m=o.interactables.forEachMatch(g,h);if(m){e.prepared.name="drag",e.target=m,e.element=g;break}g=c(g)}}}})},{"../actions/drag":7,"../scope":33,"../utils/domUtils":39,"../utils/is":46,"./base":13}],15:[function(t,e,n){"use strict";t("./base").setActionDefaults(t("../actions/gesture"))},{"../actions/gesture":9,"./base":13}],16:[function(t,e,n){"use strict";function r(t){var e=t.prepared&&t.prepared.name;if(!e)return null;var n=t.target.options;return n[e].hold||n[e].delay}var i=t("./base"),o=t("../Interaction");i.defaults.perAction.hold=0,i.defaults.perAction.delay=0,o.signals.on("new",function(t){t.autoStartHoldTimer=null}),i.signals.on("prepared",function(t){var e=t.interaction,n=r(e);n>0&&(e.autoStartHoldTimer=setTimeout(function(){e.start(e.prepared,e.target,e.element)},n))}),o.signals.on("move",function(t){var e=t.interaction,n=t.duplicate;e.pointerWasMoved&&!n&&clearTimeout(e.autoStartHoldTimer)}),i.signals.on("before-start",function(t){var e=t.interaction;r(e)>0&&(e.prepared.name=null)}),e.exports={getHoldDuration:r}},{"../Interaction":5,"./base":13}],17:[function(t,e,n){"use strict";t("./base").setActionDefaults(t("../actions/resize"))},{"../actions/resize":10,"./base":13}],18:[function(t,e,n){"use strict";e.exports={base:{accept:null,preventDefault:"auto",deltaSource:"page"},perAction:{origin:{x:0,y:0},inertia:{enabled:!1,resistance:10,minSpeed:100,endSpeed:10,allowResume:!0,smoothEndDuration:300}}}},{}],19:[function(t,e,n){"use strict";t("./inertia"),t("./modifiers/snap"),t("./modifiers/restrict"),t("./pointerEvents/base"),t("./pointerEvents/holdRepeat"),t("./pointerEvents/interactableTargets"),t("./autoStart/hold"),t("./actions/gesture"),t("./actions/resize"),t("./actions/drag"),t("./actions/drop"),t("./modifiers/snapSize"),t("./modifiers/restrictEdges"),t("./modifiers/restrictSize"),t("./autoStart/gesture"),t("./autoStart/resize"),t("./autoStart/drag"),t("./interactablePreventDefault.js"),t("./autoScroll"),e.exports=t("./interact")},{"./actions/drag":7,"./actions/drop":8,"./actions/gesture":9,"./actions/resize":10,"./autoScroll":11,"./autoStart/drag":14,"./autoStart/gesture":15,"./autoStart/hold":16,"./autoStart/resize":17,"./inertia":20,"./interact":21,"./interactablePreventDefault.js":22,"./modifiers/restrict":24,"./modifiers/restrictEdges":25,"./modifiers/restrictSize":26,"./modifiers/snap":27,"./modifiers/snapSize":28,"./pointerEvents/base":30,"./pointerEvents/holdRepeat":31,"./pointerEvents/interactableTargets":32}],20:[function(t,e,n){"use strict";function r(t,e){var n=t.target.options[t.prepared.name].inertia,r=n.resistance,i=-Math.log(n.endSpeed/e.v0)/r;e.x0=t.prevEvent.pageX,e.y0=t.prevEvent.pageY,e.t0=e.startEvent.timeStamp/1e3,e.sx=e.sy=0,e.modifiedXe=e.xe=(e.vx0-i)/r,e.modifiedYe=e.ye=(e.vy0-i)/r,e.te=i,e.lambda_v0=r/e.v0,e.one_ve_v0=1-n.endSpeed/e.v0}function i(){s(this),p.setCoordDeltas(this.pointerDelta,this.prevCoords,this.curCoords);var t=this.inertiaStatus,e=this.target.options[this.prepared.name].inertia,n=e.resistance,r=(new Date).getTime()/1e3-t.t0;if(r<t.te){var i=1-(Math.exp(-n*r)-t.lambda_v0)/t.one_ve_v0;if(t.modifiedXe===t.xe&&t.modifiedYe===t.ye)t.sx=t.xe*i,t.sy=t.ye*i;else{var o=p.getQuadraticCurvePoint(0,0,t.xe,t.ye,t.modifiedXe,t.modifiedYe,i);t.sx=o.x,t.sy=o.y}this.doMove(),t.i=u.request(this.boundInertiaFrame)}else t.sx=t.modifiedXe,t.sy=t.modifiedYe,this.doMove(),this.end(t.startEvent),t.active=!1,this.simulation=null;p.copyCoords(this.prevCoords,this.curCoords)}function o(){s(this);var t=this.inertiaStatus,e=(new Date).getTime()-t.t0,n=this.target.options[this.prepared.name].inertia.smoothEndDuration;e<n?(t.sx=p.easeOutQuad(e,0,t.xe,n),t.sy=p.easeOutQuad(e,0,t.ye,n),this.pointerMove(t.startEvent,t.startEvent),t.i=u.request(this.boundSmoothEndFrame)):(t.sx=t.xe,t.sy=t.ye,this.pointerMove(t.startEvent,t.startEvent),this.end(t.startEvent),t.smoothEnd=t.active=!1,this.simulation=null)}function s(t){var e=t.inertiaStatus;if(e.active){var n=e.upCoords.page,r=e.upCoords.client;p.setCoords(t.curCoords,[{pageX:n.x+e.sx,pageY:n.y+e.sy,clientX:r.x+e.sx,clientY:r.y+e.sy}])}}var a=t("./InteractEvent"),c=t("./Interaction"),l=t("./modifiers/base"),p=t("./utils"),u=t("./utils/raf");c.signals.on("new",function(t){t.inertiaStatus={active:!1,smoothEnd:!1,allowResume:!1,startEvent:null,upCoords:{},xe:0,ye:0,sx:0,sy:0,t0:0,vx0:0,vys:0,duration:0,lambda_v0:0,one_ve_v0:0,i:null},t.boundInertiaFrame=function(){return i.apply(t)},t.boundSmoothEndFrame=function(){return o.apply(t)}}),c.signals.on("down",function(t){var e=t.interaction,n=t.event,r=t.pointer,i=t.eventTarget,o=e.inertiaStatus;if(o.active)for(var s=i;p.is.element(s);){if(s===e.element){u.cancel(o.i),o.active=!1,e.simulation=null,e.updatePointer(r),p.setCoords(e.curCoords,e.pointers);var d={interaction:e};c.signals.fire("before-action-move",d),c.signals.fire("action-resume",d);var f=new a(e,n,e.prepared.name,"inertiaresume",e.element);e.target.fire(f),e.prevEvent=f,l.resetStatuses(e.modifierStatuses),p.copyCoords(e.prevCoords,e.curCoords);break}s=p.parentNode(s)}}),c.signals.on("up",function(t){var e=t.interaction,n=t.event,i=e.inertiaStatus;if(e.interacting()&&!i.active){var o=e.target,s=o&&o.options,c=s&&e.prepared.name&&s[e.prepared.name].inertia,d=(new Date).getTime(),f={},v=p.extend({},e.curCoords.page),g=e.pointerDelta.client.speed,h=!1,m=void 0,y=c&&c.enabled&&"gesture"!==e.prepared.name&&n!==i.startEvent,x=y&&d-e.curCoords.timeStamp<50&&g>c.minSpeed&&g>c.endSpeed,b={interaction:e,pageCoords:v,statuses:f,preEnd:!0,requireEndOnly:!0};y&&!x&&(l.resetStatuses(f),m=l.setAll(b),m.shouldMove&&m.locked&&(h=!0)),(x||h)&&(p.copyCoords(i.upCoords,e.curCoords),e.pointers[0]=i.startEvent=new a(e,n,e.prepared.name,"inertiastart",e.element),i.t0=d,i.active=!0,i.allowResume=c.allowResume,e.simulation=i,o.fire(i.startEvent),x?(i.vx0=e.pointerDelta.client.vx,i.vy0=e.pointerDelta.client.vy,i.v0=g,r(e,i),p.extend(v,e.curCoords.page),v.x+=i.xe,v.y+=i.ye,l.resetStatuses(f),m=l.setAll(b),i.modifiedXe+=m.dx,i.modifiedYe+=m.dy,i.i=u.request(e.boundInertiaFrame)):(i.smoothEnd=!0,i.xe=m.dx,i.ye=m.dy,i.sx=i.sy=0,i.i=u.request(e.boundSmoothEndFrame)))}}),c.signals.on("stop-active",function(t){var e=t.interaction,n=e.inertiaStatus;n.active&&(u.cancel(n.i),n.active=!1,e.simulation=null)})},{"./InteractEvent":3,"./Interaction":5,"./modifiers/base":23,"./utils":44,"./utils/raf":50}],21:[function(t,e,n){"use strict";function r(t,e){var n=a.interactables.get(t,e);return n||(n=new c(t,e),n.events.global=p),n}var i=t("./utils/browser"),o=t("./utils/events"),s=t("./utils"),a=t("./scope"),c=t("./Interactable"),l=t("./Interaction"),p={};r.isSet=function(t,e){return-1!==a.interactables.indexOfElement(t,e&&e.context)},r.on=function(t,e,n){if(s.is.string(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),s.is.array(t)){for(var i=0;i<t.length;i++){var l;l=t[i];var u=l;r.on(u,e,n)}return r}if(s.is.object(t)){for(var d in t)r.on(d,t[d],e);return r}return s.contains(c.eventTypes,t)?p[t]?p[t].push(e):p[t]=[e]:o.add(a.document,t,e,{options:n}),r},r.off=function(t,e,n){if(s.is.string(t)&&-1!==t.search(" ")&&(t=t.trim().split(/ +/)),s.is.array(t)){for(var i=0;i<t.length;i++){var l;l=t[i];var u=l;r.off(u,e,n)}return r}if(s.is.object(t)){for(var d in t)r.off(d,t[d],e);return r}if(s.contains(c.eventTypes,t)){var f=void 0;t in p&&-1!==(f=p[t].indexOf(e))&&p[t].splice(f,1)}else o.remove(a.document,t,e,n);return r},r.debug=function(){return a},r.getPointerAverage=s.pointerAverage,r.getTouchBBox=s.touchBBox,r.getTouchDistance=s.touchDistance,r.getTouchAngle=s.touchAngle,r.getElementRect=s.getElementRect,r.getElementClientRect=s.getElementClientRect,r.matchesSelector=s.matchesSelector,r.closest=s.closest,r.supportsTouch=function(){return i.supportsTouch},r.supportsPointerEvent=function(){return i.supportsPointerEvent},r.stop=function(t){for(var e=a.interactions.length-1;e>=0;e--)a.interactions[e].stop(t);return r},r.pointerMoveTolerance=function(t){return s.is.number(t)?(l.pointerMoveTolerance=t,r):l.pointerMoveTolerance},r.addDocument=a.addDocument,r.removeDocument=a.removeDocument,a.interact=r,e.exports=r},{"./Interactable":4,"./Interaction":5,"./scope":33,"./utils":44,"./utils/browser":36,"./utils/events":40}],22:[function(t,e,n){"use strict";function r(t){var e=t.interaction,n=t.event;e.target&&e.target.checkAndPreventDefault(n)}var i=t("./Interactable"),o=t("./Interaction"),s=t("./scope"),a=t("./utils/is"),c=t("./utils/events"),l=t("./utils/browser"),p=t("./utils/domUtils"),u=p.nodeContains,d=p.matchesSelector;i.prototype.preventDefault=function(t){return/^(always|never|auto)$/.test(t)?(this.options.preventDefault=t,this):a.bool(t)?(this.options.preventDefault=t?"always":"never",this):this.options.preventDefault},i.prototype.checkAndPreventDefault=function(t){var e=this.options.preventDefault;if("never"!==e)return"always"===e?void t.preventDefault():void(c.supportsPassive&&/^touch(start|move)$/.test(t.type)&&!l.isIOS||/^(mouse|pointer|touch)*(down|start)/i.test(t.type)||a.element(t.target)&&d(t.target,"input,select,textarea,[contenteditable=true],[contenteditable=true] *")||t.preventDefault())};for(var f=["down","move","up","cancel"],v=0;v<f.length;v++){var g=f[v];o.signals.on(g,r)}o.docEvents.dragstart=function(t){for(var e=0;e<s.interactions.length;e++){var n;n=s.interactions[e];var r=n;if(r.element&&(r.element===t.target||u(r.element,t.target)))return void r.target.checkAndPreventDefault(t)}}},{"./Interactable":4,"./Interaction":5,"./scope":33,"./utils/browser":36,"./utils/domUtils":39,"./utils/events":40,"./utils/is":46}],23:[function(t,e,n){"use strict";function r(t,e,n){return t&&t.enabled&&(e||!t.endOnly)&&(!n||t.endOnly)}var i=t("../InteractEvent"),o=t("../Interaction"),s=t("../utils/extend"),a={names:[],setOffsets:function(t){var e=t.interaction,n=t.pageCoords,r=e.target,i=e.element,o=e.startOffset,s=r.getRect(i);s?(o.left=n.x-s.left,o.top=n.y-s.top,o.right=s.right-n.x,o.bottom=s.bottom-n.y,"width"in s||(s.width=s.right-s.left),"height"in s||(s.height=s.bottom-s.top)):o.left=o.top=o.right=o.bottom=0,t.rect=s,t.interactable=r,t.element=i;for(var c=0;c<a.names.length;c++){var l;l=a.names[c];var p=l;t.options=r.options[e.prepared.name][p],t.options&&(e.modifierOffsets[p]=a[p].setOffset(t))}},setAll:function(t){var e=t.interaction,n=t.statuses,i=t.preEnd,o=t.requireEndOnly,c={dx:0,dy:0,changed:!1,locked:!1,shouldMove:!0};t.modifiedCoords=s({},t.pageCoords);for(var l=0;l<a.names.length;l++){var p;p=a.names[l];var u=p,d=a[u],f=e.target.options[e.prepared.name][u];r(f,i,o)&&(t.status=t.status=n[u],t.options=f,t.offset=t.interaction.modifierOffsets[u],d.set(t),t.status.locked&&(t.modifiedCoords.x+=t.status.dx,t.modifiedCoords.y+=t.status.dy,c.dx+=t.status.dx,c.dy+=t.status.dy,c.locked=!0))}return c.shouldMove=!t.status||!c.locked||t.status.changed,c},resetStatuses:function(t){for(var e=0;e<a.names.length;e++){var n;n=a.names[e];var r=n,i=t[r]||{};i.dx=i.dy=0,i.modifiedX=i.modifiedY=NaN,i.locked=!1,i.changed=!0,t[r]=i}return t},start:function(t,e){var n=t.interaction,r={interaction:n,pageCoords:("action-resume"===e?n.curCoords:n.startCoords).page,startOffset:n.startOffset,statuses:n.modifierStatuses,preEnd:!1,requireEndOnly:!1};a.setOffsets(r),a.resetStatuses(r.statuses),r.pageCoords=s({},n.startCoords.page),n.modifierResult=a.setAll(r)},beforeMove:function(t){var e=t.interaction,n=t.preEnd,r=t.interactingBeforeMove,i=a.setAll({interaction:e,preEnd:n,pageCoords:e.curCoords.page,statuses:e.modifierStatuses,requireEndOnly:!1});!i.shouldMove&&r&&(e._dontFireMove=!0),e.modifierResult=i},end:function(t){for(var e=t.interaction,n=t.event,i=0;i<a.names.length;i++){var o;o=a.names[i];var s=o;if(r(e.target.options[e.prepared.name][s],!0,!0)){e.doMove({event:n,preEnd:!0});break}}},setXY:function(t){for(var e=t.iEvent,n=t.interaction,r=s({},t),i=0;i<a.names.length;i++){var o=a.names[i];if(r.options=n.target.options[n.prepared.name][o],r.options){var c=a[o];r.status=n.modifierStatuses[o],e[o]=c.modifyCoords(r)}}}};o.signals.on("new",function(t){t.startOffset={left:0,right:0,top:0,bottom:0},t.modifierOffsets={},t.modifierStatuses=a.resetStatuses({}),t.modifierResult=null}),o.signals.on("action-start",a.start),o.signals.on("action-resume",a.start),o.signals.on("before-action-move",a.beforeMove),o.signals.on("action-end",a.end),i.signals.on("set-xy",a.setXY),e.exports=a},{"../InteractEvent":3,"../Interaction":5,"../utils/extend":41}],24:[function(t,e,n){"use strict";function r(t,e,n){return o.is.function(t)?o.resolveRectLike(t,e.target,e.element,[n.x,n.y,e]):o.resolveRectLike(t,e.target,e.element)}var i=t("./base"),o=t("../utils"),s=t("../defaultOptions"),a={defaults:{enabled:!1,endOnly:!1,restriction:null,elementRect:null},setOffset:function(t){var e=t.rect,n=t.startOffset,r=t.options,i=r&&r.elementRect,o={};return e&&i?(o.left=n.left-e.width*i.left,o.top=n.top-e.height*i.top,o.right=n.right-e.width*(1-i.right),o.bottom=n.bottom-e.height*(1-i.bottom)):o.left=o.top=o.right=o.bottom=0,o},set:function(t){var e=t.modifiedCoords,n=t.interaction,i=t.status,s=t.options;if(!s)return i;var a=i.useStatusXY?{x:i.x,y:i.y}:o.extend({},e),c=r(s.restriction,n,a);if(!c)return i;i.dx=0,i.dy=0,i.locked=!1;var l=c,p=a.x,u=a.y,d=n.modifierOffsets.restrict;"x"in c&&"y"in c?(p=Math.max(Math.min(l.x+l.width-d.right,a.x),l.x+d.left),u=Math.max(Math.min(l.y+l.height-d.bottom,a.y),l.y+d.top)):(p=Math.max(Math.min(l.right-d.right,a.x),l.left+d.left),u=Math.max(Math.min(l.bottom-d.bottom,a.y),l.top+d.top)),i.dx=p-a.x,i.dy=u-a.y,i.changed=i.modifiedX!==p||i.modifiedY!==u,i.locked=!(!i.dx&&!i.dy),i.modifiedX=p,i.modifiedY=u},modifyCoords:function(t){var e=t.page,n=t.client,r=t.status,i=t.phase,o=t.options,s=o&&o.elementRect;if(o&&o.enabled&&("start"!==i||!s||!r.locked)&&r.locked)return e.x+=r.dx,e.y+=r.dy,n.x+=r.dx,n.y+=r.dy,{dx:r.dx,dy:r.dy}},getRestrictionRect:r};i.restrict=a,i.names.push("restrict"),s.perAction.restrict=a.defaults,e.exports=a},{"../defaultOptions":18,"../utils":44,"./base":23}],25:[function(t,e,n){"use strict";var r=t("./base"),i=t("../utils"),o=t("../utils/rect"),s=t("../defaultOptions"),a=t("../actions/resize"),c=t("./restrict"),l=c.getRestrictionRect,p={top:1/0,left:1/0,bottom:-1/0,right:-1/0},u={top:-1/0,left:-1/0,bottom:1/0,right:1/0},d={defaults:{enabled:!1,endOnly:!1,min:null,max:null,offset:null},setOffset:function(t){var e=t.interaction,n=t.startOffset,r=t.options;if(!r)return i.extend({},n);var o=l(r.offset,e,e.startCoords.page);return o?{top:n.top+o.y,left:n.left+o.x,bottom:n.bottom+o.y,right:n.right+o.x}:n},set:function(t){var e=t.modifiedCoords,n=t.interaction,r=t.status,s=t.offset,a=t.options,c=n.prepared.linkedEdges||n.prepared.edges;if(n.interacting()&&c){var d=r.useStatusXY?{x:r.x,y:r.y}:i.extend({},e),f=o.xywhToTlbr(l(a.inner,n,d))||p,v=o.xywhToTlbr(l(a.outer,n,d))||u,g=d.x,h=d.y;r.dx=0,r.dy=0,r.locked=!1,c.top?h=Math.min(Math.max(v.top+s.top,d.y),f.top+s.top):c.bottom&&(h=Math.max(Math.min(v.bottom-s.bottom,d.y),f.bottom-s.bottom)),c.left?g=Math.min(Math.max(v.left+s.left,d.x),f.left+s.left):c.right&&(g=Math.max(Math.min(v.right-s.right,d.x),f.right-s.right)),r.dx=g-d.x,r.dy=h-d.y,r.changed=r.modifiedX!==g||r.modifiedY!==h,r.locked=!(!r.dx&&!r.dy),r.modifiedX=g,r.modifiedY=h}},modifyCoords:function(t){var e=t.page,n=t.client,r=t.status,i=t.phase,o=t.options;if(o&&o.enabled&&("start"!==i||!r.locked)&&r.locked)return e.x+=r.dx,e.y+=r.dy,n.x+=r.dx,n.y+=r.dy,{dx:r.dx,dy:r.dy}},noInner:p,noOuter:u,getRestrictionRect:l};r.restrictEdges=d,r.names.push("restrictEdges"),s.perAction.restrictEdges=d.defaults,a.defaults.restrictEdges=d.defaults,e.exports=d},{"../actions/resize":10,"../defaultOptions":18,"../utils":44,"../utils/rect":51,"./base":23,"./restrict":24}],26:[function(t,e,n){"use strict";var r=t("./base"),i=t("./restrictEdges"),o=t("../utils"),s=t("../utils/rect"),a=t("../defaultOptions"),c=t("../actions/resize"),l={width:-1/0,height:-1/0},p={width:1/0,height:1/0},u={defaults:{enabled:!1,endOnly:!1,min:null,max:null},setOffset:function(t){return t.interaction.startOffset},set:function(t){var e=t.interaction,n=t.options,r=e.prepared.linkedEdges||e.prepared.edges;if(e.interacting()&&r){var a=s.xywhToTlbr(e.resizeRects.inverted),c=s.tlbrToXywh(i.getRestrictionRect(n.min,e))||l,u=s.tlbrToXywh(i.getRestrictionRect(n.max,e))||p;t.options={enabled:n.enabled,endOnly:n.endOnly,inner:o.extend({},i.noInner),outer:o.extend({},i.noOuter)},r.top?(t.options.inner.top=a.bottom-c.height,t.options.outer.top=a.bottom-u.height):r.bottom&&(t.options.inner.bottom=a.top+c.height,t.options.outer.bottom=a.top+u.height),r.left?(t.options.inner.left=a.right-c.width,t.options.outer.left=a.right-u.width):r.right&&(t.options.inner.right=a.left+c.width,t.options.outer.right=a.left+u.width),i.set(t)}},modifyCoords:i.modifyCoords};r.restrictSize=u,r.names.push("restrictSize"),a.perAction.restrictSize=u.defaults,c.defaults.restrictSize=u.defaults,e.exports=u},{"../actions/resize":10,"../defaultOptions":18,"../utils":44,"../utils/rect":51,"./base":23,"./restrictEdges":25}],27:[function(t,e,n){"use strict";var r=t("./base"),i=t("../interact"),o=t("../utils"),s=t("../defaultOptions"),a={defaults:{enabled:!1,endOnly:!1,range:1/0,targets:null,offsets:null,relativePoints:null},setOffset:function(t){var e=t.interaction,n=t.interactable,r=t.element,i=t.rect,s=t.startOffset,a=t.options,c=[],l=o.rectToXY(o.resolveRectLike(a.origin)),p=l||o.getOriginXY(n,r,e.prepared.name);a=a||n.options[e.prepared.name].snap||{};var u=void 0;if("startCoords"===a.offset)u={x:e.startCoords.page.x-p.x,y:e.startCoords.page.y-p.y};else{var d=o.resolveRectLike(a.offset,n,r,[e]);u=o.rectToXY(d)||{x:0,y:0}}if(i&&a.relativePoints&&a.relativePoints.length)for(var f=0;f<a.relativePoints.length;f++){var v;v=a.relativePoints[f];var g=v,h=g.x,m=g.y;c.push({x:s.left-i.width*h+u.x,y:s.top-i.height*m+u.y})}else c.push(u);return c},set:function(t){var e=t.interaction,n=t.modifiedCoords,r=t.status,i=t.options,s=t.offset,a=[],c=void 0,l=void 0,p=void 0;if(r.useStatusXY)l={x:r.x,y:r.y};else{var u=o.getOriginXY(e.target,e.element,e.prepared.name);l=o.extend({},n),l.x-=u.x,l.y-=u.y}r.realX=l.x,r.realY=l.y;for(var d=i.targets?i.targets.length:0,f=0;f<s.length;f++){var v;v=s[f];for(var g=v,h=g.x,m=g.y,y=l.x-h,x=l.y-m,b=0;b<(i.targets||[]).length;b++){var w;w=(i.targets||[])[b];var E=w;c=o.is.function(E)?E(y,x,e):E,c&&a.push({x:o.is.number(c.x)?c.x+h:y,y:o.is.number(c.y)?c.y+m:x,range:o.is.number(c.range)?c.range:i.range})}}var T={target:null,inRange:!1,distance:0,range:0,dx:0,dy:0};for(p=0,d=a.length;p<d;p++){c=a[p];var S=c.range,C=c.x-l.x,I=c.y-l.y,D=o.hypot(C,I),O=D<=S;S===1/0&&T.inRange&&T.range!==1/0&&(O=!1),T.target&&!(O?T.inRange&&S!==1/0?D/S<T.distance/T.range:S===1/0&&T.range!==1/0||D<T.distance:!T.inRange&&D<T.distance)||(T.target=c,T.distance=D,T.range=S,T.inRange=O,T.dx=C,T.dy=I,r.range=S)}var M=void 0;T.target?(M=r.modifiedX!==T.target.x||r.modifiedY!==T.target.y,r.modifiedX=T.target.x,r.modifiedY=T.target.y):(M=!0,r.modifiedX=NaN,r.modifiedY=NaN),r.dx=T.dx,r.dy=T.dy,r.changed=M||T.inRange&&!r.locked,r.locked=T.inRange},modifyCoords:function(t){var e=t.page,n=t.client,r=t.status,i=t.phase,o=t.options,s=o&&o.relativePoints;if(o&&o.enabled&&("start"!==i||!s||!s.length))return r.locked&&(e.x+=r.dx,e.y+=r.dy,n.x+=r.dx,n.y+=r.dy),{range:r.range,locked:r.locked,x:r.modifiedX,y:r.modifiedY,realX:r.realX,realY:r.realY,dx:r.dx,dy:r.dy}}};i.createSnapGrid=function(t){return function(e,n){var r=t.limits||{left:-1/0,right:1/0,top:-1/0,bottom:1/0},i=0,s=0;o.is.object(t.offset)&&(i=t.offset.x,s=t.offset.y);var a=Math.round((e-i)/t.x),c=Math.round((n-s)/t.y);return{x:Math.max(r.left,Math.min(r.right,a*t.x+i)),y:Math.max(r.top,Math.min(r.bottom,c*t.y+s)),range:t.range}}},r.snap=a,r.names.push("snap"),s.perAction.snap=a.defaults,e.exports=a},{"../defaultOptions":18,"../interact":21,"../utils":44,"./base":23}],28:[function(t,e,n){"use strict";var r=t("./base"),i=t("./snap"),o=t("../defaultOptions"),s=t("../actions/resize"),a=t("../utils/"),c={defaults:{enabled:!1,endOnly:!1,range:1/0,targets:null,offsets:null},setOffset:function(t){var e=t.interaction,n=t.options,r=e.prepared.edges;if(r){t.options={relativePoints:[{x:r.left?0:1,y:r.top?0:1}],origin:{x:0,y:0},offset:"self",range:n.range};var o=i.setOffset(t);return t.options=n,o}},set:function(t){var e=t.interaction,n=t.options,r=t.offset,o=t.modifiedCoords,s=a.extend({},o),c=s.x-r[0].x,l=s.y-r[0].y;t.options=a.extend({},n),t.options.targets=[];for(var p=0;p<(n.targets||[]).length;p++){var u;u=(n.targets||[])[p];var d=u,f=void 0;f=a.is.function(d)?d(c,l,e):d,f&&("width"in f&&"height"in f&&(f.x=f.width,f.y=f.height),t.options.targets.push(f))}i.set(t)},modifyCoords:function(t){var e=t.options;t.options=a.extend({},e),t.options.enabled=e.enabled,t.options.relativePoints=[null],i.modifyCoords(t)}};r.snapSize=c,r.names.push("snapSize"),o.perAction.snapSize=c.defaults,s.defaults.snapSize=c.defaults,e.exports=c},{"../actions/resize":10,"../defaultOptions":18,"../utils/":44,"./base":23,"./snap":27}],29:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=t("../utils/pointerUtils");e.exports=function(){function t(e,n,o,s,a){if(r(this,t),i.pointerExtend(this,o),o!==n&&i.pointerExtend(this,n),this.interaction=a,this.timeStamp=(new Date).getTime(),this.originalEvent=o,this.type=e,this.pointerId=i.getPointerId(n),this.pointerType=i.getPointerType(n),this.target=s,this.currentTarget=null,"tap"===e){var c=a.getPointerIndex(n);this.dt=this.timeStamp-a.downTimes[c];var l=this.timeStamp-a.tapTime;this.double=!!(a.prevTap&&"doubletap"!==a.prevTap.type&&a.prevTap.target===this.target&&l<500)}else"doubletap"===e&&(this.dt=n.timeStamp-a.tapTime)}return t.prototype.subtractOrigin=function(t){var e=t.x,n=t.y;return this.pageX-=e,this.pageY-=n,this.clientX-=e,this.clientY-=n,this},t.prototype.addOrigin=function(t){var e=t.x,n=t.y;return this.pageX+=e,this.pageY+=n,this.clientX+=e,this.clientY+=n,this},t.prototype.preventDefault=function(){this.originalEvent.preventDefault()},t.prototype.stopPropagation=function(){this.propagationStopped=!0},t.prototype.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},t}()},{"../utils/pointerUtils":49}],30:[function(t,e,n){"use strict";function r(t){for(var e=t.interaction,n=t.pointer,s=t.event,c=t.eventTarget,p=t.type,u=void 0===p?t.pointerEvent.type:p,d=t.targets,f=void 0===d?i(t):d,v=t.pointerEvent,g=void 0===v?new o(u,n,s,c,e):v,h={interaction:e,pointer:n,event:s,eventTarget:c,targets:f,type:u,pointerEvent:g},m=0;m<f.length;m++){var y=f[m];for(var x in y.props||{})g[x]=y.props[x];var b=a.getOriginXY(y.eventable,y.element);if(g.subtractOrigin(b),g.eventable=y.eventable,g.currentTarget=y.element,y.eventable.fire(g),g.addOrigin(b),g.immediatePropagationStopped||g.propagationStopped&&m+1<f.length&&f[m+1].element!==g.currentTarget)break}if(l.fire("fired",h),"tap"===u){var w=g.double?r({interaction:e,pointer:n,event:s,eventTarget:c,type:"doubletap"}):g;e.prevTap=w,e.tapTime=w.timeStamp}return g}function i(t){var e=t.interaction,n=t.pointer,r=t.event,i=t.eventTarget,o=t.type,s=e.getPointerIndex(n);if("tap"===o&&(e.pointerWasMoved||!e.downTargets[s]||e.downTargets[s]!==i))return[];for(var c=a.getPath(i),p={interaction:e,pointer:n,event:r,eventTarget:i,type:o,path:c,targets:[],element:null},u=0;u<c.length;u++){var d;d=c[u];var f=d;p.element=f,l.fire("collect-targets",p)}return"hold"===o&&(p.targets=p.targets.filter(function(t){return t.eventable.options.holdDuration===e.holdTimers[s].duration})),p.targets}var o=t("./PointerEvent"),s=t("../Interaction"),a=t("../utils"),c=t("../defaultOptions"),l=t("../utils/Signals").new(),p=["down","up","cancel"],u=["down","up","cancel"],d={PointerEvent:o,fire:r,collectEventTargets:i,signals:l,defaults:{holdDuration:600,ignoreFrom:null,allowFrom:null,origin:{x:0,y:0}},types:["down","move","up","cancel","tap","doubletap","hold"]};s.signals.on("update-pointer-down",function(t){var e=t.interaction,n=t.pointerIndex;e.holdTimers[n]={duration:1/0,timeout:null}}),s.signals.on("remove-pointer",function(t){var e=t.interaction,n=t.pointerIndex;e.holdTimers.splice(n,1)}),
s.signals.on("move",function(t){var e=t.interaction,n=t.pointer,i=t.event,o=t.eventTarget,s=t.duplicateMove,a=e.getPointerIndex(n);s||e.pointerIsDown&&!e.pointerWasMoved||(e.pointerIsDown&&clearTimeout(e.holdTimers[a].timeout),r({interaction:e,pointer:n,event:i,eventTarget:o,type:"move"}))}),s.signals.on("down",function(t){for(var e=t.interaction,n=t.pointer,i=t.event,o=t.eventTarget,s=t.pointerIndex,c=e.holdTimers[s],p=a.getPath(o),u={interaction:e,pointer:n,event:i,eventTarget:o,type:"hold",targets:[],path:p,element:null},d=0;d<p.length;d++){var f;f=p[d];var v=f;u.element=v,l.fire("collect-targets",u)}if(u.targets.length){for(var g=1/0,h=0;h<u.targets.length;h++){var m;m=u.targets[h];var y=m,x=y.eventable.options.holdDuration;x<g&&(g=x)}c.duration=g,c.timeout=setTimeout(function(){r({interaction:e,eventTarget:o,pointer:n,event:i,type:"hold"})},g)}}),s.signals.on("up",function(t){var e=t.interaction,n=t.pointer,i=t.event,o=t.eventTarget;e.pointerWasMoved||r({interaction:e,eventTarget:o,pointer:n,event:i,type:"tap"})});for(var f=["up","cancel"],v=0;v<f.length;v++){var g=f[v];s.signals.on(g,function(t){var e=t.interaction,n=t.pointerIndex;e.holdTimers[n]&&clearTimeout(e.holdTimers[n].timeout)})}for(var h=0;h<p.length;h++)s.signals.on(p[h],function(t){return function(e){var n=e.interaction,i=e.pointer,o=e.event;r({interaction:n,eventTarget:e.eventTarget,pointer:i,event:o,type:t})}}(u[h]));s.signals.on("new",function(t){t.prevTap=null,t.tapTime=0,t.holdTimers=[]}),c.pointerEvents=d.defaults,e.exports=d},{"../Interaction":5,"../defaultOptions":18,"../utils":44,"../utils/Signals":34,"./PointerEvent":29}],31:[function(t,e,n){"use strict";function r(t){var e=t.pointerEvent;"hold"===e.type&&(e.count=(e.count||0)+1)}function i(t){var e=t.interaction,n=t.pointerEvent,r=t.eventTarget,i=t.targets;if("hold"===n.type&&i.length){var o=i[0].eventable.options.holdRepeatInterval;o<=0||(e.holdIntervalHandle=setTimeout(function(){s.fire({interaction:e,eventTarget:r,type:"hold",pointer:n,event:n})},o))}}function o(t){var e=t.interaction;e.holdIntervalHandle&&(clearInterval(e.holdIntervalHandle),e.holdIntervalHandle=null)}var s=t("./base"),a=t("../Interaction");s.signals.on("new",r),s.signals.on("fired",i);for(var c=["move","up","cancel","endall"],l=0;l<c.length;l++){var p=c[l];a.signals.on(p,o)}s.defaults.holdRepeatInterval=0,s.types.push("holdrepeat"),e.exports={onNew:r,onFired:i,endHoldRepeat:o}},{"../Interaction":5,"./base":30}],32:[function(t,e,n){"use strict";var r=t("./base"),i=t("../Interactable"),o=t("../utils/is"),s=t("../scope"),a=t("../utils/extend"),c=t("../utils/arr"),l=c.merge;r.signals.on("collect-targets",function(t){var e=t.targets,n=t.element,r=t.type,i=t.eventTarget;s.interactables.forEachMatch(n,function(t){var s=t.events,a=s.options;s[r]&&o.element(n)&&t.testIgnoreAllow(a,n,i)&&e.push({element:n,eventable:s,props:{interactable:t}})})}),i.signals.on("new",function(t){var e=t.interactable;e.events.getRect=function(t){return e.getRect(t)}}),i.signals.on("set",function(t){var e=t.interactable,n=t.options;a(e.events.options,r.defaults),a(e.events.options,n)}),l(i.eventTypes,r.types),i.prototype.pointerEvents=function(t){return a(this.events.options,t),this};var p=i.prototype._backCompatOption;i.prototype._backCompatOption=function(t,e){var n=p.call(this,t,e);return n===this&&(this.events.options[t]=e),n},i.settingsMethods.push("pointerEvents")},{"../Interactable":4,"../scope":33,"../utils/arr":35,"../utils/extend":41,"../utils/is":46,"./base":30}],33:[function(t,e,n){"use strict";var r=t("./utils"),i=t("./utils/events"),o=t("./utils/Signals").new(),s=t("./utils/window"),a=s.getWindow,c={signals:o,events:i,utils:r,document:t("./utils/domObjects").document,documents:[],addDocument:function(t,e){if(r.contains(c.documents,t))return!1;e=e||a(t),c.documents.push(t),i.documents.push(t),t!==c.document&&i.add(e,"unload",c.onWindowUnload),o.fire("add-document",{doc:t,win:e})},removeDocument:function(t,e){var n=c.documents.indexOf(t);e=e||a(t),i.remove(e,"unload",c.onWindowUnload),c.documents.splice(n,1),i.documents.splice(n,1),o.fire("remove-document",{win:e,doc:t})},onWindowUnload:function(){c.removeDocument(this.document,this)}};e.exports=c},{"./utils":44,"./utils/Signals":34,"./utils/domObjects":38,"./utils/events":40,"./utils/window":52}],34:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function t(){r(this,t),this.listeners={}}return t.prototype.on=function(t,e){if(!this.listeners[t])return void(this.listeners[t]=[e]);this.listeners[t].push(e)},t.prototype.off=function(t,e){if(this.listeners[t]){var n=this.listeners[t].indexOf(e);-1!==n&&this.listeners[t].splice(n,1)}},t.prototype.fire=function(t,e){var n=this.listeners[t];if(n)for(var r=0;r<n.length;r++){var i;i=n[r];var o=i;if(!1===o(e,t))return}},t}();i.new=function(){return new i},e.exports=i},{}],35:[function(t,e,n){"use strict";function r(t,e){return-1!==t.indexOf(e)}function i(t,e){for(var n=0;n<e.length;n++){var r;r=e[n];var i=r;t.push(i)}return t}e.exports={contains:r,merge:i}},{}],36:[function(t,e,n){"use strict";var r=t("./window"),i=r.window,o=t("./is"),s=t("./domObjects"),a=s.Element,c=i.navigator,l={supportsTouch:!!("ontouchstart"in i||o.function(i.DocumentTouch)&&s.document instanceof i.DocumentTouch),supportsPointerEvent:!!s.PointerEvent,isIOS:/iP(hone|od|ad)/.test(c.platform),isIOS7:/iP(hone|od|ad)/.test(c.platform)&&/OS 7[^\d]/.test(c.appVersion),isIe9:/MSIE 9/.test(c.userAgent),prefixedMatchesSelector:"matches"in a.prototype?"matches":"webkitMatchesSelector"in a.prototype?"webkitMatchesSelector":"mozMatchesSelector"in a.prototype?"mozMatchesSelector":"oMatchesSelector"in a.prototype?"oMatchesSelector":"msMatchesSelector",pEventTypes:s.PointerEvent?s.PointerEvent===i.MSPointerEvent?{up:"MSPointerUp",down:"MSPointerDown",over:"mouseover",out:"mouseout",move:"MSPointerMove",cancel:"MSPointerCancel"}:{up:"pointerup",down:"pointerdown",over:"pointerover",out:"pointerout",move:"pointermove",cancel:"pointercancel"}:null,wheelEvent:"onmousewheel"in s.document?"mousewheel":"wheel"};l.isOperaMobile="Opera"===c.appName&&l.supportsTouch&&c.userAgent.match("Presto"),e.exports=l},{"./domObjects":38,"./is":46,"./window":52}],37:[function(t,e,n){"use strict";var r=t("./is");e.exports=function t(e){var n={};for(var i in e)r.plainObject(e[i])?n[i]=t(e[i]):n[i]=e[i];return n}},{"./is":46}],38:[function(t,e,n){"use strict";function r(){}var i={},o=t("./window").window;i.document=o.document,i.DocumentFragment=o.DocumentFragment||r,i.SVGElement=o.SVGElement||r,i.SVGSVGElement=o.SVGSVGElement||r,i.SVGElementInstance=o.SVGElementInstance||r,i.Element=o.Element||r,i.HTMLElement=o.HTMLElement||i.Element,i.Event=o.Event,i.Touch=o.Touch||r,i.PointerEvent=o.PointerEvent||o.MSPointerEvent,e.exports=i},{"./window":52}],39:[function(t,e,n){"use strict";var r=t("./window"),i=t("./browser"),o=t("./is"),s=t("./domObjects"),a={nodeContains:function(t,e){for(;e;){if(e===t)return!0;e=e.parentNode}return!1},closest:function(t,e){for(;o.element(t);){if(a.matchesSelector(t,e))return t;t=a.parentNode(t)}return null},parentNode:function(t){var e=t.parentNode;if(o.docFrag(e)){for(;(e=e.host)&&o.docFrag(e););return e}return e},matchesSelector:function(t,e){return r.window!==r.realWindow&&(e=e.replace(/\/deep\//g," ")),t[i.prefixedMatchesSelector](e)},indexOfDeepestElement:function(t){var e=[],n=[],r=void 0,i=t[0],o=i?0:-1,a=void 0,c=void 0,l=void 0,p=void 0;for(l=1;l<t.length;l++)if((r=t[l])&&r!==i)if(i){if(r.parentNode!==r.ownerDocument)if(i.parentNode!==r.ownerDocument){if(!e.length)for(a=i;a.parentNode&&a.parentNode!==a.ownerDocument;)e.unshift(a),a=a.parentNode;if(i instanceof s.HTMLElement&&r instanceof s.SVGElement&&!(r instanceof s.SVGSVGElement)){if(r===i.parentNode)continue;a=r.ownerSVGElement}else a=r;for(n=[];a.parentNode!==a.ownerDocument;)n.unshift(a),a=a.parentNode;for(p=0;n[p]&&n[p]===e[p];)p++;var u=[n[p-1],n[p],e[p]];for(c=u[0].lastChild;c;){if(c===u[1]){i=r,o=l,e=[];break}if(c===u[2])break;c=c.previousSibling}}else i=r,o=l}else i=r,o=l;return o},matchesUpTo:function(t,e,n){for(;o.element(t);){if(a.matchesSelector(t,e))return!0;if((t=a.parentNode(t))===n)return a.matchesSelector(t,e)}return!1},getActualElement:function(t){return t instanceof s.SVGElementInstance?t.correspondingUseElement:t},getScrollXY:function(t){return t=t||r.window,{x:t.scrollX||t.document.documentElement.scrollLeft,y:t.scrollY||t.document.documentElement.scrollTop}},getElementClientRect:function(t){var e=t instanceof s.SVGElement?t.getBoundingClientRect():t.getClientRects()[0];return e&&{left:e.left,right:e.right,top:e.top,bottom:e.bottom,width:e.width||e.right-e.left,height:e.height||e.bottom-e.top}},getElementRect:function(t){var e=a.getElementClientRect(t);if(!i.isIOS7&&e){var n=a.getScrollXY(r.getWindow(t));e.left+=n.x,e.right+=n.x,e.top+=n.y,e.bottom+=n.y}return e},getPath:function(t){for(var e=[];t;)e.push(t),t=a.parentNode(t);return e},trySelector:function(t){return!!o.string(t)&&(s.document.querySelector(t),!0)}};e.exports=a},{"./browser":36,"./domObjects":38,"./is":46,"./window":52}],40:[function(t,e,n){"use strict";function r(t,e,n,r){var i=p(r),o=x.indexOf(t),s=b[o];s||(s={events:{},typeCount:0},o=x.push(t)-1,b.push(s)),s.events[e]||(s.events[e]=[],s.typeCount++),y(s.events[e],n)||(t.addEventListener(e,n,T?i:!!i.capture),s.events[e].push(n))}function i(t,e,n,r){var o=p(r),s=x.indexOf(t),a=b[s];if(a&&a.events)if("all"!==e){if(a.events[e]){var c=a.events[e].length;if("all"===n){for(var l=0;l<c;l++)i(t,e,a.events[e][l],o);return}for(var u=0;u<c;u++)if(a.events[e][u]===n){t.removeEventListener("on"+e,n,T?o:!!o.capture),a.events[e].splice(u,1);break}a.events[e]&&0===a.events[e].length&&(a.events[e]=null,a.typeCount--)}a.typeCount||(b.splice(s,1),x.splice(s,1))}else for(e in a.events)a.events.hasOwnProperty(e)&&i(t,e,"all")}function o(t,e,n,i,o){var s=p(o);if(!w[n]){w[n]={selectors:[],contexts:[],listeners:[]};for(var l=0;l<E.length;l++){var u=E[l];r(u,n,a),r(u,n,c,!0)}}var d=w[n],f=void 0;for(f=d.selectors.length-1;f>=0&&(d.selectors[f]!==t||d.contexts[f]!==e);f--);-1===f&&(f=d.selectors.length,d.selectors.push(t),d.contexts.push(e),d.listeners.push([])),d.listeners[f].push([i,!!s.capture,s.passive])}function s(t,e,n,r,o){var s=p(o),l=w[n],u=!1,d=void 0;if(l)for(d=l.selectors.length-1;d>=0;d--)if(l.selectors[d]===t&&l.contexts[d]===e){for(var f=l.listeners[d],v=f.length-1;v>=0;v--){var g=f[v],h=g[0],m=g[1],y=g[2];if(h===r&&m===!!s.capture&&y===s.passive){f.splice(v,1),f.length||(l.selectors.splice(d,1),l.contexts.splice(d,1),l.listeners.splice(d,1),i(e,n,a),i(e,n,c,!0),l.selectors.length||(w[n]=null)),u=!0;break}}if(u)break}}function a(t,e){var n=p(e),r={},i=w[t.type],o=f.getEventTargets(t),s=o[0],a=s;for(v(r,t),r.originalEvent=t,r.preventDefault=l;u.element(a);){for(var c=0;c<i.selectors.length;c++){var g=i.selectors[c],h=i.contexts[c];if(d.matchesSelector(a,g)&&d.nodeContains(h,s)&&d.nodeContains(h,a)){var m=i.listeners[c];r.currentTarget=a;for(var y=0;y<m.length;y++){var x=m[y],b=x[0],E=x[1],T=x[2];E===!!n.capture&&T===n.passive&&b(r)}}}a=d.parentNode(a)}}function c(t){return a.call(this,t,!0)}function l(){this.originalEvent.preventDefault()}function p(t){return u.object(t)?t:{capture:t}}var u=t("./is"),d=t("./domUtils"),f=t("./pointerUtils"),v=t("./pointerExtend"),g=t("./window"),h=g.window,m=t("./arr"),y=m.contains,x=[],b=[],w={},E=[],T=function(){var t=!1;return h.document.createElement("div").addEventListener("test",null,{get capture(){t=!0}}),t}();e.exports={add:r,remove:i,addDelegate:o,removeDelegate:s,delegateListener:a,delegateUseCapture:c,delegatedEvents:w,documents:E,supportsOptions:T,_elements:x,_targets:b}},{"./arr":35,"./domUtils":39,"./is":46,"./pointerExtend":48,"./pointerUtils":49,"./window":52}],41:[function(t,e,n){"use strict";e.exports=function(t,e){for(var n in e)t[n]=e[n];return t}},{}],42:[function(t,e,n){"use strict";var r=t("./rect"),i=r.resolveRectLike,o=r.rectToXY;e.exports=function(t,e,n){var r=t.options[n],s=r&&r.origin,a=s||t.options.origin,c=i(a,t,e,[t&&e]);return o(c)||{x:0,y:0}}},{"./rect":51}],43:[function(t,e,n){"use strict";e.exports=function(t,e){return Math.sqrt(t*t+e*e)}},{}],44:[function(t,e,n){"use strict";var r=t("./extend"),i=t("./window"),o={warnOnce:function(t,e){var n=!1;return function(){return n||(i.window.console.warn(e),n=!0),t.apply(this,arguments)}},_getQBezierValue:function(t,e,n,r){var i=1-t;return i*i*e+2*i*t*n+t*t*r},getQuadraticCurvePoint:function(t,e,n,r,i,s,a){return{x:o._getQBezierValue(a,t,n,i),y:o._getQBezierValue(a,e,r,s)}},easeOutQuad:function(t,e,n,r){return t/=r,-n*t*(t-2)+e},copyAction:function(t,e){return t.name=e.name,t.axis=e.axis,t.edges=e.edges,t},is:t("./is"),extend:r,hypot:t("./hypot"),getOriginXY:t("./getOriginXY")};r(o,t("./arr")),r(o,t("./domUtils")),r(o,t("./pointerUtils")),r(o,t("./rect")),e.exports=o},{"./arr":35,"./domUtils":39,"./extend":41,"./getOriginXY":42,"./hypot":43,"./is":46,"./pointerUtils":49,"./rect":51,"./window":52}],45:[function(t,e,n){"use strict";var r=t("../scope"),i=t("./index"),o={methodOrder:["simulationResume","mouseOrPen","hasPointer","idle"],search:function(t,e,n){for(var r=i.getPointerType(t),s=i.getPointerId(t),a={pointer:t,pointerId:s,pointerType:r,eventType:e,eventTarget:n},c=0;c<o.methodOrder.length;c++){var l;l=o.methodOrder[c];var p=l,u=o[p](a);if(u)return u}},simulationResume:function(t){var e=t.pointerType,n=t.eventType,o=t.eventTarget;if(!/down|start/i.test(n))return null;for(var s=0;s<r.interactions.length;s++){var a;a=r.interactions[s];var c=a,l=o;if(c.simulation&&c.simulation.allowResume&&c.pointerType===e)for(;l;){if(l===c.element)return c;l=i.parentNode(l)}}return null},mouseOrPen:function(t){var e=t.pointerId,n=t.pointerType,o=t.eventType;if("mouse"!==n&&"pen"!==n)return null;for(var s=void 0,a=0;a<r.interactions.length;a++){var c;c=r.interactions[a];var l=c;if(l.pointerType===n){if(l.simulation&&!i.contains(l.pointerIds,e))continue;if(l.interacting())return l;s||(s=l)}}if(s)return s;for(var p=0;p<r.interactions.length;p++){var u;u=r.interactions[p];var d=u;if(!(d.pointerType!==n||/down/i.test(o)&&d.simulation))return d}return null},hasPointer:function(t){for(var e=t.pointerId,n=0;n<r.interactions.length;n++){var o;o=r.interactions[n];var s=o;if(i.contains(s.pointerIds,e))return s}},idle:function(t){for(var e=t.pointerType,n=0;n<r.interactions.length;n++){var i;i=r.interactions[n];var o=i;if(1===o.pointerIds.length){var s=o.target;if(s&&!s.options.gesture.enabled)continue}else if(o.pointerIds.length>=2)continue;if(!o.interacting()&&e===o.pointerType)return o}return null}};e.exports=o},{"../scope":33,"./index":44}],46:[function(t,e,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=t("./window"),o=t("./isWindow"),s={array:function(){},window:function(t){return t===i.window||o(t)},docFrag:function(t){return s.object(t)&&11===t.nodeType},object:function(t){return!!t&&"object"===(void 0===t?"undefined":r(t))},function:function(t){return"function"==typeof t},number:function(t){return"number"==typeof t},bool:function(t){return"boolean"==typeof t},string:function(t){return"string"==typeof t},element:function(t){if(!t||"object"!==(void 0===t?"undefined":r(t)))return!1;var e=i.getWindow(t)||i.window;return/object|function/.test(r(e.Element))?t instanceof e.Element:1===t.nodeType&&"string"==typeof t.nodeName},plainObject:function(t){return s.object(t)&&"Object"===t.constructor.name}};s.array=function(t){return s.object(t)&&void 0!==t.length&&s.function(t.splice)},e.exports=s},{"./isWindow":47,"./window":52}],47:[function(t,e,n){"use strict";e.exports=function(t){return!(!t||!t.Window)&&t instanceof t.Window}},{}],48:[function(t,e,n){"use strict";function r(t,n){for(var r in n){var i=e.exports.prefixedPropREs,o=!1;for(var s in i)if(0===r.indexOf(s)&&i[s].test(r)){o=!0;break}o||"function"==typeof n[r]||(t[r]=n[r])}return t}r.prefixedPropREs={webkit:/(Movement[XY]|Radius[XY]|RotationAngle|Force)$/},e.exports=r},{}],49:[function(t,e,n){"use strict";var r=t("./hypot"),i=t("./browser"),o=t("./domObjects"),s=t("./domUtils"),a=t("./domObjects"),c=t("./is"),l=t("./pointerExtend"),p={copyCoords:function(t,e){t.page=t.page||{},t.page.x=e.page.x,t.page.y=e.page.y,t.client=t.client||{},t.client.x=e.client.x,t.client.y=e.client.y,t.timeStamp=e.timeStamp},setCoordDeltas:function(t,e,n){t.page.x=n.page.x-e.page.x,t.page.y=n.page.y-e.page.y,t.client.x=n.client.x-e.client.x,t.client.y=n.client.y-e.client.y,t.timeStamp=n.timeStamp-e.timeStamp;var i=Math.max(t.timeStamp/1e3,.001);t.page.speed=r(t.page.x,t.page.y)/i,t.page.vx=t.page.x/i,t.page.vy=t.page.y/i,t.client.speed=r(t.client.x,t.page.y)/i,t.client.vx=t.client.x/i,t.client.vy=t.client.y/i},isNativePointer:function(t){return t instanceof o.Event||t instanceof o.Touch},getXY:function(t,e,n){return n=n||{},t=t||"page",n.x=e[t+"X"],n.y=e[t+"Y"],n},getPageXY:function(t,e){return e=e||{},i.isOperaMobile&&p.isNativePointer(t)?(p.getXY("screen",t,e),e.x+=window.scrollX,e.y+=window.scrollY):p.getXY("page",t,e),e},getClientXY:function(t,e){return e=e||{},i.isOperaMobile&&p.isNativePointer(t)?p.getXY("screen",t,e):p.getXY("client",t,e),e},getPointerId:function(t){return c.number(t.pointerId)?t.pointerId:t.identifier},setCoords:function(t,e,n){var r=e.length>1?p.pointerAverage(e):e[0],i={};p.getPageXY(r,i),t.page.x=i.x,t.page.y=i.y,p.getClientXY(r,i),t.client.x=i.x,t.client.y=i.y,t.timeStamp=c.number(n)?n:(new Date).getTime()},pointerExtend:l,getTouchPair:function(t){var e=[];return c.array(t)?(e[0]=t[0],e[1]=t[1]):"touchend"===t.type?1===t.touches.length?(e[0]=t.touches[0],e[1]=t.changedTouches[0]):0===t.touches.length&&(e[0]=t.changedTouches[0],e[1]=t.changedTouches[1]):(e[0]=t.touches[0],e[1]=t.touches[1]),e},pointerAverage:function(t){for(var e={pageX:0,pageY:0,clientX:0,clientY:0,screenX:0,screenY:0},n=0;n<t.length;n++){var r;r=t[n];var i=r;for(var o in e)e[o]+=i[o]}for(var s in e)e[s]/=t.length;return e},touchBBox:function(t){if(t.length||t.touches&&t.touches.length>1){var e=p.getTouchPair(t),n=Math.min(e[0].pageX,e[1].pageX),r=Math.min(e[0].pageY,e[1].pageY);return{x:n,y:r,left:n,top:r,width:Math.max(e[0].pageX,e[1].pageX)-n,height:Math.max(e[0].pageY,e[1].pageY)-r}}},touchDistance:function(t,e){var n=e+"X",i=e+"Y",o=p.getTouchPair(t),s=o[0][n]-o[1][n],a=o[0][i]-o[1][i];return r(s,a)},touchAngle:function(t,e,n){var r=n+"X",i=n+"Y",o=p.getTouchPair(t),s=o[1][r]-o[0][r],a=o[1][i]-o[0][i];return 180*Math.atan2(a,s)/Math.PI},getPointerType:function(t){return c.string(t.pointerType)?t.pointerType:c.number(t.pointerType)?[void 0,void 0,"touch","pen","mouse"][t.pointerType]:/touch/.test(t.type)||t instanceof a.Touch?"touch":"mouse"},getEventTargets:function(t){var e=c.function(t.composedPath)?t.composedPath():t.path;return[s.getActualElement(e?e[0]:t.target),s.getActualElement(t.currentTarget)]}};e.exports=p},{"./browser":36,"./domObjects":38,"./domUtils":39,"./hypot":43,"./is":46,"./pointerExtend":48}],50:[function(t,e,n){"use strict";for(var r=t("./window"),i=r.window,o=["ms","moz","webkit","o"],s=0,a=void 0,c=void 0,l=0;l<o.length&&!i.requestAnimationFrame;l++)a=i[o[l]+"RequestAnimationFrame"],c=i[o[l]+"CancelAnimationFrame"]||i[o[l]+"CancelRequestAnimationFrame"];a||(a=function(t){var e=(new Date).getTime(),n=Math.max(0,16-(e-s)),r=setTimeout(function(){t(e+n)},n);return s=e+n,r}),c||(c=function(t){clearTimeout(t)}),e.exports={request:a,cancel:c}},{"./window":52}],51:[function(t,e,n){"use strict";var r=t("./extend"),i=t("./is"),o=t("./domUtils"),s=o.closest,a=o.parentNode,c=o.getElementRect,l={getStringOptionResult:function(t,e,n){return i.string(t)?t="parent"===t?a(n):"self"===t?e.getRect(n):s(n,t):null},resolveRectLike:function(t,e,n,r){return t=l.getStringOptionResult(t,e,n)||t,i.function(t)&&(t=t.apply(null,r)),i.element(t)&&(t=c(t)),t},rectToXY:function(t){return t&&{x:"x"in t?t.x:t.left,y:"y"in t?t.y:t.top}},xywhToTlbr:function(t){return!t||"left"in t&&"top"in t||(t=r({},t),t.left=t.x||0,t.top=t.y||0,t.right=t.right||t.left+t.width,t.bottom=t.bottom||t.top+t.height),t},tlbrToXywh:function(t){return!t||"x"in t&&"y"in t||(t=r({},t),t.x=t.left||0,t.top=t.top||0,t.width=t.width||t.right-t.x,t.height=t.height||t.bottom-t.y),t}};e.exports=l},{"./domUtils":39,"./extend":41,"./is":46}],52:[function(t,e,n){"use strict";function r(t){i.realWindow=t;var e=t.document.createTextNode("");e.ownerDocument!==t.document&&"function"==typeof t.wrap&&t.wrap(e)===e&&(t=t.wrap(t)),i.window=t}var i=e.exports,o=t("./isWindow");"undefined"==typeof window?(i.window=void 0,i.realWindow=void 0):r(window),i.getWindow=function(t){if(o(t))return t;var e=t.ownerDocument||t;return e.defaultView||e.parentWindow||i.window},i.init=r},{"./isWindow":47}]},{},[1])(1)});

//# sourceMappingURL=interact.min.js.map

// Generated by LiveScript 1.3.1
var xfl;
xfl = {
  fonts: {},
  isCJK: function(){
    return (code >= 0xff00 && code <= 0xffef) || (code >= 0x4e00 && code <= 0x9fff);
  },
  load: function(path, options, callback){
    var ref$, cb, ext, name, slug, font, format, xhr, this$ = this;
    options == null && (options = {});
    if (!path) {
      return;
    }
    ref$ = [path.replace(/\/$/, ''), typeof options === 'function' ? options : callback], path = ref$[0], cb = ref$[1];
    if (this.fonts[path]) {
      return cb ? cb(this.fonts[path]) : null;
    }
    ref$ = [
      ((/\.([a-zA-Z0-9]+)$/.exec(path) || [])[1] || '').toLowerCase(), options.fontName || (ref$ = path.replace(/\.[a-zA-Z0-9]+$/, '').split("/").filter(function(it){
        return it;
      }))[ref$.length - 1], options.fontName || Math.random().toString(16).substring(2)
    ], ext = ref$[0], name = ref$[1], slug = ref$[2];
    this.fonts[path] = font = {
      name: name,
      path: path,
      options: options,
      className: "xfl-" + slug,
      codeToSet: {},
      hit: {},
      url: {},
      ext: ext && ~['woff2', 'woff', 'eot', 'ttf', 'otf'].indexOf(ext) ? ext : null
    };
    font.ajax = function(idxlist, cb){
      var check, this$ = this;
      check = function(){
        if (idxlist.map(function(it){
          return this$.url[it];
        }).filter(function(it){
          return it;
        }).length === idxlist.length) {
          return cb();
        }
      };
      return idxlist.map(function(d, i){
        var xhr;
        if (this$.url[d]) {
          return check();
        }
        xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', function(){
          if (xhr.readyState !== 4) {
            return;
          }
          this$.url[d] = URL.createObjectURL(xhr.response);
          return check();
        });
        xhr.open('GET', path + "/" + d + ".ttf");
        xhr.responseType = 'blob';
        return xhr.send();
      });
    };
    font.sync = function(txt, cb){
      var ref$, misschar, missset, i$, to$, i, code, setIdx, k, this$ = this;
      txt == null && (txt = "");
      if (this.nosync) {
        return cb ? cb() : '';
      }
      ref$ = [{}, {}], misschar = ref$[0], missset = ref$[1];
      for (i$ = 0, to$ = txt.length; i$ < to$; ++i$) {
        i = i$;
        code = txt.charCodeAt(i);
        if (options.cjkOnly && !xfl.isCJK(code)) {
          continue;
        }
        setIdx = this.codeToSet[code.toString(16)];
        if (!setIdx) {
          misschar[txt[i]] = true;
        } else if (!this.hit[setIdx]) {
          this.hit[setIdx] = missset[setIdx] = true;
        }
      }
      misschar = (function(){
        var results$ = [];
        for (k in misschar) {
          results$.push(k);
        }
        return results$;
      }()).filter(function(it){
        return it.trim();
      });
      if (misschar.length) {
        console.log("not supported chars: " + misschar.join(''));
      }
      return this.ajax((function(){
        var results$ = [];
        for (k in missset) {
          results$.push(k);
        }
        return results$;
      }()), function(){
        var k, ref$, css, idxlist, i$, len$, idx, url, names;
        ref$ = [
          "", (function(){
            var results$ = [];
            for (k in this.hit) {
              results$.push(k);
            }
            return results$;
          }.call(this$))
        ], css = ref$[0], idxlist = ref$[1];
        for (i$ = 0, len$ = idxlist.length; i$ < len$; ++i$) {
          idx = idxlist[i$];
          url = this$.url[idx] || path + "/" + idx + ".woff2";
          css += "@font-face {\n  font-family: " + name + ";\n  src: url(" + url + ") format('woff2');\n}";
        }
        names = idxlist.map(function(it){
          return name + "-" + it;
        }).join(',');
        css += "." + this$.className + " { font-family: " + name + "; }";
        this$.css = css;
        xfl.update();
        if (cb) {
          return cb();
        }
      });
    };
    if (font.ext) {
      font.nosync = true;
      format = font.ext && font.ext !== 'ttf' ? "format('" + font.ext + "')" : '';
      font.css = "@font-face {\n  font-family: " + name + ";\n  src: url(" + path + ") " + format + ";\n}\n." + font.className + " { font-family: \"" + name + "\"; }";
      xfl.update();
      if (cb) {
        return cb(font);
      }
    } else {
      xhr = new XMLHttpRequest();
      xhr.addEventListener('readystatechange', function(){
        var hash;
        if (xhr.readyState !== 4) {
          return;
        }
        hash = {};
        xhr.responseText.split('\n').map(function(d, i){
          return d.split(' ').map(function(e, j){
            return hash[e] = i + 1;
          });
        });
        font.codeToSet = hash;
        if (cb) {
          return cb(font);
        }
      });
      xhr.open('GET', path + "/charmap.txt");
      return xhr.send();
    }
  },
  update: function(){
    var css, k, v, node;
    css = (function(){
      var ref$, results$ = [];
      for (k in ref$ = xfl.fonts) {
        v = ref$[k];
        results$.push(v.css || '');
      }
      return results$;
    }()).join('\n');
    node = xfl.node || document.createElement("style");
    node.textContent = css;
    if (xfl.node) {
      return;
    }
    node.setAttribute('type', 'text/css');
    document.body.appendChild(node);
    return xfl.node = node;
  }
};
// Generated by LiveScript 1.3.1
var choosefont;
choosefont = function(arg$){
  var node, metaUrl, type, wrapper, itemClass, cols, base;
  node = arg$.node, metaUrl = arg$.metaUrl, type = arg$.type, wrapper = arg$.wrapper, itemClass = arg$.itemClass, cols = arg$.cols, base = arg$.base;
  if (node != null) {
    node = typeof node === 'string' ? document.querySelector(node) : node;
    node.classList.add('choosefont');
  }
  this.node = node;
  this.metaUrl = metaUrl;
  this.type = type;
  this.wrapper = wrapper;
  this.itemClass = itemClass;
  this.cols = cols;
  this.base = base;
  if (!this.cols) {
    this.cols = 4;
  }
  return this;
};
choosefont.prototype = {
  wrap: function(font, idx){
    if (this.wrapper) {
      return this.wrapper(font, idx);
    }
    if (!this.type || this.type === 'grid' || this.type === 'list') {
      return font.html = "<div class=\"item " + (this.itemClass || '') + "\" data-idx=\"" + idx + "\"><div class=\"inner\">\n  <div class=\"img\" style=\"background-position:" + font.x + "px " + font.y + "px\"></div>\n  <span>" + font.name + "</span>\n</div></div>";
    }
  },
  filter: function(arg$){
    var name, category, list;
    name = arg$.name, category = arg$.category;
    name = (name || '').toLowerCase();
    list = this.fonts.list.filter(function(it){
      return (!name || ~it.name.toLowerCase().indexOf(name)) && (!category || (it.category || []).filter(function(it){
        return ~(it || '').indexOf(category);
      }).length);
    });
    return this.render(list);
  },
  clusterize: function(html){
    if (!(typeof Clusterize != 'undefined' && Clusterize !== null)) {
      this.node.innerHTML = html.join('');
      return;
    }
    if (!this.cluster) {
      this.node.classList.add('clusterize-scroll');
      this.node.innerHTML = '<div class="clusterize-content"></div>';
      this.cluster = new Clusterize({
        html: [],
        scrollElem: this.node,
        contentElem: this.node.querySelector('.clusterize-content'),
        rows_in_block: 50
      });
    }
    return this.cluster.update(html);
  },
  find: function(names){
    var this$ = this;
    names == null && (names = []);
    return names.map(function(it){
      return it.split('-').filter(function(it){
        return it;
      });
    }).map(function(it){
      return [this$.fonts.hash[it[0]], it[1]];
    }).filter(function(it){
      return it[0];
    });
  },
  load: function(font){
    var family, path, this$ = this;
    family = !font.family.length
      ? ""
      : "-" + (font.family.indexOf('Regular')
        ? 'Regular'
        : font.family[0]);
    path = this.base + "/" + font.name + family + (font.isSet ? '/' : '.ttf');
    if (typeof xfl != 'undefined' && xfl !== null) {
      return xfl.load(path, function(it){
        return this$.fire('choose', it);
      });
    } else {
      return this.fire('choose.map', font);
    }
  },
  prepare: function(){
    var i$, to$, idx, font, this$ = this;
    if (this.node) {
      this.node.addEventListener('click', function(e){
        var idx, font;
        idx = e.target.getAttribute('data-idx');
        font = this$.fonts.list[idx];
        if (!font) {
          return;
        }
        return this$.load(font);
      });
    }
    this.fonts = {
      list: this.meta.fonts,
      hash: {}
    };
    for (i$ = 0, to$ = this.meta.fonts.length; i$ < to$; ++i$) {
      idx = i$;
      font = this.meta.fonts[idx];
      this.fonts.hash[font.name] = import$(font, {
        x: -(idx % this.meta.dim.col) * this.meta.dim.width,
        y: -Math.floor(idx / this.meta.dim.col) * this.meta.dim.height
      });
      this.wrap(font, idx);
    }
    return this.render();
  },
  render: function(list){
    var ref$, html, line, i$, to$, idx;
    if (!this.node) {
      return;
    }
    if (!list) {
      list = this.fonts.list;
    }
    if (this.type === 'grid' || !this.type) {
      ref$ = [[], []], html = ref$[0], line = ref$[1];
      for (i$ = 0, to$ = list.length; i$ < to$; ++i$) {
        idx = i$;
        line.push(list[idx].html);
        if (line.length >= this.cols) {
          html.push(line);
          line = [];
        }
      }
      if (line.length) {
        html.push(line);
      }
      return this.clusterize(html.map(function(it){
        return "<div class=\"line\"><div class=\"inner\">" + it.join('') + "</div></div>";
      }));
    } else if (this.type === 'list') {
      return this.clusterize(list.map(function(it){
        return it.html;
      }));
    }
  },
  on: function(name, cb){
    var ref$;
    return ((ref$ = this.handler || (this.handler = {}))[name] || (ref$[name] = [])).push(cb);
  },
  fire: function(name, payload){
    var ref$;
    return ((ref$ = this.handler || (this.handler = {}))[name] || (ref$[name] = [])).map(function(it){
      return it(payload);
    });
  },
  init: function(cb){
    var xhr, this$ = this;
    if (!cb) {
      cb = function(){};
    }
    if (!this.metaUrl) {
      return cb(null);
    }
    xhr = new XMLHttpRequest();
    xhr.addEventListener('readystatechange', function(){
      if (xhr.readyState !== 4) {
        return;
      }
      this$.meta = JSON.parse(xhr.responseText);
      this$.prepare();
      if (cb) {
        return cb();
      }
    });
    xhr.open('GET', this.metaUrl);
    return xhr.send();
  }
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
function import$(t,e){var n={}.hasOwnProperty;for(var i in e)n.call(e,i)&&(t[i]=e[i]);return t}var mediumEditorAlignExtention;mediumEditorAlignExtention={},function(){var t;return t=function(t){return{name:"align-"+t,init:function(){return this.button=this.document.createElement("button"),this.button.classList.add("medium-editor-action"),this.button.innerHTML='<i class="fa fa-align-'+t+'"></i>',this.on(this.button,"click",this.handleClick.bind(this))},getButton:function(){return this.button},handleClick:function(){var e,n,i,o,r,d;if(e=window.getSelection(),e.rangeCount){for(n=e.getRangeAt(0),i=[n.startContainer,n.endContainer],o=Math.random();i[0]&&i[1]&&(i[0]!==i[1]||3===i[0].nodeType)&&i[0].seed!==o&&i[1].seed!==o;)i[0].seed=o,i[1].seed=o,i=[i[0].parentNode,i[1].parentNode];if(i[0]){for(i=(i[1].seed=o)?i[1]:i[0];i&&(r=window.getComputedStyle(i).textAlign,d=window.getComputedStyle(i).display,(r===t||"inline-block"!==d)&&"block"!==d);)i=i.parentNode;return i.style.textAlign=t,this.trigger("editableInput",{},i)}}}}},import$(mediumEditorAlignExtention,{left:new(MediumEditor.Extension.extend(t("left"))),center:new(MediumEditor.Extension.extend(t("center"))),right:new(MediumEditor.Extension.extend(t("right")))})}();
function import$(e,t){var o={}.hasOwnProperty;for(var n in t)o.call(t,n)&&(e[n]=t[n]);return e}var mediumEditorStyleExtension;mediumEditorStyleExtension={},function(){var e,t;return e=["#212121","#8E8E8E","#C2C4C5","#ffffff","#F44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4","#009688","#4CAF50","#8BC34A","#CDDC39","#FFEB3B","#FFC107","#FF9800","#FF5722","#795548","#607D8B","rgba(255,255,255,0)"],t=function(t){return null==t&&(t={}),{name:t.name,init:function(){var e=this;return this.button=this.document.createElement("button"),this.button.classList.add("medium-editor-action","editor-"+t.name+"-picker","editor-image-button"),this.button.innerHTML=t.icon,this.on(this.button,"click",function(t){return e.handleClick(t)})},getButton:function(){return this.button},handleClick:function(o){var n,r,i,d,a,s,l=this;if(o.preventDefault(),o.stopPropagation(),this.selectionState=this.base.exportSelection(),n=vanillaColorPicker(this.document.querySelector(".medium-editor-toolbar-active .editor-"+t.name+"-picker").parentNode),r=window.getSelection(),r.rangeCount){if(i=r.getRangeAt(0),d=[i.startContainer,i.endContainer],a=i.startContainer,!t.command||0===i.startOffset&&i.endOffset===(3===d[1].nodeType?d[1].length:d[1].childNodes.length)){for(s=Math.random();d[0]&&d[1]&&(d[0]!==d[1]||3===d[0].nodeType)&&d[0].seed!==s&&d[1].seed!==s;)d[0].seed=s,d[1].seed=s,d=[d[0].parentNode,d[1].parentNode];if(!d[0])return;d=d[1].seed===s?d[1]:d[0]}else d=null;return n.set("customColors",e),n.set("positionOnTop"),n.openPicker(),n.on("colorChosen",function(e){var o;return l.base.importSelection(l.selectionState),d?(d.style[t.style]=e,/border/.exec(t.name)&&(o=window.getComputedStyle(d).borderWidth,d.style.borderWidth="1px",d.style.borderStyle="solid"),void l.trigger("editableInput",{},d)):t.command?(l.base.importSelection(l.selectionState),l.document.execCommand("styleWithCSS",!1,!0),l.document.execCommand(t.command,!1,e),l.trigger("editableInput",{},a.getAttribute?a:a.parentNode)):void 0})}}}},import$(mediumEditorStyleExtension,{backColor:MediumEditor.Extension.extend(t({name:"backColor",style:"background",icon:'<div style="background-image:url(/assets/img/page/medium/backColor.svg"></div>',command:"backColor"})),foreColor:MediumEditor.Extension.extend(t({name:"foreColor",style:"color",icon:'<div style="background-image:url(/assets/img/page/medium/foreColor.svg"></div>',command:"foreColor"})),borderColor:MediumEditor.Extension.extend(t({name:"borderColor",style:"borderColor",icon:'<div style="background-image:url(/assets/img/page/medium/borderColor.svg"></div>',command:null}))})}();
var mediumEditorFontsizeExtension;mediumEditorFontsizeExtension={},function(){var t;return t={name:"font-size",init:function(t){var e,i=this;return console.log("inited"),this.button=this.document.createElement("button"),this.button.classList.add("medium-editor-action","medium-editor-font-size"),this.button.innerHTML="<span style='font-family:serif;'>T<small style='font-size:0.7em'>T</small></span>",this.on(this.button,"click",function(t){return i.handleClick(t)}),this.div=e=document.createElement("div"),e.classList.add("medium-editor-font-size-list","medium-editor-sublist"),document.body.appendChild(e),e.innerHTML=["<div class='list'>","<div class='item'>Auto</div>"].concat(function(){var e,i,n,o=[];for(e=0,n=(i=[12,14,18,24,30,36,48,60,72,96]).length;n>e;++e)t=i[e],o.push("<div class='item' data-size='"+t+"'>"+t+"px</div>");return o}(),["</div>"]).join(""),this.subscribe("hideToolbar",function(){return i.div.style.display="none"}),e.style.display="none",e.addEventListener("click",function(t){var n,o,s;if(t.target&&t.target.getAttribute){for(n=+t.target.getAttribute("data-size"),i.base.importSelection(i.selectionState),i.document.execCommand("styleWithCSS",!1,!0),i.document.execCommand("fontSize",!1,7),o=window.getSelection().getRangeAt(0),s=o.startContainer;!(!s||!s.getAttribute&&3!==s.nodeType||s.getAttribute&&s.style);)s=s.parentNode;return s.style&&(s.style.fontSize=isNaN(n)||!n?"":n+"px",i.trigger("editableInput",{},s)),e.style.display="none"}})},getButton:function(){return this.button},handleClick:function(t){var e,i;return t.preventDefault(),t.stopPropagation(),this.selectionState=this.base.exportSelection(),e=this.document.querySelector(".medium-editor-toolbar-active .medium-editor-font-size").parentNode,i=e.getBoundingClientRect(),this.div.style.top=i.y+i.height+document.scrollingElement.scrollTop+"px",this.div.style.left=i.x+"px",this.div.style.display="block"}},mediumEditorFontsizeExtension=MediumEditor.Extension.extend(t)}();
// Generated by LiveScript 1.3.0
var mediumEditorFontfamilyExtension;
mediumEditorFontfamilyExtension = {};
(function(){
  var justfont, googlefont, defaultfont, defaultPlusFont, source, fonts, config;
  justfont = ['afupop08', 'chikuming', 'datx2', 'daty5', 'jf-jinxuan', 'wt064', 'xingothic-tc'];
  googlefont = ['Open Sans', 'Josefin Slab', 'Arvo', 'Lato', 'Vollkorn', 'Abril Fatface', 'PT Sans', 'PT Serif', 'Old Standard TT', 'Droid Sans', 'Work Sans', 'Playfair Display', 'Libre Franklin', 'Space Mono', 'Rubik', 'Cormorant', 'Fira Sans', 'Eczar', 'Alegreya Sans', 'Alegreya', 'Raleway', 'Merriweather', 'Anonymous Pro', 'Cabin', 'Inconsolata', 'Neuton', 'Roboto', 'Cardo', 'Inknut Antiqua', 'Bitter', 'Domine', 'Spectral', 'Proza Libre', 'Montserrat', 'Crimson Text', 'Karla', 'Libre Baskerville', 'Archivo Narrow', 'BioRhyme', 'Poppins', 'Roboto Slab', 'Source Serif Pro', 'Source Sans Pro', 'Lora', 'Chivo'];
  defaultfont = ['Arial', 'Arial Black', 'Helvetica', 'Helvetica Neue', 'Tahoma', 'Century Gothic', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS', 'Impact', 'Heiti TC', 'MingLiU', 'DFKai-sb'];
  defaultPlusFont = ['Comic Sans', 'Microsoft JhengHei'];
  source = function(){
    return 'default';
  };
  fonts = defaultfont;
  config = {
    name: "font-family",
    init: function(it){
      var loadFont, list, this$ = this;
      this.button = this.document.createElement('button');
      this.button.classList.add('medium-editor-action', 'medium-editor-font-family');
      this.button.innerHTML = "<i class='fa fa-font'></i>";
      this.on(this.button, 'click', function(e){
        return this$.handleClick(e);
      });
      loadFont = function(font){
        return xfl.load(font.path, function(){
          this$.base.importSelection(this$.selectionState);
          this$.document.execCommand('styleWithCSS', false, true);
          this$.document.execCommand('fontName', false, font.name);
          this$.trigger('editableInput', {
            font: {
              name: font.name,
              source: source(font.name)
            }
          }, list);
          return list.style.display = 'none';
        });
      };
      this.list = list = document.createElement("div");
      list.classList.add('medium-editor-font-family-list', 'medium-editor-sublist', 'centered');
      document.body.appendChild(list);
      list.innerHTML = (["<div class='list'>", "<div class='item' data-font='default'>&nbsp;Default</div>"].concat((function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = fonts).length; i$ < len$; ++i$) {
          it = ref$[i$];
          results$.push("<div class='item' data-font='" + it + "'><img src='/assets/img/fonts/" + it + ".png'></div>");
        }
        return results$;
      }()), ["</div>"])).join('');
      this.subscribe('hideToolbar', function(){
        return this$.list.style.display = 'none';
      });
      list.style.display = 'none';
      return list.addEventListener('click', function(e){
        var fontname;
        if (!(e.target && e.target.getAttribute)) {
          return;
        }
        fontname = e.target.getAttribute('data-font') || e.target.parentNode.getAttribute('data-font');
        this$.base.importSelection(this$.selectionState);
        this$.document.execCommand('styleWithCSS', false, true);
        this$.document.execCommand('fontName', false, fontname);
        this$.trigger('editableInput', {
          font: {
            name: fontname,
            source: source(fontname)
          }
        }, e.target);
        return list.style.display = 'none';
      });
    },
    getButton: function(){
      return this.button;
    },
    handleClick: function(event){
      var ref, box;
      event.preventDefault();
      event.stopPropagation();
      this.selectionState = this.base.exportSelection();
      ref = this.document.querySelector(".medium-editor-toolbar-active .medium-editor-font-family").parentNode;
      box = ref.getBoundingClientRect();
      this.list.style.top = ((box.y + box.height) + document.scrollingElement.scrollTop) + "px";
      this.list.style.left = box.x + "px";
      return this.list.style.display = 'block';
    }
  };
  return mediumEditorFontfamilyExtension = MediumEditor.Extension.extend(config);
})();
// Generated by LiveScript 1.3.0
var mediumEditorClearExtension;
mediumEditorClearExtension = {};
(function(){
  var option;
  option = {
    name: 'clear',
    init: function(){
      var this$ = this;
      this.button = this.document.createElement('button');
      this.button.classList.add('medium-editor-action', "editor-clear", "editor-image-button");
      this.button.innerHTML = '<i class="fa fa-eraser"></i>';
      return this.on(this.button, 'click', function(e){
        return this$.handleClick(e);
      });
    },
    getButton: function(){
      return this.button;
    },
    handleClick: function(event){
      var selection, range;
      event.preventDefault();
      event.stopPropagation();
      selection = window.getSelection();
      if (!selection.rangeCount) {
        return;
      }
      range = selection.getRangeAt(0);
      this.document.execCommand('formatblock', false, 'div');
      return this.document.execCommand('removeformat');
    }
  };
  return mediumEditorClearExtension = MediumEditor.Extension.extend(option);
})();
// Generated by LiveScript 1.3.0
var puredom;
puredom = {
  useAttr: function(attrs){
    var i$, len$, item, results$ = [];
    if (!this.useAttr.hash) {
      this.useAttr.hash = {};
    }
    for (i$ = 0, len$ = attrs.length; i$ < len$; ++i$) {
      item = attrs[i$];
      if (!this.useAttr.hash[item]) {
        this.useAttr.hash[item] = true;
        results$.push(this.options.ADD_ATTR.push(item));
      }
    }
    return results$;
  },
  options: {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["style", "eid", "auto-content", "repeat-host", "repeat-item", "repeat-class", "base-block", "edit-text", "edit-text-placeholder", "editable", "image", "image-ratio", "resizable", "preserve-aspect-ratio"]
  },
  sanitize: function(code, options){
    var mergedOptions, k, v;
    code == null && (code = "");
    options == null && (options = {});
    mergedOptions = import$({}, this.options);
    for (k in options) {
      v = options[k];
      if (mergedOptions[k] && Array.isArray(mergedOptions[k])) {
        mergedOptions[k] = mergedOptions[k].concat(v);
      } else {
        mergedOptions[k] = v;
      }
    }
    return DOMPurify.sanitize(code, mergedOptions);
  }
};
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
var x$;x$=angular.module("webedit"),x$.controller("blocksPicker",["$scope","$http"].concat(function(t,e){var o;return o=document.querySelector("#blocks-picker"),o.style.right=1024+Math.round((window.innerWidth-1024)/2)+"px",o.style.left="auto",e({url:"/blocks/list.json"}).then(function(e){return t.blocks=e.data})}));
var btools;btools={qs:function(e,r){var t;return null==r&&(r=document),(t=r.querySelector(e))?[t]:[]},qsp:function(e,r){return null==r&&(r=document),new Promise(function(t,n){var o;return o=r.querySelector(e),o?t(o):n()})},traceUp:function(e,r){for(var t;r&&r;){if(t=r.matches||r.msMatchesSelector,t&&t.call(r,e))return r;r=r.parentNode}return r&&!r.parentNode?null:r},qsAll:function(e,r){return null==r&&(r=document),Array.from(r.querySelectorAll(e))},fromEidSelector:function(e){var r;return e?Array.isArray(e)?(r=document.querySelector(e[0]),r&&r.childNodes&&e[1]?r.childNodes[e[1]-1]:r):document.querySelector(e):null},getEidSelector:function(e){var r,t,n,o,u,l;if(!e)return null;for(r=["",null],t=r[0],n=r[1],3===e.nodeType&&(r=[e,e.parentNode],o=r[0],e=r[1],n=Array.from(e.childNodes).indexOf(o)+1);e&&(e.getAttribute||3===e.nodeType)&&(3===e.nodeType||!e.getAttribute("eid"));)r=[e,e.parentNode],o=r[0],e=r[1],u=Array.from(e.childNodes).indexOf(o)+1,t=" > *:nth-child("+u+")"+t;return(l=e&&e.getAttribute&&e.getAttribute("eid"))?["*[eid='"+l+"']"+t,n]:null}};
// Generated by LiveScript 1.3.0
var collab, x$;
collab = {
  history: {
    backward: [],
    forward: [],
    redo: function(){
      var ret;
      for (;;) {
        ret = this.forward.splice(0, 1)[0];
        if (!ret) {
          return;
        }
        backward.push(ret);
        collab.doc.submitOp(ret.op, {
          forceApply: false
        });
        if (!ret.option.nobreak) {
          break;
        }
      }
    },
    undo: function(it){
      var group, ret;
      group = null;
      for (;;) {
        ret = this.backward.pop(it);
        if (!ret) {
          return;
        }
        this.forward.splice(0, 0, ret);
        collab.doc.submitOp(sharedb.types.map.json0.invert(ret.op), {
          source: {
            forceApply: true
          }
        });
        if (ret.option && ret.option.group && !group) {
          group = ret.option.group;
        }
        if (group && (!ret.option || ret.option.group !== group)) {
          break;
        }
        if (!(group || (ret.option && ret.option.nobreak))) {
          break;
        }
      }
    },
    log: function(op, option){
      option == null && (option = {});
      if (option.ignore) {
        return;
      }
      this.backward.push({
        op: op,
        option: option
      });
      if (this.forward.length) {
        return this.forward.splice(0);
      }
    }
  },
  action: {
    submitOp: function(op, option){
      option == null && (option = {});
      collab.history.log(op, option);
      return collab.doc.submitOp(op);
    },
    info: function(block){
      var ref$, node, doc, idx, type, eid;
      ref$ = [block, collab.doc], node = ref$[0], doc = ref$[1];
      if (!doc || !doc.data) {
        return [];
      }
      while (node && node.parentNode && !node.getAttribute('base-block')) {
        node = node.parentNode;
      }
      if (!node || !node.getAttribute || !node.parentNode || !node.getAttribute('base-block')) {
        return [];
      }
      idx = Array.from(node.parentNode.childNodes).indexOf(node);
      type = node.getAttribute('base-block');
      eid = node.getAttribute('eid');
      return [node, doc, idx, type, eid];
    },
    checkPath: function(value, path, initValue, option){
      initValue == null && (initValue = {});
      option == null && (option = {
        ignore: true
      });
      if (value) {
        return;
      }
      return this.submitOp([{
        p: path,
        oi: initValue
      }], option);
    },
    setPublic: function(isPublic){
      var attr, ref$;
      this.checkPath(collab.doc.data.attr, ["attr"]);
      attr = collab.doc.data.attr;
      if (!attr || attr.isPublic === isPublic) {
        return;
      }
      return this.submitOp([{
        p: ["attr"],
        od: attr,
        oi: (ref$ = import$({}, attr), ref$.isPublic = isPublic, ref$)
      }], {
        ignore: true
      });
    },
    setThumbnail: function(thumbnail){
      var doc, ref$;
      thumbnail == null && (thumbnail = null);
      if (!thumbnail) {
        return;
      }
      doc = collab.doc;
      this.checkPath(doc.data.attr, ["attr"]);
      if (!doc.data.attr.thumbnail) {
        return this.submitOp([{
          p: ["attr"],
          od: doc.data.attr,
          oi: (ref$ = import$({}, doc.data.attr), ref$.thumbnail = thumbnail, ref$)
        }], {
          ignore: true
        });
      } else {
        return this.submitOp([
          {
            p: ["attr", "thumbnail", 0],
            sd: doc.data.attr.thumbnail
          }, {
            p: ["attr", "thumbnail", 0],
            si: thumbnail
          }
        ], {
          ignore: true
        });
      }
    },
    setTitle: function(manualTitle){
      var this$ = this;
      if (this.setTitle.handler) {
        clearTimeout(this.setTitle.handler);
        this.setTitle.handler = null;
      }
      return this.setTitle.handler = setTimeout(function(){
        var doc, title, list, ref$;
        doc = collab.doc;
        title = manualTitle;
        if (!title) {
          list = Array.from(document.querySelector('#editor .inner').querySelectorAll('h1,h2,h3'));
          list.sort(function(a, b){
            if (a.nodeName === b.nodeName) {
              return 0;
            } else if (a.nodeName > b.nodeName) {
              return 1;
            } else {
              return -1;
            }
          });
          if (list[0]) {
            title = list[0].innerText;
          }
        }
        if (!title) {
          title = "untitled";
        }
        this$.checkPath(doc.data.attr, ["attr"]);
        if (doc.data.attr && doc.data.attr.title === title) {
          return;
        }
        if (title.length > 60) {
          title = title.substring(0, 57) + "...";
        }
        if (doc.data.attr && doc.data.attr.title) {
          return this$.submitOp([
            {
              p: ["attr", "title", 0],
              sd: doc.data.attr.title
            }, {
              p: ["attr", "title", 0],
              si: title
            }
          ], {
            ignore: true
          });
        } else {
          return this$.submitOp([{
            p: ["attr"],
            oi: (ref$ = import$({}, doc.data.attr || {}), ref$.title = title, ref$)
          }], {
            ignore: true
          });
        }
      }, 1000);
    },
    moveBlock: function(src, des){
      return this.submitOp([{
        p: ["child", src],
        lm: des
      }]);
    },
    deleteBlock: function(block){
      var ref$, node, doc, idx, type;
      ref$ = this.info(block), node = ref$[0], doc = ref$[1], idx = ref$[2], type = ref$[3];
      if (!node) {
        return;
      }
      return this.submitOp([{
        p: ["child", idx],
        ld: doc.data.child[idx]
      }]);
    },
    insertBlock: function(block){
      var ref$, node, doc, idx, type, eid;
      ref$ = this.info(block), node = ref$[0], doc = ref$[1], idx = ref$[2], type = ref$[3], eid = ref$[4];
      if (!node) {
        return;
      }
      this.submitOp([{
        p: ["child", idx],
        li: {
          content: this.blockContent(node),
          type: type,
          eid: eid
        }
      }]);
      this.setTitle();
      return this.editStyle(block);
    },
    blockContent: function(node){
      var inner;
      inner = Array.from(node.childNodes).filter(function(it){
        return /inner/.exec(it.getAttribute('class'));
      })[0];
      if (inner.querySelector("[auto-content]")) {
        inner = inner.cloneNode(true);
        Array.from(inner.querySelectorAll("[auto-content]")).map(function(me){
          return Array.from(me.childNodes).map(function(child){
            return me.removeChild(child);
          });
        });
      }
      return puredom.sanitize((inner || {}).innerHTML);
    },
    strDiff: function(path, oldstr, newstr, option){
      var ref$, doc, diffs, offset, ops, i$, len$, diff;
      path == null && (path = []);
      oldstr == null && (oldstr = '');
      newstr == null && (newstr = '');
      option == null && (option = {});
      ref$ = [collab.doc, fastDiff(oldstr, newstr), 0], doc = ref$[0], diffs = ref$[1], offset = ref$[2];
      ops = [];
      for (i$ = 0, len$ = diffs.length; i$ < len$; ++i$) {
        diff = diffs[i$];
        if (diff[0] === 0) {
          offset += diff[1].length;
        } else if (diff[0] === 1) {
          ops.push({
            p: path.concat([offset]),
            si: diff[1]
          });
          offset += diff[1].length;
        } else {
          ops.push({
            p: path.concat([offset]),
            sd: diff[1]
          });
        }
      }
      if (ops.length) {
        return this.submitOp(ops, option);
      }
    },
    editStyle: function(block, isRoot){
      var doc, style, ref$, obj, path, node, idx, type;
      isRoot == null && (isRoot = false);
      doc = collab.doc;
      style = block.getAttribute("style");
      if (isRoot) {
        style = style.replace(/width:\d+px;?/, '');
        ref$ = [doc.data, []], obj = ref$[0], path = ref$[1];
        if (obj.style && typeof obj.style === typeof {}) {
          this.submitOp([{
            p: path.concat(["style"]),
            od: obj.style
          }]);
        }
        if (!obj.style) {
          return this.submitOp([{
            p: path,
            od: obj,
            oi: (ref$ = import$({}, obj), ref$.style = style, ref$)
          }]);
        }
      } else {
        ref$ = this.info(block), node = ref$[0], doc = ref$[1], idx = ref$[2], type = ref$[3];
        if (!node || !doc.data.child[idx]) {
          return;
        }
        ref$ = [doc.data.child[idx], ["child", idx]], obj = ref$[0], path = ref$[1];
        if (!obj.style) {
          return this.submitOp([{
            p: path,
            ld: obj,
            li: (ref$ = import$({}, obj), ref$.style = style, ref$)
          }]);
        }
      }
      return this.strDiff(path.concat(['style']), obj.style, style);
    },
    editBlock: function(block, option){
      var ref$, node, doc, idx, type, content, diffs, offset;
      option == null && (option = {});
      ref$ = this.info(block), node = ref$[0], doc = ref$[1], idx = ref$[2], type = ref$[3];
      if (!node) {
        return;
      }
      content = {
        last: (doc.data.child[idx] || {}).content || '',
        now: this.blockContent(node)
      };
      diffs = fastDiff(content.last, content.now);
      if (!doc.data.child[idx]) {
        this.submitOp([{
          p: ["child", idx],
          li: {
            content: "",
            type: type,
            style: ""
          }
        }], option);
      }
      offset = 0;
      this.strDiff(['child', idx, 'content'], content.last, content.now, option);
      return this.setTitle();
    },
    cursor: function(user, cursor){
      var key;
      if (!user || !(user.key || user.guestkey) || !collab.doc || !collab.doc.data) {
        return;
      }
      key = user.key || user.guestkey;
      return collab.connection.send({
        cursor: {
          action: 'update',
          data: {
            cursor: cursor
          }
        }
      });
    },
    css: {
      prepare: function(){
        if (!collab.doc.data.css) {
          collab.action.submitOp([{
            p: ["css"],
            oi: {
              links: [],
              inline: "",
              theme: {}
            }
          }]);
        }
        return collab.doc.data.css;
      },
      editInline: function(value){
        var css;
        css = this.prepare();
        return collab.action.strDiff(["css", "inline"], css.inline || '', value);
      },
      addLink: function(link){
        var css;
        css = this.prepare();
        return collab.action.submitOp([{
          p: ["css", "links", css.links.length],
          li: link
        }]);
      },
      removeLink: function(link){
        var css, idx;
        css = this.prepare();
        idx = css.links.indexOf(link);
        if (!~idx) {
          return;
        }
        return collab.action.submitOp([{
          p: ["css", "links", idx],
          ld: link
        }]);
      },
      editTheme: function(obj){
        var css;
        css = this.prepare();
        return collab.action.submitOp([{
          p: ["css", "theme"],
          od: css.theme,
          oi: obj
        }]);
      }
    }
  },
  init: function(root, editor){
    var ref$, path, offline, doc, this$ = this;
    ref$ = [root, editor], this.root = ref$[0], this.editor = ref$[1];
    this.root.innerHTML = '';
    path = window.location.pathname;
    this.socket = new WebSocket((editor.server.scheme === 'http' ? 'ws' : 'wss') + "://" + editor.server.domain + "/ws");
    offline = function(){
      return editor.online.toggle(false);
    };
    if (this.socket.readyState >= 2) {
      return offline();
    }
    this.socket.addEventListener('close', function(evt){
      if (evt.code !== 3001) {
        return offline();
      }
    });
    this.socket.addEventListener('error', function(evt){
      if (this$.socket.readyState === 1) {
        return offline();
      }
    });
    this.connection = new sharedb.Connection(this.socket);
    this.connection.on('receive', function(it){
      var ref$, cursor;
      if (it.data && !it.data.cursor) {
        return;
      }
      ref$ = [it.data.cursor, null], cursor = ref$[0], it.data = ref$[1];
      return editor.collaborator.handle(cursor);
    });
    this.pageid = /^\/page\//.exec(path) ? path.replace(/^\/page\//, '').replace(/\/$/, '') : null;
    this.doc = doc = this.connection.get('doc', this.pageid);
    doc.on('load', function(){
      var i$, ref$, len$, idx, v;
      if (doc.data) {
        for (i$ = 0, len$ = (ref$ = doc.data.child).length; i$ < len$; ++i$) {
          idx = i$;
          v = ref$[i$];
          if (v) {
            editor.block.prepare(v.content, {
              name: v.type,
              idx: idx,
              redo: false,
              style: v.style || '',
              source: false,
              eid: v.eid
            });
          }
        }
        editor.block.init();
        editor.page.prepare(doc.data);
        editor.css.prepare(doc.data.css) || {};
      }
      editor.loading.toggle(false);
      return editor.collaborator.init();
    });
    return doc.fetch(function(e){
      if (e) {
        return editor.online.toggle(false, {
          code: 403
        });
      }
      return setTimeout(function(){
        var ret;
        doc.subscribe(function(ops, source){
          return this$.handle(ops, source);
        });
        doc.on('op', function(ops, source){
          return this$.handle(ops, source);
        });
        if (!doc.type) {
          return ret = doc.create({
            attr: {},
            style: '',
            child: [],
            collaborator: {}
          });
        }
      }, 500);
    });
  },
  handle: function(ops, source){
    var i$, len$, op, node, ref$, src, des, desnode, results$ = [];
    if (!ops || (source && !source.forceApply)) {
      return;
    }
    for (i$ = 0, len$ = ops.length; i$ < len$; ++i$) {
      op = ops[i$];
      if (op.si || op.sd) {
        if (op.p[2] === 'style') {
          node = this.root.childNodes[op.p[1]];
          results$.push(this.editor.block.style.update(node, this.doc.data.child[op.p[1]].style || ''));
        } else if (op.p[0] === 'style') {
          results$.push(this.root.style = this.doc.data.style || '');
        } else if (op.p[0] === 'css' && op.p[1] === 'inline') {
          results$.push(this.editor.css.inline.update(this.doc.data.css.inline));
        } else if (op.p[0] === 'attr') {} else if (op.p[0] === 'child' && op.p[2] === 'content' && op.p.length === 4) {
          node = this.root.childNodes[op.p[1]];
          results$.push(this.editor.block.prepareAsync(node, {
            name: node.getAttribute('base-block'),
            idx: op.p[1],
            redo: true,
            eid: this.doc.data.child[op.p[1]].eid,
            content: this.doc.data.child[op.p[1]].content,
            source: false
          }));
        }
      } else if (op.li || op.ld) {
        if (op.ld) {
          if (op.p[0] === 'child') {
            node = this.root.childNodes[op.p[1]];
            node.parentNode.removeChild(node);
            this.editor.block.indexing();
            node.deleted = true;
            this.editor.handles.hide(node);
          } else if (op.p[0] === 'css' && op.p[1] === 'links') {
            this.editor.css.links.remove(op.ld);
          }
        }
        if (op.li) {
          if (op.p[0] === 'child') {
            this.editor.block.prepare(op.li.content, {
              name: op.li.type,
              idx: op.p[1],
              redo: false,
              style: op.li.style,
              source: false,
              eid: op.li.eid
            });
            results$.push(this.editor.block.indexing());
          } else if (op.p[0] === 'css' && op.p[1] === 'links') {
            results$.push(this.editor.css.links.add(op.li));
          }
        }
      } else if (op.lm != null) {
        ref$ = [op.p[1], op.lm], src = ref$[0], des = ref$[1];
        if (src !== des) {
          node = this.root.childNodes[src];
          desnode = this.root.childNodes[des + (src < des ? 1 : 0)];
          this.root.removeChild(node);
          if (!desnode) {
            this.root.appendChild(node);
          } else {
            this.root.insertBefore(node, desnode);
          }
          results$.push(this.editor.block.indexing());
        }
      } else if (op.oi) {
        if (op.p[0] === 'attr') {
          results$.push(collab.editor.page.share.setPublic(this.doc.data.attr.isPublic));
        } else if (op.p[0] === 'css') {
          results$.push(collab.editor.css.theme.update(op.oi));
        }
      } else if (op.od) {}
    }
    return results$;
  }
};
x$ = angular.module('webedit');
x$.service('collaborate', ['$rootScope'].concat(function($rootScope){
  return collab;
}));
x$.controller('collabInfo', ['$scope', '$http'].concat(function($scope, $http){
  var panel;
  panel = document.querySelector('#collab-info');
  panel.style.left = (1024 + Math.round((window.innerWidth - 1024) / 2)) + "px";
  return panel.style.right = "auto";
}));
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
var pageObject,slice$=[].slice;pageObject={handler:{},addEventListener:function(e,r){var a;return((a=this.handler)[e]||(a[e]=[])).push(r)},fire:function(e){var r,a,n,t,l,c=[];for(r=slice$.call(arguments,1),a=0,t=(n=this.handler[e]||[]).length;t>a;++a)l=n[a],c.push(l.apply(pageObject,r));return c}};
// Generated by LiveScript 1.3.0
var x$;
x$ = angular.module('webedit');
x$.service('nodeProxy', ['$rootScope'].concat(function($rootScope){
  var ret;
  ret = function(node, sync){
    var originNode, queryId, retfunc;
    sync == null && (sync = true);
    originNode = node;
    queryId = "_node-proxy-" + Math.random().toString(16).substring(2);
    node.setAttribute(queryId, true);
    if (sync) {
      ret.editProxy.editBlock(node);
    }
    retfunc = function(){
      return document.querySelector("[" + queryId + "]") || (function(){
        throw new Error("node " + queryId + " not found");
      }());
    };
    retfunc.destroy = function(){
      var newnode;
      newnode = retfunc();
      newnode.removeAttribute(queryId);
      if (sync) {
        ret.editProxy.editBlock(newnode);
      }
      return newnode;
    };
    return retfunc;
  };
  ret.init = function(it){
    return ret.editProxy = it;
  };
  return ret;
}));
x$.service('blockLoader', ['$rootScope', '$http'].concat(function($scope, $http){
  var ret;
  return ret = {
    cache: {},
    get: function(name){
      var this$ = this;
      return new Promise(function(res, rej){
        var that;
        if (that = this$.cache[name]) {
          return res(that);
        }
        return $http({
          url: "/blocks/" + name + "/index.json"
        }).then(function(ret){
          var that, exports;
          this$.cache[name] = ret.data;
          if (that = this$.cache[name].js) {
            exports = eval("var module = {exports: {}};\n(function(module) { " + that + " })(module);\nmodule.exports;");
            this$.cache[name].exports = exports;
            if ((exports.custom || (exports.custom = {})).attrs) {
              puredom.useAttr(exports.custom.attrs);
            }
          }
          return res(this$.cache[name]);
        });
      });
    }
  };
}));
x$.service('webSettings', ['$rootScope'].concat(function($rootScope){
  var ret;
  ret = {
    unit: {},
    style: {},
    info: {},
    list: ['fontFamily', 'backgroundPositionX', 'backgroundPositionY', 'backgroundRepeat', 'backgroundAttachment', 'backgroundSize', 'fontWeight', 'boxShadow', 'animationName', 'backgroundImage', 'backgroundColor', 'color', 'fontSize', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'borderTopWidth', 'borderLeftWidth', 'borderRightWidth', 'borderBottomWidth', 'borderTopColor', 'borderLeftColor', 'borderRightColor', 'borderBottomColor'],
    option: {
      fontFamily: [
        {
          name: 'Default',
          value: 'default'
        }, {
          name: 'Arial',
          value: 'Arial'
        }, {
          name: 'Helvetica Neue',
          value: 'Helvetica Neue'
        }, {
          name: 'Tahoma',
          value: 'Tahoma'
        }, {
          name: 'Raleway',
          value: 'Raleway'
        }, {
          name: '微軟正黑體',
          value: "Microsoft JhengHei"
        }, {
          name: '黑體(繁)',
          value: "Heiti TC"
        }, {
          name: '黑體(簡)',
          value: "Heiti SC"
        }, {
          name: '蘋方體(繁)',
          value: "PingFangTC-Regular"
        }, {
          name: '細明體',
          value: "MingLiU"
        }, {
          name: '標楷體',
          value: 'DFKai-sb'
        }
      ],
      backgroundPositionX: ['default', 'left', 'center', 'right'],
      backgroundPositionY: ['default', 'top', 'center', 'bottom'],
      backgroundRepeat: ['default', 'repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
      backgroundAttachment: ['default', 'scroll', 'fixed', 'local'],
      backgroundSize: ['default', 'cover', 'contain', 'auto'],
      fontWeight: ['default', '200', '300', '400', '500', '600', '700', '800', '900'],
      boxShadow: ['default', 'none', 'light', 'modest', 'heavy'],
      animationName: ['inherit', 'none', 'bounce', 'slide', 'fade']
    },
    setBlock: function(block){
      var this$ = this;
      this.style = {};
      (block.getAttribute('style') || '').split(';').map(function(it){
        var name, value;
        it = it.split(":").map(function(it){
          return it.trim();
        });
        if (!it[1] || !it[0]) {
          return;
        }
        name = it[0].split('-').map(function(d, i){
          if (i) {
            return d[0].toUpperCase() + d.substring(1);
          } else {
            return d;
          }
        }).join('');
        value = it[1];
        return this$.style[name] = value;
      });
      import$(this.info, {
        id: "#" + block.getAttribute('id')
      });
      return this.block = block;
    }
  };
  ['marginLeft', 'marginTop', 'marginRight', 'marginBottom', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'borderLeftWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'fontSize'].map(function(it){
    return ret.unit[it] = "px";
  });
  ['animationDuration', 'animationDelay'].map(function(it){
    return ret.unit[it] = "s";
  });
  return ret;
}));
x$.controller('webSettings', ['$scope', '$timeout', 'webSettings', 'collaborate', 'editProxy'].concat(function($scope, $timeout, webSettings, collaborate, editProxy){
  $scope.settings = webSettings;
  $scope.reset = function(){
    return $scope.settings.style = {};
  };
  $scope.setBackgroundImage = function(){
    var shrink, dialog;
    shrink = "1024x1024";
    dialog = uploadcare.openDialog(null, null, {
      imageShrink: shrink,
      crop: 'free'
    });
    return dialog.done(function(it){
      var file, that;
      file = ((that = it.files)
        ? that()
        : [it])[0];
      $scope.settings.style.backgroundImage = "url(/assets/img/loader/msg.svg)";
      return file.done(function(info){
        return $scope.settings.style.backgroundImage = "url(" + info.cdnUrl + ")";
      });
    });
  };
  $scope.actionHandle = null;
  return $scope.$watch('settings.style', function(n, o){
    var i$, ref$, len$, k, v;
    if (!webSettings.block) {
      return;
    }
    for (i$ = 0, len$ = (ref$ = $scope.settings.list).length; i$ < len$; ++i$) {
      k = ref$[i$];
      v = $scope.settings.style[k];
      if (!v || v === 'default') {
        webSettings.block.style[k] = $scope.settings.style[k] = '';
      } else {
        webSettings.block.style[k] = v + (webSettings.unit[k] || '');
      }
    }
    if ($scope.actionHandle) {
      $timeout.cancel($scope.actionHandle);
      $scope.actionHandle = null;
    }
    return $scope.actionHandle = $timeout(function(){
      return editProxy.editStyle(webSettings.block, webSettings.block === document.querySelector('#editor > .inner'));
    }, 200);
  }, true);
}));
x$.service('editAux', ['$rootScope'].concat(function($rootScope){
  var aux;
  return aux = {
    cleanAttrs: function(root, attrs){
      var i$, len$, attr, to$, i, results$ = [];
      attrs == null && (attrs = []);
      if (!root.removeAttribute) {
        return;
      }
      for (i$ = 0, len$ = attrs.length; i$ < len$; ++i$) {
        attr = attrs[i$];
        root.removeAttribute(attr);
      }
      for (i$ = 0, to$ = root.childNodes.length; i$ < to$; ++i$) {
        i = i$;
        results$.push(this.cleanAttrs(root.childNodes[i], attrs));
      }
      return results$;
    },
    traceNonText: function(node){
      while (node && node.nodeType === 3) {
        node = node.parentNode;
      }
      return node && node.nodeType === 3 ? null : node;
    },
    traceBaseBlock: function(node){
      while (node && (node.nodeType === 3 || (node.getAttribute && !node.getAttribute("base-block")))) {
        node = node.parentNode;
      }
      return node && node.getAttribute && node.getAttribute("base-block") ? node : null;
    },
    eid: function(target){
      var count, eid;
      count = 0;
      while (count < 100) {
        eid = Math.random().toString(16).substring(2);
        if (!document.querySelector("[eid='" + eid + "']")) {
          break;
        }
        count++;
      }
      if (count < 100) {
        return target.setAttribute('eid', eid);
      }
    }
  };
}));
x$.service('editProxy', ['$rootScope', '$timeout', 'collaborate', 'editAux'].concat(function($rootScope, $timeout, collaborate, aux){
  var editProxy;
  editProxy = {
    change: function(blocks){
      var this$ = this;
      blocks == null && (blocks = []);
      blocks = blocks.filter(function(it){
        return it;
      });
      if (this.change.handle) {
        $timeout.cancel(this.change.handle);
      }
      return this.change.handle = $timeout(function(){
        this$.change.handle = null;
        pageObject.fire('block.change', {
          blocks: blocks
        });
        return blocks.map(function(block){
          var node;
          node = aux.traceBaseBlock(block);
          if (node && (node.obj || (node.obj = {})).change) {
            return node.obj.change([block], true);
          }
        });
      }, 100);
    },
    editStyle: function(block, isRoot){
      isRoot == null && (isRoot = false);
      this.change([block]);
      return collaborate.action.editStyle(block, isRoot);
    },
    editBlockAsync: function(block, option){
      var this$ = this;
      if (this.editBlockAsync.handle) {
        $timeout.cancel(this.editBlockAsync.handle);
      }
      return this.editBlockAsync.handle = $timeout(function(){
        this$.editBlockAsync.handle = null;
        this$.change([block]);
        return collaborate.action.editBlock(block, option);
      }, 10);
    },
    editBlock: function(block, option){
      this.change([block]);
      return collaborate.action.editBlock(block, option);
    },
    insertBlock: function(block){
      this.change([block]);
      return collaborate.action.insertBlock(block);
    },
    deleteBlock: function(block){
      var node;
      this.change([block]);
      node = aux.traceBaseBlock(block);
      if ((node.obj || (node.obj = {})).destroy) {
        node.obj.destroy();
      }
      return collaborate.action.deleteBlock(block);
    },
    moveBlock: function(src, des){
      this.change([src, des]);
      return collaborate.action.moveBlock(src, des);
    },
    setThumbnail: function(thumbnail){
      return collaborate.action.setThumbnail(thumbnail);
    }
  };
  return editProxy;
}));
x$.controller('editor', ['$scope', '$interval', '$timeout', 'ldBase', 'blockLoader', 'collaborate', 'global', 'webSettings', 'editProxy', 'nodeProxy', 'ldNotify', 'editAux'].concat(function($scope, $interval, $timeout, ldBase, blockLoader, collaborate, global, webSettings, editProxy, nodeProxy, ldNotify, aux){
  var medium, imageHandle, textHandle, nodeHandle, sortEditable, page, block, editor, ref$, x$, lastCursor, blocksPicker, blocksPreview;
  $scope.loading = true;
  nodeProxy.init(editProxy);
  medium = {
    list: [],
    pause: function(){
      return this.list.map(function(it){
        return it.destroy();
      });
    },
    resume: function(){
      return this.list.map(function(it){
        return it.setup();
      });
    },
    prepare: function(block){
      var me;
      me = new MediumEditor(block, {
        toolbar: {
          buttons: ['bold', 'italic', 'underline', 'indent'].map(function(it){
            return {
              name: it,
              contentDefault: "<i class='fa fa-" + it + "'></i>"
            };
          }).concat(['h1', 'h2', 'h3', 'h4'], [
            {
              name: 'orderedlist',
              contentDefault: "<i class='fa fa-list-ol'></i>"
            }, {
              name: 'unorderedlist',
              contentDefault: "<i class='fa fa-list-ul'></i>"
            }, {
              name: 'foreColor',
              contentDefault: "<i class='fa fa-adjust'></i>"
            }, {
              name: 'backColor',
              contentDefault: "<i class='fa fa-paint-brush'></i>"
            }, {
              name: 'borderColor',
              contentDefault: "<i class='fa fa-square-o'></i>"
            }, {
              name: 'align-left',
              contentDefault: '1'
            }, {
              name: 'align-center',
              contentDefault: '2'
            }, {
              name: 'align-right',
              contentDefault: '3'
            }, {
              name: 'font-size',
              contentDefault: "4"
            }, {
              name: 'font-family',
              contentDefault: "5"
            }, {
              name: 'anchor',
              contentDefault: "<i class='fa fa-link'></i>"
            }, {
              name: 'clear',
              contentDefault: "<i class='fa fa-eraser'></i>"
            }
          ])
        },
        extensions: {
          alignLeft: mediumEditorAlignExtention.left,
          alignCenter: mediumEditorAlignExtention.center,
          alignRight: mediumEditorAlignExtention.right,
          backColor: new mediumEditorStyleExtension.backColor(),
          foreColor: new mediumEditorStyleExtension.foreColor(),
          borderColor: new mediumEditorStyleExtension.borderColor(),
          fontSize: new mediumEditorFontsizeExtension(),
          fontFamily: new mediumEditorFontfamilyExtension(),
          clear: new mediumEditorClearExtension()
        },
        spellcheck: false,
        placeholder: {
          text: ''
        }
      });
      this.list.push(me);
      me.subscribe('editableInput', function(evt, elem){
        var sel, range, node, eid;
        sel = document.getSelection();
        if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          node = aux.traceNonText(range.startContainer);
          if (node) {
            eid = node.getAttribute('eid');
            if (document.querySelectorAll("[eid='" + eid + "']").length > 1) {
              aux.eid(node);
            }
          }
        }
        return editProxy.editBlock(elem);
      });
      return me;
    }
  };
  imageHandle = {
    init: function(){
      return this.handle = document.querySelector('#editor-image-handle');
    },
    aspect: {
      lock: false,
      toggle: function(value, elem){
        this.lock = value != null
          ? value
          : !this.lock;
        if (elem.nodeName === 'IMG' || (elem.nodeName === 'DIV' && elem.getAttribute('image') && elem.childNodes.length === 0)) {
          elem = this.convert(elem);
        }
        if (this.lock) {
          return elem.setAttribute('preserve-aspect-ratio', true);
        } else {
          return elem.removeAttribute('preserve-aspect-ratio');
        }
      },
      convert: function(elem){
        var box, ratio, imgInner, img;
        box = elem.getBoundingClientRect();
        ratio = Math.round(100 * (box.width / box.height)) * 0.01;
        imgInner = document.createElement("div");
        imgInner.style.paddingBottom = "50%";
        imgInner.style.height = "0";
        img = document.createElement("div");
        img.appendChild(imgInner);
        img.setAttribute('editable', false);
        img.setAttribute('contenteditable', false);
        img.setAttribute('image', 'image');
        img.setAttribute('image-ratio', ratio);
        img.style.backgroundImage = elem.style.backgroundImage;
        img.style.backgroundColor = "";
        img.style.width = box.width + "px";
        img.style.backgroundSize = "100% 100%";
        imgInner.style.paddingBottom = 100 / ratio + "%";
        elem.parentNode.insertBefore(img, elem);
        elem.parentNode.removeChild(elem);
        imageHandle.resizable(img);
        editProxy.editBlock(img);
        return img;
      }
    },
    click: function(target){
      var retarget, box, size, shrink, dialog;
      if (target) {
        this.target = target;
      }
      if (!this.target) {
        return;
      }
      target = this.target;
      retarget = nodeProxy(target);
      box = this.target.getBoundingClientRect();
      size = Math.round((box.width > box.height
        ? box.width
        : box.height) * 2);
      if (size > 1024) {
        size = 1024;
      }
      shrink = size + "x" + size;
      /* dont upload local image
      ret = /url\("([^"]+)"\)/.exec(window.getComputedStyle(target).backgroundImage or "")
      file = if ret => ret.1 else null
      file = uploadcare.fileFrom 'url', file
      */
      dialog = uploadcare.openDialog(null, null, {
        multiple: !!target.getAttribute('repeat-item'),
        imageShrink: shrink,
        crop: 'free'
      });
      dialog.fail(function(){
        return retarget.destroy();
      });
      return dialog.done(function(ret){
        return Promise.resolve().then(function(){
          var files, that, nodes;
          files = (that = ret.files)
            ? that()
            : [ret];
          if (files.length === 1) {
            retarget().style.backgroundImage = "url(/assets/img/loader/msg.svg)";
            return files[0].done(function(info){
              retarget().style.backgroundImage = "url(" + info.cdnUrl + ")";
              editProxy.editBlock(retarget.destroy());
              return editProxy.setThumbnail(info.cdnUrl + "/-/preview/1200x630/");
            });
          } else {
            nodes = retarget().parentNode.querySelectorAll('[image]');
            Array.from(nodes).map(function(it){
              return it.style.backgroundImage = "url(/assets/img/loader/msg.svg)";
            });
            return Promise.all(files.map(function(it){
              return it.promise();
            })).then(function(images){
              var ref$, nodes, j, i$, to$, i;
              ref$ = [retarget().parentNode.querySelectorAll('[image]'), 0], nodes = ref$[0], j = ref$[1];
              for (i$ = 0, to$ = nodes.length; i$ < to$; ++i$) {
                i = i$;
                nodes[i].style.backgroundImage = "url(" + images[j].cdnUrl + ")";
                j = (j + 1) % images.length;
              }
              editProxy.editBlock(retarget.destroy());
              return editProxy.setThumbnail(images[0].cdnUrl + "/-/preview/1200x630/");
            });
          }
        })['catch'](function(e){
          return alert("the image node you're editing is removed by others.");
        });
      });
    },
    resizable: function(imgs){
      var this$ = this;
      imgs == null && (imgs = []);
      if (!Array.isArray(imgs)) {
        imgs = [imgs].filter(function(it){
          return it;
        });
      }
      return imgs.map(function(img){
        if (img.getAttribute('image') === 'bk' || img.resizabled || img.getAttribute('resizable') === 'false') {
          return;
        }
        img.resizabled = true;
        img.addEventListener('mousedown', function(e){
          var ref$, x, y, box;
          if (!img.getAttribute('image')) {
            return;
          }
          ref$ = [e.offsetX, e.offsetY], x = ref$[0], y = ref$[1];
          box = this.getBoundingClientRect();
          ref$ = [x / box.width, y / box.height], x = ref$[0], y = ref$[1];
          if (x < 0.1 || x > 0.9 || y < 0.1 || y > 0.9) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
        return interact(img).resizable({
          edges: {
            left: true,
            right: true,
            bottom: true,
            top: true
          }
        }).on('resizeend', function(e){
          return e.target._interactResize = true;
        }).on('resizemove', function(e){
          var target, w, h, ratio;
          target = e.target;
          w = target.getBoundingClientRect().width + e.deltaRect.width;
          h = target.getBoundingClientRect().height + e.deltaRect.height;
          ratio = +target.getAttribute('image-ratio');
          if (isNaN(ratio) || !ratio) {
            ratio = Math.round(100 * w / (h || 1)) * 0.01;
            target.setAttribute('image-ratio', ratio);
          }
          if (this$.aspect.lock) {
            if (e.deltaRect.width) {
              h = w / ratio;
            } else if (e.deltaRect.height) {
              w = h * ratio;
            }
          }
          target.style.width = w + "px";
          if (target.getAttribute('image')) {
            target.style.height = h + "px";
          }
          target.style.flex = "0 0 " + w + "px";
          target.style.transition = "none";
          if (img.handle) {
            $timeout.cancel(img.handle);
          }
          img.handle = $timeout(function(){
            target.style.flex = "1 1 auto";
            img.handle = null;
            return target.style.transition = ".5s all cubic-bezier(.3,.1,.3,.9)";
          }, 500);
          return editProxy.editBlockAsync(target, {
            group: 'resize'
          });
        });
      });
    }
  };
  imageHandle.init();
  textHandle = {
    elem: null,
    coord: {
      x: 0,
      y: 0
    },
    init: function(){
      var this$ = this;
      this.elem = document.querySelector('#editor-text-handle');
      this.elem.addEventListener('mouseover', function(e){
        if (!this$.timeout) {
          return;
        }
        $timeout.cancel(this$.timeout);
        return this$.timeout = null;
      });
      this.elem.addEventListener('keypress', function(e){
        if (e.keyCode === 13) {
          this$.save();
        }
        if (!this$.timeout) {
          return;
        }
        $timeout.cancel(this$.timeout);
        return this$.timeout = null;
      });
      return this.elem.addEventListener('click', function(e){
        if (e.target.classList.contains('medium-editor-toolbar-save')) {
          return this$.save();
        } else if (e.target.classList.contains('medium-editor-toolbar-close')) {
          return this$.toggle(null);
        }
      });
    },
    save: function(){
      var text, info, this$ = this;
      text = this.elem.querySelector('input').value;
      info = collaborate.action.info(this.target);
      return blockLoader.get(info[3]).then(function(ret){
        var node;
        node = aux.traceBaseBlock(this$.target);
        if ((node.obj || (node.obj = {})).transformText) {
          text = node.obj.transformText(text);
        }
        if (text) {
          this$.target.setAttribute(this$.target.getAttribute('edit-text'), text);
        }
        if ((node.obj || (node.obj = {})).text) {
          text = node.obj.text(text);
        }
        editProxy.editBlock(this$.target);
        return this$.toggle(null);
      });
    },
    toggle: function(options){
      var this$ = this;
      options == null && (options = {});
      if (this.timeout) {
        $timeout.cancel(this.timeout);
        this.timeout = null;
      }
      if (!options.delay) {
        return this._toggle(options);
      } else {
        return this.timeout = $timeout(function(){
          return this$._toggle(options);
        }, options.delay);
      }
    },
    initval: '',
    tainted: function(){
      return this.initval !== this.value() + "";
    },
    value: function(){
      return this.elem.querySelector('input').value;
    },
    isOn: function(){
      return this.elem.style.display !== 'none';
    },
    _toggle: function(options){
      var node, inside, text, placeholder, animation, ref$, box, coord, x$;
      node = options.node, inside = options.inside, text = options.text, placeholder = options.placeholder;
      if (!this.elem) {
        this.init();
      }
      if (placeholder) {
        this.elem.querySelector('input').setAttribute('placeholder', placeholder);
      }
      animation = 'ldt-slide-bottom-in';
      if (node !== this.target) {
        this.elem.classList.remove(animation);
      }
      if (!node) {
        return this.elem.style.display = 'none';
      }
      ref$ = [node, node.getBoundingClientRect()], this.target = ref$[0], box = ref$[1];
      coord = {
        x: (box.x + box.width * 0.5 - 150) + "px",
        y: (box.y - 39 + document.scrollingElement.scrollTop) + "px"
      };
      x$ = this.elem.style;
      x$.left = coord.x;
      x$.top = coord.y;
      x$.display = 'block';
      this.elem.classList.add('ld', animation);
      import$(this.coord, coord);
      this.elem.querySelector('input').value = text || '';
      return this.initval = (text || '') + "";
    }
  };
  textHandle.init();
  nodeHandle = {
    elem: null,
    init: function(){
      var this$ = this;
      this.elem = document.querySelector('#editor-node-handle');
      return this.elem.addEventListener('click', function(e){
        var target, parent, className, newnode, x$;
        if (!this$.target) {
          return;
        }
        target = this$.target;
        parent = target.parentNode;
        className = e.target.getAttribute('class');
        if (/fa-clone/.exec(className)) {
          newnode = target.cloneNode(true);
          newnode.setAttribute('edit-transition', 'jump-in');
          aux.cleanAttrs(newnode, ['eid']);
          sortEditable.initChild(newnode);
          if (newnode.getAttribute('image') || newnode.getAttribute('resizable')) {
            imageHandle.resizable(newnode);
          }
          parent.insertBefore(newnode, target.nextSibling);
          setTimeout(function(){
            newnode.setAttribute('edit-transition', 'jump-in');
            return editProxy.editBlock(parent);
          }, 800);
        } else if (/fa-trash-o/.exec(className)) {
          target.setAttribute('edit-transition', 'jump-out');
          setTimeout(function(){
            parent.removeChild(target);
            editProxy.editBlock(parent);
            return this$.toggle(null);
          }, 400);
        } else if (/fa-align/.exec(className)) {
          x$ = target.style;
          x$.marginLeft = /right|center/.exec(className) ? 'auto' : 0;
          x$.marginRight = /left|center/.exec(className) ? 'auto' : 0;
          x$.display = 'block';
          editProxy.editBlock(target);
        } else if (/fa-link/.exec(className)) {} else if (/fa-camera/.exec(className)) {
          imageHandle.click(this$.target);
        } else if (/fa-lock/.exec(className)) {
          imageHandle.aspect.toggle(true, target);
          this$.elem.classList.add('aspect-ratio-on');
        } else if (/fa-unlock-alt/.exec(className)) {
          imageHandle.aspect.toggle(false, target);
          this$.elem.classList.remove('aspect-ratio-on');
        }
        this$.elem.style.display = "none";
        return editProxy.editBlock(parent);
      });
    },
    coord: {
      x: 0,
      y: 0
    },
    toggle: function(options){
      var animation, node, ref$, box, ebox, coord, x$;
      options == null && (options = {});
      if (!this.elem) {
        this.init();
      }
      animation = 'ldt-float-up-in';
      node = options.node;
      if (node !== this.target) {
        this.elem.classList.remove(animation, 'xhalf');
      }
      if (!node) {
        return this.elem.style.display = 'none';
      }
      this.elem.classList[options.noRepeat ? 'add' : 'remove']('no-repeat');
      this.elem.classList[options.image ? 'add' : 'remove']('image');
      this.elem.classList[options.noDelete && options.noRepeat ? 'add' : 'remove']('no-delete');
      this.elem.classList[options.aspectRatio ? 'add' : 'remove']('aspect-ratio');
      this.elem.classList[options.alignment ? 'add' : 'remove']('alignment');
      ref$ = [node, node.getBoundingClientRect(), this.elem.getBoundingClientRect()], this.target = ref$[0], box = ref$[1], ebox = ref$[2];
      if (options.aspectRatio) {
        if (this.target.getAttribute('preserve-aspect-ratio')) {
          this.elem.classList.add('aspect-ratio-on');
        }
      }
      coord = {
        x: (box.x + box.width + 3 + (options.inside ? -5 : 0)) + "px",
        y: (box.y + box.height * 0.5 - ebox.height * 0.5 + document.scrollingElement.scrollTop) + "px"
      };
      x$ = this.elem.style;
      x$.left = coord.x;
      x$.top = coord.y;
      x$.display = 'block';
      this.elem.classList.add('ld', animation, 'xhalf');
      return import$(this.coord, coord);
    }
  };
  nodeHandle.init();
  sortEditable = {
    initChild: function(node){
      return Array.from(node.querySelectorAll('[repeat-host]')).map(function(host){
        var repeatSelector, that;
        repeatSelector = (that = host.getAttribute('repeat-class'))
          ? '.' + that
          : host.childNodes.length ? (that = host.childNodes[0] && (host.childNodes[0].getAttribute('class') || '').split(' ')[0].trim())
            ? '.' + that
            : host.nodeName : 'div';
        return Sortable.create(host, {
          group: {
            name: "sortable-" + Math.random().toString(16).substring(2)
          },
          disabled: false,
          draggable: repeatSelector,
          dragoverBubble: true,
          onEnd: function(evt){
            return editProxy.editBlock(node);
          }
        });
      });
    },
    init: function(node, redo){
      var lastRange, this$ = this;
      redo == null && (redo = false);
      this.initChild(node);
      lastRange = null;
      if (redo) {
        return;
      }
      node.addEventListener('selectstart', function(e){
        return e.allowSelect = true;
      });
      node.addEventListener('keypress', function(e){
        var selection, range, target;
        if (!e.target) {
          return;
        }
        selection = window.getSelection();
        if (!selection || (selection.rangeCount = 0)) {
          return;
        }
        range = selection.getRangeAt(0);
        target = range.startContainer;
        if (target.nodeType === 3) {
          target = target.parentNode;
        }
        if (!target.getAttribute('eid')) {
          aux.eid(target);
          return editProxy.editBlock(target);
        }
      });
      node.addEventListener('mousedown', function(e){
        var target, ret;
        Array.from(node.parentNode.querySelectorAll('[contenteditable]')).map(function(it){
          if (it.getAttribute('editable') === 'false') {
            return;
          }
          return it.removeAttribute('contenteditable');
        });
        target = e.target;
        ret = this$.search(target, document.createRange(), {
          x: e.clientX,
          y: e.clientY
        });
        if (!target.innerHTML.replace(/(<br>\s*)*/, '').trim() || (ret && ret.length && ret[0] && ((ret[1] < ret[0].length && ret[1] >= 0) && ret[2] < 800))) {
          if (target.getAttribute('editable') === 'true') {
            return target.setAttribute('contenteditable', true);
          } else {
            return node.setAttribute('contenteditable', true);
          }
        }
      });
      node.addEventListener('mousemove', function(e){
        var target, ret, selection, imageAttr;
        if (!e.buttons) {
          target = e.target;
          ret = this$.search(e.target, document.createRange(), {
            x: e.clientX,
            y: e.clientY
          });
          while (target && target.getAttribute) {
            if (target.getAttribute('repeat-item')) {
              break;
            }
            target = target.parentNode;
          }
          if (target && target.getAttribute) {
            selection = window.getSelection();
            if (selection.extentOffset === 0 && (!ret || !(ret[2] != null) || ret[2] > 800)) {
              e.target.setAttribute('contenteditable', false);
            } else {
              e.target.setAttribute('contenteditable', true);
            }
          }
        }
        target = e.target;
        while (target && target.getAttribute) {
          if (target.getAttribute('image') || target.getAttribute('repeat-item')) {
            break;
          }
          target = target.parentNode;
        }
        if (!target || !target.getAttribute) {
          return;
        }
        imageAttr = target.getAttribute('image');
        return nodeHandle.toggle({
          node: target,
          inside: true,
          noRepeat: !target.getAttribute('repeat-item'),
          image: !!imageAttr,
          noDelete: target.getAttribute('editable') === 'false',
          aspectRatio: !!(imageAttr && imageAttr !== 'bk'),
          alignment: !!(imageAttr && imageAttr !== 'bk' && !target.getAttribute('repeat-item'))
        });
      });
      node.addEventListener('mouseover', function(e){
        var target, text, placeholder;
        target = e.target;
        while (target && target.getAttribute) {
          if (target.getAttribute('edit-text')) {
            break;
          }
          target = target.parentNode;
        }
        if (!target || !target.getAttribute) {
          return;
        }
        if (textHandle.isOn() && textHandle.tainted()) {
          return;
        }
        text = target.getAttribute(target.getAttribute('edit-text'));
        placeholder = target.getAttribute('edit-text-placeholder') || 'enter some text...';
        return textHandle.toggle({
          node: target,
          inside: true,
          text: text,
          placeholder: placeholder
        });
      });
      return node.addEventListener('click', function(e){
        var afterResize, cursor, cancelEditable, selection, range, target, editable, ret, that, calcRange, order;
        if (e.target && e.target._interactResize) {
          afterResize = true;
          delete e.target._interactResize;
        } else {
          afterResize = false;
        }
        cursor = null;
        cancelEditable = false;
        selection = window.getSelection();
        if (selection.rangeCount > 0) {
          range = window.getSelection().getRangeAt(0);
          if (range.startOffset < range.endOffset || !range.collapsed) {
            return;
          }
          cursor = [range.startContainer, range.startOffset];
        }
        target = e.target;
        while (target && target.parentNode && target.getAttribute) {
          if (target.getAttribute('repeat-item')) {
            break;
          }
          target = target.parentNode;
        }
        if (target && target.getAttribute && target.getAttribute('repeat-item')) {
          nodeHandle.toggle({
            node: target
          });
        } else {
          nodeHandle.toggle(null);
        }
        if (e.target && e.target.getAttribute && e.target.getAttribute('repeat-item') && !afterResize) {
          target = e.target;
          target.setAttribute('contenteditable', true);
          target.focus();
          selection = window.getSelection();
          if (selection.rangeCount) {
            range = selection.getRangeAt(0);
          } else {
            range = document.createRange();
            selection.addRange(range);
          }
          range.collapse(false);
          range.selectNodeContents(target);
          return;
        }
        target = e.target;
        editable = target.getAttribute('editable');
        if (editable === 'false') {
          cancelEditable = true;
        }
        target.removeAttribute('contenteditable');
        while (target) {
          if (target.getAttribute('editable') === 'true') {
            break;
          }
          if ((target.getAttribute('image') && target.getAttribute('image') !== 'bk') || target.getAttribute('editable') === 'false') {
            cancelEditable = true;
            break;
          } else if (target.parentNode && target.parentNode.getAttribute('repeat-host') === 'true') {
            break;
          }
          if (!target.parentNode) {
            return;
          }
          if (target === node) {
            break;
          }
          target = target.parentNode;
        }
        target.setAttribute('contenteditable', !cancelEditable);
        if (cancelEditable) {
          return;
        }
        range = document.createRange();
        ret = (that = cursor)
          ? that
          : this$.search(target, range, {
            x: e.clientX,
            y: e.clientY
          });
        if (!ret || ret.length === 0) {
          return;
        }
        calcRange = (that = document.caretPositionFromPoint)
          ? that(e.clientX, e.clientY)
          : document.caretRangeFromPoint(e.clientX, e.clientY);
        ret[0] = calcRange.startContainer;
        ret[1] = calcRange.startOffset;
        if (lastRange && e.shiftKey && e.target.getAttribute('repeat-item')) {
          order = [[lastRange.startContainer, lastRange.startOffset], [ret[0], ret[1]]];
          if (order[0][1] > order[1][1]) {
            order = [order[1], order[0]];
          }
          range.setStart(order[0][0], order[0][1]);
          range.setEnd(order[1][0], order[1][1]);
        } else {
          range.setStart(ret[0], ret[1]);
          range.collapse(true);
        }
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return lastRange = range;
      });
    },
    search: function(node, range, m, root){
      var ret, i$, to$, i, child, ref$, idx, dx, dy, j$, to1$, j, box, size, min;
      root == null && (root = true);
      ret = [];
      for (i$ = 0, to$ = node.childNodes.length; i$ < to$; ++i$) {
        i = i$;
        child = node.childNodes[i];
        if (child.nodeName === '#text') {
          ref$ = [-1, -1, -1], idx = ref$[0], dx = ref$[1], dy = ref$[2];
          for (j$ = 0, to1$ = child.length + 1; j$ < to1$; ++j$) {
            j = j$;
            range.setStart(child, j);
            box = range.getBoundingClientRect();
            size = box.height;
            if (box.x <= m.x && box.y <= m.y) {
              idx = j;
              dx = (m.x - box.x - size * 0.5) / size * 16;
              dy = (m.y - box.y - size * 0.5) / size * 16;
            } else if (box.x > m.x && box.y > m.y) {
              break;
            }
          }
          if (idx >= 0) {
            ret.push([child, idx, dx, dy]);
          }
          continue;
        }
        if (!child.getBoundingClientRect) {
          continue;
        }
        box = child.getBoundingClientRect();
        if (box.x <= m.x && box.y <= m.y) {
          ret = ret.concat(this.search(child, range, m, false));
        }
      }
      if (!root || !ret.length) {
        return ret;
      }
      ret = ret.map(function(it){
        return [it[0], it[1], Math.pow(it[2], 2) + Math.pow(it[3], 2)];
      });
      ref$ = [ret[0][2], 0], min = ref$[0], idx = ref$[1];
      for (i$ = 1, to$ = ret.length; i$ < to$; ++i$) {
        i = i$;
        if (ret[i][2] < min) {
          ref$ = [ret[i][2], i], min = ref$[0], idx = ref$[1];
        }
      }
      return ret[idx];
    }
  };
  page = {
    share: {
      modal: {},
      link: window.location.origin + (window.location.pathname + "/view").replace(/\/\//g, '/'),
      'public': false,
      setPublic: function(it){
        if (this['public'] === it) {
          return;
        }
        this['public'] = it;
        return collaborate.action.setPublic(this['public']);
      }
    },
    prepare: function(data){
      var x$;
      x$ = document.querySelector('#editor > .inner');
      x$.setAttribute('style', data.style || '');
      x$.style.width = $scope.config.size.value + "px";
      return this.share.setPublic((data.attr || {}).isPublic);
    }
  };
  block = {
    defaultInterface: {
      init: function(){},
      update: function(){},
      change: function(){},
      destroy: function(){}
    },
    library: {
      root: null,
      loaded: {},
      scripts: {},
      add: function(name){
        var this$ = this;
        return Promise.resolve().then(function(){
          if (this$.loaded[name]) {
            return;
          }
          return blockLoader.get(name);
        }).then(function(ret){
          var libraries, node, k, v, script;
          ret == null && (ret = {});
          if (!this$.root) {
            this$.root = document.querySelector('#editor-library');
          }
          libraries = (ret.exports || (ret.exports = {})).library;
          if (!libraries) {
            return;
          }
          node = document.createElement("div");
          for (k in libraries) {
            v = libraries[k];
            if (this$.scripts[v]) {
              continue;
            }
            script = this$.scripts[v] = document.createElement("script");
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', v);
            this$.root.appendChild(script);
          }
          return this$.loaded[name] = true;
        });
      }
    },
    style: {
      root: null,
      nodes: {},
      add: function(name){
        var this$ = this;
        return Promise.resolve().then(function(){
          if (this$.nodes[name]) {
            return;
          }
          return blockLoader.get(name);
        }).then(function(ret){
          var node;
          node = document.createElement("style");
          node.setAttribute('type', 'text/css');
          node.innerHTML = ret.css;
          if (!this$.root) {
            this$.root = document.querySelector('#editor-style');
          }
          return this$.root.appendChild(node);
        });
      },
      remove: function(name){
        if (!this.root || !this.nodes[name]) {
          return;
        }
        return this.root.removeChild(this.nodes[name]);
      },
      update: function(node, style){
        node.style = style;
        return editProxy.change([node]);
      }
    },
    remove: function(node){
      editProxy.deleteBlock(node);
      node.parentNode.removeChild(node);
      return editor.handles.hide(node);
    },
    init: function(){
      var e;
      editProxy.change();
      try {
        $scope.fontchooser.init();
        if ((typeof _jf != 'undefined' && _jf !== null) && _jf.flush) {
          return _jf.flush();
        }
      } catch (e$) {
        e = e$;
        return console.log(e);
      }
    },
    clone: function(node){
      var code;
      if (!node.childNodes[0]) {
        return;
      }
      code = node.childNodes[0].innerHTML;
      return this.prepare(code, {
        highlight: true,
        idx: Array.from(node.parentNode.childNodes).indexOf(node) + 1,
        name: node.getAttribute('base-block'),
        source: true,
        style: node.getAttribute('style')
      });
    },
    prepareHandle: {},
    prepareAsync: function(node, options){
      var this$ = this;
      options == null && (options = {
        idx: 0
      });
      return new Promise(function(res, rej){
        var idx;
        idx = options.idx || 0;
        if (this$.prepareHandle[idx]) {
          $timeout.cancel(this$.prepareHandle[idx]);
        }
        return this$.prepareHandle[idx] = $timeout(function(){
          this$.prepareHandle[idx] = 0;
          return this$.prepare(node, options).then(function(it){
            return res(it);
          })['catch'](function(it){
            return rej(it);
          });
        }, 10);
      });
    },
    indexing: function(){
      return btools.qsAll('#editor > .inner > [base-block]').map(function(d, i){
        return d.idx = i;
      });
    },
    prepare: function(node, options){
      var name, idx, redo, style, source, code, root, inner, that, eid, i$, i, promise, this$ = this;
      options == null && (options = {
        source: true
      });
      editor.cursor.save();
      name = options.name, idx = options.idx, redo = options.redo, style = options.style, source = options.source;
      code = null;
      if (typeof node === 'string') {
        code = node;
        node = document.createElement("div");
        root = document.querySelector('#editor > .inner');
        root.insertBefore(node, root.childNodes[idx]);
        editor.placeholder.remove();
      }
      if (options.content) {
        inner = Array.from(node.childNodes).filter(function(it){
          return /inner/.exec(it.getAttribute('class'));
        })[0];
        if (inner) {
          inner.innerHTML = puredom.sanitize(options.content);
        }
      }
      name = name || node.getAttribute('base-block');
      Array.from(node.attributes).map(function(it){
        var ref$;
        if (!((ref$ = it.name) === 'base-block' || ref$ === 'style')) {
          return node.removeAttribute(it.name);
        }
      });
      node.setAttribute('class', "initializing");
      if (that = options.eid) {
        eid = that;
      } else if (that = node.getAttribute('eid')) {
        eid = that;
      } else {
        for (i$ = 0; i$ < 100; ++i$) {
          i = i$;
          eid = Math.random().toString(16).substring(2);
          if (!document.querySelector("[eid='" + eid + "']")) {
            break;
          }
        }
      }
      node.setAttribute('eid', eid);
      node.setAttribute('id', "block-id-" + eid);
      return promise = blockLoader.get(name).then(function(ret){
        var inner, handle, ref$, me;
        node.setAttribute('class', "block-item block-" + name);
        node.setAttribute('base-block', name);
        if (!redo) {
          inner = document.createElement("div");
          inner.setAttribute('class', 'inner');
          inner.innerHTML = code
            ? puredom.sanitize(code)
            : ret.html;
          if (code && source) {
            aux.cleanAttrs(inner, ['eid']);
          }
          if (style) {
            node.setAttribute("style", style);
          }
          while (node.lastChild) {
            node.removeChild(node.lastChild);
          }
          node.appendChild(inner);
          handle = document.createElement("div");
          handle.setAttribute('class', 'handle ld ldt-float-left-in');
          handle.innerHTML = ['arrows', 'clone', 'cog', 'trash-o'].map(function(it){
            return "<i class='fa fa-" + it + "'></i>";
          }).join('');
          handle.addEventListener('click', function(e){
            var classList;
            classList = e.target.classList;
            if (classList.contains('fa-trash-o')) {
              return this$.remove(node);
            } else if (classList.contains('fa-clone')) {
              return this$.clone(node);
            } else if (classList.contains('fa-cog')) {
              return $scope.blockConfig.toggle(node);
            }
          });
          node.appendChild(handle);
          node.addEventListener('dragstart', function(e){
            return medium.pause();
          });
          node.addEventListener('dragend', function(e){
            return medium.resume();
          });
          node.addEventListener('drop', function(e){
            return medium.resume();
          });
          block.style.add(name);
          block.library.add(name);
        }
        if (!node.obj) {
          node.obj = new Object();
          node.obj.__proto__ = import$(import$(import$({}, node.obj.__proto__), block.defaultInterface), ret.exports || (ret.exports = {}));
          ref$ = node.obj;
          ref$.collab = collaborate;
          ref$.block = node;
          ref$.page = pageObject;
          ref$.viewMode = false;
          node.obj.init();
        }
        if (!redo && source) {
          editProxy.insertBlock(node);
        }
        if (!redo && options.highlight) {
          node.classList.add('ld', 'ldt-jump-in', 'fast');
        }
        inner = node.querySelector('.block-item > .inner');
        imageHandle.resizable(Array.from(inner.querySelectorAll('*[image]')));
        imageHandle.resizable(Array.from(inner.querySelectorAll('*[resizable]')));
        if (node.obj.editable !== false) {
          me = medium.prepare(inner);
        }
        sortEditable.init(inner, redo);
        node.obj.change(null, options.source);
        editor.cursor.load();
        return node;
      });
    }
  };
  $scope.css = {
    init: function(){
      var this$ = this;
      this.node = document.querySelector('#editor-css');
      this.style = document.querySelector('#editor-css style');
      $scope.$watch('css.inline.value', function(n, o){
        if (n === o) {
          return;
        }
        collaborate.action.css.editInline(n);
        return this$.style.textContent = n;
      });
      $scope.$watch('css.theme.value.name', function(n, o){
        if (n !== o) {
          return collaborate.action.css.editTheme($scope.css.theme.value);
        }
      });
      return this.theme.value = this.theme.list[0];
    },
    prepare: function(css){
      var this$ = this;
      css == null && (css = {});
      return $scope.force$apply(function(){
        var ref$;
        this$.inline.value = css.inline;
        this$.theme.value = css.theme;
        return (ref$ = this$.links).list = ref$.list.concat(css.links);
      });
    },
    theme: {
      value: {},
      list: {
        name: "Default"
      },
      update: function(value){
        var this$ = this;
        return $scope.force$apply(function(){
          return this$.value = value;
        });
      }
    },
    inline: {
      value: "",
      update: function(value){
        var this$ = this;
        return $scope.force$apply(function(){
          return this$.value = value;
        });
      }
    },
    links: {
      value: null,
      list: [],
      add: function(value, local){
        var this$ = this;
        local == null && (local = false);
        return $scope.force$apply(function(){
          if (!value) {
            return;
          }
          this$.list.push(value);
          if (!local) {
            return;
          }
          collaborate.action.css.addLink(value);
          return this$.value = null;
        });
      },
      remove: function(value, local){
        var this$ = this;
        local == null && (local = false);
        return $scope.force$apply(function(){
          var idx;
          if (!value) {
            return;
          }
          idx = this$.list.indexOf(value);
          if (!~idx) {
            return;
          }
          this$.list.splice(idx, 1);
          if (!local) {
            return;
          }
          collaborate.action.css.removeLink(value);
          return this$.value = null;
        });
      }
    }
  };
  $scope.css.init();
  editor = {
    user: $scope.user,
    css: $scope.css,
    handles: {
      hide: function(node){
        nodeHandle.toggle(null);
        return textHandle.toggle(null);
      }
    },
    reload: function(){
      return window.location.reload();
    },
    online: {
      defaultCountdown: 10,
      state: true,
      code: null,
      retry: function(){
        editor.loading.toggle(true);
        this.state = true;
        $timeout(function(){
          return collaborate.init(document.querySelector('#editor .inner'), editor);
        }, 100);
        if (!this.retry.countdown || this.retry.countdown < 0) {
          return this.retry.countdown = this.defaultCountdown;
        } else {
          return this.retry.countdown--;
        }
      },
      toggle: function(v, options){
        var this$ = this;
        options == null && (options = {});
        return $scope.force$apply(function(){
          if (!options && this$.retry.countdown) {
            return this$.retry();
          }
          this$.code = options.code;
          editor.online.state = v;
          return editor.loading.toggle(true);
        });
      }
    },
    loading: {
      toggle: function(v){
        return $scope.force$apply(function(){
          if (v != null) {
            return $scope.loading = v;
          } else {
            return $scope.loading = !$scope.loading;
          }
        });
      }
    },
    server: (ref$ = {}, ref$.domain = global.domain, ref$.scheme = global.scheme, ref$),
    collaborator: {
      list: {},
      count: 0,
      init: function(){
        var this$ = this;
        return $timeout(function(){
          var k, ref$, v, results$ = [];
          this$.count = 0;
          for (k in ref$ = this$.list || {}) {
            v = ref$[k];
            this$.list[k].cbox = editor.cursor.toBox(this$.list[k].cursor || {});
            results$.push(this$.count++);
          }
          return results$;
        }, 0);
      },
      handle: function(cursor){
        var ref$, that, key$, ref1$;
        if (cursor.action === 'init') {
          this.list = cursor.data;
          return this.init();
        } else if ((ref$ = cursor.action) === 'join' || ref$ === 'update') {
          if (!this.list[cursor.key]) {
            this.count++;
          }
          this.list[cursor.key] = import$(this.list[cursor.key] || {}, cursor.data);
          if (that = this.list[cursor.key].cursor) {
            return this.list[cursor.key].cbox = editor.cursor.toBox(that);
          }
        } else if (cursor.action === 'exit') {
          if (this.list[cursor.key]) {
            this.count--;
            return ref1$ = (ref$ = this.list)[key$ = cursor.key], delete ref$[key$], ref1$;
          }
        }
      }
    },
    cursor: {
      state: null,
      get: function(){
        var selection, range;
        selection = window.getSelection();
        if (!selection.rangeCount) {
          return null;
        }
        range = selection.getRangeAt(0);
        return {
          startSelector: btools.getEidSelector(range.startContainer),
          startOffset: range.startOffset,
          endSelector: btools.getEidSelector(range.endContainer),
          endOffset: range.endOffset
        };
      },
      save: function(){
        return this.state = this.get();
      },
      toBox: function(state){
        var range, rbox, box, ref$;
        range = this.toRange(state);
        rbox = document.querySelector('#editor > .inner').getBoundingClientRect();
        if (!(range && rbox)) {
          return;
        }
        box = range.getBoundingClientRect();
        ref$ = [box.x - rbox.x, box.y - rbox.y], box.x = ref$[0], box.y = ref$[1];
        return ref$ = {
          blur: box.x < 0 || box.x > rbox.width
        }, ref$.x = box.x, ref$.y = box.y, ref$.width = box.width, ref$.height = box.height, ref$;
      },
      toRange: function(state){
        var range, startContainer, endContainer, e;
        range = document.createRange();
        startContainer = btools.fromEidSelector(state.startSelector);
        endContainer = btools.fromEidSelector(state.endSelector);
        if (!startContainer) {
          return null;
        }
        try {
          range.setStart(startContainer, state.startOffset);
          if (endContainer) {
            range.setEnd(endContainer, state.endOffset);
          }
        } catch (e$) {
          e = e$;
          return null;
        }
        return range;
      },
      load: function(){
        var selection, range;
        if (!this.state) {
          return;
        }
        selection = window.getSelection();
        range = this.toRange(this.state);
        if (!range) {
          return;
        }
        selection.removeAllRanges();
        selection.addRange(range);
        return this.state = null;
      }
    },
    page: page,
    block: block,
    placeholder: {
      remove: function(){
        var node;
        node = document.querySelector('#editor > .inner > .placeholder');
        if (node) {
          return node.parentNode.removeChild(node);
        }
      }
    },
    prune: function(root){
      Array.from(root.querySelectorAll('[editable]')).map(function(n){
        return n.removeAttribute('editable');
      });
      Array.from(root.querySelectorAll('[contenteditable]')).map(function(n){
        return n.removeAttribute('contenteditable');
      });
      return Array.from(root.querySelectorAll('.block-item > .handle')).map(function(n){
        return n.parentNode.removeChild(n);
      });
    },
    'export': function(option){
      var root, style, css, baseStyle, payload;
      option == null && (option = {});
      root = document.querySelector('#editor > .inner').cloneNode(true);
      style = document.querySelector('#editor-style');
      css = document.querySelector('#editor-css');
      baseStyle = document.querySelector('#page-basic');
      this.prune(root);
      if (option.bodyOnly) {
        payload = root.innerHTML;
      } else {
        payload = "<html><head>\n<link rel=\"stylesheet\" type=\"text/css\"\nhref=\"https://makeweb.io/blocks/all.min.css\"/>\n<link rel=\"stylesheet\" type=\"text/css\"\nhref=\"https://makeweb.io/css/pack/viewer.min.css\"/>\n<script type=\"text/javascript\"\nsrc=\"https://makeweb.io/js/pack/viewer.js\"></script>\n" + style.innerHTML + "\n<style type=\"text/css\"> " + baseStyle.innerHTML + " </style>\n" + css.innerHTML + "\n</head><body>\n" + root.innerHTML + "\n</body></html>";
      }
      return puredom.sanitize(payload, {
        ADD_TAGS: ['html', 'head', 'body', 'link', 'style'],
        WHOLE_DOCUMENT: true
      });
    }
  };
  Sortable.create(document.querySelector('#blocks-picker'), {
    group: {
      name: 'block',
      put: false,
      pull: 'clone'
    },
    disabled: false,
    sort: false,
    draggable: '.block-thumb'
  });
  Sortable.create(document.querySelector('#editor .inner'), {
    group: {
      name: 'block',
      pull: 'clone'
    },
    filter: '.unsortable',
    preventOnFilter: false,
    disabled: false,
    draggable: '.block-item',
    dragoverBubble: true,
    scrollSensitivity: 60,
    scrollSpeed: 30,
    onAdd: function(it){
      return block.prepare(it.item);
    },
    onStart: function(evt){
      var lists;
      lists = btools.qsAll('iframe', evt.item);
      evt.item._iframes = lists;
      return lists.map(function(it){
        it._original = {
          parentNode: it.parentNode,
          nextSibling: it.nextSibling
        };
        return it.parentNode.removeChild(it);
      });
    },
    onEnd: function(evt){
      var ref$, src, des;
      ref$ = [evt.oldIndex, evt.newIndex], src = ref$[0], des = ref$[1];
      if (evt.item._iframes) {
        evt.item._iframes.map(function(it){
          return it._original.parentNode.insertBefore(it, it._original.nextSibling);
        });
      }
      if (evt.clone.deleted) {
        this.el.removeChild(evt.item);
        return ldNotify.warning('The block you drag is deleted by others.');
      } else {
        if (evt.clone.idx != null && evt.clone.idx !== evt.oldIndex) {
          src = evt.clone.idx;
        }
        if (src === des) {
          return;
        }
        return editProxy.moveBlock(src, des);
      }
    }
  });
  x$ = document.querySelector('#editor > .inner');
  x$.addEventListener('dragover', function(){
    return editor.placeholder.remove();
  });
  $scope.collaborator = editor.collaborator;
  $scope['export'] = {
    modal: {
      config: {},
      ctrl: {}
    },
    run: function(){
      this.code = editor['export']();
      return this.modal.ctrl.toggle(true);
    }
  };
  $scope.preview = {
    modal: {},
    run: function(){
      document.querySelector('#editor-preview iframe').setAttribute('src', page.share.link + "?preview=true");
      return this.modal.ctrl.toggle(true);
    }
  };
  $scope.config = {
    modal: {},
    size: {
      value: 1024,
      name: '1024px',
      resizeAsync: ldBase.async('resize', function(){
        var this$ = this;
        return $scope.force$apply(function(){
          var maxSize, i$, ref$, len$, size;
          maxSize = window.innerWidth - 180 * 2;
          for (i$ = 0, len$ = (ref$ = [1440, 1200, 1024, 800, 640, 480]).length; i$ < len$; ++i$) {
            size = ref$[i$];
            if (size < maxSize) {
              break;
            }
          }
          return this$.set(size + "px");
        });
      }),
      relayout: function(){
        var widgets, panel, preview, inner;
        widgets = document.querySelector('#blocks-picker');
        panel = document.querySelector('#collab-info');
        preview = document.querySelector('.editor-preview-modal .cover-modal-inner');
        inner = document.querySelector('#editor > .inner');
        widgets.style.right = (this.value + Math.round((window.innerWidth - this.value) / 2)) + "px";
        panel.style.left = (this.value + Math.round((window.innerWidth - this.value) / 2)) + "px";
        preview.style.width = this.value + "px";
        inner.style.width = this.value + "px";
        return setTimeout(function(){
          return Array.from(document.querySelectorAll('#editor > .inner *[base-block]')).map(function(block){
            if ((block.obj || (block.obj = {})).resize) {
              return (block.obj || (block.obj = {})).resize();
            }
          });
        }, 1000);
      },
      set: function(name){
        if (/px/.exec(name)) {
          this.value = parseInt(name.replace(/px/, ''));
        } else if (/Full/.exec(name)) {
          this.value = window.innerWidth;
        } else if (/%/.exec(name)) {
          this.value = window.innerWidth * Math.round(name.replace(/%/, '')) * 0.01;
        }
        this.name = name;
        return this.relayout();
      }
    }
  };
  $scope.insert = {
    node: function(node){
      return new Promise(function(res, rej){
        var selection, range, target;
        editor.cursor.load();
        selection = window.getSelection();
        if (!(selection && selection.rangeCount)) {
          return rej();
        }
        range = selection.getRangeAt(0);
        target = range.startContainer;
        while (target && (target.getAttribute || target.nodeType === 3)) {
          if (target.getAttribute && target.getAttribute('base-block')) {
            break;
          }
          target = target.parentNode;
        }
        if (target.nodeType !== 3 && !(target && target.getAttribute && target.getAttribute('base-block'))) {
          return;
        }
        range.collapse(true);
        range.insertNode(node);
        range.setStartAfter(node);
        selection.removeAllRanges();
        selection.addRange(range);
        return res();
      });
    },
    image: function(){
      var shrink, dialog, this$ = this;
      shrink = "1024x1024";
      dialog = uploadcare.openDialog(null, null, {
        imageShrink: shrink,
        crop: 'free'
      });
      return dialog.done(function(it){
        var file, that, img, imgInner;
        file = ((that = it.files)
          ? that()
          : [it])[0];
        img = document.createElement("div");
        img.setAttribute('editable', false);
        img.setAttribute('contenteditable', false);
        img.setAttribute('image', 'image');
        img.setAttribute('preserve-aspect-ratio', true);
        imgInner = document.createElement("div");
        imgInner.style.paddingBottom = "50%";
        img.appendChild(imgInner);
        img.style.width = "3em";
        img.style.height = "auto";
        img.style.backgroundImage = "url(/assets/img/loader/msg.svg)";
        img.style.backgroundColor = '#ccc';
        return this$.node(img).then(function(){
          return file.done(function(info){
            var ratio;
            ratio = Math.round(100 * (info.crop.width / info.crop.height)) * 0.01;
            img.setAttribute('image-ratio', ratio);
            img.style.backgroundImage = "url(" + info.cdnUrl + ")";
            img.style.backgroundColor = "";
            img.style.width = info.crop.width + "px";
            img.style.backgroundSize = "100% 100%";
            imgInner.style.paddingBottom = 100 / ratio + "%";
            imageHandle.resizable(img);
            return editProxy.editBlock(img);
          });
        })['catch'](function(){});
      });
    },
    hr: function(){
      var hr;
      hr = document.createElement("hr");
      return this.node(hr).then(function(){
        return editProxy.editBlock(hr);
      });
    },
    button: function(){
      var btnContainer, btn;
      btnContainer = document.createElement("a");
      btnContainer.setAttribute('repeat-host', 'repeat-host');
      btn = document.createElement("a");
      btn.classList.add('btn', 'btn-primary', 'm-1');
      btn.innerHTML = "Get Start";
      btn.setAttribute('href', "#");
      btn.setAttribute('editable', "true");
      btn.setAttribute('repeat-item', "repeat-item");
      btnContainer.appendChild(btn);
      return this.node(btnContainer).then(function(){
        return editProxy.editBlock(btnContainer);
      });
    },
    icon: function(){
      return $scope.iconPicker.toggle();
    },
    toggle: function(value, box){
      var handle, scrolltop, x$, y$, top;
      box == null && (box = {});
      handle = document.querySelector('#editor-insert-handle');
      handle.style.display = value ? 'block' : 'none';
      if (value) {
        scrolltop = document.scrollingElement.scrollTop;
        x$ = handle.style;
        x$.top = '10px';
        x$.opacity = 0.8;
        return x$;
      } else {
        y$ = handle.style;
        top = '-100px';
        y$.opacity = 0;
        return y$;
      }
    }
  };
  ['keyup', 'mouseup', 'focus', 'blur'].map(function(it){
    return document.body.addEventListener(it, function(e){
      return setTimeout(function(){
        var sel, block;
        sel = window.getSelection();
        if (!sel.isCollapsed || !sel.rangeCount) {
          return $scope.insert.toggle(false);
        }
        block = btools.traceUp("[contenteditable='true']", e.target);
        if (!block) {
          return $scope.insert.toggle(false);
        }
        return $scope.insert.toggle(true, sel.getRangeAt(0).getBoundingClientRect());
      }, 0);
    });
  });
  $scope.iconPicker = {
    modal: {},
    toggle: function(){
      return this.modal.ctrl.toggle();
    },
    keyword: '',
    click: function(e){
      var code, icon;
      if (!e.target || !e.target.getAttribute) {
        return;
      }
      code = e.target.getAttribute("c");
      if (!code) {
        return;
      }
      code = "&#x" + code + ";";
      icon = document.createElement("i");
      icon.classList.add('fa-icon');
      icon.innerHTML = code;
      $scope.insert.node(icon);
      this.modal.ctrl.toggle(false);
      return editProxy.editBlock(icon);
    },
    init: function(){
      var this$ = this;
      return $scope.$watch('iconPicker.keyword', function(){
        return btools.qsAll('#editor-icon-picker-list i.fa').map(function(it){
          if (!this$.keyword || this$.keyword === '' || ~it.classList.value.indexOf(this$.keyword)) {
            return it.classList.remove('d-none');
          } else {
            return it.classList.add('d-none');
          }
        });
      });
    }
  };
  $scope.iconPicker.init();
  $scope.pageConfig = {
    modal: {},
    tab: 1,
    toggle: function(){
      webSettings.setBlock(document.querySelector('#editor > .inner'));
      return this.modal.ctrl.toggle();
    }
  };
  $scope.blockConfig = {
    modal: {},
    toggle: function(node){
      webSettings.setBlock(node);
      return this.modal.ctrl.toggle();
    }
  };
  $scope.share = page.share;
  $scope.$watch('config.size.value', function(){
    return $scope.config.size.relayout();
  });
  $scope.$watch('user.data.key', function(n, o){
    if ((n || o) && n !== o) {
      return $timeout(function(){
        return window.location.reload();
      }, 5000);
    }
  });
  $scope.editor = editor;
  document.body.addEventListener('keyup', function(e){
    nodeHandle.toggle(null);
    return editProxy.editBlock(e.target);
  });
  editor.online.retry();
  document.querySelector('#editor .inner').addEventListener('click', function(e){
    var target;
    target = e.target;
    while (target) {
      if (target.getAttribute && target.getAttribute('edit-text')) {
        break;
      }
      target = target.parentNode;
    }
    if (target && target.getAttribute && target.getAttribute('edit-text')) {
      return textHandle.toggle(null);
    }
  });
  lastCursor = null;
  $interval(function(){
    var cursor;
    if (!$scope.user.data) {
      return;
    }
    cursor = editor.cursor.get();
    if (JSON.stringify(cursor) === JSON.stringify(lastCursor)) {
      return;
    }
    collaborate.action.cursor($scope.user.data, cursor);
    return lastCursor = cursor;
  }, 1000);
  document.body.addEventListener('mouseup', function(){
    var selection, range, ref$, start, end, cur, oldend;
    selection = window.getSelection();
    if (!selection.rangeCount) {
      return;
    }
    range = selection.getRangeAt(0);
    ref$ = [range.startContainer, range.endContainer], start = ref$[0], end = ref$[1];
    if (start !== end) {
      cur = start;
      while (cur && cur.parentNode) {
        cur = cur.parentNode;
        if (end === cur) {
          return range.selectNodeContents(start);
        }
      }
      oldend = end;
      while (end && end.parentNode) {
        end = end.previousSibling || end.parentNode;
        if (end.childNodes.length === 0 || (end === oldend.parentNode && Array.from(end.childNodes).indexOf(oldend) === 0)) {
          continue;
        }
        break;
      }
    }
    if (start.nodeType === 3) {
      start = start.previousSibling || start.parentNode;
    }
    if (end.nodeType === 3) {
      end = end.previousSibling || end.parentNode;
    }
    if (start === end && end !== range.endContainer && range.endOffset === 0) {
      return range.selectNodeContents(start);
    }
  });
  blocksPicker = document.querySelector('#blocks-picker');
  blocksPreview = document.querySelector('#blocks-preview');
  blocksPicker.addEventListener('dragstart', function(){
    return blocksPreview.style.display = 'none';
  });
  blocksPicker.addEventListener('mouseout', function(e){
    return blocksPreview.style.display = 'none';
  });
  blocksPicker.addEventListener('mousemove', function(e){
    var target, box, name, ratio, windowBottom, popupTop, popupHeight, x$, y$;
    target = e.target;
    if (!target.classList || !target.classList.contains("thumb")) {
      if (target !== blocksPicker) {
        blocksPreview.style.display = 'none';
      }
      return;
    }
    box = target.getBoundingClientRect();
    name = target.getAttribute('name');
    ratio = target.getAttribute('ratio');
    if (ratio < 20) {
      ratio = 20;
    }
    windowBottom = window.innerHeight + document.scrollingElement.scrollTop;
    popupTop = box.y + box.height * 0.5 - 25 + document.scrollingElement.scrollTop;
    popupHeight = 2.56 * ratio;
    if (popupTop + popupHeight > windowBottom - 5) {
      popupTop = windowBottom - popupHeight - 5;
    }
    x$ = blocksPreview.style;
    x$.left = (box.x + box.width) + "px";
    x$.top = popupTop + "px";
    x$.display = 'block';
    blocksPreview.querySelector('.name').innerText = name;
    y$ = blocksPreview.querySelector('.inner').style;
    y$.backgroundImage = "url(/blocks/" + name + "/index.png)";
    y$.height = "0";
    y$.paddingBottom = (ratio - 1) + "%";
    return y$;
  });
  document.addEventListener('scroll', function(){
    nodeHandle.toggle(null);
    $scope.insert.toggle(false);
    return blocksPreview.style.display = 'none';
  });
  ['mousemove', 'keydown', 'scroll'].map(function(name){
    return document.addEventListener(name, function(){
      return editor.online.retry.countdown = editor.online.defaultCountdown;
    });
  });
  window.addEventListener('resize', function(){
    return $scope.config.size.resizeAsync();
  });
  $scope.config.size.resizeAsync();
  window.addEventListener('keydown', function(e){
    if (!(e.metaKey || e.ctrlKey)) {
      return;
    }
    if (e.keyCode === 90) {
      collaborate.history.undo();
      e.preventDefault();
      return false;
    }
  });
  document.addEventListener('selectionchange', function(e){
    var sel, range, ref$, end, offset;
    sel = window.getSelection();
    if (!sel.rangeCount) {
      return;
    }
    range = sel.getRangeAt(0);
    ref$ = [range.endContainer, range.endOffset], end = ref$[0], offset = ref$[1];
    if (end.getAttribute && end.getAttribute('editable') === 'false') {
      while (end && !end.previousSibling) {
        end = end.parentNode;
      }
      if (!end || !end.previousSibling) {
        return;
      }
      end = end.previousSibling;
      offset = end.length || (end.childNodes && end.childNodes.length) || 0;
      range.setEnd(end, offset);
      sel.removeAllRanges();
      return sel.addRange(range);
    }
  });
  window.addEventListener('error', function(){
    return $scope.force$apply(function(){
      return $scope.crashed = true;
    });
  });
  return $scope.fontchooser = {
    enable: false,
    init: function(){
      if (!this.enable) {
        return;
      }
      return setTimeout(function(){
        var traverse, t1, hash, t2, chooser;
        traverse = function(root, hash){
          var style, i$, to$, i, results$ = [];
          if (!root || root.nodeType !== 1) {
            return;
          }
          style = window.getComputedStyle(root);
          if (style && style.fontFamily) {
            style.fontFamily.split(',').map(function(it){
              return it.trim();
            }).filter(function(it){
              return it;
            }).map(function(it){
              return hash[it] = (hash[it] || '') + root.innerText;
            });
          }
          for (i$ = 0, to$ = root.childNodes.length; i$ < to$; ++i$) {
            i = i$;
            results$.push(traverse(root.childNodes[i], hash));
          }
          return results$;
        };
        t1 = new Date().getTime();
        hash = {};
        traverse(document.querySelector('#editor > .inner'), hash);
        t2 = new Date().getTime();
        chooser = new choosefont({
          metaUrl: "/assets/choosefont.js/meta.json",
          base: "https://plotdb.github.io/xl-fontset/alpha"
        });
        chooser.on('choose', function(it){
          return it.sync(hash[it.name] || '');
        });
        return chooser.init(function(){
          var k;
          return chooser.find((function(){
            var results$ = [];
            for (k in hash) {
              results$.push(k);
            }
            return results$;
          }())).map(function(it){
            return chooser.load(it[0]);
          });
        });
      }, 1000);
    }
  };
}));
function import$(obj, src){
  var own = {}.hasOwnProperty;
  for (var key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}
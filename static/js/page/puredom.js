var puredom;puredom={useAttr:function(t){var e,s,i,h=[];for(this.useAttr.hash||(this.useAttr.hash={}),e=0,s=t.length;s>e;++e)i=t[e],this.useAttr.hash[i]||(this.useAttr.hash[i]=!0,h.push(this.options.ADD_ATTR.push(i)));return h},options:{ADD_ATTR:["repeat-host","repeat-item","base-block","edit-text","edit-text-placeholder","image","repeat-class"]},sanitize:function(t){return null==t&&(t=""),DOMPurify.sanitize(t,this.options)}};
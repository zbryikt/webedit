<-(->it!) _
return
ldcv = new ldcover root: \.ldcv
ldcv.get!
up = new uploadr root: '.ldcv .uploadr', provider: uploadr.ext.native
up.on \upload.done, -> console.log it


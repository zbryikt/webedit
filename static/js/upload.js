// Generated by LiveScript 1.3.0
(function(it){
  return it();
})(function(){
  var ldcv, up;
  return;
  ldcv = new ldcover({
    root: '.ldcv'
  });
  ldcv.get();
  up = new uploadr({
    root: '.ldcv .uploadr',
    provider: uploadr.ext.native
  });
  return up.on('upload.done', function(it){
    return console.log(it);
  });
});
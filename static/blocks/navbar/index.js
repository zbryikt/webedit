// Generated by LiveScript 1.3.0
module.exports = {
  init: function(){
    return this.change();
  },
  change: function(){
    var bar, bk, fk, this$ = this;
    bar = this.block.querySelector('nav.navbar');
    bk = this.block.style.backgroundColor || this.block.style.backgroundImage || null;
    fk = this.block.style.color || null;
    return btools.qs('nav.navbar', this.block).map(function(node){
      if (bk) {
        node.style.background = bk;
      }
      if (fk) {
        return node.style.color = fk;
      }
    });
  }
};
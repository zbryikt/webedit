// Generated by LiveScript 1.3.0
module.exports = {
  custom: {
    attrs: ['card-score']
  },
  init: function(){
    if (this.viewMode) {
      return this.block.addEventListener('click', function(e){
        var node;
        node = btools.traceUp('.flip-card', e.target);
        if (!node) {
          return;
        }
        return node.classList.add('flip');
      });
    }
  },
  destroy: function(){}
};
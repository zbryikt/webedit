// Generated by LiveScript 1.3.0
module.exports = {
  init: function(){
    var this$ = this;
    return this.block.addEventListener('click', function(e){
      var box, isAdd, index;
      if (e.target.nodeName !== 'TH') {
        return;
      }
      box = e.target.getBoundingClientRect();
      if (e.offsetX > box.width - 30 && e.offsetX < box.width - 10) {
        isAdd = true;
      } else if (e.offsetX < 30 && e.offsetX > 10) {
        isAdd = false;
      } else {
        return;
      }
      index = Array.from(e.target.parentNode.childNodes).indexOf(e.target);
      btools.qsAll('tr', this$.block).map(function(tr, i){
        if (isAdd) {
          return tr.insertBefore(tr.childNodes[index].cloneNode(true), tr.childNodes[index + 1]);
        } else {
          return tr.removeChild(tr.childNodes[index]);
        }
      });
      return this$.collab.action.editBlock(this$.block);
    });
  }
};
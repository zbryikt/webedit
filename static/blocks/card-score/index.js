// Generated by LiveScript 1.3.0
module.exports = {
  custom: {
    attrs: ['card-score-sep']
  },
  init: function(){
    var this$ = this;
    if (!this.viewMode) {
      return;
    }
    return setInterval(function(){
      var score, sep, matched;
      score = Array.from(document.querySelectorAll('.chosen[card-score]')).map(function(d, i){
        return +d.getAttribute('card-score');
      }).filter(function(it){
        return !isNaN(it);
      }).reduce(function(a, b){
        return a + b;
      }, 0);
      sep = Array.from(this$.block.querySelectorAll('.card-score'));
      sep.map(function(it){
        it.sep = it.getAttribute('card-score-sep');
        return it.sep = it.sep === null
          ? NaN
          : +it.sep;
      });
      sep.sort(function(a, b){
        return a.sep - b.sep;
      });
      matched = sep.filter(function(it){
        return it.sep != null && !isNaN(it.sep) && it.sep > score;
      });
      if (!matched.length) {
        matched = sep.filter(function(it){
          return isNaN(it.sep);
        });
      }
      sep.map(function(it){
        return it.classList.remove('matched');
      });
      if (matched[0]) {
        return matched[0].classList.add('matched');
      }
    }, 1000);
  },
  destroy: function(){}
};
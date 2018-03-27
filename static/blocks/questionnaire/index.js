// Generated by LiveScript 1.3.0
module.exports = {
  wrap: function(node){
    return node.addEventListener('click', function(e){
      var target, className, len, isActive;
      if (!/choice/.exec(e.target.getAttribute('class'))) {
        return;
      }
      target = e.target;
      className = target.getAttribute('class').split(' ');
      len = className.length;
      className = className.filter(function(it){
        return it !== 'active';
      });
      isActive = className.length !== len;
      Array.from(target.parentNode.childNodes).map(function(it){
        return it.setAttribute('class', it.getAttribute('class').replace(/ ?active ?/, ' ').trim());
      });
      if (isActive) {
        return target.setAttribute(className.join(' ').concat(' active'));
      }
    });
  }
};
/*
$.ajax { url: '/blocks/list.json' }
  .done (data) ->
    widgets = document.querySelector \#blocks-picker
    widgets.style.right = "#{800 + Math.round((window.innerWidth - 800)/2)}px"
    widgets.style.left = "auto"
    return
    for item in data =>
      node = document.createElement \div
      node.setAttribute \class, 'block'
      node.setAttribute \data-name, item
      node.style.backgroundImage = "url(/blocks/#item/index.svg)"
      node.innerHTML = item
      widgets.appendChild node
      node.addEventListener \dragstart, (e) -> mes.map -> it.destroy!
      node.addEventListener \dragend, (e) -> mes.map -> it.setup!
*/

angular.module \webedit
  ..controller \blocksPicker, <[$scope $http]> ++ ($scope, $http) ->
    widgets = document.querySelector \#blocks-picker
    widgets.style.right = "#{800 + Math.round((window.innerWidth - 800)/2)}px"
    widgets.style.left = "auto"
    $http { url: '/blocks/list.json' }
      .then (it) ->
        $scope.blocks = it.data

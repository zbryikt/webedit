angular.module \webedit
  ..controller \blocksPicker, <[$scope $http]> ++ ($scope, $http) ->
    widgets = document.querySelector \#blocks-picker
    widgets.style.right = "#{1024 + Math.round((window.innerWidth - 1024)/2)}px"
    widgets.style.left = "auto"
    $http { url: '/blocks/list.json' }
      .then (it) ->
        $scope.blocks = it.data

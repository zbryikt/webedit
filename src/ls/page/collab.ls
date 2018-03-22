angular.module \webedit
  ..controller \collabInfo, <[$scope $http]> ++ ($scope, $http) ->
    panel = document.querySelector \#collab-info
    panel.style.left = "#{800 + Math.round((window.innerWidth - 800)/2)}px"
    panel.style.right = "auto"


angular.module \webedit
  ..controller \profile, <[$scope $http]> ++ ($scope, $http) ->
    $http do
      url: \/d/me/doc/
      method: \GET
    .then (ret) ->
      $scope.docs = ret.data

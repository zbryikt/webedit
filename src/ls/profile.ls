angular.module \webedit
  ..controller \profile, <[$scope $http]> ++ ($scope, $http) ->
    $http do
      url: \/d/me/doc/
      method: \GET
    .then (ret) ->
      $scope.docs = ret.data
      $scope.docs.map -> it.timestamp = new Date(it.modifiedtime or it.createdtime).getTime!
      $scope.docs.sort (a,b) -> b.timestamp - a.timestamp

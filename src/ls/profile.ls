angular.module \webedit
  ..controller \profile, <[$scope $http]> ++ ($scope, $http) ->
    $scope.page = do
      delete: (slug) ->
        $http do
          url: "/d/page/#slug/"
          method: \DELETE
        .then -> $scope.docs = $scope.docs.filter -> it.slug != slug

    $http do
      url: \/d/me/doc/
      method: \GET
    .then (ret) ->
      $scope.docs = ret.data
      $scope.docs.map ->
        it.timestamp = new Date(it.modifiedtime or it.createdtime).getTime!
        if it.thumbnail => it.thumbnail = it.thumbnail.replace /\/\d+x\d+\//, '/80x42/'
      $scope.docs.sort (a,b) -> b.timestamp - a.timestamp

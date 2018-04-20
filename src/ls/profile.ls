angular.module \webedit
  ..controller \profile, <[$scope $http $timeout ldNotify]> ++ ($scope, $http, $timeout, ldNotify) ->
    $scope.page = do
      delete: (slug) ->
        $http do
          url: "/d/page/#slug/"
          method: \DELETE
        .then -> $scope.docs = $scope.docs.filter -> it.slug != slug
    $scope.doc = list: [], cur: [], set: (list) -> @cur = list
    $http do
      url: \/d/me/doc/
      method: \GET
    .then (ret) ->
      ret.data.map ->
        it.timestamp = new Date(it.modifiedtime or it.createdtime).getTime!
        if it.thumbnail => it.thumbnail = it.thumbnail.replace /\/\d+x\d+\//, '/80x42/'
      ret.data.sort (a,b) -> b.timestamp - a.timestamp
      $scope.doc.list = []
      while ret.data.length
        $scope.doc.list.push ret.data.splice(0, 20)
      $scope.doc.cur = $scope.doc.list.0
    $scope.page = do
      thumbnail: (doc) ->
        shrink = "1024x1024"
        dialog = uploadcare.open-dialog null, null, {
          imageShrink: shrink
          crop: \free
        }
        dialog.done ->
          file = (if it.files => that! else [it]).0
          $scope.$apply -> doc.thumbnailLoading = true
          file.done (info) -> $scope.$apply ->
            doc.thumbnail = "#{info.cdnUrl}"
            doc.thumbnailLoading = false
            $scope.page.update doc

      update: (doc, do-close = false) ->
        $scope.loading = true
        $http url: "/d/page/#{doc.slug}/", method: \PUT, data: doc{title, thumbnail, domain, path, gacode}
          .finally -> $scope.loading = true
          .then ->
            $scope.loading = false
            if do-close => doc.toggled = false
            ldNotify.send \success, 'saved.'
          .catch -> alert "failed to save. try again later"

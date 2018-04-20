angular.module \webedit
  ..controller \profile, <[$scope $http $timeout ldNotify]> ++ ($scope, $http, $timeout, ldNotify) ->
    $scope.doc = do
      list: [], cur: [], idx: 0
      page-at: (idx) ->
        if !@list[idx] => idx--
        console.log idx, @list[idx]
        @ <<< {cur: @list[idx], idx: idx}
      fetch: ->
        $http do
          url: \/d/me/doc/
          method: \GET
        .then (ret) ~>
          ret.data.map ->
            it.timestamp = new Date(it.modifiedtime or it.createdtime).getTime!
            if it.thumbnail => it.thumbnail = it.thumbnail.replace /\/\d+x\d+\//, '/80x42/'
          @raw = ret.data
          @prepare!
      delete: (doc) ->
        idx = @raw.indexOf(doc)
        if !(~idx) => return
        @raw.splice idx, 1
        @prepare!
      prepare: ->
        @raw.sort (a,b) -> b.timestamp - a.timestamp
        @list = []
        for i from 0 to Math.floor(@raw.length / 20) =>
          @list.push []
          for j from 0 til 20 =>
            if i * 20 + j >= @raw.length => break
            @list[i].push @raw[i * 20 + j]
        @cur = @list[@idx]
    $scope.doc.fetch!
    $scope.page = do
      toggle: (e, doc) ->
        if e.target and e.target.getAttribute and /^item|ctrl|list/.exec(e.target.getAttribute("class")) =>
          doc.toggled = !!!doc.toggled
      delete: (doc) ->
        $scope.loading = true
        $http {url: "/d/page/#{doc.slug}/", method: \DELETE }
          .finally -> $scope.loading = false
          .then ->
            $scope.doc.delete(doc)
            ldNotify.send \success, 'Deleted'
          .catch -> ldNotify.send \danger, 'failed. try again later?'

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

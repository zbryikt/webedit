angular.module \webedit
  ..controller \profile, <[$scope $http $timeout ldNotify]> ++ ($scope, $http, $timeout, ldNotify) ->
    if !($scope.user.data and $scope.user.data.key) =>
      $scope.loading = true
      return window.location.href = "/auth/?nexturl=/me/"
    $scope.settings = modal: {}
    $scope.dnshint = modal: {}

    $scope.displayname = do
      value: $scope.user.data.displayname
      update: ->
        if !@value or !$scope.user.data.key => return
        $scope.loading = true
        $http do
          url: "/d/user/#{$scope.user.data.key}"
          method: \PUT
          data: {displayname: @value}
        .finally -> $scope.loading = false
        .then ~>
          $scope.user.data.displayname = @value
          ldNotify.success 'display name updated'
        .catch -> ldNotify.danger 'failed to update. try later?'

    $scope.avatar = do
      value: "/s/avatar/#{$scope.user.data.key}.png"
      sync: ''
      read: (data, file) ->
        if !file or !/image\//.exec("#{file.type}") => return ldNotify.danger "this is not an image"
        if data.length > 1048576 => return ldNotify.danger "image too large and should be smaller than 1MB"
        $scope.loading = true
        raw = new Uint8Array data
        fd = new FormData!
        fd.append \image, new Blob([raw], {type: "application/octet-stream"})
        $http do
          url: \/me/avatar
          method: \PUT
          data: fd
          transformRequest: angular.identity
          headers: "Content-Type": undefined
        .finally -> $scope.loading = false
        .then (d) ~>
          ldNotify.success "avatar updated"
          $scope.avatar.value = "/s/avatar/#{$scope.user.data.key}.png?#{Math.random!toString(16).substring(2)}"
        .catch (d) -> ldNotify.danger "failed to update avatar. try later?"

    $scope.passwd = do
      n: '', o: ''
      error: {}
      update: ->
        @error = {}
        $scope.loading = true
        $http do
          url: \/d/me/passwd
          method: \PUT
          data: @{n,o}
        .finally ~> $timeout (~> $scope.loading = false), 1000
        .then -> ldNotify.success "password changed."
        .catch (d) ~>
          code = errcode.subcode d.{}data.code, "profile"
          if code.0 => @error[code.0] = true
          else ldNotify.danger "failed changing password. try later?"

    $scope.docs = do
      loading: true
      list: [], cur: [], idx: 0
      page-at: (idx) ->
        if !@list[idx] => idx--
        @ <<< {cur: @list[idx], idx: idx}
      toggle: (doc, value) ->
        if !value? => value = !!!doc.toggled
        if doc != @toggled-doc and @toggled-doc and value => @toggled-doc.toggled = false
        doc.toggled = value
        if doc != @toggled-doc => @toggled-doc = doc
        else @toggled-doc = null
      fetch: ->
        $http do
          url: \/d/me/doc/
          method: \GET
        .finally ~> @loading = false
        .then (ret) ~>
          ret.data.map ->
            it.timestamp = new Date(it.modifiedtime or it.createdtime).getTime!
            if it.thumbnail => it.thumbnail = it.thumbnail.replace /\/\d+x\d+\//, '/80x42/'
            it.permlist = []
            for i from 0 til (it.perm or []).length =>
              it.permlist.push do
                displayname: it.perm_name[i]
                username: it.perm_email[i]
                perm: it.perm[i]
                key: it.perm_key[i]
            it.permlist.sort (a,b) -> b.perm - a.perm
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
    $scope.docs.fetch!
    $scope.page = do
      perms: do
        perm: 10
        value: ''
        is-admin: (doc, key) ->
          if !doc or !key => return false
          if doc.owner == key => return true
          if doc.permlist.filter(->it.key == key and it.perm >= 40).length => return true
          return false
        perm-name: (perm) ->
          if perm >= 40 => return 'Admin'
          else if perm >= 30 => return 'Edit'
          else return 'View'
        remove: (doc, key) ->
          if !key or !doc or !(doc.plan and doc.plan.name == 'pro') => return
          if !doc.permlist.filter(->it.key == key).length => return
          $scope.loading = true
          $http {url: "/d/page/#{doc.slug}/perm/#key", method: \DELETE}
            .finally -> $scope.loading = false
            .then ->
              doc.permlist = doc.permlist.filter -> it.key != key
              ldNotify.send \success, 'deleted'
            .catch -> ldNotify.send \danger, 'failed. try again later?'
        add: (doc) ->
          if !@value or !doc or !(doc.plan and doc.plan.name == 'pro') => return
          $scope.loading = true
          $http {url: "/d/page/#{doc.slug}/perm", method: \PUT, data: {emails: @value, perm: @perm}}
            .finally -> $scope.loading = false
            .then (ret) ~>
              added = (ret.data or []).map(-> it.username.trim!)
              ret.data.map ~> it.perm = @perm
              list = (@value or "").split(\,).map(-> it.trim!).filter(->it).filter(->!(it in added))
              if list.length =>
                @value = list.join(',')
                ldNotify.send \warning, 'some emails are not added.'
              else ldNotify.send \success, 'added.'
              doc.permlist = (doc.permlist or []) ++ ret.data

            .catch -> ldNotify.send \danger, 'failed. try again later?'

      toggle: (e, doc) ->
        if e.target and e.target.getAttribute and /^item|ctrl|list/.exec(e.target.getAttribute("class")) =>
          $scope.docs.toggle doc
      delete: (doc) ->
        $scope.loading = true
        $http {url: "/d/page/#{doc.slug}/", method: \DELETE }
          .finally -> $scope.loading = false
          .then ->
            $scope.docs.delete(doc)
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
        $http({
          url: "/d/page/#{doc.slug}/", method: \PUT
          data: doc{title, description, thumbnail, domain, path, gacode, tags, privacy, publish}
        })
          .finally -> $scope.loading = false
          .then ->
            $scope.loading = false
            if do-close => doc.toggled = false
            ldNotify.send \success, 'saved.'
          .catch -> alert "failed to save. try again later"


Ui = do
  init: (editor) ->
    widgets = Sortable.create document.querySelector(\#widgets), do
      group: name: \shared, pull: \clone
      disabled: false

    editable = Sortable.create document.querySelector(\#editor), do
      handle: \.handle
      group: name: \shared, pull: \clone
      onAdd: ->
        editor.add widget-name

        wrap = -> "<div class='block'><div class='handle'><div class='fa fa-bars'></div><div class='fa fa-close'></div></div>#it</div>"
        widget-name = it.item.getAttribute(\data-name)
        id = "id-#{Math.random!toString 16 .substring 2}"
        templates.get widget-name
          .then (data) ->
            content = wrap(data or 'not found')
            console.log(content)
            it.item.setAttribute \id, id
            it.item.innerHTML = content
            doc.submitOp [{p: ["child", id], oi: {content: it.item.innerHTML}}]
            init-block it.item

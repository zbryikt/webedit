socket = new WebSocket \ws://localhost:9000/
connection = new sharedb.Connection socket
pageid =  window.location.pathname.replace(/\/page\//, '').replace(/\/$/, '')
doc = connection.get \doc, pageid
doc.on \load, ->
  if doc.data => for k,v of doc.data.child => init-block(k, v.content)
doc.fetch (e) ->
  if !doc.type => ret = doc.create {attr: {}, child: {}}
  doc.subscribe handle
  doc.on \op, handle

edit-event = (node) ->
  if !doc.data => return
  id = node.getAttribute \id
  if !node.getAttribute(\contenteditable) => return
  content = do
    last: (doc.data.child[id] or {}).content or ''
    now: node.innerHTML
  diffs = fast-diff content.last, content.now
  offset = 0
  if !doc.data.child[id] => doc.submitOp [{p: ["child", id], oi: {content: ""}}]
  for diff in diffs
    if diff.0 == 0 => offset += diff.1.length
    else if diff.0 == 1 =>
      doc.submitOp [{p: ["child", id, 'content', offset], si: diff.1}]
      offset += diff.1.length
    else
      doc.submitOp [{p: ["child", id, 'content', offset], sd: diff.1}]

init-script = (type) -> new Promise (res, rej) ->
  if auxjs? and auxjs[type] => return res!
  script = document.createElement("script")
  script.src = "/blocks/#type/index.js"
  document.body.appendChild script
  script.onerror = ->
    return res!
  script.onload = ->
    return res!

mes = []
init-block = (id, content, type = null) ->
  if typeof(id) == \string =>
    block = document.createElement("div")
    block.innerHTML = content
    block.setAttribute \id, id
    block.setAttribute \class, \widget
  else block = id
  if !type =>
    ret = /data-widget="([^"]+)"/.exec(content)
    if ret => type = ret.1
  block.addEventListener \dragstart, (e) -> mes.map -> it.destroy!
  block.addEventListener \dragend, (e) -> mes.map -> it.setup!
  block.addEventListener \click, (e) ->
    if /fa-close/.exec(e.target.getAttribute \class) =>
      id = block.getAttribute(\id)
      @parentNode.removeChild(@)
      doc.submitOp [{p: ["child", id], od: doc.data.child[id]}]
  me = new MediumEditor(block.childNodes.0, {
    toolbar: { buttons: ['colorPicker', 'anchor', 'justifyLeft', 'justifyCenter', 'justifyRight'] }
    extensions: { colorPicker: new ColorPickerExtension! }
  })
  mes.push me
  me.subscribe \editableInput, (evt, elem) -> edit-event elem
  
  document.querySelector('#editor').appendChild(block)
  /*
  Sortable.create block, do
    group: name: \blah
    disabled: false
    draggable: \.btn
  */
  Promise.resolve!
    .then -> init-script type
    .then -> if auxjs? and auxjs[type] => auxjs[type] block

function handle(ops, source)
  if !ops or source => return
  for op in ops =>
    if op.si =>
      document.getElementById(op.p.1).innerHTML = doc.data.child[op.p.1].content
    else if op.sd =>
      document.getElementById(op.p.1).innerHTML = doc.data.child[op.p.1].content
    else if op.oi => init-block op.p.1, op.oi.content
    else if op.od =>
      node = document.getElementById op.p.1
      node.parentNode.removeChild(node)

templates = do
  cache: {}
  get: (name) -> new Promise (res, rej) ~>
    if @cache[name] => return res that
    $.ajax do
      url: "/blocks/#name/index.html"
    .done (ret) ~> 
      @cache[name] = ret
      init-script name .then -> return res ret

Sortable.create document.querySelector(\#widgets), do
  group:
    name: \shared
    pull: \clone
  disabled: false
  draggable: \.widget

editable = Sortable.create document.querySelector(\#editor), do
  handle: \.handle
  draggable: \.widget
  group:
    name: \shared
    pull: \clone
  onAdd: ->
    wrap = -> """<div class='block' data-widget="#widget-name"><div class='handle'><div class='fa fa-bars'></div><div class='fa fa-close'></div></div>#it</div>"""
    widget-name = it.item.getAttribute(\data-name)
    it.item.style.backgroundImage = ""
    console.log widget-name
    id = "id-#{Math.random!toString 16 .substring 2}"
    templates.get widget-name
      .then (data) ->
        content = wrap(data or 'not found')
        it.item.setAttribute \id, id
        it.item.innerHTML = content
        doc.submitOp [{p: ["child", id], oi: {content: it.item.innerHTML}}]
        init-block it.item, null, widget-name

document.body.addEventListener \keyup, (e) -> edit-event e.target

document.querySelector \#ctrl .addEventListener \mousedown, (e)->
  className = e.target.getAttribute \class
  if /btc/.exec(className) =>
    node = Caret.node!
    while node and node.getAttribute and !~(node.getAttribute(\class) or '').indexOf(\widget)
      node = node.parentNode
    if !node or !node.getAttribute => return  /* null or #document */
    Caret.insert "<i class='fa'>&\#xf2cd;</span>"
    edit-event node

window.clone = -> window.location.href = "/page/#pageid/clone"

$.ajax { url: '/blocks/list.json' }
  .done (data) ->
    widgets = document.querySelector \#widgets
    for item in data =>
      node = document.createElement \div
      node.setAttribute \class, 'widget'
      node.setAttribute \data-name, item
      node.style.backgroundImage = "url(/blocks/#item/index.svg)"
      node.innerHTML = item
      widgets.appendChild node
      node.addEventListener \dragstart, (e) -> mes.map -> it.destroy!
      node.addEventListener \dragend, (e) -> mes.map -> it.setup!



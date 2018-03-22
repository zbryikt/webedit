Collaborative = do
  init: -> new Promise (res, rej) ~>
    @socket = new WebSocket \ws://localhost:9000/
    @connection = new sharedb.Connection socket
    @inited = true
    return res!
  #handle: (ops = [op,op...], source = (me is source ? true : false )) ->
  get: ({collection, doc, handle}) -> 
    <~ (if !@inited => @init! else Promise.resolve!).then
    doc = connection.get collection, doc
    doc.subscribe handle
    doc.on \op, handle

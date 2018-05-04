# passing to block for callback and events.
page-object = do
  handler: {}
  addEventListener: (name, callback) -> @handler[][name].push callback
  fire: (name, ...args) -> for func in (@handler[name] or []) => func.apply page-object, args

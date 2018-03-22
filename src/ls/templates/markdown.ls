if !auxjs? => auxjs = {}

auxjs.markdown = (node) ->
  console.log \node
  [input,output] = Array.from(node.querySelectorAll(\.col))
  console.log input
  node.addEventListener \keypress, (e)->
    output.innerHTML = auxjs.markdown.converter.makeHtml(input.innerText)

auxjs.markdown.converter = new showdown.Converter!

module.exports = do
  config:
    editable: false
  wrap: (node, collab) ->
    container = node.querySelector('.container')
    if !window.initMap => window.initMap = ->
      for func in window.initMap.[]list => func!
      window.initMap.inited = true
    if !window.initMap.list => window.initMap.list = []
    handler = (->
      options = do
        center:
          lat: +(container.getAttribute(\lat) or -34.397)
          lng: +(container.getAttribute(\lng) or 150.644)
        zoom: +(container.getAttribute(\zoom) or 8)
      map = new google.maps.Map container, options
      google.maps.event.addListener map, \idle, ->
        center = map.get-center!
        container.setAttribute \lat, center.lat!
        container.setAttribute \lng, center.lng!
        container.setAttribute \zoom, map.getZoom!
        if collab => collab.action.edit-block node
    )
    if !window.initMap.inited => window.initMap.list.push handler else handler!
  library:
    gmaps: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCtTg4onCcl1CJpO_ly3VEYLrUxnXQY00E&callback=initMap'

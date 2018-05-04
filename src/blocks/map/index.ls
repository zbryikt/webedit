module.exports = do
  editable: false
  custom: attrs: <[lat lng zoom]>
  library:
    gmaps: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCtTg4onCcl1CJpO_ly3VEYLrUxnXQY00E&callback=initMap'
  text: (text) ->
    coder = new google.maps.Geocoder!
    (res, status) <~ coder.geocode {address: text}, _
    if status != google.maps.GeocoderStatus.OK or !res.0 => return
    @block.map.setCenter res.0.geometry.location
    @block.map.setZoom 14
  init: ->
    container = @block.querySelector('.container')
    if !container => return
    if !window.initMap => window.initMap = ->
      for func in window.initMap.[]list => func!
      window.initMap.inited = true
    if !window.initMap.list => window.initMap.list = []
    handler = (~>
      container = @block.querySelector('.container')
      if !container => return
      options = do
        center:
          lat: +(container.getAttribute(\lat) or -34.397)
          lng: +(container.getAttribute(\lng) or 150.644)
        zoom: +(container.getAttribute(\zoom) or 8)
        keyboardShortcuts: false
      map = container.map = new google.maps.Map container, options
      google.maps.event.addListener map, \idle, ~>
        center = map.get-center!
        container.setAttribute \lat, center.lat!
        container.setAttribute \lng, center.lng!
        container.setAttribute \zoom, map.getZoom!
        if @collab => @collab.action.edit-block @block
      google.maps.event.addDomListener container, 'mouseover', (e) ->
        if e._generated => return
        evt = document.createEvent \MouseEvents
        evt.initMouseEvent \mouseover, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
        evt._generated = 1
        container.dispatchEvent evt
    )
    if !window.initMap.inited => window.initMap.list.push handler else handler!


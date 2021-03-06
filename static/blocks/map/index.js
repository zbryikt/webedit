// Generated by LiveScript 1.3.0
module.exports = {
  editable: false,
  custom: {
    attrs: ['lat', 'lng', 'zoom']
  },
  library: {
    gmaps: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCtTg4onCcl1CJpO_ly3VEYLrUxnXQY00E&callback=initMap'
  },
  text: function(text){
    var coder, this$ = this;
    coder = new google.maps.Geocoder();
    return coder.geocode({
      address: text
    }, function(res, status){
      if (status !== google.maps.GeocoderStatus.OK || !res[0]) {
        return;
      }
      this$.block.map.setCenter(res[0].geometry.location);
      return this$.block.map.setZoom(14);
    });
  },
  init: function(){
    var container, handler, this$ = this;
    container = this.block.querySelector('.container');
    if (!container) {
      return;
    }
    if (!window.initMap) {
      window.initMap = function(){
        var i$, ref$, ref1$, len$, func;
        for (i$ = 0, len$ = (ref$ = (ref1$ = window.initMap).list || (ref1$.list = [])).length; i$ < len$; ++i$) {
          func = ref$[i$];
          func();
        }
        return window.initMap.inited = true;
      };
    }
    if (!window.initMap.list) {
      window.initMap.list = [];
    }
    handler = function(){
      var container, options, map;
      container = this$.block.querySelector('.container');
      if (!container) {
        return;
      }
      options = {
        center: {
          lat: +(container.getAttribute('lat') || -34.397),
          lng: +(container.getAttribute('lng') || 150.644)
        },
        zoom: +(container.getAttribute('zoom') || 8),
        keyboardShortcuts: false
      };
      map = container.map = new google.maps.Map(container, options);
      google.maps.event.addListener(map, 'idle', function(){
        var center;
        center = map.getCenter();
        container.setAttribute('lat', center.lat());
        container.setAttribute('lng', center.lng());
        container.setAttribute('zoom', map.getZoom());
        if (this$.collab) {
          return this$.collab.action.editBlock(this$.block);
        }
      });
      return google.maps.event.addDomListener(container, 'mouseover', function(e){
        var evt;
        if (e._generated) {
          return;
        }
        evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('mouseover', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        evt._generated = 1;
        return container.dispatchEvent(evt);
      });
    };
    if (!window.initMap.inited) {
      return window.initMap.list.push(handler);
    } else {
      return handler();
    }
  }
};
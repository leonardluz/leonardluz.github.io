// CREATING ICON STYLES

//viewpoint icon
var viewIcon = L.icon({
   iconUrl: 'images/camera.png',
   iconSize: [25, 25]
});

//attraction icon
var attractionIcon = L.icon({
   iconUrl: 'images/fair.png',
   iconSize: [20, 20]
});

//accommodation icon
var accommIcon = L.icon({
   iconUrl: 'images/hotel.png',
   iconSize: [20, 20]
});

//INTERACTIVITY FUNCTIONS

//Center on point when clicked
function centerLeafletMapOnMarker(map, marker) {
   var latLngs = [marker.getLatLng()];
   var markerBounds = L.latLngBounds(latLngs);
   map.fitBounds(markerBounds);
};

//Interactive point function
function interactivePoint(feature, layer) {
   layer.bindPopup('<strong>Name: </strong>' + feature.properties.name + '<br/><strong>Type: </strong>' + feature.properties.tourism);

   layer.on('dblclick', function () {
      centerLeafletMapOnMarker(map, this)
   });
   
   layer.on('mouseover', function (){
      layer.bounce({ duration: 500, height: 10 });
   })
};


//ADDING DATA

//add viewpoints
var viewpoint = L.geoJson(viewpoint, {
   pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
         icon: viewIcon,
         clickable: true,
         bounceOnAdd: true
      });
   },
   onEachFeature: interactivePoint
});

//add attractions
var attraction = L.geoJson(attraction, {
   pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
         icon: attractionIcon,
         clickable: true,
         bounceOnAdd: true
      });
   },
   onEachFeature: interactivePoint
});

//add places
var accommodation = L.geoJson(accommodation, {
   pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: accommIcon, clickable: true });
   },
   onEachFeature: interactivePoint
});

//add basemap
var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
   '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
   'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVvbmFyZGx1eiIsImEiOiJjazlyaHBjc2IwdWQ3M2tueDI1OXN4Mnl5In0.IVn3cXUU0b3eRMACaDzZCw';

var grayscale = L.tileLayer(mbUrl, { id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
      streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr });

//add main map area
var map = L.map('map', {
   center: [47.874292, 12.452322],
   zoom: 12,
   layers: [grayscale, viewpoint, attraction],
   zoomControl: false //set to false for the custom home button
});

//add custom home button
var zoomHome = L.Control.zoomHome({ position: 'topright' });
zoomHome.addTo(map);

//add legend
var basemaps = {
   "Grayscale": grayscale,
   "Streets": streets
};

var overlays = {
    "Accommodations": accommodation,
    "Attractions": attraction,
    "View Points": viewpoint
};

L.control.layers(basemaps, overlays).addTo(map);

//add scalebar
L.control.scale({ position: 'bottomright', imperial: false, maxWidth: 150 }).addTo(map);

//add elevation profile
var el = L.control.elevation({
   position: "bottomright",
   theme: "lime-theme", //default: lime-theme
   width: 600,
   height: 125,
   margins: {
      top: 10,
      right: 20,
      bottom: 30,
      left: 50
   },
   useHeightIndicator: true, //if false a marker is drawn at map position
   interpolation: d3.curveLinear, //see https://github.com/d3/d3-shape/blob/master/README.md#area_curve
   hoverNumber: {
      decimalsX: 3, //decimals on distance (always in km)
      decimalsY: 0, //deciamls on hehttps://www.npmjs.com/package/leaflet.coordinatesight (always in m)
      formatter: undefined //custom formatter function may be injected
   },
   xTicks: undefined, //number of ticks in x axis, calculated by default according to width
   yTicks: undefined, //number of ticks on y axis, calculated by default according to height
   collapsed: false,  //collapsed mode, show chart on click or mouseover
   imperial: false    //display imperial units instead of metric
});
el.addTo(map);

//Rund Chiemsee Bike Route
var gpx1 = new L.GPX("https://maptoolkit.net/export/outdoorish_bikemap_routes/5454538.gpx?cache_buster=9970840", {
   async: true,
   polyline_options: {
      color: '#db214f',
      weight: 6,
      lineCap: 'round'
   },
   marker_options: {
      startIconUrl: 'images/pin-icon-start.png',
      endIconUrl: 'images/pin-icon-end.png',
      shadowUrl: 'images/pin-shadow.png'
   }
}
);
gpx1.on("addline", function (e) {
   el.addData(e.line);
});
gpx1.addTo(map);

//sidebar
var sidebar = L.control.sidebar({
   autopan: false,       // whether to maintain the centered map point when opening the sidebar
   closeButton: true,    // whether t add a close button to the panes
   container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
   position: 'left',     // left or right
}).addTo(map);

//controls the visibility of the accommodation point layer in some zoom level
map.on('zoomend', function () {
   var zoomlevel = map.getZoom();
   if (zoomlevel < 14) {
      if (map.hasLayer(accommodation)) {
         map.removeLayer(accommodation);
      } else {
         console.log("no point layer active");
      }
   }
   if (zoomlevel >= 14) {
      if (map.hasLayer(accommodation)) {
         console.log("layer already added");
      } else {
         map.addLayer(accommodation);
      }
   }
   console.log("Current Zoom Level =" + zoomlevel)
});
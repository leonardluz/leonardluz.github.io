//add main map area
const map = L.map('map').setView([49.8175, 15.4730], 8);

//add basemap
const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
   '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
   'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGVvbmFyZGx1eiIsImEiOiJjazlyaHBjc2IwdWQ3M2tueDI1OXN4Mnl5In0.IVn3cXUU0b3eRMACaDzZCw';

const dark = L.tileLayer(mbUrl, { id: 'mapbox/dark-v10', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
      light = L.tileLayer(mbUrl, { id: 'mapbox/light-v10', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
      satellite = L.tileLayer(mbUrl, { id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr });

dark.addTo(map);

//MAP CONTROLS
//add custom nav bar
L.control.navbar().addTo(map);

// CREATING ICON STYLES
//cloud icon
const cloudIcon = L.icon({
   iconUrl: 'img/cloud.png',
   iconSize: [30, 30]
});


//INTERACTIVITY FUNCTIONS
//Center on point when clicked
function centerLeafletMapOnMarker(map, marker) {
   const latLngs = [marker.getLatLng()];
   const markerBounds = L.latLngBounds(latLngs);
   map.fitBounds(markerBounds);
};

//Interactive point function
function interactivePoint(feature, layer) {
   // layer.bindPopup('<strong>City: </strong>' + feature.properties.city
   //    + '<br/><strong>Value: </strong>' + feature.properties.value + ' ' + feature.properties.unit);
   layer.bindPopup(L.Util.template('<p style="font-size:14px;">Air quality is <strong>{value} {unit}</strong> at <strong>{city}, {country}</strong><br/><hr><em>Last updated: {lastUpdated}</em></p>', layer.feature.properties));

   layer.on('dblclick', function () {
      centerLeafletMapOnMarker(map, this);
   });

};

//zoom function for polygons
function zoomToFeature(e) {
   map.fitBounds(e.target.getBounds());
}

//highlight function
function highlightFeature(e) {
   var layer = e.target;

   layer.setStyle({
      weight: 3,
      color: '#33FFF8',
      dashArray: '',
      fillOpacity: .1
   });

   // if (!L.Browser.ie && !L.Browser.opera) {
   //    layer.bringToFront();
   // }
}

function resetHighlight(e) {
   poly.resetStyle(e.target);
   // info.update();
}

//polygon functions
function interactivePoly(feature, layer) {
   //layer.bindTooltip('<strong>Neighborhood: </strong>' + feature.properties.NBHD_NAME + '<br/><strong>Total Crimes: </strong>' + feature.properties.total);
   layer.bindTooltip(feature.properties.name);

   layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      //click: zoomToFeature,
   });
}

//STYLE
//Set color function
function getColor(d) {
   return d >= 75 ? '#d7301f' :
      d >= 50 ? '#fc8d59' :
         d >= 25 ? '#fdcc8a' :
            '#4ceb34';
}
//Set size function
function getSize(d) {
   return d >= 75 ? 20 :
      d >= 50 ? 15 :
         d >= 25 ? 10 :
            5;
}

//polygon style
function polystyle(feature) {
   return {
      //fillColor: 'orange',
      weight: .5,
      opacity: 1,
      color: '#33FFF8',  //Outline color
      fillOpacity: .1
   };
}


//ADDING THE DATA

//add data from a live feature layer
map.createPane('points');
const airQuality = L.esri.featureLayer({
   url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Air_Quality_PM25_Latest_Results/FeatureServer/0',
   pane: 'points',
   where: "country  = 'CZ'",
   pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
         //icon: cloudIcon,
         color: getColor(feature.properties.value),
         radius: getSize(feature.properties.value),
         fill: .1,
         clickable: true,
      });
   },
   onEachFeature: interactivePoint
});
airQuality.addTo(map);

//add czech districts
map.createPane('poly');
map.getPane('poly').style.zIndex = 300;
const url = 'https://gist.githubusercontent.com/leonardluz/d43664b3172ead087bff247e5e508b44/raw/bb982fa1049ef0b1d3c234bde3a2f8a02d391b16/map.geojson'
const poly = L.geoJSON("", {
   style: polystyle,
   onEachFeature: interactivePoly,
   interactive: true,
   pane: 'poly'
});

poly.addTo(map);


async function getData() {
   const response = await fetch(url);
   const data = await response.json();
   const geo = data;

   poly.addData(geo);
};
getData();
poly.bringToBack();

//add wind layer from OWM
//const APIkey = 'db52685d83086e2e3a5f251b54da7d78';
const APIkey = 'cd413bcfb08128ffd8a30f40d5d12d1d';
var wind = L.OWM.wind({ appId: APIkey });

//add air temperature layer from OWM
var temp = L.OWM.temperature({ appId: APIkey });


//add legend
const basemaps = {
   "Dark": dark,
   "Light": light,
   "Satellite": satellite
};

const overlays = {
   "Air Quality": airQuality,
   "Wind": wind,
   "Air temperature": temp,
   "Czech Districts": poly
};

L.control.layers(basemaps, overlays).addTo(map);

//add query bar
const quality = document.getElementById('quality');

quality.addEventListener('change', function () {
   airQuality.setWhere(quality.value);
});

//adding legend

var legend = L.control({ position: 'bottomright' });

/* legend.onAdd = function (map) {

   var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 25, 50, 75],
      labels = [];

   // loop through our density intervals and generate a label with a colored square for each interval
   for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
         '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
   }

   return div;
legend.addTo(map);
}; */

legend.onAdd = function (map) {
   var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 25, 50, 75],
      labels = ['(good)', '(moderate)', '(hazardous)', '(extremely hazardous)'];

   for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=

         '<i class ="circle" style="border-radius: 50%; border-style: solid; width:' + getSize(grades[i] + 1) + 'px; height:' + getSize(grades[i] + 1) + 'px; border-color:' + getColor(grades[i] + 1) + ';"></i> ' +
      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '&nbsp;&nbsp;&nbsp' + labels[i] + '<br>' : '+' + '&nbsp;&nbsp;&nbsp' + labels[3]);
   }
   return div;
};
legend.addTo(map);


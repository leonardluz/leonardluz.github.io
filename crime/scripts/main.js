//ADDING DATA

//add basemap
var map = L.map('map').setView([39.750362, -104.948910], 11, zoomSnap = 0.1, zoomDelta = 0.1);
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://carto.com/attributions">CARTO</a> | Denver Crime Data from <a href="https://www.kaggle.com/paultimothymooney/denver-crime-data">Kaggle</a>'
}).addTo(map);

//add nav bar
L.control.navbar().addTo(map);

//create color ramp
function getColor(c) {
   return c > 1000 ? '#800026' :
      c > 500 ? '#BD0026' :
         c > 200 ? '#E31A1C' :
            c > 100 ? '#FC4E2A' :
               c > 50 ? '#FD8D3C' :
                  c > 20 ? '#FEB24C' :
                     c > 10 ? '#FED976' :
                        '#FFEDA0';
}

//stylize polygon
function style(feature) {
   return {
      fillColor: getColor(feature.properties.total),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
   };
}

//highlight function
function highlightFeature(e) {
   console.log('highlightFeature was entered');
   var layer = e.target;
   //layer.closeTooltip();

   layer.setStyle({
      weight: 3,
      color: 'white',
      dashArray: '',
      fillOpacity: 0.4
   });

   if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
   }

}

function resetHighlight(e) {
   geojson.resetStyle(e.target);
   // info.update();
}

//zoom fucntion
function zoomToFeature(e) {
   map.fitBounds(e.target.getBounds());
}

//tooltip on every feature
function onEachFeature(feature, layer) {
   console.log('onEachFeature was entered');

   layer.bindTooltip('<strong>Neighborhood: </strong>' + feature.properties.NBHD_NAME + '<br/><strong>Total Crimes: </strong>' + feature.properties.total);

   layer.on({
      mouseover: highlightFeature, 
      mouseout: resetHighlight,
      click: zoomToFeature
   });

}

//add neighborhood layer
var geojson = L.geoJson(nbhd, {
   style: style,
   onEachFeature: onEachFeature
 }).addTo(map);

// zoom the map to the polygon extent
map.fitBounds(geojson.getBounds());

var legend = L.control({ position: 'bottomright' });

//add nbhd legend
legend.onAdd = function (map) {

   var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = [],
      from, to;

   for (var i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];

      labels.push(
         '<i style="background:' + getColor(from + 1) + '"></i> ' +
         from + (to ? '&ndash;' + to : '+'));
   }

   div.innerHTML = labels.join('<br>');
   return div;
};

legend.addTo(map);

//add scalebar
L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 150 }).addTo(map);




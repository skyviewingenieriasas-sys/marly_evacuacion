var anguloRadianes = 188 * Math.PI / 180;

var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: layersList,
    view: new ol.View({
        extent: [-8277960.458911, 529621.380308, -8272427.883876, 533060.758540], 
        maxZoom: 24, 
        minZoom: 12,
        rotation: anguloRadianes
    })
});

// Ajuste inicial de vista con rotación aplicada
map.getView().fit([-8277960.458911, 529621.380308, -8272427.883876, 533060.758540], {
    size: map.getSize(),
    rotation: anguloRadianes
});

map.getView().setProperties({constrainResolution: true});

// Gestión de cursores e interacción
function pointerOnFeature(evt) {
    if (evt.dragging) return;
    var hasFeature = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function(layer) {
            return layer && (layer.get("interactive"));
        }
    });
    map.getViewport().style.cursor = hasFeature ? "pointer" : "";
}
map.on('pointermove', pointerOnFeature);

// Contenedores de UI
var topLeftContainer = new ol.control.Control({ element: (() => { var el = document.createElement('div'); el.id = 'top-left-container'; return el; })() });
var bottomLeftContainer = new ol.control.Control({ element: (() => { var el = document.createElement('div'); el.id = 'bottom-left-container'; return el; })() });
var topRightContainer = new ol.control.Control({ element: (() => { var el = document.createElement('div'); el.id = 'top-right-container'; return el; })() });
var bottomRightContainer = new ol.control.Control({ element: (() => { var el = document.createElement('div'); el.id = 'bottom-right-container'; return el; })() });

map.addControl(topLeftContainer);
map.addControl(bottomLeftContainer);
map.addControl(topRightContainer);
map.addControl(bottomRightContainer);

// Popups
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var overlayPopup = new ol.Overlay({ element: container, autoPan: true });
map.addOverlay(overlayPopup);

closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    return false;
};

// --- SECCIÓN DE GEOLOCALIZACIÓN (Punto Azul Permanente) ---
var positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: '#1a73e8' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
    })
}));

var geolocateOverlay = new ol.layer.Vector({
    source: new ol.source.Vector({ features: [positionFeature] }),
    zIndex: 999
});
map.addLayer(geolocateOverlay);

var geolocation = new ol.Geolocation({
    trackingOptions: { enableHighAccuracy: true },
    projection: map.getView().getProjection(),
    tracking: true // Rastreo activo desde el inicio
});

geolocation.on('change:position', function() {
    var coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
});

// Botón de Geolocalización corregido para Iframe
var geolocateBtn = document.createElement('button');
geolocateBtn.innerHTML = '🎯';
geolocateBtn.className = 'geolocate-button';
var geolocateControl = document.createElement('div');
geolocateControl.className = 'ol-control geolocate';
geolocateControl.appendChild(geolocateBtn);
map.addControl(new ol.control.Control({ element: geolocateControl }));

geolocateBtn.onclick = function() {
    var pos = geolocation.getPosition();
    if (pos) {
        map.getView().animate({ center: pos, duration: 500, zoom: 18 });
    }
};

// --- MEDICIÓN ---
var measureLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
        stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 })
    })
});
map.addLayer(measureLayer);

// Atribuciones
var bottomAttribution = new ol.control.Attribution({ collapsible: false });
map.addControl(bottomAttribution);

// Mover controles a sus contenedores
var zoomControl = document.getElementsByClassName('ol-zoom')[0];
if (zoomControl) document.getElementById('top-left-container').appendChild(zoomControl);
document.getElementById('top-left-container').appendChild(geolocateControl);

// Soporte para pantalla completa dentro del iframe
map.addControl(new ol.control.FullScreen());
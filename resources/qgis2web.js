var anguloRadianes = 188 * Math.PI / 180;

var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: layersList,
    view: new ol.View({
        extent: [-8277960.458911, 529621.380308, -8272427.883876, 533060.758540], 
        maxZoom: 24, 
        minZoom: 12,
        rotation: anguloRadianes // Rotación inicial
    })
});

// Vista inicial centrada respetando la rotación de 188°
map.getView().fit(
    [-8277960.458911, 529621.380308, -8272427.883876, 533060.758540], 
    {
        size: map.getSize(),
        rotation: anguloRadianes
    }
);

// Forzar resoluciones fijas
map.getView().setProperties({constrainResolution: true});

// Cambiar el cursor al pasar sobre elementos interactivos
function pointerOnFeature(evt) {
    if (evt.dragging) {
        return;
    }
    var hasFeature = map.hasFeatureAtPixel(evt.pixel, {
        layerFilter: function(layer) {
            return layer && (layer.get("interactive"));
        }
    });
    map.getViewport().style.cursor = hasFeature ? "pointer" : "";
}
map.on('pointermove', pointerOnFeature);

function styleCursorMove() {
    map.on('pointerdrag', function() {
        map.getViewport().style.cursor = "move";
    });
    map.on('pointerup', function() {
        map.getViewport().style.cursor = "default";
    });
}
styleCursorMove();

// Definición de pantallas pequeñas
var hasTouchScreen = map.getViewport().classList.contains('ol-touch');
var isSmallScreen = window.innerWidth < 650;

// Contenedores de controles (UI)
var topLeftContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'top-left-container';
        return el;
    })(),
});
map.addControl(topLeftContainer);

var bottomLeftContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'bottom-left-container';
        return el;
    })(),
});
map.addControl(bottomLeftContainer);

var topRightContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'top-right-container';
        return el;
    })(),
});
map.addControl(topRightContainer);

var bottomRightContainer = new ol.control.Control({
    element: (() => {
        var el = document.createElement('div');
        el.id = 'bottom-right-container';
        return el;
    })(),
});
map.addControl(bottomRightContainer);

// Configuración de Popups
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var sketch;

function stopMediaInPopup() {
    var mediaElements = container.querySelectorAll('audio, video');
    mediaElements.forEach(function(media) {
        media.pause();
        media.currentTime = 0;
    });
}

closer.onclick = function() {
    container.style.display = 'none';
    closer.blur();
    stopMediaInPopup();
    return false;
};

var overlayPopup = new ol.Overlay({
    element: container,
    autoPan: true
});
map.addOverlay(overlayPopup);

var NO_POPUP = 0;
var ALL_FIELDS = 1;

function getPopupFields(layerList, layer) {
    var idx = layersList.indexOf(layer) - (layersList.length - popupLayers.length);
    return popupLayers[idx];
}

// Resaltado de selección
var collection = new ol.Collection();
var featureOverlay = new ol.layer.Vector({
    map: map,
    source: new ol.source.Vector({
        features: collection,
        useSpatialIndex: false
    }),
    style: [new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#f00',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.1)'
        }),
    })],
    updateWhileAnimating: true,
    updateWhileInteracting: true
});

var doHighlight = false;
var doHover = true;
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});

function createPopupField(currentFeature, currentFeatureKeys, layer) {
    var popupText = '';
    for (var i = 0; i < currentFeatureKeys.length; i++) {
        if (currentFeatureKeys[i] != 'geometry' && currentFeatureKeys[i] != 'layerObject' && currentFeatureKeys[i] != 'idO') {
            if (layer.get('fieldLabels')[currentFeatureKeys[i]] == "hidden field") continue;
            
            var popupField = '';
            var labelType = layer.get('fieldLabels')[currentFeatureKeys[i]];
            
            if (labelType == "inline label - always visible" || labelType == "inline label - visible with data") {
                popupField += '<th>' + layer.get('fieldAliases')[currentFeatureKeys[i]] + '</th><td>';
            } else {
                popupField += '<td colspan="2">';
            }

            var fieldValue = currentFeature.get(currentFeatureKeys[i]);
            if (layer.get('fieldImages')[currentFeatureKeys[i]] != "ExternalResource") {
                popupField += (fieldValue != null ? autolinker.link(fieldValue.toLocaleString()) + '</td>' : '');
            } else {
                if (/\.(gif|jpg|jpeg|tif|tiff|png|avif|webp|svg)$/i.test(fieldValue)) {
                    popupField += '<img src="images/' + fieldValue.replace(/[\\\/:]/g, '_').trim() + '" /></td>';
                } else {
                    popupField += (fieldValue != null ? autolinker.link(fieldValue.toLocaleString()) + '</td>' : '');
                }
            }
            popupText += '<tr>' + popupField + '</tr>';
        }
    }
    return popupText;
}

// Evento para mostrar información al mover el mouse o tocar
function onPointerMove(evt) {
    if (!doHover && !doHighlight) return;
    var pixel = map.getEventPixel(evt.originalEvent);
    var coord = evt.coordinate;
    var popupText = '<ul>';
    var featuresAndLayers = [];

    map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (layer && feature instanceof ol.Feature && (layer.get("interactive") !== false)) {
            featuresAndLayers.push({ feature, layer });
        }
    });

    for (var i = featuresAndLayers.length - 1; i >= 0; i--) {
        var feature = featuresAndLayers[i].feature;
        var layer = featuresAndLayers[i].layer;
        popupText += '<li><table><a><b>' + layer.get('popuplayertitle') + '</b></a>';
        popupText += createPopupField(feature, feature.getKeys(), layer);
        popupText += '</table></li>';
    }

    if (popupText !== '<ul>') {
        popupText += '</ul>';
        content.innerHTML = popupText;
        container.style.display = 'block';
        overlayPopup.setPosition(coord);
    } else {
        container.style.display = 'none';
    }
}
map.on('pointermove', onPointerMove);

// Lógica de Geolocalización (GPS)
let isTracking = false;
const geolocateButton = document.createElement('button');
geolocateButton.className = 'geolocate-button fa fa-map-marker';
geolocateButton.title = 'Mi ubicación';

const geolocateControl = document.createElement('div');
geolocateControl.className = 'ol-unselectable ol-control geolocate';
geolocateControl.appendChild(geolocateButton);
map.getTargetElement().appendChild(geolocateControl);

const positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({ color: '#3399CC' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
    }),
}));

const geolocateOverlay = new ol.layer.Vector({
    source: new ol.source.Vector({ features: [positionFeature] }),
});

const geolocation = new ol.Geolocation({
    projection: map.getView().getProjection(),
    tracking: true
});

geolocation.on('change:position', function () {
    const coords = geolocation.getPosition();
    positionFeature.setGeometry(coords ? new ol.geom.Point(coords) : null);
});

geolocateButton.addEventListener('click', function() {
    if (!isTracking) {
        map.addLayer(geolocateOverlay);
        const pos = geolocation.getPosition();
        if (pos) map.getView().setCenter(pos);
        isTracking = true;
    } else {
        map.removeLayer(geolocateOverlay);
        isTracking = false;
    }
});
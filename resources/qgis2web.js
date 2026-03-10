// --- CONFIGURACIÓN DE UBICACIÓN EN TIEMPO REAL ---

// 1. Crear el estilo del "Punto Azul" (estilo Google Maps)
var styleUbicacion = new ol.style.Style({
    image: new ol.style.Circle({
        radius: 8,
        fill: new ol.style.Fill({ color: '#4285F4' }), // Azul Google
        stroke: new ol.style.Stroke({ color: 'white', width: 3 })
    })
});

// 2. Crear la capa y el elemento gráfico
var positionFeature = new ol.Feature();
positionFeature.setStyle(styleUbicacion);

var vectorLayerUbicacion = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [positionFeature]
    }),
    zIndex: 1000 // Valor muy alto para que NADA lo tape
});

// 3. Añadir la capa al mapa inmediatamente
map.addLayer(vectorLayerUbicacion);

// 4. Configurar el motor de GPS
var geolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true, // GPS de alta precisión
    },
    projection: map.getView().getProjection()
});

// ACTIVAR RASTREO AUTOMÁTICO AL CARGAR
geolocation.setTracking(true);

// 5. Función que mueve el punto azul cuando el GPS detecta movimiento
geolocation.on('change:position', function() {
    var coordinates = geolocation.getPosition();
    if (coordinates) {
        positionFeature.setGeometry(new ol.geom.Point(coordinates));
    }
});

// Manejo de errores (opcional pero recomendado)
geolocation.on('error', function(error) {
    console.warn('Error en GPS: ' + error.message);
});

// Opcional: Centrar el mapa en la ubicación cada vez que cambie
geolocation.once('change:position', function() {
    // Esto solo centra la cámara la primera vez que te encuentra
    var pos = geolocation.getPosition();
    map.getView().setCenter(pos);
    map.getView().setZoom(18);
});

// 1. CONFIGURACIÓN DE ROTACIÓN (188 grados)
var anguloRadianes = 188 * Math.PI / 180;

var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: layersList,
    view: new ol.View({
        extent: [-8277960.458911, 529621.380308, -8272427.883876, 533060.758540], 
        maxZoom: 24, 
        minZoom: 12,
        rotation: anguloRadianes // Aplicamos la rotación aquí
    })
});

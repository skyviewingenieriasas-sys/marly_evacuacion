var wms_layers = [];


        var lyr_GOOGLESATELLITE_0 = new ol.layer.Tile({
            'title': 'GOOGLE SATELLITE',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'
            })
        });
var lyr_RUTAEVACUACIONMARLY_WGS84_1 = new ol.layer.Image({
        opacity: 1,
        
    title: 'RUTA EVACUACION MARLY_WGS84<br />' ,
        
        
        source: new ol.source.ImageStatic({
            url: "./layers/RUTAEVACUACIONMARLY_WGS84_1.png",
            attributions: ' ',
            projection: 'EPSG:3857',
            alwaysInRange: true,
            imageExtent: [-8275871.264728, 530650.572599, -8274458.756658, 532161.760974]
        })
    });

lyr_GOOGLESATELLITE_0.setVisible(true);lyr_RUTAEVACUACIONMARLY_WGS84_1.setVisible(true);
var layersList = [lyr_GOOGLESATELLITE_0,lyr_RUTAEVACUACIONMARLY_WGS84_1];

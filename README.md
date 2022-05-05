**Proof of concept only**

# Leaflet.SLDStyler

Apply styling from 1.1.0 or 1.0 SLD-File to a GeoJSON layer.

Rules can be ORed or ANDed. The following comparisions are possible:

 * ogc:PropertyIsEqualTo
 * ogc:PropertyIsNotEqualTo
 * ogc:PropertyIsLessThan
 * ogc:PropertyIsGreaterThan
 * ogc:PropertyIsLessThanOrEqualTo
 * ogc:PropertyIsGreaterThanOrEqualTo

The following PolygonSymbolizer properties are applied:

 * stroke
 * stroke-width
 * stroke-opacity
 * fill-opacity
 * fill
 * stroke-opacity
 * stroke-dasharray
 * stroke-linejoin
 * stroke-linecap

Also see the unit tests for what is possible.

Example:

    var SLDStyler = new L.SLDStyler(SLDXmlOrText);

    var geojsonLayer = L.geoJson(jsonObject, {
       style: SLDStyler.getStyleFunction()
    }).addTo(map);


To be done:
 * more styling properties and comparisions

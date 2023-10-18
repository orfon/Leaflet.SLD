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
       style: SLDStyler.getStyleFunction,
       pointToLayer: SLDStyler.getPointToLayerFunction()
    }).addTo(map);


To be done:
 * more styling properties and comparisions

**Supporting Tool Icons like QGIS**

Leaflet.SLDStyler allows you to apply styling from SLD (Styled Layer Descriptor) files to your GeoJSON layers, making it a versatile tool for GIS (Geographic Information Systems) enthusiasts. However, there may be instances where you want to take your styling a step further and incorporate custom icons for tools such as QGIS.

In this brief section, we'll touch upon how you can achieve this functionality as a proof of concept. Please note that this is meant to be informative and does not delve into extensive development.

**Customizing Icons**

To support custom icons for tools like QGIS, you'll need to implement a custom method within the `pointToLayer` function. This method will detect whether a feature has a property called `wellKnowName` and, based on its content, process and display the corresponding icon. For instance, you could dynamically create an SVG icon that represents the tool icon.

Here's a high-level overview of how you can approach this:

1. **Inspect the `wellKnowName` Property**: Within your `pointToLayer` function, examine the `wellKnowName` property of the feature you're working with.

2. **Determine Icon Content**: Based on the content of the `wellKnowName` property, decide which QGIS tool icon should be displayed. You might want to maintain a mapping of tool names to icon representations.

3. **Create SVG Icon**: Generate an SVG (Scalable Vector Graphics) icon that corresponds to the selected tool. This SVG can be as simple or as complex as needed to accurately represent the tool.

4. **Display the Icon**: Finally, display the generated SVG icon as the marker for the GeoJSON feature. You can achieve this using Leaflet's capabilities for custom markers.

Remember that this is just a starting point to give you an idea of how to implement custom tool icons for QGIS or similar applications. The actual implementation may vary based on your specific requirements and the complexity of the icons you wish to display.



/**
 * This class parses an SLD XML string and generates an SVG legend for each layer in the SLD.
 * The legend is stored in the "legend" property of the class instance.
 * The legend property is an object with a key for each layer in the SLD.
 * Each layer key has an array of rules, where each rule is an object with the following properties:
 * - name: the name of the rule
 * - title: the title of the rule
 * - svg: the SVG string for the rule
 *
 */
export default class LeafletSldLegend {


    constructor(sldStringOrXml) {
        this.legend = {};
        this.namespaceMapping = {
            se: "http://www.opengis.net/se",
            ogc: "http://www.opengis.net/ogc",
            sld: "http://www.opengis.net/sld"
        }
        if (typeof sldStringOrXml === 'string') {
            // Parse the SLD XML string into an XML document
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(sldStringOrXml, 'application/xml');
            // Define the namespaces for "se" and "ogc"
            // Iterate through the Layer styles in the SLD
            const layerNodes = xmlDoc.querySelectorAll('NamedLayer');
            for (const layerNode of layerNodes) {
                const layerName = layerNode.getElementsByTagNameNS(this.namespaceMapping.se, 'Name')[0].textContent;
                this.legend[layerName] = {
                    rules: []
                };

                // Iterate through the UserStyles in the NamedLayer
                const userStyleNodes = layerNode.querySelectorAll('UserStyle');
                for (const userStyleNode of userStyleNodes) {
                    let rules = userStyleNode.getElementsByTagNameNS(this.namespaceMapping.se, 'Rule');
                    for (const rule of rules) {
                        this.parseRule(rule, layerName);
                    }
                }
            }
        } else {
            throw new Error('Invalid input. Please provide an SLD XML string.');
        }
    }

    parseRule(rule, layerName) {
        // parses rules and creates an SVG with styles from the rule
        const nameNode = rule.getElementsByTagNameNS(this.namespaceMapping.se, 'Name')[0];
        const titleNode = rule.getElementsByTagNameNS(this.namespaceMapping.se, 'Title')[0];

        if (!nameNode) {
            return;
        }
        let ruleParsed = {
            name: nameNode ? nameNode.textContent : 'No Name',
            title: titleNode ? titleNode.textContent : 'No Title',
            svg: this.generateSVGFromRule(rule, this.namespaceMapping)
        };

        this.legend[layerName].rules.push(ruleParsed);
    }

    generateSVGFromRule(ruleNode, namespaces) {
        // Initialize an SVG string
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0,0,100,100">';

        // Check if there's a PointSymbolizer in the rule
        const pointSymbolizerNodes = ruleNode.getElementsByTagNameNS(namespaces.se, 'PointSymbolizer');

        if (pointSymbolizerNodes.length > 0) {
            const pointSymbolizerNode = pointSymbolizerNodes[0];

            // Extract fill and stroke parameters from the PointSymbolizer
            const fillNode = pointSymbolizerNode.querySelector('Fill');
            const strokeNode = pointSymbolizerNode.querySelector('Stroke');
            const wellKnownNameNode = pointSymbolizerNode.querySelector('WellKnownName');
            const sizeNode = pointSymbolizerNode.querySelector('Size');

            // Get fill color
            let fillColorAttribute = "";
            if (fillNode && fillNode.children.length) {
                const fillColor = fillNode.querySelector('SvgParameter[name="fill"]').textContent;
                fillColorAttribute = `fill="${fillColor}"`
            }
            
            // Get stroke color and width
            let strokeAttributes = "";
            if (strokeNode && strokeNode.children.length) {
                const strokeColor = strokeNode ? strokeNode.querySelector('SvgParameter[name="stroke"]').textContent : 'none';
                const strokeWidth = strokeNode ? strokeNode.querySelector('SvgParameter[name="stroke-width"]').textContent : '0';
                strokeAttributes = `stroke="${strokeColor}" stroke-width="${strokeWidth}"`
            }

            // Get the well-known name for the shape
            const wellKnownName = wellKnownNameNode ? wellKnownNameNode.textContent : '';

            // Get the size of the shape
            const size = sizeNode ? sizeNode.textContent : '0';

            // Create an SVG representation of the shape (in this case, a circle)
            svg += `<circle cx="50" cy="50" r="${size}" ${fillColorAttribute} ${strokeAttributes} />`;
        } else {
            // Check if there's a LineSymbolizer in the rule
            const lineSymbolizerNodes = ruleNode.getElementsByTagNameNS(namespaces.se, 'LineSymbolizer');

            if (lineSymbolizerNodes.length > 0) {
                const lineSymbolizerNode = lineSymbolizerNodes[0];

                // Extract stroke parameters from the LineSymbolizer
                const strokeNode = lineSymbolizerNode.querySelector('Stroke');
                const strokeWidthNode = strokeNode.querySelector('SvgParameter[name="stroke-width"]');

                // Get stroke color and width
                const strokeColor = strokeNode ? strokeNode.querySelector('SvgParameter[name="stroke"]').textContent : 'none';
                const strokeWidth = strokeWidthNode ? strokeWidthNode.textContent : '0';

                // Create an SVG representation of a line
                svg += `<line x1="10" y1="50" x2="90" y2="50" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
            } else {
                // Check if there's a PolygonSymbolizer in the rule
                const polygonSymbolizerNodes = ruleNode.getElementsByTagNameNS(namespaces.se, 'PolygonSymbolizer');

                if (polygonSymbolizerNodes.length > 0) {
                    const polygonSymbolizerNode = polygonSymbolizerNodes[0];

                    // Extract fill and stroke parameters from the PolygonSymbolizer
                    const fillNode = polygonSymbolizerNode.querySelector('Fill');
                    const strokeNode = polygonSymbolizerNode.querySelector('Stroke');

                    // Get fill color
                    const fillColor = fillNode ? fillNode.querySelector('SvgParameter[name="fill"]').textContent : 'none';

                    // Get stroke color and width
                    const strokeColor = strokeNode ? strokeNode.querySelector('SvgParameter[name="stroke"]').textContent : 'none';
                    const strokeWidth = strokeNode ? strokeNode.querySelector('SvgParameter[name="stroke-width"]').textContent : '0';

                    // Create an SVG representation of a rectangle
                    svg += `<rect x="10" y="10" width="80" height="80" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
                } else {
                    // Handle other symbolizers as needed
                    svg += '<text x="10" y="50" fill="red">Symbolizer not supported</text>';
                }
            }
        }

        // Close the SVG element
        svg += '</svg>';

        return svg;
    }


}

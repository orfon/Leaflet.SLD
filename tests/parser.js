var xmlPrefix = '<?xml version="1.0" encoding="UTF-8"?>\
               <FakeWrapper xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se"><se:PolygonSymbolizer>';
var xmlSuffix = ' </se:PolygonSymbolizer></FakeWrapper>';

var symbolizerFixtures = [
   {
      input: '<se:Fill>\
         <se:SvgParameter name="fill">#fff5f0</se:SvgParameter>\
         </se:Fill>\
         <se:Stroke>\
         <se:SvgParameter name="stroke">#00ff00</se:SvgParameter>\
         <se:SvgParameter name="stroke-width">0.26</se:SvgParameter>\
         </se:Stroke>',
      output: L.extend({}, L.SLDStyler.defaultStyle, {
        fillColor: "#fff5f0",
        color: "#00ff00",
        weight: 0.26,
      }),
   },
   {
      input: '<se:Stroke>\
         <se:SvgParameter name="stroke">#ff0000</se:SvgParameter>\
         <se:SvgParameter name="stroke-width">0.26</se:SvgParameter>\
         <se:SvgParameter name="stroke-linejoin">bevel</se:SvgParameter>\
         <se:SvgParameter name="stroke-linecap">square</se:SvgParameter>\
         </se:Stroke>',
      output: L.extend({}, L.SLDStyler.defaultStyle, {
         color: '#ff0000',
         weight: 0.26,
         lineJoin: 'bevel',
         lineCap: 'square'
      })
   },
   {
      input: '<se:Fill>\
         <se:SvgParameter name="fill">#fff5f0</se:SvgParameter>\
         <se:SvgParameter name="fill-opacity">0.96</se:SvgParameter>\
         </se:Fill>\
         <se:Stroke>\
         <se:SvgParameter name="stroke">#000000</se:SvgParameter>\
         <se:SvgParameter name="stroke-opacity">0.96</se:SvgParameter>\
         <se:SvgParameter name="stroke-width">0.26</se:SvgParameter>\
         <se:SvgParameter name="stroke-dasharray">1 2</se:SvgParameter>\
         </se:Stroke>',
      output: L.extend({}, L.SLDStyler.defaultStyle, {
         color: "#000000",
         fillColor: '#fff5f0',
         fillOpacity: 0.96,
         weight: 0.26,
         dashArray: '1, 2',
         strokeOpacity: 0.96
      })
   }
];

var filterFixtures = [
   {
      input: '<ogc:Filter>\
              <ogc:PropertyIsGreaterThan>\
                <ogc:PropertyName>PR_AUT</ogc:PropertyName>\
                <ogc:Literal>36.36</ogc:Literal>\
              </ogc:PropertyIsGreaterThan>\
          </ogc:Filter>',
      output: {
            operator: null,
            comparisions: [
               {
                  operator: '>',
                  property: 'PR_AUT',
                  literal: "36.36"
               }
            ]
         }
   },
   {
      input: '<ogc:Filter>\
            <ogc:And>\
              <ogc:PropertyIsGreaterThan>\
                <ogc:PropertyName>PR_AUT</ogc:PropertyName>\
                <ogc:Literal>36.36</ogc:Literal>\
              </ogc:PropertyIsGreaterThan>\
              <ogc:PropertyIsLessThanOrEqualTo>\
                <ogc:PropertyName>PR_AUT</ogc:PropertyName>\
                <ogc:Literal>48.464</ogc:Literal>\
              </ogc:PropertyIsLessThanOrEqualTo>\
            </ogc:And>\
          </ogc:Filter>',
      output: {
            operator: 'and',
            comparisions: [
               {
                  operator: '>',
                  property: 'PR_AUT',
                  literal: "36.36"
               },
               {
                  operator: '<=',
                  property: 'PR_AUT',
                  literal: "48.464"
               }
            ]
         }
   }
   //OrRule:
];

var ruleFixtures = [
   {
      input: '<se:Rule>\
          <se:Name> 36.4 - 48.5 </se:Name>\
          <se:Description>\
            <se:Title> 36.4 - 48.5 </se:Title>\
          </se:Description>\
          <ogc:Filter>\
            <ogc:And>\
              <ogc:PropertyIsGreaterThan>\
                <ogc:PropertyName>PR_AUT</ogc:PropertyName>\
                <ogc:Literal>36.36</ogc:Literal>\
              </ogc:PropertyIsGreaterThan>\
              <ogc:PropertyIsLessThanOrEqualTo>\
                <ogc:PropertyName>PR_AUT</ogc:PropertyName>\
                <ogc:Literal>48.464</ogc:Literal>\
              </ogc:PropertyIsLessThanOrEqualTo>\
            </ogc:And>\
          </ogc:Filter>\
          <se:PolygonSymbolizer>\
            <se:Fill>\
              <se:SvgParameter name="fill">#fff5f0</se:SvgParameter>\
              <se:SvgParameter name="fill-opacity">0.96</se:SvgParameter>\
            </se:Fill>\
            <se:Stroke>\
              <se:SvgParameter name="stroke">#000000</se:SvgParameter>\
              <se:SvgParameter name="stroke-opacity">0.96</se:SvgParameter>\
              <se:SvgParameter name="stroke-width">0.26</se:SvgParameter>\
              <se:SvgParameter name="stroke-dasharray">1 2</se:SvgParameter>\
            </se:Stroke>\
          </se:PolygonSymbolizer>\
        </se:Rule>',
      output: {
         filter: {
            operator: 'and',
            comparisions: [
               {
                  operator: '>',
                  property: 'PR_AUT',
                  literal: "36.36"
               },
               {
                  operator: '<=',
                  property: 'PR_AUT',
                  literal: "48.464"
               }
            ]
         },
         symbolizer: L.extend({}, L.SLDStyler.defaultStyle, {
            color: "#000000",
            fillColor: '#fff5f0',
            fillOpacity: 0.96,
            weight: 0.26,
            dashArray: '1, 2',
            strokeOpacity: 0.96
         })
      }
   }

]


QUnit.test('symbolizer', function() {
   symbolizerFixtures.forEach(function(fixture) {
      var parser = new DOMParser();
      var input = xmlPrefix + fixture.input + xmlSuffix;
      var xmlDoc = parser.parseFromString(input, 'text/xml');

      var styler = new L.SLDStyler();
      deepEqual(styler.parseSymbolizer(xmlDoc), fixture.output);
   })
})

QUnit.test('filter', function() {
   filterFixtures.forEach(function(fixture) {
      var parser = new DOMParser();
      var input = xmlPrefix + fixture.input + xmlSuffix;
      var xmlDoc = parser.parseFromString(input, "text/xml");

      var styler = new L.SLDStyler();
      deepEqual(styler.parseFilter(xmlDoc), fixture.output);
   });
});



QUnit.test('rule', function() {
   ruleFixtures.forEach(function(fixture) {
      var parser = new DOMParser();
      var input = xmlPrefix + fixture.input + xmlSuffix;
      var xmlDoc = parser.parseFromString(input, "text/xml");

      var styler = new L.SLDStyler();
      deepEqual(styler.parseRule(xmlDoc), fixture.output);
   });
});

QUnit.test('featuretypestyle', function() {
   ruleFixtures.forEach(function(fixture) {
      var parser = new DOMParser();
      var input = xmlPrefix + fixture.input + xmlSuffix;
      var xmlDoc = parser.parseFromString(input, "text/xml");

      var styler = new L.SLDStyler();
      deepEqual(styler.parseRule(xmlDoc), fixture.output);
   });
});
(function() {

// default Path style applied if nothing matches
var defaultStyle = {
   stroke: true,
   color: "#03f",
   weight: 5,
   opacity: 1,
   fillOpacity: 1,
   fillColor: '#03f',
   strokeOpacity: 1,
   strokeWidth: 1,
   strokeDashstyle: "solid",
   size: 3,
   dashArray: null,
   lineJoin: null,
   lineCap: null,
};

// attributes converted to numeric values
var numericAttributes = ['weight', 'opacity', 'fillOpacity', 'strokeOpacity', 'size', 'rotation'];

// mapping between SLD attribute names and SVG names
var attributeNameMapping = {
   'stroke': 'color',
   'stroke-width': 'weight',
   'stroke-opacity': 'opacity',
   'fill-opacity': 'fillOpacity',
   'fill': 'fillColor',
   'stroke-opacity': 'strokeOpacity',
   'stroke-dasharray': 'dashArray',
   //strokeDashstyle,
   'stroke-linejoin': 'lineJoin',
   'stroke-linecap': 'lineCap',
   // a bit special for pointsymboler, marker
   'size': 'size',
   'rotation': 'rotation',
   'wellknownname': 'wellKnownName'
};

// mapping SLD operators to shortforms
var comparisionOperatorMapping = {
   'ogc:PropertyIsEqualTo': '==',
   'ogc:PropertyIsNotEqualTo': '!=',
   'ogc:PropertyIsLessThan': '<',
   'ogc:PropertyIsGreaterThan': '>',
   'ogc:PropertyIsLessThanOrEqualTo': '<=',
   'ogc:PropertyIsGreaterThanOrEqualTo': '>=',
   //'ogc:PropertyIsNull': 'isNull',
   //'ogc:PropertyIsBetween'
   // ogc:PropertyIsLike
};

// namespaces for Tag lookup in XML
var namespaceMapping = {
   se: 'http://www.opengis.net/se',
   ogc: 'http://www.opengis.net/ogc',
   sld: 'http://www.opengis.net/sld'
};

function getTagNameArray(element, tagName, childrens) {
   var tagParts = tagName.split(':');
   var ns = null;
   var tags;

   if (tagParts.length == 2) {
      ns = tagParts[0];
      tagName = tagParts[1];
   }

   if(typeof(childrens) !== 'undefined' && childrens) {
      tags = [].filter.call(
         element.children,
         function(element) {
            return element.tagName === ns + ':' + tagName
         }
      )
   } else
      tags = [].slice.call(element.getElementsByTagNameNS(
         namespaceMapping[ns],
         tagName
      ));

   if(!tags.length && ns === 'se')
      return getTagNameArray(element, 'sld:' + tagName, childrens);
   else
      return tags;
};

/**
 * SLD Styler. Reads SLD 1.1.0.
 *
 */
L.SLDStyler = L.Class.extend({
   options: {
      unmatchedStyle: {
         color: false,
         fill: false
      }
   },
   initialize: function(sldStringOrXml, options) {
      L.Util.setOptions(this, options);
      if (sldStringOrXml !== undefined) {
         this.featureTypeStylesNameMap = {};
         this.featureTypeStyles = this.parse(sldStringOrXml);
      }
   },

   // translates PolygonSymbolizer attributes into Path attributes
   parseSymbolizer: function(symbolizer) {
      // SvgParameter names below se:Fill and se:Stroke
      // are unique so don't bother parsing them seperatly.
      var parameters = getTagNameArray(symbolizer, 'se:SvgParameter');
      var cssParams = L.extend({}, defaultStyle);

      if(!parameters.length) {
         parameters = getTagNameArray(symbolizer, 'se:CssParameter');
      }

      parameters.forEach(function(param) {
         var key = param.getAttribute('name');
         var mappedKey = attributeNameMapping[key];
         if (false == (mappedKey in cssParams)) {
            console.error("Ignorning unknown SvgParameter name", key);
         } else {
            var value = param.textContent;
            if (numericAttributes.indexOf(mappedKey) > -1) {
               value = parseFloat(value, 10);
            } else if (mappedKey === 'dashArray') {
               value = value.split(' ').join(', ');
            }
            cssParams[mappedKey] = value;
         }
      });
      // invididual tags fro pointsymbolizer which is a bit special
      ['Size', 'WellKnownName', 'Rotation'].forEach(tagName => {
         const tags = getTagNameArray(symbolizer, 'se:' + tagName);
         if (tags.length) {
            const cssName = tagName.toLowerCase();
            const mappedKey = attributeNameMapping[cssName];
            let value = tags[0].textContent;
            if (numericAttributes.indexOf(cssName) > -1) {
               value = parseFloat(value, 10);
            }
            cssParams[mappedKey] = value;
         }
      })
      const sizeTags = getTagNameArray(symbolizer, 'se:Size');
      if (sizeTags.length) {
      }
      const wellKnownNameTags = getTagNameArray(symbolizer, 'se:WellKnownName');
      if (wellKnownNameTags.length) {
         cssParams[attributeNameMapping['wellknown']]
      }
      return cssParams;
   },
   parseFilter: function(filter) {
      if(filter) {
         var hasAnd = getTagNameArray(filter, 'ogc:And').length;
         var hasOr = getTagNameArray(filter, 'ogc:Or').length;
         var filterJson = {
            operator: hasAnd == true ? 'and' : hasOr ?  'or' : null,
            comparisions: []
         };
         Object.keys(comparisionOperatorMapping).forEach(function(key) {
            var comparisionElements = getTagNameArray(filter, key);
            var comparisionOperator = comparisionOperatorMapping[key];
            comparisionElements.forEach(function(comparisionElement) {
               var property = getTagNameArray(comparisionElement, 'ogc:PropertyName')[0].textContent;
               var literal = getTagNameArray(comparisionElement, 'ogc:Literal')[0].textContent;
               filterJson.comparisions.push({
                  operator: comparisionOperator,
                  property: property,
                  literal: literal
               })
            })
         });
         return filterJson;
      }
   },
   parseRule: function(rule) {
      var filter = getTagNameArray(rule, 'ogc:Filter')[0];
      var polygonSymbolizer = getTagNameArray(rule, 'se:PolygonSymbolizer')[0];
      var lineSymbolizer = getTagNameArray(rule, 'se:LineSymbolizer')[0];
      var pointSymbolizer = getTagNameArray(rule, 'se:PointSymbolizer')[0];
      return {
         filter: this.parseFilter(filter),
         polygonSymbolizer: polygonSymbolizer ? this.parseSymbolizer(polygonSymbolizer) : null,
         lineSymbolizer: lineSymbolizer ? this.parseSymbolizer(lineSymbolizer) : null,
         pointSymbolizer: pointSymbolizer ? this.parseSymbolizer(pointSymbolizer) : null
      }
   },
   parse: function(sldStringOrXml) {
      var xmlDoc = sldStringOrXml;
      var self = this;

      if (typeof(sldStringOrXml) === 'string') {
         var parser = new DOMParser();
         xmlDoc = parser.parseFromString(sldStringOrXml, "text/xml");
      }
      var featureTypeStyles = getTagNameArray(xmlDoc, 'se:FeatureTypeStyle');
      window.xmlDoc = xmlDoc;

      featureTypeStyles.forEach(function(element, idx) {
         var layerName = getTagNameArray(
            element.parentElement.parentElement,
            'se:Name',
            true
         ).map(function (node) {
            return node.innerHTML;
         });

         if(layerName.length) {
            self.featureTypeStylesNameMap[layerName] = idx;
         }
      });

      return featureTypeStyles.map(function(featureTypeStyle) {
         var rules = getTagNameArray(featureTypeStyle, 'se:Rule');
         var name = getTagNameArray(
               featureTypeStyle.parentElement,
               'se:Name',
               true
            ).map(function(node) {
               return node.innerHTML;
            });

         if(!name.length)
            name = null;
         else
            name = name[0];

         return {
            'name' : name,
            'rules': rules.map(function(rule) {
               return this.parseRule(rule);
            }, this)
         };
      }, this);
   },
   isFilterMatch: function(filter, properties) {
      if (filter) {
         var operator = filter.operator == null || filter.operator == 'and' ? 'every' : 'some';
         return filter.comparisions[operator](function(comp) {
            if (comp.operator == '==') {
               return properties[comp.property] == comp.literal;
            } else if (comp.operator == '!=') {
               return properties[comp.property] != comp.literal;
            } else if (comp.operator == '<') {
               return properties[comp.property] < comp.literal;
            } else if (comp.operator == '>') {
               return properties[comp.property] > comp.literal;
            } else if (comp.operator == '<=') {
               return properties[comp.property] <= comp.literal;
            } else if (comp.operator == '>=') {
               return properties[comp.property] >= comp.literal;
            } else {
               console.error('Unknown comparision operator', comp.operator);
            }
         });
      } else
         return true;
   },
   matchFn: function (featureTypeStyle, feature) {
      var matchingRule = null;

      featureTypeStyle.rules.some(function (rule) {
         if (this.isFilterMatch(rule.filter, feature.properties)) {
            matchingRule = rule;
            return true;
         }
      }, this);

      return matchingRule;
   },
   styleFn: function (indexOrName, feature) {
      var matchingRule = null;

      if (typeof (indexOrName) !== 'undefined') {
         if (
            typeof (indexOrName) === "string" &&
            indexOrName in this.featureTypeStylesNameMap
         ) {
            indexOrName = this.featureTypeStylesNameMap[indexOrName];
         } else {
            console.error("Unknown layer style '" + indexOrName + "'.")
            return {};
         }

         if(indexOrName in this.featureTypeStyles) {
            matchingRule = this.matchFn(
               this.featureTypeStyles[indexOrName],
               feature
            )
         } else {
            console.error("Unkonwn style index " + indexOrName)
            return {}
         }
      } else
         this.featureTypeStyles.some(function (featureTypeStyle) {
            matchingRule = this.matchFn(featureTypeStyle, feature)
         }, this);

      if (matchingRule != null) {
         switch (feature.geometry.type) {
            case 'LineString':
            case 'MultiLineString':
               return matchingRule.lineSymbolizer;
            case 'Polygon':
            case 'MultiPolygon':
               return matchingRule.polygonSymbolizer;
            case 'Point':
               return matchingRule.pointSymbolizer;
         }
         return this.options.unmatchedStyle;
      }

      return {};
   },
   pointToLayerFunction: function(indexOrName, feature, latlng) {
      var styling = this.styleFn(indexOrName, feature);
      return L.circleMarker(latlng, {
         radius: styling.size || 1,
         interactive: false
      });
   },
   getStyleFunction: function (indexOrName) {
      return this.styleFn.bind(this, indexOrName);
   },
   getPointToLayerFunction: function(indexOrName) {
      return this.pointToLayerFunction.bind(this, indexOrName);
   }
});

L.SLDStyler.defaultStyle = defaultStyle;

})();
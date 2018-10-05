"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parse = parse;
exports.parseFromString = parseFromString;

var _dataModel = require("@rdfjs/data-model");

var _dataModel2 = _interopRequireDefault(_dataModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseElement(element, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target, baseIRI) {
    function invokeTarget(subject, predicate, object) {
        target(_dataModel2.default.quad(subject, predicate, object));
    }
    if (element.nodeType === 1) {
        //console.log(element.nodeName);
        if (element.getAttribute("prefix")) {
            var prefixArray = element.getAttribute("prefix").trim().split(/:\s+|\s+/);
            for (var i = 0; i < prefixArray.length; i = i + 2) {
                Object.defineProperty(prefixMappings, prefixArray[i], {
                    value: prefixArray[i + 1],
                    writable: true
                });
                Object.defineProperty(prefixMappings, prefixArray[i], {
                    value: prefixArray[i + 1],
                    writable: true
                });
            }
        }
        noPrefixMapping = element.getAttribute("vocab") ? element.getAttribute("vocab") : noPrefixMapping;
        if (element.getAttribute("typeof") === "rdfa:Pattern") {
            //console.log("Pattern: " + element.nodeName + (element.id ? "#" + element.id : ""));
        } else {
            var oldsubject = subject;
            subject = element.getAttribute("resource") ? evaluateRealtiveURI(element.getAttribute("resource"), baseIRI) : element.getAttribute("typeof") ? _dataModel2.default.blankNode() : subject;
            if (element.getAttribute("typeof")) {
                element.getAttribute("typeof").trim().split(/\s+/).forEach(function (type) {
                    if (element.getAttribute("property")) {
                        element.getAttribute("property").trim().split(/\s+/).forEach(function (property) {
                            var predicate = evaluateCURIE(property, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                            if (element.getAttribute("resource")) {
                                invokeTarget(oldsubject, predicate, evaluateRealtiveURI(element.getAttribute("resource"), baseIRI));
                            } else {
                                invokeTarget(oldsubject, predicate, subject);
                            }
                        });
                    }
                    var predicate = _dataModel2.default.namedNode("https://www.w3.org/1999/02/22-rdf-syntax-ns#type");
                    var object = evaluateCURIE(type, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                    if (element.getAttribute("resource")) {
                        invokeTarget(evaluateRealtiveURI(element.getAttribute("resource"), baseIRI), predicate, object);
                    } else {
                        invokeTarget(subject, predicate, object);
                    }
                });
            } else if (element.getAttribute("property")) {
                element.getAttribute("property").trim().split(/\s+/).forEach(function (property) {
                    var predicate = evaluateCURIE(property, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                    if (property === "rdfa:copy") {
                        if (element.getAttribute("href")) {
                            parseElement(document.querySelector(element.getAttribute("href")), prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
                        } else if (element.getAttribute("src")) {
                            parseElement(document.querySelector(element.getAttribute("src")), prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
                        } else {
                            throw new Error("Using rdfa:copy without href or src");
                        }
                    } else if (element.getAttribute("resource")) {
                        invokeTarget(oldsubject, predicate, evaluateRealtiveURI(element.getAttribute("resource"), baseIRI));
                    } else {
                        var dataType = element.getAttribute("datatype") ? evaluateCURIE(element.getAttribute("datatype"), prefixMappings, defaultPrefixMapping, noPrefixMapping) : null;
                        var object = element.getAttribute("content") ? _dataModel2.default.literal(element.getAttribute("content"), dataType) : element.getAttribute("href") ? evaluateRealtiveURI(element.getAttribute("href"), baseIRI) : element.getAttribute("src") ? evaluateRealtiveURI(element.getAttribute("src"), baseIRI) : element.innerHTML ? _dataModel2.default.literal(element.innerHTML, dataType) : _dataModel2.default.literal(element.textContent, dataType);
                        invokeTarget(subject, predicate, object);
                    }
                });
            }
        }
        Array.from(element.childNodes).forEach(function (child) {
            //console.log(child.nodeName +" "+child.nodeType)
            if (child.nodeType === 1 && child.getAttribute("typeof") !== "rdfa:Pattern") {
                //rdfa:Patterns must be ignored except when copied (https://www.w3.org/TR/html-rdfa/#implementing-property-copying)
                parseElement(child, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
            }
        });
    }
}

function evaluateRealtiveURI(relativeURI, base) {
    return _dataModel2.default.namedNode(new URL(relativeURI, base).href);
}

function evaluateCURIE(curie, prefixMappings, defaultPrefixMapping, noPrefixMapping) {
    var colonPos = curie.indexOf(":");
    if (curie.startsWith("_")) {
        return _dataModel2.default.blankNode(curie.substring(colonPos + 1));
    } else {
        if (colonPos === -1) {
            if (!noPrefixMapping) {
                throw new Error("Using curies without prefix, but no vocab defined");
            }
            return _dataModel2.default.namedNode(noPrefixMapping + curie);
        }
        if (colonPos === 0) {
            if (!noPrefixMapping) {
                throw new Error("Using curies without prefix, but no vocab defined");
            }
            return _dataModel2.default.namedNode(defaultPrefixMapping + curie.substring(1));
        }
        var prefix = curie.substring(0, colonPos);
        var suffix = curie.substring(colonPos + 1);
        if (prefixMappings[prefix]) {
            return _dataModel2.default.namedNode(prefixMappings[prefix] + suffix);
        } else {
            return _dataModel2.default.namedNode(curie);
        }
    }
}

/**
 * Parses a Node / HTMLElement with RDFa
 * 
 * @param {Node} element - Node / Element to be parsed
 * @param {Function} target - Function to give (subject,predicate,object). Gets called every time a triple is found
 * @param {IRI} [base=null] - baseIRI to be used instead of window.location
 * @param {boolean} [useInitialContext=false] - If https://www.w3.org/2013/json-ld-context/rdfa11 should be loaded as initial set of prefixes
 */
function parse(element, target, base, useInitialContext) {
    var currentSubject = _dataModel2.default.namedNode(base || window.location.href);
    var context = useInitialContext ? {} : {
        "as": "https://www.w3.org/ns/activitystreams#",
        "dqv": "http://www.w3.org/ns/dqv#",
        "duv": "https://www.w3.org/TR/vocab-duv#",
        "cat": "http://www.w3.org/ns/dcat#",
        "qb": "http://purl.org/linked-data/cube#",
        "grddl": "http://www.w3.org/2003/g/data-view#",
        "ldp": "http://www.w3.org/ns/ldp#",
        "oa": "http://www.w3.org/ns/oa#",
        "ma": "http://www.w3.org/ns/ma-ont#",
        "owl": "http://www.w3.org/2002/07/owl#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfa": "http://www.w3.org/ns/rdfa#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rif": "http://www.w3.org/2007/rif#",
        "rr": "http://www.w3.org/ns/r2rml#",
        "skos": "http://www.w3.org/2004/02/skos/core#",
        "skosxl": "http://www.w3.org/2008/05/skos-xl#",
        "wdr": "http://www.w3.org/2007/05/powder#",
        "void": "http://rdfs.org/ns/void#",
        "wdrs": "http://www.w3.org/2007/05/powder-s#",
        "xhv": "http://www.w3.org/1999/xhtml/vocab#",
        "xml": "http://www.w3.org/XML/1998/namespace",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "prov": "http://www.w3.org/ns/prov#",
        "sd": "http://www.w3.org/ns/sparql-service-description#",
        "org": "http://www.w3.org/ns/org#",
        "gldp": "http://www.w3.org/ns/people#",
        "cnt": "http://www.w3.org/2008/content#",
        "dcat": "http://www.w3.org/ns/dcat#",
        "earl": "http://www.w3.org/ns/earl#",
        "ht": "http://www.w3.org/2006/http#",
        "ptr": "http://www.w3.org/2009/pointers#",
        "cc": "http://creativecommons.org/ns#",
        "ctag": "http://commontag.org/ns#",
        "dc": "http://purl.org/dc/terms/",
        "dc11": "http://purl.org/dc/elements/1.1/",
        "dcterms": "http://purl.org/dc/terms/",
        "foaf": "http://xmlns.com/foaf/0.1/",
        "gr": "http://purl.org/goodrelations/v1#",
        "ical": "http://www.w3.org/2002/12/cal/icaltzd#",
        "og": "http://ogp.me/ns#",
        "rev": "http://purl.org/stuff/rev#",
        "sioc": "http://rdfs.org/sioc/ns#",
        "v": "http://rdf.data-vocabulary.org/#",
        "vcard": "http://www.w3.org/2006/vcard/ns#",
        "schema": "http://schema.org/",
        "describedby": "http://www.w3.org/2007/05/powder-s#describedby",
        "license": "http://www.w3.org/1999/xhtml/vocab#license",
        "role": "http://www.w3.org/1999/xhtml/vocab#role",
        "ssn": "http://www.w3.org/ns/ssn/",
        "sosa": "http://www.w3.org/ns/sosa/",
        "time": "http://www.w3.org/2006/time#"
    };
    parseElement(element, context, null, null, currentSubject, target, base || window.location.href);
    return Promise.resolve(true);
}

function parseFromString(text, target, base, initialContext) {
    var domParser = new (require("xmldom").DOMParser)();
    var documentElement = domParser.parseFromString(text, 'text/html');
    var element = documentElement.documentElement;
    return parse(element, target, base, initialContext);
}
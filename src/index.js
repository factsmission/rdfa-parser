import dataModel from "@rdfjs/data-model";

function parseElement(element, prefixMappings, defaultPrefixMapping, vocabulary, subject, target, baseIRI, relation, revrelation) {
    function invokeTarget(subject, predicate, object) {
        target(dataModel.quad(subject, predicate, object));
    }
    if (element.nodeType === 1) {
        //console.log(element.nodeName);
        if (element.getAttribute("prefix")) {
            let prefixArray = element.getAttribute("prefix").trim().split(/:\s+|\s+/);
            for (let i = 0; i < prefixArray.length; i = i + 2) {
                Object.defineProperty(prefixMappings, prefixArray[i], {
                    value: prefixArray[i + 1].toLocaleLowerCase(),
                    writable: true
                })
            }
        }
        vocabulary = element.getAttribute("vocab") ? element.getAttribute("vocab") : vocabulary;
        if (element.getAttribute("typeof") === "rdfa:Pattern") {
            //console.log("Pattern: " + element.nodeName + (element.id ? "#" + element.id : ""));
        } else {
            let oldsubject = subject;
            subject = evaluateSafeCURIEorCURIEorIRI(element.getAttribute("resource") || element.getAttribute("about"), prefixMappings, defaultPrefixMapping, baseIRI) ||
                    (element.getAttribute("typeof") ?
                        dataModel.blankNode() :
                        subject
                    );
            if (element.getAttribute("typeof")) {
                element.getAttribute("typeof").trim().split(/\s+/).forEach(type => {
                    if (element.getAttribute("property")) {
                        element.getAttribute("property").trim().split(/\s+/).forEach(property => {
                            let predicate = evaluateTERMorCURIEorAbsIRI(property, vocabulary, prefixMappings, defaultPrefixMapping);
                            if (element.getAttribute("resource")) {
                                invokeTarget(oldsubject, predicate, evaluateIRI(element.getAttribute("resource"), baseIRI));
                            } else if (element.getAttribute("about")) {
                                let dataType = evaluateTERMorCURIEorAbsIRI(element.getAttribute("datatype"), vocabulary, prefixMappings, defaultPrefixMapping) || null;
                                invokeTarget(subject, predicate, (element.getAttribute("content") ?
                                        dataModel.literal(element.getAttribute("content"), dataType) :
                                        (element.getAttribute("href") ?
                                            evaluateIRI(element.getAttribute("href"), baseIRI) :
                                            (element.getAttribute("src") ?
                                                evaluateIRI(element.getAttribute("src"), baseIRI) :
                                                (element.innerHTML ?
                                                    dataModel.literal(element.innerHTML, dataType) :
                                                    dataModel.literal(element.textContent, dataType)
                                                )
                                            )
                                        )
                                    ));
                            } else {
                                invokeTarget(oldsubject, predicate, subject);
                            }
                        });
                    }
                    let predicate = dataModel.namedNode("https://www.w3.org/1999/02/22-rdf-syntax-ns#type");
                    let object = evaluateTERMorCURIEorAbsIRI(type, vocabulary, prefixMappings,defaultPrefixMapping);
                    invokeTarget(evaluateSafeCURIEorCURIEorIRI(element.getAttribute("resource") || element.getAttribute("about"), prefixMappings, defaultPrefixMapping, baseIRI) || subject, predicate, object);
                });
            } else if (element.getAttribute("property")) {
                element.getAttribute("property").trim().split(/\s+/).forEach(property => {
                    let predicate = evaluateTERMorCURIEorAbsIRI(property, vocabulary, prefixMappings, defaultPrefixMapping);
                    if (property === "rdfa:copy") {
                        if (element.getAttribute("href")) {
                            parseElement(document.querySelector(element.getAttribute("href")), prefixMappings, defaultPrefixMapping, vocabulary, subject, target, baseIRI, relation, revrelation);
                        } else if (element.getAttribute("src")) {
                            parseElement(document.querySelector(element.getAttribute("src")), prefixMappings, defaultPrefixMapping, vocabulary, subject, target, baseIRI, relation, revrelation);
                        } else {
                            throw new Error("Using rdfa:copy without href or src");
                        }
                    } else if (evaluateSafeCURIEorCURIEorIRI(element.getAttribute("resource") || element.getAttribute("about"), prefixMappings, defaultPrefixMapping, baseIRI)) {
                        invokeTarget(oldsubject, predicate, evaluateSafeCURIEorCURIEorIRI(element.getAttribute("resource") || element.getAttribute("about"), prefixMappings, defaultPrefixMapping, baseIRI), baseIRI);
                    } else {
                        let dataType = evaluateTERMorCURIEorAbsIRI(element.getAttribute("datatype"), vocabulary, prefixMappings, defaultPrefixMapping) || null;
                        let object = (element.getAttribute("content") ?
                            dataModel.literal(element.getAttribute("content"), dataType) :
                            (element.getAttribute("href") ?
                                evaluateIRI(element.getAttribute("href"), baseIRI) :
                                (element.getAttribute("src") ?
                                    evaluateIRI(element.getAttribute("src"), baseIRI) :
                                    (element.innerHTML ?
                                        dataModel.literal(element.innerHTML, dataType) :
                                        dataModel.literal(element.textContent, dataType)
                                    )
                                )
                            )
                        );
                        invokeTarget(subject, predicate, object);
                    }
                });
            }
            if (element.getAttribute("rel") || relation) {
                relation = element.getAttribute("rel") || relation;
                relation.trim().split(/\s+/).forEach(rel => {
                    if (element.getAttribute("src")) {
                        let object = evaluateIRI(element.getAttribute("src"), baseIRI);
                        invokeTarget(subject, evaluateTERMorCURIEorAbsIRI(relation, vocabulary, prefixMappings, defaultPrefixMapping), object);
                        relation = null;
                    } else if (element.getAttribute("href")) {
                        let object = evaluateIRI(element.getAttribute("href"), baseIRI);
                        invokeTarget(subject, evaluateTERMorCURIEorAbsIRI(relation, vocabulary, prefixMappings, defaultPrefixMapping), object);
                        relation = null;
                    }
                    if (element.getAttribute("typeof")) {
                        element.getAttribute("typeof").trim().split(/\s+/).forEach(type => {
                            let predicate = evaluateTERMorCURIEorAbsIRI(rel, vocabulary, prefixMappings, defaultPrefixMapping);
                            if (element.getAttribute("resource")) {
                                invokeTarget(oldsubject, predicate, evaluateIRI(element.getAttribute("resource"), baseIRI));
                            } else {
                                invokeTarget(oldsubject, predicate, subject);
                            }
                        });
                        relation = null;
                    } else if (element.getAttribute("resource")) {
                        let object = evaluateIRI(element.getAttribute("resource"), baseIRI);
                        invokeTarget(subject, evaluateTERMorCURIEorAbsIRI(relation, vocabulary, prefixMappings, defaultPrefixMapping), object);
                        relation = null;
                    }
                });
            }
            if (element.getAttribute("rev") || revrelation) {
                revrelation = element.getAttribute("rev") || revrelation;
                revrelation.trim().split(/\s+/).forEach(rev => {
                    if (element.getAttribute("src")) {
                        let object = evaluateIRI(element.getAttribute("src"), baseIRI);
                        invokeTarget(object, evaluateTERMorCURIEorAbsIRI(rev, vocabulary, prefixMappings, defaultPrefixMapping), subject);
                        revrelation = null;
                    } else if (element.getAttribute("href")) {
                        let object = evaluateIRI(element.getAttribute("href"), baseIRI);
                        invokeTarget(object, evaluateTERMorCURIEorAbsIRI(rev, vocabulary, prefixMappings, defaultPrefixMapping), subject);
                        revrelation = null;
                    }
                    if (element.getAttribute("typeof")) {
                        element.getAttribute("typeof").trim().split(/\s+/).forEach(type => {
                            let predicate = evaluateTERMorCURIEorAbsIRI(rev, vocabulary, prefixMappings, defaultPrefixMapping);
                            if (element.getAttribute("resource")) {
                                invokeTarget(oldsubject, predicate, evaluateIRI(element.getAttribute("resource"), baseIRI));
                            } else {
                                invokeTarget(oldsubject, predicate, subject);
                            }
                        });
                        revrelation = null;
                    } else if (element.getAttribute("resource")) {
                        let object = evaluateIRI(element.getAttribute("resource"), baseIRI);
                        invokeTarget(object, evaluateTERMorCURIEorAbsIRI(rev, vocabulary, prefixMappings, defaultPrefixMapping), subject);
                        revrelation = null;
                    }
                });
            }
        }
        Array.from(element.childNodes).forEach(child => {
            //console.log(child.nodeName +" "+child.nodeType)
            if ((child.nodeType === 1) && (child.getAttribute("typeof") !== "rdfa:Pattern")) {
                //rdfa:Patterns must be ignored except when copied (https://www.w3.org/TR/html-rdfa/#implementing-property-copying)
                parseElement(child, prefixMappings, defaultPrefixMapping, vocabulary, subject, target, baseIRI, relation, revrelation);
            }
        });
    }
}

function evaluateSafeCURIEorCURIEorIRI(sCoCoI, prefixMappings, defaultPrefixMapping, base) {
    //console.log("sCoCoI: " + sCoCoI);
    if (sCoCoI === null || sCoCoI === undefined) {
        return false;
    }
    if (sCoCoI.startsWith("[") && sCoCoI.endsWith("]")) {
        let curie = sCoCoI.replace(/\s*\[\s*/,"").replace(/\s*\]\s*/,"");
        return evaluateCURIE(curie, prefixMappings, defaultPrefixMapping);
    }
    return evaluateCURIE(sCoCoI, prefixMappings, defaultPrefixMapping) || evaluateIRI(sCoCoI, base);
}

function evaluateTERMorCURIEorAbsIRI(toCoAI, vocabulary, prefixMappings, defaultPrefixMapping) {
    //console.log("toCoAI: " + toCoAI);
    if (toCoAI === null || toCoAI === undefined) {
        return false;
    }
    return evaluateTERM(toCoAI, vocabulary) || evaluateCURIE(toCoAI, prefixMappings, defaultPrefixMapping) || evaluateIRI(toCoAI);
}

function evaluateIRI(iri, base) {
    if (base) {
        return dataModel.namedNode(new URL(iri, base).href);
    } else {
        return dataModel.namedNode(new URL(iri).href);
    }
}

function evaluateCURIE(curie, prefixMappings, defaultPrefixMapping) {
    let colonPos = curie.indexOf(":");
    if (colonPos === -1) {
        return false;
    }
    if (colonPos === 0) {
        if (!defaultPrefixMapping) {
            console.warn("Using curies with empty prefix, but no vocab defined: " + curie);
            return false;
        }
        return dataModel.namedNode(defaultPrefixMapping + curie.substring(1));
    }
    let prefix = curie.substring(0, colonPos).toLocaleLowerCase();
    let suffix = curie.substring(colonPos + 1);
    if (prefix === "_") {
        return dataModel.blankNode(suffix);
    }
    if (prefixMappings[prefix]) {
        return dataModel.namedNode(prefixMappings[prefix] + suffix);
    }
    return false;
}

function evaluateTERM(term, vocabulary, termMappings) {
    let colonPos = term.indexOf(":");
    if (colonPos === -1) {
        if (vocabulary) {
            return dataModel.namedNode(vocabulary + term);
        }
        if (termMappings && termMappings[term]) {
            return dataModel.namedNode(termMappings[term]);
        }
    }
    return false;
}

/**
 * Parses a Node / HTMLElement with RDFa
 * 
 * @param {Node} element - Node / Element to be parsed
 * @param {Function} target - Function to give a quad. Gets called every time a quad is found
 * @param {IRI} [base=null] - baseIRI to be used instead of window.location
 * @param {boolean} [useInitialContext=false] - If https://www.w3.org/2013/json-ld-context/rdfa11 should be loaded as initial set of prefixes
 */
export function parseDOM(element, target, base, useInitialContext) {
    let currentSubject = dataModel.namedNode(base || element.baseURI || window.location.href);
    let context = useInitialContext ?
        {} :
        {
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
            "sosa":"http://www.w3.org/ns/sosa/",
            "time":"http://www.w3.org/2006/time#"
          };
    parseElement(element, context, null, null, currentSubject, target, (base || window.location.href), null);
    return Promise.resolve(true);
}

export function parseString(text, target, base, useInitialContext) {
    let domParser = new (require("@nleanba/ndjs").DOMParser)();
    let documentElement = domParser.parseFromString(text,'text/html');
    let element = documentElement.documentElement;
    return parseDOM(element, target, base, useInitialContext);
}

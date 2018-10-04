import dataModel from "@rdfjs/data-model";

function parseElement(element, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target, relation) {
    function invokeTarget(subject, predicate, object) {
        target(dataModel.quad(subject, predicate, object));
    }
    if (element.nodeType === 1) {
        //console.log(element.nodeName + " " + relation);
        if (element.getAttribute("prefix")) {
            let prefixArray = element.getAttribute("prefix").trim().split(/:\s+|\s+/);
            for (let i = 0; i < prefixArray.length; i = i + 2) {
                Object.defineProperty(prefixMappings, prefixArray[i], {
                    value: prefixArray[i + 1],
                    writable: true
                })
                Object.defineProperty(prefixMappings, prefixArray[i], {
                    value: prefixArray[i + 1],
                    writable: true
                })
            }
        }
        noPrefixMapping = element.getAttribute("vocab") ? element.getAttribute("vocab") : noPrefixMapping;
        if (element.getAttribute("typeof") === "rdfa:Pattern") {
            //console.log("Pattern: " + element.nodeName + (element.id ? "#" + element.id : ""));
        } else {
            let oldsubject = subject;
            subject = (element.getAttribute("about") ?
                evaluateRealtiveURI(element.getAttribute("about")) :
                (element.getAttribute("resource") ?
                    evaluateRealtiveURI(element.getAttribute("resource")) :
                    (element.getAttribute("typeof") ?
                        dataModel.blankNode() :
                        subject
                    )
                )
            );
            if (element.getAttribute("typeof")) {
                element.getAttribute("typeof").trim().split(/\s+/).forEach(type => {
                    if (element.getAttribute("property")) {
                        element.getAttribute("property").trim().split(/\s+/).forEach(property => {
                            let predicate = evaluateCURIE(property, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                            if (element.getAttribute("resource")) {
                                invokeTarget(oldsubject, predicate, evaluateRealtiveURI(element.getAttribute("resource")));
                            } else {
                                invokeTarget(oldsubject, predicate, subject);
                            }
                        });
                    }
                    let predicate = dataModel.namedNode("https://www.w3.org/1999/02/22-rdf-syntax-ns#type");
                    let object = evaluateCURIE(type, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                    if (element.getAttribute("resource")) {
                        invokeTarget(evaluateRealtiveURI(element.getAttribute("resource")), predicate, object);
                    } else {
                        invokeTarget(subject, predicate, object);
                    }
                });
            } else if (element.getAttribute("property")) {
                element.getAttribute("property").trim().split(/\s+/).forEach(property => {
                    let predicate = evaluateCURIE(property, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                    if (property === "rdfa:copy") {
                        if (element.getAttribute("href")) {
                            parseElement(document.querySelector(element.getAttribute("href")), prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
                        } else if (element.getAttribute("src")) {
                            parseElement(document.querySelector(element.getAttribute("src")), prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
                        } else {
                            throw new Error("Using rdfa:copy without href or src");
                        }
                    } else if (element.getAttribute("resource")) {
                        invokeTarget(oldsubject, predicate, evaluateRealtiveURI(element.getAttribute("resource")));
                    } else {
                        let dataType = (element.getAttribute("datatype") ?
                            evaluateCURIE(element.getAttribute("datatype"), prefixMappings, defaultPrefixMapping, noPrefixMapping) :
                            null)
                        let object = (element.getAttribute("content") ?
                            dataModel.literal(element.getAttribute("content"), dataType) :
                            (element.href ?
                                dataModel.namedNode(new URL(element.href, window.location.href).href) :
                                (element.src ?
                                    dataModel.namedNode(new URL(element.src, window.location.href).href) :
                                    dataModel.literal(element.innerHTML, dataType)
                                )
                            )
                        );
                        invokeTarget(subject, predicate, object);
                    }
                });
            }
            if (element.getAttribute("rel") || relation) {
                relation =
                    (element.getAttribute("rel") ?
                        element.getAttribute("rel") :
                        relation);
                relation.trim().split(/\s+/).forEach(rel => {
                    if (element.src) {
                        let object = evaluateRealtiveURI(element.src);
                        invokeTarget(subject, evaluateCURIE(relation), object);
                        relation = null;
                    } else if (element.href) {
                        let object = evaluateRealtiveURI(element.href);
                        invokeTarget(subject, evaluateCURIE(relation), object);
                        relation = null;
                    }
                    if (element.getAttribute("typeof")) {
                        element.getAttribute("typeof").trim().split(/\s+/).forEach(type => {
                            relation.trim().split(/\s+/).forEach(rel => {
                                let object = evaluateCURIE(type, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                                let predicate = evaluateCURIE(rel, prefixMappings, defaultPrefixMapping, noPrefixMapping);
                                if (element.getAttribute("resource")) {
                                    invokeTarget(oldsubject, predicate, evaluateRealtiveURI(element.getAttribute("resource")));
                                } else {
                                    invokeTarget(oldsubject, predicate, subject);
                                }
                            });
                        });
                        relation = null;
                    } else if (element.getAttribute("resource")) {
                        let object = evaluateRealtiveURI(element.getAttribute("resource"));
                        invokeTarget(subject, evaluateCURIE(relation), object);
                        relation = null;
                    }
                });
            }
        }
        element.childNodes.forEach(child => {
            if ((child.nodeType === 1) && (child.getAttribute("typeof") !== "rdfa:Pattern")) {
                //rdfa:Patterns must be ignored except when copied (https://www.w3.org/TR/html-rdfa/#implementing-property-copying)
                parseElement(child, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target, (relation ? relation : null));
            }
        });
    }
}

function evaluateRealtiveURI(relativeURI) {
    return dataModel.namedNode(new URL(relativeURI, window.location.href).href);
}

function evaluateCURIE(curie, prefixMappings, defaultPrefixMapping, noPrefixMapping) {
    let colonPos = curie.indexOf(":");
    if (curie.startsWith("_")) {
        return dataModel.blankNode(curie.substring(colonPos + 1));
    } else {
        if (colonPos === -1) {
            if (!noPrefixMapping) {
                throw new Error("Using curies without prefix, but no vocab defined");
            }
            return dataModel.namedNode(noPrefixMapping + curie);
        }
        if (colonPos === 0) {
            if (!noPrefixMapping) {
                throw new Error("Using curies without prefix, but no vocab defined");
            }
            return dataModel.namedNode(defaultPrefixMapping + curie.substring(1));
        }
        let prefix = curie.substring(0, colonPos);
        let suffix = curie.substring(colonPos + 1);
        if (prefixMappings[prefix]) {
            return dataModel.namedNode(prefixMappings[prefix] + suffix);
        } else {
            return dataModel.namedNode(curie);
        }
    }
}

/**
 * Parses a Node / HTMLElement with RDFa
 * 
 * @param {Node} element - Node / Element to be parsed
 * @param {Function} target - Function to give (subject,predicate,object). Gets called every time a triple is found
 * @param {boolean} [initialContext=false] - If https://www.w3.org/2013/json-ld-context/rdfa11 should be loaded as initial set of prefixes
 */
export function parse(element, target, initialContext) {
    let currentSubject = dataModel.namedNode(window.location);
    if (initialContext) {
        fetch("https://www.w3.org/2013/json-ld-context/rdfa11").then(r => r.json()).then(response => {
            parseElement(element, response["@context"], null, null, currentSubject, target);
        })
    } else {
        parseElement(element, {}, null, null, currentSubject, target);
    }
}

export function parseText(text, target, initialContext) {
    let domParser = new DOMParser();
    let documentElement = domParser.parseFromString(text,'text/html');
    let element = documentElement.documentElement;
    let currentSubject = dataModel.namedNode(window.location);
    if (initialContext) {
        fetch("https://www.w3.org/2013/json-ld-context/rdfa11").then(r => r.json()).then(response => {
            parseElement(element, response["@context"], null, null, currentSubject, target);
        })
    } else {
        parseElement(element, {}, null, null, currentSubject, target);
    }
}
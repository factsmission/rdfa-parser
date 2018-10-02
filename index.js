import dataModel from "@rdfjs/data-model";

function parseElement(element, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target) {
    if (element.nodeType === 1) {
        //console.log(element.nodeName);
        noPrefixMapping = element.getAttribute("vocab") ? element.getAttribute("vocab") : noPrefixMapping;
        let notpattern = false;
        if (element.getAttribute("typeof") === "rdfa:Pattern") {
            console.log("PATTERN: " + element.nodeName + (element.id ? "#" + element.id : ""));
        } else {
            let bnode = dataModel.blankNode();
            if (element.getAttribute("typeof")) {
                notpattern = true;
                if (element.getAttribute("property")) {
                    let predicate = evaluateCURIE(element.getAttribute("property"), prefixMappings, defaultPrefixMapping, noPrefixMapping);
                    if (element.getAttribute("resource")) {
                        target(subject, predicate, evaluateRealtiveURI(element.getAttribute("resource")));
                    } else {
                        target(subject, predicate, bnode);
                    }
                }
                let predicate = dataModel.namedNode("https://www.w3.org/1999/02/22-rdf-syntax-ns#type");
                let object = evaluateCURIE(element.getAttribute("typeof"), prefixMappings, defaultPrefixMapping, noPrefixMapping);
                if (element.getAttribute("resource")) {
                    target(evaluateRealtiveURI(element.getAttribute("resource")), predicate, object);
                } else {
                    target(bnode, predicate, object);
                }
            }
            subject = (element.getAttribute("resource") ?
                evaluateRealtiveURI(element.getAttribute("resource")) :
                (element.getAttribute("typeof") ?
                    bnode :
                    subject
                )
            );
        }
        if (!notpattern && element.getAttribute("property")) {
            if (element.getAttribute("property") === "rdfa:copy") {
                parseElement(document.querySelector(element.getAttribute("href")), prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
            } else {
                let predicate = evaluateCURIE(element.getAttribute("property"), prefixMappings, defaultPrefixMapping, noPrefixMapping);
                let object = (element.href ?
                    dataModel.namedNode(new URL(element.href, window.location.href).href) :
                    (element.src ?
                        dataModel.namedNode(new URL(element.src, window.location.href).href) :
                        dataModel.literal(element.innerHTML)
                    )
                );
                target(subject, predicate, object);
            }
        }
        element.childNodes.forEach(child => {
            if ((child.nodeType === 1) && (child.getAttribute("typeof") !== "rdfa:Pattern")) {
                //rdfa:Patterns must be ignored except when copied (https://www.w3.org/TR/html-rdfa/#implementing-property-copying)
                parseElement(child, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
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

export function parse(element, target) {
    let currentSubject = dataModel.namedNode(window.location);
    parseElement(element, {}, null, null, currentSubject, target);
}
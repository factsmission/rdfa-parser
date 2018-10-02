import dataModel from "@rdfjs/data-model";

function parseElement(element, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target) {
    if (element.nodeType === 1) {
        console.log(element.nodeName);
        subject = (element.getAttribute("resource") ? 
            evaluateRealtiveURI(element.getAttribute("resource")) :
            ( element.getAttribute("typeof") ?
                dataModel.blankNode():
                subject
            )
        );
        noPrefixMapping = element.getAttribute("vocab") ? element.getAttribute("vocab") : noPrefixMapping;
        if (element.getAttribute("typeof")) {
            let predicate = dataModel.namedNode("https://www.w3.org/1999/02/22-rdf-syntax-ns#type");
            let object = evaluateCURIE(element.getAttribute("typeof"), prefixMappings, defaultPrefixMapping, noPrefixMapping);
            target(subject, predicate, object);
        }
        if (element.getAttribute("property")) {
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
        element.childNodes.forEach(child => {
            parseElement(child, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
        });
    }
}

function evaluateRealtiveURI(relativeURI) {
    return dataModel.namedNode(new URL(relativeURI, window.location.href).href);
}

function evaluateCURIE(curie, prefixMappings, defaultPrefixMapping, noPrefixMapping) {
    let colonPos = curie.indexOf(":");
    if (curie.startsWith("_")) {
        return dataModel.blankNode(curie.substring(colonPos+1));
    } else {
        if (colonPos === -1) {
            if (!noPrefixMapping) {
                throw new Error("Using curies without prefix, but no vocab defined");
            }
            return dataModel.namedNode(noPrefixMapping+curie);
        }
        if (colonPos === 0) {
            if (!noPrefixMapping) {
                throw new Error("Using curies without prefix, but no vocab defined");
            }
            return dataModel.namedNode(defaultPrefixMapping+curie.substring(1));
        }
        let prefix = curie.substring(0, colonPos);
        let suffix = curie.substring(colonPos+1);
        if (prefixMappings[prefix]) {
            return dataModel.namedNode(prefixMappings[prefix]+suffix);
        } else {
            return dataModel.namedNode(curie);
        }
    }
}

export function parse(element, target) {
    let currentSubject = dataModel.namedNode(window.location);
    parseElement(element, {}, null, null, currentSubject, target);
}
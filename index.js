import dataModel from "@rdfjs/data-model";

function parseElement(element, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target) {
    if (element.nodeType === 1) {
        console.log(element.nodeName);
        noPrefixMapping = element.getAttribute("vocab") ? element.getAttribute("vocab") : noPrefixMapping;
        if (element.getAttribute("property")) {
            let predicate = evaluateCURIE(element.getAttribute("property"), prefixMappings, defaultPrefixMapping, noPrefixMapping);
            target(subject, predicate, dataModel.literal(element.innerHTML));
        }
        element.childNodes.forEach(child => {
            parseElement(child, prefixMappings, defaultPrefixMapping, noPrefixMapping, subject, target);
        });
    }
}

function evaluateCURIE(curie, prefixMappings, defaultPrefixMapping, noPrefixMapping) {
    if (curie.startsWith("_")) {
        return dataModel.blankNode(curie);
    } else {
        let colonPos = curie.indexOf(":");
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
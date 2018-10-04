// Parsing as Element
window.onload = () => {
    RDFa.parse(document.documentElement, (quad) => {
        let s = quad.subject;
        let p = quad.predicate;
        let o = quad.object;
        console.log(
            (s.termType === "NamedNode" ?
                "<"+s.value+">" :
                s.value
            ) +
            " <" +
            p.value +
            "> " +
            (o.termType === "NamedNode" ?
                "<"+o.value+"> ." :
                (o.termType === "Literal" ?
                    (o.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" ?
                        "\"\"\""+o.value+"\"\"\"^^<" +
                        o.datatype.value +
                        "> ." :
                        "\"\"\""+o.value+"\"\"\" ."
                    ) :
                    o.value+" ."
                )
            )
        );
    }, true);
}

//Parsing as String
/*window.onload = () => {
    RDFa.parseText(document.documentElement.innerHTML.toString(), (quad) => {
        let s = quad.subject;
        let p = quad.predicate;
        let o = quad.object;
        console.log(
            (s.termType === "NamedNode" ?
                "<"+s.value+">" :
                s.value
            ) +
            " <" +
            p.value +
            "> " +
            (o.termType === "NamedNode" ?
                "<"+o.value+"> ." :
                (o.termType === "Literal" ?
                    (o.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" ?
                        "\"\"\""+o.value+"\"\"\"^^<" +
                        o.datatype.value +
                        "> ." :
                        "\"\"\""+o.value+"\"\"\" ."
                    ) :
                    o.value+" ."
                )
            )
        );
    }, true);
}*/
window.onload = () => {
    RDFa.parse(document.documentElement, (s,p,o) => {
        console.log(
            (s.termType === "NamedNode" ?
                "<"+s.value+">" :
                s.value
            ) +
            " <" +
            p.value +
            "> " +
            (o.termType === "NamedNode" ?
                "<"+o.value+">" :
                (o.termType === "Literal" ?
                    (o.datatype.value !== "http://www.w3.org/2001/XMLSchema#string" ?
                        "\"\"\""+o.value+"\"\"\"^^<" +
                        o.datatype.value +
                        ">" :
                        "\"\"\""+o.value+"\"\"\""
                    ) :
                    o.value
                )
            )
        );
    }, true);
}
// Parsing as Element
window.onload = () => {
    let g = $rdf.graph();
    let result = document.createElement("div");
    result.appendChild(document.createElement("h4")).innerHTML = "Triples found:"
    result.style.backgroundColor = "#eeeeee";
    result.style.padding = "8px";
    RDFa.parseDOM(document.documentElement, (quad) => {
        console.log(quad);
        g.add(quad);
    });
    const output = $rdf.serializers["text/turtle"].import(g.toStream());
    output.on('data', ntriples => {
        console.log(ntriples.toString());
        let code = document.createElement("code");
        code.innerText = ntriples.toString();
        result.appendChild(code);
        document.querySelector("body").appendChild(result);
      })
    //console.log(g.toNT());
}

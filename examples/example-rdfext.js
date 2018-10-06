// Parsing as Element
window.onload = () => {
    let g = rdf.graph();
    //Following 3 lines can be removed if the Note gets removed.
    let note = document.querySelector("#note");
    note.style.backgroundColor = "#ffab91";
    note.style.padding = "8px";
    let result = document.createElement("div");
    result.appendChild(document.createElement("h4")).innerHTML = "Triples found:"
    result.style.backgroundColor = "#eeeeee";
    result.style.padding = "8px";
    RDFa.parseDOM(document.documentElement, (quad) => g.add(quad));
    const output = (new NTriplesSerializer()).import(g.toStream());
    output.on('data', ntriples => {
        let code = document.createElement("code");
        code.innerText = ntriples.toString();
        result.appendChild(code);
        document.querySelector("body").appendChild(result);
        console.log(ntriples.toString());
      });
}

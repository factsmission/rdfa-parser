// Parsing as Element
window.onload = () => {
    let g = rdf.graph();
    RDFa.parseDOM(document.documentElement, (quad) => g.add(quad));
    const output = (new NTriplesSerializer()).import(g.toStream());
    output.on('data', ntriples => {
        console.log(ntriples.toString())
      });
}

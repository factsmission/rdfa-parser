// Parsing as Element
window.onload = () => {
    let g = $rdf.graph();
    RDFa.parse(document.documentElement, (quad) => g.add(quad));
    const output = $rdf.serializers["text/turtle"].import(g.toStream());
    output.on('data', ntriples => {
        console.log(ntriples.toString())
      })
    //console.log(g.toNT());
}

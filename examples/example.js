window.onload = () => {
    RDFa.parse(document.documentElement, (s,p,o) => {
        console.log("Got triple: "+s.value+", "+p.value+", \""+o.value+"\"")
    });
}
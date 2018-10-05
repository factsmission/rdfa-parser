const expect = require('chai').expect
const RDFa = require('../lib/index.js')


describe('Parse', () => {
    describe('an RDFa snippet', () => {
        describe('with base IRI', () => {
            it("Returns 4 Quads", (done) => {
                const base = 'https://www.example.org/abc/def';
                const content = `
                <html>
                <head>
                    <title>My home-page</title>
                    <script src="rdfa.js"></script>
                    <script type="text/javascript" src="https://retog.github.io/ext-rdflib/latest/rdf.js"></script>
                    <script src="example.js"></script>
                    <meta property="http://purl.org/dc/terms/creator" content="Mark Birbeck" />
                </head>
                <body>
                    <div property="http://purl.org/dc/terms/creator">b</div>
                    <div property="http://xmlns.com/foaf/0.1/topic" href="http://www.example.com/a"></div>
                    <div property="http://xmlns.com/foaf/0.1/topic" src="http://www.example.com/b"></div>
                </body>
                </html>`
                let quads = "";
                RDFa.parseFromString(content, (quad) => {
                    quads = quads + `${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}\n`
                    console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`);
                }, base).then(() => {
                    if (quads === "https://www.example.org/abc/def - http://purl.org/dc/terms/creator - Mark Birbeck\n" +
                        "https://www.example.org/abc/def - http://purl.org/dc/terms/creator - b\n" +
                        "https://www.example.org/abc/def - http://xmlns.com/foaf/0.1/topic - http://www.example.com/a\n" +
                        "https://www.example.org/abc/def - http://xmlns.com/foaf/0.1/topic - http://www.example.com/b\n" +
                        "") {
                        done()
                    }
                });
            })
        })
    })
})
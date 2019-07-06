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
                const goal = "https://www.example.org/abc/def - http://purl.org/dc/terms/creator - Mark Birbeck\nhttps://www.example.org/abc/def - http://purl.org/dc/terms/creator - b\nhttps://www.example.org/abc/def - http://xmlns.com/foaf/0.1/topic - http://www.example.com/a\nhttps://www.example.org/abc/def - http://xmlns.com/foaf/0.1/topic - http://www.example.com/b\n"
                let quads = "";
                RDFa.parseString(content, (quad) => {
                    quads = quads + `${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}\n`
                    console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`);
                }, base).then(() => {
                    if (quads === goal) {
                        done();
                    } else {
                        done(new Error('Expected: \n' + goal));
                    }
                });
            })
            it('Including about=""', (done) => {
                const base = 'https://www.example.org/abc/def';
                const content = `
                    <html xmlns="http://www.w3.org/1999/xhtml"
                    prefix="rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#
                    dc: http://dublincore.org/2012/06/14/dcelements#
                    rdfs: http://www.w3.org/2000/01/rdf-schema#
                    s: https://schema.org/">
                        <div typeof="s:Thing" about="">
                            <div property="dc:title" content="Another example">
                            </div>
                        </div>
                    </html>`
                const goal = "https://www.example.org/abc/def - https://www.w3.org/1999/02/22-rdf-syntax-ns#type - https://schema.org/Thing\nhttps://www.example.org/abc/def - http://dublincore.org/2012/06/14/dcelements#title - Another example\n"
                let quads = "";
                RDFa.parseString(content, (quad) => {
                    quads = quads + `${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}\n`
                    console.log(`${quad.subject.value} - ${quad.predicate.value} - ${quad.object.value}`);
                }, base).then(() => {
                    if (quads === goal) {
                        done();
                    } else {
                        done(new Error('Expected: \n' + goal));
                    }
                });
            })
        })
    })
})
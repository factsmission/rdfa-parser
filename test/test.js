const expect = require('chai').expect
const RDFa = require('../lib/index.js')


describe('Parse', () => {
    describe('an RDFa snippet', () => {
        describe('with base IRI', () => {
            it("cvb" , (done) => {
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
                RDFa.parseFromString(content, (quad) => console.log(`${quad.subject.value} - ${quad.predicate.value} - ${JSON.stringify(quad.object)}`), base).then(() => done());
            })
        })
    })
})
const expect = require('chai').expect
const $rdf = require('../js/rdf')

let parse = RDFa.parse
let graph = $rdf.graph

describe('Parse', () => {
    describe('an RDFa snippet', () => {
        describe('with base IRI', () => {
            let store
            before(done => {
                const base = 'https://www.example.org/abc/def'
                const mimeType = 'text/html'
                const content = `
                <html>
                    <head>
                        <title>My home-page</title>
                        <meta property="http://purl.org/dc/terms/creator" content="Mark Birbeck" />
                        <link rel="http://xmlns.com/foaf/0.1/topic" href="http://www.example.com/#us" />
                    </head>
                    <body>...</body>
                </html>`
                store = graph()
                parse(document.documentElement, (quad) => store.add(quad));
            })

            it('uses the specified base IRI', () => {
                expect(store.statements).to.have.length(3);
            })
        })
    })
})
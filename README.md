# rdfa-parser

## Functions

### `parseDOM(element,target,base,useInitialContext)`

Parses a Node / HTMLElement with RDFa.

### `parseString(string,target,base,useInitialContext)`

Parses a String containing a Node / HTMLElement with RDFa

### Parameters

| Parameter | Type | Description | Default |
| - | - | - | - |
| element | Node | Node / Element to be parsed | _Required Parameter_ |
| string | String | String of Node / Element to be parsed | _Required Parameter_ |
| target | Function | Function to give (subject,predicate,object). Gets called every time a triple is found | _Required Parameter_ |
| base | IRI | baseIRI to be used | `element.baseURI || window.location.href` |
| useInitialContext | boolean | If https://www.w3.org/2013/json-ld-context/rdfa11 should be loaded as initial set of prefixes | `false` |
 

## Example 1
```html
<head>
    ...
    <script src="{path to}/rdfa.js"></script>
    <script type="text/javascript" src="https://retog.github.io/ext-rdflib/latest/rdf.js"></script>
    <script>
        window.onload = () => {
            let g = $rdf.graph();
            RDFa.parseDOM(document.documentElement, (quad) => g.add(quad));
            const output = $rdf.serializers["text/turtle"].import(g.toStream());
            output.on('data', ntriples => console.log(ntriples.toString()));
        }
    </script>
    ...
</head>
```
All Triples found will be `console.log`ed as stringified ntriples.
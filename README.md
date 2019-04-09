# rdfa-parser

[![Build Status](https://travis-ci.org/factsmission/rdfa-parser.svg?branch=master)](https://travis-ci.org/factsmission/rdfa-parser)

An RDFa parser in JS. Not yet complete but we aim for full support of [HTML+RDFa 1.1](https://www.w3.org/TR/html-rdfa/).

## Usage

rdfa-parser provides functions to parse either HTMLElements or Strings containg RDFa. A `callback` function is invoked whenever a quad has been read. The argument passed to this function is an [rdfjs compliant quad](http://rdf.js.org/#quad-interface).

### `parseDOM(element,callback,base,useInitialContext)`

Parses a Node / HTMLElement with RDFa.

### `parseString(string,callback,base,useInitialContext)`

Parses a String containing a Node / HTMLElement with RDFa

### Parameters

| Parameter | Type | Description | Default |
| - | - | - | - |
| element | Node | Node / Element to be parsed | _Required Parameter_ |
| string | String | String of Node / Element to be parsed | _Required Parameter_ |
| callback | Function | Function to give a quad. Gets called every time a quad is found | _Required Parameter_ |
| base | IRI | baseIRI to be used | `element.baseURI \|\| window.location.href` |
| useInitialContext | boolean | If https://www.w3.org/2013/json-ld-context/rdfa11 should be loaded as initial set of prefixes | `false` |
 
## Building

Run `yarn build` to create `/distribution/latest/rdfa.js` for use in websites.

## Example 1
```html
<head>
    ...
    <script src="/distribution/latest/rdfa.js"></script>
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

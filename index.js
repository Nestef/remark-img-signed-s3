var visit = require('unist-util-visit')

function getSignedUrls() {
    return transformer
}

function transformer(tree) {

    visit(tree,'image', visitor)

    function visitor(node, index, parent) {
        // check the address format
        // get aws
        // make requests
        // edit link text
    }
}
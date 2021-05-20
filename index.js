import { visit } from 'unist-util-visit'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function getSignedUrls (options) {

  const s3Client = options.s3
  const bucket = options.bucket
  const expiration = options.expiration
  let cacheAdd = function (item) {
    return item
  }
  if (options.cacheAdd) {
    cacheAdd = options.cacheAdd
  }
  const cacheRead = options.cacheRead

  return transformer

  function transformer (tree, file, next) {

    const promises = []
    visit(tree, 'image', visitor)
    Promise.all(promises).then(_ => next())

    function visitor (node, index, parent) {
      console.log(node)
      // check the address format
      if (isValidHttpUrl(node.url)) {
        return
      }
      if (cacheRead) {
        cacheRead(node.url).then(res => {
          if (res === null) {
            const params = { Bucket: bucket, Key: node.url }
            const command = new GetObjectCommand(params)

            // make requests
            // edit link text
            const p = getSignedUrl(s3Client, command, { expiresIn: expiration }).then(res => cacheAdd(res, node.url)).then(res => { node.url = res })
            promises.push(p)
          } else {
            promises.push(Promise.resolve(res))
          }
        })
      } else {
        // get aws
        var params = { Bucket: bucket, Key: node.url }
        var command = new GetObjectCommand(params)

        // make requests
        // edit link text
        const p = getSignedUrl(s3Client, command, { expiresIn: expiration }).then(cacheAdd).then(res => node.url = res)

        promises.push(p)
      }

    }
  }

  function isValidHttpUrl (string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }
}

export { getSignedUrls }

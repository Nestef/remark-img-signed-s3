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

  return async (tree, file) => {

    const promises = []
    visit(tree, 'image', visitor)

    await Promise.all(promises)
    return tree;

    function visitor (node, index, parent) {
      // check the address format
      if (isValidHttpUrl(node.url)) {
        return
      }
      const p = getUrl(node.url).then(res => node.url = res)
      promises.push(p)
      return true

      function getUrl (key) {
        if (cacheRead) {
          return cacheRead(key).then(res => {
            if (res === null) {
              const params = { Bucket: bucket, Key: key }
              const command = new GetObjectCommand(params)

              // make requests
              // edit link text
              const p = getSignedUrl(s3Client, command, { expiresIn: expiration })
              return p
            } else {
              return Promise.resolve(res)
            }
          })
        } else {
          // get aws
          var params = { Bucket: bucket, Key: key }
          var command = new GetObjectCommand(params)

          // make requests
          // edit link text
          const p = getSignedUrl(s3Client, command, { expiresIn: expiration })
          return p
        }
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

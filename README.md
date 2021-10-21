# remark-img-signed-s3
[**remark**][remark] plugin to parse object keys embedded in markdown image tags into signed AWS S3 urls.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install remark-img-signed-s3
```

## Use

```js
import remarkParse from 'remark-parse'
import {unified} from 'unified'
import stringify from 'remark-stringify'
import { getSignedUrls } from 'remark-img-signed-s3'
import { S3Client } from '@aws-sdk/client-s3'

const s3 = new S3Client()

const processor = unified()
   .use(remarkParse)
   .use(getSignedUrls, {
          s3: s3,
          bucket: 'bucket name',
          expiration: 1800,
          cacheAdd: (result, key) => {
            // add to cache
            redis.set(key, result, 'EX', 1799)
            return result
          },
          cacheRead: (key) => {
            return redis.get(key)
          }
        })
   .use(stringify)
   .process('![alt text](s3 object key)')
   .then((file) => {
     console.log(String(file))
  })

```

Yields:

```markdown
![alt text](presigned aws url for object key)
```

## API
This package exports no identifiers.
The default export is `getSignedUrls`.

### `unified().use(getSignedUrls[, options])`

Plugin to load AWS signed urls for images from S3.
Replaces image src that are not valid http urls into signed urls from a given S3 bucket.

##### `options`

###### `options.s3`

S3 client from '@aws-sdk/client-s3' (`object`, required).

###### `options.bucket`

AWS S3 bucket name (`string`, required ).

###### `options.expiration`

Pre-Signed url expiration in seconds (`number`, required).
Passed to `expiresIn` option for `getSignedUrl` function from `@aws-sdk/s3-request-presigner`

###### `options.cacheAdd`

Optional function to add signed url to cache to reduce requests to AWS (`function`, optional).
If present, function will be called after a signed url is fetched from AWS.
Recommend setting an expiration on the cached url toalign with the signed url expiration.

###### `options.cacheRead`
Optional function to read signed url from cache to reduce requests to AWS (`function`, optional).
If present, function will be called before a signed url is fetched from AWS.


const http = require('http');

// Load the SDK
var AWS = require('aws-sdk');
var REGION = 'eu-frankfurt-1';
AWS.config.update({region: REGION});
var STORAGE_NAMESPACE = 'frpegpxf8trx';
var ACCESS_KEY = ''; // todo
var SECRETE_KEY = ''; // todo
var BUCKET = 'test20210205';

// Set up options to use for API client
var clientOptions = {
    signatureVersion: 'v4',
    sslEnabled: true,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRETE_KEY,
    endpoint: 'https://' + STORAGE_NAMESPACE + '.compat.objectstorage.' + REGION + '.oraclecloud.com'
};
console.log('\nClient Options: \n' + JSON.stringify(clientOptions, null, 2));

// Create API client
console.log('\nCreating API client...');
var apiClient = new AWS.S3(clientOptions);

// Make sure client object is valid
if (!apiClient) {
    throw new Error('\nERROR: Failed to create API client');
}

const params = apiClient.createPresignedPost({
    Bucket: BUCKET,
    Conditions: [
        ['acl', 'private'],
        ['bucket', BUCKET],
        ['starts-with', '$key', ''],
    ],
})

const { bucket, 'X-Amz-Algorithm': algo, 'X-Amz-Credential': cred, 'X-Amz-Date': date, 'Policy': policy, 'X-Amz-Signature': signature } = params.fields;

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<form method="post" action="${params.url}">
    <input type="text" name="bucket" value="${bucket}">
    <input type="text" name="X-Amz-Algorithm" value="${algo}">
    <input type="text" name="X-Amz-Credential" value="${cred}">
    <input type="text" name="X-Amz-Date" value="${date}">
    <input type="text" name="Policy" value="${policy}">
    <input type="text" name="X-Amz-Signature" value="${signature}">

    <input type="file" name="file" id="file" /> <br />
    <input type="submit" name="submit" value="Upload" />
</form>
</body>
</html>
`;

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(template);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

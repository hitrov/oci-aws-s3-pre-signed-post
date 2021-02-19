const http = require('http');

// Load the SDK
const AWS = require('aws-sdk');

// const PROVIDER = 'ibm';
const PROVIDER = 'aws';
// const PROVIDER = 'oci';
let REGION;
let BUCKET;
let NAMESPACE;
let ENDPOINT;
let ACCESS_KEY_ID;
let SECRET_ACCESS_KEY;
let FORM_ACTION;
const clientOptions = {
    signatureVersion: 'v4',
    sslEnabled: true
};
switch (PROVIDER) {
    case 'aws':
        REGION = 'eu-central-1';
        BUCKET = 'test20feb2021';
        ACCESS_KEY_ID = '';
        SECRET_ACCESS_KEY = '';
        FORM_ACTION = `https://${BUCKET}.s3.eu-central-1.amazonaws.com`;

        clientOptions.s3ForcePathStyle = false;
        break;
    case 'oci':
        REGION = 'eu-frankfurt-1';
        BUCKET = 'test20210214';
        NAMESPACE = 'frdtj2fg48gb';
        ENDPOINT = `https://${NAMESPACE}.compat.objectstorage.${REGION}.oraclecloud.com`;
        ACCESS_KEY_ID = '';
        SECRET_ACCESS_KEY = '';
        FORM_ACTION = `${ENDPOINT}/${BUCKET}`

        clientOptions.endpoint = ENDPOINT;
        clientOptions.s3ForcePathStyle = true;
        break;
    case 'ibm':
        REGION = 'eu-geo';
        BUCKET = 'test202102144';
        ENDPOINT ='https://s3.eu.cloud-object-storage.appdomain.cloud';
        ACCESS_KEY_ID = '';
        SECRET_ACCESS_KEY = '';
        FORM_ACTION = 'https://test202102144.s3.eu.cloud-object-storage.appdomain.cloud';

        clientOptions.endpoint = ENDPOINT;
        clientOptions.s3ForcePathStyle = false;
        break;
    default:
        throw new Error(`\nERROR: Unknown provider ${PROVIDER}`);
}

AWS.config.update({region: REGION});

clientOptions.accessKeyId = ACCESS_KEY_ID;
clientOptions.secretAccessKey = SECRET_ACCESS_KEY;

console.log('\nClient Options: \n' + JSON.stringify(clientOptions, null, 2));

// Create API client
console.log('\nCreating API client...');
const apiClient = new AWS.S3(clientOptions);

// Make sure client object is valid
if (!apiClient) {
    throw new Error('\nERROR: Failed to create API client');
}

const params = apiClient.createPresignedPost({
    Bucket: BUCKET,
    Conditions: [
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
<form method="post" enctype="multipart/form-data" action="${FORM_ACTION}">
    <input type="text" name="bucket" value="${bucket}">
    <input type="text" name="X-Amz-Algorithm" value="${algo}">
    <input type="text" name="X-Amz-Credential" value="${cred}">
    <input type="text" name="X-Amz-Date" value="${date}">
    <input type="text" name="Policy" value="${policy}">
    <input type="text" name="X-Amz-Signature" value="${signature}">

    <input type="text" name="key" value="\${filename}" /> <br />
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

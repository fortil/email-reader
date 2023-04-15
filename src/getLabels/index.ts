import path from "path";

const fs = require('fs');
const {promisify} = require('util');
const {google} = require('googleapis');
const {OAuth2Client} = require('google-auth-library');
const gmail = google.gmail('v1');

// Promisify with promise
const readFileAsync = promisify(fs.readFile);
const gmailListLabesAsync = promisify(gmail.users.labels.list); 
// Gmail label list 
const SECRETS_DIRECTORY = path.resolve(__dirname, "../", "../", "secrets/");
const TOKEN_DIR = path.resolve(SECRETS_DIRECTORY, "token/");
const CLIENT_SECRET = path.resolve(SECRETS_DIRECTORY, "../", "client_secret.json");

const TOKEN_PATH = path.resolve(TOKEN_DIR, "gmail-nodejs-quickstart.json"); // Specify the access token file
console.log("Cliente Secrets dir", TOKEN_PATH)
const main = async () => {
    // Get credential information
  const content = await readFileAsync(CLIENT_SECRET); 
// specify the client secret file
  const credentials = JSON.parse(content); // credential

    // authentication
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);
    const token = await readFileAsync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token);

    // Access the gmail via API
    const response = await gmailListLabesAsync({
        auth: oauth2Client,
        userId: 'me',
    });
    // display the result
    console.log(response.data);
};

main();
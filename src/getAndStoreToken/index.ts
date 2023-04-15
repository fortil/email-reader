//getAndStoreToken.js
"use strict";
import path from "path";

const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { promisify } = require("util");

const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

// Promisify with promise
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const rlQuestionAsync = promisify(rl.question);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const SECRETS_DIRECTORY = path.resolve(__dirname, "../", "../", "secrets/");
const TOKEN_DIR = path.resolve(SECRETS_DIRECTORY, "token/");
const CLIENT_SECRET = path.resolve(SECRETS_DIRECTORY, "../", "client_secret.json");
console.log("Client Screts dir", CLIENT_SECRET);
const TOKEN_PATH = path.resolve(TOKEN_DIR, "gmail-nodejs-quickstart.json");

const main = async () => {
  const content = await readFileAsync(CLIENT_SECRET);
  const credentials = JSON.parse(content); //credential
  //authentication
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  //get new token
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url: ", authUrl);

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    oauth2Client.getToken(code, async (err, token) => {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }

      oauth2Client.credentials = token;

      try {
        fs.mkdirSync(TOKEN_DIR);
      } catch (err: any) {
        if (err.code != "EEXIST") throw err;
      }

      await writeFileAsync(TOKEN_PATH, JSON.stringify(token));
      console.log("Token stored to " + TOKEN_PATH);
    });
  });
};

main();
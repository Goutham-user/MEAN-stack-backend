const { google } = require('googleapis');
const config = require('../config/config')

let CLIENT_ID="1010919213039-vroochbevgejdove5cjvho6eihia1j5u.apps.googleusercontent.com"
let CLIENT_SECRET="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"
let REDIRECT_URI="https://developers.google.com/oauthplayground"
let REFRESH_TOKEN="1//04hMKij5iGodICgYIARAAGAQSNwF-L9IrpAJWpxG3J8AZzDrNdpF2NL1ViyMUdn_fvKi9RETxEegm689az_b67sopCnb0lxL9aBM"

const oauth2Client = new google.auth.OAuth2(
    config.environmentVariables.CLIENT_ID,
    config.environmentVariables.CLIENT_SECRET,
    config.environmentVariables.REDIRECT_URI
);


// Set refresh token if available
if (config.environmentVariables.REFRESH_TOKEN) {
    oauth2Client.setCredentials({ refresh_token: config.environmentVariables.REFRESH_TOKEN });
}


module.exports = (req, res, next) => {
    if (oauth2Client.isTokenExpiring()) {
        oauth2Client
            .refreshAccessToken()
            .then((refreshResponse) => {
                const newAccessToken = refreshResponse.credentials.access_token;
                oauth2Client.setCredentials({
                    access_token: newAccessToken,
                    refresh_token: config.environmentVariables.REFRESH_TOKEN
                });
                next();
            })
            .catch((err) => {
                console.error('Error refreshing access token:', err);
                return res.status(401).send('Unauthorized 2');
            });
    } else {
        next();
    }
}
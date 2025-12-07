const { SessionsClient } = require('@google-cloud/dialogflow-cx');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');

const projectId = process.env.DIALOG_FLOWCX_PROJECT_ID;
const location = process.env.DIALOG_FLOWCX_LOCATION;
const agentId = process.env.DIALOG_FLOWCX_AGENT_ID;
const languageCode = process.env.DIALOG_FLOWCX_LANGUAGE_CODE;

const client = new SessionsClient({
    apiEndpoint: `${location}-dialogflow.googleapis.com`,
    // keyFile: path.join(__dirname, '../config/key.json')
    credentials: JSON.parse(process.env.DIALOG_FLOWCX_KEY_JSON),
});

async function detectIntent(text, sessionId) {
    const sessionPath = client.projectLocationAgentSessionPath(projectId, location, agentId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: { text },
            languageCode,
        },
    };

    const [response] = await client.detectIntent(request);
    return response;
}

module.exports = { detectIntent };

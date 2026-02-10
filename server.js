const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/texts.txt', express.static(path.join(__dirname, 'data', 'texts.txt')));

app.post('/save-responses', (req, res) => {
    try {
        const data = req.body;
        const responsesDir = path.join(__dirname, 'data');
        const responsesFile = path.join(responsesDir, 'responses.txt');

        if (!fs.existsSync(responsesDir)) {
            fs.mkdirSync(responsesDir, { recursive: true });
        }

        const responseEntry = formatResponseEntry(data);
        fs.appendFileSync(responsesFile, responseEntry + '\n\n');

        console.log(`Responses saved for participant: ${data.participant.name}`);

        const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
        if (DISCORD_WEBHOOK_URL) {
            try {
                const https = require('https');
                const url = new URL(DISCORD_WEBHOOK_URL);
                const fullContent = formatResponseEntry(data);
                const payload = JSON.stringify({
                    content: `Survey response from ${data.participant.name} (session ${data.participant.sessionId})`,
                    embeds: [{
                        title: `Survey ${data.participant.sessionId}`,
                        description: fullContent.length > 4096 ? fullContent.substring(0, 4096) : fullContent,
                        color: 3447003
                    }]
                });

const options = {
    hostname: url.hostname,
    path: url.pathname + (url.search || ''),
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req2 = https.request(options, (resp) => {
    let body = '';
    resp.on('data', (chunk) => body += chunk);
    resp.on('end', () => {
        console.log('Discord webhook forwarded, status:', resp.statusCode);
    });
});
req2.on('error', (e) => {
    console.error('Error forwarding to Discord webhook:', e.message);
});
req2.write(payload);
req2.end();
            } catch (e) {
    console.error('Failed to forward to Discord webhook:', e.message);
}
        } else {
    console.log('No DISCORD_WEBHOOK_URL configured; skipping webhook forward.');
}

res.json({
    success: true,
    message: 'Responses saved successfully',
    participantName: data.participant.name,
    sessionId: data.participant.sessionId
});
    } catch (error) {
    console.error('Error saving responses:', error);
    res.status(500).json({
        success: false,
        error: error.message
    });
}
});

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        message: 'Survey server is running'
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

function formatResponseEntry(data) {
    const participant = data.participant;
    const trials = data.trials;

    let output = '='.repeat(80) + '\n';
    output += `PARTICIPANT: ${participant.name}\n`;
    output += `SESSION ID: ${participant.sessionId}\n`;
    output += `TIMESTAMP: ${participant.timestamp}\n`;
    output += '='.repeat(80) + '\n\n';

    trials.forEach((trial, index) => {
        const isLeftSelected = trial.selectedText === 'left';
        const chosenRule = isLeftSelected ? trial.leftRule : trial.rightRule;
        const unchosendRule = isLeftSelected ? trial.rightRule : trial.leftRule;

        output += `TRIAL ${trial.questionNumber}:\n`;
        output += `---\n`;
        output += `Chosen Rule: ${chosenRule}\n`;
        output += `Unchosen Rule: ${unchosendRule}\n`;
        output += `Confidence: ${trial.confidence}/10\n`;
        if (trial.rationale) {
            output += `Rationale: ${trial.rationale}\n`;
        }
        output += '\n';
    });

    return output;
}

app.listen(PORT, () => {
    console.log(`Survey server running at http://localhost:${PORT}`);
    console.log('Serve the public folder or configure your live server to use this.');
});

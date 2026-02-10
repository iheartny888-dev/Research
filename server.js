const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

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
        output += `TRIAL ${trial.questionNumber}:\n`;
        output += `---\n`;
        output += `Base Text: ${trial.baseText}\n`;
        output += `Left Text: ${trial.leftText}\n`;
        output += `Right Text: ${trial.rightText}\n`;
        output += `Left Rule: ${trial.leftRule}\n`;
        output += `Right Rule: ${trial.rightRule}\n`;
        output += `Selected: ${trial.selectedText === 'left' ? 'LEFT' : 'RIGHT'}\n`;
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

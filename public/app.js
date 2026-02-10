const surveyState = {
    participant: {
        name: '',
        timestamp: '',
        sessionId: ''
    },
    currentQuestion: 0,
    totalQuestions: 25,
    responses: [],
    texts: [],
    trials: [],
    selectedText: null,
    selectedConfidence: null,
    rulesApplied: null
};

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTexts();
});

function initializeEventListeners() {
    document.getElementById('startSurveyBtn').addEventListener('click', validateAndStartSurvey);
    document.getElementById('selectLeft').addEventListener('click', () => selectText('left'));
    document.getElementById('selectRight').addEventListener('click', () => selectText('right'));
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectConfidence(this.dataset.value);
        });
    });
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('restartBtn').addEventListener('click', restartSurvey);
    document.getElementById('errorRetryBtn').addEventListener('click', retryLoad);
    document.getElementById('downloadBtn').addEventListener('click', downloadResponses);
}

function loadTexts() {
    fetch('texts.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load texts.txt. Please ensure the file exists in the public folder.');
            }
            return response.text();
        })
        .then(data => {
            surveyState.texts = data.split('\n').filter(line => line.trim().length > 0);
            if (surveyState.texts.length === 0) {
                showError('No texts found in texts.txt file. Please add at least one text per line.');
                return;
            }
            console.log(`Loaded ${surveyState.texts.length} texts for the survey`);
        })
        .catch(error => {
            console.error('Error loading texts:', error);
            showError(`Error loading texts: ${error.message}`);
        });
}

function retryLoad() {
    loadTexts();
    if (surveyState.texts.length > 0) {
        showScreen('consentScreen');
    }
}

function validateAndStartSurvey() {
    const name = document.getElementById('participantName').value.trim();
    const englishAbility = document.getElementById('englishAbility').checked;
    const consent = document.getElementById('consentCheckbox').checked;
    
    if (!name) {
        alert('Please enter your name.');
        return;
    }
    
    if (!englishAbility) {
        alert('Please confirm that you can speak English fluently.');
        return;
    }
    
    if (!consent) {
        alert('Please consent to participate in this study.');
        return;
    }
    
    if (surveyState.texts.length === 0) {
        alert('Error: Survey texts could not be loaded. Please refresh the page.');
        return;
    }
    
    surveyState.participant.name = name;
    surveyState.participant.timestamp = new Date().toISOString();
    surveyState.participant.sessionId = generateSessionId();
    
    generateTrials();
    
    showScreen('surveyScreen');
    displayQuestion(0);
}

function generateTrials() {
    surveyState.trials = [];
    const ruleNames = getRuleNames();
    
    for (let i = 0; i < surveyState.totalQuestions; i++) {
        const textIndex = Math.floor(Math.random() * surveyState.texts.length);
        const baseText = surveyState.texts[textIndex];
        
        let leftRuleIndex = Math.floor(Math.random() * ruleNames.length);
        let rightRuleIndex = Math.floor(Math.random() * ruleNames.length);
        
        while (rightRuleIndex === leftRuleIndex) {
            leftRuleIndex = Math.floor(Math.random() * ruleNames.length);
            rightRuleIndex = Math.floor(Math.random() * ruleNames.length);
        }
        
        const leftRule = ruleNames[leftRuleIndex];
        const rightRule = ruleNames[rightRuleIndex];
        
        const leftText = applyRule(baseText, leftRule);
        const rightText = applyRule(baseText, rightRule);
        
        surveyState.trials.push({
            questionNumber: i + 1,
            baseText: baseText,
            textIndex: textIndex,
            leftText: leftText,
            rightText: rightText,
            leftRule: leftRule,
            rightRule: rightRule,
            selectedText: null,
            confidence: null,
            rationale: ''
        });
    }
}

function displayQuestion(questionIndex) {
    if (questionIndex >= surveyState.totalQuestions) {
        completeSurvey();
        return;
    }
    
    surveyState.currentQuestion = questionIndex;
    const trial = surveyState.trials[questionIndex];
    
    const progress = ((questionIndex + 1) / surveyState.totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Question ${questionIndex + 1} of ${surveyState.totalQuestions}`;
    document.getElementById('currentQuestion').textContent = questionIndex + 1;
    
    document.getElementById('leftText').textContent = trial.leftText;
    document.getElementById('rightText').textContent = trial.rightText;
    
    resetSelections();
    hideRatingSection();
    
    document.getElementById('nextBtn').style.display = 'none';
}

function selectText(side) {
    const trial = surveyState.trials[surveyState.currentQuestion];
    
    surveyState.selectedText = side;
    trial.selectedText = side;
    
    document.getElementById('leftBox').classList.remove('selected');
    document.getElementById('rightBox').classList.remove('selected');
    document.getElementById('selectLeft').classList.remove('selected');
    document.getElementById('selectRight').classList.remove('selected');
    
    if (side === 'left') {
        document.getElementById('leftBox').classList.add('selected');
        document.getElementById('selectLeft').classList.add('selected');
    } else {
        document.getElementById('rightBox').classList.add('selected');
        document.getElementById('selectRight').classList.add('selected');
    }
    
    showRatingSection();
    resetConfidenceSelection();
}

function selectConfidence(value) {
    surveyState.selectedConfidence = parseInt(value);
    const trial = surveyState.trials[surveyState.currentQuestion];
    trial.confidence = parseInt(value);
    
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.scale-btn[data-value="${value}"]`).classList.add('selected');
    
    enableNextButton();
}

function enableNextButton() {
    const trial = surveyState.trials[surveyState.currentQuestion];
    if (trial.selectedText && trial.confidence) {
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('nextBtn').style.display = 'block';
    }
}

function showRatingSection() {
    document.getElementById('ratingSection').classList.remove('hidden');
}

function hideRatingSection() {
    document.getElementById('ratingSection').classList.add('hidden');
}

function resetSelections() {
    surveyState.selectedText = null;
    surveyState.selectedConfidence = null;
    document.getElementById('leftBox').classList.remove('selected');
    document.getElementById('rightBox').classList.remove('selected');
    document.getElementById('selectLeft').classList.remove('selected');
    document.getElementById('selectRight').classList.remove('selected');
}

function resetConfidenceSelection() {
    surveyState.selectedConfidence = null;
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('nextBtn').disabled = true;
}

function nextQuestion() {
    const trial = surveyState.trials[surveyState.currentQuestion];
    const rationale = document.getElementById('rationale').value.trim();
    trial.rationale = rationale;
    
    displayQuestion(surveyState.currentQuestion + 1);
    
    document.getElementById('rationale').value = '';
}

function completeSurvey() {
    saveResponses();
    showScreen('completionScreen');
}

function saveResponses() {
    const data = {
        participant: surveyState.participant,
        trials: surveyState.trials
    };
    
    // Replace with your Discord webhook URL
    const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE';
    
    // Format message for Discord
    const discordMessage = {
        content: `**New Survey Response**`,
        embeds: [{
            title: `Survey Response from ${surveyState.participant.name}`,
            fields: [
                {
                    name: 'Participant',
                    value: surveyState.participant.name,
                    inline: true
                },
                {
                    name: 'Session ID',
                    value: surveyState.participant.sessionId,
                    inline: true
                },
                {
                    name: 'Timestamp',
                    value: surveyState.participant.timestamp,
                    inline: false
                },
                {
                    name: 'Responses',
                    value: JSON.stringify(surveyState.trials, null, 2),
                    inline: false
                }
            ],
            color: 3447003
        }]
    };
    
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(discordMessage)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save responses');
        }
        console.log('Responses saved to Discord successfully');
        saveToLocalStorage(data);
    })
    .catch(error => {
        console.error('Error saving responses to Discord:', error);
        console.log('Saving to localStorage as fallback...');
        saveToLocalStorage(data);
    });
}

function saveToLocalStorage(data) {
    try {
        const existingResponses = JSON.parse(localStorage.getItem('surveyResponses')) || [];
        existingResponses.push(data);
        localStorage.setItem('surveyResponses', JSON.stringify(existingResponses));
        console.log('Responses backed up to localStorage');
        console.log('Response data (can be copied for manual backup):', data);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function restartSurvey() {
    surveyState.currentQuestion = 0;
    surveyState.responses = [];
    surveyState.trials = [];
    surveyState.selectedText = null;
    surveyState.selectedConfidence = null;
    
    document.getElementById('participantName').value = '';
    document.getElementById('englishAbility').checked = false;
    document.getElementById('consentCheckbox').checked = false;
    document.getElementById('rationale').value = '';
    
    showScreen('consentScreen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showScreen('errorScreen');
}

function downloadResponses() {
    const data = {
        participant: surveyState.participant,
        trials: surveyState.trials
    };
    
    const formattedText = formatResponseText(data);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(formattedText));
    element.setAttribute('download', `survey_responses_${surveyState.participant.sessionId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function formatResponseText(data) {
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
        const unchosenRule = isLeftSelected ? trial.rightRule : trial.leftRule;
        
        output += `TRIAL ${trial.questionNumber}:\n`;
        output += `---\n`;
        output += `Chosen Rule: ${chosenRule}\n`;
        output += `Unchosen Rule: ${unchosenRule}\n`;
        output += `Confidence: ${trial.confidence}/10\n`;
        if (trial.rationale) {
            output += `Qualitative Response: ${trial.rationale}\n`;
        }
        output += '\n';
    });
    
    return output;
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

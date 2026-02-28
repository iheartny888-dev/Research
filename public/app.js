

const firebaseConfig = {
  apiKey: "AIzaSyBjm3e-fT8NpbE56wilnp-n4DJxnVvlWRc",
  authDomain: "research-307c4.firebaseapp.com",
  databaseURL: "https://research-307c4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "research-307c4",
  storageBucket: "research-307c4.firebasestorage.app",
  messagingSenderId: "1082731975081",
  appId: "1:1082731975081:web:96ad33d8b7964e0bb8b4b8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
function saveToFirebase(data) {
    const newRef = push(ref(db, 'surveyResponses'));
    set(newRef, data)
        .then(() => console.log('Response saved to Firebase'))
        .catch(e => console.error('Firebase save error:', e));
}

const surveyState = {
    participant: {
        name: '',
        timestamp: '',
        sessionId: ''
    },
    currentQuestion: 0,
    totalQuestions: 10,
    responses: [],
    texts: [],
    trials: [],
    selectedText: null,
    selectedConfidence: null,
    rulesApplied: null
};

document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    loadTexts();
    restoreSavedResponses();
});

function initializeEventListeners() {
    document.getElementById('startSurveyBtn').addEventListener('click', validateAndStartSurvey);
    document.getElementById('selectLeft').addEventListener('click', () => selectText('left'));
    document.getElementById('selectRight').addEventListener('click', () => selectText('right'));
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            selectConfidence(this.dataset.value);
        });
    });
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('restartBtn').addEventListener('click', restartSurvey);
    document.getElementById('errorRetryBtn').addEventListener('click', retryLoad);
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

        let leftRuleIndex, rightRuleIndex, leftText, rightText;

        do {
            leftRuleIndex = Math.floor(Math.random() * ruleNames.length);
            rightRuleIndex = Math.floor(Math.random() * ruleNames.length);

            while (rightRuleIndex === leftRuleIndex) {
                rightRuleIndex = Math.floor(Math.random() * ruleNames.length);
            }

            leftText = applyRule(baseText, ruleNames[leftRuleIndex]);
            rightText = applyRule(baseText, ruleNames[rightRuleIndex]);

        } while (leftText === rightText);

        surveyState.trials.push({
            questionNumber: i + 1,
            baseText: baseText,
            textIndex: textIndex,
            leftText: leftText,
            rightText: rightText,
            leftRule: ruleNames[leftRuleIndex],
            rightRule: ruleNames[rightRuleIndex],
            selectedText: null,
            confidence: null,
            rationale: ''
        });
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function computeDiffHighlight(a, b) {
    if (a === b) {
        return { left: escapeHtml(a), right: escapeHtml(b) };
    }

    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const matchedA = new Array(m).fill(false);
    const matchedB = new Array(n).fill(false);
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) {
            matchedA[i - 1] = true;
            matchedB[j - 1] = true;
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    function escChar(ch) {
        if (ch === ' ') return '&nbsp;';
        return escapeHtml(ch);
    }

    let leftHtml = '';
    for (let k = 0; k < m; k++) {
        const ch = a[k];
        if (matchedA[k]) leftHtml += escChar(ch);
        else leftHtml += '<span style="background-color:lightblue">' + escChar(ch) + '</span>';
    }

    let rightHtml = '';
    for (let k = 0; k < n; k++) {
        const ch = b[k];
        if (matchedB[k]) rightHtml += escChar(ch);
        else rightHtml += '<span style="background-color:lightblue">' + escChar(ch) + '</span>';
    }

    return { left: leftHtml, right: rightHtml };
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

    const highlighted = computeDiffHighlight(trial.leftText, trial.rightText);
    document.getElementById('leftText').innerHTML = highlighted.left;
    document.getElementById('rightText').innerHTML = highlighted.right;

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
    function buildDiscordMessage(participant, trials) {
        function clean(s) {
            if (s === null || s === undefined) return 'N/A';
            return String(s).replace(/\r?\n/g, ' ').trim();
        }

        let msg = `Survey response from ${clean(participant.name)} (session ${clean(participant.sessionId)})\n`;
        msg += `Survey ${clean(participant.sessionId)}\nParticipant: ${clean(participant.name)}\nTrials: ${trials.length}\n\n`;
        trials.forEach(t => {
            msg += `Q${t.questionNumber}: Chosen: ${clean(t.chosenRule)} | Unchosen: ${clean(t.unchosenRule)} | Confidence: ${clean(t.confidence)} | Rationale: ${clean(t.rationale)}\n`;
        });
        return msg;
    }

    const mappedTrials = surveyState.trials.map(trial => {
        const chosenRule = trial.selectedText === 'left' ? trial.leftRule : (trial.selectedText === 'right' ? trial.rightRule : null);
        const unchosenRule = trial.selectedText === 'left' ? trial.rightRule : (trial.selectedText === 'right' ? trial.leftRule : (trial.leftRule && trial.rightRule ? `${trial.leftRule} / ${trial.rightRule}` : null));

        return {
            questionNumber: trial.questionNumber,
            baseText: trial.baseText,
            textIndex: trial.textIndex,
            leftRule: trial.leftRule,
            rightRule: trial.rightRule,
            chosenRule: chosenRule,
            unchosenRule: unchosenRule,
            selectedText: trial.selectedText,
            confidence: trial.confidence || null,
            rationale: trial.rationale || ''
        };
    });

    const data = {
        participant: {
            name: surveyState.participant.name,
            timestamp: surveyState.participant.timestamp,
            sessionId: surveyState.participant.sessionId
        },
        trials: mappedTrials
    };
    data.discordMessage = buildDiscordMessage(data.participant, data.trials);
    data.content = data.discordMessage;
    fetch("https://research-pw7y.onrender.com/save-responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Server returned " + res.status);
            }
            console.log("Responses sent to server successfully");
            saveToLocalStorage(data);
        })
        .catch(err => {
            console.error("Failed to send responses to server:", err);
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



function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}



// Restore all old responses from localStorage to Firebase
function restoreSavedResponses() {
    const existingResponses = JSON.parse(localStorage.getItem('surveyResponses')) || [];
    existingResponses.forEach(data => saveToFirebase(data));
    console.log(`Restored ${existingResponses.length} responses to Firebase`);
}

document.addEventListener('DOMContentLoaded', () => {
    restoreSavedResponses();
});
# Phonological Naturalness Survey Platform

## Overview

This is a customized survey platform for the research paper: **"Sounding it Out: Evaluating the Impact of Phonological Changes on Perceived Linguistic Naturalness"**

The platform presents participants with 25 screens, each showing a pair of text samples. One text is unmodified, and the other has a phonological rule applied randomly. Participants must judge which text seems more "phonologically natural" and provide a confidence rating.

---

## Project Structure

```
/workspaces/Research/
├── public/
│   ├── index.html          # Main survey interface
│   ├── styles.css          # Survey styling
│   ├── app.js              # Main survey logic
│   ├── rules.js            # Phonological rules definitions
│   └── texts.txt           # Survey input texts (EDITABLE)
├── data/
│   ├── texts.txt           # Copy of input texts
│   └── responses.txt        # Output file with collected responses
├── server.js               # Node.js backend server
├── package.json            # Dependencies configuration
└── README.md               # This file
```

---

## Setup Instructions

### Option 1: Using Live Server (Live Server Extension)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Live Server**
   - Right-click on `public/index.html`
   - Select "Open with Live Server"
   - The survey will open in your browser

3. **Note about Data Saving**
   - With Live Server alone, responses won't automatically save to a file
   - Use Option 2 (Node.js Server) for data persistence

### Option 2: Using Node.js Server (Recommended)

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

3. **Access the Survey**
   - Open your browser and go to `http://localhost:3000`
   - The survey will run and save responses to `data/responses.txt`

---

## Editing Survey Content

### Adding or Modifying Texts

Edit `/public/texts.txt` (and `/data/texts.txt` for backup):
- Each line should contain ONE text sample
- Texts can be any language
- Leave blank lines out (they're automatically filtered)

Example:
```
The quick brown fox jumps over the lazy dog.
Beautiful mornings bring fresh perspectives to the world.
Children learn languages naturally through constant exposure.
```

### Editing Phonological Rules

Edit `/public/rules.js`:

Each rule object contains:
- `name`: Display name of the rule
- `description`: Rule description from the paper
- `apply`: JavaScript function that applies the transformation

Example rule:
```javascript
lenition: {
    name: "Lenition",
    description: "p → f, b → w, t → th, d → z, k → kh, g → gh / VCV, VC#",
    apply: function(text) {
        let result = text;
        // p → f in VCV context
        result = result.replace(/([aeiou])p([aeiou])/gi, '$1f$2');
        // ... more transformations
        return result;
    }
}
```

**Available rules:**
- `lenition`: Consonant softening
- `fortition`: Consonant strengthening
- `epenthesis`: Vowel insertion
- `syncope`: Vowel deletion
- `codaDeletion`: Consonant deletion at word end
- `nasalAssimilation`: Nasal assimilation
- `consonantGemination`: Consonant doubling
- `vowelGemination`: Vowel doubling

---

## Survey Flow

### 1. Consent Screen
Participants must:
- Enter their name
- Confirm English fluency
- Consent to participation
- Understand responses are anonymous and used for research

### 2. Survey Questions (25 Screens)
Each screen shows:
- Two text samples side-by-side
- One original text, one with a phonological rule applied
- Rule specification is **hidden** from the participant

Participants must:
1. Select which text is more "phonologically natural"
2. Rate confidence on a 1-10 Likert scale
3. Provide optional explanation for their choice

### 3. Completion Screen
- Confirmation that responses were saved
- Thank you message

---

## Phonological Rules Applied

The survey randomly applies these 8 phonological rules:

| Rule | Definition |
|------|-----------|
| **Lenition** | p → f, b → w, t → th, d → z, k → kh, g → gh / VCV, VC# |
| **Fortition** | f → p, v → p, b → p, w → b, d → t, th → t, j → ch / #C |
| **Epenthesis** | CC → CeC / Change in place of articulation |
| **Syncope** | V → Ø / #CVC |
| **Coda Deletion** | C → Ø / C# |
| **Nasal Assimilation** | n → m / np, nb, nf, nv; m → n / mt, md; m,n → ng / mg, mk, nk; t → d / tn |
| **Consonant Gemination** | C1C2 → C1C1 / VC1C2V |
| **Vowel Gemination** | V1V2 → V1V1 / CV1V2C, #V |

**Important constraints:**
- Each screen shows 25 different trials (1 per screen)
- Rules are applied **randomly** to left or right text
- The **same rule cannot appear on both left and right** for a single trial
- Rules are **not disclosed** to the participant

---

## Data Collection and Analysis

### Response Format

When using the Node.js server, responses are saved to `data/responses.txt` in the following format:

```
================================================================================
PARTICIPANT: John Doe
SESSION ID: session_1234567890_abc123def
TIMESTAMP: 2024-02-09T12:34:56.789Z
================================================================================

TRIAL 1:
---
Base Text: The quick brown fox jumps over the lazy dog.
Left Text: The quic brown fox jmps over the lzy dog.
Right Text: The quick brown fox jumps over the lazy dog.
Applied Rule: syncope
Rule Position: LEFT
Selected: RIGHT
Confidence: 8/10
Rationale: The right text seems more natural and flows better.

TRIAL 2:
...more trials...
```

### Data for Analysis

Each response includes:
- **Participant name** and **session ID**
- **Base text** used
- **Left and right text variants**
- **Applied rule** and its position
- **Participant selection** (which text was chosen)
- **Confidence rating** (1-10)
- **Rationale** (qualitative data)

This data can be analyzed using:
- Mixed-effects logistic regression (for binary choices)
- Mixed-effects ordinal regression (for Likert ratings)
- Qualitative analysis of rationales

---

## Important Features

✓ **Randomized Trial Order**: Each session generates random trials
✓ **Rule Constraint**: Same rule never on both left and right
✓ **Consent/Demographics**: Mandatory consent and participant info
✓ **25 Trials**: Exactly 25 questions per participant
✓ **Confidence Ratings**: 1-10 Likert scale for each choice
✓ **Open-ended Responses**: Optional qualitative data
✓ **Data Persistence**: Responses saved with timestamp and session ID
✓ **Rule Transparency**: Rules are hidden from participants
✓ **Language Agnostic**: Works with any language texts

---

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Requires JavaScript enabled.

---

## Troubleshooting

### "Failed to load texts.txt"
- Ensure `texts.txt` exists in the `public/` folder
- Check that texts are separated by line breaks
- Ensure at least one text is in the file

### Responses not saving
- Make sure you're using the Node.js server (Option 2)
- Check that the `/save-responses` endpoint is reachable
- Verify that the `data/` directory exists and is writable

### Rules not applying correctly
- Check the rule definitions in `rules.js`
- Ensure regex patterns are valid
- Test rule application in browser console

---

## Advanced Configuration

### Changing Number of Trials

In `app.js`, change:
```javascript
totalQuestions: 25  // Change this number
```

### Adjusting Likert Scale Range

In `index.html`, modify the scale buttons (currently 1-10):
```html
<button class="scale-btn" data-value="1">1</button>
<!-- ... change data-value and button text ... -->
<button class="scale-btn" data-value="10">10</button>
```

### Custom Server Configuration

Edit `server.js` to change:
- Port number (currently 3000)
- Response file location
- Response format

---

## Notes

- The survey is designed to minimize bias by not revealing which rule was applied
- Texts should be in written form, not IPA notation
- Responses include metadata (timestamp, session ID) for tracking
- The Node.js server maintains a running `responses.txt` file
- All participant data is anonymized at response time

---

## License

This survey platform is provided for research purposes.

---

## Support

For issues or questions about the platform, check:
1. This README file
2. Comments in the source code
3. Console logs in the browser (press F12)
4. Server logs in the terminal

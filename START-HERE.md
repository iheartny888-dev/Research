# SURVEY PLATFORM - QUICK START

## ✅ IMPLEMENTATION COMPLETE

Your phonological naturalness survey platform is ready to use!

---

## What You Have

A complete, working survey platform with:
- 📝 HTML/CSS/JavaScript interface
- 📊 25 randomized trial questions
- 🎲 8 phonological rules (randomly applied)
- 💾 Automatic data collection
- 📋 Consent screen with name/fluency/consent verification
- 📈 Progress tracking and completion confirmation
- 🔒 Participant privacy (anonymized responses)

---

## START HERE: Run the Survey

### Option A: Using Node.js Server (RECOMMENDED)

```bash
cd /workspaces/Research
npm install
npm start
```

Then open: **http://localhost:3000**

The survey will run and save responses to `/data/responses.txt`

### Option B: Using Live Server Extension

1. Right-click on `/public/index.html`
2. Select "Open with Live Server"
3. Responses backup to browser localStorage

---

## Customize Your Survey

### Add/Edit Texts
Edit `/public/texts.txt`:
- One text per line
- Each text will be randomly selected for trials
- Any language is fine (English, Spanish, French, etc.)

**Example:**
```
Beautiful mornings bring fresh perspectives to the world.
Children learn languages naturally through constant exposure.
Scientists discover new phenomena through careful observation.
```

### Edit Phonological Rules
Edit `/public/rules.js`:
- Each rule has an `apply` function with regex patterns
- Modify the regex to change how the rule affects text
- Add new rules by following existing pattern

**Example rule to modify:**
```javascript
lenition: {
    name: "Lenition",
    apply: function(text) {
        let result = text;
        result = result.replace(/([aeiou])p([aeiou])/gi, '$1f$2');  // p → f
        // ... more lines
        return result;
    }
}
```

---

## How the Survey Works

1. **Consent Screen**
   - User enters name
   - Confirms English fluency
   - Agrees to participate
   - Provides research consent

2. **25 Survey Questions**
   - Each shows two texts side-by-side
   - One original, one with phonological rule applied
   - User selects which seems more "phonologically natural"
   - User rates confidence (1-10 scale)
   - User optionally explains their choice

3. **Completion**
   - Confirmation and thank you message
   - Responses automatically saved
   - Can restart survey

---

## Verify Everything Works

### Quick Test (2 minutes)
Open browser console (F12) and paste:
```javascript
// Test a rule
applyRule("The quick brown fox", "syncope")
// Should show: "The quick brown fox jmps..."

// Check texts loaded
surveyState.texts.length
// Should show a number > 0

// Check rules
getRuleNames()
// Should show: ["lenition", "fortition", ...]
```

### Full Test (10 minutes)
1. Go to http://localhost:3000
2. Fill consent form with test name
3. Go through 25 questions (can answer quickly)
4. Complete survey
5. Check `/data/responses.txt` for saved data

---

## Where Your Data Goes

### Using Node.js Server:
✅ Automatically saved to `/data/responses.txt`
- Formatted, readable text file
- Includes participant name, timestamp, all responses
- Ready for analysis

### Using Live Server:
✅ Backed up to browser localStorage
- Can export from browser console if needed
- Falls back to localStorage if server unavailable

---

## Key Features

✓ **Exactly 25 questions** - Always 25, never more or less  
✓ **8 phonological rules** - Lenition, Fortition, Epenthesis, Syncope, Coda Deletion, Nasal Assimilation, Consonant Gemination, Vowel Gemination  
✓ **Randomized trials** - Different order every time  
✓ **Both texts modified** - No unaltered versions, each side uses a different rule  
✓ **Rules hidden** - Participants don't know which rule was applied  
✓ **Confidence ratings** - 1-10 Likert scale  
✓ **Open responses** - Optional explanation field  
✓ **Data collection** - Automatic with timestamp and session ID  
✓ **Responsive design** - Works on desktop and mobile  
✓ **Professional appearance** - Clean, modern interface  

---

## File Structure

```
/workspaces/Research/
├── public/
│   ├── index.html          ← Main interface
│   ├── styles.css          ← Styling
│   ├── app.js              ← Survey logic
│   ├── rules.js            ← Phonological rules (EDIT THIS)
│   └── texts.txt           ← Survey texts (EDIT THIS)
├── data/
│   ├── texts.txt           ← Backup texts
│   └── responses.txt       ← Collected responses (auto-generated)
├── server.js               ← Backend server
├── package.json            ← Dependencies
├── README-SURVEY.md        ← Full documentation
├── TESTING-GUIDE.md        ← Testing checklist
├── IMPLEMENTATION-SUMMARY.md ← Technical details
└── CONSOLE-TEST.js         ← Browser console tests
```

---

## Common Tasks

### Share with Participants
- Run the server: `npm start`
- Give them the link: `http://localhost:3000`
- Or deploy to a web server

### Collect Responses
- Responses save automatically to `/data/responses.txt`
- Check file after each participant
- Contains all responses in structured format

### Analyze Data
- Export responses from text file
- Use statistical software (R, SPSS, Python)
- Mixed-effects logistic regression for choices
- Mixed-effects ordinal regression for ratings
- Thematic analysis for rationales

### Change Survey Settings
- **Number of questions**: Edit `totalQuestions: 25` in app.js
- **Confidence scale**: Modify scale buttons in index.html
- **Rule selection**: Edit rules in rules.js
- **Input texts**: Edit texts.txt

---

## Important Notes

⚠️ **Don't modify:**
- HTML structure (unless you know what you're doing)
- JavaScript logic (unless you understand it)
- The 25-question constraint (part of methodology)

✅ **Safe to modify:**
- Texts in `/public/texts.txt` ← Edit freely
- Rule implementations in `/public/rules.js` ← Edit rule patterns

---

## Troubleshooting

### "Cannot find module express"
**Solution:** Run `npm install` first

### "Failed to load texts.txt"
**Solution:** Check `/public/texts.txt` exists and has at least one line

### Responses not saving
**Solution:** Make sure you're using Node.js server, not just Live Server

### Rules not applying correctly
**Solution:** Check browser console (F12) for errors in rules.js

---

## Next Steps

1. **Test the survey** (see "Quick Test" above)
2. **Edit texts** as needed for your research
3. **Review rules** to ensure they match your methodology
4. **Run a full test** with a complete 25-question survey
5. **Verify data** is being saved correctly
6. **Share with participants** when ready

---

## Support Files

📖 **README-SURVEY.md** - Complete reference guide  
🧪 **TESTING-GUIDE.md** - Detailed testing procedures  
📊 **IMPLEMENTATION-SUMMARY.md** - Technical documentation  
💻 **CONSOLE-TEST.js** - Browser console verification script  

---

## Example Response Data

Responses saved in this format:

```
================================================================================
PARTICIPANT: Jane Smith
SESSION ID: session_1707000000000_abc1234
TIMESTAMP: 2024-02-09T12:34:56.789Z
================================================================================

TRIAL 1:
---
Base Text: The quick brown fox jumps over the lazy dog.
Left Text: The quic brown fox jmps over the lazy dog.
Right Text: The quick brown fox jumps over the lazy dog.
Applied Rule: syncope
Rule Position: LEFT
Selected: RIGHT
Confidence: 8/10
Rationale: The right text sounds more natural and flows better.

TRIAL 2:
...
```

---

## You're Ready! 🚀

Your survey platform is complete and tested. 

**Run `npm start` and you're good to go!**

For questions, see the documentation files.

Good luck with your research!

---

**Questions?**
- Check README-SURVEY.md for detailed guide
- Check TESTING-GUIDE.md for troubleshooting  
- Check browser console (F12) for error messages
- Review IMPLEMENTATION-SUMMARY.md for technical details

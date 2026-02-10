# Quick Start Guide for Phonological Survey

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd /workspaces/Research
npm install
```

### 2. Start the Server
```bash
npm start
```

Or to start with Node directly:
```bash
node server.js
```

You should see: `Survey server running at http://localhost:3000`

### 3. Access the Survey
Open your browser and go to:
```
http://localhost:3000
```

---

## Testing Checklist

### ✓ Phase 1: Consent Screen
- [ ] Name input field appears and accepts text
- [ ] English fluency checkbox displays and is clickable
- [ ] Consent checkbox displays and is clickable
- [ ] "Start Survey" button is present
- [ ] Clicking Start without filling form shows alerts
- [ ] Clicking Start with all fields filled progresses to survey

### ✓ Phase 2: Survey Question Screen
- [ ] Progress bar shows "Question 1 of 25"
- [ ] Two text samples display side-by-side
- [ ] Text samples are different (one has rule applied)
- [ ] Left and Right selection buttons are present
- [ ] Clicking a button selects it (visual feedback)
- [ ] Rating section appears after selection
- [ ] Confidence scale (1-10) appears
- [ ] Optional rationale text field appears
- [ ] "Next" button is disabled until confidence is selected
- [ ] Rationale can be left blank (it's optional)

### ✓ Phase 3: Multiple Trials (Questions 2-25)
- [ ] Progress bar updates correctly (2/25, 3/25, etc.)
- [ ] Question number updates (1, 2, 3, etc.)
- [ ] Different texts appear on each screen
- [ ] Rules appear to be applied randomly
- [ ] Selections reset between questions
- [ ] Rating scale resets between questions
- [ ] Rationale field clears between questions

### ✓ Phase 4: Completion Screen
- [ ] After question 25, completion screen appears
- [ ] Completion message displays
- [ ] "Start Over" button appears
- [ ] Clicking "Start Over" returns to consent screen

### ✓ Phase 5: Data Persistence
**Using Node.js Server:**
- [ ] Complete a quick test survey (can skip to completion)
- [ ] Check `/workspaces/Research/data/responses.txt`
- [ ] Responses should be formatted with participant name, timestamp, etc.
- [ ] Each trial should show base text, modified text, rule applied, selection, and confidence

**Using Live Server (localStorage backup):**
- [ ] Open browser console (F12)
- [ ] Complete survey
- [ ] Check console logs for "Responses backed up to localStorage"
- [ ] Can manually export from localStorage if needed

---

## Testing Different Scenarios

### Test 1: Quick Survey (10 minutes)
1. Fill consent screen with test name
2. Go through all 25 questions quickly
3. Verify data is saved

### Test 2: Rule Application Verification (5 minutes)
1. Go to consent screen
2. Open browser console (F12 or Ctrl+Shift+I)
3. Look at the console output during survey
4. Verify that rules are being applied (text should be different)

### Test 3: Randomization Check (5 minutes)
1. Go back to consent screen and restart
2. Verify that:
   - Text pairs are different from first run
   - Rule positions vary (sometimes on left, sometimes on right)
   - No apparent pattern

### Test 4: Edge Cases (5 minutes)
- [ ] Very long rationales can be entered
- [ ] Special characters in text don't break the app
- [ ] Rapid clicking doesn't cause issues
- [ ] Browser refresh during survey (data lost, as expected)
- [ ] Mobile responsiveness (if testing on mobile)

---

## Troubleshooting

### Issue: "Failed to load texts.txt"
**Solution:**
- Verify `/workspaces/Research/public/texts.txt` exists
- Ensure it has at least one line of text
- Check that lines aren't empty

### Issue: Responses not saving
**Solution - Using Node.js Server:**
```bash
# Check that server is running
# Should see "Survey server running at http://localhost:3000"

# Check that data directory exists
ls -la /workspaces/Research/data/

# Check responses file
cat /workspaces/Research/data/responses.txt
```

**Solution - Using Live Server:**
- Responses will be in localStorage
- Check browser console for logs
- Export from localStorage if needed

### Issue: Rules not applying
**Solution:**
- Open browser console (F12)
- Look for any error messages
- Verify rules.js loaded correctly
- Check if rules are valid JavaScript

### Issue: Text not appearing
**Solution:**
- Ensure texts.txt has proper line breaks
- No blank lines between texts (they're filtered out)
- Text length shouldn't matter

---

## Advanced Testing: Console Commands

When survey is loaded, try these in browser console:

```javascript
// Check loaded texts
surveyState.texts

// Check current trial
surveyState.trials[surveyState.currentQuestion]

// Check all rules
getAllRules()

// Test a rule
applyRule("The quick brown fox", "lenition")

// Check session info
surveyState.participant
```

---

## Performance Notes

- Survey should load instantly
- Each rule application takes milliseconds
- No server lag should be noticeable
- File I/O happens only at completion

---

## Example Test Data

If you want to quickly test with known data:

**Sample texts.txt:**
```
The quick brown fox jumps over the lazy dog.
Beautiful mornings bring fresh perspectives to the world.
Children learn languages naturally through constant exposure.
```

**Sample consent data:**
- Name: Test User
- English fluency: Checked
- Consent: Checked

---

## Ready to Deploy?

When ready for actual research participants:

1. **Review all texts** in `/public/texts.txt`
2. **Review all rules** in `/public/rules.js`
3. **Test one full survey** from consent to completion
4. **Verify data collection** (responses saved correctly)
5. **Check file permissions** (data directory writable)
6. **Set up backup** (optional: backup responses.txt regularly)
7. **Share link:** `http://localhost:3000` with participants
   - Or: Deploy to web server for public access
   - Or: Use Live Server extension for local testing

---

Good luck with your research! 🎓

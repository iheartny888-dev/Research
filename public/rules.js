/**
 * PHONOLOGICAL RULES CONFIGURATION
 * Edit this file to modify the phonological transformation rules
 * Each rule defines how text should be transformed based on linguistic patterns
 */

const PHONOLOGICAL_RULES = {
    lenition: {
        name: "Lenition",
        description: "p → f, b → w, t → th, d → z, k → kh, g → gh / VCV, VC#",
        apply: function(text) {
            // Apply lenition: softening of consonants in certain contexts
            // Approximation using orthographic substitutions
            let result = text;
            
            // VCV context: vowel-consonant-vowel
            // Match patterns like 'apa', 'ibe', 'otu', etc.
            result = result.replace(/([aeiou])p([aeiou])/gi, '$1f$2');  // p → f
            result = result.replace(/([aeiou])b([aeiou])/gi, '$1w$2');  // b → w
            result = result.replace(/([aeiou])t([aeiou])/gi, '$1th$2'); // t → th
            result = result.replace(/([aeiou])d([aeiou])/gi, '$1z$2');  // d → z
            result = result.replace(/([aeiou])k([aeiou])/gi, '$1kh$2'); // k → kh
            result = result.replace(/([aeiou])g([aeiou])/gi, '$1gh$2'); // g → gh
            
            // VC# context: vowel-consonant-word end
            result = result.replace(/([aeiou])p(\s|$)/gi, '$1f$2');
            result = result.replace(/([aeiou])b(\s|$)/gi, '$1w$2');
            result = result.replace(/([aeiou])t(\s|$)/gi, '$1th$2');
            result = result.replace(/([aeiou])d(\s|$)/gi, '$1z$2');
            result = result.replace(/([aeiou])k(\s|$)/gi, '$1kh$2');
            result = result.replace(/([aeiou])g(\s|$)/gi, '$1gh$2');
            
            return result;
        }
    },

    fortition: {
        name: "Fortition",
        description: "f → p, v → p, b → p, w → b, d → t, th → t, j → ch / #C",
        apply: function(text) {
            // Apply fortition: strengthening of consonants at beginning
            let result = text;
            
            // #C context: word initial before another consonant
            // Match word beginnings followed by consonants
            result = result.replace(/\b([fv])([b-df-hj-np-tv-z])/gi, 'p$2');  // f,v → p
            result = result.replace(/\b(b)([b-df-hj-np-tv-z])/gi, 'p$2');     // b → p
            result = result.replace(/\b(w)([b-df-hj-np-tv-z])/gi, 'b$2');     // w → b
            result = result.replace(/\b(d)([b-df-hj-np-tv-z])/gi, 't$2');     // d → t
            result = result.replace(/\b(th)([b-df-hj-np-tv-z])/gi, 't$2');    // th → t
            result = result.replace(/\b(j)([b-df-hj-np-tv-z])/gi, 'ch$2');    // j → ch
            
            return result;
        }
    },

    epenthesis: {
        name: "Epenthesis",
        description: "CC → CeC / Change in place of articulation",
        apply: function(text) {
            // Apply epenthesis: insertion of vowel between consonants with different articulation places
            let result = text;
            
            // Insert 'e' between consonants that differ in place of articulation
            // This is a simplified version - insert vowel between certain consonant clusters
            
            // Common consonant clusters that would undergo epenthesis
            // Pairs with different places of articulation
            const clusters = [
                { pattern: /([bfpv])([tdn])/g, replacement: '$1e$2' },  // labial + alveolar
                { pattern: /([tdn])([bfpv])/g, replacement: '$1e$2' },  // alveolar + labial
                { pattern: /([kg])([bfpvtdn])/g, replacement: '$1e$2' }, // velar + others
                { pattern: /([bfpv])([kg])/g, replacement: '$1e$2' },   // labial + velar
                { pattern: /([sz])([bfpvkg])/g, replacement: '$1e$2' },  // fricative + stops
                { pattern: /([bfpvkg])([sz])/g, replacement: '$1e$2' }   // stops + fricative
            ];
            
            clusters.forEach(obj => {
                result = result.replace(obj.pattern, obj.replacement);
            });
            
            return result;
        }
    },

    syncope: {
        name: "Syncope",
        description: "V → Ø / #CVC (deletion of unstressed vowel between consonants at word beginning)",
        apply: function(text) {
            // Apply syncope: deletion of vowels in medial position
            let result = text;
            
            // Delete vowels in CVC sequences at word beginning
            // Word boundary followed by consonant-vowel-consonant
            result = result.replace(/\b([b-df-hj-np-tv-z])([aeiou])([b-df-hj-np-tv-z])/gi, '$1$3');
            
            return result;
        }
    },

    codaDeletion: {
        name: "Coda Deletion",
        description: "C → Ø / C# (deletion of consonants in syllable coda before word boundary)",
        apply: function(text) {
            // Apply coda deletion: remove consonants at word end
            let result = text;
            
            // Delete consonants before word boundary (word final)
            result = result.replace(/([b-df-hj-np-tv-z])(\s|$)/g, '$2');
            
            return result;
        }
    },

    nasalAssimilation: {
        name: "Nasal Assimilation",
        description: "n → m / np, nb, nf, nv; m → n / mt, md; m,n → ng / mg, mk, nk; t → d / tn",
        apply: function(text) {
            // Apply nasal assimilation
            let result = text;
            
            // n → m before p, b, f, v
            result = result.replace(/n([pbfv])/gi, 'm$1');
            
            // m → n before t, d
            result = result.replace(/m([td])/gi, 'n$1');
            
            // m, n → ng before g, k
            result = result.replace(/m([gk])/gi, 'ng$1');
            result = result.replace(/n([gk])/gi, 'ng$1');
            
            // t → d before n
            result = result.replace(/t(n)/gi, 'd$1');
            
            return result;
        }
    },

    consonantGemination: {
        name: "Consonant Gemination",
        description: "C1C2 → C1C1 / VC1C2V (consonant doubling between vowels)",
        apply: function(text) {
            // Apply consonant gemination
            // Double the first consonant in consonant clusters between vowels
            let result = text;
            
            // Match vowel-consonant-consonant-vowel and double the first consonant
            result = result.replace(/([aeiou])([b-df-hj-np-tv-z])([b-df-hj-np-tv-z])([aeiou])/gi, function(match, v1, c1, c2, v2) {
                return v1 + c1 + c1 + c2 + v2;
            });
            
            return result;
        }
    },

    vowelGemination: {
        name: "Vowel Gemination",
        description: "V1V2 → V1V1 / CV1V2C, #V (vowel doubling)",
        apply: function(text) {
            // Apply vowel gemination: double vowels
            let result = text;
            
            // Double vowels in sequences
            result = result.replace(/([aeiou])[aeiou]/gi, '$1$1');
            
            return result;
        }
    }
};

/**
 * Get all available rules as an array (for easy iteration)
 */
function getAllRules() {
    return Object.values(PHONOLOGICAL_RULES);
}

/**
 * Get a rule by name
 */
function getRuleByName(name) {
    return PHONOLOGICAL_RULES[name];
}

/**
 * Apply a rule to text by rule name
 */
function applyRule(text, ruleName) {
    const rule = PHONOLOGICAL_RULES[ruleName];
    if (!rule) {
        console.error(`Rule "${ruleName}" not found`);
        return text;
    }
    return rule.apply(text);
}

/**
 * Get list of all rule names
 */
function getRuleNames() {
    return Object.keys(PHONOLOGICAL_RULES);
}

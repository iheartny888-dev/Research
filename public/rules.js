const PHONOLOGICAL_RULES = {
    lenition: {
        name: "Lenition",
        description: "p → f, b → u, t → s, d → z, k → kh, g → gh / VCV, VC#",
        apply: function(text) {
            let result = text;
            
            result = result.replace(/([aeiou])p([aeiou])/gi, '$1f$2');
            result = result.replace(/([aeiou])b([aeiou])/gi, '$1u$2');
            result = result.replace(/([aeiou])t([aeiou])/gi, '$1s$2');
            result = result.replace(/([aeiou])d([aeiou])/gi, '$1z$2');
            result = result.replace(/([aeiou])k([aeiou])/gi, '$1kh$2');
            result = result.replace(/([aeiou])g([aeiou])/gi, '$1gh$2');
            
            result = result.replace(/([aeiou])p(\s|$)/gi, '$1f$2');
            result = result.replace(/([aeiou])b(\s|$)/gi, '$1u$2');
            result = result.replace(/([aeiou])t(\s|$)/gi, '$1s$2');
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
            let result = text;
            result = result.replace(/\b([fv])([b-df-hj-np-tv-z])/gi, 'p$2');
            result = result.replace(/\b(b)([b-df-hj-np-tv-z])/gi, 'p$2');
            result = result.replace(/\b(w)([b-df-hj-np-tv-z])/gi, 'b$2');
            result = result.replace(/\b(d)([b-df-hj-np-tv-z])/gi, 't$2');
            result = result.replace(/\b(th)([b-df-hj-np-tv-z])/gi, 't$2');
            result = result.replace(/\b(j)([b-df-hj-np-tv-z])/gi, 'ch$2');
            
            return result;
        }
    },

    epenthesis: {
        name: "Epenthesis",
        description: "CC → CeC / Change in place of articulation",
        apply: function(text) {
            let result = text;
            const clusters = [
                { pattern: /([bfpv])([tdn])/g, replacement: '$1e$2' },
                { pattern: /([tdn])([bfpv])/g, replacement: '$1e$2' },
                { pattern: /([kg])([bfpvtdn])/g, replacement: '$1e$2' },
                { pattern: /([bfpv])([kg])/g, replacement: '$1e$2' },
                { pattern: /([sz])([bfpvkg])/g, replacement: '$1e$2' },
                { pattern: /([bfpvkg])([sz])/g, replacement: '$1e$2' }
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
            let result = text;
            result = result.replace(/\b([b-df-hj-np-tv-z])([aeiou])([b-df-hj-np-tv-z])/gi, '$1$3');
            
            return result;
        }
    },

    codaDeletion: {
        name: "Coda Deletion",
        description: "C → Ø / C# (deletion of consonants in syllable coda before word boundary)",
        apply: function(text) {
            let result = text;
            result = result.replace(/([b-df-hj-np-tv-z])(\s|$)/g, '$2');
            
            return result;
        }
    },

    nasalAssimilation: {
        name: "Nasal Assimilation",
        description: "n → m / np, nb, nf, nv; m → n / mt, md; m,n → ng / mg, mk, nk; t → d / tn",
        apply: function(text) {
            let result = text;
            result = result.replace(/n([pbfv])/gi, 'm$1');
            result = result.replace(/m([td])/gi, 'n$1');
            result = result.replace(/m([gk])/gi, 'ng$1');
            result = result.replace(/n([gk])/gi, 'ng$1');
            result = result.replace(/t(n)/gi, 'd$1');
            
            return result;
        }
    },

    consonantGemination: {
        name: "Consonant Gemination",
        description: "C1C2 → C1C1 / VC1C2V (consonant doubling between vowels)",
        apply: function(text) {
            let result = text;
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
            let result = text;
            result = result.replace(/([aeiou])[aeiou]/gi, '$1$1');
            
            return result;
        }
    }
};

function getAllRules() {
    return Object.values(PHONOLOGICAL_RULES);
}

function getRuleByName(name) {
    return PHONOLOGICAL_RULES[name];
}

function reduceTripleLetters(text) {
    return text.replace(/(.)(\1{2,})/g, '$1$1');
}

function removeConsonantOnlyWordSpaces(text) {
    return text.replace(/\b([b-df-hj-np-tv-z]+)\s+/g, '$1');
}

function applyRule(text, ruleName) {
    const rule = PHONOLOGICAL_RULES[ruleName];
    if (!rule) {
        console.error(`Rule "${ruleName}" not found`);
        return text;
    }
    let result = rule.apply(text);
    result = reduceTripleLetters(result);
    result = removeConsonantOnlyWordSpaces(result);
    return result;
}

function getRuleNames() {
    return Object.keys(PHONOLOGICAL_RULES);
}

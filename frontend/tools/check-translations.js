/**
 * This script helps tracking which keys are missing from the french translation file.
 * All the other files are just line by line translations of the french one.
 * 
 * TODO: use proper tools instead of regexp hacking.
 */

const path = require('path');
const fs = require('fs');

function listKeys(language) {
    function getKeys(obj, prefix = '') {
        if (typeof obj == 'string')
            return [prefix];

        const result = [];
        for (let key in obj) {
            result.push(...getKeys(obj[key], `${prefix.length ? prefix + '.' : ''}${key}`))
        }
        return result;
    }

    const filepath = path.join(__dirname, `../src/translation/${language}/translations.js`);
    const file = fs.readFileSync(filepath, 'utf-8').trim().replace(/^export default/, '').replace(/;$/, '');
    const content = eval(`(${file})`);

    return getKeys(content);
}

function loadTemplates() {
    function loadTemplatesRec(filepath) {
        if (filepath.endsWith('.html') || filepath.endsWith('.js')) {
            return fs.readFileSync(filepath, 'utf-8')
        }

        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            const files = fs.readdirSync(filepath)
            let templates = '';
            for (let file of files) {
                const subTemplates = loadTemplatesRec(path.join(filepath, file));
                if (subTemplates)
                    templates += subTemplates;
            }
            return templates;
        }
    }

    const filepath = path.join(__dirname, `../src/components`);
    return loadTemplatesRec(filepath)
}

function getTranslationCalls(templates) {
    const regexps = [
        /translate="([\._a-z]+)"/g,
        /\{\{'([\._a-z]+)'\s*\|\s*translate\s*\}\}/g,
        /translate\('([\._a-z]+)'\)/g,
        /translate\("([\._a-z]+)"\)/g
    ]

    const result = {};
    for (let re of regexps) {
        let match;
        while (match = re.exec(templates)) {
            result[match[1]] = true;
        }
    }

    return Object.keys(result);
}

function printUnusedKeys() {
    const keys = listKeys('fr');
    const templates = loadTemplates();

    const ignoredPrefixes = ['project.dimensions', 'project.history', 'project.formula']
    for (let key of keys) {
        if (ignoredPrefixes.some(prefix => key.startsWith(prefix)))
            continue

        if (!templates.includes(key))
            console.log(key)
    }
}

function printMissingKeys() {
    const keys = listKeys('fr');
    const templates = loadTemplates();
    const translationCalls = getTranslationCalls(templates);

    for (let call of translationCalls)
        if (!keys.includes(call))
            console.log(call);
}


console.log('===== Unused keys =====');
printUnusedKeys();


console.log('===== Missing keys =====');
printMissingKeys();
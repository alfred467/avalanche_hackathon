const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.git' || file === '.gemini') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(__dirname);
const textExts = ['.ts', '.js', '.html', '.css', '.md', '.json', '.env', '.example'];

files.forEach(file => {
    if (!textExts.includes(path.extname(file))) return;
    if (file.endsWith('script.js') || file.endsWith('rename.js')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Rename K-ELF to Kelper
    content = content.replace(/K-ELF/g, 'Kelper');
    content = content.replace(/kelf/g, 'kelper');
    content = content.replace(/K-SAFE/g, 'Kelper-SAFE');
    content = content.replace(/K-FOUNDER/g, 'Kelper-FOUNDER');

    // 2. Remove comments
    if (file.endsWith('.js') || file.endsWith('.ts')) {
        // Remove single line and multi-line comments
        content = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    } else if (file.endsWith('.html')) {
        // Remove HTML comments
        content = content.replace(/<!--[\s\S]*?-->/g, '');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
console.log('Renaming and comment removal complete.');

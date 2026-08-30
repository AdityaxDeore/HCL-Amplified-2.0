const fs = require('fs');
const file = 'src/components/ui/ai-prompt-box.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace \$ with $
data = data.replace(/\\\$/g, '$');
// Replace \` with `
data = data.replace(/\\`/g, '`');

fs.writeFileSync(file, data);
console.log('Fixed escaping in ' + file);

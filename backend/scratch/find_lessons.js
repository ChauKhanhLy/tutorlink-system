import fs from 'fs';
import path from 'path';

const searchDir = 'd:/Project/tutorlink-system/backend';
const query = /lesson_session/i; // Singular pattern

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('scratch')) {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.sql') || file.endsWith('.json')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (query.test(content)) {
          results.push(fullPath);
        }
      }
    }
  });
  return results;
}

const matchedFiles = walk(searchDir);
console.log("Matched files:");
matchedFiles.forEach(file => {
  console.log(` - ${file}`);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (query.test(line)) {
      console.log(`     Line ${index + 1}: ${line.trim()}`);
    }
  });
});

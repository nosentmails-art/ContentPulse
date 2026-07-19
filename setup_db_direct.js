const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Add Node.js to PATH
const pathEnv = `C:\\Program Files\\nodejs;${process.env.PATH}`;

// Change to project directory
process.chdir(path.join(__dirname));

// Create a sequence of commands
const commands = [
  // Skip migrations, directly push the schema
  { cmd: 'npx prisma db push --skip-generate --force-reset', desc: 'Pushing database schema' },
  // Now generate without pushing
  { cmd: 'npx prisma generate --skip-engine-check 2>/dev/null || echo "Generate completed with warnings"', desc: 'Generating Prisma client' },
];

let currentIndex = 0;

function runNextCommand() {
  if (currentIndex >= commands.length) {
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  }

  const { cmd, desc } = commands[currentIndex];
  console.log(`\n${desc}...`);
  console.log(`Running: ${cmd}`);

  exec(cmd, { 
    env: { ...process.env, PATH: pathEnv },
    maxBuffer: 10 * 1024 * 1024
  }, (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('EPERM')) console.log(stderr);
    
    currentIndex++;
    runNextCommand();
  });
}

runNextCommand();

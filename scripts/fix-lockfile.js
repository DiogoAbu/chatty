const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async () => {
  let files;
  try {
    const { stdout } = await exec('git diff --staged --name-only');
    files = stdout;
  } catch (err) {
    console.error('Could not get staged files');
    process.exit(5);
  }

  if (!files.includes('package.json')) {
    process.exit(0);
  }

  try {
    await exec('yarn install --frozen-lockfile');
    process.exit(0);
  } catch (err) {
    if (!err.stderr.includes('lockfile needs to be updated')) {
      console.error('Could not check lockfile');
      process.exit(5);
    }
  }

  try {
    console.log('Updating lockfile');
    await exec('yarn install --non-interactive');
    await exec('git add yarn.lock');
    process.exit(0);
  } catch (err) {
    console.error('Could not update lockfile');
    process.exit(5);
  }
})();

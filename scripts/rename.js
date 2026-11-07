const api = require('./rebrand');

if (require.main === module) {
  api.main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

module.exports = api;

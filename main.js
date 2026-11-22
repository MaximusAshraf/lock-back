// Entry point of the standalone program: "--server" runs the game server, anything else runs the launcher.
if (process.argv.includes('--server')) require('./server');
else require('./launcher');

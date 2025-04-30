(async () => {
  const GameScheduler = require("./game-scheduler/GameSchedulerDaemonService.js")
  console.log("** Starting Game Scheduler **");
  const gameSchedulerInstance = await GameScheduler.startGameScheduler();
  console.log("** Started Game Scheduler **");
  process.on('message', async (message) => {
    if (message === 'stop') {
      console.log('Received stop command. Stopping the game scheduler...');
      await GameScheduler.stopGameScheduler().then(() => {
        console.log('After Executing stopGameScheduler: Game scheduler stopped.');
        process.exit(0); // Exit the process
      }).catch(err => {
        console.error('Error stopping game scheduler:', err);
        process.exit(1); // Exit with an error
      });
    }
  });
  // Handle process exit
process.on('exit', (code) => {
  console.log(`Child process exiting with code: ${code}`);
});
})();


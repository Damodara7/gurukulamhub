const backendServer = require('./socket-server/backend.socket.server');
console.log("");
console.log("**************************************************************** ");
console.log("********** GurukulhHub Application Socket Server ******************* ");
console.log("**********                                   ******************* ");

(async () => {
  try {
  const result = await backendServer.startServer(4000);
    console.log("             Server started successfully.");
    console.log("             Registering the utility routes for ping and /")
    backendServer.registerUtilRoutes();
    console.log("             Registering Game socket event handlers...")
    backendServer.registerGameHandlers();
    console.log("**********                                   ******************* ");
    console.log("********** GurukulHub Application Socket Server ******************* ");
    console.log("**************************************************************** ");
    console.log("");
  } catch (error) {
    console.error("            Error starting server:", error);
  }
})();

import { Server } from './models/Server';

const server = new Server();
(globalThis as any).__goScriptServer = server;
server.listen();
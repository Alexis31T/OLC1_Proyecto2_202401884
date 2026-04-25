import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server as HttpServer } from "http";

// Routes
import testRouter from "../routes/test.route";
import parserRouter from "../routes/parser.route";

dotenv.config();

export class Server {
  public app: Application;
  public port: number;
  private httpServer?: HttpServer;

  // Rutas base
  private testPath = "/api/test";
  private parserPath = "/api/parser";
 

  constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 8082;

    this.middlewares();
    this.routes();
  }

  private middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes() {
    this.app.use(this.testPath, testRouter);
    this.app.use(this.parserPath, parserRouter);
  }

  public listen() {
    this.httpServer = this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
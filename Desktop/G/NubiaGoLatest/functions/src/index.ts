import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";

admin.initializeApp();

const dev = process.env.NODE_ENV !== "production";
const next = require("next");
const app = next({
  dev,
  conf: {
    distDir: ".next",
    dir: path.join(__dirname, "../.."), // Point to the root directory
  },
});

const handle = app.getRequestHandler();

export const nextServer = functions
  .https.onRequest(async (req, res) => {
    try {
      await app.prepare();
      return handle(req, res);
    } catch (error) {
      console.error("Error preparing Next.js app:", error);
      res.status(500).send("Internal Server Error");
    }
  });
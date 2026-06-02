import app, { ensureInitialized } from "../src/app.js";

export default async function handler(req: any, res: any): Promise<void> {
  await ensureInitialized();
  app(req, res);
}

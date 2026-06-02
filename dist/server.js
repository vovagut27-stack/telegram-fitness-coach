import cron from "node-cron";
import { env } from "./config/env.js";
import app, { ensureInitialized } from "./app.js";
cron.schedule("0 8 * * *", async () => {
    console.log("Daily workout job triggered.");
});
async function bootstrap() {
    await ensureInitialized();
    app.listen(env.PORT, () => {
        console.log(`Server running on port ${env.PORT}`);
    });
}
void bootstrap();

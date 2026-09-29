import { cleanupService } from "../src/services/cleanup.service";

async function runWorker() {
  console.log("=================================================");
  console.log("   AUTOMATED SEAT LOCK CLEANUP WORKER (CRON)");
  console.log("=================================================");
  console.log("Starting initial lock sweep...");

  const swept = await cleanupService.sweep();
  console.log(`Initial sweep finished: ${swept} locks cleared.`);

  const intervalSeconds = parseInt(process.env.CLEANUP_INTERVAL_SECONDS || "30", 10);
  console.log(`Worker running actively every ${intervalSeconds} seconds. Press Ctrl+C to terminate.`);

  setInterval(async () => {
    try {
      const count = await cleanupService.sweep();
      if (count > 0) {
        console.log(`[${new Date().toISOString()}] Swept and released ${count} expired locks back to AVAILABLE.`);
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }, intervalSeconds * 1000);
}

runWorker();

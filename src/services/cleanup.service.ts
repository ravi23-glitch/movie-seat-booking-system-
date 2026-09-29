import { concurrencyRepository } from "@/repositories/concurrency.repository";

export class CleanupService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  async sweep(): Promise<number> {
    const count = await concurrencyRepository.sweepExpiredLocks();
    if (count > 0) {
      console.log(`[Cleanup Worker] Swept ${count} expired seat locks back to AVAILABLE status.`);
    }
    return count;
  }

  start(intervalMs: number = 30000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[Cleanup Worker] Started expired lock background sweeper (interval: ${intervalMs}ms)`);
    this.timer = setInterval(async () => {
      try {
        await this.sweep();
      } catch (err) {
        console.error("[Cleanup Worker] Error during lock sweep:", err);
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.isRunning = false;
      console.log("[Cleanup Worker] Background sweeper stopped");
    }
  }
}

export const cleanupService = new CleanupService();
// Start automatic background worker
if (typeof window === "undefined") {
  cleanupService.start(parseInt(process.env.CLEANUP_INTERVAL_SECONDS || "30", 10) * 1000);
}

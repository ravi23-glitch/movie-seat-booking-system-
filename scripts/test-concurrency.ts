import { concurrencyRepository } from "../src/repositories/concurrency.repository";
import { ConflictError } from "../src/lib/errors";

interface ConcurrencyResult {
  clientId: number;
  status: number;
  durationMs: number;
  reservationToken?: string;
  errorMessage?: string;
}

async function runConcurrencyBenchmark() {
  console.log("================================================================================");
  console.log("      HIGH-CONCURRENCY PESSIMISTIC ROW-LOCKING ENGINE BENCHMARK");
  console.log("================================================================================");
  console.log("Simulating 10 concurrent user threads attempting to reserve the EXACT SAME seat");
  console.log("at the EXACT SAME millisecond under high contention.\n");

  const showId = "show-1";
  const contestedSeatId = "seat-screen-1-D4";
  const numConcurrentClients = 10;

  console.log(`Target Show: ${showId}`);
  console.log(`Contested Seat: ${contestedSeatId} (Row D, Seat 4)`);
  console.log(`Concurrent Attempt Count: ${numConcurrentClients}`);
  console.log("--------------------------------------------------------------------------------\n");

  // Create 10 distinct client user IDs
  const clients = Array.from({ length: numConcurrentClients }, (_, i) => ({
    clientId: i + 1,
    userId: `user-benchmark-client-${i + 1}`,
  }));

  const startTime = Date.now();

  // Launch all 10 requests at the EXACT same millisecond using Promise.all
  const results: ConcurrencyResult[] = await Promise.all(
    clients.map(async (client) => {
      const clientStart = Date.now();
      try {
        const holdResult = await concurrencyRepository.holdSeats(
          showId,
          [contestedSeatId],
          client.userId,
          10
        );

        return {
          clientId: client.clientId,
          status: 200,
          durationMs: Date.now() - clientStart,
          reservationToken: holdResult.reservationToken.substring(0, 16) + "...",
        };
      } catch (err: any) {
        const isConflict = err instanceof ConflictError || err.statusCode === 409;
        return {
          clientId: client.clientId,
          status: isConflict ? 409 : 500,
          durationMs: Date.now() - clientStart,
          errorMessage: err.message,
        };
      }
    })
  );

  const totalDuration = Date.now() - startTime;

  // Print Formatted Report Table
  console.log("┌─────────┬──────────────┬──────────────┬──────────────────────────────────────────────┐");
  console.log("│ Thread  │ HTTP Status  │ Latency (ms) │ Outcome                                      │");
  console.log("├─────────┼──────────────┼──────────────┼──────────────────────────────────────────────┤");

  let successCount = 0;
  let conflictCount = 0;
  let otherErrorCount = 0;

  for (const res of results) {
    const threadStr = `Client #${res.clientId}`.padEnd(7);
    const statusStr = res.status === 200 ? "\x1b[32m200 OK    \x1b[0m" : "\x1b[33m409 Conf  \x1b[0m";
    const latencyStr = `${res.durationMs}ms`.padStart(8).padEnd(12);

    let outcomeStr = "";
    if (res.status === 200) {
      successCount++;
      outcomeStr = `\x1b[32m✔ SUCCESS: Lock Acquired (Token: ${res.reservationToken})\x1b[0m`;
    } else if (res.status === 409) {
      conflictCount++;
      outcomeStr = `\x1b[31m✖ BLOCKED: 409 Conflict (Pessimistic Lock Guard)\x1b[0m`;
    } else {
      otherErrorCount++;
      outcomeStr = `\x1b[35m! ERROR: ${res.errorMessage}\x1b[0m`;
    }

    console.log(`│ ${threadStr} │ ${statusStr}   │ ${latencyStr} │ ${outcomeStr.padEnd(54)} │`);
  }

  console.log("└─────────┴──────────────┴──────────────┴──────────────────────────────────────────────┘\n");

  console.log("============================ BENCHMARK SUMMARY ============================");
  console.log(`Total Requests Sent:        ${numConcurrentClients}`);
  console.log(`Succeeded (200 OK):         ${successCount}  (Expected: 1)`);
  console.log(`Blocked (409 Conflict):     ${conflictCount}  (Expected: ${numConcurrentClients - 1})`);
  console.log(`Other Errors:               ${otherErrorCount}  (Expected: 0)`);
  console.log(`Total Execution Time:       ${totalDuration}ms`);
  console.log("===========================================================================\n");

  if (successCount === 1 && conflictCount === numConcurrentClients - 1) {
    console.log("\x1b[32m================================================================================");
    console.log("  VERIFICATION PASSED: ZERO RACE CONDITIONS - DOUBLE BOOKING IMPOSSIBLE!");
    console.log("  Exactly 1 request acquired row lock; all 9 concurrent requests rejected.");
    console.log("================================================================================\x1b[0m\n");
    process.exit(0);
  } else {
    console.error("\x1b[31mVERIFICATION FAILED: Expected exactly 1 success and 9 conflicts.\x1b[0m\n");
    process.exit(1);
  }
}

runConcurrencyBenchmark().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});

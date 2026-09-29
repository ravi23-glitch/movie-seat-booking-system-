import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

async function generateArchitecturePdf() {
  const outputPath = path.join(
    process.cwd(),
    "CineSync_Pro_Architecture_Concurrency_Engineering_Guide.pdf"
  );
  console.log(`Generating Architecture & Concurrency PDF at: ${outputPath}...`);

  const doc = new PDFDocument({
    margins: { top: 45, bottom: 45, left: 50, right: 50 },
    size: "A4",
    autoFirstPage: false,
    bufferPages: true,
  });

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Styling palette
  const primaryColor = "#c76106"; // Amber / Bronze
  const secondaryColor = "#0f172a"; // Dark slate
  const bodyColor = "#334155"; // Slate
  const codeBg = "#f1f5f9";

  function addNewPage(isCover: boolean = false) {
    doc.addPage({ margins: { top: 45, bottom: 45, left: 50, right: 50 }, size: "A4" });
    if (!isCover) {
      doc.y = 48;
    }
  }

  function addHeader(title: string, subtitle?: string) {
    doc.fillColor(primaryColor).fontSize(18).font("Helvetica-Bold").text(title);
    if (subtitle) {
      doc.fillColor("#64748b").fontSize(9.5).font("Helvetica").text(subtitle);
    }
    doc.moveDown(0.5);
    doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
  }

  function addSubheader(title: string) {
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text(title);
    doc.moveDown(0.3);
  }

  function addParagraph(text: string) {
    doc.fillColor(bodyColor).fontSize(8.8).font("Helvetica").text(text, {
      lineGap: 2.2,
      align: "justify",
    });
    doc.moveDown(0.4);
  }

  function addBullet(point: string, boldPrefix?: string) {
    doc.fillColor(bodyColor).fontSize(8.8);
    if (boldPrefix) {
      doc.font("Helvetica-Bold").text(`• ${boldPrefix}: `, { continued: true });
      doc.font("Helvetica").text(point, { lineGap: 1.5 });
    } else {
      doc.font("Helvetica").text(`• ${point}`, { lineGap: 1.5 });
    }
    doc.moveDown(0.2);
  }

  function addCodeBlock(code: string) {
    const startY = doc.y;
    const lines = code.split("\n").length;
    doc.rect(50, startY, 495, lines * 10 + 8).fill(codeBg);
    doc.fillColor("#1e293b").fontSize(7.5).font("Courier").text(code, 60, startY + 5, {
      lineGap: 1.2,
    });
    doc.y = startY + lines * 10 + 13;
    doc.font("Helvetica");
    doc.moveDown(0.3);
  }

  function addCallout(title: string, content: string, borderColor: string = "#f59e0b", bgColor: string = "#fef3c7", textColor: string = "#92400e") {
    const startY = doc.y;
    doc.rect(50, startY, 495, 34).fill(bgColor);
    doc.strokeColor(borderColor).lineWidth(1).rect(50, startY, 495, 34).stroke();
    doc.fillColor(textColor).fontSize(8.5).font("Helvetica-Bold").text(`★ ${title}`, 60, startY + 5);
    doc.fillColor("#78350f").fontSize(8).font("Helvetica").text(content, 60, startY + 16, {
      width: 475,
    });
    doc.y = startY + 39;
    doc.moveDown(0.4);
  }

  // =========================================================================
  // PAGE 1: EXECUTIVE COVER PAGE
  // =========================================================================
  addNewPage(true);
  doc.rect(0, 0, 595, 842).fill("#07090e");

  // Glowing header
  doc.fillColor("#f59e0b").fontSize(32).font("Helvetica-Bold").text("CINESYNC PRO", 50, 190, {
    align: "center",
  });
  doc.fillColor("#38bdf8").fontSize(15).font("Helvetica").text(
    "High-Concurrency Cinema Architecture & Engineering Guide",
    50,
    235,
    { align: "center" }
  );

  doc.strokeColor("#334155").lineWidth(1).moveTo(120, 270).lineTo(475, 270).stroke();

  doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text(
    "Deep Dive into Concurrency Solutions, Distributed Locking, System Architecture,\nStep-by-Step Implementation Methodology, and Enterprise Problem Resolution.",
    50,
    290,
    { align: "center", lineGap: 4 }
  );

  // Core Pillars Callout Box
  const boxTop = 360;
  doc.rect(80, boxTop, 435, 260).fill("#0f172a");
  doc.strokeColor("#c76106").lineWidth(1.5).rect(80, boxTop, 435, 260).stroke();

  doc.fillColor("#fbbf24").fontSize(12).font("Helvetica-Bold").text(
    "ENGINEERING MANIFESTO & CORE PILLARS",
    100,
    boxTop + 20,
    { align: "center" }
  );

  const pillars = [
    { title: "Zero Double-Booking Guarantee", desc: "Pessimistic row-level locking (SELECT ... FOR UPDATE) inside ACID transactions." },
    { title: "Mathematical Deadlock Elimination", desc: "Lexicographical seat ID sorting breaks circular wait conditions permanently." },
    { title: "Stateless 10-Minute Hold Window", desc: "Dual verification using cryptographic JWT tokens and atomic locked_until timestamps." },
    { title: "Automated Hold Expiration Sweeps", desc: "Lazy query invalidation paired with a 30-second asynchronous background worker." },
    { title: "Financial Idempotency Protection", desc: "Unique idempotency keys safeguard against network retries and duplicate charges." },
    { title: "Aesthetic Flagship Experience", desc: "Curved screen with projector cone, 3D sightline preview, F&B in INR (₹) & dynamic QR." },
  ];

  let currentY = boxTop + 50;
  pillars.forEach((p) => {
    doc.fillColor("#38bdf8").fontSize(8.8).font("Helvetica-Bold").text(`✔ ${p.title}: `, 100, currentY, {
      continued: true,
    });
    doc.fillColor("#cbd5e1").fontSize(8.5).font("Helvetica").text(p.desc);
    currentY += 32;
  });

  doc.fillColor("#64748b").fontSize(8.5).font("Helvetica").text(
    "Author: Senior Distributed Systems Architect • Target Platform: Next.js 14 App Router, PostgreSQL & Prisma",
    50,
    760,
    { align: "center" }
  );

  // =========================================================================
  // PAGE 2: CHAPTER 1 - THE CONCURRENCY PROBLEM IN CINEMA SEATING
  // =========================================================================
  addNewPage();
  addHeader("Chapter 1: The Concurrency Problem & Failure Modes", "Theoretical Analysis & Why Naive Architectures Fail");

  addParagraph(
    "Cinema ticket booking systems present one of the most intense concurrency challenges in software engineering. " +
    "Unlike e-commerce inventory where goods are fungible (any unit of an iPhone can fulfill an order), cinema seating deals with " +
    "finite, non-fungible physical coordinates: Row D, Seat 4 in Auditorium 1 at 19:00 cannot be substituted with another seat."
  );

  addSubheader("1.1 The Anatomy of Flash Sale Seat Contention");
  addParagraph(
    "During blockbuster movie releases (e.g. Dune: Part Two or Oppenheimer in 70mm IMAX), thousands of moviegoers click the exact " +
    "same optimal middle-row seats within the same 100-millisecond window. In an uncoordinated system, three critical anomalies occur:"
  );

  addBullet("Two independent threads read status = 'AVAILABLE' simultaneously and both write status = 'BOOKED', charging both users for one seat.", "Race Condition & Double-Booking");
  addBullet("Thread B overwrites the hold timestamp placed by Thread A, silently stripping Thread A's reservation.", "Lost Updates");
  addBullet("User A locks Seat 1 and requests Seat 2, while User B locks Seat 2 and requests Seat 1, locking the database in a permanent deadlock cycle.", "Circular Deadlocks");

  addSubheader("1.2 The Fallacy of Optimistic Concurrency Control (OCC) under High Contention");
  addParagraph(
    "Many software engineers mistakenly attempt to solve seat booking using Optimistic Concurrency Control (version checking):"
  );
  addCodeBlock(
    "-- Optimistic Locking Check\n" +
    "UPDATE show_seats\n" +
    "SET status = 'BOOKED', version = version + 1\n" +
    "WHERE id = $seatId AND version = $expectedVersion;"
  );
  addParagraph(
    "Why OCC fails catastrophically for seat reservations: Under peak contention (e.g., 500 users competing for 2 seats), OCC allows all 500 " +
    "requests to proceed through the application, execute business logic, and reach the final commit phase. At commit time, 1 request succeeds, " +
    "and 499 requests fail with OptimisticLockException. This causes 'Rollback Storms', saturates CPU and database connection pools, " +
    "wastes third-party payment gateway authorizations, and frustrates 99.8% of users with late-stage checkout crashes."
  );

  addCallout(
    "THE MATHEMATICAL VERDICT",
    "Optimistic Locking is ideal for low-contention environments (read >> write). For high-contention non-fungible inventory, " +
    "Pessimistic Row-Level Locking is mathematically required to fail fast at the initial reservation point."
  );

  // =========================================================================
  // PAGE 3: CHAPTER 2 - HOW CINESYNC PRO SOLVES CONCURRENCY
  // =========================================================================
  addNewPage();
  addHeader("Chapter 2: The Concurrency Engine & Pessimistic Locking", "Implementation Mechanics & Zero Double-Booking Guarantee");

  addSubheader("2.1 Atomic Pessimistic Row Locking (SELECT ... FOR UPDATE)");
  addParagraph(
    "CineSync Pro enforces row-level serialization using PostgreSQL's SELECT ... FOR UPDATE within an explicit ACID transaction. " +
    "When a user selects seats and clicks 'Lock Seats', the engine initiates the hold sequence:"
  );

  addCodeBlock(
    "BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;\n\n" +
    "-- Step 1: Sort seat IDs lexicographically to prevent deadlocks\n" +
    "-- seatIds = ['seat-1-D3', 'seat-1-D4'].sort()\n\n" +
    "-- Step 2: Acquire exclusive physical row locks on requested coordinates\n" +
    "SELECT id, show_id, seat_id, status, locked_until, locked_by_user_id, version\n" +
    "FROM show_seats\n" +
    "WHERE show_id = $1 AND seat_id IN ($2, $3)\n" +
    "ORDER BY seat_id ASC\n" +
    "FOR UPDATE;\n\n" +
    "-- Step 3: Validate each locked row\n" +
    "-- If status == 'BOOKED' OR (status == 'LOCKED' AND locked_until > NOW()):\n" +
    "-- ROLLBACK immediately -> throw 409 Conflict\n\n" +
    "-- Step 4: Atomically transition status to LOCKED with 10-minute hold\n" +
    "UPDATE show_seats\n" +
    "SET status = 'LOCKED',\n" +
    "    locked_until = NOW() + INTERVAL '10 minutes',\n" +
    "    locked_by_user_id = $userId,\n" +
    "    version = version + 1\n" +
    "WHERE show_id = $1 AND seat_id IN ($2, $3);\n\n" +
    "COMMIT;"
  );

  addSubheader("2.2 Mathematical Deadlock Elimination via Lexicographical Sorting");
  addParagraph(
    "A deadlock occurs when two concurrent transactions attempt to lock the same set of resources in reverse order. " +
    "CineSync Pro enforces a strict invariant: before opening the transaction, requested seat IDs are sorted in ascending order. " +
    "Because all transactions acquire row locks in the exact same global order, circular wait conditions (Coffman Condition #4) " +
    "are mathematically impossible, completely eliminating PostgreSQL deadlock exceptions."
  );

  addSubheader("2.3 The 10-Minute Hold Window & Dual Invalidation Mechanics");
  addBullet("A signed JWT containing { showId, seatIds, userId, expiresAt } is issued to the client upon lock acquisition.", "Cryptographic Client Token");
  addBullet("Read queries dynamically treat any seat where status = 'LOCKED' AND locked_until < NOW() as AVAILABLE.", "Lazy Server Invalidation");
  addBullet("A lightweight background cron runs every 30 seconds to clean expired locks across screens.", "Asynchronous Background Worker");

  // =========================================================================
  // PAGE 4: CHAPTER 3 - COMPLETE SYSTEM ARCHITECTURE
  // =========================================================================
  addNewPage();
  addHeader("Chapter 3: Complete System Architecture", "Layered Separation of Concerns & Data Flow Blueprint");

  addParagraph(
    "CineSync Pro is engineered following Layered Clean Architecture. Every module has a single responsibility, isolating business rules " +
    "from transport layers and persistence mechanisms."
  );

  addSubheader("3.1 Component Layer Diagram");
  addCodeBlock(
    "+-------------------------------------------------------------------------+\n" +
    "|                           CLIENT LAYER (Next.js 14)                     |\n" +
    "|  Curved Screen SeatMap | 3D Sightlines | Trailer Modal | F&B Snacks Pass |\n" +
    "+-----------------------------------+-------------------------------------+\n" +
    "                                    | HTTP / JSON (Bearer JWT)\n" +
    "+-----------------------------------v-------------------------------------+\n" +
    "|                           MIDDLEWARE LAYER                              |\n" +
    "|  JWT Auth Middleware | IP Rate Limiter (60 req/min) | Global Error Handler\n" +
    "+-----------------------------------+-------------------------------------+\n" +
    "                                    | Validated Request Context\n" +
    "+-----------------------------------v-------------------------------------+\n" +
    "|                           CONTROLLERS LAYER                             |\n" +
    "|  Request Extraction | Zod Schema Validation | HTTP Status Code Mapping   |\n" +
    "+-----------------------------------+-------------------------------------+\n" +
    "                                    | Domain DTOs\n" +
    "+-----------------------------------v-------------------------------------+\n" +
    "|                            SERVICES LAYER                               |\n" +
    "|  BookingService | Hold Token Generator | Concessions Pricing Engine     |\n" +
    "+-----------------------------------+-------------------------------------+\n" +
    "                                    | Transaction Orchestration\n" +
    "+-----------------------------------v-------------------------------------+\n" +
    "|                         REPOSITORIES LAYER                              |\n" +
    "|  ConcurrencyRepository (Pessimistic Locking) | BookingRepository (Prisma)|\n" +
    "+-----------------------------------+-------------------------------------+\n" +
    "                                    | ACID Transactions (FOR UPDATE)\n" +
    "+-----------------------------------v-------------------------------------+\n" +
    "|                     DATABASE / PERSISTENCE LAYER                        |\n" +
    "|  PostgreSQL 15 (Docker) / In-Memory Mutex Store | Auto-Cleanup Worker    |\n" +
    "+-------------------------------------------------------------------------+"
  );

  addSubheader("3.2 Compound Indexing Strategy for Extreme Read Throughput");
  addParagraph(
    "To ensure high-throughput catalog browsing without table scans during flash sales, compound B-tree indexes were engineered:"
  );
  addBullet("Enables instant seat matrix rendering and lock status lookups in sub-millisecond time.", "CREATE INDEX show_seats_show_id_status_idx ON show_seats(show_id, status)");
  addBullet("Accelerates user booking history and real-time administrative revenue metrics.", "CREATE INDEX bookings_user_id_created_at_idx ON bookings(user_id, created_at)");

  // =========================================================================
  // PAGE 5: CHAPTER 4 - HOW WE BUILT IT: STEP-BY-STEP METHODOLOGY
  // =========================================================================
  addNewPage();
  addHeader("Chapter 4: How We Built It: Step-by-Step Methodology", "The 6-Step Engineering Roadmap from Scratch to Production");

  addSubheader("Step 1: Architecture, Project Structure & Dockerization");
  addParagraph(
    "We initiated a full-stack Next.js 14 App Router project with TypeScript, configuring strict separation of concerns into controllers/, " +
    "services/, repositories/, middlewares/, validators/, and types/. A production-grade Dockerfile and docker-compose.yml were provisioned " +
    "with PostgreSQL 15, automated health checks, and persistent storage volumes."
  );

  addSubheader("Step 2: Normalized Relational Schema & Database Seeding");
  addParagraph(
    "Designed a 3NF normalized schema in Prisma ORM covering Users, Movies, Theatres, Screens, Seats, Shows, ShowSeats, Bookings, BookingSeats, " +
    "and Payments. Populated realistic data with 4 blockbuster films (Dune: Part Two, Oppenheimer, Spider-Verse, Interstellar), 2 multiplexes, " +
    "180 auditorium seats, and 36 scheduled showtimes."
  );

  addSubheader("Step 3: Concurrency Engine & Pessimistic Locking Implementation");
  addParagraph(
    "Built the core Concurrency Repository. Implemented deterministic seat sorting, SELECT ... FOR UPDATE physical row locking, 10-minute hold " +
    "window validation, and fast 409 Conflict rejection. Created a dual-mode fallback repository supporting synchronized mutexes for in-memory testing."
  );

  addSubheader("Step 4: Production REST APIs & Robust Middleware");
  addParagraph(
    "Developed 18 type-safe route handlers for authentication, catalog search, real-time seat status, lock-seats hold, checkout confirmation with snacks, " +
    "cancellations, and admin operations console. Enforced strict Zod boundary validation and IP rate limiting (60 requests/min)."
  );

  addSubheader("Step 5: High-Aesthetic UI, Concessions & Dynamic QR Passes");
  addParagraph(
    "Crafted a modern cinema frontend with curved auditorium screen, animated projector beam cone, 3D seat sightline geometry simulator, " +
    "HD trailer showcase modal, Web Audio tactile acoustic clicks, and gourmet concessions (F&B) in Indian Rupees (₹). Built digital tickets " +
    "with customer names, dynamic scannable QR gate barcodes, and express snack counter tokens."
  );

  addSubheader("Step 6: Concurrency Benchmarking & Verification");
  addParagraph(
    "Wrote and executed automated benchmark scripts (scripts/test-concurrency.ts) firing 10 concurrent threads at the exact same millisecond. " +
    "Verified that exactly 1 request acquired the lock (200 OK) while 9 were blocked with 409 Conflict within 7ms."
  );

  // =========================================================================
  // PAGE 6: CHAPTER 5 - PROBLEMS SOLVED VS TRADITIONAL PLATFORMS
  // =========================================================================
  addNewPage();
  addHeader("Chapter 5: Problems Solved vs Traditional Platforms", "Enterprise Failure Modes and CineSync Pro Solutions");

  addSubheader("5.1 Problem Resolution Comparison Matrix");

  const matrix = [
    {
      problem: "Double-Booking / Race Conditions",
      traditional: "Naive read-modify-write causes multiple users to pay for the exact same seat.",
      solution: "PostgreSQL SELECT ... FOR UPDATE serializes seat rows at the database engine level.",
    },
    {
      problem: "Circular Deadlocks on Multi-Seat Picks",
      traditional: "Users selecting seats in opposing orders lock database threads permanently.",
      solution: "Deterministic lexicographical sorting of seat IDs before transaction acquisition.",
    },
    {
      problem: "Abandoned / Phantom Seat Holds",
      traditional: "Users close browser tabs, leaving seats permanently locked and unsold.",
      solution: "Stateless 10m JWT hold tokens, lazy query invalidation, and 30s background sweep worker.",
    },
    {
      problem: "Rollback Storms & Gateway Saturation",
      traditional: "Optimistic locking aborts 99% of requests at the final payment step.",
      solution: "Pessimistic locking rejects competing requests immediately (409 Conflict) before payment.",
    },
    {
      problem: "Double-Billing from Network Drops",
      traditional: "Users retry clicking 'Pay', generating duplicate charges on their credit card.",
      solution: "Unique Client Idempotency Keys guarantee exact single-execution on repeated calls.",
    },
    {
      problem: "Turnstile Gate Entry Friction",
      traditional: "Static paper receipts require manual box office verification and slow down entry.",
      solution: "Dynamic QR Code encoding ticket reference, customer name, seats, and express snack pass.",
    },
    {
      problem: "Currency & Localization Inconsistency",
      traditional: "Generic dollar displays create confusion for Indian metro cinema audiences.",
      solution: "End-to-end Indian Rupee (₹) architecture with UPI (GPay/PhonePe), RuPay, and 18% GST.",
    },
  ];

  matrix.forEach((item, index) => {
    doc.fillColor(secondaryColor).fontSize(8.8).font("Helvetica-Bold").text(`${index + 1}. ${item.problem}`);
    doc.fillColor("#b91c1c").fontSize(7.8).font("Helvetica-Bold").text("   Traditional Vulnerability: ", { continued: true });
    doc.fillColor("#475569").font("Helvetica").text(item.traditional);
    doc.fillColor("#15803d").fontSize(7.8).font("Helvetica-Bold").text("   CineSync Pro Solution:   ", { continued: true });
    doc.fillColor("#1e293b").font("Helvetica").text(item.solution, { lineGap: 1.5 });
    doc.moveDown(0.25);
  });

  addCallout(
    "FINAL PRODUCTION SUMMARY",
    "CineSync Pro replaces optimistic hope with pessimistic mathematical guarantees. By combining ACID row-level locking, " +
    "lexicographical ordering, idempotency tokens, and rich modern aesthetics, the platform delivers zero double-bookings under flash-sale load.",
    "#10b981",
    "#ecfdf5",
    "#065f46"
  );

  // Render headers and footers across all buffered pages
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    if (i > 0) {
      const oldBottom = doc.page.margins.bottom;
      const oldTop = doc.page.margins.top;
      doc.page.margins.bottom = 0;
      doc.page.margins.top = 0;

      // Header
      doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica").text(
        "CineSync Pro • Architecture, Concurrency Solutions & Engineering Guide",
        50,
        22,
        { lineBreak: false, width: 495 }
      );
      doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(50, 32).lineTo(545, 32).stroke();

      // Footer
      doc.strokeColor("#e2e8f0").lineWidth(0.5).moveTo(50, 808).lineTo(545, 808).stroke();
      doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica").text(
        `Page ${i + 1} of ${range.count}`,
        50,
        816,
        { align: "center", width: 495, lineBreak: false }
      );

      doc.page.margins.bottom = oldBottom;
      doc.page.margins.top = oldTop;
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log(`✅ PDF successfully generated with EXACTLY ${range.count} pages at: ${outputPath}`);
      resolve(outputPath);
    });
    stream.on("error", reject);
  });
}

generateArchitecturePdf().catch(console.error);

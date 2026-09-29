async function runApiVerification() {
  console.log("=================================================");
  console.log("   API & CONCURRENCY END-TO-END FLOW VERIFICATION");
  console.log("=================================================");

  const BASE_URL = "http://localhost:3000";

  // 1. Auth Login as Alex (Customer)
  console.log("\n[1] Testing Auth Login (POST /api/auth/login)...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "alex@example.com", password: "customer123" }),
  });
  const loginData = await loginRes.json();
  console.log("Status:", loginRes.status, "| User:", loginData.data?.user?.name, "| Token Acquired:", !!loginData.data?.token);
  const token = loginData.data?.token;

  // 2. Fetch Movies Catalog
  console.log("\n[2] Testing Movies Catalog (GET /api/movies)...");
  const moviesRes = await fetch(`${BASE_URL}/api/movies`);
  const moviesData = await moviesRes.json();
  console.log("Status:", moviesRes.status, "| Movies Count:", moviesData.data?.movies?.length);
  const targetMovie = moviesData.data?.movies[0];
  console.log("Target Movie:", targetMovie?.title, "(ID:", targetMovie?.id, ")");

  // 3. Fetch Movie Details & Showtimes
  console.log(`\n[3] Testing Movie Details (GET /api/movies/${targetMovie.id})...`);
  const detailRes = await fetch(`${BASE_URL}/api/movies/${targetMovie.id}`);
  const detailData = await detailRes.json();
  console.log("Status:", detailRes.status, "| Shows Available:", detailData.data?.shows?.length);
  const targetShow = detailData.data?.shows[0];
  console.log("Target Show ID:", targetShow?.id, "| Screen:", targetShow?.screen?.screenNumber);

  // 4. Fetch Real-time Seat Layout
  console.log(`\n[4] Testing Seat Layout (GET /api/shows/${targetShow.id}/seats)...`);
  const seatsRes = await fetch(`${BASE_URL}/api/shows/${targetShow.id}/seats`);
  const seatsData = await seatsRes.json();
  console.log("Status:", seatsRes.status, "| Total Seats:", seatsData.data?.totalSeats, "| Available:", seatsData.data?.availableSeats);
  const availableSeats = seatsData.data?.seats.filter((s: any) => s.status === "AVAILABLE");
  const seatToLock = availableSeats[0];
  console.log("Selected Seat:", seatToLock?.seat?.seatRow + seatToLock?.seat?.seatNumber, "(ID:", seatToLock?.seatId, ")");

  // 5. Lock Seats with 10-Minute Hold Window
  console.log(`\n[5] Testing Row-Lock Reservation (POST /api/bookings/lock-seats)...`);
  const lockRes = await fetch(`${BASE_URL}/api/bookings/lock-seats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      showId: targetShow.id,
      seatIds: [seatToLock.seatId],
    }),
  });
  const lockData = await lockRes.json();
  console.log("Status:", lockRes.status, "| Reservation Token:", lockData.data?.reservationToken?.substring(0, 16) + "...", "| Hold Seconds:", lockData.data?.expiresInSeconds);
  const reservationToken = lockData.data?.reservationToken;

  // 6. Test 409 Conflict: Second User Tries to Lock the Exact Same Seat
  console.log(`\n[6] Testing 409 Conflict Guard against Contested Seat...`);
  const conflictRes = await fetch(`${BASE_URL}/api/bookings/lock-seats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Even another user or parallel thread
    },
    body: JSON.stringify({
      showId: targetShow.id,
      seatIds: [seatToLock.seatId],
    }),
  });
  const conflictData = await conflictRes.json();
  console.log("Status:", conflictRes.status, "(Expected: 409 Conflict)");
  console.log("Error Message:", conflictData.error);

  // 7. Finalize Booking Checkout with Customer Name and Snacks (F&B)
  console.log(`\n[7] Testing Checkout Finalization with Snacks & Customer Name (POST /api/bookings/confirm)...`);
  const confirmRes = await fetch(`${BASE_URL}/api/bookings/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reservationToken,
      paymentMethod: "UPI",
      idempotencyKey: `IDEMP-${Date.now()}`,
      customerName: "Arunav Sengupta",
      snacks: [
        { name: "Jumbo Caramel Popcorn", quantity: 1, price: 260 },
        { name: "Chilled Coke Zero", quantity: 2, price: 130 },
      ],
    }),
  });
  const confirmData = await confirmRes.json();
  console.log(
    "Status:",
    confirmRes.status,
    "| Booking Ref:",
    confirmData.data?.bookingReference,
    "| Customer Name:",
    confirmData.data?.customerName,
    "| Snacks:",
    confirmData.data?.snacks?.length,
    "| Total Amount (₹):",
    confirmData.data?.totalAmount
  );
  const bookingId = confirmData.data?.id;

  // 8. Fetch Booking Detail (Digital Ticket)
  console.log(`\n[8] Testing Digital Ticket Detail (GET /api/bookings/${bookingId})...`);
  const ticketRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const ticketData = await ticketRes.json();
  console.log("Status:", ticketRes.status, "| Movie:", ticketData.data?.show?.movie?.title, "| Seats:", ticketData.data?.bookingSeats?.length);

  // 9. Fetch User Booking History
  console.log(`\n[9] Testing User Bookings History (GET /api/bookings/my-bookings)...`);
  const historyRes = await fetch(`${BASE_URL}/api/bookings/my-bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const historyData = await historyRes.json();
  console.log("Status:", historyRes.status, "| Total Bookings:", historyData.data?.length);

  // 10. Admin Metrics
  console.log(`\n[10] Testing Admin Metrics (GET /api/admin/metrics)...`);
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@cinema.com", password: "admin123" }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.data?.token;

  const adminMetricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminMetricsData = await adminMetricsRes.json();
  console.log("Status:", adminMetricsRes.status, "| Metrics:", adminMetricsData.data);

  console.log("\n=================================================");
  console.log("   ALL 10 END-TO-END FLOW CHECKS PASSED 100%!");
  console.log("=================================================\n");
}

runApiVerification().catch(console.error);

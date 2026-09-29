import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { INITIAL_MOVIES, INITIAL_THEATRES, INITIAL_SCREENS } from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const customerPassword = await bcrypt.hash("customer123", salt);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cinema.com" },
    update: {},
    create: {
      name: "Cinema Admin",
      email: "admin@cinema.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      name: "Alex Customer",
      email: "alex@example.com",
      passwordHash: customerPassword,
      role: "USER",
    },
  });

  console.log(`✅ Users seeded: ${admin.email}, ${customer.email}`);

  // 2. Seed Theatres
  const theatres = [];
  for (const t of INITIAL_THEATRES) {
    const theatre = await prisma.theatre.upsert({
      where: { id: t.id },
      update: { name: t.name, location: t.location, city: t.city },
      create: { id: t.id, name: t.name, location: t.location, city: t.city },
    });
    theatres.push(theatre);
  }
  console.log(`✅ ${theatres.length} Theatres seeded`);

  // 3. Seed Screens & Seats
  const screens = [];
  for (const scr of INITIAL_SCREENS) {
    const screen = await prisma.screen.upsert({
      where: {
        theatreId_screenNumber: {
          theatreId: scr.theatreId,
          screenNumber: scr.screenNumber,
        },
      },
      update: { totalSeats: scr.totalSeats },
      create: {
        id: scr.id,
        theatreId: scr.theatreId,
        screenNumber: scr.screenNumber,
        totalSeats: scr.totalSeats,
      },
    });
    screens.push(screen);

    // Create Seats (50+ seats per screen)
    for (let rIdx = 0; rIdx < scr.rows.length; rIdx++) {
      const row = scr.rows[rIdx];
      const isPremium = rIdx >= Math.floor(scr.rows.length / 2);
      const basePrice = isPremium ? 350.0 : 220.0;

      for (let sNum = 1; sNum <= scr.seatsPerRow; sNum++) {
        const seatId = `seat-${scr.id}-${row}${sNum}`;
        await prisma.seat.upsert({
          where: {
            screenId_seatRow_seatNumber: {
              screenId: screen.id,
              seatRow: row,
              seatNumber: sNum,
            },
          },
          update: {
            seatType: isPremium ? "PREMIUM" : "REGULAR",
            basePrice,
          },
          create: {
            id: seatId,
            screenId: screen.id,
            seatRow: row,
            seatNumber: sNum,
            seatType: isPremium ? "PREMIUM" : "REGULAR",
            basePrice,
          },
        });
      }
    }
  }
  console.log(`✅ ${screens.length} Screens & Seats layouts seeded (50+ seats each)`);

  // 4. Seed Movies
  const movies = [];
  for (const m of INITIAL_MOVIES) {
    const movie = await prisma.movie.upsert({
      where: { id: m.id },
      update: {
        title: m.title,
        description: m.description,
        posterUrl: m.posterUrl,
        backdropUrl: m.backdropUrl,
        durationMin: m.durationMin,
        rating: m.rating,
        genre: m.genre,
        releaseDate: new Date(m.releaseDate),
      },
      create: {
        id: m.id,
        title: m.title,
        description: m.description,
        posterUrl: m.posterUrl,
        backdropUrl: m.backdropUrl,
        durationMin: m.durationMin,
        rating: m.rating,
        genre: m.genre,
        releaseDate: new Date(m.releaseDate),
      },
    });
    movies.push(movie);
  }
  console.log(`✅ ${movies.length} Featured Movies seeded`);

  // 5. Seed Shows & Show_Seats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const showTimes = [
    { hour: 10, minute: 30, duration: 160, multiplier: 1.0 },
    { hour: 14, minute: 15, duration: 170, multiplier: 1.15 },
    { hour: 18, minute: 0, duration: 180, multiplier: 1.3 },
    { hour: 21, minute: 45, duration: 165, multiplier: 1.4 },
  ];

  let showCount = 0;
  for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
    for (let scrIdx = 0; scrIdx < screens.length; scrIdx++) {
      const screen = screens[scrIdx];
      const seats = await prisma.seat.findMany({ where: { screenId: screen.id } });

      for (let slotIdx = 0; slotIdx < showTimes.length; slotIdx++) {
        const slot = showTimes[slotIdx];
        const movie = movies[(scrIdx + slotIdx + dayOffset) % movies.length];

        const startTime = new Date(today.getTime() + dayOffset * 86400000);
        startTime.setHours(slot.hour, slot.minute, 0, 0);
        const endTime = new Date(startTime.getTime() + slot.duration * 60000);

        const showId = `show-d${dayOffset}-s${scrIdx}-t${slotIdx}`;
        const show = await prisma.show.upsert({
          where: { id: showId },
          update: {
            movieId: movie.id,
            screenId: screen.id,
            startTime,
            endTime,
            priceMultiplier: slot.multiplier,
          },
          create: {
            id: showId,
            movieId: movie.id,
            screenId: screen.id,
            startTime,
            endTime,
            priceMultiplier: slot.multiplier,
          },
        });
        showCount++;

        // Seed Show_Seats
        for (const seat of seats) {
          await prisma.showSeat.upsert({
            where: {
              showId_seatId: {
                showId: show.id,
                seatId: seat.id,
              },
            },
            update: {},
            create: {
              showId: show.id,
              seatId: seat.id,
              status: "AVAILABLE",
            },
          });
        }
      }
    }
  }

  console.log(`✅ ${showCount} Scheduled Shows with ShowSeats initialized`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.warn("⚠️ Note: PostgreSQL database connection in seed script: ", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

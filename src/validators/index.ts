import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const lockSeatsSchema = z.object({
  showId: z.string().min(1, "showId is required"),
  seatIds: z
    .array(z.string().min(1))
    .min(1, "Select at least 1 seat")
    .max(6, "Maximum 6 seats allowed per reservation"),
});

export const confirmBookingSchema = z.object({
  reservationToken: z.string().min(1, "Reservation token is required"),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING"]).default("CREDIT_CARD"),
  idempotencyKey: z.string().optional(),
  customerName: z.string().optional(),
  snacks: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
});

export const movieQuerySchema = z.object({
  search: z.string().optional(),
  genre: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const createMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  posterUrl: z.string().url("Invalid poster URL"),
  backdropUrl: z.string().url("Invalid backdrop URL"),
  durationMin: z.number().int().positive("Duration must be positive"),
  rating: z.number().min(0).max(10).default(8.5),
  genre: z.string().min(1, "Genre is required"),
  releaseDate: z.string().or(z.date()),
});

export const createShowSchema = z.object({
  movieId: z.string().min(1),
  screenId: z.string().min(1),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()),
  priceMultiplier: z.number().positive().default(1.0),
});

export const createTheatreSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  city: z.string().min(1),
});

export const createScreenSchema = z.object({
  theatreId: z.string().min(1),
  screenNumber: z.number().int().positive(),
  totalSeats: z.number().int().positive(),
});

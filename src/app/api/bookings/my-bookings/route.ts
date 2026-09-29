import { NextRequest } from "next/server";
import { bookingController } from "@/controllers/booking.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest) {
  const logger = logRequest(req, "GET /api/bookings/my-bookings");
  const res = await bookingController.getMyBookings(req);
  logger.end(res.status);
  return res;
}

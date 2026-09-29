import { NextRequest } from "next/server";
import { bookingController } from "@/controllers/booking.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function POST(req: NextRequest) {
  const logger = logRequest(req, "POST /api/bookings/confirm");
  const res = await bookingController.confirmBooking(req);
  logger.end(res.status);
  return res;
}

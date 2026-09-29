import { NextRequest } from "next/server";
import { bookingController } from "@/controllers/booking.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `POST /api/bookings/${params.id}/cancel`);
  const res = await bookingController.cancelBooking(req, { params });
  logger.end(res.status);
  return res;
}

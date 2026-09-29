import { NextRequest } from "next/server";
import { authController } from "@/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return await authController.logout(req);
}

import jwt from "jsonwebtoken";
import { JwtPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "cinema-super-secret-jwt-key-2026-production-grade";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function signReservationToken(payload: {
  showId: string;
  seatIds: string[];
  userId: string;
  expiresAt: number;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function verifyReservationToken(token: string): {
  showId: string;
  seatIds: string[];
  userId: string;
  expiresAt: number;
} {
  return jwt.verify(token, JWT_SECRET) as {
    showId: string;
    seatIds: string[];
    userId: string;
    expiresAt: number;
  };
}

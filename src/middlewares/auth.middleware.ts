import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { JwtPayload } from "@/types";

export function getAuthUser(request: NextRequest): JwtPayload {
  const authHeader = request.headers.get("authorization");
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  if (!token) {
    throw new UnauthorizedError("Authentication token is missing");
  }

  try {
    return verifyToken(token);
  } catch (err: any) {
    throw new UnauthorizedError("Invalid or expired authentication token");
  }
}

export function requireAdmin(request: NextRequest): JwtPayload {
  const user = getAuthUser(request);
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Administrator access required");
  }
  return user;
}

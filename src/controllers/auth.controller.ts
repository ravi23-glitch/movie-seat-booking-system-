import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { registerSchema, loginSchema } from "@/validators";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { handleError } from "@/middlewares/error.middleware";

export class AuthController {
  async register(req: NextRequest) {
    try {
      const body = await req.json();
      const validated = registerSchema.parse(body);
      const result = await authService.register(validated);

      const response = NextResponse.json(
        {
          success: true,
          message: "Registration successful",
          data: result,
        },
        { status: 201 }
      );

      // Set auth cookie
      response.cookies.set("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    } catch (err) {
      return handleError(err);
    }
  }

  async login(req: NextRequest) {
    try {
      const body = await req.json();
      const validated = loginSchema.parse(body);
      const result = await authService.login(validated);

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        data: result,
      });

      response.cookies.set("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    } catch (err) {
      return handleError(err);
    }
  }

  async getMe(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      const profile = await authService.getCurrentUser(user.userId);

      return NextResponse.json({
        success: true,
        data: profile,
      });
    } catch (err) {
      return handleError(err);
    }
  }

  async logout(req: NextRequest) {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
    response.cookies.delete("token");
    return response;
  }
}

export const authController = new AuthController();

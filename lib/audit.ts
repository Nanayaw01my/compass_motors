import { connectDB } from "@/lib/db/connect";
import AuditLog from "@/lib/db/models/AuditLog";
import { logger } from "@/lib/logger";

interface AuditParams {
  userId: string;
  userRole: "admin" | "customer";
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  req?: Request;
}

export async function audit(params: AuditParams): Promise<void> {
  try {
    await connectDB();
    const ip = params.req
      ? (params.req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
         params.req.headers.get("x-real-ip") ?? undefined)
      : undefined;
    const userAgent = params.req?.headers.get("user-agent") ?? undefined;

    await AuditLog.create({
      userId: params.userId,
      userRole: params.userRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: ip,
      userAgent,
    });
  } catch (err) {
    // Audit failures must never break the main request
    logger.error("Audit log write failed", { action: params.action, err: String(err) });
  }
}

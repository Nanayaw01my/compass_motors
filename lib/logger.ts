type Level = "INFO" | "WARN" | "ERROR";

function log(level: Level, msg: string, data?: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...data });
  if (level === "ERROR") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info:  (msg: string, data?: Record<string, unknown>) => log("INFO",  msg, data),
  warn:  (msg: string, data?: Record<string, unknown>) => log("WARN",  msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("ERROR", msg, data),

  req: (method: string, path: string, data?: Record<string, unknown>) =>
    log("INFO", `${method} ${path}`, data),
};

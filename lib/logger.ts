// Vercel has built-in logging — just use console.log with structured format
// These appear in Vercel Dashboard → Logs

export const log = {
    info: (msg: string, data?: any) => {
      console.log(JSON.stringify({ level: "INFO", msg, data, ts: new Date().toISOString() }));
    },
    error: (msg: string, error?: any) => {
      console.error(JSON.stringify({ level: "ERROR", msg, error: error?.message || error, ts: new Date().toISOString() }));
    },
    warn: (msg: string, data?: any) => {
      console.warn(JSON.stringify({ level: "WARN", msg, data, ts: new Date().toISOString() }));
    },
  };
  
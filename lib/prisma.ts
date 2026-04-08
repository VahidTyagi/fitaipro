// TEMPORARY Prisma disable (no DB yet)

let prisma: any = null;

if (process.env.NODE_ENV === "development") {
  console.warn("⚠️ Prisma is disabled (no database configured)");
}

export { prisma };
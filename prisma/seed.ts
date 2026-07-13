/**
 * Database seed script.
 *
 * Seeds:
 *   1. A demo admin user (credentials come from env, default admin@example.com / admin123).
 *   2. A batch of realistic dummy projects.
 *
 * Project rows are generated locally (deterministic-ish) so the seed works
 * offline. The generator mirrors the shape you'd get from a public mock API
 * such as JSONPlaceholder / Mockaroo, so swapping in a real fetch later is easy.
 *
 * Run with:  npm run db:seed
 */
import { PrismaClient, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEAM_MEMBERS = [
  "Ava Thompson",
  "Liam Chen",
  "Sofia Rossi",
  "Noah Patel",
  "Mia Garcia",
  "Lucas Müller",
  "Emma Johansson",
  "Omar Haddad",
];

const PROJECT_NAMES = [
  "Website Redesign",
  "Mobile App v2",
  "Billing Migration",
  "Customer Portal",
  "Analytics Pipeline",
  "Marketing Site",
  "Internal Design System",
  "Payments Integration",
  "Onboarding Revamp",
  "Data Warehouse",
  "Search Overhaul",
  "Notification Service",
  "Admin Dashboard",
  "API Gateway",
  "Realtime Chat",
  "Reporting Suite",
  "Inventory Sync",
  "SSO Rollout",
  "Support Widget",
  "Growth Experiments",
];

const STATUSES: ProjectStatus[] = [
  ProjectStatus.ACTIVE,
  ProjectStatus.ON_HOLD,
  ProjectStatus.COMPLETED,
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(12, 0, 0, 0);
  return d;
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  // ---- Demo user -----------------------------------------------------------
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Demo Admin",
      password: passwordHash,
    },
  });
  console.log(`✔ Seeded admin user: ${adminEmail} / ${adminPassword}`);

  // ---- Projects ------------------------------------------------------------
  // Start from a clean slate so re-seeding is idempotent.
  await prisma.project.deleteMany();

  const rows = PROJECT_NAMES.map((name, i) => ({
    name,
    status: pick(STATUSES, i),
    assignedTo: pick(TEAM_MEMBERS, i),
    deadline: futureDate(randomInt(-30, 120)),
    budget: randomInt(5, 120) * 1000,
    description: `${name} — tracked workstream for the ${pick(
      ["platform", "growth", "core", "infra"],
      i,
    )} team.`,
  }));

  await prisma.project.createMany({ data: rows });
  console.log(`✔ Seeded ${rows.length} projects`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

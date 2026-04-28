import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

dotenv.config();

const prisma = new PrismaClient();

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
async function main() {
  await prisma.generation.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("Admin12345!", 12),
      role: "admin"
    }
  });

  await prisma.template.createMany({
    data: [
      {
        title: "Modern SaaS Landing Page",
        slug: "modern-saas-landing-page",
        category: "SaaS",
        description:
          "A clean conversion-focused SaaS homepage template for startups and software products.",
        tags: ["saas", "landing", "modern"],
        price: 29,
        status: "Published",
        previewImage: "",
        downloadUrl: "",
        features: ["Hero section", "Pricing", "Testimonials", "CTA"]
      },
      {
        title: "Premium Restaurant Website",
        slug: "premium-restaurant-website",
        category: "Restaurant",
        description:
          "A premium restaurant website structure with menu, booking, and story sections.",
        tags: ["restaurant", "food", "premium"],
        price: 19,
        status: "Published",
        previewImage: "",
        downloadUrl: "",
        features: ["Menu", "Booking", "Gallery", "Reviews"]
      },
      {
        title: "AI Agency Portfolio",
        slug: "ai-agency-portfolio",
        category: "Agency",
        description:
          "A bold agency template for AI studios, design teams, and digital service providers.",
        tags: ["agency", "portfolio", "ai"],
        price: 39,
        status: "Draft",
        previewImage: "",
        downloadUrl: "",
        features: ["Case studies", "Services", "Team", "Contact"]
      }
    ]
  });

  console.log("Seed completed successfully");
  console.log("Admin email: admin@example.com");
  console.log("Admin password: Admin12345!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
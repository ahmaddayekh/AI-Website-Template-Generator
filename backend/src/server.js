import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { generateTemplateWithAI } from "./lib/templateGenerator.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FREE_GENERATION_LIMIT = 5;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);


app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const customerId = session.metadata?.customerId;
        const stripeSubscriptionId = session.subscription;
        const stripeCustomerId = session.customer;

        if (customerId) {
          await prisma.customer.update({
            where: {
              id: customerId
            },
            data: {
              planType: "Pro",
              trialLimit: 100,
              stripeCustomerId,
              stripeSubscriptionId,
              subscriptionStatus: "active"
            }
          });
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;

        await prisma.customer.updateMany({
          where: {
            stripeSubscriptionId: subscription.id
          },
          data: {
            planType: "Free",
            trialLimit: 5,
            subscriptionStatus: "canceled"
          }
        });
      }

      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object;

        if (subscription.status !== "active") {
          await prisma.customer.updateMany({
            where: {
              stripeSubscriptionId: subscription.id
            },
            data: {
              planType: "Free",
              trialLimit: 5,
              subscriptionStatus: subscription.status
            }
          });
        }

        if (subscription.status === "active") {
          await prisma.customer.updateMany({
            where: {
              stripeSubscriptionId: subscription.id
            },
            data: {
              planType: "Pro",
              trialLimit: 100,
              subscriptionStatus: "active"
            }
          });
        }
      }

      res.json({
        received: true
      });
    } catch (error) {
      console.error("Webhook handler error:", error);

      res.status(500).json({
        message: "Webhook handler failed",
        error: error.message
      });
    }
  }
);

app.use(express.json());

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}

function fallbackAIResult(data) {
  const pages = (data.pages || "Home, About, Services, Pricing, Contact")
    .split(",")
    .map((page) => page.trim())
    .filter(Boolean);

  return {
    websiteName: `${data.brandName} Website Template`,
    shortDescription: `A ${data.style} website template for ${data.businessType} brands.`,
    designDirection: `${data.style} website for a ${data.businessType} business using ${data.colors}.`,
    targetAudience: [
      `${data.businessType} owners`,
      "Small business teams",
      "Digital-first brands"
    ],
    pages,
    homepageSections: [
      {
        title: "Hero Section",
        content: `A strong conversion-focused hero section for ${data.brandName} with a clear headline, short supporting text, and a strong call-to-action.`
      },
      {
        title: "Problem / Solution Section",
        content:
          "A section explaining the customer pain point and how the business solves it in a simple and trustworthy way."
      },
      {
        title: "Benefits Section",
        content:
          "Three to six benefit cards explaining why the customer should choose this business."
      },
      {
        title: "Services / Features Section",
        content:
          "A clean card-based section showing the main services, offers, or product features."
      },
      {
        title: "Social Proof Section",
        content:
          "Testimonials, review cards, client logos, or success metrics to build trust."
      },
      {
        title: "Final CTA Section",
        content:
          "A strong final call-to-action designed to convert the visitor into a lead or customer."
      }
    ],
    suggestedFeatures: [
      "Responsive layout",
      "SEO-ready structure",
      "Reusable components",
      "Conversion-focused sections",
      "Modern landing page flow"
    ],
    seo: {
      title: `${data.brandName} | ${data.businessType} Website Template`,
      description: `A ${data.style} website template for ${data.businessType} brands.`
    },
    suggestedPrice: 29
  };
}
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });

    res.json({
      status: "ok",
      message: "Backend and MongoDB are running"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Backend is running, but MongoDB is not connected",
      error: error.message
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

app.get("/api/templates/public", async (req, res) => {
  const templates = await prisma.template.findMany({
    where: {
      status: "Published"
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(templates);
});

app.get("/api/templates/admin", protect, adminOnly, async (req, res) => {
  const templates = await prisma.template.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json(templates);
});

app.post("/api/templates", protect, adminOnly, async (req, res) => {
  try {
    const template = await prisma.template.create({
      data: {
        title: req.body.title,
        slug: req.body.slug || slugify(req.body.title),
        category: req.body.category,
        description: req.body.description || "",
        tags: req.body.tags || [],
        price: Number(req.body.price || 0),
        status: req.body.status || "Draft",
        previewImage: req.body.previewImage || "",
        downloadUrl: req.body.downloadUrl || "",
        features: req.body.features || []
      }
    });

    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

app.put("/api/templates/:id", protect, adminOnly, async (req, res) => {
  try {
    const template = await prisma.template.update({
      where: {
        id: req.params.id
      },
      data: {
        title: req.body.title,
        category: req.body.category,
        description: req.body.description || "",
        tags: req.body.tags || [],
        price: Number(req.body.price || 0),
        status: req.body.status || "Draft",
        previewImage: req.body.previewImage || "",
        downloadUrl: req.body.downloadUrl || "",
        features: req.body.features || []
      }
    });

    res.json(template);
  } catch {
    res.status(404).json({
      message: "Template not found"
    });
  }
});

app.delete("/api/templates/:id", protect, adminOnly, async (req, res) => {
  try {
    await prisma.template.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({
      message: "Template deleted"
    });
  } catch {
    res.status(404).json({
      message: "Template not found"
    });
  }
});

app.post("/api/generate", protectCustomer, async (req, res) => {
  try {
    const { businessType, brandName, style, colors, pages } = req.body;

    const usedGenerations = await prisma.generation.count({
      where: {
        customerId: req.customer.id
      }
    });

    if (
      req.customer.planType === "Free" &&
      usedGenerations >= req.customer.trialLimit
    ) {
      return res.status(403).json({
        message: "Free trial limit reached"
      });
    }

    const parsedPages =
      typeof pages === "string"
        ? pages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : Array.isArray(pages)
          ? pages.filter(Boolean)
          : [];

    const safeInput = {
      businessType: businessType?.trim() || "Business",
      brandName: brandName?.trim() || "Untitled Brand",
      style: style?.trim() || "Modern, clean, premium",

      // Important: do NOT force blue/navy here anymore.
      // Let the AI/fallback decide based on the business.
      colors: colors?.trim() || "",

      // Important: empty pages means "generate pages dynamically".
      pages: parsedPages
    };

    const aiResult = await generateTemplateWithAI({
      businessType: businessType || "Business",
      brandName: brandName || "Untitled Brand",
      style: style || "",
      colors: colors || "",
      pages: parsedPages
    });

    const trialNumber = usedGenerations + 1;

    const createdGeneration = await prisma.generation.create({
      data: {
        customerId: req.customer.id,
        customerEmail: req.customer.email,

        brandName: brandName || "Untitled Brand",
        businessType: businessType || "Business",
        style: style || "Modern",
        colors: colors || "Blue, white, dark navy",

        pages: aiResult?.pages?.length
          ? aiResult.pages.join(", ")
          : parsedPages?.length
            ? parsedPages.join(", ")
            : "",

        trialNumber,
        planType: req.customer.planType || "Free",
        result: aiResult
      }
    });

    const newUsedGenerations = usedGenerations + 1;

    const generationLimit = req.customer.trialLimit || 5;

    const remainingGenerations = Math.max(
      generationLimit - newUsedGenerations,
      0
    );

    res.json({
      message: "Template generated successfully",
      generation: createdGeneration,
      result: aiResult,
      usage: {
        usedGenerations: newUsedGenerations,
        remainingGenerations,
        freeLimit: generationLimit,
        limitReached: remainingGenerations <= 0
      }
    });
  } catch (error) {
    console.error("Generate template error:", error);

    return res.status(500).json({
      message: "Failed to generate template",
      error: error.message
    });
  }
});

app.get("/api/generate/admin", protect, adminOnly, async (req, res) => {
  const generations = await prisma.generation.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100
  });

  res.json(generations);
});

app.post(
  "/api/generate/:id/convert-to-template",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const generation = await prisma.generation.findUnique({
        where: {
          id: req.params.id
        }
      });

      if (!generation) {
        return res.status(404).json({
          message: "Generation not found"
        });
      }

      if (generation.converted) {
        return res.status(400).json({
          message: "This generation is already converted"
        });
      }

      const result = generation.result;

      const template = await prisma.template.create({
        data: {
          title: result.websiteName || `${generation.brandName} Template`,
          slug: slugify(result.websiteName || `${generation.brandName} Template`),
          category: generation.businessType,
          description:
            result.shortDescription ||
            result.seo?.description ||
            "Generated website template.",
          tags: [
            generation.businessType,
            generation.style,
            "ai-generated"
          ].filter(Boolean),
          price: Number(result.suggestedPrice || 29),
          status: "Draft",
          previewImage: "",
          downloadUrl: "",
          features: result.suggestedFeatures || []
        }
      });

      await prisma.generation.update({
        where: {
          id: generation.id
        },
        data: {
          converted: true,
          convertedTemplateId: template.id
        }
      });

      res.status(201).json({
        message: "Generation converted to template",
        template
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to convert generation",
        error: error.message
      });
    }
  }
);

app.get("/api/customer/usage", protectCustomer, async (req, res) => {
  try {
    const usedGenerations = await prisma.generation.count({
      where: {
        customerId: req.customer.id,
        planType: "Free"
      }
    });

    res.json({
      usedGenerations,
      remainingGenerations: Math.max(
        req.customer.trialLimit - usedGenerations,
        0
      ),
      freeLimit: req.customer.trialLimit,
      limitReached:
        req.customer.planType === "Free" &&
        usedGenerations >= req.customer.trialLimit
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load usage",
      error: error.message
    });
  }
});

app.post("/api/enterprise-leads", async (req, res) => {
  try {
    const { name, email, company, website, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required"
      });
    }

    const lead = await prisma.enterpriseLead.create({
      data: {
        name,
        email,
        company: company || "",
        website: website || "",
        message: message || "",
        source: "Enterprise Page",
        status: "New"
      }
    });

    res.status(201).json({
      message: "Enterprise request submitted",
      lead
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit enterprise request",
      error: error.message
    });
  }
});

app.get("/api/admin/overview", protect, adminOnly, async (req, res) => {
  try {
    const [templates, generations, leads, customers] = await Promise.all([
      prisma.template.findMany({
        orderBy: { createdAt: "desc" }
      }),

      prisma.generation.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      }),

      prisma.enterpriseLead.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      }),

      prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      })
    ]);

    const customersWithStats = customers.map((customer) => {
      const customerGenerations = generations.filter(
        (generation) => generation.customerId === customer.id
      );

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        planType: customer.planType,
        trialLimit: customer.trialLimit,
        subscriptionStatus: customer.subscriptionStatus,
        stripeCustomerId: customer.stripeCustomerId,
        stripeSubscriptionId: customer.stripeSubscriptionId,
        totalGenerations: customerGenerations.length,
        createdAt: customer.createdAt
      };
    });

    res.json({
      templates,
      generations,
      leads,
      customers: customersWithStats,
      stats: {
        totalTemplates: templates.length,
        publishedTemplates: templates.filter(
          (item) => item.status === "Published"
        ).length,
        totalGenerations: generations.length,
        totalLeads: leads.length,
        totalCustomers: customers.length,
        proCustomers: customers.filter((customer) => customer.planType === "Pro")
          .length,
        freeCustomers: customers.filter(
          (customer) => customer.planType === "Free"
        ).length
      }
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    res.status(500).json({
      message: "Failed to load admin overview",
      error: error.message
    });
  }
});

async function protectCustomer(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Customer not authenticated"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "temporary_secret_change_this"
    );

    const customer = await prisma.customer.findUnique({
      where: {
        id: decoded.id
      }
    });

    if (!customer) {
      return res.status(401).json({
        message: "Customer not found"
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Customer authentication failed"
    });
  }
}

app.post("/api/customer-auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        email
      }
    });

    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        planType: "Free",
        trialLimit: 5
      }
    });

    const token = jwt.sign(
      {
        id: customer.id,
        type: "customer"
      },
      process.env.JWT_SECRET || "temporary_secret_change_this",
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        planType: customer.planType,
        trialLimit: customer.trialLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
});

app.post("/api/customer-auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await prisma.customer.findUnique({
      where: {
        email
      }
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(password, customer.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: customer.id,
        type: "customer"
      },
      process.env.JWT_SECRET || "temporary_secret_change_this",
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        planType: customer.planType,
        trialLimit: customer.trialLimit
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

app.get("/api/customer-auth/me", protectCustomer, async (req, res) => {
  res.json({
    customer: {
      id: req.customer.id,
      name: req.customer.name,
      email: req.customer.email,
      planType: req.customer.planType,
      trialLimit: req.customer.trialLimit,
      subscriptionStatus: req.customer.subscriptionStatus
    }
  });
});

app.post("/api/payments/create-pro-checkout-session", protectCustomer, async (req, res) => {
  try {
    let customer = req.customer;

    if (!customer.stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: {
          customerId: customer.id
        }
      });

      customer = await prisma.customer.update({
        where: {
          id: customer.id
        },
        data: {
          stripeCustomerId: stripeCustomer.id
        }
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeCustomerId,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      client_reference_id: customer.id,
      metadata: {
        customerId: customer.id,
        planType: "Pro"
      }
    });

    res.json({
      url: session.url
    });
  } catch (error) {
    console.error("Create checkout error:", error);

    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message
    });
  }
});

app.patch("/api/admin/customers/:customerId/plan", protect, adminOnly, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { planType } = req.body;

    if (!["Free", "Pro"].includes(planType)) {
      return res.status(400).json({
        message: "Invalid plan type"
      });
    }

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId
      },
      data: {
        planType,
        trialLimit: planType === "Pro" ? 100 : 5,
        subscriptionStatus:
          planType === "Pro" ? "admin_activated" : "admin_downgraded"
      }
    });

    res.json({
      message: `Customer updated to ${planType}`,
      customer: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer plan",
      error: error.message
    });
  }
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
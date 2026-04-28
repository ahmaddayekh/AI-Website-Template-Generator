import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function getDynamicTemplateStrategy(input) {
  const businessType = String(input.businessType || "business").toLowerCase();
  const userPages = Array.isArray(input.pages) ? input.pages.filter(Boolean) : [];

  const hasUserPages = userPages.length > 0;

  if (businessType.includes("restaurant") || businessType.includes("food") || businessType.includes("cafe")) {
    return {
      pages: hasUserPages ? userPages : ["Home", "Menu", "Reservations", "Gallery", "Reviews", "Contact"],
      colors: input.colors || "Warm red, cream, charcoal, soft gold",
      tone: "warm, appetizing, elegant",
      sectionsByPage: {
        Home: ["Hero", "Featured Dishes", "Dining Experience", "Customer Reviews", "Reservation CTA"],
        Menu: ["Menu Categories", "Popular Dishes", "Chef Specials"],
        Reservations: ["Booking Form", "Opening Hours", "Location"],
        Gallery: ["Restaurant Gallery", "Food Photography"],
        Reviews: ["Customer Testimonials", "Ratings"],
        Contact: ["Contact Form", "Map", "Opening Hours"]
      }
    };
  }

  if (businessType.includes("saas") || businessType.includes("software") || businessType.includes("app")) {
    return {
      pages: hasUserPages ? userPages : ["Home", "Features", "Pricing", "Integrations", "Resources", "Contact"],
      colors: input.colors || "Deep navy, electric blue, white, soft gray",
      tone: "clean, technical, trustworthy",
      sectionsByPage: {
        Home: ["Hero", "Product Benefits", "Feature Preview", "Social Proof", "CTA"],
        Features: ["Feature Grid", "Workflow Section", "Use Cases"],
        Pricing: ["Pricing Cards", "Plan Comparison", "FAQ"],
        Integrations: ["Integration Grid", "API Section"],
        Resources: ["Articles", "Guides", "Downloads"],
        Contact: ["Demo Request Form", "Support Options"]
      }
    };
  }

  if (businessType.includes("gym") || businessType.includes("fitness") || businessType.includes("trainer")) {
    return {
      pages: hasUserPages ? userPages : ["Home", "Programs", "Trainers", "Memberships", "Schedule", "Contact"],
      colors: input.colors || "Black, neon green, white, dark gray",
      tone: "bold, energetic, motivational",
      sectionsByPage: {
        Home: ["Hero", "Programs Preview", "Transformation Results", "Trainer Highlight", "Join CTA"],
        Programs: ["Program Cards", "Training Levels", "Benefits"],
        Trainers: ["Trainer Profiles", "Certifications"],
        Memberships: ["Membership Plans", "Benefits Comparison"],
        Schedule: ["Class Schedule", "Booking CTA"],
        Contact: ["Contact Form", "Location", "Opening Hours"]
      }
    };
  }

  if (businessType.includes("real estate") || businessType.includes("property")) {
    return {
      pages: hasUserPages ? userPages : ["Home", "Listings", "Property Details", "Agents", "Sell With Us", "Contact"],
      colors: input.colors || "White, navy, gold, soft beige",
      tone: "premium, trustworthy, professional",
      sectionsByPage: {
        Home: ["Hero Search", "Featured Listings", "Why Choose Us", "Market Stats", "CTA"],
        Listings: ["Property Grid", "Filters", "Featured Properties"],
        "Property Details": ["Image Gallery", "Property Info", "Amenities", "Agent Contact"],
        Agents: ["Agent Profiles", "Experience Stats"],
        "Sell With Us": ["Selling Process", "Valuation CTA"],
        Contact: ["Contact Form", "Office Location"]
      }
    };
  }

  if (businessType.includes("agency") || businessType.includes("marketing") || businessType.includes("design")) {
    return {
      pages: hasUserPages ? userPages : ["Home", "Services", "Work", "Case Studies", "Process", "Contact"],
      colors: input.colors || "Black, white, violet, soft gray",
      tone: "creative, premium, strategic",
      sectionsByPage: {
        Home: ["Hero", "Selected Work", "Services Preview", "Client Logos", "CTA"],
        Services: ["Service Cards", "Capabilities", "Benefits"],
        Work: ["Portfolio Grid", "Project Highlights"],
        "Case Studies": ["Case Study Cards", "Results Metrics"],
        Process: ["Process Timeline", "Collaboration Steps"],
        Contact: ["Project Inquiry Form", "Contact Info"]
      }
    };
  }

  if (businessType.includes("ecommerce") || businessType.includes("store") || businessType.includes("shop")) {
    return {
      pages: hasUserPages ? userPages : ["Home", "Shop", "Product Details", "Collections", "Cart", "Contact"],
      colors: input.colors || "White, black, soft gray, accent color",
      tone: "clean, commercial, product-focused",
      sectionsByPage: {
        Home: ["Hero", "Featured Products", "Collections", "Benefits", "Newsletter"],
        Shop: ["Product Grid", "Filters", "Sort Controls"],
        "Product Details": ["Product Gallery", "Product Info", "Reviews", "Related Products"],
        Collections: ["Collection Cards", "Seasonal Picks"],
        Cart: ["Cart Items", "Order Summary"],
        Contact: ["Contact Form", "Support Info"]
      }
    };
  }

  return {
    pages: hasUserPages ? userPages : ["Home", "Services", "Solutions", "Why Us", "Contact"],
    colors: input.colors || "Slate, white, dark navy, soft blue",
    tone: "modern, clean, professional",
    sectionsByPage: {
      Home: ["Hero", "Benefits", "Services Preview", "Trust Section", "CTA"],
      Services: ["Service Cards", "Process", "Benefits"],
      Solutions: ["Solution Overview", "Use Cases"],
      "Why Us": ["Value Proposition", "Stats", "Testimonials"],
      Contact: ["Contact Form", "Contact Details"]
    }
  };
}

function cleanJsonText(text = "") {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

function makeComponentName(name = "GeneratedSection") {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function suggestPagesForBusiness(businessType = "") {
  const type = businessType.toLowerCase();

  if (type.includes("saas") || type.includes("software") || type.includes("app")) {
    return ["Home", "Features", "Solutions", "Pricing", "Case Studies", "Resources", "Contact"];
  }

  if (type.includes("restaurant") || type.includes("cafe") || type.includes("food")) {
    return ["Home", "Menu", "About", "Reservations", "Gallery", "Reviews", "Contact"];
  }

  if (type.includes("real estate") || type.includes("property")) {
    return ["Home", "Properties", "Services", "Agents", "Neighborhoods", "About", "Contact"];
  }

  if (type.includes("clinic") || type.includes("health") || type.includes("medical") || type.includes("doctor")) {
    return ["Home", "Services", "Doctors", "Appointments", "Insurance", "Patient Reviews", "Contact"];
  }

  if (type.includes("agency") || type.includes("marketing") || type.includes("design")) {
    return ["Home", "Services", "Work", "Process", "Pricing", "About", "Contact"];
  }

  if (type.includes("ecommerce") || type.includes("store") || type.includes("shop")) {
    return ["Home", "Shop", "Collections", "Best Sellers", "About", "FAQs", "Contact"];
  }

  if (type.includes("fitness") || type.includes("gym")) {
    return ["Home", "Programs", "Trainers", "Memberships", "Success Stories", "Schedule", "Contact"];
  }

  if (type.includes("education") || type.includes("course") || type.includes("school")) {
    return ["Home", "Courses", "Programs", "Instructors", "Admissions", "Resources", "Contact"];
  }

  return ["Home", "Services", "About", "Process", "Testimonials", "Pricing", "Contact"];
}

function suggestPaletteForBusiness(businessType = "", requestedColors = "") {
  if (requestedColors && requestedColors.trim()) {
    return {
      description: requestedColors,
      primary: requestedColors,
      direction: "Use the user requested color direction."
    };
  }

  const type = businessType.toLowerCase();

  if (type.includes("saas") || type.includes("software") || type.includes("app")) {
    return {
      description: "Electric blue, violet, white, and deep navy",
      primary: "Electric blue",
      direction: "Modern tech palette with high contrast and premium SaaS feeling."
    };
  }

  if (type.includes("restaurant") || type.includes("cafe") || type.includes("food")) {
    return {
      description: "Warm cream, espresso brown, terracotta, and soft gold",
      primary: "Terracotta",
      direction: "Warm hospitality palette that feels premium, cozy, and appetizing."
    };
  }

  if (type.includes("real estate") || type.includes("property")) {
    return {
      description: "Charcoal, ivory, muted gold, and sage green",
      primary: "Muted gold",
      direction: "Luxury property palette with trust, elegance, and stability."
    };
  }

  if (type.includes("clinic") || type.includes("health") || type.includes("medical")) {
    return {
      description: "Clean white, medical blue, soft teal, and light gray",
      primary: "Medical blue",
      direction: "Clean healthcare palette focused on trust, safety, and clarity."
    };
  }

  if (type.includes("agency") || type.includes("marketing") || type.includes("design")) {
    return {
      description: "Black, white, vibrant purple, and soft gradient accents",
      primary: "Vibrant purple",
      direction: "Creative premium palette with bold visual impact."
    };
  }

  if (type.includes("ecommerce") || type.includes("store") || type.includes("shop")) {
    return {
      description: "White, charcoal, soft beige, and energetic accent color",
      primary: "Charcoal",
      direction: "Conversion-focused shopping palette that keeps products clear."
    };
  }

  return {
    description: "White, charcoal, soft gray, and one bold accent color",
    primary: "Bold accent color",
    direction: "Flexible business palette generated based on the brand type."
  };
}

function createSectionCode({ sectionTitle, brandName, businessType, style, palette }) {
  const componentName = makeComponentName(sectionTitle) || "GeneratedSection";

  return `export default function ${componentName}() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
          ${businessType}
        </p>

        <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
          ${sectionTitle} for ${brandName}
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          A ${style.toLowerCase()} section designed specifically for a ${businessType.toLowerCase()} website.
          This section uses a ${palette.description.toLowerCase()} visual direction to match the business type.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {["Clear value", "Premium layout", "Conversion focused"].map((item) => (
            <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h3 className="text-xl font-black text-slate-950">{item}</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Tailored content block for ${brandName}, built to make the page feel real and useful.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`;
}

function fallbackTemplate(input) {
  const brandName = input.brandName || "Untitled Brand";
  const businessType = input.businessType || "Business";
  const style = input.style || "Modern, clean, premium";

  const pages = Array.isArray(input.pages) && input.pages.length
    ? input.pages
    : suggestPagesForBusiness(businessType);

  const palette = suggestPaletteForBusiness(businessType, input.colors);

  const sectionTitles = pages.flatMap((page) => {
    const lowerPage = page.toLowerCase();

    if (lowerPage.includes("home")) {
      return ["Hero Section", "Problem Solution Section", "Featured Benefits Section"];
    }

    if (lowerPage.includes("pricing") || lowerPage.includes("membership")) {
      return ["Pricing Plans Section", "Plan Comparison Section"];
    }

    if (lowerPage.includes("services") || lowerPage.includes("features") || lowerPage.includes("solutions")) {
      return ["Services Overview Section", "Feature Cards Section"];
    }

    if (lowerPage.includes("about")) {
      return ["Brand Story Section", "Team Values Section"];
    }

    if (lowerPage.includes("contact") || lowerPage.includes("reservation") || lowerPage.includes("appointment")) {
      return ["Contact Form Section", "Call To Action Section"];
    }

    if (lowerPage.includes("menu")) {
      return ["Menu Categories Section", "Featured Dishes Section"];
    }

    if (lowerPage.includes("shop") || lowerPage.includes("collection")) {
      return ["Product Grid Section", "Featured Collection Section"];
    }

    if (lowerPage.includes("property") || lowerPage.includes("properties")) {
      return ["Property Listings Section", "Property Search Section"];
    }

    return [`${page} Overview Section`, `${page} Details Section`];
  });

  const uniqueSectionTitles = [...new Set(sectionTitles)].slice(0, 12);

  const sections = uniqueSectionTitles.map((sectionTitle) => ({
    title: sectionTitle,
    page: pages.find((page) =>
      sectionTitle.toLowerCase().includes(page.toLowerCase())
    ) || "General",
    purpose: `A ${style.toLowerCase()} ${sectionTitle.toLowerCase()} created for ${brandName}, a ${businessType} business.`,
    code: createSectionCode({
      sectionTitle,
      brandName,
      businessType,
      style,
      palette
    })
  }));

  const componentName =
    makeComponentName(brandName) || "GeneratedWebsiteTemplate";

  const fullPageCode = `export default function ${componentName}Website() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-slate-300">
            ${businessType}
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            ${brandName}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A ${style.toLowerCase()} website template using ${palette.description.toLowerCase()}.
          </p>
          <button className="mt-10 rounded-full bg-white px-8 py-4 font-bold text-slate-950">
            Get Started
          </button>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          ${pages
      .map(
        (page) => `<div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-black">${page}</h2>
            <p className="mt-3 text-slate-600">
              Custom ${page.toLowerCase()} page section for ${brandName}.
            </p>
          </div>`
      )
      .join("\n          ")}
        </div>
      </section>
    </main>
  );
}`;

  return {
    websiteName: `${brandName} Website Template`,
    description: `${style} website for a ${businessType} business using ${palette.description}.`,
    businessType,
    brandName,
    style,
    colorPalette: palette,
    pages,
    sections,
    fullPageCode,
    seo: {
      title: `${brandName} | ${businessType} Website`,
      description: `${style} ${businessType} website template using ${palette.description}.`
    }
  };
}

export async function generateTemplateWithAI(input) {
  try {
    if (process.env.USE_GEMINI !== "true") {
      console.log("Gemini disabled. Using fallback generator.");
      return fallbackTemplate(input);
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("No Gemini API key found. Using fallback generator.");
      return fallbackTemplate(input);
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const prompt = `
You are an expert senior React frontend developer and UI/UX designer.

Generate a real website template blueprint with usable React + Tailwind CSS code.

Return ONLY valid JSON. No markdown. No explanation.

The JSON must follow this exact structure:
{
  "websiteName": "string",
  "description": "string",
"pages": ["Dynamic pages based on the business type"],
"colorPalette": {
  "description": "string",
  "primary": "string",
  "direction": "string"
},  "sections": [
    {
      "title": "Hero Section",
      "purpose": "string",
      "code": "React Tailwind component code as string"
    }
  ],
  "fullPageCode": "Full React Tailwind page code as string",
  "seo": {
    "title": "string",
    "description": "string"
  }
}

Rules:
- Do NOT always use Home, About, Services, Pricing, Contact.
- Generate pages that make sense for the business type.
- If the user provided pages, use those exact pages.
- If the user did not provide pages, create the best page structure for that business.
- Do NOT always use blue/navy colors.
- If the user provided colors, follow those colors.
- If the user did not provide colors, choose a color palette that matches the business type.
- Generate at least 1 to 2 sections for every page.
- Every section must include real React + Tailwind CSS code.
- Code must be clean and copy-paste ready.
- Do not include external images.
- Use Tailwind classes only.
- No markdown code fences.
- No comments outside JSON.

Business Type: ${input.businessType}
Brand Name: ${input.brandName}
Style: ${input.style}
Colors: ${input.colors}
Pages requested by user: ${
  Array.isArray(input.pages) && input.pages.length
    ? input.pages.join(", ")
    : "No fixed pages requested. Generate pages dynamically based on the business type."
}

Color direction requested by user: ${
  input.colors && input.colors.trim()
    ? input.colors
    : "No fixed colors requested. Generate a suitable palette based on the business type."
}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });

    const text =
      typeof response.text === "function"
        ? response.text()
        : response.text || "";

    const cleaned = cleanJsonText(text);

    if (!cleaned) {
      console.log("Gemini returned empty text. Using fallback generator.");
      return fallbackTemplate(input);
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini generation error:", error);
    return fallbackTemplate(input);
  }
}
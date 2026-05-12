import { useEffect, useState } from "react";
import { api } from "./lib/api";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

function getCustomerSessionId() {
  const existingId = localStorage.getItem("customerSessionId");

  if (existingId) {
    return existingId;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem("customerSessionId", newId);

  return newId;
}

function App() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/enterprise" element={<Enterprise />} />

        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/signup" element={<CustomerSignup />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            localStorage.getItem("adminToken") ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </div>
  );
}


function CustomerSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSignup(e) {
    e.preventDefault();

    try {
      const response = await api.post("/customer-auth/signup", form);

      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem(
        "customer",
        JSON.stringify(response.data.customer)
      );

      navigate("/generator");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-6 py-12">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
      >
        <h1 className="text-4xl font-black tracking-[-0.05em]">
          Create Account
        </h1>

        <p className="mt-3 text-slate-600">
          Create an account to start generating AI website templates.
        </p>

        <div className="mt-8 space-y-5">
          <Input
            label="Name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white"
          >
            Sign Up
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-slate-950">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}

function CustomerLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("/customer-auth/login", form);

      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem(
        "customer",
        JSON.stringify(response.data.customer)
      );

      navigate("/generator");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-6 py-12">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
      >
        <h1 className="text-4xl font-black tracking-[-0.05em]">
          Customer Sign In
        </h1>

        <p className="mt-3 text-slate-600">
          Sign in to continue generating website templates.
        </p>

        <div className="mt-8 space-y-5">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => updateField("email", value)}
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-slate-600">
            No account yet?{" "}
            <Link to="/signup" className="font-black text-slate-950">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdminPage = location.pathname.startsWith("/admin");

  const customer = localStorage.getItem("customer")
    ? JSON.parse(localStorage.getItem("customer"))
    : null;

  function closeMenu() {
    setMenuOpen(false);
  }

  function logoutCustomer() {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");
    closeMenu();
    navigate("/login");
  }

  function logoutAdmin() {
    localStorage.removeItem("adminToken");
    closeMenu();
    navigate("/admin/login");
  }

  const mobileLinkClass =
    "block rounded-2xl px-4 py-3 text-base font-black text-slate-700 hover:bg-slate-100 hover:text-slate-950";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            onClick={closeMenu}
            className="max-w-[220px] text-base font-black leading-tight tracking-tight text-slate-950 sm:max-w-none sm:text-xl"
          >
            AI Website Template Generator
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-2xl font-black text-slate-950 lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          <div className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
            {!isAdminPage && (
              <>
                <Link className="hover:text-slate-950" to="/generator">
                  Generator
                </Link>

                <Link className="hover:text-slate-950" to="/templates">
                  Examples
                </Link>

                <Link className="hover:text-slate-950" to="/pricing">
                  Pricing
                </Link>

                <Link
                  className="rounded-full bg-slate-950 px-4 py-2 text-white"
                  to="/enterprise"
                >
                  Enterprise
                </Link>

                {customer ? (
                  <>
                    <span className="text-slate-500">{customer.name}</span>

                    <button
                      onClick={logoutCustomer}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 font-black text-slate-950"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="hover:text-slate-950" to="/login">
                      Sign In
                    </Link>

                    <Link
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 font-black text-slate-950"
                      to="/signup"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}

            {isAdminPage &&
              location.pathname !== "/admin/login" &&
              localStorage.getItem("adminToken") && (
                <button
                  onClick={logoutAdmin}
                  className="rounded-full bg-slate-950 px-4 py-2 font-black text-white"
                >
                  Admin Sign Out
                </button>
              )}
          </div>
        </div>

        {menuOpen && (
          <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 lg:hidden">
            {!isAdminPage && (
              <>
                <Link onClick={closeMenu} className={mobileLinkClass} to="/generator">
                  Generator
                </Link>

                <Link onClick={closeMenu} className={mobileLinkClass} to="/templates">
                  Examples
                </Link>

                <Link onClick={closeMenu} className={mobileLinkClass} to="/pricing">
                  Pricing
                </Link>

                <Link onClick={closeMenu} className={mobileLinkClass} to="/enterprise">
                  Enterprise
                </Link>

                <div className="my-3 border-t border-slate-200" />

                {customer ? (
                  <>
                    <div className="px-4 py-2 text-sm font-bold text-slate-500">
                      Signed in as {customer.name}
                    </div>

                    <button
                      onClick={logoutCustomer}
                      className="mt-2 w-full rounded-2xl bg-slate-950 px-4 py-3 font-black text-white"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link onClick={closeMenu} className={mobileLinkClass} to="/login">
                      Sign In
                    </Link>

                    <Link
                      onClick={closeMenu}
                      className="mt-2 block rounded-2xl bg-slate-950 px-4 py-3 text-center font-black text-white"
                      to="/signup"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}

            {isAdminPage &&
              location.pathname !== "/admin/login" &&
              localStorage.getItem("adminToken") && (
                <button
                  onClick={logoutAdmin}
                  className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-black text-white"
                >
                  Admin Sign Out
                </button>
              )}
          </div>
        )}
      </nav>
    </header>
  );
}
function Home() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-20">
      <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
            AI Website Builder Starter
          </span>

          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.07em] text-slate-950 md:text-7xl">
            Generate complete website template ideas with AI.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Create website structures, homepage sections, SEO text, design
            direction, and template concepts for different business types.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/generator"
              className="rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white shadow-xl shadow-slate-900/10"
            >
              Start Generating
            </Link>

            <Link
              to="/templates"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-950 shadow-sm"
            >
              View Templates
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <div className="mb-6 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">Business Type</p>
                <p className="font-bold">Premium Restaurant</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">AI Output</p>
                <p className="font-bold">
                  Hero, Menu, Story, Booking, Reviews, Final CTA
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 text-slate-950">
                <p className="text-sm text-slate-500">SEO Title</p>
                <p className="font-black">Premium Restaurant Website Template</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Generator() {

  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState("react");
  const customerToken = localStorage.getItem("customerToken");

  if (!customerToken) {
    return <Navigate to="/login" />;
  }

  const [form, setForm] = useState({
    customerEmail: "",
    businessType: "",
    brandName: "",
    style: "Modern, clean, premium",
    pages: "",
    colors: "",
  });

  

  const [usage, setUsage] = useState({
    usedGenerations: 0,
    remainingGenerations: 5,
    freeLimit: 5,
    limitReached: false
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    async function loadUsage() {
      try {
        const response = await api.get("/customer/usage");
        setUsage(response.data);
        setLimitReached(response.data.limitReached);
      } catch (error) {
        console.error(error);
      }
    }

    loadUsage();
  }, []);

  function updateField(field, value) {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value
    }));
  }

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleGenerate(e) {
    e.preventDefault();

    if (limitReached) {
      navigate("/enterprise");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post("/generate", form);

      const rawResult = response.data.result || {};

      const normalizedResult = {
        websiteName: rawResult.websiteName || `${form.brandName || "Generated"} Website Template`,

        designDirection:
          rawResult.designDirection ||
          rawResult.description ||
          "A clean, modern, conversion-focused website template.",

        pages: rawResult.pages || ["Home", "About", "Services", "Pricing", "Contact"],

        homepageSections:
          rawResult.homepageSections ||
          rawResult.sections?.map((section) => ({
            title: section.title,
            content: section.content || section.purpose || "Generated website section.",
            code:
              typeof section.code === "string"
                ? {
                  react: section.code,
                  html: "HTML version not generated yet.",
                  css: "CSS version not generated yet."
                }
                : section.code || {
                  react: "No React code generated.",
                  html: "No HTML code generated.",
                  css: "No CSS code generated."
                }
          })) ||
          [],

        suggestedFeatures: rawResult.suggestedFeatures || [],

        seo: rawResult.seo || {
          title: `${form.brandName || "Generated"} Website`,
          description: "AI-generated website template."
        }
      };

      setResult(normalizedResult);

      if (response.data.usage) {
        setUsage(response.data.usage);
        setLimitReached(response.data.usage.remainingGenerations <= 0);
      } else {
        setUsage((previousUsage) => {
          const updatedUsed = previousUsage.usedGenerations + 1;
          const updatedRemaining = Math.max(previousUsage.freeLimit - updatedUsed, 0);

          return {
            ...previousUsage,
            usedGenerations: updatedUsed,
            remainingGenerations: updatedRemaining,
            limitReached: updatedRemaining <= 0
          };
        });
      }
    } catch (error) {
      if (error.response?.data?.limitReached) {
        setLimitReached(true);
        navigate("/enterprise");
        return;
      }

      alert(error.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:rounded-[2rem] sm:p-8">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">
            Free Trial Usage
          </p>
          <p className="mt-1 text-sm text-slate-600">
            You used {usage.usedGenerations} of {usage.freeLimit} free
            generations.
          </p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-950"
              style={{
                width: `${Math.min(
                  (usage.usedGenerations / usage.freeLimit) * 100,
                  100
                )}%`
              }}
            />
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">
          Generate Your Website Template
        </h1>

        <p className="mt-3 leading-7 text-slate-600">
          Describe your business and get an AI-generated website blueprint.
          You get {usage.freeLimit} free generations before upgrading.
        </p>

        {limitReached && (
          <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <h3 className="font-black text-orange-900">
              Free trial limit reached
            </h3>
            <p className="mt-2 text-sm leading-6 text-orange-800">
              You have used all free generations. Upgrade or contact enterprise
              to continue generating websites.
            </p>

            <div className="mt-4 flex gap-3">
              <Link
                to="/pricing"
                className="rounded-xl bg-orange-900 px-4 py-3 text-sm font-black text-white"
              >
                View Pricing
              </Link>

              <Link
                to="/enterprise"
                className="rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-900"
              >
                Contact Enterprise
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="mt-8 space-y-5">
          <Input
            label="Email Optional"
            type="email"
            value={form.customerEmail}
            onChange={(value) => updateField("customerEmail", value)}
            placeholder="you@example.com"
            required={false}
          />

          <Input
            label="Business Type"
            value={form.businessType}
            onChange={(value) => updateField("businessType", value)}
            placeholder="SaaS, restaurant, clinic, agency, portfolio..."
          />

          <Input
            label="Brand Name"
            value={form.brandName}
            onChange={(value) => updateField("brandName", value)}
            placeholder="NovaUI"
          />

          <Input
            label="Style"
            value={form.style}
            onChange={(value) => updateField("style", value)}
            placeholder="Modern, luxury, playful, minimal, dark..."
          />

          <Input
            label="Colors"
            value={form.colors}
            onChange={(value) => updateField("colors", value)}
            placeholder="Let AI choose, or write: blue, white, dark navy"
          />

          <Input
            label="Pages"
            value={form.pages}
            onChange={(value) => updateField("pages", value)}
            placeholder="Let AI choose, or write: Home, Pricing, Dashboard, Contact"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white shadow-xl shadow-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Generating..."
              : limitReached
                ? "Upgrade to Continue"
                : "Generate Website Template"}
          </button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">
          Generated Website Blueprint
        </h2>

        {!result && (
          <p className="mt-4 leading-7 text-slate-600">
            Your generated website blueprint will appear here.
          </p>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-2xl font-black">{result.websiteName}</h3>
              <p className="mt-2 leading-7 text-slate-600">
                {result.designDirection}
              </p>
            </div>

            <div>
              <h4 className="mb-3 font-black">Pages</h4>
              <div className="flex flex-wrap gap-2">
                {result.pages?.map((page, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"
                  >
                    {page}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-black">Homepage Sections</h4>

              <div className="space-y-4">
                {result.homepageSections?.map((section, index) => {
                  const sectionKey = `${section.title}-${index}`;
                  const isOpen = selectedSection === sectionKey;

                  return (
                    <div
                      key={sectionKey}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <strong>{section.title}</strong>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {section.content}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSection(isOpen ? null : sectionKey)
                          }
                          className="w-full shrink-0 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white sm:w-auto"
                        >
                          {isOpen ? "Hide Code" : "Show Code"}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white">
                          <div className="mb-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveCodeTab("react")}
                              className={`rounded-xl px-4 py-2 text-sm font-black ${activeCodeTab === "react"
                                ? "bg-white text-slate-950"
                                : "bg-white/10 text-white"
                                }`}
                            >
                              React
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveCodeTab("html")}
                              className={`rounded-xl px-4 py-2 text-sm font-black ${activeCodeTab === "html"
                                ? "bg-white text-slate-950"
                                : "bg-white/10 text-white"
                                }`}
                            >
                              HTML
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveCodeTab("css")}
                              className={`rounded-xl px-4 py-2 text-sm font-black ${activeCodeTab === "css"
                                ? "bg-white text-slate-950"
                                : "bg-white/10 text-white"
                                }`}
                            >
                              CSS
                            </button>
                          </div>

                          <pre className="max-h-[420px] overflow-auto rounded-xl bg-black p-4 text-sm leading-6 text-slate-100">
                            <code>
                              {activeCodeTab === "react"
                                ? section.code?.react || "No React code generated for this section yet."
                                : activeCodeTab === "html"
                                  ? section.code?.html || "No HTML code generated for this section yet."
                                  : section.code?.css || "No CSS code generated for this section yet."}
                            </code>
                          </pre>

                          <button
                            type="button"
                            onClick={() => {
                              const codeToCopy =
                                activeCodeTab === "react"
                                  ? section.code?.react
                                  : activeCodeTab === "html"
                                    ? section.code?.html
                                    : section.code?.css;

                              navigator.clipboard.writeText(codeToCopy || "");
                            }}
                            className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950"
                          >
                            Copy Code
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {result.suggestedFeatures?.length > 0 && (
              <div>
                <h4 className="mb-3 font-black">Suggested Features</h4>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <h4 className="font-black">SEO</h4>
              <p className="mt-2 text-sm text-slate-300">
                <strong className="text-white">Title:</strong>{" "}
                {result.seo?.title}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                <strong className="text-white">Description:</strong>{" "}
                {result.seo?.description}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await api.get("/templates/public");
        setTemplates(response.data || []);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load templates");
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">
          Template Marketplace
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Published templates loaded directly from MongoDB.
        </p>
      </div>

      {loading && <p className="text-slate-600">Loading templates...</p>}

      {!loading && templates.length === 0 && (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:rounded-[2rem] sm:p-8">
          <h2 className="text-2xl font-black">No published templates yet</h2>
          <p className="mt-2 text-slate-600">
            Go to the admin dashboard and publish a template.
          </p>
        </div>
      )}

      {!loading && templates.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template.id}
              className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 sm:rounded-[2rem]"
            >
              {template.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={template.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="grid h-48 place-items-center bg-slate-950 px-6 text-center text-white">
                  <p className="text-2xl font-black tracking-[-0.04em]">
                    {template.title}
                  </p>
                </div>
              )}

              <div className="p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                    {template.category || "Template"}
                  </span>

                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">
                    ${template.price || 0}
                  </span>
                </div>

                <h2 className="text-xl font-black tracking-[-0.03em]">
                  {template.title}
                </h2>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {template.description}
                </p>

                {template.features?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.features.slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                {template.downloadUrl && (
                  <a
                    href={template.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 block rounded-2xl bg-slate-950 px-5 py-3 text-center font-black text-white"
                  >
                    View Template
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "admin@example.com",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (adminToken) {
      navigate("/admin");
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", form);

      if (response.data.user.role !== "admin") {
        alert("This account is not an admin account.");
        return;
      }

      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.user));

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Admin login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-6 py-12">
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <h1 className="text-4xl font-black tracking-[-0.05em]">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="font-black">Email</label>
            <input
              className="mt-3 w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-slate-950"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value
                })
              }
            />
          </div>

          <div>
            <label className="font-black">Password</label>
            <input
              type="password"
              className="mt-3 w-full rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-slate-950"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value
                })
              }
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const [templates, setTemplates] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    tags: "",
    price: 0,
    status: "Draft",
    previewImage: "",
    downloadUrl: "",
    features: ""
  });
  const [stats, setStats] = useState({
    totalTemplates: 0,
    publishedTemplates: 0,
    totalGenerations: 0,
    totalLeads: 0,
    totalCustomers: 0,
    proCustomers: 0,
    freeCustomers: 0
  });
  const [editingId, setEditingId] = useState(null);

  async function loadAdminData() {
    try {
      const response = await api.get("/admin/overview");

      setTemplates(response.data.templates || []);
      setGenerations(response.data.generations || []);
      setLeads(response.data.leads || []);
      setCustomers(response.data.customers || []);

      setStats(
        response.data.stats || {
          totalTemplates: 0,
          publishedTemplates: 0,
          totalGenerations: 0,
          totalLeads: 0,
          totalCustomers: 0,
          proCustomers: 0,
          freeCustomers: 0
        }
      );
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load admin overview"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

 
  function resetForm() {
    setForm({
      title: "",
      category: "",
      description: "",
      tags: "",
      price: 0,
      status: "Draft",
      previewImage: "",
      downloadUrl: "",
      features: ""
    });

    setEditingId(null);
  }

  async function saveTemplate(e) {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price || 0),
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      features: form.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      if (editingId) {
        await api.put(`/templates/${editingId}`, payload);
      } else {
        await api.post("/templates", payload);
      }

      resetForm();
      await loadAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save template");
    }
  }

  function editTemplate(template) {
    setEditingId(template.id);

    setForm({
      title: template.title || "",
      category: template.category || "",
      description: template.description || "",
      tags: template.tags?.join(", ") || "",
      price: template.price || 0,
      status: template.status || "Draft",
      previewImage: template.previewImage || "",
      downloadUrl: template.downloadUrl || "",
      features: template.features?.join(", ") || ""
    });
  }

  async function deleteTemplate(id) {
    const confirmed = window.confirm("Delete this template?");

    if (!confirmed) return;

    try {
      await api.delete(`/templates/${id}`);
      await loadAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete template");
    }
  }
  async function convertGeneration(id) {
    try {
      await api.post(`/generate/${id}/convert-to-template`);
      await loadAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to convert generation");
    }
  }
  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-slate-600">Loading admin dashboard...</p>
      </main>
    );
  }
  async function updateCustomerPlan(customerId, planType) {
    try {
      await api.patch(`/admin/customers/${customerId}/plan`, {
        planType
      });

      await loadAdminData();
    } catch (error) {
      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update customer plan"
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-[-0.06em]">
          Admin Dashboard
        </h1>
        <p className="mt-3 text-slate-600">
          Manage templates, AI generations, prices, categories, and publishing
          status.
        </p>
      </div>

      <section className="mb-6 grid gap-5 md:grid-cols-3">
        <StatCard title="Total Templates" value={templates.length} />
        <StatCard
          title="Published"
          value={templates.filter((item) => item.status === "Published").length}
        />
        <StatCard title="AI Generations" value={generations.length} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={saveTemplate}
          className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
        >
          <h2 className="text-3xl font-black tracking-[-0.04em]">
            {editingId ? "Edit Template" : "Create Template"}
          </h2>

          <div className="mt-6 space-y-5">
            <Input
              label="Title"
              value={form.title}
              onChange={(value) => updateField("title", value)}
            />

            <Input
              label="Category"
              value={form.category}
              onChange={(value) => updateField("category", value)}
            />

            <label className="grid gap-2 font-bold">
              Description
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-950"
              />
            </label>

            <Input
              label="Tags"
              value={form.tags}
              onChange={(value) => updateField("tags", value)}
              placeholder="saas, modern, landing"
            />

            <Input
              label="Features"
              value={form.features}
              onChange={(value) => updateField("features", value)}
              placeholder="Hero section, Pricing, Testimonials"
            />

            <Input
              label="Preview Image URL"
              value={form.previewImage}
              onChange={(value) => updateField("previewImage", value)}
            />

            <Input
              label="Download URL"
              value={form.downloadUrl}
              onChange={(value) => updateField("downloadUrl", value)}
            />

            <Input
              label="Price"
              type="number"
              value={String(form.price)}
              onChange={(value) => updateField("price", value)}
            />

            <label className="grid gap-2 font-bold">
              Status
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-950"
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white"
              >
                {editingId ? "Update Template" : "Create Template"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <h2 className="text-3xl font-black tracking-[-0.04em]">
              All Templates
            </h2>

            <div className="mt-6 space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <strong>{template.title}</strong>
                    <p className="mt-1 text-sm text-slate-500">
                      {template.category} · {template.status} · $
                      {template.price}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editTemplate(template)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-black"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-black text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
              <h2 className="text-3xl font-black tracking-[-0.04em]">
                Customer Generations
              </h2>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-black tracking-[-0.04em]">
                      Customers
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      View customer plans, Stripe status, and generation usage.
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
                    {customers.length} total
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                  <div className="grid min-w-[1100px] grid-cols-6 bg-slate-950 px-4 py-3 text-sm font-black text-white">                    <span>Customer</span>
                    <span>Email</span>
                    <span>Plan</span>
                    <span>Status</span>
                    <span>Generations</span>
                    <span>Stripe</span>
                  </div>

                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="grid min-w-[1100px] grid-cols-6 items-center border-t border-slate-200 px-4 py-4 text-sm"
                    >
                      <div>
                        <p className="font-black text-slate-950">
                          {customer.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {customer.id}
                        </p>
                      </div>

                      <p className="text-slate-600">
                        {customer.email}
                      </p>

                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${customer.planType === "Pro"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {customer.planType}
                        </span>

                        <div className="mt-2 flex gap-2">
                          {customer.planType !== "Pro" && (
                            <button
                              onClick={() => updateCustomerPlan(customer.id, "Pro")}
                              className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white"
                            >
                              Make Pro
                            </button>
                          )}

                          {customer.planType !== "Free" && (
                            <button
                              onClick={() => updateCustomerPlan(customer.id, "Free")}
                              className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700"
                            >
                              Make Free
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600">
                        {customer.subscriptionStatus || "No subscription"}
                      </p>

                      <p className="font-black text-slate-950">
                        {customer.totalGenerations || 0} / {customer.trialLimit || 5}
                      </p>

                      <div className="text-xs text-slate-500">
                        {customer.stripeCustomerId ? (
                          <>
                            <p>Customer: {customer.stripeCustomerId}</p>
                            <p className="mt-1">
                              Sub: {customer.stripeSubscriptionId || "—"}
                            </p>
                          </>
                        ) : (
                          <p>No Stripe ID</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {customers.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      No customers yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {generations.slice(0, 8).map((generation) => (
                  <div
                    key={generation.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <strong>
                      {generation.result?.websiteName || generation.brandName}
                    </strong>

                    <p className="mt-1 text-sm text-slate-500">
                      {generation.businessType} · Trial #{generation.trialNumber || "Old record"}
                    </p>

                    {generation.customerEmail && (
                      <p className="mt-1 text-sm text-slate-500">
                        Email: {generation.customerEmail}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      Session: {generation.customerSessionId}
                    </p>
                  </div>
                ))}

                {generations.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No customer generations yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {generations.slice(0, 5).map((generation) => (
                <div
                  key={generation.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <strong>{generation.brandName}</strong>
                  <p className="mt-1 text-sm text-slate-500">
                    {generation.businessType} · {generation.style}
                  </p>
                </div>
              ))}

              {generations.length === 0 && (
                <p className="text-sm text-slate-500">
                  No AI generations yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true
}) {
  return (
    <label className="grid gap-2 font-bold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-950"
      />
    </label>
  );
}

function Pricing() {
  const navigate = useNavigate();
  async function upgradeToPro() {
    try {
      const customerToken = localStorage.getItem("customerToken");

      if (!customerToken) {
        navigate("/login");
        return;
      }

      const response = await api.post("/payments/create-pro-checkout-session");

      window.location.href = response.data.url;
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start checkout");
    }
  }
  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      description: "For testing the generator.",
      features: [
        "5 free generations",
        "Website blueprint",
        "SEO suggestions",
        "Basic section structure"
      ],
      cta: "Start Free",
      link: "/generator"
    },
    {
      name: "Pro",
      price: "$19/mo",
      description: "For freelancers and small businesses.",
      features: [
        "100 generations",
        "Save generated projects",
        "Export-ready structure",
        "Priority template quality"
      ],
      cta: "Upgrade to Pro",
      link: "/pricing"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For agencies, teams, and companies.",
      features: [
        "Unlimited generations",
        "Team access",
        "Custom template system",
        "Admin controls",
        "API access"
      ],
      cta: "Contact Sales",
      link: "/enterprise"
    }
  ];



  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-black tracking-[-0.06em]">
          Simple Pricing for AI Website Generation
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Start with free generations. Upgrade when you need more power,
          exports, saved projects, or enterprise support.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
          >
            <h2 className="text-2xl font-black">{plan.name}</h2>
            <p className="mt-2 text-slate-600">{plan.description}</p>

            <p className="mt-6 text-4xl font-black tracking-[-0.05em]">
              {plan.price}
            </p>

            <ul className="mt-6 space-y-3 text-sm font-semibold text-slate-600">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>

            {plan.name === "Pro" ? (
              <button
                onClick={upgradeToPro}
                className="mt-8 block w-full rounded-2xl bg-slate-950 px-6 py-4 text-center font-black text-white"
              >
                Upgrade to Pro
              </button>
            ) : (
              <Link
                to={plan.link}
                className="mt-8 block rounded-2xl bg-slate-950 px-6 py-4 text-center font-black text-white"
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
function PaymentSuccess() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    async function loadCustomer() {
      try {
        const response = await api.get("/customer-auth/me");
        setCustomer(response.data.customer);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, []);

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-6 py-12">
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-2xl text-white">
          ✓
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-[-0.05em]">
          Payment Successful
        </h1>

        {loading ? (
          <p className="mt-4 text-slate-600">
            Checking your plan...
          </p>
        ) : (
          <p className="mt-4 leading-7 text-slate-600">
            Your current plan is{" "}
            <strong className="text-slate-950">
              {customer?.planType || "updating"}
            </strong>
            . If it still says Free, wait a few seconds and refresh because the
            Stripe webhook may still be processing.
          </p>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => navigate("/generator")}
            className="rounded-2xl bg-slate-950 px-6 py-4 font-black text-white"
          >
            Go to Generator
          </button>

          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-950"
          >
            Refresh Plan
          </button>
        </div>
      </section>
    </main>
  );
}

function Enterprise() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function submitLead(e) {
    e.preventDefault();

    try {
      await api.post("/enterprise-leads", form);
      setSubmitted(true);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit request");
    }
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <span className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
          Enterprise
        </span>

        <h1 className="mt-6 text-5xl font-black tracking-[-0.06em]">
          Need more generations, team access, or a custom AI template system?
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Enterprise is for companies, agencies, and teams that want to generate
          high-quality website templates at scale.
        </p>

        <div className="mt-8 grid gap-4">
          {[
            "Unlimited or high-volume AI generations",
            "Custom template categories",
            "Team-based dashboard",
            "Saved customer projects",
            "Export-ready website structures",
            "Custom pricing and support"
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5 font-bold shadow-sm"
            >
              ✓ {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        {submitted ? (
          <div>
            <h2 className="text-3xl font-black">Request received</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Thank you. We received your enterprise request and will contact
              you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={submitLead} className="space-y-5">
            <h2 className="text-3xl font-black">Contact Enterprise</h2>

            <Input
              label="Name"
              value={form.name}
              onChange={(value) => updateField("name", value)}
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />

            <Input
              label="Company"
              value={form.company}
              onChange={(value) => updateField("company", value)}
              required={false}
            />

            <Input
              label="Website"
              value={form.website}
              onChange={(value) => updateField("website", value)}
              required={false}
            />

            <label className="grid gap-2 font-bold">
              Message
              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="min-h-32 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-950"
                placeholder="Tell us what you need..."
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-6 py-4 font-black text-white"
            >
              Submit Request
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
      <strong className="block text-4xl font-black tracking-[-0.05em]">
        {value}
      </strong>
      <span className="mt-2 block text-sm font-semibold text-slate-300">
        {title}
      </span>
    </div>
  );
}

export default App;
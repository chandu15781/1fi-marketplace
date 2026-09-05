import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Home, Store, Receipt, TrendingUp, User, Search, ChevronRight, ChevronDown,
  ChevronLeft, Percent, Zap, ShieldCheck, Users, HelpCircle, ScrollText,
  LogOut, X, Check, AlertCircle, ImageOff, ArrowRight, MapPin, RefreshCw,
  Package, Sparkles, PiggyBank, Gift, ShoppingBag,
} from "lucide-react";

/* =========================================================================
   MODELS (conceptual — plain JS objects shaped like this)

   Product        { id, name, category, imageUrl, price, description,
                    variantGroup, variants: ProductVariant[] }
   ProductVariant { id, label, value, priceAdjustment, available }
   EMIPlan        { id, tenureMonths, monthlyAmount, totalPayable,
                    interestAmount, fee, available, note }
   ========================================================================= */

/* =========================================================================
   FIXTURES — single source of truth for mock product/EMI data.
   Never duplicated inside components; components only ever render what
   the service layer below hands them.
   ========================================================================= */

const PRODUCT_FIXTURES = [
  {
    id: "p1",
    name: "iPhone 15",
    category: "Mobiles",
    imageUrl:
      "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&q=80",
    price: 79900,
    description:
      "6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP main camera with 2x optical-quality zoom, and USB-C. Available on 1Fi's zero-interest EMI, backed by your mutual fund limit.",
    variantGroup: "Storage",
    variants: [
      { id: "v1a", label: "Storage", value: "128GB", priceAdjustment: 0, available: true },
      { id: "v1b", label: "Storage", value: "256GB", priceAdjustment: 10000, available: true },
      { id: "v1c", label: "Storage", value: "512GB", priceAdjustment: 30000, available: false },
    ],
    emiPlans: [
      { id: "e1a", tenureMonths: 3, monthlyAmount: 26633, totalPayable: 79900, interestAmount: 0, fee: 0, available: true },
      { id: "e1b", tenureMonths: 6, monthlyAmount: 13317, totalPayable: 79900, interestAmount: 0, fee: 0, available: true },
      { id: "e1c", tenureMonths: 9, monthlyAmount: 8878, totalPayable: 79900, interestAmount: 0, fee: 0, available: true },
      { id: "e1d", tenureMonths: 12, monthlyAmount: 6658, totalPayable: 79900, interestAmount: 0, fee: 0, available: true },
    ],
  },
  {
    id: "p2",
    name: "Samsung Galaxy S24",
    category: "Mobiles",
    imageUrl:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80",
    price: 74999,
    description:
      "6.2-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, Galaxy AI features, and a 50MP triple camera system.",
    variantGroup: "Color",
    variants: [
      { id: "v2a", label: "Color", value: "Onyx Black", priceAdjustment: 0, available: true },
      { id: "v2b", label: "Color", value: "Marble Gray", priceAdjustment: 0, available: false },
      { id: "v2c", label: "Color", value: "Cobalt Violet", priceAdjustment: 0, available: true },
    ],
    emiPlans: [
      { id: "e2a", tenureMonths: 3, monthlyAmount: 25000, totalPayable: 74999, interestAmount: 0, fee: 0, available: true },
      { id: "e2b", tenureMonths: 6, monthlyAmount: 12500, totalPayable: 74999, interestAmount: 0, fee: 0, available: true },
      { id: "e2c", tenureMonths: 9, monthlyAmount: 8334, totalPayable: 74999, interestAmount: 0, fee: 0, available: true },
      { id: "e2d", tenureMonths: 12, monthlyAmount: 6250, totalPayable: 74999, interestAmount: 0, fee: 0, available: true },
    ],
  },
  {
    id: "p3",
    name: "MacBook Air M3",
    category: "Laptops",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    price: 114900,
    description:
      "13-inch Liquid Retina display, Apple M3 chip with 8-core CPU, up to 18 hours of battery life. Silent, fanless design.",
    variantGroup: "Configuration",
    variants: [
      { id: "v3a", label: "Configuration", value: "8GB / 256GB", priceAdjustment: 0, available: true },
      { id: "v3b", label: "Configuration", value: "16GB / 512GB", priceAdjustment: 25000, available: true },
    ],
    emiPlans: [
      { id: "e3a", tenureMonths: 3, monthlyAmount: 38300, totalPayable: 114900, interestAmount: 0, fee: 0, available: true },
      { id: "e3b", tenureMonths: 6, monthlyAmount: 19150, totalPayable: 114900, interestAmount: 0, fee: 0, available: true },
      { id: "e3c", tenureMonths: 9, monthlyAmount: 12767, totalPayable: 114900, interestAmount: 0, fee: 0, available: true },
      { id: "e3d", tenureMonths: 12, monthlyAmount: 9575, totalPayable: 114900, interestAmount: 0, fee: 0, available: true },
      { id: "e3e", tenureMonths: 18, monthlyAmount: 6383, totalPayable: 114900, interestAmount: 0, fee: 0, available: true },
      { id: "e3f", tenureMonths: 24, monthlyAmount: 4829, totalPayable: 115899, interestAmount: 0, fee: 999, available: true, note: "Includes ₹999 processing fee" },
    ],
  },
  {
    id: "p4",
    name: "Dell XPS 13",
    category: "Laptops",
    imageUrl:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
    price: 129990,
    description:
      "13.4-inch InfinityEdge display, 13th Gen Intel Core processors, CNC-machined aluminum chassis.",
    variantGroup: "Configuration",
    variants: [
      { id: "v4a", label: "Configuration", value: "i5 / 512GB", priceAdjustment: 0, available: true },
      { id: "v4b", label: "Configuration", value: "i7 / 1TB", priceAdjustment: 20000, available: true },
    ],
    emiPlans: [],
  },
  {
    id: "p5",
    name: "Royal Enfield Classic 350",
    category: "Two-wheelers",
    imageUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&q=80",
    price: 193000,
    description:
      "The definitive retro motorcycle. J-series 349cc engine, dual-channel ABS, and timeless styling.",
    variantGroup: "Color",
    variants: [
      { id: "v5a", label: "Color", value: "Redditch Red", priceAdjustment: 0, available: true },
      { id: "v5b", label: "Color", value: "Chrome Black", priceAdjustment: 15000, available: false },
    ],
    emiPlans: [
      { id: "e5a", tenureMonths: 6, monthlyAmount: 32167, totalPayable: 193000, interestAmount: 0, fee: 0, available: true },
      { id: "e5b", tenureMonths: 12, monthlyAmount: 16084, totalPayable: 193000, interestAmount: 0, fee: 0, available: true },
      { id: "e5c", tenureMonths: 18, monthlyAmount: 10723, totalPayable: 193000, interestAmount: 0, fee: 0, available: true },
      { id: "e5d", tenureMonths: 24, monthlyAmount: 8042, totalPayable: 193000, interestAmount: 0, fee: 0, available: false, note: "Not offered on this vehicle category" },
    ],
  },
  {
    id: "p6",
    name: "TVS Jupiter",
    category: "Two-wheelers",
    imageUrl: "https://broken-image-host.invalid/tvs-jupiter.jpg",
    price: 78000,
    description:
      "India's favourite 110cc scooter. Best-in-class mileage, external fuel fill, and telescopic suspension.",
    variantGroup: "Color",
    variants: [
      { id: "v6a", label: "Color", value: "Titanium Grey", priceAdjustment: 0, available: true },
      { id: "v6b", label: "Color", value: "Pearl White", priceAdjustment: 0, available: true },
    ],
    emiPlans: [
      { id: "e6a", tenureMonths: 3, monthlyAmount: 26000, totalPayable: 78000, interestAmount: 0, fee: 0, available: true },
      { id: "e6b", tenureMonths: 6, monthlyAmount: 13000, totalPayable: 78000, interestAmount: 0, fee: 0, available: true },
      { id: "e6c", tenureMonths: 9, monthlyAmount: 8667, totalPayable: 78000, interestAmount: 0, fee: 0, available: true },
      { id: "e6d", tenureMonths: 12, monthlyAmount: 6500, totalPayable: 78000, interestAmount: 0, fee: 0, available: true },
    ],
  },
  {
    id: "p7",
    name: "Wakefit Orthopedic Mattress",
    category: "Home",
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80",
    price: 18999,
    description:
      "Dual-layered orthopedic memory foam mattress with breathable fabric. 10-year warranty.",
    variantGroup: "Size",
    variants: [
      { id: "v7a", label: "Size", value: "Queen", priceAdjustment: 0, available: true },
      { id: "v7b", label: "Size", value: "King", priceAdjustment: 3000, available: true },
    ],
    emiPlans: [
      { id: "e7a", tenureMonths: 3, monthlyAmount: 6333, totalPayable: 18999, interestAmount: 0, fee: 0, available: true },
      { id: "e7b", tenureMonths: 6, monthlyAmount: 3167, totalPayable: 18999, interestAmount: 0, fee: 0, available: true },
      { id: "e7c", tenureMonths: 9, monthlyAmount: 2111, totalPayable: 18999, interestAmount: 0, fee: 0, available: true },
    ],
  },
  {
    id: "p8",
    name: "Sony WH-1000XM5",
    category: "Audio",
    imageUrl:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80",
    price: 29990,
    description:
      "Industry-leading noise cancellation, 30-hour battery life, and crystal-clear hands-free calling.",
    variantGroup: "Color",
    variants: [
      { id: "v8a", label: "Color", value: "Black", priceAdjustment: 0, available: true },
      { id: "v8b", label: "Color", value: "Silver", priceAdjustment: 0, available: true },
    ],
    emiPlans: [
      { id: "e8a", tenureMonths: 3, monthlyAmount: 9997, totalPayable: 29990, interestAmount: 0, fee: 0, available: true },
      { id: "e8b", tenureMonths: 6, monthlyAmount: 4998, totalPayable: 29990, interestAmount: 0, fee: 0, available: true },
    ],
  },
];

const CATEGORIES = ["All", "Mobiles", "Laptops", "Two-wheelers", "Home", "Audio"];

/* =========================================================================
   MOCK SERVICE / REPOSITORY LAYER
   UI components never touch PRODUCT_FIXTURES directly — only these
   functions. This is the seam a real API client would slot behind later.
   Simulated latency + a deliberate failure hook so loading/error states
   are actually reachable in a demo (search "error" triggers a rejection).
   ========================================================================= */

const LATENCY = () => 500 + Math.random() * 500;

function getProducts({ search = "", category = "All" } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (search.trim().toLowerCase() === "error") {
        reject(new Error("Could not load products. Please check your connection."));
        return;
      }
      const q = search.trim().toLowerCase();
      const results = PRODUCT_FIXTURES.filter((p) => {
        const matchesCategory = category === "All" || p.category === category;
        const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      }).map(({ emiPlans, ...rest }) => rest); // list view doesn't need full EMI payload
      resolve(results);
    }, LATENCY());
  });
}

function getProductById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = PRODUCT_FIXTURES.find((p) => p.id === id);
      if (!product) {
        reject(new Error("This product could not be found."));
        return;
      }
      const { emiPlans, ...rest } = product;
      resolve(rest);
    }, LATENCY());
  });
}

function getEMIPlans(productId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = PRODUCT_FIXTURES.find((p) => p.id === productId);
      if (!product) {
        reject(new Error("Could not load EMI plans for this product."));
        return;
      }
      resolve(product.emiPlans);
    }, LATENCY());
  });
}

/* =========================================================================
   FORMATTING HELPERS
   ========================================================================= */

const formatINR = (n) => `\u20B9${Math.round(n).toLocaleString("en-IN")}`;

const cheapestMonthly = (emiPlans) => {
  if (!emiPlans) return null;
  const available = emiPlans.filter((p) => p.available);
  if (available.length === 0) return null;
  return Math.min(...available.map((p) => p.monthlyAmount));
};

/* =========================================================================
   SHARED UI PRIMITIVES
   ========================================================================= */

function PrimaryButton({ children, onClick, disabled, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-sm transition-colors ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-purple-700 text-white hover:bg-purple-800 active:bg-purple-900"
      }`}
    >
      {children}
      {Icon && <Icon size={16} />}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1 h-4 rounded-full bg-purple-700" />
      <h2 className="text-xs font-bold tracking-wide text-purple-800">{children}</h2>
    </div>
  );
}

function LoadingGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100">
          <div className="w-full h-24 md:h-32 rounded-xl bg-gray-100 animate-pulse mb-3" />
          <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="text-red-500" size={26} />
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">Something went wrong</p>
      <p className="text-sm text-gray-500 mb-5 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-semibold text-purple-700 bg-purple-50 px-5 py-2.5 rounded-full hover:bg-purple-100"
        >
          <RefreshCw size={15} /> Try again
        </button>
      )}
    </div>
  );
}

function EmptyState({ title, subtitle, actionLabel, onAction, icon: Icon = Package }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="text-gray-400" size={26} />
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mb-5 max-w-xs">{subtitle}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-purple-700 bg-purple-50 px-5 py-2.5 rounded-full hover:bg-purple-100"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProductImage({ src, alt, className }) {
  const [broken, setBroken] = useState(false);
  if (broken || !src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <ImageOff className="text-gray-300" size={24} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className={`${className} object-cover`}
    />
  );
}

/* =========================================================================
   MARKETPLACE COMPONENTS
   ========================================================================= */

function ProductCard({ product, onOpen }) {
  const fromPrice = product.price;
  return (
    <button
      onClick={() => onOpen(product.id)}
      className="text-left bg-white rounded-2xl p-3 border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
    >
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-24 md:h-32 rounded-xl mb-3"
      />
      <p className="text-xs text-gray-400 mb-0.5">{product.category}</p>
      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5">
        {product.name}
      </p>
      <p className="text-sm font-bold text-gray-900">{formatINR(fromPrice)}</p>
      <p className="text-xs text-purple-700 font-medium mt-0.5">No-cost EMI available</p>
    </button>
  );
}

function CategoryChips({ active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            active === c
              ? "bg-purple-700 text-white border-purple-700"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function VariantSelector({ groupLabel, variants, selectedId, onSelect }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-500 mb-2.5">{groupLabel}</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const selected = v.id === selectedId;
          return (
            <button
              key={v.id}
              disabled={!v.available}
              onClick={() => onSelect(v.id)}
              aria-pressed={selected}
              aria-disabled={!v.available}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                !v.available
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                  : selected
                  ? "bg-purple-700 text-white border-purple-700"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              }`}
            >
              {v.value}
              {v.priceAdjustment > 0 && v.available ? ` (+${formatINR(v.priceAdjustment)})` : ""}
              {!v.available ? " · Out of stock" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EMIPlanCard({ plan, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(plan.id)}
      disabled={!plan.available}
      aria-pressed={selected}
      className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${
        !plan.available
          ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
          : selected
          ? "border-purple-700 bg-purple-50"
          : "border-gray-200 bg-white hover:border-purple-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? "border-purple-700 bg-purple-700" : "border-gray-300"
          }`}
        >
          {selected && <Check size={12} className="text-white" />}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{plan.tenureMonths} months</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {plan.available
              ? plan.note || (plan.fee > 0 ? `Includes ${formatINR(plan.fee)} fee` : "0% interest · No hidden fees")
              : plan.note || "Not available for this product"}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatINR(plan.monthlyAmount)}/mo</p>
        <p className="text-xs text-gray-400">Total {formatINR(plan.totalPayable)}</p>
      </div>
    </button>
  );
}

/* =========================================================================
   SCREENS
   ========================================================================= */

function MarketplaceListScreen({ onOpenProduct }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    getProducts({ search: debouncedSearch, category })
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-6">
      <div className="rounded-2xl bg-gradient-to-br from-purple-900 to-purple-600 p-5 md:p-8 mb-4 relative overflow-hidden">
        <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <Sparkles size={12} /> 1FI MARKETPLACE
        </span>
        <h1 className="text-white text-xl md:text-2xl font-bold leading-snug mb-1">
          Shop now, pay later
        </h1>
        <p className="text-purple-100 text-sm">Backed by your mutual funds. 0% interest.</p>
      </div>

      <div className="md:flex md:items-center md:gap-4 md:mb-4">
        <div className="relative mb-3 md:mb-0 md:w-72 md:shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div className="md:flex-1 md:min-w-0 mb-4 md:mb-0">
          <CategoryChips active={category} onSelect={setCategory} />
        </div>
      </div>

      {loading && <LoadingGrid />}

      {!loading && error && <ErrorState message={error} onRetry={fetchProducts} />}

      {!loading && !error && products && products.length === 0 && (
        <EmptyState
          icon={Search}
          title="No products found"
          subtitle="Try a different search term or category."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch("");
            setCategory("All");
          }}
        />
      )}

      {!loading && !error && products && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpenProduct} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductDetailsScreen({ productId, onBack, onProceed }) {
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState(null);

  const [emiPlans, setEmiPlans] = useState(null);
  const [loadingEmi, setLoadingEmi] = useState(true);
  const [emiError, setEmiError] = useState(null);

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedEmiPlanId, setSelectedEmiPlanId] = useState(null);
  const [attemptedProceed, setAttemptedProceed] = useState(false);

  const fetchProduct = useCallback(() => {
    setLoadingProduct(true);
    setProductError(null);
    getProductById(productId)
      .then((p) => {
        setProduct(p);
        setSelectedVariantId(null);
      })
      .catch((e) => setProductError(e.message))
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  const fetchEmiPlans = useCallback(() => {
    setLoadingEmi(true);
    setEmiError(null);
    getEMIPlans(productId)
      .then((plans) => {
        setEmiPlans(plans);
        setSelectedEmiPlanId(null);
      })
      .catch((e) => setEmiError(e.message))
      .finally(() => setLoadingEmi(false));
  }, [productId]);

  useEffect(() => {
    fetchProduct();
    fetchEmiPlans();
  }, [fetchProduct, fetchEmiPlans]);

  const selectedVariant = useMemo(
    () => product?.variants.find((v) => v.id === selectedVariantId) || null,
    [product, selectedVariantId]
  );
  const selectedPlan = useMemo(
    () => emiPlans?.find((p) => p.id === selectedEmiPlanId) || null,
    [emiPlans, selectedEmiPlanId]
  );

  const displayPrice = product ? product.price + (selectedVariant?.priceAdjustment || 0) : 0;
  const hasEmiOptions = emiPlans && emiPlans.some((p) => p.available);
  const canProceed = Boolean(selectedVariant && selectedPlan);

  const handleProceed = () => {
    if (!canProceed) {
      setAttemptedProceed(true);
      return;
    }
    onProceed({ product, variant: selectedVariant, plan: selectedPlan });
  };

  const summaryCard = (
    <div className="bg-white md:border md:border-gray-100 md:rounded-2xl md:shadow-sm px-4 pt-3 pb-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400">
            {selectedPlan ? `${selectedPlan.tenureMonths}-month plan` : "Select variant & EMI plan"}
          </p>
          <p className="text-base font-bold text-gray-900">
            {selectedPlan ? `${formatINR(selectedPlan.monthlyAmount)}/mo` : formatINR(displayPrice)}
          </p>
        </div>
      </div>
      <PrimaryButton onClick={handleProceed} disabled={!canProceed} icon={ArrowRight}>
        Proceed to purchase
      </PrimaryButton>
    </div>
  );

  return (
    <div className="pb-28 md:pb-8">
      <div className="flex items-center gap-3 px-4 py-3 md:px-0 md:pb-4 sticky md:static top-0 bg-gray-50/95 md:bg-transparent backdrop-blur z-10 border-b md:border-b-0 border-gray-100">
        <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-semibold text-gray-900 truncate">
          {product ? product.name : "Product details"}
        </h1>
      </div>

      {loadingProduct && (
        <div className="px-4 md:px-0 pt-4 md:pt-0 md:grid md:grid-cols-2 md:gap-10">
          <div>
            <div className="w-full h-48 md:h-80 rounded-2xl bg-gray-100 animate-pulse mb-4" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse mb-4" />
            <div className="h-3 w-full bg-gray-100 rounded animate-pulse mb-1.5" />
            <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      )}

      {!loadingProduct && productError && (
        <ErrorState message={productError} onRetry={fetchProduct} />
      )}

      {!loadingProduct && !productError && product && (
        <div className="px-4 md:px-0 pt-4 md:pt-0 md:grid md:grid-cols-2 md:gap-10 md:items-start">
          {/* Left column: media + core info + variant */}
          <div>
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 md:h-80 rounded-2xl mb-4"
            />
            <p className="text-xs text-gray-400 mb-1">{product.category}</p>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1.5">{product.name}</h2>
            <p className="text-xl font-bold text-gray-900 mb-3">{formatINR(displayPrice)}</p>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{product.description}</p>

            <VariantSelector
              groupLabel={product.variantGroup}
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
            {attemptedProceed && !selectedVariant && (
              <p className="text-xs text-red-500 -mt-4 mb-4">
                Please select a {product.variantGroup.toLowerCase()} to continue.
              </p>
            )}

            {/* Summary + CTA lives here on desktop, sticky under the variant selector */}
            <div className="hidden md:block md:sticky md:top-6 mt-2">{summaryCard}</div>
          </div>

          {/* Right column: EMI plan selection */}
          <div>
            <SectionLabel>CHOOSE EMI PLAN</SectionLabel>

            {loadingEmi && (
              <div className="space-y-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!loadingEmi && emiError && (
              <div className="mb-6">
                <ErrorState message={emiError} onRetry={fetchEmiPlans} />
              </div>
            )}

            {!loadingEmi && !emiError && emiPlans && !hasEmiOptions && (
              <div className="mb-6">
                <EmptyState
                  icon={Percent}
                  title="No EMI plans available"
                  subtitle="This product currently doesn't have an EMI option through 1Fi."
                />
              </div>
            )}

            {!loadingEmi && !emiError && hasEmiOptions && (
              <div className="space-y-2 mb-2">
                {emiPlans.map((plan) => (
                  <EMIPlanCard
                    key={plan.id}
                    plan={plan}
                    selected={plan.id === selectedEmiPlanId}
                    onSelect={setSelectedEmiPlanId}
                  />
                ))}
              </div>
            )}
            {attemptedProceed && hasEmiOptions && !selectedPlan && (
              <p className="text-xs text-red-500 mt-2 mb-4">Please select an EMI plan to continue.</p>
            )}
          </div>
        </div>
      )}

      {/* Mobile-only fixed CTA bar (desktop shows the sticky card in the left column instead) */}
      {!loadingProduct && !productError && product && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-gray-100 z-20">
          {summaryCard}
        </div>
      )}
    </div>
  );
}

function PurchaseConfirmationScreen({ summary, onDone }) {
  const { product, variant, plan } = summary;
  const total = product.price + (variant.priceAdjustment || 0) + (plan.fee || 0);
  return (
    <div className="px-4 md:px-0 pt-10 pb-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
        <Check className="text-green-600" size={30} />
      </div>
      <h1 className="text-lg font-bold text-gray-900 mb-1.5">Purchase request submitted</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        Our team will reach out shortly to complete this purchase using your 1Fi limit.
      </p>

      <div className="w-full md:max-w-md bg-white rounded-2xl border border-gray-100 p-4 text-left mb-8">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <ProductImage src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-xl shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-400">{variant.value}</p>
          </div>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">EMI plan</span>
          <span className="font-medium text-gray-900">{plan.tenureMonths} months</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Monthly amount</span>
          <span className="font-medium text-gray-900">{formatINR(plan.monthlyAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total payable</span>
          <span className="font-semibold text-gray-900">{formatINR(total)}</span>
        </div>
      </div>

      <div className="w-full md:max-w-md">
        <PrimaryButton onClick={onDone}>Back to Marketplace</PrimaryButton>
      </div>
    </div>
  );
}

/* =========================================================================
   SHOP TAB (Top Brands / Nearby Stores / 1Fi Marketplace)
   Top Brands + Nearby Stores are intentionally left as light static
   recreations of the existing screens — out of scope per the assignment.
   ========================================================================= */

const TOP_BRANDS = [
  { name: "Air India", note: "No-cost EMIs upto 18 months", color: "bg-red-600" },
  { name: "Apple Premium Reseller", note: "No-cost EMIs upto 24 months", color: "bg-black" },
];

const NEARBY_STORES = [
  { name: "TripBouquet", address: "241, Tower B, Spazedge, near Dmart, Gurugram", distance: "1158 KM" },
  { name: "Atelier Forbidden Journeys", address: "Sector 40, Gurugram, Haryana", distance: "1159 KM" },
];

function ShopHero() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-purple-900 to-purple-600 p-5 mb-4 relative overflow-hidden">
      <h1 className="text-white text-xl font-bold leading-snug mb-1">
        Shop today, <span className="italic font-normal">pay later using</span> Mutual funds.
      </h1>
      <p className="text-purple-100 text-sm">No credit score required. No interest. Backed by your investments.</p>
    </div>
  );
}

function ShopScreen({ onOpenProduct }) {
  const [tab, setTab] = useState("marketplace");

  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0">
      <ShopHero />
      <div className="flex bg-purple-50 rounded-full p-1 mb-4 md:max-w-md">
        {[
          { id: "topbrands", label: "Top Brands" },
          { id: "nearby", label: "Nearby Stores" },
          { id: "marketplace", label: "1Fi Marketplace" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition-colors ${
              tab === t.id ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "topbrands" && (
        <div className="space-y-3 pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
          {TOP_BRANDS.map((b) => (
            <div key={b.name} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100">
              <div className={`w-11 h-11 rounded-xl ${b.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {b.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{b.name}</p>
                <p className="text-xs text-gray-400">{b.note}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "nearby" && (
        <div className="space-y-3 pb-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3 md:space-y-0">
          {NEARBY_STORES.map((s) => (
            <div key={s.name} className="flex items-center justify-between bg-white rounded-2xl p-3.5 border border-gray-100">
              <div className="flex items-start gap-2 min-w-0">
                <MapPin className="text-gray-300 shrink-0 mt-0.5" size={16} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400 truncate">{s.address}</p>
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">{s.distance}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "marketplace" && (
        <div className="-mx-4 md:mx-0">
          <MarketplaceListScreen onOpenProduct={onOpenProduct} />
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   OTHER TABS — light recreations for a coherent app shell.
   ========================================================================= */

function HomeScreen() {
  const perks = [
    { icon: Percent, title: "0% interest", note: "Repay only what you spend." },
    { icon: TrendingUp, title: "Keep growing", note: "No tax, no exit load." },
    { icon: ShieldCheck, title: "Zero charges", note: "No fees, nothing hidden." },
    { icon: Zap, title: "Quickest approvals", note: "Instant eligibility check." },
  ];
  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-6">
      <SectionLabel>WHY PAY WITH 1FI</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {perks.map((p) => (
          <div key={p.title} className="bg-white rounded-2xl p-3.5 border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-2.5">
              <p.icon className="text-purple-700" size={17} />
            </div>
            <p className="text-sm font-semibold text-gray-900">{p.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{p.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-600 p-5 flex items-center justify-between mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Gift size={12} /> INVITE
          </span>
          <p className="text-white font-bold text-base leading-snug mb-1">
            Get upto ₹1000 for every friend.
          </p>
          <p className="text-purple-200 text-xs">Plus they'll also get rewards.</p>
        </div>
      </div>

      <SectionLabel>FREQUENTLY ASKED QUESTIONS</SectionLabel>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {["What is 1Fi?", "Is 1Fi safe and legit?", "Are there any hidden fees?"].map((q) => (
          <div key={q} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm font-medium text-gray-700">{q}</span>
            <ChevronDown className="text-gray-300" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderScreen({ icon: Icon, title, note }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 md:px-0 pt-24 md:pt-32">
      <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-4">
        <Icon className="text-purple-700" size={26} />
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
      <p className="text-sm text-gray-400 max-w-xs">{note}</p>
    </div>
  );
}

function ProfileScreen() {
  const actions = [
    { icon: User, title: "Profile details", note: "Name, contact and KYC info" },
    { icon: ShoppingBag, title: "Purchases", note: "Orders, invoices and loan status" },
    { icon: PiggyBank, title: "Pledge history", note: "Funds you pledged or released" },
    { icon: Users, title: "Invite friends", note: "Share the app, earn rewards", badge: "EARN ₹500" },
    { icon: HelpCircle, title: "Support & FAQs", note: "Find answers or contact us" },
    { icon: ShieldCheck, title: "Privacy policy", note: "How we handle your data" },
    { icon: ScrollText, title: "Terms & conditions", note: "Rules governing your use" },
  ];
  return (
    <div className="px-4 md:px-0 pt-4 md:pt-0 pb-6 md:max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
      <p className="text-sm text-gray-400 mb-5">Manage your account settings and personal preferences.</p>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">U</div>
        <div>
          <p className="text-sm font-semibold text-gray-900">User</p>
          <p className="text-xs text-gray-400">+91 6301899986</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-400 tracking-wide mb-2">QUICK ACTIONS</p>
      <div className="space-y-2.5 mb-6 md:grid md:grid-cols-2 md:gap-2.5 md:space-y-0">
        {actions.map((a) => (
          <button key={a.title} className="w-full flex items-center justify-between bg-white rounded-2xl p-3.5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <a.icon className="text-purple-700" size={16} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-400">{a.note}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {a.badge && <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-1 rounded-full">{a.badge}</span>}
              <ChevronRight className="text-gray-300" size={16} />
            </div>
          </button>
        ))}
      </div>
      <button className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl p-3.5 border border-gray-100 text-red-500 font-semibold text-sm mb-4">
        <LogOut size={16} /> Log out
      </button>
      <p className="text-center text-xs text-gray-300">Made with 💜 by 1Fi</p>
    </div>
  );
}

/* =========================================================================
   BOTTOM NAVIGATION
   ========================================================================= */

function BottomNav({ active, onChange }) {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "shop", label: "Shop", icon: Store },
    { id: "emi", label: "EMI Dues", icon: Receipt },
    { id: "limit", label: "Limit", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-2 pt-2 pb-3 flex justify-between z-20">
      {items.map((it) => {
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className="flex-1 flex flex-col items-center gap-1 py-1"
          >
            <span className={`w-6 h-0.5 rounded-full mb-0.5 ${isActive ? "bg-purple-700" : "bg-transparent"}`} />
            <it.icon size={19} className={isActive ? "text-purple-700" : "text-gray-400"} />
            <span className={`text-[10px] font-medium ${isActive ? "text-purple-700" : "text-gray-400"}`}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SideNav({ active, onChange }) {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "shop", label: "Shop", icon: Store },
    { id: "emi", label: "EMI Dues", icon: Receipt },
    { id: "limit", label: "Limit", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <div className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:sticky md:top-0 md:h-screen md:border-r md:border-gray-100 md:bg-white md:py-6 md:px-4">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center text-white font-bold text-sm">1</div>
        <span className="text-lg font-bold text-gray-900">1Fi</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onChange(it.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <it.icon size={18} />
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* =========================================================================
   APP ROOT — owns top-level navigation state only.
   ========================================================================= */

export default function App() {
  const [activeTab, setActiveTab] = useState("shop");
  const [marketplaceView, setMarketplaceView] = useState("list"); // list | detail | confirm
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [confirmationSummary, setConfirmationSummary] = useState(null);

  const openProduct = (id) => {
    setSelectedProductId(id);
    setMarketplaceView("detail");
  };

  const backToList = () => {
    setMarketplaceView("list");
    setSelectedProductId(null);
  };

  const handleProceed = (summary) => {
    setConfirmationSummary(summary);
    setMarketplaceView("confirm");
  };

  const handleDoneConfirm = () => {
    setConfirmationSummary(null);
    setMarketplaceView("list");
    setSelectedProductId(null);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    // Leaving Shop resets any in-progress Marketplace flow so re-entering is fresh.
    if (tab !== "shop") {
      setMarketplaceView("list");
      setSelectedProductId(null);
      setConfirmationSummary(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <SideNav active={activeTab} onChange={changeTab} />

      <div className="flex-1 min-w-0 flex justify-center md:justify-start">
        <div className="w-full max-w-md md:max-w-5xl md:px-10 md:py-8">
          <div className="pb-24 md:pb-8">
            {activeTab === "home" && <HomeScreen />}

            {activeTab === "shop" && marketplaceView === "list" && (
              <ShopScreen onOpenProduct={openProduct} />
            )}
            {activeTab === "shop" && marketplaceView === "detail" && (
              <ProductDetailsScreen
                productId={selectedProductId}
                onBack={backToList}
                onProceed={handleProceed}
              />
            )}
            {activeTab === "shop" && marketplaceView === "confirm" && confirmationSummary && (
              <PurchaseConfirmationScreen summary={confirmationSummary} onDone={handleDoneConfirm} />
            )}

            {activeTab === "emi" && (
              <PlaceholderScreen icon={Receipt} title="No EMI dues yet" note="Your upcoming EMI payments will show up here once you make a purchase." />
            )}
            {activeTab === "limit" && (
              <PlaceholderScreen icon={TrendingUp} title="Check your limit" note="Connect your mutual fund portfolio to see your available spending limit." />
            )}
            {activeTab === "profile" && <ProfileScreen />}
          </div>
        </div>
      </div>

      {marketplaceView !== "detail" && (
        <BottomNav active={activeTab} onChange={changeTab} />
      )}
    </div>
  );
}

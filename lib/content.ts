// Central content for the Zoom Internet site.
// Company facts pulled from the existing zoominternetja.com site.

export const company = {
  name: "Zoom Internet",
  tagline: "Internet just got a whole lot better!",
  blurb:
    "Fast, reliable wireless broadband for homes and businesses across Montego Bay and western Jamaica. No contracts, no data caps — just internet that keeps up with you.",
  phone: "1.876.277.1065",
  phoneHref: "+18762771065",
  whatsapp: "18762771065",
  email: "zoominternetjamaica@gmail.com",
  location: "Montego Bay, Jamaica",
  socials: {
    instagram: "https://instagram.com/zoominternetja",
    facebook: "https://facebook.com/zoominternetja",
    linkedin: "https://linkedin.com/company/zoominternetja",
  },
};

export type Plan = {
  id: string;
  name: string;
  audience: "residential" | "business";
  speed: number; // Mbps
  price: number; // JMD per month
  tagline: string;
  features: string[];
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "family",
    name: "Family",
    audience: "residential",
    speed: 50,
    price: 7999,
    tagline: "Perfect for streaming, browsing & everyday family life.",
    features: [
      "50 Mbps download speed",
      "Truly unlimited data",
      "Up to 10 connected devices",
      "Free standard installation",
      "Local Mobay support team",
    ],
  },
  {
    id: "wfh",
    name: "Work From Home",
    audience: "residential",
    speed: 100,
    price: 9999,
    tagline: "Built for video calls, big uploads & a busy household.",
    features: [
      "100 Mbps download speed",
      "Truly unlimited data",
      "Priority low-latency routing",
      "Up to 20 connected devices",
      "Free standard installation",
      "Local Mobay support team",
    ],
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    audience: "business",
    speed: 125,
    price: 14995,
    tagline: "Dependable bandwidth to keep your business online.",
    features: [
      "125 Mbps download speed",
      "Truly unlimited data",
      "Static IP available",
      "99.9% uptime commitment",
      "Priority business support",
      "Free professional installation",
    ],
  },
];

export const features = [
  {
    icon: "bolt",
    title: "Wave 2 Wireless",
    text: "Powered by Cambium ePMP Force 300 — 802.11ac Wave 2 radios delivering 500+ Mbps peak throughput with always-on spectrum analysis.",
  },
  {
    icon: "infinity",
    title: "No Data Caps",
    text: "Every plan is truly unlimited. Stream, game, upload and download as much as you want — your speed never gets throttled.",
  },
  {
    icon: "shield",
    title: "No Contracts",
    text: "Stay because you love it, not because you're locked in. Simple month-to-month service with no surprise fees.",
  },
  {
    icon: "pin",
    title: "Local & On-Island",
    text: "We're based right here in Montego Bay. When you call, you reach a real person who knows the area — not an overseas call centre.",
  },
];

export const steps = [
  {
    n: "01",
    title: "Check coverage",
    text: "Enter your town to confirm you're inside the Zoom service zone.",
  },
  {
    n: "02",
    title: "Pick your plan",
    text: "Choose Family, Work From Home or Business — all unlimited, no contracts.",
  },
  {
    n: "03",
    title: "We install",
    text: "Our local crew mounts your antenna and gets you online — usually within days.",
  },
  {
    n: "04",
    title: "Start zooming",
    text: "Connect every device and enjoy fast, reliable internet with local support.",
  },
];

export const faqs = [
  {
    q: "How is Zoom Internet different from cable or DSL?",
    a: "Zoom uses fixed-wireless broadband. We beam a high-speed signal from a nearby tower directly to a small antenna at your home or office — so we can reach areas cable and fibre don't, and get you connected far faster.",
  },
  {
    q: "Is the data really unlimited?",
    a: "Yes. Every Zoom plan includes truly unlimited data with no caps and no throttling. Stream, work and game as much as you like.",
  },
  {
    q: "Do I need a contract?",
    a: "No. All plans are month-to-month. There's no long-term commitment and no early-termination fees.",
  },
  {
    q: "How long does installation take?",
    a: "Once you're confirmed in our coverage zone, most installations are completed within a few business days. Our crew handles the antenna mount and router setup for you.",
  },
  {
    q: "What equipment do I need?",
    a: "We provide the outdoor radio (Cambium ePMP Force 300) and a dual-band Wi-Fi router. You just bring your devices.",
  },
  {
    q: "Which areas do you cover?",
    a: "We serve Montego Bay and surrounding communities in western Jamaica. Use the coverage checker on this page — if you're not in range yet, join the waitlist and we'll notify you as we expand.",
  },
];

// Towns/areas considered "in coverage" for the demo coverage checker.
export const coverageAreas = [
  "Montego Bay",
  "Mobay",
  "Rose Hall",
  "Ironshore",
  "Coral Gardens",
  "Bogue",
  "Catherine Hall",
  "Flankers",
  "Granville",
  "Reading",
  "Anchovy",
  "Adelphi",
  "Cambridge",
  "Falmouth",
  "Hopewell",
  "Lucea",
  "Montego Hills",
  "Albion",
  "Fairview",
  "Westgate",
];

export const stats = [
  { icon: "pin", value: "Western JA", label: "Coverage area" },
  { icon: "shield", value: "99.9%", label: "Uptime target" },
  { icon: "infinity", value: "Unlimited", label: "Data, always" },
  { icon: "phone", value: "24/7", label: "Local support" },
];

// Sliding "Trusted Across Jamaica" marquee items (icons mirror fone.png).
export const trustItems = [
  { icon: "users", label: "12,000+ Customers" },
  { icon: "headset", label: "24/7 Support" },
  { icon: "infinity", label: "Unlimited Data" },
  { icon: "unlock", label: "Zero Contracts" },
  { icon: "shield", label: "99.9% Uptime" },
  { icon: "pin", label: "Islandwide Coverage" },
];

export const testimonials = [
  {
    name: "Shanique R.",
    area: "Rose Hall",
    quote:
      "We switched the whole house to Zoom and never looked back. Video calls for work, the kids streaming — everything just runs. And when I call, a real Mobay voice answers.",
    rating: 5,
  },
  {
    name: "Marlon B.",
    area: "Ironshore",
    quote:
      "Installed in two days and the speed has been rock solid since. No more buffering during the football. Best internet decision I've made.",
    rating: 5,
  },
  {
    name: "Tech Hub MoBay",
    area: "Business customer · Catherine Hall",
    quote:
      "Our office runs entirely on Zoom Business. Reliable bandwidth, a static IP, and support that actually picks up. It's kept our team online without a single major outage.",
    rating: 5,
  },
];

export const referral = {
  reward: "One month free",
  blurb:
    "Love your Zoom connection? Share it. When a friend signs up with your name, you both get a month of internet on us.",
  perks: [
    "You get one month free service",
    "Your friend gets free installation",
    "No limit — refer as many neighbours as you like",
  ],
};

// Simple service-status model for the live status badge. Flip `operational`
// to false (and set `message`) during a known outage / maintenance window.
export const serviceStatus = {
  operational: true,
  message: "All systems operational",
};

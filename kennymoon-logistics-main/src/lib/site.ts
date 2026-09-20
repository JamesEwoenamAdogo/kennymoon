export const BRAND = {
  name: "Kennymoon Int'l Ltd",
  short: "Kennymoon",
  tagline: "Trust, Integrity and Service",
  hero: "Let's Help You Moon Your Goods Faster to Nigeria and Other Countries",
  phone: "+234 807 434 5865",
  phoneHref: "tel:+2348074345865",
  whatsapp: "+2348074345865",
  whatsappText: "Hello Kennymoon, I'd like to ship goods from China to Nigeria.",
  telegram: "https://t.me/kennymoonlogistics",
  instagram: "https://www.instagram.com/kennymoonintl/",
  facebook: "https://web.facebook.com/kennymoonintl",
  tiktok: "https://www.tiktok.com/@kennymoonintltd?_r=1&_t=ZS-99hysIbm2So",
  email: "support@kennymoonintl.com",
  altEmail: "kennymoonintl@gmail.com",
};

export const whatsappLink = (message = BRAND.whatsappText) =>
  `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;

export const WAREHOUSE = {
  name: "Kennymoon Int'l Ltd (KM Consolidation)",
  contactName: "Kennymoon / KM-",
  mobile: "+86 138 2841 7736",
  postCode: "510000",
  area: "Guangdong Province, Guangzhou City, Baiyun District",
  street: "No. 24 Xicha Road, Building B, Unit 3, KM Logistics Warehouse",
  comment: "KM- + your Kennymoon code (e.g. KM-4821). Write it on every carton.",
  yiwu: {
    postCode: "322000",
    area: "Zhejiang Province, Jinhua City, Yiwu, Beiyuan District",
    street: "No. 61 Chouzhou North Road, Warehouse 12, KM Consolidation",
    mobile: "+86 137 5798 2214",
  },
};

/** Official China warehouse addresses customers paste into supplier checkout. */
export const CHINA_WAREHOUSES = [
  {
    id: "yiwu",
    name: "Yiwu Warehouse",
    serves: "Lagos Trade Fair, Onitsha and Kano shipments",
    address:
      "浙江省义乌市廿三里安商路31号 [Edit: add your name + GP code] Lagos雄宇针织厂房西6楼KENNYMOON集运仓库",
    phone: "15857978179",
    editNote:
      "You must replace [Edit: add your name + GP code] with your own name and GP code before you give this address to your supplier — this is how we identify whose goods arrived.",
    mark: null as null | { prefix: string; cities: string[] },
  },
  {
    id: "guangzhou",
    name: "Guangzhou Warehouse — 彩虹桥仓库",
    serves: "Lagos Trade Fair, Onitsha and Kano shipments",
    address: "广东佛山市南海区里水镇大冲工业区11路13之6",
    zip: "528200",
    phone: "13534486456",
    editNote:
      "Generate your personalised shipping mark (唛头) below and give it to the supplier along with the address.",
    mark: { prefix: "KENNYMOON", cities: ["LAGOS", "ONITSHA"] },
  },
  {
    id: "ajao",
    name: "Ajao Estate Warehouse (Sea and Air)",
    serves: "Lagos Ajao Estate sea and air shipments",
    address:
      "KENNYMOON / 广东省广州市白云区三元里街道走马岗路2号国泰鞋城B157室 / [name and code]",
    manager: "仓库经理 (Warehouse Manager): KMSky / 15920411641",
    phone: "15920411641",
    editNote:
      "Replace [name and code] with your own name and Kennymoon code. Trademark/brand mark (商标): Kennymoon / [name and code].",
    mark: null as null | { prefix: string; cities: string[] },
  },
];

/** Pickup locations and minimum CBM rules. */
export const PICKUP_LOCATIONS = [
  { id: "lagos_ajao", label: "Lagos — Ajao Estate", minCbm: 0.1, codePrefix: "KM", modes: ["sea", "air"] },
  { id: "lagos_tradefair", label: "Lagos — Trade Fair", minCbm: 0, codePrefix: "GP", modes: ["sea"] },
  { id: "onitsha", label: "Onitsha", minCbm: 0, codePrefix: "GP", modes: ["sea"] },
  { id: "kano", label: "Kano", minCbm: 0, codePrefix: "GP", modes: ["sea"] },
] as const;

/** Air freight is quoted in USD per kg and converted with the live FX rate. */
export const AIR_RATES_USD = [
  { tier: "normal", label: "Normal cargo", perKg: 8.6 },
  { tier: "special_hk", label: "Special goods (Hong Kong)", perKg: 11.5 },
  { tier: "express", label: "Express", perKg: 13 },
] as const;

/** Sea freight is fixed in Naira per CBM and does not move with FX. */
export const SEA_RATES_NGN = [
  { tier: "lagos_tradefair", label: "Lagos — Trade Fair", perCbm: 526000, minCbm: 0 },
  { tier: "lagos_ajao_small", label: "Lagos — Ajao Estate (0.1–0.49 CBM)", perCbm: 478000, minCbm: 0.1 },
  { tier: "lagos_ajao_large", label: "Lagos — Ajao Estate (0.5 CBM and above)", perCbm: 470000, minCbm: 0.5 },
  { tier: "onitsha", label: "Onitsha", perCbm: 555000, minCbm: 0 },
  { tier: "kano", label: "Kano", perCbm: 670000, minCbm: 0 },
] as const;

/** Customer-facing order status pipeline. */
export const PIPELINE = [
  { id: "not_in_warehouse", label: "Not Yet in Warehouse" },
  { id: "in_warehouse", label: "In Warehouse" },
  { id: "shipped", label: "Shipped" },
  { id: "in_nigeria", label: "In Nigeria" },
] as const;


export const TRUST_STATS = [
  { value: 18400, suffix: "+", label: "Cartons shipped since 2016" },
  { value: 10, suffix: " yrs", label: "Serving Nigerian importers" },
  { value: 3, suffix: "/week", label: "Sailings + air consolidations" },
  { value: 47, suffix: " days", label: "Average sea transit, door to pickup" },
];

export const PICKUP_CITIES = [
  {
    id: "lagos",
    city: "Lagos",
    address: "Shop 14, Balogun Business Association Plaza, Trade Fair Complex, Lagos",
    hours: "Mon–Sat, 8:30am – 6:00pm",
    manager: "Chidi Nwafor",
    phone: "+234 803 555 0142",
    note: "Our biggest pickup hub. Same-day release once you get the ready-for-pickup SMS.",
  },
  {
    id: "onitsha",
    city: "Onitsha",
    address: "42 Ochanja Market Road, Onitsha, Anambra State",
    hours: "Mon–Sat, 8:00am – 5:30pm",
    manager: "Ngozi Eze",
    phone: "+234 806 555 0198",
    note: "Serves the South-East. Bulk traders can arrange evening loading by appointment.",
  },
  {
    id: "kano",
    city: "Kano",
    address: "18 Ibrahim Taiwo Road, Sabon Gari, Kano State",
    hours: "Mon–Fri 8:30am – 5:00pm, Sat 9:00am – 2:00pm",
    manager: "Musa Abdullahi",
    phone: "+234 809 555 0173",
    note: "Northern hub. Onward truck delivery to Kaduna, Katsina and Maiduguri on request.",
  },
];

export const RATES = {
  sea: {
    perKg: 3200,
    perCbm: 465000,
    transit: "40–60 days",
    minKg: 20,
    label: "Sea freight (by weight or volume)",
  },
  air: {
    perKg: 9800,
    perCbm: 0,
    transit: "7–12 days",
    minKg: 1,
    label: "Air freight (by weight)",
  },
} as const;

export const CITY_HANDLING: Record<string, number> = {
  Lagos: 0,
  Onitsha: 12000,
  Kano: 18000,
};

export const RMB_RATE = 232;

export const SERVICES = [
  {
    slug: "china-nigeria-shipping",
    title: "China–Nigeria Shipping",
    blurb:
      "Sea and air consolidation from Guangzhou and Yiwu into Lagos, Onitsha and Kano — with a waybill you can track from the day your carton lands in our warehouse.",
    points: [
      "Free 21-day storage while you wait for other sellers to deliver",
      "Cartons weighed, photographed and logged on arrival",
      "Sea 40–60 days, air 7–12 days, both fully tracked",
    ],
  },
  {
    slug: "nigeria-international-shipping",
    title: "Nigeria – UK, US, Canada and Other European Countries Shipping",
    blurb:
      "Export goods from Nigeria to the United Kingdom, United States, Canada and other European countries with clear guidance, secure handling and dependable delivery.",
    points: [
      "Shipping support for the UK, US, Canada and other European destinations",
      "Clear packaging, documentation and destination guidance",
      "Sea and air options based on destination and cargo type",
    ],
  },
  {
    slug: "freight-forwarding",
    title: "Freight Forwarding",
    blurb:
      "Full documentation, customs clearing and inland haulage handled by our own clearing team at Apapa and Tin Can — no third-party surprises.",
    points: [
      "Form M, PAAR and duty guidance for registered businesses",
      "Container groupage (LCL) and full container (FCL) options",
      "Inland truck delivery to any state in Nigeria",
    ],
  },
  {
    slug: "warehouse-consolidation",
    title: "China Warehouse & Consolidation",
    blurb:
      "You buy from Pinduoduo, 1688 or any Chinese platform yourself and ship to our Guangzhou or Yiwu warehouse. From the moment your carton arrives, it is ours to handle.",
    points: [
      "Free storage while you wait for other sellers to deliver",
      "Cartons weighed, measured, photographed and logged on arrival",
      "Multiple sellers combined under one shipping mark and one invoice",
    ],
  },

  {
    slug: "rmb-exchange",
    title: "24-48hrs RMB payments to your supplier",
    blurb:
      "Pay your Chinese supplier faster at good rates. Naira in, RMB out to Alipay, WeChat Pay or a Chinese bank account.",
    points: [
      "Settlement within 24–48 hours after payment",
      "Alipay and WeChat Pay wallets, plus Chinese bank transfers",
      "Receipt and payment screenshot for every transaction",
    ],
  },
];

export const JOURNEY = [
  {
    stage: "purchased",
    title: "You buy",
    body: "You search for and buy your goods yourself on Pinduoduo, 1688, Taobao or Alibaba. At checkout, paste our China warehouse address plus your own name and code into the supplier's shipping details so the seller delivers straight to us.",
    days: "Day 0",
  },
  {
    stage: "received",
    title: "We receive",
    body: "Your carton arrives at our Guangzhou or Yiwu warehouse. We weigh it, measure it, photograph it and attach it to your Kennymoon waybill the same day.",
    days: "Day 1–3",
  },
  {
    stage: "consolidated",
    title: "We consolidate",
    body: "Cartons from different sellers are combined under one waybill so you pay for one shipment, not five. Free storage for 21 days while you wait for stragglers.",
    days: "Day 3–10",
  },
  {
    stage: "shipped",
    title: "We ship",
    body: "Sea cargo sails from Nansha or Shenzhen; air cargo leaves Guangzhou or Shanghai. Your tracking page moves to 'In transit' with the vessel or flight noted.",
    days: "Sea 40–60 days · Air 7–12 days",
  },
  {
    stage: "ready_for_pickup",
    title: "Ready for pickup",
    body: "We clear at Apapa or Murtala Muhammed cargo, move the goods to your chosen city, then SMS and WhatsApp you. Walk in with your waybill and ID.",
    days: "Same week as arrival",
  },
];

export const STAGE_LABELS: Record<string, string> = {
  purchased: "Purchased",
  received: "Received in China",
  consolidated: "Consolidated",
  shipped: "In transit",
  arrived: "Arrived in Nigeria",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
};

export const STAGE_ORDER = [
  "purchased",
  "received",
  "consolidated",
  "shipped",
  "ready_for_pickup",
];

export const TESTIMONIALS = [
  {
    name: "Amaka Obiora",
    business: "Amaka Styles, boutique owner",
    city: "Lagos",
    photo: "/images/t1.jpg",
    stat: "62 shipments since 2021",
    quote:
      "Before Kennymoon I used to lose sleep over every carton. Now I drop the waybill number in my WhatsApp group and my customers can see for themselves that the goods are coming. Chidi even calls me before the container is cleared.",
  },
  {
    name: "Ibrahim Danladi",
    business: "Danladi Gadgets, phone accessories",
    city: "Kano",
    photo: "/images/t2.jpg",
    stat: "Air cargo every 2 weeks",
    quote:
      "I move small, expensive cartons and I need them fast. Their air consolidation gets my accessories from Yiwu to Kano in ten days, and the pickup office in Sabon Gari opens early enough for me to load before market.",
  },
  {
    name: "Blessing Etim",
    business: "Bee Hair Collections",
    city: "Onitsha",
    photo: "/images/t3.jpg",
    stat: "1.8 tonnes of hair extensions moved",
    quote:
      "I buy my bundles myself on 1688 and just paste Kennymoon's Yiwu address at checkout. The goods get to their warehouse, they message me the same day, and the RMB rate they gave me was better than the agent I was using in Onitsha.",
  },
  {
    name: "Sunday Adeyemi",
    business: "Adeyemi Building Materials",
    city: "Lagos",
    photo: "/images/t4.jpg",
    stat: "14 containers cleared",
    quote:
      "Forty to sixty days on sea freight is the truth, and Kennymoon tells you that upfront instead of promising two weeks and disappointing you. That honesty is why I have not changed forwarder in four years.",
  },
];

export const FAQS = [
  {
    q: "How long does shipping from China to Nigeria take?",
    a: "Sea freight takes 40 to 60 days from the day your container sails, plus 3 to 7 days for clearing and movement to your pickup city. Air freight takes 7 to 12 days door to pickup. We quote those windows honestly rather than promising two weeks and disappointing you.",
  },
  {
    q: "What is your warehouse address in China?",
    a: "Guangzhou: No. 24 Xicha Road, Building B, Unit 3, KM Logistics Warehouse, Baiyun District, Guangzhou, Guangdong, post code 510000. Yiwu: No. 61 Chouzhou North Road, Warehouse 12, KM Consolidation, Beiyuan District, Yiwu, Zhejiang, post code 322000. Always add your KM code in the comment field so we can match the carton to you.",
  },
  {
    q: "How much does it cost to ship?",
    a: "Sea freight is fixed in Naira per CBM: Lagos Trade Fair ₦526,000, Lagos Ajao Estate ₦478,000 (0.1–0.49 CBM) or ₦470,000 (0.5 CBM and above), Onitsha ₦555,000 and Kano ₦670,000. Air freight is China to Lagos only and priced per kg in dollars — $8.6 normal, $11.5 special Hong Kong goods, $13 express — converted at the day's market rate. Our CBM calculator is public; you never need to sign up to see a price.",
  },
  {
    q: "Do I need an account to track my goods?",
    a: "Yes. Sign up or log in to your Kennymoon account, then enter any supplier tracking number under Track My Waybill. It starts as Not Yet in Warehouse and changes automatically when our warehouse record matches it.",
  },
  {
    q: "What is today's RMB rate?",
    a: `Our published rate is ₦${RMB_RATE} to ¥1. Settlement takes 24–48 hours after payment. We can send RMB to an Alipay wallet, WeChat Pay wallet or Chinese bank account, and we provide proof of payment.`,
  },
  {
    q: "Do you buy the goods for me?",
    a: "No. Kennymoon does not source, buy or deal with suppliers on your behalf. You buy your goods yourself on platforms like Pinduoduo and 1688, and at checkout you paste our China warehouse address (with your name and code) as the delivery address. Our work starts the moment your goods reach our warehouse — logistics and shipping only.",
  },

  {
    q: "What happens if my carton is damaged or missing?",
    a: "Every carton is photographed and weighed on arrival at our warehouse, so we can prove the condition it reached us in. If something is short-shipped by your seller you will know before it leaves China. For damage in transit we file the claim with the carrier and keep you copied on every step.",
  },
  {
    q: "Do you handle customs clearing and duty?",
    a: "Yes. Our own clearing team works Apapa, Tin Can and Murtala Muhammed cargo. For registered businesses we guide you through Form M and PAAR. Duty is quoted separately from freight so you always know what you are paying to whom.",
  },
  {
    q: "What goods can you not ship?",
    a: "We do not carry weapons, ammunition, drugs, currency, live animals, flammable liquids and gases, counterfeit branded goods, or anything on Nigeria Customs' import prohibition list. Batteries, cosmetics and liquids are accepted by sea with prior declaration.",
  },
  {
    q: "How do I pay Kennymoon?",
    a: "Freight is paid in Naira by bank transfer to our corporate account before release, or on pickup for accounts with a standing arrangement. RMB exchange is paid before we settle your supplier. We issue a receipt for every payment — never pay into a personal account.",
  },
  {
    q: "Can Kennymoon ship from Nigeria to the UK, US, Canada or Europe?",
    a: "Yes. We support exports from Nigeria to the United Kingdom, United States, Canada and other European countries. The available sea or air option depends on the destination, cargo type and size, so contact our team with those details for the correct route.",
  },
  {
    q: "What do the shipment statuses mean?",
    a: "Not Yet in Warehouse means you logged the supplier tracking number but our warehouse has not matched it. In Warehouse means it has been received and matched. Shipped means it is on the way. In Nigeria or Ready for Pickup means it has reached the Nigerian destination and our team will guide you on collection.",
  },
];

export const NAV = [
  { to: "/", label: "Home" },
  {
    to: "/about",
    label: "About Us",
    children: [
      { to: "/about", label: "Our Story" },
      { to: "/locations", label: "Locations" },
      { to: "/testimonials", label: "Reviews" },
      { to: "/faq", label: "FAQs" },
    ],
  },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
] as const;

export const naira = (value: number) =>
  `₦${Math.round(value).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

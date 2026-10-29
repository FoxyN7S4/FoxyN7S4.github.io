// Works grouped by direction; each direction has its own page (<id>.html).
// shape: v = vertical 9:16, p = portrait 4:5, s = square, h = horizontal 16:9.
// img: true marks a still image. task / role / result show in the case card when filled in.
const SECTIONS = [
  {
    id: "brand",
    nav: "Brand",
    title: "Brand & SMM",
    lead: "Social motion for premium and tech brands at Red&White agency: product hero shots, typography and UI animation.",
    tags: ["Luxury", "Tech", "Typography", "Social formats"],
    works: [
      { id: "10_gazer_tv-ui",          shape: "s", brand: "Gazer",     title: "Smart TV AI search — UI motion" },
      { id: "11_bvlgari_snow-globe",   shape: "s", brand: "BVLGARI",   title: "Holiday snow globe" },
      { id: "12_montblanc_cube",       shape: "v", brand: "Montblanc", title: "Artist Prize cube" },
      { id: "13_bvlgari_wallpapers",   shape: "v", brand: "BVLGARI",   title: "Exclusive wallpapers" },
      { id: "40_bvlgari_ring",         shape: "v", brand: "BVLGARI",   title: "Serpenti ring" },
      { id: "42_montblanc_pen",        shape: "v", brand: "Montblanc", title: "Limited pen — wireframe reveal" },
      { id: "41_montblanc_collection", shape: "s", brand: "Montblanc", title: "Around the World in 80 Days" },
      { id: "14_pleso_app",            shape: "s", brand: "Pleso",     title: "Therapy app ad" },
      { id: "43_lira_jewelry",         shape: "p", brand: "Lira",      title: "Jewelry teaser" },
      { id: "44_praimy_logo",          shape: "s", brand: "Praimy",    title: "Logo reveal" },
    ],
  },
  {
    id: "3d",
    nav: "3D",
    title: "3D",
    lead: "Blender and Cinema 4D: brand objects, jewelry, abstract motion and hard-surface concepts.",
    tags: ["Blender", "Cinema 4D", "Product", "Hard surface"],
    works: [
      { id: "16_3d_node-motion",  shape: "h", brand: "3D",    title: "Node motion" },
      { id: "09_taimi_logo-3d",   shape: "s", brand: "Taimi", title: "3D logo" },
      { id: "26_3d_ring",         shape: "p", brand: "3D",    title: "Jewelry render", img: true },
      { id: "27_3d_rings",        shape: "p", brand: "3D",    title: "Signet rings", img: true },
      { id: "17_3d_willys",       shape: "h", brand: "3D",    title: "Willys — documentary" },
      { id: "22_3d_faberge",      shape: "h", brand: "3D",    title: "Fabergé egg", img: true },
      { id: "28_3d_faberge-2",    shape: "h", brand: "3D",    title: "Fabergé egg — studio", img: true },
      { id: "24_3d_plane",        shape: "h", brand: "3D",    title: "Aircraft concept", img: true },
      { id: "23_3d_tank",         shape: "h", brand: "3D",    title: "Armored vehicle concept", img: true },
      { id: "25_3d_crusher",      shape: "h", brand: "3D",    title: "Crusher concept", img: true },
    ],
  },
  {
    id: "igaming",
    nav: "iGaming",
    title: "iGaming",
    lead: "Performance creatives for slot and crash games: character animation, gameplay and bonus end cards. A short compliance-safe selection: 18+, no celebrities, no fake payment notifications, no cash or income claims. More on request.",
    tags: ["18+", "Character animation", "Gameplay", "Compliance-safe"],
    works: [
      { id: "63_igaming_chicken-road",    shape: "s", brand: "Chicken Road", title: "Character + gameplay" },
      { id: "64_igaming_chicken-road-v2", shape: "s", brand: "Chicken Road", title: "Character loop — V2" },
      { id: "65_igaming_chicken-road-v3", shape: "s", brand: "Chicken Road", title: "Character loop — V3" },
      { id: "62_igaming_olymp-static",    shape: "h", brand: "Olympus",      title: "Static — PWA banner", img: true },
    ],
  },
  {
    id: "product",
    nav: "Product",
    title: "Product UA creatives",
    lead: "Install-focused ads for Taimi, an LGBTQIA+ dating app by Appflame: UGC, app UI, AI visuals and fast variations for creative testing on Meta and TikTok.",
    tags: ["UGC", "App UI", "AI", "A/B variations", "Meta · TikTok"],
    works: [
      { id: "05_taimi_mobile-3d-phone",   shape: "v", brand: "Taimi", title: "Dating tips — 3D phone" },
      { id: "04_taimi_map-nearby",        shape: "v", brand: "Taimi", title: "Nearby map feature" },
      { id: "01_taimi_couple-knees",      shape: "v", brand: "Taimi", title: "Couple Knees — UGC + app UI" },
      { id: "03_taimi_open-doors-ugc",    shape: "v", brand: "Taimi", title: "We Met on Taimi — UGC" },
      { id: "08_taimi_ai-visual",         shape: "v", brand: "Taimi", title: "AI-generated visual" },
      { id: "34_taimi_ai-v1",             shape: "v", brand: "Taimi", title: "AI light-pattern portrait" },
      { id: "30_taimi_holiday-new",       shape: "v", brand: "Taimi", title: "Holiday Wish List — kinetic type" },
      { id: "31_taimi_holiday-rework",    shape: "v", brand: "Taimi", title: "Holiday Wish List — rework for test" },
      { id: "07_taimi_gay-receipt",       shape: "v", brand: "Taimi", title: "Receipt concept — V4" },
      { id: "33_taimi_receipt-v2",        shape: "v", brand: "Taimi", title: "Receipt concept — V2" },
      { id: "06_taimi_chat",              shape: "v", brand: "Taimi", title: "Chat UI — V1" },
      { id: "32_taimi_chat-v2",           shape: "v", brand: "Taimi", title: "Chat UI — V2" },
      { id: "02_taimi_messages-waiting",  shape: "v", brand: "Taimi", title: "Messages Waiting" },
      { id: "37_taimi_static-25m",        shape: "v", brand: "Taimi", title: "Static — 25M mutuals", img: true },
      { id: "35_taimi_static-mutuals",    shape: "v", brand: "Taimi", title: "Static — Try Taimi", img: true },
      { id: "36_taimi_static-illustration", shape: "p", brand: "Taimi", title: "Static — illustration", img: true },
      { id: "38_taimi_static-square",     shape: "s", brand: "Taimi", title: "Static — square", img: true },
      { id: "39_taimi_static-wide",       shape: "h", brand: "Taimi", title: "Static — landscape", img: true },
    ],
  },
  {
    id: "explainers",
    nav: "Explainers",
    title: "Explainers & storytelling",
    lead: "Motion graphics on top of talking-head video, animated maps and illustrated explainers for YouTube and social.",
    tags: ["Talking head", "Maps", "Illustration", "YouTube"],
    works: [
      { id: "15_explainer_collaboration",    shape: "v", brand: "Explainer",   title: "Collaboration tools" },
      { id: "50_explainer_virtual-meetings", shape: "v", brand: "Explainer",   title: "Brand your virtual meetings" },
      { id: "53_explainer_google-ads",       shape: "s", brand: "Explainer",   title: "Illustrated ad-tech explainer" },
      { id: "51_story_map-dialogue",         shape: "h", brand: "Documentary", title: "Animated map — dialogue" },
      { id: "52_story_map-scheme",           shape: "h", brand: "Documentary", title: "Animated map — scheme" },
    ],
  },
];

// Shown on the home page under "Selected work".
const FEATURED = ["40_bvlgari_ring", "10_gazer_tv-ui", "12_montblanc_cube", "63_igaming_chicken-road", "42_montblanc_pen", "41_montblanc_collection", "05_taimi_mobile-3d-phone", "16_3d_node-motion"];

// Cover video for each direction card on the home page.
const COVERS = { brand: "11_bvlgari_snow-globe", "3d": "16_3d_node-motion", igaming: "64_igaming_chicken-road-v2", product: "05_taimi_mobile-3d-phone", explainers: "15_explainer_collaboration" };

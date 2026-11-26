// Shopify Storefront API Configurations
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "whiskey-barrel-brand-site-ctpoy-9auzbm15.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "48e9398fd769b012597a64af42d8f17d";

// Shopify GraphQL Queries & Mutations
const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 10) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

// Helper: Custom Toast System
const toast = {
  success(message, submessage = "") {
    this.show(message, submessage, "border-ember text-ember shadow-ember/30");
  },
  error(message, submessage = "") {
    this.show(message, submessage, "border-destructive text-destructive shadow-destructive/20");
  },
  show(message, submessage, classes) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = "fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none";
      document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `bg-card border px-6 py-3 rounded-sm shadow-xl text-xs uppercase tracking-widest font-medium pointer-events-auto transition-all duration-300 opacity-0 translate-y-[-10px] ${classes}`;
    
    let html = `<div>${message}</div>`;
    if (submessage) {
      html += `<div class="text-[10px] text-muted-foreground mt-1 normal-case tracking-normal">${submessage}</div>`;
    }
    notification.innerHTML = html;
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('opacity-0', 'translate-y-[-10px]');
    }, 10);
    
    // Animate out & remove
    setTimeout(() => {
      notification.classList.add('opacity-0', 'translate-y-[-10px]');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
};

// Formatting money helper
function formatMoney(amount, currencyCode) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

// Shopify API request
async function storefrontApiRequest(query, variables = {}) {
  try {
    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (response.status === 402) {
      toast.error("Shopify: Payment required", "Shopify API access requires an active Shopify billing plan.");
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`Error calling Shopify: ${data.errors.map((e) => e.message).join(", ")}`);
    }
    return data;
  } catch (error) {
    console.error("Shopify Request Failed:", error);
    throw error;
  }
}

// Uploaded & Curated 72 Products for Whiskey Category
const WHISKEY_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-1",
      title: "Knob Creek Smoked Maple",
      handle: "knob-creek-smoked-maple",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Smoked Maple Flavored Bourbon",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "VIVINO", score: "4.8" }, { label: "AGED", score: "RESERVE" }],
      description: "Crafted with Kentucky Straight Bourbon Whiskey and natural smoked maple flavors. 100 proof small batch with rich maple sweetness and smoky charred oak finish.",
      priceRange: { minVariantPrice: { amount: "38.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-knob-creek-smoked-maple.webp", altText: "Knob Creek Smoked Maple Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey1", title: "750ml Bottle", price: { amount: "45.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-2",
      title: "Johnnie Walker Black Label 12 Year",
      handle: "johnnie-walker-black-label",
      category: "WHISKEY",
      country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
      composition: "🌾 Aged 12 Years Malt & Grain",
      type: "🥃 Blended Scotch Whisky",
      badges: [{ label: "VIVINO", score: "4.9" }, { label: "AGED", score: "RESERVE" }],
      description: "An iconic 12-year blended Scotch whisky delivering deep layers of luscious fruit, creamy toffee, and signature peat smoke.",
      priceRange: { minVariantPrice: { amount: "1.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-johnnie-walker-black-label.webp", altText: "Johnnie Walker Black Label 12 Year Blended Scotch Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey2", title: "700ml Bottle", price: { amount: "55.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-3",
      title: "Maker's Mark Kentucky Straight Bourbon",
      handle: "makers-mark-bourbon",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Red Winter Wheat & Corn",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "WE", score: "94" }, { label: "AGED", score: "RESERVE" }],
      description: "Handmade Kentucky straight bourbon whisky sealed with iconic red wax. Smooth, subtle vanilla, rich caramel, and soft wheated oak.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-makers-mark-bourbon.webp", altText: "Maker's Mark Kentucky Straight Bourbon Whiskey bottle with red wax seal and a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey3", title: "750ml Bottle", price: { amount: "42.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-4",
      title: "Jim Beam Devil's Cut 90 Proof",
      handle: "jim-beam-devils-cut",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Extra Aged Barrel Extraction",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "RP", score: "91" }, { label: "AGED", score: "RESERVE" }],
      description: "Extracted directly from deep inside the barrel walls and blended with extra-aged bourbon. Robust, deep charred wood, warm vanilla, and bold finish.",
      priceRange: { minVariantPrice: { amount: "23.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-jim-beam-devils-cut.webp", altText: "Jim Beam Devil's Cut 90 Proof Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey4", title: "750ml Bottle", price: { amount: "38.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-5",
      title: "Fireball Cinnamon Whisky",
      handle: "fireball-cinnamon-whisky",
      category: "WHISKEY",
      country: "🇨🇦 Canada",
      composition: "🌾 Canadian Whisky & Hot Cinnamon",
      type: "🥃 Cinnamon Flavored Whisky",
      badges: [{ label: "VIVINO", score: "4.6" }, { label: "AGED", score: "RESERVE" }],
      description: "The original hot cinnamon whisky crafted with smooth Canadian whisky and real fiery cinnamon. Red-hot taste with a spicy kick.",
      priceRange: { minVariantPrice: { amount: "28.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-fireball-cinnamon.webp", altText: "Fireball Cinnamon Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey5", title: "1.75L Bottle", price: { amount: "32.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-6",
      title: "Blue Note Crossroads Straight Bourbon",
      handle: "blue-note-crossroads",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Toasted Oak Staves Finish",
      type: "🥃 Straight Bourbon Whiskey",
      badges: [{ label: "WE", score: "93" }, { label: "AGED", score: "RESERVE" }],
      description: "Crafted in Memphis, finished with toasted French and American oak staves at 100 proof. Notes of honeycomb, sweet tobacco, and spiced molasses.",
      priceRange: { minVariantPrice: { amount: "44.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-blue-note-crossroads.webp", altText: "Blue Note Crossroads Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey6", title: "750ml Bottle", price: { amount: "49.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-7",
      title: "Woodford Reserve Distiller's Select",
      handle: "woodford-reserve-select",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 High Rye & Toasted Oak",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "VIVINO", score: "4.9" }, { label: "AGED", score: "RESERVE" }],
      description: "Superbly balanced small-batch Kentucky straight bourbon whiskey. Over 200 distinct flavor notes from bold grain and wood to sweet aromatics and fruit.",
      priceRange: { minVariantPrice: { amount: "34.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-woodford-reserve-select.webp", altText: "Woodford Reserve Distiller's Select Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey7", title: "750ml Bottle", price: { amount: "58.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-8",
      title: "Jack Daniel's Old No. 7 Tennessee Whiskey",
      handle: "jack-daniels-old-no7",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Charcoal Mellowed Sour Mash",
      type: "🥃 Tennessee Sour Mash Whiskey",
      badges: [{ label: "WE", score: "92" }, { label: "AGED", score: "RESERVE" }],
      description: "Mellowed drop by drop through 10 feet of sugar maple charcoal and matured in handcrafted barrels in Lynchburg, Tennessee.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-jack-daniels-old-no7.webp", altText: "Jack Daniel's Old No. 7 Tennessee Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey8", title: "750ml Bottle", price: { amount: "36.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-9",
      title: "Bulleit Rye 12 Year Frontier Whiskey",
      handle: "bulleit-rye-12-year",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 95% Rye Mash Bill Aged 12 Years",
      type: "🥃 Straight American Rye Whiskey",
      badges: [{ label: "RP", score: "95" }, { label: "AGED", score: "RESERVE" }],
      description: "Aged 12 years with an exceptionally high 95% rye mash bill. Unmistakable spice, lingering leather, dried fruit, and toasted oak.",
      priceRange: { minVariantPrice: { amount: "26.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bulleit-rye-12-years.webp", altText: "Bulleit Rye 12 Year Frontier Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey9", title: "750ml Bottle", price: { amount: "64.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-10",
      title: "Jameson Triple Distilled Irish Whiskey",
      handle: "jameson-triple-distilled",
      category: "WHISKEY",
      country: "🇮🇪 Ireland",
      composition: "🌾 Triple Distilled Pot Still & Grain",
      type: "🥃 Irish Whiskey",
      badges: [{ label: "VIVINO", score: "4.8" }, { label: "AGED", score: "RESERVE" }],
      description: "Triple distilled and aged in oak casks for a remarkably smooth balance of spicy, nutty, and vanilla notes with hints of sweet sherry.",
      priceRange: { minVariantPrice: { amount: "26.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-jameson-triple-distilled.webp", altText: "Jameson Triple Distilled Irish Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey10", title: "750ml Bottle", price: { amount: "39.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-11",
      title: "Crown Royal KC Limited Edition",
      handle: "crown-royal-kc-edition",
      category: "WHISKEY",
      country: "🇨🇦 Canada",
      composition: "🌾 Special Reserve Kansas City Blend",
      type: "🥃 Canadian Whisky",
      badges: [{ label: "VIVINO", score: "4.9" }, { label: "AGED", score: "RESERVE" }],
      description: "Limited Edition Kansas City Blend housed in a regal faceted decanter bottle. Silky vanilla, toasted oak, and luscious caramelized stone fruit.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-crown-royal-kc-edition.webp", altText: "Crown Royal KC Limited Edition Canadian Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey11", title: "750ml Bottle", price: { amount: "68.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-12",
      title: "Elijah Craig 1789 Single Barrel 100 Proof",
      handle: "elijah-craig-1789-single-barrel",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Deep Charred Oak Single Barrel",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "RP", score: "96" }, { label: "AGED", score: "RESERVE" }],
      description: "Single Barrel Kentucky straight bourbon whiskey bottled at 100 proof. Warm spice, rich caramel, roasted pecan, and a full-bodied finish.",
      priceRange: { minVariantPrice: { amount: "32.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-elijah-craig-1789.webp", altText: "Elijah Craig 1789 Single Barrel 100 Proof Bourbon bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey12", title: "750ml Bottle", price: { amount: "52.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-13",
      title: "Four Roses Kentucky Straight Bourbon",
      handle: "four-roses-bourbon",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Handcrafted Mash Bill Blend",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "WE", score: "93" }, { label: "AGED", score: "RESERVE" }],
      description: "Distilled and aged in Kentucky. Gentle aromas of pear and floral accents mingling with gentle spice, crisp fruit, and sweet honeyed finish.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-four-roses-bourbon.webp", altText: "Four Roses Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey13", title: "750ml Bottle", price: { amount: "35.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-14",
      title: "Dewar's 'White Label' Blended Scotch",
      handle: "dewars-white-label",
      category: "WHISKEY",
      country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
      composition: "🌾 Scottish Highland Malts Blend",
      type: "🥃 Blended Scotch Whisky",
      badges: [{ label: "VIVINO", score: "4.7" }, { label: "AGED", score: "RESERVE" }],
      description: "Crafted since 1846 by John Dewar & Sons. Over 40 fine malt and grain whiskies blended and married in vintage oak casks for unmatched smoothness.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-dewars-white-label.webp", altText: "Dewar's White Label Blended Scotch Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey14", title: "750ml Bottle", price: { amount: "34.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-15",
      title: "Wild Turkey 101 Proof Bourbon",
      handle: "wild-turkey-101",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌽 Heavy #4 Deep Alligator Char",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "WE", score: "94" }, { label: "AGED", score: "RESERVE" }],
      description: "Genuine Kentucky Straight Bourbon crafted at 101 proof and aged in #4 deep alligator char barrels. High rye spice, bold vanilla, and rich toffee.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-wild-turkey-101.webp", altText: "Wild Turkey 101 Proof Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey15", title: "750ml Bottle", price: { amount: "40.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
,
  // Newly Uploaded Whiskeys (Authentic Bottles - No Best Seller Tag)
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-16",
      title: "Basil Hayden Kentucky Straight Bourbon Whiskey",
      handle: "basil-hayden-bourbon",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 High-Rye Mash Bill & Charred Oak",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "SMALL BATCH", score: "KENTUCKY" }],
      isBestSeller: false,
      description: "Artfully aged in Kentucky with a trademark high-rye mashbill. Golden amber hue with aromas of spice, tea, and hints of peppermint, followed by gentle rye warmth and clean vanilla on the finish.",
      priceRange: { minVariantPrice: { amount: "41.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-basil-hayden.webp", altText: "Basil Hayden Kentucky Straight Bourbon Whiskey bottle in presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey16", title: "750ml Bottle", price: { amount: "41.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-17",
      title: "Michter's US*1 Small Batch Bourbon Whiskey",
      handle: "michters-us1-small-batch",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Select Grain Mash & Fire-Charred Oak",
      type: "🥃 Small Batch Bourbon",
      badges: [{ label: "US*1", score: "SMALL BATCH" }],
      isBestSeller: false,
      description: "Truly small batch Kentucky straight bourbon crafted in batches of no more than twenty barrels. Rich notes of dried fruit, candied pecans, rich vanilla, and warm baking spices.",
      priceRange: { minVariantPrice: { amount: "45.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-michters-us1.webp", altText: "Michter's US*1 Small Batch Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey17", title: "750ml Bottle", price: { amount: "45.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-18",
      title: "Evan Williams Kentucky Straight Bourbon Whiskey",
      handle: "evan-williams-black-label",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Corn, Malted Barley & Rye",
      type: "🥃 Kentucky Straight Bourbon",
      badges: [{ label: "ESTD 1783", score: "KENTUCKY" }],
      isBestSeller: false,
      description: "Named after Kentucky's first commercial distiller who began distilling along the Ohio River in 1783. Aged far longer than required by law, delivering deep vanilla, mint, and toasted oak.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-evan-williams.webp", altText: "Evan Williams Kentucky Straight Bourbon Whiskey bottle in presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey18", title: "750ml Bottle", price: { amount: "15.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-19",
      title: "Angel's Envy Kentucky Straight Bourbon Whiskey",
      handle: "angels-envy-port-finish",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Bourbon Finished in Port Wine Barrels",
      type: "🥃 Port Barrel Finished Bourbon",
      badges: [{ label: "PORT WINE", score: "FINISHED" }],
      isBestSeller: false,
      description: "Crafted in Louisville, Kentucky and finished in hand-selected ruby port wine casks for 3 to 6 months. Exceptional complexity with golden syrup, raisins, rich maple, and subtle dark chocolate.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-angels-envy.webp", altText: "Angel's Envy Kentucky Straight Bourbon Whiskey Finished in Port Wine Barrels bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey19", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-20",
      title: "Larceny Small Batch Wheated Bourbon 92 Proof",
      handle: "larceny-small-batch-bourbon",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Wheated Mashbill & Charred American Oak",
      type: "🥃 Small Batch Wheated Bourbon",
      badges: [{ label: "92 PROOF", score: "WHEATED" }],
      isBestSeller: false,
      description: "Using wheat instead of rye as the secondary grain, Larceny delivers a velvety soft mouthfeel and luscious sweetness with notes of fresh baked bread, butterscotch, and honeyed oak.",
      priceRange: { minVariantPrice: { amount: "26.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-larceny-small-batch.webp", altText: "Larceny Small Batch Wheated Bourbon 92 Proof bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey20", title: "750ml Bottle", price: { amount: "26.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-21",
      title: "Crown Royal Regal Apple Flavored Whisky",
      handle: "crown-royal-regal-apple",
      category: "WHISKEY",
      country: "🇨🇦 Canada",
      composition: "🌾 Canadian Whisky Infused with Gala Apples",
      type: "🥃 Flavored Canadian Whisky",
      badges: [{ label: "REGAL GALA", score: "APPLE" }],
      isBestSeller: false,
      description: "Masterfully blended Crown Royal Canadian whisky infused with crisp Regal Gala apples. A lively harmony of tart, crisp apple sweetness balanced with spicy notes of rich Canadian whisky.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-crown-royal-apple.webp", altText: "Crown Royal Regal Apple Flavored Whisky bottle in presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey21", title: "750ml Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-22",
      title: "Crown Royal Fine De Luxe Blended Canadian Whisky",
      handle: "crown-royal-deluxe",
      category: "WHISKEY",
      country: "🇨🇦 Canada",
      composition: "🌾 50 Distinct Rich Canadian Whiskies",
      type: "🥃 Blended Canadian Whisky",
      badges: [{ label: "FINE DE LUXE", score: "CANADA" }],
      isBestSeller: false,
      description: "The timeless standard of Canadian whisky excellence, originally created to celebrate King George VI's visit in 1939. Blend of 50 full-bodied whiskies aged to absolute perfection.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-crown-royal-deluxe.webp", altText: "Crown Royal Fine De Luxe Blended Canadian Whisky bottle in purple presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey22", title: "750ml Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-23",
      title: "Jim Beam Kentucky Straight Bourbon Whiskey 1.75L",
      handle: "jim-beam-white-label-175l",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Corn, Rye, Malted Barley 4 Years Aged",
      type: "🥃 Kentucky Straight Bourbon 1.75L",
      badges: [{ label: "ESTD 1795", score: "1.75 LITERS" }],
      isBestSeller: false,
      description: "The world's No. 1 Kentucky straight bourbon whiskey. Aged for 4 full years in newly charred American white oak barrels for classic vanilla sweetness and a gentle oak finish in a large 1.75L bottle.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-jim-beam-175l.webp", altText: "Jim Beam Kentucky Straight Bourbon Whiskey 1.75L bottle in presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey23", title: "1.75L Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-24",
      title: "Jack Daniel's Tennessee Honey Liqueur",
      handle: "jack-daniels-tennessee-honey",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Old No. 7 Whiskey & Natural Honey Liqueur",
      type: "🥃 Honey Whiskey Liqueur",
      badges: [{ label: "HONEY", score: "TENNESSEE" }],
      isBestSeller: false,
      description: "A delicious blend of Jack Daniel's Old No. 7 Tennessee Whiskey and a proprietary honey liqueur of our own making, offering a taste that's unexpected and undeniably Jack.",
      priceRange: { minVariantPrice: { amount: "26.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-jack-daniels-honey.webp", altText: "Jack Daniel's Tennessee Honey Liqueur bottle in cream presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey24", title: "750ml Bottle", price: { amount: "26.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-25",
      title: "Gentleman Jack Double Mellowed Tennessee Whiskey",
      handle: "gentleman-jack-tennessee-whiskey",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Charcoal Mellowed Twice for Rare Smoothness",
      type: "🥃 Double Mellowed Tennessee Whiskey",
      badges: [{ label: "DOUBLE", score: "MELLOWED" }],
      isBestSeller: false,
      description: "Inspired by our founder, Gentleman Jack undergoes a second charcoal mellowing after aging to achieve unprecedented smoothness. Warm caramel, sweet vanilla, and delicate apple oak.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-gentleman-jack.webp", altText: "Gentleman Jack Double Mellowed Tennessee Whiskey bottle in black presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey25", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-26",
      title: "Old Forester 100 Proof Kentucky Straight Bourbon Whisky",
      handle: "old-forester-100-proof",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Rich High-Rye Grain Mashbill",
      type: "🥃 100 Proof Straight Bourbon",
      badges: [{ label: "100 PROOF", score: "ESTD 1870" }],
      isBestSeller: false,
      description: "Handcrafted using the time-honored recipe formulated in 1870. Bottled at 100 proof to maintain its full flavor profile: roasted coffee, ripe cherry, rich tobacco leaf, and charred oak.",
      priceRange: { minVariantPrice: { amount: "22.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-old-forester-100.webp", altText: "Old Forester 100 Proof Kentucky Straight Bourbon Whisky bottle in black presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey26", title: "750ml Bottle", price: { amount: "22.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-27",
      title: "Knob Creek 9 Year Small Batch Bourbon 100 Proof",
      handle: "knob-creek-9-year-bourbon",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Aged 9 Years in Maximum Char Oak",
      type: "🥃 9 Year Aged 100 Proof Bourbon",
      badges: [{ label: "AGED 9 YRS", score: "100 PROOF" }],
      isBestSeller: false,
      description: "Patiently aged for a full 9 years in deeply charred American oak barrels and bottled at an honest 100 proof. Deep copper color with rich copper, maple sugar, toasted nuts, and long warm oak finish.",
      priceRange: { minVariantPrice: { amount: "39.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-knob-creek-9yr.webp", altText: "Knob Creek 9 Year Small Batch Bourbon 100 Proof bottle in wood-grain presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey27", title: "750ml Bottle", price: { amount: "39.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-28",
      title: "Rittenhouse Straight Rye Whisky Bottled-in-Bond",
      handle: "rittenhouse-rye-bottled-in-bond",
      category: "WHISKEY",
      country: "🇺🇸 United States",
      composition: "🌾 Rye, Corn, Malted Barley Bottled-in-Bond",
      type: "🥃 Bottled-in-Bond 100 Proof Rye",
      badges: [{ label: "BONDED", score: "100 PROOF" }],
      isBestSeller: false,
      description: "Produced in the traditional Pennsylvania rye style, Bottled-in-Bond at 100 proof under strict U.S. government supervision. Exceptional spicy rye character, cocoa, citrus peel, and cinnamon oak.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-rittenhouse-rye.webp", altText: "Rittenhouse Straight Rye Whisky Bottled-in-Bond 100 Proof bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey28", title: "750ml Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-29",
      title: "Glenfiddich 14 Year Old Bourbon Barrel Reserve",
      handle: "glenfiddich-14-bourbon-barrel",
      category: "WHISKEY",
      country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
      composition: "🌾 100% Malted Barley Finished in Charred Oak",
      type: "🥃 Speyside Single Malt Scotch",
      badges: [{ label: "AGED 14 YRS", score: "SPEYSIDE" }],
      isBestSeller: false,
      description: "Matured for 14 years in ex-bourbon American oak casks, then finished in deep-charred new American oak barrels crafted by the Kelvin Cooperage in Louisville, Kentucky. Ripe summer fruits, creamy toffee, and toasted oak.",
      priceRange: { minVariantPrice: { amount: "62.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-glenfiddich-14.webp", altText: "Glenfiddich 14 Year Old Bourbon Barrel Reserve Speyside Single Malt Scotch bottle in blue cylinder tin with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey29", title: "750ml Bottle", price: { amount: "62.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-30",
      title: "Monkey Shoulder Blended Malt Scotch Whisky",
      handle: "monkey-shoulder-scotch",
      category: "WHISKEY",
      country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
      composition: "🌾 100% Speyside Malt Whiskies Married in Bourbon Casks",
      type: "🥃 100% Malt Blended Scotch",
      badges: [{ label: "BATCH 27", score: "MALT SCOTCH" }],
      isBestSeller: false,
      description: "A free-spirited, rich and smooth blended malt crafted from small batches of three of Speyside's finest single malt whiskies, married together in first-fill ex-bourbon casks. Zesty orange, vanilla, honey, and spiced oak.",
      priceRange: { minVariantPrice: { amount: "31.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-monkey-shoulder.webp", altText: "Monkey Shoulder The Original Blended Malt Scotch Whisky bottle with three brass monkeys emblem and a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey30", title: "750ml Bottle", price: { amount: "31.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
,
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-31",
      title: "Bushmills The Original Irish Whiskey",
      handle: "bushmills-original-irish-whiskey",
      category: "WHISKEY",
      country: "🇮🇪 Ireland",
      composition: "🌾 Triple Distilled Malt & Grain Whiskies",
      type: "🥃 Classic Irish Whiskey",
      badges: [{ label: "SINCE 1608", score: "TRIPLE DISTILLED" }],
      isBestSeller: false,
      description: "Crafted at Ireland's oldest licensed distillery (granted 1608). Combining triple-distilled single malt whiskey with a lighter grain whiskey, aged in American oak bourbon casks. Crisp and light with rich warming fruit, vanilla, and honey.",
      priceRange: { minVariantPrice: { amount: "28.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bushmills-original.webp", altText: "Bushmills The Original Irish Whiskey bottle with embossed 1608 logo and a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey31", title: "750ml Bottle", price: { amount: "28.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-32",
      title: "Chivas Regal 12 Year Old Blended Scotch Whisky",
      handle: "chivas-regal-12-year-scotch",
      category: "WHISKEY",
      country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
      composition: "🌾 Strathisla Single Malt & Premium Grain Whiskies",
      type: "🥃 12 Year Blended Scotch",
      badges: [{ label: "AGED 12 YRS", score: "SPEYSIDE" }],
      isBestSeller: false,
      description: "An iconic blend of Strathisla single malts and smooth grain whiskies, each aged for a minimum of 12 years. Radiant, warm amber color with wild herbs, heather, honey, and orchard fruits.",
      priceRange: { minVariantPrice: { amount: "39.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-chivas-regal-12.webp", altText: "Chivas Regal 12 Year Old Blended Scotch Whisky bottle in silver presentation box with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey32", title: "1L Bottle", price: { amount: "39.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-33",
      title: "Hennessy Very Special (V.S) Cognac",
      handle: "hennessy-vs-cognac",
      category: "WHISKEY",
      country: "🇫🇷 France",
      composition: "🍇 Ugni Blanc Grapes & French Limousin Oak",
      type: "🥃 French V.S Cognac",
      badges: [{ label: "COGNAC", score: "1765" }, { label: "AGED", score: "V.S" }],
      isBestSeller: false,
      description: "The world's most popular Cognac, crafted in Cognac, France since 1765. Masterfully blended from up to 40 eaux-de-vie matured in French Limousin oak barrels, offering rich aromas of toasted oak, roasted almond, and fresh grapes with a vibrant, warming finish.",
      priceRange: { minVariantPrice: { amount: "44.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-hennessy-vs-cognac.webp", altText: "Bottle of Hennessy V.S Cognac on dark marble bar with Paris Eiffel Tower evening view" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey33", title: "750ml Bottle", price: { amount: "44.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-34",
      title: "Baker's 7 Year Single Barrel Bourbon - 750 mL",
      handle: "bakers-7-year-single-barrel",
      category: "WHISKEY",
      country: "Kentucky, United States",
      composition: "Corn-based bourbon mash; exact ratios not stated by producer",
      type: "Kentucky straight single-barrel bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Standard 7-year single-barrel Baker’s at 107 proof. 750 mL.",
      priceRange: { minVariantPrice: { amount: "69.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bakers-7-year.webp", altText: "Baker's 7 Year Single Barrel 107 Proof Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey34", title: "750ml Bottle", price: { amount: "69.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-35",
      title: "Bardstown Origin Series High Wheat Bourbon - 750 mL",
      handle: "bardstown-origin-high-wheat",
      category: "WHISKEY",
      country: "Bardstown, Kentucky, United States",
      composition: "53% corn, 39% wheat and 8% malted barley",
      type: "Kentucky straight wheated bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Origin High Wheat, six years and 106 proof. Producer sell sheet confirms UPC 857552008806. 750 mL.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bardstown-origin-high-wheat.webp", altText: "Bardstown Bourbon Company Origin Series High Wheat Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey35", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-36",
      title: "Bardstown Origin Series Bottled-in-Bond Bourbon - 750 mL",
      handle: "bardstown-origin-bottled-in-bond",
      category: "WHISKEY",
      country: "Bardstown, Kentucky, United States",
      composition: "68% corn, 20% wheat and 12% malted barley",
      type: "Bottled-in-bond Kentucky straight wheated bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Estate-distilled Origin Bottled-in-Bond, aged six years and bottled at 100 proof. 750 mL.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bardstown-origin-bottled-in-bond.webp", altText: "Bardstown Bourbon Company Origin Series Bottled-in-Bond Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey36", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-37",
      title: "Balcones Baby Blue Corn Whisky - 750 mL",
      handle: "balcones-baby-blue-corn-whisky",
      category: "WHISKEY",
      country: "Waco, Texas, United States",
      composition: "Roasted blue corn",
      type: "Texas corn whisky",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Baby Blue pot-distilled corn whisky at 92 proof. 750 mL.",
      priceRange: { minVariantPrice: { amount: "39.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-balcones-baby-blue.webp", altText: "Balcones Baby Blue Roasted Blue Corn Texas Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey37", title: "750ml Bottle", price: { amount: "39.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-38",
      title: "Balblair 15 Year Single Malt Scotch Whisky - 750 mL",
      handle: "balblair-15-year-single-malt",
      category: "WHISKEY",
      country: "Edderton, Scottish Highlands, United Kingdom",
      composition: "Malted barley",
      type: "Highland single malt Scotch whisky",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "15-year age statement. Matured in American oak ex-bourbon casks and first-fill ex-sherry oak. 750 mL.",
      priceRange: { minVariantPrice: { amount: "124.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-balblair-15-year.webp", altText: "Balblair 15 Year Old Highland Single Malt Scotch Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey38", title: "750ml Bottle", price: { amount: "124.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-39",
      title: "Balcones Texas Pot Still Bourbon - 750 mL",
      handle: "balcones-texas-pot-still-bourbon",
      category: "WHISKEY",
      country: "Waco, Texas, United States",
      composition: "Roasted blue corn, Texas wheat, Texas rye and malted barley",
      type: "Texas pot-still straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Four-grain bourbon matured in new American oak. 750 mL.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-balcones-texas-pot-still.webp", altText: "Balcones Texas Pot Still Straight Bourbon Whisky bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey39", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-40",
      title: "Backbone Uncut Straight Bourbon - 750 mL",
      handle: "backbone-bourbon-uncut",
      category: "WHISKEY",
      country: "Indiana, United States",
      composition: "75% corn, 21% rye and 4% malted barley",
      type: "Barrel-proof straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Backbone Uncut is bottled undiluted. The producer's published batch 29 and original source photo show 116.6 proof / 58.3% ABV. Confirm the inventory batch before using that strength.",
      priceRange: { minVariantPrice: { amount: "54.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-backbone-bourbon-uncut.webp", altText: "Backbone Bourbon Uncut Batch #29 Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey40", title: "750ml Bottle", price: { amount: "54.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-41",
      title: "Bardstown Origin Series Rye Whiskey - 750 mL",
      handle: "bardstown-origin-toasted-cherry-rye",
      category: "WHISKEY",
      country: "Bardstown, Kentucky, United States",
      composition: "95% rye and 5% malted barley",
      type: "Kentucky straight rye whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Origin rye, six years, finished in toasted cherry wood and oak barrels. 750 mL.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bardstown-origin-toasted-cherry-rye.webp", altText: "Bardstown Bourbon Company Origin Series Kentucky Straight Rye Whiskey Finished in Toasted Cherry Wood and Oak Barrels with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey41", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-42",
      title: "2XO American Oak Bourbon - 750 mL",
      handle: "2xo-american-oak-bourbon",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-forward bourbon mash",
      type: "Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "American Oak is part of the 2XO Oak Series.",
      priceRange: { minVariantPrice: { amount: "44.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-2xo-american-oak-bourbon.webp", altText: "2XO American Oak Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey42", title: "750ml Bottle", price: { amount: "44.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-43",
      title: "Barrell Foundation Bourbon - 750 mL",
      handle: "barrell-foundation-bourbon",
      category: "WHISKEY",
      country: "United States; blended and bottled in Kentucky",
      composition: "Derived blend mash bill: 73% corn, 23% rye and 4% malted barley",
      type: "Blend of straight bourbon whiskeys",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Standard Foundation blends bourbons from Kentucky, Indiana, Tennessee and Maryland. 100 proof, 750 mL.",
      priceRange: { minVariantPrice: { amount: "55.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-barrell-foundation-bourbon.webp", altText: "Barrell Foundation Bourbon Aged 5 Years A Blend of Straight Bourbon Whiskeys bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey43", title: "750ml Bottle", price: { amount: "55.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-44",
      title: "Barrell Dovetail Whiskey - 750 mL",
      handle: "barrell-dovetail-whiskey",
      category: "WHISKEY",
      country: "United States",
      composition: "Bourbon and other American whiskey components",
      type: "Cask-strength barrel-finished whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "The original Dovetail source bottle shows 125.42 proof / 62.71% ABV. This is the pictured batch. Release strengths vary, so confirm the inventory bottle label. Finished in Cabernet, Port and rum casks.",
      priceRange: { minVariantPrice: { amount: "89.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-barrell-dovetail.webp", altText: "Barrell Dovetail Whiskey Finished in Rum Port and Cabernet Barrels Cask Strength bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey44", title: "750ml Bottle", price: { amount: "89.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-45",
      title: "Compass Box Artist Blend Scotch Whisky - 750 mL",
      handle: "compass-box-artist-blend",
      category: "WHISKEY",
      country: "Scotland, United Kingdom",
      composition: "Malt Scotch whisky, grain Scotch whisky",
      type: "Blended Scotch whisky",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Compass Box Artist Blend 750 mL. The producer lists about 55% malt whisky in the blend.",
      priceRange: { minVariantPrice: { amount: "34.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-compass-box-artist-blend.webp", altText: "Compass Box Artist Blend Scotch Whisky Fruity Creamy Rich bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey45", title: "750ml Bottle", price: { amount: "34.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-46",
      title: "Barrell Seagrass Rye Whiskey - 750 mL",
      handle: "barrell-seagrass-rye",
      category: "WHISKEY",
      country: "United States and Canada",
      composition: "American and Canadian rye whiskeys",
      type: "Cask-strength barrel-finished rye whiskey blend",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "NC ABC lists this exact UPC at 118.4 proof / 59.2% ABV. This is a regulatory reference value. The source photo has blank proof fields and releases vary, so confirm the inventory bottle label. Finished in rhum, Madeira and apricot-brandy casks.",
      priceRange: { minVariantPrice: { amount: "85.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-barrell-seagrass-rye.webp", altText: "Barrell Seagrass Rye Whiskey Finished in Martinique Rum Madeira and Apricot Brandy Barrels Cask Strength bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey46", title: "750ml Bottle", price: { amount: "85.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-47",
      title: "Widow Jane Baby Jane Bourbon - 750 mL",
      handle: "widow-jane-baby-jane",
      category: "WHISKEY",
      country: "New York and Kentucky, United States",
      composition: "Proprietary Baby Jane heirloom corn; other mash grains undisclosed in the cited release",
      type: "Blend of straight bourbon whiskeys",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Small-batch blend of Brooklyn and Kentucky bourbon. 750 mL.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-widow-jane-baby-jane.webp", altText: "Widow Jane Baby Jane Distilled from Proprietary Heirloom Corn Straight Bourbon Whiskeys bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey47", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-48",
      title: "291 Colorado Barrel Proof Single Barrel Bourbon - 750 mL",
      handle: "291-barrel-proof-colorado-bourbon",
      category: "WHISKEY",
      country: "Colorado, USA",
      composition: "Corn-forward bourbon mash",
      type: "Barrel-proof single-barrel bourbon",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Published reference for this UPC is 63% ABV. Barrel proof varies. The source image shows a 66.9% straight-bourbon bottling, so confirm the pictured expression and batch against the inventory bottle.",
      priceRange: { minVariantPrice: { amount: "119.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-291-barrel-proof-colorado.webp", altText: "291 Barrel Proof Colorado Straight Bourbon Whiskey Finished with Aspen Wood Staves bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey48", title: "750ml Bottle", price: { amount: "119.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-49",
      title: "1792 Small Batch Bourbon - 1.75 L",
      handle: "1792-small-batch-bourbon-175l",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-forward grain mash with rye",
      type: "Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "High-rye Small Batch expression in the 1.75 L bottle.",
      priceRange: { minVariantPrice: { amount: "59.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-1792-small-batch-175l.webp", altText: "1792 Small Batch Kentucky Straight Bourbon Whiskey 1.75L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey49", title: "1.75L Bottle", price: { amount: "59.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-50",
      title: "Aberlour 12 Year Single Malt Scotch Whisky - 750 mL",
      handle: "aberlour-12-year-speyside-single-malt",
      category: "WHISKEY",
      country: "Scotland (Speyside, Aberlour)",
      composition: "Malted barley",
      type: "Speyside single malt Scotch whisky",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Current Pernod Ricard U.S. supplier record for UPC 080432102145 and the original 750 mL bottle photos show 40% ABV / 80 proof. NC ABC has a 43% entry for the same UPC. Use 40% as the U.S. reference and check the inventory label.",
      priceRange: { minVariantPrice: { amount: "64.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-aberlour-12-year.webp", altText: "Aberlour Speyside Single Malt Scotch Whisky Double Cask Matured 12 Years Old bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey50", title: "750ml Bottle", price: { amount: "64.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-51",
      title: "Aberfeldy Highland Single Malt Scotch Whisky - 750 mL",
      handle: "aberfeldy-12-year-highland-single-malt",
      category: "WHISKEY",
      country: "Scotland (Highlands, Aberfeldy)",
      composition: "Malted barley",
      type: "Highland single malt Scotch whisky",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "12 years old. Honeyed malt with fruit, spice and vanilla.",
      priceRange: { minVariantPrice: { amount: "59.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-aberfeldy-12-year.webp", altText: "Aberfeldy Highland Single Malt Scotch Whisky 12 Years in Oak bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey51", title: "750ml Bottle", price: { amount: "59.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-52",
      title: "Ancient Age Bourbon - 1.75 L",
      handle: "ancient-age-bourbon-175l",
      category: "WHISKEY",
      country: "Frankfort, Kentucky, USA",
      composition: "Corn, rye, malted barley",
      type: "Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Ancient Age 1.75 L, 80 proof. The distillery does not publish the mash proportions.",
      priceRange: { minVariantPrice: { amount: "26.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-ancient-age-bourbon-175l.webp", altText: "Ancient Age Kentucky Straight Bourbon Whiskey 1.75L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey52", title: "1.75L Bottle", price: { amount: "26.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-53",
      title: "1792 Small Batch Bourbon - 750 mL",
      handle: "1792-small-batch-bourbon",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-forward grain mash with rye",
      type: "Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "High-rye Small Batch expression in the 750 mL bottle. Label artwork may vary.",
      priceRange: { minVariantPrice: { amount: "30.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-1792-small-batch-bourbon.webp", altText: "1792 Small Batch Kentucky Straight Bourbon Whiskey 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey53", title: "750ml Bottle", price: { amount: "30.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-54",
      title: "1620 Small Batch Bourbon - 750 mL",
      handle: "1620-small-batch-bourbon",
      category: "WHISKEY",
      country: "USA",
      composition: "Corn, rye, malted barley",
      type: "Small batch bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "The 90-proof Small Batch expression. The distiller lists Full Proof as a separate product.",
      priceRange: { minVariantPrice: { amount: "39.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-1620-small-batch-bourbon.webp", altText: "1620 Distilling Company Small Batch Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey54", title: "750ml Bottle", price: { amount: "39.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-55",
      title: "Ancient Age Bourbon - 750 mL",
      handle: "ancient-age-bourbon-750ml",
      category: "WHISKEY",
      country: "Frankfort, Kentucky, USA",
      composition: "Corn, rye, malted barley",
      type: "Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Ancient Age 750 mL, 80 proof.",
      priceRange: { minVariantPrice: { amount: "13.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-ancient-age-bourbon-750ml.webp", altText: "Ancient Age Kentucky Straight Bourbon Whiskey 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey55", title: "750ml Bottle", price: { amount: "13.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-56",
      title: "Angel's Envy Triple Oak Bourbon - 750 mL",
      handle: "angels-envy-triple-oak-bourbon",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-based bourbon grain mash",
      type: "Oak-finished Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Angel's Envy Triple Oak 750 mL, 92 proof. Finished in French, Hungarian and Chinkapin oak.",
      priceRange: { minVariantPrice: { amount: "79.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-angels-envy-triple-oak.webp", altText: "Angel's Envy Triple Oak Kentucky Straight Bourbon Whiskey Finished in Hungarian Chinkapin and French Oak Barrels bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey56", title: "750ml Bottle", price: { amount: "79.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-57",
      title: "Angel's Envy Bourbon - 375 mL",
      handle: "angels-envy-port-finish-375ml",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-based bourbon grain mash",
      type: "Port-finished Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Angel's Envy Signature Series 375 mL, finished in port wine barrels. Maine lists 86.6 proof for this UPC.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-angels-envy-port-finish-375ml.webp", altText: "Angel's Envy Kentucky Straight Bourbon Whiskey Finished in Port Wine Barrels 375ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey57", title: "375ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-58",
      title: "Augusta 10 Year Single Barrel Bourbon - 750 mL",
      handle: "augusta-buckners-10-year-single-barrel",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-based bourbon grain mash",
      type: "Single-barrel Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Buckner's 10 Year source bottle shows 120.4 proof / 60.2% ABV, corroborated by an exact-UPC retailer record. This is a pictured single-barrel value. Confirm the inventory barrel's label.",
      priceRange: { minVariantPrice: { amount: "159.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-augusta-buckners-10-year.webp", altText: "Augusta Distillery Buckner's Single Barrel Aged 10 Years Unfiltered Cask Strength Kentucky Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey58", title: "750ml Bottle", price: { amount: "159.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-59",
      title: "Augusta Old Route 8 Bourbon - 750 mL",
      handle: "augusta-old-route-8-year-single-barrel",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Corn-based bourbon grain mash",
      type: "Single-barrel Kentucky straight bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Old Route 8 source bottle shows 110 proof / 55% ABV. This is a pictured single-barrel value. Confirm the inventory barrel's label.",
      priceRange: { minVariantPrice: { amount: "119.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-augusta-old-route-8-year.webp", altText: "Augusta Distillery Old Route 8 Single Barrel Cask Strength Traditional Kentucky Straight Bourbon Whiskey Aged 8 Years bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey59", title: "750ml Bottle", price: { amount: "119.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-60",
      title: "Auchentoshan American Oak Single Malt Scotch Whisky - 750 mL",
      handle: "auchentoshan-american-oak-single-malt",
      category: "WHISKEY",
      country: "Glasgow area, Scotland, United Kingdom",
      composition: "Malted barley",
      type: "Lowland single malt Scotch whisky",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Auchentoshan American Oak 750 mL. Triple distilled and matured in American oak ex-bourbon casks.",
      priceRange: { minVariantPrice: { amount: "52.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-auchentoshan-american-oak.webp", altText: "Auchentoshan Single Malt Scotch Whisky American Oak Smooth and Vibrant bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey60", title: "750ml Bottle", price: { amount: "52.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-61",
      title: "Backbone Decade Down Uncut Bourbon - 750 mL",
      handle: "backbone-decade-down-uncut-anniversary",
      category: "WHISKEY",
      country: "Indiana, United States",
      composition: "Corn, rye and malted barley",
      type: "Straight bourbon whiskey, partly sherry-cask finished",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Decade Down Uncut Anniversary Edition blends five- to seven-year bourbons, including a sherry-cask-finished portion. 750 mL.",
      priceRange: { minVariantPrice: { amount: "75.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-backbone-decade-down-anniversary.webp", altText: "Backbone Bourbon Anniversary Edition Decade Down Uncut Straight Bourbon Whiskey bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey61", title: "750ml Bottle", price: { amount: "75.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-62",
      title: "Amaro Montenegro - 750 mL",
      handle: "amaro-montenegro-liqueur",
      category: "WHISKEY",
      country: "Italy (Bologna)",
      composition: "40 botanicals, including spices, citrus peels and roots",
      type: "Italian amaro (herbal liqueur)",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Amaro Montenegro, 750 mL. Bittersweet herbal and citrus profile.",
      priceRange: { minVariantPrice: { amount: "37.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-amaro-montenegro.webp", altText: "Amaro Montenegro Premiata 1885 Specialità bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey62", title: "750ml Bottle", price: { amount: "37.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-63",
      title: "Baileys Chocolate Irish Cream Liqueur - 750 mL",
      handle: "baileys-chocolate-irish-cream-750ml",
      category: "WHISKEY",
      country: "Ireland",
      composition: "Baileys Original Irish Cream and Belgian chocolate",
      type: "Chocolate Irish cream liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Chocolate expression in blue bottle. 750 mL, 31.4 proof.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-baileys-chocolate-irish-cream-750ml.webp", altText: "Baileys Chocolate Irish Cream Liqueur 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey63", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-64",
      title: "10th Mountain Bourbon - 750 mL",
      handle: "10th-mountain-bourbon-whiskey",
      category: "WHISKEY",
      country: "Colorado, USA",
      composition: "Colorado corn, rye, malted barley",
      type: "American bourbon whiskey",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Made with a corn-forward mash and aged in new charred oak.",
      priceRange: { minVariantPrice: { amount: "61.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-10th-mountain-bourbon.webp", altText: "10th Mountain Whiskey & Spirit Company Bourbon Whiskey 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey64", title: "750ml Bottle", price: { amount: "61.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-65",
      title: "Baileys Original Irish Cream - 750 mL",
      handle: "baileys-original-irish-cream-750ml",
      category: "WHISKEY",
      country: "Ireland",
      composition: "Irish whiskey and spirits, Irish dairy cream, chocolate and vanilla flavors",
      type: "Irish cream liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Original Irish Cream, 750 mL bottle.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-baileys-original-irish-cream-750ml.webp", altText: "Baileys The Original Irish Cream Liqueur 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey65", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-66",
      title: "Baileys Espresso Crème Irish Cream Liqueur - 750 mL",
      handle: "baileys-espresso-creme-750ml",
      category: "WHISKEY",
      country: "Ireland",
      composition: "Baileys Original Irish Cream, coffee flavor and other natural flavors",
      type: "Coffee-flavored Irish cream liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Espresso Crème expression. 750 mL, 34 proof.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-baileys-espresso-creme-750ml.webp", altText: "Baileys Irresistible Espresso Crème Liqueur 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey66", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-67",
      title: "B&B D.O.M. Liqueur - 750 mL",
      handle: "bb-dom-liqueur-benedictine-brandy",
      category: "WHISKEY",
      country: "Fécamp, France",
      composition: "Bénédictine herbal liqueur (60%); French brandy (40%)",
      type: "Brandy and herbal liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Blended at Palais Bénédictine and rested in French oak. 750 mL.",
      priceRange: { minVariantPrice: { amount: "38.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-bb-dom-liqueur.webp", altText: "B&B D.O.M. Liqueur Bénédictine and Brandy bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey67", title: "750ml Bottle", price: { amount: "38.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-68",
      title: "Baileys Original Irish Cream - 1.75 L",
      handle: "baileys-original-irish-cream-175l",
      category: "WHISKEY",
      country: "Ireland",
      composition: "Irish whiskey and spirits, Irish dairy cream, chocolate and vanilla flavors",
      type: "Irish cream liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Original Irish Cream, 1.75 L bottle.",
      priceRange: { minVariantPrice: { amount: "51.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-baileys-original-irish-cream-175l.webp", altText: "Baileys The Original Irish Cream Liqueur 1.75L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey68", title: "1.75L Bottle", price: { amount: "51.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-69",
      title: "Wild Turkey American Honey - 50 mL",
      handle: "wild-turkey-american-honey-liqueur-50ml",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Kentucky bourbon whiskey, honey",
      type: "Bourbon-based honey liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Wild Turkey American Honey 50 mL miniature. The state listing groups the minis in a 12-pack.",
      priceRange: { minVariantPrice: { amount: "1.09", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-wild-turkey-american-honey-50ml.webp", altText: "Wild Turkey American Honey Liqueur 50ml miniature bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey69", title: "50ml Bottle", price: { amount: "1.09", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-70",
      title: "Wild Turkey American Honey Liqueur 1.75L",
      handle: "wild-turkey-american-honey-liqueur-175l",
      category: "WHISKEY",
      country: "United States (Lawrenceburg, Kentucky)",
      composition: "Kentucky bourbon whiskey, honey",
      type: "Bourbon-based honey liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Wild Turkey American Honey 1.75 L, 71 proof. Exceptionally smooth liqueur blended with pure honey and Kentucky bourbon whiskey.",
      priceRange: { minVariantPrice: { amount: "", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-wild-turkey-american-honey-175l.webp", altText: "Wild Turkey American Honey Liqueur 1.75L bottle with a tasting glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey70", title: "1.75L Bottle", price: { amount: "", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-71",
      title: "Wild Turkey American Honey - 375 mL",
      handle: "wild-turkey-american-honey-liqueur-375ml",
      category: "WHISKEY",
      country: "United States (Lawrenceburg, Kentucky)",
      composition: "Kentucky bourbon whiskey and honey",
      type: "Bourbon and honey liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Wild Turkey American Honey, 375 mL. Sweet honey and bourbon profile.",
      priceRange: { minVariantPrice: { amount: "14.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-wild-turkey-american-honey-375ml.webp", altText: "Wild Turkey American Honey Liqueur 375ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey71", title: "375ml Bottle", price: { amount: "14.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-whiskey-72",
      title: "Wild Turkey American Honey - 750 mL",
      handle: "wild-turkey-american-honey-liqueur-750ml",
      category: "WHISKEY",
      country: "Kentucky, USA",
      composition: "Kentucky bourbon whiskey, honey",
      type: "Bourbon-based honey liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Wild Turkey American Honey 750 mL, 71 proof.",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/whiskey-wild-turkey-american-honey-750ml.webp", altText: "Wild Turkey American Honey Liqueur 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/whiskey72", title: "750ml Bottle", price: { amount: "19.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

// Uploaded & Curated 8 Products for Rum Category
const RUM_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-rum-1",
      title: "Bacardi Rum Punch 1.75L",
      handle: "bacardi-rum-punch",
      category: "RUM",
      country: "🇵🇷 Puerto Rico",
      composition: "🍹 Rum with Natural Flavors",
      type: "🍹 Ready-to-Serve Rum Punch",
      badges: [{ label: "VIVINO", score: "4.7" }, { label: "READY", score: "TO SERVE" }],
      description: "Crafted with Bacardi superior rum and natural fruit flavors. 1.75L ready-to-serve cocktail bursting with pineapple, orange, and cherry notes at 19.9 proof.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-bacardi-rum-punch.webp", altText: "Bacardi Rum Punch 1.75L ready-to-serve cocktail bottle with tropical citrus notes" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum1", title: "1.75L Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rum-2",
      title: "Malibu Black Bold Caribbean Rum",
      handle: "malibu-black",
      category: "RUM",
      country: "🇧🇧 Barbados",
      composition: "🥥 Caribbean Rum & Coconut Liqueur",
      type: "🍹 Bold Caribbean Coconut Rum",
      badges: [{ label: "WE", score: "92" }, { label: "70 PROOF", score: "RESERVE" }],
      description: "Malibu Black combines smooth, bold Caribbean rum with coconut liqueur at 70 proof (35% ABV). Richer, deeper coconut flavor with a full-bodied rum finish.",
      priceRange: { minVariantPrice: { amount: "14.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-malibu-black.webp", altText: "Malibu Black Bold Caribbean Coconut Rum bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum2", title: "750ml Bottle", price: { amount: "28.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
,
  // Newly Uploaded Rum (Authentic Bottle - No Best Seller Tag)
  {
    node: {
      id: "gid://shopify/Product/custom-rum-3",
      title: "Captain Morgan Original Spiced Rum",
      handle: "captain-morgan-original-spiced",
      category: "RUM",
      country: "🇻🇮 U.S. Virgin Islands",
      composition: "🍹 Caribbean Rum, Natural Spices & Charred Oak",
      type: "🍹 Original Spiced Rum",
      badges: [{ label: "ORIGINAL", score: "SPICED RUM" }],
      isBestSeller: false,
      description: "The legendary Caribbean rum expertly blended with natural flavors and warming spices, then aged in charred white oak barrels. Rich vanilla, brown sugar, cinnamon, and subtle clove notes for a smooth, balanced finish.",
      priceRange: { minVariantPrice: { amount: "16.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-captain-morgan-spiced.webp", altText: "Captain Morgan Original Spiced Caribbean Rum bottle with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum3", title: "750ml Bottle", price: { amount: "16.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rum-4",
      title: "Bacardí Gold Rum - 375 mL",
      handle: "bacardi-gold-rum-375ml",
      category: "RUM",
      country: "Puerto Rico, United States",
      composition: "Sugarcane molasses, water and yeast",
      type: "Gold rum",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Toasted-oak-aged amber rum. 375 mL.",
      priceRange: { minVariantPrice: { amount: "9.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-bacardi-gold-375ml.webp", altText: "Bottle of Bacardi Gold Ron Superior Carta Oro Rum 375ml with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum4", title: "375ml Bottle", price: { amount: "9.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rum-5",
      title: "Bacardí Superior White Rum - 50 mL",
      handle: "bacardi-superior-white-rum-50ml",
      category: "RUM",
      country: "Cataño, Puerto Rico, United States",
      composition: "Sugarcane molasses, water and yeast",
      type: "White rum",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Light white rum, 50 mL per bottle. Same UPC appears as single and 10-pack in different catalogs.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-bacardi-superior-white-50ml.webp", altText: "Bottle of Bacardi Superior Carta Blanca White Rum 50ml miniature with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum5", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rum-6",
      title: "Bacardí Gold Rum - 200 mL",
      handle: "bacardi-gold-rum-200ml",
      category: "RUM",
      country: "Puerto Rico, United States",
      composition: "Sugarcane molasses, water and yeast",
      type: "Gold rum",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Toasted-oak-aged amber rum. 200 mL.",
      priceRange: { minVariantPrice: { amount: "5.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-bacardi-gold-200ml.webp", altText: "Bottle of Bacardi Gold Ron Superior Carta Oro Rum 200ml with a crystal tasting glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum6", title: "200ml Bottle", price: { amount: "5.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rum-7",
      title: "Arak Razzouk - 750 mL",
      handle: "arak-razzouk-750ml",
      category: "RUM",
      country: "Lebanon",
      composition: "Distilled grape juice, aniseed",
      type: "Arak / anise-flavored grape spirit",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Arak Razzouk 750 mL, 100 proof. Turns cloudy with added water.",
      priceRange: { minVariantPrice: { amount: "25.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-arak-razzouk-750ml.webp", altText: "Bottle of Arak Razzouk Distilled Anise Spirit 750ml with a glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum7", title: "750ml Bottle", price: { amount: "25.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rum-8",
      title: "Angostura Aromatic Bitters - 4 fl oz",
      handle: "angostura-aromatic-bitters-4oz",
      category: "RUM",
      country: "Trinidad and Tobago",
      composition: "Alcohol, water, herbs and spices",
      type: "Aromatic cocktail bitters",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Angostura aromatic bitters 4 fl oz. Concentrated cocktail seasoning with a proprietary formula.",
      priceRange: { minVariantPrice: { amount: "11.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rum-angostura-aromatic-bitters-4oz.webp", altText: "Bottle of Angostura Aromatic Bitters 4 fl oz (118ml) with an Old Fashioned cocktail glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rum8", title: "4 fl oz Bottle", price: { amount: "11.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

// Uploaded & Curated 20 Products for Beer Category
const BEER_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-beer-1",
      title: "Blue Moon Belgian White",
      handle: "blue-moon-belgian-white",
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Valencia Orange Peel & Coriander",
      type: "🍺 Belgian-Style Wheat Ale",
      badges: [{ label: "UNTAPPD", score: "4.6" }, { label: "CRAFT", score: "WHITE" }],
      description: "Crisp and tangy Belgian-style wheat ale brewed with Valencia orange peel for subtle sweetness and coriander aroma. Unfiltered and smooth.",
      priceRange: { minVariantPrice: { amount: "18.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-blue-moon-belgian-white.webp", altText: "Bottle of Blue Moon Belgian White Ale with a poured pint glass of wheat beer and fresh orange slice garnish" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer1", title: "6-Pack 12oz Bottles", price: { amount: "14.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-2",
      title: "Budweiser King of Beers",
      handle: "budweiser-king-of-beers",
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Choice Hops & Barley Malt",
      type: "🍺 American Lager",
      badges: [{ label: "RATEBEER", score: "4.2" }, { label: "KING", score: "OF BEERS" }],
      description: "The Great American Lager brewed since 1876 by Anheuser-Busch. Beechwood aged for a crisp, clean, and unmistakable classic flavor in a 16 FL. OZ. can.",
      priceRange: { minVariantPrice: { amount: "28.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-budweiser-king-of-beers.webp", altText: "Cold bottle of Budweiser King of Beers lager with fresh condensation" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer2", title: "16oz Tallboy Can", price: { amount: "12.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-3",
      title: "Bud Light",
      handle: "bud-light",
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Barley Malt, Rice & Hops",
      type: "🍺 American Light Lager",
      badges: [{ label: "ABV", score: "4.2%" }, { label: "LIGHT", score: "LAGER" }],
      description: "Always brewed using the choicest hops, best barley malt, and premium rice. Refreshingly easy drinking with an ultra-clean, crisp finish in a 12-pack of 12 fl oz cans.",
      priceRange: { minVariantPrice: { amount: "14.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-bud-light-12pack.webp", altText: "Bud Light 12-Pack retail carton and condensation-beaded blue can on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer3", title: "12-Pack (12 oz Cans)", price: { amount: "14.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-4",
      title: "Miller Lite A Fine Pilsner",
      handle: "miller-lite-pilsner",
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Galena Hops & Crystal Malt",
      type: "🍺 Fine Pilsner Beer",
      badges: [{ label: "PILSNER", score: "4.4" }, { label: "ORIGINAL", score: "LITE" }],
      description: "The original light beer brewed with pure water, select barley malt, and Galena hops. True pilsner taste with only 96 calories and unmatched drinkability.",
      priceRange: { minVariantPrice: { amount: "23.49", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-miller-lite-pilsner.webp", altText: "Chilled bottle of Miller Lite Fine Pilsner with crisp white head" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer4", title: "16oz Aluminum Pint", price: { amount: "12.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-5",
      title: "Corona Extra",
      handle: "corona-extra",
      category: "BEER",
      country: "🇲🇽 Mexico",
      composition: "🌾 Malted Barley, Corn & Hops",
      type: "🍺 Mexican Cerveza Clara",
      badges: [{ label: "CERVEZA", score: "4.7" }, { label: "EXTRA", score: "FINE" }],
      description: "La Cerveza Mas Fina brewed and bottled in Mexico by Cerveceria Modelo. Incomparably crisp, golden pour with refreshing citrus notes, best enjoyed with a lime.",
      priceRange: { minVariantPrice: { amount: "18.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-corona-extra.webp", altText: "Chilled clear bottle of Corona Extra Mexican lager with fresh lime wedge" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer5", title: "12oz Bottle", price: { amount: "15.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-6",
      title: "Coors Light Cold As The Rockies",
      handle: "coors-light",
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Moravian Barley & Water",
      type: "🍺 Rocky Mountain Light Lager",
      badges: [{ label: "COLD", score: "4.5" }, { label: "ROCKIES", score: "LITE" }],
      description: "Born in the Rocky Mountains and cold-filtered at below freezing temperatures. Crisp, refreshing, and clean mountain taste in iconic silver can.",
      priceRange: { minVariantPrice: { amount: "25.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-coors-light.webp", altText: "Chilled bottle of Coors Light Cold as the Rockies with frosty condensation" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer6", title: "16oz Can", price: { amount: "12.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-7",
      title: "Michelob ULTRA Superior Light Beer",
      handle: "michelob-ultra",
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Herkules Hops & Whole Grains",
      type: "🍺 Superior Light Beer",
      badges: [{ label: "FIT", score: "4.5" }, { label: "95 CALS", score: "2.6 CARBS" }],
      description: "Brewed for those who go the extra mile. Only 95 calories and 2.6 carbs with an exceptionally crisp, refreshing light beer taste.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-michelob-ultra.webp", altText: "Sleek chilled bottle of Michelob ULTRA Superior Light Beer" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer7", title: "12oz Slim Can", price: { amount: "13.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-8",
      title: "Guinness Extra Stout",
      handle: "guinness-extra-stout",
      category: "BEER",
      country: "🇮🇪 Ireland",
      composition: "🌾 Roasted Barley, Hops & Water",
      type: "🍺 Irish Extra Stout",
      badges: [{ label: "UNTAPPD", score: "4.8" }, { label: "IRISH", score: "STOUT" }],
      description: "Descended from the historic 1821 recipe brewed at St. James's Gate, Dublin. Rich, complex, and full-bodied with roasted bitterness and dark chocolate tones.",
      priceRange: { minVariantPrice: { amount: "9.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-guinness-extra-stout.webp", altText: "Bottle of Guinness Extra Stout with a poured pint of dark stout and creamy head" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer8", title: "12oz Bottle", price: { amount: "16.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-9",
      title: "Dos Equis XX Lager Especial",
      handle: "dos-equis-xx-lager",
      category: "BEER",
      country: "🇲🇽 Mexico",
      composition: "🌾 Choice Mexican Malt & Hops",
      type: "🍺 Mexican Golden Lager",
      badges: [{ label: "CERVEZA", score: "4.6" }, { label: "LAGER", score: "ESPECIAL" }],
      description: "Crisp and refreshing golden lager born in Mexico in 1897. Subtle malt richness, smooth body, and clean finish in an eye-catching golden can.",
      priceRange: { minVariantPrice: { amount: "16.49", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-dos-equis-lager-especial.webp", altText: "Cold bottle of Dos Equis XX Lager Especial Mexican beer with condensation" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer9", title: "12oz Can", price: { amount: "14.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-10",
      title: "Modelo Especial",
      handle: "modelo-especial",
      category: "BEER",
      country: "🇲🇽 Mexico",
      composition: "🌾 Filtered Water, Barley & Hops",
      type: "🍺 Pilsner-Style Mexican Lager",
      badges: [{ label: "CERVEZA", score: "4.8" }, { label: "PILSNER", score: "ESPECIAL" }],
      description: "Brewed in Mexico since 1925. A golden, full-flavored pilsner-style lager with a clean, crisp finish, subtle orange blossom honey notes, and light hop character.",
      priceRange: { minVariantPrice: { amount: "30.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-modelo-especial.webp", altText: "Cold bottle of Modelo Especial Mexican lager with gold foil neck" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer10", title: "12oz Can", price: { amount: "15.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-11",
      title: "Stella Artois Premium Lager",
      handle: "stella-artois-lager",
      category: "BEER",
      country: "🇧🇪 Belgium",
      composition: "🌾 Saaz Hops & Malted Barley",
      type: "🍺 Belgian European Pale Lager",
      badges: [{ label: "EURO", score: "4.7" }, { label: "ESTD", score: "1366" }],
      description: "Heritage Belgian lager brewed with rich malted barley and fragrant European Saaz hops. Crisp hop bitterness, gentle malt sweetness, and remarkably refined finish.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-stella-artois-lager.webp", altText: "Bottle of Stella Artois European pilsner with classic chalice glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer11", title: "16oz Tallboy Can", price: { amount: "16.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  // Newly Uploaded Beers (Authentic Retail Packs - No Best Seller Tag)
  {
    node: {
      id: "gid://shopify/Product/custom-beer-heineken",
      title: "Heineken Original Lager",
      handle: "heineken-original-lager",
      isBestSeller: false,
      category: "BEER",
      country: "🇳🇱 Netherlands",
      composition: "🌾 Water, Barley Malt & Hops",
      type: "🍺 Dutch Pure Malt Lager",
      badges: [{ label: "IMPORT", score: "5.0%" }, { label: "1873", score: "AMSTERDAM" }],
      description: "Brewed since 1873 with 100% pure malt, water, and unique A-Yeast. Rich, balanced taste with subtle fruity notes in an 18-can pack.",
      priceRange: { minVariantPrice: { amount: "17.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-heineken-lager-12pack.webp", altText: "Heineken Original Pure Malt Lager 12-Pack retail carton and chilled green can on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer12", title: "12-Pack (12 oz Cans)", price: { amount: "17.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-victoria",
      title: "Victoria Cerveza",
      handle: "victoria-cerveza-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇲🇽 Mexico",
      composition: "🌾 Water, Barley Malt, Cereals & Hops",
      type: "🍺 Mexican Vienna-Style Lager",
      badges: [{ label: "MEXICO", score: "1865" }, { label: "ABV", score: "4.0%" }],
      description: "Mexico's oldest beer brand brewed since 1865. An ultra-refreshing Vienna-style amber lager with light-to-medium body, toasted malt sweetness, and a crisp, clean finish.",
      priceRange: { minVariantPrice: { amount: "18.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-victoria-12pack.webp", altText: "Victoria Cerveza Hecha en Mexico 12-Pack retail carton and chilled longneck bottle on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer13", title: "12-Pack (12 oz Bottles)", price: { amount: "18.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-busch-light",
      title: "Busch Light",
      handle: "busch-light-30pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Water, Barley Malt, Cereal Grains & Hops",
      type: "🍺 American Light Lager",
      badges: [{ label: "USA", score: "COLD" }, { label: "ABV", score: "4.1%" }],
      description: "Brewed with the finest ingredients and cold-filtered for an exceptionally clean, crisp, and refreshing taste with easy drinkability in a 30-can pack.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-busch-light-30pack.webp", altText: "Busch Light Cold-Filtered 30-Pack carton and chilled blue mountain can on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer14", title: "30-Pack (12 oz Cans)", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-yuengling",
      title: "Yuengling Traditional Lager",
      handle: "yuengling-traditional-lager-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Water, Barley Malt, Corn & Hops",
      type: "🍺 Traditional Amber Lager",
      badges: [{ label: "ESTD", score: "1829" }, { label: "ABV", score: "4.5%" }],
      description: "Crafted by America's Oldest Brewery since 1829. Famous for its rich amber color, medium body, subtle roasted caramel malt sweetness, and cluster and cascade hops.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-yuengling-lager-12pack.webp", altText: "Yuengling Traditional Lager 12-Pack retail carton and chilled amber can on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer15", title: "12-Pack (12 oz Cans)", price: { amount: "15.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-modelo-negra",
      title: "Modelo Negra Especial",
      handle: "modelo-negra-especial-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇲🇽 Mexico",
      composition: "🌾 Water, Roasted Barley Malt & Hops",
      type: "🍺 Munich Dunkel Dark Lager",
      badges: [{ label: "ESPECIAL", score: "DARK" }, { label: "ABV", score: "5.4%" }],
      description: "Brewed longer to enhance flavors of slow-roasted caramel malts, dark chocolate accents, and gentle sweetness balanced with a delightfully smooth, crisp pour.",
      priceRange: { minVariantPrice: { amount: "17.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-modelo-negra-12pack.webp", altText: "Modelo Negra Especial Dunkel Lager 12-Pack retail carton and chilled dark bottle on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer16", title: "12-Pack (12 oz Cans)", price: { amount: "17.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-coors-banquet",
      title: "Coors Banquet",
      handle: "coors-banquet-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🌾 Rocky Mountain Water & Moravian Barley",
      type: "🍺 American Golden Lager",
      badges: [{ label: "GOLDEN", score: "1873" }, { label: "ABV", score: "5.0%" }],
      description: "The Original Coors brewed exclusively in Golden, Colorado with 100% Rocky Mountain water and high country Moravian barley since 1873. Full-flavored, bright, and refreshing.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-coors-banquet-12pack.webp", altText: "Coors Banquet Golden Lager 12-Pack retail carton and heritage gold can on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer17", title: "12-Pack (12 oz Cans)", price: { amount: "15.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-smirnoff-ice-neon",
      title: "Smirnoff Ice Neon Lemonade Variety Pack",
      handle: "smirnoff-ice-neon-lemonade-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🍋 Real Fruit Juice & Triple-Filtered Malt",
      type: "🍺 Premium Flavored Malt Beverage",
      badges: [{ label: "SMIRNOFF", score: "ICE" }, { label: "ABV", score: "4.5%" }],
      description: "A vibrant variety pack of crisp Smirnoff Ice Neon Lemonades featuring 4 bold flavors: Original Lemonade, Strawberry Lemonade, Peach Lemonade, and Blue Raspberry Lemonade in a 12-can pack.",
      priceRange: { minVariantPrice: { amount: "16.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-smirnoff-ice-neon-lemonade-12pack.webp", altText: "Smirnoff Ice Neon Lemonade 12-Pack variety carton and colorful chilled cans on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer18", title: "12-Pack (12 oz Cans)", price: { amount: "16.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-truly-citrus",
      title: "Truly Hard Seltzer Citrus Variety Pack",
      handle: "truly-hard-seltzer-citrus-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🍋 Sparkling Water, Real Fruit Juice & Cane Sugar",
      type: "🍺 Spiked Sparkling Water Hard Seltzer",
      badges: [{ label: "GLUTEN FREE", score: "100 CALS" }, { label: "ABV", score: "5.0%" }],
      description: "Crisp, clean, and endlessly refreshing with 100 calories and only 1g sugar. Features four bright citrus flavors: Lime, Lemon, Grapefruit, and Citrus Squeeze in a 12-can pack.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-truly-hard-seltzer-citrus-12pack.webp", altText: "Truly Hard Seltzer Citrus Variety 12-Pack retail carton and chilled citrus cans on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer19", title: "12-Pack (12 oz Cans)", price: { amount: "15.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-beer-mikes-harder",
      title: "Mike's Harder Party Variety Pack",
      handle: "mikes-harder-party-pack-12pack",
      isBestSeller: false,
      category: "BEER",
      country: "🇺🇸 United States",
      composition: "🍋 Real Lemon Juice & Premium Malt Base",
      type: "🍺 Hard Lemonade & Malt Beverage",
      badges: [{ label: "HARDER", score: "PARTY" }, { label: "ABV", score: "8.0%" }],
      description: "An intense, bold flavor punch at 8% ABV. Features 4 fan-favorite party flavors: Original Lemonade, Black Cherry, Cranberry, and Mango in a premium 12-can pack.",
      priceRange: { minVariantPrice: { amount: "18.49", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/beer-mikes-harder-party-pack-12pack.webp", altText: "Mike's Harder Party Variety 12-Pack retail carton and bold chilled cans on reflective white background" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/beer20", title: "12-Pack (12 oz Cans)", price: { amount: "18.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

// Uploaded & Curated 25 Products for Vodka Category
const VODKA_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-1",
      title: "Absolut Vodka Original Swedish Vodka",
      handle: "absolut-vodka-swedish",
      category: "VODKA",
      country: "🇸🇪 Sweden",
      composition: "🌾 Winter Wheat & Pristine Deep Well Water",
      type: "🍸 Classic Swedish Vodka",
      badges: [{ label: "VIVINO", score: "4.7" }, { label: "PURITY", score: "SWEDISH" }],
      description: "Rich, full-bodied and complex, yet smooth and mellow with a distinct character of grain, followed by a hint of dried fruit. Crafted exclusively in Åhus, Sweden.",
      priceRange: { minVariantPrice: { amount: "20.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-absolut-swedish-vodka.webp", altText: "Bottle of Absolut Vodka Original Swedish Vodka with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka1", title: "750ml Bottle", price: { amount: "26.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-2",
      title: "Grey Goose Vodka",
      handle: "grey-goose-vodka",
      category: "VODKA",
      country: "🇫🇷 France",
      composition: "🌾 Soft Winter Wheat & Gensac Spring Water",
      type: "🍸 French Luxury Vodka",
      badges: [{ label: "WE", score: "95" }, { label: "PRESTIGE", score: "FRENCH" }],
      description: "Distilled and bottled in France using the finest French soft winter wheat from Picardy and naturally filtered Gensac spring water. Luxuriously smooth, clean, and rounded.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-grey-goose-france.webp", altText: "Bottle of Grey Goose French Luxury Vodka with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka2", title: "750ml Bottle", price: { amount: "39.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-3",
      title: "Tito's Handmade Vodka",
      handle: "titos-handmade-vodka",
      category: "VODKA",
      country: "🇺🇸 United States",
      composition: "🌽 100% Yellow Corn & Old-Fashioned Pot Stills",
      type: "🍸 American Craft Vodka",
      badges: [{ label: "RP", score: "94" }, { label: "POT STILL", score: "AUSTIN" }],
      description: "Award-winning American craft vodka batch distilled in old-fashioned pot stills in Austin, Texas. Naturally gluten-free and distilled from yellow corn for an impeccably smooth finish.",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-titos-handmade-vodka.webp", altText: "Bottle of Tito's Handmade American Craft Vodka with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka3", title: "750ml Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-4",
      title: "Smirnoff No. 21 Vodka 1.75L",
      handle: "smirnoff-no21-vodka",
      category: "VODKA",
      country: "🇺🇸 United States",
      composition: "🌾 Non-GMO Grain Triple Distilled",
      type: "🍸 Classic Triple Distilled Vodka",
      badges: [{ label: "VIVINO", score: "4.5" }, { label: "10X", score: "FILTERED" }],
      description: "The world's No. 1 vodka. Triple distilled from non-GMO corn and filtered ten times through charcoal for robust flavor with a dry, clean finish in a large 1.75L bottle.",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-smirnoff-no21.webp", altText: "Bottle of Smirnoff No. 21 Triple Distilled Vodka 1.75L with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka4", title: "1.75L Bottle", price: { amount: "22.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
,
  // Newly Uploaded Vodkas (Authentic Distilled Bottles - No Best Seller Tag)
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-5",
      title: "Cîroc Snap Frost Vodka",
      handle: "ciroc-snap-frost-vodka",
      category: "VODKA",
      country: "🇫🇷 France",
      composition: "🍇 Fine French Grapes & 5x Distillation",
      type: "🍸 French Grape Vodka",
      badges: [{ label: "FRANCE", score: "5X DISTILLED" }],
      isBestSeller: false,
      description: "Distilled exclusively from fine French Ugni Blanc and Mauzac Blanc grapes. Five times distilled in historic copper pot stills for exceptional clarity, fresh citrus brightness, and a silky smooth finish.",
      priceRange: { minVariantPrice: { amount: "37.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-ciroc-snap-frost.webp", altText: "Bottle of Cîroc Snap Frost French Grape Vodka with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka5", title: "750ml Bottle", price: { amount: "37.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-6",
      title: "Deep Eddy Vodka",
      handle: "deep-eddy-vodka",
      category: "VODKA",
      country: "🇺🇸 United States",
      composition: "🌽 100% Real Corn & Austin Spring Water",
      type: "🍸 American Small Batch Vodka",
      badges: [{ label: "AUSTIN", score: "10X DISTILLED" }],
      isBestSeller: false,
      description: "Handcrafted in Austin, Texas in small batches. Column distilled 10 times in state-of-the-art continuous stills and charcoal filtered for unprecedented smoothness and a pure, clean finish.",
      priceRange: { minVariantPrice: { amount: "17.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-deep-eddy.webp", altText: "Bottle of Deep Eddy Austin Texas Small Batch Vodka with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka6", title: "750ml Bottle", price: { amount: "17.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-7",
      title: "New Amsterdam Original Vodka",
      handle: "new-amsterdam-original-vodka",
      category: "VODKA",
      country: "🇺🇸 United States",
      composition: "🌾 Selected American Grains & Triple Filtered",
      type: "🍸 American Grain Vodka",
      badges: [{ label: "SMOOTH", score: "5X DISTILLED" }],
      isBestSeller: false,
      description: "Distilled five times from finest American grains and filtered three times through charcoal for an silky smooth mouthfeel with delicate citrus and fruit notes.",
      priceRange: { minVariantPrice: { amount: "13.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-new-amsterdam.webp", altText: "Bottle of New Amsterdam Original 5x Distilled American Vodka with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka7", title: "750ml Bottle", price: { amount: "13.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-8",
      title: "High Noon Vodka Soda Black Cherry",
      handle: "high-noon-black-cherry-vodka-soda",
      category: "VODKA",
      country: "🇺🇸 United States",
      composition: "🍒 Real Vodka, Real Fruit Juice & Sparkling Water",
      type: "🍸 Vodka Soda with Real Fruit Juice",
      badges: [{ label: "REAL JUICE", score: "VODKA SODA" }, { label: "ABV", score: "4.5%" }],
      isBestSeller: false,
      description: "Crafted with real vodka, sparkling water, and real fruit juice. Bursting with rich, juicy black cherry flavor at only 100 calories, gluten-free, with no added sugar.",
      priceRange: { minVariantPrice: { amount: "3.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-high-noon-black-cherry.webp", altText: "Chilled can of High Noon Black Cherry Vodka Soda on a sunny beach rail with ocean backdrop" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka8", title: "355ml Can (12 oz)", price: { amount: "3.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-9",
      title: "Absolut Vodka - 200 mL",
      handle: "absolut-vodka-swedish-200ml",
      category: "VODKA",
      country: "Sweden (Åhus, Skåne)",
      composition: "Swedish winter wheat and well water",
      type: "Vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Absolut Original, 200 mL. Continuous distillation.",
      priceRange: { minVariantPrice: { amount: "7.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-absolut-swedish-vodka-200ml.webp", altText: "Absolut Vodka Swedish Vodka 200ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka9", title: "200ml Bottle", price: { amount: "7.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-10",
      title: "Absolut Vodka - 1.75 L",
      handle: "absolut-vodka-swedish-175l",
      category: "VODKA",
      country: "Sweden (Åhus, Skåne)",
      composition: "Swedish winter wheat and well water",
      type: "Vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Absolut Original, 1.75 L. Continuous distillation.",
      priceRange: { minVariantPrice: { amount: "34.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-absolut-swedish-vodka-175l.webp", altText: "Absolut Vodka Swedish Vodka 1.75L bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka10", title: "1.75L Bottle", price: { amount: "34.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-11",
      title: "360 Georgia Peach Vodka - 750 mL",
      handle: "360-georgia-peach-flavored-vodka-750ml",
      category: "VODKA",
      country: "Missouri, USA",
      composition: "Corn-based vodka, peach flavor",
      type: "Peach-flavored vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Georgia Peach is the flavor name. The distiller uses Missouri-grown corn for its vodka base.",
      priceRange: { minVariantPrice: { amount: "14.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-360-georgia-peach-750ml.webp", altText: "360 Georgia Peach Flavored Vodka 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka11", title: "750ml Bottle", price: { amount: "14.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-12",
      title: "Absolut Citron Vodka - 750 mL",
      handle: "absolut-citron-lemon-vodka-750ml",
      category: "VODKA",
      country: "Sweden (Åhus, Skåne)",
      composition: "Vodka and natural citrus flavoring",
      type: "Lemon-flavored vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Absolut Citron, 750 mL. Lemon peel and lime character.",
      priceRange: { minVariantPrice: { amount: "20.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-absolut-citron-lemon-750ml.webp", altText: "Absolut Citron Lemon Flavored Vodka 750ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka12", title: "750ml Bottle", price: { amount: "20.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-13",
      title: "360 Bing Cherry Vodka - 750 mL",
      handle: "360-bing-cherry-flavored-vodka-750ml",
      category: "VODKA",
      country: "Missouri, USA",
      composition: "Corn-based vodka, Bing cherry flavor",
      type: "Cherry-flavored vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Bing cherry expression of 360 Vodka.",
      priceRange: { minVariantPrice: { amount: "14.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-360-bing-cherry-750ml.webp", altText: "360 Bing Cherry Flavored Vodka 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka13", title: "750ml Bottle", price: { amount: "14.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-14",
      title: "360 Vodka - 1.75 L",
      handle: "360-vodka-american-vodka-175l",
      category: "VODKA",
      country: "Missouri, USA",
      composition: "Corn",
      type: "Vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Unflavored 360 Vodka in the 1.75 L bottle.",
      priceRange: { minVariantPrice: { amount: "22.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-360-american-vodka-175l.webp", altText: "360 Vodka Eco Friendly Superior American Vodka 1.75L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka14", title: "1.75L Bottle", price: { amount: "22.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-15",
      title: "99 Apples Liqueur - 50 mL",
      handle: "99-brand-apples-liqueur-50ml",
      category: "VODKA",
      country: "USA",
      composition: "Liqueur base, apple flavoring",
      type: "Apple-flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Apples 50 mL miniature.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-apples-50ml.webp", altText: "99 Brand Apples 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka15", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-16",
      title: "99 Watermelons Schnapps - 50 mL",
      handle: "99-brand-watermelons-liqueur-50ml",
      category: "VODKA",
      country: "United States (Louisville, Kentucky)",
      composition: "Distilled spirit and watermelon flavoring",
      type: "Watermelon-flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Brand Watermelon miniature, 50 mL.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-watermelons-50ml.webp", altText: "99 Brand Watermelons 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka16", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-17",
      title: "Absolut Vodka - 375 mL",
      handle: "absolut-vodka-swedish-375ml",
      category: "VODKA",
      country: "Sweden (Åhus, Skåne)",
      composition: "Swedish winter wheat and well water",
      type: "Vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Absolut Original, 375 mL. Continuous distillation.",
      priceRange: { minVariantPrice: { amount: "12.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-absolut-swedish-vodka-375ml.webp", altText: "Absolut Vodka Swedish Vodka 375ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka17", title: "375ml Bottle", price: { amount: "12.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-18",
      title: "Amarula Cream Liqueur - 750 mL",
      handle: "amarula-cream-marula-fruit-liqueur-750ml",
      category: "VODKA",
      country: "South Africa",
      composition: "Marula fruit spirit and dairy cream",
      type: "Cream liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Amarula Original Cream, 750 mL. Marula spirit matures in French oak before blending with cream.",
      priceRange: { minVariantPrice: { amount: "28.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-amarula-cream-liqueur-750ml.webp", altText: "Amarula Cream Marula Fruit Liqueur 750ml bottle with a glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka18", title: "750ml Bottle", price: { amount: "28.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-19",
      title: "99 Whipped Liqueur - 50 mL",
      handle: "99-brand-whipped-liqueur-50ml",
      category: "VODKA",
      country: "United States (Louisville, Kentucky)",
      composition: "Distilled spirit and whipped-cream flavoring",
      type: "Whipped cream–flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Brand Whipped miniature, 50 mL.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-whipped-50ml.webp", altText: "99 Brand Whipped 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka19", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-20",
      title: "Barin Russian Vodka - 375 mL",
      handle: "barin-vodka-premium-quality",
      category: "VODKA",
      country: "Check bottle — origin unverified",
      composition: "Vodka base; fermentation source not disclosed",
      type: "Vodka",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Savas lists Barin at 80 proof and a retailer lists the 375 mL bottle. Confirm the UPC and country from the back label before publication. Different Barin label records identify different countries, and none has been matched to this UPC and size.",
      priceRange: { minVariantPrice: { amount: "2.69", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-barin-premium-vodka.webp", altText: "Barin Vodka Premium Quality bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka20", title: "375ml Bottle", price: { amount: "2.69", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-21",
      title: "99 Bananas Schnapps - 50 mL",
      handle: "99-brand-bananas-liqueur-50ml",
      category: "VODKA",
      country: "USA",
      composition: "Liqueur base, banana flavoring",
      type: "Banana-flavored schnapps",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Bananas 50 mL miniature. Pack listings may describe the distributor multipack.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-bananas-50ml.webp", altText: "99 Brand Bananas 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka21", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-22",
      title: "99 Peaches Schnapps - 50 mL",
      handle: "99-brand-peaches-liqueur-50ml",
      category: "VODKA",
      country: "United States (Louisville, Kentucky)",
      composition: "Distilled spirit and peach flavoring",
      type: "Peach-flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Brand Peach miniature, 50 mL.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-peaches-50ml.webp", altText: "99 Brand Peaches 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka22", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-23",
      title: "99 Fruit Punch Liqueur - 50 mL",
      handle: "99-brand-fruit-punch-liqueur-50ml",
      category: "VODKA",
      country: "USA",
      composition: "Liqueur base, fruit punch flavoring",
      type: "Fruit-punch-flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Fruit Punch 50 mL miniature.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-fruit-punch-50ml.webp", altText: "99 Brand Fruit Punch 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka23", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-24",
      title: "99 Grapes Liqueur - 50 mL",
      handle: "99-brand-grapes-schnapps-liqueur-50ml",
      category: "VODKA",
      country: "United States (Louisville, Kentucky)",
      composition: "Distilled spirit and grape flavoring",
      type: "Grape-flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Brand Grape miniature, 50 mL.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-grapes-50ml.webp", altText: "99 Brand Grapes Grape Schnapps 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka24", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-vodka-25",
      title: "99 Strawberries Liqueur - 50 mL",
      handle: "99-brand-strawberries-liqueur-50ml",
      category: "VODKA",
      country: "United States (Louisville, Kentucky)",
      composition: "Distilled spirit and strawberry flavoring",
      type: "Strawberry-flavored liqueur",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "99 Brand Strawberry miniature, 50 mL.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/vodka-99-strawberries-50ml.webp", altText: "99 Brand Strawberries 99 Proof Liqueur 50ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/vodka25", title: "50ml Bottle", price: { amount: "0.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

// Uploaded & Curated 8 Products for Wine Category
const WINE_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-wine-1",
      title: "Apothic Inferno Red Wine",
      handle: "apothic-inferno-red-wine",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Red Blend Aged in Whiskey Barrels",
      type: "🍷 California Red Blend",
      badges: [{ label: "VIVINO", score: "4.7" }, { label: "WHISKEY", score: "BARREL" }],
      description: "Crafted in California and aged for 60 days in charred whiskey barrels. Rich layers of dark red fruit, maple, and toasted vanilla with a bold, smoky finish.",
      priceRange: { minVariantPrice: { amount: "13.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-apothic-inferno-red.webp", altText: "Bottle of Apothic Inferno Whiskey Barrel Aged Red Blend with a glass of dark red wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine1", title: "750ml Bottle", price: { amount: "18.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-2",
      title: "Kendall-Jackson Vintner's Reserve Chardonnay",
      handle: "kendall-jackson-chardonnay",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 100% California Chardonnay",
      type: "🥂 White Wine (Chardonnay)",
      badges: [{ label: "WE", score: "92" }, { label: "VINTNER", score: "RESERVE" }],
      description: "America's favorite Chardonnay for nearly three decades. Handcrafted from cool coastal vineyards with rich tropical flavors of pineapple, mango, and papaya with vanilla oak.",
      priceRange: { minVariantPrice: { amount: "21.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-kendall-jackson-chardonnay.webp", altText: "Bottle of Kendall-Jackson Vintner's Reserve California Chardonnay with a glass of golden white wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine2", title: "750ml Bottle", price: { amount: "17.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-3",
      title: "Bota Box Premium California Wine 3L",
      handle: "bota-box-california-3l",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Premium California Grapes",
      type: "🍷 Premium Bag-in-Box Wine",
      badges: [{ label: "ECO", score: "4.5" }, { label: "3 LITERS", score: "ON TAP" }],
      description: "Premium California wine in eco-friendly 3L packaging equivalent to 4 bottles. Stays fresh for up to 30 days after opening with rich fruit flavors and a smooth finish.",
      priceRange: { minVariantPrice: { amount: "17.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-bota-box-california.webp", altText: "3-Liter box of Bota Box Premium California Red Wine with stay-fresh tap and wine glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine3", title: "3L Box (4 Bottles)", price: { amount: "22.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-4",
      title: "Sutter Home California Rose",
      handle: "sutter-home-rose",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Fresh California Rose Blend",
      type: "🌸 California Rose Wine",
      badges: [{ label: "REFRESH", score: "4.4" }, { label: "NAPA", score: "ESTD 1890" }],
      description: "Delightfully refreshing California Rose featuring delicate aromas of ripe red berries, sweet strawberries, and crisp melon with a clean, uplifting finish.",
      priceRange: { minVariantPrice: { amount: "6.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-sutter-home-rose.webp", altText: "Bottle of Sutter Home California Rose with a glass of chilled blush pink wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine4", title: "750ml Bottle", price: { amount: "11.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-5",
      title: "[yellow tail] Shiraz 1.5L",
      handle: "yellow-tail-shiraz",
      category: "WINE",
      country: "🇦🇺 Australia",
      composition: "🍇 South Eastern Australian Shiraz",
      type: "🍷 Australian Red Wine",
      badges: [{ label: "VIVINO", score: "4.6" }, { label: "1.5L", score: "MAGNUM" }],
      description: "Crafted by the Casella family in Australia. Vibrant, rich, and juicy with luscious ripe red berry flavors, subtle vanilla notes, and soft warm spice in a generous 1.5L bottle.",
      priceRange: { minVariantPrice: { amount: "12.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-yellow-tail-shiraz.webp", altText: "Bottle of [yellow tail] Australian Shiraz 1.5L with a glass of rich red wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine5", title: "1.5L Bottle", price: { amount: "16.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-6",
      title: "Barefoot on Tap Moscato 3L",
      handle: "barefoot-on-tap-moscato",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 California Sweet Moscato",
      type: "🥂 Sweet White Wine on Tap",
      badges: [{ label: "SWEET", score: "4.7" }, { label: "3 LITERS", score: "ON TAP" }],
      description: "Deliciously sweet with lush aromas of juicy peaches, ripe apricots, and sweet citrus blossom. Convenient 3L box with easy-pour tap that keeps wine fresh to the last glass.",
      priceRange: { minVariantPrice: { amount: "18.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-barefoot-on-tap-moscato.webp", altText: "3-Liter box of Barefoot On Tap Sweet California Moscato with a glass of white wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine6", title: "3L Box (4 Bottles)", price: { amount: "21.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-7",
      title: "Meiomi Pinot Noir California 2021",
      handle: "meiomi-pinot-noir",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Sonoma, Monterey & Santa Barbara Blend",
      type: "🍷 Coastal California Pinot Noir",
      badges: [{ label: "RP", score: "93" }, { label: "COASTAL", score: "CALIFORNIA" }],
      description: "A richly layered Pinot Noir blending grapes from Sonoma, Monterey, and Santa Barbara counties. Jammy dark fruit, mocha, vanilla, and toasted oak with a silky, velvety texture.",
      priceRange: { minVariantPrice: { amount: "22.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-meiomi-pinot-noir.webp", altText: "Bottle of Meiomi Coastal California Pinot Noir with a glass of elegant red wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine7", title: "750ml Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-8",
      title: "Josh Cellars Cabernet Sauvignon",
      handle: "josh-cellars-cabernet",
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 California Cabernet Sauvignon",
      type: "🍷 California Cabernet Sauvignon",
      badges: [{ label: "WE", score: "93" }, { label: "JOSEPH CARR", score: "VINTAGE" }],
      description: "Blended and bottled by Joseph Carr in honor of his father, Josh. Rich round flavors of dark cherry, blackberry, toasted hazelnut, and cinnamon with fine-grained tannins.",
      priceRange: { minVariantPrice: { amount: "14.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/wine-josh-cellars-cabernet.webp", altText: "Bottle of Josh Cellars California Cabernet Sauvignon with a glass of bold red wine" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/wine8", title: "750ml Bottle", price: { amount: "18.49", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  // Newly Added Wines (Authentic Bottles - No Best Seller Tag)
  {
    node: {
      id: "gid://shopify/Product/custom-wine-josh-chardonnay",
      title: "Josh Cellars Chardonnay",
      handle: "josh-cellars-chardonnay",
      isBestSeller: false,
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Chardonnay Grapes & French Oak",
      type: "🍷 California Chardonnay",
      badges: [{ label: "CALIFORNIA", score: "CHARDONNAY" }],
      description: "Crafted from premium California vineyards, bursting with aromas of bright citrus and honey, balanced by gentle oak and lush vanilla on the palate.",
      priceRange: {
        minVariantPrice: { amount: "14.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-josh-cellars-chardonnay.webp",
              altText: "Bottle of Josh Cellars California Chardonnay with a glass of chilled crisp white wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-josh-chard-1",
              title: "750ml Bottle", price: { amount: "14.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-bota-pinot-grigio",
      title: "Bota Box Pinot Grigio 3L",
      handle: "bota-box-pinot-grigio-3l",
      isBestSeller: false,
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Pinot Grigio Grapes",
      type: "🍷 Boxed Pinot Grigio",
      badges: [{ label: "ECO-BOX", score: "3 LITERS" }],
      description: "Light and crisp with lively aromas of white peach, nectarine, and floral citrus. Eco-friendly premium box packaging keeps wine fresh for up to 30 days after opening.",
      priceRange: {
        minVariantPrice: { amount: "17.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-bota-box-pinot-grigio-3l.webp",
              altText: "3-Liter box of Bota Box California Pinot Grigio with a glass of refreshing white wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-bota-pg-1",
              title: "3 Liters (Box)", price: { amount: "17.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-la-marca",
      title: "La Marca Prosecco D.O.C.",
      handle: "la-marca-prosecco-doc",
      isBestSeller: false,
      category: "WINE",
      country: "🇮🇹 Italy",
      composition: "🍇 100% Glera Sparkling Grapes",
      type: "🥂 Italian Sparkling Wine",
      badges: [{ label: "ITALY", score: "PROSECCO" }],
      description: "A delicate and luminous Italian sparkling wine with aromas of fresh citrus, honey, and white flowers. Crisp, clean, and effervescent with a refreshing finish.",
      priceRange: {
        minVariantPrice: { amount: "17.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-la-marca-prosecco.webp",
              altText: "Bottle of La Marca Prosecco D.O.C. Italian sparkling wine with an effervescent glass of Prosecco"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-la-marca-1",
              title: "750ml Bottle", price: { amount: "17.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-decoy-red",
      title: "Decoy Red Wine Duckhorn Portfolio",
      handle: "decoy-red-wine-duckhorn",
      isBestSeller: false,
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Cabernet, Merlot, Zinfandel & Syrah",
      type: "🍷 California Red Blend",
      badges: [{ label: "DUCKHORN", score: "CALIFORNIA" }],
      description: "Crafted by the renowned Duckhorn winemaking team. A rich, alluring blend offering luscious blackberry, plum, and cocoa notes supported by silky tannins.",
      priceRange: {
        minVariantPrice: { amount: "20.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-decoy-red-duckhorn.webp",
              altText: "Bottle of Decoy Red Wine Duckhorn Portfolio California blend with a glass of ruby red wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-decoy-1",
              title: "750ml Bottle", price: { amount: "20.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-barefoot-pg",
      title: "Barefoot Pinot Grigio",
      handle: "barefoot-pinot-grigio",
      isBestSeller: false,
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Pinot Grigio Grapes",
      type: "🍷 California Pinot Grigio",
      badges: [{ label: "CALIFORNIA", score: "CRISP" }],
      description: "Light-bodied, crisp, and delightfully fresh with vibrant notes of green apples, tart citrus, and juicy white peaches. Pairs seamlessly with light poultry and seafood.",
      priceRange: {
        minVariantPrice: { amount: "7.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-barefoot-pinot-grigio.webp",
              altText: "Bottle of Barefoot California Pinot Grigio with a glass of fresh crisp white wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-barefoot-pg-1",
              title: "750ml Bottle", price: { amount: "7.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-cupcake-moscato",
      title: "Cupcake Vineyards Moscato",
      handle: "cupcake-vineyards-moscato",
      isBestSeller: false,
      category: "WINE",
      country: "🇮🇹 Italy",
      composition: "🍇 Italian Moscato Grapes",
      type: "🍷 Italian Sweet Moscato",
      badges: [{ label: "SWEET", score: "MOSCATO" }],
      description: "Vibrantly sweet and delightfully floral with luscious notes of white peach, honeysuckle, and nectarine balanced by soft effervescence on the finish.",
      priceRange: {
        minVariantPrice: { amount: "10.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-cupcake-vineyards-moscato.webp",
              altText: "Bottle of Cupcake Vineyards Italian Sweet Moscato with a glass of fragrant white wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-cupcake-1",
              title: "750ml Bottle", price: { amount: "10.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-apothic-red",
      title: "Apothic Red Winemaker's Blend",
      handle: "apothic-red-winemakers-blend",
      isBestSeller: false,
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Zinfandel, Syrah, Cabernet & Merlot",
      type: "🍷 California Red Blend",
      badges: [{ label: "CALIFORNIA", score: "RED BLEND" }],
      description: "A captivating master blend of Zinfandel, Syrah, Cabernet Sauvignon, and Merlot. Deep ruby color with intense flavors of black cherry, vanilla, and mocha spice.",
      priceRange: {
        minVariantPrice: { amount: "10.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-apothic-red-winemakers-blend.webp",
              altText: "Bottle of Apothic Red Winemaker's Blend California wine with a glass of rich dark red wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-apothic-red-1",
              title: "750ml Bottle", price: { amount: "10.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-la-crema",
      title: "La Crema Sonoma Coast Chardonnay",
      handle: "la-crema-sonoma-coast-chardonnay",
      isBestSeller: false,
      category: "WINE",
      country: "🇺🇸 United States",
      composition: "🍇 Sonoma Coast Chardonnay Grapes",
      type: "🍷 Sonoma Coast Chardonnay",
      badges: [{ label: "SONOMA", score: "CHARDONNAY" }],
      description: "Cool-climate Sonoma Coast Chardonnay displaying Meyer lemon, yellow apple, and toasted brioche notes with rich minerality and a balanced, lingering finish.",
      priceRange: {
        minVariantPrice: { amount: "19.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-la-crema-sonoma-chardonnay.webp",
              altText: "Bottle of La Crema Sonoma Coast Chardonnay with a glass of cool-climate white wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-la-crema-1",
              title: "750ml Bottle", price: { amount: "19.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-wine-kim-crawford",
      title: "Kim Crawford Marlborough Sauvignon Blanc",
      handle: "kim-crawford-sauvignon-blanc",
      isBestSeller: false,
      category: "WINE",
      country: "🇳🇿 New Zealand",
      composition: "🍇 Marlborough Sauvignon Blanc Grapes",
      type: "🍷 New Zealand Sauvignon Blanc",
      badges: [{ label: "NEW ZEALAND", score: "MARLBOROUGH" }],
      description: "World-famous Marlborough Sauvignon Blanc overflowing with aromas of passionfruit, fresh pink grapefruit, crushed herbs, and bright zesty acidity.",
      priceRange: {
        minVariantPrice: { amount: "15.99", currencyCode: "USD" }
      },
      images: {
        edges: [
          {
            node: {
              url: "assets/wine-kim-crawford-sauvignon-blanc.webp",
              altText: "Bottle of Kim Crawford Marlborough New Zealand Sauvignon Blanc with a glass of zesty white wine"
            }
          }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "gid://shopify/ProductVariant/wine-kim-crawford-1",
              title: "750ml Bottle", price: { amount: "15.99", currencyCode: "USD" },
              availableForSale: true
            }
          }
        ]
      }
    }
  }
];

// Uploaded & Curated 23 Products for Gin Category
const GIN_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-gin-1",
      title: "Nocturne Handcrafted Gin",
      handle: "nocturne-handcrafted-botanical-gin",
      category: "GIN",
      country: "🇬🇧 United Kingdom",
      composition: "🫐 Juniper & Wild Lavender",
      type: "🍸 Craft Botanical Gin",
      badges: [{ label: "VIVINO", score: "4.8" }, { label: "AGED", score: "RESERVE" }],
      description: "Distilled with rare mountain juniper, citrus peel, wild lavender, and cardamom in an amber glass decanter.",
      priceRange: { minVariantPrice: { amount: "95.00", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-reserve.webp", altText: "Bottle of Nocturne Handcrafted Botanical Gin with artisanal aromatics" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin1", title: "700ml Bottle", price: { amount: "95.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-2",
      title: "Highland Mountain Juniper Gin",
      handle: "highland-mountain-juniper-gin",
      category: "GIN",
      country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
      composition: "🫐 Highland Botanicals",
      type: "🍸 Scottish Dry Gin",
      badges: [{ label: "WE", score: "94" }, { label: "AGED", score: "RESERVE" }],
      description: "Crafted in the Scottish Highlands with hand-foraged heather, juniper berries, and pine needles.",
      priceRange: { minVariantPrice: { amount: "78.00", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/cat-gin.webp", altText: "Bottle of Highland Mountain Juniper Gin in mountain mist setting" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin2", title: "700ml Bottle", price: { amount: "78.00", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-17",
      title: "Aperol - 750 mL",
      handle: "aperol-aperitivo-liqueur-750ml",
      category: "GIN",
      country: "Italy",
      composition: "Orange, gentian, chinchona, herbs and spices",
      type: "Italian bitter aperitivo",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Aperol 750 mL, 22 proof. Orange-colored bittersweet aperitivo.",
      priceRange: { minVariantPrice: { amount: "26.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-aperol-aperitivo-liqueur-750ml.webp", altText: "Bottle of Aperol Aperitivo Liqueur 750ml with an aperitif glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin17", title: "750ml Bottle", price: { amount: "26.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-18",
      title: "Absente Refined Absinthe - 750 mL",
      handle: "absente-absinthe-refined-750ml",
      category: "GIN",
      country: "France (Provence)",
      composition: "Wormwood, anise, mugwort, lemon balm and mint",
      type: "Absinthe (herbal liqueur)",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Absente Absinthe Refined, 110-proof. Anise-forward with herbal notes.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-absente-absinthe-refined-750ml.webp", altText: "Bottle of Absente Absinthe Refined 750ml with a crystal glass of absinthe" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin18", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-19",
      title: "Aperol - 375 mL",
      handle: "aperol-aperitivo-liqueur-375ml",
      category: "GIN",
      country: "Italy",
      composition: "Orange, gentian, chinchona, herbs and spices",
      type: "Italian bitter aperitivo",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Aperol 375 mL, 22 proof. Bottled aperitivo used to make a spritz.",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-aperol-aperitivo-liqueur-375ml.webp", altText: "Bottle of Aperol Aperitivo Liqueur 375ml with an aperitif glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin19", title: "375ml Bottle", price: { amount: "19.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-20",
      title: "Aviation American Gin - 750 mL",
      handle: "aviation-american-gin-750ml",
      category: "GIN",
      country: "Portland, Oregon, USA",
      composition: "Neutral spirit, juniper and other botanicals",
      type: "American-style gin",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Aviation American Gin 750 mL, 84 proof. Botanicals include cardamom, lavender, coriander, anise, sarsaparilla and orange peel.",
      priceRange: { minVariantPrice: { amount: "27.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-aviation-american-gin-750ml.webp", altText: "Bottle of Aviation American Gin Batch Distilled 750ml with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin20", title: "750ml Bottle", price: { amount: "27.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-21",
      title: "Hendrick's Gin 750ml",
      handle: "hendricks-gin-750ml",
      category: "GIN",
      country: "Girvan, Scotland",
      composition: "Neutral spirit, juniper, other botanicals, cucumber, rose",
      type: "Gin",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Distillates from carter-head and pot stills are combined, then flavored with cucumber and rose. Distilled and bottled in Girvan, Scotland.",
      priceRange: { minVariantPrice: { amount: "34.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-hendricks-750ml.webp", altText: "Bottle of Hendrick's Gin 750ml with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin21", title: "750ml Bottle", price: { amount: "34.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-22",
      title: "Tanqueray London Dry Gin 750ml",
      handle: "tanqueray-london-dry-gin-750ml",
      category: "GIN",
      country: "United Kingdom",
      composition: "Grain spirit, juniper, coriander, angelica root, licorice",
      type: "London dry gin",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "The U.S. Original London Dry expression uses four core botanicals. Distilled four times and bottled in Great Britain.",
      priceRange: { minVariantPrice: { amount: "24.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-tanqueray-london-dry-750ml.webp", altText: "Bottle of Tanqueray Imported London Dry Gin 750ml with a crystal glass and clear ice sphere" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin22", title: "750ml Bottle", price: { amount: "24.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-gin-23",
      title: "Bombay Sapphire London Dry Gin 750ml",
      handle: "bombay-sapphire-london-dry-gin-750ml",
      category: "GIN",
      country: "Hampshire, England, UK",
      composition: "Neutral spirit, juniper, other botanicals",
      type: "London dry gin",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Botanicals are vapor-infused from a 1761 recipe. The U.S. expression can differ in strength from other markets.",
      priceRange: { minVariantPrice: { amount: "27.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/gin-bombay-sapphire-london-dry-750ml.webp", altText: "Bottle of Bombay Sapphire Distilled London Dry Gin 750ml with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/gin23", title: "750ml Bottle", price: { amount: "27.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

// Cigar section items - Coming Soon
const CIGAR_PRODUCTS = [];

// Uploaded & Curated 29 Products for Tequila Category
const TEQUILA_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-1",
      title: "Sauza Tequila Gold",
      handle: "sauza-tequila-gold",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 Blue Agave & Cane Sugar Blend",
      type: "🥃 Gold Tequila",
      badges: [{ label: "HECHO EN", score: "MEXICO" }, { label: "GOLD", score: "80 PROOF" }],
      description: "Crafted in Tequila, Jalisco, Mexico. Double distilled with a golden hue, sweet caramel notes, cooked agave, and a warm, clean finish.",
      priceRange: { minVariantPrice: { amount: "0.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-sauza-gold.webp", altText: "Bottle of Sauza Tequila Gold with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila1", title: "750ml Bottle", price: { amount: "19.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-2",
      title: "Espolòn Tequila Blanco",
      handle: "espolon-tequila-blanco",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 100% Blue Weber Agave",
      type: "🍸 Pure Agave Blanco",
      badges: [{ label: "WE", score: "94" }, { label: "100%", score: "AGAVE" }],
      description: "Handcrafted in the Los Altos highlands of Jalisco. Double distilled from 100% Blue Weber agave using custom copper pot stills. Vibrant lemon zest, grilled pineapple, and delicate floral pepper.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-espolon-blanco.webp", altText: "Bottle of Espolòn Tequila Blanco 100% Blue Agave with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila2", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-3",
      title: "Patron Reposado Tequila",
      handle: "patron-reposado-tequila",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 100% De Agave Tahona-Crushed",
      type: "🥃 Oak-Aged Reposado",
      badges: [{ label: "RP", score: "95" }, { label: "HANDCRAFTED", score: "RESERVE" }],
      description: "Handcrafted from 100% Weber Blue Agave and aged in oak barrels for over two months. Smooth balance of fresh agave and oak wood with notes of citrus, honey, and light floral sweetness.",
      priceRange: { minVariantPrice: { amount: "27.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-patron-reposado.webp", altText: "Bottle of Patron Reposado Tequila with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila3", title: "375ml Bottle", price: { amount: "34.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-4",
      title: "Casamigos Tequila Blanco",
      handle: "casamigos-tequila-blanco",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 100% Agave Azul Jalisco",
      type: "🍸 Ultra-Smooth Blanco",
      badges: [{ label: "VIVINO", score: "4.8" }, { label: "SMALL BATCH", score: "BLANCO" }],
      description: "Produced in small batches from 100% Blue Weber agaves slow-cooked in traditional brick ovens for 72 hours. Crisp, clean with subtle hints of vanilla, sweet citrus, and smooth grapefruit.",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-casamigos-blanco.webp", altText: "Bottle of Casamigos Tequila Blanco Small Batch 100% Agave with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila4", title: "375ml Bottle", price: { amount: "36.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
,
  // Newly Uploaded Tequilas (Authentic Distilled Bottles - No Best Seller Tag)
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-5",
      title: "1800 Tequila Blanco",
      handle: "1800-tequila-blanco",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 100% Blue Weber Agave Azul",
      type: "🍸 100% De Agave Blanco",
      badges: [{ label: "JALISCO", score: "100% AGAVE" }],
      isBestSeller: false,
      description: "Crafted from 100% Blue Weber Agave harvested at peak maturity in Jalisco, Mexico. Double distilled in copper pot stills for clean, delicate floral and citrus aromas with smooth agave sweetness and black pepper accents.",
      priceRange: { minVariantPrice: { amount: "30.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-1800-blanco.webp", altText: "Bottle of 1800 Tequila Blanco 100% Blue Agave Azul with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila5", title: "750ml Bottle", price: { amount: "30.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-6",
      title: "Jose Cuervo Especial Silver Tequila",
      handle: "jose-cuervo-especial-silver",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 Blue Agave Silver Blend",
      type: "🍸 Silver Tequila",
      badges: [{ label: "ESTD 1795", score: "SILVER" }],
      isBestSeller: false,
      description: "Master crafted at La Rojeña distillery in Jalisco, Mexico. Crisp, clean, and unaged silver tequila showcasing fresh blue agave, subtle hints of citrus, and a smooth, refreshing finish perfect for sipping or classic cocktails.",
      priceRange: { minVariantPrice: { amount: "19.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-jose-cuervo-silver.webp", altText: "Bottle of Jose Cuervo Especial Silver Tequila with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila6", title: "750ml Bottle", price: { amount: "19.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-7",
      title: "Hornitos Plata Tequila",
      handle: "hornitos-plata-tequila",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 100% Puro De Agave",
      type: "🍸 100% Blue Agave Plata",
      badges: [{ label: "CASA SAUZA", score: "100% PURO" }],
      isBestSeller: false,
      description: "Crafted by Casa Sauza in Jalisco using 100% pure Blue Weber agave. Gentle extraction and deep-pot distillation yield a lively herbal profile with fresh floral notes, balanced agave fruitiness, and a clean, zesty finish.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-hornitos-plata.webp", altText: "Bottle of Hornitos Plata 100% Puro de Agave Tequila with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila7", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-8",
      title: "Cazadores Reposado Tequila",
      handle: "cazadores-reposado-tequila",
      category: "TEQUILA",
      country: "🇲🇽 Mexico",
      composition: "🌵 100% Blue Agave Virgin Oak Aged",
      type: "🥃 Highland Reposado Tequila",
      badges: [{ label: "HIGHLANDS", score: "REPOSADO" }],
      isBestSeller: false,
      description: "Born in the highlands of Los Altos de Jalisco from 100% Blue Agave. Aged up to one year in new American virgin oak barrels, developing a pale golden hue with aromas of vanilla, wood, and tropical fruit backed by smooth agave richness.",
      priceRange: { minVariantPrice: { amount: "28.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-cazadores-reposado.webp", altText: "Bottle of Cazadores Reposado 100% Blue Agave Tequila with a crystal rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila8", title: "750ml Bottle", price: { amount: "28.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-9",
      title: "Adictivo Añejo Tequila - 750 mL",
      handle: "adictivo-tequila-anejo-750ml",
      category: "TEQUILA",
      country: "Mexico (El Arenal, Jalisco)",
      composition: "100% blue agave",
      type: "Añejo tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "750 mL. French oak maturation with toasted aromas.",
      priceRange: { minVariantPrice: { amount: "69.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-adictivo-anejo-750ml.webp", altText: "Adictivo Tequila Añejo 100% de Agave 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila9", title: "750ml Bottle", price: { amount: "69.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-10",
      title: "Olmeca Altos Añejo Tequila - 750 mL",
      handle: "olmeca-altos-tequila-anejo-750ml",
      category: "TEQUILA",
      country: "Mexico (Los Altos, Jalisco)",
      composition: "100% blue agave",
      type: "Añejo tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Olmeca Altos Añejo, 750 mL. Aged at least 12 months in bourbon barrels.",
      priceRange: { minVariantPrice: { amount: "34.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-olmeca-altos-anejo-750ml.webp", altText: "Olmeca Altos 100% Agave Tequila Añejo 750ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila10", title: "750ml Bottle", price: { amount: "34.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-11",
      title: "Olmeca Altos Plata Tequila - 750 mL",
      handle: "olmeca-altos-tequila-plata-750ml",
      category: "TEQUILA",
      country: "Mexico (Los Altos, Jalisco)",
      composition: "100% blue agave",
      type: "Blanco (plata) tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Olmeca Altos Plata, 750 mL. Unaged with cooked agave and citrus notes.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-olmeca-altos-plata-750ml.webp", altText: "Olmeca Altos 100% Agave Tequila Plata 750ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila11", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-12",
      title: "Olmeca Altos Reposado Tequila - 750 mL",
      handle: "olmeca-altos-tequila-reposado-750ml",
      category: "TEQUILA",
      country: "Mexico (Los Altos, Jalisco)",
      composition: "100% blue agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Olmeca Altos Reposado, 750 mL. Bourbon-barrel aged with cooked agave and oak notes.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-olmeca-altos-reposado-750ml.webp", altText: "Olmeca Altos 100% Agave Tequila Reposado 750ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila12", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-13",
      title: "AsomBroso La Rosa Reposado Tequila - 750 mL",
      handle: "asombroso-la-rosa-reposado-tequila-750ml",
      category: "TEQUILA",
      country: "Jalisco, Mexico",
      composition: "100% blue Weber agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "AsomBroso La Rosa Reposado 750 mL. Rested in French oak Bordeaux wine barrels, which impart a pink tint.",
      priceRange: { minVariantPrice: { amount: "44.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-asombroso-la-rosa-reposado-750ml.webp", altText: "Asombroso La Rosa Reposado Tequila 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila13", title: "750ml Bottle", price: { amount: "44.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-14",
      title: "Adictivo Reposado Tequila - 750 mL",
      handle: "adictivo-tequila-reposado-750ml",
      category: "TEQUILA",
      country: "Mexico (El Arenal, Jalisco)",
      composition: "100% blue agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "750 mL. French oak maturation with cooked agave and wood aromas.",
      priceRange: { minVariantPrice: { amount: "58.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-adictivo-reposado-750ml.webp", altText: "Adictivo Tequila Reposado 100% de Agave 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila14", title: "750ml Bottle", price: { amount: "58.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-15",
      title: "Arette Artesanal Añejo Tequila - 750 mL",
      handle: "arette-artesanal-suave-anejo-tequila-750ml",
      category: "TEQUILA",
      country: "Tequila, Jalisco, Mexico",
      composition: "100% blue Weber agave",
      type: "Añejo tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Arette Artesanal Suave Añejo 750 mL, aged in oak.",
      priceRange: { minVariantPrice: { amount: "94.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-arette-artesanal-suave-anejo-750ml.webp", altText: "Arette Artesanal Suave Añejo 100% de Agave Tequila 750ml bottle with a shot glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila15", title: "750ml Bottle", price: { amount: "94.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-16",
      title: "Alma del Jaguar Añejo Tequila - 750 mL",
      handle: "alma-del-jaguar-tequila-anejo-750ml",
      category: "TEQUILA",
      country: "Mexico (Los Altos, Jalisco)",
      composition: "100% blue agave, water and yeast",
      type: "Añejo tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Regular Añejo, 750 mL. Bottled unfiltered at the source.",
      priceRange: { minVariantPrice: { amount: "83.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-alma-del-jaguar-anejo-750ml.webp", altText: "Alma Del Jaguar Tequila Añejo 100% Puro de Agave 750ml bottle with a rocks glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila16", title: "750ml Bottle", price: { amount: "83.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-17",
      title: "Alma del Jaguar Blanco Tequila - 750 mL",
      handle: "alma-del-jaguar-tequila-blanco-750ml",
      category: "TEQUILA",
      country: "Mexico (Los Altos, Jalisco)",
      composition: "100% blue agave, water and yeast",
      type: "Blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Blanco, 750 mL. Bottled unfiltered at the source.",
      priceRange: { minVariantPrice: { amount: "49.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-alma-del-jaguar-blanco-750ml.webp", altText: "Alma Del Jaguar Tequila Blanco 100% Puro de Agave 750ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila17", title: "750ml Bottle", price: { amount: "49.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-18",
      title: "Amatitena Reposado Tequila - 750 mL",
      handle: "amatitena-tequila-reposado-750ml",
      category: "TEQUILA",
      country: "Mexico (Amatitán, Jalisco)",
      composition: "100% blue agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Amatiteña Reposado, 750 mL export bottle. Producer sheet matches the UPC and 42% ABV.",
      priceRange: { minVariantPrice: { amount: "84.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-amatitena-reposado-750ml.webp", altText: "Amatiteña Tequila Reposado 100% de Agave 750ml bottle with a shot glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila18", title: "750ml Bottle", price: { amount: "84.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-19",
      title: "Arette Artesanal Suave Blanco Tequila - 750 mL",
      handle: "arette-artesanal-suave-blanco-tequila-750ml",
      category: "TEQUILA",
      country: "Tequila, Jalisco, Mexico",
      composition: "100% blue Weber agave",
      type: "Blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Arette Artesanal Suave Blanco 750 mL. UPC distinguishes this from Clásica.",
      priceRange: { minVariantPrice: { amount: "54.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-arette-artesanal-suave-blanco-750ml.webp", altText: "Arette Artesanal Suave Blanco 100% de Agave Tequila 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila19", title: "750ml Bottle", price: { amount: "54.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-20",
      title: "Arette Reposado Tequila - 1 L",
      handle: "arette-reposado-tequila-1l",
      category: "TEQUILA",
      country: "Tequila, Jalisco, Mexico",
      composition: "100% blue Weber agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Arette Clásica Reposado 1 L, rested in oak. This is the Clásica 1 L release.",
      priceRange: { minVariantPrice: { amount: "31.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-arette-reposado-1l.webp", altText: "Arette 100% de Agave Reposado Tequila 1.0L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila20", title: "1.0L Bottle", price: { amount: "31.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-21",
      title: "ArteNOM Selección 1579 Blanco Tequila - 750 mL",
      handle: "artenom-seleccion-1579-blanco-tequila-750ml",
      category: "TEQUILA",
      country: "Jesús María, Jalisco, Mexico",
      composition: "100% highland blue Weber agave",
      type: "Blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "ArteNOM Selección de 1579, made at Destilería El Pandillo. Maine lists 81.4 proof for this UPC.",
      priceRange: { minVariantPrice: { amount: "60.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-artenom-seleccion-1579-blanco-750ml.webp", altText: "ArteNOM Selección de 1579 Blanco Tequila 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila21", title: "750ml Bottle", price: { amount: "60.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-22",
      title: "Arette Blanco Tequila - 1 L",
      handle: "arette-blanco-tequila-1l",
      category: "TEQUILA",
      country: "Tequila, Jalisco, Mexico",
      composition: "100% blue Weber agave",
      type: "Blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Arette Clásica Blanco 1 L, 80 proof.",
      priceRange: { minVariantPrice: { amount: "31.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-arette-blanco-1l.webp", altText: "Arette 100% de Agave Blanco Tequila 1.0L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila22", title: "1.0L Bottle", price: { amount: "31.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-23",
      title: "Arette Artesanal Suave Reposado Tequila - 750 mL",
      handle: "arette-artesanal-suave-reposado-tequila-750ml",
      category: "TEQUILA",
      country: "Tequila, Jalisco, Mexico",
      composition: "100% blue Weber agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Arette Artesanal Suave Reposado 750 mL, rested in oak. UPC distinguishes this from Clásica.",
      priceRange: { minVariantPrice: { amount: "62.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-arette-artesanal-suave-reposado-750ml.webp", altText: "Arette Artesanal Suave Reposado 100% de Agave Tequila 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila23", title: "750ml Bottle", price: { amount: "62.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-24",
      title: "100 Años Reposado Tequila - 750 mL",
      handle: "100-anos-tequila-reposado-750ml",
      category: "TEQUILA",
      country: "Mexico",
      composition: "Agave-based tequila",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "100 Años Reposado, 750 mL. NC ABC lists this UPC at 80 proof.",
      priceRange: { minVariantPrice: { amount: "22.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-100-anos-reposado-750ml.webp", altText: "100 Años Tequila Reposado 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila24", title: "750ml Bottle", price: { amount: "22.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-25",
      title: "4 Copas Blanco Tequila - 750 mL",
      handle: "4-copas-organic-blanco-tequila-750ml",
      category: "TEQUILA",
      country: "Jalisco, Mexico",
      composition: "Organic blue agave",
      type: "Organic blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Standard 80-proof Blanco expression. The brand also sells a separate high-proof expression.",
      priceRange: { minVariantPrice: { amount: "52.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-4-copas-organic-blanco-750ml.webp", altText: "4 Copas The Original Organic Tequila Blanco 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila25", title: "750ml Bottle", price: { amount: "52.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-26",
      title: "818 Añejo Tequila - 750 mL",
      handle: "818-tequila-anejo-750ml",
      category: "TEQUILA",
      country: "Jalisco, Mexico",
      composition: "Blue Weber agave",
      type: "Añejo tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "818 ages this expression for over one year in French and American oak.",
      priceRange: { minVariantPrice: { amount: "45.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-818-anejo-750ml.webp", altText: "818 Tequila Añejo 100% Agave Azul 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila26", title: "750ml Bottle", price: { amount: "45.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-27",
      title: "818 Blanco Tequila - 750 mL",
      handle: "818-tequila-blanco-750ml",
      category: "TEQUILA",
      country: "Jalisco, Mexico",
      composition: "Blue Weber agave",
      type: "Blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "818's unaged blanco expression.",
      priceRange: { minVariantPrice: { amount: "29.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-818-blanco-750ml.webp", altText: "818 Tequila Blanco 100% Agave Azul 750ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila27", title: "750ml Bottle", price: { amount: "29.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-28",
      title: "1800 Blanco Tequila - 375 mL",
      handle: "1800-tequila-blanco-375ml",
      category: "TEQUILA",
      country: "Mexico",
      composition: "Blue Weber agave, yeast, water",
      type: "Blanco tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Double-distilled blanco tequila.",
      priceRange: { minVariantPrice: { amount: "18.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-1800-blanco-375ml.webp", altText: "1800 Tequila Blanco 100% Agave Azul 375ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila28", title: "375ml Bottle", price: { amount: "18.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-tequila-29",
      title: "1800 Reposado Tequila - 375 mL",
      handle: "1800-tequila-reposado-375ml",
      category: "TEQUILA",
      country: "Mexico",
      composition: "Blue Weber agave",
      type: "Reposado tequila",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Oak-aged reposado tequila in the 375 mL bottle.",
      priceRange: { minVariantPrice: { amount: "18.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/tequila-1800-reposado-375ml.webp", altText: "1800 Tequila Reposado 100% Agave Azul 375ml bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/tequila29", title: "375ml Bottle", price: { amount: "18.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

// Uploaded & Curated 8 Products for Ready To Enjoy Category
const READY_TO_ENJOY_PRODUCTS = [
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-1",
      title: "Artigiano Mango Bellini - 750 mL",
      handle: "artigiano-bellini-mango-750ml",
      category: "READY_TO_ENJOY",
      country: "Check bottle — conflicting sources",
      composition: "White wine, fruit purée",
      type: "Ready-to-drink wine-based Bellini",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Producer Mango technical specification lists 6% ABV. The regulatory filing assigns this UPC to Peach at 5%, while Clover says Mango. Origin sources conflict between Spain and Germany. Confirm flavor, UPC, ABV and origin on the inventory bottle.",
      priceRange: { minVariantPrice: { amount: "10.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-artigiano-bellini-mango-750ml.webp", altText: "Artigiano Mango Bellini 750 mL bottle with a sparkling flute glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd1", title: "750ml Bottle", price: { amount: "10.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-2",
      title: "Artigiano Peach Bellini - 750 mL",
      handle: "artigiano-bellini-peach-750ml",
      category: "READY_TO_ENJOY",
      country: "Check bottle — conflicting sources",
      composition: "White wine, fruit purée",
      type: "Ready-to-drink wine-based Bellini",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Producer Peach technical specification lists 6% ABV. The regulatory filing assigns this UPC to Mango at 6%, while Clover says Peach. Technical sheets identify Germany and related brand metadata lists Spain. Confirm flavor, UPC and origin on the inventory bottle.",
      priceRange: { minVariantPrice: { amount: "10.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-artigiano-bellini-peach-750ml.webp", altText: "Artigiano Peach Bellini 750 mL bottle with a sparkling flute glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd2", title: "750ml Bottle", price: { amount: "10.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-3",
      title: "Artigiano Strawberry Bellini - 750 mL",
      handle: "artigiano-bellini-strawberry-750ml",
      category: "READY_TO_ENJOY",
      country: "Spain (brand listing)",
      composition: "White wine, strawberry purée",
      type: "Ready-to-drink strawberry Bellini",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Producer Strawberry technical specification lists 6% ABV. The regulatory filing lists 5% for this UPC. Use 6% as the named-product reference and confirm the inventory bottle label.",
      priceRange: { minVariantPrice: { amount: "10.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-artigiano-bellini-strawberry-750ml.webp", altText: "Artigiano Strawberry Bellini 750 mL bottle with a sparkling flute glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd3", title: "750ml Bottle", price: { amount: "10.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-4",
      title: "Bacardí Island Punch Rum Cocktail - 1.75 L",
      handle: "bacardi-island-punch-175l",
      category: "READY_TO_ENJOY",
      country: "Check bottle — origin unverified",
      composition: "BACARDÍ rum, pineapple juice and tropical flavorings",
      type: "Ready-to-serve rum cocktail",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Island Punch with guava, hibiscus, prickly pear and lime flavor notes. 1.75 L. Finished cocktail production site not verified. Retailer country fields conflict, so the country of the finished cocktail requires the package's origin statement.",
      priceRange: { minVariantPrice: { amount: "15.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-bacardi-island-punch-175l.webp", altText: "Bacardí Island Punch Rum Cocktail 1.75 L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd4", title: "1.75L Bottle", price: { amount: "15.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-5",
      title: "1800 Ultimate Strawberry Margarita - 1.75 L",
      handle: "1800-ultimate-strawberry-margarita-175l",
      category: "READY_TO_ENJOY",
      country: "Lawrenceburg, Indiana, USA",
      composition: "Tequila, strawberry flavoring",
      type: "Ready-to-drink margarita",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Strawberry ready-to-serve margarita in the 1.75 L bottle. Back-label production statement identifies Proximo in Lawrenceburg, Indiana, USA.",
      priceRange: { minVariantPrice: { amount: "20.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-1800-ultimate-margarita-strawberry-175l.webp", altText: "1800 The Ultimate Strawberry Margarita Ready to Serve 1.75 L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd5", title: "1.75L Bottle", price: { amount: "20.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-6",
      title: "1800 Ultimate Blood Orange Margarita - 1.75 L",
      handle: "1800-ultimate-blood-orange-margarita-175l",
      category: "READY_TO_ENJOY",
      country: "Lawrenceburg, Indiana, USA",
      composition: "Tequila, blood orange flavoring",
      type: "Ready-to-drink margarita",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Blood orange ready-to-serve margarita. NC ABC lists 19.9 proof for this UPC. Back-label production statement identifies Proximo in Lawrenceburg, Indiana, USA.",
      priceRange: { minVariantPrice: { amount: "20.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-1800-ultimate-margarita-blood-orange-175l.webp", altText: "1800 The Ultimate Blood Orange Margarita Ready to Serve 1.75 L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd6", title: "1.75L Bottle", price: { amount: "20.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-7",
      title: "1800 Ultimate Pineapple Margarita - 1.75 L",
      handle: "1800-ultimate-pineapple-margarita-175l",
      category: "READY_TO_ENJOY",
      country: "Lawrenceburg, Indiana, USA",
      composition: "Tequila, pineapple flavoring",
      type: "Ready-to-drink margarita",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Pineapple ready-to-serve margarita in the 1.75 L bottle. Back-label production statement identifies Proximo in Lawrenceburg, Indiana, USA.",
      priceRange: { minVariantPrice: { amount: "20.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-1800-ultimate-margarita-pineapple-175l.webp", altText: "1800 The Ultimate Pineapple Margarita Ready to Serve 1.75 L bottle with a rocks glass on ice" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd7", title: "1.75L Bottle", price: { amount: "20.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  },
  {
    node: {
      id: "gid://shopify/Product/custom-rtd-8",
      title: "Bartenders Trading Co. Hot Sex Cocktail - 750 mL",
      handle: "bartenders-hot-sex-cocktail-750ml",
      category: "READY_TO_ENJOY",
      country: "United States",
      composition: "Vodka, ginger liqueur, dairy cream, chocolate flavor and ginseng",
      type: "Ready-to-drink vodka cream cocktail",
      badges: [],
      isBestSeller: false,
      hasNoDetails: false,
      description: "Bartenders Trading Co. Hot Sex chocolate and ginger cocktail, listed at 25 proof by NC ABC. 750 mL.",
      priceRange: { minVariantPrice: { amount: "16.99", currencyCode: "USD" } },
      images: { edges: [{ node: { url: "assets/rtd-bartenders-hot-sex-cocktail-750ml.webp", altText: "Bartenders Trading Co. Hot Sex Ready to Drink Cocktail 750 mL bottle with a rocks glass" } }] },
      variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/rtd8", title: "750ml Bottle", price: { amount: "16.99", currencyCode: "USD" }, availableForSale: true } }] }
    }
  }
];

async function fetchProducts(first = 24) {
  // Instant synchronous/resolved catalog for blazing fast page load
  return [...WHISKEY_PRODUCTS, ...RUM_PRODUCTS, ...BEER_PRODUCTS, ...WINE_PRODUCTS, ...VODKA_PRODUCTS, ...GIN_PRODUCTS, ...TEQUILA_PRODUCTS, ...READY_TO_ENJOY_PRODUCTS, ...CIGAR_PRODUCTS];
}

async function fetchProductByHandle(handle) {
  const allProducts = [...WHISKEY_PRODUCTS, ...RUM_PRODUCTS, ...BEER_PRODUCTS, ...WINE_PRODUCTS, ...VODKA_PRODUCTS, ...GIN_PRODUCTS, ...TEQUILA_PRODUCTS, ...READY_TO_ENJOY_PRODUCTS, ...CIGAR_PRODUCTS];
  const handleAliases = {
    "macallan-25-fine-oak": "knob-creek-smoked-maple",
    "copper-cask-12-year": "johnnie-walker-black-label",
    "the-serpentine-cask": "makers-mark-bourbon",
    "macallan-30-fine-rare": "jim-beam-devils-cut",
    "baxter-reserve-15-year": "fireball-cinnamon-whisky",
    "highland-decanter-cask-21": "blue-note-crossroads",
    "hand-blown-artisan-malt": "woodford-reserve-select",
    "topographical-map-edition": "jack-daniels-old-no7",
    "organic-flowing-glass-reserve": "bulleit-rye-12-year",
    "studio-crystal-reserve-18": "jameson-triple-distilled",
    "tapered-silver-crest-bourbon": "crown-royal-kc-edition",
    "charred-american-cask-10": "elijah-craig-1789-single-barrel",
    "the-reserve-barrel-proof": "four-roses-bourbon",
    "vintage-cask-collection-1998": "dewars-white-label",
    "heritage-barrel-house-malt": "wild-turkey-101",
    "solera-cask-reserve-20-year": "wild-turkey-101",
    // Rum aliases
    "the-scotchman-18-year-rum": "bacardi-rum-punch",
    "elite-monogram-25-year-rum": "malibu-black",
    "forge-distillery-8-year-rum": "bacardi-rum-punch",
    "terra-vita-18-year-rum": "malibu-black",
    "highland-estate-18-year-rum": "bacardi-rum-punch",
    "islander-solera-reserve-rum": "malibu-black",
    "caribbean-cane-pot-still": "bacardi-rum-punch",
    "barbados-cask-gold-rum": "malibu-black",
    "sanctuary-aged-dark-rum": "bacardi-rum-punch",
    "plantation-vintage-cask-rum": "malibu-black",
    "havana-ember-double-cask": "bacardi-rum-punch",
    "trinidad-overproof-pot-rum": "malibu-black",
    "panama-single-estate-rum": "bacardi-rum-punch",
    "jamaican-high-ester-rum": "malibu-black",
    "admirals-cellar-reserve-30": "bacardi-rum-punch",
    "royal-navy-overproof-cask-rum": "malibu-black",
    // Beer aliases
    "abbaye-saint-feuillien-grand-cru": "blue-moon-belgian-white",
    "cosmic-haze-hazy-ipa": "budweiser-king-of-beers",
    "sunburst-citrus-wheat-ale": "bud-light",
    "rustic-forge-imperial-stout": "miller-lite-pilsner",
    "traditional-cork-belgian-ale": "corona-extra",
    "amber-crown-trappist-ale": "coors-light",
    "black-forest-barrel-aged-stout": "michelob-ultra",
    "highland-heather-craft-ale": "guinness-extra-stout",
    "golden-meadow-belgian-saison": "dos-equis-xx-lager",
    "emerald-coast-double-ipa": "modelo-especial",
    "vintage-cask-oak-quadrupel": "stella-artois-lager",
    "smokehouse-bourbon-barrel-porter": "guinness-extra-stout",
    "cascade-hop-harvest-ale": "blue-moon-belgian-white",
    "artisan-sour-cherry-kriek": "corona-extra",
    "monastery-reserve-tripel": "stella-artois-lager",
    "trappist-oak-quad-2021": "stella-artois-lager",
    // Vodka aliases
    "artisanal-hand-blown-reserve-vodka": "absolut-vodka-swedish",
    "contemporary-craft-distilled-vodka": "grey-goose-vodka",
    "diamond-cut-crystal-vodka": "titos-handmade-vodka",
    "the-frost-cask-organic-vodka": "smirnoff-no21-vodka",
    "valkyrie-crown-platinum-vodka": "absolut-vodka-swedish",
    "nordic-mist-botanical-vodka": "grey-goose-vodka",
    "monogram-crystal-reserve-vodka": "titos-handmade-vodka",
    "glacial-summit-artisan-vodka": "smirnoff-no21-vodka",
    "baltic-amber-cask-vodka": "absolut-vodka-swedish",
    "tundra-reserve-copper-pot": "titos-handmade-vodka",
    "siberian-luxe-faceted-vodka": "smirnoff-no21-vodka",
    "aurora-borealis-prism-vodka": "grey-goose-vodka",
    "golden-flair-prestige-vodka": "absolut-vodka-swedish",
    "arctic-pure-glacial-spring": "grey-goose-vodka",
    "black-diamond-truffle-vodka": "titos-handmade-vodka",
    "imperial-nordic-platinum-vodka": "absolut-vodka-swedish",
    // Wine aliases
    "domaines-des-etoiles-pinot-noir": "apothic-inferno-red-wine",
    "chateau-margaux-cabernet-sauvignon": "josh-cellars-cabernet",
    "veuve-clicquot-la-grande-dame": "kendall-jackson-chardonnay",
    "whispering-angel-provence-rose": "sutter-home-rose",
    "caymus-special-selection-cabernet": "josh-cellars-cabernet",
    "dom-perignon-vintage-luminous": "kendall-jackson-chardonnay",
    "silver-oak-alexander-valley": "josh-cellars-cabernet",
    "chablis-premier-cru-montmains": "kendall-jackson-chardonnay",
    "opulence-reserve-blend-2017": "apothic-inferno-red-wine",
    "barolo-riserva-monfortino-2015": "meiomi-pinot-noir",
    "domaine-leflaive-puligny-montrachet": "kendall-jackson-chardonnay",
    "chateau-dyquem-sauternes-2015": "barefoot-on-tap-moscato",
    "sassicaia-bolgheri-superiore-2019": "yellow-tail-shiraz",
    "belle-glos-clark-telephone-pinot": "meiomi-pinot-noir",
    "sancerre-blanc-les-monts-2022": "bota-box-california-3l",
    "chateau-prestige-pauillac-2018": "apothic-inferno-red-wine",
    // Tequila aliases
    "clase-azul-reposado-agave": "patron-reposado-tequila",
    "don-julio-1942-anejo-reserve": "casamigos-tequila-blanco",
    "fortaleza-still-strength-blanco": "espolon-tequila-blanco",
    "herrero-doble-cask-reposado": "sauza-tequila-gold",
    "casamigos-anejo-highland-reserve": "casamigos-tequila-blanco",
    "tequila-ocho-single-estate-plata": "espolon-tequila-blanco",
    "gran-patron-piedra-extra-anejo": "patron-reposado-tequila",
    "san-matias-tahona-blanco": "sauza-tequila-gold",
    "siete-leguas-d’antano-extra-anejo": "patron-reposado-tequila",
    "el-tesoro-paraiso-extra-anejo": "casamigos-tequila-blanco",
    "cuervo-reserva-de-la-familia": "sauza-tequila-gold",
    "g4-tequila-madera-reposado": "patron-reposado-tequila",
    "volcan-de-mi-tierra-cristalino": "espolon-tequila-blanco",
    "maestro-dobel-50-cristalino": "casamigos-tequila-blanco",
    "arette-artesanal-suave-blanco": "sauza-tequila-gold",
    "clase-azul-ultra-extra-anejo": "patron-reposado-tequila",
  };
  const effectiveHandle = handleAliases[handle] || handle;
  const localMatch = allProducts.find((p) => p.node.handle === effectiveHandle);
  if (localMatch) {
    return localMatch;
  }
  return null;
}

// Wishlist Core
const Wishlist = {
  items: [],
  handlesSet: new Set(),

  init() {
    this.load();
    this.setupEventListeners();
    this.render();
  },

  updateSet() {
    this.handlesSet = new Set(this.items.map((i) => i.product?.node?.handle || i.handle || (typeof i === "string" ? i : "")));
  },

  load() {
    try {
      const stored = localStorage.getItem("whiskey-barrel-wishlist") || localStorage.getItem("shopify-cart-vanilla");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.items = parsed.items || [];
      }
    } catch (error) {
      console.error("Failed to load wishlist from localStorage", error);
    }
    this.updateSet();
  },

  save() {
    this.updateSet();
    try {
      localStorage.setItem("whiskey-barrel-wishlist", JSON.stringify({
        items: this.items
      }));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  },

  isInWishlist(handle) {
    return this.handlesSet.has(handle);
  },

  toggleItem(handle, variantId) {
    const allProducts = [
      ...WHISKEY_PRODUCTS,
      ...RUM_PRODUCTS,
      ...BEER_PRODUCTS,
      ...VODKA_PRODUCTS,
      ...WINE_PRODUCTS,
      ...GIN_PRODUCTS,
      ...TEQUILA_PRODUCTS,
      ...READY_TO_ENJOY_PRODUCTS,
      ...CIGAR_PRODUCTS
    ];
    const found = allProducts.find(p => p.node.handle === handle);
    if (!found) return;

    const p = found.node;
    const existingIndex = this.items.findIndex(i => (i.product?.node?.handle === handle || i.handle === handle));

    if (existingIndex > -1) {
      // Remove from wishlist
      this.items.splice(existingIndex, 1);
      this.save();
      this.render();
      this.updateHeartButtons(handle, false);
      toast.info("Removed from Wishlist", `${p.title} removed from your wishlist.`);
    } else {
      // Add to wishlist
      const vId = variantId || p.variants.edges[0]?.node?.id;
      const selectedOptions = p.variants.edges[0]?.node?.selectedOptions || [];
      const price = p.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" };

      this.items.push({
        handle: p.handle,
        product: found,
        variantId: vId,
        selectedOptions: selectedOptions,
        price: price,
        quantity: 1
      });
      this.save();
      this.render();
      this.updateHeartButtons(handle, true);
      toast.success("Saved to Wishlist", `${p.title} added to your wishlist.`);
    }
  },

  addItem(item) {
    const handle = item.product?.node?.handle || item.handle;
    if (!this.isInWishlist(handle)) {
      this.items.push({
        handle: handle,
        product: item.product,
        variantId: item.variantId || item.product?.node?.variants?.edges?.[0]?.node?.id,
        selectedOptions: item.selectedOptions || [],
        price: item.price || item.product?.node?.priceRange?.minVariantPrice || { amount: "0.00", currencyCode: "USD" },
        quantity: 1
      });
      this.save();
      this.render();
      this.updateHeartButtons(handle, true);
      toast.success("Saved to Wishlist", `${item.product?.node?.title || "Item"} saved to your wishlist.`);
    }
    this.openDrawer();
  },

  removeItem(handleOrVariantId) {
    const item = this.items.find(i => i.variantId === handleOrVariantId || i.handle === handleOrVariantId || i.product?.node?.handle === handleOrVariantId);
    const title = item?.product?.node?.title || "Item";
    const handle = item?.handle || item?.product?.node?.handle;

    this.items = this.items.filter(i => i.variantId !== handleOrVariantId && i.handle !== handleOrVariantId && i.product?.node?.handle !== handleOrVariantId);
    this.save();
    this.render();
    if (handle) {
      this.updateHeartButtons(handle, false);
    }
    toast.info("Removed from Wishlist", `${title} removed from your wishlist.`);
  },

  clearWishlist() {
    this.items = [];
    this.save();
    this.render();
    document.querySelectorAll(".product-card-heart-btn").forEach(btn => {
      btn.classList.remove("is-active");
      const svg = btn.querySelector("svg");
      if (svg) svg.setAttribute("fill", "none");
    });
  },

  updateHeartButtons(handle, isActive) {
    // Update all heart buttons for this handle on page
    document.querySelectorAll(`[data-heart-handle="${handle}"]`).forEach(btn => {
      if (isActive) {
        btn.classList.add("is-active");
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", "currentColor");
        btn.setAttribute("title", "Remove from Wishlist");
        btn.setAttribute("aria-label", "Remove from Wishlist");
      } else {
        btn.classList.remove("is-active");
        const svg = btn.querySelector("svg");
        if (svg) svg.setAttribute("fill", "none");
        btn.setAttribute("title", "Save to Wishlist");
        btn.setAttribute("aria-label", "Save to Wishlist");
      }
    });

    // Update product page button if on product page
    const prodWishlistBtn = document.getElementById("product-wishlist-btn");
    const prodWishlistText = document.getElementById("product-wishlist-btn-text");
    if (prodWishlistBtn && prodWishlistText) {
      if (isActive) {
        prodWishlistBtn.classList.add("bg-ember", "text-[#14100c]");
        prodWishlistBtn.classList.remove("bg-ember/10", "text-ember");
        const svg = prodWishlistBtn.querySelector("svg");
        if (svg) svg.setAttribute("fill", "currentColor");
        prodWishlistText.textContent = "In Wishlist";
      } else {
        prodWishlistBtn.classList.remove("bg-ember", "text-[#14100c]");
        prodWishlistBtn.classList.add("bg-ember/10", "text-ember");
        const svg = prodWishlistBtn.querySelector("svg");
        if (svg) svg.setAttribute("fill", "none");
        prodWishlistText.textContent = "Add to Wishlist";
      }
    }
  },

  render() {
    const totalItems = this.items.length;
    const totalPrice = this.items.reduce(
      (sum, item) => sum + parseFloat(item.price?.amount || item.product?.node?.priceRange?.minVariantPrice?.amount || 0),
      0
    );
    const currency = this.items[0]?.price?.currencyCode ?? "USD";

    // Update badge
    const badge = document.getElementById("cart-badge");
    if (badge) {
      if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    // Update drawer description
    const desc = document.getElementById("cart-description");
    if (desc) {
      desc.textContent = totalItems === 0
        ? "Your wishlist is empty"
        : `${totalItems} bottle${totalItems !== 1 ? "s" : ""} saved in wishlist`;
    }

    // Update empty state vs items list
    const emptyState = document.getElementById("cart-empty-state");
    const itemsContainer = document.getElementById("cart-items-container");
    const footer = document.getElementById("cart-footer");

    if (totalItems === 0) {
      emptyState?.classList.remove("hidden");
      emptyState?.classList.add("flex");
      itemsContainer?.classList.add("hidden");
      footer?.classList.add("hidden");
    } else {
      emptyState?.classList.add("hidden");
      emptyState?.classList.remove("flex");
      itemsContainer?.classList.remove("hidden");
      footer?.classList.remove("hidden");

      // Update total price
      const totalPriceEl = document.getElementById("cart-total-price");
      if (totalPriceEl) {
        totalPriceEl.textContent = formatMoney(totalPrice, currency);
      }

      // Render items
      if (itemsContainer) {
        itemsContainer.innerHTML = this.items.map((item) => {
          const pNode = item.product?.node || item;
          const imgUrl = pNode.images?.edges?.[0]?.node?.url || "";
          const optionsStr = item.selectedOptions?.map((o) => o.value).join(" • ") || pNode.category || "Premium Spirit";
          const itemPriceFormatted = formatMoney(parseFloat(item.price?.amount || pNode.priceRange?.minVariantPrice?.amount || 0), item.price?.currencyCode || "USD");

          return `
            <div class="flex gap-4 rounded-sm border border-border/70 bg-card/80 p-3.5 transition-colors duration-300 hover:border-ember/50 items-center">
              <a href="product.html?handle=${pNode.handle}" class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm bg-[#161310] border border-border/40 block">
                ${imgUrl ? `<img src="${imgUrl}" alt="${pNode.images?.edges?.[0]?.node?.altText || pNode.title}" class="h-full w-full object-contain p-1">` : ""}
              </a>
              <div class="min-w-0 flex-1">
                <a href="product.html?handle=${pNode.handle}" class="hover:text-ember transition-colors">
                  <h4 class="truncate font-medium text-sm text-foreground">${pNode.title}</h4>
                </a>
                <p class="text-[11px] text-muted-foreground mt-0.5">${optionsStr}</p>
                <p class="mt-1 font-semibold text-ember text-sm">${itemPriceFormatted}</p>
              </div>
              <div class="flex flex-shrink-0 flex-col items-end gap-2">
                <button type="button" aria-label="Remove from Wishlist" title="Remove" onclick="Wishlist.removeItem('${pNode.handle}')" class="text-muted-foreground transition-colors duration-300 hover:text-destructive p-1.5 rounded hover:bg-white/5">
                  <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
                <a href="product.html?handle=${pNode.handle}" class="text-[10px] uppercase tracking-wider text-ember hover:underline font-semibold">
                  View &rarr;
                </a>
              </div>
            </div>
          `;
        }).join("");

        // Re-trigger lucide icons rendering inside wishlist items only
        if (window.lucide && itemsContainer) {
          window.lucide.createIcons({ root: itemsContainer });
        }
      }
    }
  },

  openDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("translate-x-full");
      drawer.classList.add("translate-x-0");
      overlay.classList.remove("opacity-0", "pointer-events-none");
      overlay.classList.add("opacity-100", "pointer-events-auto");
    }
  },

  closeDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("translate-x-0");
      drawer.classList.add("translate-x-full");
      overlay.classList.remove("opacity-100", "pointer-events-auto");
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
  },

  setupEventListeners() {
    // Wishlist open
    const trigger = document.getElementById("cart-trigger-btn");
    if (trigger) {
      trigger.addEventListener("click", () => this.openDrawer());
    }

    // Wishlist close
    const closeBtn = document.getElementById("cart-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeDrawer());
    }

    // Overlay click close
    const overlay = document.getElementById("cart-drawer-overlay");
    if (overlay) {
      overlay.addEventListener("click", () => this.closeDrawer());
    }

    // Escape key close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDrawer();
      }
    });
  }
};

const Cart = Wishlist;
window.Wishlist = Wishlist;
window.Cart = Wishlist;
window.toast = toast;



// Global Quantity Counter & Wishlist Handlers
window.increaseQty = function(handle) {
  const input = document.getElementById(`qty-${handle}`);
  if (input) {
    let val = parseInt(input.value, 10) || 1;
    input.value = val + 1;
  }
};

window.decreaseQty = function(handle) {
  const input = document.getElementById(`qty-${handle}`);
  if (input) {
    let val = parseInt(input.value, 10) || 1;
    if (val > 1) {
      input.value = val - 1;
    }
  }
};

window.handleAddToCart = function(handle, variantId) {
  Wishlist.toggleItem(handle, variantId);
};

window.handleWishlistToggle = function(handle, variantId) {
  Wishlist.toggleItem(handle, variantId);
};

// Helper to get Flag SVG/Graphic based on country text
function getCountryFlagSVG(countryStr) {
  const str = (countryStr || "").toLowerCase();
  
  if (str.includes("scotland")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="60" height="40" fill="#0065BD"/>
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" stroke-width="8"/>
    </svg>`;
  }
  if (str.includes("united states") || str.includes("usa") || str.includes("kentucky")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="60" height="40" fill="#B22234"/>
      <path d="M0 6h60M0 12h60M0 18h60M0 24h60M0 30h60M0 36h60" stroke="#FFFFFF" stroke-width="3"/>
      <rect width="24" height="21" fill="#3C3B6E"/>
    </svg>`;
  }
  if (str.includes("france")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="20" height="40" fill="#002395"/>
      <rect x="20" width="20" height="40" fill="#FFFFFF"/>
      <rect x="40" width="20" height="40" fill="#ED2939"/>
    </svg>`;
  }
  if (str.includes("south africa")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="60" height="20" fill="#E03C31"/>
      <rect y="20" width="60" height="20" fill="#001489"/>
      <path d="M0 0 L30 20 L0 40 Z" fill="#000000"/>
      <path d="M0 0 L30 20 L0 40" stroke="#FFB81C" stroke-width="4" fill="none"/>
      <path d="M0 5 L22.5 20 L0 35" stroke="#FFFFFF" stroke-width="3" fill="none"/>
      <path d="M0 20 H60 M22.5 20 H60" stroke="#007A3D" stroke-width="8"/>
      <path d="M22.5 20 H60" stroke="#FFFFFF" stroke-width="12" fill="none"/>
      <path d="M25 20 H60" stroke="#007A3D" stroke-width="8"/>
    </svg>`;
  }
  if (str.includes("cuba")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="60" height="40" fill="#002A8F"/>
      <path d="M0 8h60M0 24h60" stroke="#FFFFFF" stroke-width="8"/>
      <path d="M0 0 L28 20 L0 40 Z" fill="#CF142B"/>
      <polygon points="9,20 12,11 19,16 11,16 16,11" fill="#FFFFFF"/>
    </svg>`;
  }
  if (str.includes("jamaica")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="60" height="40" fill="#009B3A"/>
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FED100" stroke-width="8"/>
      <polygon points="0,0 30,20 0,40" fill="#000000"/>
      <polygon points="60,0 30,20 60,40" fill="#000000"/>
    </svg>`;
  }
  if (str.includes("ireland")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="20" height="40" fill="#169B62"/>
      <rect x="20" width="20" height="40" fill="#FFFFFF"/>
      <rect x="40" width="20" height="40" fill="#FF883E"/>
    </svg>`;
  }
  if (str.includes("japan")) {
    return `<svg class="w-6 h-4 rounded-xs shadow-2xs overflow-hidden flex-shrink-0 inline-block align-middle" viewBox="0 0 60 40">
      <rect width="60" height="40" fill="#FFFFFF"/>
      <circle cx="30" cy="20" r="12" fill="#BC002D"/>
    </svg>`;
  }
  
  return `<svg class="w-5 h-5 text-slate-500 flex-shrink-0 inline-block align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>`;
}

// Helper to get Grape/Grain SVG Icon matching reference image
function getGrainsGrapesSVG() {
  return `<svg class="w-5 h-5 flex-shrink-0 inline-block align-middle" viewBox="0 0 32 32">
    <path fill="#65a30d" d="M14 3c-3 0-6 2.5-7 5.5 3 0 6-1.5 7-5.5z"/>
    <path fill="#84cc16" d="M14 3c2 0 4.5 1.5 5.5 4-2.5 0-4.5-1.5-5.5-4z"/>
    <circle cx="16" cy="11" r="3.2" fill="#8b5cf6"/>
    <circle cx="11.5" cy="13.5" r="3.2" fill="#7c3aed"/>
    <circle cx="20.5" cy="13.5" r="3.2" fill="#7c3aed"/>
    <circle cx="13.8" cy="19" r="3.2" fill="#6d28d9"/>
    <circle cx="18.2" cy="19" r="3.2" fill="#6d28d9"/>
    <circle cx="16" cy="24.5" r="2.8" fill="#5b21b6"/>
  </svg>`;
}

// Helper to get Glass SVG Icon matching reference image
function getGlassIconSVG(typeStr) {
  const str = (typeStr || "").toLowerCase();
  const isWine = str.includes("wine") || str.includes("rose") || str.includes("champagne");
  const color = isWine ? "#be185d" : "#d97706";
  
  return `<svg class="w-5 h-5 flex-shrink-0 inline-block align-middle" viewBox="0 0 32 32">
    <path d="M10 5h12v7c0 3.3-2.7 6-6 6s-6-2.7-6-6V5z" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.8"/>
    <path d="M10.8 11h10.4v2c0 2.2-1.8 4-4 4s-4-1.8-4-4v-2z" fill="${color}"/>
    <path d="M16 18v8M11 26h10" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

// Reusable Wine Category Product Grid Card Renderer (Light Cream Theme)
// Handles of newly added products that should NOT have the "BEST SELLER" badge or tag
const NON_BEST_SELLER_HANDLES = new Set([
  // Newly Uploaded Gin
  "hendricks-gin-750ml",
  "tanqueray-london-dry-gin-750ml",
  "bombay-sapphire-london-dry-gin-750ml",
  "aperol-aperitivo-liqueur-750ml",
  "absente-absinthe-refined-750ml",
  "aperol-aperitivo-liqueur-375ml",
  "aviation-american-gin-750ml",
  // Newly Uploaded Rum
  "captain-morgan-original-spiced",
  "bacardi-gold-rum-375ml",
  "bacardi-superior-white-rum-50ml",
  "bacardi-gold-rum-200ml",
  "arak-razzouk-750ml",
  "angostura-aromatic-bitters-4oz",
      // Newly Uploaded Tequilas
  "arette-artesanal-suave-blanco-tequila-750ml",
  "arette-reposado-tequila-1l",
  "artenom-seleccion-1579-blanco-tequila-750ml",
  "arette-blanco-tequila-1l",
  "arette-artesanal-suave-reposado-tequila-750ml",
  "100-anos-tequila-reposado-750ml",
  "4-copas-organic-blanco-tequila-750ml",
  "818-tequila-anejo-750ml",
  "818-tequila-blanco-750ml",
  "1800-tequila-blanco-375ml",
  "1800-tequila-reposado-375ml",
  "adictivo-tequila-anejo-750ml",
  "olmeca-altos-tequila-anejo-750ml",
  "olmeca-altos-tequila-plata-750ml",
  "olmeca-altos-tequila-reposado-750ml",
  "asombroso-la-rosa-reposado-tequila-750ml",
  "adictivo-tequila-reposado-750ml",
  "arette-artesanal-suave-anejo-tequila-750ml",
  "alma-del-jaguar-tequila-anejo-750ml",
  "alma-del-jaguar-tequila-blanco-750ml",
  "amatitena-tequila-reposado-750ml",
// Newly Uploaded Vodkas
  "99-brand-apples-liqueur-50ml",
  "99-brand-watermelons-liqueur-50ml",
  "absolut-vodka-swedish-375ml",
  "amarula-cream-marula-fruit-liqueur-750ml",
  "99-brand-whipped-liqueur-50ml",
  "barin-vodka-premium-quality",
  "99-brand-bananas-liqueur-50ml",
  "99-brand-peaches-liqueur-50ml",
  "99-brand-fruit-punch-liqueur-50ml",
  "99-brand-grapes-schnapps-liqueur-50ml",
  "99-brand-strawberries-liqueur-50ml",
  "absolut-vodka-swedish-200ml",
  "absolut-vodka-swedish-175l",
  "360-georgia-peach-flavored-vodka-750ml",
  "absolut-citron-lemon-vodka-750ml",
  "360-bing-cherry-flavored-vodka-750ml",
  "360-vodka-american-vodka-175l",
// Newly Uploaded Whiskeys
  "wild-turkey-american-honey-liqueur-50ml",
  "wild-turkey-american-honey-liqueur-175l",
  "wild-turkey-american-honey-liqueur-375ml",
  "wild-turkey-american-honey-liqueur-750ml",
  "amaro-montenegro-liqueur",
  "baileys-chocolate-irish-cream-750ml",
  "10th-mountain-bourbon-whiskey",
  "baileys-original-irish-cream-750ml",
  "baileys-espresso-creme-750ml",
  "bb-dom-liqueur-benedictine-brandy",
  "baileys-original-irish-cream-175l",
  "ancient-age-bourbon-750ml",
  "angels-envy-triple-oak-bourbon",
  "angels-envy-port-finish-375ml",
  "augusta-buckners-10-year-single-barrel",
  "augusta-old-route-8-year-single-barrel",
  "auchentoshan-american-oak-single-malt",
  "backbone-decade-down-uncut-anniversary",
  "291-barrel-proof-colorado-bourbon",
  "1792-small-batch-bourbon-175l",
  "aberlour-12-year-speyside-single-malt",
  "aberfeldy-12-year-highland-single-malt",
  "ancient-age-bourbon-175l",
  "1792-small-batch-bourbon",
  "1620-small-batch-bourbon",
  "bardstown-origin-toasted-cherry-rye",
  "2xo-american-oak-bourbon",
  "barrell-foundation-bourbon",
  "barrell-dovetail-whiskey",
  "compass-box-artist-blend",
  "barrell-seagrass-rye",
  "widow-jane-baby-jane",
  "bakers-7-year-single-barrel",
  "bardstown-origin-high-wheat",
  "bardstown-origin-bottled-in-bond",
  "balcones-baby-blue-corn-whisky",
  "balblair-15-year-single-malt",
  "balcones-texas-pot-still-bourbon",
  "backbone-bourbon-uncut",
  "hennessy-vs-cognac",
  "bushmills-original-irish-whiskey",
  "chivas-regal-12-year-scotch",
  "basil-hayden-bourbon",
  "michters-us1-small-batch",
  "evan-williams-black-label",
  "angels-envy-port-finish",
  "larceny-small-batch-bourbon",
  "crown-royal-regal-apple",
  "crown-royal-deluxe",
  "jim-beam-white-label-175l",
  "jack-daniels-tennessee-honey",
  "gentleman-jack-tennessee-whiskey",
  "old-forester-100-proof",
  "knob-creek-9-year-bourbon",
  "rittenhouse-rye-bottled-in-bond",
  "glenfiddich-14-bourbon-barrel",
  "monkey-shoulder-scotch",
  // Newly Uploaded Tequilas
  "1800-tequila-blanco",
  "jose-cuervo-especial-silver",
  "hornitos-plata-tequila",
  "cazadores-reposado-tequila",
  // Newly Uploaded Vodkas
  "ciroc-snap-frost-vodka",
  "deep-eddy-vodka",
  "new-amsterdam-original-vodka",
  "high-noon-black-cherry-vodka-soda",
  // Newly Uploaded Wines
  "josh-cellars-chardonnay",
  "bota-box-pinot-grigio-3l",
  "la-marca-prosecco-doc",
  "decoy-red-wine-duckhorn",
  "barefoot-pinot-grigio",
  "cupcake-vineyards-moscato",
  "apothic-red-winemakers-blend",
  "la-crema-sonoma-coast-chardonnay",
  "kim-crawford-sauvignon-blanc",
  // Newly Uploaded Beers
  "heineken-original-lager",
  "victoria-cerveza-12pack",
  "busch-light-30pack",
  "yuengling-traditional-lager-12pack",
  "modelo-negra-especial-12pack",
  "coors-banquet-12pack",
  "smirnoff-ice-neon-lemonade-12pack",
  "truly-hard-seltzer-citrus-12pack",
  "mikes-harder-party-pack-12pack",
  // Ready To Enjoy
  "artigiano-bellini-mango-750ml",
  "artigiano-bellini-peach-750ml",
  "artigiano-bellini-strawberry-750ml",
  "bacardi-island-punch-175l",
  "1800-ultimate-strawberry-margarita-175l",
  "1800-ultimate-blood-orange-margarita-175l",
  "1800-ultimate-pineapple-margarita-175l",
  "bartenders-hot-sex-cocktail-750ml"
]);

function createWineProductCardHTML(p, priceStr, image, ratingBadge, customTags, index = 0) {
  const catKey = (p.category || "WHISKEY").toUpperCase();
  const wineTitlesMap = {
    "domaines-des-etoiles-pinot-noir": "Domaines des Etoiles Pinot Noir<br>2021",
    "chateau-margaux-cabernet-sauvignon": "Château Margaux Cabernet<br>Sauvignon 2016",
    "veuve-clicquot-la-grande-dame": "Veuve Clicquot La Grande Dame",
    "chateau-miraval-rose": "Château Miraval Côtes Rose",
    "domaine-de-la-mer-chardonnay": "Domaine de la Mer Chardonnay",
    "sun-drenched-marble-chardonnay": "Sun-Drenched Marble Chardonnay",
    "mahogany-table-cabernet-2018": "Mahogany Table Cabernet 2018",
    "textured-label-pinot-noir": "Textured Label Pinot Noir",
    "gold-foil-vintage-champagne-2012": "Gold Foil Vintage Champagne 2012",
    "silver-bucket-provence-rose": "Silver Bucket Provence Rose",
    "grand-cru-bordeaux-reserve-2015": "Grand Cru Bordeaux Reserve 2015",
    "tuscan-reserve-sangiovese-2019": "Tuscan Reserve Sangiovese 2019",
    "barossa-valley-shiraz-reserve": "Barossa Valley Shiraz Reserve",
    "mendoza-malbec-gran-reserva": "Mendoza Malbec Gran Reserva",
    "sancerre-blanc-les-monts-2022": "Sancerre Blanc Les Monts 2022",
    "chateau-prestige-pauillac-2018": "Château Prestige Pauillac 2018"
  };

  const wineTagsMap = {
    "domaines-des-etoiles-pinot-noir": ["RED", "WINE", "UNITED STATES", "WILLAMETTE VALLEY"],
    "chateau-margaux-cabernet-sauvignon": ["RED WINE", "(GRAND VIN)", "FRANCE", "BORDEAUX"],
    "veuve-clicquot-la-grande-dame": ["SPARKLING", "CHAMPAGNE", "FRANCE", "CHAMPAGNE"],
    "chateau-miraval-rose": ["ROSE WINE", "WINE", "FRANCE", "PROVENCE"],
    "domaine-de-la-mer-chardonnay": ["WHITE WINE", "RESERVE", "FRANCE", "MEDITERRANEAN"],
    "sun-drenched-marble-chardonnay": ["WHITE WINE", "NAPA VALLEY", "UNITED STATES", "CHARDONNAY"],
    "mahogany-table-cabernet-2018": ["RED WINE", "OAKVILLE", "UNITED STATES", "CABERNET"],
    "textured-label-pinot-noir": ["RED WINE", "BURGUNDY", "FRANCE", "PINOT NOIR"],
    "gold-foil-vintage-champagne-2012": ["PRESTIGE", "CHAMPAGNE", "FRANCE", "VINTAGE"],
    "silver-bucket-provence-rose": ["ROSE WINE", "PRESTIGE", "FRANCE", "PROVENCE"],
    "grand-cru-bordeaux-reserve-2015": ["RED WINE", "BORDEAUX", "FRANCE", "GRAND CRU"],
    "tuscan-reserve-sangiovese-2019": ["RED WINE", "BRUNELLO", "ITALY", "SANGIOVESE"],
    "barossa-valley-shiraz-reserve": ["RED WINE", "BAROSSA VALLEY", "AUSTRALIA", "SHIRAZ"],
    "mendoza-malbec-gran-reserva": ["RED WINE", "UCO VALLEY", "ARGENTINA", "MALBEC"],
    "sancerre-blanc-les-monts-2022": ["WHITE WINE", "LOIRE VALLEY", "FRANCE", "SANCERRE"],
    "chateau-prestige-pauillac-2018": ["RED WINE", "BORDEAUX", "FRANCE", "PAUILLAC"]
  };

  const isExplicitNonBestSeller = p.isBestSeller === false || NON_BEST_SELLER_HANDLES.has(p.handle);
  const isBestSeller = !isExplicitNonBestSeller && catKey !== "GIN" && catKey !== "CIGAR";
  const titleHtml = wineTitlesMap[p.handle] || p.title;
  const rawTags = (customTags || wineTagsMap[p.handle] || [p.category]).filter(t => t !== "BEST SELLER");
  const displayedTags = isBestSeller ? ["BEST SELLER", ...rawTags] : rawTags;

  const isInWishlist = typeof Wishlist !== "undefined" && Wishlist.isInWishlist ? Wishlist.isInWishlist(p.handle) : false;
  const heartActiveCls = isInWishlist ? "is-active" : "";
  const heartFill = isInWishlist ? "currentColor" : "none";
  const heartTitle = isInWishlist ? "Remove from Wishlist" : "Save to Wishlist";

  return `
    <article class="product-grid-card wine-card" data-category="${catKey}" style="--prod-index: ${index};">
      
      <!-- Top Arched Image Container -->
      <div class="product-card-arch wine-card-arch">
        ${isBestSeller ? `
          <span class="product-card-bestseller-badge">
            <svg class="bestseller-badge-star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>BEST SELLER</span>
          </span>
        ` : ""}
        <a href="product.html?handle=${p.handle}" onclick="openProductQuickView('${p.handle}', event)" class="h-full w-full block relative z-10 overflow-hidden" aria-label="${p.title}">
          ${image ? `
            <img
              src="${image.url}"
              alt="${image.altText ?? p.title}"
              class="wine-card-img"
              loading="lazy"
              decoding="async"
              width="240"
              height="360"
            >
          ` : `
            <div class="flex h-full items-center justify-center text-xs text-[#78716c]">
              No image
            </div>
          `}
        </a>

        <!-- Floating Wishlist Heart Button -->
        <button
          type="button"
          data-heart-handle="${p.handle}"
          onclick="handleWishlistToggle('${p.handle}')"
          class="product-card-heart-btn wine-card-heart-btn ${heartActiveCls}"
          title="${heartTitle}"
          aria-label="${heartTitle}"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <!-- Middle Content: Centered Serif Title & Soft Lavender Pill Badges -->
      <div class="flex flex-col items-center text-center relative z-10">
        <a href="product.html?handle=${p.handle}" onclick="openProductQuickView('${p.handle}', event)" class="hover:opacity-80 transition-opacity">
          <h3 class="product-card-title wine-card-title">
            ${titleHtml}
          </h3>
        </a>

        <!-- Soft Lavender Pills -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 mt-1.5 mb-2">
          ${displayedTags.map(tag => `
            <span class="product-card-pill wine-card-pill ${tag === 'BEST SELLER' ? 'pill-bestseller' : ''}">
              ${tag}
            </span>
          `).join("")}
        </div>
      </div>

      <!-- Bottom Bar: MRP Price & Dark Rating Badge Pill -->
      <div class="product-card-footer wine-card-footer">
        ${priceStr ? `
          <div class="flex items-baseline">
            <span class="product-card-mrp-label wine-card-mrp-label">MRP</span>
            <span class="product-card-mrp-price wine-card-mrp-price">
              ${priceStr}
            </span>
          </div>
        ` : `
          <div class="flex items-baseline">
            <span class="product-card-mrp-label wine-card-mrp-label" style="letter-spacing: 0.15em;">AVAILABLE IN STORE</span>
          </div>
        `}

        ${ratingBadge ? `
          <div class="product-card-rating-badge wine-card-rating-badge">
            ${ratingBadge}
          </div>
        ` : ""}
      </div>

    </article>
  `;
}

// Reusable Exact Reference Product Item Row Renderer (Dark Luxury Website Theme)
// Reusable Product Grid Card Renderer (Exact Match to Reference Image)
function createProductCardHTML(product, index = 0) {
  const p = product.node;
  const hasPrice = p.priceRange && p.priceRange.minVariantPrice?.amount && !isNaN(parseFloat(p.priceRange.minVariantPrice.amount)) && parseFloat(p.priceRange.minVariantPrice.amount) > 0;
  const priceStr = hasPrice ? formatMoney(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode) : "";
  const image = p.images.edges[0]?.node;

  // Clean raw strings from emoji characters
  const cleanCountry = (p.country || "").replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|🏴󠁧󠁢󠁳󠁣󠁴󠁿/gu, "").trim();
  const cleanType = (p.type || "").replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu, "").trim();
  
  // Rating badge (e.g. 4.8 VIVINO)
  const ratingBadge = p.badges && p.badges[0] ? `${p.badges[0].score} ${p.badges[0].label}` : (p.hasNoDetails ? "" : "4.8 VIVINO");

  // Build pill tags
  const tags = [];
  if (p.hasNoDetails) {
    tags.push(p.category || "WHISKEY");
  } else {
    if (cleanType) {
      cleanType.split(" ").forEach(t => {
        const clean = t.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (clean && clean.length > 1 && !tags.includes(clean)) tags.push(clean);
      });
    } else {
      tags.push(p.category);
    }

    if (cleanCountry) {
      cleanCountry.replace(/[()]/g, "").split(" ").forEach(c => {
        const clean = c.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (clean && clean.length > 2 && !tags.includes(clean)) tags.push(clean);
      });
    }
  }

  const displayedTags = tags.slice(0, 4);

  // Return wine-styled card for all categories to maintain consistency
  return createWineProductCardHTML(p, priceStr, image, ratingBadge, displayedTags, index);
}

// Page Specific Route Logics
async function handleIndexPage() {
  const productsLoading = document.getElementById("products-loading");
  const productsEmpty = document.getElementById("products-empty");
  const productsGrid = document.getElementById("products-grid");

  try {
    if (productsGrid) {
      const products = await fetchProducts(24);
      if (productsLoading) productsLoading.classList.add("hidden");
      if (products.length === 0) {
        productsEmpty?.classList.remove("hidden");
        return;
      }
    }

    const renderProductList = (productList) => {
      if (!productsGrid) return;
      if (productList.length === 0) {
        productsGrid.classList.add("hidden");
        if (productsEmpty) {
          productsEmpty.classList.remove("hidden");
          const emptyTitle = document.getElementById("products-empty-title");
          const emptyDesc = document.getElementById("products-empty-desc");
          if (activeCategory) {
            if (emptyTitle) emptyTitle.textContent = `No items found in ${activeCategory}`;
            if (emptyDesc) emptyDesc.textContent = `Check back soon for new additions to our ${activeCategory} collection.`;
          } else {
            if (emptyTitle) emptyTitle.textContent = `Select a Category`;
            if (emptyDesc) emptyDesc.textContent = `Click any category button above to view dedicated images and products.`;
          }
        }
        return;
      }
      productsEmpty?.classList.add("hidden");
      productsGrid.classList.remove("hidden");
      
      productsGrid.innerHTML = productList.map((product, idx) => createProductCardHTML(product, idx)).join("");
    };

    // Dynamic Breadcrumb Category Updater & Strict Category Routing
    const breadcrumbCategoryEl = document.getElementById("breadcrumb-current-category");

    const updateBreadcrumb = (categoryLabel) => {
      if (breadcrumbCategoryEl) {
        const formatted = categoryLabel ? (categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1).toLowerCase()) : "Expressions";
        breadcrumbCategoryEl.textContent = formatted;
      }
    };

    const selectCategory = (categoryKey, categoryLabel, updateUrl = false) => {
      // Toggle off if clicking active category tab
      if (updateUrl && activeCategory === categoryKey) {
        activeCategory = null;
        categoryTabs.forEach((t) => t.classList.remove("active-tab"));
        updateBreadcrumb("Expressions");
        history.pushState({}, "", window.location.pathname);
        renderProductList([]);
        return;
      }

      activeCategory = categoryKey;
      categoryTabs.forEach((t) => {
        if (categoryKey && t.getAttribute("data-category") === categoryKey) {
          t.classList.add("active-tab");
        } else {
          t.classList.remove("active-tab");
        }
      });
      categoryCards.forEach((c) => {
        if (categoryKey && c.getAttribute("data-category-card") === categoryKey) {
          c.classList.add("active-card");
        } else {
          c.classList.remove("active-card");
        }
      });

      if (!categoryKey) {
        updateBreadcrumb("Expressions");
        if (updateUrl) history.pushState({}, "", window.location.pathname);
        renderProductList([]);
      } else if (categoryKey === "WHISKEY") {
        updateBreadcrumb(categoryLabel || "Whiskey");
        if (updateUrl) history.pushState({ category: "WHISKEY" }, "", "#whiskey");
        renderProductList(WHISKEY_PRODUCTS);
      } else if (categoryKey === "RUM") {
        updateBreadcrumb(categoryLabel || "Rum");
        if (updateUrl) history.pushState({ category: "RUM" }, "", "#rum");
        renderProductList(RUM_PRODUCTS);
      } else if (categoryKey === "BEER") {
        updateBreadcrumb(categoryLabel || "Beer");
        if (updateUrl) history.pushState({ category: "BEER" }, "", "#beer");
        renderProductList(BEER_PRODUCTS);
      } else if (categoryKey === "WINE") {
        updateBreadcrumb(categoryLabel || "Wine");
        if (updateUrl) history.pushState({ category: "WINE" }, "", "#wine");
        renderProductList(WINE_PRODUCTS);
      } else if (categoryKey === "VODKA") {
        updateBreadcrumb(categoryLabel || "Vodka");
        if (updateUrl) history.pushState({ category: "VODKA" }, "", "#vodka");
        renderProductList(VODKA_PRODUCTS);
      } else if (categoryKey === "GIN") {
        updateBreadcrumb(categoryLabel || "Gin");
        if (updateUrl) history.pushState({ category: "GIN" }, "", "#gin");
        renderProductList(GIN_PRODUCTS);
      } else if (categoryKey === "TEQUILA") {
        updateBreadcrumb(categoryLabel || "Tequila");
        if (updateUrl) history.pushState({ category: "TEQUILA" }, "", "#tequila");
        renderProductList(TEQUILA_PRODUCTS);
      } else if (categoryKey === "READY_TO_ENJOY") {
        updateBreadcrumb(categoryLabel || "Ready to Enjoy");
        if (updateUrl) history.pushState({ category: "READY_TO_ENJOY" }, "", "#ready-to-enjoy");
        renderProductList(READY_TO_ENJOY_PRODUCTS);
      } else if (categoryKey === "CIGAR") {
        updateBreadcrumb(categoryLabel || "Cigar");
        if (updateUrl) history.pushState({ category: "CIGAR" }, "", "#cigar");
        renderProductList(CIGAR_PRODUCTS);
      }

      // Smooth scroll to expressions grid when user clicks a category tab
      if (updateUrl) {
        document.getElementById("expressions")?.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Bind Category Filter Tabs & Chamfer Cards to redirect to category.html
    const categoryTabs = document.querySelectorAll(".category-tab");
    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cat = tab.getAttribute("data-category");
        window.location.href = `category.html?category=${cat}`;
      });
    });

    let activeCategory = "WHISKEY";

    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".whiskey-card-action-btn, .whiskey-card-quick-actions, a, button")) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        const cat = card.getAttribute("data-category-card");
        window.location.href = `category.html?category=${cat}`;
      });
    });
  } catch (error) {
    console.error("Failed to bind category cards:", error);
  }

  // Intercept reservation form submit
  const visitForm = document.getElementById("visit-form");
  if (visitForm) {
    visitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = visitForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        toast.success("Reservation Request Sent", `We've saved ${emailInput.value} for the next cellar session.`);
        emailInput.value = "";
      }
    });
  }
}

// Dedicated Category Page Logic
async function handleCategoryPage() {
  const productsLoading = document.getElementById("products-loading");
  const productsEmpty = document.getElementById("products-empty");
  const productsGrid = document.getElementById("products-grid");
  const heroTitle = document.getElementById("category-hero-title");
  const heroSubtitle = document.getElementById("category-hero-subtitle");
  const breadcrumbCategoryEl = document.getElementById("breadcrumb-current-category");

  const CATEGORY_META = {
    WHISKEY: {
      title: "Whiskey Collection",
      subtitle: "Explore our hand-selected single malts and small-batch reserve bourbons aged in charred oak.",
      products: WHISKEY_PRODUCTS
    },
    RUM: {
      title: "Rum Collection",
      subtitle: "Discover our rare small-batch aged rums with rich caramel, molasses, and oak spice notes.",
      products: RUM_PRODUCTS
    },
    BEER: {
      title: "Craft Beer Collection",
      subtitle: "Taste our artisanal belgian abbey ales, hazy IPAs, and oak barrel aged reserve stouts.",
      products: BEER_PRODUCTS
    },
    VODKA: {
      title: "Ultra-Premium Vodka",
      subtitle: "Savour our triple-distilled, hand-blown decanter and crystal filtered reserve vodkas.",
      products: VODKA_PRODUCTS
    },
    WINE: {
      title: "Fine Wine Collection",
      subtitle: "Experience vintage Cabernet Sauvignon, Pinot Noir, prestige Champagne, and chilled Provence Rose.",
      products: WINE_PRODUCTS
    },
    GIN: {
      title: "Botanical Gin Collection",
      subtitle: "Handcrafted small-batch gin distilled with rare mountain juniper, citrus peel, and wild lavender.",
      products: GIN_PRODUCTS
    },
    TEQUILA: {
      title: "Tequila & Mezcal Collection",
      subtitle: "Handcrafted 100% blue agave highland tequilas and artisanal smoky mezcals aged in charred white oak.",
      products: TEQUILA_PRODUCTS
    },
    READY_TO_ENJOY: {
      title: "Ready to Enjoy",
      subtitle: "Discover a selection of refreshing, ready-to-serve favourites & cocktails.",
      products: READY_TO_ENJOY_PRODUCTS
    },
    CIGAR: {
      title: "Artisanal Cigar Collection",
      subtitle: "Hand-rolled Nicaraguan long-filler cigars presented in engraved solid mahogany humidor boxes.",
      products: []
    }
  };

  let currentCategoryProducts = [];

  const filterAndRenderProducts = (filteredList) => {
    window.activeCategoryProducts = Array.isArray(filteredList) ? filteredList : [];
    if (!productsGrid) return;
    if (productsLoading) productsLoading.classList.add("hidden");

    if (!filteredList || filteredList.length === 0) {
      productsGrid.classList.add("hidden");
      if (productsEmpty) {
        productsEmpty.classList.remove("hidden");
        const emptyTitle = document.getElementById("products-empty-title");
        const emptyDesc = document.getElementById("products-empty-desc");
        if (emptyTitle) emptyTitle.textContent = "No Products Found";
        if (emptyDesc) emptyDesc.textContent = "No items match your selected price filter. Try selecting another filter option.";
      }
      return;
    }

    productsEmpty?.classList.add("hidden");
    productsGrid.classList.remove("hidden");
    productsGrid.innerHTML = filteredList.map((product, idx) => createProductCardHTML(product, idx)).join("");
    if (window.lucide) {
      window.lucide.createIcons({ root: productsGrid });
    }
  };

  const renderCategory = (catKey, updateUrl = false) => {
    const key = (catKey || "WHISKEY").toUpperCase();
    const meta = CATEGORY_META[key] || CATEGORY_META.WHISKEY;

    // Ensure category cards grid (category pile) is hidden on category page
    const categoryCardsGrid = document.getElementById("category-cards-grid");
    if (categoryCardsGrid) {
      categoryCardsGrid.style.display = "none";
    }

    // Update Title, Subtitle, Breadcrumbs, Page Title
    document.title = `${meta.title} — Whiskey Barrel`;
    if (heroTitle) heroTitle.textContent = meta.title;
    if (heroSubtitle) heroSubtitle.textContent = meta.subtitle;
    if (breadcrumbCategoryEl) {
      breadcrumbCategoryEl.textContent = key === "READY_TO_ENJOY" ? "Ready to Enjoy" : key.charAt(0) + key.slice(1).toLowerCase();
    }

    // Toggle Exclusive Category Action Buttons (Maps, Phone, Instagram, WhatsApp) for WHISKEY, RUM, BEER, VODKA, WINE, GIN
    const whiskeyFooterActionsEl = document.getElementById("whiskey-footer-actions");
    const defaultFooterSocialEl = document.getElementById("default-footer-social");
    if (whiskeyFooterActionsEl) {
      if (["WHISKEY", "RUM", "BEER", "VODKA", "WINE", "TEQUILA", "GIN", "READY_TO_ENJOY"].includes(key)) {
        whiskeyFooterActionsEl.classList.remove("hidden");
        whiskeyFooterActionsEl.style.display = "flex";
        if (defaultFooterSocialEl) {
          defaultFooterSocialEl.classList.add("hidden");
          defaultFooterSocialEl.style.display = "none";
        }
        if (window.lucide) {
          window.lucide.createIcons({ root: whiskeyFooterActionsEl });
        }
      } else {
        whiskeyFooterActionsEl.classList.add("hidden");
        whiskeyFooterActionsEl.style.display = "none";
        if (defaultFooterSocialEl) {
          defaultFooterSocialEl.classList.remove("hidden");
          defaultFooterSocialEl.style.display = "flex";
        }
      }
    }




    if (updateUrl) {
      const url = new URL(window.location);
      url.searchParams.set("category", key);
      history.pushState({ category: key }, "", url);
    }

    const filterBeamWrapper = document.querySelector(".cask-filter-beam-wrapper");
    const cigarComingSoonEl = document.getElementById("cigar-coming-soon");

    if (key === "CIGAR") {
      if (filterBeamWrapper) filterBeamWrapper.classList.add("hidden");
      if (productsLoading) productsLoading.classList.add("hidden");
      if (productsGrid) productsGrid.classList.add("hidden");
      if (productsEmpty) productsEmpty.classList.add("hidden");
      if (cigarComingSoonEl) {
        cigarComingSoonEl.classList.remove("hidden");
        const comingSoonDesc = cigarComingSoonEl.querySelector("p");
        if (comingSoonDesc) {
          comingSoonDesc.textContent = "Our curated humidor selection and hand-rolled artisanal cigars are currently in preparation. Please check back soon for the official release.";
        }
      }
      return;
    } else {
      if (filterBeamWrapper) filterBeamWrapper.classList.remove("hidden");
      if (cigarComingSoonEl) cigarComingSoonEl.classList.add("hidden");
    }

    currentCategoryProducts = meta.products || [];
    resetAllFilters();
  };

  // Bind Category Page Filter Bar options
  const staffPickBtn = document.getElementById("filter-staff-pick");
  const newArrivalsBtn = document.getElementById("filter-new-arrivals");
  const onSaleBtn = document.getElementById("filter-on-sale");
  const resetBtn = document.getElementById("filter-reset");
  const priceFilterBtn = document.getElementById("price-filter-btn");
  const priceDropdown = document.getElementById("price-dropdown");
  const priceChevron = document.getElementById("price-chevron");
  const priceFilterLabel = document.getElementById("price-filter-label");
  const priceItems = document.querySelectorAll("#price-dropdown .price-dropdown-item");

  let activeQuickFilter = null; // 'staff-pick' | 'new-arrivals' | 'on-sale' | null
  let activePriceRange = "all";

  const clearQuickFilterPills = () => {
    staffPickBtn?.classList.remove("active-pill", "active");
    newArrivalsBtn?.classList.remove("active-pill", "active");
    onSaleBtn?.classList.remove("active-pill", "active");
  };

  const getProductPrice = (p) => {
    const raw = p?.node?.priceRange?.minVariantPrice?.amount ??
                p?.node?.variants?.edges?.[0]?.node?.price?.amount ??
                p?.node?.price?.amount ??
                p?.priceRange?.minVariantPrice?.amount ??
                p?.price?.amount ??
                p?.price ??
                0;
    if (typeof raw === "number") return raw;
    const cleaned = String(raw).replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  };

  const applyCombinedFilters = () => {
    let filtered = [...currentCategoryProducts];

    // 1. Apply quick filter
    if (activeQuickFilter === "staff-pick") {
      const sp = filtered.filter((p) => p.node?.badges?.some((b) => b.label === "VIVINO" || b.label === "WE" || parseFloat(b.score) >= 90));
      filtered = sp.length ? sp : filtered;
    } else if (activeQuickFilter === "new-arrivals") {
      filtered = [...filtered].reverse();
    } else if (activeQuickFilter === "on-sale") {
      const os = filtered.filter((p) => p.node?.badges?.some((b) => b.label === "AGED" || b.label === "LIMITED" || b.label === "RESERVE"));
      filtered = os.length ? os : filtered;
    }

    // 2. Apply price filter
    if (activePriceRange && activePriceRange !== "all") {
      if (activePriceRange === "under-50") {
        filtered = filtered.filter((p) => getProductPrice(p) < 50);
      } else if (activePriceRange === "50-100") {
        filtered = filtered.filter((p) => {
          const amt = getProductPrice(p);
          return amt >= 50 && amt <= 100;
        });
      } else if (activePriceRange === "100-200") {
        filtered = filtered.filter((p) => {
          const amt = getProductPrice(p);
          return amt >= 100 && amt <= 200;
        });
      } else if (activePriceRange === "200-500") {
        filtered = filtered.filter((p) => {
          const amt = getProductPrice(p);
          return amt >= 200 && amt <= 500;
        });
      } else if (activePriceRange === "above-500") {
        filtered = filtered.filter((p) => getProductPrice(p) > 500);
      }
    }

    filterAndRenderProducts(filtered);
  };

  const resetAllFilters = () => {
    activeQuickFilter = null;
    activePriceRange = "all";
    clearQuickFilterPills();
    if (priceFilterBtn) priceFilterBtn.classList.remove("active-pill", "active");
    if (priceFilterLabel) priceFilterLabel.textContent = "PRICE RANGE";
    if (priceChevron) priceChevron.textContent = "▼";
    if (priceDropdown) priceDropdown.classList.add("hidden");
    priceItems.forEach((item) => {
      if (item.getAttribute("data-price-range") === "all") {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
    applyCombinedFilters();
  };

  const applyPriceRangeFilter = (range, labelText) => {
    activePriceRange = range || "all";

    // Update button text & active button pill state
    if (priceFilterLabel) {
      priceFilterLabel.textContent = !range || range === "all" ? "PRICE RANGE" : (labelText || range.toUpperCase());
    }

    if (priceFilterBtn) {
      if (range && range !== "all") {
        priceFilterBtn.classList.add("active-pill", "active");
      } else {
        priceFilterBtn.classList.remove("active-pill", "active");
      }
    }

    priceItems.forEach((item) => {
      const itemRange = item.getAttribute("data-price-range");
      if (itemRange === activePriceRange) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    applyCombinedFilters();
  };

  priceItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const range = item.getAttribute("data-price-range");
      const labelText = item.textContent.trim();
      priceDropdown?.classList.add("hidden");
      if (priceChevron) priceChevron.textContent = "▼";
      applyPriceRangeFilter(range, labelText);
    });
  });

  if (staffPickBtn) {
    staffPickBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (activeQuickFilter === "staff-pick") {
        activeQuickFilter = null;
        staffPickBtn.classList.remove("active-pill", "active");
      } else {
        clearQuickFilterPills();
        activeQuickFilter = "staff-pick";
        staffPickBtn.classList.add("active-pill", "active");
      }
      applyCombinedFilters();
    });
  }

  if (newArrivalsBtn) {
    newArrivalsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (activeQuickFilter === "new-arrivals") {
        activeQuickFilter = null;
        newArrivalsBtn.classList.remove("active-pill", "active");
      } else {
        clearQuickFilterPills();
        activeQuickFilter = "new-arrivals";
        newArrivalsBtn.classList.add("active-pill", "active");
      }
      applyCombinedFilters();
    });
  }

  if (onSaleBtn) {
    onSaleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (activeQuickFilter === "on-sale") {
        activeQuickFilter = null;
        onSaleBtn.classList.remove("active-pill", "active");
      } else {
        clearQuickFilterPills();
        activeQuickFilter = "on-sale";
        onSaleBtn.classList.add("active-pill", "active");
      }
      applyCombinedFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetAllFilters();
    });
  }

  // Get initial category from query parameter or hash
  const getInitialCategory = () => {
    const params = new URLSearchParams(window.location.search);
    let cat = params.get("category");
    if (!cat) {
      cat = window.location.hash.replace("#", "");
    }
    return cat ? cat.toUpperCase() : "WHISKEY";
  };

  const applyInitialFiltersFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const initialPrice = params.get("price");
    const initialFilter = params.get("filter");

    if (initialPrice) {
      const matchingItem = Array.from(priceItems).find((i) => i.getAttribute("data-price-range") === initialPrice);
      const label = matchingItem ? matchingItem.textContent.trim() : (initialPrice === "all" ? "ALL PRICES" : initialPrice.toUpperCase());
      applyPriceRangeFilter(initialPrice, label);
    } else if (initialFilter === "staff-pick") {
      staffPickBtn?.click();
    } else if (initialFilter === "new-arrivals") {
      newArrivalsBtn?.click();
    } else if (initialFilter === "on-sale") {
      onSaleBtn?.click();
    }
  };

  renderCategory(getInitialCategory(), false);
  applyInitialFiltersFromUrl();

  window.addEventListener("popstate", () => {
    renderCategory(getInitialCategory(), false);
    applyInitialFiltersFromUrl();
  });
}

async function handleProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const handle = urlParams.get("handle");

  const productLoading = document.getElementById("product-loading");
  const productNotFound = document.getElementById("product-not-found");
  const productDetails = document.getElementById("product-details");

  if (!handle) {
    if (productLoading) productLoading.classList.add("hidden");
    productNotFound?.classList.remove("hidden");
    return;
  }

  try {
    const product = await fetchProductByHandle(handle);
    if (productLoading) productLoading.classList.add("hidden");

    if (!product || !product.node) {
      productNotFound?.classList.remove("hidden");
      return;
    }

    const p = product.node;
    productDetails?.classList.remove("hidden");

    // Dynamic Back Button according to product category
    const backLink = document.getElementById("product-back-link");
    const backText = document.getElementById("product-back-text");
    if (backLink && p.category) {
      backLink.href = `category.html?category=${encodeURIComponent(p.category)}`;
      if (backText) {
        const catName = p.category === "READY_TO_ENJOY" ? "Ready to Enjoy" : p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase();
        backText.textContent = `Back to ${catName} Collection`;
      }
    }

    // Renders the details DOM elements
    document.title = `${p.title} — Whiskey Barrel`;
    
    // Set dynamic meta tags (title / description)
    document.querySelector('meta[name="description"]')?.setAttribute("content", `Buy ${p.title} from Whiskey Barrel, small-batch single malt aged in charred American oak.`);

    const catKey = (p.category || "").toUpperCase();
    const isExplicitNonBestSeller = p.isBestSeller === false || NON_BEST_SELLER_HANDLES.has(p.handle);
    const isBestSeller = !isExplicitNonBestSeller && catKey !== "GIN" && catKey !== "CIGAR";

    const imgContainer = document.getElementById("product-image-container");
    const image = p.images.edges[0]?.node;
    if (imgContainer) {
      if (image) {
        imgContainer.innerHTML = `
          ${isBestSeller ? `
            <span class="product-detail-bestseller-badge">
              <svg class="bestseller-badge-star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>BEST SELLER</span>
            </span>
          ` : ""}
          <img
            src="${image.url}"
            alt="${image.altText ?? p.title}"
            class="h-[560px] w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
            decoding="async"
            fetchpriority="high"
          >
        `;
      } else {
        imgContainer.innerHTML = `<div class="flex h-[560px] items-center justify-center text-muted-foreground">No image</div>`;
      }
    }

    const titleEl = document.getElementById("product-title");
    if (titleEl) titleEl.textContent = p.title;

    const badgesContainer = document.getElementById("product-badges-container");
    if (badgesContainer) {
      let badgesHtml = "";
      if (isBestSeller) {
        badgesHtml += `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider rounded border border-ember text-ember bg-ember/15 shadow-[0_0_12px_rgba(212,168,106,0.25)]">
            <svg class="w-3 h-3 text-ember fill-current" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>BEST SELLER</span>
          </span>
        `;
      }
      if (p.badges) {
        badgesHtml += p.badges.map(b => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider rounded border border-ember/50 text-ember bg-ember/10">
            <span class="text-[#a1a1aa] font-medium">${b.label}</span>
            <span class="font-bold text-[#ffffff]">${b.score}</span>
          </span>
        `).join("");
      }
      badgesContainer.innerHTML = badgesHtml;
    }

    const countryEl = document.getElementById("product-country");
    if (countryEl && p.country) countryEl.textContent = p.country;

    const compositionEl = document.getElementById("product-composition");
    if (compositionEl && p.composition) compositionEl.textContent = p.composition;

    const typeEl = document.getElementById("product-type");
    if (typeEl && p.type) typeEl.textContent = p.type;

    const descriptionEl = document.getElementById("product-description");
    if (descriptionEl) descriptionEl.textContent = p.description || "Available in store at Whiskey Barrel. Visit us at 12205 Shawnee Mission Parkway for availability and details.";

    const priceEl = document.getElementById("product-price");
    const optionsContainer = document.getElementById("product-variants-container");
    const optionsButtons = document.getElementById("product-variants-buttons");

    let activeVariantIndex = 0;

    const updateSelectedVariantUI = () => {
      const variant = p.variants.edges[activeVariantIndex]?.node;
      
      // Update Price
      if (priceEl) {
        if (variant && variant.price?.amount && parseFloat(variant.price.amount) > 0) {
          priceEl.textContent = formatMoney(variant.price.amount, variant.price.currencyCode);
        } else if (p.priceRange && p.priceRange.minVariantPrice?.amount && parseFloat(p.priceRange.minVariantPrice.amount) > 0) {
          priceEl.textContent = formatMoney(
            p.priceRange.minVariantPrice.amount,
            p.priceRange.minVariantPrice.currencyCode
          );
        } else {
          priceEl.textContent = "Available in Store";
        }
      }

      // Update buttons selected classes
      if (optionsButtons) {
        const buttons = optionsButtons.querySelectorAll("button");
        buttons.forEach((btn, idx) => {
          if (idx === activeVariantIndex) {
            btn.className = "rounded-sm border px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-all duration-500 border-ember text-ember";
          } else {
            btn.className = "rounded-sm border px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-all duration-500 border-border text-muted-foreground hover:border-ember/60";
          }
        });
      }
    };

    // Render option buttons if multiple variants exist
    if (p.variants.edges.length > 1) {
      optionsContainer?.classList.remove("hidden");
      if (optionsButtons) {
        optionsButtons.innerHTML = p.variants.edges.map((v, i) => {
          return `
            <button type="button" data-index="${i}">
              ${v.node.title}
            </button>
          `;
        }).join("");

        // Bind clicks on option buttons
        optionsButtons.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            activeVariantIndex = parseInt(btn.getAttribute("data-index"));
            updateSelectedVariantUI();
          });
        });
      }
    }

    // Set initial display
    updateSelectedVariantUI();

    // Product page wishlist button integration
    const prodWishlistBtn = document.getElementById("product-wishlist-btn");
    const prodWishlistText = document.getElementById("product-wishlist-btn-text");
    if (prodWishlistBtn) {
      const updateProdWishlistUI = () => {
        const inWishlist = Wishlist.isInWishlist(p.handle);
        if (inWishlist) {
          prodWishlistBtn.classList.add("bg-ember", "text-[#14100c]");
          prodWishlistBtn.classList.remove("bg-ember/10", "text-ember");
          const svg = prodWishlistBtn.querySelector("svg");
          if (svg) svg.setAttribute("fill", "currentColor");
          if (prodWishlistText) prodWishlistText.textContent = "In Wishlist";
        } else {
          prodWishlistBtn.classList.remove("bg-ember", "text-[#14100c]");
          prodWishlistBtn.classList.add("bg-ember/10", "text-ember");
          const svg = prodWishlistBtn.querySelector("svg");
          if (svg) svg.setAttribute("fill", "none");
          if (prodWishlistText) prodWishlistText.textContent = "Add to Wishlist";
        }
      };

      updateProdWishlistUI();

      prodWishlistBtn.addEventListener("click", () => {
        const selectedVariant = p.variants.edges[activeVariantIndex]?.node;
        Wishlist.toggleItem(p.handle, selectedVariant?.id);
        updateProdWishlistUI();
      });
    }

    // Trigger reveal animations on details load
    initRevealAnimations();
  } catch (error) {
    console.error("Failed to load product page details:", error);
    if (productLoading) productLoading.classList.add("hidden");
    productNotFound?.classList.remove("hidden");
  }
}

// About section expand/collapse toggle
function initAboutToggle() {
  const toggleBtn = document.getElementById("about-toggle-btn");
  const expandedContent = document.getElementById("about-expanded-content");
  
  if (toggleBtn && expandedContent) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = expandedContent.classList.contains("hidden");
      if (isHidden) {
        expandedContent.classList.remove("hidden");
        toggleBtn.textContent = "Read Less";
      } else {
        expandedContent.classList.add("hidden");
        toggleBtn.textContent = "Read More";
      }
    });
  }
}

// Price Range filter dropdown toggle
function initPriceFilterDropdown() {
  const priceFilterBtn = document.getElementById("price-filter-btn");
  const priceDropdown = document.getElementById("price-dropdown");
  const priceChevron = document.getElementById("price-chevron");

  if (priceFilterBtn && priceDropdown) {
    if (priceFilterBtn.dataset.boundDropdown === "true") return;
    priceFilterBtn.dataset.boundDropdown = "true";

    priceFilterBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = priceDropdown.classList.contains("hidden");
      if (isHidden) {
        priceDropdown.classList.remove("hidden");
        if (priceChevron) {
          priceChevron.textContent = "▲";
        }
      } else {
        priceDropdown.classList.add("hidden");
        if (priceChevron) {
          priceChevron.textContent = "▼";
        }
      }
    });

    // Close the dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!priceDropdown.classList.contains("hidden") && !priceDropdown.contains(e.target) && !priceFilterBtn.contains(e.target)) {
        priceDropdown.classList.add("hidden");
        if (priceChevron) {
          priceChevron.textContent = "▼";
        }
      }
    });
  }
}

// Binds redirect logic to filter bar options on index/home page
function initFilterRedirections() {
  const isCategoryPage = window.location.pathname.includes("category.html") || window.location.pathname.includes("/category");
  if (isCategoryPage) return; // category page manages its own interactive category products filtering

  const staffPickBtn = document.getElementById("filter-staff-pick");
  const newArrivalsBtn = document.getElementById("filter-new-arrivals");
  const onSaleBtn = document.getElementById("filter-on-sale");
  const dropdownItems = document.querySelectorAll(".price-dropdown-item");

  if (staffPickBtn) {
    staffPickBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "category.html?filter=staff-pick";
    });
  }

  if (newArrivalsBtn) {
    newArrivalsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "category.html?filter=new-arrivals";
    });
  }

  if (onSaleBtn) {
    onSaleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "category.html?filter=on-sale";
    });
  }

  dropdownItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const range = item.getAttribute("data-price-range") || "all";
      window.location.href = `category.html?price=${range}`;
    });
  });
}

// Ultra-Fast Scroll Reveal Animations with Generous Margin (350px) for Zero Perceived Lag
function initRevealAnimations() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!revealElements.length) return;

  const isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isReduced) {
    revealElements.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add("is-revealed");
        obs.unobserve(el);
      }
    });
  }, {
    rootMargin: "350px 0px 350px 0px",
    threshold: 0.01
  });

  const winHeight = window.innerHeight || 800;
  revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= winHeight + 350) {
      el.classList.add("is-revealed");
    } else {
      observer.observe(el);
    }
  });

  document.documentElement.classList.add("reveal-init");
}

// Mobile Menu Drawer Handler for Instant Tactile Navigation
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const drawer = document.getElementById("mobile-menu-drawer");
  if (!toggleBtn || !drawer) return;

  const openIcon = toggleBtn.querySelector(".menu-open-icon");
  const closeIcon = toggleBtn.querySelector(".menu-close-icon");

  const toggle = (force) => {
    const shouldOpen = typeof force === "boolean" ? force : !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", shouldOpen);
    toggleBtn.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    if (openIcon && closeIcon) {
      openIcon.classList.toggle("hidden", shouldOpen);
      closeIcon.classList.toggle("hidden", !shouldOpen);
    }
  };

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  // Close when clicking internal navigation links in drawer
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle(false);
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (drawer.classList.contains("is-open") && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggle(false);
    }
  });
}

// Instant Page Prefetcher for Blazing Fast Page-to-Page Navigation
function initInstantPagePrefetch() {
  const prefetchedUrls = new Set();
  const prefetchUrl = (url) => {
    if (!url || prefetchedUrls.has(url)) return;
    // Don't prefetch external links, anchors, tel/mailto
    if (url.startsWith("http") || url.startsWith("#") || url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("javascript:")) return;
    
    prefetchedUrls.add(url);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.as = "document";
    document.head.appendChild(link);
  };

  // Prefetch on hover or touchstart
  document.addEventListener("pointerover", (e) => {
    const anchor = e.target.closest("a");
    if (anchor && anchor.getAttribute("href")) {
      prefetchUrl(anchor.getAttribute("href"));
    }
  }, { passive: true });

  document.addEventListener("touchstart", (e) => {
    const anchor = e.target.closest("a");
    if (anchor && anchor.getAttribute("href")) {
      prefetchUrl(anchor.getAttribute("href"));
    }
  }, { passive: true });
}

// Hero Section Entrance & Ultra-Smooth Atmospheric Parallax Transitions
function initHeroTransitions() {
  const heroSection = document.getElementById("top");
  if (!heroSection || !heroSection.classList.contains("hero-section")) return;

  // 1. Trigger hero entrance transition immediately
  const triggerEntrance = () => {
    requestAnimationFrame(() => {
      heroSection.classList.add("hero-loaded");
    });
  };

  triggerEntrance();

  const heroBgWrapper = heroSection.querySelector(".hero-bg-wrapper");
  const heroTextBlock = heroSection.querySelector(".hero-text-block");
  const isReducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  // Cache dimensions to completely prevent forced reflow / layout thrashing
  let cachedHeroHeight = heroSection.offsetHeight || window.innerHeight;
  let cachedHeroLeft = 0;
  let cachedHeroTop = 0;
  let cachedHeroWidth = window.innerWidth;

  const updateHeroDimensions = () => {
    const rect = heroSection.getBoundingClientRect();
    cachedHeroHeight = heroSection.offsetHeight || window.innerHeight;
    cachedHeroLeft = rect.left + window.scrollX;
    cachedHeroTop = rect.top + window.scrollY;
    cachedHeroWidth = rect.width || window.innerWidth;
  };

  window.addEventListener("resize", updateHeroDimensions, { passive: true });
  updateHeroDimensions();

  // 2. Event-Driven Mouse Spotlight & 3D Depth (Only on Desktop with Fine Pointer)
  if (isFinePointer) {
    let mouseTargetX = window.innerWidth * 0.5;
    let mouseTargetY = window.innerHeight * 0.38;
    let currentMouseX = mouseTargetX;
    let currentMouseY = mouseTargetY;
    let isMouseInside = false;
    let isHeroVisible = true;
    let rafId = null;

    function updateHeroPhysics() {
      if (!isHeroVisible || isReducedMotion()) {
        rafId = null;
        return;
      }

      const dx = mouseTargetX - currentMouseX;
      const dy = mouseTargetY - currentMouseY;

      currentMouseX += dx * 0.14;
      currentMouseY += dy * 0.14;

      heroSection.style.setProperty("--hero-mouse-x", `${currentMouseX.toFixed(1)}px`);
      heroSection.style.setProperty("--hero-mouse-y", `${currentMouseY.toFixed(1)}px`);

      if (heroTextBlock && window.innerWidth >= 768) {
        const normX = ((currentMouseX) / cachedHeroWidth - 0.5) * 2;
        const normY = ((currentMouseY) / cachedHeroHeight - 0.5) * 2;
        if (isMouseInside && window.scrollY === 0) {
          heroTextBlock.style.transform = `translate3d(${(normX * -5).toFixed(2)}px, ${(normY * -3.5).toFixed(2)}px, 0)`;
        }
      }

      // Auto-sleep rAF loop when idle
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4 || isMouseInside) {
        rafId = requestAnimationFrame(updateHeroPhysics);
      } else {
        rafId = null;
      }
    }

    function startHeroPhysics() {
      if (!rafId && isHeroVisible) {
        rafId = requestAnimationFrame(updateHeroPhysics);
      }
    }

    heroSection.addEventListener("mouseenter", () => {
      isMouseInside = true;
      startHeroPhysics();
    }, { passive: true });

    heroSection.addEventListener("mousemove", (e) => {
      mouseTargetX = e.clientX;
      mouseTargetY = e.clientY;
      isMouseInside = true;
      startHeroPhysics();
    }, { passive: true });

    heroSection.addEventListener("mouseleave", () => {
      isMouseInside = false;
      mouseTargetX = cachedHeroWidth * 0.5;
      mouseTargetY = cachedHeroHeight * 0.38;
      if (heroTextBlock) {
        heroTextBlock.style.transform = "translate3d(0, 0, 0)";
      }
      startHeroPhysics();
    }, { passive: true });

    // Pause physics when hero is scrolled out of viewport
    const heroVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isHeroVisible = entry.isIntersecting;
        if (isHeroVisible && isMouseInside) {
          startHeroPhysics();
        } else if (!isHeroVisible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      });
    }, { threshold: 0.05 });

    heroVisibilityObserver.observe(heroSection);
  }

  // 3. Scroll-driven Depth Parallax with Zero Layout Thrashing
  let scrollTicking = false;
  let isHeroVisible = true;

  const heroScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { isHeroVisible = entry.isIntersecting; });
  }, { threshold: 0 });
  heroScrollObserver.observe(heroSection);

  window.addEventListener("scroll", () => {
    if (!scrollTicking && isHeroVisible && !isReducedMotion()) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY <= cachedHeroHeight + 80) {
          const ratio = Math.min(1, scrollY / cachedHeroHeight);
          if (heroBgWrapper) {
            heroBgWrapper.style.transform = `translate3d(0, ${(scrollY * 0.28).toFixed(1)}px, 0)`;
          }
          if (heroTextBlock && scrollY > 0) {
            heroTextBlock.style.opacity = Math.max(0, 1 - ratio * 1.35).toFixed(3);
            heroTextBlock.style.transform = `translate3d(0, ${(scrollY * 0.2).toFixed(1)}px, 0)`;
          } else if (heroTextBlock && scrollY === 0) {
            heroTextBlock.style.opacity = "1";
            heroTextBlock.style.transform = "translate3d(0, 0, 0)";
          }
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}

// Collection Section Entrance & High-Performance Interactive Handlers
function initCollectionTransitions() {
  const collectionSection = document.getElementById("expressions");
  if (!collectionSection) return;

  const categoryCardsGrid = document.getElementById("category-cards-grid");
  const categoryCards = collectionSection.querySelectorAll(".category-card");
  const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  // 1. Intersection Observer for Section Header Entrance
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        collectionSection.classList.add("collection-in-view");
        headerObserver.unobserve(collectionSection);
      }
    });
  }, { threshold: 0.08, rootMargin: "50px" });

  headerObserver.observe(collectionSection);

  // 2. Staggered Sequential Entrance for Category Cards
  if (categoryCards.length > 0) {
    const isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReduced) {
      categoryCards.forEach((card) => {
        card.classList.add("card-in-view", "reveal-completed");
      });
    } else {
      let triggered = false;
      const triggerCascade = () => {
        if (triggered) return;
        triggered = true;

        categoryCards.forEach((card) => {
          card.classList.add("card-in-view");
        });

        const totalDuration = (categoryCards.length * 80) + 400;
        setTimeout(() => {
          categoryCards.forEach((card) => {
            card.classList.add("reveal-completed");
          });
        }, totalDuration);
      };

      const targetElement = categoryCardsGrid || collectionSection;
      const cascadeObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerCascade();
            obs.disconnect();
          }
        });
      }, {
        rootMargin: "60px 0px -4% 0px",
        threshold: 0.05
      });

      cascadeObserver.observe(targetElement);

      const isCollectionHash = window.location.hash === "#expressions" || window.location.hash === "#collection";
      if (isCollectionHash) {
        setTimeout(triggerCascade, 30);
      }
    }
  }

  // 3. Subtle Spotlight Tracking for Bento Cards (Only fine pointers)
  if (isFinePointer) {
    const featuredCards = collectionSection.querySelectorAll(".home-card-featured, .home-card-half");
    featuredCards.forEach((card) => {
      let cardRaf = null;
      let cardRect = null;

      card.addEventListener("mouseenter", () => {
        cardRect = card.getBoundingClientRect();
      }, { passive: true });

      card.addEventListener("mousemove", (e) => {
        if (cardRaf) return;
        cardRaf = requestAnimationFrame(() => {
          if (!cardRect) cardRect = card.getBoundingClientRect();
          const x = ((e.clientX - cardRect.left) / cardRect.width) * 100;
          const y = ((e.clientY - cardRect.top) / cardRect.height) * 100;
          card.style.setProperty("--card-mouse-x", `${x.toFixed(1)}%`);
          card.style.setProperty("--card-mouse-y", `${y.toFixed(1)}%`);
          cardRaf = null;
        });
      }, { passive: true });

      card.addEventListener("mouseleave", () => {
        if (cardRaf) { cancelAnimationFrame(cardRaf); cardRaf = null; }
        cardRect = null;
        card.style.setProperty("--card-mouse-x", "50%");
        card.style.setProperty("--card-mouse-y", "50%");
      }, { passive: true });
    });
  }
}

// Visit Section Smooth Hero-Grade Transitions & Atmospheric Depth
function initVisitTransitions() {
  const visitSection = document.getElementById("visit") || document.querySelector(".visit-section");
  if (!visitSection) return;

  const isReducedMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  const banner = visitSection.querySelector(".visit-showcase-banner");
  const bannerBgWrapper = visitSection.querySelector(".visit-banner-bg-wrapper");
  const bannerContent = visitSection.querySelector(".visit-banner-content");
  const isVisitPage = window.location.pathname.includes("visit.html") || window.location.pathname.includes("/visit") || window.location.hash === "#visit";

  // 1. Entrance Activation
  const triggerVisitEntrance = () => {
    requestAnimationFrame(() => {
      visitSection.classList.add("visit-loaded", "visit-in-view");
    });
  };

  if (isVisitPage) {
    triggerVisitEntrance();
  } else {
    const visitObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerVisitEntrance();
          observer.unobserve(visitSection);
        }
      });
    }, { threshold: 0.05, rootMargin: "180px 0px 0px 0px" });

    visitObserver.observe(visitSection);
  }

  // 2. High-Performance Event-Driven Mouse Spotlight & 3D Depth on Showcase Banner
  if (banner && isFinePointer) {
    let bannerRect = null;
    let mouseTargetX = 500;
    let mouseTargetY = 250;
    let currentMouseX = mouseTargetX;
    let currentMouseY = mouseTargetY;
    let isMouseInside = false;
    let isVisitVisible = true;
    let visitRafId = null;

    const updateBannerDimensions = () => {
      bannerRect = banner.getBoundingClientRect();
      if (!isMouseInside) {
        mouseTargetX = bannerRect.width * 0.5;
        mouseTargetY = bannerRect.height * 0.45;
      }
    };
    window.addEventListener("resize", updateBannerDimensions, { passive: true });
    updateBannerDimensions();

    function updateVisitPhysics() {
      if (!isVisitVisible || isReducedMotion()) {
        visitRafId = null;
        return;
      }

      const dx = mouseTargetX - currentMouseX;
      const dy = mouseTargetY - currentMouseY;

      currentMouseX += dx * 0.14;
      currentMouseY += dy * 0.14;

      banner.style.setProperty("--visit-mouse-x", `${currentMouseX.toFixed(1)}px`);
      banner.style.setProperty("--visit-mouse-y", `${currentMouseY.toFixed(1)}px`);

      if (bannerContent && window.innerWidth >= 768 && bannerRect) {
        const normX = ((currentMouseX) / bannerRect.width - 0.5) * 2;
        const normY = ((currentMouseY) / bannerRect.height - 0.5) * 2;
        if (isMouseInside) {
          bannerContent.style.transform = `translate3d(${(normX * -5).toFixed(2)}px, ${(normY * -3.5).toFixed(2)}px, 0)`;
        }
      }

      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4 || isMouseInside) {
        visitRafId = requestAnimationFrame(updateVisitPhysics);
      } else {
        visitRafId = null;
      }
    }

    function startVisitPhysics() {
      if (!visitRafId && isVisitVisible) {
        visitRafId = requestAnimationFrame(updateVisitPhysics);
      }
    }

    banner.addEventListener("mouseenter", () => {
      updateBannerDimensions();
      isMouseInside = true;
      startVisitPhysics();
    }, { passive: true });

    banner.addEventListener("mousemove", (e) => {
      if (!bannerRect) updateBannerDimensions();
      mouseTargetX = e.clientX - bannerRect.left;
      mouseTargetY = e.clientY - bannerRect.top;
      isMouseInside = true;
      startVisitPhysics();
    }, { passive: true });

    banner.addEventListener("mouseleave", () => {
      isMouseInside = false;
      if (bannerRect) {
        mouseTargetX = bannerRect.width * 0.5;
        mouseTargetY = bannerRect.height * 0.45;
      }
      if (bannerContent) {
        bannerContent.style.transform = "translate3d(0, 0, 0)";
      }
      startVisitPhysics();
    }, { passive: true });

    const visitVisibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisitVisible = entry.isIntersecting;
        if (isVisitVisible && isMouseInside) {
          startVisitPhysics();
        } else if (!isVisitVisible && visitRafId) {
          cancelAnimationFrame(visitRafId);
          visitRafId = null;
        }
      });
    }, { threshold: 0.05 });

    visitVisibilityObserver.observe(visitSection);
  }

  // 3. Subtle Spotlight Tracking on Info Cards with Cached Rects
  if (isFinePointer) {
    const infoCols = visitSection.querySelectorAll(".visit-info-col");
    infoCols.forEach((col) => {
      let colRaf = null;
      let colRect = null;

      col.addEventListener("mouseenter", () => {
        colRect = col.getBoundingClientRect();
      }, { passive: true });

      col.addEventListener("mousemove", (e) => {
        if (colRaf) return;
        colRaf = requestAnimationFrame(() => {
          if (!colRect) colRect = col.getBoundingClientRect();
          const x = ((e.clientX - colRect.left) / colRect.width) * 100;
          const y = ((e.clientY - colRect.top) / colRect.height) * 100;
          col.style.setProperty("--card-mouse-x", `${x.toFixed(1)}%`);
          col.style.setProperty("--card-mouse-y", `${y.toFixed(1)}%`);
          colRaf = null;
        });
      }, { passive: true });

      col.addEventListener("mouseleave", () => {
        if (colRaf) { cancelAnimationFrame(colRaf); colRaf = null; }
        colRect = null;
        col.style.setProperty("--card-mouse-x", "50%");
        col.style.setProperty("--card-mouse-y", "50%");
      }, { passive: true });
    });

    const mapCard = visitSection.querySelector(".visit-map-card");
    if (mapCard) {
      let mapRaf = null;
      let mapRect = null;

      mapCard.addEventListener("mouseenter", () => {
        mapRect = mapCard.getBoundingClientRect();
      }, { passive: true });

      mapCard.addEventListener("mousemove", (e) => {
        if (mapRaf) return;
        mapRaf = requestAnimationFrame(() => {
          if (!mapRect) mapRect = mapCard.getBoundingClientRect();
          const x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
          const y = ((e.clientY - mapRect.top) / mapRect.height) * 100;
          mapCard.style.setProperty("--map-mouse-x", `${x.toFixed(1)}%`);
          mapCard.style.setProperty("--map-mouse-y", `${y.toFixed(1)}%`);
          mapRaf = null;
        });
      }, { passive: true });

      mapCard.addEventListener("mouseleave", () => {
        if (mapRaf) { cancelAnimationFrame(mapRaf); mapRaf = null; }
        mapRect = null;
        mapCard.style.setProperty("--map-mouse-x", "50%");
        mapCard.style.setProperty("--map-mouse-y", "50%");
      }, { passive: true });
    }
  }
}

// High-Performance Smooth Anchor Navigation
// Preserves silky smooth in-page transitions when clicking buttons or nav links,
// while allowing native wheel, trackpad, and touch scrolling to run at 100% full unconstrained speed.
function initSmoothAnchorNavigation() {
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href === "#" || href === "#!") return;

    const targetEl = document.querySelector(href);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      if (history.pushState) {
        history.pushState(null, "", href);
      }
    }
  });
}

/**
 * Mandatory 21+ Age Verification Gate
 */
const IS_EXPERIENCE_PAGE = typeof window !== 'undefined' && window.location.pathname.includes('experience');
const AGE_GATE_STORAGE_KEY = IS_EXPERIENCE_PAGE ? 'wb_experience_age_verified' : 'wb_age_verified_v2';
const AGE_GATE_DATE_KEY = IS_EXPERIENCE_PAGE ? 'wb_experience_age_date' : 'wb_age_verified_date_v2';
const AGE_GATE_DENIED_KEY = IS_EXPERIENCE_PAGE ? 'wb_experience_age_denied' : 'wb_age_denied';
const AGE_GATE_EXPIRY_DAYS = 30;

function isAgeVerified() {
  try {
    const search = window.location.search || '';
    if (search.includes('verify=') || search.includes('agegate=') || search.includes('test_age=')) {
      return false;
    }
    if (sessionStorage.getItem(AGE_GATE_STORAGE_KEY) === 'true') {
      return true;
    }
    const verified = localStorage.getItem(AGE_GATE_STORAGE_KEY) === 'true';
    if (!verified) return false;

    const verifiedDate = parseInt(localStorage.getItem(AGE_GATE_DATE_KEY) || '0', 10);
    if (!verifiedDate) return true;

    const daysElapsed = (Date.now() - verifiedDate) / (1000 * 60 * 60 * 24);
    if (daysElapsed > AGE_GATE_EXPIRY_DAYS) {
      localStorage.removeItem(AGE_GATE_STORAGE_KEY);
      localStorage.removeItem(AGE_GATE_DATE_KEY);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function isAgeDenied() {
  try {
    return sessionStorage.getItem(AGE_GATE_DENIED_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

function initAgeGate() {
  const modal = document.getElementById('ageGateModal');
  if (!modal) return;

  const viewQuestion = document.getElementById('ageGateViewQuestion');
  const viewDob = document.getElementById('ageGateViewDob');
  const viewDenied = document.getElementById('ageGateViewDenied');

  const btnYes = document.getElementById('btnAgeYes');
  const btnNo = document.getElementById('btnAgeNo');
  const btnBack = document.getElementById('btnAgeBackToQuestion');
  const dobForm = document.getElementById('ageGateDobForm');

  const monthInput = document.getElementById('ageGateMonth');
  const dayInput = document.getElementById('ageGateDay');
  const yearInput = document.getElementById('ageGateYear');
  const errorBox = document.getElementById('ageGateError');
  const rememberCheckbox = document.getElementById('ageGateRemember');
  const submitBtn = document.getElementById('btnAgeVerifySubmit');

  function switchView(targetView) {
    [viewQuestion, viewDob, viewDenied].forEach((v) => {
      if (v) v.classList.remove('active');
    });
    if (targetView) {
      targetView.classList.add('active');
      const title = targetView.querySelector('.age-gate-title');
      if (title && title.id) {
        modal.setAttribute('aria-labelledby', title.id);
      }
    }
  }

  function showError(msg) {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.classList.add('show');
  }

  function clearError() {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.classList.remove('show');
    [monthInput, dayInput, yearInput].forEach((inp) => {
      if (inp) inp.classList.remove('input-error');
    });
  }

  function grantAgeAccess() {
    try {
      if (!rememberCheckbox || rememberCheckbox.checked) {
        localStorage.setItem(AGE_GATE_STORAGE_KEY, 'true');
        localStorage.setItem(AGE_GATE_DATE_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(AGE_GATE_STORAGE_KEY);
        localStorage.removeItem(AGE_GATE_DATE_KEY);
      }
      sessionStorage.setItem(AGE_GATE_STORAGE_KEY, 'true');
      sessionStorage.removeItem(AGE_GATE_DENIED_KEY);
    } catch (err) {}

    document.documentElement.classList.add('wb-age-verified');
    document.body.classList.remove('age-gate-locked');
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowY = '';

    // Notify any embedded experience landing iframe
    const expFrame = document.querySelector('iframe.experience-landing-frame');
    if (expFrame && expFrame.contentWindow) {
      try {
        expFrame.contentWindow.postMessage({ type: 'wb_age_verified' }, '*');
      } catch (e) {}
    }

    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        document.body.classList.remove('age-gate-locked');
        document.body.style.overflow = '';
        document.body.style.overflowY = '';
      }, 300);
    }
  }

  // Check if previously verified
  if (isAgeVerified()) {
    document.documentElement.classList.add('wb-age-verified');
    modal.style.display = 'none';
    document.body.classList.remove('age-gate-locked');
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    return;
  }

  // Check if previously denied
  if (isAgeDenied()) {
    document.body.classList.add('age-gate-locked');
    modal.style.display = 'flex';
    switchView(viewDenied);
  } else {
    // First visit / unverified: display modal & lock scroll
    document.body.classList.add('age-gate-locked');
    modal.style.display = 'flex';
    switchView(viewQuestion);
  }

  // YES button clicked -> Require user to enter Date of Birth (2-step verification)
  if (btnYes) {
    btnYes.addEventListener('click', () => {
      clearError();
      switchView(viewDob);
      if (monthInput) {
        setTimeout(() => {
          monthInput.focus();
        }, 80);
      }
    });
  }

  // NO button clicked -> Display age restriction warning & block access
  if (btnNo) {
    btnNo.addEventListener('click', () => {
      try {
        sessionStorage.setItem(AGE_GATE_DENIED_KEY, 'true');
      } catch (e) {}
      document.body.classList.add('age-gate-locked');
      switchView(viewDenied);
    });
  }

  // Return to verification from Denied view
  const btnDeniedBack = document.getElementById('btnAgeDeniedBack');
  if (btnDeniedBack) {
    btnDeniedBack.addEventListener('click', () => {
      try {
        sessionStorage.removeItem(AGE_GATE_DENIED_KEY);
      } catch (e) {}
      switchView(viewQuestion);
    });
  }

  // Back button clicked -> Return to initial question
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      clearError();
      switchView(viewQuestion);
    });
  }

  // Auto-advance and numeric filtering
  function setupDobInput(input, nextInput, prevInput, maxLen) {
    if (!input) return;

    input.addEventListener('input', () => {
      const cleanVal = input.value.replace(/[^0-9]/g, '');
      if (cleanVal !== input.value) {
        input.value = cleanVal;
      }
      clearError();

      if (input.value.length >= maxLen && nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && prevInput) {
        prevInput.focus();
      }
    });
  }

  setupDobInput(monthInput, dayInput, null, 2);
  setupDobInput(dayInput, yearInput, monthInput, 2);
  setupDobInput(yearInput, null, dayInput, 4);

  // Support pasting full date string into Month input
  if (monthInput) {
    monthInput.addEventListener('paste', (e) => {
      const pasteData = (e.clipboardData || window.clipboardData).getData('text');
      if (!pasteData) return;
      const parts = pasteData.trim().split(/[\/\-\.\s]+/);
      if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
        e.preventDefault();
        monthInput.value = parts[0].padStart(2, '0');
        if (dayInput) dayInput.value = parts[1].padStart(2, '0');
        if (yearInput) yearInput.value = parts[2];
        clearError();
        if (yearInput) yearInput.focus();
      }
    });
  }

  // Handle Date of Birth submission
  if (dobForm) {
    dobForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();

      const monthStr = monthInput ? monthInput.value.trim() : '';
      const dayStr = dayInput ? dayInput.value.trim() : '';
      const yearStr = yearInput ? yearInput.value.trim() : '';

      if (!monthStr || !dayStr || !yearStr) {
        showError('Please enter your complete date of birth (MM / DD / YYYY).');
        if (!monthStr && monthInput) monthInput.classList.add('input-error');
        if (!dayStr && dayInput) dayInput.classList.add('input-error');
        if (!yearStr && yearInput) yearInput.classList.add('input-error');
        return;
      }

      const m = parseInt(monthStr, 10);
      const d = parseInt(dayStr, 10);
      const y = parseInt(yearStr, 10);
      const currentYear = new Date().getFullYear();

      if (isNaN(m) || m < 1 || m > 12) {
        showError('Please enter a valid month (01 – 12).');
        if (monthInput) {
          monthInput.classList.add('input-error');
          monthInput.focus();
        }
        return;
      }

      function isLeap(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      }
      const daysInMonth = [31, (isLeap(y) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const maxDays = daysInMonth[m - 1] || 31;

      if (isNaN(d) || d < 1 || d > maxDays) {
        showError('Please enter a valid day for the selected month.');
        if (dayInput) {
          dayInput.classList.add('input-error');
          dayInput.focus();
        }
        return;
      }

      if (isNaN(y) || y < 1900 || y > currentYear) {
        showError('Please enter a valid 4-digit birth year.');
        if (yearInput) {
          yearInput.classList.add('input-error');
          yearInput.focus();
        }
        return;
      }

      const birthDate = new Date(y, m - 1, d);
      if (
        birthDate.getFullYear() !== y ||
        birthDate.getMonth() !== m - 1 ||
        birthDate.getDate() !== d
      ) {
        showError('Please enter a valid date of birth.');
        return;
      }

      // Calculate age to exact day
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age >= 21) {
        // AGE 21+ VERIFIED: Grant access
        if (submitBtn) {
          submitBtn.innerHTML = '<span>VERIFIED &bull; ENTERING...</span>';
          submitBtn.disabled = true;
        }
        grantAgeAccess();
      } else {
        // UNDER 21: Display restriction warning and prevent access
        try {
          sessionStorage.setItem(AGE_GATE_DENIED_KEY, 'true');
        } catch (err) {}
        switchView(viewDenied);
      }
    });
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  // 0. Initialize Mandatory 21+ Age Gate
  initAgeGate();

  // 1. Initialize Instant Smooth Anchor Navigation
  initSmoothAnchorNavigation();

  // 1b. Initialize Instant Page-to-Page Prefetching
  initInstantPagePrefetch();

  // 2. Initialize Wishlist & Cart
  Cart.init();

  // 2b. Initialize Mobile Navigation Menu
  initMobileMenu();

  // 3. Initialize Reveal Animations
  initRevealAnimations();

  // 3b. Initialize Hero Transitions
  initHeroTransitions();

  // 3c. Initialize Collection Transitions
  initCollectionTransitions();

  // 3d. Initialize Visit Transitions
  initVisitTransitions();

  // 4. Initialize About Toggle
  initAboutToggle();

  // 4b. Initialize Price Filter Dropdown
  initPriceFilterDropdown();

  // 4c. Initialize Filter Redirections
  initFilterRedirections();

  // 5. Render Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 6. Run page-specific logic
  const isCategoryPage = window.location.pathname.includes("category.html") || window.location.pathname.includes("/category");
  const isProductPage = window.location.pathname.includes("product.html") || window.location.pathname.includes("/product");
  const isVisitPage = window.location.pathname.includes("visit.html") || window.location.pathname.includes("/visit");

  if (isCategoryPage) {
    handleCategoryPage();
  } else if (isProductPage) {
    handleProductPage();
  } else if (!isVisitPage) {
    // default to index
    handleIndexPage();
  }
});




/* ======================================================== */
/* LUXURY PRODUCT QUICK VIEW MODAL ENGINE                   */
/* ======================================================== */

const PRODUCT_QUICKVIEW_DETAILS = {
  "bakers-7-year-single-barrel": {
    badge: "KENTUCKY STRAIGHT SINGLE-BARREL BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT SINGLE-BARREL BOURBON WHISKEY",
    title: "Baker's 7 Year Single Barrel Bourbon - 750 mL",
    subtitle: "BAKERS BOURBON WHISKEY 750ML",
    price: "$69.99",
    style: "Kentucky straight single-barrel bourbon whiskey",
    ingredients: "Corn-based bourbon mash; exact ratios not stated by producer",
    origin: "Kentucky, United States",
    abv: "53.5% ABV",
    volume: "750 ml",
    description: "Standard 7-year single-barrel Baker’s at 107 proof. 750 mL."
  },
  "bardstown-origin-high-wheat": {
    badge: "KENTUCKY STRAIGHT WHEATED BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT WHEATED BOURBON WHISKEY",
    title: "Bardstown Origin Series High Wheat Bourbon - 750 mL",
    subtitle: "BARDSTOWN BOURBON 750ML",
    price: "$49.99",
    style: "Kentucky straight wheated bourbon whiskey",
    ingredients: "53% corn, 39% wheat and 8% malted barley",
    origin: "Bardstown, Kentucky, United States",
    abv: "53% ABV",
    volume: "750 ml",
    description: "Origin High Wheat, six years and 106 proof. Producer sell sheet confirms UPC 857552008806. 750 mL."
  },
  "bardstown-origin-bottled-in-bond": {
    badge: "BOTTLED-IN-BOND KENTUCKY STRAIGHT WHEATED BOURBON WHISKEY",
    eyebrow: "BOTTLED-IN-BOND KENTUCKY STRAIGHT WHEATED BOURBON WHISKEY",
    title: "Bardstown Origin Series Bottled-in-Bond Bourbon - 750 mL",
    subtitle: "BARDSTOWN ORIGIN 750ML",
    price: "$49.99",
    style: "Bottled-in-bond Kentucky straight wheated bourbon whiskey",
    ingredients: "68% corn, 20% wheat and 12% malted barley",
    origin: "Bardstown, Kentucky, United States",
    abv: "50% ABV",
    volume: "750 ml",
    description: "Estate-distilled Origin Bottled-in-Bond, aged six years and bottled at 100 proof. 750 mL."
  },
  "balcones-baby-blue-corn-whisky": {
    badge: "TEXAS CORN WHISKY",
    eyebrow: "TEXAS CORN WHISKY",
    title: "Balcones Baby Blue Corn Whisky - 750 mL",
    subtitle: "BALCONES BABY BLUE 750ML",
    price: "$39.99",
    style: "Texas corn whisky",
    ingredients: "Roasted blue corn",
    origin: "Waco, Texas, United States",
    abv: "46% ABV",
    volume: "750 ml",
    description: "Baby Blue pot-distilled corn whisky at 92 proof. 750 mL."
  },
  "balblair-15-year-single-malt": {
    badge: "HIGHLAND SINGLE MALT SCOTCH WHISKY",
    eyebrow: "HIGHLAND SINGLE MALT SCOTCH WHISKY",
    title: "Balblair 15 Year Single Malt Scotch Whisky - 750 mL",
    subtitle: "BALBLAIR DISTILLERY 15 YRS 750ML",
    price: "$124.99",
    style: "Highland single malt Scotch whisky",
    ingredients: "Malted barley",
    origin: "Edderton, Scottish Highlands, United Kingdom",
    abv: "46% ABV",
    volume: "750 ml",
    description: "15-year age statement. Matured in American oak ex-bourbon casks and first-fill ex-sherry oak. 750 mL."
  },
  "balcones-texas-pot-still-bourbon": {
    badge: "TEXAS POT-STILL STRAIGHT BOURBON WHISKEY",
    eyebrow: "TEXAS POT-STILL STRAIGHT BOURBON WHISKEY",
    title: "Balcones Texas Pot Still Bourbon - 750 mL",
    subtitle: "BALCONES TEXAS BOUTBON 750ML",
    price: "$29.99",
    style: "Texas pot-still straight bourbon whiskey",
    ingredients: "Roasted blue corn, Texas wheat, Texas rye and malted barley",
    origin: "Waco, Texas, United States",
    abv: "46% ABV",
    volume: "750 ml",
    description: "Four-grain bourbon matured in new American oak. 750 mL."
  },
  "backbone-bourbon-uncut": {
    badge: "BARREL-PROOF STRAIGHT BOURBON WHISKEY",
    eyebrow: "BARREL-PROOF STRAIGHT BOURBON WHISKEY",
    title: "Backbone Uncut Straight Bourbon - 750 mL",
    subtitle: "BACKBONE BOURBON UNCUT BOURBON WHISKY 750ML",
    price: "$54.99",
    style: "Barrel-proof straight bourbon whiskey",
    ingredients: "75% corn, 21% rye and 4% malted barley",
    origin: "Indiana, United States",
    abv: "58.3% ABV",
    volume: "750 ml",
    description: "Backbone Uncut is bottled undiluted. The producer's published batch 29 and original source photo show 116.6 proof / 58.3% ABV. Confirm the inventory batch before using that strength."
  },
  "bardstown-origin-toasted-cherry-rye": {
    badge: "KENTUCKY STRAIGHT RYE WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT RYE WHISKEY",
    title: "Bardstown Origin Series Rye Whiskey - 750 mL",
    subtitle: "BARDSTOWN ORIGIN 750ML",
    price: "$49.99",
    style: "Kentucky straight rye whiskey",
    ingredients: "95% rye and 5% malted barley",
    origin: "Bardstown, Kentucky, United States",
    abv: "48% ABV",
    volume: "750 ml",
    description: "Origin rye, six years, finished in toasted cherry wood and oak barrels. 750 mL."
  },
  "2xo-american-oak-bourbon": {
    badge: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "2XO American Oak Bourbon - 750 mL",
    subtitle: "2XO AMERUCAN OAK 750ML",
    price: "$44.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn-forward bourbon mash",
    origin: "Kentucky, USA",
    abv: "46% ABV",
    volume: "750 ml",
    description: "American Oak is part of the 2XO Oak Series."
  },
  "barrell-foundation-bourbon": {
    badge: "BLEND OF STRAIGHT BOURBON WHISKEYS",
    eyebrow: "BLEND OF STRAIGHT BOURBON WHISKEYS",
    title: "Barrell Foundation Bourbon - 750 mL",
    subtitle: "BARRELL FDN BOURBON 750ML",
    price: "$55.99",
    style: "Blend of straight bourbon whiskeys",
    ingredients: "Derived blend mash bill: 73% corn, 23% rye and 4% malted barley",
    origin: "United States; blended and bottled in Kentucky",
    abv: "50% ABV",
    volume: "750 ml",
    description: "Standard Foundation blends bourbons from Kentucky, Indiana, Tennessee and Maryland. 100 proof, 750 mL."
  },
  "barrell-dovetail-whiskey": {
    badge: "CASK-STRENGTH BARREL-FINISHED WHISKEY",
    eyebrow: "CASK-STRENGTH BARREL-FINISHED WHISKEY",
    title: "Barrell Dovetail Whiskey - 750 mL",
    subtitle: "BARREL DOVETAIL 750ML",
    price: "$89.99",
    style: "Cask-strength barrel-finished whiskey",
    ingredients: "Bourbon and other American whiskey components",
    origin: "United States",
    abv: "62.71% ABV",
    volume: "750 ml",
    description: "The original Dovetail source bottle shows 125.42 proof / 62.71% ABV. This is the pictured batch. Release strengths vary, so confirm the inventory bottle label. Finished in Cabernet, Port and rum casks."
  },
  "compass-box-artist-blend": {
    badge: "BLENDED SCOTCH WHISKY",
    eyebrow: "BLENDED SCOTCH WHISKY",
    title: "Compass Box Artist Blend Scotch Whisky - 750 mL",
    subtitle: "ARTIST BLEND 750ML",
    price: "$34.99",
    style: "Blended Scotch whisky",
    ingredients: "Malt Scotch whisky, grain Scotch whisky",
    origin: "Scotland, United Kingdom",
    abv: "43% ABV",
    volume: "750 ml",
    description: "Compass Box Artist Blend 750 mL. The producer lists about 55% malt whisky in the blend."
  },
  "barrell-seagrass-rye": {
    badge: "CASK-STRENGTH BARREL-FINISHED RYE WHISKEY BLEND",
    eyebrow: "CASK-STRENGTH BARREL-FINISHED RYE WHISKEY BLEND",
    title: "Barrell Seagrass Rye Whiskey - 750 mL",
    subtitle: "BARREL SEAGRASS RYE 750ML",
    price: "$85.99",
    style: "Cask-strength barrel-finished rye whiskey blend",
    ingredients: "American and Canadian rye whiskeys",
    origin: "United States and Canada",
    abv: "59.2% ABV",
    volume: "750 ml",
    description: "NC ABC lists this exact UPC at 118.4 proof / 59.2% ABV. This is a regulatory reference value. The source photo has blank proof fields and releases vary, so confirm the inventory bottle label. Finished in rhum, Madeira and apricot-brandy casks."
  },
  "widow-jane-baby-jane": {
    badge: "BLEND OF STRAIGHT BOURBON WHISKEYS",
    eyebrow: "BLEND OF STRAIGHT BOURBON WHISKEYS",
    title: "Widow Jane Baby Jane Bourbon - 750 mL",
    subtitle: "BABY JANE BOURBON WHISKEY750ML",
    price: "$49.99",
    style: "Blend of straight bourbon whiskeys",
    ingredients: "Proprietary Baby Jane heirloom corn; other mash grains undisclosed in the cited release",
    origin: "New York and Kentucky, United States",
    abv: "45.5% ABV",
    volume: "750 ml",
    description: "Small-batch blend of Brooklyn and Kentucky bourbon. 750 mL."
  },
  "291-barrel-proof-colorado-bourbon": {
    badge: "BARREL-PROOF SINGLE-BARREL BOURBON",
    eyebrow: "BARREL-PROOF SINGLE-BARREL BOURBON",
    title: "291 Colorado Barrel Proof Single Barrel Bourbon - 750 mL",
    subtitle: "291 BARREL PROOF COLORADO WHISKY 750ML",
    price: "$119.99",
    style: "Barrel-proof single-barrel bourbon",
    ingredients: "Corn-forward bourbon mash",
    origin: "Colorado, USA",
    abv: "63% ABV",
    volume: "750 ml",
    description: "Published reference for this UPC is 63% ABV. Barrel proof varies. The source image shows a 66.9% straight-bourbon bottling, so confirm the pictured expression and batch against the inventory bottle."
  },
  "1792-small-batch-bourbon-175l": {
    badge: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "1792 Small Batch Bourbon - 1.75 L",
    subtitle: "1792 SMALL BATCH  1.75L",
    price: "$59.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn-forward grain mash with rye",
    origin: "Kentucky, USA",
    abv: "46.85% ABV",
    volume: "1.75 L",
    description: "High-rye Small Batch expression in the 1.75 L bottle."
  },
  "aberlour-12-year-speyside-single-malt": {
    badge: "SPEYSIDE SINGLE MALT SCOTCH WHISKY",
    eyebrow: "SPEYSIDE SINGLE MALT SCOTCH WHISKY",
    title: "Aberlour 12 Year Single Malt Scotch Whisky - 750 mL",
    subtitle: "ABERLOUR DISLLRY SNGL MALT 750ML",
    price: "$64.99",
    style: "Speyside single malt Scotch whisky",
    ingredients: "Malted barley",
    origin: "Scotland (Speyside, Aberlour)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Current Pernod Ricard U.S. supplier record for UPC 080432102145 and the original 750 mL bottle photos show 40% ABV / 80 proof. NC ABC has a 43% entry for the same UPC. Use 40% as the U.S. reference and check the inventory label."
  },
  "aberfeldy-12-year-highland-single-malt": {
    badge: "HIGHLAND SINGLE MALT SCOTCH WHISKY",
    eyebrow: "HIGHLAND SINGLE MALT SCOTCH WHISKY",
    title: "Aberfeldy Highland Single Malt Scotch Whisky - 750 mL",
    subtitle: "ABERFELDY HGHGLAD SINGLE MALT 750 ML",
    price: "$59.99",
    style: "Highland single malt Scotch whisky",
    ingredients: "Malted barley",
    origin: "Scotland (Highlands, Aberfeldy)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "12 years old. Honeyed malt with fruit, spice and vanilla."
  },
  "ancient-age-bourbon-175l": {
    badge: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Ancient Age Bourbon - 1.75 L",
    subtitle: "ANCIENT AGE 1.75L",
    price: "$26.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Frankfort, Kentucky, USA",
    abv: "40% ABV",
    volume: "1.75 L",
    description: "Ancient Age 1.75 L, 80 proof. The distillery does not publish the mash proportions."
  },
  "1792-small-batch-bourbon": {
    badge: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "1792 Small Batch Bourbon - 750 mL",
    subtitle: "1792 SMLL BATCH 750ML",
    price: "$30.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn-forward grain mash with rye",
    origin: "Kentucky, USA",
    abv: "46.85% ABV",
    volume: "750 ml",
    description: "High-rye Small Batch expression in the 750 mL bottle. Label artwork may vary."
  },
  "1620-small-batch-bourbon": {
    badge: "SMALL BATCH BOURBON WHISKEY",
    eyebrow: "SMALL BATCH BOURBON WHISKEY",
    title: "1620 Small Batch Bourbon - 750 mL",
    subtitle: "1620 SMALL BTCH BOURB 750ML",
    price: "$39.99",
    style: "Small batch bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "USA",
    abv: "45% ABV",
    volume: "750 ml",
    description: "The 90-proof Small Batch expression. The distiller lists Full Proof as a separate product."
  },
  "ancient-age-bourbon-750ml": {
    badge: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Ancient Age Bourbon - 750 mL",
    subtitle: "ANCIENT AGE 750ML",
    price: "$13.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Frankfort, Kentucky, USA",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Ancient Age 750 mL, 80 proof."
  },
  "angels-envy-triple-oak-bourbon": {
    badge: "OAK-FINISHED KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "OAK-FINISHED KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Angel's Envy Triple Oak Bourbon - 750 mL",
    subtitle: "ANGELS ENVY TRIPLE OAK 750ML",
    price: "$79.99",
    style: "Oak-finished Kentucky straight bourbon whiskey",
    ingredients: "Corn-based bourbon grain mash",
    origin: "Kentucky, USA",
    abv: "46% ABV",
    volume: "750 ml",
    description: "Angel's Envy Triple Oak 750 mL, 92 proof. Finished in French, Hungarian and Chinkapin oak."
  },
  "angels-envy-port-finish-375ml": {
    badge: "PORT-FINISHED KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "PORT-FINISHED KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Angel's Envy Bourbon - 375 mL",
    subtitle: "ANGELS ENVY 375ML",
    price: "$29.99",
    style: "Port-finished Kentucky straight bourbon whiskey",
    ingredients: "Corn-based bourbon grain mash",
    origin: "Kentucky, USA",
    abv: "43.3% ABV",
    volume: "375 ml",
    description: "Angel's Envy Signature Series 375 mL, finished in port wine barrels. Maine lists 86.6 proof for this UPC."
  },
  "augusta-buckners-10-year-single-barrel": {
    badge: "SINGLE-BARREL KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "SINGLE-BARREL KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Augusta 10 Year Single Barrel Bourbon - 750 mL",
    subtitle: "AUGUSTA 10YR SNGL BRL 750ML",
    price: "$159.99",
    style: "Single-barrel Kentucky straight bourbon whiskey",
    ingredients: "Corn-based bourbon grain mash",
    origin: "Kentucky, USA",
    abv: "60.2% ABV",
    volume: "750 ml",
    description: "Buckner's 10 Year source bottle shows 120.4 proof / 60.2% ABV, corroborated by an exact-UPC retailer record. This is a pictured single-barrel value. Confirm the inventory barrel's label."
  },
  "augusta-old-route-8-year-single-barrel": {
    badge: "SINGLE-BARREL KENTUCKY STRAIGHT BOURBON WHISKEY",
    eyebrow: "SINGLE-BARREL KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Augusta Old Route 8 Bourbon - 750 mL",
    subtitle: "AUGUSTA OLD ROUTE 8 750ML",
    price: "$119.99",
    style: "Single-barrel Kentucky straight bourbon whiskey",
    ingredients: "Corn-based bourbon grain mash",
    origin: "Kentucky, USA",
    abv: "55% ABV",
    volume: "750 ml",
    description: "Old Route 8 source bottle shows 110 proof / 55% ABV. This is a pictured single-barrel value. Confirm the inventory barrel's label."
  },
  "auchentoshan-american-oak-single-malt": {
    badge: "LOWLAND SINGLE MALT SCOTCH WHISKY",
    eyebrow: "LOWLAND SINGLE MALT SCOTCH WHISKY",
    title: "Auchentoshan American Oak Single Malt Scotch Whisky - 750 mL",
    subtitle: "AUCHENTOSHAN SINGLE MALT 750ML",
    price: "$52.99",
    style: "Lowland single malt Scotch whisky",
    ingredients: "Malted barley",
    origin: "Glasgow area, Scotland, United Kingdom",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Auchentoshan American Oak 750 mL. Triple distilled and matured in American oak ex-bourbon casks."
  },
  "backbone-decade-down-uncut-anniversary": {
    badge: "STRAIGHT BOURBON WHISKEY, PARTLY SHERRY-CASK FINISHED",
    eyebrow: "STRAIGHT BOURBON WHISKEY, PARTLY SHERRY-CASK FINISHED",
    title: "Backbone Decade Down Uncut Bourbon - 750 mL",
    subtitle: "BACKBONE BOURBON WHISKY 750ML",
    price: "$75.99",
    style: "Straight bourbon whiskey, partly sherry-cask finished",
    ingredients: "Corn, rye and malted barley",
    origin: "Indiana, United States",
    abv: "55% ABV",
    volume: "750 ml",
    description: "Decade Down Uncut Anniversary Edition blends five- to seven-year bourbons, including a sherry-cask-finished portion. 750 mL."
  },
  "amaro-montenegro-liqueur": {
    badge: "ITALIAN AMARO (HERBAL LIQUEUR)",
    eyebrow: "ITALIAN AMARO (HERBAL LIQUEUR)",
    title: "Amaro Montenegro - 750 mL",
    subtitle: "AMARO MONTENEGRO 750ML",
    price: "$37.99",
    style: "Italian amaro (herbal liqueur)",
    ingredients: "40 botanicals, including spices, citrus peels and roots",
    origin: "Italy (Bologna)",
    abv: "23% ABV",
    volume: "750 ml",
    description: "Amaro Montenegro, 750 mL. Bittersweet herbal and citrus profile."
  },
  "baileys-chocolate-irish-cream-750ml": {
    badge: "CHOCOLATE IRISH CREAM LIQUEUR",
    eyebrow: "CHOCOLATE IRISH CREAM LIQUEUR",
    title: "Baileys Chocolate Irish Cream Liqueur - 750 mL",
    subtitle: "BAILEY CHOCOLATE CREAM LIQUER",
    price: "$29.99",
    style: "Chocolate Irish cream liqueur",
    ingredients: "Baileys Original Irish Cream and Belgian chocolate",
    origin: "Ireland",
    abv: "15.7% ABV",
    volume: "750 ml",
    description: "Chocolate expression in blue bottle. 750 mL, 31.4 proof."
  },
  "10th-mountain-bourbon-whiskey": {
    badge: "AMERICAN BOURBON WHISKEY",
    eyebrow: "AMERICAN BOURBON WHISKEY",
    title: "10th Mountain Bourbon - 750 mL",
    subtitle: "10TH MOUNTAIN BOURBON 750ML",
    price: "$61.99",
    style: "American bourbon whiskey",
    ingredients: "Colorado corn, rye, malted barley",
    origin: "Colorado, USA",
    abv: "46% ABV",
    volume: "750 ml",
    description: "Made with a corn-forward mash and aged in new charred oak."
  },
  "baileys-original-irish-cream-750ml": {
    badge: "IRISH CREAM LIQUEUR",
    eyebrow: "IRISH CREAM LIQUEUR",
    title: "Baileys Original Irish Cream - 750 mL",
    subtitle: "BAILEY IRISH CREAM 750ML",
    price: "$29.99",
    style: "Irish cream liqueur",
    ingredients: "Irish whiskey and spirits, Irish dairy cream, chocolate and vanilla flavors",
    origin: "Ireland",
    abv: "17% ABV",
    volume: "750 ml",
    description: "Original Irish Cream, 750 mL bottle."
  },
  "baileys-espresso-creme-750ml": {
    badge: "COFFEE-FLAVORED IRISH CREAM LIQUEUR",
    eyebrow: "COFFEE-FLAVORED IRISH CREAM LIQUEUR",
    title: "Baileys Espresso Crème Irish Cream Liqueur - 750 mL",
    subtitle: "BAILEY ESPRESSO 750ML",
    price: "$29.99",
    style: "Coffee-flavored Irish cream liqueur",
    ingredients: "Baileys Original Irish Cream, coffee flavor and other natural flavors",
    origin: "Ireland",
    abv: "17% ABV",
    volume: "750 ml",
    description: "Espresso Crème expression. 750 mL, 34 proof."
  },
  "bb-dom-liqueur-benedictine-brandy": {
    badge: "BRANDY AND HERBAL LIQUEUR",
    eyebrow: "BRANDY AND HERBAL LIQUEUR",
    title: "B&B D.O.M. Liqueur - 750 mL",
    subtitle: "B&B LIQUEUR 750ML",
    price: "$38.99",
    style: "Brandy and herbal liqueur",
    ingredients: "Bénédictine herbal liqueur (60%); French brandy (40%)",
    origin: "Fécamp, France",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Blended at Palais Bénédictine and rested in French oak. 750 mL."
  },
  "baileys-original-irish-cream-175l": {
    badge: "IRISH CREAM LIQUEUR",
    eyebrow: "IRISH CREAM LIQUEUR",
    title: "Baileys Original Irish Cream - 1.75 L",
    subtitle: "BAILEYS IRISH CREAM 1.75L",
    price: "$51.99",
    style: "Irish cream liqueur",
    ingredients: "Irish whiskey and spirits, Irish dairy cream, chocolate and vanilla flavors",
    origin: "Ireland",
    abv: "17% ABV",
    volume: "1.75 L",
    description: "Original Irish Cream, 1.75 L bottle."
  },
  "wild-turkey-american-honey-liqueur-50ml": {
    badge: "BOURBON-BASED HONEY LIQUEUR",
    eyebrow: "BOURBON-BASED HONEY LIQUEUR",
    title: "Wild Turkey American Honey - 50 mL",
    subtitle: "AMERICAN HONEY 50ML",
    price: "$1.09",
    style: "Bourbon-based honey liqueur",
    ingredients: "Kentucky bourbon whiskey, honey",
    origin: "Kentucky, USA",
    abv: "35.5% ABV",
    volume: "50 ml",
    description: "Wild Turkey American Honey 50 mL miniature. The state listing groups the minis in a 12-pack."
  },
  "wild-turkey-american-honey-liqueur-375ml": {
    badge: "BOURBON AND HONEY LIQUEUR",
    eyebrow: "BOURBON AND HONEY LIQUEUR",
    title: "Wild Turkey American Honey - 375 mL",
    subtitle: "AMERICAN HONEY 375ML",
    price: "$14.99",
    style: "Bourbon and honey liqueur",
    ingredients: "Kentucky bourbon whiskey and honey",
    origin: "United States (Lawrenceburg, Kentucky)",
    abv: "35.5% ABV",
    volume: "375 ml",
    description: "Wild Turkey American Honey, 375 mL. Sweet honey and bourbon profile."
  },
  "wild-turkey-american-honey-liqueur-750ml": {
    badge: "BOURBON-BASED HONEY LIQUEUR",
    eyebrow: "BOURBON-BASED HONEY LIQUEUR",
    title: "Wild Turkey American Honey - 750 mL",
    subtitle: "AMERICAN HONEY 750ML",
    price: "$19.99",
    style: "Bourbon-based honey liqueur",
    ingredients: "Kentucky bourbon whiskey, honey",
    origin: "Kentucky, USA",
    abv: "35.5% ABV",
    volume: "750 ml",
    description: "Wild Turkey American Honey 750 mL, 71 proof."
  },
  "aperol-aperitivo-liqueur-750ml": {
    badge: "ITALIAN BITTER APERITIVO",
    eyebrow: "ITALIAN BITTER APERITIVO",
    title: "Aperol - 750 mL",
    subtitle: "APEROL 750ML",
    price: "$26.99",
    style: "Italian bitter aperitivo",
    ingredients: "Orange, gentian, chinchona, herbs and spices",
    origin: "Italy",
    abv: "11% ABV",
    volume: "750 ml",
    description: "Aperol 750 mL, 22 proof. Orange-colored bittersweet aperitivo."
  },
  "absente-absinthe-refined-750ml": {
    badge: "ABSINTHE (HERBAL LIQUEUR)",
    eyebrow: "ABSINTHE (HERBAL LIQUEUR)",
    title: "Absente Refined Absinthe - 750 mL",
    subtitle: "ABSENTE REFINED 750ML",
    price: "$49.99",
    style: "Absinthe (herbal liqueur)",
    ingredients: "Wormwood, anise, mugwort, lemon balm and mint",
    origin: "France (Provence)",
    abv: "55% ABV",
    volume: "750 ml",
    description: "Absente Absinthe Refined, 110-proof. Anise-forward with herbal notes."
  },
  "aperol-aperitivo-liqueur-375ml": {
    badge: "ITALIAN BITTER APERITIVO",
    eyebrow: "ITALIAN BITTER APERITIVO",
    title: "Aperol - 375 mL",
    subtitle: "APEROL 375ML",
    price: "$19.99",
    style: "Italian bitter aperitivo",
    ingredients: "Orange, gentian, chinchona, herbs and spices",
    origin: "Italy",
    abv: "11% ABV",
    volume: "375 ml",
    description: "Aperol 375 mL, 22 proof. Bottled aperitivo used to make a spritz."
  },
  "aviation-american-gin-750ml": {
    badge: "AMERICAN-STYLE GIN",
    eyebrow: "AMERICAN-STYLE GIN",
    title: "Aviation American Gin - 750 mL",
    subtitle: "AVIATION GIN750ML",
    price: "$27.99",
    style: "American-style gin",
    ingredients: "Neutral spirit, juniper and other botanicals",
    origin: "Portland, Oregon, USA",
    abv: "42% ABV",
    volume: "750 ml",
    description: "Aviation American Gin 750 mL, 84 proof. Botanicals include cardamom, lavender, coriander, anise, sarsaparilla and orange peel."
  },
  "bacardi-gold-rum-375ml": {
    badge: "GOLD RUM",
    eyebrow: "GOLD RUM",
    title: "Bacardí Gold Rum - 375 mL",
    subtitle: "BACARDI GOLD RUM 375ML",
    price: "$9.99",
    style: "Gold rum",
    ingredients: "Sugarcane molasses, water and yeast",
    origin: "Puerto Rico, United States",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Toasted-oak-aged amber rum. 375 mL."
  },
  "bacardi-superior-white-rum-50ml": {
    badge: "WHITE RUM",
    eyebrow: "WHITE RUM",
    title: "Bacardí Superior White Rum - 50 mL",
    subtitle: "BACARDI SILVER 50ML",
    price: "$0.99",
    style: "White rum",
    ingredients: "Sugarcane molasses, water and yeast",
    origin: "Cataño, Puerto Rico, United States",
    abv: "40% ABV",
    volume: "50 ml",
    description: "Light white rum, 50 mL per bottle. Same UPC appears as single and 10-pack in different catalogs."
  },
  "bacardi-gold-rum-200ml": {
    badge: "GOLD RUM",
    eyebrow: "GOLD RUM",
    title: "Bacardí Gold Rum - 200 mL",
    subtitle: "BACARDI GOLD 200ML",
    price: "$5.99",
    style: "Gold rum",
    ingredients: "Sugarcane molasses, water and yeast",
    origin: "Puerto Rico, United States",
    abv: "40% ABV",
    volume: "200 ml",
    description: "Toasted-oak-aged amber rum. 200 mL."
  },
  "arak-razzouk-750ml": {
    badge: "ARAK / ANISE-FLAVORED GRAPE SPIRIT",
    eyebrow: "ARAK / ANISE-FLAVORED GRAPE SPIRIT",
    title: "Arak Razzouk - 750 mL",
    subtitle: "ARAK RAZZOUK 750ML",
    price: "$25.99",
    style: "Arak / anise-flavored grape spirit",
    ingredients: "Distilled grape juice, aniseed",
    origin: "Lebanon",
    abv: "50% ABV",
    volume: "750 ml",
    description: "Arak Razzouk 750 mL, 100 proof. Turns cloudy with added water."
  },
  "angostura-aromatic-bitters-4oz": {
    badge: "AROMATIC COCKTAIL BITTERS",
    eyebrow: "AROMATIC COCKTAIL BITTERS",
    title: "Angostura Aromatic Bitters - 4 fl oz",
    subtitle: "ANGOSTURA BITTERS 4FLOZ",
    price: "$11.99",
    style: "Aromatic cocktail bitters",
    ingredients: "Alcohol, water, herbs and spices",
    origin: "Trinidad and Tobago",
    abv: "44.7% ABV",
    volume: "4 fl oz",
    description: "Angostura aromatic bitters 4 fl oz. Concentrated cocktail seasoning with a proprietary formula."
  },
  "absolut-vodka-swedish-200ml": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Absolut Vodka - 200 mL",
    subtitle: "ABSOLUT VODKA 200ML",
    price: "$7.99",
    style: "Vodka",
    ingredients: "Swedish winter wheat and well water",
    origin: "Sweden (Åhus, Skåne)",
    abv: "40% ABV",
    volume: "200 ml",
    description: "Absolut Original, 200 mL. Continuous distillation."
  },
  "absolut-vodka-swedish-175l": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Absolut Vodka - 1.75 L",
    subtitle: "ABSOLUT VODKA 1.75L",
    price: "$34.99",
    style: "Vodka",
    ingredients: "Swedish winter wheat and well water",
    origin: "Sweden (Åhus, Skåne)",
    abv: "40% ABV",
    volume: "1.75 L",
    description: "Absolut Original, 1.75 L. Continuous distillation."
  },
  "360-georgia-peach-flavored-vodka-750ml": {
    badge: "PEACH-FLAVORED VODKA",
    eyebrow: "PEACH-FLAVORED VODKA",
    title: "360 Georgia Peach Vodka - 750 mL",
    subtitle: "360 GEORGIA PEACH VODKA 750ML",
    price: "$14.99",
    style: "Peach-flavored vodka",
    ingredients: "Corn-based vodka, peach flavor",
    origin: "Missouri, USA",
    abv: "35% ABV",
    volume: "750 ml",
    description: "Georgia Peach is the flavor name. The distiller uses Missouri-grown corn for its vodka base."
  },
  "absolut-citron-lemon-vodka-750ml": {
    badge: "LEMON-FLAVORED VODKA",
    eyebrow: "LEMON-FLAVORED VODKA",
    title: "Absolut Citron Vodka - 750 mL",
    subtitle: "ABSOLUT CITRON 750ML",
    price: "$20.99",
    style: "Lemon-flavored vodka",
    ingredients: "Vodka and natural citrus flavoring",
    origin: "Sweden (Åhus, Skåne)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Absolut Citron, 750 mL. Lemon peel and lime character."
  },
  "360-bing-cherry-flavored-vodka-750ml": {
    badge: "CHERRY-FLAVORED VODKA",
    eyebrow: "CHERRY-FLAVORED VODKA",
    title: "360 Bing Cherry Vodka - 750 mL",
    subtitle: "360 BING CHERRY VODKA 750ML",
    price: "$14.99",
    style: "Cherry-flavored vodka",
    ingredients: "Corn-based vodka, Bing cherry flavor",
    origin: "Missouri, USA",
    abv: "35% ABV",
    volume: "750 ml",
    description: "Bing cherry expression of 360 Vodka."
  },
  "360-vodka-american-vodka-175l": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "360 Vodka - 1.75 L",
    subtitle: "360 VODKA 1.75L",
    price: "$22.99",
    style: "Vodka",
    ingredients: "Corn",
    origin: "Missouri, USA",
    abv: "40% ABV",
    volume: "1.75 L",
    description: "Unflavored 360 Vodka in the 1.75 L bottle."
  },
  "99-brand-apples-liqueur-50ml": {
    badge: "APPLE-FLAVORED LIQUEUR",
    eyebrow: "APPLE-FLAVORED LIQUEUR",
    title: "99 Apples Liqueur - 50 mL",
    subtitle: "99 APPLE 50ML",
    price: "$0.99",
    style: "Apple-flavored liqueur",
    ingredients: "Liqueur base, apple flavoring",
    origin: "USA",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Apples 50 mL miniature."
  },
  "99-brand-watermelons-liqueur-50ml": {
    badge: "WATERMELON-FLAVORED LIQUEUR",
    eyebrow: "WATERMELON-FLAVORED LIQUEUR",
    title: "99 Watermelons Schnapps - 50 mL",
    subtitle: "99 WATERMELONS 50ML",
    price: "$0.99",
    style: "Watermelon-flavored liqueur",
    ingredients: "Distilled spirit and watermelon flavoring",
    origin: "United States (Louisville, Kentucky)",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Brand Watermelon miniature, 50 mL."
  },
  "absolut-vodka-swedish-375ml": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Absolut Vodka - 375 mL",
    subtitle: "ABSOLUT VODKA 375ML",
    price: "$12.99",
    style: "Vodka",
    ingredients: "Swedish winter wheat and well water",
    origin: "Sweden (Åhus, Skåne)",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Absolut Original, 375 mL. Continuous distillation."
  },
  "amarula-cream-marula-fruit-liqueur-750ml": {
    badge: "CREAM LIQUEUR",
    eyebrow: "CREAM LIQUEUR",
    title: "Amarula Cream Liqueur - 750 mL",
    subtitle: "AMARULA LIQUEUR 750ML",
    price: "$28.99",
    style: "Cream liqueur",
    ingredients: "Marula fruit spirit and dairy cream",
    origin: "South Africa",
    abv: "17% ABV",
    volume: "750 ml",
    description: "Amarula Original Cream, 750 mL. Marula spirit matures in French oak before blending with cream."
  },
  "99-brand-whipped-liqueur-50ml": {
    badge: "WHIPPED CREAM–FLAVORED LIQUEUR",
    eyebrow: "WHIPPED CREAM–FLAVORED LIQUEUR",
    title: "99 Whipped Liqueur - 50 mL",
    subtitle: "99 WHIPPED 50ML",
    price: "$0.99",
    style: "Whipped cream–flavored liqueur",
    ingredients: "Distilled spirit and whipped-cream flavoring",
    origin: "United States (Louisville, Kentucky)",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Brand Whipped miniature, 50 mL."
  },
  "barin-vodka-premium-quality": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Barin Russian Vodka - 375 mL",
    subtitle: "BARIN 375ML",
    price: "$2.69",
    style: "Vodka",
    ingredients: "Vodka base; fermentation source not disclosed",
    origin: "Check bottle — origin unverified",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Savas lists Barin at 80 proof and a retailer lists the 375 mL bottle. Confirm the UPC and country from the back label before publication. Different Barin label records identify different countries, and none has been matched to this UPC and size."
  },
  "99-brand-bananas-liqueur-50ml": {
    badge: "BANANA-FLAVORED SCHNAPPS",
    eyebrow: "BANANA-FLAVORED SCHNAPPS",
    title: "99 Bananas Schnapps - 50 mL",
    subtitle: "99 BANANAS 50ML",
    price: "$0.99",
    style: "Banana-flavored schnapps",
    ingredients: "Liqueur base, banana flavoring",
    origin: "USA",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Bananas 50 mL miniature. Pack listings may describe the distributor multipack."
  },
  "99-brand-peaches-liqueur-50ml": {
    badge: "PEACH-FLAVORED LIQUEUR",
    eyebrow: "PEACH-FLAVORED LIQUEUR",
    title: "99 Peaches Schnapps - 50 mL",
    subtitle: "99 PEACHES 50ML",
    price: "$0.99",
    style: "Peach-flavored liqueur",
    ingredients: "Distilled spirit and peach flavoring",
    origin: "United States (Louisville, Kentucky)",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Brand Peach miniature, 50 mL."
  },
  "99-brand-fruit-punch-liqueur-50ml": {
    badge: "FRUIT-PUNCH-FLAVORED LIQUEUR",
    eyebrow: "FRUIT-PUNCH-FLAVORED LIQUEUR",
    title: "99 Fruit Punch Liqueur - 50 mL",
    subtitle: "99 FRUIT PUNCH 50ML",
    price: "$0.99",
    style: "Fruit-punch-flavored liqueur",
    ingredients: "Liqueur base, fruit punch flavoring",
    origin: "USA",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Fruit Punch 50 mL miniature."
  },
  "99-brand-grapes-schnapps-liqueur-50ml": {
    badge: "GRAPE-FLAVORED LIQUEUR",
    eyebrow: "GRAPE-FLAVORED LIQUEUR",
    title: "99 Grapes Liqueur - 50 mL",
    subtitle: "99 GRAPES 50ML",
    price: "$0.99",
    style: "Grape-flavored liqueur",
    ingredients: "Distilled spirit and grape flavoring",
    origin: "United States (Louisville, Kentucky)",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Brand Grape miniature, 50 mL."
  },
  "99-brand-strawberries-liqueur-50ml": {
    badge: "STRAWBERRY-FLAVORED LIQUEUR",
    eyebrow: "STRAWBERRY-FLAVORED LIQUEUR",
    title: "99 Strawberries Liqueur - 50 mL",
    subtitle: "99 STRAWBERRIES 50ML",
    price: "$0.99",
    style: "Strawberry-flavored liqueur",
    ingredients: "Distilled spirit and strawberry flavoring",
    origin: "United States (Louisville, Kentucky)",
    abv: "49.5% ABV",
    volume: "50 ml",
    description: "99 Brand Strawberry miniature, 50 mL."
  },
  "adictivo-tequila-anejo-750ml": {
    badge: "AÑEJO TEQUILA",
    eyebrow: "AÑEJO TEQUILA",
    title: "Adictivo Añejo Tequila - 750 mL",
    subtitle: "ADDICTIVO TEQ ANEJO 750ML",
    price: "$69.99",
    style: "Añejo tequila",
    ingredients: "100% blue agave",
    origin: "Mexico (El Arenal, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "750 mL. French oak maturation with toasted aromas."
  },
  "olmeca-altos-tequila-anejo-750ml": {
    badge: "AÑEJO TEQUILA",
    eyebrow: "AÑEJO TEQUILA",
    title: "Olmeca Altos Añejo Tequila - 750 mL",
    subtitle: "ALTOS ANEJO TEQ750ML",
    price: "$34.99",
    style: "Añejo tequila",
    ingredients: "100% blue agave",
    origin: "Mexico (Los Altos, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Olmeca Altos Añejo, 750 mL. Aged at least 12 months in bourbon barrels."
  },
  "olmeca-altos-tequila-plata-750ml": {
    badge: "BLANCO (PLATA) TEQUILA",
    eyebrow: "BLANCO (PLATA) TEQUILA",
    title: "Olmeca Altos Plata Tequila - 750 mL",
    subtitle: "ALTOS PLATA TEQ750ML",
    price: "$29.99",
    style: "Blanco (plata) tequila",
    ingredients: "100% blue agave",
    origin: "Mexico (Los Altos, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Olmeca Altos Plata, 750 mL. Unaged with cooked agave and citrus notes."
  },
  "olmeca-altos-tequila-reposado-750ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "Olmeca Altos Reposado Tequila - 750 mL",
    subtitle: "ALTOS REPO TEQ750ML",
    price: "$29.99",
    style: "Reposado tequila",
    ingredients: "100% blue agave",
    origin: "Mexico (Los Altos, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Olmeca Altos Reposado, 750 mL. Bourbon-barrel aged with cooked agave and oak notes."
  },
  "asombroso-la-rosa-reposado-tequila-750ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "AsomBroso La Rosa Reposado Tequila - 750 mL",
    subtitle: "ASOMBROSO ULTRAFINO REPO750ML",
    price: "$44.99",
    style: "Reposado tequila",
    ingredients: "100% blue Weber agave",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "AsomBroso La Rosa Reposado 750 mL. Rested in French oak Bordeaux wine barrels, which impart a pink tint."
  },
  "adictivo-tequila-reposado-750ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "Adictivo Reposado Tequila - 750 mL",
    subtitle: "ADICTIVO TEQ REPO 750ML",
    price: "$58.99",
    style: "Reposado tequila",
    ingredients: "100% blue agave",
    origin: "Mexico (El Arenal, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "750 mL. French oak maturation with cooked agave and wood aromas."
  },
  "arette-artesanal-suave-anejo-tequila-750ml": {
    badge: "AÑEJO TEQUILA",
    eyebrow: "AÑEJO TEQUILA",
    title: "Arette Artesanal Añejo Tequila - 750 mL",
    subtitle: "ARETTE ARTESANAL ANEJO750ML",
    price: "$94.99",
    style: "Añejo tequila",
    ingredients: "100% blue Weber agave",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Arette Artesanal Suave Añejo 750 mL, aged in oak."
  },
  "alma-del-jaguar-tequila-anejo-750ml": {
    badge: "AÑEJO TEQUILA",
    eyebrow: "AÑEJO TEQUILA",
    title: "Alma del Jaguar Añejo Tequila - 750 mL",
    subtitle: "ALMA DEL JAGUAR A EJO TEQ 750 ML",
    price: "$83.99",
    style: "Añejo tequila",
    ingredients: "100% blue agave, water and yeast",
    origin: "Mexico (Los Altos, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Regular Añejo, 750 mL. Bottled unfiltered at the source."
  },
  "alma-del-jaguar-tequila-blanco-750ml": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "Alma del Jaguar Blanco Tequila - 750 mL",
    subtitle: "ALMA DEL JAGUAR BLANCO750ML",
    price: "$49.99",
    style: "Blanco tequila",
    ingredients: "100% blue agave, water and yeast",
    origin: "Mexico (Los Altos, Jalisco)",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Blanco, 750 mL. Bottled unfiltered at the source."
  },
  "amatitena-tequila-reposado-750ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "Amatitena Reposado Tequila - 750 mL",
    subtitle: "AMATITENA TEQ RESOPADO750ML",
    price: "$84.99",
    style: "Reposado tequila",
    ingredients: "100% blue agave",
    origin: "Mexico (Amatitán, Jalisco)",
    abv: "42% ABV",
    volume: "750 ml",
    description: "Amatiteña Reposado, 750 mL export bottle. Producer sheet matches the UPC and 42% ABV."
  },
  "arette-artesanal-suave-blanco-tequila-750ml": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "Arette Artesanal Suave Blanco Tequila - 750 mL",
    subtitle: "ARETTE TEQ BLANCO750ML",
    price: "$54.99",
    style: "Blanco tequila",
    ingredients: "100% blue Weber agave",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Arette Artesanal Suave Blanco 750 mL. UPC distinguishes this from Clásica."
  },
  "arette-reposado-tequila-1l": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "Arette Reposado Tequila - 1 L",
    subtitle: "ARETTE TEQ REPO 1L",
    price: "$31.99",
    style: "Reposado tequila",
    ingredients: "100% blue Weber agave",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV",
    volume: "1.0 L",
    description: "Arette Clásica Reposado 1 L, rested in oak. This is the Clásica 1 L release."
  },
  "artenom-seleccion-1579-blanco-tequila-750ml": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "ArteNOM Selección 1579 Blanco Tequila - 750 mL",
    subtitle: "ARTE NOM 1579 750ML",
    price: "$60.99",
    style: "Blanco tequila",
    ingredients: "100% highland blue Weber agave",
    origin: "Jesús María, Jalisco, Mexico",
    abv: "40.7% ABV",
    volume: "750 ml",
    description: "ArteNOM Selección de 1579, made at Destilería El Pandillo. Maine lists 81.4 proof for this UPC."
  },
  "arette-blanco-tequila-1l": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "Arette Blanco Tequila - 1 L",
    subtitle: "ARETTE TEQ BLANCO 1L",
    price: "$31.99",
    style: "Blanco tequila",
    ingredients: "100% blue Weber agave",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV",
    volume: "1.0 L",
    description: "Arette Clásica Blanco 1 L, 80 proof."
  },
  "arette-artesanal-suave-reposado-tequila-750ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "Arette Artesanal Suave Reposado Tequila - 750 mL",
    subtitle: "ARETTE TEQ REPO750ML",
    price: "$62.99",
    style: "Reposado tequila",
    ingredients: "100% blue Weber agave",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Arette Artesanal Suave Reposado 750 mL, rested in oak. UPC distinguishes this from Clásica."
  },
  "100-anos-tequila-reposado-750ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "100 Años Reposado Tequila - 750 mL",
    subtitle: "100 ANOS REPO 750ML",
    price: "$22.99",
    style: "Reposado tequila",
    ingredients: "Agave-based tequila",
    origin: "Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "100 Años Reposado, 750 mL. NC ABC lists this UPC at 80 proof."
  },
  "4-copas-organic-blanco-tequila-750ml": {
    badge: "ORGANIC BLANCO TEQUILA",
    eyebrow: "ORGANIC BLANCO TEQUILA",
    title: "4 Copas Blanco Tequila - 750 mL",
    subtitle: "4 COPAS TEQ BLANCO750ML",
    price: "$52.99",
    style: "Organic blanco tequila",
    ingredients: "Organic blue agave",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Standard 80-proof Blanco expression. The brand also sells a separate high-proof expression."
  },
  "818-tequila-anejo-750ml": {
    badge: "AÑEJO TEQUILA",
    eyebrow: "AÑEJO TEQUILA",
    title: "818 Añejo Tequila - 750 mL",
    subtitle: "818TEQ ANEJO750ML",
    price: "$45.99",
    style: "Añejo tequila",
    ingredients: "Blue Weber agave",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "818 ages this expression for over one year in French and American oak."
  },
  "818-tequila-blanco-750ml": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "818 Blanco Tequila - 750 mL",
    subtitle: "818TEQ BLANCO750ML",
    price: "$29.99",
    style: "Blanco tequila",
    ingredients: "Blue Weber agave",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "818's unaged blanco expression."
  },
  "1800-tequila-blanco-375ml": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "1800 Blanco Tequila - 375 mL",
    subtitle: "1800 BLANCO 375ML",
    price: "$18.99",
    style: "Blanco tequila",
    ingredients: "Blue Weber agave, yeast, water",
    origin: "Mexico",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Double-distilled blanco tequila."
  },
  "1800-tequila-reposado-375ml": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "1800 Reposado Tequila - 375 mL",
    subtitle: "1800 REPOSADO 375ML",
    price: "$18.99",
    style: "Reposado tequila",
    ingredients: "Blue Weber agave",
    origin: "Mexico",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Oak-aged reposado tequila in the 375 mL bottle."
  },
  "knob-creek-smoked-maple": {
    badge: "FLAVORED BOURBON WHISKEY",
    eyebrow: "FLAVORED BOURBON WHISKEY",
    title: "Knob Creek Smoked Maple",
    subtitle: "KNOB CREEK SMOKE MAPLE 750ML",
    price: "$38.99",
    style: "Flavored bourbon whiskey",
    ingredients: "Bourbon whiskey, maple flavoring",
    origin: "Clermont, Kentucky, USA",
    abv: "45% ABV",
    volume: "750 ml",
    description: "Crafted in honor of Booker Noe, marrying full-bodied Kentucky straight bourbon with natural smoked maple sweetness and a hint of charred oak smoke."
  },
  "johnnie-walker-black-label": {
    badge: "BLENDED SCOTCH WHISKY",
    eyebrow: "BLENDED SCOTCH WHISKY",
    title: "Johnnie Walker Black Label",
    subtitle: "JOHNNIE WALKER BLACK LABEL 50ML",
    price: "$1.99",
    style: "Blended Scotch whisky",
    ingredients: "Malt and grain whiskies",
    origin: "Scotland, UK",
    abv: "40% ABV",
    volume: "50 ml",
    description: "Expertly blended from single malts matured for a minimum of 12 years across Scotland. Rich dark fruits, sweet vanilla, and signature peat smoke."
  },
  "makers-mark-bourbon": {
    badge: "BOURBON WHISKEY",
    eyebrow: "BOURBON WHISKEY",
    title: "Maker's Mark Kentucky Bourbon",
    subtitle: "MAKERS MARK BOURBON 750ML",
    price: "$29.99",
    style: "Bourbon whiskey",
    ingredients: "Corn, red winter wheat, malted barley",
    origin: "Loretto, Kentucky, USA",
    abv: "45% ABV",
    volume: "750 ml",
    description: "Distilled using soft red winter wheat instead of traditional rye for an exceptionally smooth, sweet, and approachable bourbon profile."
  },
  "jim-beam-devils-cut": {
    badge: "BOURBON WHISKEY",
    eyebrow: "BOURBON WHISKEY",
    title: "Jim Beam Devil's Cut",
    subtitle: "JIM BEAM DEVILS CUT 750ML",
    price: "$23.99",
    style: "Bourbon whiskey",
    ingredients: "Corn, rye, malted barley; barrel-extracted whiskey",
    origin: "Clermont, Kentucky, USA",
    abv: "45% ABV",
    volume: "750 ml",
    description: "Formulated using liquid extracted from the deep wood grain of used bourbon barrels, blending bold robust oak notes with rich caramel and vanilla."
  },
  "fireball-cinnamon-whisky": {
    badge: "CINNAMON WHISKY-BASED DRINK",
    eyebrow: "CINNAMON WHISKY-BASED DRINK",
    title: "Fireball Cinnamon Whisky",
    subtitle: "FIREBALL 1.75 L",
    price: "$28.99",
    style: "Cinnamon whisky-based drink",
    ingredients: "Canadian whisky, cinnamon flavoring, sweeteners",
    origin: "Canada; verify bottling",
    abv: "33% ABV",
    volume: "1.75 L",
    description: "Smooth Canadian whisky blended with real fiery cinnamon spice and sweetness. Bold, warming, and distinctly spicy from start to finish."
  },
  "blue-note-crossroads": {
    badge: "AMERICAN WHISKEY",
    eyebrow: "AMERICAN WHISKEY",
    title: "Blue Note Crossroads",
    subtitle: "BLUE NOTE CROSSROADS WHISKEY 750ML",
    price: "$44.99",
    style: "American whiskey",
    ingredients: "Corn and other grains; finished in toasted French oak",
    origin: "Memphis, Tennessee, USA",
    abv: "50% ABV",
    volume: "750 ml",
    description: "Crafted in Memphis, finished with toasted French oak staves for a velvety profile bursting with dark plum, toasted almond, and charred butterscotch."
  },
  "woodford-reserve-select": {
    badge: "BOURBON WHISKEY",
    eyebrow: "BOURBON WHISKEY",
    title: "Woodford Reserve Select",
    subtitle: "WOODFORD RESERVE 750ML",
    price: "$34.99",
    style: "Bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Versailles, Kentucky, USA",
    abv: "45.2% ABV",
    volume: "750 ml",
    description: "Distilled in historic copper pot stills and aged in handcrafted barrels. Rich, rounded, and smooth with citrus, cinnamon, cocoa, and toffee."
  },
  "jack-daniels-old-no7": {
    badge: "TENNESSEE WHISKEY",
    eyebrow: "TENNESSEE WHISKEY",
    title: "Jack Daniel's Old No. 7",
    subtitle: "JACK DANIELS SOUR MASH WHISKEY 750ML",
    price: "$24.99",
    style: "Tennessee whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Lynchburg, Tennessee, USA",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Mellowed drop by drop through ten feet of sugar maple charcoal, then matured in handcrafted white oak barrels for classic caramel, vanilla, and toasted oak."
  },
  "bulleit-rye-12-year": {
    badge: "RYE WHISKEY",
    eyebrow: "RYE WHISKEY",
    title: "Bulleit 95 Straight Rye",
    subtitle: "BULLEIT RYE 750ML",
    price: "$26.99",
    style: "Rye whiskey",
    ingredients: "Rye, corn, malted barley",
    origin: "Kentucky, USA",
    abv: "45% ABV",
    volume: "750 ml",
    description: "Distilled with an unprecedented 95% rye mash bill for an extraordinarily bold, spicy character with hints of vanilla, honey, and crisp pepper."
  },
  "jameson-triple-distilled": {
    badge: "IRISH BLENDED WHISKEY",
    eyebrow: "IRISH BLENDED WHISKEY",
    title: "Jameson Irish Whiskey",
    subtitle: "JAMESON TRIPLKE DISTILL 750ML",
    price: "$26.99",
    style: "Irish blended whiskey",
    ingredients: "Malted and unmalted barley, maize",
    origin: "Midleton, County Cork, Ireland",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Triple-distilled for exceptional smoothness and aged in seasoned oak casks for a perfect balance of spicy, nutty, and vanilla notes with sweet sherry."
  },
  "crown-royal-kc-edition": {
    badge: "CANADIAN BLENDED WHISKY",
    eyebrow: "CANADIAN BLENDED WHISKY",
    title: "Crown Royal Fine De Luxe",
    subtitle: "CROWN ROYAL KC LIMITED EDITION 750 ML",
    price: "$24.99",
    style: "Canadian blended whisky",
    ingredients: "Grain whiskies, water",
    origin: "Canada",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Blended from fifty select Canadian whiskies and matured to peak perfection. Rich, velvety, and luxurious with oak, vanilla, and dried fruit."
  },
  "elijah-craig-1789-single-barrel": {
    badge: "SMALL BATCH BOURBON WHISKEY",
    eyebrow: "SMALL BATCH BOURBON WHISKEY",
    title: "Elijah Craig Small Batch",
    subtitle: "ELIJAH CRAIG 1789 750ML",
    price: "$32.99",
    style: "Small batch bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Bardstown, Kentucky, USA",
    abv: "47% ABV",
    volume: "750 ml",
    description: "Crafted in honor of the Father of Bourbon, patient-aged in charred white oak casks for exceptional balance, warm spice, and velvety depth."
  },
  "four-roses-bourbon": {
    badge: "BOURBON WHISKEY",
    eyebrow: "BOURBON WHISKEY",
    title: "Four Roses Bourbon",
    subtitle: "FOUR ROSES BOURBON 750ML",
    price: "$24.99",
    style: "Bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Lawrenceburg, Kentucky, USA",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Distilled with proprietary yeast cultures and high-rye mash bills. Gentle aromas of pear and floral accents mingling with soft spice and sweet honey."
  },
  "dewars-white-label": {
    badge: "BLENDED SCOTCH WHISKY",
    eyebrow: "BLENDED SCOTCH WHISKY",
    title: "Dewar's White Label",
    subtitle: "DEWARS WHITE LABEL 750ML",
    price: "$24.99",
    style: "Blended Scotch whisky",
    ingredients: "Malt and grain whiskies",
    origin: "Scotland, UK",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Double-aged in vintage oak casks for unmatched smoothness. Subtle honeyed sweetness, floral heather, and fresh green apple with clean oak."
  },
  "wild-turkey-101": {
    badge: "BOURBON WHISKEY",
    eyebrow: "BOURBON WHISKEY",
    title: "Wild Turkey 101 Bourbon",
    subtitle: "WILD TURKEY 101 BOURBON 750ML",
    price: "$24.99",
    style: "Bourbon whiskey",
    ingredients: "Corn, rye, malted barley",
    origin: "Lawrenceburg, Kentucky, USA",
    abv: "50.5% ABV",
    volume: "750 ml",
    description: "Aged in deep No. 4 'alligator' char barrels and bottled at authentic 101 proof. Explosive bursts of bold spice, toffee, cinnamon, and caramel."
  },
  "bacardi-rum-punch": {
    badge: "CARIBBEAN RUM COCKTAIL",
    eyebrow: "RUM COCKTAIL / FLAVORED RUM DRINK",
    title: "Bacardi Rum Punch",
    subtitle: "BACARDI RUM PUNCH 1.75L",
    price: "$15.99",
    style: "Rum cocktail / flavored rum drink",
    ingredients: "Rum, fruit flavorings; other ingredients vary",
    origin: "USA / Puerto Rico; verify exact product",
    abv: "Verify label",
    volume: "1.75 L",
    description: "Crafted with Bacardi superior rum, natural tropical citrus juices, and cane sugar. Ready-to-serve vibrant Caribbean cocktail for group gatherings."
  },
  "malibu-black": {
    badge: "COCONUT-FLAVORED RUM",
    eyebrow: "COCONUT-FLAVORED RUM",
    title: "Malibu Black",
    subtitle: "MALIBU BLACK RUM COCONUT 750ML",
    price: "$14.99",
    style: "Coconut-flavored rum",
    ingredients: "Caribbean rum, coconut flavorings",
    origin: "Barbados / Caribbean; verify bottling site",
    abv: "35% ABV",
    volume: "750 ml",
    description: "A higher proof blend of smooth dark Caribbean rum and real coconut flavor with a deeper, richer body and less sugary profile."
  },
  "absolut-vodka-swedish": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Absolut Vodka Original",
    subtitle: "ABSOLUT VODKA 750ML",
    price: "$20.99",
    style: "Vodka",
    ingredients: "Winter wheat, water",
    origin: "&#197;hus, Sweden",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Distilled hundreds of times in continuous copper distillation in Åhus. Rich, full-bodied and complex, yet smooth and mellow with distinct grain character."
  },
  "grey-goose-vodka": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Grey Goose Vodka",
    subtitle: "GREY GOOSE VODKA 750ML",
    price: "$29.99",
    style: "Vodka",
    ingredients: "Wheat, water",
    origin: "France",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Distilled in France using soft winter wheat from Picardy and pure spring water from Gensac-la-Pallue, naturally filtered through Champagne limestone."
  },
  "titos-handmade-vodka": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Tito's Handmade Vodka",
    subtitle: "TITO'S VODKA 750ML",
    price: "$19.99",
    style: "Vodka",
    ingredients: "Corn, water",
    origin: "Austin, Texas, USA",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Batch-distilled six times in old-fashioned copper pot stills. Naturally gluten-free, exceptionally clean and soft with a sweet corn finish."
  },
  "smirnoff-no21-vodka": {
    badge: "VODKA",
    eyebrow: "VODKA",
    title: "Smirnoff No. 21 Vodka",
    subtitle: "SMIRNOFF1.75",
    price: "$19.99",
    style: "Vodka",
    ingredients: "Grain-based neutral spirits, water",
    origin: "USA; exact plant varies",
    abv: "40% ABV",
    volume: "1.75 L",
    description: "Triple distilled and ten times filtered through seven columns of environmentally sustainable charcoal for remarkable purity and smooth clarity."
  },
  "apothic-inferno-red-wine": {
    badge: "RED WINE (BARREL-AGED BLEND)",
    eyebrow: "RED WINE (BARREL-AGED BLEND)",
    title: "Apothic Inferno Red Wine",
    subtitle: "APOTHIC INFERNO 750ML",
    price: "$13.99",
    style: "Red wine (barrel-aged blend)",
    ingredients: "Grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "Varies; verify label",
    volume: "750 ml",
    description: "A bold, dark red blend aged for 60 days in charred white oak whiskey barrels. Rich notes of dark red fruits, maple, toasted oak, and spicy bourbon warmth."
  },
  "kendall-jackson-chardonnay": {
    badge: "WINE (VARIETAL UNSPECIFIED)",
    eyebrow: "WINE (VARIETAL UNSPECIFIED)",
    title: "Kendall-Jackson Chardonnay",
    subtitle: "KENDALL JACKSON  VINTERS RSRV 750ML",
    price: "$21.99",
    style: "Wine (varietal unspecified)",
    ingredients: "Grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "Verify exact varietal and label",
    volume: "750 ml",
    description: "Handcrafted from cool coastal vineyards. Tropical flavors of pineapple, mango, and papaya with citrus notes, rounded with toasted oak and butter."
  },
  "bota-box-california-3l": {
    badge: "PREMIUM BOX WINE",
    eyebrow: "BOXED WINE (VARIETAL UNSPECIFIED)",
    title: "Bota Box California Red",
    subtitle: "BOTA BOX",
    price: "$17.99",
    style: "Boxed wine (varietal unspecified)",
    ingredients: "Grapes, yeast; sulfites",
    origin: "USA; verify variety",
    abv: "Verify exact product",
    volume: "3 Liters (Box)",
    description: "Award-winning California red wine packaged in 100% recyclable carton with stay-fresh tap. Rich blackberry, cherry, and vanilla oak."
  },
  "sutter-home-rose": {
    badge: "WINE (VARIETAL UNSPECIFIED)",
    eyebrow: "WINE (VARIETAL UNSPECIFIED)",
    title: "Sutter Home Rose",
    subtitle: "SUTTER HOME 750ML",
    price: "$6.99",
    style: "Wine (varietal unspecified)",
    ingredients: "Grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "Verify exact varietal and label",
    volume: "750 ml",
    description: "Delicate pink hue with sweet strawberry, watermelon, and light floral aromas. Crisp, refreshing acidity with a pleasantly soft, fruity finish."
  },
  "yellow-tail-shiraz": {
    badge: "RED WINE (SHIRAZ)",
    eyebrow: "RED WINE (SHIRAZ)",
    title: "[yellow tail] Shiraz",
    subtitle: "YELLOW TAIL SHIRAZ 1.5L",
    price: "$12.99",
    style: "Red wine (Shiraz)",
    ingredients: "Shiraz grapes, yeast; sulfites",
    origin: "South Eastern Australia",
    abv: "Varies; verify label",
    volume: "1.5 L",
    description: "Vibrant and mouth-filling with aromas of ripe red berries, sweet mocha, and subtle spice. Soft tannins with a generous, lingering fruit finish."
  },
  "barefoot-on-tap-moscato": {
    badge: "MOSCATO WINE (BOXED)",
    eyebrow: "MOSCATO WINE (BOXED)",
    title: "Barefoot On Tap Moscato",
    subtitle: "BAREFOOT ON TAP MOSCATO 3L",
    price: "$18.99",
    style: "Moscato wine (boxed)",
    ingredients: "Moscato grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "Varies; verify label",
    volume: "3 Liters (Box)",
    description: "Deliciously sweet with luscious aromas of white peaches and juicy Mandarin oranges, leading into a crisp, refreshing, citrus-kissed finish."
  },
  "meiomi-pinot-noir": {
    badge: "RED WINE (PINOT NOIR)",
    eyebrow: "RED WINE (PINOT NOIR)",
    title: "Meiomi Pinot Noir",
    subtitle: "MEIOMI PINOT NOIR 750ML",
    price: "$22.99",
    style: "Red wine (Pinot Noir)",
    ingredients: "Pinot Noir grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "Varies; verify label",
    volume: "750 ml",
    description: "Blended from California's three finest coastal growing regions. Rich dark berry and jammy aromas with boysenberry, blackberry, mocha, and toasted oak."
  },
  "josh-cellars-cabernet": {
    badge: "RED WINE (CABERNET SAUVIGNON)",
    eyebrow: "RED WINE (CABERNET SAUVIGNON)",
    title: "Josh Cellars Cabernet Sauvignon",
    subtitle: "JOSH  CELLARS  CABERNET 750ML",
    price: "$14.99",
    style: "Red wine (Cabernet Sauvignon)",
    ingredients: "Cabernet Sauvignon grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "Varies; verify label",
    volume: "750 ml",
    description: "Round and juicy with aromas of black currant, dark cherry, and cedar. Flavors of ripe plum, toasted vanilla, and hazelnut with a firm, velvety finish."
  },
  "sauza-tequila-gold": {
    badge: "GOLD TEQUILA",
    eyebrow: "GOLD TEQUILA",
    title: "Sauza Tequila Gold",
    subtitle: "SAUZA TEQ GOLD 50ML",
    price: "$0.99",
    style: "Gold tequila",
    ingredients: "Blue Weber agave and other permitted sugars; caramel coloring possible",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "50 ml",
    description: "Crafted in Tequila, Jalisco since 1873. Double distilled in traditional copper stills with fresh agave, sweet vanilla, and lightly toasted oak accents."
  },
  "espolon-tequila-blanco": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "Espolòn Tequila Blanco",
    subtitle: "ESPOLON BLANCO TEQ 80 750ML",
    price: "$29.99",
    style: "Blanco tequila",
    ingredients: "Blue Weber agave, water",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "750 ml",
    description: "Crafted in the Highlands of Jalisco. Crystal clear with delicate floral and tropical fruit notes, followed by crisp agave, lemon zest, and clean pepper finish."
  },
  "patron-reposado-tequila": {
    badge: "REPOSADO TEQUILA",
    eyebrow: "REPOSADO TEQUILA",
    title: "Patron Reposado Tequila",
    subtitle: "PATRON REPO 375ML",
    price: "$27.99",
    style: "Reposado tequila",
    ingredients: "Blue Weber agave, water",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Handcrafted from 100% Weber Blue Agave and aged in oak barrels for over two months. Fresh agave with light oak, citrus, honey, and floral vanilla."
  },
  "casamigos-tequila-blanco": {
    badge: "BLANCO TEQUILA",
    eyebrow: "BLANCO TEQUILA",
    title: "Casamigos Tequila Blanco",
    subtitle: "CASAMIGOS BLANCO 375ML",
    price: "$19.99",
    style: "Blanco tequila",
    ingredients: "Blue Weber agave, water",
    origin: "Jalisco, Mexico",
    abv: "40% ABV",
    volume: "375 ml",
    description: "Small-batch ultra-premium tequila made from hand-selected 100% Blue Weber Agaves. Crisp and clean with hints of citrus, vanilla, and sweet agave nectar."
  },
  "blue-moon-belgian-white": {
    badge: "BELGIAN-STYLE WHEAT ALE",
    eyebrow: "BELGIAN-STYLE WHEAT ALE",
    title: "Blue Moon Belgian White",
    subtitle: "BLUE MOON 12PK BTL 12OZ",
    price: "$18.99",
    style: "Belgian-style wheat ale",
    ingredients: "Water, wheat, barley malt, oats, orange peel, coriander, hops, yeast",
    origin: "USA",
    abv: "5.4% ABV",
    volume: "12-Pack (12 oz Bottles)",
    description: "Brewed with Valencia orange peel for subtle sweetness and coriander for bright spicy herbal character. Unfiltered for a smooth creamy body."
  },
  "budweiser-king-of-beers": {
    badge: "AMERICAN LAGER BEER",
    eyebrow: "AMERICAN LAGER BEER",
    title: "Budweiser King of Beers",
    subtitle: "BUDWEISER 24PK CANS 160Z",
    price: "$28.99",
    style: "American lager beer",
    ingredients: "Water, barley malt, rice, hops, yeast",
    origin: "USA",
    abv: "5% ABV",
    volume: "24-Pack (16 oz Cans)",
    description: "Brewed using beechwood aging for 30 days to produce a clean, crisp, and exceptionally refreshing finish that has stood the test of time since 1876."
  },
  "bud-light": {
    badge: "LIGHT LAGER BEER",
    eyebrow: "LIGHT LAGER BEER",
    title: "Bud Light",
    subtitle: "BUD LIGHT 12PK CANS 12OZ",
    price: "$14.99",
    style: "Light lager beer",
    ingredients: "Water, barley malt, rice, hops, yeast",
    origin: "USA",
    abv: "4.2% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "America's favorite light lager brewed with barley malt and rice for smooth drinkability, clean taste, and a fast, refreshing finish."
  },
  "miller-lite-pilsner": {
    badge: "LIGHT LAGER BEER",
    eyebrow: "LIGHT LAGER BEER",
    title: "Miller Lite",
    subtitle: "MILLER LITE ALUM 15PK BTL 16OZ",
    price: "$23.49",
    style: "Light lager beer",
    ingredients: "Water, barley malt, corn syrup used in brewing, hops, yeast",
    origin: "USA",
    abv: "4.2% ABV",
    volume: "15-Pack (16 oz Aluminum Bottles)",
    description: "Triple-hops brewed pilsner with genuine pilsner character, light golden clarity, and a crisp, clean malt sweetness."
  },
  "corona-extra": {
    badge: "MEXICAN LAGER BEER",
    eyebrow: "MEXICAN LAGER BEER",
    title: "Corona Extra",
    subtitle: "CORONA EXTRA 12PK BTL 12OZ",
    price: "$18.99",
    style: "Mexican lager beer",
    ingredients: "Water, barley malt, corn, hops, yeast",
    origin: "Mexico",
    abv: "4.6% ABV",
    volume: "12-Pack (12 oz Bottles)",
    description: "The world's most famous Mexican lager. Crisp, light, and wonderfully refreshing with fruit-honey aromas and a hint of malt."
  },
  "coors-light": {
    badge: "LIGHT LAGER BEER",
    eyebrow: "LIGHT LAGER BEER",
    title: "Coors Light",
    subtitle: "COORS LIGHT 24PK CANS 12OZ",
    price: "$25.99",
    style: "Light lager beer",
    ingredients: "Water, barley malt, corn syrup used in brewing, hops, yeast",
    origin: "USA",
    abv: "4.2% ABV",
    volume: "24-Pack (12 oz Cans)",
    description: "Cold-fermented and cold-filtered at the base of the Rocky Mountains for ice-cold crispness and unmistakable easy-drinking purity."
  },
  "michelob-ultra": {
    badge: "LIGHT LAGER BEER",
    eyebrow: "LIGHT LAGER BEER",
    title: "Michelob ULTRA",
    subtitle: "MICHELOB ULTRA 12PK CANS 12OZ",
    price: "$15.99",
    style: "Light lager beer",
    ingredients: "Water, barley malt, rice, hops, yeast",
    origin: "USA",
    abv: "4.2% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "A superior light beer brewed for those who understand that it's only worth it if you enjoy it. 95 calories, 2.6g carbs, crisp and refreshing."
  },
  "guinness-extra-stout": {
    badge: "IRISH EXTRA STOUT BEER",
    eyebrow: "IRISH EXTRA STOUT BEER",
    title: "Guinness Extra Stout",
    subtitle: "GUINNESS EXTRA STOUT 6PK BTL 11.2OZ",
    price: "$9.99",
    style: "Irish extra stout beer",
    ingredients: "Water, barley malt, roasted barley, hops, yeast",
    origin: "Ireland / other licensed site; verify package",
    abv: "5.6% ABV",
    volume: "6-Pack (11.2 oz Bottles)",
    description: "Based on a recipe dating back to 1821. Crisp dark character with deep roasted coffee notes, dark chocolate bitterness, and a dry creamy finish."
  },
  "dos-equis-xx-lager": {
    badge: "MEXICAN LAGER BEER",
    eyebrow: "MEXICAN LAGER BEER",
    title: "Dos Equis XX Lager",
    subtitle: "DOS EQUIS LAGER 12PK CANS 12OZ",
    price: "$16.49",
    style: "Mexican lager beer",
    ingredients: "Water, barley malt, adjunct grains, hops, yeast",
    origin: "Mexico",
    abv: "4.2% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "A golden lager brewed with brewing traditions dating to 1897. Crisp malt character with a clean, refreshing balance and subtle earthy notes."
  },
  "modelo-especial": {
    badge: "MEXICAN LAGER BEER",
    eyebrow: "MEXICAN LAGER BEER",
    title: "Modelo Especial",
    subtitle: "MODELO ESPECIAL 24PK CANS 12OZ",
    price: "$30.99",
    style: "Mexican lager beer",
    ingredients: "Water, barley malt, corn adjuncts, hops, yeast",
    origin: "Mexico",
    abv: "4.4% ABV",
    volume: "24-Pack (12 oz Cans)",
    description: "A rich, full-flavored pilsner-style Mexican lager with a clean, crisp finish, brewed with orange blossom honey and select toasted malts."
  },
  "stella-artois-lager": {
    badge: "BELGIAN-STYLE PILSNER BEER",
    eyebrow: "BELGIAN-STYLE PILSNER BEER",
    title: "Stella Artois",
    subtitle: "STELLA ARTOIS 12 PK CAN",
    price: "$15.99",
    style: "Belgian-style pilsner beer",
    ingredients: "Water, barley malt, hops, yeast",
    origin: "USA / Belgium; verify package",
    abv: "5% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "Brewed with Saaz hops and 600 years of brewing heritage in Leuven. Floral hop aroma, balanced malt sweetness, and a crisp bitter finish."
  },
  "heineken-original-lager": {
    badge: "DUTCH LAGER BEER",
    eyebrow: "DUTCH LAGER BEER",
    title: "HEINEKEN 18PK CAN 12OZ",
    subtitle: "HEINEKEN 12PK CANS 12OZ",
    price: "$17.99",
    style: "Dutch lager beer",
    ingredients: "Water, barley malt, hops, yeast",
    origin: "Netherlands; verify US-market package",
    abv: "5% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "Authentic Dutch lager beer sourced from Netherlands; verify US-market package. Available in-store at Whiskey Barrel."
  },
  "victoria-cerveza-12pack": {
    badge: "CERVEZA DE MEXICO",
    eyebrow: "MEXICAN VIENNA-STYLE LAGER",
    title: "Victoria Cerveza",
    subtitle: "VICTORIA 12PK BTL 12OZ",
    price: "$18.99",
    style: "Mexican Vienna-style lager beer",
    ingredients: "Water, barley malt, non-malted cereals, hops",
    origin: "Mexico",
    abv: "4.0% ABV",
    volume: "12-Pack (12 oz Bottles)",
    description: "Mexico's oldest beer brand brewed since 1865. An ultra-refreshing Vienna-style amber lager with light-to-medium body, toasted malt sweetness, and a crisp, clean finish."
  },
  "busch-light-30pack": {
    badge: "COLD REFRESHMENT",
    eyebrow: "AMERICAN LIGHT LAGER",
    title: "Busch Light",
    subtitle: "BUSCH LIGHT 30PK CAN 12OZ",
    price: "$29.99",
    style: "American light lager beer",
    ingredients: "Water, barley malt, cereal grains, hops, yeast",
    origin: "USA",
    abv: "4.1% ABV",
    volume: "30-Pack (12 oz Cans)",
    description: "Brewed with the finest ingredients and cold-filtered for an exceptionally clean, crisp, and refreshing taste with easy drinkability in a 30-can pack."
  },
  "yuengling-traditional-lager-12pack": {
    badge: "AMERICA'S OLDEST BREWERY",
    eyebrow: "TRADITIONAL AMBER LAGER",
    title: "Yuengling Traditional Lager",
    subtitle: "YUENGLING LAGER 12PK CANS 12OZ",
    price: "$15.99",
    style: "American amber lager beer",
    ingredients: "Water, barley malt, corn, hops, yeast",
    origin: "Pottsville, Pennsylvania, USA",
    abv: "4.5% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "Crafted by America's Oldest Brewery since 1829. Famous for its rich amber color, medium body, subtle roasted caramel malt sweetness, and cluster and cascade hops."
  },
  "modelo-negra-especial-12pack": {
    badge: "CERVEZA ESPECIAL",
    eyebrow: "MUNICH DUNKEL MEXICAN DARK LAGER",
    title: "Modelo Negra Especial",
    subtitle: "MODELO NEGRA 12PK CANS 12OZ",
    price: "$17.99",
    style: "Munich Dunkel-style Mexican dark lager",
    ingredients: "Water, roasted barley malt, hops, yeast",
    origin: "Mexico",
    abv: "5.4% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "Brewed longer to enhance flavors of slow-roasted caramel malts, dark chocolate accents, and gentle sweetness balanced with a delightfully smooth, crisp pour."
  },
  "coors-banquet-12pack": {
    badge: "GOLDEN COLORADO",
    eyebrow: "THE ORIGINAL GOLDEN LAGER",
    title: "Coors Banquet",
    subtitle: "COORS BANQUET 12PK CANS 12OZ",
    price: "$15.99",
    style: "American golden lager beer",
    ingredients: "Rocky Mountain water, Moravian barley, hops, yeast",
    origin: "Golden, Colorado, USA",
    abv: "5.0% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "The Original Coors brewed exclusively in Golden, Colorado with 100% Rocky Mountain water and high country Moravian barley since 1873. Full-flavored, bright, and refreshing."
  },
  "smirnoff-ice-neon-lemonade-12pack": {
    badge: "PREMIUM MALT BEVERAGE",
    eyebrow: "FLAVORED MALT BEVERAGE",
    title: "Smirnoff Ice Neon Lemonade",
    subtitle: "SMIRNOFF ICE NEON LEMONADE 12PK CANS 12OZ",
    price: "$16.99",
    style: "Flavored malt beverage",
    ingredients: "Filtered water, alcohol from malt, natural flavors, real fruit juice",
    origin: "USA",
    abv: "4.5% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "A vibrant variety pack of crisp Smirnoff Ice Neon Lemonades featuring 4 bold flavors: Original Lemonade, Strawberry Lemonade, Peach Lemonade, and Blue Raspberry Lemonade in a 12-can pack."
  },
  "truly-hard-seltzer-citrus-12pack": {
    badge: "HARD SELTZER",
    eyebrow: "SPIKED SPARKLING WATER",
    title: "Truly Hard Seltzer Citrus Variety",
    subtitle: "TRULY CITRUS VARIETY 12PK CANS 12OZ",
    price: "$15.99",
    style: "Spiked sparkling water",
    ingredients: "Filtered water, alcohol from cane sugar, natural flavors, cane sugar, citric acid, sodium citrate",
    origin: "USA",
    abv: "5.0% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "Crisp, clean, and endlessly refreshing with 100 calories and only 1g sugar. Features four bright citrus flavors: Lime, Lemon, Grapefruit, and Citrus Squeeze in a 12-can pack."
  },
  "mikes-harder-party-pack-12pack": {
    badge: "HARD LEMONADE",
    eyebrow: "PREMIUM FLAVORED MALT BEVERAGE",
    title: "Mike's Harder Party Variety Pack",
    subtitle: "MIKES HARDER 12PK CAN 12OZ",
    price: "$18.49",
    style: "Flavored malt beverage",
    ingredients: "Purified water, malt base, real lemon juice concentrate, natural flavors",
    origin: "USA",
    abv: "8.0% ABV",
    volume: "12-Pack (12 oz Cans)",
    description: "An intense, bold flavor punch at 8% ABV. Features 4 fan-favorite party flavors: Original Lemonade, Black Cherry, Cranberry, and Mango in a premium 12-can pack."
  },
  "josh-cellars-chardonnay": {
    badge: "CALIFORNIA CHARDONNAY",
    eyebrow: "CALIFORNIA CHARDONNAY",
    title: "Josh Cellars Chardonnay",
    subtitle: "JOSH CELLARS CHARD 750ML",
    price: "$14.99",
    style: "White wine (Chardonnay)",
    ingredients: "Chardonnay grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "13.5% ABV",
    volume: "750 ml",
    description: "Crafted from premium California vineyards, bursting with aromas of bright citrus and honey, balanced by gentle oak and lush vanilla on the palate."
  },
  "bota-box-pinot-grigio-3l": {
    badge: "BOXED PINOT GRIGIO",
    eyebrow: "PREMIUM CALIFORNIA BOXED WINE",
    title: "Bota Box Pinot Grigio 3L",
    subtitle: "BOTA BOX P GRIGIO 3L",
    price: "$17.99",
    style: "White wine (Pinot Grigio boxed)",
    ingredients: "Pinot Grigio grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "12% ABV",
    volume: "3 Liters (Box)",
    description: "Light and crisp with lively aromas of white peach, nectarine, and floral citrus. Eco-friendly premium box packaging keeps wine fresh for up to 30 days after opening."
  },
  "la-marca-prosecco-doc": {
    badge: "ITALIAN SPARKLING WINE",
    eyebrow: "PROSECCO D.O.C. SPARKLING WINE",
    title: "La Marca Prosecco D.O.C.",
    subtitle: "LAMARCA PROSECCO BLUE",
    price: "$17.99",
    style: "Italian sparkling wine (Prosecco D.O.C.)",
    ingredients: "Glera grapes, yeast; sulfites",
    origin: "Veneto, Italy",
    abv: "11% ABV",
    volume: "750 ml",
    description: "A delicate and luminous Italian sparkling wine with aromas of fresh citrus, honey, and white flowers. Crisp, clean, and effervescent with a refreshing finish."
  },
  "decoy-red-wine-duckhorn": {
    badge: "CALIFORNIA RED BLEND",
    eyebrow: "DUCKHORN PORTFOLIO RED WINE",
    title: "Decoy Red Wine Duckhorn Portfolio",
    subtitle: "DECOY RED BLEND 750ML",
    price: "$20.99",
    style: "Red wine (California red blend)",
    ingredients: "Cabernet Sauvignon, Merlot, Zinfandel, Petite Sirah grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "14.1% ABV",
    volume: "750 ml",
    description: "Crafted by the renowned Duckhorn winemaking team. A rich, alluring blend offering luscious blackberry, plum, and cocoa notes supported by silky tannins."
  },
  "barefoot-pinot-grigio": {
    badge: "CALIFORNIA PINOT GRIGIO",
    eyebrow: "CALIFORNIA PINOT GRIGIO",
    title: "Barefoot Pinot Grigio",
    subtitle: "BAREFOOT PINOT GRIGIO",
    price: "$7.99",
    style: "White wine (Pinot Grigio)",
    ingredients: "Pinot Grigio grapes, yeast; sulfites",
    origin: "Modesto, California, USA",
    abv: "12.5% ABV",
    volume: "750 ml",
    description: "Light-bodied, crisp, and delightfully fresh with vibrant notes of green apples, tart citrus, and juicy white peaches. Pairs seamlessly with light poultry and seafood."
  },
  "cupcake-vineyards-moscato": {
    badge: "SWEET WHITE WINE",
    eyebrow: "ITALIAN MOSCATO",
    title: "Cupcake Vineyards Moscato",
    subtitle: "CUPCAKE MOSCATO 750ML",
    price: "$10.99",
    style: "Sweet white wine (Moscato)",
    ingredients: "Moscato grapes, yeast; sulfites",
    origin: "Check bottle",
    abv: "9.5% ABV",
    volume: "750 ml",
    description: "Vibrantly sweet and delightfully floral with luscious notes of white peach, honeysuckle, and nectarine balanced by soft effervescence on the finish."
  },
  "apothic-red-winemakers-blend": {
    badge: "CALIFORNIA RED BLEND",
    eyebrow: "WINEMAKER'S BLEND 2022",
    title: "Apothic Red Winemaker's Blend",
    subtitle: "APOTHIC RED",
    price: "$10.99",
    style: "Red wine (California red blend)",
    ingredients: "Zinfandel, Syrah, Cabernet Sauvignon, Merlot grapes, yeast; sulfites",
    origin: "California, USA",
    abv: "13.5% ABV",
    volume: "750 ml",
    description: "A captivating master blend of Zinfandel, Syrah, Cabernet Sauvignon, and Merlot. Deep ruby color with intense flavors of black cherry, vanilla, and mocha spice."
  },
  "la-crema-sonoma-coast-chardonnay": {
    badge: "SONOMA COAST CHARDONNAY",
    eyebrow: "SONOMA COAST CHARDONNAY",
    title: "La Crema Sonoma Coast Chardonnay",
    subtitle: "LA CREMA CHARD 750ML",
    price: "$19.99",
    style: "White wine (Chardonnay)",
    ingredients: "Chardonnay grapes, yeast; sulfites",
    origin: "Sonoma Coast, California, USA",
    abv: "13.5% ABV",
    volume: "750 ml",
    description: "Cool-climate Sonoma Coast Chardonnay displaying Meyer lemon, yellow apple, and toasted brioche notes with rich minerality and a balanced, lingering finish."
  },
  "kim-crawford-sauvignon-blanc": {
    badge: "MARLBOROUGH SAUVIGNON BLANC",
    eyebrow: "MARLBOROUGH SAUVIGNON BLANC",
    title: "Kim Crawford Marlborough Sauvignon Blanc",
    subtitle: "KIM CRAWFORD SUV BLANC 750ML",
    price: "$15.99",
    style: "White wine (Sauvignon Blanc)",
    ingredients: "Sauvignon Blanc grapes, yeast; sulfites",
    origin: "Marlborough, New Zealand",
    abv: "13% ABV",
    volume: "750 ml",
    description: "World-famous Marlborough Sauvignon Blanc overflowing with aromas of passionfruit, fresh pink grapefruit, crushed herbs, and bright zesty acidity."
  }
,
  "ciroc-snap-frost-vodka": {
    badge: "FRENCH GRAPE VODKA",
    eyebrow: "5X DISTILLED FRENCH VODKA",
    title: "Cîroc Snap Frost Vodka",
    subtitle: "CIROC VODKA 750ML",
    price: "$37.99",
    style: "Grape-distilled vodka",
    ingredients: "French grapes (Mauzac Blanc & Ugni Blanc), water",
    origin: "Gaillac & Cognac, France",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Distilled exclusively from fine French grapes harvested at high altitudes. Five times distilled in historic copper pot stills for an exceptionally crisp, smooth, and citrus-bright profile."
  },
  "deep-eddy-vodka": {
    badge: "AUSTIN TEXAS CRAFT VODKA",
    eyebrow: "10X DISTILLED SMALL BATCH",
    title: "Deep Eddy Vodka",
    subtitle: "DEEP EDDY VODKA 750ML",
    price: "$17.99",
    style: "Small batch corn vodka",
    ingredients: "100% American corn, Texas spring water",
    origin: "Austin, Texas, USA",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Handcrafted in small batches in Austin, Texas. Column distilled 10 times in state-of-the-art continuous stills and charcoal filtered for unprecedented smoothness and a pure, clean finish."
  },
  "new-amsterdam-original-vodka": {
    badge: "AMERICAN 5X DISTILLED VODKA",
    eyebrow: "5X DISTILLED TRIPLE FILTERED",
    title: "New Amsterdam Original Vodka",
    subtitle: "NEW AMSTERDAM VODKA 750ML",
    price: "$13.99",
    style: "American grain vodka",
    ingredients: "Finest American grains, pure water",
    origin: "Modesto, California, USA",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Distilled five times from selected American grains and filtered three times through charcoal for an silky smooth mouthfeel with delicate citrus and fruit notes."
  },
  "high-noon-black-cherry-vodka-soda": {
    badge: "REAL VODKA & JUICE",
    eyebrow: "VODKA SODA WITH REAL JUICE",
    title: "High Noon Vodka Soda Black Cherry",
    subtitle: "HIGH NOON BLACK CHERRY VODKA SODA 355ML CAN",
    price: "$3.99",
    style: "Vodka soda with real fruit juice",
    ingredients: "Vodka, real fruit juice, sparkling water, natural flavors",
    origin: "Modesto, California, USA",
    abv: "4.5% ABV",
    volume: "355 ml (12 oz Can)",
    description: "Crafted with real vodka, sparkling water, and real fruit juice. Bursting with rich, juicy black cherry flavor at only 100 calories, gluten-free, with no added sugar."
  }
,
  "1800-tequila-blanco": {
    badge: "100% BLUE AGAVE BLANCO",
    eyebrow: "WORLD'S MOST AWARDED TEQUILA",
    title: "1800 Tequila Blanco",
    subtitle: "1800 TEQ BLANCO 750ML",
    price: "$30.99",
    style: "100% de agave blanco tequila",
    ingredients: "100% Blue Weber agave, pure spring water",
    origin: "Jalisco, Mexico",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Crafted from 100% Blue Weber Agave harvested at peak maturity in Jalisco, Mexico. Double distilled in copper pot stills for clean, delicate floral and citrus aromas with smooth agave sweetness and black pepper accents."
  },
  "jose-cuervo-especial-silver": {
    badge: "BLUE AGAVE SILVER TEQUILA",
    eyebrow: "MADE WITH BLUE AGAVE",
    title: "Jose Cuervo Especial Silver Tequila",
    subtitle: "JOSE CUERVO ESP SILVER 750ML",
    price: "$19.99",
    style: "Silver tequila",
    ingredients: "Blue Weber agave, cane distillate, water",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Master crafted at La Rojeña distillery in Jalisco, Mexico. Crisp, clean, and unaged silver tequila showcasing fresh blue agave, subtle hints of citrus, and a smooth, refreshing finish perfect for sipping or classic cocktails."
  },
  "hornitos-plata-tequila": {
    badge: "100% PURO DE AGAVE",
    eyebrow: "CASA SAUZA 100% PURO",
    title: "Hornitos Plata Tequila",
    subtitle: "HORNITOS PLATA750ML",
    price: "$29.99",
    style: "100% puro de agave plata tequila",
    ingredients: "100% Blue Weber agave, water",
    origin: "Tequila, Jalisco, Mexico",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Crafted by Casa Sauza in Jalisco using 100% pure Blue Weber agave. Gentle extraction and deep-pot distillation yield a lively herbal profile with fresh floral notes, balanced agave fruitiness, and a clean, zesty finish."
  },
  "cazadores-reposado-tequila": {
    badge: "HIGHLANDS 100% AGAVE REPOSADO",
    eyebrow: "100% DE AGAVE REPOSADO",
    title: "Cazadores Reposado Tequila",
    subtitle: "CAZADORES TEQ REPO750ML",
    price: "$28.99",
    style: "Reposado tequila",
    ingredients: "100% Highland Blue Weber agave, water",
    origin: "Los Altos de Jalisco, Mexico",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Born in the highlands of Los Altos de Jalisco from 100% Blue Agave. Aged up to one year in new American virgin oak barrels, developing a pale golden hue with aromas of vanilla, wood, and tropical fruit backed by smooth agave richness."
  }
,
  "basil-hayden-bourbon": {
    badge: "KENTUCKY STRAIGHT BOURBON",
    eyebrow: "HIGH RYE SMALL BATCH BOURBON",
    title: "Basil Hayden Kentucky Straight Bourbon",
    subtitle: "BASIL HAYDEN KENTUCKY BOURBON WHISKEY 750ML",
    price: "$41.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn, high-rye mash, malted barley, water",
    origin: "Clermont, Kentucky, USA",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Artfully aged in Kentucky with a trademark high-rye mashbill. Golden amber hue with aromas of spice, tea, and hints of peppermint, followed by gentle rye warmth and clean vanilla on the finish."
  },
  "michters-us1-small-batch": {
    badge: "US*1 SMALL BATCH BOURBON",
    eyebrow: "KENTUCKY STRAIGHT BOURBON",
    title: "Michter's US*1 Small Batch Bourbon",
    subtitle: "MICHTERS SML BATCH BOURBON 750ML",
    price: "$45.99",
    style: "Small batch bourbon whiskey",
    ingredients: "Selected grain mash bill, Kentucky limestone water",
    origin: "Louisville, Kentucky, USA",
    abv: "45.7% ABV (91.4 Proof)",
    volume: "750 ml",
    description: "Truly small batch Kentucky straight bourbon crafted in batches of no more than twenty barrels. Rich notes of dried fruit, candied pecans, rich vanilla, and warm baking spices."
  },
  "evan-williams-black-label": {
    badge: "KENTUCKY STRAIGHT BOURBON",
    eyebrow: "KENTUCKY'S 1ST DISTILLER SINCE 1783",
    title: "Evan Williams Kentucky Straight Bourbon",
    subtitle: "EVAN WILLIAMS 750ML",
    price: "$15.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn, rye, malted barley, limestone water",
    origin: "Bardstown, Kentucky, USA",
    abv: "43% ABV (86 Proof)",
    volume: "750 ml",
    description: "Named after Kentucky's first commercial distiller who began distilling along the Ohio River in 1783. Aged far longer than required by law, delivering deep vanilla, mint, and toasted oak."
  },
  "angels-envy-port-finish": {
    badge: "PORT WINE FINISHED BOURBON",
    eyebrow: "KENTUCKY STRAIGHT BOURBON WHISKEY",
    title: "Angel's Envy Bourbon Port Barrel Finish",
    subtitle: "ANGELS ENVY 750ML",
    price: "$49.99",
    style: "Port barrel finished bourbon whiskey",
    ingredients: "Corn, rye, malted barley, finished in ruby port casks",
    origin: "Louisville, Kentucky, USA",
    abv: "43.3% ABV (86.6 Proof)",
    volume: "750 ml",
    description: "Crafted in Louisville, Kentucky and finished in hand-selected ruby port wine casks for 3 to 6 months. Exceptional complexity with golden syrup, raisins, rich maple, and subtle dark chocolate."
  },
  "larceny-small-batch-bourbon": {
    badge: "SMALL BATCH WHEATED BOURBON",
    eyebrow: "92 PROOF WHEATED BOURBON",
    title: "Larceny Small Batch Wheated Bourbon",
    subtitle: "LARCENY VS SMLL BATCH KSBW 92 750ML",
    price: "$26.99",
    style: "Small batch wheated bourbon whiskey",
    ingredients: "Corn, wheat, malted barley, limestone water",
    origin: "Bardstown, Kentucky, USA",
    abv: "46% ABV (92 Proof)",
    volume: "750 ml",
    description: "Using wheat instead of rye as the secondary grain, Larceny delivers a velvety soft mouthfeel and luscious sweetness with notes of fresh baked bread, butterscotch, and honeyed oak."
  },
  "crown-royal-regal-apple": {
    badge: "CANADIAN BLENDED WHISKY",
    eyebrow: "INFUSED WITH REGAL GALA APPLES",
    title: "Crown Royal Regal Apple Flavored Whisky",
    subtitle: "CROWN ROYAL APPLE 750 ML",
    price: "$24.99",
    style: "Flavored Canadian blended whisky",
    ingredients: "Blended Canadian whisky, natural Regal Gala apple flavors",
    origin: "Gimli, Manitoba, Canada",
    abv: "35% ABV (70 Proof)",
    volume: "750 ml",
    description: "Masterfully blended Crown Royal Canadian whisky infused with crisp Regal Gala apples. A lively harmony of tart, crisp apple sweetness balanced with spicy notes of rich Canadian whisky."
  },
  "crown-royal-deluxe": {
    badge: "FINE DE LUXE CANADIAN WHISKY",
    eyebrow: "BLENDED CANADIAN WHISKY",
    title: "Crown Royal Fine De Luxe Canadian Whisky",
    subtitle: "CROWN ROYAL 750 ML",
    price: "$24.99",
    style: "Blended Canadian whisky",
    ingredients: "Corn, rye, wheat, malted barley",
    origin: "Gimli, Manitoba, Canada",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "The timeless standard of Canadian whisky excellence, originally created to celebrate King George VI's visit in 1939. Blend of 50 full-bodied whiskies aged to absolute perfection."
  },
  "jim-beam-white-label-175l": {
    badge: "KENTUCKY STRAIGHT BOURBON",
    eyebrow: "ESTD 1795 1.75 LITERS",
    title: "Jim Beam Kentucky Straight Bourbon 1.75L",
    subtitle: "JIM BEAM 1.75L",
    price: "$29.99",
    style: "Kentucky straight bourbon whiskey",
    ingredients: "Corn, rye, malted barley, water",
    origin: "Clermont, Kentucky, USA",
    abv: "40% ABV (80 Proof)",
    volume: "1.75 L",
    description: "The world's No. 1 Kentucky straight bourbon whiskey. Aged for 4 full years in newly charred American white oak barrels for classic vanilla sweetness and a gentle oak finish in a large 1.75L bottle."
  },
  "jack-daniels-tennessee-honey": {
    badge: "TENNESSEE HONEY LIQUEUR",
    eyebrow: "ORIGINAL RECIPE HONEY WHISKEY",
    title: "Jack Daniel's Tennessee Honey",
    subtitle: "JACK DANIELS TENNESSEE HONEY 750ML",
    price: "$26.99",
    style: "Honey whiskey liqueur",
    ingredients: "Old No. 7 Tennessee whiskey, proprietary honey liqueur",
    origin: "Lynchburg, Tennessee, USA",
    abv: "35% ABV (70 Proof)",
    volume: "750 ml",
    description: "A delicious blend of Jack Daniel's Old No. 7 Tennessee Whiskey and a proprietary honey liqueur of our own making, offering a taste that's unexpected and undeniably Jack."
  },
  "gentleman-jack-tennessee-whiskey": {
    badge: "DOUBLE MELLOWED TENNESSEE",
    eyebrow: "RARE DOUBLE CHARCOAL MELLOWED",
    title: "Gentleman Jack Double Mellowed Whiskey",
    subtitle: "JD GENTLEMAN JACK 750ML",
    price: "$29.99",
    style: "Double mellowed Tennessee whiskey",
    ingredients: "Corn, rye, malted barley, Cave Spring water",
    origin: "Lynchburg, Tennessee, USA",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Inspired by our founder, Gentleman Jack undergoes a second charcoal mellowing after aging to achieve unprecedented smoothness. Warm caramel, sweet vanilla, and delicate apple oak."
  },
  "old-forester-100-proof": {
    badge: "100 PROOF STRAIGHT BOURBON",
    eyebrow: "THE FIRST BOTTLED BOURBON ESTD 1870",
    title: "Old Forester 100 Proof Kentucky Bourbon",
    subtitle: "OLD FORESTER 100PROOF 750ML",
    price: "$22.99",
    style: "100 proof Kentucky straight bourbon whisky",
    ingredients: "72% corn, 18% rye, 10% malted barley",
    origin: "Louisville, Kentucky, USA",
    abv: "50% ABV (100 Proof)",
    volume: "750 ml",
    description: "Handcrafted using the time-honored recipe formulated in 1870. Bottled at 100 proof to maintain its full flavor profile: roasted coffee, ripe cherry, rich tobacco leaf, and charred oak."
  },
  "knob-creek-9-year-bourbon": {
    badge: "9 YEARS AGED 100 PROOF",
    eyebrow: "KENTUCKY STRAIGHT BOURBON 9 YRS",
    title: "Knob Creek 9 Year Small Batch Bourbon",
    subtitle: "KNOB CREEK 9YRS BOURBON 750ML",
    price: "$39.99",
    style: "9 year Kentucky straight bourbon whiskey",
    ingredients: "Corn, rye, malted barley, limestone water",
    origin: "Clermont, Kentucky, USA",
    abv: "50% ABV (100 Proof)",
    volume: "750 ml",
    description: "Patiently aged for a full 9 years in deeply charred American oak barrels and bottled at an honest 100 proof. Deep copper color with rich copper, maple sugar, toasted nuts, and long warm oak finish."
  },
  "rittenhouse-rye-bottled-in-bond": {
    badge: "BOTTLED-IN-BOND RYE",
    eyebrow: "100 PROOF STRAIGHT RYE WHISKY",
    title: "Rittenhouse Straight Rye Bottled-in-Bond",
    subtitle: "RITTENHOUSE 100PROOF RYE 750ML",
    price: "$24.99",
    style: "Bottled-in-Bond straight rye whisky",
    ingredients: "51% rye, 37% corn, 12% malted barley",
    origin: "Bardstown, Kentucky, USA",
    abv: "50% ABV (100 Proof)",
    volume: "750 ml",
    description: "Produced in the traditional Pennsylvania rye style, Bottled-in-Bond at 100 proof under strict U.S. government supervision. Exceptional spicy rye character, cocoa, citrus peel, and cinnamon oak."
  },
  "glenfiddich-14-bourbon-barrel": {
    badge: "SPEYSIDE SINGLE MALT 14 YRS",
    eyebrow: "OUR BOURBON BARREL RESERVE 14",
    title: "Glenfiddich 14 Year Bourbon Barrel Reserve",
    subtitle: "GLENFIDDICH SNGL MALT 14YRS 750ML",
    price: "$62.99",
    style: "Speyside single malt Scotch whisky",
    ingredients: "100% malted barley, natural spring water",
    origin: "Dufftown, Banffshire, Scotland",
    abv: "43% ABV (86 Proof)",
    volume: "750 ml",
    description: "Matured for 14 years in ex-bourbon American oak casks, then finished in deep-charred new American oak barrels crafted by the Kelvin Cooperage in Louisville, Kentucky. Ripe summer fruits, creamy toffee, and toasted oak."
  },
  "monkey-shoulder-scotch": {
    badge: "100% MALT BLENDED SCOTCH",
    eyebrow: "BATCH 27 ORIGINAL BLENDED MALT",
    title: "Monkey Shoulder Blended Malt Scotch",
    subtitle: "MONKEY SHOULDER 750ML",
    price: "$31.99",
    style: "Blended malt Scotch whisky",
    ingredients: "100% Speyside malted barley whiskies",
    origin: "Speyside, Scotland",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "A free-spirited, rich and smooth blended malt crafted from small batches of three of Speyside's finest single malt whiskies, married together in first-fill ex-bourbon casks. Zesty orange, vanilla, honey, and spiced oak."
  }
,
  "bushmills-original-irish-whiskey": {
    badge: "THE ORIGINAL IRISH WHISKEY",
    eyebrow: "TRIPLE DISTILLED SINCE 1608",
    title: "Bushmills The Original Irish Whiskey",
    subtitle: "BUSHMILLS THE ORIGINAL 750ML",
    price: "$28.99",
    style: "Triple distilled blended Irish whiskey",
    ingredients: "Irish malted barley, grain, pure spring water",
    origin: "Bushmills, County Antrim, Ireland",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "Crafted at Ireland's oldest licensed distillery (granted 1608). Combining triple-distilled single malt whiskey with a lighter grain whiskey, aged in American oak bourbon casks. Crisp and light with rich warming fruit, vanilla, and honey."
  },
  "chivas-regal-12-year-scotch": {
    badge: "AGED 12 YEARS BLENDED SCOTCH",
    eyebrow: "ESTABLISHED 1801 ABERDEEN",
    title: "Chivas Regal 12 Year Old Scotch",
    subtitle: "CHIVAS REGAL 12 AGED 1L",
    price: "$39.99",
    style: "12 year aged blended Scotch whisky",
    ingredients: "Speyside malt and grain whiskies, water",
    origin: "Keith, Moray, Scotland",
    abv: "40% ABV (80 Proof)",
    volume: "1 L",
    description: "An iconic blend of Strathisla single malts and smooth grain whiskies, each aged for a minimum of 12 years. Radiant, warm amber color with wild herbs, heather, honey, and orchard fruits."
  },
  "hennessy-vs-cognac": {
    badge: "MAISON FONDÉE EN 1765",
    eyebrow: "VERY SPECIAL FRENCH COGNAC",
    title: "Hennessy V.S Cognac",
    subtitle: "HENNESSY VS COGNAC 750ML",
    price: "$44.99",
    style: "French V.S Cognac",
    ingredients: "French grapes (Ugni Blanc), aged wine eau-de-vie, water",
    origin: "Cognac, Charente, France",
    abv: "40% ABV (80 Proof)",
    volume: "750 ml",
    description: "The world's most popular Cognac, crafted in Cognac, France since 1765. Masterfully blended from up to 40 eaux-de-vie matured in French Limousin oak barrels, offering rich aromas of toasted oak, roasted almond, and fresh grapes with a vibrant, warming finish."
  }
,
  "captain-morgan-original-spiced": {
    badge: "ORIGINAL SPICED RUM",
    eyebrow: "CARIBBEAN SPICED RUM",
    title: "Captain Morgan Original Spiced Rum",
    subtitle: "CAPTAIN MORGAN SPICED RUM 750ML",
    price: "$16.99",
    style: "Spiced Caribbean rum",
    ingredients: "Distilled cane molasses, indigenous spices, natural flavors",
    origin: "St. Croix, U.S. Virgin Islands",
    abv: "35% ABV (70 Proof)",
    volume: "750 ml",
    description: "The legendary Caribbean rum expertly blended with natural flavors and warming spices, then aged in charred white oak barrels. Rich vanilla, brown sugar, cinnamon, and subtle clove notes for a smooth, balanced finish."
  },
  "wild-turkey-american-honey-liqueur-175l": {
    badge: "BOURBON-BASED HONEY LIQUEUR",
    eyebrow: "BOURBON-BASED HONEY LIQUEUR",
    title: "Wild Turkey American Honey Liqueur 1.75L",
    subtitle: "AMERICAN HONEY 1.75L",
    price: "Available in Store",
    style: "Bourbon-based honey liqueur",
    ingredients: "Kentucky bourbon whiskey, honey",
    origin: "United States (Lawrenceburg, Kentucky)",
    abv: "35.5% ABV (71 Proof)",
    volume: "1.75 L",
    description: "Wild Turkey American Honey 1.75 L, 71 proof. Exceptionally smooth liqueur blended with pure honey and Kentucky bourbon whiskey."
  },
  "nocturne-handcrafted-botanical-gin": {
    badge: "CRAFT BOTANICAL GIN",
    eyebrow: "SMALL BATCH BOTANICAL GIN",
    title: "Nocturne Handcrafted Gin",
    subtitle: "NOCTURNE HANDCRAFTED BOTANICAL GIN 700ML",
    price: "$95.00",
    style: "Craft Botanical Gin",
    ingredients: "Juniper, citrus peel, wild lavender, cardamom",
    origin: "London, United Kingdom",
    abv: "43% ABV",
    volume: "700 ml",
    description: "Distilled with rare mountain juniper, citrus peel, wild lavender, and cardamom in an amber glass decanter."
  },
  "highland-mountain-juniper-gin": {
    badge: "SCOTTISH DRY GIN",
    eyebrow: "THE FORAGER'S EDITION",
    title: "Highland Mountain Juniper Gin",
    subtitle: "FOREST GATHERED GIN 700ML",
    price: "$78.00",
    style: "Scottish Dry Gin",
    ingredients: "Wild juniper berries, pine needles, heather, forest botanicals",
    origin: "Scotland",
    abv: "43% ABV",
    volume: "700 ml",
    description: "Crafted in the Scottish Highlands with hand-foraged heather, juniper berries, and pine needles."
  },
  "hendricks-gin-750ml": {
    badge: "SMALL BATCH SCOTTISH GIN",
    eyebrow: "INFUSED WITH CUCUMBER & ROSE",
    title: "Hendrick's Gin - 750 mL",
    subtitle: "HENDRICKS GIN750ML",
    price: "$34.99",
    style: "Gin",
    ingredients: "Neutral spirit, juniper, other botanicals, cucumber, rose",
    origin: "Girvan, Scotland",
    abv: "44% ABV (Label: 41.4% ABV)",
    volume: "750 ml",
    description: "Distillates from carter-head and pot stills are combined, then flavored with cucumber and rose. Distilled and bottled in Girvan, Scotland."
  },
  "tanqueray-london-dry-gin-750ml": {
    badge: "LONDON DRY GIN",
    eyebrow: "IMPORTED LONDON DRY GIN",
    title: "Tanqueray London Dry Gin - 750 mL",
    subtitle: "TANQUERAY GIN750ML",
    price: "$24.99",
    style: "London dry gin",
    ingredients: "Grain spirit, juniper, coriander, angelica root, licorice",
    origin: "United Kingdom",
    abv: "47.3% ABV (94.6 Proof)",
    volume: "750 ml",
    description: "The U.S. Original London Dry expression uses four core botanicals. Distilled four times and bottled in Great Britain."
  },
  "bombay-sapphire-london-dry-gin-750ml": {
    badge: "VAPOUR INFUSED LONDON DRY GIN",
    eyebrow: "FROM A 1761 RECIPE",
    title: "Bombay Sapphire London Dry Gin - 750 mL",
    subtitle: "BOMBAY SAPPHIRE GIN 750ML",
    price: "$27.99",
    style: "London dry gin",
    ingredients: "Neutral spirit, juniper, other botanicals",
    origin: "Hampshire, England, UK",
    abv: "47% ABV (94 Proof)",
    volume: "750 ml",
    description: "Botanicals are vapor-infused from a 1761 recipe. The U.S. expression can differ in strength from other markets."
  },
  "artigiano-bellini-mango-750ml": {
    badge: "READY-TO-DRINK WINE-BASED BELLINI",
    eyebrow: "READY-TO-DRINK COCKTAIL",
    title: "Artigiano Mango Bellini - 750 mL",
    subtitle: "ARTIGIANO BELLINI MANGO 750ML",
    price: "$10.99",
    style: "Ready-to-drink wine-based Bellini",
    ingredients: "White wine, fruit purée",
    origin: "Check bottle — conflicting sources",
    abv: "6% ABV",
    volume: "750 ml",
    description: "Producer Mango technical specification lists 6% ABV. The regulatory filing assigns this UPC to Peach at 5%, while Clover says Mango. Origin sources conflict between Spain and Germany. Confirm flavor, UPC, ABV and origin on the inventory bottle."
  },
  "artigiano-bellini-peach-750ml": {
    badge: "READY-TO-DRINK WINE-BASED BELLINI",
    eyebrow: "READY-TO-DRINK COCKTAIL",
    title: "Artigiano Peach Bellini - 750 mL",
    subtitle: "ARTIGIANO BELLINI PEACH 750ML",
    price: "$10.99",
    style: "Ready-to-drink wine-based Bellini",
    ingredients: "White wine, fruit purée",
    origin: "Check bottle — conflicting sources",
    abv: "6% ABV",
    volume: "750 ml",
    description: "Producer Peach technical specification lists 6% ABV. The regulatory filing assigns this UPC to Mango at 6%, while Clover says Peach. Technical sheets identify Germany and related brand metadata lists Spain. Confirm flavor, UPC and origin on the inventory bottle."
  },
  "artigiano-bellini-strawberry-750ml": {
    badge: "READY-TO-DRINK STRAWBERRY BELLINI",
    eyebrow: "READY-TO-DRINK COCKTAIL",
    title: "Artigiano Strawberry Bellini - 750 mL",
    subtitle: "ARTIGIANO BELLINI STRAWBERRY 750ML",
    price: "$10.99",
    style: "Ready-to-drink strawberry Bellini",
    ingredients: "White wine, strawberry purée",
    origin: "Spain (brand listing)",
    abv: "6% ABV",
    volume: "750 ml",
    description: "Producer Strawberry technical specification lists 6% ABV. The regulatory filing lists 5% for this UPC. Use 6% as the named-product reference and confirm the inventory bottle label."
  },
  "bacardi-island-punch-175l": {
    badge: "READY-TO-SERVE RUM COCKTAIL",
    eyebrow: "CHILL & ENJOY",
    title: "Bacardí Island Punch Rum Cocktail - 1.75 L",
    subtitle: "BACARDI ISLAND PUNCH 1.75L",
    price: "$15.99",
    style: "Ready-to-serve rum cocktail",
    ingredients: "BACARDÍ rum, pineapple juice and tropical flavorings",
    origin: "Check bottle — origin unverified",
    abv: "12.5% ABV",
    volume: "1.75 L",
    description: "Island Punch with guava, hibiscus, prickly pear and lime flavor notes. 1.75 L. Finished cocktail production site not verified. Retailer country fields conflict, so the country of the finished cocktail requires the package's origin statement."
  },
  "1800-ultimate-strawberry-margarita-175l": {
    badge: "READY-TO-DRINK MARGARITA",
    eyebrow: "READY TO SERVE",
    title: "1800 Ultimate Strawberry Margarita - 1.75 L",
    subtitle: "1800 ULT MARGAR STRAWBERRY 1.75L",
    price: "$20.99",
    style: "Ready-to-drink margarita",
    ingredients: "Tequila, strawberry flavoring",
    origin: "Lawrenceburg, Indiana, USA",
    abv: "9.95% ABV (19.9 Proof)",
    volume: "1.75 L",
    description: "Strawberry ready-to-serve margarita in the 1.75 L bottle. Back-label production statement identifies Proximo in Lawrenceburg, Indiana, USA."
  },
  "1800-ultimate-blood-orange-margarita-175l": {
    badge: "READY-TO-DRINK MARGARITA",
    eyebrow: "READY TO SERVE",
    title: "1800 Ultimate Blood Orange Margarita - 1.75 L",
    subtitle: "1800 BLOOD ORANGE MARG1.75L",
    price: "$20.99",
    style: "Ready-to-drink margarita",
    ingredients: "Tequila, blood orange flavoring",
    origin: "Lawrenceburg, Indiana, USA",
    abv: "9.95% ABV (19.9 Proof)",
    volume: "1.75 L",
    description: "Blood orange ready-to-serve margarita. NC ABC lists 19.9 proof for this UPC. Back-label production statement identifies Proximo in Lawrenceburg, Indiana, USA."
  },
  "1800-ultimate-pineapple-margarita-175l": {
    badge: "READY-TO-DRINK MARGARITA",
    eyebrow: "READY TO SERVE",
    title: "1800 Ultimate Pineapple Margarita - 1.75 L",
    subtitle: "1800 PINEAPPLE MARG 1.75L",
    price: "$20.99",
    style: "Ready-to-drink margarita",
    ingredients: "Tequila, pineapple flavoring",
    origin: "Lawrenceburg, Indiana, USA",
    abv: "9.95% ABV (19.9 Proof)",
    volume: "1.75 L",
    description: "Pineapple ready-to-serve margarita in the 1.75 L bottle. Back-label production statement identifies Proximo in Lawrenceburg, Indiana, USA."
  },
  "bartenders-hot-sex-cocktail-750ml": {
    badge: "READY-TO-DRINK VODKA CREAM COCKTAIL",
    eyebrow: "READY TO DRINK",
    title: "Bartenders Trading Co. Hot Sex Cocktail - 750 mL",
    subtitle: "BARTENDERS HOT SEX COCKTAIL 750ML",
    price: "$16.99",
    style: "Ready-to-drink vodka cream cocktail",
    ingredients: "Vodka, ginger liqueur, dairy cream, chocolate flavor and ginseng",
    origin: "United States",
    abv: "12.5% ABV (25 Proof)",
    volume: "750 ml",
    description: "Bartenders Trading Co. Hot Sex chocolate and ginger cocktail, listed at 25 proof by NC ABC. 750 mL."
  }
};

let quickViewCurrentIndex = 0;
let quickViewActiveList = [];

function getAllStoreProductsList() {
  return [
    ...(typeof WHISKEY_PRODUCTS !== "undefined" ? WHISKEY_PRODUCTS : []),
    ...(typeof RUM_PRODUCTS !== "undefined" ? RUM_PRODUCTS : []),
    ...(typeof BEER_PRODUCTS !== "undefined" ? BEER_PRODUCTS : []),
    ...(typeof VODKA_PRODUCTS !== "undefined" ? VODKA_PRODUCTS : []),
    ...(typeof WINE_PRODUCTS !== "undefined" ? WINE_PRODUCTS : []),
    ...(typeof GIN_PRODUCTS !== "undefined" ? GIN_PRODUCTS : []),
    ...(typeof TEQUILA_PRODUCTS !== "undefined" ? TEQUILA_PRODUCTS : []),
    ...(typeof READY_TO_ENJOY_PRODUCTS !== "undefined" ? READY_TO_ENJOY_PRODUCTS : []),
    ...(typeof CIGAR_PRODUCTS !== "undefined" ? CIGAR_PRODUCTS : [])
  ];
}

function openProductQuickView(handle, event) {
  if (event) {
    if (event.ctrlKey || event.metaKey || event.button === 1) return;
    event.preventDefault();
    event.stopPropagation();
  }

  // Determine active product list: currently rendered category list if defined and non-empty, else all products
  const activeProducts = (Array.isArray(window.activeCategoryProducts) && window.activeCategoryProducts.length > 0)
    ? window.activeCategoryProducts
    : getAllStoreProductsList();

  const idx = activeProducts.findIndex(p => p.node && p.node.handle === handle);
  if (idx !== -1) {
    quickViewActiveList = activeProducts;
    quickViewCurrentIndex = idx;
    showQuickViewModalForProduct(activeProducts[idx].node);
  } else {
    // Try finding in all products
    const all = getAllStoreProductsList();
    const fallbackIdx = all.findIndex(p => p.node && p.node.handle === handle);
    if (fallbackIdx !== -1) {
      quickViewActiveList = all;
      quickViewCurrentIndex = fallbackIdx;
      showQuickViewModalForProduct(all[fallbackIdx].node);
    }
  }
}

function showQuickViewModalForProduct(p) {
  const modal = document.getElementById("product-quickview-modal");
  if (!modal) return;

  const detail = PRODUCT_QUICKVIEW_DETAILS[p.handle] || {};
  
  // Clean raw strings from emoji characters
  const cleanCountry = (p.country || "").replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|🏴󠁧󠁢󠁳󠁣󠁴󠁿/gu, "").trim();
  const cleanType = (p.type || "").replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu, "").trim();
  const cleanComposition = (p.composition || "").replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]/gu, "").trim();

  const hasPrice = p.priceRange && p.priceRange.minVariantPrice?.amount && !isNaN(parseFloat(p.priceRange.minVariantPrice.amount)) && parseFloat(p.priceRange.minVariantPrice.amount) > 0;
  const priceStr = hasPrice ? formatMoney(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode) : "Available in Store";
  const imageUrl = p.images?.edges?.[0]?.node?.url || "assets/cat-whiskey-lux.webp";

  // Elements
  const topBadgeText = document.getElementById("modal-top-badge-text");
  const originText = document.getElementById("modal-origin-text");
  const eyebrowEl = document.getElementById("modal-eyebrow");
  const titleEl = document.getElementById("modal-product-title");
  const codeEl = document.getElementById("modal-product-code");
  const priceEl = document.getElementById("modal-product-price");
  const styleEl = document.getElementById("modal-spec-style");
  const ingredientsEl = document.getElementById("modal-spec-ingredients");
  const originSpecEl = document.getElementById("modal-spec-origin");
  const abvEl = document.getElementById("modal-spec-abv");
  const volumeEl = document.getElementById("modal-spec-volume");
  const descEl = document.getElementById("modal-product-desc");
  const imgEl = document.getElementById("modal-product-img");

  if (topBadgeText) topBadgeText.textContent = detail.badge || (cleanType ? cleanType.toUpperCase() : p.category);
  if (originText) originText.textContent = "Origin: " + (detail.origin || cleanCountry || "Imported");
  if (eyebrowEl) eyebrowEl.textContent = detail.eyebrow || (cleanType ? cleanType.toUpperCase() : (p.category + " SELECTION"));
  if (titleEl) titleEl.textContent = detail.title || p.title;
  if (codeEl) codeEl.textContent = detail.subtitle || (p.title.toUpperCase() + " 750ML");
  if (priceEl) priceEl.textContent = detail.price || priceStr;
  if (styleEl) styleEl.textContent = detail.style || cleanType || p.category;
  if (ingredientsEl) ingredientsEl.textContent = detail.ingredients || cleanComposition || "Fine selected grains & pure spring water";
  if (originSpecEl) originSpecEl.textContent = detail.origin || cleanCountry || "Imported";
  if (abvEl) abvEl.textContent = detail.abv || "40% ABV";
  if (volumeEl) volumeEl.textContent = detail.volume || "750 ml";
  if (descEl) descEl.textContent = detail.description || p.description || "Available in store at Whiskey Barrel. Visit us at 12205 Shawnee Mission Parkway for pricing, tasting notes, and bottle availability.";

  if (imgEl) {
    imgEl.src = imageUrl;
    imgEl.alt = (p.images?.edges?.[0]?.node?.altText) || (detail.title ? `${detail.title} - ${detail.style || p.category || "Fine Spirits"}` : p.title);
  }

  // Display modal
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeProductQuickView() {
  const modal = document.getElementById("product-quickview-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

function navigateQuickView(direction) {
  if (!quickViewActiveList || quickViewActiveList.length === 0) return;
  quickViewCurrentIndex = (quickViewCurrentIndex + direction + quickViewActiveList.length) % quickViewActiveList.length;
  const nextProd = quickViewActiveList[quickViewCurrentIndex];
  if (nextProd && nextProd.node) {
    showQuickViewModalForProduct(nextProd.node);
  }
}

// Bind modal controls once DOM is ready
function setupProductQuickViewListeners() {
  const modal = document.getElementById("product-quickview-modal");
  if (!modal) return;

  const closeBtn = document.getElementById("modal-close-btn");
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeProductQuickView();
    };
  }

  const prevBtn = document.getElementById("modal-prev-btn");
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.stopPropagation();
      navigateQuickView(-1);
    };
  }

  const nextBtn = document.getElementById("modal-next-btn");
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      navigateQuickView(1);
    };
  }

  // Close on clicking backdrop
  modal.onclick = (e) => {
    if (e.target === modal || e.target.classList.contains("product-modal-container")) {
      closeProductQuickView();
    }
  };

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("hidden")) return;
    if (e.key === "Escape") {
      closeProductQuickView();
    } else if (e.key === "ArrowLeft") {
      navigateQuickView(-1);
    } else if (e.key === "ArrowRight") {
      navigateQuickView(1);
    }
  });
}

// Auto-bind on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupProductQuickViewListeners);
} else {
  setupProductQuickViewListeners();
}

window.openProductQuickView = openProductQuickView;
window.closeProductQuickView = closeProductQuickView;
window.navigateQuickView = navigateQuickView;


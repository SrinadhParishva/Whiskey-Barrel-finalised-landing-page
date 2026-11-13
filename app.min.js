/**
 * Whiskey Barrel - Interactive Application Logic
 * Featuring Complete Product Catalog and Quick View Modal
 */

// Product catalog metadata for interactive quick-view modal
const PRODUCTS_DATA = {
  bluenote: {
    id: 'bluenote',
    cloverName: 'BLUE NOTE CROSSROADS WHISKEY 750ML',
    name: 'Blue Note Crossroads',
    price: '$44.99',
    alcoholType: 'American whiskey',
    mainIngredients: 'Corn and other grains; finished in toasted French oak',
    origin: 'Memphis, Tennessee, USA',
    abv: '50% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'American Straight Whiskey',
    image: 'assets/whiskey_bluenote.webp',
    description: 'Handcrafted in Memphis, Tennessee and finished with toasted French and American oak staves. Unfiltered, 100-proof, and overflowing with musical soul and deep oak complexity.',
    tastingNotes: 'Roasted pecans, dark molasses, toasted marshmallow, dark chocolate, baking spice, and a rich, smoky oak finale.',
    inStock: true
  },
  woodford: {
    id: 'woodford',
    cloverName: 'WOODFORD RESERVE 750ML',
    name: 'Woodford Reserve Distiller’s Select',
    price: '$34.99',
    alcoholType: 'Bourbon whiskey',
    mainIngredients: 'Corn, rye, malted barley',
    origin: 'Versailles, Kentucky, USA',
    abv: '45.2% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Kentucky Straight Bourbon',
    image: 'assets/whiskey_woodford.webp',
    description: 'Distilled on the historic Woodford Reserve distillery site established in 1812. Comprising more than 200 detectable flavor notes for unparalleled complexity and balance.',
    tastingNotes: 'Rich dried fruit, mint, orange zest, cocoa, vanilla bean, cinnamon spice, and a silky, lingering warm finish.',
    inStock: true
  },
  crownroyal: {
    id: 'crownroyal',
    cloverName: 'CROWN ROYAL KC LIMITED EDITION 750 ML',
    name: 'Crown Royal KC Limited Edition',
    price: '$24.99',
    alcoholType: 'Canadian blended whisky',
    mainIngredients: 'Grain whiskies, water',
    origin: 'Canada',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Canadian Blended Whisky',
    image: 'assets/whiskey_crownroyal.webp',
    description: 'A special celebratory Kansas City blend from Crown Royal. Masterfully blended in iconic cut-glass decanter, delivering legendary Canadian smoothness with rich vanilla and fruit notes.',
    tastingNotes: 'Creamy vanilla, caramel fudge, ripe orchard pear, sweet oak, and an ultra-plush, velvety finish.',
    inStock: true
  },
  makersmark: {
    id: 'makersmark',
    cloverName: 'MAKERS MARK BOURBON 750ML',
    name: 'Maker’s Mark Bourbon',
    price: '$29.99',
    alcoholType: 'Bourbon whiskey',
    mainIngredients: 'Corn, red winter wheat, malted barley',
    origin: 'Loretto, Kentucky, USA',
    abv: '45% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Kentucky Straight Bourbon',
    image: 'assets/whiskey_makersmark.webp',
    description: 'Handcrafted in Loretto, Kentucky using soft red winter wheat instead of rye. Aged to taste and hand-dipped in signature red wax for an exceptionally smooth, full-flavored profile.',
    tastingNotes: 'Spiced honey, toasted vanilla, caramel oak, butterscotch, and a smooth, gentle finish without rye bite.',
    inStock: true
  },
  jackdaniels: {
    id: 'jackdaniels',
    cloverName: 'JACK DANIELS SOUR MASH WHISKEY 750ML',
    name: 'Jack Daniel’s Old No. 7',
    price: '$24.99',
    alcoholType: 'Tennessee whiskey',
    mainIngredients: 'Corn, rye, malted barley',
    origin: 'Lynchburg, Tennessee, USA',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Tennessee Sour Mash',
    image: 'assets/whiskey_jackdaniels.webp',
    description: 'Charcoal mellowed drop by drop through 10 feet of sugar maple charcoal and matured in handcrafted American white oak barrels for signature smoothness.',
    tastingNotes: 'Caramel, toasted vanilla, charred oak, ripe banana hints, and a clean, pleasant peppery warmth.',
    inStock: true
  },
  jameson: {
    id: 'jameson',
    cloverName: 'JAMESON TRIPLKE DISTILL 750ML',
    name: 'Jameson Irish Whiskey',
    price: '$26.99',
    alcoholType: 'Irish blended whiskey',
    mainIngredients: 'Malted and unmalted barley, maize',
    origin: 'Midleton, County Cork, Ireland',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Triple Distilled Irish Whiskey',
    image: 'assets/whiskey_jameson.webp',
    description: 'Crafted in Midleton, Ireland, triple-distilled from fine grain and pot still whiskeys and aged in oak casks for at least 4 years for signature world-famous smoothness.',
    tastingNotes: 'Light floral fragrance, toasted wood, spicy malt, sweet orchard fruits, and an exceptionally smooth vanilla finish.',
    inStock: true
  },
  titos: {
    id: 'titos',
    cloverName: 'TITO\'S VODKA 750ML',
    name: 'Tito’s Handmade Vodka',
    price: '$19.99',
    alcoholType: 'Vodka',
    mainIngredients: 'Corn, water',
    origin: 'Austin, Texas, USA',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'vodka',
    categoryLabel: 'Craft American Vodka',
    image: 'assets/vodka_titos.webp',
    description: 'Produced in Austin at Texas’ oldest legal distillery. Batch-distilled in old-fashioned copper pot stills from 100% yellow corn for an artisanal, naturally gluten-free spirit.',
    tastingNotes: 'Light sweet corn undertones, silky smooth body, mild warmth, and a clean, gentle, peppery finish.',
    inStock: true
  },
  casamigos: {
    id: 'casamigos',
    cloverName: 'CASAMIGOS BLANCO 375ML',
    name: 'Casamigos Tequila Blanco',
    price: '$19.99',
    alcoholType: 'Blanco tequila',
    mainIngredients: 'Blue Weber agave, water',
    origin: 'Jalisco, Mexico',
    abv: '40% ABV',
    volume: '375 ml',
    category: 'tequila',
    categoryLabel: 'Small Batch 100% Blue Agave',
    image: 'assets/tequila_casamigos_blanco.webp',
    description: 'Ultra-premium small-batch tequila created by George Clooney and Rande Gerber. Made from hand-selected 100% Blue Weber agave roasted in traditional brick ovens for 72 hours and rested for two months.',
    tastingNotes: 'Crisp fresh agave, hints of lemon and grapefruit citrus, sweet vanilla bean, and a silky, smooth finish.',
    inStock: true
  },
  modelo: {
    id: 'modelo',
    cloverName: 'MODELO ESPECIAL 24PK CANS 12OZ',
    name: 'Modelo Especial 24-Pack',
    price: '$30.99',
    alcoholType: 'Mexican lager beer',
    mainIngredients: 'Water, barley malt, corn adjuncts, hops, yeast',
    origin: 'Mexico',
    abv: '4.4% ABV',
    volume: '24-Pack Cans (12 oz)',
    category: 'beer',
    categoryLabel: 'Pilsner-Style Mexican Lager',
    image: 'assets/beer_modelo.webp',
    description: 'Brewed in Mexico since 1925, Modelo Especial is a rich, full-flavored pilsner-style lager known for its golden hue and clean, crisp finish.',
    tastingNotes: 'Crisp cereal grain, slight honey sweetness, delicate herbal hop notes, and a clean, refreshing palate.',
    inStock: true
  },
  michelobultra: {
    id: 'michelobultra',
    cloverName: 'MICHELOB ULTRA 12PK CANS 12OZ',
    name: 'Michelob ULTRA Light Beer 12-Pack',
    price: '$15.99',
    alcoholType: 'Light lager beer',
    mainIngredients: 'Water, barley malt, rice, hops, yeast',
    origin: 'USA',
    abv: '4.2% ABV',
    volume: '12-Pack Cans (12 oz)',
    category: 'beer',
    categoryLabel: 'Superior Light Beer',
    image: 'assets/beer_michelobultra.webp',
    description: 'Brewed for those who understand that the hustle and enjoyment go hand in hand. Only 95 calories and 2.6 carbs per serving with no artificial colors or flavors.',
    tastingNotes: 'Ultra-crisp and clean, subtle citrus malt nuances, and an exceptionally refreshing, light finish.',
    inStock: true
  },
  joshcellars: {
    id: 'joshcellars',
    cloverName: 'JOSH  CELLARS  CABERNET 750ML',
    name: 'Josh Cellars Cabernet Sauvignon',
    price: '$14.99',
    alcoholType: 'Red wine (Cabernet Sauvignon)',
    mainIngredients: 'Cabernet Sauvignon grapes, yeast; sulfites',
    origin: 'California, USA',
    abv: '13.5% ABV',
    volume: '750 ml',
    category: 'wine',
    categoryLabel: 'California Red Wine',
    image: 'assets/wine_joshcellars.webp',
    description: 'Crafted with care by vintner Joseph Carr as a tribute to his father. Sourced from premier California vineyards with rich texture and firm structure.',
    tastingNotes: 'Juicy blackberry, toasted hazelnut, cinnamon spice, ripe dark plum, and rich vanilla oak finish.',
    inStock: true
  },
  meiomi: {
    id: 'meiomi',
    cloverName: 'MEIOMI PINOT NOIR 750ML',
    name: 'Meiomi Pinot Noir',
    price: '$22.99',
    alcoholType: 'Red wine (Pinot Noir)',
    mainIngredients: 'Pinot Noir grapes, yeast; sulfites',
    origin: 'California, USA',
    abv: '13.7% ABV',
    volume: '750 ml',
    category: 'wine',
    categoryLabel: 'California Coastal Pinot Noir',
    image: 'assets/wine_meiomi_pinotnoir.webp',
    description: 'A rich, opulent California Pinot Noir sourced from Sonoma, Monterey, and Santa Barbara counties. Matured in French oak for exceptional balance.',
    tastingNotes: 'Ripe boysenberry, dark cherry, sweet mocha, toasted graham cracker, and a silky smooth finish.',
    inStock: true
  },
  bulleitrye: {
    id: 'bulleitrye',
    cloverName: 'BULLEIT RYE 750ML',
    name: 'Bulleit Straight Rye Whiskey',
    price: '$26.99',
    alcoholType: 'Rye whiskey',
    mainIngredients: 'Rye, corn, malted barley',
    origin: 'Kentucky, USA',
    abv: '45% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Straight American Rye',
    image: 'assets/whiskey_bulleitrye.webp',
    description: 'Crafted with an award-winning 95% rye mashbill for unmatched boldness and complexity. Uncompromisingly spicy and smooth.',
    tastingNotes: 'Candied orange peel, dark rye spice, rich leather, vanilla pod, dried cherries, and a lingering herbal-spice finish.',
    inStock: true
  },
  knobcreek: {
    id: 'knobcreek',
    cloverName: 'KNOB CREEK SMOKE MAPLE 750ML',
    name: 'Knob Creek Smoked Maple',
    price: '$38.99',
    alcoholType: 'Flavored bourbon whiskey',
    mainIngredients: 'Bourbon whiskey, maple flavoring',
    origin: 'Clermont, Kentucky, USA',
    abv: '45% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Flavored Straight Bourbon',
    image: 'assets/whiskey_knobcreek.webp',
    description: 'Full-bodied Kentucky straight bourbon blended with natural smoked maple flavors for a balanced contrast of rich sweetness and robust charred oak.',
    tastingNotes: 'Warm maple syrup, toasted pecan, rich smoked hickory oak, caramel, and a sweet, lingering charred finish.',
    inStock: true
  },
  fourroses: {
    id: 'fourroses',
    cloverName: 'FOUR ROSES BOURBON 750ML',
    name: 'Four Roses Kentucky Bourbon',
    price: '$24.99',
    alcoholType: 'Bourbon whiskey',
    mainIngredients: 'Corn, rye, malted barley',
    origin: 'Lawrenceburg, Kentucky, USA',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Kentucky Straight Bourbon',
    image: 'assets/whiskey_fourroses.webp',
    description: 'Masterfully blended using distinctive mashbills and proprietary yeast cultures to produce a smooth, fragrant, and remarkably approachable bourbon.',
    tastingNotes: 'Crisp pear, apple blossom, light honey, toasted grain, and subtle floral oak finish.',
    inStock: true
  },
  elijahcraig: {
    id: 'elijahcraig',
    cloverName: 'ELIJAH CRAIG 1789 750ML',
    name: 'Elijah Craig Small Batch',
    price: '$32.99',
    alcoholType: 'Small batch bourbon whiskey',
    mainIngredients: 'Corn, rye, malted barley',
    origin: 'Bardstown, Kentucky, USA',
    abv: '47% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Kentucky Straight Bourbon',
    image: 'assets/whiskey_elijahcraig.webp',
    description: 'Crafted in honor of the Father of Bourbon, patient-aged in charred white oak casks for exceptional balance, warm spice, and velvety depth.',
    tastingNotes: 'Rich butterscotch, toasted vanilla bean, charred oak, stewed apples, nutmeg, and warm baking spices.',
    inStock: true
  },
  wildturkey: {
    id: 'wildturkey',
    cloverName: 'WILD TURKEY 101 BOURBON 750ML',
    name: 'Wild Turkey 101 Bourbon',
    price: '$24.99',
    alcoholType: 'Bourbon whiskey',
    mainIngredients: 'Corn, rye, malted barley',
    origin: 'Lawrenceburg, Kentucky, USA',
    abv: '50.5% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Kentucky Straight Bourbon',
    image: 'assets/whiskey_wildturkey.webp',
    description: 'Distilled with high-rye mashbill and aged in heavy #4 alligator char barrels. Legendary bold flavor and an unapologetic 101-proof punch.',
    tastingNotes: 'Caramel, bright citrus zest, toffee, black pepper, toasted oak, and a rich, powerful, warming finish.',
    inStock: true
  },
  dewars: {
    id: 'dewars',
    cloverName: 'DEWARS WHITE LABEL 750ML',
    name: 'Dewar’s White Label Scotch',
    price: '$24.99',
    alcoholType: 'Blended Scotch whisky',
    mainIngredients: 'Malt and grain whiskies',
    origin: 'Scotland, UK',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Blended Scotch Whisky',
    image: 'assets/whiskey_dewars.webp',
    description: 'Scotland’s world-renowned blend of up to 40 of the finest single malt and grain whiskies, married in oak casks for ultimate harmony.',
    tastingNotes: 'Golden heather honey, crisp green orchard apples, warm pear, vanilla fudge, and subtle Highland smoke.',
    inStock: true
  },
  johnniewalker: {
    id: 'johnniewalker',
    cloverName: 'JOHNNIE WALKER BLACK LABEL 50ML',
    name: 'Johnnie Walker Black Label 50ML',
    price: '$1.99',
    alcoholType: 'Blended Scotch whisky',
    mainIngredients: 'Malt and grain whiskies',
    origin: 'Scotland, UK',
    abv: '40% ABV',
    volume: '50 ml Pocket Size',
    category: 'whiskey',
    categoryLabel: 'Blended Scotch Whisky',
    image: 'assets/whiskey_johnniewalker.webp',
    description: 'An iconic master blend of over 29 single malts and grain whiskies from Scotland, each matured for at least 12 years to create extraordinary depth.',
    tastingNotes: 'Dark dried fruits, sweet vanilla cream, toasted oak, and the unmistakable signature peaty smoke.',
    inStock: true
  },
  bacardi: {
    id: 'bacardi',
    cloverName: 'BACARDI RUM PUNCH 1.75L',
    name: 'Bacardí Rum Punch Ready-to-Serve',
    price: '$15.99',
    alcoholType: 'Rum cocktail / flavored rum drink',
    mainIngredients: 'Rum, fruit flavorings; other ingredients vary',
    origin: 'USA / Puerto Rico',
    abv: '9.9% ABV',
    volume: '1.75 L Party Bottle',
    category: 'rum',
    categoryLabel: 'Ready to Serve Cocktails',
    image: 'assets/rum_bacardi.webp',
    description: 'Crafted with premium Bacardí Caribbean rum, real fruit juices, and natural flavors. A vibrant, refreshing island punch ready to pour over ice.',
    tastingNotes: 'Ripe pineapple, sweet orange zest, passion fruit, fresh cherry, and clean sugarcane rum.',
    inStock: true
  },
  absolut: {
    id: 'absolut',
    cloverName: 'ABSOLUT VODKA 750ML',
    name: 'Absolut Swedish Vodka',
    price: '$20.99',
    alcoholType: 'Vodka',
    mainIngredients: 'Winter wheat, water',
    origin: 'Åhus, Sweden',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'vodka',
    categoryLabel: 'Premium Swedish Vodka',
    image: 'assets/vodka_absolut.webp',
    description: 'Crafted in Åhus, Sweden using hardy winter wheat and pristine deep-well water. Continuously distilled hundreds of times for pure, smooth character.',
    tastingNotes: 'Rich, full-bodied and complex, yet smooth and mellow with a distinct character of grain, followed by a hint of dried fruit.',
    inStock: true
  },
  greygoose: {
    id: 'greygoose',
    cloverName: 'GREY GOOSE VODKA 750ML',
    name: 'Grey Goose French Vodka',
    price: '$29.99',
    alcoholType: 'Vodka',
    mainIngredients: 'Wheat, water',
    origin: 'France',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'vodka',
    categoryLabel: 'French Luxury Vodka',
    image: 'assets/vodka_greygoose.webp',
    description: 'Distilled and bottled in France using the finest soft winter wheat from Picardy and pure spring water from Gensac-la-Pallue. Unrivaled elegance and craftsmanship.',
    tastingNotes: 'Delicate floral aromas, crisp citrus sweetness, silky smooth texture, and an extraordinarily clean, lingering finish.',
    inStock: true
  },
  patron: {
    id: 'patron',
    cloverName: 'PATRON REPO 375ML',
    name: 'Patrón Reposado Tequila',
    price: '$27.99',
    alcoholType: 'Reposado tequila',
    mainIngredients: 'Blue Weber agave, water',
    origin: 'Jalisco, Mexico',
    abv: '40% ABV',
    volume: '375 ml',
    category: 'tequila',
    categoryLabel: 'Handcrafted Reposado Tequila',
    image: 'assets/tequila_patron_reposado.webp',
    description: 'Handcrafted from the finest 100% Weber Blue Agave in the Highlands of Jalisco, Mexico. Patiently aged in oak barrels for over two months for the ultimate balance of fresh agave and delicate oak character.',
    tastingNotes: 'Warm oak, fresh agave, light honey, floral citrus blossom, and a gentle floral vanilla finish.',
    inStock: true
  },
  espolon: {
    id: 'espolon',
    cloverName: 'ESPOLON BLANCO TEQ 80 750ML',
    name: 'Espolòn Tequila Blanco',
    price: '$29.99',
    alcoholType: 'Blanco tequila',
    mainIngredients: 'Blue Weber agave, water',
    origin: 'Jalisco, Mexico',
    abv: '40% ABV',
    volume: '750 ml',
    category: 'tequila',
    categoryLabel: '100% Blue Weber Agave Tequila',
    image: 'assets/tequila_espolon_blanco.webp',
    description: 'Handcrafted in Los Altos (Highlands) of Jalisco from 100% Blue Weber Agave. Double distilled using column and pot stills to create a perfectly balanced, vibrant Blanco tequila celebrating Mexican artistry and heritage.',
    tastingNotes: 'Delicate sweet agave, floral tropical fruit, bright lemon zest, grilled pineapple, and a clean white pepper finish.',
    inStock: true
  },
  jimbeam: {
    id: 'jimbeam',
    cloverName: 'JIM BEAM DEVILS CUT 750ML',
    name: 'Jim Beam Devil’s Cut',
    price: '$23.99',
    alcoholType: 'Bourbon whiskey',
    mainIngredients: 'Corn, rye, malted barley; barrel-extracted whiskey',
    origin: 'Clermont, Kentucky, USA',
    abv: '45% ABV',
    volume: '750 ml',
    category: 'whiskey',
    categoryLabel: 'Kentucky Straight Bourbon',
    image: 'assets/whiskey_jimbeam.webp',
    description: 'Extracted from deep inside the wood of the barrel walls, married with extra-aged Kentucky straight bourbon for robust, deep oak character and intense flavor.',
    tastingNotes: 'Intense charred oak, rich vanilla bean, deep caramel, cinnamon spice, and a bold, smoky finish.',
    inStock: true
  },
  smirnoff: {
    id: 'smirnoff',
    cloverName: 'SMIRNOFF1.75',
    name: 'Smirnoff No. 21 Vodka',
    price: '$19.99',
    alcoholType: 'Vodka',
    mainIngredients: 'Grain-based neutral spirits, water',
    origin: 'USA',
    abv: '40% ABV',
    volume: '1.75 L Large Bottle',
    category: 'vodka',
    categoryLabel: 'Triple Distilled Vodka',
    image: 'assets/vodka_smirnoff.webp',
    description: 'The world’s most awarded vodka. Triple distilled from a blend of non-GMO grains and filtered ten times through charcoal for maximum purity and exceptional smoothness.',
    tastingNotes: 'Clean, crisp palate with subtle grain sweetness, light pepper accent, and an impeccably dry, clean finish.',
    inStock: true
  },
  malibu: {
    id: 'malibu',
    cloverName: 'MALIBU BLACK RUM COCONUT 750ML',
    name: 'Malibu Black Rum',
    price: '$14.99',
    alcoholType: 'Coconut-flavored rum',
    mainIngredients: 'Caribbean rum, coconut flavorings',
    origin: 'Barbados / Caribbean',
    abv: '35% ABV',
    volume: '750 ml',
    category: 'rum',
    categoryLabel: 'Caribbean Rum & Coconut',
    image: 'assets/rum_malibu.webp',
    description: 'A bolder, higher-proof expression of Caribbean rum blended with smooth coconut liqueur for an elevated tropical cocktail experience.',
    tastingNotes: 'Rich toasted coconut, sweet sugarcane, warm vanilla, and a smooth, bold rum finish.',
    inStock: true
  },
  fireball: {
    id: 'fireball',
    cloverName: 'FIREBALL 1.75 L',
    name: 'Fireball Cinnamon Whisky',
    price: '$28.99',
    alcoholType: 'Cinnamon whisky-based drink',
    mainIngredients: 'Canadian whisky, cinnamon flavoring, sweeteners',
    origin: 'Canada',
    abv: '33% ABV',
    volume: '1.75 L Party Bottle',
    category: 'whiskey',
    categoryLabel: 'Flavored Whisky',
    image: 'assets/whiskey_fireball.webp',
    description: 'Smooth Canadian whisky infused with natural, fiery cinnamon. Delivers an intense, sweet heat that ignites the palate with unforgettable character.',
    tastingNotes: 'Fiery red hot cinnamon candies, sweet honey syrup, toasted spice, and a bold, warming finish.',
    inStock: true
  },
  sauza: {
    id: 'sauza',
    cloverName: 'SAUZA TEQ GOLD 50ML',
    name: 'Sauza Tequila Gold 50ML',
    price: '$0.99',
    alcoholType: 'Gold tequila',
    mainIngredients: 'Blue Weber agave and other permitted sugars; caramel coloring possible',
    origin: 'Jalisco, Mexico',
    abv: '40% ABV',
    volume: '50 ml Pocket Size',
    category: 'tequila',
    categoryLabel: 'Imported Mexican Gold Tequila',
    image: 'assets/tequila_sauza_gold.webp',
    description: 'An iconic Jalisco classic with over a century of tequila tradition dating back to 1873. Double-distilled in copper pot stills for a sweet, caramel-tinged gold profile that is exceptionally smooth and mixable.',
    tastingNotes: 'Sweet caramel, cooked agave, subtle toasted oak, white pepper, and a warm, approachable finish.',
    inStock: true
  },
  corona: {
    id: 'corona',
    cloverName: 'CORONA EXTRA 12PK BTL 12OZ',
    name: 'Corona Extra 12-Pack',
    price: '$18.99',
    alcoholType: 'Mexican lager beer',
    mainIngredients: 'Water, barley malt, corn, hops, yeast',
    origin: 'Mexico',
    abv: '4.6% ABV',
    volume: '12-Pack Bottles (12 oz)',
    category: 'beer',
    categoryLabel: 'Mexican Cerveza Lager',
    image: 'assets/beer_corona.webp',
    description: 'La Cerveza Más Fina. Brewed in Mexico with a golden hue, refreshing crisp flavor, and iconic pairing with a freshly squeezed wedge of lime.',
    tastingNotes: 'Crisp malt sweetness, touch of honey, subtle floral hops, and a clean, refreshing, citrus-friendly finish.',
    inStock: true
  },
  coorslight: {
    id: 'coorslight',
    cloverName: 'COORS LIGHT 24PK CANS 12OZ',
    name: 'Coors Light 24-Pack',
    price: '$25.99',
    alcoholType: 'Light lager beer',
    mainIngredients: 'Water, barley malt, corn syrup used in brewing, hops, yeast',
    origin: 'USA',
    abv: '4.2% ABV',
    volume: '24-Pack Cans (12 oz)',
    category: 'beer',
    categoryLabel: 'Mountain Cold Light Lager',
    image: 'assets/beer_coorslight.webp',
    description: 'Cold-lagering, cold-filtration, and cold-capping give Coors Light its signature mountain-cold refreshment and crisp, clean taste.',
    tastingNotes: 'Crisp Rocky Mountain spring water freshness, delicate malt nuance, and an invigorating, brisk finish.',
    inStock: true
  },
  millerlite: {
    id: 'millerlite',
    cloverName: 'MILLER LITE ALUM 15PK BTL 16OZ',
    name: 'Miller Lite Aluminum 15-Pack',
    price: '$23.49',
    alcoholType: 'Light lager beer',
    mainIngredients: 'Water, barley malt, corn syrup used in brewing, hops, yeast',
    origin: 'USA',
    abv: '4.2% ABV',
    volume: '15-Pack Aluminum Bottles (16 oz)',
    category: 'beer',
    categoryLabel: 'Fine Pilsner Beer',
    image: 'assets/beer_millerlite.webp',
    description: 'The original light beer brewed with pure water, select barley malt, and Galena hops. Crisp, clean, and balanced with authentic pilsner character.',
    tastingNotes: 'Light malt sweetness, subtle floral hop aroma, clean, crisp, and refreshing finish.',
    inStock: true
  },
  budlight: {
    id: 'budlight',
    cloverName: 'BUD LIGHT AL 20PK BTL 16OZ',
    name: 'Bud Light Aluminum 20-Pack',
    price: '$24.49',
    alcoholType: 'Light lager beer',
    mainIngredients: 'Water, barley malt, rice, hops, yeast',
    origin: 'USA',
    abv: '4.2% ABV',
    volume: '20-Pack Aluminum Bottles (16 oz)',
    category: 'beer',
    categoryLabel: 'American Light Lager',
    image: 'assets/beer_budlight.webp',
    description: 'Brewed with choice hops, barley malt, water, and rice for an ultra-crisp, light body and clean, refreshing finish.',
    tastingNotes: 'Delicate malt sweetness, subtle floral hop hint, ultra-clean and thirst-quenching finish.',
    inStock: true
  },
  budweiser: {
    id: 'budweiser',
    cloverName: 'BUDWEISER 24PK CANS 160Z',
    name: 'Budweiser 24-Pack Cans',
    price: '$28.99',
    alcoholType: 'American lager beer',
    mainIngredients: 'Water, barley malt, rice, hops, yeast',
    origin: 'USA',
    abv: '5.0% ABV',
    volume: '24-Pack Cans (16 oz)',
    category: 'beer',
    categoryLabel: 'American Lager',
    image: 'assets/beer_budweiser.webp',
    description: 'The Great American Lager, beechwood aged since 1876 for a balanced, full-flavored taste with remarkable drinkability.',
    tastingNotes: 'Crisp malt aroma, gentle sweetness, toasted grain, and a clean, refreshing, well-rounded finish.',
    inStock: true
  },
  stellaartois: {
    id: 'stellaartois',
    cloverName: 'STELLA ARTOIS 12 PK CAN',
    name: 'Stella Artois 12-Pack',
    price: '$15.99',
    alcoholType: 'Belgian-style pilsner beer',
    mainIngredients: 'Water, barley malt, hops, yeast',
    origin: 'USA / Belgium',
    abv: '5.0% ABV',
    volume: '12-Pack Cans (11.2 oz)',
    category: 'beer',
    categoryLabel: 'Belgian Premium Pilsner',
    image: 'assets/beer_stellaartois.webp',
    description: 'With over 600 years of Belgian brewing heritage, Stella Artois is brewed with Saaz hops and roasted malt for an iconic, crisp European pilsner experience.',
    tastingNotes: 'Pleasant floral Saaz hop aroma, well-balanced malt sweetness, crisp bitterness, and a soft, dry finish.',
    inStock: true
  },
  guinness: {
    id: 'guinness',
    cloverName: 'GUINNESS EXTRA STOUT 6PK BTL 11.2OZ',
    name: 'Guinness Extra Stout 6-Pack',
    price: '$9.99',
    alcoholType: 'Irish extra stout beer',
    mainIngredients: 'Water, barley malt, roasted barley, hops, yeast',
    origin: 'Ireland',
    abv: '5.6% ABV',
    volume: '6-Pack Bottles (11.2 oz)',
    category: 'beer',
    categoryLabel: 'Irish Extra Stout',
    image: 'assets/beer_guinness.webp',
    description: 'Brewed in Dublin, Ireland following a historic recipe dating back to 1759. Deep ruby color, rich creamy head, and classic roasted barley character.',
    tastingNotes: 'Rich dark roasted malt, bittersweet dark chocolate, espresso notes, and a crisp, dry roasted finish.',
    inStock: true
  },
  bluemoon: {
    id: 'bluemoon',
    cloverName: 'BLUE MOON 12PK BTL 12OZ',
    name: 'Blue Moon Belgian White 12-Pack',
    price: '$18.99',
    alcoholType: 'Belgian-style wheat ale',
    mainIngredients: 'Water, wheat, barley malt, oats, orange peel, coriander, hops, yeast',
    origin: 'USA',
    abv: '5.4% ABV',
    volume: '12-Pack Bottles (12 oz)',
    category: 'beer',
    categoryLabel: 'Belgian-Style Wheat Ale',
    image: 'assets/beer_bluemoon.webp',
    description: 'A Belgian-Style wheat ale brewed with Valencia orange peel for subtle sweetness and coriander for a bright, aromatic herbal twist.',
    tastingNotes: 'Zesty Valencia orange, warm coriander spice, creamy wheat body, and a smooth, refreshing finish.',
    inStock: true
  },
  dosequis: {
    id: 'dosequis',
    cloverName: 'DOS EQUIS LAGER 12PK CANS 12OZ',
    name: 'Dos Equis Lager Especial 12-Pack',
    price: '$16.49',
    alcoholType: 'Mexican lager beer',
    mainIngredients: 'Water, barley malt, adjunct grains, hops, yeast',
    origin: 'Mexico',
    abv: '4.2% ABV',
    volume: '12-Pack Cans (12 oz)',
    category: 'beer',
    categoryLabel: 'Mexican Golden Lager',
    image: 'assets/beer_dosequis.webp',
    description: 'A crisp, refreshing golden lager from Mexico with a balanced composition and a clean, smooth finish. Perfect enjoyed ice cold with a slice of fresh lime.',
    tastingNotes: 'Subtle toasted earth malt, light floral hops, clean refreshing body, and crisp finish.',
    inStock: true
  },
  barefootmoscato: {
    id: 'barefootmoscato',
    cloverName: 'BAREFOOT ON TAP MOSCATO 3L',
    name: 'Barefoot on Tap Moscato 3L',
    price: '$18.99',
    alcoholType: 'Moscato wine (boxed)',
    mainIngredients: 'Moscato grapes, yeast; sulfites',
    origin: 'California, USA',
    abv: '9% ABV',
    volume: '3 L (Equal to 4 Bottles)',
    category: 'wine',
    categoryLabel: 'California Sweet White Wine',
    image: 'assets/wine_barefoot_moscato.webp',
    description: 'Deliciously sweet and refreshing California Moscato in convenient stay-fresh tap packaging. Stays fresh for up to 30 days after opening.',
    tastingNotes: 'Lush white peach, sweet mandarin orange, delicate jasmine floral blossom, and crisp lemon drop finish.',
    inStock: true
  },
  kendalljackson: {
    id: 'kendalljackson',
    cloverName: 'KENDALL JACKSON  VINTERS RSRV 750ML',
    name: 'Kendall-Jackson Vintner’s Reserve',
    price: '$21.99',
    alcoholType: 'Wine (varietal unspecified)',
    mainIngredients: 'Grapes, yeast; sulfites',
    origin: 'California, USA',
    abv: '13.5% ABV',
    volume: '750 ml',
    category: 'wine',
    categoryLabel: 'California White Wine',
    image: 'assets/wine_kendalljackson.webp',
    description: 'America’s favorite Chardonnay for over 30 years. Handcrafted from 100% Jackson Estates coastal vineyards and barrel fermented in French and American oak.',
    tastingNotes: 'Tropical pineapple, ripe mango, papaya, crisp green apple, with delicate toasted oak and rich vanilla cream.',
    inStock: true
  },
  apothicinferno: {
    id: 'apothicinferno',
    cloverName: 'APOTHIC INFERNO 750ML',
    name: 'Apothic Inferno Red Blend',
    price: '$13.99',
    alcoholType: 'Red wine (barrel-aged blend)',
    mainIngredients: 'Grapes, yeast; sulfites',
    origin: 'California, USA',
    abv: '16% ABV',
    volume: '750 ml',
    category: 'wine',
    categoryLabel: 'Whiskey Barrel Aged Red Wine',
    image: 'assets/wine_apothic_inferno.webp',
    description: 'A bold California red wine blend aged for 60 days in charred white oak whiskey barrels for fiery complexity and rich, smoky depth.',
    tastingNotes: 'Blackberry jam, dark boysenberry, charred whiskey oak, maple spice, and a warm, lingering finish.',
    inStock: true
  },
  botabox: {
    id: 'botabox',
    cloverName: 'BOTA BOX',
    name: 'Bota Box Premium Wine 3L',
    price: '$17.99',
    alcoholType: 'Boxed wine (varietal unspecified)',
    mainIngredients: 'Grapes, yeast; sulfites',
    origin: 'USA',
    abv: '13% ABV',
    volume: '3 L (Equal to 4 Bottles)',
    category: 'wine',
    categoryLabel: 'California Eco-Craft Wine',
    image: 'assets/wine_botabox.webp',
    description: 'Premium California grapes crafted into award-winning wine and sealed in 100% recyclable, BPA-free stay-fresh packaging.',
    tastingNotes: 'Juicy dark cherry, blueberry, toasted oak vanilla, and balanced, food-friendly acidity.',
    inStock: true
  },
  sutterhome: {
    id: 'sutterhome',
    cloverName: 'SUTTER HOME 750ML',
    name: 'Sutter Home California Wine',
    price: '$6.99',
    alcoholType: 'Wine (varietal unspecified)',
    mainIngredients: 'Grapes, yeast; sulfites',
    origin: 'California, USA',
    abv: '10.5% ABV',
    volume: '750 ml',
    category: 'wine',
    categoryLabel: 'California Fresh Wine',
    image: 'assets/wine_sutterhome.webp',
    description: 'An American classic crafted by the Trinchero family in St. Helena, Napa Valley. Light, deliciously fruity, and versatile for any casual gathering.',
    tastingNotes: 'Fresh strawberries, sweet honeydew melon, crisp floral undertones, and a smooth, refreshing finish.',
    inStock: true
  },
  yellowtailshiraz: {
    id: 'yellowtailshiraz',
    cloverName: 'YELLOW TAIL SHIRAZ 1.5L',
    name: '[yellow tail] Shiraz 1.5L',
    price: '$12.99',
    alcoholType: 'Red wine (Shiraz)',
    mainIngredients: 'Shiraz grapes, yeast; sulfites',
    origin: 'South Eastern Australia',
    abv: '13.5% ABV',
    volume: '1.5 L',
    category: 'wine',
    categoryLabel: 'Australian Red Wine',
    image: 'assets/wine_yellowtail_shiraz.webp',
    description: 'Crafted by the Casella family in South Eastern Australia. A vibrant, approachable Shiraz bursting with ripe berry fruit and gentle oak spice.',
    tastingNotes: 'Ripe red berries, dark plum, sweet vanilla bean, subtle licorice, and a smooth, velvety finish.',
    inStock: true
  },
  gin: {
    id: 'gin',
    cloverName: 'CRAFT GIN CURATED COLLECTION',
    name: 'Craft Gin Collection',
    price: 'Coming Soon',
    alcoholType: 'Botanical & Artisanal Gin',
    mainIngredients: 'Neutral grain spirit, juniper berries, citrus peel, botanicals',
    origin: 'Distilleries Worldwide',
    abv: '40% - 47% ABV',
    volume: 'Curated Selections',
    category: 'gin',
    categoryLabel: 'Botanical & Artisanal Gin',
    image: 'assets/gin_coming_soon.webp',
    description: 'We are curating an exceptional collection of artisanal London Dry, citrus-infused, and small-batch botanical gins from premier distilleries worldwide. Arriving soon to Whiskey Barrel.',
    tastingNotes: 'Crisp juniper berries, bright Meyer lemon zest, angelica root, and wild botanicals.',
    inStock: false
  },
  cigar: {
    id: 'cigar',
    cloverName: 'PREMIUM HAND-ROLLED CIGAR COLLECTION',
    name: 'Premium Cigar Collection',
    price: 'Coming Soon',
    alcoholType: 'Handcrafted & Artisanal Cigars',
    mainIngredients: 'Aged long-filler tobacco leaves, natural binder and wrapper',
    origin: 'Nicaragua, Dominican Republic, Honduras',
    abv: 'Hand-Rolled Artisanal',
    volume: 'Curated Humidor',
    category: 'cigar',
    categoryLabel: 'Handcrafted & Artisanal Cigars',
    image: 'assets/cigar_coming_soon.webp',
    description: 'We are curating a walk-in temperature- and humidity-controlled humidor featuring premier hand-rolled cigars, boutique labels, and renowned international makers. Arriving soon to Whiskey Barrel.',
    tastingNotes: 'Aromatic Spanish cedar, roasted espresso bean, dark Venezuelan cacao, toasted baking spices, and velvety smooth leather.',
    inStock: false
  }
};

// Track currently displayed modal product ID for next/prev navigation
let currentModalProductId = null;

/**
 * Protect email addresses from scrapers while maintaining full mailto and display functionality
 */
function initEmailProtection() {
  const emailLinks = document.querySelectorAll('.email-addr[data-user][data-domain]');
  emailLinks.forEach(link => {
    const user = link.getAttribute('data-user');
    const domain = link.getAttribute('data-domain');
    if (user && domain) {
      const email = `${user}@${domain}`;
      link.href = `mailto:${email}`;
      link.textContent = email;
    }
  });

  // Dynamically populate OpenGraph business email meta tag for JS-capable clients
  if (!document.querySelector('meta[property="business:contact_data:email"]')) {
    const ogEmail = document.createElement('meta');
    ogEmail.setAttribute('property', 'business:contact_data:email');
    ogEmail.content = 'WB' + '@' + 'rkmgmt.net';
    document.head.appendChild(ogEmail);
  }

  // Dynamically populate Schema.org JSON-LD email property for JS-capable crawlers
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (schemaScript) {
    try {
      const data = JSON.parse(schemaScript.textContent);
      if (data && data['@graph'] && Array.isArray(data['@graph'])) {
        const store = data['@graph'].find(item => item['@type'] === 'LiquorStore');
        if (store && !store.email) {
          store.email = 'WB' + '@' + 'rkmgmt.net';
          schemaScript.textContent = JSON.stringify(data);
        }
      }
    } catch (e) {
      // Ignore JSON parse errors if any
    }
  }
}

function initApp() {
  initAgeGate();
  initEmailProtection();
  initCategoryFilter();
  initStoreStatus();
  initCardInteractions();
  initModalListeners();
  initCallStorePopup();
  initFaqAccordion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * Filter featured selection cards by category & handle category carousel
 */
function initCategoryFilter() {
  const items = document.querySelectorAll('.cat-item-btn, .cat-pill');
  const cards = document.querySelectorAll('.product-card');
  const track = document.getElementById('category-items-track');
  const nextBtn = document.getElementById('cat-nav-next');
  const prevBtn = document.getElementById('cat-nav-prev');

  // Next Arrow Click Handler
  if (track && prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (track.scrollLeft <= 15) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -260, behavior: 'smooth' });
      }
    });
  }

  if (track && nextBtn) {
    nextBtn.addEventListener('click', () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 15) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: 240, behavior: 'smooth' });
      }
    });

    // Mouse wheel horizontal scroll on category track (desktop/fine pointer only)
    if (window.matchMedia('(pointer: fine)').matches) {
      track.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0 && track.scrollWidth > track.clientWidth) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }
  }

  // Category Item Click Handler
  items.forEach(item => {
    item.addEventListener('click', () => {
      const targetCategory = item.getAttribute('data-category');

      // Update active state
      items.forEach(p => p.classList.remove('active'));
      item.classList.add('active');

      // Smoothly center the clicked category item in the track on mobile/touch screens
      if (track && track.scrollWidth > track.clientWidth) {
        const trackRect = track.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const scrollOffset = (itemRect.left - trackRect.left) + track.scrollLeft - (track.clientWidth / 2) + (itemRect.width / 2);
        track.scrollTo({ left: Math.max(0, scrollOffset), behavior: 'smooth' });
      }

      // Update active category heading
      const titleElement = document.getElementById('featured-category-title');
      if (titleElement) {
        const categoryTitles = {
          whiskey: 'WHISKEY SELECTIONS',
          rum: 'RUM SELECTIONS',
          beer: 'BEER & CRAFT BREWS',
          vodka: 'VODKA SELECTIONS',
          gin: 'GIN SELECTION',
          wine: 'WINE SELECTIONS',
          tequila: 'TEQUILA SELECTIONS',
          cigar: 'CIGARS SELECTION',
          all: 'FEATURED SELECTIONS'
        };
        titleElement.textContent = categoryTitles[targetCategory] || (targetCategory.toUpperCase() + ' SELECTIONS');
      }

      // Update featured notice for coming-soon categories
      const noticeElement = document.querySelector('.featured-notice');
      if (noticeElement) {
        if (targetCategory === 'gin' || targetCategory === 'cigar') {
          noticeElement.innerHTML = `
            <span class="notice-text notice-highlight">COMING SOON</span>
            <span class="notice-divider">|</span>
            <span class="notice-text">CALL (913) 400-2339 TO INQUIRE ABOUT UPCOMING ARRIVALS</span>
          `;
        } else {
          noticeElement.innerHTML = `
            <span class="notice-text">SAMPLE SELECTIONS ONLY</span>
            <span class="notice-divider">|</span>
            <span class="notice-text">CALL TO CONFIRM AVAILABILITY</span>
          `;
        }
      }

      // Filter product cards with smooth transition
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cardCat === targetCategory || targetCategory === 'all') {
          card.classList.remove('is-hidden');
          card.classList.remove('is-fade-in');
          void card.offsetWidth;
          card.classList.add('is-fade-in');
        } else {
          card.classList.remove('is-fade-in');
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * Dynamic Store Open / Closed Status based on Shawnee, Kansas time (US Central)
 */
function initStoreStatus() {
  const statusPill = document.getElementById('live-status-pill');
  if (!statusPill) return;

  try {
    const now = new Date();
    const centralTimeString = now.toLocaleString("en-US", { timeZone: "America/Chicago" });
    const centralDate = new Date(centralTimeString);
    const day = centralDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hour = centralDate.getHours();
    const minute = centralDate.getMinutes();

    let openHour = 9;
    let closeHour = 22; // 10 PM
    let closeText = '10 PM';

    if (day === 5 || day === 6) { // Fri - Sat
      closeHour = 23; // 11 PM
      closeText = '11 PM';
    } else if (day === 0) { // Sun
      closeHour = 20; // 8 PM
      closeText = '8 PM';
    }

    const currentTotalMinutes = hour * 60 + minute;
    const openTotalMinutes = openHour * 60;
    const closeTotalMinutes = closeHour * 60;

    const statusMsg = statusPill.querySelector('.status-msg');
    const pulseDot = statusPill.querySelector('.pulse-dot');

    if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
      statusMsg.textContent = `Open Now · Closes at ${closeText}`;
      statusPill.classList.add('status-open');
      statusPill.classList.remove('status-closed');
    } else {
      statusMsg.textContent = 'Closed Now · Opens at 9 AM';
      statusPill.classList.add('status-closed');
      statusPill.classList.remove('status-open');
    }
  } catch (e) {
    console.error('Error calculating store status:', e);
  }
}

/**
 * Click handler on cards to open modal
 */
function initCardInteractions() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const prodId = card.getAttribute('data-product-id');
      if (prodId) {
        openProductModal(prodId);
      }
    });

    // Keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    const nameEl = card.querySelector('.product-name');
    if (nameEl) {
      card.setAttribute('aria-label', `View details for ${nameEl.textContent.trim().replace(/\s+/g, ' ')}`);
    }

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const prodId = card.getAttribute('data-product-id');
        if (prodId) openProductModal(prodId);
      }
    });
  });
}

/**
 * Get active category visible product IDs for prev/next navigation
 */
function getVisibleProductIds() {
  const activeBtn = document.querySelector('.cat-item-btn.active');
  const activeCat = activeBtn ? activeBtn.getAttribute('data-category') : 'whiskey';
  const visibleCards = Array.from(document.querySelectorAll('.product-card')).filter(c => {
    const cardCat = c.getAttribute('data-category');
    return cardCat === activeCat || activeCat === 'all';
  });
  return visibleCards.map(c => c.getAttribute('data-product-id')).filter(Boolean);
}

/**
 * Navigate to next or previous product in modal
 */
function navigateModalProduct(direction) {
  const ids = getVisibleProductIds();
  if (!ids || ids.length <= 1 || !currentModalProductId) return;

  const currentIndex = ids.indexOf(currentModalProductId);
  if (currentIndex === -1) return;

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = ids.length - 1;
  if (newIndex >= ids.length) newIndex = 0;

  openProductModal(ids[newIndex]);
}

/**
 * Open Product Quick View Modal
 */
function openProductModal(productId) {
  const product = PRODUCTS_DATA[productId];
  if (!product) return;

  currentModalProductId = productId;

  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('modalProductContent');

  modalContent.innerHTML = `
    <!-- Left Column: Image Showcase -->
    <div class="modal-image-col">
      <div class="modal-badge-floating">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span>${product.categoryLabel || product.category.toUpperCase()}</span>
      </div>

      <!-- Navigation Arrows -->
      <button class="modal-nav-arrow modal-nav-prev" onclick="navigateModalProduct(-1)" title="Previous product" aria-label="Previous product">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="modal-img-stage">
        <img src="${product.image}" alt="${product.name}" class="modal-product-img">
      </div>

      <button class="modal-nav-arrow modal-nav-next" onclick="navigateModalProduct(1)" title="Next product" aria-label="Next product">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div class="modal-origin-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
        </svg>
        <span>Origin: ${product.origin}</span>
      </div>
    </div>

    <!-- Right Column: Product Details -->
    <div class="modal-info-col">
      <span class="modal-category-tag">${product.alcoholType}</span>
      <h3 class="modal-title">${product.name}</h3>
      <div class="modal-clover-name" title="Clover POS Catalog Identifier">${product.cloverName}</div>

      <div class="modal-price-row">
        <div class="modal-price">${product.price}</div>
        <div class="modal-stock-pill ${product.inStock ? '' : 'coming-soon'}">
          <span class="modal-stock-dot"></span>
          <span>${product.inStock ? 'Available in Store' : 'Coming Soon'}</span>
        </div>
      </div>

      <!-- Structured Specification Grid -->
      <div class="modal-specs-card">
        <div class="spec-item">
          <span class="spec-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 10h10M7 14h10M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
            </svg>
            Alcohol Type / Style
          </span>
          <span class="spec-value">${product.alcoholType}</span>
        </div>

        <div class="spec-item">
          <span class="spec-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Main Ingredients / Base
          </span>
          <span class="spec-value">${product.mainIngredients}</span>
        </div>

        <div class="spec-item">
          <span class="spec-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            Manufacturing Origin (Typical)
          </span>
          <span class="spec-value">${product.origin}</span>
        </div>

        <div class="spec-item-split">
          <div class="spec-half">
            <span class="spec-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="5" x2="5" y2="19"/>
                <circle cx="6.5" cy="6.5" r="2.5"/>
                <circle cx="17.5" cy="17.5" r="2.5"/>
              </svg>
              ABV % (Typical)
            </span>
            <span class="spec-value">${product.abv}</span>
          </div>
          <div class="spec-half">
            <span class="spec-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              Package / Volume
            </span>
            <span class="spec-value">${product.volume}</span>
          </div>
        </div>
      </div>

      <p class="modal-desc">${product.description}</p>

      ${product.tastingNotes ? `
        <div class="tasting-notes-box">
          <strong>Tasting Profile & Notes</strong>
          <span>${product.tastingNotes}</span>
        </div>
      ` : ''}

      <div class="modal-actions">
        <a href="tel:+19134002339" class="btn btn-primary" id="modal-call-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Call to Reserve</span>
        </a>
        <a href="https://www.google.com/maps/place/Whiskey+Barrel/@39.0143816,-94.7279887,15z/data=!4m15!1m8!3m7!1s0x87c0ed9157f883f7:0xc38d104d634d33ed!2sWhiskey+Barrel!8m2!3d39.0141541!4d-94.727787!10e5!16s%2Fg%2F11spn4_7qy!3m5!1s0x87c0ed9157f883f7:0xc38d104d634d33ed!8m2!3d39.0141541!4d-94.727787!16s%2Fg%2F11spn4_7qy?entry=ttu&g_ep=EgoyMDI2MTAxOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" class="btn btn-outline" id="modal-directions-btn">
          <span>Get Directions</span>
          <span class="arrow">&rarr;</span>
        </a>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.classList.add('modal-open');
  modalContent.scrollTop = 0;
  const modalInfoCol = modalContent.querySelector('.modal-info-col');
  if (modalInfoCol) modalInfoCol.scrollTop = 0;
}

/**
 * Close Product Modal
 */
function closeProductModal(event) {
  if (event && event.target) {
    const isBackdrop = event.target.classList.contains('modal-backdrop');
    const isCloseBtn = event.target.closest('.modal-close-btn');
    if (!isBackdrop && !isCloseBtn) {
      return;
    }
  }
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    currentModalProductId = null;
  }
}

/**
 * Modal Listeners (ESC key and Arrow keys for Next/Prev)
 */
function initModalListeners() {
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('productModal');
    if (!modal || !modal.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeProductModal();
    } else if (e.key === 'ArrowRight') {
      navigateModalProduct(1);
    } else if (e.key === 'ArrowLeft') {
      navigateModalProduct(-1);
    }
  });
}

/**
 * ==========================================================================
 * Call Store Modal / Popup Functionality
 * ==========================================================================
 */
function openCallStorePopup() {
  const popup = document.getElementById('callStorePopup');
  const triggerBtn = document.getElementById('btn-call-hero');
  if (popup) {
    popup.classList.add('open');
    document.body.classList.add('modal-open');
    if (triggerBtn) {
      triggerBtn.setAttribute('aria-expanded', 'true');
    }
  }
}

function closeCallStorePopup(event) {
  if (event && event.target) {
    const isBackdrop = event.target.classList.contains('call-popup-backdrop');
    const isCloseBtn = event.target.closest('.call-popup-close-btn');
    const isOption = event.target.closest('.call-popup-option');
    if (!isBackdrop && !isCloseBtn && !isOption) {
      return;
    }
  }
  const popup = document.getElementById('callStorePopup');
  const triggerBtn = document.getElementById('btn-call-hero');
  if (popup) {
    popup.classList.remove('open');
    const prodModal = document.getElementById('productModal');
    if (!prodModal || !prodModal.classList.contains('open')) {
      document.body.classList.remove('modal-open');
    }
    if (triggerBtn) {
      triggerBtn.setAttribute('aria-expanded', 'false');
    }
  }
}

function initCallStorePopup() {
  const callBtns = [
    document.getElementById('btn-call-hero'),
    document.getElementById('btn-faq-call'),
    document.getElementById('btn-call-bottom')
  ];
  callBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCallStorePopup();
      });
    }
  });

  // Dismiss popup when user clicks an option (Call or SMS)
  const popupOptions = document.querySelectorAll('.call-popup-option');
  popupOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      setTimeout(() => {
        closeCallStorePopup();
      }, 100);
    });
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const popup = document.getElementById('callStorePopup');
      if (popup && popup.classList.contains('open')) {
        closeCallStorePopup();
      }
    }
  });
}

// Global functions for inline handlers
window.openCallStorePopup = openCallStorePopup;
window.closeCallStorePopup = closeCallStorePopup;


/**
 * Interactive FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close other open FAQ items for a clean single-item view
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      if (isActive) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}


/**
 * Mandatory 21+ Age Verification Gate
 */
const AGE_GATE_STORAGE_KEY = 'wb_age_verified_v2';
const AGE_GATE_DATE_KEY = 'wb_age_verified_date_v2';
const AGE_GATE_DENIED_KEY = 'wb_age_denied';
const AGE_GATE_EXPIRY_DAYS = 30;

function isAgeVerified() {
  try {
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
    [viewQuestion, viewDob, viewDenied].forEach(v => {
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
    [monthInput, dayInput, yearInput].forEach(inp => {
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

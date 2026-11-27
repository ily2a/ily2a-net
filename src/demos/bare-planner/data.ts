// The demo's meal plan: two weeks, a different breakfast, main and snack
// every day, portioned to that day's targets. Each dish has a photo, its
// macros and the ingredients the shopping list is made from.

export type MealType = 'breakfast' | 'main' | 'snack'
export const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'main', label: 'Main' },
  { id: 'snack', label: 'Snack' },
]

export interface Macros { p: number; c: number; f: number; kcal: number }

/** Calories from macros: 4 kcal per gram of protein and carbs, 9 per gram of fat. */
const kcalOf = ({ p, c, f }: Omit<Macros, 'kcal'>) => p * 4 + c * 4 + f * 9

type CategoryId = 'produce' | 'meat' | 'dairy' | 'bakery' | 'pantry'
const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'produce', label: 'Fruit & veg' },
  { id: 'meat', label: 'Meat' },
  { id: 'dairy', label: 'Dairy & eggs' },
  { id: 'bakery', label: 'Bread & grains' },
  { id: 'pantry', label: 'Pantry' },
]

type Unit = 'pcs' | 'g' | 'ml' | 'slices' | 'tbsp' | 'bunch'

const INGREDIENTS = {
  // Fruit & veg
  avocado: { name: 'Avocado', category: 'produce', unit: 'pcs' },
  lemon: { name: 'Lemon', category: 'produce', unit: 'pcs' },
  lime: { name: 'Lime', category: 'produce', unit: 'pcs' },
  banana: { name: 'Banana', category: 'produce', unit: 'pcs' },
  apple: { name: 'Apple', category: 'produce', unit: 'pcs' },
  mango: { name: 'Mango', category: 'produce', unit: 'pcs' },
  dragonFruit: { name: 'Frozen dragon fruit', category: 'produce', unit: 'g' },
  frozenBerries: { name: 'Frozen mixed berries', category: 'produce', unit: 'g' },
  strawberries: { name: 'Strawberries', category: 'produce', unit: 'g' },
  blueberries: { name: 'Blueberries', category: 'produce', unit: 'g' },
  raspberries: { name: 'Raspberries', category: 'produce', unit: 'g' },
  spinach: { name: 'Baby spinach', category: 'produce', unit: 'g' },
  saladLeaves: { name: 'Mixed salad leaves', category: 'produce', unit: 'g' },
  rocket: { name: 'Rocket', category: 'produce', unit: 'g' },
  lettuce: { name: 'Cos lettuce', category: 'produce', unit: 'pcs' },
  tomatoes: { name: 'Cherry tomatoes', category: 'produce', unit: 'g' },
  cucumber: { name: 'Cucumber', category: 'produce', unit: 'pcs' },
  carrot: { name: 'Carrot', category: 'produce', unit: 'pcs' },
  capsicum: { name: 'Red capsicum', category: 'produce', unit: 'pcs' },
  redOnion: { name: 'Red onion', category: 'produce', unit: 'pcs' },
  sweetPotato: { name: 'Sweet potato', category: 'produce', unit: 'pcs' },
  snapPeas: { name: 'Sugar snap peas', category: 'produce', unit: 'g' },
  edamame: { name: 'Frozen edamame', category: 'produce', unit: 'g' },
  garlic: { name: 'Garlic', category: 'produce', unit: 'pcs' },
  ginger: { name: 'Ginger', category: 'produce', unit: 'g' },
  chilli: { name: 'Red chilli', category: 'produce', unit: 'pcs' },
  coriander: { name: 'Coriander', category: 'produce', unit: 'bunch' },
  // Meat & fish
  chicken: { name: 'Chicken breast', category: 'meat', unit: 'g' },
  chickenThigh: { name: 'Chicken thigh', category: 'meat', unit: 'g' },
  beefMince: { name: 'Lean beef mince', category: 'meat', unit: 'g' },
  steak: { name: 'Rump steak', category: 'meat', unit: 'g' },
  salmon: { name: 'Salmon fillet', category: 'meat', unit: 'g' },
  tuna: { name: 'Sashimi tuna', category: 'meat', unit: 'g' },
  prawns: { name: 'Raw prawns', category: 'meat', unit: 'g' },
  ham: { name: 'Shaved ham', category: 'meat', unit: 'g' },
  // Dairy & eggs
  eggs: { name: 'Eggs', category: 'dairy', unit: 'pcs' },
  feta: { name: 'Feta', category: 'dairy', unit: 'g' },
  cheddar: { name: 'Cheddar', category: 'dairy', unit: 'g' },
  yoghurt: { name: 'Greek yoghurt', category: 'dairy', unit: 'g' },
  cottageCheese: { name: 'Cottage cheese', category: 'dairy', unit: 'g' },
  milk: { name: 'Milk', category: 'dairy', unit: 'ml' },
  // Bread & grains
  sourdough: { name: 'Sourdough', category: 'bakery', unit: 'slices' },
  rye: { name: 'Rye bread', category: 'bakery', unit: 'slices' },
  buns: { name: 'Wholemeal burger buns', category: 'bakery', unit: 'pcs' },
  tortillas: { name: 'Corn tortillas', category: 'bakery', unit: 'pcs' },
  flatbread: { name: 'Flatbread', category: 'bakery', unit: 'pcs' },
  bananaBread: { name: 'Banana bread', category: 'bakery', unit: 'slices' },
  quinoa: { name: 'Quinoa', category: 'bakery', unit: 'g' },
  rice: { name: 'Brown rice', category: 'bakery', unit: 'g' },
  noodles: { name: 'Egg noodles', category: 'bakery', unit: 'g' },
  oats: { name: 'Rolled oats', category: 'bakery', unit: 'g' },
  granola: { name: 'Granola', category: 'bakery', unit: 'g' },
  // Pantry
  chickpeas: { name: 'Chickpeas', category: 'pantry', unit: 'g' },
  lentils: { name: 'Lentils', category: 'pantry', unit: 'g' },
  tinnedTomatoes: { name: 'Tinned tomatoes', category: 'pantry', unit: 'g' },
  coconutMilk: { name: 'Light coconut milk', category: 'pantry', unit: 'ml' },
  curryPaste: { name: 'Curry paste', category: 'pantry', unit: 'tbsp' },
  soy: { name: 'Soy sauce', category: 'pantry', unit: 'tbsp' },
  tahini: { name: 'Tahini', category: 'pantry', unit: 'tbsp' },
  honey: { name: 'Honey', category: 'pantry', unit: 'tbsp' },
  peanutButter: { name: 'Peanut butter', category: 'pantry', unit: 'tbsp' },
  chia: { name: 'Chia seeds', category: 'pantry', unit: 'g' },
  sesame: { name: 'Sesame seeds', category: 'pantry', unit: 'tbsp' },
  almonds: { name: 'Almonds', category: 'pantry', unit: 'g' },
  mixedNuts: { name: 'Mixed nuts', category: 'pantry', unit: 'g' },
  raisins: { name: 'Raisins', category: 'pantry', unit: 'g' },
  dates: { name: 'Medjool dates', category: 'pantry', unit: 'g' },
  cocoa: { name: 'Cacao powder', category: 'pantry', unit: 'tbsp' },
  proteinPowder: { name: 'Vanilla protein powder', category: 'pantry', unit: 'g' },
  acai: { name: 'Frozen acai packs', category: 'pantry', unit: 'g' },
  granolaBars: { name: 'Oat & almond bars', category: 'pantry', unit: 'pcs' },
} satisfies Record<string, { name: string; category: CategoryId; unit: Unit }>

type IngredientId = keyof typeof INGREDIENTS

type Diet = 'Vegan' | 'Vegetarian'

export interface Dish {
  id: string
  name: string
  /** Square thumbnail for cards. */
  img: string
  /** Wide photo for the meal screen's header. */
  hero: string
  macros: Macros
  /** One serving's ingredients as written in the recipe. */
  ingredients: Partial<Record<IngredientId, number>>
  /** How much bigger than the recipe's serving this portion is. */
  scale: number
  minutes: number
  diet?: Diet
  steps: string[]
}

type Recipe = Pick<Dish, 'name' | 'img' | 'ingredients'> & { macros: Omit<Macros, 'kcal'> }

// One serving of each dish as it's written up in the recipe. The planner
// scales these to the day's targets (see `portion`). The first three
// breakfasts, three mains and the energy bites are the Figma file's dishes;
// the rest use free photos from Unsplash.
const RECIPES = {
  // Breakfasts
  avoToast: { name: 'Avocado toasts', img: 'meal-avocado-toast.webp', macros: { p: 14, c: 38, f: 22 },
    ingredients: { sourdough: 2, avocado: 1, lemon: 1, feta: 30 } },
  smoothieBowl: { name: 'Dragon Smoothie Bowl', img: 'meal-dragon-smoothie.webp', macros: { p: 18, c: 62, f: 9 },
    ingredients: { dragonFruit: 150, banana: 1, yoghurt: 100, granola: 30, strawberries: 80 } },
  eggBites: { name: 'Ham & Cheddar Egg Bites', img: 'meal-egg-bites.webp', macros: { p: 21, c: 4, f: 15 },
    ingredients: { eggs: 3, ham: 50, cheddar: 30, spinach: 30 } },
  berryOats: { name: 'Berry overnight oats', img: 'meal-berry-overnight-oats.webp', macros: { p: 20, c: 55, f: 10 },
    ingredients: { oats: 50, yoghurt: 100, raspberries: 80, chia: 10 } },
  shakshuka: { name: 'Shakshuka', img: 'meal-shakshuka.webp', macros: { p: 20, c: 22, f: 18 },
    ingredients: { eggs: 3, tinnedTomatoes: 400, redOnion: 1, capsicum: 1, sourdough: 1 } },
  pbBowl: { name: 'Peanut butter banana bowl', img: 'meal-pb-banana-bowl.webp', macros: { p: 22, c: 58, f: 18 },
    ingredients: { yoghurt: 150, banana: 1, peanutButter: 1, granola: 30 } },
  omelette: { name: 'Herb omelette with salad', img: 'meal-herb-omelette.webp', macros: { p: 26, c: 12, f: 22 },
    ingredients: { eggs: 3, spinach: 30, saladLeaves: 40, tomatoes: 60, feta: 20 } },
  pancakes: { name: 'Protein pancakes with berries', img: 'meal-protein-pancakes.webp', macros: { p: 30, c: 48, f: 8 },
    ingredients: { oats: 50, eggs: 2, proteinPowder: 30, blueberries: 60, raspberries: 40 } },
  appleOats: { name: 'Apple & almond porridge', img: 'meal-apple-almond-porridge.webp', macros: { p: 16, c: 60, f: 14 },
    ingredients: { oats: 60, milk: 250, apple: 1, almonds: 15, raspberries: 50 } },
  avoEggs: { name: 'Avocado toast with fried eggs', img: 'meal-avocado-fried-eggs.webp', macros: { p: 22, c: 34, f: 26 },
    ingredients: { sourdough: 2, avocado: 1, eggs: 2 } },
  acaiBowl: { name: 'Acai bowl with berries', img: 'meal-acai-bowl.webp', macros: { p: 10, c: 64, f: 12 },
    ingredients: { acai: 100, banana: 1, blueberries: 60, granola: 30 } },
  parfait: { name: 'Strawberry yoghurt parfait', img: 'meal-strawberry-parfait.webp', macros: { p: 24, c: 42, f: 8 },
    ingredients: { yoghurt: 200, strawberries: 100, granola: 30, honey: 1 } },
  chiaPudding: { name: 'Mango chia pudding', img: 'meal-mango-chia-pudding.webp', macros: { p: 12, c: 40, f: 16 },
    ingredients: { chia: 30, milk: 200, mango: 1 } },
  granolaBowl: { name: 'Banana granola bowl', img: 'meal-banana-granola-bowl.webp', macros: { p: 18, c: 56, f: 14 },
    ingredients: { yoghurt: 150, granola: 40, banana: 1, strawberries: 50 } },
  strawberryOats: { name: 'Strawberry overnight oats', img: 'meal-strawberry-oats.webp', macros: { p: 18, c: 52, f: 9 },
    ingredients: { oats: 50, milk: 150, yoghurt: 80, strawberries: 80 } },
  ryeEggs: { name: 'Poached eggs on rye', img: 'meal-poached-eggs-rye.webp', macros: { p: 20, c: 30, f: 14 },
    ingredients: { rye: 2, eggs: 2, spinach: 30 } },

  // Mains
  buddhaBowl: { name: 'Grilled Chicken Buddha Bowl', img: 'meal-buddha-bowl.webp', macros: { p: 42, c: 55, f: 18 },
    ingredients: { chicken: 150, quinoa: 60, avocado: 1, spinach: 40, tomatoes: 100, tahini: 1 } },
  chickpeaBurgers: { name: 'Loaded Chickpea Burgers', img: 'meal-chickpea-burgers.webp', macros: { p: 24, c: 68, f: 16 },
    ingredients: { chickpeas: 200, buns: 1, redOnion: 1, yoghurt: 50, tomatoes: 60 } },
  lentilSalad: { name: 'Sweet Potato & Lentil Salad', img: 'meal-lentil-salad.webp', macros: { p: 19, c: 64, f: 12 },
    ingredients: { sweetPotato: 1, lentils: 80, rocket: 40, honey: 1, feta: 30 } },
  salmonPoke: { name: 'Salmon poke bowl', img: 'meal-salmon-poke.webp', macros: { p: 34, c: 62, f: 18 },
    ingredients: { salmon: 150, rice: 75, edamame: 50, cucumber: 1, avocado: 1, soy: 1 } },
  tunaPoke: { name: 'Tuna & edamame poke bowl', img: 'meal-tuna-poke.webp', macros: { p: 38, c: 58, f: 12 },
    ingredients: { tuna: 150, rice: 75, edamame: 60, avocado: 1, sesame: 1 } },
  chickenSalad: { name: 'Crunchy sesame chicken salad', img: 'meal-crunchy-chicken-salad.webp', macros: { p: 40, c: 22, f: 16 },
    ingredients: { chicken: 150, lettuce: 1, carrot: 1, sesame: 1, soy: 1 } },
  steakSalad: { name: 'Steak salad with feta', img: 'meal-steak-salad.webp', macros: { p: 42, c: 16, f: 22 },
    ingredients: { steak: 180, saladLeaves: 80, cucumber: 1, tomatoes: 100, feta: 30 } },
  salmonSalad: { name: 'Grilled salmon salad', img: 'meal-salmon-salad.webp', macros: { p: 36, c: 14, f: 24 },
    ingredients: { salmon: 150, saladLeaves: 80, carrot: 1, tomatoes: 80, lemon: 1 } },
  stirFry: { name: 'Chicken noodle stir-fry', img: 'meal-chicken-stir-fry.webp', macros: { p: 38, c: 64, f: 12 },
    ingredients: { chicken: 150, noodles: 80, capsicum: 1, ginger: 10, soy: 2 } },
  tacos: { name: 'Beef tacos with coriander', img: 'meal-beef-tacos.webp', macros: { p: 34, c: 42, f: 20 },
    ingredients: { beefMince: 150, tortillas: 3, redOnion: 1, coriander: 1, lime: 1 } },
  flatbread: { name: 'Grilled chicken & flatbread', img: 'meal-chicken-flatbread.webp', macros: { p: 44, c: 46, f: 16 },
    ingredients: { chicken: 180, flatbread: 1, cucumber: 1, yoghurt: 50, lemon: 1 } },
  curry: { name: 'Chicken curry with rice', img: 'meal-chicken-curry.webp', macros: { p: 40, c: 58, f: 18 },
    ingredients: { chickenThigh: 180, curryPaste: 1, coconutMilk: 100, rice: 75, spinach: 40 } },
  creamySalmon: { name: 'Salmon in tomato cream sauce', img: 'meal-creamy-salmon.webp', macros: { p: 36, c: 12, f: 28 },
    ingredients: { salmon: 160, tinnedTomatoes: 200, garlic: 1, lemon: 1, spinach: 40 } },
  prawns: { name: 'Garlic chilli prawns with rice', img: 'meal-garlic-prawns.webp', macros: { p: 34, c: 50, f: 14 },
    ingredients: { prawns: 200, rice: 75, garlic: 1, chilli: 1, lemon: 1 } },

  // Snacks
  energyBites: { name: 'Honey Almond Energy Bites', img: 'meal-energy-bites.webp', macros: { p: 7, c: 22, f: 13 },
    ingredients: { almonds: 30, oats: 40, honey: 1, cocoa: 1 } },
  applePB: { name: 'Apple slices & peanut butter', img: 'meal-apple-peanut-butter.webp', macros: { p: 8, c: 26, f: 16 },
    ingredients: { apple: 1, peanutButter: 2 } },
  hummus: { name: 'Hummus with cucumber', img: 'meal-hummus-cucumber.webp', macros: { p: 8, c: 18, f: 14 },
    ingredients: { chickpeas: 100, tahini: 1, lemon: 1, cucumber: 1 } },
  yoghurtHoney: { name: 'Greek yoghurt & honey', img: 'meal-yoghurt-honey.webp', macros: { p: 20, c: 18, f: 5 },
    ingredients: { yoghurt: 200, honey: 1 } },
  cottageCheese: { name: 'Cottage cheese bowl', img: 'meal-cottage-cheese.webp', macros: { p: 22, c: 8, f: 5 },
    ingredients: { cottageCheese: 200 } },
  berrySmoothie: { name: 'Berry protein smoothie', img: 'meal-berry-smoothie.webp', macros: { p: 26, c: 30, f: 4 },
    ingredients: { proteinPowder: 30, frozenBerries: 100, banana: 1, milk: 250 } },
  trailMix: { name: 'Nut & raisin trail mix', img: 'meal-trail-mix.webp', macros: { p: 8, c: 22, f: 20 },
    ingredients: { mixedNuts: 40, raisins: 20 } },
  blissBalls: { name: 'Date & cacao bliss balls', img: 'meal-bliss-balls.webp', macros: { p: 6, c: 30, f: 12 },
    ingredients: { dates: 60, almonds: 20, cocoa: 1 } },
  greenSmoothie: { name: 'Green smoothie', img: 'meal-green-smoothie.webp', macros: { p: 6, c: 24, f: 10 },
    ingredients: { spinach: 40, avocado: 1, lime: 1, banana: 1 } },
  bananaBread: { name: 'Banana bread', img: 'meal-banana-bread.webp', macros: { p: 6, c: 40, f: 10 },
    ingredients: { bananaBread: 2 } },
  berryCup: { name: 'Berry granola cup', img: 'meal-berry-granola-cup.webp', macros: { p: 12, c: 32, f: 9 },
    ingredients: { yoghurt: 120, granola: 25, blueberries: 40, raspberries: 40 } },
  avoEggToast: { name: 'Avocado & egg toast', img: 'meal-avocado-egg-toast.webp', macros: { p: 14, c: 18, f: 16 },
    ingredients: { sourdough: 1, avocado: 1, eggs: 1 } },
  granolaBar: { name: 'Oat & almond bar', img: 'meal-granola-bar.webp', macros: { p: 6, c: 28, f: 10 },
    ingredients: { granolaBars: 1 } },
  snapPeas: { name: 'Sugar snap peas', img: 'meal-sugar-snap-peas.webp', macros: { p: 5, c: 14, f: 1 },
    ingredients: { snapPeas: 150 } },
} satisfies Record<string, Recipe>

type DishId = keyof typeof RECIPES

type Method = { minutes: number; diet?: Diet; steps: string[] }

// How each dish is made, for the meal screen's Method tab.
const METHODS: Record<DishId, Method> = {
  avoToast: { minutes: 10, diet: 'Vegetarian', steps: [
    'Toast the bread : Toast the sourdough until golden and crisp.',
    'Smash the avocado : Mash the avocado with a squeeze of lemon, salt and pepper.',
    'Assemble : Spread the avocado over the toast and crumble the feta on top.',
  ] },
  smoothieBowl: { minutes: 5, diet: 'Vegetarian', steps: [
    'Blend : Blend the frozen dragon fruit, banana and half the yoghurt until thick and smooth.',
    'Pour : Spoon into a bowl and swirl through the rest of the yoghurt.',
    'Top : Finish with sliced strawberries and granola.',
  ] },
  eggBites: { minutes: 25, steps: [
    'Heat the oven : Preheat to 180°C and grease a muffin tray.',
    'Fill the tray : Divide the ham, cheddar and spinach between the holes.',
    'Add the eggs : Whisk the eggs with salt and pepper and pour over the filling.',
    'Bake : Bake for 18–20 minutes until set and golden.',
  ] },
  berryOats: { minutes: 5, diet: 'Vegetarian', steps: [
    'Mix : Stir the oats, yoghurt and chia seeds together in a jar.',
    'Layer : Top with the raspberries, pressing a few into the oats.',
    'Chill : Cover and refrigerate overnight. Eat straight from the jar.',
  ] },
  shakshuka: { minutes: 25, diet: 'Vegetarian', steps: [
    'Soften the veg : Cook the sliced onion and capsicum in a pan for 5 minutes.',
    'Simmer the sauce : Add the tinned tomatoes, season and simmer for 8 minutes.',
    'Cook the eggs : Make three wells, crack in the eggs, cover and cook for 5–6 minutes.',
    'Serve : Scatter with herbs and serve with toasted sourdough.',
  ] },
  pbBowl: { minutes: 5, diet: 'Vegetarian', steps: [
    'Base : Spoon the Greek yoghurt into a bowl.',
    'Top : Add the sliced banana, granola and a drizzle of peanut butter.',
  ] },
  omelette: { minutes: 10, diet: 'Vegetarian', steps: [
    'Whisk : Beat the eggs with salt, pepper and chopped herbs.',
    'Cook : Wilt the spinach in a pan, pour in the eggs and cook until just set.',
    'Fold and serve : Add the feta, fold and serve with the salad leaves and tomatoes.',
  ] },
  pancakes: { minutes: 15, diet: 'Vegetarian', steps: [
    'Blend the batter : Blend the oats, eggs and protein powder with a splash of water.',
    'Cook : Pour small rounds into a hot pan and flip when bubbles appear.',
    'Serve : Stack and top with the blueberries and raspberries.',
  ] },
  appleOats: { minutes: 10, diet: 'Vegetarian', steps: [
    'Cook the oats : Simmer the oats in the milk for 5 minutes, stirring.',
    'Prep the fruit : Slice the apple and roughly chop the almonds.',
    'Serve : Top the porridge with the apple, almonds and raspberries.',
  ] },
  avoEggs: { minutes: 10, diet: 'Vegetarian', steps: [
    'Toast : Toast the sourdough.',
    'Fry the eggs : Fry the eggs in a little oil until the whites are set.',
    'Assemble : Smash the avocado onto the toast and top with the eggs.',
  ] },
  acaiBowl: { minutes: 5, diet: 'Vegan', steps: [
    'Blend : Blend the acai with half the banana until thick.',
    'Top : Pour into a bowl and add the rest of the banana, the blueberries and granola.',
  ] },
  parfait: { minutes: 5, diet: 'Vegetarian', steps: [
    'Layer : Layer the yoghurt, sliced strawberries and granola in a glass.',
    'Finish : Drizzle the honey over the top.',
  ] },
  chiaPudding: { minutes: 10, diet: 'Vegetarian', steps: [
    'Mix : Stir the chia seeds into the milk and leave for 10 minutes, then stir again.',
    'Set : Refrigerate overnight until thick.',
    'Top : Blend half the mango and spoon it over, then add the rest in cubes.',
  ] },
  granolaBowl: { minutes: 5, diet: 'Vegetarian', steps: [
    'Base : Spoon the yoghurt into a bowl.',
    'Top : Add the granola, sliced banana and strawberries.',
  ] },
  strawberryOats: { minutes: 5, diet: 'Vegetarian', steps: [
    'Mix : Combine the oats, milk and yoghurt in a jar.',
    'Top : Add the sliced strawberries.',
    'Chill : Refrigerate overnight.',
  ] },
  ryeEggs: { minutes: 10, diet: 'Vegetarian', steps: [
    'Poach : Poach the eggs in barely simmering water for 3 minutes.',
    'Wilt : Wilt the spinach in a pan with a pinch of salt.',
    'Serve : Pile the spinach and eggs onto toasted rye.',
  ] },
  buddhaBowl: { minutes: 25, steps: [
    'Cook the quinoa : Simmer the quinoa for 12–15 minutes, then drain.',
    'Grill the chicken : Season and grill for 5–6 minutes a side, then slice.',
    'Build the bowl : Add the spinach, quinoa, tomatoes, avocado and chicken.',
    'Dress : Thin the tahini with lemon and water and drizzle over.',
  ] },
  chickpeaBurgers: { minutes: 30, diet: 'Vegetarian', steps: [
    'Make the patties : Mash the chickpeas with half the onion, season and shape into patties.',
    'Cook : Pan-fry for 4 minutes a side until golden.',
    'Assemble : Fill the buns with the patties, yoghurt, tomato and the rest of the onion.',
  ] },
  lentilSalad: { minutes: 30, diet: 'Vegetarian', steps: [
    'Roast : Cube the sweet potato and roast at 200°C for 25 minutes.',
    'Cook the lentils : Simmer the lentils for 20 minutes, then drain.',
    'Glaze : Toss the hot sweet potato with the honey.',
    'Serve : Mix with the lentils and rocket and crumble over the feta.',
  ] },
  salmonPoke: { minutes: 20, steps: [
    'Cook the rice : Cook the rice and let it cool slightly.',
    'Prep : Cube the salmon and toss it in the soy sauce. Slice the cucumber and avocado.',
    'Assemble : Top the rice with the salmon, edamame, cucumber and avocado.',
  ] },
  tunaPoke: { minutes: 20, steps: [
    'Cook the rice : Cook the rice and let it cool slightly.',
    'Prep : Cube the tuna, slice the avocado and defrost the edamame.',
    'Assemble : Arrange everything over the rice and finish with sesame seeds.',
  ] },
  chickenSalad: { minutes: 20, steps: [
    'Cook the chicken : Pan-fry the chicken for 6 minutes a side, then slice.',
    'Prep the veg : Shred the lettuce and grate the carrot.',
    'Toss : Combine everything with the soy sauce and sesame seeds.',
  ] },
  steakSalad: { minutes: 20, steps: [
    'Sear the steak : Cook in a very hot pan for 3 minutes a side, then rest for 5.',
    'Build the salad : Add the leaves, sliced cucumber and halved tomatoes.',
    'Serve : Slice the steak over the top and crumble on the feta.',
  ] },
  salmonSalad: { minutes: 20, steps: [
    'Cook the salmon : Season and pan-fry skin side down for 4 minutes, then 2 on the other side.',
    'Prep : Ribbon the carrot and halve the tomatoes.',
    'Serve : Pile the salad, top with the salmon and squeeze over the lemon.',
  ] },
  stirFry: { minutes: 20, steps: [
    'Cook the noodles : Cook the noodles, then drain and rinse.',
    'Stir-fry : Fry the sliced chicken with the ginger for 5 minutes, then add the capsicum.',
    'Toss : Add the noodles and soy sauce and toss for 2 minutes.',
  ] },
  tacos: { minutes: 20, steps: [
    'Brown the mince : Fry the beef mince with salt and spices until browned.',
    'Warm the tortillas : Heat the tortillas in a dry pan.',
    'Fill : Fill with the beef, chopped onion and coriander, with lime to squeeze.',
  ] },
  flatbread: { minutes: 25, steps: [
    'Marinate : Toss the chicken in lemon, salt and a little yoghurt.',
    'Grill : Grill for 6 minutes a side.',
    'Serve : Slice and serve on the warm flatbread with cucumber and the rest of the yoghurt.',
  ] },
  curry: { minutes: 30, steps: [
    'Cook the rice : Simmer the rice for 15 minutes.',
    'Brown the chicken : Fry the chicken pieces until golden, then stir in the curry paste.',
    'Simmer : Add the coconut milk and simmer for 12 minutes.',
    'Finish : Stir in the spinach and serve over the rice.',
  ] },
  creamySalmon: { minutes: 25, steps: [
    'Make the sauce : Soften the garlic, add the tinned tomatoes and simmer for 10 minutes.',
    'Add the salmon : Nestle in the salmon, cover and cook for 8 minutes.',
    'Finish : Stir through the spinach and add a squeeze of lemon.',
  ] },
  prawns: { minutes: 20, steps: [
    'Cook the rice : Simmer the rice for 15 minutes.',
    'Fry the prawns : Fry the garlic and chilli for 1 minute, then the prawns until pink.',
    'Serve : Spoon over the rice with a squeeze of lemon.',
  ] },
  energyBites: { minutes: 15, diet: 'Vegetarian', steps: [
    'Blend : Blitz the almonds and oats with the honey and cacao.',
    'Roll : Roll into small balls and top each with an almond slice.',
    'Chill : Refrigerate for 30 minutes to firm up.',
  ] },
  applePB: { minutes: 5, diet: 'Vegan', steps: [
    'Slice : Core and slice the apple.',
    'Serve : Serve with the peanut butter for dipping.',
  ] },
  hummus: { minutes: 10, diet: 'Vegan', steps: [
    'Blend : Blend the chickpeas, tahini and lemon juice with a splash of water until smooth.',
    'Serve : Serve with the cucumber cut into sticks.',
  ] },
  yoghurtHoney: { minutes: 2, diet: 'Vegetarian', steps: [
    'Serve : Spoon the yoghurt into a bowl and drizzle with the honey.',
  ] },
  cottageCheese: { minutes: 2, diet: 'Vegetarian', steps: [
    'Serve : Spoon into a bowl and season with black pepper.',
  ] },
  berrySmoothie: { minutes: 5, diet: 'Vegetarian', steps: [
    'Blend : Blend the berries, banana, protein powder and milk until smooth.',
  ] },
  trailMix: { minutes: 2, diet: 'Vegan', steps: [
    'Mix : Combine the nuts and raisins and portion into a small container.',
  ] },
  blissBalls: { minutes: 15, diet: 'Vegan', steps: [
    'Blend : Blitz the dates, almonds and cacao until sticky.',
    'Roll : Roll into balls.',
    'Chill : Refrigerate for 20 minutes.',
  ] },
  greenSmoothie: { minutes: 5, diet: 'Vegan', steps: [
    'Blend : Blend the spinach, avocado, banana and lime juice with cold water until smooth.',
  ] },
  bananaBread: { minutes: 2, diet: 'Vegetarian', steps: [
    'Serve : Toast the slices lightly if you like and serve warm.',
  ] },
  berryCup: { minutes: 5, diet: 'Vegetarian', steps: [
    'Layer : Layer the yoghurt and granola in a cup.',
    'Top : Finish with the blueberries and raspberries.',
  ] },
  avoEggToast: { minutes: 10, diet: 'Vegetarian', steps: [
    'Boil : Boil the egg for 8 minutes, then cool and slice.',
    'Assemble : Smash the avocado onto the toast and top with the egg.',
  ] },
  granolaBar: { minutes: 1, diet: 'Vegetarian', steps: [
    'Grab and go : Unwrap and enjoy.',
  ] },
  snapPeas: { minutes: 2, diet: 'Vegan', steps: [
    'Rinse : Rinse the snap peas and trim the ends. Eat raw for the crunch.',
  ] },
}

const dish = (id: DishId): Dish => {
  const r: Recipe = RECIPES[id]
  return {
    id, ...r, ...METHODS[id],
    hero: r.img.replace('meal-', 'hero-'),
    macros: { ...r.macros, kcal: kcalOf(r.macros) },
    scale: 1,
  }
}

/** One meal slot on one day, e.g. Saturday's breakfast. */
export interface Meal {
  /** Unique across the plan: `${dayId}:${type}` */
  id: string
  type: MealType
  dishes: Dish[]
}

export interface Day {
  id: string
  /** "Sa" */
  short: string
  /** "27" */
  num: number
  /** "Saturday, 27th December" */
  long: string
  /** The day's targets: same calories and protein every day, carbs and fat shift. */
  targets: Macros
  meals: Meal[]
}

export interface Week {
  /** "Dec 21st – 27th, 2025" */
  range: string
  days: Day[]
}

// Two weeks, a different breakfast, main and snack every day. Saturdays
// start with two breakfast dishes, like Saturday in the Figma frame (which
// also shows avocado toasts, egg bites and the energy bites that day).
const PLAN: { breakfast: DishId[]; main: DishId; snack: DishId }[] = [
  { breakfast: ['berryOats'], main: 'salmonPoke', snack: 'applePB' },
  { breakfast: ['shakshuka'], main: 'buddhaBowl', snack: 'hummus' },
  { breakfast: ['pbBowl'], main: 'tacos', snack: 'yoghurtHoney' },
  { breakfast: ['omelette'], main: 'curry', snack: 'cottageCheese' },
  { breakfast: ['smoothieBowl'], main: 'steakSalad', snack: 'berrySmoothie' },
  { breakfast: ['pancakes'], main: 'chickpeaBurgers', snack: 'trailMix' },
  { breakfast: ['avoToast', 'eggBites'], main: 'stirFry', snack: 'energyBites' },
  { breakfast: ['appleOats'], main: 'tunaPoke', snack: 'blissBalls' },
  { breakfast: ['avoEggs'], main: 'creamySalmon', snack: 'greenSmoothie' },
  { breakfast: ['acaiBowl'], main: 'chickenSalad', snack: 'bananaBread' },
  { breakfast: ['parfait'], main: 'lentilSalad', snack: 'berryCup' },
  { breakfast: ['chiaPudding'], main: 'prawns', snack: 'avoEggToast' },
  { breakfast: ['granolaBowl'], main: 'flatbread', snack: 'granolaBar' },
  { breakfast: ['strawberryOats', 'ryeEggs'], main: 'salmonSalad', snack: 'snapPeas' },
]

const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const ordinal = (n: number) => {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'}`
}

// Daily targets: 2400 kcal (the onboarding Targets screen) and 180 g
// protein every day, a high-protein 30%. The Figma Planner shows 240 g, but
// that's 40% of the calories and makes every portion protein-heavy. What's
// left (2400 − 180 × 4 = 1680 kcal) is split between carbs (4 kcal/g) and
// fat (9 kcal/g), and the split moves day to day, so
// carbs = (1680 − 9 × fat) / 4. Fat steps in 4 g so carbs stay whole.
const KCAL = 2400
const PROTEIN = 180
const FAT_BY_DAY = [72, 80, 64, 76, 68, 84, 88]

function targetsFor(index: number): Macros {
  const f = FAT_BY_DAY[index % FAT_BY_DAY.length]!
  const c = (KCAL - PROTEIN * 4 - f * 9) / 4
  return { kcal: KCAL, p: PROTEIN, c, f }
}

type MacroKey = 'p' | 'c' | 'f'
const MACRO_KEYS: MacroKey[] = ['p', 'c', 'f']

/**
 * Portions the day's dishes so they add up to its targets exactly, the way
 * the app sizes a plan to you. Each macro is scaled on its own across the
 * day: if the recipes come to 120 g of protein and the target is 240 g,
 * every dish's protein doubles. So the protein-rich dishes carry the
 * protein and a snack stays snack-sized. Rounding goes to the dish with
 * the most of that macro, so the day sums to its targets to the gram, and
 * every dish's calories are 4 × protein + 4 × carbs + 9 × fat.
 */
function portion(dishes: Dish[], targets: Macros): Dish[] {
  const out = dishes.map(() => ({ p: 0, c: 0, f: 0 }))
  for (const k of MACRO_KEYS) {
    const total = dishes.reduce((n, d) => n + d.macros[k], 0)
    dishes.forEach((d, i) => { out[i]![k] = Math.round((d.macros[k] / total) * targets[k]) })
    const biggest = dishes.reduce((best, d, i) => (d.macros[k] > dishes[best]!.macros[k] ? i : best), 0)
    out[biggest]![k] += targets[k] - out.reduce((n, m) => n + m[k], 0)
  }
  return dishes.map((d, i) => {
    const kcal = kcalOf(out[i]!)
    return { ...d, macros: { ...out[i]!, kcal }, scale: kcal / d.macros.kcal }
  })
}

function planDay(index: number, dayId: string, targets: Macros): Meal[] {
  const day = PLAN[index % PLAN.length]!
  const slots: [MealType, Dish[]][] = [
    ['breakfast', day.breakfast.map(dish)],
    ['main', [dish(day.main)]],
    ['snack', [dish(day.snack)]],
  ]
  const sized = portion(slots.flatMap(([, ds]) => ds), targets)
  let at = 0
  return slots.map(([type, ds]) => {
    const meal = { id: `${dayId}:${type}`, type, dishes: sized.slice(at, at + ds.length) }
    at += ds.length
    return meal
  })
}

// All date maths is in UTC so the plan reads the same in every timezone.
function buildWeek(start: Date, offset: number): Week {
  const at = (i: number) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    return d
  }
  const days: Day[] = Array.from({ length: 7 }, (_, i) => {
    const d = at(i)
    const id = d.toISOString().slice(0, 10)
    return {
      id,
      short: DAY_SHORT[d.getUTCDay()]!,
      num: d.getUTCDate(),
      long: `${DAY_LONG[d.getUTCDay()]}, ${ordinal(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]}`,
      targets: targetsFor(offset + i),
      meals: planDay(offset + i, id, targetsFor(offset + i)),
    }
  })
  const first = at(0)
  const last = at(6)
  const mon = (d: Date) => MONTHS[d.getUTCMonth()]!.slice(0, 3)
  const range = first.getUTCMonth() === last.getUTCMonth()
    ? `${mon(first)} ${ordinal(first.getUTCDate())} – ${ordinal(last.getUTCDate())}, ${last.getUTCFullYear()}`
    : `${mon(first)} ${ordinal(first.getUTCDate())} – ${mon(last)} ${ordinal(last.getUTCDate())}, ${last.getUTCFullYear()}`
  return { range, days }
}

// Sunday 21 – Saturday 27, the dates on the Figma Planner, in December 2025
// (a month where they fall Sunday to Saturday), then the week after.
export const WEEKS: Week[] = [
  buildWeek(new Date(Date.UTC(2025, 11, 21)), 0),
  buildWeek(new Date(Date.UTC(2025, 11, 28)), 7),
]

export const sumMacros = (dishes: Dish[]): Macros =>
  dishes.reduce((t, d) => ({ p: t.p + d.macros.p, c: t.c + d.macros.c, f: t.f + d.macros.f, kcal: t.kcal + d.macros.kcal }),
    { p: 0, c: 0, f: 0, kcal: 0 })

/** A dish picked in the shopping list picker: which day and meal it's in. */
export const pickId = (mealId: string, dishIndex: number) => `${mealId}:${dishIndex}`

interface ListItem { id: IngredientId; name: string; qty: string }
export interface ListSection { id: CategoryId; label: string; items: ListItem[] }

/**
 * Kitchen-friendly amounts: weights and volumes to the nearest 5, whole
 * items to the nearest half (never below half), always at least something.
 */
const roundAmount = (amount: number, unit: Unit) =>
  unit === 'g' || unit === 'ml' ? Math.max(5, Math.round(amount / 5) * 5) : Math.max(0.5, Math.round(amount * 2) / 2)

const formatQty = (raw: number, unit: Unit) => {
  const amount = roundAmount(raw, unit)
  if (unit === 'g' && amount >= 1000) return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')} kg`
  if (unit === 'ml' && amount >= 1000) return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')} L`
  if (unit === 'slices') return `${amount} ${amount === 1 ? 'slice' : 'slices'}`
  if (unit === 'pcs' && amount <= 1) return `${amount} pc`
  return `${amount} ${unit}`
}

/** A dish's ingredients at the size of its portion, as shown on the meal screen. */
export function ingredientsOf(d: Dish): ListItem[] {
  return (Object.entries(d.ingredients) as [IngredientId, number][])
    .map(([id, amount]) => ({ id, name: INGREDIENTS[id].name, qty: formatQty(amount * d.scale, INGREDIENTS[id].unit) }))
}

/**
 * Merge the ingredients of every picked dish, at the size of each portion,
 * grouped by aisle. Amounts are added up first and rounded once at the end.
 */
export function buildList(week: Week, picked: ReadonlySet<string>): ListSection[] {
  const totals = new Map<IngredientId, number>()
  for (const day of week.days) {
    for (const meal of day.meals) {
      meal.dishes.forEach((d, i) => {
        if (!picked.has(pickId(meal.id, i))) return
        for (const [id, amount] of Object.entries(d.ingredients) as [IngredientId, number][]) {
          totals.set(id, (totals.get(id) ?? 0) + amount * d.scale)
        }
      })
    }
  }
  return CATEGORIES.map(cat => ({
    ...cat,
    items: [...totals]
      .filter(([id]) => INGREDIENTS[id].category === cat.id)
      .map(([id, amount]) => ({ id, name: INGREDIENTS[id].name, qty: formatQty(amount, INGREDIENTS[id].unit) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter(section => section.items.length > 0)
}

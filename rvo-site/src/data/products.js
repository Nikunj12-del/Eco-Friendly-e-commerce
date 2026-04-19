export const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  name: `Eco-Friendly ${['Tote', 'Yoga Bag', 'Bottle Cover', 'Sleeve'][i % 4]} ${i + 1}`,
  price: 999 + (i * 250),
  image: `https://images.unsplash.com/photo-1544816155-12df9643f36${i % 10}?auto=format&fit=crop&w=400&q=80`,
  eco: `Saved ${1 + (i % 3)}.5kg CO2`,
  category: ['Tote Bags', 'Yoga Covers', 'Bottle Covers', 'Accessories'][i % 4],
  inStock: i % 5 !== 4,
  description: "A beautiful, durable everyday carry engineered from completely upcycled materials. Spacious enough for your daily essentials while making a positive impact on the planet."
}));

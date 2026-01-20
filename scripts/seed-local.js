const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create a default admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@droptrend.com' },
    update: { subscription: 'pro', subscriptionPlan: 'yearly', shopifyConnected: true },
    create: {
      email: 'admin@droptrend.com',
      name: 'Admin User',
      password: hashedPassword,
      subscription: 'pro',
      subscriptionPlan: 'yearly',
      language: 'fr',
      shopifyConnected: true
    },
  });

  // Seed Products - High Quality Images
  const products = [
    {
      name: "Correcteur de Posture Intelligent",
      niche: "Santé",
      cost: 12.50,
      price: 49.99,
      margin: 37.49,
      supplier: "https://fr.aliexpress.com/",
      description: "Vibre quand vous vous tenez mal. Technologie brevetée. Marge énorme.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
      score: 98,
      status: "Winner",
      competitors: JSON.stringify(["Upright", "BetterBack"]),
      marketing: JSON.stringify({ platform: "TikTok Ads", angle: "Stop au mal de dos au bureau" })
    },
    {
      name: "Projecteur Galaxie 360°",
      niche: "Décoration",
      cost: 15.00,
      price: 59.90,
      margin: 44.90,
      supplier: "https://fr.aliexpress.com/",
      description: "Transforme n'importe quelle pièce en nébuleuse. Le cadeau parfait.",
      image: "https://images.unsplash.com/photo-1506318137071-a8bcbf67cc77?q=80&w=800&auto=format&fit=crop",
      score: 94,
      status: "Winner",
      competitors: JSON.stringify(["GalaxyLamps"]),
      marketing: JSON.stringify({ platform: "Instagram Reels", angle: "Ambiance Netflix & Chill" })
    },
    {
      name: "Blender Portable USB-C",
      niche: "Cuisine",
      cost: 9.20,
      price: 34.99,
      margin: 25.79,
      supplier: "https://fr.aliexpress.com/",
      description: "Puissant, silencieux et se nettoie tout seul. Idéal pour la gym.",
      image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=800&auto=format&fit=crop",
      score: 91,
      status: "Winner",
      competitors: JSON.stringify(["BlendJet"]),
      marketing: JSON.stringify({ platform: "TikTok Ads", angle: "Smoothie healthy en 30s" })
    },
    {
      name: "Brosse Vapeur Anti-Poils",
      niche: "Animaux",
      cost: 5.50,
      price: 29.95,
      margin: 24.45,
      supplier: "https://fr.aliexpress.com/",
      description: "La vapeur retient les poils volants. Les chats adorent le massage.",
      image: "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=800&auto=format&fit=crop",
      score: 95,
      status: "Winner",
      competitors: JSON.stringify(["CatLove"]),
      marketing: JSON.stringify({ platform: "Facebook Ads", angle: "Fini les poils sur le canapé" })
    },
    {
      name: "Mini Imprimante Sticker",
      niche: "Bureau",
      cost: 19.00,
      price: 69.90,
      margin: 50.90,
      supplier: "https://fr.aliexpress.com/",
      description: "Impression thermique sans encre. Pour les étudiants et le scrapbooking.",
      image: "https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=800&auto=format&fit=crop",
      score: 87,
      status: "Potentiel",
      competitors: JSON.stringify(["Phomemo"]),
      marketing: JSON.stringify({ platform: "Pinterest", angle: "Organisation esthétique" })
    },
    {
      name: "Masseur Cervical Chauffant",
      niche: "Bien-être",
      cost: 22.00,
      price: 79.99,
      margin: 57.99,
      supplier: "https://fr.aliexpress.com/",
      description: "Soulage les tensions du cou en 15 minutes. Indispensable en télétravail.",
      image: "https://images.unsplash.com/photo-1519823551278-64ac927ac280?q=80&w=800&auto=format&fit=crop",
      score: 82,
      status: "Potentiel",
      competitors: JSON.stringify(["NeckRelax"]),
      marketing: JSON.stringify({ platform: "Google Ads", angle: "Soulagement immédiat" })
    },
    {
      name: "Nettoyeur Ultrasonique",
      niche: "Maison",
      cost: 11.00,
      price: 39.99,
      margin: 28.99,
      supplier: "https://fr.aliexpress.com/",
      description: "Rend l'éclat aux bijoux et lunettes en quelques secondes.",
      image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=800&auto=format&fit=crop",
      score: 78,
      status: "Potentiel",
      competitors: JSON.stringify(["SonicClean"]),
      marketing: JSON.stringify({ platform: "TikTok", angle: "Satisfying cleaning ASMR" })
    },
    {
      name: "Lampe Sunset Projection",
      niche: "Décoration",
      cost: 6.50,
      price: 29.99,
      margin: 23.49,
      supplier: "https://fr.aliexpress.com/",
      description: "L'heure dorée à la demande. Indispensable pour les photos Instagram.",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
      score: 75,
      status: "Risqué",
      competitors: JSON.stringify(["SunsetLamp"]),
      marketing: JSON.stringify({ platform: "TikTok", angle: "Vibe check" })
    },
    {
      name: "Tapis de Bain Diatomite",
      niche: "Maison",
      cost: 9.80,
      price: 39.90,
      margin: 30.10,
      supplier: "https://fr.aliexpress.com/",
      description: "Séchage instantané en pierre naturelle. Antibactérien et design.",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
      score: 89,
      status: "Winner",
      competitors: JSON.stringify(["Dorai"]),
      marketing: JSON.stringify({ platform: "Facebook", angle: "Plus jamais de tapis mouillé" })
    },
    {
      name: "Gourde Motivation 2L",
      niche: "Sport",
      cost: 4.50,
      price: 24.99,
      margin: 20.49,
      supplier: "https://fr.aliexpress.com/",
      description: "Marqueurs temporels pour boire plus d'eau. Tendance bien-être.",
      image: "https://images.unsplash.com/photo-1602143407151-0111419500be?q=80&w=800&auto=format&fit=crop",
      score: 83,
      status: "Potentiel",
      competitors: JSON.stringify(["HydrateM8"]),
      marketing: JSON.stringify({ platform: "Instagram", angle: "Santé & Hydratation" })
    }
  ];
  
  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exists) {
        await prisma.product.create({ data: p });
    } else {
        // Update images if exists
        await prisma.product.update({ where: { id: exists.id }, data: { image: p.image } });
    }
  }
  console.log(`Seeded ${products.length} products with HQ images.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

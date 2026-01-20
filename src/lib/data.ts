export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Correcteur de Posture Pro",
    niche: "Santé",
    buyPrice: 12.50,
    sellPrice: 39.99,
    margin: 27.49,
    competition: "Faible",
    platform: "TikTok Ads",
    supplier: "https://fr.aliexpress.com/",
    analysis: "Problème douloureux identifié. Audience large (télétravail). Vidéos virales faciles à produire.",
    image: "https://images.unsplash.com/photo-1594751414186-fd2f46ed8ee9?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 2,
    name: "Projecteur Astro-Lumineux",
    niche: "Décoration",
    buyPrice: 15.00,
    sellPrice: 44.90,
    margin: 29.90,
    competition: "Moyenne",
    platform: "Instagram Reels",
    supplier: "https://fr.aliexpress.com/",
    analysis: "Effet 'Wow' immédiat. Parfait pour le marketing d'influence durant les périodes de fêtes.",
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 3,
    name: "Mélangeur Portable USB",
    niche: "Cuisine",
    buyPrice: 8.20,
    sellPrice: 29.99,
    margin: 21.79,
    competition: "Élevée",
    platform: "TikTok Ads",
    supplier: "https://fr.aliexpress.com/",
    analysis: "Angle Fitness/Santé. Produit saisonnier fort (printemps/été). Focus sur la commodité.",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 4,
    name: "Brosse Vapeur pour Chat",
    niche: "Animaux",
    buyPrice: 5.50,
    sellPrice: 24.95,
    margin: 19.45,
    competition: "Faible",
    platform: "Facebook Ads",
    supplier: "https://fr.aliexpress.com/",
    analysis: "Nouveauté sur le marché. Résout le problème des poils volants. Audience très engagée.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 5,
    name: "Mini Imprimante Thermique",
    niche: "Bureau",
    buyPrice: 19.00,
    sellPrice: 59.90,
    margin: 40.90,
    competition: "Moyenne",
    platform: "Pinterest",
    supplier: "https://fr.aliexpress.com/",
    analysis: "Tendance 'Journaling' et organisation. Forte valeur perçue. Pas de cartouches d'encre nécessaires.",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: 6,
    name: "Appareil de Massage Cervical",
    niche: "Bien-être",
    buyPrice: 22.00,
    sellPrice: 69.99,
    margin: 47.99,
    competition: "Faible",
    platform: "Google Search",
    supplier: "https://fr.aliexpress.com/",
    analysis: "Produit ticket moyen. Idéal pour SEO ou Google Ads. Cible plus âgée avec pouvoir d'achat.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=300"
  }
];

export type Product = typeof MOCK_PRODUCTS[0];

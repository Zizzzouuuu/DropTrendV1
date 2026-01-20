export interface ShopifyTemplate {
    id: string;
    name: string;
    description: string;
    category: 'basic' | 'tech' | 'fashion' | 'beauty' | 'home' | 'sport' | 'luxury' | 'hacking';
    thumbnail: string;
    previewImages: string[];
    features: string[];
    rating: number;
    downloads: number;
    isPro: boolean;
    // Template code
    themeColor: string;
    accentColor: string;
    fontFamily: string;
    layout: 'minimal' | 'classic' | 'modern' | 'editorial' | 'bold';
}

// 10 Templates - 3 Free, 7 PRO
export const SHOPIFY_TEMPLATES: ShopifyTemplate[] = [
    // ========== FREE TEMPLATES (3) ==========
    {
        id: 'starter-clean',
        name: 'Starter Clean',
        description: 'Template minimaliste parfait pour débuter. Design épuré, rapide et 100% responsive. Idéal pour les nouvelles boutiques.',
        category: 'basic',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200'
        ],
        features: ['Design minimaliste', 'Mobile-first', 'Chargement rapide', 'SEO optimisé'],
        rating: 4.6,
        downloads: 2340,
        isPro: false,
        themeColor: '#ffffff',
        accentColor: '#3b82f6',
        fontFamily: 'Inter',
        layout: 'minimal'
    },
    {
        id: 'simple-store',
        name: 'Simple Store',
        description: 'Boutique classique avec hero banner, collections mises en avant et footer complet. Le choix sûr pour débuter.',
        category: 'basic',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200'
        ],
        features: ['Hero personnalisable', 'Grille produits', 'Newsletter intégrée', 'Trust badges'],
        rating: 4.5,
        downloads: 1890,
        isPro: false,
        themeColor: '#f8fafc',
        accentColor: '#10b981',
        fontFamily: 'Roboto',
        layout: 'classic'
    },
    {
        id: 'quick-launch',
        name: 'Quick Launch',
        description: 'One-page optimisé pour les boutiques mono-produit ou dropshipping. Conversion maximale avec CTA puissants.',
        category: 'basic',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=1200'
        ],
        features: ['Single-product focus', 'Sticky add-to-cart', 'Countdown timer', 'Social proof'],
        rating: 4.8,
        downloads: 3210,
        isPro: false,
        themeColor: '#0f172a',
        accentColor: '#f59e0b',
        fontFamily: 'Outfit',
        layout: 'bold'
    },

    // ========== PRO TEMPLATES (7) ==========
    {
        id: 'tech-noir',
        name: 'Tech Noir',
        description: 'Dark mode futuriste pour boutiques tech et gadgets. Tableaux de specs, mode comparaison, effets néon subtils.',
        category: 'tech',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200'
        ],
        features: ['Dark mode natif', 'Tableau de specs', 'Mode comparaison', 'Animations smooth', 'Vidéo produit'],
        rating: 4.9,
        downloads: 1560,
        isPro: true,
        themeColor: '#0a0a0a',
        accentColor: '#22d3ee',
        fontFamily: 'JetBrains Mono',
        layout: 'modern'
    },
    {
        id: 'fashion-elite',
        name: 'Fashion Elite',
        description: 'Style éditorial luxueux pour marques de mode. Larges images, lookbook intégré, typographie élégante.',
        category: 'fashion',
        thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
            'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200'
        ],
        features: ['Lookbook mode', 'Galerie plein écran', 'Quick view', 'Size guide', 'Instagram feed'],
        rating: 4.9,
        downloads: 2100,
        isPro: true,
        themeColor: '#fafafa',
        accentColor: '#1a1a1a',
        fontFamily: 'Playfair Display',
        layout: 'editorial'
    },
    {
        id: 'hacker-ui',
        name: 'Hacker UI',
        description: 'Esthétique terminal/cyberpunk pour boutiques tech, gaming ou NFT. Néon vert, effet matrix, animations glitch.',
        category: 'hacking',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
            'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200'
        ],
        features: ['Terminal aesthetic', 'Effet matrix', 'Animations glitch', 'Cursor custom', 'Sound effects'],
        rating: 4.7,
        downloads: 890,
        isPro: true,
        themeColor: '#000000',
        accentColor: '#00ff00',
        fontFamily: 'Fira Code',
        layout: 'bold'
    },
    {
        id: 'luxury-brand',
        name: 'Luxury Brand',
        description: 'Template premium pour marques haut de gamme. Animations élégantes, micro-interactions, typographie raffinée.',
        category: 'luxury',
        thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687f04?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1441984904996-e0b6ba687f04?w=1200'
        ],
        features: ['Animations premium', 'Parallax scrolling', 'Video backgrounds', 'Custom cursor', 'VIP sections'],
        rating: 5.0,
        downloads: 760,
        isPro: true,
        themeColor: '#1a1a1a',
        accentColor: '#d4af37',
        fontFamily: 'Cormorant Garamond',
        layout: 'editorial'
    },
    {
        id: 'sport-dynamic',
        name: 'Sport Dynamic',
        description: 'Énergie et urgence pour boutiques sport et fitness. Countdown, stock limité, badges performance.',
        category: 'sport',
        thumbnail: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200',
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200'
        ],
        features: ['Urgence intégrée', 'Stock countdown', 'Badge bestseller', 'Reviews dynamiques', 'Size calculator'],
        rating: 4.8,
        downloads: 1340,
        isPro: true,
        themeColor: '#18181b',
        accentColor: '#ef4444',
        fontFamily: 'Bebas Neue',
        layout: 'bold'
    },
    {
        id: 'beauty-glow',
        name: 'Beauty Glow',
        description: 'Design pastel élégant pour cosmétiques et skincare. Couleurs douces, typographie féminine, trust elements.',
        category: 'beauty',
        thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?w=1200',
            'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200'
        ],
        features: ['Palette pastel', 'Before/After slider', 'Ingredient list', 'Routine builder', 'Reviews photos'],
        rating: 4.9,
        downloads: 1780,
        isPro: true,
        themeColor: '#fdf2f8',
        accentColor: '#ec4899',
        fontFamily: 'Quicksand',
        layout: 'modern'
    },
    {
        id: 'home-cozy',
        name: 'Home Cozy',
        description: 'Atmosphère chaleureuse pour décoration et maison. Photos lifestyle, bundles et room planner.',
        category: 'home',
        thumbnail: 'https://images.unsplash.com/photo-1616489953125-c586d60c7f2d?w=800',
        previewImages: [
            'https://images.unsplash.com/photo-1616489953125-c586d60c7f2d?w=1200',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200'
        ],
        features: ['Room inspiration', 'Bundle builder', 'Color matcher', 'AR preview', 'Wishlist partagée'],
        rating: 4.8,
        downloads: 1120,
        isPro: true,
        themeColor: '#fffbeb',
        accentColor: '#78716c',
        fontFamily: 'Lora',
        layout: 'classic'
    }
];

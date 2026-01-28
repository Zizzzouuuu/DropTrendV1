// Fallback mock data when API fails or quota is exceeded
import { AliExpressSearchResult } from './aliexpress';

export const MOCK_PRODUCTS: AliExpressSearchResult[] = [
    {
        id: '10050061234567',
        name: 'Correcteur de Posture Intelligent avec Rappel Vibrant',
        price: 12.99,
        originalPrice: 24.99,
        orders: 5430,
        rating: 4.8,
        imageUrl: 'https://ae01.alicdn.com/kf/S8f6f554032504268a731b75736767667k/Smart-Back-Posture-Corrector-Adjustable-Clavicle-Brace-Shoulder-Training-Belt-Correction-Spine-Support-Top-Back-Body.jpg',
        productUrl: 'https://fr.aliexpress.com/item/10050061234567.html',
        shippingInfo: 'Livraison Gratuite',
        supplier: 'Health & Wellness Store',
        category: 'gadgets'
    },
    {
        id: '10050078901234',
        name: 'Mini Imprimante Portable Bluetooth Sans Encre',
        price: 18.50,
        originalPrice: 35.00,
        orders: 12500,
        rating: 4.9,
        imageUrl: 'https://ae01.alicdn.com/kf/S9d97746244e840688001715456209257g/Mini-Thermal-Printer-Photo-Label-Memo-Receipt-Paper-Printers-Portable-Wireless-Bluetooth-200dpi-Android-IOS-Printers.jpg',
        productUrl: 'https://fr.aliexpress.com/item/10050078901234.html',
        shippingInfo: 'Livraison 7 jours',
        supplier: 'TechGadget Official',
        category: 'gadgets'
    },
    {
        id: '10050045678901',
        name: 'Humidificateur Volcan Aromathérapie LED',
        price: 22.40,
        originalPrice: 45.99,
        orders: 3200,
        rating: 4.7,
        imageUrl: 'https://ae01.alicdn.com/kf/S1b61c565506042189917546636734105J/Volcano-Aroma-Diffuser-Essential-Oil-Lamp-130ml-USB-Portable-Air-Humidifier-with-Color-Night-Light-Fragrance.jpg',
        productUrl: 'https://fr.aliexpress.com/item/10050045678901.html',
        shippingInfo: 'Livraison Gratuite',
        supplier: 'Home Decor Factory',
        category: 'home'
    },
    {
        id: '10050011223344',
        name: 'Nettoyeur de Pinceaux Maquillage Électrique',
        price: 9.99,
        originalPrice: 19.99,
        orders: 8900,
        rating: 4.6,
        imageUrl: 'https://ae01.alicdn.com/kf/S2a0963363406456fa3148102a061486fm/Electric-Makeup-Brush-Cleaner-Dryer-Machine-Fast-Washing-Drying-Beauty-Cosmetic-Tools.jpg',
        productUrl: 'https://fr.aliexpress.com/item/10050011223344.html',
        shippingInfo: 'Livraison Rapide',
        supplier: 'Beauty Essentials',
        category: 'beauty'
    },
    {
        id: '10050099887766',
        name: 'Gamelle Anti-Glouton pour Chien Forme Puzzle',
        price: 14.25,
        originalPrice: 28.50,
        orders: 2100,
        rating: 4.9,
        imageUrl: 'https://ae01.alicdn.com/kf/Sf6c764b8506540509653068987405708J/Pet-Slow-Feeder-Dog-Bowl-Anti-Gulping-Pet-Slower-Food-Feeding-Dishes-Bloat-Stop-Dog-Bowls.jpg',
        productUrl: 'https://fr.aliexpress.com/item/10050099887766.html',
        shippingInfo: 'Livraison Gratuite',
        supplier: 'Happy Pets Store',
        category: 'pets'
    },
    {
        id: '10050055443322',
        name: 'Projecteur Galaxie Astronaute',
        price: 26.90,
        originalPrice: 59.99,
        orders: 15600,
        rating: 4.8,
        imageUrl: 'https://ae01.alicdn.com/kf/S60b37748896041188339596472605335I/Astronaut-Star-Projector-Starry-Sky-Galaxy-Projector-Night-Light-Lamp-for-Bedroom-Room-Decor-Home-Decorative.jpg',
        productUrl: 'https://fr.aliexpress.com/item/10050055443322.html',
        shippingInfo: 'Livraison 5 jours',
        supplier: 'Galaxy Gifts',
        category: 'kids'
    }
];

import { ShopifyTemplate, SHOPIFY_TEMPLATES } from '@/lib/template-data';

/**
 * Get template preview HTML
 */
export function getTemplatePreviewHtml(template: ShopifyTemplate): string {
    const { themeColor, accentColor, fontFamily, name, layout } = template;

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: '${fontFamily}', sans-serif; 
      background: ${themeColor}; 
      color: ${themeColor === '#ffffff' || themeColor === '#fafafa' || themeColor === '#f8fafc' || themeColor === '#fdf2f8' || themeColor === '#fffbeb' ? '#1a1a1a' : '#ffffff'};
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      border-bottom: 1px solid ${accentColor}20;
    }
    .logo { font-size: 1.5rem; font-weight: 700; color: ${accentColor}; }
    .nav { display: flex; gap: 2rem; }
    .nav a { text-decoration: none; color: inherit; opacity: 0.8; }
    .nav a:hover { opacity: 1; color: ${accentColor}; }
    .hero {
      padding: 4rem 2rem;
      text-align: ${layout === 'editorial' ? 'left' : 'center'};
      background: linear-gradient(135deg, ${themeColor}, ${accentColor}15);
    }
    .hero h1 { 
      font-size: ${layout === 'bold' ? '4rem' : '2.5rem'}; 
      margin-bottom: 1rem; 
      ${template.category === 'hacking' ? `text-shadow: 0 0 10px ${accentColor};` : ''}
    }
    .hero p { opacity: 0.7; max-width: 600px; ${layout !== 'editorial' ? 'margin: 0 auto;' : ''} }
    .hero .cta {
      display: inline-block;
      margin-top: 2rem;
      padding: 1rem 2rem;
      background: ${accentColor};
      color: ${themeColor};
      border-radius: ${layout === 'modern' ? '9999px' : '8px'};
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .hero .cta:hover { transform: scale(1.05); }
    .products {
      padding: 4rem 2rem;
    }
    .products h2 { text-align: center; margin-bottom: 2rem; }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .product-card {
      background: ${themeColor === '#ffffff' || themeColor === '#fafafa' || themeColor === '#f8fafc' || themeColor === '#fdf2f8' || themeColor === '#fffbeb' ? '#fff' : accentColor + '10'};
      border: 1px solid ${accentColor}20;
      border-radius: ${layout === 'modern' ? '16px' : '8px'};
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px ${accentColor}20;
    }
    .product-card img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    .product-card .info {
      padding: 1rem;
    }
    .product-card .name { font-weight: 600; margin-bottom: 0.5rem; }
    .product-card .price { color: ${accentColor}; font-weight: 700; }
    .footer {
      padding: 2rem;
      text-align: center;
      border-top: 1px solid ${accentColor}20;
      opacity: 0.6;
      font-size: 0.875rem;
    }
    ${template.category === 'hacking' ? `
    @keyframes glitch {
      0%, 100% { text-shadow: -2px 0 ${accentColor}, 2px 0 #ff0000; }
      50% { text-shadow: 2px 0 ${accentColor}, -2px 0 #ff0000; }
    }
    .logo { animation: glitch 0.3s infinite; }
    ` : ''}
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">${name}</div>
    <nav class="nav">
      <a href="#">Accueil</a>
      <a href="#">Produits</a>
      <a href="#">Collections</a>
      <a href="#">Contact</a>
    </nav>
  </header>
  
  <section class="hero">
    <h1>${layout === 'bold' ? '🔥 ' : ''}Bienvenue sur ${name}</h1>
    <p>Découvrez notre collection exclusive de produits premium. Qualité garantie, livraison rapide.</p>
    <a href="#" class="cta">Découvrir →</a>
  </section>
  
  <section class="products">
    <h2>Nos Produits Phares</h2>
    <div class="product-grid">
      <div class="product-card">
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" alt="Product 1">
        <div class="info">
          <div class="name">Produit Premium</div>
          <div class="price">49.99€</div>
        </div>
      </div>
      <div class="product-card">
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" alt="Product 2">
        <div class="info">
          <div class="name">Produit Exclusif</div>
          <div class="price">79.99€</div>
        </div>
      </div>
      <div class="product-card">
        <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" alt="Product 3">
        <div class="info">
          <div class="name">Produit Tendance</div>
          <div class="price">34.99€</div>
        </div>
      </div>
    </div>
  </section>
  
  <footer class="footer">
    © 2024 ${name}. Template by DropTrend.
  </footer>
</body>
</html>
  `.trim();
}

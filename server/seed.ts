import { db, migrate } from "./db";

const data = [
  {
    category: "🛏️ Sommeil & Couchage",
    items: [
      { name: "Lit à barreaux / cododo", note: "Avec matelas ferme adapté" },
      { name: "Matelas bébé", note: "Ferme, anti-suffocation" },
      { name: "Alèse imperméable x2", note: "Pour les accidents nocturnes" },
      { name: "Turbulette / gigoteuse", note: "TOG adapté à l'été" },
      { name: "Draps-housses x3", note: "60x120 cm standard" },
      { name: "Babyphone vidéo", note: "Avec vision nocturne" },
      { name: "Veilleuse douce", note: "Lumière ambrée pour la nuit" },
      { name: "Mobile musical", note: "Pour endormir et stimuler" },
    ],
  },
  {
    category: "🍼 Alimentation",
    items: [
      { name: "Tire-lait électrique", note: "Si allaitement prévu" },
      { name: "Coussin d'allaitement", note: "Indispensable allaitement ou biberon" },
      { name: "Biberons x4–6", note: "Même si allaitement, utile en secours" },
      { name: "Stérilisateur de biberons", note: "Vapeur ou micro-ondes" },
      { name: "Chauffe-biberon", note: "Pratique pour la nuit" },
      { name: "Coupelles de protection pour seins", note: "En cas d'allaitement" },
      { name: "Bavoirs x6–8", note: "On en use beaucoup !" },
      { name: "Thermomètre de bain", note: "Eau à 37°C idéalement" },
    ],
  },
  {
    category: "🛁 Bain & Hygiène",
    items: [
      { name: "Baignoire bébé ergonomique", note: "Avec transat intégré" },
      { name: "Transat de bain", note: "Mains libres pendant le bain" },
      { name: "Thermomètre rectal", note: "Le plus précis pour bébé" },
      { name: "Mouche-bébé", note: "Indispensable en rhume" },
      { name: "Cotons-tiges bébé (sécurisés)", note: "Protège l'entrée des oreilles" },
      { name: "Crème de change / liniment", note: "Protège des irritations" },
      { name: "Couches nouveau-né + taille 1", note: "Prévoir plusieurs marques" },
      { name: "Lingettes sans alcool x5 paquets", note: "En prévoir dès le départ" },
      { name: "Coton hydrophile", note: "Pour nettoyage doux" },
      { name: "Brosse à cheveux douce", note: "Poils doux pour cuir chevelu" },
    ],
  },
  {
    category: "👕 Vêtements (0–3 mois & été)",
    items: [
      { name: "Bodys à manches courtes x6–8", note: "Taille 50–62, prête pour l'été" },
      { name: "Pyjamas légers x4–6", note: "Coton biologique de préférence" },
      { name: "Chaussettes bébé x6", note: "Tendance à disparaître !" },
      { name: "Chapeau anti-soleil", note: "Août = chaleur, protéger la tête" },
      { name: "Gigoteuse légère été (0,5 TOG)", note: "Adaptée aux nuits chaudes d'août" },
      { name: "Veste légère / cardigan x2", note: "Pour les soirées fraîches ou la clim" },
    ],
  },
  {
    category: "🚗 Transport & Mobilité",
    items: [
      { name: "Siège auto groupe 0+", note: "Obligatoire dès le départ de la maternité" },
      { name: "Poussette combinée (nacelle + siège)", note: "Nacelle pour les premiers mois" },
      { name: "Porte-bébé physiologique", note: "Pratique pour les balades et câlins" },
      { name: "Sac à langer", note: "Avec tapis à langer intégré" },
      { name: "Ombrelle pour poussette", note: "Très utile pour août !" },
    ],
  },
  {
    category: "🎯 Éveil & Jeu",
    items: [
      { name: "Tapis d'éveil", note: "Stimule la vue et la motricité" },
      { name: "Hochets légers x3–4", note: "Dès les premières semaines" },
      { name: "Transat bébé vibrant", note: "Pour poser bébé en sécurité" },
      { name: "Livres souples en tissu", note: "Premières histoires sensorielles" },
      { name: "Anneau de dentition", note: "Prévu pour les prochains mois" },
    ],
  },
  {
    category: "🏠 Confort à la maison",
    items: [
      { name: "Table à langer avec rangements", note: "Ou réducteur sur commode" },
      { name: "Réducteur de baignoire adulte", note: "Alternative économique" },
      { name: "Humidificateur d'air", note: "Utile pour les voies respiratoires" },
      { name: "Vaporisateur de sérum physiologique", note: "Indispensable en rhume" },
      { name: "Coussin de maternité / grossesse", note: "Pour dormir confortablement" },
      { name: "Boîte à pharmacie bébé", note: "Paracétamol, sérum, pommade..." },
    ],
  },
  {
    category: "📋 Administratif & Documents",
    items: [
      { name: "Déclaration de naissance (mairie)", note: "Dans les 5 jours après naissance" },
      { name: "Carnet de santé plastifié", note: "Toujours l'avoir dans le sac" },
      { name: "Inscrire bébé chez un pédiatre", note: "Avant la naissance idéalement !" },
      { name: "Déclarer bébé à la CAF / Sécurité sociale", note: "Allocations familiales" },
    ],
  },
];

migrate();

const seed = db.transaction(() => {
  db.run("DELETE FROM item_links");
  db.run("DELETE FROM items");
  db.run("DELETE FROM categories");
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('categories', 'items', 'item_links')");

  const insertCategory = db.query("INSERT INTO categories (name, sort_order) VALUES (?, ?) RETURNING id");
  const insertItem = db.query(`
    INSERT INTO items (category_id, name, note)
    VALUES (?, ?, ?)
  `);

  data.forEach((category, index) => {
    const row = insertCategory.get(category.category, index) as { id: number };
    for (const item of category.items) {
      insertItem.run(row.id, item.name, item.note);
    }
  });
});

export function seedIfEmpty() {
  const count = db.query("SELECT COUNT(*) as n FROM categories").get() as { n: number };
  if (count.n > 0) return;
  seed();
  console.log(`Seeded ${data.length} categories and ${data.reduce((sum, c) => sum + c.items.length, 0)} items.`);
}

if (import.meta.main) {
  seed();
  console.log(`Seeded ${data.length} categories and ${data.reduce((sum, category) => sum + category.items.length, 0)} items.`);
}

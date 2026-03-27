import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding Nexial Rede Neural...");

  // 1. Create parent tenant (Grupo Pateo)
  const [grupoPateo] = await db
    .insert(schema.tenants)
    .values({
      name: "Grupo Pateo",
      slug: "grupo-pateo",
      primaryColor: "#1a365d",
      secondaryColor: "#e2e8f0",
      plan: "enterprise",
    })
    .returning();

  console.log("Tenant pai criado:", grupoPateo.name);

  // 2. Create child tenants (3 marcas)
  const [petisco] = await db
    .insert(schema.tenants)
    .values({
      name: "Pateo do Petisco",
      slug: "pateo-do-petisco",
      parentId: grupoPateo.id,
      primaryColor: "#b45309",
      secondaryColor: "#fef3c7",
      plan: "pro",
    })
    .returning();

  const [guincho] = await db
    .insert(schema.tenants)
    .values({
      name: "Pateo do Guincho",
      slug: "pateo-do-guincho",
      parentId: grupoPateo.id,
      primaryColor: "#0f766e",
      secondaryColor: "#ccfbf1",
      plan: "pro",
    })
    .returning();

  const [burgues] = await db
    .insert(schema.tenants)
    .values({
      name: "Burgues",
      slug: "burgues",
      parentId: grupoPateo.id,
      primaryColor: "#dc2626",
      secondaryColor: "#fee2e2",
      plan: "pro",
    })
    .returning();

  console.log("3 marcas criadas:", petisco.name, guincho.name, burgues.name);

  // 3. Create admin user
  const passwordHash = await hash("nexial2026", 12);

  const [admin] = await db
    .insert(schema.users)
    .values({
      name: "Henrique Lemos",
      email: "henrique@nexial.pt",
      password: passwordHash,
      role: "admin",
    })
    .returning();

  console.log("Admin criado:", admin.email);

  // 4. Associate admin to all tenants
  await db.insert(schema.tenantUsers).values([
    { tenantId: grupoPateo.id, userId: admin.id, role: "owner" },
    { tenantId: petisco.id, userId: admin.id, role: "owner" },
    { tenantId: guincho.id, userId: admin.id, role: "owner" },
    { tenantId: burgues.id, userId: admin.id, role: "owner" },
  ]);

  console.log("Admin associado a todos os tenants");

  // 5. Create manager users
  const managerHash = await hash("manager2026", 12);

  const [gerentePetisco] = await db
    .insert(schema.users)
    .values({
      name: "Gerente Petisco",
      email: "gerente@pateodopetisco.pt",
      password: managerHash,
      role: "gerente",
    })
    .returning();

  const [gerenteGuincho] = await db
    .insert(schema.users)
    .values({
      name: "Gerente Guincho",
      email: "gerente@pateodoguincho.pt",
      password: managerHash,
      role: "gerente",
    })
    .returning();

  const [gerenteBurgues] = await db
    .insert(schema.users)
    .values({
      name: "Gerente Burgues",
      email: "gerente@burgues.pt",
      password: managerHash,
      role: "gerente",
    })
    .returning();

  await db.insert(schema.tenantUsers).values([
    { tenantId: petisco.id, userId: gerentePetisco.id, role: "manager" },
    { tenantId: guincho.id, userId: gerenteGuincho.id, role: "manager" },
    { tenantId: burgues.id, userId: gerenteBurgues.id, role: "manager" },
  ]);

  console.log("3 gerentes criados");

  // 6. Create restaurant settings for each marca
  const brands = [
    {
      tenantId: petisco.id,
      name: "Pateo do Petisco",
      slug: "pateo-do-petisco",
      currency: "EUR",
      timezone: "Europe/Lisbon",
    },
    {
      tenantId: guincho.id,
      name: "Pateo do Guincho",
      slug: "pateo-do-guincho",
      currency: "EUR",
      timezone: "Europe/Lisbon",
    },
    {
      tenantId: burgues.id,
      name: "Burgues",
      slug: "burgues",
      currency: "EUR",
      timezone: "Europe/Lisbon",
    },
  ];

  for (const brand of brands) {
    await db.insert(schema.restaurantSettings).values(brand);
  }

  console.log("Settings dos 3 restaurantes criados");

  // 7. Create sample menu categories for Petisco
  const [entradas] = await db
    .insert(schema.menuCategories)
    .values({ tenantId: petisco.id, name: "Entradas", sortOrder: 1 })
    .returning();

  const [pratos] = await db
    .insert(schema.menuCategories)
    .values({ tenantId: petisco.id, name: "Pratos Principais", sortOrder: 2 })
    .returning();

  const [sobremesas] = await db
    .insert(schema.menuCategories)
    .values({ tenantId: petisco.id, name: "Sobremesas", sortOrder: 3 })
    .returning();

  // 8. Create sample menu items
  await db.insert(schema.menuItems).values([
    {
      tenantId: petisco.id,
      categoryId: entradas.id,
      name: "Pica-Pau",
      price: "12.50",
      description: "Cubos de carne com pickles e molho picante",
    },
    {
      tenantId: petisco.id,
      categoryId: entradas.id,
      name: "Ameijoas a Bulhao Pato",
      price: "14.00",
      description: "Ameijoas frescas com azeite, alho e coentros",
    },
    {
      tenantId: petisco.id,
      categoryId: pratos.id,
      name: "Bacalhau a Lagareiro",
      price: "22.00",
      description: "Lombo de bacalhau com batata a murro",
    },
    {
      tenantId: petisco.id,
      categoryId: pratos.id,
      name: "Polvo a Lagareiro",
      price: "24.50",
      description: "Polvo grelhado com batata e azeite",
    },
    {
      tenantId: petisco.id,
      categoryId: pratos.id,
      name: "Secretos de Porco Preto",
      price: "18.00",
      description: "Secretos grelhados com salada",
    },
    {
      tenantId: petisco.id,
      categoryId: sobremesas.id,
      name: "Pastel de Nata",
      price: "3.50",
      description: "Pastel de nata artesanal",
    },
    {
      tenantId: petisco.id,
      categoryId: sobremesas.id,
      name: "Mousse de Chocolate",
      price: "6.00",
      description: "Mousse de chocolate negro",
    },
  ]);

  console.log("Menu do Pateo do Petisco criado (7 itens)");

  // 9. Create sample customers
  const sampleCustomers = [
    {
      tenantId: petisco.id,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "+351912345678",
      visits: 12,
      totalSpent: "450.00",
    },
    {
      tenantId: petisco.id,
      name: "Joao Santos",
      email: "joao@email.com",
      phone: "+351923456789",
      visits: 8,
      totalSpent: "320.00",
    },
    {
      tenantId: petisco.id,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "+351934567890",
      visits: 5,
      totalSpent: "180.00",
    },
    {
      tenantId: guincho.id,
      name: "Pedro Ferreira",
      email: "pedro@email.com",
      phone: "+351945678901",
      visits: 15,
      totalSpent: "890.00",
    },
    {
      tenantId: guincho.id,
      name: "Sofia Martins",
      email: "sofia@email.com",
      phone: "+351956789012",
      visits: 3,
      totalSpent: "120.00",
    },
    {
      tenantId: burgues.id,
      name: "Miguel Oliveira",
      email: "miguel@email.com",
      phone: "+351967890123",
      visits: 20,
      totalSpent: "260.00",
    },
    {
      tenantId: burgues.id,
      name: "Ines Rodrigues",
      email: "ines@email.com",
      phone: "+351978901234",
      visits: 10,
      totalSpent: "140.00",
    },
  ];

  await db.insert(schema.customers).values(sampleCustomers);
  console.log("7 clientes de exemplo criados");

  console.log("\nSeed concluido!");
  console.log("Login: henrique@nexial.pt / nexial2026");
  console.log("Gerentes: gerente@pateodopetisco.pt / manager2026");
}

seed().catch(console.error);

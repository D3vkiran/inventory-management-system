const seedState = () => {
  const adminId = uid("user");
  const supplierA = uid("supplier");
  const supplierB = uid("supplier");
  const productA = uid("product");
  const productB = uid("product");
  const productC = uid("product");

  return {
    users: [
      { id: adminId, name: "Owner", email: "admin@example.com", password: "admin123", role: "Admin" }
    ],
    sessionUserId: null,
    suppliers: [
      { id: supplierA, name: "Metro Wholesale", contact: "Nina Patel", email: "orders@metro.example", phone: "555-0131", rating: 5, notes: "Reliable carton quality and quick replacements." },
      { id: supplierB, name: "Retail Outlet Deals", contact: "Carlos Smith", email: "supply@outlet.example", phone: "555-0188", rating: 4, notes: "Best for seasonal bundles." }
    ],
    products: [
      { id: productA, sku: "AMZ-BAG-001", asin: "B0BAG001", upc: "810000100001", name: "Travel Organizer Bag", brand: "PackRight", category: "Travel", size: "M", color: "Black", image: "", reorderPoint: 12, targetStock: 80, defaultCost: 8.5, defaultPrice: 22.99 },
      { id: productB, sku: "AMZ-KIT-044", asin: "B0KIT044", upc: "810000100044", name: "Silicone Kitchen Set", brand: "CookNest", category: "Kitchen", size: "12 pc", color: "Gray", image: "", reorderPoint: 10, targetStock: 60, defaultCost: 11, defaultPrice: 29.99 },
      { id: productC, sku: "EBY-LMP-210", asin: "", upc: "810000100210", name: "Rechargeable Desk Lamp", brand: "BrightDock", category: "Home Office", size: "Standard", color: "White", image: "", reorderPoint: 8, targetStock: 45, defaultCost: 13.75, defaultPrice: 34.5 }
    ],
    inventory: [
      { id: uid("stock"), productId: productA, location: "Home Storage", status: "available", quantity: 28 },
      { id: uid("stock"), productId: productA, location: "Amazon FBA", status: "available", quantity: 40 },
      { id: uid("stock"), productId: productB, location: "Warehouse", status: "available", quantity: 16 },
      { id: uid("stock"), productId: productB, location: "Amazon FBA", status: "reserved", quantity: 5 },
      { id: uid("stock"), productId: productC, location: "Home Storage", status: "available", quantity: 7 },
      { id: uid("stock"), productId: productC, location: "Returned Inventory", status: "returned", quantity: 2 }
    ],
    purchases: [
      { id: uid("purchase"), productId: productA, supplierId: supplierA, date: today(), quantity: 68, unitCost: 8.5, invoice: "MW-1007", location: "Home Storage", notes: "Opening batch." },
      { id: uid("purchase"), productId: productB, supplierId: supplierB, date: today(), quantity: 21, unitCost: 11, invoice: "ROD-231", location: "Warehouse", notes: "Promo lot." }
    ],
    sales: [
      { id: uid("sale"), productId: productA, date: today(), marketplace: "Amazon", orderId: "112-77001", quantity: 6, salePrice: 22.99, fees: 4.25, sourceLocation: "Amazon FBA", notes: "FBA order batch." },
      { id: uid("sale"), productId: productB, date: today(), marketplace: "Amazon", orderId: "112-77002", quantity: 5, salePrice: 29.99, fees: 5.5, sourceLocation: "Amazon FBA", notes: "Reserved stock fulfilled." }
    ],
    shipments: [
      { id: uid("ship"), productId: productA, name: "FBA June Restock", quantity: 20, from: "Home Storage", to: "Amazon FBA", status: "Received", shipDate: today(), receiveDate: today(), notes: "Received by Amazon." }
    ],
    activities: [
      { id: uid("activity"), at: new Date().toISOString(), user: "System", action: "Sample workspace created" }
    ]
  };
};

import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowDownToLine,
  Boxes,
  Building2,
  Check,
  ClipboardList,
  DollarSign,
  Download,
  Eye,
  Filter,
  LineChart,
  Lock,
  LogOut,
  MapPin,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  Truck,
  Upload,
  UserPlus,
  Users,
  Warehouse,
  X
} from "lucide-react";
import { api } from "./api";
import "./styles.css";

const STORE_KEY = "resellerInventoryApp.amazon.2026-07-15";
const STATUS_TYPES = ["available", "reserved", "shipped", "sold", "damaged", "returned"];
const INVENTORY_ACTIONS = [
  { value: "RECEIVE_STOCK", label: "Receive Stock" },
  { value: "SOLD", label: "Sold" },
  { value: "RETURN_RECEIVED", label: "Return Received" },
  { value: "RETURN_TO_SUPPLIER", label: "Return to Supplier" },
  { value: "DUMP_DISPOSE", label: "Dump / Dispose" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "LOST_MISSING", label: "Lost / Missing" },
  { value: "GIVEAWAY_SAMPLE", label: "Giveaway / Sample" },
  { value: "MANUAL_ADJUSTMENT", label: "Manual Adjustment" },
  { value: "RESET_STOCK", label: "Reset Stock" }
];
const REMOVAL_ACTIONS = ["SOLD", "RETURN_TO_SUPPLIER", "DUMP_DISPOSE", "DAMAGED", "LOST_MISSING", "GIVEAWAY_SAMPLE"];
const REMOVAL_REASONS = [
  { value: "DAMAGED", label: "Damaged" },
  { value: "LOST", label: "Lost" },
  { value: "EXPIRED", label: "Expired" },
  { value: "UNSELLABLE", label: "Unsellable" },
  { value: "DESTROYED", label: "Destroyed" },
  { value: "OTHER", label: "Other" }
];
const RESET_STOCK_REASONS = [
  { value: "INVENTORY_AUDIT", label: "Inventory Audit" },
  { value: "WAREHOUSE_CLEANUP", label: "Warehouse Cleanup" },
  { value: "EXPIRED_INVENTORY", label: "Expired Inventory" },
  { value: "INCORRECT_COUNT", label: "Incorrect Count" },
  { value: "OTHER", label: "Other" }
];
const LOCATIONS = ["Home Storage", "Warehouse", "Amazon FBA", "In Transit", "Returned Inventory"];
const MARKETPLACES = ["Amazon", "eBay", "Walmart", "Shopify", "Other"];
const SHIPMENT_STATUS = ["Draft", "Packed", "Dispatched", "In Transit", "Received", "Closed"];

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const inventoryActionLabel = (value) => INVENTORY_ACTIONS.find((item) => item.value === value)?.label || value;
const inventoryReasonLabel = (value) => [...REMOVAL_REASONS, ...RESET_STOCK_REASONS].find((item) => item.value === value)?.label || value || "";

const parseCSV = (csv) => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = parts[idx] || '';
    });
    rows.push(obj);
  }
  return rows;
};

const seedState = () => {
  const adminId = uid("user");

  return {
    users: [
      { id: adminId, name: "Owner", email: "admin@example.com", password: "admin123", role: "Admin" }
    ],
    sessionUserId: null,
    suppliers: [],
    products: [
      { id: "product_amazon_b0058z33fg_m", sku: "B0058Z33FG-M", asin: "B0058Z33FG", upc: "", name: "NIKE Performance Cushion Quarter Socks with Bag (6 Pairs)", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 20, defaultCost: 12.00, defaultPrice: 0 },
      { id: "product_amazon_b0blz59g5f", sku: "B0BLZ59G5F-", asin: "B0BLZ59G5F", upc: "", name: "Nike Sportswear Faux Fur Tote Bag Purse (10L) (Black/Sail)", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 22.40, defaultPrice: 0 },
      { id: "product_amazon_b0cx6wn8lk_8_5", sku: "B0CX6WN8LK-8-5", asin: "B0CX6WN8LK", upc: "", name: "Nike Air Max 270 Women's Shoes", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 100.00, defaultPrice: 0 },
      { id: "product_amazon_b0d944h3pp_8_5", sku: "B0D944H3PP-8-5", asin: "B0D944H3PP", upc: "", name: "Nike Air Jordan 1 Low Men's Shoes", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 59.48, defaultPrice: 0 },
      { id: "product_amazon_b07fkfftqs_m", sku: "B07FKFFTQS-M", asin: "B07FKFFTQS", upc: "", name: "Nike Men's Sportswear Club T Shirt", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 70, defaultCost: 14.25, defaultPrice: 0 },
      { id: "product_amazon_b07fkfftqs_l", sku: "B07FKFFTQS-L", asin: "B07FKFFTQS", upc: "", name: "Nike Men's Sportswear Club T Shirt", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 30, defaultCost: 14.25, defaultPrice: 0 },
      { id: "product_amazon_b07fk8lhf8_m", sku: "B07FK8LHF8-M", asin: "B07FK8LHF8", upc: "", name: "Nike Women's Unisex Everyday Cushion No Show 3 Pair", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 19, defaultCost: 13.50, defaultPrice: 0 },
      { id: "product_amazon_b007oy4afq_m", sku: "B007OY4AFQ-M", asin: "B007OY4AFQ", upc: "", name: "NIKE Men's Classic", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 39, defaultCost: 14.00, defaultPrice: 0 },
      { id: "product_amazon_b007oy4ab0_l", sku: "B007OY4AB0-L", asin: "B007OY4AB0", upc: "", name: "Nike Men's Training T-Shirt", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 40, defaultCost: 14.00, defaultPrice: 0 },
      { id: "product_amazon_b09wld6364_one_size", sku: "B09WLD6364-ONE-SIZE", asin: "B09WLD6364", upc: "", name: "Nike Futura Beanie Gloves Set (Big Kids) Black", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 9.99, defaultPrice: 0 },
      { id: "product_amazon_b09td2s7jl_m", sku: "B09TD2S7JL-M", asin: "B09TD2S7JL", upc: "", name: "Nike Men`s Everyday Cotton Stretch Boxer Briefs 3 Pack", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 26.97, defaultPrice: 0 },
      { id: "product_amazon_b07whgj29v_0_9_months", sku: "B07WHGJ29V-0-9-MONTHS", asin: "B07WHGJ29V", upc: "", name: "Nike Jordan Baby Assorted Bodysuits 3 Pack", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 19.97, defaultPrice: 0 },
      { id: "product_amazon_b075zy57bq_9_0", sku: "B075ZY57BQ-9-0", asin: "B075ZY57BQ", upc: "", name: "Nike Women's Trail Running Shoes", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 58.74, defaultPrice: 0 },
      { id: "product_amazon_b0dqftg895_9_0", sku: "B0DQFTG895-9-0", asin: "B0DQFTG895", upc: "", name: "Nike Offcourt (Chicago Bears) Slide (DD0508-002, Anthracite/Marine/University Orange)", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 25.78, defaultPrice: 0 },
      { id: "product_amazon_b07cyvdsf4_l", sku: "B07CYVDSF4-L", asin: "B07CYVDSF4", upc: "", name: "Nike Unisex Adult Everyday Plus Crew Socks", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 18.63, defaultPrice: 0 },
      { id: "product_amazon_b07kd9pnkk_l", sku: "B07KD9PNKK-L", asin: "B07KD9PNKK", upc: "", name: "Nike Men's Pull Over Hoodie", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 39.95, defaultPrice: 0 },
      { id: "product_amazon_b019dky3lo_l", sku: "B019DKY3LO-L", asin: "B019DKY3LO", upc: "", name: "Nike Men's Sportswear Open Hem Club Pants", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 28.16, defaultPrice: 0 },
      { id: "product_amazon_b07bpl162d_l", sku: "B07BPL162D-L", asin: "B07BPL162D", upc: "", name: "Nike Dri-FIT Icon shorts", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 20, defaultCost: 16.53, defaultPrice: 0 },
      { id: "product_amazon_b07bpmtvpx_m", sku: "B07BPMTVPX-M", asin: "B07BPMTVPX", upc: "", name: "Nike Dri-FIT Icon", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 18.21, defaultPrice: 0 },
      { id: "product_amazon_b0916794zh_m", sku: "B0916794ZH-M", asin: "B0916794ZH", upc: "", name: "NIKE SOCKS WHITE", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 171, defaultCost: 15.98, defaultPrice: 0 },
      { id: "product_amazon_b0bkr2ljxw_2t_4t", sku: "B0BKR2LJXW-2T-4T", asin: "B0BKR2LJXW", upc: "", name: "Nike Toddler Boys Beanie and Mittens 2 Piece Set", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 6.84, defaultPrice: 0 },
      { id: "product_amazon_b01kirntb6_onesize", sku: "B01KIRNTB6-ONESIZE", asin: "B01KIRNTB6", upc: "", name: "Nike Pro Hyperwarm Hood", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 28.99, defaultPrice: 0 },
      { id: "product_amazon_b077yxw813_11_0", sku: "B077YXW813-11-0", asin: "B077YXW813", upc: "", name: "Nike Men's Manoa Leather Hiking Boot", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 65.00, defaultPrice: 0 },
      { id: "product_amazon_b00f3v0s2q_xx_large", sku: "B00F3V0S2Q-XX-LARGE", asin: "B00F3V0S2Q", upc: "", name: "Nike mens Club Swoosh Sweatpant", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 39.00, defaultPrice: 0 },
      { id: "product_amazon_b08sqpb581_medium", sku: "B08SQPB581-MEDIUM", asin: "B08SQPB581", upc: "", name: "Nike Indy Wire-Free Sports Bra, Medium, Black/White", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 4.00, defaultPrice: 0 },
      { id: "product_amazon_b08nx75m62_small", sku: "B08NX75M62-SMALL", asin: "B08NX75M62", upc: "", name: "Nike Women's Pro 365 Crop Tight LegginGrade School", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 16.00, defaultPrice: 0 },
      { id: "product_amazon_b099qbvxnr_10t", sku: "B099QBVXNR-10T", asin: "B099QBVXNR", upc: "", name: "NIKE Boy's Sneakers Shoes", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 10, defaultCost: 34.99, defaultPrice: 0 },
      { id: "product_amazon_b08kwpqmfb_3_months", sku: "B08KWPQMFB-3-MONTHS", asin: "B08KWPQMFB", upc: "", name: "Nike Kids Baby Girl's Sportswear All Over Print Smiley Long Sleeve Footed Coverall (Infant)", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 59, defaultCost: 9.99, defaultPrice: 0 },
      { id: "product_amazon_b08kwpqmfb_0_3_months", sku: "B08KWPQMFB-0-3-MONTHS", asin: "B08KWPQMFB", upc: "", name: "Nike Kids Baby Girl's Sportswear All Over Print Smiley Long Sleeve Footed Coverall (Infant)", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 130, defaultCost: 9.99, defaultPrice: 0 },
      { id: "product_amazon_b003vrrh28_dimensions_16_l_x_4_w_x", sku: "B003VRRH28-DIMENSIONS-16-L-X-4-W-X-", asin: "B003VRRH28", upc: "", name: "NIKE unisex-adult Heritage Hip Pack Bag , Black/Black/White, Misc", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 16.00, defaultPrice: 0 },
      { id: "product_amazon_b0dc6zv9ll_10_5", sku: "B0DC6ZV9LL-10-5", asin: "B0DC6ZV9LL", upc: "", name: "Nike Free Metcon 6 Women's Workout Shoes", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 90.00, defaultPrice: 0 },
      { id: "product_amazon_b0csdwzp28_l", sku: "B0CSDWZP28-L", asin: "B0CSDWZP28", upc: "", name: "Nike Men's Graphics Logo Sportswear T-Shirt", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 24, defaultCost: 17.35, defaultPrice: 0 },
      { id: "product_amazon_b0czhqc3mn_8_5", sku: "B0CZHQC3MN-8-5", asin: "B0CZHQC3MN", upc: "", name: "Nike Air Force 1 Low Women's", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 69.00, defaultPrice: 0 },
      { id: "product_amazon_b08dkyktth_10_0", sku: "B08DKYKTTH-10-0", asin: "B08DKYKTTH", upc: "", name: "Converse Unisex Chuck Taylor All Star Ox 159485 Trainers, White, 39.5 EU", brand: "CONVERSE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 20, defaultCost: 27.00, defaultPrice: 0 },
      { id: "product_amazon_b0dlkm88vq_one_size", sku: "B0DLKM88VQ-ONE-SIZE", asin: "B0DLKM88VQ", upc: "", name: "Nike 2024 Cuffed Dri-FIT U Peak Beanie (One Size) (Black)", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 76, defaultCost: 17.00, defaultPrice: 0 },
      { id: "product_amazon_b0959jt4pv_one_size", sku: "B0959JT4PV-ONE-SIZE", asin: "B0959JT4PV", upc: "", name: "Nike unisex-adult mens Balaclava", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 112, defaultCost: 15.88, defaultPrice: 0 },
      { id: "product_amazon_b019dlsdr8_medium", sku: "B019DLSDR8-MEDIUM", asin: "B019DLSDR8", upc: "", name: "NIKE Sportswear Men's Pullover Club Hoodie", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 234, defaultCost: 32.99, defaultPrice: 0 },
      { id: "product_amazon_b072bh8xjd_small", sku: "B072BH8XJD-SMALL", asin: "B072BH8XJD", upc: "", name: "Nike Kids' Everyday Cushion Crew Socks (6 Pairs), White/Black, Small", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 13.50, defaultPrice: 0 },
      { id: "product_amazon_b07frgymmv_medium", sku: "B07FRGYMMV-MEDIUM", asin: "B07FRGYMMV", upc: "", name: "Nike Men's Hoodie", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 42.16, defaultPrice: 0 },
      { id: "product_amazon_b07l7rzmp3_xl", sku: "B07L7RZMP3-XL", asin: "B07L7RZMP3", upc: "", name: "Nike Men's Sportswear Club Pullover Hoodie", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 27.93, defaultPrice: 0 },
      { id: "product_amazon_b0841khp85_s_m", sku: "B0841KHP85-S-M", asin: "B0841KHP85", upc: "", name: "Nike Mens Tech and Grip 2.0 Gloves - Silicone Grip and Touchscreen Fingertip", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 18, defaultCost: 7.99, defaultPrice: 0 },
      { id: "product_amazon_b07mcq4mxv_l", sku: "B07MCQ4MXV-L", asin: "B07MCQ4MXV", upc: "", name: "NIKE Everyday Performance Training Socks (6-Pair) (L (Men's 8-12 / Women's 10-13), Low (Sport Cut) Black)", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 27.97, defaultPrice: 0 },
      { id: "product_amazon_b07kr17qwz_medium", sku: "B07KR17QWZ-MEDIUM", asin: "B07KR17QWZ", upc: "", name: "Nike Brasilia Training Medium Duffle Bag", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 35.97, defaultPrice: 0 },
      { id: "product_amazon_b07bpmtvpx_medium", sku: "B07BPMTVPX-MEDIUM", asin: "B07BPMTVPX", upc: "", name: "Nike Dri-FIT Icon", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 0, defaultCost: 22.50, defaultPrice: 0 },
      { id: "product_amazon_b08tqn2ns2_9_0", sku: "B08TQN2NS2-9-0", asin: "B08TQN2NS2", upc: "", name: "Nike Men's Court Legacy Shoe", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 10, defaultCost: 39.58, defaultPrice: 0 },
      { id: "product_amazon_b08tqn2ns2_11_0", sku: "B08TQN2NS2-11-0", asin: "B08TQN2NS2", upc: "", name: "Nike Men's Court Legacy Shoe", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 10, defaultCost: 39.58, defaultPrice: 0 },
      { id: "product_amazon_b08tqn2ns2_11_5", sku: "B08TQN2NS2-11-5", asin: "B08TQN2NS2", upc: "", name: "Nike Men's Court Legacy Shoe", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 10, defaultCost: 39.58, defaultPrice: 0 },
      { id: "product_amazon_b08tqn2ns2_13_0", sku: "B08TQN2NS2-13-0", asin: "B08TQN2NS2", upc: "", name: "Nike Men's Court Legacy Shoe", brand: "NIKE", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 10, defaultCost: 39.58, defaultPrice: 0 },
      { id: "product_amazon_b08kwmtqpk_0_3_months", sku: "B08KWMTQPK-0-3-MONTHS", asin: "B08KWMTQPK", upc: "", name: "Nike Kids Baby Girl's Sportswear All Over Print Smiley Long Sleeve Footed Coverall (Infant)", brand: "nike", category: "", size: "", color: "", image: "", reorderPoint: 0, targetStock: 260, defaultCost: 9.99, defaultPrice: 0 }
    ],
    inventory: [
      { id: uid("stock"), productId: "product_amazon_b0058z33fg_m", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b07fkfftqs_m", location: "Amazon FBA", status: "available", quantity: 20 },
      { id: uid("stock"), productId: "product_amazon_b07fkfftqs_l", location: "Amazon FBA", status: "available", quantity: 30 },
      { id: uid("stock"), productId: "product_amazon_b07fk8lhf8_m", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b007oy4afq_m", location: "Amazon FBA", status: "available", quantity: 20 },
      { id: uid("stock"), productId: "product_amazon_b007oy4ab0_l", location: "Amazon FBA", status: "available", quantity: 20 },
      { id: uid("stock"), productId: "product_amazon_b07bpl162d_l", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b0916794zh_m", location: "Amazon FBA", status: "available", quantity: 125 },
      { id: uid("stock"), productId: "product_amazon_b099qbvxnr_10t", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b08kwpqmfb_3_months", location: "Amazon FBA", status: "available", quantity: 50 },
      { id: uid("stock"), productId: "product_amazon_b08kwpqmfb_0_3_months", location: "Amazon FBA", status: "available", quantity: 130 },
      { id: uid("stock"), productId: "product_amazon_b0csdwzp28_l", location: "Amazon FBA", status: "available", quantity: 12 },
      { id: uid("stock"), productId: "product_amazon_b08dkyktth_10_0", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b0dlkm88vq_one_size", location: "Amazon FBA", status: "available", quantity: 40 },
      { id: uid("stock"), productId: "product_amazon_b0959jt4pv_one_size", location: "Amazon FBA", status: "available", quantity: 86 },
      { id: uid("stock"), productId: "product_amazon_b019dlsdr8_medium", location: "Amazon FBA", status: "available", quantity: 212 },
      { id: uid("stock"), productId: "product_amazon_b0841khp85_s_m", location: "Amazon FBA", status: "available", quantity: 18 },
      { id: uid("stock"), productId: "product_amazon_b08tqn2ns2_9_0", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b08tqn2ns2_11_0", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b08tqn2ns2_11_5", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b08tqn2ns2_13_0", location: "Amazon FBA", status: "available", quantity: 10 },
      { id: uid("stock"), productId: "product_amazon_b08kwmtqpk_0_3_months", location: "Amazon FBA", status: "available", quantity: 130 }
    ],
    inventoryHistory: [],
    purchases: [],
    sales: [],
    shipments: [],
    activities: [
      { id: uid("activity"), at: new Date().toISOString(), user: "System", action: "Amazon inventory migration seed created" }
    ]
  };
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    const parsed = saved ? JSON.parse(saved) : seedState();
    const normalized = { ...parsed, inventoryHistory: parsed.inventoryHistory || [] };
    return api.hasToken() ? normalized : { ...normalized, sessionUserId: null, products: [], inventory: [], inventoryHistory: [] };
  } catch {
    return seedState();
  }
}

function App() {
  const [state, setState] = useState(loadState);
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ location: "All", status: "All", supplier: "All", marketplace: "All" });
  const [purchaseFilters, setPurchaseFilters] = useState({ from: "", to: "", supplier: "All", product: "All" });
  const [saleFilters, setSaleFilters] = useState({ from: "", to: "", marketplace: "All", product: "All" });
  const [supplierFilters, setSupplierFilters] = useState({ rating: "All", purchaseCount: "All" });
  const [reportFilters, setReportFilters] = useState({ from: "", to: "", marketplace: "All", supplier: "All", category: "All" });
  const [historyFilters, setHistoryFilters] = useState({ action: "All", product: "All", date: "" });
  const [selectedHistoryIds, setSelectedHistoryIds] = useState([]);
  const [modal, setModal] = useState(null);
  const [loadingRemoteData, setLoadingRemoteData] = useState(false);
  const [remoteError, setRemoteError] = useState("");

  const currentUser = state.users.find((user) => user.id === state.sessionUserId);

  const saveState = (next) => {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setState(next);
  };

  const withActivity = (draft, action) => ({
    ...draft,
    activities: [
      { id: uid("activity"), at: new Date().toISOString(), user: currentUser?.name || "Guest", action },
      ...draft.activities
    ].slice(0, 120)
  });

  const loadRemoteProductsAndInventory = async (baseState = state) => {
    setLoadingRemoteData(true);
    try {
      const [products, inventory, inventoryHistory] = await Promise.all([api.getProducts(), api.getInventory(), api.getInventoryHistory()]);
      const next = withActivity({ ...baseState, products, inventory, inventoryHistory }, "Loaded products and inventory from backend");
      saveState(next);
      setRemoteError("");
      return next;
    } catch (error) {
      setRemoteError(error.message || "Backend data load failed.");
      return baseState;
    } finally {
      setLoadingRemoteData(false);
    }
  };

  useEffect(() => {
    if (currentUser && api.hasToken()) {
      loadRemoteProductsAndInventory();
    }
  }, []);

  const updateStock = (inventory, productId, location, status, delta) => {
    const index = inventory.findIndex((item) => item.productId === productId && item.location === location && item.status === status);
    if (index >= 0) {
      const next = [...inventory];
      next[index] = { ...next[index], quantity: Math.max(0, Number(next[index].quantity) + Number(delta)) };
      return next.filter((item) => Number(item.quantity) > 0);
    }
    if (Number(delta) <= 0) return inventory;
    return [...inventory, { id: uid("stock"), productId, location, status, quantity: Number(delta) }];
  };

  const productQty = (productId, status = null) =>
    state.inventory
      .filter((item) => item.productId === productId && (!status || item.status === status))
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const productCost = (productId) => {
    const matching = state.purchases.filter((purchase) => purchase.productId === productId);
    if (!matching.length) return Number(state.products.find((product) => product.id === productId)?.defaultCost || 0);
    const qty = matching.reduce((sum, purchase) => sum + Number(purchase.quantity || 0), 0);
    const total = matching.reduce((sum, purchase) => sum + Number(purchase.quantity || 0) * Number(purchase.unitCost || 0), 0);
    return qty ? total / qty : 0;
  };

  const metrics = useMemo(() => {
    const inventoryValue = state.products.reduce((sum, product) => sum + productQty(product.id) * productCost(product.id), 0);
    const revenue = state.sales.reduce((sum, sale) => sum + Number(sale.quantity) * Number(sale.salePrice), 0);
    const fees = state.sales.reduce((sum, sale) => sum + Number(sale.quantity) * Number(sale.fees || 0), 0);
    const cogs = state.sales.reduce((sum, sale) => sum + Number(sale.quantity) * productCost(sale.productId), 0);
    const lowStock = state.products.filter((product) => productQty(product.id, "available") <= Number(product.reorderPoint || 0));
    return { inventoryValue, revenue, fees, cogs, profit: revenue - fees - cogs, lowStock };
  }, [state]);

  const visibleProducts = state.products.filter((product) => {
    const text = `${product.sku} ${product.asin} ${product.upc} ${product.name} ${product.brand} ${product.category}`.toLowerCase();
    const stockRows = state.inventory.filter((item) => item.productId === product.id);
    const locationOk = filters.location === "All" || stockRows.some((item) => item.location === filters.location);
    const available = productQty(product.id, "available");
    const stockStatus = available > 20 ? "In Stock" : available > 0 ? "Low Stock" : "Out of Stock";
    const statusOk = filters.status === "All" || filters.status === stockStatus;
    return text.includes(query.toLowerCase()) && locationOk && statusOk;
  });

  const submitLogin = async (payload, registering) => {
    if (registering) {
      setRemoteError("Account creation is handled in the backend admin workflow.");
      return false;
    }
    try {
      const user = await api.login(payload);
      const normalizedUser = { id: user.id, name: user.name, email: user.email, password: "", role: user.role };
      const users = [...state.users.filter((item) => item.email.toLowerCase() !== normalizedUser.email.toLowerCase()), normalizedUser];
      const signedInState = withActivity({ ...state, users, sessionUserId: normalizedUser.id }, `Signed in as ${normalizedUser.name}`);
      await loadRemoteProductsAndInventory(signedInState);
      return true;
    } catch (error) {
      setRemoteError(error.message || "Sign-in failed.");
      return false;
    }
  };

  const addProduct = async (payload) => {
    try {
      const product = await api.createProduct(payload);
      await loadRemoteProductsAndInventory(withActivity(state, `Added product ${product.sku}`));
      setModal(null);
    } catch (error) {
      setRemoteError(error.message || "Product save failed.");
    }
  };

  const updateProduct = async (productId, payload) => {
    try {
      const product = await api.updateProduct(productId, payload);
      await loadRemoteProductsAndInventory(withActivity(state, `Updated product ${product.sku}`));
      setModal(null);
    } catch (error) {
      setRemoteError(error.message || "Product update failed.");
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete product ${product.sku}?\n\nThis will not delete inventory history records.`)) return;
    try {
      await api.deleteProduct(product.id);
      await loadRemoteProductsAndInventory(withActivity(state, `Deleted product ${product.sku}`));
    } catch (error) {
      setRemoteError(error.message || "Product delete failed.");
    }
  };

  const addSupplier = (payload) => {
    const supplier = { id: uid("supplier"), ...payload, rating: Number(payload.rating || 3) };
    saveState(withActivity({ ...state, suppliers: [...state.suppliers, supplier] }, `Added supplier ${supplier.name}`));
    setModal(null);
  };

  const addPurchase = (payload) => {
    const purchase = { id: uid("purchase"), ...payload, quantity: Number(payload.quantity), unitCost: Number(payload.unitCost) };
    const inventory = updateStock(state.inventory, purchase.productId, purchase.location, "available", purchase.quantity);
    saveState(withActivity({ ...state, purchases: [...state.purchases, purchase], inventory }, `Recorded purchase of ${purchase.quantity} units`));
    setModal(null);
  };

  const deletePurchase = (purchaseId) => {
    const purchase = state.purchases.find((item) => item.id === purchaseId);
    if (!purchase) return;
    const inventory = updateStock(state.inventory, purchase.productId, purchase.location, "available", -purchase.quantity);
    saveState(withActivity({ ...state, purchases: state.purchases.filter((item) => item.id !== purchaseId), inventory }, `Deleted purchase ${purchase.invoice || purchase.date}`));
  };

  const addSale = (payload) => {
    const sale = { id: uid("sale"), ...payload, quantity: Number(payload.quantity), salePrice: Number(payload.salePrice), fees: Number(payload.fees || 0) };
    const availableQty = Number(
  state.inventory.find(
    (item) =>
      item.productId === sale.productId &&
      item.location === sale.sourceLocation &&
      item.status === "available"
  )?.quantity || 0
);

const fromAvailable = Math.min(sale.quantity, availableQty);
const fromReserved = sale.quantity - fromAvailable;

let inventory = updateStock(
  state.inventory,
  sale.productId,
  sale.sourceLocation,
  "available",
  -fromAvailable
);

inventory = updateStock(
  inventory,
  sale.productId,
  sale.sourceLocation,
  "reserved",
  -fromReserved
);
    inventory = updateStock(inventory, sale.productId, sale.sourceLocation, "sold", sale.quantity);
    saveState(withActivity({ ...state, sales: [...state.sales, sale], inventory }, `Recorded ${sale.marketplace} sale ${sale.orderId || ""}`.trim()));
    setModal(null);
  };

  const deleteSale = (saleId) => {
    const sale = state.sales.find((item) => item.id === saleId);
    if (!sale) return;
    let inventory = updateStock(state.inventory, sale.productId, sale.sourceLocation, "sold", -sale.quantity);
    inventory = updateStock(inventory, sale.productId, sale.sourceLocation, "available", sale.quantity);
    saveState(withActivity({ ...state, sales: state.sales.filter((item) => item.id !== saleId), inventory }, `Deleted sale ${sale.orderId || sale.date}`));
  };

  const addShipment = (payload) => {
    const shipment = { id: uid("ship"), ...payload, quantity: Number(payload.quantity) };
    let inventory = updateStock(state.inventory, shipment.productId, shipment.from, "available", -shipment.quantity);
    inventory = updateStock(inventory, shipment.productId, "In Transit", "shipped", shipment.quantity);
    if (shipment.status === "Received" || shipment.status === "Closed") {
      inventory = updateStock(inventory, shipment.productId, "In Transit", "shipped", -shipment.quantity);
      inventory = updateStock(inventory, shipment.productId, shipment.to, "available", shipment.quantity);
    }
    saveState(withActivity({ ...state, shipments: [...state.shipments, shipment], inventory }, `Created shipment ${shipment.name}`));
    setModal(null);
  };

  const adjustInventory = async (payload) => {
    try {
      await api.applyInventoryAction(payload);
      await loadRemoteProductsAndInventory(withActivity(state, `Applied inventory action: ${inventoryActionLabel(payload.action)}`));
      setModal(null);
    } catch (error) {
      setRemoteError(error.message || "Inventory save failed.");
    }
  };

  const deleteSelectedHistory = async () => {
    if (!selectedHistoryIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedHistoryIds.length} selected history records?\n\nThis action will NOT change current inventory.`);
    if (!confirmed) return;
    try {
      await Promise.all(selectedHistoryIds.map((id) => api.deleteInventoryHistory(id)));
      setSelectedHistoryIds([]);
      await loadRemoteProductsAndInventory(withActivity(state, `Deleted ${selectedHistoryIds.length} inventory history records`));
    } catch (error) {
      setRemoteError(error.message || "Inventory history delete failed.");
    }
  };

  const replaceCompanyData = (nextData) => {
    const normalized = normalizeCompanyData(nextData, state.sessionUserId);
    saveState(withActivity(normalized, "Imported company data"));
  };

  const importInventoryCSV = (csvContent) => {
    const rows = parseCSV(csvContent);
    let updatedInventory = [...state.inventory];
    let updatedPurchases = [...state.purchases];
    let importedCount = 0;

    rows.forEach((row) => {
      const sku = row.sku || row['sku'];
      const available = Number(row.available || 0);
      const total = Number(row.total || 0);
      const avgCost = Number(row['average cost'] || row.cost || 0);

      const product = state.products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
      if (!product) return;

      // Remove existing inventory for this product
      updatedInventory = updatedInventory.filter(item => item.productId !== product.id);

      // Add available stock
      if (available > 0) {
        updatedInventory.push({
          id: uid("stock"),
          productId: product.id,
          location: "Home Storage",
          status: "available",
          quantity: available
        });
        importedCount++;
      }

      // Add a purchase record with the total quantity at average cost
      if (total > 0) {
        updatedPurchases.push({
          id: uid("purchase"),
          productId: product.id,
          supplierId: state.suppliers[0]?.id || uid("supplier"),
          date: today(),
          quantity: total,
          unitCost: avgCost,
          invoice: `CSV-${sku}-${Date.now()}`,
          location: "Home Storage",
          notes: "Imported from CSV"
        });
      }
    });

    saveState(withActivity({ ...state, inventory: updatedInventory, purchases: updatedPurchases }, `Imported inventory from CSV (${importedCount} products updated)`));
  };

  const resetSampleData = () => {
    const sample = seedState();
    saveState(withActivity({ ...sample, sessionUserId: state.sessionUserId, users: state.users }, "Reset workspace to sample data"));
  };

  const exportCsv = () => {
    const rows = [
      ["SKU", "Product", "Brand", "Available", "Total", "Average Cost", "Inventory Value"],
      ...state.products.map((product) => [
        product.sku,
        product.name,
        product.brand,
        productQty(product.id, "available"),
        productQty(product.id),
        productCost(product.id).toFixed(2),
        (productQty(product.id) * productCost(product.id)).toFixed(2)
      ])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `inventory-export-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const logout = () => {
    api.clearToken();
    saveState({ ...state, sessionUserId: null, products: [], inventory: [], inventoryHistory: [] });
  };

  if (!currentUser) return <AuthScreen onSubmit={submitLogin} apiError={remoteError} />;

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} user={currentUser} logout={logout} />
      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Amazon & eBay reseller operations</p>
            <h1>{navItems.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className="top-actions">
            {view !== "products" && <div className="searchbox">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search SKU, ASIN, UPC, brand, supplier..." />
            </div>}
            <button className="icon-button" title="Export CSV" onClick={exportCsv}><Download size={18} /></button>
          </div>
        </header>
        {remoteError && <p className="form-error">{remoteError}</p>}
        {loadingRemoteData && <p className="success-message">Loading backend inventory...</p>}

        {view === "dashboard" && <Dashboard state={state} metrics={metrics} productQty={productQty} productCost={productCost} setView={setView} setModal={setModal} />}
        {view === "products" && <Products products={visibleProducts} state={state} query={query} setQuery={setQuery} productQty={productQty} productCost={productCost} filters={filters} setFilters={setFilters} setModal={setModal} onDelete={deleteProduct} />}
        {view === "inventory-history" && <InventoryHistoryPage state={state} query={query} filters={historyFilters} setFilters={setHistoryFilters} selectedIds={selectedHistoryIds} setSelectedIds={setSelectedHistoryIds} onDeleteSelected={deleteSelectedHistory} setRemoteError={setRemoteError} />}
        {view === "purchases" && <Purchases state={state} query={query} filters={purchaseFilters} setFilters={setPurchaseFilters} setModal={setModal} onDelete={deletePurchase} />}
        {view === "sales" && <Sales state={state} query={query} filters={saleFilters} setFilters={setSaleFilters} productCost={productCost} setModal={setModal} onDelete={deleteSale} />}
        {view === "shipments" && <Shipments state={state} setModal={setModal} />}
        {view === "suppliers" && <Suppliers state={state} query={query} filters={supplierFilters} setFilters={setSupplierFilters} setModal={setModal} />}
        {view === "reports" && <Reports state={state} metrics={metrics} filters={reportFilters} setFilters={setReportFilters} productQty={productQty} productCost={productCost} />}
        {view === "security" && <Security state={state} onImport={replaceCompanyData} onReset={resetSampleData} onImportCSV={importInventoryCSV} />}
      </main>

      {modal === "product" && <ProductModal onClose={() => setModal(null)} onSave={addProduct} />}
      {modal?.type === "productEdit" && <ProductModal product={modal.product} onClose={() => setModal(null)} onSave={(payload) => updateProduct(modal.product.id, payload)} />}
      {modal === "supplier" && <SupplierModal onClose={() => setModal(null)} onSave={addSupplier} />}
      {modal === "purchase" && <PurchaseModal state={state} onClose={() => setModal(null)} onSave={addPurchase} />}
      {modal === "sale" && <SaleModal state={state} onClose={() => setModal(null)} onSave={addSale} />}
      {modal === "shipment" && <ShipmentModal state={state} onClose={() => setModal(null)} onSave={addShipment} />}
      {(modal === "adjust" || modal?.type === "adjust") && <AdjustModal state={state} productId={modal?.productId} onClose={() => setModal(null)} onSave={adjustInventory} />}
      {modal?.type === "purchaseDetail" && <PurchaseDetailModal state={state} purchase={modal.record} onClose={() => setModal(null)} />}
      {modal?.type === "saleDetail" && <SaleDetailModal state={state} sale={modal.record} productCost={productCost} onClose={() => setModal(null)} />}
    </div>
  );
}

function AuthScreen({ onSubmit, apiError }) {
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "owner@inventory.local", password: "ChangeMe123!", role: "Admin" });
  const submit = async (event) => {
    event.preventDefault();
    const ok = await onSubmit(form, registering);
    setError(ok ? "" : registering ? "Account creation is not available here." : "Sign-in failed. Check backend credentials.");
  };
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="warehouse-scene" aria-hidden="true">
          <div className="shelf shelf-one"><span /><span /><span /></div>
          <div className="shelf shelf-two"><span /><span /><span /></div>
          <div className="scan-line" />
        </div>
        <div>
          <p className="eyebrow">Reseller Inventory Manager</p>
          <h1>Track stock, sales, shipments, suppliers, and profit in one place.</h1>
        </div>
      </section>
      <form className="auth-panel" onSubmit={submit}>
        <div className="panel-icon">{registering ? <UserPlus /> : <Lock />}</div>
        <h2>{registering ? "Create account" : "Sign in"}</h2>
        {registering && <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />}
        <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
        <Field label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required />
        {registering && <Select label="Role" value={form.role} onChange={(value) => setForm({ ...form, role: value })} options={["Admin", "Manager", "Staff"]} />}
        {(error || apiError) && <p className="form-error">{error || apiError}</p>}
        <button className="primary-button" type="submit">{registering ? "Register" : "Sign in"}</button>
        <button className="link-button" type="button" onClick={() => setRegistering(!registering)}>{registering ? "Use existing account" : "Create another user"}</button>
      </form>
    </main>
  );
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LineChart },
  { id: "products", label: "Products & Stock", icon: Boxes },
  { id: "inventory-history", label: "Inventory History", icon: ClipboardList },
  { id: "purchases", label: "Purchases", icon: ReceiptText },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "shipments", label: "FBA Shipments", icon: Truck },
  { id: "suppliers", label: "Suppliers", icon: Building2 },
  { id: "reports", label: "Reports", icon: ClipboardList },
  { id: "security", label: "Users & Audit", icon: Settings }
];

function Sidebar({ view, setView, user, logout }) {
  return (
    <aside className="sidebar">
      <div className="brand"><Warehouse /><span>Inventory</span></div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><Icon size={18} />{item.label}</button>;
        })}
      </nav>
      <div className="user-box">
        <strong>{user.name}</strong>
        <span>{user.role}</span>
        <button onClick={logout}><LogOut size={16} />Sign out</button>
      </div>
    </aside>
  );
}

function Dashboard({ state, metrics, productQty, productCost, setView, setModal }) {
  return (
    <section className="content-grid">
      <Stat title="Inventory value" value={money(metrics.inventoryValue)} icon={DollarSign} />
      <Stat title="Revenue" value={money(metrics.revenue)} icon={ArrowDownToLine} />
      <Stat title="Profit" value={money(metrics.profit)} icon={LineChart} tone={metrics.profit >= 0 ? "good" : "warn"} />
      <Stat title="Low-stock items" value={metrics.lowStock.length} icon={AlertTriangle} tone={metrics.lowStock.length ? "warn" : "good"} />
      <section className="wide-panel">
        <div className="section-head">
          <h2>Fast actions</h2>
          <div className="button-row">
            <button onClick={() => setModal("product")}><Plus size={16} />Product</button>
            <button onClick={() => setModal("purchase")}><ReceiptText size={16} />Purchase</button>
            <button onClick={() => setModal("sale")}><ShoppingCart size={16} />Sale</button>
            <button onClick={() => setModal("shipment")}><Truck size={16} />Shipment</button>
          </div>
        </div>
        <div className="insight-strip">
          {metrics.lowStock.slice(0, 4).map((product) => (
            <button key={product.id} onClick={() => setView("products")} className="alert-tile">
              <AlertTriangle size={18} />
              <span>{product.sku}</span>
              <strong>{productQty(product.id, "available")} available</strong>
            </button>
          ))}
          {!metrics.lowStock.length && <p className="empty">No low-stock products right now.</p>}
        </div>
      </section>
      <section className="panel">
        <h2>Inventory by location</h2>
        <LocationBars inventory={state.inventory} />
      </section>
      <section className="panel">
        <h2>Recent activity</h2>
        <ActivityList activities={state.activities.slice(0, 8)} />
      </section>
      <section className="wide-panel">
        <h2>Top inventory value</h2>
        <DataTable
          columns={["SKU", "Product", "Available", "Total value", "ROI target"]}
          rows={state.products.map((product) => [
            product.sku,
            product.name,
            productQty(product.id, "available"),
            money(productQty(product.id) * productCost(product.id)),
            `${Math.round(((Number(product.defaultPrice) - productCost(product.id)) / Math.max(productCost(product.id), 1)) * 100)}%`
          ])}
        />
      </section>
    </section>
  );
}

function Products({ products, state, query, setQuery, productQty, productCost, filters, setFilters, setModal, onDelete }) {
  return (
    <section className="stack">
      <div className="toolbar products-toolbar">
        <div className="searchbox products-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, SKU, ASIN..." />
        </div>
        <div className="filters">
          <Filter size={18} />
          <select value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })}><option>All</option>{LOCATIONS.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option>All</option>{["In Stock", "Low Stock", "Out of Stock"].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
        <div className="button-row">
          <button onClick={() => setModal("adjust")}><PackageCheck size={16} />Adjust stock</button>
          <button className="primary-button" onClick={() => setModal("product")}><Plus size={16} />Add product</button>
        </div>
      </div>
      <div className="product-grid">
        {products.map((product) => {
          const available = productQty(product.id, "available");
          const status = available > 20 ? "In Stock" : available > 0 ? "Low Stock" : "Out of Stock";
          const statusClass = available > 20 ? "good" : available > 0 ? "warn" : "danger";
          return (
          <article className="product-card" key={product.id}>
            <div className="product-art product-art-large">{product.image ? <img src={product.image} alt="" /> : <Package />}</div>
            <div>
              <p className="sku">{product.sku}</p>
              <h2>{product.name}</h2>
              <div className="product-meta">
                <span>{product.brand || "No brand"}</span>
                <span>{product.category || "No category"}</span>
                <span>{product.size || "No size"}</span>
                <span>{product.color || "No color"}</span>
              </div>
            </div>
            <div className={`stock-badge ${statusClass}`}><span />{status}</div>
            <div className="stock-summary">
              <div>
                <span>Available Stock</span>
                <strong>{available}</strong>
              </div>
              <div>
                <span>Inventory Value</span>
                <strong>{money(available * productCost(product.id))}</strong>
              </div>
            </div>
            <div className="product-actions">
              <button onClick={() => setModal({ type: "adjust", productId: product.id })}><PackageCheck size={16} />Adjust Stock</button>
              <button onClick={() => setModal({ type: "productEdit", product })}><Pencil size={16} />Edit</button>
              <button className="danger-button" onClick={() => onDelete(product)}><Trash2 size={16} />Delete</button>
            </div>
            {available <= product.reorderPoint && <div className="warning"><AlertTriangle size={16} />Reorder suggested</div>}
          </article>
          );
        })}
      </div>
    </section>
  );
}

function InventoryHistoryPage({ state, query, filters, setFilters, selectedIds, setSelectedIds, onDeleteSelected, setRemoteError }) {
  const rows = (state.inventoryHistory || []).filter((item) => {
    const text = `${item.productName} ${item.sku} ${item.notes}`.toLowerCase();
    const date = item.timestamp ? item.timestamp.slice(0, 10) : "";
    return text.includes(query.toLowerCase())
      && (filters.action === "All" || item.action === filters.action)
      && (filters.product === "All" || String(item.productId) === String(filters.product))
      && (!filters.date || date === filters.date);
  });
  const allSelected = rows.length > 0 && rows.every((item) => selectedIds.includes(item.id));
  const toggleAll = () => setSelectedIds(allSelected ? selectedIds.filter((id) => !rows.some((item) => item.id === id)) : [...new Set([...selectedIds, ...rows.map((item) => item.id)])]);
  const toggleOne = (id) => setSelectedIds(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);

  return (
    <section className="stack">
      <div className="toolbar">
        <div className="filters">
          <Filter size={18} />
          <select value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })}><option>All</option>{INVENTORY_ACTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <select value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })}><option>All</option>{state.products.map((item) => <option key={item.id} value={item.id}>{item.sku}</option>)}</select>
          <input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} title="Movement date" />
        </div>
        <button onClick={() => setFilters({ action: "All", product: "All", date: "" })}>Clear filters</button>
      </div>
      <section className="wide-panel">
        <div className="section-head">
          <h2><ClipboardList size={20} />Inventory History</h2>
          <div className="button-row">
            <button className="danger-action" disabled={!selectedIds.length} onClick={onDeleteSelected}><Trash2 size={16} />Delete Selected</button>
            <button disabled={!selectedIds.length} onClick={() => setRemoteError("Archive Selected is a placeholder for a later version.")}>Archive Selected</button>
            <button onClick={() => setRemoteError("Export CSV is a placeholder for a later version.")}><Download size={16} />Export CSV</button>
          </div>
        </div>
        <div className="table-wrap history-table">
          <table>
            <thead>
              <tr>
                <th><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all history records" /></th>
                <th>Timestamp</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Previous Stock</th>
                <th>New Stock</th>
                <th>Reason</th>
                <th>Notes</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((item) => (
                <tr key={item.id}>
                  <td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleOne(item.id)} aria-label={`Select history record ${item.id}`} /></td>
                  <td>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ""}</td>
                  <td>{item.productName}</td>
                  <td>{item.sku}</td>
                  <td>{inventoryActionLabel(item.action)}</td>
                  <td>{item.quantity > 0 ? `+${item.quantity}` : item.quantity}</td>
                  <td>{item.previousStock}</td>
                  <td>{item.newStock}</td>
                  <td>{inventoryReasonLabel(item.reason)}</td>
                  <td>{item.notes}</td>
                  <td>{item.user}</td>
                </tr>
              )) : <tr><td colSpan="11">No inventory movements found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function Purchases({ state, query, filters, setFilters, setModal, onDelete }) {
  const rows = state.purchases.filter((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    const supplier = state.suppliers.find((entry) => entry.id === item.supplierId);
    const text = `${item.date} ${item.invoice} ${item.notes} ${product?.sku} ${product?.name} ${supplier?.name}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && inDateRange(item.date, filters.from, filters.to)
      && (filters.supplier === "All" || item.supplierId === filters.supplier)
      && (filters.product === "All" || item.productId === filters.product);
  });
  return (
    <section className="stack">
      <div className="section-head">
        <h2><ReceiptText size={20} />Purchase records</h2>
        <button className="primary-button" onClick={() => setModal("purchase")}><Plus size={16} />Record purchase</button>
      </div>
      <div className="toolbar">
        <div className="filters">
          <Filter size={18} />
          <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} title="From date" />
          <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} title="To date" />
          <select value={filters.supplier} onChange={(event) => setFilters({ ...filters, supplier: event.target.value })}><option>All</option>{state.suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })}><option>All</option>{state.products.map((item) => <option key={item.id} value={item.id}>{item.sku}</option>)}</select>
        </div>
        <button onClick={() => setFilters({ from: "", to: "", supplier: "All", product: "All" })}>Clear filters</button>
      </div>
      <DataTable
        columns={["Date", "Product", "Supplier", "Qty", "Unit cost", "Invoice", "Location", "Actions"]}
        rows={rows.map((item) => [
          item.date,
          findName(state.products, item.productId),
          findName(state.suppliers, item.supplierId),
          item.quantity,
          money(item.unitCost),
          item.invoice,
          item.location,
          <RowActions
            onView={() => setModal({ type: "purchaseDetail", record: item })}
            onDelete={() => onDelete(item.id)}
            deleteTitle="Delete purchase"
          />
        ])}
      />
    </section>
  );
}

function Sales({ state, query, filters, setFilters, productCost, setModal, onDelete }) {
  const rows = state.sales.filter((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    const text = `${item.date} ${item.marketplace} ${item.orderId} ${item.notes} ${product?.sku} ${product?.name}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && inDateRange(item.date, filters.from, filters.to)
      && (filters.marketplace === "All" || item.marketplace === filters.marketplace)
      && (filters.product === "All" || item.productId === filters.product);
  });
  return (
    <section className="stack">
      <div className="section-head">
        <h2><ShoppingCart size={20} />Sales history</h2>
        <button className="primary-button" onClick={() => setModal("sale")}><Plus size={16} />Record sale</button>
      </div>
      <div className="toolbar">
        <div className="filters">
          <Filter size={18} />
          <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} title="From date" />
          <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} title="To date" />
          <select value={filters.marketplace} onChange={(event) => setFilters({ ...filters, marketplace: event.target.value })}><option>All</option>{MARKETPLACES.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={filters.product} onChange={(event) => setFilters({ ...filters, product: event.target.value })}><option>All</option>{state.products.map((item) => <option key={item.id} value={item.id}>{item.sku}</option>)}</select>
        </div>
        <button onClick={() => setFilters({ from: "", to: "", marketplace: "All", product: "All" })}>Clear filters</button>
      </div>
      <DataTable
        columns={["Date", "Marketplace", "Product", "Order", "Qty", "Revenue", "Profit", "Actions"]}
        rows={rows.map((item) => [
          item.date,
          item.marketplace,
          findName(state.products, item.productId),
          item.orderId,
          item.quantity,
          money(item.quantity * item.salePrice),
          money(item.quantity * (item.salePrice - item.fees - productCost(item.productId))),
          <RowActions
            onView={() => setModal({ type: "saleDetail", record: item })}
            onDelete={() => onDelete(item.id)}
            deleteTitle="Delete sale"
          />
        ])}
      />
    </section>
  );
}

function Shipments({ state, setModal }) {
  return <Records title="FBA shipment tracker" icon={Truck} action="Create shipment" onAction={() => setModal("shipment")} columns={["Name", "Product", "Qty", "From", "To", "Status", "Ship date"]} rows={state.shipments.map((item) => [item.name, findName(state.products, item.productId), item.quantity, item.from, item.to, item.status, item.shipDate])} />;
}

function Suppliers({ state, query, filters, setFilters, setModal }) {
  const rows = state.suppliers.filter((supplier) => {
    const purchaseCount = state.purchases.filter((purchase) => purchase.supplierId === supplier.id).length;
    const text = `${supplier.name} ${supplier.contact} ${supplier.email} ${supplier.phone} ${supplier.notes}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (filters.rating === "All" || Number(supplier.rating) >= Number(filters.rating))
      && (filters.purchaseCount === "All" || purchaseCount >= Number(filters.purchaseCount));
  });
  return (
    <section className="stack">
      <div className="section-head">
        <h2><Building2 size={20} />Supplier directory</h2>
        <button className="primary-button" onClick={() => setModal("supplier")}><Plus size={16} />Add supplier</button>
      </div>
      <div className="toolbar">
        <div className="filters">
          <Filter size={18} />
          <select value={filters.rating} onChange={(event) => setFilters({ ...filters, rating: event.target.value })}>
            <option>All</option>
            <option value="5">5 stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </select>
          <select value={filters.purchaseCount} onChange={(event) => setFilters({ ...filters, purchaseCount: event.target.value })}>
            <option>All</option>
            <option value="1">Has purchases</option>
            <option value="3">3+ purchases</option>
            <option value="10">10+ purchases</option>
          </select>
        </div>
        <button onClick={() => setFilters({ rating: "All", purchaseCount: "All" })}>Clear filters</button>
      </div>
      <DataTable columns={["Supplier", "Contact", "Email", "Phone", "Rating", "Purchase count", "Notes"]} rows={rows.map((supplier) => [supplier.name, supplier.contact, supplier.email, supplier.phone, `${supplier.rating}/5`, state.purchases.filter((purchase) => purchase.supplierId === supplier.id).length, supplier.notes])} />
    </section>
  );
}

function Reports({ state, metrics, filters, setFilters, productQty, productCost }) {
  const filteredSales = state.sales.filter((sale) => {
    const product = state.products.find((item) => item.id === sale.productId);
    return inDateRange(sale.date, filters.from, filters.to)
      && (filters.marketplace === "All" || sale.marketplace === filters.marketplace)
      && (filters.category === "All" || product?.category === filters.category);
  });
  const supplierProductIds = filters.supplier === "All"
    ? null
    : new Set(state.purchases.filter((purchase) => purchase.supplierId === filters.supplier).map((purchase) => purchase.productId));
  const reportSales = supplierProductIds ? filteredSales.filter((sale) => supplierProductIds.has(sale.productId)) : filteredSales;
  const reportPurchases = state.purchases.filter((purchase) =>
    inDateRange(purchase.date, filters.from, filters.to)
    && (filters.supplier === "All" || purchase.supplierId === filters.supplier)
    && (filters.category === "All" || state.products.find((item) => item.id === purchase.productId)?.category === filters.category)
  );
  const revenue = reportSales.reduce((sum, sale) => sum + sale.quantity * sale.salePrice, 0);
  const profit = reportSales.reduce((sum, sale) => sum + sale.quantity * (sale.salePrice - sale.fees - productCost(sale.productId)), 0);
  const investment = reportPurchases.reduce((sum, purchase) => sum + purchase.quantity * purchase.unitCost, 0);
  const categories = [...new Set(state.products.map((product) => product.category).filter(Boolean))];
  const marketplaceRows = MARKETPLACES.map((marketplace) => {
    const sales = reportSales.filter((sale) => sale.marketplace === marketplace);
    const revenue = sales.reduce((sum, sale) => sum + sale.quantity * sale.salePrice, 0);
    const profit = sales.reduce((sum, sale) => sum + sale.quantity * (sale.salePrice - sale.fees - productCost(sale.productId)), 0);
    return [marketplace, sales.length, money(revenue), money(profit)];
  }).filter((row) => row[1]);
  return (
    <section className="content-grid">
      <section className="wide-panel">
        <div className="toolbar report-toolbar">
          <div className="filters">
            <Filter size={18} />
            <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} title="From date" />
            <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} title="To date" />
            <select value={filters.marketplace} onChange={(event) => setFilters({ ...filters, marketplace: event.target.value })}><option>All</option>{MARKETPLACES.map((item) => <option key={item}>{item}</option>)}</select>
            <select value={filters.supplier} onChange={(event) => setFilters({ ...filters, supplier: event.target.value })}><option>All</option>{state.suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
          <button onClick={() => setFilters({ from: "", to: "", marketplace: "All", supplier: "All", category: "All" })}>Clear filters</button>
        </div>
      </section>
      <Stat title="Filtered investment" value={money(investment)} icon={Upload} />
      <Stat title="Current stock value" value={money(metrics.inventoryValue)} icon={Boxes} />
      <Stat title="Filtered revenue" value={money(revenue)} icon={DollarSign} />
      <Stat title="Filtered margin" value={`${revenue ? Math.round((profit / revenue) * 100) : 0}%`} icon={LineChart} />
      <section className="wide-panel">
        <h2>Marketplace performance</h2>
        <DataTable columns={["Marketplace", "Orders", "Revenue", "Profit"]} rows={marketplaceRows} />
      </section>
      <section className="wide-panel">
        <h2>Reorder recommendations</h2>
        <DataTable columns={["SKU", "Product", "Available", "Target", "Suggested buy"]} rows={state.products.map((product) => [product.sku, product.name, productQty(product.id, "available"), product.targetStock, Math.max(0, Number(product.targetStock || 0) - productQty(product.id, "available"))]).filter((row) => row[4] > 0)} />
      </section>
    </section>
  );
}

function Security({ state, onImport, onReset, onImportCSV }) {
  return (
    <section className="content-grid">
      <section className="panel">
        <h2>Users and roles</h2>
        <DataTable columns={["Name", "Email", "Role"]} rows={state.users.map((user) => [user.name, user.email, user.role])} />
      </section>
      <section className="panel">
        <h2>Audit trail</h2>
        <ActivityList activities={state.activities} />
      </section>
      <section className="wide-panel">
        <DataTools state={state} onImport={onImport} onReset={onReset} onImportCSV={onImportCSV} />
      </section>
    </section>
  );
}

function DataTools({ state, onImport, onReset, onImportCSV }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const downloadJson = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      onImport(parsed);
      setError("");
      setSuccess(`Imported ${file.name}`);
    } catch {
      setSuccess("");
      setError("Import failed. Please upload a valid JSON file using the template format.");
    } finally {
      event.target.value = "";
    }
  };

  const importCSVFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (onImportCSV) {
        onImportCSV(text);
      }
      setError("");
      setSuccess(`Imported inventory from ${file.name}`);
    } catch {
      setSuccess("");
      setError("CSV import failed. Please upload a valid CSV file.");
    } finally {
      event.target.value = "";
    }
  };

  const backup = {
    products: state.products,
    suppliers: state.suppliers,
    inventory: state.inventory,
    purchases: state.purchases,
    sales: state.sales,
    shipments: state.shipments
  };

  return (
    <div className="data-tools">
      <div>
        <h2>Company data</h2>
        <p>Import your real products, suppliers, purchases, sales, shipments, and inventory from one JSON file.</p>
      </div>
      <div className="button-row">
        <label className="file-button">
          <Upload size={16} />
          Import JSON
          <input type="file" accept="application/json,.json" onChange={importFile} />
        </label>
        <label className="file-button">
          <ArrowDownToLine size={16} />
          Import CSV
          <input type="file" accept="text/csv,.csv" onChange={importCSVFile} />
        </label>
        <button onClick={() => downloadJson(`inventory-backup-${today()}.json`, backup)}><Download size={16} />Backup JSON</button>
        <button onClick={() => downloadJson("company-data-template.json", companyDataTemplate())}><ClipboardList size={16} />Template</button>
        <button className="danger-action" onClick={() => window.confirm("Reset to sample data? Your current records will be replaced.") && onReset()}><Trash2 size={16} />Reset sample</button>
      </div>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="form-error">{error}</p>}
      <DataTable
        columns={["Data type", "Current count"]}
        rows={[
          ["Products", state.products.length],
          ["Suppliers", state.suppliers.length],
          ["Inventory rows", state.inventory.length],
          ["Purchases", state.purchases.length],
          ["Sales", state.sales.length],
          ["Shipments", state.shipments.length]
        ]}
      />
    </div>
  );
}

function Records({ title, icon: Icon, action, onAction, columns, rows }) {
  return (
    <section className="stack">
      <div className="section-head">
        <h2><Icon size={20} />{title}</h2>
        <button className="primary-button" onClick={onAction}><Plus size={16} />{action}</button>
      </div>
      <DataTable columns={columns} rows={rows} />
    </section>
  );
}

function RowActions({ onView, onDelete, deleteTitle }) {
  const confirmDelete = () => {
    if (window.confirm("Delete this record? This will also update inventory counts.")) onDelete();
  };
  return (
    <div className="row-actions">
      <button type="button" title="View details" onClick={onView}><Eye size={16} /></button>
      <button type="button" className="danger-button" title={deleteTitle} onClick={confirmDelete}><Trash2 size={16} /></button>
    </div>
  );
}

function Stat({ title, value, icon: Icon, tone = "" }) {
  return <article className={`stat ${tone}`}><Icon /><span>{title}</span><strong>{value}</strong></article>;
}

function LocationBars({ inventory }) {
  const totals = LOCATIONS.map((location) => ({ location, qty: inventory.filter((item) => item.location === location).reduce((sum, item) => sum + item.quantity, 0) }));
  const max = Math.max(1, ...totals.map((item) => item.qty));
  return <div className="bars">{totals.map((item) => <div key={item.location}><span>{item.location}</span><div><i style={{ width: `${(item.qty / max) * 100}%` }} /></div><strong>{item.qty}</strong></div>)}</div>;
}

function ActivityList({ activities }) {
  return <div className="activity-list">{activities.map((activity) => <p key={activity.id}><Check size={14} /><span>{new Date(activity.at).toLocaleString()}</span>{activity.action}</p>)}</div>;
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>) : <tr><td colSpan={columns.length}>No records yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="section-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
        {children}
      </section>
    </div>
  );
}

function PurchaseDetailModal({ state, purchase, onClose }) {
  const product = state.products.find((item) => item.id === purchase.productId);
  const supplier = state.suppliers.find((item) => item.id === purchase.supplierId);
  return (
    <Modal title="Purchase details" onClose={onClose}>
      <div className="detail-grid">
        <Detail label="Date" value={purchase.date} />
        <Detail label="Product" value={`${product?.sku || ""} ${product?.name || ""}`.trim()} />
        <Detail label="Supplier" value={supplier?.name} />
        <Detail label="Quantity" value={purchase.quantity} />
        <Detail label="Unit cost" value={money(purchase.unitCost)} />
        <Detail label="Total cost" value={money(purchase.quantity * purchase.unitCost)} />
        <Detail label="Invoice" value={purchase.invoice || "Not entered"} />
        <Detail label="Location" value={purchase.location} />
        <Detail label="Notes" value={purchase.notes || "No notes"} wide />
      </div>
    </Modal>
  );
}

function SaleDetailModal({ state, sale, productCost, onClose }) {
  const product = state.products.find((item) => item.id === sale.productId);
  const unitProfit = Number(sale.salePrice || 0) - Number(sale.fees || 0) - productCost(sale.productId);
  return (
    <Modal title="Sale details" onClose={onClose}>
      <div className="detail-grid">
        <Detail label="Date" value={sale.date} />
        <Detail label="Marketplace" value={sale.marketplace} />
        <Detail label="Product" value={`${product?.sku || ""} ${product?.name || ""}`.trim()} />
        <Detail label="Order ID" value={sale.orderId || "Not entered"} />
        <Detail label="Quantity" value={sale.quantity} />
        <Detail label="Sale price" value={money(sale.salePrice)} />
        <Detail label="Fees per unit" value={money(sale.fees)} />
        <Detail label="Source location" value={sale.sourceLocation} />
        <Detail label="Revenue" value={money(sale.quantity * sale.salePrice)} />
        <Detail label="Profit" value={money(sale.quantity * unitProfit)} />
        <Detail label="Notes" value={sale.notes || "No notes"} wide />
      </div>
    </Modal>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div className={wide ? "detail-item wide-detail" : "detail-item"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { sku: "", asin: "", upc: "", name: "", brand: "", category: "", size: "", color: "", image: "", reorderPoint: 5, targetStock: 30, defaultCost: 0, defaultPrice: 0 });
  return <Modal title={product ? "Edit product" : "Add product"} onClose={onClose}><SmartForm form={form} setForm={setForm} onSave={onSave} fields={["sku", "asin", "upc", "name", "brand", "category", "size", "color", "image", "reorderPoint", "targetStock", "defaultCost", "defaultPrice"]} /></Modal>;
}

function SupplierModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", contact: "", email: "", phone: "", rating: 3, notes: "" });
  return <Modal title="Add supplier" onClose={onClose}><SmartForm form={form} setForm={setForm} onSave={onSave} fields={["name", "contact", "email", "phone", "rating", "notes"]} /></Modal>;
}

function PurchaseModal({ state, onClose, onSave }) {
  const [form, setForm] = useState({ productId: state.products[0]?.id || "", supplierId: state.suppliers[0]?.id || "", date: today(), quantity: 1, unitCost: 0, invoice: "", location: "Home Storage", notes: "" });
  return <Modal title="Record purchase" onClose={onClose}><SmartForm form={form} setForm={setForm} onSave={onSave} fields={["productId", "supplierId", "date", "quantity", "unitCost", "invoice", "location", "notes"]} state={state} /></Modal>;
}

function SaleModal({ state, onClose, onSave }) {
  const [form, setForm] = useState({ productId: state.products[0]?.id || "", date: today(), marketplace: "Amazon", orderId: "", quantity: 1, salePrice: 0, fees: 0, sourceLocation: "Amazon FBA", notes: "" });
  return <Modal title="Record sale" onClose={onClose}><SmartForm form={form} setForm={setForm} onSave={onSave} fields={["productId", "date", "marketplace", "orderId", "quantity", "salePrice", "fees", "sourceLocation", "notes"]} state={state} /></Modal>;
}

function ShipmentModal({ state, onClose, onSave }) {
  const [form, setForm] = useState({ productId: state.products[0]?.id || "", name: "", quantity: 1, from: "Home Storage", to: "Amazon FBA", status: "Draft", shipDate: today(), receiveDate: "", notes: "" });
  return <Modal title="Create shipment" onClose={onClose}><SmartForm form={form} setForm={setForm} onSave={onSave} fields={["productId", "name", "quantity", "from", "to", "status", "shipDate", "receiveDate", "notes"]} state={state} /></Modal>;
}

function AdjustModal({ state, productId, onClose, onSave }) {
  const [form, setForm] = useState({ productId: productId || state.products[0]?.id || "", location: "Home Storage", action: "RECEIVE_STOCK", quantity: 1, reason: "", notes: "" });
  const [error, setError] = useState("");
  const quantity = Number(form.quantity || 0);
  const currentStock = state.inventory
    .filter((item) => String(item.productId) === String(form.productId) && item.location === form.location && item.status === "available")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const isResetStock = form.action === "RESET_STOCK";
  const reasonRequired = isResetStock || REMOVAL_ACTIONS.includes(form.action) || (form.action === "MANUAL_ADJUSTMENT" && quantity < 0);
  const reasonOptions = isResetStock ? RESET_STOCK_REASONS : REMOVAL_REASONS;
  const submit = (event) => {
    event.preventDefault();
    if (reasonRequired && !form.reason) {
      setError("Select a reason before saving this inventory action.");
      return;
    }
    if (isResetStock && !window.confirm("Reset stock to zero?")) return;
    setError("");
    onSave({ ...form, quantity: isResetStock ? 0 : form.quantity, reason: reasonRequired ? form.reason : "", notes: form.notes });
  };

  return (
    <Modal title="Inventory Action" onClose={onClose}>
      <form className="smart-form" onSubmit={submit}>
        <Select label="Product" value={form.productId} onChange={(next) => setForm({ ...form, productId: next })} options={state.products.map((item) => ({ label: `${item.sku} · ${item.name}`, value: item.id }))} />
        <Select label="Location" value={form.location} onChange={(next) => setForm({ ...form, location: next })} options={LOCATIONS} />
        <Select label="Inventory Action" value={form.action} onChange={(next) => setForm({ ...form, action: next, reason: "" })} options={INVENTORY_ACTIONS} />
        {isResetStock && <Detail label="Current Stock" value={currentStock} />}
        {isResetStock && <Detail label="New Stock" value="0" />}
        {!isResetStock && <label className="field">
          <span>Quantity</span>
          <input type="number" value={form.quantity} required step="1" onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        </label>}
        {reasonRequired && <Select label="Reason" value={form.reason} onChange={(next) => setForm({ ...form, reason: next })} options={[{ value: "", label: "Select reason" }, ...reasonOptions]} />}
        {reasonRequired && <label className="field"><span>Notes</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>}
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit"><Check size={16} />Save</button>
      </form>
    </Modal>
  );
}

function SmartForm({ form, setForm, fields, onSave, state }) {
  const submit = (event) => {
    event.preventDefault();
    onSave(form);
  };
  return (
    <form className="smart-form" onSubmit={submit}>
      {fields.map((field) => <AutoField key={field} field={field} form={form} setForm={setForm} state={state} />)}
      <button className="primary-button" type="submit"><Check size={16} />Save</button>
    </form>
  );
}

function AutoField({ field, form, setForm, state }) {
  const value = form[field] ?? "";
  const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
  if (field === "productId") return <Select label="Product" value={value} onChange={(next) => setForm({ ...form, [field]: next })} options={state.products.map((item) => ({ label: `${item.sku} · ${item.name}`, value: item.id }))} />;
  if (field === "supplierId") return <Select label="Supplier" value={value} onChange={(next) => setForm({ ...form, [field]: next })} options={state.suppliers.map((item) => ({ label: item.name, value: item.id }))} />;
  if (field === "location" || field === "sourceLocation" || field === "from" || field === "to") return <Select label={label} value={value} onChange={(next) => setForm({ ...form, [field]: next })} options={LOCATIONS} />;
  if (field === "status") return <Select label={label} value={value} onChange={(next) => setForm({ ...form, [field]: next })} options={field === "status" && form.from ? SHIPMENT_STATUS : STATUS_TYPES} />;
  if (field === "marketplace") return <Select label={label} value={value} onChange={(next) => setForm({ ...form, [field]: next })} options={MARKETPLACES} />;
  if (field === "notes") return <label className="field"><span>{label}</span><textarea value={value} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>;
  const type = field.toLowerCase().includes("date") ? "date" : ["quantity", "unitCost", "salePrice", "fees", "rating", "reorderPoint", "targetStock", "defaultCost", "defaultPrice"].includes(field) ? "number" : "text";
  return <Field label={label} type={type} value={value} onChange={(next) => setForm({ ...form, [field]: next })} required={["sku", "name", "quantity"].includes(field)} />;
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} required={required} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => typeof option === "string" ? <option key={option} value={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function findName(items, id) {
  return items.find((item) => item.id === id)?.name || "Unknown";
}

function inDateRange(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function normalizeCompanyData(data, sessionUserId) {
  const source = data || {};
  const productIdMap = new Map();
  const supplierIdMap = new Map();

  const products = (source.products || []).map((product) => {
    const id = product.id || uid("product");
    [product.id, product.sku, product.asin, product.upc, product.name].filter(Boolean).forEach((key) => productIdMap.set(String(key), id));
    return {
      id,
      sku: product.sku || "",
      asin: product.asin || "",
      upc: product.upc || "",
      name: product.name || "Unnamed product",
      brand: product.brand || "",
      category: product.category || "",
      size: product.size || "",
      color: product.color || "",
      image: product.image || "",
      reorderPoint: Number(product.reorderPoint || 0),
      targetStock: Number(product.targetStock || 0),
      defaultCost: Number(product.defaultCost || product.cost || 0),
      defaultPrice: Number(product.defaultPrice || product.price || 0)
    };
  });

  const suppliers = (source.suppliers || []).map((supplier) => {
    const id = supplier.id || uid("supplier");
    [supplier.id, supplier.name, supplier.email].filter(Boolean).forEach((key) => supplierIdMap.set(String(key), id));
    return {
      id,
      name: supplier.name || "Unnamed supplier",
      contact: supplier.contact || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      rating: Number(supplier.rating || 3),
      notes: supplier.notes || ""
    };
  });

  const resolveProduct = (value) => productIdMap.get(String(value || "")) || products[0]?.id || "";
  const resolveSupplier = (value) => supplierIdMap.get(String(value || "")) || suppliers[0]?.id || "";

  const inventory = (source.inventory || []).map((item) => ({
    id: item.id || uid("stock"),
    productId: resolveProduct(item.productId || item.sku || item.product),
    location: item.location || "Home Storage",
    status: item.status || "available",
    quantity: Number(item.quantity || 0)
  })).filter((item) => item.productId && item.quantity > 0);

  const purchases = (source.purchases || []).map((purchase) => ({
    id: purchase.id || uid("purchase"),
    productId: resolveProduct(purchase.productId || purchase.sku || purchase.product),
    supplierId: resolveSupplier(purchase.supplierId || purchase.supplier),
    date: purchase.date || today(),
    quantity: Number(purchase.quantity || 0),
    unitCost: Number(purchase.unitCost || purchase.cost || 0),
    invoice: purchase.invoice || "",
    location: purchase.location || "Home Storage",
    notes: purchase.notes || ""
  })).filter((purchase) => purchase.productId && purchase.quantity > 0);

  const sales = (source.sales || []).map((sale) => ({
    id: sale.id || uid("sale"),
    productId: resolveProduct(sale.productId || sale.sku || sale.product),
    date: sale.date || today(),
    marketplace: sale.marketplace || "Amazon",
    orderId: sale.orderId || sale.order || "",
    quantity: Number(sale.quantity || 0),
    salePrice: Number(sale.salePrice || sale.price || 0),
    fees: Number(sale.fees || 0),
    sourceLocation: sale.sourceLocation || sale.location || "Amazon FBA",
    notes: sale.notes || ""
  })).filter((sale) => sale.productId && sale.quantity > 0);

  const shipments = (source.shipments || []).map((shipment) => ({
    id: shipment.id || uid("ship"),
    productId: resolveProduct(shipment.productId || shipment.sku || shipment.product),
    name: shipment.name || shipment.shipmentName || "Shipment",
    quantity: Number(shipment.quantity || 0),
    from: shipment.from || "Home Storage",
    to: shipment.to || "Amazon FBA",
    status: shipment.status || "Draft",
    shipDate: shipment.shipDate || shipment.date || today(),
    receiveDate: shipment.receiveDate || "",
    notes: shipment.notes || ""
  })).filter((shipment) => shipment.productId && shipment.quantity > 0);

  return {
    users: source.users?.length ? source.users : seedState().users,
    sessionUserId,
    products,
    suppliers,
    inventory: inventory.length ? inventory : inventoryFromPurchasesAndSales(purchases, sales),
    purchases,
    sales,
    shipments,
    activities: source.activities || []
  };
}

function inventoryFromPurchasesAndSales(purchases, sales) {
  let inventory = [];
  const add = (productId, location, status, quantity) => {
    const index = inventory.findIndex((item) => item.productId === productId && item.location === location && item.status === status);
    if (index >= 0) inventory[index] = { ...inventory[index], quantity: Math.max(0, inventory[index].quantity + quantity) };
    else if (quantity > 0) inventory.push({ id: uid("stock"), productId, location, status, quantity });
  };
  purchases.forEach((purchase) => add(purchase.productId, purchase.location, "available", purchase.quantity));
  sales.forEach((sale) => {
    add(sale.productId, sale.sourceLocation, "available", -sale.quantity);
    add(sale.productId, sale.sourceLocation, "sold", sale.quantity);
  });
  return inventory.filter((item) => item.quantity > 0);
}

function companyDataTemplate() {
  return {
    products: [
      {
        sku: "SKU-001",
        asin: "B000000001",
        upc: "123456789012",
        name: "Product name",
        brand: "Brand",
        category: "Category",
        size: "Size",
        color: "Color",
        image: "",
        reorderPoint: 10,
        targetStock: 50,
        defaultCost: 12.5,
        defaultPrice: 29.99
      }
    ],
    suppliers: [
      {
        name: "Supplier name",
        contact: "Contact person",
        email: "orders@example.com",
        phone: "555-0100",
        rating: 5,
        notes: "Payment terms, lead time, or other notes"
      }
    ],
    inventory: [
      {
        sku: "SKU-001",
        location: "Home Storage",
        status: "available",
        quantity: 25
      }
    ],
    purchases: [
      {
        sku: "SKU-001",
        supplier: "Supplier name",
        date: "2026-06-24",
        quantity: 25,
        unitCost: 12.5,
        invoice: "INV-001",
        location: "Home Storage",
        notes: ""
      }
    ],
    sales: [
      {
        sku: "SKU-001",
        date: "2026-06-24",
        marketplace: "Amazon",
        orderId: "ORDER-001",
        quantity: 2,
        salePrice: 29.99,
        fees: 4.25,
        sourceLocation: "Amazon FBA",
        notes: ""
      }
    ],
    shipments: [
      {
        sku: "SKU-001",
        name: "FBA shipment name",
        quantity: 10,
        from: "Home Storage",
        to: "Amazon FBA",
        status: "Dispatched",
        shipDate: "2026-06-24",
        receiveDate: "",
        notes: ""
      }
    ]
  };
}

createRoot(document.getElementById("root")).render(<App />);

const Sale = require("../models/Sale");
const SalesReturn = require("../models/SalesReturn");
const Product = require("../models/Product");
const InventoryHistory = require("../models/InventoryHistory");
const PurchaseOrder = require("../models/PurchaseOrder");
const PurchaseReturn = require("../models/PurchaseReturn");
const Supplier = require("../models/Supplier");

// helper
const getMonth = (date) => {
    const d = new Date(date);
    return d.toLocaleString("default", { month: "short" });
};

exports.getSalesReport = async (req, res) => {
    try {
        const sales = await Sale.find();
        const returns = await SalesReturn.find();

        // =========================
        // 1. Monthly Sales + Orders
        // =========================
        const monthlyMap = {};

        sales.forEach((sale) => {
            const month = getMonth(sale.createdAt);

            if (!monthlyMap[month]) {
                monthlyMap[month] = { month, revenue: 0, orders: 0 };
            }

            monthlyMap[month].revenue += sale.total || 0;
            monthlyMap[month].orders += 1;
        });

        const salesData = Object.values(monthlyMap);

        // =========================
        // 2. Payment Methods
        // =========================
        const paymentMap = {};

        sales.forEach((sale) => {
            const method = sale.payment || "Other";

            if (!paymentMap[method]) paymentMap[method] = 0;

            paymentMap[method] += 1;
        });

        const paymentData = Object.keys(paymentMap).map((key) => ({
            method: key,
            value: paymentMap[key]
        }));

        // =========================
        // 3. Top Products
        // =========================
        const productMap = {};

        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                if (!productMap[item.name]) productMap[item.name] = 0;
                productMap[item.name] += item.qty;
            });
        });

        const productData = Object.keys(productMap).map((key) => ({
            name: key,
            sold: productMap[key]
        }));

        // =========================
        // 4. Returns impact (optional)
        // =========================
        let totalRefund = 0;

        returns.forEach((r) => {
            totalRefund += r.refundAmount || 0;
        });

        res.json({
            salesData,
            paymentData,
            productData,
            totalRefund
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating report" });
    }
};

exports.getInventoryReport = async (req, res) => {
    try {
        const products = await Product.find();
        const history = await InventoryHistory.find();

        // =========================
        // 1. Stock Levels
        // =========================
        const stockData = products.map((p) => ({
            name: p.name,
            stock: p.stock || 0
        }));

        // =========================
        // 2. Low Stock (<50 same as frontend)
        // =========================
        const lowStockData = stockData.filter((i) => i.stock < 50);

        // =========================
        // 3. Stock Movement (total movement)
        // =========================
        const movementMap = {};

        history.forEach((h) => {
            const name = h.product?.name || "Unknown";

            if (!movementMap[name]) movementMap[name] = 0;

            movementMap[name] += h.qty;
        });

        const movementData = Object.keys(movementMap).map((key) => ({
            name: key,
            stock: movementMap[key]
        }));

        // =========================
        // 4. Consumption (removed stock)
        // =========================
        const consumptionMap = {};

        history.forEach((h) => {
            if (h.type === "remove") {
                const name = h.product?.name || "Unknown";

                if (!consumptionMap[name]) consumptionMap[name] = 0;

                consumptionMap[name] += h.qty;
            }
        });

        const consumptionData = Object.keys(consumptionMap).map((key) => ({
            name: key,
            stock: consumptionMap[key]
        }));

        res.json({
            stockData,
            lowStockData,
            movementData,
            consumptionData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Inventory report error" });
    }
};

exports.getPurchaseReport = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find().populate("supplier");
        const returns = await PurchaseReturn.find();
        const suppliers = await Supplier.find();

        // =========================
        // 1. Monthly Expense + Orders
        // =========================
        const monthMap = {};

        orders.forEach((o) => {
            const month = getMonth(o.createdAt);

            if (!monthMap[month]) {
                monthMap[month] = { month, expense: 0, orders: 0 };
            }

            monthMap[month].expense += o.grandTotal || 0;
            monthMap[month].orders += 1;
        });

        const data = Object.values(monthMap);

        // =========================
        // 2. Supplier Spend
        // =========================
        const supplierMap = {};

        orders.forEach((o) => {
            const name = o.supplier?.name || "Unknown";

            if (!supplierMap[name]) supplierMap[name] = 0;

            supplierMap[name] += o.grandTotal || 0;
        });

        const supplierData = Object.keys(supplierMap).map((key) => ({
            name: key,
            value: supplierMap[key]
        }));

        // =========================
        // 3. Category Spend (from items)
        // =========================
        const categoryMap = {};

        orders.forEach((o) => {
            o.items.forEach((item) => {
                const cat = item.name || "Other";

                if (!categoryMap[cat]) categoryMap[cat] = 0;

                categoryMap[cat] += item.qty * item.price;
            });
        });

        const categoryData = Object.keys(categoryMap).map((key) => ({
            name: key,
            value: categoryMap[key]
        }));

        // =========================
        // KPIs
        // =========================
        const totalExpense = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
        const totalOrders = orders.length;
        const avg = totalOrders ? totalExpense / totalOrders : 0;
        const totalSuppliers = suppliers.length;

        res.json({
            data,
            supplierData,
            categoryData,
            totalExpense,
            totalOrders,
            avg,
            totalSuppliers
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Purchase report error" });
    }
};

// helper
const getDateLabel = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
};

exports.getDashboard = async (req, res) => {
    try {
        const products = await Product.find();
        const sales = await Sale.find();
        const history = await InventoryHistory.find().populate("product");

        // =========================
        // TOP CARDS
        // =========================

        // Total Inventory Value
        const inventoryValue = products.reduce(
            (sum, p) => sum + (p.stock || 0) * (p.price || 0),
            0
        );

        // Total Products
        const totalProducts = products.length;

        // Low Stock (<50)
        const lowStock = products.filter((p) => p.stock < 50).length;

        // Total Revenue
        const totalRevenue = sales.reduce((s, sale) => s + (sale.total || 0), 0);

        // =========================
        // WEEKLY SALES (for MonthlyBarChart)
        // =========================
        const weeklySales = sales.slice(-7).map((s) => ({
            day: getDateLabel(s.createdAt),
            amount: s.total
        }));

        // =========================
        // RECENT INVENTORY ACTIVITY
        // =========================
        const recentActivity = history
            .slice(-5)
            .reverse()
            .map((h) => ({
                title:
                    h.type === "add"
                        ? `Stock Added - ${h.product?.name}`
                        : `Stock Removed - ${h.product?.name}`,
                qty: h.qty,
                date: getDateLabel(h.createdAt)
            }));

        // =========================
        // STOCK TRANSACTIONS (side list)
        // =========================
        const transactions = history
            .slice(-3)
            .reverse()
            .map((h) => ({
                name: h.product?.name,
                type: h.type,
                qty: h.qty,
                date: getDateLabel(h.createdAt)
            }));

        // =========================
        // ANALYTICS (approx values)
        // =========================
        const turnoverRate = sales.length
            ? ((sales.length / products.length) * 100).toFixed(0)
            : 0;

        const deadStock = products.filter((p) => p.stock > 0 && p.stock < 5).length;

        const stockAccuracy = 98; // static (needs audit system)

        res.json({
            inventoryValue,
            totalProducts,
            lowStock,
            totalRevenue,

            weeklySales,
            recentActivity,
            transactions,

            turnoverRate,
            deadStock,
            stockAccuracy
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Dashboard error" });
    }
};
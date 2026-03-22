const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const inventory = new Map();
const orders = new Map();
const suppliers = new Map();
const shipments = new Map();
const warehouses = new Map();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'operations-supply-chain',
    uptime: process.uptime(),
    stats: {
      inventory: inventory.size,
      orders: orders.size,
      suppliers: suppliers.size,
      shipments: shipments.size
    }
  });
});

// Inventory Management
app.post('/api/v1/inventory', async (req, res) => {
  const item = {
    id: uuidv4(),
    ...req.body,
    quantity: req.body.quantity || 0,
    reorderPoint: req.body.reorderPoint || 10,
    createdAt: new Date().toISOString()
  };
  inventory.set(item.id, item);
  res.json({ item });
});

app.get('/api/v1/inventory', (req, res) => {
  const items = Array.from(inventory.values());
  const lowStock = items.filter(i => i.quantity < i.reorderPoint);
  res.json({ items, lowStock });
});

app.post('/api/v1/inventory/:id/adjust', async (req, res) => {
  const item = inventory.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const { adjustment, reason } = req.body;
  item.quantity += adjustment;
  item.lastAdjusted = new Date().toISOString();
  item.adjustmentReason = reason;

  // Auto-reorder if below threshold
  if (item.quantity < item.reorderPoint) {
    const order = await createPurchaseOrder(item);
    res.json({ item, autoOrder: order });
  } else {
    res.json({ item });
  }
});

// Order Management
app.post('/api/v1/orders', async (req, res) => {
  const order = {
    id: uuidv4(),
    orderNumber: `ORD-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.set(order.id, order);

  // Reserve inventory
  if (req.body.items) {
    req.body.items.forEach(orderItem => {
      const item = inventory.get(orderItem.itemId);
      if (item) {
        item.quantity -= orderItem.quantity;
      }
    });
  }

  res.json({ order });
});

app.post('/api/v1/orders/:id/fulfill', async (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = 'fulfilled';
  order.fulfilledAt = new Date().toISOString();

  // Create shipment
  const shipment = {
    id: uuidv4(),
    orderId: order.id,
    status: 'in_transit',
    trackingNumber: `TRK-${Date.now()}`,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
  shipments.set(shipment.id, shipment);

  res.json({ order, shipment });
});

app.get('/api/v1/orders', (req, res) => {
  res.json({ orders: Array.from(orders.values()) });
});

// Supplier Management
app.post('/api/v1/suppliers', async (req, res) => {
  const supplier = {
    id: uuidv4(),
    ...req.body,
    rating: 0,
    createdAt: new Date().toISOString()
  };
  suppliers.set(supplier.id, supplier);
  res.json({ supplier });
});

app.get('/api/v1/suppliers', (req, res) => {
  res.json({ suppliers: Array.from(suppliers.values()) });
});

// Shipment Tracking
app.get('/api/v1/shipments/:id/track', (req, res) => {
  const shipment = shipments.get(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

  res.json({
    shipment,
    location: 'In transit',
    updates: [
      { status: 'picked_up', timestamp: shipment.createdAt },
      { status: 'in_transit', timestamp: new Date().toISOString() }
    ]
  });
});

app.post('/api/v1/shipments/:id/deliver', async (req, res) => {
  const shipment = shipments.get(req.params.id);
  if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

  shipment.status = 'delivered';
  shipment.deliveredAt = new Date().toISOString();

  res.json({ shipment });
});

// Warehouse Management
app.post('/api/v1/warehouses', async (req, res) => {
  const warehouse = {
    id: uuidv4(),
    ...req.body,
    capacity: req.body.capacity || 10000,
    currentLoad: 0,
    createdAt: new Date().toISOString()
  };
  warehouses.set(warehouse.id, warehouse);
  res.json({ warehouse });
});

app.get('/api/v1/warehouses', (req, res) => {
  res.json({ warehouses: Array.from(warehouses.values()) });
});

// Procurement
async function createPurchaseOrder(item) {
  const order = {
    id: uuidv4(),
    type: 'purchase',
    itemId: item.id,
    quantity: item.reorderPoint * 2,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.set(order.id, order);
  return order;
}

app.post('/api/v1/procurement/auto-order', async (req, res) => {
  const lowStockItems = Array.from(inventory.values())
    .filter(i => i.quantity < i.reorderPoint);

  const purchaseOrders = [];
  for (const item of lowStockItems) {
    const order = await createPurchaseOrder(item);
    purchaseOrders.push(order);
  }

  res.json({ purchaseOrders });
});

// Analytics
app.get('/api/v1/analytics', (req, res) => {
  const totalOrders = orders.size;
  const fulfilledOrders = Array.from(orders.values()).filter(o => o.status === 'fulfilled').length;
  const lowStockCount = Array.from(inventory.values()).filter(i => i.quantity < i.reorderPoint).length;

  res.json({
    orders: {
      total: totalOrders,
      fulfilled: fulfilledOrders,
      fulfillmentRate: totalOrders > 0 ? (fulfilledOrders / totalOrders) * 100 : 0
    },
    inventory: {
      total: inventory.size,
      lowStock: lowStockCount
    },
    suppliers: suppliers.size,
    shipments: {
      total: shipments.size,
      inTransit: Array.from(shipments.values()).filter(s => s.status === 'in_transit').length
    }
  });
});

const PORT = process.env.PORT || 4303;
app.listen(PORT, () => {
  console.log(`Operations Supply Chain service listening on port ${PORT}`);
});

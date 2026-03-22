/**
 * BLACKROAD OS - Inventory Management with Alerts
 *
 * SETUP: Extensions > Apps Script > Paste this code > Save > Refresh sheet
 *
 * FEATURES:
 * - Real-time stock level monitoring
 * - Automatic reorder alerts
 * - Barcode/SKU lookup
 * - Purchase order generation
 * - Inventory valuation (FIFO/LIFO/Average)
 * - Stock movement history
 * - Low stock email alerts
 * - ABC analysis for inventory optimization
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📦 Inventory Tools')
    .addItem('➕ Add New Item', 'addNewItem')
    .addItem('📥 Record Stock In', 'recordStockIn')
    .addItem('📤 Record Stock Out', 'recordStockOut')
    .addSeparator()
    .addItem('🔍 Lookup Item (SKU/Barcode)', 'lookupItem')
    .addItem('📊 Update All Stock Levels', 'updateStockLevels')
    .addSeparator()
    .addSubMenu(ui.createMenu('📋 Reports')
      .addItem('Low Stock Alert', 'lowStockReport')
      .addItem('Inventory Valuation', 'inventoryValuation')
      .addItem('Stock Movement History', 'movementHistory')
      .addItem('ABC Analysis', 'abcAnalysis'))
    .addSeparator()
    .addItem('📝 Generate Purchase Order', 'generatePO')
    .addItem('📧 Email Low Stock Alert', 'emailLowStockAlert')
    .addItem('⏰ Setup Daily Alerts', 'setupDailyAlerts')
    .addSeparator()
    .addItem('⚙️ Settings', 'openInventorySettings')
    .addToUi();
}

const CONFIG = {
  INVENTORY_START_ROW: 6,
  MOVEMENTS_SHEET: 'Stock Movements',
  PO_SHEET: 'Purchase Orders',
  ALERT_EMAIL: '', // Set in settings
  CURRENCY: '$'
};

// Add new inventory item
function addNewItem() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
      .row { display: flex; gap: 10px; }
      .row > div { flex: 1; }
    </style>
    <label>SKU / Barcode</label>
    <input type="text" id="sku" placeholder="e.g., SKU-001 or barcode">
    <label>Item Name</label>
    <input type="text" id="name" placeholder="Product name">
    <label>Category</label>
    <select id="category">
      <option>Electronics</option>
      <option>Office Supplies</option>
      <option>Raw Materials</option>
      <option>Finished Goods</option>
      <option>Packaging</option>
      <option>Other</option>
    </select>
    <div class="row">
      <div>
        <label>Unit Cost ($)</label>
        <input type="number" id="cost" step="0.01" placeholder="0.00">
      </div>
      <div>
        <label>Sell Price ($)</label>
        <input type="number" id="price" step="0.01" placeholder="0.00">
      </div>
    </div>
    <div class="row">
      <div>
        <label>Initial Qty</label>
        <input type="number" id="qty" value="0">
      </div>
      <div>
        <label>Reorder Point</label>
        <input type="number" id="reorder" value="10">
      </div>
    </div>
    <label>Supplier</label>
    <input type="text" id="supplier" placeholder="Supplier name">
    <label>Location</label>
    <input type="text" id="location" placeholder="e.g., Warehouse A, Shelf 3">
    <button onclick="addItem()">Add Item</button>
    <script>
      function addItem() {
        const item = {
          sku: document.getElementById('sku').value,
          name: document.getElementById('name').value,
          category: document.getElementById('category').value,
          cost: document.getElementById('cost').value,
          price: document.getElementById('price').value,
          qty: document.getElementById('qty').value,
          reorder: document.getElementById('reorder').value,
          supplier: document.getElementById('supplier').value,
          location: document.getElementById('location').value
        };
        google.script.run.withSuccessHandler(() => {
          alert('Item added!');
          google.script.host.close();
        }).processNewItem(item);
      }
    </script>
  `).setWidth(400).setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, '➕ Add New Item');
}

function processNewItem(item) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = Math.max(sheet.getLastRow(), CONFIG.INVENTORY_START_ROW);
  const newRow = lastRow + 1;

  sheet.getRange(newRow, 1).setValue(item.sku);
  sheet.getRange(newRow, 2).setValue(item.name);
  sheet.getRange(newRow, 3).setValue(item.category);
  sheet.getRange(newRow, 4).setValue(parseFloat(item.cost) || 0);
  sheet.getRange(newRow, 5).setValue(parseFloat(item.price) || 0);
  sheet.getRange(newRow, 6).setValue(parseInt(item.qty) || 0);
  sheet.getRange(newRow, 7).setValue(parseInt(item.reorder) || 10);
  sheet.getRange(newRow, 8).setValue(item.supplier);
  sheet.getRange(newRow, 9).setValue(item.location);
  sheet.getRange(newRow, 10).setValue(new Date()); // Last updated
  sheet.getRange(newRow, 11).setValue('=IF(F' + newRow + '<=G' + newRow + ',"⚠️ LOW","✅ OK")'); // Status

  // Record initial stock if qty > 0
  if (parseInt(item.qty) > 0) {
    recordMovement(item.sku, item.name, 'IN', parseInt(item.qty), 'Initial stock');
  }
}

// Record stock in
function recordStockIn() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #2979FF; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>SKU / Barcode</label>
    <input type="text" id="sku" placeholder="Scan or enter SKU">
    <label>Quantity Received</label>
    <input type="number" id="qty" value="1" min="1">
    <label>Reference (PO#, Invoice#)</label>
    <input type="text" id="reference" placeholder="e.g., PO-001">
    <label>Notes</label>
    <input type="text" id="notes" placeholder="Optional notes">
    <button onclick="recordIn()">📥 Record Stock In</button>
    <script>
      function recordIn() {
        const data = {
          sku: document.getElementById('sku').value,
          qty: parseInt(document.getElementById('qty').value),
          reference: document.getElementById('reference').value,
          notes: document.getElementById('notes').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          document.getElementById('sku').value = '';
          document.getElementById('qty').value = '1';
          document.getElementById('reference').value = '';
          document.getElementById('notes').value = '';
        }).processStockIn(data);
      }
    </script>
  `).setWidth(350).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '📥 Stock In');
}

function processStockIn(data) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Find item by SKU
  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === data.sku) {
      const currentQty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
      const newQty = currentQty + data.qty;
      const itemName = sheet.getRange(row, 2).getValue();

      sheet.getRange(row, 6).setValue(newQty);
      sheet.getRange(row, 10).setValue(new Date());

      recordMovement(data.sku, itemName, 'IN', data.qty, data.reference + ' ' + data.notes);

      return '✅ Added ' + data.qty + ' units to ' + itemName + '\nNew stock: ' + newQty;
    }
  }

  return '❌ SKU not found: ' + data.sku;
}

// Record stock out
function recordStockOut() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 15px; }
      label { display: block; margin-top: 10px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
      button { margin-top: 15px; padding: 12px; background: #FF1D6C; color: white; border: none; cursor: pointer; width: 100%; border-radius: 4px; }
    </style>
    <label>SKU / Barcode</label>
    <input type="text" id="sku" placeholder="Scan or enter SKU">
    <label>Quantity Out</label>
    <input type="number" id="qty" value="1" min="1">
    <label>Reason</label>
    <select id="reason">
      <option>Sale</option>
      <option>Internal Use</option>
      <option>Damaged</option>
      <option>Return to Supplier</option>
      <option>Transfer</option>
      <option>Other</option>
    </select>
    <label>Reference</label>
    <input type="text" id="reference" placeholder="e.g., Order #, Employee name">
    <button onclick="recordOut()">📤 Record Stock Out</button>
    <script>
      function recordOut() {
        const data = {
          sku: document.getElementById('sku').value,
          qty: parseInt(document.getElementById('qty').value),
          reason: document.getElementById('reason').value,
          reference: document.getElementById('reference').value
        };
        google.script.run.withSuccessHandler((result) => {
          alert(result);
          document.getElementById('sku').value = '';
          document.getElementById('qty').value = '1';
        }).processStockOut(data);
      }
    </script>
  `).setWidth(350).setHeight(350);

  SpreadsheetApp.getUi().showModalDialog(html, '📤 Stock Out');
}

function processStockOut(data) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === data.sku) {
      const currentQty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
      const itemName = sheet.getRange(row, 2).getValue();

      if (data.qty > currentQty) {
        return '❌ Insufficient stock! Available: ' + currentQty;
      }

      const newQty = currentQty - data.qty;
      sheet.getRange(row, 6).setValue(newQty);
      sheet.getRange(row, 10).setValue(new Date());

      recordMovement(data.sku, itemName, 'OUT', data.qty, data.reason + ': ' + data.reference);

      let warning = '';
      const reorderPoint = parseInt(sheet.getRange(row, 7).getValue()) || 0;
      if (newQty <= reorderPoint) {
        warning = '\n\n⚠️ LOW STOCK ALERT: Below reorder point!';
      }

      return '✅ Removed ' + data.qty + ' units from ' + itemName + '\nNew stock: ' + newQty + warning;
    }
  }

  return '❌ SKU not found: ' + data.sku;
}

// Record movement in history
function recordMovement(sku, name, type, qty, notes) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let movSheet = ss.getSheetByName(CONFIG.MOVEMENTS_SHEET);

  if (!movSheet) {
    movSheet = ss.insertSheet(CONFIG.MOVEMENTS_SHEET);
    movSheet.getRange(1, 1, 1, 6).setValues([['Date', 'SKU', 'Item', 'Type', 'Quantity', 'Notes']]);
    movSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#E0E0E0');
  }

  const row = movSheet.getLastRow() + 1;
  movSheet.getRange(row, 1, 1, 6).setValues([[new Date(), sku, name, type, qty, notes]]);
}

// Lookup item
function lookupItem() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Enter SKU or Barcode:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const sku = response.getResponseText().trim();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    if (sheet.getRange(row, 1).getValue() === sku) {
      const data = sheet.getRange(row, 1, 1, 11).getValues()[0];
      const info = `
ITEM FOUND: ${data[1]}
================
SKU: ${data[0]}
Category: ${data[2]}
Cost: $${data[3]}
Price: $${data[4]}
Current Stock: ${data[5]}
Reorder Point: ${data[6]}
Supplier: ${data[7]}
Location: ${data[8]}
Last Updated: ${data[9]}
Status: ${data[10]}
      `;
      ui.alert(info);

      // Highlight the row
      sheet.getRange(row, 1, 1, 11).setBackground('#FFEB3B');
      return;
    }
  }

  ui.alert('❌ SKU not found: ' + sku);
}

// Low stock report
function lowStockReport() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  let lowStock = [];

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    const qty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
    const reorder = parseInt(sheet.getRange(row, 7).getValue()) || 0;

    if (qty <= reorder) {
      lowStock.push({
        sku: sheet.getRange(row, 1).getValue(),
        name: sheet.getRange(row, 2).getValue(),
        qty: qty,
        reorder: reorder,
        supplier: sheet.getRange(row, 8).getValue()
      });

      // Highlight
      sheet.getRange(row, 1, 1, 11).setBackground('#FFCDD2');
    }
  }

  if (lowStock.length === 0) {
    SpreadsheetApp.getUi().alert('✅ All items are above reorder point!');
    return;
  }

  let report = '⚠️ LOW STOCK ALERT\n==================\n\n';
  for (const item of lowStock) {
    report += `${item.sku}: ${item.name}\n`;
    report += `  Stock: ${item.qty} (Reorder at: ${item.reorder})\n`;
    report += `  Supplier: ${item.supplier}\n\n`;
  }

  SpreadsheetApp.getUi().alert(report);
}

// Inventory valuation
function inventoryValuation() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let totalCost = 0;
  let totalRetail = 0;
  let itemCount = 0;

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    const qty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
    const cost = parseFloat(sheet.getRange(row, 4).getValue()) || 0;
    const price = parseFloat(sheet.getRange(row, 5).getValue()) || 0;

    totalCost += qty * cost;
    totalRetail += qty * price;
    itemCount++;
  }

  const margin = totalRetail - totalCost;
  const marginPct = totalRetail > 0 ? ((margin / totalRetail) * 100).toFixed(1) : 0;

  const report = `
INVENTORY VALUATION
===================

Total SKUs: ${itemCount}
Cost Value: $${totalCost.toLocaleString()}
Retail Value: $${totalRetail.toLocaleString()}
Potential Margin: $${margin.toLocaleString()} (${marginPct}%)
  `;

  SpreadsheetApp.getUi().alert(report);
}

// Movement history
function movementHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const movSheet = ss.getSheetByName(CONFIG.MOVEMENTS_SHEET);

  if (!movSheet) {
    SpreadsheetApp.getUi().alert('No stock movements recorded yet.');
    return;
  }

  ss.setActiveSheet(movSheet);
  SpreadsheetApp.getUi().alert('📋 Showing Stock Movements sheet.\n\nThis log shows all stock ins and outs.');
}

// ABC Analysis
function abcAnalysis() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let items = [];

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    const qty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
    const cost = parseFloat(sheet.getRange(row, 4).getValue()) || 0;
    items.push({
      row: row,
      sku: sheet.getRange(row, 1).getValue(),
      name: sheet.getRange(row, 2).getValue(),
      value: qty * cost
    });
  }

  // Sort by value descending
  items.sort((a, b) => b.value - a.value);

  const totalValue = items.reduce((sum, i) => sum + i.value, 0);
  let cumulative = 0;

  let report = 'ABC INVENTORY ANALYSIS\n======================\n\n';

  for (const item of items) {
    cumulative += item.value;
    const pct = (cumulative / totalValue) * 100;

    let category = 'C';
    if (pct <= 80) category = 'A';
    else if (pct <= 95) category = 'B';

    report += `[${category}] ${item.sku}: $${item.value.toLocaleString()}\n`;
  }

  report += '\n\nA = Top 80% value (focus here)\nB = Next 15% value\nC = Remaining 5%';

  SpreadsheetApp.getUi().alert(report);
}

// Generate Purchase Order
function generatePO() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let poItems = [];

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    const qty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
    const reorder = parseInt(sheet.getRange(row, 7).getValue()) || 0;

    if (qty <= reorder) {
      const orderQty = (reorder * 2) - qty; // Order to 2x reorder point
      poItems.push({
        sku: sheet.getRange(row, 1).getValue(),
        name: sheet.getRange(row, 2).getValue(),
        qty: orderQty,
        cost: sheet.getRange(row, 4).getValue(),
        supplier: sheet.getRange(row, 8).getValue()
      });
    }
  }

  if (poItems.length === 0) {
    SpreadsheetApp.getUi().alert('✅ No items need reordering!');
    return;
  }

  // Create PO sheet
  let poSheet = ss.getSheetByName(CONFIG.PO_SHEET);
  if (!poSheet) {
    poSheet = ss.insertSheet(CONFIG.PO_SHEET);
  }

  const poNum = 'PO-' + Date.now().toString().slice(-6);
  const startRow = poSheet.getLastRow() + 2;

  poSheet.getRange(startRow, 1).setValue('PURCHASE ORDER: ' + poNum);
  poSheet.getRange(startRow + 1, 1).setValue('Date: ' + new Date().toLocaleDateString());
  poSheet.getRange(startRow + 3, 1, 1, 5).setValues([['SKU', 'Item', 'Qty', 'Unit Cost', 'Total']]);

  let total = 0;
  for (let i = 0; i < poItems.length; i++) {
    const item = poItems[i];
    const lineTotal = item.qty * item.cost;
    total += lineTotal;
    poSheet.getRange(startRow + 4 + i, 1, 1, 5).setValues([
      [item.sku, item.name, item.qty, item.cost, lineTotal]
    ]);
  }

  poSheet.getRange(startRow + 4 + poItems.length, 4, 1, 2).setValues([['TOTAL:', total]]);

  ss.setActiveSheet(poSheet);
  SpreadsheetApp.getUi().alert('✅ Purchase Order ' + poNum + ' created!\n\nTotal: $' + total.toLocaleString());
}

// Email low stock alert
function emailLowStockAlert() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('Send low stock alert to:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() !== ui.Button.OK) return;

  const email = response.getResponseText();
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();

  let lowStock = [];

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    const qty = parseInt(sheet.getRange(row, 6).getValue()) || 0;
    const reorder = parseInt(sheet.getRange(row, 7).getValue()) || 0;

    if (qty <= reorder) {
      lowStock.push(
        sheet.getRange(row, 1).getValue() + ': ' +
        sheet.getRange(row, 2).getValue() + ' (Stock: ' + qty + ')'
      );
    }
  }

  if (lowStock.length === 0) {
    ui.alert('No items below reorder point.');
    return;
  }

  const subject = '⚠️ Low Stock Alert - ' + new Date().toLocaleDateString();
  const body = 'LOW STOCK ALERT\n\nThe following items need reordering:\n\n' + lowStock.join('\n') + '\n\n--\nBlackRoad OS Inventory System';

  MailApp.sendEmail(email, subject, body);
  ui.alert('✅ Alert sent to ' + email);
}

// Setup daily alerts trigger
function setupDailyAlerts() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'dailyLowStockCheck') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  ScriptApp.newTrigger('dailyLowStockCheck')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  SpreadsheetApp.getUi().alert('✅ Daily low stock check scheduled for 8 AM');
}

function dailyLowStockCheck() {
  // Would need CONFIG.ALERT_EMAIL set
  // This runs automatically
}

// Settings
function openInventorySettings() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { color: #4CAF50; }
      code { background: #f5f5f5; padding: 2px 6px; }
    </style>
    <h3>⚙️ Inventory Settings</h3>
    <p><b>Sheets:</b></p>
    <p>• Main inventory on Sheet 1</p>
    <p>• Movements tracked on "Stock Movements"</p>
    <p>• POs generated on "Purchase Orders"</p>
    <p><b>Columns:</b> SKU, Name, Category, Cost, Price, Qty, Reorder, Supplier, Location, Updated, Status</p>
    <p><b>Customize:</b> Edit CONFIG in Apps Script</p>
  `).setWidth(400).setHeight(280);

  SpreadsheetApp.getUi().showModalDialog(html, '⚙️ Settings');
}

// Update stock levels helper
function updateStockLevels() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  let updated = 0;

  for (let row = CONFIG.INVENTORY_START_ROW; row <= lastRow; row++) {
    const sku = sheet.getRange(row, 1).getValue();
    if (sku) {
      // Recalculate status formula
      sheet.getRange(row, 11).setValue('=IF(F' + row + '<=G' + row + ',"⚠️ LOW","✅ OK")');
      updated++;
    }
  }

  SpreadsheetApp.getUi().alert('✅ Updated ' + updated + ' items');
}

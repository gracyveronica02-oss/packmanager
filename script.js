// PackManager Enhanced Features
// Operator dashboard with inventory, search, analytics, and barcode scanning

class PackManagerApp {
  constructor() {
    this.orders = this.loadOrders();
    this.inventory = this.loadInventory();
    this.decisions = this.loadDecisions();
    this.currentOrder = null;
    this.darkMode = localStorage.getItem('packmanager-dark') === 'true';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderOrderList();
    this.renderInventoryPanel();
    this.renderAnalyticsDashboard();
    this.applyTheme();
  }

  setupEventListeners() {
    // Search and filter
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleFilter(btn.dataset.filter));
    });

    // Order list clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.order-card')) {
        const orderId = e.target.closest('.order-card').dataset.orderId;
        this.selectOrder(orderId);
      }
    });

    // Decision buttons
    document.querySelectorAll('[data-order-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.orderAction;
        if (this.currentOrder) this.handleOrderAction(action);
      });
    });

    // Demo decision buttons
    document.querySelectorAll('.decision').forEach(btn => {
      btn.addEventListener('click', () => this.handleDecision(btn));
    });

    // Barcode scanner
    const scannerBtn = document.getElementById('barcode-scan-btn');
    if (scannerBtn) {
      scannerBtn.addEventListener('click', () => this.initBarcodeScanner());
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Inventory modal
    const inventoryBtn = document.getElementById('inventory-toggle');
    if (inventoryBtn) {
      inventoryBtn.addEventListener('click', () => this.toggleInventoryModal());
    }
  }

  // ========== INVENTORY MANAGEMENT ==========
  loadInventory() {
    const saved = localStorage.getItem('packmanager-inventory');
    if (saved) return JSON.parse(saved);

    return [
      { id: 'SKU-001', name: 'Ceramic Mug', stock: 145, reserved: 32, available: 113 },
      { id: 'SKU-002', name: 'USB-C Cable', stock: 320, reserved: 78, available: 242 },
      { id: 'SKU-003', name: 'Notebook', stock: 89, reserved: 15, available: 74 },
      { id: 'SKU-004', name: 'Wireless Charger', stock: 52, reserved: 12, available: 40 },
      { id: 'SKU-005', name: 'Phone Case', stock: 210, reserved: 41, available: 169 },
    ];
  }

  renderInventoryPanel() {
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) return;

    inventoryList.innerHTML = this.inventory.map(item => `
      <div class="inventory-row">
        <div class="inventory-item">
          <span class="inventory-sku">${item.id}</span>
          <span class="inventory-name">${item.name}</span>
        </div>
        <div class="inventory-stats">
          <div class="stat">
            <small>Total</small>
            <strong>${item.stock}</strong>
          </div>
          <div class="stat">
            <small>Reserved</small>
            <strong>${item.reserved}</strong>
          </div>
          <div class="stat highlight">
            <small>Available</small>
            <strong>${item.available}</strong>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ========== ADVANCED ORDER SEARCH ==========
  loadOrders() {
    const saved = localStorage.getItem('packmanager-orders');
    if (saved) return JSON.parse(saved);

    return [
      { id: 'PM-52904', customer: 'John Smith', status: 'review', items: 3, confidence: 72, station: 4, layer: 2, time: '2:34 PM' },
      { id: 'PM-52903', customer: 'Jane Doe', status: 'ready', items: 5, confidence: 95, station: 2, layer: 1, time: '2:18 PM' },
      { id: 'PM-52902', customer: 'Bob Wilson', status: 'hold', items: 2, confidence: 38, station: 3, layer: 3, time: '1:52 PM' },
      { id: 'PM-52901', customer: 'Alice Brown', status: 'ready', items: 4, confidence: 98, station: 1, layer: 1, time: '1:30 PM' },
      { id: 'PM-52900', customer: 'Charlie Davis', status: 'review', items: 6, confidence: 65, station: 4, layer: 2, time: '1:15 PM' },
    ];
  }

  handleSearch(query) {
    const filtered = this.orders.filter(order => {
      const q = query.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.status.includes(q)
      );
    });
    this.renderOrderList(filtered);
  }

  // ========== ANALYTICS DASHBOARD ==========
  renderAnalyticsDashboard() {
    const dashboardContainer = document.getElementById('analytics-dashboard');
    if (!dashboardContainer) return;

    const totalOrders = this.orders.length;
    const readyCount = this.orders.filter(o => o.status === 'ready').length;
    const reviewCount = this.orders.filter(o => o.status === 'review').length;
    const holdCount = this.orders.filter(o => o.status === 'hold').length;
    const avgConfidence = (this.orders.reduce((sum, o) => sum + o.confidence, 0) / totalOrders).toFixed(1);
    const successRate = ((readyCount / totalOrders) * 100).toFixed(1);

    dashboardContainer.innerHTML = `
      <div class="analytics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Orders</div>
          <div class="metric-value">${totalOrders}</div>
          <div class="metric-trend">↑ 12% from yesterday</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Ready to ship</div>
          <div class="metric-value">${readyCount}</div>
          <div class="metric-trend">${readyCount > 3 ? '↑ Exceeding target' : '↓ Below target'}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Needs Review</div>
          <div class="metric-value">${reviewCount}</div>
          <div class="metric-trend">Avg confidence: ${avgConfidence}%</div>
        </div>
        <div class="metric-card is-warning">
          <div class="metric-label">On Hold</div>
          <div class="metric-value">${holdCount}</div>
          <div class="metric-trend">Action required</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Success Rate</div>
          <div class="metric-value">${successRate}%</div>
          <div class="metric-trend">Target: 95%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Avg Confidence</div>
          <div class="metric-value">${avgConfidence}%</div>
          <div class="metric-trend">System accuracy improving</div>
        </div>
      </div>
    `;
  }

  // ========== SMART ANOMALY DETECTION ==========
  detectAnomalies(order) {
    const anomalies = [];

    // Low confidence detection
    if (order.confidence < 50) {
      anomalies.push({ type: 'low-confidence', msg: 'Very low confidence — manual review recommended', severity: 'high' });
    }

    // Unusual layer depth
    if (order.layer > 2) {
      anomalies.push({ type: 'deep-layer', msg: 'Multiple layers required for this order', severity: 'medium' });
    }

    // High item count
    if (order.items > 5) {
      anomalies.push({ type: 'many-items', msg: 'Larger than average order — verify count carefully', severity: 'medium' });
    }

    return anomalies;
  }

  // ========== QR/BARCODE SCANNER ==========
  initBarcodeScanner() {
    const modal = document.getElementById('scanner-modal');
    if (!modal) {
      this.showNotification('Scanner not available on this page', 'warning');
      return;
    }

    modal.style.display = 'flex';
    const video = document.getElementById('scanner-video');

    // Simulate camera access
    setTimeout(() => {
      this.showNotification('📱 Camera access simulated. Scan any barcode.', 'info');

      // Listen for manual input (simulating barcode scanner)
      const input = document.getElementById('manual-barcode');
      if (input) {
        input.focus();
        input.addEventListener('change', (e) => this.processBarcodeInput(e.target.value));
      }
    }, 500);
  }

  processBarcodeInput(barcode) {
    // Find matching order or inventory
    const order = this.orders.find(o => o.id === barcode);
    const item = this.inventory.find(i => i.id === barcode);

    if (order) {
      this.selectOrder(order.id);
      this.showNotification(`📦 Scanned order: ${order.id}`, 'success');
    } else if (item) {
      this.showNotification(`📦 Found item: ${item.name} (${item.available} available)`, 'success');
    } else {
      this.showNotification(`❌ Barcode not found: ${barcode}`, 'error');
    }

    document.getElementById('scanner-modal').style.display = 'none';
  }

  // ========== ORDER MANAGEMENT ==========
  renderOrderList(orders = null) {
    const orderList = document.getElementById('order-list');
    if (!orderList) return;

    const toRender = orders || this.orders;

    orderList.innerHTML = toRender.map(order => `
      <div class="order-card" data-order-id="${order.id}" role="button" tabindex="0">
        <div class="order-header">
          <span class="order-id">${order.id}</span>
          <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
        </div>
        <div class="order-customer">${order.customer}</div>
        <div class="order-meta">
          <span>${order.items} items</span>
          <span>Confidence: ${order.confidence}%</span>
        </div>
      </div>
    `).join('');
  }

  selectOrder(orderId) {
    this.currentOrder = this.orders.find(o => o.id === orderId);
    if (!this.currentOrder) return;

    // Update detail panel
    document.getElementById('active-order-title').textContent = this.currentOrder.id;
    document.getElementById('active-order-meta').textContent = `${this.currentOrder.customer} · Station ${this.currentOrder.station} · ${this.currentOrder.items} items`;

    // Update status
    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = this.currentOrder.status.toUpperCase();
    statusEl.className = `detail-status is-${this.currentOrder.status}`;

    // Render evidence
    this.renderEvidenceList(this.currentOrder);

    // Detect anomalies
    const anomalies = this.detectAnomalies(this.currentOrder);
    if (anomalies.length > 0) {
      this.showAnomalies(anomalies);
    }

    // Highlight selected card
    document.querySelectorAll('.order-card').forEach(card => card.classList.remove('is-active'));
    document.querySelector(`[data-order-id="${orderId}"]`).classList.add('is-active');
  }

  renderEvidenceList(order) {
    const evidenceList = document.getElementById('evidence-list');
    if (!evidenceList) return;

    evidenceList.innerHTML = `
      <div class="evidence-section">
        <h4>Evidence for Order ${order.id}</h4>
        <div class="evidence-items">
          <div class="evidence-item">
            <span class="evidence-label">Layer 1</span>
            <span class="evidence-status">✓ Verified</span>
          </div>
          <div class="evidence-item">
            <span class="evidence-label">Layer ${order.layer}</span>
            <span class="evidence-status">⚠ Flagged</span>
          </div>
          <div class="evidence-item">
            <span class="evidence-label">Confidence</span>
            <span class="evidence-value">${order.confidence}%</span>
          </div>
          <div class="evidence-item">
            <span class="evidence-label">Items Expected</span>
            <span class="evidence-value">${order.items}</span>
          </div>
        </div>
      </div>
    `;
  }

  showAnomalies(anomalies) {
    const anomalyList = document.createElement('div');
    anomalyList.className = 'anomaly-alert';
    anomalyList.innerHTML = `
      <h4>⚠ Anomalies Detected</h4>
      <ul>
        ${anomalies.map(a => `<li class="anomaly-${a.severity}">${a.msg}</li>`).join('')}
      </ul>
    `;

    const evidenceList = document.getElementById('evidence-list');
    if (evidenceList) {
      const existing = evidenceList.querySelector('.anomaly-alert');
      if (existing) existing.remove();
      evidenceList.insertBefore(anomalyList, evidenceList.firstChild);
    }
  }

  handleOrderAction(action) {
    const order = this.currentOrder;
    const timestamp = new Date().toLocaleTimeString();

    let newStatus = order.status;
    let message = '';

    switch (action) {
      case 'approve':
        newStatus = 'ready';
        message = `✓ Order ${order.id} approved and ready to ship`;
        break;
      case 'capture':
        message = `↻ Requested additional capture for order ${order.id}`;
        break;
      case 'hold':
        newStatus = 'hold';
        message = `! Order ${order.id} placed on hold for manual review`;
        break;
    }

    // Update order status
    order.status = newStatus;
    this.saveOrders();

    // Log decision
    this.logDecision(order.id, action, timestamp);

    // Show notification
    this.showNotification(message, action === 'hold' ? 'warning' : 'success');

    // Refresh UI
    this.renderOrderList();
    this.renderAnalyticsDashboard();
    this.selectOrder(order.id);
  }

  // ========== AUDIT TRAIL & LOGGING ==========
  loadDecisions() {
    const saved = localStorage.getItem('packmanager-decisions');
    return saved ? JSON.parse(saved) : [];
  }

  logDecision(orderId, action, timestamp) {
    this.decisions.push({ orderId, action, timestamp });
    localStorage.setItem('packmanager-decisions', JSON.stringify(this.decisions));
    this.renderDecisionLog();
  }

  renderDecisionLog() {
    const decisionLog = document.getElementById('decision-log');
    if (!decisionLog) return;

    const recent = this.decisions.slice(-5).reverse();
    decisionLog.innerHTML = recent.map(d => `
      <li class="log-entry">
        <span class="log-time">${d.timestamp}</span>
        <span class="log-action">${d.action}</span>
        <span class="log-order">${d.orderId}</span>
      </li>
    `).join('');
  }

  // ========== THEME MANAGEMENT ==========
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('packmanager-dark', this.darkMode);
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }

  // ========== NOTIFICATIONS ==========
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('is-visible');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('is-visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // ========== STORAGE ==========
  saveOrders() {
    localStorage.setItem('packmanager-orders', JSON.stringify(this.orders));
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PackManagerApp();
  });
} else {
  new PackManagerApp();
}

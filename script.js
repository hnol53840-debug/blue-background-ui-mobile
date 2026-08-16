/* ============================================
   SMARTPOCKET — Clean UI Script
   ============================================ */

let state = {
  currency: 'USD',
  income: 500,
  expense: 320,
  budget: 300,
  transactions: [
    { id: 1, type: 'income', category: 'Salary', amount: 500, note: 'Monthly salary', date: '01 Aug 2026', icon: '💰' },
    { id: 2, type: 'expense', category: 'Food', amount: 50, note: 'Lunch', date: '02 Aug 2026', icon: '🍔' },
    { id: 3, type: 'expense', category: 'Transport', amount: 25, note: 'Bus fare', date: '03 Aug 2026', icon: '🚌' },
    { id: 4, type: 'expense', category: 'Shopping', amount: 80, note: 'Clothes', date: '04 Aug 2026', icon: '🛍️' },
    { id: 5, type: 'expense', category: 'Education', amount: 30, note: 'Books', date: '05 Aug 2026', icon: '📚' },
  ]
};

const symbols = { USD: '$', KHR: '៛', THB: '฿' };
const currencyLabels = { USD: 'USD', KHR: 'KHR', THB: 'THB' };

function fmt(n) {
  const s = symbols[state.currency];
  return s + n.toFixed(0);
}

function renderAll() {
  const bal = state.income - state.expense;
  document.getElementById('heroBalance').textContent = fmt(bal);
  document.getElementById('heroCurrency').textContent = currencyLabels[state.currency];
  document.getElementById('heroBalanceFill').style.width = Math.min(100, Math.max(5, (bal / Math.max(bal + state.expense, 1)) * 100)) + '%';

  document.getElementById('totalIncome').textContent = fmt(state.income);
  document.getElementById('totalExpense').textContent = fmt(state.expense);

  // Chart
  const cats = {};
  state.transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const totalExp = Object.values(cats).reduce((a,b)=>a+b,0) || 1;
  let topCat = { name: '-', pct: 0 };
  Object.entries(cats).forEach(([k,v]) => {
    const p = Math.round((v / totalExp) * 100);
    if (p > topCat.pct) topCat = { name: k, pct: p };
  });
  document.getElementById('topCategory').textContent = topCat.name + ' ' + topCat.pct + '%';

  // Budget
  const usedPct = Math.round((state.expense / state.budget) * 100);
  document.getElementById('budgetFill').style.width = Math.min(100, usedPct) + '%';
  document.getElementById('budgetUsedText').textContent = usedPct + '%';
  document.getElementById('budgetUsed').textContent = usedPct + '%';
  document.getElementById('budgetAmount').textContent = fmt(state.budget);
  document.getElementById('budgetWarning').style.display = usedPct >= 85 ? 'inline' : 'none';
  document.getElementById('budgetUsedText').style.color = usedPct >= 85 ? 'var(--warning)' : 'var(--text-main)';

  // Transactions
  const list = document.getElementById('transactionList');
  list.innerHTML = state.transactions.map(t => `
    <div class="tx-item ${t.type}" data-type="${t.type}" onclick="removeTx(${t.id})">
      <div class="tx-icon">${t.icon}</div>
      <div class="tx-info"><h4>${t.category}</h4><span>${t.date} · ${t.note}</span></div>
      <span class="tx-amount">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
    </div>
  `).join('');

  // Currency buttons
  document.querySelectorAll('.currency-btn').forEach(b => b.classList.toggle('active', b.dataset.currency === state.currency));
}

function setCurrency(c) {
  state.currency = c;
  renderAll();
}

function filterByCategory(type) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === type));
  document.querySelectorAll('.tx-item').forEach(el => {
    if (type === 'all') { el.style.display = 'flex'; }
    else { el.style.display = el.dataset.type === type ? 'flex' : 'none'; }
  });
}

function filterTransactions(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.tx-item').forEach(el => {
    const text = el.innerText.toLowerCase();
    el.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function showAddForm(type) {
  document.getElementById('txType').value = type;
  document.getElementById('modalTitle').textContent = type === 'income' ? '➕ បន្ថែមចំណូល' : '➖ បន្ថែមចំណាយ';
  document.getElementById('addModal').classList.add('active');
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('txAmount').focus(), 100);
}

function closeModal() {
  document.getElementById('addModal').classList.remove('active');
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('txAmount').value = '';
  document.getElementById('txNote').value = '';
}

function submitTransaction(e) {
  e.preventDefault();
  const type = document.getElementById('txType').value;
  const amount = parseFloat(document.getElementById('txAmount').value) || 0;
  const category = document.getElementById('txCategory').value;
  const note = document.getElementById('txNote').value || '-';
  if (amount <= 0) return;
  state.transactions.unshift({
    id: Date.now(),
    type,
    category,
    amount,
    note,
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    icon: category === 'Food' ? '🍔' : category === 'Transport' ? '🚌' : category === 'Shopping' ? '🛍️' : category === 'Education' ? '📚' : '📎'
  });
  if (type === 'income') state.income += amount;
  else state.expense += amount;
  renderAll();
  closeModal();
}

function removeTx(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;
  if (tx.type === 'income') state.income -= tx.amount; else state.expense -= tx.amount;
  state.transactions = state.transactions.filter(t => t.id !== id);
  renderAll();
}

// Init
document.addEventListener('DOMContentLoaded', renderAll);

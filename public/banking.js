const API = '/api/banking';

function showMessage(text, ok) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = ok ? 'show success' : 'show error';
}

async function deposit() {
  const userId = document.getElementById('depositUserId').value;
  const amount = document.getElementById('depositAmount').value;
  const res = await fetch(`${API}/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount: Number(amount) })
  });
  const data = await res.json();
  showMessage(data.success ? `Deposited. New balance: ${data.newBalance}` : data.message, data.success);
}

async function withdraw() {
  const userId = document.getElementById('withdrawUserId').value;
  const amount = document.getElementById('withdrawAmount').value;
  const res = await fetch(`${API}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount: Number(amount) })
  });
  const data = await res.json();
  showMessage(data.success ? `Withdrawn. New balance: ${data.newBalance}` : data.message, data.success);
}

async function transfer() {
  const fromUserId = document.getElementById('transferFromId').value;
  const toUserId = document.getElementById('transferToId').value;
  const amount = document.getElementById('transferAmount').value;
  const res = await fetch(`${API}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromUserId, toUserId, amount: Number(amount) })
  });
  const data = await res.json();
  showMessage(data.success ? `Transferred. Your new balance: ${data.newBalance}` : data.message, data.success);
}

async function loadHistory() {
  const userId = document.getElementById('historyUserId').value;
  const res = await fetch(`${API}/history/${userId}`);
  const rows = await res.json();
  const table = document.getElementById('historyTable');
  table.innerHTML = '<tr><th>Type</th><th>Amount</th><th>Balance After</th><th>Date</th></tr>' +
    rows.map(r => `<tr><td>${r.type}</td><td>${r.amount}</td><td>${r.balance_after}</td><td>${new Date(r.created_at).toLocaleString()}</td></tr>`).join('');
}
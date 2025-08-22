(function(){
  const state = { token: localStorage.getItem('token') || null, tx: [], subs: [], txPage: 1, txPageSize: 3 };

  const authSection = document.getElementById('authSection');
  const authWrapper = document.getElementById('authWrapper');
  const authForms = document.getElementById('authForms');
  const dashboard = document.getElementById('dashboard');

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');
  const showSignupBtn = document.getElementById('showSignup');
  const signupCard = document.getElementById('signupCard');
  const cancelSignupBtn = document.getElementById('cancelSignup');
  const loginCard = document.getElementById('loginCard');
  const txForm = document.getElementById('txForm');
  const subForm = document.getElementById('subForm');

  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const netAmountEl = document.getElementById('netAmount');
  const txList = document.getElementById('txList');
  const txPrev = document.getElementById('txPrev');
  const txNext = document.getElementById('txNext');
  const txPageInfo = document.getElementById('txPageInfo');
  const subList = document.getElementById('subList');
  const alertsList = document.getElementById('alerts');

  let barChart, pieChart;

  // Utils: validation helpers
  function formatCurrency(val){
    const n = Number(val)||0;
    return `PKR ${n.toFixed(2)}`;
  }
  function parseDateStrict(str){
    if (!str) return null;
    // handle yyyy-mm-dd (HTML date input)
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (iso.test(str)){
      const [y,m,d] = str.split('-').map(Number);
      return new Date(y, m-1, d);
    }
    // handle mm/dd/yyyy
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const m = str.match(us);
    if (m){
      const mm = Number(m[1]); const dd = Number(m[2]); const yy = Number(m[3]);
      return new Date(yy, mm-1, dd);
    }
    // fallback
    const dflt = new Date(str);
    return Number.isNaN(dflt.getTime()) ? null : dflt;
  }
  function isValidPositiveNumber(val){
    return typeof val === 'number' && isFinite(val) && val > 0;
  }
  function isValidDateStr(s){
    if (!s) return false;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return false;
    // Disallow future dates for transactions/goals
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);
    return d <= today || true; // Allow future dates for deadlines; stricter checks done per-form
  }
  function showError(el, msg){ if (!el) return; el.textContent = msg || ''; el.classList.toggle('hidden', !msg); }

  function setAuthUI() {
    if (state.token) {
      // Hide the tall auth wrapper to remove big gap after login
      authWrapper?.classList.add('hidden');
      authForms.classList.add('hidden');
      dashboard.classList.remove('hidden');
      authSection.innerHTML = `<span class="badge">Logged in</span> <button class="btn" id="logoutBtn">Logout</button>`;
      document.getElementById('logoutBtn').onclick = () => {
        state.token = null; localStorage.removeItem('token'); location.reload();
      };
      refreshAll();
    } else {
      // Show the auth wrapper on logged-out state
      authWrapper?.classList.remove('hidden');
      authForms.classList.remove('hidden');
      dashboard.classList.add('hidden');
      authSection.innerHTML = '';
    }
  }

  async function api(path, options={}){
    const res = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers||{}), ...(state.token?{ Authorization: `Bearer ${state.token}` }:{}) } });
    if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
    if (res.status === 204) return null;
    return res.json();
  }

  function computeStats() {
    const income = state.tx.filter(t=>t.type==='income').reduce((a,b)=>a+b.amount,0);
    const expenses = state.tx.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0);
    return { income, expenses, net: income - expenses };
  }

  function renderStats(){
    const { income, expenses, net } = computeStats();
    totalIncomeEl.textContent = formatCurrency(income);
    totalExpensesEl.textContent = formatCurrency(expenses);
    netAmountEl.textContent = formatCurrency(net);
  }

  function renderTxList(){
    if (!txList) return;
    txList.innerHTML = '';
    // Sort newest first
    const sorted = [...state.tx].sort((a,b)=> new Date(b.date)-new Date(a.date));
    // Pagination
    const total = sorted.length;
    const pageSize = state.txPageSize;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (state.txPage > totalPages) state.txPage = totalPages;
    if (state.txPage < 1) state.txPage = 1;
    const start = (state.txPage - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);
    // Render rows
    for (const t of pageItems){
      const li = document.createElement('li');
      li.className = 'py-2 flex items-center justify-between';
      li.innerHTML = `<div>
        <div class="font-medium">${t.category} - ${t.type === 'expense' ? '-' : ''}${formatCurrency(t.amount)}</div>
        <div class="text-sm text-gray-500">${t.date}${t.description? ' • ' + t.description:''}</div>
      </div>
      <button type="button" class="btn btn-danger-outline" data-id="${t.id}">Delete</button>`;
      li.querySelector('button').onclick = async (e)=>{
        try{
          await api(`/api/transactions/${t.id}`, { method: 'DELETE' });
          // after delete, try to keep current page valid
          await refreshTx();
        }catch(err){ alert(err.message); }
      };
      txList.appendChild(li);
    }
    // Update pagination controls
    if (txPageInfo) {
    const from = total === 0 ? 0 : start + 1;
    const to = Math.min(total, start + pageSize);
    txPageInfo.textContent = `Showing ${from}–${to} of ${total} (Page ${state.txPage} of ${totalPages})`;
  }
    const atFirst = state.txPage <= 1;
    const atLast = state.txPage >= totalPages;
    if (txPrev) txPrev.disabled = atFirst;
    if (txNext) txNext.disabled = atLast;
  }

  // Budgets removed

  function renderSubs(){
    if (!subList) return;
    subList.innerHTML = '';
    for (const s of state.subs){
      const li = document.createElement('li');
      li.className = 'p-3 border rounded';
      li.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold">${s.name}</div>
            <div class="text-sm text-gray-500">${formatCurrency(s.amount)} • Due: ${s.dueDate} • ${s.period}</div>
          </div>
        </div>
        <form class="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2 sub-edit" novalidate>
          <input name="name" class="input" value="${s.name}" />
          <input name="amount" type="number" step="0.01" min="0" class="input" value="${s.amount}" />
          <input name="dueDate" type="date" class="input" value="${s.dueDate}" />
          <select name="period" class="input">
            <option value="monthly" ${s.period==='monthly'?'selected':''}>Monthly</option>
            <option value="quarterly" ${s.period==='quarterly'?'selected':''}>Quarterly</option>
            <option value="yearly" ${s.period==='yearly'?'selected':''}>Yearly</option>
          </select>
          <div class="flex gap-2">
            <button class="btn" data-action="save">Save</button>
            <button type="button" class="btn btn-danger-outline" data-action="delete">Delete</button>
          </div>
        </form>`;
      const form = li.querySelector('form.sub-edit');
      const delBtn = form.querySelector('[data-action="delete"]');
      form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd.entries());
        payload.amount = Number(payload.amount);
        try{
          await api(`/api/subscriptions/${s.id}`, { method:'PUT', body: JSON.stringify(payload) });
          await refreshSubs();
        }catch(err){ alert(err.message); }
      });
      // Ensure no inline style overrides; keep outlined danger look
      delBtn.className = 'btn btn-danger-outline';
      delBtn.removeAttribute('style');
      delBtn.onclick = async ()=>{
        if (!confirm('Delete this subscription?')) return;
        try{
          await api(`/api/subscriptions/${s.id}`, { method:'DELETE' });
          await refreshSubs();
        }catch(err){ alert(err.message); }
      };
      subList.appendChild(li);
    }
  }

  function renderAlerts(){
    if (!alertsList) return;
    alertsList.innerHTML = '';
    // Normalize dates to midnight to avoid timezone drift
    const today = new Date();
    today.setHours(0,0,0,0);
    // Show overdue and upcoming within 14 days
    let count = 0;
    for (const s of state.subs){
      const due = parseDateStrict(s.dueDate);
      if (!due) continue;
      due.setHours(0,0,0,0);
      const diffDays = Math.ceil((due - today) / (1000*60*60*24));
      const li = document.createElement('li');
      if (diffDays < 0){
        li.className = 'text-red-600 font-semibold';
        li.textContent = `Overdue: ${s.name} was due ${Math.abs(diffDays)} day(s) ago (${formatCurrency(s.amount)})`;
        alertsList.appendChild(li);
        count++;
      } else if (diffDays <= 14){
        li.className = 'text-blue-600 font-semibold';
        li.textContent = `Upcoming: ${s.name} due in ${diffDays} day(s) (${formatCurrency(s.amount)})`;
        alertsList.appendChild(li);
        count++;
      }
    }
    if (count === 0){
      const li = document.createElement('li');
      li.className = 'text-gray-500';
      li.textContent = 'No alerts for the next 14 days.';
      alertsList.appendChild(li);
    }
  }

  function renderCharts(){
    const ctxBar = document.getElementById('barChart');
    const ctxPie = document.getElementById('pieChart');
    const { income, expenses } = computeStats();

    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    barChart = new Chart(ctxBar, {
      type: 'bar',
      data: { labels: ['Income', 'Expenses'], datasets: [{ label: 'Amount', data: [income, expenses], backgroundColor: ['#10b981', '#ef4444'] }] },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx)=> `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? ctx.parsed)}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value)=> formatCurrency(value)
            }
          }
        }
      }
    });

    const byCat = {};
    for (const t of state.tx.filter(t=>t.type==='expense')){
      byCat[t.category] = (byCat[t.category]||0) + t.amount;
    }
    const labels = Object.keys(byCat);
    const values = Object.values(byCat);
    pieChart = new Chart(ctxPie, {
      type: 'pie',
      data: { labels, datasets: [{ data: values, backgroundColor: ['#f59e0b','#3b82f6','#6366f1','#8b5cf6','#ef4444','#10b981','#14b8a6'] }] },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx)=> `${ctx.label}: ${formatCurrency(ctx.parsed)}`
            }
          }
        }
      }
    });
  }

  async function refreshTx(){
    state.tx = await api('/api/transactions');
    // Keep current page unless caller changes it; render will clamp if out of bounds
    renderStats();
    renderTxList();
    renderCharts();
  }

  async function refreshSubs(){
    state.subs = await api('/api/subscriptions');
    renderSubs();
    renderAlerts();
  }

  async function refreshAll(){
    await Promise.all([refreshTx(), refreshSubs()]);
  }

  // Handlers
  // Pagination buttons
  txPrev?.addEventListener('click', (e)=>{ e.preventDefault(); state.txPage = Math.max(1, state.txPage - 1); renderTxList(); });
  txNext?.addEventListener('click', (e)=>{ e.preventDefault(); state.txPage = state.txPage + 1; renderTxList(); });
  showSignupBtn?.addEventListener('click', ()=>{
    // Switch to signup: hide login card, show signup card
    loginCard?.classList.add('hidden');
    signupCard?.classList.remove('hidden');
    showError(loginError, '');
  });
  cancelSignupBtn?.addEventListener('click', ()=>{
    // Back to login: hide signup, show login
    signupCard?.classList.add('hidden');
    loginCard?.classList.remove('hidden');
    showError(signupError, '');
  });

  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = new FormData(loginForm);
    const username = String(form.get('username')||'').trim();
    const password = String(form.get('password')||'');
    if (username.length < 3){ return showError(loginError, 'Username must be at least 3 characters'); }
    if (password.length < 6){ return showError(loginError, 'Password must be at least 6 characters'); }
    try{
      showError(loginError, '');
      const res = await api('/api/auth/login', { method:'POST', body: JSON.stringify({ username, password }) });
      state.token = res.token; localStorage.setItem('token', state.token); setAuthUI();
    }catch(err){ alert(err.message); }
  });

  signupForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = new FormData(signupForm);
    const username = String(form.get('username')||'').trim();
    const password = String(form.get('password')||'');
    if (username.length < 3){ return showError(signupError, 'Username must be at least 3 characters'); }
    if (password.length < 6){ return showError(signupError, 'Password must be at least 6 characters'); }
    try{
      showError(signupError, '');
      const res = await api('/api/auth/signup', { method:'POST', body: JSON.stringify({ username, password }) });
      state.token = res.token; localStorage.setItem('token', state.token); setAuthUI();
    }catch(err){ alert(err.message); }
  });

  txForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = new FormData(txForm);
    const payload = Object.fromEntries(form.entries());
    payload.amount = Number(payload.amount);
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(payload.date); d.setHours(0,0,0,0);
    if (!['income','expense'].includes(payload.type)) return alert('Type must be income or expense');
    if (!isValidPositiveNumber(payload.amount)) return alert('Amount must be a number greater than 0');
    if (!payload.category || String(payload.category).trim().length === 0) return alert('Category is required');
    if (!isValidDateStr(payload.date) || Number.isNaN(d.getTime())) return alert('Date is invalid');
    if (payload.type === 'expense' && d > today) return alert('Expense date cannot be in the future');
    try{
      await api('/api/transactions', { method:'POST', body: JSON.stringify(payload) });
      txForm.reset();
      // Jump to first page to show the newest entry
      state.txPage = 1;
      await refreshTx();
    }catch(err){ alert(err.message); }
  });

  // Budget form removed

  subForm?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = new FormData(subForm);
    const payload = Object.fromEntries(form.entries());
    payload.amount = Number(payload.amount);
    if (!payload.name || String(payload.name).trim().length===0) return alert('Name is required');
    if (!isValidPositiveNumber(payload.amount)) return alert('Amount must be > 0');
    if (!isValidDateStr(payload.dueDate)) return alert('Due date invalid');
    try{
      await api('/api/subscriptions', { method:'POST', body: JSON.stringify(payload) });
      subForm.reset();
      await refreshSubs();
    }catch(err){ alert(err.message); }
  });

  setAuthUI();
})();

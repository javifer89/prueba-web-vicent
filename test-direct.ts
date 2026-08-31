import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS = process.env.PB_ADMIN_PASS;

async function main() {
  // Use fetch directly for auth
  const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASS })
  });
  
  const authData = await authRes.json();
  console.log('Auth status:', authRes.status);
  if (!authRes.ok) { console.log('Auth failed:', authData); return; }
  
  const token = authData.token;
  console.log('Token:', token?.substring(0, 20) + '...');
  
  // Test create categories
  const res = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'categories',
      type: 'base',
      fields: [
        { name: 'name_ca', type: 'text', required: true },
        { name: 'name_es', type: 'text', required: true },
        { name: 'name_en', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
        { name: 'type', type: 'select', options: { maxSelect: 1, values: ['news', 'events', 'compositions', 'media', 'gallery'] }, required: true },
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    })
  });
  
  console.log('Create status:', res.status);
  const data = await res.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

main().catch(e => console.error(e));

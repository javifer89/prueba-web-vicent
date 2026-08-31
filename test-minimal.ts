import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS = process.env.PB_ADMIN_PASS;

const pb = new PocketBase(PB_URL);

async function main() {
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
  const token = pb.authStore.token;
  
  // Test 1: Create categories with just required fields
  console.log('Test 1: Minimal categories...');
  const res1 = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'categories',
      type: 'base',
      fields: [
        { name: 'name_ca', type: 'text', required: true },
        { name: 'name_es', type: 'text', required: true },
        { name: 'name_en', type: 'text', required: true },
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    })
  });
  console.log('Status:', res1.status, await res1.json());
  
  // Test 2: Add slug
  console.log('\nTest 2: With slug...');
  const res2 = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'categories2',
      type: 'base',
      fields: [
        { name: 'name_ca', type: 'text', required: true },
        { name: 'name_es', type: 'text', required: true },
        { name: 'name_en', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    })
  });
  console.log('Status:', res2.status, await res2.json());
  
  // Test 3: Add type select
  console.log('\nTest 3: With type select...');
  const res3 = await fetch(`${PB_URL}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      name: 'categories3',
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
  console.log('Status:', res3.status, await res3.json());
}

main().catch(e => console.error(e));

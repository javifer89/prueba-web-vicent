import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS = process.env.PB_ADMIN_PASS;

const pb = new PocketBase(PB_URL);

async function testCreate(name: string, fields: any[]) {
  try {
    const payload = {
      name,
      type: 'base',
      fields,
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.id != ""',
    };
    const created = await pb.collections.create(payload);
    console.log(`✅ ${name}: Created with ID ${created.id}`);
    return created.id;
  } catch (err: any) {
    console.error(`❌ ${name}:`, err.response?.data || err.message);
    return null;
  }
}

async function main() {
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
  console.log('✅ Authenticated\n');

  // Test 1: Just 3 text fields
  await testCreate('test1', [
    { name: 'name_ca', type: 'text', required: true },
    { name: 'name_es', type: 'text', required: true },
    { name: 'name_en', type: 'text', required: true },
  ]);

  // Test 2: Add slug with pattern
  await testCreate('test2', [
    { name: 'name_ca', type: 'text', required: true },
    { name: 'name_es', type: 'text', required: true },
    { name: 'name_en', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
  ]);

  // Test 3: Add select field
  await testCreate('test3', [
    { name: 'name_ca', type: 'text', required: true },
    { name: 'name_es', type: 'text', required: true },
    { name: 'name_en', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
    { name: 'type', type: 'select', options: { maxSelect: 1, values: ['news', 'events', 'compositions', 'media', 'gallery'] }, required: true },
  ]);

  // Test 4: Try select field alone
  await testCreate('test4', [
    { name: 'type', type: 'select', options: { maxSelect: 1, values: ['news', 'events', 'compositions', 'media', 'gallery'] }, required: true },
  ]);

  // Test 5: Try slug with pattern alone
  await testCreate('test5', [
    { name: 'slug', type: 'text', required: true, options: { pattern: '^[a-z0-9-]+$' } },
  ]);
}

main().catch(e => console.error(e));
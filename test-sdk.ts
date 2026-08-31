import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS = process.env.PB_ADMIN_PASS;

console.log('Env vars:', { PB_URL, PB_ADMIN_EMAIL: PB_ADMIN_EMAIL?.substring(0, 10) + '...', PB_ADMIN_PASS: PB_ADMIN_PASS ? '***' : 'undefined' });

const pb = new PocketBase(PB_URL);

async function main() {
  try {
    const authData = await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
    console.log('✅ Authenticated as admin');
    console.log('Token:', pb.authStore.token?.substring(0, 20) + '...');
    console.log('Auth record:', authData.record);
    
    // Now try creating categories
    const payload = {
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
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    const createdColl = await pb.collections.create(payload);
    console.log('✅ Created:', createdColl.id);
  } catch (e: any) {
    console.error('❌ Error:', e.message);
    if (e.response?.data) console.error('Details:', JSON.stringify(e.response.data, null, 2));
  }
}

main();

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS = process.env.PB_ADMIN_PASS;

const schemaPath = resolve(__dirname, 'pocketbase-schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

const pb = new PocketBase(PB_URL);

async function main() {
  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
  
  // Check existing collections first
  const existing = await pb.collections.getFullList();
  console.log('EXISTING:', existing.map(c => c.name + ':' + c.type).join(', '));
  
  const collDef = schema.collections.find((c: any) => c.name === 'categories');
  const payload = {
    name: collDef.name,
    type: collDef.type,
    fields: collDef.schema,
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
  };
  
  console.log('SENDING:', JSON.stringify(payload, null, 2));
  
  const createdColl = await pb.collections.create(payload);
  console.log('SUCCESS:', createdColl.id);
}

main().catch(e => { console.error(e.response?.data || e.message); process.exit(1); });

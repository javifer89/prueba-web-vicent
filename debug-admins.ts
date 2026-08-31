#!/usr/bin/env npx tsx
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
  try {
    console.log(`🔗 Connecting to ${PB_URL}...`);
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
    console.log('✅ Authenticated as admin');

    const collDef = schema.collections.find((c: any) => c.name === 'admins');
    console.log('\n📋 Schema from JSON for "admins":');
    console.log(JSON.stringify(collDef.schema, null, 2));

    const payload = {
      name: collDef.name,
      type: collDef.type,
      fields: collDef.schema,
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '',
      updateRule: '@request.auth.id = id',
      deleteRule: '@request.auth.id = id',
    };

    console.log('\n📤 Payload being sent:');
    console.log(JSON.stringify(payload, null, 2));

    console.log('\n📦 Creating "admins"...');
    const createdColl = await pb.collections.create(payload);
    
    console.log('\n📥 Response from PocketBase:');
    console.log(JSON.stringify(createdColl, null, 2));

  } catch (err: any) {
    console.error('\n❌ Error:', err.message);
    if (err.response?.data) {
      console.error('   Details:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
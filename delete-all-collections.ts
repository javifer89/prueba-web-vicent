#!/usr/bin/env npx tsx
/**
 * Delete ALL collections from PocketBase
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS = process.env.PB_ADMIN_PASS;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASS) {
  console.error('❌ Set PB_ADMIN_EMAIL and PB_ADMIN_PASS env vars');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

async function main() {
  try {
    console.log(`🔗 Connecting to ${PB_URL}...`);
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);
    console.log('✅ Authenticated as admin');

    const cols = await pb.collections.getFullList();
    const userCols = cols.filter(c => !c.name.startsWith('_'));
    console.log(`\n🗑️  Found ${userCols.length} user collections to delete:`);
    
    for (const c of userCols) {
      console.log(`   Deleting "${c.name}" (${c.id})...`);
      await pb.collections.delete(c.id);
      console.log(`   ✅ Deleted`);
    }

    console.log('\n🎉 All collections deleted!');

  } catch (err: any) {
    console.error('\n❌ Error:', err.message);
    if (err.response?.data) {
      console.error('   Details:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
#!/usr/bin/env npx tsx
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const schemaPath = resolve(__dirname, 'pocketbase-schema.json');
const raw = readFileSync(schemaPath, 'utf-8');
const schema = JSON.parse(raw);

const cat = schema.collections.find((c: any) => c.name === 'categories');
const orderField = cat.schema.find((f: any) => f.name === 'order');

console.log('Raw file length:', raw.length);
console.log('Order field from parsed JSON:', JSON.stringify(orderField, null, 2));

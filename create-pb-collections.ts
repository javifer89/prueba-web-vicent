#!/usr/bin/env npx tsx

/**
 * PocketBase Collections Creator
 *
 * Reads pocketbase-schema.json and creates all collections through
 * the PocketBase Admin API.
 *
 * The JSON schema uses a custom "options" wrapper for readability.
 * This script transforms those options into the field properties
 * expected by PocketBase.
 *
 * Features:
 * - Creates collections in dependency order
 * - Resolves relation collection IDs automatically
 * - Supports base and auth collections
 * - Supports text, select, bool, date, number, file, relation,
 *   json and url fields
 * - Keeps custom fields in Auth collections
 * - Skips collections that already exist
 * - Prints detailed progress and errors
 * - Does not modify the source JSON
 */

import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PB_URL =
  process.env.PB_URL || 'http://127.0.0.1:8090';

const PB_ADMIN_EMAIL =
  process.env.PB_ADMIN_EMAIL;

const PB_ADMIN_PASS =
  process.env.PB_ADMIN_PASS;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASS) {
  console.error(
    '❌ Set PB_ADMIN_EMAIL and PB_ADMIN_PASS environment variables.'
  );
  process.exit(1);
}

const schemaPath = resolve(
  __dirname,
  'pocketbase-schema.json'
);

const schema = JSON.parse(
  readFileSync(schemaPath, 'utf-8')
);

const pb = new PocketBase(PB_URL);

interface CollectionMap {
  [name: string]: string;
}

/**
 * Converts the custom schema field format:
 *
 * {
 *   name: "status",
 *   type: "select",
 *   options: {
 *     maxSelect: 1,
 *     values: [...]
 *   }
 * }
 *
 * into PocketBase's API format:
 *
 * {
 *   name: "status",
 *   type: "select",
 *   maxSelect: 1,
 *   values: [...]
 * }
 */
function transformField(
  field: any,
  created: CollectionMap
): any {
  const {
    options,
    ...baseField
  } = field;

  // Fields without custom options
  if (!options) {
    return baseField;
  }

  switch (field.type) {

    /**
     * SELECT
     */
    case 'select': {
      const maxSelect =
        options.maxSelect ?? 1;

      if (
        !Array.isArray(options.values) ||
        options.values.length === 0
      ) {
        throw new Error(
          `Select field "${field.name}" must define a non-empty "values" array.`
        );
      }

      return {
        ...baseField,
        maxSelect,
        values: options.values,
      };
    }

    /**
     * FILE
     */
    case 'file': {
      return {
        ...baseField,
        maxSelect:
          options.maxSelect ?? 1,

        maxSize:
          options.maxSize ?? 0,

        mimeTypes:
          options.mimeTypes ?? [],

        thumbs:
          options.thumbs ?? null,
      };
    }

    /**
     * RELATION
     */
    case 'relation': {
      const refName =
        options.collectionId;

      if (!refName) {
        throw new Error(
          `Relation field "${field.name}" is missing collectionId.`
        );
      }

      const refId =
        created[refName];

      if (!refId) {
        throw new Error(
          `Dependency "${refName}" was not created yet for relation "${field.name}".`
        );
      }

      /**
       * PocketBase uses:
       * <= 1 => single relation
       * > 1  => multiple relation
       *
       * Your JSON uses 0 to mean "unlimited".
       * We translate 0 to 999.
       */
      let maxSelect =
        options.maxSelect ?? 1;

      if (maxSelect === 0) {
        maxSelect = 999;
      }

      return {
        ...baseField,

        collectionId:
          refId,

        cascadeDelete:
          options.cascadeDelete ?? false,

        minSelect:
          options.minSelect ?? 0,

        maxSelect,

        /**
         * displayFields is intentionally not sent.
         * It is not required by the collection API.
         */
      };
    }

    /**
     * NUMBER
     */
    case 'number': {
      const result: any = {
        ...baseField,
      };

      if (options.min !== undefined) {
        result.min = options.min;
      }

      if (options.max !== undefined) {
        result.max = options.max;
      }

      return result;
    }

    /**
     * DEFAULT FALLBACK
     *
     * Useful for future field types where the options
     * can safely be flattened directly.
     */
    default: {
      return {
        ...baseField,
        ...options,
      };
    }
  }
}

/**
 * Minimal rules during initial schema creation.
 *
 * We deliberately avoid the more complex rules from the JSON
 * until the complete schema exists.
 */
function getMinimalRules(
  collDef: any
): any {

  if (collDef.type === 'auth') {
    return {
      listRule:
        '@request.auth.id != ""',

      viewRule:
        '@request.auth.id != ""',

      createRule:
        '',

      updateRule:
        '@request.auth.id = id',

      deleteRule:
        '@request.auth.id = id',
    };
  }

  return {
    listRule:
      '@request.auth.id != ""',

    viewRule:
      '@request.auth.id != ""',

    createRule:
      '@request.auth.id != ""',

    updateRule:
      '@request.auth.id != ""',

    deleteRule:
      '@request.auth.id != ""',
  };
}

/**
 * Finds an existing collection.
 *
 * Returns null when it doesn't exist.
 */
async function getExistingCollection(
  name: string
): Promise<any | null> {

  try {
    return await pb.collections.getOne(name);
  } catch (err: any) {

    if (err?.status === 404) {
      return null;
    }

    throw err;
  }
}

async function main() {

  try {

    console.log(
      `🔗 Connecting to ${PB_URL}...`
    );

    await pb.admins.authWithPassword(
      PB_ADMIN_EMAIL,
      PB_ADMIN_PASS
    );

    console.log(
      '✅ Authenticated as admin'
    );

    /**
     * Collection creation order.
     *
     * Important dependencies:
     *
     * news -> categories
     * events -> categories
     * compositions -> categories + media
     * galleries -> media
     */
    const order = [
      'admins',
      'categories',
      'media',
      'news',
      'events',
      'compositions',
      'galleries',
      'biography',
      'site_settings',
    ];

    const created: CollectionMap = {};

    console.log(
      '\n📦 Processing collections...\n'
    );

    for (const name of order) {

      const collDef =
        schema.collections.find(
          (c: any) => c.name === name
        );

      if (!collDef) {

        console.warn(
          `⚠️ Collection "${name}" not found in schema. Skipping.`
        );

        continue;
      }

      console.log(
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      );

      console.log(
        `📁 Collection: ${name}`
      );

      console.log(
        `   Type: ${collDef.type}`
      );

      /**
       * Check if collection already exists.
       */
      const existing =
        await getExistingCollection(name);

      if (existing) {

        console.log(
          `   ⚠️ Already exists`
        );

        console.log(
          `   ID: ${existing.id}`
        );

        created[name] =
          existing.id;

        continue;
      }

      /**
       * Transform fields.
       */
      let resolvedFields: any[];

      try {

        resolvedFields =
          collDef.schema.map(
            (field: any) =>
              transformField(
                field,
                created
              )
          );

      } catch (err: any) {

        throw new Error(
          `Failed to transform fields for "${name}": ${err.message}`
        );
      }

      /**
       * Print fields before creation.
       */
      console.log(
        `   Fields:`
      );

      for (
        const field of resolvedFields
      ) {

        console.log(
          `      - ${field.name} (${field.type})`
        );
      }

      const rules =
        getMinimalRules(collDef);

      /**
       * PocketBase collection payload.
       */
      const payload: any = {

        name:
          collDef.name,

        type:
          collDef.type,

        fields:
          resolvedFields,

        ...rules,
      };

      /**
       * Auth collections:
       *
       * PocketBase automatically creates the system fields
       * such as id, password, email, tokenKey, etc.
       *
       * We still send our custom fields.
       */
      if (collDef.type === 'auth') {

        payload.passwordAuth = {
          enabled: true,
          identityFields: ['email'],
        };
      }

      console.log(
        `\n   📤 Sending payload...`
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        `\n   🚀 Creating "${name}"...`
      );

      const createdColl =
        await pb.collections.create(
          payload
        );

      created[name] =
        createdColl.id;

      console.log(
        `   ✅ Created successfully`
      );

      console.log(
        `   ID: ${createdColl.id}`
      );
    }

    console.log(
      `\n\n🎉 All collections processed successfully!`
    );

    console.log(
      `\n📋 Collection IDs:`
    );

    for (
      const [name, id]
      of Object.entries(created)
    ) {

      console.log(
        `   ${name}: ${id}`
      );
    }

    console.log(
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );

    console.log(
      `\n📝 NEXT STEP`
    );

    console.log(
      `Configure the final public/private API rules in PocketBase.`
    );

    console.log(
      `The collections were intentionally created with minimal authenticated rules.`
    );

  } catch (err: any) {

    console.error(
      `\n❌ ERROR`
    );

    console.error(
      `Message: ${err?.message ?? err}`
    );

    if (err?.status) {

      console.error(
        `HTTP status: ${err.status}`
      );
    }

    if (err?.response?.data) {

      console.error(
        `\nPocketBase response:`
      );

      console.error(
        JSON.stringify(
          err.response.data,
          null,
          2
        )
      );
    }

    process.exit(1);
  }
}

main();

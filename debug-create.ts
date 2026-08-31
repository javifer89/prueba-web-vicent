import PocketBase from 'pocketbase';

import {
  readFileSync,
} from 'fs';

import {
  fileURLToPath,
} from 'url';

import {
  dirname,
  resolve,
} from 'path';

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  dirname(__filename);

const PB_URL =
  process.env.PB_URL ||
  'http://127.0.0.1:8090';

const PB_ADMIN_EMAIL =
  process.env.PB_ADMIN_EMAIL;

const PB_ADMIN_PASS =
  process.env.PB_ADMIN_PASS;

console.log(
  '\n🔍 ENV CHECK'
);

console.log({
  PB_URL,

  PB_ADMIN_EMAIL:
    PB_ADMIN_EMAIL
      ? 'SET'
      : 'MISSING',

  PB_ADMIN_PASS:
    PB_ADMIN_PASS
      ? 'SET'
      : 'MISSING',
});

if (
  !PB_ADMIN_EMAIL ||
  !PB_ADMIN_PASS
) {

  console.error(
    '\n❌ Missing environment variables.'
  );

  process.exit(1);
}

const schemaPath =
  resolve(
    __dirname,
    'pocketbase-schema.json'
  );

const schema =
  JSON.parse(
    readFileSync(
      schemaPath,
      'utf-8'
    )
  );

const pb =
  new PocketBase(PB_URL);

/**
 * Transform one field from our custom JSON
 * schema into the PocketBase API field format.
 */
function transformField(
  field: any,
  created: Record<string, string> = {}
): any {

  const {
    options,
    ...baseField
  } = field;

  if (!options) {
    return baseField;
  }

  switch (field.type) {

    case 'select': {

      return {
        ...baseField,

        maxSelect:
          options.maxSelect ?? 1,

        values:
          options.values ?? [],
      };
    }

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

    case 'relation': {

      const refName =
        options.collectionId;

      if (!refName) {

        throw new Error(
          `Relation "${field.name}" does not define collectionId`
        );
      }

      const refId =
        created[refName];

      /**
       * For this debug script we only test categories,
       * so relations shouldn't normally appear here.
       */
      if (!refId) {

        throw new Error(
          `Relation "${field.name}" references "${refName}", but no resolved ID exists.`
        );
      }

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
      };
    }

    case 'number': {

      return {
        ...baseField,

        ...(options.min !== undefined
          ? { min: options.min }
          : {}),

        ...(options.max !== undefined
          ? { max: options.max }
          : {}),
      };
    }

    default: {

      return {
        ...baseField,
        ...options,
      };
    }
  }
}

async function main() {

  try {

    console.log(
      '\n🔗 Connecting...'
    );

    const authData =
      await pb.admins.authWithPassword(
        PB_ADMIN_EMAIL!,
        PB_ADMIN_PASS!
      );

    console.log(
      '✅ Authenticated as admin'
    );

    console.log(
      '   Token:',
      pb.authStore.token
        ?.substring(0, 20) + '...'
    );

    console.log(
      '   Auth record email:',
      authData.record?.email
    );

    console.log(
      '   Auth record id:',
      authData.record?.id
    );

    /**
     * Find categories in the JSON.
     */
    const collDef =
      schema.collections.find(
        (c: any) =>
          c.name === 'categories'
      );

    if (!collDef) {

      throw new Error(
        'Collection "categories" was not found in pocketbase-schema.json'
      );
    }

    console.log(
      '\n📋 Original schema from JSON'
    );

    console.log(
      JSON.stringify(
        collDef.schema,
        null,
        2
      )
    );

    /**
     * Transform.
     */
    const resolvedFields =
      collDef.schema.map(
        (field: any) =>
          transformField(field)
      );

    console.log(
      '\n📤 TRANSFORMED FIELDS'
    );

    resolvedFields.forEach(
      (
        field: any,
        index: number
      ) => {

        console.log(
          `\n   FIELD ${index}`
        );

        console.log(
          JSON.stringify(
            field,
            null,
            2
          )
        );
      }
    );

    /**
     * Minimal rules.
     */
    const payload: any = {

      name:
        collDef.name,

      type:
        collDef.type,

      fields:
        resolvedFields,

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

    console.log(
      '\n\n📦 FINAL PAYLOAD'
    );

    console.log(
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    /**
     * Check if categories already exists.
     */
    console.log(
      '\n🔎 Checking if "categories" already exists...'
    );

    try {

      const existing =
        await pb.collections.getOne(
          'categories'
        );

      console.log(
        '⚠️ Collection already exists.'
      );

      console.log(
        '   ID:',
        existing.id
      );

      console.log(
        '\n❗ No collection was created.'
      );

      console.log(
        'If you want to test creation from zero,'
      );

      console.log(
        'delete "categories" from the PocketBase Dashboard'
      );

      console.log(
        'and run this script again.'
      );

      return;

    } catch (err: any) {

      if (err?.status !== 404) {
        throw err;
      }

      console.log(
        '   ✅ Does not exist. Good.'
      );
    }

    /**
     * Create.
     */
    console.log(
      '\n🚀 Creating "categories"...'
    );

    const created =
      await pb.collections.create(
        payload
      );

    console.log(
      '\n🎉 SUCCESS!'
    );

    console.log(
      '   Name:',
      created.name
    );

    console.log(
      '   ID:',
      created.id
    );

    console.log(
      '\n📋 PocketBase returned fields:'
    );

    for (
      const field of created.fields
    ) {

      console.log(
        `\n   ${field.name} (${field.type})`
      );

      console.log(
        JSON.stringify(
          field,
          null,
          2
        )
      );
    }

  } catch (err: any) {

    console.error(
      '\n❌ ERROR'
    );

    console.error(
      'Message:',
      err?.message ?? err
    );

    console.error(
      'Status:',
      err?.status ?? 'unknown'
    );

    if (err?.response?.data) {

      console.error(
        '\n📛 PocketBase validation response:'
      );

      console.error(
        JSON.stringify(
          err.response.data,
          null,
          2
        )
      );
    }

    if (err?.response) {

      console.error(
        '\n📡 PocketBase response:'
      );

      console.error(
        JSON.stringify(
          err.response,
          null,
          2
        )
      );
    }

    process.exit(1);
  }
}

main();

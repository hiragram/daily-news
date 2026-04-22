import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "site-src");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function typeOf(value) {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
}

function joinPath(base, key) {
  if (!base) {
    return key;
  }
  if (key.startsWith("[")) {
    return `${base}${key}`;
  }
  return `${base}.${key}`;
}

function resolveRef(schemaRoot, ref) {
  if (!ref.startsWith("#/")) {
    throw new Error(`Unsupported $ref: ${ref}`);
  }

  return ref
    .slice(2)
    .split("/")
    .reduce((current, segment) => current?.[segment], schemaRoot);
}

function isValidDateTime(value) {
  return !Number.isNaN(Date.parse(value));
}

function isValidUri(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validate(schemaRoot, schema, value, valuePath = "$") {
  const effectiveSchema = schema.$ref ? resolveRef(schemaRoot, schema.$ref) : schema;
  const errors = [];

  if (!effectiveSchema) {
    errors.push(`${valuePath}: schema could not be resolved`);
    return errors;
  }

  if (effectiveSchema.allOf) {
    for (const child of effectiveSchema.allOf) {
      if (child.if) {
        const ifErrors = validate(schemaRoot, child.if, value, valuePath);
        const matchesIf = ifErrors.length === 0;
        if (matchesIf && child.then) {
          errors.push(...validate(schemaRoot, child.then, value, valuePath));
        }
      } else {
        errors.push(...validate(schemaRoot, child, value, valuePath));
      }
    }
  }

  if (effectiveSchema.type) {
    const actualType = typeOf(value);
    if (actualType !== effectiveSchema.type) {
      errors.push(`${valuePath}: expected ${effectiveSchema.type}, got ${actualType}`);
      return errors;
    }
  }

  if (effectiveSchema.enum && !effectiveSchema.enum.includes(value)) {
    errors.push(`${valuePath}: expected one of ${effectiveSchema.enum.join(", ")}`);
  }

  if (effectiveSchema.const !== undefined && value !== effectiveSchema.const) {
    errors.push(`${valuePath}: expected constant ${effectiveSchema.const}`);
  }

  if (effectiveSchema.type === "string") {
    if (effectiveSchema.minLength !== undefined && value.length < effectiveSchema.minLength) {
      errors.push(`${valuePath}: expected minimum length ${effectiveSchema.minLength}`);
    }
    if (effectiveSchema.pattern && !new RegExp(effectiveSchema.pattern).test(value)) {
      errors.push(`${valuePath}: does not match pattern ${effectiveSchema.pattern}`);
    }
    if (effectiveSchema.format === "date-time" && !isValidDateTime(value)) {
      errors.push(`${valuePath}: expected a valid date-time`);
    }
    if (effectiveSchema.format === "uri" && !isValidUri(value)) {
      errors.push(`${valuePath}: expected a valid uri`);
    }
  }

  if (effectiveSchema.type === "array") {
    if (effectiveSchema.minItems !== undefined && value.length < effectiveSchema.minItems) {
      errors.push(`${valuePath}: expected at least ${effectiveSchema.minItems} items`);
    }
    if (effectiveSchema.items) {
      value.forEach((item, index) => {
        errors.push(...validate(schemaRoot, effectiveSchema.items, item, joinPath(valuePath, `[${index}]`)));
      });
    }
  }

  if (effectiveSchema.type === "object") {
    const properties = effectiveSchema.properties ?? {};
    const required = effectiveSchema.required ?? [];

    for (const key of required) {
      if (!(key in value)) {
        errors.push(`${valuePath}: missing required property '${key}'`);
      }
    }

    if (effectiveSchema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          errors.push(`${valuePath}: unexpected property '${key}'`);
        }
      }
    }

    for (const [key, propertySchema] of Object.entries(properties)) {
      if (key in value) {
        errors.push(...validate(schemaRoot, propertySchema, value[key], joinPath(valuePath, key)));
      }
    }
  }

  return errors;
}

function validateFile(schemaFile, dataFile) {
  const schema = readJson(schemaFile);
  const data = readJson(dataFile);
  const errors = validate(schema, schema, data);

  return {
    dataFile,
    errors,
  };
}

function run() {
  const siteSchema = path.join(sourceDir, "schema", "site.schema.json");
  const reportSchema = path.join(sourceDir, "schema", "report.schema.json");
  const siteData = path.join(sourceDir, "content", "site.json");
  const reportDir = path.join(sourceDir, "content", "reports");

  const results = [validateFile(siteSchema, siteData)];

  for (const fileName of fs.readdirSync(reportDir).filter((name) => name.endsWith(".json")).sort()) {
    results.push(validateFile(reportSchema, path.join(reportDir, fileName)));
  }

  const failures = results.filter((result) => result.errors.length > 0);

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`Validation failed: ${path.relative(rootDir, failure.dataFile)}`);
      for (const error of failure.errors) {
        console.error(`  - ${error}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  for (const result of results) {
    console.log(`Validated: ${path.relative(rootDir, result.dataFile)}`);
  }
}

run();

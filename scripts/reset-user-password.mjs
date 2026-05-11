#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

function loadDotEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local in project root.");
  }

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const firstEq = line.indexOf("=");
    if (firstEq === -1) {
      continue;
    }

    const key = line.slice(0, firstEq).trim();
    let value = line.slice(firstEq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    email: "",
    password: "",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--email") {
      result.email = args[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg === "--password") {
      result.password = args[i + 1] ?? "";
      i += 1;
      continue;
    }
  }

  return result;
}

async function main() {
  const { email, password } = parseArgs();

  if (!email || !password) {
    console.error(
      "Usage: npm run reset:user-password -- --email <user@email.com> --password <NewPassword123!>",
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  loadDotEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: WebSocket,
    },
  });

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    throw new Error(`Failed listing users: ${listError.message}`);
  }

  const user = usersData.users.find(
    (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
  );

  let userId = user?.id;
  if (!userId) {
    const fallbackUrl = new URL("/rest/v1/profiles", supabaseUrl);
    fallbackUrl.searchParams.set("select", "id,email");
    fallbackUrl.searchParams.set("email", `eq.${email}`);
    fallbackUrl.searchParams.set("limit", "1");
    const fallbackResponse = await fetch(fallbackUrl, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!fallbackResponse.ok) {
      throw new Error(
        `User not found in auth list and profiles lookup failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`,
      );
    }

    const rows = await fallbackResponse.json();
    userId = rows?.[0]?.id;
  }

  if (!userId) {
    throw new Error(`User not found for email: ${email}`);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
  });

  if (updateError) {
    throw new Error(`Failed updating password: ${updateError.message}`);
  }

  console.log(`Password reset succeeded for ${email}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFile = path.resolve(process.cwd(), "src/data/users.json");

function getUsers(): any[] {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, "utf8"));
    }
  } catch {}
  return [];
}

function saveUsers(users: any[]) {
  try {
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(users, null, 2), "utf8");
  } catch {}
}

export async function GET() {
  const users = getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const user = await request.json();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }
    const users = getUsers();
    const existingIndex = users.findIndex((u: any) => u.id === user.id);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.push(user);
    }
    saveUsers(users);
    return NextResponse.json({ success: true, user, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { db } from "./drizzle";
import { keyval } from "./schema";
import { eq } from "drizzle-orm";

const DEFAULTS: Record<string, string> = {
  referral_reward_amount: "200",
};

export async function getSettingValue(key: string): Promise<string> {
  try {
    const result = await db
      .select()
      .from(keyval)
      .where(eq(keyval.key, key))
      .limit(1);
    return result.length > 0 ? result[0].value : (DEFAULTS[key] ?? "");
  } catch (error: any) {
    console.log(`getSettingValue(${key})`, error.message);
    return DEFAULTS[key] ?? "";
  }
}

export async function setSettingValue(
  key: string,
  value: string
): Promise<boolean> {
  try {
    const existing = await db
      .select()
      .from(keyval)
      .where(eq(keyval.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(keyval)
        .set({ value, updatedAt: new Date() })
        .where(eq(keyval.key, key));
    } else {
      await db.insert(keyval).values({
        id: crypto.randomUUID(),
        key,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return true;
  } catch (error: any) {
    console.log(`setSettingValue(${key})`, error.message);
    return false;
  }
}

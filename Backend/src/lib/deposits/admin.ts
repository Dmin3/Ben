import { NextRequest } from "next/server";
import { z } from "zod";
import { depositAuth } from "./auth";
import { assertAccount } from "./repository";
export async function adminContext(req: NextRequest, params: Promise<{ accountId: string }>) {
 const actor = await depositAuth(req, true);
 const accountId = z.uuid().parse((await params).accountId);
 await assertAccount(accountId);
 return { actor, accountId };
}

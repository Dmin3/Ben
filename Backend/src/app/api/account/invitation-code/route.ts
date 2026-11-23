import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/request-auth";
import { getInvitationCode } from "@/lib/auth/invitation-code";
import { jsonError } from "@/lib/http";
export async function GET(req:NextRequest) {
 try {return NextResponse.json(await getInvitationCode(await requireAuth(req)),{headers:{"Cache-Control":"no-store"}});}
 catch(e){return jsonError(e);}
}
export async function POST(req:NextRequest) {
 try {return NextResponse.json(await getInvitationCode(await requireAuth(req),true),{headers:{"Cache-Control":"no-store"}});}
 catch(e){return jsonError(e);}
}


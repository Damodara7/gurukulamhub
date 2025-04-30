// pages/api/store-session-data.js
import { auth } from "@/libs/auth"
import { getToken } from 'next-auth/jwt';
// import { authOptions } from '@/libs/auth';  // Import your NextAuth configuration
import * as ApiResponseUtils from '@/utils/apiResponses'
import { NextResponse } from "next/server";


export async function POST(req, res) {
  const session = await auth(); // auth(req, res)
  if (!session) {
    console.log("No session exists.....")
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Extract the current JWT token
  const secret = process.env.NEXTAUTH_SECRET;  // Make sure you have this in your environment
  const token = await getToken({ req, secret });
  console.log("Token session exists.....", token, " Secret:", secret)

  if (!token) {
    return res.status(401).json({ message: 'Failed to retrieve token' });
  }
  // Parse the incoming request body (JSON expected)
  const body = await req.json();
  console.log("request body is ", body)
  // Modify the JWT custom data
  token.customData = body.customData || token.customData;
  //token.

  console.log("storing token data....", body)


  // You can't directly modify the JWT, but NextAuth's `jwt` callback handles this.
  return NextResponse.json({
    message: 'Custom data stored in session!',
    customData: body
  });

  // Return success with token data (you cannot store directly into JWT here)
  // const successResult = ApiResponseUtils.createSuccessResponse(
  //   "Data received, but modify the token via NextAuth callbacks.",
  //   customData: token.customData
  // );
  // return ApiResponseUtils.sendSuccessResponse(successResult);
}

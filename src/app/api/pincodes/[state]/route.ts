import { NextRequest, NextResponse } from 'next/server'
import { HttpStatusCode } from '@/utils/HttpStatusCodes'
import * as LocalitiesService from '@/app/services/locality.service';


export async function GET(_: NextRequest,
  { params }: { params: { state: string } }) {
  try {
    console.log("inside get request localities/pinCode")
    const pinCodes = await LocalitiesService.getPinCodesForState(params.state)
    if (pinCodes) {
      return NextResponse.json({ pinCodes })
    }
    return NextResponse.json({ message: `PinCodes for ${params.state} not found` }, { status: HttpStatusCode.NotFound })
  } catch (error) {
    return NextResponse.json({ message: error }, { status: HttpStatusCode.BadRequest })
  }
}

import google from "@googleapis/safebrowsing";
import { NextRequest, NextResponse } from "next/server";

const safebrowsing = google.safebrowsing("v4");

export async function POST(request: NextRequest) {
    try {
        const url = (await request.json()).url;

        if (!url) {
            return NextResponse.json(JSON.stringify({ success: false, message: "No url provided" }), { status: 400 });
        }

        const res = await safebrowsing.threatMatches.find({
            key: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
            requestBody: {
                client: {
                    clientId: "your-app",
                    clientVersion: "1.0",
                },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url }],
                },
            },
        });
        if (res.data.matches) {
            return NextResponse.json(
                {
                    success: true,
                    data: res.data.matches,
                    isSafe: false,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json({ success: true, data: [], isSafe: true }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs"; 
import webPush from "web-push";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);


async function handler(req: NextRequest) {
      try {
    const body = await req.json();
    console.log("📦 Payload:", body);

    const { userId, title, weekNumber } = body;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
    });

    if (subscriptions.length === 0) {
      console.log("❌ No subscriptions found.");
      return NextResponse.json({ message: "No subscriptions found" });
    }

    const notificationPayload = JSON.stringify({
      title: "Result Unlocked! 🔓",
      body: `The AI review for "${title}" is now available.`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/internship/week/${weekNumber}?projectTitle=${encodeURIComponent(title)}`,
    });

    const sendPromises = subscriptions.map((sub) => {
      return webPush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notificationPayload
        )
        .then(() => console.log(`✅ Push sent to ${sub.endpoint.slice(0, 20)}...`))
        .catch((err) => {
          console.error("❌ Push Failed:", err.statusCode);
          if (err.statusCode === 410 || err.statusCode === 404) {
            return prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
        });
    });

    await Promise.all(sendPromises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Scheduled Notification Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
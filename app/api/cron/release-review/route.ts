import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { prisma } from "@/lib/prisma";
import webPush from "web-push";

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, projectTitle, weekNumber } = body;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" });
    }

    const notificationPayload = JSON.stringify({
      title: "Result Unlocked! 🔓",
      body: `Your AI review for "${projectTitle}" is now ready. Click to see your score!`,
      url: `${
        process.env.NEXT_PUBLIC_APP_URL
      }/internship/week/${weekNumber}?projectTitle=${encodeURIComponent(
        projectTitle
      )}`,
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
        .catch((err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            return prisma.pushSubscription.delete({ where: { id: sub.id } });
          }
        });
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    console.error("Delayed Notification Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);

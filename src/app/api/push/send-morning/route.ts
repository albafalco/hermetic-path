import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushNotification } from '@/lib/push';
import type { PushPayload } from '@/lib/push';

// Vercel automatically adds Authorization: Bearer <CRON_SECRET> for cron jobs
function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // local dev
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  // Get all users with morning notifications enabled, subscription present
  const { data: settings } = await supabase
    .from('notification_settings')
    .select('user_id, morning_time, morning_notified_date')
    .eq('enabled', true)
    .eq('morning_enabled', true);

  if (!settings || settings.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  for (const setting of settings) {
    // Skip if already notified today
    if (setting.morning_notified_date === today) continue;

    // Check if user has done morning practices today
    const { count } = await supabase
      .from('daily_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', setting.user_id)
      .eq('log_date', today)
      .eq('completed', true);

    if ((count ?? 0) > 0) continue; // already practised today

    // Get push subscription
    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', setting.user_id)
      .single();

    if (!sub?.subscription) continue;

    const payload: PushPayload = {
      title: 'Hermetic Path — Reggeli gyakorlás',
      body: 'Ideje elkezdeni a napi lelki munkát! 🌅',
      tag: 'morning-reminder',
      url: '/hu/practice',
    };

    const ok = await sendPushNotification(sub.subscription, payload);
    if (ok) {
      // Mark as notified today
      await supabase
        .from('notification_settings')
        .update({ morning_notified_date: today })
        .eq('user_id', setting.user_id);
      sent++;
    } else {
      // Subscription expired - remove it
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', setting.user_id);
    }
  }

  return NextResponse.json({ sent });
}

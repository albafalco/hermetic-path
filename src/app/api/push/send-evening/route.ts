import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPushNotification } from '@/lib/push';
import type { PushPayload } from '@/lib/push';

function verifyCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: settings } = await supabase
    .from('notification_settings')
    .select('user_id, evening_time, evening_notified_date')
    .eq('enabled', true)
    .eq('evening_enabled', true);

  if (!settings || settings.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  for (const setting of settings) {
    if (setting.evening_notified_date === today) continue;

    // Check if user has done evening practices today
    // Remind if they have NO evening-suffixed completions OR total = 0
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('practice_key')
      .eq('user_id', setting.user_id)
      .eq('log_date', today)
      .eq('completed', true);

    const total = logs?.length ?? 0;
    const eveningDone = logs?.some((l) => l.practice_key.endsWith('_evening')) ?? false;
    const dailyDone = logs?.some((l) => !l.practice_key.endsWith('_morning') && !l.practice_key.endsWith('_evening')) ?? false;

    // Send if evening practices not done OR if nothing done at all today
    if (eveningDone && dailyDone) continue;
    if (total > 0 && eveningDone) continue;

    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', setting.user_id)
      .single();

    if (!sub?.subscription) continue;

    const payload: PushPayload = {
      title: 'Hermetic Path — Esti gyakorlás',
      body: total === 0
        ? 'Ma még semmi sem volt elvégezve. Szentelj egy kis időt a lelki munkának! 🌙'
        : 'Az esti gyakorlatok még váratnak magukra. 🌙',
      tag: 'evening-reminder',
      url: '/hu/practice',
    };

    const ok = await sendPushNotification(sub.subscription, payload);
    if (ok) {
      await supabase
        .from('notification_settings')
        .update({ evening_notified_date: today })
        .eq('user_id', setting.user_id);
      sent++;
    } else {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', setting.user_id);
    }
  }

  return NextResponse.json({ sent });
}

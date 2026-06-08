import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from '@/lib/push';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: sub } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', user.id)
    .single();

  if (!sub?.subscription) {
    return NextResponse.json({ error: 'Nincs mentett előfizetés.' }, { status: 404 });
  }

  const ok = await sendPushNotification(sub.subscription, {
    title: 'Hermetic Path — Teszt',
    body: 'Az értesítések működnek! ✓',
    tag: 'test',
    url: '/hu/practice',
  });

  if (!ok) {
    return NextResponse.json({ error: 'Az előfizetés lejárt, próbáld újra bekapcsolni az értesítéseket.' }, { status: 410 });
  }

  return NextResponse.json({ ok: true });
}

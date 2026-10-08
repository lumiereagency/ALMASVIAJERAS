'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

export function ResultTracker({ primary, alternatives }: { primary: number; alternatives: number }) {
  useEffect(() => {
    track('recommendation_viewed', { primary, alternatives });
  }, [primary, alternatives]);
  return null;
}

// components/MembershipSync.tsx
'use client'; // This is the magic line

import { useEffect } from 'react';
import { useUserStore } from '@/stores/useUserStore';

export default function MembershipSync() {
  const fetchMembership = useUserStore((state) => state.fetchMembership);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return null; // It doesn't render any UI
}
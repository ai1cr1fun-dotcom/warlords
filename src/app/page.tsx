'use client'

import { useMeQuery } from '@/features/auth'
import { usePlayerProfileQuery, usePlayerStateQuery } from '@/features/player'
import { useCityQuery } from '@/features/city'
import { useArmyQuery } from '@/features/army'
import { useWorldMap } from '@/features/world'

export default function Page() {
  const me = useMeQuery()
  const enabled = Boolean(me.data)
  const profile = usePlayerProfileQuery({ enabled })
  const state = usePlayerStateQuery({ enabled })
  const city = useCityQuery({ enabled })
  const army = useArmyQuery({ enabled })
  const world = useWorldMap({ enabled })
  if (me.isPending) return <main className="war-game"><p>Loading WARLORDS…</p></main>
  if (!me.data) return <main className="war-game"><h1>⚔️ WARLORDS</h1><p>Open this Mini App from the Telegram bot to sign in.</p><p>{me.error ? 'Session unavailable. Reopen the game from Telegram.' : 'Tap /start, then Play.'}</p></main>
  return <main className="war-game"><header><h1>⚔️ WARLORDS</h1><p>Commander: {me.data.player?.name}</p></header><section><h2>City</h2><p>{city.isPending ? 'Loading city…' : city.data ? `${city.data.buildings.length} buildings` : 'City unavailable'}</p></section><section><h2>Army</h2><p>{army.isPending ? 'Loading army…' : army.data ? `${army.data.units.length} unit types` : 'Army unavailable'}</p></section><section><h2>World</h2><p>{world.isPending ? 'Loading world…' : world.data ? 'World map ready' : 'World unavailable'}</p></section><section><h2>Profile</h2><p>Level: {profile.data?.level ?? '—'} · Power: {profile.data?.power ?? '—'}</p><p>Resources and server state: {state.data ? 'online' : 'loading'}</p></section></main>
}

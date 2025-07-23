import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis' // Passe diesen Pfad ggf. an
import { format } from 'date-fns'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'Start- und Enddatum erforderlich' }, { status: 400 })
  }

  const redis = await getRedisClient()
  const allKeys = await redis.keys('position:*')
  const value = await redis.get('position:abc123')
  const allData = await Promise.all(
    allKeys.map(async (key) => {
      const raw = await redis.get(key)
      if (!raw) return null
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    })
  )

  const filtered = allData
    .filter(Boolean)
    .filter((entry: any) => {
      const date = entry?.timestamp ? new Date(entry.timestamp) : null
      if (!date) return false
      return date >= new Date(start) && date <= new Date(end)
    })

  const csv = convertToCSV(filtered)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="trades_${start}_bis_${end}.csv"`
    }
  })
}

function convertToCSV(data: any[]) {
  if (!data.length) return 'Keine Daten'

  const headers = Object.keys(data[0])
  const lines = data.map((obj) => headers.map((key) => `"${obj[key] ?? ''}"`).join(','))
  return [headers.join(','), ...lines].join('\n')
}

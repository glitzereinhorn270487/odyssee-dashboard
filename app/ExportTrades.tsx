'use client'

import React, { useState } from 'react'

export default function ExportTrades() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [downloading, setDownloading] = useState(false)

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('Bitte Start- und Enddatum angeben')
      return
    }

    setDownloading(true)

    try {
      const res = await fetch(`/api/export-trades?start=${startDate}&end=${endDate}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trades_${startDate}_bis_${endDate}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      alert('Fehler beim Exportieren der Daten')
    }

    setDownloading(false)
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '12px', marginTop: '2rem' }}>
      <h3>Trades exportieren</h3>
      <label>
        Startdatum: &nbsp;
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </label>
      &nbsp;&nbsp;
      <label>
        Enddatum: &nbsp;
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </label>
      &nbsp;&nbsp;
      <button onClick={handleExport} disabled={downloading}>
        {downloading ? 'Exportiere...' : 'Export starten'}
      </button>
    </div>
  )
}

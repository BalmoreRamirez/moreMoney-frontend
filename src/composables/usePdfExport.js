import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from '../utils/currency'

const MONTHS_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
}

function calcMeses(fechaInicio) {
  if (!fechaInicio) return 0
  const inicio = new Date(fechaInicio + 'T00:00:00')
  const hoy    = new Date()
  const diff   = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
  return Math.max(0, diff)
}

function pctTasa(t) {
  return parseFloat((parseFloat(t) * 100).toFixed(2))
}

function progresoPct(p) {
  if (!p.total_deuda || p.total_deuda <= 0) return 100
  return Math.min(100, Math.round((p.total_pagado / p.total_deuda) * 100))
}

export function exportarPrestamosActivosPDF(prestamos) {
  const activos = prestamos.filter(p => p.estado === 'activo')

  const doc    = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W      = doc.internal.pageSize.getWidth()
  const hoy    = new Date()
  const fechaStr = `${hoy.getDate().toString().padStart(2,'0')} de ${MONTHS_ES[hoy.getMonth()]} de ${hoy.getFullYear()}`

  // ── Paleta ────────────────────────────────────────────────
  const BRAND      = [10, 25, 47]      // #0A192F
  const SUCCESS    = [16, 185, 129]    // #10B981
  const ALERT      = [245, 158, 11]    // #F59E0B
  const MUTED      = [107, 114, 128]   // #6B7280
  const BG_HEADER  = [10, 25, 47]
  const WHITE      = [255, 255, 255]

  // ── Encabezado ────────────────────────────────────────────
  doc.setFillColor(...BG_HEADER)
  doc.rect(0, 0, W, 22, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...WHITE)
  doc.text('Reporte de Préstamos Activos', 14, 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(180, 190, 210)
  doc.text(`Generado el ${fechaStr}`, 14, 16)
  doc.text('moreMoney · Control Financiero', W - 14, 16, { align: 'right' })

  // ── KPI row ───────────────────────────────────────────────
  const totalCapital  = activos.reduce((s, p) => s + parseFloat(p.capital        || 0), 0)
  const totalPagado   = activos.reduce((s, p) => s + parseFloat(p.total_pagado   || 0), 0)
  const totalPendiente = activos.reduce((s, p) => s + Math.max(0, parseFloat(p.saldo_pendiente || 0)), 0)
  const totalInteres  = activos.reduce((s, p) => s + parseFloat(p.interes_generado || 0), 0)

  const kpiY = 27
  const kpiH = 14
  const kpiW = (W - 28) / 4
  const kpiGap = 4

  const kpis = [
    { label: 'Capital en calle',    value: formatCurrency(totalCapital),   color: BRAND },
    { label: 'Interés generado',    value: formatCurrency(totalInteres),   color: MUTED },
    { label: 'Total recuperado',    value: formatCurrency(totalPagado),    color: SUCCESS },
    { label: 'Saldo por cobrar',    value: formatCurrency(totalPendiente), color: ALERT },
  ]

  kpis.forEach((k, i) => {
    const x = 14 + i * (kpiW + kpiGap)
    doc.setFillColor(245, 247, 250)
    doc.roundedRect(x, kpiY, kpiW, kpiH, 2, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text(k.label.toUpperCase(), x + 4, kpiY + 4.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...k.color)
    doc.text(k.value, x + 4, kpiY + 10.5)
  })

  // ── Tabla ─────────────────────────────────────────────────
  const head = [[
    'Deudor', 'Contacto', 'Inicio', 'Meses', 'Tasa/mes',
    'Capital', 'Interés gen.', 'Total deuda', 'Pagado', 'Pendiente', 'Progreso',
  ]]

  const body = activos.map(p => [
    p.deudor_nombre,
    p.deudor_contacto || '—',
    formatDate(p.fecha_inicio),
    calcMeses(p.fecha_inicio),
    `${pctTasa(p.tasa_interes_mensual)}%`,
    formatCurrency(p.capital),
    formatCurrency(p.interes_generado),
    formatCurrency(p.total_deuda),
    formatCurrency(p.total_pagado),
    formatCurrency(Math.max(0, p.saldo_pendiente)),
    `${progresoPct(p)}%`,
  ])

  // Fila de totales
  body.push([
    { content: `TOTAL (${activos.length} préstamos)`, colSpan: 5, styles: { fontStyle: 'bold', fillColor: [235,238,245], textColor: BRAND } },
    { content: formatCurrency(totalCapital),   styles: { fontStyle: 'bold', fillColor: [235,238,245], textColor: BRAND } },
    { content: formatCurrency(totalInteres),   styles: { fontStyle: 'bold', fillColor: [235,238,245], textColor: [107,114,128] } },
    { content: formatCurrency(totalCapital + totalInteres), styles: { fontStyle: 'bold', fillColor: [235,238,245], textColor: BRAND } },
    { content: formatCurrency(totalPagado),    styles: { fontStyle: 'bold', fillColor: [235,238,245], textColor: SUCCESS } },
    { content: formatCurrency(totalPendiente), styles: { fontStyle: 'bold', fillColor: [235,238,245], textColor: ALERT } },
    { content: '', styles: { fillColor: [235,238,245] } },
  ])

  autoTable(doc, {
    startY: kpiY + kpiH + 5,
    head,
    body,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      textColor: [30, 35, 45],
      lineColor: [220, 225, 232],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BG_HEADER,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    columnStyles: {
      0:  { cellWidth: 34 },
      1:  { cellWidth: 28 },
      2:  { cellWidth: 18, halign: 'center' },
      3:  { cellWidth: 12, halign: 'center' },
      4:  { cellWidth: 14, halign: 'center' },
      5:  { cellWidth: 24, halign: 'right' },
      6:  { cellWidth: 24, halign: 'right' },
      7:  { cellWidth: 24, halign: 'right' },
      8:  { cellWidth: 24, halign: 'right' },
      9:  { cellWidth: 24, halign: 'right' },
      10: { cellWidth: 14, halign: 'center' },
    },
    alternateRowStyles: { fillColor: [250, 251, 253] },
    didDrawCell(data) {
      // Colorear semánticamente la columna Pendiente (9) y Pagado (8)
      if (data.section === 'body' && data.column.index === 9 && data.row.index < activos.length) {
        const p = activos[data.row.index]
        if (p.saldo_pendiente > 0) {
          doc.setTextColor(...ALERT)
          doc.setFont('helvetica', 'bold')
          doc.text(
            formatCurrency(Math.max(0, p.saldo_pendiente)),
            data.cell.x + data.cell.width - 3,
            data.cell.y + data.cell.height / 2 + 1,
            { align: 'right' }
          )
        }
      }
      if (data.section === 'body' && data.column.index === 8 && data.row.index < activos.length) {
        const p = activos[data.row.index]
        if (parseFloat(p.total_pagado) > 0) {
          doc.setTextColor(...SUCCESS)
          doc.setFont('helvetica', 'bold')
          doc.text(
            formatCurrency(p.total_pagado),
            data.cell.x + data.cell.width - 3,
            data.cell.y + data.cell.height / 2 + 1,
            { align: 'right' }
          )
        }
      }
    },
    // Número de página
    didDrawPage(data) {
      const pageCount = doc.internal.getNumberOfPages()
      const pageNum   = doc.internal.getCurrentPageInfo().pageNumber
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.text(
        `Página ${pageNum} de ${pageCount}`,
        W / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      )
    },
  })

  const mes   = MONTHS_ES[hoy.getMonth()]
  const anio  = hoy.getFullYear()
  doc.save(`prestamos-activos-${mes}-${anio}.pdf`)
}

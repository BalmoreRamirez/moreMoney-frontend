import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from '../utils/currency'

// ── Constantes ─────────────────────────────────────────────────────────────
const MONTHS_ES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

const PALETTE = {
  brand:   [10,  25,  47],
  success: [16,  185, 129],
  alert:   [245, 158, 11],
  danger:  [220, 38,  38],
  muted:   [107, 114, 128],
  white:   [255, 255, 255],
  rowAlt:  [250, 251, 253],
  totalBg: [235, 238, 245],
  kpiBg:   [245, 247, 250],
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
}

function calcMeses(fechaInicio) {
  if (!fechaInicio) return 0
  const inicio = new Date(fechaInicio + 'T00:00:00')
  const hoy    = new Date()
  let meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
  if (hoy.getDate() < inicio.getDate()) meses--
  return Math.max(1, meses)
}

function pctTasa(t) {
  return parseFloat((parseFloat(t) * 100).toFixed(2))
}

function progresoPct(p) {
  if (!p.total_deuda || p.total_deuda <= 0) return 100
  return Math.min(100, Math.round((p.total_pagado / p.total_deuda) * 100))
}

// Dibuja la cabecera de página (banda navy top)
function drawPageHeader(doc, W, fechaStr) {
  doc.setFillColor(...PALETTE.brand)
  doc.rect(0, 0, W, 18, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...PALETTE.white)
  doc.text('moreMoney · Reporte de Préstamos Activos', 12, 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(180, 190, 210)
  doc.text(`Generado: ${fechaStr}`, 12, 14)
  doc.text('Control Financiero Personal', W - 12, 14, { align: 'right' })
}

// Dibuja el footer con número de página
function drawFooter(doc, W) {
  const H      = doc.internal.pageSize.getHeight()
  const total  = doc.internal.getNumberOfPages()
  const pageN  = doc.internal.getCurrentPageInfo().pageNumber
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...PALETTE.muted)
  doc.text(`Página ${pageN} de ${total}`, W / 2, H - 5, { align: 'center' })
}

// Dibuja una fila de KPIs (4 cajas)
function drawKpiRow(doc, startY, kpis, W) {
  const kpiH   = 14
  const kpiGap = 3
  const kpiW   = (W - 24 - kpiGap * (kpis.length - 1)) / kpis.length

  kpis.forEach((k, i) => {
    const x = 12 + i * (kpiW + kpiGap)
    doc.setFillColor(...PALETTE.kpiBg)
    doc.roundedRect(x, startY, kpiW, kpiH, 2, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...PALETTE.muted)
    doc.text(k.label.toUpperCase(), x + 3, startY + 4.5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...k.color)
    doc.text(k.value, x + 3, startY + 10.5)
  })

  return startY + kpiH
}

// Barra de progreso inline
function drawProgressBar(doc, x, y, width, pct, color) {
  const h = 3
  doc.setFillColor(220, 224, 232)
  doc.roundedRect(x, y, width, h, 1, 1, 'F')
  if (pct > 0) {
    doc.setFillColor(...color)
    doc.roundedRect(x, y, Math.max(1, width * (pct / 100)), h, 1, 1, 'F')
  }
}

// ── EXPORT PRINCIPAL ────────────────────────────────────────────────────────
export function exportarPrestamosActivosPDF(prestamos) {
  const activos = prestamos.filter(p => p.estado === 'activo')
  if (!activos.length) return

  const doc    = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W      = doc.internal.pageSize.getWidth()
  const hoy    = new Date()
  const fechaStr = `${hoy.getDate().toString().padStart(2,'0')} de ${MONTHS_ES[hoy.getMonth()]} de ${hoy.getFullYear()}`

  // ══════════════════════════════════════════════════════
  //  PÁGINA 1 — RESUMEN GLOBAL
  // ══════════════════════════════════════════════════════
  drawPageHeader(doc, W, fechaStr)

  // KPIs globales
  const totalCapital   = activos.reduce((s, p) => s + parseFloat(p.capital          || 0), 0)
  const totalInteres   = activos.reduce((s, p) => s + parseFloat(p.interes_generado || 0), 0)
  const totalPagado    = activos.reduce((s, p) => s + parseFloat(p.total_pagado     || 0), 0)
  const totalPendiente = activos.reduce((s, p) => s + Math.max(0, parseFloat(p.saldo_pendiente || 0)), 0)
  const totalDeuda     = activos.reduce((s, p) => s + parseFloat(p.total_deuda      || 0), 0)

  const globalKpis = [
    { label: 'Capital en calle',  value: formatCurrency(totalCapital),   color: PALETTE.brand },
    { label: 'Interés generado',  value: formatCurrency(totalInteres),   color: PALETTE.muted },
    { label: 'Total recuperado',  value: formatCurrency(totalPagado),    color: PALETTE.success },
    { label: 'Saldo por cobrar',  value: formatCurrency(totalPendiente), color: PALETTE.alert },
  ]

  const afterKpi = drawKpiRow(doc, 22, globalKpis, W)

  // Título sección
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...PALETTE.brand)
  doc.text(`Préstamos activos — ${activos.length} registro${activos.length !== 1 ? 's' : ''}`, 12, afterKpi + 7)

  // Tabla resumen
  const summaryHead = [[
    '#', 'Deudor', 'Contacto', 'Inicio', 'Meses', 'Tasa/mes',
    'Capital', 'Interés gen.', 'Total deuda', 'Pagado', 'Pendiente', 'Progreso',
  ]]

  const summaryBody = activos.map((p, idx) => [
    idx + 1,
    p.deudor_nombre,
    p.deudor_contacto || '—',
    fmtDate(p.fecha_inicio),
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
  summaryBody.push([
    { content: `TOTALES (${activos.length})`, colSpan: 6, styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.brand } },
    { content: formatCurrency(totalCapital),   styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.brand, halign:'right' } },
    { content: formatCurrency(totalInteres),   styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.muted, halign:'right' } },
    { content: formatCurrency(totalDeuda),     styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.brand, halign:'right' } },
    { content: formatCurrency(totalPagado),    styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.success, halign:'right' } },
    { content: formatCurrency(totalPendiente), styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.alert, halign:'right' } },
    { content: '',                             styles: { fillColor: PALETTE.totalBg } },
  ])

  autoTable(doc, {
    startY: afterKpi + 10,
    head: summaryHead,
    body: summaryBody,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: { top: 2.5, right: 2.5, bottom: 2.5, left: 2.5 },
      textColor: [30, 35, 45],
      lineColor: [220, 225, 232],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: PALETTE.brand,
      textColor: PALETTE.white,
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
    },
    columnStyles: {
      0:  { cellWidth: 7,  halign: 'center' },
      1:  { cellWidth: 32 },
      2:  { cellWidth: 26 },
      3:  { cellWidth: 17, halign: 'center' },
      4:  { cellWidth: 11, halign: 'center' },
      5:  { cellWidth: 13, halign: 'center' },
      6:  { cellWidth: 22, halign: 'right' },
      7:  { cellWidth: 22, halign: 'right' },
      8:  { cellWidth: 22, halign: 'right' },
      9:  { cellWidth: 22, halign: 'right' },
      10: { cellWidth: 22, halign: 'right' },
      11: { cellWidth: 14, halign: 'center' },
    },
    alternateRowStyles: { fillColor: PALETTE.rowAlt },
    didDrawPage: () => drawFooter(doc, W),
  })

  // ══════════════════════════════════════════════════════
  //  PÁGINAS DE DETALLE — una sección por préstamo
  // ══════════════════════════════════════════════════════
  activos.forEach((p, idx) => {
    doc.addPage()
    drawPageHeader(doc, W, fechaStr)

    const meses   = calcMeses(p.fecha_inicio)
    const pct     = progresoPct(p)
    const pagos   = Array.isArray(p.pagos) ? p.pagos : []
    const cuenta  = p.cuenta?.nombre || '—'

    // ── Encabezado del préstamo ──
    let y = 23

    // Badge de número
    doc.setFillColor(...PALETTE.brand)
    doc.circle(18, y + 3.5, 5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.white)
    doc.text(`${idx + 1}`, 18, y + 4.5, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...PALETTE.brand)
    doc.text(p.deudor_nombre, 27, y + 4)

    if (p.deudor_contacto) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...PALETTE.muted)
      doc.text(`Contacto: ${p.deudor_contacto}`, 27, y + 9.5)
    }

    // Estado badge
    const estadoColor = PALETTE.success
    doc.setFillColor(...estadoColor)
    const badgeX = W - 42
    doc.roundedRect(badgeX, y, 30, 8, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.white)
    doc.text('ACTIVO', badgeX + 15, y + 5.5, { align: 'center' })

    y += 15

    // ── KPIs del préstamo ──
    const prestamoKpis = [
      { label: 'Capital prestado',  value: formatCurrency(p.capital),                        color: PALETTE.brand },
      { label: 'Tasa mensual',      value: `${pctTasa(p.tasa_interes_mensual)}%`,             color: PALETTE.muted },
      { label: 'Meses transcurridos', value: `${meses} mes${meses !== 1 ? 'es' : ''}`,       color: PALETTE.muted },
      { label: 'Interés generado',  value: formatCurrency(p.interes_generado),                color: PALETTE.muted },
      { label: 'Total adeudado',    value: formatCurrency(p.total_deuda),                     color: PALETTE.brand },
      { label: 'Total pagado',      value: formatCurrency(p.total_pagado),                    color: PALETTE.success },
      { label: 'Saldo pendiente',   value: formatCurrency(Math.max(0, p.saldo_pendiente)),    color: p.saldo_pendiente > 0 ? PALETTE.alert : PALETTE.success },
      { label: 'Cuenta origen',     value: cuenta,                                            color: PALETTE.brand },
    ]

    const kpiH   = 13
    const kpiGap = 2.5
    const kpiW   = (W - 24 - kpiGap * (prestamoKpis.length - 1)) / prestamoKpis.length

    prestamoKpis.forEach((k, i) => {
      const x = 12 + i * (kpiW + kpiGap)
      doc.setFillColor(...PALETTE.kpiBg)
      doc.roundedRect(x, y, kpiW, kpiH, 2, 2, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(...PALETTE.muted)
      doc.text(k.label.toUpperCase(), x + 3, y + 4)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...k.color)
      doc.text(k.value, x + 3, y + 9.5)
    })

    y += kpiH + 5

    // ── Barra de progreso ──
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...PALETTE.brand)
    doc.text('Progreso de recuperación', 12, y + 1)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(pct >= 100 ? PALETTE.success[0] : PALETTE.alert[0], pct >= 100 ? PALETTE.success[1] : PALETTE.alert[1], pct >= 100 ? PALETTE.success[2] : PALETTE.alert[2])
    doc.text(`${pct}%`, W - 12, y + 1, { align: 'right' })

    y += 4
    drawProgressBar(doc, 12, y, W - 24, pct, pct >= 100 ? PALETTE.success : PALETTE.alert)
    y += 7

    // ── Datos clave adicionales ──
    const metaItems = [
      ['Fecha de inicio', fmtDate(p.fecha_inicio)],
      ['Días de duración', p.dias_duracion ? `${p.dias_duracion} días` : 'Sin límite definido'],
      ['Abonos registrados', pagos.length.toString()],
    ]

    doc.setFillColor(240, 242, 248)
    doc.roundedRect(12, y, W - 24, 9, 2, 2, 'F')

    const metaW = (W - 24) / metaItems.length
    metaItems.forEach(([label, val], i) => {
      const mx = 12 + i * metaW + 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(...PALETTE.muted)
      doc.text(label.toUpperCase(), mx, y + 3.5)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...PALETTE.brand)
      doc.text(val, mx, y + 7.5)
    })

    y += 14

    // ── Historial de abonos ──
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...PALETTE.brand)
    doc.text(`Historial de abonos — ${pagos.length} registro${pagos.length !== 1 ? 's' : ''}`, 12, y)
    y += 3

    if (pagos.length === 0) {
      doc.setFillColor(...PALETTE.kpiBg)
      doc.roundedRect(12, y, W - 24, 12, 2, 2, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...PALETTE.muted)
      doc.text('Sin abonos registrados para este préstamo.', W / 2, y + 7.5, { align: 'center' })
      y += 16
    } else {
      const abonosHead = [['#', 'Fecha de pago', 'Monto', 'Nota / Descripción', 'Saldo restante acumulado']]

      let acumulado = 0
      const abonosBody = pagos
        .slice()
        .sort((a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago))
        .map((abono, i) => {
          acumulado += parseFloat(abono.monto)
          const saldoTras = Math.max(0, parseFloat(p.total_deuda) - acumulado)
          return [
            i + 1,
            fmtDate(abono.fecha_pago),
            { content: formatCurrency(abono.monto), styles: { fontStyle:'bold', textColor: PALETTE.success, halign:'right' } },
            abono.nota || '—',
            { content: formatCurrency(saldoTras), styles: { halign:'right', textColor: saldoTras <= 0 ? PALETTE.success : PALETTE.alert } },
          ]
        })

      // Fila de total abonado
      abonosBody.push([
        { content: 'TOTAL ABONADO', colSpan: 2, styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.brand } },
        { content: formatCurrency(p.total_pagado), styles: { fontStyle:'bold', fillColor: PALETTE.totalBg, textColor: PALETTE.success, halign:'right' } },
        { content: '', colSpan: 2, styles: { fillColor: PALETTE.totalBg } },
      ])

      autoTable(doc, {
        startY: y,
        head: abonosHead,
        body: abonosBody,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
          textColor: [30, 35, 45],
          lineColor: [220, 225, 232],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: PALETTE.brand,
          textColor: PALETTE.white,
          fontStyle: 'bold',
          fontSize: 7.5,
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 10,  halign: 'center' },
          1: { cellWidth: 30,  halign: 'center' },
          2: { cellWidth: 35,  halign: 'right' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 45,  halign: 'right' },
        },
        alternateRowStyles: { fillColor: PALETTE.rowAlt },
        didDrawPage: () => drawFooter(doc, W),
      })
    }

    drawFooter(doc, W)
  })

  // Escribir footers en todas las páginas con el total real
  const totalPages = doc.internal.getNumberOfPages()
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg)
    const H = doc.internal.pageSize.getHeight()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...PALETTE.muted)
    doc.text(`Página ${pg} de ${totalPages}`, W / 2, H - 5, { align: 'center' })
  }

  const mes  = MONTHS_ES[hoy.getMonth()]
  const anio = hoy.getFullYear()
  doc.save(`prestamos-activos-${mes}-${anio}.pdf`)
}

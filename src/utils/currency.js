const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formatea un número como moneda: $XX,XXX.CC
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrency(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return '$0.00'
  return formatter.format(num)
}

/**
 * Retorna solo el valor numérico formateado sin símbolo: XX,XXX.CC
 * @param {number|string} value
 * @returns {string}
 */
export function formatAmount(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

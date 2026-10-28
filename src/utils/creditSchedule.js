function roundMoney(value) {
  return parseFloat(value.toFixed(2))
}

/** Espejo de la tabla de amortización generada por creditosController. */
export function calculateCreditSchedule({ capital, monthlyRate, installments, interestType }) {
  const principal = Number(capital)
  const rate = Number(monthlyRate)
  const count = Number(installments)
  if (!Number.isFinite(principal) || principal <= 0
    || !Number.isFinite(rate) || rate < 0
    || !Number.isSafeInteger(count) || count <= 0) return null

  const rows = []
  if (interestType === 'simple') {
    const baseCapital = roundMoney(principal / count)
    const monthlyInterest = roundMoney(principal * rate)
    for (let i = 0; i < count; i++) {
      const periodCapital = i === count - 1
        ? roundMoney(principal - baseCapital * (count - 1))
        : baseCapital
      rows.push({
        capital: periodCapital,
        interest: monthlyInterest,
        total: roundMoney(periodCapital + monthlyInterest),
      })
    }
  } else if (interestType === 'compuesto') {
    const fixedInstallment = rate === 0
      ? roundMoney(principal / count)
      : roundMoney(principal * rate * Math.pow(1 + rate, count)
        / (Math.pow(1 + rate, count) - 1))
    let balance = principal
    for (let i = 0; i < count; i++) {
      const last = i === count - 1
      const interest = roundMoney(balance * rate)
      const periodCapital = last
        ? roundMoney(balance)
        : roundMoney(fixedInstallment - interest)
      rows.push({
        capital: periodCapital,
        interest,
        total: last ? roundMoney(periodCapital + interest) : fixedInstallment,
      })
      balance = roundMoney(balance - periodCapital)
    }
  } else {
    return null
  }

  return {
    installment: rows[0].total,
    totalInterest: roundMoney(rows.reduce((sum, row) => sum + row.interest, 0)),
    totalPayment: roundMoney(rows.reduce((sum, row) => sum + row.total, 0)),
    rows,
  }
}

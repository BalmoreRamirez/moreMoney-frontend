import assert from 'node:assert/strict'
import { test } from 'node:test'
import { todayDateInput } from '../src/utils/dates.js'
import { calculateCreditSchedule } from '../src/utils/creditSchedule.js'

test('la fecha DATEONLY conserva el día local incluso cerca de medianoche UTC', () => {
  const previousTimezone = process.env.TZ
  process.env.TZ = 'America/El_Salvador'
  try {
    const localLateDate = new Date(2026, 9, 28, 23, 30)
    assert.equal(localLateDate.toISOString().slice(0, 10), '2026-10-29')
    assert.equal(todayDateInput(localLateDate), '2026-10-28')
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ
    else process.env.TZ = previousTimezone
  }
})

test('la vista previa de interés simple replica los redondeos y la última cuota del backend', () => {
  const schedule = calculateCreditSchedule({
    capital: 1000,
    monthlyRate: 0.02,
    installments: 3,
    interestType: 'simple',
  })

  assert.equal(schedule.installment, 353.33)
  assert.equal(schedule.totalInterest, 60)
  assert.equal(schedule.totalPayment, 1060)
  assert.equal(schedule.rows.at(-1).capital, 333.34)
})

test('la vista previa de interés compuesto replica interés por saldo y ajuste final', () => {
  const schedule = calculateCreditSchedule({
    capital: 1000,
    monthlyRate: 0.01,
    installments: 3,
    interestType: 'compuesto',
  })

  assert.equal(schedule.installment, 340.02)
  assert.equal(schedule.totalInterest, 20.07)
  assert.equal(schedule.totalPayment, 1020.07)
  assert.equal(schedule.rows.at(-1).capital, 336.66)
})

test('el cálculo de cuotas rechaza cantidades incompatibles con el contrato', () => {
  assert.equal(calculateCreditSchedule({
    capital: 100, monthlyRate: 0.1, installments: 0, interestType: 'simple',
  }), null)
  assert.equal(calculateCreditSchedule({
    capital: 100, monthlyRate: 0.1, installments: 2, interestType: 'otro',
  }), null)
})

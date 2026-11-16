import { computed } from 'vue'
import { helpers, required, decimal, integer, minValue, maxValue } from '@vuelidate/validators'

const requiredRule = (label) => helpers.withMessage(`${label} es obligatorio.`, required)
const decimalRule = (label) => helpers.withMessage(`${label} debe ser un número válido.`, decimal)
const positiveRule = (label) => helpers.withMessage(`${label} debe ser mayor que cero.`, minValue(0.01))
const integerRule = (label) => helpers.withMessage(`${label} debe ser un número entero.`, integer)
const twoDecimalPlaces = (label) => helpers.withMessage(`${label} admite como máximo dos decimales.`, (value) => value === '' || value == null || Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 1e-8)

/** Construye reglas comunes para formularios manteniendo opcionales los campos no declarados. */
export function buildFormRules(state, schema) {
  return computed(() => {
    const rules = {}
    for (const [field, label] of Object.entries(schema.required ?? {})) {
      rules[field] = { required: requiredRule(label) }
    }
    for (const [field, config] of Object.entries(schema.conditionalRequired ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: helpers.withMessage(`${config.label} es obligatorio.`, (value) => !config.when() || required(value)) }
    }
    for (const [field, label] of Object.entries(schema.positive ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: requiredRule(label), decimal: decimalRule(label), positive: positiveRule(label), twoDecimalPlaces: twoDecimalPlaces(label) }
    }
    for (const [field, label] of Object.entries(schema.optionalPositive ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), decimal: helpers.withMessage(`${label} debe ser un número válido.`, (value) => value === '' || value == null || decimal(value)), positive: helpers.withMessage(`${label} debe ser mayor que cero.`, (value) => value === '' || value == null || Number(value) >= 0.01), twoDecimalPlaces: twoDecimalPlaces(label) }
    }
    for (const [field, label] of Object.entries(schema.dates ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: requiredRule(label) }
    }
    for (const [field, config] of Object.entries(schema.integers ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: requiredRule(config.label), integer: integerRule(config.label), minValue: helpers.withMessage(`${config.label}: mínimo ${config.min}.`, minValue(config.min)), ...(config.max != null ? { maxValue: helpers.withMessage(`${config.label}: máximo ${config.max}.`, maxValue(config.max)) } : {}) }
    }
    for (const [field, config] of Object.entries(schema.ranges ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: requiredRule(config.label), decimal: decimalRule(config.label), minValue: helpers.withMessage(`${config.label}: mínimo ${config.min}.`, minValue(config.min)), maxValue: helpers.withMessage(`${config.label}: máximo ${config.max}.`, maxValue(config.max)), twoDecimalPlaces: twoDecimalPlaces(config.label) }
    }
    for (const [field, label] of Object.entries(schema.optionalRanges ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), decimal: helpers.withMessage(`${label} debe ser un número válido.`, (value) => value === '' || value == null || decimal(value)), minValue: helpers.withMessage(`${label} no puede ser negativo.`, (value) => value === '' || value == null || Number(value) >= 0), twoDecimalPlaces: twoDecimalPlaces(label) }
    }
    for (const [field, config] of Object.entries(schema.conditionalPositive ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: helpers.withMessage(`${config.label} es obligatorio.`, (value) => !config.when() || required(value)), decimal: helpers.withMessage(`${config.label} debe ser un número válido.`, (value) => !config.when() || decimal(value)), positive: helpers.withMessage(`${config.label} debe ser mayor que cero.`, (value) => !config.when() || Number(value) >= 0.01), twoDecimalPlaces: helpers.withMessage(`${config.label} admite como máximo dos decimales.`, (value) => !config.when() || value === '' || value == null || Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 1e-8) }
    }
    for (const [field, config] of Object.entries(schema.conditionalInteger ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), required: helpers.withMessage(`${config.label} es obligatorio.`, (value) => !config.when() || required(value)), integer: helpers.withMessage(`${config.label} debe ser un número entero.`, (value) => !config.when() || integer(value)), minValue: helpers.withMessage(`${config.label}: mínimo ${config.min}.`, (value) => !config.when() || minValue(config.min)(value)), ...(config.max != null ? { maxValue: helpers.withMessage(`${config.label}: máximo ${config.max}.`, (value) => !config.when() || maxValue(config.max)(value)) } : {}) }
    }
    for (const [field, config] of Object.entries(schema.distinct ?? {})) {
      rules[field] = { ...(rules[field] ?? {}), distinct: helpers.withMessage(config.message, (value) => !value || value !== state.value[config.other]) }
    }
    return rules
  })
}

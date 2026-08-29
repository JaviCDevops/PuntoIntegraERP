import {
    distributePercentagesEqually,
    getMilestoneTotal,
    isMilestoneTotalValid,
    normalizePercentagesTo100,
    parseNonNegative,
} from '../../resources/js/utils/milestoneHelpers.js';

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

const distributed = distributePercentagesEqually(3, 300);
assert(getMilestoneTotal(distributed) === 100, '3 hitos deben sumar 100%');

const twoPayments = distributePercentagesEqually(2, 1000);
twoPayments[0].percentage = 70;
const normalized = normalizePercentagesTo100(twoPayments, 0, 1000);
assert(normalized[1].percentage === 30, 'Segundo pago debe ser 30% tras editar el primero a 70%');
assert(isMilestoneTotalValid(normalized), 'Total normalizado debe ser 100%');

assert(parseNonNegative('-0.54') === null, 'Rechaza montos negativos');
assert(parseNonNegative('12.5') === 12.5, 'Acepta montos positivos');

console.log('✅ MilestoneHelpersTest: todas las pruebas pasaron');

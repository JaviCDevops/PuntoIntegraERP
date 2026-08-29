/**
 * Tests manuales para el generador de correo (ejecutar con: node tests/Unit/CorporateEmailTest.js)
 */
import { generateCorporateEmail, getFirstSyllable } from '../../resources/js/utils/generateCorporateEmail.js';

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

assert(getFirstSyllable('María') === 'ma', 'Primera sílaba de María');
assert(getFirstSyllable('Roderick') === 'ro', 'Primera sílaba de Roderick');

assert(
    generateCorporateEmail('María José González') === 'magonzalez@puntointegra.cl',
    'Email corporativo María González'
);

assert(
    generateCorporateEmail('Roderick Tapia') === 'rotapia@puntointegra.cl',
    'Email corporativo Roderick Tapia'
);

console.log('✅ CorporateEmailTest: todas las pruebas pasaron');

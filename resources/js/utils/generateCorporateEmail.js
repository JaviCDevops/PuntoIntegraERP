/**
 * Genera correo corporativo: [PrimeraSílabaNombre][Apellido]@puntointegra.cl
 * Ej: "María José González" → "magonzalez@puntointegra.cl"
 */
export function getFirstSyllable(word) {
    if (!word) return '';
    const normalized = word
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const match = normalized.match(/^[^aeiou]*[aeiou]+/);
    return match ? match[0] : normalized.slice(0, 2);
}

export function generateCorporateEmail(fullName) {
    if (!fullName || fullName.trim().length < 2) return '';

    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';

    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const syllable = getFirstSyllable(firstName);
    const prefix = lastName ? syllable + lastName : firstName;

    const clean = prefix
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    return clean ? `${clean}@puntointegra.cl` : '';
}

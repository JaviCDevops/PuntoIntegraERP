/** Formatea YYYY-MM-DD a DD/MM/YYYY para visualización local chilena */
export function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const iso = dateString.substring(0, 10);
    const [year, month, day] = iso.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
}

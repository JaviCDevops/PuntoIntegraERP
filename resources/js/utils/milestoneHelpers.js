export const PERCENTAGE_TOLERANCE = 0.01;

export function clampPercentage(value) {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
}

export function parseNonNegative(value) {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(String(value).replace(',', '.'));
    if (Number.isNaN(num) || num < 0) return null;
    return num;
}

export function getMilestoneTotal(milestones) {
    return (milestones || []).reduce(
        (sum, ms) => sum + parseFloat(ms.percentage || 0),
        0
    );
}

export function isMilestoneTotalValid(milestones, tolerance = PERCENTAGE_TOLERANCE) {
    if (!milestones?.length) return true;
    return Math.abs(getMilestoneTotal(milestones) - 100) <= tolerance;
}

export function syncMilestoneAmount(milestone, totalProjectValue) {
    if (totalProjectValue <= 0) return milestone.amount ?? 0;
    return (totalProjectValue * (parseFloat(milestone.percentage || 0) / 100)).toFixed(2);
}

/** Reparte 100% entre N hitos; el último absorbe el redondeo. */
export function distributePercentagesEqually(count, totalProjectValue = 0, existing = []) {
    const safeCount = Math.max(1, Math.min(12, parseInt(count, 10) || 1));
    const basePercentage = parseFloat((100 / safeCount).toFixed(2));

    return Array.from({ length: safeCount }, (_, i) => {
        const prev = existing[i] || {};
        const percentage = i === safeCount - 1
            ? parseFloat((100 - basePercentage * (safeCount - 1)).toFixed(2))
            : basePercentage;

        const milestone = {
            id: prev.id,
            milestone_order: i + 1,
            percentage,
            invoice_number: prev.invoice_number || '',
            status: prev.status || 'PENDIENTE',
        };

        milestone.amount = totalProjectValue > 0
            ? syncMilestoneAmount(milestone, totalProjectValue)
            : (prev.amount ?? 0);

        return milestone;
    });
}

/**
 * Ajusta el hito compañero para que el total sea 100%.
 * Ej: 2 pagos con 70% en el primero → el segundo queda en 30%.
 */
export function normalizePercentagesTo100(milestones, editedIndex, totalProjectValue = 0) {
    const newMilestones = milestones.map((ms) => ({ ...ms }));
    const count = newMilestones.length;

    if (count <= 1) {
        newMilestones[0].percentage = 100;
        newMilestones[0].amount = syncMilestoneAmount(newMilestones[0], totalProjectValue);
        return newMilestones;
    }

    const editedValue = clampPercentage(newMilestones[editedIndex].percentage);
    newMilestones[editedIndex].percentage = editedValue;
    newMilestones[editedIndex].amount = syncMilestoneAmount(newMilestones[editedIndex], totalProjectValue);

    let targetIndex = count - 1;
    if (editedIndex === targetIndex) {
        targetIndex = 0;
    }

    const sumFixedOthers = newMilestones.reduce((sum, ms, i) => {
        if (i === editedIndex || i === targetIndex) return sum;
        return sum + clampPercentage(ms.percentage);
    }, 0);

    let remaining = parseFloat((100 - editedValue - sumFixedOthers).toFixed(2));
    remaining = Math.max(0, Math.min(100, remaining));

    newMilestones[targetIndex].percentage = remaining;
    newMilestones[targetIndex].amount = syncMilestoneAmount(newMilestones[targetIndex], totalProjectValue);

    return newMilestones;
}

export function getMilestoneValidationMessage(milestones) {
    if (!milestones?.length) return null;
    const total = getMilestoneTotal(milestones);
    if (isMilestoneTotalValid(milestones)) return null;
    if (total < 100) {
        return `La suma de porcentajes es ${total.toFixed(2)}%. Debe ser exactamente 100% (faltan ${(100 - total).toFixed(2)}%).`;
    }
    return `La suma de porcentajes es ${total.toFixed(2)}%. Debe ser exactamente 100% (sobran ${(total - 100).toFixed(2)}%).`;
}

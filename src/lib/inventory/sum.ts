export type CalculateInventorySumInput = {
    count: number | null | undefined;
    packageSize: number | null | undefined;
    packageCount: number | null | undefined;
    partial: number | null | undefined;
};

export function calculateInventorySum({
    count,
    packageSize,
    packageCount,
    partial,
}: CalculateInventorySumInput): number {
    const safeCount = Number.isFinite(count) ? Number(count) : 0;
    const safePackageSize = Number.isFinite(packageSize) ? Number(packageSize) : 1;
    const safePackageCount = Number.isFinite(packageCount) ? Number(packageCount) : 0;
    const safePartial = Number.isFinite(partial) ? Number(partial) : 0;

    return safeCount + (safePackageSize * safePackageCount) + safePartial;
}

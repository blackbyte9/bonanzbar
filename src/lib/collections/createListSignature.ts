export function createListSignature<TItem, TSignatureItem>(
    items: TItem[],
    toSignatureItem: (item: TItem) => TSignatureItem,
): string {
    return JSON.stringify(items.map(toSignatureItem));
}

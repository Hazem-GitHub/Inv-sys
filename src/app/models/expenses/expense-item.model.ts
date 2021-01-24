export interface ExpenseItem {
    id: number,
    itemName: string,
    itemDescription?: string,
    unitPrice: number,
    quantity: number,
    Vat: number,
    total: number
}
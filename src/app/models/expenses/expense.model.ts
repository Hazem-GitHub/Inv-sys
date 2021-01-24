import { ExpenseItem } from './expense-item.model';

export interface Expense {
    id: number,
    CreationDate: string,
    ExpenseItem: ExpenseItem[],
    clientId: number,
    clientName: string,
    typeId: number,
    typeName: string,
    Description?: string,
    currencyId: number,
    currencyName: string,
    TotalAmount: number
}

export interface ExpenseType {
    id: number,
    name: string
}
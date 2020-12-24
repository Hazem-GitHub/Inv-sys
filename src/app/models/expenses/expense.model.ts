import { ExpenseItem } from './expense-item.model';

export class Expense {
    id: number;
    CreationDate: string;
    ExpenseItem: ExpenseItem[];
    clientId: number;
    clientName: string;
    typeId: number;
    typeName: string;
    Description?: string;
    currencyId: number;
    currencyName: string;
    TotalAmount: number;
}

export class ExpenseType {
    id: number;
    name: string;
}
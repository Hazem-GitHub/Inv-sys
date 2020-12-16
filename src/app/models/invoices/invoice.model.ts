import { InvoiceItem } from './invoice-item.model';

export class Invoice {
    CreationDate?: string;
    DueDate?: string;
    InvoiceItem?: InvoiceItem[];
    clientId?: number;
    clientName?: string;
    currency?: string;
    currencyId?: number;
    dueAmounts?: number;
    id: number;
    paidAmounts?: number;
    paymentMethod?: string;
    paymentMethodId?: number;
    projectDescription?: string;
    projectName?: string;
    status?: string;
    statusId?: number;
    subTotal?: number;
    taxRate?: number;
    taxId?: number;
    taxes?: boolean;
    totalAmounts?: number;
}
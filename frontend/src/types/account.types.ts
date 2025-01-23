import { AccountType, SupportedCurrency } from '../config';

export interface CreateAccountDto {
    name: string;
    type: AccountType;
    currency: SupportedCurrency;
    description: string;
    balance: number;
    is_active: boolean;
}

declare interface IAccount {
    ctime: string;        // Дата создания в формате ISO
    currency_id: number;   // Идентификатор валюты
    expense: number;       // Сумма расходов
    iban: string;          // IBAN-счет
    income: number;        // Сумма доходов
    pending: number;       // Ожидаемая сумма
    project_id: number;    // Идентификатор проекта
    status: string;        // Статус транзакции (например, 'active')
    type: string;          // Тип транзакции (например, 'merchant')
    uid: string;           // Уникальный идентификатор транзакции
    user_uid: string;      // Уникальный идентификатор пользователя
    utime: string;         // Дата последнего обновления в формате ISO
}
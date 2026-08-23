SET NOCOUNT ON;

DECLARE @Required TABLE
(
    TableName sysname NOT NULL,
    ColumnName sysname NOT NULL
);

INSERT INTO @Required (TableName, ColumnName)
VALUES
    (N'USER_ACCOUNT', N'PasswordHash'),
    (N'PASSWORD_RESET_TOKEN', N'PasswordResetTokenID'),
    (N'PASSWORD_RESET_TOKEN', N'UserID'),
    (N'PASSWORD_RESET_TOKEN', N'TokenHash'),
    (N'PASSWORD_RESET_TOKEN', N'CreatedAt'),
    (N'PASSWORD_RESET_TOKEN', N'ExpiresAt'),
    (N'PASSWORD_RESET_TOKEN', N'UsedAt'),
    (N'PASSWORD_RESET_TOKEN', N'RowVersion'),
    (N'CART', N'BuyerUserID'),
    (N'CART_ITEM', N'VariantID'),
    (N'COUPON', N'CouponCode'),
    (N'CUSTOMER_ORDER', N'OrderNumber'),
    (N'CUSTOMER_ORDER', N'StoreID'),
    (N'CUSTOMER_ORDER', N'TotalAmount'),
    (N'CUSTOMER_ORDER', N'BuyerArchivedDate'),
    (N'ORDER_ITEM', N'ProductNameAtPurchase'),
    (N'ORDER_ITEM', N'SKUAtPurchase'),
    (N'ORDER_ADDRESS', N'AddressType'),
    (N'ORDER_SELLER_FINANCIAL', N'SellerNetAmount'),
    (N'ORDER_STATUS_HISTORY', N'NewStatus'),
    (N'PAYMENT', N'PaymentStatus'),
    (N'SHIPMENT', N'ShipmentStatus'),
    (N'NOTIFICATION', N'RecipientUserID');

SELECT required.TableName, required.ColumnName
FROM @Required AS required
WHERE COL_LENGTH(N'dbo.' + required.TableName, required.ColumnName) IS NULL
ORDER BY required.TableName, required.ColumnName;

IF EXISTS
(
    SELECT 1
    FROM @Required AS required
    WHERE COL_LENGTH(N'dbo.' + required.TableName, required.ColumnName) IS NULL
)
BEGIN
    RAISERROR(
        'Commerce schema verification failed. Missing items are listed above.',
        16,
        1
    );
    RETURN;
END;

PRINT 'Commerce schema verification passed.';

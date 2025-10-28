# Database and API Diagrams

## 1. Database Schema Overview

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER ||--o{ CART : has
    CUSTOMER ||--o{ ADDRESS : "has many"
    
    CART ||--o{ LINE_ITEM : contains
    CART ||--o| SHIPPING_METHOD : "uses"
    CART ||--o| PAYMENT_SESSION : "has"
    
    ORDER ||--o{ LINE_ITEM : contains
    ORDER ||--o| SHIPPING_METHOD : "uses"
    ORDER ||--o| PAYMENT : "has"
    ORDER ||--|| ADDRESS : "ships to"
    ORDER ||--|| ADDRESS : "bills to"
    
    PRODUCT ||--o{ PRODUCT_VARIANT : "has variants"
    PRODUCT_VARIANT ||--o{ LINE_ITEM : "added to"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has images"
    PRODUCT }|--|| PRODUCT_CATEGORY : "belongs to"
    
    REGION ||--o{ SHIPPING_OPTION : "has"
    REGION ||--o{ PAYMENT_PROVIDER : "accepts"
    REGION ||--o{ COUNTRY : contains
    
    CUSTOMER {
        uuid id PK
        string email UK
        string first_name
        string last_name
        string phone
        timestamp created_at
        timestamp updated_at
    }
    
    ADDRESS {
        uuid id PK
        uuid customer_id FK
        string first_name
        string last_name
        string address_1
        string address_2
        string city
        string province
        string postal_code
        string country_code
        string phone
        json metadata
    }
    
    CART {
        uuid id PK
        uuid customer_id FK
        string email
        uuid region_id FK
        uuid shipping_address_id FK
        uuid billing_address_id FK
        integer total
        timestamp completed_at
    }
    
    ORDER {
        uuid id PK
        uuid customer_id FK
        uuid cart_id FK
        string email
        uuid region_id FK
        string status
        integer subtotal
        integer shipping_total
        integer tax_total
        integer total
        string payment_status
        string fulfillment_status
        timestamp created_at
    }
    
    PRODUCT {
        uuid id PK
        string title
        string handle UK
        text description
        string thumbnail
        string status
        uuid category_id FK
        json metadata
        timestamp created_at
    }
    
    PRODUCT_VARIANT {
        uuid id PK
        uuid product_id FK
        string title
        string sku UK
        integer inventory_quantity
        boolean manage_inventory
        json prices
    }
    
    LINE_ITEM {
        uuid id PK
        uuid cart_id FK
        uuid order_id FK
        uuid variant_id FK
        string title
        integer quantity
        integer unit_price
        integer total
    }
    
    PAYMENT {
        uuid id PK
        uuid order_id FK
        string provider_id
        integer amount
        string status
        json data
        timestamp captured_at
    }
```

## 2. API Endpoint Structure

```mermaid
graph TB
    subgraph "Store API - Public :9000/store"
        subgraph "Products"
            P1[GET /products]
            P2[GET /products/:id]
            P3[GET /products/:handle]
        end
        
        subgraph "Cart Operations"
            C1[POST /carts]
            C2[GET /carts/:id]
            C3[POST /carts/:id/line-items]
            C4[PUT /carts/:id/line-items/:item_id]
            C5[DELETE /carts/:id/line-items/:item_id]
            C6[POST /carts/:id/complete]
        end
        
        subgraph "Checkout"
            CH1[POST /carts/:id/shipping-address]
            CH2[POST /carts/:id/billing-address]
            CH3[GET /shipping-options]
            CH4[POST /carts/:id/shipping-methods]
            CH5[POST /carts/:id/payment-sessions]
        end
        
        subgraph "Customer"
            CU1[POST /customers]
            CU2[POST /auth]
            CU3[GET /customers/me]
            CU4[POST /customers/addresses]
        end
        
        subgraph "Regions"
            R1[GET /regions]
            R2[GET /regions/:id]
        end
        
        subgraph "Orders"
            O1[GET /orders]
            O2[GET /orders/:id]
        end
    end
    
    subgraph "Admin API - Protected :9000/admin"
        subgraph "Product Management"
            AP1[GET /products]
            AP2[POST /products]
            AP3[PUT /products/:id]
            AP4[DELETE /products/:id]
        end
        
        subgraph "Order Management"
            AO1[GET /orders]
            AO2[GET /orders/:id]
            AO3[POST /orders/:id/fulfillment]
            AO4[POST /orders/:id/shipment]
        end
        
        subgraph "Customer Management"
            AC1[GET /customers]
            AC2[GET /customers/:id]
        end
        
        subgraph "Settings"
            AS1[GET /regions]
            AS2[GET /shipping-options]
            AS3[GET /payment-providers]
        end
    end
    
    style P1 fill:#e1f5ff
    style C1 fill:#ffd43b
    style CH1 fill:#90ee90
    style O1 fill:#ff9999
```

## 3. API Request/Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant A as Auth Service
    participant H as Handler
    participant S as Service Layer
    participant DB as Database
    participant R as Redis
    
    C->>M: HTTP Request
    M->>M: Parse Headers
    M->>M: Extract Token
    
    alt Protected Route
        M->>A: Validate Token
        A->>R: Check Session
        R-->>A: Session Valid
        A-->>M: User Context
    else Public Route
        M->>M: Skip Auth
    end
    
    M->>H: Forward Request
    H->>H: Validate Input
    
    alt Invalid Input
        H-->>C: 400 Bad Request
    else Valid Input
        H->>S: Call Service Method
        S->>DB: Query Data
        DB-->>S: Return Data
        
        alt Cache-able
            S->>R: Store in Cache
        end
        
        S-->>H: Return Result
        H->>H: Format Response
        H-->>C: 200 OK + Data
    end
```

## 4. Cart State Management

```mermaid
stateDiagram-v2
    [*] --> Empty: Create Cart
    
    Empty --> WithItems: Add Item
    WithItems --> Empty: Remove All Items
    WithItems --> WithItems: Add/Remove Items
    
    WithItems --> WithAddress: Add Address
    WithAddress --> WithItems: Remove Address
    WithAddress --> WithAddress: Update Address
    
    WithAddress --> WithShipping: Select Shipping
    WithShipping --> WithAddress: Change Shipping
    WithShipping --> WithShipping: Update Shipping
    
    WithShipping --> WithPayment: Add Payment
    WithPayment --> WithShipping: Change Payment
    WithPayment --> WithPayment: Update Payment
    
    WithPayment --> Processing: Submit Order
    Processing --> Completed: Success
    Processing --> WithPayment: Payment Failed
    
    Completed --> [*]
    
    note right of Empty
        cart_id stored in cookies
    end note
    
    note right of WithAddress
        shipping_address_id
        billing_address_id
    end note
    
    note right of WithShipping
        shipping_method_id
        calculated_shipping_total
    end note
    
    note right of WithPayment
        payment_session
        payment_provider
    end note
    
    note right of Completed
        cart -> order conversion
        cart marked as completed
    end note
```

## 5. Data Flow - Product to Order

```mermaid
graph LR
    subgraph "Product Catalog"
        P[Product]
        PV[Product Variant]
        Price[Price List]
        Inv[Inventory]
    end
    
    subgraph "Shopping Cart"
        Cart[Cart]
        LI[Line Item]
        CalcPrice[Calculated Price]
    end
    
    subgraph "Checkout Process"
        Addr[Address]
        Ship[Shipping Method]
        Pay[Payment Method]
    end
    
    subgraph "Order Creation"
        Order[Order]
        OrderItem[Order Line Item]
        Payment[Payment Record]
        Fulfill[Fulfillment]
    end
    
    P --> PV
    PV --> Price
    PV --> Inv
    
    PV -->|Add to Cart| Cart
    Cart --> LI
    Price --> CalcPrice
    CalcPrice --> LI
    
    LI --> Addr
    Addr --> Ship
    Ship --> Pay
    
    Pay -->|Complete| Order
    LI --> OrderItem
    OrderItem --> Order
    Pay --> Payment
    Payment --> Order
    Order --> Fulfill
    
    style Cart fill:#ffd43b
    style Order fill:#90ee90
```

## 6. Cache Strategy

```mermaid
flowchart TD
    Request[API Request] --> CheckCache{Check<br/>Redis Cache}
    
    CheckCache -->|Hit| ReturnCached[Return Cached Data]
    CheckCache -->|Miss| QueryDB[Query Database]
    
    QueryDB --> ProcessData[Process Data]
    ProcessData --> StoreCache{Cacheable?}
    
    StoreCache -->|Yes| CacheData[Store in Redis]
    StoreCache -->|No| ReturnFresh[Return Fresh Data]
    
    CacheData --> SetTTL[Set TTL]
    SetTTL --> ReturnFresh
    
    ReturnCached --> End[Return to Client]
    ReturnFresh --> End
    
    subgraph "Cache Keys"
        K1[products:*]
        K2[cart:cart_id]
        K3[customer:customer_id]
        K4[region:region_id]
    end
    
    subgraph "TTL Settings"
        T1[Products: 1 hour]
        T2[Cart: 7 days]
        T3[Customer: 1 hour]
        T4[Region: 24 hours]
    end
    
    style CheckCache fill:#ffd43b
    style ReturnCached fill:#90ee90
    style CacheData fill:#dc382d
```

## 7. Payment Processing Flow

```mermaid
flowchart TD
    Start[Initiate Payment] --> SelectMethod{Payment<br/>Method}
    
    SelectMethod -->|COD| COD_Flow
    SelectMethod -->|Stripe| Stripe_Flow
    
    subgraph COD_Flow ["Cash on Delivery"]
        COD1[Create Payment Session]
        COD2[Mark as Pending]
        COD3[Create Order]
        COD4[Send Confirmation]
        
        COD1 --> COD2
        COD2 --> COD3
        COD3 --> COD4
    end
    
    subgraph Stripe_Flow ["Stripe Credit Card"]
        S1[Create Payment Intent]
        S2[Get Client Secret]
        S3[Confirm Card Payment]
        S4{Payment<br/>Status}
        S5[Capture Payment]
        S6[Create Order]
        S7[Send Confirmation]
        S8[Handle Failure]
        
        S1 --> S2
        S2 --> S3
        S3 --> S4
        S4 -->|Success| S5
        S4 -->|Failed| S8
        S5 --> S6
        S6 --> S7
        S8 --> Retry[Retry Payment]
    end
    
    COD4 --> Complete[Payment Complete]
    S7 --> Complete
    Retry --> SelectMethod
    
    Complete --> UpdateInventory[Update Inventory]
    UpdateInventory --> NotifyCustomer[Notify Customer]
    NotifyCustomer --> End[End]
    
    style S4 fill:#ffd43b
    style Complete fill:#90ee90
    style S8 fill:#ff9999
```

## 8. Inventory Management

```mermaid
stateDiagram-v2
    [*] --> Available: Product Created
    
    Available --> Reserved: Add to Cart
    Reserved --> Available: Remove from Cart
    Reserved --> Reserved: Update Quantity
    
    Reserved --> Allocated: Order Placed
    Allocated --> Reserved: Order Cancelled
    
    Allocated --> Fulfilled: Item Shipped
    Fulfilled --> [*]
    
    Available --> OutOfStock: Last Item Reserved
    OutOfStock --> Available: Item Restocked
    
    note right of Available
        inventory_quantity > 0
        manage_inventory: true
    end note
    
    note right of Reserved
        Held in cart
        Released after timeout
    end note
    
    note right of Allocated
        Committed to order
        Deducted from inventory
    end note
    
    note right of Fulfilled
        Order completed
        Final state
    end note
```

## 9. Search and Filter Flow

```mermaid
flowchart LR
    subgraph "User Input"
        Search[Search Query]
        Filters[Filters]
        Sort[Sort Options]
    end
    
    subgraph "Query Building"
        Parse[Parse Input]
        BuildQuery[Build DB Query]
        Validate[Validate Params]
    end
    
    subgraph "Database"
        QueryDB[(Execute Query)]
        Index[Use Indexes]
        Join[Join Tables]
    end
    
    subgraph "Processing"
        Format[Format Results]
        Paginate[Apply Pagination]
        Enrich[Enrich Data]
    end
    
    subgraph "Response"
        Results[Product Results]
        Meta[Metadata]
        Total[Total Count]
    end
    
    Search --> Parse
    Filters --> Parse
    Sort --> Parse
    
    Parse --> Validate
    Validate --> BuildQuery
    BuildQuery --> QueryDB
    
    QueryDB --> Index
    QueryDB --> Join
    Index --> Format
    Join --> Format
    
    Format --> Paginate
    Paginate --> Enrich
    Enrich --> Results
    Enrich --> Meta
    Enrich --> Total
    
    style QueryDB fill:#336791
    style Results fill:#90ee90
```

## 10. Webhook Event Flow

```mermaid
sequenceDiagram
    participant Stripe
    participant Webhook
    participant Verify
    participant Handler
    participant Order
    participant Email
    participant Customer
    
    Stripe->>Webhook: POST /webhooks/stripe
    Webhook->>Verify: Verify Signature
    
    alt Valid Signature
        Verify->>Handler: Process Event
        
        alt payment_intent.succeeded
            Handler->>Order: Update Payment Status
            Order->>Email: Send Confirmation
            Email->>Customer: Order Confirmed
        else payment_intent.failed
            Handler->>Order: Mark as Failed
            Order->>Email: Send Failure Notice
            Email->>Customer: Payment Failed
        else charge.refunded
            Handler->>Order: Process Refund
            Order->>Email: Send Refund Notice
            Email->>Customer: Refund Processed
        end
        
        Handler-->>Webhook: 200 OK
    else Invalid Signature
        Verify-->>Webhook: 401 Unauthorized
    end
    
    Webhook-->>Stripe: Response
```

---

**Note**: These diagrams cover the database structure, API endpoints, data flows, caching strategies, payment processing, inventory management, and webhook handling.
# System Architecture Diagrams

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend - Next.js Storefront :3001"
        NextApp[Next.js App Router]
        Pages[Pages & Routes]
        Components[React Components]
        Middleware[Middleware<br/>Region Detection]
        SSR[Server-Side Rendering]
        ISR[Incremental Static Regeneration]
    end

    subgraph "Backend - Medusa.js :9000"
        StoreAPI[Store API<br/>Public Endpoints]
        AdminAPI[Admin API<br/>Protected Endpoints]
        Auth[Authentication<br/>JWT + Cookies]
        Modules[Custom Modules]
        Workflows[Workflows Engine]
        EventBus[Event Bus]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL<br/>Main Database)]
        Redis[(Redis<br/>Cache & Sessions)]
    end

    subgraph "External Services"
        Stripe[Stripe<br/>Payment Gateway]
        Email[Email Service]
    end

    Browser --> NextApp
    Mobile --> NextApp
    NextApp --> Middleware
    Middleware --> Pages
    Pages --> Components
    Components --> SSR
    SSR --> StoreAPI
    
    StoreAPI --> Auth
    StoreAPI --> Modules
    AdminAPI --> Auth
    AdminAPI --> Modules
    
    Modules --> Workflows
    Workflows --> EventBus
    
    Modules --> PostgreSQL
    Auth --> Redis
    StoreAPI --> Redis
    
    Modules --> Stripe
    Workflows --> Email

    style Browser fill:#e1f5ff
    style Mobile fill:#e1f5ff
    style NextApp fill:#61dafb
    style StoreAPI fill:#9d4edd
    style AdminAPI fill:#9d4edd
    style PostgreSQL fill:#336791
    style Redis fill:#dc382d
    style Stripe fill:#635bff
```

## 2. Request Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant N as Next.js<br/>:3001
    participant M as Medusa API<br/>:9000
    participant DB as PostgreSQL
    participant R as Redis

    U->>B: Visit website
    B->>N: GET /bd
    
    Note over N: Middleware detects region
    
    N->>M: GET /store/regions
    M->>DB: Query regions
    DB-->>M: Return regions
    M-->>N: Region data
    
    N->>M: GET /store/products
    M->>R: Check cache
    
    alt Cache Hit
        R-->>M: Cached products
    else Cache Miss
        M->>DB: Query products
        DB-->>M: Product data
        M->>R: Store in cache
    end
    
    M-->>N: Products data
    N-->>B: Rendered HTML
    B-->>U: Display page
```

## 3. Component Architecture

```mermaid
graph TD
    subgraph "Next.js App Structure"
        Root[app/]
        Layout[layout.tsx]
        Country[countryCode/]
        
        subgraph "Main Layout"
            MainLayout[(main)/layout.tsx]
            Home[page.tsx - Home]
            Cart[cart/page.tsx]
            Products[products/]
            Account[account/]
            Order[order/]
        end
        
        subgraph "Checkout Layout"
            CheckoutLayout[(checkout)/layout.tsx]
            CheckoutPage[checkout/page.tsx]
        end
    end
    
    Root --> Layout
    Layout --> Country
    Country --> MainLayout
    Country --> CheckoutLayout
    
    MainLayout --> Home
    MainLayout --> Cart
    MainLayout --> Products
    MainLayout --> Account
    MainLayout --> Order
    
    CheckoutLayout --> CheckoutPage
    
    subgraph "Modules"
        HomeModule[modules/home/]
        CartModule[modules/cart/]
        CheckoutModule[modules/checkout/]
        ProductModule[modules/products/]
        AccountModule[modules/account/]
        LayoutModule[modules/layout/]
    end
    
    Home -.uses.-> HomeModule
    Cart -.uses.-> CartModule
    CheckoutPage -.uses.-> CheckoutModule
    Products -.uses.-> ProductModule
    Account -.uses.-> AccountModule
    
    style CheckoutModule fill:#ffd43b
    style CheckoutPage fill:#ffd43b
```

## 4. Data Flow - Add to Cart

```mermaid
flowchart LR
    subgraph "User Action"
        Click[User clicks<br/>'Add to Cart']
    end
    
    subgraph "Frontend Processing"
        Action[addToCart<br/>Server Action]
        Cookie[Read cart_id<br/>from cookies]
    end
    
    subgraph "API Layer"
        API[POST /store/carts<br/>/:id/line-items]
        Validate[Validate<br/>variant_id]
    end
    
    subgraph "Backend Processing"
        Cart[Cart Service]
        Inventory[Check Inventory]
        Calculate[Calculate Prices]
    end
    
    subgraph "Data Layer"
        DB[(Save to<br/>PostgreSQL)]
        Cache[(Update<br/>Redis Cache)]
    end
    
    subgraph "Response"
        Revalidate[Revalidate<br/>'cart' tag]
        Update[Update UI]
    end
    
    Click --> Action
    Action --> Cookie
    Cookie --> API
    API --> Validate
    Validate --> Cart
    Cart --> Inventory
    Inventory --> Calculate
    Calculate --> DB
    Calculate --> Cache
    DB --> Revalidate
    Cache --> Revalidate
    Revalidate --> Update
    
    style Click fill:#e1f5ff
    style Update fill:#90ee90
    style DB fill:#336791
    style Cache fill:#dc382d
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant M as Medusa API
    participant DB as Database
    participant R as Redis

    U->>F: Enter credentials
    F->>M: POST /store/auth
    M->>DB: Query customer
    
    alt Valid Credentials
        DB-->>M: Customer found
        M->>M: Generate JWT
        M->>R: Store session
        M-->>F: Set JWT cookie
        F-->>U: Login successful
    else Invalid Credentials
        DB-->>M: Not found
        M-->>F: 401 Unauthorized
        F-->>U: Show error
    end
    
    Note over U,R: Subsequent Requests
    
    U->>F: Access protected route
    F->>M: Request with JWT cookie
    M->>R: Validate session
    R-->>M: Session valid
    M->>DB: Fetch user data
    DB-->>M: User data
    M-->>F: Protected resource
    F-->>U: Display content
```

## 6. Module Dependencies

```mermaid
graph TB
    subgraph "Core Modules"
        Product[Product Module]
        Cart[Cart Module]
        Order[Order Module]
        Customer[Customer Module]
        Payment[Payment Module]
        Fulfillment[Fulfillment Module]
    end
    
    subgraph "Custom Modules"
        COD[Cash on Delivery<br/>Payment Provider]
    end
    
    subgraph "External Services"
        Stripe[Stripe Service]
        Email[Email Service]
    end
    
    Cart --> Product
    Order --> Cart
    Order --> Customer
    Order --> Payment
    Order --> Fulfillment
    
    Payment --> Stripe
    Payment --> COD
    Fulfillment --> Email
    
    style COD fill:#ffd43b
    style Product fill:#e1f5ff
    style Cart fill:#e1f5ff
    style Order fill:#90ee90
```

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Frontend - Vercel"
            Edge[Edge Network<br/>CDN]
            NextProd[Next.js<br/>Production]
            Static[Static Assets]
        end
        
        subgraph "Backend - Railway/Heroku"
            API[Medusa API<br/>Server]
            Worker[Background<br/>Workers]
        end
        
        subgraph "Database Layer"
            NeonDB[(Neon PostgreSQL<br/>Cloud Database)]
            RedisCloud[(Redis Cloud<br/>Cache)]
        end
        
        subgraph "External Services"
            StripeProd[Stripe<br/>Production]
            EmailProd[SendGrid/SES<br/>Email]
        end
    end
    
    subgraph "Monitoring"
        Logs[Logging<br/>Service]
        Metrics[Metrics<br/>Dashboard]
        Alerts[Alert<br/>System]
    end
    
    Users[Users] --> Edge
    Edge --> NextProd
    Edge --> Static
    NextProd --> API
    
    API --> Worker
    API --> NeonDB
    API --> RedisCloud
    API --> StripeProd
    Worker --> EmailProd
    
    API --> Logs
    API --> Metrics
    Metrics --> Alerts
    
    style Edge fill:#90ee90
    style API fill:#9d4edd
    style NeonDB fill:#336791
    style RedisCloud fill:#dc382d
```

## 8. Environment Configuration Flow

```mermaid
graph LR
    subgraph "Development"
        DevEnv[.env.local]
        DevFront[Frontend<br/>localhost:3001]
        DevBack[Backend<br/>localhost:9000]
        DevDB[(Local PostgreSQL)]
        DevRedis[(Local Redis)]
    end
    
    subgraph "Production"
        ProdEnv[Environment<br/>Variables]
        ProdFront[Vercel<br/>Production]
        ProdBack[Railway/Heroku<br/>Production]
        ProdDB[(Neon<br/>Cloud)]
        ProdRedis[(Redis<br/>Cloud)]
    end
    
    DevEnv --> DevFront
    DevEnv --> DevBack
    DevBack --> DevDB
    DevBack --> DevRedis
    
    ProdEnv --> ProdFront
    ProdEnv --> ProdBack
    ProdBack --> ProdDB
    ProdBack --> ProdRedis
    
    style DevFront fill:#e1f5ff
    style ProdFront fill:#90ee90
    style DevBack fill:#ffd43b
    style ProdBack fill:#ffa500
```

---

**Note**: These diagrams use Mermaid syntax and will render automatically on GitHub, GitLab, and many markdown viewers.
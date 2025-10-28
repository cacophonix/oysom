# Frontend Components and User Interaction Diagrams

## 1. Next.js App Router Structure

```mermaid
graph TB
    subgraph "Root Layout"
        Root[app/layout.tsx]
        RootMeta[Metadata & Fonts]
    end
    
    subgraph "Country-Based Routing"
        Country["[countryCode]/"]
        CountryLayout[layout.tsx]
        
        subgraph "Main Layout Routes"
            MainLayout["(main)/layout.tsx"]
            Nav[Navigation Bar]
            Footer[Footer]
            
            HomePage[page.tsx - Home]
            CartPage[cart/page.tsx]
            ProductsPage["products/[handle]/page.tsx"]
            CategoriesPage["categories/[...category]/page.tsx"]
            CollectionsPage["collections/[handle]/page.tsx"]
            AccountPage[account/@dashboard/page.tsx]
            OrderPage["order/[id]/confirmed/page.tsx"]
        end
        
        subgraph "Checkout Layout Routes"
            CheckoutLayout["(checkout)/layout.tsx"]
            CheckoutNav[Minimal Navigation]
            CheckoutPage[checkout/page.tsx]
        end
    end
    
    Root --> RootMeta
    Root --> Country
    Country --> CountryLayout
    CountryLayout --> MainLayout
    CountryLayout --> CheckoutLayout
    
    MainLayout --> Nav
    MainLayout --> Footer
    MainLayout --> HomePage
    MainLayout --> CartPage
    MainLayout --> ProductsPage
    MainLayout --> CategoriesPage
    MainLayout --> CollectionsPage
    MainLayout --> AccountPage
    MainLayout --> OrderPage
    
    CheckoutLayout --> CheckoutNav
    CheckoutLayout --> CheckoutPage
    
    style CheckoutPage fill:#ffd43b
    style HomePage fill:#90ee90
    style CartPage fill:#e1f5ff
```

## 2. Component Hierarchy - Home Page

```mermaid
graph TD
    HomePage[Home Page] --> Hero[Hero Component]
    HomePage --> FeaturedProducts[Featured Products]
    HomePage --> Categories[Categories Showcase]
    
    Hero --> HeroImage[Banner Image]
    Hero --> HeroText[Text Content]
    Hero --> HeroCTA[Call to Action]
    
    FeaturedProducts --> ProductRail[Product Rail]
    ProductRail --> ProductCard1[Product Card]
    ProductRail --> ProductCard2[Product Card]
    ProductRail --> ProductCard3[Product Card]
    
    ProductCard1 --> CardImage[Product Image]
    ProductCard1 --> CardTitle[Product Title]
    ProductCard1 --> CardPrice[Product Price]
    ProductCard1 --> CardButton[Add to Cart]
    
    Categories --> CategoryCard1[Category Card]
    Categories --> CategoryCard2[Category Card]
    Categories --> CategoryCard3[Category Card]
    
    style HomePage fill:#90ee90
    style ProductCard1 fill:#e1f5ff
    style CardButton fill:#ffd43b
```

## 3. Component Hierarchy - Product Page

```mermaid
graph TD
    ProductPage[Product Page] --> ImageGallery[Image Gallery]
    ProductPage --> ProductInfo[Product Info]
    ProductPage --> ProductTabs[Product Tabs]
    ProductPage --> RelatedProducts[Related Products]
    
    ImageGallery --> MainImage[Main Image]
    ImageGallery --> Thumbnails[Thumbnail List]
    
    ProductInfo --> Title[Product Title]
    ProductInfo --> Price[Product Price]
    ProductInfo --> Description[Short Description]
    ProductInfo --> ProductActions[Product Actions]
    
    ProductActions --> VariantSelect[Variant Selector]
    ProductActions --> QuantityInput[Quantity Input]
    ProductActions --> AddToCartBtn[Add to Cart Button]
    
    VariantSelect --> SizeSelect[Size Options]
    VariantSelect --> ColorSelect[Color Options]
    
    ProductTabs --> DescriptionTab[Description]
    ProductTabs --> ShippingTab[Shipping Info]
    ProductTabs --> ReviewsTab[Reviews]
    
    AddToCartBtn --> CartModal[Cart Slider]
    CartModal --> CartItems[Cart Items List]
    CartModal --> CartTotals[Cart Totals]
    CartModal --> CheckoutBtn[Go to Checkout]
    
    style ProductPage fill:#e1f5ff
    style AddToCartBtn fill:#ffd43b
    style CheckoutBtn fill:#90ee90
```

## 4. Component Hierarchy - Cart Page

```mermaid
graph TD
    CartPage[Cart Page] --> CartCheck{Cart Empty?}
    
    CartCheck -->|Yes| EmptyState[Empty Cart Message]
    CartCheck -->|No| CartContent
    
    EmptyState --> ExploreCTA[Explore Products Button]
    
    CartContent[Cart Content] --> ItemsList[Cart Items List]
    CartContent --> Summary[Cart Summary]
    
    ItemsList --> CartItem1[Cart Item Component]
    ItemsList --> CartItem2[Cart Item Component]
    
    CartItem1 --> ItemImage[Product Image]
    CartItem1 --> ItemDetails[Product Details]
    CartItem1 --> ItemQuantity[Quantity Control]
    CartItem1 --> ItemPrice[Price]
    CartItem1 --> RemoveBtn[Remove Button]
    
    ItemQuantity --> DecreaseBtn[- Button]
    ItemQuantity --> QuantityDisplay[Quantity]
    ItemQuantity --> IncreaseBtn[+ Button]
    
    Summary --> Subtotal[Subtotal]
    Summary --> ShippingPreview[Shipping Estimate]
    Summary --> Total[Total]
    Summary --> CheckoutButton[Go to Checkout]
    
    CheckoutButton --> CheckoutPage[Navigate to Checkout]
    
    style CartPage fill:#e1f5ff
    style CheckoutButton fill:#ffd43b
    style CheckoutPage fill:#90ee90
```

## 5. Component Hierarchy - Checkout Page

```mermaid
graph TD
    CheckoutPage[Checkout Page] --> CheckoutForm[Checkout Form]
    CheckoutPage --> OrderSummary[Order Summary Sidebar]
    
    subgraph "Checkout Form Components"
        CheckoutForm --> Addresses[Addresses Component]
        CheckoutForm --> Shipping[Shipping Component]
        CheckoutForm --> Payment[Payment Component]
        CheckoutForm --> Review[Review Component]
        
        Addresses --> AddressState{Address State}
        AddressState -->|Open| AddressForm[Shipping Address Form]
        AddressState -->|Closed| AddressSummary[Address Summary]
        
        AddressForm --> NameInput[Name Input]
        AddressForm --> AddressInput[Address Input]
        AddressForm --> PoliceStationInput[Police Station Input ⭐]
        AddressForm --> DistrictInput[District Input]
        AddressForm --> PhoneInput[Phone Input]
        AddressForm --> EmailInput[Email Input]
        AddressForm --> BillingCheckbox[Same as Billing Checkbox]
        AddressForm --> SubmitAddressBtn[Continue to Delivery]
        
        Shipping --> ShippingOptions[Shipping Options List]
        ShippingOptions --> StandardOption[Standard Shipping]
        ShippingOptions --> ExpressOption[Express Delivery]
        ShippingOptions --> FreeOption[Free Shipping]
        
        Payment --> PaymentMethods[Payment Methods]
        PaymentMethods --> CODOption[Cash on Delivery]
        PaymentMethods --> StripeOption[Credit/Debit Card]
        
        StripeOption --> CardElement[Stripe Card Element]
        
        Review --> ReviewItems[Review Items]
        Review --> ReviewAddress[Review Address]
        Review --> ReviewShipping[Review Shipping]
        Review --> PlaceOrderBtn[Place Order Button]
    end
    
    OrderSummary --> SummaryItems[Items List]
    OrderSummary --> SummaryPricing[Pricing Breakdown]
    OrderSummary --> DiscountCode[Discount Code Input]
    
    SummaryPricing --> ItemsTotal[Items Total]
    SummaryPricing --> ShippingCost[Shipping Cost]
    SummaryPricing --> TaxAmount[Tax Amount]
    SummaryPricing --> GrandTotal[Grand Total]
    
    PlaceOrderBtn --> ProcessOrder[Process Order]
    ProcessOrder --> ConfirmationPage[Order Confirmation]
    
    style CheckoutPage fill:#ffd43b
    style AddressForm fill:#ffe6e6
    style PoliceStationInput fill:#90ee90
    style PlaceOrderBtn fill:#90ee90
    style ConfirmationPage fill:#90ee90
```

## 6. State Management Flow

```mermaid
flowchart TB
    subgraph "Global State"
        Cart[Cart State]
        User[User State]
        Region[Region State]
    end
    
    subgraph "Page State"
        ProductPage[Product Page State]
        CartPage[Cart Page State]
        CheckoutPage[Checkout Page State]
    end
    
    subgraph "Component State"
        AddressForm[Address Form State]
        QuantityInput[Quantity State]
        ModalState[Modal State]
    end
    
    subgraph "Server State"
        Products[Products Data]
        Orders[Orders Data]
        Customer[Customer Data]
    end
    
    Cart --> CartPage
    Cart --> CheckoutPage
    User --> CheckoutPage
    Region --> ProductPage
    
    ProductPage --> QuantityInput
    CheckoutPage --> AddressForm
    CartPage --> ModalState
    
    Products --> ProductPage
    Customer --> User
    Orders --> User
    
    style Cart fill:#ffd43b
    style CheckoutPage fill:#90ee90
    style AddressForm fill:#e1f5ff
```

## 7. User Interaction Flow - Shopping Journey

```mermaid
journey
    title Complete Shopping Experience
    section Browse
      Visit Homepage: 5: User
      View Featured Products: 5: User
      Browse Categories: 4: User
      Search Products: 4: User
    section Product Discovery
      Click Product: 5: User
      View Product Details: 5: User
      Check Reviews: 3: User
      Select Variant: 4: User
    section Add to Cart
      Enter Quantity: 4: User
      Click Add to Cart: 5: User
      View Cart Slider: 5: User
      Continue Shopping: 3: User
    section Cart Review
      Go to Cart Page: 5: User
      Review Items: 4: User
      Update Quantities: 3: User
      Apply Discount: 2: User
    section Checkout
      Click Checkout: 5: User
      Fill Address Form: 3: User
      Select Shipping: 4: User
      Choose Payment: 4: User
      Review Order: 4: User
      Place Order: 5: User
    section Post-Purchase
      View Confirmation: 5: User
      Receive Email: 5: User
      Track Order: 4: User
```

## 8. Responsive Design Breakpoints

```mermaid
graph LR
    subgraph "Mobile - 320px to 767px"
        M1[Single Column Layout]
        M2[Hamburger Menu]
        M3[Stacked Components]
        M4[Mobile-First Design]
    end
    
    subgraph "Tablet - 768px to 1023px"
        T1[Two Column Layout]
        T2[Expandable Menu]
        T3[Grid View 2 cols]
        T4[Touch Optimized]
    end
    
    subgraph "Desktop - 1024px+"
        D1[Multi Column Layout]
        D2[Full Navigation]
        D3[Grid View 3-4 cols]
        D4[Hover States]
    end
    
    M1 -.scales to.-> T1
    T1 -.scales to.-> D1
    M2 -.expands to.-> T2
    T2 -.expands to.-> D2
    M3 -.grows to.-> T3
    T3 -.grows to.-> D3
    
    style M1 fill:#e1f5ff
    style T1 fill:#ffd43b
    style D1 fill:#90ee90
```

## 9. Event Handling Flow

```mermaid
flowchart TD
    UserAction[User Action] --> EventType{Event Type}
    
    EventType -->|Click| ClickHandler[Click Handler]
    EventType -->|Input| InputHandler[Input Handler]
    EventType -->|Submit| SubmitHandler[Submit Handler]
    EventType -->|Scroll| ScrollHandler[Scroll Handler]
    
    ClickHandler --> ValidateClick{Valid Target?}
    ValidateClick -->|Yes| ExecuteClick[Execute Action]
    ValidateClick -->|No| IgnoreClick[Ignore]
    
    InputHandler --> Debounce[Debounce Input]
    Debounce --> UpdateState[Update State]
    UpdateState --> Validate[Validate Input]
    
    Validate -->|Valid| ShowValid[Show Valid State]
    Validate -->|Invalid| ShowError[Show Error]
    
    SubmitHandler --> PreventDefault[Prevent Default]
    PreventDefault --> ValidateForm{Form Valid?}
    
    ValidateForm -->|Yes| ServerAction[Server Action]
    ValidateForm -->|No| DisplayErrors[Display Errors]
    
    ServerAction --> Loading[Show Loading]
    Loading --> APICall[API Call]
    APICall --> Success{Success?}
    
    Success -->|Yes| UpdateUI[Update UI]
    Success -->|No| ShowAPIError[Show Error]
    
    UpdateUI --> Revalidate[Revalidate Cache]
    Revalidate --> Complete[Complete]
    
    ScrollHandler --> CheckPosition[Check Scroll Position]
    CheckPosition --> InfiniteLoad{Load More?}
    InfiniteLoad -->|Yes| FetchMore[Fetch More Items]
    InfiniteLoad -->|No| Wait[Wait]
    
    style ExecuteClick fill:#90ee90
    style ShowError fill:#ff9999
    style UpdateUI fill:#90ee90
    style ShowAPIError fill:#ff9999
```

## 10. Performance Optimization Strategy

```mermaid
graph TB
    subgraph "Loading Strategies"
        SSR[Server-Side Rendering]
        SSG[Static Site Generation]
        ISR[Incremental Static Regeneration]
        CSR[Client-Side Rendering]
    end
    
    subgraph "Code Splitting"
        Route[Route-based Splitting]
        Component[Component-based Splitting]
        Dynamic[Dynamic Imports]
    end
    
    subgraph "Image Optimization"
        NextImage[Next.js Image Component]
        Lazy[Lazy Loading]
        WebP[WebP Format]
        Responsive[Responsive Images]
    end
    
    subgraph "Caching"
        Browser[Browser Cache]
        CDN[CDN Cache]
        Redis[Redis Cache]
        SWR[SWR Cache]
    end
    
    subgraph "Bundle Optimization"
        TreeShake[Tree Shaking]
        Minify[Minification]
        Compress[Compression]
        Critical[Critical CSS]
    end
    
    HomePage[Home Page] --> SSG
    ProductPage[Product Page] --> ISR
    CartPage[Cart Page] --> CSR
    CheckoutPage[Checkout Page] --> SSR
    
    SSG --> Route
    ISR --> Route
    Route --> Component
    Component --> Dynamic
    
    Dynamic --> NextImage
    NextImage --> Lazy
    Lazy --> WebP
    WebP --> Responsive
    
    Responsive --> CDN
    CDN --> Browser
    Browser --> Redis
    Redis --> SWR
    
    SWR --> TreeShake
    TreeShake --> Minify
    Minify --> Compress
    Compress --> Critical
    
    style SSG fill:#90ee90
    style ISR fill:#ffd43b
    style CDN fill:#e1f5ff
    style Critical fill:#90ee90
```

## 11. Error Boundary Structure

```mermaid
graph TD
    RootError[Root Error Boundary] --> LayoutError[Layout Error Boundary]
    
    LayoutError --> PageError1[Home Page Error]
    LayoutError --> PageError2[Product Page Error]
    LayoutError --> PageError3[Cart Page Error]
    LayoutError --> CheckoutError[Checkout Error Boundary]
    
    CheckoutError --> AddressError[Address Form Error]
    CheckoutError --> ShippingError[Shipping Error]
    CheckoutError --> PaymentError[Payment Error]
    
    PageError1 --> Fallback1[Show Home Fallback]
    PageError2 --> Fallback2[Show Product Fallback]
    PageError3 --> Fallback3[Show Cart Fallback]
    
    AddressError --> FallbackAddress[Show Address Error]
    ShippingError --> FallbackShipping[Show Shipping Error]
    PaymentError --> FallbackPayment[Show Payment Error]
    
    Fallback1 --> Recovery1[Reload Page]
    Fallback2 --> Recovery2[Go to Home]
    Fallback3 --> Recovery3[Clear Cart]
    
    FallbackAddress --> RecoveryAddress[Reset Form]
    FallbackShipping --> RecoveryShipping[Reload Options]
    FallbackPayment --> RecoveryPayment[Retry Payment]
    
    style RootError fill:#ff9999
    style CheckoutError fill:#ffd43b
    style Recovery1 fill:#90ee90
```

## 12. Accessibility (a11y) Implementation

```mermaid
mindmap
  root((Accessibility))
    Keyboard Navigation
      Tab Order
      Skip Links
      Focus Management
      Keyboard Shortcuts
    Screen Reader
      ARIA Labels
      Semantic HTML
      Alt Text
      Role Attributes
    Visual
      Color Contrast
      Focus Indicators
      Font Sizing
      Responsive Text
    Forms
      Label Association
      Error Messages
      Required Fields
      Input Validation
    Interactive
      Button States
      Loading States
      Error States
      Success Feedback
```

---

**Note**: These diagrams visualize the frontend component structure, user interactions, state management, responsive design, performance optimizations, and accessibility features.
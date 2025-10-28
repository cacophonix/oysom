# Checkout Flow Diagrams

## 1. Complete Checkout User Journey

```mermaid
flowchart TD
    Start([User on Product Page]) --> AddCart[Add Item to Cart]
    AddCart --> ViewCart{View Cart?}
    
    ViewCart -->|Yes| CartPage[Cart Page]
    ViewCart -->|No| Continue[Continue Shopping]
    Continue --> Start
    
    CartPage --> CheckCart{Cart Empty?}
    CheckCart -->|Yes| EmptyMsg[Show Empty Message]
    CheckCart -->|No| ProceedCheckout[Click 'Go to Checkout']
    
    EmptyMsg --> Start
    
    ProceedCheckout --> CheckoutPage[/Checkout Page Loads/]
    CheckoutPage --> CheckAuth{User Logged In?}
    
    CheckAuth -->|No| GuestCheckout[Guest Checkout]
    CheckAuth -->|Yes| LoadAddress[Load Saved Addresses]
    
    GuestCheckout --> AddressForm
    LoadAddress --> ShowSaved[Show Saved Addresses]
    ShowSaved --> SelectSaved{Select Saved?}
    
    SelectSaved -->|Yes| PopulateForm[Populate Form]
    SelectSaved -->|No| AddressForm
    
    PopulateForm --> AddressForm[📍 Address Form]
    
    AddressForm --> FillRequired[Fill Required Fields:<br/>✓ Name<br/>✓ Address<br/>✓ Police Station<br/>✓ District<br/>✓ Phone]
    
    FillRequired --> ValidateForm{Form Valid?}
    
    ValidateForm -->|No| ShowErrors[Show Validation Errors]
    ShowErrors --> FillRequired
    
    ValidateForm -->|Yes| SubmitAddress[Click 'Continue to Delivery']
    
    SubmitAddress --> SaveAddress[Save Address to Backend]
    SaveAddress --> AddressSaved{Saved Successfully?}
    
    AddressSaved -->|No| SaveError[Show Error Message]
    SaveError --> FillRequired
    
    AddressSaved -->|Yes| ShippingStep[🚚 Shipping Method Step]
    
    ShippingStep --> LoadShipping[Load Available Methods]
    LoadShipping --> SelectShipping[Select Shipping Method]
    SelectShipping --> ShippingSelected[Shipping Method Saved]
    
    ShippingSelected --> PaymentStep[💳 Payment Method Step]
    
    PaymentStep --> LoadPayment[Load Payment Methods]
    LoadPayment --> SelectPayment{Select Payment}
    
    SelectPayment -->|Cash on Delivery| CODSelected[COD Selected]
    SelectPayment -->|Credit Card| StripeSelected[Stripe Selected]
    
    CODSelected --> ReviewOrder
    StripeSelected --> EnterCard[Enter Card Details]
    EnterCard --> ValidateCard{Card Valid?}
    
    ValidateCard -->|No| CardError[Show Card Error]
    CardError --> EnterCard
    ValidateCard -->|Yes| ReviewOrder
    
    ReviewOrder[📋 Review Order]
    ReviewOrder --> CheckReview{All Complete?}
    
    CheckReview -->|No| ReviewError[Place Order Button<br/>Disabled]
    ReviewError -->|Fix Issues| AddressForm
    
    CheckReview -->|Yes| PlaceOrderBtn[Place Order Button<br/>Enabled ✓]
    
    PlaceOrderBtn --> ClickPlace[User Clicks<br/>'Place Order']
    ClickPlace --> ProcessOrder[Process Order]
    
    ProcessOrder --> PaymentProcess{Payment Type}
    
    PaymentProcess -->|COD| MarkPending[Mark Payment Pending]
    PaymentProcess -->|Stripe| ChargeCard[Charge Credit Card]
    
    ChargeCard --> CardSuccess{Payment Success?}
    CardSuccess -->|No| PaymentFailed[Payment Failed]
    PaymentFailed --> PaymentStep
    
    CardSuccess -->|Yes| CreateOrder
    MarkPending --> CreateOrder[Create Order in DB]
    
    CreateOrder --> OrderCreated{Order Created?}
    
    OrderCreated -->|No| OrderError[Show Error Message]
    OrderError --> ReviewOrder
    
    OrderCreated -->|Yes| SendEmail[Send Confirmation Email]
    SendEmail --> Confirmation[✅ Order Confirmation Page]
    
    Confirmation --> ShowOrderDetails[Show Order Details:<br/>• Order Number<br/>• Items<br/>• Total<br/>• Delivery Address]
    ShowOrderDetails --> End([Checkout Complete])
    
    style Start fill:#e1f5ff
    style AddressForm fill:#ffd43b
    style ShippingStep fill:#90ee90
    style PaymentStep fill:#ff9999
    style ReviewOrder fill:#c7b3ff
    style Confirmation fill:#90ee90
    style End fill:#90ee90
```

## 2. Address Form Component Flow

```mermaid
stateDiagram-v2
    [*] --> CheckAddress: Page Load
    
    CheckAddress --> FormClosed: Has Address
    CheckAddress --> FormOpen: No Address
    
    state FormOpen {
        [*] --> EmptyForm
        EmptyForm --> FillingForm: User Types
        FillingForm --> EmptyForm: Clear
        FillingForm --> Validating: Click Submit
        
        state Validating {
            [*] --> CheckName
            CheckName --> CheckAddress: Valid
            CheckAddress --> CheckPoliceStation: Valid
            CheckPoliceStation --> CheckDistrict: Valid
            CheckDistrict --> CheckPhone: Valid
            CheckPhone --> [*]: All Valid
        }
        
        Validating --> ShowErrors: Invalid
        ShowErrors --> FillingForm: Fix Errors
        Validating --> SubmitForm: Valid
    }
    
    SubmitForm --> SavingAddress
    SavingAddress --> FormClosed: Success
    SavingAddress --> FormOpen: Error
    
    state FormClosed {
        [*] --> DisplaySummary
        DisplaySummary --> [*]
    }
    
    FormClosed --> FormOpen: Click Edit
    FormClosed --> [*]: Complete
```

## 3. Payment Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant PB as Payment Button
    participant M as Medusa API
    participant P as Payment Provider
    participant DB as Database
    
    U->>F: Clicks 'Place Order'
    F->>PB: Trigger handlePayment()
    
    PB->>PB: Check notReady status
    
    alt Not Ready (Missing Info)
        PB-->>U: Button Disabled
    else Ready
        PB->>M: POST /store/orders
        
        alt Cash on Delivery
            M->>DB: Create Order
            M->>DB: Set payment_status='pending'
            DB-->>M: Order Created
            M-->>PB: Order Response
            PB-->>F: Redirect to Confirmation
        else Stripe Payment
            M->>P: Initiate Payment Intent
            P-->>M: Client Secret
            M-->>PB: Payment Intent
            PB->>P: Confirm Card Payment
            
            alt Payment Success
                P->>M: Webhook: payment_succeeded
                M->>DB: Create Order
                M->>DB: Set payment_status='paid'
                DB-->>M: Order Created
                P-->>PB: Payment Confirmed
                PB-->>F: Redirect to Confirmation
            else Payment Failed
                P-->>PB: Payment Error
                PB-->>U: Show Error Message
            end
        end
    end
    
    F->>U: Display Confirmation Page
```

## 4. Component State Management

```mermaid
graph TB
    subgraph "Checkout Page State"
        PageState[Page State]
        
        subgraph "Address State"
            AddressOpen[isOpen: boolean]
            AddressData[formData: object]
            AddressValid[isValid: boolean]
            AddressSaved[isSaved: boolean]
        end
        
        subgraph "Shipping State"
            ShippingMethods[availableMethods: array]
            SelectedShipping[selectedMethod: object]
        end
        
        subgraph "Payment State"
            PaymentMethods[availableMethods: array]
            SelectedPayment[selectedMethod: string]
            PaymentReady[isReady: boolean]
        end
        
        subgraph "Order State"
            CartData[cart: object]
            OrderSubmitting[isSubmitting: boolean]
            OrderError[error: string]
        end
    end
    
    PageState --> AddressState
    PageState --> ShippingState
    PageState --> PaymentState
    PageState --> OrderState
    
    AddressState --> ShippingState
    ShippingState --> PaymentState
    PaymentState --> OrderState
    
    style AddressState fill:#ffd43b
    style ShippingState fill:#90ee90
    style PaymentState fill:#ff9999
    style OrderState fill:#c7b3ff
```

## 5. Form Validation Flow

```mermaid
flowchart TD
    Submit[User Clicks Submit] --> StartValidation[Start Validation]
    
    StartValidation --> CheckName{Name<br/>Filled?}
    CheckName -->|No| NameError[Add Name Error]
    CheckName -->|Yes| CheckAddress
    
    CheckAddress{Address<br/>Filled?}
    CheckAddress -->|No| AddressError[Add Address Error]
    CheckAddress -->|Yes| CheckPolice
    
    CheckPolice{Police Station<br/>Filled?}
    CheckPolice -->|No| PoliceError[Add Police Station Error]
    CheckPolice -->|Yes| CheckDistrict
    
    CheckDistrict{District<br/>Filled?}
    CheckDistrict -->|No| DistrictError[Add District Error]
    CheckDistrict -->|Yes| CheckPhone
    
    CheckPhone{Phone<br/>Filled?}
    CheckPhone -->|No| PhoneError[Add Phone Error]
    CheckPhone -->|Yes| CheckEmail
    
    CheckEmail{Email<br/>Valid?}
    CheckEmail -->|Invalid| EmailError[Add Email Error]
    CheckEmail -->|Valid/Empty| AllChecks
    
    NameError --> CollectErrors
    AddressError --> CollectErrors
    PoliceError --> CollectErrors
    DistrictError --> CollectErrors
    PhoneError --> CollectErrors
    EmailError --> CollectErrors
    
    CollectErrors[Collect All Errors] --> DisplayErrors[Display Error Messages]
    DisplayErrors --> StayOnForm[Stay on Form]
    
    AllChecks[All Validations Pass] --> SubmitForm[Submit Form to API]
    SubmitForm --> APIValidation{API<br/>Validation}
    
    APIValidation -->|Success| SaveSuccess[Save Successful]
    APIValidation -->|Error| APIError[Show API Error]
    
    APIError --> StayOnForm
    SaveSuccess --> NextStep[Proceed to Next Step]
    
    style CheckName fill:#ffe6e6
    style CheckAddress fill:#ffe6e6
    style CheckPolice fill:#ffe6e6
    style CheckDistrict fill:#ffe6e6
    style CheckPhone fill:#ffe6e6
    style SaveSuccess fill:#90ee90
```

## 6. Cart to Order Transformation

```mermaid
graph LR
    subgraph "Cart Data"
        CartItems[Line Items]
        CartShipping[Shipping Address]
        CartBilling[Billing Address]
        CartMethod[Shipping Method]
        CartPayment[Payment Info]
        CartEmail[Customer Email]
    end
    
    subgraph "Processing"
        Validate[Validate All Data]
        Calculate[Calculate Totals]
        Reserve[Reserve Inventory]
        Process[Process Payment]
    end
    
    subgraph "Order Data"
        OrderItems[Order Items]
        OrderShipping[Shipping Details]
        OrderBilling[Billing Details]
        OrderTotal[Total Amount]
        OrderPayment[Payment Status]
        OrderCustomer[Customer Info]
        OrderStatus[Order Status]
    end
    
    CartItems --> Validate
    CartShipping --> Validate
    CartBilling --> Validate
    CartMethod --> Validate
    CartPayment --> Validate
    CartEmail --> Validate
    
    Validate --> Calculate
    Calculate --> Reserve
    Reserve --> Process
    
    Process --> OrderItems
    Process --> OrderShipping
    Process --> OrderBilling
    Process --> OrderTotal
    Process --> OrderPayment
    Process --> OrderCustomer
    Process --> OrderStatus
    
    style Process fill:#ffd43b
    style OrderStatus fill:#90ee90
```

## 7. Error Handling Flow

```mermaid
flowchart TD
    Start[Checkout Process] --> Step1[Address Form]
    
    Step1 --> E1{Error?}
    E1 -->|Validation| ShowE1[Show Field Errors]
    E1 -->|API Error| ShowE2[Show API Error Message]
    E1 -->|No Error| Step2
    
    ShowE1 --> Retry1[User Fixes & Retries]
    ShowE2 --> Retry1
    Retry1 --> Step1
    
    Step2[Shipping Method] --> E2{Error?}
    E2 -->|No Methods| ShowE3[Show No Methods Message]
    E2 -->|API Error| ShowE4[Show API Error]
    E2 -->|No Error| Step3
    
    ShowE3 --> Contact[Contact Support]
    ShowE4 --> Retry2[Retry]
    Retry2 --> Step2
    
    Step3[Payment] --> E3{Error?}
    E3 -->|Card Declined| ShowE5[Show Card Error]
    E3 -->|Network Error| ShowE6[Show Network Error]
    E3 -->|No Error| Step4
    
    ShowE5 --> Retry3[Try Different Card]
    ShowE6 --> Retry4[Retry Payment]
    Retry3 --> Step3
    Retry4 --> Step3
    
    Step4[Place Order] --> E4{Error?}
    E4 -->|Order Creation Failed| ShowE7[Show Order Error]
    E4 -->|Timeout| ShowE8[Show Timeout Error]
    E4 -->|No Error| Success
    
    ShowE7 --> CheckOrder[Check Order Status]
    ShowE8 --> CheckOrder
    CheckOrder --> Exists{Order Exists?}
    
    Exists -->|Yes| Success[Order Confirmation]
    Exists -->|No| Retry5[Retry Order]
    Retry5 --> Step4
    
    Success --> End[Complete]
    
    style ShowE1 fill:#ff9999
    style ShowE2 fill:#ff9999
    style ShowE3 fill:#ff9999
    style ShowE4 fill:#ff9999
    style ShowE5 fill:#ff9999
    style ShowE6 fill:#ff9999
    style ShowE7 fill:#ff9999
    style ShowE8 fill:#ff9999
    style Success fill:#90ee90
```

## 8. Recent Bug Fix - Input Clearing Issue

```mermaid
flowchart TD
    subgraph "Before Fix ❌"
        B1[User Types in Form]
        B2[Cart State Updates]
        B3[useEffect Triggered]
        B4[Form Data Reset]
        B5[User Input Lost]
        
        B1 --> B2
        B2 --> B3
        B3 --> B4
        B4 --> B5
    end
    
    subgraph "After Fix ✅"
        A1[User Types in Form]
        A2[Cart State Updates]
        A3[useEffect Checks If Form Empty]
        A4{Form<br/>Has Data?}
        A5[Skip Reset]
        A6[Keep User Input]
        
        A1 --> A2
        A2 --> A3
        A3 --> A4
        A4 -->|Yes| A5
        A4 -->|No| Reset[Reset from Cart]
        A5 --> A6
    end
    
    subgraph "Code Change"
        Before["useEffect(() => {<br/>  setFormAddress(cart.address)<br/>}, [cart])"]
        After["useEffect(() => {<br/>  if (!hasFormData) {<br/>    setFormAddress(cart.address)<br/>  }<br/>}, [])"]
    end
    
    B5 -.Problem.-> After
    
    style B4 fill:#ff9999
    style B5 fill:#ff9999
    style A5 fill:#90ee90
    style A6 fill:#90ee90
    style After fill:#90ee90
```

---

**Note**: These diagrams visualize the complete checkout flow including all steps, validations, error handling, and the recent bug fixes implemented.
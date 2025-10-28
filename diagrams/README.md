# Ojsom E-Commerce Platform - Visual Documentation

This directory contains comprehensive diagrams that visualize the entire architecture, workflows, and components of the Ojsom e-commerce platform.

## 📊 Available Diagrams

### 1. [System Architecture](./SYSTEM_ARCHITECTURE.md)
**8 diagrams covering the overall system design**

- **High-Level System Architecture** - Complete system overview with all layers
- **Request Flow Architecture** - Sequence diagram showing how requests are processed
- **Component Architecture** - Next.js app structure and routing
- **Data Flow - Add to Cart** - Step-by-step cart addition process
- **Authentication Flow** - Login and session management
- **Module Dependencies** - How different modules interact
- **Deployment Architecture** - Production environment setup
- **Environment Configuration Flow** - Dev vs Production configs

**Best for**: Understanding the big picture and how all pieces fit together

---

### 2. [Checkout Flow](./CHECKOUT_FLOW.md)
**8 diagrams focusing on the checkout process**

- **Complete Checkout User Journey** - End-to-end checkout experience
- **Address Form Component Flow** - State machine for address form
- **Payment Processing Flow** - Payment method handling
- **Component State Management** - State organization in checkout
- **Form Validation Flow** - Validation logic and error handling
- **Cart to Order Transformation** - How cart becomes an order
- **Error Handling Flow** - Comprehensive error management
- **Recent Bug Fix - Input Clearing Issue** - Before/after comparison

**Best for**: Understanding the checkout process and recent improvements

---

### 3. [Database and API](./DATABASE_AND_API.md)
**10 diagrams covering data and API layers**

- **Database Schema Overview** - Complete ER diagram with all entities
- **API Endpoint Structure** - All Store and Admin endpoints
- **API Request/Response Flow** - Request lifecycle
- **Cart State Management** - Cart state machine
- **Data Flow - Product to Order** - Product journey through the system
- **Cache Strategy** - Redis caching implementation
- **Payment Processing Flow** - Detailed payment flows (COD & Stripe)
- **Inventory Management** - Stock tracking state machine
- **Search and Filter Flow** - Product search implementation
- **Webhook Event Flow** - Stripe webhook handling

**Best for**: Backend developers and database designers

---

### 4. [Frontend Components](./FRONTEND_COMPONENTS.md)
**12 diagrams covering the frontend**

- **Next.js App Router Structure** - Complete routing hierarchy
- **Component Hierarchy - Home Page** - Home page breakdown
- **Component Hierarchy - Product Page** - Product page structure
- **Component Hierarchy - Cart Page** - Cart page components
- **Component Hierarchy - Checkout Page** - Checkout page details ⭐
- **State Management Flow** - Global and local state
- **User Interaction Flow - Shopping Journey** - Customer journey map
- **Responsive Design Breakpoints** - Mobile, tablet, desktop views
- **Event Handling Flow** - User interaction processing
- **Performance Optimization Strategy** - Speed and efficiency
- **Error Boundary Structure** - Error handling hierarchy
- **Accessibility (a11y) Implementation** - Accessibility features

**Best for**: Frontend developers and UX designers

---

## 🎯 Quick Navigation by Role

### For New Developers
Start here to understand the project:
1. [System Architecture - High-Level](./SYSTEM_ARCHITECTURE.md#1-high-level-system-architecture)
2. [Frontend Components - App Router Structure](./FRONTEND_COMPONENTS.md#1-nextjs-app-router-structure)
3. [Database Schema Overview](./DATABASE_AND_API.md#1-database-schema-overview)

### For Frontend Developers
Focus on these diagrams:
1. [Next.js App Router Structure](./FRONTEND_COMPONENTS.md#1-nextjs-app-router-structure)
2. [Component Hierarchies](./FRONTEND_COMPONENTS.md#2-component-hierarchy---home-page)
3. [Checkout Flow](./CHECKOUT_FLOW.md#1-complete-checkout-user-journey)
4. [State Management](./FRONTEND_COMPONENTS.md#6-state-management-flow)
5. [Event Handling](./FRONTEND_COMPONENTS.md#9-event-handling-flow)

### For Backend Developers
Focus on these diagrams:
1. [Database Schema](./DATABASE_AND_API.md#1-database-schema-overview)
2. [API Endpoints](./DATABASE_AND_API.md#2-api-endpoint-structure)
3. [Cart State Management](./DATABASE_AND_API.md#4-cart-state-management)
4. [Payment Processing](./DATABASE_AND_API.md#7-payment-processing-flow)
5. [Cache Strategy](./DATABASE_AND_API.md#6-cache-strategy)

### For Product Managers
Focus on these diagrams:
1. [User Journey](./FRONTEND_COMPONENTS.md#7-user-interaction-flow---shopping-journey)
2. [Checkout Flow](./CHECKOUT_FLOW.md#1-complete-checkout-user-journey)
3. [Payment Processing](./DATABASE_AND_API.md#7-payment-processing-flow)
4. [Error Handling](./CHECKOUT_FLOW.md#7-error-handling-flow)

### For DevOps Engineers
Focus on these diagrams:
1. [Deployment Architecture](./SYSTEM_ARCHITECTURE.md#7-deployment-architecture)
2. [Environment Configuration](./SYSTEM_ARCHITECTURE.md#8-environment-configuration-flow)
3. [Cache Strategy](./DATABASE_AND_API.md#6-cache-strategy)
4. [Request Flow](./SYSTEM_ARCHITECTURE.md#2-request-flow-architecture)

### For QA Testers
Focus on these diagrams:
1. [Complete Checkout Journey](./CHECKOUT_FLOW.md#1-complete-checkout-user-journey)
2. [Form Validation Flow](./CHECKOUT_FLOW.md#5-form-validation-flow)
3. [Error Handling Flow](./CHECKOUT_FLOW.md#7-error-handling-flow)
4. [Payment Processing](./DATABASE_AND_API.md#7-payment-processing-flow)

---

## 🔍 Diagrams by Feature

### Shopping Experience
- [User Shopping Journey](./FRONTEND_COMPONENTS.md#7-user-interaction-flow---shopping-journey)
- [Product Page Components](./FRONTEND_COMPONENTS.md#3-component-hierarchy---product-page)
- [Add to Cart Flow](./SYSTEM_ARCHITECTURE.md#4-data-flow---add-to-cart)

### Cart Management
- [Cart Page Components](./FRONTEND_COMPONENTS.md#4-component-hierarchy---cart-page)
- [Cart State Machine](./DATABASE_AND_API.md#4-cart-state-management)
- [Cart to Order Transformation](./CHECKOUT_FLOW.md#6-cart-to-order-transformation)

### Checkout Process ⭐
- [Complete Checkout Flow](./CHECKOUT_FLOW.md#1-complete-checkout-user-journey)
- [Address Form Flow](./CHECKOUT_FLOW.md#2-address-form-component-flow)
- [Payment Processing](./CHECKOUT_FLOW.md#3-payment-processing-flow)
- [Form Validation](./CHECKOUT_FLOW.md#5-form-validation-flow)

### Payment & Orders
- [Payment Processing Flow](./DATABASE_AND_API.md#7-payment-processing-flow)
- [Webhook Event Flow](./DATABASE_AND_API.md#10-webhook-event-flow)
- [Order Creation](./CHECKOUT_FLOW.md#6-cart-to-order-transformation)

### Authentication & Security
- [Authentication Flow](./SYSTEM_ARCHITECTURE.md#5-authentication-flow)
- [API Request/Response](./DATABASE_AND_API.md#3-api-requestresponse-flow)

### Performance & Optimization
- [Cache Strategy](./DATABASE_AND_API.md#6-cache-strategy)
- [Performance Optimization](./FRONTEND_COMPONENTS.md#10-performance-optimization-strategy)
- [Responsive Design](./FRONTEND_COMPONENTS.md#8-responsive-design-breakpoints)

---

## 📝 Diagram Format

All diagrams are created using **Mermaid** syntax, which renders automatically on:
- ✅ GitHub
- ✅ GitLab
- ✅ VS Code (with Mermaid extension)
- ✅ Notion
- ✅ Confluence
- ✅ Many other markdown viewers

### Viewing Diagrams

**Option 1: GitHub/GitLab**
Simply view the markdown files on GitHub/GitLab - diagrams render automatically.

**Option 2: VS Code**
Install the "Markdown Preview Mermaid Support" extension:
```bash
code --install-extension bierner.markdown-mermaid
```

**Option 3: Online Mermaid Editor**
Copy diagram code to https://mermaid.live for editing and exporting.

**Option 4: Export as Images**
Use the Mermaid CLI to export diagrams as PNG/SVG:
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i SYSTEM_ARCHITECTURE.md -o system-architecture.png
```

---

## 🎨 Diagram Color Coding

Throughout the diagrams, we use consistent color coding:

- 🟢 **Green (#90ee90)** - Success states, completed steps, production environments
- 🟡 **Yellow (#ffd43b)** - In-progress states, important components, development environments
- 🔵 **Light Blue (#e1f5ff)** - User-facing components, client layer
- 🔴 **Red (#ff9999)** - Error states, failed operations, warnings
- 🟣 **Purple (#9d4edd)** - API/Backend services
- 🔵 **Dark Blue (#336791)** - Database layer (PostgreSQL)
- 🔴 **Redis Red (#dc382d)** - Cache layer (Redis)
- 🟣 **Stripe Purple (#635bff)** - External payment services

---

## 🆕 Recent Updates

### Latest Changes (2024-10-28)
- ✅ Added checkout flow bug fix diagram
- ✅ Complete database ER diagram
- ✅ Added all API endpoints
- ✅ Enhanced error handling flows
- ✅ Added performance optimization diagrams

### Highlights
- **40+ total diagrams** across 4 major documents
- **Complete checkout flow** with all edge cases
- **Database schema** with all relationships
- **API documentation** with all endpoints
- **Performance strategies** for optimization

---

## 🤝 Contributing

To add or update diagrams:

1. Edit the relevant `.md` file
2. Use Mermaid syntax
3. Follow the color coding conventions
4. Test rendering on GitHub or VS Code
5. Update this README if adding new diagrams

### Mermaid Resources
- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid Live Editor](https://mermaid.live)
- [Mermaid Cheat Sheet](https://jojozhuang.github.io/tutorial/mermaid-cheat-sheet/)

---

## 📚 Related Documentation

- [Main Documentation](../DOCUMENTATION.md) - Comprehensive technical documentation
- [README](../README.md) - Quick start guide
- [Backend README](../ojsom/README.md) - Backend-specific documentation
- [Storefront README](../ojsom-storefront/README.md) - Frontend-specific documentation

---

## 💡 Tips for Using Diagrams

1. **Start with the overview** - System Architecture gives the big picture
2. **Focus on your area** - Use the role-based navigation above
3. **Follow the flow** - Diagrams are designed to be read sequentially
4. **Zoom in as needed** - Each diagram focuses on a specific aspect
5. **Use for onboarding** - Great for new team members
6. **Reference during development** - Keep diagrams open while coding
7. **Update as needed** - Keep diagrams current with code changes

---

## 📊 Diagram Statistics

- **Total Files**: 4
- **Total Diagrams**: 38
- **Total Lines of Code**: ~2,018
- **Diagram Types**: 
  - Flowcharts: 15
  - Sequence Diagrams: 4
  - State Machines: 4
  - Entity-Relationship: 1
  - Component Trees: 8
  - Mind Maps: 1
  - Journey Maps: 1
  - Graphs: 4

---

**Last Updated**: 2024-10-28  
**Maintained by**: Ojsom Development Team
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

// Utility functions (duplicated from storefront for admin use)
function calculateWeightCharge(items: any[]): number {
  const totalWeightGrams = items.reduce((total, item) => {
    // Priority: 1. variant.weight, 2. product.weight, 3. variant.product.weight
    const weight = item.variant?.weight ?? item.product?.weight ?? item.variant?.product?.weight ?? 0
    return total + (item.quantity * weight)
  }, 0)

  if (totalWeightGrams <= 1000) {
    return 0
  }

  const extraWeightGrams = Math.max(0, totalWeightGrams - 1000)
  const extraWeightKG = Math.ceil(extraWeightGrams / 1000)
  const chargeInTaka = extraWeightKG * 20
  
  return chargeInTaka
}

function getTotalWeight(items: any[]): number {
  return items.reduce((total, item) => {
    // Priority: 1. variant.weight, 2. product.weight, 3. variant.product.weight
    const weight = item.variant?.weight ?? item.product?.weight ?? item.variant?.product?.weight ?? 0
    return total + (item.quantity * weight)
  }, 0)
}

function getChargeableWeightKG(items: any[]): number {
  const totalWeightGrams = getTotalWeight(items)
  
  if (totalWeightGrams <= 1000) {
    return 0
  }
  
  const extraWeightGrams = Math.max(0, totalWeightGrams - 1000)
  return Math.ceil(extraWeightGrams / 1000)
}

function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

const OrderWeightChargeWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const order = data

  if (!order.items || order.items.length === 0) {
    return null
  }

  const weightCharge = calculateWeightCharge(order.items)
  const totalWeightGrams = getTotalWeight(order.items)
  const chargeableWeightKG = getChargeableWeightKG(order.items)
  const totalWeightKG = (totalWeightGrams / 1000).toFixed(2)

  // Only show if there's a weight charge
  if (weightCharge === 0) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Extra Charge on Weight</Heading>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <Text className="text-ui-fg-subtle">Total Weight:</Text>
              <Text className="font-medium">{totalWeightKG} kg</Text>
            </div>
            <div className="flex justify-between text-sm">
              <Text className="text-ui-fg-subtle">Extra Charge:</Text>
              <Text className="font-medium text-green-600">Free (Under 1 KG)</Text>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Extra Charge on Weight</Heading>
      </div>
      <div className="px-6 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <Text className="text-ui-fg-subtle">Total Weight:</Text>
            <Text className="font-medium">{totalWeightKG} kg</Text>
          </div>
          <div className="flex justify-between text-sm">
            <Text className="text-ui-fg-subtle">Chargeable Weight:</Text>
            <Text className="font-medium">{chargeableWeightKG} kg</Text>
          </div>
          <div className="flex justify-between text-sm text-ui-fg-muted">
            <Text>Calculation:</Text>
            <Text>({chargeableWeightKG} kg × 20 ৳)</Text>
          </div>
          <div className="border-t pt-2 mt-1">
            <div className="flex justify-between">
              <Text className="font-semibold">Extra Charge on Weight:</Text>
              <Text className="font-semibold text-lg">
                {formatCurrency(weightCharge, order.currency_code)}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderWeightChargeWidget
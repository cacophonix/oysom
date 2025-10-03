import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["bd"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "bdt",
            is_default: true,
          },
          {
            currency_code: "usd",
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Bangladesh",
          currency_code: "bdt",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system"
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Dhaka Warehouse",
          address: {
            city: "Dhaka",
            country_code: "BD",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default Shipping Profile",
            type: "default",
          },
        ],
      },
    });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Dhaka Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Bangladesh",
        geo_zones: [
          {
            country_code: "bd",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "bdt",
            amount: 100,
          },
          {
            region_id: region.id,
            amount: 100,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 15,
          },
          {
            currency_code: "bdt",
            amount: 150,
          },
          {
            region_id: region.id,
            amount: 150,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Electronics",
          is_active: true,
        },
        {
          name: "Clothing",
          is_active: true,
        },
        {
          name: "Home & Garden",
          is_active: true,
        },
        {
          name: "Books",
          is_active: true,
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Premium Cotton T-Shirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Clothing")!.id,
          ],
          description:
            "Comfortable premium cotton t-shirt perfect for everyday wear. Made with high-quality fabric and available in multiple sizes and colors.",
          handle: "cotton-t-shirt",
          weight: 200,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
            },
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL"],
            },
            {
              title: "Color",
              values: ["Black", "White", "Blue"],
            },
          ],
          variants: [
            {
              title: "S / Black",
              sku: "TSHIRT-S-BLACK",
              options: {
                Size: "S",
                Color: "Black",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "S / White",
              sku: "TSHIRT-S-WHITE",
              options: {
                Size: "S",
                Color: "White",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "S / Blue",
              sku: "TSHIRT-S-BLUE",
              options: {
                Size: "S",
                Color: "Blue",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M / Black",
              sku: "TSHIRT-M-BLACK",
              options: {
                Size: "M",
                Color: "Black",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M / White",
              sku: "TSHIRT-M-WHITE",
              options: {
                Size: "M",
                Color: "White",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "M / Blue",
              sku: "TSHIRT-M-BLUE",
              options: {
                Size: "M",
                Color: "Blue",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L / Black",
              sku: "TSHIRT-L-BLACK",
              options: {
                Size: "L",
                Color: "Black",
              },
              prices: [
                {
                  amount: 1300,
                  currency_code: "bdt",
                },
                {
                  amount: 16,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L / White",
              sku: "TSHIRT-L-WHITE",
              options: {
                Size: "L",
                Color: "White",
              },
              prices: [
                {
                  amount: 1300,
                  currency_code: "bdt",
                },
                {
                  amount: 16,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "L / Blue",
              sku: "TSHIRT-L-BLUE",
              options: {
                Size: "L",
                Color: "Blue",
              },
              prices: [
                {
                  amount: 1300,
                  currency_code: "bdt",
                },
                {
                  amount: 16,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL / Black",
              sku: "TSHIRT-XL-BLACK",
              options: {
                Size: "XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 1400,
                  currency_code: "bdt",
                },
                {
                  amount: 17,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL / White",
              sku: "TSHIRT-XL-WHITE",
              options: {
                Size: "XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 1400,
                  currency_code: "bdt",
                },
                {
                  amount: 17,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "XL / Blue",
              sku: "TSHIRT-XL-BLUE",
              options: {
                Size: "XL",
                Color: "Blue",
              },
              prices: [
                {
                  amount: 1400,
                  currency_code: "bdt",
                },
                {
                  amount: 17,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Wireless Bluetooth Headphones",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Electronics")!.id,
          ],
          description:
            "High-quality wireless Bluetooth headphones with noise cancellation and long battery life. Perfect for music lovers and professionals.",
          handle: "bluetooth-headphones",
          weight: 300,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://via.placeholder.com/400x400/000000/FFFFFF?text=Headphones",
            },
          ],
          options: [
            {
              title: "Color",
              values: ["Black", "White", "Blue"],
            },
          ],
          variants: [
            {
              title: "Black",
              sku: "HEADPHONES-BLACK",
              options: {
                Color: "Black",
              },
              prices: [
                {
                  amount: 4500,
                  currency_code: "bdt",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "White",
              sku: "HEADPHONES-WHITE",
              options: {
                Color: "White",
              },
              prices: [
                {
                  amount: 4500,
                  currency_code: "bdt",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Blue",
              sku: "HEADPHONES-BLUE",
              options: {
                Color: "Blue",
              },
              prices: [
                {
                  amount: 4500,
                  currency_code: "bdt",
                },
                {
                  amount: 55,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Programming Fundamentals Book",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Books")!.id,
          ],
          description:
            "A comprehensive guide to programming fundamentals covering algorithms, data structures, and best practices. Perfect for beginners and intermediate developers.",
          handle: "programming-book",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://via.placeholder.com/300x400/0066CC/FFFFFF?text=Programming+Book",
            },
          ],
          options: [
            {
              title: "Format",
              values: ["Paperback", "Hardcover", "eBook"],
            },
          ],
          variants: [
            {
              title: "Paperback",
              sku: "PROGBOOK-PAPERBACK",
              options: {
                Format: "Paperback",
              },
              prices: [
                {
                  amount: 800,
                  currency_code: "bdt",
                },
                {
                  amount: 10,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Hardcover",
              sku: "PROGBOOK-HARDCOVER",
              options: {
                Format: "Hardcover",
              },
              prices: [
                {
                  amount: 1200,
                  currency_code: "bdt",
                },
                {
                  amount: 15,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "eBook",
              sku: "PROGBOOK-EBOOK",
              options: {
                Format: "eBook",
              },
              prices: [
                {
                  amount: 500,
                  currency_code: "bdt",
                },
                {
                  amount: 6,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "Indoor Plant Pot Set",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Home & Garden")!.id,
          ],
          description:
            "Beautiful ceramic plant pot set perfect for indoor gardening. Includes drainage holes and saucers. Great for small plants and herbs.",
          handle: "plant-pot-set",
          weight: 800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [
            {
              url: "https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Plant+Pot",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["Small", "Medium", "Large"],
            },
            {
              title: "Color",
              values: ["White", "Terracotta", "Green"],
            },
          ],
          variants: [
            {
              title: "Small / White",
              sku: "POT-S-WHITE",
              options: {
                Size: "Small",
                Color: "White",
              },
              prices: [
                {
                  amount: 600,
                  currency_code: "bdt",
                },
                {
                  amount: 7,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Small / Terracotta",
              sku: "POT-S-TERRACOTTA",
              options: {
                Size: "Small",
                Color: "Terracotta",
              },
              prices: [
                {
                  amount: 600,
                  currency_code: "bdt",
                },
                {
                  amount: 7,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium / White",
              sku: "POT-M-WHITE",
              options: {
                Size: "Medium",
                Color: "White",
              },
              prices: [
                {
                  amount: 900,
                  currency_code: "bdt",
                },
                {
                  amount: 11,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium / Green",
              sku: "POT-M-GREEN",
              options: {
                Size: "Medium",
                Color: "Green",
              },
              prices: [
                {
                  amount: 900,
                  currency_code: "bdt",
                },
                {
                  amount: 11,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large / White",
              sku: "POT-L-WHITE",
              options: {
                Size: "Large",
                Color: "White",
              },
              prices: [
                {
                  amount: 1300,
                  currency_code: "bdt",
                },
                {
                  amount: 16,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large / Terracotta",
              sku: "POT-L-TERRACOTTA",
              options: {
                Size: "Large",
                Color: "Terracotta",
              },
              prices: [
                {
                  amount: 1300,
                  currency_code: "bdt",
                },
                {
                  amount: 16,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}

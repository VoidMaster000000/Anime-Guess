import { ObjectId } from 'mongodb';
import { getDatabase, COLLECTIONS } from '../mongodb';
import { DBInventoryItem, SHOP_ITEMS } from './models';
import { updateUserCoins } from './users';

// ============================================================================
// INVENTORY SERVICE
// ============================================================================

/**
 * Get user's inventory
 */
export async function getUserInventory(userId: string): Promise<DBInventoryItem[]> {
  const db = await getDatabase();
  const inventory = db.collection<DBInventoryItem>(COLLECTIONS.INVENTORY);

  return inventory.find({ odId: userId }).toArray();
}

/**
 * Get specific item from user's inventory
 */
export async function getInventoryItem(
  userId: string,
  itemId: string
): Promise<DBInventoryItem | null> {
  const db = await getDatabase();
  const inventory = db.collection<DBInventoryItem>(COLLECTIONS.INVENTORY);

  return inventory.findOne({ odId: userId, itemId });
}

/**
 * Purchase an item from the shop
 */
export async function purchaseItem(
  userId: string,
  itemId: string,
  quantity = 1
): Promise<{ success: boolean; error?: string; item?: DBInventoryItem }> {
  const db = await getDatabase();
  const inventory = db.collection<DBInventoryItem>(COLLECTIONS.INVENTORY);

  // Find item definition
  const itemDef = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!itemDef) {
    return { success: false, error: 'Item not found' };
  }

  // Calculate total cost
  const totalCost = itemDef.price * quantity;

  // Check current inventory quantity
  const existingItem = await inventory.findOne({ odId: userId, itemId });
  const currentQuantity = existingItem?.quantity || 0;

  // Check max ownable limit
  if (currentQuantity + quantity > itemDef.maxOwnable) {
    return {
      success: false,
      error: `Cannot own more than ${itemDef.maxOwnable} of this item`,
    };
  }

  // Deduct coins
  const coinsDeducted = await updateUserCoins(userId, -totalCost);
  if (!coinsDeducted) {
    return { success: false, error: 'Not enough coins' };
  }

  // Add or update inventory item
  if (existingItem) {
    await inventory.updateOne(
      { _id: existingItem._id },
      {
        $inc: { quantity },
        $set: { purchasedAt: new Date() },
      }
    );

    const updatedItem = await inventory.findOne({ _id: existingItem._id });
    return { success: true, item: updatedItem! };
  } else {
    const newItem: DBInventoryItem = {
      odId: userId,
      itemId,
      itemType: itemDef.type,
      quantity,
      purchasedAt: new Date(),
      lastUsedAt: null,
    };

    const result = await inventory.insertOne(newItem);
    return { success: true, item: { ...newItem, _id: result.insertedId } };
  }
}

/**
 * Use an item from inventory
 */
export async function useItem(
  userId: string,
  itemId: string,
  quantity = 1
): Promise<{ success: boolean; error?: string; remainingQuantity?: number }> {
  const db = await getDatabase();
  const inventory = db.collection<DBInventoryItem>(COLLECTIONS.INVENTORY);

  const item = await inventory.findOne({ odId: userId, itemId });

  if (!item) {
    return { success: false, error: 'Item not in inventory' };
  }

  if (item.quantity < quantity) {
    return { success: false, error: 'Not enough items' };
  }

  const newQuantity = item.quantity - quantity;

  if (newQuantity === 0) {
    // Remove item from inventory
    await inventory.deleteOne({ _id: item._id });
    return { success: true, remainingQuantity: 0 };
  } else {
    // Update quantity
    await inventory.updateOne(
      { _id: item._id },
      {
        $inc: { quantity: -quantity },
        $set: { lastUsedAt: new Date() },
      }
    );
    return { success: true, remainingQuantity: newQuantity };
  }
}

/**
 * Add item to inventory (for rewards, achievements, etc.)
 */
export async function addItemToInventory(
  userId: string,
  itemId: string,
  quantity = 1
): Promise<DBInventoryItem> {
  const db = await getDatabase();
  const inventory = db.collection<DBInventoryItem>(COLLECTIONS.INVENTORY);

  const itemDef = SHOP_ITEMS.find((i) => i.id === itemId);
  if (!itemDef) {
    throw new Error('Item not found');
  }

  const existingItem = await inventory.findOne({ odId: userId, itemId });

  if (existingItem) {
    const newQuantity = Math.min(
      existingItem.quantity + quantity,
      itemDef.maxOwnable
    );

    await inventory.updateOne(
      { _id: existingItem._id },
      { $set: { quantity: newQuantity } }
    );

    return { ...existingItem, quantity: newQuantity };
  } else {
    const newItem: DBInventoryItem = {
      odId: userId,
      itemId,
      itemType: itemDef.type,
      quantity: Math.min(quantity, itemDef.maxOwnable),
      purchasedAt: new Date(),
      lastUsedAt: null,
    };

    const result = await inventory.insertOne(newItem);
    return { ...newItem, _id: result.insertedId };
  }
}

/**
 * Get user's inventory with item details
 */
export async function getUserInventoryWithDetails(userId: string): Promise<
  Array<{
    item: DBInventoryItem;
    details: (typeof SHOP_ITEMS)[0];
  }>
> {
  const inventory = await getUserInventory(userId);

  return inventory
    .map((item) => {
      const details = SHOP_ITEMS.find((i) => i.id === item.itemId);
      if (!details) return null;
      return { item, details };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/**
 * Clear user's inventory (for account deletion)
 */
export async function clearUserInventory(userId: string): Promise<number> {
  const db = await getDatabase();
  const inventory = db.collection<DBInventoryItem>(COLLECTIONS.INVENTORY);

  const result = await inventory.deleteMany({ odId: userId });
  return result.deletedCount;
}

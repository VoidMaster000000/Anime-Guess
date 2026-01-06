import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserInventoryWithDetails } from '@/lib/db/inventory';

// Get user's inventory
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const inventory = await getUserInventoryWithDetails(user.id);

    // Transform for client
    const items = inventory.map(({ item, details }) => ({
      id: item._id?.toString(),
      itemId: item.itemId,
      name: details.name,
      description: details.description,
      type: details.type,
      icon: details.icon,
      quantity: item.quantity,
      maxOwnable: details.maxOwnable,
      effect: details.effect,
      purchasedAt: item.purchasedAt.toISOString(),
      lastUsedAt: item.lastUsedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      inventory: items,
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { error: 'Failed to get inventory' },
      { status: 500 }
    );
  }
}

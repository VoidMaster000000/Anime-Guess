import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { purchaseItem } from '@/lib/db/inventory';
import { getUserById } from '@/lib/db/users';

// Purchase an item from the shop
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, quantity = 1 } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const result = await purchaseItem(user.id, itemId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Get updated user data (for coins)
    const updatedUser = await getUserById(user.id);

    return NextResponse.json({
      success: true,
      item: {
        itemId: result.item?.itemId,
        quantity: result.item?.quantity,
      },
      updatedCoins: updatedUser?.profile.coins,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to purchase item' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { useItem } from '@/lib/db/inventory';

// Use an item from inventory
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

    const result = await useItem(user.id, itemId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      remainingQuantity: result.remainingQuantity,
    });
  } catch (error) {
    console.error('Use item error:', error);
    return NextResponse.json(
      { error: 'Failed to use item' },
      { status: 500 }
    );
  }
}

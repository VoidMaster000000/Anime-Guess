import { NextResponse } from 'next/server';
import { SHOP_ITEMS } from '@/lib/db/models';

// Get all shop items
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      items: SHOP_ITEMS.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
        icon: item.icon,
        maxOwnable: item.maxOwnable,
        effect: item.effect,
      })),
    });
  } catch (error) {
    console.error('Get shop items error:', error);
    return NextResponse.json(
      { error: 'Failed to get shop items' },
      { status: 500 }
    );
  }
}

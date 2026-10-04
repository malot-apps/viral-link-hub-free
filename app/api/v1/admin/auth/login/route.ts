import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken, validateAdminCredentials } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    const token = generateAdminToken(username);

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      token,
      admin: {
        username,
        role: 'superadmin',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

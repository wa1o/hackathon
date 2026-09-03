import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/services/auth.service'

// Next.js 15+ uses async params, but we handle both for compatibility
async function getParams(params: { id: string } | Promise<{ id: string }>) {
  return await params
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(params);
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(params);
    const body = await request.json();
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== 'COORDINADOR') {
      return NextResponse.json({ error: 'Solo el coordinador puede actualizar usuarios' }, { status: 403 })
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        role: body.role,
        ...(body.password ? { passwordHash: await hash(body.password, 10) } : {})
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await getParams(params);
    const currentUser = await AuthService.getCurrentUser()
    if (!currentUser || currentUser.role !== 'COORDINADOR') {
      return NextResponse.json({ error: 'Solo el coordinador puede eliminar usuarios' }, { status: 403 })
    }
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { role: 'VOLUNTARIO' },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true }
    })

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: deletedUser, message: 'Usuario desactivado' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

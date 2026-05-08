import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string) {
    const slug =
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') +
      '-' +
      Date.now().toString(36)

    return this.prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: { userId, role: 'OWNER' },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    })
  }

  async findByUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { forms: true, members: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        _count: { select: { forms: true, members: true } },
      },
    })
    if (!workspace) throw new NotFoundException('Workspace not found')
    return workspace
  }

  async getMembers(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    })
  }

  async inviteMember(workspaceId: string, email: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new NotFoundException(
        'No user found with that email. They must sign up first.',
      )
    }

    const existing = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } },
    })
    if (existing) throw new ConflictException('User is already a member')

    return this.prisma.workspaceMember.create({
      data: { workspaceId, userId: user.id, role: role as any },
      include: { user: true },
    })
  }

  async updateMemberRole(workspaceId: string, userId: string, role: string) {
    return this.prisma.workspaceMember.update({
      where: { userId_workspaceId: { userId, workspaceId } },
      data: { role: role as any },
      include: { user: true },
    })
  }

  async removeMember(workspaceId: string, userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw new ForbiddenException('You cannot remove yourself from a workspace')
    }
    return this.prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
  }
}

import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

interface UpsertUserDto {
  firebaseUid: string
  email: string
  name: string
  avatarUrl?: string
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertUserDto) {
    return this.prisma.user.upsert({
      where: { firebaseUid: dto.firebaseUid },
      update: {
        name: dto.name,
        avatarUrl: dto.avatarUrl,
      },
      create: dto,
    })
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async updateProfile(id: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }
}

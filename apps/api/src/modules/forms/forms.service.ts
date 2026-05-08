import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateFormDto } from './dto/create-form.dto'
import { UpdateFormDto } from './dto/update-form.dto'

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, dto: CreateFormDto) {
    return this.prisma.form.create({
      data: {
        title: dto.title,
        description: dto.description,
        isAnonymous: dto.isAnonymous ?? false,
        workspaceId,
        createdById: userId,
        questions: dto.questions
          ? {
              create: dto.questions.map((q, index) => ({
                title: q.title,
                description: q.description,
                type: q.type as any,
                required: q.required ?? false,
                order: index,
                options: q.options ?? undefined,
              })),
            }
          : undefined,
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
  }

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.form.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { responses: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        questions: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    })
    if (!form) throw new NotFoundException('Form not found')
    return form
  }

  async update(formId: string, dto: UpdateFormDto) {
    await this.findById(formId)
    return this.prisma.form.update({
      where: { id: formId },
      data: {
        title: dto.title,
        description: dto.description,
        isAnonymous: dto.isAnonymous,
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
  }

  async publish(formId: string) {
    await this.findById(formId)
    return this.prisma.form.update({
      where: { id: formId },
      data: { status: 'ACTIVE', publishedAt: new Date() },
    })
  }

  async pause(formId: string) {
    await this.findById(formId)
    return this.prisma.form.update({
      where: { id: formId },
      data: { status: 'PAUSED' },
    })
  }

  async archive(formId: string) {
    await this.findById(formId)
    return this.prisma.form.update({
      where: { id: formId },
      data: { status: 'ARCHIVED' },
    })
  }

  async remove(formId: string) {
    await this.findById(formId)
    return this.prisma.form.delete({ where: { id: formId } })
  }

  async findPublicForm(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId, status: 'ACTIVE' },
      include: { questions: { orderBy: { order: 'asc' } } },
    })
    if (!form) throw new NotFoundException('Form not found or not active')
    return form
  }
}

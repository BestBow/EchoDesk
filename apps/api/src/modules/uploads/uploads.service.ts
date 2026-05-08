import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary } from 'cloudinary'

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name)

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    })
  }

  async uploadAvatar(file: Express.Multer.File, userId: string) {
    this.validateImage(file)

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'echodesk/avatars',
          public_id: `user-${userId}`,
          overwrite: true,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({ url: result.secure_url, publicId: result.public_id })
        },
      )
      uploadStream.end(file.buffer)
    })
  }

  async uploadWorkspaceLogo(file: Express.Multer.File, workspaceId: string) {
    this.validateImage(file)

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'echodesk/logos',
          public_id: `workspace-${workspaceId}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({ url: result.secure_url, publicId: result.public_id })
        },
      )
      uploadStream.end(file.buffer)
    })
  }

  async deleteFile(publicId: string) {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      this.logger.warn(`Failed to delete Cloudinary file: ${publicId}`)
    }
  }

  private validateImage(file: Express.Multer.File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed')
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException('Image must be under 5MB')
    }
  }
}

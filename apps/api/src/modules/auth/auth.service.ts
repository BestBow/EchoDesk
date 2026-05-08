import { Injectable, UnauthorizedException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.get('FIREBASE_PROJECT_ID'),
          privateKey: this.config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
          clientEmail: this.config.get('FIREBASE_CLIENT_EMAIL'),
        }),
      })
      this.logger.log('Firebase Admin initialized')
    }
  }

  async exchangeToken(idToken: string) {
    let decoded: admin.auth.DecodedIdToken

    try {
      decoded = await admin.auth().verifyIdToken(idToken)
    } catch {
      throw new UnauthorizedException('Invalid Firebase token')
    }

    const user = await this.usersService.upsert({
      firebaseUid: decoded.uid,
      email: decoded.email!,
      name: decoded.name ?? decoded.email!.split('@')[0],
      avatarUrl: decoded.picture,
    })

    const payload = { sub: user.id, email: user.email }
    const accessToken = this.jwtService.sign(payload)

    this.logger.log(`User authenticated: ${user.email}`)

    return { accessToken, user }
  }
}

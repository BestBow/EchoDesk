import { Module } from '@nestjs/common'
import { FormsController, PublicFormsController } from './forms.controller'
import { FormsService } from './forms.service'

@Module({
  controllers: [FormsController, PublicFormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}

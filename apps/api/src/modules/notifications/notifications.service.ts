import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface SlackDigestPayload {
  channelId: string
  formTitle: string
  responseCount: number
  npsScore: number | null
  summary: string
  formUrl: string
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(private readonly config: ConfigService) {}

  async sendSlackDigest(payload: SlackDigestPayload) {
    const token = this.config.get('SLACK_BOT_TOKEN')
    if (!token) {
      this.logger.warn('SLACK_BOT_TOKEN not set — skipping notification')
      return
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `EchoDesk Weekly Digest`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Form:* ${payload.formTitle}`,
      },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Responses this week:*\n${payload.responseCount}`,
          },
          {
            type: 'mrkdwn',
            text: `*NPS Score:*\n${payload.npsScore !== null ? payload.npsScore : 'N/A'}`,
          },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AI Summary:*\n${payload.summary}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Full Report' },
            url: payload.formUrl,
            style: 'primary',
          },
        ],
      },
    ]

    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: payload.channelId, blocks }),
      })

      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!data.ok) {
        this.logger.error(`Slack API error: ${data.error}`)
      } else {
        this.logger.log(`Slack digest sent to channel ${payload.channelId}`)
      }
    } catch (error) {
      this.logger.error('Failed to send Slack notification', error)
    }
  }
}

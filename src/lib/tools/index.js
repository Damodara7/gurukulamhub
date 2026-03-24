import { gameTools } from '@/lib/tools/gameTools'
import { quizTools } from '@/lib/tools/quizTools'
import { questionTools } from '@/lib/tools/questionTools'
import { userAccessTools } from '@/lib/tools/userAccessTools'
import { sponsorshipTools } from '@/lib/tools/sponsorshipTools'

export const agentTools = [
  ...gameTools,
  ...quizTools,
  ...questionTools,
  ...userAccessTools,
  ...sponsorshipTools
]


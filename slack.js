const exit = () => process.exit(0)

const [event, _error, _job, _order] = process.argv.slice(2)
if (event !== 'success') exit()

const error = JSON.parse(_error)
if (error) exit()

const ALLOWED_JOBS = [
  'verify-user-init-tx',
  'reciprocate-init-swap',
  'find-claim-swap-tx',
  'agent-claim',
  'agent-refund'
]

const job = JSON.parse(_job)
if (!job || !job.name || !ALLOWED_JOBS.includes(job.name)) exit()

const order = JSON.parse(_order)
if (!order || !order.orderId) exit()

const fs = require('fs')
const path = require('path')
const axios = require('axios')

const post = (url, data) => {
  return axios({
    url,
    method: 'POST',
    data
  }).then(res => res.data).catch(e => console.error(e))
}

module.exports = (url, logDir) => {
  const key = path.join(logDir, `${order.status}-${order.orderId}`)
  if (fs.existsSync(key)) return

  fs.closeSync(fs.openSync(key, 'w'))

  return post(url, {
    text: `\`${order.status}\` \`${order.orderId}\` \`${order.fromAmount} ${order.from} to ${order.toAmount} ${order.to}\``,
    attachments: [
      {
        title: 'Order',
        text: `\`\`\`${JSON.stringify(order, null, 2)}\`\`\``,
        type: 'mrkdwn'
      }
    ]
  })
}

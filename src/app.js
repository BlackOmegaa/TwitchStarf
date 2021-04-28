import tmi from 'tmi.js'
import { BOT_USERNAME , OAUTH_TOKEN, CHANNEL_NAME, BLOCKED_WORDS } from './constants'

const options = {
	options: { debug: true },
	connection: {
    reconnect: true,
    secure: true,
    timeout: 180000,
    reconnectDecay: 1.4,
    reconnectInterval: 1000,
	},
	identity: {
		username: BOT_USERNAME,
		password: OAUTH_TOKEN
	},
	channels: [ CHANNEL_NAME ]
}

const client = new tmi.Client(options)

client.connect()

// events
client.on('disconnected', (reason) => {
  onDisconnectedHandler(reason)
})

client.on('connected', (address, port) => {
  onConnectedHandler(address, port)
})

client.on('hosted', (channel, username, viewers, autohost) => {
  onHostedHandler(channel, username, viewers, autohost)
})

client.on('subscription', (channel, username, method, message, userstate) => {
  onSubscriptionHandler(channel, username, method, message, userstate)
})

client.on('raided', (channel, username, viewers) => {
  onRaidedHandler(channel, username, viewers)
})

client.on('cheer', (channel, userstate, message) => {
  onCheerHandler(channel, userstate, message)
})

client.on('giftpaidupgrade', (channel, username, sender, userstate) => {
  onGiftPaidUpgradeHandler(channel, username, sender, userstate)
})

client.on('hosting', (channel, target, viewers) => {
  onHostingHandler(channel, target, viewers)
})

client.on('reconnect', () => {
  reconnectHandler()
})

client.on('resub', (channel, username, months, message, userstate, methods) => {
  resubHandler(channel, username, months, message, userstate, methods)
})

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
  subGiftHandler(channel, username, streakMonths, recipient, methods, userstate)
})

// event handlers

client.on('message', (channel, userstate, message, self) => {
  if(self) {
    return
  }

  if (userstate.username === BOT_USERNAME) {
    console.log(`Not checking bot's messages.`)
    return
  }

	if(message.toLowerCase() === '!hello') {
    hello(channel, userstate)
    return
  }

  onMessageHandler(channel, userstate, message, self)
})

function onMessageHandler (channel, userstate, message, self) {
  checkTwitchChat(userstate, message, channel)
}

function onDisconnectedHandler(reason) {
  console.log(`Deconnecté: ${reason}`)
}

function onConnectedHandler(address, port) {
  console.log(`Connecté: ${address}:${port}`)
}

function onHostedHandler (channel, username, viewers, autohost) {
  client.say(channel,
    `Merci @${username} de l'host de ${viewers} viewers!`
  )
}

function onRaidedHandler(channel, username, viewers) {
  client.say(channel,
    `Merci @${username} du raid de ${viewers} viewers !`
  )
}

function onSubscriptionHandler(channel, username, method, message, userstate) {
  client.say(channel,
    `Merci @${username} de l'abonnement ! 💪`
  )
}

function onCheerHandler(channel, userstate, message)  {
  client.say(channel,
    `Merci @${userstate.username} pour ce(s) ${userstate.bits} bit(s)!`
  )
}

function onGiftPaidUpgradeHandler(channel, username, sender, userstate) {
  client.say(channel,
    `Merci @${username} du soutien avec ce reabonnement !`
  )
}

function onHostingHandler(channel, target, viewers) {
  client.say(channel,
    `Host sur ${target} de ${viewers} viewers!`
  )
}

function reconnectHandler () {
  console.log('Reconnexion...')
}

function resubHandler(channel, username, months, message, userstate, methods) {
  const cumulativeMonths = userstate['msg-param-cumulative-months']
  client.say(channel,
    `Merci @${username} pour ce ${cumulativeMonths}ème mois de sub!`
  )
}

function subGiftHandler(channel, username, streakMonths, recipient, methods, userstate) {

  client.say(channel,
    `Merci @${username} d'avoir offert un sub à ${recipient}}.`
  )

  // this comes back as a boolean from twitch, disabling for now
  // "msg-param-sender-count": false
  // const senderCount =  ~~userstate["msg-param-sender-count"];
  // client.say(channel,
  //   `${username} has gifted ${senderCount} subs!`
  // )
}

// commands

function hello (channel, userstate) {
  client.say(channel, `@${userstate.username}, Salut ! 😁`)
}

function checkTwitchChat(userstate, message, channel) {
  console.log(message)
  message = message.toLowerCase()
  let shouldSendMessage = false
  shouldSendMessage = BLOCKED_WORDS.some(blockedWord => message.includes(blockedWord.toLowerCase()))
  if (shouldSendMessage) {
    // tell user
    client.say(channel, `@${userstate.username}, desolé ! Ton message comporte des termes innaproprié.`)
    // delete message
    client.deletemessage(channel, userstate.id)
  }
}

import state from './state.js'

/** @returns {Dash.ApiConfigResponse} */
export const fetchConfig = async () => (await globalThis.fetch('/api/config')).json()

/** @type {WebSocket} */
let ws

/**
 * Setup the WebSocket and wait for it to be ready.
 */
export const setupWS = async () =>
  new Promise((resolve) => {
    const protocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${location.host}/ws`)

    ws.addEventListener('open', () => {
      console.debug('WebSocket initialized')
      resolve(true)
    })

    ws.addEventListener('message', (event) => {
      /** @type {Dash.WSResponse} */
      const { type, data } = JSON.parse(event.data)

      switch (type) {
        case 'containers':
          state.containers = data
          break

        case 'containers-all':
          state.containers = data
          break

        case 'networks':
          state.networks = data
          break
      }
    })
  })

/** @argument {keyof typeof Dash.MESSAGE} message */
export const fetch = (message) => {
  try {
    ws.send(message)
  } catch (e) {
    console.error(e)
  }
}

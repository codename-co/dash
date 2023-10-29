import state from './state.js'

/** @returns {Dash.ApiConfigResponse} */
export const fetchConfig = async () => (await globalThis.fetch('/api/config')).json()

/** @argument {keyof typeof Dash.MESSAGE} message */
export const fetch = async (message) => {
  console.time(`Fetched ${message} in`)

  /** @type {Dash.WSResponse} */
  const { type, data } = await (await globalThis.fetch(`/api/docker?type=${message}`)).json()

  console.table(data)
  console.timeEnd(`Fetched ${message} in`)

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
}

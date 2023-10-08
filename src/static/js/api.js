const api = (path = '/') => `/api${path}`

/** @returns {Dash.ApiIndexResponse} */
export const fetchIndex = async () => (await fetch(api('/'))).json()

/** @returns {Dash.ApiContainersResponse} */
export const fetchContainers = async (all = false) =>
  (await fetch(api(`/docker/containers${all ? '?all' : ''}`))).json()

/** @returns {Dash.ApiNetworksResponse} */
export const fetchNetworks = async () => (await fetch(api('/docker/networks'))).json()

/** @returns {Dash.ApiConfigResponse} */
export const fetchConfig = async () => (await fetch(api('/config'))).json()

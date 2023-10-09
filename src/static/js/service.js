/** @argument {Dash.Container} c */
export const serviceEnabled = (c) => c.Labels['dash.enabled'] !== 'false'

/** @argument {Dash.Container} c */
export const serviceName = (c) =>
  c.Labels['dash.name'] || c.Labels['com.docker.compose.service'] || c.Names?.[0]?.replace(/^\//, '')

/** @argument {Dash.Container} c */
export const serviceLinks = (c) => {
  let hosts = c.Labels['dev.orbstack.domains']?.split(',') ?? []

  if (!hosts.length) {
    hosts = c.Ports.filter((p) => p.PublicPort && p.IP === '0.0.0.0').map((p) => `localhost:${p.PublicPort}`)
  }

  return hosts.map((host) => ({
    label: host.replace(/^localhost:/, ':'),
    host,
    url: new URL(`http://${host.replace(/^\*\./, `${serviceName(c)}.`)}`),
  }))
}

/** @argument {Dash.Container} c */
export const serviceNetworks = (c) =>
  Object.keys(c.NetworkSettings.Networks).map((name) => ({ ...c.NetworkSettings.Networks[name], name }))

/** @argument {Dash.Container} c */
export const serviceStatus = (c) => `<span class="status-${c.State}" title="${c.State}"></span>`

/** @argument {Dash.Container} c */
export const serviceTech = (c) =>
  c.Image.split(':')[0]
    .replace(/^sha256$/, '')
    .split('/')
    .pop() || ''

/** @argument {Dash.Container} c */
export const serviceIconName = (c) => {
  const iconFromLabels = c.Labels['dash.icon']

  if (iconFromLabels) {
    return iconFromLabels
  }

  const image = c.Image.split(':')[0].split('/').pop()

  /** @argument {string[]} haystack */
  const canFind = (haystack) => haystack.find((candidate) => image?.match(new RegExp(`(?:^|\\W)${candidate}(?:\\W|$)`)))
  const referenceTechFound = canFind(['nginx'])

  if (referenceTechFound) {
    return referenceTechFound
  }

  const mapping = {
    nodedotjs: ['node'],
    swagger: ['postgrest', 'rapidoc'],
    postgresql: ['postgres'],
    go: ['golang'],
    traefikproxy: ['traefik'],
    mariadb: ['maria'],
  }

  return (
    Object.values(mapping)
      .map((values, index) => canFind(values) && Object.keys(mapping)[index])
      .filter(Boolean)[0] ?? image
  )
}

/** @argument {Dash.Container} c */
export const serviceIcon = (c) => `https://cdn.simpleicons.org/${serviceIconName(c)}`

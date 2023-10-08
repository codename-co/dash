/**
 * @typedef {Record<string, string>} Labels
 * @typedef {{ Type: string; Source: string; Destination: string; Mode: string; RW: boolean; Propagation: string }} Mount
 * @typedef {any} NetworkSettings
 * @typedef {{ IP: string; PrivatePort: number; PublicPort: number; Type: string }} Port
 * @typedef {"created" | "running" | "paused" | "restarting" | "removing" | "exited" | "dead"} Status
 * @typedef {{ Command: string; Created: number; HostConfig: {NetworkMode: string}; Id: string; Image: string; ImageID: string; Labels: Labels; Mounts: Mount[]; Names: string[]; NetworkSettings: NetworkSettings; Ports: Port[]; State: string; Status: Status }} Container
 * @typedef {{ containers: Container[] }} ApiIndexResponse
 * @typedef {Container[]} ApiContainersResponse
 */

/** @type {HTMLElement} */
// @ts-ignore
const render = globalThis.render
/** @type {HTMLInputElement} */
// @ts-ignore
const search = globalThis.search
/** @type {HTMLInputElement} */
// @ts-ignore
const toggleAll = globalThis.toggleAll

const api = (path = '/') => `/api/docker${path}`

/** @returns {Promise<ApiIndexResponse>} */
const fetchIndex = async () => (await fetch(api('/'))).json()

/** @returns {Promise<ApiContainersResponse>} */
const fetchContainers = async (all = false) => (await fetch(api(`/containers${all ? '?all' : ''}`))).json()

/** @returns {boolean} */
const isFetchAll = () => sessionStorage.getItem('all') === 'true'

/** @argument {boolean?} value */
const setFetchAll = async (value = !isFetchAll()) => sessionStorage.setItem('all', value)

const update = async () => {
  const state = await fetchContainers(await isFetchAll())

  const projects = Array.from(state.reduce((acc, c) => acc.add(projectName(c)), new Set()))

  /** @type {{ containers: Record<string, Container[]> }} */
  const data = {
    containers: state.reduce((acc, c) => {
      const project = projectName(c)
      return { ...acc, [project]: [...(acc[project] || []), c] }
    }, {}),
  }

  console.log(data)

  render.innerHTML = `
    ${projects
      // .sort(sortStrings)
      .map(
        (project) => `
          <div class="project">
            <h3>${project}</h3>
            ${data.containers[project]
              .sort((a, b) => sortStrings(serviceName(a), serviceName(b)))
              .filter(filteredContainers)
              .map((c) => {
                const link = serviceLinks(c)?.[0]
                return `
                  <a class="service" ${link?.url ? `href="${link?.url}"` : ''} target="_blank">
                    <span class="status">
                      ${serviceStatus(c)}
                    </span>
                    <span class="icon">
                      <img src="${serviceIcon(
                        c
                      )}" onerror="this.onerror=null;this.src='https://cdn.simpleicons.org/docker'" />
                    </span>
                    <span class="name">
                      ${serviceName(c)}
                    </span>
                    <span class="links">
                      ${serviceLinks(c)
                        .map((link) => `<span class="link">${link.label}</span>`)
                        .join('&nbsp;')}
                    </span>
                    <span class="image">
                      ${serviceTech(c)}
                    </span>
                  </a>
                `
              })
              .join('')}
          </div>
        `
      )
      .join('')}
  `
}

/** @argument {Container} c */
const projectName = (c) => c.Labels['com.docker.compose.project'] || 'default'

/** @argument {Container} c */
const serviceName = (c) =>
  c.Labels['dash.name'] || c.Labels['com.docker.compose.service'] || c.Names?.[0]?.replace(/^\//, '')

/** @argument {Container} c */
const serviceLinks = (c) => {
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

/** @argument {Container} c */
const serviceStatus = (c) => `<span class="status-${c.State}" title="${c.State}"></span>`

/** @argument {Container} c */
const serviceTech = (c) =>
  c.Image.split(':')[0]
    .replace(/^sha256$/, '')
    .split('/')
    .pop() || ''

/** @argument {Container} c */
const serviceIconName = (c) => {
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

/** @argument {Container} c */
const serviceIcon = (c) => `https://cdn.simpleicons.org/${serviceIconName(c)}`

/** @argument {Container} c */
const filteredContainers = (c) =>
  !filters.search || serviceName(c).includes(filters.search) || c.Image.includes(filters.search)

/**
 * @argument {string} stra
 * @argument {string} strb
 */
const sortStrings = (stra, strb) => {
  const a = stra.toUpperCase()
  const b = strb.toUpperCase()

  return a < b ? -1 : a > b ? 1 : 0
}

const initToggleAll = () => {
  toggleAll.addEventListener('click', async () => {
    await setFetchAll()
    update()
  })
  toggleAll.checked = isFetchAll()
}

const filters = {
  search: '',
}

const initSearch = () => {
  const event = new Event('searching')

  search.addEventListener('searching', () => {
    console.debug('searching')
    filters.search = search.value
    update()
  })

  search.addEventListener('keydown', async (e) => {
    if (e.key === 'Backspace' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
      // search.value = ''
    } else {
      e.preventDefault()
    }
    search.dispatchEvent(event)
  })

  window.addEventListener('keydown', async (e) => {
    if (e.key === 'Backspace') {
      search.value = search.value.slice(0, -1)
    } else if (e.code === 'Space') {
      return
    } else if (e.key.length > 1) {
      return
    } else {
      search.value = `${search.value ?? ''}${e.key}`
    }
    search.dispatchEvent(event)
  })
}

initSearch()
initToggleAll()
update()

// setInterval(update, 1000)

import { fetchConfig, setupWS } from './api.js'
import icons from './icons.js'
import network from './network.js'
import { update as renderUpdate, updateConditions } from './render.js'
import search from './search.js'
import {
  serviceDescription,
  serviceEnabled,
  serviceIconName,
  serviceIsReplica,
  serviceLinks,
  serviceName,
  serviceNetworks,
  serviceReplicaNumber,
  serviceSortableName,
  serviceStatus,
  serviceTech,
} from './service.js'
import settings from './settings.js'
import state from './state.js'

/**
 * @argument {string[]} projects]
 * @argument {{ containers: Record<string, Dash.Container[]>; networks: Record<string, Dash.Network[]>}} data
 */
const appTemplate = (projects, data) =>
  projects
    // .sort(sortStrings)
    .map(
      (project) => `
      <div class="project">
        <h3>${project}</h3>
        ${data.containers[project]
          .sort((a, b) => sortStrings(serviceSortableName(a), serviceSortableName(b)))
          .filter(serviceEnabled)
          .filter(filteredContainers)
          .map((c) => {
            const link = serviceLinks(c)?.[0]
            const url = !serviceIsReplica(c) ? link?.url : ''
            const desc = serviceDescription(c)
            const dataNetwork = serviceNetworks(c)
              .map((network) => network.NetworkID)
              .join('-')

            return `
              <a class="card service ${serviceIsReplica(c) ? 'is-replica' : ''}" data-network="${dataNetwork}" ${
              url ? `href="${url}"` : ''
            } target="_blank">
                <span class="name ${serviceIsReplica(c) ? 'name-fullwidth is-small' : ''}">
                  ${serviceName(c)}
                  ${
                    serviceIsReplica(c)
                      ? `
                        <span class="image is-small">
                          (${serviceReplicaNumber(c)})
                        </span>
                      `
                      : ''
                  }
                </span>
                <span class="status">
                  ${serviceStatus(c)}
                </span>
                ${
                  serviceIsReplica(c)
                    ? ''
                    : `
                      <span class="icon">
                        ${icons.get(serviceIconName(c))}
                      </span>
                      <span class="image is-small">
                        ${serviceTech(c)}
                      </span>
                      ${
                        desc
                          ? `
                            <span class="desc is-small">
                              ${desc}
                            </span>
                            `
                          : ''
                      }
                      <span class="links is-small">
                        ${serviceLinks(c)
                          .map((link) => `<span class="link">${link.label}</span>`)
                          .join('&nbsp;')}
                      </span>
                    `
                }
                </span>
              </a>
            `
          })
          .join('')}
        ${data.networks[project]
          ?.sort((a, b) => sortStrings(a.Name, b.Name))
          // .filter(filteredContainers)
          .map(
            (n) => `
              <span class="card network" data-network="${n.Id}">
                <span class="name is-small">
                  ${n.Name.replace(new RegExp(`^${project}_`), '')} network
                  ·
                  ${n.Scope}
                  ${n.Driver}
                  ·
                  ${n.IPAM.Config.map((c) => c.Subnet).join(' ')}
                </span>
                <!--
                <span class="status is-small">
                  ${n.Id.substring(0, 8)}
                </span>
                -->
              </span>
            `
          )
          .join('')}
      </div>
    `
    )
    .join('')

/** @argument {Dash.Container} c */
const filteredContainers = (c) =>
  !state.search ||
  serviceName(c).includes(state.search) ||
  c.Image.includes(state.search) ||
  serviceDescription(c).includes(state.search)

/**
 * @argument {string} stra
 * @argument {string} strb
 */
const sortStrings = (stra, strb) => {
  const a = stra.toUpperCase()
  const b = strb.toUpperCase()

  return a < b ? -1 : a > b ? 1 : 0
}

await setupWS()

const config = await fetchConfig()
console.debug({ config })
const update = () => renderUpdate(appTemplate, config)
update()
search.setup(update)
settings.setup(update, config)
network.setup()
icons.setup().then(update)

setInterval(() => {
  if (updateConditions()) {
    update()
  }
}, config.UPDATE_INTERVAL ?? 1000)

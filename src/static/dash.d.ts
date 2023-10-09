export type Labels = Record<string, string>
export type Mount = {
  Type: string
  Source: string
  Destination: string
  Mode: string
  RW: boolean
  Propagation: string
}
export type NetworkParams = {
  Aliases?: any
  DriverOpts?: any
  EndpointID: string
  Gateway: string
  GlobalIPv6Address: string
  GlobalIPv6PrefixLen: number
  IPAMConfig?: any
  IPAddress: string
  IPPrefixLen: number
  IPv6Gateway: string
  Links?: any
  MacAddress: string
  NetworkID: string
}
export type NetworkSettings = {
  Networks: Record<string, NetworkParams>
}
export type Port = {
  IP: string
  PrivatePort: number
  PublicPort: number
  Type: string
}
export type Status = 'created' | 'running' | 'paused' | 'restarting' | 'removing' | 'exited' | 'dead'
export type Labelled = {
  Labels: Labels
}
export type Container = {
  Command: string
  Created: number
  HostConfig: {
    NetworkMode: string
  }
  Id: string
  Image: string
  ImageID: string
  Mounts: Mount[]
  Names: string[]
  NetworkSettings: NetworkSettings
  Ports: Port[]
  State: string
  Status: Status
} & Labelled
export type Network = {
  Name: string
  Id: string
  Created: string
  Scope: string
  Driver: string
  EnableIPv6: boolean
  IPAM: {
    Driver: string
    Options?: any
    Config: {
      Subnet: string
      Gateway: string
    }[]
  }
  Internal: boolean
  Attachable: boolean
  Ingress: boolean
  ConfigFrom: {
    Network: string
  }
  ConfigOnly: boolean
  Containers: {}
  Options: Record<string, string>
} & Labelled
export type ApiIndexResponse = Promise<{
  containers: Container[]
  networks: Network[]
}>
export type ApiContainersResponse = Promise<Container[]>
export type ApiNetworksResponse = Promise<Network[]>
export type ApiConfigResponse = Promise<{
  PROJECT?: string
  THEME?: string
  TITLE?: string
  UPDATE_INTERVAL?: number
}>
export type Filters = {
  search: string
}

export as namespace Dash

declare global {
  var meta_title: HTMLElement
  var render: HTMLElement
  var search: HTMLInputElement
  var title: HTMLElement
  var toggleAll: HTMLInputElement
}

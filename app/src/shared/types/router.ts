export enum RouteName {
  Dashboard = 'dashboard',
  Login = 'login',
  Setup = 'setup',
  Users = 'users',
  Nodes = 'nodes',
  Provision = 'provision',
  Logs = 'logs',
  Alerts = 'alerts',
  Settings = 'settings',
  Support = 'support',
  NotFound = '404',
  Account = 'account',
}

export interface AnthosRouteItem {
  name: RouteName
  icon: string
  label: string
}

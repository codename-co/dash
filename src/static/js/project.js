/** @argument {Dash.Labelled} e */
export const projectName = (e) => e.Labels?.['com.docker.compose.project'] || 'default'

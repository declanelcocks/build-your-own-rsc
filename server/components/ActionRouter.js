export default async function ActionRouter(action, req, res) {
  const actionModule = await import("../actions/" + action + ".js")
  const actionFunction = actionModule.default
  await actionFunction(req, res)
  return
}
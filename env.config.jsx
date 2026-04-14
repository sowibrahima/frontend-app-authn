async function setConfig() {
  // Authn does not consume the shared header notifications or AI widget slots.
  return {
    pluginSlots: {},
  };
}

export default setConfig;

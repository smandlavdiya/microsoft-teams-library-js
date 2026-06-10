export function initializeAsync() {
  return JevelinBridge.app.initialize();
}

export function getContextAsync() {
  return JevelinBridge.app.getContext();
}

export function setCurrentFrame(contentUrl, websiteUrl) {
  JevelinBridge.pages.setCurrentFrame(contentUrl, websiteUrl);
}

export function registerFullScreenHandler() {
  return JevelinBridge.pages.registerFullScreenHandler();
}

export function registerChangeConfigHandler() {
  JevelinBridge.pages.config.registerChangeConfigHandler();
}

export function getTabInstances(tabInstanceParameters) {
  return JevelinBridge.pages.tabs.getTabInstances(tabInstanceParameters);
}

export function getMruTabInstances(tabInstanceParameters) {
  return JevelinBridge.pages.tabs.getMruTabInstances(tabInstanceParameters);
}

export function shareDeepLink(deepLinkParameters) {
  JevelinBridge.pages.shareDeepLink(deepLinkParameters);
}

export function openLink(deepLink) {
  return JevelinBridge.app.openLink(deepLink);
}

export function navigateToTab(tabInstance) {
  return JevelinBridge.pages.tabs.navigateToTab(tabInstance);
}

// Settings module
export function registerOnSaveHandler(settings) {
  JevelinBridge.pages.config.registerOnSaveHandler((saveEvent) => {
    JevelinBridge.pages.config.setConfig(settings);
    saveEvent.notifySuccess();
  });

  JevelinBridge.pages.config.setValidityState(true);
}

export function isHostedInM365() {
  if (window.parent[0]) {
    return true;
  }
  return false;
}

export function notifySuccess() {
  JevelinBridge.app.notifySuccess();
}

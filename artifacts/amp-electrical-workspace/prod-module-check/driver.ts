import { getWorkspace } from "./workspace"
getWorkspace("amp-electrical").then((ws) => {
  console.log(JSON.stringify({
    previewUrl: ws?.website.previewUrl,
    previewImageUrl: ws?.website.previewImageUrl,
    versions: ws?.website.previewVersions ?? null,
    offer: ws?.offer,
  }, null, 1))
})

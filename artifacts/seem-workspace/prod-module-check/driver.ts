import { getWorkspace } from "./workspace"
getWorkspace("seem-electrical-ltd").then((ws) => {
  console.log(JSON.stringify({
    previewUrl: ws?.website.previewUrl,
    previewImageUrl: ws?.website.previewImageUrl,
    offer: ws?.offer,
  }, null, 1))
})

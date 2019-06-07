
export const getImageFilename = (spriteName, imageMap, availableImages)=> {
  // User selected image
  if (imageMap[spriteName] && imageMap[spriteName].type === 'image' ) {
    return imageMap[spriteName].imageName
  }

  // User selected ascii
  if (imageMap[spriteName] && imageMap[spriteName].type === 'ascii' ) {
    return null
  }
  
  // Fallback image for certain variable names (Player, Goomba etc)
  // A null in the imageMap means the user intentionally selected ascii, so
  // we check for undefined here specifically
  if (availableImages.includes(spriteName)) {
    return spriteName
  }

  // User has made no selected and no fallback image. So falls back to ascii.
  return null
}
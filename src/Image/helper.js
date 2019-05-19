
export const getImageFilename = (imageName, imageMap, availableImages)=> {
  // User selected image
  if (imageMap[imageName]) {
    return imageMap[imageName]
  }

  // Fallback image for certain variable names (Player, Goomba etc)
  // A null in the imageMap means the user intentionally selected ascii, so
  // we check for undefined here specifically
  if (imageMap[imageName] === undefined && availableImages.includes(imageName)) {
    return imageName
  }

  // Either no fallback image or user specifically selected ascii
  return null
}
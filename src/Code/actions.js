
export const updateCode = (code)=> ({
  type: 'UPDATE_CODE',
  code
})

export const updateSlateValue = (slateValue)=> ({
  type: 'UPDATE_SLATE_VALUE',
  slateValue
})

export const compile = (code)=> ({
  type: 'COMPILE',
  code
})

export const setActive = (active)=> ({
  type: 'SET_ACTIVE', active
})

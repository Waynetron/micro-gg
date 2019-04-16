
export const compile = (code)=> ({
  type: 'COMPILE',
  code
})

export const setActive = (active)=> ({
  type: 'SET_ACTIVE', active
})

import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import Prism from 'prismjs';
import {Editor} from 'slate-react';
import ImagePicker from '../ImagePicker/ImagePicker.js';

const grammar = {
  comment: /\/\/.*/,
  variableRandom: [
    {pattern: new RegExp('[^ ]{1} = (.+)or', 'i')}
  ],
  variable: [
    {pattern: new RegExp('[^ ]{1} = (.+)', 'i')}
  ]
}

const getContent = (token)=> {
  if (typeof token == 'string') {
    return token
  } else if (typeof token.content == 'string') {
    return token.content
  } else {
    return token.content.map(getContent).join('')
  }
}

const decorateNode = (node, editor, next)=> {
  const others = next() || []
  const texts = node.getTexts().toArray()
  const string = texts.map(t => t.text).join('\n')

  // first node will contain the text for every line
  // exit early for that one
  if (texts.length !== 1) {
    return others;
  }

  const tokens = Prism.tokenize(string, grammar)
  let decorations = []
  let startText = texts.shift()
  let endText = startText
  let startOffset = 0
  let endOffset = 0
  let start = 0

  for (const token of tokens) {
    startText = endText
    startOffset = endOffset

    const content = getContent(token)
    const newlines = content.split('\n').length - 1
    const length = content.length - newlines
    const end = start + length

    let available = startText.text.length - startOffset
    let remaining = length

    endOffset = startOffset + remaining

    while (available < remaining && texts.length > 0) {
      endText = texts.shift()
      remaining = length - available
      available = endText.text.length
      endOffset = remaining
    }

    if (typeof token == 'object') {
      decorations.push ({
        anchor: {
          key: startText.key,
          offset: startOffset,
        },
        focus: {
          key: endText.key,
          offset: endOffset,
        },
        mark: {
          type: token.type,
        }
      })
    }

    start = end
  }

  return [...others, ...decorations]
}

const renderMark = (props, editor, next) => {
  const {children, attributes, node} = props

  switch (props.mark.type) {
    case 'variable':
      const [key, right] = node.text.split('=').map((str)=> str.trim())

      return <span {...attributes}>
          {children}
          <ImagePicker letter={key} variableName={right}/>
        </span>

    case 'comment': 
      return <span className='comment' {...attributes}>{children}</span>
    default:
      return next()
  }
}

const Code = ({code, setCode, compile})=> {
  // manually trigger code change on first load
  useEffect(() => {
    compile(code);
  }, [])

  return (
    <Editor
      className={'code'}
      value={code}
      onChange={({value})=> {
        setCode(value)
      }}
      decorateNode={decorateNode}
      renderMark={renderMark}
      spellCheck={false}
    />
  )
};

const mapStateToProps = ({app, game})=> ({
  code: app.code,
  width: game.width, 
  height: game.height
})

const mapDispatchToProps = (dispatch)=> ({
  setCode: (code)=> {
    dispatch({
      type: 'UPDATE_CODE',
      code
    })
  },
  compile: (code)=> {
    dispatch({
      type: 'COMPILE',
      code
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Code);

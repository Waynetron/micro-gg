import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Prism from 'prismjs';
import {Editor} from 'slate-react';
import ImagePicker from '../ImagePicker/ImagePicker.js';

const makeGrammar = ()=> {
  return {
    comment: /\/\/.*/,
    variable: [
      {
        pattern: new RegExp('[^ ]{1} = ([A-Z]+) ', 'i')
      },
      // {
      //   pattern: new RegExp('or (.+)\\b', 'i'),
      // }
    ]
  }
}

const grammar = makeGrammar();

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

  if (texts.length !== 1) {
    return others;
  }

  const tokens = Prism.tokenize(string, grammar)
  const decorations = []
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

    if (typeof token != 'string') {
      const dec = {
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
        },
      }

      decorations.push(dec)
    }

    start = end
  }

  return [...others, ...decorations]
}

const renderMark = (props, editor, next) => {
  const { children, attributes, node } = props

  switch (props.mark.type) {
    case 'variable':
      const [left, right] = node.text.split('=').map((str)=> str.trim())
      const names = right.split(' or ')

      return <span {...attributes}>
          {children}
          <ImagePicker variableName={names[0]} />
        </span>

    case 'comment': 
      return (
        <span {...attributes} style={{ opacity: '0.33' }}>
          {children}
        </span>
      )
    case 'keyword':
      return (
        <span {...attributes} style={{ fontWeight: 'bold' }}>
          {children}
        </span>
      )
    default:
      return next()
  }
}

const Code = ({code, imageMap, onUpdateCode, compile})=> {
  // manually trigger code change on first load
  useEffect(() => {
    compile(code);
  }, [])

  return (
    <Editor
      className={'code'}
      value={code}
      onChange={onUpdateCode}
      decorateNode={decorateNode}
      renderMark={(props, editor, next)=>
        renderMark(props, editor, next, imageMap)
      }
      spellCheck={false}
    />
  )
};

const mapStateToProps = ({code, game})=> ({
  code: code.code,
  width: game.width, 
  height: game.height,
  imageMap: game.imageMap
})

const mapDispatchToProps = (dispatch)=> ({
  onUpdateCode: ({value})=> {
    dispatch({
      type: 'UPDATE_CODE',
      code: value
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

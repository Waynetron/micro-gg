import React, {Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Prism from 'prismjs';
import {Editor} from 'slate-react';
import Plain from 'slate-plain-serializer';
import ImagePicker from '../ImagePicker/ImagePicker.js';

const makeGrammar = ()=> {
  return {
    comment: /\/\/.*/,
    variable: {
      pattern: new RegExp('[^ ]{1} = ([A-Z]+)', 'i'),
    }
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

const renderMark = (props, editor, next, imageMap) => {
  const { children, attributes, node } = props

  switch (props.mark.type) {
    case 'variable':
      const [, right] = node.text.split('=').map((str)=> str.trim())
      const [firstName,] = right.split(' or ')

      return <span {...attributes}>
        {children}
        <ImagePicker variableName={firstName} />
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

const Code = ({level, legend, rules, imageMap,
  onUpdateRules, onUpdateLevel, onUpdateLegend, compile}
)=> {
  // manually trigger code change on first load
  useEffect(() => {
    compile(level, legend, rules);
  }, [])

  const [expanded, setExpanded] = useState({
    level: true,
    legend: true,
    rules: true
  })

  const toggleExpanded = (section)=> {
    setExpanded({...expanded, [section]: !expanded[section]})
  }

  return (
    <Fragment>
      <button className='primary collapsible' onClick={()=> toggleExpanded('level')}>
        Level
      </button>
      {expanded.level && <Editor
        className={'code level'}
        defaultValue={Plain.deserialize(level)}
        onChange={onUpdateLevel}
        decorateNode={decorateNode}
        renderMark={(props, editor, next)=> renderMark(props, editor, next, imageMap)}
      />}
      <button className='primary collapsible' onClick={()=> toggleExpanded('legend')}>
        Legend
      </button>
      {expanded.legend && <Editor
        className={'code legend'}
        defaultValue={Plain.deserialize(legend)}
        onChange={onUpdateLegend}
        decorateNode={decorateNode}
        renderMark={(props, editor, next)=> renderMark(props, editor, next, imageMap)}
      />}
      <button className='primary collapsible' onClick={()=> toggleExpanded('rules')}>
        Rules
      </button>
      {expanded.rules && <Editor
        className={'code rules'}
        defaultValue={Plain.deserialize(rules)}
        onChange={onUpdateRules}
        decorateNode={decorateNode}
        renderMark={(props, editor, next)=> renderMark(props, editor, next, imageMap)}
      />}
    </Fragment>
  )
};

const mapStateToProps = ({code, game})=> ({
  level: code.level,
  legend: code.legend,
  rules: code.rules,
  width: game.width, 
  height: game.height,
  imageMap: game.imageMap
})

const mapDispatchToProps = (dispatch)=> ({
  onUpdateRules: ({value})=> {
    dispatch({
      type: 'UPDATE_RULES',
      rules: Plain.serialize(value)
    })
  },
  onUpdateLevel: ({value})=> {
    dispatch({
      type: 'UPDATE_LEVEL',
      level: Plain.serialize(value)
    })
  },
  onUpdateLegend: ({value})=> {
    dispatch({
      type: 'UPDATE_LEGEND',
      legend: Plain.serialize(value)
    })
  },
  compile: (level, legend, rules)=> {
    dispatch({
      type: 'COMPILE',
      level, legend, rules
    });
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Code);

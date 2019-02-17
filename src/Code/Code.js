import React, {useEffect} from 'react';
import {updateCode, updateSlateValue, compile} from './actions.js';
import {connect} from 'react-redux';
import {Editor} from 'slate-react';
import Plain from 'slate-plain-serializer';

const renderNode = (props, editor, next)=> {
  const { attributes, children, node } = props

  console.log(node);

  switch (node.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    default:
      return next()
  }
}

const Code = ({code, slateValue, onChange, onCompile})=> {
  // manually trigger code change on first load
  useEffect(() => {
    // onChange(slateValue);
    onCompile(code);
  }, []);

  return <Editor
    className={'code'}
    value={slateValue}
    onChange={onChange}
    renderNode={renderNode}
  />
};

const mapStateToProps = ({code})=> ({
  code: code.code,
  slateValue: code.slateValue
})

const mapDispatchToProps = (dispatch)=> ({
  onChange: ({value})=> {
    dispatch(updateCode(Plain.serialize(value)));
    dispatch(updateSlateValue(value));
  },
  onCompile: (code)=> {
    dispatch(compile(code));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Code);

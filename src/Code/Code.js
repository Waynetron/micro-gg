import React from 'react';

const Code = ({code, onChange})=> (
  <div id="code">
    <textarea
      value={code}
      onChange={onChange}
    />
  </div>
);

export default Code;

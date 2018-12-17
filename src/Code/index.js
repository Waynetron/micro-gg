import React from 'react';

const Code = ({code, handleCodeChange})=> (
  <div id="code">
    <textarea
      value={code}
      onChange={handleCodeChange}
    />
  </div>
);

export default Code;

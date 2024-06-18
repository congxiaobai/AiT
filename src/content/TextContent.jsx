import React, { useState, useEffect } from 'react';

function Popup(props) {
  console.log({props})
  return (
    <div style={{
      position: 'fixed',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      padding: '10px',
      zIndex: 1000,
      color: 'black',
    }}>
      <p>{props.text}</p>

    </div>
  );
}

export default Popup;

import React, { useEffect, useState } from 'react';
import api from '../api';

function CafeList() {
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    api.get('/Cafes')
      .then(res => setCafes(res.data))
      .catch(err => console.log("في مشكلة بالربط: ", err));
  }, []);

  return (
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {cafes.map(cafe => (
        <div key={cafe.cafeID} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', minWidth: '200px' }}>
          <h2>{cafe.name}</h2>
          <p>{cafe.location}</p>
        </div>
      ))}
    </div>
  );
}
export default CafeList;
import React from 'react';

const AnglesTable = ({ angles }) => {
  return (
    <table border="1">
      <thead>
        <tr>
          <th>Note</th>
          <th>Tone</th>
          <th>Angle (degrees)</th>
        </tr>
      </thead>
      <tbody>
        {angles.map((angle, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{angle.note}</td>
            <td style={{ textAlign: 'right' }}>{angle.degrees}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AnglesTable;

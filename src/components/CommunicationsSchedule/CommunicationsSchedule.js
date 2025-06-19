import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../utils';

const CommunicationsSchedule = ({ communications }) => {
  if (!communications.length) {
    return (
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Triggered Communications Log</h2>
        <p className="text-gray-500">No communications have been triggered yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Triggered Communications Log</h2>
      <ul className="space-y-3">
        {communications.map((comm) => (
          <li key={comm.id} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="font-semibold text-blue-800">{comm.type}</div>
            <div className="text-sm text-blue-600">
              Sent on: {formatDate(comm.date)}
            </div>
            {comm.milestone && (
              <div className="text-sm text-blue-600">
                Related Milestone: {comm.milestone.name}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

CommunicationsSchedule.propTypes = {
  communications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    milestone: PropTypes.object,
  })).isRequired,
};

export default CommunicationsSchedule; 
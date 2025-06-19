import React from 'react';
import PropTypes from 'prop-types';
import { formatDateForInput } from '../utils';

const CurrentDateControl = ({ currentDate, onDateChange, onNextDay }) => {
  const formattedDate = new Date(currentDate).toLocaleDateString('en-CA'); // YYYY-MM-DD

  return (
    <div className="fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg z-10 flex items-center space-x-4">
      <h3 className="text-lg font-medium">Current Date:</h3>
      <input 
        type="date" 
        id="currentDate"
        className="p-2 border rounded"
        value={formatDateForInput(currentDate)}
        onChange={onDateChange}
      />
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={onNextDay}
      >
        Next Day &rarr;
      </button>
    </div>
  );
};

CurrentDateControl.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onDateChange: PropTypes.func.isRequired,
  onNextDay: PropTypes.func.isRequired,
};

export default CurrentDateControl; 
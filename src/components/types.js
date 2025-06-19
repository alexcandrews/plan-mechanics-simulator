import PropTypes from 'prop-types';

export const milestoneType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  optional: PropTypes.bool.isRequired,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
});

export const communicationType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  milestone: milestoneType,
  triggerEvent: PropTypes.oneOfType([
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
    milestoneType,
  ]),
  description: PropTypes.string.isRequired,
});

export const MilestoneShape = milestoneType; // Keep for backward compatibility if needed 
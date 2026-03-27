import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

const NotificationAlert = ({ notification }) => {
  if (!notification || notification.length === 0) {
    return null;
  }

  return (
    <Alert variant="primary">
      {notification[0].content}
    </Alert>
  );
};

NotificationAlert.propTypes = {
  notification: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string
    })
  )
};

NotificationAlert.defaultProps = {
  notification: null
};

export default NotificationAlert;
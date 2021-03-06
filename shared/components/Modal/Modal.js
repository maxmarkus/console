import React from 'react';
import LuigiClient from '@kyma-project/luigi-client';
import PropTypes from 'prop-types';
import './Modal.scss';
import { Modal as FdModal } from 'fundamental-react';
import { Spinner, Button, Tooltip } from '@kyma-project/react-components';

Modal.propTypes = {
  title: PropTypes.any,
  modalOpeningComponent: PropTypes.any.isRequired,
  onShow: PropTypes.func,
  actions: PropTypes.any,
  onHide: PropTypes.func,
  onConfirm: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.string,
  disabledConfirm: PropTypes.bool,
  waiting: PropTypes.bool,
  tooltipData: PropTypes.object,
  modalClassName: PropTypes.string,
};

Modal.defaultProps = {
  title: 'Modal',
  confirmText: 'Confirm',
  actions: null,
  type: 'default',
  disabledConfirm: false,
  waiting: false,
};

export function Modal({
  title,
  actions,
  modalOpeningComponent,
  onShow,
  onHide,
  onConfirm,
  confirmText,
  cancelText,
  type,
  disabledConfirm,
  waiting,
  tooltipData,
  children,
}) {
  const [show, setShow] = React.useState(false);
  function onOpen() {
    if (onShow) {
      onShow();
    }
    LuigiClient.uxManager().addBackdrop();
    setShow(true);
  }

  function onClose() {
    if (onHide) {
      onHide();
    }
    LuigiClient.uxManager().removeBackdrop();
    setShow(false);
  }

  function handleConfirmClicked() {
    if (onConfirm) {
      const result = onConfirm();
      // check if confirm is not explicitly cancelled
      if (result !== false) {
        onClose();
      }
    } else {
      onClose();
    }
  }

  const createActions = () => {
    const confirmMessage = waiting ? (
      <div style={{ width: '97px', height: '16px' }}>
        <Spinner />
      </div>
    ) : (
      confirmText
    );

    const confirmButton = (
      <Button
        type="emphasized"
        onClick={handleConfirmClicked}
        disabled={disabledConfirm}
        data-e2e-id="modal-confirmation-button"
      >
        {confirmMessage}
      </Button>
    );
    return (
      <>
        {cancelText && (
          <Button
            style={{ marginRight: '12px' }}
            option="light"
            onClick={onClose}
          >
            {cancelText}
          </Button>
        )}

        {tooltipData ? (
          <Tooltip
            {...tooltipData}
            minWidth={tooltipData.minWidth ? tooltipData.minWidth : '191px'}
          >
            {confirmButton}
          </Tooltip>
        ) : (
          confirmButton
        )}
      </>
    );
  };

  return (
    <>
      <div onClick={onOpen}>{modalOpeningComponent}</div>
      <FdModal
        className="custom-modal"
        type={type}
        title={title}
        show={show}
        onClose={onClose}
        actions={actions || createActions()}
      >
        {children}
      </FdModal>
    </>
  );
}

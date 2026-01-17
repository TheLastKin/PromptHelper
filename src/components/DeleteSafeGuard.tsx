import React from 'react'
import ButtonAction from './ButtonAction';

type DeleteSafeGuardProps = {
    show: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

const DeleteSafeGuard = ({ show, onConfirm, onCancel }: DeleteSafeGuardProps) => {

  return (
    <div className="safe-guard-modal" style={{ display: show ? 'flex' : 'none' }}>
      <div className="backdrop" onClick={onCancel}></div>
      <div className="modal-content sm-content">
        <h4>You are about to delete a large collection of items, are you sure?</h4>
        <div className="action-buttons">
          <ButtonAction className='confirm-button' onClick={onConfirm} label="Confirm" />
          <ButtonAction className='cancel-button' onClick={onCancel} label="Cancel" />
        </div>
      </div>
    </div>
  )
}

export default DeleteSafeGuard;
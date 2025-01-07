import React from 'react';
import { Modal, Button } from 'antd';

interface CustomModalProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onOk?: () => void;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({ title, visible, onClose, onOk, children }) => {
  return (
      <Modal
          title={title}
          visible={visible}
          onCancel={onClose}
          onOk={onOk}
          footer={[
            <Button key="back" onClick={onClose}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={onOk}>
              OK
            </Button>,
          ]}
      >
        {children}
      </Modal>
  );
};

export default CustomModal;

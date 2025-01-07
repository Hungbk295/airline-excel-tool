import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import '../../styles/index.scss'
const LoadingComponent: React.FC = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
      <div className="flex justify-center items-center h-[100vh]">
        <Spin indicator={antIcon} />
      </div>
  );
};

export default LoadingComponent;

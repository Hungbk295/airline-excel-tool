import { TableOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../constants";
import { ILayoutProps, MenuItem } from "../../models";
import {useQueryClient} from "@tanstack/react-query";
const { Content, Footer, Sider } = Layout;

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}


export default function DefaultLayout(props: ILayoutProps) {
  const { children } = props;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear the cache when the route changes
    queryClient.clear();
  }, [location.pathname, queryClient]);
  return (
    <Layout className="h-full overflow-hidden">
      <Layout className='h-full'>
        <Content>{children}</Content>
        {/*<Footer className="text-center mt-auto">*/}
        {/*  Ant Design ©2023 Created by Ant UED*/}
        {/*</Footer>*/}
      </Layout>
    </Layout>
  );
}

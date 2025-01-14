import { Layout } from "antd";
import { useEffect } from "react";
import { ILayoutProps } from "../../models";
import { useQueryClient } from "@tanstack/react-query";
const { Content } = Layout;

export default function DefaultLayout(props: ILayoutProps) {
  const { children } = props;
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear the cache when the route changes
    queryClient.clear();
  }, [location.pathname, queryClient]);
  return (
    <Layout className="h-full overflow-hidden">
      <Layout className="h-full">
        <Content>{children}</Content>
        {/*<Footer className="text-center mt-auto">*/}
        {/*  Ant Design ©2023 Created by Ant UED*/}
        {/*</Footer>*/}
      </Layout>
    </Layout>
  );
}

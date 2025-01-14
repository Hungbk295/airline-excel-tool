import { ReactElement, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { URL } from "../../constants";
import DefaultLayout from "../layouts/DefaultLayout";
import Home from "../pages/Test_Project";
const DEFAULT_LAYOUT = "default";

interface ItemType {
  key: string;
  components: ReactElement;
  layout: string;
  private: boolean;
}

const userItems: ItemType[] = [
  {
    key: URL.Home,
    components: <Home />,
    layout: DEFAULT_LAYOUT,
    private: false,
  },
];

const adminItems: ItemType[] = [
  {
    key: URL.Home,
    components: <Home />,
    layout: DEFAULT_LAYOUT,
    private: true,
  },
];

const sharedItems: ItemType[] = [
  {
    key: URL.Home,
    components: <Home />,
    layout: DEFAULT_LAYOUT,
    private: false,
  },
];

function getItems(isTargetAdmin: boolean) {
  const items = isTargetAdmin
    ? adminItems.concat(sharedItems)
    : userItems.concat(sharedItems);
  return items;
}

export default function Routers() {
  const items = getItems(true);
  return (
    <Routes>
      {items.map((item) => {
        let element = item.components;

        element = <Suspense fallback={null}>{element}</Suspense>;

        if (item.layout === DEFAULT_LAYOUT) {
          element = <DefaultLayout>{element}</DefaultLayout>;
        }

        return <Route key={item.key} path={item.key} element={element} />;
      })}
    </Routes>
  );
}

import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import React from "react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { EmpresaProvider } from "./context/EmpresaContext";
import { BranchProvider } from "./hooks/useBranch";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: DashboardPage,
});

const productsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products",
  component: React.lazy(() => import("./pages/ProductsPage")),
});

const inventoryRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/inventory",
  component: React.lazy(() => import("./pages/InventoryPage")),
});

const salesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/sales",
  validateSearch: (search: Record<string, unknown>) => ({
    documentId: search.documentId
      ? String(search.documentId)
      : (undefined as string | undefined),
  }),
  component: React.lazy(() => import("./pages/SalesPage")),
});

const salesNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/sales/new",
  component: React.lazy(() => import("./pages/SalesNewPage")),
});

const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/admin",
  component: React.lazy(() => import("./pages/AdminPage")),
});

const customersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customers",
  component: React.lazy(() => import("./pages/CustomersPage")),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    productsRoute,
    inventoryRoute,
    salesRoute,
    salesNewRoute,
    customersRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <InternetIdentityProvider>
      <QueryClientProvider client={queryClient}>
        <EmpresaProvider>
          <BranchProvider>
            <React.Suspense fallback={null}>
              <RouterProvider router={router} />
            </React.Suspense>
          </BranchProvider>
        </EmpresaProvider>
      </QueryClientProvider>
    </InternetIdentityProvider>
  );
}

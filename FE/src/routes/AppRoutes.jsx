import React, { Suspense } from "react";
import Layout from "@layouts/Layout";
import Login from "@pages/Login";
import NotFoundPage from "../pages/NotFoundPage";

import { routes_here } from "./routes";
import { Route, Routes } from "react-router-dom";

export default function AppRoutes() {
  const isAuthenticated = true;

  const renderRoute = (route, isAuthenticated) => {
    if (route.isPrivate || isAuthenticated) {
      return route.element;
    }
  };

  return (
    <Suspense fallback={<NotFoundPage />}>
      <React.Fragment>
        <Routes>
          {/* ================= All Routes ================ */}
          {routes_here.map((route, key) =>
            !isAuthenticated ? (
              <Route key={key} path="/login" element={<Login />} />
            ) : (
              <Route
                // index
                key={key}
                path={route.path}
                element={
                  <Layout>
                    <Suspense fallback={<NotFoundPage />}>
                      {renderRoute(route, isAuthenticated)}
                    </Suspense>
                  </Layout>
                }
              />
            )
          )}
        </Routes>
      </React.Fragment>
    </Suspense>
  );
}

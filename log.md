Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
deprecations.ts:9 ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
warnOnce @ deprecations.ts:9
deprecations.ts:9 ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.
warnOnce @ deprecations.ts:9
favicon.ico:1  Failed to load resource: the server responded with a status of 404 (Not Found)
2PadreDashboard.jsx:445 Uncaught ReferenceError: FiUser is not defined
    at PadreDashboard (PadreDashboard.jsx:445:48)
    at renderWithHooks (react-dom.development.js:15486:18)
    at mountIndeterminateComponent (react-dom.development.js:20103:13)
    at beginWork (react-dom.development.js:21626:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
react-dom.development.js:18704 The above error occurred in the <PadreDashboard> component:

    at PadreDashboard (http://localhost:5173/src/pages/PadreDashboard.jsx:867:48)
    at ProtectedRoute (http://localhost:5173/src/routes/ProtectedRoute.jsx:21:42)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=95d9f399:4131:5)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=95d9f399:4601:5)
    at AppRoutes (http://localhost:5173/src/routes/AppRoutes.jsx:43:27)
    at App
    at AuthProvider (http://localhost:5173/src/context/AuthContext.jsx:69:32)
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=95d9f399:4544:15)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=95d9f399:5290:5)
    at EnvironmentProvider (http://localhost:5173/node_modules/.vite/deps/chunk-46JMBFEX.js?v=33ccd0df:9767:11)
    at ColorModeProvider2 (http://localhost:5173/node_modules/.vite/deps/chunk-46JMBFEX.js?v=33ccd0df:9301:5)
    at ThemeProvider2 (http://localhost:5173/node_modules/.vite/deps/chunk-WZCEFXLN.js?v=33ccd0df:1584:22)
    at ThemeProvider2 (http://localhost:5173/node_modules/.vite/deps/chunk-46JMBFEX.js?v=33ccd0df:9695:11)
    at Provider (http://localhost:5173/node_modules/.vite/deps/chunk-46JMBFEX.js?v=33ccd0df:9794:5)
    at ChakraProvider2 (http://localhost:5173/node_modules/.vite/deps/chunk-46JMBFEX.js?v=33ccd0df:19929:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18704
react-dom.development.js:26962 Uncaught ReferenceError: FiUser is not defined
    at PadreDashboard (PadreDashboard.jsx:445:48)
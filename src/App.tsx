/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Fees from './pages/Fees';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="grades" element={<Grades />} />
          <Route path="fees" element={<Fees />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

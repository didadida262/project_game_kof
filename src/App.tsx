/*
 * @Description:
 * @Author: didadida262
 * @Date: 2024-07-25 01:16:22
 * @LastEditors: didadida262
 * @LastEditTime: 2025-01-16 20:38:27
 */
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

import KofComp from "./kof";

import "react-toastify/dist/ReactToastify.css";

function App() {
  useEffect(() => {
    // customToast.success("Mounted success!");
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <ToastContainer
        theme="dark"
        autoClose={3000}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        draggable={false}
        pauseOnHover={false}
        // className="toast-container"
        // toastClassName="dark-toast"
      />
      <KofComp />
    </div>
  );
}

export default App;

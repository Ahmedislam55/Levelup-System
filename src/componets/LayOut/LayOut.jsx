import React from "react";
import NavBar from "../NavBar/NavBar";
import { Outlet } from "react-router-dom";

export default function LayOut() {
  return (
    <>
      <NavBar />
      <div className="pt-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
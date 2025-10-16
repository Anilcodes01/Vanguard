"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/store";
import { fetchUser } from "@/app/store/features/auth/authSlice";
import { fetchUserProfile } from "@/app/store/features/profile/profileSlice";

import NavbarSignedIn from "./Navbar/NavbarSignedIn";
import NavbarSignedOut from "./Navbar/NavbarSignedOut";

export default function Navbar() {
  const dispatch: AppDispatch = useDispatch();
  const { user, status: authStatus } = useSelector(
    (state: RootState) => state.auth
  );
  const { status: profileStatus } = useSelector(
    (state: RootState) => state.profile
  );

  useEffect(() => {
    if (authStatus === "idle") {
      dispatch(fetchUser());
    }
    if (user && profileStatus === "idle") {
      dispatch(fetchUserProfile());
    }
  }, [authStatus, profileStatus, user, dispatch]);

  if (authStatus === "loading" || authStatus === "idle") {
    return <NavbarSignedOut />;
  }

  return user ? <NavbarSignedIn /> : <NavbarSignedOut />;
}

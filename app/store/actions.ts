
import { createAction } from "@reduxjs/toolkit";

export const problemSolved = createAction<{ xpEarned: number; starsEarned: number }>('app/problemSolved');
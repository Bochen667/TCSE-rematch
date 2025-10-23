"use client";
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");   //自動跳轉到login頁面
  return null;
}
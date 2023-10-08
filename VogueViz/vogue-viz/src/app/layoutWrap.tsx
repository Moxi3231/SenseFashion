"use client";
import LayoutContext from "@/components/LayoutContext";
import NavBar from "@/components/NavBar";
import NotificationBar from "@/components/NotificationBar";
import NotificationBarData from "@/components/NotificationBarData";
import { SessionProvider } from "next-auth/react";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getCsrfToken } from "next-auth/react"


export default function LayoutWrap(props: any) {
    const children = props.children;
    const nBarData = new NotificationBarData();

    return (
        <>
            <SessionProvider>
                <LayoutContext.Provider value={{ nbardata: nBarData }}>
                    <NavBar></NavBar>
                    <div className="container container-fluid container-lg p-3">
                        {children}
                    </div>

                    <NotificationBar></NotificationBar>
                </LayoutContext.Provider>
            </SessionProvider>
        </>
    )
}
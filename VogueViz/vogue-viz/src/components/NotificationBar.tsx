"use client";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import { useContext } from "react";
import LayoutContext from "./LayoutContext";
import NotificationBarData from "./NotificationBarData";
export default function NotificationBar() {
    const nBarDat: NotificationBarData = useContext(LayoutContext).nbardata!;
    return (<>
        <ToastContainer position="top-end" className="sticky my-lg-5 p-1 mx-2">
            <Toast delay={nBarDat.showTime} show={nBarDat.showFlag} autohide onClose={() => { nBarDat.setShowFlag(false); }}>
                <Toast.Header>
                    <img src="/favicon.ico" width={20} height={20} className="rounded me-2" alt="" />
                    <strong className="me-auto">Vogue Viz</strong>
                    <small>Just Now</small>
                </Toast.Header>
                <Toast.Body>{nBarDat.data}</Toast.Body>
            </Toast></ToastContainer></>)

}